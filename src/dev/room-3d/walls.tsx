import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry } from 'three'
import { useWallReveal } from './furnish-clock'
import { ROOM } from './room-geometry'
import { FINISHES, PAINTED, type WallFinish } from './wall-finishes'

/**
 * ============================================================================
 * WHAT EACH ROOM DOES TO ITS WALLS
 * ----------------------------------------------------------------------------
 * The shell is the same off-white for every room; each room then finishes
 * part of it in its own way, so the four stop reading as one room with the
 * furniture swapped:
 *
 *   living room   plain — the framed print is its accent
 *   kitchen       a glazed tile backsplash between worktop and shelf
 *   bedroom       warm limewash across the wall behind the headboard
 *   office        graphite paint across the wall behind the desk
 *
 * The paint stops at the skirting and the crown moulding, which stay
 * off-white: trims left light are what make a painted wall look finished,
 * where a wall painted into its trims looks flooded.
 *
 * The materials, and the way each one follows the wall swatch, are in
 * wall-finishes.ts.
 *
 * NOT DROPPED IN — WASHED IN
 *   A finish is part of the room, not a piece of furniture, so it does not
 *   fall. It fades in over the wall while the room's first piece is falling,
 *   and out as that same piece — the last to leave — goes. See useWallReveal.
 *   Each finish is one shared material, and only one room is ever showing,
 *   so the fade is written straight to it.
 * ============================================================================
 */

/** Proud of the wall by this much — enough to never flicker against it. */
const OFFSET = 0.002

/**
 * One finished area of wall.
 *
 *   wall     which wall: the back (faces +Z) or the left (faces +X)
 *   span     where along it, in world X for the back wall, world Z for the left
 *   height   from and to, in metres off the floor; the painted field by default
 */
export function WallTreatment({
  finish,
  wall,
  span = [-ROOM.halfWidth, ROOM.halfWidth],
  height = PAINTED,
}: {
  finish: WallFinish
  wall: 'back' | 'left'
  span?: [number, number]
  height?: [number, number]
}) {
  const reveal = useWallReveal()
  const [a0, a1] = span
  const [y0, y1] = height
  const w = a1 - a0
  const h = y1 - y0

  // A repeating finish is laid out by its UVs, from the bottom-left corner,
  // so a tile sheet lands whole tiles on the worktop whatever the panel size.
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(w, h)
    const sheet = FINISHES[finish].sheet
    if (sheet) {
      const uv = plane.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / sheet.width, (uv.getY(i) * h) / sheet.height)
    }
    return plane
  }, [finish, w, h])

  useFrame(() => {
    FINISHES[finish].material.opacity = reveal()
  })

  const y = (y0 + y1) / 2
  const along = (a0 + a1) / 2
  return wall === 'back' ? (
    <mesh geometry={geometry} position={[along, y, -ROOM.halfDepth + OFFSET]} material={FINISHES[finish].material} receiveShadow />
  ) : (
    <mesh
      geometry={geometry}
      position={[-ROOM.halfWidth + OFFSET, y, along]}
      rotation={[0, Math.PI / 2, 0]}
      material={FINISHES[finish].material}
      receiveShadow
    />
  )
}
