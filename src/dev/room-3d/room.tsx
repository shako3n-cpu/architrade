import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Vector2 } from 'three'
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
 * The same shell serves every room preset; only what is put in it changes.
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

/*
 * THE FLOOR — Poly Haven "wood_floor" (CC0), 1k: colour, OpenGL normal, and
 * the packed AO/roughness/metal map. Local files, fetched only by this dev
 * module; see polyhaven.tsx for why they live in src/dev and not in public/.
 */
const FLOOR_MAPS = [
  new URL('./textures/wood_floor/wood_floor_diff_1k.jpg', import.meta.url).href,
  new URL('./textures/wood_floor/wood_floor_nor_gl_1k.jpg', import.meta.url).href,
  new URL('./textures/wood_floor/wood_floor_arm_1k.jpg', import.meta.url).href,
]

/** One repeat of the texture covers this many metres — Poly Haven's own figure. */
const FLOOR_REPEAT_M = 1.7

/**
 * The timber floor, sized so a plank is a real plank's width. Loaded through
 * Suspense, so the room is never seen with a flat floor that then changes.
 */
function useWoodFloor(width: number, depth: number) {
  const loaded = useTexture(FLOOR_MAPS)

  return useMemo(() => {
    // Clones, configured here: the loader's cached originals are left as
    // they came. A clone shares its image, so nothing is decoded twice.
    const [map, normalMap, arm] = loaded.map((original) => {
      const texture = original.clone()
      texture.wrapS = texture.wrapT = RepeatWrapping
      texture.repeat.set(width / FLOOR_REPEAT_M, depth / FLOOR_REPEAT_M)
      // The floor is seen at a raking angle; without anisotropic filtering the
      // planks blur to a smear a metre into the room.
      texture.anisotropy = 8
      return texture
    })
    map.colorSpace = SRGBColorSpace

    return new MeshStandardMaterial({
      map,
      normalMap,
      normalScale: new Vector2(0.7, 0.7),
      // The packed map: R is ambient occlusion, G is roughness. The factor
      // sits under 1 so the finish is a satin oil, not a bare board — enough
      // for the key light to lay a soft sheen across the room.
      roughnessMap: arm,
      roughness: 0.85,
      aoMap: arm,
      aoMapIntensity: 0.6,
      metalness: 0,
    })
  }, [loaded, width, depth])
}

export function Room() {
  const { halfWidth: X, halfDepth: Z, wallHeight: H, wallThickness: T, slabThickness: S } = ROOM
  const wood = useWoodFloor(2 * X + T, 2 * Z + T)

  // Box faces in three's order: +x, -x, +y, -y, +z, -z. Timber on top only;
  // the cut edges stay the slab's greige, which is what makes the timber read
  // as a finish laid on a structure rather than as a solid block of wood.
  const slabFaces = useMemo(() => [M.slab, M.slab, wood, M.slab, M.slab, M.slab], [wood])

  return (
    <group>
      {/* Slab, extended under both walls so the corner is solid all the way down. */}
      <mesh position={[-T / 2, -S / 2, -T / 2]} material={slabFaces} receiveShadow>
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
