/**
 * Utility for Harmonic Mixing based on the Camelot Wheel.
 * Camelot notation: 1A-12A (Minor), 1B-12B (Major)
 */

export const isHarmonicallyCompatible = (key1, key2) => {
  if (!key1 || !key2) return false;
  if (key1 === key2) return true;

  const parseKey = (k) => {
    const num = parseInt(k.slice(0, -1), 10);
    const letter = k.slice(-1).toUpperCase();
    return { num, letter };
  };

  const k1 = parseKey(key1);
  const k2 = parseKey(key2);

  // Same number, different letter (Switching Major/Minor)
  if (k1.num === k2.num && k1.letter !== k2.letter) return true;

  // Same letter, +/- 1 number (Adjacent on the wheel)
  if (k1.letter === k2.letter) {
    const diff = Math.abs(k1.num - k2.num);
    if (diff === 1 || diff === 11) return true; // 11 is for 12 to 1 wrap around
  }

  return false;
};

export const getCompatibleKeys = (key) => {
  const num = parseInt(key.slice(0, -1), 10);
  const letter = key.slice(-1).toUpperCase();
  const otherLetter = letter === 'A' ? 'B' : 'A';

  const neighbors = [
    `${num}${otherLetter}`,
    `${num === 12 ? 1 : num + 1}${letter}`,
    `${num === 1 ? 12 : num - 1}${letter}`,
  ];

  return [key, ...neighbors];
};
