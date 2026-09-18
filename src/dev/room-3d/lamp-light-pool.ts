import { createContext } from 'react'
import type { PointLight } from 'three'

/**
 * ============================================================================
 * THE LAMPS' LIGHTS ARE A FIXED POOL, NOT ONE PER LAMP
 * ----------------------------------------------------------------------------
 * three compiles the number of point lights INTO every lit shader. Give each
 * lamp its own point light and the count changes with the room — one in the
 * living room, none in the empty room between, two in the kitchen — and every
 * material in the scene recompiles at each change. Measured: the "empty
 * room" beat between two rooms stretched from under half a second to well
 * over one while the whole scene rebuilt its shaders.
 *
 * So the scene owns exactly LAMP_LIGHT_SLOTS point lights from the first
 * frame to the last, and a lamp borrows one while it is mounted: it claims a
 * slot, moves that light to where its bulb is each frame and sets its
 * intensity, and hands it back when it unmounts. The count never changes, so
 * nothing recompiles when the room does.
 *
 * Two, because the kitchen's pair of pendants is the most lamps any room
 * has. A lamp that finds no slot free still glows; it just lights nothing.
 * ============================================================================
 */

export const LAMP_LIGHT_SLOTS = 2

export type LampLightPool = {
  /** The pooled light in a slot. */
  light: (slot: number) => PointLight | null
  /** A free slot, marked taken — or null when every slot is in use. */
  claim: () => number | null
  /** Give a slot back; its light goes dark. */
  release: (slot: number) => void
}

export const LampLightContext = createContext<LampLightPool | null>(null)
