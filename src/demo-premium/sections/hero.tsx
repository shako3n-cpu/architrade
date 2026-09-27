import type { CSSProperties } from 'react'
import { StartProject } from '../cta'
import { HeroStage } from '../lamp/hero-stage'

/** Staggers the hero's load-in: `--i` is each line's place in the sequence. */
const step = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * The hero. The headline, the line under it and the call to action are plain
 * HTML in the page's first paint; they rise in on a CSS animation that starts
 * with that paint and waits on nothing. The lamp is the stage behind them.
 */
export function Hero() {
  return (
    <section id="top" className="lp-hero" aria-labelledby="lp-hero-title">
      <HeroStage />
      <div className="lp-wrap lp-hero-inner">
        <div className="lp-hero-copy">
          <p className="lp-label lp-rise" style={step(0)}>
            Contract furniture · Tbilisi
          </p>
          <h1 id="lp-hero-title" className="lp-display lp-rise" style={step(1)}>
            Specified once.
            <span className="lp-quiet"> Lived in for decades.</span>
          </h1>
          <p className="lp-body lp-hero-lead lp-rise" style={step(2)}>
            Agents for twenty-nine European and American furniture houses. Seating, lighting and acoustics for offices,
            hotels and homes across Georgia — specified against the drawing, installed against the programme.
          </p>
          <div className="lp-actions lp-rise" style={step(3)}>
            <StartProject />
            <a href="#approach" className="lp-textlink">
              See how we work
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
