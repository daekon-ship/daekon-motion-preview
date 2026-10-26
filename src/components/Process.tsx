import { m } from 'motion/react'
import { steps } from '../data/content'
import { Reveal } from '../motion/Reveal'
import { dur, ease, viewportOnce } from '../motion/tokens'
import './Process.css'

export function Process() {
  return (
    <section id="folyamat" className="section process" aria-labelledby="folyamat-title">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">Folyamat</p>
          <h2 id="folyamat-title">Így dolgozom</h2>
        </Reveal>
        <m.ol className="pr-list" initial="hide" whileInView="show" viewport={viewportOnce} transition={{ staggerChildren: 0.12 }}>
          <m.span className="pr-line" aria-hidden="true" variants={{ hide: { scaleX: 0 }, show: { scaleX: 1 } }} transition={{ duration: 1.2, ease: ease.io }} />
          {steps.map((s) => (
            <m.li key={s.n} variants={{ hide: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ duration: dur.enter, ease: ease.out }}>
              <span className="pr-dot" aria-hidden="true" />
              <span className="pr-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  )
}
