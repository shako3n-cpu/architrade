import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { DISCIPLINES, type Discipline } from '@/data/company'
import { BrandCard } from './brand-card'
import { QueryState } from '@/components/ui/query-state'
import { useBrands } from '@/hooks/use-catalog'
import type { Brand } from '@/data/types'
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
   * The houses come from the DATABASE now, not from a constant in the source.
   *
   * They were twenty-nine hardcoded entries in src/data/company.ts, which is
   * why `website` and `description` were empty on every one: both are facts
   * only the office holds, and neither could be filled in without a developer
   * editing TypeScript and shipping a build. The dashboard writes them now,
   * and this page renders each the moment it is set.
   */
  const brands = useBrands()

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

  /*
   * `brands.data` is the dependency, not a `rows` local. `data ?? []` builds a
   * new array on every render while the query is still loading, so depending
   * on that local would recompute this memo every time and quietly defeat it.
   * The fallback belongs inside.
   */
  const visible = useMemo(() => {
    const rows: Brand[] = brands.data ?? []
    return filter === 'all' ? rows : rows.filter((brand) => brand.discipline === filter)
  }, [filter, brands.data])

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

        {/* ONE loading state for the whole control, not two.
            The chips are meaningless without the grid beneath them — a filter
            over nothing — so they arrive together rather than the chips
            appearing first over an empty box and the count reading zero. */}
        <QueryState result={brands}>
          {() => (
            <>
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
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </ul>
            </>
          )}
        </QueryState>
      </Container>
    </Section>
  )
}
