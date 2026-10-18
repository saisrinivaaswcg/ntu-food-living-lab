/** Native page scrolling helpers. Smooth only when the device allows motion; never hijacks the scroll. */

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Jump to the top without animating (new page). */
export function jumpToTop(): void {
  window.scrollTo({ top: 0, behavior: 'instant' })
}

/** Scroll an element into view, smoothly unless motion is reduced. `offset` clears the sticky header (56px). */
export function scrollToElement(el: HTMLElement, offset = -56): void {
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY + offset,
    behavior: reducedMotion() ? 'instant' : 'smooth',
  })
}
