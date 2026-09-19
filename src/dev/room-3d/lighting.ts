import { AdditiveBlending, CanvasTexture, Color, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from 'three'
import { PALETTE } from './palette'

/**
 * ============================================================================
 * DAY AND EVENING
 * ----------------------------------------------------------------------------
 * Two moods for the same room, faded between (<DayNight> in room-scene.tsx):
 *
 *   day      soft window light from the side. The sun comes in low through
 *            the room's open right side — warm, from the window's height —
 *            so shadows fall long across the floor towards the far wall,
 *            where the camera can see them. The lamps are off; the studio
 *            around the model is at full strength.
 *   evening  a dim, cool moonlight from above for the key, the studio's
 *            ambient turned right down, every lamp and pendant on, and a warm
 *            cove glow along the crown moulding washing down both walls.
 *
 * NOTHING IS ADDED OR TAKEN AWAY BETWEEN THEM
 *   three builds the number of lights into every shader, so a light that
 *   appeared only in the evening would recompile every material in the room
 *   at the toggle — a stall exactly when someone is watching. Both moods use
 *   the same lights, the same materials; only intensities, colours and one
 *   position move. See lamp-light-pool.ts for the same rule for the lamps.
 *
 * The chosen mood is in the address (?light=day|evening); without one, it
 * follows the visitor's own clock — evening from 6pm to 6am.
 * ============================================================================
 */

export type TimeOfDay = 'day' | 'evening'

export function timeOfDayNow(date = new Date()): TimeOfDay {
  const hour = date.getHours()
  return hour >= 18 || hour < 6 ? 'evening' : 'day'
}

type Mood = {
  sun: { position: Vector3; color: Color; intensity: number }
  /** The studio's image-based light, scene.environmentIntensity. */
  ambient: number
  /** How far the lamps are on: multiplies each lamp's own warm-up. */
  lamps: number
  /** The cove light and its wash down the walls. */
  cove: number
}

export const MOODS: Record<TimeOfDay, Mood> = {
  day: {
    sun: { position: new Vector3(8, 5.6, 3.4), color: new Color('#fff4e2'), intensity: 4.1 },
    ambient: 0.5,
    lamps: 0,
    cove: 0,
  },
  evening: {
    sun: { position: new Vector3(3.5, 9, 5.5), color: new Color('#c3c9d8'), intensity: 0.55 },
    ambient: 0.2,
    lamps: 1,
    cove: 1,
  },
}

/**
 * The live mix, 0 = day, 1 = evening, written by <DayNight> every frame and
 * read by anything whose light depends on it — the lamps (lamp-glow.ts).
 */
export const LIGHTING = { evening: 0 }

/** The cove strip: an emissive line under the crown moulding, bright enough for bloom. */
export const COVE = new MeshStandardMaterial({
  // The moulding's own off-white by day — a black base showed as a dark line
  // under the ceiling — with the glow added on top in the evening.
  color: PALETTE.skirting,
  emissive: PALETTE.lampLight,
  emissiveIntensity: 0,
  toneMapped: false,
})

/**
 * The cove's wash down the wall: warm light, strongest at the top, fading
 * out over the upper third of the wall. Additive, so it brightens whatever
 * finish is on the wall rather than painting over it.
 */
function washTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  // Grey levels, not alpha: three reads an alphaMap from its GREEN channel,
  // and a white gradient that faded only in alpha read as solid.
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgb(255,255,255)')
  g.addColorStop(0.16, 'rgb(150,150,150)')
  g.addColorStop(0.5, 'rgb(40,40,40)')
  g.addColorStop(1, 'rgb(0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 256)
  return new CanvasTexture(canvas)
}

export const WASH = new MeshBasicMaterial({
  color: '#ffb46e',
  alphaMap: washTexture(),
  transparent: true,
  opacity: 0,
  blending: AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
})
