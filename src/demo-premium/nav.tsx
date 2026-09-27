import { useEffect, useState } from 'react'
import { StartProject } from './cta'

const LINKS = [
  ['#houses', 'Houses'],
  ['#approach', 'Approach'],
  ['#process', 'Process'],
] as const

/**
 * A floating pill: frosted ivory over whatever is under it, a shade more
 * opaque once the page has moved, so the links stay legible over the dark
 * testimonial band as well as over the hero. On a phone the three section
 * links fold away and the wordmark and the call to action are what is left.
 */
export function Nav() {
  const scrolled = useScrolled(24)
  return (
    <header className="lp-nav" data-scrolled={scrolled ? '' : undefined}>
      <a href="#top" className="lp-wordmark" aria-label="ARCHTRADE — back to top">
        ARCHTRADE
      </a>
      <nav aria-label="Sections" className="lp-nav-links">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} className="lp-nav-link">
            {label}
          </a>
        ))}
      </nav>
      <StartProject size="small" />
    </header>
  )
}

function useScrolled(threshold: number) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', update, { passive: true })
    // A reload can land part-way down the page; ask once, from a frame, so
    // the pill starts in the right state rather than after the first scroll.
    const frame = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [threshold])
  return scrolled
}
