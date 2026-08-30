import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/b2b/page-header'
import { B2bClients } from '@/components/b2b/clients'
import { ContactBand } from '@/components/home/contact-band'
import { DISCIPLINES, type Discipline } from '@/data/company'
import { useBrands } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'

/**
 * /collections — the six settings archtrade furnishes.
 *
 * "Collection" on a furniture site usually means one designer's range. Here
 * it means a setting: everything that goes into a working floor, or a hotel
 * lobby, or a terrace. That is how a specifier procures — nobody buys "the
 * Aria range", they furnish an office — and it is how the trading pages on
 * the company's own site divide.
 *
 * The manufacturer count on each row is COUNTED from the brand roster, so a
 * partner added to src/data/company.ts appears here without anyone editing
 * this page.
 */

const IMAGES: Record<Discipline, string> = {
  office: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1400&q=80',
  hospitality: 'https://images.unsplash.com/photo-1776361984994-089a9df800f6?w=1400&q=80',
  residential: 'https://images.unsplash.com/photo-1597425842320-de0c26b33327?w=1400&q=80',
  lighting: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1400&q=80',
  outdoor: 'https://images.unsplash.com/photo-1600210492090-a159ffa3aeaf?w=1400&q=80',
  acoustics: 'https://images.unsplash.com/photo-1756480734230-a7680051fc26?w=1400&q=80',
}

export function Collections() {
  const { t, localePath } = useLanguage()

  /*
   * The houses named on each card come from the database, so a brand added or
   * hidden in the dashboard changes these counts and these lists without a
   * deploy. There is deliberately no loading state around them: the six cards
   * are about the DISCIPLINES, which are fixed, and the manufacturer names are
   * supporting detail. Holding the whole page back for them would trade a
   * complete page that fills in for a blank one that arrives all at once.
   */
  const rows = useBrands().data ?? []

  return (
    <>
      <PageHeader
        eyebrow={t('b2b.pages.collectionsEyebrow')}
        title={t('b2b.pages.collectionsTitle')}
        description={t('b2b.pages.collectionsDescription')}
      />

      <Section spacing="lg">
        <Container>
          <ul className="grid gap-px border border-hairline bg-hairline lg:grid-cols-2">
            {DISCIPLINES.map((discipline) => {
              const inDiscipline = rows.filter((brand) => brand.discipline === discipline)
              const count = inDiscipline.length

              return (
                <li key={discipline} className="group relative bg-background">
                  <article className="flex h-full flex-col">
                    <div className="relative isolate aspect-[16/10] overflow-hidden bg-surface">
                      <img
                        src={IMAGES[discipline]}
                        alt=""
                        loading="lazy"
                        className="at-zoom h-full w-full object-cover"
                      />
                      <div aria-hidden="true" className="at-scrim absolute inset-0" />

                      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                        <Eyebrow className="text-brass-on-ink">
                          {t('b2b.collections.brandCount', { count })}
                        </Eyebrow>
                        <h2 className="mt-2 text-2xl text-background md:text-3xl">
                          {t(`b2b.brands.${discipline}`)}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6 md:p-8">
                      <p className="text-base leading-relaxed text-muted">
                        {t(`b2b.collections.${discipline}Body`)}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-hairline pt-5">
                        {inDiscipline.map((brand) => (
                          <span key={brand.id} className="at-label text-muted">
                            {brand.name}
                          </span>
                        ))}
                      </div>

                      {/*
                       * TO THE HOUSES IT JUST NAMED, NOT TO THE BARE CATALOGUE.
                       *
                       * All six cards used to point at /catalog. The card said
                       * "architectural lighting", listed the six manufacturers
                       * in it, and then delivered the whole undifferentiated
                       * list — the one page on the site whose job is routing by
                       * discipline routed everything to the same place.
                       *
                       * /brands reads its filter from the URL now, so this can
                       * land on the discipline the visitor was just reading
                       * about.
                       *
                       * The `::after` stretches this link over the whole card,
                       * so a 565px block on a phone is not navigated by one
                       * small button at the bottom of it. The card carries no
                       * other interactive element, so nothing is swallowed.
                       */}
                      <div className="mt-7">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to={localePath(`/brands?d=${discipline}`)}
                            className="after:absolute after:inset-0 after:content-['']"
                          >
                            {t('b2b.collections.explore')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </Container>
      </Section>

      <B2bClients />
      <ContactBand />
    </>
  )
}
