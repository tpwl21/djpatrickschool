import { useContext, useState } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import PitchFader from './PitchFader';
import MasterTempoSwitch from './MasterTempoSwitch';
import { rateToSemitones } from '../lib/keys';
import { inkOn } from '../utils/color';

// Shared pitch control block: optional master-tempo switch on top, optional target-BPM badge,
// a vertical (or horizontal) PitchFader, and a user-toggleable readout (BPM / % / semitones).
//
// Used by Harmonies, Secret Booth, and Beatmatching. See docs/UI_COMPONENTS.md.
//
// Minimum contract:
//   <PitchBlock nativeBpm={120} rate={pitch} onRateChange={setPitch} />
//
// Opt-ins (all optional):
//   targetBpm             — shows "Cible: X BPM" above the fader; BPM readout turns green when |effBpm - targetBpm| < targetToleranceBpm.
//   keyLock + onKeyLockChange — renders MasterTempoSwitch at the top.
//   showBpm (default true) / showPercent (default true) / showSemitones (default false) — which modes are available.
//     When multiple modes are available a small toggle lets the user switch between them.
//     When showBpm=false (ear-training levels) only % is shown — no toggle.
//   percentBaseline (default 1) — anchor rate for the % display. Used when the "zero" isn't the native rate (beatmatching randomizes initial BPM).
//   bpmColor / percentColor — strings or (effBpm|rate) => string. Override the default colors.
//   boxed / disabled       — card wrapper + greyed-out + click-locked.
//
const PitchBlock = ({
  nativeBpm,
  rate,
  onRateChange,
  targetBpm = null,
  targetToleranceBpm = 0.5,
  keyLock,
  onKeyLockChange,
  keyLockHighlight = false,
  orientation = 'vertical',
  trackLength = 200,
  color = '#8E44AD',
  label = '',
  showBpm = true,
  showPercent = true,
  showSemitones = false,
  showTargetBadge,
  percentBaseline = 1,
  bpmColor,
  percentColor,
  boxed = false,
  disabled = false,
}) => {
  const { language } = useContext(LanguageContext);
  const bpm = nativeBpm || 120;
  const effBpm = bpm * rate;
  const synced = targetBpm != null && Math.abs(effBpm - targetBpm) < targetToleranceBpm;
  const showMasterTempo = typeof keyLock === 'boolean' && typeof onKeyLockChange === 'function';
  const showBadge = showTargetBadge ?? (targetBpm != null);

  const resolvedBpmColor = typeof bpmColor === 'function' ? bpmColor(effBpm)
    : bpmColor ?? (synced ? '#27ae60' : color);

  const pctFromBaseline = (rate - percentBaseline) * 100;
  const resolvedPercentColor = typeof percentColor === 'function' ? percentColor(rate)
    : percentColor ?? color;

  // Pastille de lecture : fond = couleur de signal, texte encre ou blanc selon la luminance (lisible sur tous les thèmes)
  const readoutStyle = (bg) => ({
    fontWeight: 900, fontSize: '1rem', padding: '2px 10px', borderRadius: 10,
    border: '2px solid #333', background: bg, color: inkOn(bg),
    fontVariantNumeric: 'tabular-nums',
  });

  const availableModes = [
    showBpm && 'bpm',
    showPercent && 'percent',
    showSemitones && 'semitones',
  ].filter(Boolean);

  const [activeMode, setActiveMode] = useState(availableModes[0] ?? null);

  const boxStyle = boxed
    ? {
        padding: '10px 14px', border: '3px solid #333', borderRadius: 18,
        background: '#fafafa', boxShadow: '6px 6px 0 rgba(0,0,0,0.08)',
      }
    : {};

  return (
    <div
      className="pitch-block"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...boxStyle,
      }}
    >
      {showMasterTempo && (
        <MasterTempoSwitch
          value={keyLock}
          onChange={onKeyLockChange}
          color={color}
          highlight={keyLockHighlight}
        />
      )}
      {showBadge && (
        <div style={{
          padding: '4px 10px', background: '#333', color: '#fff', borderRadius: '10px',
          fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap',
        }}>
          {language === 'fr' ? 'Cible' : 'Target'}: {Number(targetBpm).toFixed(1)} BPM
        </div>
      )}
      <PitchFader
        min={bpm - 25}
        max={bpm + 25}
        value={effBpm}
        onChange={(val) => onRateChange(val / bpm)}
        orientation={orientation}
        trackLength={trackLength}
        handleColor={color}
        label={label}
        ariaLabel={label || 'Pitch'}
      />
      {activeMode && (
        <div style={{ display: 'flex', flexDirection: orientation === 'horizontal' ? 'row' : 'column', alignItems: 'center', marginTop: 4, gap: orientation === 'horizontal' ? 8 : 4 }}>
          {activeMode === 'bpm' && (
            <div style={readoutStyle(resolvedBpmColor)}>
              {effBpm.toFixed(1)} BPM
            </div>
          )}
          {activeMode === 'percent' && (
            <div style={readoutStyle(resolvedPercentColor)}>
              {pctFromBaseline >= 0 ? '+' : ''}{pctFromBaseline.toFixed(1)}%
            </div>
          )}
          {activeMode === 'semitones' && (
            <div style={readoutStyle(resolvedPercentColor)}>
              {rateToSemitones(rate) >= 0 ? '+' : ''}{rateToSemitones(rate).toFixed(2)} st
            </div>
          )}
          {availableModes.length > 1 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {availableModes.map(mode => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  style={{
                    background: mode === activeMode ? color : 'transparent',
                    border: `1px solid ${mode === activeMode ? color : 'currentColor'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: mode === activeMode ? inkOn(color) : 'inherit', // hérite du conteneur : carte claire ou fond du thème
                    opacity: mode === activeMode ? 1 : 0.75,
                    padding: '1px 5px',
                    lineHeight: 1.4,
                  }}
                >
                  {mode === 'bpm' ? 'BPM' : mode === 'percent' ? '%' : 'st'}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PitchBlock;
