import React, { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import AudioVisualizer from './AudioVisualizer';
import DifficultySwitcher from './DifficultySwitcher';
import LanguageSwitcher from './LanguageSwitcher';

const LevelHeader = ({ 
  title, 
  description, 
  onBack, 
  audioCtx, 
  vizColor = "#ff6b6b",
  children 
}) => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="level-header" style={{ position: 'relative', padding: '0 60px', marginBottom: '15px', '--primary': vizColor }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, zIndex: -1, pointerEvents: 'none' }}>
        <AudioVisualizer audioCtx={audioCtx} color={vizColor} />
      </div>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={onBack} className="btn-crayon nudge-btn back-home-btn">
          {t('workshop.menu')}
        </button>
        <LanguageSwitcher />
      </div>
      
      <DifficultySwitcher 
        style={{ position: 'absolute', top: '20px', right: '120px' }} 
        mini={true} 
      />

      <h1>{title}</h1>
      {description && <p dangerouslySetInnerHTML={{ __html: description }} />}
      
      {children}

      <style dangerouslySetInnerHTML={{ __html: `
        .level-header h1 {
          color: var(--header-color);
          margin-bottom: 8px;
        }
        .level-header p {
          color: var(--text-muted);
          max-width: 800px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .difficulty-switcher {
            display: none; /* Hide in header on extreme mobile to save space, or reposition */
          }
          .level-header {
            padding: 0 10px;
          }
          .back-home-btn {
             position: static;
             margin-bottom: 5px;
          }
        }
      `}} />
    </div>
  );
};

export default LevelHeader;
