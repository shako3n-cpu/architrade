import { BackSide, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, type Texture } from 'three'
import { PALETTE } from './palette'
import { rugTexture } from './rug-pattern'

/**
 * ============================================================================
 * MATERIALS
 * ----------------------------------------------------------------------------
 * One instance of each, shared by every mesh that wears it. Module-level on
 * purpose: this file is only ever loaded by the dev route, it never unmounts
 * in a way that matters, and sharing means the renderer compiles each shader
 * once rather than once per cushion.
 *
 * THE LOOK IS "MATTE, WITH ONE METAL"
 *   Everything except brass is rough — upholstery, plaster, ceramic, stone —
 *   because that is what makes a render read as photographed rather than as
 *   plastic. The highlights are left to the brass and to a little clearcoat on
 *   the stone, which gives the eye somewhere to land.
 *
 * FABRIC IS MeshPhysicalMaterial FOR THE SHEEN
 *   Sheen is the soft bright rim a woven or bouclé surface picks up at grazing
 *   angles. It is the single cheapest thing that stops a sofa looking like a
 *   rounded box painted beige.
 * ============================================================================
 */

const fabric = (color: string, sheenColor: string) =>
  new MeshPhysicalMaterial({
    color,
    roughness: 0.92,
    sheen: 1,
    sheenRoughness: 0.8,
    sheenColor,
  })

/**
 * Wool pile: fully rough, with a soft sheen. A texture, when given, is its
 * colour and its bump. The sheen is tinted to the wool: a white sheen on the
 * graphite rug, seen at the camera's shallow angle, washed it out to a pale
 * grey — the same reason the graphite upholstery's sheen is grey.
 */
const rugWool = (color: string, sheenColor: string, texture?: Texture) =>
  new MeshPhysicalMaterial({
    color,
    map: texture ?? null,
    bumpMap: texture ?? null,
    bumpScale: 1.5,
    roughness: 1,
    sheen: 0.6,
    sheenRoughness: 1,
    sheenColor,
  })

