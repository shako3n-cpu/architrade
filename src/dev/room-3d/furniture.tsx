import { useLayoutEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import {
  CubicBezierCurve3,
  Euler,
  LatheGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type InstancedMesh,
  type Material,
} from 'three'
import { useLampGlow } from './lamp-glow'
import { BOOK_MATERIALS, M, rugWool } from './materials'
import { PALETTE } from './palette'
import { RUG_SIZES, rugTexture, type RugStyle } from './rug-pattern'
import { BookRun, BookStack, BrassBowl, BrassSphere, BudVase, Jar, RingSculpture, STACKED_BOOK } from './styling'
import { seeded } from './util'

/**
 * ============================================================================
 * THE FURNITURE
 * ----------------------------------------------------------------------------
 * Every piece is built with its ORIGIN AT ITS BASE and its FRONT FACING +Z.
 * DropIn relies on the first (it squashes about the origin), and the room
 * layouts in rooms.tsx rely on the second (they turn each piece to face
 * where it should). The kitchen, bedroom and office have their own files.
 *
 * MODELLED HERE — EXCEPT THE ARMCHAIR
 *   These are procedural, kept deliberately in the minimal modern idiom the
 *   brief asks for: rounded upholstery, slim brass, honed stone. Each one is a
 *   self-contained component with a real-world footprint, so any of them can
 *   be swapped for a CC0 glTF without touching the layout, the animation or
 *   the lighting — replace the component body, keep the origin and the
 *   facing.
 *
 *   The armchair has been: the default is now Poly Haven's
 *   modern_arm_chair_01 (see polyhaven.tsx). <Armchair> below stays as the
 *   comparison it lost to, one parameter away: ?armchair=procedural. The
 *   sofa was tried the same way and stayed procedural; polyhaven.tsx says why.
 *
 * Units are metres. Dimensions follow real furniture, because a sofa that is
 * the right size is most of what makes a room read as a room.
 * ============================================================================
 */

/** Smoothness shared by every rounded box: enough segments to catch a highlight. */
const SMOOTH = 5

/* -------------------------------------------------------------------------- */
/* Rug                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Each design's wool: its ground, for the cut edge, and its sheen — tinted
 * to the wool, because a white sheen on the graphite rug, at the camera's
 * shallow angle, washed it out to a pale grey.
 */
const RUG_WOOL: Record<RugStyle, { ground: string; sheen: string }> = {
  lattice: { ground: PALETTE.rugField, sheen: '#ffffff' },
  banded: { ground: PALETTE.rugIvory, sheen: '#ffffff' },
  border: { ground: PALETTE.rugGraphite, sheen: '#5c5e63' },
}

const rugFaces = new Map<string, Material[]>()

/**
 * Box faces in three's order: +x, -x, +y, -y, +z, -z — the pattern on top,
 * which is also its bump map, and the plain ground on the cut edges. One set
 * per design and size, made on first use and shared from then on.
 */
function rugMaterials(style: RugStyle, width: number, depth: number): Material[] {
  const key = `${style}:${width}x${depth}`
  const hit = rugFaces.get(key)
  if (hit) return hit
  const { ground, sheen } = RUG_WOOL[style]
  const edge = rugWool(ground, sheen)
  const face = rugWool('#ffffff', sheen, rugTexture(style, width, depth))
  const faces = [edge, edge, face, edge, edge, edge]
  rugFaces.set(key, faces)
  return faces
}

/**
 * A wool rug — see rug-pattern.ts for the three designs. A plain box, not a
 * RoundedBox: the pattern needs the top face's UVs to run edge to edge, and
 * at 12mm thick a rounded corner is not visible anyway.
 */
export function Rug({
  style = 'lattice',
  width = RUG_SIZES[style].width,
  depth = RUG_SIZES[style].depth,
}: {
  style?: RugStyle
  width?: number
  depth?: number
}) {
  const faces = useMemo(() => rugMaterials(style, width, depth), [style, width, depth])
  return (
    <mesh position={[0, 0.006, 0]} material={faces}>
      <boxGeometry args={[width, 0.012, depth]} />
    </mesh>
  )
}

/* -------------------------------------------------------------------------- */
/* Sofa                                                                       */
/* -------------------------------------------------------------------------- */

export function Sofa() {
  const W = 2.3
  const D = 0.95
  const ARM = 0.2
  const BACK = 0.2
  const cushionW = (W - 2 * ARM - 0.02) / 2

  return (
    <group>
      {/* Recessed graphite plinth — the sofa appears to float a few centimetres
          off the rug, which is the whole trick of a modern low sofa. */}
      <mesh position={[0, 0.03, 0.01]} material={M.graphiteMatte}>
        <boxGeometry args={[W - 0.2, 0.06, D - 0.22]} />
      </mesh>

      <RoundedBox args={[W, 0.26, D]} radius={0.05} smoothness={SMOOTH} position={[0, 0.19, 0]} material={M.fabricLight} />

      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[ARM, 0.56, D]}
          radius={0.08}
          smoothness={SMOOTH}
          position={[side * (W / 2 - ARM / 2), 0.34, 0]}
          material={M.fabricLight}
        />
      ))}

      <RoundedBox
        args={[W - 0.02, 0.48, BACK]}
        radius={0.08}
        smoothness={SMOOTH}
        position={[0, 0.56, -D / 2 + BACK / 2]}
        material={M.fabricLight}
      />

      {/* Seat cushions — two, with a gap, because one long slab reads as a bench. */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[cushionW, 0.15, D - BACK - 0.03]}
          radius={0.065}
          smoothness={SMOOTH}
          position={[side * (cushionW / 2 + 0.01), 0.395, BACK / 2 + 0.01]}
          material={M.fabricLight}
        />
      ))}

      {/* Back cushions, leaned back a few degrees against the frame. */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[cushionW, 0.4, 0.17]}
          radius={0.075}
          smoothness={SMOOTH}
          position={[side * (cushionW / 2 + 0.01), 0.66, -D / 2 + BACK + 0.07]}
          rotation={[-0.14, 0, 0]}
          material={M.fabricLight}
        />
      ))}

      {/* Two throw cushions: one graphite, one sand — the only contrast on the
          sofa, so it reads as styled rather than monochrome by accident. */}
      <RoundedBox
        args={[0.44, 0.44, 0.13]}
        radius={0.06}
        smoothness={SMOOTH}
        position={[-0.72, 0.7, -0.14]}
        rotation={[-0.2, 0.18, 0.08]}
        material={M.fabricGraphite}
      />
      <RoundedBox
        args={[0.4, 0.4, 0.12]}
        radius={0.06}
        smoothness={SMOOTH}
        position={[-0.34, 0.67, -0.12]}
        rotation={[-0.22, -0.08, -0.05]}
        material={M.sand}
      />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Armchair                                                                   */
