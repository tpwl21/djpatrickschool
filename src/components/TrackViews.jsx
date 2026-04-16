import React from 'react';
import { motion } from 'framer-motion';
import { 
  BEATS_PER_LOOP, 
  LOOP_COLORS 
} from '../utils/workshopUtils';


/**
 * Colored loop bands + wagons on top.
 * Used primarily in Level 4.
 */
export const LoopTrackView = React.forwardRef(({ wagons, bpm, pitch = 1.0, zoomLevel = 100, trackLengthSec }, ref) => {
  const effectiveZoom = zoomLevel / pitch;
  const secPerBeat = 60 / bpm;
  const secPerLoop = secPerBeat * BEATS_PER_LOOP;
  const numLoops = Math.ceil(trackLengthSec / secPerLoop);

  const EXT_LOOP_COLORS = [
    'rgba(255, 159, 67, 0.25)',   // orange
    'rgba(78, 205, 196, 0.25)',   // teal
    'rgba(52, 152, 219, 0.25)',   // blue
    'rgba(162, 155, 254, 0.25)',  // purple
  ];

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={ref}
        style={{ position: 'absolute', left: '50%', transform: 'translateX(0px)', height: '100%', top: 0, willChange: 'transform' }}
      >
        {/* Layer 1: Loop color bands */}
        {Array.from({ length: numLoops }).map((_, i) => (
          <div key={`loop-${i}`} style={{
            position: 'absolute',
            left: `${i * secPerLoop * effectiveZoom}px`,
            top: '2px',
            bottom: '2px',
            width: `${secPerLoop * effectiveZoom - 3}px`,
            backgroundColor: EXT_LOOP_COLORS[i % EXT_LOOP_COLORS.length],
            borderRadius: '10px',
            border: '2px solid rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingLeft: '6px',
            paddingTop: '4px',
            zIndex: 1,
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#33333399' }}>
              Loop {i + 1}
            </span>
          </div>
        ))}

        {/* Layer 2: Beat wagons */}
        {wagons.map((w) => {
          const beatWidth = secPerBeat * effectiveZoom;
          let wagonWidth = 36;
          let bgColor = '#4ecdc4';
          let icon = '🎵';
          let top = '50%';
          let marginTop = '-18px';
          let height = '36px';

          if (w.isKick)       { bgColor = '#ff9f43'; icon = 'K'; }
          else if (w.isSnare) { bgColor = '#3498db'; icon = 'S'; }
          else if (w.isHat)   { wagonWidth = 18; bgColor = '#f1c40f'; icon = 'H'; height = '18px'; marginTop = '-9px'; }

          return (
            <div key={w.id} style={{
              position: 'absolute',
              left: `${(w.index * beatWidth) - (wagonWidth / 2)}px`,
              top, marginTop,
              width: `${wagonWidth}px`,
              height,
              backgroundColor: bgColor,
              border: '3px solid #333',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: w.isHat ? '0.5rem' : '0.75rem',
              boxShadow: '2px 2px 0px #333',
              zIndex: 2,
            }}>
              <span style={{ fontWeight: 'bold' }}>{icon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Phrase blocks + loop dividers + wagons.
 * Used in Levels 5, 6, 7.
 */
export const PhraseTrackView = React.forwardRef(({ phraseBlocks, wagons, bpm, pitch = 1.0, zoomLevel = 100 }, ref) => {
  const effectiveZoom = zoomLevel / pitch;
  const secPerBeat = 60 / bpm;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={ref}
        style={{ position: 'absolute', left: '50%', transform: 'translateX(0px)', height: '100%', top: 0, willChange: 'transform' }}
      >
        {phraseBlocks.map((block) => {
          const widthPx = block.durationSec * effectiveZoom;
          const leftPx = block.startSec * effectiveZoom;
          return (
            <div key={block.id} style={{
              position: 'absolute',
              left: `${leftPx}px`,
              top: '2px', bottom: '2px',
              width: `${widthPx - 4}px`,
              backgroundColor: block.phrase.color,
              borderRadius: '12px',
              border: '2px solid rgba(0,0,0,0.2)',
              overflow: 'hidden',
              zIndex: 1,
            }}>
              <div style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
                {block.phrase.emoji} {block.phrase.name}
              </div>
              {Array.from({ length: block.numLoops }).map((_, li) => {
                const loopWidthPx = block.secPerLoop * effectiveZoom;
                return (
                  <div key={li} style={{
                    position: 'absolute',
                    left: `${li * loopWidthPx}px`,
                    top: 0, bottom: 0,
                    width: `${loopWidthPx - 2}px`,
                    backgroundColor: LOOP_COLORS[li % LOOP_COLORS.length],
                    borderRight: '1px dashed rgba(0,0,0,0.2)',
                  }}>
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '0.55rem', color: '#33333388' }}>
                      L{li + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
        {wagons.map((w) => {
          const beatWidth = secPerBeat * effectiveZoom;
          let wagonWidth = 32;
          let bgColor = '#4ecdc4';
          let icon = 'M';
          let top = '50%';
          let marginTop = '-16px';
          let height = '32px';
          if (w.isKick)       { bgColor = '#ff9f43'; icon = 'K'; }
          else if (w.isSnare) { bgColor = '#3498db'; icon = 'S'; }
          else if (w.isHat)   { wagonWidth = 16; bgColor = '#f1c40f'; icon = 'H'; height = '16px'; marginTop = '-8px'; }
          return (
            <div key={w.id} style={{
              position: 'absolute',
              left: `${(w.index * beatWidth) - (wagonWidth / 2)}px`,
              top, marginTop,
              width: `${wagonWidth}px`,
              height,
              backgroundColor: bgColor,
              border: '2px solid #333',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: w.isHat ? '0.45rem' : '0.65rem',
              boxShadow: '2px 2px 0px #333',
              zIndex: 2,
            }}>
              <span style={{ fontWeight: 'bold' }}>{icon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});


/**
 * Text indicator showing current phrase.
 */
export const PhraseIndicator = ({ label, currentPhrase, isOutro = false }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 14px', borderRadius: '20px',
    backgroundColor: isOutro ? '#a29bfe' : '#e9ecef',
    border: `2px solid ${isOutro ? '#6c5ce7' : '#ccc'}`,
    fontWeight: 'bold', fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  }}>
    {label}: {currentPhrase ? `${currentPhrase.emoji} ${currentPhrase.name}` : '—'}
  </div>
);
