import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion'
import { emphasis } from '../lib/emphasis'
import { useSectionReveals } from '../lib/useSectionReveals'
import { supply as copy } from '../content'
import SectionHead from '../components/SectionHead'
import LineArt from '../components/LineArt'

/**
 * 05 — What I Supply.
 * Three oversized index rows. On desktop, hovering a row reveals a floating
 * "drawing sheet" that glides with the cursor and draws that line's technical
 * illustration. On touch screens each row carries its own drawing inline,
 * drawn as it scrolls into view.
 */
export default function Supply() {
  const root = useRef(null)
  const sheet = useRef(null)
  const [active, setActive] = useState(-1)
  const [inView, setInView] = useState({}) // mobile inline drawings
  useSectionReveals(root)

  // Floating sheet follows the pointer's Y within the list, tilting with speed.
  useEffect(() => {
    const list = root.current.querySelector('.supply-list')
    if (!hasFinePointer()) return undefined
    const reduced = prefersReducedMotion()
    const yTo = gsap.quickTo(sheet.current, 'y', { duration: reduced ? 0 : 0.8, ease: 'power3.out' })
    const rTo = gsap.quickTo(sheet.current, 'rotate', { duration: 0.8, ease: 'power3.out' })
    let lastY = 0
    const move = (e) => {
      const r = list.getBoundingClientRect()
      const h = sheet.current.offsetHeight
      const y = gsap.utils.clamp(-h * 0.25, r.height - h * 0.75, e.clientY - r.top - h / 2)
      yTo(y)
      if (!reduced) rTo(gsap.utils.clamp(-6, 6, (e.clientY - lastY) * 0.35))
      lastY = e.clientY
    }
    const leave = () => setActive(-1)
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    return () => {
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
    }
  }, [])

  // Touch / small screens: draw each inline illustration as it enters view.
  useGSAP(
    () => {
      gsap.utils.toArray(root.current.querySelectorAll('.supply-row')).forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 75%',
          once: true,
          onEnter: () => setInView((v) => ({ ...v, [i]: true })),
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="supply" ref={root} className="section supply" aria-labelledby="supply-title">
      <div className="container">
        <SectionHead index={copy.index} label={copy.label} />
        <div className="supply__head">
          <h2 id="supply-title" className="display-lg">
            <span data-split className="block">
              {copy.title[0]}
            </span>
            <span data-split className="block">
              {emphasis(copy.title[1])}
            </span>
          </h2>
          <div className="supply__intro" data-reveal>
            <p>{copy.intro}</p>
            <p className="supply__hint" aria-hidden="true">
              {copy.hoverHint}
            </p>
          </div>
        </div>

        <div className="supply-list-wrap">
          <ol className="supply-list">
            {copy.items.map((item, i) => (
              <li
                key={item.key}
                className={`supply-row ${active === i ? 'is-active' : ''} ${active !== -1 && active !== i ? 'is-dimmed' : ''}`}
                onMouseEnter={() => setActive(i)}
                data-reveal
              >
                <span className="supply-row__wipe" aria-hidden="true" />
                <span className="supply-row__letter" aria-hidden="true">
                  {item.letter}
                </span>
                <div className="supply-row__main">
                  <h3 className="supply-row__title">
                    {item.title}
                    {item.full !== item.title && <span className="sr-only"> — {item.full}</span>}
                  </h3>
                  <p className="supply-row__desc">{item.desc}</p>
                  <ul className="supply-row__list" aria-label={`${item.title} — example lines`}>
                    {item.list.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </div>
                <div className={`supply-row__inline ${inView[i] ? 'is-active' : ''}`}>
                  <LineArt kind={item.key} title={item.figure} />
                  <span className="supply-sheet__caption">{item.figure}</span>
                </div>
                <span className="supply-row__arrow" aria-hidden="true" />
              </li>
            ))}
          </ol>

          {/* Desktop floating drawing sheet (decorative duplicate of the inline drawings). */}
          <div ref={sheet} className={`supply-sheet ${active !== -1 ? 'is-open' : ''}`} aria-hidden="true">
            <div className="supply-sheet__grid" />
            {copy.items.map((item, i) => (
              <div key={item.key} className={`supply-sheet__art ${active === i ? 'is-active' : ''}`}>
                <LineArt kind={item.key} title={item.figure} />
                <span className="supply-sheet__caption">{item.figure}</span>
              </div>
            ))}
            <span className="supply-sheet__corner supply-sheet__corner--tl" />
            <span className="supply-sheet__corner supply-sheet__corner--br" />
          </div>
        </div>
      </div>
    </section>
  )
}
