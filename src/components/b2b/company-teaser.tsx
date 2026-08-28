import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'

/**
 * The company statement, and a way through to the rest of it.
 *
 * The home page carried the whole B2bCompany section — statement AND the four
 * process steps — which made /about a strict subset of the home page. The
 * statement is the part that belongs in a summary; brief, specify, supply,
 * install is detail somebody goes looking for, so it now lives on /about
 * alone and this links to it.
 *
 * The serif is kept. It is the one place on the site the face is used, and
 * dropping it here to save a line would cost the page the change of voice
 * that marks this out as the company speaking rather than the interface.
 */
export function CompanyTeaser() {
  const { t, localePath } = useLanguage()

  return (
    <Section spacing="lg" bordered id="company" aria-labelledby="company-teaser-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow className="text-brass">{t('b2b.about.eyebrow')}</Eyebrow>
            <h2
              id="company-teaser-title"
              className="mt-4 text-3xl text-ink md:text-4xl lg:text-5xl"
            >
              {t('b2b.about.title')}
            </h2>
          </div>

          <div className="lg:col-span-7">
            <blockquote>
              <p className="font-serif text-xl leading-relaxed text-ink md:text-2xl">
                {t('b2b.about.statement')}
              </p>
            </blockquote>

            <Button asChild variant="outline" size="sm" className="mt-10">
              <Link to={localePath('/about')}>
                {t('b2b.about.teaserCta')}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
