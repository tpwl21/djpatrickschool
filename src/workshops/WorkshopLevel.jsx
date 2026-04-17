import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import PitchFader from '../components/PitchFader';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from '../components/Cinematic';
import { useValidation } from '../hooks/useValidation';
import Train, { generateWagons } from '../components/Train';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { LanguageContext } from '../hooks/LanguageContext';
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
  forceComplexWagons = false,
  startPositionBBeats = 0,
  markersA = [],
  markersB = []
}) => {
  const { t } = useContext(LanguageContext);
  const [audioCtx, setAudioCtx] = useState(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const currentBpmA = configA.bpm * (audioCtxRef.current?.decks.A.rate || 1);
  const currentBpmB = configB.bpm * (audioCtxRef.current?.decks.B.rate || 1);

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
    ctx.init().then(async () => {
      // Parallel load
      await Promise.all([
        ctx.loadTrack('A', configA.url, configA.bpm, trackLengthSec, configA.complexity),
        ctx.loadTrack('B', configB.url, configB.bpm, trackLengthSec, configB.complexity)
      ]);

      ctx.setPlaybackRate('B', initialBpmB / configB.bpm);

      if (startPositionBBeats > 0) {
        ctx.decks.B.currentPosition = (startPositionBBeats - 1) * (60 / configB.bpm);
      }

      setAudioCtx(ctx);
      setIsReady(true);
    });

    return () => {
      if (ctx && ctx.ctx) ctx.ctx.close().catch(() => { });
    };
  }, [configA, configB, initialBpmB]);

  useAnimationFrame((deltaTime) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isGameOver || !isReady) return;

    if (speedRef.current > 0) {
      animTimeRef.current += (deltaTime / 1000) * speedRef.current;
    }

    if (!ctx.decks || !ctx.decks.A || !ctx.decks.B) return;

    const currentBpmA = configA.bpm * (ctx.decks.A.rate || 1);
    const currentBpmB = configB.bpm * (ctx.decks.B.rate || 1);

    const currentA = isWinSequence ? (ctx.decks.A.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('A');
    const currentB = isWinSequence ? (ctx.decks.B.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('B');

    const zoom = isMobile ? 60 : 100;
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

      // We now use beat-based alignment for all levels to ensure visual/indicator consistency
      const cycleSecA = nativeSecPerBeatA;
      const cycleSecB = nativeSecPerBeatB;
      const progA = (currentA % cycleSecA) / cycleSecA;
      const progB = (currentB % cycleSecB) / cycleSecB;
      let diffProg = Math.abs(progA - progB);
      if (diffProg > 0.5) diffProg = 1 - diffProg;
      const beatDiffSec = diffProg * cycleSecA;

      validate(beatDiffSec, currentBpmB, currentBpmA);
    } else {
      // Still validate pitch even if not playing
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
  const cueB = () => {
    if (audioCtx) {
      const startPosSec = startPositionBBeats > 1 ? (startPositionBBeats - 1) * (60 / configB.bpm) : 0;
      audioCtx.cueTrack('B', startPosSec);
      setIsPlayingB(false);
      resetStartStatus();
    }
  };
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
        <button onClick={onBack} className="btn-crayon nudge-btn back-home-btn">{t('workshop.menu')}</button>
        <h1>{title}</h1>
        <p dangerouslySetInnerHTML={{ __html: description }} />

        {/* Status HUD - Moved here to prevent train display bugs */}
        {difficulty === 'EASY' && (
          <div className="sync-hud-container" style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: isMobile ? '5px' : '8px',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '15px',
            position: isMobile ? 'relative' : 'absolute',
            top: isMobile ? '0' : '20px',
            right: isMobile ? '0' : '20px',
            zIndex: 100
          }}>
            <div style={{
              background: isPerfectPitch ? '#27ae60' : (currentBpmBDisplay < currentBpmA ? '#3498db' : '#e74c3c'),
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '900',
              border: '2px solid #333',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}>
              {isPerfectPitch ? t('workshop.status.pitchOk') : (currentBpmBDisplay < currentBpmA ? t('workshop.status.pitchPlus') : t('workshop.status.pitchMinus'))}
            </div>
            <div style={{
              background: isPerfectSync ? '#27ae60' : '#fff',
              color: isPerfectSync ? 'white' : '#333',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '900',
              border: '2px solid #333',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}>
              {isPerfectSync ? t('workshop.status.syncOk') : t('workshop.status.toSync')}
            </div>
            <div style={{
              background: startStatus === null ? '#fff' : (startStatus === 'ok' ? '#27ae60' : '#e74c3c'),
              color: startStatus === null ? '#333' : 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '900',
              border: '2px solid #333',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}>
              {
                startStatus === null ? t('workshop.status.startWaiting') :
                  startStatus === 'ok' ? t('workshop.status.startOk') :
                    startStatus === 'early' ? t('workshop.status.early') : t('workshop.status.late')
              }
            </div>
          </div>
        )}
      </div>

      {viewType === 'phrase' && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '8px 20px', gap: '12px' }}>
          <PhraseIndicator label={t('workshop.trainA')} currentPhrase={currentPhraseA} isOutro={[3, 4].includes(currentPhraseA?.index)} />
          <PhraseIndicator label={t('workshop.trainB')} currentPhrase={currentPhraseB} />
        </div>
      )}

      <div className="main-gameplay">
        <div className="railway-container">
          <div className="target-line" />
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
              <span dangerouslySetInnerHTML={{ __html: t('workshop.blindModeWarning') }} />
            </div>
          )}
          <div className="track-container">
            {viewType === 'simple' ? (
              <Train ref={trackARef} wagons={wagonsA} bpm={bpmA} zoomLevel={isMobile ? 60 : 100} />
            ) : viewType === 'loop' ? (
              <LoopTrackView ref={trackARef} wagons={wagonsA} bpm={bpmA} trackLengthSec={trackLengthSec} zoomLevel={isMobile ? 60 : 100} markers={markersA} />
            ) : (
              <PhraseTrackView ref={trackARef} phraseBlocks={phraseBlocksA} wagons={wagonsA} bpm={bpmA} zoomLevel={isMobile ? 60 : 100} markers={markersA} />
            )}
          </div>
          <div className="track-container">
            {viewType === 'simple' ? (
              <Train ref={trackBRef} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} zoomLevel={isMobile ? 60 : 100} />
            ) : viewType === 'loop' ? (
              <LoopTrackView ref={trackBRef} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} trackLengthSec={trackLengthSec} zoomLevel={isMobile ? 60 : 100} markers={markersB} />
            ) : (
              <PhraseTrackView ref={trackBRef} phraseBlocks={phraseBlocksB} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} zoomLevel={isMobile ? 60 : 100} markers={markersB} />
            )}
          </div>
        </div>

        <div className="pitch-fader-container" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          {showBpm && (
            <div style={{ padding: '6px 12px', background: '#333', color: '#fff', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
              {t('workshop.trainA')}: {bpmA.toFixed(1)} BPM
            </div>
          )}
          <PitchFader
            min={configB.bpm - 25}
            max={configB.bpm + 25}
            value={configB.bpm * pitch}
            onChange={(val) => handlePitchChange({ target: { value: val } })}
            orientation={isMobile ? "horizontal" : "vertical"}
            label=""
          />
          {showBpm ? (
            <div style={{
              fontWeight: '900',
              marginTop: '10px',
              color: (difficulty === 'EASY') ? (isPerfectPitch ? '#27ae60' : '#ff6b6b') : '#333',
              fontSize: '1.2rem',
              fontFamily: 'inherit'
            }}>
              {(configB.bpm * pitch).toFixed(1)} BPM
            </div>
          ) : (
            <div style={{
              fontWeight: '900',
              fontSize: '1.2rem',
              color: pitch >= (initialBpmB / configB.bpm) ? '#ff6b6b' : '#4ecdc4',
              marginTop: '10px',
              fontFamily: 'inherit'
            }}>
              {pitch >= (initialBpmB / configB.bpm) ? '+' : ''}{((pitch - (initialBpmB / configB.bpm)) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <h3>{t('workshop.trainA')}</h3>
          <button className="btn-crayon play-btn start-a-btn" onClick={playA} disabled={isPlayingA || !isReady}>
            {!isReady ? t('workshop.loading') : (isPlayingA ? t('workshop.running') : t('workshop.startTrainA'))}
          </button>
        </div>
        <div className="control-group">
          <h3>{t('workshop.trainB')}</h3>
          <div className="control-buttons">
            <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB || !isReady}>{!isReady ? '...' : t('workshop.play')}</button>
            <button className="btn-crayon nudge-btn" onClick={cueB}>{t('workshop.cue')}</button>

            {allowNudge && (
              <div className="nudge-controls-row">
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(-config.nudgeAmount)}>{t('workshop.slowDown')}</button>
                <button className="btn-crayon nudge-btn" onClick={() => nudgeB(config.nudgeAmount)}>{t('workshop.speedUp')}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isWinSequence && (
        <Cinematic
          type="win"
          onNextLevel={onNextLevel}
          message={t('successMessages')[levelId]}
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
