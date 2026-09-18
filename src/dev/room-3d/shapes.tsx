import { useMemo } from 'react'
import { Quaternion, Vector3, type Material } from 'three'

/**
 * Small geometric helpers shared by the procedural pieces of every room.
 */

const UP = new Vector3(0, 1, 0)

/**
 * A round rod from one point to another — a stool's leg, a lamp's arm, a
 * tap's riser. Built as a cylinder about its own middle and turned to lie
 * along the segment, so the pieces can be described by their joints.
 */
export function Rod({
  from,
  to,
  radius,
  radiusTo = radius,
  material,
  segments = 16,
}: {
  from: [number, number, number]
  to: [number, number, number]
  radius: number
  /** Radius at `to`, for a taper. */
  radiusTo?: number
  material: Material
  segments?: number
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from)
    const b = new Vector3(...to)
    const dir = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    }
    // Compared by value: the call sites pass literal arrays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...from, ...to])

  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      {/* CylinderGeometry's first radius is the TOP, which is `to`. */}
      <cylinderGeometry args={[radiusTo, radius, length, segments]} />
    </mesh>
  )
}
