import type { Category, Product } from '@/data/types'
import { getSupabase } from './supabase'

/**
 * ============================================================================
 * CATALOGUE QUERIES
 * ----------------------------------------------------------------------------
 * Every read the site makes from Supabase lives here, so there is exactly one
 * place to look when a query is wrong and one place to change when a column
 * is renamed.
 *
 * Columns are listed explicitly rather than with `select('*')`. Two reasons:
 * the TypeScript type then describes exactly what comes back, and adding a
 * column to the table cannot silently change what the site downloads.
 *
 * Each function throws on failure. The hooks in src/hooks/use-catalog.ts catch
 * that and turn it into an error state on the page.
 *
 * Every function takes an optional AbortSignal. The hooks pass one so that a
 * request belonging to a page the visitor has already navigated away from is
 * cancelled instead of writing into a component that no longer exists.
 * ============================================================================
 */

/*
 * These two MUST each stay one unbroken string literal.
 *
 * supabase-js reads the select list in the type system to work out the shape
 * of `data`. It can only do that for a literal it can see whole — an array
 * joined with .join(), or two literals added with +, both widen to plain
 * `string`, and the query then types its result as an error instead of a row.
 * Long lines here are deliberate. Do not "tidy" them onto several lines.
 */
const CATEGORY_COLUMNS = 'id, slug, title_ka, title_en, created_at'

// prettier-ignore
const PRODUCT_COLUMNS = 'id, slug, title_ka, title_en, description_ka, description_en, materials_ka, materials_en, dimensions, images, featured, category_id, created_at'

/** Applies the abort signal only when the caller supplied one. */
function withSignal<T extends { abortSignal(signal: AbortSignal): T }>(
  builder: T,
  signal?: AbortSignal,
): T {
  return signal ? builder.abortSignal(signal) : builder
}

/** Turns a Supabase error into a thrown Error so the hooks catch one thing. */
function unwrap<T>(result: { data: T[] | null; error: { message: string } | null }): T[] {
  if (result.error) throw new Error(result.error.message)
  // A successful select always returns an array, never null.
  return result.data ?? []
}

/** Every category. Oldest first, then by slug so the order is stable. */
export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const query = getSupabase()
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .order('created_at', { ascending: true })
    .order('slug', { ascending: true })

  return unwrap<Category>(await withSignal(query, signal))
}

/** One category by the slug in the URL. Null when no such category exists. */
export async function fetchCategoryBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Category | null> {
  const query = getSupabase().from('categories').select(CATEGORY_COLUMNS).eq('slug', slug)

  // maybeSingle returns null instead of erroring when nothing matches, which
  // is exactly what a "category not found" page wants.
  const { data, error } = await withSignal(query, signal).maybeSingle()

  if (error) throw new Error(error.message)
  return data as Category | null
}

/** Every product, newest first. */
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const query = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .order('created_at', { ascending: false })

  return unwrap<Product>(await withSignal(query, signal))
}

/** One product by the slug in the URL. Null when no such product exists. */
export async function fetchProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Product | null> {
  const query = getSupabase().from('products').select(PRODUCT_COLUMNS).eq('slug', slug)

  const { data, error } = await withSignal(query, signal).maybeSingle()

  if (error) throw new Error(error.message)
  return data as Product | null
}

/**
 * Products inside one category, found by the category's slug.
 *
 * Two round trips rather than a join, because the URL carries the slug but
 * products are linked by `category_id`.
 */
export async function fetchProductsByCategorySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const category = await fetchCategoryBySlug(slug, signal)
  if (!category) return []

  const query = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  return unwrap<Product>(await withSignal(query, signal))
}

/** Products flagged `featured`, for the home page. */
export async function fetchFeaturedProducts(limit = 6, signal?: AbortSignal): Promise<Product[]> {
  const query = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return unwrap<Product>(await withSignal(query, signal))
}

/**
 * Categories and products in one go, for pages that group one by the other.
 * Runs both requests at the same time rather than one after the other.
 */
export async function fetchCatalogue(signal?: AbortSignal) {
  const [categories, products] = await Promise.all([
    fetchCategories(signal),
    fetchProducts(signal),
  ])

  return { categories, products }
}
