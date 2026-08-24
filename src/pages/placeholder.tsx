import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'

/**
 * TEMPORARY — a stand-in for pages that have not been built yet.
 *
 * It exists only so every link in the header, drawer and footer leads
 * somewhere real while the layout is being reviewed. Each of these gets
 * replaced by its own page file in the steps that follow.
 */
export function Placeholder({ title }: { title: string }) {
  return (
    <Section spacing="lg">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Not built yet"
          title={title}
          description="This page is a placeholder. Scroll down to check the footer, and scroll back up to watch the header change."
        />

        {/* Enough height to make the sticky header behaviour observable. */}
        <div className="h-[70vh]" />
      </Container>
    </Section>
  )
}
