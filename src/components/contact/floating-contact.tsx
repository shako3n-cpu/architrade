import { useEffect, useRef, useState } from 'react'
import { Mail, MessageCircle, Phone, X } from 'lucide-react'
import { CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { messengerUrl, whatsappUrl } from '@/lib/contact'
import { BRAND_COLOR, MessengerIcon, WhatsappIcon } from '@/components/ui/brand-icons'
import { ChannelButton } from './channel-button'

/**
 * The floating "talk to us" launcher, pinned bottom-right on every page.
 *
 * Closed it is a single square button; open it reveals the four channels the
 * showroom actually answers. Square rather than the usual circle because the
 * house rule caps corner radius at 4px, and a half-round bubble would be the
 * one element on the site breaking it.
 *
 * Closes on Escape and on a click outside, like any other transient overlay.
 */
export function FloatingContact() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          id="floating-contact-panel"
          className="w-[17.5rem] border border-hairline bg-surface p-4"
        >
          <p className="at-label mb-1 text-brass">{t('contact.floatingEyebrow')}</p>
          <p className="mb-4 text-sm leading-relaxed text-muted">{t('contact.floatingBody')}</p>

          <div className="flex flex-col gap-2">
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
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="floating-contact-panel"
        aria-label={open ? t('contact.closeChannels') : t('contact.openChannels')}
        className="flex size-14 items-center justify-center rounded-xs bg-ink text-background transition-colors duration-300 hover:bg-brass"
      >
        {open ? (
          <X className="size-5 stroke-[1.5]" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-5 stroke-[1.5]" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
