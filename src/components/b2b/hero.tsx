import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { BRANDS, PROJECTS, SECTORS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'

/**
 * The opening statement.
 *
 * A FURNISHED ROOM, NOT A SKYLINE
 *   This used to be a photograph of a glass tower, which is what a general
 *   contractor leads with. A furniture house has to show the thing it sells,
 *   so the hero is now an interior: seating, timber and light, held still
 *   under a flat graphite scrim. No video, no gradient, no carousel.
 *
 * THE FIGURES ARE COUNTED, NOT CLAIMED
 *   Every number in the rail below is derived from src/data/company.ts at
 *   render. Nobody has to remember to update a hard-coded "40+" when a project
 *   is added, and the page cannot drift into saying something untrue.
 */

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1616611213095-58abb651f70c?w=2000&q=80'

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
        {/* Wider measure than the old max-w-3xl. The Georgian headline is a
            third longer than the English one, and at 3xl it had nowhere to go
            but downwards. */}
        <div className="max-w-5xl">
          <Eyebrow className="text-brass-on-ink">{t('b2b.hero.eyebrow')}</Eyebrow>

          {/*
           * THE RESERVED BLOCK IS WHY THE PAGE STOPS JUMPING
           *   The headline sets to two lines in English and three in Georgian,
           *   so the hero — which is min-height, not height — grew by a whole
           *   line when you switched language and shoved the photograph and
           *   everything under it down the page.
           *
           *   No font size fixes that. The two strings are different lengths,
           *   so any size that puts English on three lines puts Georgian on
           *   four; the gap just moves. What fixes it is reserving the taller
           *   language's space in BOTH: `min-h` in `lh` units is exactly three
           *   lines of whatever this breakpoint's type is, so English simply
           *   leaves its third line empty and the hero measures the same in
           *   either language.
           *
           *   Sized down from 7xl as well — at 72px the Georgian ran to four
           *   lines and read as shouting rather than as a statement.
           */}
          <h1 className="mt-6 min-h-[4lh] text-4xl text-background md:text-5xl lg:min-h-[3lh] lg:text-6xl">
            {t('b2b.hero.title')}
          </h1>

          {/* Reserved for the same reason as the headline above: the Georgian
              description runs to five lines where the English runs to four, so
              without this the hero still moved by ~29px on a language switch
              even once the headline was pinned. Only from `md` — on a phone
              both languages wrap far past five lines anyway, and reserving
              there would just open a hole under the text. */}
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink-muted md:min-h-[5lh] md:text-lg">
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
