/**
 * Single place where GSAP plugins are registered.
 * Import { gsap, ScrollTrigger, SplitText, useGSAP } from here — never from 'gsap' directly —
 * so plugins are guaranteed to be registered before use.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1 })

// Pinned sections + mobile address bars: ignore the small resize jitter on touch scroll.
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, useGSAP }

// Dev only: expose for debugging / Playwright checks (stripped from production builds).
if (import.meta.env.DEV && typeof window !== 'undefined') window.__ST = ScrollTrigger
