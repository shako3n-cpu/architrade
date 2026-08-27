import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * ============================================================================
 * IDLE TIMEOUT
 * ----------------------------------------------------------------------------
 *   const { warning, secondsLeft, stayActive } = useIdleTimeout({
 *     idleMs: 15 * 60_000,
 *     warnMs: 60_000,
 *     onIdle: () => void signOut(),
 *     enabled: status === 'ready',
 *   })
 *
 * `warning` turns true for the last `warnMs` before the deadline, so the
 * caller can offer a way out rather than snatching the screen away. Any of the
 * tracked interactions during that minute cancels it — the warning exists to
 * provoke exactly that.
 *
 * WHY A CLOCK AND NOT A TIMER
 *   The obvious build is setTimeout(onIdle, idleMs), reset on every event.
 *   It is wrong twice over. A background tab has its timers throttled to about
 *   once a minute, and a laptop that sleeps for two hours does not run them at
 *   all — so the deadline arrives late, or on wake, or not at all. Comparing
 *   wall-clock times on a one-second tick is immune to both: however long the
 *   machine was away, the arithmetic on return is still right.
 *
 * WHY THE TIMESTAMP IS SHARED
 *   Signing out is global — it revokes the refresh token for the account, so
 *   one idle tab would drag every other tab down with it, including the one
 *   being actively typed into. Writing the last-activity time to localStorage
 *   means every tab sees the newest interaction from any of them, and a
 *   forgotten second tab can no longer end a working session.
 * ============================================================================
 */

/**
 * The interactions that count as "still there".
 *
 * `scroll` is captured rather than bubbled: scrolling an inner element does
 * not bubble a scroll event to the window, and the admin tables scroll inside
 * their own container.
 */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart', 'wheel'] as const

/** How often the deadline is re-checked, and how often activity is recorded. */
const TICK_MS = 1000

const SHARED_KEY = 'archtrade.lastActivity'

type Options = {
  idleMs: number
  warnMs: number
  onIdle: () => void
  /** False while nobody is signed in — no listeners, no clock, no timeout. */
  enabled: boolean
}

function readShared(): number {
  try {
    const stored = Number(localStorage.getItem(SHARED_KEY))
    return Number.isFinite(stored) ? stored : 0
  } catch {
    return 0
  }
}

function writeShared(at: number): void {
  try {
    localStorage.setItem(SHARED_KEY, String(at))
  } catch {
    /* storage blocked — this tab still times out correctly on its own */
  }
}

export function useIdleTimeout({ idleMs, warnMs, onIdle, enabled }: Options) {
  const lastActivity = useRef(Date.now())
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(warnMs / 1000))
  const [warning, setWarning] = useState(false)

  /*
   * The warning is mirrored into a ref so the effect below can read it without
   * listing it as a dependency. Depending on it would rebuild every listener
   * the moment the warning appeared — and the rebuild re-marks activity, which
   * would cancel the warning it was reacting to, forever.
   */
  const warningRef = useRef(false)

  /*
   * Set the moment the deadline passes, cleared by the next interaction. The
   * clock keeps ticking while onIdle does its asynchronous work — signing out
   * is a network round trip — and without this latch every one of those ticks
   * would fire another sign-out.
   */
  const fired = useRef(false)
  const setWarn = useCallback((next: boolean) => {
    warningRef.current = next
    setWarning(next)
  }, [])

  // Kept in a ref so a caller passing an inline arrow does not tear down and
  // rebuild every listener on each render.
  const onIdleRef = useRef(onIdle)
  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const markActive = useCallback(() => {
    const now = Date.now()
    lastActivity.current = now
    writeShared(now)
    fired.current = false
    setWarn(false)
  }, [setWarn])

  useEffect(() => {
    if (!enabled) {
      setWarn(false)
      return
    }

    // A fresh sign-in is activity, whatever a stale shared timestamp says.
    markActive()

    /*
     * mousemove fires on every pixel of travel. Recording each one would mean
     * a localStorage write per pixel, so activity is collapsed to at most one
     * per tick — which is all the resolution a fifteen-minute deadline needs.
     */
    let lastRecorded = 0
    const onActivity = () => {
      const now = Date.now()
      if (now - lastRecorded < TICK_MS) {
        // Still cancel a visible warning immediately: waiting up to a second
        // to acknowledge a keystroke would look broken.
        if (warningRef.current) setWarn(false)
        return
      }
      lastRecorded = now
      markActive()
    }

    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, onActivity, { passive: true, capture: true })
    }

    const clock = window.setInterval(() => {
      // Another tab may have been used more recently than this one.
      const last = Math.max(lastActivity.current, readShared())
      lastActivity.current = last

      const remaining = last + idleMs - Date.now()

      if (remaining <= 0) {
        if (!fired.current) {
          fired.current = true
          setWarn(false)
          onIdleRef.current()
        }
        return
      }

      // Only the countdown that is on screen needs updating every second.
      // Outside the warning window this tick changes nothing and re-renders
      // nothing, which matters because it runs for fourteen minutes.
      const warn = remaining <= warnMs
      setWarn(warn)
      if (warn) setSecondsLeft(Math.ceil(remaining / 1000))
    }, TICK_MS)

    return () => {
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, onActivity, { capture: true })
      }
      window.clearInterval(clock)
    }
  }, [enabled, idleMs, warnMs, markActive, setWarn])

  return { warning, secondsLeft, stayActive: markActive }
}
