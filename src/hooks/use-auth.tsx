import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { StaffRole } from '@/data/types'
import {
  clearAuthStorage,
  getSession,
  hasValidSession,
  isSessionRejected,
  fetchRole,
  onAuthChange,
  signIn,
  signOut,
} from '@/lib/auth'

/**
 * ============================================================================
 * WHO IS SIGNED IN
 * ----------------------------------------------------------------------------
 * One provider around the admin routes, so the session is read once rather
 * than by every screen that wants it.
 *
 *   const { status, email, signIn, signOut } = useAuth()
 *
 * `status` moves through:
 *   'checking'  -> restoring the session from storage; draw nothing yet
 *   'signedOut' -> show the login form
 *   'notAdmin'  -> signed in, but this account is not on the admins list
 *   'ready'     -> signed in and allowed to make changes
 *
 * 'checking' matters more than it looks. Restoring a session is asynchronous,
 * so for a moment after a page load nobody is signed in yet. Without this
 * state the guard would bounce a legitimately signed-in manager to the login
 * screen every time they refreshed the page.
 * ============================================================================
 */

export type AuthStatus = 'checking' | 'signedOut' | 'notAdmin' | 'ready'

type AuthValue = {
  status: AuthStatus
  email: string | null
  /**
   * What this account may do, or null when it is not staff. Only ever
   * non-null while `status` is 'ready'.
   */
  role: StaffRole | null
  /** Shorthand for the check nearly every screen makes. */
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  /**
   * Re-checks the token against Supabase and drops the session if it is gone.
   * Called on every admin route change — see RequireAdmin.
   */
  revalidate: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

/**
 * How often a visible tab asks whether its session is still accepted.
 *
 * A minute is the gap between an administrator resetting a password and the
 * old session going. Shorter buys very little — somebody has already been
 * spoken to by then — and costs a request a minute for every open dashboard,
 * for the whole day, on every account.
 */
const SESSION_CHECK_MS = 60_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  /*
   * Three states, not two: null means "not asked yet", which is different from
   * "asked, and they are nobody". Collapsing them would show the refusal
   * screen for a moment on every page load.
   */
  const [role, setRole] = useState<StaffRole | null | undefined>(undefined)
  const [checking, setChecking] = useState(true)

  // Restore whatever session is in storage, then follow it.
  useEffect(() => {
    let active = true

    getSession()
      .then((restored) => {
        if (active) setSession(restored)
      })
      // A project with no .env throws here. The login screen reports it; there
      // is nothing useful to do at this level.
      .catch(() => {
        if (active) setSession(null)
      })
      .finally(() => {
        if (active) setChecking(false)
      })

    const unsubscribe = onAuthChange((next) => {
      if (!active) return
      setSession(next)
      // Force the membership check to run again for the new account rather
      // than leaving the previous answer on screen.
      setRole(undefined)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  // Look up the role whenever the account changes.
  useEffect(() => {
    const userId = session?.user.id
    if (!userId) {
      setRole(undefined)
      return
    }

    let active = true
    fetchRole(userId).then((result) => {
      if (active) setRole(result)
    })

    return () => {
      active = false
    }
  }, [session])

  const status: AuthStatus = useMemo(() => {
    if (checking) return 'checking'
    if (!session) return 'signedOut'
    // The answer has not arrived yet — still checking, not refused.
    if (role === undefined) return 'checking'
    return role ? 'ready' : 'notAdmin'
  }, [checking, session, role])

  const doSignIn = useCallback(async (email: string, password: string) => {
    // onAuthChange fires and sets the session, so nothing is stored here.
    await signIn(email, password)
  }, [])

  const doSignOut = useCallback(async () => {
    await signOut()
  }, [])

  /*
   * The session is read through a ref rather than the closure so that this
   * callback keeps one identity for the life of the provider. RequireAdmin
   * lists it as an effect dependency; a new function on every session change
   * would make that effect fire for reasons that have nothing to do with
   * navigating.
   */
  const sessionRef = useRef<Session | null>(null)
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const revalidate = useCallback(async () => {
    // Nobody is signed in, so there is nothing to verify and the login screen
    // is already where they are.
    if (!sessionRef.current) return

    /*
     * Two questions, and the local one first because it is free.
     *
     *   hasValidSession  — is the stored token still inside its life? Answered
     *                      without a request. Catches an expired session and a
     *                      refresh token that has run out.
     *   isSessionRejected — will the SERVER still accept it? Answered by
     *                      /auth/v1/user. Catches a session ended somewhere
     *                      else while this token is still well inside its
     *                      hour, which is exactly what a password reset does.
     *
     * The second cannot be skipped when the first says yes. That is the whole
     * case: an operator whose password was just changed holds a token that
     * looks perfectly good to their own browser.
     */
    if (await hasValidSession()) {
      if (!(await isSessionRejected())) return
    }

    // The token is past saving — revoked in the dashboard, signed out in
    // another tab, its refresh token run out, or its session ended by a
    // password reset. Drop it locally and let the guard send them to the login
    // screen. No network sign-out call: the credential it would present is the
    // dead one.
    clearAuthStorage()
    setSession(null)
  }, [])

  /*
   * A HEARTBEAT, SO AN IDLE TAB FINDS OUT TOO.
   *
   * revalidate runs on every admin route change, which covers somebody who is
   * using the dashboard. It does nothing for a tab left open on one screen —
   * and that is the likeliest shape of the situation this is for: a session
   * somebody walked away from, on a machine the password was reset because of.
   *
   * A minute, and only while the tab is visible. A background tab cannot be
   * doing any harm, so waking it to ask would be a request per minute per open
   * tab in exchange for nothing; it is checked immediately on return instead,
   * which is before the person can do anything with it.
   */
  useEffect(() => {
    if (!session) return

    const check = () => {
      if (document.visibilityState === 'visible') void revalidate()
    }

    const timer = window.setInterval(check, SESSION_CHECK_MS)
    document.addEventListener('visibilitychange', check)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [session, revalidate])

  const value = useMemo(
    () => ({
      status,
      email: session?.user.email ?? null,
      role: role ?? null,
      isAdmin: role === 'admin',
      signIn: doSignIn,
      signOut: doSignOut,
      revalidate,
    }),
    [status, session, role, doSignIn, doSignOut, revalidate],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.')
  return value
}
