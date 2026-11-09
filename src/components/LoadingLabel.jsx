import React, { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import Glyph from './Glyph';

// Libellé d'attente des boutons pendant le chargement des morceaux : petit vinyle qui tourne + voix de Patrick
// compact : vinyle seul (boutons étroits), le texte reste lisible par les lecteurs d'écran
const LoadingLabel = ({ compact = false }) => {
  const { t } = useContext(LanguageContext);
  return (
    <span className="loading-label" title={compact ? t('workshop.loading') : undefined}>
      <span className="loading-vinyl" aria-hidden="true"><Glyph name="vinyl" size="1.1em" /></span>
      {compact ? <span className="sr-only">{t('workshop.loading')}</span> : t('workshop.loading')}
      <style>{`
        .loading-label { display: inline-flex; align-items: center; gap: 8px; }
        .loading-label .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .loading-vinyl { display: inline-flex; animation: loading-spin 1.2s linear infinite; }
        @keyframes loading-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .loading-vinyl { animation: none; } }
      `}</style>
    </span>
  );
};

export default LoadingLabel;
