/**
 * ============================================================================
 * THE LAMP, AS NUMBERS
 * ----------------------------------------------------------------------------
 * One spun-brass dome pendant, described once and drawn twice:
 *
 *   lamp-drawing.tsx   a flat SVG that paints with the page, before any 3D
 *                      code has even been requested
 *   lamp-scene.tsx     the three.js model that replaces it when it is ready
 *
 * Both read these numbers, and the drawing projects them through the SAME
 * camera the scene renders with, so the lit lamp lands exactly where its
 * drawing was and the hand-over is a cross-fade, not a jump.
 *
 * NO three.js IMPORT IN THIS FILE. It ships in the page's own chunk, and the
 * page must not pull the 3D library in just to draw its placeholder.
 *
 * Units are metres; y is up; the shade's rim sits at y = 0.
 * ============================================================================
 */

/** A point on the lathe profile: [radius, height]. */
export type ProfilePoint = readonly [r: number, y: number]
export type Vec3 = readonly [x: number, y: number, z: number]

/** The shade: a shallow dome, 1.32m across and 56cm tall. */
export const SHADE = {
  radius: 0.66,
  height: 0.56,
  /** The hole at the crown, where the collar goes in. */
  crown: 0.05,
  /** Spun sheet thickness — enough to catch a line of light on the rim. */
  thickness: 0.012,
} as const

/** The brass collar at the crown, and the cord out of it. */
export const COLLAR = { radius: 0.045, bottom: SHADE.height - 0.02, top: SHADE.height + 0.13 } as const
export const CORD = { radius: 0.0055, top: 9 } as const

/**
 * The opal diffuser: the bottom half of a sphere, hanging just below the rim
 * so it shows from under the shade — the one glowing point in the hero.
 */
export const DIFFUSER = { radius: 0.15, y: 0.03 } as const

/**
 * The outer surface, crown to rim. Horizontal at the crown and vertical at
 * the rim — sin for the radius, a softened cos for the height — which is the
 * silhouette of a spun dome rather than of a bowl or a cone.
 */
export const SHADE_PROFILE: readonly ProfilePoint[] = Array.from({ length: 33 }, (_, i) => {
  const t = (i / 32) * (Math.PI / 2)
  return [SHADE.crown + (SHADE.radius - SHADE.crown) * Math.sin(t), SHADE.height * Math.cos(t) ** 1.35] as const
})

/**
 * The camera, slightly below the lamp and looking up at it, so the warm
 * inside of the shade shows through the rim — the view of a pendant anyone
 * standing under one actually has.
 */
export const CAMERA = {
  fov: 30,
  position: [0, -1.0, 6.2] as Vec3,
  target: [0, 0.02, 0] as Vec3,
} as const

/**
 * A world point on the stage, in half-heights of the stage from its centre,
 * y growing DOWN — SVG's convention. Three.js keeps the vertical field of
 * view fixed and centres the frame, so these coordinates hold at any stage
 * width; the drawing's viewBox relies on that.
 */
export function project([x, y, z]: Vec3): readonly [number, number] {
  const [px, py, pz] = CAMERA.position
  const forward = normalise([CAMERA.target[0] - px, CAMERA.target[1] - py, CAMERA.target[2] - pz])
  const right = normalise(cross(forward, [0, 1, 0]))
  const up = cross(right, forward)
  const d: Vec3 = [x - px, y - py, z - pz]
  const depth = dot(d, forward) * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180)
  return [dot(d, right) / depth, -dot(d, up) / depth]
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const normalise = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}
