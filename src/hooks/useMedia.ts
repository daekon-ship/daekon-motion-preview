import { useSyncExternalStore } from 'react'
import { usePreview } from '../preview/PreviewContext'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}

// Hidratálás-biztos: a szerveroldali pillanatkép (false) egyezik az előre renderelt HTML-lel,
// a valós érték a hidratálás után érvényesül (a motion `useReducedMotion` ezt nem garantálja).
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Drága, folyamatos effektek (tilt, egérkövető fény, parallax) csak egérrel, asztali szélességen és teljes animációs szinten. */
export function useRichEffects() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 900px)')
  const reduced = usePrefersReducedMotion()
  const { motionLevel } = usePreview()
  return fine && !reduced && motionLevel === 'full'
}

/** Görgetéshez kötött átalakítások: mobilon is mehetnek (olcsó transform), de csökkentett mozgásnál nem. */
export function useScrollEffects() {
  const reduced = usePrefersReducedMotion()
  const { motionLevel } = usePreview()
  return !reduced && motionLevel === 'full'
}
