import type { Brand, Category, Product } from '@/data/types'
import { buildCategoryTree, subtreeIds } from './category-tree'
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
const CATEGORY_COLUMNS = 'id, slug, title_ka, title_en, created_at, group_key, image, sort_order, parent_id, is_active, featured'

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

/**
 * The middle rung: everything supabase-schema.sql added, but nothing from
 * supabase-category-tree.sql.
 *
 * There are now three possible shapes of this table in the wild — original,
 * schema-migrated, tree-migrated — and PostgREST fails a select outright if
 * ANY named column is missing, so one fallback is no longer enough. Asking in
 * descending order of richness means a database gets the best answer it can
 * actually give, and a site running against the un-migrated one degrades to a
 * flat catalogue rather than a blank page.
 *
 * Delete this rung, and the chain, once every environment has been migrated.
 */
// prettier-ignore
const CATEGORY_COLUMNS_FLAT = 'id, slug, title_ka, title_en, created_at, group_key, image, sort_order'

/*
 * `brand_id` is listed here WITHOUT a fallback rung, unlike the archive
 * columns below and unlike the late additions to `categories`.
 *
 * That is the existing rule for this list rather than a new one: every other
 * name in it — materials_ka, dimensions, images — is also required outright,
 * because they arrived with the base schema and a database missing them is not
 * a half-migrated installation, it is a broken one. supabase-brands.sql is
 * part of the schema on the same terms. The archive columns get a fallback
 * only because they were bolted on afterwards, for RBAC, on a database that
 * was already serving.
 */
// prettier-ignore
const PRODUCT_COLUMNS = 'id, slug, title_ka, title_en, description_ka, description_en, materials_ka, materials_en, dimensions, images, featured, category_id, brand_id, created_at'

/**
 * The same list plus the two archive columns, for the dashboard, which has to
 * show the archive, mark it, and say how long each piece has left before it is
 * purged. The public site never asks for either: it filters on them instead
 * and has no use for the values themselves.
 */
