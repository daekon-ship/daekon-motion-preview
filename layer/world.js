// V6 – vászon alapú, térhatású jelenetek (2D canvas + saját, egyszerű 3D vetítés):
// hero-világ (perspektivikus rácspadló, forgó drótváz-testek, felénk áramló fénypontok),
// DAEKON OS hálózat (forgó 3D csomópont-gömb, a modulokból a mag felé áramló jelek), footer-fénypadló.
// Mindegyik csak látható állapotban rajzol, háttérfülön áll, a felbontás (DPR) korlátozott.
// Csak dekoráció: aria-hidden, nincs benne valós vagy kitalált rendszerállapot.
import { $, finePointer } from './util.js'

const LILAC = [185, 162, 255]
const LIME = [212, 255, 58]
const VIOLET = [108, 72, 255]
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const lite = () => document.documentElement.classList.contains('dkm-lite')

function canvasEl(cls) {
  const c = document.createElement('canvas')
  c.className = cls
  c.setAttribute('aria-hidden', 'true')
  return c
}

/** Rajzciklus: méretezés, láthatóság, háttérfül, képkocka-korlát. draw(ctx, w, h, t, dt) */
function run(canvas, host, draw, { dpr = 1.5, name = canvas.className } = {}) {
  const frames = (window.__DKM && window.__DKM.frames) || {}
  frames[name] = 0
  const ctx = canvas.getContext('2d')
  const fps = lite() ? 30 : 60
  let w = 0
  let h = 0
  let raf = 0
  let visible = false
  let last = 0
  const t0 = performance.now()
  const size = () => {
    const r = canvas.getBoundingClientRect()
    const ratio = Math.min(devicePixelRatio || 1, dpr)
    w = r.width
    h = r.height
    canvas.width = Math.max(1, Math.round(w * ratio))
    canvas.height = Math.max(1, Math.round(h * ratio))
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  }
  new ResizeObserver(size).observe(canvas)
  size()
  const minDt = 1000 / fps - 3
  const frame = (now) => {
    raf = 0
    if (!visible || document.hidden) return
    raf = requestAnimationFrame(frame)
    if (now - last < minDt) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    ctx.clearRect(0, 0, w, h)
    draw(ctx, w, h, (now - t0) / 1000, dt)
    frames[name]++ // a diagnosztika ebből látja, hogy a jelenet ténylegesen rajzol
  }
  const kick = () => {
    if (!raf && visible && !document.hidden) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    kick()
  }).observe(host)
  document.addEventListener('visibilitychange', kick)
}

/** Rugalmasan követő egérpozíció (-0.5…0.5) egy területen; érintőképernyőn lassú, önálló „lebegés”. */
function pointer(area) {
  const tgt = { x: 0, y: 0 }
  const p = { x: 0, y: 0 }
  const fine = finePointer()
  if (fine)
    area.addEventListener(
      'pointermove',
      (e) => {
        const r = area.getBoundingClientRect()
        tgt.x = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5)
        tgt.y = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5)
      },
      { passive: true },
    )
  p.step = (t) => {
    if (!fine) {
      tgt.x = Math.sin(t * 0.21) * 0.22
      tgt.y = Math.cos(t * 0.17) * 0.12
    }
    p.x += (tgt.x - p.x) * 0.05
    p.y += (tgt.y - p.y) * 0.05
  }
  return p
}

function rot([x, y, z], ay, ax) {
  const cy = Math.cos(ay)
  const sy = Math.sin(ay)
  const x1 = x * cy - z * sy
  const z1 = x * sy + z * cy
  const cx = Math.cos(ax)
  const sx = Math.sin(ax)
  return [x1, y * cx - z1 * sx, y * sx + z1 * cx]
}

