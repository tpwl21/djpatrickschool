import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import { generateWagons } from './Train';

// Structure: 1 phrase = 4 loops of 8 beats = 32 beats
const BEATS_PER_LOOP = 8;
const LOOPS_PER_PHRASE = 4;
const BEATS_PER_PHRASE = BEATS_PER_LOOP * LOOPS_PER_PHRASE; // 32 beats

const PHRASES = [
  { name: 'Intro',  emoji: '🌅', color: 'rgba(168, 216, 185, 0.5)', index: 0 },
  { name: 'Build',  emoji: '⛰️', color: 'rgba(246, 211, 101, 0.5)', index: 1 },
  { name: 'Drop',   emoji: '🔥', color: 'rgba(255, 107, 107, 0.5)', index: 2 },
  { name: 'Break',  emoji: '🌊', color: 'rgba(116, 185, 255, 0.5)', index: 3 },
  { name: 'Outro',  emoji: '🌙', color: 'rgba(162, 155, 254, 0.5)', index: 4 },
];
const NUM_PHRASES = PHRASES.length;

const LOOP_COLORS = [
  'rgba(255,255,255,0.15)',
  'rgba(0,0,0,0.08)',
  'rgba(255,255,255,0.15)',
  'rgba(0,0,0,0.08)',
];

// Generate phrase metadata (start/duration) for a given BPM and track length
const buildPhraseBlocks = (bpm, trackLengthSec) => {
  const secPerBeat = 60 / bpm;
  const secPerPhrase = secPerBeat * BEATS_PER_PHRASE;
  const numBlocks = Math.ceil(trackLengthSec / secPerPhrase);
  return Array.from({ length: numBlocks }).map((_, i) => ({
    id: i,
    phrase: PHRASES[i % NUM_PHRASES],
    startSec: i * secPerPhrase,
    durationSec: secPerPhrase,
    numLoops: LOOPS_PER_PHRASE,
    secPerLoop: secPerBeat * BEATS_PER_LOOP,
  }));
};

