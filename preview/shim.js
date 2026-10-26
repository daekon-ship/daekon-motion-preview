// CSAK AZ ELŐNÉZETHEZ – éles telepítésbe nem kerül.
// - az ajánlatkérő nem küld semmit (a send.php-t helyben elutasítja, így az oldal saját e-mailes tartaléka jelenik meg)
// - ?dkm=0: az új animációs réteg kikapcsolva (összehasonlításhoz az éles állapottal)
// - diagnosztikai panel: betöltés, aktív effektek, csökkentett mozgás, lite mód, JS-hibák, commit
;(function () {
  var params = new URLSearchParams(location.search)
  if (params.get('dkm') === '0') window.__DKM_OFF = true

  var jsErrors = 0
  window.addEventListener('error', function () {
    jsErrors++
  })
  window.addEventListener('unhandledrejection', function () {
    jsErrors++
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

  function toggleUrl(on) {
    var u = new URL(location.href)
    if (on) u.searchParams.set('dkm', '0')
    else u.searchParams.delete('dkm')
    return u.pathname + u.search + u.hash
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
      'position:fixed;right:12px;bottom:12px;z-index:2147483000;min-width:240px;padding:12px 14px;border-radius:14px;' +
        'border:1px solid rgba(185,162,255,.35);background:rgba(9,8,13,.95);box-shadow:0 20px 40px -12px #000;display:grid;gap:3px;' +
        "font:600 11.5px/1.35 Manrope,system-ui,sans-serif;color:#F5F5F2",
    )
    var head = node('div', 'display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:4px')
    head.append(node('b', 'font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#B9A2FF', 'Diagnosztika'))
    var close = node('button', 'border:0;background:none;color:#C4C3BD;font:inherit;cursor:pointer;padding:2px 4px', '✕')
    close.setAttribute('aria-label', 'Diagnosztika elrejtése')
    head.append(close)
    panel.append(head)
    var rows = {}
    ;['Motion (dkm.js) betöltve', 'CSS (dkm.css) betöltve', 'Animációk aktívak', 'Csökkentett mozgás', 'Lite mód', 'Aktivált effektek', 'JS-hibák', 'Commit'].forEach(function (k) {
      var r = node('div', 'display:flex;justify-content:space-between;gap:16px')
      r.append(node('span', 'color:#A9A8A2', k))
      var v = node('span', 'font-family:"Geist Mono",ui-monospace,monospace')
      r.append(v)
      panel.append(r)
      rows[k] = v
    })
    var effects = node('div', 'max-width:250px;color:#7d7c76;font-size:10.5px;line-height:1.4;margin-top:2px')
    panel.append(effects)

    // állandó sáv: BE/KI kapcsoló + panel nyitása
    var bar = node(
      'div',
      'display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;border:1px solid rgba(185,162,255,.35);' +
        'background:rgba(9,8,13,.92);box-shadow:0 10px 30px -10px #000',
    )
    bar.append(node('span', 'width:7px;height:7px;background:#D4FF3A;flex:none'))
    bar.append(node('span', 'white-space:nowrap', window.innerWidth < 520 ? 'Előnézet' : 'Előnézet · nem küld adatot'))
    var a = node('a', 'color:#CBB9FF;text-decoration:underline;text-underline-offset:3px;white-space:nowrap', on ? 'Animációk: BE' : 'Animációk: KI')
    a.href = toggleUrl(on)
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
    function update() {
      var s = window.__DKM
      var css = getComputedStyle(document.documentElement).getPropertyValue('--dkm-css').trim() === '1'
      rows['Motion (dkm.js) betöltve'].textContent = yes(!!s)
      rows['CSS (dkm.css) betöltve'].textContent = yes(css)
      rows['Animációk aktívak'].textContent = window.__DKM_OFF ? 'nem (KI)' : yes(s && s.active)
      rows['Csökkentett mozgás'].textContent = yes(matchMedia('(prefers-reduced-motion: reduce)').matches)
      rows['Lite mód'].textContent = yes(s && s.lite)
      rows['Aktivált effektek'].textContent = s ? s.effects.length + (s.failed.length ? ' (+' + s.failed.length + ' nem indult)' : '') : '0'
      rows['JS-hibák'].textContent = String(jsErrors + (s ? s.errors : 0))
      rows['Commit'].textContent = window.__DKM_COMMIT || '?'
      effects.textContent = s && s.effects.length ? s.effects.join(' · ') : ''
    }
    update()
    setInterval(update, 1000)

    wrap.append(bar)
    document.body.appendChild(wrap)
    document.body.appendChild(panel)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui)
  else ui()
})()
