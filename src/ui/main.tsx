import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import NewItem from './pages/newItem/NewItem'
import Calibrate from './pages/calibrate/Calibrate'
import TestItem from './pages/testItem/TestItem'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestItem />
  </StrictMode>,
)
