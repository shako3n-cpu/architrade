import type { Brand, Category, Product, StaffMember, StaffRole } from '@/data/types'
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
  /** Foreign key -> brands.id. Empty string means "not recorded". */
  brand_id: string
  images: string[]
  featured: boolean
  price: number | null
}

/** The fields the categories screen edits. */
export type CategoryDraft = {
  slug: string
  title_ka: string
  title_en: string
  /** null puts the row at the top level. */
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  featured?: boolean
  image?: string | null
}

/**
 * An empty select is "" in a form and NULL in a uuid column.
 *
 * Sending "" straight through fails the insert with an invalid-input-syntax
 * error naming a type rather than a field, which is a confusing way to be told
 * that an optional picker was left alone. Both foreign keys are optional in
 * the form, so both are normalised in one place rather than at each call site.
 */
function withNullableKeys(draft: ProductDraft) {
  return {
    ...draft,
    category_id: draft.category_id || null,
    brand_id: draft.brand_id || null,
  }
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const { data, error } = await getSupabase()
    .from('products')
    .insert(withNullableKeys(draft))
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, draft: ProductDraft): Promise<Product> {
  const { data, error } = await getSupabase()
    .from('products')
    .update(withNullableKeys(draft))
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
 * Any subset of a category's editable fields.
 *
 * One function rather than one per field, because every caller on the tree
 * screen — rename, retitle, move, reorder, show/hide, feature — is the same
 * UPDATE with a different key, and the database applies its own rules
 * regardless of which one it is: the cycle trigger refuses an illegal
 * `parent_id` whether it arrived from a move or from an edit.
 */
export async function updateCategory(
  id: string,
  patch: Partial<Omit<CategoryDraft, 'slug'>>,
): Promise<Category> {
  const { data, error } = await getSupabase()
    .from('categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

/**
 * Deletes a category.
 *
 * The guard is in the DATABASE, not here — supabase-category-tree.sql installs
 * a before-delete trigger that refuses a category still holding subcategories
 * or products. Checking in the browser as well would be a race (someone else
 * can file a product into it between the check and the delete) and a lie (a
 * second admin tab, or anything else with the anon key, is not bound by a
 * check that lives in this function). So the screen asks, the database judges,
 * and `explainWriteFailure` turns the refusal into a sentence.
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase().from('categories').delete().eq('id', id)
  if (error) throw error
}

/**
 * Writes a new order to a run of siblings.
 *
 * Takes the whole list rather than a single "move up", because the positions
 * have to end up contiguous: nudging one row by swapping two numbers works
 * until two rows share a sort_order, at which point the tie breaks on slug and
 * the list appears to reorder itself at random. Renumbering the run from 10 in
 * steps of 10 removes ties by construction and leaves gaps to insert into.
 *
 * The updates are issued together and awaited as one. A partial failure leaves
 * the order wrong but the tree intact — no row can be lost this way — and the
 * screen refetches, so the next render shows whatever actually landed rather
 * than what it hoped for.
 */
export async function reorderCategories(idsInOrder: string[]): Promise<void> {
  const supabase = getSupabase()

  const results = await Promise.all(
    idsInOrder.map((id, index) =>
      supabase
        .from('categories')
        .update({ sort_order: (index + 1) * 10 })
        .eq('id', id),
    ),
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) throw failed.error
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

export type WriteFailure =
  | 'duplicateSlug'
  | 'setupMissing'
  | 'notPermitted'
  | 'categoryHasChildren'
  | 'categoryHasProducts'
  | 'brandHasProducts'
  | 'unknown'

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

  // The delete trigger raises with a machine-readable prefix precisely so this
  // does not have to pattern-match a human sentence that might be translated
  // or reworded later. See supabase-category-tree.sql section 2.
  if (message.includes('CATEGORY_HAS_CHILDREN')) return 'categoryHasChildren'
  if (message.includes('CATEGORY_HAS_PRODUCTS')) return 'categoryHasProducts'
  if (message.includes('BRAND_HAS_PRODUCTS')) return 'brandHasProducts'

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
 * Takes somebody off the staff list AND deletes their login. ADMINS ONLY.
 *
 * THIS USED TO LEAVE THE ACCOUNT BEHIND, AND THAT WAS THE BUG
 *   It deleted the row from `admins` and stopped, because removing an auth
 *   identity needs the service_role key and no browser may hold one. The login
 *   survived every removal: invisible in the dashboard, unable to do anything,
 *   and still holding its email address. Re-adding the same person then failed
 *   on "A user with this email address has already been registered" — a
 *   conflict with an account the dashboard had already said it deleted and had
 *   no way to show.
 *
 *   So removal goes through the same edge function that creates accounts,
 *   which holds the key on a server. One call: `admins.user_id` is
 *   `on delete cascade` against auth.users, so deleting the identity takes the
 *   staff row with it, atomically, rather than this having to delete two
 *   things and hope both land.
 */
export async function removeStaff(userId: string): Promise<void> {
  const { error } = await getSupabase().functions.invoke('admin-users', {
    method: 'DELETE',
    body: { user_id: userId },
  })

  if (!error) return

  const status = (error as { context?: { status?: number } }).context?.status
  if (status === 404) throw new FunctionMissingError('admin-users is not deployed')

  const detail = await readFunctionError(error)
  throw detail ? new Error(detail) : error
}

/**
 * Pulls the sentence the function actually sent back.
 *
 * supabase-js reports every non-2xx as "Edge Function returned a non-2xx
 * status code" and hangs the real response off `context`, unread. That message
 * is the same whether the account already exists, the password is too short,
 * or the function's own key is wrong — so on its own it is worth nothing to
 * the person at the keyboard, and not much more to whoever they ask.
 */
async function readFunctionError(error: unknown): Promise<string | null> {
  const response = (error as { context?: Response }).context
  if (!response || typeof response.clone !== 'function') return null

  try {
    // Cloned, so reading it here cannot stop anything else reading it later.
    const text = await response.clone().text()
    if (!text) return null

    try {
      const body = JSON.parse(text) as { error?: string; detail?: string }
      if (!body.error) return text.slice(0, 300)
      return body.detail ? `${body.error} (${body.detail})` : body.error
    } catch {
      // Not JSON — a gateway error page, most likely. Still better than nothing.
      return text.slice(0, 300)
    }
  } catch {
    return null
  }
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

  const detail = await readFunctionError(error)
  throw detail ? new Error(detail) : error
}

/**
 * The shortest password the edge function will accept.
 *
 * A copy of `MIN_PASSWORD_LENGTH` in supabase/functions/admin-users/index.ts,
 * which is the one that is ENFORCED — this exists so a field can state the
 * rule before the request is sent, not so the browser can be trusted to keep
 * it.
 */
export const MIN_STAFF_PASSWORD_LENGTH = 8

/**
 * Sets an operator's password. ADMINS ONLY, OPERATORS ONLY.
 *
 * The service_role key is what changes a password in Supabase Auth, so this
 * goes through the same edge function as creating and removing accounts rather
 * than anywhere near the browser. See supabase/functions/admin-users/index.ts,
 * which re-checks the caller is an admin and the TARGET is an operator — the
 * role is read from the table there, not taken from anything sent here.
 *
 * NOT A RESET LINK, BECAUSE THERE IS NOWHERE TO SEND ONE
 *   An emailed link is the better flow and this project cannot run it: there
 *   is no mail sender configured, which is also why new accounts are created
 *   with `email_confirm: true`. The password is set directly and read out to
 *   the operator instead.
 */
export async function resetOperatorPassword(userId: string, password: string): Promise<void> {
  const { error } = await getSupabase().functions.invoke('admin-users', {
    method: 'PATCH',
    body: { user_id: userId, password },
  })

  if (!error) return

  const status = (error as { context?: { status?: number } }).context?.status
  if (status === 404) throw new FunctionMissingError('admin-users is not deployed')

  const detail = await readFunctionError(error)
  throw detail ? new Error(detail) : error
}

/* -------------------------------------------------------------------------- */
/* Brands                                                                     */
/* -------------------------------------------------------------------------- */

/** The fields the brands screen edits. `slug` is set on create and never again. */
export type BrandDraft = {
  slug?: string
  name: string
  discipline: string
  country: string | null
  image: string | null
  logo: string | null
  website: string | null
  description_ka: string | null
  description_en: string | null
  sort_order?: number
  is_active?: boolean
}

/**
 * EVERY house, hidden ones included — the dashboard's read.
 *
 * The public `fetchBrands` filters on `is_active`, which is right for the site
 * and useless here: the whole point of hiding a brand is that somebody can
 * still find it and bring it back.
 */
export async function fetchAllBrands(signal?: AbortSignal): Promise<Brand[]> {
  const query = getSupabase()
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const { data, error } = await (signal ? query.abortSignal(signal) : query)
  if (error) throw error
  return (data ?? []) as Brand[]
}

export async function createBrand(draft: BrandDraft): Promise<Brand> {
  const { data, error } = await getSupabase().from('brands').insert(draft).select().single()
  if (error) throw error
  return data as Brand
}

/**
 * Any subset of a brand's editable fields.
 *
 * One function for every edit on the screen — rename, re-file, hide, reorder —
 * for the same reason `updateCategory` is one function: they are the same
 * UPDATE with a different key, and the database applies the discipline check
 * whichever key it arrived under.
 */
export async function updateBrand(
  id: string,
  patch: Partial<Omit<BrandDraft, 'slug'>>,
): Promise<Brand> {
  const { data, error } = await getSupabase()
    .from('brands')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Brand
}

/**
 * Deletes a brand.
 *
 * The guard is in the DATABASE — supabase-brands.sql installs a before-delete
 * trigger that refuses a brand still named on a product, and `brand_id` is
 * `on delete restrict` behind it. Checking here as well would be a race and a
 * lie, exactly as it would be for a category: another tab can file a product
 * against this brand between the check and the delete.
 */
export async function deleteBrand(id: string): Promise<void> {
  const { error } = await getSupabase().from('brands').delete().eq('id', id)
  if (error) throw error
}

/**
 * Writes a new order to the whole list.
 *
 * Renumbered from 10 in steps of 10 for the same reason the category tree is:
 * two rows sharing a sort_order break the tie on name, and the list then
 * appears to reorder itself at random.
 */
export async function reorderBrands(idsInOrder: string[]): Promise<void> {
  const supabase = getSupabase()

  const results = await Promise.all(
    idsInOrder.map((id, index) =>
      supabase
        .from('brands')
        .update({ sort_order: (index + 1) * 10 })
        .eq('id', id),
    ),
  )

  const failure = results.find((result) => result.error)
  if (failure?.error) throw failure.error
}
