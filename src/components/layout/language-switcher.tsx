import { LANGUAGES, LANGUAGE_LABELS, type Language } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * The language toggle — one button per language, the active one highlighted.
 *
 * WHAT CHANGED, AND THE PROBLEM IT BRINGS BACK
 *   This was a single button showing the language you would GET, which has no
 *   ambiguity about which half is pressable. A pair has to answer a question
 *   before it can be used: which of these is my current state, and which is
 *   the thing I can press. That is a real cost and it is why the single
 *   button existed.
 *
 *   The pair is what was asked for, so the job here is to make that question
 *   answer itself:
 *
 *     - The active language is FILLED in bronze; the other is a plain link
 *       with no border at all. One reads as a label, one reads as an action,
 *       which is the distinction two identical outlined chips never made.
 *     - The active one is a <span>, not a <button>. It is not pressable,
 *       cannot be tabbed to, and cannot be clicked to no effect — so the
 *       control has exactly one target, the same as the single button did.
 *     - `aria-current="true"` states it outright for a screen reader, which
 *       colour alone never does.
 *
 * Switching keeps the visitor on the same page (see useLanguage) and writes
 * the choice to localStorage so the next visit opens in the same language.
 */

/**
 * Display order, which is NOT the order in LANGUAGES.
 *
 * LANGUAGES leads with `ka` because it is the default the site falls back to.
 * The switcher reads EN | KA, so the codes are rendered in that order and any
 * language not named here follows in config order — adding a third language
 * shows it rather than hiding it.
 */
const DISPLAY_ORDER: readonly Language[] = ['en', 'ka']

function inDisplayOrder(): Language[] {
  const known = DISPLAY_ORDER.filter((language) => LANGUAGES.includes(language))
  const rest = LANGUAGES.filter((language) => !known.includes(language))
  return [...known, ...rest]
}

export function LanguageSwitcher({
  className,
  size = 'md',
  lang: langOverride,
  onSwitch,
}: {
  className?: string
  /** "sm" is used inside the mobile drawer, where space is tighter. */
  size?: 'sm' | 'md'
  /**
   * Drive the control from somewhere other than the URL.
   *
   * The public site's language IS the first path segment, and the default
   * behaviour reads and rewrites it. The back office has no such segment —
   * /admin/categories is the whole address — so it passes its own pair and
   * `useLanguage`'s navigation is left unused. See useAdminLanguage.
   */
  lang?: Language
  onSwitch?: (next: Language) => void
}) {
  const fromUrl = useLanguage()
  const lang = langOverride ?? fromUrl.lang
  const switchLanguage = onSwitch ?? fromUrl.switchLanguage
  const { t } = fromUrl

  const pad = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'
  // Without a floor these are ~20px tap targets on a phone.
  const base = cn(
    'inline-flex min-h-11 items-center justify-center rounded-xs sm:min-h-0',
    // Deliberately NOT `at-label`: that class is 11px, sized for an eyebrow
    // above a heading. Here the label IS the control, and at 11px in muted
    // grey it reads as a caption rather than as something to press.
    'font-body text-[0.78125rem] font-medium tracking-[0.14em] uppercase',
    'transition-colors duration-300',
    pad,
  )

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      // A group label, because two bare language codes side by side tell a
      // screen reader nothing about what they are for.
      role="group"
      aria-label={t('header.languageLabel')}
    >
      {inDisplayOrder().map((language) => {
        const isCurrent = language === lang
        const label = LANGUAGE_LABELS[language]

        if (isCurrent) {
          return (
            <span
              key={language}
              aria-current="true"
              // Marks the code as being IN that language, so it is announced
              // as English "EN" rather than through Georgian pronunciation.
              lang={language}
              className={cn(base, 'bg-brass text-background')}
            >
              {label}
            </span>
          )
        }

        return (
          <button
            key={language}
            type="button"
            onClick={() => switchLanguage(language)}
            lang={language}
            className={cn(base, 'text-muted hover:bg-surface hover:text-ink')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
