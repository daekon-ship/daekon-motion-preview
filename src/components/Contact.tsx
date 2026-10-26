import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { contact, LIVE, services } from '../data/content'
import { Reveal } from '../motion/Reveal'
import { dur, ease } from '../motion/tokens'
import { onPickService } from './quoteBus'
import './Contact.css'

const options = ['Ingyenes látványterv', ...services.map((s) => s.title)]

type Errors = Partial<Record<'name' | 'reach' | 'need', string>>

export function Contact() {
  return (
    <section id="kapcsolat" className="section contact" aria-labelledby="kapcs-title">
      <div className="wrap ct-layout">
        <div className="ct-info">
          <Reveal className="section-head">
            <p className="eyebrow">Kapcsolat</p>
            <h2 id="kapcs-title">Megvalósítom az ötleted.</h2>
            <p>
              Nálam közvetlenül a fejlesztővel beszélsz: írj vagy hívj, általában egy munkanapon belül válaszolok, és egy rövid egyeztetés után írásos javaslatot kapsz a megoldásról, a költségekről és az ütemezésről.
            </p>
          </Reveal>
          <Reveal className="ct-channels" delay={0.08}>
            <a href={`mailto:${contact.email}`} className="ct-channel">
              <span className="ct-k">E-mail</span>
              <span className="ct-v">{contact.email}</span>
            </a>
            <a href={contact.phoneHref} className="ct-channel">
              <span className="ct-k">Telefon</span>
              <span className="ct-v">{contact.phone}</span>
            </a>
          </Reveal>
        </div>
        <QuoteDemo />
      </div>
    </section>
  )
}

