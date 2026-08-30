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

/*
 * Three steps, not two, and the new one is the phone.
 *
 * These were desktop values applied unedited to every width: `lg` put 96px
 * above and below every band on a 390px screen, which came to 960px on the
 * home page — 1.2 screens of nothing but padding. Generous separation is
 * right at 1440px, where it divides wide bands that would otherwise run
 * together. On a single-column phone the sections are already unmistakably
 * separate, so the same figure only pushes content off the bottom.
 *
 * The `md` values are unchanged, so nothing above a tablet moves.
 */
const SPACING = {
  sm: 'py-10 sm:py-12 md:py-16',
  md: 'py-12 sm:py-16 md:py-24',
  lg: 'py-16 sm:py-20 md:py-32',
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
