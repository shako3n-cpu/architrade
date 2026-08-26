import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X, Phone } from 'lucide-react'
import { MAIN_NAV, CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { LanguageSwitcher } from './language-switcher'
import { Divider } from '@/components/ui/divider'
import { Eyebrow } from '@/components/ui/eyebrow'

/**
 * Slide-in navigation for tablet and phone (hidden from `lg` up).
 *
 * Built on Radix Dialog, which handles the parts that are easy to get wrong:
 * focus is trapped inside the panel while it is open, Escape closes it, the
 * page behind it cannot scroll, and focus returns to the menu button on close.
 */
export function MobileDrawer() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { localePath, t } = useLanguage()

  // Close the drawer whenever the visitor navigates, otherwise it would stay
  // open on top of the page they just asked for.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('header.openMenu')}
          className="-mr-2 inline-flex size-11 items-center justify-center text-ink transition-colors duration-300 hover:text-brass lg:hidden"
        >
          <Menu className="size-6 stroke-[1.25]" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Backdrop. Fades rather than slides, so the two motions don't fight. */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col border-l border-hairline bg-surface duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          {/* Radix requires a title for the accessible name; ours is visible. */}
          <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
            <Dialog.Title asChild>
              <Eyebrow className="text-ink">{t('header.menuTitle')}</Eyebrow>
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('header.closeMenu')}
                className="-mr-2 inline-flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-ink"
              >
                <X className="size-5 stroke-[1.25]" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label={t('header.mainNavLabel')} className="flex-1 overflow-y-auto px-6 py-8">
            <ul className="flex flex-col">
              {MAIN_NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={localePath(item.to)}
                    className="block border-b border-hairline py-4 font-heading text-2xl text-ink transition-colors duration-300 hover:text-brass"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-6 pb-8">
            <Divider className="mb-6" />

            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="mb-4 flex min-h-11 items-center gap-3 text-ink transition-colors duration-300 hover:text-brass"
            >
              <Phone className="size-4 stroke-[1.25]" aria-hidden="true" />
              <span className="text-base">{CONTACT.phoneDisplay}</span>
            </a>

            <LanguageSwitcher size="sm" className="-ml-2.5" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
