import type { Language } from '@/config/site'
import { categories, getCategoryBySlug, getSubcategory } from './categories'
import { collections, getCollectionBySlug } from './collections'
import { products } from './products'
import type { SeedProduct } from './types'

/**
 * ============================================================================
 * CATALOGUE LOOKUPS
 * ----------------------------------------------------------------------------
 * Every page reads the catalogue through this file rather than importing
 * products.ts directly. That keeps the data files free of code, so a
 * non-developer can edit them without meeting a single function.
 * ============================================================================
 */

export { categories, getCategoryBySlug, getSubcategory }
export { collections, getCollectionBySlug }
export { products }
export type * from './types'

/** One product by its URL slug. Undefined when the slug is unknown. */
export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug)
}

/** Everything inside a category, in catalogue order. */
export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) => product.categorySlug === categorySlug)
}

/** Everything inside one subcategory of one category. */
export function getProductsBySubcategory(categorySlug: string, subcategorySlug: string) {
  return products.filter(
    (product) =>
      product.categorySlug === categorySlug && product.subcategorySlug === subcategorySlug,
  )
}

/** Everything in a collection. Products with collectionSlug: '' are never included. */
export function getProductsByCollection(collectionSlug: string) {
  return collectionSlug
    ? products.filter((product) => product.collectionSlug === collectionSlug)
    : []
}

/** How many pieces a category holds. Counted, never typed by hand. */
export function countProductsByCategory(categorySlug: string) {
  return getProductsByCategory(categorySlug).length
}

/** Pieces flagged isFeatured, for the home page feature block. */
export function getFeaturedProducts(limit?: number) {
  const featured = products.filter((product) => product.isFeatured)
  return typeof limit === 'number' ? featured.slice(0, limit) : featured
}

/** Pieces flagged isNew, for the home page "New arrivals" row. */
export function getNewProducts(limit?: number) {
  const fresh = products.filter((product) => product.isNew)
  return typeof limit === 'number' ? fresh.slice(0, limit) : fresh
}

/**
 * Pieces to show under a product page.
 *
 * Prefers the same collection, then the same subcategory, then the same
 * category — so the row is never empty and never repeats the piece itself.
 */
export function getRelatedProducts(product: SeedProduct, limit = 4) {
  const scored = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0
      if (candidate.collectionSlug && candidate.collectionSlug === product.collectionSlug) score += 4
      if (candidate.subcategorySlug === product.subcategorySlug) score += 2
      if (candidate.categorySlug === product.categorySlug) score += 1
      return { candidate, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.candidate)
}

/**
 * Free-text search over the visible name, the short description and the
 * article number. Article numbers are matched case-insensitively so a visitor
 * can type "at-lr-101" and still find AT-LR-101.
 */
export function searchProducts(list: SeedProduct[], query: string, lang: Language) {
  const needle = query.trim().toLowerCase()
  if (!needle) return list

  return list.filter((product) => {
    const haystack = [
      product.name[lang],
      product.shortDescription[lang],
      product.articleNumber,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(needle)
  })
}

/** The sort options offered in the catalogue toolbar. */
export type SortOrder = 'newest' | 'name-asc'

/**
 * Returns a sorted copy — the original list is left alone.
 *
 * "newest" puts everything flagged isNew first and keeps catalogue order
 * inside each group, because products carry no date field.
 */
export function sortProducts(list: SeedProduct[], order: SortOrder, lang: Language) {
  const sorted = [...list]

  if (order === 'name-asc') {
    // localeCompare with the Georgian locale so ა…ჰ sorts correctly.
    return sorted.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang))
  }

  return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew))
}

/**
 * Every distinct finish across a set of products, for the colour filter.
 * Keyed by hex, because two collections can name the same colour differently.
 */
export function getFinishOptions(list: SeedProduct[] = products) {
  const seen = new Map<string, SeedProduct['finishes'][number]>()

  for (const product of list) {
    for (const finish of product.finishes) {
      if (!seen.has(finish.hex)) seen.set(finish.hex, finish)
    }
  }

  return [...seen.values()]
}
