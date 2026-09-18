import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { CubicBezierCurve3, CylinderGeometry, TubeGeometry, Vector3 } from 'three'
import { BrassBowl, Vase } from './furniture'
import { M } from './materials'
import { PendantLamp } from './polyhaven'
import { Rod } from './shapes'
import { useLathe } from './util'

/**
 * ============================================================================
 * THE KITCHEN
 * ----------------------------------------------------------------------------
 * Four pieces: the run of units along the back wall, the island, a pair of
 * counter stools, and a pair of pendants over the island. The pendants are
 * Poly Haven's (see polyhaven.tsx); the rest is modelled here, because Poly
 * Haven has no modern kitchen joinery and no modern stool.
 *
 * Same conventions as furniture.tsx: origin at the base, centred on the
 * footprint, front facing +Z, metres. The pendants hang from their origin.
 *
 * THE LOOK
 *   Off-white lacquer joinery — the living room's bookcase, continued — under
 *   a honed graphite worktop; a graphite island with a reeded front and a pale
 *   stone top, so the two big pieces are each other's negative; brass for the
 *   tap, the handles, the stool frames and the pendants' fittings.
 *
 *   Every front is a separate slab with a 6mm gap round it, and the carcass
 *   behind the gaps is graphite. At this distance a gap is a pixel or two;
 *   dark behind it, that pixel is the shadow line that makes a run of
 *   cupboards read as cupboards and not as one white block.
 * ============================================================================
 */

/** Height of the worktop surface — the same for the run and the island. */
export const COUNTER_TOP = 0.92

const SMOOTH = 5
const GAP = 0.006
const PLINTH = 0.1

/** A lacquered front — a door or a drawer — with its gap already taken off. */
function Front({ x0, x1, y0, y1, z }: { x0: number; x1: number; y0: number; y1: number; z: number }) {
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, z + 0.01]} material={M.lacquer}>
      <boxGeometry args={[x1 - x0 - GAP, y1 - y0 - GAP, 0.02]} />
    </mesh>
  )
}

/** A slim brushed-brass bar pull, horizontal unless `vertical`. */
function Pull({ at, length = 0.22, vertical = false }: { at: [number, number, number]; length?: number; vertical?: boolean }) {
  return (
    <mesh position={at} rotation={vertical ? [0, 0, 0] : [0, 0, Math.PI / 2]} material={M.brassBrushed}>
      <cylinderGeometry args={[0.006, 0.006, length, 12]} />
    </mesh>
  )
}

/* -------------------------------------------------------------------------- */
/* The run along the back wall                                                */
/* -------------------------------------------------------------------------- */

const RUN_W = 4.2
const RUN_D = 0.62
const TALL_W = 0.65
const TALL_H = 2.25
const BASE_TOP = COUNTER_TOP - 0.04

/** Where each base unit starts and ends along the run, left to right. */
const BASE_UNITS = (() => {
  const from = -RUN_W / 2 + TALL_W
  const to = RUN_W / 2 - 0.02 // the end panel
  const w = (to - from) / 6
  return Array.from({ length: 6 }, (_, i) => [from + i * w, from + (i + 1) * w] as const)
})()

const SINK_X = (BASE_UNITS[2][0] + BASE_UNITS[2][1]) / 2
const HOB_X = (BASE_UNITS[4][0] + BASE_UNITS[4][1]) / 2

const JAR = [
  [0, 0],
  [0.055, 0],
  [0.06, 0.012],
  [0.06, 0.17],
  [0.05, 0.18],
  [0.05, 0.19],
  [0.036, 0.2],
  [0, 0.2],
] as const

/**
 * Four metres of kitchen: a tall larder at the left end, then six base units
 * — a bank of drawers, a cupboard, the sink, the dishwasher, pan drawers under
 * the hob, a cupboard — under one graphite worktop, with a floating shelf of
 * ceramics above the sink. Front at +Z; the back sits on the wall.
 */
