/**
 * ============================================================================
 * THE COMPANY, AS DATA
 * ----------------------------------------------------------------------------
 * archtrade is a contract furniture house: it specifies, supplies and installs
 * furniture, lighting and acoustics for workplaces, hotels and homes. It is
 * not a general contractor, and nothing in this file should read like one.
 *
 * The partner roster, the project list and the client list are the real ones,
 * read off archtrade.ge. What has been narrowed is the SCOPE: the flooring
 * and building-envelope partners the company also carries are kept at the
 * bottom of this file, out of the site, because the site is now about
 * furniture only. Nothing was thrown away — see LINES WE NO LONGER SHOW.
 *
 * WHAT IS AND IS NOT A TRANSLATABLE STRING
 *   Proper nouns are DATA and live here: "Herman Miller" and "Bank of Georgia
 *   Headquarters" are the same words in both languages, and routing them
 *   through the locale files would mean maintaining two identical copies of
 *   sixty names.
 *
 *   Everything a reader could call interface text — service names, sector
 *   headings, discipline badges, city names — is a locale KEY resolved at
 *   render. Cities earn their place there because Tbilisi is თბილისი.
 *
 * ABOUT THE PHOTOGRAPHS
 *   Every URL in this file was opened and looked at beside the thing it is
 *   attached to. A lighting partner has a photograph of lighting on it; an
 *   acoustics partner has a photograph of a booth. That check is the whole
 *   reason this file reads like an inventory.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export type ServiceId = 'workplace' | 'fitOut' | 'lighting' | 'acoustics'

export interface Service {
  id: ServiceId
  /** Interior photography, treated with a graphite scrim behind text. */
  image: string
}

export const SERVICES: readonly Service[] = [
  {
    id: 'workplace',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&q=80',
  },
  {
    id: 'fitOut',
    image: 'https://images.unsplash.com/photo-1682617875405-cf931122be0a?w=1400&q=80',
  },
  {
    id: 'lighting',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1400&q=80',
  },
  {
    id: 'acoustics',
    image: 'https://images.unsplash.com/photo-1594235045856-a6315f0c4083?w=1400&q=80',
  },
] as const

/* -------------------------------------------------------------------------- */
/* How a supply job runs                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Four steps, and they are NUMBERED because they genuinely happen in this
 * order — you cannot ship what has not been specified. Numbering that encodes
 * nothing is decoration; this numbering is the content.
 */
export const PROCESS_STEPS = ['brief', 'specify', 'supply', 'install'] as const

export type ProcessStep = (typeof PROCESS_STEPS)[number]

/* -------------------------------------------------------------------------- */
/* Partner houses                                                             */
/* -------------------------------------------------------------------------- */

export type Discipline =
  | 'office'
  | 'hospitality'
  | 'residential'
  | 'lighting'
  | 'outdoor'
  | 'acoustics'

export const DISCIPLINES: readonly Discipline[] = [
  'office',
  'hospitality',
  'residential',
  'lighting',
  'outdoor',
  'acoustics',
] as const

export interface Brand {
  name: string
  /**
   * One discipline per house, deliberately. Most of these manufacturers make
   * more than one kind of thing, but a card carries one badge and one
   * photograph, and a badge that hedges tells a specifier nothing. The
   * discipline recorded here is the one archtrade leads with.
   */
  discipline: Discipline
  /** Where the house is from. Shown small, under the name. */
  country: string
  /** A room this house's work belongs in. Not their photography. */
  image: string
  /**
   * A licensed logo file, if the office has one. When set, the card shows the
   * mark instead of the wordmark. Left unset everywhere on purpose — see the
   * note on CLIENTS below; the reasoning is identical.
   */
  logo?: string

