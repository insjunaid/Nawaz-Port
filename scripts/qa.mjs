/**
 * End-to-end QA: every navigation path, layout overflow, broken requests and
 * console errors — at phone, tablet and desktop sizes.
 *
 *   npm run dev        (or: npm run build && npm run preview, then QA_URL=http://localhost:4173)
 *   npm run qa
 *
 * A link "passes" when, after the smooth scroll settles, its target section's
 * top edge sits at the top of the viewport (±6px) — or, for #top, scrollY ≈ 0.
 */
import { chromium } from 'playwright'

const URL = process.env.QA_URL || 'http://localhost:5173'
const DEVICES = [
  { name: 'phone 360', width: 360, height: 740, mobile: true },
  { name: 'phone 390', width: 390, height: 844, mobile: true },
  { name: 'tablet 768', width: 768, height: 1024, touch: true },
  { name: 'tablet 1024 landscape', width: 1024, height: 768, touch: true },
  { name: 'laptop 1366', width: 1366, height: 768 },
  { name: 'desktop 1440', width: 1440, height: 900 },
]
const SECTIONS = ['about', 'journey', 'expertise', 'supply', 'vision', 'credentials', 'contact']

const results = []
const pass = (device, check, ok, detail = '') => results.push({ device, check, ok, detail })

const browser = await chromium.launch()

for (const d of DEVICES) {
  const context = await browser.newContext({
    viewport: { width: d.width, height: d.height },
    isMobile: Boolean(d.mobile),
    hasTouch: Boolean(d.mobile || d.touch),
  })
  const page = await context.newPage()
  const problems = []
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`))
  page.on('requestfailed', (r) => !r.url().startsWith('mailto') && problems.push(`failed: ${r.url()}`))
  page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`))

  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 20000 })
  await page.waitForTimeout(1200)

  const settle = () => page.waitForTimeout(2600)
  const toTop = async () => {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(900)
  }
  const topOf = (id) => page.evaluate((s) => Math.round(document.getElementById(s).getBoundingClientRect().top), id)
  const checkLanding = async (label, id) => {
    await settle()
    if (id === 'top') {
      const y = await page.evaluate(() => Math.round(scrollY))
      pass(d.name, label, y <= 2, `scrollY=${y}`)
    } else {
      const t = await topOf(id)
      pass(d.name, label, Math.abs(t) <= 6, `#${id} top=${t}px`)
    }
  }

  // 1. Header "Let's talk" → Contact.
  await toTop()
  await page.click('.site-header__cta a')
  await checkLanding("Header 'Let's talk' → Contact", 'contact')

  // 2. Hero CTAs.
  await toTop()
  await page.click('.hero-ctas .btn')
  await checkLanding("Hero 'Start a conversation' → Contact", 'contact')
  await toTop()
  await page.click('.hero-ctas .link-underline')
  await checkLanding("Hero 'Read the journey' → Journey", 'journey')

  // 3. Primary nav (desktop) or the menu (smaller screens).
  const navVisible = await page.isVisible('.site-nav')
  for (const id of SECTIONS) {
    await toTop()
    if (navVisible && id !== 'contact') {
      await page.click(`.site-nav a[href="#${id}"]`)
      await checkLanding(`Nav → ${id}`, id)
    } else if (!navVisible) {
      await page.click('.menu-toggle')
      await page.waitForTimeout(1100)
      await page.click(`.site-menu a[href="#${id}"]`)
      await checkLanding(`Menu → ${id}`, id)
      const menuClosed = await page.evaluate(() => !document.querySelector('.site-menu').classList.contains('is-open'))
      if (!menuClosed) pass(d.name, `Menu closes after → ${id}`, false)
    }
  }

  // 4. Footer nav + back to top.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)
  await page.click('.footer__nav a[href="#expertise"]')
  await checkLanding('Footer → Expertise', 'expertise')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)
  await page.click('.to-top')
  await page.waitForTimeout(1200)
  await checkLanding('Back to top', 'top')

  // 5. Contact details.
  const links = await page.$$eval('.channels a', (as) => as.map((a) => a.getAttribute('href')))
  const expected = [
    'mailto:shariffnawaz2002@gmail.com',
    'tel:+966541071713',
    'https://www.linkedin.com/in/nawaz-shareef-b0b455415',
    'https://wa.me/966541071713',
  ]
  pass(d.name, 'Contact links', JSON.stringify(links) === JSON.stringify(expected), links.join(' | '))

  // 6. No horizontal overflow anywhere on the page.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  pass(d.name, 'No horizontal scroll', overflow <= 0, `overflow=${overflow}px`)

  // 7. Errors.
  pass(d.name, 'No console errors / failed requests', problems.length === 0, problems.slice(0, 4).join(' ; '))

  await context.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  [${r.device}] ${r.check}${r.ok ? '' : `  — ${r.detail}`}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
process.exit(failed.length ? 1 : 0)
