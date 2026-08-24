/**
 * ============================================================================
 * DATA TYPES
 * ----------------------------------------------------------------------------
 * Shared shapes for the catalogue files. You rarely need to edit this file —
 * it exists so the editor can warn you if a product block is missing a field.
 * ============================================================================
 */

/**
 * Text that exists in all three languages.
 * Every visitor-facing string in the catalogue uses this shape:
 *
 *   name: { ka: "მაგიდა", en: "Table", ru: "Стол" }
 *
 * All three are required — if one is missing TypeScript flags it, which stops
 * a half-translated product reaching the site.
 */
export type Localized = {
  ka: string
  en: string
  ru: string
}

/** A sub-group inside a category, e.g. "Sofas" inside "Living room". */
export type Subcategory = {
  /** URL fragment. Lowercase, hyphens only, must be unique in its category. */
  slug: string
  name: Localized
}

export type Category = {
  id: string
  /** Appears in the URL: /ka/catalog/living-room */
  slug: string
  name: Localized
  /** Banner + category-card photograph. */
  image: string
  /** Short paragraph shown on the category page under the banner. */
  intro: Localized
  subcategories: Subcategory[]
}

/** Whether a piece can be delivered now, ordered in, or made to measure. */
export type Availability = 'in-stock' | 'on-order' | 'custom'

/** A colour/finish option, shown as a small swatch on the product page. */
export type Finish = {
  name: Localized
  /** Hex value used to paint the swatch, e.g. "#6B4E32". */
  hex: string
}

export type Product = {
  id: string
  /** Appears in the URL: /ka/product/aria-oak-dining-table */
  slug: string
  /** Printed on the product card and used by catalogue search. */
  articleNumber: string
  categorySlug: string
  subcategorySlug: string
  /** Empty string when the piece belongs to no collection. */
  collectionSlug: string
  name: Localized
  /** One line, shown on cards. */
  shortDescription: Localized
  /** Two or three sentences, shown on the product page. */
  description: Localized
  /** COVER PHOTO FIRST. A second photo enables the hover swap on cards. */
  images: string[]
  /** Human-readable material summary, e.g. "Solid oak, natural oil". */
  materials: Localized
  /** Centimetres. */
  dimensions: { width: number; depth: number; height: number }
  finishes: Finish[]
  availability: Availability
  /** Country of origin, shown in the specification table. */
  origin: Localized
  /** Warranty length in months. */
  warrantyMonths: number
  /** Adds the "New" badge and puts the piece in the home-page row. */
  isNew: boolean
  /** Eligible for featured placement on the home page. */
  isFeatured: boolean
}

export type Collection = {
  id: string
  slug: string
  name: Localized
  /** One-line summary for the collections index. */
  tagline: Localized
  /** The longer story paragraph on the collection page. */
  story: Localized
  /** Large cover image for the index page. */
  coverImage: string
  /** Gallery shown on the collection detail page. */
  images: string[]
}
