import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/ui/query-state'
import { Breadcrumbs, type Crumb } from '@/components/ui/breadcrumbs'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { RelatedProducts } from '@/components/product/related-products'
import { useProductPage } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'
import { categoryTitle, productImageAlt, productTitle } from '@/lib/localize'

/**
 * One piece: /ka/product/modern-sofa
 *
 * Photographs on the left, everything else on the right, related pieces
 * underneath. All three come from a single hook so the page has one loading
 * state rather than three that finish at different moments.
 */
export function Product() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { lang, t } = useLanguage()
  const page = useProductPage(slug)

  return (
    <QueryState result={page} skeleton={<ProductSkeleton />}>
      {({ product, categories, related }) => {
        // A slug that matches no row is a mistyped address, not a server
        // failure, so it gets its own state instead of the error panel.
        if (!product) return <NotFound />

        const category = categories.find((item) => item.id === product.category_id)

        const crumbs: Crumb[] = [
          { label: t('nav.home'), to: '/' },
          ...(category
            ? [{ label: categoryTitle(category, lang), to: `/catalog/${category.slug}` }]
            : []),
          { label: productTitle(product, lang) },
        ]

        return (
          <>
            <Section spacing="md">
              <Container>
                <Breadcrumbs items={crumbs} className="mb-5 sm:mb-10" />

                {/*
                 * The gap closes on a phone because the two halves are stacked
                 * rather than side by side: 48px between a photograph and the
                 * name of the thing in it reads as a break between sections,
                 * not as breathing room, and it was pushing the title off the
                 * fold. Side by side from `lg` the gap is horizontal and the
                 * original value is right again.
                 */}
                <div className="grid grid-cols-1 gap-x-16 gap-y-7 lg:grid-cols-2 lg:gap-y-12">
                  {/* Keyed on the product so moving between two pieces resets
                      the gallery to the first photograph. */}
                  <ProductGallery
                    key={product.id}
                    images={product.images ?? []}
                    alt={productImageAlt(product, lang)}
                  />

                  <ProductInfo product={product} category={category} />
                </div>
              </Container>
            </Section>

            <RelatedProducts products={related} categories={categories} />
          </>
        )
      }}
    </QueryState>
  )
}

/** Grey boxes in the shape of the layout that is about to replace them. */
function ProductSkeleton() {
  const { t } = useLanguage()

  return (
    <Section spacing="md">
      <Container>
        <span className="sr-only">{t('state.loading')}</span>

        <div
          aria-hidden="true"
          className="grid animate-pulse grid-cols-1 gap-x-16 gap-y-7 lg:grid-cols-2 lg:gap-y-12"
        >
          <div>
            <div className="aspect-square w-full bg-surface" />
            <div className="mt-2.5 grid grid-cols-5 gap-2 sm:mt-3 sm:gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="aspect-square bg-surface" />
              ))}
            </div>
          </div>

          <div>
            <div className="h-3 w-28 bg-surface" />
            <div className="mt-6 h-10 w-4/5 bg-surface" />
            <div className="mt-6 h-3 w-32 bg-surface" />
            <div className="mt-8 h-3 w-full bg-surface" />
            <div className="mt-3 h-3 w-11/12 bg-surface" />
            <div className="mt-3 h-3 w-3/4 bg-surface" />
            <div className="mt-10 h-44 w-full bg-surface" />
          </div>
        </div>
      </Container>
    </Section>
  )
}

/** Shown when the slug in the address matches nothing in the catalogue. */
function NotFound() {
  const { localePath, t } = useLanguage()

  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col items-center border-t border-b border-hairline px-6 py-20 text-center">
          <h1 className="font-heading text-3xl text-ink">{t('product.notFoundTitle')}</h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            {t('product.notFoundBody')}
          </p>

          <Button asChild variant="outline" size="sm" className="mt-8">
            <Link to={localePath('/catalog')}>{t('product.backToCatalog')}</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
