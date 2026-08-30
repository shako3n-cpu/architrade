-- ============================================================================
-- NINE UNSPLASH IDS THAT LOOKED DELETED AND WERE ACTUALLY MISTYPED
-- ----------------------------------------------------------------------------
-- THIS FILE PREVIOUSLY DID THE WRONG THING, ON A WRONG PREMISE.
--
--   It was written on the belief that nine photographs had been deleted from
--   Unsplash. It replaced two of them with different pictures and DELETED the
--   other seven from `products.images` outright, on the reasonable-sounding
--   argument that a wrong second photograph is worse than none.
--
--   The premise was false. Not one of the nine was deleted. Every one is a
--   SINGLE CHARACTER away from an id that loads.
--
-- HOW THAT WAS ESTABLISHED
--   For each id, every hex character was substituted at every position of its
--   hash — 180 candidates apiece — and each candidate requested. Every search
--   returned EXACTLY ONE valid variant. Then each recovered photograph was
--   LOOKED AT next to its product: all nine are interior or furniture shots
--   matching the piece they belong to. A coincidentally-valid Unsplash id
--   would be any subject in the world, so nine for nine is not chance.
--
--   The corruption is systematic rather than nine separate slips. Six of the
--   nine are a character changing TO `e`, five of those from `a`:
--
--     8ec99ac624b1 -> 8ec99ec624b1   iveria-sideboard        hover   a -> e
--     0d45ad16cfbf -> 0d45ed16cfbf   kura-wardrobe           hover   a -> e
--     b8a95b2044f3 -> b8e95b2044f3   lume-armchair           hover   a -> e
--     3dadae4b4aca -> 3dadae4b4ace   modern-sofa             hover   a -> e
--     094069958aa5 -> 094069958ea5   (not in the live table)  hover  a -> e
--     ac5cc068fe85 -> ac5ce068fe85   wooden-bed              COVER   c -> e
--     d4461a5a6103 -> d4461a6a6103   kvira-compact-desk      hover   5 -> 6
--     d888f8ab3a91 -> d088f8ab3a91   sella-dining-chair      COVER   8 -> 0
--     d8e1de247200 -> 18e1de247200   mtkvari-dining-table    hover   d -> 1
--
-- WHAT THIS FILE DOES NOW
--   Corrects each id in place. Nothing is deleted and nothing is substituted,
--   so every product keeps the photograph originally chosen for it.
--
--   The last two statements map the two SUBSTITUTE covers back as well. They
--   only matter to a database where the previous version of this file was
--   actually run; the live one was not, which is how the mistyped ids were
--   still there to be recovered.
--
-- Safe to run more than once: array_replace is a no-op when the value is not
-- present. Touches only the `images` column.
-- ============================================================================

begin;

-- ------------------------------------------------------------- The two covers
update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1505693416388-ac5cc068fe85?w=1400&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1598300042247-d888f8ab3a91?w=1400&q=80',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=80');

-- --------------------------------------------------- The seven hover pictures
update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1618220252344-8ec99ac624b1?w=1400&q=80',
  'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1595526114035-0d45ad16cfbf?w=1400&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1449247709967-d4461a5a6103?w=1400&q=80',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1723804685588-b8a95b2044f3?w=1400&q=80',
  'https://images.unsplash.com/photo-1723804685588-b8e95b2044f3?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4aca?w=1400&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1617806118233-d8e1de247200?w=1400&q=80',
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1567016432779-094069958aa5?w=1400&q=80',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=80');

-- ----------------------------------- Undo the substitutes, where they landed
-- Only affects a database on which the previous version of this file ran.
update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1613940512699-fc9150817bb2?w=1400&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80');

update products set images = array_replace(images,
  'https://images.unsplash.com/photo-1614066537969-7ae2fae81ace?w=1400&q=80',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=80');

commit;


-- ------------------------------------------------------------------- Checks
-- No product left without a photograph. Should return no rows.
--   select slug, images from products
--    where images is null or cardinality(images) = 0;
--
-- No product left without its second photograph. Should return no rows on a
-- database that never ran the previous version of this file.
--   select slug, cardinality(images) from products where cardinality(images) < 2;
--
-- None of the nine mistyped ids surviving anywhere. Should return no rows.
--   select slug from products where images::text ~
--     '8ec99ac624b1|0d45ad16cfbf|d4461a5a6103|b8a95b2044f3|3dadae4b4aca|d8e1de247200|ac5cc068fe85|d888f8ab3a91|094069958aa5';
