// Projekt-showreel (ötlet: sitereel.ai lebegő kártyái + motion.dev rugós gesztusai).
// A 9 valódi projekt meglévő képernyőképe lebeg térben a „Munkák” szekció előtt:
// - belépéskor rugóval, mélység szerint egymás után érkeznek,
// - görgetésre és (asztalon) egérre mélységgel elmozdulnak (parallaxis),
// - egérrel megfoghatók és elhúzhatók, elengedéskor rugóval visszaugranak; kattintásra megnyílik az élő oldal.
// A kártyák díszítő ismétlések (aria-hidden, nem fókuszálhatók): ugyanezek a linkek közvetlenül alatta, a listában vannak.
import { inView, scroll, spring } from 'motion'
import { animate } from './anim.js'
import { whileVisible } from './fx.js'
import { $, finePointer, shotFor } from './util.js'

// x/y: a kártya közepe a színpadon (%), w: szélesség, r: döntés (fok), d: mélység (0–1, a nagyobb közelebb van)
// m: mobilos elhelyezés [x, y, w, r] vagy null (mobilon nem jelenik meg)
const LAYOUT = {
  'kioszpizza.hu': { x: 17, y: 30, w: 'min(23vw, 360px)', r: -7, d: 1, m: [27, 19, '54vw', -6] },
  'nefelejcsbakonybel.hu': { x: 82, y: 27, w: 'min(22vw, 340px)', r: 6, d: 0.95, m: [79, 15, '46vw', 7] },
  'mesegombolyag.hu': { x: 77, y: 77, w: 'min(20vw, 310px)', r: -5, d: 0.9, m: [76, 85, '48vw', -5] },
  'dieselmotorjavitas.hu': { x: 23, y: 77, w: 'min(19vw, 300px)', r: 5, d: 0.85, m: [24, 87, '46vw', 6] },
  'epuletesmedence.hu': { x: 40, y: 12, w: 'min(12vw, 190px)', r: -4, d: 0.5, m: null },
  'rovarirtofiuk.hu': { x: 61, y: 13, w: 'min(11.5vw, 180px)', r: 5, d: 0.5, m: null },
  'tetojavitomester.hu': { x: 4, y: 55, w: 'min(11vw, 170px)', r: 9, d: 0.45, m: null },
  'lapozunk.hu': { x: 96, y: 53, w: 'min(11vw, 170px)', r: -9, d: 0.45, m: null },
  'gt-lakasfelujitas.hu': { x: 54, y: 91, w: 'min(12vw, 190px)', r: 3, d: 0.55, m: null },
}

const SPRING_IN = { type: spring, stiffness: 120, damping: 16, mass: 0.9 }
const SPRING_BACK = { type: spring, stiffness: 260, damping: 15 }

