/**
 * Technical line drawings for "What I Supply" — drawn in thin gold strokes.
 * Every stroke uses pathLength=1 so CSS can draw it (stroke-dashoffset 1 → 0)
 * when its panel becomes active; --i staggers the strokes.
 */

const r2 = (n) => Math.round(n * 100) / 100

/** Renders a list of path strings as drawable strokes. */
function Strokes({ paths, offset = 0, className = '' }) {
  return paths.map((d, i) => <path key={i} d={d} pathLength="1" className={className} style={{ '--i': i + offset }} />)
}

/** Small registration mark used in each drawing's corner. */
const regMark = (x, y) => [`M${x - 9} ${y}H${x + 9}`, `M${x} ${y - 9}V${y + 9}`, `M${x + 6} ${y}A6 6 0 1 1 ${x - 6} ${y}A6 6 0 1 1 ${x + 6} ${y}`]

/** Dimension line with end ticks. */
const dimH = (x1, x2, y) => [`M${x1} ${y}H${x2}`, `M${x1} ${y - 6}V${y + 6}`, `M${x2} ${y - 6}V${y + 6}`]
const dimV = (x, y1, y2) => [`M${x} ${y1}V${y2}`, `M${x - 6} ${y1}H${x + 6}`, `M${x - 6} ${y2}H${x + 6}`]

/* ── A · PPE: hard hat, goggles, hi-vis vest ────────────────────────────── */
function PPE() {
  const hat = [
    'M86 204C86 128 134 84 194 82C254 84 300 128 300 204',
    'M64 204H300C332 204 354 210 364 218C354 226 332 228 300 228H74C62 228 56 212 64 204Z',
    'M194 82C180 114 176 160 178 204',
    'M194 82C210 114 216 160 216 204',
    'M120 120C140 112 160 108 178 108',
    'M104 228V244M284 228V244',
    'M104 244C146 274 244 274 284 244',
  ]
  const goggles = [
    'M330 86C336 78 344 76 352 78',
    'M454 78C462 76 470 78 476 86',
    'M352 66H454A18 18 0 0 1 454 102H424L416 94H390L382 102H352A18 18 0 0 1 352 66Z',
    'M403 66V94',
    'M362 74L376 74M432 74L446 74',
  ]
  const vest = [
    'M374 158L392 152C396 174 404 192 414 202C424 192 432 174 436 152L454 158C456 176 462 190 470 200L466 330H362L358 200C366 190 372 176 374 158Z',
    'M414 202V330',
    'M360 262H468M360 274H468',
    'M361 298H467M361 310H467',
    'M378 222H398V240H378Z',
  ]
  const notes = [...dimH(64, 364, 292), ...regMark(28, 28)]
  return (
    <>
      <Strokes paths={hat} />
      <Strokes paths={goggles} offset={hat.length} />
      <Strokes paths={vest} offset={hat.length + goggles.length} />
      <Strokes paths={notes} offset={14} className="la-faint" />
      <text x="64" y="316" className="la-text">Head protection · side elevation</text>
      <text x="352" y="128" className="la-text">Eye</text>
    </>
  )
}

