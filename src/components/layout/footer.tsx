import { Link } from 'react-router-dom'
import { CONTACT, FOOTER_NAV, SITE_NAME, SOCIAL } from '@/config/site'
import { categories } from '@/data/categories'
import { useLanguage } from '@/hooks/use-language'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Wordmark } from './wordmark'
import { FooterColumn } from './footer-column'

/**
 * Site footer.
 *
 * Four columns on desktop, stacking to one on mobile. Category links are read
 * straight from src/data/categories.ts, so adding a category there adds it
 * here with no edit to this file.
 */
export function Footer() {
  const { lang, localePath, t } = useLanguage()
  const year = new Date().getFullYear()

  const quickLinks = FOOTER_NAV.map((item) => ({
    to: localePath(item.to),
    label: t(item.labelKey),
  }))

  const categoryLinks = categories.map((category) => ({
    to: localePath(`/catalog/${category.slug}`),
    label: category.name[lang],
  }))

  return (
    <footer className="border-t border-hairline">
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

            <address className="flex flex-col gap-3.5 text-sm text-muted not-italic">
              <span>{t('common.addressLine')}</span>

              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="transition-colors duration-300 hover:text-brass"
              >
                {CONTACT.phoneDisplay}
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="transition-colors duration-300 hover:text-brass"
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

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {SOCIAL.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="at-label transition-colors duration-300 hover:text-brass"
              >
                {social.name}
              </a>
            ))}

            <span aria-hidden="true" className="hidden h-3 w-px bg-hairline md:block" />

            <Link
              to={localePath('/privacy')}
              className="text-xs text-muted transition-colors duration-300 hover:text-brass"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to={localePath('/terms')}
              className="text-xs text-muted transition-colors duration-300 hover:text-brass"
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
