import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../hooks/LanguageContext.jsx';
import PatrickAvatar from './PatrickAvatar';
import { useDifficulty } from '../hooks/useDifficulty.jsx';

// Bandeau du coach sous le titre du niveau : petit Patrick + sa bulle, dans le flux de la page
// (ne recouvre jamais le jeu). Le × replie la bulle ; toucher Patrick la rouvre.
const CoachPatrick = ({ tips = [] }) => {
  const { t } = useContext(LanguageContext);
  const [difficulty] = useDifficulty();
  const isPro = difficulty === 'PRO';
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  // isOpen = choix de l'utilisateur ; isBubbleVisible = fondu entre deux conseils
  // écran bas (téléphone couché) : bulle repliée au départ pour laisser le jeu visible
  const [isOpen, setIsOpen] = useState(() => !window.matchMedia('(max-height: 500px)').matches);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  // petit écran : la bulle est limitée à 2 lignes, un tap l'affiche en entier
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (tips.length <= 1) return undefined;
    const interval = setInterval(() => {
      setIsBubbleVisible(false);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setExpanded(false);
        setIsBubbleVisible(true);
      }, 300);
    }, 15000);
    return () => clearInterval(interval);
  }, [tips]);

  return (
    <div className={`coach-strip ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="coach-avatar"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-label={isOpen ? t('coach.close') : t('coach.open')}
      >
        <PatrickAvatar
          size="100%"
          viewBox="46 10 148 190"
          expression={isPro ? 'focus' : 'content'}
          casque={!isPro}
          hoodieText={isPro ? 'PRO' : 'COACH'}
          label=""
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && isBubbleVisible && (
          <motion.div
            className={`coach-bubble ${expanded ? 'is-expanded' : ''}`}
            role="status"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <p onClick={() => setExpanded((e) => !e)}>{tips[currentTipIndex]}</p>
            <button className="coach-close" onClick={() => setIsOpen(false)} aria-label={t('coach.close')}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .coach-strip {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          text-align: left;
          min-height: 64px;
        }
        .coach-avatar {
          flex: 0 0 auto;
          width: 64px;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
          filter: var(--sticker-shadow);
          transition: transform 0.15s ease;
        }
        .coach-avatar:hover { transform: translateY(-2px) rotate(-2deg); }
        .coach-avatar svg { width: 100%; height: auto; }
        .coach-bubble {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
          background: #fff;
          color: #2b2b2b;
          border: 3px solid #333;
          border-radius: 18px;
          padding: 10px 44px 10px 16px;
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.12);
        }
        /* pointe de la bulle vers Patrick */
        .coach-bubble::before,
        .coach-bubble::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          border-style: solid;
          border-color: transparent;
        }
        .coach-bubble::before { left: -14px; border-width: 10px 14px 10px 0; border-right-color: #333; }
        .coach-bubble::after { left: -9px; border-width: 7px 10px 7px 0; border-right-color: #fff; }
        .coach-bubble p {
          margin: 0;
          font-weight: bold;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        .coach-close {
          position: absolute;
          top: 0;
          right: 0;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          font-size: 22px;
          line-height: 1;
          color: #6b6b6b;
          cursor: pointer;
        }
        .coach-close:hover { color: #2b2b2b; }
        @media (max-width: 760px), (max-height: 500px) {
          .coach-strip { gap: 10px; min-height: 0; }
          .coach-avatar { width: 44px; }
          .coach-bubble { padding: 6px 40px 6px 12px; }
          /* 2 lignes max : le texte complet reste lisible en touchant Patrick (bulle repliable) */
          .coach-bubble p {
            font-size: 0.85rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .coach-bubble.is-expanded p { -webkit-line-clamp: unset; }
          .coach-close { width: 40px; height: 40px; }
        }
      `}} />
    </div>
  );
};

export default CoachPatrick;
