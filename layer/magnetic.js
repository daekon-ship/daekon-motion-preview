// Mágneses CTA-k (csak egérrel): a gomb finoman a kurzor felé húzódik, elengedve rugóval visszaáll.
import { spring } from 'motion'
import { animate } from 'motion/mini'
import { finePointer } from './util.js'

// [szelektor, húzóerő]: a CTA-k erősebben, a menüpontok és elérhetőségek finomabban
const TARGETS = [
  ['.v5-cta, .h-cta-a, .g7-cta, .ft-close-a, .dkm-reel-cta, .rv-btn', 0.28],
  ['.v5-nav a, .ft-big, .ft-meta a', 0.18],
]
const RADIUS = 90

export function magnetic() {
  if (!finePointer()) return
  for (const [sel, pull] of TARGETS) {
    for (const el of document.querySelectorAll(sel)) if (el.getClientRects().length) attach(el, pull)
  }
}

function attach(el, PULL) {
  {
    let active = false
    let raf = 0
    let last = null
    const update = () => {
      raf = 0
      if (!last) return
      const r = el.getBoundingClientRect()
      const dx = last.clientX - (r.left + r.width / 2)
      const dy = last.clientY - (r.top + r.height / 2)
      if (Math.hypot(dx, dy) > Math.max(r.width, r.height) / 2 + RADIUS) return leave()
      active = true
      el.style.transform = `translate(${(dx * PULL).toFixed(1)}px, ${(dy * PULL).toFixed(1)}px)`
    }
    const leave = () => {
      if (!active) return
      active = false
      animate(el, { transform: 'translate(0px, 0px)' }, { type: spring, stiffness: 300, damping: 14 }).finished.then(() => {
        if (!active) el.style.transform = ''
      })
    }
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return
      last = e
      if (!raf) raf = requestAnimationFrame(update)
    })
    el.addEventListener('pointerleave', leave)
  }
}
