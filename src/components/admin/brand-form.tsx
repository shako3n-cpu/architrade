import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/admin/field'
import { ImageField, type ImageRemover, type ImageUploader } from '@/components/admin/image-field'
import { DISCIPLINES } from '@/data/company'
import type { Brand } from '@/data/types'
import type { BrandDraft } from '@/lib/admin-queries'
import { slugify } from '@/lib/admin-queries'

/** What the form hands back. `slug` is absent when editing — see below. */
export type BrandSubmit = Omit<BrandDraft, 'slug'> & { slug?: string }

/**
 * Create or edit one partner house.
 *
 * THE TWO FIELDS THIS SCREEN EXISTS FOR
 *   `website` and `description` were empty on all twenty-nine houses for as
 *   long as they lived in the source, and the comment explaining why said the
 *   office holds the answers: which domain each house wants used, and the
 *   supplier's own boilerplate. This form is how those get in without a
 *   developer. Both are optional and stay optional — a card renders correctly
 *   with neither, and a half-filled list is the normal state on the way to a
 *   full one.
 *
 * THE SLUG IS SET ONCE AND NEVER AGAIN
 *   Same rule as categories: derived from the name on create, correctable
 *   there, and gone when editing. Nothing links to a brand by slug today, but
 *   it is the key the seed in supabase-brands.sql matches on, so rewriting it
 *   would make a re-run insert a duplicate house rather than skip it.
 *
 * THE DISCIPLINE LIST IS THE SIX THE INTERFACE CAN LABEL
 *   Not a free text field, because the badge and the filter chip both read
 *   `b2b.brands.<discipline>` from the locale files — a seventh value would
 *   render as a missing key. The database has the same six in a check
 *   constraint, so this select is the polite half of a rule that is enforced
 *   either way.
 */
export function BrandForm({
  heading,
  brand,
  onCancel,
  onSubmit,
  uploadImage,
  removeImage,
}: {
  heading: string
  /** Undefined when creating. */
  brand?: Brand
  onCancel: () => void
  onSubmit: (draft: BrandSubmit) => Promise<void>
  /** Injectable so the form runs without Supabase. See /demo/brands. */
  uploadImage?: ImageUploader
  removeImage?: ImageRemover
}) {
  const { t } = useTranslation()

  const [name, setName] = useState(brand?.name ?? '')
  const [slug, setSlug] = useState(brand?.slug ?? '')
  const [discipline, setDiscipline] = useState(brand?.discipline ?? DISCIPLINES[0])
  const [country, setCountry] = useState(brand?.country ?? '')
  const [image, setImage] = useState(brand?.image ?? '')
  const [logo, setLogo] = useState(brand?.logo ?? '')
  const [website, setWebsite] = useState(brand?.website ?? '')
  const [descriptionKa, setDescriptionKa] = useState(brand?.description_ka ?? '')
  const [descriptionEn, setDescriptionEn] = useState(brand?.description_en ?? '')
  const [isActive, setIsActive] = useState(brand?.is_active !== false)
  const [saving, setSaving] = useState(false)

  const isNew = !brand

  const disciplineOptions = DISCIPLINES.map((value) => ({
    value,
    label: t(`b2b.brands.${value}`),
  }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        discipline,
        ...(isNew ? { slug: slug.trim() || slugify(name) } : {}),
        // Empty is stored as NULL, not as "". A card asks whether the field is
        // set, and an empty string is set — it would render a blank link.
        country: country.trim() || null,
        image: image.trim() || null,
        logo: logo.trim() || null,
        website: website.trim() || null,
        description_ka: descriptionKa.trim() || null,
        description_en: descriptionEn.trim() || null,
        is_active: isActive,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="border border-hairline bg-surface p-5">
      <p className="at-label mb-5 text-brass-on-surface">{heading}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label={t('admin.brandName')} value={name} onChange={setName} required />

        <SelectField
          label={t('admin.brandDiscipline')}
          value={discipline}
          onChange={(value) => setDiscipline(value as (typeof DISCIPLINES)[number])}
          options={disciplineOptions}
        />

        {isNew && (
          <TextField
            label={t('admin.brandSlug')}
            value={slug}
            onChange={setSlug}
            /* NOT `slugify(name) || 'herman-miller'`. slugify falls back to
               `item-<timestamp>` for empty input, which is truthy, so the
               example never showed — the field advertised a different piece of
               junk on every keystroke instead. Ask whether there is a name
               first. */
            placeholder={name.trim() ? slugify(name) : 'herman-miller'}
          />
        )}

        <TextField
          label={t('admin.brandCountry')}
          value={country}
          onChange={setCountry}
          placeholder="IT"
          hint={t('admin.brandCountryHint')}
        />

        {/*
         * BOTH PICTURES ARE UPLOADED, NOT TYPED.
         *
         * These were two text boxes labelled "Photograph URL" and "Logo URL",
         * which asks the office to produce a hosted address for a file sitting
         * on a desktop — something they have no way to do. The supplier sends a
         * logo as an attachment, not as a link. The result was twenty-nine
         * houses with both fields empty and a logo wall of blank rectangles.
         *
         * Same box the category banner and the product photographs use, and
         * the same bucket: `product-images` is public to read and writable only
         * by staff, which is exactly what a brand picture needs. A second
         * bucket would need its own policies to say the same thing twice.
         */}
        <ImageField
          label={t('admin.brandImage')}
          value={image}
          onChange={setImage}
          disabled={saving}
          upload={uploadImage}
          remove={removeImage}
        />
        <ImageField
          label={t('admin.brandLogo')}
          value={logo}
          onChange={setLogo}
          disabled={saving}
          upload={uploadImage}
          remove={removeImage}
        />

        <div className="sm:col-span-2">
          <TextField
            label={t('admin.brandWebsite')}
            value={website}
            onChange={setWebsite}
            placeholder="https://"
            hint={t('admin.brandWebsiteHint')}
          />
        </div>

        <TextAreaField
          label={t('admin.brandDescriptionKa')}
          value={descriptionKa}
          onChange={setDescriptionKa}
        />
        <TextAreaField
          label={t('admin.brandDescriptionEn')}
          value={descriptionEn}
          onChange={setDescriptionEn}
        />

        <CheckboxField
          label={t('admin.brandEnable')}
          hint={t('admin.brandEnableHint')}
          checked={isActive}
          onChange={setIsActive}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={saving}>
          {t('admin.brandSave')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={saving}>
          {t('admin.brandCancel')}
        </Button>
      </div>
    </form>
  )
}
