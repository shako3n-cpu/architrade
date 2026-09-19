import { useEffect, type RefObject } from 'react'
import { RIG } from './camera-rig'

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const smoothstep = (x: number) => x * x * (3 - 2 * x)

/** The next section, `f` of the way in: 0 faint and a little low, 1 as it was. */
function styleArrival(element: HTMLElement, f: number) {
  element.style.opacity = (0.15 + 0.85 * f).toFixed(3)
  element.style.transform = f >= 1 ? '' : `translate3d(0, ${((1 - f) * 36).toFixed(1)}px, 0)`
}

function clearArrival(element: HTMLElement) {
  element.style.opacity = ''
  element.style.transform = ''
}

/**
 * Scrolling away from the hero: publishes how far it has gone (RIG.scroll,
 * which <ScrollDolly> turns into the camera pushing into the room) and fades
 * the next section on the page in as it arrives — and both reverse on the
 * way back up.
 *
 * Passive listener, one requestAnimationFrame per burst of scroll events,
 * and only transform and opacity written to the page: nothing that makes
 * the browser lay anything out again.
 *
 * `enabled` false — reduced motion, a touch screen, the stacked layout; see
 * camera-rig.ts — holds the camera still and leaves the next section alone.
 */
export function useScrollCamera(hero: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const section = hero.current
    RIG.scroll = 0
    if (!section || !enabled) return

    const next = section.nextElementSibling instanceof HTMLElement ? section.nextElementSibling : null
    let frame = 0

    const update = () => {
      frame = 0
      const box = section.getBoundingClientRect()
      // 0 with the hero's top at the viewport's top; 1 once it has scrolled
      // up by 85% of its own height.
      const p = clamp01(-box.top / (box.height * 0.85))
      RIG.scroll = p
      if (next) styleArrival(next, smoothstep(clamp01((p - 0.04) / 0.5)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
      RIG.scroll = 0
      if (next) clearArrival(next)
    }
  }, [hero, enabled])
}
