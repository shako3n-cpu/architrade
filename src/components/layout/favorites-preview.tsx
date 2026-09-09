import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { useFavorites } from '@/hooks/use-favorites'
import { CAN_HOVER, useMediaQuery } from '@/hooks/use-media-query'
import { fetchProductsBySlugs } from '@/lib/queries'
import { productCover, productTitle } from '@/lib/localize'
import type { Product } from '@/data/types'

/**
 * ============================================================================
 * THE SHORTLIST, PEEKED AT FROM THE HEADER
 * ----------------------------------------------------------------------------
 * Hovering the count opens the last few pieces saved, so somebody comparing a
 * chair against three others does not have to leave the page they are on to
 * remember what is on the list.
 *
 * FETCHED ON FIRST HOVER, NEVER BEFORE
 *   The header renders on every page. Loading the catalogue here would put a
 *   request on every navigation, including the pages that show no products at
 *   all — and `useAsync` holds no cache, so it would be a fresh one each time.
 *   Nothing is requested until the pointer arrives, and then only the saved
 *   slugs. See fetchProductsBySlugs.
 *
 * FOUR VISIBLE, THE REST BY SCROLLING
 *   The panel is sized to four rows and scrolls past that. A hover panel that
 *   grows with its contents eventually reaches the bottom of the screen and
 *   starts covering the page behind it, and the whole point of this is to
 *   glance without leaving.
 *
 * HOVER IS NOT THE ONLY WAY IN
 *   It opens on focus as well, and Escape closes it. A control that only
 *   answers to a pointer is invisible to a keyboard, and this one is wrapped
 *   around a link that has to keep working either way.
 *
 * DESKTOP ONLY, decided by the POINTER and not by the width. There is no hover
 * on a touch screen, so the tap goes straight to the page — which is the better
 * interaction there anyway. `(hover: hover) and (pointer: fine)` is the browser
 * answering the actual question; a breakpoint would call a 1400px tablet a
 * desktop and a 900px laptop a phone.
 * ============================================================================
 */

/** How many rows the panel is tall. Beyond this it scrolls. */
const VISIBLE_ROWS = 4

/**
 * One row, in pixels: a 56px thumbnail, 8px of padding above and below, and
 * the 1px rule under it.
 *
 * Measured rather than guessed. `4.5rem` was the first attempt and it is 72px,
 * one short — which showed four rows with the fourth clipped by 4px. Too small
 * to read as "there is more below" and exactly large enough to look like a
 * mistake.
 */
const ROW_HEIGHT_PX = 56 + 8 + 8 + 1

/** Long enough to cross the gap between the link and the panel. */
const CLOSE_DELAY_MS = 120

