import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * One draggable row, and the handle that drags it.
 *
 * THE HANDLE IS A HANDLE, NOT THE WHOLE ROW
 *   A row carrying six buttons cannot also be a drag surface — every click on
 *   "hide" or "delete" would begin a drag first and the button would need a
 *   press held perfectly still to register. So the grip is the only thing that
 *   starts a drag, and everything else on the row keeps behaving like what it
 *   looks like.
 *
 * THE INDENT IS THE PROJECTION, NOT THE ROW'S OWN DEPTH
 *   While a drag is in progress the row is drawn at the depth it WOULD take if
 *   dropped, which is what makes "drag right to nest" legible. The parent
 *   passes that depth in; this component does not compute it.
 */
export function CategorySortableRow({
  id,
  depth,
  name,
  disabled,
  children,
}: {
  id: string
  /** Where the row sits now, or where the drag says it would go. */
  depth: number
  /** For the handle's label, so a screen reader hears which row it grabbed. */
  name: string
  /** True while a write is in flight — dragging a saving row is a race. */
  disabled?: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })

  return (
    <li
      ref={setNodeRef}
      style={{
        // Only the vertical component. Sideways movement is a depth change,
        // drawn as an indent by the row below rather than as a shifted row —
        // letting it slide horizontally too would say the row is going
        // somewhere it is not.
        transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
        transition,
      }}
      className={cn(
        'relative border-b border-hairline last:border-b-0',
        // Left where it was, greyed, while its copy follows the pointer. The
        // gap says where it came from, which is the reference point for
        // judging where it is going.
        isDragging && 'z-10 bg-surface opacity-40',
      )}
    >
      <div className="flex items-start">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={t('admin.catDragHandle', { name })}
          className={cn(
            'mt-3 ml-2 grid size-7 shrink-0 cursor-grab place-items-center rounded-xs text-muted',
            'transition-colors duration-300 hover:text-ink active:cursor-grabbing',
            'focus-visible:ring-1 focus-visible:ring-brass focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <GripVertical aria-hidden="true" className="size-4 stroke-[1.5]" />
        </button>

        {/* The indent lives here rather than on the row itself, so the handle
            stays in one column at every depth and the tree is still a
            straight edge to aim at. */}
        <div className="min-w-0 flex-1" style={{ paddingLeft: `calc(${depth} * var(--at-tree-step))` }}>
          {children}
        </div>
      </div>
    </li>
  )
}
