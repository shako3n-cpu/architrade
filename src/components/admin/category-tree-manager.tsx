import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsDownUp, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Product } from '@/data/types'
import {
  createCategory,
  deleteCategory,
  explainWriteFailure,
  reorderCategories,
  updateCategory,
} from '@/lib/admin-queries'
import { slugify } from '@/lib/admin-validate'
import type { Category } from '@/data/types'
import { buildCategoryTree, flattenTree, visibleRows, type CategoryNode } from '@/lib/category-tree'
import { project, siblingOrder, toFlatRows } from '@/lib/category-drag'
import { CategoryForm, type CategorySubmit } from './category-form'
import type { ImageRemover, ImageUploader } from './image-field'
import { CategoryRow } from './category-row'
import { CategorySortableRow } from './category-sortable-row'

/** Where the folded-shut branches are remembered between visits. */
const COLLAPSED_KEY = 'archtrade-admin-categories-collapsed'

/**
 * The four writes this screen makes.
 *
 * Named as a group and injectable so the screen can be driven without a
 * database behind it — the demo route at /demo/categories passes an in-memory
 * version, which is how the drag and the folding get exercised locally. The
 * default is the real thing, so every ordinary caller is unaffected.
 */
export interface CategoryActions {
  create: typeof createCategory
  update: typeof updateCategory
  remove: typeof deleteCategory
  reorder: typeof reorderCategories
  /** Banner picture in and out of storage. Optional: the form falls back to
      the real bucket when they are not given. */
  uploadImage?: ImageUploader
  removeImage?: ImageRemover
}

const liveActions: CategoryActions = {
  create: createCategory,
  update: updateCategory,
  remove: deleteCategory,
  reorder: reorderCategories,
}

/** The ids under one parent, in the order they currently stand. */
function siblingIds(rows: CategoryNode[], parentId: string | null): string[] {
  return rows
    .filter((node) => (node.category.parent_id ?? null) === parentId)
    .map((node) => node.category.id)
}

/** Two orderings that would produce the same tree. */
function sameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

/**
 * One indent step, in pixels — how far sideways a drag must travel to mean
 * "one level deeper". Matches `--at-tree-step` at the desktop size; the drag
 * arithmetic needs a number and CSS variables are a string until they are
 * measured. Being a little out costs nothing: the offset is rounded to the
 * nearest step and then clamped to what the tree actually allows.
 */
const INDENT_PX = 28

/**
 * The catalogue structure screen.
 *
 * REORDERING IS DRAG AND DROP, AND ALSO BUTTONS
 *   This screen used to argue against drag, on three grounds: it is awkward on
 *   a trackpad, impossible on a phone, and it collapses "move among my
 *   siblings" and "move to a different parent" into one gesture, which is how
 *   a branch ends up somewhere nobody meant.
 *
 *   The first two were answered by keeping the up/down buttons, which is why
 *   they are still here: drag is the fast path, not the only path, and nothing
 *   that worked without a mouse stopped working. dnd-kit's keyboard sensor
 *   covers the third route.
 *
 *   The last objection is real and is answered by making the two operations
 *   visibly distinct rather than by refusing one of them. Vertical movement
 *   sets the position; HORIZONTAL movement sets the depth, one indent step at
 *   a time; and the row redraws at the depth it would land at while the drag
 *   is still in progress. See category-drag.ts, which holds the arithmetic.
 *
 * WRITES GO STRAIGHT TO THE DATABASE AND THE TREE REFETCHES
 *   No local optimistic copy. The database holds rules this screen does not —
 *   the cycle trigger, the delete guard — so the only trustworthy picture of
 *   the tree after a write is the one the database gives back. Refetching
 *   costs a request the office will not notice and removes the entire class of
 *   bug where the screen and the site disagree.
 */
