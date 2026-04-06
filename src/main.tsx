import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClientesProvider } from './hooks/ClientesContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClientesProvider>
      <App />
    </ClientesProvider>
  </StrictMode>,
)
