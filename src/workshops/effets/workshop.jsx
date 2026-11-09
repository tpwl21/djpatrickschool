import React, { useEffect, useState, useRef, useContext } from 'react';
import { EqKnobs, VolumeFader, Crossfader } from '../../components/MixerControls';
import FilterKnob from '../../components/FilterKnob';
import DelayPad from '../../components/DelayPad';
import ReverbPad from '../../components/ReverbPad';
import LoopRollPads from '../../components/LoopRollPads';
import Cinematic from '../../components/Cinematic';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useAudioDeck } from '../../hooks/useAudioDeck';
import { useWinSequence } from '../../hooks/useWinSequence';
import { useMobileDetection, useShortViewport } from '../../hooks/useMobileDetection';
import { LanguageContext } from '../../hooks/LanguageContext';
import { BEATS_PER_PHRASE, PHRASES, NUM_PHRASES } from '../../utils/workshopUtils';
import { PhraseIndicator } from '../../components/TrackViews';
import AudioVisualizer from '../../components/AudioVisualizer';
import SimplifiedTimeline from '../../components/SimplifiedTimeline';
import { getLevel } from '../../lib/levels/load';
import { resolveActiveChecks, checkControl } from '../../lib/levels/rules';
import { t as pickText } from '../../lib/levels/schema';
import LevelHeader from '../../components/LevelHeader';
import { useDifficulty } from '../../hooks/useDifficulty.jsx';
import LoadingLabel from '../../components/LoadingLabel';

const TRACK_LENGTH_SEC = 160;

const FALLBACK_LEVEL = {
  en: {}, fr: {}, ui: {},
  track: { A: { bpm: 120, url: '', complexity: 1 }, B: { bpm: 120, url: '', complexity: 1 } },
  validation: {}, markers: {}, checks: [],
};

