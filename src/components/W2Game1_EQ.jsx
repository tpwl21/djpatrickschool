import React, { useEffect, useState, useRef } from 'react';
import Train, { generateWagons } from './Train';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import Knob from './Knob';
import Fader from './Fader';

const W2Game1_EQ = ({ onNextLevel, onRetry }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);

  // EQ and Volume state
  const [deckA, setDeckA] = useState({ low: 0, mid: 0, high: 0, vol: 1.0 });
  const [deckB, setDeckB] = useState({ low: -24, mid: 0, high: 0, vol: 0.0 });

  const reqRef = useRef();
  const bpm = 124;
  const trackLengthSec = 120;

  const [wagonsA] = useState(generateWagons(bpm, trackLengthSec, false));
  const [wagonsB] = useState(generateWagons(bpm, trackLengthSec, false));

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const swapCheckRef = useRef({ success: false, startTime: 0 });

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      ctx.loadTrack('A', null, bpm, trackLengthSec, 5); // Max complexity for full sound
      ctx.loadTrack('B', null, bpm, trackLengthSec, 5);
      
      // Initialize B contextually
      ctx.setEQ('B', 'low', -24);
      ctx.setVolume('B', 0);
      
      setAudioCtx(ctx);
    });

    const updateLoop = () => {
      if (ctx) {
        const currentA = ctx.getTrackPosition('A');
        const currentB = ctx.getTrackPosition('B');
        setPosA(currentA);
        setPosB(currentB);

        // Win Condition: Bass Swap
        // Track A Low < -15 and Track B Low > -5 and Track B Volume > 0.8
        if (deckA.low < -15 && deckB.low > -5 && deckB.vol > 0.8 && !isLevelCleared) {
           setIsLevelCleared(true);
        }

        if (currentA >= trackLengthSec - 0.2) {
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
  }, [isLevelCleared, isGameOver, deckA, deckB]);

  const handleEqChange = (deck, band, val) => {
    if (!audioCtx) return;
    audioCtx.setEQ(deck, band, val);
    if (deck === 'A') setDeckA(prev => ({ ...prev, [band]: val }));
    else setDeckB(prev => ({ ...prev, [band]: val }));
  };

  const handleVolChange = (deck, val) => {
    if (!audioCtx) return;
    audioCtx.setVolume(deck, val);
    if (deck === 'A') setDeckA(prev => ({ ...prev, vol: val }));
    else setDeckB(prev => ({ ...prev, vol: val }));
  };

  const playB = async () => {
    if (audioCtx && !isPlayingB) {
        // Sync B to A's position for this level to make it easier to focus on EQ
        const posA = audioCtx.getTrackPosition('A');
        audioCtx.decks.B.currentPosition = posA;
        await audioCtx.playTrack('B');
        setIsPlayingB(true);
    }
  };

  return (
    <div className="app-container level7">
      <div className="level-header">
        <h1>Niveau 7 : Le Maître de l'EQ</h1>
        <p>Le Train A est plein de basses. Le Train B arrive en silence. <br/>
           <strong>Mission :</strong> Réalise un "Bass Swap" ! Baisse les basses du Train A tout en montant celles du Train B pour une transition invisible.</p>
      </div>

      <div className="railway-container">
          <div className="track-container">
            <Train wagons={wagonsA} currentPositionSec={posA} bpm={bpm} isPlaying={isPlayingA} />
          </div>
          <div className="track-container">
            <Train wagons={wagonsB} currentPositionSec={posB} bpm={bpm} isPlaying={isPlayingB} />
          </div>
      </div>

      <div className="mixer-panel">
        {/* Deck A Controls */}
        <div className="deck-controls deck-a">
          <h3>DECK A</h3>
          <div className="knob-row">
            <Knob label="Low" value={deckA.low} onChange={(v) => handleEqChange('A', 'low', v)} color="#ff7675" />
            <Knob label="Mid" value={deckA.mid} onChange={(v) => handleEqChange('A', 'mid', v)} color="#fab1a0" />
            <Knob label="High" value={deckA.high} onChange={(v) => handleEqChange('A', 'high', v)} color="#ffeaa7" />
          </div>
          <Fader label="Vol" value={deckA.vol} onChange={(v) => handleVolChange('A', v)} color="#ff7675" />
          <button className="btn-crayon" onClick={() => audioCtx.playTrack('A').then(() => setIsPlayingA(true))} disabled={isPlayingA}>
            {isPlayingA ? "PLAYING" : "START A"}
          </button>
        </div>

        {/* Deck B Controls */}
        <div className="deck-controls deck-b">
          <h3>DECK B</h3>
          <div className="knob-row">
            <Knob label="Low" value={deckB.low} onChange={(v) => handleEqChange('B', 'low', v)} color="#74b9ff" />
            <Knob label="Mid" value={deckB.mid} onChange={(v) => handleEqChange('B', 'mid', v)} color="#81ecec" />
            <Knob label="High" value={deckB.high} onChange={(v) => handleEqChange('B', 'high', v)} color="#a29bfe" />
          </div>
          <Fader label="Vol" value={deckB.vol} onChange={(v) => handleVolChange('B', v)} color="#74b9ff" />
          <button className="btn-crayon" onClick={playB} disabled={isPlayingB}>
            {isPlayingB ? "PLAYING" : "SYNC & START B"}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mixer-panel {
          display: flex;
          justify-content: space-around;
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
          gap: 20px;
          padding: 20px;
          background: #2d3436;
          border-radius: 15px;
          border: 2px solid #636e72;
        }
        .knob-row {
          display: flex;
          gap: 15px;
        }
        .deck-controls h3 {
          margin: 0;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          letter-spacing: 2px;
        }
      `}} />

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}
    </div>
  );
};

export default W2Game1_EQ;

