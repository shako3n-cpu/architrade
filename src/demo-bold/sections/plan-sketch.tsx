import { useLayoutEffect, useRef, type CSSProperties } from 'react'

/**
 * A small floor plan that draws itself when its card is revealed: walls,
 * then furniture, then the pendants over it — the order the work happens in.
 * Illustrative, not a project.
 *
 * Each stroke's real length is measured into --len before paint and the
 * stroke is one dash that long, hidden by an offset of the same. (The usual
 * pathLength="1" shortcut is not applied to a CSS dasharray by Chromium —
 * the strokes came out as 1px dots — so it is measured instead.) Without
 * script --len is unset, the dasharray is dropped, and the plan simply shows.
 */

const at = (delay: number) => ({ '--d': `${delay}s` }) as CSSProperties

export function PlanSketch() {
  const svg = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    for (const stroke of svg.current?.querySelectorAll<SVGGeometryElement>('[data-draw]') ?? []) {
      stroke.style.setProperty('--len', String(Math.ceil(stroke.getTotalLength()) + 2))
    }
  }, [])

  return (
    <svg ref={svg} className="bd-plan" viewBox="0 0 320 220" role="img" aria-label="A floor plan drawing itself: walls, then desks and a meeting table, then the lights over them.">
      <g className="bd-plan-wall" style={at(0)}>
        <path data-draw="" d="M140 200 H16 V16 H304 V200 H184" />
      </g>
      <g className="bd-plan-line" style={at(0.4)}>
        <path data-draw="" d="M184 16 V104 H236 M268 104 H304" />
        <rect data-draw="" x="40" y="44" width="104" height="22" rx="3" />
        <rect data-draw="" x="40" y="120" width="104" height="22" rx="3" />
        <rect data-draw="" x="206" y="42" width="76" height="34" rx="17" />
        <path data-draw="" d="M200 138 H290 V186 H270 V156 H200 Z" />
      </g>
      <g className="bd-plan-line" style={at(0.75)}>
        {[56, 80, 104, 128].flatMap((x) => [
          <circle key={`a${x}`} data-draw="" cx={x} cy="34" r="5" />,
          <circle key={`b${x}`} data-draw="" cx={x} cy="76" r="5" />,
          <circle key={`c${x}`} data-draw="" cx={x} cy="110" r="5" />,
          <circle key={`d${x}`} data-draw="" cx={x} cy="152" r="5" />,
        ])}
        {[222, 244, 266].flatMap((x) => [
          <circle key={`e${x}`} data-draw="" cx={x} cy="32" r="5" />,
          <circle key={`f${x}`} data-draw="" cx={x} cy="86" r="5" />,
        ])}
      </g>
      <g className="bd-plan-light" style={at(1.1)}>
        {[
          [66, 55],
          [118, 55],
          [66, 131],
          [118, 131],
          [230, 59],
          [258, 59],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} data-draw="" cx={x} cy={y} r="4.5" />
        ))}
      </g>
    </svg>
  )
}
