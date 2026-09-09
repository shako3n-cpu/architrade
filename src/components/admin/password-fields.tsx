import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MIN_STAFF_PASSWORD_LENGTH, passwordsMismatch } from '@/lib/password'
import { PasswordChecklist } from './password-checklist'

/**
 * The pair of boxes for setting a password: type it, type it again, with the
 * four rules listed underneath.
 *
 * Every screen that sets a password uses this — creating an account, resetting
 * an operator's, changing your own, and choosing one from a recovery link — so
 * that all four ask for the same thing in the same words.
 *
 * TYPED TWICE
 *   The reset dialog used to argue that a show/hide button made a second box
 *   unnecessary, since the password is read out to somebody immediately. That
 *   holds only while the eye is open, and the box starts closed: a mistyped
 *   password is then discovered by an operator who cannot sign in and has no
 *   way to tell whether they were given the wrong one or typed it wrongly
 *   themselves. On the recovery screen there is nobody to ask at all — the
 *   typo locks the person out of the account they were recovering.
 *
 * ONE EYE FOR BOTH BOXES
 *   Revealing one and not the other makes the comparison impossible to do by
 *   eye, which is the only reason to reveal either.
 *
 * BOTH BOXES ARE LABELLED ABOVE, NOT BY PLACEHOLDER
 *   A placeholder is gone the moment somebody types, and these two boxes then
 *   look identical — both a row of dots, with nothing on screen saying which is
 *   which. That is fine for one password field and useless for a pair.
 *
 * THE MISMATCH IS NOT SHOWN WHILE THE SECOND BOX IS BEING TYPED
 *   It appears once the repeat is at least as long as the password. Otherwise
 *   every password in the world is announced as not matching from the first
 *   keystroke, and a warning that is always on is a warning nobody reads.
 */
export function PasswordFields({
  value,
  onChange,
  confirm,
  onConfirmChange,
  disabled = false,
  autoFocus = false,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  confirm: string
  onConfirmChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  /** What the first box is called. Defaults to "New password". */
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  const newLabel = label ?? t('admin.staffNewPassword')
  const mismatch = passwordsMismatch(value, confirm)

  return (
    <div className={className}>
      <Box
        label={newLabel}
        value={value}
        onChange={onChange}
        visible={visible}
        onVisible={setVisible}
        disabled={disabled}
        autoFocus={autoFocus}
        showToggle
      />

      <Box
        label={t('admin.passwordRepeat')}
        value={confirm}
        onChange={onConfirmChange}
        visible={visible}
        onVisible={setVisible}
        disabled={disabled}
        invalid={mismatch}
        className="mt-4"
      />

      {/* Reserved above the checklist rather than inserted between the boxes,
          so nothing moves under the pointer as it appears and disappears. */}
      {mismatch && (
        <p role="alert" className="mt-2 text-xs text-ink">
          {t('admin.passwordMismatch')}
        </p>
      )}

      <PasswordChecklist value={value} />
    </div>
  )
}

function Box({
  label,
  value,
  onChange,
  visible,
  onVisible,
  disabled,
  autoFocus = false,
  invalid = false,
  showToggle = false,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onVisible: (visible: boolean) => void
  disabled: boolean
  autoFocus?: boolean
  invalid?: boolean
  showToggle?: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const id = useId()

  return (
    <div className={className}>
      {/* The same treatment as every other label in the back office — see the
          Label in field.tsx. Not imported from there because that one is not
          exported and this file needs no more of it than the class. */}
      <label htmlFor={id} className="block text-[10px] tracking-[0.16em] text-muted uppercase">
        {label}
        <span aria-hidden="true" className="ml-1 text-brass">
          *
        </span>
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          /* `new-password` and not `current-password`: the second invites the
             browser to offer the SIGNED-IN person's own saved password for
             this site, which is the one thing that must not land in these
             boxes. */
          autoComplete="new-password"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={MIN_STAFF_PASSWORD_LENGTH}
          required
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'min-h-11 w-full border bg-background py-2.5 pl-3.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none disabled:opacity-50',
            invalid ? 'border-ink' : 'border-hairline',
            showToggle ? 'pr-12' : 'pr-3.5',
          )}
        />

        {showToggle && (
          <button
            type="button"
            onClick={() => onVisible(!visible)}
            aria-label={t(visible ? 'admin.staffHidePassword' : 'admin.staffShowPassword')}
            /* One control for both boxes: revealing one and hiding the other
               makes the comparison impossible to do by eye. */
            className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center text-muted transition-colors duration-300 hover:text-brass"
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="size-4 stroke-[1.25]" />
            ) : (
              <Eye aria-hidden="true" className="size-4 stroke-[1.25]" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
