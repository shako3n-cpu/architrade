import type { ReactNode } from 'react'
import { useLanguage } from '@/hooks/use-language'
import type { Product } from '@/data/types'
import { productTitle } from '@/lib/localize'
import { absoluteUrl, messengerUrl, whatsappUrl } from '@/lib/contact'
import { BRAND_COLOR, MessengerIcon, WhatsappIcon } from '@/components/ui/brand-icons'
import { cn } from '@/lib/utils'

/**
 * "Inquire about this piece" — the only call to action a product ever carries.
 *
 * There is no cart and no price, so this is where the journey ends on-site:
 * the visitor is handed to WhatsApp or Messenger with the piece already named
 * in the message, and the conversation continues where the showroom can quote
 * properly.
 *
 *   variant="inline"  compact row for a card in a grid
 *   variant="block"   full-width pair for a product detail view
 */
export function InquireButtons({
  product,
  variant = 'inline',
  className,
}: {
  product: Product
  variant?: 'inline' | 'block'
  className?: string
}) {
  const { lang, localePath, t } = useLanguage()

  const title = productTitle(product, lang)
  // Empty during a build (no window); the message then simply omits the link.
  const url = absoluteUrl(localePath(`/product/${product.slug}`))
  const message = t('contact.inquiryMessage', { product: title, url })

  const whatsapp = whatsappUrl(message)
  const messenger = messengerUrl(product.slug)

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <IconLink
          href={whatsapp}
          brandColor={BRAND_COLOR.whatsapp}
          label={t('contact.inquireOnWhatsapp', { product: title })}
        >
          <WhatsappIcon className="size-4" style={{ color: '#fff' }} />
        </IconLink>

        <IconLink
          href={messenger}
          brandColor={BRAND_COLOR.messenger}
          label={t('contact.inquireOnMessenger', { product: title })}
        >
          <MessengerIcon className="size-4" style={{ color: '#fff' }} />
        </IconLink>

        <span className="text-xs text-muted">{t('contact.inquire')}</span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row', className)}>
      <BrandLink href={whatsapp} brandColor={BRAND_COLOR.whatsapp}>
        <WhatsappIcon className="size-[1.125rem]" style={{ color: '#fff' }} />
        {t('contact.inquireOnWhatsappShort')}
      </BrandLink>

      <BrandLink href={messenger} brandColor={BRAND_COLOR.messenger}>
        <MessengerIcon className="size-[1.125rem]" style={{ color: '#fff' }} />
        {t('contact.inquireOnMessengerShort')}
      </BrandLink>
    </div>
  )
}

/** Icon-only square. The visible text sits beside it, so this needs a label. */
function IconLink({
  href,
  brandColor,
  label,
  children,
}: {
  href: string
  brandColor: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      // 44px on touch screens, tightening to 32px from `sm` up where a
      // pointer makes the smaller chip easy to hit.
      className="flex size-11 items-center justify-center rounded-xs transition-opacity duration-300 hover:opacity-80 sm:size-8"
      style={{ backgroundColor: brandColor }}
    >
      {children}
    </a>
  )
}

/** Full-width brand-filled button for the product detail layout. */
function BrandLink({
  href,
  brandColor,
  children,
}: {
  href: string
  brandColor: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xs px-6 text-[0.8125rem] tracking-[0.14em] uppercase transition-opacity duration-300 hover:opacity-80 sm:w-auto sm:flex-1"
      style={{ backgroundColor: brandColor, color: '#fff' }}
    >
      {children}
    </a>
  )
}
