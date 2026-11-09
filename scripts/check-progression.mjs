// Vérification de src/lib/progression.js : node scripts/check-progression.mjs
import assert from 'node:assert/strict';
import { unlockedTiers, currentTier, isUnlockedIn, isTierDone } from '../src/lib/progression.js';

const ws = { lessonsList: [{ order: 1 }, { order: 2 }], levelsList: [{ order: 1 }, { order: 2 }] };
const easyDone = { completedLessons: { 1: ['EASY'], 2: ['EASY'] }, completedPractice: { 1: ['EASY'], 2: ['EASY', 'MEDIUM'] } };

assert.deepEqual(unlockedTiers(ws, {}), ['EASY']);
assert.deepEqual(unlockedTiers(ws, { completedPractice: { 1: ['EASY'], 2: ['EASY'] } }), ['EASY']); // leçons pas finies
assert.deepEqual(unlockedTiers(ws, easyDone), ['EASY', 'MEDIUM']);
assert.equal(currentTier(ws, easyDone), 'MEDIUM');
assert.equal(isTierDone(ws, easyDone, 'MEDIUM'), false);
assert.deepEqual(unlockedTiers(ws, { unlockedAll: true }), ['EASY', 'MEDIUM', 'PRO']);

assert.equal(isUnlockedIn({}, 'level', 1, 'MEDIUM'), true);
assert.equal(isUnlockedIn(easyDone, 'level', 2, 'MEDIUM'), false); // niveau 1 pas réussi en MEDIUM
assert.equal(isUnlockedIn(easyDone, 'level', 3, 'MEDIUM'), true);
assert.equal(isUnlockedIn(easyDone, 'lesson', 2, 'EASY'), true);

console.log('progression OK');
