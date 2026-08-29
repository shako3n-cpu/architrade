import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { QueryState, SkeletonGrid } from '@/components/ui/query-state'
import { ProductCard } from '@/components/catalog/product-card'
import { CatalogFilterRail } from '@/components/catalog/catalog-filters'
import { ContactBand } from '@/components/home/contact-band'
import { useCatalogue } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'
import { countByCategory, filterProducts, type CatalogFilters } from '@/lib/catalog-filter'
import { buildCategoryTree, publicTree } from '@/lib/category-tree'

/**
 * /catalog — the whole catalogue, filterable.
 *
 * THE FILTERS LIVE IN THE URL
 *   ?c=office-furniture&q=oak&featured=1 is the state. That makes a filtered
 *   view something you can send to a colleague, bookmark, or reach with the
 *   back button — which is most of what a specifier does with a catalogue.
 *   Component state would have looked identical on screen and lost all three.
 *
 * NO PRICES, NO CART, NO SORT BY PRICE. There are none to sort by; every card
 * reads "price on request" and hands the visitor to WhatsApp or Messenger.
 */
export function Catalog() {
  const { t } = useLanguage()
  const catalogue = useCatalogue()
  const [params, setParams] = useSearchParams()

  const filters: CatalogFilters = useMemo(
    () => ({
      category: params.get('c') ?? '',
      query: params.get('q') ?? '',
      featuredOnly: params.get('featured') === '1',
    }),
    [params],
  )

  const update = useCallback(
    (next: Partial<CatalogFilters>) => {
      const merged = { ...filters, ...next }
      const search = new URLSearchParams()
      if (merged.category) search.set('c', merged.category)
      if (merged.query.trim()) search.set('q', merged.query)
      if (merged.featuredOnly) search.set('featured', '1')
      // Typing must not push a history entry per keystroke, or Back becomes
      // useless. The filter change itself is the navigation.
      setParams(search, { replace: true })
    },
    [filters, setParams],
  )

  return (
    <>
      <div className="border-b border-hairline pt-14 pb-14 md:pt-20 md:pb-16">
        <Container>
          <Eyebrow className="text-brass">{t('catalog.eyebrow')}</Eyebrow>
          <h1 className="mt-5 max-w-4xl text-3xl text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            {t('catalog.title')}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {t('catalog.description')}
          </p>
        </Container>
      </div>

      <Section spacing="md">
        <Container>
          <QueryState
            result={catalogue}
            skeleton={<SkeletonGrid count={8} className="lg:grid-cols-4" />}
            isEmpty={(data) => data.products.length === 0}
          >
            {({ categories, products }) => (
              <CatalogBody
                categories={categories}
                products={products}
                filters={filters}
                onChange={update}
              />
            )}
          </QueryState>
        </Container>
      </Section>

      <ContactBand />
    </>
  )
}

/** Rail and grid, once the catalogue has arrived. */
function CatalogBody({
  categories,
  products,
  filters,
  onChange,
}: {
  categories: Category[]
  products: Product[]
  filters: CatalogFilters
  onChange: (next: Partial<CatalogFilters>) => void
}) {
  const { t } = useLanguage()

  const counts = useMemo(() => countByCategory(products, categories), [products, categories])
  const visible = useMemo(
    () => filterProducts(products, categories, filters),
    [products, categories, filters],
  )
  const categoryById = useMemo(
    () => new Map(categories.map((entry) => [entry.id, entry])),
    [categories],
  )
  // Built HERE, where the products are, because publicTree needs the counts to
  // decide what is worth showing. See the note on `branches` in the rail.
  const branches = useMemo(
    () => publicTree(buildCategoryTree(categories, products)),
    [categories, products],
  )

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Sticky on desktop so the rail stays reachable down a long grid, and
          simply stacked above it on a phone, where sticky would eat the screen. */}
      <aside className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
        <CatalogFilterRail
          branches={branches}
          counts={counts}
          total={products.length}
          filters={filters}
          onChange={onChange}
        />
      </aside>

      <div className="lg:col-span-9">
        <p className="at-label border-b border-hairline pb-5 text-muted" aria-live="polite">
          {t('catalog.resultCount', { count: visible.length })}
        </p>

        {/*
         * TWO ACROSS ON A PHONE, not one.
         *
         * One-up put a single card at 658px — 81% of an 812px screen — so
         * nineteen products came to 15.5 screens of scrolling. This is the page
         * whose entire premise is finding things WITHOUT a search box, and a
         * visitor cannot scan or compare what they can only see one of at a
         * time. Two-up halves the scroll and puts a pair in view at once.
         *
         * The home page's featured row stays one-up on a phone on purpose: six
         * pieces chosen as a showcase are a different job from nineteen to be
         * scanned.
         */}
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-heading text-xl text-ink">{t('catalog.noResultsTitle')}</p>
            <p className="mt-3 text-sm text-muted">{t('catalog.noResultsBody')}</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 xl:grid-cols-3">
            {visible.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoryById.get(product.category_id)}
                eager={index < 3}
                dense
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
