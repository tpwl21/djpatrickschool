import React, { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import AudioVisualizer from './AudioVisualizer';
import DifficultySwitcher from './DifficultySwitcher';
import SoundOnIndicator from './SoundOnIndicator';
import CoachPatrick from './CoachPatrick';
import { inkOn } from '../utils/color';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// En-tête commun des niveaux. Tout est dans le flux (plus rien de position: fixed/absolute) :
//   barre 3 zones  [Menu] · titre · [difficulté + son]   (mobile : titre sur sa propre ligne)
//   consigne
//   bandeau du coach (si des conseils sont fournis)
//   children : statuts propres au niveau (ex. PITCH OK)
const LevelHeader = ({
  title,
  description,
  onBack,
  audioCtx,
  vizColor = '#ff6b6b',
  coachTips,
  audioError = false,
  coach = {}, // { bpm, mood } : Patrick vivant (tempo + humeur selon le jeu)
  children,
}) => {
  const { t } = useContext(LanguageContext);
  useDocumentTitle(title);

  return (
    <header className="level-header" style={{ '--primary': vizColor, '--wh-ink': inkOn(vizColor) }}>
      <div className="lh-viz" aria-hidden="true">
        <AudioVisualizer audioCtx={audioCtx} color={vizColor} />
      </div>

      <div className="lh-bar">
        <div className="lh-left">
          <button onClick={onBack} className="btn-crayon nudge-btn lh-menu">{t('workshop.menu')}</button>
        </div>
        <h1 className="lh-title">{title}</h1>
        <div className="lh-right">
          <DifficultySwitcher mini={true} />
          <SoundOnIndicator />
        </div>
      </div>

      {description && <p className="lh-desc" dangerouslySetInnerHTML={{ __html: description }} />}

      {audioError && (
        <div className="lh-audio-error" role="alert">
          <span><strong>{t('workshop.audioError.title')}</strong> {t('workshop.audioError.text')}</span>
          <button className="btn-crayon nudge-btn" onClick={() => window.location.reload()}>{t('workshop.audioError.retry')}</button>
        </div>
      )}

      <div className="lh-sub">
        {coachTips?.length > 0 && <CoachPatrick tips={coachTips} bpm={coach.bpm} mood={coach.mood} />}
        {children}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .level-header {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          text-align: center;
        }
        .lh-viz { position: absolute; inset: 0; opacity: 0.1; z-index: -1; pointer-events: none; }
        .lh-bar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          grid-template-areas: "left title right";
          align-items: center;
          gap: 12px;
        }
        .lh-left { grid-area: left; justify-self: start; }
        .lh-right { grid-area: right; justify-self: end; display: flex; align-items: center; gap: 12px; }
        .lh-title { grid-area: title; margin: 0; }
        .lh-menu { padding: 8px 16px; font-size: 0.95rem; }
        .lh-audio-error {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 14px;
          max-width: 760px; margin: 0 auto; padding: 10px 14px;
          background: #fff; color: #2b2b2b; border: 3px solid #c0392b; border-radius: 16px;
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.12);
        }
        .lh-audio-error .btn-crayon { padding: 6px 14px; font-size: 0.95rem; }
        /* coach (pleine largeur) + statuts du niveau ; coach replié = juste Patrick, à côté des statuts */
        .lh-sub { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; }
        .lh-sub > .coach-strip { flex: 1 1 100%; }
        .lh-sub > .coach-strip:not(.is-open) { flex: 0 0 auto; width: auto; margin: 0; }
        .level-header .lh-desc {
          color: var(--text-muted);
          max-width: 70ch;
          margin: 0 auto;
          text-wrap: pretty;
        }
        @media (max-width: 760px) {
          .lh-bar {
            grid-template-columns: auto 1fr;
            grid-template-areas: "left right" "title title";
            row-gap: 6px;
          }
        }
        /* Écran bas (téléphone en paysage) : on garde le jeu visible, l'en-tête se fait discret */
        @media (max-height: 500px) {
          .lh-bar { grid-template-columns: auto 1fr auto; grid-template-areas: "left title right"; }
          .level-header { gap: 4px; margin-bottom: 6px; }
          .level-header .lh-desc { display: none; }
          .level-header h1.lh-title { font-size: 1.3rem; margin: 0; }
          .lh-menu { padding: 5px 12px; font-size: 0.85rem; }
          /* Patrick replié, seul dans sa ligne : on le remonte dans la barre, à côté de Menu */
          .lh-sub:has(> .coach-strip:not(.is-open):only-child) { position: absolute; top: 0; left: 96px; }
          .level-header:has(> .lh-sub > .coach-strip:not(.is-open):only-child) .lh-left { min-width: 136px; } /* place réservée à Patrick */
        }
      `}} />
    </header>
  );
};

export default LevelHeader;
