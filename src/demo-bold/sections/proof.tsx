import { useRef, type CSSProperties } from 'react'
import { CLIENT_NAMES, FIGURES } from '../content'
import { Mesh } from '../mesh'
import { useCountUp } from '../motion'

/**
 * The proof, still on the dark: three frosted cards with the figures —
 * counted from the company data, counting up as they arrive — and the client
 * list running past as a marquee, set as type rather than logos.
 */
export function Proof() {
  return (
    <section id="clients" className="bd-proof bd-dark" data-mesh="" aria-label="ARCHTRADE in figures">
      <Mesh tone="proof" />
      <div className="bd-wrap">
        <dl className="bd-stats">
          {FIGURES.map((figure, i) => (
            <Figure key={figure.label} {...figure} index={i} />
          ))}
        </dl>
        <div className="bd-marquee" data-reveal="" style={{ '--i': 3 } as CSSProperties}>
          <p className="bd-label">Furnished for</p>
          <div className="bd-marquee-window">
            <div className="bd-marquee-track">
              <ul className="bd-marquee-list">
                {CLIENT_NAMES.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              {/* The second copy is what the first scrolls into; a screen
                  reader hears the list once. */}
              <ul className="bd-marquee-list" aria-hidden="true">
                {CLIENT_NAMES.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Figure({ value, label, note, index }: { value: number; label: string; note: string; index: number }) {
  const card = useRef<HTMLDivElement>(null)
  const shown = useCountUp(value, card)
  return (
    <div ref={card} className="bd-glass bd-stat" data-reveal="" style={{ '--i': index } as CSSProperties}>
      <dt className="bd-label">{label}</dt>
      <dd className="bd-stat-value">
        {/* The true figure for assistive technology; the counting one is decoration. */}
        <span className="bd-sr">{value}</span>
        <span className="bd-gradient-text" aria-hidden="true">
          {shown}
        </span>
      </dd>
      <dd className="bd-stat-note">{note}</dd>
    </div>
  )
}
