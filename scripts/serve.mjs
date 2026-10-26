// Helyi előnézet: http://127.0.0.1:4330/daekon-motion-preview/
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'

const ROOT = 'out'
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.gif': 'image/gif', '.xml': 'application/xml', '.txt': 'text/plain' }

createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '')
  let file = join(ROOT, p)
  if (p.split(/[\\/]/).includes('..')) {
    res.writeHead(400)
    return res.end()
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404')
  }
}).listen(4330, '127.0.0.1', () => console.log('http://127.0.0.1:4330/daekon-motion-preview/'))
