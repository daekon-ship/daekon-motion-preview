"""Bizonyítékoldal: evidence/index.html – KI/BE képpárok, pixeles változásmérés, videók.

Futtatás: python -I scripts/evidence_page.py <commit>
A képeket a nyilvános GitHub Pages oldalról Playwright készítette (evidence/shots/*.jpg, evidence/video/*.webm).
"""
import html
import os
import sys

from PIL import Image, ImageChops

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'evidence')
commit = sys.argv[1] if len(sys.argv) > 1 else '?'
sections = [
    ('hero', 'Hero'),
    ('showreel', 'Showreel (a Munkák előtt)'),
    ('services', 'Szolgáltatások'),
    ('process', 'Így dolgozom'),
    ('story', 'A DAEKON története'),
    ('reviews', 'Vélemények'),
    ('os', 'DAEKON OS'),
    ('footer', 'Footer'),
]


def changed(dev, key):
    a = os.path.join(ROOT, 'shots', f'{dev}-{key}-off.jpg')
    b = os.path.join(ROOT, 'shots', f'{dev}-{key}-on.jpg')
    if not (os.path.exists(a) and os.path.exists(b)):
        return None
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    if ia.size != ib.size:
        return None
    h = ImageChops.difference(ia, ib).convert('L').histogram()
    return sum(h[24:]) / sum(h) * 100


def v4_before():
    # a V4 korábbi mérése (evidence/before: ugyanez a módszer, a V4 nyilvános oldalán)
    out = {}
    d = os.path.join(ROOT, 'before')
    for dev in ('desktop', 'mobile'):
        for key, _ in sections:
            a, b = os.path.join(d, f'{dev}-{key}-off.jpg'), os.path.join(d, f'{dev}-{key}-on.jpg')
            if os.path.exists(a) and os.path.exists(b):
                ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
                if ia.size == ib.size:
                    h = ImageChops.difference(ia, ib).convert('L').histogram()
                    out[(dev, key)] = sum(h[24:]) / sum(h) * 100
    return out


before = v4_before()
rows = []
for dev in ('desktop', 'mobile'):
    for key, label in sections:
        now = changed(dev, key)
        prev = before.get((dev, key))
        rows.append(
            f'<tr><td>{"Asztal" if dev == "desktop" else "Mobil"}</td><td>{html.escape(label)}</td>'
            f'<td>{"–" if prev is None else f"{prev:.1f}%"}</td><td><b>{"–" if now is None else f"{now:.1f}%"}</b></td></tr>'
        )

pairs = []
for dev in ('desktop', 'mobile'):
    pairs.append(f'<h2>{"Asztal (1440 px)" if dev == "desktop" else "Mobil (390 px)"}</h2>')
    for key, label in sections:
        off, on = f'shots/{dev}-{key}-off.jpg', f'shots/{dev}-{key}-on.jpg'
        if not os.path.exists(os.path.join(ROOT, on)):
            continue
        pairs.append(
            f'<section class="pair {dev}"><h3>{html.escape(label)}</h3><div class="row">'
            f'<figure><img loading="lazy" src="{off}" alt="{html.escape(label)} – animációk nélkül"><figcaption>KI (az éles oldal állapota)</figcaption></figure>'
            f'<figure><img loading="lazy" src="{on}" alt="{html.escape(label)} – animációkkal"><figcaption>BE (új mozgásréteg)</figcaption></figure>'
            '</div></section>'
        )

videos = []
vd = os.path.join(ROOT, 'video')
names = {
    'desktop-scroll-on.webm': 'Asztal – végiggörgetés, animációk BE',
    'desktop-scroll-off.webm': 'Asztal – ugyanaz, animációk KI (összehasonlítás)',
    'desktop-mouse-on.webm': 'Asztal – egérkövető effektek (hero, showreel, szolgáltatások, vélemények)',
    'mobile-scroll-on.webm': 'Mobil – végiggörgetés, animációk BE',
}
if os.path.isdir(vd):
    for f, label in names.items():
        if os.path.exists(os.path.join(vd, f)):
            videos.append(f'<figure class="vid"><video controls muted playsinline preload="metadata" src="video/{f}"></video><figcaption>{html.escape(label)}</figcaption></figure>')

page = f"""<!doctype html>
<html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>DAEKON mozgásréteg – vizuális bizonyíték</title>
<style>
:root{{color-scheme:dark}}body{{margin:0;background:#050505;color:#F5F5F2;font:15px/1.55 system-ui,sans-serif}}
main{{max-width:1400px;margin:0 auto;padding:32px 16px 80px}}h1{{font-size:26px;margin:0 0 6px}}h2{{margin:48px 0 12px;font-size:20px}}h3{{margin:0 0 8px;font-size:15px;color:#B9A2FF}}
p{{color:#C4C3BD;max-width:80ch}}a{{color:#CBB9FF}}table{{border-collapse:collapse;margin:16px 0;min-width:min(640px,100%)}}td,th{{border-bottom:1px solid #24232B;padding:6px 12px;text-align:left}}th{{color:#A9A8A2;font-weight:600}}
.pair{{margin:0 0 28px}}.row{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}.mobile .row{{max-width:820px}}figure{{margin:0}}img,video{{width:100%;height:auto;border:1px solid #24232B;border-radius:10px;display:block}}
figcaption{{font-size:12.5px;color:#A9A8A2;margin-top:4px}}.vids{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}}
</style></head><body><main>
<h1>DAEKON mozgásréteg – vizuális bizonyíték</h1>
<p>Commit: <b>{html.escape(commit)}</b> · Előnézet: <a href="../">daekon-motion-preview</a> · Összehasonlítás animációk nélkül: <a href="../?dkm=0">?dkm=0</a>.
A képek és videók a nyilvános GitHub Pages oldalról készültek Playwright (Chromium) böngészővel. Az éles daekon.hu nem változott.</p>
<h2>Mennyi változik szemmel láthatóan?</h2>
<p>Ugyanaz a görgetési pozíció animációkkal és nélkülük; a táblázat a képernyő azon pixeleinek arányát mutatja, amelyek legalább ~10%-kal eltérnek.
Ez állókép: a mozgást a videók mutatják. „V4” = a tulajdonos által kifogásolt előző változat ugyanezzel a méréssel.</p>
<table><tr><th>Eszköz</th><th>Szekció</th><th>V4</th><th>Most</th></tr>{''.join(rows)}</table>
<h2>Videók</h2><div class="vids">{''.join(videos) or '<p>(nincs videó)</p>'}</div>
{''.join(pairs)}
</main></body></html>"""
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
print('evidence/index.html kész')
