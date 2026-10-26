import { useEffect, type RefObject } from 'react'

/** Modális viselkedés: görgetészár, Escape, fókuszcsapda, bezáráskor fókusz vissza a nyitó elemre. */
export function useDialog(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const body = document.body
    const sbw = window.innerWidth - document.documentElement.clientWidth
    body.style.paddingRight = sbw ? `${sbw}px` : ''
    body.classList.add('is-locked')
    const raf = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[data-autofocus], button, a[href]')?.focus({ preventScroll: true }))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const f = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select')]
      if (!f.length) return
      const i = f.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        f[f.length - 1].focus()
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault()
        f[0].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      body.classList.remove('is-locked')
      body.style.paddingRight = ''
      opener?.focus({ preventScroll: true })
    }
  }, [open, onClose, panelRef])
}
