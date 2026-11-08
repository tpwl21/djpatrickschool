import React, { useEffect, useRef, useState } from 'react';
import {
  listMappings,
  detectMappingId,
  LOGICAL_CONTROLS,
  setSmartBinding,
  clearSmartBinding,
  clearAllSmartBindings,
} from '../constants/midiMappings';
import { useMidiMapping } from '../hooks/useMidiMapping';
import Glyph from './Glyph';

// Minimal MIDI config UI: lists detected input devices, lets the user pick a
// mapping preset. When the active preset is 'smart', a learning table appears —
// click Learn next to a control, then touch the matching pad/knob on the
// controller. The next incoming event is captured and stored.
export default function MidiSelector() {
  const { mappingId, setMappingId, mapping } = useMidiMapping();
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [learning, setLearning] = useState(null); // name of control being learned
  const accessRef = useRef(null);
  const learningRef = useRef(null);

  useEffect(() => { learningRef.current = learning; }, [learning]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setError('Web MIDI non supporté dans ce navigateur.');
      return;
    }

    const refreshDevices = (a) => {
      setDevices(Array.from(a.inputs.values()).map((i) => ({ id: i.id, name: i.name, manufacturer: i.manufacturer })));
    };

    const handleMessage = (msg) => {
      const target = learningRef.current;
      if (!target) return;
      const [status, note, velocity] = msg.data;
      const type = status & 0xF0;
      const channel = (status & 0x0F) + 1;
      // For note events, only capture on note-on with a real velocity so we
      // don't grab the key-up ghost. CC captures on first movement.
      if (type === 0x90 && velocity === 0) return;
      if (type !== 0x90 && type !== 0xB0) return;
      const spec = {
        type: type === 0xB0 ? 'cc' : 'note',
        note,
        channel,
      };
      setSmartBinding(target, spec);
      setLearning(null);
    };

    const attach = (a) => {
      a.inputs.forEach((input) => { input.onmidimessage = handleMessage; });
    };

    navigator.requestMIDIAccess().then((a) => {
      accessRef.current = a;
      refreshDevices(a);
      attach(a);
      a.onstatechange = () => {
        refreshDevices(a);
        attach(a);
      };
    }).catch((e) => setError(e.message));

    return () => {
      const a = accessRef.current;
      if (a) {
        a.onstatechange = null;
        a.inputs.forEach((input) => { input.onmidimessage = null; });
      }
    };
  }, []);

  const autoDetect = () => {
    const first = devices[0];
    if (!first) return;
    setMappingId(detectMappingId(first.name));
  };

  const isSmart = mappingId === 'smart';
  const boundControls = mapping.controls || {};

  const fmtSpec = (spec) => {
    if (!spec) return '—';
    const num = `0x${spec.note.toString(16).padStart(2, '0').toUpperCase()}`;
    return `${spec.type.toUpperCase()} ${num} ch${spec.channel}`;
  };

  const grouped = LOGICAL_CONTROLS.reduce((acc, c) => {
    (acc[c.group] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="midi-selector">
      <h3>MIDI</h3>

      {error && <p className="midi-err"><Glyph name="warning" /> {error}</p>}

      <div className="midi-devices">
        <div className="midi-label">Contrôleurs détectés</div>
        {devices.length === 0 ? (
          <div className="midi-none">Aucun contrôleur MIDI branché.</div>
        ) : (
          <ul>
            {devices.map((d) => (
              <li key={d.id}>{d.name}{d.manufacturer ? ` — ${d.manufacturer}` : ''}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="midi-preset">
        <label className="midi-label" htmlFor="midi-preset-select">Mapping actif</label>
        <select id="midi-preset-select" value={mappingId} onChange={(e) => setMappingId(e.target.value)}>
          {listMappings().map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <button type="button" className="midi-auto" onClick={autoDetect} disabled={devices.length === 0}>
          Auto-détecter
        </button>
      </div>

      {isSmart && (
        <div className="midi-learn">
          <div className="midi-learn-head">
            <div className="midi-label" style={{ marginBottom: 0 }}>Apprentissage des contrôles</div>
            <button type="button" className="midi-clear" onClick={clearAllSmartBindings}>
              Tout effacer
            </button>
          </div>
          <p className="midi-learn-hint">
            Clique sur <em>Learn</em> puis bouge le potard ou appuie sur le bouton correspondant de ton contrôleur. Le prochain événement est capturé.
          </p>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="midi-learn-group">
              <div className="midi-learn-group-title">{group}</div>
              <div className="midi-learn-rows">
                {items.map((c) => {
                  const spec = boundControls[c.name];
                  const isLearning = learning === c.name;
                  return (
                    <div key={c.name} className={`midi-learn-row ${isLearning ? 'learning' : ''}`}>
                      <span className="midi-learn-name">{c.label}</span>
                      <span className="midi-learn-spec">
                        {isLearning ? 'En attente…' : fmtSpec(spec)}
                      </span>
                      <button
                        type="button"
                        className="midi-learn-btn"
                        onClick={() => setLearning(isLearning ? null : c.name)}
                      >
                        {isLearning ? 'Annuler' : 'Learn'}
                      </button>
                      {spec && (
                        <button
                          type="button"
                          className="midi-learn-btn midi-learn-btn-remove"
                          onClick={() => clearSmartBinding(c.name)}
                          aria-label="Oublier"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSmart && (
        <p className="midi-note">
          Le mapping DDJ-SR couvre aussi les autres DDJ Pioneer. Pour un autre contrôleur, passe en mode <strong>Smart</strong> et apprends les contrôles un par un.
        </p>
      )}

      <style>{`
        .midi-selector {
          border: 2px dashed var(--border, #ccc);
          border-radius: 16px;
          padding: 16px 20px;
          background: var(--surface-elevated, #fafafa);
          color: var(--text, #333);
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .midi-selector h3 {
          margin: 0;
          font-size: 0.8rem;
          letter-spacing: 2px;
          color: var(--text-muted, #888);
        }
        .midi-label {
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted, #888);
          margin-bottom: 4px;
          display: block;
        }
        .midi-devices ul { margin: 0; padding-left: 18px; }
        .midi-devices li { font-family: monospace; font-size: 0.85rem; }
        .midi-none { font-style: italic; opacity: 0.7; }
        .midi-preset { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .midi-preset select {
          font-family: inherit;
          font-size: 0.9rem;
          padding: 6px 10px;
          border: 2px solid var(--border, #333);
          border-radius: 8px;
          background: #fff;
          color: #333;
        }
        .midi-auto, .midi-clear {
          font-family: inherit;
          font-weight: 900;
          padding: 6px 12px;
          border: 2px solid var(--border, #333);
          border-radius: 8px;
          background: #fff;
          color: #333;
          cursor: pointer;
        }
        .midi-auto:disabled { opacity: 0.4; cursor: not-allowed; }
        .midi-note { font-size: 0.75rem; opacity: 0.7; margin: 0; line-height: 1.4; }
        .midi-err { color: #c0392b; font-size: 0.85rem; margin: 0; }

        .midi-learn { display: flex; flex-direction: column; gap: 10px; }
        .midi-learn-head { display: flex; justify-content: space-between; align-items: center; }
        .midi-learn-hint { font-size: 0.78rem; opacity: 0.75; margin: 0; line-height: 1.4; }
        .midi-learn-group-title {
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted, #888);
          margin-top: 6px;
          margin-bottom: 4px;
        }
        .midi-learn-rows { display: flex; flex-direction: column; gap: 4px; }
        .midi-learn-row {
          display: grid;
          grid-template-columns: 1fr 140px auto auto;
          gap: 8px;
          align-items: center;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(0,0,0,0.04);
          font-size: 0.82rem;
        }
        .midi-learn-row.learning {
          background: rgba(212,175,55,0.2);
          outline: 2px dashed rgba(212,175,55,0.7);
        }
        .midi-learn-name { font-weight: 700; }
        .midi-learn-spec {
          font-family: monospace;
          font-size: 0.78rem;
          opacity: 0.85;
          text-align: right;
        }
        .midi-learn-btn {
          font-family: inherit;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 4px 10px;
          border: 2px solid var(--border, #333);
          border-radius: 6px;
          background: #fff;
          color: #333;
          cursor: pointer;
        }
        .midi-learn-btn-remove {
          padding: 2px 8px;
          border-color: #c0392b;
          color: #c0392b;
        }
      `}</style>
    </div>
  );
}
