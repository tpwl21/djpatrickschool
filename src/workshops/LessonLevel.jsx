import React, { useState, useContext } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../hooks/LanguageContext';
import { t as pickText } from '../lib/levels/schema';
import LessonMedia from '../components/LessonMedia';
import CamelotMappingTable from '../components/CamelotMappingTable';
import Md from '../components/Md';
import LessonRecap from '../components/LessonRecap';
import DifficultySwitcher from '../components/DifficultySwitcher';
import PatrickNotes from '../components/PatrickNotes';
import Glyph from '../components/Glyph';
import { inkOn } from '../utils/color';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const DIFF_LABELS = { EASY: 'Easy', MEDIUM: 'Medium', PRO: 'Pro' };

// Trois formats de quiz cohabitent dans les leçons TOML : [[quiz]] avec en/fr dans chaque question,
// [[quiz]] scindé (une entrée par langue) et [[fr.quiz]] / [[en.quiz]]. On ramène tout à
// { question, answers, correct } dans la langue affichée, sans doublons.
function quizFor(lesson, lessonText, language) {
  const root = lesson.quiz || [];
  const items = lessonText?.quiz?.length
    ? lessonText.quiz
    : root
      .filter((q) => q[language] || !root.some((x) => x[language]))
      .map((q) => ({ correct: q.correct, ...(q[language] || q.en || q.fr) }));
  const seen = new Set();
  return items
    .filter((q) => q?.question && !seen.has(q.question) && seen.add(q.question))
    .map(shuffleAnswers);
}

// La bonne réponse est en 1re position dans ~2/3 des questions écrites : on mélange à l'affichage.
// Mélange déterministe (graine = texte de la question) : stable d'un rendu à l'autre, sans état.
function shuffleAnswers(q) {
  const answers = q.answers || [];
  let seed = 0;
  for (const c of q.question) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const order = answers.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0; // mélange des bits (les bits faibles d'un LCG cyclent)
    const j = Math.floor((seed / 2 ** 32) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, answers: order.map((i) => answers[i]), correct: order.indexOf(q.correct) };
}

