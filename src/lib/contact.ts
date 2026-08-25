import { CONTACT } from '@/config/site'

/**
 * ============================================================================
 * CONTACT DEEP LINKS
 * ----------------------------------------------------------------------------
 * ARCHTRADE sells nothing online — there is no cart and no checkout. Every
 * enquiry leaves the site and lands in a channel the showroom already reads:
 * WhatsApp, Messenger, the phone, or email.
 *
 * This file builds those links and nothing else. It holds NO visible text:
 * the message a visitor sends is translated, so it arrives here already
 * rendered by t(). That keeps the "all strings come from src/locales" rule
 * intact even for text that ends up in another app.
 * ============================================================================
 */

/**
 * A WhatsApp chat with the showroom, optionally pre-filled.
 *
 * wa.me works on phones (opens the app) and on desktop (opens web.whatsapp),
 * so one URL covers both without sniffing the user agent.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * A Facebook Messenger chat with the page.
 *
 * `ref` is delivered to the PAGE, not shown to the visitor — Messenger has no
 * equivalent of WhatsApp's pre-filled text. Passing the product slug means
 * whoever answers can still see which piece prompted the message, provided
 * the page has an app reading the referral. Without one it is simply ignored,
 * which is why nothing here depends on it.
 */
export function messengerUrl(ref?: string): string {
  const base = `https://m.me/${CONTACT.facebookHandle}`
  return ref ? `${base}?ref=${encodeURIComponent(ref)}` : base
}

/** The company's Facebook page itself, as opposed to a chat with it. */
export function facebookPageUrl(): string {
  return `https://facebook.com/${CONTACT.facebookHandle}`
}

/**
 * The absolute address of a page, for pasting into an enquiry message.
 *
 * Guarded because this also runs during a production build, where there is no
 * `window` — the empty string simply leaves the link out of the message.
 */
export function absoluteUrl(path: string): string {
  if (typeof window === 'undefined') return ''
  return new URL(path, window.location.origin).href
}
