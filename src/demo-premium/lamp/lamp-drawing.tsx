import { COLLAR, CORD, DIFFUSER, SHADE, SHADE_PROFILE, project, type Vec3 } from './lamp-shape'

/**
 * The lamp before the lamp: a flat drawing of the pendant, projected through
 * the scene's own camera (see lamp-shape.ts) so it sits exactly where the
 * rendered one will. It is part of the page's first paint — no request, no
 * 3D library — and it stays a complete picture on its own: if WebGL is
 * missing, or the 3D code never arrives, this IS the hero, and it does not
 * look like something is still loading.
 *
 * The warm halo is here too and it stays when the model takes over: the
 * canvas is transparent, so the lamp's light on the page is always this one
 * gradient, whichever lamp is being drawn in front of it.
 */

const SEGMENTS = 64

/** Points round a horizontal circle, for the rim and the diffuser. */
function ring(radius: number, y: number, from = 0, to = Math.PI * 2): string {
  return Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / SEGMENTS
    return pt([radius * Math.cos(a), y, radius * Math.sin(a)])
  }).join(' L')
}

const pt = (p: Vec3) => project(p).map((n) => n.toFixed(4)).join(' ')

/*
 * The shade's outline: down the left side, round the FRONT of the rim (the
 * half nearer the camera, z > 0), and back up the right side.
 */
const left = SHADE_PROFILE.map(([r, y]) => pt([-r, y, 0])).join(' L')
const right = [...SHADE_PROFILE].reverse().map(([r, y]) => pt([r, y, 0])).join(' L')
const SHADE_PATH = `M${left} L${ring(SHADE.radius, 0, Math.PI, 0)} L${right} Z`

/** The inside of the shade, seen through the rim from below. */
const MOUTH_PATH = `M${ring(SHADE.radius - SHADE.thickness, 0)} Z`
/*
 * The diffuser's outline: the sphere's lower edge, a half circle below its
 * equator, closed along the back of the equator.
 */
const [diffuserX] = project([0, DIFFUSER.y, 0])
const diffuserR = (project([DIFFUSER.radius, DIFFUSER.y, 0])[0] - diffuserX).toFixed(4)
const DIFFUSER_PATH = `M${pt([-DIFFUSER.radius, DIFFUSER.y, 0])} A${diffuserR} ${diffuserR} 0 0 0 ${pt([DIFFUSER.radius, DIFFUSER.y, 0])} L${ring(DIFFUSER.radius, DIFFUSER.y, Math.PI * 2, Math.PI)} Z`

const COLLAR_PATH = `M${pt([-COLLAR.radius, COLLAR.bottom, 0])} L${pt([-COLLAR.radius, COLLAR.top, 0])} L${pt([COLLAR.radius, COLLAR.top, 0])} L${pt([COLLAR.radius, COLLAR.bottom, 0])} Z`
const [cordX, cordBottom] = project([0, COLLAR.top, 0])
const [, cordTop] = project([0, CORD.top, 0])
const [haloX, haloY] = project([0, 0, 0])

/** Both layers share one coordinate system: the camera's, in half-heights. */
const VIEW = { viewBox: '-0.3 -1 0.6 2', preserveAspectRatio: 'xMidYMid meet' } as const

export function LampDrawing() {
  return (
    <>
      {/* The light on the page. Its own layer, because the lamp's layer is
          masked at the top (the cord fades out) and a mask also clips
          everything outside its box — which cut the halo off in a hard line
          at the stage's edge. */}
      <svg className="lp-lamp-light" {...VIEW} aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="lp-halo" cx={haloX} cy={haloY} r="1.15" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f6dcae" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#efd3a6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#efd3a6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={haloX} cy={haloY} r="1.15" fill="url(#lp-halo)" />
      </svg>

      <svg className="lp-lamp-drawing" {...VIEW} aria-hidden="true" focusable="false">
        <defs>
        <linearGradient id="lp-brass-flat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a9834f" />
          <stop offset="0.42" stopColor="#d2ad76" />
          <stop offset="1" stopColor="#7a5f3d" />
        </linearGradient>
        <radialGradient id="lp-mouth" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff3dc" />
          <stop offset="1" stopColor="#e9cf9f" />
        </radialGradient>
        </defs>

        <g className="lp-lamp-flat">
          <line x1={cordX} y1={cordTop} x2={cordX} y2={cordBottom} stroke="#23262a" strokeWidth="0.0035" />
          <path d={COLLAR_PATH} fill="#a9834f" />
          <path d={SHADE_PATH} fill="url(#lp-brass-flat)" />
          <path d={MOUTH_PATH} fill="url(#lp-mouth)" />
          <path d={DIFFUSER_PATH} fill="#fffaf0" />
        </g>
      </svg>
    </>
  )
}
