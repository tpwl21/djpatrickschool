import React, { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import Glyph from './Glyph';

// Libellé d'attente des boutons pendant le chargement des morceaux : petit vinyle qui tourne + voix de Patrick
const LoadingLabel = () => {
  const { t } = useContext(LanguageContext);
  return (
    <span className="loading-label">
      <span className="loading-vinyl" aria-hidden="true"><Glyph name="vinyl" size="1.1em" /></span>
      {t('workshop.loading')}
      <style>{`
        .loading-label { display: inline-flex; align-items: center; gap: 8px; }
        .loading-vinyl { display: inline-flex; animation: loading-spin 1.2s linear infinite; }
        @keyframes loading-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .loading-vinyl { animation: none; } }
      `}</style>
    </span>
  );
};

export default LoadingLabel;
