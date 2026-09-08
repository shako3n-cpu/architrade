import { LANGUAGE_TAGS, type Language } from '@/config/site'
import type { Category, Product } from '@/data/types'

/**
 * ============================================================================
 * READING TRANSLATED COLUMNS
 * ----------------------------------------------------------------------------
 * The database stores each translation as its own column — `title_ka` and
 * `title_en` are two real columns, because a column cannot hold a nested
 * object. These helpers pick the right one for the language being shown, so
 * no component has to write `lang === 'ka' ? row.title_ka : row.title_en`.
 *
 * WHEN YOU ADD A THIRD LANGUAGE
 *   Add the column (`title_ru`), add it to the type in src/data/types.ts, add
 *   it to the column list in src/lib/queries.ts, then change the helpers here
 *   from a ternary to a lookup. Nothing else in the app needs to change.
 * ============================================================================
 */

export function categoryTitle(category: Category, lang: Language): string {
  return lang === 'ka' ? category.title_ka : category.title_en
}

/** The category's banner photograph, or null when the row has none. */
export function categoryImage(category: Category): string | null {
  return category.image ?? null
}

/**
 * Alt text for a category photograph.
 *
 * Names the room rather than saying "category image", so someone hearing it
 * knows which link they are on.
 */
export function categoryImageAlt(category: Category, lang: Language): string {
  return categoryTitle(category, lang)
}

export function productTitle(product: Product, lang: Language): string {
  return lang === 'ka' ? product.title_ka : product.title_en
}

export function productDescription(product: Product, lang: Language): string {
  return lang === 'ka' ? product.description_ka : product.description_en
}

export function productMaterials(product: Product, lang: Language): string {
  return lang === 'ka' ? product.materials_ka : product.materials_en
}

/**
 * The cover photograph — the first entry in `images`.
 *
 * Defensive on purpose: a row added by hand can easily end up with an empty
 * array, and a missing cover should leave a quiet placeholder box rather than
 * crash the grid.
 */
export function productCover(product: Product): string | null {
  return product.images?.[0] ?? null
}

/** The photograph revealed on hover, when the row has a second one. */
export function productHoverImage(product: Product): string | null {
  return product.images?.[1] ?? null
}

/**
 * The price as it should read on the page, or null when there is none.
 *
 * NULL IS ORDINARY. Most of the catalogue carried no price at all until the
 * office started entering them, and a piece quoted per commission still
 * carries none on purpose. Callers show "Price on request" for null — the
 * text every product used to show — rather than an empty space or a zero.
 *
 * WHY THE VALUE IS COERCED
 *   The column is `numeric(12, 2)`. PostgREST is free to hand a numeric back
 *   as a JSON string to avoid losing precision, and has been known to, so a
 *   number here cannot be assumed however the type reads. `Number()` on a
 *   string that is already a number costs nothing; getting "1200.00" printed
 *   raw onto the page is the failure it avoids.
 *
 * WHOLE LARI WHEN IT IS WHOLE. The trailing `.00` on a numeric(12, 2) is noise
 * on a list where nothing is quoted in tetri, and it makes the figure harder to
 * read at a glance down a grid. A price that does have tetri keeps them, and
 * keeps BOTH of them — 1899.5 is ₾1,899.50, never ₾1,899.5.
 *
 * WHY THE SYMBOL IS APPENDED BY HAND rather than by `style: 'currency'`. That
 * option renders GEL as the letters "GEL" in both of this site's locales —
 * checked in the browser, not assumed — and "GEL 1,200" on a Georgian
 * furniture page is wrong in the way a machine translation is wrong. The
 * grouping and the decimals still come from Intl, which is the part worth
 * having; only the symbol is ours.
 */
export function productPrice(product: Product, lang: Language): string | null {
  if (product.price === null || product.price === undefined) return null

  const amount = Number(product.price)
  // A non-numeric value in the column is a broken row, not a free piece.
  if (!Number.isFinite(amount)) return null

  /*
   * Zero reads as "Price on request" rather than as "free". Nothing in this
   * catalogue is given away, so a zero in the column is an empty field somebody
   * typed a 0 into, and the honest thing to show is the same line a piece with
   * no price shows. Negative is meaningless here for the same reason.
   */
  if (amount <= 0) return null

  const whole = Number.isInteger(amount)

  const figure = new Intl.NumberFormat(LANGUAGE_TAGS[lang], {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount)

  return `${figure} ₾`
}

/**
 * Alt text for a product photograph.
 *
 * Describes the piece and what it is made of, because "product image" tells a
 * screen-reader user nothing they could act on.
 */
export function productImageAlt(product: Product, lang: Language): string {
  const materials = productMaterials(product, lang)
  const title = productTitle(product, lang)
  return materials ? `${title} — ${materials}` : title
}
