import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { lockScroll, unlockScroll } from '../lib/smoothScroll'
import { polygonPath, starPath } from '../lib/patterns'
import { preloader as copy } from '../content'

/**
 * Cinematic preloader.
 *  1. A ledger counter ticks 000 → 100 while gold strokes draw an 8-point star.
 *     The counter holds near the end until the fonts are ready.
 *  2. "Balanced." — the UI fades.
 *  3. Two emerald doors part from the seam, each carrying half of the star.
 *
 * Repeat visits in the same session get a faster pass.
 */

// The star artwork. Each stroke has pathLength=1 so it can be drawn by progress.
function StarArt() {
  const c = 200
  return (
    <svg viewBox="0 0 400 400" className="preloader__art" aria-hidden="true" fill="none">
      <circle data-draw cx={c} cy={c} r={190} pathLength="1" />
      <circle data-draw cx={c} cy={c} r={178} pathLength="1" className="thin" />
      <path data-draw d={starPath(c, c, 170)} pathLength="1" />
      <path data-draw d={starPath(c, c, 170, Math.PI / 8)} pathLength="1" className="thin" />
      <path data-draw d={polygonPath(c, c, 96, 8, Math.PI / 8)} pathLength="1" />
      <path data-draw d={starPath(c, c, 78)} pathLength="1" />
      <circle data-draw cx={c} cy={c} r={34} pathLength="1" />
      <path data-draw d={starPath(c, c, 22, Math.PI / 8)} pathLength="1" className="thin" />
    </svg>
  )
}

// Read once per page load (module scope) so React StrictMode's double-invoke
// in development doesn't mark the first visit as a repeat.
const SEEN_BEFORE = (() => {
  try {
    const seen = sessionStorage.getItem('ns-folio-seen') === '1'
    sessionStorage.setItem('ns-folio-seen', '1')
    return seen
  } catch {
    return false // storage unavailable (private mode): play the full intro
  }
})()

export default function Preloader({ onReveal }) {
  const root = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    lockScroll()
  }, [])

  useGSAP(
    () => {
      const el = root.current
      const reduced = prefersReducedMotion()

      const counter = el.querySelector('[data-counter]')
      const status = el.querySelector('[data-status]')
      const strokes = gsap.utils.toArray(el.querySelectorAll('[data-draw]'))
      const state = { p: 0 }

      // Each stroke draws across its own slice of the 0–100 progress.
      const render = () => {
        counter.textContent = String(Math.round(state.p)).padStart(3, '0')
        const p = state.p / 100
        strokes.forEach((s, i) => {
          const start = (i / strokes.length) * 0.55
          const local = gsap.utils.clamp(0, 1, (p - start) / 0.45)
          s.style.strokeDashoffset = String(1 - local)
        })
      }
      render()

      // Ready = fonts loaded (the name is the hero), with a safety timeout.
      const ready = Promise.race([
        Promise.resolve(document.fonts?.ready),
        new Promise((r) => setTimeout(r, 4500)),
      ])

      const speed = reduced ? 0.01 : SEEN_BEFORE ? 0.45 : 1
      const intro = gsap.to(state, { p: 86, duration: 1.7 * speed, ease: 'power2.inOut', onUpdate: render })

      let outro
      ready.then(() => {
        intro.then(() => {
          outro = gsap
            .timeline({ defaults: { ease: 'expo.inOut' } })
            .to(state, { p: 100, duration: 0.55 * speed, ease: 'power3.out', onUpdate: render })
            .add(() => {
              status.textContent = copy.done
              el.classList.add('is-balanced')
            })
            .to(el.querySelectorAll('[data-ui]'), { autoAlpha: 0, y: -12, duration: 0.6, stagger: 0.04, ease: 'power2.in' }, '+=0.25')
            .addLabel('open', reduced ? '+=0' : '-=0.1')
            .to(el.querySelector('[data-door="left"]'), { xPercent: -101, duration: reduced ? 0.01 : 1.4 }, 'open')
            .to(el.querySelector('[data-door="right"]'), { xPercent: 101, duration: reduced ? 0.01 : 1.4 }, 'open')
            .to(el.querySelector('[data-seam]'), { scaleY: 0, duration: 0.8, ease: 'expo.in' }, 'open')
            .add(() => {
              unlockScroll()
              onReveal?.()
            }, reduced ? 'open' : 'open+=0.35')
            .add(() => setGone(true))
          if (reduced) outro.progress(1)
        })
      })

      return () => outro?.kill()
    },
    { scope: root },
  )

  if (gone) return null
  return (
    <div ref={root} className="preloader" role="status" aria-live="polite" aria-label={copy.srLabel}>
      <div className="preloader__door preloader__door--left" data-door="left">
        <div className="preloader__door-lattice" />
        <div className="preloader__star preloader__star--left">
          <StarArt />
        </div>
      </div>
      <div className="preloader__door preloader__door--right" data-door="right">
        <div className="preloader__door-lattice" />
        <div className="preloader__star preloader__star--right">
          <StarArt />
        </div>
      </div>
      <span className="preloader__seam" data-seam aria-hidden="true" />

      <div className="preloader__top" data-ui>
        <span>{copy.topLeft}</span>
        <span>{copy.topRight}</span>
      </div>

      <div className="preloader__ledger" data-ui>
        <span className="preloader__label" data-status>
          {copy.label}
        </span>
        <span className="preloader__leader" aria-hidden="true" />
        <span className="preloader__count">
          <span data-counter>000</span>
          <span className="preloader__unit">/100</span>
        </span>
      </div>
    </div>
  )
}
