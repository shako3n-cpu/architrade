import type { RoomId } from './room-types'

/**
 * ============================================================================
 * PRODUCT HOTSPOTS — THE CONFIG
 * ----------------------------------------------------------------------------
 * room -> the pieces in it that carry a gold dot. Each entry is:
 *
 *   id     stable, used for DOM ids and aria wiring
 *   item   the piece's name, as the i18n key `room3d.item.<item>`
 *   at     where the dot sits, in world metres — on the piece, at rest
 *          (the layouts are in rooms.tsx; move a piece, move its dot)
 *   slug   a REAL catalog product's slug, or null
 *
 * WHERE THE CARD'S TEXT COMES FROM
 *   With a slug, everything on the card is the live catalog's own: the
 *   product's title as the model, the first sentence of its description,
 *   its brand from the brands table, and a link to /product/<slug>. Nothing
 *   here repeats or invents any of it.
 *
 *   With null there is no catalog product to show, and the card says so: it
 *   is a clearly marked TODO placeholder with the piece's generic name and a
 *   link to the catalog index. Never fill one in by hand with a brand or a
 *   model — add the product to the catalog, then put its slug here.
 *
 * WHICH PRODUCTS, AND HOW CLOSE
 *   Every slug below was checked against the live products table (not
 *   archived, not deleted). They are the catalog's own nearest piece for
 *   each role, not a model of the exact object on screen: the room's bed is
 *   upholstered, the catalog's bed is solid oak, and so on. The pieces with
 *   no product at all are the lighting and the kitchen island — the catalog
 *   has no lighting and no kitchen joinery. And no live product has a brand
 *   recorded yet, so every card's brand line is a TODO until the office sets
 *   brand_id in the dashboard.
 * ============================================================================
 */

export type Hotspot = {
  id: string
  item: string
  at: [number, number, number]
  slug: string | null
}

export const HOTSPOTS: Record<RoomId, Hotspot[]> = {
  living: [
    { id: 'living-sofa', item: 'sofa', at: [0.72, 0.56, -1.72], slug: 'modern-sofa' },
    { id: 'living-armchair', item: 'armchair', at: [1.92, 0.72, 0.36], slug: 'lume-armchair' },
    { id: 'living-coffee-table', item: 'coffeeTable', at: [0.3, 0.41, -0.1], slug: 'orbit-coffee-table' },
    { id: 'living-floor-lamp', item: 'floorLamp', at: [-0.5, 1.9, -0.84], slug: null },
  ],
  kitchen: [
    { id: 'kitchen-island', item: 'island', at: [0, 0.94, 0.15], slug: null },
    { id: 'kitchen-stool', item: 'stool', at: [0.7, 0.7, 0.62], slug: 'kalo-drafting-stool' },
    { id: 'kitchen-pendant', item: 'pendant', at: [0.75, 1.72, 0.1], slug: null },
  ],
  bedroom: [
    { id: 'bedroom-bed', item: 'bed', at: [0.45, 0.68, -0.9], slug: 'wooden-bed' },
    { id: 'bedroom-nightstand', item: 'nightstand', at: [1.46, 0.4, -2], slug: 'mira-nightstand' },
    { id: 'bedroom-sideboard', item: 'sideboard', at: [-2.45, 0.5, -0.4], slug: 'iveria-sideboard' },
    { id: 'bedroom-table-lamp', item: 'tableLamp', at: [-1.34, 1, -2.22], slug: null },
  ],
  office: [
    { id: 'office-desk', item: 'desk', at: [0.45, 0.78, -0.55], slug: 'arco-writing-desk' },
    { id: 'office-desk-chair', item: 'deskChair', at: [-0.02, 0.6, 0], slug: 'alta-executive-chair' },
    { id: 'office-shelving', item: 'shelving', at: [-2.5, 1.25, -1.05], slug: 'folio-bookcase' },
    { id: 'office-desk-lamp', item: 'deskLamp', at: [-0.6, 1.2, -0.8], slug: null },
  ],
}

/** Every slug any room uses — fetched together, once. */
export const HOTSPOT_SLUGS = [
  ...new Set(
    Object.values(HOTSPOTS)
      .flat()
      .map((h) => h.slug)
      .filter((slug): slug is string => slug !== null),
  ),
]

/** A hotspot by id, whichever room it is in. */
export const HOTSPOT_BY_ID = new Map(
  Object.values(HOTSPOTS)
    .flat()
    .map((h) => [h.id, h] as const),
)
