import { useContext } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';

const MasterTempoSwitch = ({ value, onChange, color = '#8E44AD', highlight = false, size = 'md' }) => {
  const { language } = useContext(LanguageContext);
  const label = language === 'fr' ? 'MASTER TEMPO' : 'MASTER TEMPO';
  const sub = value
    ? (language === 'fr' ? 'clé verrouillée' : 'key locked')
    : (language === 'fr' ? 'pitch couplé' : 'pitch coupled');

  const w = size === 'sm' ? 44 : 56;
  const h = size === 'sm' ? 24 : 30;
  const knob = h - 6;

  return (
    <button
      type="button"
      onClick={() => onChange && onChange(!value)}
      aria-pressed={!!value}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
        animation: highlight ? 'mtPulse 1s infinite' : 'none',
      }}
    >
      <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px', color: value ? color : '#888' }}>
        {label}
      </span>
      <span style={{
        position: 'relative', width: w, height: h,
        borderRadius: h / 2, border: `3px solid #333`,
        background: value ? color : '#ddd',
        transition: 'background 0.18s',
        boxShadow: highlight ? `0 0 0 4px ${color}44` : 'none',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: value ? (w - knob - 6) : 3,
          width: knob, height: knob, borderRadius: '50%',
          background: '#fff', border: '2px solid #333',
          transition: 'left 0.18s',
        }} />
      </span>
      <span style={{ fontSize: '0.55rem', fontWeight: 700, opacity: 0.6 }}>{sub}</span>
      <style>{`@keyframes mtPulse {0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}`}</style>
    </button>
  );
};

export default MasterTempoSwitch;
