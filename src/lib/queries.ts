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
// prettier-ignore
const CATEGORY_COLUMNS = 'id, slug, title_ka, title_en, created_at, group_key, image, sort_order'

/**
 * The same list without the three columns supabase-schema.sql adds.
 *
 * A database that has not had that file run against it rejects the full list
 * outright — PostgREST fails the whole request rather than returning what it
 * can — so `selectCategories` below retries with this and the site carries on
 * with a slightly plainer home page. Delete both this and the retry once every
 * environment has been migrated.
 */
const CATEGORY_COLUMNS_BASE = 'id, slug, title_ka, title_en, created_at'

// prettier-ignore
const PRODUCT_COLUMNS = 'id, slug, title_ka, title_en, description_ka, description_en, materials_ka, materials_en, dimensions, images, featured, category_id, created_at'

/** Postgres "undefined column", surfaced by PostgREST as the error code. */
const UNDEFINED_COLUMN = '42703'

function isMissingColumn(error: { code?: string } | null): boolean {
  return error?.code === UNDEFINED_COLUMN
}

/** Applies the abort signal only when the caller supplied one. */
function withSignal<T extends { abortSignal(signal: AbortSignal): T }>(
  builder: T,
  signal?: AbortSignal,
): T {
  return signal ? builder.abortSignal(signal) : builder
}

/** The shape of an error from PostgREST, narrowed to the two fields used here. */
type PgError = { message: string; code?: string }

/** Turns a Supabase error into a thrown Error so the hooks catch one thing. */
function unwrap<T>(result: { data: T[] | null; error: PgError | null }): T[] {
  if (result.error) throw new Error(result.error.message)
  // A successful select always returns an array, never null.
  return result.data ?? []
}

/**
 * Runs `full`, and only if the database rejects it for not having the extra
 * category columns, runs `base` instead. Every other error is thrown as-is, so
 * a genuine failure is never disguised as a schema mismatch.
 */
async function withColumnFallback<T>(
  full: () => Promise<{ data: T | null; error: PgError | null }>,
  base: () => Promise<{ data: T | null; error: PgError | null }>,
): Promise<T | null> {
  const result = await full()
  if (!result.error) return result.data
  if (!isMissingColumn(result.error)) throw new Error(result.error.message)

  const fallback = await base()
  if (fallback.error) throw new Error(fallback.error.message)
  return fallback.data
}

/** Every category, in display order. */
export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const rows = await withColumnFallback<Category[]>(
    async () => {
      const query = getSupabase()
        .from('categories')
        .select(CATEGORY_COLUMNS)
        .order('sort_order', { ascending: true })
        .order('slug', { ascending: true })

      return (await withSignal(query, signal)) as unknown as {
        data: Category[] | null
        error: PgError | null
      }
    },
    async () => {
      // No sort_order column means nothing to sort by but age and slug.
      const query = getSupabase()
        .from('categories')
        .select(CATEGORY_COLUMNS_BASE)
        .order('created_at', { ascending: true })
        .order('slug', { ascending: true })

      return (await withSignal(query, signal)) as unknown as {
        data: Category[] | null
        error: PgError | null
      }
    },
  )

  return rows ?? []
}

/** One category by the slug in the URL. Null when no such category exists. */
export async function fetchCategoryBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Category | null> {
  // maybeSingle returns null instead of erroring when nothing matches, which
  // is exactly what a "category not found" page wants.
  return withColumnFallback<Category>(
    async () => {
      const query = getSupabase().from('categories').select(CATEGORY_COLUMNS).eq('slug', slug)
      return (await withSignal(query, signal).maybeSingle()) as unknown as {
        data: Category | null
        error: PgError | null
      }
    },
    async () => {
      const query = getSupabase().from('categories').select(CATEGORY_COLUMNS_BASE).eq('slug', slug)
      return (await withSignal(query, signal).maybeSingle()) as unknown as {
        data: Category | null
        error: PgError | null
      }
    },
  )
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

/** How many pieces the "you might also like" row shows. */
const RELATED_LIMIT = 4

/**
 * Other pieces to show underneath a product.
 *
 * Prefers the same category, because "more dining chairs" is what someone
 * looking at a dining chair usually wants. When that category is too thin to
 * fill the row it tops up with the newest pieces from elsewhere rather than
 * rendering a half-empty band — a young catalogue should not look broken.
 *
 * The second request only happens when the top-up is actually needed.
 */
export async function fetchRelatedProducts(
  product: Product,
  limit = RELATED_LIMIT,
  signal?: AbortSignal,
): Promise<Product[]> {
  const siblingQuery = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category_id', product.category_id)
    // Never recommend the piece the visitor is already looking at.
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  const siblings = unwrap<Product>(await withSignal(siblingQuery, signal))
  if (siblings.length >= limit) return siblings

  // Everything in this query sits outside the product's own category, so the
  // current product is already excluded and cannot appear twice.
  const fillerQuery = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .neq('category_id', product.category_id)
    .order('created_at', { ascending: false })
    .limit(limit - siblings.length)

  return [...siblings, ...unwrap<Product>(await withSignal(fillerQuery, signal))]
}

/** Everything one product detail page needs. */
export type ProductPageData = {
  /** Null when the slug in the URL matches no row — the page shows not-found. */
  product: Product | null
  /** The whole (small) categories table, see the note below. */
  categories: Category[]
  related: Product[]
}

/**
 * The product page in as few round trips as the data allows.
 *
 * Fetches every category rather than just this product's one, because the
 * related-product cards each need their own category name for their tag. The
 * table holds a handful of rows, so one request answers the breadcrumb and
 * every tag at once — cheaper than a lookup per card.
 *
 * The category and related requests run together; both need the product first,
 * so that one is unavoidably sequential.
 */
export async function fetchProductPage(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductPageData> {
  const product = await fetchProductBySlug(slug, signal)
  if (!product) return { product: null, categories: [], related: [] }

  const [categories, related] = await Promise.all([
    fetchCategories(signal),
    fetchRelatedProducts(product, RELATED_LIMIT, signal),
  ])

  return { product, categories, related }
}

/** Everything one category page needs. */
export type CategoryPageData = {
  /** Null when the slug in the URL matches no row — the page shows not-found. */
  category: Category | null
  /** The pieces inside this category, newest first. */
  products: Product[]
  /** The whole categories table, for the "browse other categories" row. */
  categories: Category[]
}

/**
 * The category page in two round trips.
 *
 * Deliberately NOT built from fetchCategoryBySlug + fetchProductsByCategorySlug:
 * that pair asks for the category twice (the second function looks it up again
 * internally to turn the slug into an id) and still leaves the page unable to
 * tell "no such category" from "a category with nothing in it" — both arrive as
 * an empty array. Fetching the whole categories table instead answers three
 * things at once: which category this is, whether it exists at all, and what to
 * put in the browse row. The table holds a handful of rows, so it is cheaper
 * than the extra request it replaces.
 */
export async function fetchCategoryPage(
  slug: string,
  signal?: AbortSignal,
): Promise<CategoryPageData> {
  const categories = await fetchCategories(signal)
  const category = categories.find((item) => item.slug === slug) ?? null

  // A slug nobody recognises: return early rather than querying products for
  // a category id that does not exist.
  if (!category) return { category: null, products: [], categories }

  const query = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  return { category, products: unwrap<Product>(await withSignal(query, signal)), categories }
}
