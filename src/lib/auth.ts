import type { Session } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

/**
 * ============================================================================
 * ADMIN SIGN-IN
 * ----------------------------------------------------------------------------
 * Email and password against Supabase Auth. There is no sign-up here and there
 * should never be one: accounts are created by hand in the Supabase dashboard
 * and then added to the `admins` table. See supabase-admin-setup.sql.
 *
 * The session (a short-lived access token plus a refresh token) is kept in
 * localStorage by supabase-js and refreshed by it in the background, which is
 * why nothing in this file writes to storage itself.
 *
 * WHAT ACTUALLY PROTECTS THE DATA
 *   Not this file. The route guard in the browser only decides what is drawn
 *   on screen — anybody can edit JavaScript in their own browser and walk
 *   straight past it. What stops a stranger writing to the catalogue is the
 *   row level security policies in the database, which check membership of
 *   `admins` on every insert, update and delete. The guard is a courtesy to
 *   the person using the dashboard, not a security boundary.
 * ============================================================================
 */

/** Signs in, or throws with the message Supabase gave. */
export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    // Addresses are case-insensitive, and a stray space from a paste or a
    // phone keyboard is the single most common reason a correct password is
    // rejected.
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) throw error
  if (!data.session) throw new Error('Signed in but no session was returned.')

  return data.session
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}

/** The session restored from storage on a page load, or null. */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Fires whenever the visitor signs in, signs out, or the token is refreshed.
 * Returns the unsubscribe function.
 */
export function onAuthChange(handler: (session: Session | null) => void): () => void {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => handler(session))
  return () => data.subscription.unsubscribe()
}

/**
 * Whether the signed-in account is on the `admins` list.
 *
 * Being signed in is not the same as being allowed to change anything — see
 * the note in supabase-admin-setup.sql about signups being open. The dashboard
 * checks this so it can say "this account is not an administrator" plainly,
 * instead of letting someone fill in a long form and meet an unexplained
 * permission error when they press Save.
 *
 * Returns false rather than throwing when the table does not exist yet, so a
 * project that has not run the setup file still reaches a readable message.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return false
  return data !== null
}
