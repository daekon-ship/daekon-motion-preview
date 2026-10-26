# daekon.hu + Motion animációs réteg (előnézet)

**Ez nem az éles weboldal.** Az éles oldal: https://daekon.hu – ez a repository oda semmit nem telepít.

Előnézet: https://daekon-ship.github.io/daekon-motion-preview/
Összehasonlítás az új animációk nélkül (= az éles állapot): https://daekon-ship.github.io/daekon-motion-preview/?dkm=0

## Felépítés
- `site/` – az éles daekon.hu pontos másolata (2026-10-26, a kiszolgált fájlok; a főoldal SHA-256 hash-e egyezett az élővel). Nem szerkesztjük.
- `layer/` – **az új mozgásréteg** (Motion: `animate`, `inView`, `scroll`, `stagger`, `spring` + CSS), kb. 40 kB JS + 19 kB CSS (gzip nélkül). Szekciónként:
  - **Hero:** egérkövető fényfolt a meglévő lila fények fölött; mágneses CTA-k. (A cím saját, eredeti animációja érintetlen.)
  - **Navigáció:** rugóval átcsúszó fénylő jelölő az aktív menüpont mögött; mágneses menüpontok; fénycsík a „Kérj ajánlatot” gombon.
  - **Szekcióhatárok:** belépéskor egyszer végigfutó fénycsík a szekciók felső vonalán.
  - **Showreel:** a 9 valódi projekt lebegő, elhúzható, rugós kártyái + lassú lebegés (csak amíg látszik), kurzor felé dőlés, fényes visszaverődés, mélység szerinti sötétítés.
  - **Munkák:** beúszó sorok kirajzolódó vonallal, egérkövető fény, lebegő képernyőkép-előnézet.
  - **Szolgáltatások:** egérkövető fény a sorokon, rugós címmozdulat, az aktív sor felső vonala kirajzolódik, a 3D rétegköteg az egér felé dől.
  - **Így dolgozom:** görgetéshez kötött vonal, a lépések sorban kigyúlnak, a sorszám felvillan.
  - **Történet:** fénypont fut a 2011–2026 vonalon görgetésre; a bekezdések olvasás közben egymás után kerülnek előtérbe; egérkövető fény.
  - **Vélemények:** finom rugós emelkedés és egérkövető fény (asztalon; mobilon statikus rács).
  - **DAEKON OS:** belépő + fénycsík, vándorló háttérfény (csak amíg látszik), egérre dőlő kártya, a leírásban szereplő 5 modul egyszeri „ellenőrző” felvillanása (nem valós idejű adat).
  - **Kapcsolat:** egérkövető fény és belépő fénycsík az ajánlatkérő sávon.
  - **Footer:** görgetésre felkelő fény, a DAEKON-felirat vonalai kirajzolódnak, „itt kezdődik.” felragyog, mágneses elérhetőségek.
  Elvek: csak transform/opacity és CSS-változók; csökkentett mozgásnál semmi nem mozog; gyenge eszközön („lite”) a folyamatos effektek kimaradnak; ami betöltéskor látszik, azt nem rejti el; a dc-runtime rejtett sablonpéldányát kerüli. Hibakereséshez: `?dkmskip=reel,heroLight,…`.
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
