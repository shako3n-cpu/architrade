import { PageHeader } from '@/components/b2b/page-header'
import { B2bBrandCards } from '@/components/b2b/brand-cards'
import { ContactBand } from '@/components/home/contact-band'
import { useLanguage } from '@/hooks/use-language'

/**
 * /brands — the partner manufacturers, on their own page.
 *
 * WHY THIS IS NOT PART OF /services ANY MORE
 *   The manufacturer list used to sit underneath the four disciplines, which
 *   filed twenty-nine houses as supporting evidence for a services pitch. That
 *   is backwards for the people who actually look for it: an architect
 *   checking whether ARCHTRADE can supply a named house is not reading a
 *   services page, and had no link to follow and no address to be sent. The
 *   list is now the thing a page is about, with its own entry in the main
 *   navigation and its own URL to send someone.
 *
 * /services keeps the four disciplines and loses nothing else — the brands
 * component moved, it was not copied, so there is one list in one place.
 */
export function Brands() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        eyebrow={t('brands.eyebrow')}
        title={t('brands.title')}
        description={t('brands.description')}
      />

      <B2bBrandCards />
      <ContactBand />
    </>
  )
}
