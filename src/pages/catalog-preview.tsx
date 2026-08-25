import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Media } from '@/components/ui/media'
import { QueryState } from '@/components/ui/query-state'
import { useLanguage } from '@/hooks/use-language'
import { useCatalogue } from '@/hooks/use-catalog'
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

/**
 * TEMPORARY — data review only.
 *
 * Renders the live Supabase catalogue as a plain contact sheet so the data can
 * be checked before the real catalogue page is designed. This is NOT the
 * catalogue: no filters, no sorting, no search, no pagination.
 */
export function CatalogPreview() {
  const { lang, t } = useLanguage()
  const catalogue = useCatalogue()

  return (
    <>
      <Section spacing="lg">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t('preview.eyebrow')}
            title={t('preview.title')}
            description={t('preview.description')}
          />
        </Container>
      </Section>

      <Container>
        <QueryState
          result={catalogue}
          isEmpty={(data) => data.categories.length === 0 && data.products.length === 0}
        >
          {({ categories, products }) => (
            <>
              {categories.map((category) => (
                <CategoryBlock
                  key={category.id}
                  category={category}
                  products={products.filter((product) => product.category_id === category.id)}
                  lang={lang}
                  emptyLabel={t('state.emptyBody')}
                  countLabel={(count) => t('catalog.resultCount', { count })}
                />
              ))}
            </>
          )}
        </QueryState>
      </Container>
    </>
  )
}

/** One category heading followed by the products that belong to it. */
function CategoryBlock({
  category,
  products,
  lang,
  emptyLabel,
  countLabel,
}: {
  category: Category
  products: Product[]
  lang: ReturnType<typeof useLanguage>['lang']
  emptyLabel: string
  countLabel: (count: number) => string
}) {
  return (
    <Section spacing="md" bordered>
      <SectionHeading
        as="h2"
        eyebrow={countLabel(products.length)}
        title={categoryTitle(category, lang)}
      />

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductTile key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}
    </Section>
  )
}

/** One product, showing every column the table actually has. */
function ProductTile({
  product,
  lang,
}: {
  product: Product
  lang: ReturnType<typeof useLanguage>['lang']
}) {
  const { t } = useLanguage()
  const cover = productCover(product)
  const hover = productHoverImage(product)

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden">
        {cover ? (
          <Media src={cover} alt={productImageAlt(product, lang)} ratio="landscape" zoom />
        ) : (
          // A row saved without a photograph gets a quiet box, not a broken icon.
          <div aria-hidden="true" className="aspect-[4/3] bg-surface" />
        )}

        {hover && (
          <img
            src={hover}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* The table has a `featured` column, not an `is_new` one — so this
            says Featured. Do not relabel it "New" without adding that column. */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-background/90 px-2.5 py-1 text-[10px] tracking-[0.18em] text-brass uppercase">
            {t('product.featuredBadge')}
          </span>
        )}
      </div>

      <h3 className="mt-5 font-heading text-lg leading-snug text-ink">
        {productTitle(product, lang)}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {productDescription(product, lang)}
      </p>

      <dl className="mt-4 flex flex-col gap-1.5 border-t border-hairline pt-4 text-xs text-muted">
        <SpecRow label={t('product.dimensions')} value={product.dimensions} />
        <SpecRow label={t('product.materials')} value={productMaterials(product, lang)} />
      </dl>

      <p className="mt-4 text-xs tracking-[0.14em] text-brass uppercase">
        {t('product.priceOnRequest')}
      </p>
    </article>
  )
}

/** Label on the left, value on the right, matching the spec table style. */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  )
}
