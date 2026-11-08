import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevelPopup from './LevelPopup';
import BookIcon from './BookIcon';
import { LanguageContext } from '../hooks/LanguageContext';
import { DIFFICULTY_SETTINGS, DIFF_COLORS } from '../constants/difficulty';
import { useDifficulty } from '../hooks/useDifficulty.jsx';
import { getWorkshop } from '../lib/levels/load';
import { t as pickText } from '../lib/levels/schema';
import DifficultySwitcher from './DifficultySwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import Glyph from './Glyph';
import { inkOn } from '../utils/color';
import { useDocumentTitle } from '../hooks/useDocumentTitle';


const WorkshopHome = ({ workshopId, unlockedOrder = { practice: 1, lessons: 1 }, onStart, onStartLesson, onBack }) => {
  const { language, t } = useContext(LanguageContext);
  const workshop = getWorkshop(workshopId);
  const [difficulty, setDifficulty] = useDifficulty();
  const [selectedLevel, setSelectedLevel] = useState(null);
  // titre d'onglet (avant tout return anticipé : règle des hooks)
  useDocumentTitle(workshop ? pickText(workshop.meta, language)?.title : t('notFound.title'));

  if (!workshop) {
    return (
      <div className="workshop-home-container">
        <h1>{t('notFound.title')}</h1>
        <button className="btn-crayon" onClick={onBack}>{t('notFound.back')}</button>
      </div>
    );
  }

  const { meta, imageUrl, levelsList, lessonsList } = workshop;
  const color = meta.color || '#333';
  const metaText = pickText(meta, language);
  const title = metaText?.title;
  const shortDesc = metaText?.short_desc;
  const longDesc = metaText?.long_desc;
  const objectives = metaText?.objectives || [];
  const isBeatmatching = meta.kind === 'beatmatching';

  const unlockedPractice = typeof unlockedOrder === 'object' ? (unlockedOrder.practice || 1) : unlockedOrder;
  const unlockedLessons = typeof unlockedOrder === 'object' ? (unlockedOrder.lessons || 1) : 1;
  const completedLessons = unlockedOrder.completedLessons || [];
  const completedPractice = unlockedOrder.completedPractice || {};

  return (
    <div className="workshop-home-container" style={{ '--wh-color': color, '--wh-ink': inkOn(color), '--primary': color }}>
      <div className="wh-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-crayon wh-back-btn" onClick={onBack}>← {t('workshop.menu')}</button>
          <LanguageSwitcher />
        </div>
        <DifficultySwitcher mini={true} />
      </div>

      <motion.div
        className="wh-hero"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="wh-hero-text">
          <div className="wh-accent-bar" />
          <h1 className="wh-title">{title}</h1>
          <p className="wh-short-desc">{shortDesc}</p>
        </div>
        {imageUrl && (
          <img src={imageUrl} alt={title} className="wh-hero-img" />
        )}
      </motion.div>

      <div className="wh-body">
        {longDesc && <p className="wh-long-desc">{longDesc}</p>}

        {objectives.length > 0 && (
          <div className="wh-objectives">
            <h2>{language === 'fr' ? 'OBJECTIFS' : 'OBJECTIVES'}</h2>
            <ul>
              {objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Lessons section */}
        {lessonsList.length > 0 && (
          <div className="wh-section">
            <div className="wh-section-header">
              <BookIcon color={color} />
              <span className="wh-section-label">{t('lesson.lessonsSection')}</span>
            </div>
            <div className="wh-levels-grid">
              {lessonsList.map((lesson) => {
                const isLocked = lesson.order > unlockedLessons;
                // completedLessons is { [order]: ['EASY', 'MEDIUM', ...] }
                const lessonDiffs = Array.isArray(completedLessons)
                  ? (completedLessons.includes(lesson.order) ? ['MEDIUM'] : [])
                  : (completedLessons[lesson.order] || []);
                const isDone = lessonDiffs.length > 0;
                const lesText = pickText(lesson, language);
                const lessonTitle = lesText?.title;
                const lessonDesc = lesText?.short_desc || lesText?.description;
                return (
                  <motion.button
                    key={lesson.id}
                    className={`wh-level-card lesson-card ${isLocked ? 'locked' : ''} ${isDone ? 'done' : ''}`}
                    whileHover={!isLocked ? { scale: 1.03, rotate: -1 } : {}}
                    onClick={() => !isLocked && onStartLesson(workshopId, lesson.order)}
                    disabled={isLocked}
                  >
                    <div className="wh-level-num">{isLocked ? <Glyph name="lock" label={language === 'fr' ? 'Verrouillé' : 'Locked'} /> : `L${lesson.order}`}</div>
                    <div className="wh-level-body">
                      <div className="wh-level-title">{isLocked ? '???' : lessonTitle}</div>
                      {!isLocked && <div className="wh-level-desc">{lessonDesc}</div>}
                      {lessonDiffs.length > 0 && (
                        <div className="wh-diff-badges">
                          {lessonDiffs.map((d) => (
                            <span key={d} className="wh-diff-badge" style={{ background: DIFF_COLORS[d] }}>
                              {d[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Practice section */}
        <div className="wh-section">
          <div className="wh-section-header">
            <div className="wh-section-icon-placeholder" style={{ background: color }} />
            <span className="wh-section-label">{t('lesson.practiceSection')}</span>
          </div>

          <div className="wh-levels-grid">
            {levelsList.map((level) => {
              const isLocked = level.order > unlockedPractice;
              const diffs = completedPractice[level.order] || [];
              const lvlText = pickText(level, language);
              const levelTitle = lvlText?.title;
              const levelDesc = lvlText?.short_desc || lvlText?.description;
              return (
                <motion.button
                  key={level.id}
                  className={`wh-level-card ${isLocked ? 'locked' : ''} ${diffs.length > 0 ? 'done' : ''}`}
                  whileHover={!isLocked ? { scale: 1.03, rotate: -1 } : {}}
                  onClick={() => !isLocked && setSelectedLevel(level)}
                  disabled={isLocked}
                >
                  <div className="wh-level-num">{isLocked ? <Glyph name="lock" label={language === 'fr' ? 'Verrouillé' : 'Locked'} /> : level.order}</div>
                  <div className="wh-level-body">
                    <div className="wh-level-title">{isLocked ? '???' : levelTitle}</div>
                    {!isLocked && <div className="wh-level-desc">{levelDesc}</div>}
                    {diffs.length > 0 && (
                      <div className="wh-diff-badges">
                        {diffs.map((d) => (
                          <span key={d} className="wh-diff-badge" style={{ background: DIFF_COLORS[d] }}>
                            {d[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedLevel && (
          <LevelPopup
            workshopMeta={meta}
            level={selectedLevel}
            difficulty={isBeatmatching ? difficulty : null}
            requireDifficulty={isBeatmatching}
            onCancel={() => setSelectedLevel(null)}
            onStart={() => onStart(workshopId, selectedLevel.order, isBeatmatching ? difficulty : 'EASY')}
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .workshop-home-container {
          background: var(--surface-solid, #fff);
          color: var(--text, #333);
          min-height: 100vh;
          padding: 20px 20px 100px 20px;
          max-width: 1200px;
          margin: 0 auto;
          transition: background 400ms ease, color 400ms ease;
        }
        .wh-top-bar {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 30px;
        }
        .wh-back-btn {
          background: #fff;
          color: #333;
          border: 3px solid #333;
          padding: 10px 20px;
          border-radius: 12px;
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
        }
        .wh-back-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(0,0,0,0.1);
        }
        .wh-hero {
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 40px;
          padding: 30px;
          border: 4px solid var(--border, #333);
          border-radius: 30px;
          background: var(--surface-elevated, #fafafa);
          box-shadow: 10px 10px 0 rgba(0,0,0,0.1), var(--glow, none);
        }
        .wh-hero-text { flex: 2; }
        .wh-accent-bar {
          width: 80px;
          height: 6px;
          background: var(--wh-color);
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .wh-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          margin: 0 0 10px 0;
          color: var(--text);
          /* la couleur de l'atelier passe en trait de feutre sous le titre (lisible sur tous les thèmes) */
          text-decoration: underline;
          text-decoration-color: var(--wh-color);
          text-decoration-thickness: 6px;
          text-underline-offset: 8px;
          letter-spacing: -1px;
          font-weight: 900;
        }
        .wh-short-desc {
          font-size: 1.2rem;
          color: var(--text-muted, #555);
          margin: 0;
          line-height: 1.4;
        }
        .wh-hero-img {
          flex: 1;
          max-width: 220px;
          height: auto;
          filter: var(--sticker-shadow);
          mix-blend-mode: multiply;
        }
        .wh-body {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .wh-long-desc {
          font-size: 1.05rem;
          line-height: 1.5;
          color: var(--text, #444);
          padding: 0 10px;
        }
        .wh-objectives {
          background: var(--surface-elevated, #fdfaf6);
          border: 2px dashed var(--border, #ccc);
          border-radius: 20px;
          padding: 20px 30px;
        }
        .wh-objectives h2 {
          font-size: 0.8rem;
          letter-spacing: 2px;
          color: var(--text-muted, #888);
          margin: 0 0 10px 0;
        }
        .wh-objectives ul {
          margin: 0;
          padding-left: 20px;
        }
        .wh-objectives li {
          margin-bottom: 6px;
          font-size: 1rem;
        }
        .wh-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .wh-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wh-section-label {
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--text-muted, #888);
        }
        .wh-section-icon-placeholder {
          width: 44px;
          height: 36px;
          border-radius: 4px;
          opacity: 0.7;
        }
        .wh-difficulty-row {
          display: flex;
          justify-content: center;
          margin: 10px 0 20px 0;
        }
        .wh-levels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .wh-level-card {
          display: flex;
          align-items: center;
          gap: 15px;
          background: var(--surface-elevated, #fff);
          color: var(--text, #333);
          border: 3px solid var(--border, #333);
          border-radius: 18px;
          padding: 18px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          box-shadow: 6px 6px 0 rgba(0,0,0,0.08);
          transition: transform 0.15s, box-shadow 0.15s, background 400ms ease, color 400ms ease;
        }
        .wh-level-card:hover:not(:disabled) {
          border-color: var(--wh-color);
        }
        .wh-level-card.lesson-card:hover:not(:disabled) {
          border-style: dashed;
        }
        .wh-level-card.locked {
          opacity: 0.4;
          cursor: not-allowed;
          border: 3px dashed var(--border, #aaa);
          background: var(--surface-solid, #f4f4f4);
          box-shadow: none;
        }
        .wh-level-num {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--wh-color);
          color: var(--wh-ink, #2b2b2b);
          font-size: 1.2rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wh-level-card.locked .wh-level-num {
          background: #ccc;
        }
        .wh-level-body { flex: 1; min-width: 0; }
        .wh-level-title {
          font-size: 1.05rem;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .wh-level-desc {
          font-size: 0.85rem;
          color: var(--text-muted, #666);
          line-height: 1.3;
        }
        .wh-level-card.done {
          border-color: #27ae60;
        }
        .wh-done-check {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #27ae60;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
        }
        .wh-diff-badges {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .wh-diff-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0;
        }
        @media (max-width: 768px) {
          .wh-hero {
            flex-direction: column-reverse;
            gap: 15px;
            padding: 20px;
          }
          .wh-hero-img {
            flex: 0 0 auto;
            width: auto;
            max-width: 140px;
            max-height: 160px;
            object-fit: contain;
          }
        }
      `}} />
    </div>
  );
};

export default WorkshopHome;
