import type { CSSProperties } from 'react'
import { DISCIPLINES, FIGURES, SECTOR_COUNTS, STEPS } from '../content'
import { Mesh } from '../mesh'
import { useSpotlight } from '../motion'
import { PlanSketch } from './plan-sketch'

const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * What the company does, on the page's light band: a bento of four frosted
 * cards, one idea each — many houses through one contract; the process from
 * brief to install; the drawing before the order; the sectors, with the
 * projects furnished in each counted from the company data. A light follows
 * the pointer across the whole grid and catches each card's edge.
 */
export function Bento() {
  const grid = useSpotlight<HTMLDivElement>('.bd-card')
  const houses = FIGURES[1].value
  const most = Math.max(...SECTOR_COUNTS.map((s) => s.count))
  const total = SECTOR_COUNTS.reduce((n, s) => n + s.count, 0)

  return (
    <section id="work" className="bd-values bd-light" data-mesh="" aria-labelledby="bd-work-title">
      <Mesh tone="light" />
      <div className="bd-wrap">
        <header className="bd-section-head">
          <p className="bd-chip bd-chip-light" data-reveal="">
            What we do
          </p>
          <h2 id="bd-work-title" className="bd-heading" data-reveal="" style={order(1)}>
            One partner, from the drawing <span className="bd-accent">to the handover.</span>
          </h2>
        </header>

        <div ref={grid} className="bd-bento">
          <article className="bd-card bd-card-houses" data-reveal="" style={order(0)}>
            {/* One dot per house: the figure, drawn rather than stated again. */}
            <ol className="bd-house-dots" aria-hidden="true">
              {Array.from({ length: houses }, (_, i) => (
                <li key={i} style={order(i)} />
              ))}
            </ol>
            <p className="bd-label">Houses</p>
            <p className="bd-houses-number bd-gradient-text" aria-hidden="true">
              {houses}
            </p>
            <h3 className="bd-card-title">
              <span className="bd-sr">{houses} </span>
              partner houses, one contract.
            </h3>
            <p className="bd-card-body">
              The manufacturers architects specify, under a single order, a single delivery schedule and a single snag
              list.
            </p>
            <ul className="bd-tags" aria-label="Disciplines">
              {DISCIPLINES.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </article>

          <article id="process" className="bd-card bd-card-process" data-reveal="" style={order(1)}>
            <p className="bd-label">Process</p>
            <h3 className="bd-card-title">Handed over as a room, not delivered as boxes.</h3>
            <ol className="bd-steps">
              {STEPS.map(({ name, body }, i) => (
                <li key={name} className="bd-step" style={order(i)}>
                  <span className="bd-step-mark" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="bd-step-name">{name}</h4>
                    <p className="bd-step-body">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="bd-card bd-card-plan" data-reveal="" style={order(2)}>
            <p className="bd-label">Approach</p>
            <h3 className="bd-card-title">Drawn before it is ordered.</h3>
            <PlanSketch />
          </article>

          <article className="bd-card bd-card-sectors" data-reveal="" style={order(3)}>
            <p className="bd-label">Sectors</p>
            <h3 className="bd-card-title">Projects furnished, by sector.</h3>
            <ul className="bd-bars">
              {SECTOR_COUNTS.map(({ name, count }, i) => (
                <li key={name} style={{ ...order(i), '--share': count / most } as CSSProperties}>
                  <span className="bd-bar-name">{name}</span>
                  <span className="bd-bar-track" aria-hidden="true">
                    <span className="bd-bar-fill" />
                  </span>
                  <span className="bd-bar-count">{count}</span>
                </li>
              ))}
            </ul>
            <p className="bd-bars-total">
              <span>In total</span>
              <strong className="bd-gradient-text">{total}</strong>
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
