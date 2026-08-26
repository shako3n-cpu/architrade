import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

/**
 * Button styles.
 *
 * House rules baked in: radius capped at 2px, no shadows, no gradients, and a
 * 300ms transition on every state change. Brass is the only accent — "solid"
 * is the single loud element on a page, so use one per view.
 */
const buttonVariants = cva(
  // Shared base. focus-visible ring is inherited from the global :focus-visible
  // rule, so it stays consistent with links and inputs.
  cn(
    'inline-flex items-center justify-center gap-2.5 rounded-xs',
    'font-body text-[0.8125rem] font-normal uppercase tracking-[0.14em] whitespace-nowrap',
    'transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
    'disabled:pointer-events-none disabled:opacity-40',
    "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.25]",
  ),
  {
    variants: {
      variant: {
        /** Primary call to action. Brass fill, dark text. */
        solid: 'bg-brass text-background hover:bg-brass-bright',
        /** Secondary. Hairline outline that warms to brass on hover. */
        outline: 'border border-hairline text-ink hover:border-brass hover:text-brass',
        /** Tertiary. Text only, for use inside dense layouts. */
        ghost: 'text-muted hover:text-ink',
        /** Inline text link with a brass underline on hover. */
        link: 'text-brass underline-offset-[6px] hover:underline p-0 h-auto',
      },
      size: {
        // 44px on touch screens, 40px from `sm` up.
        sm: 'h-11 px-5 sm:h-10',
        md: 'h-12 px-7',
        lg: 'h-14 px-9',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Render the child element instead of a <button>, keeping the styles.
     * Use for router links:  <Button asChild><Link to="...">…</Link></Button>
     */
    asChild?: boolean
  }

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
