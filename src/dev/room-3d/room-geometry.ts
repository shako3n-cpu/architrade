/**
 * The empty room's dimensions, shared by the shell (room.tsx) and anything
 * applied to its walls (walls.tsx). Metres.
 *
 *   floor     x -3 .. 3,  z -2.5 .. 2.5, top face at y = 0
 *   back wall inner face at z = -2.5
 *   left wall inner face at x = -3
 *   ceiling   underside at y = 2.8
 */
export const ROOM = {
  halfWidth: 3,
  halfDepth: 2.5,
  wallHeight: 2.8,
  wallThickness: 0.14,
  slabThickness: 0.14,
} as const

/** Skirting board: height, and how far it stands proud of the wall. */
export const SKIRTING = { height: 0.09, depth: 0.016 } as const

/**
 * The crown moulding where wall meets ceiling: a flat band with a deeper
 * step above it. Its total height is where a wall treatment has to stop.
 */
export const CROWN = { band: 0.1, bandDepth: 0.016, step: 0.045, stepDepth: 0.036 } as const
export const CROWN_HEIGHT = CROWN.band + CROWN.step

/**
 * The ceiling, cut back like the walls: a slab this deep along the two
 * walls, not across the room — see room.tsx for why.
 */
export const CEILING = { depth: 0.34, thickness: 0.1 } as const
