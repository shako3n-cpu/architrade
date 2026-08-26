import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { SupabaseConfigError } from '@/lib/supabase'
import { SITE_NAME } from '@/config/site'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/admin/field'

/**
 * /admin/login
 *
 * There is no "create an account" and no "forgot password" here, deliberately.
 * Accounts are made by hand in the Supabase dashboard and added to the
 * `admins` table — see supabase-admin-setup.sql. A self-service reset would
 * need a mail sender this project does not have, and a link that went nowhere
 * would be worse than no link.
 */
export function AdminLogin() {
  const { status, signIn } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in — go where they were headed, or to the dashboard.
  if (status === 'ready') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from.startsWith('/admin') ? from : '/admin'} replace />
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      await signIn(email, password)
      // No navigation here: `status` becomes 'ready' and the redirect above
      // takes over on the next render.
    } catch (cause) {
      setError(describe(cause, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-heading text-xl tracking-[0.24em] text-ink uppercase">{SITE_NAME}</p>
          <p className="mt-2 text-[10px] tracking-[0.18em] text-brass uppercase">
            {t('admin.badge')}
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-5 border border-hairline bg-surface p-8">
          <TextField
            label={t('admin.email')}
            type="email"
            value={email}
            onChange={setEmail}
            required
            disabled={busy}
          />

          <TextField
            label={t('admin.password')}
            type="password"
            value={password}
            onChange={setPassword}
            required
            disabled={busy}
          />

          {error && (
            <p role="alert" className="border border-hairline bg-background p-3 text-sm text-ink">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />}
            {t('admin.signIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          {t('admin.loginHelp')}
        </p>
      </div>
    </div>
  )
}

/**
 * Turns a sign-in failure into something worth reading.
 *
 * Supabase answers a wrong password and an address that does not exist with
 * the same "Invalid login credentials", and that is correct of it — telling a
 * stranger which addresses are registered is a way to enumerate accounts. So
 * this keeps them together too, rather than trying to guess them apart.
 */
function describe(cause: unknown, t: TFunction): string {
  if (cause instanceof SupabaseConfigError) return t('state.notConfiguredBody')

  const message = cause instanceof Error ? cause.message : String(cause)

  if (/invalid login credentials/i.test(message)) return t('admin.errorBadCredentials')
  if (/email not confirmed/i.test(message)) return t('admin.errorNotConfirmed')
  if (/failed to fetch|network/i.test(message)) return t('state.errorBody')

  return t('admin.errorUnknown', { message })
}
