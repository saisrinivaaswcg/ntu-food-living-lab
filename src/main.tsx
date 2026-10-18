import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts: Newsreader (headings, big numbers) and Public Sans (text). Weight axis only, to keep them small.
import '@fontsource-variable/newsreader/wght.css'
import '@fontsource-variable/public-sans/wght.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
