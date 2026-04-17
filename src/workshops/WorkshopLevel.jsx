import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from '../components/Cinematic';
import { useValidation } from '../hooks/useValidation';
import Train, { generateWagons } from '../components/Train';
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
} from '../components/TrackViews';
import CoachPatrick from '../components/CoachPatrick';
import AudioVisualizer from '../components/AudioVisualizer';
import { SUCCESS_MESSAGES } from '../constants/coachPatrick';

const WorkshopLevel = ({ 
  trackConfig, 
  title, 
  description, 
  levelId,
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
  coachTips = [],
  isBlindMode = false,
  forceComplexWagons = false
}) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinSequence, setIsWinSequence] = useState(false);
  const [currentBpmBDisplay, setCurrentBpmBDisplay] = useState(0);

  const trackARef = useRef(null);
  const trackBRef = useRef(null);
  const audioCtxRef = useRef(null);
  const speedRef = useRef(1);
  const animTimeRef = useRef(0);

  const configA = trackConfig.A;
  const configB = trackConfig.B;
  const bpmA = configA.bpm;
  const trackLengthSec = 160;

  const currentBpmA = configA.bpm * ((audioCtxRef.current && audioCtxRef.current.decks.A) ? audioCtxRef.current.decks.A.rate : 1);
  const currentBpmB = configB.bpm * ((audioCtxRef.current && audioCtxRef.current.decks.B) ? audioCtxRef.current.decks.B.rate : 1);

  const initialBpmB = useRef(randomizeBpm ? (configB.bpm + (Math.random() * 20 - 10)) : configB.bpm).current;
  const [pitch, setPitch] = useState(initialBpmB / configB.bpm);

  const wagonsA = useMemo(() => generateWagons(bpmA, trackLengthSec, forceComplexWagons || viewType !== 'simple'), [bpmA, viewType, forceComplexWagons]);
  const wagonsB = useMemo(() => generateWagons(configB.bpm, trackLengthSec, forceComplexWagons || viewType !== 'simple'), [configB.bpm, viewType, forceComplexWagons]);
  const phraseBlocksA = useMemo(() => buildPhraseBlocks(bpmA, trackLengthSec), [bpmA]);
  const phraseBlocksB = useMemo(() => buildPhraseBlocks(configB.bpm, trackLengthSec), [configB.bpm]);

  const { config, isLevelCleared, isPerfectPitch, isPerfectSync, startStatus, getGrade, validate, validateStart, resetStartStatus } = useValidation(difficulty);

  useEffect(() => {
    if (isLevelCleared && !isWinSequence) {
      setIsWinSequence(true);
      if (onUnlockNext) onUnlockNext();
      
      if (audioCtxRef.current) {
        audioCtxRef.current.fadeOutDeck('A', 1.5);
        audioCtxRef.current.fadeOutDeck('B', 1.5);
      }

      const startTime = performance.now();
      const initialSpeed = speedRef.current;
      const animateSlowdown = (time) => {
        const elapsed = (time - startTime) / 1500;
        if (elapsed < 1) {
          speedRef.current = initialSpeed * (1 - elapsed);
          requestAnimationFrame(animateSlowdown);
        } else {
          speedRef.current = 0;
        }
      };
      requestAnimationFrame(animateSlowdown);
    }
  }, [isLevelCleared, isWinSequence, onUnlockNext]);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    audioCtxRef.current = ctx;
    ctx.init().then(() => {
      ctx.loadTrack('A', configA.url, configA.bpm, trackLengthSec, configA.complexity);
      ctx.loadTrack('B', configB.url, configB.bpm, trackLengthSec, configB.complexity);
      ctx.setPlaybackRate('B', initialBpmB / configB.bpm);
      setAudioCtx(ctx);
    });

    return () => {
      if (ctx && ctx.ctx) ctx.ctx.close().catch(() => {});
    };
  }, [configA, configB, initialBpmB]);

  useAnimationFrame((deltaTime) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isGameOver) return;

    if (speedRef.current > 0) {
      animTimeRef.current += (deltaTime / 1000) * speedRef.current;
    }
    
    if (!ctx.decks || !ctx.decks.A || !ctx.decks.B) return;

    const currentBpmA = configA.bpm * (ctx.decks.A.rate || 1);
    const currentBpmB = configB.bpm * (ctx.decks.B.rate || 1);

    const currentA = isWinSequence ? (ctx.decks.A.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('A');
    const currentB = isWinSequence ? (ctx.decks.B.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('B');

    const zoom = 100;
    const effZoomA = zoom; 
    const effZoomB = zoom / (ctx.decks.B.rate || 1);

    if (trackARef.current) {
      trackARef.current.style.transform = `translateX(${-currentA * effZoomA}px)`;
    }
    if (trackBRef.current) {
      trackBRef.current.style.transform = `translateX(${-currentB * effZoomB}px)`;
    }

    if (isWinSequence) return;

    const beatsA = currentA * (bpmA / 60);
    const beatsB = currentB * (configB.bpm / 60);
    
    const phraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE) % NUM_PHRASES;
    const phraseIdxB = Math.floor(beatsB / BEATS_PER_PHRASE) % NUM_PHRASES;
    
    if (viewType === 'phrase') {
      const pA = PHRASES[phraseIdxA];
      const pB = PHRASES[phraseIdxB];
      if (currentPhraseA?.index !== phraseIdxA) setCurrentPhraseA(pA);
      if (currentPhraseB?.index !== phraseIdxB) setCurrentPhraseB(pB);
    }

    if (currentA >= trackLengthSec - 0.2) {
      ctx.pauseTrack('A');
      ctx.pauseTrack('B');
      setIsGameOver(true);
    }

    setCurrentBpmBDisplay(currentBpmB);

    if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying) {
      let diffSec = 0;
      let syncCompatible = true;
      const nativeSecPerBeatA = 60 / configA.bpm;
      const nativeSecPerBeatB = 60 / configB.bpm;

      if (viewType === 'simple') {
        const cycleSecA = nativeSecPerBeatA;
        const cycleSecB = nativeSecPerBeatB;

        const progA = (currentA % cycleSecA) / cycleSecA;
        const progB = (currentB % cycleSecB) / cycleSecB;
        let diffProg = Math.abs(progA - progB);
        if (diffProg > 0.5) diffProg = 1 - diffProg;
        diffSec = diffProg * cycleSecA;
      } else if (viewType === 'loop') {
        let diff = Math.abs((beatsA % 8) - (beatsB % 8));
        if (diff > 4) diff = 8 - diff;
        diffSec = diff / (currentBpmA / 60);
      } else {
        syncCompatible = compatiblePhrases 
          ? compatiblePhrases.some(([a, b]) => a === phraseIdxA && b === phraseIdxB)
          : (phraseIdxA === 4 && phraseIdxB === 0);

        let diff = Math.abs((beatsA % BEATS_PER_PHRASE) - (beatsB % BEATS_PER_PHRASE));
        if (diff > BEATS_PER_PHRASE / 2) diff = BEATS_PER_PHRASE - diff;
        diffSec = diff / (currentBpmA / 60);
      }

      validate(syncCompatible ? diffSec : 999, currentBpmB, currentBpmA);
    } else {
      // Still validate pitch even if not playing, but pass a high diffSec to prevent sync success
      validate(999, currentBpmB, currentBpmA);
    }
  });

  const playA = async () => { if (audioCtx && !isPlayingA) { await audioCtx.playTrack('A'); setIsPlayingA(true); } };
  const playB = async () => { 
    if (audioCtx && !isPlayingB) { 
      const currentPositionA = audioCtx.getTrackPosition('A');
      validateStart(currentPositionA, bpmA, levelId);
      
      await audioCtx.playTrack('B'); 
      setIsPlayingB(true); 
    } 
  };
  const pauseB = () => { if (audioCtx) { audioCtx.pauseTrack('B'); setIsPlayingB(false); resetStartStatus(); } };
  const cueB = () => { if (audioCtx) { audioCtx.cueTrack('B'); setIsPlayingB(false); resetStartStatus(); } };
  const nudgeB = (amount) => { if (audioCtx) audioCtx.nudgeTrack('B', amount); };

  const handlePitchChange = (e) => {
    const targetBpm = parseFloat(e.target.value);
    const newRate = targetBpm / configB.bpm;
    setPitch(newRate);
    if (audioCtx) audioCtx.setPlaybackRate('B', newRate);
  };



  return (
    <div className="app-container">
      <div className="level-header" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, zIndex: -1, pointerEvents: 'none' }}>
          <AudioVisualizer audioCtx={audioCtxRef.current} color="#ff6b6b" />
        </div>
        <button onClick={onBack} className="btn-crayon nudge-btn back-home-btn">Menu</button>
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
          
          {/* Status HUD - Hidden in Medium/Pro */}
          {difficulty === 'EASY' && (
            <div className="sync-hud" style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              pointerEvents: 'none'
            }}>
              <div style={{ 
                background: isPerfectPitch ? '#27ae60' : (currentBpmBDisplay < currentBpmA ? '#3498db' : '#e74c3c'), 
                color: 'white', 
                padding: '6px 15px', 
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: '900',
                border: '3px solid #333',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                fontFamily: 'inherit'
              }}>
                VITESSE : {isPerfectPitch ? 'OK' : (currentBpmBDisplay < currentBpmA ? 'ACCÉLÉRER ↑' : 'RALENTIR ↓')}
              </div>
              <div style={{ 
                background: isPerfectSync ? '#27ae60' : '#fff', 
                color: isPerfectSync ? 'white' : '#333', 
                padding: '6px 15px', 
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: '900',
                border: '3px solid #333',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                fontFamily: 'inherit'
              }}>
                ALIGNEMENT : {isPerfectSync ? 'OK' : 'À CALER'}
              </div>
              <div style={{ 
                background: startStatus === null ? '#fff' : (startStatus === 'ok' ? '#27ae60' : '#e74c3c'), 
                color: startStatus === null ? '#333' : 'white', 
                padding: '6px 15px', 
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: '900',
                border: '3px solid #333',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                fontFamily: 'inherit'
              }}>
                DÉPART : {
                  startStatus === null ? 'EN ATTENTE' : 
                  startStatus === 'ok' ? 'BON DÉPART' : 
                  startStatus === 'early' ? 'TROP TÔT' : 'TROP TARD'
                }
              </div>
            </div>
          )}
          {isBlindMode && (
            <div className="blind-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#fdfaf6',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
              fontSize: '3rem',
              fontWeight: '900',
              pointerEvents: 'none',
              border: '10px solid #333',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)',
              textAlign: 'center',
              padding: '40px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontFamily: 'inherit',
              opacity: 0.95
            }}>
              ÉCOUTE UNIQUEMENT...<br/>PAS DE TRICHE !
            </div>
          )}
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
          <h4>Vitesse</h4>
          <input 
            type="range" min={configB.bpm - 25} max={configB.bpm + 25} step="0.01" 
            value={configB.bpm * pitch} 
            onChange={handlePitchChange} 
            className="pitch-input-vertical" 
          />
          {showBpm ? (
            <div style={{ 
              fontWeight: 'bold', 
              marginTop: '10px', 
              color: (difficulty === 'EASY') ? (isPerfectPitch ? '#27ae60' : '#ff6b6b') : '#333' 
            }}>
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
            {isPlayingA ? 'En route...' : 'Démarrer Train A'}
          </button>
        </div>
        <div className="control-group">
          <h3>Train B</h3>
          <div className="control-buttons">
            <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB}>Play</button>
            <button className="btn-crayon play-btn" onClick={pauseB} disabled={!isPlayingB}>Pause</button>
            <button className="btn-crayon nudge-btn" onClick={cueB}>CUE</button>
            {allowNudge && (
              <>
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-config.nudgeAmount)}>Ralentir</button>
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(config.nudgeAmount)}>Accélérer</button>
              </>
            )}
          </div>
        </div>
      </div>

      {isWinSequence && (
        <Cinematic 
          type="win" 
          onNextLevel={onNextLevel} 
          message={SUCCESS_MESSAGES[levelId]} 
          title={title}
          grade={getGrade()}
        />
      )}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}

      <CoachPatrick tips={coachTips} />
    </div>
  );
};

export default WorkshopLevel;
