import { ADMIN_HOST_PREFIX, PUBLIC_HOSTS } from '@/config/site'

/**
 * ============================================================================
 * WHICH SITE IS THIS?
 * ----------------------------------------------------------------------------
 * One deployment, one bundle, two front doors:
 *
 *   admin-architrade.vercel.app  ->  the back office, and nothing else
 *   architrade.vercel.app        ->  the catalogue, and nothing else
 *
 * The hostname is read ONCE, when the module first loads, because it cannot
 * change without a full page load. Everything downstream reads the constant.
 *
 * WHAT THIS IS NOT
 *   This is not a security boundary, and nothing here should ever be mistaken
 *   for one. Both hostnames serve the same JavaScript from the same origin's
 *   worth of code, and anyone can edit that JavaScript in their own browser.
 *   Hiding /admin on the public hostname stops a curious visitor stumbling
 *   into a login form; it does not stop an attacker. What actually protects
 *   the catalogue is Supabase row level security, which checks the `admins`
 *   table on every write and does not care which hostname asked.
 * ============================================================================
 */

export type HostMode =
  /** Hostname begins with `admin` — serve the back office only. */
  | 'admin'
  /** A known production catalogue hostname — serve the catalogue only. */
  | 'public'
  /** localhost, a LAN address, a Vercel preview URL — serve both. */
  | 'open'

/**
 * True for `admin.architrade.ge`, `admin-architrade.vercel.app` and
 * `admin.localhost`; false for `administration.example.com`.
 *
 * The trailing separator matters. A bare `startsWith('admin')` would hand the
 * back office to any hostname that merely begins with those five letters.
 */
export function isAdminHostname(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (!host.startsWith(ADMIN_HOST_PREFIX)) return false

  const next = host.charAt(ADMIN_HOST_PREFIX.length)
  return next === '' || next === '.' || next === '-'
}

export function getHostMode(hostname: string): HostMode {
  const host = hostname.toLowerCase()
  if (isAdminHostname(host)) return 'admin'
  if ((PUBLIC_HOSTS as readonly string[]).includes(host)) return 'public'

  /*
   * Deliberately permissive. A hostname we do not recognise is a developer at
   * localhost or a Vercel preview deployment on a generated URL, and locking
   * /admin away from those would make the back office impossible to work on.
   * Only the hostnames listed in PUBLIC_HOSTS turn the restriction on.
   */
  return 'open'
}

/**
 * The mode for this page load.
 *
 * `window` is always present — this is a browser-only SPA — but the guard
 * keeps the module importable from a Node script or a test runner.
 */
export const HOST_MODE: HostMode =
  typeof window === 'undefined' ? 'open' : getHostMode(window.location.hostname)

/** Serve the back office, and send every other address to it. */
export const IS_ADMIN_HOST = HOST_MODE === 'admin'

/** Serve the catalogue, and keep /admin off this hostname entirely. */
export const IS_PUBLIC_ONLY_HOST = HOST_MODE === 'public'

/**
 * Where the catalogue lives, as seen from the back office.
 *
 * A relative "/ka" is right everywhere except the one place it matters. On
 * localhost and on a preview URL both sites are served from the same origin,
 * so the shop is one path away. On admin-architrade.vercel.app it is NOT: that
 * hostname routes every address it does not recognise back to /admin, so a
 * relative link would land the manager on the dashboard they were trying to
 * leave.
 *
 * The catalogue's hostname is the admin one with the prefix taken off —
 * admin-architrade.vercel.app -> architrade.vercel.app, admin.architrade.ge ->
 * architrade.ge — which holds because that is how the pair is deployed.
 * Derived rather than hard-coded so a new domain needs no second edit here.
 *
 * Returns a full URL only when it has to; a path otherwise.
 */
export function publicSiteUrl(path = '/', hostname?: string, protocol?: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (typeof window === 'undefined') return clean

  const host = (hostname ?? window.location.hostname).toLowerCase()
  if (!isAdminHostname(host)) return clean

  // Drop the prefix and whatever single character separates it: "admin-" and
  // "admin." both leave the catalogue's hostname behind. A bare "admin" with
  // nothing after it has no catalogue to point at, so it is left alone.
  const rest = host.slice(ADMIN_HOST_PREFIX.length + 1)
  if (!rest) return clean

  const port = window.location.port ? `:${window.location.port}` : ''
  return `${protocol ?? window.location.protocol}//${rest}${port}${clean}`
}
