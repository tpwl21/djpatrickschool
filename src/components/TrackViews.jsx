import React from 'react';
import { motion } from 'framer-motion';
import { Wagon } from './Train';
import Locomotive from './Locomotive';
import { 
  BEATS_PER_LOOP, 
  LOOP_COLORS 
} from '../utils/workshopUtils';


/**
 * Colored loop bands + wagons on top.
 * Used primarily in Level 4.
 */
export const LoopTrackView = React.forwardRef(({ wagons, bpm, pitch = 1.0, zoomLevel = 100, trackLengthSec, markers = [] }, ref) => {
  const effectiveZoom = zoomLevel / pitch;
  const scale = zoomLevel / 100;
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
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        ref={ref}
        style={{ position: 'absolute', left: '50%', transform: 'translateX(0px)', willChange: 'transform' }}
      >
        {/* The Engine */}
        <div style={{
          position: 'absolute',
          left: `${-85 * scale}px`, 
          top: `${-25 * scale}px`, 
          zIndex: 2,
          transform: `scale(${scale})`,
          transformOrigin: 'left center'
        }}>
          <Locomotive color="#ff6b6b" />
        </div>
        {/* Layer 1: Loop color bands */}
        {Array.from({ length: numLoops }).map((_, i) => (
          <div key={`loop-${i}`} style={{
            position: 'absolute',
            left: `${i * secPerLoop * effectiveZoom}px`,
            top: scale >= 1 ? '-40px' : '-35px',
            height: scale >= 1 ? '80px' : '70px',
            width: `${secPerLoop * effectiveZoom - 3}px`,
            backgroundColor: EXT_LOOP_COLORS[i % EXT_LOOP_COLORS.length],
            borderRadius: `${10 * scale}px`,
            border: `${2 * scale}px solid rgba(0,0,0,0.15)`,
            zIndex: 1,
          }} />
        ))}

        {/* Layer 2: Beat wagons */}
        {wagons.map((w) => {
          const beatWidth = secPerBeat * effectiveZoom;
          return <Wagon key={w.id} w={w} scale={scale} beatWidth={beatWidth} />;
        })}

        {/* Layer 3: Loop Labels */}
        {Array.from({ length: numLoops }).map((_, i) => (
          <div key={`loop-label-${i}`} style={{
            position: 'absolute',
            left: `${i * secPerLoop * effectiveZoom + 8}px`,
            top: scale >= 1 ? '-36px' : '-30px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            color: '#333333BB',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            Loop {i + 1}
          </div>
        ))}

        {/* Layer 4: Target Markers */}
        {markers.map((m, i) => {
          const leftPx = (m.beat - 1) * secPerBeat * effectiveZoom;
          return (
            <div key={`marker-${i}`} style={{
              position: 'absolute',
              left: `${leftPx}px`,
              top: '-60px',
              height: '120px',
              width: '4px',
              backgroundColor: m.color || '#e74c3c',
              zIndex: 15,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                backgroundColor: m.color || '#e74c3c',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: '900',
                whiteSpace: 'nowrap',
                marginTop: '-25px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {m.label}
              </div>
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
export const PhraseTrackView = React.forwardRef(({ phraseBlocks, wagons, bpm, pitch = 1.0, zoomLevel = 100, markers = [] }, ref) => {
  const effectiveZoom = zoomLevel / pitch;
  const scale = zoomLevel / 100;
  const secPerBeat = 60 / bpm;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        ref={ref}
        style={{ position: 'absolute', left: '50%', transform: 'translateX(0px)', willChange: 'transform' }}
      >
        {/* The Engine */}
        <div style={{
          position: 'absolute',
          left: `${-85 * scale}px`, 
          top: `${-25 * scale}px`, 
          zIndex: 2,
          transform: `scale(${scale})`,
          transformOrigin: 'left center'
        }}>
          <Locomotive color="#ff6b6b" />
        </div>
        {/* Layer 1: Phrase blocks + loops */}
        {phraseBlocks.map((block) => {
          const widthPx = block.durationSec * effectiveZoom;
          const leftPx = block.startSec * effectiveZoom;
          return (
            <div key={block.id} style={{
              position: 'absolute',
              left: `${leftPx}px`,
              top: scale >= 1 ? '-40px' : '-35px',
              height: scale >= 1 ? '80px' : '70px',
              width: `${widthPx - 4}px`,
              backgroundColor: block.phrase.color,
              borderRadius: `${12 * scale}px`,
              border: `${2 * scale}px solid rgba(0,0,0,0.2)`,
              overflow: 'hidden',
              zIndex: 1,
            }}>
              {Array.from({ length: block.numLoops }).map((_, li) => {
                const loopWidthPx = block.secPerLoop * effectiveZoom;
                return (
                  <div key={li} style={{
                    position: 'absolute',
                    left: `${li * loopWidthPx}px`,
                    top: 0, bottom: 0,
                    width: `${loopWidthPx - 2}px`,
                    backgroundColor: LOOP_COLORS[li % LOOP_COLORS.length],
                    borderRight: `${1 * scale}px dashed rgba(0,0,0,0.2)`,
                  }}>
                    <span style={{ position: 'absolute', bottom: `${4 * scale}px`, left: `${4 * scale}px`, fontSize: `${0.55 * Math.max(0.8, scale)}rem`, color: '#33333388' }}>
                      L{li + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Layer 2: Beat wagons */}
        {wagons.map((w) => {
          const beatWidth = secPerBeat * effectiveZoom;
          return <Wagon key={w.id} w={w} scale={scale} beatWidth={beatWidth} />;
        })}

        {/* Layer 3: Phrase Labels */}
        {phraseBlocks.map((block) => {
          const leftPx = block.startSec * effectiveZoom;
          return (
            <div key={`phrase-label-${block.id}`} style={{
              position: 'absolute',
              left: `${leftPx + 10}px`,
              top: scale >= 1 ? '-36px' : '-32px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: '#333',
              zIndex: 10,
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}>
              {block.phrase.emoji} {block.phrase.name}
            </div>
          );
        })}

        {/* Layer 4: Target Markers */}
        {markers.map((m, i) => {
          const leftPx = (m.beat - 1) * (60 / bpm) * effectiveZoom;
          return (
            <div key={`marker-${i}`} style={{
              position: 'absolute',
              left: `${leftPx}px`,
              top: '-60px',
              height: '120px',
              width: '4px',
              backgroundColor: m.color || '#e74c3c',
              zIndex: 15,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                backgroundColor: m.color || '#e74c3c',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: '900',
                whiteSpace: 'nowrap',
                marginTop: '-25px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {m.label}
              </div>
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
