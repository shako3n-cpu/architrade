import { ARCH, FLOOR_Y, GLASS_Z, archOutline, openingOutline, project, projectPosed, type Vec2 } from './arch-shape'

/**
 * The arch before the arch: a flat drawing of it at its resting pose,
 * projected through the scene's own camera (arch-shape.ts), so it sits
 * exactly where the model will. Part of the page's first paint — no
 * request, no 3D library — and a finished picture on its own: without WebGL,
 * or if the 3D code never arrives, this IS the hero.
 *
 * Two layers. The light (the amber halo and the pool on the floor) stays
 * after the model takes over, since the canvas is transparent and the page's
 * light should not change hands. The arch itself fades out under the model.
 */

const HALF = ARCH.depth / 2
const fmt = (p: Vec2) => `${p[0].toFixed(4)} ${p[1].toFixed(4)}`
const polygon = (points: Vec2[]) => `M${points.map(fmt).join(' L')} Z`

const outline = archOutline(40)
const front = outline.map(([x, y]) => projectPosed([x, y, HALF]))
const back = outline.map(([x, y]) => projectPosed([x, y, -HALF]))

/** The band's sides, as quads from the front edge to the back edge. */
const SIDES = outline
  .map((_, i) => {
    const j = (i + 1) % outline.length
    return polygon([front[i], front[j], back[j], back[i]])
  })
  .join(' ')
const FRONT = polygon(front)
const GLASS = polygon(openingOutline(40).map(([x, y]) => projectPosed([x, y, GLASS_Z])))

const [haloX, haloY] = project([0, 0.1, 0])
const [floorX, floorY] = project([0, FLOOR_Y, 0])
const [floorEdge] = project([0.95, FLOOR_Y, 0])

/** Both layers share one coordinate system: the camera's, in half-heights. */
const VIEW = { viewBox: '-0.3 -1 0.6 2', preserveAspectRatio: 'xMidYMid meet' } as const

export function ArchDrawing() {
  return (
    <>
      <svg className="bd-arch-light" {...VIEW} aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="bd-halo" cx={haloX} cy={haloY} r="1.25" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e3a54f" stopOpacity="0.42" />
            <stop offset="0.45" stopColor="#a9834f" stopOpacity="0.14" />
            <stop offset="1" stopColor="#a9834f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bd-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f0b865" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f0b865" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={haloX} cy={haloY} r="1.25" fill="url(#bd-halo)" />
        <ellipse cx={floorX} cy={floorY} rx={floorEdge - floorX} ry={(floorEdge - floorX) * 0.16} fill="url(#bd-pool)" />
      </svg>

      <svg className="bd-arch-drawing" {...VIEW} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="bd-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7d49a" />
            <stop offset="0.45" stopColor="#e39f4c" />
            <stop offset="1" stopColor="#7a4a22" />
          </linearGradient>
          <pattern id="bd-reeds" width="0.018" height="1" patternUnits="userSpaceOnUse">
            <rect width="0.006" height="1" fill="#fff" fillOpacity="0.16" />
          </pattern>
          <linearGradient id="bd-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7a466" />
            <stop offset="0.5" stopColor="#a9834f" />
            <stop offset="1" stopColor="#5e4328" />
          </linearGradient>
          <linearGradient id="bd-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6d5436" />
            <stop offset="1" stopColor="#3b2b1b" />
          </linearGradient>
        </defs>
        <g className="bd-arch-flat">
          <path d={GLASS} fill="url(#bd-glass)" />
          <path d={GLASS} fill="url(#bd-reeds)" />
          <path d={SIDES} fill="url(#bd-side)" stroke="#4a3824" strokeWidth="0.002" />
          <path d={FRONT} fill="url(#bd-front)" />
        </g>
      </svg>
    </>
  )
}
