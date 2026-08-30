import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { BRANDS, DISCIPLINES, type Brand, type Discipline } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

type Filter = Discipline | 'all'

/**
 * The partner houses, as cards.
 *
 * WHAT REPLACED WHAT
 *   This was a hairline-ruled index — twenty-nine names in a table. An index
 *   is the right shape for a contractor's partner list and the wrong shape
 *   for a furniture house, where the entire question a specifier is asking is
 *   "what does their work look like". So each house now carries a room its
 *   work belongs in.
 *
 * THE NAME IS THE MARK
 *   Every logo on this list belongs to somebody else, and redrawing a
 *   manufacturer's wordmark by hand produces something that is not their logo
 *   while sitting where their logo goes. So the name is set in the heading
 *   face, centred, letterspaced, over the scrim. If the office licenses real
 *   logo files, put a path on `logo` in src/data/company.ts and the card
 *   shows the file instead — one row at a time, no other change.
 *
 * HOVER, WITHOUT A SHADOW
 *   The house rules forbid drop shadows, so "elevation" is done with light
 *   and a line: the photograph scales, the scrim lifts, and a bronze rule
 *   draws across the foot of the card. Same gesture as the navigation and the
 *   reference wall, so the page has one idea of what pointing at something
 *   looks like.
 */
