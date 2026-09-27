import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT_PATH } from './content'
import { useMagnetic } from './motion'

/**
 * The call to action: a bronze-to-amber pill with a glow under it, magnetic
 * on a mouse (see useMagnetic), with a sheen that follows the pointer.
 */
export function StartProject({ size = 'large' }: { size?: 'large' | 'small' }) {
  const magnet = useMagnetic<HTMLSpanElement>(size === 'small' ? 4 : 6)
  return (
    <span ref={magnet} className="bd-magnet">
      <Link to={CONTACT_PATH} className="bd-btn" data-size={size}>
        <span className="bd-btn-full">Start a project</span>
        {/* The pill's version on the narrowest phones, where the full label
            and the wordmark do not both fit. */}
        {size === 'small' && (
          <span className="bd-btn-short" aria-hidden="true">
            Enquire
          </span>
        )}
        <Arrow />
      </Link>
    </span>
  )
}

/** The quieter partner to the call to action: a frosted pill. */
export function GlassLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="bd-btn-glass">
      {children}
    </a>
  )
}

export function Arrow() {
  return (
    <svg className="bd-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
