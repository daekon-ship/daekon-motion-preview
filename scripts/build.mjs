// Előnézet-build: site/ (az éles daekon.hu pontos másolata) + layer/ (új animációk) + preview/ (csak előnézet).
// Kimenet: out/<BASE>/ – a GitHub Pages ezt teszi ki https://daekon-ship.github.io/daekon-motion-preview/ alá.
//
// Élesítéshez (CSAK külön tulajdonosi jóváhagyással!) elég a layer: dkm.js + dkm.css a gyökérbe,
// és az index.html </head> elé: <link rel="stylesheet" href="/dkm.css"><script defer src="/dkm.js"></script>
import { build } from 'esbuild'
import { cpSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const BASE = process.env.BASE ?? '/daekon-motion-preview'
const OUT = join('out', BASE.replace(/^\//, '') || '.')

rmSync('out', { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
cpSync('site', OUT, { recursive: true })

await build({
  entryPoints: ['layer/dkm.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  outfile: join(OUT, 'dkm.js'),
  legalComments: 'none',
})
// a réteg stílusai egy fájlban (kevesebb kérés): alap + szekciónkénti effektek
writeFileSync(join(OUT, 'dkm.css'), ['layer/dkm.css', 'layer/sections.css'].map((f) => readFileSync(f, 'utf-8')).join('\n'))

const shim = readFileSync('preview/shim.js', 'utf-8')

// Az élő oldal gyökér-abszolút útvonalai (/r/…, /assets/…, aloldalak, jogi oldalak, /#horgony) → BASE alá.
// Csak ezek a pontosan ismert gyökerek változnak; más „/…” karakterlánc (pl. shader-regexek) érintetlen marad.
const ROOTS = [
  'r/', 'assets/', 'm2\\.js', 'e\\.gif', 'favicon', 'apple-touch-icon', 'send\\.php', 'dkm\\.(?:js|css)',
  'referenciak/', 'projektem/', 'weboldalkeszites/', 'webshop-keszites/', 'ettermi-rendelesi-rendszer/',
  'idopontfoglalo-rendszer/', 'egyedi-webalkalmazas/', 'vallalkozasi-automatizalas/', 'weboldal-karbantartas/',
  'adatkezeles\\.html', 'impresszum\\.html', 'felhasznalasi-feltetelek\\.html', '#',
]
const rootRe = new RegExp(`(["'\`(=])/(?=(?:${ROOTS.join('|')}))`, 'g')
const homeRe = /(href=["'])\/(["'])/g

function rewrite(text) {
  if (!BASE) return text
  return text.replace(rootRe, `$1${BASE}/`).replace(homeRe, `$1${BASE}/$2`)
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

let changed = 0
for (const file of walk(OUT)) {
  const ext = extname(file)
  if (!['.html', '.js', '.css'].includes(ext) || file.endsWith('dkm.js')) continue
  let text = readFileSync(file, 'utf-8')
  const before = text
  if (ext === '.html') {
    const isHome = file === join(OUT, 'index.html') || file === join(OUT, '404.html')
    text = text.replace(/<meta name="robots"[^>]*>\s*/gi, '')
    const head =
      '<meta name="robots" content="noindex, nofollow, noarchive">\n' +
      `<script>${shim}</script>\n` +
      (isHome ? '<link rel="stylesheet" href="/dkm.css">\n<script defer src="/dkm.js"></script>\n' : '')
    text = text.replace(/<head>/i, (m) => `${m}\n${head}`)
  }
  text = rewrite(text)
  if (text !== before) {
    writeFileSync(file, text)
    changed++
  }
}

writeFileSync(join(OUT, 'robots.txt'), '# Előnézet – nem indexelendő. Az éles oldal: https://daekon.hu\nUser-agent: *\nDisallow: /\n')
writeFileSync(join(OUT, '.nojekyll'), '')
const kb = (statSync(join(OUT, 'dkm.js')).size / 1024).toFixed(1)
console.log(`build: ${OUT} · ${changed} fájl módosítva · dkm.js ${kb} kB`)
