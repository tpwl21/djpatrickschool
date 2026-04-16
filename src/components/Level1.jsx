import React, { useEffect, useState, useRef } from 'react';
import Train, { generateWagons } from './Train';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import { useValidation } from '../hooks/useValidation';
import { TRACK_CONFIG } from '../constants/tracks';
import CoachPatrick from './CoachPatrick';
import { COACH_TIPS } from '../constants/coachPatrick';

const Level1 = ({ onNextLevel, onRetry, onBack, difficulty, onUnlockNext }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);

  const reqRef = useRef();

  // Basic BPM for this level from config
  const configA = TRACK_CONFIG.LEVEL_1.A;
  const configB = TRACK_CONFIG.LEVEL_1.B;
  const bpm = configA.bpm; 
  const trackLengthSec = 120; // 2 minutes

  const [wagonsA] = useState(generateWagons(bpm, trackLengthSec, false));
  const [wagonsB] = useState(generateWagons(bpm, trackLengthSec, false));

  const { config, isLevelCleared, isPerfectPitch, isPerfectSync, validate } = useValidation(difficulty);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isLevelCleared && onUnlockNext) {
      onUnlockNext();
    }
  }, [isLevelCleared, onUnlockNext]);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      // Load tracks from config
      ctx.loadTrack('A', configA.url, configA.bpm, trackLengthSec, configA.complexity);
      ctx.loadTrack('B', configB.url, configB.bpm, trackLengthSec, configB.complexity);
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
          const secPerBeat = 60 / bpm;
          const modA = currentA % secPerBeat;
          const modB = currentB % secPerBeat;
          let diff = Math.abs(modA - modB);
          if (diff > secPerBeat * 0.8) diff = secPerBeat - diff; // wrap

          // Use centralized validation
          validate(diff, bpm, bpm);
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
    onRetry();
  }


  return (
    <div className="app-container">
      <div className="level-header">
        <button onClick={onBack} className="btn-crayon nudge-btn back-home-btn">
          🏠 Menu
        </button>
        <h1>Niveau 1 : Le Lancement Parfait</h1>
        <p>Les deux trains roulent à la même vitesse ({bpm} BPM). Lance le Train B au bon moment, et utilise Pousser/Tirer pour aligner les wagons !</p>
      </div>

      <div className="main-gameplay">
        <div className="railway-container">
           <div className="target-line" />
           
           <div className="track-container">
              <Train wagons={wagonsA} currentPositionSec={posA} bpm={bpm} isPlaying={isPlayingA} />
           </div>

           <div className="track-container">
              <Train wagons={wagonsB} currentPositionSec={posB} bpm={bpm} isPlaying={isPlayingB} />
           </div>
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
            <h3>Train A (<span style={{ color: isPerfectPitch ? '#27ae60' : 'inherit' }}>{bpm.toFixed(1)} BPM</span>)</h3>
            <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>
                {isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}
            </button>
        </div>

        <div className="control-group">
            <h3>Train B (<span style={{ color: isPerfectPitch ? '#27ae60' : 'inherit' }}>{bpm.toFixed(1)} BPM</span>)</h3>
            <div className="control-buttons">
              <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB}>
                  Play 🚂
              </button>
              <button className="btn-crayon play-btn" onClick={pauseB} disabled={!isPlayingB}>
                  Pause ⏸
              </button>
              <button className="btn-crayon nudge-btn" onClick={cueB}>
                  CUE ⏮
              </button>
              <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-config.nudgeAmount)}>
                  ⏪ Reculer
              </button>
              <button className="btn-crayon nudge-btn" onClick={() => nudgeB(config.nudgeAmount)}>
                  Avancer ⏩
              </button>
            </div>
        </div>
      </div>
      
      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={handleRetry} />}

      <CoachPatrick tips={COACH_TIPS.LEVEL_1} />
    </div>

  );
};

export default Level1;
