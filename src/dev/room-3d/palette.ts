/**
 * ============================================================================
 * THE ROOM'S COLOURS
 * ----------------------------------------------------------------------------
 * Taken from the site's own tokens in index.css, not picked by eye, so the
 * stage reads as part of the page it sits on rather than as an embedded demo.
 *
 * Two families only, as the brief asks: graphite and off-white for every
 * surface, brass for anything metal. Two exceptions. The plant is a muted
 * sage — a plant recoloured graphite stops reading as a plant and starts
 * reading as sculpture, and that is a stranger thing to put in a living room
 * than a single natural green. And the floor is timber: with an off-white
 * floor under off-white walls the corner read as one folded sheet, not as a
 * floor meeting a wall.
 *
 * WHY SOME VALUES ARE NOT THE TOKEN EXACTLY
 *   A swatch on a page is seen flat. The same colour on a lit, shaded surface
 *   comes out darker in most of its pixels, so a few values are nudged a step
 *   lighter than their token to arrive at the token after lighting. Metals are
 *   the other way round: a PBR metal's colour is its REFLECTANCE, and brass's
 *   real reflectance is well above the muted --at-brass swatch, which would
 *   render as bronze sludge.
 * ============================================================================
 */
export const PALETTE = {
  /**
   * The stage. Close to --at-surface (#f2eee6) and rendered through the
   * Neutral tone mapper, which leaves a value this bright almost untouched, so
   * the canvas meets the section's CSS background with no visible seam.
   */
  stage: '#f4f1ec',

  /*
   * Surfaces are held close to NEUTRAL on purpose. The first render used the
   * warm swatches straight, lit them with a warm key light and a warm studio,
   * and the three warmths stacked: the whole room came out peach. The warmth
   * now comes from the light alone — a faint one in the key, a real one in the
   * lamp — and the surfaces stay the off-white and greige they are on the page.
   */
  wall: '#ebe8e3',
  skirting: '#f1eee9',
  /** The cut-back ceiling: the wall's tone, a shade lighter, as a ceiling reads. */
  ceiling: '#f3f0eb',

  /*
   * Each room's wall treatment — see walls.tsx. The living room keeps the
   * plain wall and its framed print.
   */
  /**
   * Office: a graphite accent wall. Lighter and warmer than the ink — at
   * #4a4e54 the wall rendered as near-black navy, heavier than anything in it.
   */
  paintGraphite: '#595c61',
  /** Bedroom: warm limewash — the base, and the lighter and darker clouds in it. */
  limewash: '#d6c5ad',
  limewashLight: '#e2d5c2',
  limewashDark: '#c6b398',
  /** Kitchen: glazed tile, and the grout between. */
  tile: '#e3dbcd',
  grout: '#b4ab9d',

  /**
   * The floor is Poly Haven's wood_floor texture (see room.tsx), a warm
   * smoked oak — the one warm, mid-tone surface in the room, there so the
   * floor and the walls read as two planes rather than one off-white fold.
   * This is the SLAB under it: the cut edge of the architect's model.
   */
  slab: '#cdc7be',

  /** Upholstery. Slightly lighter than --at-background so it lands on it. */
  fabricLight: '#e9e6e0',
  fabricGraphite: '#43464c',

  /**
   * Graphite a step lighter than --at-ink: at #2b2e33 a painted bookcase in
   * shade rendered as a black hole in the wall rather than as a dark finish.
   */
  graphite: '#35383d',
  graphiteDeep: '#212327',

  /** Joinery: a shade under the wall, so the case reads against it. */
  lacquer: '#e3dfd8',

  ceramic: '#efece6',
  sand: '#cfc6b8',
  /**
   * Sand for cloth lying in full light — the throw across the bed. Plain sand
   * there rendered as one more white on white linen.
   */
  sandDeep: '#b4a893',

  /** Reflectance, not swatch — see above. Sits between --at-brass-bright and polished brass. */
  brass: '#c9a266',

  /**
   * The rug's ground: ivory-greige. At #e4dfd6 it rendered as flat white on
   * the timber and the lattice on it all but vanished; a step down, the
   * ground reads as wool and the line as a line.
   */
  rugField: '#dcd5c9',
  /** The rug's knotted lattice — the second of its two tones. */
  rugLine: '#968d7f',
  /** The office rug's ground: graphite, a step lifted, as wool is. */
  rugGraphite: '#3f4247',
  /** The bedroom rug: an ivory ground with a sand band set in from the edge. */
  rugIvory: '#e2dbcf',
  rugBand: '#bcab92',

  /** Oiled oak, for the few small wooden things: a board, spoon handles. */
  oak: '#a88a66',
  /** Fruit, muted: an olive-green pear and a russet one. Nothing bright. */
  pear: '#9d9a62',
  pearRusset: '#9a7c58',

  /** Bed linen: the brightest fabric in the palette, a step above the upholstery. */
  linen: '#f1eee8',

  leaf: '#4c5b46',
  /** An olive's leaf: silvery grey-green, the office's tree — not the living room's fig. */
  oliveLeaf: '#7e8a71',
  trunk: '#3b342c',
  soil: '#29231e',

  /** The lamp's bulb and the warm light it throws once it is standing. */
  bulb: '#ffe2bd',
  lampLight: '#ffcf96',
} as const
