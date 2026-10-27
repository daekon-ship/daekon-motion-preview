// Szekciónkénti egyedi effektek – mindegyik a szekció meglévő dizájnjából indul ki, új tartalmat nem talál ki.
import { inView, scroll } from 'motion'
import { animate } from 'motion/mini'
import { onEnter, spotlight, tilt, whileVisible } from './fx.js'
import { $, belowFold, finePointer } from './util.js'

const all = (sel) => [...document.querySelectorAll(sel)].filter((el) => el.getClientRects().length)

// HERO – a meglévő lila fények mellé egy egérkövető fényfolt (screen keveréssel, a kompozíció változatlan)
export function heroLight() {
  if (!finePointer()) return false
  const stage = $('#top > div')
  if (!stage) return false
  const glow = document.createElement('div')
  glow.className = 'dkm-hero-glow'
  glow.setAttribute('aria-hidden', 'true')
  stage.append(glow)
  const tgt = { x: 0.3, y: 0.4 }
  const cur = { x: 0.3, y: 0.4 }
  let raf = 0
  const frame = () => {
    raf = 0
    cur.x += (tgt.x - cur.x) * 0.06
    cur.y += (tgt.y - cur.y) * 0.06
    glow.style.transform = `translate3d(${(cur.x * 100).toFixed(2)}vw, ${(cur.y * 100).toFixed(2)}vh, 0)`
    if (Math.abs(tgt.x - cur.x) > 0.0005 || Math.abs(tgt.y - cur.y) > 0.0005) raf = requestAnimationFrame(frame)
  }
  stage.addEventListener(
    'pointermove',
    (e) => {
      tgt.x = e.clientX / window.innerWidth
      tgt.y = e.clientY / window.innerHeight
      glow.classList.add('is-on')
      if (!raf) raf = requestAnimationFrame(frame)
    },
    { passive: true },
  )
  stage.addEventListener('pointerleave', () => glow.classList.remove('is-on'))
}

// SZEKCIÓHATÁROK – a szekció felső vonalán egyszer végigfut egy fénycsík, amikor a szekció belép
export function separators() {
  for (const el of all('.sw, .sv, .rv, .pc, .me, .os8, .fq6, .ct, .dkm-reel, footer.ft')) {
    el.classList.add('dkm-sep')
    onEnter(el, 'dkm-sep-on', 0.15)
  }
}

// SZOLGÁLTATÁSOK – sorok: egérkövető fény + rugós címmozdulat; az aktív sor felső vonala kirajzolódik;
// a bal oldali 3D rétegköteg az egér felé dől
export function services() {
  const rows = all('#szolgaltatasok .sv7-a')
  spotlight(rows)
  const stack = $('#szolgaltatasok .sv8-stack')
  if (stack) stack.parentElement.classList.add('dkm-persp')
}

// A DAEKON TÖRTÉNETE – fénypont fut végig a 2011–2026 vonalon; a bekezdések olvasás közben egymás után kerülnek előtérbe
export function story() {
  const card = $('#rolam .st8')
  if (!card) return false
  card.classList.add('dkm-st')
  spotlight([card])
  // a fénypont pontosan a vonal végpontjainak magasságában fusson
  const line = card.querySelector('.st8-line')
  // a fénypont magán a vonalon fut: a vonal a .st8-line ::before eleme (a <i> elemek az évszám-feliratok alatta –
  // korábban azokhoz igazodott, ezért telefonon a pont a „2026” feliratra csúszott)
  const align = () => {
    if (!line) return
    const b = getComputedStyle(line, '::before')
    const top = parseFloat(b.top)
    if (Number.isNaN(top)) return
    line.style.setProperty('--dkm-ly', `${(top + (parseFloat(b.height) || 1) / 2).toFixed(1)}px`)
  }
  align()
  window.addEventListener('resize', align)
  scroll(
    (p) => {
      card.style.setProperty('--dkm-p', p.toFixed(4))
    },
    { target: card, offset: ['start 80%', 'end 60%'] },
  )
  const paras = [...card.querySelectorAll('.st8-body p, .st8-body h3')]
  // az idővonal kitöltése pontosan az utolsó kigyúlt pont közepéig ér (korábban a kártya görgetése hajtotta,
  // ezért elcsúszott a pontokhoz képest). offsetTop: a bekezdések belépő eltolása nem torzítja
  const fill = () => {
    const tl = card.querySelector('.dkm-thread-line')
    const last = paras.filter((p) => p.classList.contains('is-read')).pop()
    if (!tl || !last) return
    const b = getComputedStyle(last, '::before')
    const y = last.offsetTop + (parseFloat(b.top) || 0) + (parseFloat(b.height) || 12) / 2 - tl.offsetTop
    tl.style.setProperty('--tf', `${Math.max(0, y).toFixed(1)}px`)
  }
  window.addEventListener('resize', fill)
  for (const p of paras) {
    p.classList.add('dkm-read')
    // az olvasási sáv fölé érve kiemelődik, és utána úgy is marad (a már elolvasott szöveg nem halványul vissza)
    inView(
      p,
      () => {
        p.classList.add('is-read')
        fill()
      },
      { margin: '0px 0px -38% 0px', amount: 'some' },
    )
  }
}

