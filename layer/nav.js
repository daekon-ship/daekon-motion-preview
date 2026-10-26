// Navigáció: az aktív menüpont mögött rugóval átcsúszó fénylő „pill” (a meglévő aláhúzás mellé).
// A menü működéséhez nem nyúl: az aktív állapotot továbbra is az oldal saját kódja állítja (.is-active).
import { spring } from 'motion'
import { animate } from 'motion/mini'
import { $ } from './util.js'

export function navPill() {
  const nav = $('.v5-nav')
  if (!nav) return
  const pill = document.createElement('span')
  pill.className = 'dkm-pill'
  pill.setAttribute('aria-hidden', 'true')
  nav.classList.add('dkm-nav')
  nav.prepend(pill)

  let shown = false
  let lastLink = null
  const place = () => {
    const link = nav.querySelector('a.is-active')
    if (!link || !link.getClientRects().length) {
      if (shown) animate(pill, { opacity: 0 }, { duration: 0.25 })
      shown = false
      lastLink = null
      return
    }
    if (link === lastLink) return
    lastLink = link
    const n = nav.getBoundingClientRect()
    const r = link.getBoundingClientRect()
    const x = r.left - n.left - 12
    const w = r.width + 24
    if (!shown) {
      pill.style.transform = `translateX(${x}px)`
      pill.style.width = `${w}px`
      animate(pill, { opacity: [0, 1] }, { duration: 0.35 })
      shown = true
      return
    }
    animate(pill, { transform: `translateX(${x}px)`, width: `${w}px` }, { type: spring, stiffness: 380, damping: 32 })
  }

  new MutationObserver(place).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] })
  window.addEventListener('resize', () => {
    lastLink = null
    shown = false
    place()
  })
  place()
}
