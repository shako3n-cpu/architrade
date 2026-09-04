import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { useLanguage } from '@/hooks/use-language'

/**
 * The catch-all route, for an address that matches nothing.
 *
 * SEPARATE FROM Placeholder, because the two say opposite things. A
 * placeholder page is one we are writing and will publish; this address does
 * not exist and never will. Telling somebody who mistyped a URL that the page
 * is "coming soon" sends them back to wait for something that is not on its
 * way — which is what the shared component used to do.
 *
 * The wording follows category.notFoundTitle, the not-found state the
 * catalogue already shows, so the site answers a missing page the same way
 * wherever the visitor meets one.
 */
export function NotFound() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg">
      <Container>
        <SectionHeading
          as="h1"
          title={t('state.notFoundTitle')}
          description={t('state.notFoundBody')}
        />
      </Container>
    </Section>
  )
}
