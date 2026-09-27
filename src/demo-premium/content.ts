import { BRAND_COUNT_AT_SEED, CLIENTS, PROJECTS, SECTORS } from '@/data/company'

/**
 * ============================================================================
 * THE LANDING PAGE'S WORDS AND FIGURES
 * ----------------------------------------------------------------------------
 * English only: this is a demo page, deliberately not wired into the site's
 * locale files.
 *
 * NOTHING HERE IS INVENTED
 *   Every figure is counted from src/data/company.ts, the same data the live
 *   site reads, so it cannot drift from it. The client names are the real
 *   client list, set as type. The four process steps are the site's own
 *   approved copy. The one exception is the testimonial, which is marked as
 *   a placeholder on the page itself and waits for a real client quote.
 * ============================================================================
 */

/** Where every "start a project" on the page goes: the live site's contact page. */
export const CONTACT_PATH = '/en/contact'

export const FIGURES = [
  { value: PROJECTS.reduce((n, group) => n + group.projects.length, 0), label: 'Projects furnished' },
  { value: BRAND_COUNT_AT_SEED, label: 'Partner houses' },
  { value: SECTORS.length, label: 'Sectors served' },
] as const

/** A selection from the real client list, in the order they are set. */
const SHOWN_CLIENTS = [
  'Bank of Georgia',
  'Booking.com',
  'Hilton Garden Inn',
  'Deloitte',
  'TBC Bank',
  'Moxy Hotels',
  'Knauf',
  'Ministry of Justice of Georgia',
]
export const CLIENT_NAMES = SHOWN_CLIENTS.filter((name) => CLIENTS.some((client) => client.name === name))

export const DISCIPLINES = [
  ['Workplace', 'Task seating, desking, storage'],
  ['Hospitality', 'Lobbies, rooms, restaurants'],
  ['Residential', 'Living, dining, bedroom'],
  ['Lighting', 'Technical and decorative'],
  ['Outdoor', 'Terraces and courtyards'],
  ['Acoustics', 'Panels, baffles, pods'],
] as const

/** The site's own process copy (b2b.process in src/locales/en.json). */
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
