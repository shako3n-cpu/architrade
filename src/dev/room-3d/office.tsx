import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useLampGlow } from './lamp-glow'
import { BOOK_MATERIALS, M } from './materials'
import { PolyHavenShelving } from './polyhaven'
import { Rod } from './shapes'
import { Mug, Papers, SmallPlant } from './styling'
import { seeded, useLathe } from './util'

/**
 * ============================================================================
 * THE OFFICE
 * ----------------------------------------------------------------------------
 * Four pieces: a writing desk standing out in the room, facing into it; a
 * swivel chair behind it; a brass desk lamp; a shelving unit on the left wall. The
 * shelving is Poly Haven's (see polyhaven.tsx); the rest is modelled here —
 * Poly Haven's desks are school and workshop desks, its task chair a plastic
 * school chair, its desk lamp an orange architect's lamp on a clamp.
 *
 * Same conventions as furniture.tsx: origin at the base, centred on the
 * footprint, front facing +Z — for the desk, +Z is where you sit.
 *
 * THE LOOK
 *   Off-white lacquer top on a graphite frame, as the kitchen's run is
 *   lacquer on graphite, against the graphite accent wall (walls.tsx); an
 *   off-white chair on a polished brass star base; the lamp brass, with a
 *   graphite shade that glows inside once it has landed.
 * ============================================================================
 */

const SMOOTH = 5

/* -------------------------------------------------------------------------- */
/* The desk                                                                   */
/* -------------------------------------------------------------------------- */

/** Height of the desk's writing surface — the lamp stands on it. */
export const DESK_TOP = 0.75

const DESK_W = 1.6
const DESK_D = 0.75
/** The desk mat's thickness — what the laptop and the papers sit on. */
const MAT = 0.004

/**
 * A writing desk, 1.6 x 0.75 m: a lacquer top over a slim graphite apron with a
 * drawer, on four tapered graphite legs shod in brass. An open laptop, a few
 * loose papers with a pen, a mug and a small plant arrive on it — the lamp
 * is its own piece, and lands after.
 */
