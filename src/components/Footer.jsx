import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { scrollToTarget } from '../lib/smoothScroll'
import { footer as copy, nav } from '../content'
import Star from './Star'
import StarDivider from './StarDivider'

/**
 * Footer: the concept line set huge, a live KSA clock, and the back-to-top
 * seal — its ring fills with scroll progress; on click the star spins and the
 * page glides home.
 */

function useKsaTime(timeZone) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return time
}

export default function Footer() {
  const root = useRef(null)
  const ring = useRef(null)
  const star = useRef(null)
  const time = useKsaTime(copy.timeZone)

  useGSAP(
    () => {
      // Ring = page scroll progress.
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        refreshPriority: -1,
        onUpdate: (self) => ring.current && (ring.current.style.strokeDashoffset = String(1 - self.progress)),
      })
      if (prefersReducedMotion()) return
      gsap.from(root.current.querySelectorAll('.footer__big-word'), {
        yPercent: 110,
        stagger: 0.06,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  const toTop = () => {
    if (!prefersReducedMotion()) {
      gsap.fromTo(star.current, { rotate: 0 }, { rotate: 360, duration: 2, ease: 'expo.inOut' })
    }
    scrollToTarget('#top', { duration: 2.2 })
  }

  const year = new Date().getFullYear()

  return (
    <footer ref={root} className="footer">
      <div className="footer__lattice" aria-hidden="true" />
      <div className="container">
        <StarDivider />

        <p className="footer__big" aria-label={copy.bigLine}>
          {copy.bigLine.split(' ').map((w, i) => (
            <span className="footer__big-mask" key={i} aria-hidden="true">
              <span className={`footer__big-word ${i === copy.bigLine.split(' ').length - 1 ? 'italic-wonk' : ''}`}>{w}</span>
            </span>
          ))}
        </p>

        <div className="footer__row">
          <nav className="footer__nav" aria-label="Footer">
            <ul>
              {nav.items.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="link-underline">
                    <span className="footer__nav-no" aria-hidden="true">
                      {item.index}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button type="button" className="to-top" onClick={toTop} data-cursor="Top">
            <svg viewBox="0 0 120 120" className="to-top__ring" aria-hidden="true">
              <circle cx="60" cy="60" r="56" className="to-top__track" />
              <circle ref={ring} cx="60" cy="60" r="56" pathLength="1" className="to-top__progress" />
            </svg>
            <span ref={star} className="to-top__star">
              <Star size={34} detail />
            </span>
            <span className="to-top__arrow" aria-hidden="true">
              ↑
            </span>
            <span className="to-top__label">{copy.backToTop}</span>
          </button>
        </div>

        <div className="footer__base">
          <span>
            © {year} {copy.copyright}. {copy.rights}
          </span>
          <span className="footer__time">
            <span className="footer__pulse" aria-hidden="true" />
            {copy.timeLabel} <time>{time}</time> GMT+3
          </span>
          <span>{copy.credit}</span>
        </div>
      </div>
    </footer>
  )
}
