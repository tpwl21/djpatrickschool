import React, { useEffect, useState, useRef } from 'react';
import Train, { generateWagons } from './Train';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';

const Level1 = ({ onNextLevel }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);

  const reqRef = useRef();

  // Basic BPM for this level. 
  // Train A and Train B have the exact same BPM natively.
  const bpm = 120;
  const trackLengthSec = 120; // 2 minutes

  const [wagonsA] = useState(generateWagons(bpm, trackLengthSec, false));
  const [wagonsB] = useState(generateWagons(bpm, trackLengthSec, false));

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const syncTimerRef = useRef(0);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      // Load synthetic tracks since we don't have real audio URLs yet.
      // Pass the trackLengthSec to avoid infinite short looping.
      ctx.loadTrack('A', null, bpm, trackLengthSec, 1);
      ctx.loadTrack('B', null, bpm, trackLengthSec, 1);
      setAudioCtx(ctx);
    });

    const updateLoop = () => {
      if (ctx) {
        const currentA = ctx.getTrackPosition('A');
        const currentB = ctx.getTrackPosition('B');
        setPosA(currentA);
        setPosB(currentB);

        // Check loss condition
        if (currentA >= trackLengthSec - 0.2) {
            ctx.pauseTrack('A');
            ctx.pauseTrack('B');
            setIsGameOver(true);
        }

        // Check if both are playing and beats are aligned.
        if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying && !isGameOver) {
          // 1 beat at 120 BPM = 0.5s. Compare modulo 1 beat in seconds.
          const secPerBeat = 60 / bpm;
          const modA = currentA % secPerBeat;
          const modB = currentB % secPerBeat;
          let diff = Math.abs(modA - modB);
          if (diff > secPerBeat * 0.8) diff = secPerBeat - diff; // wrap

          // Tolerance: < 50ms
          if (diff < 0.05) {
             syncTimerRef.current += 1;
             if (syncTimerRef.current > 600) {
                 setIsLevelCleared(true);
             }
          } else {
             syncTimerRef.current = 0;
          }
        }
      }
      if (!isLevelCleared && !isGameOver) {
         reqRef.current = requestAnimationFrame(updateLoop);
      }
    };
    reqRef.current = requestAnimationFrame(updateLoop);

    return () => {
       cancelAnimationFrame(reqRef.current);
       if (ctx) {
           ctx.ctx.close(); // Cleanup audio on unmount safely
       }
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

  const nudgeB = (amountSec) => {
    if (!audioCtx) return;
    audioCtx.nudgeTrack('B', amountSec);
    // Optimistic update for UI feel
    setPosB(audioCtx.getTrackPosition('B'));
  };

  const handleRetry = () => {
    window.location.reload(); // Quickest way to reset the whole state cleanly for prototype
  }

  return (
    <div className="app-container">
      <div className="level-header">
        <h1>Niveau 1 : Le Lancement Parfait</h1>
        <p>Les deux trains roulent à la même vitesse (120 BPM). Lance le Train B au bon moment, et utilise Pousser/Tirer pour aligner les wagons ! Termine avant que le train n'arrive au bout de la voie (2 minutes !)</p>
      </div>

      <div className="railway-container">
         <div className="target-line" />
         
         {/* Track A */}
         <div className="track-container">
            <Train wagons={wagonsA} currentPositionSec={posA} bpm={bpm} isPlaying={isPlayingA} />
         </div>

         {/* Track B */}
         <div className="track-container">
            <Train wagons={wagonsB} currentPositionSec={posB} bpm={bpm} isPlaying={isPlayingB} />
         </div>
      </div>

      <div className="controls">
        <div style={{ textAlign: 'center' }}>
            <h3>Train A ({bpm.toFixed(1)} BPM)</h3>
            <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>
                {isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}
            </button>
        </div>

        <div style={{ textAlign: 'center' }}>
            <h3>Train B ({bpm.toFixed(1)} BPM)</h3>
            <button className="btn-crayon play-btn" onClick={playB} style={{ marginRight: '10px' }} disabled={isPlayingB}>
                Play 🚂
            </button>
            <button className="btn-crayon play-btn" onClick={pauseB} style={{ marginRight: '10px' }} disabled={!isPlayingB}>
                Pause ⏸
            </button>
            <button className="btn-crayon nudge-btn" onClick={cueB} style={{ marginRight: '10px' }}>
                CUE ⏮
            </button>
            <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-0.02)}>
                ⏪ Reculer
            </button>
            <button className="btn-crayon nudge-btn" onClick={() => nudgeB(0.02)} style={{ marginLeft: '10px' }}>
                Avancer ⏩
            </button>
        </div>
      </div>
      
      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={handleRetry} />}
    </div>
  );
};

export default Level1;
