import React, { useState, useEffect, useRef } from 'react';

const Fader = ({ label, min = 0, max = 1, value, onChange, height = 150, width = 40, orientation = 'vertical', color = "#74b9ff" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const faderRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateValue(e);
    e.preventDefault();
  };

  const updateValue = (e) => {
    const rect = faderRef.current.getBoundingClientRect();
    let percentage;
    
    if (orientation === 'vertical') {
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      percentage = 1 - (clientY - rect.top) / rect.height;
    } else {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      percentage = (clientX - rect.left) / rect.width;
    }
    
    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = min + (max - min) * percentage;
    onChange(newValue);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      updateValue(e);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const percentage = (value - min) / (max - min);
  const handlePos = orientation === 'vertical' ? (1 - percentage) * 100 : percentage * 100;

  return (
    <div className="fader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width }}>
      <div 
        ref={faderRef}
        className="fader-track"
        onMouseDown={handleMouseDown}
        style={{
          width: orientation === 'vertical' ? 12 : width,
          height: orientation === 'vertical' ? height : 12,
          background: '#2d3436',
          borderRadius: '6px',
          position: 'relative',
          cursor: orientation === 'vertical' ? 'ns-resize' : 'ew-resize',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)',
          border: '2px solid #636e72'
        }}
      >
        <div 
          className="fader-handle"
          style={{
            position: 'absolute',
            width: orientation === 'vertical' ? width : 30,
            height: orientation === 'vertical' ? 30 : height,
            left: orientation === 'vertical' ? -(width / 2) + 6 : `${handlePos}%`,
            top: orientation === 'vertical' ? `${handlePos}%` : -(height / 2) + 6,
            background: 'linear-gradient(to bottom, #dfe6e9 0%, #b2bec3 100%)',
            borderRadius: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            transform: orientation === 'vertical' ? 'translateY(-50%)' : 'translateX(-50%)',
            border: '1px solid #636e72',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <div style={{ width: orientation === 'vertical' ? '80%' : '2px', height: orientation === 'vertical' ? '2px' : '80%', background: color, boxShadow: `0 0 5px ${color}` }} />
        </div>
        
        {/* Glow track */}
        <div style={{
          position: 'absolute',
          [orientation === 'vertical' ? 'bottom' : 'left']: 0,
          [orientation === 'vertical' ? 'width' : 'height']: '100%',
          [orientation === 'vertical' ? 'height' : 'width']: `${percentage * 100}%`,
          background: color,
          opacity: 0.2,
          borderRadius: '4px'
        }} />
      </div>
      {label && <div style={{ marginTop: '10px', fontSize: '0.7rem', fontWeight: 'bold', color: '#ecf0f1', textTransform: 'uppercase' }}>{label}</div>}
    </div>
  );
};

export default Fader;
