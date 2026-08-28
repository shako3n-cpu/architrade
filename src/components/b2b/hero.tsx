import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { BRANDS, PROJECTS, SECTORS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * The opening statement.
 *
 * A single architectural photograph under a flat graphite scrim — no video,
 * no gradient, no carousel. One building, held still, is the most honest thing
 * a contractor can lead with.
 *
 * THE FIGURES ARE COUNTED, NOT CLAIMED
 *   Every number in the rail below is derived from src/data/company.ts at
 *   render. Nobody has to remember to update a hard-coded "40+" when a project
 *   is added, and the page cannot drift into saying something untrue.
 */

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=2000&q=80'

export function B2bHero() {
  const { t, localePath } = useLanguage()

  const projectCount = PROJECTS.reduce((total, group) => total + group.projects.length, 0)

  const figures = [
    { value: projectCount, label: t('b2b.hero.statProjects') },
    { value: BRANDS.length, label: t('b2b.hero.statBrands') },
    { value: SECTORS.length, label: t('b2b.hero.statSectors') },
  ]

  return (
    <section className="relative isolate flex min-h-[38rem] flex-col justify-end overflow-hidden bg-graphite-deep lg:min-h-[44rem]">
      <img
        src={HERO_IMAGE}
        alt=""
        // The one image on the site that must never lazy-load: it is the first
        // thing above the fold and the page is mostly it.
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="at-scrim absolute inset-0 -z-10" />

      {/* The survey mark, sized off the container gutter so its corners sit on
          the same line as the text rather than floating near it. */}
      <div
        aria-hidden="true"
        className="at-survey pointer-events-none absolute inset-x-5 inset-y-8 -z-10 sm:inset-x-8 lg:inset-x-12"
      />

      <Container className="pt-32 pb-14 md:pt-44 md:pb-20">
        <div className="max-w-3xl">
          <Eyebrow className="text-brass-on-ink">{t('b2b.hero.eyebrow')}</Eyebrow>

          <h1 className="mt-6 text-4xl text-background md:text-6xl lg:text-7xl">
            {t('b2b.hero.title')}
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            {t('b2b.hero.description')}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg">
              <Link to={localePath('/catalog')}>{t('b2b.hero.ctaCatalog')}</Link>
            </Button>

            {/* Outline on a photograph needs its own colours — the default
                hairline and ink are both invisible against graphite. */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/50 text-background hover:border-background hover:bg-background hover:text-ink"
            >
              <Link to={localePath('/contact')}>{t('b2b.hero.ctaConsult')}</Link>
            </Button>
          </div>
        </div>
      </Container>

      <div className="relative border-t border-background/15">
        <Container>
          <dl className="grid grid-cols-3">
            {figures.map((figure, index) => (
              <div
                key={figure.label}
                className={
                  index > 0
                    ? 'border-l border-background/15 py-6 pl-5 sm:pl-8'
                    : 'py-6 pr-5 sm:pr-8'
                }
              >
                <dd className="font-heading text-2xl text-background md:text-3xl">
                  {figure.value}
                </dd>
                <dt className="at-label mt-1 text-ink-muted">{figure.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  )
}
