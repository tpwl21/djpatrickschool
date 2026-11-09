import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';
import { LanguageContext } from '../hooks/LanguageContext';
import { t as pickText } from '../lib/levels/schema';

const LevelPopup = ({ workshopMeta, level, difficulty, requireDifficulty = true, onCancel, onStart }) => {
  const { t, language } = useContext(LanguageContext);
  const workshopColor = workshopMeta?.color || '#333';
  const levelText = pickText(level, language);
  const title = levelText?.title;
  const desc = levelText?.description || levelText?.short_desc;
  const details = levelText?.details;
  const canStart = !requireDifficulty || !!difficulty;
  const diffTagColor = !requireDifficulty ? workshopColor : (difficulty ? '#333' : '#ff6b6b');
  const diffTagLabel = !requireDifficulty
    ? pickText(workshopMeta, language)?.title
    : (difficulty ? DIFFICULTY_SETTINGS[difficulty].name : t('home.popup.missingDifficulty'));

  return (
    <div className="popup-overlay" onClick={onCancel}>
      <motion.div
        className="level-popup"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-header">
          <div className="popup-level-id">{t('home.popup.level')} {level?.order ?? '?'}</div>
          <div className="popup-diff-tag" style={{ backgroundColor: diffTagColor }}>
            {diffTagLabel}
          </div>
        </div>

        <h1 className="popup-title">{title}</h1>
        {/* les consignes de niveau contiennent du <strong> (contenu maison, même rendu que l'en-tête du niveau) */}
        <p className="popup-desc" dangerouslySetInnerHTML={{ __html: desc }} />

        {details && (
          <div className="popup-details-box">
            {canStart ? details : t('home.popup.selectDifficultyText')}
          </div>
        )}

        <div className="popup-footer">
          <button className="btn-crayon nudge-btn" onClick={onCancel}>{t('home.popup.cancel')}</button>
          <button
            className="btn-crayon play-btn large"
            style={{ opacity: canStart ? 1 : 0.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
            onClick={() => canStart && onStart()}
            disabled={!canStart}
          >
            {canStart ? t('home.popup.start') : t('home.popup.chooseDifficulty')}
          </button>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Popup Styles */
          .popup-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
          }
          .level-popup {
            background: var(--surface-elevated, white);
            width: 100%;
            max-width: 550px;
            border: 5px solid var(--border, #333);
            border-radius: 40px;
            padding: 40px;
            box-shadow: 15px 15px 0 rgba(0,0,0,0.15), var(--glow, none);
            font-family: inherit;
            color: var(--text, #333);
          }
          .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .popup-level-id {
            font-weight: 900;
            font-size: 0.9rem;
            color: var(--text-muted, #666);
            letter-spacing: 1px;
          }
          .popup-diff-tag {
            background: #333;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: bold;
          }
          .popup-title {
            font-size: 2.5rem;
            margin: 0 0 15px 0;
            line-height: 1;
            color: var(--text, #333);
          }
          .popup-desc {
            font-size: 1.1rem;
            color: var(--text, #444);
            line-height: 1.4;
            margin-bottom: 25px;
          }
          .popup-details-box {
            background: var(--surface-solid, #fdfaf6);
            border: 2px dashed var(--border, #ccc);
            padding: 15px;
            border-radius: 15px;
            font-size: 0.9rem;
            color: var(--text-muted, #666);
            margin-bottom: 30px;
            font-style: italic;
          }
          .popup-footer {
            display: flex;
            gap: 15px;
            margin-top: auto;
          }
          .popup-footer button {
            flex: 1;
          }

          @media (max-width: 768px) {
            .level-popup {
              padding: 20px;
              border-radius: 25px;
              max-height: 90vh;
              overflow-y: auto;
            }
            .popup-title {
              font-size: 1.8rem;
            }
            .popup-desc {
              font-size: 1rem;
            }
            .popup-footer {
              flex-direction: column-reverse;
            }
          }
          `
        }} />
      </motion.div>
    </div>
  );
};

export default LevelPopup;
