import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { SectionHeading } from '@/components/ui/section-heading'
import { PROCESS_STEPS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * Who the company is, and how a job actually runs.
 *
 * THE ONE SERIF ON THE SITE
 *   The statement is set in the serif face, and it is the only place that
 *   happens. Everything else is the grotesque. Used once, the change of voice
 *   marks this as the company speaking rather than the interface describing
 *   it; used twice it would just be a second font.
 *
 * THE NUMBERS ARE REAL
 *   Brief, specify, supply, install is a sequence — you cannot ship what has
 *   not been specified — so numbering it encodes something true. Numbering a
 *   set of features that happen in no order would be decoration, and is
 *   exactly what this avoids elsewhere on the page.
 */
export function B2bCompany() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" bordered id="company" aria-labelledby="company-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow className="text-brass">{t('b2b.about.eyebrow')}</Eyebrow>
            <h2 id="company-title" className="mt-4 text-3xl text-ink md:text-4xl lg:text-5xl">
              {t('b2b.about.title')}
            </h2>
          </div>

          <blockquote className="lg:col-span-7">
            <p className="font-serif text-xl leading-relaxed text-ink md:text-2xl">
              {t('b2b.about.statement')}
            </p>
          </blockquote>
        </div>
      </Container>

      <Container className="mt-20 md:mt-28">
        <SectionHeading
          eyebrow={t('b2b.about.processEyebrow')}
          title={t('b2b.about.processTitle')}
          as="h3"
        />

        <ol className="mt-12 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step} className="bg-background p-6 md:p-8">
              {/* The step number, set as a drawing reference rather than a
                  badge — no circle, no fill, just the figure and a rule. */}
              <span className="at-label block text-brass">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="mt-5 block border-t border-hairline pt-5 font-heading text-xl text-ink md:text-2xl">
                {t(`b2b.about.${step}Name`)}
              </span>

              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t(`b2b.about.${step}Body`)}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
