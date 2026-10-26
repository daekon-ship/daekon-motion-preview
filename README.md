# daekon.hu + Motion animációs réteg (előnézet)

**Ez nem az éles weboldal.** Az éles oldal: https://daekon.hu – ez a repository oda semmit nem telepít.

Előnézet: https://daekon-ship.github.io/daekon-motion-preview/
Összehasonlítás az új animációk nélkül (= az éles állapot): https://daekon-ship.github.io/daekon-motion-preview/?dkm=0

## Felépítés
- `site/` – az éles daekon.hu pontos másolata (2026-10-26, a kiszolgált fájlok; a főoldal SHA-256 hash-e egyezett az élővel). Nem szerkesztjük.
- `layer/` – **az új animációk** (Motion: `animate`, `inView`, `stagger`), kb. 33 kB (gzip nélkül):
  1. Munkák: a projektsorok egymás után úsznak be, az elválasztó vonaluk kirajzolódik; asztalon egérkövető fény a soron.
  2. Így dolgozom: a felső vonal végigfut, a lépések sorban érkeznek, a sorszám egy pillanatra felvillan.
  3. DAEKON OS: a kártya felemelkedik, egyszeri fénycsík fut végig rajta.
  4. Projekt-showreel a Munkák előtt (sitereel.ai lebegő kártyái + motion.dev rugós gesztusai alapján): a 9 valódi projekt képernyőképe térben lebeg, görgetésre/egérre mélységgel mozog, egérrel elhúzható és rugóval visszaugrik, kattintásra megnyílik.
  5. Lebegő előnézet a projektlistán (asztalon): a sor fölött az oldal képernyőképe követi a kurzort.
  6. Mágneses CTA-gombok (asztalon), rugós visszaállással.
  Csak ott mozgat, ahol az oldal eddig statikus volt; csökkentett mozgásnál semmit nem csinál; ami már a képernyőn van, azt nem rejti el; a végén nem hagy inline stílust.
- `preview/shim.js` – **csak előnézet**: noindex, az ajánlatkérő nem küld semmit (a `send.php` helyben elutasítva), sarokjelzés BE/KI kapcsolóval.
- `scripts/build.mjs` – összerakja az `out/daekon-motion-preview/` mappát, és az előnézeti alútvonalhoz igazítja a gyökér-útvonalakat.

```
npm ci
npm run build
npm run serve   # http://127.0.0.1:4330/daekon-motion-preview/
```

## Élesítés (MOST NEM – csak a tulajdonos külön jóváhagyásával)
A shim és az útvonal-átírás NEM kerül élesbe. Csak a réteg:
1. `BASE= node scripts/build.mjs` helyett elég: `npx esbuild layer/dkm.js --bundle --minify --format=iife --outfile=dkm.js`, és `layer/dkm.css`.
2. A két fájl a daekon.hu gyökerébe (a showreel az assets/img/ref/ képeit használja, ezek már élesek); a főoldal `<head>` részébe: `<link rel="stylesheet" href="/dkm.css">` és `<script defer src="/dkm.js"></script>`.
3. A meglévő release/QA folyamat (`tools/qa/run-all.sh`), mentés és rollback-pont, élesítés csak jóváhagyással.

A korábbi, teljesen új React-alapú V2 látványterv a `v2-react` ágon megmaradt.
