/**
 * Shared constants and phrasing logic for DJ Teacher workshops.
 */

export const BEATS_PER_LOOP = 8;
export const LOOPS_PER_PHRASE = 4;
export const BEATS_PER_PHRASE = BEATS_PER_LOOP * LOOPS_PER_PHRASE; // 32 beats

export const PHRASES = [
  { name: 'Intro',  emoji: '🌅', color: 'rgba(168, 216, 185, 0.5)', index: 0 },
  { name: 'Build',  emoji: '⛰️', color: 'rgba(246, 211, 101, 0.5)', index: 1 },
  { name: 'Drop',   emoji: '🔥', color: 'rgba(255, 107, 107, 0.5)', index: 2 },
  { name: 'Break',  emoji: '🌊', color: 'rgba(116, 185, 255, 0.5)', index: 3 },
  { name: 'Outro',  emoji: '🌙', color: 'rgba(162, 155, 254, 0.5)', index: 4 },
];

export const NUM_PHRASES = PHRASES.length;

export const LOOP_COLORS = [
  'rgba(255,255,255,0.15)',
  'rgba(0,0,0,0.08)',
  'rgba(255,255,255,0.15)',
  'rgba(0,0,0,0.08)',
];

export const COMPATIBLE_PHRASE_PAIRS = [
  [4, 0], // Outro (A) -> Intro (B)
  [0, 1], // Intro (A) -> Build (B)
  [1, 2], // Build (A) -> Drop (B)
  [3, 0], // Break (A) -> Intro (B)
];

/**
 * Generates phrase metadata (start/duration) for a given BPM and track length.
 */
export const buildPhraseBlocks = (bpm, trackLengthSec) => {
  const secPerBeat = 60 / bpm;
  const secPerPhrase = secPerBeat * BEATS_PER_PHRASE;
  const numBlocks = Math.ceil(trackLengthSec / secPerPhrase);
  return Array.from({ length: numBlocks }).map((_, i) => ({
    id: i,
    phrase: PHRASES[i % NUM_PHRASES],
    startSec: i * secPerPhrase,
    durationSec: secPerPhrase,
    numLoops: LOOPS_PER_PHRASE,
    secPerLoop: secPerBeat * BEATS_PER_LOOP,
  }));
};
