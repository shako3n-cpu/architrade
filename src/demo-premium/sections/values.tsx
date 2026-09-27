import type { CSSProperties, ReactNode } from 'react'
import { DISCIPLINES, FIGURES, STEPS } from '../content'
import { usePointerLight } from '../motion'
import { PlanDrawing } from './plan-drawing'

const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * The three things the company is, one section each and one idea per
 * section: many houses through one contract; the drawing before the order;
 * the room handed over, not the boxes delivered.
 */
export function Values() {
  return (
    <>
      <Houses />
      <Approach />
      <Process />
    </>
  )
}

function Kicker({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="lp-kicker lp-label" data-reveal="" style={order(0)}>
      <span className="lp-kicker-index">{index}</span>
      <span className="lp-kicker-rule" aria-hidden="true" />
      {children}
    </p>
  )
}

/* 01 — one contract, many houses ----------------------------------------- */

function Houses() {
  const card = usePointerLight<HTMLDivElement>()
  const houses = FIGURES[1].value
  return (
    <section id="houses" className="lp-section" aria-labelledby="lp-houses-title">
      <div className="lp-wrap lp-split">
        <div className="lp-split-text">
          <Kicker index="01">Houses</Kicker>
          <h2 id="lp-houses-title" className="lp-heading" data-reveal="" style={order(1)}>
            Twenty-nine houses. One contract.
          </h2>
          <p className="lp-body" data-reveal="" style={order(2)}>
            The manufacturers architects specify, under a single order, a single delivery schedule and a single snag list.
            You deal with one team that knows every catalogue, instead of twenty-nine that each know their own.
          </p>
        </div>

        <div ref={card} className="lp-card lp-houses-card at-survey" data-reveal="" style={order(2)}>
          <span className="lp-card-light" aria-hidden="true" />
          <div className="lp-houses-count">
            <span className="lp-display lp-brass">{houses}</span>
            <span className="lp-label">partner houses, Europe and America</span>
          </div>
          <ul className="lp-disciplines">
            {DISCIPLINES.map(([name, detail]) => (
              <li key={name}>
                <span className="lp-discipline-name">{name}</span>
                <span className="lp-label">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* 02 — the drawing comes first ------------------------------------------- */

function Approach() {
  return (
    <section id="approach" className="lp-section lp-section-tint" aria-labelledby="lp-approach-title">
      <div className="lp-wrap lp-split lp-split-reverse">
        <div className="lp-split-text">
          <Kicker index="02">Approach</Kicker>
          <h2 id="lp-approach-title" className="lp-heading" data-reveal="" style={order(1)}>
            Drawn before it is ordered.
          </h2>
          <p className="lp-body" data-reveal="" style={order(2)}>
            Every chair is counted against the plan, every luminaire checked against the ceiling, every acoustic panel
            placed on the wall it has to quiet — before a single order goes to a factory.
          </p>
          <ul className="lp-legend" data-reveal="" style={order(3)}>
            <li>
              <span className="lp-swatch" data-tone="ink" aria-hidden="true" />
              Furniture, to the layout
            </li>
            <li>
              <span className="lp-swatch" data-tone="brass" aria-hidden="true" />
              Lighting, to the ceiling
            </li>
            <li>
              <span className="lp-swatch" data-tone="slate" aria-hidden="true" />
              Acoustics, to the wall
            </li>
          </ul>
        </div>
        <PlanDrawing />
      </div>
    </section>
  )
}

/* 03 — handed over, not delivered --------------------------------------- */

function Process() {
  return (
    <section id="process" className="lp-section" aria-labelledby="lp-process-title">
      <div className="lp-wrap">
        <div className="lp-process-head">
          <Kicker index="03">Process</Kicker>
          <h2 id="lp-process-title" className="lp-heading" data-reveal="" style={order(1)}>
            Handed over as a room, not delivered as boxes.
          </h2>
        </div>
        <div className="lp-steps-wrap">
          <span className="lp-steps-rule" data-reveal="rule" aria-hidden="true" />
          <ol className="lp-steps">
            {STEPS.map(({ name, body }, i) => (
              <li key={name} className="lp-step" data-reveal="" style={order(i + 1)}>
                <span className="lp-label lp-brass">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="lp-step-name">{name}</h3>
                <p className="lp-step-body">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
