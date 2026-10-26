import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { contact, nav } from '../data/content'
import { useActiveSection } from '../hooks/useActiveSection'
import { dur, ease, spring, stagger } from '../motion/tokens'
import { Logo } from './Logo'
import './Header.css'

const ids = nav.map((n) => n.id)

export function Header() {
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Mindig látható (sticky) fejléc; görgetés után üveghatású háttér
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12))

  // Menü: görgetészár, Escape, fókuszcsapda, fókusz-visszaállítás
  useEffect(() => {
    if (!open) return
    const body = document.body
    const sbw = window.innerWidth - document.documentElement.clientWidth
    body.style.paddingRight = sbw ? `${sbw}px` : ''
    body.classList.add('is-locked')
    const toggle = toggleRef.current
    const first = panelRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = [toggle, ...panelRef.current.querySelectorAll<HTMLElement>('a[href], button')].filter(Boolean) as HTMLElement[]
      const i = focusables.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        focusables[focusables.length - 1].focus()
      } else if (!e.shiftKey && i === focusables.length - 1) {
        e.preventDefault()
        focusables[0].focus()
      }
    }
    const onResize = () => {
      if (window.innerWidth >= 900) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      body.classList.remove('is-locked')
      body.style.paddingRight = ''
      toggle?.focus({ preventScroll: true })
    }
  }, [open])

  // Vissza gomb: ha a menü nyitva, a hash-váltás (horgony) bezárja
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    window.addEventListener('popstate', close)
    return () => {
      window.removeEventListener('hashchange', close)
      window.removeEventListener('popstate', close)
    }
  }, [])

  // Menüből horgonyra: előbb bezár (feloldja a görgetészárat), utána görget – így a horgony mindig célba ér
  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setOpen(false)
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
      history.pushState(null, '', `#${id}`)
    })
  }

  return (
    <>
      <header className={`hdr${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <div className="wrap hdr-in">
          <a href="#top" className="hdr-logo" aria-label="DAEKON – az oldal tetejére">
            <Logo />
          </a>

          <nav className="hdr-nav" aria-label="Fő navigáció">
            <ul>
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>
                    {active === n.id && <m.span layoutId="nav-pill" className="nav-pill" transition={spring.snappy} />}
                    <span className="nav-label">{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hdr-actions">
            <a href="#ajanlat" className="btn btn--primary btn--sm hdr-cta">
              Ajánlatkérés
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="hdr-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Menü bezárása' : 'Menü megnyitása'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="burger" data-open={open || undefined}>
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={panelRef}
            className="mmenu"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.32, ease: ease.io, delay: 0.05 } }}
            transition={{ duration: 0.45, ease: ease.io }}
          >
            <m.nav
              className="wrap mmenu-in"
              aria-label="Mobil navigáció"
              initial="hide"
              animate="show"
              exit="hide"
              variants={{ show: { transition: { staggerChildren: stagger.items, delayChildren: 0.15 } }, hide: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }}
            >
              <ul>
                {nav.map((n, i) => (
                  <m.li key={n.id} variants={{ hide: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ duration: dur.ui, ease: ease.out }}>
                    <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} aria-current={active === n.id ? 'true' : undefined}>
                      <span className="mm-no">{String(i + 1).padStart(2, '0')}</span>
                      {n.label}
                    </a>
                  </m.li>
                ))}
              </ul>
              <m.div className="mmenu-foot" variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <a href="#ajanlat" className="btn btn--primary" onClick={(e) => go(e, 'ajanlat')}>
                  Ajánlatot kérek <span className="arrow">→</span>
                </a>
                <a href={`mailto:${contact.email}`} className="mm-contact">
                  {contact.email}
                </a>
                <a href={contact.phoneHref} className="mm-contact">
                  {contact.phone}
                </a>
              </m.div>
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
