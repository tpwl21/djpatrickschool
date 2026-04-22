import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Cinematic from '../../components/Cinematic';
import CamelotWheel from '../../components/CamelotWheel';
import DeckCard from '../../components/DeckCard';
import TrackBrowser from '../../components/TrackBrowser';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useAudioDeck } from '../../hooks/useAudioDeck';
import { useWinSequence } from '../../hooks/useWinSequence';
import { LanguageContext } from '../../hooks/LanguageContext';
import CoachPatrick from '../../components/CoachPatrick';
import AudioVisualizer from '../../components/AudioVisualizer';
import { getLevel } from '../../lib/levels/load';
import { t as pickText } from '../../lib/levels/schema';
import LevelHeader from '../../components/LevelHeader';
import { useDifficulty } from '../../hooks/useDifficulty.jsx';
import { areCompatible } from '../../lib/camelot.js';
import { formatKeyBoth, rateToSemitones, formatKeyWithDeviation, shiftKey } from '../../lib/keys.js';

const TRACK_LENGTH_SEC = 160;
const DEFAULT_HOLD_SEC = 2.0;
const BPM_SYNC_TOLERANCE = 0.5;

const FALLBACK_LEVEL = {
  en: {}, fr: {},
  ui: { mode: 'same_key', key_format: 'musical', show_wheel: false, show_pitch: false, show_master_tempo: false, hold_match_sec: DEFAULT_HOLD_SEC },
  track: { A: { bpm: 120, url: null, complexity: 1 } },
  pool: [],
};