export function KitchenRun() {
  const zFront = RUN_D / 2 - 0.02
  const jar = useLathe(JAR)

  const tap = useMemo(
    () =>
      new TubeGeometry(
        new CubicBezierCurve3(
          new Vector3(0, 1.2, -0.2),
          new Vector3(0, 1.34, -0.2),
          new Vector3(0, 1.34, 0.0),
          new Vector3(0, 1.13, 0.0),
        ),
        48,
        0.011,
        12,
      ),
    [],
  )

  const tallX0 = -RUN_W / 2
  const tallX1 = -RUN_W / 2 + TALL_W
  /** Where the base carcass ends: the inside face of the end panel. */
  const baseX1 = RUN_W / 2 - 0.02

  return (
    <group>
      {/* The graphite core everything is hung on: plinth, carcasses, the
          shadow behind every gap. It stops short of every lacquer panel that
          closes it — the larder's side and top, the run's end — because a core
          face lying in the same plane as a panel's outer face flickers
          between the two. */}
      <mesh position={[0, PLINTH / 2, -0.03]} material={M.graphiteMatte}>
        <boxGeometry args={[RUN_W - 0.04, PLINTH, RUN_D - 0.06]} />
      </mesh>
      <mesh position={[(tallX1 + baseX1) / 2, (PLINTH + BASE_TOP) / 2, -0.015]} material={M.graphiteMatte}>
        <boxGeometry args={[baseX1 - tallX1, BASE_TOP - PLINTH, RUN_D - 0.03]} />
      </mesh>
      <mesh position={[(tallX0 + tallX1 - 0.02) / 2, (PLINTH + TALL_H - 0.02) / 2, -0.015]} material={M.graphiteMatte}>
        <boxGeometry args={[TALL_W - 0.02, TALL_H - 0.02 - PLINTH, RUN_D - 0.03]} />
      </mesh>

      {/* Tall larder: lacquer side and top where they show, two doors, long pulls. */}
      <mesh position={[tallX1 - 0.01, TALL_H / 2, 0]} material={M.lacquer}>
        <boxGeometry args={[0.02, TALL_H, RUN_D]} />
      </mesh>
      <mesh position={[(tallX0 + tallX1) / 2, TALL_H - 0.01, 0]} material={M.lacquer}>
        <boxGeometry args={[TALL_W, 0.02, RUN_D]} />
      </mesh>
      <Front x0={tallX0} x1={tallX1 - 0.02} y0={PLINTH} y1={1.42} z={zFront} />
      <Front x0={tallX0} x1={tallX1 - 0.02} y0={1.42} y1={TALL_H - 0.02} z={zFront} />
      <Pull at={[tallX1 - 0.07, 1.12, zFront + 0.035]} length={0.42} vertical />
      <Pull at={[tallX1 - 0.07, 1.72, zFront + 0.035]} length={0.42} vertical />

      {/* The six base units. */}
      {BASE_UNITS.map(([x0, x1], i) => {
        const drawers = i === 0 ? 3 : i === 4 ? 2 : 1
        const h = (BASE_TOP - PLINTH) / drawers
        return Array.from({ length: drawers }, (_, j) => {
          const y1 = BASE_TOP - j * h
          return (
            <group key={`${i}-${j}`}>
              <Front x0={x0} x1={x1} y0={y1 - h} y1={y1} z={zFront} />
              <Pull at={[(x0 + x1) / 2, y1 - 0.045, zFront + 0.035]} />
            </group>
          )
        })
      })}

      {/* End panel, lacquer, floor to worktop — the run's visible right end. */}
      <mesh position={[RUN_W / 2 - 0.01, BASE_TOP / 2, 0]} material={M.lacquer}>
        <boxGeometry args={[0.02, BASE_TOP, RUN_D]} />
      </mesh>

      {/* Worktop: honed graphite stone, 4cm, a 2cm overhang at the front. */}
      <mesh position={[(tallX1 + RUN_W / 2) / 2, BASE_TOP + 0.02, 0.01]} material={M.graphiteStone}>
        <boxGeometry args={[RUN_W / 2 - tallX1, 0.04, RUN_D + 0.02]} />
      </mesh>

      {/* Undermounted sink: a matte black recess in the stone, and the tap. */}
      <mesh position={[SINK_X, COUNTER_TOP + 0.001, 0.02]} material={M.basin}>
        <boxGeometry args={[0.5, 0.002, 0.38]} />
      </mesh>
      <group position={[SINK_X, 0, 0]}>
        <Rod from={[0, COUNTER_TOP, -0.2]} to={[0, 1.2, -0.2]} radius={0.016} radiusTo={0.011} material={M.brass} />
        <mesh geometry={tap} material={M.brass} />
        {/* The lever. */}
        <Rod from={[0.015, 1.02, -0.2]} to={[0.1, 1.05, -0.2]} radius={0.006} material={M.brass} />
      </group>

      {/* Induction hob: a sheet of black glass. */}
      <mesh position={[HOB_X, COUNTER_TOP + 0.003, 0.02]} material={M.blackGlass}>
        <boxGeometry args={[0.58, 0.006, 0.5]} />
      </mesh>

      {/* The floating shelf, and what is on it. */}
      <group position={[SINK_X + 0.25, 1.56, -RUN_D / 2 + 0.13]}>
        <mesh position={[0, -0.0175, 0]} material={M.graphiteMatte}>
          <boxGeometry args={[1.5, 0.035, 0.26]} />
        </mesh>
        <mesh geometry={jar} position={[-0.52, 0, 0]} material={M.ceramic} />
        <mesh geometry={jar} position={[-0.38, 0, 0.01]} scale={[0.85, 0.72, 0.85]} material={M.ceramic} />
        {[0, 1, 2, 3].map((j) => (
          <mesh key={j} position={[-0.02, 0.008 + j * 0.016, 0]} material={j === 3 ? M.sand : M.ceramic}>
            <cylinderGeometry args={[0.115 - j * 0.004, 0.105 - j * 0.004, 0.014, 48]} />
          </mesh>
        ))}
        <group position={[0.4, 0, 0]} scale={0.7}>
          <BrassBowl />
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The island                                                                 */
/* -------------------------------------------------------------------------- */

const ISLAND_W = 2
const ISLAND_D = 0.72
const REED_R = 0.018

/**
 * A graphite island with a reeded front on the seating side, under a pale
 * honed stone top that overhangs that side by 26cm for knees. A brass bowl
 * and a vase of dry stems on top, part of the piece: they arrive with it.
 */
export function Island() {
  const reeds = useMemo(() => {
    const count = Math.floor((ISLAND_W - 0.04) / (REED_R * 2))
    const pitch = (ISLAND_W - 0.04) / count
    return Array.from({ length: count }, (_, i) => -ISLAND_W / 2 + 0.02 + pitch * (i + 0.5))
  }, [])
  const reed = useMemo(() => new CylinderGeometry(REED_R, REED_R, BASE_TOP - 0.06, 10), [])

  return (
    <group>
      {/* Recessed plinth, so the island floats a few centimetres. */}
      <mesh position={[0, 0.03, -0.02]} material={M.graphiteDeep}>
        <boxGeometry args={[ISLAND_W - 0.1, 0.06, ISLAND_D - 0.1]} />
      </mesh>

      <mesh position={[0, (0.06 + BASE_TOP) / 2, -0.01]} material={M.graphiteMatte}>
        <boxGeometry args={[ISLAND_W, BASE_TOP - 0.06, ISLAND_D - 0.02]} />
      </mesh>

      {/* The reeding: half-round flutes along the whole seating side. */}
      {reeds.map((x) => (
        <mesh key={x} geometry={reed} position={[x, (0.06 + BASE_TOP) / 2, ISLAND_D / 2 - 0.02]} material={M.graphiteMatte} />
      ))}

      {/* The top: 4cm pale stone, overhanging the seating side. */}
      <RoundedBox
        args={[ISLAND_W + 0.2, 0.04, ISLAND_D + 0.3]}
        radius={0.008}
        smoothness={2}
        position={[0, BASE_TOP + 0.02, 0.13]}
        material={M.paleStone}
      />

      <group position={[0.45, COUNTER_TOP, 0.12]}>
        <BrassBowl />
      </group>
      <group position={[-0.52, COUNTER_TOP, 0.02]}>
        <Vase />
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Counter stools                                                             */
/* -------------------------------------------------------------------------- */

const SEAT_TOP = 0.66

/** One counter stool: graphite upholstery on a slim, splayed brass frame. */
function Stool() {
  const legs: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]
  // The frame splays: 19/18cm out at the floor, 16/15cm under the seat.
  const at = (y: number, sx: number, sz: number): [number, number, number] => {
    const k = y / (SEAT_TOP - 0.05)
    return [sx * (0.19 - 0.03 * k), y, sz * (0.18 - 0.03 * k)]
  }
  const RING = 0.25

  return (
    <group>
      {legs.map(([sx, sz]) => (
        <Rod
          key={`${sx}${sz}`}
          from={at(0, sx, sz)}
          to={at(SEAT_TOP - 0.05, sx, sz)}
          radius={0.01}
          radiusTo={0.013}
          material={M.brassBrushed}
        />
      ))}

      {/* The footrest: a ring of rods round the legs. */}
      <Rod from={at(RING, -1, 1)} to={at(RING, 1, 1)} radius={0.008} material={M.brassBrushed} />
      <Rod from={at(RING, -1, -1)} to={at(RING, 1, -1)} radius={0.008} material={M.brassBrushed} />
      <Rod from={at(RING, -1, -1)} to={at(RING, -1, 1)} radius={0.008} material={M.brassBrushed} />
      <Rod from={at(RING, 1, -1)} to={at(RING, 1, 1)} radius={0.008} material={M.brassBrushed} />

      <RoundedBox
        args={[0.42, 0.075, 0.4]}
        radius={0.03}
        smoothness={SMOOTH}
        position={[0, SEAT_TOP - 0.0375, 0]}
        material={M.fabricGraphite}
      />

      {/* A low back, on two brass stems. */}
      <Rod from={[-0.15, SEAT_TOP - 0.02, -0.17]} to={[-0.15, SEAT_TOP + 0.13, -0.19]} radius={0.007} material={M.brassBrushed} />
      <Rod from={[0.15, SEAT_TOP - 0.02, -0.17]} to={[0.15, SEAT_TOP + 0.13, -0.19]} radius={0.007} material={M.brassBrushed} />
      <RoundedBox
        args={[0.4, 0.15, 0.05]}
        radius={0.022}
        smoothness={SMOOTH}
        position={[0, SEAT_TOP + 0.17, -0.195]}
        rotation={[-0.14, 0, 0]}
        material={M.fabricGraphite}
      />
    </group>
  )
}

/** Two stools, 90cm apart — one piece, so the kitchen stays at four. */
export function StoolPair() {
  return (
    <group>
      <group position={[-0.45, 0, 0]}>
        <Stool />
      </group>
      <group position={[0.45, 0, 0]}>
        <Stool />
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Pendants                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * How far below the ceiling each pendant's canopy hangs, on a fine cable. The
 * model's own rod puts the glass 1.85m off the floor; this brings it to about
 * 1.6 — 70cm over the island — where it reads as hanging over the island and
 * not, from two metres up, over the worktop behind it.
 */
const CABLE = 0.24

/** Two of Poly Haven's opal pendants, a metre apart. Origin at the ceiling. */
export function PendantPair() {
  return (
    <group>
      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Rod from={[0, 0, 0]} to={[0, -CABLE, 0]} radius={0.0025} material={M.graphiteDeep} segments={6} />
          <group position={[0, -CABLE, 0]}>
            <PendantLamp />
          </group>
        </group>
      ))}
    </group>
  )
}
