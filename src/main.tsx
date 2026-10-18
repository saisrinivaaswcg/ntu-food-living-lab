import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts: Newsreader (headings, big numbers; with optical sizes) and Public Sans (text).
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/public-sans/wght.css'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
