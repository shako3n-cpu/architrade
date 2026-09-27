import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './nav'
import { Closing, Footer } from './sections/closing'
import { Hero } from './sections/hero'
import { Proof } from './sections/proof'
import { Testimonial } from './sections/testimonial'
import { Values } from './sections/values'
import { useReveals } from './motion'
import './premium-landing.css'

/**
 * ============================================================================
 * PREMIUM LANDING — a demo, at /demo/premium
 * ----------------------------------------------------------------------------
 * A single-scroll marketing page for ARCHTRADE, built entirely in this
 * folder. It borrows the site's tokens (colours, fonts, motion) from
 * index.css and its facts from src/data/company.ts, and changes neither.
 *
 *   nav         a floating pill
 *   hero        headline, one call to action, and one 3D object — a brass
 *               pendant (lamp/)
 *   proof       three figures and the client list
 *   values      houses, approach (a plan that draws itself), process
 *   testimonial the one dark band, on a gradient mesh
 *   closing     the call to action again, and a footer line
 *
 * LOADING ORDER — WHAT MAY WAIT ON WHAT
 *   This module and its stylesheet are one small chunk with no 3D in it; the
 *   whole page paints from them. The 3D library and the lamp are a second
 *   chunk, requested only after that paint (lamp/hero-stage.tsx), and in the
 *   meantime a flat drawing of the lamp holds its place. Nothing on the page
 *   waits for the lamp, and the lamp waits on no asset at all.
 *
 * Outside the site's layout on purpose: no site header, footer or contact
 * bar, since the page brings its own.
 * ============================================================================
 */
export default function PremiumLanding() {
  const page = useRef<HTMLDivElement>(null)
  useReveals(page)
  useDocumentShell()

  return (
    <div ref={page} className="lp">
      <a href="#lp-main" className="lp-skip">
        Skip to content
      </a>
      <Nav />
      <main id="lp-main">
        <Hero />
        <Proof />
        <Values />
        <Testimonial />
        <Closing />
      </main>
      <Footer />
    </div>
  )
}

/**
 * The page is English, whatever language the site last remembered, and says
 * what it is in the tab. Both are put back on the way out, so the site the
 * visitor goes on to is exactly as it was.
 *
 * SCROLL, IN AND OUT
 *   The router keeps the scroll position across pages, and RootLayout resets
 *   it only when it changes page WITHIN itself — so the site's contact page,
 *   reached from this page's call to action, opened 700px down. Both edges
 *   are handled here: arriving from another page of the app this opens at
 *   the top, and leaving it puts the window at the top in a layout-effect
 *   cleanup, which runs before the next page paints. The cleanup checks the
 *   address has really changed, because StrictMode unmounts and remounts once
 *   in development without going anywhere.
 */
function useDocumentShell() {
  const location = useLocation()
  const arrivedInApp = location.key !== 'default' && !location.hash
  useEffect(() => {
    if (arrivedInApp) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [arrivedInApp])

  useLayoutEffect(
    () => () => {
      if (!window.location.pathname.startsWith('/demo/premium')) window.scrollTo({ top: 0, behavior: 'instant' })
    },
    [],
  )

  useEffect(() => {
    const root = document.documentElement
    const previous = { title: document.title, lang: root.lang }
    document.title = 'ARCHTRADE — Contract furniture, specified to last'
    root.lang = 'en'
    return () => {
      document.title = previous.title
      root.lang = previous.lang
    }
  }, [])
}
