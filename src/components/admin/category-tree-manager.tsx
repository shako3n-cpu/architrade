import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Category, Product } from '@/data/types'
import {
  createCategory,
  deleteCategory,
  explainWriteFailure,
  reorderCategories,
  updateCategory,
} from '@/lib/admin-queries'
import { buildCategoryTree, flattenTree, type CategoryNode } from '@/lib/category-tree'
import { CategoryForm, type CategorySubmit } from './category-form'
import { CategoryRow } from './category-row'

/**
 * The catalogue structure screen.
 *
 * REORDERING IS BUTTONS, NOT DRAG AND DROP
 *   Drag is the obvious choice and the wrong one here. The list is nested and
 *   can be dozens of rows tall, so a drag is a scroll-while-holding on a
 *   trackpad and impossible on a phone; it needs a keyboard equivalent built
 *   anyway to be usable at all; and it makes "move within my siblings" and
 *   "move to a different parent" the same gesture, which is how a branch ends
 *   up somewhere nobody meant. Up/down buttons reorder within the parent, and
 *   the form's parent picker re-nests. Two operations, each of which says what
 *   it does.
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
}: {
  categories: Category[]
  products: Product[]
  onChanged: () => void
}) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingUnder, setAddingUnder] = useState<string | null | undefined>(undefined)
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

  const tree = buildCategoryTree(categories, products)
  const rows = flattenTree(tree)

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
    await run(node.category.id, () => reorderCategories(ids))
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

        {addingUnder === undefined && (
          <Button size="sm" onClick={() => { setError(null); setAddingUnder(null) }}>
            <Plus aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
            {t('admin.catAdd')}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {addingUnder !== undefined && (
        <div className="mt-6">
          <CategoryForm
            heading={addingUnder ? t('admin.catAddChild') : t('admin.catAdd')}
            tree={tree}
            category={addingUnder ? ({ parent_id: addingUnder } as Category) : undefined}
            onCancel={() => setAddingUnder(undefined)}
            onSubmit={async (draft: CategorySubmit) => {
              const ok = await run(null, () =>
                createCategory({ ...draft, slug: draft.slug ?? '' }),
              )
              if (ok) setAddingUnder(undefined)
            }}
          />
        </div>
      )}

      <ul className="mt-6 border border-hairline">
        {rows.map((node) => {
          const siblings = siblingsOf(node)
          const index = siblings.findIndex((entry) => entry.category.id === node.category.id)

          return (
            <li key={node.category.id} className="border-b border-hairline last:border-b-0">
              {editingId === node.category.id ? (
                <div className="p-4">
                  <CategoryForm
                    heading={t('admin.catEdit')}
                    category={node.category}
                    tree={tree}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (draft) => {
                      const ok = await run(node.category.id, () =>
                        updateCategory(node.category.id, draft),
                      )
                      if (ok) setEditingId(null)
                    }}
                  />
                </div>
              ) : (
                <CategoryRow
                  node={node}
                  busy={busyId === node.category.id}
                  canMoveUp={index > 0}
                  canMoveDown={index >= 0 && index < siblings.length - 1}
                  onEdit={() => { setError(null); setEditingId(node.category.id) }}
                  onAddChild={() => { setError(null); setAddingUnder(node.category.id) }}
                  onMoveUp={() => move(node, -1)}
                  onMoveDown={() => move(node, 1)}
                  onToggleActive={() =>
                    run(node.category.id, () =>
                      updateCategory(node.category.id, {
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
            </li>
          )
        })}
      </ul>

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
          void run(target.category.id, () => deleteCategory(target.category.id)).then(() =>
            setPending(null),
          )
        }}
      />
    </>
  )
}
