import React, { useRef, useState } from 'react';

const Potard = ({ min = 0, max = 1, value = 0, centerValue = null, onChange, color = '#E67E22', size = 40, style = {} }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPRef = useRef(0);

  // Helper to convert value to visual percentage (0 to 1)
  const valToPercent = (val) => {
    if (centerValue !== null) {
      if (val <= centerValue) {
        return 0.5 * ((val - min) / (centerValue - min));
      } else {
        return 0.5 + 0.5 * ((val - centerValue) / (max - centerValue));
      }
    }
    return (val - min) / (max - min);
  };

  // Helper to convert visual percentage (0 to 1) to value
  const percentToVal = (p) => {
    if (centerValue !== null) {
      if (p <= 0.5) {
        return min + (p / 0.5) * (centerValue - min);
      } else {
        return centerValue + ((p - 0.5) / 0.5) * (max - centerValue);
      }
    }
    return min + p * (max - min);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    startPRef.current = valToPercent(value);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.clientY; // Up is positive
    
    // ~150 pixels of drag for full rotation (feels nicer)
    const newP = Math.max(0, Math.min(1, startPRef.current + (deltaY / 150))); 
    const newValue = percentToVal(newP);
    if (onChange) onChange(newValue);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    const resetVal = centerValue !== null ? centerValue : (min + max) / 2;
    if (onChange) onChange(resetVal);
  };

  const p = Math.max(0, Math.min(1, valToPercent(value)));
  const rotation = -135 + p * 270; // Map 0% to -135deg, 100% to 135deg

  // Dynamic sizing based on the 'size' prop. Default is 40.
  const innerSize = size * 0.75;
  const borderWidth = Math.round(size * 0.075);
  const markDistance = (size / 2) + Math.round(size * 0.05);

  return (
    <div 
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#333',
        borderRadius: '50%',
        border: `${borderWidth}px solid #333`,
        boxShadow: `${borderWidth}px ${borderWidth}px 0px rgba(0,0,0,0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'ns-resize',
        userSelect: 'none',
        touchAction: 'none',
        ...style
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Outer Circle that rotates */}
      <div style={{
        width: `${innerSize}px`,
        height: `${innerSize}px`,
        borderRadius: '50%',
        backgroundColor: color,
        border: `${Math.round(size * 0.05)}px solid #333`,
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}>
        {/* Indicator Line */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${Math.round(size * 0.075)}px`,
          height: `${Math.round(size * 0.25)}px`,
          backgroundColor: '#333',
          borderRadius: '2px'
        }} />
      </div>
      
      {/* Small Detail Markings around the potard */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '2px',
          height: '4px',
          backgroundColor: '#333',
          transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${markDistance}px)`,
          borderRadius: '1px'
        }} />
      ))}
    </div>
  );
};

export default Potard;
