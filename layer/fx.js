// Újrahasznosítható effekt-építőkockák (egy rAF-ciklus elemenként, csak amíg kell).
import { inView } from 'motion'
import { finePointer } from './util.js'

/** Egérkövető fény: --dkm-x / --dkm-y CSS-változók az elemen (csak egérrel). A fényt a CSS rajzolja. */
export function spotlight(els) {
  if (!finePointer()) return
  for (const el of els) {
    let raf = 0
    let last = null
    el.addEventListener(
      'pointermove',
      (e) => {
        last = e
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          const r = el.getBoundingClientRect()
          el.style.setProperty('--dkm-x', `${(last.clientX - r.left).toFixed(0)}px`)
          el.style.setProperty('--dkm-y', `${(last.clientY - r.top).toFixed(0)}px`)
        })
      },
      { passive: true },
    )
  }
}

/**
 * Egérre dőlő elem (3D): a dőlés rugalmasan követi a kurzort, elhagyáskor visszaáll.
 * A `rotate` egyedi transzformációs tulajdonságot használja, így nem ütközik az elem saját `transform`-jával.
 */
export function tilt(el, { max = 4, area = el, perspective = 1000 } = {}) {
  if (!finePointer()) return
  const tgt = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  let raf = 0
  const frame = () => {
    raf = 0
    cur.x += (tgt.x - cur.x) * 0.1
    cur.y += (tgt.y - cur.y) * 0.1
    const mag = Math.hypot(cur.x, cur.y)
    el.style.rotate = mag < 0.002 ? '' : `${(-cur.y).toFixed(4)} ${cur.x.toFixed(4)} 0 ${(mag * max).toFixed(3)}deg`
    if (Math.abs(tgt.x - cur.x) > 0.001 || Math.abs(tgt.y - cur.y) > 0.001) raf = requestAnimationFrame(frame)
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  if (perspective) el.style.transformOrigin = 'center'
  area.addEventListener(
    'pointermove',
    (e) => {
      const r = area.getBoundingClientRect()
      tgt.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
      tgt.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
      kick()
    },
    { passive: true },
  )
  area.addEventListener('pointerleave', () => {
    tgt.x = 0
    tgt.y = 0
    kick()
  })
}

/** Egyszeri osztály, amikor az elem a nézetbe ér (CSS-animációk indítója). */
export function onEnter(el, cls, amount = 0.35) {
  inView(
    el,
    () => {
      el.classList.add(cls)
    },
    { amount },
  )
}

/** Osztály, amíg az elem látszik (folyamatos CSS-animációk csak ilyenkor futnak). */
export function whileVisible(el, cls) {
  inView(el, () => {
    el.classList.add(cls)
    return () => el.classList.remove(cls)
  })
}
