import type { SeedProduct } from './types'

/**
 * ============================================================================
 * PRODUCTS  —  the whole catalogue lives in this one file
 * ----------------------------------------------------------------------------
 * HOW TO ADD A PRODUCT  (no programming needed)
 *
 *   1. Copy one whole block below — from the opening `{` down to the `},`
 *      that closes it. Copying an existing product is much safer than typing
 *      a new one from scratch, because you keep every field.
 *
 *   2. Paste it into the list, just before the closing `]` at the bottom.
 *
 *   3. Change `id`, `slug` and `articleNumber`. All three must be unique.
 *        id            — internal only, visitors never see it
 *        slug          — becomes the web address, e.g. /ka/product/orbit-coffee-table
 *                        lowercase Latin letters, numbers and hyphens ONLY
 *        articleNumber — printed on the product card, shown in search
 *
 *   4. Point it at a category:
 *        categorySlug     must match a `slug` in categories.ts
 *        subcategorySlug  must match a subcategory inside THAT category
 *        collectionSlug   must match a slug in collections.ts, or be ''
 *
 *   5. Write `name`, `shortDescription` and `description` in BOTH
 *      languages. If you leave one out the editor underlines it in red.
 *      Never leave a language empty — an untranslated product looks broken.
 *
 *   6. `images` — THE FIRST PHOTO IS THE COVER. Add at least two: the second
 *      one is what appears when a visitor hovers over the card. Four or five
 *      is ideal for the product page gallery.
 *
 *   7. `dimensions` are in CENTIMETRES, as plain numbers — no "cm", no quotes.
 *        width = left to right, depth = front to back, height = floor to top
 *
 *   8. `finishes` are the colour swatches. `hex` is the colour the little
 *      square is painted, written as "#RRGGBB". Pick the closest colour to
 *      the real fabric or timber.
 *
 *   9. `availability` must be exactly one of:
 *        'in-stock'  — in the showroom now
 *        'on-order'  — ordered in, usually four to six weeks
 *        'custom'    — made to the customer's measurements
 *
 *  10. `isNew` puts the piece in the "New arrivals" row on the home page.
 *      `isFeatured` makes it eligible for the featured block. Use both
 *      sparingly — if everything is featured, nothing is.
 *
 *  11. Save the file. The catalogue, the filters, the category pages and the
 *      search all pick the product up on their own.
 *
 * ----------------------------------------------------------------------------
 * PLEASE KEEP THIS FILE AS DATA ONLY. Lookup helpers live in ./index.ts.
 *
 * NOTE ON PRICES: this site shows no prices anywhere. Visitors ask for one
 * through the contact form, so there is deliberately no price field here.
 *
 * NOTE ON PHOTOGRAPHY: every image below is an Unsplash placeholder. Replace
 * the addresses with ARCHTRADE's own photography before the site goes live.
 * ============================================================================
 */

