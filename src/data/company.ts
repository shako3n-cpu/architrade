/**
 * ============================================================================
 * THE COMPANY, AS DATA
 * ----------------------------------------------------------------------------
 * What archtrade does, who it represents, and what it has built. Everything
 * here came off archtrade.ge — the services, the brand roster and the project
 * list are the real ones, not placeholders.
 *
 * WHAT IS AND IS NOT A TRANSLATABLE STRING
 *   Proper nouns are DATA and live here: "Herman Miller" and "Bank of Georgia
 *   Headquarters" are the same words in both languages, and routing them
 *   through the locale files would mean maintaining two identical copies of
 *   sixty names.
 *
 *   Everything a reader could call interface text — service names, the sector
 *   headings, the discipline filters, city names — is a locale KEY resolved at
 *   render. Cities earn their place there because Tbilisi is თბილისი.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export type ServiceId =
  | 'construction'
  | 'fitOut'
  | 'envelope'
  | 'trading'

export interface Service {
  id: ServiceId
  /** Architectural photography, treated with a graphite scrim behind text. */
  image: string
}

export const SERVICES: readonly Service[] = [
  {
    id: 'construction',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80',
  },
  {
    id: 'fitOut',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
  },
  {
    id: 'envelope',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80',
  },
  {
    id: 'trading',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80',
  },
] as const

/* -------------------------------------------------------------------------- */
/* How a project runs                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Four steps, and they are NUMBERED because they genuinely happen in this
 * order — you cannot construct before you plan. Numbering that encodes nothing
 * is decoration; this numbering is the content.
 */
export const PROCESS_STEPS = ['listen', 'plan', 'construct', 'deliver'] as const

export type ProcessStep = (typeof PROCESS_STEPS)[number]

/* -------------------------------------------------------------------------- */
/* Solution partners                                                          */
/* -------------------------------------------------------------------------- */

export type Discipline = 'furniture' | 'lighting' | 'flooring' | 'facades' | 'acoustics'

export const DISCIPLINES: readonly Discipline[] = [
  'furniture',
  'lighting',
  'flooring',
  'facades',
  'acoustics',
] as const

export interface Brand {
  name: string
  discipline: Discipline
  /** Where the house is from. Shown small, under the name. */
  country: string
}

/**
 * The real roster, read off the partner walls on archtrade.ge.
 *
 * No logo files. Sixty logos at sixty different weights and crops is the mess
 * every partner wall becomes, and licensing somebody else's mark to decorate a
 * page is a conversation nobody wants. Set as type, at one size, the wall
 * reads as an index — which is what it is.
 */
export const BRANDS: readonly Brand[] = [
  // Furniture
  { name: 'Herman Miller', discipline: 'furniture', country: 'US' },
  { name: 'Haworth', discipline: 'furniture', country: 'US' },
  { name: 'Fritz Hansen', discipline: 'furniture', country: 'DK' },
  { name: 'Fredericia', discipline: 'furniture', country: 'DK' },
  { name: 'Muuto', discipline: 'furniture', country: 'DK' },
  { name: 'Menu', discipline: 'furniture', country: 'DK' },
  { name: 'Andreu World', discipline: 'furniture', country: 'ES' },
  { name: 'Sancal', discipline: 'furniture', country: 'ES' },
  { name: 'Barcelona Design', discipline: 'furniture', country: 'ES' },
  { name: 'Magis', discipline: 'furniture', country: 'IT' },
  { name: 'Pedrali', discipline: 'furniture', country: 'IT' },
  { name: 'La Cividina', discipline: 'furniture', country: 'IT' },
  { name: 'Frezza', discipline: 'furniture', country: 'IT' },
  { name: 'DVO', discipline: 'furniture', country: 'IT' },
  { name: 'Artifort', discipline: 'furniture', country: 'NL' },
  { name: 'Enea', discipline: 'furniture', country: 'ES' },
  { name: 'Figueras', discipline: 'furniture', country: 'ES' },
  { name: 'Fursys', discipline: 'furniture', country: 'KR' },

  // Lighting
  { name: 'Marset', discipline: 'lighting', country: 'ES' },
  { name: 'Vibia', discipline: 'lighting', country: 'ES' },
  { name: 'Gubi', discipline: 'lighting', country: 'DK' },
  { name: '&Tradition', discipline: 'lighting', country: 'DK' },
  { name: 'Zumtobel', discipline: 'lighting', country: 'AT' },
  { name: 'Formalighting', discipline: 'lighting', country: 'IT' },
  { name: 'Lamp83', discipline: 'lighting', country: 'TR' },

  // Flooring
  { name: 'Milliken', discipline: 'flooring', country: 'US' },
  { name: 'Gerflor', discipline: 'flooring', country: 'FR' },
  { name: 'Ege Carpets', discipline: 'flooring', country: 'DK' },
  { name: 'Jacaranda', discipline: 'flooring', country: 'GB' },
  { name: 'Condor', discipline: 'flooring', country: 'NL' },
  { name: 'ntgrate', discipline: 'flooring', country: 'BE' },

  // Façades and building envelope
  { name: 'Trespa', discipline: 'facades', country: 'NL' },
  { name: 'NBK Keramik', discipline: 'facades', country: 'DE' },
  { name: 'Swisspearl', discipline: 'facades', country: 'CH' },
  { name: 'Flexbrick', discipline: 'facades', country: 'ES' },
  { name: 'Solarlux', discipline: 'facades', country: 'DE' },
  { name: 'Glassline', discipline: 'facades', country: 'DE' },
  { name: 'Maars Living Walls', discipline: 'facades', country: 'NL' },

  // Acoustics
  { name: 'Framery', discipline: 'acoustics', country: 'FI' },
  { name: 'Caimi Snowsound', discipline: 'acoustics', country: 'IT' },
  { name: 'BuzziSpace', discipline: 'acoustics', country: 'BE' },
  { name: 'Cascando', discipline: 'acoustics', country: 'NL' },
] as const

/* -------------------------------------------------------------------------- */
/* Delivered projects                                                         */
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
    image: 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?w=1400&q=80',
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
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&q=80',
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
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80',
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
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80',
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
