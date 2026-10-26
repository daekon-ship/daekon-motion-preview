import { m } from 'motion/react'
import { contact, legal, LIVE, nav, services } from '../data/content'
import { Reveal } from '../motion/Reveal'
import { ease } from '../motion/tokens'
import { LogoMark } from './Logo'
import './Footer.css'

const letters = 'DAEKON'.split('')

export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-glow" aria-hidden="true" />
      <div className="wrap">
        <Reveal className="ft-close">
          <p className="ft-line">A következő projekted itt kezdődik.</p>
          <div className="ft-ctas">
            <a href="#ajanlat" className="btn btn--primary">
              Kérj ajánlatot <span className="arrow">→</span>
            </a>
            <a href={`mailto:${contact.email}`} className="btn">
              {contact.email}
            </a>
          </div>
        </Reveal>

        <div className="ft-cols">
          <div>
            <p className="ft-h">Oldal</p>
            <ul>
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
              <li>
                <a href="#gyik">Gyakori kérdések</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="ft-h">Szolgáltatások</p>
            <ul>
              {services
                .filter((s) => s.more)
                .map((s) => (
                  <li key={s.id}>
                    <a href={s.more!.href}>{s.more!.label}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <p className="ft-h">Kapcsolat</p>
            <ul>
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <a href={contact.phoneHref}>{contact.phone}</a>
              </li>
              <li>
                <a href={contact.facebook} target="_blank" rel="noopener">
                  Facebook ↗
                </a>
              </li>
              <li className="ft-muted">{contact.location}</li>
            </ul>
          </div>
        </div>

        <m.div className="ft-mark" aria-hidden="true" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.5 }} transition={{ staggerChildren: 0.05 }}>
          <m.span className="ft-mark-logo" variants={{ hide: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} transition={{ duration: 0.6, ease: ease.out }}>
            <LogoMark size={64} />
          </m.span>
          <span className="ft-word">
            {letters.map((l, i) => (
              <m.span key={i} variants={{ hide: { opacity: 0, y: '40%' }, show: { opacity: 1, y: '0%' } }} transition={{ duration: 0.7, ease: ease.out }}>
                {l}
              </m.span>
            ))}
          </span>
        </m.div>

        <div className="ft-legal">
          <p>© 2026 DAEKON · Bartalos Roland</p>
          <ul>
            {legal.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <p className="ft-preview">
          Ez a DAEKON V2 látványterve, nem az éles oldal. Az éles weboldal: <a href={LIVE}>daekon.hu</a>
        </p>
      </div>
    </footer>
  )
}
