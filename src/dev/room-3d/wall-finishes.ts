import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { PALETTE } from './palette'
import { CROWN_HEIGHT, ROOM, SKIRTING } from './room-geometry'
import { limewashTexture, TILE_SHEET, tileTexture } from './wall-textures'

/**
 * ============================================================================
 * THE WALL FINISHES THEMSELVES — the materials, and how they follow the wall
 * ----------------------------------------------------------------------------
 * <WallTreatment> in walls.tsx puts these on the wall; this module owns what
 * they are made of. Apart so that walls.tsx exports a component and nothing
 * else, which is what Fast Refresh needs of it.
 * ============================================================================
 */

export type WallFinish = 'graphite' | 'limewash' | 'tile'

/** Where paint starts and stops: above the skirting, below the crown. */
export const PAINTED: [number, number] = [SKIRTING.height, ROOM.wallHeight - CROWN_HEIGHT]
const PAINTED_WIDTH = 2 * ROOM.halfWidth
const PAINTED_HEIGHT = PAINTED[1] - PAINTED[0]

/*
 * Transparent from the start, and always: three builds a different shader
 * for an opaque material, so switching `transparent` at the end of the fade
 * would recompile it mid-room.
 */
export const FINISHES: Record<WallFinish, { material: MeshStandardMaterial; sheet?: { width: number; height: number } }> = {
  graphite: {
    material: new MeshStandardMaterial({ color: PALETTE.paintGraphite, roughness: 0.93, transparent: true, opacity: 0 }),
  },
  limewash: {
    material: new MeshStandardMaterial({
      color: '#ffffff',
      map: limewashTexture(PAINTED_WIDTH, PAINTED_HEIGHT),
      bumpMap: limewashTexture(PAINTED_WIDTH, PAINTED_HEIGHT),
      bumpScale: 0.6,
      roughness: 0.97,
      transparent: true,
      opacity: 0,
    }),
  },
  tile: {
    material: new MeshPhysicalMaterial({
      color: '#ffffff',
      map: tileTexture(),
      bumpMap: tileTexture(),
      bumpScale: 1.2,
      roughness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      transparent: true,
      opacity: 0,
    }),
    sheet: TILE_SHEET,
  },
}

/* -------------------------------------------------------------------------- */
/* The finishes follow the wall swatch                                        */
/* -------------------------------------------------------------------------- */

/**
 * A FINISH IS A RELATIONSHIP TO THE WALL, NOT A FIXED COLOUR
 *
 * The bedroom's limewash and the office's graphite were picked against the
 * default wall (PALETTE.wall): warmer and a little deeper than it, and much
 * darker than it, respectively. Left as fixed colours they ignored the wall
 * swatch — choose greige or navy and only the untreated walls moved, which
 * reads, fairly, as the swatch half-working.
 *
 * So each finish keeps the RATIO it had to the wall it was chosen against,
 * and is multiplied through by whatever the wall is now. At the default
 * swatch every finish comes out at exactly its old colour; at any other, it
 * moves by as much as the walls did, and the room keeps its accent instead of
 * flattening into one tone.
 *
 * The tile is left out on purpose: glazed ceramic is a material, not a finish
 * over the wall, and its own white is what makes it read as tile.
 */
const BASE_WALL = new Color(PALETTE.wall)
const BASE_GRAPHITE = new Color(PALETTE.paintGraphite)

/**
 * How dark a finish may get, in linear light. The ratio alone would take the
 * graphite to near-black over the darkest swatch — a hole in the wall rather
 * than a wall, which is the mistake PALETTE.paintGraphite already warns about.
 */
const FLOOR = 0.021

const shifted = (base: number, chosen: number, reference: number) => Math.max((base * chosen) / reference, FLOOR)

/** Called every frame by <FinishFades> with the wall colour as it fades. */
export function tintWallFinishes(r: number, g: number, b: number) {
  FINISHES.graphite.material.color.setRGB(
    shifted(BASE_GRAPHITE.r, r, BASE_WALL.r),
    shifted(BASE_GRAPHITE.g, g, BASE_WALL.g),
    shifted(BASE_GRAPHITE.b, b, BASE_WALL.b),
  )
  // The limewash's tone is in its texture, which the colour multiplies: white
  // leaves it as painted, so the ratio alone is the colour.
  FINISHES.limewash.material.color.setRGB(r / BASE_WALL.r, g / BASE_WALL.g, b / BASE_WALL.b)
}
