import React from 'react';
import TrackPreviewPlayer from './TrackPreviewPlayer';

const Fiche = ({ candidate }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 10px',
    fontSize: '0.7rem', color: '#333', marginTop: 6,
  }}>
    {candidate.bpm != null && (<><b>BPM</b><span>{candidate.bpm}</span></>)}
    {candidate.key && (<><b>Key</b><span>{candidate.key}</span></>)}
    {candidate.genre && (<><b>Genre</b><span>{candidate.genre}</span></>)}
    {candidate.style && (<><b>Style</b><span>{candidate.style}</span></>)}
    {candidate.label && (<><b>Label</b><span>{candidate.label}</span></>)}
    {candidate.year != null && (<><b>Year</b><span>{candidate.year}</span></>)}
    {candidate.country && (<><b>Country</b><span>{candidate.country}</span></>)}
    {candidate.format && (<><b>Format</b><span>{candidate.format}</span></>)}
    {candidate.energy != null && (<><b>Energy</b><span>{'⚡'.repeat(Math.max(1, candidate.energy))}</span></>)}
  </div>
);

const Crate = ({
  candidates,
  showFiches,
  activePreviewIdx,
  onPreview,
  onStopPreview,
  onSelect,
  selectColor = '#27ae60',
}) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.min(candidates.length, 4)}, 1fr)`,
    gap: 12, padding: '12px 16px', maxWidth: 900, margin: '0 auto',
  }}>
    {candidates.map((c, i) => (
      <div
        key={i}
        style={{
          background: '#fff', border: '3px solid #333', borderRadius: 8,
          padding: 10, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 8, boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{
          width: 60, height: 60, background: '#eee', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 900, color: '#999',
        }}>
          {c.title ? c.title[0].toUpperCase() : '?'}
        </div>
        <div style={{ fontWeight: 900, textAlign: 'center', fontSize: '0.85rem' }}>
          {showFiches ? c.title : `Candidate ${i + 1}`}
        </div>
        <TrackPreviewPlayer
          isActive={activePreviewIdx === i}
          onPlay={() => onPreview(i)}
          onStop={onStopPreview}
        />
        {showFiches && <Fiche candidate={c} />}
        <button
          onClick={() => onSelect(i)}
          style={{
            marginTop: 'auto', padding: '6px 14px', fontWeight: 900,
            background: selectColor, color: '#fff', border: '3px solid #333',
            borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
          }}
        >
          SELECT
        </button>
      </div>
    ))}
  </div>
);

export default Crate;
