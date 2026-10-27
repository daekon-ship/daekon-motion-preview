// V8 – kompakt, prémium véglegesítés (2026-10-27): Rólam történet-idővonal, vélemények, szolgáltatás-rács.
// A tartalom (szövegek, vélemények, linkek) szó szerint változatlan; csak elrendezés és interakció.
import { $ } from './util.js'

const el = (tag, cls, parent) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (parent) parent.append(n)
  return n
}
const mqMobile = matchMedia('(max-width: 899px)')

// ---------- RÓLAM: történet-idővonal ----------
// A vonal az első látható bekezdés pontjától pontosan az utolsóig tart (nem nyúlik túl), a kitöltés folyamatosan
// követi a görgetést (a képernyő ~62%-ánál lévő olvasási vonal), és visszafelé görgetve vissza is húzódik.
// Kinyitás/összecsukás és minden méretváltozás után újramér (ResizeObserver). Koordináták offsetTop alapján.
export function storyThread({ still = false } = {}) {
  const card = $('#rolam .st8')
  const body = card && card.querySelector('.st8-body')
  if (!body || body.querySelector(':scope > .dkm-thread-line')) return false
  body.classList.add('dkm-thread')
  const line = el('span', 'dkm-thread-line')
  line.setAttribute('aria-hidden', 'true')
  body.prepend(line)
  const all = [...body.querySelectorAll(':scope > h3, :scope > p, :scope > .st8-more > p')]
  for (const p of all) p.classList.add('dkm-read')

  let items = [] // { p, y } – y: a pont közepe a body tetejétől
  let y0 = 0
  let y1 = 0
  const measure = () => {
    items = all
      .filter((p) => p.offsetParent) // az összecsukott történet bekezdései nem számítanak
      .map((p) => {
        const b = getComputedStyle(p, '::before')
        let top = p.offsetTop
        // a .st8-more belsejében lévő bekezdés offsetTop-ja a body-hoz képest
        for (let o = p.offsetParent; o && o !== body; o = o.offsetParent) top += o.offsetTop
        return { p, y: top + (parseFloat(b.top) || 0) + (parseFloat(b.height) || 8) / 2 }
      })
    for (const p of all) if (!p.offsetParent) p.classList.remove('is-read', 'is-cur')
    if (!items.length) return
    y0 = items[0].y
    y1 = items[items.length - 1].y
    line.style.top = `${y0.toFixed(1)}px`
    line.style.height = `${Math.max(0, y1 - y0).toFixed(1)}px`
  }

  let last = -1
  const render = () => {
    if (!items.length) return
    let fill
    if (still) fill = y1 - y0
    else {
      const top = body.getBoundingClientRect().top
      fill = Math.max(0, Math.min(y1 - y0, innerHeight * 0.62 - (top + y0)))
    }
    if (Math.abs(fill - last) < 0.5) return
    last = fill
    line.style.setProperty('--tf', `${fill.toFixed(1)}px`)
    let cur = -1
    items.forEach((it, i) => {
      const on = fill >= it.y - y0 - 1
      if (on) cur = i
      it.p.classList.toggle('is-read', on)
    })
    items.forEach((it, i) => it.p.classList.toggle('is-cur', i === cur))
  }

  measure()
  render()
  const remeasure = () => {
    measure()
    last = -1
    render()
  }
  new ResizeObserver(remeasure).observe(body)
  if (document.fonts) document.fonts.ready.then(remeasure)
  if (!still) {
    let ticking = false
    const req = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        render()
      })
    }
    addEventListener('scroll', req, { passive: true })
    addEventListener('resize', req, { passive: true })
  }
  return true
}

