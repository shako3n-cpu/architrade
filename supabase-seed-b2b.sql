-- ============================================================================
-- ARCHTRADE — B2B CATALOGUE SEED
-- ----------------------------------------------------------------------------
-- Twenty-eight contract products across five new categories, drawn from the
-- houses archtrade actually represents.
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
--   Stock, and chosen by looking at each one beside the product it is
--   attached to — a lighting product has a photograph of lighting in it.
--   They are placeholders for real product photography all the same, and the
--   dashboard can replace any of them without touching this file.
--
-- PRICES ARE NULL, DELIBERATELY. This site shows "price on request" and has no
-- cart. Nothing here sets a figure.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------------------
-- group_key is 'office' for all five: the app only knows 'home' and 'office',
-- and contract flooring is not domestic. Adding a third group would mean
-- changing CategoryGroup in src/data/types.ts and the home page with it.
-- sort_order continues past the existing rooms, which stop at 60.
insert into categories (slug, title_ka, title_en, group_key, image, sort_order)
values
  ('contract-furniture', 'საკონტრაქტო ავეჯი', 'Contract Furniture', 'office',
   'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80', 110),
  ('architectural-lighting', 'არქიტექტურული განათება', 'Architectural Lighting', 'office',
   'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1600&q=80', 120),
  ('contract-flooring', 'იატაკის საფარი', 'Contract Flooring', 'office',
   'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80', 130),
  ('building-facades', 'ფასადები', 'Building Facades', 'office',
   'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1600&q=80', 140),
  ('acoustic-solutions', 'აკუსტიკური გადაწყვეტები', 'Acoustic Solutions', 'office',
   'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80', 150)
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

  -- ---------------------------------------------------------------- FURNITURE
  ('hm-aeron-task-chair', 'Herman Miller Aeron — სამუშაო სავარძელი', 'Herman Miller Aeron Task Chair',
   'ერგონომიული სავარძელი PostureFit SL საყრდენით და რვა ზომის დიაპაზონით. სამი ზომა A, B, C.',
   'The ergonomic benchmark, with PostureFit SL support and eight adjustment ranges. Sizes A, B and C.',
   'მწარმოებელი: Herman Miller. 8Z Pellicle ბადე, გადამუშავებული ალუმინი, 12 წლის გარანტია.',
   'Manufacturer: Herman Miller. 8Z Pellicle suspension, recycled aluminium, 12-year warranty.',
   'W 68.6 x D 66 x H 94-104 cm', array['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1400&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80'], true, 'contract-furniture'),

  ('haworth-fern-chair', 'Haworth Fern — სამუშაო სავარძელი', 'Haworth Fern Task Chair',
   'Wave Suspension ზურგი, რომელიც მომხმარებლის მოძრაობას მიჰყვება ცალკეული რეგულირების გარეშე.',
   'A Wave Suspension back that follows the sitter rather than asking them to adjust to it.',
   'მწარმოებელი: Haworth. Digital Knit ზურგი, პოლირებული ალუმინის ფუძე.',
   'Manufacturer: Haworth. Digital Knit back, polished aluminium base.',
   'W 70 x D 68 x H 89-99 cm', array['https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80'], false, 'contract-furniture'),

  ('fritz-hansen-series-7', 'Fritz Hansen Series 7 — დასაწყობებადი სკამი', 'Fritz Hansen Series 7 Chair',
   'არნე იაკობსენის 1955 წლის ფორმა. იწყობა თორმეტამდე და კონფერენც-დარბაზების სტანდარტად რჩება.',
   'Arne Jacobsen, 1955. Stacks twelve high and is still the default for a conference floor.',
   'მწარმოებელი: Fritz Hansen. ფორმაწნეხილი ხე, ქრომირებული ფოლადი.',
   'Manufacturer: Fritz Hansen. Pressure-moulded veneer, chromed steel.',
   'W 50 x D 52 x H 78 cm', array['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80','https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1400&q=80'], true, 'contract-furniture'),

  ('muuto-fiber-chair', 'Muuto Fiber — საკონფერენციო სკამი', 'Muuto Fiber Conference Chair',
   'ხის ბოჭკოს კომპოზიტის ნაჭუჭი, სურვილისამებრ შემობრუნებადი ფუძით.',
   'A wood-fibre composite shell on an optional swivel base, for rooms used all day.',
   'მწარმოებელი: Muuto. 25% ხის ბოჭკო, ფხვნილით დაფარული ფოლადი.',
   'Manufacturer: Muuto. 25% wood fibre composite, powder-coated steel.',
   'W 58 x D 55 x H 78 cm', array['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80','https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80'], false, 'contract-furniture'),

  ('andreu-world-reverse-table', 'Andreu World Reverse — სათათბირო მაგიდა', 'Andreu World Reverse Meeting Table',
   'მოდულური სათათბირო მაგიდა კაბელის ინტეგრირებული არხით და ხუთამდე მეტრიანი კონფიგურაციით.',
   'A modular meeting table with an integrated cable spine, configurable to five metres.',
   'მწარმოებელი: Andreu World. FSC მუხის ხე, თერმოდამუშავებული კიდე.',
   'Manufacturer: Andreu World. FSC oak, thermo-treated edge.',
   'W 240-500 x D 110 x H 74 cm', array['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1400&q=80','https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80'], true, 'contract-furniture'),

  ('pedrali-arki-table', 'Pedrali Arki — სამუშაო მაგიდა', 'Pedrali Arki Desk',
   'თხელი კიდის მაგიდა Fenix NTM ზედაპირით, რომელიც თითის ანაბეჭდს არ იჭერს.',
   'A thin-edged desk in Fenix NTM, a surface that does not hold fingerprints.',
   'მწარმოებელი: Pedrali. Fenix NTM ლამინატი, ფხვნილით დაფარული ფოლადი.',
   'Manufacturer: Pedrali. Fenix NTM laminate, powder-coated steel.',
   'W 160 x D 80 x H 74 cm', array['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1400&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80'], false, 'contract-furniture'),

  -- ----------------------------------------------------------------- LIGHTING
  ('marset-discoco-pendant', 'Marset Discocó — დაკიდებული სანათი', 'Marset Discocó Pendant',
   'ოცდაათი დისკი, რომელიც სინათლეს ფანტავს და ნათურას ყოველი კუთხიდან მალავს.',
   'Thirty discs that scatter the light and hide the lamp from every angle in the room.',
   'მწარმოებელი: Marset. ლაქირებული ალუმინი, E27 LED.',
   'Manufacturer: Marset. Lacquered aluminium, E27 LED.',
   'O 88 x H 34 cm', array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80','https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80'], true, 'architectural-lighting'),

  ('vibia-match-linear', 'Vibia Match — წრფივი დაკიდებული სანათი', 'Vibia Match Linear Suspension',
   'ხაზოვანი სისტემა, რომელიც ერთი ჭერის წერტილიდან რამდენიმე მიმართულებით იშლება.',
   'A linear system that branches in several directions from a single ceiling point.',
   'მწარმოებელი: Vibia. ექსტრუდირებული ალუმინი, ინტეგრირებული LED, 2700K.',
   'Manufacturer: Vibia. Extruded aluminium, integrated LED, 2700K.',
   'L 120-360 x H 6 cm', array['https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80','https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1400&q=80'], false, 'architectural-lighting'),

  ('zumtobel-mirel-evolution', 'Zumtobel Mirel Evolution — ჩასაშენებელი სანათი', 'Zumtobel Mirel Evolution Luminaire',
   'ოფისის ჩასაშენებელი სანათი UGR<19 მაჩვენებლით — ეკრანთან მუშაობის სტანდარტი.',
   'A recessed office luminaire at UGR<19, the threshold for screen-based work.',
   'მწარმოებელი: Zumtobel. ალუმინის კორპუსი, მიკროპრიზმული ოპტიკა, DALI.',
   'Manufacturer: Zumtobel. Aluminium housing, micro-prismatic optic, DALI dimmable.',
   'W 62.5 x D 62.5 x H 7 cm', array['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80'], false, 'architectural-lighting'),

  ('gubi-semi-pendant', 'Gubi Semi — დაკიდებული სანათი', 'Gubi Semi Pendant',
   '1968 წლის დანიური ფორმა. ორმაგი მოხრილი ნაჭუჭი სინათლეს ქვევით მიმართავს.',
   'A 1968 Danish form. The double-curved shade throws the light straight down.',
   'მწარმოებელი: Gubi. ლაქირებული ფოლადი, მქრქალი დაფარვა.',
   'Manufacturer: Gubi. Lacquered steel, matt finish.',
   'O 47 x H 33 cm', array['https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1400&q=80','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80'], true, 'architectural-lighting'),

  ('formalighting-cardo-spot', 'Formalighting Cardo — სამიმართულებო პროჟექტორი', 'Formalighting Cardo Track Spot',
   'სამიმართულებო პროჟექტორი ცვლადი ოპტიკით — 15-დან 60 გრადუსამდე, ინსტრუმენტის გარეშე.',
   'A track spot with interchangeable optics, 15 to 60 degrees, swapped without tools.',
   'მწარმოებელი: Formalighting. დაწნეხილი ალუმინი, CRI 97 LED.',
   'Manufacturer: Formalighting. Die-cast aluminium, CRI 97 LED.',
   'O 8 x H 19 cm', array['https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80','https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'], false, 'architectural-lighting'),

  ('lamp83-lineer-profile', 'Lamp83 Lineer — ჩასაშენებელი პროფილი', 'Lamp83 Lineer Recessed Profile',
   'უწყვეტი ხაზოვანი პროფილი, რომელიც გაჯში იმალება და მხოლოდ სინათლის ხაზს ტოვებს.',
   'A continuous linear profile that disappears into plasterboard, leaving only the line of light.',
   'მწარმოებელი: Lamp83. ანოდირებული ალუმინი, ოპალის დიფუზორი.',
   'Manufacturer: Lamp83. Anodised aluminium, opal diffuser.',
   'L 100-300 x W 3.5 cm', array['https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1400&q=80','https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80'], false, 'architectural-lighting'),

  -- ----------------------------------------------------------------- FLOORING
  ('milliken-comfortable-concrete', 'Milliken Comfortable Concrete — ხალიჩის ფილა', 'Milliken Comfortable Concrete Carpet Tile',
   'ბეტონის ფაქტურა ხალიჩის ფილაზე. WellBAC საფუძველი წებოს გარეშე იდება.',
   'A concrete read in a carpet tile. The WellBAC backing lays without adhesive.',
   'მწარმოებელი: Milliken. ნეილონი 6.6, WellBAC Comfort საფუძველი.',
   'Manufacturer: Milliken. Nylon 6.6 with WellBAC Comfort cushion backing.',
   '50 x 50 cm tile', array['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80','https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1400&q=80'], true, 'contract-flooring'),

  ('gerflor-taralay-impression', 'Gerflor Taralay Impression — ვინილის საფარი', 'Gerflor Taralay Impression Vinyl',
   'ჰეტეროგენული ვინილი მაღალი გამტარიანობის სივრცეებისთვის. კლასი 34/43.',
   'Heterogeneous vinyl for heavy traffic. Classification 34/43 — airports and hospitals.',
   'მწარმოებელი: Gerflor. Protecsol 2 დამუშავება, 0.65 მმ ცვეთის ფენა.',
   'Manufacturer: Gerflor. Protecsol 2 treatment, 0.65 mm wear layer.',
   'Roll W 200 cm', array['https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1400&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80'], false, 'contract-flooring'),

  ('ege-highline-tile', 'Ege Highline — ხალიჩის ფილა', 'Ege Highline Carpet Tile',
   'ECONYL გადამუშავებული ნეილონი. ნახატის თავისუფალი შერჩევა მინიმალური ტირაჟიდან.',
   'ECONYL regenerated nylon, with bespoke patterning from a low minimum order.',
   'მწარმოებელი: Ege Carpets. 100% ECONYL, Ecotrust საფუძველი.',
   'Manufacturer: Ege Carpets. 100% ECONYL yarn, Ecotrust backing.',
   '50 x 50 cm tile', array['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80'], false, 'contract-flooring'),

  ('jacaranda-sakura-broadloom', 'Jacaranda Sakura — შალის ხალიჩა', 'Jacaranda Sakura Wool Broadloom',
   'ხელით მოქსოვილი შალის ხალიჩა სასტუმროების საერთო სივრცეებისთვის.',
   'Hand-loomed wool broadloom for hotel public areas, where a tile line would show.',
   'მწარმოებელი: Jacaranda. 100% ახალი მატყლი, ჯუთის საფუძველი.',
   'Manufacturer: Jacaranda. 100% new wool, jute backing.',
   'Roll W 400 cm', array['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80'], true, 'contract-flooring'),

  ('ntgrate-sublime-woven', 'ntgrate Sublime — ნაქსოვი ვინილი', 'ntgrate Sublime Woven Vinyl',
   'ნაქსოვი ვინილი ხალიჩის იერით და მყარი საფარის მოვლით.',
   'Woven vinyl: the look of a textile, cleaned like a hard floor.',
   'მწარმოებელი: ntgrate. ნაქსოვი PVC, აკუსტიკური საფუძველი.',
   'Manufacturer: ntgrate. Woven PVC, acoustic backing.',
   '50 x 50 cm tile', array['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80','https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1400&q=80'], false, 'contract-flooring'),

  ('condor-graphic-loop', 'Condor Graphic Loop — ხალიჩის ფილა', 'Condor Graphic Loop Carpet Tile',
   'მარყუჟოვანი ხალიჩის ფილა ღია გეგმის ოფისებისთვის. ბიტუმის გარეშე.',
   'A loop-pile tile for open-plan floors. Bitumen-free, so it can be lifted and reused.',
   'მწარმოებელი: Condor. პოლიამიდი, Ecoback საფუძველი.',
   'Manufacturer: Condor. Polyamide, Ecoback backing.',
   '50 x 50 cm tile', array['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80'], false, 'contract-flooring'),

  -- ------------------------------------------------------------------ FACADES
  ('trespa-meteon-panel', 'Trespa Meteon — ფასადის პანელი', 'Trespa Meteon Facade Panel',
   'მაღალი წნევის ლამინატის ვენტილირებადი ფასადი. ათწლეულების ფერმყარობა.',
   'A high-pressure laminate rainscreen. Colour-stable for decades in direct sun.',
   'მწარმოებელი: Trespa. HPL, EBC ზედაპირი, სისქე 8 მმ.',
   'Manufacturer: Trespa. HPL with Electron Beam Curing surface, 8 mm.',
   '3650 x 1860 x 8 mm', array['https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&q=80','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80'], true, 'building-facades'),

  ('nbk-terart-baguette', 'NBK Terart — ტერაკოტის ბაგეტი', 'NBK Terart Terracotta Baguette',
   'ექსტრუდირებული ტერაკოტის მზისგან დამცავი ბაგეტი. ბუნებრივი, დაუფარავი ფერი.',
   'Extruded terracotta sun-shading baguettes in natural, unglazed colour.',
   'მწარმოებელი: NBK Keramik. ექსტრუდირებული თიხა, ალუმინის ქვესაკიდი.',
   'Manufacturer: NBK Keramik. Extruded clay on aluminium sub-construction.',
   'O 40-80 x L up to 150 cm', array['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80','https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&q=80'], false, 'building-facades'),

  ('swisspearl-carat-panel', 'Swisspearl Carat — ბოჭკოვან-ცემენტის პანელი', 'Swisspearl Carat Fibre Cement Panel',
   'შეღებილი ბოჭკოვან-ცემენტის პანელი, დაუწვავი და ვენტილირებადი ფასადისთვის.',
   'Through-coloured fibre cement, non-combustible, for a ventilated facade.',
   'მწარმოებელი: Swisspearl. პორტლანდცემენტი, ცელულოზის ბოჭკო. A2-s1,d0.',
   'Manufacturer: Swisspearl. Portland cement and cellulose fibre. A2-s1,d0.',
   '3050 x 1250 x 8 mm', array['https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?w=1400&q=80','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80'], false, 'building-facades'),

  ('flexbrick-ceramic-mesh', 'Flexbrick — კერამიკული ბადე', 'Flexbrick Ceramic Mesh Facade',
   'ფოლადის ბადეზე აწყობილი კერამიკა, რომელიც რულონად მიეწოდება და ერთიანად იდება.',
   'Ceramic laid onto a steel mesh, delivered as a roll and hung in one piece.',
   'მწარმოებელი: Flexbrick. კერამიკული ნაწილები, უჟანგავი ფოლადის ბადე.',
   'Manufacturer: Flexbrick. Ceramic pieces on stainless steel mesh.',
   'Roll W up to 300 cm', array['https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&q=80','https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?w=1400&q=80'], false, 'building-facades'),

  ('solarlux-cero-glass-wall', 'Solarlux Cero — მინის კედელი', 'Solarlux Cero Sliding Glass Wall',
   'მინიმალური პროფილის მოცურებადი მინის კედელი — 34 მმ ხედის ხაზი.',
   'A minimal sliding glass wall with a 34 mm sight line, so the frame all but disappears.',
   'მწარმოებელი: Solarlux. თერმულად გაწყვეტილი ალუმინი, სამმაგი შემინვა.',
   'Manufacturer: Solarlux. Thermally broken aluminium, triple glazing.',
   'Panel up to W 300 x H 400 cm', array['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=80','https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&q=80'], true, 'building-facades'),

  -- ---------------------------------------------------------------- ACOUSTICS
  ('framery-o-pod', 'Framery O — სატელეფონო კაბინა', 'Framery O Meeting Pod',
   'ერთადგილიანი აკუსტიკური კაბინა ღია ოფისისთვის. მონტაჟი ორ საათში.',
   'A single-person acoustic pod for an open floor. Two hours to install, no building work.',
   'მწარმოებელი: Framery. ფოლადის კარკასი, 32 dB ხმის შთანთქმა.',
   'Manufacturer: Framery. Steel frame, 32 dB sound reduction.',
   'W 100 x D 100 x H 220 cm', array['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=80'], true, 'acoustic-solutions'),

  ('framery-q-flow-pod', 'Framery Q Flow — სამუშაო კაბინა', 'Framery Q Flow Work Pod',
   'ოთხადგილიანი კაბინა ვიდეოზარებისთვის, ინტეგრირებული განათებითა და ვენტილაციით.',
   'A four-person pod for video calls, with integrated lighting and ventilation.',
   'მწარმოებელი: Framery. აკუსტიკური მინა, 38 dB ხმის შთანთქმა.',
   'Manufacturer: Framery. Acoustic glazing, 38 dB sound reduction.',
   'W 225 x D 140 x H 224 cm', array['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=80','https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80'], false, 'acoustic-solutions'),

  ('caimi-snowsound-flat', 'Caimi Snowsound Flat — აკუსტიკური პანელი', 'Caimi Snowsound Flat Acoustic Panel',
   'ცვლადი სისქის პანელი, რომელიც სიხშირეთა სრულ დიაპაზონს ერთნაირად შთანთქავს.',
   'A variable-density panel that absorbs evenly across the frequency range, not just the highs.',
   'მწარმოებელი: Caimi. პოლიესტერის ბოჭკო, ქსოვილის დაფარვა. კლასი A.',
   'Manufacturer: Caimi. Polyester fibre, fabric covered. Absorption class A.',
   'W 120 x H 60 x D 4 cm', array['https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80','https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'], false, 'acoustic-solutions'),

  ('buzzispace-buzziblox', 'BuzziSpace BuzziBlox — აკუსტიკური ბაფლი', 'BuzziSpace BuzziBlox Baffle',
   'ჭერზე დაკიდებული ბაფლები, რომლებიც ღია ჭერს ტოვებს და რევერბერაციას ამცირებს.',
   'Ceiling baffles that cut reverberation while leaving the soffit and services exposed.',
   'მწარმოებელი: BuzziSpace. გადამუშავებული PET ბოჭკო.',
   'Manufacturer: BuzziSpace. Recycled PET felt.',
   'W 100 x H 40 x D 4 cm', array['https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80'], false, 'acoustic-solutions'),

  ('cascando-pillow-screen', 'Cascando Pillow — აკუსტიკური ეკრანი', 'Cascando Pillow Acoustic Screen',
   'მაგიდის აკუსტიკური ეკრანი, რომელიც სამუშაო ადგილს კედლის აშენების გარეშე ჰყოფს.',
   'A desk screen that divides a workstation without building a wall.',
   'მწარმოებელი: Cascando. აკუსტიკური ქაფი, შალის ქსოვილი.',
   'Manufacturer: Cascando. Acoustic foam, wool upholstery.',
   'W 160 x H 40 x D 4 cm', array['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80','https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80'], false, 'acoustic-solutions')

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
-- The five new categories appear on the home page under "Office furniture",
-- because the app only knows two groups. If they deserve their own heading,
-- that is a change to CategoryGroup in src/data/types.ts, categoryGroup() in
-- src/lib/localize.ts and the two panels on the home page — not to this file.
--
-- TO REMOVE EVERYTHING THIS FILE ADDED, and nothing else:
--
--     delete from products where category_id in (
--       select id from categories where slug in
--         ('contract-furniture','architectural-lighting','contract-flooring',
--          'building-facades','acoustic-solutions'));
--     delete from categories where slug in
--       ('contract-furniture','architectural-lighting','contract-flooring',
--        'building-facades','acoustic-solutions');
-- ============================================================================
