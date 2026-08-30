import { useState } from 'react'
import { Search } from 'lucide-react'
import { FilterSheet } from './filter-sheet'
import { activeFilterCount, FilterBody } from './filter-body'
import { useLanguage } from '@/hooks/use-language'
import type { CategoryNode } from '@/lib/category-tree'
import type { CatalogFilters } from '@/lib/catalog-filter'

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
  resultCount,
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
  /** Pieces matching right now, for the sheet's closing button. */
  resultCount: number
  filters: CatalogFilters
  onChange: (next: Partial<CatalogFilters>) => void
}) {
  const { lang, t } = useLanguage()
  const [toggled, setToggled] = useState<Record<string, boolean>>({})

  /** The branch the current filter sits in, whether as parent or as child. */
  const activeBranchId = branches.find(
    (branch) =>
      branch.category.slug === filters.category ||
      branch.children.some((child) => child.category.slug === filters.category),
  )?.category.id

  const isExpanded = (branch: CategoryNode) =>
    toggled[branch.category.id] ?? branch.category.id === activeBranchId

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
              className="h-12 w-full rounded-xs border border-hairline bg-background pr-4 pl-10 text-base text-ink transition-colors duration-300 placeholder:text-muted focus:border-brass sm:text-sm"
            />
          </span>
        </label>
      </search>

      {/* Below `lg` the filters live in a sheet that overlays the grid; from
          `lg` the same body is the sticky column it has always been. One set
          of controls, rendered in one of two places, so the two can never
          drift apart. */}
      <FilterSheet
        activeCount={activeFilterCount(filters)}
        resultCount={resultCount}
        className="lg:hidden"
      >
        <FilterBody
          branches={branches}
          counts={counts}
          total={total}
          filters={filters}
          onChange={onChange}
          lang={lang}
          t={t}
          isExpanded={isExpanded}
          setToggled={setToggled}
          scrollsItself={false}
        />
      </FilterSheet>

      <div className="hidden lg:block">
        <FilterBody
          branches={branches}
          counts={counts}
          total={total}
          filters={filters}
          onChange={onChange}
          lang={lang}
          t={t}
          isExpanded={isExpanded}
          setToggled={setToggled}
          scrollsItself
        />
      </div>
    </div>
  )
}
