import React from 'react';
import Potard from './Potard';

const ReverbPad = ({
  active,
  wet,
  onToggle,
  onWetChange,
  color = '#3498db',
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: '0.7rem', color: 'currentColor', fontWeight: 900, letterSpacing: 1 }}>REVERB</span>
    <button
      onClick={() => onToggle(!active)}
      aria-pressed={active}
      aria-label="Reverb"
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
    <Potard size={32} min={0} max={1} value={wet} onChange={onWetChange} color={color} ariaLabel="Reverb wet" />
    <span style={{ fontSize: '0.7rem', color: 'currentColor', opacity: 0.8 }}>WET</span>
  </div>
);

export default ReverbPad;
