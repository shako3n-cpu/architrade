import { Mail, Phone } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { messengerUrl, whatsappUrl } from '@/lib/contact'
import { BRAND_COLOR, MessengerIcon, WhatsappIcon } from '@/components/ui/brand-icons'
import { ChannelButton } from '@/components/contact/channel-button'

/**
 * The closing band: charcoal, and the only inverted section on the page.
 *
 * It is where the site ends, because the site cannot take an order — every
 * route out of here is a conversation with the showroom.
 */
export function ContactBand() {
  const { t } = useLanguage()

  return (
    <section className="bg-ink" aria-labelledby="contact-band-title">
      <Container>
        <div className="grid grid-cols-1 gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow className="text-brass-on-ink">{t('home.contactEyebrow')}</Eyebrow>

            <h2
              id="contact-band-title"
              className="mt-6 font-heading text-3xl text-background md:text-4xl lg:text-5xl"
            >
              {t('home.contactTitle')}
            </h2>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted">
              {t('home.contactBody')}
            </p>

            <address className="mt-10 flex flex-col gap-2 text-sm text-ink-muted not-italic">
              <span className="text-background">{t('common.addressLine')}</span>
              <span>
                {t('footer.weekdays')} · {t('footer.weekdaysHours')}
              </span>
              <span>
                {t('footer.saturday')} · {t('footer.saturdayHours')}
              </span>
            </address>
          </div>

          <div className="flex flex-col gap-3">
            <ChannelButton
              href={whatsappUrl(t('contact.generalMessage'))}
              icon={WhatsappIcon}
              label={t('common.whatsapp')}
              detail={CONTACT.whatsappDisplay}
              brandColor={BRAND_COLOR.whatsapp}
              tone="dark"
            />
            <ChannelButton
              href={messengerUrl()}
              icon={MessengerIcon}
              label={t('contact.messenger')}
              detail={`m.me/${CONTACT.facebookHandle}`}
              brandColor={BRAND_COLOR.messenger}
              tone="dark"
            />
            <ChannelButton
              href={`tel:${CONTACT.phoneHref}`}
              icon={Phone}
              label={t('common.call')}
              detail={CONTACT.phoneDisplay}
              tone="dark"
            />
            <ChannelButton
              href={`mailto:${CONTACT.email}`}
              icon={Mail}
              label={t('common.email')}
              detail={CONTACT.email}
              tone="dark"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