export function CategoryTreeManager({
  categories,
  products,
  onChanged,
  actions = liveActions,
}: {
  categories: Category[]
  products: Product[]
  onChanged: () => void
  /** Defaults to the real database writes. See CategoryActions. */
  actions?: CategoryActions
}) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingUnder, setAddingUnder] = useState<string | null | undefined>(undefined)
  /*
   * The parent's name, carried alongside its id rather than looked up from the
   * tree. After a save the tree is refetched, and for the render between the
   * save and the new data arriving the just-created parent is not in `rows`
   * yet — a lookup would say "top level" for a moment, which is the one thing
   * the line is there to get right.
   */
  const [addingUnderName, setAddingUnderName] = useState<string | null>(null)
  /* Bumped on every save, to remount the form empty. See the create handler. */
  const [formSeq, setFormSeq] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  /*
   * The row queued for deletion, or null. This screen used window.confirm,
   * which was the one destructive action on the whole dashboard still asking
   * through the browser's own box — the dialog it should have used documents
   * itself as the replacement for exactly that. Native confirm cannot be
   * styled, cannot say WHICH category is going, renders in the browser's
   * language rather than the one the office chose, and blocks the thread.
   */
  const [pending, setPending] = useState<CategoryNode | null>(null)

  /*
   * Which branches are folded shut. Ids rather than a flag on the node,
   * because the tree is rebuilt from scratch on every refetch and anything
   * stored on it would be thrown away with it.
   *
   * Kept in localStorage so the shape survives a save. Every write refetches,
   * and re-opening thirty branches after each one is the sort of small tax
   * that makes a screen tiring to use. Bad JSON is ignored rather than
   * thrown — a corrupt view preference should cost an open tree, not the page.
   */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY)
      return new Set(stored ? (JSON.parse(stored) as string[]) : [])
    } catch {
      return new Set()
    }
  })

  const setCollapsedAndRemember = (next: Set<string>) => {
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]))
    } catch {
      // A full or disabled storage costs the memory of the fold, nothing more.
    }
  }

  const tree = buildCategoryTree(categories, products)
  /* Every row, collapsed or not. This is what "which siblings does this row
     have" has to be asked of — a hidden sibling is still a sibling, and
     reordering against the visible list alone would silently skip it. */
  const rows = flattenTree(tree)
  /* What actually gets drawn. */
  const visible = visibleRows(tree, collapsed)

  const parents = rows.filter((node) => node.children.length > 0)
  const allCollapsed = parents.length > 0 && parents.every((node) => collapsed.has(node.category.id))

  const toggleCollapse = (id: string) => {
    const next = new Set(collapsed)
    if (!next.delete(id)) next.add(id)
    setCollapsedAndRemember(next)
  }

  const toggleAll = () => {
    setCollapsedAndRemember(
      allCollapsed ? new Set() : new Set(parents.map((node) => node.category.id)),
    )
  }

  /* ---- Dragging ------------------------------------------------------- */

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [offsetX, setOffsetX] = useState(0)

  /*
   * A pointer drag only begins after 6px of movement, so a plain click on the
   * handle is still a click and a tap does not become a drag on the way to a
   * button. The keyboard sensor is what keeps the tree operable without a
   * mouse — the up/down buttons remain too, for phones and for anyone who
   * would rather not drag at all.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeNode = activeId
    ? (rows.find((node) => node.category.id === activeId) ?? null)
    : null

  /*
   * A branch travels with its parent and is not a drop target while it moves.
   * Without this a category could be dropped inside itself: the database
   * refuses that (categories_no_cycle_trg) but only after the fact, and a
   * refusal is a worse answer than never offering the move.
   */
  const dragging = activeNode
    ? new Set(flattenTree(activeNode.children).map((node) => node.category.id))
    : new Set<string>()

  const dragRows = dragging.size > 0
    ? visible.filter((node) => !dragging.has(node.category.id))
    : visible

  const flat = toFlatRows(dragRows)

  const projection =
    activeId && overId ? project(flat, activeId, overId, offsetX, INDENT_PX) : null

  const onDragStart = ({ active }: DragStartEvent) => {
    setError(null)
    setActiveId(String(active.id))
    setOverId(String(active.id))
    setOffsetX(0)
  }

  const onDragMove = ({ delta }: DragMoveEvent) => setOffsetX(delta.x)

  const onDragOver = ({ over }: DragOverEvent) => setOverId(over ? String(over.id) : null)

  const resetDrag = () => {
    setActiveId(null)
    setOverId(null)
    setOffsetX(0)
  }

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    const id = String(active.id)
    const target = over ? String(over.id) : null
    const landing = target ? project(flat, id, target, offsetX, INDENT_PX) : null
    const node = rows.find((entry) => entry.category.id === id)
    resetDrag()

    if (!landing || !node) return

    const wasParent = node.category.parent_id ?? null
    const order = siblingOrder(flat, id, target as string, landing.parentId)
    const unmoved = landing.parentId === wasParent && sameOrder(order, siblingIds(rows, wasParent))
    if (unmoved) return

    await run(id, async () => {
      // Re-parenting first. Renumbering a group the row has not joined yet
      // would leave a gap in one parent and a collision in the other if the
      // second call failed.
      if (landing.parentId !== wasParent) {
        await actions.update(id, { parent_id: landing.parentId })
      }
      await actions.reorder(order)
    })
  }

  const report = (cause: unknown) => {
    const kind = explainWriteFailure(cause)
    const message =
      kind === 'categoryHasChildren'
        ? t('admin.catDeleteBlockedChildren')
        : kind === 'categoryHasProducts'
          ? t('admin.catDeleteBlockedProducts')
          : kind === 'setupMissing'
            ? t('admin.errorSetupMissing')
            : kind === 'notPermitted'
              ? t('admin.errorNotPermitted')
              : kind === 'duplicateSlug'
                ? t('admin.errorDuplicateCategory')
                : t('admin.errorUnknown', {
                    message: cause instanceof Error ? cause.message : String(cause),
                  })
    setError(message)
  }

  /** Runs a write, then refetches. Any failure becomes a sentence on screen. */
  const run = async (id: string | null, work: () => Promise<unknown>) => {
    setError(null)
    setBusyId(id)
    try {
      await work()
      onChanged()
      return true
    } catch (cause) {
      report(cause)
      return false
    } finally {
      setBusyId(null)
    }
  }

  /** Siblings of `node`, in the order they currently render. */
  const siblingsOf = (node: CategoryNode): CategoryNode[] => {
    const parentId = node.category.parent_id ?? null
    return rows.filter((entry) => (entry.category.parent_id ?? null) === parentId)
  }

  const move = async (node: CategoryNode, direction: -1 | 1) => {
    const siblings = siblingsOf(node)
    const from = siblings.findIndex((entry) => entry.category.id === node.category.id)
    const to = from + direction
    if (from < 0 || to < 0 || to >= siblings.length) return

    const ids = siblings.map((entry) => entry.category.id)
    ;[ids[from], ids[to]] = [ids[to], ids[from]]
    await run(node.category.id, () => actions.reorder(ids))
  }

  return (
    <>
      {/* Stacked below `sm`. "კატეგორიის დამატება" sets 256px wide and cannot
          shrink, so beside the count in a justify-between row it pushed 40px
          past the right edge of a 320px screen — the one horizontal overflow
          on this page. Given its own line it fits with room to spare. */}
      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs text-muted">
          {t('admin.categoryCount', { count: categories.length })}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Only worth drawing when something can actually fold. A tree with
              no parents in it would show a control that does nothing. */}
          {parents.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleAll}>
              {allCollapsed ? (
                <ChevronsUpDown aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
              ) : (
                <ChevronsDownUp aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
              )}
              {allCollapsed ? t('admin.catExpandAll') : t('admin.catCollapseAll')}
            </Button>
          )}

          {addingUnder === undefined && (
            <Button
              size="sm"
              onClick={() => {
                setError(null)
                setAddingUnderName(null)
                setAddingUnder(null)
              }}
            >
              <Plus aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
              {t('admin.catAdd')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {addingUnder !== undefined && (
        <div className="mt-6">
          {/* Which branch is being filled, in a sentence, above the form. A
              chain of "add subcategory" forms that all look identical is a
              chain nobody can navigate — this is the only thing on screen
              that says whether the next save lands at the top level or three
              levels down. */}
          <p className="mb-3 text-xs leading-relaxed text-muted">
            {addingUnder
              ? t('admin.catAddingUnder', { name: addingUnderName ?? '' })
              : t('admin.catAddingTop')}
          </p>

          <CategoryForm
            /* Remounted on every save, so the chained form comes up empty
               rather than holding the last category's titles. */
            key={`${addingUnder ?? 'root'}-${formSeq}`}
            heading={addingUnder ? t('admin.catAddChild') : t('admin.catAdd')}
            /* Creating, always — `category` stays undefined even when adding a
               child, so the form knows it is new. The parent travels in its
               own prop. */
            initialParentId={addingUnder}
            uploadImage={actions.uploadImage}
            removeImage={actions.removeImage}
            onCancel={() => setAddingUnder(undefined)}
            onSubmit={async (draft: CategorySubmit) => {
              /* Derived here rather than in the form, which no longer asks for
                 one. Falling back to '' would be worse than any typo: an empty
                 slug is unique exactly once — `categories_slug_key` refuses the
                 second — and gives the category `/catalog/` for an address.

                 slugify returns null when the titles yield nothing usable. The
                 form refuses to submit in that case, so this is the second of
                 two locks rather than the first: it exists so a caller that
                 forgets the check cannot stamp a timestamp into an address. */
              const slug = draft.slug?.trim() || slugify(draft.title_en || draft.title_ka)
              if (!slug) return

              const box: { row?: Category } = {}
              const ok = await run(null, async () => {
                box.row = await actions.create({ ...draft, slug })
              })
              if (!ok) return

              /*
               * STRAIGHT ON TO THE NEXT ONE, INSIDE WHAT WAS JUST MADE.
               *
               * A top level category is a heading, not a shelf: "Exterior
               * facade" holds doors and windows, and the doors hold the
               * products. Saving one and closing the form left the office on a
               * list of a dozen rows hunting for the row they made a second
               * ago in order to press its "+" — so the form stays open and
               * re-aims itself at the new category instead.
               *
               * Adding a CHILD keeps the same parent, because subcategories
               * arrive in groups: doors, then windows, then shutters. Either
               * way "Cancel" is one press and closes the whole thing.
               */
              setFormSeq((n) => n + 1)
              if (!addingUnder && box.row) setAddingUnderName(box.row.title_en)
              setAddingUnder(addingUnder ?? box.row?.id ?? undefined)
            }}
          />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragOver={onDragOver}
        onDragEnd={(event) => void onDragEnd(event)}
        onDragCancel={resetDrag}
      >
        <SortableContext
          items={dragRows.map((node) => node.category.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-6 border border-hairline">
            {dragRows.map((node) => {
          const siblings = siblingsOf(node)
          const index = siblings.findIndex((entry) => entry.category.id === node.category.id)
          // Drawn where the drop would put it, not where it stands, so the
          // nesting the drag is asking for is visible before the release.
          const depth =
            projection && node.category.id === activeId ? projection.depth : node.depth

          return (
            <CategorySortableRow
              key={node.category.id}
              id={node.category.id}
              depth={depth}
              name={node.category.title_en}
              disabled={busyId !== null || editingId === node.category.id}
            >
              {editingId === node.category.id ? (
                <div className="p-4">
                  <CategoryForm
                    heading={t('admin.catEdit')}
                    category={node.category}
                    uploadImage={actions.uploadImage}
                    removeImage={actions.removeImage}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (draft) => {
                      const ok = await run(node.category.id, () =>
                        actions.update(node.category.id, draft),
                      )
                      if (ok) setEditingId(null)
                    }}
                  />
                </div>
              ) : (
                <CategoryRow
                  node={node}
                  busy={busyId === node.category.id}
                  collapsed={collapsed.has(node.category.id)}
                  onToggleCollapse={() => toggleCollapse(node.category.id)}
                  canMoveUp={index > 0}
                  canMoveDown={index >= 0 && index < siblings.length - 1}
                  onEdit={() => { setError(null); setEditingId(node.category.id) }}
                  onAddChild={() => {
                    setError(null)
                    setAddingUnderName(node.category.title_en)
                    setAddingUnder(node.category.id)
                  }}
                  onMoveUp={() => move(node, -1)}
                  onMoveDown={() => move(node, 1)}
                  onToggleActive={() =>
                    run(node.category.id, () =>
                      actions.update(node.category.id, {
                        is_active: node.category.is_active === false,
                      }),
                    )
                  }
                  onDelete={() => {
                    setError(null)
                    setPending(node)
                  }}
                />
              )}
            </CategorySortableRow>
          )
            })}
          </ul>
        </SortableContext>
      </DndContext>

      {/* Named, so "delete" is never a question about an unspecified row. The
          database is still the judge: a category holding products or children
          is refused there and the refusal arrives as the banner above, which
          is why this closes either way rather than staying open pretending to
          be the thing that decides. */}
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(next) => !next && setPending(null)}
        title={t('admin.catDeleteTitle')}
        description={t('admin.catDeleteBody', { name: pending?.category.title_en ?? '' })}
        confirmLabel={t('admin.catDelete')}
        busy={busyId !== null}
        onConfirm={() => {
          const target = pending
          if (!target) return
          void run(target.category.id, () => actions.remove(target.category.id)).then(() =>
            setPending(null),
          )
        }}
      />
    </>
  )
}
