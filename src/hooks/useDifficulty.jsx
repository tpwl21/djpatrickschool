import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'dj_teacher_difficulty';
const VALID = new Set(['EASY', 'MEDIUM', 'PRO']);

const DifficultyContext = createContext();

export function DifficultyProvider({ children }) {
  const [difficulty, setDifficultyState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return VALID.has(raw) ? raw : 'EASY';
    } catch {
      return 'EASY';
    }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && VALID.has(e.newValue)) {
        setDifficultyState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Sync the ambiance theme to the <html> element so CSS tokens in theme.css
  // can react globally. SecretBooth overrides this locally via a wrapper.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = difficulty.toLowerCase();
  }, [difficulty]);

  const setDifficulty = (value) => {
    if (!VALID.has(value)) return;
    setDifficultyState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  };

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
