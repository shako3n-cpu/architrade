-- ============================================================================
-- ARCHTRADE — CATALOGUE SCHEMA AND SEED
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase dashboard -> SQL Editor -> New query -> paste this whole file
--   -> Run. It is safe to run more than once.
--
-- WHAT IT DOES
--   1. Creates `categories` and `products` if they do not exist.
--   2. Adds the three category columns the home page needs (group_key, image,
--      sort_order) to a database that predates them.
--   3. Turns on Row Level Security with a read-only policy for the public.
--   4. Seeds six categories and nineteen products.
--
-- IT WILL NOT DESTROY YOUR DATA
--   Every insert is an upsert keyed on `slug`, so a row that already exists is
--   updated in place and keeps its id. Products already pointing at a category
--   stay pointed at it. The one delete is guarded and only removes an empty
--   legacy category (see the note further down).
--
-- THE SITE IS READ-ONLY
--   ARCHTRADE is a showcase catalogue: no cart, no checkout, no prices. The
--   browser only ever SELECTs, using the anon key, which is why the policy
--   below grants select and nothing else.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text        not null,
  title_ka    text        not null,
  title_en    text        not null,
  created_at  timestamptz not null default now()
);

create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  slug            text        not null,
  title_ka        text        not null,
  title_en        text        not null,
  description_ka  text        not null default '',
  description_en  text        not null default '',
  materials_ka    text        not null default '',
  materials_en    text        not null default '',
  -- Free text, not numbers: "W 220 x D 95 x H 75 cm", "O 90 x H 38 cm".
  -- Stored as written so a round, extendable or irregular piece can still be
  -- described honestly.
  dimensions      text        not null default '',
  -- COVER PHOTO FIRST. A second entry powers the hover swap on product cards.
  images          text[]      not null default '{}',
  featured        boolean     not null default false,
  category_id     uuid        references categories (id) on delete set null,
  created_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 2. Columns added after the first version
-- ----------------------------------------------------------------------------
-- The home page splits the catalogue into Home furniture and Office furniture,
-- and paints a photograph on every category card. Those are facts about a
-- category, so they live on the row rather than being hard-coded in the app.
--
-- The site treats all three as OPTIONAL and works without them, so an older
-- database keeps rendering until this migration is run.

alter table categories add column if not exists group_key  text    not null default 'home';
alter table categories add column if not exists image      text;
alter table categories add column if not exists sort_order integer not null default 0;

-- `add constraint if not exists` does not exist in Postgres, hence the lookup.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_group_key_check'
  ) then
    alter table categories
      add constraint categories_group_key_check
      check (group_key in ('home', 'office'));
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- 3. Unique slugs
-- ----------------------------------------------------------------------------
-- A slug is what appears in the URL, so duplicates are a bug. These indexes are
-- also what makes the `on conflict (slug)` upserts below work.

create unique index if not exists categories_slug_key on categories (slug);
create unique index if not exists products_slug_key   on products   (slug);

create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_featured_idx    on products (featured) where featured;


-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
-- RLS is what actually protects the data. The anon key ships inside the built
-- JavaScript and is meant to be public; secrecy is not the control here.
--
-- Read for everyone, write for nobody. Content is edited through the Supabase
-- dashboard, which uses the service_role key and bypasses these policies.

alter table categories enable row level security;
alter table products   enable row level security;

drop policy if exists "Public read access" on categories;
create policy "Public read access" on categories for select to anon, authenticated using (true);

drop policy if exists "Public read access" on products;
create policy "Public read access" on products for select to anon, authenticated using (true);


-- ----------------------------------------------------------------------------
-- 5. Categories
-- ----------------------------------------------------------------------------
-- `living-room` and `bedroom` already exist and are updated in place, so the
-- products already attached to them are undisturbed.

