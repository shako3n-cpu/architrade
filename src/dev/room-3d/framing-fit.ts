import { Vector3, type PerspectiveCamera } from 'three'

/**
 * ============================================================================
 * FITTING THE ROOM BESIDE THE COPY (desktop)
 * ----------------------------------------------------------------------------
 * On the desktop layout the canvas is the whole hero and the copy — headline,
 * buttons, the room switch, the swatches — sits over its top-left. The room
 * used to be placed by a fixed distance per window shape and a fixed shift
 * right. On a 16:9 screen that looked right; on a squarer window (1200x900,
 * 1280x1024) the room sat high with a band of empty stage below it, and its
 * left wall ran in under the text.
 *
 * Now it is FITTED: the largest room — up to MAX_GROWTH larger than the old
 * framing — whose silhouette stays inside the canvas margins, clear of the
 * Replay row at the bottom, and clear of the copy block, placed as near the
 * vertical middle of the stage as the copy allows.
 *
 * WHAT MAY GO BEHIND THE COPY, AND WHAT MAY NOT
 *   The walls may: they are off-white, a step from the page's own background,
 *   and dark type reads on them exactly as it does on the page. The FLOOR may
 *   not — the timber and everything standing on it would turn the headline,
 *   the room switch and the swatches into dark-on-dark. So it is the floor
 *   slab's outline (not a bounding box: on screen it is a lozenge, its
 *   corners empty) that is kept clear of the copy block, while the whole
 *   model, walls included, is kept inside the canvas margins.
 *
 *   Nor may the TALL pieces. Every room keeps them in its back-left
 *   quadrant — the bookcase, the plant and the floor lamp; the fridge; the
 *   shelving; the sideboard and its mirror — and at a squarer window the
 *   bookcase came up behind the buttons. So that quadrant, floor to 2.3m, is
 *   kept clear too.
 *
 *   Both are kept clear of the TEXT block — eyebrow to the buttons. The
 *   controls panel under it has a surface of its own, and may sit over the
 *   room. First attempts protected nothing (the walls ran under the text),
 *   then everything (the room shrank to fit beside a column half the stage
 *   wide); floor and tall pieces against text is the line that keeps the
 *   type legible and lets the room be large.
 * ============================================================================
 */

export type Rect = { x0: number; y0: number; x1: number; y1: number }

type Point = [number, number]

/** How much larger than the old tuned framing the room may be. */
export const MAX_GROWTH = 1.2

/** Space kept round the model: each side, the top, and the Replay row. */
const SIDE = 28
const TOP = 28
const BOTTOM = 96
/** Clearance kept round the copy block. */
const COPY_GAP = 20

/** Andrew's monotone chain. */
function convexHull(points: Point[]): Point[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Point[] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: Point[] = []
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

/** Separating axis test: does a convex polygon overlap an axis-aligned rectangle? */
function polygonHitsRect(poly: Point[], r: Rect): boolean {
  // The rectangle's own axes first: the polygon's bounds against the rectangle.
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of poly) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  if (maxX < r.x0 || minX > r.x1 || maxY < r.y0 || minY > r.y1) return false

  // Then each polygon edge's normal.
  const corners: Point[] = [
    [r.x0, r.y0],
    [r.x1, r.y0],
    [r.x1, r.y1],
    [r.x0, r.y1],
  ]
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[(i + 1) % poly.length]
    const nx = by - ay
    const ny = ax - bx
    let pMin = Infinity
    let pMax = -Infinity
    for (const [x, y] of poly) {
      const d = x * nx + y * ny
      pMin = Math.min(pMin, d)
      pMax = Math.max(pMax, d)
    }
    let rMin = Infinity
    let rMax = -Infinity
    for (const [x, y] of corners) {
      const d = x * nx + y * ny
      rMin = Math.min(rMin, d)
      rMax = Math.max(rMax, d)
    }
    if (pMax < rMin || rMax < pMin) return false
  }
  return true
}

/** The model's corners projected to canvas pixels, with no view offset. */
function projectHull(cam: PerspectiveCamera, corners: Vector3[], W: number, H: number): Point[] {
  cam.clearViewOffset()
  cam.updateMatrixWorld()
  const v = new Vector3()
  return convexHull(
    corners.map((c) => {
      v.copy(c).project(cam)
      return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H] as Point
    }),
  )
}

export type Fit = { distance: number; shiftX: number; shiftY: number }

/**
 * The fit for a W x H canvas with the copy block at `copy` (canvas pixels).
 * `place(d)` puts the camera d from the room's centre on its default line of
 * sight. Null when nothing fits even at twice the old distance — the caller
 * then keeps the old framing.
 */
export function fitBesideCopy(
  cam: PerspectiveCamera,
  corners: Vector3[],
  solids: Vector3[][],
  W: number,
  H: number,
  copy: Rect,
  tuned: number,
  place: (distance: number) => void,
): Fit | null {
  const keepOut: Rect = { x0: copy.x0 - COPY_GAP, y0: copy.y0 - COPY_GAP, x1: copy.x1 + COPY_GAP, y1: copy.y1 + COPY_GAP }
  const X0 = SIDE
  const X1 = W - SIDE
  const Y0 = TOP
  const Y1 = H - BOTTOM

  const at = (distance: number): Fit | null => {
    place(distance)
    const hull = projectHull(cam, corners, W, H)
    const kept = solids.map((solid) => projectHull(cam, solid, W, H))
    let bx0 = Infinity
    let bx1 = -Infinity
    let by0 = Infinity
    let by1 = -Infinity
    for (const [x, y] of hull) {
      bx0 = Math.min(bx0, x)
      bx1 = Math.max(bx1, x)
      by0 = Math.min(by0, y)
      by1 = Math.max(by1, y)
    }
    if (bx1 - bx0 > X1 - X0 || by1 - by0 > Y1 - Y0) return null

    // Translations that keep the hull inside the margins.
    const txMin = X0 - bx0
    const txMax = X1 - bx1
    const tyMin = Y0 - by0
    const tyMax = Y1 - by1
    const tyMid = (Y0 + Y1) / 2 - (by0 + by1) / 2

    // Vertical positions, nearest the middle first.
    const steps = 20
    const tys = Array.from({ length: steps + 1 }, (_, i) => tyMin + ((tyMax - tyMin) * i) / steps).sort(
      (a, b) => Math.abs(a - tyMid) - Math.abs(b - tyMid),
    )
    const hits = (tx: number, ty: number) =>
      kept.some((poly) =>
        polygonHitsRect(
          poly.map(([x, y]) => [x + tx, y + ty] as Point),
          keepOut,
        ),
      )

    for (const ty of tys) {
      if (hits(txMax, ty)) continue
      // As far left as it can go without touching the copy...
      let left = txMax
      for (let tx = txMax - 8; tx >= txMin; tx -= 8) {
        if (hits(tx, ty)) break
        left = tx
      }
      // ...and then halfway back: the room centred in the space the copy leaves.
      const tx = (left + txMax) / 2
      return { distance, shiftX: -tx, shiftY: -ty }
    }
    return null
  }

  for (let d = tuned / MAX_GROWTH; d <= tuned * 2; d *= 1.025) {
    const fit = at(d)
    if (fit) return fit
  }
  return null
}
