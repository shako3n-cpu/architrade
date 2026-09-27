import type { CSSProperties } from 'react'
import { GlassLink, StartProject } from '../cta'
import { HeroStage } from '../arch/hero-stage'
import { Mesh } from '../mesh'

const step = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * The hero, on the darkest band of the page. The headline is the site's own
 * ("Furniture that outlasts the trend"), with its second half set in the
 * serif and filled with the bronze-to-amber gradient. Headline, line and call
 * to action are plain HTML in the first paint, rising in on a CSS animation
 * that waits on nothing; the arch is the stage behind them.
 */
export function Hero() {
  return (
    <section id="top" className="bd-hero bd-dark" data-mesh="" aria-labelledby="bd-hero-title">
      <Mesh tone="hero" />
      <HeroStage />
      <div className="bd-wrap bd-hero-inner">
        <div className="bd-hero-copy">
          <p className="bd-chip bd-rise" style={step(0)}>
            <span className="bd-chip-dot" aria-hidden="true" />
            Contract furniture · Tbilisi
          </p>
          <h1 id="bd-hero-title" className="bd-display bd-rise" style={step(1)}>
            Furniture that <span className="bd-accent">outlasts the trend.</span>
          </h1>
          <p className="bd-body bd-hero-lead bd-rise" style={step(2)}>
            Agents for twenty-nine European and American manufacturers. Furniture, lighting and acoustics — from the
            drawing to the installation.
          </p>
          <div className="bd-actions bd-rise" style={step(3)}>
            <StartProject />
            <GlassLink href="#work">See the work</GlassLink>
          </div>
        </div>
      </div>
    </section>
  )
}
