import { m } from 'motion/react'
import { contact, formatDate, reviewSummary, reviews } from '../data/content'
import { Reveal } from '../motion/Reveal'
import { dur, ease } from '../motion/tokens'
import './Reviews.css'

// Teljes rács: minden vélemény egyszerre, teljes szöveggel. Nincs karusszel, lapozás vagy vízszintes görgetés.
export function Reviews() {
  return (
    <section id="velemenyek" className="section reviews" aria-labelledby="vel-title">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">Vélemények</p>
          <h2 id="vel-title">Akik már engem választottak.</h2>
          <p>Hiteles, forrással jelölt vélemények a közös munkáról – szó szerint, ahogy a Facebookon megjelentek.</p>
        </Reveal>

        <ul className="rv-grid">
          {reviews.map((r, i) => (
            <m.li
              key={r.name}
              className="rv-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: dur.enter, ease: ease.out, delay: (i % 3) * 0.05 }}
            >
              <div className="rv-top">
                <span className="rv-src">
                  <FbIcon /> Facebook
                </span>
                <span className="rv-rec">Ajánlja</span>
              </div>
              <blockquote>
                <p>{r.text}</p>
              </blockquote>
              <div className="rv-foot">
                <div>
                  <p className="rv-name">{r.name}</p>
                  <p className="rv-date">
                    <time dateTime={r.date}>{formatDate(r.date, r.approx)}</time>
                  </p>
                </div>
                <a className="rv-link" href={r.url} target="_blank" rel="noopener">
                  Eredeti értékelés ↗<span className="sr-only"> – {r.name} (új lapon nyílik)</span>
                </a>
              </div>
            </m.li>
          ))}
        </ul>

        <Reveal className="rv-summary">
          <p>
            <strong>{reviewSummary.text}</strong> (ellenőrizve: {reviewSummary.checked}). Itt csak valódi, ellenőrizhető értékelések jelennek meg, mindig a forrásuk megjelölésével.
          </p>
          <div className="rv-actions">
            <a className="btn btn--sm" href={reviewSummary.writeUrl} target="_blank" rel="noopener">
              Ajánlás írása Facebookon ↗
            </a>
            <a className="link-arrow" href={`mailto:${contact.email}?subject=${encodeURIComponent('Vélemény a DAEKON munkájáról')}`}>
              Vélemény küldése e-mailben
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  )
}