  /*
   * The two below are UNSET ON EVERY ROW, and that is deliberate rather than
   * unfinished. The brands page renders both the moment they are filled in;
   * neither needs a code change.
   *
   *   website      These are twenty-nine real manufacturers, and a link that
   *                goes to the wrong company — or to a domain that lapsed, or
   *                to the regional site rather than the group one — is worse
   *                on a partner page than no link at all. Several of these
   *                houses have moved domain (Menu trades as Audo Copenhagen)
   *                or run more than one. The office holds the agency
   *                agreements and knows which address each house wants used.
   *
   *   description  A sentence about somebody else's company, written by
   *                someone who does not work there, is how a partner page
   *                acquires a claim its partner did not make. The supplier's
   *                own boilerplate is one email away and is the thing that
   *                should sit here.
   *
   * Fill either in and the card picks it up. There is no ordering
   * requirement — the page is correct with none, some or all of them set.
   */

  /** Official website, absolute URL. Makes the card a link when present. */
  website?: string
  /** One or two sentences, in the supplier's own words. */
  description_en?: string
  description_ka?: string
}

const IMG = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`

export const BRANDS: readonly Brand[] = [
  // ------------------------------------------------------------- Office
  {
    name: 'Herman Miller',
    discipline: 'office',
    country: 'US',
    image: IMG('photo-1688578735352-9a6f2ac3b70a'),
  },
  {
    name: 'Haworth',
    discipline: 'office',
    country: 'US',
    image: IMG('photo-1580480055273-228ff5388ef8'),
  },
  {
    name: 'Andreu World',
    discipline: 'office',
    country: 'ES',
    image: IMG('photo-1764810815228-b7f9432eec5c'),
  },
  {
    name: 'Frezza',
    discipline: 'office',
    country: 'IT',
    image: IMG('photo-1611269154421-4e27233ac5c7'),
  },
  {
    name: 'DVO',
    discipline: 'office',
    country: 'IT',
    image: IMG('photo-1577412647305-991150c7d163'),
  },
  {
    name: 'Fursys',
    discipline: 'office',
    country: 'KR',
    image: IMG('photo-1631193816258-28b44b21e78b'),
  },

  // -------------------------------------------------------- Hospitality
  {
    name: 'Fritz Hansen',
    discipline: 'hospitality',
    country: 'DK',
    image: IMG('photo-1617364852223-75f57e78dc96'),
  },
  {
    name: 'Artifort',
    discipline: 'hospitality',
    country: 'NL',
    image: IMG('photo-1648960456182-00643d5d20eb'),
  },
  {
    name: 'La Cividina',
    discipline: 'hospitality',
    country: 'IT',
    image: IMG('photo-1776362658611-2067c9ded1d1'),
  },
  {
    name: 'Sancal',
    discipline: 'hospitality',
    country: 'ES',
    image: IMG('photo-1616627547584-bf28cee262db'),
  },
  {
    name: 'Figueras',
    discipline: 'hospitality',
    country: 'ES',
    image: IMG('photo-1646215993365-125e6428e1dc'),
  },

  // -------------------------------------------------------- Residential
  {
    name: 'Fredericia',
    discipline: 'residential',
    country: 'DK',
    image: IMG('photo-1687262304525-02287047d4d6'),
  },
  {
    name: 'Muuto',
    discipline: 'residential',
    country: 'DK',
    image: IMG('photo-1742367539759-6e4fc2e39209'),
  },
  {
    name: 'Menu',
    discipline: 'residential',
    country: 'DK',
    image: IMG('photo-1567016376408-0226e4d0c1ea'),
  },
  {
    name: 'Barcelona Design',
    discipline: 'residential',
    country: 'ES',
    image: IMG('photo-1616137148650-4aa14651e02b'),
  },

  // ----------------------------------------------------------- Lighting
  {
    name: 'Marset',
    discipline: 'lighting',
    country: 'ES',
    image: IMG('photo-1513506003901-1e6a229e2d15'),
  },
  {
    name: 'Vibia',
    discipline: 'lighting',
    country: 'ES',
    image: IMG('photo-1553797794-4c4d2c55dbfb'),
  },
  {
    name: 'Gubi',
    discipline: 'lighting',
    country: 'DK',
    image: IMG('photo-1592622515232-6e3e2a0d3d9a'),
  },
  {
    name: '&Tradition',
    discipline: 'lighting',
    country: 'DK',
    image: IMG('photo-1606170033648-5d55a3edf314'),
  },
  {
    name: 'Zumtobel',
    discipline: 'lighting',
    country: 'AT',
    image: IMG('photo-1497366754035-f200968a6e72'),
  },
  {
    name: 'Formalighting',
    discipline: 'lighting',
    country: 'IT',
    image: IMG('photo-1581784878214-8d5596b98a01'),
  },
  {
    name: 'Lamp83',
    discipline: 'lighting',
    country: 'TR',
    image: IMG('photo-1559924508-1461423083c5'),
  },

  // ------------------------------------------------------------ Outdoor
  {
    name: 'Pedrali',
    discipline: 'outdoor',
    country: 'IT',
    image: IMG('photo-1762608675427-09ac2dbd1540'),
  },
  {
    name: 'Magis',
    discipline: 'outdoor',
    country: 'IT',
    image: IMG('photo-1758445041789-1d27c2f21a88'),
  },
  {
    name: 'Enea',
    discipline: 'outdoor',
    country: 'ES',
    image: IMG('photo-1765097732474-973a92d6fb4c'),
  },

  // ---------------------------------------------------------- Acoustics
  {
    name: 'Framery',
    discipline: 'acoustics',
    country: 'FI',
    image: IMG('photo-1756480336914-c282fdc8372b'),
  },
  {
    name: 'Caimi Snowsound',
    discipline: 'acoustics',
    country: 'IT',
    image: IMG('photo-1773127962331-299cf7663a0b'),
  },
  {
    name: 'BuzziSpace',
    discipline: 'acoustics',
    country: 'BE',
    image: IMG('photo-1676477605752-224a26e6ec71'),
  },
  {
    name: 'Cascando',
    discipline: 'acoustics',
    country: 'NL',
    image: IMG('photo-1758800601600-f691cd1ba66d'),
  },
] as const

/**
 * LINES WE NO LONGER SHOW
 *
 * archtrade also represents flooring and building-envelope manufacturers:
 * Milliken, Gerflor, Ege Carpets, Jacaranda, Condor and ntgrate in flooring;
 * Trespa, NBK Keramik, Swisspearl, Flexbrick, Solarlux, Glassline and Maars
 * Living Walls in facades and partitions.
 *
 * They are real partners and they are kept here on purpose so nobody has to
 * find them again. They are off the site because the site is a furniture
 * house now, and a curtain-wall panel on a page about lounge seating is the
 * thing that makes a visitor unsure what they are looking at. Moving one back
 * is a matter of adding a discipline and pasting the row above.
 */

/* -------------------------------------------------------------------------- */
/* Furnished projects                                                         */
/* -------------------------------------------------------------------------- */

export type Sector = 'government' | 'finance' | 'hospitality' | 'enterprise'

export const SECTORS: readonly Sector[] = [
  'government',
  'finance',
  'hospitality',
  'enterprise',
] as const

/** A city key, resolved through `projects.cities.*` in the locale files. */
export type CityKey =
  | 'tbilisi'
  | 'batumi'
  | 'kutaisi'
  | 'kvareli'
  | 'sighnagi'
  | 'marneuli'
  | 'gurjaani'
  | 'akhaltsikhe'
  | 'natakhtari'
  | 'yerevan'

export interface Project {
  name: string
  city: CityKey
}

export interface SectorGroup {
  sector: Sector
  image: string
  projects: readonly Project[]
}

export const PROJECTS: readonly SectorGroup[] = [
  {
    sector: 'government',
    image: IMG('photo-1646215993365-125e6428e1dc'),
    projects: [
      { name: 'House of Justice', city: 'tbilisi' },
      { name: 'Ministry of Justice', city: 'tbilisi' },
      { name: 'House of Justice', city: 'kutaisi' },
      { name: 'House of Justice', city: 'marneuli' },
      { name: 'House of Justice', city: 'gurjaani' },
      { name: 'House of Justice', city: 'akhaltsikhe' },
      { name: "Prosecutors' Office", city: 'tbilisi' },
      { name: 'National Bureau of Enforcement', city: 'tbilisi' },
      { name: 'Techno Park (GITA)', city: 'tbilisi' },
    ],
  },
  {
    sector: 'finance',
    image: IMG('photo-1771270759486-1f7703945072'),
    projects: [
      { name: 'Bank of Georgia Headquarters', city: 'tbilisi' },
      { name: 'Liberty Bank Headquarters', city: 'tbilisi' },
      { name: 'Pasha Bank Headquarters', city: 'tbilisi' },
      { name: 'ProCredit Bank Head Office', city: 'tbilisi' },
      { name: 'Bank Republic', city: 'tbilisi' },
      { name: 'Halyk Bank', city: 'tbilisi' },
      { name: 'Asia Development Bank', city: 'tbilisi' },
    ],
  },
  {
    sector: 'hospitality',
    image: IMG('photo-1759038086832-795644825e3a'),
    projects: [
      { name: 'Hilton Garden Inn', city: 'tbilisi' },
      { name: 'Hotel Moxy', city: 'tbilisi' },
      { name: 'Ramada Encore', city: 'tbilisi' },
      { name: 'Heritage Hotel and Suites', city: 'tbilisi' },
      { name: 'Casino International', city: 'batumi' },
      { name: 'Hotel Le Port', city: 'batumi' },
      { name: 'Hotel Kabadoni', city: 'sighnagi' },
      { name: 'Best Western Hotel', city: 'kutaisi' },
      { name: 'Ministry of Justice Training Center', city: 'kvareli' },
    ],
  },
  {
    sector: 'enterprise',
    image: IMG('photo-1604328698692-f76ea9498e76'),
    projects: [
      { name: 'Booking.com', city: 'tbilisi' },
      { name: 'Deloitte', city: 'tbilisi' },
      { name: 'Samsung', city: 'tbilisi' },
      { name: 'Colliers', city: 'tbilisi' },
      { name: 'Regus', city: 'tbilisi' },
      { name: 'Knauf Head Office', city: 'tbilisi' },
      { name: 'Caucasus University', city: 'tbilisi' },
      { name: 'Embassy of the Netherlands', city: 'tbilisi' },
      { name: 'IDS Borjomi International', city: 'natakhtari' },
      { name: 'Cavea Cinema', city: 'tbilisi' },
      { name: 'Synaptics', city: 'yerevan' },
    ],
  },
] as const

/* -------------------------------------------------------------------------- */
/* Clients                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The reference wall.
 *
 * NAMES, NOT LOGOS — and this one is a judgement call worth stating.
 *   Every mark on this list belongs to somebody else. Redrawing a bank's
 *   identity by hand produces something that is not their logo while claiming
 *   to be, which is worse than not showing it: a wrong mark on a reference
 *   wall is the kind of detail a client's brand team notices immediately.
 *
 *   So the wall is set in type. If the office has licensed logo files, add a
 *   `logo` path to a row and the component will show it instead — that is the
 *   only change needed, and rows can be converted one at a time.
 *
 * Everyone here appears in PROJECTS above, drawn from archtrade.ge, with one
 * exception noted on the row itself.
 */
export interface Client {
  name: string
  sector: Sector
  /** Path to a licensed logo file. Falls back to the name set as type. */
  logo?: string
  /**
   * Rendered height of the FILE, in px — not of the mark inside it.
   *
   * Every file in public/logos/ is the same 240x109 canvas, but the marks
   * sitting on those canvases are not the same size: measured, they run from
   * a 209x39 bank wordmark to a 78x105 square badge. Rendering all sixteen at
   * one height therefore does NOT make them look one size — it makes the
   * badges tower over the wordmarks, which is what a ragged logo wall is.
   *
   * So each file gets the canvas height that puts ITS mark at ~30px tall,
   * capped so nothing grows wider than the cell. That pulls the spread in the
   * rendered marks from 9.0x down to 1.55x.
   *
   * These numbers are measured from the current files. REPLACE A FILE AND
   * THIS NUMBER IS WRONG — re-measure the light-pixel bounding box, or drop
   * the field and accept the ragged version.
   */
  logoHeight?: number
}

/**
 * THESE ARE NOW THE REAL MARKS, AND THEY ARE THE COMPANY'S OWN FILES.
 *   Every file in public/logos/ was copied from archtrade.ge, where this same
 *   reference wall already runs. Nothing here is redrawn — a hand-traced bank
 *   logo is not that bank's logo, and a wrong mark on a reference wall is
 *   exactly the detail a client's brand team notices first.
 *
 * WHY THE LIST GOT SHORTER
 *   It was twenty names in type; it is now the sixteen that archtrade.ge has
 *   a logo file for. Liberty Bank, Pasha Bank, the National Bureau of
 *   Enforcement, Samsung, Regus, Caucasus University and IDS Borjomi came off
 *   — not because the work did not happen, but because a wall that is part
 *   logo and part plain text reads as a wall with holes in it. They are still
 *   in PROJECTS above, which is where the detail belongs. Add a file to
 *   public/logos/ and a row here to put any of them back.
 */
export const CLIENTS: readonly Client[] = [
  // ministry-justice.png and deloitte.png are in public/logos/, and both are
  // BLANK — decoded, the first has no pixel brighter than 28/255 (it is a
  // black rectangle) and the second has 0.48% of its area above 100/255.
  // Pointing at them renders an empty cell, so these two rows carry no `logo`
  // and fall back to the wordmark until a real file replaces them.
  { name: 'Ministry of Justice of Georgia', sector: 'government' },
  { name: 'House of Justice', sector: 'government', logo: '/logos/public-service-hall.png', logoHeight: 38 },
  { name: 'Bank of Georgia', sector: 'finance', logo: '/logos/bank-of-georgia.png', logoHeight: 52 },
  // NOT on archtrade.ge's own project list — added because it was named as a
  // key client. Worth confirming before this goes live: a reference the
  // client cannot corroborate is the one that gets asked about.
  { name: 'TBC Bank', sector: 'finance', logo: '/logos/tbc-bank.png', logoHeight: 53 },
  { name: 'ProCredit Bank', sector: 'finance', logo: '/logos/procredit-bank.png', logoHeight: 54 },
  { name: 'Deloitte', sector: 'enterprise' },
  { name: 'Booking.com', sector: 'enterprise', logo: '/logos/bookingcom.png', logoHeight: 38 },
  { name: 'Colliers', sector: 'enterprise', logo: '/logos/colliers.png', logoHeight: 37 },
  { name: 'Knauf', sector: 'enterprise', logo: '/logos/knauf.png', logoHeight: 36 },
  { name: 'Hilton Garden Inn', sector: 'hospitality', logo: '/logos/hilton-gardeninn.png', logoHeight: 38 },
  { name: 'Ramada Encore', sector: 'hospitality', logo: '/logos/ramada-encore.png', logoHeight: 47 },
  { name: 'Moxy Hotels', sector: 'hospitality', logo: '/logos/hotel-moxy.png', logoHeight: 45 },
  { name: 'Best Western', sector: 'hospitality', logo: '/logos/best-western.png', logoHeight: 45 },
  { name: 'Hotel Kabadoni', sector: 'hospitality', logo: '/logos/hotel-kabadoni.png', logoHeight: 34 },
  { name: 'Le Port Hotel', sector: 'hospitality', logo: '/logos/le-port-1.png', logoHeight: 30 },
  { name: 'Casino International', sector: 'hospitality', logo: '/logos/casino-interntional.png', logoHeight: 31 },
] as const
