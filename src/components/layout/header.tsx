import { Phone } from 'lucide-react'
import { CONTACT } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { useNavigationTree } from '@/hooks/use-navigation'
import { useScrolled } from '@/hooks/use-scrolled'
import { cn } from '@/lib/utils'
import { Wordmark } from './wordmark'
import { DesktopNav } from './desktop-nav'
import { LanguageSwitcher } from './language-switcher'
import { MobileDrawer } from './mobile-drawer'

/**
 * Sticky site header.
 *
 * Always solid off-white; only the bottom hairline is animated, appearing once
 * content starts sliding underneath. At the top of the page the header and the
 * page share a background and the join is invisible, which is what makes the
 * light theme feel like one continuous sheet.
 *
 * It deliberately does NOT go transparent over the hero. Charcoal navigation
 * laid over an arbitrary photograph is a contrast gamble that the client would
 * lose the first time they swapped the image, so the hero keeps its own half of
 * the split instead.
 */
export function Header() {
  const { t } = useLanguage()
  const scrolled = useScrolled(24)
  // Fetched once here and handed to both navigations, rather than each one
  // asking for the same tree. See the note in use-navigation.ts.
  const { tree } = useNavigationTree()

  return (
    <>
      {/* Keyboard users land here first and can jump the whole navigation.
          Visually hidden until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-xs focus:bg-brass focus:px-5 focus:py-3 focus:text-sm focus:text-background"
      >
        {t('header.skipToContent')}
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur-sm',
          'transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          scrolled ? 'border-hairline' : 'border-transparent',
        )}
      >
        <div className="mx-auto flex h-[var(--at-header-height)] w-full max-w-[90rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          {/* Left — wordmark. Fixed basis on desktop so the centre nav is
              genuinely centred rather than pushed by the wordmark's width. */}
          <div className="flex lg:flex-1">
            <Wordmark />
          </div>

          {/* Centre — main navigation (desktop only). */}
          <DesktopNav tree={tree} />

          {/* Right — language switcher, phone, and the mobile menu button. */}
          <div className="flex items-center justify-end gap-2 lg:flex-1 lg:gap-5">
            <LanguageSwitcher className="hidden sm:flex" />

            <span aria-hidden="true" className="hidden h-4 w-px bg-hairline lg:block" />

            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="hidden items-center gap-2.5 text-sm text-ink transition-colors duration-300 hover:text-brass lg:inline-flex"
            >
              <Phone className="size-4 stroke-[1.25]" aria-hidden="true" />
              <span>{CONTACT.phoneDisplay}</span>
            </a>

            <MobileDrawer tree={tree} />
          </div>
        </div>
      </header>
    </>
  )
}
