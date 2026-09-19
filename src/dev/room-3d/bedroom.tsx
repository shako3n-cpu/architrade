import { RoundedBox } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import { BookStack, BrassBowl, Vase } from './styling'
import { useLampGlow } from './lamp-glow'
import { BOOK_MATERIALS, M } from './materials'
import { PALETTE } from './palette'
import { PolyHavenSideboard, PolyHavenSideTable, SIDE_TABLE_01_SHELF, SIDE_TABLE_01_TOP, SIDEBOARD_TOP } from './polyhaven'
import { Rod } from './shapes'
import { useLathe } from './util'

/**
 * ============================================================================
 * THE BEDROOM
 * ----------------------------------------------------------------------------
 * Four pieces: the bed (on its rug), a bedside table with its lamp either
 * side of it, and a long low sideboard on the left wall — against warm
 * limewash on the wall behind the headboard (walls.tsx). The bedside tables
 * and the sideboard are Poly Haven's (see polyhaven.tsx); the bed and the
 * lamps are modelled here — Poly Haven's only beds are a gothic four-poster
 * and a hospital frame.
 *
 * Same conventions as furniture.tsx: origin at the base, centred on the
 * footprint, front facing +Z — for the bed, +Z is the foot.
 *
 * THE LOOK
 *   A graphite upholstered frame with a channelled headboard, made up in
 *   off-white linen: the living room's sofa inverted, dark frame and light
 *   cloth. The throw is sand — the one warm cloth — and the lamp is the room's
 *   light, coming up once it has landed on the table, as the floor lamp does.
 * ============================================================================
 */

const SMOOTH = 5

/* -------------------------------------------------------------------------- */
/* The bed                                                                    */
/* -------------------------------------------------------------------------- */

const BED_W = 1.92
const BED_L = 2.22
const HEAD_T = 0.1
const BASE_TOP = 0.35

/** A king-size bed, 1.92 x 2.22 m overall, headboard at -Z. */
export function Bed() {
  const baseL = BED_L - HEAD_T
  const baseZ = HEAD_T / 2
  const headZ = -BED_L / 2 + HEAD_T / 2
  const channels = 6
  const channelW = BED_W / channels

  return (
    <group>
      {/* Recessed plinth: the frame floats, as the sofa does. */}
      <mesh position={[0, 0.035, baseZ]} material={M.graphiteDeep}>
        <boxGeometry args={[BED_W - 0.2, 0.07, baseL - 0.2]} />
      </mesh>

      <RoundedBox
        args={[BED_W, BASE_TOP - 0.07, baseL]}
        radius={0.05}
        smoothness={SMOOTH}
        position={[0, (0.07 + BASE_TOP) / 2, baseZ]}
        material={M.fabricGraphite}
      />

      {/* The headboard: six upholstered channels, floor to 1.17m. */}
      {Array.from({ length: channels }, (_, i) => (
        <RoundedBox
          key={i}
          args={[channelW - 0.008, 1.1, HEAD_T]}
          radius={0.045}
          smoothness={SMOOTH}
          position={[-BED_W / 2 + channelW * (i + 0.5), 0.07 + 0.55, headZ]}
          material={M.fabricGraphite}
        />
      ))}

      {/* Mattress, in its sheet. */}
      <RoundedBox args={[1.8, 0.22, 2]} radius={0.06} smoothness={SMOOTH} position={[0, BASE_TOP + 0.11, baseZ]} material={M.linen} />

      {/* The duvet: wider than the mattress, so it hangs over the sides, and
          stopping short of the pillows, where the sheet is turned down over it. */}
      <RoundedBox args={[1.9, 0.3, 1.5]} radius={0.07} smoothness={SMOOTH} position={[0, 0.49, 0.33]} material={M.linen} />
      <RoundedBox args={[1.9, 0.06, 0.28]} radius={0.028} smoothness={SMOOTH} position={[0, 0.64, -0.28]} material={M.linen} />

      {/* The throw, across the foot. */}
      <RoundedBox args={[1.98, 0.34, 0.5]} radius={0.05} smoothness={SMOOTH} position={[0, 0.5, 0.85]} material={M.fabricSandDeep} />

      {/* Two sleeping pillows propped on the headboard... */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.74, 0.48, 0.17]}
          radius={0.08}
          smoothness={SMOOTH}
          position={[side * 0.45, 0.79, -0.86]}
          rotation={[-0.36, side * 0.04, 0]}
          material={M.linen}
        />
      ))}

      {/* ...and two cushions in front of them: graphite square, sand bolster. */}
      <RoundedBox
        args={[0.5, 0.46, 0.15]}
        radius={0.07}
        smoothness={SMOOTH}
        position={[-0.3, 0.8, -0.64]}
        rotation={[-0.3, 0.14, 0.03]}
        material={M.fabricGraphite}
      />
      <RoundedBox
        args={[0.6, 0.26, 0.15]}
        radius={0.07}
        smoothness={SMOOTH}
        position={[0.2, 0.74, -0.55]}
        rotation={[-0.26, -0.08, 0]}
        material={M.fabricSand}
      />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The bedside lamp                                                           */
