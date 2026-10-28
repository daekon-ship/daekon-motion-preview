// DAEKON motion layer (dkm) – kiegészítő animációk az élő daekon.hu-hoz, Motion-nel (motion.dev).
// Biztonsági elvek:
// - semmit nem rejt el, ami betöltéskor már a képernyőn van (mélylinkek, visszagörgetés);
// - csökkentett mozgás beállításnál nem animál (a showreel ilyenkor álló képként jelenik meg);
// - ha valamelyik rész hibázik, a többi és az oldal eredeti tartalma érintetlen marad;
// - az animációk végén nem marad inline stílus az oldal saját elemein.
import { $, finePointer } from './util.js'
import { osCard } from './enter.js'
import { magnetic } from './magnetic.js'
import { navPill } from './nav.js'
import { reel } from './reel.js'
import { contact, footer, heroLight, os, reviews, separators, services, story } from './sections.js'
import { footerStage, heroField, osTech, reviewsDepth, servicesDepth, storyDepth } from './v5.js'
import { reviewsCompact, reviewsEnter, servicesDeck, storyYears } from './v6.js'
import { processTimeline } from './timeline.js'
import { heroFit, reviewsLayout, servicesGrid, storyThread } from './refine.js'
import { footerFloor, heroWorld, osNetwork } from './world.js'

// Gyenge eszköz felismerése csak hardveres jelekből (kevés mag/memória, adattakarékos mód) → „lite” mód:
// a folyamatos effektek kimaradnak, a belépők megmaradnak. Képkocka-mérést szándékosan NEM használunk:
// betöltéskor a hero WebGL-jelenete és a háttérlapok rajzolás-visszafogása miatt tévesen gyengének mérne.
function isLowEnd() {
  const cores = navigator.hardwareConcurrency || 8
  const mem = navigator.deviceMemory || 8
  const saveData = !!(navigator.connection && navigator.connection.saveData)
  return saveData || cores <= 2 || mem <= 2 || (cores <= 4 && mem <= 4)
}

// Modulonként: [futtató, a cél-szekció szelektora]. Minden modul csak a SAJÁT szekciójára vár, így egy hiányzó
// vagy késve megjelenő szekció nem akadályozza a többi indulását.
// Sorrend: az első képernyő (hero, navigáció) elöl, a lejjebb lévő szekciók utána.
const MODULES = [
  ['heroFit', heroFit, '#top [data-hero-copy]'],
  ['navPill', navPill, '.v5-nav'],
  ['heroField', heroField, '#top > div'],
  ['heroWorld', heroWorld, '#top > div'],
  ['heroLight', heroLight, '#top > div', 'pointer'],
  ['reel', () => reel({ still: false }), '#work .rl-a'],
  ['separators', separators, 'footer.ft'],
  ['services', services, '#szolgaltatasok .sv7-a'],
  ['servicesDepth', servicesDepth, '#szolgaltatasok .sv7-a'],
  ['servicesDeck', servicesDeck, '#szolgaltatasok .sv7-a'],
  ['servicesGrid', servicesGrid, '#szolgaltatasok .sv7-a'],
  ['processTimeline', () => processTimeline(), '#folyamat .pc-s'],
  ['story', story, '#rolam .st8'],
  ['storyDepth', storyDepth, '#rolam .st8'],
  ['storyYears', storyYears, '#rolam .st8'],
  ['storyThread', () => storyThread(), '#rolam .st8-body'],
  ['reviews', reviews, '#velemenyek', 'pointer'],
  ['reviewsDepth', reviewsDepth, '#velemenyek'],
  ['reviewsEnter', reviewsEnter, '#velemenyek'],
  ['reviewsCompact', reviewsCompact, '#velemenyek'],
  ['reviewsLayout', reviewsLayout, '#velemenyek'],
  ['osCard', osCard, '#daekon-os .os8-in'],
  ['os', os, '#daekon-os .os8-in'],
  ['osTech', osTech, '#daekon-os .os8-in'],
  ['osNetwork', osNetwork, '#daekon-os .os8-in'],
  ['contact', contact, '#ai'],
  ['footer', footer, 'footer.ft'],
  ['footerStage', footerStage, 'footer.ft'],
  ['footerFloor', footerFloor, 'footer.ft .dkm-ft-stage'],
  ['magnetic', magnetic, 'body', 'pointer'],
]

