import { StrictMode } from 'react'
import { MotionConfig } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './hooks/LanguageContext.jsx'
import { DifficultyProvider } from './hooks/useDifficulty.jsx'

// Firefox ignore -webkit-user-drag : on bloque le glisser fantôme des images ici, pour tout le site
document.addEventListener('dragstart', (e) => {
  if (e.target instanceof HTMLImageElement) e.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* reducedMotion="user" : si l'OS demande moins d'animations, framer coupe transforms/rebonds mais garde les fondus (le changement d'état reste visible) */}
    <MotionConfig reducedMotion="user">
      <DifficultyProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </DifficultyProvider>
    </MotionConfig>
  </StrictMode>,
)
