-- ============================================================================
-- FIX MISMATCHED PRODUCT PHOTOGRAPHS
-- ----------------------------------------------------------------------------
-- Roughly half the seeded products carried a photograph of something they are
-- not: the bed frame showed two living rooms, the nightstand showed the
-- outside of a house, the bookcase showed a chair and a desk lamp, and the
-- height-adjustable desk showed a pendant lamp.
--
-- Every pairing below was checked by looking at the photograph beside the
-- product name, which is the check that was missed the first time round.
-- Safe to run more than once; it touches only the `images` column.
-- ============================================================================

update products as p set images = v.images
from (values
  ('modern-sofa', array['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80']),
  ('terra-leather-sofa', array['https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1400&q=80','https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1400&q=80']),
  ('lume-armchair', array['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1400&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80']),
  ('orbit-coffee-table', array['https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1400&q=80','https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80']),
  ('wooden-bed', array['https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1400&q=80','https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1400&q=80']),
  ('kura-wardrobe', array['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1400&q=80','https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1400&q=80']),
  ('mira-nightstand', array['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80','https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1400&q=80']),
  ('mtkvari-dining-table', array['https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80','https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80']),
  ('sella-dining-chair', array['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80','https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=80']),
  ('iveria-sideboard', array['https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=80']),
  ('arco-writing-desk', array['https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1400&q=80','https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1400&q=80']),
  ('studio-adjustable-desk', array['https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=1400&q=80','https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1400&q=80']),
  ('kvira-compact-desk', array['https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1400&q=80','https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1400&q=80']),
  ('volta-task-chair', array['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=1400&q=80','https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1400&q=80']),
  ('alta-executive-chair', array['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1400&q=80','https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1400&q=80']),
  ('kalo-drafting-stool', array['https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80']),
  ('regna-executive-desk', array['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&q=80','https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80']),
  ('forum-boardroom-table', array['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1400&q=80','https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80']),
  ('folio-bookcase', array['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1400&q=80','https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=1400&q=80'])
) as v(slug, images)
where p.slug = v.slug;

-- Confirm: every row should list 1 or 2 photographs.
-- select slug, array_length(images, 1) as photos from products order by slug;
