/**
 * ============================================================================
 * THE ROOM'S COLOURS
 * ----------------------------------------------------------------------------
 * Taken from the site's own tokens in index.css, not picked by eye, so the
 * stage reads as part of the page it sits on rather than as an embedded demo.
 *
 * Two families only, as the brief asks: graphite and off-white for every
 * surface, brass for anything metal. The one exception is the plant, which is
 * a muted sage — a plant recoloured graphite stops reading as a plant and
 * starts reading as sculpture, and that is a stranger thing to put in a
 * living room than a single natural green.
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
  floor: '#cdc7be',
  skirting: '#f1eee9',

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

  /** Reflectance, not swatch — see above. Sits between --at-brass-bright and polished brass. */
  brass: '#c9a266',

  /** Lighter than the floor, so the rug reads as a rug and not as a stain. */
  rug: '#d6d0c5',
  rugField: '#dfdad0',

  leaf: '#4c5b46',
  trunk: '#3b342c',
  soil: '#29231e',

  /** The lamp's bulb and the warm light it throws once it is standing. */
  bulb: '#ffe2bd',
  lampLight: '#ffcf96',
} as const
