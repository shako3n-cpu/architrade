import type { MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
 *   Both are stated outright rather than inherited: the serif is named
 *   directly, and the weight is pinned to 400.
 *
 *   `font-heading` now resolves to the same serif — headings were moved onto
 *   it so the mark and the headings beneath it share a voice. Naming it here
 *   anyway is deliberate: the wordmark should not silently change face again
 *   the next time that token is repointed, which is exactly how it became a
 *   thin sans the last time. The weight stays pinned too, because 400 is the
 *   wordmark's own cut and has nothing to do with the 500 headings use.
 *
 * IT DOES BOTH JOBS A LOGO IS EXPECTED TO DO
 *   From another page it goes home, and RootLayout's route effect puts you at
 *   the top when it lands. From the home page itself it scrolls back up —
 *   which it did NOT do before, because navigating to the route you are
 *   already on is a no-op in the router, so that effect never fired and the
 *   click appeared to do nothing.
 */
export function Wordmark({ className }: { className?: string }) {
  const { localePath, t } = useLanguage()
  const location = useLocation()

  const home = localePath('/')
  const atHome = location.pathname === home || location.pathname === `${home}/`

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Middle-click, ctrl/cmd-click and the rest are the browser's to handle —
    // intercepting them would break "open the home page in a new tab".
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    // Anywhere else, let the router navigate; RootLayout scrolls on arrival.
    if (!atHome) return

    event.preventDefault()
    window.scrollTo({
      top: 0,
      // Matches the reduced-motion rule the stylesheet applies to html.
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return (
    <Link
      to={home}
      onClick={handleClick}
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
