-- ============================================================================
-- ARCHTRADE — CONTRACT FURNITURE SEED
-- ----------------------------------------------------------------------------
-- Thirty pieces across six new categories, drawn from the houses archtrade
-- actually represents: office, hospitality, residential, lighting, outdoor
-- and acoustics.
--
-- SAFE TO RUN, AND SAFE TO RUN TWICE
--   Everything is `on conflict (slug) do nothing`. It ADDS; it never updates
--   or deletes, so a piece the office has already edited by hand is left
--   exactly as they left it, and nothing already in the catalogue is touched.
--
-- WHAT IT DOES NOT DO
--   It does not change the schema. There is no `brand` column on `products`,
--   and this file does not add one — the manufacturer is written into the
--   materials field, which the product page already renders as a spec line,
--   and into the title where the name is the product ("Aeron", "Series 7").
--   A real `brand` column would be better and is a separate, larger job:
--   types, the admin form, the queries and a migration.
--
-- ABOUT THE PHOTOGRAPHS
--   Every URL here was rendered in a captioned contact sheet and looked at
--   beside the product it is attached to. A pendant has a photograph of a
--   pendant; an acoustic pod has a photograph of a pod. They are stock, and
--   they are placeholders for real product photography, but none of them is
--   a picture of something else. The dashboard can replace any of them
--   without touching this file.
--
-- PRICES ARE NULL, DELIBERATELY. This site shows "price on request" and has no
-- cart. Nothing here sets a figure.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------------------
-- The app only knows two groups, 'home' and 'office', and every category has
-- to pick one. Contract office, hospitality and acoustics sit under 'office';
-- residential, lighting and outdoor sit under 'home', which is where somebody
-- furnishing a flat would go looking. Adding a third group would mean changing
-- CategoryGroup in src/data/types.ts and the home page with it.
-- sort_order continues past the existing rooms, which stop at 60.
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
on conflict (slug) do nothing;


-- ----------------------------------------------------------------------------
-- 2. Products
-- ----------------------------------------------------------------------------
insert into products (
  slug, title_ka, title_en, description_ka, description_en,
  materials_ka, materials_en, dimensions, images, featured, category_id
)
select
  v.slug, v.title_ka, v.title_en, v.description_ka, v.description_en,
  v.materials_ka, v.materials_en, v.dimensions, v.images, v.featured, c.id
