import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * React.lazy plus a preload(). Once the module has loaded, the component renders without suspending,
 * so a view transition into the page captures the page itself rather than the loading fallback.
 */
export function lazyWithPreload<T extends ComponentType>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  let loaded: { default: T } | null = null
  let pending: Promise<{ default: T }> | null = null
  const preload = () => {
    pending ??= factory().then((mod) => (loaded = mod))
    return pending
  }
  // A thenable that resolves synchronously once loaded; React.lazy accepts any thenable.
  const Component = lazy(() =>
    loaded ? ({ then: (resolve: (m: { default: T }) => void) => resolve(loaded!) } as Promise<{ default: T }>) : preload(),
  )
  return Object.assign(Component, { preload })
}