export function FavoritesPreview({
  children,
  load = fetchProductsBySlugs,
}: {
  children: React.ReactNode
  /**
   * How the saved slugs become products. Defaults to the real query, so every
   * live header gets the real behaviour by passing nothing — the same
   * injection ImageField and ImageUpload use, and for the same reason: a
   * panel that only appears on hover, above a fetch that needs credentials,
   * cannot otherwise be looked at on a machine that has neither.
   */
  load?: (slugs: string[], signal?: AbortSignal) => Promise<Product[]>
}) {
  const { t, lang, localePath } = useLanguage()
  const { slugs, count, remove } = useFavorites()
  const canHover = useMediaQuery(CAN_HOVER)

  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [failed, setFailed] = useState(false)
  const closeTimer = useRef<number | null>(null)

  /*
   * Re-fetched whenever the panel is open and the saved list has changed —
   * which includes the first open, when `products` is still null. Saving a
   * piece while the panel is up should show it, not a stale four.
   */
  useEffect(() => {
    if (!open || slugs.length === 0) return

    const controller = new AbortController()
    setFailed(false)

    void load(slugs.slice(0, 12), controller.signal)
      .then(setProducts)
      // A failed preview must not take the header with it. The link still
      // works and the page behind it is unaffected.
      .catch(() => setFailed(true))

    return () => controller.abort()
  }, [open, slugs, load])

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  /*
   * Closing is delayed because the pointer has to cross a few pixels of gap
   * between the link and the panel, and a panel that vanishes in that gap
   * cannot be reached at all.
   */
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => cancelClose, [])

  /*
   * On a touch screen the link is just a link. Asking about the pointer rather
   * than the width is the point: a 1400px tablet has no hover and a 900px
   * laptop does, so a breakpoint would get both wrong. It also means no
   * products are fetched for a panel that can never open.
   */
  if (count === 0 || !canHover) return <>{children}</>

  /* Ordered by the SHORTLIST, not by whatever order the database returned. */
  const bySlug = new Map((products ?? []).map((product) => [product.slug, product]))
  const rows = slugs.map((slug) => bySlug.get(slug)).filter((p) => p !== undefined)

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={scheduleClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      {children}

      {open && (
        <div
          role="group"
          aria-label={t('favorites.previewLabel')}
          /* `mt-2` is a visual gap the pointer must cross; `pt-2` inside a
             wrapper that starts at the link keeps it hoverable while crossing.
             Without that the panel closes underneath the cursor. */
          className="absolute top-full right-0 z-50 w-72 pt-2"
        >
          <div className="border border-hairline bg-background shadow-lg">
            {failed ? (
              <p className="p-4 text-xs text-muted">{t('favorites.previewFailed')}</p>
            ) : rows.length === 0 ? (
              <p className="p-4 text-xs text-muted">{t('state.loading')}</p>
            ) : (
              <ul
                /* Sized to four rows: each is 56px of thumbnail plus 8px of
                   padding either side, and the border between them. */
                className="overflow-y-auto"
                style={{ maxHeight: `${VISIBLE_ROWS * ROW_HEIGHT_PX}px` }}
              >
                {rows.map((product) => (
                  <li
                    /* `group` so the remove button can stay invisible until the
                       row is pointed at, and `relative` so the stretched link
                       below has something to be stretched against. */
                    key={product.id}
                    className="group relative flex items-center gap-3 border-b border-hairline p-2 transition-colors duration-300 last:border-b-0 hover:bg-surface"
                  >
                    <Thumbnail src={productCover(product)} />

                    <Link
                      to={localePath(`/product/${product.slug}`)}
                      onClick={() => setOpen(false)}
                      /* The link is the ROW, by way of `after:inset-0` — the
                         same trick the product card uses. A button cannot be
                         nested inside an anchor, so the ✕ is a sibling drawn
                         over the stretched area rather than a child of it. */
                      className="min-w-0 flex-1 truncate text-sm text-ink after:absolute after:inset-0 after:content-['']"
                    >
                      {productTitle(product, lang)}
                    </Link>

                    <button
                      type="button"
                      onClick={() => remove(product.slug)}
                      aria-label={t('favorites.remove')}
                      title={t('favorites.remove')}
                      /* `relative` lifts it above the stretched link, or the
                         click lands on the anchor and navigates away instead
                         of removing anything.

                         Shown on hover and on focus, never permanently: four
                         standing ✕ marks read as a list of things to delete
                         rather than a list of saved pieces. It is safe to hide
                         because this panel only exists where there is a
                         pointer — see CAN_HOVER — and the keyboard path is the
                         focus state. */
                      className="relative inline-flex size-8 shrink-0 items-center justify-center text-muted opacity-0 transition-[color,opacity] duration-300 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100 focus-visible:outline-none"
                    >
                      <X aria-hidden="true" className="size-4 stroke-[1.25]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

/** A 56px square, or a quiet box when the piece has no photograph. */
function Thumbnail({ src }: { src: string | null }) {
  return (
    <span className="size-14 shrink-0 overflow-hidden border border-hairline bg-surface">
      {src && <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />}
    </span>
  )
}
