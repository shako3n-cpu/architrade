import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { BRANDS, PROJECTS, SECTORS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'
import { BELOW_SM, useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

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

/**
 * The sunlit living room the original site opened with — a linen sofa, an oak
 * table and tall windows — carried over here at the client's request. Lighter
 * than the graphite interior it replaces, so the scrim over it is doing real
 * work: check `at-scrim` in index.css before swapping this for anything
 * brighter still, or the headline starts to lose the background.
 */
const HERO_PHOTO_ID = 'photo-1618221195710-dd6b41faaea6'

/** One width of the hero photograph. */
const heroSrc = (width: number) =>
  `https://images.unsplash.com/${HERO_PHOTO_ID}?w=${width}&q=80`

/**
 * The hero is full-bleed and now full-height, so its width is the width of the
 * window — anywhere from a 360px phone to a 5K display. A single 2000px file
 * was the wrong size for nearly all of them: soft on a large or retina screen,
 * and several hundred wasted kilobytes on a phone.
 *
 * Offering the widths lets the browser pick using the screen AND the device
 * pixel ratio, which is something no fixed `src` can do. `sizes="100vw"` is
 * the honest declaration here: the image really is the full viewport width.
 */
const HERO_WIDTHS = [640, 960, 1280, 1600, 2000, 2560, 3200] as const
const HERO_SRCSET = HERO_WIDTHS.map((w) => `${heroSrc(w)} ${w}w`).join(', ')

export function B2bHero() {
  const { t, localePath } = useLanguage()
  const onPhone = useMediaQuery(BELOW_SM)

  const projectCount = PROJECTS.reduce((total, group) => total + group.projects.length, 0)

  const figures = [
    { value: projectCount, label: t('b2b.hero.statProjects') },
    { value: BRANDS.length, label: t('b2b.hero.statBrands') },
    { value: SECTORS.length, label: t('b2b.hero.statSectors') },
  ]

  /*
   * FULL SCREEN, MINUS THE HEADER.
   *   The header is fixed and <main> already pads itself down by its height,
   *   so a plain 100dvh on the section would run exactly one header past the
   *   bottom of the window. Subtracting it makes the photograph finish flush
   *   with the fold instead.
   *
   *   Still `min-h`, not `h`. On a short window — a laptop at 1280x600, a
   *   phone in landscape — the headline, description, buttons and figures
   *   together are taller than the screen, and a hard height would crop them.
   *   This way the hero fills the screen when there is room and grows when
   *   there is not.
   */
  return (
    <section className="relative isolate flex min-h-[calc(100dvh-var(--at-header-height))] flex-col justify-end overflow-hidden bg-graphite-deep">
      <img
        src={heroSrc(2000)}
        srcSet={HERO_SRCSET}
        sizes="100vw"
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

      {/* The top padding used to be pt-44, which was how the text got pushed
          down the screen back when the section was only 44rem tall. The
          section is now full-height and `justify-end` does that job, so all
          that padding did was make the content taller than the screen it is
          supposed to fit inside — 850px of content in 828px of room. */}
      <Container className="pt-24 pb-14 md:pt-28 md:pb-20">
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
          <h1 className="mt-6 min-h-[4lh] text-3xl text-background sm:text-4xl md:text-5xl lg:min-h-[3lh] lg:text-6xl">
            {t('b2b.hero.title')}
          </h1>

          {/* Reserved for the same reason as the headline above: the Georgian
              description runs to five lines where the English runs to four, so
              without this the hero still moved by ~29px on a language switch
              even once the headline was pinned. Only from `md` — on a phone
              both languages wrap far past five lines anyway, and reserving
              there would just open a hole under the text. */}
          {/*
           * A SHORTER STANDFIRST ON A PHONE, WRITTEN RATHER THAN TRUNCATED.
           *
           * The full line runs 263 characters, which sets to NINE lines and
           * 234px at 375px — most of the reason the hero came to 966px, and it
           * pushed the two buttons most of a screen down. Clamping it would
           * have cut Georgian mid-clause under a fade, which is worse than
           * either version of the sentence.
           *
           * So there are two written sentences and the phone gets the shorter:
           * the same claim — the agencies, and what they cover — with the list
           * of building types and the delivery promise left for the width that
           * can carry them.
           *
           * `md:min-h-[5lh]` still reserves five lines from `md` up, which is
           * what stops the hero jumping when the language switches. It is not
           * applied below that: both languages wrap well past five lines on a
           * phone, so reserving there would only open a hole.
           */}
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink-muted md:min-h-[5lh] md:text-lg">
            {t(onPhone ? 'b2b.hero.descriptionShort' : 'b2b.hero.description')}
          </p>

          {/*
           * A TWO-COLUMN GRID, NOT A FLEX ROW, AND THAT IS THE FIX
           *   Laid out with flex, each button was exactly as wide as its own
           *   label — so the Georgian pair came out visibly wider than the
           *   English pair and the buttons changed size under you when you
           *   switched language.
           *
           *   Equal columns inside a capped container decouples the size of
           *   the buttons from the length of the words: the two are always
           *   half the container each, in either language. The cap is what
           *   stops them stretching the full measure of the text above.
           */}
          <div className="mt-10 grid gap-3 sm:max-w-2xl sm:grid-cols-2 sm:gap-4">
            <Button asChild size="lg" className="w-full">
              <Link to={localePath('/catalog')}>{t('b2b.hero.ctaCatalog')}</Link>
            </Button>

            {/* Outline on a photograph needs its own colours — the default
                hairline and ink are both invisible against graphite. */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-background/50 text-background hover:border-background hover:bg-background hover:text-ink"
            >
              <Link to={localePath('/contact')}>{t('b2b.hero.ctaConsult')}</Link>
            </Button>
          </div>
        </div>
      </Container>

      <div className="relative border-t border-background/15">
        <Container>
          {/*
           * THREE ACROSS ONLY FROM `sm`.
           *   At 375px three columns are 112px each, and the labels are
           *   Georgian phrases — "ავეჯით აღჭურვილი პროექტი" broke to three
           *   lines of 11px type in a column narrower than the words. The
           *   figures were unreadable at exactly the size where the hero has
           *   least room to waste.
           *
           *   On a phone each figure becomes one ROW instead: number left,
           *   label right, hairline between. Same three facts, one line each,
           *   and less vertical space than the wrapped columns took.
           */}
          <dl className="grid grid-cols-1 sm:grid-cols-3">
            {figures.map((figure, index) => (
              <div
                key={figure.label}
                className={cn(
                  'flex items-baseline justify-between gap-4 py-4',
                  'sm:block sm:py-6',
                  // Rows divide with a rule above; columns with one to the left.
                  index > 0 && 'border-t border-background/15 sm:border-t-0 sm:border-l sm:pl-8',
                  index === 0 && 'sm:pr-8',
                )}
              >
                <dd className="font-heading text-2xl text-background md:text-3xl">
                  {figure.value}
                </dd>
                <dt className="at-label text-right text-ink-muted sm:mt-1 sm:text-left">
                  {figure.label}
                </dt>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  )
}
