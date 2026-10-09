/**
 * Hero canvas: drifting financial figures, SAR marks and ledger rules.
 *
 * Figures drift upward at different depths (parallax with the pointer) and
 * ease down to a whisper inside "quiet zones" — the rectangles of the hero's
 * copy — so the texture never fights with text. Ledger rules draw in after the
 * preloader, carry accountant's tick marks, and a slow shimmer of light runs
 * along them.
 */

const GOLD = '201, 162, 75'
const PAPER = '243, 235, 221'

// Ledger rules as fractions of the canvas height; `double` = accountant's total.
const RULES = [
  { y: 0.2, depth: 0.25 },
  { y: 0.34, depth: 0.4 },
  { y: 0.66, depth: 0.35 },
  { y: 0.8, depth: 0.5, double: true },
  { y: 0.92, depth: 0.3 },
]

const rand = (a, b) => a + Math.random() * (b - a)
const isArabic = (s) => /[؀-ۿ]/.test(s)

export function createHeroField(canvas, { figures, reduced, getQuietElements = () => [] }) {
  const ctx = canvas.getContext('2d')
  let width = 0
  let height = 0
  let dpr = 1
  let items = []
  let raf = 0
  let running = false
  let last = 0
  let time = 0
  let intro = 0 // 0 → 1 fade-in after the preloader
  let quiet = []
  let frame = 0
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

  const measureQuiet = () => {
    const c = canvas.getBoundingClientRect()
    quiet = getQuietElements()
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width && r.height)
      .map((r) => ({ l: r.left - c.left - 28, t: r.top - c.top - 22, r: r.right - c.left + 28, b: r.bottom - c.top + 22 }))
    quiet.push({ l: -Infinity, t: -Infinity, r: Infinity, b: 72 }) // header band
  }
  const inQuiet = (x, y, w, h) => quiet.some((q) => x < q.r && x + w > q.l && y + h / 2 > q.t && y - h / 2 < q.b)

  const makeItem = (spawnAnywhere) => {
    const depth = rand(0.25, 1)
    const text = figures[Math.floor(Math.random() * figures.length)]
    return {
      text,
      arabic: isArabic(text),
      x: rand(0.02, 0.98),
      y: spawnAnywhere ? rand(0, 1) : rand(1.02, 1.12),
      depth,
      speed: rand(0.012, 0.03) * (0.5 + depth), // fraction of height per second
      size: Math.round(10 + depth * 7),
      alpha: 0.12 + depth * 0.34,
      gold: Math.random() > 0.35,
      w: undefined,
      q: undefined,
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = r.width
    height = r.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const count = width < 640 ? 12 : width < 1100 ? 18 : 26
    if (items.length !== count) items = Array.from({ length: count }, () => makeItem(true))
    measureQuiet()
    if (!running) draw()
  }

  function drawRules() {
    for (const rule of RULES) {
      const y = rule.y * height + pointer.y * rule.depth * -18
      const ox = pointer.x * rule.depth * -26
      const reveal = Math.min(1, Math.max(0, intro * 1.6 - rule.depth * 0.6))
      const x1 = width * reveal
      ctx.strokeStyle = `rgba(${GOLD}, 0.16)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(ox, y + 0.5)
      ctx.lineTo(ox + x1, y + 0.5)
      if (rule.double) {
        ctx.moveTo(ox, y + 3.5)
        ctx.lineTo(ox + x1, y + 3.5)
      }
      ctx.stroke()

      // Tick marks every 96px like ledger columns.
      ctx.strokeStyle = `rgba(${GOLD}, 0.22)`
      ctx.beginPath()
      for (let x = (ox % 96) + 48; x < x1; x += 96) {
        ctx.moveTo(x + 0.5, y - 3)
        ctx.lineTo(x + 0.5, y + 4)
      }
      ctx.stroke()

      // A slow shimmer of light travelling along the rule.
      const sx = ((time * 0.05 * (0.6 + rule.depth) + rule.y) % 1.4) * width - width * 0.2
      const g = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0)
      g.addColorStop(0, `rgba(${GOLD}, 0)`)
      g.addColorStop(0.5, `rgba(${GOLD}, 0.55)`)
      g.addColorStop(1, `rgba(${GOLD}, 0)`)
      ctx.strokeStyle = g
      ctx.beginPath()
      ctx.moveTo(Math.max(ox, sx - 140), y + 0.5)
      ctx.lineTo(Math.min(ox + x1, sx + 140), y + 0.5)
      ctx.stroke()
    }
  }

  function drawFigures(dt) {
    ctx.textBaseline = 'middle'
    for (const it of items) {
      if (!reduced) it.y -= it.speed * dt
      if (it.y < -0.06) Object.assign(it, makeItem(false))
      const x = it.x * width + pointer.x * it.depth * -34
      const y = it.y * height + pointer.y * it.depth * -22
      // Soft fade at the top and bottom of the stage.
      const edge = Math.min(1, it.y / 0.12, (1.04 - it.y) / 0.14)
      const a = Math.max(0, it.alpha * edge * intro)
      if (a <= 0.01) continue
      ctx.font = it.arabic
        ? `${Math.round(it.size * 1.5)}px Amiri, serif`
        : `${it.size}px "JetBrains Mono Variable", ui-monospace, monospace`
      it.w ??= ctx.measureText(it.text).width
      // Ease towards a whisper inside quiet zones (no popping).
      const target = inQuiet(x, y, it.w, it.size * 1.4) ? 0.06 : 1
      it.q = it.q === undefined ? target : it.q + (target - it.q) * Math.min(1, dt * 4 || 1)
      const alpha = a * it.q
      if (alpha <= 0.01) continue
      ctx.fillStyle = it.gold ? `rgba(${GOLD}, ${alpha})` : `rgba(${PAPER}, ${alpha * 0.7})`
      ctx.fillText(it.text, x, y)
    }
  }

  function draw(dt = 0) {
    pointer.x += (pointer.tx - pointer.x) * 0.06
    pointer.y += (pointer.ty - pointer.y) * 0.06
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    drawRules()
    drawFigures(dt)
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0)
    last = now
    time += dt
    if (intro < 1) intro = Math.min(1, intro + dt * 0.6)
    if (++frame % 30 === 0) measureQuiet()
    draw(dt)
    raf = requestAnimationFrame(loop)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  return {
    start() {
      if (running || reduced) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    /** Called once the preloader has opened. Reduced motion: draw a still frame. */
    reveal() {
      measureQuiet()
      if (reduced) {
        intro = 1
        draw()
      }
    },
    setPointer(x, y) {
      pointer.tx = x
      pointer.ty = y
    },
    destroy() {
      this.stop()
      ro.disconnect()
    },
  }
}
