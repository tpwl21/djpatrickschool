import React, { useRef, useEffect, useState } from 'react';

const PitchFaderLabel = ({ label, value }) => (
  <div style={{
    position: 'absolute',
    left: '50px',
    top: value,
    transform: 'translateY(-50%)',
    backgroundColor: '#fff',
    border: '2px solid #333',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.1)'
  }}>
    {label}
  </div>
);

const PitchFader = ({ 
  min, max, value, onChange, label = "PITCH", orientation = "vertical",
  trackWidth = 44, trackLength = 260, handleSize = 60, handleColor = '#ffbb44',
  invertVertical = false, hideRail = false, resetValue = null
}) => {
  const faderRef = useRef(null);
  const dragRectRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const percent = (value - min) / (max - min);
  
  const handleDoubleClick = (e) => {
    e.preventDefault();
    const finalReset = resetValue !== null ? resetValue : (min + max) / 2;
    onChange(finalReset);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !faderRef.current) return;
    const rect = dragRectRef.current || faderRef.current.getBoundingClientRect();
    let newPercent;
    
    if (orientation === 'vertical') {
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      newPercent = invertVertical ? 1 - (y / rect.height) : (y / rect.height);
    } else {
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      newPercent = x / rect.width;
    }
    
    const newValue = min + newPercent * (max - min);
    onChange(newValue);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    
    const rect = faderRef.current.getBoundingClientRect();
    dragRectRef.current = rect;
    
    let newPercent;
    if (orientation === 'vertical') {
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      newPercent = invertVertical ? 1 - (y / rect.height) : (y / rect.height);
    } else {
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      newPercent = x / rect.width;
    }
    const newValue = min + newPercent * (max - min);
    onChange(newValue);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    dragRectRef.current = null;
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className="pitch-fader-wrapper" 
      onDoubleClick={handleDoubleClick}
      style={{
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      alignItems: 'center',
      gap: '15px',
      userSelect: 'none',
      touchAction: 'none',
      width: isVertical ? 'auto' : '100%',
      padding: '10px'
    }}>
      {label && <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#333', letterSpacing: '1px' }}>{label}</div>}
      
      <div 
        ref={faderRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: isVertical ? (typeof trackWidth === 'string' ? trackWidth : `${trackWidth}px`) : (typeof trackLength === 'string' ? trackLength : `${trackLength}px`),
          height: isVertical ? (typeof trackLength === 'string' ? trackLength : `${trackLength}px`) : (typeof trackWidth === 'string' ? trackWidth : `${trackWidth}px`),
          background: hideRail ? 'transparent' : '#f0f0f0',
          border: hideRail ? 'none' : '4px solid #333',
          borderRadius: '12px',
          position: 'relative',
          cursor: isVertical ? 'ns-resize' : 'ew-resize',
          boxShadow: hideRail ? 'none' : 'inset 4px 4px 0 rgba(0,0,0,0.1)',
          backgroundImage: hideRail ? 'none' : (isVertical 
            ? 'linear-gradient(to bottom, #ddd 1px, transparent 1px)' 
            : 'linear-gradient(to right, #ddd 1px, transparent 1px)'),
          backgroundSize: isVertical ? '100% 20px' : '20px 100%'
        }}
      >
        {/* The "Rail" Line */}
        <div style={{
          position: 'absolute',
          left: isVertical ? '50%' : '10px',
          right: isVertical ? 'auto' : '10px',
          top: isVertical ? '10px' : '50%',
          bottom: isVertical ? '10px' : 'auto',
          width: isVertical ? '4px' : 'auto',
          height: isVertical ? 'auto' : '4px',
          background: hideRail ? '#999' : '#444',
          transform: isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
          borderRadius: '2px',
          opacity: hideRail ? 0.8 : 0.5
        }} />

        {/* Central Marker (0%) */}
        {!hideRail && <div style={{
          position: 'absolute',
          top: isVertical ? '50%' : '-5px',
          bottom: isVertical ? 'auto' : '-5px',
          left: isVertical ? '-5px' : '50%',
          right: isVertical ? '-5px' : 'auto',
          width: isVertical ? 'auto' : '4px',
          height: isVertical ? '4px' : 'auto',
          background: '#333',
          opacity: 0.5,
          borderRadius: '2px',
          transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)'
        }} />}

        {/* The Handle (The "Wagon" Lever) */}
        <div style={{
          position: 'absolute',
          left: isVertical ? '50%' : `${percent * 100}%`,
          top: isVertical ? `${(invertVertical ? 1 - percent : percent) * 100}%` : '50%',
          width: isVertical ? `${handleSize}px` : `${trackWidth}px`,
          height: isVertical ? `${trackWidth}px` : `${handleSize}px`,
          background: handleColor,
          border: '4px solid #333',
          borderRadius: '10px',
          transform: 'translate(-50%, -50%)',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          transition: isDragging ? 'none' : 'all 0.1s ease-out',
          zIndex: 10
        }}>
          {/* Grip lines */}
          <div style={{ width: isVertical ? '24px' : '3px', height: isVertical ? '3px' : '24px', background: '#333', margin: '3px', opacity: 0.3 }} />
          <div style={{ width: isVertical ? '24px' : '3px', height: isVertical ? '3px' : '24px', background: '#333', margin: '3px', opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
};

export default PitchFader;
