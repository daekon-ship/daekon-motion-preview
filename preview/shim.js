// CSAK AZ ELŐNÉZETHEZ – éles telepítésbe nem kerül.
// - az ajánlatkérő nem küld semmit (a send.php-t helyben elutasítja, így az oldal saját e-mailes tartaléka jelenik meg)
// - ?dkm=0: az új animációs réteg kikapcsolva (összehasonlításhoz az éles állapottal)
// - kis jelzés a sarokban, hogy ez előnézet
;(function () {
  var params = new URLSearchParams(location.search)
  if (params.get('dkm') === '0') window.__DKM_OFF = true

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

  function badge() {
    var on = !window.__DKM_OFF
    var el = document.createElement('div')
    el.setAttribute('role', 'note')
    el.style.cssText =
      'position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:8px 12px;' +
      'border-radius:999px;border:1px solid rgba(185,162,255,.35);background:rgba(9,8,13,.92);backdrop-filter:blur(8px);' +
      "font:600 12px/1.2 Manrope,system-ui,sans-serif;color:#F5F5F2;box-shadow:0 10px 30px -10px #000"
    var dot = document.createElement('span')
    dot.style.cssText = 'width:7px;height:7px;background:#D4FF3A;flex:none'
    var txt = document.createElement('span')
    txt.textContent = 'Előnézet · nem küld adatot'
    var a = document.createElement('a')
    var u = new URL(location.href)
    if (on) u.searchParams.set('dkm', '0')
    else u.searchParams.delete('dkm')
    a.href = u.pathname + u.search + u.hash
    a.textContent = on ? 'Új animációk: BE' : 'Új animációk: KI'
    a.style.cssText = 'color:#CBB9FF;text-decoration:underline;text-underline-offset:3px'
    el.append(dot, txt, a)
    document.body.appendChild(el)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', badge)
  else badge()
})()
