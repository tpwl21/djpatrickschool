import React from 'react';
import { motion } from 'framer-motion';

const Cinematic = ({ onNextLevel, onRetry, type = 'win' }) => {
  const isWin = type === 'win';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: isWin ? 'rgba(255, 255, 255, 0.8)' : 'rgba(50, 0, 0, 0.8)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(5px)'
      }}
    >
      <motion.div
        animate={{ 
          rotate: isWin ? [0, 10, -10, 10, 0] : [0, 5, -5, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        style={{
          fontSize: '6rem',
          textShadow: isWin ? '4px 4px 0px #ff6b6b' : '4px 4px 0px #000'
        }}
      >
        {isWin ? '🎉 BRAVO ! 🐰' : '😢 OUPS ! 🚂💨'}
      </motion.div>
      <h2 style={{ fontSize: '2.5rem', color: isWin ? '#ff9f43' : '#ff6b6b', marginTop: '20px' }}>
        {isWin ? 'Les trains roulent ensemble !' : 'Le train est parti sans toi...'}
      </h2>
      
      {isWin ? (
        <button 
          className="btn-crayon play-btn" 
          style={{ marginTop: '40px', fontSize: '2rem' }}
          onClick={onNextLevel}
        >
          Niveau Suivant 🚀
        </button>
      ) : (
        <button 
          className="btn-crayon nudge-btn" 
          style={{ marginTop: '40px', fontSize: '2rem' }}
          onClick={onRetry}
        >
          Réessayer 🔄
        </button>
      )}
    </motion.div>
  );
};

export default Cinematic;