// Full landscape: phrase blocks + loop dividers + wagons on top
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
        {/* Layer 1: Phrase background blocks */}
        {phraseBlocks.map((block) => {
          const widthPx = block.durationSec * effectiveZoom;
          const leftPx = block.startSec * effectiveZoom;
          return (
            <div key={block.id} style={{
              position: 'absolute',
              left: `${leftPx}px`,
              top: '2px', bottom: '2px',
              width: `${widthPx - 4}px`,
              backgroundColor: block.phrase.color,
              borderRadius: '12px',
              border: '2px solid rgba(0,0,0,0.2)',
              overflow: 'hidden',
              zIndex: 1,
            }}>
              {/* Phrase label top-left */}
              <div style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
                {block.phrase.emoji} {block.phrase.name}
              </div>

              {/* Loop dividers inside the phrase */}
              {Array.from({ length: block.numLoops }).map((_, li) => {
                const loopWidthPx = block.secPerLoop * effectiveZoom;
                return (
                  <div key={li} style={{
                    position: 'absolute',
                    left: `${li * loopWidthPx}px`,
                    top: 0, bottom: 0,
                    width: `${loopWidthPx - 2}px`,
                    backgroundColor: LOOP_COLORS[li % LOOP_COLORS.length],
                    borderRight: '1px dashed rgba(0,0,0,0.2)',
                  }}>
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '0.55rem', color: '#33333388' }}>
                      L{li + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Layer 2: Wagons */}
        {wagons.map((w) => {
          const beatWidth = secPerBeat * effectiveZoom;
          let wagonWidth = 32;
          let bgColor = '#4ecdc4';
          let icon = '🎵';
          let top = '50%';
          let marginTop = '-16px';
          let height = '32px';

          if (w.isKick)       { bgColor = '#ff9f43'; icon = '🔥'; }
          else if (w.isSnare) { bgColor = '#3498db'; icon = '👏'; }
          else if (w.isHat)   { wagonWidth = 16; bgColor = '#f1c40f'; icon = '✨'; height = '16px'; marginTop = '-8px'; }

          return (
            <div key={w.id} style={{
              position: 'absolute',
              left: `${(w.index * beatWidth) - (wagonWidth / 2)}px`,
              top, marginTop,
              width: `${wagonWidth}px`,
              height,
              backgroundColor: bgColor,
              border: '2px solid #333',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: w.isHat ? '0.45rem' : '0.65rem',
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

// Synced-phrase indicator: shows which phrase each track is currently in
const PhraseIndicator = ({ label, currentPhrase, isOutro = false }) => (
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

const Level5 = ({ onNextLevel }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const reqRef = useRef();

  const bpmA = 120;
  const initialBpmB = 126;
  const trackLengthSec = 120;
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
        setPosA(currentA);
        setPosB(currentB);

        // Beat indices
        const beatsA = currentA * (bpmA / 60);
        const beatsB = currentB * (initialBpmB / 60);

        // Which phrase are we in?
        const phraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE) % NUM_PHRASES;
        const phraseIdxB = Math.floor(beatsB / BEATS_PER_PHRASE) % NUM_PHRASES;
        setCurrentPhraseA(PHRASES[phraseIdxA]);
        setCurrentPhraseB(PHRASES[phraseIdxB]);

        if (currentA >= trackLengthSec - 0.2) {
          ctx.pauseTrack('A');
          ctx.pauseTrack('B');
          setIsGameOver(true);
        }

        if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying && !isGameOver) {
          // Level 5: Outro of A must align with Intro of B
          // Both must be at the same position WITHIN their phrase
          const isAinOutro = phraseIdxA === 4; // PHRASES[4] = Outro
          const isBinIntro = phraseIdxB === 0; // PHRASES[0] = Intro

          const posInPhraseA = beatsA % BEATS_PER_PHRASE;
          const posInPhraseB = beatsB % BEATS_PER_PHRASE;
          let diff = Math.abs(posInPhraseA - posInPhraseB);
          if (diff > BEATS_PER_PHRASE / 2) diff = BEATS_PER_PHRASE - diff;

          // 0% pitch tolerance
          const isPitchCorrect = Math.abs(initialBpmB * ctx.decks.B.rate - bpmA) < 0.05;

          if (isAinOutro && isBinIntro && diff < 0.05 && isPitchCorrect) {
            syncTimerRef.current += 1;
            if (syncTimerRef.current > 600) setIsLevelCleared(true);
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
      if (ctx) ctx.ctx.close();
    };
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

  const handleRetry = () => window.location.reload();

  return (
    <div className="app-container">
      <div className="level-header">
        <h1>Niveau 5 : La Transition 🎧</h1>
        <p>
          Chaque phrase contient 4 boucles de 8 temps. Tu dois faire démarrer l'<strong>Intro 🌅</strong> du Train B
          exactement sur l'<strong>Outro 🌙</strong> du Train A !
        </p>
      </div>

      {/* Phrase indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 20px', gap: '12px' }}>
        <PhraseIndicator label="Train A" currentPhrase={currentPhraseA} isOutro={currentPhraseA?.index === 4} />
        <PhraseIndicator label="Train B" currentPhrase={currentPhraseB} />
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <div className="railway-container">
          <div className="target-line" />

          <div className="track-container" style={{ height: '120px' }}>
            <PhraseTrackView
              phraseBlocks={phraseBlocksA}
              wagons={wagonsA}
              currentPositionSec={posA}
              bpm={bpmA}
              isPlaying={isPlayingA}
            />
          </div>

          <div className="track-container" style={{ height: '120px' }}>
            <PhraseTrackView
              phraseBlocks={phraseBlocksB}
              wagons={wagonsB}
              currentPositionSec={posB}
              bpm={initialBpmB}
              isPlaying={isPlayingB}
              pitch={pitch}
            />
          </div>
        </div>

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
          <h3>Train A — {bpmA.toFixed(1)} BPM</h3>
          <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>
            {isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3>Train B — {(initialBpmB * pitch).toFixed(1)} BPM</h3>
          <button className="btn-crayon play-btn" onClick={playB} style={{ marginRight: '10px' }} disabled={isPlayingB}>
            Play 🚂
          </button>
          <button className="btn-crayon play-btn" onClick={pauseB} style={{ marginRight: '10px' }} disabled={!isPlayingB}>
            Pause ⏸
          </button>
          <button className="btn-crayon nudge-btn" onClick={cueB} style={{ marginRight: '10px' }}>CUE ⏮</button>
          <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-0.02)}>⏪ Reculer</button>
          <button className="btn-crayon nudge-btn" onClick={() => nudgeB(0.02)} style={{ marginLeft: '10px' }}>Avancer ⏩</button>
        </div>
      </div>

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={handleRetry} />}
    </div>
  );
};

export default Level5;
