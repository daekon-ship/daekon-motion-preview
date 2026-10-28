# HTML-first prototípus a daekon.hu főoldalához (2026-10-28)

**Állapot:** prototípus a `htmlfirst/2026-10-28` ágon, **NEM élesítve**. A döntési kapun nem ment át (lásd lent), ezért élesítést nem javaslok.

**Előnézet:** https://daekon-ship.github.io/daekon-motion-preview/htmlfirst/ (`noindex`). Összevetéshez az előnézet gyökere a jelenlegi éles változat.

## Miért lassú a főoldal (profil, lassított mobil)

1. **A HTML-ben nincs valódi tartalom.**
   - A főoldal egy kb. 258 kB-os „dc”-sablon (`/r/app-tpl.js`). A futtatókörnyezet (`/r/6d8231f2…js`) a böngészőben fordítja le, és React 18-cal (`createRoot`) rendereli egy üres `#dc-root`-ba.
   - A HTML-ben csak egy rejtett szöveges másolat (`#ssr`) és a CSS nélküli váz van. A 196 kB-os oldal-CSS a sablon `<helmet>` részéből, JS-ből kerül a `<head>`-be.
2. **Az első felcsatolás egyetlen hosszú feladat.**
   - A React létrehozza a teljes DOM-ot (kb. 1300–1460 elem), majd a `componentDidMount` (hero-méretezés, `fitHeroLogo`) kikényszerít egy teljes layoutot: 788 elem, lassított mobilon kb. 220 ms.
   - A hero szavait a `componentDidMount` elrejti, az `onReady` 140 ms múlva animálja be. Az LCP-elem (a hero bevezetője) ezért csak ezután rajzolódik ki.
3. **A Lighthouse-ban** az LCP-elem renderelési késése kb. 2,5 s, a hálózati része 13 ms.

## Mit csinál a prototípus („A” változat)

| Lépés | Megoldás |
|---|---|
| Buildidejű előrenderelés | `scripts/htmlfirst/snapshot.js` (Playwright) a React első renderjének kimenetét menti el, effektek nélkül (`componentDidMount` kihagyva). A szomszédos szövegcsomópontok közé `<!-- -->` kerül, ahogy a React szerveroldali renderelője is teszi. Az első render szélességfüggetlen (`state.wide: true`), ezért egy pillanatkép minden szélességen hidratálható. |
| CSS a HTML-ben | `scripts/htmlfirst/helmet.js` kigyűjti a helmet `<style>`-jait; ezek `data-dc-pre` jelöléssel a `<head>`-be kerülnek, és a futtatókörnyezet újrahasznosítja őket (nincs duplikálás). |
| Hidratálás | A futtatókörnyezet másolata (`r/dc-runtime-h-*.js`) a meglévő `#dc-root`-ot `hydrateRoot`-tal hidratálja, nem rajzolja újra. Mérve: 0 hidratálási hiba, a H1 ugyanaz az elem marad. |
| Sablon-jelzés | `r/app-tpl-h-*.js`: a `componentDidMount` beállítja a `window.__dcMounted` jelzőt. A Motion-réteg (`layer/dkm.js`) előrenderelt oldalon ezt megvárja, különben a hidratálás felülírná a módosításait. |
| Láthatóság | JS-es oldalon az előrenderelt tartalom a hidratálásig `visibility:hidden`: a layout előre elkészül, de a hidratáláskori JS-igazítások nem okoznak elcsúszást (enélkül asztalon CLS 0,104). JS nélkül a tartalom végig látható. |
| JS nélkül | A hero címe, bevezetője, CTA-i, a telefonszám és a teljes szöveges tartalom látszik. A Motion-függöny és az oldal boot-rétege JS nélkül nem takar; az élő oldalon a függöny JS nélkül 5 s-ig takar. |

Új framework és új függőség nincs. Új futásidejű kód a futtatókörnyezet négy kis módosítása és a sablon egy sora.

## Mérések (labor; valós felhasználói CrUX-adat nincs, a PSI-kvóta elfogyott)

**Felváltott A/B, 10–10 kör.** Mobil: 390 px, 4× CPU, 1,6 Mbit/s, 150 ms. Asztal: 1440 px, 10 Mbit/s, 40 ms. Gyorsítótár kikapcsolva, gzip-es helyi szerver.

