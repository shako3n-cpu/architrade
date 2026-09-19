import type { ComponentType } from 'react'
import { Bedroom, Kitchen, LivingRoom, Office } from './rooms'
import type { ArmchairMode, RoomId } from './room-types'

/**
 * Each room's layout (rooms.tsx), and how many pieces it has.
 *
 * `pieces` must be the number of DropIns in the layout: it sets the order the
 * room clears in — last in, first out — and how long clearing takes before
 * the next room can arrive (leaveSpan in furnish-clock.ts).
 */
export const ROOMS: Record<RoomId, { pieces: number; Layout: ComponentType<{ armchair: ArmchairMode }> }> = {
  living: { pieces: 11, Layout: LivingRoom },
  kitchen: { pieces: 5, Layout: Kitchen },
  bedroom: { pieces: 5, Layout: Bedroom },
  office: { pieces: 5, Layout: Office },
}
