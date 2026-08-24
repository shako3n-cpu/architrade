import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Media } from '@/components/ui/media'
import { useLanguage } from '@/hooks/use-language'
import {
  categories,
  collections,
  getProductsByCategory,
  getSubcategory,
  products,
  type Product,
} from '@/data'

/**
 * TEMPORARY — step 3 data review only.
 *
 * Renders the whole catalogue as a plain contact sheet so the photography,
 * the Georgian copy and the language switching can be checked before the real
 * catalogue page is designed. This is NOT the catalogue: there are no filters,
 * no sorting, no search and no pagination.
 *
 * Delete this file and its `preview.*` locale keys once the real catalogue,
 * category and product pages exist.
 */
export function CatalogPreview() {
  const { lang, t } = useLanguage()

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

          <dl className="mt-12 flex flex-wrap gap-x-16 gap-y-6 border-t border-hairline pt-8">
            <CountStat label={t('nav.catalog')} value={products.length} />
            <CountStat label={t('footer.categories')} value={categories.length} />
            <CountStat label={t('nav.collections')} value={collections.length} />
          </dl>
        </Container>
      </Section>

      {categories.map((category) => {
        const items = getProductsByCategory(category.slug)

        return (
          <Section key={category.slug} spacing="md" bordered>
            <Container>
              <SectionHeading
                as="h2"
                eyebrow={t('catalog.resultCount', { count: items.length })}
                title={category.name[lang]}
                description={category.intro[lang]}
              />

              <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((product) => (
                  <PreviewTile key={product.id} product={product} />
                ))}
              </div>
            </Container>
          </Section>
        )
      })}
    </>
  )
}

/** One number with its label, used in the summary row. */
function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="at-label">{label}</dt>
      <dd className="mt-2 font-heading text-3xl text-ink">{value}</dd>
    </div>
  )
}

/** One product, shown with every field so the data can be checked at a glance. */
function PreviewTile({ product }: { product: Product }) {
  const { lang, t } = useLanguage()
  const { width, depth, height } = product.dimensions
  const subcategory = getSubcategory(product.categorySlug, product.subcategorySlug)

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden">
        <Media
          src={product.images[0]}
          alt={`${product.name[lang]} — ${product.materials[lang]}`}
          ratio="landscape"
          zoom
        />

        {/* Second photograph, revealed on hover. Decorative: the first image
            already carries the description. */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {product.isNew && (
          <span className="absolute top-3 left-3 bg-background/90 px-2.5 py-1 text-[10px] tracking-[0.18em] text-brass uppercase">
            {t('product.newBadge')}
          </span>
        )}
      </div>

      <h3 className="mt-5 font-heading text-lg leading-snug text-ink">{product.name[lang]}</h3>

      <p className="at-label mt-2">
        {product.articleNumber}
        {subcategory ? ` · ${subcategory.name[lang]}` : ''}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted">{product.shortDescription[lang]}</p>

      <dl className="mt-4 flex flex-col gap-1.5 border-t border-hairline pt-4 text-xs text-muted">
        <SpecRow label={t('product.dimensions')} value={`${width} × ${depth} × ${height} cm`} />
        <SpecRow label={t('product.materials')} value={product.materials[lang]} />
        <SpecRow label={t('product.origin')} value={product.origin[lang]} />
        <SpecRow
          label={t('product.warranty')}
          value={t('product.warrantyValue', { count: product.warrantyMonths })}
        />
        <SpecRow label={t('product.availability')} value={t(`availability.${product.availability}`)} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Eyebrow as="span" className="sr-only">
          {t('product.finishes')}
        </Eyebrow>
        {product.finishes.map((finish) => (
          <span
            key={finish.hex}
            title={`${finish.name[lang]} (${finish.hex})`}
            className="size-4 rounded-xs border border-hairline"
            style={{ backgroundColor: finish.hex }}
          />
        ))}
      </div>

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
