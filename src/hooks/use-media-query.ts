import { useEffect, useState } from 'react'

/**
 * True while the given media query matches.
 *
 * WHY THIS EXISTS RATHER THAN TWO SPANS AND A `sm:hidden`
 *   The CSS way to show different text at different widths is to render both
 *   and hide one. That puts the same passage in the document twice: a crawler
 *   reads it twice, a translation pass has to be told which copy is real, and
 *   the two drift apart the first time somebody edits only the one they can
 *   see. Choosing in JavaScript renders exactly one.
 *
 *   The cost is that it depends on `window`, so it is only for content that is
 *   genuinely different between widths — not for layout, which belongs in CSS
 *   where it can be seen in the class list.
 *
 * NO FLASH ON FIRST PAINT
 *   The initial state is read from matchMedia synchronously rather than being
 *   defaulted and corrected in an effect, so the right text is in the first
 *   render. The effect only keeps it current if the viewport changes after
 *   that — a rotation, or a desktop window being dragged narrower.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Guarded for any environment without a window (a test runner, a future
    // prerender step). Neither the app nor the hook should care which.
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const list = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    // Re-read on subscribe: the viewport can change between the first render
    // and this effect running, and that window is exactly where a stale value
    // would survive unnoticed.
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Tailwind's `sm` breakpoint, as a query. Below this is "a phone". */
export const BELOW_SM = '(max-width: 639px)'
