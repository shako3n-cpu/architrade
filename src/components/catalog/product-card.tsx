import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Media } from '@/components/ui/media'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'
import {
  categoryTitle,
  productCover,
  productDescription,
  productHoverImage,
  productImageAlt,
  productMaterials,
  productTitle,
} from '@/lib/localize'
import { cn } from '@/lib/utils'

/**
 * One piece in a grid — the single product card used everywhere.
 *
 * Carries no price and no add-to-cart, because there is neither. It shows what
 * a buyer actually needs to decide whether to ask: what it is, what it is made
 * of, how big it is, and two ways to start the conversation.
 *
 * THE WHOLE CARD IS THE LINK
 *   Not by wrapping it in an anchor — an anchor may not contain an anchor, and
 *   the photograph and the title were two separate links, leaving the copy and
 *   the tags between them dead to the click. Instead the title anchor grows an
 *   `::after` over the whole `relative` article. One link, one tab stop, one
 *   accessible name, and every pixel of the card hits it.
 *
 *   Anything interactive added inside must sit on `relative z-10` or the
 *   overlay will swallow its clicks.
 */
export function ProductCard({
  product,
  category,
  eager = false,
  dense = false,
  className,
}: {
  product: Product
  /** Resolved from product.category_id by the caller. Shown as a tag. */
  category?: Category
  /** True for the first row of a grid above the fold. */
  eager?: boolean
  /**
   * Drops the description and the specification chips on NARROW SCREENS ONLY,
   * for grids that go two-up on a phone.
   *
   * Set by the catalogue, which lists nineteen pieces two across at 159px a
   * card. A two-line description in that width is four or five words, and the
   * chips do not fit at all — the materials chip alone measures 302px. Both
   * become noise that pushes the next row further down without telling anyone
   * anything. They come back at `sm`, and the product page carries them in
   * full one tap away.
   *
   * A prop rather than a media query inside the card, because the card cannot
   * see how wide its column is: the same component is one-up on the home page
   * at the same viewport, where the description reads perfectly well.
   */
  dense?: boolean
  className?: string
}) {
  const { lang, localePath, t } = useLanguage()

  const cover = productCover(product)
  const hover = productHoverImage(product)
  const materials = productMaterials(product, lang)

  /*
   * The hover photograph does NOT go through Media, so it does not get that
   * component's dead-URL fallback and needs its own. Five of these are 404ing
   * in the live catalogue right now — Unsplash contributors delete their work
   * — and without this each one renders a torn-image icon that fades IN over a
   * perfectly good cover photo when the pointer arrives.
   */
  const [hoverFailed, setHoverFailed] = useState(false)

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative block overflow-hidden bg-surface">
        {cover ? (
          <Media
            src={cover}
            alt={productImageAlt(product, lang)}
            ratio="portrait"
            loading={eager ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            zoom
          />
        ) : (
          // A row saved without a photograph gets a quiet box, not a broken icon.
          <div aria-hidden="true" className="aspect-[3/4] bg-surface" />
        )}

        {hover && !hoverFailed && (
          <img
            src={hover}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={() => setHoverFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* The table has a `featured` column, not an `is_new` one — so this
            says Featured. Do not relabel it "New" without adding that column. */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-background/95 px-2.5 py-1 text-[10px] tracking-[0.18em] text-brass uppercase">
            {t('product.featuredBadge')}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3
          className={cn(
            'font-heading leading-snug text-ink',
            dense ? 'text-base sm:text-lg' : 'text-lg',
          )}
        >
          <Link
            to={localePath(`/product/${product.slug}`)}
            className="transition-colors duration-300 group-hover:text-brass after:absolute after:inset-0 after:content-['']"
          >
            {productTitle(product, lang)}
          </Link>
        </h3>

        <p
          className={cn(
            'mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted',
            dense && 'hidden sm:line-clamp-2 sm:block',
          )}
        >
          {productDescription(product, lang)}
        </p>

        <div className={cn('mt-4 flex flex-wrap gap-1.5', dense && 'hidden sm:flex')}>
          {category && <Tag>{categoryTitle(category, lang)}</Tag>}
          {product.dimensions && <Tag>{product.dimensions}</Tag>}
          {materials && <Tag>{materials}</Tag>}
        </div>

        {/* Pushes the price line to the bottom, so cards of different text
            lengths still line up along their last row. */}
        <div className={cn('mt-auto', dense ? 'pt-3 sm:pt-5' : 'pt-5')}>
          <p className="text-xs tracking-[0.14em] text-brass uppercase">
            {t('product.priceOnRequest')}
          </p>
        </div>
      </div>
    </article>
  )
}

/** A single specification chip. Hairline box, never a filled pill. */
function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="border border-hairline px-2.5 py-1 text-[10px] tracking-[0.12em] text-muted uppercase">
      {children}
    </span>
  )
}
