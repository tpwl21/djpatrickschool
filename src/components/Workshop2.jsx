import React, { useState } from 'react';
import { motion } from 'framer-motion';
import W2Game1_EQ from './W2Game1_EQ';
import W2Game2_FX from './W2Game2_FX';
import W2Game3_Playlist from './W2Game3_Playlist';

const Workshop2 = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    setRetryKey(0);
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="workshop-wrapper w2">
      <button className="btn-back" onClick={onBack}>← Retour à l'Accueil</button>

      {level === 1 && <W2Game1_EQ key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 2 && <W2Game2_FX key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 3 && <W2Game3_Playlist key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}

      
      {level > 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}
        >
          <h1 style={{ fontSize: '4rem', color: '#00d2d3' }}>🔥 LEGENDE DU MIX ! 🔥</h1>
          <p>Tu as prouvé que tu sais lire une foule et sculpter le son.</p>
          <button className="btn-crayon play-btn" onClick={onBack}>Retourner à l'Académie</button>
        </motion.div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .workshop-wrapper.w2 {
          background: #0a0a0a;
          min-height: 100vh;
          padding-top: 60px;
        }
        .btn-back {
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(0,210,211,0.2);
          color: #00d2d3;
          border: 1px solid #00d2d3;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          z-index: 1000;
          backdrop-filter: blur(5px);
          transition: all 0.2s;
        }
        .btn-back:hover {
          background: #00d2d3;
          color: black;
          transform: translateX(-5px);
        }
      `}} />
    </div>
  );
};

export default Workshop2;