const LessonLevel = ({ lesson, workshop, requestedDifficulty, servedDifficulty, onNextLevel, onBack, onUnlockNext }) => {
  const { language, t } = useContext(LanguageContext);
  const [pageIndex, setPageIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [retryQuiz, setRetryQuiz] = useState(false);

  const color = workshop?.meta?.color || '#5DADE2';
  const lessonText = pickText(lesson, language);
  useDocumentTitle(lessonText?.title);
  const pages = lessonText?.pages || [];
  const questions = quizFor(lesson, lessonText, language);
  const isQuizPhase = pageIndex >= pages.length;
  const currentPage = pages[pageIndex];

  const allAnswered = questions.every((_, qi) => quizAnswers[qi] !== undefined);
  const allCorrect = questions.every((q, qi) => quizAnswers[qi] === q.correct);

  const handleSubmit = () => {
    setSubmitted(true);
    if (allCorrect) {
      setPassed(true);
      onUnlockNext();
    }
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setSubmitted(false);
    setPassed(false);
    setRetryQuiz((r) => !r);
  };

  return (
    <div className="lesson-container" style={{ '--lesson-color': color, '--primary': color, '--wh-ink': inkOn(color), '--lesson-ink': 'color-mix(in srgb, var(--lesson-color) 20%, var(--text))' }}>
      <div className="lesson-top-bar">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className="btn-crayon lesson-back-btn" onClick={onBack}>
            ← {t('lesson.backToWorkshop')}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <DifficultySwitcher mini={true} />
          <PatrickNotes compact />
          <div className="lesson-badge">{t('lesson.lessonLabel')} {lesson.order}</div>
        </div>
      </div>

      <div className="lesson-header">
        <div className="lesson-accent-bar" />
        <h1 className="lesson-title">{lessonText?.title}</h1>
        {servedDifficulty !== requestedDifficulty && (
          <div className="lesson-fallback-banner">
            {t('lesson.fallbackBanner')
              .replace('{served}', DIFF_LABELS[servedDifficulty] || servedDifficulty)
              .replace('{requested}', DIFF_LABELS[requestedDifficulty] || requestedDifficulty)}
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="lesson-progress">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`lesson-dot ${i <= pageIndex && !isQuizPhase ? 'active' : i < pageIndex ? 'done' : ''}`}
          />
        ))}
        {questions.length > 0 && (
          <div className={`lesson-dot quiz-dot ${isQuizPhase ? 'active' : ''} ${passed ? 'done' : ''}`}><Glyph name="pencil" size="1.1em" /></div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Page reader */}
        {!isQuizPhase && (
          <motion.div
            key={`page-${pageIndex}`}
            className="lesson-page"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h2 className="lesson-page-title">{currentPage?.title}</h2>
            <Md className="lesson-page-content">{currentPage?.content}</Md>
            {currentPage?.camelot_table && <CamelotMappingTable />}
            <LessonMedia
              image={currentPage?.image}
              imageCaption={currentPage?.image_caption}
              youtube={currentPage?.youtube}
              youtubeStart={currentPage?.youtube_start}
              youtubeCaption={currentPage?.youtube_caption}
            />
            <div className="lesson-nav">
              {pageIndex > 0 && (
                <button className="btn-crayon nudge-btn" onClick={() => setPageIndex((i) => i - 1)}>
                  ← {t('lesson.prev')}
                </button>
              )}
              <button
                className="btn-crayon play-btn"
                onClick={() => setPageIndex((i) => i + 1)}
              >
                {pageIndex < pages.length - 1 ? `${t('lesson.next')} →` : `${t('lesson.toQuiz')} →`}
              </button>
            </div>
          </motion.div>
        )}

        {/* Quiz */}
        {isQuizPhase && !passed && (
          <motion.div
            key={`quiz-${retryQuiz}`}
            className="lesson-quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="lesson-quiz-title">{t('lesson.quiz')}</h2>
            {questions.map((q, qi) => {
              const selected = quizAnswers[qi];
              const isWrong = submitted && selected !== q.correct;
              return (
                <div key={qi} className={`quiz-question ${submitted && isWrong ? 'wrong' : ''}`}>
                  <p className="quiz-q-text">{q.question}</p>
                  <div className="quiz-answers">
                    {(q.answers || []).map((ansText, ai) => {
                      const isSelected = selected === ai;
                      const showCorrect = submitted && ai === q.correct;
                      const showWrong = submitted && isSelected && ai !== q.correct;
                      return (
                        <button
                          key={ai}
                          className={`quiz-answer-btn ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''}`}
                          onClick={() => !submitted && setQuizAnswers((prev) => ({ ...prev, [qi]: ai }))}
                          disabled={submitted}
                        >
                          {ansText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="lesson-nav">
              {pageIndex > 0 && (
                <button className="btn-crayon nudge-btn" onClick={() => setPageIndex((i) => i - 1)}>
                  ← {t('lesson.prev')}
                </button>
              )}
              {!submitted ? (
                <button
                  className="btn-crayon play-btn"
                  disabled={!allAnswered}
                  style={{ opacity: allAnswered ? 1 : 0.4 }}
                  onClick={handleSubmit}
                >
                  {t('lesson.submit')}
                </button>
              ) : (
                <button className="btn-crayon play-btn" onClick={handleRetryQuiz}>
                  {t('lesson.retry')}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Success */}
        {passed && (
          <motion.div
            key="success"
            className="lesson-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="lesson-success-icon"><Glyph name="star" size="4.5rem" shadow /></div>
            <h2>{t('lesson.successTitle')}</h2>
            <p>{t('lesson.successText')}</p>
            <LessonRecap recap={lessonText?.recap} />
            <div className="lesson-nav">
              <button className="btn-crayon nudge-btn" onClick={onBack}>
                {t('lesson.backToWorkshop')}
              </button>
              <button className="btn-crayon play-btn" onClick={onNextLevel}>
                {t('lesson.nextLesson')} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .lesson-container {
          background: var(--surface-solid, #fff);
          color: var(--text, #333);
          min-height: 100vh;
          padding: 20px 20px 80px 20px;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .lesson-top-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .lesson-back-btn {
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
        .lesson-back-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(0,0,0,0.1);
        }
        .lesson-badge {
          background: var(--lesson-color);
          color: var(--wh-ink, #2b2b2b);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .lesson-header { display: flex; flex-direction: column; gap: 10px; }
        .lesson-fallback-banner {
          background: #fff3cd;
          color: #856404;
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .lesson-accent-bar {
          width: 60px;
          height: 5px;
          background: var(--lesson-color);
          border-radius: 4px;
        }
        .lesson-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          margin: 0;
          color: var(--lesson-ink, var(--text)); /* couleur d'atelier mêlée au texte : lisible sur tous les thèmes */
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
        }
        .lesson-progress {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .lesson-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e0e0e0;
          border: 2px solid #ccc;
          transition: all 0.3s;
        }
        .lesson-dot.active {
          background: var(--lesson-color);
          border-color: var(--lesson-color);
          transform: scale(1.2);
        }
        .lesson-dot.done {
          background: #aaa;
          border-color: #aaa;
        }
        .lesson-dot.quiz-dot {
          border-radius: 4px;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          color: #fff;
        }
        .lesson-page, .lesson-quiz, .lesson-success {
          background: var(--surface-elevated, #fafafa);
          border: 4px solid var(--border, #333);
          border-radius: 28px;
          padding: 36px;
          box-shadow: 10px 10px 0 rgba(0,0,0,0.08), var(--glow, none);
          flex: 1;
          color: var(--text, #333);
        }
        .lesson-page-title {
          font-size: 1.5rem;
          margin: 0 0 20px 0;
          font-weight: 900;
          color: var(--text, #222);
        }
        .lesson-page-content {
          margin: 0 0 30px 0;
        }
        .lesson-nav {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .lesson-quiz-title {
          font-size: 1.4rem;
          font-weight: 900;
          margin: 0 0 24px 0;
          color: var(--text, #222);
          letter-spacing: 1px;
        }
        .quiz-question {
          margin-bottom: 28px;
          padding: 20px;
          border: 3px solid var(--border, #e0e0e0);
          border-radius: 16px;
          background: var(--surface-solid, #fff);
          transition: border-color 0.2s;
        }
        .quiz-question.wrong { border-color: #ff6b6b; }
        .quiz-q-text {
          font-size: 1.05rem;
          font-weight: 900;
          margin: 0 0 14px 0;
          color: var(--text, #333);
        }
        .quiz-answers {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .quiz-answer-btn {
          background: var(--surface-solid, #fff);
          border: 3px solid var(--border, #ddd);
          border-radius: 12px;
          padding: 12px 16px;
          text-align: left;
          font-family: inherit;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--text, #444);
        }
        .quiz-answer-btn:hover:not(:disabled) {
          border-color: var(--lesson-color);
          color: #222;
          transform: translateX(4px);
        }
        .quiz-answer-btn.selected {
          border-color: var(--lesson-color);
          background: color-mix(in srgb, var(--lesson-color) 12%, white);
          color: #222;
        }
        .quiz-answer-btn.correct {
          border-color: #27ae60;
          background: #eafaf1;
          color: #1e8449;
        }
        .quiz-answer-btn.wrong {
          border-color: #e74c3c;
          background: #fdf2f0;
          color: #c0392b;
        }
        .lesson-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        .lesson-success-icon { line-height: 1; }
        .lesson-success h2 {
          font-size: 2.2rem;
          margin: 0;
          color: var(--lesson-ink, var(--text));
          font-weight: 900;
        }
        .lesson-success p {
          font-size: 1.1rem;
          color: var(--text-muted, #555);
          margin: 0;
        }
        .lesson-success .lesson-nav { justify-content: center; }
        @media (max-width: 768px) {
          .lesson-page, .lesson-quiz, .lesson-success { padding: 20px; border-radius: 20px; }
          .lesson-nav { flex-direction: column-reverse; }
          .lesson-nav button { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default LessonLevel;
