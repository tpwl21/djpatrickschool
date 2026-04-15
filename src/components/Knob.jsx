import React, { useState, useEffect, useRef } from 'react';

const Knob = ({ label, min = -24, max = 24, value, onChange, size = 60, color = "#ff9f43" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef(null);
  
  // Convert value to angle (rotation)
  // -135deg to 135deg
  const valueToAngle = (v) => {
    const percentage = (v - min) / (max - min);
    return (percentage * 270) - 135;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const { clientY } = e;
      const rect = knobRef.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      
      // Vertical movement distance
      const dy = centerY - clientY;
      
      // Scale sensitivity
      const range = max - min;
      const step = range / 200; // 200 pixels for full range
      let newValue = value + dy * step;
      
      // Clamp
      newValue = Math.max(min, Math.min(max, newValue));
      
      if (newValue !== value) {
        onChange(newValue);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, value, min, max, onChange]);

  const angle = valueToAngle(value);

  return (
    <div className="knob-outer" style={{ width: size, textAlign: 'center' }}>
      <div 
        ref={knobRef}
        className={`knob-track ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#2d3436',
          position: 'relative',
          cursor: 'ns-resize',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5), 0 4px 15px rgba(0,0,0,0.3)',
          border: '3px solid #636e72',
          transition: 'border-color 0.2s'
        }}
      >
        <div 
          className="knob-pointer"
          style={{
            position: 'absolute',
            width: '4px',
            height: '15px',
            background: color,
            top: '5px',
            left: '50%',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: `50% ${size/2 - 5}px`,
            borderRadius: '2px',
            boxShadow: `0 0 10px ${color}`
          }}
        />
        <div 
          className="knob-center"
          style={{
            position: 'absolute',
            width: size - 14,
            height: size - 14,
            top: 7,
            left: 7,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3d3d3d 0%, #1e1e1e 100%)',
          }}
        />
      </div>
      {label && <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#ecf0f1', textTransform: 'uppercase' }}>{label}</div>}
    </div>
  );
};

export default Knob;
