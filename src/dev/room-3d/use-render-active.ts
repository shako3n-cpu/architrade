import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

/**
 * Whether the room is worth drawing: the tab is visible AND some of the stage
 * is on screen. When either stops being true the canvas stops rendering —
 * frameloop 'never' — and starts again the moment it is back. A WebGL scene
 * left running under a page the visitor has scrolled past, or in a background
 * tab, is a laptop fan for nothing.
 *
 * THE CANVAS PAINTS BEFORE IT IS ALLOWED TO PAUSE
 *   `painted` is false until the scene has actually drawn a frame, and until
 *   then this returns true whatever the tab and the observer say. Pausing is
 *   an optimisation for a room the visitor has already seen; applied before
 *   the first frame it is not an optimisation, it is a blank hero.
 *
 *   It was one: on the Vercel preview the first observer delivery reported
 *   the stage as off screen, the canvas went to 'never' before drawing
 *   anything, and — since a pointer event does not advance a frame at
 *   'never' — it stayed blank until something happened to re-fire the
 *   observer. Locally the same code drew in time and looked fine, which is
 *   what a race does. Reproduced by forcing that first delivery false.
 *
 * A margin of 100px below the viewport, so the room is already drawing by the
 * time its top edge scrolls into sight.
 */
export function useRenderActive(stage: RefObject<HTMLElement | null>, painted: boolean) {
  const [onScreen, setOnScreen] = useState(true)

  /*
   * Visibility through useSyncExternalStore rather than an effect and an
   * event: React re-reads the snapshot as it subscribes, so a tab that became
   * visible between this component rendering and its listener going on cannot
   * be missed. With an effect it could be — and the page then sat at 'never'
   * with nothing left to fire.
   */
  const tabVisible = useSyncExternalStore(subscribeToVisibility, isTabVisible, alwaysVisible)

  useEffect(() => {
    const element = stage.current
    if (!element) return
    /*
     * The LAST entry: one delivery can carry several for the same element —
     * out and back in again between two callbacks — and the first is stale.
     *
     * And a claim that the stage is off screen is MEASURED before it is
     * believed. On the Vercel preview the first delivery said off screen for
     * a hero sitting at the top of the page; the canvas paused before
     * drawing anything and stayed blank, since a pointer event does not
     * advance a frame at 'never'. Locally the same code won the race and
     * looked fine. Pausing is worth a getBoundingClientRect when it is
     * wrong this expensively — and it is only read when something claims
     * the stage has gone.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1]
        setOnScreen(last.isIntersecting || !isOutOfView(element))
      },
      { rootMargin: `0px 0px ${MARGIN}px 0px` },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [stage])

  return painted ? onScreen && tabVisible : true
}

/** How far below the viewport still counts as on screen, in pixels. */
const MARGIN = 100

/** Genuinely out of sight: measured, not reported. */
function isOutOfView(element: HTMLElement): boolean {
  const box = element.getBoundingClientRect()
  // A zero-sized box is a stage that has not been laid out yet, not one that
  // has gone: the room is about to appear in it.
  if (box.width === 0 && box.height === 0) return false
  return box.bottom < -MARGIN || box.top > window.innerHeight + MARGIN
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

const isTabVisible = () => document.visibilityState !== 'hidden'

/** Server-rendered, where there is no document: assume visible. */
const alwaysVisible = () => true
