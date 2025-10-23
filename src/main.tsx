import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PrimeReact CSS
import 'primereact/resources/themes/lara-light-green/theme.css';  // Tema verde
import 'primereact/resources/primereact.min.css';                 // Core CSS
import 'primeicons/primeicons.css';                               // Iconos

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
