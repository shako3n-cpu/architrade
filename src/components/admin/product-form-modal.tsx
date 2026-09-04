import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Loader2, X } from 'lucide-react'
import type { Category, Product } from '@/data/types'
import {
  createProduct,
  explainWriteFailure,
  slugify,
  updateProduct,
  type ProductDraft,
} from '@/lib/admin-queries'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildCategoryTree, flattenTree } from '@/lib/category-tree'
import type { Brand } from '@/data/types'
import { CheckboxField, SelectField, TextAreaField, TextField } from './field'
import { ImageUpload } from './image-upload'

/**
 * Create or edit one piece.
 *
 * Built on Radix Dialog for the parts that are easy to get wrong: focus is
 * trapped in the panel, Escape closes it, the page behind cannot scroll, and
 * focus returns to whatever opened it.
 *
 * One form serves both jobs. `product` decides which — null creates, a row
 * edits — because the fields are identical and two near-copies would drift
 * apart the first time one of them gained a field.
 */
export function ProductFormModal({
  open,
  onOpenChange,
  product,
  categories,
  brands,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Null to create a new piece. */
  product: Product | null
  categories: Category[]
  /** Every house, hidden ones included — see the note on the picker below. */
  brands: Brand[]
  /** Called after a successful save so the table can reload. */
  onSaved: () => void
}) {
  const { t, i18n } = useTranslation()
  const editing = product !== null

  const [draft, setDraft] = useState<ProductDraft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refill the form whenever it is opened, so reopening after a cancel never
  // shows the previous piece's details.
  useEffect(() => {
    if (!open) return
    setDraft(product ? draftFrom(product) : emptyDraft())
    setError(null)
  }, [open, product])

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  /*
   * THE CATEGORY PICKER SHOWS THE TREE, NOT A FLAT LIST.
   *
   * It used to map `categories` in whatever order the query returned, which
   * put "Sofas" and "Living Room" side by side as equals. With six parents and
   * twenty-three children that is twenty-nine indistinguishable names, and the
   * one thing the person filing a piece needs to know — which room this
   * belongs under — was the thing the list did not say.
   *
   * Indented depth-first instead, the same treatment the category screen's own
   * parent picker uses, so the two read identically.
   *
   * A CATEGORY THAT HAS SUBCATEGORIES IS A HEADING, NOT A SHELF.
   *
   * "Exterior facade" holds doors and windows; the doors hold the products.
   * Filing a piece under the heading itself puts it on a page whose whole job
   * is to list the subcategories, so it appears in neither — and nothing about
   * a flat, equal-looking list said so. Parents are still drawn, because they
   * are the only thing that says WHERE a child sits, but they cannot be
   * chosen.
   *
   * With one exception: whatever the product is filed under right now stays
   * selectable even if it is a parent. Rows filed before this rule existed are
   * real, and a form that will not show the value it was opened with is a form
   * that re-files a product the moment it is saved.
   */
  const categoryOptions = flattenTree(buildCategoryTree(categories)).map((node) => ({
    value: node.category.id,
    label: `${' '.repeat(node.depth * 3)}${
      i18n.language === 'ka' ? node.category.title_ka : node.category.title_en
    }`,
    disabled: node.children.length > 0 && node.category.id !== draft.category_id,
  }))

  /*
   * The brand picker offers hidden houses too, and deliberately.
   *
   * A hidden brand is one whose agency agreement has lapsed, not one that
   * never existed — the pieces already supplied by it are still in the
   * catalogue and still have to be filed correctly. Hiding it from this list
   * would make an editor re-file real stock under the wrong house to get the
   * form to save.
   */
  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.is_active ? brand.name : `${brand.name} (${t('admin.brandHidden')})`,
  }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    // The slug is derived rather than typed — it is a technical detail and
    // this dashboard is for people who should not have to think about URLs.
    // On an existing piece it is left alone: changing it would break the
    // product's address and every link pointing at it.
    const payload: ProductDraft = {
      ...draft,
      slug: editing ? draft.slug : slugify(draft.title_en || draft.title_ka),
    }

    try {
      if (editing) await updateProduct(product.id, payload)
      else await createProduct(payload)

      onSaved()
      onOpenChange(false)
    } catch (cause) {
      const kind = explainWriteFailure(cause)
      setError(
        kind === 'setupMissing'
          ? t('admin.errorSetupMissing')
          : kind === 'notPermitted'
            ? t('admin.errorNotPermitted')
            : kind === 'duplicateSlug'
              ? t('admin.errorDuplicate')
              : t('admin.errorUnknown', {
                  message: cause instanceof Error ? cause.message : String(cause),
                }),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />

        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 flex flex-col border-hairline bg-background',

            // Phone: a sheet against the bottom edge, within thumb reach.
            'inset-x-0 bottom-0 max-h-[92dvh] border-t',

            /*
             * Tablet and up: a centred panel.
             *
             * `inset-x-auto` and `bottom-auto` are load-bearing. The phone
             * rules above pin left AND right to 0, and an element with both
             * horizontal edges pinned has its width DICTATED by those edges —
             * a max-width can only cap that, never create it. Leaving them set
             * while centring with left-1/2 pins both edges to the middle and
             * collapses the panel to nothing. Release them, then position from
             * the left edge alone and pull back by half the panel's own width.
             */
            'sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2',
            'sm:-translate-x-1/2 sm:-translate-y-1/2',

            // Width comes from the viewport less a gutter, capped for reading.
            'sm:w-[calc(100vw-2rem)] sm:max-w-3xl sm:max-h-[88dvh] sm:border',
          )}
        >
          <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
            <Dialog.Title className="font-heading text-xl text-ink">
              {t(editing ? 'admin.editProduct' : 'admin.newProduct')}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('admin.close')}
                className="-mr-2 inline-flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-ink"
              >
                <X aria-hidden="true" className="size-5 stroke-[1.25]" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t('admin.titleKa')}
                  value={draft.title_ka}
                  onChange={(value) => set('title_ka', value)}
                  required
                />
                <TextField
                  label={t('admin.titleEn')}
                  value={draft.title_en}
                  onChange={(value) => set('title_en', value)}
                  required
                />
              </div>

              <TextAreaField
                label={t('admin.descriptionKa')}
                value={draft.description_ka}
                onChange={(value) => set('description_ka', value)}
              />

              <TextAreaField
                label={t('admin.descriptionEn')}
                value={draft.description_en}
                onChange={(value) => set('description_en', value)}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label={t('admin.category')}
                  value={draft.category_id}
                  onChange={(value) => set('category_id', value)}
                  options={categoryOptions}
                  placeholder={t('admin.chooseCategory')}
                  required
                />

                <SelectField
                  label={t('admin.brand')}
                  value={draft.brand_id}
                  onChange={(value) => set('brand_id', value)}
                  options={brandOptions}
                  placeholder={t('admin.chooseBrand')}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t('admin.price')}
                  type="number"
                  value={draft.price === null ? '' : String(draft.price)}
                  onChange={(value) => set('price', value === '' ? null : Number(value))}
                  hint={t('admin.priceHint')}
                />
              </div>

              <TextField
                label={t('admin.dimensions')}
                value={draft.dimensions}
                onChange={(value) => set('dimensions', value)}
                placeholder="W 220 x D 95 x H 75 cm"
                hint={t('admin.dimensionsHint')}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t('admin.materialsKa')}
                  value={draft.materials_ka}
                  onChange={(value) => set('materials_ka', value)}
                />
                <TextField
                  label={t('admin.materialsEn')}
                  value={draft.materials_en}
                  onChange={(value) => set('materials_en', value)}
                />
              </div>

              <ImageUpload
                images={draft.images}
                onChange={(images) => set('images', images)}
                disabled={saving}
              />

              <CheckboxField
                label={t('admin.featured')}
                hint={t('admin.featuredHint')}
                checked={draft.featured}
                onChange={(checked) => set('featured', checked)}
              />

              {error && (
                <p role="alert" className="border border-hairline bg-surface p-4 text-sm text-ink">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-hairline px-6 py-4">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={saving}>
                  {t('admin.cancel')}
                </Button>
              </Dialog.Close>

              <Button type="submit" size="sm" disabled={saving}>
                {saving && <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />}
                {t('admin.save')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function emptyDraft(): ProductDraft {
  return {
    slug: '',
    title_ka: '',
    title_en: '',
    description_ka: '',
    description_en: '',
    materials_ka: '',
    materials_en: '',
    dimensions: '',
    category_id: '',
    brand_id: '',
    images: [],
    featured: false,
    price: null,
  }
}

function draftFrom(product: Product): ProductDraft {
  return {
    slug: product.slug,
    title_ka: product.title_ka,
    title_en: product.title_en,
    description_ka: product.description_ka ?? '',
    description_en: product.description_en ?? '',
    materials_ka: product.materials_ka ?? '',
    materials_en: product.materials_en ?? '',
    dimensions: product.dimensions ?? '',
    category_id: product.category_id ?? '',
    brand_id: product.brand_id ?? '',
    images: product.images ?? [],
    featured: product.featured,
    price: product.price ?? null,
  }
}
