import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '@/config/site'
import { StartProject } from '../cta'

const order = (i: number) => ({ '--i': i }) as CSSProperties

/** The close: one sentence, one button, and the address for anyone who would rather write. */
export function Closing() {
  return (
    <section className="lp-closing" aria-labelledby="lp-closing-title">
      <div className="lp-wrap">
        <div className="lp-closing-frame at-survey">
          <p className="lp-label" data-reveal="">
            Start a project
          </p>
          <h2 id="lp-closing-title" className="lp-display" data-reveal="" style={order(1)}>
            Bring us the drawing.
          </h2>
          <p className="lp-body lp-closing-body" data-reveal="" style={order(2)}>
            Send the plan, the headcount and the date you need the room. We come back with a named schedule — house,
            model, finish and quantity — and samples in your hands before anything is ordered.
          </p>
          <div className="lp-actions lp-actions-center" data-reveal="" style={order(3)}>
            <StartProject />
            <a href={`mailto:${CONTACT.email}`} className="lp-textlink">
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
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer-inner">
        <a href="#top" className="lp-wordmark">
          ARCHTRADE
        </a>
        <p className="lp-label">Contract furniture · Tbilisi · © {new Date().getFullYear()}</p>
        <Link to="/en/catalog" className="lp-textlink lp-label">
          Visit the catalogue
        </Link>
      </div>
    </footer>
  )
}
