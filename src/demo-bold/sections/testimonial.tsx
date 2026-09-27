import type { CSSProperties } from 'react'
import { Mesh } from '../mesh'

/**
 * Back to the dark: a client's words on a frosted panel over the moving mesh.
 *
 * THE QUOTE IS A PLACEHOLDER, AND SAYS SO
 *   No client has been asked for one yet. The words show the length and
 *   register that work here; the attribution is marked as a placeholder on
 *   the page. Replace both with a real, approved quote — never publish an
 *   invented one under a real name.
 */
export function Testimonial() {
  return (
    <section className="bd-quote bd-dark" data-mesh="" aria-label="Client testimonial">
      <Mesh tone="quote" />
      <div className="bd-wrap">
        <figure className="bd-glass bd-quote-card" data-reveal="">
          <blockquote className="bd-quote-text">
            <p>
              “They counted every chair against the drawing — and on handover morning, every one of them was exactly
              where the plan said it would be.”
            </p>
          </blockquote>
          <figcaption className="bd-quote-by" data-reveal="" style={{ '--i': 1 } as CSSProperties}>
            <span className="bd-quote-avatar" aria-hidden="true" />
            <span className="bd-label">Client name · Role, organisation</span>
            <span className="bd-placeholder-tag">Placeholder quote</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
