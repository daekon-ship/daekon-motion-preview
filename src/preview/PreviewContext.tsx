import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Csak a látványtervhez: színtéma és animációs szint összehasonlítása. Szerveroldali beállítás nincs.
export type Theme = 'blue' | 'violet' | 'ultra'
export type MotionLevel = 'full' | 'calm' | 'off'

type Ctx = {
  theme: Theme
  setTheme: (t: Theme) => void
  motionLevel: MotionLevel
  setMotionLevel: (m: MotionLevel) => void
}

const PreviewCtx = createContext<Ctx | null>(null)

const THEMES: Theme[] = ['blue', 'violet', 'ultra']
const LEVELS: MotionLevel[] = ['full', 'calm', 'off']

function read<T extends string>(key: string, allowed: T[], fallback: T): T {
  try {
    const fromUrl = new URLSearchParams(location.search).get(key)
    if (fromUrl && allowed.includes(fromUrl as T)) return fromUrl as T
    const v = localStorage.getItem(`daekon-v2-${key}`)
    if (v && allowed.includes(v as T)) return v as T
  } catch {
    /* privát mód: alapértelmezés */
  }
  return fallback
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(`daekon-v2-${key}`, value)
  } catch {
    /* nem kritikus */
  }
}

export function PreviewProvider({ children }: { children: ReactNode }) {
  // Előre renderelt HTML: az első render mindig az alapértékekkel fut (egyezik a szerveroldali kimenettel),
  // a mentett választás hidratálás után töltődik be. A téma az index.html szkriptjével már az első festéskor érvényes.
  const [theme, setThemeState] = useState<Theme>('violet')
  const [motionLevel, setLevelState] = useState<MotionLevel>('full')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- egyszeri betöltés a böngésző tárolójából hidratálás után
    setThemeState(read('theme', THEMES, 'violet'))
    setLevelState(read('motion', LEVELS, 'full'))
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) document.documentElement.dataset.theme = theme
  }, [theme, ready])

  useEffect(() => {
    if (ready) document.documentElement.dataset.motion = motionLevel
  }, [motionLevel, ready])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    write('theme', t)
  }
  const setMotionLevel = (m: MotionLevel) => {
    setLevelState(m)
    write('motion', m)
  }

  return <PreviewCtx.Provider value={{ theme, setTheme, motionLevel, setMotionLevel }}>{children}</PreviewCtx.Provider>
}

export function usePreview() {
  const ctx = useContext(PreviewCtx)
  if (!ctx) throw new Error('usePreview: PreviewProvider hiányzik')
  return ctx
}
