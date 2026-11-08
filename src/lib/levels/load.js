import { lazy } from 'react';
import { parse } from 'smol-toml';
import { validateLevel, validateWorkshop } from './schema.js';

const rawWorkshops = import.meta.glob('/src/workshops/*/workshop.toml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const rawLevels = import.meta.glob('/src/workshops/*/levels/*.toml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Leçons : métadonnées (id, ordre, titres) calculées à la build par le plugin `lesson-meta`
// (vite.config.js) ; le contenu complet (pages, quiz) n'est chargé qu'à l'ouverture de la leçon.
// Fichiers : NN_difficulty.toml (variante) ou NN.toml (ancien format, traité comme MEDIUM).
const lessonMetas = import.meta.glob('/src/workshops/*/lessons/*.toml', {
  query: '?meta',
  import: 'default',
  eager: true,
});
const lessonRawLoaders = import.meta.glob('/src/workshops/*/lessons/*.toml', {
  query: '?raw',
  import: 'default',
});

// Chargés à la demande : chaque atelier devient un chunk séparé (React.lazy + Suspense dans App)
const workshopComponents = import.meta.glob('/src/workshops/*/workshop.jsx');

const assetImages = import.meta.glob('/src/assets/*.{png,webp}', {
  eager: true,
  import: 'default',
});

const assetByFilename = {};
for (const [path, url] of Object.entries(assetImages)) {
  const name = path.split('/').pop();
  assetByFilename[name] = url;
}

export function resolveAsset(filename) {
  if (!filename) return null;
  return assetByFilename[filename] ?? null;
}

function workshopIdFromPath(path) {
  const m = path.match(/\/src\/workshops\/([^/]+)\//);
  return m ? m[1] : null;
}

// Extract difficulty variant from a lesson filename like "01_easy.toml"
function difficultyFromLessonPath(path) {
  const m = path.match(/_(\w+)\.toml$/);
  if (!m) return null;
  const candidate = m[1].toUpperCase();
  return ['EASY', 'MEDIUM', 'PRO'].includes(candidate) ? candidate : null;
}

const registry = {};
const dirToId = {};

for (const [path, raw] of Object.entries(rawWorkshops)) {
  const dir = workshopIdFromPath(path);
  const meta = parse(raw);
  validateWorkshop(meta, path);
  const id = meta.id;
  dirToId[dir] = id;
  registry[id] = { meta, levels: {}, levelsList: [], lessons: {}, lessonsList: [] };
}

for (const [path, raw] of Object.entries(rawLevels)) {
  const id = dirToId[workshopIdFromPath(path)];
  if (!registry[id]) continue;
  const level = parse(raw);
  validateLevel(level, path);
  registry[id].levels[level.id] = level;
}

// Each lesson variant is keyed by (order, difficulty). The "canonical" lesson
// object used for card display is taken from the MEDIUM variant when present,
// then EASY, then PRO (first available wins for metadata).
for (const [path, lesson] of Object.entries(lessonMetas)) {
  const workshopDir = workshopIdFromPath(path);
  const id = dirToId[workshopDir];
  if (!registry[id]) continue;
  const difficulty = difficultyFromLessonPath(path);
  if (!difficulty) continue;

  validateLevel(lesson, path);

  const order = lesson.order;
  if (!registry[id].lessons[order]) {
    registry[id].lessons[order] = { _variants: {} };
  }
  registry[id].lessons[order]._variants[difficulty] = path;

  // Use MEDIUM as canonical display data, fallback to first available
  const canonical = registry[id].lessons[order];
  if (
    !canonical.id ||
    difficulty === 'MEDIUM' ||
    (difficulty === 'EASY' && !canonical._variants.MEDIUM)
  ) {
    // Copy top-level fields from this variant for card display
    Object.assign(canonical, { ...lesson, _variants: canonical._variants });
  }
}

// Load legacy NN.toml files as MEDIUM variant (only if no _medium.toml already exists for that order)
for (const [path, lesson] of Object.entries(lessonMetas)) {
  // Skip files that have a difficulty suffix — those are already handled above
  if (difficultyFromLessonPath(path)) continue;

  const workshopDir = workshopIdFromPath(path);
  const id = dirToId[workshopDir];
  if (!registry[id]) continue;

  validateLevel(lesson, path);

  const order = lesson.order;
  if (!registry[id].lessons[order]) {
    registry[id].lessons[order] = { _variants: {} };
  }
  // Only register as MEDIUM if no explicit _medium.toml variant exists yet
  if (!registry[id].lessons[order]._variants.MEDIUM) {
    registry[id].lessons[order]._variants.MEDIUM = path;
    // Use as canonical if no better one yet
    if (!registry[id].lessons[order].id) {
      Object.assign(registry[id].lessons[order], { ...lesson, _variants: registry[id].lessons[order]._variants });
    }
  }
}

for (const [path, loader] of Object.entries(workshopComponents)) {
  const id = dirToId[workshopIdFromPath(path)];
  if (!registry[id]) continue;
  registry[id].Component = lazy(loader);
}

for (const id of Object.keys(registry)) {
  registry[id].levelsList = Object.values(registry[id].levels)
    .sort((a, b) => a.order - b.order);
  registry[id].lessonsList = Object.values(registry[id].lessons)
    .filter((l) => l.id)
    .sort((a, b) => a.order - b.order);
  registry[id].imageUrl = resolveAsset(registry[id].meta.image);
}

export const workshops = registry;

export const workshopsList = Object.values(registry)
  .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));

