import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type SectionProps = {
  children: ReactNode
  className?: string
  /** Vertical rhythm. Sections breathe more on desktop than on mobile. */
  spacing?: 'sm' | 'md' | 'lg'
  /** Draw a 1px hairline along the top edge instead of using a boxed card. */
  bordered?: boolean
  id?: string
  'aria-labelledby'?: string
  /** For a section whose heading is rendered by its parent page instead. */
  'aria-label'?: string
}

const SPACING = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-24 md:py-32',
} as const

/**
 * A vertical band of the page. Separation between sections comes from space
 * and 1px hairlines — never from shadows, cards or background blocks.
 */
export function Section({
  children,
  className,
  spacing = 'md',
  bordered = false,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(SPACING[spacing], bordered && 'border-t border-hairline', className)}
      {...rest}
    >
      {children}
    </section>
  )
}