| | Élő | HTML-first |
|---|---|---|
| Mobil TBT | 936 ms | **548 ms** (−41%) |
| Mobil függöny felmegy | 3,54 s | **3,03 s** (−0,51 s) |
| Mobil LCP | 2,67 s | 2,62 s (≈) |
| Mobil leghosszabb feladat | 336 ms | 337 ms |
| Asztali TBT | 137 ms | **58 ms** (−58%) |
| Asztali LCP | 0,67 s | **0,57 s** |
| CLS mobil / asztal | 0,005 / 0,012 | 0,004 / 0,009 |

**Lighthouse 12.8** (helyi, szimulált; mobil 10–10, asztal 5–5 futás):

| | Élő | HTML-first |
|---|---|---|
| Mobil pontszám (medián, tartomány) | **69** (67–76) | 58 (51–62) |
| Mobil FCP | 3,46 s | **2,71 s** |
| Mobil LCP | 4,04 s | 3,89 s |
| Mobil TBT | **388 ms** | 1045 ms |
| Mobil Speed Index | **4,70 s** | 6,31 s |
| Asztali pontszám | 96 | 95 |

A Lighthouse szimulációja az előrehozott FCP után számolja a nagy HTML (317 kB, ebből 196 kB inline CSS) feldolgozását és a hidratálást, ezért a TBT nő. A Speed Index azért romlik, mert a tartalom a hidratálásig rejtett.

## Ellenőrzés (prototípus, helyben)
- **Hidratálás:** 0 hiba, 390 és 1440 px-en.
- **Funkcionális tesztek:**
  - `seocheck.py`: 0 probléma.
  - `nav.js`: 0 hiba.
  - `jump.js`: 11/11 rendben.
  - `links.js`: tiszta.
  - `mobile-v4.js`: 0 hiba.
  - Ajánlatkérő: rendben, 0 konzolhiba.
  - Referenciák: 4/4 szélesség rendben.
- **Mélylinkek lassított mobilon:** 5/5 rendben.
  - A `#rolam`-nál a DAEKON OS-kártya belépője kimarad: a böngésző a HTML-ben lévő tartalomhoz már értelmezés közben odagörget, így a kártya bekapcsoláskor már látható.
- **Vizuális:**
  - Csökkentett mozgással a teljes oldalkép legfeljebb 0,04% eltérést mutat (360–1440 px).
  - A mozgásos képeken csak a véletlenszerű animációk térnek el.
  - Stílus nélküli képkocka nincs.

## Döntési kapu: NEM

| Feltétel | Teljesül? |
|---|---|
| Ténylegesen gyorsabb | Részben. Valódi böngészős mérésben a TBT −41% / −58%, a függöny −0,5 s. A Lighthouse mobilon viszont romlik (69 → 58). |
| Megőrzi a megjelenést | Igen. |
| Minden funkciót megtart | Igen. |
| Nincs kritikus regresszió | A Lighthouse-pontszám és a Speed Index romlása regresszió a kért cél („mérhető Lighthouse-javulás”) szempontjából. |

**Architekturális kockázat:**
- Elágazik a generált futtatókörnyezet.
- Minden tartalomváltozásnál újra kell futtatni a böngészős pillanatképet; ha a pillanatkép elavul, a React kliensoldali rendereléssel helyreáll, de a nyereség elvész.
- A sablonba és a Motion-rétegbe hidratálási függőség kerül.

**Ajánlás:** a jelenlegi éles változat marad. Érdemi Lighthouse-javulás csak a „B” változattól várható: a függöny a statikus HTML megjelenésekor menne fel, a hero beúszása CSS-ből futna, a hero-méretezés pedig inline szkriptből. Ehhez az első képnek a hidratált állapottal pixelre egyeznie kell (logóméretezés, monitor, canvas-effektek, görgetésfüggő átvezető), ami jóval nagyobb vizuális kockázat. Csak külön döntés után érdemes elkezdeni.

## Újragenerálás
```
# 1) a jelenlegi éles webgyökér kiszolgálva (gzip): node <srv.js> <webroot> 5441
node scripts/htmlfirst/snapshot.js http://127.0.0.1:5441/ <munkamappa>      # snap-wide.html, snap-narrow.html
node scripts/htmlfirst/helmet.js http://127.0.0.1:5441/ <munkamappa>/helmet.json
python -I scripts/htmlfirst/build.py <webroot-másolat> <munkamappa>           # index.html + r/dc-runtime-h-*.js + r/app-tpl-h-*.js
```
(`NODE_PATH`: Playwright, pl. a daekon.hu repó `tools/qa/node_modules`-a.)
