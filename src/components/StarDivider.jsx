import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import Star from './Star'

/**
 * Section divider: a faint band of the 8-point lattice, crossed by a hairline
 * that draws outward from a central star as it scrolls into view.
 */
export default function StarDivider({ className = '' }) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 92%', once: true } })
      tl.from(q('.star-divider__line'), { scaleX: 0, duration: 1.6, ease: 'expo.inOut' }, 0)
        .from(q('.star-divider__star'), { rotate: -135, scale: 0.4, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.2)
        .from(q('.star-divider__band'), { autoAlpha: 0, duration: 1.6 }, 0.3)
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`star-divider ${className}`} aria-hidden="true">
      <span className="star-divider__band" />
      <span className="star-divider__line star-divider__line--l" />
      <Star size={22} detail className="star-divider__star" />
      <span className="star-divider__line star-divider__line--r" />
    </div>
  )
}
