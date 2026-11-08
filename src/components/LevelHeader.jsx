import React, { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import AudioVisualizer from './AudioVisualizer';
import DifficultySwitcher from './DifficultySwitcher';
import SoundOnIndicator from './SoundOnIndicator';
import CoachPatrick from './CoachPatrick';
import { inkOn } from '../utils/color';

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
  children,
}) => {
  const { t } = useContext(LanguageContext);

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

      {coachTips?.length > 0 && <CoachPatrick tips={coachTips} />}

      {children}

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
        .level-header .lh-desc {
          color: var(--text-muted);
          max-width: 70ch;
          margin: 0 auto;
        }
        @media (max-width: 760px) {
          .lh-bar {
            grid-template-columns: auto 1fr;
            grid-template-areas: "left right" "title title";
            row-gap: 6px;
          }
        }
      `}} />
    </header>
  );
};

export default LevelHeader;
