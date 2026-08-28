import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/b2b/page-header'
import { B2bClients } from '@/components/b2b/clients'
import { ContactBand } from '@/components/home/contact-band'
import { BRANDS, DISCIPLINES, type Discipline } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * /collections — the five disciplines archtrade specifies within.
 *
 * "Collection" on a furniture site means a designer's range. Here it means a
 * discipline: everything that goes into a floor, or an envelope, or the
 * acoustic treatment of an open plan. That is how the company's own site
 * divides its trading pages, and it is how a specifier thinks — nobody
 * procures "the Aria range", they procure flooring.
 *
 * The manufacturer count on each row is COUNTED from the brand roster, so a
 * partner added to src/data/company.ts appears here without anyone editing
 * this page.
 */

const IMAGES: Record<Discipline, string> = {
  furniture: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80',
  lighting: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1400&q=80',
  flooring: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
  facades: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&q=80',
  acoustics: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80',
}

export function Collections() {
  const { t, localePath } = useLanguage()

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
              const count = BRANDS.filter((brand) => brand.discipline === discipline).length

              return (
                <li key={discipline} className="group bg-background">
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
                        {BRANDS.filter((brand) => brand.discipline === discipline).map((brand) => (
                          <span key={brand.name} className="at-label text-muted">
                            {brand.name}
                          </span>
                        ))}
                      </div>

                      <div className="mt-7">
                        <Button asChild variant="outline" size="sm">
                          <Link to={localePath('/catalog')}>{t('b2b.collections.explore')}</Link>
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
