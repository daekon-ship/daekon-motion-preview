import { m, type HTMLMotionProps } from 'motion/react'
import { dur, ease, viewportOnce } from './tokens'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number; as?: 'div' | 'li' | 'article' }

/** Visszafogott belépés görgetéskor: egyszer fut le, utána a tartalom stabilan áll. */
export function Reveal({ delay = 0, y = 22, as = 'div', children, ...rest }: Props) {
  const Comp = as === 'li' ? m.li : as === 'article' ? m.article : m.div
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: dur.enter, ease: ease.out, delay }}
      {...(rest as object)}
    >
      {children}
    </Comp>
  )
}
