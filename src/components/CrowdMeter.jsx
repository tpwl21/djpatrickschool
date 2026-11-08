import React from 'react';
import Glyph from './Glyph';
import { inkOn } from '../utils/color';

const MOMENT_LABELS = {
  opening:   { fr: 'OUVERTURE',   en: 'OPENING' },
  warmup:    { fr: 'WARMUP',      en: 'WARMUP' },
  peak:      { fr: 'PEAK',        en: 'PEAK' },
  afterpeak: { fr: 'AFTERPEAK',   en: 'AFTERPEAK' },
  closing:   { fr: 'CLOSING',     en: 'CLOSING' },
};

const SWAY_ANGLES = [-3, 4, -1, 3, -4];

const Silhouette = ({ energy, index = 0 }) => {
  const heightScale = 0.6 + 0.08 * Math.max(1, Math.min(5, energy));
  const armsUp = energy >= 4;
  const sway = energy >= 3 ? SWAY_ANGLES[index % SWAY_ANGLES.length] : 0;
  return (
    <svg width="24" height={48 * heightScale} viewBox="0 0 24 48" style={{ overflow: 'visible' }}>
      <g transform={`rotate(${sway} 12 40)`}>
        {/* Head */}
        <circle cx="12" cy="6" r="5" fill="#333" />
        {/* Body */}
        <rect x="9" y="11" width="6" height="20" fill="#333" rx="2" />
        {/* Arms */}
        {armsUp ? (
          <>
            <line x1="9"  y1="14" x2="3"  y2="2" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="14" x2="21" y2="2" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="9"  y1="14" x2="4"  y2="24" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="14" x2="20" y2="24" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {/* Legs */}
        <line x1="11" y1="31" x2="8"  y2="46" stroke="#333" strokeWidth="3" strokeLinecap="round" />
        <line x1="13" y1="31" x2="16" y2="46" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};

const CrowdMeter = ({ crowd = {}, language = 'fr', color = '#D4A017' }) => {
  const energy = Math.max(1, Math.min(5, crowd.energy || 1));
  const density = Math.max(1, Math.min(5, crowd.density || 1));
  const moment = crowd.moment || 'warmup';
  const momentLabel = MOMENT_LABELS[moment]?.[language] || moment.toUpperCase();
  const tags = crowd.vibe_tags || [];
  const desc = language === 'fr'
    ? (crowd.description_fr || crowd.description_en || '')
    : (crowd.description_en || crowd.description_fr || '');

  // 5 possible positions, populate based on density
  const silhouettes = Array.from({ length: 5 }, (_, i) => i < density);

  return (
    <div style={{
      background: '#fff', color: '#2b2b2b', border: '3px solid #333', borderRadius: 10, // carte blanche : encre fixe
      padding: '14px 18px', maxWidth: 640, margin: '0 auto',
      boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, minHeight: 72, marginBottom: 12 }}>
        {silhouettes.map((present, i) => present
          ? <Silhouette key={i} index={i} energy={energy} />
          : <div key={i} style={{ width: 24 }} />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          background: color, color: inkOn(color), padding: '3px 10px',
          borderRadius: 6, fontSize: '0.75rem', fontWeight: 900, letterSpacing: 1,
          border: '2px solid #333',
        }}>
          {momentLabel}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', fontWeight: 700 }}>
          <span>{language === 'fr' ? 'Énergie' : 'Energy'} : <b style={{ color }} aria-label={`${energy}/5`}>{Array.from({ length: energy }, (_, i) => <Glyph key={i} name="bolt" size="1em" />)}</b></span>
          <span>{language === 'fr' ? 'Densité' : 'Density'} : <b aria-label={`${density}/5`} style={{ display: 'inline-flex', gap: 3, verticalAlign: 'middle' }}>
            {Array.from({ length: density }, (_, i) => (
              <span key={i} aria-hidden="true" style={{ width: 9, height: 9, borderRadius: '50%', background: color, border: '1.5px solid #333' }} />
            ))}
          </b></span>
        </div>
      </div>

      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {tags.map((tag) => (
            <span key={tag} style={{
              background: '#f5f5f5', border: '2px solid #333', padding: '2px 8px',
              borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, color: '#333',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {desc && (
        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#444', lineHeight: 1.4 }}>
          {desc}
        </div>
      )}
    </div>
  );
};

export default CrowdMeter;
