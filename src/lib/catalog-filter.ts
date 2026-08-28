import type { Category, Product } from '@/data/types'
import { buildCategoryTree, flattenTree, subtreeIds } from './category-tree'

/**
 * ============================================================================
 * CATALOGUE FILTERING
 * ----------------------------------------------------------------------------
 * Pure functions, no React, no locale lookups. The catalogue page owns where
 * the filter values come from (the query string) and this owns what they mean.
 *
 * FILTERING HAPPENS IN THE BROWSER, DELIBERATELY
 *   The whole catalogue is a few dozen rows and the home page already loads
 *   all of it, so a round trip per keystroke would be slower than the work
 *   itself. If the catalogue ever reaches the low thousands this moves into
 *   PostgREST — the shape below is the same either way, which is why it is
 *   separated from the component.
 * ============================================================================
 */

export interface CatalogFilters {
  /** A `categories.slug`, or '' for every category. */
  category: string
  /** Free text typed into the search field. */
  query: string
  /** Narrow to the pieces flagged `featured` in the database. */
  featuredOnly: boolean
}

export const EMPTY_FILTERS: CatalogFilters = {
  category: '',
  query: '',
  featuredOnly: false,
}

/** True when nothing is narrowed — used to hide the "clear" control. */
export function isUnfiltered(filters: CatalogFilters): boolean {
  return !filters.category && !filters.query.trim() && !filters.featuredOnly
}

/**
 * Everything about a piece that a search should look at.
 *
 * BOTH LANGUAGES, ALWAYS. A Georgian visitor typing "Aeron" and an English
 * one typing "სავარძელი" should each find the chair, and neither would if the
 * haystack were limited to the language the page happens to be in. The slug
 * is included so a pasted URL fragment finds its own product.
 */
function haystack(product: Product): string {
  return [
    product.title_ka,
    product.title_en,
    product.description_ka,
    product.description_en,
    product.materials_ka,
    product.materials_en,
    product.dimensions,
    product.slug,
  ]
    .join(' ')
    .toLowerCase()
}

/**
 * Apply the filters. Order is preserved — whatever the query returned.
 *
 * Every term must match, rather than any: someone typing "oak desk" wants the
 * oak desks, not every oak piece followed by every desk.
 */
export function filterProducts(
  products: Product[],
  categories: Category[],
  filters: CatalogFilters,
): Product[] {
  /*
   * A parent matches everything beneath it.
   *
   * Products are filed on the leaves, so selecting "Office" and comparing ids
   * would return nothing at all — the row a visitor is most likely to click
   * would be the one that looks broken. The set of acceptable ids is the whole
   * subtree; for a leaf, that set is just itself.
   */
  const allowed = filters.category
    ? new Set(subtreeIds(buildCategoryTree(categories), filters.category))
    : null

  // A slug in the URL that matches no category would otherwise fall through
  // and show everything, which reads as a broken filter rather than a typo.
  if (filters.category && (!allowed || allowed.size === 0)) return []

  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean)

  return products.filter((product) => {
    if (allowed && (!product.category_id || !allowed.has(product.category_id))) return false
    if (filters.featuredOnly && !product.featured) return false
    if (terms.length === 0) return true

    const text = haystack(product)
    return terms.every((term) => text.includes(term))
  })
}

/**
 * How many live pieces sit in each category, keyed by slug.
 *
 * A parent's count INCLUDES its descendants, for the same reason the filter
 * matches them: a rail that offers "Office" next to a 0 while the four rows
 * under it add up to nine is not reporting a total, it is reporting a
 * discrepancy the visitor has to resolve themselves.
 */
export function countByCategory(
  products: Product[],
  categories: Category[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const node of flattenTree(buildCategoryTree(categories, products))) {
    counts[node.category.slug] = node.totalCount
  }

  // A category the tree dropped (a dangling parent_id, say) still needs a
  // number rather than `undefined` rendering as a blank where a count goes.
  for (const category of categories) counts[category.slug] ??= 0

  return counts
}
