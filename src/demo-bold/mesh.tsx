/**
 * A band's moving gradient mesh: soft discs of bronze, amber and warm
 * charcoal drifting slowly under the content, a faint architect's grid, and
 * film grain to keep the gradients from banding.
 *
 * All CSS. The discs are radial gradients — soft on their own, so there is no
 * softening filter to re-render — and only their transforms animate, which the
 * compositor handles without touching layout or paint. The page therefore
 * paints its mesh with its first frame; there is no library to wait for.
 * Held still under reduced motion and while the band is off screen (see
 * useOffscreenMeshes).
 */
export function Mesh({ tone }: { tone: 'hero' | 'proof' | 'quote' | 'close' | 'light' }) {
  return (
    <div className="bd-mesh" data-tone={tone} aria-hidden="true">
      <span className="bd-blob bd-blob-a" />
      <span className="bd-blob bd-blob-b" />
      <span className="bd-blob bd-blob-c" />
      {tone !== 'close' && <span className="bd-grid" />}
      <span className="bd-grain" />
    </div>
  )
}
