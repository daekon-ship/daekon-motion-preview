import { LIVE } from '../data/content'
import { Reveal } from '../motion/Reveal'

// A daekon.hu „Saját rendszerem” szakasza, változatlan tartalommal.
export function OsBand() {
  return (
    <section className="section os-band" aria-labelledby="os-title">
      <div className="wrap">
        <Reveal className="os-card">
          <p className="eyebrow">Saját rendszerem</p>
          <h2 id="os-title">DAEKON OS – egyedi vállalkozásirányító rendszer</h2>
          <p>
            A DAEKON saját fejlesztésű, belső rendszere ügyfélkezelést, projektkövetést, pénzügyi nyilvántartást, Gmail-integrációt és üzleti automatizációkat fog össze. A Gmail-kapcsolat a Google hivatalos API-ján, a tulajdonos hozzájárulásával működik.
          </p>
          <a className="link-arrow" href={`${LIVE}/felhasznalasi-feltetelek.html`}>
            Felhasználási feltételek
          </a>
        </Reveal>
      </div>
    </section>
  )
}
