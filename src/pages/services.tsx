import { PageHeader } from '@/components/b2b/page-header'
import { B2bServices } from '@/components/b2b/services'
import { ContactBand } from '@/components/home/contact-band'
import { useLanguage } from '@/hooks/use-language'

/**
 * /services — the four disciplines.
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
        title={t('b2b.pages.servicesTitle')}
        description={t('b2b.pages.servicesDescription')}
      />

      <B2bServices />
      <ContactBand />
    </>
  )
}
