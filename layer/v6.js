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
// asztalon két kártya a rétegköteg jobb oldalán: A = álló (telefon), B = fekvő; mobilon csak fekvő kép, kódkártya nélkül
const DECKS = [
  [['img', 'kiosz-m'], ['img', 'kiosz-huseg-d-sm']],
  [['img', 'gt-m'], ['img', 'nefelejcs-d-sm']],
  [['img', 'kiosz-m2'], ['img', 'kiosz-d-sm']],
  [['img', 'kiosz-admin-m'], ['code', 'booking']],
  [['code', 'auto2'], ['code', 'auto1']],
  [['code', 'maint2'], ['code', 'maint1']],
]
const PEEKS = ['kiosz-huseg-d-sm', 'nefelejcs-d-sm', 'kiosz-d-sm', 'kiosz-fiok', null, null]
const SLOTS = [
  { rz: 5, ry: -12, d: 1 },
  { rz: -3, ry: -8, d: 0.8 },
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

const away = (s) => `translate3d(40px, 30px, -160px) rotateY(${s.ry - 30}deg) rotateZ(${s.rz}deg) scale(0.85)`
const home = (s) => `translate3d(0, 0, 0) rotateY(${s.ry}deg) rotateZ(${s.rz}deg) scale(1)`

export function servicesDeck() {
  const list = $('#szolgaltatasok .sv7-list')
  const rows = list ? [...list.querySelectorAll('.sv7-a')] : []
  if (!rows.length) return false
  const side = $('#szolgaltatasok .sv8')
  const activeIndex = () => Math.max(0, rows.findIndex((r) => r.classList.contains('is-on')))
  let cur = -1

  // ---- asztali nézet: két lebegő kártya a rétegköteg jobb oldalán (a felirat fölött, a köteggel együtt marad) ----
  let layer = null
  const setupDesk = () => {
    if (layer || !side || !side.getClientRects().length) return
    side.classList.add('dkm-deck6')
    layer = el('div', 'dkm-sc-layer dkm-sc-front')
    layer.setAttribute('aria-hidden', 'true')
    side.append(layer)
    if (finePointer() && !lite()) {
      const area = $('#szolgaltatasok .sv7') || side
      tilt(layer, { max: 6, area })
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
  }

  const swapDesk = (i) => {
    if (!layer) return
    for (const old of layer.querySelectorAll('.dkm-sc:not(.is-out)')) {
      old.classList.add('is-out')
      animate(old, { opacity: 0, transform: away(SLOTS[+old.dataset.slot]) }, { duration: 0.3, ease: [0.4, 0, 1, 1] }).then(() => old.remove())
    }
    DECKS[i].forEach((item, slot) => {
      const s = SLOTS[slot]
      const c = cardContent(item, slot)
      c.dataset.slot = slot
      c.style.setProperty('--d', s.d)
      c.style.opacity = '0'
      c.style.transform = away(s)
      layer.append(c)
      animate(c, { opacity: 1, transform: home(s) }, { type: spring, stiffness: 120, damping: 20, delay: 0.15 + slot * 0.08 })
    })
  }

  // ---- mobil / tablet: a sor mellé becsúszó képernyő-kártya, amikor a sor aktív ----
  let peeks = null
  const setupPeek = () => {
    if (peeks) return
    peeks = rows.map((r, i) => {
      if (!PEEKS[i]) return null
      // mobilon fekvő kép a sor jobb alsó, üres sarkában – a linkek sora mellett
      const p = el('div', 'dkm-peek6')
      p.setAttribute('aria-hidden', 'true')
      p.append(cardContent(['img', PEEKS[i]], 'p'))
      r.classList.add('dkm-peek-host')
      r.prepend(p)
      return p
    })
  }

  // gyors görgetésnél nem cserélgetjük a kártyákat minden soron: csak ha az aktív sor ~0,3 mp-ig változatlan
  let timer = 0
  const apply = () => {
    const i = activeIndex()
    if (i === cur) return
    cur = i
    if (side && side.getClientRects().length) {
      setupDesk()
      swapDesk(i)
    } else setupPeek()
    if (peeks) peeks.forEach((p, k) => p && p.classList.toggle('is-on', k === i))
  }
  const update = () => {
    clearTimeout(timer)
    timer = setTimeout(apply, cur < 0 ? 0 : 280)
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
    if ((desk && !layer) || (!desk && !peeks)) {
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
  if (!yr || !yr.getClientRects().length) return false // mobilon nincs pörgő évszám
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
  if (finePointer() && !lite()) tilt(yr, { max: 10, area: card })
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
      // az oldal a kártya transform-ját rögzíti, ezért az egyedi transzformációs tulajdonságokat animáljuk
      c.style.opacity = '0'
      c.style.translate = '0 80px'
      c.style.rotate = 'x -28deg'
      c.style.scale = '0.92'
      inView(
        c,
        () => {
          animate(
            c,
            { opacity: 1, translate: '0px 0px', rotate: 'x 0deg', scale: '1' },
            { type: spring, stiffness: 110, damping: 17, delay: (i % 2) * 0.12 },
          ).then(() => {
            for (const k of ['opacity', 'translate', 'rotate', 'scale']) c.style[k] = ''
          })
        },
        { amount: 0.15 },
      )
    })
  }
  tick()
  return true
}
