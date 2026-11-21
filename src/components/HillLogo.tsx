import { HILL_RIGHT, HILL_LEFT, HILL_FRONT, HILL_TRACE_TRANSFORM } from './hill-paths'

/** The mountain mark of the owner's earlier app, filled from the slate tokens (no colour is named here). */
export function HillLogo({ width = 96 }: { width?: number }) {
  return (
    <svg viewBox="0 0 660 297" width={width} role="img" aria-label="Central Hub logo" className="logo">
      <g>
        <path className="hill-back" d={HILL_RIGHT} transform={HILL_TRACE_TRANSFORM} />
        <path className="hill-back" d={HILL_LEFT} transform={HILL_TRACE_TRANSFORM} />
        <path className="hill-front" d={HILL_FRONT} transform={HILL_TRACE_TRANSFORM} />
      </g>
    </svg>
  )
}
