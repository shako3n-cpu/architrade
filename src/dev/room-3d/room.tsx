import { M } from './materials'

/**
 * ============================================================================
 * THE EMPTY ROOM
 * ----------------------------------------------------------------------------
 * A corner, cut away like an architect's model: a floor slab and two walls
 * with a visible thickness, standing on nothing, against the page's own
 * off-white. Showing the cut edge is deliberate — it tells the eye "this is a
 * model of a room" in the first frame, before anything has been put in it,
 * which is what lets an EMPTY room open the page without looking unfinished.
 *
 *   floor     x -3 .. 3,  z -2.5 .. 2.5, top face at y = 0
 *   back wall inner face at z = -2.5
 *   left wall inner face at x = -3
 *
 * The walls receive shadow but do not cast it: the key light comes from the
 * front right, so a wall's own shadow would only fall outside the room — or,
 * at the corner, across the floor as a hard wedge that no real room has.
 * ============================================================================
 */

const ROOM = {
  halfWidth: 3,
  halfDepth: 2.5,
  wallHeight: 2.8,
  wallThickness: 0.14,
  slabThickness: 0.14,
} as const

const SKIRTING_H = 0.09
const SKIRTING_T = 0.016

export function Room() {
  const { halfWidth: X, halfDepth: Z, wallHeight: H, wallThickness: T, slabThickness: S } = ROOM

  return (
    <group>
      {/* Slab, extended under both walls so the corner is solid all the way down. */}
      <mesh position={[-T / 2, -S / 2, -T / 2]} material={M.floor} receiveShadow>
        <boxGeometry args={[2 * X + T, S, 2 * Z + T]} />
      </mesh>

      {/* Back wall — runs past the corner by its own thickness to close the joint. */}
      <mesh position={[-T / 2, H / 2, -Z - T / 2]} material={M.wall} receiveShadow>
        <boxGeometry args={[2 * X + T, H, T]} />
      </mesh>

      {/* Left wall. */}
      <mesh position={[-X - T / 2, H / 2, 0]} material={M.wall} receiveShadow>
        <boxGeometry args={[T, H, 2 * Z]} />
      </mesh>

      {/* Skirting on both walls. Off-white, a shade brighter than the wall: it
          is read by the shadow line along its top edge, not by its colour. */}
      <mesh position={[0, SKIRTING_H / 2, -Z + SKIRTING_T / 2]} material={M.skirting} castShadow receiveShadow>
        <boxGeometry args={[2 * X, SKIRTING_H, SKIRTING_T]} />
      </mesh>
      <mesh position={[-X + SKIRTING_T / 2, SKIRTING_H / 2, 0]} material={M.skirting} castShadow receiveShadow>
        <boxGeometry args={[SKIRTING_T, SKIRTING_H, 2 * Z]} />
      </mesh>
    </group>
  )
}
