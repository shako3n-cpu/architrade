-- ============================================================================
-- ARCHTRADE — ROLES AND ARCHIVING
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL editor, AFTER supabase-admin-setup.sql.
-- It is safe to run twice; everything is guarded.
--
-- WHAT CHANGES
--   1. `admins` gains a `role` column: 'admin' or 'operator'.
--      Everyone already on the list becomes an 'admin', which is correct —
--      they are the people who had full rights before this file existed.
--   2. `products` gains `is_archived`. Archived pieces disappear from the
--      public site but stay in the dashboard.
--   3. Every write policy is rewritten around the split:
--
--        operator   create, edit and ARCHIVE products and categories,
--                   upload photographs
--        admin      all of that, plus DELETE, plus restoring an archived
--                   piece, plus managing who is on this list
--
--   4. A trigger that refuses to remove or demote the last remaining admin,
--      because an empty admin list cannot be repaired from the dashboard.
--
-- WHY A ROLE COLUMN AND NOT auth.users METADATA
--   app_metadata would work, and is where Supabase's own examples put a role.
--   It is rejected here for one reason: reading it inside a policy means
--   reading the JWT, so a role change does not take effect until the user's
--   token is refreshed — up to an hour of an ex-admin keeping admin rights.
--   A column is read fresh on every statement, so a demotion is immediate.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Roles
-- ----------------------------------------------------------------------------
-- The table is still called `admins` — renaming it would mean rewriting every
-- policy and every line of the app at once, for a word. Read it as "staff".
alter table admins
  add column if not exists role text not null default 'admin';

-- Added separately so re-running this file cannot fail on an existing one.
alter table admins drop constraint if exists admins_role_check;
alter table admins add constraint admins_role_check
  check (role in ('admin', 'operator'));

comment on column admins.role is
  'admin = full rights including delete and user management. operator = create, edit and archive only.';

-- Every policy below filters on this, and RLS runs it on every statement.
create index if not exists admins_role_idx on admins (role);


-- ----------------------------------------------------------------------------
-- 2. Archiving
-- ----------------------------------------------------------------------------
-- NOT NULL with a default, so every existing row becomes plainly visible
-- rather than ambiguous. A nullable flag would mean three states where the
-- product has two.
alter table products
  add column if not exists is_archived boolean not null default false;

comment on column products.is_archived is
  'Soft delete. Archived pieces are hidden from the public site and kept in the dashboard. Only an admin can restore or truly delete one.';

-- Partial indexes, not plain ones. Every public read carries
-- `where is_archived = false`, and an index holding only those rows is
-- smaller, is cheaper to keep up to date, and never has to look at the
-- archive — which is expected to stay a small minority of the table.
create index if not exists products_live_created_idx
  on products (created_at desc)
  where is_archived = false;

create index if not exists products_live_category_idx
  on products (category_id, created_at desc)
  where is_archived = false;

-- The home page asks for featured pieces, which is a third filtered read.
create index if not exists products_live_featured_idx
  on products (created_at desc)
  where is_archived = false and featured = true;


-- ----------------------------------------------------------------------------
-- 3. Who is what
-- ----------------------------------------------------------------------------
-- Both are SECURITY DEFINER so they can see `admins` regardless of that
-- table's own policy — without it the policies below would recurse through a
-- table the caller cannot fully read. search_path is pinned, because a definer
-- function that resolves names loosely is a privilege-escalation risk. Both
-- check auth.uid() internally and neither takes an argument, so neither can be
-- asked a question about anybody other than the caller.

-- On the staff list at all, whatever the role.
create or replace function public.is_staff()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- On the list AND an administrator.
create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;


-- ----------------------------------------------------------------------------
-- 4. Product policies
-- ----------------------------------------------------------------------------
-- The public "read" policy is untouched: the catalogue must stay readable by
-- anonymous visitors, and hiding archived pieces is done by the site's queries
-- rather than by RLS. That is deliberate — the dashboard signs in as the same
-- `authenticated` role and has to be able to see the archive.
--
-- Every call to a helper is wrapped in `(select ...)`. Unwrapped, Postgres
-- treats it as a per-row filter and calls it once per row; wrapped, it is
-- evaluated once per statement.

drop policy if exists "Admins can insert products" on products;
drop policy if exists "Staff can insert products" on products;
create policy "Staff can insert products"
  on products for insert to authenticated
  with check ((select public.is_staff()));

-- Operators may edit and archive a LIVE piece. They may not touch an archived
-- one at all, and that is what makes restoring admin-only: `using` tests the
-- row as it stands today, so a row with is_archived = true is simply not
-- visible to an operator's UPDATE.
drop policy if exists "Admins can update products" on products;
drop policy if exists "Staff can update products" on products;
create policy "Staff can update products"
  on products for update to authenticated
  using (
    (select public.is_admin())
    or ((select public.is_staff()) and is_archived = false)
  )
  with check ((select public.is_staff()));

