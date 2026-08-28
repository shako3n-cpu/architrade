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

/** The two languages the site ships in. Georgian is the default. */
export const LANGUAGES = ['ka', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'ka'

/** Shown in the language switcher. `label` is what the visitor clicks. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  ka: 'KA',
  en: 'EN',
}

/** Used for the `lang` and `hreflang` attributes. */
export const LANGUAGE_TAGS: Record<Language, string> = {
  ka: 'ka-GE',
  en: 'en',
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

  /**
   * Facebook page handle — the part after facebook.com/. The single source
   * for the page link in SOCIAL below, the footer icon, and the m.me
   * Messenger deep link in src/lib/contact.ts, so those can never drift
   * apart. Change it here and all three follow.
   *
   * PLACEHOLDER: swap in the client's real page before launch. Until then
   * every Facebook and Messenger link opens a page that does not exist.
   */
  facebookHandle: 'archtrade',

  email: 'info@archtrade.ge',

  /** Street address is translated (see locales), this is the map link. */
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=41.7255,44.7451',
  /** Embedded map iframe source used on the showroom + contact pages. */
  mapsEmbedUrl:
    'https://www.google.com/maps?q=41.7255,44.7451&hl=en&z=16&output=embed',
} as const

/**
 * Built from the handles above rather than written out again, so the footer
 * link and the Messenger deep link cannot end up pointing at two different
 * pages. Not built with facebookPageUrl() from src/lib/contact.ts, even
 * though that produces the same string: this file must not import from lib,
 * which already imports from here.
 *
 * PLACEHOLDER: the Instagram handle is still a guess — give it the same
 * treatment as facebookHandle once the real account is known.
 */
export const SOCIAL = [
  { name: 'Facebook', href: `https://facebook.com/${CONTACT.facebookHandle}` },
  { name: 'Instagram', href: 'https://instagram.com/archtrade' },
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

/* -------------------------------------------------------------------------- */
/* Hostnames                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The prefix that marks a hostname as the back office.
 *
 * Matched against the START of the hostname, followed by the end of it, a dot
 * or a hyphen — so the live `admin-architrade.vercel.app` counts, and so would
 * `admin.architrade.ge` or `admin.localhost` if either is added later. See
 * src/lib/host.ts.
 */
export const ADMIN_HOST_PREFIX = 'admin'

/**
 * Production hostnames that serve the CATALOGUE ONLY. On these, /admin is not
 * reachable at all — a visitor who types it is sent to the catalogue.
 *
 * Anything not listed here (localhost, a Vercel preview URL, a LAN address)
 * keeps serving both the catalogue and /admin, so development and preview
 * deployments are unaffected. That means a NEW live catalogue domain left off
 * this list leaves /admin exposed on the public site: add every one here.
 *
 * Lowercase, no protocol, no trailing slash. A `www.` form is a different
 * hostname and needs its own entry. Adding a custom domain such as
 * architrade.ge later means adding both it and www.architrade.ge.
 */
export const PUBLIC_HOSTS = ['architrade.vercel.app'] as const
