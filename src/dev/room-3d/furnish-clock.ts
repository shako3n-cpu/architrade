import { createContext, useCallback, useContext, useMemo } from 'react'
import { STAGE } from './stage-clock'

/**
 * ============================================================================
 * THE ROOM FURNISHING ITSELF — TIMING
 * ----------------------------------------------------------------------------
 * Every piece arrives on its own clock: piece N starts `stagger` seconds
 * after piece N-1. Two ways of arriving:
 *
 *   'drop'    the INTRO — the first time the page shows a room, and Replay.
 *             Half a second apart, each piece falls under something like
 *             gravity, lands with a small squash, rebounds a few centimetres
 *             and settles, turning slightly as it falls. The showpiece.
 *   'quick'   a CHANGE OF ROOM. About 60ms apart, each piece eases down the
 *             last 45cm into place, ease-out, unwinding a little turn. The
 *             whole room is in within ~0.9s of the click (switchTiming).
 *
 * And one way of leaving, whichever way a piece arrived: it drops out — sinks
 * into the floor and shrinks away, ease-in, in LEAVE_DURATION, last in first
 * out. A piece still arriving when its room is sent away leaves from where
 * it is: the two motions compose, so nothing jumps.
 *
 * NOTHING HERE IS REACT STATE
 *   Every clock is read from the render loop each frame and written straight
 *   onto the pieces' transforms (drop-in.tsx). A React re-render per piece
 *   per frame would be sixty reconciliations a second for no benefit.
 *
 * REPLAY AND SWITCHING ARE A FEW NUMBERS
 *   A room's pieces all measure themselves from its RoomClock: `start` (when
 *   piece 0 begins), `leave` (when it starts to go) and its timing. Replay
 *   moves `start`; a change of room sets the old room's `leave` and gives
 *   the new one a clock of its own. Nothing is rebuilt to animate.
 *
 * REDUCED MOTION IS "ALREADY FINISHED"
 *   Progress is pinned past the end, so the first frame the visitor sees is
 *   the furnished room with the lamps on, and a change of room is a cut.
 * ============================================================================
 */

/** The intro: seconds between one piece starting and the next. */
export const STAGGER = 0.5

/** The intro: seconds one piece takes from appearing to coming to rest. */
export const DURATION = 0.95

/** Share of DURATION spent falling; the rest is the landing. */
const FALL = 0.52

/** Lead-in before the first piece, so shaders compile on an empty room. */
export const LEAD_IN = 0.7

/** How long past landing a light takes to come fully up, in progress units. */
export const LAMP_WARMUP = 0.6

/** A change of room: seconds from the click to the new room's first piece. */
export const ENTER_DELAY = 0.12

/** A change of room: seconds one piece takes to ease into place. */
const QUICK_DURATION = 0.42

/** A change of room: the whole switch, click to last piece at rest. */
const SWITCH_BUDGET = 0.9

/** How far above its place a piece starts, arriving quickly. Metres. */
const QUICK_RISE = 0.45

/** Seconds one piece takes to drop out when its room is sent away. */
export const LEAVE_DURATION = 0.24

/** Seconds between one piece starting to go and the next — last in, first out. */
export const LEAVE_STAGGER = 0.012

/** How far a leaving piece sinks as it shrinks away. Metres. */
const QUICK_SINK = 0.28

export type Timing = { style: 'drop' | 'quick'; stagger: number; duration: number }

export const INTRO: Timing = { style: 'drop', stagger: STAGGER, duration: DURATION }

/**
 * A change of room: ~60ms apart, but never so far apart that the room's last
 * piece lands later than SWITCH_BUDGET after the click — so the living room's
 * eleven pieces come in ~36ms apart, the others' four to six at 60.
 */
export function switchTiming(count: number): Timing {
  const room = SWITCH_BUDGET - ENTER_DELAY - QUICK_DURATION
  return { style: 'quick', stagger: count > 1 ? Math.min(0.06, room / (count - 1)) : 0, duration: QUICK_DURATION }
}

/** Seconds from a room's first piece starting to leave to its last one gone. */
export function leaveSpan(count: number): number {
  return (count - 1) * LEAVE_STAGGER + LEAVE_DURATION
}

/**
 * One room's clock. Its fields are read every frame by every piece in the
 * room; they are only ever changed through its methods — by the room
 * controller in room-scene.tsx, from the render loop or an effect.
 */
export class RoomClock {
  /** Stage time (stage-clock.ts) at which piece 0 starts. Infinity until scheduled. */
  start = Number.POSITIVE_INFINITY
  /** Stage time at which the room starts to leave. Infinity while it stays. */
  leave = Number.POSITIVE_INFINITY
  /** Stage time of the click that brought this room, plus ENTER_DELAY — it never starts before. */
  earliest = Number.NEGATIVE_INFINITY
  timing: Timing
  /** Its shaders are compiled and it is being drawn — see <Arrival>. */
  ready = false

