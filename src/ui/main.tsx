import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
// import App from './App.tsx'
import WireHarnessHome from './pages/WireHarnessHome.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WireHarnessHome />
  </StrictMode>,
)
