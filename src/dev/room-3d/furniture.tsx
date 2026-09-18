import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import {
  CubicBezierCurve3,
  LatheGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type PointLight,
} from 'three'
import { BOOK_MATERIALS, M } from './materials'
import { PALETTE } from './palette'
import { LAMP_WARMUP, useDropProgress } from './furnish-clock'

/**
 * ============================================================================
 * THE FURNITURE
 * ----------------------------------------------------------------------------
 * Every piece is built with its ORIGIN AT ITS BASE and its FRONT FACING +Z.
 * DropIn relies on the first (it squashes about the origin), and the room
 * layout in room-scene.tsx relies on the second (it turns each piece to face
 * where it should).
 *
 * MODELLED HERE, NOT DOWNLOADED — FOR NOW
 *   These are procedural stand-ins, kept deliberately in the minimal modern
 *   idiom the brief asks for: rounded upholstery, slim brass, honed stone.
 *   Each one is a self-contained component with a real-world footprint, so any
 *   of them can be swapped for a CC0 glTF (Poly Haven) without touching the
 *   layout, the animation or the lighting — replace the component body, keep
 *   the origin and the facing.
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

export function Rug() {
  return (
    <group>
      <RoundedBox args={[3, 0.012, 2.1]} radius={0.005} smoothness={2} position={[0, 0.006, 0]} material={M.rug} />
      {/* A lighter inner field, 12cm in from the edge — the border is what makes
          a flat rectangle read as a woven rug rather than a floor tile. */}
      <RoundedBox args={[2.76, 0.013, 1.86]} radius={0.005} smoothness={2} position={[0, 0.0068, 0]} material={M.rugField} />
    </group>
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
  const bowl = useMemo(
    () =>
      new LatheGeometry(
        [
          [0, 0],
          [0.06, 0.004],
          [0.11, 0.03],
          [0.13, 0.058],
          [0.124, 0.06],
          [0.104, 0.036],
          [0.058, 0.012],
          [0, 0.01],
        ].map(([x, y]) => new Vector2(x, y)),
        64,
      ),
    [],
  )

  return (
    <group>
      <mesh position={[-0.13, 0.016, 0.02]} rotation={[0, 0.22, 0]} material={BOOK_MATERIALS[0]}>
        <boxGeometry args={[0.32, 0.032, 0.24]} />
      </mesh>
      <mesh position={[-0.12, 0.046, 0.03]} rotation={[0, 0.06, 0]} material={BOOK_MATERIALS[2]}>
        <boxGeometry args={[0.27, 0.028, 0.2]} />
      </mesh>
      <mesh geometry={bowl} position={[0.2, 0, -0.08]} material={M.brass} />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Side table, and the vase on it                                             */
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

const VASE_STEMS: { lean: [number, number, number]; h: number }[] = [
  { lean: [0.18, 0, 0.1], h: 0.46 },
  { lean: [-0.14, 0, 0.16], h: 0.38 },
  { lean: [0.05, 0, -0.2], h: 0.42 },
]

export function Vase() {
  const body = useMemo(
    () =>
      new LatheGeometry(
        [
          [0, 0],
          [0.065, 0],
          [0.09, 0.05],
          [0.1, 0.12],
          [0.085, 0.2],
          [0.05, 0.26],
          [0.043, 0.3],
          [0.05, 0.312],
          [0.038, 0.312],
          [0.034, 0.28],
          [0, 0.27],
        ].map(([x, y]) => new Vector2(x, y)),
        64,
      ),
    [],
  )

  return (
    <group>
      <mesh geometry={body} material={M.ceramic} />

      {/* Three dry stems, hinged at the neck: the group turns, and the stem
          inside it is lifted by half its length because a cylinder is built
          about its own middle. */}
      {VASE_STEMS.map(({ lean, h }, i) => (
        <group key={i} position={[0, 0.27, 0]} rotation={lean}>
          <mesh position={[0, h / 2, 0]} material={M.trunk}>
            <cylinderGeometry args={[0.003, 0.004, h, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Arc floor lamp                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The lamp is the one piece that changes the LIGHTING when it lands: its bulb
 * and a warm point light come up over a moment once it is standing, rather
 * than being on while it falls. `index` is its place in the sequence, so it
 * can read its own landing.
 */
export function FloorLamp({ index }: { index: number }) {
  const progress = useDropProgress(index)
  const light = useRef<PointLight>(null)

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

  useFrame(() => {
    // 0 until the lamp has landed, then up to 1 over LAMP_WARMUP, eased so it
    // warms up rather than switching on.
    const raw = Math.min(Math.max((progress() - 1) / LAMP_WARMUP, 0), 1)
    const on = raw * raw * (3 - 2 * raw)

    M.bulb.emissiveIntensity = 7 * on
    M.shadeInner.emissiveIntensity = 0.9 * on
    if (light.current) light.current.intensity = 2.2 * on
  })

  const shadeTop = end.y - 0.2

  return (
    <group>
      <mesh position={[0, 0.0225, 0]} material={M.graphiteStone}>
        <cylinderGeometry args={[0.18, 0.19, 0.045, 64]} />
      </mesh>

      <mesh geometry={arc} material={M.brass} />

      <group position={[end.x, shadeTop, end.z]}>
        <mesh geometry={shade} material={M.shadeOuter} />
        <mesh geometry={shade} material={M.shadeInner} scale={0.985} />

        <mesh position={[0, 0.07, 0]} material={M.bulb}>
          <sphereGeometry args={[0.042, 24, 16]} />
        </mesh>

        <pointLight
          ref={light}
          position={[0, 0.03, 0]}
          color={PALETTE.lampLight}
          intensity={0}
          distance={5}
          decay={2}
        />
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Bookshelf                                                                  */
/* -------------------------------------------------------------------------- */

/** Deterministic, so the shelf is styled the same way on every load and replay. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Book = { x: number; w: number; h: number; lean: number; material: number }

const SHELF_W = 1.3
const SHELF_D = 0.34
const SHELF_H = 1.95
const SHELF_T = 0.025
const SHELF_LEVELS = [SHELF_T / 2, 0.49, 0.96, 1.44, SHELF_H - SHELF_T / 2]

/**
 * For each compartment: a run of books from the left, and an object on the
 * right — which is how a shelf is actually styled. Computed once, at module
 * load, from a fixed seed.
 */
const SHELF_ROWS = (() => {
  const rand = seeded(7)
  return SHELF_LEVELS.slice(0, -1).map((floorY, level) => {
    const clear = SHELF_LEVELS[level + 1] - floorY - SHELF_T
    const books: Book[] = []
    let x = -SHELF_W / 2 + SHELF_T + 0.04
    const runEnd = level % 2 === 0 ? 0.12 : -0.05
    while (x < runEnd) {
      const w = 0.022 + rand() * 0.03
      const h = Math.min(clear - 0.04, 0.2 + rand() * 0.13)
      books.push({ x: x + w / 2, w, h, lean: 0, material: Math.floor(rand() * BOOK_MATERIALS.length) })
      x += w + 0.003
    }
    // The last book leans on its neighbours.
    if (books.length) books[books.length - 1].lean = -0.18
    return { floorY: floorY + SHELF_T / 2, books }
  })
})()

export function Bookshelf() {
  const W = SHELF_W
  const D = SHELF_D
  const H = SHELF_H
  const T = SHELF_T
  const shelves = SHELF_LEVELS
  const rows = SHELF_ROWS

  return (
    <group>
      {/* Frame: two sides, the shelves, in off-white lacquer — see M.lacquer.
          Open back, so the wall shows through. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (W / 2 - T / 2), H / 2, 0]} material={M.lacquer}>
          <boxGeometry args={[T, H, D]} />
        </mesh>
      ))}
      {shelves.map((y) => (
        <mesh key={y} position={[0, y, 0]} material={M.lacquer}>
          <boxGeometry args={[W - 2 * T, T, D]} />
        </mesh>
      ))}

      {rows.map(({ floorY, books }, level) => (
        <group key={level} position={[0, floorY, 0.02]}>
          {books.map((book, i) => (
            <mesh
              key={i}
              position={[book.x, book.h / 2, 0]}
              rotation={[0, 0, book.lean]}
              material={BOOK_MATERIALS[book.material]}
            >
              <boxGeometry args={[book.w, book.h, 0.22]} />
            </mesh>
          ))}

          {/* One object per compartment, alternating, on the empty side. */}
          {level % 2 === 0 ? (
            <mesh position={[0.4, 0.075, 0]} material={M.brass}>
              <sphereGeometry args={[0.075, 48, 32]} />
            </mesh>
          ) : (
            <group position={[0.3, 0, 0]}>
              {[0, 1, 2].map((j) => (
                <mesh key={j} position={[0, 0.015 + j * 0.03, 0]} rotation={[0, j * 0.12, 0]} material={BOOK_MATERIALS[(j + level) % 3]}>
                  <boxGeometry args={[0.26 - j * 0.03, 0.028, 0.19]} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
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
