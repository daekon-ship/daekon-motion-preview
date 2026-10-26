// Belépő animációk ott, ahol az élő oldal statikus volt: projektsorok, DAEKON OS kártya.
import { inView, stagger } from 'motion'
import { animate } from 'motion/mini'
import { $, EASE, belowFold, clear, hide } from './util.js'

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

