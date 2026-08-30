import { useLanguage } from '@/hooks/use-language'
import type { Brand } from '@/data/types'

/**
 * One partner house.
 *
 * Split out of brand-cards.tsx when the list moved into the database: that
 * file now fetches, filters and lays out, and this one draws a cell. They
 * changed for different reasons even before the split, which is the argument
 * for making it.
 *
 * THE CARD IS NOT A SMALL VERSION OF ITSELF
 *   At three-up a cell is 111px, and 111px is not a scaled 333px. The badge,
 *   the description and the letterspacing are all dropped or resized below
 *   `sm`, because at that width a specifier is scanning for a NAME and
 *   everything else is noise competing with it.
 */
export function BrandCard({ brand }: { brand: Brand }) {
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
        src={brand.image ?? ''}
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
