import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { SERVICES } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * The four disciplines, named but not photographed — the home page's pointer
 * at /services rather than a second copy of it.
 *
 * WHY THIS EXISTS AT ALL
 *   The home page used to render B2bServices itself, which meant /services
 *   was a strict subset of the home page and gave a visitor no reason to open
 *   it. The full treatment — a photograph per discipline, at half the width
 *   of the page — now lives on /services alone, and this states the same four
 *   names in a quarter of the height so the home page can get to the
 *   catalogue.
 *
 * Type, not pictures, is the whole point of the difference: the photographs
 * are what make the services page worth the click.
 */
export function ServicesTeaser() {
  const { t, localePath } = useLanguage()

  return (
    <Section spacing="lg" bordered id="services" aria-labelledby="services-teaser-title">
      <Container>
        <SectionHeading
          id="services-teaser-title"
          eyebrow={t('b2b.services.eyebrow')}
          title={t('b2b.services.title')}
          description={t('b2b.services.description')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={localePath('/services')}>
                {t('b2b.services.teaserCta')}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <ul className="mt-14 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <li key={service.id} className="bg-background p-6 md:p-8">
              <h3 className="font-heading text-xl text-ink md:text-2xl">
                {t(`b2b.services.${service.id}Name`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t(`b2b.services.${service.id}Body`)}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
