import { Link } from 'react-router-dom'
import { useLanguage } from '@/hooks/use-language'
import { SITE_NAME } from '@/config/site'
import { cn } from '@/lib/utils'

/**
 * The ARCHTRADE wordmark. Typography, not an image file, so it stays sharp at
 * every size and needs no alt text.
 *
 * SET IN THE SERIF, AND EXPLICITLY
 *   This asked for `font-heading` and no weight, which was right until the
 *   redesign repointed `--at-font-heading` at the grotesque. The mark then
 *   silently became sans — and because it is an <a> rather than an <h*>, the
 *   `h1..h6 { font-weight: 500 }` rule never reached it either, so it also
 *   inherited the body's Light 300. A wordmark set in Light is the thin,
 *   washed-out logo this is fixing.
 *
 *   Both are now stated outright rather than inherited: the serif is named
 *   directly (not via `font-heading`, which is the grotesque and should stay
 *   that way for headings), and the weight is pinned to 400 — the only cut of
 *   Noto Serif Georgian index.html actually loads.
 */
export function Wordmark({ className }: { className?: string }) {
  const { localePath, t } = useLanguage()

  return (
    <Link
      to={localePath('/')}
      aria-label={t('header.homeLink')}
      className={cn(
        // inline-flex + min-h-11 makes the whole header-height strip around
        // the wordmark tappable, not just the 20px the glyphs occupy.
        'inline-flex min-h-11 items-center font-serif text-xl font-normal leading-none tracking-[0.22em] text-ink',
        'transition-colors duration-300 hover:text-brass',
        className,
      )}
    >
      {SITE_NAME}
    </Link>
  )
}
