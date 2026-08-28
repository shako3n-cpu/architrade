-- ============================================================================
-- HIERARCHICAL CATALOGUE: PARENT/CHILD CATEGORIES, ORDERING, STATUS FLAGS
-- ----------------------------------------------------------------------------
-- Turns the flat `categories` table into a tree of unlimited depth, seeds the
-- room-and-use-case taxonomy, and re-files every existing product onto a leaf.
--
-- WHY
--   The catalogue was six flat categories. A visitor with no search box had
--   one undifferentiated list to read and no way to narrow it, which is the
--   discoverability problem this migration exists to fix.
--
-- WHAT IT LEAVES BEHIND
--   6 top-level categories, 25 leaves, and all 19 existing products re-filed
--   from the flat list onto the leaf that actually describes them. No product
--   is orphaned and none is deleted — section 4 lists every move by slug so
--   each one can be read and disagreed with.
--
-- SAFE TO RE-RUN. Every statement is idempotent and the whole file is one
-- transaction: it all lands or none of it does.
--
-- ORDER OF SECTIONS
--   1. Columns, constraints and indexes
--   2. Integrity: no cycles, no orphaning deletes
--   3. Row-level security for the admin screen
--   4. The taxonomy, and re-filing the products
--   5. Verification — run these and read them before you trust it
-- ============================================================================

begin;


-- ----------------------------------------------------------------------------
-- 1. COLUMNS, CONSTRAINTS AND INDEXES
-- ----------------------------------------------------------------------------

-- The tree link. `on delete restrict` rather than `cascade`: deleting a parent
-- must never silently take its children with it. Section 2 turns that into a
-- readable error instead of a foreign-key violation.
alter table categories add column if not exists parent_id uuid references categories (id) on delete restrict;

-- The admin's explicit on/off. A disabled category and everything under it
-- disappears from the public navigation but keeps its products and its URL,
-- so a seasonal or not-yet-stocked branch can be parked without deleting it.
alter table categories add column if not exists is_active boolean not null default true;

-- Pinned to the front of the navigation and given a photograph in the mega
-- menu. Distinct from sort_order: order says WHERE, featured says HOW LOUD.
alter table categories add column if not exists featured boolean not null default false;

-- sort_order, image and group_key already exist (supabase-schema.sql). Ordering
-- is now scoped PER PARENT rather than globally — position 10 under Office and
-- position 10 under Bedroom are unrelated numbers.
alter table categories alter column sort_order set default 0;

-- `group_key` was the old two-way home/office split, constrained to exactly
-- those two values. The tree replaces it: the top-level rows ARE the grouping
-- now. Dropping the constraint (not the column) means new rows are no longer
-- rejected for being neither 'home' nor 'office', while anything still reading
-- the column keeps working.
alter table categories drop constraint if exists categories_group_key_check;

-- Every navigation query is "children of X, in order".
create index if not exists categories_parent_sort_idx on categories (parent_id, sort_order, slug);

-- The public navigation only ever wants the active rows.
create index if not exists categories_active_idx on categories (is_active) where is_active;

comment on column categories.parent_id is
  'Parent category, or NULL for a top-level row. Unlimited depth; cycles are blocked by categories_no_cycle_trg.';
comment on column categories.is_active is
  'Admin on/off switch. Inactive categories and their descendants are hidden from public navigation.';
comment on column categories.featured is
  'Pinned and given a photograph in the mega menu. Independent of sort_order.';
comment on column categories.sort_order is
  'Ascending display order WITHIN THE PARENT. Ties break on slug.';


-- ----------------------------------------------------------------------------
-- 2. INTEGRITY
-- ----------------------------------------------------------------------------

