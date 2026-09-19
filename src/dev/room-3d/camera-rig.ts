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
}

/** How far in the camera goes at full scroll: this share of its distance. */
export const SCROLL_PUSH = 0.3