const EffetsLevel = ({ levelId, onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const { t, language } = useContext(LanguageContext);
  const [difficulty] = useDifficulty();

  const resolvedLevel = getLevel('effets', levelId);
  const level = resolvedLevel || FALLBACK_LEVEL;
  const levelText = pickText(level, language);
  const title = levelText?.title;
  const description = levelText?.description;
  const coachTips = levelText?.coach_tips || [];
  const successMessage = levelText?.success;

  const configA = level.track?.A;
  const configB = level.track?.B;
  const bpmA = configA?.bpm ?? 120;
  const checks = level.checks || [];

  const isMobile = useMobileDetection();
  const isCompact = useShortViewport(820); // portables : mixer resserré
  // divulgation progressive : seuls les modules enseignés par le niveau sont affichés ([ui] du TOML)
  const fxModules = level.ui?.fx_modules || ['filter', 'delay', 'reverb', 'loopRoll'];
  const showEq = level.ui?.show_eq !== false;
  const { audioCtx, audioCtxRef, isReady, loadError } = useAudioDeck(configA, configB, TRACK_LENGTH_SEC);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);

  const [fxState, setFxState] = useState({
    eqA: { low: 0, mid: 0, high: 0 },
    eqB: { low: 0, mid: 0, high: 0 },
    volA: 1.0,
    volB: 1.0,
    crossfader: 0.5,
    filterA: 0,
    filterB: 0,
    delayA: { mix: 0, timeBeats: 0.5, feedback: 0.5 },
    delayB: { mix: 0, timeBeats: 0.5, feedback: 0.5 },
    reverbA: 0,
    reverbB: 0,
    loopRollA: { size: 0, active: false },
    loopRollB: { size: 0, active: false },
  });

  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const [beatsA, setBeatsA] = useState(0);
  const [phraseProgress, setPhraseProgress] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFxOk, setIsFxOk] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const { isWinSequence, speedRef, animTimeRef } = useWinSequence(isLevelCleared, audioCtxRef, onUnlockNext);

  useEffect(() => {
    if (!audioCtx) return;
    audioCtx.setPlaybackRate('B', configA.bpm / configB.bpm);
  }, [audioCtx, configA?.bpm, configB?.bpm]);

  useEffect(() => {
    if (!audioCtx) return;
    audioCtx.setEq('A', 'low', fxState.eqA.low);
    audioCtx.setEq('A', 'mid', fxState.eqA.mid);
    audioCtx.setEq('A', 'high', fxState.eqA.high);
    audioCtx.setEq('B', 'low', fxState.eqB.low);
    audioCtx.setEq('B', 'mid', fxState.eqB.mid);
    audioCtx.setEq('B', 'high', fxState.eqB.high);
    const effVolA = fxState.volA * (1 - fxState.crossfader);
    const effVolB = fxState.volB * fxState.crossfader;
    audioCtx.setVolume('A', effVolA);
    audioCtx.setVolume('B', effVolB);
    audioCtx.setFilter('A', fxState.filterA);
    audioCtx.setFilter('B', fxState.filterB);
    audioCtx.setDelay('A', fxState.delayA);
    audioCtx.setDelay('B', fxState.delayB);
    audioCtx.setReverb('A', fxState.reverbA);
    audioCtx.setReverb('B', fxState.reverbB);
  }, [fxState, audioCtx]);

  const handleEqChange = (deckId, band, val) =>
    setFxState((p) => ({ ...p, [`eq${deckId}`]: { ...p[`eq${deckId}`], [band]: val } }));
  const handleFader = (deckId, val) => setFxState((p) => ({ ...p, [`vol${deckId}`]: val }));
  const handleCross = (val) => setFxState((p) => ({ ...p, crossfader: val }));
  const handleFilter = (deckId, val) => setFxState((p) => ({ ...p, [`filter${deckId}`]: val }));

  const handleDelayToggle = (deckId, active) =>
    setFxState((p) => ({ ...p, [`delay${deckId}`]: { ...p[`delay${deckId}`], mix: active ? 0.5 : 0 } }));
  const handleDelayMix = (deckId, mix) =>
    setFxState((p) => ({ ...p, [`delay${deckId}`]: { ...p[`delay${deckId}`], mix } }));
  const handleDelayTime = (deckId, timeBeats) =>
    setFxState((p) => ({ ...p, [`delay${deckId}`]: { ...p[`delay${deckId}`], timeBeats } }));

  const handleReverbToggle = (deckId, active) =>
    setFxState((p) => ({ ...p, [`reverb${deckId}`]: active ? 0.6 : 0 }));
  const handleReverbWet = (deckId, wet) =>
    setFxState((p) => ({ ...p, [`reverb${deckId}`]: wet }));

  const handleLoopRoll = (deckId, sizeBeats, active) => {
    if (audioCtx) audioCtx.triggerLoopRoll(deckId, sizeBeats, active);
    setFxState((p) => ({ ...p, [`loopRoll${deckId}`]: { size: sizeBeats, active } }));
  };

  useAnimationFrame((deltaTime) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isGameOver || !isReady) return;
    if (speedRef.current > 0) animTimeRef.current += (deltaTime / 1000) * speedRef.current;
    if (!ctx.decks?.A || !ctx.decks?.B) return;

    const currentA = isWinSequence ? (ctx.decks.A.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('A');
    const currentB = isWinSequence ? (ctx.decks.B.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('B');

    const bA = currentA * (bpmA / 60);
    const bB = currentB * (configB.bpm / 60);
    const pA = Math.floor(bA / BEATS_PER_PHRASE);
    const pB = Math.floor(bB / BEATS_PER_PHRASE);
    const progress = (bA % BEATS_PER_PHRASE) / BEATS_PER_PHRASE;

    if (currentPhraseA?.index !== pA) setCurrentPhraseA(PHRASES[pA % NUM_PHRASES]);
    if (currentPhraseB?.index !== pB) setCurrentPhraseB(PHRASES[pB % NUM_PHRASES]);
    setBeatsA(bA);
    setPhraseProgress(progress);

    if (currentA >= TRACK_LENGTH_SEC - 0.2 && !isWinSequence) {
      ctx.pauseTrack('A'); ctx.pauseTrack('B');
      setIsGameOver(true);
    }

    if (!ctx.decks.B.isPlaying) { setIsFxOk(true); return; }

    const active = resolveActiveChecks(checks, pA, progress);
    let ok = true;
    for (const c of active) { if (!checkControl(fxState, c).ok) { ok = false; break; } }
    setIsFxOk(ok);

    if (ok) {
      scoreRef.current += 1;
      if (pA >= 5 && scoreRef.current > 100) {
        setIsLevelCleared(true);
        setScore(scoreRef.current);
      }
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 5);
    }
  });

  const playA = async () => { if (audioCtx && !isPlayingA) { await audioCtx.playTrack('A'); setIsPlayingA(true); } };
  const cueA = () => { if (audioCtx) { audioCtx.cueTrack('A', 0); setIsPlayingA(false); } };
  const playB = async () => {
    if (audioCtx && !isPlayingB) {
      const deckB = audioCtx.decks.B;
      if (deckB && deckB.buffer) {
        const posA = audioCtx.getTrackPosition('A');
        const secPerBeatB = 60 / configB.bpm;
        const secPerPhraseB = secPerBeatB * BEATS_PER_PHRASE;
        deckB.currentPosition = (posA * deckB.rate) % secPerPhraseB;
      }
      await audioCtx.playTrack('B');
      setIsPlayingB(true);
    }
  };
  const cueB = () => { if (audioCtx) { audioCtx.cueTrack('B', 0); setIsPlayingB(false); } };

  const absolutePhraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE);
  const grade = isLevelCleared ? 'S' : 'C';

  if (!resolvedLevel) {
    return (
      <div className="app-container">
        <div className="level-header"><h1>{t('notFound.title')}</h1><p>{t('notFound.text')}</p></div>
        <button className="btn-crayon" onClick={onBack}>{t('workshop.menu')}</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <LevelHeader
        coachTips={coachTips}
        audioError={loadError}
        coach={{ bpm: (isPlayingA || isPlayingB) ? bpmA : undefined, mood: (isPlayingA || isPlayingB) ? (isFxOk ? 'content' : 'focus') : undefined }}
        title={title}
        description={description}
        onBack={onBack}
        audioCtx={audioCtxRef.current}
        vizColor="#27AE60"
      >
        {(isPlayingA || isPlayingB) && <div className="sync-hud-container" style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <div style={{
            background: isFxOk ? '#1e8449' : '#c0392b', color: 'white', padding: '4px 12px',
            borderRadius: 12, fontSize: '0.75rem', fontWeight: 900, border: '2px solid #333',
          }}>
            {isFxOk ? t('workshop.status.fxOk') : t('workshop.status.fxAdjust')} · {t('workshop.status.score')} {score}
          </div>
        </div>}
      </LevelHeader>

      <div className="phrase-row" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '8px 20px', gap: 12 }}>
        <PhraseIndicator label={t('workshop.trainA')} currentPhrase={currentPhraseA} isOutro={[3, 4].includes(currentPhraseA?.index)} />
        <PhraseIndicator label={t('workshop.trainB')} currentPhrase={currentPhraseB} />
      </div>

      <div className="main-gameplay" style={{ flexDirection: 'column', padding: '0 20px' }}>
        <SimplifiedTimeline levelId={levelId} currentPhraseIdx={absolutePhraseIdxA} progress={phraseProgress} totalPhrases={8} />
      </div>

      <div className="controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 15, gap: isMobile ? 10 : 20 }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '980px', margin: '0 auto', justifyContent: showEq ? 'space-between' : 'center', columnGap: showEq ? undefined : 'clamp(24px, 8vw, 120px)', alignItems: 'flex-start', gap: isMobile ? 5 : 20, flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
          {/* Deck A FX column */}
          <div className="control-group" style={{ display: 'flex', flex: showEq ? 1 : '0 0 auto', flexDirection: 'column', gap: isMobile ? 10 : 12, alignItems: 'center' }}>
            {/* fader à côté des modules FX (grille 2 colonnes) au lieu d'un empilement vertical */}
            <div className="fx-deck" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
            <VolumeFader value={fxState.volA} onChange={(v) => handleFader('A', v)} trackLength={isCompact ? 130 : 180} />
            <div className="fx-modules" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, auto)', gap: 12, justifyItems: 'center', alignItems: 'start' }}>
            {fxModules.includes('filter') && <FilterKnob value={fxState.filterA} onChange={(v) => handleFilter('A', v)} size={isCompact ? 46 : 55} />}
            {fxModules.includes('delay') && <DelayPad
              active={fxState.delayA.mix > 0}
              mix={fxState.delayA.mix}
              timeBeats={fxState.delayA.timeBeats}
              onToggle={(a) => handleDelayToggle('A', a)}
              onMixChange={(m) => handleDelayMix('A', m)}
              onTimeChange={(tb) => handleDelayTime('A', tb)}
            />}
            {fxModules.includes('reverb') && <ReverbPad
              active={fxState.reverbA > 0}
              wet={fxState.reverbA}
              onToggle={(a) => handleReverbToggle('A', a)}
              onWetChange={(w) => handleReverbWet('A', w)}
            />}
            {fxModules.includes('loopRoll') && <LoopRollPads onTrigger={(s, a) => handleLoopRoll('A', s, a)} />}
            </div>
            </div>
            <div className="control-buttons">
              <button className="btn-crayon play-btn start-a-btn" onClick={playA} disabled={isPlayingA || !isReady}>
                {!isReady ? <LoadingLabel /> : (isPlayingA ? t('workshop.running') : t('workshop.startTrainA'))}
              </button>
              <button className="btn-crayon nudge-btn" onClick={cueA}>{t('workshop.cue')}</button>
            </div>
          </div>

          {/* EQ center column */}
          {showEq && <div style={{ display: 'flex', gap: isMobile ? 15 : 40, alignItems: 'flex-start', justifyContent: 'center', padding: '15px 0' }}>
            <EqKnobs values={fxState.eqA} onChange={(b, v) => handleEqChange('A', b, v)} color="#4ecdc4" size={isMobile ? 35 : (isCompact ? 42 : 50)} gap={isCompact ? 8 : 12} />
            <EqKnobs values={fxState.eqB} onChange={(b, v) => handleEqChange('B', b, v)} color="#3498db" size={isMobile ? 35 : (isCompact ? 42 : 50)} gap={isCompact ? 8 : 12} />
          </div>}

          {/* Deck B FX column */}
          <div className="control-group" style={{ display: 'flex', flex: showEq ? 1 : '0 0 auto', flexDirection: 'column', gap: isMobile ? 10 : 12, alignItems: 'center' }}>
            <div className="fx-deck" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row-reverse' }}>
            <VolumeFader value={fxState.volB} onChange={(v) => handleFader('B', v)} trackLength={isCompact ? 130 : 180} />
            <div className="fx-modules" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, auto)', gap: 12, justifyItems: 'center', alignItems: 'start' }}>
            {fxModules.includes('filter') && <FilterKnob value={fxState.filterB} onChange={(v) => handleFilter('B', v)} size={isCompact ? 46 : 55} />}
            {fxModules.includes('delay') && <DelayPad
              active={fxState.delayB.mix > 0}
              mix={fxState.delayB.mix}
              timeBeats={fxState.delayB.timeBeats}
              onToggle={(a) => handleDelayToggle('B', a)}
              onMixChange={(m) => handleDelayMix('B', m)}
              onTimeChange={(tb) => handleDelayTime('B', tb)}
            />}
            {fxModules.includes('reverb') && <ReverbPad
              active={fxState.reverbB > 0}
              wet={fxState.reverbB}
              onToggle={(a) => handleReverbToggle('B', a)}
              onWetChange={(w) => handleReverbWet('B', w)}
            />}
            {fxModules.includes('loopRoll') && <LoopRollPads onTrigger={(s, a) => handleLoopRoll('B', s, a)} />}
            </div>
            </div>
            <div className="control-buttons">
              <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB || !isReady}>
                {!isReady ? <LoadingLabel compact /> : (isPlayingB ? t('workshop.running') : t('workshop.startTrainB'))}
              </button>
              <button className="btn-crayon nudge-btn" onClick={cueB}>{t('workshop.cue')}</button>
            </div>
          </div>
        </div>

        <div className="crossfader-group" style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <Crossfader value={fxState.crossfader} onChange={handleCross} />
        </div>
      </div>

      {isWinSequence && (
        <Cinematic type="win" bpm={bpmA} onNextLevel={onNextLevel} message={successMessage || 'FX propre !'} title={title} grade={grade} />
      )}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}
    </div>
  );
};

export default EffetsLevel;
