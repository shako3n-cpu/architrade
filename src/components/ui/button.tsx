import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

/**
 * Button styles.
 *
 * House rules baked in: radius capped at 2px, no shadows, no gradients, and a
 * 300ms transition on every state change. Bronze is the only accent — "solid"
 * is the single loud element on a page, so use one per view.
 *
 * WHY THE HOVER GOES DARKER, NOT BRIGHTER
 *   Bronze lifting to a lighter bronze is the standard move and it reads as
 *   cheap — the button appears to switch on. Bronze settling into graphite
 *   reads as weight, and it borrows a colour the page already owns rather
 *   than inventing a fifth tone. The outline button fills with the same
 *   graphite, so both buttons resolve to the same place under the cursor.
 *
 *   500 rather than 400, and tracking pulled in from 0.14em to 0.11em. At
 *   uppercase 13px the looser spacing read as an eyebrow label; a button
 *   should read as an object you press.
 */
const buttonVariants = cva(
  // Shared base. focus-visible ring is inherited from the global :focus-visible
  // rule, so it stays consistent with links and inputs.
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xs select-none',
    'font-body text-[0.8125rem] font-medium uppercase tracking-[0.11em] whitespace-nowrap',
    'transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
    'disabled:pointer-events-none disabled:opacity-40',
    "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.25]",
  ),
  {
    variants: {
      variant: {
        /** Primary call to action. Bronze fill, settling to graphite. */
        solid: 'bg-brass text-background hover:bg-ink',
        /**
         * Secondary. A hairline that fills with graphite rather than merely
         * changing colour — an outline button that only tints its text on
         * hover never feels like it was pressed.
         */
        outline:
          'border border-hairline text-ink hover:border-ink hover:bg-ink hover:text-background',
        /** Tertiary. Text only, for use inside dense layouts. */
        ghost: 'text-muted hover:text-ink',
        /** Inline text link with a brass underline on hover. */
        link: 'text-brass underline-offset-[6px] hover:underline p-0 h-auto',
      },
      size: {
        // 44px on touch screens, 40px from `sm` up.
        sm: 'h-11 px-5 sm:h-10',
        md: 'h-12 px-8',
        lg: 'h-14 px-10',
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