function start() {
  // Állapot a diagnosztikához (az előnézeti panel olvassa; élesben csak egy ártalmatlan objektum).
  // started: elindult · noop: lefutott, de nem volt dolga (pl. már a képernyőn volt) · skipped: érintőképernyőn nem értelmezett
  // waiting/notFound: a szekciója (még) nincs a DOM-ban · failed: hibát dobott (errorMessages)
  const status = (window.__DKM = {
    version: 6,
    loaded: true,
    active: false,
    reduced: false,
    lite: false,
    effects: [],
    started: [],
    noop: [],
    skipped: [],
    waiting: [],
    notFound: [],
    failed: [],
    errors: 0,
    errorMessages: [],
    found: {},
    frames: {},
    timing: {},
  })
  if (window.__DKM_OFF) return
  const systemReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  // __DKM_FORCE_MOTION: csak az előnézet állítja be, ha a látogató ott kifejezetten kéri (egy oldalbetöltésre)
  const reduced = systemReduced && !window.__DKM_FORCE_MOTION
  const lite = !reduced && isLowEnd()
  status.reduced = reduced
  status.systemReduced = systemReduced
  status.lite = lite
  document.documentElement.classList.add('dkm')
  // kifejezett kérésre (?dkmmotion=1) a CSS csökkentett-mozgás szabályai sem kapcsolják ki az animációkat
  if (systemReduced && window.__DKM_FORCE_MOTION) document.documentElement.classList.add('dkm-force')
  if (lite) document.documentElement.classList.add('dkm-lite')
  // hibakereséshez: ?dkmskip=reel,heroLight – az adott részek kihagyása
  const skip = new URLSearchParams(location.search).get('dkmskip')?.split(',') ?? []
  if (lite) skip.push('heroLight')
  const fine = finePointer()
  // telefon/érintőképernyő: minden effekt fut, de telefonra hangolva (dkm-phone: keverési mód nélkül, kisebb
  // felbontású és 30 fps-es canvasok, kisebb elmozdulások – lásd phone.css és world.js)
  const phone = !fine || matchMedia('(max-width: 899px)').matches
  status.phone = phone
  if (phone) document.documentElement.classList.add('dkm-phone')
  // Csökkentett mozgás (rendszerbeállítás) → ÁLLÓ ÜZEMMÓD: az új design minden eleme megjelenik, de semmi nem mozog
  // (html.dkm-static: a CSS-animációk/átmenetek azonnal a végállapotba ugranak, a canvasok egyetlen képkockát
  // rajzolnak, az animate() hívások azonnaliak, nincs parallaxis és egérkövetés). A beállítást nem bíráljuk felül:
  // mozgás csak ?dkmmotion=1 kifejezett kérésre van.
  if (reduced) document.documentElement.classList.add('dkm-static')
  const STILL = {
    reel: () => reel({ still: true }),
    processTimeline: () => processTimeline({ still: true }),
    storyThread: () => storyThread({ still: true }),
  }
  const MOTION_ONLY = ['heroLight', 'magnetic', 'storyYears'] // egérkövető fény, mágneses gombok, görgetésre pörgő évszám
  const pending = MODULES.filter(([name, , , req]) => {
    if (skip.includes(name)) return false
    if (reduced && MOTION_ONLY.includes(name)) {
      status.skipped.push(name)
      return false
    }
    if (req === 'pointer' && !fine) {
      status.skipped.push(name)
      return false
    }
    return true
  }).map((m) => (reduced && STILL[m[0]] ? [m[0], STILL[m[0]], m[2], m[3]] : m))
  status.active = !reduced
  status.waiting = pending.map(([n]) => n)

  const runOne = ([name, fn]) => {
    const t = performance.now()
    try {
      const r = fn()
      if (r === false) status.noop.push(name)
      else {
        status.started.push(name)
        status.effects.push(name)
      }
    } catch (e) {
      status.failed.push(name)
      status.errors++
      status.errorMessages.push(`${name}: ${e && e.message ? e.message : e}`)
      console.warn('[dkm]', name, e)
    }
    status.timing[name] = Math.round(performance.now() - t)
  }
  // Teljesítmény (2026-10-28): korábban egy 250 ms-os ütemben az összes kész modul EGYETLEN feladatban indult
  // (mobilon ~660 ms-os blokk, amely a hero beúszását is feltartotta). Most modulonként külön feladat fut,
  // így a böngésző a modulok között rajzolhat és reagálhat; a sorrend és a modulok működése változatlan.
  const queue = []
  let draining = false
  const yieldNow = () =>
    window.scheduler && typeof scheduler.yield === 'function' ? scheduler.yield() : new Promise((r) => setTimeout(r, 0))
  const drain = async () => {
    if (draining) return
    draining = true
    while (queue.length) {
      runOne(queue.shift())
      if (queue.length) await yieldNow()
    }
    draining = false
  }
  // 250 ms-onként: amelyik modul szekciója már megjelent, az azonnal indul; legfeljebb 20 mp-ig várunk
  let n = 0
  const tick = () => {
    for (let i = 0; i < pending.length; ) {
      const sel = pending[i][2]
      const ok = !!$(sel)
      status.found[sel] = ok
      if (ok) queue.push(pending.splice(i, 1)[0])
      else i++
    }
    drain()
    status.waiting = pending.map(([nm]) => nm)
    if (pending.length && ++n < 80) setTimeout(tick, 250)
    else if (pending.length) {
      status.notFound = pending.map(([nm]) => nm)
      status.waiting = []
    }
  }
  tick()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
