import type { Category, Product, StaffMember, StaffRole } from '@/data/types'
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

/**
 * Removes a product permanently. ADMINS ONLY.
 *
 * The row goes, and with it the link between the piece and its photographs —
 * the files stay in the bucket. That is deliberate: a delete pressed by
 * mistake should not also destroy the photography, which is the expensive part
 * to replace.
 *
 * The dashboard hides this button from operators, but that is only politeness.
 * The delete policy in supabase-rbac.sql is what refuses it, and it refuses it
 * for a hand-written request just the same.
 *
 * Archiving is the better route even for an admin: it is reversible for thirty
 * days, and when the thirty days are up the purge takes the photographs with
 * it — which this does not.
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getSupabase().from('products').delete().eq('id', id)
  if (error) throw error
}

/**
 * Takes a piece off the public site without destroying it — the soft delete.
 *
 * This is what an operator gets instead of a delete, and what an admin should
 * reach for first. Everything is kept: the row, the photographs, the text. The
 * piece simply stops being returned to the public site's queries.
 *
 * `deleted_at` is deliberately NOT sent from here. A trigger sets it — see
 * supabase-retention.sql — so that the timestamp is right whichever way the
 * row was archived, including from the SQL editor. Thirty days after it is
 * stamped the piece is deleted for good, photographs included.
 */
export async function archiveProduct(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('products')
    .update({ is_archived: true })
    .eq('id', id)

  if (error) throw error
}

/**
 * Puts an archived piece back on the public site. ADMINS ONLY.
 *
 * Enforced in the database rather than here: an operator's update policy can
 * only see rows where `is_archived = false`, so an archived row is not visible
 * to their UPDATE at all and this call is refused.
 *
 * The same trigger clears `deleted_at`, so restoring stops the thirty day
 * clock as one change rather than two.
 */
export async function restoreProduct(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('products')
    .update({ is_archived: false })
    .eq('id', id)

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

/* -------------------------------------------------------------------------- */
/* Staff                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Everyone with access to the dashboard. ADMINS ONLY — an operator's select
 * policy returns only their own row, which is how the dashboard learns its own
 * role without being able to enumerate colleagues.
 */
export async function fetchStaff(signal?: AbortSignal): Promise<StaffMember[]> {
  const query = getSupabase()
    .from('admins')
    .select('user_id, email, role, created_at')
    .order('role', { ascending: true })
    .order('email', { ascending: true })

  const { data, error } = signal ? await query.abortSignal(signal) : await query

  if (error) throw error
  return (data ?? []) as StaffMember[]
}

/** Promotes or demotes somebody already on the list. ADMINS ONLY. */
export async function updateStaffRole(userId: string, role: StaffRole): Promise<void> {
  const { error } = await getSupabase()
    .from('admins')
    .update({ role })
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Takes somebody off the staff list. ADMINS ONLY.
 *
 * Their Supabase Auth account is NOT deleted — removing that needs the
 * service_role key, which no browser may hold. They keep an account they can
 * sign into and it can do nothing: /admin shows them "this account cannot edit
 * the catalog" and every write policy refuses them. Delete the account itself
 * in Dashboard -> Authentication -> Users if you want it gone entirely.
 */
export async function removeStaff(userId: string): Promise<void> {
  const { error } = await getSupabase().from('admins').delete().eq('user_id', userId)
  if (error) throw error
}

/** Raised when the edge function has not been deployed to the project yet. */
export class FunctionMissingError extends Error {
  override name = 'FunctionMissingError'
}

/**
 * Creates a brand new account and puts it on the staff list. ADMINS ONLY.
 *
 * This is the one thing the browser cannot do for itself. Making a user in
 * Supabase Auth requires the service_role key, and that key bypasses row level
 * security on every table in the project — so it lives in an edge function on
 * a server, and the browser calls the function instead of holding the key.
 * See supabase/functions/admin-users/index.ts.
 *
 * supabase-js attaches the caller's access token to the request, which is what
 * the function uses to check that the caller really is an administrator.
 */
export async function createStaffAccount(input: {
  email: string
  password: string
  role: StaffRole
}): Promise<void> {
  const { error } = await getSupabase().functions.invoke('admin-users', {
    method: 'POST',
    body: input,
  })

  if (!error) return

  // A project that has never deployed the function answers 404. Saying "not
  // deployed" is far more use than "Edge Function returned a non-2xx status".
  const status = (error as { context?: { status?: number } }).context?.status
  if (status === 404) throw new FunctionMissingError('admin-users is not deployed')

  throw error
}