export function Desk() {

  const legs: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]

  return (
    <group>
      {legs.map(([sx, sz]) => (
        <group key={`${sx}${sz}`}>
          <Rod
            from={[sx * (DESK_W / 2 - 0.08), 0.05, sz * (DESK_D / 2 - 0.07)]}
            to={[sx * (DESK_W / 2 - 0.07), DESK_TOP - 0.1, sz * (DESK_D / 2 - 0.06)]}
            radius={0.016}
            radiusTo={0.022}
            material={M.graphiteMatte}
          />
          {/* Brass sabot. */}
          <mesh position={[sx * (DESK_W / 2 - 0.08), 0.025, sz * (DESK_D / 2 - 0.07)]} material={M.brassBrushed}>
            <cylinderGeometry args={[0.0165, 0.015, 0.05, 16]} />
          </mesh>
        </group>
      ))}

      {/* Apron, with a drawer and its pull on the sitting side. */}
      <mesh position={[0, DESK_TOP - 0.03 - 0.04, 0]} material={M.graphiteMatte}>
        <boxGeometry args={[DESK_W - 0.1, 0.08, DESK_D - 0.08]} />
      </mesh>
      <mesh position={[0, DESK_TOP - 0.07, DESK_D / 2 - 0.035]} rotation={[0, 0, Math.PI / 2]} material={M.brassBrushed}>
        <cylinderGeometry args={[0.005, 0.005, 0.2, 12]} />
      </mesh>

      <RoundedBox
        args={[DESK_W, 0.03, DESK_D]}
        radius={0.008}
        smoothness={2}
        position={[0, DESK_TOP - 0.015, 0]}
        material={M.lacquer}
      />

      {/* On it. */}
      <group position={[0, DESK_TOP, 0]}>
        {/* A graphite leather desk mat under the laptop and the papers: white
            paper on the off-white lacquer simply disappeared. */}
        <mesh position={[0.06, MAT / 2, 0.07]} material={M.graphiteMatte}>
          <boxGeometry args={[0.82, MAT, 0.4]} />
        </mesh>

        {/* The laptop, open to about 105 degrees, facing the chair. */}
        <group position={[-0.12, MAT, 0.04]} rotation={[0, 0.08, 0]}>
          <mesh position={[0, 0.007, 0]} material={M.graphiteMatte}>
            <boxGeometry args={[0.32, 0.014, 0.22]} />
          </mesh>
          <group position={[0, 0.014, -0.11]} rotation={[-0.26, 0, 0]}>
            <mesh position={[0, 0.105, 0]} material={M.graphiteMatte}>
              <boxGeometry args={[0.32, 0.21, 0.007]} />
            </mesh>
            <mesh position={[0, 0.105, 0.0036]} material={M.blackGlass}>
              <planeGeometry args={[0.3, 0.19]} />
            </mesh>
          </group>
        </group>

        {/* Papers to the laptop's right, a mug beyond them, and a pilea in the
            back corner the lamp does not take. */}
        <group position={[0.28, MAT, 0.1]} rotation={[0, -0.18, 0]}>
          <Papers />
        </group>
        <group position={[0.36, 0, -0.17]} rotation={[0, 2.2, 0]}>
          <Mug />
        </group>
        <group position={[0.64, 0, -0.24]}>
          <SmallPlant />
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The chair                                                                  */
/* -------------------------------------------------------------------------- */

const SEAT_Y = 0.49

/**
 * A swivel chair: off-white upholstery, graphite column, a five-star base in
 * polished brass on graphite castors. Front at +Z. Upholstered graphite at
 * first, it vanished — graphite on the graphite rug, in front of what is now
 * a graphite wall.
 */
export function DeskChair() {
  const arms = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2 + Math.PI / 10), [])

  return (
    <group>
      {/* Star base and castors. */}
      <mesh position={[0, 0.085, 0]} material={M.brass}>
        <cylinderGeometry args={[0.035, 0.04, 0.05, 24]} />
      </mesh>
      {arms.map((a) => (
        <group key={a}>
          <Rod from={[0, 0.085, 0]} to={[Math.cos(a) * 0.31, 0.055, Math.sin(a) * 0.31]} radius={0.017} radiusTo={0.012} material={M.brass} />
          <mesh position={[Math.cos(a) * 0.31, 0.026, Math.sin(a) * 0.31]} material={M.graphiteDeep}>
            <sphereGeometry args={[0.026, 16, 12]} />
          </mesh>
        </group>
      ))}

      {/* Gas-lift column and the mechanism under the seat. */}
      <Rod from={[0, 0.1, 0]} to={[0, SEAT_Y - 0.06, 0]} radius={0.022} material={M.graphiteMatte} />
      <mesh position={[0, SEAT_Y - 0.06, 0]} material={M.graphiteMatte}>
        <boxGeometry args={[0.2, 0.035, 0.22]} />
      </mesh>

      <RoundedBox
        args={[0.5, 0.09, 0.48]}
        radius={0.04}
        smoothness={SMOOTH}
        position={[0, SEAT_Y, 0.01]}
        material={M.upholsteryOffice}
      />

      {/* The back, on a brass spine, leaning back a few degrees. */}
      <mesh position={[0, SEAT_Y + 0.13, -0.27]} rotation={[-0.1, 0, 0]} material={M.brass}>
        <boxGeometry args={[0.05, 0.3, 0.014]} />
      </mesh>
      <RoundedBox
        args={[0.47, 0.5, 0.07]}
        radius={0.035}
        smoothness={SMOOTH}
        position={[0, SEAT_Y + 0.37, -0.25]}
        rotation={[-0.12, 0, 0]}
        material={M.upholsteryOffice}
      />

      {/* Arms: a graphite stem each, a padded rest on top. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Rod from={[side * 0.235, SEAT_Y - 0.02, 0.02]} to={[side * 0.255, SEAT_Y + 0.17, -0.01]} radius={0.012} material={M.graphiteMatte} />
          <RoundedBox
            args={[0.055, 0.03, 0.26]}
            radius={0.012}
            smoothness={SMOOTH}
            position={[side * 0.255, SEAT_Y + 0.185, -0.03]}
            material={M.upholsteryOffice}
          />
        </group>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The desk lamp                                                              */
/* -------------------------------------------------------------------------- */

const SHADE = [
  [0.014, 0.13],
  [0.03, 0.12],
  [0.058, 0.07],
  [0.074, 0.01],
  [0.076, 0],
] as const

/** Where the arms meet, and where the shade hangs. */
const ELBOW: [number, number, number] = [0, 0.42, -0.1]
const HEAD: [number, number, number] = [0, 0.5, 0.2]

/**
 * A two-arm brass lamp on a graphite stone base, its shade pointing forward
 * and down over the desk. Graphite outside, glowing inside once it is on.
 */
export function DeskLamp() {
  const shade = useLathe(SHADE)
  const { glow, anchor } = useLampGlow({ bulb: 7, shade: 1.1, light: 1.1, distance: 2.4 })

  return (
    <group>
      <mesh position={[0, 0.011, 0]} material={M.graphiteStone}>
        <cylinderGeometry args={[0.075, 0.08, 0.022, 48]} />
      </mesh>
      <Rod from={[0, 0.022, -0.01]} to={ELBOW} radius={0.008} material={M.brass} />
      <mesh position={ELBOW} material={M.brass}>
        <sphereGeometry args={[0.015, 16, 12]} />
      </mesh>
      <Rod from={ELBOW} to={HEAD} radius={0.007} material={M.brass} />

      {/* The shade: its apex at the head, tipped forward so it lights the desk. */}
      <group position={HEAD} rotation={[-0.55, 0, 0]}>
        <group position={[0, -0.13, 0]}>
          <mesh geometry={shade} material={M.graphiteMatte} />
          <mesh geometry={shade} material={glow.shadeInner} scale={0.97} />
          <mesh position={[0, 0.04, 0]} material={glow.bulb}>
            <sphereGeometry args={[0.022, 20, 12]} />
          </mesh>
          <group ref={anchor} position={[0, -0.02, 0]} />
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The shelving, styled                                                       */
/* -------------------------------------------------------------------------- */

/** The unit's open shelves: the top of the drawer bank, and two above it. */
const SHELF_TOPS = [1.11, 1.445, 1.755]

/**
 * Poly Haven's shelving unit, with books on its open shelves — a run from the
 * left, an object to the right, as the living room's bookcase is styled. They
 * arrive with it.
 */
export function StyledShelving() {
  const rows = useMemo(() => {
    const rand = seeded(21)
    return SHELF_TOPS.map((y, level) => {
      const books: { x: number; w: number; h: number; m: number; lean: number }[] = []
      let x = -0.48
      const end = level === 1 ? 0.02 : -0.12
      while (x < end) {
        const w = 0.022 + rand() * 0.028
        const h = 0.19 + rand() * 0.09
        books.push({ x: x + w / 2, w, h, m: Math.floor(rand() * BOOK_MATERIALS.length), lean: 0 })
        x += w + 0.003
      }
      if (books.length) books[books.length - 1].lean = -0.16
      return { y, books }
    })
  }, [])

  return (
    <group>
      <PolyHavenShelving />
      {rows.map(({ y, books }, level) => (
        <group key={level} position={[0, y, 0.01]}>
          {books.map((b, i) => (
            <mesh key={i} position={[b.x, b.h / 2, 0]} rotation={[0, 0, b.lean]} material={BOOK_MATERIALS[b.m]}>
              <boxGeometry args={[b.w, b.h, 0.2]} />
            </mesh>
          ))}
          {level !== 1 && (
            <mesh position={[0.3, 0.07, 0]} material={M.brass}>
              <sphereGeometry args={[0.07, 48, 32]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}
