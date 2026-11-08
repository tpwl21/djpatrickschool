import React from 'react';
import { PHRASES, NUM_PHRASES } from '../utils/workshopUtils';

const DEFAULT_A = "#3498db";
const DEFAULT_B = "#e74c3c";

const BASS_A = "#2ecc71";
const BASS_B = "#e67e22";

const SimplifiedTimeline = ({ levelId, currentPhraseIdx, progress, totalPhrases = 8 }) => {
  const isBassLevel = levelId === 'EQ_LEVEL_2';
  const isHybridLevel = levelId === 'EQ_LEVEL_3';

  // Standard Colors
  const COLOR_A = isBassLevel ? BASS_A : DEFAULT_A;
  const COLOR_B = isBassLevel ? BASS_B : DEFAULT_B;

  return (
    <div style={{
      width: '100%',
      padding: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Category Labels (INTRO / MIX / OUTRO) */}
      {!isHybridLevel && (
        <div style={{ display: 'flex', width: '100%', marginBottom: '-4px' }}>
            <div style={{ flex: 4, textAlign: 'center', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '2px' }}><span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, background: COLOR_A, border: '2px solid #333', borderRadius: 2, marginRight: 6, verticalAlign: '-1px' }} />INTRO (PURE A)</div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '2px', background: 'color-mix(in srgb, var(--text) 12%, transparent)', borderRadius: '4px' }}>THE MIX</div>
            <div style={{ flex: 3, textAlign: 'center', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '2px' }}><span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, background: COLOR_B, border: '2px solid #333', borderRadius: 2, marginRight: 6, verticalAlign: '-1px' }} />OUTRO (PURE B)</div>
        </div>
      )}

      {isHybridLevel && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '1px' }}><span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, background: DEFAULT_A, border: '2px solid #333', borderRadius: 2, marginRight: 6, verticalAlign: '-1px' }} />VOLUME FDR</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '1px' }}><span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, background: BASS_A, border: '2px solid #333', borderRadius: 2, marginRight: 6, verticalAlign: '-1px' }} />BASS EQ</div>
          </div>
      )}

      <div style={{
        width: '100%',
        height: isHybridLevel ? '36px' : '24px',
        background: '#111',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        border: '3px solid #222',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Phrase Blocks */}
        {Array.from({ length: totalPhrases }).map((_, i) => {
            const isMix = i === 4;
            const isIntro = i < 4;
            const isOutro = i > 4;
            const isActive = currentPhraseIdx === i;
            const p = PHRASES[i % NUM_PHRASES];

            const getBg = (a, b) => {
                if (isIntro) return a;
                if (isOutro) return b;
                return `linear-gradient(90deg, ${a} 0%, ${b} 100%)`;
            };

            return (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${(i / totalPhrases) * 100}%`,
                    width: `${(1 / totalPhrases) * 100}%`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isActive ? 1 : 0.35,
                    borderRight: '1px solid rgba(0,0,0,0.2)',
                    transition: 'opacity 0.3s'
                }}>
                    {/* Top Layer: Volume / Mix */}
                    <div style={{
                        flex: 1,
                        background: getBg(DEFAULT_A, DEFAULT_B),
                        boxShadow: isActive ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'
                    }} />
                    
                    {/* Bottom Layer: Bass (Only if hybrid or bass focus) */}
                    {(isHybridLevel || isBassLevel) && (
                        <div style={{
                            flex: 1,
                            background: getBg(isHybridLevel ? BASS_A : COLOR_A, isHybridLevel ? BASS_B : COLOR_B),
                            borderTop: isHybridLevel ? '1px solid rgba(0,0,0,0.2)' : 'none',
                            boxShadow: isActive ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'
                        }} />
                    )}

                    {/* Label Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        color: '#fff',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        zIndex: 5
                    }}>
                        {p.name}
                    </div>
                </div>
            )
        })}

        {/* Current Progress Pointer */}
        <div style={{
            position: 'absolute',
            left: `${((currentPhraseIdx + progress) / totalPhrases) * 100}%`,
            top: 0,
            bottom: 0,
            width: '4px',
            background: '#fff',
            zIndex: 10,
            boxShadow: '0 0 15px #fff',
            border: '1px solid #000'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              PROGRESS: {Math.round(((currentPhraseIdx + progress) / totalPhrases) * 100)}%
          </div>
          {currentPhraseIdx === 4 && (
              <div style={{ 
                  background: isHybridLevel ? 'linear-gradient(45deg, #3498db, #2ecc71, #e74c3c, #e67e22)' : `linear-gradient(90deg, ${COLOR_A}, ${COLOR_B})`,
                  color: '#fff', padding: '4px 15px', 
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900',
                  animation: 'pulse 0.8s infinite',
                  boxShadow: `0 0 15px rgba(255,255,255,0.3)`,
                  border: '1px solid rgba(255,255,255,0.3)',
                  textTransform: 'uppercase'
              }}>
                  {isHybridLevel ? "HYBRID SWAP: FDR + BASS" : isBassLevel ? "MORPHING BASS..." : "MORPHING COLORS..."}
              </div>
          )}
      </div>

      <style>{`
          @keyframes pulse {
              0% { transform: scale(1); filter: brightness(1); }
              50% { transform: scale(1.05); filter: brightness(1.2); }
              100% { transform: scale(1); filter: brightness(1); }
          }
      `}</style>
    </div>
  );
};

export default SimplifiedTimeline;
