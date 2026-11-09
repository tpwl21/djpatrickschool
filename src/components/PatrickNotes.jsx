import React, { useContext, useState } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import { FEEDBACK_EMAIL, DISCORD_URL } from '../constants/community';
import Glyph from './Glyph';

// Carnet de bêta-test : les notes restent dans le navigateur du testeur (pas de serveur),
// avec le contexte joint automatiquement, jusqu'à l'envoi par mail pré-rempli ou copier-coller (Discord).
const STORAGE_KEY = 'djPatrickNotes';
const CATEGORIES = ['lessons', 'gameplay', 'visuals', 'sound', 'other'];
// shortcut: un mailto trop long est tronqué par certains clients ; au-delà on invite à utiliser « Copier »
const MAILTO_MAX = 1800;

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const save = (notes) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { /* stockage bloqué : notes de la session seulement */ }
};

const context = () => ({
  page: window.location.hash || '#/',
  tier: document.documentElement.dataset.theme || '',
  screen: `${window.innerWidth}×${window.innerHeight}`,
  device: navigator.userAgent,
  date: new Date().toISOString().slice(0, 16).replace('T', ' '),
});

export default function PatrickNotes({ compact = false }) {
  const { t } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(load);
  const [text, setText] = useState('');
  const [cat, setCat] = useState('gameplay');
  const [copied, setCopied] = useState(false);

  const update = (next) => { setNotes(next); save(next); };
  const add = () => {
    if (!text.trim()) return;
    update([...notes, { id: Date.now(), cat, text: text.trim(), ...context() }]);
    setText('');
  };

  const asText = () => notes.map((n, i) =>
    `#${i + 1} [${t(`notes.cat.${n.cat}`)}] ${n.text}\n   ${n.page} · ${n.tier} · ${n.screen} · ${n.date}\n   ${n.device}`
  ).join('\n\n');

  const copy = async () => {
    try { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* presse-papiers refusé */ }
  };
  const body = asText();
  const mailHref = FEEDBACK_EMAIL
    ? `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(t('notes.mailSubject'))}&body=${encodeURIComponent(body.length > MAILTO_MAX ? `${body.slice(0, MAILTO_MAX)}\n\n${t('notes.truncated')}` : body)}`
    : null;

  return (
    <>
      <button type="button" className={`btn-crayon nudge-btn notes-open ${compact ? 'compact' : ''}`} onClick={() => setOpen(true)} aria-label={t('notes.open')} title={t('notes.open')}>
        <Glyph name="pencil" size="1.1em" />
        {!compact && <span>{t('notes.button')}</span>}
        {notes.length > 0 && <span className="notes-count">{notes.length}</span>}
      </button>

      {open && (
        <div className="notes-backdrop" onClick={() => setOpen(false)}>
          <div className="notes-panel" role="dialog" aria-modal="true" aria-label={t('notes.title')} onClick={(e) => e.stopPropagation()}>
            <div className="notes-head">
              <h2>{t('notes.title')}</h2>
              <button type="button" className="notes-close" onClick={() => setOpen(false)} aria-label={t('notes.close')}>×</button>
            </div>
            <p className="notes-intro">{t('notes.intro')}</p>

            <div className="notes-cats" role="group">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className={`notes-cat ${cat === c ? 'active' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {t(`notes.cat.${c}`)}
                </button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('notes.placeholder')} rows={3} />
            <button type="button" className="btn-crayon play-btn notes-add" onClick={add} disabled={!text.trim()}>{t('notes.add')}</button>

            {notes.length > 0 && (
              <ul className="notes-list">
                {notes.map((n) => (
                  <li key={n.id}>
                    <span className="notes-tag">{t(`notes.cat.${n.cat}`)}</span>
                    <span className="notes-text">{n.text}</span>
                    <span className="notes-where">{n.page}</span>
                    <button type="button" className="notes-del" onClick={() => update(notes.filter((x) => x.id !== n.id))} aria-label={t('notes.delete')}>×</button>
                  </li>
                ))}
              </ul>
            )}

            <div className="notes-send">
              {mailHref && notes.length > 0 && <a className="btn-crayon play-btn" href={mailHref}>{t('notes.mail')}</a>}
              <button type="button" className="btn-crayon nudge-btn" onClick={copy} disabled={!notes.length}>{copied ? t('notes.copied') : t('notes.copy')}</button>
              {DISCORD_URL && <a className="btn-crayon nudge-btn" href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>}
              {notes.length > 0 && (
                <button type="button" className="notes-clear" onClick={() => { if (window.confirm(t('notes.clearConfirm'))) update([]); }}>{t('notes.clear')}</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .notes-open { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; position: relative; }
        .notes-open.compact { padding: 8px 10px; }
        .notes-count { position: absolute; top: -8px; right: -8px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px; background: #c0392b; color: #fff; font-size: 0.7rem; display: grid; place-items: center; }
        .notes-backdrop { position: fixed; inset: 0; z-index: 6000; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 12px; }
        .notes-panel {
          width: min(560px, 100%); max-height: 100%; overflow-y: auto;
          background: #fff; color: #2b2b2b; border: 4px solid #333; border-radius: 24px;
          box-shadow: 8px 8px 0 rgba(0,0,0,0.3); padding: 18px 20px; text-align: left;
          user-select: text; -webkit-user-select: text;
        }
        .notes-head { display: flex; align-items: center; justify-content: space-between; }
        .notes-head h2 { margin: 0; font-size: 1.5rem; }
        .notes-close { width: 44px; height: 44px; border: none; background: none; font-size: 1.8rem; cursor: pointer; color: #555; }
        .notes-intro { margin: 4px 0 12px; color: #555; font-size: 0.95rem; }
        .notes-cats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .notes-cat { border: 2px solid #333; background: #fff; color: #2b2b2b; border-radius: 999px; padding: 6px 12px; font: inherit; font-weight: 900; font-size: 0.85rem; cursor: pointer; min-height: 36px; }
        .notes-cat.active { background: #ffeaa7; }
        .notes-panel textarea { width: 100%; font: inherit; font-size: 1rem; border: 3px solid #333; border-radius: 14px; padding: 10px; resize: vertical; color: #2b2b2b; background: #fffdf7; }
        .notes-add { margin-top: 8px; }
        .notes-list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .notes-list li { display: grid; grid-template-columns: auto 1fr auto; gap: 2px 8px; align-items: start; padding: 8px 10px; border: 2px dashed #bbb; border-radius: 12px; }
        .notes-tag { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; background: #333; color: #fff; border-radius: 6px; padding: 2px 6px; }
        .notes-text { white-space: pre-wrap; }
        .notes-where { grid-column: 2; font-size: 0.75rem; color: #777; }
        .notes-del { grid-row: 1 / span 2; grid-column: 3; width: 36px; height: 36px; border: none; background: none; font-size: 1.4rem; cursor: pointer; color: #888; }
        .notes-send { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 16px; }
        .notes-send a.btn-crayon { text-decoration: none; }
        .notes-clear { margin-left: auto; border: none; background: none; color: #c0392b; font: inherit; font-weight: 900; text-decoration: underline; cursor: pointer; min-height: 44px; }
      `}</style>
    </>
  );
}
