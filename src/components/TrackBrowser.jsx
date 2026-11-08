import { useContext, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import { camelotToMusical } from '../lib/keys';
import Glyph from './Glyph';
import { useMobileDetection } from '../hooks/useMobileDetection';

const DEFAULT_COLUMNS = ['title', 'bpm', 'key', 'camelot'];

// Numeric sort for Camelot codes: 1A < 1B < 2A < ... < 12A < 12B
const camelotOrder = (k) => {
  if (!k) return 9999;
  const m = String(k).toUpperCase().match(/^(\d{1,2})([AB])$/);
  if (!m) return 9999;
  return parseInt(m[1], 10) * 2 + (m[2] === 'B' ? 1 : 0);
};

const COLUMN_META = {
  title:   { labelFr: 'Titre',  labelEn: 'Title',  align: 'left',   flex: '1 1 0', sortKey: (t) => (t.title || '').toLowerCase() },
  bpm:     { labelFr: 'BPM',    labelEn: 'BPM',    align: 'right',  flex: '0 0 60px', sortKey: (t) => t.bpm ?? 0 },
  key:     { labelFr: 'Clé',    labelEn: 'Key',    align: 'center', flex: '0 0 70px', sortKey: (t) => (camelotToMusical(t.key) || '').toLowerCase() },
  camelot: { labelFr: 'Camelot',labelEn: 'Camelot',align: 'center', flex: '0 0 70px', sortKey: (t) => camelotOrder(t.key) },
  genre:   { labelFr: 'Genre',  labelEn: 'Genre',  align: 'left',   flex: '0 0 90px', sortKey: (t) => (t.genre || '').toLowerCase() },
  energy:  { labelFr: 'Énergie',labelEn: 'Energy', align: 'center', flex: '0 0 70px', sortKey: (t) => t.energy ?? 0 },
};

const sortIcon = (dir) => dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : '';

const TrackBrowser = ({
  tracks = [],
  columns: allColumns = DEFAULT_COLUMNS,
  onLoadToDeck,
  selectedIndex = 0,
  theme,
  title,
}) => {
  // Écran étroit : seulement titre + BPM + clé (les colonnes fixes débordaient sur mobile)
  const isNarrow = useMobileDetection(560);
  const columns = isNarrow ? allColumns.filter((c) => ['title', 'bpm', 'key'].includes(c)) : allColumns;
  const { language } = useContext(LanguageContext);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState(null); // null | 'asc' | 'desc'

  const handleHeaderClick = (col) => {
    if (sortBy !== col) { setSortBy(col); setSortDir('asc'); return; }
    if (sortDir === 'asc')  { setSortDir('desc'); return; }
    if (sortDir === 'desc') { setSortBy(null); setSortDir(null); return; }
    setSortDir('asc');
  };

  const displayedTracks = useMemo(() => {
    if (!sortBy || !sortDir) return tracks;
    const meta = COLUMN_META[sortBy];
    if (!meta) return tracks;
    const copy = [...tracks];
    copy.sort((a, b) => {
      const ka = meta.sortKey(a);
      const kb = meta.sortKey(b);
      if (ka < kb) return sortDir === 'asc' ? -1 : 1;
      if (ka > kb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [tracks, sortBy, sortDir]);

  // Auto-scroll to selected index (only meaningful when no sort)
  useEffect(() => {
    // on ne fait défiler QUE la liste (scrollIntoView faisait aussi défiler toute la page)
    const el = document.getElementById(`track-item-${selectedIndex}`);
    const list = el?.closest('.track-list');
    if (!el || !list) return;
    const top = el.offsetTop - list.offsetTop;
    if (top < list.scrollTop) list.scrollTo({ top, behavior: 'smooth' });
    else if (top + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTo({ top: top + el.offsetHeight - list.clientHeight, behavior: 'smooth' });
  }, [selectedIndex]);

  const headerLabel = (col) => {
    const m = COLUMN_META[col];
    if (!m) return col;
    return language === 'fr' ? m.labelFr : m.labelEn;
  };

  const browserTitle = title || (language === 'fr' ? 'BIBLIOTHÈQUE PATRICK' : 'PATRICK RECORD BOX');

  return (
    <div className="track-browser-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="track-browser-window" style={{
        background: theme?.panelBg || '#fff',
        borderRadius: '30px',
        border: '6px solid #333',
        boxShadow: '15px 15px 0 rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden'
      }}>
        <div className="track-browser-header" style={{
          padding: '16px 20px 10px',
          borderBottom: '4px solid #eee',
          display: 'flex', flexDirection: 'column', gap: '8px',
          background: theme?.bg || '#fafafa',
        }}>
          <h2 style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '1px', color: theme?.text || '#333' }}>
            {browserTitle}
          </h2>
          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', fontSize: '0.7rem', fontWeight: 900, color: theme?.text || '#333', opacity: 0.65, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {!isNarrow && <div style={{ flex: '0 0 52px' }} />} {/* thumb spacer */}
            {columns.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => handleHeaderClick(col)}
                style={{
                  flex: COLUMN_META[col]?.flex || '0 0 auto',
                  textAlign: COLUMN_META[col]?.align || 'left',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'inherit', fontWeight: 900, letterSpacing: '1px',
                  textTransform: 'uppercase', fontSize: '0.7rem', padding: 0,
                  opacity: sortBy === col ? 1 : 0.7,
                }}
              >
                {headerLabel(col)} {sortBy === col && <span style={{ fontSize: '0.7rem' }}>{sortIcon(sortDir)}</span>}
              </button>
            ))}
            <div style={{ flex: '0 0 158px', textAlign: 'right' }} /> {/* load buttons spacer */}
          </div>
        </div>

        <div className="track-list" style={{ padding: '12px 16px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayedTracks.map((track, idx) => {
            const musical = track.key ? camelotToMusical(track.key) : '';
            const camelot = track.key ? String(track.key).toUpperCase() : '';
            return (
              <div
                key={track.url || idx}
                id={`track-item-${idx}`}
                className="track-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px',
                  border: idx === selectedIndex ? '3px solid #00d2ff' : '3px solid #eee',
                  borderRadius: '14px',
                  background: idx === selectedIndex ? 'rgba(0, 210, 255, 0.06)' : 'transparent',
                  transition: 'border-color 0.2s, background 0.2s',
                  boxShadow: idx === selectedIndex ? '0 0 0 2px rgba(0,210,255,0.3)' : 'none',
                }}
              >
                <div style={{
                  display: isNarrow ? 'none' : 'flex',
                  flex: '0 0 44px', width: '44px', height: '44px', background: '#333',
                  borderRadius: '10px', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '1.1rem',
                }}>
                  <Glyph name="vinyl" size="30px" />
                </div>
                {columns.map((col) => {
                  const meta = COLUMN_META[col];
                  const style = { flex: meta?.flex || '0 0 auto', textAlign: meta?.align || 'left', fontSize: '0.85rem', color: theme?.text || '#333', fontWeight: 700 };
                  if (col === 'title')  return <div key={col} style={{ ...style, minWidth: 0, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title || 'Untitled'}</div>;
                  if (col === 'bpm')    return <div key={col} style={style}>{track.bpm ?? '—'}</div>;
                  if (col === 'key')    return (
                    <div key={col} style={{ ...style, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: '10px',
                        background: '#8E44AD', color: '#fff', fontWeight: 900, fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                      }}>{musical || '?'}</span>
                    </div>
                  );
                  if (col === 'camelot') return (
                    <div key={col} style={{ ...style, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: '10px',
                        background: '#fff', color: '#8E44AD', border: '2px solid #8E44AD',
                        fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.5px',
                      }}>{camelot || '?'}</span>
                    </div>
                  );
                  if (col === 'genre')  return <div key={col} style={{ ...style, fontSize: '0.7rem', opacity: 0.7 }}>{track.genre || '—'}</div>;
                  if (col === 'energy') return <div key={col} style={{ ...style, textAlign: 'center' }}>{track.energy ? <span aria-label={`${track.energy}/5`}>{Array.from({ length: track.energy }, (_, i) => <Glyph key={i} name="bolt" size="1em" />)}</span> : '—'}</div>;
                  return <div key={col} style={style} />;
                })}
                <div style={{ flex: isNarrow ? '0 0 auto' : '0 0 158px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onLoadToDeck && onLoadToDeck('A', track)}
                    aria-label="Deck A"
                    style={{ background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #333', padding: '6px 10px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}
                  >{isNarrow ? 'A' : 'DECK A'}</button>
                  <button
                    onClick={() => onLoadToDeck && onLoadToDeck('B', track)}
                    aria-label="Deck B"
                    style={{ background: '#5DADE2', color: '#2b2b2b', border: '3px solid #333', padding: '6px 10px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}
                  >{isNarrow ? 'B' : 'DECK B'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackBrowser;
