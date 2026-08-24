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
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80',
    intro: {
      ka: 'დივნები, სავარძლები და ჟურნალის მაგიდები, რომლებიც ოთახს სიმშვიდეს სძენს. ბუნებრივი ქსოვილები და მასივის კარკასი.',
      en: 'Sofas, armchairs and low tables built to quiet a room. Natural textiles over solid timber frames.',
      ru: 'Диваны, кресла и журнальные столы, которые успокаивают пространство. Натуральные ткани и каркас из массива.',
    },
    subcategories: [
      { slug: 'sofas', name: { ka: 'დივნები', en: 'Sofas', ru: 'Диваны' } },
      { slug: 'armchairs', name: { ka: 'სავარძლები', en: 'Armchairs', ru: 'Кресла' } },
      {
        slug: 'coffee-tables',
        name: { ka: 'ჟურნალის მაგიდები', en: 'Coffee tables', ru: 'Журнальные столы' },
      },
      { slug: 'shelving', name: { ka: 'თაროები', en: 'Shelving', ru: 'Стеллажи' } },
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
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80',
    intro: {
      ka: 'საწოლები და საძინებლის ავეჯი მშვიდი ხაზებით. მასივის მუხა, თხილი და რბილი ქსოვილები.',
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
        name: { ka: 'საღამური მაგიდები', en: 'Nightstands', ru: 'Тумбы' },
      },
      { slug: 'dressers', name: { ka: 'კომოდები', en: 'Dressers', ru: 'Комоды' } },
    ],
  },

  {
    id: 'cat-dining',
    slug: 'dining',
    name: {
      ka: 'სასადილო',
      en: 'Dining',
      ru: 'Столовая',
    },
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80',
    intro: {
      ka: 'სასადილო მაგიდები და სკამები, რომლებიც წლების განმავლობაში ინარჩუნებენ სახეს.',
      en: 'Dining tables and chairs made to hold their shape across decades of use.',
      ru: 'Обеденные столы и стулья, сохраняющие форму десятилетиями.',
    },
    subcategories: [
      {
        slug: 'dining-tables',
        name: { ka: 'სასადილო მაგიდები', en: 'Dining tables', ru: 'Обеденные столы' },
      },
      { slug: 'chairs', name: { ka: 'სკამები', en: 'Chairs', ru: 'Стулья' } },
      {
        slug: 'sideboards',
        name: { ka: 'ბუფეტები', en: 'Sideboards', ru: 'Буфеты' },
      },
    ],
  },

  {
    id: 'cat-kitchen',
    slug: 'kitchen',
    name: {
      ka: 'სამზარეულო',
      en: 'Kitchen',
      ru: 'Кухня',
    },
    image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1600&q=80',
    intro: {
      ka: 'სამზარეულოს ავეჯი და კუნძულები, დამზადებული ინდივიდუალური ზომებით.',
      en: 'Kitchen cabinetry and islands, built to the measurements of your room.',
      ru: 'Кухонная мебель и острова, изготовленные по размерам вашего помещения.',
    },
    subcategories: [
      {
        slug: 'kitchen-units',
        name: { ka: 'სამზარეულოს კომპლექტი', en: 'Kitchen units', ru: 'Кухонные гарнитуры' },
      },
      { slug: 'islands', name: { ka: 'კუნძულები', en: 'Islands', ru: 'Острова' } },
      {
        slug: 'bar-stools',
        name: { ka: 'ბარის სკამები', en: 'Bar stools', ru: 'Барные стулья' },
      },
    ],
  },

  {
    id: 'cat-office',
    slug: 'office',
    name: {
      ka: 'ოფისი',
      en: 'Office',
      ru: 'Офис',
    },
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80',
    intro: {
      ka: 'სამუშაო მაგიდები და შესანახი სისტემები სახლის ოფისისა და კომერციული სივრცისთვის.',
      en: 'Desks and storage for the home study and the commercial floor alike.',
      ru: 'Столы и системы хранения для домашнего кабинета и офисных пространств.',
    },
    subcategories: [
      { slug: 'desks', name: { ka: 'სამუშაო მაგიდები', en: 'Desks', ru: 'Столы' } },
      {
        slug: 'office-chairs',
        name: { ka: 'ოფისის სკამები', en: 'Office chairs', ru: 'Офисные кресла' },
      },
      {
        slug: 'storage',
        name: { ka: 'შესანახი სისტემები', en: 'Storage', ru: 'Хранение' },
      },
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
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80',
    intro: {
      ka: 'ტერასისა და ბაღის ავეჯი ამინდგამძლე მასალებისგან — ტიკის ხე და ფხვნილით დაფარული ალუმინი.',
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
        name: { ka: 'ეზოს სასადილო', en: 'Outdoor dining', ru: 'Уличные обеденные группы' },
      },
    ],
  },
]

/** Look up one category by its slug. Returns undefined if the slug is unknown. */
export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug)
}
