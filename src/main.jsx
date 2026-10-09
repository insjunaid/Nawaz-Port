import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted fonts (only the subsets a page actually uses are downloaded).
import '@fontsource-variable/fraunces/full.css' // opsz + SOFT + WONK axes
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/manrope'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/amiri/arabic-400.css'
import '@fontsource/amiri/latin-400.css'

import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
