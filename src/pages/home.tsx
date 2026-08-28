import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { QueryState, SkeletonGrid } from '@/components/ui/query-state'
import { B2bHero } from '@/components/b2b/hero'
import { ServicesTeaser } from '@/components/b2b/services-teaser'
import { CompanyTeaser } from '@/components/b2b/company-teaser'
import { B2bClients } from '@/components/b2b/clients'
import { CategoryGroupSection } from '@/components/home/category-group'
import { FeaturedGrid } from '@/components/home/featured-grid'
import { ContactBand } from '@/components/home/contact-band'
import { useCatalogue } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'

/**
 * The home page.
 *
 * THE ARGUMENT, IN ORDER
 *   A procurement lead arrives asking one question — can these people supply
 *   my building — and the page answers it before it sells anything:
 *
 *     what we do        the four disciplines, named       -> /services
 *     what we supply    the live catalogue
 *     who we are        the company statement             -> /about
 *     who for           the reference wall — the last word is a fact
 *     talk to us
 *
 *   The catalogue sits in the middle deliberately. It is the part of the site
 *   that changes daily, but nobody specifies a fit-out from a product grid; it
 *   earns its place only after the company has been established.
 *
 * TEASERS, NOT THE SECTIONS THEMSELVES
 *   This page used to render B2bServices, B2bBrandCards and B2bCompany in
 *   full, which made /services and /about strict SUBSETS of it — every section
 *   on either page was already here, so opening them showed a visitor nothing
 *   they had not just scrolled past. The home page now states each argument
 *   once and links onward:
 *
 *     the photographed services and the partner houses  live on /services
 *     the four process steps                            live on /about
 *     the client wall                                   lives here
 *
 *   Keep it that way. Adding a full section back here is what caused the
 *   duplication the first time.
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
      <ServicesTeaser />

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
            {/*
             * ONE SECTION, NOT TWO.
             *   This used to be a home half and an office half, filtered on
             *   `group_key`. That split made sense while the catalogue was cut
             *   by ROOM. It is now cut by what the thing IS — furniture,
             *   lighting, acoustics, public seating — and a lighting pendant
             *   belongs to an office and a living room equally, so the halves
             *   had nothing left to divide. Rendering both would have left the
             *   office one permanently empty, showing "this part of the
             *   catalogue has not been set up yet" on the home page.
             *
             *   Ordering is the database's, not this file's: the query sorts
             *   on `sort_order`, which follows archtrade.ge's own menu.
             */}
            <CategoryGroupSection
              id="catalogue"
              eyebrow={t('home.categoriesEyebrow')}
              title={t('home.catalogueTitle')}
              description={t('home.catalogueDescription')}
              categories={categories}
              products={products}
            />

            <FeaturedGrid products={products} categories={categories} />
          </>
        )}
      </QueryState>

      <CompanyTeaser />
      <B2bClients />
      <ContactBand />
    </>
  )
}
