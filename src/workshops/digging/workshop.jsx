import React, { useRef, useState, useContext } from 'react';
import Crate from '../../components/Crate';
import DiggingResult from '../../components/DiggingResult';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useAudioDeck } from '../../hooks/useAudioDeck';
import { LanguageContext } from '../../hooks/LanguageContext';
import { BEATS_PER_PHRASE, PHRASES, NUM_PHRASES } from '../../utils/workshopUtils';
import { PhraseIndicator } from '../../components/TrackViews';
import AudioVisualizer from '../../components/AudioVisualizer';
import SimplifiedTimeline from '../../components/SimplifiedTimeline';
import { getLevel } from '../../lib/levels/load';
import { t as pickText } from '../../lib/levels/schema';
import LevelHeader from '../../components/LevelHeader';
import { useDifficulty } from '../../hooks/useDifficulty.jsx';

const TRACK_LENGTH_SEC = 160;
const FALLBACK_LEVEL = {
  en: {}, fr: {}, ui: {},
  track: { A: { bpm: 120, url: '', complexity: 1 } },
  context: { reveal_phrase: 2 },
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

const DiggingLevel = ({ levelId, onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const { t, language } = useContext(LanguageContext);
  const [difficulty] = useDifficulty();
  const resolvedLevel = getLevel('digging', levelId);
  const level = resolvedLevel || FALLBACK_LEVEL;
  const levelText = pickText(level, language);

  const title = levelText?.title;
  const description = levelText?.description;
  const coachTips = levelText?.coach_tips || [];

  const configA = level.track?.A;
  const configB = level.track?.A; // reuse A; useAudioDeck requires a B
  const bpmA = configA?.bpm ?? 120;

  const revealPhrase = level.context?.reveal_phrase ?? 2;
  const showFiches = level.ui?.show_fiches !== false;
  const candidates = level.candidates || [];
  const contextDesc = language === 'fr'
    ? (level.context?.description_fr || level.context?.description_en || '')
    : (level.context?.description_en || level.context?.description_fr || '');

  const { audioCtx, audioCtxRef, isReady, loadError } = useAudioDeck(configA, configB, TRACK_LENGTH_SEC);

  const [isPlayingA, setIsPlayingA] = useState(false);
  const [currentPhraseA, setCurrentPhraseA] = useState(null);
  const [beatsA, setBeatsA] = useState(0);
  const [phraseProgress, setPhraseProgress] = useState(0);
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
    const progress = (bA % BEATS_PER_PHRASE) / BEATS_PER_PHRASE;

    if (currentPhraseA?.index !== pA) setCurrentPhraseA(PHRASES[pA % NUM_PHRASES]);
    setBeatsA(bA);
    setPhraseProgress(progress);

    if (!crateOpen && !resultRef.current && pA >= revealPhrase) {
      setCrateOpen(true);
    }
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
      discogsUrl: candidate.discogs_url || null,
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

  const absolutePhraseIdxA = Math.floor(beatsA / BEATS_PER_PHRASE);

  return (
    <div className="app-container">
      <LevelHeader
        coachTips={coachTips}
        audioError={loadError}
        title={title}
        description={description}
        onBack={onBack}
        audioCtx={audioCtxRef.current}
        vizColor="#E74C3C"
      >
        {contextDesc && (
          <div style={{
            background: 'var(--surface-elevated)', border: '2px solid var(--border-strong)', borderRadius: 8,
            padding: '8px 14px', margin: '12px auto', maxWidth: 640,
            fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text)',
          }}>
            {contextDesc}
          </div>
        )}
      </LevelHeader>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 20px' }}>
        <PhraseIndicator label={t('workshop.trainA')} currentPhrase={currentPhraseA} />
      </div>

      <div className="main-gameplay" style={{ flexDirection: 'column', padding: '0 20px' }}>
        <SimplifiedTimeline
          levelId={levelId}
          currentPhraseIdx={absolutePhraseIdxA}
          progress={phraseProgress}
          totalPhrases={8}
        />
      </div>

      {!isPlayingA && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button className="btn-crayon play-btn start-a-btn" onClick={playA} disabled={!isReady}>
            {!isReady ? t('workshop.loading') : t('workshop.startTrainA')}
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
            selectColor="#E74C3C"
          />
        </div>
      )}

      {result && (
        <DiggingResult
          correct={result.correct}
          reason={result.reason}
          title={result.title}
          discogsUrl={result.discogsUrl}
          onRetry={handleResultRetry}
          onNext={handleResultNext}
        />
      )}
    </div>
  );
};

export default DiggingLevel;
