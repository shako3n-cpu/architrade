import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { PROCESS_STEPS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * How a job actually runs.
 *
 * THE STATEMENT USED TO OPEN THIS SECTION, AND NOW OPENS THE PAGE
 *   There was an eyebrow, a heading and the company statement set in serif
 *   above the steps. /about is this component's only caller, and that page
 *   already had a header of its own, so the two stacked up and said the same
 *   thing twice before a visitor reached the first step. The heading and the
 *   statement moved up into the page header; what is left here is the process,
 *   which is the part the page did not already say.
 *
 *   The serif treatment did not survive the move — PageHeader sets its
 *   standfirst in the body face, like every other interior page. Worth
 *   knowing if the serif is wanted back: it belongs on the page header, not
 *   restored here, or the duplication comes with it.
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
        {/* Now the section's own heading, so it is an h2 rather than the h3 it
            was while sitting under one. The outline runs h1 -> h2 with nothing
            skipped. */}
        <SectionHeading
          id="company-title"
          eyebrow={t('b2b.about.processEyebrow')}
          title={t('b2b.about.processTitle')}
          as="h2"
          size="h3"
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
