import { Link } from 'react-router-dom'
import { CONTACT, FOOTER_NAV, SITE_NAME, SOCIAL } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { useCategories } from '@/hooks/use-catalog'
import { categoryTitle } from '@/lib/localize'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Wordmark } from './wordmark'
import { FooterColumn } from './footer-column'

/**
 * Site footer.
 *
 * Four columns on desktop, stacking to one on mobile. Category links come from
 * the `categories` table, so adding a category in Supabase adds it here with
 * no edit to this file.
 *
 * TOP-LEVEL CATEGORIES ONLY
 *   This mapped the whole table, which was right when the table was six flat
 *   rows. Against the tree it emitted all twenty-nine — leaves listed beside
 *   their own parents, and the hidden branches too — as one column that ran
 *   several times the height of everything next to it and pulled the footer
 *   grid apart. A footer is a map, not an index: it names the four doors and
 *   lets the mega menu carry the rest.
 */
export function Footer() {
  const { lang, localePath, t } = useLanguage()
  const year = new Date().getFullYear()
  const categories = useCategories()

  const quickLinks = FOOTER_NAV.map((item) => ({
    to: localePath(item.to),
    label: t(item.labelKey),
  }))

  // The footer sits on every page, so it must never be the thing that breaks
  // one. While the query is in flight, or if it fails, the column simply has
  // no links — no skeleton, no error panel, nothing for the visitor to read.
  //
  // Filtered on the two columns directly rather than through publicTree,
  // because that helper hides a branch holding no products and would need the
  // products fetched here to know. The footer does not need that precision,
  // and a second catalogue request on every page to get it would be a poor
  // trade. `is_active` alone already excludes the branches with nothing in
  // them, since those are exactly the ones seeded off.
  const categoryLinks = (categories.data ?? [])
    .filter((category) => !category.parent_id && category.is_active !== false)
    .map((category) => ({
      to: localePath(`/catalog/${category.slug}`),
      label: categoryTitle(category, lang),
    }))

  return (
    <footer className="border-t border-hairline">
      {/*
       * The showroom, on a map, full-bleed across the top of the footer.
       *
       * Full width rather than inside the Container on purpose: it reads as a
       * band that closes the page, and a map boxed into one column of a
       * four-column footer is too small to orient anybody.
       *
       * `loading="lazy"` matters more here than on an image — this is a live
       * Google Maps frame with its own scripts, and it sits on EVERY page.
       * Deferred, it costs nothing until somebody actually scrolls to it.
       */}
      <div className="border-b border-hairline">
        <iframe
          src={CONTACT.mapsEmbedUrl}
          title={t('footer.mapTitle')}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="block h-[20rem] w-full border-0 md:h-[24rem]"
        />
      </div>

      <Container>
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-12 lg:gap-8">
          {/* Wordmark + about */}
          <div className="lg:col-span-4 lg:pr-10">
            <Wordmark className="text-lg" />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">{t('footer.about')}</p>
          </div>

          <nav
            aria-label={t('footer.navLabel')}
            className="contents lg:col-span-5 lg:grid lg:grid-cols-2 lg:gap-8"
          >
            <FooterColumn title={t('footer.quickLinks')} links={quickLinks} />
            <FooterColumn title={t('footer.categories')} links={categoryLinks} />
          </nav>

          {/* Contact + hours */}
          <div className="lg:col-span-3">
            <Eyebrow as="p" className="mb-6 text-ink">
              {t('footer.contactTitle')}
            </Eyebrow>

            {/* at-selectable: the page default is unselectable (see index.css),
                and a street address is the clearest case of something a
                visitor genuinely highlights and copies. */}
            <address className="at-selectable flex flex-col gap-1 text-sm text-muted not-italic sm:gap-3.5">
              <span>{t('common.addressLine')}</span>

              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-brass sm:min-h-0"
              >
                {CONTACT.phoneDisplay}
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-brass sm:min-h-0"
              >
                {CONTACT.email}
              </a>
            </address>

            <Eyebrow as="p" className="mt-10 mb-4 text-ink">
              {t('footer.workingHours')}
            </Eyebrow>

            <dl className="flex flex-col gap-2 text-sm text-muted">
              <div className="flex justify-between gap-4">
                <dt>{t('footer.weekdays')}</dt>
                <dd className="text-ink">{t('footer.weekdaysHours')}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t('footer.saturday')}</dt>
                <dd className="text-ink">{t('footer.saturdayHours')}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t('footer.sunday')}</dt>
                <dd>{t('footer.closed')}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 border-t border-hairline py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted">
            © {year} {SITE_NAME}. {t('footer.rights')}
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-0 sm:gap-y-3">
            {SOCIAL.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="at-label inline-flex min-h-11 items-center transition-colors duration-300 hover:text-brass sm:min-h-0"
              >
                {social.name}
              </a>
            ))}

            <span aria-hidden="true" className="hidden h-3 w-px bg-hairline md:block" />

            <Link
              to={localePath('/privacy')}
              className="inline-flex min-h-11 items-center text-xs text-muted transition-colors duration-300 hover:text-brass sm:min-h-0"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to={localePath('/terms')}
              className="inline-flex min-h-11 items-center text-xs text-muted transition-colors duration-300 hover:text-brass sm:min-h-0"
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
