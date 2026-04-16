import { useState, useRef, useEffect } from 'react';
import { DIFFICULTY_SETTINGS, CURRENT_DIFFICULTY } from '../constants/difficulty';

export const useValidation = (difficultyLevel = CURRENT_DIFFICULTY) => {
  const config = DIFFICULTY_SETTINGS[difficultyLevel];
  
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isPerfectPitch, setIsPerfectPitch] = useState(false);
  const [isPerfectSync, setIsPerfectSync] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  
  const syncStartTimeRef = useRef(0);
  const syncStabilityRef = useRef(0); // Positive for sync, negative for out-of-sync

  const validate = (diffSec, currentBpmB, currentBpmA) => {
    // 1. Direct BPM Comparison (Pitch)
    const pitchDiff = Math.abs(currentBpmB - currentBpmA);
    const pitchCorrect = pitchDiff < config.pitchToleranceBpm;
    setIsPerfectPitch(pitchCorrect);

    // 2. Phase Sync Comparison with Hysteresis (Prevents flickering)
    const instantSyncCorrect = diffSec < config.toleranceSec;
    
    if (instantSyncCorrect) {
      syncStabilityRef.current = Math.min(syncStabilityRef.current + 1, 10);
      if (syncStabilityRef.current >= 3) setIsPerfectSync(true);
    } else {
      syncStabilityRef.current = Math.max(syncStabilityRef.current - 1, -10);
      if (syncStabilityRef.current <= -3) setIsPerfectSync(false);
    }

    const syncCorrect = instantSyncCorrect || (syncStabilityRef.current > 0);

    // 3. Overall validation
    const inFullSync = pitchCorrect && syncCorrect;

    if (inFullSync) {
      scoreRef.current += 1; // Accumulate sync points in ref (no re-render)
      if (syncStartTimeRef.current === 0) {
        syncStartTimeRef.current = performance.now();
      } else if (performance.now() - syncStartTimeRef.current > config.winDurationSec * 1000) {
        setScore(scoreRef.current); // Sync to state ONLY on win
        setIsLevelCleared(true);
      }
    } else {
      syncStartTimeRef.current = 0;
    }

    return { pitchCorrect, syncCorrect, inFullSync };
  };

  const getGrade = () => {
    // Determine grade based on accumulated scoreRef
    const finalScore = isLevelCleared ? score : scoreRef.current;
    if (finalScore > 1000) return 'S';
    if (finalScore > 500) return 'A';
    if (finalScore > 200) return 'B';
    return 'C';
  };

  return {
    config,
    isLevelCleared,
    isPerfectPitch,
    isPerfectSync,
    score,
    getGrade,
    validate
  };
};

