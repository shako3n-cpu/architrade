import { PageHeader } from '@/components/b2b/page-header'
import { B2bCompany } from '@/components/b2b/company'
import { ContactBand } from '@/components/home/contact-band'
import { useLanguage } from '@/hooks/use-language'

/**
 * /about — who archtrade is.
 *
 * ONE HEADER, NOT TWO
 *   The page used to open with a header — "a furniture house, not a reseller"
 *   and a paragraph — and then B2bCompany immediately restated the same claim
 *   in its own words a screen below. Two headings, two supporting paragraphs,
 *   one subject, before a visitor reached anything they did not already know.
 *
 *   The company's own positioning line is now the page's h1 and its statement
 *   is the standfirst, so the page opens with the strongest sentence it has
 *   and goes straight into the four steps. `b2b.pages.aboutTitle` and
 *   `aboutDescription` are no longer read by anything; they are left in the
 *   locale files rather than deleted mid-change, and are safe to remove.
 *
 * Built from the same sections as the home page rather than from new ones.
 * The four steps, the project list and the reference wall are the answer to
 * "who are you" wherever they appear, and maintaining a second copy of them
 * here would guarantee the two drift apart.
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
        title={t('b2b.about.title')}
        description={t('b2b.about.statement')}
      />

      <B2bCompany />
      <ContactBand />
    </>
  )
}
