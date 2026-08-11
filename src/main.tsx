import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ProvedorEstudo } from './nucleo/estado'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorEstudo>
      <App />
    </ProvedorEstudo>
  </StrictMode>,
)