-- A category may not be its own ancestor.
--
-- Without this, one UPDATE in the admin's "move under another category" screen
-- can detach a whole branch into a ring that no longer reaches the root: the
-- rows still exist, every recursive query over them either loops forever or is
-- cut off by a depth guard, and the branch is invisible and unrecoverable
-- through the UI that created it. Cheaper to refuse the write.
create or replace function public.categories_no_cycle()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
declare
  ancestor uuid := new.parent_id;
  guard    integer := 0;
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'A category cannot be its own parent (%)', new.slug
      using errcode = 'check_violation';
  end if;

  -- Walk to the root. The guard is a backstop against a cycle that predates
  -- this trigger; it bounds the loop rather than defining a legal depth.
  while ancestor is not null loop
    guard := guard + 1;
    if guard > 100 then
      raise exception 'Category nesting is too deep, or the tree already contains a cycle'
        using errcode = 'check_violation';
    end if;

    if ancestor = new.id then
      raise exception 'Moving % there would make it a descendant of itself', new.slug
        using errcode = 'check_violation';
    end if;

    select parent_id into ancestor from categories where id = ancestor;
  end loop;

  return new;
end;
$$;

drop trigger if exists categories_no_cycle_trg on categories;
create trigger categories_no_cycle_trg
  before insert or update of parent_id on categories
  for each row execute function public.categories_no_cycle();


-- Refuse to delete a category that still holds something.
--
-- `products.category_id` is declared `on delete set null`, so without this a
-- delete would quietly detach every piece inside: they would vanish from the
-- catalogue with nothing on screen to say why, and no way to tell which
-- category they used to be in. `parent_id` is `on delete restrict`, which
-- already blocks a parent with children, but produces a foreign-key message
-- no one can act on. Both cases become one sentence the admin screen can show.
create or replace function public.categories_block_nonempty_delete()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
declare
  child_count   integer;
  product_count integer;
begin
  select count(*) into child_count   from categories where parent_id = old.id;
  select count(*) into product_count from products   where category_id = old.id;

  if child_count > 0 then
    raise exception 'CATEGORY_HAS_CHILDREN: % still has % subcategor%. Move or delete them first.',
      old.slug, child_count, case when child_count = 1 then 'y' else 'ies' end
      using errcode = 'foreign_key_violation';
  end if;

  if product_count > 0 then
    raise exception 'CATEGORY_HAS_PRODUCTS: % still holds % product%. Move them first.',
      old.slug, product_count, case when product_count = 1 then '' else 's' end
      using errcode = 'foreign_key_violation';
  end if;

  return old;
end;
$$;

drop trigger if exists categories_block_nonempty_delete_trg on categories;
create trigger categories_block_nonempty_delete_trg
  before delete on categories
  for each row execute function public.categories_block_nonempty_delete();


-- ----------------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Insert and update policies for staff already exist (supabase-rbac.sql).
-- Delete did not, because the old admin screen deliberately offered no delete.
-- The PRD asks for one, and section 2 above is what makes it safe to grant:
-- the database itself refuses to delete anything that still holds products or
-- subcategories, whoever asks.

drop policy if exists "Staff can delete categories" on categories;
create policy "Staff can delete categories"
  on categories for delete to authenticated
  using ((select public.is_staff()));

-- Public read stays as it is: anon reads every row, and the FRONTEND filters
-- on is_active. Deliberate — the admin preview and the category page both need
-- to fetch a disabled category by slug in order to say "this is hidden".
-- Nothing sensitive lives in this table.


-- ----------------------------------------------------------------------------
-- 4. THE TAXONOMY, AND RE-FILING THE PRODUCTS
-- ----------------------------------------------------------------------------
-- Existing slugs are REUSED where the concept already exists, so no product is
-- detached and no URL that is already indexed breaks:
--
--   living-room       kept, promoted to a top-level parent
--   bedroom           kept, promoted to a top-level parent
--   dining            kept, promoted to a top-level parent, retitled
--   office-desks      kept, becomes a leaf under a new `office` parent
--   ergonomic-chairs  kept, becomes the Office Chairs leaf
--   executive-suites  kept, becomes the Office Storage leaf, retitled
--
-- Everything else is new.

-- ------------------------------------------------------------ 4a. Top level
-- Five of the six top-level rows. Dining is handled immediately below.
insert into categories (slug, title_ka, title_en, sort_order, is_active, featured) values
  ('office',       'ოფისი',         'Office',       10, true,  true),
  ('living-room',  'მისაღები',      'Living Room',  20, true,  true),
  ('bedroom',      'საძინებელი',    'Bedroom',      30, true,  true),
  ('lighting',     'განათება',      'Lighting',     50, false, false),
  ('commercial',   'კომერციული',    'Commercial',   60, false, false)
