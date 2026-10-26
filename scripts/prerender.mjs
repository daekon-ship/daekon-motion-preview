// A kliens-build index.html-jébe beírja az előre renderelt oldalt, majd 404.html-t is készít (GitHub Pages).
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const html = readFileSync(resolve(dist, 'index.html'), 'utf-8')
if (!html.includes('<!--app-->')) throw new Error('prerender: <!--app--> jelölő hiányzik')
let out = html.replace('<!--app-->', render())
// az egyetlen (~8 kB gzip) stíluslapot beágyazza: nincs külön renderelést blokkoló kérés
out = out.replace(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/, (_, href) => {
  const css = readFileSync(resolve(dist, href.replace(/^.*\/assets\//, 'assets/')), 'utf-8')
  return `<style>${css}</style>`
})
writeFileSync(resolve(dist, 'index.html'), out)
writeFileSync(resolve(dist, '404.html'), out)
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
console.log(`prerender: ${(out.length / 1024).toFixed(1)} kB HTML`)
