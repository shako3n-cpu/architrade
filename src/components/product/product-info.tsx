import { Link } from 'react-router-dom'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ProductSpecs } from './product-specs'
import { InquiryBox } from './inquiry-box'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'
import { categoryTitle, productDescription, productTitle } from '@/lib/localize'

/**
 * Everything beside the photographs: what the piece is called, what it is,
 * what it is made of, and how to ask about it.
 *
 * Order follows the questions a visitor asks in the order they ask them —
 * which room, what is it, what does it cost, tell me more, the numbers, and
 * only then the enquiry. Putting the enquiry box first would ask for a
 * decision before giving anything to decide with.
 */
export function ProductInfo({
  product,
  category,
}: {
  product: Product
  /** Undefined when the product's category row could not be resolved. */
  category?: Category
}) {
  const { lang, localePath, t } = useLanguage()

  /*
   * A description column is free text typed by whoever added the row, so a
   * long one usually arrives with line breaks in it. Splitting on them keeps
   * those paragraphs; without this the whole thing collapses into one block,
   * because HTML ignores newlines.
   */
  const paragraphs = productDescription(product, lang)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {category && (
          <Eyebrow>
            <Link
              to={localePath(`/catalog/${category.slug}`)}
              className="inline-flex min-h-11 items-center text-brass transition-colors duration-300 hover:text-brass-dim sm:min-h-0"
            >
              {categoryTitle(category, lang)}
            </Link>
          </Eyebrow>
        )}

        {/* The table has a `featured` column, not an `is_new` one — so this
            says Featured. Do not relabel it "New" without adding that column. */}
        {product.featured && (
          <span className="border border-hairline px-2.5 py-1 text-[10px] tracking-[0.18em] text-muted uppercase">
            {t('product.featuredBadge')}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-heading text-2xl leading-tight text-ink sm:text-3xl md:text-4xl lg:text-5xl">
        {productTitle(product, lang)}
      </h1>

      {/* Where a price would be on a shop. This site quotes per commission. */}
      <p className="mt-5 text-sm tracking-[0.14em] text-brass uppercase">
        {t('product.priceOnRequest')}
      </p>

      {paragraphs.length > 0 && (
        <div className="mt-8 space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="max-w-prose text-base leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/*
       * THE ENQUIRY SITS ABOVE THE SPECIFICATIONS, NOT BELOW THEM.
       *
       * There is no price and no cart on this site, so these two buttons are
       * the entire commercial mechanism of the page. Under the spec table they
       * landed at 1394px on a 812px phone — 1.7 screens down, behind the
       * gallery, the title, the description and a full dimensions-and-
       * materials list. Someone who has decided they want the piece was being
       * asked to scroll past its dimensions in order to ask about it.
       *
       * The description still comes first: you have to know what the thing is
       * before you can want it. The specification list is reference material
       * and reads perfectly well after the ask.
       */}
      <InquiryBox product={product} className="mt-10" />

      <h2 className="sr-only">{t('product.specTitle')}</h2>
      <ProductSpecs product={product} category={category} className="mt-10" />
    </div>
  )
}
