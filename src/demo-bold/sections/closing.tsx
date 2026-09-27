import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '@/config/site'
import { StartProject } from '../cta'
import { Mesh } from '../mesh'

const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * The close: on the light band, one large round-cornered panel carrying the page's
 * richest gradient — bronze through amber into warm charcoal, drifting — with
 * the call to action on it, and the address for anyone who would rather write.
 */
export function Closing() {
  return (
    <section className="bd-closing bd-light" aria-labelledby="bd-closing-title">
      <div className="bd-wrap">
        <div className="bd-closing-panel bd-dark" data-mesh="" data-reveal="">
          <Mesh tone="close" />
          <p className="bd-chip" data-reveal="" style={order(1)}>
            <span className="bd-chip-dot" aria-hidden="true" />
            Start a project
          </p>
          <h2 id="bd-closing-title" className="bd-display bd-closing-title" data-reveal="" style={order(2)}>
            Bring us <span className="bd-accent">the drawing.</span>
          </h2>
          <p className="bd-body bd-closing-body" data-reveal="" style={order(3)}>
            Send the plan, the headcount and the date you need the room. We come back with a named schedule — house,
            model, finish and quantity — and samples in your hands before anything is ordered.
          </p>
          <div className="bd-actions bd-actions-center" data-reveal="" style={order(4)}>
            <StartProject />
            <a href={`mailto:${CONTACT.email}`} className="bd-btn-glass">
              {CONTACT.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bd-footer bd-light">
      <div className="bd-wrap bd-footer-inner">
        <a href="#top" className="bd-wordmark">
          ARCHTRADE
        </a>
        <p className="bd-label">Contract furniture · Tbilisi · © {new Date().getFullYear()}</p>
        <Link to="/en/catalog" className="bd-footer-link">
          Visit the catalogue
        </Link>
      </div>
    </footer>
  )
}
