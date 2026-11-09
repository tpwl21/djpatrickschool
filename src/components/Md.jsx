import React from 'react';

// Tokenise a single line for **bold**, *italic* and `code` spans.
const parseInline = (text) => {
  const tokens = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*?\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ t: 'txt', v: text.slice(last, m.index) });
    tokens.push(m[0].startsWith('**')
      ? { t: 'b', v: m[0].slice(2, -2) }
      : m[0].startsWith('*')
        ? { t: 'i', v: m[0].slice(1, -1) }
        : { t: 'c', v: m[0].slice(1, -1) });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ t: 'txt', v: text.slice(last) });
  return tokens;
};

const Inline = ({ text }) =>
  parseInline(text).map((tok, i) => {
    if (tok.t === 'b') return <strong key={i} className="md-b">{tok.v}</strong>;
    if (tok.t === 'c') return <code key={i} className="md-c">{tok.v}</code>;
    if (tok.t === 'i') return <em key={i}>{tok.v}</em>;
    return tok.v;
  });

// Classify a line into a block type.
const lineType = (line) => {
  if (line.trim() === '') return 'empty';
  if (/^#{1,4} /.test(line)) return 'heading';
  if (/^\s*\|.*\|\s*$/.test(line)) return 'table';
  if (/^- /.test(line)) return 'bullet';
  if (/^\d+(?:-\d+)?[.)]\s/.test(line)) return 'numbered';
  if (/^ {2,}\S/.test(line)) return 'formula';
  return 'text';
};

