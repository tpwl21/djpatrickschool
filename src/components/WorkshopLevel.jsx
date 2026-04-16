import React, { useEffect, useState, useRef } from 'react';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import { useValidation } from '../hooks/useValidation';
import { generateWagons } from './Train';
import { 
  BEATS_PER_PHRASE, 
  PHRASES, 
  NUM_PHRASES, 
  buildPhraseBlocks,
  COMPATIBLE_PHRASE_PAIRS
} from '../utils/workshopUtils';
import { 
  LoopTrackView, 
  PhraseTrackView, 
  PhraseIndicator 
} from './TrackViews';
import CoachPatrick from './CoachPatrick';

/**
 * WorkshopLevel: The generic engine for DJ Teacher advanced workshops (4-7).
 */
const WorkshopLevel = ({ 
  trackConfig, 
  title, 
  description, 
  viewType = 'phrase', 
  showBpm = true, 
  randomizeBpm = false, 
  allowNudge = true,
  compatiblePhrases = null, // if null, used L5 simple outro/intro check
  difficulty,
  onNextLevel,
  onRetry,
  onBack,
  onUnlockNext,
  coachTips = [] // Added coachTips prop
}) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [posA, setPosA] = useState(0);
  const [posB, setPosB] = useState(0);
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const reqRef = useRef();

  const configA = trackConfig.A;
  const configB = trackConfig.B;
  const bpmA = configA.bpm;
  const trackLengthSec = 160;

  // Initial calculation of B's starting BPM for the challenge
  const initialBpmB = useRef(randomizeBpm ? (configB.bpm + (Math.random() * 20 - 10)) : configB.bpm).current;
  
  // Pitch is the playback rate relative to the Native BPM of the file
  const [pitch, setPitch] = useState(initialBpmB / configB.bpm);

  const wagonsA = useRef(generateWagons(bpmA, trackLengthSec, true)).current;
  const wagonsB = useRef(generateWagons(configB.bpm, trackLengthSec, true)).current;
  const phraseBlocksA = useRef(buildPhraseBlocks(bpmA, trackLengthSec)).current;
  const phraseBlocksB = useRef(buildPhraseBlocks(configB.bpm, trackLengthSec)).current;

  const { config, isLevelCleared, isPerfectPitch, isPerfectSync, validate } = useValidation(difficulty);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isLevelCleared && onUnlockNext) onUnlockNext();
  }, [isLevelCleared, onUnlockNext]);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      ctx.loadTrack('A', configA.url, configA.bpm, trackLengthSec, configA.complexity);
      ctx.loadTrack('B', configB.url, configB.bpm, trackLengthSec, configB.complexity);
      ctx.setPlaybackRate('B', initialBpmB / configB.bpm);
      setAudioCtx(ctx);
    });

    const updateLoop = () => {
      if (ctx) {
        const currentA = ctx.getTrackPosition('A');
        const currentB = ctx.getTrackPosition('B');
        setPosA(currentA);
        setPosB(currentB);

        const beatsA = currentA * (bpmA / 60);
        const beatsB = currentB * (configB.bpm / 60);
        const phraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE) % NUM_PHRASES;
        const phraseIdxB = Math.floor(beatsB / BEATS_PER_PHRASE) % NUM_PHRASES;
        
        if (viewType === 'phrase') {
          setCurrentPhraseA(PHRASES[phraseIdxA]);
          setCurrentPhraseB(PHRASES[phraseIdxB]);
        }

        if (currentA >= trackLengthSec - 0.2) {
          ctx.pauseTrack('A');
          ctx.pauseTrack('B');
          setIsGameOver(true);
        }

        if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying && !isGameOver) {
          let syncValid = false;
          let diffSec = 0;

          if (viewType === 'loop') {
            const beatsLoopA = beatsA % 8; // 8 is BEATS_PER_LOOP
            const beatsLoopB = (currentB * (configB.bpm / 60)) % 8;
            let diff = Math.abs(beatsLoopA - beatsLoopB);
            if (diff > 4) diff = 8 - diff;
            diffSec = diff / (bpmA / 60);
            syncValid = true; 
          } else {
            // Phrase based validation
            const isCompatible = compatiblePhrases 
              ? compatiblePhrases.some(([a, b]) => a === phraseIdxA && b === phraseIdxB)
              : (phraseIdxA === 4 && phraseIdxB === 0); // Default Level 5 behavior

            const posInPhraseA = beatsA % BEATS_PER_PHRASE;
            const posInPhraseB = beatsB % BEATS_PER_PHRASE;
            let diff = Math.abs(posInPhraseA - posInPhraseB);
            if (diff > BEATS_PER_PHRASE / 2) diff = BEATS_PER_PHRASE - diff;
            diffSec = diff / (bpmA / 60);
            syncValid = isCompatible;
          }

          const currentBpmB = configB.bpm * ctx.decks.B.rate;
          const { inFullSync } = validate(diffSec, currentBpmB, bpmA);
          if (!syncValid || !inFullSync) {
            validate(999, currentBpmB, bpmA); 
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

  const playA = async () => { if (audioCtx && !isPlayingA) { await audioCtx.playTrack('A'); setIsPlayingA(true); } };
  const playB = async () => { if (audioCtx && !isPlayingB) { await audioCtx.playTrack('B'); setIsPlayingB(true); } };
  const pauseB = () => { if (audioCtx) { audioCtx.pauseTrack('B'); setIsPlayingB(false); } };
  const cueB = () => { if (audioCtx) { audioCtx.cueTrack('B'); setPosB(0); setIsPlayingB(false); } };
  const nudgeB = (amount) => {
    if (!audioCtx) return;
    audioCtx.nudgeTrack('B', amount);
    setPosB(audioCtx.getTrackPosition('B'));
  };

  const handlePitchChange = (e) => {
    const targetBpm = parseFloat(e.target.value);
    const newRate = targetBpm / configB.bpm;
    setPitch(newRate);
    if (audioCtx) audioCtx.setPlaybackRate('B', newRate);
  };

  return (
    <div className="app-container">
      <div className="level-header">
        <button onClick={onBack} className="btn-crayon nudge-btn back-home-btn">🏠 Menu</button>
        <h1>{title}</h1>
        <p dangerouslySetInnerHTML={{ __html: description }} />
      </div>

      {viewType === 'phrase' && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '8px 20px', gap: '12px' }}>
          <PhraseIndicator label="Train A" currentPhrase={currentPhraseA} isOutro={[3, 4].includes(currentPhraseA?.index)} />
          <PhraseIndicator label="Train B" currentPhrase={currentPhraseB} />
        </div>
      )}

      <div className="main-gameplay">
        <div className="railway-container">
          <div className="target-line" />
          <div className="track-container">
            {viewType === 'loop' ? (
              <LoopTrackView wagons={wagonsA} currentPositionSec={posA} bpm={bpmA} isPlaying={isPlayingA} trackLengthSec={trackLengthSec} />
            ) : (
              <PhraseTrackView phraseBlocks={phraseBlocksA} wagons={wagonsA} currentPositionSec={posA} bpm={bpmA} isPlaying={isPlayingA} />
            )}
          </div>
          <div className="track-container">
            {viewType === 'loop' ? (
              <LoopTrackView wagons={wagonsB} currentPositionSec={posB} bpm={configB.bpm} isPlaying={isPlayingB} pitch={pitch} trackLengthSec={trackLengthSec} />
            ) : (
              <PhraseTrackView phraseBlocks={phraseBlocksB} wagons={wagonsB} currentPositionSec={posB} bpm={configB.bpm} isPlaying={isPlayingB} pitch={pitch} />
            )}
          </div>
        </div>

        <div className="pitch-fader-container">
          <h4>{randomizeBpm ? 'Pitch' : 'Vitesse'}</h4>
          <input 
            type="range" min="100" max="150" step="0.01" 
            value={configB.bpm * pitch} 
            onChange={handlePitchChange} 
            className="pitch-input-vertical" 
          />
          {showBpm ? (
            <div style={{ fontWeight: 'bold', marginTop: '10px', color: isPerfectPitch ? '#27ae60' : '#ff6b6b' }}>
              {(configB.bpm * pitch).toFixed(1)} BPM
            </div>
          ) : (
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: pitch >= (initialBpmB / configB.bpm) ? '#ff6b6b' : '#4ecdc4', marginTop: '10px' }}>
              {pitch >= (initialBpmB / configB.bpm) ? '+' : ''}{((pitch - (initialBpmB / configB.bpm)) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <h3>Train A {showBpm && `(${bpmA.toFixed(1)} BPM)`}</h3>
          <button className="btn-crayon play-btn" onClick={playA} disabled={isPlayingA}>
            {isPlayingA ? 'En route... 🚂' : 'Démarrer Train A 🏁'}
          </button>
        </div>
        <div className="control-group">
          <h3>Train B</h3>
          <div className="control-buttons">
            <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB}>Play 🚂</button>
            <button className="btn-crayon play-btn" onClick={pauseB} disabled={!isPlayingB}>Pause ⏸</button>
            <button className="btn-crayon nudge-btn" onClick={cueB}>CUE ⏮</button>
            {allowNudge && (
              <>
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-config.nudgeAmount)}>⏪ Reculer</button>
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(config.nudgeAmount)}>Avancer ⏩</button>
              </>
            )}
          </div>
        </div>
      </div>

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}

      <CoachPatrick tips={coachTips} />
    </div>
  );
};


export default WorkshopLevel;
