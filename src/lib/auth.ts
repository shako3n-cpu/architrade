import type { Session } from '@supabase/supabase-js'
import type { StaffRole } from '@/data/types'
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

/**
 * Signs out everywhere, then scrubs the tokens out of browser storage by hand.
 *
 * supabase-js removes its own key already, so the sweep is belt and braces —
 * but it is the cheap half of the pair. A signOut that fails at the network
 * (revoking the refresh token needs a round trip) would otherwise leave a
 * usable access token sitting in localStorage for up to an hour, which is
 * exactly the case the idle timeout exists to prevent. So the sweep runs even
 * when the call throws, and the error is reported afterwards.
 */
export async function signOut(): Promise<void> {
  try {
    // 'global' revokes the refresh token for every session on this account,
    // not only this browser. It is the default, said out loud because the
    // weaker scopes are a security decision nobody should make by accident.
    const { error } = await getSupabase().auth.signOut({ scope: 'global' })
    if (error) throw error
  } finally {
    clearAuthStorage()
  }
}

/**
 * Deletes every Supabase auth token from local and session storage.
 *
 * Matches supabase-js's own key shape — `sb-<project-ref>-auth-token`, plus
 * the numbered chunks a large token is split across — so the project's other
 * stored values (the language preference, for one) are left alone. Anything
 * that throws is ignored: private browsing modes make storage unreadable, and
 * a browser that will not let us store a token has not stored one either.
 */
export function clearAuthStorage(): void {
  for (const store of [globalThis.localStorage, globalThis.sessionStorage]) {
    try {
      const doomed = Object.keys(store).filter(
        (key) => key.startsWith('sb-') && key.includes('-auth-token'),
      )
      for (const key of doomed) store.removeItem(key)
    } catch {
      /* storage unavailable — nothing was written there to begin with */
    }
  }
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
 * The signed-in account's role, or null if it is not staff at all.
 *
 * Being signed in is not the same as being allowed to change anything — see
 * the note in supabase-admin-setup.sql about signups being open. The dashboard
 * reads this so it can say "this account is not an administrator" plainly,
 * instead of letting someone fill in a long form and meet an unexplained
 * permission error when they press Save.
 *
 * WHAT THIS IS FOR, AND WHAT IT IS NOT FOR
 *   It decides which buttons are drawn. It decides nothing else. Anybody can
 *   edit JavaScript in their own browser and make this function return
 *   'admin'; what actually refuses the delete is the row level security policy
 *   in supabase-rbac.sql, which asks the database, not the browser.
 *
 * Returns null rather than throwing when the table does not exist yet, so a
 * project that has not run the setup files still reaches a readable message.
 * A database that has `admins` but not yet the `role` column falls back to
 * 'admin', which is what everyone on that list was before roles existed.
 */
const UNDEFINED_COLUMN = '42703'

export async function fetchRole(userId: string): Promise<StaffRole | null> {
  const { data, error } = await getSupabase()
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (error.code !== UNDEFINED_COLUMN) return null

    // supabase-rbac.sql has not been run. Everyone on the pre-roles list held
    // full rights, so that is what they keep until it is.
    const { data: row } = await getSupabase()
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    return row ? 'admin' : null
  }

  if (!data) return null
  return data.role === 'operator' ? 'operator' : 'admin'
}

/**
 * Whether there is still a live, unexpired session.
 *
 * Called on every admin route change. `getSession()` refreshes an expired
 * token on its own if the refresh token is still good, so a false answer
 * means the session is genuinely gone — revoked in the dashboard, signed out
 * in another tab, or a refresh token past its life — and not merely stale.
 *
 * The expiry is checked a minute early. A token that dies in forty seconds
 * would let the manager start filling in a form only to have the save
 * rejected, and sending them to the login screen now is kinder than losing
 * their work then.
 */
const EXPIRY_MARGIN_SECONDS = 60

export async function hasValidSession(): Promise<boolean> {
  let session: Session | null
  try {
    session = await getSession()
  } catch {
    // Network failure, or no .env. Not evidence that the session is invalid,
    // so the manager keeps their screen rather than being thrown out because
    // the wifi dropped.
    return true
  }

  if (!session) return false
  if (!session.expires_at) return true

  return session.expires_at - EXPIRY_MARGIN_SECONDS > Date.now() / 1000
}

/* -------------------------------------------------------------------------- */
/* Why the login screen is showing                                            */
/* -------------------------------------------------------------------------- */

const REASON_KEY = 'archtrade.signOutReason'

/** The only reason worth explaining. Everything else is an ordinary sign-out. */
export type SignOutReason = 'idle'

/**
 * Left behind by the idle timeout so the login screen can say why it appeared,
 * instead of looking like the session vanished for no reason.
 *
 * sessionStorage, not localStorage: the explanation belongs to this tab and
 * this visit. It should not still be waiting tomorrow morning.
 */
export function setSignOutReason(reason: SignOutReason): void {
  try {
    sessionStorage.setItem(REASON_KEY, reason)
  } catch {
    /* storage blocked — the manager sees a plain login screen instead */
  }
}

/** Reads the reason and removes it, so it is shown exactly once. */
export function takeSignOutReason(): SignOutReason | null {
  try {
    const reason = sessionStorage.getItem(REASON_KEY)
    sessionStorage.removeItem(REASON_KEY)
    return reason === 'idle' ? reason : null
  } catch {
    return null
  }
}