const HarmoniesLevel = ({ levelId, onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const { t, language } = useContext(LanguageContext);
  const [difficulty] = useDifficulty();
  const resolvedLevel = getLevel('harmonies', levelId);
  const level = resolvedLevel || FALLBACK_LEVEL;
  const levelText = pickText(level, language);

  const title = levelText?.title;
  const description = levelText?.description;
  const coachTips = levelText?.coach_tips || [];
  const successMessage = levelText?.success;

  const ui = level.ui || {};
  const mode = ui.mode || 'same_key';
  const keyFormat = ui.key_format || 'musical';
  const holdSec = ui.hold_match_sec ?? DEFAULT_HOLD_SEC;
  const showWheel = !!ui.show_wheel;
  const showPitch = !!ui.show_pitch;
  const showMasterTempo = !!ui.show_master_tempo;

  const configA = level.track?.A;
  const bpmA = configA?.bpm ?? 120;
  const keyA = configA?.key;
  const pool = level.pool || [];

  // Dummy B config so the audio engine boots; real track loaded on user pick.
  // Must be memoized — a new object every render would cause useAudioDeck to re-init in a loop.
  const configBPlaceholder = useMemo(() => ({ url: null, bpm: bpmA, complexity: 1, title: '—' }), [bpmA]);
  const { audioCtx, audioCtxRef, isReady } = useAudioDeck(configA, configBPlaceholder, TRACK_LENGTH_SEC);

  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [loadedB, setLoadedB] = useState(null); // track object from pool
  const [rateB, setRateB] = useState(1.0); // relative to B's native BPM
  const [keyLockB, setKeyLockB] = useState(false);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isOk, setIsOk] = useState(false);
  const [feedback, setFeedback] = useState('');

  const holdElapsedRef = useRef(0);
  const lastTsRef = useRef(0);
  const { isWinSequence, animTimeRef, speedRef } = useWinSequence(isLevelCleared, audioCtxRef, onUnlockNext);

  // Push pitch + keyLock to engine when they change.
  useEffect(() => {
    if (!audioCtx) return;
    audioCtx.setKeyLock('B', keyLockB);
  }, [audioCtx, keyLockB]);

  useEffect(() => {
    if (!audioCtx) return;
    audioCtx.setPlaybackRate('B', rateB);
  }, [audioCtx, rateB]);

  const handleLoadToDeck = async (deckId, track) => {
    if (!audioCtx) return;
    if (deckId !== 'B') return; // Track A is fixed per level; only B is pickable
    if (audioCtx.decks.B.isPlaying) {
      audioCtx.pauseTrack('B');
    }
    setIsPlayingB(false);
    setLoadedB(track);
    setRateB(1.0);
    holdElapsedRef.current = 0;
    await audioCtx.loadTrack('B', track.url, track.bpm, TRACK_LENGTH_SEC, track.complexity || 3);
  };

  const playA = async () => {
    if (!audioCtx || isPlayingA) return;
    await audioCtx.playTrack('A');
    setIsPlayingA(true);
  };
  const cueA = () => { if (audioCtx) { audioCtx.cueTrack('A', 0); setIsPlayingA(false); } };

  const playB = async () => {
    if (!audioCtx || isPlayingB || !loadedB) return;
    await audioCtx.playTrack('B');
    setIsPlayingB(true);
  };
  const cueB = () => { if (audioCtx) { audioCtx.cueTrack('B', 0); setIsPlayingB(false); holdElapsedRef.current = 0; } };

  const syncB = () => {
    if (!loadedB) return;
    const targetRate = bpmA / (loadedB.bpm || bpmA);
    setRateB(targetRate);
  };

  useAnimationFrame((deltaTime) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isGameOver || !isReady) return;
    if (speedRef.current > 0) animTimeRef.current += (deltaTime / 1000) * speedRef.current;

    // Track end → lose
    const posA = ctx.getTrackPosition('A');
    if (posA >= TRACK_LENGTH_SEC - 0.2 && !isWinSequence) {
      ctx.pauseTrack('A'); ctx.pauseTrack('B');
      setIsGameOver(true);
    }

    const now = performance.now();
    const dt = lastTsRef.current === 0 ? 0 : (now - lastTsRef.current) / 1000;
    lastTsRef.current = now;

    // Per-mode validation
    let ok = false;
    let msg = '';

    if (!loadedB) {
      msg = language === 'fr' ? 'Charge un morceau sur le Deck B' : 'Load a track onto Deck B';
    } else if (mode === 'same_key') {
      const same = keyA && loadedB.key && keyA.toUpperCase() === loadedB.key.toUpperCase();
      if (!same) {
        msg = language === 'fr'
          ? `Clash: ${formatKeyBoth(keyA, keyFormat)} vs ${formatKeyBoth(loadedB.key, keyFormat)}`
          : `Clash: ${formatKeyBoth(keyA, keyFormat)} vs ${formatKeyBoth(loadedB.key, keyFormat)}`;
      } else if (!isPlayingB) {
        msg = language === 'fr' ? 'Même clé ✓ — lance le Deck B' : 'Same key ✓ — start Deck B';
      } else {
        ok = true;
        msg = language === 'fr' ? `Clé ${formatKeyBoth(keyA, keyFormat)} ✓` : `Key ${formatKeyBoth(keyA, keyFormat)} ✓`;
      }
    } else if (mode === 'same_key_master_tempo') {
      const same = keyA && loadedB.key && keyA.toUpperCase() === loadedB.key.toUpperCase();
      const effBpmB = (loadedB.bpm || bpmA) * rateB;
      const bpmSynced = Math.abs(effBpmB - bpmA) < BPM_SYNC_TOLERANCE;
      const semis = rateToSemitones(rateB);
      const effectiveLabel = keyLockB
        ? formatKeyBoth(loadedB.key, keyFormat)
        : formatKeyWithDeviation(loadedB.key, semis, keyFormat);
      const effectiveMatchesA = keyLockB
        ? same
        : (same && Math.abs(semis) < 0.05);
      if (!same) {
        msg = language === 'fr'
          ? `Mauvaise clé: ${formatKeyBoth(loadedB.key, keyFormat)} (veut ${formatKeyBoth(keyA, keyFormat)})`
          : `Wrong key: ${formatKeyBoth(loadedB.key, keyFormat)} (want ${formatKeyBoth(keyA, keyFormat)})`;
      } else if (!isPlayingB) {
        msg = language === 'fr' ? 'Lance le Deck B' : 'Start Deck B';
      } else if (!bpmSynced) {
        msg = language === 'fr'
          ? `BPM décalé: ${effBpmB.toFixed(1)} vs ${bpmA.toFixed(1)} — pitche ou SYNC`
          : `BPM off: ${effBpmB.toFixed(1)} vs ${bpmA.toFixed(1)} — pitch or SYNC`;
      } else if (!effectiveMatchesA) {
        msg = language === 'fr'
          ? `Clé dérive: ${effectiveLabel} — active MASTER TEMPO`
          : `Key drift: ${effectiveLabel} — enable MASTER TEMPO`;
      } else {
        ok = true;
        msg = language === 'fr'
          ? `BPM ✓ Clé ✓ (${effectiveLabel})`
          : `BPM ✓ Key ✓ (${effectiveLabel})`;
      }
    } else if (mode === 'camelot_pick') {
      const compat = keyA && loadedB.key && areCompatible(keyA, loadedB.key);
      if (!compat) {
        msg = language === 'fr'
          ? `${formatKeyBoth(keyA, keyFormat)} vs ${formatKeyBoth(loadedB.key, keyFormat)} — pas compatible`
          : `${formatKeyBoth(keyA, keyFormat)} vs ${formatKeyBoth(loadedB.key, keyFormat)} — not compatible`;
      } else if (!isPlayingB) {
        msg = language === 'fr' ? 'Clé compatible ✓ — lance B' : 'Compatible ✓ — start B';
      } else {
        ok = true;
        msg = language === 'fr'
          ? `Camelot ✓ (${formatKeyBoth(keyA, keyFormat)} ↔ ${formatKeyBoth(loadedB.key, keyFormat)})`
          : `Camelot ✓ (${formatKeyBoth(keyA, keyFormat)} ↔ ${formatKeyBoth(loadedB.key, keyFormat)})`;
      }
    }

    setIsOk(ok);
    setFeedback(msg);

    if (ok) {
      holdElapsedRef.current += dt;
      if (holdElapsedRef.current >= holdSec && !isLevelCleared) {
        setIsLevelCleared(true);
      }
    } else {
      holdElapsedRef.current = 0;
    }
  });

  if (!resolvedLevel) {
    return (
      <div className="app-container">
        <div className="level-header"><h1>Unknown level</h1></div>
        <button className="btn-crayon" onClick={onBack}>{t('workshop.menu')}</button>
      </div>
    );
  }

  const keyALabel = formatKeyBoth(keyA, keyFormat);
  const effBpmB = loadedB ? (loadedB.bpm || bpmA) * rateB : 0;
  const effectiveKeyLabel = loadedB
    ? (keyLockB
        ? formatKeyBoth(loadedB.key, keyFormat)
        : formatKeyWithDeviation(loadedB.key, rateToSemitones(rateB), keyFormat))
    : '—';
  const wheelKeyB = loadedB
    ? (keyLockB ? loadedB.key : shiftKey(loadedB.key, Math.round(rateToSemitones(rateB))))
    : null;
  const grade = isLevelCleared ? 'S' : 'C';
  const holdPct = Math.min(100, Math.round((holdElapsedRef.current / holdSec) * 100));

  return (
    <div className="app-container">
      <LevelHeader
        title={title}
        description={description}
        onBack={onBack}
        audioCtx={audioCtxRef.current}
        vizColor="#8E44AD"
      >
        {/* Status HUD */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <div style={{
            background: isOk ? '#27ae60' : '#e74c3c', color: 'white',
            padding: '6px 16px', borderRadius: 12, fontSize: '0.8rem',
            fontWeight: 900, border: '2px solid #333',
            maxWidth: 560, textAlign: 'center',
          }}>
            {feedback || '—'}
            {isOk && ` · ${holdPct}%`}
          </div>
        </div>
      </LevelHeader>

      {/* Deck cards row + (on laptop) Deck B controls to the right of Deck B */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', padding: '10px 20px', alignItems: 'flex-start' }}>
        <DeckCard
          side="A"
          title={configA?.title || 'Track A'}
          nativeBpm={bpmA}
          effectiveBpm={bpmA}
          keyLabel={keyALabel}
          isPlaying={isPlayingA}
          isLoading={!isReady}
          onPlay={playA}
          onCue={cueA}
        />
        <DeckCard
          side="B"
          title={loadedB?.title || (language === 'fr' ? '— Aucun morceau —' : '— No track —')}
          nativeBpm={loadedB?.bpm || bpmA}
          effectiveBpm={loadedB ? effBpmB : null}
          keyLabel={loadedB ? effectiveKeyLabel : '—'}
          isPlaying={isPlayingB}
          isLoading={!isReady}
          disabled={!loadedB}
          onPlay={playB}
          onCue={cueB}
          onSync={showPitch ? syncB : null}
          rate={(showPitch || showMasterTempo) ? rateB : undefined}
          onRateChange={(showPitch || showMasterTempo) ? setRateB : undefined}
          targetBpm={showPitch ? bpmA : null}
          targetToleranceBpm={BPM_SYNC_TOLERANCE}
          keyLock={showMasterTempo ? keyLockB : undefined}
          onKeyLockChange={showMasterTempo ? setKeyLockB : undefined}
          keyLockHighlight={mode === 'same_key_master_tempo' && !!loadedB && Math.abs(effBpmB - bpmA) < BPM_SYNC_TOLERANCE && Math.abs(rateToSemitones(rateB)) > 0.1 && !keyLockB}
          showSemitones
        />
      </div>

      {/* Optional Camelot wheel */}
      {showWheel && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 20px' }}>
          <CamelotWheel keyA={keyA} keyB={wheelKeyB} size={220} color="#8E44AD" />
        </div>
      )}

      {/* Playlist */}
      <div style={{ padding: '10px 20px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <TrackBrowser
          tracks={pool}
          columns={['title', 'bpm', 'key', 'camelot', 'genre']}
          onLoadToDeck={handleLoadToDeck}
          theme={null}
        />
      </div>

      {isWinSequence && (
        <Cinematic type="win" onNextLevel={onNextLevel} message={successMessage || 'Harmonie parfaite !'} title={title} grade={grade} />
      )}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}

      <CoachPatrick tips={coachTips} />
    </div>
  );
};

export default HarmoniesLevel;
