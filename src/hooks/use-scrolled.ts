import { useEffect, useState } from 'react'

/**
 * True once the page has scrolled past `threshold` pixels.
 *
 * Drives the header's transparent -> solid transition. The listener is passive
 * and the state only flips when the boolean actually changes, so scrolling
 * does not cause a re-render on every frame.
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    // Run once on mount — the page may load already scrolled (a refresh, or
    // a back-navigation that restores position).
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
