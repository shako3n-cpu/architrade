import { LANGUAGES, LANGUAGE_LABELS, type Language } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * KA / EN switcher.
 *
 * Switching keeps the visitor on the same page (see useLanguage) and writes the
 * choice to localStorage so the next visit opens in the same language.
 *
 * Marked up as a group of buttons rather than a <select> so both languages
 * are visible at once — the visitor can see their language is offered without
 * opening anything.
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

  return (
    <div
      role="group"
      aria-label={t('header.languageLabel')}
      className={cn('flex items-center gap-1.5', className)}
    >
      {LANGUAGES.map((code: Language) => {
        const isActive = code === lang

        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLanguage(code)}
            // Tells assistive tech which language is currently applied.
            aria-current={isActive ? 'true' : undefined}
            lang={code}
            className={cn(
              'inline-flex items-center justify-center rounded-xs border transition-colors duration-300',
              // Deliberately NOT `at-label`. That class is 11px, sized for
              // eyebrows sitting above a heading where the heading carries
              // the weight. Here the label IS the control, and at 11px in
              // muted grey it read as a caption rather than something to
              // press. 12.5px at 500 fixes both.
              'font-body text-[0.78125rem] font-medium tracking-[0.14em] uppercase',
              // Without a floor these are a ~20px target sitting right next
              // to each other.
              'min-h-11 sm:min-h-0',
              size === 'sm' ? 'px-2.5 py-1' : 'px-3.5 py-1.5',
              // Two codes set in bare type, separated by a hairline, read as a
              // caption however they are marked up — which is what kept this
              // looking like text rather than a control. The pair now wears
              // the shape of a segmented control: the current language is a
              // filled bronze chip, the other an outlined one you can press.
              // The border is muted at 45%, not `hairline` — hairline is
              // roughly 1.1:1 on this background, i.e. invisible.
              isActive
                ? 'border-brass bg-brass text-background'
                : 'border-muted/45 bg-surface text-ink hover:border-ink hover:text-brass',
            )}
          >
            {LANGUAGE_LABELS[code]}
          </button>
        )
      })}
    </div>
  )
}
