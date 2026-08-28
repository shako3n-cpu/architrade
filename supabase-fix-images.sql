-- ============================================================================
-- FIX MISMATCHED PRODUCT PHOTOGRAPHS
-- ----------------------------------------------------------------------------
-- SECOND PASS. The first pass fixed the worst of it and left a tail: the
-- executive chair showed a rattan lounge chair and then an Eames side chair,
-- the oak writing desk showed a white bistro table with plants, and the Folio
-- bookcase — the one that got reported — opened on a shallow wall niche and
-- closed on a loft restaurant. None of them was a bookcase.
--
-- HOW THESE WERE CHECKED, THIS TIME
--   Every photograph below was rendered in a contact sheet, captioned with the
--   product it is attached to, and looked at. That is the only check that
--   catches this class of bug; reading the file does not, because a URL is not
--   a picture. The tail above is what reading the file had already missed.
--
-- Safe to run more than once; it touches only the `images` column.
-- ============================================================================

update products as p set images = v.images
from (values
  -- ------------------------------------------------------------ Living room
  ('modern-sofa', array['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80','https://images.unsplash.com/photo-1616486338812-3dadae4b4aca?w=1400&q=80']),
  ('terra-leather-sofa', array['https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1400&q=80','https://images.unsplash.com/photo-1597425842320-de0c26b33327?w=1400&q=80']),
  ('lume-armchair', array['https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1400&q=80','https://images.unsplash.com/photo-1723804685588-b8a95b2044f3?w=1400&q=80']),
  ('orbit-coffee-table', array['https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1400&q=80','https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80']),

  -- ---------------------------------------------------------------- Bedroom
  ('wooden-bed', array['https://images.unsplash.com/photo-1505693416388-ac5cc068fe85?w=1400&q=80','https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1400&q=80']),
  ('kura-wardrobe', array['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1400&q=80','https://images.unsplash.com/photo-1595526114035-0d45ad16cfbf?w=1400&q=80']),
  ('mira-nightstand', array['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80','https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=1400&q=80']),

  -- ----------------------------------------------------------------- Dining
  ('mtkvari-dining-table', array['https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80','https://images.unsplash.com/photo-1617806118233-d8e1de247200?w=1400&q=80']),
  ('sella-dining-chair', array['https://images.unsplash.com/photo-1598300042247-d888f8ab3a91?w=1400&q=80','https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80']),
  ('iveria-sideboard', array['https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80','https://images.unsplash.com/photo-1618220252344-8ec99ac624b1?w=1400&q=80']),

  -- ----------------------------------------------------------------- Desks
  -- Was a bistro table with pot plants on the second frame.
  ('arco-writing-desk', array['https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1400&q=80','https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=1400&q=80']),
  ('studio-adjustable-desk', array['https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1400&q=80','https://images.unsplash.com/photo-1688578735427-994ecdea3ea4?w=1400&q=80']),
  ('kvira-compact-desk', array['https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=1400&q=80','https://images.unsplash.com/photo-1449247709967-d4461a5a6103?w=1400&q=80']),

  -- ------------------------------------------------------- Ergonomic chairs
  ('volta-task-chair', array['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=1400&q=80','https://images.unsplash.com/photo-1750306957820-f778b67c4e13?w=1400&q=80']),
  -- Was a rattan lounge chair, then a moulded side chair. Neither is executive.
  ('alta-executive-chair', array['https://images.unsplash.com/photo-1641794008048-d863bb4a23d3?w=1400&q=80','https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1400&q=80']),
  ('kalo-drafting-stool', array['https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80','https://images.unsplash.com/photo-1776548759644-5da0988a7874?w=1400&q=80']),

  -- -------------------------------------------------------- Executive suite
  ('regna-executive-desk', array['https://images.unsplash.com/photo-1682617875405-cf931122be0a?w=1400&q=80','https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1400&q=80']),
  ('forum-boardroom-table', array['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1400&q=80','https://images.unsplash.com/photo-1764810815228-b7f9432eec5c?w=1400&q=80']),
  -- THE REPORTED ONE. Now a wall of shelving, and then a filled bookcase.
  ('folio-bookcase', array['https://images.unsplash.com/photo-1708161885729-63faff807840?w=1400&q=80','https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?w=1400&q=80'])
) as v(slug, images)
where p.slug = v.slug;

-- Confirm: every row should list 2 photographs.
-- select slug, array_length(images, 1) as photos from products order by slug;
