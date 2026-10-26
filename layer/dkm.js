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
import { contact, footer, heroLight, os, processScroll, reviews, separators, services, story } from './sections.js'

// Gyenge eszköz felismerése: kevés mag/memória, vagy indításkor lassú képkockák → „lite” mód
// (a folyamatos effektek – lebegés, vándorló fény, egérkövető hero-fény – kimaradnak, a belépők megmaradnak)
function measureFrames(n = 30) {
  return new Promise((resolve) => {
    const t = []
    let last = performance.now()
    const loop = (now) => {
      t.push(now - last)
      last = now
      if (t.length < n) requestAnimationFrame(loop)
      else resolve(t.slice(3).reduce((a, b) => a + b, 0) / (t.length - 3))
    }
    requestAnimationFrame(loop)
  })
}

async function isLowEnd() {
  const cores = navigator.hardwareConcurrency || 8
  const mem = navigator.deviceMemory || 8
  if (cores <= 2 || mem <= 2 || (cores <= 4 && mem <= 4)) return true
  return (await measureFrames()) > 40
}

async function start() {
  if (window.__DKM_OFF) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const lite = !reduced && (await isLowEnd())
  document.documentElement.classList.add('dkm')
  if (lite) document.documentElement.classList.add('dkm-lite')
  const all = { reel: () => reel({ still: false }), heroLight, navPill, separators, projects, peek, services, processScroll, story, reviews, osCard, os, contact, footer, magnetic }
  // hibakereséshez: ?dkmskip=reel,heroLight – az adott részek kihagyása
  const skip = new URLSearchParams(location.search).get('dkmskip')?.split(',') ?? []
  if (lite) skip.push('heroLight')
  const parts = reduced ? [() => reel({ still: true })] : Object.entries(all).filter(([k]) => !skip.includes(k)).map(([, fn]) => fn)
  for (const fn of parts) {
    try {
      fn()
    } catch (e) {
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
