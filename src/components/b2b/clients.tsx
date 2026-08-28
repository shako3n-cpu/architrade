import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { CLIENTS } from '@/data/company'
import { useLanguage } from '@/hooks/use-language'
import type { Client } from '@/data/company'

/**
 * The reference wall — who the work was for.
 *
 * WHY THIS BAND IS DARK, AND WHY IT HAS TO BE
 *   Not a mood choice. Every file in public/logos/ is a palette PNG with no
 *   alpha whose ground is BLACK — decoded, all sixteen have (0,0,0) corners
 *   and average luminance between 0.6 and 63 out of 255. They are light marks
 *   on a dark plate.
 *
 *   This wall used to sit on the off-white page under `mix-blend-multiply`,
 *   on the stated assumption that the files carried a white ground. That is
 *   the exact opposite of what they carry, and multiply against black is
 *   black: the section rendered as sixteen solid black rectangles down the
 *   middle of a warm off-white page. That was the disjointedness.
 *
 *   `mix-blend-screen` on a dark band is the correct pairing for these files:
 *   screen against black returns the backdrop, so the plate disappears into
 *   the band and only the mark survives. It depends on this band staying
 *   DARK — put it back on the off-white page and every mark burns out to
 *   white. The two rules travel together.
 *
 *   The dark matches ContactBand directly below, so the page closes on ONE
 *   dark movement. A slightly different dark here read as a seam rather than
 *   as a decision.
 *
 * GREY UNTIL YOU LOOK AT IT
 *   Marks rest greyscaled at 60%, and come to full colour and full opacity
 *   under the cursor, with the bronze rule drawing in from the left — the
 *   same gesture the header navigation uses. The wall reads as one quiet
 *   block, and any single name can still be picked out of it.
 *
 * A grid rather than a slider. A slider hides two thirds of the list behind a
 * timer and makes a reader wait to check for their own sector; sixteen marks
 * fit on one screen and answer the question at a glance.
 */
export function B2bClients() {
  const { t } = useLanguage()

  return (
    /*
     * `--at-band` exists because `bg-ink` and `text-ink` are the same token.
     *
     * The wall needs the dark value for two backgrounds and the light value
     * for all its text, and the obvious way to get that — override `--at-ink`
     * on the section and paint it with `bg-ink` — makes the override win
     * against itself: the band paints in the light value meant for the text
     * and the whole thing comes out off-white with invisible marks.
     *
     * So the dark is captured ONCE here, on the element above the override,
     * under a name nothing else claims. It inherits past the palette swap
     * below with its value already resolved, which is what lets the cells
     * paint the same dark that the section does.
     */
    <Section
      spacing="lg"
      id="clients"
      aria-labelledby="clients-title"
      className="bg-[var(--at-band)] [--at-band:var(--at-ink)]"
    >
      {/* Scoping the palette rather than restyling the children: `@theme
          inline` compiles `text-ink` to `color: var(--at-ink)` directly, so
          redefining the four tokens here flips SectionHeading, the eyebrow,
          the note and the fallback wordmarks to their dark-band values in one
          place — no `dark:` variants, and no extra prop on a shared primitive. */}
      <div className="[--at-brass:var(--at-brass-on-ink)] [--at-hairline:#343840] [--at-ink:#f2eee6] [--at-muted:var(--at-ink-muted)]">
        <Container>
          <SectionHeading
            id="clients-title"
            eyebrow={t('b2b.clients.eyebrow')}
            title={t('b2b.clients.title')}
            description={t('b2b.clients.description')}
          />

          {/* The 1px rules are the gap: the list paints itself hairline-coloured
              and every cell paints the band colour back over it, so the grid is
              ruled in both directions without a single border declaration that
              would double up where two cells meet.

              Eight across is exactly two rows for sixteen marks — the column
              count is doing arithmetic, not decoration. Eight only from `xl`;
              at 1024px eight columns leave 93px a cell, too narrow for the
              widest wordmarks, so it falls back to four columns. */}
          <ul className="mt-14 grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4 xl:grid-cols-8">
            {CLIENTS.map((client) => (
              <li key={client.name} className="group relative bg-[var(--at-band)]">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex min-h-28 items-center justify-center px-5 py-7 md:min-h-32">
                  <ClientMark client={client} />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-sm text-muted">{t('b2b.clients.note')}</p>
        </Container>
      </div>
    </Section>
  )
}

/**
 * One mark. The licensed file where there is one, the name set as type where
 * there is not — so the wall can be completed one file at a time and never
 * shows a gap in the meantime.
 */
function ClientMark({ client }: { client: Client }) {
  if (!client.logo) {
    return (
      <span className="font-heading text-center text-sm leading-snug text-muted transition-colors duration-300 group-hover:text-ink md:text-base">
        {client.name}
      </span>
    )
  }

  return (
    <img
      src={client.logo}
      alt={client.name}
      loading="lazy"
      decoding="async"
      /* Height, not max-height: the per-file number in CLIENTS is what makes
         a 209x39 wordmark and a 78x105 badge come out the same optical size.
         See the note on `logoHeight` in src/data/company.ts. */
      style={{ height: client.logoHeight ?? 40 }}
      className="w-auto max-w-full object-contain opacity-60 grayscale mix-blend-screen transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
    />
  )
}
