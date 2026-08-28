import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { CLIENTS } from '@/data/clients'
import { useLanguage } from '@/hooks/use-language'

/**
 * The reference wall — who the work was for, as their own logos.
 *
 * WHY mix-blend-multiply
 *   The logo files are palette PNGs with no alpha, so each one carries a
 *   solid white ground. Dropped straight onto the page they would read as
 *   sixteen white cards on an off-white background — the one thing the
 *   hairline design language never does. Multiply blends pure white into
 *   whatever is behind it and leaves the ink alone, so the marks sit
 *   directly on the page. It relies on this section keeping a LIGHT
 *   background; on a dark band the trick inverts and the logos disappear.
 *
 * WHY A GRID AND NOT A SLIDER
 *   A slider hides two thirds of the list behind a timer and makes a
 *   procurement lead wait to check for their own sector. Sixteen marks fit
 *   on one screen and answer the question at a glance.
 *
 * The marks are set at a common HEIGHT rather than a common width, because a
 * wordmark and a roundel of equal width read at wildly different weights.
 */
export function Clients() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" bordered aria-labelledby="clients-title">
      <Container>
        <SectionHeading
          id="clients-title"
          as="h2"
          eyebrow={t('home.clientsEyebrow')}
          title={t('home.clientsTitle')}
          description={t('home.clientsDescription')}
        />

        <ul className="mt-14 grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {CLIENTS.map((client) => (
            <li key={client.name} className="flex items-center justify-center">
              <img
                src={client.logo}
                alt={client.name}
                loading="lazy"
                decoding="async"
                className="h-11 w-auto max-w-full object-contain opacity-85 mix-blend-multiply transition-opacity duration-300 hover:opacity-100 md:h-12"
              />
            </li>
          ))}
        </ul>

        <p className="mt-14 text-sm text-muted">{t('home.clientsNote')}</p>
      </Container>
    </Section>
  )
}
