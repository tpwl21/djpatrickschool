// Centralized MIDI mapping presets.
// Shape: { controls: { <logicalName>: { type: 'note'|'cc', note: 0-127, channel: 1|2 } } }
// Workshops read codes through matchControl() — swap the preset in SecretBooth
// and the workshops rewire themselves.

// Pioneer DDJ family (SR, 400, FLX4, REV1) shares Play/Cue/Pitch/Jog/EQ codes.
// Source: mixxxdj Pioneer-DDJ-FLX4.midi.xml + Mixxx wiki (DDJ family inter-compat).
const pioneerDdjControls = {
  playA:   { type: 'note', note: 0x0B, channel: 1 },
  playB:   { type: 'note', note: 0x0B, channel: 2 },
  cueA:    { type: 'note', note: 0x0C, channel: 1 },
  cueB:    { type: 'note', note: 0x0C, channel: 2 },
  pitchA:  { type: 'cc',   note: 0x00, channel: 1 },
  pitchB:  { type: 'cc',   note: 0x00, channel: 2 },
  jogA:    { type: 'cc',   note: 0x22, channel: 1 },
  jogB:    { type: 'cc',   note: 0x22, channel: 2 },
  eqLowA:  { type: 'cc',   note: 0x0F, channel: 1 },
  eqLowB:  { type: 'cc',   note: 0x0F, channel: 2 },
  eqMidA:  { type: 'cc',   note: 0x0B, channel: 1 },
  eqMidB:  { type: 'cc',   note: 0x0B, channel: 2 },
  eqHighA: { type: 'cc',   note: 0x07, channel: 1 },
  eqHighB: { type: 'cc',   note: 0x07, channel: 2 },
  volA:    { type: 'cc',   note: 0x09, channel: 1 },
  volB:    { type: 'cc',   note: 0x09, channel: 2 },
  crossfader: { type: 'cc', note: 0x1F, channel: 1 },
};

export const SMART_STORAGE_KEY = 'dj_teacher_smart_mapping';

// Controls the smart-mode UI exposes for learning, in display order.
export const LOGICAL_CONTROLS = [
  { name: 'playA',      group: 'Transport', label: 'Play Deck A',    type: 'note' },
  { name: 'playB',      group: 'Transport', label: 'Play Deck B',    type: 'note' },
  { name: 'cueA',       group: 'Transport', label: 'Cue Deck A',     type: 'note' },
  { name: 'cueB',       group: 'Transport', label: 'Cue Deck B',     type: 'note' },
  { name: 'pitchA',     group: 'Pitch',     label: 'Pitch Deck A',   type: 'cc'   },
  { name: 'pitchB',     group: 'Pitch',     label: 'Pitch Deck B',   type: 'cc'   },
  { name: 'jogA',       group: 'Pitch',     label: 'Jog Deck A',     type: 'cc'   },
  { name: 'jogB',       group: 'Pitch',     label: 'Jog Deck B',     type: 'cc'   },
  { name: 'eqLowA',     group: 'EQ',        label: 'EQ Low A',       type: 'cc'   },
  { name: 'eqMidA',     group: 'EQ',        label: 'EQ Mid A',       type: 'cc'   },
  { name: 'eqHighA',    group: 'EQ',        label: 'EQ High A',      type: 'cc'   },
  { name: 'eqLowB',     group: 'EQ',        label: 'EQ Low B',       type: 'cc'   },
  { name: 'eqMidB',     group: 'EQ',        label: 'EQ Mid B',       type: 'cc'   },
  { name: 'eqHighB',    group: 'EQ',        label: 'EQ High B',      type: 'cc'   },
  { name: 'volA',       group: 'Mixer',     label: 'Volume A',       type: 'cc'   },
  { name: 'volB',       group: 'Mixer',     label: 'Volume B',       type: 'cc'   },
  { name: 'crossfader', group: 'Mixer',     label: 'Crossfader',     type: 'cc'   },
];

function readSmartControls() {
  try {
    return JSON.parse(localStorage.getItem(SMART_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export const MIDI_MAPPINGS = {
  'ddj-sr': {
    id: 'ddj-sr',
    label: 'Pioneer DDJ-SR (default)',
    vendorHints: ['DDJ-SR'],
    controls: pioneerDdjControls,
  },
  'smart': {
    id: 'smart',
    label: 'Smart (auto-learn)',
    vendorHints: [],
    // Controls are rebuilt from localStorage in getMapping — see below.
    controls: {},
  },
};

export const DEFAULT_MAPPING_ID = 'ddj-sr';

export function listMappings() {
  return Object.values(MIDI_MAPPINGS);
}

export function getMapping(id) {
  const base = MIDI_MAPPINGS[id] ?? MIDI_MAPPINGS[DEFAULT_MAPPING_ID];
  if (base.id === 'smart') {
    return { ...base, controls: readSmartControls() };
  }
  return base;
}

export function setSmartBinding(controlName, spec) {
  const current = readSmartControls();
  const next = { ...current, [controlName]: spec };
  try { localStorage.setItem(SMART_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  window.dispatchEvent(new StorageEvent('storage', { key: SMART_STORAGE_KEY, newValue: JSON.stringify(next) }));
}

export function clearSmartBinding(controlName) {
  const current = readSmartControls();
  if (!(controlName in current)) return;
  const next = { ...current };
  delete next[controlName];
  try { localStorage.setItem(SMART_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  window.dispatchEvent(new StorageEvent('storage', { key: SMART_STORAGE_KEY, newValue: JSON.stringify(next) }));
}

export function clearAllSmartBindings() {
  try { localStorage.removeItem(SMART_STORAGE_KEY); } catch { /* ignore */ }
  window.dispatchEvent(new StorageEvent('storage', { key: SMART_STORAGE_KEY, newValue: '{}' }));
}

// Given an incoming MIDI message, return the logical control name
// declared in the active mapping that matches, or null if none.
// status: full byte (e.g. 0x90 / 0xB0 | channel-1).
export function matchControl(mapping, status, note, channel) {
  const type = status & 0xF0;
  const wantType = type === 0xB0 ? 'cc' : (type === 0x90 || type === 0x80) ? 'note' : null;
  if (!wantType || !mapping?.controls) return null;
  for (const [name, spec] of Object.entries(mapping.controls)) {
    if (spec.type === wantType && spec.note === note && spec.channel === channel) {
      return name;
    }
  }
  return null;
}

// Best-effort auto-detection from a MIDI device name.
export function detectMappingId(deviceName) {
  if (!deviceName) return DEFAULT_MAPPING_ID;
  const name = deviceName.toUpperCase();
  for (const m of listMappings()) {
    if (m.vendorHints.some((h) => name.includes(h.toUpperCase()))) return m.id;
  }
  return DEFAULT_MAPPING_ID;
}
