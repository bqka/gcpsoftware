import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import NewItem from './pages/newItem/NewItem'
import Calibrate from './pages/calibrate/Calibrate'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Calibrate />
  </StrictMode>,
)
