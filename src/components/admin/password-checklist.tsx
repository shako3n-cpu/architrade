import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MIN_STAFF_PASSWORD_LENGTH, passwordChecks } from '@/lib/password'

/**
 * The four rules under a password field, ticked off as somebody types.
 *
 * Shared by every screen that sets a password, which each used to carry their
 * own sentence about it. When the rule gained a capital, a number and a symbol,
 * one copy would have been missed.
 *
 * ALL FOUR, ALWAYS, RATHER THAN THE FIRST ONE UNMET
 *   Showing one at a time hides how much is left: somebody satisfies the length
 *   rule and is told about a capital they had no idea was coming, then a
 *   number, then a symbol — a rule revealed one surprise at a time reads as the
 *   form moving the goalposts. Four lines that start grey and turn to ink can
 *   be read once, before typing, and then watched.
 *
 * NOT A COLOUR
 *   The palette is graphite, off-white and brass, with no green in it. A met
 *   rule gets a tick and ink; an unmet one gets an empty box and muted. The
 *   MARK carries the meaning, not the shade, so this still works for somebody
 *   who cannot separate the two greys.
 *
 *   The tick is decorative to a screen reader — a border turning brass
 *   announces nothing — so each line carries the word instead, off-screen.
 *   Without it the list reads as four requirements with no indication of which
 *   are already satisfied, which is worse than no list.
 */
export function PasswordChecklist({ value, className }: { value: string; className?: string }) {
  const { t } = useTranslation()
  const checks = passwordChecks(value)

  return (
    <ul className={cn('mt-3 space-y-1.5', className)}>
      {checks.map(({ id, labelKey, met }) => (
        <li key={id} className="flex items-center gap-2 text-xs">
          <span
            aria-hidden="true"
            className={cn(
              'inline-flex size-4 shrink-0 items-center justify-center border transition-colors duration-300',
              met ? 'border-brass text-brass' : 'border-hairline text-transparent',
            )}
          >
            <Check className="size-3 stroke-[1.75]" />
          </span>

          <span className={cn('transition-colors duration-300', met ? 'text-ink' : 'text-muted')}>
            {t(labelKey, { count: MIN_STAFF_PASSWORD_LENGTH })}
            <span className="sr-only">
              {' '}
              {t(met ? 'admin.passwordRuleMet' : 'admin.passwordRuleUnmet')}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
