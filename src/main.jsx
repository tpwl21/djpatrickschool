import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './hooks/LanguageContext.jsx'
import { DifficultyProvider } from './hooks/useDifficulty.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DifficultyProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </DifficultyProvider>
  </StrictMode>,
)
