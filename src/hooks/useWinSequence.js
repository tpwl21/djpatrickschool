import { useEffect, useRef, useState } from 'react';

const FADE_OUT_SEC = 1.5;
const SLOWDOWN_MS = 1500;

/**
 * Triggered when `isLevelCleared` flips true: fades both decks out, ramps the
 * caller's animation speed (exposed via `speedRef`) from 1 → 0, and unlocks
 * the next level. `animTimeRef` is exposed for shells that want to advance a
 * frozen timeline during the win sequence.
 */
export const useWinSequence = (isLevelCleared, audioCtxRef, onUnlockNext) => {
  const [isWinSequence, setIsWinSequence] = useState(false);
  const speedRef = useRef(1);
  const animTimeRef = useRef(0);

  useEffect(() => {
    if (!isLevelCleared || isWinSequence) return undefined;

    setIsWinSequence(true);
    onUnlockNext?.();

    const ctx = audioCtxRef.current;
    if (ctx) {
      ctx.fadeOutDeck('A', FADE_OUT_SEC);
      ctx.fadeOutDeck('B', FADE_OUT_SEC);
    }

    const startTime = performance.now();
    const initialSpeed = speedRef.current;
    let rafId;
    const tick = (time) => {
      const t = (time - startTime) / SLOWDOWN_MS;
      if (t < 1) {
        speedRef.current = initialSpeed * (1 - t);
        rafId = requestAnimationFrame(tick);
      } else {
        speedRef.current = 0;
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isLevelCleared, isWinSequence, audioCtxRef, onUnlockNext]);

  return { isWinSequence, speedRef, animTimeRef };
};
