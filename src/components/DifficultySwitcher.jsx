import React, { useContext } from 'react';
import { useDifficulty } from '../hooks/useDifficulty.jsx';
import { useTierNav } from '../hooks/useTierNav';
import { LanguageContext } from '../hooks/LanguageContext';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';
import { TIERS } from '../lib/progression';
import Glyph from './Glyph';

// Sélecteur de palier : seuls les paliers débloqués pour l'atelier sont jouables,
// les autres montrent un cadenas et disent quoi finir. Sans props, il suit la leçon / le niveau ouvert (TierNavContext).
const DifficultySwitcher = ({ style = {}, mini = false, unlocked: unlockedProp, value: valueProp, onPick: onPickProp }) => {
  const [difficulty] = useDifficulty();
  const nav = useTierNav();
  const { t } = useContext(LanguageContext);
  const unlocked = unlockedProp ?? nav?.unlocked ?? ['EASY'];
  const value = valueProp ?? difficulty;
  const onPick = onPickProp ?? nav?.pick;

  return (
    <div className={`difficulty-switcher ${mini ? 'mini' : ''}`} style={style} role="group">
      {TIERS.map((key, i) => {
        const name = DIFFICULTY_SETTINGS[key].name;
        const isOpen = unlocked.includes(key);
        const hint = isOpen
          ? t('tiers.switchTo', { tier: name })
          : t('tiers.lockedHint', { tier: name, prev: DIFFICULTY_SETTINGS[TIERS[i - 1]].name });
        return (
          <button
            key={key}
            type="button"
            className={`diff-btn ${value === key ? 'active' : ''} ${isOpen ? '' : 'locked'}`}
            aria-pressed={value === key}
            aria-disabled={!isOpen || undefined}
            aria-label={hint}
            title={hint}
            onClick={() => { if (isOpen && key !== value) onPick?.(key); }}
          >
            {mini ? key.charAt(0) : name}
            {!isOpen && <Glyph name="lock" size="0.9em" />}
          </button>
        );
      })}
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
        .difficulty-switcher .diff-btn { display: inline-flex; align-items: center; justify-content: center; gap: 3px; }
        /* palier pas encore ouvert : pointillés, comme les tuiles verrouillées de l'accueil */
        .difficulty-switcher .diff-btn.locked {
          border-style: dashed;
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .difficulty-switcher .diff-btn.locked:hover { transform: none; box-shadow: none; }
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