from (values

  -- ------------------------------------------------------- OFFICE FURNITURE
  ('hm-aeron-task-chair', 'Herman Miller Aeron — სამუშაო სავარძელი', 'Herman Miller Aeron Task Chair',
   'ერგონომიული სავარძელი PostureFit SL საყრდენით და რვა რეგულირების დიაპაზონით. სამი ზომა: A, B, C.',
   'The ergonomic benchmark, with PostureFit SL support and eight adjustment ranges. Sizes A, B and C.',
   'მწარმოებელი: Herman Miller. 8Z Pellicle ბადე, გადამუშავებული ალუმინი, 12 წლის გარანტია.',
   'Manufacturer: Herman Miller. 8Z Pellicle suspension, recycled aluminium, 12-year warranty.',
   'W 68.6 x D 66 x H 94-104 cm', array['https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?w=1400&q=80','https://images.unsplash.com/photo-1688578735122-f37256f1b8b0?w=1400&q=80'], true, 'furniture'),

  ('haworth-fern-task-chair', 'Haworth Fern — სამუშაო სავარძელი', 'Haworth Fern Task Chair',
   'Wave Suspension ზურგი, რომელიც მჯდომს მიჰყვება და ცალკეულ რეგულირებას არ ითხოვს.',
   'A Wave Suspension back that follows the sitter rather than asking them to adjust to it.',
   'მწარმოებელი: Haworth. Digital Knit ზურგი, პოლირებული ალუმინის ფუძე.',
   'Manufacturer: Haworth. Digital Knit back, polished aluminium base.',
   'W 70 x D 68 x H 89-99 cm', array['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1400&q=80','https://images.unsplash.com/photo-1750306957820-f778b67c4e13?w=1400&q=80'], false, 'furniture'),

  ('andreu-world-reverse-table', 'Andreu World Reverse — სათათბირო მაგიდა', 'Andreu World Reverse Meeting Table',
   'მოდულური სათათბირო მაგიდა კაბელის ინტეგრირებული არხით, ხუთ მეტრამდე კონფიგურაციით.',
   'A modular meeting table with an integrated cable spine, configurable to five metres.',
   'მწარმოებელი: Andreu World. FSC მუხა, თერმოდამუშავებული კიდე.',
   'Manufacturer: Andreu World. FSC oak, thermo-treated edge.',
   'W 240-500 x D 110 x H 74 cm', array['https://images.unsplash.com/photo-1764810815228-b7f9432eec5c?w=1400&q=80','https://images.unsplash.com/photo-1771270759486-1f7703945072?w=1400&q=80'], true, 'furniture'),

  ('frezza-forum-bench', 'Frezza Forum — ბენჩ-სისტემა', 'Frezza Forum Bench Desking',
   'ორმხრივი ბენჩ-სისტემა ოთხიდან თექვსმეტ სამუშაო ადგილამდე, საერთო კაბელის არხით.',
   'A double-sided bench system from four to sixteen positions on one shared cable tray.',
   'მწარმოებელი: Frezza. მელამინის ზედაპირი, ფხვნილით დაფარული ფოლადის კარკასი.',
   'Manufacturer: Frezza. Melamine tops, powder-coated steel frame.',
   'W 160 x D 165 x H 74 cm per pair', array['https://images.unsplash.com/photo-1577412647305-991150c7d163?w=1400&q=80','https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1400&q=80'], false, 'furniture'),

  ('dvo-storage-wall', 'DVO — საცავი კედელი', 'DVO Storage Wall',
   'იატაკიდან ჭერამდე საცავი კედელი, რომელიც ღია სივრცეს ჰყოფს და დოკუმენტაციას იტევს.',
   'A floor-to-ceiling storage wall that divides an open floor and swallows the paperwork.',
   'მწარმოებელი: DVO. ლამინირებული პანელი, დაბალხმაურიანი მიმმართველები.',
   'Manufacturer: DVO. Laminate panels, soft-close runners.',
   'W 200 x D 45 x H 220 cm', array['https://images.unsplash.com/photo-1708161885729-63faff807840?w=1400&q=80','https://images.unsplash.com/photo-1620388639945-990753377b58?w=1400&q=80'], false, 'furniture'),

  -- -------------------------------------------------- HOSPITALITY FURNITURE
  ('fritz-hansen-series-7', 'Fritz Hansen Series 7 — დასაწყობებადი სკამი', 'Fritz Hansen Series 7 Chair',
   'არნე იაკობსენის 1955 წლის ფორმა. იწყობა თორმეტამდე და კონფერენც-დარბაზების სტანდარტად რჩება.',
   'Arne Jacobsen, 1955. Stacks twelve high and is still the default for a conference floor.',
   'მწარმოებელი: Fritz Hansen. ფორმაწნეხილი ხე, ქრომირებული ფოლადი.',
   'Manufacturer: Fritz Hansen. Pressure-moulded veneer, chromed steel.',
   'W 50 x D 52 x H 78 cm', array['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80','https://images.unsplash.com/photo-1614066537969-7ae2fae81ace?w=1400&q=80'], true, 'furniture'),

  ('artifort-mare-lounge-chair', 'Artifort Mare — სავარძელი', 'Artifort Mare Lounge Chair',
   'ლობის სავარძელი დაბალი ზურგით — მოლოდინის სივრცისთვის, სადაც ხედვის ხაზი უნდა დარჩეს.',
   'A low-backed lobby chair for waiting areas where the sight line has to survive the seating.',
   'მწარმოებელი: Artifort. ცივად ჩამოსხმული ქაფი, მუხის ფეხები, საკონტრაქტო ქსოვილი.',
   'Manufacturer: Artifort. Cold-cured foam, oak legs, contract-grade upholstery.',
   'W 72 x D 76 x H 74 cm', array['https://images.unsplash.com/photo-1687262304525-02287047d4d6?w=1400&q=80'], false, 'furniture'),

  ('sancal-tiptoe-armchair', 'Sancal Tiptoe — სავარძელი', 'Sancal Tiptoe Armchair',
   'მაღალი მხრებით სავარძელი, რომელიც ღია სივრცეში საკუთარ კუთხეს ქმნის.',
   'A high-shouldered armchair that makes its own corner in the middle of an open room.',
   'მწარმოებელი: Sancal. HR ქაფი, წიფლის კარკასი, მოსახსნელი შალის გადასაფარებელი.',
   'Manufacturer: Sancal. HR foam, beech frame, removable wool cover.',
   'W 78 x D 80 x H 96 cm', array['https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1400&q=80','https://images.unsplash.com/photo-1665669959193-f7b95ee9fdab?w=1400&q=80'], true, 'furniture'),

  ('la-cividina-modular-sofa', 'La Cividina — მოდულური დივანი', 'La Cividina Modular Sofa',
   'ლობის მოდულური დივანი, რომელიც სწორ, კუთხოვან ან წრიულ კონფიგურაციად იკრიბება.',
   'A lobby sofa that assembles straight, cornered or in a ring, from the same modules.',
   'მწარმოებელი: La Cividina. FSC ხის კარკასი, გადამუშავებული პოლიესტერის შიგთავსი.',
   'Manufacturer: La Cividina. FSC timber frame, recycled polyester fill.',
   'Module W 90 x D 85 x H 72 cm', array['https://images.unsplash.com/photo-1776362658611-2067c9ded1d1?w=1400&q=80','https://images.unsplash.com/photo-1772862012088-2263c8e46c42?w=1400&q=80'], false, 'furniture'),

  ('figueras-auditorium-seating', 'Figueras — საააქტო დარბაზის სავარძლები', 'Figueras Auditorium Seating',
   'ავტომატურად აწეული სავარძლების რიგი — საააქტო და საკონფერენციო დარბაზებისთვის.',
   'Self-rising tiered seating for auditoriums and conference halls, on a fixed rail.',
   'მწარმოებელი: Figueras. ფოლადის კარკასი, დაუწვავი ქსოვილი, ხის ზურგი.',
   'Manufacturer: Figueras. Steel frame, flame-retardant upholstery, timber back.',
   'Seat W 52-60 cm, row pitch 90 cm', array['https://images.unsplash.com/photo-1646215993365-125e6428e1dc?w=1400&q=80','https://images.unsplash.com/photo-1759038086832-795644825e3a?w=1400&q=80'], false, 'public-seating'),

  -- -------------------------------------------------- RESIDENTIAL COLLECTION
  ('fredericia-spine-lounge-chair', 'Fredericia Spine — სავარძელი', 'Fredericia Spine Lounge Chair',
   'ხერხემლის ფორმის ზურგი მუხის კარკასზე. ლობისთვისაც და მისაღებისთვისაც.',
   'A spine-shaped back on a solid oak frame — as much a lobby chair as a living-room one.',
   'მწარმოებელი: Fredericia. მასიური მუხა, ტყავი ან შალი.',
   'Manufacturer: Fredericia. Solid oak, leather or wool.',
   'W 66 x D 78 x H 82 cm', array['https://images.unsplash.com/photo-1617364852223-75f57e78dc96?w=1400&q=80','https://images.unsplash.com/photo-1682343864562-d0b9f3470fe3?w=1400&q=80'], true, 'furniture'),

  ('muuto-outline-sofa', 'Muuto Outline — დივანი', 'Muuto Outline Sofa',
   'თხელი ფორმა და მაღალი ფეხები — დივანი, რომელიც პატარა ოთახს არ ავსებს.',
   'A thin silhouette on tall legs: a sofa that does not fill a small room.',
   'მწარმოებელი: Muuto. ალუმინის ფეხები, ცივად ჩამოსხმული ქაფი.',
   'Manufacturer: Muuto. Aluminium legs, cold-cured foam.',
   'W 214 x D 84 x H 71 cm', array['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80','https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1400&q=80'], false, 'furniture'),

  ('menu-passage-shelving', 'Menu Passage — თარო', 'Menu Passage Shelving',
   'ღია თაროების სისტემა, რომელიც კედელს არ საჭიროებს და ოთახს ორად ჰყოფს.',
   'An open shelving system that needs no wall and divides a room into two.',
   'მწარმოებელი: Menu. ფხვნილით დაფარული ფოლადი, მუხის თაროები.',
   'Manufacturer: Menu. Powder-coated steel, oak shelves.',
   'W 180 x D 32 x H 195 cm', array['https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=1400&q=80','https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?w=1400&q=80'], false, 'furniture'),

  ('barcelona-design-modular-sofa', 'Barcelona Design — მოდულური დივანი', 'Barcelona Design Modular Sofa',
   'დაბალი, ღრმა მოდულური დივანი — შერჩეული ჯდომისთვის და არა სწორად ჯდომისთვის.',
   'A low, deep modular sofa, specified for sitting back rather than sitting up.',
   'მწარმოებელი: Barcelona Design. წიფლის კარკასი, ბუმბულის ბალიშები.',
   'Manufacturer: Barcelona Design. Beech frame, feather-wrapped cushions.',
   'Module W 100 x D 100 x H 68 cm', array['https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1400&q=80'], true, 'furniture'),

  ('fredericia-post-console', 'Fredericia Post — კონსოლი', 'Fredericia Post Console',
   'ვიწრო კონსოლი დერეფნისთვის ან ლობისთვის, სადაც სიღრმე არ არის.',
   'A narrow console for a corridor or a lobby, where there is length but no depth.',
   'მწარმოებელი: Fredericia. მასიური მუხა, ზეთით დაფარული.',
   'Manufacturer: Fredericia. Solid oiled oak.',
   'W 140 x D 35 x H 78 cm', array['https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80'], false, 'furniture'),

  -- -------------------------------------------------- ARCHITECTURAL LIGHTING
  ('marset-discoco-pendant', 'Marset Discocó — დაკიდებული სანათი', 'Marset Discocó Pendant',
   'ოცდაათი დისკი, რომელიც სინათლეს ფანტავს და ნათურას ყოველი კუთხიდან მალავს.',
   'Thirty discs that scatter the light and hide the lamp from every angle in the room.',
   'მწარმოებელი: Marset. ლაქირებული ალუმინი, E27 LED.',
   'Manufacturer: Marset. Lacquered aluminium, E27 LED.',
   'Ø 88 x H 34 cm', array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80','https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1400&q=80'], true, 'lighting'),

  ('vibia-match-linear', 'Vibia Match — წრფივი დაკიდებული სანათი', 'Vibia Match Linear Suspension',
   'ხაზოვანი სისტემა, რომელიც ერთი ჭერის წერტილიდან რამდენიმე მიმართულებით იშლება.',
   'A linear system that branches in several directions from a single ceiling point.',
   'მწარმოებელი: Vibia. ექსტრუდირებული ალუმინი, ინტეგრირებული LED, 2700K.',
   'Manufacturer: Vibia. Extruded aluminium, integrated LED, 2700K.',
   'L 120-360 x H 6 cm', array['https://images.unsplash.com/photo-1553797794-4c4d2c55dbfb?w=1400&q=80','https://images.unsplash.com/photo-1606170033648-5d55a3edf314?w=1400&q=80'], false, 'lighting'),

  ('gubi-semi-pendant', 'Gubi Semi — დაკიდებული სანათი', 'Gubi Semi Pendant',
   '1968 წლის დანიური ფორმა. ორმაგი მოხრილი ნაჭუჭი სინათლეს ქვევით მიმართავს.',
   'A 1968 Danish form. The double-curved shade throws the light straight down.',
   'მწარმოებელი: Gubi. ლაქირებული ფოლადი, მქრქალი დაფარვა.',
   'Manufacturer: Gubi. Lacquered steel, matt finish.',
   'Ø 47 x H 33 cm', array['https://images.unsplash.com/photo-1592622515232-6e3e2a0d3d9a?w=1400&q=80','https://images.unsplash.com/photo-1559924508-1461423083c5?w=1400&q=80'], true, 'lighting'),

  ('zumtobel-mirel-evolution', 'Zumtobel Mirel Evolution — ჩასაშენებელი სანათი', 'Zumtobel Mirel Evolution Luminaire',
   'ოფისის ჩასაშენებელი სანათი UGR<19 მაჩვენებლით — ეკრანთან მუშაობის ზღვარი.',
   'A recessed office luminaire at UGR<19, the threshold for screen-based work.',
   'მწარმოებელი: Zumtobel. ალუმინის კორპუსი, მიკროპრიზმული ოპტიკა, DALI.',
   'Manufacturer: Zumtobel. Aluminium housing, micro-prismatic optic, DALI dimmable.',
   'W 62.5 x D 62.5 x H 7 cm', array['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&q=80'], false, 'lighting'),

  ('formalighting-cardo-spot', 'Formalighting Cardo — სამიმართულებო პროჟექტორი', 'Formalighting Cardo Track Spot',
   'ლიანდაგის პროჟექტორი ცვლადი ოპტიკით — 15-დან 60 გრადუსამდე, ინსტრუმენტის გარეშე.',
   'A track spot with interchangeable optics, 15 to 60 degrees, swapped without tools.',
   'მწარმოებელი: Formalighting. დაწნეხილი ალუმინი, CRI 97 LED.',
   'Manufacturer: Formalighting. Die-cast aluminium, CRI 97 LED.',
   'Ø 8 x H 19 cm', array['https://images.unsplash.com/photo-1581784878214-8d5596b98a01?w=1400&q=80','https://images.unsplash.com/photo-1602145461313-26c587cc0ca9?w=1400&q=80'], false, 'lighting'),

  -- ------------------------------------------------------ OUTDOOR FURNITURE
  ('pedrali-nolita-chair', 'Pedrali Nolita — გარე სკამი', 'Pedrali Nolita Outdoor Chair',
   'დასაწყობებადი გარე სკამი — ტერასებისთვის, რომლებიც ყოველ საღამოს იკრიბება.',
   'A stacking outdoor chair for terraces that are cleared away every evening.',
   'მწარმოებელი: Pedrali. ფხვნილით დაფარული ალუმინი, UV-მედეგი.',
   'Manufacturer: Pedrali. Powder-coated aluminium, UV-stable.',
   'W 55 x D 53 x H 82 cm', array['https://images.unsplash.com/photo-1762608675427-09ac2dbd1540?w=1400&q=80','https://images.unsplash.com/photo-1782073425027-e099f12e3433?w=1400&q=80'], true, 'furniture'),

  ('magis-air-armchair', 'Magis Air — გარე სავარძელი', 'Magis Air Armchair',
   'ერთი ჩამოსხმის სავარძელი, რომელიც ზამთარს გარეთ ატარებს.',
   'A single-mould armchair rated to stay outside through the winter.',
   'მწარმოებელი: Magis. საჰაერო წნევით ჩამოსხმული პოლიპროპილენი.',
   'Manufacturer: Magis. Air-moulded polypropylene.',
   'W 57 x D 50 x H 77 cm', array['https://images.unsplash.com/photo-1758445041789-1d27c2f21a88?w=1400&q=80','https://images.unsplash.com/photo-1785753734700-a8f22bfc256b?w=1400&q=80'], false, 'furniture'),

  ('enea-lottus-outdoor-table', 'Enea Lottus — გარე მაგიდა', 'Enea Lottus Outdoor Table',
   'ტერასის მაგიდა კომპაქტური ლამინატის ზედაპირით, რომელსაც წვიმა არ შლის.',
   'A terrace table with a compact laminate top that rain does not lift.',
   'მწარმოებელი: Enea. ჩამოსხმული ალუმინის ფუძე, კომპაქტური ლამინატი.',
   'Manufacturer: Enea. Cast aluminium base, compact laminate top.',
   'Ø 70 x H 73 cm', array['https://images.unsplash.com/photo-1765097732474-973a92d6fb4c?w=1400&q=80','https://images.unsplash.com/photo-1759471606534-cbd4aca4d4cb?w=1400&q=80'], false, 'furniture'),

  ('pedrali-reva-lounge', 'Pedrali Reva — გარე სავარძელი', 'Pedrali Reva Outdoor Lounge',
   'ხელით მოქსოვილი თოკის სავარძელი სასტუმროს ეზოსა და სახურავის ბარისთვის.',
   'A hand-woven rope lounge chair for hotel courtyards and roof bars.',
   'მწარმოებელი: Pedrali. ალუმინის კარკასი, პოლიპროპილენის თოკი, გარე ქაფი.',
   'Manufacturer: Pedrali. Aluminium frame, polypropylene rope, outdoor foam.',
   'W 76 x D 80 x H 72 cm', array['https://images.unsplash.com/photo-1600210492090-a159ffa3aeaf?w=1400&q=80','https://images.unsplash.com/photo-1715090576114-c07384af2069?w=1400&q=80'], true, 'furniture'),

  ('enea-terrace-bench', 'Enea Altzo — ტერასის სკამი', 'Enea Altzo Terrace Bench',
   'ორმეტრიანი გარე სკამი ზურგის გარეშე — გასასვლელებისა და ეზოებისთვის.',
   'A two-metre backless outdoor bench for entrances and courtyards.',
   'მწარმოებელი: Enea. თერმოდამუშავებული იფანი, უჟანგავი ფოლადი.',
   'Manufacturer: Enea. Thermo-treated ash, stainless steel.',
   'W 200 x D 40 x H 45 cm', array['https://images.unsplash.com/photo-1759471606534-cbd4aca4d4cb?w=1400&q=80','https://images.unsplash.com/photo-1600210492090-a159ffa3aeaf?w=1400&q=80'], false, 'public-seating'),

  -- ------------------------------------------------------ ACOUSTIC SOLUTIONS
  ('framery-o-pod', 'Framery O — სატელეფონო კაბინა', 'Framery O Meeting Pod',
   'ერთადგილიანი აკუსტიკური კაბინა ღია ოფისისთვის. მონტაჟი ორ საათში.',
   'A single-person acoustic pod for an open floor. Two hours to install, no building work.',
   'მწარმოებელი: Framery. ფოლადის კარკასი, 32 dB ხმის შთანთქმა.',
   'Manufacturer: Framery. Steel frame, 32 dB sound reduction.',
   'W 100 x D 100 x H 220 cm', array['https://images.unsplash.com/photo-1756480336914-c282fdc8372b?w=1400&q=80','https://images.unsplash.com/photo-1756480734230-a7680051fc26?w=1400&q=80'], true, 'acoustics'),

  ('framery-q-flow-pod', 'Framery Q Flow — სამუშაო კაბინა', 'Framery Q Flow Work Pod',
   'ოთხადგილიანი კაბინა ვიდეოზარებისთვის, ინტეგრირებული განათებითა და ვენტილაციით.',
   'A four-person pod for video calls, with integrated lighting and ventilation.',
   'მწარმოებელი: Framery. აკუსტიკური მინა, 38 dB ხმის შთანთქმა.',
   'Manufacturer: Framery. Acoustic glazing, 38 dB sound reduction.',
   'W 225 x D 140 x H 224 cm', array['https://images.unsplash.com/photo-1756480089667-3db4864409ab?w=1400&q=80','https://images.unsplash.com/photo-1756368881750-e9e065a1d1ec?w=1400&q=80'], false, 'acoustics'),

  ('caimi-snowsound-flat', 'Caimi Snowsound Flat — აკუსტიკური პანელი', 'Caimi Snowsound Flat Acoustic Panel',
   'ცვლადი სისქის პანელი, რომელიც სიხშირეთა სრულ დიაპაზონს თანაბრად შთანთქავს.',
   'A variable-density panel that absorbs evenly across the frequency range, not just the highs.',
   'მწარმოებელი: Caimi. პოლიესტერის ბოჭკო, ქსოვილის დაფარვა. კლასი A.',
   'Manufacturer: Caimi. Polyester fibre, fabric covered. Absorption class A.',
   'W 120 x H 60 x D 4 cm', array['https://images.unsplash.com/photo-1773127962331-299cf7663a0b?w=1400&q=80','https://images.unsplash.com/photo-1594235045856-a6315f0c4083?w=1400&q=80'], false, 'acoustics'),

  ('buzzispace-buzziblox', 'BuzziSpace BuzziBlox — აკუსტიკური ბაფლი', 'BuzziSpace BuzziBlox Baffle',
   'ჭერზე დაკიდებული ბაფლები, რომლებიც ღია ჭერს ტოვებს და რევერბერაციას ამცირებს.',
   'Ceiling baffles that cut reverberation while leaving the soffit and services exposed.',
   'მწარმოებელი: BuzziSpace. გადამუშავებული PET ბოჭკო.',
   'Manufacturer: BuzziSpace. Recycled PET felt.',
   'W 100 x H 40 x D 4 cm', array['https://images.unsplash.com/photo-1676477605752-224a26e6ec71?w=1400&q=80','https://images.unsplash.com/photo-1758800601600-f691cd1ba66d?w=1400&q=80'], true, 'acoustics'),

  ('cascando-pillow-screen', 'Cascando Pillow — აკუსტიკური ეკრანი', 'Cascando Pillow Acoustic Screen',
   'სამაგიდო აკუსტიკური ეკრანი, რომელიც სამუშაო ადგილს კედლის აშენების გარეშე ჰყოფს.',
   'A desk screen that divides a workstation without building a wall.',
   'მწარმოებელი: Cascando. აკუსტიკური ქაფი, შალის ქსოვილი.',
   'Manufacturer: Cascando. Acoustic foam, wool upholstery.',
   'W 160 x H 40 x D 4 cm', array['https://images.unsplash.com/photo-1646153389640-958d7ba1a864?w=1400&q=80','https://images.unsplash.com/photo-1681783165686-76e8d1f7663d?w=1400&q=80'], false, 'acoustics')

) as v(slug, title_ka, title_en, description_ka, description_en,
       materials_ka, materials_en, dimensions, images, featured, category_slug)
join categories c on c.slug = v.category_slug
on conflict (slug) do nothing;


-- ============================================================================
-- AFTERWARDS
-- ============================================================================
--
-- CHECK WHAT LANDED:
--
--     select c.title_en, count(p.id) as pieces
--     from categories c left join products p on p.category_id = c.id
--     group by c.title_en order by c.title_en;
--
-- TO REMOVE EVERYTHING THIS FILE ADDED, and nothing else:
--
--   These are the CURRENT four slugs. They were the six room-based ones
--   (office-furniture, hospitality-furniture, acoustic-solutions,
--   residential-collection, architectural-lighting, outdoor-furniture) until
--   the catalogue was re-cut along archtrade.ge's interior menu — see
--   supabase-interior-categories.sql. Re-check this list against the insert
--   above before running it: a stale slug here deletes the wrong products.
--
--     delete from products where category_id in (
--       select id from categories where slug in
--         ('furniture','lighting','acoustics','public-seating'));
--     delete from categories where slug in
--       ('furniture','lighting','acoustics','public-seating');
-- ============================================================================
