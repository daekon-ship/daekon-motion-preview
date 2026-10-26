// DAEKON motion layer (dkm) – kiegészítő animációk az élő daekon.hu-hoz, Motion-nel (motion.dev).
// Biztonsági elvek:
// - semmit nem rejt el, ami betöltéskor már a képernyőn van (mélylinkek, visszagörgetés);
// - csökkentett mozgás beállításnál nem animál (a showreel ilyenkor álló képként jelenik meg);
// - ha valamelyik rész hibázik, a többi és az oldal eredeti tartalma érintetlen marad;
// - az animációk végén nem marad inline stílus az oldal saját elemein.
import { $ } from './util.js'
import { osCard, projects } from './enter.js'
import { magnetic } from './magnetic.js'
import { navPill } from './nav.js'
import { peek } from './peek.js'
import { reel } from './reel.js'
import { contact, footer, heroLight, os, reviews, separators, services, story } from './sections.js'
import { footerStage, heroField, osTech, processSignal, reviewsDepth, servicesDepth, storyDepth } from './v5.js'
import { processBeam, reviewsEnter, servicesDeck, storyYears } from './v6.js'
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

function start() {
  // Állapot a diagnosztikához (az előnézeti panel olvassa; élesben csak egy ártalmatlan objektum)
  const status = (window.__DKM = { version: 6, active: false, reduced: false, lite: false, effects: [], failed: [], errors: 0 })
  if (window.__DKM_OFF) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const lite = !reduced && isLowEnd()
  status.reduced = reduced
  status.lite = lite
  document.documentElement.classList.add('dkm')
  if (lite) document.documentElement.classList.add('dkm-lite')
  const all = {
    reel: () => reel({ still: false }),
    heroField,
    heroWorld,
    heroLight,
    navPill,
    separators,
    projects,
    peek,
    services,
    servicesDepth,
    servicesDeck,
    processSignal,
    processBeam,
    story,
    storyDepth,
    storyYears,
    reviews,
    reviewsDepth,
    reviewsEnter,
    osCard,
    os,
    osTech,
    osNetwork,
    contact,
    footer,
    footerStage,
    footerFloor,
    magnetic,
  }
  // hibakereséshez: ?dkmskip=reel,heroLight – az adott részek kihagyása
  const skip = new URLSearchParams(location.search).get('dkmskip')?.split(',') ?? []
  if (lite) skip.push('heroLight')
  const parts = reduced ? [['reel', () => reel({ still: true })]] : Object.entries(all).filter(([k]) => !skip.includes(k))
  for (const [name, fn] of parts) {
    try {
      if (fn() !== false) status.effects.push(name)
      else status.failed.push(name)
    } catch (e) {
      status.failed.push(name)
      status.errors++
      console.warn('[dkm]', name, e)
    }
  }
  status.active = !reduced
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
