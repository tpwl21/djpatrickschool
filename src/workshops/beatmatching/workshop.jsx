import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import PitchBlock from '../../components/PitchBlock';
import Cinematic from '../../components/Cinematic';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useAudioDeck } from '../../hooks/useAudioDeck';
import { useWinSequence } from '../../hooks/useWinSequence';
import { useMobileDetection, useShortViewport } from '../../hooks/useMobileDetection';
import { LanguageContext } from '../../hooks/LanguageContext';
import { useMidiControl } from '../../hooks/useMidiControl';
import Train, { generateWagons } from '../../components/Train';
import {
  BEATS_PER_PHRASE,
  PHRASES,
  NUM_PHRASES,
  buildPhraseBlocks,
} from '../../utils/workshopUtils';
import {
  LoopTrackView,
  PhraseTrackView,
  PhraseIndicator,
} from '../../components/TrackViews';
import AudioVisualizer from '../../components/AudioVisualizer';
import { getLevel, workshops } from '../../lib/levels/load';
import { applyDefaults, matchesStartRule } from '../../lib/levels/rules';
import { t as pickText } from '../../lib/levels/schema';
import NudgeButton from '../../components/NudgeButton';
import LevelHeader from '../../components/LevelHeader';
import { useDifficulty } from '../../hooks/useDifficulty.jsx';
import LoadingLabel from '../../components/LoadingLabel';

const TRACK_LENGTH_SEC = 160;

const FALLBACK_LEVEL = {
  en: {}, fr: {}, ui: {},
  track: { A: { bpm: 120, url: '', complexity: 1 }, B: { bpm: 120, url: '', complexity: 1 } },
  validation: {}, markers: {},
};