// VÉLEMÉNYEK – asztalon finom emelkedés és egérkövető fény (mobilon a rács statikus marad)
export function reviews() {
  if (!finePointer()) return false
  // a véleményeket az oldal később tölti be (reviews.json): megvárjuk, amíg a kártyák megjelennek
  let n = 0
  const tick = () => {
    const cards = all('#velemenyek .rv-card').filter((c) => !c.classList.contains('dkm-rv'))
    if (cards.length) {
      for (const c of cards) c.classList.add('dkm-rv')
      spotlight(cards)
      return
    }
    if (++n < 40) setTimeout(tick, 250)
  }
  tick()
}

// DAEKON OS – lassan vándorló háttérfény (csak amíg látszik), egérre dőlő kártya, és a leírt modulok „rendszerellenőrzése”
// (a modulnevek szó szerint a meglévő leírásból; nem valós idejű adat, csak egyszeri felvillanás)
export function os() {
  const card = $('#daekon-os .os8-in')
  if (!card) return false
  card.classList.add('dkm-os')
  whileVisible(card, 'is-live')
  const sec = $('#daekon-os')
  if (sec) {
    sec.classList.add('dkm-persp')
    tilt(card, { max: 3, area: sec })
  }
  const desc = card.querySelector('.os8-p')
  if (desc && !card.querySelector('.dkm-os-mods')) {
    const mods = ['Ügyfélkezelés', 'Projektkövetés', 'Pénzügyi nyilvántartás', 'Gmail-integráció', 'Üzleti automatizációk']
    const ul = document.createElement('ul')
    ul.className = 'dkm-os-mods'
    ul.setAttribute('aria-hidden', 'true') // ugyanez szövegként a leírásban szerepel
    mods.forEach((m, i) => {
      const li = document.createElement('li')
      li.style.setProperty('--i', i)
      const dot = document.createElement('span')
      dot.className = 'dkm-os-dot'
      li.append(dot, document.createTextNode(m))
      ul.append(li)
    })
    desc.after(ul)
    onEnter(ul, 'is-in', 0.6)
  }
}

// KAPCSOLAT – az ajánlatkérő sáv: egérkövető fény és belépéskor egyszeri fénycsík
export function contact() {
  const bar = $('#ai .ct-in > button')
  if (!bar) return false
  bar.classList.add('dkm-bar')
  spotlight([bar])
  onEnter(bar, 'dkm-sweep-on', 0.6)
}

// FOOTER – görgetésre felkelő fény, a DAEKON-felirat vonalai kirajzolódnak, az „itt kezdődik.” egyszer felragyog
export function footer() {
  const ft = $('footer.ft')
  if (!ft) return false
  ft.classList.add('dkm-ft')
  scroll(
    (p) => {
      ft.style.setProperty('--dkm-f', p.toFixed(4))
    },
    { target: ft, offset: ['start end', 'end end'] },
  )
  const hl = ft.querySelector('.ft-close-t span')
  if (hl) {
    hl.classList.add('dkm-shine')
    onEnter(hl, 'is-on', 0.9)
  }
  const wm = ft.querySelector('.ft-brand-wm')
  if (wm) {
    const strokes = [...wm.querySelectorAll('path, line, polyline')].filter((s) => !s.closest('clipPath, defs'))
    if (strokes.length && belowFold(wm)) {
      for (const s of strokes) {
        s.setAttribute('pathLength', '1')
        s.style.strokeDasharray = '1'
        s.style.strokeDashoffset = '1'
      }
      inView(
        wm,
        () => {
          strokes.forEach((s, i) => {
            animate(s, { strokeDashoffset: [1, 0] }, { duration: 1.1, delay: i * 0.08, ease: [0.65, 0, 0.35, 1] }).finished.then(() => {
              s.style.strokeDasharray = ''
              s.style.strokeDashoffset = ''
            })
          })
        },
        { amount: 0.8 },
      )
    }
  }
}
