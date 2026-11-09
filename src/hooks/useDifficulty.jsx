import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const VALID = new Set(['EASY', 'MEDIUM', 'PRO']);

const DifficultyContext = createContext();

// Palier en cours de jeu (EASY / MEDIUM / PRO). Ce n'est plus un réglage global du joueur :
// App le déduit de la route (palier de la leçon / du niveau ouvert), donc rien en localStorage.
export function DifficultyProvider({ children }) {
  const [difficulty, setDifficultyState] = useState('EASY');

  // Sync the ambiance theme to the <html> element so CSS tokens in theme.css
  // can react globally. SecretBooth overrides this locally via a wrapper.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = difficulty.toLowerCase();
  }, [difficulty]);

  const setDifficulty = useCallback((value) => {
    if (VALID.has(value)) setDifficultyState(value);
  }, []);

  return (
    <DifficultyContext.Provider value={[difficulty, setDifficulty]}>
      {children}
    </DifficultyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDifficulty() {
  const context = useContext(DifficultyContext);
  if (context === undefined) {
    throw new Error('useDifficulty must be used within a DifficultyProvider');
  }
  return context;
}
