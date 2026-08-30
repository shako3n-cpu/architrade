import { ChevronDown, X } from 'lucide-react'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { Language } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { categoryTitle } from '@/lib/localize'
import type { CategoryNode } from '@/lib/category-tree'
import { isUnfiltered, type CatalogFilters } from '@/lib/catalog-filter'
import { cn } from '@/lib/utils'

/** How many of the three filters are set. Drives the badge on the trigger. */
export function activeFilterCount(filters: CatalogFilters): number {
  return [filters.category, filters.query.trim(), filters.featuredOnly ? '1' : ''].filter(Boolean)
    .length
}

/**
 * The categories, the featured toggle and the clear button.
 *
 * Rendered twice — once inside the sheet, once in the desktop column — and
 * therefore takes no view state of its own: expansion lives in the rail above
 * so a branch opened on a phone is still open if the window is widened.
 *
 * `scrollsItself` is the one difference between the two. In the column the
 * list needs its own bounded scroll area, because the column is sticky and
 * would otherwise be clipped by the viewport. In the sheet the sheet already
 * scrolls, and a second scroller inside it is the nested-scroll trap where a
 * flick either moves the wrong thing or nothing at all.
 */
export function FilterBody({
  branches,
  counts,
  total,
  filters,
  onChange,
  lang,
  t,
  isExpanded,
  setToggled,
  scrollsItself,
}: {
  branches: CategoryNode[]
  counts: Record<string, number>
  total: number
  filters: CatalogFilters
  onChange: (next: Partial<CatalogFilters>) => void
  lang: Language
  t: (key: string, options?: Record<string, unknown>) => string
  isExpanded: (branch: CategoryNode) => boolean
  setToggled: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  scrollsItself: boolean
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Eyebrow className="mb-4 text-muted">{t('catalog.filterHeading')}</Eyebrow>

        <div
          className={cn(
            'border-t border-hairline',
            scrollsItself && 'at-scroll-thin -mr-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2',
          )}
        >
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
                      setToggled((current) => ({ ...current, [branch.category.id]: true }))
                    }}
                    onToggle={() =>
                      setToggled((current) => ({ ...current, [branch.category.id]: !expanded }))
                    }
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
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
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
            className="at-label flex min-h-11 items-center gap-2 self-start text-muted transition-colors duration-300 hover:text-brass"
          >
            <X aria-hidden="true" className="size-3.5" />
            {t('catalog.clearFilters')}
          </button>
        )}
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
