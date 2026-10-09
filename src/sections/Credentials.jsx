import { useEffect, useMemo, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion'
import { emphasis } from '../lib/emphasis'
import { rosette, starPath, waveBand } from '../lib/patterns'
import { formatNumber, useSectionReveals } from '../lib/useSectionReveals'
import { credentials as copy } from '../content'
import SectionHead from '../components/SectionHead'
import Star from '../components/Star'

/**
 * 07 — Credentials, presented like security-printed documents:
 * a landscape degree certificate with guilloché bands + rosette watermark,
 * and two round medallions with engraved ring text.
 * Pointer tilt + a gold-foil sheen that tracks the cursor (fine pointers only).
 */

/** Pointer tilt + foil sheen for any element with this ref. */
function useFoil(ref, max = 7) {
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined
    gsap.set(el, { transformPerspective: 1000 })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      ry((x - 0.5) * max * 2)
      rx(-(y - 0.5) * max * 2)
      el.style.setProperty('--fx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--fy', `${(y * 100).toFixed(1)}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [ref, max])
}

function Certificate() {
  const ref = useRef(null)
  useFoil(ref, 5)
  const d = copy.degree
  const art = useMemo(
    () => ({
      top: waveBand({ x0: 40, x1: 760, y: 34, amp: 5, wavelength: 26, lines: 4 }),
      bottom: waveBand({ x0: 40, x1: 760, y: 466, amp: 5, wavelength: 26, lines: 4 }),
      rose: rosette({ cx: 160, cy: 160, radius: 156, layers: 5 }),
    }),
    [],
  )
  return (
    <article ref={ref} className="cert" data-reveal aria-label={`${d.title}, ${d.metricLabel} ${d.metric} ${d.outOf}`}>
      {/* Frame + guilloché bands stretch with the card (non-scaling strokes)… */}
      <svg className="cert__art" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true" fill="none">
        <rect x="14" y="14" width="772" height="472" className="cert__frame" />
        <rect x="22" y="22" width="756" height="456" className="cert__frame cert__frame--thin" />
        {art.top.concat(art.bottom).map((p, i) => (
          <path key={i} d={p} className="cert__wave" />
        ))}
      </svg>
      {/* …while the rosette watermark and corner stars keep their proportions. */}
      <svg className="cert__rosette" viewBox="0 0 320 320" aria-hidden="true" fill="none">
        {art.rose.map((p, i) => (
          <path key={i} d={p} />
        ))}
      </svg>
      {['tl', 'tr', 'bl', 'br'].map((c) => (
        <Star key={c} size={22} className={`cert__corner cert__corner--${c}`} />
      ))}
      <span className="cert__foil" aria-hidden="true" />

      <div className="cert__body">
        <p className="cert__eyebrow">{d.eyebrow}</p>
        <h3 className="cert__title">{d.title}</h3>
        <p className="cert__conferred">
          <em>{d.conferred}</em>
        </p>
        <p className="cert__name">{d.name}</p>

        <div className="cert__metric">
          <span className="cert__metric-label">{d.metricLabel}</span>
          <span className="cert__metric-value">
            <span data-count={d.metric} data-decimals={d.metricDecimals}>
              {formatNumber(d.metric, d.metricDecimals)}
            </span>
            <span className="cert__metric-out">{d.outOf}</span>
          </span>
        </div>

        <p className="cert__foot">
          <span className="placeholder">{d.institution}</span>
          <span aria-hidden="true">·</span>
          <span className="placeholder">{d.year}</span>
        </p>
      </div>

      <div className="cert__seal" aria-hidden="true">
        <Star size={30} detail />
        <span>{d.seal}</span>
      </div>
    </article>
  )
}

function Medallion({ cert, index }) {
  const ref = useRef(null)
  useFoil(ref, 9)
  const id = `ring-${cert.acronym.toLowerCase()}`
  const rose = useMemo(() => rosette({ cx: 160, cy: 160, radius: 104, layers: 4, R: 90, r: 18, d: 40 }), [])
  // Engraved ring text, spaced (textLength) to wrap the circle exactly once.
  const ring = `${cert.ring.toUpperCase()} · ${cert.acronym} ·`
  const circumference = Math.round(2 * Math.PI * 128) - 6
  return (
    <article ref={ref} className={`medal medal--${index}`} data-reveal aria-label={`${cert.acronym} — ${cert.name}`}>
      <div className="medal__disc">
        <svg viewBox="0 0 320 320" className="medal__svg" aria-hidden="true" fill="none">
          <defs>
            <path id={id} d="M160 160 m-128 0 a128 128 0 1 1 256 0 a128 128 0 1 1 -256 0" />
          </defs>
          <circle cx="160" cy="160" r="156" className="medal__line" />
          <circle cx="160" cy="160" r="148" className="medal__line medal__line--thin" />
          <g className="medal__ring-text">
            <text textLength={circumference} lengthAdjust="spacing">
              <textPath href={`#${id}`} startOffset="0" textLength={circumference} lengthAdjust="spacing">
                {ring}
              </textPath>
            </text>
          </g>
          <circle cx="160" cy="160" r="114" className="medal__line medal__line--thin" />
          <g className="medal__rose">
            {rose.map((p, i) => (
              <path key={i} d={p} />
            ))}
          </g>
          <circle cx="160" cy="160" r="58" className="medal__hub" />
          <path d={starPath(160, 160, 52)} className="medal__line medal__line--thin" />
        </svg>
        <span className="medal__acronym">{cert.acronym}</span>
        <span className="medal__foil" aria-hidden="true" />
      </div>
      <div className="medal__caption">
        <h3 className="medal__name">{cert.name}</h3>
        <p className="medal__note">
          {cert.note} <span aria-hidden="true">·</span> <span className="placeholder">{cert.year}</span>
        </p>
      </div>
    </article>
  )
}

export default function Credentials() {
  const root = useRef(null)
  useSectionReveals(root)

  return (
    <section id="credentials" ref={root} className="section credentials" aria-labelledby="credentials-title">
      <div className="container">
        <SectionHead index={copy.index} label={copy.label} />
        <h2 id="credentials-title" className="display-lg credentials__title">
          <span data-split className="block">
            {copy.title[0]}
          </span>
          <span data-split className="block">
            {emphasis(copy.title[1])}
          </span>
        </h2>

        <div className="credentials__grid">
          <Certificate />
          <div className="credentials__medals">
            {copy.certificates.map((c, i) => (
              <Medallion key={c.acronym} cert={c} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
