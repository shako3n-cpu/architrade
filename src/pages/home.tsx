import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { QueryState, SkeletonGrid } from '@/components/ui/query-state'
import { B2bHero } from '@/components/b2b/hero'
import { B2bServices } from '@/components/b2b/services'
import { B2bProjects } from '@/components/b2b/projects'
import { B2bBrandWall } from '@/components/b2b/brand-wall'
import { B2bCompany } from '@/components/b2b/company'
import { CategoryGroupSection } from '@/components/home/category-group'
import { FeaturedGrid } from '@/components/home/featured-grid'
import { ContactBand } from '@/components/home/contact-band'
import { useCatalogue } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'
import { categoryGroup } from '@/lib/localize'

/**
 * The home page.
 *
 * THE ARGUMENT, IN ORDER
 *   A procurement lead arrives asking one question — can these people deliver
 *   my building — and the page answers it before it sells anything:
 *
 *     what we do        the four disciplines, held under one contract
 *     what we built     named projects in their own sector
 *     who we represent  the houses behind the specification
 *     what we supply    the live catalogue
 *     how we work       values, then the four steps of a job
 *     talk to us
 *
 *   The catalogue sits fourth deliberately. It is the part of the site that
 *   changes daily, but nobody buys a curtain wall from a product grid; it earns
 *   its place only after the company has been established.
 *
 * Everything above the catalogue needs no data, so it renders immediately and
 * stays on screen while the products load underneath.
 */
export function Home() {
  const { t } = useLanguage()
  const catalogue = useCatalogue()

  return (
    <>
      <B2bHero />
      <B2bServices />
      <B2bProjects />
      <B2bBrandWall />

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

      <B2bCompany />
      <ContactBand />
    </>
  )
}
