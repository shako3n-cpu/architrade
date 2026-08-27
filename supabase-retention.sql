-- ============================================================================
-- ARCHTRADE — THE THIRTY DAY RETENTION POLICY
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL editor, AFTER supabase-rbac.sql.
-- It is safe to run twice; everything is guarded.
--
-- WHAT IT DOES
--   Archiving a piece already takes it off the public site and keeps it in the
--   dashboard. This file puts a clock on that: thirty days after a piece is
--   archived it is deleted for real, photographs included, and nobody has to
--   remember to do it.
--
--   1. `products` gains `deleted_at`. It is the moment the piece was archived.
--   2. A trigger keeps it in step with `is_archived`, so the two can never
--      disagree — archiving stamps it, restoring clears it.
--   3. `purge_expired_products()` removes everything past the thirty days.
--   4. pg_cron runs that once a night.
--
-- WHY A TRIGGER AND NOT THE APP
--   The dashboard is not the only way a row changes: there is the SQL editor,
--   the edge function, and whatever gets written next year. A timestamp the
--   app is trusted to set is a timestamp that is eventually missed, and a
--   missed one here means a piece that sits in the archive for ever or — far
--   worse — one that is purged on a clock nobody set. The database sets it.
--
-- WHY THIRTY DAYS IS A DEFAULT AND NOT A CONSTANT
--   `purge_expired_products(days)` takes the window as an argument. Thirty is
--   the default, so the cron job below reads plainly, and passing 0 is how you
--   test the thing without waiting a month.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. The column
-- ----------------------------------------------------------------------------
-- Nullable, and the null means something precise: this piece is live. It is
-- not a second copy of `is_archived` — it is the answer to "since when", which
-- is the only thing a retention window can be counted from.
alter table products
  add column if not exists deleted_at timestamptz;

comment on column products.deleted_at is
  'When the piece was archived. Null means live. Purged thirty days after this — see purge_expired_products().';

-- Anything archived before this file existed starts its thirty days now,
-- rather than being counted from a date the database never recorded. Erring
-- towards keeping things is the whole point of a retention window.
update products
  set deleted_at = now()
  where is_archived and deleted_at is null;

-- The purge asks one question — "which rows are past the window" — and this
-- index answers it without reading the live catalogue at all. Partial, because
-- the archive is expected to stay a small minority of the table.
create index if not exists products_deleted_at_idx
  on products (deleted_at)
  where deleted_at is not null;


-- ----------------------------------------------------------------------------
-- 2. Keeping the timestamp honest
-- ----------------------------------------------------------------------------
-- BEFORE, so the value is written as part of the same row change rather than
-- as a second update — no window in which a piece is archived with no date on
-- it, and no extra write for RLS or an index to think about.
create or replace function public.stamp_products_deleted_at()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
begin
  if new.is_archived then
    -- Only stamp a piece that has just been archived. An ordinary edit to a
    -- piece already in the archive must not restart its thirty days, or a
    -- manager tidying up titles would keep the whole archive alive for ever.
    if new.deleted_at is null then
      new.deleted_at := now();
    end if;
  else
    -- Restored, or never archived. Either way there is nothing to count from.
    new.deleted_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists products_stamp_deleted_at on products;
create trigger products_stamp_deleted_at
  before insert or update on products
  for each row execute function public.stamp_products_deleted_at();


-- ----------------------------------------------------------------------------
-- 3. Live indexes, matching the queries
-- ----------------------------------------------------------------------------
-- The public site now asks for `is_archived = false and deleted_at is null`.
-- The second half is implied by the first, thanks to the trigger, but it is
-- belt and braces against a row that somehow acquires one without the other —
-- and an index predicate that matches the query exactly is the one Postgres
-- can use without rechecking anything on the heap.
drop index if exists products_live_created_idx;
create index products_live_created_idx
  on products (created_at desc)
  where is_archived = false and deleted_at is null;

drop index if exists products_live_category_idx;
create index products_live_category_idx
  on products (category_id, created_at desc)
  where is_archived = false and deleted_at is null;

drop index if exists products_live_featured_idx;
create index products_live_featured_idx
  on products (created_at desc)
  where is_archived = false and deleted_at is null and featured = true;


-- ----------------------------------------------------------------------------
-- 4. The purge
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER because it deletes photographs out of storage.objects,
-- which no ordinary role may touch. It takes no row identifiers and offers no
-- way to name a victim: the only thing it can delete is a row whose own
-- timestamp says it is past the window. search_path is pinned, because a
-- definer function that resolves names loosely is an escalation risk.
--
-- A photograph is only removed if no SURVIVING product still points at it.
-- Object names carry a random suffix so a shared file should be impossible,
-- but "should be impossible" is not a good reason to delete somebody else's
-- photograph.
--
-- Images that are not ours — the seed catalogue points at Unsplash — parse to
-- an empty name and are skipped. There is nothing in our bucket to remove.
create or replace function public.purge_expired_products(retention_days integer default 30)
  returns table (purged_products integer, purged_files integer)
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  public_prefix constant text := '/storage/v1/object/public/product-images/';
  cutoff timestamptz := now() - make_interval(days => retention_days);
  doomed uuid[];
  files text[];
  rows_gone integer := 0;
  files_gone integer := 0;
