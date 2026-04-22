import React from 'react';
import { motion } from 'framer-motion';
import Locomotive from './Locomotive';

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


export const Wagon = ({ w, scale, beatWidth }) => {
  let wagonWidth = 40 * scale;
  let bgColor = '#4ecdc4';
  let icon = w.isKick ? '🔥' : '🎵'; // Default to Kick simple style if nothing is true
  let top = `${-20 * scale}px`;
  let height = `${40 * scale}px`;

  if (w.isKick) {
     bgColor = '#ff9f43'; icon = '🔥';
  } else if (w.isSnare) {
     bgColor = '#3498db'; icon = '👏';
  } else if (w.isHat) {
     wagonWidth = 20 * scale; bgColor = '#f1c40f'; icon = '✨'; top = `${-10 * scale}px`; height = `${20 * scale}px`;
  }

  if (!w.isKick && !w.isSnare && !w.isHat) {
     bgColor = '#4ecdc4'; icon = '🎵'; 
  }

  return (
    <div style={{
      position: 'absolute',
      left: `${(w.index * beatWidth) - (wagonWidth / 2)}px`,
      top: top,
      width: `${wagonWidth}px`,
      height: height,
      backgroundColor: bgColor, 
      border: `${3 * scale}px solid #333`,
      borderRadius: `${8 * scale}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: w.isHat ? `${0.6 * Math.max(0.8, scale)}rem` : `${0.8 * Math.max(0.8, scale)}rem`,
      boxShadow: `${3 * scale}px ${3 * scale}px 0px #333`,
      zIndex: 2,
    }}>
       {icon}
    </div>
  );
};


const Train = React.forwardRef(({ wagons, bpm, zoomLevel = 100, pitch = 1.0 }, ref) => {
  // To make sure trains map visually at the same scale when BPM is adjusted,
  // we scale the zoom by the inverse of the pitch.
  const effectiveZoom = zoomLevel / pitch;
  const scale = zoomLevel / 100;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: '50%', 
          transform: 'translateX(0px)',
          willChange: 'transform'
        }}
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

        {/* The Wagons */}
        {wagons.map((w) => {
          const secPerBeat = 60 / bpm;
          const beatWidth = secPerBeat * effectiveZoom; 
          return <Wagon key={w.id} w={w} scale={scale} beatWidth={beatWidth} />;
        })}
      </div>
    </div>
  );
});


export default Train;
