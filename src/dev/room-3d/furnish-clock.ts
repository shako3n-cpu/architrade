import { createContext, useCallback, useContext, useMemo, useRef } from 'react'
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
 * CHANGING ROOMS IS THE SAME DROP, BACKWARDS
 *   Setting `leave` sends the furnished room back the way it came: each piece
 *   runs its own drop in reverse — a small squash, a lift, a turn — at about
 *   twice the speed, last in first out, and shrinks as it rises so it is gone
 *   before it reaches the top of the frame. There is no second animation:
 *   leaving is `dropPose` fed a progress that runs from 1 back to 0.
 *
 * REDUCED MOTION IS "ALREADY FINISHED"
 *   Not a slower or shorter animation: progress is pinned past the end, so the
 *   first frame the visitor sees is the furnished room with the lamp on, and
 *   a change of room is a plain cut.
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

/** Seconds one piece takes to clear, when the room changes. */
export const LEAVE_DURATION = 0.5

/** Seconds between one piece starting to clear and the next — last in, first out. */
export const LEAVE_STAGGER = 0.06

/**
 * How long the EMPTY room is held between one room clearing and the next
 * one arriving. Long enough to register as a beat — the room is bare, then it
 * becomes something else — and to absorb the shader compile of pieces that
 * have never been drawn; short enough not to read as a pause.
 */
export const SWITCH_LEAD_IN = 0.45

/** Seconds from the first piece of a room starting to clear to the last one gone. */
export function leaveSpan(count: number): number {
  return (count - 1) * LEAVE_STAGGER + LEAVE_DURATION
}

export type FurnishClock = {
  /** Clock time, in seconds, at which piece 0 starts. */
  start: MutableRefObject<number>
  /** Clock time at which the room starts to clear. Infinity while it stays. */
  leave: MutableRefObject<number>
  /** Pieces in the room, so they can clear in reverse order. */
  count: number
  reduced: boolean
}

export const FurnishContext = createContext<FurnishClock | null>(null)

export function useFurnishClock(): FurnishClock {
  const clock = useContext(FurnishContext)
  if (!clock) throw new Error('A furnished piece must be rendered inside <FurnishProvider>.')
  return clock
}

/**
 * One piece's two clocks, as getters rather than values because they are read
 * inside other useFrame callbacks, where a value captured at render time would
 * be frozen.
 *
 *   drop()    below 0 not yet started, 0..1 falling, 1 and above at rest
 *   leave()   0 or below while the room stays; 0..1 clearing; 1 and above gone
 */
export type PieceClock = {
  drop: () => number
  leave: () => number
}

/**
 * The clock of the DropIn a component is inside — so a lamp can read its own
 * landing without being told its place in the sequence a second time.
 */
export const PieceContext = createContext<PieceClock | null>(null)

/** How far on the lamp this is called from is, 0..1 — see lampWarmth. */
export function useLampWarmth(): () => number {
  const clock = useContext(PieceContext)
  if (!clock) throw new Error('A lamp must be rendered inside a <DropIn>.')
  return useCallback(() => lampWarmth(clock), [clock])
}

export function usePieceClock(index: number): PieceClock {
  const { start, leave, count, reduced } = useFurnishClock()
  const elapsed = useRef(0)

  useFrame(({ clock }) => {
    elapsed.current = clock.elapsedTime
  })

  return useMemo(
    () => ({
      drop: () => (reduced ? 1 + LAMP_WARMUP : (elapsed.current - start.current - index * STAGGER) / DURATION),
      leave: () =>
        reduced ? 0 : (elapsed.current - leave.current - (count - 1 - index) * LEAVE_STAGGER) / LEAVE_DURATION,
    }),
    [start, leave, count, reduced, index],
  )
}

/**
 * The progress a piece's pose is drawn from: its drop, or — once it is
 * leaving — the same drop running backwards, whichever is less far along. The
 * minimum is what makes a change of room mid-drop continuous: a piece still
 * falling carries on until the reversed clock catches it, then turns round.
 */
export function poseProgress(clock: PieceClock): number {
  const leaving = clock.leave()
  const drop = clock.drop()
  return leaving > 0 ? Math.min(drop, 1 - leaving) : drop
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const smoothstep = (x: number) => x * x * (3 - 2 * x)

/**
 * Scale while leaving: full size through the lift-off, then shrinking to
 * nothing over the rest of the rise.
 */
export function leaveScale(leaving: number): number {
  return 1 - smoothstep(clamp01((leaving - 0.3) / 0.7))
}

/**
 * How far on a lamp is, 0..1: off while it falls, warming up over
 * LAMP_WARMUP once it has landed — so it lights the room rather than
 * arriving lit — and off again quickly once it starts to leave: a lamp is
 * switched off before it is carried out.
 */
export function lampWarmth(clock: PieceClock): number {
  const up = smoothstep(clamp01((clock.drop() - 1) / LAMP_WARMUP))
  const out = 1 - smoothstep(clamp01(clock.leave() / 0.3))
  return up * out
}

/**
 * How far a room's wall treatment is in, 0..1, read from its FIRST piece's
 * clock: it comes in while that piece falls — the room changing colour as it
 * starts to furnish — and, since the first piece in is the last out, goes as
 * that last piece rises. Between two rooms the walls are plain again, so the
 * empty beat is the same empty room every time.
 */
export function useWallReveal(): () => number {
  const clock = usePieceClock(0)
  return useCallback(() => {
    const arriving = smoothstep(clamp01(clock.drop() / 0.8))
    const leaving = 1 - smoothstep(clamp01(clock.leave()))
    return arriving * leaving
  }, [clock])
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
