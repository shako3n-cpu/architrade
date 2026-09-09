import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PasswordFields } from './password-fields'
import { passwordReady } from '@/lib/password'

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
 * field owes anybody — the shared rules, both boxes, a way to see what was
 * typed, and no copy kept once the panel closes — and no more, because effort
 * spent here is effort spent on something with a known end date.
 *
 * WHAT THIS DOES NOT DO
 *   It does not judge the password beyond the four stated rules. No strength
 *   meter and no dictionary: a meter only teaches people to append a digit
 *   until the bar turns green, and a rule that can be read and satisfied on
 *   purpose is worth more than a score nobody can predict.
 * ============================================================================
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  name,
  busy = false,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Who the password is for. Shown so this cannot be done to the wrong row. */
  name: string
  busy?: boolean
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
          <ResetForm busy={busy} onSubmit={onSubmit} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** The fields themselves. Mounted only while the panel is open — see above. */
function ResetForm({ busy, onSubmit }: { busy: boolean; onSubmit: (password: string) => void }) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const canSubmit = passwordReady(password, confirm) && !busy

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSubmit) onSubmit(password)
      }}
    >
      <PasswordFields
        value={password}
        onChange={setPassword}
        confirm={confirm}
        onConfirmChange={setConfirm}
        disabled={busy}
        autoFocus
        className="mt-5"
      />

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
