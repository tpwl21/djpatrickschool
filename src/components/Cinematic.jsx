import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PatrickAvatar from './PatrickAvatar';
import Glyph from './Glyph';
import { LanguageContext } from '../hooks/LanguageContext';
import LessonRecap from './LessonRecap';

// Gerbe de pictos à la victoire (une seule fois) : position finale relative à Patrick
const BURST = [
  { name: 'vinyl', x: -150, y: -70, r: -30 }, { name: 'note', x: 140, y: -90, r: 20 },
  { name: 'star', x: -120, y: 60, r: 15 }, { name: 'star', x: 150, y: 40, r: -10 },
  { name: 'note', x: -40, y: -130, r: -15 }, { name: 'vinyl', x: 60, y: -140, r: 25 },
];

// hint (échec) : 'pitch' | 'early' | 'late' | 'sync' | 'hold' | 'generic' → conseil précis au lieu d'un simple « réessaie »
const Cinematic = ({ onNextLevel, onRetry, type = 'win', message = "", title = "", grade = "", recap = null, bpm = 124, hint = 'generic' }) => {
  const { t } = useContext(LanguageContext);
  const isWin = type === 'win';
  
  return (
    <div className="cinematic-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="cinematic-backdrop"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className={`cinematic-card ${isWin ? 'win' : 'lose'}`}
      >
        <div className="cinematic-content">
          {isWin ? (
            <div className="win-layout">
              <div className="coach-celebration">
                <div className="celebration-avatar">
                  {BURST.map((g, i) => (
                    <motion.span
                      key={i}
                      className="burst-glyph"
                      initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                      animate={{ x: g.x, y: g.y, scale: 1, opacity: [0, 1, 1, 0], rotate: g.r }}
                      transition={{ duration: 1.4, delay: 0.25 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    >
                      <Glyph name={g.name} size="34px" shadow />
                    </motion.span>
                  ))}
                  {/* Patrick exulte et hoche la tête au tempo du niveau */}
                  <PatrickAvatar size="100%" expression="victoire" casque bpm={bpm} label="Patrick" />
                </div>
                <div className="speech-bubble-large">
                   <p>{message}</p>
                   <div className="bubble-tail-large" />
                </div>
              </div>
              
              <div className="success-text">
                {grade && (
                  <motion.div
                    className="grade-stamp"
                    initial={{ scale: 2.4, rotate: -28, opacity: 0 }}
                    animate={{ scale: 1, rotate: -12, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.45 }}
                  >
                    {grade}
                  </motion.div>
                )}
                <h1 className="win-title">{title || t('cinematic.win.title')}</h1>
                <p className="win-subtitle">{t('cinematic.win.subtitle')}</p>
                <LessonRecap recap={recap} />
                <button className="btn-crayon play-btn large" onClick={onNextLevel}>
                  {t('cinematic.win.nextLevel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="lose-layout">
              <div className="lose-avatar">
                <PatrickAvatar size="100%" expression="surpris" casque label="Patrick" />
              </div>
              <h2>{title || t('cinematic.lose.title')}</h2>
              <p>{t('cinematic.lose.subtitle')}</p>
              <p className="lose-hint"><Glyph name="pencil" /> {t(`cinematic.hints.${hint}`)}</p>
              <button className="btn-crayon nudge-btn large" onClick={onRetry}>
                {t('cinematic.lose.retry')}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cinematic-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
        }

        .cinematic-backdrop {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
        }

        .cinematic-card {
          position: relative;
          background: white;
          width: 90%;
          max-width: 900px;
          border-radius: 40px;
          border: 8px solid #333;
          padding: 50px;
          box-shadow: 20px 20px 0 rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .cinematic-card.win { border-color: #ff9f43; }
        /* la carte est toujours blanche : encre fixe (sinon le texte hérite de la couleur claire des thèmes MEDIUM/PRO) */
        .cinematic-card { color: #2b2b2b; }
        .cinematic-card.lose { border-color: #ff6b6b; }

        .win-layout {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .coach-celebration {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .celebration-avatar {
          position: relative;
          width: 260px;
          filter: var(--sticker-shadow);
        }
        .burst-glyph {
          position: absolute;
          left: 50%;
          top: 45%;
          margin: -17px 0 0 -17px;
          pointer-events: none;
        }
        .grade-stamp {
          position: absolute;
          top: -30px;
          right: 0;
          width: 110px;
          height: 110px;
          display: grid;
          place-items: center;
          border: 6px solid #c0392b;
          border-radius: 50%;
          color: #c0392b;
          font-size: 3.4rem;
          font-weight: 900;
          line-height: 1;
          box-shadow: inset 0 0 0 4px #fff, inset 0 0 0 7px #c0392b;
          background: rgba(255, 255, 255, 0.6);
          z-index: 2;
        }
        .lose-avatar { width: 170px; margin: 0 auto 10px; filter: var(--sticker-shadow); }
        .lose-layout h2 { margin: 0 0 6px; font-size: 2rem; }
        .lose-layout > p:not(.lose-hint) { margin: 0 0 12px; color: #555; }
        .lose-hint {
          display: flex;
          width: fit-content;
          align-items: center;
          gap: 8px;
          max-width: 46ch;
          margin: 4px auto 24px;
          padding: 10px 14px;
          background: #fffbe6;
          border: 3px solid #333;
          border-radius: 14px;
          font-weight: bold;
          color: #2b2b2b;
          text-align: left;
        }

        .speech-bubble-large {
          background: white;
          border: 4px solid #333;
          border-radius: 25px;
          padding: 20px 30px;
          position: relative;
          margin-top: -30px;
          z-index: 2;
          box-shadow: 10px 10px 0 rgba(0,0,0,0.1);
        }

        .speech-bubble-large p {
          margin: 0;
          font-family: 'Patrick Hand', cursive;
          font-weight: bold;
          font-size: 1.25rem;
          color: #333;
          line-height: 1.4;
        }

        .bubble-tail-large {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 20px solid #333;
        }

        .success-text {
          flex: 1.2;
          text-align: left;
          position: relative;
        }


        .win-title {
          position: relative;
          z-index: 1;
          font-size: 4rem;
          margin: 0;
          color: #333;
          line-height: 1;
        }

        .win-subtitle {
          font-size: 1.5rem;
          color: #666;
          margin: 20px 0 40px 0;
        }

        .btn-crayon.large {
          font-size: 2rem;
          padding: 20px 60px;
        }

        .lose-layout {
          text-align: center;
        }



        @media (max-width: 768px) {
          .cinematic-card {
            padding: 20px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            border-width: 4px;
          }
          .win-layout { 
            flex-direction: column; 
            text-align: center; 
            gap: 20px;
          }
          .win-title { font-size: 2rem; }
          .win-subtitle { font-size: 1rem; margin: 10px 0 20px 0; }
          .celebration-avatar { width: 150px; }
          .grade-stamp { position: static; width: 72px; height: 72px; font-size: 2.2rem; margin: 0 auto 10px; }
          .lose-avatar { width: 120px; }
          .speech-bubble-large { padding: 15px; margin-top: -10px; }
          .speech-bubble-large p { font-size: 1rem; }
          .success-text { text-align: center; }
          .btn-crayon.large { font-size: 1.2rem; padding: 15px 30px; width: 100%; }
        }
      `}} />
    </div>
  );
};


export default Cinematic;
