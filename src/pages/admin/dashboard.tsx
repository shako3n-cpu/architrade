import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArchiveRestore, Archive, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { Category, Product } from '@/data/types'
import { useCatalogue } from '@/hooks/use-catalog'
import { useAuth } from '@/hooks/use-auth'
import {
  archiveProduct,
  deleteProduct,
  explainWriteFailure,
  restoreProduct,
} from '@/lib/admin-queries'
import { QueryState } from '@/components/ui/query-state'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ProductFormModal } from '@/components/admin/product-form-modal'
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

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
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

  const visible = useMemo(() => {
    // Matching on BOTH titles regardless of the interface language: a manager
    // typing a Georgian name should find the piece even with the dashboard in
    // English, and the other way round.
    const needle = query.trim().toLowerCase()

    return products.filter((product) => {
      if (categoryId && product.category_id !== categoryId) return false
      if (!needle) return true
      return (
        product.title_ka.toLowerCase().includes(needle) ||
        product.title_en.toLowerCase().includes(needle)
      )
    })
  }, [products, query, categoryId])

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
      <div className="mt-8 flex flex-wrap items-center gap-3">
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

        <select
          value={categoryId}
          onChange={(event) => onCategoryId(event.target.value)}
          aria-label={t('admin.filterByCategory')}
          className="min-h-11 border border-hairline bg-background px-3.5 py-2.5 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none sm:text-sm"
        >
          <option value="">{t('admin.allCategories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {name(category)}
            </option>
          ))}
        </select>

        <p className="text-xs text-muted">
          {t('admin.showing', { shown: visible.length, total: products.length })}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 border-t border-b border-hairline py-16 text-center text-sm text-muted">
          {products.length === 0 ? t('admin.noProducts') : t('admin.noMatches')}
        </p>
      ) : (
        // Scrolls inside itself on a narrow screen rather than pushing the
        // page sideways.
        <div className="mt-6 overflow-x-auto border border-hairline">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline bg-surface">
                <Th className="w-20">{t('admin.colPhoto')}</Th>
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
                    <td className="p-3">
                      <div className="size-14 overflow-hidden border border-hairline bg-surface">
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

                    <td className="p-3">
                      <p className="text-sm text-ink">{productName(product)}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {lang === 'ka' ? product.title_en : product.title_ka}
                      </p>
                      <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                        {product.featured && (
                          <span className="text-[9px] tracking-[0.14em] text-brass uppercase">
                            {t('product.featuredBadge')}
                          </span>
                        )}
                        {product.is_archived && (
                          <span className="border border-hairline px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-muted uppercase">
                            {t('admin.archived')}
                          </span>
                        )}
                      </span>
                    </td>

                    <td className="p-3 text-sm text-muted">
                      {category ? name(category) : t('admin.noCategory')}
                    </td>

                    <td className="p-3 text-sm text-muted">
                      {product.price == null ? '—' : product.price}
                    </td>

                    <td className="p-3">
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

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn('p-3 text-[10px] tracking-[0.16em] text-muted uppercase', className)}
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
