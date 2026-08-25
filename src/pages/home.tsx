import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { QueryState, SkeletonGrid } from '@/components/ui/query-state'
import { Hero } from '@/components/home/hero'
import { CategoryGroupSection } from '@/components/home/category-group'
import { FeaturedGrid } from '@/components/home/featured-grid'
import { ValuePoints } from '@/components/home/value-points'
import { ContactBand } from '@/components/home/contact-band'
import { useCatalogue } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'
import { categoryGroup } from '@/lib/localize'

/**
 * The home page.
 *
 * Order is deliberate: say what ARCHTRADE is, split the catalogue the way a
 * visitor already thinks about it (home or office), show real pieces, answer
 * the four obvious questions, then hand over to a conversation.
 *
 * The hero, the value points and the contact band need no data, so they render
 * immediately and stay on screen while the catalogue loads underneath them.
 */
export function Home() {
  const { t } = useLanguage()
  const catalogue = useCatalogue()

  return (
    <>
      <Hero />

      <QueryState
        result={catalogue}
        skeleton={
          <Section spacing="lg" bordered>
            <Container>
              <SkeletonGrid count={6} className="lg:grid-cols-3" />
            </Container>
          </Section>
        }
        isEmpty={(data) => data.categories.length === 0}
      >
        {({ categories, products }) => (
          <>
            <CategoryGroupSection
              id="home-furniture"
              eyebrow={t('home.categoriesEyebrow')}
              title={t('home.groupHomeTitle')}
              description={t('home.groupHomeDescription')}
              categories={categories.filter((c) => categoryGroup(c) === 'home')}
              products={products}
            />

            <CategoryGroupSection
              id="office-furniture"
              eyebrow={t('home.categoriesEyebrow')}
              title={t('home.groupOfficeTitle')}
              description={t('home.groupOfficeDescription')}
              categories={categories.filter((c) => categoryGroup(c) === 'office')}
              products={products}
            />

            <FeaturedGrid products={products} categories={categories} />
          </>
        )}
      </QueryState>

      <ValuePoints />
      <ContactBand />
    </>
  )
}
