import { cn } from '@/lib/utils'
import { Eyebrow } from './eyebrow'
import type { ReactNode } from 'react'

type SectionHeadingProps = {
  /** Small uppercase kicker above the title. Optional. */
  eyebrow?: string
  title: string
  /** One supporting sentence under the title. Optional. */
  description?: string
  /** Usually a "view all" link, pinned right on desktop. */
  action?: ReactNode
  /** Heading level — pick the one the document outline needs. */
  as?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center'
  className?: string
  id?: string
}

const SIZES = {
  h1: 'text-4xl md:text-6xl lg:text-7xl',
  h2: 'text-3xl md:text-4xl lg:text-5xl',
  h3: 'text-2xl md:text-3xl',
} as const

/**
 * Standard section header: eyebrow, title, optional description, optional
 * right-aligned action. Keeps every section on the page typographically
 * identical without repeating the classes.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Tag = 'h2',
  align = 'left',
  className,
  id,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        centered && 'md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'text-center')}>
        {eyebrow && <Eyebrow className={cn('mb-4 text-brass')}>{eyebrow}</Eyebrow>}

        <Tag id={id} className={cn(SIZES[Tag], 'text-ink')}>
          {title}
        </Tag>

        {description && <p className="mt-5 text-base text-muted md:text-lg">{description}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
