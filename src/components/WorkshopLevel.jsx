import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import { useValidation } from '../hooks/useValidation';
import Train, { generateWagons } from './Train';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { 
  BEATS_PER_PHRASE, 
  PHRASES, 
  NUM_PHRASES, 
  buildPhraseBlocks,
} from '../utils/workshopUtils';
import { 
  LoopTrackView, 
  PhraseTrackView, 
  PhraseIndicator 
} from './TrackViews';
import CoachPatrick from './CoachPatrick';

const WorkshopLevel = ({ 
  trackConfig, 
  title, 
  description, 
  viewType = 'phrase', 
  showBpm = true, 
  randomizeBpm = false, 
  allowNudge = true,
  compatiblePhrases = null,
  difficulty,
  onNextLevel,
  onRetry,
  onBack,
  onUnlockNext,
  coachTips = []
}) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  // These are for UI elements like indicators that don't need 60fps updates
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentBpmBDisplay, setCurrentBpmBDisplay] = useState(0);

  const trackARef = useRef(null);
  const trackBRef = useRef(null);
  const audioCtxRef = useRef(null);

  const configA = trackConfig.A;
  const configB = trackConfig.B;
  const bpmA = configA.bpm;
  const trackLengthSec = 160;

  const initialBpmB = useRef(randomizeBpm ? (configB.bpm + (Math.random() * 20 - 10)) : configB.bpm).current;
  const [pitch, setPitch] = useState(initialBpmB / configB.bpm);

  const wagonsA = useMemo(() => generateWagons(bpmA, trackLengthSec, viewType !== 'simple'), [bpmA, viewType]);
  const wagonsB = useMemo(() => generateWagons(configB.bpm, trackLengthSec, viewType !== 'simple'), [configB.bpm, viewType]);
  const phraseBlocksA = useMemo(() => buildPhraseBlocks(bpmA, trackLengthSec), [bpmA]);
  const phraseBlocksB = useMemo(() => buildPhraseBlocks(configB.bpm, trackLengthSec), [configB.bpm]);

  const { config, isLevelCleared, isPerfectPitch, validate } = useValidation(difficulty);

  useEffect(() => {
    if (isLevelCleared && onUnlockNext) onUnlockNext();
  }, [isLevelCleared, onUnlockNext]);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    audioCtxRef.current = ctx;
    ctx.init().then(() => {
      ctx.loadTrack('A', configA.url, configA.bpm, trackLengthSec, configA.complexity);
      ctx.loadTrack('B', configB.url, configB.bpm, trackLengthSec, configB.complexity);
      ctx.setPlaybackRate('B', initialBpmB / configB.bpm);
      setAudioCtx(ctx);
    });

    return () => ctx.ctx.close();
  }, []);

  useAnimationFrame(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || isLevelCleared || isGameOver) return;

    const currentA = ctx.getTrackPosition('A');
    const currentB = ctx.getTrackPosition('B');

    // High performance DOM updates
    const zoom = 100;
    const effZoomA = zoom; 
    const effZoomB = zoom / (ctx.decks.B.rate || 1);

    if (trackARef.current) {
      trackARef.current.style.transform = `translateX(${-currentA * effZoomA}px)`;
    }
    if (trackBRef.current) {
      trackBRef.current.style.transform = `translateX(${-currentB * effZoomB}px)`;
    }

    // Business Logic
    const beatsA = currentA * (bpmA / 60);
    const beatsB = currentB * (configB.bpm / 60);
    
    // Update phrase indicators only when they change
    const phraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE) % NUM_PHRASES;
    const phraseIdxB = Math.floor(beatsB / BEATS_PER_PHRASE) % NUM_PHRASES;
    
    if (viewType === 'phrase') {
      if (currentPhraseA?.index !== phraseIdxA) setCurrentPhraseA(PHRASES[phraseIdxA]);
      if (currentPhraseB?.index !== phraseIdxB) setCurrentPhraseB(PHRASES[phraseIdxB]);
    }

    if (currentA >= trackLengthSec - 0.2) {
      ctx.pauseTrack('A');
      ctx.pauseTrack('B');
      setIsGameOver(true);
    }

    if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying) {
      let diffSec = 0;
      let syncCompatible = true;

      if (viewType === 'simple') {
        const secPerBeat = 60 / bpmA;
        let diff = Math.abs((currentA % secPerBeat) - (currentB % secPerBeat));
        if (diff > secPerBeat * 0.5) diff = secPerBeat - diff;
        diffSec = diff;
      } else if (viewType === 'loop') {
        let diff = Math.abs((beatsA % 8) - (beatsB % 8));
        if (diff > 4) diff = 8 - diff;
        diffSec = diff / (bpmA / 60);
      } else {
        syncCompatible = compatiblePhrases 
          ? compatiblePhrases.some(([a, b]) => a === phraseIdxA && b === phraseIdxB)
          : (phraseIdxA === 4 && phraseIdxB === 0);

        let diff = Math.abs((beatsA % BEATS_PER_PHRASE) - (beatsB % BEATS_PER_PHRASE));
        if (diff > BEATS_PER_PHRASE / 2) diff = BEATS_PER_PHRASE - diff;
        diffSec = diff / (bpmA / 60);
      }

      const currentBpmB = configB.bpm * ctx.decks.B.rate;
      if (currentBpmB !== currentBpmBDisplay) setCurrentBpmBDisplay(currentBpmB);
      
      validate(syncCompatible ? diffSec : 999, currentBpmB, bpmA);
    }
  });

  const playA = async () => { if (audioCtx && !isPlayingA) { await audioCtx.playTrack('A'); setIsPlayingA(true); } };
  const playB = async () => { if (audioCtx && !isPlayingB) { await audioCtx.playTrack('B'); setIsPlayingB(true); } };
  const pauseB = () => { if (audioCtx) { audioCtx.pauseTrack('B'); setIsPlayingB(false); } };
  const cueB = () => { if (audioCtx) { audioCtx.cueTrack('B'); setIsPlayingB(false); } };
  const nudgeB = (amount) => { if (audioCtx) audioCtx.nudgeTrack('B', amount); };

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
            {viewType === 'simple' ? (
              <Train ref={trackARef} wagons={wagonsA} bpm={bpmA} />
            ) : viewType === 'loop' ? (
              <LoopTrackView ref={trackARef} wagons={wagonsA} bpm={bpmA} trackLengthSec={trackLengthSec} />
            ) : (
              <PhraseTrackView ref={trackARef} phraseBlocks={phraseBlocksA} wagons={wagonsA} bpm={bpmA} />
            )}
          </div>
          <div className="track-container">
            {viewType === 'simple' ? (
              <Train ref={trackBRef} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} />
            ) : viewType === 'loop' ? (
              <LoopTrackView ref={trackBRef} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} trackLengthSec={trackLengthSec} />
            ) : (
              <PhraseTrackView ref={trackBRef} phraseBlocks={phraseBlocksB} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} />
            )}
          </div>
        </div>

        <div className="pitch-fader-container">
          <h4>{randomizeBpm ? 'Pitch' : 'Vitesse'}</h4>
          <input 
            type="range" min={configB.bpm - 25} max={configB.bpm + 25} step="0.01" 
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
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-config.nudgeAmount)}>⏪ Ralentir</button>
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(config.nudgeAmount)}>Accélérer ⏩</button>
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
