import { PageHeader } from '@/components/b2b/page-header'
import { B2bServices } from '@/components/b2b/services'
import { B2bBrandWall } from '@/components/b2b/brand-wall'
import { B2bProjects } from '@/components/b2b/projects'
import { ContactBand } from '@/components/home/contact-band'
import { useLanguage } from '@/hooks/use-language'

/**
 * /services — the four disciplines, then the evidence for them.
 *
 * The order is the argument. Somebody reading this page is deciding whether to
 * put a building in these hands, so the claim comes first, the manufacturers
 * behind the specification second, and the buildings already delivered third.
 * Ending on the project list means the last thing read is a fact rather than a
 * promise.
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
      <B2bBrandWall />
      <B2bProjects />
      <ContactBand />
    </>
  )
}
