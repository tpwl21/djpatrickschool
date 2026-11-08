import React from 'react';
import PitchFader from './PitchFader';
import Potard from './Potard';

const EQ_BANDS = ['high', 'mid', 'low'];
const DEFAULT_EQ_LABELS = { high: 'HI', mid: 'MID', low: 'LOW' };

export const EqKnobs = ({
  values,
  onChange,
  color,
  size = 45,
  gap = 12,
  labels = DEFAULT_EQ_LABELS,
  showLabels = true,
  labelFontSize = '0.7rem',
  labelColor = 'currentColor', // hérite du texte du conteneur (thème) ; le Booth passe sa propre couleur
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center' }}>
    {EQ_BANDS.map((band) => (
      <div key={band} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {showLabels && (
          <span style={{
            fontSize: labelFontSize, fontWeight: 900, color: labelColor,
            marginBottom: '4px', letterSpacing: '1px',
          }}>
            {labels[band]}
          </span>
        )}
        <Potard
          size={size}
          min={-24}
          max={6}
          centerValue={0}
          value={values[band]}
          onChange={(v) => onChange(band, v)}
          color={color}
          ariaLabel={`EQ ${labels[band]}`}
        />
      </div>
    ))}
  </div>
);

export const GainKnob = ({ value, onChange, color, size = 35, label = 'TRIM', showLabel = true, labelColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {showLabel && (
      <span style={{
        fontSize: '0.7rem', color: labelColor || color, fontWeight: 900,
        marginBottom: '2px', letterSpacing: '1px',
      }}>
        {label}
      </span>
    )}
    <Potard size={size} min={0} max={2} value={value} onChange={onChange} color={color} ariaLabel={label} />
  </div>
);

export const VolumeFader = ({
  value,
  onChange,
  handleColor = '#ff9f43',
  trackWidth = 40,
  trackLength = 180,
  handleSize = 55,
  label = 'VOL',
  showLabel = true,
  labelColor = 'currentColor',
  labelSize = '1.2rem',
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {showLabel && (
      <span style={{
        fontSize: labelSize, fontWeight: 900, color: labelColor,
        marginBottom: '8px',
      }}>
        {label}
      </span>
    )}
    <PitchFader
      min={0}
      max={1}
      value={value}
      onChange={onChange}
      orientation="vertical"
      invertVertical
      trackWidth={trackWidth}
      trackLength={trackLength}
      handleSize={handleSize}
      handleColor={handleColor}
      resetValue={1}
      label=""
      ariaLabel={label || 'Volume'}
    />
  </div>
);

export const Crossfader = ({
  value,
  onChange,
  trackWidth = 40,
  trackLength = '100%',
  handleSize = 60,
  handleColor = '#e74c3c',
}) => (
  <PitchFader
    min={0}
    max={1}
    value={value}
    onChange={onChange}
    orientation="horizontal"
    trackWidth={trackWidth}
    trackLength={trackLength}
    handleSize={handleSize}
    handleColor={handleColor}
    resetValue={0.5}
    label=""
    ariaLabel="Crossfader"
  />
);
