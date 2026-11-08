import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../hooks/LanguageContext';
import frFlagImg from '../assets/fr_flag.webp';
import ukFlagImg from '../assets/uk_flag.webp';

const LanguageSwitcher = ({ style = {} }) => {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div className="language-switcher" style={{ display: 'flex', gap: '10px', ...style }}>
      {/* vrais boutons (clavier + lecteur d'écran) ; l'image du drapeau est décorative */}
      <motion.button type="button" className="lang-btn" onClick={() => setLanguage('fr')} aria-pressed={language === 'fr'} aria-label="Français" whileHover={{ scale: 1.1 }}>
        <img src={frFlagImg} alt="" className={`lang-flag ${language === 'fr' ? 'active' : ''}`}
          style={{ width: '40px', height: 'auto', display: 'block', filter: language === 'fr' ? 'none' : 'grayscale(100%) opacity(0.5)', transition: 'all 0.3s' }} />
      </motion.button>
      <motion.button type="button" className="lang-btn" onClick={() => setLanguage('en')} aria-pressed={language === 'en'} aria-label="English" whileHover={{ scale: 1.1 }}>
        <img src={ukFlagImg} alt="" className={`lang-flag ${language === 'en' ? 'active' : ''}`}
          style={{ width: '40px', height: 'auto', display: 'block', filter: language === 'en' ? 'none' : 'grayscale(100%) opacity(0.5)', transition: 'all 0.3s' }} />
      </motion.button>
      <style dangerouslySetInnerHTML={{ __html: `
        .lang-btn { padding: 0; border: none; background: none; cursor: pointer; border-radius: 6px; }
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
