import type { Product } from './types'

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
 *   5. Write `name`, `shortDescription` and `description` in ALL THREE
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

export const products: Product[] = [
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
      ru: 'Диван «Nord», 3-местный',
    },
    shortDescription: {
      ka: 'ხავერდის დივანი კაკლის ფეხებზე, აწეული კორპუსით.',
      en: 'Velvet sofa on slim walnut legs, lifted clear of the floor.',
      ru: 'Бархатный диван на тонких ореховых ножках, приподнятый над полом.',
    },
    description: {
      ka: 'Nord-ის კორპუსი განზრახ ვიწროა — დივანი ოთახს არ ავსებს, არამედ მას ხაზს უსვამს. ბალიშები შევსებულია ბუმბულისა და ქაფის ნაზავით, რაც ჯდომისას რბილობას იძლევა, დგომისას კი ფორმას ინარჩუნებს. კაკლის მასივის ფეხები კორპუსს იატაკიდან წყვეტს და ოთახს უფრო მსუბუქად აჩვენებს.',
      en: 'The Nord frame is deliberately narrow — it marks a room out rather than filling it. Cushions are filled with a feather and foam blend, soft to sit on but firm enough to hold their shape once you stand. Solid walnut legs lift the body clear of the floor, which makes the whole room read lighter.',
      ru: 'Корпус Nord намеренно узкий — диван не заполняет комнату, а очерчивает её. Подушки наполнены смесью пера и пены: мягкие при посадке, но достаточно упругие, чтобы держать форму, когда вы встаёте. Ножки из массива ореха отрывают корпус от пола, и комната кажется легче.',
    },
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80',
    ],
    materials: {
      ka: 'ხავერდი, მასივის კარკასი, კაკლის ფეხები',
      en: 'Velvet upholstery, solid timber frame, walnut legs',
      ru: 'Бархатная обивка, каркас из массива, ореховые ножки',
    },
    dimensions: { width: 220, depth: 92, height: 82 },
    finishes: [
      { name: { ka: 'ბოთლისფერი მწვანე', en: 'Bottle green', ru: 'Бутылочный зелёный' }, hex: '#2F4F43' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand', ru: 'Песочный' }, hex: '#C7B9A3' },
      { name: { ka: 'ღრმა ლურჯი', en: 'Deep blue', ru: 'Глубокий синий' }, hex: '#2B3A4A' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
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
      ru: 'Кожаный диван «Terra», 3-местный',
    },
    shortDescription: {
      ka: 'ანილინის ტყავი, რომელიც წლებთან ერთად ლამაზდება.',
      en: 'Aniline leather that improves rather than wears.',
      ru: 'Анилиновая кожа, которая с годами становится только лучше.',
    },
    description: {
      ka: 'Terra-ს ტყავი ანილინის შეღებვისაა — ის არ არის დაფარული პიგმენტის ფენით, ამიტომ ინარჩუნებს ბუნებრივ ტექსტურას და ხასიათს. პირველივე თვეებში ზედაპირი რბილდება, ხოლო წლების შემდეგ ჩნდება პატინა, რომელიც ორ ერთნაირ დივანს ერთმანეთისგან განასხვავებს. კარკასი მუხის მასივისაა და ხელით არის შეწებებული.',
      en: 'Terra is upholstered in aniline leather — no pigment layer sits on top of it, so the grain and the character of the hide stay visible. The surface softens within the first months, and after a few years a patina appears that no two sofas share. The frame is solid oak, joined by hand.',
      ru: 'Terra обита анилиновой кожей — поверх неё нет пигментного слоя, поэтому фактура и характер кожи остаются видимыми. Поверхность смягчается уже за первые месяцы, а через несколько лет появляется патина, которая у двух одинаковых диванов никогда не совпадёт. Каркас — массив дуба, собранный вручную.',
    },
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=80',
    ],
    materials: {
      ka: 'ანილინის ტყავი, მუხის მასივის კარკასი და ფეხები',
      en: 'Aniline leather, solid oak frame and legs',
      ru: 'Анилиновая кожа, каркас и ножки из массива дуба',
    },
    dimensions: { width: 218, depth: 94, height: 80 },
    finishes: [
      { name: { ka: 'კონიაკისფერი', en: 'Cognac', ru: 'Коньячный' }, hex: '#A9713F' },
      { name: { ka: 'შოკოლადისფერი', en: 'Chocolate', ru: 'Шоколадный' }, hex: '#4A342A' },
      { name: { ka: 'ქარამელი', en: 'Caramel', ru: 'Карамельный' }, hex: '#C08A4E' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
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
      ru: 'Угловой диван «Alba»',
    },
    shortDescription: {
      ka: 'მოდულური კუთხის დივანი მოსახსნელი ჩასაფენებით.',
      en: 'Modular corner sofa with removable, washable covers.',
      ru: 'Модульный угловой диван со съёмными чехлами.',
    },
    description: {
      ka: 'Alba იყიდება მოდულებად, ამიტომ კუთხე შეიძლება მარცხნივ ან მარჯვნივ განთავსდეს — გადაწყვეტილება მიტანამდე შეიცვლება. ყველა ჩასაფენი იხსნება და ირეცხება 30 გრადუსზე, რაც ბავშვიან ან ცხოველიან სახლში მთავარი არგუმენტია. შალის ქსოვილს დამატებული აქვს ლაქებისადმი მდგრადი დამუშავება.',
      en: 'Alba is sold as modules, so the corner can sit on the left or the right — the decision can change right up to delivery. Every cover unzips and washes at 30 degrees, which tends to be the deciding argument in a house with children or animals. The wool blend carries a stain-resistant finish.',
      ru: 'Alba продаётся модулями, поэтому угол можно расположить слева или справа — решение можно поменять вплоть до доставки. Все чехлы снимаются и стираются при 30 градусах, что обычно и решает дело в доме с детьми или животными. Шерстяная ткань имеет грязеотталкивающую пропитку.',
    },
    images: [
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1400&q=80',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1400&q=80',
    ],
    materials: {
      ka: 'შალის ნაზავის ქსოვილი, მასივის კარკასი, მოსახსნელი ჩასაფენები',
      en: 'Wool-blend upholstery, solid timber frame, removable covers',
      ru: 'Ткань из смеси шерсти, каркас из массива, съёмные чехлы',
    },
    dimensions: { width: 290, depth: 180, height: 78 },
    finishes: [
      { name: { ka: 'გრაფიტისფერი', en: 'Graphite', ru: 'Графитовый' }, hex: '#4A4A48' },
      { name: { ka: 'ღია ნაცრისფერი', en: 'Light grey', ru: 'Светло-серый' }, hex: '#9A9A94' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand', ru: 'Песочный' }, hex: '#BFB2A0' },
    ],
    availability: 'on-order',
    origin: { ka: 'პოლონეთი', en: 'Poland', ru: 'Польша' },
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
      ru: 'Кресло «Lume»',
    },
    shortDescription: {
      ka: 'ღრმად გაკერილი ხავერდის სავარძელი წიფლის ფეხებზე.',
      en: 'Deep-buttoned velvet armchair on turned beech legs.',
      ru: 'Кресло с глубокой стёжкой из бархата на точёных буковых ножках.',
    },
    description: {
      ka: 'Lume საკმარისად პატარაა, რომ ვიწრო ოთახშიც მოთავსდეს, და საკმარისად ღრმა, რომ საღამო მასში გაატაროთ. ზურგის გაკერვა ხელით სრულდება — თითოეულ ღილაკს ოსტატი ცალკე ამაგრებს. ფეხები შავად შეღებილი წიფლისაა, რაც კონტრასტს ქმნის ღია ტონის ქსოვილებთან.',
      en: 'Lume is small enough for a narrow room and deep enough to spend an evening in. The buttoning on the back is done by hand, each one pulled and fixed separately. The legs are in blackened beech, which gives the lighter fabrics something to sit against.',
      ru: 'Lume достаточно компактно для узкой комнаты и достаточно глубоко, чтобы провести в нём вечер. Стёжка на спинке выполняется вручную — каждая пуговица притягивается и крепится отдельно. Ножки из чернёного бука дают контраст светлым тканям.',
    },
    images: [
      'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1400&q=80',
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1400&q=80',
    ],
    materials: {
      ka: 'ხავერდი, შავად შეღებილი წიფლის ფეხები',
      en: 'Velvet upholstery, blackened beech legs',
      ru: 'Бархатная обивка, ножки из чернёного бука',
    },
    dimensions: { width: 72, depth: 78, height: 86 },
    finishes: [
      { name: { ka: 'მდოგვისფერი', en: 'Mustard', ru: 'Горчичный' }, hex: '#C8952F' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green', ru: 'Тёмно-зелёный' }, hex: '#35503F' },
      { name: { ka: 'ტერაკოტა', en: 'Terracotta', ru: 'Терракотовый' }, hex: '#A65A3C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პორტუგალია', en: 'Portugal', ru: 'Португалия' },
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
      ru: 'Журнальный стол «Orbit»',
    },
    shortDescription: {
      ka: 'მრგვალი კაკლის მაგიდა ერთ ცენტრალურ ფეხზე.',
      en: 'Round walnut table on a single centre column.',
      ru: 'Круглый ореховый стол на одной центральной опоре.',
    },
    description: {
      ka: 'ერთი ცენტრალური ფეხი ნიშნავს, რომ მაგიდის გარშემო ფეხების გადადგმა თავისუფლად შეიძლება — მცირე ოთახში ეს განსხვავებას ქმნის. ზედაპირი კაკლის მასივისაა და ზეთით არის დამუშავებული, ამიტომ ზედაპირული ნაკაწრი ადგილზევე გამოსწორდება. ყოველი მაგიდის ხის ნახატი უნიკალურია.',
      en: 'A single centre column means you can put your feet anywhere around it — in a small room that matters more than it sounds. The top is solid walnut finished in oil, so a surface scratch can be dealt with in place rather than sent away. No two tops carry the same grain.',
      ru: 'Одна центральная опора означает, что ноги можно поставить с любой стороны — в маленькой комнате это важнее, чем кажется. Столешница из массива ореха покрыта маслом, поэтому поверхностную царапину можно устранить на месте. Рисунок древесины у каждого стола свой.',
    },
    images: [
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1400&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80',
    ],
    materials: {
      ka: 'კაკლის მასივი, ზეთით დამუშავებული',
      en: 'Solid walnut, oil finish',
      ru: 'Массив ореха, масляное покрытие',
    },
    dimensions: { width: 90, depth: 90, height: 38 },
    finishes: [
      { name: { ka: 'კაკალი', en: 'Walnut', ru: 'Орех' }, hex: '#6B4A32' },
      { name: { ka: 'ღია მუხა', en: 'Light oak', ru: 'Светлый дуб' }, hex: '#C0A075' },
    ],
    availability: 'in-stock',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'ТВ-тумба «Linea»',
    },
    shortDescription: {
      ka: 'დაბალი კონსოლი შებოლილი მუხის შპონით და კაბელის არხით.',
      en: 'Low console in smoked oak with a hidden cable channel.',
      ru: 'Низкая тумба из копчёного дуба со скрытым кабель-каналом.',
    },
    description: {
      ka: 'Linea-ს უკანა კედელში გატარებულია კაბელის არხი, ამიტომ მავთულები არ ჩანს — ეს ის დეტალია, რომელიც სუფთა კედელსა და არეულ კუთხეს შორის განსხვავებას ქმნის. ორი უჯრა რბილად იხურება. კონსოლი შეიძლება იატაკზე დაიდგას ან კედელზე დამაგრდეს.',
      en: 'Linea has a cable channel run through the back panel, so nothing hangs in view — it is the detail that separates a clean wall from a cluttered corner. The two drawers close on a soft-close runner. The console can stand on the floor or be fixed to the wall.',
      ru: 'В задней стенке Linea проложен кабель-канал, поэтому провода не видны — именно эта деталь отличает чистую стену от захламлённого угла. Два ящика закрываются доводчиками. Тумбу можно поставить на пол или закрепить на стене.',
    },
    images: [
      'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1400&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1400&q=80',
    ],
    materials: {
      ka: 'შებოლილი მუხის შპონი, ფხვნილსაღებავიანი ლითონის კარკასი',
      en: 'Smoked oak veneer, powder-coated steel frame',
      ru: 'Шпон копчёного дуба, каркас из стали с порошковым покрытием',
    },
    dimensions: { width: 180, depth: 42, height: 46 },
    finishes: [
      { name: { ka: 'შებოლილი მუხა', en: 'Smoked oak', ru: 'Копчёный дуб' }, hex: '#5A4636' },
      { name: { ka: 'მატი შავი', en: 'Matt black', ru: 'Матовый чёрный' }, hex: '#1E1E1C' },
    ],
    availability: 'on-order',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Двуспальная кровать «Alazani»',
    },
    shortDescription: {
      ka: 'მუხის მასივის საწოლი დაბალი კარკასით, 160×200 ლეიბისთვის.',
      en: 'Solid oak platform bed with a low frame, for a 160×200 mattress.',
      ru: 'Кровать-платформа из массива дуба с низким каркасом, под матрас 160×200.',
    },
    description: {
      ka: 'Alazani-ს კარკასი დაბალია და ოთახს ვიზუალურად მაღალს ტოვებს — ეს ხერხი განსაკუთრებით კარგად მუშაობს იმ საძინებლებში, სადაც ჭერი დაბალია. მუხის მასივი ზეთით არის დამუშავებული და დროთა განმავლობაში თბილ ტონს იძენს. ლამელური საფუძველი კომპლექტში შედის.',
      en: 'The Alazani frame sits low, which leaves the room reading taller than it is — a trick that pays off most in bedrooms with a low ceiling. The solid oak is oil-finished and warms in tone over the years. The slatted base is included.',
      ru: 'Каркас Alazani расположен низко, из-за чего комната кажется выше — приём, который лучше всего работает в спальнях с низким потолком. Массив дуба покрыт маслом и с годами приобретает более тёплый тон. Реечное основание входит в комплект.',
    },
    images: [
      'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?w=1400&q=80',
      'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, ზეთით დამუშავებული, ლამელური საფუძველი',
      en: 'Solid oak with an oil finish, slatted base',
      ru: 'Массив дуба с масляным покрытием, реечное основание',
    },
    dimensions: { width: 186, depth: 212, height: 105 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
      { name: { ka: 'თაფლისფერი მუხა', en: 'Honey oak', ru: 'Медовый дуб' }, hex: '#A67C4A' },
    ],
    availability: 'on-order',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Мягкая кровать «Vela»',
    },
    shortDescription: {
      ka: 'მაღალი რბილი თავი ვერტიკალური ხაზებით, თითბრის ფეხები.',
      en: 'Tall channelled headboard with slim brass feet.',
      ru: 'Высокое стёганое изголовье с вертикальными линиями на латунных ножках.',
    },
    description: {
      ka: 'Vela-ს თავი 120 სანტიმეტრზე მაღლდება და საწოლს ოთახის ცენტრად აქცევს — წასაკითხადაც საკმარისად რბილია. ვერტიკალური ხაზები ხელით არის ჩამოყალიბებული, ერთმანეთისგან თანაბარ მანძილზე. თითბრის ფეხები ერთადერთი ბზინვარე ელემენტია მთელ ნაწარმში.',
      en: 'The Vela headboard rises to 120 centimetres and turns the bed into the centre of the room — soft enough to read against, too. The vertical channels are formed by hand and set at an even pitch. The brass feet are the only bright element on the whole piece.',
      ru: 'Изголовье Vela поднимается на 120 сантиметров и превращает кровать в центр комнаты — при этом достаточно мягкое, чтобы к нему прислониться с книгой. Вертикальные линии формируются вручную с равным шагом. Латунные ножки — единственный блестящий элемент во всём изделии.',
    },
    images: [
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1400&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=80',
    ],
    materials: {
      ka: 'ბუკლე ქსოვილი, მასივის კარკასი, თითბრის ფეხები',
      en: 'Bouclé upholstery, solid timber frame, brass feet',
      ru: 'Обивка букле, каркас из массива, латунные ножки',
    },
    dimensions: { width: 176, depth: 215, height: 120 },
    finishes: [
      { name: { ka: 'ანტრაციტი', en: 'Anthracite', ru: 'Антрацит' }, hex: '#3A3A3C' },
      { name: { ka: 'ნაცრისფერი ბუკლე', en: 'Grey bouclé', ru: 'Серое букле' }, hex: '#A7A29A' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand', ru: 'Песочный' }, hex: '#C9BCA8' },
    ],
    availability: 'on-order',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
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
      ru: 'Двухдверный шкаф «Kura»',
    },
    shortDescription: {
      ka: 'ორკარიანი გარდერობი, სიმაღლე და შიდა წყობა შეკვეთით.',
      en: 'Two-door wardrobe, built to your ceiling and your interior layout.',
      ru: 'Двухдверный шкаф — высота и внутренняя компоновка по заказу.',
    },
    description: {
      ka: 'Kura იზომება ადგილზე — სიმაღლე ჭერამდე მიდის, რომ ზემოთ მტვრის შესაგროვებელი ღრიჭო არ დარჩეს. შიდა წყობა თქვენი გადასაწყვეტია: შტანგები, თაროები და უჯრები ნებისმიერი კომბინაციით. კარები რბილად იხურება და სახელურის გარეშეც იღება.',
      en: 'Kura is measured on site — the height runs to the ceiling so no dust gap is left along the top. The interior is yours to decide: hanging rails, shelves and drawers in any combination. The doors are soft-close and open on a push catch, with no handle needed.',
      ru: 'Kura обмеряется на месте — высота доходит до потолка, чтобы сверху не оставался пылесборный зазор. Внутреннее наполнение выбираете вы: штанги, полки и ящики в любом сочетании. Двери с доводчиками открываются нажатием, ручка не нужна.',
    },
    images: [
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1400&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის შპონი MDF-ზე, რბილად დამხურავი ანჯამები',
      en: 'Oak veneer on MDF, soft-close hinges',
      ru: 'Дубовый шпон на МДФ, петли с доводчиком',
    },
    dimensions: { width: 120, depth: 60, height: 210 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#B98F5E' },
      { name: { ka: 'თეთრი მატი', en: 'Matt white', ru: 'Матовый белый' }, hex: '#E8E4DC' },
    ],
    availability: 'custom',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Прикроватная тумба «Mira»',
    },
    shortDescription: {
      ka: 'პატარა მუხის მაგიდა ერთი უჯრით და ღია თაროთი.',
      en: 'Small oak nightstand with one drawer and an open shelf.',
      ru: 'Компактная дубовая тумба с одним ящиком и открытой полкой.',
    },
    description: {
      ka: 'Mira განზრახ ვიწროა — საწოლის გვერდით ის ადგილს არ იჭერს, მაგრამ წიგნს, სათვალესა და ჭიქა წყალს იტევს. ღია თარო უჯრის ქვეშ იმისთვისაა, რომ დაწყებული წიგნი ხელთ იყოს. ფეხები ოდნავ დახრილია, რაც მთელ ნაწარმს სიმსუბუქეს მატებს.',
      en: 'Mira is deliberately narrow — it takes up almost nothing beside a bed, but still holds a book, a pair of glasses and a glass of water. The open shelf below the drawer is there for whatever you are halfway through. The legs splay very slightly, which keeps the whole thing from looking heavy.',
      ru: 'Mira намеренно узкая — рядом с кроватью она почти не занимает места, но вмещает книгу, очки и стакан воды. Открытая полка под ящиком — для того, что вы читаете сейчас. Ножки чуть разведены, и тумба не выглядит тяжёлой.',
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, ერთი უჯრა რბილი მექანიზმით',
      en: 'Solid oak, one soft-close drawer',
      ru: 'Массив дуба, один ящик с доводчиком',
    },
    dimensions: { width: 45, depth: 38, height: 52 },
    finishes: [
      { name: { ka: 'ღია მუხა', en: 'Light oak', ru: 'Светлый дуб' }, hex: '#CBAE84' },
      { name: { ka: 'თეთრი', en: 'White', ru: 'Белый' }, hex: '#EDE9E1' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland', ru: 'Польша' },
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
      ru: 'Комод «Rioni» на шесть ящиков',
    },
    shortDescription: {
      ka: 'კაკლის კომოდი ექვსი უჯრით და თითბრის სახელურებით.',
      en: 'Walnut dresser with six drawers and solid brass pulls.',
      ru: 'Ореховый комод с шестью ящиками и латунными ручками.',
    },
    description: {
      ka: 'Rioni-ს უჯრები ტრადიციული "მერცხლის კუდის" შეერთებით არის აწყობილი — ეს კვანძი უფრო დიდხანს ძლებს, ვიდრე ნებისმიერი ხრახნი. სახელურები მასიური თითბრისაა და დროთა განმავლობაში იმ ადგილებში ბზინავს, სადაც ხელი ეხება. ზედაპირი საკმარისად ფართოა სარკისა და ორი სანათისთვის.',
      en: 'The Rioni drawers are assembled with traditional dovetail joints — a joint that outlasts any screw. The pulls are solid brass and, over time, polish themselves where hands land most. The top is wide enough for a mirror and a pair of lamps.',
      ru: 'Ящики Rioni собраны на традиционный шип «ласточкин хвост» — соединение, которое переживёт любой шуруп. Ручки из массивной латуни со временем полируются там, где к ним чаще прикасаются. Столешница достаточно широка для зеркала и пары светильников.',
    },
    images: [
      'https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=1400&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1400&q=80',
    ],
    materials: {
      ka: 'კაკლის მასივი და შპონი, თითბრის სახელურები',
      en: 'Solid walnut and veneer, solid brass pulls',
      ru: 'Массив и шпон ореха, латунные ручки',
    },
    dimensions: { width: 140, depth: 45, height: 80 },
    finishes: [
      { name: { ka: 'კაკალი', en: 'Walnut', ru: 'Орех' }, hex: '#6B4A32' },
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
    ],
    availability: 'on-order',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
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
      ru: 'Круглый обеденный стол «Mtkvari»',
    },
    shortDescription: {
      ka: 'მრგვალი კაკლის მაგიდა ოთხიდან ექვს სტუმრამდე.',
      en: 'Round walnut table seating four to six.',
      ru: 'Круглый ореховый стол на четыре — шесть персон.',
    },
    description: {
      ka: 'მრგვალ მაგიდას სათავე არ აქვს — სწორედ ამიტომ საუბარი მასთან სხვანაირად მიდის. 130 სანტიმეტრი ოთხს კომფორტულად, ექვსს კი მჭიდროდ და მხიარულად იტევს. ცენტრალური ფეხი ნიშნავს, რომ სკამის ადგილი ფეხმა არ უნდა განსაზღვროს.',
      en: 'A round table has no head, which is exactly why conversation runs differently across one. At 130 centimetres it seats four in comfort and six in the cheerful, close way. The centre column means no leg dictates where a chair can go.',
      ru: 'У круглого стола нет во главы — именно поэтому разговор за ним идёт иначе. При диаметре 130 сантиметров за ним свободно помещаются четверо, а вшестером — тесно и весело. Центральная опора означает, что ножка не диктует, где поставить стул.',
    },
    images: [
      'https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80',
    ],
    materials: {
      ka: 'კაკლის მასივი, ცენტრალური ფეხი, ზეთით დამუშავებული',
      en: 'Solid walnut, centre column, oil finish',
      ru: 'Массив ореха, центральная опора, масляное покрытие',
    },
    dimensions: { width: 130, depth: 130, height: 75 },
    finishes: [
      { name: { ka: 'კაკალი', en: 'Walnut', ru: 'Орех' }, hex: '#6B4A32' },
      { name: { ka: 'შებოლილი მუხა', en: 'Smoked oak', ru: 'Копчёный дуб' }, hex: '#5A4636' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
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
      ru: 'Раздвижной обеденный стол «Plana»',
    },
    shortDescription: {
      ka: 'მუხის მაგიდა, რომელიც 180-დან 240 სანტიმეტრამდე იშლება.',
      en: 'Oak table that runs from 180 to 240 centimetres.',
      ru: 'Дубовый стол, раздвигающийся со 180 до 240 сантиметров.',
    },
    description: {
      ka: 'Plana ჩვეულებრივ დღეებში ექვსს იტევს, სტუმრებთან ერთად კი ათს. გასაშლელი მექანიზმი ერთი ხელით მუშაობს — დამატებითი ფურცელი მაგიდის შიგნით ინახება და ცალკე გატანა არ სჭირდება. მუხის მასივი ლაქის ნაცვლად მატი ზეთით არის დამუშავებული.',
      en: 'Plana seats six on an ordinary evening and ten when the family arrives. The extension works one-handed — the extra leaf is stored inside the table, so nothing has to be fetched from another room. The solid oak is finished in matt oil rather than lacquer.',
      ru: 'В обычный вечер за Plana помещаются шестеро, а с гостями — десять. Механизм раскладывается одной рукой: дополнительная вставка хранится внутри стола, её не нужно нести из другой комнаты. Массив дуба покрыт матовым маслом, а не лаком.',
    },
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, გასაშლელი მექანიზმი 240 სმ-მდე',
      en: 'Solid oak, extension mechanism to 240 cm',
      ru: 'Массив дуба, механизм раздвижения до 240 см',
    },
    dimensions: { width: 180, depth: 90, height: 75 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
      { name: { ka: 'თეთრი ზეთი', en: 'White oil', ru: 'Белое масло' }, hex: '#DCD3C4' },
    ],
    availability: 'on-order',
    origin: { ka: 'პოლონეთი', en: 'Poland', ru: 'Польша' },
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
      ru: 'Обеденный стул «Sella»',
    },
    shortDescription: {
      ka: 'რბილი სკამი მუხის ფეხებზე, დაბალი სახელურებით.',
      en: 'Upholstered chair on oak legs with low, rounded arms.',
      ru: 'Мягкий стул на дубовых ножках с низкими округлыми подлокотниками.',
    },
    description: {
      ka: 'Sella-ს სახელურები განზრახ დაბალია, რომ სკამი მაგიდის ქვეშ ბოლომდე შევიდეს — ეს პატარა დეტალი ვიწრო სასადილოში ბევრს ნიშნავს. ზურგი ოდნავ უკან იხრება, ამიტომ სადილის შემდეგ ადგომა არ გინდებათ. ქსოვილი მოსახსნელია და ცალკე შეიძლება შეიცვალოს.',
      en: 'The Sella arms are kept deliberately low so the chair slides fully under the table — a small thing that matters in a narrow dining room. The back leans just enough that nobody gets up straight after dinner. The cover is removable and can be replaced on its own.',
      ru: 'Подлокотники Sella намеренно низкие, чтобы стул полностью задвигался под стол, — мелочь, которая важна в узкой столовой. Спинка отклонена ровно настолько, чтобы после ужина не хотелось вставать. Чехол съёмный и заменяется отдельно.',
    },
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1400&q=80',
      'https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80',
    ],
    materials: {
      ka: 'შალის ქსოვილი, მუხის მასივის ფეხები',
      en: 'Wool upholstery, solid oak legs',
      ru: 'Шерстяная обивка, ножки из массива дуба',
    },
    dimensions: { width: 52, depth: 55, height: 82 },
    finishes: [
      { name: { ka: 'ნაცრისფერი მელანჟი', en: 'Grey melange', ru: 'Серый меланж' }, hex: '#8E8B85' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green', ru: 'Тёмно-зелёный' }, hex: '#35503F' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand', ru: 'Песочный' }, hex: '#C7B9A3' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland', ru: 'Польша' },
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
      ru: 'Барный стул «Alto»',
    },
    shortDescription: {
      ka: 'წიფლის მასივის სკამი 75 სმ სიმაღლეზე, ფეხის საყრდენით.',
      en: 'Solid beech stool at 75 cm with a footrest.',
      ru: 'Стул из массива бука высотой 75 см с подножкой.',
    },
    description: {
      ka: 'Alto-ს ჯდომის სიმაღლე 75 სანტიმეტრია, რაც სტანდარტულ 90-სანტიმეტრიან კუნძულს ზუსტად ერგება. ფეხის საყრდენი საკმარისად განიერია, რომ დიდხანს ჯდომისას ფეხი არ დაიღალოს. მასივი წიფლისაა და ზეთით არის დამუშავებული, ამიტომ სველი ხელი კვალს არ ტოვებს.',
      en: 'Alto sits at 75 centimetres, which is the height that actually works against a standard 90-centimetre island. The footrest is wide enough that your feet do not tire over a long conversation. The solid beech is oil-finished, so a wet hand leaves no mark.',
      ru: 'Высота сиденья Alto — 75 сантиметров, ровно та, что подходит к стандартному острову высотой 90 сантиметров. Подножка достаточно широкая, чтобы ноги не уставали за долгим разговором. Массив бука покрыт маслом, поэтому мокрая рука не оставляет следов.',
    },
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&q=80',
    ],
    materials: {
      ka: 'წიფლის მასივი, ზეთით დამუშავებული',
      en: 'Solid beech, oil finish',
      ru: 'Массив бука, масляное покрытие',
    },
    dimensions: { width: 40, depth: 40, height: 75 },
    finishes: [
      { name: { ka: 'თეთრი', en: 'White', ru: 'Белый' }, hex: '#EDE9E1' },
      { name: { ka: 'ბუნებრივი წიფელი', en: 'Natural beech', ru: 'Натуральный бук' }, hex: '#D2B48C' },
      { name: { ka: 'შავი', en: 'Black', ru: 'Чёрный' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პორტუგალია', en: 'Portugal', ru: 'Португалия' },
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
      ru: 'Кухонный гарнитур «Grafito»',
    },
    shortDescription: {
      ka: 'მატი გრაფიტისფერი ფასადები კვარცის ზედაპირით, ინდივიდუალური ზომებით.',
      en: 'Matt graphite fronts with a quartz worktop, built to measure.',
      ru: 'Матовые графитовые фасады с кварцевой столешницей, по индивидуальным размерам.',
    },
    description: {
      ka: 'Grafito იზომება და იგეგმება თქვენს სამზარეულოში, არა კატალოგში — ყოველი კორპუსი კონკრეტულ კედელს ერგება. მატი საღებავი თითის ანაბეჭდს არ იჭერს, რაც მუქ ფასადებზე მთავარი პრაქტიკული საკითხია. კვარცის ზედაპირი უფრო მდგრადია, ვიდრე მარმარილო, და მჟავე ლაქებს არ იღებს.',
      en: 'Grafito is measured and drawn in your kitchen rather than in a catalogue — every carcass is cut to a particular wall. The matt paint does not hold fingerprints, which is the practical question with any dark front. The quartz worktop is harder than marble and will not stain from anything acidic.',
      ru: 'Grafito обмеряется и проектируется в вашей кухне, а не по каталогу: каждый корпус подгоняется под конкретную стену. Матовая краска не удерживает отпечатки — главный практический вопрос для любых тёмных фасадов. Кварцевая столешница твёрже мрамора и не боится кислот.',
    },
    images: [
      'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=1400&q=80',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1400&q=80',
    ],
    materials: {
      ka: 'ფრეზერული MDF მატი საღებავით, კვარცის ზედაპირი',
      en: 'Routed MDF in matt lacquer, quartz worktop',
      ru: 'Фрезерованный МДФ в матовой краске, кварцевая столешница',
    },
    dimensions: { width: 360, depth: 62, height: 220 },
    finishes: [
      { name: { ka: 'გრაფიტი', en: 'Graphite', ru: 'Графит' }, hex: '#3C3F41' },
      { name: { ka: 'თეთრი მატი', en: 'Matt white', ru: 'Матовый белый' }, hex: '#E8E4DC' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green', ru: 'Тёмно-зелёный' }, hex: '#35503F' },
    ],
    availability: 'custom',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Кухонный остров «Isola»',
    },
    shortDescription: {
      ka: 'კუნძული კვარცის ზედაპირით, საცავით და ბარის კიდით.',
      en: 'Island with a quartz top, deep storage and a breakfast overhang.',
      ru: 'Остров с кварцевой столешницей, вместительным хранением и барным свесом.',
    },
    description: {
      ka: 'Isola-ს ზედაპირი ერთი მხრიდან 30 სანტიმეტრით გამოდის — სწორედ იმდენით, რომ ორი ბარის სკამი კომფორტულად მოთავსდეს. მეორე მხარეს ღრმა უჯრები და თაროებია, სადაც ქვაბები დგომითი წყობით ინახება. ზედაპირი ერთიანი ფილისაა, ნაკერის გარეშე.',
      en: 'The Isola top overhangs by 30 centimetres on one side — exactly enough for two bar stools to sit under comfortably. The other side carries deep drawers and shelves where pans are stored standing rather than stacked. The worktop is a single slab with no visible seam.',
      ru: 'Столешница Isola выступает с одной стороны на 30 сантиметров — ровно столько, чтобы под неё удобно встали два барных стула. С другой стороны — глубокие ящики и полки, где кастрюли стоят, а не составлены стопкой. Столешница — единая плита без видимого шва.',
    },
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=80',
    ],
    materials: {
      ka: 'კვარცის ზედაპირი, მუხის შპონი, ინტეგრირებული საცავი',
      en: 'Quartz worktop, oak veneer, integrated storage',
      ru: 'Кварцевая столешница, дубовый шпон, встроенное хранение',
    },
    dimensions: { width: 200, depth: 95, height: 92 },
    finishes: [
      { name: { ka: 'თეთრი კვარცი', en: 'White quartz', ru: 'Белый кварц' }, hex: '#E5E1D8' },
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
    ],
    availability: 'custom',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Буфет «Iveria»',
    },
    shortDescription: {
      ka: 'დაბალი ბუფეტი სამი კარით და რეგულირებადი თაროებით.',
      en: 'Low sideboard with three doors and adjustable shelves.',
      ru: 'Низкий буфет с тремя дверцами и переставными полками.',
    },
    description: {
      ka: 'Iveria სასადილო ოთახის სამუშაო ცხენია — შიგნით ჩამოეტევა სადღესასწაულო სერვიზი, ზემოთ კი ადგილი რჩება ლამპისა და ვაზისთვის. თაროები რეგულირდება, ამიტომ მაღალი ჭურჭელიც თავსდება. თითბრის სახელურები ხელით არის გაპრიალებული.',
      en: 'Iveria is the working horse of a dining room — the good service fits inside and the top is left free for a lamp and a vase. The shelves are adjustable, so tall glassware fits as easily as plates. The brass pulls are hand-polished.',
      ru: 'Iveria — рабочая лошадка столовой: внутрь помещается парадный сервиз, а верх остаётся свободным для лампы и вазы. Полки переставляются, поэтому высокие бокалы встают так же легко, как тарелки. Латунные ручки отполированы вручную.',
    },
    images: [
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი და შპონი, თითბრის სახელურები',
      en: 'Solid oak and veneer, brass pulls',
      ru: 'Массив и шпон дуба, латунные ручки',
    },
    dimensions: { width: 165, depth: 45, height: 75 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green', ru: 'Тёмно-зелёный' }, hex: '#35503F' },
      { name: { ka: 'თიხისფერი', en: 'Clay', ru: 'Глиняный' }, hex: '#9C8C74' },
    ],
    availability: 'on-order',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Письменный стол «Arco»',
    },
    shortDescription: {
      ka: 'მუხის მაგიდა ორი უჯრით და კაბელის ფარული არხით.',
      en: 'Oak desk with two drawers and a concealed cable tray.',
      ru: 'Дубовый стол с двумя ящиками и скрытым лотком для кабелей.',
    },
    description: {
      ka: 'Arco-ს უკან, ზედაპირის ქვეშ, ჩამონტაჟებულია კაბელის ლანგარი — დამტენები და მავთულები იქ ინახება და მაგიდაზე არ ჩანს. ორი ვიწრო უჯრა საკმარისია ყოველდღიური წვრილმანისთვის. სიღრმე 60 სანტიმეტრია, რაც მონიტორისთვის სწორ დისტანციას იძლევა.',
      en: 'A cable tray is fitted under the rear edge of Arco, so chargers and leads live there instead of on the surface. Two shallow drawers hold the everyday clutter. The 60-centimetre depth puts a monitor at the distance your eyes actually want.',
      ru: 'Под задней кромкой Arco установлен лоток для кабелей — зарядки и провода живут там, а не на столешнице. Два неглубоких ящика вмещают повседневную мелочь. Глубина 60 сантиметров ставит монитор на то расстояние, которое действительно нужно глазам.',
    },
    images: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1400&q=80',
      'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, ფხვნილსაღებავიანი ლითონის ფეხები, ორი უჯრა',
      en: 'Solid oak, powder-coated steel legs, two drawers',
      ru: 'Массив дуба, стальные ножки с порошковым покрытием, два ящика',
    },
    dimensions: { width: 140, depth: 60, height: 75 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
      { name: { ka: 'მატი შავი', en: 'Matt black', ru: 'Матовый чёрный' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland', ru: 'Польша' },
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
      ru: 'Стол «Studio» с регулировкой высоты',
    },
    shortDescription: {
      ka: 'ელექტრო ამწე მაგიდა 72-დან 120 სანტიმეტრამდე.',
      en: 'Electric sit-stand desk, 72 to 120 centimetres.',
      ru: 'Стол с электроприводом, от 72 до 120 сантиметров.',
    },
    description: {
      ka: 'Studio ორი ძრავით მუშაობს და სიმაღლეს 72-დან 120 სანტიმეტრამდე ცვლის — ჯდომიდან დგომაზე გადასვლა თერთმეტ წამში ხდება. პანელზე ოთხი მეხსიერების ღილაკია, ამიტომ საყვარელი სიმაღლის ხელახლა მოძებნა არ სჭირდება. კარკასი 120 კილოგრამამდე დატვირთვას უძლებს.',
      en: 'Studio runs on twin motors and travels from 72 to 120 centimetres, moving between sitting and standing in about eleven seconds. Four memory positions on the panel mean you never hunt for your height again. The frame is rated to 120 kilograms.',
      ru: 'Studio работает на двух моторах и перемещается с 72 до 120 сантиметров — переход от сидя к стоя занимает около одиннадцати секунд. Четыре позиции памяти на панели избавляют от поиска своей высоты. Каркас рассчитан на 120 килограммов.',
    },
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80',
    ],
    materials: {
      ka: 'ლამინირებული ზედაპირი, ელექტრო ამწე ფოლადის კარკასი',
      en: 'Laminate top, electric steel lifting frame',
      ru: 'Ламинированная столешница, стальной каркас с электроприводом',
    },
    dimensions: { width: 160, depth: 70, height: 120 },
    finishes: [
      { name: { ka: 'თეთრი', en: 'White', ru: 'Белый' }, hex: '#EDE9E1' },
      { name: { ka: 'ღია მუხა', en: 'Light oak', ru: 'Светлый дуб' }, hex: '#CBAE84' },
    ],
    availability: 'on-order',
    origin: { ka: 'გერმანია', en: 'Germany', ru: 'Германия' },
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
      ru: 'Офисное кресло «Volta»',
    },
    shortDescription: {
      ka: 'ერგონომიული სავარძელი ბადისებრი ზურგით და წელის საყრდენით.',
      en: 'Ergonomic chair with a mesh back and adjustable lumbar support.',
      ru: 'Эргономичное кресло с сетчатой спинкой и регулируемой поясничной поддержкой.',
    },
    description: {
      ka: 'Volta-ს ზურგი ბადისებრია, რაც ზაფხულში მნიშვნელობას იძენს — ზურგი არ ოფლიანდება რვასაათიანი დღის შემდეგაც. წელის საყრდენი სიმაღლეშიც და სიღრმეშიც რეგულირდება, სახელურები კი ოთხი მიმართულებით მოძრაობს. ჯვარედინი პოლირებული ალუმინისაა.',
      en: 'The Volta back is mesh, which starts to matter in summer — your back stays dry through an eight-hour day. The lumbar support adjusts in both height and depth, and the arms move in four directions. The base is polished aluminium.',
      ru: 'Спинка Volta сетчатая, и летом это начинает иметь значение: спина остаётся сухой даже после восьмичасового дня. Поясничная поддержка регулируется по высоте и глубине, подлокотники двигаются в четырёх направлениях. Крестовина — полированный алюминий.',
    },
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1400&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1400&q=80',
    ],
    materials: {
      ka: 'ბადისებრი ზურგი, ქსოვილის ჯდომა, ალუმინის ჯვარედინი',
      en: 'Mesh back, fabric seat, aluminium base',
      ru: 'Сетчатая спинка, тканевое сиденье, алюминиевая крестовина',
    },
    dimensions: { width: 62, depth: 62, height: 115 },
    finishes: [
      { name: { ka: 'შავი', en: 'Black', ru: 'Чёрный' }, hex: '#1E1E1C' },
      { name: { ka: 'ნაცრისფერი', en: 'Grey', ru: 'Серый' }, hex: '#8E8B85' },
    ],
    availability: 'in-stock',
    origin: { ka: 'გერმანია', en: 'Germany', ru: 'Германия' },
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
      ru: 'Книжная полка «Folio»',
    },
    shortDescription: {
      ka: 'მაღალი მუხის თარო ხუთი დონით, კედელზე დასამაგრებელი.',
      en: 'Tall oak shelf with five levels, fixed to the wall.',
      ru: 'Высокий дубовый стеллаж на пять уровней, с креплением к стене.',
    },
    description: {
      ka: 'Folio ვიწროა და მაღალი — ის კედლის იმ ნაწილს იყენებს, რომელიც ჩვეულებრივ ცარიელი რჩება. თითოეული დონე 28 კილოგრამამდე დატვირთვას იტანს, რაც სამ რიგ წიგნზე მეტია. კომპლექტში შედის კედელზე დამაგრების ნაკრები — მაღალი თარო ყოველთვის უნდა დამაგრდეს.',
      en: 'Folio is narrow and tall — it uses the part of a wall that usually goes to waste. Each level carries up to 28 kilograms, which is more than three rows of books. A wall-fixing kit is included; a shelf this tall should always be anchored.',
      ru: 'Folio узкий и высокий — он использует ту часть стены, которая обычно пропадает. Каждый уровень выдерживает до 28 килограммов, а это больше трёх рядов книг. Комплект настенного крепежа входит в поставку: такой высокий стеллаж всегда нужно фиксировать.',
    },
    images: [
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1400&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივი, კედელზე დასამაგრებელი კომპლექტი',
      en: 'Solid oak, wall-fixing kit included',
      ru: 'Массив дуба, комплект настенного крепежа',
    },
    dimensions: { width: 80, depth: 32, height: 200 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
      { name: { ka: 'თეთრი', en: 'White', ru: 'Белый' }, hex: '#EDE9E1' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პოლონეთი', en: 'Poland', ru: 'Польша' },
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
      ru: 'Торшер «Arca»',
    },
    shortDescription: {
      ka: 'რკალისებრი სანათი მარმარილოს ფუძეზე, თითბრის დეტალებით.',
      en: 'Arc lamp on a marble base with brass detailing.',
      ru: 'Дуговой торшер на мраморном основании с латунными деталями.',
    },
    description: {
      ka: 'Arca-ს რკალი 160 სანტიმეტრით გადმოდის, ამიტომ სანათი დივანს თავზე ადგება, თვითონ კი გვერდით დგას — კუთხის დაკავების გარეშე. მარმარილოს ფუძე მძიმეა განზრახ, რომ კონსტრუქცია მდგრადი იყოს. თავი ბრუნავს და შუქს იქით მიმართავს, სადაც კითხულობთ.',
      en: 'The Arca arc reaches 160 centimetres, so the shade hangs over the sofa while the base stands beside it, taking no corner of its own. The marble base is heavy on purpose, to keep the whole thing steady. The head swivels, so the light points at whatever you are reading.',
      ru: 'Дуга Arca выносит плафон на 160 сантиметров: свет висит над диваном, а основание стоит рядом, не занимая угол. Мраморное основание тяжёлое намеренно — ради устойчивости. Плафон поворачивается, направляя свет туда, где вы читаете.',
    },
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
    ],
    materials: {
      ka: 'თითბერი, მარმარილოს ფუძე, ქსოვილის კაბელი',
      en: 'Brass, marble base, fabric-covered cable',
      ru: 'Латунь, мраморное основание, кабель в тканевой оплётке',
    },
    dimensions: { width: 30, depth: 160, height: 180 },
    finishes: [
      { name: { ka: 'თითბერი', en: 'Brass', ru: 'Латунь' }, hex: '#C69B57' },
      { name: { ka: 'მატი შავი', en: 'Matt black', ru: 'Матовый чёрный' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
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
      ru: 'Подвесной светильник «Luce»',
    },
    shortDescription: {
      ka: 'გუმბათისებრი სანათი ალუმინისგან, ორმეტრიანი კაბელით.',
      en: 'Spun aluminium dome on a two-metre fabric cord.',
      ru: 'Алюминиевый купол на двухметровом тканевом шнуре.',
    },
    description: {
      ka: 'Luce-ს გუმბათი შუქს ქვევით მიმართავს — ზუსტად ის, რაც სასადილო მაგიდას სჭირდება, თვალის ბრმა შუქის გარეშე. შიდა ზედაპირი თეთრად არის შეღებილი, რომ სინათლე თანაბრად გაიბნეს. ორმეტრიანი კაბელი მონტაჟისას სასურველ სიგრძეზე იჭრება.',
      en: 'The Luce dome throws its light straight down — which is what a dining table needs, without any of it reaching your eyes. The inside is painted white so the light spreads evenly rather than pooling. The two-metre cord is cut to length at installation.',
      ru: 'Купол Luce направляет свет строго вниз — именно это нужно обеденному столу, и ничего не бьёт в глаза. Внутренняя поверхность окрашена в белый, чтобы свет рассеивался равномерно. Двухметровый шнур подрезается по месту при монтаже.',
    },
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1400&q=80',
      'https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=1400&q=80',
    ],
    materials: {
      ka: 'ფხვნილსაღებავიანი ალუმინი, ქსოვილის კაბელი 200 სმ',
      en: 'Powder-coated aluminium, 200 cm fabric cord',
      ru: 'Алюминий с порошковым покрытием, тканевый шнур 200 см',
    },
    dimensions: { width: 40, depth: 40, height: 28 },
    finishes: [
      { name: { ka: 'თეთრი მატი', en: 'Matt white', ru: 'Матовый белый' }, hex: '#E8E4DC' },
      { name: { ka: 'ღრმა მწვანე', en: 'Deep green', ru: 'Тёмно-зелёный' }, hex: '#35503F' },
      { name: { ka: 'თითბერი', en: 'Brass', ru: 'Латунь' }, hex: '#C69B57' },
    ],
    availability: 'in-stock',
    origin: { ka: 'დანია', en: 'Denmark', ru: 'Дания' },
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
      ru: 'Подвесной светильник «Vime» из ротанга',
    },
    shortDescription: {
      ka: 'ხელით ნაწნავი როტანგი, რომელიც შუქს კედელზე ხატავს.',
      en: 'Hand-woven rattan that draws the light across the wall.',
      ru: 'Ротанг ручного плетения, рисующий свет по стене.',
    },
    description: {
      ka: 'Vime-ს ღირებულება არა თვით სანათშია, არამედ იმ ჩრდილში, რომელსაც ის კედელზე აგდებს — ნაწნავი როტანგი შუქს ხაზებად ჭრის. ყოველი სანათი ხელით იწნება, ამიტომ ორი ერთნაირი არ არსებობს. მსუბუქია, ამიტომ სტანდარტული ჭერის სამაგრი საკმარისია.',
      en: 'The point of Vime is not the fixture but the shadow it throws — the woven rattan cuts the light into lines across the wall. Each shade is woven by hand, so no two are identical. It weighs very little, so a standard ceiling fixing is enough.',
      ru: 'Смысл Vime не в самом светильнике, а в тени, которую он отбрасывает: плетёный ротанг режет свет на линии по стене. Каждый плафон плетётся вручную, поэтому одинаковых не бывает. Он очень лёгкий, так что достаточно стандартного потолочного крепления.',
    },
    images: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1400&q=80',
      'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1400&q=80',
    ],
    materials: {
      ka: 'ხელით ნაწნავი როტანგი, ლითონის კარკასი',
      en: 'Hand-woven rattan, steel frame',
      ru: 'Ротанг ручного плетения, стальной каркас',
    },
    dimensions: { width: 45, depth: 45, height: 40 },
    finishes: [
      { name: { ka: 'ბუნებრივი როტანგი', en: 'Natural rattan', ru: 'Натуральный ротанг' }, hex: '#C3A06A' },
    ],
    availability: 'in-stock',
    origin: { ka: 'პორტუგალია', en: 'Portugal', ru: 'Португалия' },
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
      ru: 'Круглое зеркало «Specchio»',
    },
    shortDescription: {
      ka: 'მრგვალი სარკე მუხის მასივის ჩარჩოში, 90 სმ დიამეტრით.',
      en: 'Round mirror in a solid oak frame, 90 cm across.',
      ru: 'Круглое зеркало в раме из массива дуба, диаметр 90 см.',
    },
    description: {
      ka: 'ოთხმოცდაათსანტიმეტრიანი სარკე ვიწრო დერეფანს ან პატარა შესასვლელს ორჯერ დიდს აჩვენებს — ეს ყველაზე იაფი ხერხია სივრცის მოსაპოვებლად. ჩარჩო მუხის მასივისაა და ერთი ნაჭრისგან იხრება, ამიტომ შეერთება არ ჩანს. კომპლექტში შედის ფარული სამაგრი.',
      en: 'A ninety-centimetre mirror makes a narrow hallway or a small entrance read twice its size — it remains the cheapest way to gain a room. The frame is solid oak, steam-bent from a single length so no joint shows. A concealed wall fixing is included.',
      ru: 'Зеркало диаметром девяносто сантиметров заставляет узкий коридор или маленькую прихожую казаться вдвое больше — это по-прежнему самый дешёвый способ получить пространство. Рама из массива дуба гнётся паром из одной заготовки, поэтому стык не виден. Скрытый крепёж входит в комплект.',
    },
    images: [
      'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?w=1400&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80',
    ],
    materials: {
      ka: 'მუხის მასივის ჩარჩო, 5 მმ სარკე, ფარული სამაგრი',
      en: 'Solid oak frame, 5 mm glass, concealed fixing',
      ru: 'Рама из массива дуба, зеркало 5 мм, скрытый крепёж',
    },
    dimensions: { width: 90, depth: 4, height: 90 },
    finishes: [
      { name: { ka: 'ბუნებრივი მუხა', en: 'Natural oak', ru: 'Натуральный дуб' }, hex: '#C2A578' },
      { name: { ka: 'შავი', en: 'Black', ru: 'Чёрный' }, hex: '#1E1E1C' },
    ],
    availability: 'in-stock',
    origin: { ka: 'საქართველო', en: 'Georgia', ru: 'Грузия' },
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
      ru: 'Лаунж-комплект «Riva»',
    },
    shortDescription: {
      ka: 'ტიკის კომპლექტი დივნით, ორი სავარძლითა და მაგიდით.',
      en: 'Teak set with a sofa, two armchairs and a low table.',
      ru: 'Тиковый комплект: диван, два кресла и низкий стол.',
    },
    description: {
      ka: 'ტიკი ერთადერთი ხეა, რომელსაც ღია ცის ქვეშ დატოვება უჭირს — მისი ბუნებრივი ზეთი წყალს იგერიებს დამუშავების გარეშეც. პირველი წლის შემდეგ ზედაპირი ვერცხლისფერ პატინას იძენს; თუ ოქროსფერი გირჩევნიათ, წელიწადში ერთხელ ზეთი საკმარისია. ბალიშები Sunbrella-ს ქსოვილისაა და მზეზე არ ხუნდება.',
      en: 'Teak is the one timber that does not mind being left outside — its own oils turn water away without any treatment. After the first year the surface takes on a silver patina; if you prefer the honey tone, one oiling a year holds it. The cushions are in Sunbrella fabric, which does not fade in sun.',
      ru: 'Тик — единственная древесина, которой не вредит жизнь под открытым небом: собственные масла отталкивают воду без всякой обработки. После первого года поверхность приобретает серебристую патину; если вам ближе медовый тон, достаточно раз в год покрыть маслом. Подушки из ткани Sunbrella не выгорают на солнце.',
    },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1400&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80',
    ],
    materials: {
      ka: 'ტიკის მასივი, ამინდგამძლე ბალიშები Sunbrella',
      en: 'Solid teak, weather-resistant Sunbrella cushions',
      ru: 'Массив тика, всепогодные подушки Sunbrella',
    },
    dimensions: { width: 240, depth: 85, height: 70 },
    finishes: [
      { name: { ka: 'ბუნებრივი ტიკი', en: 'Natural teak', ru: 'Натуральный тик' }, hex: '#B08D57' },
      { name: { ka: 'ქვიშისფერი', en: 'Sand', ru: 'Песочный' }, hex: '#C7B9A3' },
    ],
    availability: 'on-order',
    origin: { ka: 'ინდონეზია', en: 'Indonesia', ru: 'Индонезия' },
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
      ru: 'Уличная обеденная группа «Sole»',
    },
    shortDescription: {
      ka: 'ალუმინის მაგიდა კერამიკული ზედაპირით და ექვსი სკამი.',
      en: 'Aluminium table with a ceramic top and six chairs.',
      ru: 'Алюминиевый стол с керамической столешницей и шесть стульев.',
    },
    description: {
      ka: 'Sole-ს ზედაპირი კერამიკული ფილისაა — ის არც მზეზე ხუნდება და არც ღვინის ლაქას იღებს, რაც ეზოს მაგიდისთვის ორივე მნიშვნელოვანია. კარკასი ფხვნილსაღებავიანი ალუმინისაა, ამიტომ ზამთარშიც ჟანგი არ ემუქრება. სკამები ერთმანეთზე იწყობა და მცირე ადგილს იკავებს.',
      en: 'The Sole top is a ceramic slab — it neither fades in sun nor stains from wine, and an outdoor table needs both. The frame is powder-coated aluminium, so nothing rusts over a wet winter. The chairs stack, which matters when the terrace has to be cleared.',
      ru: 'Столешница Sole — керамическая плита: она не выгорает на солнце и не впитывает винные пятна, а уличному столу нужно и то, и другое. Каркас из алюминия с порошковым покрытием не ржавеет за сырую зиму. Стулья штабелируются, что важно, когда террасу нужно освободить.',
    },
    images: [
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1400&q=80',
      'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1400&q=80',
    ],
    materials: {
      ka: 'ფხვნილსაღებავიანი ალუმინი, კერამიკული ზედაპირი',
      en: 'Powder-coated aluminium, ceramic top',
      ru: 'Алюминий с порошковым покрытием, керамическая столешница',
    },
    dimensions: { width: 200, depth: 100, height: 75 },
    finishes: [
      { name: { ka: 'ანტრაციტი', en: 'Anthracite', ru: 'Антрацит' }, hex: '#3A3A3C' },
      { name: { ka: 'თეთრი', en: 'White', ru: 'Белый' }, hex: '#E8E4DC' },
    ],
    availability: 'on-order',
    origin: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
    warrantyMonths: 36,
    isNew: true,
    isFeatured: false,
  },
]
