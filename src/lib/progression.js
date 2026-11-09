// Paliers de difficulté (décision phase 4) : EASY → MEDIUM → PRO se débloquent par atelier.
// Tout se déduit de ce qui est déjà sauvegardé (completedLessons / completedPractice : { [order]: [paliers réussis] }),
// donc pas de nouvelle donnée ni de migration.
export const TIERS = ['EASY', 'MEDIUM', 'PRO'];

const done = (completions, order, tier) => (completions?.[order] || []).includes(tier);

// Un palier est fini quand chaque leçon et chaque niveau de l'atelier y a été réussi.
export function isTierDone(ws, entry = {}, tier) {
  return (ws.lessonsList || []).every((l) => done(entry.completedLessons, l.order, tier))
    && (ws.levelsList || []).every((l) => done(entry.completedPractice, l.order, tier));
}

export function unlockedTiers(ws, entry = {}) {
  if (entry.unlockedAll) return [...TIERS];
  const out = ['EASY'];
  for (let i = 0; i < TIERS.length - 1 && isTierDone(ws, entry, TIERS[i]); i++) out.push(TIERS[i + 1]);
  return out;
}

export const currentTier = (ws, entry) => unlockedTiers(ws, entry).at(-1);

// Dans un palier, l'élément N s'ouvre quand le N-1 y est réussi.
export const isUnlockedIn = (entry = {}, kind, order, tier) =>
  !!entry.unlockedAll || order === 1
  || done(kind === 'lesson' ? entry.completedLessons : entry.completedPractice, order - 1, tier);

export const isDoneIn = (entry = {}, kind, order, tier) =>
  done(kind === 'lesson' ? entry.completedLessons : entry.completedPractice, order, tier);
