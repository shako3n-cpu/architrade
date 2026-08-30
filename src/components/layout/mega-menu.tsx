import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Media } from '@/components/ui/media'
import { useLanguage } from '@/hooks/use-language'
import type { CategoryNode } from '@/lib/category-tree'
import { categoryImage, categoryTitle } from '@/lib/localize'
import { cn } from '@/lib/utils'

/** Featured branches shown as photographs down the right-hand rail. */
const FEATURE_LIMIT = 2

/** Grace period before a hover-opened menu closes, in ms. */
const CLOSE_DELAY = 220

/** How far the page must move before a locked menu gives up, in px. */
const SCROLL_TOLERANCE = 120

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
 * THE DEAD STRIP, WHICH IS WHY THIS USED TO SHUT IN YOUR FACE
 *   The panel hangs off the BOTTOM OF THE HEADER, while the trigger is a
 *   button centred inside it. That left a strip — header padding, ~20px — that
 *   belonged to neither: moving the cursor down from the word "Catalogue"
 *   crossed it, `pointerleave` fired, and the menu closed before the pointer
 *   ever reached the links it was aimed at.
 *
 *   Two fixes, and both are wanted. The wrapper is now the FULL HEIGHT of the
 *   header, so the strip is inside it and the descent never leaves the
 *   element at all. And closing is on a timer, so a cursor that clips a corner
 *   on the way down has ~220ms to come back before anything happens.
 *
 * HOVER OPENS IT, A CLICK PINS IT
 *   Hover alone is a poor contract: it is useless to a keyboard, hostile on a
 *   touchscreen, and it means the menu can never be read at leisure. So a
 *   click LOCKS it open and it stays until the visitor says otherwise —
 *   clicking the trigger again, clicking anywhere outside it, pressing Escape,
 *   or scrolling the page more than a screen-corner's worth. While locked,
 *   pointer-out does nothing.
 */
export function MegaMenu({ tree, className }: { tree: CategoryNode[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const [locked, setLocked] = useState(false)
  const location = useLocation()
  const { localePath, t } = useLanguage()
  const wrapper = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const cancelClose = useCallback(() => {
    if (closeTimer.current === undefined) return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = undefined
  }, [])

  const closeNow = useCallback(() => {
    cancelClose()
    setOpen(false)
    setLocked(false)
  }, [cancelClose])

  // Navigating closes it: a link inside the panel, the back button and a
  // redirect all have to, and only the first goes through a handler here.
  useEffect(() => {
    closeNow()
  }, [location.pathname, closeNow])

  // Timers outlive the component if the visitor navigates mid-countdown.
  useEffect(() => cancelClose, [cancelClose])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      closeNow()
      // Focus would otherwise be stranded on a panel that is no longer there,
      // dropping the keyboard user back at the top of the document.
      trigger.current?.focus()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (wrapper.current?.contains(event.target as Node)) return
      closeNow()
    }

    // Anchored to where the page was when it opened, so the menu survives the
    // small scroll a trackpad emits while the pointer is only resting.
    const openedAt = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAt) > SCROLL_TOLERANCE) closeNow()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open, closeNow])

  // An empty tree means the catalogue has not loaded, or every branch is
  // hidden. Either way there is nothing to drop down, so the trigger degrades
  // to the plain link it would otherwise have been.
  if (tree.length === 0) {
    return (
      <Link
        to={localePath('/catalog')}
        className={cn('at-label py-2 text-muted hover:text-ink', className)}
      >
        {t('nav.catalog')}
      </Link>
    )
  }

  const featured = tree.filter((node) => node.category.featured).slice(0, FEATURE_LIMIT)

  /*
   * Marked active on the catalogue AND on any category beneath it, matching
   * the `end`-less NavLinks beside it. The trigger never showed this at all
   * while it was a plain button: standing on /catalog, the one nav item that
   * described where you were was the only one not lit.
   */
  const catalogPath = localePath('/catalog')
  const onCatalog =
    location.pathname === catalogPath || location.pathname.startsWith(`${catalogPath}/`)

  return (
    <div
      ref={wrapper}
      // Full header height, so the strip under the button is inside the
      // element and moving down into the panel never leaves it. `static` keeps
      // the panel positioned against the header rather than against this.
      className={cn('static flex h-[var(--at-header-height)] items-center', className)}
      onPointerEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onPointerLeave={() => {
        if (locked) return
        cancelClose()
        closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY)
      }}
      onBlur={(event) => {
        if (locked) return
        // relatedTarget is where focus is going: inside means still in use.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeNow()
      }}
    >
      {/*
       * TWO CONTROLS, NOT ONE.
       *
       * This was a single button carrying the word and the chevron, so the one
       * thing "Catalogue" could not do was go to the catalogue: every click
       * toggled the panel. The word is a LINK now and the chevron is a
       * disclosure button beside it, which is the ordinary shape for a nav
       * item that is both a destination and a menu — and it costs nothing,
       * because hovering anywhere on the pair still opens the panel, so the
       * browsing route is untouched.
       *
       * The underline lives on this wrapper rather than on either control, so
       * it still spans the pair as one item. The wrapper is `relative` for
       * that; the PANEL is not inside it and still resolves against the
       * header, which is what the outer element's `static` is protecting.
       */}
      <div
        className={cn(
          'at-label relative flex items-center gap-1.5 py-2 transition-colors duration-300',
          'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left',
          'after:bg-brass after:transition-transform after:duration-300',
          open || onCatalog ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0',
        )}
      >
        <Link
          to={catalogPath}
          // Closing on click covers the case navigation cannot: clicking it
          // while already on /catalog changes no pathname, so the effect that
          // watches the route would never fire and the panel would hang open
          // over the page it just confirmed you were on.
          onClick={closeNow}
          className="transition-colors duration-300 hover:text-ink"
        >
          {t('nav.catalog')}
        </Link>

        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls="mega-menu"
          // The chevron has no text of its own, so it needs a name. Without
          // one a screen reader announces "button" next to a link and gives no
          // reason to press it.
          aria-label={t('nav.catalogMenuToggle')}
          onClick={() => {
            if (locked) {
              closeNow()
              return
            }
            cancelClose()
            setOpen(true)
            setLocked(true)
          }}
          className="-mr-1 flex items-center px-1 py-1 transition-colors duration-300 hover:text-ink"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn('size-3.5 transition-transform duration-300', open && 'rotate-180')}
          />
        </button>
      </div>

      <div
        id="mega-menu"
        // Kept mounted and hidden rather than unmounted: the panel holds real
        // links, and a crawler that never fires a pointer event should still
        // find them.
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-t border-hairline bg-background"
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
