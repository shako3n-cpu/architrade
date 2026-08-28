import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { whatsappUrl } from '@/lib/contact'
import { CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import type { Product } from '@/data/types'

/**
 * "Request a spec sheet" — the B2B counterpart to a cart, on a site that has
 * no cart and shows no prices.
 *
 * A PLACEHOLDER THAT STILL WORKS
 *   There is no backend behind this form yet, and the panel says so rather
 *   than pretending. But a form that collects five fields and then throws them
 *   away is worse than no form, so what the visitor typed is composed into a
 *   message and carried into WhatsApp or email — the two channels the office
 *   already reads. Wiring it to a table later changes this one file.
 *
 *   Nothing is stored in the browser either. A half-filled enquiry is not
 *   something to keep without asking.
 */

interface Draft {
  company: string
  contact: string
  email: string
  quantity: string
  notes: string
}

const EMPTY: Draft = { company: '', contact: '', email: '', quantity: '', notes: '' }

export function SpecSheetModal({
  product,
  productName,
  open,
  onOpenChange,
}: {
  product: Product
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState<Draft>(EMPTY)

  const set = (field: keyof Draft) => (event: { target: { value: string } }) =>
    setDraft((previous) => ({ ...previous, [field]: event.target.value }))

  /** One message, readable by a person, in whichever channel they pick. */
  const message = [
    `${t('b2b.quote.title')} — ${productName} (${product.slug})`,
    draft.company && `${t('b2b.quote.company')}: ${draft.company}`,
    draft.contact && `${t('b2b.quote.contact')}: ${draft.contact}`,
    draft.email && `${t('b2b.quote.email')}: ${draft.email}`,
    draft.quantity && `${t('b2b.quote.quantity')}: ${draft.quantity}`,
    draft.notes && `${t('b2b.quote.notes')}: ${draft.notes}`,
  ]
    .filter(Boolean)
    .join('\n')

  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    `${t('b2b.quote.title')} — ${productName}`,
  )}&body=${encodeURIComponent(message)}`

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-graphite-deep/50 backdrop-blur-sm" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-hairline bg-background p-6 sm:p-8">
          <Eyebrow className="text-brass">{t('b2b.quote.product')}</Eyebrow>
          <p className="mt-2 font-heading text-lg text-ink">{productName}</p>

          <Dialog.Title className="mt-6 font-heading text-2xl text-ink">
            {t('b2b.quote.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-relaxed text-muted">
            {t('b2b.quote.description')}
          </Dialog.Description>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextField label={t('b2b.quote.company')} value={draft.company} onChange={set('company')} />
            <TextField label={t('b2b.quote.contact')} value={draft.contact} onChange={set('contact')} />
            <TextField
              label={t('b2b.quote.email')}
              type="email"
              value={draft.email}
              onChange={set('email')}
            />
            <TextField
              label={t('b2b.quote.quantity')}
              value={draft.quantity}
              onChange={set('quantity')}
            />
          </div>

          <label className="mt-4 block">
            <span className="at-label text-muted">{t('b2b.quote.notes')}</span>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={set('notes')}
              placeholder={t('b2b.quote.notesPlaceholder')}
              className="mt-2 w-full border border-hairline bg-surface px-3.5 py-2.5 text-base text-ink transition-colors duration-300 placeholder:text-muted/60 focus:border-brass focus:outline-none sm:text-sm"
            />
          </label>

          <p className="mt-5 border-t border-hairline pt-4 text-xs leading-relaxed text-muted">
            {t('b2b.quote.placeholderNotice')}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" size="sm">
                {t('b2b.quote.cancel')}
              </Button>
            </Dialog.Close>

            <Button asChild size="sm" variant="outline">
              <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                {CONTACT.whatsappDisplay}
              </a>
            </Button>

            <Button asChild size="sm">
              <a href={mailto}>{t('b2b.quote.submit')}</a>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (event: { target: { value: string } }) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="at-label text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-2 min-h-11 w-full border border-hairline bg-surface px-3.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none sm:text-sm"
      />
    </label>
  )
}
