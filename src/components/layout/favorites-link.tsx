import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { useFavorites } from '@/hooks/use-favorites'

/**
 * The shortlist, and how many pieces are on it.
 *
 * THE COUNT IS THE POINT
 *   Without it this is a link to a page that is usually empty, and nobody
 *   opens those. With it, saving a piece produces visible feedback somewhere
 *   other than the button just pressed — which is the only confirmation the
 *   visitor gets that anything was stored at all.
 *
 * HIDDEN AT ZERO
 *   An empty shortlist is not a feature worth advertising in a header this
 *   tight, and a permanent "0" reads as broken. It appears when it has
 *   something to say and disappears when it does not.
 */
export function FavoritesLink() {
  const { t, localePath } = useLanguage()
  const { count } = useFavorites()

  if (count === 0) return null

  return (
    <Link
      to={localePath('/favorites')}
      aria-label={t('favorites.linkLabel', { count })}
      className="inline-flex min-h-11 items-center gap-1.5 px-1 text-ink transition-colors duration-300 hover:text-brass sm:min-h-0"
    >
      <Bookmark aria-hidden="true" className="size-4 stroke-[1.25]" />
      <span className="text-xs tabular-nums">{count}</span>
    </Link>
  )
}
