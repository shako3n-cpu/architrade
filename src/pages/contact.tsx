import { Mail, Phone } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/b2b/page-header'
import { ChannelButton } from '@/components/contact/channel-button'
import { BRAND_COLOR, MessengerIcon, WhatsappIcon } from '@/components/ui/brand-icons'
import { CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { messengerUrl, whatsappUrl } from '@/lib/contact'

/**
 * /contact
 *
 * NO FORM, AND THAT IS THE POINT
 *   A contact form needs somewhere to post to, and this site has no such
 *   endpoint. The honest options were a form that silently goes nowhere or
 *   four channels that already work and that the showroom already reads. The
 *   channels win: a visitor who taps WhatsApp is in a conversation in one
 *   second, with no wondering whether the message arrived.
 *
 *   When a form backend exists — an edge function, or the spec-sheet request
 *   in src/components/catalog/spec-sheet-modal.tsx wired up — it belongs
 *   here as a fifth option, not as a replacement for these.
 *
 * The address block and the map are the same fact told twice, deliberately:
 * one is copyable and readable by a screen reader, the other is how most
 * people actually decide whether it is near them.
 */
export function Contact() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        description={t('contact.description')}
      />

      <Section spacing="lg">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-brass">{t('contact.visitTitle')}</Eyebrow>

              <address className="mt-6 text-lg leading-relaxed text-ink not-italic">
                {t('common.addressLine')}
              </address>

              <Button asChild variant="outline" size="sm" className="mt-7">
                <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {t('common.getDirections')}
                </a>
              </Button>

              <div className="mt-12 border-t border-hairline pt-8">
                <Eyebrow className="text-brass">{t('contact.hoursTitle')}</Eyebrow>

                <dl className="mt-6 flex flex-col gap-3 text-sm">
                  <Hours day={t('footer.weekdays')} time={t('footer.weekdaysHours')} />
                  <Hours day={t('footer.saturday')} time={t('footer.saturdayHours')} />
                  <Hours day={t('footer.sunday')} time={t('footer.closed')} />
                </dl>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Eyebrow className="text-brass">{t('contact.channelsTitle')}</Eyebrow>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
                {t('contact.channelsBody')}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <ChannelButton
                  href={whatsappUrl(t('contact.generalMessage'))}
                  icon={WhatsappIcon}
                  label={t('common.whatsapp')}
                  detail={CONTACT.whatsappDisplay}
                  brandColor={BRAND_COLOR.whatsapp}
                />
                <ChannelButton
                  href={messengerUrl()}
                  icon={MessengerIcon}
                  label={t('contact.messenger')}
                  detail={`m.me/${CONTACT.facebookHandle}`}
                  brandColor={BRAND_COLOR.messenger}
                />
                <ChannelButton
                  href={`tel:${CONTACT.phoneHref}`}
                  icon={Phone}
                  label={t('common.call')}
                  detail={CONTACT.phoneDisplay}
                />
                <ChannelButton
                  href={`mailto:${CONTACT.email}`}
                  icon={Mail}
                  label={t('common.email')}
                  detail={CONTACT.email}
                />
              </div>

              <p className="mt-8 text-sm leading-relaxed text-muted">{t('contact.tradeNote')}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="sm" bordered>
        <Container>
          <div className="aspect-[16/9] w-full overflow-hidden border border-hairline bg-surface md:aspect-[21/9]">
            <iframe
              src={CONTACT.mapsEmbedUrl}
              title={t('contact.mapTitle')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        </Container>
      </Section>
    </>
  )
}

/** One line of the opening hours table. */
function Hours({ day, time }: { day: string; time: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-hairline pb-3">
      <dt className="text-muted">{day}</dt>
      <dd className="text-ink">{time}</dd>
    </div>
  )
}
