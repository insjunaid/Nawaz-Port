import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { hasFinePointer, prefersReducedMotion, REDUCED_MOTION } from '../../lib/motion'
import { polygonPath, starPath } from '../../lib/patterns'
import { hero as copy } from '../../content'
import Magnetic from '../../components/Magnetic'
import Star from '../../components/Star'
import { createHeroField } from './heroField'

/**
 * 01 — Hero: a typographic hero built around the name.
 *
 * Background layers (each with its own parallax depth, data-depth):
 *   lattice · spotlight ledger · canvas (drifting figures + ledger rules) · glow · seal
 * The name is set twice per line: a solid gold "ink" fill with a slow sheen,
 * and a hairline outline "echo" behind it. The echo moves further than the fill
 * with the pointer, so the letters seem to lift off the page.
 *
 * On scroll the hero pins while About slides over it; the lines part, the echo
 * separates, the seal turns and the stage dims.
 */

const splitChars = (word) =>
  [...word.toUpperCase()].map((c, i) => (
    <span className="hero-name__char" key={i}>
      {c}
    </span>
  ))

function NameLine({ word, index }) {
  return (
    <span className={`hero-name__line hero-name__line--${index}`} aria-hidden="true">
      <span className="hero-name__echo" data-depth="0.95">
        {splitChars(word)}
      </span>
      <span className="hero-name__fill" data-depth="0.5">
        {word.toUpperCase()}
      </span>
    </span>
  )
}

/** Large ornamental seal behind the name (decorative). */
function Seal() {
  const c = 300
  return (
    <svg viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <circle cx={c} cy={c} r={296} className="seal-faint" />
      <circle cx={c} cy={c} r={262} />
      <path d={starPath(c, c, 262)} />
      <path d={starPath(c, c, 262, Math.PI / 8)} className="seal-faint" />
      <path d={polygonPath(c, c, 150, 8, Math.PI / 8)} className="seal-faint" />
      <circle cx={c} cy={c} r={120} className="seal-faint" />
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2
        const r1 = i % 6 === 0 ? 270 : 280
        return (
          <line
            key={i}
            x1={c + Math.cos(a) * r1}
            y1={c + Math.sin(a) * r1}
            x2={c + Math.cos(a) * 288}
            y2={c + Math.sin(a) * 288}
            className="seal-faint"
          />
        )
      })}
    </svg>
  )
}

