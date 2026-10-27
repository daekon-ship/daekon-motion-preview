// V5 – szemmel látható, térhatású effektek a meglévő elemeken (a dizájn, színek, betűk, elrendezés változatlan).
// A V4 mérés szerint a korábbi effektek a képernyő 0,1–2%-át változtatták meg, mobilon szinte semmit:
// ezek a modulok mobilon is látható, görgetéshez kötött mozgást adnak, asztalon egérre is reagálnak.
import { inView, scroll, stagger } from 'motion'
import { animate } from './anim.js'
import { tilt, whileVisible } from './fx.js'
import { $, finePointer } from './util.js'

const all = (sel) => [...document.querySelectorAll(sel)].filter((el) => el.getClientRects().length)
const lite = () => document.documentElement.classList.contains('dkm-lite')
const el = (tag, cls, parent) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (parent) parent.append(n)
  return n
}

// Egér-parallaxis: egyetlen rugalmas mutató, amit a rétegek mélységük szerint használnak (CSS-változók: --mx, --my)
function pointerVars(area, target = area) {
  if (!finePointer()) return
  const tgt = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  let raf = 0
  const frame = () => {
    raf = 0
    cur.x += (tgt.x - cur.x) * 0.06
    cur.y += (tgt.y - cur.y) * 0.06
    target.style.setProperty('--mx', cur.x.toFixed(4))
    target.style.setProperty('--my', cur.y.toFixed(4))
    if (Math.abs(tgt.x - cur.x) > 0.0005 || Math.abs(tgt.y - cur.y) > 0.0005) raf = requestAnimationFrame(frame)
  }
  area.addEventListener(
    'pointermove',
    (e) => {
      const r = area.getBoundingClientRect()
      tgt.x = (e.clientX - r.left) / r.width - 0.5
      tgt.y = (e.clientY - r.top) / r.height - 0.5
      if (!raf) raf = requestAnimationFrame(frame)
    },
    { passive: true },
  )
}

// HERO – többrétegű, lassan mozgó háttérrendszer a meglévő háttér és a lila fények közé (a szöveg és a monitor előtte marad)
export function heroField() {
  const stage = $('#top > div')
  if (!stage) return false
  // a meglévő lila fényrétegek (.h6-env) fölé, de a monitor és a szöveg alá kerül – screen keveréssel csak fényt ad hozzá
  const env = stage.querySelector(':scope > .h6-env')
  const bg = env || [...stage.children].find((c) => getComputedStyle(c).backgroundColor === 'rgb(5, 5, 5)')
  const field = el('div', 'dkm-field')
  field.setAttribute('aria-hidden', 'true')

  // 1. réteg: széles fényszalagok (lassan úszó „aurora”)
  const far = el('div', 'dkm-fl dkm-fl-far', field)
  for (let i = 0; i < 3; i++) el('span', `dkm-ribbon dkm-ribbon-${i + 1}`, far)
  // 2. réteg: nagy, lassan forgó fénygyűrűk (mélység)
  const mid = el('div', 'dkm-fl dkm-fl-mid', field)
  for (let i = 0; i < 3; i++) el('span', `dkm-ring dkm-ring-${i + 1}`, mid)
  // 3. réteg: lebegő fénypontmező (közel – erősebb parallaxis)
  const near = el('div', 'dkm-fl dkm-fl-near', field)
  const count = matchMedia('(max-width: 699px)').matches ? 34 : 56
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < count; i++) {
    const d = el('i', 'dkm-mote', near)
    const size = 2.5 + rnd() * 4.5
    d.style.cssText = `left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 100).toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--t:${(9 + rnd() * 14).toFixed(1)}s;--o:${(-rnd() * 20).toFixed(1)}s;--a:${(0.35 + rnd() * 0.6).toFixed(2)}`
    if (rnd() > 0.82) d.classList.add('is-lime')
  }

  if (bg) bg.after(field)
  else stage.prepend(field)
  whileVisible(field, 'is-live')
  pointerVars(stage, field)
  // görgetés: a rétegek mélység szerint eltérő sebességgel csúsznak (a hero 175vh hosszú, ragadós)
  const hero = $('#top')
  scroll((p) => field.style.setProperty('--sp', p.toFixed(4)), { target: hero, offset: ['start start', 'end start'] })
  return true
}

// SZOLGÁLTATÁSOK – a sorok térben felbillenve érkeznek; asztalon a sor a kurzor felé dől és kiemelkedik,
// a nagy sorszám ellentétesen mozdul (mélység), a bal oldali 3D rétegköteg erősebben dől
export function servicesDepth() {
  const list = $('#szolgaltatasok .sv7-list')
  const rows = list ? [...list.querySelectorAll('.sv7-a')] : []
  if (!rows.length) return false
  list.classList.add('dkm-sv3d')
  for (const r of rows) {
    if (r.getBoundingClientRect().top > innerHeight) r.classList.add('dkm-flip')
  }
  inView(
    list,
    () => {
      rows.forEach((r, i) => setTimeout(() => r.classList.remove('dkm-flip'), i * 110))
    },
    { amount: 0.05 },
  )
  // ha a lista már részben látszik, a többi sor egyenként, a nézetbe érve billen fel
  for (const r of rows)
    inView(
      r,
      () => {
        r.classList.remove('dkm-flip')
      },
      { amount: 0.3 },
    )

  return true
}

