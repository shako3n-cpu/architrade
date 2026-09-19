import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MeshBasicMaterial, type Group } from 'three'
import { piecePose, type PieceClock } from './furnish-clock'

/**
 * ============================================================================
 * CONTACT SHADOWS
 * ----------------------------------------------------------------------------
 * The key light sits front-right — the same side as the camera — so every
 * real shadow it casts falls BEHIND the furniture, out of sight. From where
 * the room is seen nothing darkened the floor under a sofa or round a table's
 * feet, and raised pieces (the sideboard on its hairpins, the desk, the
 * stools) read as set down on the floor rather than standing on it.
 *
 * So each floor-standing piece gets a soft pool of shade under its
 * footprint: the ambient occlusion a product photograph has, drawn rather
 * than computed. A footprint is a rectangle or a circle, in the piece's own
 * axes; the shade is solid under it and fades out over BLUR metres beyond.
 *
 * IT FALLS WITH THE PIECE
 *   Read from the same clock and the same dropPose as the piece: while it
 *   is high the shade is wide and faint, and it tightens and darkens as the
 *   piece comes down, the way a real shadow does. It turns with the piece's
 *   spin, and goes as the piece leaves.
 * ============================================================================
 */

/** How far the shade fades out beyond a footprint, in metres. */
export const BLUR = 0.2

/** A rug's top, for a piece standing on one: rugs are 12mm thick. */
export const ON_RUG = 0.012

/** Tucked in under the edge, so the solid part never shows past the piece. */
const INSET = 0.04

export type Footprint = {
  /** Width and depth, metres, in the piece's own axes. */
  size: [number, number]
  /** Centre, in the piece's own x/z. */
  at?: [number, number]
  round?: boolean
}

const textures = new Map<string, CanvasTexture>()

/**
 * The shade for one footprint, as an alpha map: solid over the footprint
 * less INSET, falling off over BLUR metres. Drawn per size and shape, so the
 * fall-off is the same in metres on a four-metre kitchen as on a stool.
 */
export function shadeTexture(w: number, d: number, round: boolean): CanvasTexture {
  const key = `${w}x${d}:${round}`
  const hit = textures.get(key)
  if (hit) return hit

  const W = 128
  const H = Math.max(16, Math.round((W * (d + 2 * BLUR)) / (w + 2 * BLUR)))
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(W, H)
  const hw = w / 2 - INSET
  const hd = d / 2 - INSET
  const radius = Math.min(w, d) / 2 - INSET

  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const x = ((i + 0.5) / W - 0.5) * (w + 2 * BLUR)
      const z = ((j + 0.5) / H - 0.5) * (d + 2 * BLUR)
      const outside = round
        ? Math.max(0, Math.hypot(x, z) - radius)
        : Math.hypot(Math.max(0, Math.abs(x) - hw), Math.max(0, Math.abs(z) - hd))
      const t = Math.min(outside / (BLUR + INSET), 1)
      const a = Math.round(255 * (1 - t) ** 1.5)
      const k = (j * W + i) * 4
      image.data[k] = image.data[k + 1] = image.data[k + 2] = a
      image.data[k + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)

  const texture = new CanvasTexture(canvas)
  textures.set(key, texture)
  return texture
}

/**
 * Drives one piece's shade from its clock. Returns the group to put the
 * shade meshes in, and one material per footprint — each has its own alpha
 * map — all faded together.
 */
export function useContactShade({
  clock,
  footprints,
  height,
  spin,
  rotationY,
  strength,
}: {
  clock: PieceClock
  footprints: Footprint[]
  height: number
  spin: number
  rotationY: number
  /** Opacity at rest. */
  strength: number
}) {
  const group = useRef<Group>(null)
  const materials = useMemo(
    () =>
      footprints.map(
        ({ size: [w, d], round = false }) =>
          new MeshBasicMaterial({
            color: '#27231f',
            alphaMap: shadeTexture(w, d, round),
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
      ),
    // A piece's footprints are constants at its call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  // Not disposed on unmount — see useLampGlow in lamp-glow.ts for why.

  useFrame(() => {
    const g = group.current
    if (!g) return
    const pose = piecePose(clock, height, spin)
    // 0 at rest, 1 at the top of the fall.
    const lift = pose.lift
    const opacity = pose.hidden ? 0 : strength * (1 - lift) ** 2 * pose.presence
    for (const m of materials) m.opacity = opacity
    const spread = 1 + 0.9 * lift
    g.scale.set(spread, 1, spread)
    g.rotation.set(0, rotationY + pose.yaw, 0)
  })

  return { group, materials }
}
