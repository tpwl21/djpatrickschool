import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../hooks/LanguageContext';
import frFlagImg from '../assets/fr_flag.webp';
import ukFlagImg from '../assets/uk_flag.webp';

const LanguageSwitcher = ({ style = {} }) => {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div className="language-switcher" style={{ display: 'flex', gap: '10px', ...style }}>
      <motion.img
        src={frFlagImg}
        alt="FR"
        className={`lang-flag ${language === 'fr' ? 'active' : ''}`}
        style={{ width: '40px', height: 'auto', cursor: 'pointer', filter: language === 'fr' ? 'none' : 'grayscale(100%) opacity(0.5)', transition: 'all 0.3s' }}
        onClick={() => setLanguage('fr')}
        whileHover={{ scale: 1.1 }}
      />
      <motion.img
        src={ukFlagImg}
        alt="EN"
        className={`lang-flag ${language === 'en' ? 'active' : ''}`}
        style={{ width: '40px', height: 'auto', cursor: 'pointer', filter: language === 'en' ? 'none' : 'grayscale(100%) opacity(0.5)', transition: 'all 0.3s' }}
        onClick={() => setLanguage('en')}
        whileHover={{ scale: 1.1 }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .lang-flag {
          border-radius: 4px;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        }
        .lang-flag.active {
          box-shadow: 2px 2px 0 #333;
          border: 2px solid var(--primary, #5DADE2);
        }
      `}} />
    </div>
  );
};

export default LanguageSwitcher;