// prettier-ignore
const PRODUCT_COLUMNS_ADMIN = 'id, slug, title_ka, title_en, description_ka, description_en, materials_ka, materials_en, dimensions, images, featured, category_id, brand_id, created_at, is_archived, deleted_at'

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
  ...attempts: Array<() => Promise<{ data: T | null; error: PgError | null }>>
): Promise<T | null> {
  for (let i = 0; i < attempts.length; i += 1) {
    const result = await attempts[i]()
    if (!result.error) return result.data

    // Anything other than a missing column is a real failure and is thrown as
    // itself — a broken query must never be disguised as a schema mismatch.
    // The last rung throws too: if even the base columns are missing, there is
    // nothing left to fall back to.
    if (!isMissingColumn(result.error) || i === attempts.length - 1) {
      throw new Error(result.error.message)
    }
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Archived pieces                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Set the first time the database says it has no `is_archived` column, so the
 * fallback is paid once per page load rather than on every request.
 *
 * supabase-rbac.sql adds the column. Until it has been run — and on the day
 * this ships it will not have been — every product query would otherwise fail
 * outright and the catalogue would go blank. Falling back means the site
 * behaves exactly as it did before, with nothing archived because nothing can
 * be. Delete this and `live()` once every environment has been migrated.
 */
let archivingUnavailable = false

/**
 * Narrows a query to the pieces the public is allowed to see.
 *
 * Two conditions where one would do. `deleted_at` is set by the database in
 * step with `is_archived` — see supabase-retention.sql — so a row can only
 * fail one of these by failing both. Asking for both anyway costs nothing (the
 * partial indexes carry the same pair) and means a row that somehow acquires
 * one without the other still never reaches a customer.
 */
function live<
  T extends { eq(column: string, value: unknown): T; is(column: string, value: null): T },
>(builder: T): T {
  if (archivingUnavailable) return builder
  return builder.eq('is_archived', false).is('deleted_at', null)
}

/**
 * Runs a product query, and runs it again unfiltered if the only thing wrong
 * was that the column does not exist yet. Every other error is thrown as-is,
 * so a genuine failure is never disguised as a schema mismatch.
 */
async function withArchiveFallback<T>(
  run: () => Promise<{ data: T[] | null; error: PgError | null }>,
): Promise<T[]> {
  const result = await run()
  if (!result.error) return result.data ?? []
  if (!isMissingColumn(result.error)) throw new Error(result.error.message)

  archivingUnavailable = true
  return unwrap<T>(await run())
}

/** Every category, in display order. */
export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const ordered = (columns: string) => {
    const query = getSupabase()
      .from('categories')
      .select(columns)
      .order('sort_order', { ascending: true })
      .order('slug', { ascending: true })

    return withSignal(query, signal) as unknown as Promise<{
      data: Category[] | null
      error: PgError | null
    }>
  }

  const rows = await withColumnFallback<Category[]>(
    () => ordered(CATEGORY_COLUMNS),
    () => ordered(CATEGORY_COLUMNS_FLAT),
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
  const one = (columns: string) => {
    const query = getSupabase().from('categories').select(columns).eq('slug', slug)
    return withSignal(query, signal).maybeSingle() as unknown as Promise<{
      data: Category | null
      error: PgError | null
    }>
  }

  // maybeSingle returns null instead of erroring when nothing matches, which
  // is exactly what a "category not found" page wants.
  return withColumnFallback<Category>(
    () => one(CATEGORY_COLUMNS),
    () => one(CATEGORY_COLUMNS_FLAT),
    () => one(CATEGORY_COLUMNS_BASE),
  )
}

/**
 * Every product, newest first.
 *
 * `includeArchived` is for the admin dashboard and nowhere else. The public
 * site must never pass it — an archived piece is one the office has taken down
 * and does not want a customer to find.
 */
export async function fetchProducts(
  signal?: AbortSignal,
  includeArchived = false,
): Promise<Product[]> {
  return withArchiveFallback<Product>(async () => {
    const base = getSupabase()
      .from('products')
      // On a database without the archive columns the admin list cannot ask
      // for them by name either, so the retry has to fall back to the plain
      // list rather than repeating a select that has already been rejected.
      .select(includeArchived && !archivingUnavailable ? PRODUCT_COLUMNS_ADMIN : PRODUCT_COLUMNS)
      .order('created_at', { ascending: false })

    // The admin list asks for the column by name and the public list filters
    // on it; on a database without it, both need the same fallback.
    const query = includeArchived ? base : live(base)

    return (await withSignal(query, signal)) as unknown as {
      data: Product[] | null
      error: PgError | null
    }
  })
}

/** One product by the slug in the URL. Null when no such product exists. */
export async function fetchProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Product | null> {
  const run = async () => {
    const base = getSupabase().from('products').select(PRODUCT_COLUMNS).eq('slug', slug)
    return withSignal(live(base), signal).maybeSingle()
  }

  const { data, error } = await run()

  if (error) {
    if (!isMissingColumn(error)) throw new Error(error.message)
    archivingUnavailable = true

    const retry = await run()
    if (retry.error) throw new Error(retry.error.message)
    return retry.data as Product | null
  }

  // An archived piece is filtered out above, so it arrives here as null and
  // the page shows "we could not find that piece" — which is the truth, as far
  // as the public site is concerned.
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

  return withArchiveFallback<Product>(async () => {
    const base = getSupabase()
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('category_id', category.id)
      .order('created_at', { ascending: false })

    return (await withSignal(live(base), signal)) as unknown as {
      data: Product[] | null
      error: PgError | null
    }
  })
}

/** Products flagged `featured`, for the home page. */
export async function fetchFeaturedProducts(limit = 6, signal?: AbortSignal): Promise<Product[]> {
  return withArchiveFallback<Product>(async () => {
    const base = getSupabase()
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (await withSignal(live(base), signal)) as unknown as {
      data: Product[] | null
      error: PgError | null
    }
  })
}

/**
 * Categories and products in one go, for pages that group one by the other.
 * Runs both requests at the same time rather than one after the other.
 */
export async function fetchCatalogue(signal?: AbortSignal, includeArchived = false) {
  const [categories, products] = await Promise.all([
    fetchCategories(signal),
    fetchProducts(signal, includeArchived),
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
  const siblings = await withArchiveFallback<Product>(async () => {
    const base = getSupabase()
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('category_id', product.category_id)
      // Never recommend the piece the visitor is already looking at.
      .neq('id', product.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (await withSignal(live(base), signal)) as unknown as {
      data: Product[] | null
      error: PgError | null
    }
  })
  if (siblings.length >= limit) return siblings

  // Everything in this query sits outside the product's own category, so the
  // current product is already excluded and cannot appear twice.
  const filler = await withArchiveFallback<Product>(async () => {
    const base = getSupabase()
      .from('products')
      .select(PRODUCT_COLUMNS)
      .neq('category_id', product.category_id)
      .order('created_at', { ascending: false })
      .limit(limit - siblings.length)

    return (await withSignal(live(base), signal)) as unknown as {
      data: Product[] | null
      error: PgError | null
    }
  })

  return [...siblings, ...filler]
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

  /*
   * THE WHOLE SUBTREE, NOT JUST THIS ROW.
   *
   * Browsing to Office has to show what is in Office Desks and Office Chairs.
   * Filing products on the leaves — which is where they belong — means every
   * parent holds nothing directly, so `eq('category_id', category.id)` renders
   * a correct and completely empty page for exactly the categories a visitor
   * clicks first. Collecting the ids beneath this one and asking for all of
   * them is what makes a parent browsable at all.
   *
   * On an un-migrated database nothing has a parent, so the subtree is the
   * category itself and this behaves exactly as the old query did.
   */
  const ids = subtreeIds(buildCategoryTree(categories), category.slug)

  const query = getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('category_id', ids.length > 0 ? ids : [category.id])
    .order('created_at', { ascending: false })

  return { category, products: unwrap<Product>(await withSignal(query, signal)), categories }
}

/* -------------------------------------------------------------------------- */
/* Brands                                                                     */
/* -------------------------------------------------------------------------- */

// prettier-ignore
const BRAND_COLUMNS = 'id, slug, name, discipline, country, image, logo, website, description_ka, description_en, sort_order, is_active, created_at'

/**
 * Every ACTIVE partner house, in the order the office arranged them.
 *
 * Hiding rather than deleting is the useful operation here: an agency
 * agreement lapses far more often than a house stops existing, and a hidden
 * row keeps its photograph, its country and whatever description was written
 * for the day it comes back. So the filter is on `is_active` and the dashboard
 * is the only place that sees everything.
 *
 * Ordered in the database rather than in the client, because `sort_order` is
 * what the dashboard's reordering writes, and sorting it again here would let
 * the two disagree.
 *
 * Returns an empty array on a database that has no brands table yet, rather
 * than throwing: /brands then renders its empty state, which is the truthful
 * thing for a site whose partner list has not been migrated.
 */
export async function fetchBrands(signal?: AbortSignal): Promise<Brand[]> {
  const query = getSupabase()
    .from('brands')
    .select(BRAND_COLUMNS)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const result = (await withSignal(query, signal)) as unknown as {
    data: Brand[] | null
    error: PgError | null
  }

  // 42P01 is "undefined table" — the migration has not been run here.
  if (result.error?.code === '42P01') return []
  return unwrap<Brand>(result)
}
