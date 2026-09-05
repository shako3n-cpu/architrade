import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { changeOwnPassword } from '@/lib/auth'
import { MIN_STAFF_PASSWORD_LENGTH } from '@/lib/admin-queries'
import { cn } from '@/lib/utils'

/**
 * ============================================================================
 * YOUR OWN PASSWORD
 * ----------------------------------------------------------------------------
 * Separate from the reset button on the staff table, and not a variation of
 * it. They look alike and are opposites:
 *
 *   The table's button   reaches into somebody ELSE'S account. It needs the
 *                        service_role key, so it lives behind an edge
 *                        function, it is administrators-only, and it refuses
 *                        every target that is not an operator.
 *   This form            changes the account already signed in. The browser is
 *                        allowed to do that on its own, and the only thing
 *                        standing in the way is proving the current password.
 *
 * Merging them would mean one screen where the difference between "I am
 * changing mine" and "I am changing theirs" is a dropdown, which is the wrong
 * place for that distinction to live.
 *
 * WHY THE CURRENT PASSWORD IS ASKED FOR
 *   Supabase does not require it — see changeOwnPassword. Without it an
 *   unlocked laptop is a permanent account takeover: anybody walking past a
 *   signed-in dashboard could set a password only they know.
 *
 * WHERE IT IS
 *   On /admin/users, which is administrators-only, so an operator cannot
 *   change their own password today — they ask an administrator, which is
 *   what the reset button is for. Not ideal, and the reason it is not on the
 *   header instead: the header row has about 180px of slack in Georgian at
 *   1280px, and another control there brings back the wrapping that
 *   4782097 was written to fix.
 * ============================================================================
 */
export function OwnPasswordForm() {
  const { t } = useTranslation()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const tooShort = next.length > 0 && next.length < MIN_STAFF_PASSWORD_LENGTH
  // The new one being the old one again is not a failure Supabase reports, and
  // it is a wasted trip for somebody who mistyped which box they were in.
  const unchanged = next.length > 0 && next === current
  const canSubmit =
    current.length > 0 && next.length >= MIN_STAFF_PASSWORD_LENGTH && !unchanged && !busy

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setError(null)
    setDone(false)
    setBusy(true)

    try {
      await changeOwnPassword(current, next)
      setCurrent('')
      setNext('')
      setVisible(false)
      setDone(true)
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : ''
      setError(
        code === 'wrongCurrentPassword'
          ? t('admin.passwordWrongCurrent')
          : t('admin.errorUnknown', { message: code || String(cause) }),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 border border-hairline bg-surface p-6 sm:p-8">
      <h2 className="font-heading text-xl text-ink">{t('admin.passwordOwnTitle')}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t('admin.passwordOwnBody')}
      </p>

      {error && (
        <p role="alert" className="mt-5 border border-hairline bg-background p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {done && (
        <p role="status" className="mt-5 border border-brass/40 bg-brass/5 p-4 text-sm text-ink">
          {t('admin.passwordOwnDone')}
        </p>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
            {t('admin.passwordCurrent')}
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            required
            disabled={busy}
            className="mt-2 min-h-11 w-full border border-hairline bg-background px-3.5 py-2.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none disabled:opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
            {t('admin.passwordNew')}
          </span>

          <div className="relative">
            <input
              type={visible ? 'text' : 'password'}
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              minLength={MIN_STAFF_PASSWORD_LENGTH}
              required
              disabled={busy}
              className="mt-2 min-h-11 w-full border border-hairline bg-background py-2.5 pr-12 pl-3.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none disabled:opacity-50"
            />

            {/* Shown rather than confirmed. A second box catches the same typos
                and asks for the same thing twice; only the NEW one gets this,
                because revealing the current one would put a password already
                in use on screen for no gain. */}
            <button
              type="button"
              onClick={() => setVisible((was) => !was)}
              aria-label={t(visible ? 'admin.staffHidePassword' : 'admin.staffShowPassword')}
              className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center text-muted transition-colors duration-300 hover:text-brass"
            >
              {visible ? (
                <EyeOff aria-hidden="true" className="size-4 stroke-[1.25]" />
              ) : (
                <Eye aria-hidden="true" className="size-4 stroke-[1.25]" />
              )}
            </button>
          </div>
        </label>
      </div>

      <p className={cn('mt-3 text-xs', tooShort || unchanged ? 'text-ink' : 'text-muted')}>
        {unchanged
          ? t('admin.passwordSameAsCurrent')
          : t('admin.staffPasswordMin', { count: MIN_STAFF_PASSWORD_LENGTH })}
      </p>

      <Button type="submit" variant="solid" size="sm" className="mt-6" disabled={!canSubmit}>
        {t('admin.passwordOwnSubmit')}
      </Button>
    </form>
  )
}
