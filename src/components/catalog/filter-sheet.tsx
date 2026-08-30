import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { SlidersHorizontal, X } from 'lucide-react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * The catalogue filters as a bottom sheet, below `lg` only.
 *
 * WHY NOT THE INLINE COLLAPSE IT REPLACES
 *   Opening the old panel pushed the product grid down the page. The visitor
 *   tapped a category, the grid updated — and they were still looking at the
 *   filter list, with the result of their choice somewhere below the fold. The
 *   two things that have to be compared, the control and its effect, could not
 *   be on screen at the same time.
 *
 *   A sheet overlays instead of displacing. Nothing below it moves, the grid
 *   keeps its scroll position, and closing returns the visitor exactly where
 *   they were rather than wherever the reflow left them.
 *
 * IT CLOSES ON A COUNT, NOT ON AN "APPLY"
 *   Filtering is live — every tap updates the grid underneath immediately, so
 *   there is nothing to submit. The footer button is therefore a dismissal
 *   labelled with what is waiting: "Show 9 pieces". That reports the
 *   consequence of the choices already made instead of implying they have not
 *   taken effect yet.
 *
 * Built on Radix Dialog, the same primitive as the navigation drawer, so focus
 * trapping, Escape, the scroll lock on the page behind, and returning focus to
 * the trigger are all handled identically in both places.
 */
export function FilterSheet({
  activeCount,
  resultCount,
  children,
  className,
}: {
  /** How many filters are set, shown on the trigger. 0 hides the badge. */
  activeCount: number
  /** Pieces currently matching, for the footer button. */
  resultCount: number
  children: ReactNode
  className?: string
}) {
  const { t } = useLanguage()

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            'at-label flex min-h-11 items-center justify-between border border-hairline px-4 text-ink',
            'transition-colors duration-300 hover:border-brass hover:text-brass',
            className,
          )}
        >
          <span className="flex items-center gap-2.5">
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            {t('catalog.toggleFilters')}
          </span>

          {activeCount > 0 && (
            <span className="bg-brass px-2 py-0.5 text-[10px] text-background">
              {t('catalog.activeFilters', { count: activeCount })}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-graphite-deep/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          // `dvh`, not `vh`: on a phone browser `vh` is the height with the
          // address bar hidden, so a sheet sized in it hangs below the visible
          // area until the bar collapses — and the footer button is the part
          // that disappears.
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col border-t border-hairline bg-background duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <Dialog.Title asChild>
              <Eyebrow className="text-ink">{t('catalog.sheetTitle')}</Eyebrow>
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('catalog.closeFilters')}
                className="-mr-2 inline-flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-ink"
              >
                <X aria-hidden="true" className="size-5 stroke-[1.25]" />
              </button>
            </Dialog.Close>
          </div>

          {/* The only scrolling region. The header and the footer stay put, so
              the way out is always on screen however long the tree gets. */}
          <div className="at-scroll-thin flex-1 overflow-y-auto px-5 py-6">{children}</div>

          <div className="border-t border-hairline p-5">
            <Dialog.Close asChild>
              <button
                type="button"
                className="at-label min-h-12 w-full bg-brass text-background transition-colors duration-300 hover:bg-brass-bright"
              >
                {t('catalog.sheetApply', { count: resultCount })}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
