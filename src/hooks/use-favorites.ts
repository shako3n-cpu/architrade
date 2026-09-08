import { useCallback, useEffect, useState } from 'react'
import {
  FAVORITES_KEY,
  readFavorites,
  toggleFavorite,
  writeFavorites,
} from '@/lib/favorites'

/**
 * ============================================================================
 * THE SHORTLIST, AS REACT SEES IT
 * ----------------------------------------------------------------------------
 * One hook, used by the button on a card, the count in the header, and the
 * page that lists them. All three read the same localStorage key, so they have
 * to agree without any of them owning the others.
 *
 * TWO TABS, ONE LIST
 *   A visitor comparing pieces has several tabs open — that is the whole shape
 *   of shortlisting. Without the `storage` listener, saving a chair in one tab
 *   leaves the other showing a stale count and an unfilled bookmark, and the
 *   next click there writes the stale list back and loses the chair. The
 *   listener is not polish; it is what stops the feature eating its own data.
 *
 *   `storage` fires only in OTHER tabs, never the one that wrote — so this
 *   cannot loop, and the writing tab is already correct from its own state.
 *
 * NOT A CONTEXT
 *   Every instance holds its own copy and they are reconciled through storage.
 *   A provider would be tidier in theory and would mean wrapping the public
 *   site in another component for a feature that is three buttons and a page.
 *   The same-tab case is handled by a small event of our own, below.
 * ============================================================================
 */

/**
 * Same-tab notification, which `storage` deliberately does not provide.
 *
 * The header count and the card that was just clicked are two separate
 * instances in the SAME tab, so the browser tells neither of them about the
 * other. This is the missing half.
 */
const SAME_TAB_EVENT = 'archtrade:favorites'

export function useFavorites() {
  const [slugs, setSlugs] = useState<string[]>(readFavorites)

  useEffect(() => {
    const sync = () => setSlugs(readFavorites())

    const onStorage = (event: StorageEvent) => {
      // Ignore every other key on this origin — the language, the idle timer,
      // and whatever supabase-js keeps.
      if (event.key === FAVORITES_KEY || event.key === null) sync()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(SAME_TAB_EVENT, sync)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(SAME_TAB_EVENT, sync)
    }
  }, [])

  const commit = useCallback((next: string[]) => {
    // Written first, then announced, so anything listening reads the new list
    // rather than racing the write.
    writeFavorites(next)
    setSlugs(next)
    window.dispatchEvent(new Event(SAME_TAB_EVENT))
  }, [])

  const toggle = useCallback(
    (slug: string) => {
      // Read back from storage rather than trusting this instance's state: two
      // components in one tab can be a render apart, and the loser would
      // otherwise write its stale list over the winner's.
      commit(toggleFavorite(readFavorites(), slug))
    },
    [commit],
  )

  const clear = useCallback(() => commit([]), [commit])

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs])

  return { slugs, count: slugs.length, has, toggle, clear }
}
