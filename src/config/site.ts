/**
 * ============================================================================
 * SITE CONFIGURATION
 * ----------------------------------------------------------------------------
 * Company contact details and navigation live here — NOT inside components.
 * Change a phone number once in this file and it updates in the header, the
 * footer, the contact page and every "Call" button on the site.
 *
 * Anything that is TRANSLATED (link labels, headings) lives in
 * src/locales/*.json instead. This file holds only language-neutral facts.
 * ============================================================================
 */

/** The three languages the site ships in. Georgian is the default. */
export const LANGUAGES = ['ka', 'en', 'ru'] as const
export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'ka'

/** Shown in the language switcher. `label` is what the visitor clicks. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  ka: 'KA',
  en: 'EN',
  ru: 'RU',
}

/** Used for the `lang` and `hreflang` attributes. */
export const LANGUAGE_TAGS: Record<Language, string> = {
  ka: 'ka-GE',
  en: 'en',
  ru: 'ru',
}

/* -------------------------------------------------------------------------- */
/* Company details                                                            */
/* -------------------------------------------------------------------------- */

export const CONTACT = {
  /** Display version — keep the spaces, they aid readability. */
  phoneDisplay: '+995 32 200 00 00',
  /** Dial version for tel: links — digits and a leading + only. */
  phoneHref: '+99532200000',

  whatsappDisplay: '+995 599 00 00 00',
  /** WhatsApp deep links need digits with no + and no spaces. */
  whatsappNumber: '995599000000',

  email: 'info@archtrade.ge',

  /** Street address is translated (see locales), this is the map link. */
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=41.7255,44.7451',
  /** Embedded map iframe source used on the showroom + contact pages. */
  mapsEmbedUrl:
    'https://www.google.com/maps?q=41.7255,44.7451&hl=en&z=16&output=embed',
} as const

export const SOCIAL = [
  { name: 'Facebook', href: 'https://facebook.com/archtrade' },
  { name: 'Instagram', href: 'https://instagram.com/archtrade' },
  { name: 'Pinterest', href: 'https://pinterest.com/archtrade' },
] as const

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Main navigation.
 *   `to`         — path WITHOUT the language prefix; the Link helper adds it.
 *   `labelKey`   — key looked up in the locale files (nav.catalog, etc.)
 */
export const MAIN_NAV = [
  { to: '/catalog', labelKey: 'nav.catalog' },
  { to: '/collections', labelKey: 'nav.collections' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/services', labelKey: 'nav.services' },
  { to: '/contact', labelKey: 'nav.contact' },
] as const

/** Extra links that appear only in the footer's "quick links" column. */
export const FOOTER_NAV = [
  { to: '/showroom', labelKey: 'nav.showroom' },
  { to: '/catalog', labelKey: 'nav.catalog' },
  { to: '/collections', labelKey: 'nav.collections' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/services', labelKey: 'nav.services' },
  { to: '/contact', labelKey: 'nav.contact' },
] as const

export const SITE_NAME = 'ARCHTRADE'
export const FOUNDED_YEAR = 2009
