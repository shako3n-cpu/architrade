import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { CLIENTS } from '@/data/clients'
import { useLanguage } from '@/hooks/use-language'

/**
 * The reference wall — who the work was for.
 *
 * GREY UNTIL YOU LOOK AT IT
 *   Every name sits in muted grey and comes up to full ink under the cursor,
 *   with the bronze rule above it drawing in from the left — the same
 *   grayscale-to-highlight behaviour a logo wall wants, done with type.
 *
 *   A licensed logo file on a row renders in its place, greyscaled by the
 *   same rule and returning to colour on hover. Rows can be converted one at
 *   a time — see the note on CLIENTS in src/data/clients.ts.
 *
 * A grid rather than a slider: a slider hides two thirds of the list behind
 * a timer, and twenty names fit on one screen without making anyone wait.
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

        <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-px sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CLIENTS.map((client) => (
            <li key={client.name} className="group">
              <div className="relative flex min-h-24 items-center border-t border-hairline pt-5 md:min-h-28">
                {/* The bronze rule that draws in from the left on hover — the
                    same gesture the header navigation uses. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100"
                />

                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.name}
                    loading="lazy"
                    className="max-h-10 w-auto grayscale opacity-70 transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
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

        <p className="mt-10 text-sm text-muted">{t('home.clientsNote')}</p>
      </Container>
    </Section>
  )
}
