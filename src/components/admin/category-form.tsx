import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CheckboxField, SelectField, TextField } from '@/components/admin/field'
import type { Category } from '@/data/types'
import type { CategoryDraft } from '@/lib/admin-queries'
import { slugify } from '@/lib/admin-queries'
import type { CategoryNode } from '@/lib/category-tree'
import { findNode, flattenTree } from '@/lib/category-tree'

/** What the form hands back. `slug` is absent when editing — see below. */
export type CategorySubmit = Omit<CategoryDraft, 'slug'> & { slug?: string }

/**
 * Create or edit one category.
 *
 * THE SLUG IS SET ONCE AND NEVER AGAIN
 *   On create it is derived from the English title and can be corrected. On
 *   edit the field is gone entirely, because the slug is the address of the
 *   category page: changing it breaks every link that already points there —
 *   a bookmark, a search result, a message someone sent a client. Renaming the
 *   TITLES is always safe and is what the office actually wants nine times in
 *   ten. If a slug is genuinely wrong, the honest fix is a new category and a
 *   redirect, not a silent rewrite.
 *
 * THE PARENT LIST EXCLUDES THE ROW'S OWN SUBTREE
 *   Offering a category its own descendant as a parent offers the one move
 *   the database will refuse. Filtering the options means the impossible
 *   choice is never on screen, rather than being accepted and then rejected.
 */
export function CategoryForm({
  heading,
  category,
  tree,
  onCancel,
  onSubmit,
}: {
  heading: string
  /** Undefined when creating. */
  category?: Category
  /** The whole tree, for the parent picker. */
  tree: CategoryNode[]
  onCancel: () => void
  onSubmit: (draft: CategorySubmit) => Promise<void>
}) {
  const { t } = useTranslation()

  const [titleKa, setTitleKa] = useState(category?.title_ka ?? '')
  const [titleEn, setTitleEn] = useState(category?.title_en ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [parentId, setParentId] = useState(category?.parent_id ?? '')
  const [image, setImage] = useState(category?.image ?? '')
  const [isActive, setIsActive] = useState(category?.is_active !== false)
  const [featured, setFeatured] = useState(category?.featured === true)
  const [saving, setSaving] = useState(false)

  const isNew = !category

  // This row and everything under it: the moves the database would refuse.
  const self = category ? findNode(tree, category.slug) : null
  const forbidden = new Set(
    self ? flattenTree([self]).map((node) => node.category.id) : [],
  )

  const parentOptions = [
    { value: '', label: t('admin.catNoParent') },
    ...flattenTree(tree)
      .filter((node) => !forbidden.has(node.category.id))
      .map((node) => ({
        value: node.category.id,
        // Indented so a flat <select> still shows the shape of the tree.
        label: `${' '.repeat(node.depth * 3)}${node.category.title_en}`,
      })),
  ]

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        title_ka: titleKa.trim(),
        title_en: titleEn.trim(),
        ...(isNew ? { slug: (slug.trim() || slugify(titleEn || titleKa)) } : {}),
        parent_id: parentId || null,
        image: image.trim() || null,
        is_active: isActive,
        featured,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="border border-hairline bg-surface p-5">
      <p className="at-label mb-5 text-brass-on-surface">{heading}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={t('admin.catTitleKa')}
          value={titleKa}
          onChange={setTitleKa}
          required
        />
        <TextField
          label={t('admin.catTitleEn')}
          value={titleEn}
          onChange={setTitleEn}
          required
        />

        {isNew && (
          <TextField
            label={t('admin.catSlug')}
            value={slug}
            onChange={setSlug}
            placeholder={slugify(titleEn || titleKa) || 'office-chairs'}
            hint="/catalog/…"
          />
        )}

        <SelectField
          label={t('admin.catParent')}
          value={parentId}
          onChange={setParentId}
          options={parentOptions}
        />

        <div className="sm:col-span-2">
          <TextField label={t('admin.catImage')} value={image} onChange={setImage} />
        </div>

        <CheckboxField
          label={t('admin.catEnable')}
          checked={isActive}
          onChange={setIsActive}
        />
        <CheckboxField
          label={t('admin.catFeatured')}
          checked={featured}
          onChange={setFeatured}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={saving}>
          {t('admin.catSave')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={saving}>
          {t('admin.catCancel')}
        </Button>
      </div>
    </form>
  )
}
