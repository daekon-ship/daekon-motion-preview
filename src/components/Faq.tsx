import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { faq } from '../data/content'
import { Reveal } from '../motion/Reveal'
import { dur, ease } from '../motion/tokens'
import './Faq.css'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="gyik" className="section faq" aria-labelledby="gyik-title">
      <div className="wrap faq-layout">
        <Reveal className="section-head">
          <p className="eyebrow">Gyakori kérdések</p>
          <h2 id="gyik-title">Amit az első egyeztetés előtt érdemes tudni</h2>
        </Reveal>
        <Reveal className="faq-list">
          {faq.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: dur.ui, ease: ease.out }}
                    >
                      <p>{f.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
