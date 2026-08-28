import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { SERVICES } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * The four disciplines.
 *
 * Photographs rather than icons. A line drawing of a chair says "furniture";
 * a photograph of a floor full of it says which furniture, in what room, at
 * what quality. The scrim keeps the type legible without a gradient.
 *
 * Two columns on desktop, not four. Four would make each card a thumbnail, and
 * these are the four things the company sells.
 */
export function B2bServices() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" id="services" aria-labelledby="services-title">
      <Container>
        <SectionHeading
          id="services-title"
          eyebrow={t('b2b.services.eyebrow')}
          title={t('b2b.services.title')}
          description={t('b2b.services.description')}
        />

        <ul className="mt-14 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
          {SERVICES.map((service) => (
            <li key={service.id} className="group bg-background">
              <article className="flex h-full flex-col">
                <div className="relative isolate aspect-[16/10] overflow-hidden bg-surface">
                  <img
                    src={service.image}
                    alt=""
                    loading="lazy"
                    className="at-zoom h-full w-full object-cover"
                  />
                  <div aria-hidden="true" className="at-scrim absolute inset-0" />

                  <h3 className="absolute inset-x-0 bottom-0 p-6 text-2xl text-background md:p-8 md:text-3xl">
                    {t(`b2b.services.${service.id}Name`)}
                  </h3>
                </div>

                <p className="p-6 text-base leading-relaxed text-muted md:p-8">
                  {t(`b2b.services.${service.id}Body`)}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
