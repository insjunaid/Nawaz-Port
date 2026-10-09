/**
 * Lenis smooth scrolling, synchronised with GSAP ScrollTrigger.
 *
 * - Disabled entirely for prefers-reduced-motion (native scrolling is used).
 * - Starts "locked" while the preloader runs (html.is-locked); call unlockScroll().
 * - Intercepts in-page anchor links (#about …) and scrolls to them smoothly,
 *   then moves keyboard focus to the target for accessibility.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { easeInOutExpo, prefersReducedMotion } from './motion'

const LenisContext = createContext(null)
let lenisInstance = null

export function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    const instance = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    if (document.documentElement.classList.contains('is-locked')) instance.stop()
    lenisInstance = instance
    setLenis(instance)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenisInstance = null
    }
  }, [])

  // Smooth in-page anchors.
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey) return
      const hash = link.getAttribute('href')
      if (hash.length < 2) return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      scrollToTarget(target)
      history.replaceState(null, '', hash === '#top' ? location.pathname : hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)

/** Scroll to an element / selector / number, with focus management. */
export function scrollToTarget(target, { duration = 1.8, focus = true } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  // The hero is pinned (pinSpacing: false), so once its pin ends it is
  // translated down a screen and measuring it would land on About. Home is 0.
  if (el?.id === 'top') target = 0
  const done = () => {
    if (!focus || !(el instanceof HTMLElement)) return
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
  if (lenisInstance) {
    lenisInstance.scrollTo(typeof target === 'number' ? target : (el ?? target), {
      duration,
      easing: easeInOutExpo,
      onComplete: done,
    })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    done()
  } else if (el) {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    done()
  }
}

export function lockScroll() {
  document.documentElement.classList.add('is-locked')
  lenisInstance?.stop()
}

export function unlockScroll() {
  document.documentElement.classList.remove('is-locked')
  lenisInstance?.start()
}
