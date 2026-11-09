import { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import PitchBlock from './PitchBlock';
import LoadingLabel from './LoadingLabel';

// Generic deck card used in workshop UIs.
// Mirrors the organisation of SecretBooth's DeckUI:
//   header (DECK label + key) → title → BPM → optional PitchBlock → transport buttons.
//
// Pitch section is shown when `onRateChange` is provided.
// All pitch-related props are forwarded to PitchBlock as-is.
const DeckCard = ({
  side,
  title,
  nativeBpm,
  effectiveBpm,
  keyLabel,
  isPlaying,
  isLoading,
  disabled = false,
  onPlay,
  onCue,
  onSync,
  color = '#8E44AD',
  // Pitch (optional — shown only when onRateChange is provided)
  rate,
  onRateChange,
  targetBpm,
  targetToleranceBpm,
  keyLock,
  onKeyLockChange,
  keyLockHighlight,
  showSemitones,
  showBpm,
}) => {
  const { t } = useContext(LanguageContext);
  const hasPitch = typeof onRateChange === 'function';
  const bpmDisplay = effectiveBpm != null
    ? (typeof effectiveBpm === 'number' ? effectiveBpm.toFixed(1) : effectiveBpm)
    : '—';

  return (
    <div style={{
      minWidth: 220, padding: '12px 16px',
      border: '4px solid #333', borderRadius: 20,
      background: '#fafafa', color: '#2b2b2b', boxShadow: '6px 6px 0 rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', gap: 6,
      opacity: isLoading ? 0.7 : 1,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>DECK {side}</h3>
        {keyLabel && (
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color }}>{keyLabel}</span>
        )}
      </div>

      {/* Track info */}
      <div style={{ fontSize: '1rem', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title || '—'}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
        {bpmDisplay} BPM
      </div>

      {/* Pitch block */}
      {hasPitch && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
          <PitchBlock
            nativeBpm={nativeBpm}
            rate={rate}
            onRateChange={onRateChange}
            targetBpm={targetBpm}
            targetToleranceBpm={targetToleranceBpm}
            keyLock={keyLock}
            onKeyLockChange={onKeyLockChange}
            keyLockHighlight={keyLockHighlight}
            color={color}
            showSemitones={showSemitones}
            showBpm={showBpm}
            disabled={disabled}
            trackLength={140}
          />
        </div>
      )}

      {/* Transport buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button
          className="btn-crayon play-btn"
          onClick={onPlay}
          disabled={isPlaying || isLoading || disabled}
          style={{ flex: 2, background: isPlaying ? '#95a5a6' : '#2ecc71', color: '#2b2b2b', fontSize: '0.8rem', padding: '6px 10px' }}
        >
          {isLoading ? <LoadingLabel compact /> : (isPlaying ? (t('booth.controls.pause') || 'PLAYING') : (t('booth.controls.play') || 'PLAY'))}
        </button>
        <button
          className="btn-crayon"
          onClick={onCue}
          disabled={isLoading || disabled}
          style={{ flex: 1, background: '#f1c40f', color: '#2b2b2b', fontSize: '0.8rem', padding: '6px 10px' }}
        >
          {t('booth.controls.cue') || 'CUE'}
        </button>
        {onSync && (
          <button
            className="btn-crayon"
            onClick={onSync}
            disabled={isLoading || disabled}
            style={{ flex: 1, background: color, color: '#fff', fontSize: '0.8rem', padding: '6px 10px' }}
          >
            SYNC
          </button>
        )}
      </div>
    </div>
  );
};

export default DeckCard;
