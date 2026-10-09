import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { REDUCED_MOTION } from '../lib/motion'
import { emphasis } from '../lib/emphasis'
import { formatNumber, useSectionReveals } from '../lib/useSectionReveals'
import { journey as copy } from '../content'
import SectionHead from '../components/SectionHead'
import Star from '../components/Star'

/**
 * 03 — Journey: the career as five ledger entries.
 *
 *  ≥1024px  The section pins and the chapters scroll horizontally. A gold
 *           progress rule tracks position; star nodes ignite as each chapter
 *           crosses the reading line.
 *  <1024px  A vertical timeline whose rule draws down as you scroll —
 *           designed for thumbs, not a squeezed desktop.
 *  Reduced motion: the vertical layout, fully drawn, no pinning.
 */
export default function Journey() {
  const root = useRef(null)
  const track = useRef(null)
  useSectionReveals(root)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const chapters = q('.chapter')
      const mm = gsap.matchMedia()

      // Counts a chapter's stat up (once) — used by both layouts.
      const countUp = (chapter) => {
        const n = chapter.querySelector('[data-hcount]')
        if (!n || n.dataset.done) return
        n.dataset.done = '1'
        const end = parseFloat(n.dataset.hcount)
        const dec = Number(n.dataset.decimals || 0)
        const s = { v: 0 }
        gsap.to(s, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (n.textContent = formatNumber(s.v, dec)) })
      }

      mm.add(`(min-width: 1024px) and (prefers-reduced-motion: no-preference)`, () => {
        const distance = () => track.current.scrollWidth - window.innerWidth
        const scroll = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: q('.journey__pin')[0],
            pin: true,
            start: 'top top',
            end: () => '+=' + distance(),
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(q('.journey__progress-bar'), { scaleX: self.progress }),
          },
        })

        chapters.forEach((chapter) => {
          const n = chapter.querySelector('[data-hcount]')
          if (n) n.textContent = formatNumber(0, Number(n.dataset.decimals || 0))
          // Chapters already on screen when the pin starts can't use the
          // horizontal (containerAnimation) trigger — they reveal with the section.
          const left = chapter.offsetLeft / window.innerWidth
          const onScreen = (edge) =>
            left < edge ? { trigger: root.current, start: `top ${Math.round(100 - edge * 50)}%` } : null
          gsap.from(chapter.querySelectorAll('[data-chapter-in]'), {
            y: 50,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 1.1,
            scrollTrigger: {
              ...(onScreen(0.82) || { trigger: chapter, containerAnimation: scroll, start: 'left 82%' }),
              toggleActions: 'play none none reverse',
            },
          })
          gsap.fromTo(
            chapter.querySelector('.chapter__numeral'),
            { xPercent: 18 },
            {
              xPercent: -18,
              ease: 'none',
              scrollTrigger: { trigger: chapter, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
            },
          )
          gsap.timeline({
            scrollTrigger: {
              ...(onScreen(0.55) || { trigger: chapter, containerAnimation: scroll, start: 'left 55%' }),
              onEnter: () => {
                chapter.classList.add('is-lit')
                countUp(chapter)
              },
              onLeaveBack: () => chapter.classList.remove('is-lit'),
            },
          })
        })
      })

      mm.add(`(max-width: 1023px) and (prefers-reduced-motion: no-preference)`, () => {
        // The axis is drawn by the track's ::after, scaled by --fill.
        gsap.fromTo(
          track.current,
          { '--fill': 0 },
          { '--fill': 1, ease: 'none', scrollTrigger: { trigger: track.current, start: 'top 70%', end: 'bottom 70%', scrub: true } },
        )
        chapters.forEach((chapter) => {
          const n = chapter.querySelector('[data-hcount]')
          if (n) n.textContent = formatNumber(0, Number(n.dataset.decimals || 0))
          gsap.from(chapter.querySelectorAll('[data-chapter-in]'), {
            y: 36,
            autoAlpha: 0,
            stagger: 0.06,
            duration: 1,
            scrollTrigger: { trigger: chapter, start: 'top 85%', once: true },
          })
          gsap.timeline({
            scrollTrigger: {
              trigger: chapter,
              start: 'top 70%',
              onEnter: () => {
                chapter.classList.add('is-lit')
                countUp(chapter)
              },
              onLeaveBack: () => chapter.classList.remove('is-lit'),
            },
          })
        })
      })

      mm.add(REDUCED_MOTION, () => {
        chapters.forEach((c) => c.classList.add('is-lit'))
      })
    },
    { scope: root },
  )

  return (
    <section id="journey" ref={root} className="journey" aria-labelledby="journey-title">
      <div className="journey__pin">
        <div className="container journey__head">
          <SectionHead index={copy.index} label={copy.label} />
          <div className="journey__heading">
            <h2 id="journey-title" className="display-lg">
              <span data-split className="block">
                {copy.title[0]}
              </span>
              <span data-split className="block">
                {emphasis(copy.title[1])}
              </span>
            </h2>
            <div className="journey__aside" data-reveal>
              <p>{copy.intro}</p>
              <p className="journey__hint" aria-hidden="true">
                {copy.hint}
                <span className="journey__hint-arrow" />
              </p>
            </div>
          </div>
          <div className="journey__progress" aria-hidden="true">
            <span className="journey__progress-bar" />
          </div>
        </div>

        <div className="journey__viewport">
          <ol ref={track} className="journey__track">
            {copy.chapters.map((c) => (
              <li className="chapter" key={c.numeral}>
                <span className="chapter__node" aria-hidden="true">
                  <Star size={20} detail />
                </span>
                <span className="chapter__numeral" aria-hidden="true">
                  {c.numeral}
                </span>
                <div className="chapter__body">
                  <p className="chapter__meta" data-chapter-in>
                    <span className="chapter__tag">
                      <span className="sr-only">Chapter {c.numeral}: </span>
                      {c.tag}
                    </span>
                    <span className="chapter__period">{c.period}</span>
                  </p>
                  <h3 className="chapter__title" data-chapter-in>
                    {c.title}
                  </h3>
                  <p className="chapter__text" data-chapter-in>
                    {c.body}
                  </p>
                  {c.stat && (
                    <p className="chapter__stat" data-chapter-in>
                      <span className="chapter__stat-value" data-hcount={c.stat.value} data-decimals={c.stat.decimals}>
                        {formatNumber(c.stat.value, c.stat.decimals)}
                      </span>
                      <span className="chapter__stat-label">{c.stat.label}</span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
