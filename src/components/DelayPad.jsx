import React from 'react';
import Potard from './Potard';

const BEAT_OPTIONS = [
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.5 },
  { label: '1', value: 1 },
];

const DelayPad = ({
  active,
  mix,
  timeBeats,
  onToggle,
  onMixChange,
  onTimeChange,
  color = '#9b59b6',
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: '0.7rem', color: 'currentColor', fontWeight: 900, letterSpacing: 1 }}>DELAY</span>
    <button
      onClick={() => onToggle(!active)}
      aria-pressed={active}
      aria-label="Delay"
      style={{
        width: 70, height: 50, border: '3px solid #333',
        background: active ? color : '#444', color: '#fff',
        fontWeight: 900, cursor: 'pointer', borderRadius: 6,
        boxShadow: active ? `0 0 12px ${color}` : 'none',
        transition: 'all 0.12s ease-out',
        touchAction: 'none', userSelect: 'none',
      }}
    >
      {active ? 'ON' : 'OFF'}
    </button>
    <div style={{ display: 'flex', gap: 6 }}>
      {BEAT_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onTimeChange(opt.value)}
          style={{
            padding: '4px 8px', fontSize: '0.7rem', fontWeight: 900,
            background: Math.abs(timeBeats - opt.value) < 0.01 ? color : '#333',
            color: '#fff', border: '2px solid #222', borderRadius: 4, cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
    <Potard size={32} min={0} max={1} value={mix} onChange={onMixChange} color={color} ariaLabel="Delay wet" />
    <span style={{ fontSize: '0.7rem', color: 'currentColor', opacity: 0.8 }}>WET</span>
  </div>
);

export default DelayPad;