/* ── B · Construction: I-beam, rebar, brick bond ────────────────────────── */
function Construction() {
  const dx = 170
  const dy = -60
  const beam = [
    'M60 80H150V96H114V194H150V210H60V194H96V96H60Z',
    `M60 80L${60 + dx} ${80 + dy}H${150 + dx}L150 80`,
    `M${150 + dx} ${80 + dy}V${96 + dy}L150 96`,
    `M114 96L${114 + dx} ${96 + dy}V${194 + dy}`,
    `M114 194L${114 + dx} ${194 + dy}H${150 + dx}L150 194`,
    `M${150 + dx} ${194 + dy}V${210 + dy}L150 210`,
  ]
  // Three ribbed bars running diagonally.
  const rebar = []
  for (let k = 0; k < 3; k++) {
    const x1 = 40 + k * 12
    const y1 = 338 - k * 10
    const x2 = 268 + k * 12
    const y2 = 254 - k * 10
    rebar.push(`M${x1} ${y1}L${x2} ${y2}`)
    for (let t = 0.06; t < 0.97; t += 0.075) {
      const x = r2(x1 + (x2 - x1) * t)
      const y = r2(y1 + (y2 - y1) * t)
      rebar.push(`M${x - 2} ${y - 5}L${x + 3} ${y + 5}`)
    }
  }
  const bricks = [
    'M300 252H456V330H300Z',
    'M300 278H456M300 304H456',
    'M352 304V330M404 304V330',
    'M326 278V304M378 278V304M430 278V304',
    'M352 252V278M404 252V278',
  ]
  const notes = [...dimV(36, 80, 210), ...regMark(452, 28)]
  return (
    <>
      <Strokes paths={beam} />
      <Strokes paths={bricks} offset={beam.length} />
      <Strokes paths={rebar} offset={4} className="la-thin" />
      <Strokes paths={notes} offset={10} className="la-faint" />
      <text x="48" y="150" className="la-text" transform="rotate(-90 48 150)">H 300</text>
      <text x="196" y="236" className="la-text">Ø 16 · rebar</text>
      <text x="300" y="350" className="la-text">Running bond</text>
    </>
  )
}

/* ── C · Consumables: cutting disc, bolt & nut, tape ────────────────────── */
function Consumables() {
  const cx = 140
  const cy = 168
  const hex = (x, y, r) =>
    'M' +
    Array.from({ length: 6 }, (_, k) => {
      const a = (k * Math.PI) / 3 + Math.PI / 6
      return `${r2(x + r * Math.cos(a))} ${r2(y + r * Math.sin(a))}`
    }).join('L') +
    'Z'
  const ring = (x, y, r) => `M${x + r} ${y}A${r} ${r} 0 1 1 ${x - r} ${y}A${r} ${r} 0 1 1 ${x + r} ${y}`
  const disc = [
    ring(cx, cy, 104),
    ring(cx, cy, 90),
    ring(cx, cy, 40),
    ring(cx, cy, 14),
    // Direction-of-rotation arrow.
    `M${cx + 74} ${cy - 132}A120 120 0 0 1 ${cx + 118} ${cy - 66}`,
    `M${cx + 108} ${cy - 74}L${cx + 118} ${cy - 66}L${cx + 122} ${cy - 78}`,
  ]
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2
    disc.push(`M${r2(cx + Math.cos(a) * 44)} ${r2(cy + Math.sin(a) * 44)}L${r2(cx + Math.cos(a) * 54)} ${r2(cy + Math.sin(a) * 54)}`)
  }
  const nut = [hex(360, 96, 46), ring(360, 96, 22), ring(360, 96, 30)]
  const bolt = ['M306 176H330V236H306Z', 'M330 192H458V220H330Z']
  for (let x = 372; x < 456; x += 8) bolt.push(`M${x} 192L${x + 6} 220`)
  const tape = [
    'M330 300A54 20 0 1 1 438 300A54 20 0 1 1 330 300',
    'M358 300A26 9 0 1 1 410 300A26 9 0 1 1 358 300',
    'M330 300V318A54 20 0 0 0 438 318V300',
    'M438 308C452 316 466 330 474 346',
  ]
  const notes = [...dimH(36, 244, 300), ...regMark(28, 28)]
  return (
    <>
      <Strokes paths={disc} />
      <Strokes paths={nut} offset={6} />
      <Strokes paths={bolt} offset={9} className="la-thin" />
      <Strokes paths={tape} offset={12} />
      <Strokes paths={notes} offset={16} className="la-faint" />
      <text x="36" y="324" className="la-text">Ø 230 · cutting disc</text>
      <text x="306" y="256" className="la-text">M16 bolt · nut</text>
    </>
  )
}

const DRAWINGS = { ppe: PPE, construction: Construction, consumables: Consumables }

export default function LineArt({ kind, title, className = '' }) {
  const Drawing = DRAWINGS[kind]
  return (
    <svg viewBox="0 0 480 360" className={`line-art ${className}`} fill="none" role="img" aria-label={title}>
      <Drawing />
    </svg>
  )
}
