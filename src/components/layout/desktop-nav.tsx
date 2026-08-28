import { NavLink } from 'react-router-dom'
import { MAIN_NAV } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import type { CategoryNode } from '@/lib/category-tree'
import { cn } from '@/lib/utils'
import { MegaMenu } from './mega-menu'

/**
 * Centre navigation, shown from the `lg` breakpoint up. Below that the header
 * swaps to the slide-in drawer instead.
 *
 * The active link is marked with a thin brass rule underneath rather than a
 * filled pill — consistent with the hairline language of the rest of the site.
 *
 * `/catalog` is not rendered as a link here. It is the one item with a tree
 * behind it, so it becomes the mega-menu trigger; the trigger still reaches
 * /catalog on its own, so nothing is lost by the swap.
 */
export function DesktopNav({ tree, className }: { tree: CategoryNode[]; className?: string }) {
  const { localePath, t } = useLanguage()

  return (
    <nav aria-label={t('header.mainNavLabel')} className={cn('hidden lg:block', className)}>
      <ul className="flex items-center gap-9">
        {MAIN_NAV.map((item) =>
          item.to === '/catalog' ? (
            <li key={item.to}>
              <MegaMenu tree={tree} />
            </li>
          ) : (
            <li key={item.to}>
              <NavLink
                to={localePath(item.to)}
                // "end" is off so /catalog stays active on /catalog/living-room.
                className={({ isActive }) =>
                  cn(
                    'at-label relative py-2 transition-colors duration-300',
                    'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px',
                    'after:origin-left after:scale-x-0 after:bg-brass',
                    'after:transition-transform after:duration-300',
                    'hover:text-ink hover:after:scale-x-100',
                    isActive ? 'text-ink after:scale-x-100' : 'text-muted',
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