/* -------------------------------------------------------------------------- */

export function Armchair() {
  const W = 0.8
  const D = 0.82
  const LEG = 0.16

  return (
    <group>
      {/* Tapered brushed-brass legs, set in from the corners. */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * (W / 2 - 0.07), LEG / 2, z * (D / 2 - 0.07)]} material={M.brassBrushed}>
          <cylinderGeometry args={[0.017, 0.01, LEG, 16]} />
        </mesh>
      ))}

      <RoundedBox args={[W, 0.3, D]} radius={0.07} smoothness={SMOOTH} position={[0, LEG + 0.15, 0]} material={M.fabricGraphite} />

      <RoundedBox
        args={[W - 0.2, 0.11, D - 0.22]}
        radius={0.05}
        smoothness={SMOOTH}
        position={[0, LEG + 0.35, 0.08]}
        material={M.fabricGraphite}
      />

      <RoundedBox
        args={[W, 0.5, 0.18]}
        radius={0.08}
        smoothness={SMOOTH}
        position={[0, LEG + 0.52, -D / 2 + 0.1]}
        rotation={[-0.12, 0, 0]}
        material={M.fabricGraphite}
      />

      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.1, 0.2, D - 0.04]}
          radius={0.045}
          smoothness={SMOOTH}
          position={[side * (W / 2 - 0.05), LEG + 0.39, 0]}
          material={M.fabricGraphite}
        />
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Coffee table, and what sits on it                                          */
/* -------------------------------------------------------------------------- */

