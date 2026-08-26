import type { Category, Product } from '@/data/types'
import { getSupabase } from './supabase'

/**
 * ============================================================================
 * CATALOGUE WRITES
 * ----------------------------------------------------------------------------
 * Everything the admin dashboard changes goes through this file, the way every
 * read goes through queries.ts. Nothing here is reachable from the public site.
 *
 * All of it depends on supabase-admin-setup.sql having been run. Without it
 * the tables have no insert / update / delete policy and the database refuses
 * every call below — see `explainWriteFailure` at the bottom, which turns that
 * refusal into a sentence a non-technical person can act on.
 * ============================================================================
 */

/** The fields the product form edits. `images` holds full public URLs. */
export type ProductDraft = {
  slug: string
  title_ka: string
  title_en: string
  description_ka: string
  description_en: string
  materials_ka: string
  materials_en: string
  dimensions: string
  category_id: string
  images: string[]
  featured: boolean
  price: number | null
}

/** The fields the categories screen edits. */
export type CategoryDraft = {
  slug: string
  title_ka: string
  title_en: string
}

/**
 * A URL-safe slug derived from the English title.
 *
 * The slug is what appears in the address bar, so it must be ASCII. Georgian
 * text transliterates to nothing useful here, which is why the English title
 * is the source and why a piece with no English title falls back to a stamp
 * rather than to an empty string.
 */
export function slugify(source: string): string {
  const slug = source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)

  return slug || `item-${Date.now().toString(36)}`
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const { data, error } = await getSupabase()
    .from('products')
    .insert(draft)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, draft: ProductDraft): Promise<Product> {
  const { data, error } = await getSupabase()
    .from('products')
    .update(draft)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getSupabase().from('products').delete().eq('id', id)
  if (error) throw error
}

export async function createCategory(draft: CategoryDraft): Promise<Category> {
  const { data, error } = await getSupabase()
    .from('categories')
    .insert(draft)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

/**
 * Renames a category — its two titles only.
 *
 * The slug is deliberately NOT editable. It is the address of the category
 * page, so changing it breaks every existing link to that page, including any
 * a customer has bookmarked or that a search engine has indexed.
 */
export async function renameCategory(
  id: string,
  titles: { title_ka: string; title_en: string },
): Promise<Category> {
  const { data, error } = await getSupabase()
    .from('categories')
    .update(titles)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

/* -------------------------------------------------------------------------- */
/* Turning database errors into something readable                            */
/* -------------------------------------------------------------------------- */

/** Postgres error codes the dashboard can explain specifically. */
const UNIQUE_VIOLATION = '23505'
const UNDEFINED_COLUMN = '42703'
const UNDEFINED_TABLE = '42P01'
/** PostgREST's code for "row level security refused this". */
const RLS_VIOLATION = '42501'

/*
 * PostgREST has its own codes that do NOT match the Postgres ones, and it
 * answers with these before the query ever reaches the database — it keeps a
 * cached picture of the schema and rejects anything that does not fit.
 *
 * Both were confirmed against the live project. They are exactly what a
 * dashboard hits when supabase-admin-setup.sql has not been run:
 *   PGRST204 — saving a product sends `price`, a column that does not exist
 *   PGRST205 — the `admins` table does not exist
 */
const PGRST_UNKNOWN_COLUMN = 'PGRST204'
const PGRST_UNKNOWN_TABLE = 'PGRST205'

export type WriteFailure = 'duplicateSlug' | 'setupMissing' | 'notPermitted' | 'unknown'

/**
 * Classifies a failed write so the screen can show a sentence about what to do
 * rather than a raw Postgres message.
 *
 * The two that matter most are the ones a new installation hits: a missing
 * policy (setup file never run) and a refusal (account not on the admin list).
 * Both are configuration, not mistakes by the person at the keyboard, and
 * saying so saves them hunting for a typo that is not there.
 */
export function explainWriteFailure(error: unknown): WriteFailure {
  const code = (error as { code?: string } | null)?.code
  const message = (error as { message?: string } | null)?.message ?? ''

  if (code === UNIQUE_VIOLATION) return 'duplicateSlug'
  if (
    code === UNDEFINED_TABLE ||
    code === UNDEFINED_COLUMN ||
    code === PGRST_UNKNOWN_TABLE ||
    code === PGRST_UNKNOWN_COLUMN
  ) {
    return 'setupMissing'
  }
  if (code === RLS_VIOLATION) return 'notPermitted'

  // Storage refusals and some PostgREST paths arrive as plain text without a
  // code, so the wording is the only thing left to go on.
  if (/row-level security|violates row-level/i.test(message)) return 'notPermitted'
  if (/bucket not found/i.test(message)) return 'setupMissing'

  return 'unknown'
}
