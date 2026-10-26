// Mágneses CTA-k (csak egérrel): a gomb finoman a kurzor felé húzódik, elengedve rugóval visszaáll.
import { spring } from 'motion'
import { animate } from 'motion/mini'
import { finePointer } from './util.js'

const SELECTOR = '.v5-cta, .h-cta-a, .g7-cta, .ft-close-a, .dkm-reel-cta'
const PULL = 0.28
const RADIUS = 90

export function magnetic() {
  if (!finePointer()) return
  const els = [...document.querySelectorAll(SELECTOR)].filter((el) => el.getClientRects().length)
  for (const el of els) {
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
