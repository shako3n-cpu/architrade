import { BackSide, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { PALETTE } from './palette'

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

export const M = {
  wall: new MeshStandardMaterial({ color: PALETTE.wall, roughness: 0.96 }),
  floor: new MeshStandardMaterial({ color: PALETTE.floor, roughness: 0.82 }),
  skirting: new MeshStandardMaterial({ color: PALETTE.skirting, roughness: 0.7 }),

  fabricLight: fabric(PALETTE.fabricLight, '#ffffff'),
  fabricGraphite: fabric(PALETTE.fabricGraphite, '#8e8f95'),

  graphiteMatte: new MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.72 }),

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

  rug: new MeshPhysicalMaterial({
    color: PALETTE.rug,
    roughness: 1,
    sheen: 0.6,
    sheenRoughness: 1,
    sheenColor: '#ffffff',
  }),
  rugField: new MeshPhysicalMaterial({
    color: PALETTE.rugField,
    roughness: 1,
    sheen: 0.6,
    sheenRoughness: 1,
    sheenColor: '#ffffff',
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