/* -------------------------------------------------------------------------- */

const LAMP_BASE = [
  [0, 0],
  [0.066, 0],
  [0.082, 0.03],
  [0.094, 0.11],
  [0.084, 0.2],
  [0.05, 0.265],
  [0.022, 0.29],
  [0.016, 0.3],
  [0, 0.3],
] as const

const SHADE_H = 0.22

/** The drum's outside: linen, which glows a little itself once the lamp is on. */
const linenDrum = () =>
  new MeshStandardMaterial({ color: PALETTE.linen, roughness: 0.95, emissive: PALETTE.bulb, emissiveIntensity: 0 })

/**
 * A ceramic gourd on a brass stem, under a tapered linen drum. When it comes
 * on, the drum glows through as well as from inside — linen is translucent,
 * and a shade that stayed flat white while the bulb inside it was lit read as
 * paper, not cloth.
 */
export function TableLamp() {
  const base = useLathe(LAMP_BASE)
  const { glow, anchor } = useLampGlow({
    bulb: 6,
    shade: 1,
    skin: { make: linenDrum, peak: 0.42 },
    light: 1.5,
    distance: 3.2,
  })

  const shadeY = 0.33 + SHADE_H / 2

  return (
    <group>
      <mesh geometry={base} material={M.ceramic} />
      <Rod from={[0, 0.29, 0]} to={[0, 0.4, 0]} radius={0.007} material={M.brass} />

      <mesh position={[0, shadeY, 0]} material={glow.skin!}>
        <cylinderGeometry args={[0.125, 0.165, SHADE_H, 64, 1, true]} />
      </mesh>
      <mesh position={[0, shadeY, 0]} material={glow.shadeInner} scale={0.985}>
        <cylinderGeometry args={[0.125, 0.165, SHADE_H, 64, 1, true]} />
      </mesh>

      <mesh position={[0, 0.41, 0]} material={glow.bulb}>
        <sphereGeometry args={[0.028, 24, 16]} />
      </mesh>
      <group ref={anchor} position={[0, 0.42, 0]} />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The sideboard, styled                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Poly Haven's sideboard with a few things on it — a vase of stems, two books
 * with a brass bowl on them — which arrive with it rather than as pieces of
 * their own, so the room stays at four.
 */
export function StyledSideboard() {
  return (
    <group>
      <PolyHavenSideboard />
      <group position={[0, SIDEBOARD_TOP, 0]}>
        <group position={[0.72, 0, -0.04]}>
          <Vase />
        </group>
        <mesh position={[-0.55, 0.016, 0]} rotation={[0, 0.12, 0]} material={BOOK_MATERIALS[1]}>
          <boxGeometry args={[0.3, 0.032, 0.23]} />
        </mesh>
        <mesh position={[-0.55, 0.045, 0.01]} rotation={[0, -0.05, 0]} material={BOOK_MATERIALS[2]}>
          <boxGeometry args={[0.26, 0.026, 0.19]} />
        </mesh>
        <group position={[-0.55, 0.058, 0.01]} scale={0.6}>
          <BrassBowl />
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The bedside table, styled                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Poly Haven's bedside table with its lamp, two books beside the lamp and
 * three more lying on its shelf — one piece, so the pair either side of the
 * bed keeps the room at four. The lamp still comes on only once the table
 * has landed: it reads the clock of the DropIn it is in.
 *
 * `side` is which side of the bed it stands: the lamp goes to the outside,
 * the books to the side nearer the bed, so the pair mirror each other.
 */
export function BedsideTable({ side }: { side: 'left' | 'right' }) {
  const out = side === 'right' ? 1 : -1
  return (
    <group>
      <PolyHavenSideTable />
      <group position={[out * 0.08, SIDE_TABLE_01_TOP, 0.02]}>
        <TableLamp />
      </group>
      <group position={[-out * 0.15, SIDE_TABLE_01_TOP, 0.02]} rotation={[0, out * 0.22, 0]}>
        <BookStack count={2} seed={side === 'right' ? 31 : 35} width={0.17} depth={0.23} />
      </group>
      <group position={[0.02, SIDE_TABLE_01_SHELF, 0.01]}>
        <BookStack count={3} seed={side === 'right' ? 33 : 37} width={0.3} depth={0.22} />
      </group>
    </group>
  )
}
