import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { SmoothScroll } from './lib/smoothScroll'
import { latticeDataUri } from './lib/patterns'
import { nav } from './content'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Footer from './components/Footer'
import StarDivider from './components/StarDivider'
import Hero from './sections/hero/Hero'
import About from './sections/About'
import Journey from './sections/Journey'
import Expertise from './sections/Expertise'
import Supply from './sections/Supply'
import Vision from './sections/Vision'
import Credentials from './sections/Credentials'
import Contact from './sections/Contact'

// The lattice tile is generated from geometry (see lib/patterns.js) and exposed
// to CSS once, as --lattice.
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--lattice', latticeDataUri())
}

export default function App() {
  const [revealed, setRevealed] = useState(false)
  const onReveal = useCallback(() => setRevealed(true), [])

  // Recalculate trigger positions once fonts settle (line heights change).
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <SmoothScroll>
      <a href="#main" className="skip-link">
        {nav.skipLink}
      </a>
      <Preloader onReveal={onReveal} />
      <Cursor />
      <Header ready={revealed} />
      <main id="main">
        <Hero ready={revealed} />
        <About />
        <StarDivider className="section-divider" />
        <Journey />
        <Expertise />
        <StarDivider className="section-divider" />
        <Supply />
        <Vision />
        <Credentials />
        <StarDivider className="section-divider" />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </SmoothScroll>
  )
}
