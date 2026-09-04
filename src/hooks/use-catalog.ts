import { useCallback } from 'react'
import {
  fetchBrands,
  fetchCatalogue,
  fetchCategories,
  fetchCategoryPage,
  fetchProductPage,
} from '@/lib/queries'
import { useAsync } from './use-async'

/**
 * ============================================================================
 * CATALOGUE HOOKS
 * ----------------------------------------------------------------------------
 * What pages actually call. Each returns the same shape:
 *
 *   const { data, status, error, retry } = useCategories()
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

/** Categories and products together, fetched in parallel. */
export function useCatalogue(includeArchived = false) {
  return useAsync(
    useCallback(
      (signal: AbortSignal) => fetchCatalogue(signal, includeArchived),
      [includeArchived],
    ),
    [includeArchived],
  )
}

/**
 * One product plus everything shown around it: the categories (for the
 * breadcrumb and the related tags) and the related pieces.
 *
 * `data.product` is null when the slug matches nothing, which the page turns
 * into a not-found state rather than an error — a mistyped URL is not a
 * failure of the server.
 */
export function useProductPage(slug: string) {
  return useAsync(
    useCallback((signal: AbortSignal) => fetchProductPage(slug, signal), [slug]),
    [slug],
  )
}

/**
 * One category plus everything shown around it: the pieces inside it and the
 * full category list for the browse row.
 *
 * `data.category` is null when the slug matches nothing, which the page turns
 * into a not-found state rather than an error — a mistyped URL is not a
 * failure of the server.
 */
export function useCategoryPage(slug: string) {
  return useAsync(
    useCallback((signal: AbortSignal) => fetchCategoryPage(slug, signal), [slug]),
    [slug],
  )
}

/**
 * Every active partner house.
 *
 * Its own hook rather than a field on useCatalogue: the brands page needs
 * these and no products, and the catalogue pages need products and no brands.
 * Folding them together would make each page pay for the other's query.
 */
export function useBrands() {
  return useAsync(useCallback((signal: AbortSignal) => fetchBrands(signal), []), [])
}
