import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { useReducedMotion } from '../motion'
import { LampDrawing } from './lamp-drawing'
import type { LampHandle } from './lamp-scene'

/**
 * ============================================================================
 * THE HERO STAGE — drawing first, lamp second, never a blank
 * ----------------------------------------------------------------------------
 *   paint      The page paints with the flat drawing of the lamp in place
 *              (lamp-drawing.tsx). No 3D code has been requested yet.
 *   request    Two frames later — after that paint, so the 3D library never
 *              competes with the text for the first one — the scene's chunk
 *              is fetched. Only if this browser can draw WebGL2 at all, and
 *              not when the visitor has asked to save data.
 *   hand-over  The lamp compiles and renders; once its first frame has been
 *              presented, the canvas fades up over the drawing and the
 *              drawing fades out.
 *
 * Every step is gated on the one before it having HAPPENED, not on a delay
 * that is long enough on this machine. On a slow connection the drawing just
 * holds for longer; if the chunk fails, or the GPU drops the context, it
 * holds for good.
 * ============================================================================
 */
export function HeroStage() {
  const stage = useRef<HTMLDivElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const lamp = useRef<LampHandle | null>(null)
  const still = useReducedMotion()
  const [ready, setReady] = useState(false)
  const active = useStageActive(stage, ready)

  useEffect(() => {
    if (!canDrawWebGL2() || savesData()) return
    let live = true
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        import('./lamp-scene')
          .then(({ mountLamp }) => {
            if (!live || !host.current) return
            lamp.current = mountLamp(host.current, {
              still,
              onReady: () => live && setReady(true),
              onLost: () => live && setReady(false),
            })
          })
          .catch(() => {
            // No chunk, or no context: the drawing is the hero.
          })
      })
    })
    return () => {
      live = false
      cancelAnimationFrame(frame)
      lamp.current?.dispose()
      lamp.current = null
      setReady(false)
    }
  }, [still])

  useEffect(() => {
    lamp.current?.setActive(active)
  }, [active])

  return (
    <div ref={stage} className="lp-stage" data-ready={ready ? '' : undefined} aria-hidden="true">
      <LampDrawing />
      <div ref={host} className="lp-stage-canvas" />
    </div>
  )
}

/**
 * Whether the lamp should keep rendering: on screen (with 100px to spare)
 * and in a visible tab. Always true until the first frame has painted —
 * pausing a canvas that has not drawn yet leaves a blank one.
 */
function useStageActive(stage: RefObject<HTMLElement | null>, painted: boolean) {
  const [onScreen, setOnScreen] = useState(true)
  const tabVisible = useSyncExternalStore(subscribeToVisibility, isTabVisible, () => true)

  useEffect(() => {
    const element = stage.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries[entries.length - 1].isIntersecting),
      { rootMargin: '100px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [stage])

  return painted ? onScreen && tabVisible : true
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}
const isTabVisible = () => document.visibilityState !== 'hidden'

/** three.js needs WebGL2. Asked on a throwaway canvas, whose context is then released. */
function canDrawWebGL2(): boolean {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** The visitor's "save data" setting, where the browser exposes it. */
function savesData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}