-- Hard delete is the one action an operator never gets.
drop policy if exists "Admins can delete products" on products;
create policy "Admins can delete products"
  on products for delete to authenticated
  using ((select public.is_admin()));


-- ----------------------------------------------------------------------------
-- 5. Category policies
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can insert categories" on categories;
drop policy if exists "Staff can insert categories" on categories;
create policy "Staff can insert categories"
  on categories for insert to authenticated
  with check ((select public.is_staff()));

drop policy if exists "Admins can update categories" on categories;
drop policy if exists "Staff can update categories" on categories;
create policy "Staff can update categories"
  on categories for update to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

-- Still NO delete policy for categories, for anybody, admins included.
-- `products.category_id` is `on delete set null`, so removing a category would
-- quietly orphan every piece inside it. Delete one in the SQL editor, after
-- moving its products somewhere else.


-- ----------------------------------------------------------------------------
-- 6. The staff list itself
-- ----------------------------------------------------------------------------
-- Anyone on the list may read their own row — that is how the dashboard knows
-- which role it is drawing for. Only an admin may read everybody's.
drop policy if exists "Admins can read their own row" on admins;
drop policy if exists "Staff can read the list" on admins;
create policy "Staff can read the list"
  on admins for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );

-- Adding, changing and removing staff is admin-only. Creating the underlying
-- auth account is not possible from the browser at all — that needs the
-- service_role key, which must never ship in client JavaScript. It is what
-- supabase/functions/admin-users exists for.
drop policy if exists "Admins can add staff" on admins;
create policy "Admins can add staff"
  on admins for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can change staff" on admins;
create policy "Admins can change staff"
  on admins for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can remove staff" on admins;
create policy "Admins can remove staff"
  on admins for delete to authenticated
  using ((select public.is_admin()));


-- ----------------------------------------------------------------------------
-- 7. Never leave the project with no administrator
-- ----------------------------------------------------------------------------
-- An admin who demotes or deletes the last admin locks everyone out of user
-- management permanently, and the only repair is the SQL editor. The database
-- is the right place to refuse it, because every route in — the dashboard, the
-- edge function, a hand-written query — passes through here.
create or replace function public.prevent_last_admin_removal()
  returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  remaining integer;
begin
  -- An admin staying an admin cannot empty the list.
  if tg_op = 'UPDATE' and old.role = 'admin' and new.role = 'admin' then
    return new;
  end if;

  -- Neither can anything happening to an operator.
  if old.role is distinct from 'admin' then
    return case tg_op when 'DELETE' then old else new end;
  end if;

  select count(*) into remaining
  from public.admins
  where role = 'admin' and user_id <> old.user_id;

  if remaining = 0 then
    raise exception 'Cannot remove the last administrator.'
      using errcode = 'check_violation';
  end if;

  return case tg_op when 'DELETE' then old else new end;
end;
$$;

drop trigger if exists admins_keep_one_admin on admins;
create trigger admins_keep_one_admin
  before update or delete on admins
  for each row execute function public.prevent_last_admin_removal();


-- ----------------------------------------------------------------------------
-- 8. Storage
-- ----------------------------------------------------------------------------
-- Operators upload photographs; that is most of the job. Deleting a file is
-- the destructive half, so it stays with admins, matching products exactly.
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Staff can upload product images" on storage.objects;
create policy "Staff can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_staff()));

drop policy if exists "Admins can replace product images" on storage.objects;
drop policy if exists "Staff can replace product images" on storage.objects;
create policy "Staff can replace product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_staff()))
  with check (bucket_id = 'product-images' and (select public.is_staff()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));


-- ============================================================================
-- AFTERWARDS
-- ============================================================================
--
-- CHECK IT WORKED — this should list everyone with their role:
--
--     select email, role from admins order by role, email;
--
-- MAKE SOMEONE AN OPERATOR — either from /admin/users in the dashboard, or:
--
--     update admins set role = 'operator' where email = 'someone@archtrade.ge';
--
-- CREATING A NEW ACCOUNT needs the edge function deployed, because making an
-- auth user requires the service_role key and that key must never reach a
-- browser. From the project root, with the Supabase CLI installed:
--
--     supabase login
--     supabase link --project-ref <your-project-ref>
--     supabase functions deploy admin-users
--
-- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected into deployed
-- functions automatically — do NOT add them as secrets by hand, and do not
-- put either one in .env.
--
-- Until it is deployed /admin/users still shows the staff list and can change
-- roles and remove people; only "create account" is unavailable, and the
-- screen says so. New accounts can always be made by hand:
-- Dashboard -> Authentication -> Users -> Add user (tick "Auto Confirm User"),
-- then add them from /admin/users.
-- ============================================================================
