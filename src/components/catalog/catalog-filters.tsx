import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useLanguage } from '@/hooks/use-language'
import type { Category } from '@/data/types'
import { categoryTitle } from '@/lib/localize'
import { buildCategoryTree, publicTree, type CategoryNode } from '@/lib/category-tree'
import { isUnfiltered, type CatalogFilters } from '@/lib/catalog-filter'
import { cn } from '@/lib/utils'

/**
 * The filter rail.
 *
 * A LIST, NOT A DROPDOWN
 *   Six to twelve categories fit on screen, so showing them costs nothing and
 *   answers the question a dropdown makes you open it to ask: what is in here,
 *   and how much of it. The counts come from the loaded rows, so a category
 *   with nothing in it reads 0 rather than pretending.
 *
 * Categories are grouped BY THEIR PARENT, which is the same tree the mega
 * menu renders. This replaced a hardcoded home/office split that predated the
 * hierarchy: the rail and the menu now cut the catalogue the same way, so a
 * visitor who arrived through one is not asked to relearn the other.
 *
 * COLLAPSED ON A PHONE, OPEN ON A DESKTOP
 *   Stacked above the grid, the full rail put 1235px — a screen and a half —
 *   between the page heading and the first product, measured on a 375px
 *   viewport. So on mobile everything below the search field folds behind a
 *   toggle. The search field itself never folds: on a phone it is the fast
 *   path, and the category list is the browsing one.
 */
export function CatalogFilterRail({
  categories,
  counts,
  total,
  filters,
  onChange,
}: {
  categories: Category[]
  counts: Record<string, number>
  /** Pieces in the whole catalogue, for the "all" row. */
  total: number
  filters: CatalogFilters
  onChange: (next: Partial<CatalogFilters>) => void
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  // Only branches the public can see, so the rail and the menu agree on what
  // the catalogue contains.
  const branches = publicTree(buildCategoryTree(categories))

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
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

      <div id="catalog-filters" className={cn('flex-col gap-10', open ? 'flex' : 'hidden lg:flex')}>
        <div>
          <Eyebrow className="mb-4 text-muted">{t('catalog.filterHeading')}</Eyebrow>

          <ul className="border-t border-hairline">
            <li>
              <FilterRow
                label={t('catalog.allProducts')}
                count={total}
                active={!filters.category}
                onClick={() => onChange({ category: '' })}
              />
            </li>
          </ul>

          {branches.map((branch) => (
            <div key={branch.category.id} className="mt-7">
              <BranchHeading node={branch} />

              <ul className="border-t border-hairline">
                {/* The parent itself is a row, so "everything in Office" is
                    one click rather than four. */}
                <li>
                  <CategoryRow
                    category={branch.category}
                    count={counts[branch.category.slug] ?? 0}
                    active={filters.category === branch.category.slug}
                    onClick={() => onChange({ category: branch.category.slug })}
                  />
                </li>

                {branch.children.map((child) => (
                  <li key={child.category.id}>
                    <CategoryRow
                      category={child.category}
                      count={counts[child.category.slug] ?? 0}
                      active={filters.category === child.category.slug}
                      onClick={() => onChange({ category: child.category.slug })}
                      indented
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
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

/** A top-level branch's name, used as the group heading over its children. */
function BranchHeading({ node }: { node: CategoryNode }) {
  const { lang } = useLanguage()
  return (
    <Eyebrow className="mb-3 text-brass-on-surface">
      {categoryTitle(node.category, lang)}
    </Eyebrow>
  )
}

/** A category row, named through the localiser. */
function CategoryRow({
  category,
  count,
  active,
  onClick,
  indented = false,
}: {
  category: Category
  count: number
  active: boolean
  onClick: () => void
  /** Children sit in from their parent, so the shape survives the flattening. */
  indented?: boolean
}) {
  const { lang } = useLanguage()
  return (
    <FilterRow
      label={categoryTitle(category, lang)}
      count={count}
      active={active}
      onClick={onClick}
      indented={indented}
    />
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
