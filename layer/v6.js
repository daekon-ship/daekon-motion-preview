// V6 – nagy, tárgyszerű mozgó elemek a meglévő szekciókban (a dizájn, szöveg, elrendezés változatlan):
// szolgáltatások: lebegő, egérre/görgetésre mozduló képernyő-kártyák (a showreel mintájára), amelyek az aktív
// szolgáltatásnál rugóval cserélődnek; folyamat: körbefutó üstökös-jel és kigyúló lépések; történet: görgetésre
// pörgő 3D évszám (2011 → 2026); vélemények: térbeli belépő.
import { inView, scroll, spring } from 'motion'
import { animate } from 'motion/mini'
import { tilt } from './fx.js'
import { $, finePointer, ROOT } from './util.js'

const all = (sel, root = document) => [...root.querySelectorAll(sel)].filter((el) => el.getClientRects().length)
const lite = () => document.documentElement.classList.contains('dkm-lite')
const el = (tag, cls, parent) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (parent) parent.append(n)
  return n
}

// ---------- SZOLGÁLTATÁSOK ----------
// Valódi DAEKON-projektek képernyőképei; ahol nincs hozzá illő kép, illusztratív kódkártya (dekoráció).
const CODE = {
  custom: ['const rendszer = egyedi({', "  folyamat: 'a te működésed',", '  admin: true,', '})'],
  booking: ['foglalas.uj({', "  idopont: '10:30',", '  ugyfel,', '  ertesites: true,', '})'],
  notify: ["on('foglalas', (f) =>", '  ertesit(f.ugyfel))'],
  auto1: ["feladat('ismétlődő admin')", "  .utemez('minden reggel')", '  .futtat()'],
  auto2: ['// kézi munka helyett', 'adat', '  .ellenoriz()', '  .ment()', '  .kuld()'],
  auto3: ["on('ajanlatkeres', (a) =>", '  crm.ment(a))'],
  maint1: ['git commit -m "bővítés"', 'npm run build', 'npm test'],
  maint2: ['v1.0 → v1.1', '+ új modul', '~ frissítés', '✓ tesztelve'],
  maint3: ['npm update', 'npm audit'],
}
const DECKS = [
  [['img', 'kiosz-huseg-d-sm'], ['img', 'kiosz-m'], ['code', 'custom']],
  [['img', 'nefelejcs-d-sm'], ['img', 'gt-m'], ['img', 'mesegombolyag-d-sm']],
  [['img', 'kiosz-d-sm'], ['img', 'kiosz-m2'], ['img', 'kiosz-fiok']],
  [['code', 'booking'], ['img', 'kiosz-admin-m'], ['code', 'notify']],
  [['code', 'auto1'], ['code', 'auto2'], ['code', 'auto3']],
  [['code', 'maint1'], ['code', 'maint2'], ['code', 'maint3']],
]
// a három hely: 0 = hátsó fekvő (a rétegköteg mögött), 1 = elülső álló, 2 = elülső fekvő
const SLOTS = [
  { rz: -7, ry: 16, d: 0.55 },
  { rz: 6, ry: -14, d: 1 },
  { rz: 3, ry: 10, d: 0.8 },
]

function cardContent([kind, key], slot) {
  const c = el('div', `dkm-sc dkm-sc-${slot}`)
  const f = el('div', 'dkm-sc-f', c)
  if (kind === 'img') {
    const img = el('img', '', f)
    img.src = `${ROOT}assets/img/ref/${key}.webp`
    img.alt = ''
    img.decoding = 'async'
    img.draggable = false
  } else {
    f.classList.add('dkm-code')
    const bar = el('div', 'dkm-code-bar', f)
    for (let i = 0; i < 3; i++) el('i', '', bar)
    const pre = el('pre', '', f)
    pre.textContent = CODE[key].join('\n')
  }
  el('span', 'dkm-sc-glare', f)
  return c
}

const away = (s, dir) => `translate3d(${dir * 60}px, 50px, -220px) rotateY(${s.ry + dir * 55}deg) rotateZ(${s.rz}deg) scale(0.75)`
const home = (s) => `translate3d(0, 0, 0) rotateY(${s.ry}deg) rotateZ(${s.rz}deg) scale(1)`

