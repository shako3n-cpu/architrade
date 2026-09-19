import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

/**
 * ============================================================================
 * IDLE MOTION — the room breathing while nobody touches it
 * ----------------------------------------------------------------------------
 * Three things, all so slight that they are felt rather than seen:
 *
 *   sway     plant leaves turning a degree or two in an air current
 *   dust     motes drifting in the light (dust.tsx)
 *   breath   the light itself easing up and down by a few percent, like
 *            cloud passing the window — and every contact shadow with it
 *
 * All of it off under reduced motion (IDLE.enabled, set by the scene), and
 * the dust off on phones and on the cheaper render setting.
 * ============================================================================
 */

export const IDLE = {
  /** False under reduced motion: everything here holds still. */
  enabled: true,
  /** 1 ± a few percent, written by <Studio> every frame, read by the contact shadows. */
  breath: 1,
}

/**
 * A group that sways about its origin — a plant's crown, pivoting at the top
 * of its pot. `phase` offsets it from the room's other plants, so they do not
 * move in step.
 */
export function useSway(phase = 0, amount = 1) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    if (!IDLE.enabled) {
      g.rotation.set(0, 0, 0)
      return
    }
    const t = clock.elapsedTime + phase
    // Two slow, unrelated periods per axis, so the movement never repeats.
    g.rotation.z = amount * (0.018 * Math.sin(t * 0.55) + 0.008 * Math.sin(t * 1.3 + 1.7))
    g.rotation.x = amount * (0.012 * Math.sin(t * 0.43 + 0.8) + 0.006 * Math.sin(t * 1.1 + 2.9))
  })
  return group
}
