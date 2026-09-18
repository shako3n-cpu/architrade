import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import {
  dropPose,
  FurnishContext,
  leaveScale,
  PieceContext,
  poseProgress,
  usePieceClock,
  type FurnishClock,
} from './furnish-clock'

/** Hands the shared clock to every piece. See furnish-clock.ts for the timing. */
export function FurnishProvider({
  start,
  leave,
  count,
  reduced,
  children,
}: FurnishClock & { children: ReactNode }) {
  return <FurnishContext.Provider value={{ start, leave, count, reduced }}>{children}</FurnishContext.Provider>
}

/**
 * One piece of furniture, animated into place — and, when the room changes,
 * back out of it along the same path.
 *
 * `children` must be built with their origin at the piece's BASE — the point
 * that touches the floor (or the wall, for the print; the ceiling, for a
 * pendant). The squash scales about that origin, so a piece squashes into the
 * floor rather than about its own middle, which is what makes the landing
 * read as weight.
 */
export function DropIn({
  index,
  position,
  rotationY = 0,
  height = 1.7,
  spin = 0.32,
  children,
}: {
  index: number
  position: [number, number, number]
  rotationY?: number
  /** How far above its resting place the piece appears. */
  height?: number
  /** Radians of turn it starts with and unwinds. Sign sets the direction. */
  spin?: number
  children: ReactNode
}) {
  const group = useRef<Group>(null)
  const clock = usePieceClock(index)

  // Every mesh in a piece casts and receives shadow. Done once here rather than
  // repeated as two props on every mesh in furniture.tsx.
  useLayoutEffect(() => {
    group.current?.traverse((object) => {
      if ((object as Mesh).isMesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
  }, [])

  useFrame(() => {
    const g = group.current
    if (!g) return

    const pose = dropPose(poseProgress(clock), height, spin)

    /*
     * NOT `visible = false` WHILE WAITING.
     *
     * An invisible object is skipped by the renderer, so its shaders are not
     * compiled until the frame it first appears — which is mid-animation, and
     * shows up as a hitch exactly when the eye is on it. Shrunk to nothing it
     * is still drawn, so everything compiles during the lead-in on an empty
     * room.
     */
    const s = pose.hidden ? 1e-4 : Math.max(leaveScale(clock.leave()), 1e-4)

    g.position.set(position[0], position[1] + pose.y, position[2])
    g.rotation.set(pose.tilt, rotationY + pose.yaw, pose.tilt * 0.6)
    g.scale.set(s * (1 + pose.squash * 0.5), s * (1 - pose.squash), s * (1 + pose.squash * 0.5))
  })

  // Starts shrunk, so the single frame before useFrame first runs cannot flash
  // the whole furnished room.
  return (
    <group ref={group} position={position} scale={1e-4}>
      <PieceContext.Provider value={clock}>{children}</PieceContext.Provider>
    </group>
  )
}