begin
  if retention_days < 0 then
    raise exception 'retention_days cannot be negative';
  end if;

  select coalesce(array_agg(id), '{}')
    into doomed
    from public.products
   where deleted_at is not null
     and deleted_at < cutoff;

  if cardinality(doomed) = 0 then
    return query select 0, 0;
    return;
  end if;

  -- Every object name the doomed rows point at, inside our own bucket.
  -- split_part on the query string first: getPublicUrl does not add one, but a
  -- cache-busting `?t=` pasted in by hand would otherwise become part of the
  -- name and match nothing.
  select coalesce(array_agg(distinct object_name), '{}')
    into files
    from public.products p
    cross join lateral unnest(p.images) as image(url)
    cross join lateral (
      select split_part(split_part(image.url, '?', 1), public_prefix, 2)
    ) as parsed(object_name)
   where p.id = any(doomed)
     and parsed.object_name <> '';

  -- Drop anything a surviving product still shows.
  select coalesce(array_agg(name), '{}')
    into files
    from unnest(files) as candidate(name)
   where not exists (
      select 1
        from public.products p
        cross join lateral unnest(p.images) as image(url)
       where not (p.id = any(doomed))
         and split_part(split_part(image.url, '?', 1), public_prefix, 2) = candidate.name
   );

  if cardinality(files) > 0 then
    delete from storage.objects
     where bucket_id = 'product-images'
       and name = any(files);
    get diagnostics files_gone = row_count;
  end if;

  delete from public.products where id = any(doomed);
  get diagnostics rows_gone = row_count;

  return query select rows_gone, files_gone;
end;
$$;

-- Nobody calls this from a browser. The cron job runs as the database owner,
-- and leaving it ungranted means a signed-in visitor cannot invoke it even by
-- accident.
revoke all on function public.purge_expired_products(integer) from public;
revoke all on function public.purge_expired_products(integer) from anon, authenticated;


-- ----------------------------------------------------------------------------
-- 5. Running it every night
-- ----------------------------------------------------------------------------
-- 03:20 rather than 03:00: everybody's cron job runs on the hour, and there is
-- no reason for this one to join the queue.
do $ext$
begin
  create extension if not exists pg_cron;
exception when others then
  raise notice 'Could not enable pg_cron automatically. Turn it on under Database -> Extensions, then run this file again.';
end;
$ext$;

do $sched$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron is not enabled — the purge function exists but nothing is calling it yet.';
    return;
  end if;

  -- Unschedule first, so re-running this file replaces the job instead of
  -- failing on the duplicate name.
  perform cron.unschedule(jobid) from cron.job where jobname = 'archtrade-purge-products';

  perform cron.schedule(
    'archtrade-purge-products',
    '20 3 * * *',
    $job$select public.purge_expired_products();$job$
  );
end;
$sched$;


-- ============================================================================
-- AFTERWARDS
-- ============================================================================
--
-- CHECK THE JOB IS THERE:
--
--     select jobname, schedule, active from cron.job;
--
-- SEE WHAT IS IN THE ARCHIVE AND HOW LONG IT HAS LEFT:
--
--     select slug, deleted_at,
--            30 - extract(day from now() - deleted_at)::int as days_left
--     from products where deleted_at is not null order by deleted_at;
--
-- TEST IT WITHOUT WAITING A MONTH — archive one throwaway piece in the
-- dashboard, then purge everything archived at all:
--
--     select * from purge_expired_products(0);
--
-- It answers with the number of rows and the number of photographs removed.
-- If the row count is right but the file count is 0 where you expected files,
-- the function's owner cannot see storage.objects; run it as `postgres`.
--
-- CHANGE THE WINDOW — edit the schedule to pass a different number:
--
--     select cron.unschedule('archtrade-purge-products');
--     select cron.schedule('archtrade-purge-products', '20 3 * * *',
--                          $$select public.purge_expired_products(60);$$);
--
-- ONE HONEST CAVEAT ABOUT THE PHOTOGRAPHS
--   Deleting the row from storage.objects is what makes a file disappear: it
--   stops being served, stops being listed, and stops being counted. The blob
--   behind it in S3 is not guaranteed to be reclaimed by a SQL delete, because
--   Supabase's storage service — not the database — owns that half.
--
--   For most projects that is fine; the file is gone as far as anything can
--   tell. If you want the storage API to do it properly, deploy the optional
--   function and call that instead:
--
--     supabase functions deploy purge-products
--
--   See supabase/functions/purge-products/index.ts. It does exactly what the
--   SQL above does, in the same order, but removes the photographs through the
--   storage API. Run it by hand, or from a scheduled job, whichever suits.
-- ============================================================================
