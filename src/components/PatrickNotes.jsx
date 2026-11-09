import React, { useContext, useState } from 'react';
import { LanguageContext } from '../hooks/LanguageContext';
import { FEEDBACK_EMAIL, DISCORD_URL } from '../constants/community';
import { workshopsList, getWorkshop } from '../lib/levels/load';
import { t as pickText } from '../lib/levels/schema';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';
import { TIERS } from '../lib/progression';
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

// Sujet d'une note, pré-rempli d'après la page ouverte (tout reste modifiable ou vide) :
// ws = atelier ou 'booth', item = 'lesson:N' | 'level:N', tier = EASY | MEDIUM | PRO
const subjectFromHash = () => {
  const parts = (window.location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'booth') return { ws: 'booth', item: '', tier: '' };
  if (parts[0] === 'workshop') return { ws: parts[1] || '', item: '', tier: '' };
  if (!getWorkshop(parts[0])) return { ws: '', item: '', tier: '' };
  const isLesson = parts[1] === 'lesson';
  const n = parseInt(isLesson ? parts[2] : parts[1], 10);
  const tier = (isLesson ? parts[3] : parts[2]) || (Number.isNaN(n) ? '' : 'EASY');
  return { ws: parts[0], item: Number.isNaN(n) ? '' : `${isLesson ? 'lesson' : 'level'}:${n}`, tier: TIERS.includes(tier) ? tier : '' };
};

// Appareil lisible (« iPhone · Safari 18 ») ; l'UA complet reste dans le pied de mail pour le tri
const deviceLabel = () => {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '?';
  const b = ua.match(/(Edg|Firefox|Chrome|CriOS|FxiOS)\/(\d+)/) || ua.match(/Version\/(\d+).*(Safari)/);
  const browser = !b ? '?' : b[2] === 'Safari' ? `Safari ${b[1]}` : `${{ Edg: 'Edge', CriOS: 'Chrome', FxiOS: 'Firefox' }[b[1]] || b[1]} ${b[2]}`;
  return `${os} · ${browser}`;
};
const VERSION = import.meta.env.VITE_APP_VERSION || 'dev';
// « clé : valeur » alignées sur la clé la plus longue
const techLines = (pairs) => {
  const w = Math.max(...pairs.map(([k]) => k.length));
  return pairs.map(([k, v]) => `  ${k.padEnd(w)} : ${v}`);
};

