import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../hooks/LanguageContext';

const SoundOnIndicator = () => {
  const { language } = useContext(LanguageContext);
  const text = language === 'en' ? 'SOUND ON!' : 'SON ACTIVÉ !';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '180px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#ff6b6b',
        color: 'white',
        padding: '6px 14px',
        border: '3px solid #333',
        borderRadius: '20px',
        boxShadow: '4px 4px 0 #333',
        fontWeight: '900',
        fontFamily: 'inherit',
        transform: 'rotate(2deg)',
        pointerEvents: 'none'
      }}
    >
      <motion.svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }}
        style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.15))' }}
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </motion.svg>
      <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>{text}</span>
    </motion.div>
  );
};

export default SoundOnIndicator;
