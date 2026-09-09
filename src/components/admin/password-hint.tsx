import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { MIN_STAFF_PASSWORD_LENGTH, passwordProblem, passwordProblemKey } from '@/lib/password'

/**
 * The line under a password field that says what is still wrong with it.
 *
 * Shared by the three screens that set a password, which each used to carry
 * their own copy of the sentence. When the rule gained a capital and a symbol,
 * one copy would have been missed.
 *
 * IT IS A HINT BEFORE IT IS AN ERROR
 *   An empty field shows the full rule in muted text — something to read
 *   before typing, not a complaint about not having typed. Once there is
 *   something in the field it turns into whichever single rule is still unmet,
 *   in ink. One at a time: three sentences about a half-typed password is
 *   noise, and the first unmet rule is the one being worked on.
 *
 *   `aria-live="polite"` because a sighted typist sees the line change and
 *   somebody listening would otherwise not be told at all — and `polite` so it
 *   waits for a pause rather than interrupting every keystroke.
 */
export function PasswordHint({ value, className }: { value: string; className?: string }) {
  const { t } = useTranslation()

  const problem = value.length > 0 ? passwordProblem(value) : null

  return (
    <p
      aria-live="polite"
      className={cn('mt-2 text-xs', problem ? 'text-ink' : 'text-muted', className)}
    >
      {problem
        ? t(passwordProblemKey(problem), { count: MIN_STAFF_PASSWORD_LENGTH })
        : t('admin.staffPasswordRule', { count: MIN_STAFF_PASSWORD_LENGTH })}
    </p>
  )
}
