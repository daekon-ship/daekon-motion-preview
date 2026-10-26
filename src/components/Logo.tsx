import { m } from 'motion/react'
import { dur, ease } from '../motion/tokens'

/** A DAEKON-jel (D-forma + a négyzet „pixel”) – az élő oldal favicon.svg geometriája alapján. */
export function LogoMark({ size = 28, draw = false }: { size?: number; draw?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <m.path
        d="M15 17H31A14 14 0 0 1 45 31V33A14 14 0 0 1 31 47H15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={5.5}
        initial={draw ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: ease.io }}
      />
      <m.rect
        x={45}
        y={42}
        width={6}
        height={6}
        fill="var(--pixel)"
        initial={draw ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: dur.ui, delay: draw ? 1 : 0, ease: ease.out }}
        style={{ transformOrigin: '48px 45px' }}
      />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark size={30} />
      <span className="logo-word">DAEKON</span>
    </span>
  )
}
