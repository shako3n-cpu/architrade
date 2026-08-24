import type { Category } from './types'

/**
 * ============================================================================
 * CATEGORIES  —  the six top-level groups of the catalogue
 * ----------------------------------------------------------------------------
 * HOW TO ADD A CATEGORY
 *   1. Copy one whole block below, from `{` to `},`
 *   2. Paste it inside the list, before the closing `]`
 *   3. Change `id` and `slug` — both must be unique across the file.
 *      The slug becomes the web address:  slug "office"  ->  /ka/catalog/office
 *      Use lowercase Latin letters and hyphens only. No spaces, no Georgian.
 *   4. Fill in `name` and `intro` for ALL THREE languages (ka / en / ru).
 *   5. Put a photo address in `image`.
 *   6. Save. The category appears in the menu, the footer and the home page
 *      automatically — nothing else to edit.
 *
 * HOW TO ADD A SUBCATEGORY
 *   Copy one `{ slug: ..., name: {...} }` line inside `subcategories`.
 *   Subcategory slugs must be unique inside their own category only.
 *
 * NOTE: the number of products in a category is counted automatically from
 * products.ts. Never type a count by hand.
 *
 * WARNING: if you change a `slug` here, every product in products.ts that
 * points at the old slug stops appearing. Search products.ts for the old slug
 * and update it too.
 * ============================================================================
 */

