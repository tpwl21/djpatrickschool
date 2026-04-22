export function applyDefaults(levelValidation = {}, workshopDefaults = {}, difficulty = 'EASY') {
  const diffKey = difficulty.toLowerCase();
  const base = workshopDefaults[diffKey] || {};
  const override = levelValidation[diffKey] || {};
  return { ...base, ...override };
}

export function matchesStartRule(actualPositionA, bpmA, rule = {}) {
  const secPerBeat = 60 / bpmA;
  const beats = actualPositionA / secPerBeat;

  const {
    beat_multiple = 1,
    beat_offset = 0,
    target_beats = [],
    period = 0,
    target_in_period = null,
    tolerance_factor = null,
    tolerance_sec = 1.0,
  } = rule;

  const tolerance = tolerance_factor != null
    ? secPerBeat * tolerance_factor
    : tolerance_sec;

  let diff;

  if (period > 0 && target_in_period != null) {
    const cycleSec = period * secPerBeat;
    const targetSec = target_in_period * secPerBeat;
    diff = (actualPositionA % cycleSec) - targetSec;
  } else if (target_beats && target_beats.length > 0) {
    diff = target_beats
      .map((tb) => actualPositionA - tb * secPerBeat)
      .reduce((best, d) => (Math.abs(d) < Math.abs(best) ? d : best), Infinity);
  } else {
    const m = beat_multiple || 1;
    const o = beat_offset || 0;
    const nearest = Math.round((beats - o) / m) * m + o;
    diff = actualPositionA - nearest * secPerBeat;
  }

  if (Math.abs(diff) <= tolerance) return { status: 'ok', diff };
  return { status: diff < 0 ? 'early' : 'late', diff };
}

export function readEqState(eqState, param) {
  if (!eqState) return 0;
  if (param === 'crossfader') return eqState.crossfader;
  if (param === 'volA') return eqState.volA;
  if (param === 'volB') return eqState.volB;
  if (param === 'volA_eff') return eqState.volA * (1 - eqState.crossfader);
  if (param === 'volB_eff') return eqState.volB * eqState.crossfader;
  if (param === 'filterA') return eqState.filterA ?? 0;
  if (param === 'filterB') return eqState.filterB ?? 0;
  if (param === 'trimA') return eqState.trimA ?? 1;
  if (param === 'trimB') return eqState.trimB ?? 1;
  if (param === 'trimA_peak') return eqState.trimA_peak ?? 0;
  if (param === 'trimB_peak') return eqState.trimB_peak ?? 0;
  if (param === 'delayA_mix') return eqState.delayA?.mix ?? 0;
  if (param === 'delayB_mix') return eqState.delayB?.mix ?? 0;
  if (param === 'delayA_timeBeats') return eqState.delayA?.timeBeats ?? 0;
  if (param === 'delayB_timeBeats') return eqState.delayB?.timeBeats ?? 0;
  if (param === 'reverbA_wet') return eqState.reverbA ?? 0;
  if (param === 'reverbB_wet') return eqState.reverbB ?? 0;
  if (param === 'loopRollA_size') return eqState.loopRollA?.size ?? 0;
  if (param === 'loopRollB_size') return eqState.loopRollB?.size ?? 0;
  if (param === 'loopRollA_active') return eqState.loopRollA?.active ? 1 : 0;
  if (param === 'loopRollB_active') return eqState.loopRollB?.active ? 1 : 0;
  const [deck, band] = param.split('.');
  return eqState[deck]?.[band] ?? 0;
}

const UNIT_CONTROLS = new Set([
  'volA', 'volB', 'volA_eff', 'volB_eff', 'crossfader',
  'filterA', 'filterB',
  'trimA_peak', 'trimB_peak',
  'delayA_mix', 'delayB_mix',
  'reverbA_wet', 'reverbB_wet',
  'loopRollA_active', 'loopRollB_active',
]);

function defaultTolerance(control) {
  return UNIT_CONTROLS.has(control) ? 0.15 : 5;
}

function stepKey(check) {
  return (check.phrase ?? 0) + (check.progress ?? 0);
}

export function resolveActiveChecks(checks, phraseIdx, progress = 0) {
  if (!checks || checks.length === 0) return [];
  const now = phraseIdx + Math.max(0, Math.min(1, progress));
  const latestByControl = new Map();
  for (const c of checks) {
    if (stepKey(c) > now) continue;
    const existing = latestByControl.get(c.control);
    if (!existing || stepKey(c) > stepKey(existing)) {
      latestByControl.set(c.control, c);
    }
  }
  return Array.from(latestByControl.values());
}

export function checkControl(eqState, check) {
  const actual = readEqState(eqState, check.control);
  if (Array.isArray(check.range) && check.range.length === 2) {
    const [lo, hi] = check.range;
    return { ok: actual >= lo && actual <= hi, actual, want: check.range };
  }
  const tol = check.tolerance ?? defaultTolerance(check.control);
  return { ok: Math.abs(actual - check.value) <= tol, actual, want: check.value };
}
