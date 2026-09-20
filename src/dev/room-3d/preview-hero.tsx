import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { B2bHero } from '@/components/b2b/hero'
import { webglSupport } from './webgl-support'

/**
 * ============================================================================
 * THE ROOM AS THE HOME PAGE'S HERO — PREVIEW BRANCH ONLY
 * ----------------------------------------------------------------------------
 * The room in place of the photograph on the real "/" route, so the Vercel
 * preview shows it to anyone who simply opens the site. See App.tsx for how
 * to undo the whole thing.
 *
 * THIS FILE IS THE ONLY PART THAT SHIPS IN THE SITE'S OWN CHUNK. It is a few
 * lines of React and a lazy import; three, drei, the post-processing chain
 * and the four rooms sit behind `import('./home-hero')` and are fetched by
 * this page and /dev/room alone. Never import ./home-hero (or anything else
 * in this folder) from here at the top level — that would put the whole 3D
 * stack into the bundle every page loads.
 *
 * THE PHOTOGRAPH IS THE FLOOR, NOT AN ERROR STATE
 *   A visitor never sees a blank or broken hero. <B2bHero> — the hero the
 *   site has always had — is shown instead whenever the room cannot be, and
 *   there are four ways that happens:
 *
 *     no WebGL2        the renderer three 0.186 needs cannot be created
 *     a slow device    two cores or less, or under 2GB of reported memory
 *     while loading    the 3D chunk is a megabyte; the photograph holds the
 *                      page until it lands, then the room takes over
 *     anything thrown  a failed import, a WebGL context that dies on
 *                      creation or is lost later — caught, logged once, and
 *                      the photograph goes back up
 *
 *   Reduced motion is NOT one of them: the room handles it itself, showing
 *   the furnished room at rest with no drop-in (furnish-clock.ts).
 * ============================================================================
 */

const RoomHomeHero = lazy(() => import('./home-hero'))

/**
 * Whether this browser and machine can be asked to draw the room. The WebGL2
 * question is webgl-support.ts, asked once per page load and shared with the
 * dev page, which reports the same verdict in words rather than swapping in
 * the photograph.
 */
function canDrawTheRoom(): boolean {
  // A device this small is better served by the photograph: the room would
  // run, but at a frame rate that reads as broken rather than as slow.
  const cores = navigator.hardwareConcurrency
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (typeof cores === 'number' && cores > 0 && cores <= 2) return false
  if (typeof memory === 'number' && memory > 0 && memory < 2) return false

  return webglSupport().ok
}

/** Anything the room throws on the way up puts the photograph back. */
class HeroBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[room hero] could not be shown; falling back to the photograph.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function PreviewRoomHero() {
  const [able] = useState(canDrawTheRoom)
  const [lost, setLost] = useState(false)

  /*
   * A context lost after the scene is up — a GPU reset, a driver that gave up,
   * a laptop switching cards — is not caught by the boundary: nothing throws,
   * the canvas simply stops drawing and goes blank. Listened for on the
   * document in the CAPTURE phase, because the event is fired at the canvas
   * and does not bubble.
   */
  useEffect(() => {
    if (!able) return
    const onLost = () => setLost(true)
    document.addEventListener('webglcontextlost', onLost, true)
    return () => document.removeEventListener('webglcontextlost', onLost, true)
  }, [able])

  if (!able || lost) return <B2bHero />

  return (
    <HeroBoundary fallback={<B2bHero />}>
      <Suspense fallback={<B2bHero />}>
        <RoomHomeHero />
      </Suspense>
    </HeroBoundary>
  )
}
