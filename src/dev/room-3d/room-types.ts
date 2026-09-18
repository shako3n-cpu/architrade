/** The four room presets, in the order the switch shows them. The first is the default. */
export const ROOM_IDS = ['living', 'kitchen', 'bedroom', 'office'] as const

export type RoomId = (typeof ROOM_IDS)[number]

/**
 * Which armchair the living room shows — see polyhaven.tsx. The Poly Haven
 * model, dressed in the palette, is the default; the procedural chair and the
 * model as downloaded remain reachable through `?armchair=` for comparison.
 */
export type ArmchairMode = 'polyhaven' | 'procedural' | 'polyhaven-raw'
