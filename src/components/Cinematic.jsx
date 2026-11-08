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



        /* la recap hérite sinon de --text (clair en MEDIUM/PRO) alors que la carte reste blanche */
        .cinematic-card .lesson-recap { background: #faf7f0; }
        .cinematic-card .lesson-recap-label { color: #555; }
        .cinematic-card .lesson-recap-list li { color: #2b2b2b; }

        /* Téléphone et écrans bas : tout doit tenir sans scroller, le bouton toujours visible.
           La carte devient une colonne de hauteur max = écran ; seule la recap peut défiler en dernier recours. */
        @media (max-width: 768px), (max-height: 560px) {
          .cinematic-container { padding: max(10px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom)); }
          .cinematic-card {
            width: 100%;
            max-height: 100%;
            padding: 16px;
            border-width: 4px;
            border-radius: 28px;
            box-shadow: 8px 8px 0 rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
          }
          .cinematic-content, .win-layout, .success-text, .lose-layout {
            display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto;
          }
          .win-layout { gap: 10px; text-align: center; }
          /* Patrick à gauche, bulle à droite : une ligne au lieu de deux étages */
          .coach-celebration { flex: 0 0 auto; flex-direction: row; align-items: center; gap: 10px; }
          .celebration-avatar { width: 84px; flex: 0 0 auto; }
          .burst-glyph { transform-origin: center; }
          .speech-bubble-large { flex: 1; margin: 0; padding: 10px 12px; border-width: 3px; border-radius: 18px; box-shadow: 4px 4px 0 rgba(0,0,0,0.1); text-align: left; }
          .speech-bubble-large p { font-size: 0.95rem; line-height: 1.3; }
          .bubble-tail-large {
            top: 50%; left: -14px; transform: translateY(-50%);
            border-top: 10px solid transparent; border-bottom: 10px solid transparent;
            border-right: 14px solid #333; border-left: 0;
          }
          .success-text { text-align: center; }
          .grade-stamp { top: -4px; right: 0; width: 54px; height: 54px; font-size: 1.7rem; border-width: 4px; box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 5px #c0392b; }
          .win-title { font-size: 1.9rem; padding: 0 58px; }
          .win-subtitle { font-size: 1rem; margin: 6px 0 0; }
          .lesson-recap { flex: 0 1 auto; min-height: 0; overflow-y: auto; margin: 10px 0 0; padding: 10px 14px; text-align: left; }
          .lesson-recap-label { font-size: 0.75rem; margin-bottom: 6px; }
          .lesson-recap-list { padding-left: 18px; }
          .lesson-recap-list li { font-size: 0.92rem; line-height: 1.35; margin-bottom: 4px; }
          /* App.css force les boutons à 0.75rem en !important sur mobile : le bouton de fin doit rester gros */
          .cinematic-card .btn-crayon.large { flex: 0 0 auto; font-size: 1.2rem !important; padding: 12px 20px !important; width: 100%; margin-top: 12px; }
          .lose-layout { align-items: center; justify-content: center; }
          .lose-avatar { width: 96px; flex: 0 0 auto; margin-bottom: 6px; }
          .lose-layout h2 { font-size: 1.5rem; }
          .lose-layout > p:not(.lose-hint) { margin-bottom: 8px; }
          .lose-hint { margin: 0 auto 4px; padding: 8px 12px; font-size: 0.95rem; }
        }
        /* paysage bas : Patrick et le texte côte à côte, avatar réduit */
        @media (max-height: 560px) and (min-width: 600px) {
          .win-layout { flex-direction: row; align-items: stretch; gap: 16px; }
          .coach-celebration { flex: 0 0 38%; flex-direction: column; justify-content: center; }
          .celebration-avatar { width: 110px; }
          .bubble-tail-large { top: -14px; left: 50%; transform: translateX(-50%); border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 14px solid #333; border-top: 0; }
          .speech-bubble-large { flex: 0 0 auto; margin-top: 8px; }
          .lose-layout { flex-direction: column; }
          .lose-avatar { width: 72px; }
        }
      `}} />
    </div>
  );
};


export default Cinematic;
