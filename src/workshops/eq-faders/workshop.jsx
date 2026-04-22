import React, { useEffect, useState, useRef, useContext } from 'react';
import { EqKnobs, VolumeFader, Crossfader, GainKnob } from '../../components/MixerControls';
import VuMeter from '../../components/VuMeter';
import Cinematic from '../../components/Cinematic';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useAudioDeck } from '../../hooks/useAudioDeck';
import { useWinSequence } from '../../hooks/useWinSequence';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { LanguageContext } from '../../hooks/LanguageContext';
import { useMidiControl } from '../../hooks/useMidiControl';
import { useMidiMapping } from '../../hooks/useMidiMapping';
import { matchControl } from '../../constants/midiMappings';
import { BEATS_PER_PHRASE, PHRASES, NUM_PHRASES } from '../../utils/workshopUtils';
import { PhraseIndicator } from '../../components/TrackViews';
import CoachPatrick from '../../components/CoachPatrick';
import AudioVisualizer from '../../components/AudioVisualizer';
import ColorMixVisualizer from '../../components/ColorMixVisualizer';
import SimplifiedTimeline from '../../components/SimplifiedTimeline';
import { getLevel } from '../../lib/levels/load';
import { resolveActiveChecks, checkControl } from '../../lib/levels/rules';
import { t as pickText } from '../../lib/levels/schema';
import LevelHeader from '../../components/LevelHeader';
import { useDifficulty } from '../../hooks/useDifficulty.jsx';

const TRACK_LENGTH_SEC = 160;

const FALLBACK_LEVEL = {
  en: {}, fr: {}, ui: {},
  track: { A: { bpm: 120, url: '', complexity: 1 }, B: { bpm: 120, url: '', complexity: 1 } },
  validation: {}, markers: {}, checks: [],
};

