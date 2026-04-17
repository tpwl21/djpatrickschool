import { useState, useRef, useEffect } from 'react';
import { DIFFICULTY_SETTINGS, CURRENT_DIFFICULTY } from '../constants/difficulty';

export const useValidation = (difficultyLevel = CURRENT_DIFFICULTY) => {
  const config = DIFFICULTY_SETTINGS[difficultyLevel];
  
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isPerfectPitch, setIsPerfectPitch] = useState(false);
  const [isPerfectSync, setIsPerfectSync] = useState(false);
  const [startStatus, setStartStatus] = useState(null); // null, 'ok', 'early', 'late'
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  
  const syncStartTimeRef = useRef(0);
  const syncStabilityRef = useRef(0); // Positive for sync, negative for out-of-sync
  const validateStart = (actualPositionA, bpmA, levelId) => {
    const secPerBeat = 60 / bpmA;
    const beatsA = actualPositionA / secPerBeat;
    let diff = 0;
    let levelTolerance = 1.0; // Default 1s

    if (levelId === 'LEVEL_1' || levelId === 'LEVEL_2') {
      // All beats are valid
      const nearestBeat = Math.round(beatsA);
      diff = actualPositionA - (nearestBeat * secPerBeat);
      levelTolerance = 1.0; 
    } else if (levelId === 'LEVEL_3') {
      // Odd beats only (1, 3, 5...)
      const nearestEvenBeat = Math.round(beatsA / 2) * 2;
      diff = actualPositionA - (nearestEvenBeat * secPerBeat);
      levelTolerance = secPerBeat * 0.4;
    } else if (levelId === 'LEVEL_4') {
      // Uniquement sur les temps multiples de 8 (0, 8, 16, 24...)
      const nearest8Beat = Math.round(beatsA / 8) * 8;
      diff = actualPositionA - (nearest8Beat * secPerBeat);
      levelTolerance = secPerBeat * 0.5;
    } else if (levelId === 'LEVEL_5') {
      // NOUVEAU : Départ sur le CLAP (Beat 162 @ 126 BPM)
      const targetBeat = 162;
      diff = actualPositionA - (targetBeat - 1) * (60 / bpmA);
      levelTolerance = secPerBeat * 0.5;
    } else if (levelId === 'LEVEL_8') {
      // Pour le dernier niveau, plusieurs multiples validés (débuts de phrases : 0, 32, 64, 96, 128...)
      const nearestPhraseBeat = Math.round(beatsA / 32) * 32;
      diff = actualPositionA - (nearestPhraseBeat * secPerBeat);
      levelTolerance = 1.0;
    } else {
      // Levels 6, 7: Outro (Beat 128 uniquement)
      const targetBeat = 4 * 32; 
      diff = actualPositionA - (targetBeat * secPerBeat);
      levelTolerance = 1.0;
    }

    if (Math.abs(diff) <= levelTolerance) {
      setStartStatus('ok');
    } else if (diff < -levelTolerance) {
      setStartStatus('early');
    } else {
      setStartStatus('late');
    }
  };

  const resetStartStatus = () => setStartStatus(null);

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

    // 3. Overall validation (Must have pitch, sync AND correct start)
    const inFullSync = pitchCorrect && syncCorrect && startStatus === 'ok';

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
    startStatus,
    score,
    getGrade,
    validate,
    validateStart,
    resetStartStatus
  };
};