// ---------- drótváz-testek ----------
function solid(verts, edgeLen) {
  const n = verts.map((v) => {
    const l = Math.hypot(...v)
    return v.map((c) => c / l)
  })
  const edges = []
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(verts[i][0] - verts[j][0], verts[i][1] - verts[j][1], verts[i][2] - verts[j][2])
      if (Math.abs(d - edgeLen) < 0.01) edges.push([i, j])
    }
  return { v: n, e: edges }
}
const PHI = (1 + Math.sqrt(5)) / 2
const ICOSA = solid(
  [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
  ],
  2,
)
const OCTA = solid(
  [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ],
  Math.SQRT2,
)
// kocka a kockában (összekötött sarkokkal)
const CUBE2 = (() => {
  const v = []
  for (const s of [1, 0.5]) for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x * s, y * s, z * s])
  const e = []
  for (const base of [0, 8])
    for (let i = 0; i < 8; i++)
      for (let j = i + 1; j < 8; j++) {
        const a = v[base + i]
        const b = v[base + j]
        const diff = (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2])
        if (diff === 1) e.push([base + i, base + j])
      }
  for (let i = 0; i < 8; i++) e.push([i, i + 8])
  return { v: v.map((p) => p.map((c) => c / Math.sqrt(3))), e }
})()

