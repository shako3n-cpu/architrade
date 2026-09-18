import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { PALETTE } from './palette'
import { seeded } from './util'

/**
 * ============================================================================
 * WALL FINISHES, DRAWN
 * ----------------------------------------------------------------------------
 * Like the rugs, drawn on a canvas at the scale they are seen at rather than
 * downloaded: a plaster or tile texture from a library is a close-up, and at
 * this distance its detail averages away to flat colour. Each texture is also
 * its surface's bump map. Deterministic, fixed seeds.
 *
 *   limewash   the bedroom's accent wall — a warm sand base under soft clouds
 *              of lighter and darker wash and criss-crossed brushwork, the way
 *              limewash is actually laid on. One sheet the size of the wall.
 *   tile       the kitchen's backsplash — 10cm handmade squares, each glazed a
 *              shade different from its neighbours and a touch darker at its
 *              edges where the glaze pools, in a grid of recessed grout. That
 *              tile-to-tile variation is what reads from across the room; a
 *              6mm grout line alone is under a pixel. One sheet repeats.
 * ============================================================================
 */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** A small random field of two colours, scaled up smoothly over the canvas. */
function clouds(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  W: number,
  H: number,
  cells: [number, number],
  light: string,
  dark: string,
  alpha: number,
) {
  const [cw, ch] = cells
  const small = document.createElement('canvas')
  small.width = cw
  small.height = ch
  const sctx = small.getContext('2d')!
  const image = sctx.createImageData(cw, ch)
  const [lr, lg, lb] = hexToRgb(light)
  const [dr, dg, db] = hexToRgb(dark)
  for (let i = 0; i < image.data.length; i += 4) {
    const isLight = rand() > 0.5
    image.data[i] = isLight ? lr : dr
    image.data[i + 1] = isLight ? lg : dg
    image.data[i + 2] = isLight ? lb : db
    image.data[i + 3] = Math.round(rand() * 255)
  }
  sctx.putImageData(image, 0, 0)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, W, H)
  ctx.restore()
}

/** Per-pixel grain, as a multiplier. */
function grain(ctx: CanvasRenderingContext2D, rand: () => number, W: number, H: number, amount: number) {
  const image = ctx.getImageData(0, 0, W, H)
  const d = image.data
  for (let i = 0; i < d.length; i += 4) {
    const m = 1 + (rand() - 0.5) * amount
    d[i] = Math.min(255, d[i] * m)
    d[i + 1] = Math.min(255, d[i + 1] * m)
    d[i + 2] = Math.min(255, d[i + 2] * m)
  }
  ctx.putImageData(image, 0, 0)
}

function finish(canvas: HTMLCanvasElement, repeat: boolean): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  if (repeat) texture.wrapS = texture.wrapT = RepeatWrapping
  return texture
}

let limewash: CanvasTexture | null = null

/**
 * Limewash for a wall `width` x `height` metres. Drawn once; the bedroom's
 * accent wall is the only one.
 */
export function limewashTexture(width: number, height: number): CanvasTexture {
  if (limewash) return limewash
  const PX = 256
  const W = Math.round(width * PX)
  const H = Math.round(height * PX)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const rand = seeded(41)

  ctx.fillStyle = PALETTE.limewash
  ctx.fillRect(0, 0, W, H)

  // Clouds at three scales, broad to fine.
  clouds(ctx, rand, W, H, [9, 4], PALETTE.limewashLight, PALETTE.limewashDark, 0.55)
  clouds(ctx, rand, W, H, [22, 9], PALETTE.limewashLight, PALETTE.limewashDark, 0.35)
  clouds(ctx, rand, W, H, [60, 26], PALETTE.limewashLight, PALETTE.limewashDark, 0.18)

  // Brushwork: short soft strokes criss-crossing at the two diagonals.
  for (let i = 0; i < 900; i++) {
    const x = rand() * W
    const y = rand() * H
    const angle = (rand() > 0.5 ? 1 : -1) * (0.5 + rand() * 0.6)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.globalAlpha = 0.03 + rand() * 0.05
    ctx.fillStyle = rand() > 0.5 ? PALETTE.limewashLight : PALETTE.limewashDark
    ctx.beginPath()
    ctx.ellipse(0, 0, 40 + rand() * 110, 6 + rand() * 16, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  grain(ctx, rand, W, H, 0.05)
  limewash = finish(canvas, false)
  return limewash
}

/** One sheet of tile is this many metres across and up; it repeats. */
export const TILE_SHEET = { width: 1.2, height: 0.6 } as const

let tile: CanvasTexture | null = null

/** Glazed 10cm squares in grout — one repeating sheet of 12 x 6. */
export function tileTexture(): CanvasTexture {
  if (tile) return tile
  const PX = 500
  const W = Math.round(TILE_SHEET.width * PX)
  const H = Math.round(TILE_SHEET.height * PX)
  const size = 0.1 * PX
  const grout = 3
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const rand = seeded(53)

  ctx.fillStyle = PALETTE.grout
  ctx.fillRect(0, 0, W, H)

  const [tr, tg, tb] = hexToRgb(PALETTE.tile)
  for (let row = 0; row < H / size; row++) {
    for (let col = 0; col < W / size; col++) {
      // Half the grout on every side of every tile, so the sheet repeats seamlessly.
      const x = col * size + grout / 2
      const y = row * size + grout / 2
      const s = size - grout
      // Each tile a shade lighter or darker, and a hair warmer or cooler.
      const shade = 1 + (rand() - 0.5) * 0.07
      const warm = (rand() - 0.5) * 6
      const r = Math.min(255, tr * shade + warm)
      const g = Math.min(255, tg * shade)
      const b = Math.min(255, tb * shade - warm)
      const pooled = ctx.createRadialGradient(x + s / 2, y + s / 2, s * 0.2, x + s / 2, y + s / 2, s * 0.75)
      pooled.addColorStop(0, `rgb(${r}, ${g}, ${b})`)
      pooled.addColorStop(1, `rgb(${r * 0.93}, ${g * 0.93}, ${b * 0.93})`)
      ctx.fillStyle = pooled
      ctx.fillRect(x, y, s, s)
    }
  }

  grain(ctx, rand, W, H, 0.03)
  tile = finish(canvas, true)
  return tile
}
