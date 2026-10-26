// Közös segédek a DAEKON motion layerhez.
export const EASE = [0.16, 1, 0.3, 1]
export const LILAC = '#B9A2FF'
export const LIME = '#D4FF3A'

// Az oldalon a dc-runtime rejtett (<x-dc>, display:none) sablonpéldánya is ott van ugyanazokkal az azonosítókkal:
// mindig a ténylegesen megjelenített példányt keressük.
export function $(sel) {
  for (const el of document.querySelectorAll(sel)) if (el.getClientRects().length) return el
  return null
}

export function belowFold(el) {
  return el.getBoundingClientRect().top > window.innerHeight * 0.92
}

export function clear(els) {
  for (const el of els) {
    el.style.opacity = ''
    el.style.transform = ''
    el.style.willChange = ''
  }
}

export function hide(els, y) {
  for (const el of els) {
    el.style.opacity = '0'
    el.style.transform = `translateY(${y}px)`
    el.style.willChange = 'opacity, transform'
  }
}


// A réteg saját útvonala (előnézetben /daekon-motion-preview/, élesben /) – a képek innen relatívak.
const SCRIPT = document.currentScript
export const ROOT = SCRIPT && SCRIPT.src ? new URL('.', SCRIPT.src).pathname : '/'

// Az élő oldal projektjei → a meglévő képernyőképek (assets/img/ref/<slug>-d-sm.webp)
const SLUGS = {
  'kioszpizza.hu': 'kiosz',
  'mesegombolyag.hu': 'mesegombolyag',
  'nefelejcsbakonybel.hu': 'nefelejcs',
  'dieselmotorjavitas.hu': 'diesel',
  'epuletesmedence.hu': 'epuletesmedence',
  'tetojavitomester.hu': 'tetojavito',
  'lapozunk.hu': 'lapozunk',
  'gt-lakasfelujitas.hu': 'gt',
  'rovarirtofiuk.hu': 'rovarirtofiuk',
}

export function shotFor(href, size = 'd-sm') {
  try {
    const slug = SLUGS[new URL(href).hostname.replace(/^www\./, '')]
    return slug ? `${ROOT}assets/img/ref/${slug}-${size}.webp` : null
  } catch {
    return null
  }
}

export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches
