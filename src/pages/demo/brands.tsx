import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Brand } from '@/data/types'
import { BrandForm, type BrandSubmit } from '@/components/admin/brand-form'

/**
 * ============================================================================
 * /demo/brands — THE PARTNER HOUSE FORM, WITHOUT A DATABASE
 * ----------------------------------------------------------------------------
 * Same reasoning as /demo/categories: the real screen is behind a sign-in and
 * a Supabase project, and the thing worth looking at here — the two picture
 * boxes — is exactly the part that cannot be seen without one.
 *
 * Uploads become object URLs, so the box behaves as it will against the
 * bucket and the file never leaves the tab. Saving prints the draft rather
 * than writing anything.
 * ============================================================================
 */
export function DemoBrands() {
  const { t } = useTranslation()
  const [saved, setSaved] = useState<BrandSubmit | null>(null)
  const [editing, setEditing] = useState(false)

  return (
    <div className="mx-auto w-full max-w-[60rem] px-5 py-10 sm:px-8">
      <p className="text-[10px] tracking-[0.18em] text-brass uppercase">Demo — no database</p>
      <h1 className="mt-2 font-heading text-2xl text-ink">{t('admin.brandsTitle')}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        The photograph and the logo are dropped or chosen, not typed as addresses. Saving prints the
        draft below instead of writing to the database.
      </p>

      <div className="mt-8">
        <BrandForm
          /* Remounted between create and edit so the second one starts from
             the house that was just saved rather than from empty fields. */
          key={editing ? 'edit' : 'new'}
          heading={editing ? t('admin.brandEdit') : t('admin.brandNew')}
          brand={editing && saved ? (saved as unknown as Brand) : undefined}
          uploadImage={async (file) => URL.createObjectURL(file)}
          removeImage={async (url) => {
            if (url.startsWith('blob:')) URL.revokeObjectURL(url)
          }}
          onCancel={() => setEditing(false)}
          onSubmit={async (draft) => {
            setSaved(draft)
            setEditing(true)
          }}
        />
      </div>

      {saved && (
        <pre
          data-testid="saved-draft"
          className="mt-6 overflow-x-auto border border-hairline bg-surface p-4 text-xs text-muted"
        >
          {JSON.stringify(saved, null, 2)}
        </pre>
      )}
    </div>
  )
}
