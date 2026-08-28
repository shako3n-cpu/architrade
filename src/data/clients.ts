/**
 * ============================================================================
 * THE REFERENCE WALL
 * ----------------------------------------------------------------------------
 * Who the work was for, shown on the home page under "ვისთვისაც ვმუშაობდით".
 *
 * NAMES, NOT LOGOS — a judgement call worth stating.
 *   Every mark on this list belongs to somebody else. Redrawing a bank's
 *   identity by hand produces something that is not their logo while
 *   claiming to be, which is worse than not showing it at all: a wrong mark
 *   on a reference wall is the kind of detail a client's brand team notices
 *   immediately.
 *
 *   So the wall is set in type. If a licensed logo file is available for a
 *   name, add a `logo` path to its row and the component shows the mark
 *   instead — that is the only change needed, and rows can be converted one
 *   at a time.
 * ============================================================================
 */

export interface Client {
  name: string
  /** Path to a licensed logo file. Falls back to the name set as type. */
  logo?: string
}

export const CLIENTS: readonly Client[] = [
  { name: 'Bank of Georgia' },
  { name: 'TBC Bank' },
  { name: 'Liberty Bank' },
  { name: 'Pasha Bank' },
  { name: 'ProCredit Bank' },
  { name: 'Ministry of Justice' },
  { name: 'House of Justice' },
  { name: 'National Bureau of Enforcement' },
  { name: 'Deloitte' },
  { name: 'Booking.com' },
  { name: 'Samsung' },
  { name: 'Colliers' },
  { name: 'Knauf' },
  { name: 'Regus' },
  { name: 'Caucasus University' },
  { name: 'IDS Borjomi' },
  { name: 'Hilton Garden Inn' },
  { name: 'Ramada Encore' },
  { name: 'Best Western' },
  { name: 'Casino International' },
] as const
