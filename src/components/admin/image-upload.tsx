import { useCallback, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Loader2, MousePointer2, Star, X } from 'lucide-react'
import {
  MAX_IMAGE_BYTES,
  ACCEPTED_IMAGE_TYPES,
  deleteProductImage,
  describeRejection,
  formatBytes,
  uploadProductImage,
} from '@/lib/storage'
import { explainWriteFailure } from '@/lib/admin-queries'
import { cn } from '@/lib/utils'

/**
 * Photograph upload — drag a file in, or click to choose one.
 *
 * ORDER MATTERS AND IS VISIBLE. The first photograph is the cover: it is the
 * one on the category grid and the home page, and the second is the one that
 * appears on hover. That is invisible in a plain list of thumbnails, so the
 * first is labelled and any other can be promoted with one click.
 *
 * Files go straight to Supabase Storage as they are dropped, before the
 * product is saved. That is the simpler behaviour to build and the simpler one
 * to explain — what you see in the box is what is stored — at the cost of
 * leaving a file in the bucket if someone uploads and then abandons the form.
 * A stray photograph is cheap; a form that loses a slow upload when it is
 * submitted is not.
 */
export function ImageUpload({
  images,
  onChange,
  disabled = false,
}: {
  /** Full public URLs. First entry is the cover. */
  images: string[]
  onChange: (images: string[]) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const accept = async (files: FileList | File[]) => {
    setError(null)
    const chosen = Array.from(files)
    if (chosen.length === 0) return

    // Check everything before uploading anything, so a bad file in a batch is
    // reported up front rather than after three good ones have gone up.
    for (const file of chosen) {
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
    }

    setBusy((n) => n + chosen.length)

    const uploaded: string[] = []
    try {
      for (const file of chosen) {
        uploaded.push(await uploadProductImage(file))
        setBusy((n) => n - 1)
      }
      onChange([...images, ...uploaded])
    } catch (cause) {
      // Anything already uploaded in this batch still counts — losing it would
      // mean re-picking files that transferred perfectly well.
      if (uploaded.length > 0) onChange([...images, ...uploaded])
      setBusy(0)

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
    }
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragging(false)
      if (!disabled) void accept(event.dataTransfer.files)
    },
    // `accept` is recreated every render; listing it would defeat the memo and
    // it closes over the values it needs anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, images],
  )

  const remove = (url: string) => {
    onChange(images.filter((item) => item !== url))
    // Best-effort tidy-up; see the note in storage.ts on why this is quiet.
    void deleteProductImage(url)
  }

  /*
   * THE SECOND PHOTOGRAPH IS THE HOVER ONE, AND NOW IT SAYS SO.
   *
   * `productHoverImage` in src/lib/localize.ts reads `images[1]`, so position
   * has always decided which picture appears when a visitor points at a card.
   * The box labelled only the cover, which left the single most-noticed effect
   * on the catalogue grid as an unlabelled side effect of upload order — the
   * only way to choose it was to promote pictures to cover until the right one
   * happened to land second.
   *
   * So the second slot is labelled like the first, and any picture can be sent
   * there directly.
   */
  const makeHover = (url: string) => {
    const rest = images.filter((item) => item !== url)
    // Splice at 1, not unshift: sending a picture to hover must never quietly
    // change the cover, which is the more consequential of the two.
    onChange([...rest.slice(0, 1), url, ...rest.slice(1)])
  }

  const makeCover = (url: string) => {
    onChange([url, ...images.filter((item) => item !== url)])
  }

  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] text-muted uppercase">{t('admin.photos')}</p>

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

        <p className="mt-3 text-sm text-ink">{t('admin.dropHere')}</p>

        <label
          htmlFor={inputId}
          className={cn(
            'mt-3 inline-block border border-hairline px-4 py-2 text-xs tracking-[0.12em] uppercase',
            disabled
              ? 'text-muted'
              : 'cursor-pointer text-muted transition-colors duration-300 hover:border-brass hover:text-brass',
          )}
        >
          {t('admin.chooseFiles')}
        </label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          disabled={disabled}
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={(event) => {
            if (event.target.files) void accept(event.target.files)
            // Clear it, or choosing the same file twice in a row fires nothing.
            event.target.value = ''
          }}
          className="sr-only"
        />

        <p className="mt-3 text-xs text-muted">
          {t('admin.imageLimits', { max: formatBytes(MAX_IMAGE_BYTES) })}
        </p>
      </div>

      {busy > 0 && (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          {t('admin.uploading', { count: busy })}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 border border-hairline bg-surface p-3 text-xs text-ink">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="group relative">
              <div className="aspect-square overflow-hidden border border-hairline bg-surface">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>

              {index < 2 ? (
                <span className="absolute top-1.5 left-1.5 bg-background/95 px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-brass uppercase">
                  {t(index === 0 ? 'admin.cover' : 'admin.hoverShot')}
                </span>
              ) : (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    title={t('admin.makeCover')}
                    aria-label={t('admin.makeCover')}
                    className="inline-flex size-6 items-center justify-center bg-background/95 text-muted transition-colors duration-300 hover:text-brass"
                  >
                    <Star aria-hidden="true" className="size-3.5 stroke-[1.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => makeHover(url)}
                    title={t('admin.makeHover')}
                    aria-label={t('admin.makeHover')}
                    className="inline-flex size-6 items-center justify-center bg-background/95 text-muted transition-colors duration-300 hover:text-brass"
                  >
                    <MousePointer2 aria-hidden="true" className="size-3.5 stroke-[1.5]" />
                  </button>
                </span>
              )}

              {/* The cover can be sent to the hover slot too — swapping the
                  two is otherwise a three-step shuffle through a third
                  picture. Only offered when there IS a second slot to fill. */}
              {index === 0 && images.length > 1 && (
                <button
                  type="button"
                  onClick={() => makeHover(url)}
                  title={t('admin.makeHover')}
                  aria-label={t('admin.makeHover')}
                  className="absolute bottom-1.5 left-1.5 inline-flex size-6 items-center justify-center bg-background/95 text-muted transition-colors duration-300 hover:text-brass"
                >
                  <MousePointer2 aria-hidden="true" className="size-3.5 stroke-[1.5]" />
                </button>
              )}

              {index === 1 && (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  title={t('admin.makeCover')}
                  aria-label={t('admin.makeCover')}
                  className="absolute bottom-1.5 left-1.5 inline-flex size-6 items-center justify-center bg-background/95 text-muted transition-colors duration-300 hover:text-brass"
                >
                  <Star aria-hidden="true" className="size-3.5 stroke-[1.5]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => remove(url)}
                title={t('admin.removePhoto')}
                aria-label={t('admin.removePhoto')}
                className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center bg-background/95 text-muted transition-colors duration-300 hover:text-ink"
              >
                <X aria-hidden="true" className="size-3.5 stroke-[1.5]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
