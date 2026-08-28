import { useState } from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { InquireButtons } from '@/components/contact/inquire-buttons'
import { SpecSheetModal } from '@/components/catalog/spec-sheet-modal'
import { useLanguage } from '@/hooks/use-language'
import { productTitle } from '@/lib/localize'
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
 *
 * The spec sheet sits UNDER those, on a hairline rule, because it asks more of
 * the visitor than a chat does. Someone ready to type a company name and a
 * quantity will find it; someone with one question should not have to walk
 * past a five-field form to ask it.
 */
export function InquiryBox({ product, className }: { product: Product; className?: string }) {
  const { t, lang } = useLanguage()
  const [specSheetOpen, setSpecSheetOpen] = useState(false)

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

      <div className="mt-6 border-t border-hairline pt-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setSpecSheetOpen(true)}
        >
          {t('b2b.quote.open')}
        </Button>
      </div>

      <SpecSheetModal
        product={product}
        productName={productTitle(product, lang)}
        open={specSheetOpen}
        onOpenChange={setSpecSheetOpen}
      />
    </section>
  )
}