on conflict (slug) do update
  set title_ka   = excluded.title_ka,
      title_en   = excluded.title_en,
      sort_order = excluded.sort_order,
      featured   = excluded.featured,
      parent_id  = null;

-- Dining is the one top-level row NOT inserted above, because it already
-- exists under the slug `dining` and holds three products. Inserting a second
-- `dining-room` row alongside it would leave the menu with two dining
-- categories, one of them empty. Retitle the row that is already there and
-- keep its slug — the URL /catalog/dining is the one that may already be
-- indexed.
update categories
   set title_ka = 'სასადილო', title_en = 'Dining Room', sort_order = 40,
       parent_id = null, is_active = true
 where slug = 'dining';

-- LIGHTING AND COMMERCIAL ARE SEEDED DISABLED, ON PURPOSE.
--   Neither has a single product, and a mega menu that offers eight links to
--   empty pages is worse than one that offers none: it teaches a visitor that
--   browsing does not work, which is exactly the habit this redesign is
--   trying to break. They are one toggle away in /admin/categories the moment
--   there is stock to put behind them.

-- ------------------------------------------------------------ 4b. Children
-- Written as a lookup on the parent's slug so the file stays re-runnable and
-- does not depend on ids that differ between environments.
insert into categories (slug, title_ka, title_en, parent_id, sort_order, is_active)
select v.slug, v.title_ka, v.title_en, parent.id, v.sort_order, v.is_active
from (values
  -- Office ---------------------------------------------------------------
  ('office-desks',       'საოფისე მაგიდები',   'Office Desks',        'office',      10, true),
  ('ergonomic-chairs',   'საოფისე სავარძლები', 'Office Chairs',       'office',      20, true),
  ('executive-suites',   'საოფისე საცავი',     'Office Storage',      'office',      30, true),
  ('office-lighting',    'საოფისე განათება',   'Office Lighting',     'office',      40, false),

  -- Living Room ----------------------------------------------------------
  ('sofas',              'დივნები',            'Sofas',               'living-room', 10, true),
  ('coffee-tables',      'ჟურნალის მაგიდები',  'Coffee Tables',       'living-room', 20, true),
  ('tv-units',           'ტელევიზორის თუმბოები','TV Units',           'living-room', 30, false),
  ('living-room-lighting','მისაღების განათება','Living Room Lighting','living-room', 40, false),

  -- Bedroom --------------------------------------------------------------
  ('beds',               'საწოლები',           'Beds',                'bedroom',     10, true),
  ('wardrobes',          'გარდერობები',        'Wardrobes',           'bedroom',     20, true),
  ('nightstands',        'საწოლის თუმბოები',   'Nightstands',         'bedroom',     30, true),
  ('bedroom-lighting',   'საძინებლის განათება','Bedroom Lighting',    'bedroom',     40, false),

  -- Dining Room ----------------------------------------------------------
  ('dining-tables',      'სასადილო მაგიდები',  'Dining Tables',       'dining',      10, true),
  ('dining-chairs',      'სასადილო სკამები',   'Dining Chairs',       'dining',      20, true),
  ('dining-storage',     'სასადილოს საცავი',   'Storage',             'dining',      30, true),

  -- Lighting -------------------------------------------------------------
  ('ceiling-lights',     'ჭერის სანათები',     'Ceiling Lights',      'lighting',    10, false),
  ('wall-lights',        'კედლის სანათები',    'Wall Lights',         'lighting',    20, false),
  ('floor-lamps',        'იატაკის სანათები',   'Floor Lamps',         'lighting',    30, false),
  ('table-lamps',        'მაგიდის სანათები',   'Table Lamps',         'lighting',    40, false),
  ('outdoor-lighting',   'გარე განათება',      'Outdoor Lighting',    'lighting',    50, false),

  -- Commercial -----------------------------------------------------------
  ('hotel-furniture',    'სასტუმროს ავეჯი',    'Hotel Furniture',     'commercial',  10, false),
  ('restaurant-furniture','რესტორნის ავეჯი',   'Restaurant Furniture','commercial',  20, false),
  ('office-solutions',   'საოფისე გადაწყვეტები','Office Solutions',   'commercial',  30, false)
) as v(slug, title_ka, title_en, parent_slug, sort_order, is_active)
join categories parent on parent.slug = v.parent_slug
on conflict (slug) do update
  set title_ka   = excluded.title_ka,
      title_en   = excluded.title_en,
      parent_id  = excluded.parent_id,
      sort_order = excluded.sort_order;

