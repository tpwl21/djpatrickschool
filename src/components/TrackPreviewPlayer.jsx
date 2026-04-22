import React, { useEffect, useRef, useState } from 'react';

const TrackPreviewPlayer = ({
  isActive,
  onPlay,
  onStop,
  durationMs = 8000,
  color = '#e74c3c',
  size = 36,
}) => {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now();
    const tick = () => {
      const t = (performance.now() - startRef.current) / durationMs;
      if (t >= 1) { setProgress(1); return; }
      setProgress(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isActive, durationMs]);

  const handleClick = () => {
    if (isActive) onStop();
    else onPlay();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid ${color}`, background: isActive ? color : 'transparent',
        color: isActive ? '#fff' : color, fontWeight: 900, cursor: 'pointer',
        fontSize: size * 0.4, position: 'relative', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {isActive ? '■' : '▶'}
      {isActive && (
        <svg
          width={size} height={size}
          style={{ position: 'absolute', top: -3, left: -3, pointerEvents: 'none' }}
        >
          <circle
            cx={size / 2} cy={size / 2} r={size / 2 - 2}
            fill="none" stroke="#fff" strokeWidth="2"
            strokeDasharray={Math.PI * (size - 4)}
            strokeDashoffset={Math.PI * (size - 4) * (1 - progress)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
      )}
    </button>
  );
};

export default TrackPreviewPlayer;
