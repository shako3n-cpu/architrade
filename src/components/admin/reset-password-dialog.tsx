import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * ============================================================================
 * GIVE AN OPERATOR A NEW PASSWORD
 * ----------------------------------------------------------------------------
 * The administrator types it and passes it on by hand — a phone call, or
 * across a desk. That is a deliberate interim arrangement, not the intended
 * end state:
 *
 *   - There is no mail sender in this project (the account-creation path sets
 *     `email_confirm: true` for that reason), so the ordinary flow — an
 *     emailed reset link, which nobody but the account holder ever sees — has
 *     nowhere to send anything.
 *   - The plan is Entra ID with Microsoft Authenticator, at which point
 *     passwords stop being this application's business entirely: sign-in moves
 *     to the identity provider, and this screen and the endpoint behind it are
 *     deleted rather than adapted.
 *
 * So this is built to be thrown away. It gets the minimum that a password
 * field owes anybody — a real minimum length, a way to see what was typed,
 * and no copy kept once the panel closes — and no more, because effort spent
 * here is effort spent on something with a known end date.
 *
 * WHAT THIS DOES NOT DO
 *   It does not check the password against anything. No strength meter, no
 *   dictionary. The person choosing it is an administrator choosing for a
 *   colleague they are about to speak to, and a meter would only teach them to
 *   append a digit until the bar turned green.
 * ============================================================================
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  name,
  busy = false,
  minLength,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Who the password is for. Shown so this cannot be done to the wrong row. */
  name: string
  busy?: boolean
  /** Matches the edge function's own floor, which is the one that is enforced. */
  minLength: number
  onSubmit: (password: string) => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />

        <Dialog.Content
          aria-describedby="reset-password-description"
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 border border-hairline bg-background p-6"
        >
          <Dialog.Title className="font-heading text-lg text-ink">
            {t('admin.staffResetPassword')}
          </Dialog.Title>

          <Dialog.Description id="reset-password-description" className="mt-2 text-sm text-muted">
            {t('admin.staffConfirmReset', { name })}
          </Dialog.Description>

          {/* The field lives one component down, and that is what clears it.

              Radix unmounts the content of a closed dialog, so a form rendered
              in here is built fresh every time the panel opens — no effect
              watching `open` to blank it out, and no way for the password
              typed for one operator to still be sitting in the box when the
              next one is opened. */}
          <ResetForm busy={busy} minLength={minLength} onSubmit={onSubmit} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** The field itself. Mounted only while the panel is open — see above. */
function ResetForm({
  busy,
  minLength,
  onSubmit,
}: {
  busy: boolean
  minLength: number
  onSubmit: (password: string) => void
}) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const tooShort = password.length > 0 && password.length < minLength
  const canSubmit = password.length >= minLength && !busy

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSubmit) onSubmit(password)
      }}
    >
      <div className="relative mt-5">
        <input
          /* `new-password` rather than `current-password`: the second invites
             the browser to offer the ADMIN's own saved password for this site,
             which is the one thing that must not end up in this field. */
          autoComplete="new-password"
          type={visible ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={minLength}
          required
          autoFocus
          aria-label={t('admin.staffNewPassword')}
          placeholder={t('admin.staffNewPassword')}
          className="min-h-11 w-full border border-hairline bg-background py-2.5 pr-12 pl-3.5 text-base text-ink transition-colors duration-300 placeholder:text-muted/60 focus:border-brass focus:outline-none"
        />

        {/* Typed once, not twice. A confirm field catches typos in a password
            the typist has to remember; this one is read back to somebody
            immediately, so showing it does the same job without asking for the
            same thing twice. */}
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

      <p className={cn('mt-2 text-xs', tooShort ? 'text-ink' : 'text-muted')}>
        {t('admin.staffPasswordMin', { count: minLength })}
      </p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Dialog.Close asChild>
          <Button type="button" variant="outline" disabled={busy}>
            {t('admin.cancel')}
          </Button>
        </Dialog.Close>

        <Button type="submit" variant="solid" disabled={!canSubmit}>
          {t('admin.staffResetPassword')}
        </Button>
      </div>
    </form>
  )
}
