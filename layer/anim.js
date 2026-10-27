// A réteg összes `animate` hívása ezen megy át. Álló üzemmódban (csökkentett mozgás beállítás, html.dkm-static)
// minden animáció azonnal a végállapotba ugrik: az új design látszik, de semmi nem mozog.
import { animate as motionAnimate } from 'motion/mini'

export function animate(el, keyframes, options = {}) {
  if (document.documentElement.classList.contains('dkm-static')) {
    return motionAnimate(el, keyframes, { ...options, type: undefined, duration: 0.001, delay: 0 })
  }
  return motionAnimate(el, keyframes, options)
}
