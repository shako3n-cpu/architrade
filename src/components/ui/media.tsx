import { cn } from '@/lib/utils'

type MediaProps = {
  src: string
  /**
   * Required, and never decorative — every catalogue image describes a real
   * piece of furniture. Write what is in the photograph, not "product image".
   */
  alt: string
  /** Fixed aspect box prevents any layout shift while the photo loads. */
  ratio?: keyof typeof RATIOS
  /** Above-the-fold images (the hero) must set this to "eager". */
  loading?: 'lazy' | 'eager'
  /** Adds the slow hover zoom. Parent must carry the `group` class. */
  zoom?: boolean
  className?: string
  imgClassName?: string
  sizes?: string
}

const RATIOS = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  tall: 'aspect-[2/3]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  panorama: 'aspect-[21/9]',
} as const

/**
 * The only way images enter the page.
 *
 * Guarantees on every photograph site-wide:
 *   - a reserved aspect-ratio box, so nothing shifts while loading
 *   - lazy loading by default, async decoding
 *   - a surface-coloured placeholder instead of a white flash
 *   - real alt text (the prop is required)
 */
export function Media({
  src,
  alt,
  ratio = 'landscape',
  loading = 'lazy',
  zoom = false,
  className,
  imgClassName,
  sizes,
}: MediaProps) {
  return (
    <div className={cn('relative overflow-hidden bg-surface', RATIOS[ratio], className)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        // Hero images should not wait behind lazy work in the queue.
        fetchPriority={loading === 'eager' ? 'high' : undefined}
        sizes={sizes}
        className={cn('h-full w-full object-cover', zoom && 'at-zoom', imgClassName)}
      />
    </div>
  )
}