export const products: SeedProduct[] = [
  // ==========================================================================
  // LIVING ROOM
  // ==========================================================================
  {
    id: 'prd-nord-sofa',
    slug: 'nord-3-seater-sofa',
    articleNumber: 'AT-LR-101',
    categorySlug: 'living-room',
    subcategorySlug: 'sofas',
    collectionSlug: 'atelier',
    name: {
      ka: 'დივანი "Nord" — 3-ადგილიანი',
      en: 'Nord 3-seater sofa',
    },
    shortDescription: {
      ka: 'ხავერდის დივანი კაკლის ფეხებზე, აწეული კორპუსით.',
      en: 'Velvet sofa on slim walnut legs, lifted clear of the floor.',
    },
    description: {
      ka: 'Nord-ის კორპუსი განზრახ ვიწროა — დივანი ოთახს არ ავსებს, არამედ მას ხაზს უსვამს. ბალიშები შევსებულია ბუმბულისა და ქაფის ნაზავით, რაც ჯდომისას რბილობას იძლევა, დგომისას კი ფორმას ინარჩუნებს. კაკლის მასივის ფეხები კორპუსს იატაკიდან წყვეტს და ოთახს უფრო მსუბუქად აჩვენებს.',
      en: 'The Nord frame is deliberately narrow — it marks a room out rather than filling it. Cushions are filled with a feather and foam blend, soft to sit on but firm enough to hold their shape once you stand. Solid walnut legs lift the body clear of the floor, which makes the whole room read lighter.',
    },
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80',
    ],
    materials: {
      ka: 'ხავერდი, მასივის კარკასი, კაკლის ფეხები',
      en: 'Velvet upholstery, solid timber frame, walnut legs',
    },
    dimensions: { width: 220, depth: 92, height: 82 },
    finishes: [
      { name: { ka: 'ბოთლისფერი მწვანე', en: 'Bottle green' }, hex: '#2F4F43' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand' }, hex: '#C7B9A3' },
      { name: { ka: 'ღრმა ლურჯი', en: 'Deep blue' }, hex: '#2B3A4A' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 60,
    isNew: true,
    isFeatured: true,
  },

  {
    id: 'prd-terra-sofa',
    slug: 'terra-leather-sofa',
    articleNumber: 'AT-LR-102',
    categorySlug: 'living-room',
    subcategorySlug: 'sofas',
    collectionSlug: 'terra',
    name: {
      ka: 'ტყავის დივანი "Terra" — 3-ადგილიანი',
      en: 'Terra leather sofa, 3-seater',
    },
    shortDescription: {
      ka: 'ანილინის ტყავი, რომელიც წლებთან ერთად ლამაზდება.',
      en: 'Aniline leather that improves rather than wears.',
    },
    description: {
      ka: 'Terra-ს ტყავი ანილინის შეღებვისაა — ის არ არის დაფარული პიგმენტის ფენით, ამიტომ ინარჩუნებს ბუნებრივ ტექსტურას და ხასიათს. პირველივე თვეებში ზედაპირი რბილდება, ხოლო წლების შემდეგ ჩნდება პატინა, რომელიც ორ ერთნაირ დივანს ერთმანეთისგან განასხვავებს. კარკასი მუხის მასივისაა და ხელით არის შეწებებული.',
      en: 'Terra is upholstered in aniline leather — no pigment layer sits on top of it, so the grain and the character of the hide stay visible. The surface softens within the first months, and after a few years a patina appears that no two sofas share. The frame is solid oak, joined by hand.',
    },
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=80',
    ],
    materials: {
      ka: 'ანილინის ტყავი, მუხის მასივის კარკასი და ფეხები',
      en: 'Aniline leather, solid oak frame and legs',
    },
    dimensions: { width: 218, depth: 94, height: 80 },
    finishes: [
      { name: { ka: 'კონიაკისფერი', en: 'Cognac' }, hex: '#A9713F' },
      { name: { ka: 'შოკოლადისფერი', en: 'Chocolate' }, hex: '#4A342A' },
      { name: { ka: 'ქარამელი', en: 'Caramel' }, hex: '#C08A4E' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 84,
    isNew: false,
    isFeatured: true,
  },

  {
    id: 'prd-alba-sofa',
    slug: 'alba-corner-sofa',
    articleNumber: 'AT-LR-103',
    categorySlug: 'living-room',
    subcategorySlug: 'sofas',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'კუთხის დივანი "Alba"',
      en: 'Alba corner sofa',
    },
    shortDescription: {
      ka: 'მოდულური კუთხის დივანი მოსახსნელი ჩასაფენებით.',
      en: 'Modular corner sofa with removable, washable covers.',
    },
    description: {
      ka: 'Alba იყიდება მოდულებად, ამიტომ კუთხე შეიძლება მარცხნივ ან მარჯვნივ განთავსდეს — გადაწყვეტილება მიტანამდე შეიცვლება. ყველა ჩასაფენი იხსნება და ირეცხება 30 გრადუსზე, რაც ბავშვიან ან ცხოველიან სახლში მთავარი არგუმენტია. შალის ქსოვილს დამატებული აქვს ლაქებისადმი მდგრადი დამუშავება.',
      en: 'Alba is sold as modules, so the corner can sit on the left or the right — the decision can change right up to delivery. Every cover unzips and washes at 30 degrees, which tends to be the deciding argument in a house with children or animals. The wool blend carries a stain-resistant finish.',
    },
    images: [
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1400&q=80',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1400&q=80',
    ],
    materials: {
      ka: 'შალის ნაზავის ქსოვილი, მასივის კარკასი, მოსახსნელი ჩასაფენები',
      en: 'Wool-blend upholstery, solid timber frame, removable covers',
    },
    dimensions: { width: 290, depth: 180, height: 78 },
    finishes: [
      { name: { ka: 'გრაფიტისფერი', en: 'Graphite' }, hex: '#4A4A48' },
      { name: { ka: 'ღია ნაცრისფერი', en: 'Light grey' }, hex: '#9A9A94' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand' }, hex: '#BFB2A0' },
    ],
    availability: 'on-order',
    origin: { ka: 'პოლონეთი', en: 'Poland' },
    warrantyMonths: 60,
    isNew: true,
    isFeatured: false,
  },

  {
    id: 'prd-lume-armchair',
    slug: 'lume-armchair',
    articleNumber: 'AT-LR-104',
    categorySlug: 'living-room',
    subcategorySlug: 'armchairs',
    collectionSlug: 'atelier',
    name: {
      ka: 'სავარძელი "Lume"',
      en: 'Lume armchair',
    },
    shortDescription: {
      ka: 'ღრმად გაკერილი ხავერდის სავარძელი წიფლის ფეხებზე.',
      en: 'Deep-buttoned velvet armchair on turned beech legs.',
    },
    description: {
      ka: 'Lume საკმარისად პატარაა, რომ ვიწრო ოთახშიც მოთავსდეს, და საკმარისად ღრმა, რომ საღამო მასში გაატაროთ. ზურგის გაკერვა ხელით სრულდება — თითოეულ ღილაკს ოსტატი ცალკე ამაგრებს. ფეხები შავად შეღებილი წიფლისაა, რაც კონტრასტს ქმნის ღია ტონის ქსოვილებთან.',
      en: 'Lume is small enough for a narrow room and deep enough to spend an evening in. The buttoning on the back is done by hand, each one pulled and fixed separately. The legs are in blackened beech, which gives the lighter fabrics something to sit against.',
    },
    images: [
      'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1400&q=80',
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1400&q=80',
    ],
    materials: {
      ka: 'ხავერდი, შავად შეღებილი წიფლის ფეხები',
      en: 'Velvet upholstery, blackened beech legs',
    },
    dimensions: { width: 72, depth: 78, height: 86 },
    finishes: [
      { name: { ka: 'მდოგვისფერი', en: 'Mustard' }, hex: '#C8952F' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green' }, hex: '#35503F' },
      { name: { ka: 'ტერაკოტა', en: 'Terracotta' }, hex: '#A65A3C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პორტუგალია', en: 'Portugal' },
    warrantyMonths: 36,
    isNew: true,
    isFeatured: true,
  },

  {
    id: 'prd-orbit-table',
    slug: 'orbit-coffee-table',
    articleNumber: 'AT-LR-105',
    categorySlug: 'living-room',
    subcategorySlug: 'coffee-tables',
    collectionSlug: 'terra',
    name: {
      ka: 'ჟურნალის მაგიდა "Orbit"',
      en: 'Orbit coffee table',
    },
    shortDescription: {
      ka: 'მრგვალი კაკლის მაგიდა ერთ ცენტრალურ ფეხზე.',
      en: 'Round walnut table on a single centre column.',
    },
    description: {
      ka: 'ერთი ცენტრალური ფეხი ნიშნავს, რომ მაგიდის გარშემო ფეხების გადადგმა თავისუფლად შეიძლება — მცირე ოთახში ეს განსხვავებას ქმნის. ზედაპირი კაკლის მასივისაა და ზეთით არის დამუშავებული, ამიტომ ზედაპირული ნაკაწრი ადგილზევე გამოსწორდება. ყოველი მაგიდის ხის ნახატი უნიკალურია.',
      en: 'A single centre column means you can put your feet anywhere around it — in a small room that matters more than it sounds. The top is solid walnut finished in oil, so a surface scratch can be dealt with in place rather than sent away. No two tops carry the same grain.',
    },
    images: [
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1400&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80',
    ],
    materials: {
      ka: 'კაკლის მასივი, ზეთით დამუშავებული',
      en: 'Solid walnut, oil finish',
    },
    dimensions: { width: 90, depth: 90, height: 38 },
    finishes: [
      { name: { ka: 'კაკალი', en: 'Walnut' }, hex: '#6B4A32' },
      { name: { ka: 'ღია მუხა', en: 'Light oak' }, hex: '#C0A075' },
    ],
    availability: 'in-stock',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 24,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-linea-tv',
    slug: 'linea-tv-console',
    articleNumber: 'AT-LR-106',
    categorySlug: 'living-room',
    subcategorySlug: 'tv-stands',
    collectionSlug: 'atelier',
    name: {
      ka: 'ტელევიზორის მაგიდა "Linea"',
      en: 'Linea TV console',
    },
    shortDescription: {
      ka: 'დაბალი კონსოლი შებოლილი მუხის შპონით და კაბელის არხით.',
      en: 'Low console in smoked oak with a hidden cable channel.',
    },
    description: {
      ka: 'Linea-ს უკანა კედელში გატარებულია კაბელის არხი, ამიტომ მავთულები არ ჩანს — ეს ის დეტალია, რომელიც სუფთა კედელსა და არეულ კუთხეს შორის განსხვავებას ქმნის. ორი უჯრა რბილად იხურება. კონსოლი შეიძლება იატაკზე დაიდგას ან კედელზე დამაგრდეს.',
      en: 'Linea has a cable channel run through the back panel, so nothing hangs in view — it is the detail that separates a clean wall from a cluttered corner. The two drawers close on a soft-close runner. The console can stand on the floor or be fixed to the wall.',
    },
    images: [
      'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1400&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1400&q=80',
    ],
    materials: {
      ka: 'შებოლილი მუხის შპონი, ფხვნილსაღებავიანი ლითონის კარკასი',
      en: 'Smoked oak veneer, powder-coated steel frame',
    },
    dimensions: { width: 180, depth: 42, height: 46 },
    finishes: [
      { name: { ka: 'შებოლილი მუხა', en: 'Smoked oak' }, hex: '#5A4636' },
      { name: { ka: 'მატი შავი', en: 'Matt black' }, hex: '#1E1E1C' },
    ],
    availability: 'on-order',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 36,
    isNew: false,
    isFeatured: false,
  },

  // ==========================================================================
  // BEDROOM
  // ==========================================================================
  {
    id: 'prd-alazani-bed',
    slug: 'alazani-oak-bed',
    articleNumber: 'AT-BR-201',
    categorySlug: 'bedroom',
    subcategorySlug: 'beds',
    collectionSlug: 'terra',
    name: {
      ka: 'ორადგილიანი საწოლი "Alazani"',
      en: 'Alazani oak bed',
    },
    shortDescription: {
      ka: 'მუხის მასივის საწოლი დაბალი კარკასით, 160×200 ლეიბისთვის.',
      en: 'Solid oak platform bed with a low frame, for a 160×200 mattress.',
    },
    description: {
      ka: 'Alazani-ს კარკასი დაბალია და ოთახს ვიზუალურად მაღალს ტოვებს — ეს ხერხი განსაკუთრებით კარგად მუშაობს იმ საძინებლებში, სადაც ჭერი დაბალია. მუხის მასივი ზეთით არის დამუშავებული და დროთა განმავლობაში თბილ ტონს იძენს. ლამელური საფუძველი კომპლექტში შედის.',
      en: 'The Alazani frame sits low, which leaves the room reading taller than it is — a trick that pays off most in bedrooms with a low ceiling. The solid oak is oil-finished and warms in tone over the years. The slatted base is included.',
    },
    images: [
      'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=1400&q=80',
      'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, ზეთით დამუშავებული, ლამელური საფუძველი',
      en: 'Solid oak with an oil finish, slatted base',
    },
    dimensions: { width: 186, depth: 212, height: 105 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
      { name: { ka: 'თაფლისფერი მუხა', en: 'Honey oak' }, hex: '#A67C4A' },
    ],
    availability: 'on-order',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 84,
    isNew: false,
    isFeatured: true,
  },

  {
    id: 'prd-vela-bed',
    slug: 'vela-upholstered-bed',
    articleNumber: 'AT-BR-202',
    categorySlug: 'bedroom',
    subcategorySlug: 'beds',
    collectionSlug: 'atelier',
    name: {
      ka: 'რბილი საწოლი "Vela"',
      en: 'Vela upholstered bed',
    },
    shortDescription: {
      ka: 'მაღალი რბილი თავი ვერტიკალური ხაზებით, თითბრის ფეხები.',
      en: 'Tall channelled headboard with slim brass feet.',
    },
    description: {
      ka: 'Vela-ს თავი 120 სანტიმეტრზე მაღლდება და საწოლს ოთახის ცენტრად აქცევს — წასაკითხადაც საკმარისად რბილია. ვერტიკალური ხაზები ხელით არის ჩამოყალიბებული, ერთმანეთისგან თანაბარ მანძილზე. თითბრის ფეხები ერთადერთი ბზინვარე ელემენტია მთელ ნაწარმში.',
      en: 'The Vela headboard rises to 120 centimetres and turns the bed into the centre of the room — soft enough to read against, too. The vertical channels are formed by hand and set at an even pitch. The brass feet are the only bright element on the whole piece.',
    },
    images: [
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1400&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=80',
    ],
    materials: {
      ka: 'ბუკლე ქსოვილი, მასივის კარკასი, თითბრის ფეხები',
      en: 'Bouclé upholstery, solid timber frame, brass feet',
    },
    dimensions: { width: 176, depth: 215, height: 120 },
    finishes: [
      { name: { ka: 'ანტრაციტი', en: 'Anthracite' }, hex: '#3A3A3C' },
      { name: { ka: 'ნაცრისფერი ბუკლე', en: 'Grey bouclé' }, hex: '#A7A29A' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand' }, hex: '#C9BCA8' },
    ],
    availability: 'on-order',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 60,
    isNew: true,
    isFeatured: false,
  },

  {
    id: 'prd-kura-wardrobe',
    slug: 'kura-wardrobe',
    articleNumber: 'AT-BR-203',
    categorySlug: 'bedroom',
    subcategorySlug: 'wardrobes',
    collectionSlug: '',
    name: {
      ka: 'გარდერობი "Kura" — ორკარიანი',
      en: 'Kura two-door wardrobe',
    },
    shortDescription: {
      ka: 'ორკარიანი გარდერობი, სიმაღლე და შიდა წყობა შეკვეთით.',
      en: 'Two-door wardrobe, built to your ceiling and your interior layout.',
    },
    description: {
      ka: 'Kura იზომება ადგილზე — სიმაღლე ჭერამდე მიდის, რომ ზემოთ მტვრის შესაგროვებელი ღრიჭო არ დარჩეს. შიდა წყობა თქვენი გადასაწყვეტია: შტანგები, თაროები და უჯრები ნებისმიერი კომბინაციით. კარები რბილად იხურება და სახელურის გარეშეც იღება.',
      en: 'Kura is measured on site — the height runs to the ceiling so no dust gap is left along the top. The interior is yours to decide: hanging rails, shelves and drawers in any combination. The doors are soft-close and open on a push catch, with no handle needed.',
    },
    images: [
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1400&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის შპონი MDF-ზე, რბილად დამხურავი ანჯამები',
      en: 'Oak veneer on MDF, soft-close hinges',
    },
    dimensions: { width: 120, depth: 60, height: 210 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#B98F5E' },
      { name: { ka: 'თეთრი მატი', en: 'Matt white' }, hex: '#E8E4DC' },
    ],
    availability: 'custom',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 60,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-mira-nightstand',
    slug: 'mira-nightstand',
    articleNumber: 'AT-BR-204',
    categorySlug: 'bedroom',
    subcategorySlug: 'nightstands',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'ღამის მაგიდა "Mira"',
      en: 'Mira nightstand',
    },
    shortDescription: {
      ka: 'პატარა მუხის მაგიდა ერთი უჯრით და ღია თაროთი.',
      en: 'Small oak nightstand with one drawer and an open shelf.',
    },
    description: {
      ka: 'Mira განზრახ ვიწროა — საწოლის გვერდით ის ადგილს არ იჭერს, მაგრამ წიგნს, სათვალესა და ჭიქა წყალს იტევს. ღია თარო უჯრის ქვეშ იმისთვისაა, რომ დაწყებული წიგნი ხელთ იყოს. ფეხები ოდნავ დახრილია, რაც მთელ ნაწარმს სიმსუბუქეს მატებს.',
      en: 'Mira is deliberately narrow — it takes up almost nothing beside a bed, but still holds a book, a pair of glasses and a glass of water. The open shelf below the drawer is there for whatever you are halfway through. The legs splay very slightly, which keeps the whole thing from looking heavy.',
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, ერთი უჯრა რბილი მექანიზმით',
      en: 'Solid oak, one soft-close drawer',
    },
    dimensions: { width: 45, depth: 38, height: 52 },
    finishes: [
      { name: { ka: 'ღია მუხა', en: 'Light oak' }, hex: '#CBAE84' },
      { name: { ka: 'თეთრი', en: 'White' }, hex: '#EDE9E1' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland' },
    warrantyMonths: 24,
    isNew: true,
    isFeatured: false,
  },

  {
    id: 'prd-rioni-dresser',
    slug: 'rioni-dresser',
    articleNumber: 'AT-BR-205',
    categorySlug: 'bedroom',
    subcategorySlug: 'dressers',
    collectionSlug: 'terra',
    name: {
      ka: 'კომოდი "Rioni" — ექვსუჯრიანი',
      en: 'Rioni six-drawer dresser',
    },
    shortDescription: {
      ka: 'კაკლის კომოდი ექვსი უჯრით და თითბრის სახელურებით.',
      en: 'Walnut dresser with six drawers and solid brass pulls.',
    },
    description: {
      ka: 'Rioni-ს უჯრები ტრადიციული "მერცხლის კუდის" შეერთებით არის აწყობილი — ეს კვანძი უფრო დიდხანს ძლებს, ვიდრე ნებისმიერი ხრახნი. სახელურები მასიური თითბრისაა და დროთა განმავლობაში იმ ადგილებში ბზინავს, სადაც ხელი ეხება. ზედაპირი საკმარისად ფართოა სარკისა და ორი სანათისთვის.',
      en: 'The Rioni drawers are assembled with traditional dovetail joints — a joint that outlasts any screw. The pulls are solid brass and, over time, polish themselves where hands land most. The top is wide enough for a mirror and a pair of lamps.',
    },
    images: [
      'https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=1400&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1400&q=80',
    ],
    materials: {
      ka: 'კაკლის მასივი და შპონი, თითბრის სახელურები',
      en: 'Solid walnut and veneer, solid brass pulls',
    },
    dimensions: { width: 140, depth: 45, height: 80 },
    finishes: [
      { name: { ka: 'კაკალი', en: 'Walnut' }, hex: '#6B4A32' },
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
    ],
    availability: 'on-order',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 60,
    isNew: false,
    isFeatured: false,
  },

  // ==========================================================================
  // DINING & KITCHEN
  // ==========================================================================
  {
    id: 'prd-mtkvari-table',
    slug: 'mtkvari-dining-table',
    articleNumber: 'AT-DK-301',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'dining-tables',
    collectionSlug: 'terra',
    name: {
      ka: 'სასადილო მაგიდა "Mtkvari" — მრგვალი',
      en: 'Mtkvari round dining table',
    },
    shortDescription: {
      ka: 'მრგვალი კაკლის მაგიდა ოთხიდან ექვს სტუმრამდე.',
      en: 'Round walnut table seating four to six.',
    },
    description: {
      ka: 'მრგვალ მაგიდას სათავე არ აქვს — სწორედ ამიტომ საუბარი მასთან სხვანაირად მიდის. 130 სანტიმეტრი ოთხს კომფორტულად, ექვსს კი მჭიდროდ და მხიარულად იტევს. ცენტრალური ფეხი ნიშნავს, რომ სკამის ადგილი ფეხმა არ უნდა განსაზღვროს.',
      en: 'A round table has no head, which is exactly why conversation runs differently across one. At 130 centimetres it seats four in comfort and six in the cheerful, close way. The centre column means no leg dictates where a chair can go.',
    },
    images: [
      'https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80',
    ],
    materials: {
      ka: 'კაკლის მასივი, ცენტრალური ფეხი, ზეთით დამუშავებული',
      en: 'Solid walnut, centre column, oil finish',
    },
    dimensions: { width: 130, depth: 130, height: 75 },
    finishes: [
      { name: { ka: 'კაკალი', en: 'Walnut' }, hex: '#6B4A32' },
      { name: { ka: 'შებოლილი მუხა', en: 'Smoked oak' }, hex: '#5A4636' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 84,
    isNew: false,
    isFeatured: true,
  },

  {
    id: 'prd-plana-table',
    slug: 'plana-extendable-table',
    articleNumber: 'AT-DK-302',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'dining-tables',
    collectionSlug: '',
    name: {
      ka: 'გასაშლელი სასადილო მაგიდა "Plana"',
      en: 'Plana extendable dining table',
    },
    shortDescription: {
      ka: 'მუხის მაგიდა, რომელიც 180-დან 240 სანტიმეტრამდე იშლება.',
      en: 'Oak table that runs from 180 to 240 centimetres.',
    },
    description: {
      ka: 'Plana ჩვეულებრივ დღეებში ექვსს იტევს, სტუმრებთან ერთად კი ათს. გასაშლელი მექანიზმი ერთი ხელით მუშაობს — დამატებითი ფურცელი მაგიდის შიგნით ინახება და ცალკე გატანა არ სჭირდება. მუხის მასივი ლაქის ნაცვლად მატი ზეთით არის დამუშავებული.',
      en: 'Plana seats six on an ordinary evening and ten when the family arrives. The extension works one-handed — the extra leaf is stored inside the table, so nothing has to be fetched from another room. The solid oak is finished in matt oil rather than lacquer.',
    },
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, გასაშლელი მექანიზმი 240 სმ-მდე',
      en: 'Solid oak, extension mechanism to 240 cm',
    },
    dimensions: { width: 180, depth: 90, height: 75 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
      { name: { ka: 'თეთრი ზეთი', en: 'White oil' }, hex: '#DCD3C4' },
    ],
    availability: 'on-order',
    origin: { ka: 'პოლონეთი', en: 'Poland' },
    warrantyMonths: 60,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-sella-chair',
    slug: 'sella-dining-chair',
    articleNumber: 'AT-DK-303',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'chairs',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'სასადილო სკამი "Sella"',
      en: 'Sella dining chair',
    },
    shortDescription: {
      ka: 'რბილი სკამი მუხის ფეხებზე, დაბალი სახელურებით.',
      en: 'Upholstered chair on oak legs with low, rounded arms.',
    },
    description: {
      ka: 'Sella-ს სახელურები განზრახ დაბალია, რომ სკამი მაგიდის ქვეშ ბოლომდე შევიდეს — ეს პატარა დეტალი ვიწრო სასადილოში ბევრს ნიშნავს. ზურგი ოდნავ უკან იხრება, ამიტომ სადილის შემდეგ ადგომა არ გინდებათ. ქსოვილი მოსახსნელია და ცალკე შეიძლება შეიცვალოს.',
      en: 'The Sella arms are kept deliberately low so the chair slides fully under the table — a small thing that matters in a narrow dining room. The back leans just enough that nobody gets up straight after dinner. The cover is removable and can be replaced on its own.',
    },
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1400&q=80',
      'https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80',
    ],
    materials: {
      ka: 'შალის ქსოვილი, მუხის მასივის ფეხები',
      en: 'Wool upholstery, solid oak legs',
    },
    dimensions: { width: 52, depth: 55, height: 82 },
    finishes: [
      { name: { ka: 'ნაცრისფერი მელანჟი', en: 'Grey melange' }, hex: '#8E8B85' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green' }, hex: '#35503F' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand' }, hex: '#C7B9A3' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland' },
    warrantyMonths: 36,
    isNew: true,
    isFeatured: false,
  },

  {
    id: 'prd-alto-stool',
    slug: 'alto-bar-stool',
    articleNumber: 'AT-DK-304',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'bar-stools',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'ბარის სკამი "Alto"',
      en: 'Alto bar stool',
    },
    shortDescription: {
      ka: 'წიფლის მასივის სკამი 75 სმ სიმაღლეზე, ფეხის საყრდენით.',
      en: 'Solid beech stool at 75 cm with a footrest.',
    },
    description: {
      ka: 'Alto-ს ჯდომის სიმაღლე 75 სანტიმეტრია, რაც სტანდარტულ 90-სანტიმეტრიან კუნძულს ზუსტად ერგება. ფეხის საყრდენი საკმარისად განიერია, რომ დიდხანს ჯდომისას ფეხი არ დაიღალოს. მასივი წიფლისაა და ზეთით არის დამუშავებული, ამიტომ სველი ხელი კვალს არ ტოვებს.',
      en: 'Alto sits at 75 centimetres, which is the height that actually works against a standard 90-centimetre island. The footrest is wide enough that your feet do not tire over a long conversation. The solid beech is oil-finished, so a wet hand leaves no mark.',
    },
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&q=80',
    ],
    materials: {
      ka: 'წიფლის მასივი, ზეთით დამუშავებული',
      en: 'Solid beech, oil finish',
    },
    dimensions: { width: 40, depth: 40, height: 75 },
    finishes: [
      { name: { ka: 'თეთრი', en: 'White' }, hex: '#EDE9E1' },
      { name: { ka: 'ბუნებრივი წიფელი', en: 'Natural beech' }, hex: '#D2B48C' },
      { name: { ka: 'შავი', en: 'Black' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პორტუგალია', en: 'Portugal' },
    warrantyMonths: 24,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-grafito-kitchen',
    slug: 'grafito-kitchen',
    articleNumber: 'AT-DK-305',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'kitchen-units',
    collectionSlug: 'atelier',
    name: {
      ka: 'სამზარეულოს კომპლექტი "Grafito"',
      en: 'Grafito kitchen',
    },
    shortDescription: {
      ka: 'მატი გრაფიტისფერი ფასადები კვარცის ზედაპირით, ინდივიდუალური ზომებით.',
      en: 'Matt graphite fronts with a quartz worktop, built to measure.',
    },
    description: {
      ka: 'Grafito იზომება და იგეგმება თქვენს სამზარეულოში, არა კატალოგში — ყოველი კორპუსი კონკრეტულ კედელს ერგება. მატი საღებავი თითის ანაბეჭდს არ იჭერს, რაც მუქ ფასადებზე მთავარი პრაქტიკული საკითხია. კვარცის ზედაპირი უფრო მდგრადია, ვიდრე მარმარილო, და მჟავე ლაქებს არ იღებს.',
      en: 'Grafito is measured and drawn in your kitchen rather than in a catalogue — every carcass is cut to a particular wall. The matt paint does not hold fingerprints, which is the practical question with any dark front. The quartz worktop is harder than marble and will not stain from anything acidic.',
    },
    images: [
      'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=1400&q=80',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1400&q=80',
    ],
    materials: {
      ka: 'ფრეზერული MDF მატი საღებავით, კვარცის ზედაპირი',
      en: 'Routed MDF in matt lacquer, quartz worktop',
    },
    dimensions: { width: 360, depth: 62, height: 220 },
    finishes: [
      { name: { ka: 'გრაფიტი', en: 'Graphite' }, hex: '#3C3F41' },
      { name: { ka: 'თეთრი მატი', en: 'Matt white' }, hex: '#E8E4DC' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green' }, hex: '#35503F' },
    ],
    availability: 'custom',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 120,
    isNew: false,
    isFeatured: true,
  },

  {
    id: 'prd-isola-island',
    slug: 'isola-kitchen-island',
    articleNumber: 'AT-DK-306',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'islands',
    collectionSlug: '',
    name: {
      ka: 'სამზარეულოს კუნძული "Isola"',
      en: 'Isola kitchen island',
    },
    shortDescription: {
      ka: 'კუნძული კვარცის ზედაპირით, საცავით და ბარის კიდით.',
      en: 'Island with a quartz top, deep storage and a breakfast overhang.',
    },
    description: {
      ka: 'Isola-ს ზედაპირი ერთი მხრიდან 30 სანტიმეტრით გამოდის — სწორედ იმდენით, რომ ორი ბარის სკამი კომფორტულად მოთავსდეს. მეორე მხარეს ღრმა უჯრები და თაროებია, სადაც ქვაბები დგომითი წყობით ინახება. ზედაპირი ერთიანი ფილისაა, ნაკერის გარეშე.',
      en: 'The Isola top overhangs by 30 centimetres on one side — exactly enough for two bar stools to sit under comfortably. The other side carries deep drawers and shelves where pans are stored standing rather than stacked. The worktop is a single slab with no visible seam.',
    },
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=80',
    ],
    materials: {
      ka: 'კვარცის ზედაპირი, მუხის შპონი, ინტეგრირებული საცავი',
      en: 'Quartz worktop, oak veneer, integrated storage',
    },
    dimensions: { width: 200, depth: 95, height: 92 },
    finishes: [
      { name: { ka: 'თეთრი კვარცი', en: 'White quartz' }, hex: '#E5E1D8' },
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
    ],
    availability: 'custom',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 120,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-iveria-sideboard',
    slug: 'iveria-sideboard',
    articleNumber: 'AT-DK-307',
    categorySlug: 'dining-kitchen',
    subcategorySlug: 'sideboards',
    collectionSlug: 'terra',
    name: {
      ka: 'ბუფეტი "Iveria"',
      en: 'Iveria sideboard',
    },
    shortDescription: {
      ka: 'დაბალი ბუფეტი სამი კარით და რეგულირებადი თაროებით.',
      en: 'Low sideboard with three doors and adjustable shelves.',
    },
    description: {
      ka: 'Iveria სასადილო ოთახის სამუშაო ცხენია — შიგნით ჩამოეტევა სადღესასწაულო სერვიზი, ზემოთ კი ადგილი რჩება ლამპისა და ვაზისთვის. თაროები რეგულირდება, ამიტომ მაღალი ჭურჭელიც თავსდება. თითბრის სახელურები ხელით არის გაპრიალებული.',
      en: 'Iveria is the working horse of a dining room — the good service fits inside and the top is left free for a lamp and a vase. The shelves are adjustable, so tall glassware fits as easily as plates. The brass pulls are hand-polished.',
    },
    images: [
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი და შპონი, თითბრის სახელურები',
      en: 'Solid oak and veneer, brass pulls',
    },
    dimensions: { width: 165, depth: 45, height: 75 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green' }, hex: '#35503F' },
      { name: { ka: 'თიხისფერი', en: 'Clay' }, hex: '#9C8C74' },
    ],
    availability: 'on-order',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 60,
    isNew: false,
    isFeatured: true,
  },

  // ==========================================================================
  // OFFICE
  // ==========================================================================
  {
    id: 'prd-arco-desk',
    slug: 'arco-desk',
    articleNumber: 'AT-OF-401',
    categorySlug: 'office',
    subcategorySlug: 'desks',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'სამუშაო მაგიდა "Arco"',
      en: 'Arco desk',
    },
    shortDescription: {
      ka: 'მუხის მაგიდა ორი უჯრით და კაბელის ფარული არხით.',
      en: 'Oak desk with two drawers and a concealed cable tray.',
    },
    description: {
      ka: 'Arco-ს უკან, ზედაპირის ქვეშ, ჩამონტაჟებულია კაბელის ლანგარი — დამტენები და მავთულები იქ ინახება და მაგიდაზე არ ჩანს. ორი ვიწრო უჯრა საკმარისია ყოველდღიური წვრილმანისთვის. სიღრმე 60 სანტიმეტრია, რაც მონიტორისთვის სწორ დისტანციას იძლევა.',
      en: 'A cable tray is fitted under the rear edge of Arco, so chargers and leads live there instead of on the surface. Two shallow drawers hold the everyday clutter. The 60-centimetre depth puts a monitor at the distance your eyes actually want.',
    },
    images: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1400&q=80',
      'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, ფხვნილსაღებავიანი ლითონის ფეხები, ორი უჯრა',
      en: 'Solid oak, powder-coated steel legs, two drawers',
    },
    dimensions: { width: 140, depth: 60, height: 75 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
      { name: { ka: 'მატი შავი', en: 'Matt black' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland' },
    warrantyMonths: 36,
    isNew: true,
    isFeatured: false,
  },

  {
    id: 'prd-studio-desk',
    slug: 'studio-adjustable-desk',
    articleNumber: 'AT-OF-402',
    categorySlug: 'office',
    subcategorySlug: 'desks',
    collectionSlug: '',
    name: {
      ka: 'სამუშაო მაგიდა "Studio" — რეგულირებადი სიმაღლით',
      en: 'Studio height-adjustable desk',
    },
    shortDescription: {
      ka: 'ელექტრო ამწე მაგიდა 72-დან 120 სანტიმეტრამდე.',
      en: 'Electric sit-stand desk, 72 to 120 centimetres.',
    },
    description: {
      ka: 'Studio ორი ძრავით მუშაობს და სიმაღლეს 72-დან 120 სანტიმეტრამდე ცვლის — ჯდომიდან დგომაზე გადასვლა თერთმეტ წამში ხდება. პანელზე ოთხი მეხსიერების ღილაკია, ამიტომ საყვარელი სიმაღლის ხელახლა მოძებნა არ სჭირდება. კარკასი 120 კილოგრამამდე დატვირთვას უძლებს.',
      en: 'Studio runs on twin motors and travels from 72 to 120 centimetres, moving between sitting and standing in about eleven seconds. Four memory positions on the panel mean you never hunt for your height again. The frame is rated to 120 kilograms.',
    },
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80',
    ],
    materials: {
      ka: 'ლამინირებული ზედაპირი, ელექტრო ამწე ფოლადის კარკასი',
      en: 'Laminate top, electric steel lifting frame',
    },
    dimensions: { width: 160, depth: 70, height: 120 },
    finishes: [
      { name: { ka: 'თეთრი', en: 'White' }, hex: '#EDE9E1' },
      { name: { ka: 'ღია მუხა', en: 'Light oak' }, hex: '#CBAE84' },
    ],
    availability: 'on-order',
    origin: { ka: 'გერმანია', en: 'Germany' },
    warrantyMonths: 60,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-volta-chair',
    slug: 'volta-office-chair',
    articleNumber: 'AT-OF-403',
    categorySlug: 'office',
    subcategorySlug: 'office-chairs',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'საოფისე სავარძელი "Volta"',
      en: 'Volta ergonomic chair',
    },
    shortDescription: {
      ka: 'ერგონომიული სავარძელი ბადისებრი ზურგით და წელის საყრდენით.',
      en: 'Ergonomic chair with a mesh back and adjustable lumbar support.',
    },
    description: {
      ka: 'Volta-ს ზურგი ბადისებრია, რაც ზაფხულში მნიშვნელობას იძენს — ზურგი არ ოფლიანდება რვასაათიანი დღის შემდეგაც. წელის საყრდენი სიმაღლეშიც და სიღრმეშიც რეგულირდება, სახელურები კი ოთხი მიმართულებით მოძრაობს. ჯვარედინი პოლირებული ალუმინისაა.',
      en: 'The Volta back is mesh, which starts to matter in summer — your back stays dry through an eight-hour day. The lumbar support adjusts in both height and depth, and the arms move in four directions. The base is polished aluminium.',
    },
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1400&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80',
    ],
    materials: {
      ka: 'ბადისებრი ზურგი, ქსოვილის ჯდომა, ალუმინის ჯვარედინი',
      en: 'Mesh back, fabric seat, aluminium base',
    },
    dimensions: { width: 62, depth: 62, height: 115 },
    finishes: [
      { name: { ka: 'შავი', en: 'Black' }, hex: '#1E1E1C' },
      { name: { ka: 'ნაცრისფერი', en: 'Grey' }, hex: '#8E8B85' },
    ],
    availability: 'in-stock',
    origin: { ka: 'გერმანია', en: 'Germany' },
    warrantyMonths: 60,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-folio-bookshelf',
    slug: 'folio-bookshelf',
    articleNumber: 'AT-OF-404',
    categorySlug: 'office',
    subcategorySlug: 'bookshelves',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'წიგნის თარო "Folio"',
      en: 'Folio bookshelf',
    },
    shortDescription: {
      ka: 'მაღალი მუხის თარო ხუთი დონით, კედელზე დასამაგრებელი.',
      en: 'Tall oak shelf with five levels, fixed to the wall.',
    },
    description: {
      ka: 'Folio ვიწროა და მაღალი — ის კედლის იმ ნაწილს იყენებს, რომელიც ჩვეულებრივ ცარიელი რჩება. თითოეული დონე 28 კილოგრამამდე დატვირთვას იტანს, რაც სამ რიგ წიგნზე მეტია. კომპლექტში შედის კედელზე დამაგრების ნაკრები — მაღალი თარო ყოველთვის უნდა დამაგრდეს.',
      en: 'Folio is narrow and tall — it uses the part of a wall that usually goes to waste. Each level carries up to 28 kilograms, which is more than three rows of books. A wall-fixing kit is included; a shelf this tall should always be anchored.',
    },
    images: [
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1400&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, კედელზე დასამაგრებელი კომპლექტი',
      en: 'Solid oak, wall-fixing kit included',
    },
    dimensions: { width: 80, depth: 32, height: 200 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
      { name: { ka: 'თეთრი', en: 'White' }, hex: '#EDE9E1' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland' },
    warrantyMonths: 36,
    isNew: false,
    isFeatured: false,
  },

  // ==========================================================================
  // DECOR & LIGHTING
  // ==========================================================================
  {
    id: 'prd-arca-lamp',
    slug: 'arca-floor-lamp',
    articleNumber: 'AT-DL-501',
    categorySlug: 'decor-lighting',
    subcategorySlug: 'floor-lamps',
    collectionSlug: 'atelier',
    name: {
      ka: 'იატაკის სანათი "Arca"',
      en: 'Arca floor lamp',
    },
    shortDescription: {
      ka: 'რკალისებრი სანათი მარმარილოს ფუძეზე, თითბრის დეტალებით.',
      en: 'Arc lamp on a marble base with brass detailing.',
    },
    description: {
      ka: 'Arca-ს რკალი 160 სანტიმეტრით გადმოდის, ამიტომ სანათი დივანს თავზე ადგება, თვითონ კი გვერდით დგას — კუთხის დაკავების გარეშე. მარმარილოს ფუძე მძიმეა განზრახ, რომ კონსტრუქცია მდგრადი იყოს. თავი ბრუნავს და შუქს იქით მიმართავს, სადაც კითხულობთ.',
      en: 'The Arca arc reaches 160 centimetres, so the shade hangs over the sofa while the base stands beside it, taking no corner of its own. The marble base is heavy on purpose, to keep the whole thing steady. The head swivels, so the light points at whatever you are reading.',
    },
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
    ],
    materials: {
      ka: 'თითბერი, მარმარილოს ფუძე, ქსოვილის კაბელი',
      en: 'Brass, marble base, fabric-covered cable',
    },
    dimensions: { width: 30, depth: 160, height: 180 },
    finishes: [
      { name: { ka: 'თითბერი', en: 'Brass' }, hex: '#C69B57' },
      { name: { ka: 'მატი შავი', en: 'Matt black' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 24,
    isNew: true,
    isFeatured: true,
  },

  {
    id: 'prd-luce-pendant',
    slug: 'luce-pendant-light',
    articleNumber: 'AT-DL-502',
    categorySlug: 'decor-lighting',
    subcategorySlug: 'pendant-lights',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'დასაკიდი სანათი "Luce"',
      en: 'Luce pendant light',
    },
    shortDescription: {
      ka: 'გუმბათისებრი სანათი ალუმინისგან, ორმეტრიანი კაბელით.',
      en: 'Spun aluminium dome on a two-metre fabric cord.',
    },
    description: {
      ka: 'Luce-ს გუმბათი შუქს ქვევით მიმართავს — ზუსტად ის, რაც სასადილო მაგიდას სჭირდება, თვალის ბრმა შუქის გარეშე. შიდა ზედაპირი თეთრად არის შეღებილი, რომ სინათლე თანაბრად გაიბნეს. ორმეტრიანი კაბელი მონტაჟისას სასურველ სიგრძეზე იჭრება.',
      en: 'The Luce dome throws its light straight down — which is what a dining table needs, without any of it reaching your eyes. The inside is painted white so the light spreads evenly rather than pooling. The two-metre cord is cut to length at installation.',
    },
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1400&q=80',
      'https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=1400&q=80',
    ],
    materials: {
      ka: 'ფხვნილსაღებავიანი ალუმინი, ქსოვილის კაბელი 200 სმ',
      en: 'Powder-coated aluminium, 200 cm fabric cord',
    },
    dimensions: { width: 40, depth: 40, height: 28 },
    finishes: [
      { name: { ka: 'თეთრი მატი', en: 'Matt white' }, hex: '#E8E4DC' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green' }, hex: '#35503F' },
      { name: { ka: 'თითბერი', en: 'Brass' }, hex: '#C69B57' },
    ],
    availability: 'in-stock',
    origin: { ka: 'დანია', en: 'Denmark' },
    warrantyMonths: 24,
    isNew: false,
    isFeatured: false,
  },

  {
    id: 'prd-vime-pendant',
    slug: 'vime-rattan-pendant',
    articleNumber: 'AT-DL-503',
    categorySlug: 'decor-lighting',
    subcategorySlug: 'pendant-lights',
    collectionSlug: '',
    name: {
      ka: 'დასაკიდი სანათი "Vime" — როტანგის',
      en: 'Vime rattan pendant',
    },
    shortDescription: {
      ka: 'ხელით ნაწნავი როტანგი, რომელიც შუქს კედელზე ხატავს.',
      en: 'Hand-woven rattan that draws the light across the wall.',
    },
    description: {
      ka: 'Vime-ს ღირებულება არა თვით სანათშია, არამედ იმ ჩრდილში, რომელსაც ის კედელზე აგდებს — ნაწნავი როტანგი შუქს ხაზებად ჭრის. ყოველი სანათი ხელით იწნება, ამიტომ ორი ერთნაირი არ არსებობს. მსუბუქია, ამიტომ სტანდარტული ჭერის სამაგრი საკმარისია.',
      en: 'The point of Vime is not the fixture but the shadow it throws — the woven rattan cuts the light into lines across the wall. Each shade is woven by hand, so no two are identical. It weighs very little, so a standard ceiling fixing is enough.',
    },
    images: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=80',
      'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1400&q=80',
    ],
    materials: {
      ka: 'ხელით ნაწნავი როტანგი, ლითონის კარკასი',
      en: 'Hand-woven rattan, steel frame',
    },
    dimensions: { width: 45, depth: 45, height: 40 },
    finishes: [
      { name: { ka: 'ბუნებრივი როტანგი', en: 'Natural rattan' }, hex: '#C3A06A' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პორტუგალია', en: 'Portugal' },
    warrantyMonths: 12,
    isNew: true,
    isFeatured: false,
  },

  {
    id: 'prd-specchio-mirror',
    slug: 'specchio-round-mirror',
    articleNumber: 'AT-DL-504',
    categorySlug: 'decor-lighting',
    subcategorySlug: 'mirrors',
    collectionSlug: 'arch-nordic',
    name: {
      ka: 'სარკე "Specchio" — მრგვალი',
      en: 'Specchio round mirror',
    },
    shortDescription: {
      ka: 'მრგვალი სარკე მუხის მასივის ჩარჩოში, 90 სმ დიამეტრით.',
      en: 'Round mirror in a solid oak frame, 90 cm across.',
    },
    description: {
      ka: 'ოთხმოცდაათსანტიმეტრიანი სარკე ვიწრო დერეფანს ან პატარა შესასვლელს ორჯერ დიდს აჩვენებს — ეს ყველაზე იაფი ხერხია სივრცის მოსაპოვებლად. ჩარჩო მუხის მასივისაა და ერთი ნაჭრისგან იხრება, ამიტომ შეერთება არ ჩანს. კომპლექტში შედის ფარული სამაგრი.',
      en: 'A ninety-centimetre mirror makes a narrow hallway or a small entrance read twice its size — it remains the cheapest way to gain a room. The frame is solid oak, steam-bent from a single length so no joint shows. A concealed wall fixing is included.',
    },
    images: [
      'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?w=1400&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივის ჩარჩო, 5 მმ სარკე, ფარული სამაგრი',
      en: 'Solid oak frame, 5 mm glass, concealed fixing',
    },
    dimensions: { width: 90, depth: 4, height: 90 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak' }, hex: '#C2A578' },
      { name: { ka: 'შავი', en: 'Black' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'საქართველო', en: 'Georgia' },
    warrantyMonths: 24,
    isNew: false,
    isFeatured: false,
  },

  // ==========================================================================
  // OUTDOOR
  // ==========================================================================
  {
    id: 'prd-riva-lounge',
    slug: 'riva-lounge-set',
    articleNumber: 'AT-OD-601',
    categorySlug: 'outdoor',
    subcategorySlug: 'lounge-sets',
    collectionSlug: 'terra',
    name: {
      ka: 'ტერასის კომპლექტი "Riva"',
      en: 'Riva lounge set',
    },
    shortDescription: {
      ka: 'ტიკის კომპლექტი დივნით, ორი სავარძლითა და მაგიდით.',
      en: 'Teak set with a sofa, two armchairs and a low table.',
    },
    description: {
      ka: 'ტიკი ერთადერთი ხეა, რომელსაც ღია ცის ქვეშ დატოვება უჭირს — მისი ბუნებრივი ზეთი წყალს იგერიებს დამუშავების გარეშეც. პირველი წლის შემდეგ ზედაპირი ვერცხლისფერ პატინას იძენს; თუ ოქროსფერი გირჩევნიათ, წელიწადში ერთხელ ზეთი საკმარისია. ბალიშები Sunbrella-ს ქსოვილისაა და მზეზე არ ხუნდება.',
      en: 'Teak is the one timber that does not mind being left outside — its own oils turn water away without any treatment. After the first year the surface takes on a silver patina; if you prefer the honey tone, one oiling a year holds it. The cushions are in Sunbrella fabric, which does not fade in sun.',
    },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1400&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80',
    ],
    materials: {
      ka: 'ტიკის მასივი, ამინდგამძლე ბალიშები Sunbrella',
      en: 'Solid teak, weather-resistant Sunbrella cushions',
    },
    dimensions: { width: 240, depth: 85, height: 70 },
    finishes: [
      { name: { ka: 'ბუნებრივი ტიკი', en: 'Natural teak' }, hex: '#B08D57' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand' }, hex: '#C7B9A3' },
    ],
    availability: 'on-order',
    origin: { ka: 'ინდონეზია', en: 'Indonesia' },
    warrantyMonths: 36,
    isNew: false,
    isFeatured: true,
  },

  {
    id: 'prd-sole-dining',
    slug: 'sole-outdoor-dining-set',
    articleNumber: 'AT-OD-602',
    categorySlug: 'outdoor',
    subcategorySlug: 'outdoor-dining',
    collectionSlug: '',
    name: {
      ka: 'ეზოს სასადილო ჯგუფი "Sole"',
      en: 'Sole outdoor dining set',
    },
    shortDescription: {
      ka: 'ალუმინის მაგიდა კერამიკული ზედაპირით და ექვსი სკამი.',
      en: 'Aluminium table with a ceramic top and six chairs.',
    },
    description: {
      ka: 'Sole-ს ზედაპირი კერამიკული ფილისაა — ის არც მზეზე ხუნდება და არც ღვინის ლაქას იღებს, რაც ეზოს მაგიდისთვის ორივე მნიშვნელოვანია. კარკასი ფხვნილსაღებავიანი ალუმინისაა, ამიტომ ზამთარშიც ჟანგი არ ემუქრება. სკამები ერთმანეთზე იწყობა და მცირე ადგილს იკავებს.',
      en: 'The Sole top is a ceramic slab — it neither fades in sun nor stains from wine, and an outdoor table needs both. The frame is powder-coated aluminium, so nothing rusts over a wet winter. The chairs stack, which matters when the terrace has to be cleared.',
    },
    images: [
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1400&q=80',
      'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1400&q=80',
    ],
    materials: {
      ka: 'ფხვნილსაღებავიანი ალუმინი, კერამიკული ზედაპირი',
      en: 'Powder-coated aluminium, ceramic top',
    },
    dimensions: { width: 200, depth: 100, height: 75 },
    finishes: [
      { name: { ka: 'ანტრაციტი', en: 'Anthracite' }, hex: '#3A3A3C' },
      { name: { ka: 'თეთრი', en: 'White' }, hex: '#E8E4DC' },
    ],
    availability: 'on-order',
    origin: { ka: 'იტალია', en: 'Italy' },
    warrantyMonths: 36,
    isNew: true,
    isFeatured: false,
  },
]
