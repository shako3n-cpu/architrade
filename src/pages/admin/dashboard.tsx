import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { Category, Product } from '@/data/types'
import { useCatalogue } from '@/hooks/use-catalog'
import { deleteProduct, explainWriteFailure } from '@/lib/admin-queries'
import { QueryState } from '@/components/ui/query-state'
import { Button } from '@/components/ui/button'
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
  const catalogue = useCatalogue()

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
}) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const remove = async (product: Product) => {
    // Deleting a row cannot be undone from this screen, so it is confirmed —
    // and the confirmation names the piece rather than saying "this item".
    const ok = window.confirm(t('admin.confirmDelete', { name: productName(product) }))
    if (!ok) return

    setError(null)
    setDeletingId(product.id)

    try {
      await deleteProduct(product.id)
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
      setDeletingId(null)
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
            className="w-full border border-hairline bg-background py-2.5 pr-3.5 pl-9 text-sm text-ink transition-colors duration-300 placeholder:text-muted/60 focus:border-brass focus:outline-none"
          />
        </div>

        <select
          value={categoryId}
          onChange={(event) => onCategoryId(event.target.value)}
          aria-label={t('admin.filterByCategory')}
          className="border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink transition-colors duration-300 focus:border-brass focus:outline-none"
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
                <Th className="w-28 text-right">{t('admin.colActions')}</Th>
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
                      deletingId === product.id && 'opacity-50',
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
                      {product.featured && (
                        <span className="mt-1.5 inline-block text-[9px] tracking-[0.14em] text-brass uppercase">
                          {t('product.featuredBadge')}
                        </span>
                      )}
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
                        <IconButton
                          label={t('admin.delete')}
                          onClick={() => void remove(product)}
                          disabled={deletingId === product.id}
                          icon={<Trash2 aria-hidden="true" className="size-4 stroke-[1.25]" />}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
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
      className="inline-flex size-9 items-center justify-center text-muted transition-colors duration-300 hover:text-brass disabled:opacity-40"
    >
      {icon}
    </button>
  )
}
