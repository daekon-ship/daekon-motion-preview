import type { CSSProperties } from 'react'

type Props = {
  text: string
  className?: string
  /** másodperc */
  delay?: number
  /** szavak, amelyek a márka-színátmenetet kapják */
  highlight?: string[]
}

/**
 * Szavanként felúszó cím. CSS-animáció (nem Motion), mert az előre renderelt HTML-ben
 * már az első festéssel indul, a JavaScript betöltését nem várja meg.
 * A képernyőolvasó a teljes mondatot egyszer kapja meg (sr-only), az animált szavak aria-hidden-ek.
 */
export function SplitWords({ text, className, delay = 0, highlight = [] }: Props) {
  const words = text.split(' ')
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="split-word">
              <span
                className={highlight.includes(w) ? 'split-inner grad-text' : 'split-inner'}
                style={{ '--d': `${delay + i * 0.055}s` } as CSSProperties}
              >
                {w}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </span>
  )
}