export function getAllTracks() {
  const out = [];
  const seen = new Set();
  const add = (tr) => {
    if (!tr?.url) return;
    if (seen.has(tr.url)) return;
    seen.add(tr.url);
    out.push(tr);
  };
  for (const ws of Object.values(registry)) {
    for (const lvl of ws.levelsList) {
      add(lvl.track?.A);
      add(lvl.track?.B);
    }
  }
  return out;
}

export function getWorkshop(id) {
  return workshops[id];
}

export function getLevel(workshopId, levelId) {
  return workshops[workshopId]?.levels[levelId];
}

export function getLevelByOrder(workshopId, order) {
  return workshops[workshopId]?.levelsList.find((l) => l.order === order);
}

export function getLessonByOrder(workshopId, order) {
  return workshops[workshopId]?.lessonsList.find((l) => l.order === order);
}

// Returns the best available lesson variant for the given difficulty.
// Falls back down the chain (PRO→MEDIUM→EASY) or up (EASY→MEDIUM→PRO)
// when the requested variant doesn't exist.
const FALLBACK_CHAIN = { PRO: ['PRO', 'MEDIUM', 'EASY'], MEDIUM: ['MEDIUM', 'EASY', 'PRO'], EASY: ['EASY', 'MEDIUM', 'PRO'] };

const lessonCache = new Map();

// Charge (une fois) le contenu complet d'une variante de leçon.
async function loadLessonContent(path) {
  if (!lessonCache.has(path)) {
    lessonCache.set(path, lessonRawLoaders[path]().then((raw) => {
      const lesson = parse(raw);
      validateLevel(lesson, path);
      return lesson;
    }).catch((err) => { lessonCache.delete(path); throw err; }));
  }
  return lessonCache.get(path);
}

// Async : résout la meilleure variante disponible pour la difficulté, contenu complet compris.
export async function getLessonVariant(workshopId, order, difficulty = 'EASY') {
  const lesson = getLessonByOrder(workshopId, order);
  if (!lesson) return null;
  const variants = lesson._variants || {};
  const chain = FALLBACK_CHAIN[difficulty] || ['EASY', 'MEDIUM', 'PRO'];
  for (const d of chain) {
    if (variants[d]) {
      return { lesson: await loadLessonContent(variants[d]), servedDifficulty: d, requestedDifficulty: difficulty };
    }
  }
  return null;
}
