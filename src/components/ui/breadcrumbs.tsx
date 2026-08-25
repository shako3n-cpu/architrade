import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * One step in the trail. `to` is an app path WITHOUT the language prefix —
 * this component adds it, so callers never build /ka/... by hand.
 */
export type Crumb = {
  label: string
  /** Omit on the last step: where you already are is not a link. */
  to?: string
}

/**
 * Breadcrumb trail — Home > Living room > Modern sofa.
 *
 * An ordered list inside a labelled <nav>, which is what a screen reader
 * expects; the separators are decorative and hidden from it, because hearing
 * "greater-than" between every step is noise.
 *
 * The final step is never a link even if a caller passes one, since a link to
 * the current page is a dead control.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const { localePath, t } = useLanguage()

  if (items.length === 0) return null

  return (
    <nav aria-label={t('nav.breadcrumbLabel')} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {items.map((item, index) => {
          const last = index === items.length - 1

          return (
            <Fragment key={`${index}-${item.label}`}>
              <li className="flex items-center">
                {item.to && !last ? (
                  <Link
                    to={localePath(item.to)}
                    className="text-muted transition-colors duration-300 hover:text-brass"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    // Marks the current page for assistive technology, so the
                    // trail says where you are as well as how you got here.
                    aria-current={last ? 'page' : undefined}
                    className={cn(last ? 'text-ink' : 'text-muted')}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {!last && (
                <li aria-hidden="true" className="flex items-center">
                  <ChevronRight className="size-3.5 shrink-0 stroke-[1.25] text-muted/60" />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
