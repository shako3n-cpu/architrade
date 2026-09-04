import type { SeedCategory } from './types'

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
 *   4. Fill in `name` and `intro` for BOTH languages (ka / en).
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

export const categories: SeedCategory[] = [
  {
    id: 'cat-living-room',
    slug: 'living-room',
    name: {
      ka: 'მისაღები ოთახი',
      en: 'Living room',
    },
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    intro: {
      ka: 'დივნები, სავარძლები და ჟურნალის მაგიდები, რომლებიც ოთახს სიმშვიდეს სძენს. ბუნებრივი ქსოვილები მასივის კარკასზე.',
      en: 'Sofas, armchairs and low tables built to quiet a room. Natural textiles over solid timber frames.',
    },
    subcategories: [
      { slug: 'sofas', name: { ka: 'დივნები', en: 'Sofas' } },
      { slug: 'armchairs', name: { ka: 'სავარძლები', en: 'Armchairs' } },
      {
        slug: 'coffee-tables',
        name: { ka: 'ჟურნალის მაგიდები', en: 'Coffee tables' },
      },
      {
        slug: 'tv-stands',
        name: { ka: 'ტელევიზორის მაგიდები', en: 'TV stands' },
      },
    ],
  },

  {
    id: 'cat-bedroom',
    slug: 'bedroom',
    name: {
      ka: 'საძინებელი',
      en: 'Bedroom',
    },
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1600&q=80',
    intro: {
      ka: 'საწოლები და საძინებლის ავეჯი მშვიდი ხაზებით. მუხის და კაკლის მასივი, რბილი ქსოვილები.',
      en: 'Beds and bedroom pieces with calm, unhurried lines. Solid oak, walnut and soft upholstery.',
    },
    subcategories: [
      { slug: 'beds', name: { ka: 'საწოლები', en: 'Beds' } },
      {
        slug: 'wardrobes',
        name: { ka: 'გარდერობები', en: 'Wardrobes' },
      },
      {
        slug: 'nightstands',
        name: { ka: 'ღამის მაგიდები', en: 'Nightstands' },
      },
      { slug: 'dressers', name: { ka: 'კომოდები', en: 'Dressers' } },
    ],
  },

  {
    id: 'cat-dining-kitchen',
    slug: 'dining-kitchen',
    name: {
      ka: 'სამზარეულო და სასადილო',
      en: 'Dining & kitchen',
    },
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80',
    intro: {
      ka: 'სასადილო მაგიდები, სკამები და სამზარეულოს კომპლექტები — ინდივიდუალური ზომებით, ერთ სივრცედ აწყობილი.',
      en: 'Dining tables, chairs and kitchen cabinetry — measured to your room and finished as one continuous space.',
    },
    subcategories: [
      {
        slug: 'dining-tables',
        name: { ka: 'სასადილო მაგიდები', en: 'Dining tables' },
      },
      { slug: 'chairs', name: { ka: 'სკამები', en: 'Chairs' } },
      {
        slug: 'bar-stools',
        name: { ka: 'ბარის სკამები', en: 'Bar stools' },
      },
      {
        slug: 'kitchen-units',
        name: { ka: 'სამზარეულოს კომპლექტები', en: 'Kitchen units' },
      },
      {
        slug: 'islands',
        name: { ka: 'კუნძულები', en: 'Islands' },
      },
      {
        slug: 'sideboards',
        name: { ka: 'ბუფეტები', en: 'Sideboards' },
      },
    ],
  },

  {
    id: 'cat-office',
    slug: 'office',
    name: {
      ka: 'საოფისე ავეჯი',
      en: 'Office',
    },
    image: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1600&q=80',
    intro: {
      ka: 'სამუშაო მაგიდები, ერგონომიული სავარძლები და წიგნის თაროები სახლის კაბინეტისა და ოფისისთვის.',
      en: 'Desks, ergonomic seating and bookshelves for the home study and the office floor alike.',
    },
    subcategories: [
      { slug: 'desks', name: { ka: 'სამუშაო მაგიდები', en: 'Desks' } },
      {
        slug: 'office-chairs',
        name: { ka: 'საოფისე სავარძლები', en: 'Ergonomic chairs' },
      },
      {
        slug: 'bookshelves',
        name: { ka: 'წიგნის თაროები', en: 'Bookshelves' },
      },
    ],
  },

  {
    id: 'cat-decor-lighting',
    slug: 'decor-lighting',
    name: {
      ka: 'დეკორი და განათება',
      en: 'Decor & lighting',
    },
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1600&q=80',
    intro: {
      ka: 'სანათები და სარკეები, რომლებიც ინტერიერს ხასიათს ანიჭებს — თბილი შუქი და მკაფიო ხაზები.',
      en: 'Lighting and mirrors that give an interior its character — warm light and clean lines.',
    },
    subcategories: [
      {
        slug: 'floor-lamps',
        name: { ka: 'იატაკის სანათები', en: 'Floor lamps' },
      },
      {
        slug: 'pendant-lights',
        name: { ka: 'დასაკიდი სანათები', en: 'Pendant lights' },
      },
      { slug: 'mirrors', name: { ka: 'სარკეები', en: 'Mirrors' } },
    ],
  },

  {
    id: 'cat-outdoor',
    slug: 'outdoor',
    name: {
      ka: 'ეზოს ავეჯი',
      en: 'Outdoor',
    },
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80',
    intro: {
      ka: 'ტერასისა და ბაღის ავეჯი ამინდგამძლე მასალებისგან — ტიკის ხე და ფხვნილსაღებავიანი ალუმინი.',
      en: 'Terrace and garden pieces in weather-resistant teak and powder-coated aluminium.',
    },
    subcategories: [
      {
        slug: 'lounge-sets',
        name: { ka: 'დასასვენებელი კომპლექტები', en: 'Lounge sets' },
      },
      {
        slug: 'outdoor-dining',
        name: { ka: 'ეზოს სასადილო ჯგუფები', en: 'Outdoor dining' },
      },
    ],
  },
]

/** Look up one category by its slug. Returns undefined if the slug is unknown. */
export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug)
}