// Parse a markdown string into an array of block descriptors.
// Splits on \n\n first, then scans lines within each chunk so that
// inline list items abutting prose (no blank line between) still group correctly.
const parseBlocks = (src) => {
  const blocks = [];
  let current = null;

  const push = (type, item) => {
    if (!current || current.type !== type) {
      current = { type, items: [] };
      blocks.push(current);
    }
    current.items.push(item);
  };

  for (const chunk of src.split(/\n\n+/)) {
    for (const line of chunk.split('\n')) {
      const t = lineType(line);
      if (t === 'empty') continue;

      if (t === 'heading') {
        // un titre est toujours un bloc à part
        const m = line.match(/^(#{1,4}) +(.*)/);
        blocks.push({ type: 'heading', items: [{ level: m[1].length, text: m[2] }] });
        current = null;
      } else if (t === 'table') {
        // ligne de séparation |---|:--:| ignorée
        if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-')) continue;
        push('table', line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
      } else if (t === 'bullet') {
        push('bullet', line.replace(/^- /, ''));
      } else if (t === 'numbered') {
        const m = line.match(/^(\d+(?:-\d+)?[.)]) +(.*)/);
        push('numbered', { num: m[1], text: m[2] });
      } else if (t === 'formula') {
        push('formula', line.trim());
      } else {
        // text — consecutive text lines within a chunk join with a space
        if (current?.type === 'text') {
          current.items[current.items.length - 1] += ' ' + line;
        } else {
          push('text', line);
        }
      }
    }
    // blank line between chunks breaks text continuity
    if (current?.type === 'text') current = null;
  }

  return blocks;
};

const Md = ({ children, className = '' }) => {
  if (!children) return null;
  const blocks = parseBlocks(String(children));

  return (
    <>
      <div className={`md-content ${className}`}>
        {blocks.map((block, bi) => {
          if (block.type === 'text') {
            return (
              <p key={bi} className="md-para">
                <Inline text={block.items[0]} />
              </p>
            );
          }

          if (block.type === 'heading') {
            const { level, text } = block.items[0];
            return <h3 key={bi} className={`md-h md-h${Math.min(level, 3)}`}><Inline text={text} /></h3>;
          }
          if (block.type === 'table') {
            const [head, ...rows] = block.items;
            return (
              <div key={bi} className="md-table-wrap">
                <table className="md-table">
                  <thead><tr>{head.map((c, ci) => <th key={ci}><Inline text={c} /></th>)}</tr></thead>
                  <tbody>
                    {rows.map((r, ri) => (
                      <tr key={ri}>{r.map((c, ci) => <td key={ci}><Inline text={c} /></td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (block.type === 'bullet') {
            return (
              <ul key={bi} className="md-ul">
                {block.items.map((item, ii) => (
                  <li key={ii} className="md-li md-li-bullet">
                    <span className="md-bullet-dot" aria-hidden />
                    <span><Inline text={item} /></span>
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === 'numbered') {
            return (
              <ol key={bi} className="md-ol">
                {block.items.map((item, ii) => (
                  <li key={ii} className="md-li md-li-numbered">
                    <span className="md-num-badge">{item.num}</span>
                    <span><Inline text={item.text} /></span>
                  </li>
                ))}
              </ol>
            );
          }

          if (block.type === 'formula') {
            return (
              <pre key={bi} className="md-formula">
                {block.items.map((line, ii) => (
                  <React.Fragment key={ii}>
                    <Inline text={line} />
                    {ii < block.items.length - 1 && '\n'}
                  </React.Fragment>
                ))}
              </pre>
            );
          }

          return null;
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
.md-h {
          margin: 1.2em 0 0.4em;
          font-size: 1.3rem;
          font-weight: 900;
          line-height: 1.25;
          color: var(--text, #2b2b2b);
        }
        .md-h3 { font-size: 1.15rem; }
        .md-h:first-child { margin-top: 0; }
        .md-table-wrap { overflow-x: auto; margin: 0.6em 0 1em; }
        .md-table {
          border-collapse: separate;
          border-spacing: 0;
          min-width: 100%;
          font-size: 0.95rem;
          line-height: 1.4;
          border: 3px solid #333;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          color: #2b2b2b;
          font-variant-numeric: tabular-nums;
        }
        .md-table th, .md-table td { padding: 7px 12px; text-align: left; vertical-align: top; }
        .md-table th {
          background: color-mix(in srgb, var(--lesson-color, #5DADE2) 22%, #fff);
          font-weight: 900;
          border-bottom: 2px solid #333;
          white-space: nowrap;
        }
        .md-table tbody tr + tr td { border-top: 1px solid #e3ddd2; }
        .md-content {
          font-size: 1.1rem;
          line-height: 1.75;
          color: var(--text, #444);
        }
        .md-para {
          margin: 0 0 1em 0;
        }
        .md-para:last-child { margin-bottom: 0; }

        /* Bold & inline code */
        .md-b {
          color: var(--lesson-ink, var(--text, #2b2b2b));
          font-weight: 900;
        }
        .md-c {
          background: color-mix(in srgb, var(--text, #333) 10%, transparent);
          border: 1.5px solid color-mix(in srgb, var(--text, #333) 15%, transparent);
          padding: 1px 6px;
          border-radius: 5px;
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 0.88em;
          font-weight: 700;
          color: var(--text, #333);
        }

        /* Shared list reset */
        .md-ul, .md-ol {
          list-style: none;
          margin: 0.2em 0 1em 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .md-ul:last-child, .md-ol:last-child { margin-bottom: 0; }

        .md-li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.6;
        }

        /* Bullet list */
        .md-bullet-dot {
          flex-shrink: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--lesson-color, #5DADE2);
          box-shadow: 2px 2px 0 rgba(0,0,0,0.15);
          margin-top: 7px;
        }

        /* Numbered list */
        .md-num-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 22px;
          padding: 0 6px;
          background: var(--lesson-color, #5DADE2);
          color: #fff;
          font-weight: 900;
          font-size: 0.72rem;
          border-radius: 11px;
          border: 2px solid rgba(0,0,0,0.12);
          box-shadow: 2px 2px 0 rgba(0,0,0,0.12);
          margin-top: 2px;
          letter-spacing: -0.3px;
          white-space: nowrap;
        }

        /* Formula / code block */
        .md-formula {
          margin: 0.6em 0 1em 0;
          padding: 14px 20px;
          background: #1c1c2e;
          color: #c8d8ff;
          border-radius: 14px;
          border: 3px solid var(--lesson-color, #5DADE2);
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 0.95rem;
          line-height: 1.8;
          white-space: pre;
          overflow-x: auto;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.12);
        }
        .md-formula .md-b {
          color: #ffd97d;
        }
        .md-formula .md-c {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
          color: #c8d8ff;
        }
        .md-formula:last-child { margin-bottom: 0; }
      `}} />
    </>
  );
};

// Rendu en ligne seul (gras / italique / code) pour les textes courts : récaps, bulles…
export { Inline as MdInline };
export default Md;
