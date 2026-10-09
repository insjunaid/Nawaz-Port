import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { emphasis } from '../lib/emphasis'
import { polygonPath, starPath } from '../lib/patterns'
import { useSectionReveals } from '../lib/useSectionReveals'
import { expertise as copy } from '../content'
import SectionHead from '../components/SectionHead'
import Star from '../components/Star'

/**
 * 04 — Expertise as a double-entry balance sheet.
 * Debit = what he brings, Credit = what the client gets. Rows activate as they
 * cross the reading line (or on hover/focus), and the compass rose turns to
 * point its active ray at the row's strength. Closes with a double rule and a
 * "Balanced" stamp. No progress bars.
 */

const C = 200 // compass centre in its 400×400 viewBox

/** A compass-rose point (kite) aimed at `angle` (0 = north, clockwise). */
function kite(angle, length, half) {
  const a = (angle * Math.PI) / 180
  const tip = [C + Math.sin(a) * length, C - Math.cos(a) * length]
  const l = [C + Math.sin(a - Math.PI / 2) * half, C - Math.cos(a - Math.PI / 2) * half]
  const r = [C + Math.sin(a + Math.PI / 2) * half, C - Math.cos(a + Math.PI / 2) * half]
  const f = (p) => p.map((n) => n.toFixed(2)).join(' ')
  return `M${f([C, C])}L${f(l)}L${f(tip)}L${f(r)}Z`
}

function Compass({ active, rotation }) {
  return (
    <div className="compass" style={{ '--r': `${rotation}deg` }} aria-hidden="true">
      <svg viewBox="0 0 400 400" className="compass__svg" fill="none">
        <circle cx={C} cy={C} r={196} className="compass__faint" />
        <circle cx={C} cy={C} r={184} />
        {Array.from({ length: 120 }, (_, i) => {
          const a = (i / 120) * Math.PI * 2
          const r1 = i % 10 === 0 ? 172 : 178
          return <line key={i} x1={C + Math.cos(a) * r1} y1={C + Math.sin(a) * r1} x2={C + Math.cos(a) * 184} y2={C + Math.sin(a) * 184} className="compass__faint" />
        })}
        <g className="compass__rose">
          <path d={starPath(C, C, 150)} className="compass__faint" />
          <path d={polygonPath(C, C, 92, 8, Math.PI / 8)} className="compass__faint" />
          {[45, 135, 225, 315].map((deg) => (
            <path key={deg} d={kite(deg, 104, 16)} className="compass__minor" />
          ))}
          {[0, 90, 180, 270].map((deg, i) => (
            <path key={deg} d={kite(deg, 166, 24)} className={`compass__ray ${i === active ? 'is-active' : ''}`} />
          ))}
          <circle cx={C} cy={C} r={40} className="compass__hub" />
        </g>
      </svg>
      {/* Codes ride the dial but counter-rotate to stay upright. */}
      <div className="compass__labels">
        {copy.rows.map((row, i) => (
          <span key={row.code} className={`compass__label compass__label--${i} ${i === active ? 'is-active' : ''}`}>
            {row.code}
          </span>
        ))}
      </div>
      <div className="compass__readout">
        <span className="compass__readout-small">{copy.compassCenter}</span>
        <span className="compass__readout-code">{copy.rows[active].code}</span>
      </div>
    </div>
  )
}

function CompassCaption({ active }) {
  return (
    <p className="compass__caption" aria-hidden="true">
      <span className="compass__caption-code">
        {copy.compassCenter} {copy.rows[active].code}
      </span>
      <span key={active} className="compass__caption-skill">
        {copy.rows[active].skill}
      </span>
    </p>
  )
}

export default function Expertise() {
  const root = useRef(null)
  const [active, setActive] = useState(0)
  const [rotation, setRotation] = useState(0)
  useSectionReveals(root)

  // Rotate the rose so the active ray points north, taking the short way round.
  const activate = (i) => {
    setActive(i)
    setRotation((current) => {
      const target = -i * 90
      const delta = ((((target - current) % 360) + 540) % 360) - 180
      return current + delta
    })
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      // Rows activate as they cross the reading line.
      q('.bs-row').forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => self.isActive && activate(i),
        })
      })
      if (prefersReducedMotion()) return
      gsap.from(q('.bs-stamp'), {
        scale: 1.8,
        rotate: -28,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'back.out(2.2)',
        scrollTrigger: { trigger: q('.bs-total')[0], start: 'top 82%', once: true },
      })
      gsap.from(q('.bs-total__rule'), {
        scaleX: 0,
        transformOrigin: 'left center',
        stagger: 0.15,
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: q('.bs-total')[0], start: 'top 88%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section id="expertise" ref={root} className="section expertise" aria-labelledby="expertise-title">
      <div className="container">
        <SectionHead index={copy.index} label={copy.label} />

        <div className="expertise__layout">
          <div className="expertise__side">
            <h2 id="expertise-title" className="display-lg">
              <span data-split className="block">
                {copy.title[0]}
              </span>
              <span data-split className="block">
                {emphasis(copy.title[1])}
              </span>
            </h2>
            <p className="expertise__intro" data-reveal>
              {copy.intro}
            </p>
            <div className="expertise__compass" data-reveal>
              <Compass active={active} rotation={rotation} />
              <CompassCaption active={active} />
            </div>
          </div>

          <div className="expertise__sheet" data-reveal>
            <table className="bs">
              <caption className="sr-only">Balance sheet of strengths: what Nawaz brings, and what clients get.</caption>
              <thead>
                <tr className="bs-head">
                  <th scope="col">{copy.columns.code}</th>
                  <th scope="col">{copy.columns.debit}</th>
                  <th scope="col">{copy.columns.credit}</th>
                </tr>
              </thead>
              <tbody>
                {copy.rows.map((row, i) => (
                  <tr
                    key={row.code}
                    className={`bs-row ${i === active ? 'is-active' : ''}`}
                    onMouseEnter={() => activate(i)}
                  >
                    <td className="bs-code">{row.code}</td>
                    <th scope="row" className="bs-debit">
                      <span className="bs-skill">{row.skill}</span>
                      <span className="bs-detail">{row.debit}</span>
                    </th>
                    <td className="bs-credit">
                      <span className="bs-credit__mark" aria-hidden="true">
                        Cr.
                      </span>
                      {row.credit}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bs-total">
                  <td className="bs-code">Σ</td>
                  <th scope="row" className="bs-debit">
                    <span className="bs-total__label">{copy.total.label}</span>
                    <span className="bs-total__value">{copy.total.debit}</span>
                  </th>
                  <td className="bs-credit">
                    <span className="bs-total__value">{copy.total.credit}</span>
                    <span className="bs-stamp" aria-label={copy.total.stamp}>
                      <Star size={12} filled />
                      {copy.total.stamp}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="bs-total__rules" aria-hidden="true">
              <span className="bs-total__rule" />
              <span className="bs-total__rule" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
