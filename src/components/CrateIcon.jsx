import React from 'react';

const CrateIcon = ({ color = '#E74C3C', style = {} }) => (
  <div style={{
    position: 'relative',
    width: '56px',
    height: '42px',
    flexShrink: 0,
    ...style,
  }}>
    {/* Record sleeves poking out (drawn first so crate overlaps their base) */}
    <div style={{
      position: 'absolute',
      top: '0px',
      left: '10px',
      width: '16px',
      height: '18px',
      backgroundColor: '#fff',
      border: '3px solid #333',
      borderRadius: '2px',
      transform: 'rotate(-6deg)',
      boxShadow: '2px 2px 0 #333',
    }}>
      <div style={{
        position: 'absolute', top: '2px', left: '2px', right: '2px',
        height: '3px', backgroundColor: color, borderRadius: '1px',
      }} />
    </div>
    <div style={{
      position: 'absolute',
      top: '-2px',
      left: '28px',
      width: '16px',
      height: '20px',
      backgroundColor: '#fff',
      border: '3px solid #333',
      borderRadius: '2px',
      transform: 'rotate(5deg)',
      boxShadow: '2px 2px 0 #333',
    }}>
      <div style={{
        position: 'absolute', top: '2px', left: '2px', right: '2px',
        height: '3px', backgroundColor: '#333', borderRadius: '1px',
      }} />
      <div style={{
        position: 'absolute', top: '7px', left: '2px', right: '2px',
        height: '3px', backgroundColor: color, borderRadius: '1px',
      }} />
    </div>

    {/* Crate body (trapezoid) */}
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '22px',
      backgroundColor: color,
      border: '3px solid #333',
      borderRadius: '3px 3px 6px 6px',
      boxShadow: '3px 3px 0px #333',
      clipPath: 'polygon(4px 0, calc(100% - 4px) 0, 100% 100%, 0 100%)',
    }} />

    {/* Horizontal plank on the crate */}
    <div style={{
      position: 'absolute',
      bottom: '8px',
      left: '4px',
      right: '4px',
      height: '3px',
      backgroundColor: '#333',
      borderRadius: '1px',
    }} />
  </div>
);

export default CrateIcon;
