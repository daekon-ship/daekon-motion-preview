// ÉLES csomag a daekon.hu-hoz (csak a tulajdonos kifejezett élesítési kérésére használandó).
// Kimenet: out-prod/webroot/{index.html, dkm.js, dkm.css} + out-prod/<név>.tar.gz – a daekon-deploy koordinátor
// overlay-csomagja: CSAK a változó fájlok. Minden más (aloldalak, jogi oldalak, ügyfélportál, send.php, robots,
// sitemap, ikonok) az élő release-ből változatlanul marad.
//
// Az index.html az élő oldal pontos másolata (site/index.html, sha256 egyezik az élővel), amelybe csak beillesztünk:
//   </head> elé: <link rel="stylesheet" href="/dkm.css?v=…"> + <script defer src="/dkm.js?v=…">
//   <body> után: a betöltő (layer/intro.html)
// NINCS benne: preview/shim.js (előnézeti sáv, diagnosztika, BE/KI kapcsoló, send.php-tiltás), noindex, útvonal-átírás.
import { build } from 'esbuild'
import { readFileSync, writeFileSync, rmSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const COMMIT = execSync('git rev-parse --short=7 HEAD').toString().trim()
if (execSync('git status --porcelain -- layer scripts').toString().trim()) {
  console.error('HIBA: nem commitolt változás a layer/ vagy scripts/ alatt – éles csomag csak commitolt állapotból készülhet.')
  process.exit(1)
}
const OUT = 'out-prod'
const WEB = join(OUT, 'webroot')
rmSync(OUT, { recursive: true, force: true })
mkdirSync(WEB, { recursive: true })

await build({
  entryPoints: ['layer/dkm.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  outfile: join(WEB, 'dkm.js'),
  legalComments: 'none',
})
const CSS = ['layer/dkm.css', 'layer/sections.css', 'layer/v5.css', 'layer/v6.css', 'layer/timeline.css', 'layer/compact.css', 'layer/phone.css', 'layer/refine.css']
writeFileSync(join(WEB, 'dkm.css'), CSS.map((f) => readFileSync(f, 'utf-8')).join('\n'))

const src = readFileSync('site/index.html', 'utf-8')
const intro = readFileSync('layer/intro.html', 'utf-8')
const v = encodeURIComponent(COMMIT)
// a réteg CSS-e nem blokkolja az első rajzolást: a szabályai csak html.dkm alatt hatnak, a réteg pedig csak a
// stíluslap betöltése után kapcsol be (layer/dkm.js – whenReady).
// fetchpriority=low: lassú mobilhálózaton ne vegyék el a sávszélességet az oldal saját sablonjától (/r/app-tpl.js)
let html = src.replace(/<\/head>/i, `<link rel="preload" href="/dkm.css?v=${v}" as="style" fetchpriority="low" onload="this.onload=null;this.rel='stylesheet'">\n<script defer src="/dkm.js?v=${v}" fetchpriority="low"></script>\n</head>`)
html = html.replace(/<body>/i, (m) => `${m}\n${intro}`)
writeFileSync(join(WEB, 'index.html'), html)

// biztonsági ellenőrzések: semmi előnézeti elem, a SEO-fejléc érintetlen
const fail = (m) => {
  console.error('HIBA:', m)
  process.exit(1)
}
const all = ['index.html', 'dkm.js', 'dkm.css'].map((f) => readFileSync(join(WEB, f), 'utf-8')).join('\n')
for (const bad of ['daekon-motion-preview', 'noindex', 'Diagnosztika', 'Előnézet', 'github.io', '__DKM_COMMIT'])
  if (all.includes(bad)) fail(`előnézeti maradvány: ${bad}`)
const head = (s) => s.slice(0, s.search(/<\/head>/i))
const strip = (s) => head(s).replace(/<link rel="preload" href="\/dkm\.css[^>]*>\n<script defer src="\/dkm\.js[^>]*><\/script>\n/, '')
if (strip(html) !== head(src)) fail('a <head> a réteg két során kívül is megváltozott')
if (html.match(/<link rel="canonical"/g)?.length !== 1) fail('canonical nem pontosan egy')
if (!/<meta name="robots" content="index, follow/.test(html)) fail('robots meta nem index, follow')

const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex')
const name = `daekon-www-motion-${COMMIT}-webroot.tar.gz`
execSync(`tar -czf ../${name} index.html dkm.js dkm.css`, { cwd: WEB })
const pkg = join(OUT, name)
writeFileSync(`${pkg}.sha256`, `${sha(pkg)}  ${name}\n`)
for (const f of ['index.html', 'dkm.js', 'dkm.css']) console.log(`${f}  ${(statSync(join(WEB, f)).size / 1024).toFixed(1)} kB  ${sha(join(WEB, f)).slice(0, 16)}`)
console.log(`csomag: ${pkg}  sha256 ${sha(pkg)}`)
