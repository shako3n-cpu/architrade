import { useTranslation } from 'react-i18next'
import { useCatalogue } from '@/hooks/use-catalog'
import { QueryState } from '@/components/ui/query-state'
import { CategoryTreeManager } from '@/components/admin/category-tree-manager'

/**
 * /admin/categories — the catalogue structure.
 *
 * Was a flat list with add and rename and no delete, because deleting a
 * category would have quietly detached every product inside it. That guard now
 * lives in the database (supabase-category-tree.sql refuses to delete a
 * category still holding products or subcategories), which is what makes it
 * safe for this screen to offer the full set: create, edit, delete, reorder,
 * nest, and show/hide.
 *
 * Products are fetched alongside the categories because the counts are the
 * point: an admin deciding whether a branch should be visible needs to know
 * whether there is anything behind it, and the count is also what the delete
 * guard will refuse on.
 */
export function AdminCategories() {
  const { t } = useTranslation()
  const catalogue = useCatalogue()

  return (
    <>
      <div>
        <h1 className="font-heading text-3xl text-ink">{t('admin.catTreeTitle')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t('admin.catTreeSubtitle')}</p>
      </div>

      <QueryState result={catalogue}>
        {({ categories, products }) => (
          <CategoryTreeManager
            categories={categories}
            products={products}
            onChanged={catalogue.retry}
          />
        )}
      </QueryState>
    </>
  )
}
