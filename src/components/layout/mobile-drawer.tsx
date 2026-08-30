import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X, Phone, Plus, Minus } from 'lucide-react'
import { MAIN_NAV, CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import type { CategoryNode } from '@/lib/category-tree'
import { categoryTitle } from '@/lib/localize'
import { LanguageSwitcher } from './language-switcher'
import { Divider } from '@/components/ui/divider'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'

/**
 * Slide-in navigation for tablet and phone (hidden from `lg` up).
 *
 * COMPACT ON PURPOSE
 *   The rows carried desktop-sized type and padding — 24px headings with 16px
 *   above and below, which made a top-level row 65px tall. With the catalogue
 *   tree in here the list overflowed its own panel and the visitor had to
 *   scroll a menu. Rows are tighter now, and the branch rows carry an explicit
 *   `min-h-11` so the padding can come down without the tap target coming down
 *   with it: 44px is the floor whatever the padding says.
 *
 * Built on Radix Dialog, which handles the parts that are easy to get wrong:
 * focus is trapped inside the panel while it is open, Escape closes it, the
 * page behind it cannot scroll, and focus returns to the menu button on close.
 */
export function MobileDrawer({ tree }: { tree: CategoryNode[] }) {
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

          <nav aria-label={t('header.mainNavLabel')} className="flex-1 overflow-y-auto px-6 py-5">
            <ul className="flex flex-col">
              {MAIN_NAV.map((item) =>
                item.to === '/catalog' && tree.length > 0 ? (
                  <li key={item.to}>
                    <CategoryAccordion tree={tree} />
                  </li>
                ) : (
                  <li key={item.to}>
                    <Link
                      to={localePath(item.to)}
                      className="block border-b border-hairline py-3 font-heading text-xl text-ink transition-colors duration-300 hover:text-brass"
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="px-6 pb-6">
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

/**
 * The catalogue, as a one-level-at-a-time accordion.
 *
 * NOT THE MEGA MENU, SHRUNK
 *   Every branch expanded at once is 29 rows on a 375px screen — several
 *   screens of scrolling before the visitor reaches "About". So the branches
 *   stay closed until asked for, and opening one closes the last: on a phone
 *   the useful question is "what is in Office", not "show me everything".
 *
 * The parent row is a LINK and the toggle is a SEPARATE BUTTON beside it.
 * Making the whole row a toggle would leave no way to reach the parent's own
 * page; making the whole row a link would leave no way to see the children.
 * Both are reachable, and both are full-height tap targets.
 */
function CategoryAccordion({ tree }: { tree: CategoryNode[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const { lang, localePath, t } = useLanguage()

  return (
    <div className="border-b border-hairline">
      <Link
        to={localePath('/catalog')}
        className="block border-b border-hairline py-3 font-heading text-xl text-ink transition-colors duration-300 hover:text-brass"
      >
        {t('nav.catalog')}
      </Link>

      <ul className="flex flex-col">
        {tree.map((node) => {
          const isOpen = openId === node.category.id
          const panelId = `drawer-branch-${node.category.slug}`

          return (
            <li key={node.category.id} className="border-b border-hairline last:border-b-0">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={localePath(`/catalog/${node.category.slug}`)}
                  className="flex min-h-11 flex-1 items-center py-2 pl-4 text-base text-ink transition-colors duration-300 hover:text-brass"
                >
                  {categoryTitle(node.category, lang)}
                </Link>

                {node.children.length > 0 && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={categoryTitle(node.category, lang)}
                    onClick={() => setOpenId(isOpen ? null : node.category.id)}
                    className="inline-flex size-11 shrink-0 items-center justify-center text-muted transition-colors duration-300 hover:text-brass"
                  >
                    {isOpen ? (
                      <Minus className="size-4 stroke-[1.25]" aria-hidden="true" />
                    ) : (
                      <Plus className="size-4 stroke-[1.25]" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>

              <ul id={panelId} className={cn('flex-col pb-2 pl-8', isOpen ? 'flex' : 'hidden')}>
                {node.children.map((child) => (
                  <li key={child.category.id}>
                    <Link
                      to={localePath(`/catalog/${child.category.slug}`)}
                      className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm text-muted transition-colors duration-300 hover:text-brass"
                    >
                      <span>{categoryTitle(child.category, lang)}</span>
                      <span className="at-label shrink-0 text-muted/70">{child.totalCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
