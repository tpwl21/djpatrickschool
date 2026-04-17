import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import Level1 from './workshops/beatmatching/Level1';
import Level2 from './workshops/beatmatching/Level2';
import Level3 from './workshops/beatmatching/Level3';
import Level4 from './workshops/beatmatching/Level4';
import Level5 from './workshops/beatmatching/Level5';
import Level6 from './workshops/beatmatching/Level6';
import Level7 from './workshops/beatmatching/Level7';
import Level8 from './workshops/beatmatching/Level8';
import Home from './components/Home';
import GraduationPopup from './components/GraduationPopup';
import LevelPopup from './components/LevelPopup';

function App() {
  const [level, setLevel] = useState(0); // 0 = Home, 1-7 = Beatmatch
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    const saved = localStorage.getItem('dj_teacher_progression');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [difficulty, setDifficulty] = useState('EASY');
  const [persistedDifficulty, setPersistedDifficulty] = useState(null);
  const [persistedLevelIdx, setPersistedLevelIdx] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isGraduated, setIsGraduated] = useState(false);
  const [pendingNextLevel, setPendingNextLevel] = useState(null);

  const handleNextLevel = () => {
    if (level === 8) {
      setIsGraduated(true);
      return;
    }
    const next = level + 1;
    if (next > unlockedLevel && next <= 8) {
      setUnlockedLevel(next);
      localStorage.setItem('dj_teacher_progression', next);
    }
    setPendingNextLevel(next);
  };

  const startPendingLevel = () => {
    if (pendingNextLevel) {
      setLevel(pendingNextLevel);
      setPersistedLevelIdx(pendingNextLevel);
      setRetryKey(0);
      setPendingNextLevel(null);
    }
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  const handleBackToHome = () => {
    setLevel(0);
    setRetryKey(0);
    setIsGraduated(false);
    setPendingNextLevel(null);
  };

  const unlockNext = (current) => {
    const next = current + 1;
    if (next > unlockedLevel && next <= 8) {
      setUnlockedLevel(next);
      localStorage.setItem('dj_teacher_progression', next);
    }
  };

  const startLevel = (levelIdx, diff) => {
    setDifficulty(diff);
    setPersistedDifficulty(diff);
    setPersistedLevelIdx(levelIdx);
    setLevel(levelIdx);
    setRetryKey(0);
    setIsGraduated(false);
  };

  const persistState = React.useCallback((l, d) => {
    setPersistedLevelIdx(l);
    setPersistedDifficulty(d);
  }, []);

  return (
    <>
      {level === 0 && (
        <Home 
          onStart={startLevel} 
          unlockedLevel={unlockedLevel} 
          initialDifficulty={persistedDifficulty}
          initialLevel={persistedLevelIdx}
          onPersistState={persistState}
        />
      )}
      
      {level === 1 && <Level1 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(1)} />}
      {level === 2 && <Level2 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(2)} />}
      {level === 3 && <Level3 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(3)} />}
      {level === 4 && <Level4 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(4)} />}
      {level === 5 && <Level5 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(5)} />}
      {level === 6 && <Level6 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(6)} />}
      {level === 7 && <Level7 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(7)} />}
      {level === 8 && <Level8 key={`${difficulty}-${retryKey}`} difficulty={difficulty} onNextLevel={handleNextLevel} onRetry={handleRetry} onBack={handleBackToHome} onUnlockNext={() => unlockNext(8)} />}
      
      {isGraduated && (
        <GraduationPopup difficulty={difficulty} onBackHome={handleBackToHome} />
      )}

      <AnimatePresence>
        {pendingNextLevel && (
          <LevelPopup 
            level={pendingNextLevel}
            difficulty={difficulty}
            onCancel={handleBackToHome}
            onStart={startPendingLevel}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
