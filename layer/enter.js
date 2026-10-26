// Belépő animációk ott, ahol az élő oldal statikus volt: projektsorok, „Így dolgozom”, DAEKON OS kártya.
import { inView, stagger } from 'motion'
import { animate } from 'motion/mini'
import { $, EASE, LILAC, LIME, belowFold, clear, hide } from './util.js'

// 1) Munkák: a projektsorok egymás után úsznak be, és mindegyik elválasztó vonala balról jobbra kirajzolódik
export function projects() {
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
export function process() {
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
export function osCard() {
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