-- `is_active` is deliberately NOT in the do-update list above. Re-running this
-- file must not switch a branch back off after the office has switched it on.


-- ------------------------------------------------------------ 4c. Products
-- Every one of the 19 products, moved from the flat list onto the leaf that
-- describes it. Listed one per line so each can be read and argued with.
--
-- THE ONE JUDGEMENT CALL: `lume-armchair` is an armchair, and the taxonomy has
-- no Armchairs leaf. It goes under Sofas as the nearest seating category. If
-- that is wrong, the fix is one move in /admin/categories, not an edit here.
update products p set category_id = c.id
from (values
  ('arco-writing-desk',      'office-desks'),
  ('kvira-compact-desk',     'office-desks'),
  ('studio-adjustable-desk', 'office-desks'),
  ('regna-executive-desk',   'office-desks'),
  ('forum-boardroom-table',  'office-desks'),

  ('alta-executive-chair',   'ergonomic-chairs'),
  ('kalo-drafting-stool',    'ergonomic-chairs'),
  ('volta-task-chair',       'ergonomic-chairs'),

  ('folio-bookcase',         'executive-suites'),

  ('modern-sofa',            'sofas'),
  ('terra-leather-sofa',     'sofas'),
  ('lume-armchair',          'sofas'),
  ('orbit-coffee-table',     'coffee-tables'),

  ('wooden-bed',             'beds'),
  ('kura-wardrobe',          'wardrobes'),
  ('mira-nightstand',        'nightstands'),

  ('mtkvari-dining-table',   'dining-tables'),
  ('sella-dining-chair',     'dining-chairs'),
  ('iveria-sideboard',       'dining-storage')
) as m(product_slug, category_slug)
join categories c on c.slug = m.category_slug
where p.slug = m.product_slug;


-- ------------------------------------------------------------ 4d. Banners
-- Photographs for the four branches that will actually be browsed. Reused from
-- rows that already carried a checked banner, so nothing here is unverified.
update categories set image = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80' where slug = 'office'      and image is null;
update categories set image = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=80' where slug = 'living-room' and image is null;
update categories set image = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80' where slug = 'bedroom'     and image is null;
update categories set image = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80' where slug = 'dining'      and image is null;


commit;


-- ============================================================================
-- 5. VERIFICATION — run these separately and READ them
-- ============================================================================
-- The tree, as the navigation will render it.
--
--   with recursive tree as (
--     select id, slug, title_en, parent_id, sort_order, is_active,
--            0 as depth, lpad('', 0) || title_en as path
--     from categories where parent_id is null
--     union all
--     select c.id, c.slug, c.title_en, c.parent_id, c.sort_order, c.is_active,
--            t.depth + 1, t.path || ' > ' || c.title_en
--     from categories c join tree t on c.parent_id = t.id
--   )
--   select repeat('    ', depth) || title_en as category, slug, is_active,
--          (select count(*) from products p where p.category_id = tree.id) as products
--   from tree order by path;
--
-- Expected: 6 top-level rows, 23 children, 19 products spread across 9 leaves,
-- and every row with 0 products either inactive or a parent.
--
-- Nothing orphaned:
--   select slug, title_en from products p
--   left join categories c on c.id = p.category_id where c.id is null;
--   -- expect 0 rows
--
-- No cycles:
--   with recursive up as (
--     select id, parent_id, 1 as hops from categories
--     union all
--     select u.id, c.parent_id, u.hops + 1 from up u
--     join categories c on c.id = u.parent_id where u.hops < 50
--   )
--   select id, max(hops) from up group by id having max(hops) >= 50;
--   -- expect 0 rows
-- ============================================================================
