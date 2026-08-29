import { useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useLanguage } from '@/hooks/use-language'
import { categoryTitle } from '@/lib/localize'
import type { CategoryNode } from '@/lib/category-tree'
import { isUnfiltered, type CatalogFilters } from '@/lib/catalog-filter'
import { cn } from '@/lib/utils'

/**
 * The filter rail.
 *
 * AN ACCORDION, NOT A FLAT LIST
 *   Every branch open at once is sixteen rows today and grows with the
 *   catalogue, which overran the rail and left the lower half unreachable —
 *   the sticky container clipped it and nothing scrolled. Branches are now
 *   closed by default, so the visitor reads four rooms and opens the one they
 *   want. The tree is the same one the mega menu draws, so arriving through
 *   either does not mean relearning the other.
 *
 * TWO TARGETS ON A PARENT ROW, AND BOTH ARE NEEDED
 *   The name SELECTS the branch — "everything in Office" is a real filter and
 *   one of the most useful, so it must stay one click — and selecting also
 *   opens it, because having narrowed to nine products the obvious next
 *   question is which nine. The chevron beside it only opens and closes,
 *   changing nothing about what is shown in the grid.
 *
 *   Collapsing them into one control loses one of the two: the whole row
 *   filtering leaves no way to close a branch, and the whole row toggling
 *   leaves no way to filter by a parent at all.
 *
 * THE OPEN BRANCH FOLLOWS THE URL
 *   Landing on ?c=sofas opens Living Room with Sofas marked, rather than
 *   showing three closed branches and a filtered grid with no visible reason.
 *   A manual toggle overrides that for as long as the visitor is on the page.
 *
 * IT SCROLLS ON ITS OWN
 *   The rail is sticky, so its height is bounded by the viewport rather than
 *   by the page. The category list gets that leftover height and its own
 *   scrollbar; the search field, the featured checkbox and the clear button
 *   stay outside it, pinned and always reachable.
 *
 * COLLAPSED ON A PHONE, OPEN ON A DESKTOP
 *   Stacked above the grid, the full rail put 1235px — a screen and a half —
 *   between the page heading and the first product, measured on a 375px
 *   viewport. So on mobile everything below the search field folds behind a
 *   toggle. The search field itself never folds: on a phone it is the fast
 *   path, and the category list is the browsing one.
 */
