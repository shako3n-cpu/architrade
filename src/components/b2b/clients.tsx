import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { CLIENTS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * The reference wall — who the work was for.
 *
 * GREY UNTIL YOU LOOK AT IT
 *   Every name sits in muted grey and comes up to full graphite under the
 *   cursor, with the bronze rule above it drawing in from the left. That is
 *   the grayscale-to-highlight behaviour a logo wall wants, done with type:
 *   the wall stays quiet as a block, and any single name can be picked out.
 *
 *   A licensed logo file on a row renders in its place, greyscaled by the
 *   same rule and returning to colour on hover. Rows can be converted one at
 *   a time — see the note on CLIENTS in src/data/company.ts for why they are
 *   type today.
 *
 * A grid rather than a slider. A slider hides two thirds of the list behind a
 * timer and makes the reader wait to check for their own sector; twenty names
 * fit on one screen and answer the question at a glance.
 */
export function B2bClients() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" bordered id="clients" aria-labelledby="clients-title">
      <Container>
        <SectionHeading
          id="clients-title"
          eyebrow={t('b2b.clients.eyebrow')}
          title={t('b2b.clients.title')}
          description={t('b2b.clients.description')}
        />

        <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-px sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CLIENTS.map((client) => (
            <li key={client.name} className="group">
              <div className="relative flex min-h-24 items-center border-t border-hairline pt-5 md:min-h-28">
                {/* The bronze rule that draws in from the left on hover — the
                    same gesture the header navigation uses, so the page has
                    one idea of what "you are pointing at this" looks like. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100"
                />

                {client.logo ? (
                  /*
                   * mix-blend-multiply, and it is load-bearing. The files are
                   * palette PNGs with no alpha, so each carries a solid white
                   * ground — dropped straight on they would be sixteen white
                   * cards on an off-white page, the one thing the hairline
                   * language never does. Multiply folds pure white into
                   * whatever sits behind it and leaves the ink alone.
                   * It depends on this band staying LIGHT; on a graphite
                   * section the trick inverts and the marks vanish.
                   */
                  <img
                    src={client.logo}
                    alt={client.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-10 w-auto object-contain opacity-85 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-100"
                  />
                ) : (
                  <span className="font-heading text-base leading-snug text-muted transition-colors duration-300 group-hover:text-ink md:text-lg">
                    {client.name}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted">{t('b2b.clients.note')}</p>
      </Container>
    </Section>
  )
}
