/**
 * ============================================================================
 * THE SHORTLIST, KEPT IN THE BROWSER
 * ----------------------------------------------------------------------------
 * A specifier browsing this catalogue is building a list for one project. There
 * is no cart to put things in and no account to sign into, so until now the
 * only way to keep a piece was a bookmark or a second tab.
 *
 * localStorage, NOT A COOKIE
 *   A cookie is sent to the server on every request for the life of the site,
 *   and nothing on the server has any use for this. localStorage is read only
 *   by the code that wrote it, survives the browser closing, and is the same
 *   place the language choice and the idle timer already live.
 *
 * SLUGS, NOT DATABASE IDS
 *   A slug is what the URLs already use, it reads as something when somebody is
 *   looking at stored data, and it survives the catalogue being re-seeded. An
 *   id that no longer resolves is a mystery; a slug that no longer resolves is
 *   at least a name somebody can search for.
 *
 * IT LIVES IN ONE BROWSER AND THAT IS ALL
 *   Another laptop, another phone, or cleared history means an empty list, with
 *   nothing to recover. That is inherent to having no accounts, and it is only
 *   a problem if somebody expects otherwise — which is why the interface says
 *   "saved on this device" rather than "saved".
 * ============================================================================
 */

const STORAGE_KEY = 'archtrade.favorites'

/**
 * A ceiling, because there is no server to complain.
 *
 * Nobody shortlists two hundred sofas; a list that long is a stuck loop or a
 * bored teenager, and either way filling the origin's storage quota would
 * break the language preference and the session alongside it. The oldest entry
 * is dropped rather than refusing the newest, because refusing is a failure the
 * visitor can see and cannot explain.
 */
export const MAX_FAVORITES = 100

/**
 * Reads the list, and is total: every failure answers with an empty list.
 *
 * localStorage throws rather than returning null in two ordinary situations —
 * Safari's private mode, and a browser configured to refuse site data — and
 * neither is a reason for the catalogue to stop rendering. The feature simply
 * does not persist, which is the correct degradation.
 */
export function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    // Whatever is in storage was put there by an older version of this code, by
    // hand, or by something else on the same origin. Only strings survive.
    return parsed.filter((entry): entry is string => typeof entry === 'string').slice(0, MAX_FAVORITES)
  } catch {
    return []
  }
}

/** Writes the list. Silent on failure, for the same reasons as reading. */
export function writeFavorites(slugs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, MAX_FAVORITES)))
  } catch {
    // Quota exceeded, or storage refused. The list still works for this visit;
    // it just will not be there tomorrow.
  }
}

/**
 * Adds or removes one slug, newest first.
 *
 * Newest first because the list is read as "what I have been looking at", and
 * a shortlist that appends to the bottom buries today's work under last week's.
 */
export function toggleFavorite(slugs: string[], slug: string): string[] {
  if (slugs.includes(slug)) return removeFavorite(slugs, slug)
  return [slug, ...slugs].slice(0, MAX_FAVORITES)
}

/**
 * Removes one slug, and only ever removes.
 *
 * Separate from `toggleFavorite` because a control that says "remove" must not
 * be able to add. The ✕ on a shortlist row is pressed at the same spot
 * repeatedly as the list shortens under the pointer, and a toggle would put
 * back whatever a double press had just taken off — the one outcome the label
 * promises cannot happen. Idempotent: removing something already gone is not
 * an error, it is the state the caller asked for.
 */
export function removeFavorite(slugs: string[], slug: string): string[] {
  return slugs.filter((entry) => entry !== slug)
}

/** The key, exported so the cross-tab listener can recognise its own writes. */
export const FAVORITES_KEY = STORAGE_KEY
