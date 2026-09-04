import type { Collection } from './types'

/**
 * ============================================================================
 * COLLECTIONS  —  themed families of pieces that share a look
 * ----------------------------------------------------------------------------
 * A collection is a story, not a category. "Living room" is a category —
 * every sofa belongs to one. "Terra" is a collection — a sofa, a dining table
 * and a sideboard can all belong to it because they share the same timber and
 * the same feeling.
 *
 * HOW TO ADD A COLLECTION
 *   1. Copy one whole block below, from `{` to `},`
 *   2. Change `id` and `slug` — both must be unique in this file.
 *      The slug becomes the web address: /ka/collections/terra
 *   3. Fill `name`, `tagline` and `story` for BOTH languages.
 *   4. `coverImage` is the big photo on the collections index page.
 *      `images` is the gallery on the collection's own page — 4 works well.
 *   5. Save.
 *
 * HOW TO PUT A PRODUCT IN A COLLECTION
 *   Open products.ts, find the product, and set its `collectionSlug` to the
 *   slug you used here. A product with `collectionSlug: ''` belongs to none.
 * ============================================================================
 */

export const collections: Collection[] = [
  {
    id: 'col-arch-nordic',
    slug: 'arch-nordic',
    name: {
      ka: 'Arch-Nordic',
      en: 'Arch-Nordic',
    },
    tagline: {
      ka: 'ღია მუხა, შალი და სელი — სინათლისთვის დატოვებული ადგილი.',
      en: 'Pale oak, wool and linen — room left over for the light.',
    },
    story: {
      ka: 'Arch-Nordic დაიბადა მარტივი კითხვიდან: რამდენის მოცილება შეიძლება ისე, რომ საგანმა სითბო არ დაკარგოს. ხაზები სწორია, კვანძები დაუფარავი, ზედაპირი კი ზეთით დამუშავებული — არა ლაქით. ღია მუხა და ბუნებრივი შალი წლების განმავლობაში ნელა ბნელდება და ოთახს არა უფრო ძველს, არამედ უფრო დასახლებულს ხდის.',
      en: 'Arch-Nordic began with a simple question: how much can be taken away before a piece stops feeling warm. The lines are straight, the joints are left visible, and the surfaces are finished in oil rather than lacquer. Pale oak and undyed wool darken slowly over the years, which makes a room feel less new and more lived in.',
    },
    coverImage: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1400&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80',
    ],
  },

  {
    id: 'col-terra',
    slug: 'terra',
    name: {
      ka: 'Terra',
      en: 'Terra',
    },
    tagline: {
      ka: 'კაკლის ხე, ტყავი და ქვა — მასალები, რომლებიც ასაკს არ მალავს.',
      en: 'Walnut, leather and stone — materials that do not hide their age.',
    },
    story: {
      ka: 'Terra თბილი კოლექციაა. კაკლის მასივი მუქდება, ანილინის ტყავი პატინას იძენს, ტრავერტინი კი ინარჩუნებს იმ ფორებს, რომლებიც მას ბუნებამ დაუტოვა. არაფერია გაპრიალებული იმ დონემდე, რომ ხელის კვალი შეურაცხყოფად აღიქმებოდეს. ეს კოლექცია იმ სახლებისთვისაა, სადაც ავეჯი ყოველდღე გამოიყენება და არა უბრალოდ დგას.',
      en: 'Terra is the warm collection. Solid walnut deepens, aniline leather takes a patina, and travertine keeps the open pores nature gave it. Nothing is polished to the point where a fingerprint reads as damage. It is made for houses where the furniture is used every day rather than merely kept.',
    },
    coverImage: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80',
      'https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=1400&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1400&q=80',
      'https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=1400&q=80',
    ],
  },

  {
    id: 'col-atelier',
    slug: 'atelier',
    name: {
      ka: 'Atelier',
      en: 'Atelier',
    },
    tagline: {
      ka: 'შავად დამუშავებული ლითონი, შებოლილი მუხა და ხავერდი.',
      en: 'Blackened steel, smoked oak and velvet.',
    },
    story: {
      ka: 'Atelier ყველაზე ქალაქური კოლექციაა — შექმნილი მაღალჭერიანი ბინებისთვის, სადაც სინათლე ერთი მხრიდან შემოდის. კარკასი შავად დამუშავებული ფოლადისაა, ზედაპირები შებოლილი მუხის, ხოლო რბილი ავეჯი ხავერდით არის გადაკრული, რომელიც შუქს იჭერს დღის სხვადასხვა საათში სხვადასხვაგვარად. მუქი პალიტრა სივრცეს არ ამცირებს — პირიქით, მის სიღრმეს უსვამს ხაზს.',
      en: 'Atelier is the most urban of the three — drawn for high-ceilinged flats where the light arrives from one side only. Frames are in blackened steel, surfaces in smoked oak, and the upholstery is a velvet that catches the light differently at every hour of the day. The dark palette does not shrink a room; it gives its depth somewhere to sit.',
    },
    coverImage: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=1400&q=80',
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1400&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=80',
      'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1400&q=80',
    ],
  },
]
