import { Ruler, ShieldCheck, TreePine, Truck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { useLanguage } from '@/hooks/use-language'

/**
 * Why ARCHTRADE — the four things a buyer wants to know before they call.
 *
 * Icons, not photographs: this band is a pause between two heavy image grids,
 * and the whitespace is the point.
 */
export function ValuePoints() {
  const { t } = useLanguage()

  const points = [
    { icon: TreePine, title: t('home.why1Title'), body: t('home.why1Body') },
    { icon: Ruler, title: t('home.why2Title'), body: t('home.why2Body') },
    { icon: Truck, title: t('home.why3Title'), body: t('home.why3Body') },
    { icon: ShieldCheck, title: t('home.why4Title'), body: t('home.why4Body') },
  ]

  return (
    <Section spacing="lg" bordered className="bg-surface" aria-labelledby="why-title">
      <Container>
        <SectionHeading
          id="why-title"
          as="h2"
          eyebrow={t('home.whyEyebrow')}
          title={t('home.whyTitle')}
          description={t('home.whyDescription')}
        />

        <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="border-t border-hairline pt-6">
              <Icon aria-hidden="true" className="size-6 stroke-[1.25] text-brass" />
              <h3 className="mt-5 font-heading text-lg text-ink">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
