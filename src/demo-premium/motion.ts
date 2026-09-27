import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from 'react'

/**
 * The page's small motion toolkit: reduced motion, the scroll reveals, the
 * magnetic pull on the call to action, and the soft light that follows the
 * pointer across a surface. All four switch themselves off under
 * prefers-reduced-motion, and none of them hides content that has not been
 * revealed yet unless the reveal is certain to run — see useReveals.
 */

const REDUCE = '(prefers-reduced-motion: reduce)'
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

function subscribeToReduce(onChange: () => void) {
  const query = window.matchMedia(REDUCE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  )
}

const prefersReduce = () => window.matchMedia(REDUCE).matches
const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches

/**
 * SCROLL REVEALS
 *   Everything marked `data-reveal` inside `root` fades and rises into place
 *   the first time it scrolls into view, staggered by its `--i`.
 *
 *   The hidden starting state belongs to the `lp-motion` class, and this adds
 *   that class only once it knows an observer will reveal things again: no
 *   IntersectionObserver or reduced motion, and the page simply stays as
 *   written. A layout effect, so the class lands before the first paint and
 *   nothing below the fold flashes in and back out.
 */
export function useReveals(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const element = root.current
    if (!element || prefersReduce() || !('IntersectionObserver' in window)) return

    element.classList.add('lp-motion')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    for (const item of element.querySelectorAll('[data-reveal]')) observer.observe(item)
    return () => {
      observer.disconnect()
      element.classList.remove('lp-motion')
    }
  }, [root])
}

/**
 * MAGNETIC PULL
 *   Attach to a wrapper; the wrapper's first child leans toward the pointer
 *   while it is inside, and settles back when it leaves. The wrapper does not
 *   move, so the region that catches the pointer stays put while the button
 *   travels — measuring the moving button fed its own movement back in.
 *   Also passes the pointer's position to CSS as --mx / --my, for the
 *   button's inner highlight. Mouse and trackpad only.
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
        const x = event.clientX - (box.left + box.width / 2)
        const y = event.clientY - (box.top + box.height / 2)
        // A soft ceiling rather than a straight ratio: the lean builds quickly
        // near the centre and never passes `reach` pixels, however far out the
        // pointer is — a straight ratio carried the button 16px, which reads
        // as the button chasing the cursor rather than leaning toward it.
        const lean = (d: number, half: number) => (reach * Math.tanh(d / half)).toFixed(1)
        target.style.translate = `${lean(x, box.width / 2)}px ${lean(y, box.height / 2)}px`
        // The light is placed in the button's own box, wherever it has leant to.
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
 * POINTER LIGHT
 *   Hands the pointer's position within `ref` to CSS as --px / --py, for a
 *   soft light that follows it across a surface. Mouse and trackpad only;
 *   without them the CSS keeps its resting position.
 */
export function usePointerLight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || prefersReduce() || !hasFinePointer()) return

    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = element.getBoundingClientRect()
        element.style.setProperty('--px', `${(event.clientX - box.left).toFixed(0)}px`)
        element.style.setProperty('--py', `${(event.clientY - box.top).toFixed(0)}px`)
        element.dataset.lit = ''
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      delete element.dataset.lit
    }
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  return ref
}
