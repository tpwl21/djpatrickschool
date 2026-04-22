import React, { useState } from 'react';

// Values are in BEATS (quarter-notes). "1/4" = a quarter of a bar = 1 beat.
const SIZES = [
  { label: '1/4', value: 1 },
  { label: '1/8', value: 0.5 },
  { label: '1/16', value: 0.25 },
  { label: '1/32', value: 0.125 },
];

const LoopRollPads = ({ onTrigger, color = '#f39c12' }) => {
  const [activeSize, setActiveSize] = useState(null);

  const press = (size) => {
    setActiveSize(size);
    onTrigger(size, true);
  };
  const release = () => {
    if (activeSize != null) onTrigger(activeSize, false);
    setActiveSize(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 900, letterSpacing: 1 }}>LOOP ROLL</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {SIZES.map((s) => {
          const isActive = activeSize === s.value;
          return (
            <button
              key={s.label}
              onPointerDown={(e) => { e.target.setPointerCapture(e.pointerId); press(s.value); }}
              onPointerUp={release}
              onPointerCancel={release}
              onPointerLeave={release}
              style={{
                width: 48, height: 48, border: '3px solid #333',
                background: isActive ? color : '#444', color: '#fff',
                fontWeight: 900, fontSize: '0.7rem', borderRadius: 6,
                boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                transition: 'all 0.08s ease-out',
                touchAction: 'none', userSelect: 'none', cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LoopRollPads;
