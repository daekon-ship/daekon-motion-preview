// Egységes mozgásnyelv: minden belépés ugyanazt a görbét és ritmust használja.
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  io: [0.65, 0, 0.35, 1] as const,
}

export const dur = {
  fast: 0.18,
  ui: 0.32,
  enter: 0.7,
  hero: 0.9,
}

export const stagger = {
  words: 0.055,
  items: 0.06,
}

export const spring = {
  soft: { type: 'spring', stiffness: 160, damping: 26, mass: 0.6 } as const,
  snappy: { type: 'spring', stiffness: 420, damping: 34 } as const,
}

export const viewportOnce = { once: true, amount: 0.2 } as const