  constructor(timing: Timing, earliest = Number.NEGATIVE_INFINITY) {
    this.timing = timing
    this.earliest = earliest
  }

  markReady() {
    this.ready = true
  }

  schedule(at: number) {
    this.start = Math.max(at, this.earliest)
  }

  sendAway(now: number) {
    if (this.leave === Number.POSITIVE_INFINITY) this.leave = now
  }

  replay(now: number) {
    this.timing = INTRO
    this.start = now + 0.15
  }

  get leaving() {
    return this.leave !== Number.POSITIVE_INFINITY
  }

  /** Every piece at rest — so its hotspots may show. Under reduced motion: simply drawn. */
  arrived(now: number, count: number, reduced = false) {
    if (!this.ready || this.leaving) return false
    return reduced || now >= this.start + (count - 1) * this.timing.stagger + this.timing.duration
  }

  /** Every piece gone — so the room can be unmounted. */
  gone(now: number, count: number) {
    return this.leaving && now >= this.leave + leaveSpan(count)
  }
}

export type FurnishClock = {
  clock: RoomClock
  /** Pieces in the room, so they can leave in reverse order. */
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
 * One piece's clocks, as getters rather than values because they are read
 * inside other useFrame callbacks, where a value captured at render time would
 * be frozen.
 *
 *   drop()    below 0 not yet started, 0..1 arriving, 1 and above at rest
 *   leave()   0 or below while the room stays; 0..1 leaving; 1 and above gone
 *   style()   how it arrives: 'drop' or 'quick'
 */
export type PieceClock = {
  drop: () => number
  leave: () => number
  style: () => Timing['style']
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
  const { clock, count, reduced } = useFurnishClock()

  // Read from the stage clock (stage-clock.ts), the same timeline the room's
  // clock is set on — never from R3F's, which restarts when the canvas pauses.
  return useMemo(
    () => ({
      drop: () =>
        reduced ? 1 + LAMP_WARMUP : (STAGE.now - clock.start - index * clock.timing.stagger) / clock.timing.duration,
      leave: () =>
        reduced ? 0 : (STAGE.now - clock.leave - (count - 1 - index) * LEAVE_STAGGER) / LEAVE_DURATION,
      style: () => clock.timing.style,
    }),
    [clock, count, reduced, index],
  )
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const smoothstep = (x: number) => x * x * (3 - 2 * x)

/**
 * How far on a lamp is, 0..1: off while it arrives, warming up over
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
 * clock: it comes in while that piece arrives — the room changing colour as
 * it starts to furnish — and, since the first piece in is the last out, goes
 * as that last piece leaves.
 */
export function useWallReveal(): () => number {
  const clock = usePieceClock(0)
  return useCallback(() => {
    const quick = clock.style() === 'quick'
    const arriving = smoothstep(clamp01(clock.drop() / (quick ? 1 : 0.8)))
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
 * The intro's transform at progress `t`, relative to where the piece finally
 * rests. Pure, so it can be reasoned about — and checked — on its own.
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

/** A piece's whole transform this frame, arriving and leaving composed. */
export type PiecePose = Pose & {
  /** Uniform scale, before the squash. */
  scale: number
  /** 0 at rest, 1 at its highest — how far its contact shadow has spread and faded. */
  lift: number
  /** 1 while staying, falling to 0 as it leaves — its contact shadow's strength. */
  presence: number
}

/**
 * Where a piece is this frame: its arrival — the intro's drop or a switch's
 * ease — and, once its room is sent away, the drop-out on top of it.
 */
export function piecePose(clock: PieceClock, height: number, spin: number): PiecePose {
  const t = clock.drop()
  let pose: PiecePose

  if (clock.style() === 'drop') {
    const p = dropPose(t, height, spin)
    pose = { ...p, scale: 1, lift: height > 0 ? Math.min(Math.max(p.y / height, 0), 1) : 0, presence: 1 }
  } else if (t <= 0) {
    pose = { y: QUICK_RISE, yaw: spin, tilt: 0, squash: 0, hidden: true, scale: 1, lift: 1, presence: 1 }
  } else {
    const e = t >= 1 ? 1 : 1 - (1 - t) ** 3 // ease-out cubic
    pose = {
      y: QUICK_RISE * (1 - e),
      yaw: spin * 0.5 * (1 - e),
      tilt: 0,
      squash: 0,
      hidden: false,
      scale: 0.9 + 0.1 * e,
      lift: 1 - e,
      presence: 1,
    }
  }

  const l = clock.leave()
  if (!pose.hidden && l > 0) {
    if (l >= 1) {
      pose.hidden = true
    } else {
      const e = l * l // ease-in: it goes slowly, then all at once
      pose.y -= QUICK_SINK * e
      pose.scale *= 1 - 0.9 * e
      pose.presence = 1 - e
    }
  }
  return pose
}