export default function PatrickNotes({ compact = false }) {
  const { t, language } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(load);
  const [text, setText] = useState('');
  const [cat, setCat] = useState('gameplay');
  const [subject, setSubject] = useState(subjectFromHash);
  const [copied, setCopied] = useState(false);

  const update = (next) => { setNotes(next); save(next); };
  const add = () => {
    if (!text.trim()) return;
    update([...notes, { id: Date.now(), cat, ...subject, text: text.trim(), date: new Date().toISOString() }]);
    setText('');
  };

  const subjectLabel = (n) => {
    if (!n.ws) return '—';
    if (n.ws === 'booth') return 'Secret Booth';
    const ws = getWorkshop(n.ws);
    const wsName = ws ? pickText(ws.meta, language)?.title : n.ws;
    if (!n.item) return wsName;
    const [kind, num] = n.item.split(':');
    return `${wsName} > ${t(kind === 'lesson' ? 'notes.lesson' : 'notes.level')} ${num}`;
  };
  const tierLabel = (n) => (n.tier ? DIFFICULTY_SETTINGS[n.tier].name : '—');

  // Format du mail (v1) : lisible et facile à parser.
  //   [n] Catégorie | Atelier > Leçon/Niveau N | Palier   puis le texte indenté de 4 espaces ;
  //   le contexte technique une seule fois, en pied, entre deux lignes de tirets ; dernière ligne = marqueur de format.
  const asText = () => {
    const rule = '-'.repeat(33);
    const items = notes.map((n, i) => {
      const head = `[${i + 1}] ${t(`notes.cat.${n.cat}`)} | ${subjectLabel(n)} | ${tierLabel(n)}`;
      return `${head}\n${n.text.split('\n').map((l) => `    ${l}`).join('\n')}`;
    });
    return [
      t('notes.mailTitle'),
      '='.repeat(33),
      `${t('notes.count', { n: notes.length })} · ${new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      '',
      items.join('\n\n'),
      '',
      rule,
      t('notes.tech'),
      ...techLines([
        [t('notes.techDevice'), deviceLabel()],
        [t('notes.techScreen'), `${window.innerWidth}×${window.innerHeight}`],
        [t('notes.techLang'), language],
        ['version', VERSION],
        ['ua', navigator.userAgent],
      ]),
      rule,
      '#djps-feedback v1',
    ].join('\n');
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* presse-papiers refusé */ }
  };
  const body = asText();
  const mailHref = FEEDBACK_EMAIL
    ? `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(t('notes.mailSubject'))}&body=${encodeURIComponent(body.length > MAILTO_MAX ? `${body.slice(0, MAILTO_MAX)}\n\n${t('notes.truncated')}` : body)}`
    : null;

  return (
    <>
      <button type="button" className={`btn-crayon nudge-btn notes-open ${compact ? 'compact' : ''}`} onClick={() => { setSubject(subjectFromHash()); setOpen(true); }} aria-label={t('notes.open')} title={t('notes.open')}>
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
            <div className="notes-subject">
              <label>
                <span>{t('notes.about')}</span>
                <select value={subject.ws} onChange={(e) => setSubject({ ws: e.target.value, item: '', tier: '' })}>
                  <option value="">{t('notes.general')}</option>
                  {workshopsList.filter((w) => !w.meta.forthcoming).map((w) => (
                    <option key={w.meta.id} value={w.meta.id}>{pickText(w.meta, language)?.title}</option>
                  ))}
                  <option value="booth">Secret Booth</option>
                </select>
              </label>
              {getWorkshop(subject.ws) && (
                <label>
                  <span>{t('notes.which')}</span>
                  <select value={subject.item} onChange={(e) => setSubject({ ...subject, item: e.target.value })}>
                    <option value="">{t('notes.wholeWorkshop')}</option>
                    {getWorkshop(subject.ws).lessonsList.map((l) => (
                      <option key={`l${l.order}`} value={`lesson:${l.order}`}>{t('notes.lesson')} {l.order} · {pickText(l, language)?.title}</option>
                    ))}
                    {getWorkshop(subject.ws).levelsList.map((l) => (
                      <option key={`p${l.order}`} value={`level:${l.order}`}>{t('notes.level')} {l.order} · {pickText(l, language)?.title}</option>
                    ))}
                  </select>
                </label>
              )}
              {subject.item && (
                <label>
                  <span>{t('notes.tier')}</span>
                  <select value={subject.tier} onChange={(e) => setSubject({ ...subject, tier: e.target.value })}>
                    <option value="">—</option>
                    {TIERS.map((k) => <option key={k} value={k}>{DIFFICULTY_SETTINGS[k].name}</option>)}
                  </select>
                </label>
              )}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('notes.placeholder')} rows={3} />
            <button type="button" className="btn-crayon play-btn notes-add" onClick={add} disabled={!text.trim()}>{t('notes.add')}</button>

            {notes.length > 0 && (
              <ul className="notes-list">
                {notes.map((n) => (
                  <li key={n.id}>
                    <span className="notes-tag">{t(`notes.cat.${n.cat}`)}</span>
                    <span className="notes-text">{n.text}</span>
                    <span className="notes-where">{n.page ?? (n.ws ? [subjectLabel(n), n.tier && tierLabel(n)].filter(Boolean).join(' · ') : t('notes.general'))}</span>
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
        .notes-subject { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .notes-subject label { display: flex; flex-direction: column; gap: 2px; flex: 1 1 140px; min-width: 0; font-size: 0.75rem; font-weight: 900; color: #555; }
        .notes-subject select { font: inherit; font-size: 0.9rem; color: #2b2b2b; background: #fff; border: 2px solid #333; border-radius: 10px; padding: 6px 8px; min-height: 40px; max-width: 100%; }
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
