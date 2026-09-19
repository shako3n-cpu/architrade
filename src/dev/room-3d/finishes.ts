import { Vector3 } from 'three'
import type { RoomId } from './room-types'

/**
 * ============================================================================
 * THE MATERIAL AND COLOUR SWITCHER — THE OPTIONS
 * ----------------------------------------------------------------------------
 * Three things a visitor can change, four choices each, every one of them
 * inside the palette — off-whites, greiges, graphite, and the timber floor:
 *
 *   fabric   the upholstery of the room's main piece — the sofa, the counter
 *            stools, the bed, the desk chair — each room's its own material
 *            (M.upholstery<Room>). Remembered per room: each room has its own
 *            default, and a choice made in one does not repaint the others.
 *   walls    the plain wall paint. The rooms' accent walls — tile, limewash,
 *            the graphite behind the desk — stay what they are.
 *   floor    a grade on the one oak texture, not a second texture: the same
 *            boards limed, as walnut, ebonised. Nothing to download, and a
 *            grade can be faded, where swapping a texture can only cut.
 *
 * `swatch` is what the button shows — the colour as it reads in the room,
 * lit, not the raw material value.
 *
 * Every change fades over ~400ms, in the render loop (see <Finishes> in
 * room-scene.tsx). No scene reload, nothing remounts.
 * ============================================================================
 */

export type FabricId = 'ivory' | 'oat' | 'stone' | 'graphite'
export type WallId = 'chalk' | 'linen' | 'greige' | 'graphite'
export type FloorId = 'smoked' | 'limed' | 'walnut' | 'ebonised'

type Option<Id extends string> = { id: Id; swatch: string }

export const FABRICS: (Option<FabricId> & { color: string; sheen: string })[] = [
  { id: 'ivory', swatch: '#e7e3dc', color: '#e9e6e0', sheen: '#ffffff' },
  { id: 'oat', swatch: '#d2c5b1', color: '#d3c6b1', sheen: '#fff8ec' },
  { id: 'stone', swatch: '#a5a199', color: '#a29e96', sheen: '#d9d7d2' },
  { id: 'graphite', swatch: '#4a4d53', color: '#43464c', sheen: '#8e8f95' },
]

export const WALLS: (Option<WallId> & { color: string })[] = [
  { id: 'chalk', swatch: '#ece9e4', color: '#ebe8e3' },
  { id: 'linen', swatch: '#e6dccc', color: '#e8dccb' },
  { id: 'greige', swatch: '#d0c9be', color: '#d2cbc0' },
  { id: 'graphite', swatch: '#5d6066', color: '#5a5d62' },
]

/**
 * The floor grades, applied to the texture's colour in linear space:
 * saturate by `sat` round its luminance, then × `mul`, + `add`.
 */
export const FLOORS: (Option<FloorId> & { mul: Vector3; add: Vector3; sat: number })[] = [
  { id: 'smoked', swatch: '#8f6440', mul: new Vector3(1, 1, 1), add: new Vector3(0, 0, 0), sat: 1 },
  { id: 'limed', swatch: '#c2b29a', mul: new Vector3(0.62, 0.6, 0.58), add: new Vector3(0.2, 0.175, 0.14), sat: 0.45 },
  { id: 'walnut', swatch: '#5e3f2a', mul: new Vector3(0.5, 0.4, 0.33), add: new Vector3(0, 0, 0), sat: 1.1 },
  { id: 'ebonised', swatch: '#2f2925', mul: new Vector3(0.2, 0.18, 0.17), add: new Vector3(0.004, 0.004, 0.004), sat: 0.5 },
]

/** Each room's own starting upholstery — the colours the rooms were designed in. */
export const DEFAULT_FABRIC: Record<RoomId, FabricId> = {
  living: 'ivory',
  kitchen: 'graphite',
  bedroom: 'graphite',
  office: 'ivory',
}

export const DEFAULT_WALL: WallId = 'chalk'
export const DEFAULT_FLOOR: FloorId = 'smoked'

/** What the switcher shows: the showing room's fabric, and the walls and floor. */
export type Finish = { fabric: FabricId; wall: WallId; floor: FloorId }

/** What the scene is given: every room's fabric, and the walls and floor. */
export type Finishes = { fabric: Record<RoomId, FabricId>; wall: WallId; floor: FloorId }

/**
 * The floor grade's uniforms. One set, shared by the floor material's shader
 * (room.tsx patches them in) and <Finishes>, which fades them.
 */
export const FLOOR_GRADE = {
  uFloorMul: { value: new Vector3(1, 1, 1) },
  uFloorAdd: { value: new Vector3(0, 0, 0) },
  uFloorSat: { value: 1 },
}
