import React, { useEffect, useState, useRef } from 'react';
import { useDifficulty } from '../hooks/useDifficulty.jsx';
import easyImg from '../assets/easy_patrick.png';
import mediumImg from '../assets/medium_patrick.png';
import proImg from '../assets/pro_patrick.png';

const ASSETS = { 
  EASY: easyImg, 
  MEDIUM: mediumImg, 
  PRO: proImg 
};

export default function ThemeTransition() {
  const [difficulty] = useDifficulty();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedAsset, setDisplayedAsset] = useState(ASSETS[difficulty] || ASSETS.EASY);
  const prevRef = useRef(difficulty);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = difficulty;
      return;
    }
    if (prevRef.current === difficulty) return;
    prevRef.current = difficulty;
    setDisplayedAsset(ASSETS[difficulty] || ASSETS.EASY);
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(t);
  }, [difficulty]);

  return (
    <div
      className={`theme-transition${isAnimating ? ' theme-transition-active' : ''}`}
      aria-hidden="true"
    >
      <div className="theme-transition-content">
        <img src={displayedAsset} className="theme-transition-logo" alt="" />
        <div className="theme-transition-label">{difficulty}</div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .theme-transition {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--overlay, rgba(0,0,0,0.8));
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .theme-transition-active { opacity: 1; }
        
        .theme-transition-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          animation: theme-content-pop 800ms cubic-bezier(.34,1.56,.64,1);
        }
        
        .theme-transition-logo {
          width: clamp(200px, 40vw, 400px);
          height: auto;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.4));
        }

        .theme-transition-label {
          font-size: 2.5rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-shadow: 4px 4px 0px rgba(0,0,0,0.3);
          font-family: inherit;
        }

        @keyframes theme-content-pop {
          0%   { transform: scale(0.5) translateY(50px); opacity: 0; }
          40%  { transform: scale(1.05) translateY(-10px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
