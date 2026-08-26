import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Pencil, Plus, X } from 'lucide-react'
import type { Category } from '@/data/types'
import { useCatalogue } from '@/hooks/use-catalog'
import {
  createCategory,
  explainWriteFailure,
  renameCategory,
  slugify,
} from '@/lib/admin-queries'
import { QueryState } from '@/components/ui/query-state'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/admin/field'

/**
 * /admin/categories — view, add and rename.
 *
 * There is no delete, and that is a decision rather than an omission.
 * `products.category_id` is declared `on delete set null`, so removing a
 * category would quietly detach every piece inside it: they would disappear
 * from the category pages with nothing on screen to say why. The setup file
 * grants no delete policy either, so the database would refuse it even if this
 * screen offered it.
 */
export function AdminCategories() {
  const { t } = useTranslation()
  const catalogue = useCatalogue()

  return (
    <>
      <div>
        <h1 className="font-heading text-3xl text-ink">{t('admin.categoriesTitle')}</h1>
        <p className="mt-2 text-sm text-muted">{t('admin.categoriesSubtitle')}</p>
      </div>

      <QueryState result={catalogue}>
        {({ categories, products }) => (
          <CategoryManager
            categories={categories}
            countFor={(id) => products.filter((product) => product.category_id === id).length}
            onChanged={catalogue.retry}
          />
        )}
      </QueryState>
    </>
  )
}

function CategoryManager({
  categories,
  countFor,
  onChanged,
}: {
  categories: Category[]
  countFor: (id: string) => number
  onChanged: () => void
}) {
  const { t } = useTranslation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const report = (cause: unknown) => {
    const kind = explainWriteFailure(cause)
    setError(
      kind === 'setupMissing'
        ? t('admin.errorSetupMissing')
        : kind === 'notPermitted'
          ? t('admin.errorNotPermitted')
          : kind === 'duplicateSlug'
            ? t('admin.errorDuplicateCategory')
            : t('admin.errorUnknown', {
                message: cause instanceof Error ? cause.message : String(cause),
              }),
    )
  }

  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-xs text-muted">{t('admin.categoryCount', { count: categories.length })}</p>

        {!adding && (
          <Button
            size="sm"
            onClick={() => {
              setError(null)
              setAdding(true)
            }}
          >
            <Plus aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
            {t('admin.addCategory')}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      {adding && (
        <CategoryEditor
          titleKa=""
          titleEn=""
          heading={t('admin.addCategory')}
          onCancel={() => setAdding(false)}
          onSubmit={async (titles) => {
            setError(null)
            try {
              await createCategory({ ...titles, slug: slugify(titles.title_en || titles.title_ka) })
              setAdding(false)
              onChanged()
            } catch (cause) {
              report(cause)
            }
          }}
        />
      )}

      <ul className="mt-6 border border-hairline">
        {categories.map((category) => (
          <li key={category.id} className="border-b border-hairline last:border-b-0">
            {editingId === category.id ? (
              <CategoryEditor
                titleKa={category.title_ka}
                titleEn={category.title_en}
                heading={t('admin.renameCategory')}
                onCancel={() => setEditingId(null)}
                onSubmit={async (titles) => {
                  setError(null)
                  try {
                    await renameCategory(category.id, titles)
                    setEditingId(null)
                    onChanged()
                  } catch (cause) {
                    report(cause)
                  }
                }}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{category.title_en}</p>
                  <p className="mt-0.5 text-sm text-muted">{category.title_ka}</p>

                  {/* The slug is shown but never editable — it is the address
                      of the category page, and changing it breaks every link
                      already pointing there. */}
                  <p className="mt-1 font-mono text-[11px] text-muted/70">/{category.slug}</p>
                </div>

                <p className="text-xs text-muted">
                  {t('catalog.resultCount', { count: countFor(category.id) })}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setEditingId(category.id)
                  }}
                  title={t('admin.rename')}
                  aria-label={t('admin.rename')}
                  className="inline-flex size-9 items-center justify-center text-muted transition-colors duration-300 hover:text-brass"
                >
                  <Pencil aria-hidden="true" className="size-4 stroke-[1.25]" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-muted">{t('admin.categoryDeleteNote')}</p>
    </>
  )
}

/** The inline two-field editor used for both adding and renaming. */
function CategoryEditor({
  titleKa,
  titleEn,
  heading,
  onCancel,
  onSubmit,
}: {
  titleKa: string
  titleEn: string
  heading: string
  onCancel: () => void
  onSubmit: (titles: { title_ka: string; title_en: string }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [ka, setKa] = useState(titleKa)
  const [en, setEn] = useState(titleEn)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await onSubmit({ title_ka: ka.trim(), title_en: en.trim() })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="border border-brass/40 bg-surface p-5">
      <p className="text-[10px] tracking-[0.16em] text-brass uppercase">{heading}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField label={t('admin.titleKa')} value={ka} onChange={setKa} required disabled={busy} />
        <TextField label={t('admin.titleEn')} value={en} onChange={setEn} required disabled={busy} />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={busy || !ka.trim() || !en.trim()}>
          {busy ? (
            <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
          ) : (
            <Check aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
          )}
          {t('admin.save')}
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={busy}>
          <X aria-hidden="true" className="mr-2 size-4 stroke-[1.5]" />
          {t('admin.cancel')}
        </Button>
      </div>
    </form>
  )
}
