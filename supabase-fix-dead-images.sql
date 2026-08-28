-- ============================================================================
-- REPLACE PHOTOGRAPHS THAT UNSPLASH HAS SINCE DELETED
-- ----------------------------------------------------------------------------
-- WHY THIS FILE EXISTS SEPARATELY FROM supabase-fix-images.sql
--   That file fixed photographs that were WRONG — a rattan chair standing in
--   for an executive chair. This one fixes photographs that are GONE. Nine
--   Unsplash ids in the seed files now answer 404, so the catalogue rendered
--   an empty box where the product should be. The two that were reported are
--   the ones where the dead file was the COVER, so the whole card came up
--   blank:
--
--     wooden-bed          Solid Oak Bed Frame
--     sella-dining-chair  Sella Dining Chair
--
--   The rest lost only their second (hover) photograph, which is why nobody
--   saw them: you have to hover a card to notice.
--
-- HOW THESE WERE CHECKED
--   Every id in the repository was requested and its HTTP status recorded —
--   that is what found the nine. The two replacements below were then
--   downloaded and LOOKED AT beside the product text, because a 200 only
--   proves a file exists, not that it shows a bed. The oak bed frame is a
--   low solid-timber platform with the slats visible; the dining chair is a
--   bent-beech Thonet-style back, which is what "bent timber" means.
--
-- WHY THE HOVER PHOTOGRAPHS ARE REMOVED RATHER THAN REPLACED
--   A second photograph is worth having only if it shows the same piece from
--   another angle. Dropping in whatever stock image happens to load would
--   re-create the exact bug supabase-fix-images.sql was written to fix, so
--   these products keep one correct photograph instead of gaining a wrong
--   second one. `images` is an array; the card falls back cleanly.
--
-- Safe to run more than once: array_replace and array_remove are no-ops when
-- the value is already gone. Touches only the `images` column.
-- ============================================================================

-- --------------------------------------------------------------- Dead covers
update products
   set images = array_replace(
         images,
         'https://images.unsplash.com/photo-1505693416388-ac5cc068fe85?w=1400&q=80',
         'https://images.unsplash.com/photo-1613940512699-fc9150817bb2?w=1400&q=80')
 where 'https://images.unsplash.com/photo-1505693416388-ac5cc068fe85?w=1400&q=80' = any(images);

update products
   set images = array_replace(
         images,
         'https://images.unsplash.com/photo-1598300042247-d888f8ab3a91?w=1400&q=80',
         'https://images.unsplash.com/photo-1614066537969-7ae2fae81ace?w=1400&q=80')
 where 'https://images.unsplash.com/photo-1598300042247-d888f8ab3a91?w=1400&q=80' = any(images);

-- ------------------------------------------------- Dead hover photographs
update products
   set images = array_remove(images, dead.url)
  from (values
    ('https://images.unsplash.com/photo-1449247709967-d4461a5a6103?w=1400&q=80'),
    ('https://images.unsplash.com/photo-1595526114035-0d45ad16cfbf?w=1400&q=80'),
    ('https://images.unsplash.com/photo-1616486338812-3dadae4b4aca?w=1400&q=80'),
    ('https://images.unsplash.com/photo-1617806118233-d8e1de247200?w=1400&q=80'),
    ('https://images.unsplash.com/photo-1618220252344-8ec99ac624b1?w=1400&q=80'),
    ('https://images.unsplash.com/photo-1567016432779-094069958aa5?w=1400&q=80'),
    ('https://images.unsplash.com/photo-1723804685588-b8a95b2044f3?w=1400&q=80')
  ) as dead(url)
 where dead.url = any(products.images);

-- ------------------------------------------------------------------- Check
-- Should return no rows. Any row here is a product left with no photograph.
select slug, images
  from products
 where images is null or cardinality(images) = 0;
