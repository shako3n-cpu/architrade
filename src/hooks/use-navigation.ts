import { useMemo } from 'react'
import { buildCategoryTree, publicTree, type CategoryNode } from '@/lib/category-tree'
import { useCatalogue } from './use-catalog'

/**
 * The category tree the navigation renders.
 *
 * FETCHED ONCE, SHARED DOWN
 *   Called in Header, which RootLayout mounts once and never unmounts, so this
 *   is one request per page load rather than one per navigation. The result is
 *   handed to the mega menu and the mobile drawer as a prop instead of each
 *   calling the hook itself, which would double the request for one tree.
 *
 * NEVER BLOCKS THE HEADER
 *   There is no loading state and no error state here on purpose. The header
 *   has to render immediately — it carries the wordmark, the phone number and
 *   the skip link — so while the catalogue is in flight, or if it fails
 *   outright, `tree` is simply empty and the menu falls back to a plain link
 *   to /catalog. A visitor never sees a spinner in the navigation bar, and a
 *   Supabase outage costs them the menu, not the site.
 */
export function useNavigationTree(): { tree: CategoryNode[]; ready: boolean } {
  const catalogue = useCatalogue()
  const data = catalogue.status === 'success' ? catalogue.data : null

  const tree = useMemo(() => {
    if (!data) return []
    return publicTree(buildCategoryTree(data.categories, data.products))
  }, [data])

  return { tree, ready: tree.length > 0 }
}
