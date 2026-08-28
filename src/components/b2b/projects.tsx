import { useState } from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { PROJECTS, type Sector } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * Delivered work, by sector.
 *
 * A NAMED LIST, NOT A PHOTO GRID
 *   The instinct is twelve glossy tiles. But a procurement lead reading this
 *   is checking for one thing — have you built for someone like me — and a
 *   photograph of an atrium does not answer that. "Bank of Georgia
 *   Headquarters" does. The photograph sets the sector; the names carry the
 *   argument.
 *
 * Sectors are tabs because the four audiences barely overlap: a ministry and a
 * hotel group are not reading the same list, and neither should have to scroll
 * past the other's.
 */
export function B2bProjects() {
  const { t } = useLanguage()
  const [active, setActive] = useState<Sector>('government')

  const group = PROJECTS.find((entry) => entry.sector === active) ?? PROJECTS[0]

  return (
    <Section spacing="lg" bordered id="projects" aria-labelledby="projects-title">
      <Container>
        <SectionHeading
          id="projects-title"
          eyebrow={t('b2b.projects.eyebrow')}
          title={t('b2b.projects.title')}
          description={t('b2b.projects.description')}
        />

        <div className="mt-12 flex flex-wrap gap-x-2 gap-y-3" role="tablist">
          {PROJECTS.map((entry) => {
            const selected = entry.sector === active

            return (
              <button
                key={entry.sector}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="projects-panel"
                onClick={() => setActive(entry.sector)}
                className={cn(
                  'at-label min-h-11 border px-4 transition-colors duration-300 sm:min-h-10',
                  selected
                    ? 'border-brass bg-brass text-background'
                    : 'border-hairline text-muted hover:border-brass hover:text-brass',
                )}
              >
                {t(`b2b.projects.${entry.sector}`)}
              </button>
            )
          })}
        </div>

        <div
          id="projects-panel"
          role="tabpanel"
          className="mt-8 grid border border-hairline lg:grid-cols-2"
        >
          <div className="relative isolate min-h-64 overflow-hidden bg-surface lg:min-h-full">
            <img
              key={group.image}
              src={group.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="at-scrim absolute inset-0" />

            <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
              <p className="font-heading text-2xl text-background md:text-3xl">
                {t(`b2b.projects.${group.sector}`)}
              </p>
              <p className="at-label mt-2 text-ink-muted">
                {t('b2b.projects.count', { count: group.projects.length })}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-hairline border-t border-hairline lg:border-t-0 lg:border-l">
            {group.projects.map((project) => (
              <li
                key={`${project.name}-${project.city}`}
                className="flex items-baseline justify-between gap-4 px-6 py-4 md:px-8"
              >
                <span className="text-base text-ink">{project.name}</span>
                <span className="at-label shrink-0 text-muted">
                  {t(`b2b.projects.cities.${project.city}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
