import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

/**
 * The page's motion toolkit. Every piece switches itself off under
 * prefers-reduced-motion, and nothing here hides content unless the thing
 * that will reveal it again is certain to run.
 *
 * A NOTE ON WORDS
 *   Tailwind scans every source file in the project for class names, and a
 *   plain word that happens to be a utility — even in a comment — is added to
 *   the SITE's stylesheet. Two did exactly that in the previous demo. So the
 *   attribute that marks an off-screen band is `data-offscreen`, and the
 *   vocabulary here avoids the utility names.
 */

const REDUCE = '(prefers-reduced-motion: reduce)'
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

function subscribeToReduce(onChange: () => void) {
  const query = window.matchMedia(REDUCE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeToReduce, () => window.matchMedia(REDUCE).matches, () => false)
}

const prefersReduce = () => window.matchMedia(REDUCE).matches
const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches

/**
 * SCROLL REVEALS
 *   Everything marked `data-reveal` inside `root` rises into place the first
 *   time it scrolls into view, staggered by its `--i`. The hidden starting
 *   state belongs to the `bd-motion` class, added before the first paint and
 *   only when an observer will run and motion is welcome.
 */
export function useReveals(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const element = root.current
    if (!element || prefersReduce() || !('IntersectionObserver' in window)) return

    element.classList.add('bd-motion')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          entry.target.dispatchEvent(new CustomEvent('bd:reveal'))
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    for (const item of element.querySelectorAll('[data-reveal]')) observer.observe(item)
    return () => {
      observer.disconnect()
      element.classList.remove('bd-motion')
    }
  }, [root])
}

/**
 * DRIFTING MESHES COME TO REST OFF SCREEN
 *   Every `[data-mesh]` band gets `data-offscreen` while it is out of view,
 *   and the stylesheet holds its animations still. A slow drift nobody can
 *   see is still a compositor running for nothing.
 */
export function useOffscreenMeshes(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const band = entry.target as HTMLElement
        if (entry.isIntersecting) delete band.dataset.offscreen
        else band.dataset.offscreen = ''
      }
    })
    for (const band of element.querySelectorAll('[data-mesh]')) observer.observe(band)
    return () => observer.disconnect()
  }, [root])
}

/**
 * MAGNETIC PULL
 *   The wrapper's first child leans toward the pointer while it is inside —
 *   easing in, and never more than `reach` pixels — and settles back when it
 *   leaves. The wrapper itself stays put, so the region that catches the
 *   pointer does not move with the button. The pointer's place in the button
 *   goes to CSS as --mx / --my for its sheen. Mouse and trackpad only.
 */
export function useMagnetic<T extends HTMLElement>(reach = 6) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const wrapper = ref.current
    const target = wrapper?.firstElementChild as HTMLElement | null
    if (!wrapper || !target || prefersReduce() || !hasFinePointer()) return

    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = wrapper.getBoundingClientRect()
        const lean = (d: number, half: number) => (reach * Math.tanh(d / half)).toFixed(1)
        target.style.translate = `${lean(event.clientX - box.left - box.width / 2, box.width / 2)}px ${lean(event.clientY - box.top - box.height / 2, box.height / 2)}px`
        const own = target.getBoundingClientRect()
        target.style.setProperty('--mx', `${(event.clientX - own.left).toFixed(0)}px`)
        target.style.setProperty('--my', `${(event.clientY - own.top).toFixed(0)}px`)
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      target.style.translate = ''
    }
    wrapper.addEventListener('pointermove', onMove)
    wrapper.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      wrapper.removeEventListener('pointermove', onMove)
      wrapper.removeEventListener('pointerleave', onLeave)
    }
  }, [reach])
  return ref
}

/**
 * SPOTLIGHT GRID
 *   One pointer listener on a grid of cards hands EVERY card the pointer's
 *   position in its own coordinates (--px / --py), so a card's glowing edge
 *   lights up as the pointer nears it from a neighbour, not only once it is
 *   inside. Mouse and trackpad only; without one the glow stays at rest.
 */
export function useSpotlight<T extends HTMLElement>(selector: string) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const grid = ref.current
    if (!grid || prefersReduce() || !hasFinePointer()) return
    const cards = [...grid.querySelectorAll<HTMLElement>(selector)]

    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        for (const card of cards) {
          const box = card.getBoundingClientRect()
          card.style.setProperty('--px', `${(event.clientX - box.left).toFixed(0)}px`)
          card.style.setProperty('--py', `${(event.clientY - box.top).toFixed(0)}px`)
        }
        grid.dataset.lit = ''
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      delete grid.dataset.lit
    }
    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerleave', onLeave)
    }
  }, [selector])
  return ref
}

/**
 * COUNT-UP
 *   A figure that counts up from zero when its card is revealed. It renders
 *   the real value until then, so without script, without motion, or before
 *   the reveal, the number on the page is always the true one — the count is
 *   decoration on top of a correct figure, never a figure that might stop at
 *   the wrong place.
 */
export function useCountUp(value: number, card: RefObject<HTMLElement | null>) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const element = card.current
    if (!element || prefersReduce()) return
    let frame = 0
    const run = () => {
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 1400)
        setShown(Math.round(value * (1 - (1 - t) ** 4)))
        if (t < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }
    // The reveal may already have happened by the time this effect runs — the
    // observer and React's effects are not ordered — so look before listening.
    if (element.classList.contains('is-in')) run()
    else element.addEventListener('bd:reveal', run, { once: true })
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('bd:reveal', run)
    }
  }, [value, card])
  return shown
}
