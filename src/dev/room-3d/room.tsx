import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, TextureLoader, Vector2 } from 'three'
import { FLOOR_GRADE } from './finishes'
import { M } from './materials'
import { COVE, WASH } from './lighting'
import { CEILING, CROWN, CROWN_HEIGHT, ROOM, SKIRTING } from './room-geometry'

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
 *   left wall inner face at x = -3       (all in room-geometry.ts)
 *
 * The same shell serves every room preset; only what is put in it changes.
 * What each room does to its walls is in walls.tsx.
 *
 * THE CEILING IS CUT BACK, LIKE THE WALLS
 *   The camera sits about six metres up, looking down into a room whose
 *   ceiling is at 2.8 — a whole ceiling would be a lid over everything. So it
 *   is drawn the way an architect's section model draws it: a slab along the
 *   two walls, cut 34cm into the room, its cut edge showing its thickness as
 *   the floor slab's does. With a crown moulding under it and the skirting at
 *   the foot, each wall is finished top and bottom, and the model reads as a
 *   room with its ceiling cut away rather than as an open-topped box.
 *
 * The walls receive shadow but do not cast it: the key light comes from the
 * front right, so a wall's own shadow would only fall outside the room — or,
 * at the corner, across the floor as a hard wedge that no real room has.
 * ============================================================================
 */

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

/** How far down the wall the evening cove's wash reaches. */
const WASH_H = 1.25

/** One repeat of the texture covers this many metres — Poly Haven's own figure. */
const FLOOR_REPEAT_M = 1.7

/**
 * Oak before its photograph arrives — the average tone of the boards, so the
 * floor that shows in the first frame is the same floor, in less detail.
 */
const FLOOR_BASE = '#6d4b30'

/**
 * The timber floor, sized so a plank is a real plank's width.
 *
 * THE BOARDS ARRIVE AFTER THE ROOM, NOT BEFORE IT
 *   This used to load through Suspense — `useTexture` — so that the floor was
 *   never seen flat and then detailed. What that actually did was suspend the
 *   WHOLE scene: the shell, the lights, the furniture, everything inside the
 *   boundary in room-scene.tsx waited on three JPEGs worth 1.6MB. On a fast
 *   connection nobody saw it. Served from a CDN over a real one, the canvas
 *   sat blank for the best part of a minute — with every asset a 200 and not
 *   an error anywhere — until the floor finally landed. Measured on the live
 *   preview at Fast 3G: the room could not draw until 55s, because the last
 *   floor texture did not finish before then.
 *
 *   So the material is made at once in the boards' own average tone, and the
 *   maps are attached when they arrive. The room draws as soon as its code
 *   has; the grain fades up a few seconds later, on a floor that was already
 *   the right colour.
 */
function useWoodFloor(width: number, depth: number) {
  const floor = useMemo(() => {
    const floor = new MeshStandardMaterial({
      color: FLOOR_BASE,
      normalScale: new Vector2(0.7, 0.7),
      // The packed map: R is ambient occlusion, G is roughness. The factor
      // sits under 1 so the finish is a satin oil, not a bare board — enough
      // for the key light to lay a soft sheen across the room.
      roughness: 0.85,
      aoMapIntensity: 0.6,
      metalness: 0,
    })

    /*
     * The floor switch: a grade on the texture's colour, in linear space —
     * saturation round its luminance, then a multiply and an add — so one set
     * of oak boards can be limed, walnut or ebonised, and faded between. The
     * uniforms are shared with <Finishes>, which drives them. See finishes.ts.
     */
    floor.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, FLOOR_GRADE)
      shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', 'uniform vec3 uFloorMul;\nuniform vec3 uFloorAdd;\nuniform float uFloorSat;\nvoid main() {')
        .replace(
          '#include <map_fragment>',
          [
            '#include <map_fragment>',
            'float floorLum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));',
            'diffuseColor.rgb = mix(vec3(floorLum), diffuseColor.rgb, uFloorSat) * uFloorMul + uFloorAdd;',
          ].join('\n'),
        )
    }
    return floor
  }, [])

  /*
   * The boards themselves, fetched without blocking anything. Attached when
   * they land — which recompiles this one material, the same compile that
   * used to happen before the first frame instead of after it.
   */
  useEffect(() => {
    let live = true
    const loader = new TextureLoader()
    Promise.all(FLOOR_MAPS.map((url) => loader.loadAsync(url)))
      .then(([map, normalMap, arm]) => {
        if (!live) {
          for (const texture of [map, normalMap, arm]) texture.dispose()
          return
        }
        for (const texture of [map, normalMap, arm]) {
          texture.wrapS = texture.wrapT = RepeatWrapping
          texture.repeat.set(width / FLOOR_REPEAT_M, depth / FLOOR_REPEAT_M)
          // The floor is seen at a raking angle; without anisotropic filtering
          // the planks blur to a smear a metre into the room.
          texture.anisotropy = 8
        }
        map.colorSpace = SRGBColorSpace
        floor.map = map
        floor.normalMap = normalMap
        // The packed map: R is ambient occlusion, G is roughness. The factor
        // sits under 1 so the finish is a satin oil, not a bare board — enough
        // for the key light to lay a soft sheen across the room.
        floor.roughnessMap = arm
        floor.aoMap = arm
        // The photograph carries the colour from here on.
        floor.color.set('#ffffff')
        floor.needsUpdate = true
      })
      .catch(() => {
        // No boards: the floor stays the flat tone, which is a floor.
      })
    return () => {
      live = false
    }
  }, [floor, width, depth])

  return floor
}