function drawSolid(ctx, S, cx, cy, r, ay, ax, alpha, accent) {
  const P = S.v.map((p) => {
    const q = rot(p, ay, ax)
    const k = 3 / (3 + q[2])
    return [cx + q[0] * r * k, cy + q[1] * r * k, q[2]]
  })
  ctx.lineCap = 'round'
  for (const [i, j] of S.e) {
    const a = P[i]
    const b = P[j]
    const depth = 1 - ((a[2] + b[2]) / 2 + 1) / 2 // 1 = elöl
    const al = alpha * (0.25 + depth * 0.75)
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.strokeStyle = rgba(VIOLET, al * 0.35)
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.strokeStyle = rgba(LILAC, al)
    ctx.lineWidth = 1.4
    ctx.stroke()
  }
  P.forEach((p, i) => {
    const depth = 1 - (p[2] + 1) / 2
    ctx.fillStyle = rgba(i % 3 === 0 ? accent : LILAC, alpha * (0.3 + depth * 0.7))
    ctx.beginPath()
    ctx.arc(p[0], p[1], 1.6 + depth * 2.2, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ---------- perspektivikus rácspadló ----------
// horizon: a látóhatár y-ja, f: fókusz, camH: kamera magassága, off: előrehaladás (0–1), wave: a lime hullám mélysége
function drawFloor(ctx, w, h, { cx, horizon, f, camH, off, alpha, wave, cols = 18, depth = 34 }) {
  if (horizon >= h) return
  const grad = ctx.createLinearGradient(0, horizon, 0, h)
  grad.addColorStop(0, rgba(LILAC, 0))
  grad.addColorStop(0.18, rgba(LILAC, alpha * 0.35))
  grad.addColorStop(1, rgba(LILAC, alpha))
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.2
  ctx.beginPath()
  const zNear = 0.45
  for (let k = 0; k < depth; k++) {
    const z = k + 1 - off
    if (z < zNear) continue
    const y = horizon + (camH * f) / z
    if (y > h + 2) continue
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  for (let X = -cols; X <= cols; X++) {
    ctx.moveTo(cx + (X * f) / depth, horizon + (camH * f) / depth)
    ctx.lineTo(cx + (X * f) / zNear, horizon + (camH * f) / zNear)
  }
  ctx.stroke()
  // lime hullám: egy fényes vonal, ami a mélyből felénk fut
  if (wave > zNear && wave < depth) {
    const y = horizon + (camH * f) / wave
    if (y < h) {
      const a = alpha * 1.6 * clamp(1 - wave / depth) + 0.15
      const g = ctx.createLinearGradient(0, 0, w, 0)
      g.addColorStop(0, rgba(LIME, 0))
      g.addColorStop(0.5, rgba(LIME, Math.min(1, a)))
      g.addColorStop(1, rgba(LIME, 0))
      ctx.strokeStyle = g
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  }
  // látóhatár-fény
  const hg = ctx.createRadialGradient(cx, horizon, 0, cx, horizon, w * 0.55)
  hg.addColorStop(0, rgba(LILAC, alpha * 0.55))
  hg.addColorStop(0.35, rgba(VIOLET, alpha * 0.25))
  hg.addColorStop(1, rgba(VIOLET, 0))
  ctx.save()
  ctx.translate(0, horizon)
  ctx.scale(1, 0.16)
  ctx.translate(0, -horizon)
  ctx.fillStyle = hg
  ctx.fillRect(0, horizon - w * 0.6, w, w * 1.2)
  ctx.restore()
  const line = ctx.createLinearGradient(0, 0, w, 0)
  line.addColorStop(0, rgba(LILAC, 0))
  line.addColorStop(0.5, rgba([255, 255, 255], Math.min(1, alpha * 1.3)))
  line.addColorStop(1, rgba(LILAC, 0))
  ctx.fillStyle = line
  ctx.fillRect(0, horizon - 0.75, w, 1.5)
}

// =============== HERO ===============
export function heroWorld() {
  const stage = $('#top > div')
  const hero = $('#top')
  if (!stage || !hero) return false
  const cv = canvasEl('dkm-world')
  const anchor = stage.querySelector(':scope > .dkm-field') || stage.querySelector(':scope > .h6-env')
  if (anchor) anchor.after(cv)
  else stage.prepend(cv)
  // filmes fénynyalábok (CSS)
  const beams = document.createElement('div')
  beams.className = 'dkm-beams'
  beams.setAttribute('aria-hidden', 'true')
  for (let i = 0; i < 3; i++) beams.append(document.createElement('i'))
  cv.after(beams)

  const mobile = () => innerWidth < 700
  const ptr = pointer(stage)
  let seed = 11
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const parts = Array.from({ length: mobile() ? 40 : 80 }, () => ({ x: (rnd() - 0.5) * 22, hgt: rnd() * 1.6, z: 1 + rnd() * 30, lime: rnd() > 0.8 }))
  let travel = 0

  run(cv, hero, (ctx, w, h, t, dt) => {
    ptr.step(t)
    const m = mobile()
    const range = hero.offsetHeight - innerHeight
    const sp = range > 0 ? clamp(-hero.getBoundingClientRect().top / range) : 0
    const speed = 0.9 + sp * 5
    travel += dt * speed
    const cx = w / 2 - ptr.x * (m ? 40 : 120)
    const horizon = h * (m ? 0.6 : 0.63) - ptr.y * 30 - sp * h * 0.1
    const f = h * 0.55
    const camH = 1 + sp * 0.8
    drawFloor(ctx, w, h, { cx, horizon, f, camH, off: travel % 1, alpha: m ? 0.75 : 0.62, wave: 34 - ((t * 9) % 42), cols: m ? 12 : 20 })

    // felénk áramló fénycsíkok a padló fölött
    ctx.lineCap = 'round'
    for (const p of parts) {
      p.z -= dt * speed * 1.8
      if (p.z < 0.6) {
        p.z = 26 + rnd() * 8
        p.x = (rnd() - 0.5) * 22
      }
      const y0 = horizon + ((camH - p.hgt) * f) / p.z
      const y1 = horizon + ((camH - p.hgt) * f) / (p.z + 0.9)
      const x0 = cx + (p.x * f) / p.z
      const x1 = cx + (p.x * f) / (p.z + 0.9)
      const a = clamp(1 - p.z / 30) * 0.9
      ctx.strokeStyle = rgba(p.lime ? LIME : LILAC, a)
      ctx.lineWidth = clamp(3.2 / p.z, 0.6, 3)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x0, y0)
      ctx.stroke()
    }

    // lebegő drótváz-testek (mélységgel, egérre és görgetésre eltérő mértékben mozdulnak)
    const s = Math.min(w, h)
    const lift = sp * h * 0.35
    const objs = m
      ? [
          [ICOSA, 0.88, 0.12, 0.1, 0.9, LIME],
          [OCTA, 0.08, 0.42, 0.06, 0.6, LIME],
        ]
      : [
          [ICOSA, 0.17, 0.2, 0.13, 1, LIME],
          [OCTA, 0.93, 0.17, 0.06, 0.6, LIME],
          [CUBE2, 0.31, 0.87, 0.065, 0.8, LIME],
        ]
    objs.forEach(([S, x, y, r, d, acc], i) => {
      const bob = Math.sin(t * 0.7 + i * 2) * 10 * d
      const px = w * x - ptr.x * 90 * d
      const py = h * y + bob - ptr.y * 50 * d - lift * d
      drawSolid(ctx, S, px, py, s * r, t * (0.22 + i * 0.07) + ptr.x * 1.4 + sp * 2, t * (0.15 + i * 0.05) + ptr.y * 1.1, 0.95, acc)
    })
  })
  return true
}

// =============== DAEKON OS hálózat ===============
const MODULES = ['Ügyfélkezelés', 'Projektkövetés', 'Pénzügyi nyilvántartás', 'Gmail-integráció', 'Üzleti automatizációk']

export function osNetwork() {
  const sec = $('#daekon-os')
  const card = sec && sec.querySelector('.os8-in')
  if (!card) return false
  const cv = canvasEl('dkm-osnet')
  const inCard = () => sec.getBoundingClientRect().right - card.getBoundingClientRect().right < 300
  let mode = inCard()
  const mount = () => {
    mode = inCard()
    cv.classList.toggle('is-in', mode)
    if (mode) card.prepend(cv)
    else sec.prepend(cv)
  }
  mount()
  card.classList.add('dkm-os6')
  sec.classList.add('dkm-os6s')
  window.addEventListener('resize', () => {
    if (inCard() !== mode) mount()
  })

  // csomópontok egy gömbön (Fibonacci-eloszlás) + szomszédsági élek
  const N = 64
  const nodes = []
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = i * Math.PI * (3 - Math.sqrt(5))
    nodes.push([Math.cos(th) * r, y, Math.sin(th) * r])
  }
  const edges = new Set()
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])])
      .filter(([j]) => j !== i)
      .sort((p, q) => p[1] - q[1])
      .slice(0, 3)
      .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`))
  })
  const E = [...edges].map((k) => k.split('-').map(Number))
  const hubs = [6, 19, 31, 44, 57]
  const packets = Array.from({ length: 16 }, (_, i) => ({ from: hubs[i % 5], k: Math.random(), sp: 0.35 + Math.random() * 0.4, lime: i % 3 !== 0 }))
  const ptr = pointer(sec)

  run(cv, sec, (ctx, w, h, t, dt) => {
    ptr.step(t)
    let cx
    let cy
    let R
    let labels = false
    if (mode) {
      cx = w * 0.74
      cy = h * 0.56
      R = Math.min(w * 0.4, h * 0.42)
    } else {
      const sr = sec.getBoundingClientRect()
      const cr = card.getBoundingClientRect()
      const free = sr.right - cr.right
      cx = cr.right - sr.left + free * 0.5
      cy = cr.top - sr.top + cr.height / 2
      R = Math.min(free * 0.36, h * 0.38)
      labels = free > 340
    }
    const sr = sec.getBoundingClientRect()
    const scrollP = clamp(1 - (sr.top + sr.height) / (innerHeight + sr.height))
    const ay = t * 0.2 + ptr.x * 1.6 + scrollP * 2.4
    const ax = 0.35 + ptr.y * 0.8
    const P = nodes.map((n) => {
      const q = rot(n, ay, ax)
      const k = 3.2 / (3.2 + q[2])
      return [cx + q[0] * R * k, cy + q[1] * R * k, q[2]]
    })
    const dep = (z) => 1 - (z + 1) / 2
    const A = mode ? 0.55 : 1

    // külső pályagyűrű
    ctx.strokeStyle = rgba(LILAC, 0.16 * A)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(cx, cy, R * 1.25, R * 0.36, -0.25 + ptr.x * 0.3, 0, Math.PI * 2)
    ctx.stroke()

    // élek
    for (const [i, j] of E) {
      const a = P[i]
      const b = P[j]
      const d = (dep(a[2]) + dep(b[2])) / 2
      ctx.strokeStyle = rgba(LILAC, (0.08 + d * 0.42) * A)
      ctx.lineWidth = 0.6 + d * 0.9
      ctx.beginPath()
      ctx.moveTo(a[0], a[1])
      ctx.lineTo(b[0], b[1])
      ctx.stroke()
    }
    // modul → mag küllők
    for (const hI of hubs) {
      const a = P[hI]
      const g = ctx.createLinearGradient(a[0], a[1], cx, cy)
      g.addColorStop(0, rgba(LIME, 0.5 * dep(a[2]) * A + 0.05))
      g.addColorStop(1, rgba(LILAC, 0.05))
      ctx.strokeStyle = g
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(a[0], a[1])
      ctx.lineTo(cx, cy)
      ctx.stroke()
    }
    // csomópontok
    P.forEach((p, i) => {
      const d = dep(p[2])
      const hub = hubs.includes(i)
      ctx.fillStyle = rgba(hub ? LIME : LILAC, (0.2 + d * 0.8) * A)
      ctx.beginPath()
      ctx.arc(p[0], p[1], (hub ? 3.5 : 1.4) + d * (hub ? 2.5 : 1.6), 0, Math.PI * 2)
      ctx.fill()
      if (hub) {
        ctx.strokeStyle = rgba(LIME, (0.15 + d * 0.5) * A)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p[0], p[1], 9 + d * 4 + Math.sin(t * 2 + i) * 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
    // áramló jelek a modulokból a mag felé
    for (const pk of packets) {
      pk.k += dt * pk.sp
      if (pk.k > 1) {
        pk.k = 0
        pk.from = hubs[(Math.random() * 5) | 0]
      }
      const a = P[pk.from]
      const e = pk.k * pk.k
      const x = a[0] + (cx - a[0]) * e
      const y = a[1] + (cy - a[1]) * e
      const tx = a[0] + (cx - a[0]) * Math.max(0, e - 0.12)
      const ty = a[1] + (cy - a[1]) * Math.max(0, e - 0.12)
      const col = pk.lime ? LIME : LILAC
      ctx.strokeStyle = rgba(col, 0.85 * A)
      ctx.lineWidth = 2.4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.fillStyle = rgba([255, 255, 255], 0.95 * A)
      ctx.beginPath()
      ctx.arc(x, y, 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
    // a DAEKON-mag (a logó lime pixelével), pulzáló gyűrűkkel
    for (let k = 0; k < 2; k++) {
      const ph = (t * 0.6 + k * 0.5) % 1
      ctx.strokeStyle = rgba(LILAC, (1 - ph) * 0.6 * A)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, R * (0.15 + ph * 0.4), 0, Math.PI * 2)
      ctx.stroke()
    }
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.45)
    glow.addColorStop(0, rgba(VIOLET, 0.55 * A))
    glow.addColorStop(1, rgba(VIOLET, 0))
    ctx.fillStyle = glow
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
    const cs = Math.max(14, R * 0.13)
    ctx.fillStyle = '#0b0b10'
    ctx.strokeStyle = rgba(LILAC, 0.95 * A)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(cx - cs, cy - cs, cs * 2, cs * 2, cs * 0.45)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = rgba(LIME, A)
    ctx.fillRect(cx + cs * 0.15, cy + cs * 0.15, cs * 0.45, cs * 0.45)

    if (labels) {
      ctx.font = '600 11px Manrope, system-ui, sans-serif'
      ctx.textBaseline = 'middle'
      hubs.forEach((hI, n) => {
        const p = P[hI]
        const d = dep(p[2])
        if (d < 0.35) return
        const tw = ctx.measureText(MODULES[n]).width
        const lx = p[0] + 12 + tw > w - 8 ? p[0] - 12 - tw : p[0] + 12
        ctx.fillStyle = rgba([245, 245, 242], (d - 0.35) * 1.4)
        ctx.fillText(MODULES[n], lx, p[1] - 12)
      })
    }
  })
  return true
}

// =============== FOOTER fénypadló ===============
export function footerFloor() {
  const stage = $('footer.ft .dkm-ft-stage')
  const ft = $('footer.ft')
  if (!stage || !ft) return false
  const cv = canvasEl('dkm-ft-cv')
  stage.prepend(cv)
  const ptr = pointer(ft)
  let travel = 0
  run(cv, ft, (ctx, w, h, t, dt) => {
    ptr.step(t)
    const fv = parseFloat(getComputedStyle(ft).getPropertyValue('--f')) || 0
    travel += dt * (0.6 + fv * 1.2)
    const horizon = h * (0.62 - fv * 0.32)
    drawFloor(ctx, w, h, {
      cx: w / 2 - ptr.x * 160,
      horizon,
      f: h * 0.32,
      camH: 1,
      off: travel % 1,
      alpha: 0.18 + fv * 0.3,
      wave: 30 - ((t * 7) % 36),
      cols: innerWidth < 700 ? 10 : 24,
      depth: 30,
    })
  })
  return true
}
