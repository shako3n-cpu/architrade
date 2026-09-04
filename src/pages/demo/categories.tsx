import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category, Product } from '@/data/types'
import { CategoryTreeManager, type CategoryActions } from '@/components/admin/category-tree-manager'

/**
 * ============================================================================
 * /demo/categories — THE STRUCTURE SCREEN, WITHOUT A DATABASE
 * ----------------------------------------------------------------------------
 * The real screen lives behind a sign-in and talks to Supabase, so seeing it
 * work needs credentials and a project. This is the same component, driven by
 * an in-memory catalogue: the drag, the folding and the forms all behave
 * exactly as they will in the dashboard, and nothing leaves the browser.
 *
 * Reload and it is back to the starting tree. Nothing is persisted except
 * which branches are folded, which the real screen keeps too.
 *
 * NOT LINKED FROM ANYWHERE. Reachable only by typing the address, carries no
 * data worth seeing, and is left in the routes on purpose — a screen that can
 * be opened without a login is the one that gets looked at when something
 * about the tree is being argued over.
 * ============================================================================
 */
export function DemoCategories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>(SEED)

  /*
   * The same four writes the dashboard makes, against an array. Ordering is
   * the interesting one: the real `reorderCategories` renumbers `sort_order`
   * in steps of ten per parent, so this does the same rather than relying on
   * array position — otherwise the demo would agree with the screen for the
   * wrong reason and hide a bug that only shows against a database.
   */
  const actions: CategoryActions = {
    create: async (draft) => {
      const row: Category = {
        id: crypto.randomUUID(),
        slug: draft.slug,
        title_ka: draft.title_ka,
        title_en: draft.title_en,
        parent_id: draft.parent_id ?? null,
        image: draft.image ?? null,
        is_active: draft.is_active ?? true,
        featured: draft.featured ?? false,
        sort_order: 999,
        created_at: new Date().toISOString(),
      } as Category

      setCategories((current) => [...current, row])
      return row
    },

    update: async (id, patch) => {
      let updated: Category | undefined
      setCategories((current) =>
        current.map((row) => {
          if (row.id !== id) return row
          updated = { ...row, ...patch } as Category
          return updated
        }),
      )
      return updated as Category
    },

    remove: async (id) => {
      setCategories((current) => current.filter((row) => row.id !== id))
    },

    /* Storage needs a Supabase project. An object URL is a real, displayable
       address for a file the browser already has, so the picture box behaves
       exactly as it will against the bucket — the file simply never leaves
       the tab and dies with it. */
    uploadImage: async (file) => URL.createObjectURL(file),
    removeImage: async (url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    },

    reorder: async (idsInOrder) => {
      const rank = new Map(idsInOrder.map((id, index) => [id, (index + 1) * 10]))
      setCategories((current) =>
        current.map((row) => (rank.has(row.id) ? { ...row, sort_order: rank.get(row.id) } : row)),
      )
    },
  }

  return (
    <div className="mx-auto w-full max-w-[80rem] px-5 py-10 sm:px-8">
      <p className="text-[10px] tracking-[0.18em] text-brass uppercase">Demo — no database</p>
      <h1 className="mt-2 font-heading text-2xl text-ink">{t('admin.catTreeTitle')}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Drag a row by its grip to reorder it. Drag it sideways to change how deeply it nests — one
        indent step per level. Use the arrows on a row for the same thing without a mouse. Add a
        top-level category and the form stays open, aimed at its subcategories. Changes live in this
        tab only and reset on reload.
      </p>

      <CategoryTreeManager
        categories={categories}
        products={DEMO_PRODUCTS}
        actions={actions}
        onChanged={() => {}}
      />
    </div>
  )
}

/** Enough shape to be worth dragging: three levels, and a branch to fold. */
const SEED: Category[] = [
  row('home', 'Home furniture', 'საოჯახო ავეჯი', null, 10),
  row('living-room', 'Living room', 'მისაღები', 'home', 10),
  row('sofas', 'Sofas', 'დივნები', 'living-room', 10),
  row('armchairs', 'Armchairs', 'სავარძლები', 'living-room', 20),
  row('bedroom', 'Bedroom', 'საძინებელი', 'home', 20),
  row('beds', 'Beds', 'საწოლები', 'bedroom', 10),
  row('office', 'Office furniture', 'საოფისე ავეჯი', null, 20),
  row('desks', 'Desks', 'მაგიდები', 'office', 10),
  row('office-chairs', 'Office chairs', 'საოფისე სკამები', 'office', 20),
  row('lighting', 'Lighting', 'განათება', null, 30, false),
]

function row(
  id: string,
  titleEn: string,
  titleKa: string,
  parentId: string | null,
  sortOrder: number,
  isActive = true,
): Category {
  return {
    id,
    slug: id,
    title_en: titleEn,
    title_ka: titleKa,
    parent_id: parentId,
    sort_order: sortOrder,
    is_active: isActive,
    featured: false,
    image: null,
    created_at: '2026-01-01T00:00:00.000Z',
  } as Category
}

/* Two products, so the counts and the "empty" badge are not all one value. */
const DEMO_PRODUCTS = [
  { id: 'p1', category_id: 'sofas' },
  { id: 'p2', category_id: 'desks' },
] as unknown as Product[]
