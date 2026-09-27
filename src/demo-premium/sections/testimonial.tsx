import type { CSSProperties } from 'react'
import { usePointerLight } from '../motion'

/**
 * The one dark band on the page: a client's words over a slow gradient mesh
 * in the page's own brass and slate, with a faint light that follows the
 * pointer across it.
 *
 * THE QUOTE IS A PLACEHOLDER, AND SAYS SO
 *   No client has been asked for one yet, so the words below are a sample of
 *   the length and register that works here, and the attribution is marked as
 *   a placeholder on the page. Replace both with a real, approved quote —
 *   never publish an invented one under a real name.
 */
export function Testimonial() {
  const band = usePointerLight<HTMLElement>()
  return (
    <section ref={band} className="lp-quote" aria-label="Client testimonial">
      <div className="lp-mesh" aria-hidden="true">
        <span className="lp-mesh-brass" />
        <span className="lp-mesh-slate" />
        <span className="lp-mesh-ember" />
      </div>
      <div className="lp-grain" aria-hidden="true" />

      <div className="lp-wrap lp-quote-inner">
        <p className="lp-label lp-on-dark" data-reveal="">
          In their words
        </p>
        <figure>
          <blockquote className="lp-heading lp-quote-text" data-reveal="" style={{ '--i': 1 } as CSSProperties}>
            <p>
              “They counted every chair against the drawing — and on handover morning, every one of them was exactly where
              the plan said it would be.”
            </p>
          </blockquote>
          <figcaption className="lp-quote-by" data-reveal="" style={{ '--i': 2 } as CSSProperties}>
            <span className="lp-label lp-on-dark">Client name · Role, organisation</span>
            <span className="lp-placeholder-tag">Placeholder quote</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
