/**
 * ============================================================================
 * THE CAMERA RIG — what moves the camera besides the visitor's drag
 * ----------------------------------------------------------------------------
 *   baseDistance   how far the camera sits from the room's centre when the
 *                  page is at the top — set by <Framing> in room-scene.tsx,
 *                  for the shape of the canvas
 *   scroll         0..1, how far the hero has been scrolled away — set by the
 *                  hero's scroll listener (useScrollCamera), read every frame
 *                  by <ScrollDolly>, which pushes the camera in along its own
 *                  line of sight: 0 at the top, SCROLL_PUSH of the way in when
 *                  the hero has gone
 *
 * The scroll camera is off — `scroll` held at 0 — under reduced motion, and
 * on touch screens and the stacked (below lg) layout. There the stage sits
 * under the copy, so scrolling first brings the room INTO view; pushing in
 * as it arrived would crop it just as it was seen. And on a phone the scroll
 * position jumps as the address bar slides, which would jolt the camera.
 * ============================================================================
 */
export const RIG = {
  baseDistance: 17.5,
  scroll: 0,
  /** Stage time the opening move began; Infinity until the first room starts. */
  introAt: Number.POSITIVE_INFINITY,
}

/** How far in the camera goes at full scroll: this share of its distance. */
export const SCROLL_PUSH = 0.3

/* -------------------------------------------------------------------------- */
/* The opening move                                                           */
/* -------------------------------------------------------------------------- */

/**
 * THE FIRST FRAMING IS NOT THE FINAL ONE
 *
 * The page opens with the camera a little further out — the empty room seen
 * slightly wider — and settles into the framing over about a second, as the
 * first pieces drop in. It is the move a camera operator makes to introduce a
 * set, and it costs nothing: the same shot, approached rather than cut to.
 *
 * Small on purpose. Past about a fifth it stops reading as a settle and
 * starts reading as a zoom, and the fitted framing (framing-fit.ts) is what
 * the room is composed for — the opening only borrows from it briefly.
 *
 * Off under reduced motion: the room is simply there, in frame.
 */
const INTRO_PULL = 0.16

/** Seconds the camera takes to settle from the wider opening into the framing. */
const INTRO_EASE = 1.1

/** Called once, when the first room begins to arrive. Later rooms do not re-run it. */
export function beginIntro(at: number) {
  if (RIG.introAt === Number.POSITIVE_INFINITY) RIG.introAt = at
}

/** Replay: the opening move belongs to the intro, so it plays again with it. */
export function restartIntro(at: number) {
  RIG.introAt = at
}

/** A fresh scene opens with the move again. */
export function clearIntro() {
  RIG.introAt = Number.POSITIVE_INFINITY
}

/**
 * What to multiply the camera's distance by this frame: 1 + INTRO_PULL before
 * the first room starts, easing to 1 over INTRO_EASE once it has.
 */
export function introPull(now: number): number {
  if (RIG.introAt === Number.POSITIVE_INFINITY) return 1 + INTRO_PULL
  const t = Math.min(Math.max((now - RIG.introAt) / INTRO_EASE, 0), 1)
  return 1 + INTRO_PULL * (1 - t) ** 3 // ease-out cubic
}
