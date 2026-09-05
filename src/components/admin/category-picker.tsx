import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category } from '@/data/types'
import { ancestorPath, buildCategoryTree, type CategoryNode } from '@/lib/category-tree'
import { SelectField } from './field'

/**
 * Where a piece is filed, asked one level at a time.
 *
 * IT USED TO BE ONE FLAT LIST AND THAT LIST LIED
 *   Every category was an option, indented with spaces, "Exterior facade" and
 *   "Doors" side by side as equals. Two things went wrong with that. Indentation
 *   made of non-breaking spaces is the only thing separating a section from a
 *   shelf, and a <select> on a phone renders its options in a native sheet that
 *   is free to trim them — so on the device the showroom actually uses, the
 *   hierarchy was invisible. And the list grows with the catalogue: thirty
 *   entries in one dropdown, of which maybe eight are legal answers.
 *
 *   Asked in steps, each dropdown is short, and the SHAPE of the answer is the
 *   thing being shown rather than something the reader has to infer from
 *   leading whitespace.
 *
 * A SECTION IS NOT AN ANSWER
 *   "Exterior facade" holds doors and windows; the doors hold the products.
 *   Filing a piece on the section puts it on a page whose whole job is to list
 *   its subcategories, so it appears in neither. Picking a category that has
 *   children therefore opens the next dropdown instead of finishing: the value
 *   reported out is null until a category with nothing under it is reached.
 *
 * EXCEPT FOR WHAT IS ALREADY THERE
 *   Pieces filed on a section before this rule existed are real. Opening one
 *   shows its chain exactly as stored and reports the value unchanged; nothing
 *   is re-filed by the act of looking at it. The moment that row is touched —
 *   any level re-picked — the rule applies and a leaf must be reached.
 *
 * FILTERING ASKS THE SAME QUESTION AND WANTS A DIFFERENT ANSWER
 *   `allowSections` makes a section a legal choice, because "show me
 *   everything in Office" is a perfectly good thing to ask a table even though
 *   it is not a place to file a chair. `bare` drops the labels and the
 *   vertical rhythm, so the same control can sit on one line beside a search
 *   box, and turns the empty option into a real choice — "All categories"
 *   rather than a disabled prompt — since clearing a filter is something you
 *   do on purpose.
 */
export function CategoryPicker({
  categories,
  value,
  onChange,
  language,
  required = false,
  allowSections = false,
  bare = false,
}: {
  categories: Category[]
  /** The chosen category id, or '' for nothing yet. */
  value: string
  onChange: (categoryId: string) => void
  language: string
  required?: boolean
  /** Report a section as soon as it is picked, instead of demanding a leaf. */
  allowSections?: boolean
  /** Inline, unlabelled, and with a selectable empty option. For filtering. */
  bare?: boolean
}) {
  const { t } = useTranslation()
  const tree = buildCategoryTree(categories)

  /*
   * The chain of ids from the top level down to whatever is chosen.
   *
   * Held here rather than derived from `value` on every render, because a
   * half-made choice has no value to derive from: picking "Exterior facade"
   * reports '' outwards — it is not a legal answer — while the picker still
   * has to remember it in order to show the doors and windows underneath.
   *
   * Seeded from `value` once. The modal remounts this component each time it
   * opens (see the `key` on it), so there is no stale chain to clear.
   */
  const [path, setPath] = useState<string[]>(() => {
    const start = categories.find((category) => category.id === value)
    if (!start) return []
    return ancestorPath(categories, start.slug).map((category) => category.id)
  })

  const name = (category: Category) =>
    language === 'ka' ? category.title_ka : category.title_en

  /** The nodes named by `path`, stopping at the first one that is missing. */
  const chain: CategoryNode[] = []
  let level = tree
  for (const id of path) {
    const node = level.find((entry) => entry.category.id === id)
    if (!node) break
    chain.push(node)
    level = node.children
  }

  /*
   * One dropdown per level: the top level, then the children of everything
   * chosen so far. The last entry is the one still to be answered — it exists
   * only when the deepest chosen category HAS children, which is exactly the
   * condition that makes the current answer incomplete.
   */
  const levels = [tree, ...chain.map((node) => node.children).filter((kids) => kids.length > 0)]

  const choose = (index: number, id: string) => {
    // Everything below the level being changed is discarded. Keeping it would
    // leave "Exterior facade > Sofas" on screen for the instant before the
    // deeper dropdown re-rendered.
    const next = id ? [...path.slice(0, index), id] : path.slice(0, index)
    setPath(next)

    const deepest = next.length > 0 ? findByIds(tree, next) : null
    // Filing wants a leaf: a section reports nothing, and the form's own
    // `required` holds the save until the next dropdown is answered. Filtering
    // takes the section itself and shows the whole branch beneath it.
    const answered = deepest !== null && (allowSections || deepest.children.length === 0)
    onChange(answered ? deepest.category.id : '')
  }

  const deepest = chain.length > 0 ? chain[chain.length - 1] : null
  const incomplete = !allowSections && deepest !== null && deepest.children.length > 0

  const label = (index: number) =>
    index === 0
      ? t('admin.category')
      : t('admin.subcategoryOf', { name: name(chain[index - 1].category) })

  /* The empty option, which only filtering offers: at the top it clears the
     filter, and deeper down it widens it back to the whole section rather than
     clearing it — two different things that a single "Any" would blur. */
  const anyLabel = (index: number) =>
    index === 0
      ? t('admin.allCategories')
      : t('admin.allInside', { name: name(chain[index - 1].category) })

  if (bare) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {levels.map((options, index) => (
          <select
            key={index}
            value={path[index] ?? ''}
            onChange={(event) => choose(index, event.target.value)}
            aria-label={label(index)}
            className="min-h-11 border border-hairline bg-background px-3.5 py-2.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none sm:text-sm"
          >
            <option value="">{anyLabel(index)}</option>
            {options.map((node) => (
              <option key={node.category.id} value={node.category.id}>
                {name(node.category)}
              </option>
            ))}
          </select>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {levels.map((options, index) => (
        <SelectField
          key={index}
          label={label(index)}
          value={path[index] ?? ''}
          onChange={(next) => choose(index, next)}
          placeholder={index === 0 ? t('admin.chooseCategory') : t('admin.chooseSubcategory')}
          /* Only the last one carries the requirement. Marking every level
             required would put an asterisk on questions that are already
             answered. */
          required={required && index === levels.length - 1}
          options={options.map((node) => ({
            value: node.category.id,
            label: node.children.length > 0
              ? t('admin.categoryWithChildren', {
                  name: name(node.category),
                  count: node.children.length,
                })
              : name(node.category),
          }))}
        />
      ))}

      {incomplete && (
        <p className="text-xs leading-relaxed text-muted">
          {t('admin.pickSubcategory', { name: name(deepest.category) })}
        </p>
      )}
    </div>
  )
}

/** Walks a chain of ids down the tree. Null if the chain breaks. */
function findByIds(tree: CategoryNode[], ids: string[]): CategoryNode | null {
  let level = tree
  let found: CategoryNode | null = null

  for (const id of ids) {
    const node = level.find((entry) => entry.category.id === id)
    if (!node) return null
    found = node
    level = node.children
  }

  return found
}