export const categories: Category[] = [
  {
    id: 'cat-living-room',
    slug: 'living-room',
    name: {
      ka: 'მისაღები ოთახი',
      en: 'Living room',
      ru: 'Гостиная',
    },
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    intro: {
      ka: 'დივნები, სავარძლები და ჟურნალის მაგიდები, რომლებიც ოთახს სიმშვიდეს სძენს. ბუნებრივი ქსოვილები მასივის კარკასზე.',
      en: 'Sofas, armchairs and low tables built to quiet a room. Natural textiles over solid timber frames.',
      ru: 'Диваны, кресла и журнальные столы, которые успокаивают пространство. Натуральные ткани на каркасе из массива.',
    },
    subcategories: [
      { slug: 'sofas', name: { ka: 'დივნები', en: 'Sofas', ru: 'Диваны' } },
      { slug: 'armchairs', name: { ka: 'სავარძლები', en: 'Armchairs', ru: 'Кресла' } },
      {
        slug: 'coffee-tables',
        name: { ka: 'ჟურნალის მაგიდები', en: 'Coffee tables', ru: 'Журнальные столы' },
      },
      {
        slug: 'tv-stands',
        name: { ka: 'ტელევიზორის მაგიდები', en: 'TV stands', ru: 'ТВ-тумбы' },
      },
    ],
  },

  {
    id: 'cat-bedroom',
    slug: 'bedroom',
    name: {
      ka: 'საძინებელი',
      en: 'Bedroom',
      ru: 'Спальня',
    },
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1600&q=80',
    intro: {
      ka: 'საწოლები და საძინებლის ავეჯი მშვიდი ხაზებით. მუხის და კაკლის მასივი, რბილი ქსოვილები.',
      en: 'Beds and bedroom pieces with calm, unhurried lines. Solid oak, walnut and soft upholstery.',
      ru: 'Кровати и мебель для спальни со спокойными линиями. Массив дуба, орех и мягкая обивка.',
    },
    subcategories: [
      { slug: 'beds', name: { ka: 'საწოლები', en: 'Beds', ru: 'Кровати' } },
      {
        slug: 'wardrobes',
        name: { ka: 'გარდერობები', en: 'Wardrobes', ru: 'Шкафы' },
      },
      {
        slug: 'nightstands',
        name: { ka: 'ღამის მაგიდები', en: 'Nightstands', ru: 'Прикроватные тумбы' },
      },
      { slug: 'dressers', name: { ka: 'კომოდები', en: 'Dressers', ru: 'Комоды' } },
    ],
  },

  {
    id: 'cat-dining-kitchen',
    slug: 'dining-kitchen',
    name: {
      ka: 'სამზარეულო და სასადილო',
      en: 'Dining & kitchen',
      ru: 'Кухня и столовая',
    },
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80',
    intro: {
      ka: 'სასადილო მაგიდები, სკამები და სამზარეულოს კომპლექტები — ინდივიდუალური ზომებით, ერთ სივრცედ აწყობილი.',
      en: 'Dining tables, chairs and kitchen cabinetry — measured to your room and finished as one continuous space.',
      ru: 'Обеденные столы, стулья и кухонные гарнитуры — по вашим размерам, собранные в единое пространство.',
    },
    subcategories: [
      {
        slug: 'dining-tables',
        name: { ka: 'სასადილო მაგიდები', en: 'Dining tables', ru: 'Обеденные столы' },
      },
      { slug: 'chairs', name: { ka: 'სკამები', en: 'Chairs', ru: 'Стулья' } },
      {
        slug: 'bar-stools',
        name: { ka: 'ბარის სკამები', en: 'Bar stools', ru: 'Барные стулья' },
      },
      {
        slug: 'kitchen-units',
        name: { ka: 'სამზარეულოს კომპლექტები', en: 'Kitchen units', ru: 'Кухонные гарнитуры' },
      },
      {
        slug: 'islands',
        name: { ka: 'კუნძულები', en: 'Islands', ru: 'Кухонные острова' },
      },
      {
        slug: 'sideboards',
        name: { ka: 'ბუფეტები', en: 'Sideboards', ru: 'Буфеты' },
      },
    ],
  },

  {
    id: 'cat-office',
    slug: 'office',
    name: {
      ka: 'საოფისე ავეჯი',
      en: 'Office',
      ru: 'Офис',
    },
    image: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1600&q=80',
    intro: {
      ka: 'სამუშაო მაგიდები, ერგონომიული სავარძლები და წიგნის თაროები სახლის კაბინეტისა და ოფისისთვის.',
      en: 'Desks, ergonomic seating and bookshelves for the home study and the office floor alike.',
      ru: 'Столы, эргономичные кресла и книжные полки для домашнего кабинета и офиса.',
    },
    subcategories: [
      { slug: 'desks', name: { ka: 'სამუშაო მაგიდები', en: 'Desks', ru: 'Письменные столы' } },
      {
        slug: 'office-chairs',
        name: { ka: 'საოფისე სავარძლები', en: 'Ergonomic chairs', ru: 'Офисные кресла' },
      },
      {
        slug: 'bookshelves',
        name: { ka: 'წიგნის თაროები', en: 'Bookshelves', ru: 'Книжные полки' },
      },
    ],
  },

  {
    id: 'cat-decor-lighting',
    slug: 'decor-lighting',
    name: {
      ka: 'დეკორი და განათება',
      en: 'Decor & lighting',
      ru: 'Декор и освещение',
    },
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1600&q=80',
    intro: {
      ka: 'სანათები და სარკეები, რომლებიც ინტერიერს ხასიათს ანიჭებს — თბილი შუქი და მკაფიო ხაზები.',
      en: 'Lighting and mirrors that give an interior its character — warm light and clean lines.',
      ru: 'Светильники и зеркала, которые задают характер интерьера — тёплый свет и чистые линии.',
    },
    subcategories: [
      {
        slug: 'floor-lamps',
        name: { ka: 'იატაკის სანათები', en: 'Floor lamps', ru: 'Торшеры' },
      },
      {
        slug: 'pendant-lights',
        name: { ka: 'დასაკიდი სანათები', en: 'Pendant lights', ru: 'Подвесные светильники' },
      },
      { slug: 'mirrors', name: { ka: 'სარკეები', en: 'Mirrors', ru: 'Зеркала' } },
    ],
  },

  {
    id: 'cat-outdoor',
    slug: 'outdoor',
    name: {
      ka: 'ეზოს ავეჯი',
      en: 'Outdoor',
      ru: 'Уличная мебель',
    },
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80',
    intro: {
      ka: 'ტერასისა და ბაღის ავეჯი ამინდგამძლე მასალებისგან — ტიკის ხე და ფხვნილსაღებავიანი ალუმინი.',
      en: 'Terrace and garden pieces in weather-resistant teak and powder-coated aluminium.',
      ru: 'Мебель для террасы и сада из тика и алюминия с порошковым покрытием.',
    },
    subcategories: [
      {
        slug: 'lounge-sets',
        name: { ka: 'დასასვენებელი კომპლექტები', en: 'Lounge sets', ru: 'Лаунж-комплекты' },
      },
      {
        slug: 'outdoor-dining',
        name: { ka: 'ეზოს სასადილო ჯგუფები', en: 'Outdoor dining', ru: 'Уличные обеденные группы' },
      },
    ],
  },
]

/** Look up one category by its slug. Returns undefined if the slug is unknown. */
export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug)
}

/** Look up one subcategory inside a category. Returns undefined if either is unknown. */
export function getSubcategory(categorySlug: string, subcategorySlug: string) {
  return getCategoryBySlug(categorySlug)?.subcategories.find(
    (subcategory) => subcategory.slug === subcategorySlug,
  )
}
