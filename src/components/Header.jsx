import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { lockScroll, scrollToTarget, unlockScroll } from '../lib/smoothScroll'
import { nav as copy, hero } from '../content'
import Magnetic from './Magnetic'
import Star from './Star'

/**
 * Fixed header: monogram, numbered nav (xl+), contact pill, and a full-screen
 * menu on smaller screens. Hides on scroll down, returns on scroll up.
 * Also renders the bottom-right "03 / 08" section index (desktop).
 */
export default function Header({ ready }) {
  const bar = useRef(null)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState({ index: '01', label: 'Intro' })
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  // Hide on scroll down / show on scroll up, and track the current section.
  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.6
        bar.current?.classList.toggle('is-hidden', hide)
        bar.current?.classList.toggle('is-scrolled', self.scroll() > 40)
      },
    })
    const sections = [{ id: 'top', index: '01', label: 'Intro' }, ...copy.items]
    // refreshPriority -1: these are created before the sections' pins, so they
    // must be measured after them (otherwise pin spacing is ignored).
    const triggers = sections.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 50%',
        end: i === sections.length - 1 ? 'max' : 'bottom 50%',
        refreshPriority: -1,
        onToggle: (self) => self.isActive && setCurrent({ index: s.index, label: s.label }),
      }),
    )
    return () => {
      st.kill()
      triggers.forEach((t) => t.kill())
    }
  }, [])

  // Menu open/close: lock scroll, focus management, Escape to close.
  useEffect(() => {
    if (!open) return undefined
    lockScroll()
    const first = menuRef.current?.querySelector('a')
    first?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab') {
        // Simple focus trap inside the menu (+ the toggle button).
        const nodes = [toggleRef.current, ...menuRef.current.querySelectorAll('a')]
        const idx = nodes.indexOf(document.activeElement)
        if (e.shiftKey && idx <= 0) {
          e.preventDefault()
          nodes[nodes.length - 1].focus()
        } else if (!e.shiftKey && idx === nodes.length - 1) {
          e.preventDefault()
          nodes[0].focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      toggleRef.current?.focus()
    }
  }, [open])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    // Wait a frame so scroll is unlocked before gliding.
    requestAnimationFrame(() => scrollToTarget(`#${id}`))
  }

  return (
    <>
      <header ref={bar} className={`site-header ${ready ? 'is-ready' : ''} ${open ? 'is-open' : ''}`}>
        <a href="#top" className="brand" aria-label={`${hero.firstName} ${hero.lastName} — back to top`}>
          <Star size={16} filled className="brand__star" />
          <span className="brand__name">{copy.brand}</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {copy.items.slice(0, -1).map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="site-nav__link">
                  <span className="site-nav__no">{item.index}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Magnetic strength={0.25} className="site-header__cta">
            <a href="#contact" className="btn btn--outline btn--sm">
              <span data-magnetic-text>{copy.contactLabel}</span>
            </a>
          </Magnetic>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="menu-toggle__label">{open ? copy.closeLabel : copy.menuLabel}</span>
            <span className="menu-toggle__lines" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <div id="site-menu" ref={menuRef} className={`site-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="site-menu__lattice" aria-hidden="true" />
        <p className="site-menu__ar" lang="ar" dir="rtl" aria-hidden="true">
          {hero.greetingAr}
        </p>
        <nav aria-label="Menu">
          <ol className="site-menu__list">
            {copy.items.map((item, i) => (
              <li key={item.id} style={{ '--i': i }}>
                <a href={`#${item.id}`} onClick={(e) => go(e, item.id)}>
                  <span className="site-menu__no">{item.index}</span>
                  <span className="site-menu__label">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="site-menu__foot">
          {hero.role} — {hero.company}
        </p>
      </div>

      <p className="section-index" aria-hidden="true">
        <span className="section-index__current">{current.index}</span>
        <span className="section-index__total">/ 08</span>
        <span className="section-index__label">{current.label}</span>
      </p>
    </>
  )
}
