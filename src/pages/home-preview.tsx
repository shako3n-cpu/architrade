import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'

/**
 * TEMPORARY home page — step 2 review only.
 *
 * Just enough hero to show the header sitting transparently over full-bleed
 * photography and then gaining its background on scroll. The real home page
 * with all nine sections is the next step.
 */
export function HomePreview() {
  const { localePath, t } = useLanguage()

  return (
    <>
      <section className="relative flex min-h-dvh items-center">
        {/* Full-bleed hero photograph. Eager + high priority: this is the
            largest contentful paint on the page. */}
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2000&q=80"
          alt="Minimal living room with a linen sofa and oak table in afternoon light"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay keeps the headline readable over any photograph. */}
        <div aria-hidden="true" className="absolute inset-0 bg-background/65" />

        <Container className="relative">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl text-ink md:text-6xl lg:text-7xl">
              ARCHTRADE
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted">
              Header preview — scroll down and watch the background fade in.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="solid">
                <Link to={localePath('/catalog')}>{t('common.viewCatalog')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={localePath('/contact')}>{t('common.contactUs')}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="lg">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Step 2 of 3"
            title="Header and footer"
            description="Resize the window below 1024px to get the drawer. Switch KA / EN / RU and note the page stays put."
          />
          <div className="h-[60vh]" />
        </Container>
      </Section>
    </>
  )
}