export const M = {
  wall: new MeshStandardMaterial({ color: PALETTE.wall, roughness: 0.96 }),
  /** The floor slab's cut edge. The floor's top face is timber — see room.tsx. */
  slab: new MeshStandardMaterial({ color: PALETTE.slab, roughness: 0.82 }),
  skirting: new MeshStandardMaterial({ color: PALETTE.skirting, roughness: 0.7 }),

  fabricLight: fabric(PALETTE.fabricLight, '#ffffff'),
  fabricGraphite: fabric(PALETTE.fabricGraphite, '#8e8f95'),

  graphiteMatte: new MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.72 }),
  /** Recessed plinths and castors — the parts meant to disappear into shadow. */
  graphiteDeep: new MeshStandardMaterial({ color: PALETTE.graphiteDeep, roughness: 0.8 }),

  /**
   * Off-white lacquer, for joinery. The bookcase was graphite first and was
   * the heaviest thing in the frame by far — a dark case in shade reads as a
   * hole in the wall. Built-in joinery in the wall's own colour is what a
   * high-end interior actually does, and it lets the books be the pattern.
   */
  lacquer: new MeshPhysicalMaterial({
    color: PALETTE.lacquer,
    roughness: 0.45,
    clearcoat: 0.3,
    clearcoatRoughness: 0.35,
  }),

  /** Honed stone — the coffee table top, the lamp base. */
  graphiteStone: new MeshPhysicalMaterial({
    color: PALETTE.graphiteDeep,
    roughness: 0.42,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
  }),

  ceramic: new MeshPhysicalMaterial({
    color: PALETTE.ceramic,
    roughness: 0.55,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
  }),

  sand: new MeshStandardMaterial({ color: PALETTE.sand, roughness: 0.85 }),

  /** Polished — bowls, the lamp arc. */
  brass: new MeshStandardMaterial({ color: PALETTE.brass, metalness: 1, roughness: 0.26 }),
  /** Brushed — legs and rods, where a mirror finish would look cheap. */
  brassBrushed: new MeshStandardMaterial({ color: PALETTE.brass, metalness: 1, roughness: 0.4 }),

  /** The ivory rug's cut edge: its ground colour, plain. */
  rug: rugWool(PALETTE.rugField, '#ffffff'),
  /**
   * The ivory rug's face: the knotted lattice from rug-pattern.ts, which is
   * also its bump map, so the lines sit a hair below the pile. White base
   * colour — the texture carries both tones.
   */
  rugFace: rugWool('#ffffff', '#ffffff', rugTexture('lattice')),

  /** The office rug: graphite with a sand line — edge, then face. */
  rugGraphite: rugWool(PALETTE.rugGraphite, '#5c5e63'),
  rugGraphiteFace: rugWool('#ffffff', '#5c5e63', rugTexture('border')),

  /** Bed linen — fabric with sheen, the brightest one. */
  linen: fabric(PALETTE.linen, '#ffffff'),
  /** A cushion, a notebook: the palette's one warm neutral, as cloth. */
  fabricSand: fabric(PALETTE.sand, '#ffffff'),
  /** The bed's throw: the same sand, a step deeper for full light. */
  fabricSandDeep: fabric(PALETTE.sandDeep, '#ffffff'),

  /** Pale honed stone — the kitchen island's top. */
  paleStone: new MeshPhysicalMaterial({
    color: '#ebe7e0',
    roughness: 0.38,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
  }),

  /** The sink's basin, read as a recess: matte and near-black. */
  basin: new MeshStandardMaterial({ color: '#1a1b1e', roughness: 0.6 }),

  /** Black glass: the hob, the laptop's screen. */
  blackGlass: new MeshPhysicalMaterial({
    color: '#16181b',
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  }),

  leaf: new MeshStandardMaterial({ color: PALETTE.leaf, roughness: 0.55 }),
  trunk: new MeshStandardMaterial({ color: PALETTE.trunk, roughness: 0.85 }),
  soil: new MeshStandardMaterial({ color: PALETTE.soil, roughness: 1 }),

  /**
   * The lamp shade. The outside is plain off-white; the INSIDE is a separate
   * material on the back faces that glows, so the shade reads as lit from
   * within without the whole thing turning into a light bulb.
   */
  shadeOuter: new MeshStandardMaterial({ color: PALETTE.ceramic, roughness: 0.9 }),
  shadeInner: new MeshStandardMaterial({
    color: PALETTE.ceramic,
    roughness: 0.9,
    emissive: PALETTE.bulb,
    emissiveIntensity: 0,
    side: BackSide,
  }),

  /**
   * Above 1.0 on purpose so bloom catches it, and excluded from tone mapping
   * so the Neutral curve does not pull it back down before bloom sees it.
   */
  bulb: new MeshStandardMaterial({
    color: '#000000',
    emissive: PALETTE.bulb,
    emissiveIntensity: 0,
    toneMapped: false,
  }),

  /** Flat art on the wall — both faces, since it is a plane. */
  print: new MeshStandardMaterial({ color: PALETTE.ceramic, roughness: 0.95, side: DoubleSide }),
}

/**
 * Book spines, in the order they cycle along a shelf. Enough variety to read
 * as a real shelf; all of it inside the palette, so it reads as styled.
 */
export const BOOK_MATERIALS = [
  new MeshStandardMaterial({ color: PALETTE.ceramic, roughness: 0.8 }),
  new MeshStandardMaterial({ color: PALETTE.sand, roughness: 0.8 }),
  new MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.7 }),
  new MeshStandardMaterial({ color: '#8c6d46', roughness: 0.65 }),
  new MeshStandardMaterial({ color: '#b9ad9a', roughness: 0.8 }),
  new MeshStandardMaterial({ color: '#4a4d52', roughness: 0.7 }),
]

