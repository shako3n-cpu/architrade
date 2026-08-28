import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Media } from '@/components/ui/media'
import { useLanguage } from '@/hooks/use-language'
import type { CategoryNode } from '@/lib/category-tree'
import { categoryImage, categoryTitle } from '@/lib/localize'
import { cn } from '@/lib/utils'

/** Featured branches shown as photographs down the right-hand rail. */
const FEATURE_LIMIT = 2

/**
 * The catalogue mega menu.
 *
 * WHY A PANEL AND NOT A CASCADE
 *   Nested flyouts make the visitor steer: the pointer has to cross one strip
 *   to reach the next without clipping a sibling and losing the lot. One panel
 *   that shows every branch at once has no diagonal to steer along, and it
 *   answers "what is in this shop" in a single look — which is the whole point
 *   when there is no search box to fall back on.
 *
 * OPENS ON HOVER, BUT NOT ONLY ON HOVER
 *   Hover is how a mouse expects this to work, so it opens on pointer enter.
 *   That is useless to a keyboard and hostile on a touchscreen, so the trigger
 *   is also a real button: Enter and Space toggle it, Escape closes it and
 *   returns focus, and moving focus out of the panel closes it. The trigger
 *   itself always navigates to /catalog when activated by click, so the menu
 *   never becomes the only way to reach the catalogue.
 *
 * CLOSING ON NAVIGATION
 *   Tied to `location`, not to the click handler — a link inside the panel, a
 *   browser back button and a redirect all have to close it, and only the
 *   first of those goes through a handler this component owns.
 */
export function MegaMenu({ tree, className }: { tree: CategoryNode[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { localePath, t } = useLanguage()
  const wrapper = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      // Focus would otherwise be left on a panel that no longer exists, which
      // drops the keyboard user back at the top of the document.
      trigger.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // An empty tree means the catalogue has not loaded, or every branch is
  // hidden. Either way there is nothing to drop down, so the trigger degrades
  // to the plain link it would have been.
  if (tree.length === 0) {
    return (
      <Link to={localePath('/catalog')} className={cn('at-label py-2 text-muted hover:text-ink', className)}>
        {t('nav.catalog')}
      </Link>
    )
  }

  const featured = tree.filter((node) => node.category.featured).slice(0, FEATURE_LIMIT)

  return (
    <div
      ref={wrapper}
      className={cn('static', className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onBlur={(event) => {
        // relatedTarget is where focus is going. Inside the panel means the
        // visitor is still using it; anywhere else means they have left.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="mega-menu"
        onClick={() => setOpen(!open)}
        className={cn(
          'at-label relative flex items-center gap-1.5 py-2 transition-colors duration-300',
          'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left',
          'after:bg-brass after:transition-transform after:duration-300',
          open ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink',
        )}
      >
        {t('nav.catalog')}
        <ChevronDown
          aria-hidden="true"
          className={cn('size-3.5 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      <div
        id="mega-menu"
        // Kept mounted and hidden rather than unmounted: the panel holds real
        // links, and a crawler that never fires a pointer event should still
        // find them.
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-t border-hairline bg-background shadow-none"
      >
        <div className="mx-auto w-full max-w-[90rem] px-5 py-12 sm:px-8 lg:px-12">
          <div className={cn('grid gap-10', featured.length > 0 ? 'lg:grid-cols-[1fr_20rem]' : '')}>
            <ul className="grid gap-x-10 gap-y-11 sm:grid-cols-2 xl:grid-cols-4">
              {tree.map((node) => (
                <li key={node.category.id}>
                  <BranchColumn node={node} />
                </li>
              ))}
            </ul>

            {featured.length > 0 && (
              <div className="hidden gap-6 lg:grid">
                {featured.map((node) => (
                  <FeatureCard key={node.category.id} node={node} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** One top-level branch: the parent as a heading, its children beneath. */
function BranchColumn({ node }: { node: CategoryNode }) {
  const { lang, localePath } = useLanguage()

  return (
    <>
      <Link
        to={localePath(`/catalog/${node.category.slug}`)}
        className="font-heading text-base text-ink transition-colors duration-300 hover:text-brass"
      >
        {categoryTitle(node.category, lang)}
      </Link>

      <ul className="mt-4 flex flex-col gap-2.5 border-t border-hairline pt-4">
        {node.children.map((child) => (
          <li key={child.category.id}>
            <Link
              to={localePath(`/catalog/${child.category.slug}`)}
              className="group flex items-baseline justify-between gap-3 text-sm text-muted transition-colors duration-300 hover:text-brass"
            >
              <span>{categoryTitle(child.category, lang)}</span>
              {/* The count is the honest part of a menu: it says whether the
                  link is worth following before the page has to load. */}
              <span className="at-label shrink-0 text-muted/70">{child.totalCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

/** A pinned branch, shown as a photograph rather than another list. */
function FeatureCard({ node }: { node: CategoryNode }) {
  const { lang, localePath, t } = useLanguage()
  const image = categoryImage(node.category)

  return (
    <Link to={localePath(`/catalog/${node.category.slug}`)} className="group block">
      {image ? (
        <Media src={image} alt="" ratio="landscape" sizes="20rem" zoom />
      ) : (
        <div aria-hidden="true" className="aspect-[4/3] bg-surface" />
      )}

      <div className="mt-3.5 flex items-baseline justify-between gap-3 border-t border-hairline pt-3.5">
        <span className="font-heading text-base text-ink transition-colors duration-300 group-hover:text-brass">
          {categoryTitle(node.category, lang)}
        </span>
        <span className="at-label shrink-0 text-muted">
          {t('catalog.resultCount', { count: node.totalCount })}
        </span>
      </div>
    </Link>
  )
}
