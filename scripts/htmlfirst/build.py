# HTML-first prototype builder (A): prerendered React first-render markup + page CSS in the HTML, runtime hydrates.
import json, re, sys, hashlib, os
H, SP = sys.argv[1], sys.argv[2]
idx = os.path.join(H, 'index.html'); s = open(idx, encoding='utf-8').read()
snap = open(os.path.join(SP, 'snap-wide.html'), encoding='utf-8').read()
helmet = json.load(open(os.path.join(SP, 'helmet.json'), encoding='utf-8'))
h8 = lambda t: hashlib.sha256(t.encode()).hexdigest()[:10]

# 1) page CSS (helmet <style data-dc-tpl=N>) statically in <head>, marked data-dc-pre so the runtime reuses them
css = ''
for h in helmet:
    if h['tag'] == 'STYLE' and 'data-dc-tpl=' in h['attrs']:
        n = re.search(r'data-dc-tpl=(\S+)', h['attrs']).group(1)
        css += '<style data-dc-tpl="%s" data-dc-pre="">%s</style>\n' % (n, h['text'].replace('</style', r'<\/style'))
assert css.count('<style') == 5
s = s.replace('</head>', css + '</head>', 1)

# 2) the hidden text snapshot (#ssr) is replaced by the real first-render markup in #dc-root
i = s.index('<div id="ssr">'); j = s.index('</div>\n<script src="/r/app-tpl.js')
s = s[:i] + '<div id="dc-root" data-dc-pre="" data-dc-hold="">' + snap + '</div>' + s[j + len('</div>'):]

# 3) runtime fork: reuse the existing #dc-root and hydrate it; helmet reuses the prerendered <style>s
rt_old = '/r/6d8231f2-dbc9-4c47-8827-5d0be1cd359a.js'
rt = open(os.path.join(H, rt_old.lstrip('/')), encoding='utf-8').read()
pairs = [
('''    const dc = doc.querySelector("x-dc");
    const hostEl = doc.createElement("div");
    hostEl.id = "dc-root";
    dc.replaceWith(hostEl);''',
'''    const dc = doc.querySelector("x-dc");
    // HTML-first: a buildidőben előrenderelt #dc-root-ot hidratáljuk (nem rajzoljuk újra)
    const preEl = doc.getElementById("dc-root");
    const hostEl = preEl || doc.createElement("div");
    if (preEl) dc.remove();
    else {
      hostEl.id = "dc-root";
      dc.replaceWith(hostEl);
    }'''),
('''    if (ReactDOM.createRoot)
      ReactDOM.createRoot(hostEl).render(h(StandaloneRoot));''',
'''    if (preEl && ReactDOM.hydrateRoot)
      ReactDOM.hydrateRoot(hostEl, h(StandaloneRoot), { onRecoverableError: (e) => { (window.__dcHydrateErrors = window.__dcHydrateErrors || []).push(String(e && e.message || e)); } });
    else if (ReactDOM.createRoot)
      ReactDOM.createRoot(hostEl).render(h(StandaloneRoot));'''),
('''            if (!el || el.tagName !== tag) {
              if (el) el.remove();
              el = doc.createElement(tag.toLowerCase());
              live.set(key, el);
              doc.head.appendChild(el);
            }''',
'''            if (!el || el.tagName !== tag) {
              const tplId = tag === "STYLE" ? child.getAttribute("data-dc-tpl") : null;
              const pre = tplId ? doc.head.querySelector('style[data-dc-pre][data-dc-tpl="' + tplId + '"]') : null;
              if (pre) {
                el = pre;
                live.set(key, el);
              } else {
                if (el) el.remove();
                el = doc.createElement(tag.toLowerCase());
                live.set(key, el);
                doc.head.appendChild(el);
              }
            }'''),
]
for a, b in pairs:
    assert rt.count(a) == 1, a[:60]
    rt = rt.replace(a, b)
name = '/r/dc-runtime-h-%s.js' % h8(rt)
open(os.path.join(H, name.lstrip('/')), 'w', encoding='utf-8', newline='\n').write(rt)
assert s.count(rt_old) == 2; s = s.replace(rt_old, name)

# 4) template: componentDidMount signals (the motion layer starts after hydration)
tpl_old = re.search(r'/r/app-tpl\.js\?v=[0-9a-f]+', s).group(0)
tpl = open(os.path.join(H, 'r', 'app-tpl.js'), encoding='utf-8').read()
assert tpl.count('componentDidMount() {') == 1
tpl = tpl.replace('componentDidMount() {', "componentDidMount() { window.__dcMounted = true; requestAnimationFrame(() => { const r = document.getElementById('dc-root'); if (r) r.removeAttribute('data-dc-hold'); });")
tname = '/r/app-tpl-h-%s.js' % h8(tpl)
open(os.path.join(H, tname.lstrip('/')), 'w', encoding='utf-8', newline='\n').write(tpl)
assert s.count(tpl_old) == 2; s = s.replace(tpl_old, tname)

# 5) without JS the intro curtain must not cover the (now real) content; .js comes from the head inline script
# 6) JS-es oldalon az előrenderelt tartalom a hidratálásig rejtett (a layout előre elkészül, de nem rajzolódik ki, így
#    a hidratáláskori JS-igazítások, pl. a hero fitHeroLogo, nem okoznak elcsúszást). JS nélkül végig látható.
s = s.replace('</head>', '<style>html.js #dc-root[data-dc-hold]{visibility:hidden}</style>\n</head>', 1)
a2 = '#dkm-intro{position:fixed;'
assert s.count(a2) == 1; s = s.replace(a2, 'html:not(.js) #dkm-intro,html:not(.js) .dk-boot{display:none}#dkm-intro{position:fixed;')

open(idx, 'w', encoding='utf-8', newline='\n').write(s)
print('index', len(s), 'runtime', name, 'template', tname)
