import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/**
 * Small uppercase kicker with wide letter-spacing — the signature label of
 * this typographic system. Sits above section headings and marks spec keys.
 *
 * Named "Eyebrow" rather than "Label" so it never collides with the form
 * <Label> that shadcn/ui installs.
 */
export function Eyebrow({
  children,
  className,
  as: Tag = 'span',
}: {
  children: ReactNode
  className?: string
  as?: 'span' | 'p' | 'div'
}) {
  return <Tag className={cn('at-label block', className)}>{children}</Tag>
}
