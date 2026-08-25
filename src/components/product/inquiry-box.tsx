import { Eyebrow } from '@/components/ui/eyebrow'
import { InquireButtons } from '@/components/contact/inquire-buttons'
import { useLanguage } from '@/hooks/use-language'
import type { Product } from '@/data/types'
import { cn } from '@/lib/utils'

/**
 * "Inquire about this piece" — where the product page ends.
 *
 * There is no cart and no checkout on this site, so this box is the whole
 * conversion path. It sits on the surface tone rather than the page tone so it
 * reads as the one thing to act on in the column, without a shadow or a card.
 *
 * Both buttons carry the piece's name and address into the message, which is
 * handled by InquireButtons — this component only frames them.
 */
export function InquiryBox({ product, className }: { product: Product; className?: string }) {
  const { t } = useLanguage()

  return (
    <section
      aria-labelledby="inquiry-title"
      className={cn('border border-hairline bg-surface p-6 sm:p-8', className)}
    >
      <Eyebrow className="text-brass">{t('product.inquiryEyebrow')}</Eyebrow>

      <h2 id="inquiry-title" className="mt-3 font-heading text-2xl text-ink">
        {t('contact.inquire')}
      </h2>

      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
        {t('product.inquiryBody')}
      </p>

      <InquireButtons product={product} variant="block" className="mt-6" />

      <p className="mt-4 text-xs leading-relaxed text-muted">{t('product.inquiryNote')}</p>
    </section>
  )
}
