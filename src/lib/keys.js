// Key notation utilities. Canonical storage format: Camelot ("4A", "11B", ...).
// Musical notation uses ♭ and ♯ for half-steps. Suffix "m" = minor.

const CAMELOT_TO_MUSICAL = {
  '1A': 'A♭m', '1B': 'B',
  '2A': 'E♭m', '2B': 'F♯',
  '3A': 'B♭m', '3B': 'D♭',
  '4A': 'Fm',  '4B': 'A♭',
  '5A': 'Cm',  '5B': 'E♭',
  '6A': 'Gm',  '6B': 'B♭',
  '7A': 'Dm',  '7B': 'F',
  '8A': 'Am',  '8B': 'C',
  '9A': 'Em',  '9B': 'G',
  '10A': 'Bm', '10B': 'D',
  '11A': 'F♯m', '11B': 'A',
  '12A': 'D♭m', '12B': 'E',
};

const MUSICAL_TO_CAMELOT = Object.entries(CAMELOT_TO_MUSICAL)
  .reduce((acc, [c, m]) => { acc[m] = c; return acc; }, {});

export function camelotToMusical(camelot) {
  if (!camelot) return '';
  return CAMELOT_TO_MUSICAL[String(camelot).toUpperCase()] || camelot;
}

export function musicalToCamelot(musical) {
  if (!musical) return '';
  return MUSICAL_TO_CAMELOT[musical] || musical;
}

export function formatKey(key, format = 'musical') {
  if (!key) return '';
  if (format === 'camelot') return String(key).toUpperCase();
  return camelotToMusical(key);
}

// "Am · 8A" (musical primary) or "8A · Am" (camelot primary). Use for compact labels where both notations help.
export function formatKeyBoth(key, format = 'musical') {
  if (!key) return '';
  const camelot = String(key).toUpperCase();
  const musical = camelotToMusical(camelot);
  return format === 'camelot' ? `${camelot} · ${musical}` : `${musical} · ${camelot}`;
}

// Pitch math — tempered scale, 12 semitones per octave.
export function rateToSemitones(rate) {
  if (!rate || rate <= 0) return 0;
  return 12 * Math.log2(rate);
}

export function rateToCents(rate) {
  if (!rate || rate <= 0) return 0;
  return 1200 * Math.log2(rate);
}

export function semitonesToRate(semitones) {
  return Math.pow(2, semitones / 12);
}

// Shift a Camelot key by N semitones. +1 semitone = +7 positions on the wheel (modulo 12).
function wrap12(n) {
  return ((((n - 1) % 12) + 12) % 12) + 1;
}

function parseCamelot(str) {
  if (typeof str !== 'string') return null;
  const m = str.trim().toUpperCase().match(/^(\d{1,2})([AB])$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n < 1 || n > 12) return null;
  return { n, letter: m[2] };
}

export function shiftKey(key, semitones) {
  const parsed = parseCamelot(key);
  if (!parsed) return key;
  const rounded = Math.round(semitones);
  const steps = ((rounded % 12) * 7) % 12;
  return `${wrap12(parsed.n + steps)}${parsed.letter}`;
}

// Returns { key: "Am" (shifted), deviation: 34 } — deviation in cents away from the shifted key.
export function effectiveKey(baseKey, semitones, format = 'musical') {
  if (!baseKey) return { key: '', deviation: 0 };
  const whole = Math.round(semitones);
  const deviation = Math.round((semitones - whole) * 100);
  const shifted = shiftKey(baseKey, whole);
  return {
    key: formatKey(shifted, format),
    deviation,
  };
}

// "Am · 8A" or "A♯m · 3A +34¢" when pitched — dual notation for deck/HUD labels.
export function formatKeyWithDeviation(baseKey, semitones, format = 'musical', deviationThresholdCents = 3) {
  const whole = Math.round(semitones);
  const deviation = Math.round((semitones - whole) * 100);
  const shifted = shiftKey(baseKey, whole);
  const base = formatKeyBoth(shifted, format);
  if (Math.abs(deviation) < deviationThresholdCents) return base;
  const sign = deviation >= 0 ? '+' : '−';
  return `${base} ${sign}${Math.abs(deviation)}¢`;
}
