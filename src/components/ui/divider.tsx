import { cn } from '@/lib/utils'

/**
 * A 1px hairline. This is the site's only separator — it replaces the borders,
 * cards and drop shadows a more conventional layout would reach for.
 *
 * Decorative by default, so screen readers skip it. Pass `semantic` when the
 * rule genuinely marks a change of topic.
 */
export function Divider({
  className,
  orientation = 'horizontal',
  semantic = false,
}: {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  semantic?: boolean
}) {
  return (
    <hr
      aria-hidden={semantic ? undefined : true}
      role={orientation === 'vertical' ? 'separator' : undefined}
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      className={cn(
        'border-0 bg-hairline',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  )
}
