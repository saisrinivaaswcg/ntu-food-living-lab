/**
 * Inertial page scrolling (Lenis). Off when the device asks for reduced motion, and never applied
 * inside the map, the site panel, form controls or anything marked data-lenis-prevent.
 */
import Lenis from 'lenis'

let lenis: Lenis | null = null

const NATIVE_SCROLL = '.leaflet-container, [data-lenis-prevent], input, textarea, select'

/** Starts smooth scrolling for the page. Returns a cleanup function. */
export function startSmoothScroll(): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const start = () => {
    if (lenis || reduce.matches) return
    lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -64 },
      prevent: (node) => node.closest(NATIVE_SCROLL) !== null,
    })
  }
  const stop = () => {
    lenis?.destroy()
    lenis = null
  }
  const onChange = () => (reduce.matches ? stop() : start())
  start()
  reduce.addEventListener('change', onChange)
  return () => {
    reduce.removeEventListener('change', onChange)
    stop()
  }
}

/** Jump to the top without animating (new page). */
export function jumpToTop(): void {
  if (lenis) lenis.scrollTo(0, { immediate: true })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

/** Scroll an element into view, smoothly unless motion is reduced. `offset` clears the sticky header (56px once scrolled). */
export function scrollToElement(el: HTMLElement, offset = -56): void {
  if (lenis) {
    lenis.scrollTo(el, { offset })
    return
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? 'instant' : 'smooth' })
}
