import { Link } from 'react-router-dom'
import { CONTACT_PATH } from './content'
import { useMagnetic } from './motion'

/**
 * The page's one call to action, in two weights. The solid one is magnetic:
 * it leans a few pixels toward the pointer and carries a soft brass light
 * under it (see useMagnetic and .lp-btn in the stylesheet).
 */
export function StartProject({ tone = 'ink', size = 'large' }: { tone?: 'ink' | 'ivory'; size?: 'large' | 'small' }) {
  const magnet = useMagnetic<HTMLSpanElement>(size === 'small' ? 4 : 6)
  return (
    <span ref={magnet} className="lp-magnet">
      <Link to={CONTACT_PATH} className="lp-btn" data-tone={tone} data-size={size}>
        <span className="lp-btn-full">Start a project</span>
        {/* The pill's version on the narrowest phones, where the full label and the wordmark do not both fit. */}
        {size === 'small' && (
          <span className="lp-btn-short" aria-hidden="true">
            Enquire
          </span>
        )}
        <Arrow />
      </Link>
    </span>
  )
}

export function Arrow() {
  return (
    <svg className="lp-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}
