import { useEffect, useState } from 'react'
import { StartProject } from './cta'

const LINKS = [
  ['#clients', 'Clients'],
  ['#work', 'Work'],
  ['#process', 'Process'],
] as const

/**
 * A floating pill of dark glass. Dark on purpose: the page alternates dark
 * and light bands, and graphite glass with ivory type reads over both, where
 * an ivory pill vanished into the light ones. On a phone the section links
 * fold away and the wordmark and the call to action remain.
 */
export function Nav() {
  const scrolled = useScrolled(24)
  return (
    <header className="bd-nav" data-scrolled={scrolled ? '' : undefined}>
      <a href="#top" className="bd-wordmark" aria-label="ARCHTRADE — back to top">
        ARCHTRADE
      </a>
      <nav aria-label="Sections" className="bd-nav-links">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} className="bd-nav-link">
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
    // A reload can land part-way down; ask once, from a frame.
    const frame = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [threshold])
  return scrolled
}
