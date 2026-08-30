-- ============================================================================
-- BRANDS: THE PARTNER HOUSES, MOVED OUT OF THE SOURCE AND INTO THE DATABASE
-- ----------------------------------------------------------------------------
-- WHAT THIS REPLACES
--   The twenty-nine manufacturers were a hardcoded array in
--   src/data/company.ts. That is why two fields on every one of them have sat
--   empty since the page was built: `website` and `description`. Both are
--   facts only the office holds — which domain each house wants used, and the
--   supplier's own boilerplate — and neither could be supplied without a
--   developer editing TypeScript and shipping a build.
--
--   Moving them into a table is what lets the office fill those in itself.
--
-- WHAT A BRAND IS ALLOWED TO BE
--   `discipline` is constrained to the six the interface can label. The chip
--   row on /brands and the badge on each card read their text from the locale
--   key `b2b.brands.<discipline>`, so a seventh value typed straight into the
--   database would render a missing key rather than a label. Adding one is
--   therefore a THREE-part change and the constraint is what makes that
--   visible instead of silent:
--
--     1. the value here
--     2. `DISCIPLINES` in src/data/company.ts
--     3. `b2b.brands.<value>` in BOTH src/locales/en.json and ka.json
--
-- HOW PRODUCTS POINT AT THEM
--   `products.brand_id` is nullable — most of the catalogue predates this and
--   a piece whose manufacturer is not recorded is a normal state, not an
--   error. It is `on delete restrict`, so a brand that pieces still point at
--   cannot be deleted out from under them; the trigger below turns that into
--   a message the dashboard can translate rather than a raw FK violation.
--
-- WHO MAY DO WHAT — deliberately identical to `categories`, not to `products`
--   Staff (admin AND operator) may create, edit and delete brands. That
--   mirrors how the same people already manage the category tree, which is
--   the closest existing analogue: structural catalogue data with dependents
--   and a database guard behind it. Product DELETE stays admin-only because a
--   product carries a photograph and a history a brand row does not.
--
--   If the office would rather brands were admin-only, the change is the one
--   policy at the bottom of this file — swap is_staff() for is_admin() — and
--   nothing else in the app has to move.
--
-- Safe to run more than once.
-- ============================================================================

begin;

-- --------------------------------------------------------------- The table
create table if not exists public.brands (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  discipline     text not null,
  country        text,
  image          text,
  logo           text,
  website        text,
  description_ka text,
  description_en text,
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- Re-runnable: `create table if not exists` skips the column list entirely on
-- a database that already has the table, so each column is also added on its
-- own for the case where an older, narrower version of it exists.
alter table public.brands add column if not exists logo           text;
alter table public.brands add column if not exists website        text;
alter table public.brands add column if not exists description_ka text;
alter table public.brands add column if not exists description_en text;
alter table public.brands add column if not exists is_active      boolean not null default true;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'brands_discipline_check'
  ) then
    alter table public.brands add constraint brands_discipline_check
      check (discipline in
        ('office','hospitality','residential','lighting','outdoor','acoustics'));
  end if;
end $$;

-- The list is read in one order and filtered by one column, so those are the
-- two indexes. The active index is partial: every public read asks for active
-- rows only, and there is no reason to carry the hidden ones in it.
create index if not exists brands_sort_idx   on public.brands (sort_order, name);
create index if not exists brands_active_idx on public.brands (sort_order)
  where is_active;

-- ------------------------------------------------- The link from a product
alter table public.products
  add column if not exists brand_id uuid references public.brands(id) on delete restrict;

-- Indexed because it is a foreign key that the catalogue filters on, and an
-- unindexed FK also makes every brand delete scan the whole products table.
create index if not exists products_brand_idx on public.products (brand_id)
  where brand_id is not null;

