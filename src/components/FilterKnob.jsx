import React from 'react';
import Potard from './Potard';

const FilterKnob = ({
  value,
  onChange,
  color = '#e74c3c',
  size = 55,
  label = 'FILTER',
  showLabel = true,
  labelColor = '#fff',
  labelFontSize = '0.7rem',
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    {showLabel && (
      <span style={{ fontSize: labelFontSize, color: labelColor, fontWeight: 900, letterSpacing: 1 }}>
        {label}
      </span>
    )}
    <Potard
      size={size}
      min={-1}
      max={1}
      centerValue={0}
      value={value}
      onChange={onChange}
      color={color}
    />
    <div style={{ display: 'flex', gap: 18, fontSize: '0.55rem', color: labelColor, opacity: 0.7, marginTop: 2 }}>
      <span>LO</span><span>HI</span>
    </div>
  </div>
);

export default FilterKnob;
