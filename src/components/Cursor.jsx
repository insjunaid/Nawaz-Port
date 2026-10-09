import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion'

/**
 * Custom cursor: a gold dot that tracks the pointer exactly, and a ring that
 * lags behind it. Interactive elements grow the ring; elements with
 * data-cursor="Label" show a label inside it.
 * Only mounted for fine pointers without reduced motion — touch users and
 * keyboard users keep their native affordances.
 */
export default function Cursor() {
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion())
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const html = document.documentElement
    html.classList.add('has-cursor')

    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, x: -100, y: -100 })
    const dx = gsap.quickSetter(dot.current, 'x', 'px')
    const dy = gsap.quickSetter(dot.current, 'y', 'px')
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.6, ease: 'power3.out' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.6, ease: 'power3.out' })

    const move = (e) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      html.classList.add('cursor-in')
    }

    const over = (e) => {
      const target = e.target.closest?.('[data-cursor], a, button, label, select, [role="button"]')
      const field = e.target.closest?.('input, textarea')
      ring.current.classList.toggle('is-link', Boolean(target) && !field)
      ring.current.classList.toggle('is-field', Boolean(field))
      const text = target?.getAttribute('data-cursor') || ''
      label.current.textContent = text
      ring.current.classList.toggle('has-label', Boolean(text))
    }

    const leave = () => html.classList.remove('cursor-in')
    const down = () => ring.current.classList.add('is-down')
    const up = () => ring.current.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      html.classList.remove('has-cursor', 'cursor-in')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring">
        <span ref={label} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  )
}