-- --------------------------------------------------------------- The seed
-- The twenty-nine houses as they stood in src/data/company.ts, in the order
-- that file listed them, so /brands looks the same the moment it starts
-- reading from here. `website` and `description_*` are left NULL on purpose:
-- they were never known, and inventing them is exactly what the old comment
-- in company.ts refused to do. The office fills them in from the dashboard.
--
-- Conflict on slug does nothing, so re-running never overwrites an edit the
-- office has since made in the dashboard.
insert into public.brands (slug, name, discipline, country, image, sort_order)
values
  ('herman-miller', 'Herman Miller', 'office', 'US', 'https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?w=1200&q=80', 10),
  ('haworth', 'Haworth', 'office', 'US', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&q=80', 20),
  ('andreu-world', 'Andreu World', 'office', 'ES', 'https://images.unsplash.com/photo-1764810815228-b7f9432eec5c?w=1200&q=80', 30),
  ('frezza', 'Frezza', 'office', 'IT', 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1200&q=80', 40),
  ('dvo', 'DVO', 'office', 'IT', 'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=1200&q=80', 50),
  ('fursys', 'Fursys', 'office', 'KR', 'https://images.unsplash.com/photo-1631193816258-28b44b21e78b?w=1200&q=80', 60),
  ('fritz-hansen', 'Fritz Hansen', 'hospitality', 'DK', 'https://images.unsplash.com/photo-1617364852223-75f57e78dc96?w=1200&q=80', 70),
  ('artifort', 'Artifort', 'hospitality', 'NL', 'https://images.unsplash.com/photo-1648960456182-00643d5d20eb?w=1200&q=80', 80),
  ('la-cividina', 'La Cividina', 'hospitality', 'IT', 'https://images.unsplash.com/photo-1776362658611-2067c9ded1d1?w=1200&q=80', 90),
  ('sancal', 'Sancal', 'hospitality', 'ES', 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1200&q=80', 100),
  ('figueras', 'Figueras', 'hospitality', 'ES', 'https://images.unsplash.com/photo-1646215993365-125e6428e1dc?w=1200&q=80', 110),
  ('fredericia', 'Fredericia', 'residential', 'DK', 'https://images.unsplash.com/photo-1687262304525-02287047d4d6?w=1200&q=80', 120),
  ('muuto', 'Muuto', 'residential', 'DK', 'https://images.unsplash.com/photo-1742367539759-6e4fc2e39209?w=1200&q=80', 130),
  ('menu', 'Menu', 'residential', 'DK', 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=1200&q=80', 140),
  ('barcelona-design', 'Barcelona Design', 'residential', 'ES', 'https://images.unsplash.com/photo-1616137148650-4aa14651e02b?w=1200&q=80', 150),
  ('marset', 'Marset', 'lighting', 'ES', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&q=80', 160),
  ('vibia', 'Vibia', 'lighting', 'ES', 'https://images.unsplash.com/photo-1553797794-4c4d2c55dbfb?w=1200&q=80', 170),
  ('gubi', 'Gubi', 'lighting', 'DK', 'https://images.unsplash.com/photo-1592622515232-6e3e2a0d3d9a?w=1200&q=80', 180),
  ('tradition', '&Tradition', 'lighting', 'DK', 'https://images.unsplash.com/photo-1606170033648-5d55a3edf314?w=1200&q=80', 190),
  ('zumtobel', 'Zumtobel', 'lighting', 'AT', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80', 200),
  ('formalighting', 'Formalighting', 'lighting', 'IT', 'https://images.unsplash.com/photo-1581784878214-8d5596b98a01?w=1200&q=80', 210),
  ('lamp83', 'Lamp83', 'lighting', 'TR', 'https://images.unsplash.com/photo-1559924508-1461423083c5?w=1200&q=80', 220),
  ('pedrali', 'Pedrali', 'outdoor', 'IT', 'https://images.unsplash.com/photo-1762608675427-09ac2dbd1540?w=1200&q=80', 230),
  ('magis', 'Magis', 'outdoor', 'IT', 'https://images.unsplash.com/photo-1758445041789-1d27c2f21a88?w=1200&q=80', 240),
  ('enea', 'Enea', 'outdoor', 'ES', 'https://images.unsplash.com/photo-1765097732474-973a92d6fb4c?w=1200&q=80', 250),
  ('framery', 'Framery', 'acoustics', 'FI', 'https://images.unsplash.com/photo-1756480336914-c282fdc8372b?w=1200&q=80', 260),
  ('caimi-snowsound', 'Caimi Snowsound', 'acoustics', 'IT', 'https://images.unsplash.com/photo-1773127962331-299cf7663a0b?w=1200&q=80', 270),
  ('buzzispace', 'BuzziSpace', 'acoustics', 'BE', 'https://images.unsplash.com/photo-1676477605752-224a26e6ec71?w=1200&q=80', 280),
  ('cascando', 'Cascando', 'acoustics', 'NL', 'https://images.unsplash.com/photo-1758800601600-f691cd1ba66d?w=1200&q=80', 290)
on conflict (slug) do nothing;

-- ------------------------------------------------------- The delete guard
-- `on delete restrict` on products.brand_id already refuses this. What it
-- does not do is say anything a person can act on: the client sees a foreign
-- key violation naming a constraint. This fires first — a BEFORE DELETE
-- trigger runs ahead of the FK check — and raises a message the dashboard
-- matches on a prefix and renders in the operator's own language, exactly as
-- categories_block_nonempty_delete already does for the category tree.
create or replace function public.brands_block_used_delete()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
declare
  product_count integer;
begin
  select count(*) into product_count from products where brand_id = old.id;

  if product_count > 0 then
    raise exception 'BRAND_HAS_PRODUCTS: % is still on % product%. Move them first.',
      old.slug, product_count, case when product_count = 1 then '' else 's' end
      using errcode = 'foreign_key_violation';
  end if;

  return old;
end;
$$;

drop trigger if exists brands_block_used_delete on public.brands;
create trigger brands_block_used_delete
  before delete on public.brands
  for each row execute function public.brands_block_used_delete();

-- ----------------------------------------------------------------- Access
alter table public.brands enable row level security;

-- Read is public and unconditional: the brands page is a public page, and the
-- `is_active` filter is the application's business, not the database's. A
-- hidden brand is hidden by the query that asks for active rows, the same way
-- an inactive category is.
drop policy if exists "Public read brands" on public.brands;
create policy "Public read brands" on public.brands
  for select to anon, authenticated using (true);

-- `(select is_staff())` rather than a bare call: wrapping it makes Postgres
-- evaluate it ONCE per statement instead of once per row. On a table this
-- small it changes nothing measurable; it is written this way because every
-- other policy in this database is, and a policy that looks different is a
-- policy someone will later assume is different for a reason.
drop policy if exists "Staff can insert brands" on public.brands;
create policy "Staff can insert brands" on public.brands
  for insert to authenticated with check ((select public.is_staff()));

drop policy if exists "Staff can update brands" on public.brands;
create policy "Staff can update brands" on public.brands
  for update to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

-- THE ONE LINE TO CHANGE if brands should be admin-only: is_staff -> is_admin.
drop policy if exists "Staff can delete brands" on public.brands;
create policy "Staff can delete brands" on public.brands
  for delete to authenticated using ((select public.is_staff()));

commit;


-- ------------------------------------------------------------------ Checks
-- Twenty-nine houses, six disciplines, none orphaned. Should return one row
-- reading 29 / 6 / 0.
--   select count(*) as brands,
--          count(distinct discipline) as disciplines,
--          count(*) filter (where name is null or slug is null) as broken
--     from brands;
--
-- No product points at a brand that is not there. Should return no rows.
--   select p.slug from products p
--    left join brands b on b.id = p.brand_id
--    where p.brand_id is not null and b.id is null;
