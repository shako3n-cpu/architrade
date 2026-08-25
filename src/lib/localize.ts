import type { Language } from '@/config/site'
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
