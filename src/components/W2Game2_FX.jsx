import React, { useEffect, useState, useRef } from 'react';
import Train, { generateWagons } from './Train';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import Knob from './Knob';
import CoachPatrick from './CoachPatrick';
import { COACH_TIPS } from '../constants/coachPatrick';

const W2Game2_FX = ({ onNextLevel, onRetry }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [posA, setPosA] = useState(0);

  // FX State
  const [fx, setFx] = useState({ filterFreq: 0, echo: 0 });
  const [sweepProgress, setSweepProgress] = useState(0);

  const reqRef = useRef();
  const bpm = 128;
  const trackLengthSec = 120;
  const [wagonsA] = useState(generateWagons(bpm, trackLengthSec, false));

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      ctx.loadTrack('A', null, bpm, trackLengthSec, 5);
      // Initialize with High Pass Filter at 20Hz
      ctx.setFilter('A', 'highpass', 20, 10);
      setAudioCtx(ctx);
    });

    const updateLoop = () => {
      if (ctx) {
        const pos = ctx.getTrackPosition('A');
        setPosA(pos);

        // Build detection: If filter is in specific range, progress the sweep
        if (fx.filterFreq > 1000 && fx.filterFreq < 15000) {
            setSweepProgress(prev => Math.min(100, prev + 0.5));
        }

        if (sweepProgress >= 100 && fx.filterFreq > 10000 && !isLevelCleared) {
            setIsLevelCleared(true);
        }

        if (pos >= trackLengthSec - 0.2) {
            setIsGameOver(true);
        }
      }
      if (!isLevelCleared && !isGameOver) {
         reqRef.current = requestAnimationFrame(updateLoop);
      }
    };
    reqRef.current = requestAnimationFrame(updateLoop);

    return () => {
       cancelAnimationFrame(reqRef.current);
       if (ctx) ctx.ctx.close();
    }
  }, [isLevelCleared, isGameOver, fx.filterFreq, sweepProgress]);

  const handleFilterChange = (val) => {
    if (!audioCtx) return;
    // Map knob value (0 to 100) to frequency (20 to 18000)
    const freq = Math.pow(10, (val / 100) * 3 + 1.3); 
    audioCtx.setFilter('A', 'highpass', freq, 10);
    setFx(prev => ({ ...prev, filterFreq: freq }));
  };

  const handleEchoChange = (val) => {
    if (!audioCtx) return;
    const wet = val / 140; 
    audioCtx.setEcho('A', wet);
    setFx(prev => ({ ...prev, echo: val }));
  };

  return (
    <div className="app-container level8">
      <div className="level-header">
        <h1>Atelier 2.2 : Le Sorcier des Effets</h1>
        <p>Utilise le Filtre Passe-Haut (HPF) pour créer une montée d'énergie. <br/>
           Pousse le filtre jusqu'au bout pour déclencher le drop !</p>
      </div>

      <div className="railway-container" style={{ perspective: '1000px' }}>
          <div className="track-container" style={{ transform: `rotateX(${(fx.filterFreq/20000)*40}deg) scale(${1 + (fx.echo/100)*0.2})` }}>
            <Train wagons={wagonsA} currentPositionSec={posA} bpm={bpm} isPlaying={isPlayingA} />
          </div>
      </div>

      <div className="mixer-panel">
        <div className="deck-controls">
          <h3>FX UNIT</h3>
          <div className="knob-row">
            <Knob label="HPF" value={(Math.log10(fx.filterFreq) - 1.3) / 3 * 100} onChange={handleFilterChange} color="#fab1a0" />
            <Knob label="ECHO" value={fx.echo} onChange={handleEchoChange} color="#81ecec" />
          </div>
          
          <div className="mood-bar-container" style={{ width: '200px', marginTop: '20px' }}>
             <div className="mood-fill" style={{ width: `${sweepProgress}%`, background: '#ff7675' }} />
             <div className="mood-label">BUILD-UP: {Math.round(sweepProgress)}%</div>
          </div>

          <button 
            className="btn-crayon play-btn" 
            style={{ marginTop: '20px' }}
            onClick={() => audioCtx.playTrack('A').then(() => setIsPlayingA(true))}
            disabled={isPlayingA}
          >
            {isPlayingA ? "DANCEFLOOR ON FIRE" : "START THE MIX"}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mixer-panel {
          display: flex;
          justify-content: center;
          background: #1e1e1e;
          padding: 30px;
          border-radius: 20px;
          border: 4px solid #3d3d3d;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          margin-top: 20px;
        }
        .deck-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .knob-row {
          display: flex;
          gap: 30px;
        }
        .mood-bar-container {
          height: 20px;
          background: #000;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          border: 2px solid #333;
        }
        .mood-fill { height: 100%; transition: width 0.1s linear; }
        .mood-label { 
          position: absolute; top:0; left:0; width:100%; height:100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: bold; color: #fff;
        }
      `}} />

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}
      <CoachPatrick tips={COACH_TIPS.W2_FX} />
    </div>
  );
};

export default W2Game2_FX;
