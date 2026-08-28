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

        {/* Eight across is exactly two rows for sixteen marks. The column count
            is doing arithmetic, not decoration — change the length of CLIENTS
            and this needs changing with it.

            Eight only from `xl`, not `lg`. At 1024px eight columns leaves 93px
            a cell, which clamps the marks back down to ~42px tall — smaller
            than the size this layout exists to increase. Below xl it falls to
            four columns and four rows, which is the honest trade: two rows is
            worth having only while the logos stay big enough to read. */}
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-px sm:grid-cols-4 xl:grid-cols-8">
          {CLIENTS.map((client) => (
            <li key={client.name} className="group">
              <div className="relative flex min-h-28 items-center justify-center border-t border-hairline pt-5 md:min-h-32">
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
                    className="max-h-14 w-auto max-w-full object-contain mix-blend-multiply md:max-h-16"
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
