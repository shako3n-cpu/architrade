import { LANGUAGES, LANGUAGE_LABELS, type Language } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * KA / EN / RU switcher.
 *
 * Switching keeps the visitor on the same page (see useLanguage) and writes the
 * choice to localStorage so the next visit opens in the same language.
 *
 * Marked up as a group of buttons rather than a <select> so all three languages
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
      className={cn('flex items-center', className)}
    >
      {LANGUAGES.map((code: Language, index) => {
        const isActive = code === lang

        return (
          <div key={code} className="flex items-center">
            {/* Hairline separator between the codes, never before the first. */}
            {index > 0 && <span aria-hidden="true" className="h-3 w-px bg-hairline" />}

            <button
              type="button"
              onClick={() => switchLanguage(code)}
              // Tells assistive tech which language is currently applied.
              aria-current={isActive ? 'true' : undefined}
              lang={code}
              className={cn(
                'at-label transition-colors duration-300',
                size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5',
                isActive ? 'text-brass' : 'text-muted hover:text-ink',
              )}
            >
              {LANGUAGE_LABELS[code]}
            </button>
          </div>
        )
      })}
    </div>
  )
}