// A DAEKON TÖRTÉNETE – a kártya térben a helyére billen, mögötte mélységben úszó évszámok (2011 · 2026),
// a jobb oldali szöveg mellett idővonal, amelynek csomópontjai olvasás közben kigyúlnak
export function storyDepth() {
  const card = $('#rolam .st8')
  if (!card) return false
  card.classList.add('dkm-st5')
  card.parentElement.classList.add('dkm-persp-st')
  const depth = el('div', 'dkm-st-depth')
  depth.setAttribute('aria-hidden', 'true')
  for (const [y, cls] of [
    ['2011', 'dkm-yr dkm-yr-a'],
    ['2026', 'dkm-yr dkm-yr-b'],
  ])
    el('span', cls, depth).textContent = y
  card.prepend(depth)

  scroll(
    (p) => {
      card.style.setProperty('--sp', p.toFixed(4))
    },
    { target: card, offset: ['start end', 'end start'] },
  )
  return true
}

// DAEKON OS – pásztázó vonal + pontmátrix a kártyán (a V6-ban a 3D hálózatot a world.js osNetwork rajzolja)
export function osTech() {
  const sec = $('#daekon-os')
  const card = sec && sec.querySelector('.os8-in')
  if (!card) return false
  const scan = el('div', 'dkm-scan')
  scan.setAttribute('aria-hidden', 'true')
  card.append(scan)

  sec.classList.add('dkm-os5')
  whileVisible(sec, 'is-live')

  const place = () => scan.style.setProperty('--scan-h', `${Math.round(card.getBoundingClientRect().height)}px`)
  place()
  window.addEventListener('resize', place)
  setTimeout(place, 1200)
  return true
}

// FOOTER – görgetésre kinyíló fényhorizont, felkelő fénykúp, perspektivikus rácspadló; a zárómondat a görgetéssel gyullad ki
export function footerStage() {
  const ft = $('footer.ft')
  if (!ft) return false
  const stage = el('div', 'dkm-ft-stage')
  stage.setAttribute('aria-hidden', 'true')
  el('span', 'dkm-ft-horizon', stage)
  el('span', 'dkm-ft-cone', stage)
  ft.prepend(stage)
  ft.classList.add('dkm-ft5')
  whileVisible(ft, 'is-live')
  const t = ft.querySelector('.ft-close-t')
  if (t) {
    t.classList.add('dkm-ignite') // a görgetéssel kigyulladó zárómondat váltja a V4-es egyszeri felragyogást
    t.querySelector('.dkm-shine')?.classList.remove('dkm-shine')
  }
  scroll(
    (p) => {
      ft.style.setProperty('--f', p.toFixed(4))
    },
    { target: ft, offset: ['start end', 'end end'] },
  )
  return true
}

// VÉLEMÉNYEK – asztalon a kártya a kurzor felé dől (a meglévő emelkedés és fény mellé); mobilon görgetésre
// a rács kártyái enyhe mélységből érkeznek (a meglévő belépő mellé, a szöveg mindig olvasható)
export function reviewsDepth() {
  let n = 0
  const tick = () => {
    const cards = all('#velemenyek .rv-card')
    if (!cards.length) return void (++n < 40 && setTimeout(tick, 250))
    const list = cards[0].parentElement
    list.classList.add('dkm-rv3d')
    if (finePointer() && !lite())
      for (const c of cards) {
        c.addEventListener('pointermove', (e) => {
          const b = c.getBoundingClientRect()
          const nx = (e.clientX - b.left) / b.width - 0.5
          const ny = (e.clientY - b.top) / b.height - 0.5
          c.style.rotate = `${(-ny).toFixed(3)} ${nx.toFixed(3)} 0 ${(Math.hypot(nx, ny) * 7).toFixed(2)}deg`
        })
        c.addEventListener('pointerleave', () => (c.style.rotate = ''))
      }
  }
  tick()
  return true
}

// Belépő a DAEKON OS modulokra és a hálózatra: a csomagok a modulok felvillanása után indulnak
export function osIntro() {
  const mods = all('.dkm-os-mods li')
  if (!mods.length) return false
  inView(mods[0].parentElement, () => {
    animate(mods, { opacity: [0, 1], transform: ['translateY(10px) scale(0.92)', 'none'] }, { duration: 0.6, delay: stagger(0.09), ease: [0.16, 1, 0.3, 1] })
  })
  return true
}
