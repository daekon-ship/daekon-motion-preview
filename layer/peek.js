// Lebegő előnézet a projektlistán (csak egérrel): a sor fölött a kurzort rugalmasan követi az adott oldal képernyőképe.
import { animate } from 'motion/mini'
import { $, finePointer, shotFor } from './util.js'

export function peek() {
  if (!finePointer() || !matchMedia('(min-width: 900px)').matches) return
  const list = $('#work .rl-list')
  if (!list) return

  const box = document.createElement('div')
  box.className = 'dkm-peek'
  box.setAttribute('aria-hidden', 'true')
  const img = document.createElement('img')
  img.alt = ''
  img.width = 720
  img.height = 450
  img.decoding = 'async'
  box.append(img)
  document.body.append(box)

  const tgt = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  let raf = 0
  let on = false
  let current = ''

  const frame = () => {
    raf = 0
    cur.x += (tgt.x - cur.x) * 0.16
    cur.y += (tgt.y - cur.y) * 0.16
    const tilt = Math.max(-8, Math.min(8, (tgt.x - cur.x) * 0.06))
    box.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`
    if (on || Math.abs(tgt.x - cur.x) > 0.5) raf = requestAnimationFrame(frame)
  }

  const show = (row, e) => {
    const src = shotFor(row.href)
    if (!src) return
    if (src !== current) {
      current = src
      img.src = src
    }
    if (!on) {
      cur.x = tgt.x = e.clientX + 28
      cur.y = tgt.y = e.clientY - 90
      on = true
      animate(box, { opacity: [0, 1], scale: [0.86, 1] }, { duration: 0.32, ease: [0.16, 1, 0.3, 1] })
    }
    if (!raf) raf = requestAnimationFrame(frame)
  }

  const hide = () => {
    if (!on) return
    on = false
    animate(box, { opacity: 0, scale: 0.9 }, { duration: 0.2, ease: 'ease-in' })
  }

  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const row = e.target.closest && e.target.closest('.rl-a')
    if (!row) return hide()
    // a kép a kurzortól jobbra, és sosem lóg ki a nézetből
    const w = box.offsetWidth || 300
    tgt.x = Math.min(e.clientX + 28, window.innerWidth - w - 16)
    tgt.y = e.clientY - 90
    show(row, e)
  })
  list.addEventListener('pointerleave', hide)
  window.addEventListener('scroll', hide, { passive: true })
}
