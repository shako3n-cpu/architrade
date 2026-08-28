import { PageHeader } from '@/components/b2b/page-header'
import { B2bCompany } from '@/components/b2b/company'
import { B2bClients } from '@/components/b2b/clients'
import { ContactBand } from '@/components/home/contact-band'
import { useLanguage } from '@/hooks/use-language'

/**
 * /about — who archtrade is.
 *
 * Built from the same sections as the home page rather than from new ones.
 * The values statement, the four steps, the project list and the reference
 * wall are the answer to "who are you" wherever they appear, and maintaining a
 * second copy of them here would guarantee the two drift apart.
 *
 * What the page adds is ORDER: on the home page the company comes after the
 * catalogue, because a visitor there is browsing. Someone who clicked "About"
 * has asked the question directly, so it comes first and the proof follows.
 */
export function About() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        eyebrow={t('b2b.pages.aboutEyebrow')}
        title={t('b2b.pages.aboutTitle')}
        description={t('b2b.pages.aboutDescription')}
      />

      <B2bCompany />
      <B2bClients />
      <ContactBand />
    </>
  )
}
