-- ============================================================================
-- RE-CUT THE CATALOGUE ALONG archtrade.ge's "INTERIOR" MENU
-- ----------------------------------------------------------------------------
-- The catalogue was split by ROOM — office, hospitality, residential, outdoor.
-- The company's own site splits the same stock by WHAT THE THING IS, under
-- `trading > interior`, and this migration adopts that cut so the two agree.
--
-- WHAT IS AND IS NOT INCLUDED
--   That menu reads: flooring, furniture, lighting, acoustics, accessories,
--   public seating. Two are deliberately absent here:
--
--     flooring     — this site is furniture-only. src/data/company.ts records
--                    that the flooring and building-envelope partners were cut
--                    on purpose, and there is no flooring product to put in it.
--     accessories  — there is not one accessory in the catalogue. An empty
--                    category is a dead link on the navigation, which is the
--                    same reason flooring is out.
--
--   Neither is a decision against them: add products and add the row, and the
--   catalogue picks the category up with no code change.
--
-- READ THIS BEFORE RUNNING — THE SHAPE IT LEAVES
--   Thirty products land as: furniture 18, lighting 5, acoustics 5, public
--   seating 2. "Furniture" absorbs the four old room categories, so more than
--   half the catalogue ends up behind one link. That is a faithful copy of the
--   menu, not necessarily the best way to browse thirty products, and it is
--   worth a look before this goes to the live site.
--
-- ORDER
--   sort_order follows the menu — furniture, lighting, acoustics, public
--   seating — rather than alphabetical or insertion order.
--
-- Safe to re-run. Wrapped in a transaction: it all lands or none of it does.
-- ============================================================================

begin;

-- ------------------------------------------------------------ 1. New cuts
-- Photographs are reused from the categories these replace, so every row
-- keeps a banner that was already checked against its subject.
insert into categories (slug, title_ka, title_en, group_key, image, sort_order)
values
  ('furniture', 'ავეჯი', 'Furniture', 'home',
   'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1600&q=80', 10),
  ('lighting', 'განათება', 'Lighting', 'home',
   'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1600&q=80', 20),
  ('acoustics', 'აკუსტიკა', 'Acoustics', 'home',
   'https://images.unsplash.com/photo-1756480734230-a7680051fc26?w=1600&q=80', 30),
  ('public-seating', 'საზოგადოებრივი დასაჯდომები', 'Public Seating', 'home',
   'https://images.unsplash.com/photo-1776361984994-089a9df800f6?w=1600&q=80', 40)
on conflict (slug) do update
  set title_ka   = excluded.title_ka,
      title_en   = excluded.title_en,
      image      = excluded.image,
      sort_order = excluded.sort_order;

-- --------------------------------------------------- 2. Move every product
-- Listed one by one rather than derived from the old category, so the mapping
-- is reviewable: a task chair and an auditorium bank are both "seating", and
-- only reading the list catches which is which.
update products as p
   set category_id = c.id
  from (values
    -- Seating, tables, desks, storage, shelving — indoor and out
    ('hm-aeron-task-chair',           'furniture'),
    ('haworth-fern-task-chair',       'furniture'),
    ('andreu-world-reverse-table',    'furniture'),
    ('frezza-forum-bench',            'furniture'),
    ('dvo-storage-wall',              'furniture'),
    ('fritz-hansen-series-7',         'furniture'),
    ('artifort-mare-lounge-chair',    'furniture'),
    ('sancal-tiptoe-armchair',        'furniture'),
    ('la-cividina-modular-sofa',      'furniture'),
    ('fredericia-spine-lounge-chair', 'furniture'),
    ('muuto-outline-sofa',            'furniture'),
    ('menu-passage-shelving',         'furniture'),
    ('barcelona-design-modular-sofa', 'furniture'),
    ('fredericia-post-console',       'furniture'),
    ('pedrali-nolita-chair',          'furniture'),
    ('magis-air-armchair',            'furniture'),
    ('enea-lottus-outdoor-table',     'furniture'),
    ('pedrali-reva-lounge',           'furniture'),

    -- Luminaires
    ('marset-discoco-pendant',        'lighting'),
    ('vibia-match-linear',            'lighting'),
    ('gubi-semi-pendant',             'lighting'),
    ('zumtobel-mirel-evolution',      'lighting'),
    ('formalighting-cardo-spot',      'lighting'),

    -- Pods, panels, baffles, screens
    ('framery-o-pod',                 'acoustics'),
    ('framery-q-flow-pod',            'acoustics'),
    ('caimi-snowsound-flat',          'acoustics'),
    ('buzzispace-buzziblox',          'acoustics'),
    ('cascando-pillow-screen',        'acoustics'),

    -- Specified per SEAT for a room full of strangers, not per room.
    -- Figueras builds auditoria; Enea's Altzo is a street/terrace bench.
    ('figueras-auditorium-seating',   'public-seating'),
    ('enea-terrace-bench',            'public-seating')
  ) as m(product_slug, category_slug)
  join categories as c on c.slug = m.category_slug
 where p.slug = m.product_slug;

-- ------------------------------------------------- 3. Retire the old cuts
-- Only ever deletes a category that nothing points at any more, so a product
-- missed by the mapping above keeps its old home rather than being orphaned.
delete from categories
 where slug in ('office-furniture', 'hospitality-furniture', 'acoustic-solutions',
                'residential-collection', 'architectural-lighting', 'outdoor-furniture')
   and not exists (select 1 from products p where p.category_id = categories.id);

commit;

-- ------------------------------------------------------------------ Check
-- Expect: furniture 18, lighting 5, acoustics 5, public-seating 2.
select c.slug, c.sort_order, count(p.id) as products
  from categories c
  left join products p on p.category_id = c.id
 group by c.slug, c.sort_order
 order by c.sort_order;

-- Expect no rows. Anything here is a product the mapping missed.
select slug from products where category_id is null;
