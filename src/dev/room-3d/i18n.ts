import i18n from 'i18next'
import en from './locales/en.json'
import ka from './locales/ka.json'

/**
 * ============================================================================
 * THE 3D ROOM'S STRINGS, IN THE SITE'S OWN i18n
 * ----------------------------------------------------------------------------
 * Every string the room hero shows is read with the site's `t()`, from keys
 * under `room3d.*`, in English and Georgian — the same i18next instance, the
 * same `translation` namespace, the same lookup as every other page.
 *
 * WHY THE FILES LIVE HERE AND NOT IN src/locales
 *   src/locales/*.json are imported by src/i18n and so ship in every
 *   production build. These strings belong to a feature that exists only on
 *   the dev route; in src/locales they would ride along in the production
 *   bundle for nothing, and the production build is kept byte-identical while
 *   this is a preview. So they are merged into the running instance when
 *   this module loads — which only the dev route's dynamic import ever does.
 *
 *   When the feature ships: move the `room3d` block of each file into
 *   src/locales/en.json and ka.json, and delete this module and its import.
 *   No component changes; the keys stay the same.
 *
 * The Georgian is a first draft — have it checked by a native speaker.
 * ============================================================================
 */

// deep: merge into the existing tree; overwrite: never replace a site key.
i18n.addResourceBundle('en', 'translation', en, true, false)
i18n.addResourceBundle('ka', 'translation', ka, true, false)
