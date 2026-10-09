import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { clamp, prefersReducedMotion } from '../lib/motion'
import { emphasis } from '../lib/emphasis'
import { formatNumber, useSectionReveals } from '../lib/useSectionReveals'
import { vision as copy } from '../content'
import SectionHead from '../components/SectionHead'
import Star from '../components/Star'

/**
 * 06 — Vision 2030 band.
 * Emerald field with the gold lattice, a giant outlined "2030" drifting behind,
 * the manifesto quote, a live 2016 → 2030 progress rule (computed from today's
 * date), and count-up stats.
 */
export default function Vision() {
  const root = useRef(null)
  useSectionReveals(root)

  const { start, end } = copy.timeline
  const year = clamp(new Date().getFullYear(), start, end)
  const progress = (year - start) / (end - start)
  const yearOf = copy.timeline.yearOf.replace('{n}', year - start).replace('{total}', end - start)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      gsap.fromTo(
        q('.vision__giant'),
        { xPercent: -6 },
        { xPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      gsap.fromTo(
        q('.vision-line__fill'),
        { scaleX: 0 },
        {
          scaleX: progress,
          duration: 2.4,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: q('.vision-line')[0], start: 'top 85%', once: true },
        },
      )
      gsap.from(q('.vision-line__now'), {
        autoAlpha: 0,
        scale: 0.4,
        duration: 1,
        delay: 1.8,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: q('.vision-line')[0], start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section id="vision" ref={root} className="vision" aria-labelledby="vision-title">
      <div className="vision__bg" aria-hidden="true">
        <div className="vision__lattice" />
        <span className="vision__giant">2030</span>
      </div>

      <div className="container vision__inner">
        <SectionHead index={copy.index} label={copy.label} />

        <div className="vision__top">
          <p className="vision__arabic" lang="ar" dir="rtl" data-reveal>
            {copy.arabic}
          </p>
          <h2 id="vision-title" className="sr-only">
            {copy.label}
          </h2>
          <blockquote className="vision__quote">
            {copy.quote.map((line) => (
              <span key={line} data-split className="block">
                {emphasis(line)}
              </span>
            ))}
            <footer className="vision__cite" data-reveal>
              <Star size={10} filled />
              <cite>{copy.attribution}</cite>
            </footer>
          </blockquote>
        </div>

        <p className="vision__body" data-reveal>
          {copy.body}
        </p>

        <div className="vision-line" data-reveal style={{ '--now': progress }}>
          <div className="vision-line__track">
            <span className="vision-line__fill" />
            <span className="vision-line__now" />
          </div>
          <div className="vision-line__labels">
            <span>
              <strong>{start}</strong>
              {copy.timeline.startLabel}
            </span>
            <span className="vision-line__now-label">
              <strong>{year}</strong>
              {copy.timeline.nowLabel} · {yearOf}
            </span>
            <span className="text-right">
              <strong>{end}</strong>
              {copy.timeline.endLabel}
            </span>
          </div>
        </div>

        <dl className="vision-stats">
          {copy.stats.map((s) => (
            <div className="vision-stats__item" key={s.label} data-reveal>
              <dt className="vision-stats__label">{s.label}</dt>
              <dd className="vision-stats__value">
                {typeof s.value === 'number' ? (
                  <>
                    <span data-count={s.value} data-pad="2">
                      {formatNumber(s.value).padStart(2, '0')}
                    </span>
                    {s.suffix && <span className="vision-stats__suffix">{s.suffix}</span>}
                  </>
                ) : (
                  <span className="placeholder">{s.display}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
