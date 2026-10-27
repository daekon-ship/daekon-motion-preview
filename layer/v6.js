// V6 – nagy, tárgyszerű mozgó elemek a meglévő szekciókban (a dizájn, szöveg, elrendezés változatlan):
// szolgáltatások: az aktív szolgáltatáshoz illő képernyő-kártya a rétegköteg felirata alatt; folyamat: körbefutó üstökös-jel és kigyúló lépések; történet: görgetésre
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
// asztalon soronként egy kártya a „A rendszer rétegei” felirat alatt, saját helyen – nem fedi a rétegköteget;
// mobilon nincs kártya (ott a szöveg mellett nincs neki hely)
const DECKS = [
  ['img', 'kiosz-huseg-d-sm'],
  ['img', 'nefelejcs-d-sm'],
  ['img', 'kiosz-d-sm'],
  ['img', 'kiosz-fiok'],
  ['code', 'auto1'],
  ['code', 'maint1'],
]

function cardContent([kind, key]) {
  const c = el('div', 'dkm-sc')
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

export function servicesDeck() {
  const list = $('#szolgaltatasok .sv7-list')
  const rows = list ? [...list.querySelectorAll('.sv7-a')] : []
  const side = $('#szolgaltatasok .sv8')
  if (!rows.length || !side) return false
  const activeIndex = () => Math.max(0, rows.findIndex((r) => r.classList.contains('is-on')))
  let cur = -1
  let slot = null

  // abszolút pozíció a felirat alatt: a beszúrt kártya nem tolja el a rétegköteget (a .sv8 tartalma függőlegesen középre igazított)
  const place = () => {
    const cap = side.querySelector('.sv8-cap')
    if (!slot || !cap) return
    const top = cap.offsetTop + cap.offsetHeight + 22
    slot.style.top = `${top}px`
    // a ragadós oszlop a szekció végén megáll: alul helyet hagyunk, hogy a kártya ne lógjon a következő szekcióba
    side.style.marginBottom = `${Math.max(0, top + slot.offsetHeight - side.offsetHeight + 24)}px`
  }

  const swap = (i) => {
    if (!slot) {
      slot = el('div', 'dkm-sc-slot', side)
      slot.setAttribute('aria-hidden', 'true')
    }
    place()
    for (const old of slot.querySelectorAll('.dkm-sc:not(.is-out)')) {
      old.classList.add('is-out')
      animate(old, { opacity: 0, transform: 'translateY(-10px)' }, { duration: 0.25 }).then(() => old.remove())
    }
    const c = cardContent(DECKS[i] || DECKS[0])
    c.style.opacity = '0'
    c.style.transform = 'translateY(14px)'
    slot.append(c)
    animate(c, { opacity: 1, transform: 'translateY(0px)' }, { duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] })
  }

  // gyors görgetésnél nem cserélgetjük a kártyát minden soron: csak ha az aktív sor ~0,3 mp-ig változatlan
  let timer = 0
  const apply = () => {
    if (!side.getClientRects().length) return
    const i = activeIndex()
    if (i === cur) return
    cur = i
    swap(i)
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
    place()
    update()
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
      // telefonon kisebb elmozdulás és billenés nélkül (ott a nagy mozgás csúszkálásnak hatott)
      const phone = document.documentElement.classList.contains('dkm-phone')
      c.style.opacity = '0'
      c.style.translate = phone ? '0 28px' : '0 80px'
      c.style.rotate = phone ? 'x 0deg' : 'x -28deg'
      c.style.scale = phone ? '0.98' : '0.92'
      inView(
        c,
        () => {
          animate(
            c,
            { opacity: 1, translate: '0px 0px', rotate: 'x 0deg', scale: '1' },
            { type: spring, stiffness: 110, damping: phone ? 24 : 17, delay: (i % 2) * 0.12 },
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

// ---------- VÉLEMÉNYEK: kompakt kártyák – a hosszú vélemény 4 sorra csukva, „Teljes vélemény” gombbal nyitható ----------
// A szöveg szó szerint változatlan, csak összecsukva jelenik meg. Az oldal saját .rv-more gombját használjuk.
export function reviewsCompact() {
  let n = 0
  const tick = () => {
    const cards = all('#velemenyek .rv-card')
    if (!cards.length) return void (++n < 40 && setTimeout(tick, 250))
    const measure = () => {
      for (const c of cards) {
        if (c.classList.contains('dkm-open')) continue
        const p = c.querySelector('.rv-text p')
        const btn = c.querySelector('.rv-more')
        if (!p || !btn) continue
        c.classList.add('dkm-clamp')
        if (p.scrollHeight <= p.clientHeight + 2) c.classList.remove('dkm-clamp')
      }
    }
    for (const c of cards) {
      const btn = c.querySelector('.rv-more')
      if (!btn) continue
      // capture: az oldal esetleges saját kezelője ne kapcsolja vissza
      btn.addEventListener(
        'click',
        (e) => {
          e.stopImmediatePropagation()
          const open = c.classList.toggle('dkm-open')
          btn.setAttribute('aria-expanded', String(open))
          btn.textContent = open ? 'Összecsukás' : 'Teljes vélemény'
        },
        true,
      )
    }
    measure()
    window.addEventListener('resize', measure)
    if (document.fonts) document.fonts.ready.then(measure)
  }
  tick()
  return true
}
