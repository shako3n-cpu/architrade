/**
 * ============================================================================
 * THE ARCH, AS NUMBERS
 * ----------------------------------------------------------------------------
 * The hero object: a bronze arch — the ARCH in ARCHTRADE — holding a pane of
 * reeded amber glass. Described once here and drawn twice:
 *
 *   arch-drawing.tsx   a flat SVG that paints with the page, before any 3D
 *                      code has been requested
 *   arch-scene.ts      the three.js model that replaces it
 *
 * The drawing projects these numbers through the scene's own camera, at the
 * scene's resting pose, so the model lands where the drawing was and the
 * hand-over is a cross-fade.
 *
 * NO three.js IMPORT HERE: this file ships in the page's own chunk.
 *
 * Units are metres, y up. The arch stands centred on the origin.
 * ============================================================================
 */

export type Vec3 = readonly [x: number, y: number, z: number]
export type Vec2 = readonly [x: number, y: number]

export const ARCH = {
  /** Outside width and height. */
  width: 1.5,
  height: 2.0,
  /** The thickness of the band, jambs and crown alike. */
  band: 0.3,
  /** Front to back. */
  depth: 0.34,
} as const

/** Where the straight jambs turn into the arc, measured from the centre. */
export const SPRING_Y = ARCH.height / 2 - ARCH.width / 2
const OUTER_R = ARCH.width / 2
const INNER_R = ARCH.width / 2 - ARCH.band
const BOTTOM = -ARCH.height / 2

/** The glass sits halfway back in the opening. */
export const GLASS_Z = 0

/** The pool of light the arch floats over. */
export const FLOOR_Y = BOTTOM - 0.32

/**
 * The resting pose: turned a little off square, so its depth reads at once.
 * The motion (arch-scene.ts) swings either side of this and eases in from it.
 */
export const REST_YAW = -0.38

export const CAMERA = {
  fov: 30,
  position: [0, 0.3, 7.4] as Vec3,
  target: [0, -0.08, 0] as Vec3,
} as const

/**
 * The arch's outline as one closed line, anticlockwise: up the outside of the
 * left jamb, over the outer arc, down the right jamb, in across the foot, up
 * the inside of the right jamb, back under the inner arc, and down. The
 * opening reaches the ground, so it is part of the outline, not a hole.
 */
export function archOutline(segments = 48): Vec2[] {
  const points: Vec2[] = [[-OUTER_R, BOTTOM]]
  for (let i = 0; i <= segments; i++) {
    const a = Math.PI - (Math.PI * i) / segments
    points.push([OUTER_R * Math.cos(a), SPRING_Y + OUTER_R * Math.sin(a)])
  }
  points.push([OUTER_R, BOTTOM], [INNER_R, BOTTOM])
  for (let i = 0; i <= segments; i++) {
    const a = (Math.PI * i) / segments
    points.push([INNER_R * Math.cos(a), SPRING_Y + INNER_R * Math.sin(a)])
  }
  points.push([-INNER_R, BOTTOM])
  return points
}

/** The opening the glass fills, anticlockwise, a hair inside the band. */
export function openingOutline(segments = 48, inset = 0.012): Vec2[] {
  const r = INNER_R - inset
  const points: Vec2[] = [[-r, BOTTOM + inset], [r, BOTTOM + inset]]
  for (let i = 0; i <= segments; i++) {
    const a = (Math.PI * i) / segments
    points.push([r * Math.cos(a), SPRING_Y + r * Math.sin(a)])
  }
  return points
}

/** A point on the arch, turned to `yaw`, projected onto the stage. */
export function projectPosed([x, y, z]: Vec3, yaw = REST_YAW): Vec2 {
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  return project([x * c + z * s, y, -x * s + z * c])
}

/**
 * A world point on the stage, in half-heights of the stage from its centre,
 * y growing DOWN (SVG's convention). three.js keeps the vertical field of
 * view fixed and centres the frame, so these hold at any stage width.
 */
export function project([x, y, z]: Vec3): Vec2 {
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
