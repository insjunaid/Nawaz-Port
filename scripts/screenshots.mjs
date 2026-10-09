/**
 * Playwright screenshots at 360 / 768 / 1440 px, plus a console-error report.
 *
 *   npm run dev            (in another terminal)
 *   npm run shots          → screenshots/<width>-<section>.png
 *
 * Options (env):
 *   SHOTS_URL=http://localhost:4173   test the production preview instead
 *   SHOTS_REDUCED=1                    emulate prefers-reduced-motion
 *   SHOTS_WIDTHS=360,1440              subset of widths
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const URL = process.env.SHOTS_URL || 'http://localhost:5173'
const REDUCED = process.env.SHOTS_REDUCED === '1'
const WIDTHS = (process.env.SHOTS_WIDTHS || '360,768,1440').split(',').map(Number)
const HEIGHTS = { 360: 740, 390: 844, 768: 1024, 1024: 768, 1280: 800, 1440: 900 }
const SECTIONS = ['about', 'journey', 'expertise', 'supply', 'vision', 'credentials', 'contact']
const OUT = 'screenshots'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const errors = []

for (const width of WIDTHS) {
  const height = HEIGHTS[width] || 900
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: REDUCED ? 'reduce' : 'no-preference',
    hasTouch: width < 1024,
    isMobile: width < 768,
  })
  const page = await context.newPage()
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${width}] console: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`[${width}] pageerror: ${e.message}`))
  page.on('requestfailed', (r) => errors.push(`[${width}] requestfailed: ${r.url()}`))

  await page.goto(URL, { waitUntil: 'networkidle' })
  // Wait for the preloader to finish (it unmounts itself).
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2600) // let the hero intro settle
  const tag = REDUCED ? '-reduced' : ''
  await page.screenshot({ path: `${OUT}/${width}${tag}-01-hero.png` })

  for (const [i, id] of SECTIONS.entries()) {
    // Scroll in steps so scroll-triggered reveals fire as a visitor would see them.
    const y = await page.evaluate((sel) => {
      const el = document.getElementById(sel)
      return el ? el.getBoundingClientRect().top + window.scrollY : 0
    }, id)
    const current = await page.evaluate(() => window.scrollY)
    const steps = 8
    for (let s = 1; s <= steps; s++) {
      await page.evaluate((top) => window.scrollTo(0, top), current + ((y - current) * s) / steps)
      await page.waitForTimeout(90)
    }
    await page.waitForTimeout(1700)
    await page.screenshot({ path: `${OUT}/${width}${tag}-${String(i + 2).padStart(2, '0')}-${id}.png` })
  }

  // Journey mid-scroll (horizontal on desktop).
  if (width >= 1024 && !REDUCED) {
    const y = await page.evaluate(() => document.getElementById('journey').getBoundingClientRect().top + window.scrollY)
    await page.evaluate((top) => window.scrollTo(0, top + window.innerHeight * 0.9), y)
    await page.waitForTimeout(1800)
    await page.screenshot({ path: `${OUT}/${width}${tag}-03b-journey-mid.png` })
  }

  // Footer.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${OUT}/${width}${tag}-09-footer.png` })

  // Full page (reveals have fired by now).
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/${width}${tag}-full.png`, fullPage: true })

  await context.close()
}

await browser.close()
console.log(errors.length ? `\n${errors.length} problem(s):\n` + errors.join('\n') : '\nNo console errors.')
