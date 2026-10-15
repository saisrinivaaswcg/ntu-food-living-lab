import { useEffect } from 'react'

const APP_NAME = 'NTU Food Living Lab'

/** Sets the browser tab title, so screen-reader users hear which page loaded. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