insert into categories (slug, title_ka, title_en, group_key, image, sort_order)
values
  ('living-room',      'მისაღები ოთახი',        'Living Room',      'home',   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80', 10),
  ('bedroom',          'საძინებელი',            'Bedroom',          'home',   'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1600&q=80', 20),
  ('dining',           'სასადილო',              'Dining',           'home',   'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80', 30),
  ('office-desks',     'საოფისე მაგიდები',      'Office Desks',     'office', 'https://images.unsplash.com/photo-1631193816258-28b44b21e78b?w=1600&q=80', 40),
  ('ergonomic-chairs', 'ერგონომიული სავარძლები', 'Ergonomic Chairs', 'office', 'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=1600&q=80', 50),
  ('executive-suites', 'ხელმძღვანელის კაბინეტი', 'Executive Suites', 'office', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80', 60)
on conflict (slug) do update set
  title_ka   = excluded.title_ka,
  title_en   = excluded.title_en,
  group_key  = excluded.group_key,
  image      = excluded.image,
  sort_order = excluded.sort_order;

-- The original seed had a single catch-all `office` category. It is replaced by
-- the three office categories above. The `not exists` guard means it is only
-- removed once nothing points at it — if you have attached products to it, this
-- does nothing and the category survives for you to move them by hand.
delete from categories c
where c.slug = 'office'
  and not exists (select 1 from products p where p.category_id = c.id);


-- ----------------------------------------------------------------------------
-- 6. Products
-- ----------------------------------------------------------------------------
-- Nineteen pieces across the six categories. Categories are referenced by slug
-- and resolved to an id by the join, so this block does not care what uuids
-- your database generated.
--
-- Photography is from Unsplash, which permits free commercial use without
-- attribution. Replace these with the client's own product shots before the
-- site goes live — every one of these is a stock interior, not an ARCHTRADE
-- piece.

insert into products (
  slug, title_ka, title_en, description_ka, description_en,
  materials_ka, materials_en, dimensions, images, featured, category_id
)
select
  v.slug, v.title_ka, v.title_en, v.description_ka, v.description_en,
  v.materials_ka, v.materials_en, v.dimensions, v.images, v.featured, c.id
from (
  values
    -- ---- Living room -----------------------------------------------------
    ('modern-sofa', 'თანამედროვე დივანი', 'Modern Linen Sofa',
     'სამადგილიანი დივანი სუფთა ხაზებით და ბუნებრივი სელის გადასაკრავით. მუხის ჩარჩო ხელით არის აწყობილი და ათწლეულებზეა გათვლილი.',
     'A three-seater with clean lines under a natural linen cover. The oak frame is hand-assembled and built to last decades.',
     'მუხის მასივი, სელის ქსოვილი', 'Solid oak, linen upholstery', 'W 220 × D 95 × H 85 cm',
     array['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80',
           'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1400&q=80'],
     true, 'living-room'),

    ('terra-leather-sofa', 'ტერას ტყავის დივანი', 'Terra Leather Sofa',
     'სრული ანილინის ტყავი, რომელიც წლებთან ერთად პატინას იძენს. რბილი ჯდომა მკაცრ სილუეტში.',
     'Full-aniline leather that gains a patina over the years. A soft seat inside a strict silhouette.',
     'სრული ანილინის ტყავი, მუხის ფეხები', 'Full-aniline leather, oak legs', 'W 210 × D 92 × H 80 cm',
     array['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80',
           'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=80'],
     true, 'living-room'),

    ('lume-armchair', 'ლუმეს სავარძელი', 'Lume Bouclé Armchair',
     'ბუკლეს ქსოვილის სავარძელი მრგვალი ზურგით. კომპაქტური საკითხავი კუთხისთვის ან ოფისის მისაღებისთვის.',
     'A bouclé armchair with a rounded back. Compact enough for a reading corner or an office reception.',
     'ბუკლეს ქსოვილი, წიფლის კარკასი', 'Bouclé fabric, beech frame', 'W 78 × D 82 × H 74 cm',
     array['https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1400&q=80',
           'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1400&q=80'],
     false, 'living-room'),

    ('orbit-coffee-table', 'ორბიტის ჟურნალის მაგიდა', 'Orbit Oak Coffee Table',
     'მრგვალი ჟურნალის მაგიდა მუხის მასივისგან, ბუნებრივი ზეთით დამუშავებული ზედაპირით.',
     'A round coffee table in solid oak, finished with natural oil.',
     'მუხის მასივი, ბუნებრივი ზეთი', 'Solid oak, natural oil', 'Ø 90 × H 38 cm',
     array['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1400&q=80',
           'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80'],
     false, 'living-room'),

    -- ---- Bedroom ---------------------------------------------------------
    ('wooden-bed', 'ხის საწოლი', 'Solid Oak Bed Frame',
     'მინიმალისტური ორადგილიანი საწოლი მუხის მასივისგან, დაბალი თავსაფარით და ჩაშენებული ლამელებით.',
     'A minimalist double bed in solid oak, with a low headboard and integrated slats.',
     'მუხის მასივი', 'Solid oak', 'W 168 × L 210 × H 95 cm',
     array['https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=1400&q=80',
           'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1400&q=80'],
     true, 'bedroom'),

    ('kura-wardrobe', 'კურას გარდერობი', 'Kura Oak Wardrobe',
     'სამკარიანი გარდერობი ხის ბუნებრივი ტექსტურით. შიგნით — რეგულირებადი თაროები და სრული სიგრძის საკიდი.',
     'A three-door wardrobe with the timber grain left visible. Adjustable shelves and a full-length rail inside.',
     'მუხის შპონი, მუხის მასივის ჩარჩო', 'Oak veneer, solid oak frame', 'W 180 × D 60 × H 210 cm',
     array['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1400&q=80',
           'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1400&q=80'],
     false, 'bedroom'),

    ('mira-nightstand', 'მირას საწოლისპირა მაგიდა', 'Mira Walnut Nightstand',
     'ორუჯრიანი საწოლისპირა მაგიდა კაკლის ხისგან. რბილად დამხურავი მექანიზმი, ხელით გაპრიალებული ზედაპირი.',
     'A two-drawer nightstand in walnut. Soft-close runners and a hand-polished top.',
     'კაკლის ხე, ლითონის ფეხები', 'Walnut, steel legs', 'W 48 × D 40 × H 55 cm',
     array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
           'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80'],
     false, 'bedroom'),

    -- ---- Dining ----------------------------------------------------------
    ('mtkvari-dining-table', 'მტკვრის სასადილო მაგიდა', 'Mtkvari Oak Dining Table',
     'რვაადგილიანი სასადილო მაგიდა მუხის მასივისგან, სქელი ზედაპირით და ტრაპეციული ფეხებით.',
     'An eight-seat dining table in solid oak, with a thick top and tapered legs.',
     'მუხის მასივი, ბუნებრივი ზეთი', 'Solid oak, natural oil', 'W 220 × D 95 × H 75 cm',
     array['https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80',
           'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80'],
     true, 'dining'),

    ('sella-dining-chair', 'სელას სასადილო სკამი', 'Sella Dining Chair',
     'მოხრილი ხის ზურგი რბილ ჯდომაზე. ერთმანეთზე არ იდგმება, მაგრამ მაგიდის ქვეშ სრულად შედის.',
     'A bent-timber back over an upholstered seat. It does not stack, but it tucks fully under the table.',
     'მოხრილი წიფელი, ქსოვილის ჯდომა', 'Bent beech, fabric seat', 'W 46 × D 52 × H 82 cm',
     array['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1400&q=80',
           'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80'],
     false, 'dining'),

    ('iveria-sideboard', 'ივერიის სერვანტი', 'Iveria Walnut Sideboard',
     'დაბალი სერვანტი ოთხი კარით — სასადილოსთვის ან მისაღებისთვის. კაკლის შპონი ლითონის ფუძეზე.',
     'A low four-door sideboard for a dining room or a lounge. Walnut veneer on a steel base.',
     'კაკლის შპონი, ფხვნილით შეღებილი ლითონი', 'Walnut veneer, powder-coated steel', 'W 180 × D 45 × H 72 cm',
     array['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80',
           'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&q=80'],
     false, 'dining'),

    -- ---- Office desks ----------------------------------------------------
    ('arco-writing-desk', 'არკოს საწერი მაგიდა', 'Arco Oak Writing Desk',
     'მსუბუქი საწერი მაგიდა მუხის ფეხებზე. საკმარისად პატარა სახლის კაბინეტისთვის, საკმარისად მტკიცე ყოველდღიური მუშაობისთვის.',
     'A light writing desk on oak trestles. Small enough for a home study, solid enough for daily work.',
     'მუხის მასივი', 'Solid oak', 'W 140 × D 65 × H 74 cm',
     array['https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1400&q=80',
           'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1400&q=80'],
     true, 'office-desks'),

    ('studio-adjustable-desk', 'სტუდიოს რეგულირებადი მაგიდა', 'Studio Height-Adjustable Desk',
     'ელექტრულად რეგულირებადი მაგიდა 68-დან 118 სმ-მდე. ოთხი დასამახსოვრებელი პოზიცია და კაბელის არხი უკანა კიდეზე.',
     'Electrically adjustable from 68 to 118 cm. Four memory positions and a cable channel along the back edge.',
     'მუხის შპონი, ფხვნილით შეღებილი ფოლადი', 'Oak veneer, powder-coated steel', 'W 160 × D 80 × H 68–118 cm',
     array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80',
           'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1400&q=80'],
     true, 'office-desks'),

    ('kvira-compact-desk', 'კვირას კომპაქტური მაგიდა', 'Kvira Compact Desk',
     'კომპაქტური სამუშაო მაგიდა პატარა ოთახისთვის. ერთი უჯრა და კაბელის გამოსაყვანი ხვრელი.',
     'A compact work desk for a small room. One drawer and a cable grommet.',
     'მუხის შპონი, ლითონის ფეხები', 'Oak veneer, steel legs', 'W 110 × D 60 × H 74 cm',
     array['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1400&q=80',
           'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80'],
     false, 'office-desks'),

    -- ---- Ergonomic chairs ------------------------------------------------
    ('volta-task-chair', 'ვოლტას საოფისე სავარძელი', 'Volta Mesh Task Chair',
     'სუნთქვადი ბადისებრი ზურგი, რეგულირებადი წელის საყრდენი და სინქრონული მექანიზმი. რვასაათიან სამუშაო დღეზეა გათვლილი.',
     'A breathable mesh back, adjustable lumbar support and a synchronised tilt. Built for an eight-hour day.',
     'ბადისებრი ქსოვილი, ალუმინის ფუძე', 'Mesh fabric, aluminium base', 'W 68 × D 68 × H 108–118 cm',
     array['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1400&q=80',
           'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80'],
     true, 'ergonomic-chairs'),

    ('alta-executive-chair', 'ალტას ხელმძღვანელის სავარძელი', 'Alta Executive Chair',
     'სრულად გადაკრული სავარძელი მაღალი ზურგით. სიმაღლე, დახრა და ხელსაყრდენები რეგულირდება.',
     'A fully upholstered chair with a high back. Height, tilt and armrests all adjust.',
     'გადასაკრავი ქსოვილი, გაპრიალებული ალუმინი', 'Upholstery fabric, polished aluminium', 'W 70 × D 72 × H 112–122 cm',
     array['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1400&q=80',
           'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=1400&q=80'],
     false, 'ergonomic-chairs'),

    ('kalo-drafting-stool', 'კალოს მაღალი სკამი', 'Kalo Drafting Stool',
     'მაღალი სკამი მდგომარე მაგიდისთვის ან მიმღების დახლისთვის. ფეხის საყრდენი და რბილი ჯდომა.',
     'A high stool for a standing desk or a reception counter. Footrest and a padded seat.',
     'წიფლის ხე, ლითონის ფეხის რგოლი', 'Beech, steel footring', 'W 40 × D 40 × H 65–78 cm',
     array['https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80',
           'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=80'],
     false, 'ergonomic-chairs'),

    -- ---- Executive suites ------------------------------------------------
    ('regna-executive-desk', 'რეგნას ხელმძღვანელის მაგიდა', 'Regna Executive Desk Suite',
     'მაგიდა და მისი შესაბამისი გვერდითი კარადა ერთ კომპლექტში. სქელი მუხის ზედაპირი დაფარული კაბელის არხით.',
     'A desk and its matching side cabinet as one suite. A thick oak top with a concealed cable channel.',
     'მუხის მასივი, კაკლის შპონი', 'Solid oak, walnut veneer', 'W 200 × D 90 × H 75 cm',
     array['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&q=80',
           'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'],
     true, 'executive-suites'),

    ('forum-boardroom-table', 'ფორუმის სათათბირო მაგიდა', 'Forum Boardroom Table',
     'თორმეტადგილიანი სათათბირო მაგიდა ზედაპირში ჩაშენებული დენისა და მონაცემების ბუდეებით.',
     'A twelve-seat boardroom table with power and data outlets built into the top.',
     'მუხის შპონი, ფოლადის ფუძე', 'Oak veneer, steel base', 'W 360 × D 120 × H 75 cm',
     array['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1400&q=80',
           'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1400&q=80'],
     false, 'executive-suites'),

    ('folio-bookcase', 'ფოლიოს წიგნის კარადა', 'Folio Executive Bookcase',
     'ღია თაროიანი კარადა კაბინეტისთვის. ხუთი დონე და კედლის ფიქსატორი კომპლექტში.',
     'An open shelving unit for a study. Five levels, with a wall anchor included.',
     'მუხის მასივი, ფხვნილით შეღებილი ლითონი', 'Solid oak, powder-coated steel', 'W 90 × D 35 × H 200 cm',
     array['https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1400&q=80',
           'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1400&q=80'],
     false, 'executive-suites')
) as v (
  slug, title_ka, title_en, description_ka, description_en,
  materials_ka, materials_en, dimensions, images, featured, category_slug
)
join categories c on c.slug = v.category_slug
on conflict (slug) do update set
  title_ka       = excluded.title_ka,
  title_en       = excluded.title_en,
  description_ka = excluded.description_ka,
  description_en = excluded.description_en,
  materials_ka   = excluded.materials_ka,
  materials_en   = excluded.materials_en,
  dimensions     = excluded.dimensions,
  images         = excluded.images,
  featured       = excluded.featured,
  category_id    = excluded.category_id;


-- ----------------------------------------------------------------------------
-- 7. Check what you got
-- ----------------------------------------------------------------------------

select c.group_key, c.slug, c.title_en, count(p.id) as products
from categories c
left join products p on p.category_id = c.id
group by c.group_key, c.slug, c.title_en, c.sort_order
order by c.sort_order;
