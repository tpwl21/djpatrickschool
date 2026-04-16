import { useState, useRef, useEffect } from 'react';
import { DIFFICULTY_SETTINGS, CURRENT_DIFFICULTY } from '../constants/difficulty';

export const useValidation = (difficultyLevel = CURRENT_DIFFICULTY) => {
  const config = DIFFICULTY_SETTINGS[difficultyLevel];
  
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isPerfectPitch, setIsPerfectPitch] = useState(false);
  const [isPerfectSync, setIsPerfectSync] = useState(false);
  
  const syncStartTimeRef = useRef(0);

  const validate = (diffSec, currentBpmB, targetBpmA) => {
    // 1. Check Pitch
    const pitchDiff = Math.abs(currentBpmB - targetBpmA);
    const pitchCorrect = pitchDiff < config.pitchToleranceBpm;
    setIsPerfectPitch(pitchCorrect);

    // 2. Check Sync
    const syncCorrect = diffSec < config.toleranceSec;
    setIsPerfectSync(syncCorrect);

    // 3. Overall validation
    const inFullSync = pitchCorrect && syncCorrect;

    if (inFullSync) {
      if (syncStartTimeRef.current === 0) {
        syncStartTimeRef.current = performance.now();
      } else if (performance.now() - syncStartTimeRef.current > config.winDurationSec * 1000) {
        setIsLevelCleared(true);
      }
    } else {
      syncStartTimeRef.current = 0;
    }

    return { pitchCorrect, syncCorrect, inFullSync };
  };

  return {
    config,
    isLevelCleared,
    isPerfectPitch,
    isPerfectSync,
    validate
  };
};
