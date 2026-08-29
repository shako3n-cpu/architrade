import { PageHeader } from '@/components/b2b/page-header'
import { B2bServices } from '@/components/b2b/services'
import { ContactBand } from '@/components/home/contact-band'
import { useLanguage } from '@/hooks/use-language'

/**
 * /services — the four disciplines.
 *
 * ONE HEADER, NOT TWO
 *   This page used to open with a page header and then immediately repeat
 *   itself: a hero reading "everything between an empty floor and a room in
 *   use", followed by the services section's own heading a few hundred pixels
 *   below. Two titles, two subtitles, one subject — the visitor read the same
 *   claim twice before reaching a single service.
 *
 *   The header now carries the section's own title and subtitle, and the
 *   section renders headless, so the page goes hero -> four cards with nothing
 *   in between. `b2b.pages.servicesTitle` and `servicesDescription` are no
 *   longer read by anything; they are left in the locale files rather than
 *   deleted mid-change, and are safe to remove.
 *
 * The manufacturer list used to sit here, under the disciplines. It has moved
 * to /brands, which has its own entry in the main navigation: twenty-nine
 * houses are what a page is about, not a footnote to a services pitch. Do not
 * add it back — there should be one list, in one place, with one address.
 */
export function Services() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        eyebrow={t('b2b.pages.servicesEyebrow')}
        title={t('b2b.services.title')}
        description={t('b2b.services.description')}
      />

      <B2bServices showHeading={false} />
      <ContactBand />
    </>
  )
}
