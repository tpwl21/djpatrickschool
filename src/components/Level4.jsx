import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import { generateWagons } from './Train';

// 8 beats per loop section = 2 bars at 120 BPM
const BEATS_PER_LOOP = 8;

// Alternating colors for each 8-beat loop to make phrase boundaries visible
const LOOP_COLORS = [
  'rgba(255, 159, 67, 0.25)',   // orange
  'rgba(78, 205, 196, 0.25)',   // teal
  'rgba(52, 152, 219, 0.25)',   // blue
  'rgba(162, 155, 254, 0.25)',  // purple
];

// Combined track view: colored loop bands + wagons on top
const LoopTrackView = ({ wagons, currentPositionSec, bpm, isPlaying, pitch = 1.0, zoomLevel = 100, trackLengthSec }) => {
  const effectiveZoom = zoomLevel / pitch;
  const pixelOffset = currentPositionSec * effectiveZoom;
  const secPerBeat = 60 / bpm;
  const secPerLoop = secPerBeat * BEATS_PER_LOOP;
  const numLoops = Math.ceil(trackLengthSec / secPerLoop);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
      <motion.div
        style={{ position: 'absolute', left: '50%', x: -pixelOffset, height: '100%', top: 0 }}
        animate={{ x: -pixelOffset }}
        transition={{ type: 'tween', ease: 'linear', duration: isPlaying ? 0.1 : 0 }}
      >
        {/* Layer 1: Loop color bands */}
        {Array.from({ length: numLoops }).map((_, i) => (
          <div key={`loop-${i}`} style={{
            position: 'absolute',
            left: `${i * secPerLoop * effectiveZoom}px`,
            top: '2px',
            bottom: '2px',
            width: `${secPerLoop * effectiveZoom - 3}px`,
            backgroundColor: LOOP_COLORS[i % LOOP_COLORS.length],
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

        {/* Layer 2: Beat wagons centered vertically */}
        {wagons.map((w) => {
          const beatWidth = secPerBeat * effectiveZoom;
          let wagonWidth = 36;
          let bgColor = '#4ecdc4';
          let icon = '🎵';
          let top = '50%';
          let marginTop = '-18px';
          let height = '36px';

          if (w.isKick)       { bgColor = '#ff9f43'; icon = '🔥'; }
          else if (w.isSnare) { bgColor = '#3498db'; icon = '👏'; }
          else if (w.isHat)   { wagonWidth = 18; bgColor = '#f1c40f'; icon = '✨'; height = '18px'; marginTop = '-9px'; }

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
              {icon}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

const Level4 = ({ onNextLevel, onRetry }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);
  const reqRef = useRef();

  const bpmA = 120;
  const initialBpmB = 126; // 5% diff
  const trackLengthSec = 120;
  const [pitch, setPitch] = useState(1.0);

  const [wagonsA] = useState(generateWagons(bpmA, trackLengthSec, true));
  const [wagonsB] = useState(generateWagons(initialBpmB, trackLengthSec, true));

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const syncTimerRef = useRef(0);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      ctx.loadTrack('A', null, bpmA, trackLengthSec, 4);
      ctx.loadTrack('B', null, initialBpmB, trackLengthSec, 4);
      setAudioCtx(ctx);
    });

    const updateLoop = () => {
      if (ctx) {
        const currentA = ctx.getTrackPosition('A');
        const currentB = ctx.getTrackPosition('B');
        setPosA(currentA);
        setPosB(currentB);

        if (currentA >= trackLengthSec - 0.2) {
            ctx.pauseTrack('A');
            ctx.pauseTrack('B');
            setIsGameOver(true);
        }

        if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying && !isGameOver) {
          // Level 4: align on phrase (8 beats). 
          const beatsA = currentA * (bpmA / 60);
          const beatsB = currentB * (initialBpmB / 60);
          let diff = Math.abs((beatsA % BEATS_PER_PHRASE) - (beatsB % BEATS_PER_PHRASE));
          if (diff > BEATS_PER_PHRASE / 2) diff = BEATS_PER_PHRASE - diff;

          // 0% pitch tolerance
          const isPitchCorrect = Math.abs(initialBpmB * ctx.decks.B.rate - bpmA) < 0.05;

          if (diff < 0.05 && isPitchCorrect) {
             syncTimerRef.current += 1;
             if (syncTimerRef.current > 600) setIsLevelCleared(true);
          } else {
             syncTimerRef.current = 0;
          }
        }
      }
      if (!isLevelCleared && !isGameOver) reqRef.current = requestAnimationFrame(updateLoop);
    };
    reqRef.current = requestAnimationFrame(updateLoop);

    return () => {
       cancelAnimationFrame(reqRef.current);
       if (ctx) ctx.ctx.close();
    }
  }, [isLevelCleared, isGameOver]);



  const playA = async () => {
    if (!audioCtx || isPlayingA) return;
    await audioCtx.playTrack('A');
    setIsPlayingA(true);
  };

  const playB = async () => {
    if (!audioCtx || isPlayingB) return;
    await audioCtx.playTrack('B');
    setIsPlayingB(true);
  };

  const pauseB = () => {
    if (!audioCtx) return;
    audioCtx.pauseTrack('B');
    setIsPlayingB(false);
  };



  const cueB = () => {
    if (!audioCtx) return;
    audioCtx.cueTrack('B');
    setPosB(0);
    setIsPlayingB(false);
  };

  const nudgeB = (amount) => {
    if (!audioCtx) return;
    audioCtx.nudgeTrack('B', amount);
    setPosB(audioCtx.getTrackPosition('B'));
  };

  const handlePitchChange = (e) => {
    const targetBpm = parseFloat(e.target.value);
    const newPitch = targetBpm / initialBpmB;
    setPitch(newPitch);
    if (audioCtx) audioCtx.setPlaybackRate('B', newPitch);
  };

  const handleRetry = () => {
    onRetry();
  }

  return (
    <div className="app-container">
      <div className="level-header">
        <h1>Niveau 4 : La Boucle 🔄</h1>
        <p>Aligne les <strong>boucles</strong> ET les <strong>wagons</strong> pour que les Kicks 🔥 de chaque section tombent ensemble !</p>
      </div>

      <div className="main-gameplay">
        <div className="railway-container">
          <div className="target-line" />

          <div className="track-container">
            <LoopTrackView
              wagons={wagonsA}
              currentPositionSec={posA}
              bpm={bpmA}
              isPlaying={isPlayingA}
              trackLengthSec={trackLengthSec}
            />
          </div>

          <div className="track-container">
            <LoopTrackView
              wagons={wagonsB}
              currentPositionSec={posB}
              bpm={initialBpmB}
              isPlaying={isPlayingB}
              pitch={pitch}
              trackLengthSec={trackLengthSec}
            />
          </div>
        </div>

        <div className="pitch-fader-container">
          <h4>Vitesse</h4>
          <input
            type="range"
            min="100"
            max="150"
            step="0.5"
            value={initialBpmB * pitch}
            onChange={handlePitchChange}
            className="pitch-input-vertical"
          />
          <div style={{ fontWeight: 'bold', marginTop: '10px', color: '#ff6b6b' }}>
            {(initialBpmB * pitch).toFixed(1)} BPM
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <h3>Train A</h3>
          <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>
            {isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}
          </button>
        </div>

        <div className="control-group">
          <h3>Train B</h3>
          <div className="control-buttons">
            <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB}>
              Play 🚂
            </button>
            <button className="btn-crayon play-btn" onClick={pauseB} disabled={!isPlayingB}>
              Pause ⏸
            </button>
            <button className="btn-crayon nudge-btn" onClick={cueB}>CUE ⏮</button>
            <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-0.02)}>⏪ Reculer</button>
            <button className="btn-crayon nudge-btn" onClick={() => nudgeB(0.02)}>Avancer ⏩</button>
          </div>
        </div>
      </div>

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={handleRetry} />}
    </div>
  );

};

export default Level4;

