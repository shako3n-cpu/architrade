import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './nav'
import { Bento } from './sections/bento'
import { Closing, Footer } from './sections/closing'
import { Hero } from './sections/hero'
import { Proof } from './sections/proof'
import { Testimonial } from './sections/testimonial'
import { useOffscreenMeshes, useReveals } from './motion'
import './bold-landing.css'

/**
 * ============================================================================
 * BOLD LANDING — a demo, at /demo/bold
 * ----------------------------------------------------------------------------
 * The louder sibling of the /demo/premium exploration (a separate branch):
 * moving gradient meshes, frosted-glass cards, big radii, hard switches
 * between dark and light bands, and a hero object with presence. Built
 * entirely in this folder, on the site's own palette — ivory, graphite and
 * bronze, pushed through amber into warm charcoal — and the site's own facts
 * from src/data/company.ts. Changes nothing outside it but the route.
 *
 *   nav          a floating pill of dark glass
 *   hero         the site's headline, one call to action, and one 3D object:
 *                a bronze arch holding a pane of reeded amber glass (arch/)
 *   proof        three glass figure cards and the client marquee
 *   work         a bento of four cards: houses, process, approach, sectors
 *   testimonial  a placeholder quote on glass, on the dark
 *   closing      the call to action on a gradient panel, and a footer line
 *
 * LOADING ORDER — WHAT MAY WAIT ON WHAT
 *   This module and its stylesheet are one small chunk with no 3D in it. The
 *   gradient meshes are CSS, so they paint with the page. The 3D library and
 *   the arch are a second chunk requested only after that paint
 *   (arch/hero-stage.tsx), with a flat drawing of the arch in its place until
 *   the first frame is on screen. Nothing waits for the arch, and the arch
 *   waits on no asset at all.
 * ============================================================================
 */
export default function BoldLanding() {
  const page = useRef<HTMLDivElement>(null)
  useReveals(page)
  useOffscreenMeshes(page)
  useDocumentShell()

  return (
    // lang="en" HERE, not only on <html>: see useDocumentShell.
    <div ref={page} className="bd" lang="en">
      <a href="#bd-main" className="bd-skip">
        Skip to content
      </a>
      <Nav />
      <main id="bd-main">
        <Hero />
        <Proof />
        <Bento />
        <Testimonial />
        <Closing />
      </main>
      <Footer />
    </div>
  )
}

/**
 * English, whatever language the site last remembered, and named in the tab;
 * both put back on the way out.
 *
 * THE LANGUAGE HAS TO BE RIGHT FROM THE FIRST FRAME
 *   index.html starts the document as lang="ka", and the site's stylesheet
 *   gives Georgian headings their own leading and tracking —
 *   `:lang(ka) :is(h1…h6) { line-height: 1.28; letter-spacing: 0 }`,
 *   unlayered and more specific than .bd-display. This used to switch <html>
 *   to "en" in an ordinary effect, which runs AFTER the first paint: for the
 *   first half-second of a slow load the hero headline was set at Georgian
 *   leading (59px lines instead of 45px), then snapped shut and pulled
 *   everything under it up — a layout shift of ~0.03 with nothing to do
 *   with fonts. So the page's root element carries lang="en" itself, which
 *   :lang() sees from the very first render, and <html> is switched in a
 *   layout effect, before paint, for everything outside it.
 *
 * SCROLL, IN AND OUT
 *   The router keeps the scroll position across pages, and RootLayout resets
 *   it only between its own pages — so the site's contact page, reached from
 *   this one's call to action, would open part-way down. Arriving from inside
 *   the app this opens at the top; leaving puts the window at the top in a
 *   layout-effect cleanup, before the next page paints. The cleanup checks
 *   the address really changed: StrictMode unmounts and remounts once in
 *   development without going anywhere.
 */
function useDocumentShell() {
  const location = useLocation()
  const arrivedInApp = location.key !== 'default' && !location.hash
  useEffect(() => {
    if (arrivedInApp) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [arrivedInApp])

  useLayoutEffect(
    () => () => {
      if (!window.location.pathname.startsWith('/demo/bold')) window.scrollTo({ top: 0, behavior: 'instant' })
    },
    [],
  )

  useLayoutEffect(() => {
    const root = document.documentElement
    const previous = { title: document.title, lang: root.lang }
    document.title = 'ARCHTRADE — Furniture that outlasts the trend'
    root.lang = 'en'
    return () => {
      document.title = previous.title
      root.lang = previous.lang
    }
  }, [])
}
