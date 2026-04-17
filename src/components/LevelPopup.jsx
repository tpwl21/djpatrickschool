import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';
import { LanguageContext } from '../hooks/LanguageContext';

const LevelPopup = ({ level, difficulty, onCancel, onStart }) => {
  const { t } = useContext(LanguageContext);
  const workshops = t('home.workshops');
  
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
          <div className="popup-level-id">{t('home.popup.level')} {level}</div>
          <div className="popup-diff-tag" style={{ backgroundColor: difficulty ? '#333' : '#ff6b6b' }}>
            {difficulty ? DIFFICULTY_SETTINGS[difficulty].name : t('home.popup.missingDifficulty')}
          </div>
        </div>
        
        <h1 className="popup-title">{workshops[level].title}</h1>
        <p className="popup-desc">{workshops[level].desc}</p>
        
        <div className="popup-details-box">
          {difficulty ? workshops[level].details : t('home.popup.selectDifficultyText')}
        </div>

        <div className="popup-footer">
          <button className="btn-crayon nudge-btn" onClick={onCancel}>{t('home.popup.cancel')}</button>
          <button 
            className="btn-crayon play-btn large" 
            style={{ opacity: difficulty ? 1 : 0.5, cursor: difficulty ? 'pointer' : 'not-allowed' }}
            onClick={() => difficulty && onStart()}
            disabled={!difficulty}
          >
            {difficulty ? t('home.popup.start') : t('home.popup.chooseDifficulty')}
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
            background: white;
            width: 100%;
            max-width: 550px;
            border: 5px solid #333;
            border-radius: 40px;
            padding: 40px;
            box-shadow: 15px 15px 0 rgba(0,0,0,0.15);
            font-family: inherit;
            color: #333;
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
            color: #666;
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
            color: #333;
          }
          .popup-desc {
            font-size: 1.1rem;
            color: #444;
            line-height: 1.4;
            margin-bottom: 25px;
          }
          .popup-details-box {
            background: #fdfaf6;
            border: 2px dashed #ccc;
            padding: 15px;
            border-radius: 15px;
            font-size: 0.9rem;
            color: #666;
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
