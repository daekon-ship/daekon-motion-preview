// Szolgáltatáskártyáról az ajánlatkérőbe: a kiválasztott szolgáltatás előre bejelölődik.
const EVT = 'daekon:pick-service'

export function pickService(title: string) {
  window.dispatchEvent(new CustomEvent<string>(EVT, { detail: title }))
}

export function onPickService(cb: (title: string) => void) {
  const h = (e: Event) => cb((e as CustomEvent<string>).detail)
  window.addEventListener(EVT, h)
  return () => window.removeEventListener(EVT, h)
}
