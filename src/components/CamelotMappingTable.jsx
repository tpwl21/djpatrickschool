import { camelotToMusical } from '../lib/keys';

// 12-row table: one row per wheel position, showing both A (minor) and B (major).
// Mirrors the Camelot/musical mapping the student learns in Practice 3.
const ROWS = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const A = `${n}A`;
  const B = `${n}B`;
  return { n, A, Am: camelotToMusical(A), B, Bm: camelotToMusical(B) };
});

const cellStyle = {
  padding: '6px 10px',
  border: '2px solid #333',
  fontSize: '0.85rem',
  fontWeight: 700,
  textAlign: 'center',
};

const badgeStyle = (bg, fg) => ({
  display: 'inline-block',
  padding: '3px 8px',
  borderRadius: '10px',
  background: bg,
  color: fg,
  border: fg === '#fff' ? 'none' : `2px solid ${fg}`,
  fontWeight: 900,
  fontSize: '0.78rem',
  letterSpacing: '0.5px',
  minWidth: 38,
});

const CamelotMappingTable = () => (
  <div style={{ margin: '18px auto', maxWidth: 560, overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', margin: '0 auto', background: '#fff', borderRadius: 8 }}>
      <thead>
        <tr>
          <th style={{ ...cellStyle, background: '#f5eefc' }}>#</th>
          <th style={{ ...cellStyle, background: '#f5eefc' }}>A (minor)</th>
          <th style={{ ...cellStyle, background: '#fef8ef' }}>B (major)</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.n}>
            <td style={{ ...cellStyle, background: '#fafafa' }}>{row.n}</td>
            <td style={cellStyle}>
              <span style={badgeStyle('#8E44AD', '#fff')}>{row.A}</span>
              <span style={{ margin: '0 6px', opacity: 0.4 }}>=</span>
              <span style={{ fontWeight: 900 }}>{row.Am}</span>
            </td>
            <td style={cellStyle}>
              <span style={badgeStyle('#fff', '#D4A017')}>{row.B}</span>
              <span style={{ margin: '0 6px', opacity: 0.4 }}>=</span>
              <span style={{ fontWeight: 900 }}>{row.Bm}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.65, marginTop: 8 }}>
      Each row = one wheel position. Columns A / B = the relative minor / major.
    </p>
  </div>
);

export default CamelotMappingTable;
