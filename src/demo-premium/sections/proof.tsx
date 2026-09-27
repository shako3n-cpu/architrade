import type { CSSProperties } from 'react'
import { CLIENT_NAMES, FIGURES } from '../content'

/**
 * The proof, straight after the promise: three figures counted from the
 * company data, and the names of the people who have already bought — set as
 * type in the serif, not as a wall of other companies' logos, so the strip
 * stays in the page's voice.
 */
export function Proof() {
  return (
    <section className="lp-proof" aria-label="ARCHTRADE in figures">
      <div className="lp-wrap">
        <dl className="lp-figures">
          {FIGURES.map(({ value, label }, i) => (
            <div key={label} className="lp-figure" data-reveal="" style={{ '--i': i } as CSSProperties}>
              <dt className="lp-label">{label}</dt>
              <dd className="lp-figure-value">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="lp-clients" data-reveal="" style={{ '--i': 3 } as CSSProperties}>
          <p className="lp-label">Furnished for</p>
          <ul className="lp-client-list">
            {CLIENT_NAMES.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
