import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { injectSpeedInsights } from '@vercel/speed-insights'
import './index.css'
import App from './App.tsx'

injectSpeedInsights()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
