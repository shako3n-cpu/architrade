import { BRAND_COUNT_AT_SEED, CLIENTS, PROJECTS, SECTORS, type Sector } from '@/data/company'

/**
 * ============================================================================
 * THE BOLD LANDING PAGE'S WORDS AND FIGURES
 * ----------------------------------------------------------------------------
 * English only; a demo page, deliberately not wired into the locale files.
 *
 * NOTHING HERE IS INVENTED
 *   Every figure is counted from src/data/company.ts — the data the live site
 *   reads — so it cannot drift from it: the project total, the projects in
 *   each sector, the number of partner houses. The client names are the real
 *   client list, set as type. The headline, the short description and the
 *   four process steps are the site's own approved copy (b2b.hero and
 *   b2b.process in src/locales/en.json). The testimonial is the exception,
 *   and says so on the page.
 * ============================================================================
 */

/** Where every "start a project" goes: the live site's contact page. */
export const CONTACT_PATH = '/en/contact'

const projectTotal = PROJECTS.reduce((n, group) => n + group.projects.length, 0)

export const FIGURES = [
  { value: projectTotal, label: 'Projects furnished', note: 'Ministries, banks, hotels and headquarters' },
  { value: BRAND_COUNT_AT_SEED, label: 'Partner houses', note: 'European and American manufacturers' },
  { value: SECTORS.length, label: 'Sectors served', note: 'Government, finance, hospitality, enterprise' },
] as const

const SECTOR_NAMES: Record<Sector, string> = {
  government: 'Government',
  finance: 'Finance',
  hospitality: 'Hospitality',
  enterprise: 'Enterprise',
}

/** Projects furnished in each sector, counted from the project list. */
export const SECTOR_COUNTS = SECTORS.map((sector) => ({
  name: SECTOR_NAMES[sector],
  count: PROJECTS.find((group) => group.sector === sector)?.projects.length ?? 0,
}))

/** The whole client list, in its own order: it runs as a marquee. */
export const CLIENT_NAMES = CLIENTS.map((client) => client.name)

export const DISCIPLINES = ['Workplace', 'Hospitality', 'Residential', 'Lighting', 'Outdoor', 'Acoustics'] as const

export const STEPS = [
  {
    name: 'Brief',
    body: 'The drawings, the headcount, the budget and the handover date — including the constraints nobody put in writing.',
  },
  {
    name: 'Specify',
    body: 'A named schedule: house, model, finish, fabric and quantity, with samples in your hands before anything is ordered.',
  },
  {
    name: 'Supply',
    body: 'Ordered from the factory, tracked through transit and held in our warehouse until the floor is ready to receive it.',
  },
  {
    name: 'Install',
    body: 'Delivered, built and placed to the layout, with snagging closed and the warranty documents a facilities team actually needs.',
  },
] as const