export function B2bBrandCards({ showHeading = true }: { showHeading?: boolean }) {
  const { t } = useLanguage()

  /*
   * THE DISCIPLINE FILTER LIVES IN THE URL, NOT IN COMPONENT STATE.
   *
   * It was `useState`, which made a filtered view of this list impossible to
   * link to — and /collections needs exactly that. Each of its six cards
   * describes one discipline and names the manufacturers in it, and every one
   * of them pointed at the bare /catalog: the card promised "architectural
   * lighting" and delivered the whole undifferentiated catalogue.
   *
   * As a query parameter the view is addressable, so those cards can send a
   * visitor to the houses they were just reading about, and a filtered list is
   * something you can bookmark or send to a colleague. `replace` keeps the
   * back button pointing at wherever they came from rather than at each chip
   * they tried on the way.
   */
  const [params, setParams] = useSearchParams()
  const requested = params.get('d')
  const filter: Filter =
    requested && (DISCIPLINES as readonly string[]).includes(requested)
      ? (requested as Discipline)
      : 'all'

  const setFilter = (next: Filter) => {
    const search = new URLSearchParams(params)
    if (next === 'all') search.delete('d')
    else search.set('d', next)
    setParams(search, { replace: true })
  }

  const visible = useMemo(
    () => (filter === 'all' ? BRANDS : BRANDS.filter((brand) => brand.discipline === filter)),
    [filter],
  )

  const filters: Filter[] = ['all', ...DISCIPLINES]

  const scroller = useRef<HTMLDivElement>(null)
  const activeChip = useRef<HTMLButtonElement>(null)

  /*
   * Bring the selected chip into view within the row.
   *
   * Arriving from a collection card lands on ?d=acoustics, whose chip is the
   * last of seven and sits well off the right of a 375px screen — so without
   * this the page opens filtered with nothing on screen saying why.
   *
   * By setting scrollLeft on the row itself, never scrollIntoView, which walks
   * up the ancestors and would scroll the PAGE to reach a chip that is merely
   * off to the side.
   */
  useEffect(() => {
    const row = scroller.current
    const chip = activeChip.current
    if (!row || !chip) return

    const centred = chip.offsetLeft - (row.clientWidth - chip.clientWidth) / 2
    row.scrollLeft = Math.max(0, Math.min(centred, row.scrollWidth - row.clientWidth))
  }, [filter])

  return (
    <Section
      spacing="lg"
      bordered
      id="partners"
      {...(showHeading
        ? { 'aria-labelledby': 'partners-title' }
        : { 'aria-label': t('b2b.brands.eyebrow') })}
    >
      <Container>
        {/* Off on /brands, where the page header directly above says the same
            thing. Two headings stacked is what happens when a section that was
            written to sit INSIDE another page becomes a page of its own; the
            component keeps its heading for anywhere else it gets used. */}
        {showHeading && (
          <SectionHeading
            id="partners-title"
            eyebrow={t('b2b.brands.eyebrow')}
            title={t('b2b.brands.title')}
            description={t('b2b.brands.description')}
          />
        )}

        {/* THE FILTER BAR SCROLLS RATHER THAN WRAPS ON A PHONE
            Seven chips carrying names like "არქიტექტურული განათება" fit about
            one to a line at 375px: measured, the wrapped bar stood 295px tall
            across five rows, and the brand cards it filters started that far
            down the page. A single non-wrapping row that scrolls sideways is
            44px whatever the labels say, in either language.

            `-mx-5 px-5` cancels the Container gutter so the row runs from one
            screen edge to the other, and the last chip is cut off by the
            screen rather than appearing to stop short of it. From `sm` there
            is width to wrap, so it wraps and the bleed is dropped. */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div
            ref={scroller}
            className="at-scroll-row -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:gap-x-2 sm:gap-y-3 sm:overflow-visible sm:px-0"
          >
            {filters.map((value) => {
              const active = filter === value

              return (
                <button
                  key={value}
                  ref={active ? activeChip : undefined}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={active}
                  className={cn(
                    'at-label min-h-11 shrink-0 border px-4 whitespace-nowrap transition-colors duration-300 sm:min-h-10',
                    active
                      ? 'border-brass bg-brass text-background'
                      : 'border-hairline text-muted hover:border-brass hover:text-brass',
                  )}
                >
                  {t(`b2b.brands.${value}`)}
                </button>
              )
            })}
          </div>

          {/* Outside the scroller. Inside it, `ml-auto` would push the count
              to the far end of a 700px scrolling row — off screen, which is
              no place for the thing reporting how many results there are. */}
          <p className="at-label text-muted sm:ml-auto sm:shrink-0" aria-live="polite">
            {t('b2b.brands.showing', { count: visible.length })}
          </p>
        </div>

        {/*
          * THREE ACROSS ON A PHONE.
          *   One-up gave twenty-nine cards a full 333px each and ran the page
          *   to 13.7 screens — the longest on the site, for what is a list you
          *   scan for a name you already have in mind. Three-up turns it into
          *   a contact sheet, which is the right shape for that job.
          *
          *   The card contents change with it, because 111px is not a small
          *   version of 333px — see BrandCard.
          */}
        <ul className="mt-8 grid grid-cols-3 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </ul>
      </Container>
    </Section>
  )
}

function BrandCard({ brand }: { brand: Brand }) {
  const { lang, t } = useLanguage()

  const description = lang === 'ka' ? brand.description_ka : brand.description_en

  // A card with a website is the link; one without is a plain cell. Rendering
  // an anchor with no href would give a keyboard a tab stop that does nothing.
  const Cell = brand.website ? 'a' : 'div'
  const linkProps = brand.website
    ? { href: brand.website, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  return (
    <li className="group relative isolate aspect-[4/3] overflow-hidden bg-graphite-deep">
      <img
        src={brand.image}
        alt=""
        loading="lazy"
        className="at-zoom absolute inset-0 h-full w-full object-cover"
      />

      {/* A lighter wash than the site's standard scrim. Everywhere else the
          photograph is a backdrop for a headline; here the photograph IS the
          content — a specifier is looking at the room, not reading it — so it
          sits at 55% and lifts to 30% under the cursor. Enough graphite for
          the wordmark, not enough to hide the chair. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-graphite-deep/55 transition-colors duration-500 group-hover:bg-graphite-deep/30"
      />

      <Cell
        {...linkProps}
        className="relative flex h-full flex-col justify-between p-2 sm:p-6 md:p-7"
      >
        {/* The discipline badge is `at-label`: 11px, uppercase, letterspaced
            to 0.18em. "არქიტექტურული განათება" set like that is wider than the
            whole 111px cell, so it is gone below `sm`. Nothing is lost — the
            filter chips directly above the grid say which discipline is being
            shown, and at three-up the visitor is scanning for a NAME. */}
        <span className="at-label hidden text-brass-on-ink sm:block">
          {t(`b2b.brands.${brand.discipline}`)}
        </span>

        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            loading="lazy"
            className="mx-auto max-h-6 w-auto brightness-0 invert sm:max-h-12"
          />
        ) : (
          <span className="text-center font-heading text-xs leading-tight text-background sm:text-2xl sm:tracking-[0.06em] md:text-3xl">
            {brand.name}
          </span>
        )}

        <div className="flex items-end justify-between gap-4">
          {/* Only rendered once the office supplies it — see the note on
              `description` in src/data/company.ts. */}
          {description ? (
            <p className="max-w-[22ch] text-xs leading-relaxed text-ink-muted">{description}</p>
          ) : (
            <span aria-hidden="true" />
          )}

          <span className="shrink-0 text-right text-[9px] tracking-normal text-ink-muted uppercase sm:text-[11px] sm:tracking-[0.18em]">
            {brand.country}
          </span>
        </div>
      </Cell>

      <span
        aria-hidden="true"
        className="absolute inset-x-6 bottom-6 h-px origin-left scale-x-0 bg-brass transition-transform duration-500 group-hover:scale-x-100 md:inset-x-7 md:bottom-7"
      />
    </li>
  )
}
