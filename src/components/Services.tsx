import type { PointerEvent } from 'react'
import { m } from 'motion/react'
import { services } from '../data/content'
import { useRichEffects } from '../hooks/useMedia'
import { Reveal } from '../motion/Reveal'
import { dur, ease, stagger, viewportOnce } from '../motion/tokens'
import { pickService } from './quoteBus'
import './Services.css'

export function Services() {
  const rich = useRichEffects()

  // a szegélyfény a kurzort követi – CSS-változóval, újrarenderelés nélkül
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!rich) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section id="szolgaltatasok" className="section services" aria-labelledby="szolg-title">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">Szolgáltatások</p>
          <h2 id="szolg-title">A weboldaltól a saját rendszerig.</h2>
          <p>Bemutatkozó oldaltól a rendelési, foglalási és adminrendszerig – egy kézben, egy kódbázison.</p>
        </Reveal>

        <m.ul className="sv-grid" initial="hide" whileInView="show" viewport={viewportOnce} transition={{ staggerChildren: stagger.items }}>
          {services.map((s) => (
            <m.li
              key={s.id}
              className={`sv-card${rich ? ' is-rich' : ''}`}
              onPointerMove={onMove}
              variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: dur.enter, ease: ease.out }}
            >
              <span className="sv-no">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <div className="sv-actions">
                <a href="#ajanlat" className="sv-cta" onClick={() => pickService(s.title)}>
                  Ajánlatot kérek <span className="arrow" aria-hidden="true">→</span>
                  <span className="sr-only"> – {s.title}</span>
                </a>
                {s.more && (
                  <a href={s.more.href} className="sv-more">
                    {s.more.label}
                    <span className="sr-only"> (daekon.hu)</span>
                  </a>
                )}
              </div>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}
