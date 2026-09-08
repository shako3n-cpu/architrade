import { useCallback, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  centredCrop,
  clampCrop,
  loadImage,
  PRODUCT_ASPECT,
  renderCrop,
  type CropBox,
} from '@/lib/image-crop'
import { formatBytes } from '@/lib/storage'

/**
 * ============================================================================
 * CHOOSING WHAT STAYS IN THE PICTURE
 * ----------------------------------------------------------------------------
 * Opens when an uploaded photograph is not the shape the catalogue draws. The
 * crop was always happening — `object-cover` on a 3:4 card silently takes the
 * middle — so this does not add a step so much as reveal one, and hand it over.
 *
 * THE WHOLE PICTURE IS SHOWN, WITH THE FRAME ON TOP
 *   The other common design puts a fixed window in the middle and slides the
 *   photograph behind it. It looks better and it hides the thing being decided:
 *   you cannot see what you are losing, only what you are keeping. Here the
 *   discarded parts stay on screen, dimmed, because "the arms of the sofa are
 *   about to be cut off" is the entire question.
 *
 * IT OPENS ON THE CENTRE
 *   Which is exactly what would have happened without this dialog. Somebody who
 *   presses Save immediately gets the old behaviour, deliberately — the dialog
 *   is there to make a different choice possible, not to demand one.
 * ============================================================================
 */
