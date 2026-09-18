import { createContext, useContext, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * ============================================================================
 * THE ROOM FURNISHING ITSELF — TIMING
 * ----------------------------------------------------------------------------
 * Every piece drops in on its own clock: piece N starts STAGGER seconds after
 * piece N-1, falls under something like gravity, lands with a small squash,
 * rebounds a few centimetres and settles — turning slightly as it falls and
 * overshooting that turn before it comes to rest.
 *
 * NOTHING HERE IS REACT STATE
 *   The timing is read from the render loop's own clock every frame and
 *   written straight onto each piece's transform (see drop-in.tsx). A React
 *   re-render per piece per frame would be sixty reconciliations a second for
 *   no benefit.
 *
 * REPLAY IS ONE NUMBER
 *   Every piece measures itself from `start`. Moving `start` to "now" restarts
 *   the whole sequence — nothing is unmounted or rebuilt, so replay costs
 *   nothing and cannot leak.
 *
 * REDUCED MOTION IS "ALREADY FINISHED"
 *   Not a slower or shorter animation: progress is pinned past the end, so the
 *   first frame the visitor sees is the furnished room with the lamp on.
 * ============================================================================
 */

/** Seconds between one piece starting and the next. */
export const STAGGER = 0.5

/** Seconds one piece takes from appearing to coming to rest. */
export const DURATION = 0.95

/** Share of DURATION spent falling; the rest is the landing. */
const FALL = 0.52

/** Lead-in before the first piece, so shaders compile on an empty room. */
export const LEAD_IN = 0.7

/** How long past landing a light takes to come fully up, in progress units. */
export const LAMP_WARMUP = 0.6

export type FurnishClock = {
  /** Clock time, in seconds, at which piece 0 starts. */
  start: MutableRefObject<number>
  reduced: boolean
}

export const FurnishContext = createContext<FurnishClock | null>(null)

export function useFurnishClock(): FurnishClock {
  const clock = useContext(FurnishContext)
  if (!clock) throw new Error('A furnished piece must be rendered inside <FurnishProvider>.')
  return clock
}

/**
 * Where piece `index` is in its drop: below 0 not yet started, 0..1 moving,
 * 1 and above at rest. Returned as a getter rather than a value because it is
 * read inside other useFrame callbacks, where a value captured at render time
 * would be frozen.
 */
export function useDropProgress(index: number): () => number {
  const { start, reduced } = useFurnishClock()
  const elapsed = useRef(0)

  useFrame(({ clock }) => {
    elapsed.current = clock.elapsedTime
  })

  return () =>
    reduced ? 1 + LAMP_WARMUP : (elapsed.current - start.current - index * STAGGER) / DURATION
}

/**
 * Overshoots its target by about ten percent before settling. Used for the
 * TURN only — an overshoot in position would push furniture through the floor.
 */
function easeOutBack(t: number): number {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

export type Pose = {
  /** Metres above the resting place. */
  y: number
  /** Radians of turn still to unwind. */
  yaw: number
  /** Radians of lean while falling. */
  tilt: number
  /** 0 at rest; positive flattens the piece into the floor. */
  squash: number
  /** Not started yet. */
  hidden: boolean
}

/**
 * The transform a piece should have at progress `t`, relative to where it
 * finally rests. Pure, so it can be reasoned about — and checked — on its own.
 */
export function dropPose(t: number, height: number, spin: number): Pose {
  if (t <= 0) return { y: height, yaw: spin, tilt: 0, squash: 0, hidden: true }
  if (t >= 1) return { y: 0, yaw: 0, tilt: 0, squash: 0, hidden: false }

  // Falling: accelerating, like something released rather than lowered.
  if (t < FALL) {
    const p = t / FALL
    return {
      y: height * (1 - p * p),
      yaw: spin * (1 - easeOutBack(t)),
      tilt: 0.06 * (1 - p) * Math.sign(spin),
      squash: 0,
      hidden: false,
    }
  }

  // Landing: a quick squash on contact, then a small rebound that decays.
  const q = (t - FALL) / (1 - FALL)
  const SQUASH_END = 0.28
  const squash = q < SQUASH_END ? 0.055 * Math.sin((Math.PI * q) / SQUASH_END) : 0
  const r = q < SQUASH_END ? 0 : (q - SQUASH_END) / (1 - SQUASH_END)
  const hop = height * 0.032 * Math.sin(Math.PI * r) * (1 - 0.35 * r)

  return { y: hop, yaw: spin * (1 - easeOutBack(t)), tilt: 0, squash, hidden: false }
}
