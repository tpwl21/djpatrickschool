import React, { createContext, useState, useEffect } from 'react';
import fr from '../locales/fr';
import en from '../locales/en';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('djPatrickLanguage');
    return saved ? saved : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('djPatrickLanguage', language);
  }, [language]);

  const dictionary = language === 'en' ? en : fr;

  const t = (key) => {
    const keys = key.split('.');
    let result = dictionary;
    for (const k of keys) {
      if (result[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      result = result[k];
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