export function ImageCropper({
  file,
  aspect = PRODUCT_ASPECT,
  onCancel,
  onCropped,
}: {
  /** The picture as chosen. Null closes the dialog. */
  file: File | null
  aspect?: number
  onCancel: () => void
  onCropped: (file: File) => void
}) {
  const { t } = useTranslation()

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [box, setBox] = useState<CropBox | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /*
   * The frame is MEASURED, not read from a ref during render.
   *
   * Reading `frameRef.current` while rendering gives null on the first pass —
   * the element does not exist yet — so the scale came out as 1, the crop box
   * was drawn at source-pixel size, and nothing re-rendered to correct it. It
   * is observed instead, which also keeps it right when the window resizes.
   */
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null)
  const dragRef = useRef<{ pointerX: number; pointerY: number; box: CropBox } | null>(null)

  const measureFrame = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const read = () => {
      const rect = node.getBoundingClientRect()
      setFrameSize({ width: rect.width, height: rect.height })
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* Loaded whenever a new file arrives, and cleared with it. */
  useEffect(() => {
    if (!file) {
      setImage(null)
      setBox(null)
      return
    }

    let live = true
    setError(null)
    /*
     * Reset, and this is not belt and braces.
     *
     * `busy` is set when a crop is saved and there is nothing after that to
     * clear it: the successful path hands the file to the parent, which closes
     * the dialog by dropping the file — but THIS component stays mounted, so
     * the flag survived. The first crop worked and every one after it opened
     * with both buttons already disabled.
     */
    setBusy(false)

    void loadImage(file)
      .then((loaded) => {
        if (!live) return
        setImage(loaded)
        setBox(centredCrop(loaded, aspect))
      })
      .catch(() => {
        if (live) setError(t('admin.cropUnreadable'))
      })

    return () => {
      live = false
    }
  }, [file, aspect, t])

  /** Display pixels per source pixel, so the whole picture fits the frame. */
  const scale =
    image && frameSize
      ? Math.min(
          frameSize.width / image.naturalWidth,
          frameSize.height / image.naturalHeight,
        )
      : 0

  const onPointerDown = (event: React.PointerEvent) => {
    if (!box) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, box }
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || !image) return

    if (!scale) return
    setBox(
      clampCrop(image, {
        ...drag.box,
        x: drag.box.x + (event.clientX - drag.pointerX) / scale,
        y: drag.box.y + (event.clientY - drag.pointerY) / scale,
      }),
    )
  }

  const onPointerUp = (event: React.PointerEvent) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
  }

  /*
   * The zoom slider works in source pixels, not in a multiplier. The largest
   * legal box is the whole picture in the target shape; the slider picks a
   * fraction of it and the box grows or shrinks about its own centre, so
   * zooming does not walk the subject out of frame.
   */
  const maxHeight = image ? Math.min(image.naturalHeight, image.naturalWidth / aspect) : 0
  const zoom = box && maxHeight ? box.height / maxHeight : 1

  const setZoom = (next: number) => {
    if (!image || !box) return
    const height = maxHeight * next
    const width = height * aspect
    setBox(
      clampCrop(image, {
        width,
        height,
        x: box.x + (box.width - width) / 2,
        y: box.y + (box.height - height) / 2,
      }),
    )
  }

  const save = async () => {
    if (!image || !box || !file) return
    setBusy(true)
    setError(null)

    try {
      onCropped(await renderCrop(image, box, file.name))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setBusy(false)
    }
  }

  return (
    <Dialog.Root open={file !== null} onOpenChange={(next) => !next && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />

        <Dialog.Content
          aria-describedby="crop-description"
          className="fixed top-1/2 left-1/2 z-50 max-h-[92dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-hairline bg-background p-6"
        >
          <Dialog.Title className="font-heading text-lg text-ink">
            {t('admin.cropTitle')}
          </Dialog.Title>
          <Dialog.Description id="crop-description" className="mt-2 text-sm text-muted">
            {t('admin.cropBody')}
          </Dialog.Description>

          {error && (
            <p role="alert" className="mt-4 border border-hairline bg-surface p-3 text-sm text-ink">
              {error}
            </p>
          )}

          {/* Fixed height so the dialog does not jump between a portrait and a
              landscape photograph, which would move the buttons under the
              cursor between one upload and the next. */}
          <div
            ref={measureFrame}
            className="relative mt-5 grid h-72 place-items-center overflow-hidden bg-surface select-none"
          >
            {image && box && scale > 0 && (
              <div
                className="relative"
                style={{ width: image.naturalWidth * scale, height: image.naturalHeight * scale }}
              >
                <img
                  src={image.src}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-fill"
                />

                {/* What is being thrown away, dimmed rather than hidden. */}
                <div
                  className="pointer-events-none absolute inset-0 bg-ink/55"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                      ${(box.x * scale * 100) / (image.naturalWidth * scale)}% ${(box.y * scale * 100) / (image.naturalHeight * scale)}%,
                      ${((box.x + box.width) * scale * 100) / (image.naturalWidth * scale)}% ${(box.y * scale * 100) / (image.naturalHeight * scale)}%,
                      ${((box.x + box.width) * scale * 100) / (image.naturalWidth * scale)}% ${((box.y + box.height) * scale * 100) / (image.naturalHeight * scale)}%,
                      ${(box.x * scale * 100) / (image.naturalWidth * scale)}% ${((box.y + box.height) * scale * 100) / (image.naturalHeight * scale)}%,
                      ${(box.x * scale * 100) / (image.naturalWidth * scale)}% ${(box.y * scale * 100) / (image.naturalHeight * scale)}%)`,
                  }}
                />

                <div
                  role="slider"
                  aria-label={t('admin.cropFrameLabel')}
                  aria-valuenow={Math.round(box.x)}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(image.naturalWidth - box.width)}
                  tabIndex={0}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onKeyDown={(event) => {
                    // Arrow keys, because a trackpad drag is not the only way
                    // somebody should be able to move this.
                    const step = event.shiftKey ? 40 : 8
                    const moves: Record<string, [number, number]> = {
                      ArrowLeft: [-step, 0],
                      ArrowRight: [step, 0],
                      ArrowUp: [0, -step],
                      ArrowDown: [0, step],
                    }
                    const move = moves[event.key]
                    if (!move) return
                    event.preventDefault()
                    setBox(clampCrop(image, { ...box, x: box.x + move[0], y: box.y + move[1] }))
                  }}
                  className="absolute cursor-move border-2 border-background shadow-[0_0_0_1px_rgba(0,0,0,0.4)] focus:outline-2 focus:outline-brass"
                  style={{
                    left: box.x * scale,
                    top: box.y * scale,
                    width: box.width * scale,
                    height: box.height * scale,
                  }}
                />
              </div>
            )}
          </div>

          <label className="mt-5 block">
            <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
              {t('admin.cropZoom')}
            </span>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-2 w-full accent-brass"
            />
          </label>

          <p className="mt-3 text-xs text-muted">
            {image && box
              ? t('admin.cropOutput', {
                  width: Math.round(Math.min(box.width, 1200)),
                  height: Math.round(Math.min(box.width, 1200) / aspect),
                  from: formatBytes(file?.size ?? 0),
                })
              : ''}
          </p>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              {t('admin.cancel')}
            </Button>
            <Button type="button" variant="solid" onClick={() => void save()} disabled={busy || !box}>
              {t('admin.cropSave')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
