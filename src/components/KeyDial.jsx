import React, { useRef, useState } from 'react';
import { shiftCamelot } from '../lib/camelot.js';

const KeyDial = ({
  baseKey = '4A',
  value = 0,
  onChange,
  color = '#8E44AD',
  size = 90,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  const clamp = (v) => Math.max(-12, Math.min(12, v));

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.clientY;
    const next = clamp(Math.round(startValRef.current + deltaY / 10));
    if (onChange && next !== value) onChange(next);
  };
  const handlePointerUp = (e) => {
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const handleDoubleClick = () => { if (onChange) onChange(0); };

  const effectiveKey = shiftCamelot(baseKey, value) || baseKey;
  const rotation = value * 15;
  const border = Math.round(size * 0.06);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fff', letterSpacing: 1 }}>KEY SHIFT</span>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{
          width: size, height: size, backgroundColor: color,
          border: `${border}px solid #333`, borderRadius: '50%',
          position: 'relative', cursor: 'ns-resize', userSelect: 'none', touchAction: 'none',
          boxShadow: `${border}px ${border}px 0 rgba(0,0,0,0.25)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <div style={{
          position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
          width: 4, height: Math.round(size * 0.25), backgroundColor: '#333', borderRadius: 2,
        }} />
        <div style={{
          fontSize: '1.1rem', fontWeight: 900, color: '#fff',
          transform: `rotate(${-rotation}deg)`,
          textShadow: '1px 1px 0 rgba(0,0,0,0.6)',
        }}>
          {effectiveKey}
        </div>
      </div>
      <span style={{ fontSize: '0.7rem', color: '#fff', opacity: 0.75 }}>
        {value > 0 ? `+${value} st` : `${value} st`}
      </span>
    </div>
  );
};

export default KeyDial;
