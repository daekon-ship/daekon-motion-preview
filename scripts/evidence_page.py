"""Bizonyítékoldal: evidence/index.html – összehasonlító videók, KI/BE képpárok, pixeles változásmérés (V4 → V5 → V6).

Futtatás: python -I scripts/evidence_page.py <commit>
A képeket és videókat a nyilvános GitHub Pages oldalról Playwright (Chromium) készítette:
evidence/shots/*.jpg (V6), evidence/v5/*.jpg (V5), evidence/before/*.jpg (V4), evidence/video/*.mp4.
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
    ('reviews', 'Vélemények'),
    ('process', 'Így dolgozom'),
    ('story', 'A DAEKON története'),
    ('os', 'DAEKON OS'),
    ('footer', 'Footer'),
]


def changed(folder, dev, key):
    a = os.path.join(ROOT, folder, f'{dev}-{key}-off.jpg')
    b = os.path.join(ROOT, folder, f'{dev}-{key}-on.jpg')
    if not (os.path.exists(a) and os.path.exists(b)):
        return None
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    if ia.size != ib.size:
        return None
    h = ImageChops.difference(ia, ib).convert('L').histogram()
    return sum(h[24:]) / sum(h) * 100


def pct(v, bold=False):
    if v is None:
        return '–'
    s = f'{v:.1f}%'
    return f'<b>{s}</b>' if bold else s


rows = []
for dev in ('desktop', 'mobile'):
    for key, label in sections:
        rows.append(
            f'<tr><td>{"Asztal" if dev == "desktop" else "Mobil"}</td><td>{html.escape(label)}</td>'
            f'<td>{pct(changed("before", dev, key))}</td><td>{pct(changed("v5", dev, key))}</td>'
            f'<td>{pct(changed("shots", dev, key), True)}</td></tr>'
        )

pairs = []
for dev in ('desktop', 'mobile'):
    pairs.append(f'<h2>{"Asztal (1440 px)" if dev == "desktop" else "Mobil (390 px)"} – állóképek</h2>')
    for key, label in sections:
        off, on = f'shots/{dev}-{key}-off.jpg', f'shots/{dev}-{key}-on.jpg'
        if not os.path.exists(os.path.join(ROOT, on)):
            continue
        pairs.append(
            f'<section class="pair {dev}"><h3>{html.escape(label)}</h3><div class="row">'
            f'<figure><img loading="lazy" src="{off}" alt="{html.escape(label)} – animációk nélkül"><figcaption>KI (az éles daekon.hu állapota)</figcaption></figure>'
            f'<figure><img loading="lazy" src="{on}" alt="{html.escape(label)} – V6 animációkkal"><figcaption>BE (V6 mozgásréteg)</figcaption></figure>'
            '</div></section>'
        )

videos = []
names = {
    'desktop-compare.mp4': ('Asztal – ugyanaz a görgetési útvonal: balra KI (eredeti), jobbra BE (V6)', 'wide'),
    'desktop-mouse.mp4': ('Asztal – egérmozgásos bemutató (hero, showreel, szolgáltatás-kártyák cseréje, vélemények, történet, DAEKON OS, footer)', 'wide'),
    'mobile-compare.mp4': ('Mobil (390 px) – ugyanaz a görgetési útvonal: balra KI, jobbra BE (V6)', 'tall'),
}
for f, (label, cls) in names.items():
    if os.path.exists(os.path.join(ROOT, 'video', f)):
        videos.append(
            f'<figure class="vid {cls}"><video controls muted playsinline preload="metadata" src="video/{f}"></video>'
            f'<figcaption>{html.escape(label)}</figcaption></figure>'
        )

page = f"""<!doctype html>
<html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>DAEKON V6 – vizuális bizonyíték</title>
<style>
:root{{color-scheme:dark}}body{{margin:0;background:#050505;color:#F5F5F2;font:15px/1.55 system-ui,sans-serif}}
main{{max-width:1400px;margin:0 auto;padding:32px 16px 80px}}h1{{font-size:26px;margin:0 0 6px}}h2{{margin:48px 0 12px;font-size:20px}}h3{{margin:0 0 8px;font-size:15px;color:#B9A2FF}}
p{{color:#C4C3BD;max-width:80ch}}a{{color:#CBB9FF}}.tw{{overflow-x:auto}}table{{border-collapse:collapse;margin:16px 0;min-width:min(640px,100%)}}td,th{{border-bottom:1px solid #24232B;padding:6px 12px;text-align:left}}th{{color:#A9A8A2;font-weight:600}}
.pair{{margin:0 0 28px}}.row{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}.mobile .row{{max-width:820px}}figure{{margin:0}}img,video{{width:100%;height:auto;border:1px solid #24232B;border-radius:10px;display:block;background:#000}}
figcaption{{font-size:12.5px;color:#A9A8A2;margin-top:4px}}.vids{{display:grid;gap:24px}}.vid.tall video{{max-width:820px}}
</style></head><body><main>
<h1>DAEKON V6 – vizuális bizonyíték</h1>
<p>Commit: <b>{html.escape(commit)}</b> · Előnézet: <a href="../">daekon-motion-preview</a> · Ugyanez animációk nélkül: <a href="../?dkm=0">?dkm=0</a>.
Minden felvétel a nyilvános GitHub Pages oldalról készült Playwright (Chromium) böngészővel, ugyanazzal a nézetmérettel és görgetési útvonallal. Az éles daekon.hu nem változott.</p>
<h2>Összehasonlító videók</h2><div class="vids">{''.join(videos) or '<p>(nincs videó)</p>'}</div>
<h2>Mennyi változik szemmel láthatóan?</h2>
<p>Ugyanaz a görgetési pozíció animációkkal és nélkülük; a szám a képernyő azon pixeleinek aránya, amelyek legalább ~10%-kal eltérnek.
Ez állókép-mérés: a mozgást (forgás, áramlás, kártyacsere) a videók mutatják. A V4 és V5 oszlop a korábbi, kifogásolt változatok ugyanezzel a méréssel.</p>
<div class="tw"><table><tr><th>Eszköz</th><th>Szekció</th><th>V4</th><th>V5</th><th>V6</th></tr>{''.join(rows)}</table></div>
{''.join(pairs)}
</main></body></html>"""
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
print('evidence/index.html kész')
