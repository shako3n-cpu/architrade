import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/catalog/product-card'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'

/** How many pieces the home page shows before sending people to the catalogue. */
const LIMIT = 8

/**
 * The featured row — pieces flagged `featured` in the database.
 *
 * If nobody has flagged anything yet it falls back to the newest pieces rather
 * than rendering an empty band, because an empty home page reads as a broken
 * site while a full one reads as a young catalogue.
 */
export function FeaturedGrid({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const { localePath, t } = useLanguage()

  const flagged = products.filter((product) => product.featured)
  const shown = (flagged.length > 0 ? flagged : products).slice(0, LIMIT)

  if (shown.length === 0) return null

  // One lookup built once, rather than a .find() inside every card.
  const byId = new Map(categories.map((category) => [category.id, category]))

  return (
    <Section spacing="lg" bordered aria-labelledby="featured-title">
      <Container>
        <SectionHeading
          id="featured-title"
          as="h2"
          eyebrow={t('home.featuredEyebrow')}
          title={t('home.featuredTitle')}
          description={t('home.featuredDescription')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={localePath('/catalog')}>{t('common.viewCatalog')}</Link>
            </Button>
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              category={product.category_id ? byId.get(product.category_id) : undefined}
              // The first row is usually visible without scrolling.
              eager={index < 4}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