function QuoteDemo() {
  const uid = useId()
  const [need, setNeed] = useState<string[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [sent, setSent] = useState<{ name: string; reach: string; msg: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // a „kész” nézet a kilépő animáció UTÁN jelenik meg: ekkor kap fókuszt, és a doboz a nézetbe kerül
  const onDoneShown = (el: HTMLDivElement | null) => {
    if (!el) return
    el.focus({ preventScroll: true })
    const box = boxRef.current?.getBoundingClientRect()
    if (box && (box.top < 0 || box.top > innerHeight * 0.6)) boxRef.current?.scrollIntoView({ block: 'start' })
  }

  useEffect(() => onPickService((t) => setNeed((n) => (n.includes(t) ? n : [...n, t]))), [])

  // hero „Ingyenes látványterv” gombjáról érkezve a látványterv legyen bejelölve
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href="#ajanlat"]')
      if (a?.textContent?.includes('látványterv')) setNeed((n) => (n.includes(options[0]) ? n : [options[0], ...n]))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const toggle = (o: string) => setNeed((n) => (n.includes(o) ? n.filter((x) => x !== o) : [...n, o]))

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    const reach = String(fd.get('reach') ?? '').trim()
    const msg = String(fd.get('msg') ?? '').trim()
    const errs: Errors = {}
    if (name.length < 2) errs.name = 'Add meg a neved.'
    const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(reach)
    const isPhone = /^[+\d][\d\s/-]{7,}$/.test(reach)
    if (!isMail && !isPhone) errs.reach = 'Adj meg egy érvényes e-mail-címet vagy telefonszámot.'
    if (!need.length) errs.need = 'Jelölj meg legalább egy lehetőséget.'
    setErrors(errs)
    if (Object.keys(errs).length) {
      const firstKey = (['name', 'reach'] as const).find((k) => errs[k])
      if (firstKey) formRef.current?.querySelector<HTMLInputElement>(`[name="${firstKey}"]`)?.focus()
      else formRef.current?.querySelector<HTMLButtonElement>('.qd-chip')?.focus()
      return
    }
    // BEMUTATÓ: nincs hálózati kérés, nem megy ki e-mail
    setState('sending')
    setTimeout(() => {
      setSent({ name, reach, msg })
      setState('done')
    }, 900)
  }

  const mailto = sent
    ? `mailto:${contact.email}?subject=${encodeURIComponent('Ajánlatkérés – ' + need.join(', '))}&body=${encodeURIComponent(`Név: ${sent.name}\nElérhetőség: ${sent.reach}\nAmire szükségem lehet: ${need.join(', ')}\n\n${sent.msg}`)}`
    : ''

  return (
    <Reveal className="qd" id="ajanlat" delay={0.1} ref={boxRef}>
      <div className="qd-demo" role="note">
        <strong>Bemutató űrlap.</strong> Ebben a látványtervben az űrlap nem küld el semmit. Valódi ajánlatkéréshez írj a <a href={`mailto:${contact.email}`}>{contact.email}</a> címre, vagy használd a{' '}
        <a href={`${LIVE}/#ssr-ai`}>daekon.hu</a> ajánlatkérőjét.
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {state !== 'done' ? (
          <m.form
            key="form"
            ref={formRef}
            className="qd-form"
            noValidate
            onSubmit={submit}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: dur.ui, ease: ease.out }}
            aria-labelledby={`${uid}-t`}
          >
            <h3 id={`${uid}-t`}>Kérj ajánlatot</h3>
            <p className="qd-sub">Jelöld meg, amire szükséged lehet; elég nagy vonalakban. Az ajánlat díjmentes és kötelezettségmentes.</p>

            <fieldset className="qd-need" aria-describedby={errors.need ? `${uid}-need-e` : undefined}>
              <legend>Mire van szükséged?</legend>
              <div className="qd-chips">
                {options.map((o) => (
                  <button key={o} type="button" className="qd-chip" aria-pressed={need.includes(o)} onClick={() => toggle(o)}>
                    {o}
                  </button>
                ))}
              </div>
              {errors.need && (
                <p className="qd-err" id={`${uid}-need-e`}>
                  {errors.need}
                </p>
              )}
            </fieldset>

            <div className="qd-row">
              <Field id={`${uid}-name`} name="name" label="Neved" autoComplete="name" error={errors.name} />
              <Field id={`${uid}-reach`} name="reach" label="E-mail vagy telefon" autoComplete="email" inputMode="email" error={errors.reach} />
            </div>
            <div className="qd-field">
              <label htmlFor={`${uid}-msg`}>Pár szó a projektről (nem kötelező)</label>
              <textarea id={`${uid}-msg`} name="msg" rows={4} />
            </div>

            <p className="qd-legal">
              Az adatok kezeléséről az <a href={`${LIVE}/adatkezeles.html`}>adatkezelési tájékoztató</a> ad információt.
            </p>
            <button type="submit" className="btn btn--primary qd-submit" disabled={state === 'sending'} aria-busy={state === 'sending'}>
              {state === 'sending' ? 'Feldolgozás…' : 'Ajánlatkérés (bemutató)'} <span className="arrow">→</span>
            </button>
            <p className="qd-trust">Díjmentes ajánlat · Nem kötelez semmire · Közvetlenül a fejlesztővel</p>
          </m.form>
        ) : (
          <m.div key="done" className="qd-done" ref={onDoneShown} tabIndex={-1} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur.ui, ease: ease.out }} role="status">
            <span className="qd-done-mark" aria-hidden="true" />
            <h3>Így nézne ki a sikeres beküldés.</h3>
            <p>
              Ez csak bemutató: <strong>nem ment ki üzenet</strong>. Ha valóban ajánlatot kérnél, küldd el ugyanezt e-mailben – a levél előre kitöltve nyílik meg.
            </p>
            <div className="qd-done-actions">
              <a className="btn btn--primary" href={mailto}>
                Elküldöm e-mailben <span className="arrow">→</span>
              </a>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setState('idle')
                  setSent(null)
                  setNeed([])
                }}
              >
                Új kitöltés
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </Reveal>
  )
}

function Field({ id, name, label, error, autoComplete, inputMode }: { id: string; name: string; label: string; error?: string; autoComplete?: string; inputMode?: 'email' | 'text' }) {
  return (
    <div className="qd-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} autoComplete={autoComplete} inputMode={inputMode} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-e` : undefined} required />
      {error && (
        <p className="qd-err" id={`${id}-e`}>
          {error}
        </p>
      )}
    </div>
  )
}