export function servicesDeck() {
  const list = $('#szolgaltatasok .sv7-list')
  const rows = list ? [...list.querySelectorAll('.sv7-a')] : []
  if (!rows.length) return false
  const side = $('#szolgaltatasok .sv8')
  const activeIndex = () => Math.max(0, rows.findIndex((r) => r.classList.contains('is-on')))
  let cur = -1

  // ---- asztali nézet: lebegő kártyapakli a rétegköteg körül ----
  let layers = null
  const setupDesk = () => {
    if (layers || !side || !side.getClientRects().length) return
    side.classList.add('dkm-deck6')
    const back = el('div', 'dkm-sc-layer dkm-sc-back')
    const front = el('div', 'dkm-sc-layer dkm-sc-front')
    back.setAttribute('aria-hidden', 'true')
    front.setAttribute('aria-hidden', 'true')
    side.prepend(back)
    side.append(front)
    layers = [back, front, front]
    if (finePointer() && !lite()) {
      const area = $('#szolgaltatasok .sv7') || side
      tilt(back, { max: 14, area })
      tilt(front, { max: 22, area })
      // parallaxis: a kártyák mélységük szerint mozdulnak az egérrel
      area.addEventListener(
        'pointermove',
        (e) => {
          const r = area.getBoundingClientRect()
          side.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
          side.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
        },
        { passive: true },
      )
    }
    scroll((p) => side.style.setProperty('--sp', p.toFixed(4)), { target: list, offset: ['start end', 'end start'] })
  }

  const swapDesk = (i, dir) => {
    if (!layers) return
    DECKS[i].forEach((item, slot) => {
      const s = SLOTS[slot]
      const layer = layers[slot]
      const old = layer.querySelector(`.dkm-sc-${slot}:not(.is-out)`)
      if (old) {
        old.classList.add('is-out')
        animate(old, { opacity: 0, transform: away(s, -dir) }, { duration: 0.45, ease: [0.4, 0, 1, 1] }).then(() => old.remove())
      }
      const c = cardContent(item, slot)
      c.style.setProperty('--d', s.d)
      c.style.opacity = '0'
      c.style.transform = away(s, dir)
      layer.append(c)
      animate(c, { opacity: 1, transform: home(s) }, { type: spring, stiffness: 140, damping: 15, mass: 0.9, delay: 0.12 + slot * 0.09 })
    })
  }

  // ---- mobil / tablet: a sor mellé becsúszó képernyő-kártya, amikor a sor aktív ----
  let peeks = null
  const setupPeek = () => {
    if (peeks) return
    peeks = rows.map((r, i) => {
      const item = DECKS[i].find(([k, key]) => k === 'img' && /-m\d?$/.test(key)) || DECKS[i][0]
      const p = el('div', 'dkm-peek6')
      p.setAttribute('aria-hidden', 'true')
      const c = cardContent(item, 'p')
      if (item[0] === 'img' && /-m\d?$/.test(item[1])) p.classList.add('is-tall')
      p.append(c)
      r.classList.add('dkm-peek-host')
      r.prepend(p)
      return p
    })
  }

  const update = () => {
    const i = activeIndex()
    if (i === cur) return
    const dir = i > cur ? 1 : -1
    cur = i
    if (side && side.getClientRects().length) {
      setupDesk()
      swapDesk(i, dir)
    } else {
      setupPeek()
    }
    if (peeks) peeks.forEach((p, k) => p.classList.toggle('is-on', k === i))
  }

  // a képek csak a szekció közelében töltődnek be
  inView(
    list,
    () => {
      update()
      new MutationObserver(update).observe(list, { subtree: true, attributes: true, attributeFilter: ['class'] })
    },
    { margin: '0px 0px 400px 0px' },
  )
  window.addEventListener('resize', () => {
    const desk = side && side.getClientRects().length
    if ((desk && !layers) || (!desk && !peeks)) {
      cur = -1
      update()
    }
  })
  return true
}

// ---------- ÍGY DOLGOZOM: körbefutó üstökös-jelek, kigyúló lépések ----------
export function processBeam() {
  const rail = $('#folyamat .dkm-rail')
  if (!rail) return false
  rail.classList.add('dkm-rail6')
  for (let i = 0; i < 2; i++) el('span', 'dkm-comet', rail).style.animationDelay = `${i * -1.3}s`
  for (const s of all('#folyamat .pc-s')) s.classList.add('dkm-pc6')
  return true
}

// ---------- TÖRTÉNET: görgetésre pörgő, térbeli évszám ----------
export function storyYears() {
  const card = $('#rolam .st8')
  const yr = card && card.querySelector('.dkm-yr-a')
  if (!yr) return false
  yr.textContent = ''
  yr.classList.add('dkm-odo')
  el('span', 'dkm-odo-s', yr).textContent = '20'
  const tens = el('span', 'dkm-dig', yr)
  const tc = el('span', 'dkm-dig-c', tens)
  for (const d of [1, 2]) el('span', '', tc).textContent = String(d)
  const ones = el('span', 'dkm-dig', yr)
  const oc = el('span', 'dkm-dig-c', ones)
  for (let k = 0; k < 20; k++) el('span', '', oc).textContent = String(k % 10)
  let last = -1
  scroll(
    (p) => {
      const year = 2011 + Math.round(15 * Math.min(1, Math.max(0, p)))
      if (year === last) return
      last = year
      const idx = year - 2010
      oc.style.transform = `translateY(${-idx}em)`
      tc.style.transform = `translateY(${year >= 2020 ? -1 : 0}em)`
      yr.classList.toggle('is-now', year === 2026)
    },
    { target: card, offset: ['start 75%', 'end 45%'] },
  )
  if (finePointer() && !lite()) tilt(yr, { max: 26, area: card })
  return true
}

// ---------- VÉLEMÉNYEK: térbeli belépő (mobilon is), a rács változatlan ----------
export function reviewsEnter() {
  let n = 0
  const tick = () => {
    const cards = all('#velemenyek .rv-card')
    if (!cards.length) return void (++n < 40 && setTimeout(tick, 250))
    cards.forEach((c, i) => {
      if (c.getBoundingClientRect().top < innerHeight * 0.95) return
      c.style.opacity = '0'
      c.style.transform = 'perspective(900px) rotateX(-28deg) translateY(80px) scale(0.92)'
      inView(
        c,
        () => {
          animate(
            c,
            { opacity: 1, transform: 'perspective(900px) rotateX(0deg) translateY(0px) scale(1)' },
            { type: spring, stiffness: 110, damping: 17, delay: (i % 2) * 0.12 },
          ).then(() => {
            c.style.opacity = ''
            c.style.transform = ''
          })
        },
        { amount: 0.15 },
      )
    })
  }
  tick()
  return true
}