export function Room() {
  const { halfWidth: X, halfDepth: Z, wallHeight: H, wallThickness: T, slabThickness: S } = ROOM
  const C = CEILING
  /** The cove line: just under the crown moulding. */
  const coveY = H - CROWN_HEIGHT - 0.008
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
      <mesh position={[0, SKIRTING.height / 2, -Z + SKIRTING.depth / 2]} material={M.skirting} castShadow receiveShadow>
        <boxGeometry args={[2 * X, SKIRTING.height, SKIRTING.depth]} />
      </mesh>
      <mesh position={[-X + SKIRTING.depth / 2, SKIRTING.height / 2, 0]} material={M.skirting} castShadow receiveShadow>
        <boxGeometry args={[SKIRTING.depth, SKIRTING.height, 2 * Z]} />
      </mesh>

      {/* Crown moulding on both walls: a flat band, and a deeper step above
          it tucked under the ceiling. Seen from above, most of it is behind
          the ceiling's edge; what shows is its bottom line and the shadow it
          throws, which is all a crown line needs to be. */}
      {(
        [
          [CROWN.band, CROWN.bandDepth, H - CROWN.step - CROWN.band / 2],
          [CROWN.step, CROWN.stepDepth, H - CROWN.step / 2],
        ] as const
      ).map(([height, depth, y]) => (
        <group key={y}>
          <mesh position={[0, y, -Z + depth / 2]} material={M.skirting} receiveShadow>
            <boxGeometry args={[2 * X, height, depth]} />
          </mesh>
          <mesh position={[-X + depth / 2, y, 0]} material={M.skirting} receiveShadow>
            <boxGeometry args={[depth, height, 2 * Z]} />
          </mesh>
        </group>
      ))}

      {/* The ceiling, cut back: an L of slab over both walls, flush with their
          outer faces, a shade lighter than the walls as a ceiling is. It
          casts NO shadow: the key light is high, and the slab's shadow fell
          as a hard grey band down the top forty centimetres of both walls —
          a stain, not a ceiling. Ambient occlusion gives the corner under it
          the soft shade a real ceiling line has. */}
      <mesh position={[-T / 2, H + C.thickness / 2, -Z + (C.depth - T) / 2]} material={M.ceiling} receiveShadow>
        <boxGeometry args={[2 * X + T, C.thickness, C.depth + T]} />
      </mesh>
      <mesh position={[-X + (C.depth - T) / 2, H + C.thickness / 2, C.depth / 2]} material={M.ceiling} receiveShadow>
        <boxGeometry args={[C.depth + T, C.thickness, 2 * Z - C.depth]} />
      </mesh>

      {/* The evening's cove light — see lighting.ts: a warm emissive line
          under the crown moulding, and its wash down the upper wall. Dark
          and transparent in the day; always there, so turning it on changes
          no shader. */}
      <mesh position={[0, coveY, -Z + 0.012]} material={COVE}>
        <boxGeometry args={[2 * X, 0.012, 0.012]} />
      </mesh>
      <mesh position={[-X + 0.012, coveY, 0]} material={COVE}>
        <boxGeometry args={[0.012, 0.012, 2 * Z]} />
      </mesh>
      <mesh position={[0, coveY - WASH_H / 2, -Z + 0.004]} material={WASH}>
        <planeGeometry args={[2 * X, WASH_H]} />
      </mesh>
      <mesh position={[-X + 0.004, coveY - WASH_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={WASH}>
        <planeGeometry args={[2 * Z, WASH_H]} />
      </mesh>
    </group>
  )
}
