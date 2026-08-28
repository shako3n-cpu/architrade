/**
 * ============================================================================
 * THE REFERENCE WALL
 * ----------------------------------------------------------------------------
 * Who the work was for, shown on the home page under "ვისთვისაც ვმუშაობდით".
 *
 * THE LOGO FILES
 *   Every mark in public/logos/ is the company's own asset, copied from
 *   archtrade.ge where this same reference wall already runs. They are not
 *   redrawn: a hand-traced bank logo is not that bank's logo, and a wrong
 *   mark on a reference wall is exactly the detail a client's brand team
 *   notices. If a client ever asks to be removed, delete the row — the
 *   component needs no other change.
 *
 * WHY NAMES LIVE HERE AND NOT IN THE LOCALE FILES
 *   These are proper nouns: "Deloitte" and "Booking.com" are the same words
 *   in Georgian and in English, and routing them through ka.json / en.json
 *   would mean maintaining two identical copies of sixteen names. The name
 *   is used as the image's alt text, so it still reaches a screen reader.
 *
 * ORDER
 *   Government and banking first, then hospitality, then the international
 *   corporates — the same order the marks run in on archtrade.ge.
 * ============================================================================
 */

export interface Client {
  /** Also the image's alt text, so it must read as the company's real name. */
  name: string
  /** Path under public/. Palette PNG on a white ground — see the component. */
  logo: string
}

export const CLIENTS: readonly Client[] = [
  { name: 'Ministry of Justice of Georgia', logo: '/logos/ministry-justice.png' },
  { name: 'Bank of Georgia', logo: '/logos/bank-of-georgia.png' },
  { name: 'Public Service Hall', logo: '/logos/public-service-hall.png' },
  { name: 'Hotel Kabadoni', logo: '/logos/hotel-kabadoni.png' },
  { name: 'Casino International', logo: '/logos/casino-interntional.png' },
  { name: 'TBC Bank', logo: '/logos/tbc-bank.png' },
  { name: 'ProCredit Bank', logo: '/logos/procredit-bank.png' },
  { name: 'Moxy Hotels', logo: '/logos/hotel-moxy.png' },
  { name: 'Hilton Garden Inn', logo: '/logos/hilton-gardeninn.png' },
  { name: 'Ramada Encore', logo: '/logos/ramada-encore.png' },
  { name: 'Le Port Hotel', logo: '/logos/le-port-1.png' },
  { name: 'Best Western', logo: '/logos/best-western.png' },
  { name: 'Booking.com', logo: '/logos/bookingcom.png' },
  { name: 'Colliers', logo: '/logos/colliers.png' },
  { name: 'Deloitte', logo: '/logos/deloitte.png' },
  { name: 'Knauf', logo: '/logos/knauf.png' },
] as const
