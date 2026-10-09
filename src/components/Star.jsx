import { starPath } from '../lib/patterns'

/**
 * The 8-point star motif. Decorative — always aria-hidden.
 *  • default: hairline outline (reads well from ~20px up)
 *  • `filled`: solid star — use for small sizes (buttons, labels), where an
 *    outline would blur into a gear-like blob
 *  • `detail`: adds the inner turned star + centre circle on larger outlines
 */
export default function Star({ size = 16, detail = false, filled = false, className = '', strokeWidth = 1, ...rest }) {
  const c = 50
  if (filled) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true" focusable="false" {...rest}>
        <path d={starPath(c, c, 49)} fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      {...rest}
    >
      <path d={starPath(c, c, 48)} vectorEffect="non-scaling-stroke" />
      {detail && (
        <>
          <path d={starPath(c, c, 22, Math.PI / 8)} vectorEffect="non-scaling-stroke" />
          <circle cx={c} cy={c} r={6} vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  )
}
