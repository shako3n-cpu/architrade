import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

/**
 * Replaces window.confirm for destructive actions. Native confirm() looks
 * like a browser/OS chrome popup (Chrome even labels it with the site's
 * origin), which reads as untrustworthy and clashes with everything else in
 * the admin UI being a styled panel.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  busy = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  busy?: boolean
}) {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />

        <Dialog.Content
          aria-describedby="confirm-dialog-description"
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 border border-hairline bg-background p-6"
        >
          <Dialog.Title className="font-heading text-lg text-ink">{title}</Dialog.Title>
          <Dialog.Description id="confirm-dialog-description" className="mt-2 text-sm text-muted">
            {description}
          </Dialog.Description>

          {/* WRAPS, BECAUSE THE CONFIRM LABEL IS A SENTENCE.

              Every button in this build is `whitespace-nowrap`, and the labels
              here are written to say what will happen rather than "OK" — at
              `md` that makes "Remove from the list" about 250px against
              "Cancel"'s 120, which is 382px of buttons inside the 336px this
              panel has between its padding. A nowrap flex row does not shrink,
              so the overflow went out the LEFT edge (the row is end-aligned)
              and the cancel button sat outside the panel, over the page.

              Wrapping puts the long one on its own line instead. `justify-end`
              still holds, so it stays under the right edge rather than drifting
              into the middle. */}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" disabled={busy}>
                {t('admin.cancel')}
              </Button>
            </Dialog.Close>

            <Button type="button" variant="solid" onClick={onConfirm} disabled={busy}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
