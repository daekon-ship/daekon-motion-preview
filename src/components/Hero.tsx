import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { m, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useRichEffects, useScrollEffects } from '../hooks/useMedia'
import { SplitWords } from '../motion/SplitWords'
import { dur, ease, spring } from '../motion/tokens'
import { LogoMark } from './Logo'
import './Hero.css'

const buildLines = [
  { t: 'látványterv', k: 'terv' },
  { t: 'weboldal · webalkalmazás', k: 'web' },
  { t: 'rendelés · foglalás', k: 'flow' },
  { t: 'adminfelület · automatizálás', k: 'admin' },
  { t: 'élesítés · karbantartás', k: 'live' },
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const rich = useRichEffects()
  const scrollFx = useScrollEffects()

  // egérkövető mélység (csak asztalon, egérrel)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, spring.soft)
  const sy = useSpring(py, spring.soft)
  const glowX = useTransform(sx, (v) => v * 60)
  const glowY = useTransform(sy, (v) => v * 40)
  const rotY = useTransform(sx, (v) => v * 7)
  const rotX = useTransform(sy, (v) => v * -6)
  const backX = useTransform(sx, (v) => v * -18)
  const backY = useTransform(sy, (v) => v * -12)

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!rich || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }

  // görgetéshez kötött kilépés a következő szekció felé
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const contentO = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const visualS = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 140])

  return (
    <section id="top" ref={ref} className="hero" onPointerMove={onMove} onPointerLeave={() => (px.set(0), py.set(0))}>
      <m.div className="hero-bg" aria-hidden="true" style={scrollFx ? { y: bgY } : undefined}>
        <div className="hero-grid" />
        <m.div className="hero-glow hero-glow--a" style={rich ? { x: glowX, y: glowY } : undefined} />
        <m.div className="hero-glow hero-glow--b" style={rich ? { x: backX, y: backY } : undefined} />
      </m.div>

      <div className="wrap hero-in">
        <m.div className="hero-copy" style={scrollFx ? { y: contentY, opacity: contentO } : undefined}>
          <p className="eyebrow fade-up" style={{ '--d': '0.05s' } as CSSProperties}>
            Weboldalak · Webalkalmazások · Egyedi rendszerek
          </p>

          <h1 className="hero-title">
            <SplitWords text="Egyedi szoftverfejlesztés a cégednek." highlight={['szoftverfejlesztés']} delay={0.15} />
          </h1>

          {/* a bevezető azonnal látszik (LCP-elem), csak a cím animálódik */}
          <p className="hero-lead">
            Weboldalakat, egyedi szoftvereket és komplett digitális rendszereket fejlesztek vállalkozásoknak: rendelés, foglalás, adminfelület, automatizálás. Közvetlenül velem dolgozol, az ötlettől az élesítésig.
          </p>

          <div className="hero-ctas fade-up" style={{ '--d': '0.35s' } as CSSProperties}>
            <a href="#ajanlat" className="btn btn--primary">
              Ingyenes látványtervet kérek <span className="arrow">→</span>
            </a>
            <a href="#munkak" className="btn">
              Referenciák megtekintése
            </a>
            <a href="#kapcsolat" className="link-arrow hero-contact">
              Kapcsolatfelvétel
            </a>
          </div>
          <p className="hero-note fade-up" style={{ '--d': '0.5s' } as CSSProperties}>
            Egyedi látványterv a vállalkozásodnak: ingyen, kötelezettség nélkül.
          </p>
        </m.div>

        <m.div className="hero-visual" aria-hidden="true" style={scrollFx ? { y: visualY, scale: visualS } : undefined}>
          <m.div className="hv-stage" style={rich ? { rotateX: rotX, rotateY: rotY } : undefined}>
            <div className="hv-mark">
              <LogoMark size={340} draw />
            </div>
            <m.div className="hv-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur.hero, ease: ease.out, delay: 0.35 }}>
              <div className="hv-bar">
                <span />
                <span />
                <span />
                <em>daekon · build</em>
              </div>
              <div className="hv-body">
                <p className="hv-cmd">
                  <span className="hv-prompt">$</span> új projekt: a te vállalkozásod
                </p>
                <m.ul initial="hide" animate="show" transition={{ staggerChildren: 0.16, delayChildren: 0.9 }}>
                  {buildLines.map((l) => (
                    <m.li key={l.k} variants={{ hide: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }} transition={{ duration: dur.ui, ease: ease.out }}>
                      <span className="hv-ok">✓</span> {l.t}
                    </m.li>
                  ))}
                </m.ul>
                <p className="hv-cursor">
                  <span className="hv-prompt">$</span> <span className="hv-caret" />
                </p>
              </div>
            </m.div>
          </m.div>
        </m.div>
      </div>

      <m.a href="#munkak" className="hero-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} aria-label="Tovább a munkáimhoz">
        <span>Projektek</span>
        <span className="hero-scroll-line" />
      </m.a>
    </section>
  )
}
