import { useRef } from 'react'
import { m, useScroll, useSpring, useTransform } from 'motion/react'
import { contact, story } from '../data/content'
import { useScrollEffects } from '../hooks/useMedia'
import { Reveal } from '../motion/Reveal'
import { spring } from '../motion/tokens'
import './Story.css'

export function Story() {
  const lineRef = useRef<HTMLDivElement>(null)
  const scrollFx = useScrollEffects()
  // a vonal és a „pixel” a görgetéssel együtt halad végig az idővonalon
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ['start 70%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, spring.soft)
  const pixelTop = useTransform(progress, (v) => `${Math.min(100, Math.max(0, v * 100))}%`)

  return (
    <section id="tortenet" className="section story" aria-labelledby="tortenet-title">
      <div className="wrap st-layout">
        <div className="st-intro">
          <Reveal className="section-head">
            <p className="eyebrow">Rólam · A DAEKON története</p>
            <h2 id="tortenet-title">A DAEKON mögött egyetlen fejlesztő áll.</h2>
            <p>
              Bartalos Roland vagyok. A tervezést, a fejlesztést és az élesítést személyesen végzem, így nálam közvetlenül azzal egyeztetsz, aki a munkát el is végzi.
            </p>
          </Reveal>
          <Reveal className="st-card" delay={0.1}>
            <span className="st-card-k">Helyszín</span>
            <span>{contact.location}</span>
            <span className="st-card-k">Egy kézben</span>
            <span>Egyeztetés · Tervezés · Fejlesztés · Élesítés</span>
          </Reveal>
        </div>

        <div className="st-line" ref={lineRef}>
          <span className="st-track" aria-hidden="true">
            <m.span className="st-fill" style={scrollFx ? { scaleY: progress } : { scaleY: 1 }} />
            {scrollFx && <m.span className="st-pixel" style={{ top: pixelTop }} />}
          </span>
          <ol className="st-list">
          {story.map((s) => (
            <Reveal as="li" key={s.mark} className="st-item" y={30}>
              <span className="st-mark">{s.mark}</span>
              <h3>{s.title}</h3>
              {s.body.map((b) => (
                <p key={b.slice(0, 24)}>{b}</p>
              ))}
              {s.link && (
                <a className="link-arrow" href={s.link.href} target="_blank" rel="noopener">
                  {s.link.label} ↗<span className="sr-only"> (új lapon nyílik)</span>
                </a>
              )}
            </Reveal>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
