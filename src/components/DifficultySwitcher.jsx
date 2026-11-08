import React from 'react';
import { useDifficulty } from '../hooks/useDifficulty.jsx';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';

const DifficultySwitcher = ({ style = {}, mini = false }) => {
  const [difficulty, setDifficulty] = useDifficulty();

  return (
    <div className={`difficulty-switcher ${mini ? 'mini' : ''}`} style={style}>
      {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
        <button
          key={key}
          className={`diff-btn ${difficulty === key ? 'active' : ''}`}
          onClick={() => setDifficulty(key)}
          title={setting.name}
        >
          {mini ? key.charAt(0) : setting.name}
        </button>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        .difficulty-switcher {
          display: flex;
          gap: 8px;
        }
        .difficulty-switcher .diff-btn {
          background: var(--surface-elevated, #fff);
          color: var(--text, #333);
          border: 3px solid #333;
          padding: 6px 14px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 900;
          font-family: inherit;
          transition: all 0.2s;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
          letter-spacing: 0.5px;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .difficulty-switcher .diff-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 rgba(0,0,0,0.1);
          background: var(--surface-elevated);
        }
        .difficulty-switcher .diff-btn.active {
          /* teinte éclaircie de la couleur d'atelier : texte encre lisible quelle que soit la couleur (rouge, violet…) */
          background: color-mix(in srgb, var(--primary, #5DADE2) 55%, #fff);
          color: #2b2b2b;
          border-color: #333;
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0 rgba(0,0,0,0);
        }
        /* version compacte (barre des niveaux) : cible tactile 32px minimum */
        .difficulty-switcher.mini .diff-btn {
          min-width: 32px;
          min-height: 32px;
          padding: 4px 8px;
          font-size: 0.8rem;
        }
      `}} />
    </div>
  );
};

export default DifficultySwitcher;
