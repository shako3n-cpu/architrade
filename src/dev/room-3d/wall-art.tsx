import { useMemo, type ReactNode } from 'react'
import { MeshStandardMaterial, Shape, ShapeGeometry, type Material } from 'three'
import { M } from './materials'

/**
 * ============================================================================
 * WHAT HANGS ON THE WALLS
 * ----------------------------------------------------------------------------
 * One wall-hung piece per room, each where that room's composition had a hole
 * in it — a large bare wall the eye went to and found nothing on:
 *
 *   living room  the framed sun print over the sofa (furniture.tsx)
 *   kitchen      an arch print in an oak frame on the long left wall
 *   bedroom      a round brass mirror over the sideboard
 *   office       a ring print in a brass frame on the graphite wall
 *
 * Each is different in kind from the others, so the four rooms do not share
 * one print; and each adds a material the room lacked — oak in the kitchen,
 * a mirror's reflection in the bedroom, polished brass against graphite.
 *
 * Origin at the BOTTOM CENTRE of the frame, on the wall's surface, facing +Z
 * — the living room's print's convention, so they hang the same way.
 * ============================================================================
 */

/** The paper a print is printed on: warm off-white, faintly lit from inside. */
const PAPER = new MeshStandardMaterial({ color: '#f1ede5', roughness: 0.95 })

/** A shallow frame of `material` around a mat and a print, `w` x `h` outside. */
function Frame({ w, h, material, children }: { w: number; h: number; material: Material; children?: ReactNode }) {
  const border = 0.028
  return (
    <group>
      {/* Four rails, so the frame has a real edge the light can catch. */}
      <mesh position={[0, h - border / 2, 0.02]} material={material}>
        <boxGeometry args={[w, border, 0.04]} />
      </mesh>
      <mesh position={[0, border / 2, 0.02]} material={material}>
        <boxGeometry args={[w, border, 0.04]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (w / 2 - border / 2), h / 2, 0.02]} material={material}>
          <boxGeometry args={[border, h - 2 * border, 0.04]} />
        </mesh>
      ))}
      {/* The mat, set back behind the rails. */}
      <mesh position={[0, h / 2, 0.012]} material={PAPER}>
        <boxGeometry args={[w - 2 * border, h - 2 * border, 0.004]} />
      </mesh>
      <group position={[0, h / 2, 0.0145]}>{children}</group>
    </group>
  )
}

/** An arch — a rectangle with a half-round top — `w` wide and `h` tall, from its base. */
function useArch(w: number, h: number) {
  return useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-w / 2, 0)
    shape.lineTo(w / 2, 0)
    shape.lineTo(w / 2, h - w / 2)
    shape.absarc(0, h - w / 2, w / 2, 0, Math.PI, false)
    shape.lineTo(-w / 2, 0)
    return new ShapeGeometry(shape, 32)
  }, [w, h])
}

/**
 * The kitchen's print, 0.9 x 1.2m in oak: two arches standing side by side
 * on a graphite line — a tall sand one and a shorter graphite one overlapping
 * it — the quiet architectural still life a kitchen wall carries well.
 */
export function ArchPrint() {
  const W = 0.9
  const H = 1.2
  const tall = useArch(0.3, 0.58)
  const short = useArch(0.24, 0.4)
  return (
    <Frame w={W} h={H} material={M.oak}>
      <mesh geometry={tall} position={[-0.07, -0.3, 0.001]} material={M.sand} />
      <mesh geometry={short} position={[0.1, -0.3, 0.002]} material={M.graphiteMatte} />
      <mesh position={[0, -0.303, 0.003]} material={M.graphiteMatte}>
        <planeGeometry args={[0.56, 0.006]} />
      </mesh>
    </Frame>
  )
}

/**
 * The office's print, 1.3 x 0.95m in polished brass: three fine rings
 * overlapping across the sheet — one brass, two graphite — and a small sand
 * disc where the last two cross. Off-white on graphite, so it is the room's
 * one bright rectangle.
 */
export function RingPrint() {
  const W = 1.3
  const H = 0.95
  const rings: { x: number; material: Material }[] = [
    { x: -0.22, material: M.graphiteMatte },
    { x: 0, material: M.brass },
    { x: 0.22, material: M.graphiteMatte },
  ]
  return (
    <Frame w={W} h={H} material={M.brass}>
      {rings.map(({ x, material }, i) => (
        <mesh key={x} position={[x, 0.02, 0.001 + i * 0.0005]} material={material}>
          <ringGeometry args={[0.158, 0.17, 96]} />
        </mesh>
      ))}
      <mesh position={[0.11, 0.02, 0.003]} material={M.sand}>
        <circleGeometry args={[0.035, 48]} />
      </mesh>
    </Frame>
  )
}

/**
 * Smoked glass: fully metallic, near-perfectly smooth, and darkened. A bright
 * silvered mirror showed the studio's light as a round spot that read as a
 * light fitting; a rougher one spread it into a glow. Smoked, the reflection
 * stays a small crisp highlight — how real glass catches a lamp — and the
 * mirror reads by its sheen and its brass rim.
 */
const MIRROR = new MeshStandardMaterial({ color: '#8f9497', metalness: 1, roughness: 0.02, envMapIntensity: 0.4 })

/**
 * The bedroom's mirror, 0.9m across, in a slim polished-brass frame. Origin at
 * its bottom, on the wall — so it hangs by the same rule as the prints.
 */
export function RoundMirror({ diameter = 0.9 }: { diameter?: number }) {
  const r = diameter / 2
  return (
    <group position={[0, r, 0]}>
      <mesh position={[0, 0, 0.012]} material={MIRROR}>
        <circleGeometry args={[r - 0.012, 96]} />
      </mesh>
      <mesh position={[0, 0, 0.014]} material={M.brass}>
        <torusGeometry args={[r - 0.008, 0.012, 16, 128]} />
      </mesh>
      {/* A dark backing just proud of the wall, so the edge reads as an object. */}
      <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]} material={M.graphiteDeep}>
        <cylinderGeometry args={[r - 0.02, r - 0.02, 0.01, 96]} />
      </mesh>
    </group>
  )
}
