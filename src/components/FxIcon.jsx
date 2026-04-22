import React from 'react';

const FxIcon = ({ color = '#27AE60', style = {} }) => (
  <div style={{
    position: 'relative',
    width: '52px',
    height: '38px',
    backgroundColor: color,
    border: '3px solid #333',
    borderRadius: '4px',
    boxShadow: '3px 3px 0px #333',
    flexShrink: 0,
    ...style,
  }}>
    {/* Top knob */}
    <div style={{
      position: 'absolute',
      top: '-8px',
      left: '8px',
      width: '14px',
      height: '14px',
      backgroundColor: '#fff',
      border: '3px solid #333',
      borderRadius: '50%',
    }}>
      <div style={{
        position: 'absolute',
        top: '1px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '2px',
        height: '5px',
        backgroundColor: '#333',
        borderRadius: '1px',
      }} />
    </div>

    {/* Display LED */}
    <div style={{
      position: 'absolute',
      top: '6px',
      right: '8px',
      width: '8px',
      height: '8px',
      backgroundColor: '#fff',
      border: '2px solid #333',
      borderRadius: '50%',
    }} />

    {/* Echo ripples (3 curves on the right side, representing delay tail) */}
    <svg
      style={{ position: 'absolute', right: '-18px', top: '4px' }}
      width="20" height="30" viewBox="0 0 20 30"
    >
      <path d="M 2 4 Q 10 4, 10 12" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 2 12 Q 14 12, 14 20" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 2 22 Q 18 22, 18 30" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
    </svg>

    {/* Bottom label bar */}
    <div style={{
      position: 'absolute',
      bottom: '5px',
      left: '6px',
      right: '6px',
      height: '4px',
      backgroundColor: '#333',
      borderRadius: '1px',
    }} />
  </div>
);

export default FxIcon;
