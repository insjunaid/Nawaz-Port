/**
 * Geometry for the site's ornament system.
 *
 *  • starPoints()     — the 8-point star (khatam): the union of a square and the
 *                        same square turned 45°. Used everywhere as the motif.
 *  • latticeDataUri() — the "star-and-cross" Islamic lattice as an SVG tile.
 *  • guilloche()      — banknote-style rosettes (hypotrochoids) for certificates.
 */

const round = (n) => Math.round(n * 100) / 100

/**
 * Vertices of an 8-point star centred on (cx, cy).
 * Tips sit at radius R; the inner vertices follow from the two overlapping
 * squares: (R·cos45°, R·(1 − cos45°)) in each octant.
 */
export function starPoints(cx, cy, R, rotation = 0) {
  const pts = []
  const inner = R / Math.cos(Math.PI / 8) * Math.cos(Math.PI / 4) // where the two squares cross
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8 + rotation
    const r = k % 2 === 0 ? R : inner
    pts.push([round(cx + r * Math.cos(a)), round(cy - r * Math.sin(a))])
  }
  return pts
}

export const starPath = (cx, cy, R, rotation = 0) =>
  'M' + starPoints(cx, cy, R, rotation).map((p) => p.join(' ')).join('L') + 'Z'

/** Regular polygon path (octagons, etc.). */
export function polygonPath(cx, cy, r, sides = 8, rotation = 0) {
  const pts = []
  for (let k = 0; k < sides; k++) {
    const a = (k * 2 * Math.PI) / sides + rotation
    pts.push([round(cx + r * Math.cos(a)), round(cy - r * Math.sin(a))])
  }
  return 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z'
}

/**
 * Star-and-cross lattice tile. Neighbouring stars touch tip-to-tip, and the
 * negative space between four stars forms the cross. Small stars sit at the
 * tile corners (each tile draws its quarter of them).
 */
export function latticeSvg({ size = 120, color = '#C9A24B', stroke = 1 } = {}) {
  const c = size / 2
  const paths = [
    starPath(c, c, c), // main star, tips touch the tile edges
    starPath(c, c, c * 0.42, Math.PI / 8), // inner star, turned 22.5°
    ...[[0, 0], [size, 0], [0, size], [size, size]].map(([x, y]) => starPath(x, y, size * 0.115)),
  ]
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><g fill='none' stroke='${color}' stroke-width='${stroke}'>${paths
    .map((d) => `<path d='${d}'/>`)
    .join('')}</g></svg>`
}

export const latticeDataUri = (opts) => `url("data:image/svg+xml,${encodeURIComponent(latticeSvg(opts))}")`

/* ── Guilloché ──────────────────────────────────────────────────────────── */
const gcd = (a, b) => (b ? gcd(b, a % b) : a)

/**
 * Hypotrochoid rosette — the curve traced by a point at distance d from the
 * centre of a circle (radius r) rolling inside a circle (radius R).
 * Integer R and r give a closed curve after r/gcd(R, r) turns.
 */
export function hypotrochoid({ R, r, d, cx = 0, cy = 0, scale = 1, phase = 0, stepsPerTurn = 180 }) {
  const turns = r / gcd(R, r)
  const steps = Math.round(turns * stepsPerTurn)
  const k = (R - r) / r
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * 2 * Math.PI
    const x = (R - r) * Math.cos(t + phase) + d * Math.cos(k * t - phase)
    const y = (R - r) * Math.sin(t + phase) - d * Math.sin(k * t - phase)
    path += (i ? 'L' : 'M') + round(cx + x * scale) + ' ' + round(cy + y * scale)
  }
  return path
}

/** A stack of phase-shifted rosettes — the classic banknote moiré. */
export function rosette({ cx, cy, radius, layers = 4, R = 96, r = 26, d = 44 }) {
  const reach = R - r + d
  const scale = radius / reach
  return Array.from({ length: layers }, (_, i) =>
    hypotrochoid({ R, r, d: d - i * 3, cx, cy, scale, phase: (i * Math.PI) / (layers * 6) }),
  )
}

/** Wavy guilloché band (for certificate borders): several phase-shifted sines. */
export function waveBand({ x0, x1, y, amp = 6, wavelength = 28, lines = 4, step = 2 }) {
  return Array.from({ length: lines }, (_, i) => {
    let p = ''
    for (let x = x0; x <= x1; x += step) {
      const yy = y + amp * Math.sin(((x - x0) / wavelength) * 2 * Math.PI + (i * Math.PI) / lines)
      p += (x === x0 ? 'M' : 'L') + round(x) + ' ' + round(yy)
    }
    return p
  })
}
