import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import type { Brand } from '@/data/types'
import {
  createBrand,
  deleteBrand,
  explainWriteFailure,
  reorderBrands,
  updateBrand,
} from '@/lib/admin-queries'
import { BrandForm, type BrandSubmit } from './brand-form'

/**
 * The partner houses screen.
 *
 * SAME SHAPE AS THE CATEGORY TREE, DELIBERATELY
 *   Reordering is up/down buttons rather than drag, writes go straight to the
 *   database and the list refetches rather than being patched locally, and the
 *   delete guard lives in the database instead of in this file. Each of those
 *   has its reasoning written out in category-tree-manager.tsx and applies
 *   here unchanged; what matters is that the two screens behave the same way,
 *   because the same people use them on the same afternoon.
 *
 * HIDING IS THE COMMON OPERATION, NOT DELETING
 *   An agency agreement lapses far more often than a house stops existing, and
 *   a hidden row keeps its photograph, its country and whatever description
 *   was finally written for it. So hide is one click on every row, and delete
 *   sits behind a confirmation and is refused outright by the database while
 *   any product still names the house.
 */
export function BrandManager({ brands, onChanged }: { brands: Brand[]; onChanged: () => void }) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Brand | null>(null)

  const report = (cause: unknown) => {
    const kind = explainWriteFailure(cause)
    setError(
      kind === 'brandHasProducts'
        ? t('admin.brandDeleteBlocked')
        : kind === 'setupMissing'
          ? t('admin.errorSetupMissing')
          : kind === 'notPermitted'
            ? t('admin.errorNotPermitted')
            : kind === 'duplicateSlug'
              ? t('admin.brandErrorDuplicate')
              : t('admin.errorUnknown', {
                  message: cause instanceof Error ? cause.message : String(cause),
                }),
    )
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

  /** Swaps a row with its neighbour, then renumbers the whole list. */
  const move = (index: number, delta: number) => {
    const next = [...brands]
    const target = index + delta
    if (target < 0 || target >= next.length) return

    const moved = next[index]
    const other = next[target]
    if (!moved || !other) return

    next[index] = other
    next[target] = moved
    void run(moved.id, () => reorderBrands(next.map((brand) => brand.id)))
  }

  return (
    <div className="mt-8">
      {error && (
        <p role="alert" className="mb-5 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {adding ? (
        <BrandForm
          heading={t('admin.brandNew')}
          onCancel={() => setAdding(false)}
          onSubmit={async (draft: BrandSubmit) => {
            const ok = await run(null, () => createBrand(draft))
            if (ok) setAdding(false)
          }}
        />
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" className="mr-2 size-4" />
          {t('admin.brandNew')}
        </Button>
      )}

      <ul className="mt-6 border-t border-hairline">
        {brands.map((brand, index) => (
          <li key={brand.id} className="border-b border-hairline">
            {editingId === brand.id ? (
              <div className="py-4">
                <BrandForm
                  heading={t('admin.brandEdit')}
                  brand={brand}
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (draft) => {
                    const ok = await run(brand.id, () => updateBrand(brand.id, draft))
                    if (ok) setEditingId(null)
                  }}
                />
              </div>
            ) : (
              /* THE CONTROLS DROP BELOW THE NAME ON A PHONE.
                  Five 44px targets are 220px of a 335px row, which left the
                  name 103px: the longest one truncated and the discipline line
                  wrapped to five lines, so rows measured 69–115px tall and the
                  list read as ragged. Stacked, the name gets the full width
                  and the strip gets its own line, where 220px is comfortable.
                  Side by side again from `sm`, where there is room for both. */
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-sm',
                      brand.is_active ? 'text-ink' : 'text-muted line-through',
                    )}
                  >
                    {brand.name}
                  </p>

                  {/* The missing-website note is the point of this screen, so
                      it is on the row rather than hidden inside the form. */}
                  <p className="at-label mt-0.5 text-muted">
                    {t(`b2b.brands.${brand.discipline}`)}
                    {brand.country ? ` · ${brand.country}` : ''}
                    {brand.website ? '' : ` · ${t('admin.brandNoWebsite')}`}
                  </p>
                </div>

                {/* `-ml-3` pulls the strip left so the first icon sits over
                    the text's left edge rather than one button-padding in. */}
                <div className="-ml-3 flex shrink-0 items-center sm:ml-0">
                  <RowButton
                    label={t('admin.brandMoveUp')}
                    disabled={index === 0 || busyId !== null}
                    onClick={() => move(index, -1)}
                    icon={<ArrowUp aria-hidden="true" className="size-4 stroke-[1.25]" />}
                  />
                  <RowButton
                    label={t('admin.brandMoveDown')}
                    disabled={index === brands.length - 1 || busyId !== null}
                    onClick={() => move(index, 1)}
                    icon={<ArrowDown aria-hidden="true" className="size-4 stroke-[1.25]" />}
                  />
                  <RowButton
                    label={brand.is_active ? t('admin.brandHide') : t('admin.brandShow')}
                    disabled={busyId !== null}
                    onClick={() =>
                      void run(brand.id, () =>
                        updateBrand(brand.id, { is_active: !brand.is_active }),
                      )
                    }
                    icon={
                      brand.is_active ? (
                        <Eye aria-hidden="true" className="size-4 stroke-[1.25]" />
                      ) : (
                        <EyeOff aria-hidden="true" className="size-4 stroke-[1.25]" />
                      )
                    }
                  />
                  <RowButton
                    label={t('admin.brandEdit')}
                    disabled={busyId !== null}
                    onClick={() => setEditingId(brand.id)}
                    icon={<Pencil aria-hidden="true" className="size-4 stroke-[1.25]" />}
                  />
                  <RowButton
                    label={t('admin.brandDelete')}
                    disabled={busyId !== null}
                    onClick={() => setPending(brand)}
                    icon={<Trash2 aria-hidden="true" className="size-4 stroke-[1.25]" />}
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(next) => !next && setPending(null)}
        title={t('admin.brandDeleteTitle')}
        description={t('admin.brandDeleteBody', { name: pending?.name ?? '' })}
        confirmLabel={t('admin.brandDelete')}
        busy={busyId !== null}
        onConfirm={() => {
          const target = pending
          if (!target) return
          void run(target.id, () => deleteBrand(target.id)).then(() => setPending(null))
        }}
      />
    </div>
  )
}

function RowButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-brass disabled:opacity-40 sm:size-9"
    >
      {icon}
    </button>
  )
}
