-- ============================================================================
-- ARCHTRADE — ADMIN SETUP
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL editor (Dashboard -> SQL Editor -> New
-- query -> paste -> Run). It is safe to run twice; everything is guarded.
--
-- The admin dashboard at /admin CANNOT SAVE ANYTHING until this has been run.
-- Reading the catalogue already works without it — that is why the public site
-- is fine today. Writing does not, because the tables have row level security
-- switched on and, at the moment, only a read policy. Under RLS, an action
-- with no policy is refused: there is no implicit permission.
--
-- WHAT THIS ADDS
--   1. a `price` column on products
--   2. an `admins` table — the list of people allowed to change the catalogue
--   3. insert / update / delete policies gated on that list
--   4. a `product-images` storage bucket, public to read, admins to write
--
-- AFTERWARDS there are two manual steps, both in the Supabase dashboard, and
-- they are written out at the bottom of this file. Read them — the dashboard
-- will not work until they are done.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Price
-- ----------------------------------------------------------------------------
-- Nullable on purpose. The public site shows "Price on request" and has no
-- price anywhere in its design, so most rows will leave this empty; it exists
-- so the office can record a number against a piece for their own reference.
-- Nothing on the public site reads it.
alter table products add column if not exists price numeric(12, 2);

comment on column products.price is
  'Internal reference price. Not displayed on the public site.';


-- ----------------------------------------------------------------------------
-- 2. Who is an administrator
-- ----------------------------------------------------------------------------
-- This table is the whole security model, so it is worth being clear about why
-- it exists rather than simply trusting any logged-in user.
--
-- Signing up for this Supabase project is currently OPEN — anybody who finds
-- the URL can create an account. If the policies below said `to authenticated`
-- and nothing more, a stranger could register and then rewrite the catalogue.
-- Membership of this table, not the mere fact of being logged in, is what
-- grants the right to change anything.
create table if not exists admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- Copied in for convenience so the table is readable at a glance in the
  -- dashboard. auth.users is the authority on the real address.
  email      text,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- An admin may confirm their own membership; nobody can read the whole list,
-- and nobody can write to it from the browser. Add people in the SQL editor.
drop policy if exists "Admins can read their own row" on admins;
create policy "Admins can read their own row"
  on admins for select to authenticated
  using (auth.uid() = user_id);


-- Returns true when the caller is on the list above.
--
-- SECURITY DEFINER so it runs as the owner and can see `admins` regardless of
-- that table's own policy — without it, the policies below would recurse
-- through a table the caller cannot fully read. search_path is pinned because
-- a definer function that resolves names loosely is a privilege-escalation
-- risk.
create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- ----------------------------------------------------------------------------
-- 3. Write policies
-- ----------------------------------------------------------------------------
-- The existing "Public read access" policies are left exactly as they are —
-- the catalogue must stay readable by anonymous visitors.
--
-- `with check` governs the row being written; `using` governs which existing
-- rows may be touched. Update needs both, or an admin could edit a row into a
-- state they would not have been allowed to create.

drop policy if exists "Admins can insert products" on products;
create policy "Admins can insert products"
  on products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update products" on products;
create policy "Admins can update products"
  on products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on products;
create policy "Admins can delete products"
  on products for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert categories" on categories;
create policy "Admins can insert categories"
  on categories for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update categories" on categories;
create policy "Admins can update categories"
  on categories for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Deliberately NO delete policy for categories.
--
-- `products.category_id` is declared `on delete set null`, so removing a
-- category would quietly orphan every piece inside it — they would vanish from
-- the category pages with nothing on screen to explain why. Renaming is safe
-- and is what the dashboard offers. Delete a category in the SQL editor, after
-- moving its products somewhere else.


-- ----------------------------------------------------------------------------
-- 4. Storage for product photographs
-- ----------------------------------------------------------------------------
-- `public = true` means anyone with the URL can view a file, which is required:
-- these photographs appear on a public catalogue. It does NOT mean anyone can
-- upload — that is governed by the policies underneath.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can replace product images" on storage.objects;
create policy "Admins can replace product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());


-- ============================================================================
-- TWO MANUAL STEPS — the dashboard will not work until both are done
-- ============================================================================
--
-- STEP 1 — Create the content manager's account.
--   Dashboard -> Authentication -> Users -> "Add user" -> "Create new user".
--   Enter their email and a password, and TICK "Auto Confirm User".
--   Without that tick they must click a confirmation email before the password
--   will work, and this project has no mail sender configured.
--
-- STEP 2 — Put that account on the admin list.
--   Back in the SQL editor, with their address in place of the one below:
--
--     insert into admins (user_id, email)
--     select id, email from auth.users where email = 'manager@archtrade.ge'
--     on conflict (user_id) do nothing;
--
--   Check it worked — this must return one row:
--
--     select * from admins;
--
--
-- STRONGLY RECOMMENDED — close public signups.
--   Dashboard -> Authentication -> Sign In / Providers -> Email
--   -> turn OFF "Allow new users to sign up".
--
--   Right now anyone can create an account on this project. They still could
--   not change the catalogue, because of the `admins` gate above — but there
--   is no reason to let strangers hold accounts at all, and it removes a whole
--   category of risk. Accounts you need can still be made by hand in step 1.
-- ============================================================================
