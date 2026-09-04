import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import type { CategoryNode } from '@/lib/category-tree'
import { cn } from '@/lib/utils'

/**
 * One row of the catalogue structure.
 *
 * The indent is the hierarchy, and a branch can now be folded shut.
 *
 * This screen used to refuse to fold, on the grounds that reorganising a tree
 * you can only half see is a memory exercise. That holds for a tree of a dozen
 * rows and stops holding somewhere around thirty, which is where this one now
 * is: everything below the fold costs a scroll, and dragging a row to a parent
 * that is off-screen is worse than any amount of hiding. So: folding is
 * OPTIONAL and never the default. A first visit shows the whole tree exactly
 * as before, and what gets folded is remembered per person, not per catalogue.
 *
 * TWO BADGES THAT LOOK SIMILAR AND MEAN DIFFERENT THINGS
 *   "Hidden" is the office's own decision, taken with the eye button. "Empty"
 *   is the catalogue's: nothing is filed in this branch, so the public
 *   navigation skips it whatever the eye says. Both keep a row off the site,
 *   and only one of them is something anybody chose — so they are labelled
 *   separately rather than collapsed into one greyed-out state that leaves the
 *   office wondering which of the two they are looking at.
 */
export function CategoryRow({
  node,
  busy,
  collapsed,
  onToggleCollapse,
  canMoveUp,
  canMoveDown,
  onEdit,
  onAddChild,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onDelete,
}: {
  node: CategoryNode
  busy: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onEdit: () => void
  onAddChild: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const { category } = node

  const hidden = category.is_active === false
  const empty = node.totalCount === 0
  const childCount = node.children.length

  return (
    <div
      /*
       * THE CONTROLS DROP BELOW THE NAME ON A PHONE.
       *
       * Six 36px buttons are 226px of a 343px row. With the depth indent taking
       * its share, the name was left 35px — and 35px cannot hold "Office
       * Desks", so the text ran on UNDER the buttons: measured, 25 of the 29
       * rows overlapped their own controls by up to 34px, and rows stood
       * 128–196px tall because every word wrapped onto its own line.
       *
       * Stacked, the name gets the row's full width and the strip gets a line
       * of its own. Side by side again from `sm`, where 226px of controls is a
       * quarter of the row rather than two thirds of it.
       */
      /* The indent used to be here, as inline padding from `node.depth`. It
         moved to the sortable wrapper: during a drag the row is drawn at the
         depth it WOULD land at, not the one it currently has, and that number
         is only known one level up. */
      className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:gap-3"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {/* The twisty sits in the flow rather than in the indent, so a leaf
            and a parent at the same depth still line their names up. A leaf
            gets an empty box of the same width instead of nothing at all. */}
        {childCount > 0 ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? t('admin.catExpandOne', { name: category.title_en })
                : t('admin.catCollapseOne', { name: category.title_en })
            }
            className="-ml-1 grid size-6 shrink-0 place-items-center text-muted transition-colors duration-300 hover:text-ink"
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                'size-4 stroke-[1.5] transition-transform duration-200',
                !collapsed && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span aria-hidden="true" className="-ml-1 size-6 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={cn('text-sm', hidden ? 'text-muted' : 'text-ink')}>
            {category.title_en}
          </span>

          <span className="text-xs text-muted">{category.title_ka}</span>

          {/* How much is folded away. Without it a collapsed branch and a
              genuinely childless row look identical. */}
          {collapsed && childCount > 0 && (
            <Badge>{t('admin.catHiddenChildren', { count: childCount })}</Badge>
          )}

          {category.featured && (
            <Badge className="border-brass/40 text-brass">{t('admin.catFeatured')}</Badge>
          )}
          {hidden && <Badge>{t('admin.catHidden')}</Badge>}
          {empty && !hidden && <Badge title={t('admin.catEmptyHint')}>{t('admin.catEmpty')}</Badge>}
        </div>

        <p className="mt-1 text-xs text-muted">
          /{category.slug} · {t('admin.catProductCount', { count: node.totalCount })}
        </p>
        </div>
      </div>

      {/* `-ml-2.5` on a phone puts the first icon's glyph over the text's left
          edge rather than one button-padding in from it. */}
      <div className="-ml-2.5 flex shrink-0 items-center gap-0.5 sm:ml-0">
        {busy ? (
          <Loader2 aria-hidden="true" className="mr-1 size-4 animate-spin text-muted" />
        ) : null}

        <IconButton label={t('admin.catMoveUp')} onClick={onMoveUp} disabled={!canMoveUp || busy}>
          <ChevronUp className="size-4 stroke-[1.5]" aria-hidden="true" />
        </IconButton>
        <IconButton
          label={t('admin.catMoveDown')}
          onClick={onMoveDown}
          disabled={!canMoveDown || busy}
        >
          <ChevronDown className="size-4 stroke-[1.5]" aria-hidden="true" />
        </IconButton>
        <IconButton
          label={hidden ? t('admin.catEnable') : t('admin.catDisable')}
          onClick={onToggleActive}
          disabled={busy}
        >
          {hidden ? (
            <EyeOff className="size-4 stroke-[1.5]" aria-hidden="true" />
          ) : (
            <Eye className="size-4 stroke-[1.5]" aria-hidden="true" />
          )}
        </IconButton>
        <IconButton label={t('admin.catAddChild')} onClick={onAddChild} disabled={busy}>
          <Plus className="size-4 stroke-[1.5]" aria-hidden="true" />
        </IconButton>
        <IconButton label={t('admin.catEdit')} onClick={onEdit} disabled={busy}>
          <Pencil className="size-4 stroke-[1.5]" aria-hidden="true" />
        </IconButton>
        <IconButton label={t('admin.catDelete')} onClick={onDelete} disabled={busy} destructive>
          <Trash2 className="size-4 stroke-[1.5]" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  )
}

function Badge({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'border border-hairline px-1.5 py-0.5 text-[10px] tracking-[0.12em] text-muted uppercase',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** An icon-only control. The label is the accessible name AND the tooltip. */
function IconButton({
  label,
  onClick,
  disabled,
  destructive = false,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        // 44px on a phone — the guideline minimum, and this screen is used on
        // one. Back to 36px from `sm`, where a pointer makes the extra size
        // wasted space in a row that is mostly controls.
        'inline-flex size-11 items-center justify-center rounded-xs transition-colors duration-300 sm:size-9',
        'disabled:pointer-events-none disabled:opacity-30',
        destructive ? 'text-muted hover:text-[#a33]' : 'text-muted hover:text-brass',
      )}
    >
      {children}
    </button>
  )
}
