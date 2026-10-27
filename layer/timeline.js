// ÍGY DOLGOZOM – görgetéshez kötött neon-timeline (2026-10-27-i átdolgozás, a korábbi processSignal + processBeam helyett).
//
// Pontosság: minden koordináta a lépéslista (.pc-list, position: relative) saját koordinátarendszerében, offsetLeft/
// offsetTop alapján – ezeket az animált transzformációk (kigyúló panel, felugró sorszám) nem torzítják.
// - asztalon (egy sorban): a pontok a kártyák középpontjában, a vonal az első és az utolsó pont közepe között;
// - telefonon/tableten (egymás alatt): függőleges vonal a sorszám és a szöveg között, a pontok a sorszámok közepén.
// Görgetés: passzív figyelő + requestAnimationFrame (képkockánként legfeljebb egy olvasás), a haladás szigorúan 0–1,
// és ugyanabban a görgetési helyzetben mindig ugyanaz az állapot (nincs időzítéstől függő ugrás).
import { $ } from './util.js'

const el = (tag, cls, parent) => {
  const n = document.createElement(tag)
  n.className = cls
  if (parent) parent.append(n)
  return n
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

export function processTimeline({ still = false } = {}) {
  const list = $('#folyamat .pc-list')
  const steps = list ? [...list.querySelectorAll('.pc-s')] : []
  if (steps.length < 2 || list.parentElement.querySelector(':scope > .dkm-tl')) return false
  const host = list.parentElement
  host.classList.add('dkm-proc-host')
  list.classList.add('dkm-proc')
  for (const s of steps) s.classList.add('dkm-pc6')

  const tl = el('div', still ? 'dkm-tl is-still' : 'dkm-tl')
  tl.setAttribute('aria-hidden', 'true')
  el('span', 'dkm-tl-base', tl)
  el('span', 'dkm-tl-fill', tl)
  if (!still) {
    el('span', 'dkm-tl-comet', tl)
    el('span', 'dkm-tl-packet', tl)
  }
  const nodes = steps.map(() => el('span', 'dkm-tl-node', tl))
  host.insertBefore(tl, list)

  let vertical = false
  let a = 0
  let b = 1
  let at = [] // a pontok helye a vonalon (0–1)
  const numDy = [] // a sorszám közepe a lépés tetejétől (függőleges változat)
  const mq = matchMedia('(max-width: 899px)') // az oldal ugyanitt vált egymás alatti lépésekre

  const measure = () => {
    vertical = mq.matches
    tl.classList.toggle('is-v', vertical)
    tl.style.left = `${list.offsetLeft}px`
    tl.style.top = `${list.offsetTop}px`
    tl.style.width = `${list.offsetWidth}px`
    tl.style.height = `${list.offsetHeight}px`
    const pos = steps.map((s, i) => {
      if (!vertical) return s.offsetLeft + s.offsetWidth / 2
      // a sorszám betűinek tényleges közepe (a .pc-n mobilon két sor magas rácscella), a lépés tetejéhez mérve;
      // ha a sorszám éppen felugrik (scale-animáció), az előző, nyugalmi mérést használjuk
      const n = s.querySelector('.pc-n')
      if (!n) return s.offsetTop + 20
      if (!n.getAnimations().length || numDy[i] == null) {
        const rg = document.createRange()
        rg.selectNodeContents(n)
        const t = rg.getClientRects()[0]
        if (t) numDy[i] = t.top + t.height / 2 - s.getBoundingClientRect().top
      }
      return s.offsetTop + (numDy[i] ?? 20)
    })
    a = pos[0]
    b = pos[pos.length - 1]
    at = pos.map((v) => (v - a) / (b - a || 1))
    nodes.forEach((n, i) => n.style.setProperty('--pos', `${pos[i].toFixed(1)}px`))
    tl.style.setProperty('--a', `${a.toFixed(1)}px`)
    tl.style.setProperty('--b', `${b.toFixed(1)}px`)
    if (vertical) {
      const s0 = steps[0]
      const n0 = s0.querySelector('.pc-n')
      const t0 = s0.querySelector('.pc-t')
      // a vonal a sorszám tényleges betűi és a szöveg közötti üres sáv közepén fut (a .pc-n doboza szélesebb a
      // számnál – a doboz szélére igazítva a pont a szöveg első betűjére lógott)
      const sr = s0.getBoundingClientRect()
      let right = n0 ? n0.offsetLeft + n0.offsetWidth : 28
      if (n0) {
        const rg = document.createRange()
        rg.selectNodeContents(n0)
        const t = rg.getClientRects()[0]
        if (t) right = t.right - sr.left
      }
      const textLeft = t0 ? t0.getBoundingClientRect().left - sr.left : right + 16
      tl.style.setProperty('--x', `${(s0.offsetLeft + (right + textLeft) / 2).toFixed(1)}px`)
      list.style.removeProperty('--dkm-gx')
    } else {
      // a vonal a kártyák felső sávjában fut; a kigyúló panelek a kártyák közötti rés feléig érnek (nem lógnak egymásra)
      tl.style.setProperty('--y', `${(steps[0].offsetTop - 1).toFixed(1)}px`)
      const gap = steps[1].offsetLeft - (steps[0].offsetLeft + steps[0].offsetWidth)
      list.style.setProperty('--dkm-gx', `${Math.max(4, Math.min(14, gap / 2 - 3)).toFixed(1)}px`)
    }
  }

  let last = -1
  let cur = -2
  const render = (p) => {
    if (Math.abs(p - last) < 0.0004) return
    last = p
    tl.style.setProperty('--p', p.toFixed(4))
    tl.classList.toggle('is-moving', p > 0 && p < 1)
    let c = -1
    nodes.forEach((n, i) => {
      // az első pont a szekcióba érkezéskor gyullad ki, a többi akkor, amikor a fény ténylegesen odaér
      const on = p > 0 && p * (b - a) >= at[i] * (b - a) - 1.5 // 1,5 px-en belül = a fény elérte a pontot
      if (on) c = i
      if (on !== n.classList.contains('is-on')) {
        n.classList.toggle('is-on', on)
        steps[i].classList.toggle('dkm-on', on)
        steps[i].classList.toggle('dkm-hit', on)
      }
    })
    if (c !== cur) {
      nodes.forEach((n, i) => n.classList.toggle('is-cur', i === c))
      steps.forEach((s, i) => s.classList.toggle('dkm-cur', i === c))
      cur = c
    }
  }

  const progress = () => {
    const r = list.getBoundingClientRect() // képkockánként egyetlen olvasás
    const vh = innerHeight
    // telefonon a fény a képernyő ~62%-ánál lévő olvasási vonalat követi; asztalon a lista 82% → 32% közötti útja
    return vertical ? clamp01((vh * 0.62 - (r.top + a)) / (b - a || 1)) : clamp01((vh * 0.82 - r.top) / (vh * 0.5))
  }

  measure()
  if (still) {
    render(1) // csökkentett mozgás: álló, teljesen kirajzolt timeline
  } else {
    let ticking = false
    const frame = () => {
      ticking = false
      render(progress())
    }
    const request = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(frame)
      }
    }
    addEventListener('scroll', request, { passive: true })
    addEventListener('resize', request, { passive: true })
    frame()
  }
  // méretváltozás (ablak, betűtípus-betöltés, tartalom) → újramérés, majd az állapot a görgetésből újraszámolva
  const remeasure = () => {
    measure()
    last = -1
    if (still) render(1)
    else render(progress())
  }
  new ResizeObserver(remeasure).observe(list)
  mq.addEventListener('change', remeasure)
  if (document.fonts) document.fonts.ready.then(remeasure)
  return true
}
