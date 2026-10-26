// DAEKON motion layer (dkm) – néhány kiegészítő belépő animáció az élő daekon.hu-hoz, Motion-nel (motion.dev).
// Csak ott mozgat, ahol az oldal eddig statikus volt: projektsorok, „Így dolgozom” lépések, DAEKON OS kártya.
// Biztonsági elvek:
// - semmit nem rejt el, ami betöltéskor már a képernyőn van (mélylinkek, visszagörgetés);
// - csökkentett mozgás beállításnál nem csinál semmit;
// - ha a szkript hibázik vagy nem fut le, a tartalom az eredeti állapotában látszik;
// - az animáció végén visszaadja az elemek eredeti (inline stílus nélküli) állapotát.
import { inView, stagger } from 'motion'
import { animate } from 'motion/mini'

const EASE = [0.16, 1, 0.3, 1]
const LILAC = '#B9A2FF'
const LIME = '#D4FF3A'

// Az oldalon a dc-runtime rejtett (<x-dc>, display:none) sablonpéldánya is ott van ugyanazokkal az azonosítókkal:
// mindig a ténylegesen megjelenített példányt keressük.
function $(sel) {
  for (const el of document.querySelectorAll(sel)) if (el.getClientRects().length) return el
  return null
}

function belowFold(el) {
  return el.getBoundingClientRect().top > window.innerHeight * 0.92
}

function clear(els) {
  for (const el of els) {
    el.style.opacity = ''
    el.style.transform = ''
    el.style.willChange = ''
  }
}

function hide(els, y) {
  for (const el of els) {
    el.style.opacity = '0'
    el.style.transform = `translateY(${y}px)`
    el.style.willChange = 'opacity, transform'
  }
}

// 1) Munkák: a projektsorok egymás után úsznak be, és mindegyik elválasztó vonala balról jobbra kirajzolódik
function projects() {
  const list = $('#work .rl-list')
  const rows = list ? [...list.querySelectorAll('.rl-row')] : []
  if (!rows.length) return

  // egérkövető fény a sorokon (csak egérrel)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let raf = 0
    list.addEventListener(
      'pointermove',
      (e) => {
        const a = e.target.closest && e.target.closest('.rl-a')
        if (!a || raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          const r = a.getBoundingClientRect()
          a.style.setProperty('--dkm-x', `${e.clientX - r.left}px`)
        })
      },
      { passive: true },
    )
  }

  if (!belowFold(list)) return
  hide(rows, 16)
  inView(
    list,
    () => {
      const controls = animate(rows, { opacity: [0, 1], transform: ['translateY(16px)', 'none'] }, { duration: 0.7, ease: EASE, delay: stagger(0.055) })
      rows.forEach((row, i) => setTimeout(() => row.classList.add('dkm-line'), i * 55))
      controls.finished.then(() => clear(rows))
    },
    { amount: 0.15 },
  )
}

// 2) Így dolgozom: a felső vonal végigfut, a lépések sorban érkeznek, a sorszám egy pillanatra felvillan
function process() {
  const list = $('#folyamat .pc-list')
  const steps = list ? [...list.querySelectorAll('.pc-s')] : []
  if (!steps.length || !belowFold(list)) return
  hide(steps, 18)
  inView(
    list,
    () => {
      list.classList.add('dkm-run')
      const controls = animate(steps, { opacity: [0, 1], transform: ['translateY(18px)', 'none'] }, { duration: 0.75, ease: EASE, delay: stagger(0.12, { startDelay: 0.15 }) })
      steps.forEach((s, i) => {
        const n = s.querySelector('.pc-n')
        if (!n) return
        animate(n, { color: [LIME, LIME, LILAC] }, { duration: 1.3, delay: 0.15 + i * 0.12, ease: 'ease-out' }).finished.then(() => {
          n.style.color = ''
        })
      })
      controls.finished.then(() => clear(steps))
    },
    { amount: 0.25 },
  )
}

// 3) DAEKON OS: a kártya finoman felemelkedik, és egyetlen fénycsík fut végig rajta
function osCard() {
  const card = $('#daekon-os .os8-in')
  if (!card || !belowFold(card)) return
  hide([card], 24)
  inView(
    card,
    () => {
      animate(card, { opacity: [0, 1], transform: ['translateY(24px) scale(0.985)', 'none'] }, { duration: 0.9, ease: EASE }).finished.then(() => {
        clear([card])
        card.classList.add('dkm-sweep')
      })
    },
    { amount: 0.3 },
  )
}

function start() {
  if (window.__DKM_OFF) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.documentElement.classList.add('dkm')
  for (const fn of [projects, process, osCard]) {
    try {
      fn()
    } catch (e) {
      // egy hiba nem érintheti a többi animációt, és semmit nem hagy elrejtve
      console.warn('[dkm]', e)
    }
  }
}

// Az oldalt a dc-runtime rajzolja ki a betöltés után: rövid időközönként megnézzük, megjelentek-e a célszekciók
// (a láthatóság osztályváltással is változhat, ezt egy DOM-figyelő nem jelezné). Legfeljebb 15 mp-ig.
function whenReady(cb) {
  const ready = () => $('#work .rl-row') && $('#folyamat .pc-s') && $('#daekon-os .os8-in')
  let n = 0
  const tick = () => {
    if (ready()) return cb()
    if (++n < 60) setTimeout(tick, 250)
  }
  tick()
}

whenReady(start)
