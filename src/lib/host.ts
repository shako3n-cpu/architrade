import { ADMIN_HOST_PREFIX, PUBLIC_HOSTS } from '@/config/site'

/**
 * ============================================================================
 * WHICH SITE IS THIS?
 * ----------------------------------------------------------------------------
 * One deployment, one bundle, two front doors:
 *
 *   admin-archtrade.vercel.app  ->  the back office, and nothing else
 *   archtrade.vercel.app        ->  the catalogue, and nothing else
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
 * True for `admin.archtrade.ge`, `admin-archtrade.vercel.app` and
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
