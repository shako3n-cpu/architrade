import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * One contact channel, drawn as a wide row: brand chip, label, detail line.
 *
 * The chip colour is passed as an inline style rather than a Tailwind class on
 * purpose — #25D366 and #0084FF are fixed trademarks, not part of the ARCHTRADE
 * palette, and putting them in the theme would invite someone to reuse them as
 * house colours.
 */
export function ChannelButton({
  href,
  icon: Icon,
  label,
  detail,
  brandColor,
  tone = 'light',
  className,
}: {
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** What the channel is. Always translated — never a hard-coded string. */
  label: string
  /** The number, handle or address underneath. Language-neutral. */
  detail?: string
  /** Official brand colour for the chip. Omit for a neutral chip. */
  brandColor?: string
  /**
   * "light" for the off-white page, "dark" for the charcoal contact band.
   * The page palette is built for a light background, so `muted` and `brass`
   * are unreadable on charcoal — hence a second set rather than opacity.
   */
  tone?: 'light' | 'dark'
  className?: string
}) {
  const dark = tone === 'dark'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-3.5 border px-4 py-3 transition-colors duration-300',
        dark
          ? 'border-white/15 bg-white/[0.04] hover:border-brass-on-ink'
          : 'border-hairline bg-background hover:border-brass',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-xs"
        style={{ backgroundColor: brandColor ?? (dark ? '#ffffff1f' : 'var(--at-ink)') }}
      >
        <Icon className="size-[1.125rem]" style={{ color: '#fff' }} />
      </span>

      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'text-sm transition-colors duration-300',
            dark
              ? 'text-background group-hover:text-brass-on-ink'
              : 'text-ink group-hover:text-brass',
          )}
        >
          {label}
        </span>
        {detail && (
          <span className={cn('truncate text-xs', dark ? 'text-ink-muted' : 'text-muted')}>
            {detail}
          </span>
        )}
      </span>
    </a>
  )
}
