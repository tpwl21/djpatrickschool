export function parseCamelot(str) {
  if (typeof str !== 'string') return null;
  const match = str.trim().toUpperCase().match(/^(\d{1,2})([AB])$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (n < 1 || n > 12) return null;
  return { n, letter: match[2] };
}

export function formatCamelot(key) {
  if (!key || typeof key.n !== 'number' || (key.letter !== 'A' && key.letter !== 'B')) return '';
  return `${key.n}${key.letter}`;
}

function wrap12(n) {
  // Wrap to 1..12 (1-indexed). (n - 1) mod 12 + 1 handles negatives too.
  return ((((n - 1) % 12) + 12) % 12) + 1;
}

// Mouvements de base enseignés : même clé, relatif (A↔B), ±1. Le « +7 » (+1 demi-ton) n'en fait pas partie :
// c'est une montée de tension à faire en coupure nette, pas une compatibilité de blend (décision du 9 nov.).
export function compatibleSet(keyStr) {
  const key = parseCamelot(keyStr);
  if (!key) return [];
  const { n, letter } = key;
  const other = letter === 'A' ? 'B' : 'A';
  const set = new Set([
    formatCamelot({ n,             letter }),
    formatCamelot({ n,             letter: other }),
    formatCamelot({ n: wrap12(n - 1), letter }),
    formatCamelot({ n: wrap12(n + 1), letter }),
  ]);
  return Array.from(set);
}

export function areCompatible(keyA, keyB) {
  return compatibleSet(keyA).includes(String(keyB).toUpperCase());
}

export function shiftCamelot(keyStr, semitones) {
  const key = parseCamelot(keyStr);
  if (!key) return null;
  // +1 semitone = +7 positions (same letter). -1 semitone = -7 positions.
  const steps = ((semitones % 12) * 7) % 12;
  return formatCamelot({ n: wrap12(key.n + steps), letter: key.letter });
}
