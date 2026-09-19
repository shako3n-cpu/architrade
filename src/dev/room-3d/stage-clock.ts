import { useFrame } from '@react-three/fiber'

/**
 * ============================================================================
 * THE STAGE'S OWN CLOCK
 * ----------------------------------------------------------------------------
 * Every time on the stage is an absolute time on one timeline: when a room
 * starts to arrive, when it is sent away, when a fade of fabric began. They
 * used to be read from R3F's `state.clock` — which is not one timeline:
 *
 *   - R3F restarts that clock at ZERO whenever the canvas's frameloop
 *     changes, and the canvas stops drawing (frameloop 'never') whenever the
 *     tab is hidden or the hero is scrolled away — see use-render-active.ts.
 *   - In the frame or two R3F still runs right after stopping, it sets the
 *     clock to the frame's timestamp: milliseconds, read as seconds.
 *
 * So a room chosen just as the page went into the background was sent away
 * at "11,737 seconds" on a clock that then started again from nothing: the
 * old room stayed, the new one was not due for three hours — stuck, with
 * the buttons already showing the new room and not an error anywhere. And
 * after any pause, the room on show vanished until the restarted clock caught
 * up with the moment it had arrived.
 *
 * This clock only ever moves forward, by each frame's step, and not by more
 * than MAX_STEP however long the frame: while the canvas is paused it simply
 * stands still, and the stage carries on from where it was. A long frame — a
 * shader compiling — holds the animation back rather than skipping it.
 * ============================================================================
 */

/** The longest step one frame may move the stage on. Seconds. */
const MAX_STEP = 0.1

export const STAGE = {
  /** Seconds of stage time — frames drawn, not time passed. */
  now: 0,
  /** This frame's step, for anything that eases by the frame. */
  step: 0,
}

/**
 * Moves the stage clock on, first thing each frame — priority -2, ahead of
 * the orbit controls at -1 and everything else at 0, so every reader in a
 * frame sees the same `now`. A negative priority, so it does not take over
 * rendering.
 */
export function StageClock() {
  useFrame((_, delta) => {
    STAGE.step = Math.min(Math.max(delta, 0), MAX_STEP)
    STAGE.now += STAGE.step
  }, -2)
  return null
}
