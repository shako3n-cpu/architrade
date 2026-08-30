import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/catalog/product-card'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'

/**
 * "You might also like" — other pieces, preferring the same category.
 *
 * Which pieces these are is decided in fetchRelatedProducts, not here; this
 * component only draws them. It renders nothing at all when the catalogue is
 * too small to suggest anything, because an empty band under a product reads
 * as a bug rather than as a young catalogue.
 */
export function RelatedProducts({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const { localePath, t } = useLanguage()

  if (products.length === 0) return null

  // One lookup built once, rather than a .find() inside every card.
  const byId = new Map(categories.map((category) => [category.id, category]))

  return (
    <Section spacing="lg" bordered aria-labelledby="related-title">
      <Container>
        <SectionHeading
          id="related-title"
          as="h2"
          eyebrow={t('product.relatedEyebrow')}
          title={t('product.relatedTitle')}
          description={t('product.relatedDescription')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={localePath('/catalog')}>{t('common.viewCatalog')}</Link>
            </Button>
          }
        />

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-14 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={product.category_id ? byId.get(product.category_id) : undefined}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
