// DAEKON motion layer (dkm) – kiegészítő animációk az élő daekon.hu-hoz, Motion-nel (motion.dev).
// Biztonsági elvek:
// - semmit nem rejt el, ami betöltéskor már a képernyőn van (mélylinkek, visszagörgetés);
// - csökkentett mozgás beállításnál nem animál (a showreel ilyenkor álló képként jelenik meg);
// - ha valamelyik rész hibázik, a többi és az oldal eredeti tartalma érintetlen marad;
// - az animációk végén nem marad inline stílus az oldal saját elemein.
import { $ } from './util.js'
import { osCard, process, projects } from './enter.js'
import { magnetic } from './magnetic.js'
import { peek } from './peek.js'
import { reel } from './reel.js'

function start() {
  if (window.__DKM_OFF) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.classList.add('dkm')
  const parts = reduced ? [() => reel({ still: true })] : [() => reel({ still: false }), projects, process, osCard, peek, magnetic]
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
