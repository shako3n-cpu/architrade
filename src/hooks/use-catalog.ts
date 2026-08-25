import { useCallback } from 'react'
import {
  fetchCatalogue,
  fetchCategories,
  fetchCategoryBySlug,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchProducts,
  fetchProductsByCategorySlug,
} from '@/lib/queries'
import { useAsync } from './use-async'

/**
 * ============================================================================
 * CATALOGUE HOOKS
 * ----------------------------------------------------------------------------
 * What pages actually call. Each returns the same shape:
 *
 *   const { data, status, error, retry } = useProducts()
 *
 *   status === 'loading'  -> show the skeleton
 *   status === 'error'    -> show the error state, wire its button to retry
 *   status === 'success'  -> data is ready (an empty array is not an error)
 *
 * Pass the whole result to <QueryState> and it handles all three for you.
 * ============================================================================
 */

/** Every category in the database. */
export function useCategories() {
  return useAsync(useCallback((signal: AbortSignal) => fetchCategories(signal), []), [])
}

/** Every product in the database, newest first. */
export function useProducts() {
  return useAsync(useCallback((signal: AbortSignal) => fetchProducts(signal), []), [])
}

/** Categories and products together, fetched in parallel. */
export function useCatalogue() {
  return useAsync(useCallback((signal: AbortSignal) => fetchCatalogue(signal), []), [])
}

/** One category by slug. `data` is null when the slug matches nothing. */
export function useCategory(slug: string) {
  return useAsync(
    useCallback((signal: AbortSignal) => fetchCategoryBySlug(slug, signal), [slug]),
    [slug],
  )
}

/** One product by slug. `data` is null when the slug matches nothing. */
export function useProduct(slug: string) {
  return useAsync(
    useCallback((signal: AbortSignal) => fetchProductBySlug(slug, signal), [slug]),
    [slug],
  )
}

/** Everything inside one category, found by that category's slug. */
export function useCategoryProducts(slug: string) {
  return useAsync(
    useCallback((signal: AbortSignal) => fetchProductsByCategorySlug(slug, signal), [slug]),
    [slug],
  )
}

/** Products flagged `featured`, for the home page. */
export function useFeaturedProducts(limit = 6) {
  return useAsync(
    useCallback((signal: AbortSignal) => fetchFeaturedProducts(limit, signal), [limit]),
    [limit],
  )
}
