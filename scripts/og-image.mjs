/**
 * Renders the Open Graph card (public/og-image.jpg, 1200×630) from the live hero.
 *   npm run build && npm run preview   (in another terminal)
 *   node scripts/og-image.mjs
 */
import { chromium } from 'playwright'

const URL = process.env.OG_URL || 'http://localhost:4173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('.preloader', { state: 'detached', timeout: 20000 })
await page.waitForTimeout(3200)
// A clean card: no nav, no scroll cue, no side index.
await page.addStyleTag({ content: '.site-header,.section-index,.hero-scroll{display:none!important} .hero-intro{visibility:hidden!important} .hero{--name-size:17.5vw!important}' })
await page.waitForTimeout(200)
await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 86 })
await browser.close()
console.log('public/og-image.jpg written')
