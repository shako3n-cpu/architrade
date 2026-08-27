import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { StaffRole } from '@/data/types'
import {
  clearAuthStorage,
  getSession,
  hasValidSession,
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

    if (await hasValidSession()) return

    // The token is past saving — revoked in the dashboard, signed out in
    // another tab, or a refresh token that has run out. Drop it locally and
    // let the guard send them to the login screen. No network sign-out call:
    // the credential it would present is the dead one.
    clearAuthStorage()
    setSession(null)
  }, [])

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
