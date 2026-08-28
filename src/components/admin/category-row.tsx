import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import type { CategoryNode } from '@/lib/category-tree'
import { cn } from '@/lib/utils'

/**
 * One row of the catalogue structure.
 *
 * The indent is the hierarchy — no expand arrows, because the office needs to
 * see the whole shape to reorganise it, and a tree that hides half of itself
 * makes "where should this go" a memory exercise.
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

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      // The indent has to survive a narrow window, so it is inline rather than
      // a utility class that would need one variant per depth.
      style={{ paddingLeft: `${1 + node.depth * 1.75}rem` }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={cn('text-sm', hidden ? 'text-muted' : 'text-ink')}>
            {category.title_en}
          </span>
          <span className="text-xs text-muted">{category.title_ka}</span>

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

      <div className="flex shrink-0 items-center gap-0.5">
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
        'inline-flex size-9 items-center justify-center rounded-xs transition-colors duration-300',
        'disabled:pointer-events-none disabled:opacity-30',
        destructive ? 'text-muted hover:text-[#a33]' : 'text-muted hover:text-brass',
      )}
    >
      {children}
    </button>
  )
}
