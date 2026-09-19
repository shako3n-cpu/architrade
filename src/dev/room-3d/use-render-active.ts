import { useEffect, useState, type RefObject } from 'react'

/**
 * Whether the room is worth drawing at all: the tab is visible AND some of
 * the stage is on screen. When either stops being true, the canvas stops
 * rendering — frameloop 'never' — and starts again the moment it is back.
 * A WebGL scene left running under a page the visitor has scrolled down, or
 * in a background tab, is a laptop fan for nothing.
 *
 * A margin of 100px below the viewport, so the room is already drawing by
 * the time its top edge scrolls into sight.
 */
export function useRenderActive(stage: RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(true)
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden')

  useEffect(() => {
    const element = stage.current
    if (!element) return
    // The LAST entry: one delivery can carry several for the same element —
    // out and back in again between two callbacks — and the first is stale.
    const observer = new IntersectionObserver((entries) => setOnScreen(entries[entries.length - 1].isIntersecting), {
      rootMargin: '0px 0px 100px 0px',
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [stage])

  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return onScreen && tabVisible
}
