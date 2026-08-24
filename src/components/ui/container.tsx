import { cn } from '@/lib/utils'
import type { ElementType, ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  className?: string
  /** Render as a different tag when the semantics call for it. */
  as?: ElementType
  /**
   * "default" — standard reading width, used by most sections.
   * "wide"    — near-full width, for large photography grids.
   * "narrow"  — long-form text (legal pages, collection stories).
   */
  width?: 'default' | 'wide' | 'narrow'
}

const WIDTHS = {
  default: 'max-w-[90rem]',
  wide: 'max-w-[110rem]',
  narrow: 'max-w-[48rem]',
} as const

/**
 * Horizontal page gutter + max width. Mobile-first: 20px of breathing room on
 * phones, opening up to 48px on large screens.
 */
export function Container({
  children,
  className,
  as: Tag = 'div',
  width = 'default',
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', WIDTHS[width], className)}>
      {children}
    </Tag>
  )
}
