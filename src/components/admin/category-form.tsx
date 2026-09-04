import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CheckboxField, TextField } from '@/components/admin/field'
import { ImageField, type ImageRemover, type ImageUploader } from '@/components/admin/image-field'
import type { Category } from '@/data/types'
import type { CategoryDraft } from '@/lib/admin-queries'
import { checkEnglishTitle } from '@/lib/admin-validate'

/** What the form hands back. `slug` is absent when editing — see below. */
export type CategorySubmit = Omit<CategoryDraft, 'slug'> & { slug?: string }

/**
 * Create or edit one category.
 *
 * THE SLUG IS DERIVED AND NEVER SHOWN
 *   It used to be an editable field on create, on the reasoning that the
 *   address should be correctable before anything links to it. In practice it
 *   was one more box between the office and a category they already knew the
 *   name of, pre-filled with the right answer, and every wrong value it ever
 *   received was a typo. So it is now computed from the English title in the
 *   caller and never rendered. On EDIT it was already absent, and for the
 *   original reason, which has not changed: the slug is the address of the
 *   category page, and rewriting it breaks every link that points there.
 *
 * THE PARENT IS THE TREE, NOT A DROPDOWN
 *   There used to be a "parent category" select here as well, which meant the
 *   same fact — where this sits in the catalogue — could be stated in two
 *   places that were free to disagree: a picker inside a form, and the row's
 *   own position in the list behind it. Moving a branch is now one gesture in
 *   one place. Adding a category under something is done from that thing's
 *   own "add subcategory" button, and re-nesting afterwards is a drag.
 *   `initialParentId` is what carries that decision in.
 */
export function CategoryForm({
  heading,
  category,
  initialParentId,
  onCancel,
  onSubmit,
  uploadImage,
  removeImage,
}: {
  heading: string
  /** Undefined when creating. */
  category?: Category
  /**
   * The parent this category belongs under. On create it comes from whichever
   * row's "add subcategory" button was pressed; on edit it is the row's
   * current parent, passed straight back out untouched.
   *
   * Its own prop rather than a half-built `category`, and that distinction is
   * the whole point. "Add a child" used to pass `{ parent_id } as Category`,
   * which made the form think it was EDITING, so it submitted no slug at all.
   * The caller filled the gap with `''`, and `categories_slug_key` is unique:
   * the first subcategory took the empty slug and every one after it was
   * refused as a duplicate. The one that got through had `/catalog/` for an
   * address.
   */
  initialParentId?: string | null
  onCancel: () => void
  onSubmit: (draft: CategorySubmit) => Promise<void>
  /** Injectable so the screen runs without Supabase. See /demo/categories. */
  uploadImage?: ImageUploader
  removeImage?: ImageRemover
}) {
  const { t } = useTranslation()

  const [titleKa, setTitleKa] = useState(category?.title_ka ?? '')
  const [titleEn, setTitleEn] = useState(category?.title_en ?? '')
  const [image, setImage] = useState(category?.image ?? '')
  const [isActive, setIsActive] = useState(category?.is_active !== false)
  const [featured, setFeatured] = useState(category?.featured === true)
  const [saving, setSaving] = useState(false)

  const isNew = !category
  const parentId = category ? (category.parent_id ?? null) : (initialParentId ?? null)

  /*
   * The address is built from the English title, so a title the address
   * cannot be built from is refused here rather than quietly stamped with a
   * timestamp by the caller. Checked on every keystroke so the message
   * arrives while the field is still in hand, not after Save.
   */
  const titleProblem = checkEnglishTitle(titleEn)
  const titleError = titleProblem ? t(`admin.slugTitle_${titleProblem}`) : undefined

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (titleProblem) return
    setSaving(true)
    try {
      await onSubmit({
        title_ka: titleKa.trim(),
        title_en: titleEn.trim(),
        /* No slug on edit — the address is fixed once it exists. On create the
           caller derives one from the English title. */
        parent_id: parentId,
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
        <TextField label={t('admin.catTitleKa')} value={titleKa} onChange={setTitleKa} required />
        <TextField
          label={t('admin.catTitleEn')}
          value={titleEn}
          onChange={setTitleEn}
          required
          error={titleError}
          /* The address is built from this one, so it is worth saying so
             where the value is typed rather than in a field of its own. */
          hint={isNew ? t('admin.catSlugFromEnglish') : undefined}
        />

        <div className="sm:col-span-2">
          <ImageField
            label={t('admin.catImage')}
            value={image}
            onChange={setImage}
            disabled={saving}
            upload={uploadImage}
            remove={removeImage}
          />
        </div>

        <CheckboxField label={t('admin.catEnable')} checked={isActive} onChange={setIsActive} />
        <CheckboxField label={t('admin.catFeatured')} checked={featured} onChange={setFeatured} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={saving || Boolean(titleProblem)}>
          {t('admin.catSave')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={saving}>
          {t('admin.catCancel')}
        </Button>
      </div>
    </form>
  )
}
