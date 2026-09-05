import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArchiveRestore, Archive, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { Category, Product } from '@/data/types'
import { useCatalogue } from '@/hooks/use-catalog'
import { useAuth } from '@/hooks/use-auth'
import { useAsync } from '@/hooks/use-async'
import {
  archiveProduct,
  deleteProduct,
  explainWriteFailure,
  fetchAllBrands,
  restoreProduct,
} from '@/lib/admin-queries'
import { QueryState } from '@/components/ui/query-state'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ProductFormModal } from '@/components/admin/product-form-modal'
import { CategoryPicker } from '@/components/admin/category-picker'
import { ancestorPath, buildCategoryTree, flattenTree } from '@/lib/category-tree'
import { RETENTION_DAYS, daysUntilPurge } from '@/lib/retention'
import { cn } from '@/lib/utils'

/**
 * /admin — every piece in the catalogue, as a table.
 *
 * Search and the category filter are applied in the browser rather than as
 * database queries. With a catalogue this size that is the right trade: every
 * keystroke filters instantly with no request, and there is no debouncing or
 * request-cancelling to get wrong. If the catalogue ever reaches a few
 * thousand pieces this should move server-side with pagination.
 */
export function AdminDashboard() {
  const { t, i18n } = useTranslation()
  // `true` asks for archived pieces too. The dashboard is the one place they
  // are meant to be visible; every public query filters them out.
  const catalogue = useCatalogue(true)
  const { isAdmin } = useAuth()

  /*
   * Every house, hidden ones included — `fetchAllBrands`, not the public
   * reader. A piece supplied by a house whose agreement has lapsed still has
   * to be filed against that house, so the form's picker has to offer it.
   */
  const brands = useAsync(useCallback((signal: AbortSignal) => fetchAllBrands(signal), []), [])

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  // Which of the two lists is on screen. The archive is a separate view rather
  // than a badge in a mixed list, because the two are read for different
  // reasons: one is the catalogue, the other is a waiting room with a clock.
  const [status, setStatus] = useState<ProductStatus>('live')
  const [editing, setEditing] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setModalOpen(true)
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl text-ink">{t('admin.productsTitle')}</h1>
          <p className="mt-2 text-sm text-muted">{t('admin.productsSubtitle')}</p>
        </div>

        <Button size="sm" onClick={openNew}>
          <Plus aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
          {t('admin.addProduct')}
        </Button>
      </div>

      <QueryState result={catalogue}>
        {({ products, categories }) => (
          <ProductTable
            products={products}
            categories={categories}
            query={query}
            onQuery={setQuery}
            categoryId={categoryId}
            onCategoryId={setCategoryId}
            status={status}
            onStatus={setStatus}
            onEdit={openEdit}
            onChanged={catalogue.retry}
            lang={i18n.language}
            isAdmin={isAdmin}
          />
        )}
      </QueryState>

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editing}
        categories={catalogue.data?.categories ?? []}
        brands={brands.data ?? []}
        onSaved={catalogue.retry}
      />
    </>
  )
}

