import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import { generateWagons } from './Train';

// Level 7: "The Purist" 🧘‍♂️
// Same as Level 6 (No BPM, randomization), but NO NUDGE BUTTONS.
// The user must master the "CUE & Play" timing and the Pitch alone.

const BEATS_PER_LOOP = 8;
const LOOPS_PER_PHRASE = 4;
const BEATS_PER_PHRASE = BEATS_PER_LOOP * LOOPS_PER_PHRASE; 
const NUM_PHRASES = 5;

const PHRASES = [
  { name: 'Intro',  emoji: '🌅', color: 'rgba(168, 216, 185, 0.5)', index: 0 },
  { name: 'Build',  emoji: '⛰️', color: 'rgba(246, 211, 101, 0.5)', index: 1 },
  { name: 'Drop',   emoji: '🔥', color: 'rgba(255, 107, 107, 0.5)', index: 2 },
  { name: 'Break',  emoji: '🌊', color: 'rgba(116, 185, 255, 0.5)', index: 3 },
  { name: 'Outro',  emoji: '🌙', color: 'rgba(162, 155, 254, 0.5)', index: 4 },
];

const LOOP_COLORS = [
  'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.08)', 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.08)',
];

const buildPhraseBlocks = (bpm, trackLengthSec) => {
  const secPerBeat = 60 / bpm;
  const secPerPhrase = secPerBeat * BEATS_PER_PHRASE;
  const numBlocks = Math.ceil(trackLengthSec / secPerPhrase);
  return Array.from({ length: numBlocks }).map((_, i) => ({
    id: i, phrase: PHRASES[i % 5], startSec: i * secPerPhrase, durationSec: secPerPhrase,
    numLoops: LOOPS_PER_PHRASE, secPerLoop: secPerBeat * BEATS_PER_LOOP,
  }));
};

