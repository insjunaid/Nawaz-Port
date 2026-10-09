/**
 * Declarative scroll reveals for a section. Mark elements in JSX:
 *
 *   data-split          masked line-by-line text reveal (GSAP SplitText)
 *   data-reveal         fade + rise when scrolled into view (batched)
 *   data-rule           hairline that draws from the left
 *   data-count="9.2"    number that counts up (data-decimals="1")
 *
 * With prefers-reduced-motion everything simply renders in its final state.
 */
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap'
import { prefersReducedMotion } from './motion'

export const formatNumber = (v, decimals = 0) =>
  Number(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export function useSectionReveals(scope) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root || prefersReducedMotion()) return

      // Masked line reveals. autoSplit re-splits on resize / font load and
      // the returned tween is re-created in sync.
      root.querySelectorAll('[data-split]').forEach((node) => {
        SplitText.create(node, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              rotate: 1.5,
              duration: 1.25,
              ease: 'expo.out',
              stagger: 0.09,
              scrollTrigger: { trigger: node, start: 'top 88%', once: true },
            }),
        })
      })

      // Fade-ups, batched so siblings entering together stagger nicely.
      const items = root.querySelectorAll('[data-reveal]')
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, y: 36 })
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', overwrite: 'auto' }),
        })
      }

      // Hairlines.
      root.querySelectorAll('[data-rule]').forEach((rule) => {
        gsap.from(rule, {
          scaleX: 0,
          transformOrigin: rule.dataset.rule === 'right' ? 'right center' : 'left center',
          duration: 1.6,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: rule, start: 'top 94%', once: true },
        })
      })

      // Count-ups (the final value is already in the DOM for SEO / no-JS).
      root.querySelectorAll('[data-count]').forEach((node) => {
        const end = parseFloat(node.dataset.count)
        const decimals = Number(node.dataset.decimals || 0)
        const pad = Number(node.dataset.pad || 0)
        const fmt = (v) => {
          const s = formatNumber(v, decimals)
          return pad ? s.padStart(pad, '0') : s
        }
        const state = { v: 0 }
        node.textContent = fmt(0)
        gsap.to(state, {
          v: end,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 90%', once: true },
          onUpdate: () => (node.textContent = fmt(state.v)),
        })
      })
    },
    { scope },
  )
}