const EqLevel = ({ levelId, difficulty: propDifficulty = 'EASY', onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const { t, language } = useContext(LanguageContext);
  const [difficulty] = useDifficulty();

  const resolvedLevel = getLevel('eq', levelId);
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
  const { audioCtx, audioCtxRef, isReady } = useAudioDeck(configA, configB, TRACK_LENGTH_SEC);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);

  const [eqState, setEqState] = useState({
    eqA: { low: 0, mid: 0, high: 0 },
    eqB: { low: 0, mid: 0, high: 0 },
    volA: 1.0,
    volB: 1.0,
    crossfader: 0.5,
    trimA: 1.0,
    trimB: 1.0,
    trimA_peak: 0,
    trimB_peak: 0,
  });

  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [currentPhraseB, setCurrentPhraseB] = useState(null);
  const [beatsA, setBeatsA] = useState(0);
  const [phraseProgress, setPhraseProgress] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isEqOk, setIsEqOk] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [score, setScore] = useState(0);

  const lastMidiUiUpdateRef = useRef(0);
  const midiEqBufferRef = useRef(null);
  const scoreRef = useRef(0);
  const peakUpdateRef = useRef(0);

  const { isWinSequence, speedRef, animTimeRef } = useWinSequence(isLevelCleared, audioCtxRef, onUnlockNext);

  useEffect(() => {
    if (!audioCtx) return;
    audioCtx.setPlaybackRate('B', configA.bpm / configB.bpm);
  }, [audioCtx, configA?.bpm, configB?.bpm]);

  useEffect(() => {
    if (audioCtx) {
      audioCtx.setEq('A', 'low', eqState.eqA.low);
      audioCtx.setEq('A', 'mid', eqState.eqA.mid);
      audioCtx.setEq('A', 'high', eqState.eqA.high);
      audioCtx.setEq('B', 'low', eqState.eqB.low);
      audioCtx.setEq('B', 'mid', eqState.eqB.mid);
      audioCtx.setEq('B', 'high', eqState.eqB.high);

      const effVolA = eqState.volA * (1 - eqState.crossfader);
      const effVolB = eqState.volB * eqState.crossfader;
      audioCtx.setVolume('A', effVolA);
      audioCtx.setVolume('B', effVolB);
      if (audioCtx.setTrim) {
        audioCtx.setTrim('A', eqState.trimA);
        audioCtx.setTrim('B', eqState.trimB);
      }
    }
  }, [eqState, audioCtx]);

  const handleEqChange = (deckId, band, val) => {
    setEqState((prev) => ({ ...prev, [`eq${deckId}`]: { ...prev[`eq${deckId}`], [band]: val } }));
  };
  const handleFaderChange = (deckId, val) => {
    setEqState((prev) => ({ ...prev, [`vol${deckId}`]: val }));
  };
  const handleCrossfaderChange = (val) => {
    setEqState((prev) => ({ ...prev, crossfader: val }));
  };

  useAnimationFrame((deltaTime) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isGameOver || !isReady) return;

    if (speedRef.current > 0) animTimeRef.current += (deltaTime / 1000) * speedRef.current;
    if (!ctx.decks || !ctx.decks.A || !ctx.decks.B) return;

    const currentA = isWinSequence ? (ctx.decks.A.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('A');
    const currentB = isWinSequence ? (ctx.decks.B.currentPosition || 0) + animTimeRef.current : ctx.getTrackPosition('B');

    const beatsA_val = currentA * (bpmA / 60);
    const beatsB_val = currentB * (configB.bpm / 60);
    const phraseIdxA = Math.floor(beatsA_val / BEATS_PER_PHRASE);
    const phraseIdxB = Math.floor(beatsB_val / BEATS_PER_PHRASE);
    const progress = (beatsA_val % BEATS_PER_PHRASE) / BEATS_PER_PHRASE;

    const pA = PHRASES[phraseIdxA % NUM_PHRASES];
    const pB = PHRASES[phraseIdxB % NUM_PHRASES];
    if (currentPhraseA?.index !== phraseIdxA) setCurrentPhraseA(pA);
    if (currentPhraseB?.index !== phraseIdxB) setCurrentPhraseB(pB);
    setBeatsA(beatsA_val);
    setPhraseProgress(progress);

    if (currentA >= TRACK_LENGTH_SEC - 0.2 && !isWinSequence) {
      ctx.pauseTrack('A');
      ctx.pauseTrack('B');
      setIsGameOver(true);
    }

    const now = performance.now();
    if (midiEqBufferRef.current && now - lastMidiUiUpdateRef.current > 33) {
      setEqState(midiEqBufferRef.current);
      lastMidiUiUpdateRef.current = now;
      midiEqBufferRef.current = null;
    }

    if (ctx.getMeterLevel) {
      if (now - peakUpdateRef.current > 66) {
        peakUpdateRef.current = now;
        const peakA = ctx.getMeterLevel('A');
        const peakB = ctx.getMeterLevel('B');
        setEqState((p) => ({ ...p, trimA_peak: peakA, trimB_peak: peakB }));
      }
    }

    if (!ctx.decks.B.isPlaying) {
      setIsEqOk(true);
      return;
    }

    const active = resolveActiveChecks(checks, phraseIdxA, progress);
    let ok = true;
    for (const c of active) {
      if (!checkControl(eqState, c).ok) { ok = false; break; }
    }
    setIsEqOk(ok);

    if (ok) {
      scoreRef.current += 1;
      if (phraseIdxA >= 5 && scoreRef.current > 100) {
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

  const { mapping } = useMidiMapping();

  useMidiControl((data) => {
    if (!isReady || isGameOver) return;
    const [status, note, velocity] = data;
    const channel = (status & 0x0F) + 1;
    const type = status & 0xF0;
    const control = matchControl(mapping, status, note, channel);
    if (!control) return;

    const mapEq = (v) => v <= 64 ? -24 + (v / 64) * 24 : ((v - 64) / 63) * 6;
    const mapFader = (v) => v / 127;

    if (type === 0xB0) {
      const buf = midiEqBufferRef.current ? { ...midiEqBufferRef.current } : { ...eqState };
      switch (control) {
        case 'eqHighA': buf.eqA = { ...buf.eqA, high: mapEq(velocity) }; break;
        case 'eqMidA':  buf.eqA = { ...buf.eqA, mid:  mapEq(velocity) }; break;
        case 'eqLowA':  buf.eqA = { ...buf.eqA, low:  mapEq(velocity) }; break;
        case 'eqHighB': buf.eqB = { ...buf.eqB, high: mapEq(velocity) }; break;
        case 'eqMidB':  buf.eqB = { ...buf.eqB, mid:  mapEq(velocity) }; break;
        case 'eqLowB':  buf.eqB = { ...buf.eqB, low:  mapEq(velocity) }; break;
        case 'volA':       buf.volA = mapFader(velocity); break;
        case 'volB':       buf.volB = mapFader(velocity); break;
        case 'crossfader': buf.crossfader = mapFader(velocity); break;
        default: return;
      }
      midiEqBufferRef.current = buf;
      return;
    }

    if (type === 0x90 && velocity > 0) {
      if (control === 'playA') playA();
      else if (control === 'playB') playB();
      else if (control === 'cueA') cueA();
      else if (control === 'cueB') cueB();
    }
  });

  const absolutePhraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE);
  const grade = isLevelCleared ? 'S' : 'C';

  if (!resolvedLevel) {
    return (
      <div className="app-container">
        <div className="level-header"><h1>Unknown level</h1></div>
        <button className="btn-crayon" onClick={onBack}>{t('workshop.menu')}</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <LevelHeader
        title={title}
        description={description}
        onBack={onBack}
        audioCtx={audioCtxRef.current}
        vizColor="#ff6b6b"
      >
        {difficulty !== 'PRO' && (
          <div className="sync-hud-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <div style={{
              background: isEqOk ? '#27ae60' : '#e74c3c', color: 'white', padding: '4px 12px',
              borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', border: '2px solid #333',
            }}>
              {isEqOk ? 'EQ Curve OK' : 'Adjust EQs / Faders!'} (Score: {score})
            </div>
          </div>
        )}
      </LevelHeader>

      {level.ui?.show_trim && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '10px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <GainKnob
              value={eqState.trimA}
              onChange={(v) => setEqState((p) => ({ ...p, trimA: v }))}
              color="#4ecdc4"
              label="TRIM A"
            />
            <VuMeter level={eqState.trimA_peak} label="A" height={120} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <GainKnob
              value={eqState.trimB}
              onChange={(v) => setEqState((p) => ({ ...p, trimB: v }))}
              color="#3498db"
              label="TRIM B"
            />
            <VuMeter level={eqState.trimB_peak} label="B" height={120} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '8px 20px', gap: '12px' }}>
        <PhraseIndicator label={t('workshop.trainA')} currentPhrase={currentPhraseA} isOutro={[3, 4].includes(currentPhraseA?.index)} />
        <PhraseIndicator label={t('workshop.trainB')} currentPhrase={currentPhraseB} />
      </div>

      <div className="main-gameplay" style={{ flexDirection: 'column', padding: '0 20px' }}>
        <SimplifiedTimeline
          levelId={levelId}
          currentPhraseIdx={absolutePhraseIdxA}
          progress={phraseProgress}
          totalPhrases={8}
        />
        <ColorMixVisualizer
          levelId={levelId}
          eqState={eqState}
          beatsA={beatsA}
        />
      </div>

      <div className="controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '15px', gap: isMobile ? '10px' : '20px' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', gap: isMobile ? '5px' : '20px', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
          <div className="control-group" style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', gap: isMobile ? '10px' : '20px', alignItems: 'center' }}>
            <VolumeFader
              value={eqState.volA}
              onChange={(v) => handleFaderChange('A', v)}
              trackWidth={isMobile ? 30 : 40}
              trackLength={isMobile ? 120 : 180}
              handleSize={isMobile ? 45 : 55}
              labelSize={isMobile ? '0.9rem' : '1.2rem'}
            />
            <div className="control-buttons">
              <button className="btn-crayon play-btn start-a-btn" onClick={playA} disabled={isPlayingA || !isReady} style={{ padding: isMobile ? '10px 15px' : undefined, fontSize: isMobile ? '0.9rem' : undefined }}>
                {!isReady ? t('workshop.loading') : (isPlayingA ? t('workshop.running') : t('workshop.startTrainA'))}
              </button>
              <button className="btn-crayon nudge-btn" onClick={cueA} style={{ padding: isMobile ? '10px 15px' : undefined, fontSize: isMobile ? '0.9rem' : undefined }}>
                {t('workshop.cue')}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: isMobile ? '20px' : '50px', alignItems: 'flex-start', justifyContent: 'center', padding: isMobile ? '0' : '15px 0' }}>
            <EqKnobs
              values={eqState.eqA}
              onChange={(band, v) => handleEqChange('A', band, v)}
              color="#4ecdc4"
              size={isMobile ? 35 : 55}
              gap={isMobile ? 15 : 25}
              labelFontSize={isMobile ? '0.6rem' : '0.8rem'}
            />
            <EqKnobs
              values={eqState.eqB}
              onChange={(band, v) => handleEqChange('B', band, v)}
              color="#3498db"
              size={isMobile ? 35 : 55}
              gap={isMobile ? 15 : 25}
              labelFontSize={isMobile ? '0.6rem' : '0.8rem'}
            />
          </div>

          <div className="control-group" style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', gap: isMobile ? '10px' : '20px', alignItems: 'center' }}>
            <VolumeFader
              value={eqState.volB}
              onChange={(v) => handleFaderChange('B', v)}
              trackWidth={isMobile ? 30 : 40}
              trackLength={isMobile ? 120 : 180}
              handleSize={isMobile ? 45 : 55}
              labelSize={isMobile ? '0.9rem' : '1.2rem'}
            />
            <div className="control-buttons">
              <button className="btn-crayon play-btn" onClick={playB} disabled={isPlayingB || !isReady} style={{ padding: isMobile ? '10px 15px' : undefined, fontSize: isMobile ? '0.9rem' : undefined }}>
                {!isReady ? '...' : (isPlayingB ? t('workshop.running') : t('workshop.startTrainB'))}
              </button>
              <button className="btn-crayon nudge-btn" onClick={cueB} style={{ padding: isMobile ? '10px 15px' : undefined, fontSize: isMobile ? '0.9rem' : undefined }}>
                {t('workshop.cue')}
              </button>
            </div>
          </div>
        </div>

        <div className="crossfader-group" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <Crossfader
            value={eqState.crossfader}
            onChange={handleCrossfaderChange}
            trackWidth={isMobile ? 30 : 40}
            handleSize={isMobile ? 45 : 60}
          />
        </div>
      </div>

      {isWinSequence && (
        <Cinematic type="win" onNextLevel={onNextLevel} message={successMessage || 'Great EQ Transition!'} title={title} grade={grade} recap={levelText?.recap} />
      )}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}

      <CoachPatrick tips={coachTips} />
    </div>
  );
};

export default EqLevel;
