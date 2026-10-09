import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { useSectionReveals } from '../lib/useSectionReveals'
import { emphasis } from '../lib/emphasis'
import { about as copy } from '../content'
import SectionHead from '../components/SectionHead'
import Star from '../components/Star'

// Pointed (two-centred) arch, in a 100×125 box — shared by the CSS mask in index.css.
const ARCH_PATH = 'M0 125V50Q0 14 50 0Q100 14 100 50V125'

/**
 * 02 — About.
 * Manifesto headline, then an arch-framed portrait (his head breaks out of
 * the arch) beside the story and an "account summary" ledger.
 *
 * Sketch → photo: as you scroll in, the portrait is first drawn as a gold
 * banknote-style engraving (a pen line sweeps down, --draw 0→1), then the real
 * photograph develops over it from the face down behind a band of warm light
 * (--dev 0→1). Both are scrubbed, so scrolling back turns him into ink again.
 * Without JS or with reduced motion the photo simply shows (both vars = 1).
 */
export default function About() {
  const root = useRef(null)
  useSectionReveals(root)

  // Gentle scroll parallax: portrait rises, the Arabic watermark drifts.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.fromTo(q('.about-arch__person'), { yPercent: 6 }, { yPercent: -4, ease: 'none', scrollTrigger: st })
      gsap.fromTo(q('.about-watermark'), { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: st })
      gsap.from(q('.about-arch__frame'), {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.8,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: q('.about-arch')[0], start: 'top 80%', once: true },
      })

      // Sketch → photo, scrubbed by scroll.
      const arch = q('.about-arch')[0]
      gsap
        .timeline({
          scrollTrigger: { trigger: arch, start: 'top 88%', end: 'center 42%', scrub: 0.8 },
          defaults: { ease: 'none' },
        })
        .fromTo(arch, { '--draw': 0 }, { '--draw': 1, duration: 0.4 })
        .fromTo(arch, { '--dev': 0 }, { '--dev': 1, duration: 0.52, ease: 'power1.inOut' }, '+=0.08')
    },
    { scope: root },
  )

  return (
    <section id="about" ref={root} className="section about" aria-labelledby="about-title">
      <span className="about-watermark" lang="ar" dir="rtl" aria-hidden="true">
        {copy.greetingAr}
      </span>

      <div className="container">
        <SectionHead index={copy.index} label={copy.label} />

        <h2 id="about-title" className="about-headline display-xl">
          <span data-split className="block">{copy.headline[0]}</span>
          <span data-split className="block about-headline__indent">
            {emphasis(copy.headline[1])}
          </span>
        </h2>

        <div className="about-grid">
          <figure className="about-arch" data-reveal>
            <div className="about-arch__frame" aria-hidden="true">
              <div className="about-arch__lattice" />
              <span className="about-arch__glow" />
            </div>
            {/* Pointed arch outline: sits behind him, so his head breaks out of it. */}
            <svg className="about-arch__outline" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true">
              <path d={ARCH_PATH} />
              <path d={ARCH_PATH} className="about-arch__outline-offset" />
            </svg>
            <div className="about-arch__person">
              {/* 1. Gold engraving (pixel-aligned with the photo). */}
              <img
                className="about-sketch"
                src="/images/nawaz-about-sketch-520.webp"
                srcSet="/images/nawaz-about-sketch-520.webp 520w, /images/nawaz-about-sketch-780.webp 780w"
                sizes="(max-width: 767px) 86vw, 34vw"
                width="780"
                height="1166"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
              {/* 2. The photograph, developing over it. */}
              <picture className="about-photo">
                <source
                  type="image/webp"
                  srcSet="/images/nawaz-about-520.webp 520w, /images/nawaz-about-780.webp 780w"
                  sizes="(max-width: 767px) 86vw, 34vw"
                />
                <img
                  src="/images/nawaz-about.png"
                  width="780"
                  height="1166"
                  alt={copy.imageAlt}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </picture>
              {/* 3. Light at the drawing and developing fronts, clipped to his silhouette. */}
              <span className="about-pen" aria-hidden="true" />
              <span className="about-develop" aria-hidden="true" />
            </div>

            <figcaption className="about-arch__caption">
              <Star size={10} filled />
              <span className="signature">{copy.signature}</span>
            </figcaption>
          </figure>

          <div className="about-copy">
            <p className="about-lede" data-split>
              {copy.lede}
            </p>
            {copy.paragraphs.map((p) => (
              <p key={p.slice(0, 16)} className="about-p" data-reveal>
                {p}
              </p>
            ))}

            <div className="ledger-card" data-reveal>
              <p className="ledger-card__title">
                <span>{copy.factsTitle}</span>
                <span className="mono-dim" aria-hidden="true">
                  Folio 02
                </span>
              </p>
              <dl className="ledger-list">
                {copy.facts.map((f, i) => (
                  <div className="ledger-list__row" key={f.label}>
                    <dt>
                      <span className="ledger-list__no" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {f.label}
                    </dt>
                    <span className="ledger-list__leader" aria-hidden="true" />
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
