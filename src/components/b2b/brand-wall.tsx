import { useMemo, useState } from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { BRANDS, DISCIPLINES, type Discipline } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

type Filter = Discipline | 'all'

/**
 * The partner wall, as a filterable index.
 *
 * SET AS TYPE, NOT AS LOGOS. Forty logos at forty different weights, crops and
 * ink densities is what every partner wall degenerates into, and it flattens
 * the difference between a house the company represents and a house it once
 * bought from. One typeface at one size puts them on equal footing and keeps
 * the page quiet — which is the whole direction.
 *
 * The filter is the interaction: an architect looking for acoustics should not
 * have to read past nineteen furniture houses to find four.
 */
export function B2bBrandWall() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Filter>('all')

  const visible = useMemo(
    () => (filter === 'all' ? BRANDS : BRANDS.filter((brand) => brand.discipline === filter)),
    [filter],
  )

  const filters: Filter[] = ['all', ...DISCIPLINES]

  return (
    <Section spacing="lg" bordered id="partners" aria-labelledby="partners-title">
      <Container>
        <SectionHeading
          id="partners-title"
          eyebrow={t('b2b.brands.eyebrow')}
          title={t('b2b.brands.title')}
          description={t('b2b.brands.description')}
        />

        <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-3">
          {filters.map((value) => {
            const active = filter === value

            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={active}
                className={cn(
                  'at-label min-h-11 border px-4 transition-colors duration-300 sm:min-h-10',
                  active
                    ? 'border-brass bg-brass text-background'
                    : 'border-hairline text-muted hover:border-brass hover:text-brass',
                )}
              >
                {t(`b2b.brands.${value}`)}
              </button>
            )
          })}

          <p className="at-label ml-auto text-muted" aria-live="polite">
            {t('b2b.brands.showing', { count: visible.length })}
          </p>
        </div>

        {/*
          The grid is hairline-ruled rather than carded: a 1px gap over a
          hairline background draws every division with one border and no
          boxes, which is how the rest of the site separates things.
        */}
        <ul className="mt-8 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((brand) => (
            <li
              key={brand.name}
              className="group flex min-h-28 flex-col justify-between bg-background p-5 transition-colors duration-300 hover:bg-surface md:min-h-32 md:p-6"
            >
              <span className="font-heading text-lg text-ink md:text-xl">{brand.name}</span>

              <span className="mt-4 flex items-baseline justify-between gap-3">
                <span className="at-label text-brass-on-surface">
                  {t(`b2b.brands.${brand.discipline}`)}
                </span>
                <span className="at-label text-muted">{brand.country}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
