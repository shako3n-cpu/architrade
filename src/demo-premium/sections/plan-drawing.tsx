import { useLayoutEffect, useRef, type CSSProperties } from 'react'

/**
 * A floor plan that draws itself when it scrolls into view: walls first,
 * then the furniture laid out on them, then the lighting and the acoustics
 * that are specified against that layout — the order the work really happens
 * in. Each stroke is one dash as long as the stroke itself: offset by its own
 * length it is hidden, offset by nothing it is drawn.
 *
 * MEASURED, NOT pathLength="1"
 *   The usual trick normalises every stroke to length 1 so that no script is
 *   needed. Chromium did not scale a CSS dasharray by pathLength here — each
 *   stroke became a 1px dotted line, and the plan "waiting to be drawn" was a
 *   grid of specks. So each stroke's real length is measured once, before
 *   paint, into --len. Without script --len is unset, the dasharray is
 *   invalid and dropped, and the plan simply shows fully drawn.
 *
 * Illustrative, not a project: an open plan for sixteen, a meeting room for
 * eight and a lounge, on a 14 × 9.5m floor.
 */

const at = (delay: number) => ({ '--d': `${delay}s` }) as CSSProperties

const BENCH_CHAIRS = [115, 165, 215, 265]
const MEETING_CHAIRS: [number, number][] = [
  [430, 70], [480, 70], [530, 70],
  [430, 170], [480, 170], [530, 170],
  [384, 120], [576, 120],
]

export function PlanDrawing() {
  const svg = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    for (const stroke of svg.current?.querySelectorAll<SVGGeometryElement>('[data-draw]') ?? []) {
      stroke.style.setProperty('--len', String(Math.ceil(stroke.getTotalLength()) + 2))
    }
  }, [])

  return (
    <figure className="lp-plan-figure at-survey" data-reveal="draw">
      <svg ref={svg} className="lp-plan" viewBox="0 0 640 470" role="img" aria-labelledby="lp-plan-title">
        <title id="lp-plan-title">
          A floor plan drawn line by line: walls, then desks, a meeting table and a lounge, then the pendant lights
          over them and the acoustic panels on the walls.
        </title>

        {/* Walls, with the entrance in the south wall. */}
        <g className="lp-plan-wall" style={at(0)}>
          <path data-draw="" d="M290 420 H40 V40 H600 V420 H360" />
        </g>

        {/* The glazed meeting room, and the entrance door and its swing. */}
        <g className="lp-plan-line" style={at(0.45)}>
          <path data-draw="" d="M360 40 V210 H470 M530 210 H600" />
          <path data-draw="" d="M290 420 V352" />
          <path data-draw="" className="lp-plan-faint" d="M290 352 A68 68 0 0 1 358 420" />
        </g>

        {/* Furniture: two benches for sixteen, a table for eight, a lounge. */}
        <g className="lp-plan-line" style={at(0.85)}>
          <rect data-draw="" x="90" y="92" width="200" height="40" rx="2" />
          <rect data-draw="" x="90" y="222" width="200" height="40" rx="2" />
          <rect data-draw="" x="400" y="90" width="160" height="60" rx="30" />
          <path data-draw="" d="M398 292 H572 V392 H540 V324 H398 Z" />
          <circle data-draw="" cx="466" cy="364" r="24" />
        </g>
        <g className="lp-plan-line" style={at(1.15)}>
          {BENCH_CHAIRS.flatMap((x) => [
            <circle key={`a${x}`} data-draw="" cx={x} cy="76" r="9" />,
            <circle key={`b${x}`} data-draw="" cx={x} cy="148" r="9" />,
            <circle key={`c${x}`} data-draw="" cx={x} cy="206" r="9" />,
            <circle key={`d${x}`} data-draw="" cx={x} cy="278" r="9" />,
          ])}
          {MEETING_CHAIRS.map(([x, y]) => (
            <circle key={`m${x}-${y}`} data-draw="" cx={x} cy={y} r="9" />
          ))}
        </g>

        {/* Acoustics, slate: panels on the walls the noise comes off. */}
        <g className="lp-plan-acoustic" style={at(1.55)}>
          <path data-draw="" d="M48 84 V140 M48 190 V246 M48 300 V356" />
          <path data-draw="" d="M592 64 V188" />
        </g>

        {/* Lighting, brass: pendants over the tables and the lounge. */}
        <g className="lp-plan-light" style={at(1.85)}>
          {[440, 480, 520].map((x) => (
            <circle key={x} data-draw="" cx={x} cy="120" r="7" />
          ))}
          {[140, 240].flatMap((x) => [
            <circle key={`${x}a`} data-draw="" cx={x} cy="112" r="7" />,
            <circle key={`${x}b`} data-draw="" cx={x} cy="242" r="7" />,
          ])}
          <circle data-draw="" cx="466" cy="364" r="11" />
        </g>

        {/* Dimensions and room names: the last thing on any drawing. */}
        <g className="lp-plan-notes" style={at(2.2)}>
          <path d="M40 448 H600 M40 442 V454 M600 442 V454" />
          <text x="320" y="440" textAnchor="middle">14 000</text>
          <text x="190" y="320" textAnchor="middle">Open plan · 16</text>
          <text x="480" y="200" textAnchor="middle">Meeting · 8</text>
          <text x="480" y="268" textAnchor="middle">Lounge</text>
        </g>
      </svg>
    </figure>
  )
}
