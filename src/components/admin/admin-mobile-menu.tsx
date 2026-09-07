import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, LogOut, Menu, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { publicSiteUrl } from '@/lib/host'
import type { Language } from '@/config/site'
import { cn } from '@/lib/utils'

/**
 * ============================================================================
 * THE BACK OFFICE ON A PHONE
 * ----------------------------------------------------------------------------
 * The admin header was built to wrap, which is honest but not usable: at 375px
 * the four navigation links, the wordmark, the badge, the language pair, the
 * site link and sign out came to 197px of header — a quarter of the screen,
 * before a single product row. Everything was reachable and nothing was
 * comfortable, and the row of 44px targets left the longest label 103px.
 *
 * Below `xl` it is now a wordmark and a button. Everything else moves in here.
 *
 * THE SAME DRAWER THE SHOP HAS
 *   Deliberately built on the same Radix Dialog, opening from the same side,
 *   with the same backdrop and the same locale keys — `header.openMenu`,
 *   `header.menuTitle`, `header.closeMenu` already existed and already read
 *   correctly in Georgian. The people using this also use the site, and a back
 *   office that behaves like a different product on a phone is a back office
 *   that gets used on a laptop instead.
 *
 *   Radix carries the parts that are easy to get wrong and invisible when they
 *   are: focus moves into the panel and comes back to the button, the page
 *   behind stops scrolling, Escape closes, and the rest of the app is hidden
 *   from a screen reader while it is open.
 *
 * WHY `xl` AND NOT `sm`, OR EVEN `lg`
 *   The breakpoint is not about phones. It is where the one-line header stops
 *   fitting, which is a fact about the Georgian labels: they need about
 *   1100px against roughly 970px for English.
 *
 *   `lg` was tried first and measured wrong — at exactly 1024 the full header
 *   comes back and Georgian wraps to 109px against English's 63px, which is
 *   precisely the language-dependent height 4782097 was written to remove.
 *   `xl` is 1280, the nearest step at which BOTH languages have been measured
 *   on one line, so the drawer covers every width where they would disagree.
 *
 *   The cost is that a 1024-1279 tablet gets the drawer rather than the full
 *   header. That is the right way round: a menu is a normal thing to find on a
 *   tablet, and a header that changes height when you switch language is not.
 * ============================================================================
 */
export function AdminMobileMenu({
  email,
  isAdmin,
  lang,
  switchLanguage,
  onSignOut,
}: {
  email?: string | null
  isAdmin?: boolean
  lang: Language
  switchLanguage: (next: Language) => void
  onSignOut: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  /*
   * Closed by navigating.
   *
   * The links are client-side, so without this the panel would sit over the
   * screen it just moved to — and the first thing anybody does after tapping
   * "Categories" is look for a way to dismiss the thing covering the
   * categories.
   */
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('header.openMenu')}
          className="-mr-2 ml-auto inline-flex size-11 items-center justify-center text-ink transition-colors duration-300 hover:text-brass xl:hidden"
        >
          <Menu className="size-6 stroke-[1.25]" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col border-l border-hairline bg-surface duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
            <Dialog.Title className="text-[10px] tracking-[0.18em] text-brass uppercase">
              {t('admin.badge')}
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

          {/* Scrolls, because a short phone in landscape has less room than the
              list needs and a panel that cannot reach its own last item is
              worse than one that scrolls. */}
          <nav
            aria-label={t('admin.navLabel')}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <DrawerLink to="/admin" end>
              {t('admin.navProducts')}
            </DrawerLink>
            <DrawerLink to="/admin/categories">{t('admin.navCategories')}</DrawerLink>
            <DrawerLink to="/admin/brands">{t('admin.navBrands')}</DrawerLink>
            {isAdmin && <DrawerLink to="/admin/users">{t('admin.navUsers')}</DrawerLink>}
          </nav>

          <div className="border-t border-hairline px-6 py-5">
            {/* Which account this is. It is the first thing worth knowing on a
                shared phone, and unlike in the header there is room for it. */}
            {email && <p className="text-xs break-all text-muted">{email}</p>}

            <div className="mt-4">
              <LanguageSwitcher size="sm" lang={lang} onSwitch={switchLanguage} />
            </div>

            <a
              href={publicSiteUrl(`/${lang}`)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm text-muted transition-colors duration-300 hover:text-brass"
            >
              <ExternalLink aria-hidden="true" className="size-4 stroke-[1.25]" />
              {t('admin.viewSite')}
            </a>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              className="flex min-h-11 w-full items-center gap-3 text-left text-sm text-muted transition-colors duration-300 hover:text-brass"
            >
              <LogOut aria-hidden="true" className="size-4 stroke-[1.25]" />
              {t('admin.signOut')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * A row, not a chip.
 *
 * The header draws these as bordered chips because they sit in a line. Here
 * they are stacked, where a chip's border reads as a box round a single word
 * and the full-width row is both easier to hit and easier to scan.
 */
function DrawerLink({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex min-h-12 items-center border-b border-hairline/60 text-sm tracking-[0.06em] uppercase last:border-b-0',
          'transition-colors duration-300',
          isActive ? 'text-brass' : 'text-ink hover:text-brass',
        )
      }
    >
      {children}
    </NavLink>
  )
}
