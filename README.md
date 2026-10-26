# DAEKON V2 – Motion látványterv (előnézet)

**Ez nem az éles weboldal.** Az éles oldal: https://daekon.hu (külön forrás, külön szerver – ez a repository nem telepít oda semmit).

Előnézet: https://daekon-ship.github.io/daekon-motion-preview/

- `?theme=blue|violet|ultra` – színtéma közvetlen linkkel (pl. `…/daekon-motion-preview/?theme=ultra`)
- Bal alsó „V2 látványterv” panel: színtéma és animációs szint (Teljes / Visszafogott / Minimális) – csak a látványtervhez.
- Az ajánlatkérő **bemutató**: nem küld adatot, nincs backend. A „kész” állapotból egy előre kitöltött e-mail nyitható.
- `noindex`, `robots.txt: Disallow: /`, nincs canonical a daekon.hu helyett.

## Technológia

React 19 + TypeScript + Vite 8 + [Motion](https://motion.dev) (`motion/react`, `LazyMotion` + `domMax`, `m` komponensek), saját CSS, önállóan kiszolgált betűtípusok (Manrope, Geist Mono – csak latin + latin-ext). A build az oldalt előre rendereli (`scripts/prerender.mjs`), a böngésző hidratálja – így a tartalom JavaScript nélkül is a kezdő HTML-ben van.

```
npm ci
npm run typecheck
npm run lint
npm run build     # dist/ (előre renderelt index.html + 404.html)
npm run preview   # http://localhost:4173/daekon-motion-preview/
```

A `main` ágra pusholt változást a `.github/workflows/pages.yml` építi és teszi ki GitHub Pagesre.

## Hol mit kell átírni a finomításhoz

| Mit | Hol |
| --- | --- |
| Színek, témák (Blue / Violet / Ultra Dark) | `src/styles/tokens.css` – `:root`, `[data-theme='violet']`, `[data-theme='ultra']` |
| Betűméretek, sortáv, térközök, lekerekítés | `src/styles/tokens.css` (`--fs-*`, `--section-y`, `--radius*`) |
| Betűtípus | `src/styles/fonts.css` + `--font-sans` / `--font-mono` |
| Animációs időzítések, görbék | `src/motion/tokens.ts` (+ CSS: `--ease-out`, `--t-*`) |
| Tartalom: referenciák, szolgáltatások, vélemények, történet, GYIK, elérhetőségek | `src/data/content.ts` |
| Hero | `src/components/Hero.tsx` / `Hero.css` |
| Projektkártyák, részletező | `src/components/Projects.tsx` / `Projects.css` (rácsarányok: `spans`) |
| Menü (asztali + mobil) | `src/components/Header.tsx` / `Header.css` |
| Footer | `src/components/Footer.tsx` / `Footer.css` |
| Háttéreffektek | `Hero.css` (`.hero-grid`, `.hero-glow`), `Footer.css` (`.ft-glow`) |

A tartalom a daekon.hu élő állapotából származik (2026-10-26). Vélemény, referencia vagy állítás csak ellenőrzött forrásból kerülhet be; a véleményeket szó szerint kell hagyni. A két új szolgáltatásleírás (Webáruház, Adminfelület) a látványtervhez készült, jóváhagyásra vár.

## Későbbi éles átállás (MOST NEM VÉGREHAJTANDÓ)

Csak a tulajdonos külön, kifejezett jóváhagyása után, külön feladatként:

1. Az éles daekon.hu jelenleg statikus HTML (nem React) – a forrása külön branch-en él, `tools/build.py` építi, és az OVH VPS-re kerül a meglévő release/symlink folyamattal. Döntés kell: a V2 React-build váltja-e a statikus oldalt, vagy a jóváhagyott dizájnt kell a meglévő statikus forrásba átültetni.
2. Ha a React-build marad: `base` → `/`, a `noindex` meta és a `robots.txt` tiltás eltávolítása, canonical + Open Graph + strukturált adatok + sitemap átvétele az élő oldalról, `PreviewBar` és a téma-szkript kivétele.
3. A bemutató ajánlatkérő cseréje az élő backendre (`send.php` / meglévő ajánlatkérő) – a validáció és a dupla beküldés elleni védelem marad.
4. A daekon.hu aloldalai (szolgáltatásoldalak, esettanulmány, jogi oldalak, `/projektem/`) változatlanul maradnak; minden mostani abszolút link relatívvá alakítandó.
5. Mentés, staging, teljes regressziós QA (`tools/qa/run-all.sh`), élesítés csak jóváhagyással, rollback-pont rögzítése.
