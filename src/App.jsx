import React, { useState } from 'react';
import './App.css';
import Level1 from './components/Level1';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import Level4 from './components/Level4';
import Level5 from './components/Level5';
import Level6 from './components/Level6';
import Level7 from './components/Level7';

import Home from './components/Home';

function App() {
  const [level, setLevel] = useState(0); // 0 = Home
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    const saved = localStorage.getItem('dj_teacher_progression');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [difficulty, setDifficulty] = useState('EASY');
  const [retryKey, setRetryKey] = useState(0);

  const handleNextLevel = () => {
    const next = level + 1;
    if (next > unlockedLevel && next <= 7) {
      setUnlockedLevel(next);
      localStorage.setItem('dj_teacher_progression', next);
    }
    setLevel(next);
    setRetryKey(0);
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  const handleBackToHome = () => {
    setLevel(0);
    setRetryKey(0);
  };

  const unlockNext = (current) => {
    const next = current + 1;
    if (next > unlockedLevel && next <= 7) {
      setUnlockedLevel(next);
      localStorage.setItem('dj_teacher_progression', next);
    }
  };

  const startLevel = (levelIdx, diff) => {
    setDifficulty(diff);
    setLevel(levelIdx);
    setRetryKey(0);
  };

  return (
    <>
      {level === 0 && <Home onStart={startLevel} unlockedLevel={unlockedLevel} />}
      
      {level === 1 && <Level1 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(1)} />}
      {level === 2 && <Level2 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(2)} />}
      {level === 3 && <Level3 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(3)} />}
      {level === 4 && <Level4 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(4)} />}
      {level === 5 && <Level5 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(5)} />}
      {level === 6 && <Level6 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(6)} />}
      {level === 7 && <Level7 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(7)} />}
      
      {level > 7 && (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--primary-bg)', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '5rem', textShadow: '4px 4px 0px #ff9f43' }}>🎓 DJ MASTER ! 🎧</h1>
          <p style={{ fontSize: '2rem', color: '#666', maxWidth: '600px', margin: '20px auto' }}>
            Tu as maîtrisé le rythme, le pitch et le paysage musical. Les trains roulent maintenant en parfaite harmonie grâce à toi !
          </p>
          <button 
            className="btn-crayon play-btn" 
            style={{ marginTop: '50px', fontSize: '2.5rem', padding: '20px 50px' }}
            onClick={() => setLevel(0)}
          >
            Retour au Menu 🎠
          </button>
        </div>
      )}
    </>
  );
}

export default App;