export default function Hero({ ready }) {
  const root = useRef(null)
  const canvasRef = useRef(null)
  const field = useRef(null)
  const introTl = useRef(null)
  const readyRef = useRef(false)

  /* Canvas field ------------------------------------------------------------ */
  useEffect(() => {
    field.current = createHeroField(canvasRef.current, {
      figures: copy.driftingFigures,
      reduced: prefersReducedMotion(),
      // Figures fade right down behind these, so texture never fights with text.
      getQuietElements: () =>
        [...(root.current?.querySelectorAll('[data-quiet]') ?? []), document.querySelector('.section-index')].filter(Boolean),
    })
    return () => field.current?.destroy()
  }, [])

  /* Intro (prepared paused; plays when the preloader doors open) ------------ */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      introTl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        // 1. The outline is drawn letter by letter…
        .from(q('.hero-name__char'), { yPercent: 118, duration: 1.5, stagger: 0.045 }, 0)
        // 2. …then gold ink fills each line from the bottom up.
        .from(q('.hero-name__fill'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', stagger: 0.18 }, 0.45)
        .from(q('.hero-glow'), { opacity: 0, scale: 0.7, duration: 2.4, ease: 'power2.out' }, 0.3)
        .from(q('.hero-seal__inner'), { opacity: 0, rotate: -40, scale: 0.92, duration: 2.6 }, 0.2)
        .from(q('[data-hero-ui]'), { autoAlpha: 0, y: 26, duration: 1.3, stagger: 0.08 }, 0.9)
    },
    { scope: root },
  )

  useEffect(() => {
    if (!ready) return
    readyRef.current = true
    introTl.current?.play()
    field.current?.reveal()
    field.current?.start()
    ScrollTrigger.refresh()
  }, [ready])

  /* Pointer parallax, stage tilt and the ledger spotlight -------------------- */
  useEffect(() => {
    const el = root.current
    const spot = el.querySelector('.hero-ledger')
    const reduced = prefersReducedMotion()
    const fine = hasFinePointer()
    const s = { x: el.clientWidth * 0.3, y: el.clientHeight * 0.45, tx: 0, ty: 0 }
    s.tx = s.x
    s.ty = s.y
    const applySpot = () => {
      spot.style.setProperty('--sx', `${s.x.toFixed(1)}px`)
      spot.style.setProperty('--sy', `${s.y.toFixed(1)}px`)
    }
    applySpot()
    if (reduced) return undefined

    let visible = true
    const opts = { duration: 1.4, ease: 'power3.out' }
    const layers = [...el.querySelectorAll('[data-depth]')].map((node) => ({
      d: parseFloat(node.dataset.depth),
      x: gsap.quickTo(node, 'x', opts),
      y: gsap.quickTo(node, 'y', opts),
    }))
    const stage = el.querySelector('.hero-stage')
    gsap.set(stage, { transformPerspective: 1800 })
    // Gold glint follows the cursor across each line of the name. The fill's
    // gradient is 260% wide with its bright band at 47%, so to put the band at
    // fraction fx of the line: background-position-x = (1.222 − fx) / 1.6.
    const name = el.querySelector('.hero-name')
    const fills = [...el.querySelectorAll('.hero-name__fill')]
    const glint = (clientX) => {
      fills.forEach((f) => {
        const r = f.getBoundingClientRect()
        const fx = gsap.utils.clamp(-0.2, 1.2, (clientX - r.left) / r.width)
        f.style.setProperty('--glint', `${(((1.222 - fx) / 1.6) * 100).toFixed(1)}%`)
      })
      name.classList.add('has-glint')
    }
    const endGlint = () => name.classList.remove('has-glint')
    const rotY = gsap.quickTo(stage, 'rotationY', opts)
    const rotX = gsap.quickTo(stage, 'rotationX', opts)

    const onMove = (e) => {
      if (!visible) return
      const r = el.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      layers.forEach((l) => {
        l.x(-nx * l.d * 30)
        l.y(-ny * l.d * 18)
      })
      rotY(nx * 2.6)
      rotX(-ny * 1.8)
      if (e.clientY < r.bottom) glint(e.clientX)
      field.current?.setPointer(nx, ny)
      s.tx = e.clientX - r.left
      s.ty = e.clientY - r.top
    }

    // Lerp the spotlight; on touch devices it wanders slowly by itself.
    const tick = (time) => {
      if (!visible) return
      if (!fine) {
        s.tx = el.clientWidth * (0.5 + 0.34 * Math.sin(time * 0.33))
        s.ty = el.clientHeight * (0.45 + 0.24 * Math.sin(time * 0.51 + 1.2))
      }
      s.x += (s.tx - s.x) * 0.1
      s.y += (s.ty - s.y) * 0.1
      applySpot()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && readyRef.current) field.current?.start()
      else field.current?.stop()
    })
    io.observe(el)

    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', endGlint)
    }
    gsap.ticker.add(tick)
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', endGlint)
      gsap.ticker.remove(tick)
    }
  }, [])

  /* Scroll story: pin, let About slide over, the name parts ------------------ */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(REDUCED_MOTION, () => {}) // reduced motion: nothing pins
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6, pin: true, pinSpacing: false },
            defaults: { ease: 'none' },
          })
          .to(q('.hero-name__line--1'), { xPercent: -14 }, 0)
          .to(q('.hero-name__line--2'), { xPercent: 10 }, 0)
          .to(q('.hero-name'), { '--split': 1, scale: 0.94 }, 0)
          .to(q('.hero-seal'), { rotate: 50, scale: 1.2 }, 0)
          .to(q('.hero-top, .hero-bottom'), { yPercent: -20, autoAlpha: 0, duration: 0.4 }, 0)
          .to(q('.hero-shade'), { opacity: 0.8 }, 0)
      })
    },
    { scope: root },
  )

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" aria-hidden="true">
        <div className="hero-lattice" data-depth="0.12" />
        <div className="hero-ledger" data-depth="0.2">
          <div className="hero-ledger__cols">
            {copy.ledgerColumns.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-glow" data-depth="0.3" />
        <div className="hero-seal" data-depth="0.25">
          <div className="hero-seal__inner">
            <Seal />
          </div>
        </div>
      </div>

      <div className="hero-content">
        {/* Intro animates the children; the scroll story fades this wrapper. */}
        <div className="hero-top">
          <p className="hero-greeting" data-hero-ui data-quiet>
            <span className="hero-greeting__ar" lang="ar" dir="rtl">
              {copy.greetingAr}
            </span>
            <span className="hero-greeting__en">
              {copy.greeting} <em>{copy.firstName}.</em>
            </span>
          </p>
          <p className="hero-role" data-hero-ui data-quiet>
            <span>{copy.role}</span>
            <span className="hero-role__dash" aria-hidden="true" />
            <span>{copy.company}</span>
            <span className="hero-role__dash" aria-hidden="true" />
            <span>{copy.location}</span>
          </p>
        </div>

        <div className="hero-center">
          <h1 id="hero-title" className="hero-name" data-quiet>
            <span className="sr-only">
              {copy.firstName} {copy.lastName} — {copy.role}, {copy.company}
            </span>
            <NameLine word={copy.firstName} index={1} />
            <NameLine word={copy.lastName} index={2} />
          </h1>
        </div>

        <div className="hero-bottom">
          <div className="hero-intro" data-hero-ui data-quiet>
            <p>{copy.intro}</p>
            <div className="hero-ctas">
              <Magnetic>
                <a href={copy.primaryCta.href} className="btn btn--gold">
                  <span data-magnetic-text>{copy.primaryCta.label}</span>
                  <Star size={12} filled className="btn__star" />
                </a>
              </Magnetic>
              <a href={copy.secondaryCta.href} className="link-underline">
                {copy.secondaryCta.label}
              </a>
            </div>
          </div>

          <div className="hero-aside" data-hero-ui data-quiet>
            <ol className="hero-disciplines" aria-label="Disciplines">
              {copy.disciplines.map((d, i) => (
                <li key={d}>
                  <span className="hero-disciplines__num">{String(i + 1).padStart(2, '0')}</span>
                  {d}
                </li>
              ))}
            </ol>
            <span className="hero-scroll" aria-hidden="true">
              {copy.scrollCue}
              <span className="hero-scroll__line" />
            </span>
          </div>
        </div>
      </div>

      <div className="hero-shade" aria-hidden="true" />
    </section>
  )
}
