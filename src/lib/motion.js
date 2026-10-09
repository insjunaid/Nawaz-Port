/**
 * Motion & input preferences.
 * Every animated component checks these so that `prefers-reduced-motion`
 * and touch devices get an intentional (not broken) experience.
 */
import { useSyncExternalStore } from 'react'

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'

const mq = (query) => (typeof window === 'undefined' ? null : window.matchMedia(query))

export const prefersReducedMotion = () => Boolean(mq(REDUCED_MOTION)?.matches)
export const hasFinePointer = () => Boolean(mq(FINE_POINTER)?.matches)

/** React hook that re-renders when a media query flips. */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => {
      const m = mq(query)
      m?.addEventListener('change', cb)
      return () => m?.removeEventListener('change', cb)
    },
    () => Boolean(mq(query)?.matches),
    () => false,
  )
}

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION)

/** Shared easing (matches CSS --ease-out-expo) for Lenis scrollTo. */
export const easeInOutExpo = (t) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t