export function CatalogFilterRail({
  branches,
  counts,
  total,
  filters,
  onChange,
}: {
  /*
   * The tree ARRIVES BUILT. It used to be built here from `categories`
   * alone — and `publicTree` hides any branch holding no products, so with
   * no products passed in every count was zero and it hid the entire tree.
   * The rail rendered "All products" and not one category. Whoever owns the
   * products owns the tree; this component only draws it.
   */
  branches: CategoryNode[]
  counts: Record<string, number>
  /** Pieces in the whole catalogue, for the "all" row. */
  total: number
  filters: CatalogFilters
  onChange: (next: Partial<CatalogFilters>) => void
}) {
  const { lang, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [toggled, setToggled] = useState<Record<string, boolean>>({})

  /** The branch the current filter sits in, whether as parent or as child. */
  const activeBranchId = branches.find(
    (branch) =>
      branch.category.slug === filters.category ||
      branch.children.some((child) => child.category.slug === filters.category),
  )?.category.id

  const isExpanded = (branch: CategoryNode) =>
    toggled[branch.category.id] ?? branch.category.id === activeBranchId

  const toggle = (branch: CategoryNode) =>
    setToggled((current) => ({ ...current, [branch.category.id]: !isExpanded(branch) }))

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <search>
        <label className="block">
          <span className="at-label mb-3 block text-muted">{t('catalog.searchLabel')}</span>

          <span className="relative block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => onChange({ query: event.target.value })}
              placeholder={t('catalog.searchPlaceholder')}
              className="h-12 w-full rounded-xs border border-hairline bg-background pr-4 pl-10 text-sm text-ink transition-colors duration-300 placeholder:text-muted focus:border-brass"
            />
          </span>
        </label>
      </search>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="catalog-filters"
        className="at-label flex min-h-11 items-center justify-between border border-hairline px-4 text-ink transition-colors duration-300 hover:border-brass hover:text-brass lg:hidden"
      >
        <span className="flex items-center gap-2.5">
          <SlidersHorizontal aria-hidden="true" className="size-3.5" />
          {t('catalog.toggleFilters')}
        </span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      <div id="catalog-filters" className={cn('flex-col gap-8', open ? 'flex' : 'hidden lg:flex')}>
        <div>
          <Eyebrow className="mb-4 text-muted">{t('catalog.filterHeading')}</Eyebrow>

          {/* The scroll area. `-mr-2 pr-2` keeps the scrollbar clear of the
              counts instead of overlapping them, and the max-height is the
              viewport minus the header, the sticky offset and the block of
              controls pinned underneath. */}
          <div className="at-scroll-thin -mr-2 border-t border-hairline pr-2 lg:max-h-[calc(100vh-22rem)] lg:overflow-y-auto">
            <FilterRow
              label={t('catalog.allProducts')}
              count={total}
              active={!filters.category}
              onClick={() => onChange({ category: '' })}
            />

            <ul>
              {branches.map((branch) => {
                const expanded = isExpanded(branch)
                const panelId = `filter-branch-${branch.category.slug}`

                return (
                  <li key={branch.category.id}>
                    <BranchRow
                      node={branch}
                      count={counts[branch.category.slug] ?? 0}
                      active={filters.category === branch.category.slug}
                      expanded={expanded}
                      panelId={panelId}
                      onSelect={() => {
                        onChange({ category: branch.category.slug })
                        // Selecting a branch always opens it: having narrowed
                        // to nine, the next question is which nine.
                        setToggled((current) => ({ ...current, [branch.category.id]: true }))
                      }}
                      onToggle={() => toggle(branch)}
                    />

                    <ul id={panelId} hidden={!expanded}>
                      {branch.children.map((child) => (
                        <li key={child.category.id}>
                          <FilterRow
                            label={categoryTitle(child.category, lang)}
                            count={counts[child.category.slug] ?? 0}
                            active={filters.category === child.category.slug}
                            onClick={() => onChange({ category: child.category.slug })}
                            indented
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-hairline pt-7">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={filters.featuredOnly}
              onChange={(event) => onChange({ featuredOnly: event.target.checked })}
              className="size-4 accent-[var(--at-brass)]"
            />
            {t('catalog.featuredOnly')}
          </label>

          {!isUnfiltered(filters) && (
            <button
              type="button"
              onClick={() => onChange({ category: '', query: '', featuredOnly: false })}
              className="at-label flex items-center gap-2 self-start text-muted transition-colors duration-300 hover:text-brass"
            >
              <X aria-hidden="true" className="size-3.5" />
              {t('catalog.clearFilters')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** A parent: the name selects the branch, the chevron opens it. */
function BranchRow({
  node,
  count,
  active,
  expanded,
  panelId,
  onSelect,
  onToggle,
}: {
  node: CategoryNode
  count: number
  active: boolean
  expanded: boolean
  panelId: string
  onSelect: () => void
  onToggle: () => void
}) {
  const { lang, t } = useLanguage()
  const name = categoryTitle(node.category, lang)

  return (
    <div className="flex items-stretch border-b border-hairline">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className={cn(
          'flex min-h-11 flex-1 items-baseline justify-between gap-3 py-3 pl-1 text-left transition-colors duration-300',
          active ? 'text-brass' : 'text-ink hover:text-brass',
        )}
      >
        <span className="text-sm font-medium">{name}</span>
        <span className="at-label shrink-0 text-muted">{count}</span>
      </button>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        // The name is already on screen beside it, so the chevron needs one of
        // its own or a screen reader announces a button called nothing.
        aria-label={`${name} — ${t('catalog.subcategories')}`}
        className="inline-flex w-9 shrink-0 items-center justify-center text-muted transition-colors duration-300 hover:text-brass"
      >
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 transition-transform duration-300', expanded && 'rotate-180')}
        />
      </button>
    </div>
  )
}

/** One selectable line: name on the left, count on the right, hairline under. */
function FilterRow({
  label,
  count,
  active,
  onClick,
  indented = false,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  /** Children sit in from their parent, so the shape survives the flattening. */
  indented?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex min-h-11 w-full items-baseline justify-between gap-4 border-b border-hairline py-3 text-left transition-colors duration-300',
        indented ? 'pr-1 pl-5' : 'px-1',
        active ? 'text-brass' : 'text-ink hover:text-brass',
      )}
    >
      <span className="text-sm">{label}</span>
      <span className="at-label shrink-0 text-muted">{count}</span>
    </button>
  )
}
