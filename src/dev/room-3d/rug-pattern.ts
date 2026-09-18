import { CanvasTexture, SRGBColorSpace } from 'three'
import { PALETTE } from './palette'
import { seeded } from './util'

/**
 * ============================================================================
 * THE RUGS' PATTERNS, DRAWN RATHER THAN DOWNLOADED
 * ----------------------------------------------------------------------------
 * Two designs, both two-tone, both drawn here onto a canvas:
 *
 *   'lattice'  ivory ground, a hand-knotted greige diamond lattice — the Beni
 *              Ourain idiom that high-end modern interiors reach for when a
 *              room of plain upholstery needs one soft pattern. The living
 *              room's rug, and the bedroom's.
 *   'border'   a graphite wool ground with a single sand line knotted in
 *              from the edge — the office's, under the desk. A darker rug
 *              there because the desk is off-white: on ivory it disappeared.
 *
 * WHY NOT A POLY HAVEN FABRIC
 *   Every woven texture on Poly Haven is a close-up: one repeat is 25-50cm of
 *   weave. Across a three-metre rug seen from across the room that is ten
 *   repeats of detail smaller than a pixel, which mipmapping averages away to
 *   exactly the flat colour this replaces. What reads at this distance is a
 *   pattern at the scale of the rug itself, so that is what is drawn.
 *
 * HOW IT READS AS WOVEN AND NOT PRINTED
 *   - Lines are built from overlapping knots of uneven density, along a path
 *     that wanders a few millimetres, the way a hand-tied line does.
 *   - The ground has two kinds of noise: per-pixel grain for the pile, and a
 *     soft low-frequency mottling for the way wool takes dye unevenly.
 *   - The same texture is the bump map, so a line sits a fraction lower than
 *     the pile around it, as a carved line does.
 *
 * Deterministic — fixed seeds — so a rug is the same on every load and every
 * replay.
 * ============================================================================
 */

export type RugStyle = 'lattice' | 'border'

/** Real sizes, in metres. Each canvas is drawn to its rug's proportions. */
export const RUG_SIZES: Record<RugStyle, { width: number; depth: number }> = {
  lattice: { width: 3, depth: 2.1 },
  border: { width: 2.6, depth: 1.9 },
}

const PX_PER_M = 512

/** One knot of a hand-tied line: a dot of uneven density, occasionally missing. */
function knot(ctx: CanvasRenderingContext2D, rand: () => number, x: number, y: number, r: number) {
  const density = rand()
  if (density < 0.04) return
  ctx.globalAlpha = 0.45 + 0.5 * density
  ctx.beginPath()
  ctx.arc(x, y, r * (0.82 + 0.3 * rand()), 0, Math.PI * 2)
  ctx.fill()
}

const wobble = (t: number, phase: number) => 3.2 * Math.sin(t * 0.011 + phase) + 1.8 * Math.sin(t * 0.037 + phase * 2.3)

/**
 * The diamond lattice: two families of diagonals, five cells across the
 * width and three down the depth, so every diamond is taller than it is wide
 * along the rug's length and the pattern is cut by the edge, not framed.
 */
function drawLattice(ctx: CanvasRenderingContext2D, W: number, H: number, rand: () => number) {
  const cellW = W / 5
  const slope = H / 3 / cellW
  const r = 0.015 * PX_PER_M // a ~3cm line, which survives the distance
  ctx.fillStyle = PALETTE.rugLine

  for (const dir of [1, -1]) {
    for (let k = -6; k <= 6; k++) {
      const phase = rand() * 10
      const x0 = k * cellW + cellW / 2
      for (let x = -r; x <= W + r; x += r * 0.55) {
        const y = dir * slope * (x - x0) + (dir === 1 ? 0 : H)
        if (y < -r * 2 || y > H + r * 2) continue
        knot(ctx, rand, x, y + wobble(x, phase), r)
      }
    }
  }
}

/** A single sand line knotted round the rug, 14cm in from its edge. */
function drawBorder(ctx: CanvasRenderingContext2D, W: number, H: number, rand: () => number) {
  const inset = 0.14 * PX_PER_M
  const r = 0.012 * PX_PER_M
  ctx.fillStyle = PALETTE.sandDeep

  const run = (x0: number, y0: number, x1: number, y1: number) => {
    const length = Math.hypot(x1 - x0, y1 - y0)
    const phase = rand() * 10
    for (let s = 0; s <= length; s += r * 0.55) {
      const t = s / length
      const w = wobble(s, phase) * 0.6
      // The wobble is across the line: vertical for a horizontal run, and so on.
      const across = y0 === y1 ? [0, w] : [w, 0]
      knot(ctx, rand, x0 + (x1 - x0) * t + across[0], y0 + (y1 - y0) * t + across[1], r)
    }
  }
  run(inset, inset, W - inset, inset)
  run(W - inset, inset, W - inset, H - inset)
  run(W - inset, H - inset, inset, H - inset)
  run(inset, H - inset, inset, inset)
}

const DESIGNS: Record<RugStyle, { ground: string; seed: number; draw: typeof drawLattice }> = {
  lattice: { ground: PALETTE.rugField, seed: 11, draw: drawLattice },
  border: { ground: PALETTE.rugGraphite, seed: 5, draw: drawBorder },
}

const cache = new Map<RugStyle, CanvasTexture>()

/**
 * A rug's texture — drawn once per design, then shared by every rug of that
 * design and by the one material that wears it.
 */
export function rugTexture(style: RugStyle): CanvasTexture {
  const hit = cache.get(style)
  if (hit) return hit

  const { width, depth } = RUG_SIZES[style]
  const design = DESIGNS[style]
  const W = Math.round(width * PX_PER_M)
  const H = Math.round(depth * PX_PER_M)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const rand = seeded(design.seed)

  ctx.fillStyle = design.ground
  ctx.fillRect(0, 0, W, H)
  design.draw(ctx, W, H, rand)
  ctx.globalAlpha = 1

  // Low-frequency mottling: a tiny random field, scaled up with smoothing.
  const mottleCanvas = document.createElement('canvas')
  mottleCanvas.width = 40
  mottleCanvas.height = 28
  const mctx = mottleCanvas.getContext('2d')!
  const mottle = mctx.createImageData(40, 28)
  for (let i = 0; i < mottle.data.length; i += 4) {
    const v = 128 + (rand() - 0.5) * 60
    mottle.data[i] = mottle.data[i + 1] = mottle.data[i + 2] = v
    mottle.data[i + 3] = 255
  }
  mctx.putImageData(mottle, 0, 0)
  const mottleScaled = document.createElement('canvas')
  mottleScaled.width = W
  mottleScaled.height = H
  const sctx = mottleScaled.getContext('2d', { willReadFrequently: true })!
  sctx.imageSmoothingEnabled = true
  sctx.imageSmoothingQuality = 'high'
  sctx.drawImage(mottleCanvas, 0, 0, W, H)
  const low = sctx.getImageData(0, 0, W, H).data

  // Pile grain, and the mottling, as a multiplier on every pixel.
  const image = ctx.getImageData(0, 0, W, H)
  const d = image.data
  for (let i = 0; i < d.length; i += 4) {
    const grain = (rand() - 0.5) * 0.07
    const blotch = ((low[i] - 128) / 128) * 0.035
    const m = 1 + grain + blotch
    d[i] = Math.min(255, d[i] * m)
    d[i + 1] = Math.min(255, d[i + 1] * m)
    d[i + 2] = Math.min(255, d[i + 2] * m)
  }
  ctx.putImageData(image, 0, 0)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  cache.set(style, texture)
  return texture
}
