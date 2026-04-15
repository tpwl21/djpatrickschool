import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Level1 from './Level1';
import Level2 from './Level2';
import Level3 from './Level3';
import Level4 from './Level4';
import Level5 from './Level5';
import Level6 from './Level6';
import Level7Original from './Level7Original'; // Note: User's old Level 7

const Workshop1 = ({ onBack }) => {
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
    <div className="workshop-wrapper">
      <button className="btn-back" onClick={onBack}>← Retour à l'Accueil</button>

      {level === 1 && <Level1 key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 2 && <Level2 key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 3 && <Level3 key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 4 && <Level4 key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 5 && <Level5 key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 6 && <Level6 key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}
      {level === 7 && <Level7Original key={retryKey} onNextLevel={handleNextLevel} onRetry={handleRetry} />}

      
      {level > 7 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}
        >
          <h1 style={{ fontSize: '4rem' }}>🎧 Atelier Terminé !</h1>
          <p>Tu maîtrises maintenant les fondamentaux du rythme.</p>
          <button className="btn-crayon play-btn" onClick={onBack}>Choisir un autre Atelier</button>
        </motion.div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .workshop-wrapper {
          min-height: 100vh;
          background: #121212;
          padding-top: 60px;
        }
        .btn-back {
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          z-index: 1000;
          backdrop-filter: blur(5px);
          transition: all 0.2s;
        }
        .btn-back:hover {
          background: #ff9f43;
          color: black;
          transform: translateX(-5px);
        }
      `}} />
    </div>
  );
};

export default Workshop1;