// ---------- VÉLEMÉNYEK ----------
// Asztal: egy sor, 3 kártya + „Mind a 8 vélemény megtekintése” (lenyíló, a többi kártya ugyanabban a rácsban).
// Telefon/tablet: egyszerre egy kártya, oldalra lapozható; előző/következő gomb, „1 / 8” számláló, nyilak.
export function reviewsLayout() {
  let n = 0
  const tick = () => {
    const sec = $('#velemenyek')
    const list = sec && sec.querySelector('.rv-list')
    const cards = list ? [...list.querySelectorAll('.rv-card')] : []
    if (cards.length < 2) return void (++n < 40 && setTimeout(tick, 250))
    if (list.dataset.dkmLayout) return
    list.dataset.dkmLayout = '1'
    if (!list.id) list.id = 'dkm-rv-list'
    sec.classList.add('dkm-rv8')
    const total = cards.length
    const SHOW = 3

    // asztal: lenyitó gomb
    const more = el('button', 'dkm-rv-more')
    more.type = 'button'
    more.setAttribute('aria-controls', list.id)
    more.setAttribute('aria-expanded', 'false')
    const label = () => (list.classList.contains('dkm-rv-open') ? 'Kevesebb vélemény' : `Mind a ${total} vélemény megtekintése`)
    more.textContent = label()
    more.addEventListener('click', () => {
      const open = list.classList.toggle('dkm-rv-open')
      more.setAttribute('aria-expanded', String(open))
      more.textContent = label()
      if (!open) sec.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    cards.forEach((c, i) => c.classList.toggle('dkm-rv-extra', i >= SHOW))

    // telefon: lapozó
    const nav = el('div', 'dkm-rv-nav')
    const prev = el('button', 'dkm-rv-btn', nav)
    prev.type = 'button'
    prev.setAttribute('aria-label', 'Előző vélemény')
    prev.textContent = '←'
    const count = el('span', 'dkm-rv-count', nav)
    count.setAttribute('aria-live', 'polite')
    const next = el('button', 'dkm-rv-btn', nav)
    next.type = 'button'
    next.setAttribute('aria-label', 'Következő vélemény')
    next.textContent = '→'
    list.after(nav)
    // asztalon a lenyitó egy sorba kerül a „Ajánlás írása” gombokkal (egy teljes sornyi hely)
    const askBtns = sec.querySelector('.rv-ask-btns')
    if (askBtns) askBtns.prepend(more)
    else nav.after(more)

    const index = () => {
      const w = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(list).columnGap || '0')
      return Math.max(0, Math.min(total - 1, Math.round(list.scrollLeft / (w || 1))))
    }
    const go = (i) => {
      const c = cards[Math.max(0, Math.min(total - 1, i))]
      list.scrollTo({ left: c.offsetLeft - cards[0].offsetLeft, behavior: 'smooth' })
    }
    const update = () => {
      const i = index()
      count.textContent = `${i + 1} / ${total}`
      prev.disabled = i === 0
      next.disabled = i === total - 1
    }
    prev.addEventListener('click', () => go(index() - 1))
    next.addEventListener('click', () => go(index() + 1))
    list.addEventListener('keydown', (e) => {
      if (!mqMobile.matches) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(index() + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(index() - 1)
      }
    })
    let raf = 0
    list.addEventListener(
      'scroll',
      () => {
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0
            update()
          })
      },
      { passive: true },
    )
    const mode = () => {
      const mob = mqMobile.matches
      list.tabIndex = mob ? 0 : -1
      if (mob) list.setAttribute('aria-label', `Vélemények, ${total} db – lapozható`)
      else list.removeAttribute('aria-label')
      update()
    }
    mqMobile.addEventListener('change', mode)
    mode()
  }
  tick()
  return true
}

// ---------- SZOLGÁLTATÁSOK: rácsban rámutatásra/fókuszra is vált a rétegköteg ----------
// (görgetéskor az oldal saját logikája jelöli ki az aktív sort; a rácsban két kártya van egy magasságban,
// ezért a rámutatás/fókusz is kijelöli – ugyanazokkal az osztályokkal és felirattal, mint az oldal)
export function servicesGrid() {
  const list = $('#szolgaltatasok .sv7-list')
  const arts = list ? [...list.querySelectorAll('.sv7-a')] : []
  if (!arts.length) return false
  list.classList.add('dkm-sv-grid')
  const idx = [...document.querySelectorAll('#szolgaltatasok .sv8-stack li')]
  const set = (i) => {
    idx.forEach((li, j) => li.classList.toggle('is-on', j === i))
    arts.forEach((a, j) => a.classList.toggle('is-on', j === i))
    const cap = document.querySelector('#szolgaltatasok .sv8-cap-t')
    const on = idx[i]
    if (cap && on) cap.textContent = `${(on.querySelector('.sv8-n') || {}).textContent} · ${(on.querySelector('.sv8-t') || {}).textContent}`
  }
  arts.forEach((a, i) => {
    a.addEventListener('mouseenter', () => !mqMobile.matches && set(i))
    a.addEventListener('focusin', () => set(i))
  })
  return true
}

