import React, { useEffect, useState, useRef } from 'react';
import Train, { generateWagons } from './Train';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';

const Level3 = ({ onNextLevel }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);

  const reqRef = useRef();

  const bpmA = 120;
  const initialBpmB = 145; 
  const trackLengthSec = 120; 

  const [wagonsA] = useState(generateWagons(bpmA, trackLengthSec, true));
  const [wagonsB] = useState(generateWagons(initialBpmB, trackLengthSec, true));

  const [pitch, setPitch] = useState(1.0);

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const syncTimerRef = useRef(0);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      ctx.loadTrack('A', null, bpmA, trackLengthSec, 3);
      ctx.loadTrack('B', null, initialBpmB, trackLengthSec, 3);
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

        if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying && !isGameOver) {
          // Level 3: align on measure (4 beats). Beat-index comparison.
          const beatsA = currentA * (bpmA / 60);
          const beatsB = currentB * (initialBpmB / 60);
          let diff = Math.abs((beatsA % 4.0) - (beatsB % 4.0));
          if (diff > 2.0) diff = 4.0 - diff; // wrap around

          // 0% pitch tolerance: displayed BPM must be exactly bpmA
          const isPitchCorrect = Math.abs(initialBpmB * ctx.decks.B.rate - bpmA) < 0.05;

          // 0.05 beat tolerance (~25ms at 120 BPM)
          if (diff < 0.05 && isPitchCorrect) {
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
           ctx.ctx.close();
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
    setPosB(audioCtx.getTrackPosition('B'));
  };

  const handlePitchChange = (e) => {
    const targetBpm = parseFloat(e.target.value);
    const newPitch = targetBpm / initialBpmB;
    setPitch(newPitch);
    if (audioCtx) {
      audioCtx.setPlaybackRate('B', newPitch);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  }

  return (
    <div className="app-container">
      <div className="level-header">
        <h1>Niveau 3 : Le Rythme Parfait 🔥</h1>
        <p>Aligne la Vitesse ET assure-toi que les wagons FEU (🔥) tombent exactement en même temps !</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <div className="railway-container">
           <div className="target-line" />
           
           <div className="track-container">
              <Train wagons={wagonsA} currentPositionSec={posA} bpm={bpmA} isPlaying={isPlayingA} />
           </div>

           <div className="track-container">
              <Train wagons={wagonsB} currentPositionSec={posB} bpm={initialBpmB} isPlaying={isPlayingB} pitch={pitch} />
           </div>
        </div>

        {/* Pitch Fader UI */}
        <div style={{ width: '80px', backgroundColor: '#e9ecef', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4>Vitesse</h4>
          <input 
            type="range" 
            min="100" 
            max="150" 
            step="0.5" 
            value={initialBpmB * pitch} 
            onChange={handlePitchChange}
            style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div className="controls">
        <div style={{ textAlign: 'center' }}>
            <h3>Train A ({bpmA.toFixed(1)} BPM)</h3>
            <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>
                {isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}
            </button>
        </div>

        <div style={{ textAlign: 'center' }}>
            <h3>Train B ({(initialBpmB * pitch).toFixed(1)} BPM)</h3>
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

export default Level3;