function ProductTable({
  products,
  categories,
  query,
  onQuery,
  categoryId,
  onCategoryId,
  status,
  onStatus,
  onEdit,
  onChanged,
  lang,
  isAdmin,
}: {
  products: Product[]
  categories: Category[]
  query: string
  onQuery: (value: string) => void
  categoryId: string
  onCategoryId: (value: string) => void
  status: ProductStatus
  onStatus: (value: ProductStatus) => void
  onEdit: (product: Product) => void
  onChanged: () => void
  lang: string
  /** Decides which buttons are drawn. The database decides what is allowed. */
  isAdmin: boolean
}) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  /*
   * Archiving and deleting share one confirmation dialog, because they ask the
   * same question with different stakes. Keeping them in one piece of state
   * makes it impossible to have both open at once.
   */
  const [pending, setPending] = useState<{ product: Product; kind: 'archive' | 'delete' } | null>(
    null,
  )

  const name = (category: Category) => (lang === 'ka' ? category.title_ka : category.title_en)
  const productName = (product: Product) => (lang === 'ka' ? product.title_ka : product.title_en)

  const byId = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  // Split first, filter second, so the tab counts describe the whole
  // catalogue rather than whatever the search box currently matches.
  const [liveOnes, archivedOnes] = useMemo(() => {
    const live: Product[] = []
    const archived: Product[] = []
    for (const product of products) (product.is_archived ? archived : live).push(product)
    return [live, archived]
  }, [products])

  const inTab = status === 'archived' ? archivedOnes : liveOnes

  /*
   * FILTERING BY A SECTION MEANS THE WHOLE BRANCH.
   *
   * The filter compared `category_id` for equality, which was right when the
   * catalogue was flat and became silently wrong the moment it was not:
   * choosing "Exterior facade" matched only what is filed directly on it, and
   * nothing is — the doors and the windows hold the products. The filter
   * returned an empty table for a section full of stock.
   */
  const branchIds = useMemo(() => {
    if (!categoryId) return null
    const node = flattenTree(buildCategoryTree(categories)).find(
      (entry) => entry.category.id === categoryId,
    )
    return node ? new Set(flattenTree([node]).map((entry) => entry.category.id)) : null
  }, [categories, categoryId])

  const visible = useMemo(() => {
    // Matching on BOTH titles regardless of the interface language: a manager
    // typing a Georgian name should find the piece even with the dashboard in
    // English, and the other way round.
    const needle = query.trim().toLowerCase()

    return inTab.filter((product) => {
      if (branchIds && !branchIds.has(product.category_id)) return false
      if (!needle) return true
      return (
        product.title_ka.toLowerCase().includes(needle) ||
        product.title_en.toLowerCase().includes(needle)
      )
    })
  }, [inTab, query, branchIds])

  /**
   * One path for all three actions, because all three fail identically: a
   * missing setup file, or the database refusing an operator. The refusal is
   * the one worth getting right — an operator who finds a delete button that
   * this screen should have hidden still gets a sentence, not a raw error.
   */
  const act = async (product: Product, action: () => Promise<void>) => {
    setError(null)
    setBusyId(product.id)

    try {
      await action()
      onChanged()
    } catch (cause) {
      const kind = explainWriteFailure(cause)
      setError(
        kind === 'setupMissing'
          ? t('admin.errorSetupMissing')
          : kind === 'notPermitted'
            ? t('admin.errorNotPermitted')
            : t('admin.errorUnknown', {
                message: cause instanceof Error ? cause.message : String(cause),
              }),
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="mt-8 flex border border-hairline" role="group">
        <StatusTab
          label={t('admin.tabLive')}
          count={liveOnes.length}
          active={status === 'live'}
          onClick={() => onStatus('live')}
        />
        <StatusTab
          label={t('admin.tabArchived')}
          count={archivedOnes.length}
          active={status === 'archived'}
          onClick={() => onStatus('archived')}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 stroke-[1.25] text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={t('admin.searchPlaceholder')}
            aria-label={t('admin.searchLabel')}
            className="min-h-11 w-full border border-hairline bg-background py-2.5 pr-3.5 pl-9 text-base text-ink transition-colors duration-300 placeholder:text-muted/60 focus:border-brass focus:outline-none sm:text-sm"
          />
        </div>

        {/* ONE LIST OF THIRTY WAS THE WRONG SHAPE FOR THE QUESTION.

            Every category used to be an option here, depth-first and indented
            with spaces, so choosing "Office Chairs" meant reading past five
            sections and twenty shelves in a dropdown that ran most of the
            height of the screen. The indentation was also the only thing
            saying which was which, and a native select on a phone is free to
            trim it.

            Asked in steps it is two short lists: the sections, then what is
            inside the one chosen. A section IS an answer here, unlike on the
            form — "everything in Office" is a reasonable thing to ask a table,
            and the branch filter below already understood it. */}
        <CategoryPicker
          categories={categories}
          value={categoryId}
          onChange={onCategoryId}
          language={lang}
          allowSections
          bare
        />

        <p className="text-xs text-muted">
          {t('admin.showing', { shown: visible.length, total: inTab.length })}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 border-t border-b border-hairline py-16 text-center text-sm text-muted">
          {inTab.length > 0
            ? t('admin.noMatches')
            : status === 'archived'
              ? t('admin.noArchived', { days: RETENTION_DAYS })
              : t('admin.noProducts')}
        </p>
      ) : (
        // Scrolls inside itself on a narrow screen rather than pushing the
        // page sideways.
        <div className="mt-6 overflow-x-auto border border-hairline">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline bg-surface">
                <Th className="w-32">{t('admin.colPhoto')}</Th>
                <Th>{t('admin.colTitle')}</Th>
                <Th>{t('admin.colCategory')}</Th>
                <Th className="w-28">{t('admin.colPrice')}</Th>
                <Th className="w-36 text-right">{t('admin.colActions')}</Th>
              </tr>
            </thead>

            <tbody>
              {visible.map((product) => {
                const category = byId.get(product.category_id)
                const cover = product.images?.[0]

                return (
                  <tr
                    key={product.id}
                    className={cn(
                      'border-b border-hairline last:border-b-0',
                      busyId === product.id && 'opacity-50',
                    )}
                  >
                    <td className="p-4">
                      {/* 96px, up from 56. A catalogue is checked by looking
                          at the pictures — a thumbnail too small to tell an
                          oak door from a walnut one is a thumbnail that costs
                          a click to be useful, on every row. */}
                      <div className="size-24 overflow-hidden border border-hairline bg-surface">
                        {cover && (
                          <img
                            src={cover}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {/* The name is the thing being looked for, so it is the
                          largest text on the row rather than the same 14px as
                          the price beside it. */}
                      <p className="text-base leading-snug text-ink">{productName(product)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {lang === 'ka' ? product.title_en : product.title_ka}
                      </p>
                      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {product.featured && (
                          <span className="text-[10px] tracking-[0.14em] text-brass uppercase">
                            {t('product.featuredBadge')}
                          </span>
                        )}
                        {product.is_archived && (
                          <span className="border border-hairline px-1.5 py-0.5 text-[10px] tracking-[0.14em] text-muted uppercase">
                            {t('admin.archived')}
                          </span>
                        )}
                        <PurgeNotice deletedAt={product.deleted_at} />
                      </span>
                    </td>

                    <td className="p-4 text-sm">
                      {/*
                       * THE WHOLE PATH, NOT THE LAST STEP.
                       *
                       * This said "Doors". Since the catalogue gained real
                       * depth there can be doors under Exterior facade and
                       * doors under Interior, and one word cannot tell them
                       * apart — the column named the piece's category without
                       * saying which category it was. The parents are drawn
                       * quieter than the leaf: they are context, the last one
                       * is the answer.
                       */}
                      {category ? (
                        <span className="text-muted">
                          {pathTo(categories, category).map((step, index, all) => (
                            <span key={step.id}>
                              {index > 0 && <span className="mx-1 opacity-50">/</span>}
                              <span className={index === all.length - 1 ? 'text-ink' : undefined}>
                                {name(step)}
                              </span>
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted">{t('admin.noCategory')}</span>
                      )}
                    </td>

                    <td className="p-4 text-sm text-muted">
                      {product.price == null ? '—' : product.price}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          label={t('admin.edit')}
                          onClick={() => onEdit(product)}
                          icon={<Pencil aria-hidden="true" className="size-4 stroke-[1.25]" />}
                        />

                        {product.is_archived ? (
                          // Restoring is an administrator's call. An operator
                          // cannot even see an archived row from the database's
                          // point of view, so this would be refused anyway.
                          isAdmin && (
                            <IconButton
                              label={t('admin.restore')}
                              onClick={() => void act(product, () => restoreProduct(product.id))}
                              disabled={busyId === product.id}
                              icon={
                                <ArchiveRestore
                                  aria-hidden="true"
                                  className="size-4 stroke-[1.25]"
                                />
                              }
                            />
                          )
                        ) : (
                          <IconButton
                            label={t('admin.archive')}
                            onClick={() => setPending({ product, kind: 'archive' })}
                            disabled={busyId === product.id}
                            icon={<Archive aria-hidden="true" className="size-4 stroke-[1.25]" />}
                          />
                        )}

                        {/* Hidden from operators here, and refused for them by
                            the delete policy in supabase-rbac.sql. */}
                        {isAdmin && (
                          <IconButton
                            label={t('admin.delete')}
                            onClick={() => setPending({ product, kind: 'delete' })}
                            disabled={busyId === product.id}
                            icon={<Trash2 aria-hidden="true" className="size-4 stroke-[1.25]" />}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPending(null)
        }}
        title={pending?.kind === 'delete' ? t('admin.delete') : t('admin.archive')}
        description={
          pending
            ? t(pending.kind === 'delete' ? 'admin.confirmDelete' : 'admin.confirmArchive', {
                name: productName(pending.product),
                days: RETENTION_DAYS,
              })
            : ''
        }
        confirmLabel={pending?.kind === 'delete' ? t('admin.delete') : t('admin.archive')}
        busy={pending !== null && busyId === pending.product.id}
        onConfirm={() => {
          if (!pending) return
          const { product, kind } = pending
          setPending(null)
          void act(product, () =>
            kind === 'delete' ? deleteProduct(product.id) : archiveProduct(product.id),
          )
        }}
      />
    </>
  )
}

/** Top-level row down to this one, inclusive. Just this row if it has no parent. */
function pathTo(categories: Category[], category: Category): Category[] {
  const path = ancestorPath(categories, category.slug)
  return path.length > 0 ? path : [category]
}

/** Which of the two lists the dashboard is showing. */
type ProductStatus = 'live' | 'archived'

function StatusTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-11 px-5 text-[11px] tracking-[0.16em] uppercase transition-colors duration-300',
        active ? 'bg-surface text-ink' : 'text-muted hover:text-brass',
      )}
    >
      {label}
      <span className="ml-2 text-[10px] text-muted">{count}</span>
    </button>
  )
}

/**
 * How long an archived piece has left.
 *
 * Renders nothing at all when there is no date to count from — which is both a
 * live piece and a database that has not had supabase-retention.sql run
 * against it yet. Neither has anything true to say here, and a wrong number
 * about a permanent deletion is worse than no number.
 */
function PurgeNotice({ deletedAt }: { deletedAt?: string | null }) {
  const { t } = useTranslation()
  const days = daysUntilPurge(deletedAt)
  if (days === null) return null

  return (
    <span className="text-[9px] tracking-[0.14em] text-muted uppercase">
      {days === 0 ? t('admin.purgeToday') : t('admin.purgeIn', { count: days })}
    </span>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn('p-4 text-[10px] tracking-[0.16em] text-muted uppercase', className)}
    >
      {children}
    </th>
  )
}

function IconButton({
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
