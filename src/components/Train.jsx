import React from 'react';
import { motion } from 'framer-motion';

// Generates an array of wagons based on song length and BPM.
export const generateWagons = (bpm, lengthInSeconds = 60, isComplex = false) => {
  if (!isComplex) {
    const beats = Math.floor((lengthInSeconds / 60) * bpm);
    return Array.from({ length: beats }).map((_, i) => ({
      id: i,
      index: i,
      isKick: true,
      isSnare: false,
      isHat: false,
    }));
  }

  const halfBeats = Math.floor((lengthInSeconds / 60) * bpm * 2);
  return Array.from({ length: halfBeats }).map((_, i) => {
    const isKick = (i % 2 === 0) && ((i / 2) % 2 === 0);
    const isSnare = (i % 2 === 0) && ((i / 2) % 2 !== 0);
    const isHat = (i % 2 !== 0);
    return {
      id: i,
      index: i / 2, // Map physical beat spacing correctly since index dictates spacing. Half beats move by half index.
      isKick,
      isSnare,
      isHat,
    };
  });
};

const Train = ({ wagons, currentPositionSec, bpm, isPlaying, zoomLevel = 100, pitch = 1.0 }) => {
  // To make sure trains map visually at the same scale when BPM is adjusted,
  // we scale the zoom by the inverse of the pitch.
  const effectiveZoom = zoomLevel / pitch;
  const pixelOffset = currentPositionSec * effectiveZoom;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <motion.div
        style={{
          position: 'absolute',
          left: '50%', 
          x: -pixelOffset,
        }}
        animate={{ x: -pixelOffset }}
        transition={{ type: 'tween', ease: 'linear', duration: isPlaying ? 0.1 : 0 }} 
      >
        {/* The Engine */}
        <div style={{
          position: 'absolute',
          left: '-100px', // Shift it before beat 0
          top: '-30px', // Center it vertically relative to line
          width: '80px',
          height: '60px',
          backgroundColor: '#ff6b6b',
          borderRadius: '10px 30px 10px 10px',
          border: '4px solid #333',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '4px 4px 0px #333'
        }}>
          🚂
        </div>

        {/* The Wagons */}
        {wagons.map((w) => {
          const secPerBeat = 60 / bpm;
          const beatWidth = secPerBeat * effectiveZoom; 
          
          let wagonWidth = 40;
          let bgColor = '#4ecdc4';
          let icon = w.isKick ? '🔥' : '🎵'; // Default to Kick simple style if nothing is true
          let top = '-20px';
          let height = '40px';

          if (w.isKick) {
             bgColor = '#ff9f43'; icon = '🔥';
          } else if (w.isSnare) {
             bgColor = '#3498db'; icon = '👏';
          } else if (w.isHat) {
             wagonWidth = 20; bgColor = '#f1c40f'; icon = '✨'; top = '-10px'; height = '20px';
          }

          if (!w.isKick && !w.isSnare && !w.isHat) {
             bgColor = '#4ecdc4'; icon = '🎵'; 
          }

          return (
            <div key={w.id} style={{
              position: 'absolute',
              left: `${(w.index * beatWidth) - (wagonWidth / 2)}px`,
              top: top,
              width: `${wagonWidth}px`,
              height: height,
              backgroundColor: bgColor, 
              border: '3px solid #333',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: w.isHat ? '0.6rem' : '0.8rem',
              boxShadow: '3px 3px 0px #333'
            }}>
               {icon}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Train;
