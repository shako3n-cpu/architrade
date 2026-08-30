import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/catalog/product-card'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'

/**
 * How many pieces the home page shows before sending people to the catalogue.
 *
 * Six, not eight, because the grid is three across rather than four. Four
 * portrait cards on a 1280px page leave each one about 290px wide, which is
 * the width a search-results page gives a product — the pictures get small
 * enough that the card becomes a row of text with a thumbnail on top. Three
 * across is nearer 400px, and the photograph stays the thing you look at.
 */
const LIMIT = 6

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
    <Section spacing="lg" aria-labelledby="featured-title">
      <Container>
        <SectionHeading
          id="featured-title"
          as="h2"
          size="h3"
          eyebrow={t('home.featuredEyebrow')}
          title={t('home.featuredTitle')}
          description={t('home.featuredDescription')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={localePath('/catalog')}>{t('common.viewCatalog')}</Link>
            </Button>
          }
        />

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-14 sm:gap-x-10 sm:gap-y-16 lg:grid-cols-3">
          {shown.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              category={product.category_id ? byId.get(product.category_id) : undefined}
              // The first row is usually visible without scrolling.
              eager={index < 3}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
