import { useEffect, useRef } from 'react';

/**
 * A custom hook to handle the requestAnimationFrame loop cleanly.
 * @param {Function} callback - The function to call on every frame.
 */
export const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Run once on mount
};
