import React from 'react';
import { motion } from 'framer-motion';

const Cinematic = ({ onNextLevel, onRetry, type = 'win' }) => {
  const isWin = type === 'win';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="cinematic-overlay"
      style={{
        backgroundColor: isWin ? 'rgba(255, 255, 255, 0.9)' : 'rgba(50, 0, 0, 0.9)',
        color: isWin ? '#333' : '#fff'
      }}
    >
      <motion.div
        animate={{ 
          rotate: isWin ? [0, 10, -10, 10, 0] : [0, 5, -5, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        className="cinematic-emoji"
        style={{
          textShadow: isWin ? '4px 4px 0px rgba(255, 107, 107, 0.3)' : '4px 4px 0px #000'
        }}
      >
        {isWin ? '🎉 BRAVO ! 🐰' : '😢 OUPS ! 🚂💨'}
      </motion.div>
      <h2 className="cinematic-title" style={{ color: isWin ? '#ff9f43' : '#ff6b6b' }}>
        {isWin ? 'Les trains roulent ensemble !' : 'Le train est parti sans toi...'}
      </h2>
      
      {isWin ? (
        <button 
          className="btn-crayon play-btn" 
          style={{ marginTop: '30px', padding: '15px 40px', fontSize: '1.5rem' }}
          onClick={onNextLevel}
        >
          Niveau Suivant 🚀
        </button>
      ) : (
        <button 
          className="btn-crayon nudge-btn" 
          style={{ marginTop: '30px', padding: '15px 40px', fontSize: '1.5rem' }}
          onClick={onRetry}
        >
          Réessayer 🔄
        </button>
      )}
    </motion.div>
  );
};

export default Cinematic;
