import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import type { StaffRole } from '@/data/types'
import { createStaffAccount, FunctionMissingError } from '@/lib/admin-queries'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/admin/field'

/**
 * "Add an account" on /admin/users.
 *
 * The password is typed here by the administrator and handed to the new member
 * of staff however they normally talk. That is deliberate: this project has no
 * mail sender, so an invitation email is not an option, and a link that went
 * nowhere would be worse than no link. Tell them to change it once they are in.
 */
export function StaffForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<StaffRole>('operator')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setDone(false)
    setBusy(true)

    try {
      await createStaffAccount({ email, password, role })
      setEmail('')
      setPassword('')
      setRole('operator')
      setDone(true)
      onCreated()
    } catch (cause) {
      setError(
        cause instanceof FunctionMissingError
          ? t('admin.staffFunctionMissing')
          : t('admin.errorUnknown', {
              message: cause instanceof Error ? cause.message : String(cause),
            }),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 border border-hairline bg-surface p-6 sm:p-8">
      <h2 className="font-heading text-lg text-ink">{t('admin.staffAddTitle')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t('admin.staffAddHint')}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField
          label={t('admin.email')}
          type="email"
          value={email}
          onChange={setEmail}
          required
          disabled={busy}
        />

        <TextField
          label={t('admin.staffPassword')}
          type="password"
          value={password}
          onChange={setPassword}
          required
          disabled={busy}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
          {t('admin.staffRole')}
        </span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as StaffRole)}
          disabled={busy}
          className="mt-2 min-h-11 w-full border border-hairline bg-background px-3.5 py-2.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none disabled:opacity-50 sm:max-w-xs sm:text-sm"
        >
          <option value="operator">{t('admin.roleOperator')}</option>
          <option value="admin">{t('admin.roleAdmin')}</option>
        </select>
      </label>

      {error && (
        <p role="alert" className="mt-5 border border-hairline bg-background p-3 text-sm text-ink">
          {error}
        </p>
      )}

      {done && (
        <p role="status" className="mt-5 border border-hairline bg-background p-3 text-sm text-ink">
          {t('admin.staffCreated')}
        </p>
      )}

      <Button type="submit" size="sm" className="mt-6" disabled={busy}>
        {busy && <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />}
        {t('admin.staffCreate')}
      </Button>
    </form>
  )
}