const BeatmatchingLevel = ({ levelId, difficulty: propDifficulty = 'EASY', onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const { t, language } = useContext(LanguageContext);
  // We use the global context for difficulty now
  const [difficulty] = useDifficulty();

  const resolvedLevel = getLevel('beatmatching', levelId);
  const level = resolvedLevel || FALLBACK_LEVEL;

  const workshopMeta = workshops.beatmatching?.meta ?? {};
  const tuning = applyDefaults(level.validation, workshopMeta.validation_defaults, difficulty);
  const startRule = level.validation?.start_rule || {};

  const {
    view_type: viewType = 'phrase',
    show_bpm: showBpm = true,
    allow_nudge: allowNudge = true,
    randomize_bpm: randomizeBpm = false,

    force_complex_wagons: forceComplexWagons = false,
    start_position_b_beats: startPositionBBeats = 0,
  } = level.ui || {};

  const isBlindMode = difficulty === 'PRO';

  const levelText = pickText(level, language);
  const title = levelText?.title;
  const description = levelText?.description;
  const coachTips = levelText?.coach_tips || [];
  const successMessage = levelText?.success;
  const markersA = level.markers?.A || [];
  const markersB = level.markers?.B || [];

  const configA = level.track?.A;
  const configB = level.track?.B;
  const bpmA = configA?.bpm ?? 120;

  const isMobile = useMobileDetection();
  const isShort = useShortViewport();
  const { audioCtx, audioCtxRef, isReady, loadError } = useAudioDeck(configA, configB, TRACK_LENGTH_SEC);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);

  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentBpmBDisplay, setCurrentBpmBDisplay] = useState(0);
  const [activeMidiNudge, setActiveMidiNudge] = useState(0);

  const [isPerfectPitch, setIsPerfectPitch] = useState(false);
  const [isPerfectSync, setIsPerfectSync] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [startStatus, setStartStatus] = useState(null);

  const { isWinSequence, speedRef, animTimeRef } = useWinSequence(isLevelCleared, audioCtxRef, onUnlockNext);

  const trackARef = useRef(null);
  const trackBRef = useRef(null);

  const initialBpmB = useRef(randomizeBpm ? (configB.bpm + (Math.random() * 20 - 10)) : configB.bpm).current;
  const [pitch, setPitch] = useState(initialBpmB / configB.bpm);
  const latestPitchRef = useRef(initialBpmB / configB.bpm);
  const lastUiUpdateRef = useRef(0);
  const jogLastDirRef = useRef(0);
  const jogLastPulseTimeRef = useRef(0);

  const syncStabilityRef = useRef(0);
  const syncStartTimeRef = useRef(0);
  const scoreRef = useRef(0);

  const midiStateRef = useRef({ pitchVelocity: null, buttons: {} });

  const wagonsA = useMemo(() => generateWagons(bpmA, TRACK_LENGTH_SEC, forceComplexWagons || viewType !== 'simple'), [bpmA, viewType, forceComplexWagons]);
  const wagonsB = useMemo(() => generateWagons(configB.bpm, TRACK_LENGTH_SEC, forceComplexWagons || viewType !== 'simple'), [configB.bpm, viewType, forceComplexWagons]);
  const phraseBlocksA = useMemo(() => buildPhraseBlocks(bpmA, TRACK_LENGTH_SEC), [bpmA]);
  const phraseBlocksB = useMemo(() => buildPhraseBlocks(configB.bpm, TRACK_LENGTH_SEC), [configB.bpm]);

  const pitchToleranceBpm = tuning.pitch_tolerance_bpm ?? 0.2;
  const toleranceSec = tuning.tolerance_sec ?? 0.040;
  const winDurationSec = tuning.win_duration_sec ?? 3.0;

  useEffect(() => {
    if (!audioCtx) return;
    audioCtx.setPlaybackRate('B', initialBpmB / configB.bpm);
    if (startPositionBBeats > 0) {
      audioCtx.decks.B.currentPosition = (startPositionBBeats - 1) * (60 / configB.bpm);
    }
  }, [audioCtx, initialBpmB, configB.bpm, startPositionBBeats]);

  const validatePitchSync = (diffSec, currentBpmB, currentBpmA, startOk) => {
    const pitchDiff = Math.abs(currentBpmB - currentBpmA);
    const pitchCorrect = pitchDiff < pitchToleranceBpm;
    setIsPerfectPitch(pitchCorrect);

    const instantSyncCorrect = diffSec < toleranceSec;
    if (instantSyncCorrect) {
      syncStabilityRef.current = Math.min(syncStabilityRef.current + 1, 10);
      if (syncStabilityRef.current >= 3) setIsPerfectSync(true);
    } else {
      syncStabilityRef.current = Math.max(syncStabilityRef.current - 1, -10);
      if (syncStabilityRef.current <= -3) setIsPerfectSync(false);
    }
    const syncCorrect = instantSyncCorrect || (syncStabilityRef.current > 0);

    const inFullSync = pitchCorrect && syncCorrect && startOk;
    if (inFullSync) {
      scoreRef.current += 1;
      if (syncStartTimeRef.current === 0) {
        syncStartTimeRef.current = performance.now();
      } else if (performance.now() - syncStartTimeRef.current > winDurationSec * 1000) {
        setIsLevelCleared(true);
      }
    } else {
      syncStartTimeRef.current = 0;
    }
  };

  useAnimationFrame((deltaTime) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isGameOver || !isReady) return;

    if (speedRef.current > 0) animTimeRef.current += (deltaTime / 1000) * speedRef.current;
    if (!ctx.decks || !ctx.decks.A || !ctx.decks.B) return;

    const currentBpmA = configA.bpm * (ctx.decks.A.rate || 1);
    const currentBpmB = configB.bpm * (ctx.decks.B.rate || 1);

    const currentA = isWinSequence ? (ctx.decks.A.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('A');
    const currentB = isWinSequence ? (ctx.decks.B.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('B');

    const zoom = isMobile ? 60 : 100;
    const effZoomA = zoom;
    const effZoomB = zoom / (ctx.decks.B.rate || 1);

    if (trackARef.current) trackARef.current.style.transform = `translateX(${-currentA * effZoomA}px)`;
    if (trackBRef.current) trackBRef.current.style.transform = `translateX(${-currentB * effZoomB}px)`;

    if (isWinSequence) return;

    const mState = midiStateRef.current;
    if (mState.pitchVelocity !== null) {
      const minBpm = configB.bpm - 25;
      const maxBpm = configB.bpm + 25;
      const targetBpm = minBpm + (mState.pitchVelocity / 127) * (maxBpm - minBpm);
      handlePitchChange(targetBpm);
      mState.pitchVelocity = null;
    }
    if (mState.buttons[0x0B] > 0) mState.buttons[0x0B] = 0;

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

    if (currentA >= TRACK_LENGTH_SEC - 0.2) {
      ctx.pauseTrack('A');
      ctx.pauseTrack('B');
      setIsGameOver(true);
    }

    setCurrentBpmBDisplay(currentBpmB);

    if (ctx.decks.A.isPlaying && ctx.decks.B.isPlaying) {
      const nativeSecPerBeatA = 60 / configA.bpm;
      const nativeSecPerBeatB = 60 / configB.bpm;
      const progA = (currentA % nativeSecPerBeatA) / nativeSecPerBeatA;
      const progB = (currentB % nativeSecPerBeatB) / nativeSecPerBeatB;
      let diffProg = Math.abs(progA - progB);
      if (diffProg > 0.5) diffProg = 1 - diffProg;
      const beatDiffSec = diffProg * nativeSecPerBeatA;

      validatePitchSync(beatDiffSec, currentBpmB, currentBpmA, startStatus === 'ok');
    } else {
      validatePitchSync(999, currentBpmB, currentBpmA, startStatus === 'ok');
    }
  });

  const playA = async () => { if (audioCtx && !isPlayingA) { await audioCtx.playTrack('A'); setIsPlayingA(true); } };
  const playB = async () => {
    if (audioCtx && !isPlayingB) {
      const currentPositionA = audioCtx.getTrackPosition('A');
      const { status } = matchesStartRule(currentPositionA, bpmA, startRule);
      setStartStatus(status);

      await audioCtx.playTrack('B');
      setIsPlayingB(true);
    }
  };
  const cueB = () => {
    if (audioCtx) {
      const startPosSec = startPositionBBeats > 1 ? (startPositionBBeats - 1) * (60 / configB.bpm) : 0;
      audioCtx.cueTrack('B', startPosSec);
      setIsPlayingB(false);
      setStartStatus(null);
    }
  };

  const handlePitchChange = (targetBpmOrEvent) => {
    let targetBpm;
    if (typeof targetBpmOrEvent === 'object' && targetBpmOrEvent.target) {
      targetBpm = parseFloat(targetBpmOrEvent.target.value);
    } else {
      targetBpm = targetBpmOrEvent;
    }
    const newRate = targetBpm / configB.bpm;
    latestPitchRef.current = newRate;
    if (audioCtxRef.current) audioCtxRef.current.setPlaybackRate('B', newRate);
    const now = performance.now();
    if (now - lastUiUpdateRef.current > 33) {
      setPitch(newRate);
      lastUiUpdateRef.current = now;
    }
  };

  useMidiControl((data) => {
    if (!isReady || isGameOver) return;
    const [status, note, velocity] = data;
    const channel = (status & 0x0F) + 1;
    const type = status & 0xF0;

    if (type === 0xB0) {
      if (note === 0x00 && channel === 2) {
        midiStateRef.current.pitchVelocity = velocity;
        const minBpm = configB.bpm - 25;
        const maxBpm = configB.bpm + 25;
        const targetBpm = minBpm + (velocity / 127) * (maxBpm - minBpm);
        const newRate = targetBpm / configB.bpm;
        latestPitchRef.current = newRate;
        if (audioCtxRef.current) audioCtxRef.current.setPlaybackRate('B', newRate);
      }
      if (note === 0x22 && channel === 2) {
        const delta = velocity > 64 ? (velocity - 64) : (velocity - 128);
        const dir = delta > 0 ? 1 : -1;
        const now = performance.now();
        if (dir !== jogLastDirRef.current || (now - jogLastPulseTimeRef.current > 250)) {
          const bendRate = latestPitchRef.current * (1 + dir * 0.04);
          audioCtxRef.current.setPlaybackRate('B', bendRate);
          setPitch(bendRate);
          jogLastDirRef.current = dir;
          jogLastPulseTimeRef.current = now;
          setActiveMidiNudge(dir);
          setTimeout(() => {
            audioCtxRef.current?.setPlaybackRate('B', latestPitchRef.current);
            setPitch(latestPitchRef.current);
            setActiveMidiNudge(0);
          }, 150);
        }
      }
      return;
    }

    if (type === 0x90 && velocity > 0) {
      if (note === 0x0B) {
        if (channel === 1) playA();
        else if (channel === 2) playB();
      }
      if (note === 0x0C && channel === 2) cueB();
    }
  });

  const trackPixelZoom = isMobile ? 60 : 100;

  if (!resolvedLevel) {
    return (
      <div className="app-container">
        <LevelHeader title={t('notFound.title')} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <LevelHeader
        coachTips={coachTips}
        audioError={loadError}
        coach={{ bpm: (isPlayingA || isPlayingB) ? bpmA : undefined, mood: difficulty === 'EASY' && (isPlayingA && isPlayingB) ? (isPerfectPitch && isPerfectSync ? 'content' : 'focus') : undefined }}
        title={title}
        description={description}
        onBack={onBack}
        audioCtx={audioCtxRef.current}
        vizColor="#ff6b6b"
      >
        {difficulty === 'EASY' && (
          <div className="sync-hud-container" style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center',
          }}>
            <div style={{
              background: isPerfectPitch ? '#1e8449' : (currentBpmBDisplay < configA.bpm * (audioCtxRef.current?.decks.A.rate || 1) ? '#2471a3' : '#c0392b'),
              color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
              fontWeight: '900', border: '2px solid #333', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              {isPerfectPitch ? t('workshop.status.pitchOk') : (currentBpmBDisplay < configA.bpm * (audioCtxRef.current?.decks.A.rate || 1) ? t('workshop.status.pitchPlus') : t('workshop.status.pitchMinus'))}
            </div>
            <div style={{
              background: isPerfectSync ? '#1e8449' : '#fff',
              color: isPerfectSync ? 'white' : '#333', padding: '4px 12px', borderRadius: '12px',
              fontSize: '0.75rem', fontWeight: '900', border: '2px solid #333',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.1)', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              {isPerfectSync ? t('workshop.status.syncOk') : t('workshop.status.toSync')}
            </div>
            <div style={{
              background: startStatus === null ? '#fff' : (startStatus === 'ok' ? '#1e8449' : '#c0392b'),
              color: startStatus === null ? '#333' : 'white', padding: '4px 12px',
              borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', border: '2px solid #333',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.1)', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              {startStatus === null ? t('workshop.status.startWaiting')
                : startStatus === 'ok' ? t('workshop.status.startOk')
                : startStatus === 'early' ? t('workshop.status.early')
                : t('workshop.status.late')}
            </div>
          </div>
        )}
      </LevelHeader>

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
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: '#fdfaf6', zIndex: 20, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#333', fontSize: '3rem', fontWeight: '900',
              pointerEvents: 'none', border: '10px solid #333',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)', textAlign: 'center', padding: '40px',
              textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'inherit', opacity: 0.95,
            }}>
              <span dangerouslySetInnerHTML={{ __html: t('workshop.blindModeWarning') }} />
            </div>
          )}
          <div className="track-container">
            {viewType === 'simple' ? (
              <Train ref={trackARef} wagons={wagonsA} bpm={bpmA} zoomLevel={trackPixelZoom} />
            ) : viewType === 'loop' ? (
              <LoopTrackView ref={trackARef} wagons={wagonsA} bpm={bpmA} trackLengthSec={TRACK_LENGTH_SEC} zoomLevel={trackPixelZoom} markers={markersA} />
            ) : (
              <PhraseTrackView ref={trackARef} phraseBlocks={phraseBlocksA} wagons={wagonsA} bpm={bpmA} zoomLevel={trackPixelZoom} markers={markersA} />
            )}
          </div>
          <div className="track-container">
            {viewType === 'simple' ? (
              <Train ref={trackBRef} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} zoomLevel={trackPixelZoom} />
            ) : viewType === 'loop' ? (
              <LoopTrackView ref={trackBRef} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} trackLengthSec={TRACK_LENGTH_SEC} zoomLevel={trackPixelZoom} markers={markersB} />
            ) : (
              <PhraseTrackView ref={trackBRef} phraseBlocks={phraseBlocksB} wagons={wagonsB} bpm={configB.bpm} pitch={pitch} zoomLevel={trackPixelZoom} markers={markersB} />
            )}
          </div>
        </div>

        <div className="pitch-fader-container" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <PitchBlock
            nativeBpm={configB.bpm}
            rate={pitch}
            onRateChange={(r) => handlePitchChange({ target: { value: r * configB.bpm } })}
            targetBpm={showBpm ? bpmA : null}
            showTargetBadge={showBpm}
            showBpm={showBpm}
            showPercent={true}
            percentBaseline={initialBpmB / configB.bpm}
            bpmColor={showBpm && difficulty === 'EASY' ? (isPerfectPitch ? '#27ae60' : '#ff6b6b') : '#ffffff'}
            percentColor={pitch >= (initialBpmB / configB.bpm) ? '#ff6b6b' : '#4ecdc4'}
            orientation={isMobile && !isShort ? 'horizontal' : 'vertical'}
            trackLength={isShort ? 90 : undefined}
            label=""
          />
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <h2>{t('workshop.trainA')}</h2>
          <button className="btn-crayon play-btn start-a-btn" onClick={playA} disabled={isPlayingA || !isReady}>
            {!isReady ? <LoadingLabel /> : (isPlayingA ? t('workshop.running') : t('workshop.startTrainA'))}
          </button>
        </div>
        <div className="control-group">
          <h2>{t('workshop.trainB')}</h2>
          <div className="control-buttons">
            <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB || !isReady}>{!isReady ? '...' : t('workshop.play')}</button>
            <button className="btn-crayon nudge-btn" onClick={cueB}>{t('workshop.cue')}</button>

            {allowNudge && (
              <div className="nudge-controls-row">
                <NudgeButton
                  audioCtxRef={audioCtxRef}
                  deckId="B"
                  dir={-1}
                  onPitchChange={setPitch}
                  label={t('workshop.slowDown')}
                  active={activeMidiNudge === -1}
                />
                <NudgeButton
                  audioCtxRef={audioCtxRef}
                  deckId="B"
                  dir={1}
                  onPitchChange={setPitch}
                  label={t('workshop.speedUp')}
                  active={activeMidiNudge === 1}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isWinSequence && (
        <Cinematic
          bpm={bpmA}
          type="win"
          onNextLevel={onNextLevel}
          message={successMessage}
          title={title}
          grade={scoreRef.current > 1000 ? 'S' : scoreRef.current > 500 ? 'A' : scoreRef.current > 200 ? 'B' : 'C'}
          recap={levelText?.recap}
        />
      )}
      {isGameOver && (
        <Cinematic
          type="lose"
          onRetry={onRetry}
          // conseil précis selon le dernier état du joueur
          hint={!isPerfectPitch ? 'pitch' : startStatus === 'early' ? 'early' : startStatus === 'late' ? 'late' : !isPerfectSync ? 'sync' : 'hold'}
        />
      )}
    </div>
  );
};

export default BeatmatchingLevel;
