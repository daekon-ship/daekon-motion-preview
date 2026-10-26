import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { dur, ease } from '../motion/tokens'
import { usePreview, type MotionLevel, type Theme } from './PreviewContext'
import './PreviewBar.css'

const themes: { id: Theme; label: string; sw: string }[] = [
  { id: 'blue', label: 'DAEKON Blue', sw: 'linear-gradient(135deg,#4d7cff,#8fd3ff)' },
  { id: 'violet', label: 'DAEKON Violet', sw: 'linear-gradient(135deg,#4d8dff,#8b6bff,#c48bff)' },
  { id: 'ultra', label: 'Ultra Dark', sw: 'linear-gradient(135deg,#1a1a22,#9aa7ff)' },
]

const levels: { id: MotionLevel; label: string }[] = [
  { id: 'full', label: 'Teljes' },
  { id: 'calm', label: 'Visszafogott' },
  { id: 'off', label: 'Minimális' },
]

/** Csak a látványtervhez: téma- és animációösszehasonlító. Az éles verzióba nem kerül be. */
export function PreviewBar() {
  const { theme, setTheme, motionLevel, setMotionLevel } = usePreview()
  const [open, setOpen] = useState(false)

  return (
    <div className="pv">
      <AnimatePresence>
        {open && (
          <m.div
            id="pv-panel"
            className="pv-panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: dur.fast, ease: ease.out }}
          >
            <p className="pv-title">V2 látványterv – összehasonlítás</p>
            <fieldset>
              <legend>Színtéma</legend>
              <div className="pv-opts">
                {themes.map((t) => (
                  <button key={t.id} type="button" aria-pressed={theme === t.id} onClick={() => setTheme(t.id)}>
                    <span className="pv-sw" style={{ background: t.sw }} aria-hidden="true" />
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Animációk</legend>
              <div className="pv-opts">
                {levels.map((l) => (
                  <button key={l.id} type="button" aria-pressed={motionLevel === l.id} onClick={() => setMotionLevel(l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="pv-note">Nem éles oldal · nincs adatküldés · a választás csak ebben a böngészőben marad meg</p>
          </m.div>
        )}
      </AnimatePresence>
      <button type="button" className="pv-toggle" aria-expanded={open} aria-controls="pv-panel" onClick={() => setOpen((v) => !v)}>
        <span className="pv-dot" aria-hidden="true" />
        V2 látványterv
        <span className="pv-sw pv-sw--current" style={{ background: themes.find((t) => t.id === theme)?.sw }} aria-hidden="true" />
      </button>
    </div>
  )
}
