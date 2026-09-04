import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { useLanguage } from '@/hooks/use-language'

/**
 * TEMPORARY — a stand-in for pages that have not been built yet.
 *
 * It exists only so every link in the header, drawer and footer leads
 * somewhere real while the layout is being reviewed. Each of these gets
 * replaced by its own page file in the steps that follow.
 *
 * THE TITLE ARRIVES AS A KEY, NOT AS TEXT
 *   These pages sit under /:lang like every other public page, so a Georgian
 *   visitor reaches /ka/privacy and must not be met with an English heading.
 *   Passing `titleKey` keeps the lookup here, where the language is known,
 *   rather than in the route table, where it is not.
 *
 *   The keys are the ones the footer and the header already use for the same
 *   words — footer.privacy, footer.terms, nav.showroom — so the link a
 *   visitor clicked and the heading they land on cannot drift apart.
 */
export function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useLanguage()

  return (
    <Section spacing="lg">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow={t('state.placeholderEyebrow')}
          title={t(titleKey)}
          description={t('state.placeholderBody')}
        />

        {/* Enough height to make the sticky header behaviour observable. */}
        <div className="h-[70vh]" />
      </Container>
    </Section>
  )
}