const PhraseTrackView = ({ phraseBlocks, wagons, currentPositionSec, bpm, isPlaying, pitch = 1.0, zoomLevel = 100 }) => {
  const effectiveZoom = zoomLevel / pitch;
  const pixelOffset = currentPositionSec * effectiveZoom;
  const secPerBeat = 60 / bpm;
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
      <motion.div
        style={{ position: 'absolute', left: '50%', x: -pixelOffset, height: '100%', top: 0 }}
        animate={{ x: -pixelOffset }}
        transition={{ type: 'tween', ease: 'linear', duration: isPlaying ? 0.1 : 0 }}
      >
        {phraseBlocks.map((block) => {
          const widthPx = block.durationSec * effectiveZoom;
          const leftPx = block.startSec * effectiveZoom;
          return (
            <div key={block.id} style={{
              position: 'absolute', left: `${leftPx}px`, top: '2px', bottom: '2px', width: `${widthPx - 4}px`,
              backgroundColor: block.phrase.color, borderRadius: '12px', border: '2px solid rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 1,
            }}>
              <div style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
                {block.phrase.emoji} {block.phrase.name}
              </div>
              {Array.from({ length: 4 }).map((_, li) => (
                <div key={li} style={{
                  position: 'absolute', left: `${li * block.secPerLoop * effectiveZoom}px`, top: 0, bottom: 0,
                  width: `${block.secPerLoop * effectiveZoom - 2}px`, backgroundColor: LOOP_COLORS[li % 4], borderRight: '1px dashed rgba(0,0,0,0.2)',
                }}>
                  <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '0.55rem', color: '#33333388' }}>L{li + 1}</span>
                </div>
              ))}
            </div>
          );
        })}
        {wagons.map((w) => (
          <div key={w.id} style={{
            position: 'absolute', left: `${(w.index * secPerBeat * effectiveZoom) - 16}px`, top: '50%', marginTop: w.isHat ? '-8px' : '-16px',
            width: w.isHat ? '16px' : '32px', height: w.isHat ? '16px' : '32px',
            backgroundColor: w.isKick ? '#ff9f43' : w.isSnare ? '#3498db' : '#f1c40f',
            border: '2px solid #333', borderRadius: '6px', fontSize: '0.65rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: '2px 2px 0px #333', zIndex: 2,
          }}>
            {w.isKick ? '🔥' : w.isSnare ? '👏' : '✨'}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const PhraseIndicator = ({ label, currentPhrase, isOutro = false }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px',
    backgroundColor: isOutro ? '#a29bfe' : '#e9ecef', border: `2px solid ${isOutro ? '#6c5ce7' : '#ccc'}`,
    fontWeight: 'bold', fontSize: '0.9rem',
  }}>
    {label}: {currentPhrase ? `${currentPhrase.emoji} ${currentPhrase.name}` : '—'}
  </div>
);

const Level7 = ({ onNextLevel }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const reqRef = useRef();

  const bpmA = 120;
  const initialBpmB = useRef(115 + Math.random() * 20).current; 
  const trackLengthSec = 160;
  const [pitch, setPitch] = useState(1.0);

  const wagonsA = useRef(generateWagons(bpmA, trackLengthSec, true)).current;
  const wagonsB = useRef(generateWagons(initialBpmB, trackLengthSec, true)).current;
  const phraseBlocksA = useRef(buildPhraseBlocks(bpmA, trackLengthSec)).current;
  const phraseBlocksB = useRef(buildPhraseBlocks(initialBpmB, trackLengthSec)).current;

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const syncTimerRef = useRef(0);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      ctx.loadTrack('A', null, bpmA, trackLengthSec, 5);
      ctx.loadTrack('B', null, initialBpmB, trackLengthSec, 5);
      setAudioCtx(ctx);
    });

    const updateLoop = () => {
      if (ctx) {
        const currentA = ctx.getTrackPosition('A');
        const currentB = ctx.getTrackPosition('B');
        setPosA(currentA); setPosB(currentB);
        const beatsA = currentA * (bpmA / 60);
        const beatsB = currentB * (initialBpmB / 60);
        setCurrentPhraseA(PHRASES[Math.floor(beatsA / 32) % 5]);
        setCurrentPhraseB(PHRASES[Math.floor(beatsB / 32) % 5]);

        if (currentA >= trackLengthSec - 0.2) {
          ctx.pauseTrack('A'); ctx.pauseTrack('B'); setIsGameOver(true);
        }

        if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying && !isGameOver) {
          const pIdxA = Math.floor(beatsA / 32) % 5;
          const pIdxB = Math.floor(beatsB / 32) % 5;
          const posInP_A = beatsA % 32;
          const posInP_B = beatsB % 32;
          let diff = Math.abs(posInP_A - posInP_B);
          if (diff > 16) diff = 32 - diff;
          const isPitchCorrect = Math.abs(initialBpmB * ctx.decks.B.rate - bpmA) < 0.05;

          if (pIdxA === 4 && pIdxB === 0 && diff < 0.05 && isPitchCorrect) {
            syncTimerRef.current += 1;
            if (syncTimerRef.current > 600) setIsLevelCleared(true);
          } else { syncTimerRef.current = 0; }
        }
      }
      if (!isLevelCleared && !isGameOver) reqRef.current = requestAnimationFrame(updateLoop);
    };
    reqRef.current = requestAnimationFrame(updateLoop);
    return () => { cancelAnimationFrame(reqRef.current); if (ctx) ctx.ctx.close(); };
  }, [isLevelCleared, isGameOver]);

  const playA = async () => { if (audioCtx && !isPlayingA) { await audioCtx.playTrack('A'); setIsPlayingA(true); } };
  const playB = async () => { if (audioCtx && !isPlayingB) { await audioCtx.playTrack('B'); setIsPlayingB(true); } };
  const pauseB = () => { if (audioCtx) { audioCtx.pauseTrack('B'); setIsPlayingB(false); } };
  const cueB = () => { if (audioCtx) { audioCtx.cueTrack('B'); setPosB(0); setIsPlayingB(false); } };

  const handlePitchChange = (e) => {
    const targetBpm = parseFloat(e.target.value);
    const newPitch = targetBpm / initialBpmB;
    setPitch(newPitch);
    if (audioCtx) audioCtx.setPlaybackRate('B', newPitch);
  };
  const handleRetry = () => window.location.reload();

  return (
    <div className="app-container">
      <div className="level-header">
        <h1>Niveau 7 : Le Puriste 🧘‍♂️</h1>
        <p>Expertise Totale. <strong>Pas de BPM, et surtout PAS DE NUDGE.</strong> Aligne tes trains uniquement avec le Play/CUE et le Pitch !</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 20px', gap: '12px' }}>
        <PhraseIndicator label="Train A" currentPhrase={currentPhraseA} isOutro={currentPhraseA?.index === 4} />
        <PhraseIndicator label="Train B" currentPhrase={currentPhraseB} />
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <div className="railway-container">
          <div className="target-line" />
          <div className="track-container" style={{ height: '120px' }}>
            <PhraseTrackView phraseBlocks={phraseBlocksA} wagons={wagonsA} currentPositionSec={posA} bpm={bpmA} isPlaying={isPlayingA} />
          </div>
          <div className="track-container" style={{ height: '120px' }}>
            <PhraseTrackView phraseBlocks={phraseBlocksB} wagons={wagonsB} currentPositionSec={posB} bpm={initialBpmB} isPlaying={isPlayingB} pitch={pitch} />
          </div>
        </div>

        <div style={{ width: '100px', backgroundColor: '#e9ecef', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <h4>Pitch</h4>
          <input type="range" min="100" max="150" step="0.5" value={initialBpmB * pitch} onChange={handlePitchChange} style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100%', cursor: 'pointer' }} />
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: pitch >= 1 ? '#ff6b6b' : '#4ecdc4' }}>
            {pitch >= 1 ? '+' : ''}{((pitch - 1) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="controls">
        <div style={{ textAlign: 'center' }}>
          <h3>Train A</h3>
          <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>{isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Train B</h3>
          <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB} style={{ marginRight: '10px' }}>Play 🚂</button>
          <button className="btn-crayon play-btn" onClick={pauseB} disabled={!isPlayingB} style={{ marginRight: '10px' }}>Pause ⏸</button>
          <button className="btn-crayon nudge-btn" onClick={cueB}>CUE ⏮</button>
        </div>
      </div>

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={handleRetry} />}
    </div>
  );
};

export default Level7;