export function reel({ still }) {
  const work = $('#work')
  const rows = work ? [...work.querySelectorAll('.rl-a')] : []
  if (!work || !rows.length || document.querySelector('.dkm-reel')) return false

  const sec = document.createElement('section')
  sec.className = 'dkm-reel'
  sec.setAttribute('aria-label', 'Projektek – showreel')

  const stage = document.createElement('div')
  stage.className = 'dkm-reel-stage'
  sec.append(stage)

  const beam = document.createElement('div')
  beam.className = 'dkm-beam'
  beam.setAttribute('aria-hidden', 'true')
  stage.append(beam)

  const deck = document.createElement('div')
  deck.className = 'dkm-deck'
  deck.setAttribute('aria-hidden', 'true')
  stage.append(deck)

  const cards = []
  for (const a of rows) {
    let host
    try {
      host = new URL(a.href).hostname.replace(/^www\./, '')
    } catch {
      continue
    }
    const L = LAYOUT[host]
    const src = shotFor(a.href)
    if (!L || !src) continue
    const card = document.createElement('a')
    card.className = 'dkm-card'
    card.href = a.href
    card.target = '_blank'
    card.rel = 'noopener'
    card.tabIndex = -1
    card.draggable = false
    const s = card.style
    s.setProperty('--x', L.x)
    s.setProperty('--y', L.y)
    s.setProperty('--w', L.w)
    s.setProperty('--r', `${L.r}deg`)
    s.setProperty('--d', L.d)
    s.zIndex = String(Math.round(L.d * 10))
    if (L.m) {
      s.setProperty('--xm', L.m[0])
      s.setProperty('--ym', L.m[1])
      s.setProperty('--wm', L.m[2])
      s.setProperty('--rm', `${L.m[3]}deg`)
    } else card.dataset.m = '0'

    const inner = document.createElement('span')
    inner.className = 'dkm-card-in'
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    img.width = 720
    img.height = 450
    img.loading = 'lazy'
    img.decoding = 'async'
    img.draggable = false
    img.addEventListener('error', () => card.remove()) // egy hiányzó kép nem hagy üres keretet
    const name = document.createElement('span')
    name.className = 'dkm-card-name'
    name.textContent = (a.querySelector('.rl-name') || a).textContent.replace(/\s*Kiemelt\s*$/i, '').trim()
    const shine = document.createElement('span')
    shine.className = 'dkm-card-shine'
    inner.append(img, shine, name)
    // lebegés külön rétegen, hogy ne ütközzön a belépő/húzó transzformációval
    const float = document.createElement('span')
    float.className = 'dkm-float'
    float.style.setProperty('--fd', `${(6 + (cards.length % 4) * 1.3).toFixed(1)}s`)
    float.style.setProperty('--fo', `${(-cards.length * 0.9).toFixed(1)}s`)
    float.append(inner)
    card.append(float)
    deck.append(card)
    cards.push({ card, inner, d: L.d, r: L.r })
  }
  if (!cards.length) return false

  const copy = document.createElement('div')
  copy.className = 'dkm-reel-copy'
  const k = document.createElement('p')
  k.className = 'dkm-reel-k'
  k.textContent = `Showreel · ${cards.length} élő projekt`
  const h = document.createElement('p')
  h.className = 'dkm-reel-h'
  const h1 = document.createElement('span')
  h1.textContent = 'Minden kártya egy élő oldal.'
  const h2 = document.createElement('span')
  h2.className = 'dkm-reel-h2'
  h2.textContent = finePointer() ? 'Fogd meg, húzd el, kattints rá.' : 'Koppints rá, és megnyílik.'
  h.append(h1, h2)
  const cta = document.createElement('a')
  cta.className = 'dkm-reel-cta'
  cta.href = '#ai'
  cta.textContent = 'Hasonló rendszert szeretnél? Kérj ajánlatot '
  const circ = document.createElement('span')
  circ.className = 'dkm-circ'
  circ.setAttribute('aria-hidden', 'true')
  circ.textContent = '→'
  cta.append(circ)
  copy.append(k, h, cta)
  stage.append(copy)

  // a tulajdonos kérésére (2026-10-26) a főoldalon csak a showreel mutatja a projekteket: a showreel a #work szekcióba
  // kerül (így a „Munkák” menüpont és a „Munkáim megtekintése” gomb ide visz), a régi projektlistát a CSS elrejti
  work.prepend(sec)
  work.classList.add('dkm-work-reel')
  if (still) return true
  whileVisible(sec, 'is-live') // a lebegés csak akkor fut, amikor a szekció látszik

  // 1) belépés: mélység szerint, a közeliek előbb, rugóval
  for (const c of cards) {
    c.inner.style.opacity = '0'
    c.inner.style.transform = `translateY(80px) scale(0.72) rotate(${c.r * 1.8}deg)`
  }
  inView(
    stage,
    () => {
      const order = [...cards].sort((a, b) => b.d - a.d)
      order.forEach((c, i) => {
        animate(c.inner, { opacity: 1 }, { duration: 0.6, delay: 0.08 * i, ease: 'ease-out' })
        animate(c.inner, { transform: 'none' }, { ...SPRING_IN, delay: 0.08 * i }).finished.then(() => {
          c.inner.style.opacity = ''
          c.inner.style.transform = ''
        })
      })
      for (const el of [k, h, cta]) el.classList.add('is-in')
    },
    { amount: 0.25 },
  )

  // 2) görgetés + egér: mélységgel arányos elmozdulás, egyetlen rAF-ciklusban, csak amíg a szekció látszik
  const fine = finePointer()
  let sp = 0.5 // görgetési haladás a szekción át (0–1)
  const tgt = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  let raf = 0
  let visible = false

  const frame = () => {
    raf = 0
    cur.x += (tgt.x - cur.x) * 0.08
    cur.y += (tgt.y - cur.y) * 0.08
    const off = fine ? 0.5 - sp : 0 // telefonon nincs görgetési parallaxis (a kártyák a szöveghez képest nem csúsznak)
    for (const c of cards) {
      c.card.style.setProperty('--px', `${(cur.x * 46 * c.d).toFixed(2)}px`)
      c.card.style.setProperty('--py', `${(off * 300 * c.d + cur.y * 30 * c.d).toFixed(2)}px`)
    }
    beam.style.setProperty('--bp', off.toFixed(3))
    if (visible && (Math.abs(tgt.x - cur.x) > 0.001 || Math.abs(tgt.y - cur.y) > 0.001)) raf = requestAnimationFrame(frame)
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }

  if (fine)
    scroll(
      (p) => {
        sp = p
        if (visible) kick()
      },
      { target: sec, offset: ['start end', 'end start'] },
    )
  inView(sec, () => {
    visible = true
    kick()
    return () => {
      visible = false
    }
  })
  if (fine) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect()
      tgt.x = (e.clientX - r.left) / r.width - 0.5
      tgt.y = (e.clientY - r.top) / r.height - 0.5
      kick()
    })
    stage.addEventListener('pointerleave', () => {
      tgt.x = 0
      tgt.y = 0
      kick()
    })
  }

  // 2b) a kártya a kurzor felé dől, a fényes visszaverődés követi az egeret (csak egérrel, gyenge gépen nem)
  if (fine && !document.documentElement.classList.contains('dkm-lite')) {
    for (const c of cards) {
      c.card.addEventListener('pointermove', (e) => {
        if (c.card.classList.contains('is-grab')) return
        const r = c.inner.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        const mag = Math.hypot(nx, ny)
        c.inner.style.rotate = `${(-ny).toFixed(3)} ${nx.toFixed(3)} 0 ${(mag * 16).toFixed(2)}deg`
        c.inner.style.setProperty('--sx', `${((nx + 0.5) * 100).toFixed(1)}%`)
        c.inner.style.setProperty('--sy', `${((ny + 0.5) * 100).toFixed(1)}%`)
      })
      c.card.addEventListener('pointerleave', () => {
        c.inner.style.rotate = ''
      })
    }
  }

  // 3) megfogás és elhúzás (csak egérrel/tollal – érintésnél a görgetés az elsődleges), rugós visszaugrás
  for (const c of cards) {
    let start = null
    let moved = false
    let z = ''
    c.card.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      start = { x: e.clientX, y: e.clientY }
      moved = false
      z = c.card.style.zIndex
      c.card.style.zIndex = '30'
      c.card.setPointerCapture(e.pointerId)
      c.card.classList.add('is-grab')
      c.inner.style.rotate = ''
    })
    c.card.addEventListener('pointermove', (e) => {
      if (!start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true
      c.inner.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.04}deg) scale(1.06)`
    })
    const release = () => {
      if (!start) return
      start = null
      c.card.classList.remove('is-grab')
      animate(c.inner, { transform: 'none' }, SPRING_BACK).finished.then(() => {
        c.inner.style.transform = ''
        c.card.style.zIndex = z
      })
    }
    c.card.addEventListener('pointerup', release)
    c.card.addEventListener('pointercancel', release)
    c.card.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault()
        moved = false
      }
    })
  }
}
