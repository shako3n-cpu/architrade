import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { QueryState } from '@/components/ui/query-state'
import { ProductCard } from '@/components/catalog/product-card'
import { useLanguage } from '@/hooks/use-language'
import { useCatalogue } from '@/hooks/use-catalog'
import type { Category, Product } from '@/data/types'
import { categoryTitle } from '@/lib/localize'

/**
 * TEMPORARY — data review only.
 *
 * Renders the live Supabase catalogue grouped by category so the data can be
 * checked before the real catalogue page is designed. This is NOT the
 * catalogue: no filters, no sorting, no search, no pagination.
 *
 * It uses the same <ProductCard> as the home page on purpose — if a piece
 * looks wrong here it looks wrong there too.
 */
export function CatalogPreview() {
  const { t } = useLanguage()
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
function CategoryBlock({ category, products }: { category: Category; products: Product[] }) {
  const { lang, t } = useLanguage()

  return (
    <Section spacing="md" bordered>
      <SectionHeading
        as="h2"
        eyebrow={t('catalog.resultCount', { count: products.length })}
        title={categoryTitle(category, lang)}
      />

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t('state.emptyBody')}</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} category={category} />
          ))}
        </div>
      )}
    </Section>
  )
}