/** Height of the coffee table's top surface — TableStyling sits here. */
export const COFFEE_TABLE_TOP = 0.385

export function CoffeeTable() {
  const R = 0.4

  return (
    <group>
      {/* Honed graphite stone top. */}
      <mesh position={[0, COFFEE_TABLE_TOP - 0.0175, 0]} material={M.graphiteStone}>
        <cylinderGeometry args={[0.52, 0.52, 0.035, 96]} />
      </mesh>

      {/* Brass frame: a hoop on the floor, a hoop under the top, three rods. */}
      {[0.012, COFFEE_TABLE_TOP - 0.045].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.brassBrushed}>
          <torusGeometry args={[R, 0.011, 16, 96]} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6
        const h = COFFEE_TABLE_TOP - 0.035 - 0.012
        return (
          <mesh key={i} position={[Math.cos(a) * R, 0.012 + h / 2, Math.sin(a) * R]} material={M.brassBrushed}>
            <cylinderGeometry args={[0.011, 0.011, h, 12]} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Two books and a brass bowl, placed on the coffee table after it lands. */
export function TableStyling() {
  return (
    <group>
      <mesh position={[-0.13, 0.016, 0.02]} rotation={[0, 0.22, 0]} material={BOOK_MATERIALS[0]}>
        <boxGeometry args={[0.32, 0.032, 0.24]} />
      </mesh>
      <mesh position={[-0.12, 0.046, 0.03]} rotation={[0, 0.06, 0]} material={BOOK_MATERIALS[2]}>
        <boxGeometry args={[0.27, 0.028, 0.2]} />
      </mesh>
      <group position={[0.2, 0, -0.08]}>
        <BrassBowl />
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Side table (the vase on it is in styling.tsx)                              */
/* -------------------------------------------------------------------------- */

/** Height of the side table's top surface — the vase sits here. */
export const SIDE_TABLE_TOP = 0.53

export function SideTable() {
  return (
    <group>
      <mesh position={[0, 0.01, 0]} material={M.graphiteStone}>
        <cylinderGeometry args={[0.19, 0.2, 0.02, 64]} />
      </mesh>
      <mesh position={[0, 0.02 + 0.24, 0]} material={M.brassBrushed}>
        <cylinderGeometry args={[0.03, 0.03, 0.48, 24]} />
      </mesh>
      <mesh position={[0, SIDE_TABLE_TOP - 0.015, 0]} material={M.graphiteStone}>
        <cylinderGeometry args={[0.25, 0.25, 0.03, 64]} />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Arc floor lamp                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The lamp is the piece that changes the LIGHTING when it lands: its bulb and
 * a warm point light come up over a moment once it is standing, rather than
 * being on while it falls — see lamp-glow.ts, shared by every lamp.
 */
export function FloorLamp() {
  const { glow, anchor } = useLampGlow({ bulb: 7, shade: 0.9, light: 2.2, distance: 5 })

  // The arc: up from the base, over, and down to where the shade hangs.
  const end = useMemo(() => new Vector3(0.95, 1.98, 0.86), [])
  const arc = useMemo(
    () =>
      new TubeGeometry(
        new CubicBezierCurve3(
          new Vector3(0, 0.045, 0),
          new Vector3(0, 2.15, 0),
          new Vector3(0.42, 2.4, 0.38),
          end,
        ),
        128,
        0.012,
        12,
      ),
    [end],
  )

  // A shallow dome, open underneath. Both the outer skin and the glowing inner
  // skin use this one geometry — see M.shadeOuter / M.shadeInner.
  const shade = useMemo(
    () =>
      new LatheGeometry(
        [
          [0.012, 0.2],
          [0.09, 0.185],
          [0.16, 0.13],
          [0.195, 0.05],
          [0.205, 0],
        ].map(([x, y]) => new Vector2(x, y)),
        64,
      ),
    [],
  )

  const shadeTop = end.y - 0.2

  return (
    <group>
      <mesh position={[0, 0.0225, 0]} material={M.graphiteStone}>
        <cylinderGeometry args={[0.18, 0.19, 0.045, 64]} />
      </mesh>

      <mesh geometry={arc} material={M.brass} />

      <group position={[end.x, shadeTop, end.z]}>
        <mesh geometry={shade} material={M.shadeOuter} />
        <mesh geometry={shade} material={glow.shadeInner} scale={0.985} />

        <mesh position={[0, 0.07, 0]} material={glow.bulb}>
          <sphereGeometry args={[0.042, 24, 16]} />
        </mesh>

        {/* Where the lamp's borrowed light sits — see lamp-light-pool.ts. */}
        <group ref={anchor} position={[0, 0.03, 0]} />
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Bookshelf                                                                  */
/* -------------------------------------------------------------------------- */

const SHELF_W = 1.3
const SHELF_D = 0.34
const SHELF_H = 1.95
const SHELF_T = 0.025
const SHELF_LEVELS = [SHELF_T / 2, 0.49, 0.96, 1.44, SHELF_H - SHELF_T / 2]

/** The top face of each shelf a compartment stands on, bottom first. */
const SHELF_FLOORS = SHELF_LEVELS.slice(0, -1).map((y) => y + SHELF_T / 2)

/**
 * The bookcase, styled. Every compartment is composed on its own, the way a
 * shelf is actually dressed: a run of books, and one thing that is not a
 * book — a stack with a sphere on it, a jar, a vase on a stack, a sculpture —
 * alternating sides so the eye zigzags up the case. Two more things on top.
 * Every book is inside the palette: off-white, sand, taupe, graphite, one
 * muted tan. The first version had short runs and a single object per shelf,
 * and from across the room its upper shelves read as empty.
 *
 * Open back, so the wall shows through; off-white lacquer — see M.lacquer.
 */
export function Bookshelf() {
  const W = SHELF_W
  const D = SHELF_D
  const H = SHELF_H
  const T = SHELF_T
  const [floor0, floor1, floor2, floor3] = SHELF_FLOORS

  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (W / 2 - T / 2), H / 2, 0]} material={M.lacquer}>
          <boxGeometry args={[T, H, D]} />
        </mesh>
      ))}
      {SHELF_LEVELS.map((y) => (
        <mesh key={y} position={[0, y, 0]} material={M.lacquer}>
          <boxGeometry args={[W - 2 * T, T, D]} />
        </mesh>
      ))}

      {/* Bottom: the tall books, and a low stack with a brass sphere on it. */}
      <group position={[0, floor0, 0.02]}>
        <BookRun from={-0.6} to={0.16} seed={7} minHeight={0.27} maxHeight={0.36} />
        <group position={[0.42, 0, 0]}>
          <BookStack count={3} seed={3} />
          <group position={[0, 3 * STACKED_BOOK, 0]}>
            <BrassSphere radius={0.055} />
          </group>
        </group>
      </group>

      {/* Second: a lidded jar, then books leaning in towards it. */}
      <group position={[0, floor1, 0.02]}>
        <group position={[-0.47, 0, 0]}>
          <Jar scale={0.9} />
        </group>
        <BookRun from={-0.3} to={0.58} seed={8} minHeight={0.22} maxHeight={0.33} lean="start" />
      </group>

      {/* Third: a graphite bud vase on a stack of four, and a short run. */}
      <group position={[0, floor2, 0.02]}>
        <group position={[-0.4, 0, 0]}>
          <BookStack count={4} seed={5} width={0.26} />
          <group position={[0, 4 * STACKED_BOOK, 0]}>
            <BudVase tone="graphite" />
          </group>
        </group>
        <BookRun from={-0.12} to={0.56} seed={9} minHeight={0.24} maxHeight={0.34} lean="start" />
      </group>

      {/* Top compartment: a run from the left, the ring sculpture on the right. */}
      <group position={[0, floor3, 0.02]}>
        <BookRun from={-0.6} to={0.04} seed={10} minHeight={0.24} maxHeight={0.35} />
        <group position={[0.36, 0, 0]}>
          <RingSculpture />
        </group>
      </group>

      {/* On top of the case: two large books lying flat, and a ceramic bud vase. */}
      <group position={[0, H, 0]}>
        <group position={[-0.3, 0, 0]}>
          <BookStack count={2} seed={12} width={0.32} depth={0.24} />
        </group>
        <group position={[0.34, 0, 0]}>
          <BudVase />
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Plant                                                                      */
/* -------------------------------------------------------------------------- */

export function Plant() {
  const pot = useMemo(
    () =>
      new LatheGeometry(
        [
          [0, 0],
          [0.15, 0],
          [0.17, 0.02],
          [0.2, 0.42],
          [0.21, 0.44],
          [0.196, 0.44],
          [0.187, 0.4],
          [0, 0.4],
        ].map(([x, y]) => new Vector2(x, y)),
        64,
      ),
    [],
  )

  const trunk = useMemo(
    () =>
      new TubeGeometry(
        new CubicBezierCurve3(
          new Vector3(0, 0.4, 0),
          new Vector3(0.04, 0.9, 0.02),
          new Vector3(-0.05, 1.25, -0.01),
          new Vector3(0.01, 1.62, 0),
        ),
        48,
        0.018,
        8,
      ),
    [],
  )

  // One leaf shape, instanced by transform: a flattened sphere reads as a
  // broad leaf at this distance and costs one geometry for all of them.
  const leafGeometry = useMemo(() => new SphereGeometry(1, 20, 10), [])

  const leaves = useMemo(() => {
    const rand = seeded(3)
    const count = 30
    return Array.from({ length: count }, (_, i) => {
      const u = i / (count - 1)
      const y = 0.72 + u * 0.95
      // Widest through the middle of the crown, tapering at top and bottom.
      const reach = 0.09 + 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.15))
      const size = 0.8 + rand() * 0.45
      return {
        y,
        angle: i * 2.39996 + rand() * 0.3, // golden angle
        reach,
        size,
        tilt: 0.25 + rand() * 0.45,
      }
    })
  }, [])

  return (
    <group>
      <mesh geometry={pot} material={M.graphiteMatte} />
      <mesh position={[0, 0.395, 0]} material={M.soil}>
        <cylinderGeometry args={[0.186, 0.186, 0.01, 48]} />
      </mesh>
      <mesh geometry={trunk} material={M.trunk} />

      {leaves.map((leaf, i) => (
        <group key={i} position={[0, leaf.y, 0]} rotation={[0, leaf.angle, 0]}>
          <mesh
            geometry={leafGeometry}
            position={[leaf.reach, 0, 0]}
            rotation={[0, 0, leaf.tilt]}
            scale={[0.14 * leaf.size, 0.011, 0.085 * leaf.size]}
            material={M.leaf}
          />
        </group>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Olive tree                                                                 */
/* -------------------------------------------------------------------------- */

/** Where the olive's three stems end, and so where its three clouds of leaves are. */
const OLIVE_CROWNS: { tip: [number, number, number]; bend: [number, number, number]; radius: number }[] = [
  { tip: [-0.15, 1.55, 0.05], bend: [-0.05, 1.0, 0.0], radius: 0.36 },
  { tip: [0.17, 1.72, -0.06], bend: [0.06, 1.1, -0.02], radius: 0.38 },
  { tip: [0.03, 1.32, 0.17], bend: [0.0, 0.9, 0.06], radius: 0.3 },
]

const OLIVE_POT = [
  [0, 0],
  [0.19, 0],
  [0.2, 0.02],
  [0.23, 0.5],
  [0.24, 0.52],
  [0.225, 0.52],
  [0.215, 0.48],
  [0, 0.48],
] as const

/**
 * A slender olive tree in a tall off-white planter, 1.9m to the top of its
 * crown: three thin stems rising out of one trunk, each ending in a loose
 * cloud of small silvery leaves. The office's plant, and deliberately not
 * the living room's fig — a different silhouette (airy, not broad-leaved)
 * and a different green.
 *
 * The leaves — 360 of them — are ONE instanced mesh, one draw call:
 * drawn as separate meshes they would have outnumbered everything else in
 * the room put together.
 */
export function OliveTree() {
  const pot = useMemo(() => new LatheGeometry(OLIVE_POT.map(([x, y]) => new Vector2(x, y)), 64), [])
  const stems = useMemo(
    () =>
      OLIVE_CROWNS.map(
        ({ tip, bend }) =>
          new TubeGeometry(
            new CubicBezierCurve3(
              new Vector3(0, 0.47, 0),
              new Vector3(0, 0.75, 0),
              new Vector3(...bend),
              new Vector3(...tip),
            ),
            24,
            0.014,
            6,
          ),
      ),
    [],
  )
  const leaf = useMemo(() => new SphereGeometry(1, 10, 6), [])

  const leaves = useMemo(() => {
    const rand = seeded(19)
    const matrices: Matrix4[] = []
    const q = new Quaternion()
    const e = new Euler()
    for (const { tip, radius } of OLIVE_CROWNS) {
      for (let i = 0; i < 120; i++) {
        // A point in a flattened ellipsoid round the stem's tip, denser in the middle.
        const u = rand() * Math.PI * 2
        const v = Math.acos(2 * rand() - 1)
        const r = radius * Math.cbrt(rand())
        const p = new Vector3(
          tip[0] + r * Math.sin(v) * Math.cos(u),
          tip[1] + r * 0.62 * Math.cos(v),
          tip[2] + r * Math.sin(v) * Math.sin(u),
        )
        e.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI)
        q.setFromEuler(e)
        const s = 0.75 + rand() * 0.5
        matrices.push(new Matrix4().compose(p, q, new Vector3(0.058 * s, 0.004, 0.017 * s)))
      }
    }
    return matrices
  }, [])

  const instanced = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = instanced.current
    if (!mesh) return
    leaves.forEach((matrix, i) => mesh.setMatrixAt(i, matrix))
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [leaves])

  return (
    <group>
      <mesh geometry={pot} material={M.ceramic} />
      <mesh position={[0, 0.475, 0]} material={M.soil}>
        <cylinderGeometry args={[0.214, 0.214, 0.008, 48]} />
      </mesh>
      {stems.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={M.trunk} />
      ))}
      <instancedMesh ref={instanced} args={[leaf, M.oliveLeaf, leaves.length]} />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Print on the wall                                                          */
/* -------------------------------------------------------------------------- */

/** Origin at the bottom centre of the frame, on the wall's surface. */
export function WallArt() {
  const W = 1.1
  const H = 0.78

  return (
    <group>
      <mesh position={[0, H / 2, 0.0175]} material={M.graphiteMatte}>
        <boxGeometry args={[W, H, 0.035]} />
      </mesh>
      <mesh position={[0, H / 2, 0.0355]} material={M.print}>
        <planeGeometry args={[W - 0.08, H - 0.08]} />
      </mesh>

      {/* The print itself: a brass sun over a graphite horizon. */}
      <mesh position={[-0.1, H / 2 + 0.06, 0.037]} material={M.brass}>
        <circleGeometry args={[0.14, 64]} />
      </mesh>
      <mesh position={[0, H / 2 - 0.16, 0.037]} material={M.graphiteMatte}>
        <planeGeometry args={[W - 0.3, 0.012]} />
      </mesh>
      <mesh position={[0.22, H / 2 - 0.07, 0.037]} material={M.sand}>
        <planeGeometry args={[0.16, 0.19]} />
      </mesh>
    </group>
  )
}
