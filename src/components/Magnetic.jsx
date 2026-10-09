import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion'

/**
 * Magnetic hover: the wrapper drifts toward the pointer, and any child marked
 * [data-magnetic-text] drifts a little further — a two-layer pull.
 * No-op on touch devices and with reduced motion.
 */
export default function Magnetic({ children, strength = 0.32, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined

    const text = el.querySelector('[data-magnetic-text]')
    const opts = { duration: 0.7, ease: 'power3.out' }
    const xTo = gsap.quickTo(el, 'x', opts)
    const yTo = gsap.quickTo(el, 'y', opts)
    const txTo = text && gsap.quickTo(text, 'x', opts)
    const tyTo = text && gsap.quickTo(text, 'y', opts)

    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      xTo(dx * strength)
      yTo(dy * strength)
      txTo?.(dx * strength * 0.45)
      tyTo?.(dy * strength * 0.45)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
      txTo?.(0)
      tyTo?.(0)
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])

  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  )
}
