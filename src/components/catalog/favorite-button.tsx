import { Bookmark } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'

/**
 * Save a piece to the shortlist, or take it off.
 *
 * A BOOKMARK, NOT A HEART
 *   A heart says "I like this", which is a consumer gesture and the wrong verb
 *   for somebody assembling a specification for a hotel. A bookmark says "keep
 *   this where I can find it", which is what is actually happening.
 *
 * THE STATE IS IN THE FILL, AND ALSO IN WORDS
 *   Filled means saved. Colour alone would leave the state invisible to anybody
 *   who cannot separate brass from grey, so `aria-pressed` carries it too and
 *   the label changes between "save" and "saved" rather than staying put.
 *
 * ON A CARD IT SITS OVER THE PHOTOGRAPH, which is why it carries its own
 * background: a bookmark drawn straight onto an unknown image is legible
 * against roughly half of them.
 */
export function FavoriteButton({
  slug,
  className,
  onCard = false,
}: {
  slug: string
  className?: string
  /** Positioned over the photograph, with a background of its own. */
  onCard?: boolean
}) {
  const { t } = useLanguage()
  const { has, toggle } = useFavorites()
  const saved = has(slug)

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t(saved ? 'favorites.remove' : 'favorites.add')}
      title={t(saved ? 'favorites.remove' : 'favorites.add')}
      onClick={(event) => {
        /*
         * The whole card is a link — the title has an ::after that covers it —
         * so without this a click here would save the piece AND navigate to it.
         */
        event.preventDefault()
        event.stopPropagation()
        toggle(slug)
      }}
      className={cn(
        'inline-flex size-11 items-center justify-center transition-colors duration-300',
        onCard && 'absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm',
        saved ? 'text-brass' : 'text-muted hover:text-ink',
        className,
      )}
    >
      <Bookmark
        aria-hidden="true"
        className={cn('size-5 stroke-[1.25]', saved && 'fill-current')}
      />
    </button>
  )
}

/**
 * The same control, with its label showing.
 *
 * For the product page, where the decision to keep a piece is actually made —
 * after the dimensions and the materials have been read. A bare icon beside a
 * heading is a guess; in a grid of cards the same icon is obvious, because it
 * repeats and the photographs carry the meaning.
 */
export function FavoriteButtonLabelled({ slug }: { slug: string }) {
  const { t } = useLanguage()
  const { has, toggle } = useFavorites()
  const saved = has(slug)

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggle(slug)}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 text-sm transition-colors duration-300',
        saved ? 'text-brass' : 'text-muted hover:text-ink',
      )}
    >
      <Bookmark
        aria-hidden="true"
        className={cn('size-4 stroke-[1.25]', saved && 'fill-current')}
      />
      {t(saved ? 'favorites.saved' : 'favorites.add')}
    </button>
  )
}
