import type { ReactNode } from 'react'
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
  className,
}: {
  product: Product
  /** Resolved from product.category_id by the caller. Shown as a tag. */
  category?: Category
  /** True for the first row of a grid above the fold. */
  eager?: boolean
  className?: string
}) {
  const { lang, localePath, t } = useLanguage()

  const cover = productCover(product)
  const hover = productHoverImage(product)
  const materials = productMaterials(product, lang)

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

        {hover && (
          <img
            src={hover}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
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
        <h3 className="font-heading text-lg leading-snug text-ink">
          <Link
            to={localePath(`/product/${product.slug}`)}
            className="transition-colors duration-300 group-hover:text-brass after:absolute after:inset-0 after:content-['']"
          >
            {productTitle(product, lang)}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {productDescription(product, lang)}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {category && <Tag>{categoryTitle(category, lang)}</Tag>}
          {product.dimensions && <Tag>{product.dimensions}</Tag>}
          {materials && <Tag>{materials}</Tag>}
        </div>

        {/* Pushes the price line to the bottom, so cards of different text
            lengths still line up along their last row. */}
        <div className="mt-auto pt-5">
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
