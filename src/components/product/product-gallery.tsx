import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Media } from '@/components/ui/media'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * The product's photographs: one large image and a strip of thumbnails.
 *
 * Thumbnails respond to hover as well as click, so a visitor on a desktop can
 * skim the set without a single click, while the arrows over the main image
 * cover touch screens where hover does not exist. Both drive the same state,
 * so the two never disagree.
 *
 * MOUNTING: the caller passes key={product.id}. Navigating from one piece to
 * another therefore remounts this and resets the selection, instead of leaving
 * the new product showing its third photograph first.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const { t } = useLanguage()
  const [active, setActive] = useState(0)

  // A row saved with no photographs gets a quiet box, never a broken icon.
  if (images.length === 0) {
    return <div aria-hidden="true" className="aspect-square w-full bg-surface" />
  }

  const many = images.length > 1
  const step = (delta: number) => setActive((i) => (i + delta + images.length) % images.length)

  return (
    <div>
      <div className="relative">
        {/* Keyed so each swap re-runs the fade rather than snapping over. */}
        <Media
          key={active}
          src={images[active]}
          alt={alt}
          ratio="square"
          loading="eager"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-in fade-in duration-500"
        />

        {many && (
          <>
            <Arrow side="left" label={t('product.previousImage')} onClick={() => step(-1)} />
            <Arrow side="right" label={t('product.nextImage')} onClick={() => step(1)} />

            {/* Position in the set, for anyone who cannot see the thumbnails. */}
            <p className="absolute right-3 bottom-3 bg-background/90 px-2.5 py-1 text-[11px] tracking-[0.12em] text-muted tabular-nums">
              {t('product.imageCounter', { current: active + 1, total: images.length })}
            </p>
          </>
        )}
      </div>

      {many && (
        <ul
          aria-label={t('product.galleryLabel')}
          className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5"
        >
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                // Hover previews on a pointer device; the click still commits,
                // so a keyboard or touch user reaches the same place.
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                aria-label={t('product.viewImage', { index: index + 1 })}
                aria-pressed={index === active}
                className={cn(
                  'block w-full cursor-pointer border transition-colors duration-300',
                  index === active ? 'border-brass' : 'border-hairline hover:border-muted',
                )}
              >
                <img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full bg-surface object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** One of the two overlay arrows on the main image. */
function Arrow({
  side,
  label,
  onClick,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center',
        'rounded-xs bg-background/90 text-ink transition-colors duration-300 hover:bg-background hover:text-brass',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon aria-hidden="true" className="size-5 stroke-[1.25]" />
    </button>
  )
}
