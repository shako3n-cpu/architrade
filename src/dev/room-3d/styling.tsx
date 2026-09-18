import { useMemo } from 'react'
import { SphereGeometry } from 'three'
import { BOOK_MATERIALS, M } from './materials'
import { Rod } from './shapes'
import { seeded, useLathe } from './util'

/**
 * ============================================================================
 * THE SMALL THINGS
 * ----------------------------------------------------------------------------
 * What a surface is styled with — books, a vase, a bowl, a mug, a plant —
 * shared by every room, so a shelf in the office and a shelf in the living
 * room are styled by the same hand. The rule every room follows: no surface
 * left bare, none given more than two or three things.
 *
 * Same conventions as the furniture: origin at the base, centred, metres.
 * Everything here is inside the palette — ceramic, graphite, sand, brass,
 * the muted book spines — except the fruit and the leaves, which are muted
 * versions of what they are.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Books                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A run of upright books from `from` to `to` along +X, spines facing +Z, of
 * seeded widths and heights. The book at one end leans on its neighbours —
 * which is how a real run of books stands when it does not fill its shelf.
 */
export function BookRun({
  from,
  to,
  seed,
  minHeight = 0.2,
  maxHeight = 0.32,
  depth = 0.2,
  lean = 'end',
}: {
  from: number
  to: number
  seed: number
  minHeight?: number
  maxHeight?: number
  depth?: number
  lean?: 'start' | 'end' | 'none'
}) {
  const books = useMemo(() => {
    const rand = seeded(seed)
    const out: { x: number; w: number; h: number; m: number; tilt: number }[] = []
    let x = from
    while (x < to) {
      const w = 0.022 + rand() * 0.028
      const h = minHeight + rand() * (maxHeight - minHeight)
      out.push({ x: x + w / 2, w, h, m: Math.floor(rand() * BOOK_MATERIALS.length), tilt: 0 })
      x += w + 0.003
    }
    if (out.length > 2 && lean === 'end') {
      const last = out[out.length - 1]
      last.tilt = 0.16
      last.x += 0.02
    }
    if (out.length > 2 && lean === 'start') {
      out[0].tilt = -0.16
      out[0].x -= 0.02
    }
    return out
  }, [from, to, seed, minHeight, maxHeight, lean])

  return (
    <group>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, 0]} rotation={[0, 0, b.tilt]} material={BOOK_MATERIALS[b.m]}>
          <boxGeometry args={[b.w, b.h, depth]} />
        </mesh>
      ))}
    </group>
  )
}

/** Thickness of one book in a stack. `BookStack` is this times its count tall. */
export const STACKED_BOOK = 0.03

