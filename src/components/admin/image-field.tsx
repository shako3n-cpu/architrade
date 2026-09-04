import { useCallback, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Loader2, X } from 'lucide-react'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  deleteProductImage,
  describeRejection,
  formatBytes,
  uploadProductImage,
} from '@/lib/storage'
import { explainWriteFailure } from '@/lib/admin-queries'
import { cn } from '@/lib/utils'

/** Uploads a file and returns the public URL to store on the row. */
export type ImageUploader = (file: File) => Promise<string>
/** Best-effort tidy-up of a file that is no longer referenced. */
export type ImageRemover = (url: string) => Promise<unknown>

/**
 * ONE picture, dropped or chosen — never typed.
 *
 * The category banner used to be a plain text box labelled "Banner image URL".
 * That asks the office to produce a hosted address for a photograph they have
 * sitting on a desktop, which is not a thing they have any way to do: the only
 * addresses to hand are the ones already in the catalogue, so the field was
 * either left empty or filled by copying another category's picture.
 *
 * The product form has had a real upload box since the start. This is the same
 * box narrowed to a single file, so a category banner is set the same way a
 * product photograph is and the two screens stop disagreeing about what
 * "add a picture" means.
 *
 * ImageUpload (plural) is deliberately not reused: half of it is the cover /
 * hover ordering, which has no meaning where there is only ever one file, and
 * a `max` prop would leave that half rendering conditionally forever.
 */
export function ImageField({
  label,
  value,
  onChange,
  disabled = false,
  upload = uploadProductImage,
  remove = deleteProductImage,
}: {
  label: string
  /** The full public URL, or '' for none. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Injectable. Defaults to the real bucket, which is what every screen uses. */
  upload?: ImageUploader
  remove?: ImageRemover
}) {
  const { t } = useTranslation()
  const inputId = useId()

  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = async (files: FileList | File[]) => {
    setError(null)
    // Only the first: a drop of five files onto a single-picture box means the
    // one on top, not four silent discards after four uploads.
    const file = Array.from(files)[0]
    if (!file) return

    const rejection = describeRejection(file)
    if (rejection === 'type') {
      setError(t('admin.imageWrongType', { name: file.name }))
      return
    }
    if (rejection === 'size') {
      setError(
        t('admin.imageTooBig', {
          name: file.name,
          size: formatBytes(file.size),
          max: formatBytes(MAX_IMAGE_BYTES),
        }),
      )
      return
    }

    setBusy(true)
    try {
      const url = await upload(file)
      // The one being replaced is dropped from the bucket, not orphaned. Safe
      // here in a way it is not for products: this field holds exactly one URL
      // and nothing else on the row can still be pointing at it.
      const previous = value
      onChange(url)
      if (previous) void remove(previous)
    } catch (cause) {
      const kind = explainWriteFailure(cause)
      setError(
        kind === 'setupMissing'
          ? t('admin.imageNoBucket')
          : kind === 'notPermitted'
            ? t('admin.imageNotPermitted')
            : t('admin.imageFailed', {
                message: cause instanceof Error ? cause.message : String(cause),
              }),
      )
    } finally {
      setBusy(false)
    }
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragging(false)
      if (!disabled) void accept(event.dataTransfer.files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, value],
  )

  const clear = () => {
    const previous = value
    onChange('')
    if (previous) void remove(previous)
  }

  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</p>

      {value ? (
        <div className="mt-2 flex items-start gap-4">
          <div className="relative h-28 w-44 shrink-0 overflow-hidden border border-hairline bg-surface">
            <img src={value} alt="" className="h-full w-full object-cover" />

            <button
              type="button"
              onClick={clear}
              disabled={disabled || busy}
              title={t('admin.removePhoto')}
              aria-label={t('admin.removePhoto')}
              className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center bg-background/95 text-muted transition-colors duration-300 hover:text-ink"
            >
              <X aria-hidden="true" className="size-3.5 stroke-[1.5]" />
            </button>
          </div>

          <label
            htmlFor={inputId}
            className={cn(
              'inline-block border border-hairline px-4 py-2 text-xs tracking-[0.12em] uppercase',
              disabled || busy
                ? 'text-muted'
                : 'cursor-pointer text-muted transition-colors duration-300 hover:border-brass hover:text-brass',
            )}
          >
            {t('admin.imageReplace')}
          </label>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'mt-2 border border-dashed p-6 text-center transition-colors duration-300',
            dragging ? 'border-brass bg-surface' : 'border-hairline',
            disabled && 'opacity-50',
          )}
        >
          <ImagePlus aria-hidden="true" className="mx-auto size-7 stroke-[1] text-muted" />

          <p className="mt-3 text-sm text-ink">{t('admin.dropOneHere')}</p>

          <label
            htmlFor={inputId}
            className={cn(
              'mt-3 inline-block border border-hairline px-4 py-2 text-xs tracking-[0.12em] uppercase',
              disabled
                ? 'text-muted'
                : 'cursor-pointer text-muted transition-colors duration-300 hover:border-brass hover:text-brass',
            )}
          >
            {t('admin.chooseFile')}
          </label>

          <p className="mt-3 text-xs text-muted">
            {t('admin.imageLimits', { max: formatBytes(MAX_IMAGE_BYTES) })}
          </p>
        </div>
      )}

      <input
        id={inputId}
        type="file"
        disabled={disabled || busy}
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={(event) => {
          if (event.target.files) void accept(event.target.files)
          // Clear it, or choosing the same file twice in a row fires nothing.
          event.target.value = ''
        }}
        className="sr-only"
      />

      {busy && (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          {t('admin.uploading', { count: 1 })}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 border border-hairline bg-surface p-3 text-xs text-ink">
          {error}
        </p>
      )}
    </div>
  )
}
