import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { completePasswordReset } from '@/lib/auth'
import { PasswordFields } from '@/components/admin/password-fields'
import { passwordReady } from '@/lib/password'
import { onAuthChange, getSession } from '@/lib/auth'
import { SITE_NAME } from '@/config/site'

/**
 * ============================================================================
 * /admin/reset-password — WHERE A RECOVERY LINK LANDS
 * ----------------------------------------------------------------------------
 * The link in the email carries tokens in the URL fragment. supabase-js reads
 * them on load (see `detectSessionInUrl` in lib/supabase.ts), turns them into a
 * session, and clears them out of the address bar. By the time this renders
 * there is either a session — the link was good — or there is not.
 *
 * WHICH IS THE WHOLE STATE MACHINE
 *   checking  supabase-js has not finished reading the fragment yet. Brief,
 *             but showing the form during it would flash a field that cannot
 *             be submitted, and showing the failure would accuse a good link.
 *   ready     there is a session. Ask for the new password.
 *   invalid   no session. The link was used already, has expired, or was
 *             mangled by an email client that rewrote the URL.
 *
 * IT DOES NOT ASK FOR THE CURRENT PASSWORD
 *   Unlike the form on /admin/users. Somebody here does not have the old one —
 *   that is why they are here. The link is the proof, which is also why it is
 *   short-lived and single-use, and why it must be treated as a credential
 *   rather than as a URL.
 *
 * NOT WRAPPED IN RequireAdmin
 *   The session a recovery link creates is a real one, so the guard would let
 *   it through — but the guard also redirects a signed-OUT visitor to the
 *   login screen, which is exactly what somebody with an expired link would
 *   get instead of being told the link expired.
 * ============================================================================
 */
export function AdminResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [state, setState] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /*
   * Waits for supabase-js to finish with the fragment rather than reading the
   * session once. Reading once races it: on a cold load the answer is usually
   * "no session yet", which would show the expired-link screen to somebody
   * whose link was fine.
   */
  useEffect(() => {
    let settled = false

    const unsubscribe = onAuthChange((session) => {
      if (session) {
        settled = true
        setState('ready')
      }
    })

    void getSession()
      .then((session) => {
        if (session) {
          settled = true
          setState('ready')
        }
      })
      // Throws when the project is unreachable or unconfigured. Not a reason
      // to leave the screen saying "loading" forever — the timer below reaches
      // the same conclusion, and an uncaught rejection here would be the only
      // trace of it.
      .catch(() => {})

    // If nothing has arrived by now, nothing is going to.
    const timer = window.setTimeout(() => {
      if (!settled) setState('invalid')
    }, 3000)

    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  const canSubmit = passwordReady(password, confirm) && !busy

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setError(null)
    setBusy(true)

    try {
      await completePasswordReset(password)
      // Straight into the dashboard. They are signed in already — the recovery
      // session is a real one — so sending them to the login screen to type
      // the password they just chose would be theatre.
      navigate('/admin', { replace: true })
    } catch (cause) {
      setError(t('admin.errorUnknown', { message: cause instanceof Error ? cause.message : String(cause) }))
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-md border border-hairline bg-surface p-8 sm:p-10">
        <p className="font-heading text-lg tracking-[0.2em] text-ink uppercase">{SITE_NAME}</p>

        {state === 'checking' && (
          <p role="status" className="mt-6 text-sm text-muted">
            {t('state.loading')}
          </p>
        )}

        {state === 'invalid' && (
          <>
            <h1 className="mt-6 font-heading text-2xl text-ink">{t('admin.recoveryInvalidTitle')}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t('admin.recoveryInvalidBody')}
            </p>
            <Link
              to="/admin/login"
              className="mt-6 inline-block text-sm text-muted underline transition-colors duration-300 hover:text-brass"
            >
              {t('admin.recoveryBackToLogin')}
            </Link>
          </>
        )}

        {state === 'ready' && (
          <form onSubmit={submit}>
            <h1 className="mt-6 font-heading text-2xl text-ink">{t('admin.recoveryTitle')}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t('admin.recoveryBody')}</p>

            {error && (
              <p
                role="alert"
                className="mt-5 border border-hairline bg-background p-4 text-sm text-ink"
              >
                {error}
              </p>
            )}

            <PasswordFields
              value={password}
              onChange={setPassword}
              confirm={confirm}
              onConfirmChange={setConfirm}
              disabled={busy}
              autoFocus
              className="mt-6"
            />


            <Button type="submit" variant="solid" className="mt-6 w-full" disabled={!canSubmit}>
              {t('admin.recoverySubmit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
