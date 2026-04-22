import React, { useContext } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { LanguageContext } from '../hooks/LanguageContext';

export default function LessonRecap({ recap, title }) {
  const { t } = useContext(LanguageContext);
  if (!recap || recap.length === 0) return null;

  return (
    <motion.div
      className="lesson-recap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="lesson-recap-label">{title || t('lesson.recapTitle')}</div>
      <ul className="lesson-recap-list">
        {recap.map((point, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            {point}
          </motion.li>
        ))}
      </ul>
      <style dangerouslySetInnerHTML={{ __html: `
        .lesson-recap {
          margin: 24px 0;
          padding: 20px 24px;
          border: 3px dashed var(--lesson-color, var(--accent-env, #5DADE2));
          border-radius: 16px;
          background: var(--surface-solid, rgba(0,0,0,0.02));
        }
        .lesson-recap-label {
          font-weight: 900;
          font-size: 0.85rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
          color: var(--text-muted, #444);
        }
        .lesson-recap-list {
          margin: 0;
          padding-left: 22px;
        }
        .lesson-recap-list li {
          margin-bottom: 8px;
          line-height: 1.45;
          color: var(--text, #333);
        }
      `}} />
    </motion.div>
  );
}
