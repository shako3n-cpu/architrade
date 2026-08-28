import { LANGUAGES, LANGUAGE_LABELS, type Language } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * The language toggle — ONE button, showing the language you would get.
 *
 * Switching keeps the visitor on the same page (see useLanguage) and writes the
 * choice to localStorage so the next visit opens in the same language.
 *
 * WHY ONE BUTTON AND NOT TWO
 *   Two chips side by side have to answer a question before they can be used:
 *   which of these is the state I am in, and which is the thing I can press.
 *   Bronze-fill-means-current is a convention the visitor has to be taught,
 *   and half of them read the filled one as the button. A single control has
 *   no such ambiguity — it shows the language you are not reading, and
 *   pressing it gets you that language.
 *
 *   The cost is that the current language is no longer displayed. That is the
 *   right trade here: the page is already IN that language, which is a far
 *   louder signal than a highlighted two-letter code.
 *
 * The target is computed by CYCLING rather than by "the other one", so this
 * keeps working if a third language is ever added — it would then step
 * ka -> en -> ru -> ka. Only the wording of the label would need revisiting.
 */
export function LanguageSwitcher({
  className,
  size = 'md',
}: {
  className?: string
  /** "sm" is used inside the mobile drawer, where space is tighter. */
  size?: 'sm' | 'md'
}) {
  const { lang, switchLanguage, t } = useLanguage()

  const current = LANGUAGES.indexOf(lang as Language)
  // -1 would mean the active language is not in LANGUAGES at all; falling back
  // to index 0 makes the button step somewhere sensible instead of rendering
  // `undefined`.
  const next = LANGUAGES[(Math.max(current, 0) + 1) % LANGUAGES.length]

  return (
    <button
      type="button"
      onClick={() => switchLanguage(next)}
      // The visible text is a bare language code, which on its own tells a
      // screen reader nothing about what pressing it does.
      aria-label={t('header.languageLabel')}
      // Marks the code as being IN the target language, so it is announced as
      // English "EN" rather than read through Georgian pronunciation rules.
      lang={next}
      className={cn(
        'inline-flex items-center justify-center rounded-xs border transition-colors duration-300',
        // Deliberately NOT `at-label`. That class is 11px, sized for eyebrows
        // sitting above a heading where the heading carries the weight. Here
        // the label IS the control, and at 11px in muted grey it read as a
        // caption rather than something to press.
        'font-body text-[0.78125rem] font-medium tracking-[0.14em] uppercase',
        // Without a floor this is a ~20px tap target.
        'min-h-11 sm:min-h-0',
        size === 'sm' ? 'px-2.5 py-1' : 'px-3.5 py-1.5',
        // Outlined rather than filled: this is an action, and the bronze fill
        // is spoken for elsewhere as "this is the current thing". The border
        // is muted at 45%, not `hairline` — hairline is roughly 1.1:1 on this
        // background, i.e. invisible, which is what made the old pair read as
        // plain text however it was marked up.
        'border-muted/45 bg-surface text-ink hover:border-brass hover:bg-brass hover:text-background',
        className,
      )}
    >
      {LANGUAGE_LABELS[next]}
    </button>
  )
}