/** Books lying flat, each a little smaller than the one under it, turned a few degrees. */
export function BookStack({
  count,
  seed,
  width = 0.24,
  depth = 0.18,
}: {
  count: number
  seed: number
  width?: number
  depth?: number
}) {
  const books = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, (_, i) => ({
      w: width - i * 0.018 - rand() * 0.02,
      d: depth - i * 0.012 - rand() * 0.015,
      turn: (rand() - 0.5) * 0.28,
      m: Math.floor(rand() * BOOK_MATERIALS.length),
    }))
  }, [count, seed, width, depth])

  return (
    <group>
      {books.map((b, i) => (
        <mesh
          key={i}
          position={[0, STACKED_BOOK * (i + 0.5), 0]}
          rotation={[0, b.turn, 0]}
          material={BOOK_MATERIALS[b.m]}
        >
          <boxGeometry args={[b.w, STACKED_BOOK - 0.003, b.d]} />
        </mesh>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Vessels                                                                    */
/* -------------------------------------------------------------------------- */

const BOWL = [
  [0, 0],
  [0.06, 0.004],
  [0.11, 0.03],
  [0.13, 0.058],
  [0.124, 0.06],
  [0.104, 0.036],
  [0.058, 0.012],
  [0, 0.01],
] as const

/** A shallow polished-brass bowl, 26cm across. */
export function BrassBowl() {
  const bowl = useLathe(BOWL)
  return <mesh geometry={bowl} material={M.brass} />
}

const VASE = [
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
] as const

const VASE_STEMS: { lean: [number, number, number]; h: number }[] = [
  { lean: [0.18, 0, 0.1], h: 0.46 },
  { lean: [-0.14, 0, 0.16], h: 0.38 },
  { lean: [0.05, 0, -0.2], h: 0.42 },
]

/** A ceramic vase, 31cm, with three dry stems. */
export function Vase() {
  const body = useLathe(VASE)

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

const BUD_VASE = [
  [0, 0],
  [0.04, 0],
  [0.052, 0.035],
  [0.05, 0.08],
  [0.03, 0.125],
  [0.018, 0.15],
  [0.022, 0.16],
  [0.014, 0.16],
  [0, 0.145],
] as const

/** A small bud vase, 16cm, in graphite or ceramic, with one stem. */
export function BudVase({ tone = 'ceramic' }: { tone?: 'ceramic' | 'graphite' }) {
  const body = useLathe(BUD_VASE)
  return (
    <group>
      <mesh geometry={body} material={tone === 'ceramic' ? M.ceramic : M.graphiteStone} />
      <Rod from={[0, 0.14, 0]} to={[0.04, 0.36, 0.01]} radius={0.0025} material={M.trunk} segments={6} />
    </group>
  )
}

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

/** A lidded ceramic jar, 20cm — scaled for a smaller one. */
export function Jar({ scale = 1 }: { scale?: number }) {
  const jar = useLathe(JAR)
  return <mesh geometry={jar} scale={scale} material={M.ceramic} />
}

/* -------------------------------------------------------------------------- */
/* Objects                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A small sculpture: a brass ring standing on a block of graphite stone —
 * the one thing on a shelf that is neither a book nor a vessel.
 */
export function RingSculpture() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} material={M.graphiteStone}>
        <boxGeometry args={[0.11, 0.04, 0.07]} />
      </mesh>
      <mesh position={[0, 0.04 + 0.075, 0]} material={M.brass}>
        <torusGeometry args={[0.068, 0.009, 16, 64]} />
      </mesh>
    </group>
  )
}

/** A polished brass sphere on the shelf it is set on. */
export function BrassSphere({ radius = 0.06 }: { radius?: number }) {
  return (
    <mesh position={[0, radius, 0]} material={M.brass}>
      <sphereGeometry args={[radius, 48, 32]} />
    </mesh>
  )
}

const MUG = [
  [0, 0],
  [0.036, 0],
  [0.041, 0.008],
  [0.042, 0.095],
  [0.037, 0.095],
  [0.036, 0.012],
  [0, 0.012],
] as const

/** A ceramic mug with its handle. */
export function Mug() {
  const body = useLathe(MUG)
  return (
    <group>
      <mesh geometry={body} material={M.ceramic} />
      {/* Half a torus, turned so its arc stands out from the mug's side. */}
      <mesh position={[0.04, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]} material={M.ceramic}>
        <torusGeometry args={[0.022, 0.006, 10, 24, Math.PI]} />
      </mesh>
    </group>
  )
}

/** A few loose A4 sheets, fanned, with a brass pen across them. */
export function Papers() {
  const sheets = [
    { x: 0, z: 0, turn: 0.08 },
    { x: 0.035, z: -0.02, turn: -0.12 },
    { x: -0.02, z: 0.015, turn: 0.2 },
  ]
  return (
    <group>
      {sheets.map((s, i) => (
        <mesh key={i} position={[s.x, 0.0015 + i * 0.0012, s.z]} rotation={[0, s.turn, 0]} material={M.print}>
          <boxGeometry args={[0.21, 0.001, 0.297]} />
        </mesh>
      ))}
      <Rod from={[-0.06, 0.009, -0.04]} to={[0.06, 0.009, 0.08]} radius={0.004} material={M.brass} />
    </group>
  )
}

const POT = [
  [0, 0],
  [0.045, 0],
  [0.05, 0.01],
  [0.056, 0.085],
  [0.05, 0.085],
  [0.048, 0.075],
  [0, 0.075],
] as const

/**
 * A small pilea in a graphite pot, 25cm to the top of its leaves: round
 * leaves on thin stems, fanned out. The only green on a desk.
 */
export function SmallPlant() {
  const pot = useLathe(POT)
  const leaf = useMemo(() => new SphereGeometry(1, 16, 8), [])
  const leaves = useMemo(() => {
    const rand = seeded(29)
    return Array.from({ length: 9 }, (_, i) => {
      const angle = i * 2.39996 + rand() * 0.4
      const reach = 0.03 + rand() * 0.05
      const top = 0.15 + rand() * 0.09
      return { angle, reach, top, size: 0.026 + rand() * 0.016 }
    })
  }, [])

  return (
    <group>
      <mesh geometry={pot} material={M.graphiteStone} />
      <mesh position={[0, 0.074, 0]} material={M.soil}>
        <cylinderGeometry args={[0.048, 0.048, 0.004, 24]} />
      </mesh>
      {leaves.map((l, i) => {
        const tip: [number, number, number] = [Math.cos(l.angle) * l.reach, l.top, Math.sin(l.angle) * l.reach]
        return (
          <group key={i}>
            <Rod from={[0, 0.075, 0]} to={tip} radius={0.0022} material={M.leaf} segments={5} />
            <mesh
              geometry={leaf}
              position={tip}
              rotation={[Math.sin(l.angle) * 0.5, l.angle, Math.cos(l.angle) * 0.5]}
              scale={[l.size, l.size * 0.12, l.size]}
              material={M.leaf}
            />
          </group>
        )
      })}
    </group>
  )
}

const PEAR = [
  [0, 0],
  [0.022, 0.004],
  [0.034, 0.02],
  [0.036, 0.038],
  [0.029, 0.06],
  [0.019, 0.078],
  [0.014, 0.092],
  [0.008, 0.1],
  [0, 0.101],
] as const

/** A pear, 10cm, muted olive or russet, with its stalk. */
function Pear({ russet = false }: { russet?: boolean }) {
  const body = useLathe(PEAR, 32)
  return (
    <group>
      <mesh geometry={body} material={russet ? M.pearRusset : M.pear} />
      <Rod from={[0, 0.098, 0]} to={[0.006, 0.122, 0.002]} radius={0.0025} material={M.trunk} segments={5} />
    </group>
  )
}

/** The brass bowl with three pears in it: two lying, one standing. */
export function FruitBowl() {
  return (
    <group>
      <BrassBowl />
      <group position={[-0.035, 0.03, 0.02]} rotation={[0, 0.4, 1.25]}>
        <Pear />
      </group>
      <group position={[0.05, 0.03, -0.03]} rotation={[0.2, -0.8, -1.2]}>
        <Pear russet />
      </group>
      <group position={[0.01, 0.018, 0.055]} rotation={[-0.25, 0, 0.1]}>
        <Pear />
      </group>
    </group>
  )
}

/**
 * Two oak chopping boards leaning against the wall, the smaller in front.
 * Origin at the foot of the larger, which touches the wall at -Z.
 */
export function CuttingBoards() {
  return (
    <group>
      <mesh position={[0, 0.2, -0.035]} rotation={[-0.14, 0, 0]} material={M.oak}>
        <boxGeometry args={[0.3, 0.42, 0.02]} />
      </mesh>
      <mesh position={[0.07, 0.14, 0.0]} rotation={[-0.16, 0, 0]} material={M.graphiteStone}>
        <boxGeometry args={[0.22, 0.29, 0.016]} />
      </mesh>
    </group>
  )
}

const CROCK = [
  [0, 0],
  [0.058, 0],
  [0.062, 0.01],
  [0.062, 0.16],
  [0.056, 0.16],
  [0.055, 0.02],
  [0, 0.02],
] as const

/** A ceramic crock of wooden spoons, handles up. */
export function UtensilCrock() {
  const crock = useLathe(CROCK)
  return (
    <group>
      <mesh geometry={crock} material={M.ceramic} />
      <Rod from={[0, 0.03, 0]} to={[-0.05, 0.31, 0.02]} radius={0.007} material={M.oak} segments={8} />
      <Rod from={[0.01, 0.03, 0]} to={[0.045, 0.29, -0.02]} radius={0.007} material={M.oak} segments={8} />
      <Rod from={[0, 0.03, 0.01]} to={[0.01, 0.33, 0.045]} radius={0.006} material={M.brassBrushed} segments={8} />
    </group>
  )
}
