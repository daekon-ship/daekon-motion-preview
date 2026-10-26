import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, m, useMotionValue, useSpring, useTransform } from 'motion/react'
import { projects, type Project } from '../data/content'
import { useDialog } from '../hooks/useDialog'
import { useRichEffects } from '../hooks/useMedia'
import { Reveal } from '../motion/Reveal'
import { dur, ease, spring } from '../motion/tokens'
import './Projects.css'

const img = (file: string) => `${import.meta.env.BASE_URL}img/ref/${file}`

// Aszimmetrikus, de vágás nélküli rács: minden kép 16:10, csak a szélesség változik (12 hasábos sorok: 7+5, 5+7, 4+4+4, 6+6)
const spans = [7, 5, 5, 7, 4, 4, 4, 6, 6]

export function Projects() {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const close = useCallback(() => setOpenSlug(null), [])
  const current = projects.find((p) => p.slug === openSlug) ?? null

  return (
    <section id="munkak" className="section projects" aria-labelledby="munkak-title">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">Munkáim · {projects.length} élő projekt</p>
          <h2 id="munkak-title">Éles rendszerek, valódi ügyfeleknek.</h2>
          <p>Ügyfélmegbízásban készült, élesben futó weboldalak és rendszerek. Nyisd meg bármelyiket a részletekért, vagy nézd meg működés közben.</p>
        </Reveal>

        <ul className="pj-grid">
          {projects.map((p, i) => (
            <Reveal as="li" key={p.slug} className="pj-cell" style={{ ['--span' as string]: spans[i] ?? 6 }} delay={(i % 3) * 0.06}>
              <ProjectCard p={p} index={i} featured={i === 0} onOpen={() => setOpenSlug(p.slug)} />
            </Reveal>
          ))}
        </ul>

        <Reveal className="pj-foot">
          {projects[0].caseStudy && (
            <a href={projects[0].caseStudy} className="link-arrow">
              A KIOSZ Pizza rendelési rendszerének esettanulmánya ↗
            </a>
          )}
          <a href="#ajanlat" className="btn">
            Hasonló rendszert szeretnél? Kérj ajánlatot <span className="arrow">→</span>
          </a>
        </Reveal>
      </div>

      <AnimatePresence>{current && <ProjectDialog key={current.slug} p={current} onClose={close} />}</AnimatePresence>
    </section>
  )
}

function ProjectCard({ p, index, featured, onOpen }: { p: Project; index: number; featured: boolean; onOpen: () => void }) {
  const rich = useRichEffects()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, spring.soft)
  const sry = useSpring(ry, spring.soft)
  const shine = useTransform([srx, sry], ([x, y]: number[]) => `radial-gradient(500px circle at ${50 + (y as number) * 8}% ${50 - (x as number) * 8}%, rgb(255 255 255 / 0.10), transparent 45%)`)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!rich) return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 6)
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -6)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <article className={`pj-card${featured ? ' is-featured' : ''}`}>
      <m.div className="pj-tilt" onPointerMove={onMove} onPointerLeave={reset} style={rich ? { rotateX: srx, rotateY: sry } : undefined}>
        <button type="button" className="pj-open" onClick={onOpen} aria-haspopup="dialog" aria-label={`${p.name} – részletek`}>
          <m.div className="pj-media" layoutId={`pj-media-${p.slug}`} transition={{ duration: 0.5, ease: ease.io }}>
            <img
              src={img(`${p.slug}-d-sm.webp`)}
              srcSet={`${img(`${p.slug}-d-sm.webp`)} 720w, ${img(`${p.slug}-d.webp`)} 1280w`}
              sizes="(min-width: 1100px) 58vw, (min-width: 700px) 50vw, calc(100vw - 32px)"
              width={720}
              height={450}
              alt={p.alt}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
            />
            {rich && <m.div className="pj-shine" style={{ background: shine }} aria-hidden="true" />}
            <span className="pj-overlay" aria-hidden="true">
              <span>Részletek</span>
            </span>
          </m.div>
        </button>
      </m.div>
      <div className="pj-meta">
        <div className="pj-meta-top">
          <span className="pj-label">{p.label}</span>
          {featured && <span className="pj-badge">Kiemelt</span>}
        </div>
        <h3 className="pj-name">{p.name}</h3>
        <p className="pj-short">{p.short}</p>
        <a className="pj-link" href={p.href} target="_blank" rel="noopener">
          {p.url} <span aria-hidden="true">↗</span>
          <span className="sr-only"> (új lapon nyílik)</span>
        </a>
      </div>
    </article>
  )
}

function ProjectDialog({ p, onClose }: { p: Project; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDialog(true, onClose, panelRef)

  return (
    <m.div className="pjd-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.ui }}>
      <div className="pjd-backdrop" onClick={onClose} aria-hidden="true" />
      <m.div
        ref={panelRef}
        className="pjd"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`pjd-${p.slug}`}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: dur.ui, ease: ease.out }}
      >
        <button type="button" className="pjd-close" onClick={onClose} aria-label="Bezárás" data-autofocus>
          <span aria-hidden="true">×</span>
        </button>
        <div className="pjd-visuals">
          <m.div className="pjd-desktop" layoutId={`pj-media-${p.slug}`} transition={{ duration: 0.5, ease: ease.io }}>
            <img src={img(`${p.slug}-d.webp`)} width={1280} height={800} alt={p.alt} />
          </m.div>
          <m.div className="pjd-phone" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: dur.enter, ease: ease.out }}>
            <img src={img(`${p.slug}-m.webp`)} width={360} height={779} alt={`${p.name} mobilnézetben`} loading="lazy" />
          </m.div>
        </div>
        <div className="pjd-body">
          <span className="pj-label">{p.label}</span>
          <h3 id={`pjd-${p.slug}`}>{p.name}</h3>
          <p>{p.desc}</p>
          {p.note && <p className="pjd-note">{p.note}</p>}
          <ul className="pjd-tags" aria-label="Megvalósított funkciók">
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="pjd-actions">
            <a className="btn btn--primary" href={p.href} target="_blank" rel="noopener">
              {p.url} megnyitása <span aria-hidden="true">↗</span>
            </a>
            {p.caseStudy && (
              <a className="btn" href={p.caseStudy}>
                Esettanulmány
              </a>
            )}
            <a
              className="link-arrow"
              href="#ajanlat"
              onClick={(e) => {
                e.preventDefault()
                onClose()
                setTimeout(() => {
                  document.getElementById('ajanlat')?.scrollIntoView()
                  history.pushState(null, '', '#ajanlat')
                }, 60)
              }}
            >
              Hasonlót szeretnék
            </a>
          </div>
        </div>
      </m.div>
    </m.div>
  )
}
