// CSAK AZ ELŐNÉZETHEZ – éles telepítésbe nem kerül.
// - az ajánlatkérő nem küld semmit (a send.php-t helyben elutasítja, így az oldal saját e-mailes tartaléka jelenik meg)
// - ?dkm=0: az új animációs réteg kikapcsolva (összehasonlításhoz az éles állapottal)
// - ?dkmmotion=1: a látogató KIFEJEZETT kérésére, csak arra az egy megnyitásra, csökkentett mozgás mellett is lefut a réteg
// - diagnosztikai panel: betöltés, megtalált szekciók, ténylegesen elindult és ténylegesen rajzoló effektek, hibák
// - IDEIGLENES verziójelzés („DAEKON V6 TESZT — <commit>”): a tulajdonosi ellenőrzés után törlendő (testBanner)
;(function () {
  var params = new URLSearchParams(location.search)
  if (params.get('dkm') === '0') window.__DKM_OFF = true
  if (params.get('dkmmotion') === '1') window.__DKM_FORCE_MOTION = true
  var systemReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  var jsErrors = []
  window.addEventListener('error', function (e) {
    jsErrors.push((e && e.message) || 'hiba')
  })
  window.addEventListener('unhandledrejection', function (e) {
    jsErrors.push('Promise: ' + ((e && e.reason && e.reason.message) || e.reason || 'elutasítva'))
  })

  var origFetch = window.fetch
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || ''
    if (/send\.php(\?|$)/.test(url)) {
      return Promise.resolve(
        new Response(JSON.stringify({ ok: false, error: 'preview' }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )
    }
    return origFetch.apply(this, arguments)
  }

  function node(tag, css, text) {
    var n = document.createElement(tag)
    if (css) n.style.cssText = css
    if (text != null) n.textContent = text
    return n
  }

  function urlWith(key, val) {
    var u = new URL(location.href)
    if (val == null) u.searchParams.delete(key)
    else u.searchParams.set(key, val)
    return u.pathname + u.search + u.hash
  }

  // ---------- IDEIGLENES: verziójelzés + csökkentett mozgás figyelmeztetés (ellenőrzés után törlendő) ----------
  function testBanner() {
    var commit = window.__DKM_COMMIT || '?'
    var box = node(
      'div',
      'position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:2147483001;max-width:min(620px,calc(100vw - 24px));' +
        'display:grid;gap:8px;padding:12px 16px;border-radius:14px;background:#D4FF3A;color:#050505;box-shadow:0 18px 40px -12px #000;' +
        "font:700 13px/1.4 Manrope,system-ui,sans-serif;text-align:center",
    )
    box.setAttribute('role', 'status')
    box.append(node('div', 'font-size:16px;letter-spacing:.04em', 'DAEKON V6 TESZT — ' + commit))
    if (window.__DKM_OFF) {
      box.append(node('div', 'font-weight:600', 'Animációk KIKAPCSOLVA (?dkm=0) – ez az eredeti daekon.hu állapota.'))
    } else if (systemReduced && !window.__DKM_FORCE_MOTION) {
      box.style.background = '#FFB13A'
      box.append(
        node(
          'div',
          'font-weight:600',
          'Ezen az eszközön be van kapcsolva a csökkentett mozgás, ezért az animációk szándékosan NEM futnak. ' +
            'Windows: Gépház › Könnyű kezelés › Kijelző › „Animációk megjelenítése a Windowsban” – kapcsold BE, majd frissítsd az oldalt.',
        ),
      )
      var force = node('a', 'color:#050505;text-decoration:underline;text-underline-offset:3px', 'Animációk megtekintése most, csak erre a megnyitásra →')
      force.href = urlWith('dkmmotion', '1')
      box.append(force)
    } else if (systemReduced && window.__DKM_FORCE_MOTION) {
      box.append(node('div', 'font-weight:600', 'A csökkentett mozgás beállítás ellenére, a te kérésedre most futnak az animációk (csak erre a megnyitásra).'))
    }
    var close = node('button', 'position:absolute;right:6px;top:4px;border:0;background:none;font:inherit;cursor:pointer;color:#050505', '✕')
    close.setAttribute('aria-label', 'Tesztjelzés elrejtése')
    close.onclick = function () {
      box.remove()
    }
    box.append(close)
    document.body.appendChild(box)
  }

  function ui() {
    var on = !window.__DKM_OFF
    var wrap = node(
      'div',
      'position:fixed;left:12px;bottom:12px;z-index:2147483000;display:grid;gap:8px;justify-items:start;' +
        "font:600 12px/1.35 Manrope,system-ui,sans-serif;color:#F5F5F2",
    )
    wrap.setAttribute('role', 'region')
    wrap.setAttribute('aria-label', 'Előnézeti diagnosztika')

    // diagnosztikai panel
    var panel = node(
      'div',
      'position:fixed;right:12px;bottom:12px;z-index:2147483000;width:min(330px,calc(100vw - 24px));max-height:72vh;overflow:auto;padding:12px 14px;border-radius:14px;' +
        'border:1px solid rgba(185,162,255,.35);background:rgba(9,8,13,.96);box-shadow:0 20px 40px -12px #000;display:grid;gap:3px;' +
        "font:600 11.5px/1.35 Manrope,system-ui,sans-serif;color:#F5F5F2",
    )
    var head = node('div', 'display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:4px')
    head.append(node('b', 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#B9A2FF', 'Diagnosztika'))
    var close = node('button', 'border:0;background:none;color:#C4C3BD;font:inherit;cursor:pointer;padding:2px 4px', '✕')
    close.setAttribute('aria-label', 'Diagnosztika elrejtése')
    head.append(close)
    panel.append(head)
    var keys = [
      'V6 kód (dkm.js) betöltve',
      'CSS (dkm.css) betöltve',
      'Commit',
      'Csökkentett mozgás (eszköz)',
      'Lite mód',
      'Animációk',
      'Elindult effektek',
      'Nem indult',
      'Hero 3D – rajzolt képkocka',
      'OS hálózat – rajzolt képkocka',
      'Footer padló – rajzolt képkocka',
      'Szolgáltatás-kártyák a DOM-ban',
      'JS-hibák',
    ]
    var rows = {}
    keys.forEach(function (k) {
      var r = node('div', 'display:flex;justify-content:space-between;gap:14px')
      r.append(node('span', 'color:#A9A8A2', k))
      var v = node('span', 'font-family:"Geist Mono",ui-monospace,monospace;text-align:right')
      r.append(v)
      panel.append(r)
      rows[k] = v
    })
    var detail = node('div', 'color:#8a8983;font-size:10.5px;line-height:1.45;margin-top:4px;white-space:pre-wrap')
    panel.append(detail)

    // állandó sáv: BE/KI kapcsoló + panel nyitása
    var bar = node(
      'div',
      'display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;border:1px solid rgba(185,162,255,.35);' +
        'background:rgba(9,8,13,.92);box-shadow:0 10px 30px -10px #000',
    )
    bar.append(node('span', 'width:7px;height:7px;background:#D4FF3A;flex:none'))
    bar.append(node('span', 'white-space:nowrap', window.innerWidth < 520 ? 'Előnézet' : 'Előnézet · nem küld adatot'))
    var a = node('a', 'color:#CBB9FF;text-decoration:underline;text-underline-offset:3px;white-space:nowrap', on ? 'Animációk: BE' : 'Animációk: KI')
    a.href = urlWith('dkm', on ? '0' : null)
    bar.append(a)
    var open = node('button', 'border:0;background:none;color:#CBB9FF;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px', 'Diagnosztika')
    bar.append(open)

    var shown = window.innerWidth >= 700 // mobilon alapból csukva, hogy ne takarja a tartalmat
    try {
      var saved = localStorage.getItem('dkm-diag')
      if (saved) shown = saved === '1'
    } catch (e) {}
    function setShown(v) {
      shown = v
      panel.style.display = v ? 'grid' : 'none'
      open.style.display = v ? 'none' : ''
      try {
        localStorage.setItem('dkm-diag', v ? '1' : '0')
      } catch (e) {}
    }
    close.onclick = function () {
      setShown(false)
    }
    open.onclick = function () {
      setShown(true)
    }
    setShown(shown)

    function yes(v) {
      return v ? 'igen' : 'nem'
    }
    function list(arr) {
      return arr && arr.length ? arr.join(', ') : '–'
    }
    function update() {
      var s = window.__DKM
      var css = getComputedStyle(document.documentElement).getPropertyValue('--dkm-css').trim() === '1'
      var fr = (s && s.frames) || {}
      rows['V6 kód (dkm.js) betöltve'].textContent = s ? (s.version === 6 ? 'igen (v6)' : 'régi: v' + s.version) : 'NEM'
      rows['CSS (dkm.css) betöltve'].textContent = yes(css)
      rows['Commit'].textContent = window.__DKM_COMMIT || '?'
      rows['Csökkentett mozgás (eszköz)'].textContent = systemReduced ? (window.__DKM_FORCE_MOTION ? 'igen (felülbírálva kérésre)' : 'IGEN') : 'nem'
      rows['Lite mód'].textContent = yes(s && s.lite)
      rows['Animációk'].textContent = window.__DKM_OFF ? 'KI (?dkm=0)' : !s ? '–' : s.reduced ? 'NEM futnak (csökk. mozgás)' : s.active ? 'futnak' : 'nem futnak'
      var total = s ? s.started.length + s.noop.length + s.skipped.length + s.waiting.length + s.notFound.length + s.failed.length : 0
      rows['Elindult effektek'].textContent = s ? s.started.length + ' / ' + total : '0'
      rows['Nem indult'].textContent = s ? String(s.skipped.length + s.noop.length + s.waiting.length + s.notFound.length + s.failed.length) : '–'
      rows['Hero 3D – rajzolt képkocka'].textContent = fr['dkm-world'] != null ? String(fr['dkm-world']) : '–'
      rows['OS hálózat – rajzolt képkocka'].textContent = fr['dkm-osnet'] != null ? String(fr['dkm-osnet']) + (fr['dkm-osnet'] ? '' : ' (görgess oda)') : '–'
      rows['Footer padló – rajzolt képkocka'].textContent = fr['dkm-ft-cv'] != null ? String(fr['dkm-ft-cv']) + (fr['dkm-ft-cv'] ? '' : ' (görgess oda)') : '–'
      rows['Szolgáltatás-kártyák a DOM-ban'].textContent = String(document.querySelectorAll('.dkm-sc:not(.is-out)').length)
      var errs = jsErrors.concat((s && s.errorMessages) || [])
      rows['JS-hibák'].textContent = String(errs.length)
      if (!s) {
        detail.textContent = 'A dkm.js nem futott le.'
        return
      }
      var found = Object.keys(s.found || {})
        .map(function (k) {
          return (s.found[k] ? '✓ ' : '✗ ') + k
        })
        .join('\n')
      detail.textContent =
        'Elindult: ' + list(s.started) +
        '\nÉrintőképernyőn nem értelmezett: ' + list(s.skipped) +
        '\nLefutott, nem volt dolga: ' + list(s.noop) +
        '\nSzekcióra vár: ' + list(s.waiting) +
        '\nSzekció nem található: ' + list(s.notFound) +
        '\nHibát dobott: ' + list(s.failed) +
        (errs.length ? '\nHibaüzenetek: ' + errs.join(' | ') : '') +
        '\n\nMegtalált szekciók:\n' + (found || '–')
    }
    update()
    setInterval(update, 1000)

    wrap.append(bar)
    document.body.appendChild(wrap)
    document.body.appendChild(panel)
    testBanner()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui)
  else ui()
})()
