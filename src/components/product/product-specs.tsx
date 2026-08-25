import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'
import { categoryTitle, productMaterials } from '@/lib/localize'

/**
 * The specification sheet — what the piece is, how big it is, what it is made
 * of. Everything the database actually knows, and nothing invented.
 *
 * Marked up as a description list rather than a table because these are
 * property/value pairs about one object, not rows of comparable records.
 *
 * A row whose column is empty is left out entirely. An "Materials: —" line
 * tells a visitor nothing except that the catalogue is unfinished.
 */
export function ProductSpecs({
  product,
  category,
}: {
  product: Product
  /** Undefined when the product's category row could not be resolved. */
  category?: Category
}) {
  const { lang, localePath, t } = useLanguage()

  const materials = productMaterials(product, lang)

  return (
    <dl className="border-t border-hairline">
      {category && (
        <Row label={t('product.category')}>
          <Link
            to={localePath(`/catalog/${category.slug}`)}
            className="transition-colors duration-300 hover:text-brass"
          >
            {categoryTitle(category, lang)}
          </Link>
        </Row>
      )}

      {product.dimensions && <Row label={t('product.dimensions')}>{product.dimensions}</Row>}

      {materials && <Row label={t('product.materials')}>{materials}</Row>}
    </dl>
  )
}

/** One label/value pair, split across a hairline. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-hairline py-3.5 sm:flex-row sm:gap-6">
      <dt className="sm:w-40 sm:shrink-0">
        <Eyebrow className="text-muted">{label}</Eyebrow>
      </dt>
      <dd className="text-sm leading-relaxed text-ink">{children}</dd>
    </div>
  )
}
