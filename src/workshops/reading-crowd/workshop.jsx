import React, { useContext, useRef, useState } from 'react';
import Crate from '../../components/Crate';
import CrowdMeter from '../../components/CrowdMeter';
import DiggingResult from '../../components/DiggingResult';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useAudioDeck } from '../../hooks/useAudioDeck';
import { LanguageContext } from '../../hooks/LanguageContext';
import { BEATS_PER_PHRASE, PHRASES, NUM_PHRASES } from '../../utils/workshopUtils';
import { PhraseIndicator } from '../../components/TrackViews';
import AudioVisualizer from '../../components/AudioVisualizer';
import { getLevel } from '../../lib/levels/load';
import { t as pickText } from '../../lib/levels/schema';
import LevelHeader from '../../components/LevelHeader';
import { useDifficulty } from '../../hooks/useDifficulty.jsx';
import LoadingLabel from '../../components/LoadingLabel';

const TRACK_LENGTH_SEC = 160;
const FALLBACK_LEVEL = {
  en: {}, fr: {}, ui: {},
  track: { A: { bpm: 120, url: '', complexity: 1 } },
  crowd: { energy: 1, density: 1, moment: 'warmup' },
  candidates: [],
};

const assetPrefix = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

const resolveAudioUrl = (rel) => {
  if (!rel) return '';
  if (/^https?:/.test(rel)) return rel;
  return `${assetPrefix()}${rel.replace(/^\//, '')}`;
};

const pickCandidateText = (c, lang) => ({
  title: c.title || c.url?.split('/').pop() || 'Candidate',
  reason: lang === 'fr' ? (c.reason_fr || c.reason_en || '') : (c.reason_en || c.reason_fr || ''),
});

const ReadingCrowdLevel = ({ levelId, onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const { t, language } = useContext(LanguageContext);
  const [difficulty] = useDifficulty();
  const resolvedLevel = getLevel('reading_crowd', levelId);
  const level = resolvedLevel || FALLBACK_LEVEL;
  const levelText = pickText(level, language);

  const title = levelText?.title;
  const description = levelText?.description;
  const coachTips = levelText?.coach_tips || [];

  const configA = level.track?.A;
  const configB = level.track?.A;
  const bpmA = configA?.bpm ?? 120;

  const revealPhrase = level.context?.reveal_phrase ?? level.crowd?.reveal_phrase ?? 1;
  const showFiches = level.ui?.show_fiches !== false;
  const candidates = level.candidates || [];
  const crowd = level.crowd || {};

  const { audioCtx, audioCtxRef, isReady, loadError } = useAudioDeck(configA, configB, TRACK_LENGTH_SEC);

  const [isPlayingA, setIsPlayingA] = useState(false);
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [crateOpen, setCrateOpen] = useState(false);
  const [activePreview, setActivePreview] = useState(null);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  resultRef.current = result;

  useAnimationFrame(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !isReady) return;
    if (!ctx.decks?.A) return;
    const currentA = ctx.getTrackPosition('A');
    const bA = currentA * (bpmA / 60);
    const pA = Math.floor(bA / BEATS_PER_PHRASE);
    if (currentPhraseA?.index !== pA) setCurrentPhraseA(PHRASES[pA % NUM_PHRASES]);
    if (!crateOpen && !resultRef.current && pA >= revealPhrase) setCrateOpen(true);
  });

  const playA = async () => {
    if (audioCtx && !isPlayingA) {
      await audioCtx.playTrack('A');
      setIsPlayingA(true);
    }
  };

  const handlePreview = async (idx) => {
    if (!audioCtx) return;
    const url = resolveAudioUrl(candidates[idx]?.url);
    setActivePreview(idx);
    await audioCtx.playPreview(url, 8000);
    setTimeout(() => {
      setActivePreview((curr) => (curr === idx ? null : curr));
    }, 8000);
  };

  const handleStopPreview = () => {
    if (audioCtx) audioCtx.stopPreview();
    setActivePreview(null);
  };

  const handleSelect = (idx) => {
    const candidate = candidates[idx];
    if (!candidate) return;
    if (audioCtx) {
      audioCtx.stopPreview();
      audioCtx.pauseTrack('A');
    }
    setActivePreview(null);
    const texts = pickCandidateText(candidate, language);
    setResult({
      correct: !!candidate.correct,
      reason: texts.reason || '',
      title: texts.title,
    });
    if (candidate.correct && onUnlockNext) onUnlockNext();
  };

  const handleResultNext = () => {
    setResult(null);
    if (onNextLevel) onNextLevel();
  };

  const handleResultRetry = () => {
    setResult(null);
    setCrateOpen(false);
    if (audioCtx) {
      audioCtx.stopPreview();
      audioCtx.cueTrack('A', 0);
    }
    setIsPlayingA(false);
    if (onRetry) onRetry();
  };

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
        coach={{ bpm: isPlayingA ? bpmA : undefined }}
        title={title}
        description={description}
        onBack={onBack}
        audioCtx={audioCtxRef.current}
        vizColor="#D4A017"
      />

      <div style={{ padding: '12px 20px' }}>
        <CrowdMeter crowd={crowd} language={language} color="#D4A017" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 20px' }}>
        <PhraseIndicator label={t('workshop.trainA')} currentPhrase={currentPhraseA} />
      </div>

      {!isPlayingA && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button className="btn-crayon play-btn start-a-btn" onClick={playA} disabled={!isReady}>
            {!isReady ? <LoadingLabel /> : t('workshop.startTrainA')}
          </button>
        </div>
      )}

      {crateOpen && !result && (
        <div style={{ marginTop: 16 }}>
          <Crate
            candidates={candidates}
            showFiches={showFiches}
            activePreviewIdx={activePreview}
            onPreview={handlePreview}
            onStopPreview={handleStopPreview}
            onSelect={handleSelect}
            selectColor="#D4A017"
          />
        </div>
      )}

      {result && (
        <DiggingResult
          correct={result.correct}
          reason={result.reason}
          title={result.title}
          onRetry={handleResultRetry}
          onNext={handleResultNext}
        />
      )}
    </div>
  );
};

export default ReadingCrowdLevel;
