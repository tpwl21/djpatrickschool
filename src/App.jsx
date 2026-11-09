import { useState, useEffect, useCallback, useContext, lazy, Suspense } from 'react';
import { LanguageContext } from './hooks/LanguageContext.jsx';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import Home from './components/Home';
import WorkshopHome from './components/WorkshopHome';
import GraduationPopup from './components/GraduationPopup';
import LevelPopup from './components/LevelPopup';
import ThemeTransition from './components/ThemeTransition';
// import AmbientPlayer from './components/AmbientPlayer'; // TODO: re-enable once real loops are ready
const SecretBooth = lazy(() => import('./workshops/SecretBooth'));
import LessonLevel from './workshops/LessonLevel';
import LoadingLabel from './components/LoadingLabel';
import { useDifficulty } from './hooks/useDifficulty.jsx';
import { TIERS, currentTier, unlockedTiers } from './lib/progression';
import { TierNavContext } from './hooks/useTierNav';
import { workshops, getWorkshop, getLevelByOrder, getLessonByOrder, getLessonVariant } from './lib/levels/load';

const PROGRESSION_KEY = 'dj_teacher_progression_v3';

function defaultProgression() {
  const map = {};
  for (const id of Object.keys(workshops)) {
    map[id] = { practice: 1, lessons: 1, completedLessons: {}, completedPractice: {} };
  }
  return map;
}

// Rétro-compat : assure les champs completion sur une entrée existante.
// completedLessons migre de l'ancien format array vers objet { [order]: [diffs] }.
function normalizeWorkshopEntry(entry) {
  let completedLessons = entry.completedLessons ?? {};
  // Migrate old array format (list of completed lesson orders with no diff tracking)
  if (Array.isArray(completedLessons)) {
    const migrated = {};
    for (const order of completedLessons) {
      migrated[order] = ['MEDIUM']; // best guess: assume medium
    }
    completedLessons = migrated;
  }
  return {
    practice: 1,
    lessons: 1,
    completedPractice: {},
    ...entry,
    completedLessons,
  };
}

function loadProgression() {
  try {
    const raw = localStorage.getItem(PROGRESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Normalise les entrées existantes qui n'auraient pas encore les champs completion
      const normalized = {};
      for (const [id, entry] of Object.entries(parsed)) {
        normalized[id] = normalizeWorkshopEntry(entry);
        // ancien « tout débloquer » (mot de passe tapé avant les paliers) : tout ouvert, rien de réussi
        const ws = workshops[id];
        const n = normalized[id];
        if (ws && !n.unlockedAll && ws.levelsList.length > 1 && n.practice >= ws.levelsList.length && n.lessons >= (ws.lessonsList?.length || 1)
          && !Object.keys(n.completedPractice).length && !Object.keys(n.completedLessons).length) {
          n.unlockedAll = true;
        }
      }
      return normalized;
    }
  } catch { /* ignore */ }

  // Migrate from v2
  const base = defaultProgression();
  try {
    const v2 = JSON.parse(localStorage.getItem('dj_teacher_progression_v2') || '{}');
    for (const [id, order] of Object.entries(v2)) {
      if (base[id] && typeof order === 'number') base[id].practice = order;
    }
  } catch { /* ignore */ }

  try { localStorage.setItem(PROGRESSION_KEY, JSON.stringify(base)); } catch { /* stockage bloqué : on joue sans sauvegarde */ }
  return base;
}

function saveProgression(map) {
  try { localStorage.setItem(PROGRESSION_KEY, JSON.stringify(map)); } catch { /* stockage bloqué : on joue sans sauvegarde */ }
}

function parseHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash || hash === '/') return { view: 'home' };
  if (hash === '/booth') return { view: 'booth' };

  const parts = hash.split('/').filter(Boolean);

  if (parts[0] === 'workshop' && parts[1]) {
    return { view: 'workshop_home', workshopId: parts[1] };
  }

  // Lesson route: /{workshopId}/lesson/{order}
  if (parts.length >= 3 && parts[1] === 'lesson') {
    const workshopId = parts[0];
    const lessonOrder = parseInt(parts[2], 10);
    const difficulty = TIERS.includes(parts[3]) ? parts[3] : 'EASY';
    if (getWorkshop(workshopId) && !Number.isNaN(lessonOrder)) {
      return { view: 'lesson', workshopId, lessonOrder, difficulty };
    }
  }

  // Practice route: /{workshopId}/{order}[/{difficulty}]
  if (parts.length >= 2) {
    const workshopId = parts[0];
    const levelOrder = parseInt(parts[1], 10);
    const difficulty = TIERS.includes(parts[2]) ? parts[2] : 'EASY';
    if (getWorkshop(workshopId) && !Number.isNaN(levelOrder)) {
      return { view: 'level', workshopId, levelOrder, difficulty };
    }
  }

  return { view: 'home' };
}

function routeToHash(route) {
  switch (route.view) {
    case 'home': return '/';
    case 'booth': return '/booth';
    case 'workshop_home': return `/workshop/${route.workshopId}`;
    case 'lesson':
      return route.difficulty && route.difficulty !== 'EASY'
        ? `/${route.workshopId}/lesson/${route.lessonOrder}/${route.difficulty}`
        : `/${route.workshopId}/lesson/${route.lessonOrder}`;
    case 'level':
      return route.difficulty && route.difficulty !== 'EASY'
        ? `/${route.workshopId}/${route.levelOrder}/${route.difficulty}`
        : `/${route.workshopId}/${route.levelOrder}`;
    default: return '/';
  }
}

// Charge le contenu de la leçon à la demande (il n'est plus embarqué au démarrage), puis l'affiche.
// Remontée via `key` à chaque changement de leçon/difficulté : l'état part toujours de « chargement ».
const LessonRoute = ({ workshop, workshopId, order, difficulty, retryKey, onNextLevel, onRetry, onBack, onUnlockNext }) => {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    getLessonVariant(workshopId, order, difficulty)
      .then((r) => { if (alive) setState(r ? { status: 'ready', r } : { status: 'missing' }); })
      .catch(() => { if (alive) setState({ status: 'missing' }); });
    return () => { alive = false; };
  }, [workshopId, order, difficulty]);

  if (state.status === 'loading') {
    return <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}><LoadingLabel /></div>;
  }
  if (state.status === 'missing') return <NotFound onBack={onBack} />;
  const { lesson, servedDifficulty } = state.r;
  return (
    <LessonLevel
      key={`${servedDifficulty}-${retryKey}`}
      lesson={lesson}
      workshop={workshop}
      requestedDifficulty={difficulty}
      servedDifficulty={servedDifficulty}
      onNextLevel={onNextLevel}
      onRetry={onRetry}
      onBack={onBack}
      onUnlockNext={() => onUnlockNext(servedDifficulty)}
    />
  );
};

// Page affichée quand une route pointe vers un atelier / niveau / leçon inexistant
const NotFound = ({ onBack }) => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="app-container not-found">
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.text')}</p>
      <button className="btn-crayon" onClick={onBack}>{t('notFound.back')}</button>
    </div>
  );
};

function App() {
  const [route, setRoute] = useState(() => parseHash());
  const [unlockedOrder, setUnlockedOrder] = useState(() => loadProgression());
  const [retryKey, setRetryKey] = useState(0);
  const [isGraduated, setIsGraduated] = useState(false);
  const [pendingNext, setPendingNext] = useState(null); // { workshopId, order, difficulty }
  const [difficulty, setDifficulty] = useDifficulty();

  // Le palier joué donne l'ambiance (la nuit tombe) : celui de la route en leçon/niveau,
  // le palier atteint sur la page d'un atelier, le jour sur l'accueil.
  // shortcut: une URL tapée à la main peut ouvrir un palier pas encore débloqué ; pas de garde tant que c'est un jeu sans enjeu.
  useEffect(() => {
    const ws = route.workshopId ? getWorkshop(route.workshopId) : null;
    const tier = route.view === 'level' || route.view === 'lesson' ? route.difficulty
      : route.view === 'workshop_home' && ws ? currentTier(ws, unlockedOrder[route.workshopId])
      : 'EASY';
    setDifficulty(tier);
  }, [route, unlockedOrder, setDifficulty]);

  useEffect(() => {
    window.location.hash = routeToHash(route);
  }, [route]);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      setRoute((curr) => {
        if (JSON.stringify(curr) === JSON.stringify(next)) return curr;
        return next;
      });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goHome = useCallback(() => {
    setRoute({ view: 'home' });
    setRetryKey(0);
    setIsGraduated(false);
    setPendingNext(null);
  }, []);

  const goWorkshop = useCallback((workshopId) => {
    setRoute({ view: 'workshop_home', workshopId });
  }, []);

  const goBooth = useCallback(() => {
    setRoute({ view: 'booth' });
  }, []);

  const startLevel = useCallback((workshopId, levelOrder, diff = 'EASY') => {
    setDifficulty(diff); // même lot que la route : le niveau monte directement au bon palier
    setRoute({ view: 'level', workshopId, levelOrder, difficulty: diff });
    setRetryKey(0);
    setIsGraduated(false);
    setPendingNext(null);
  }, [setDifficulty]);

  const startLesson = useCallback((workshopId, lessonOrder, diff = 'EASY') => {
    setDifficulty(diff);
    setRoute({ view: 'lesson', workshopId, lessonOrder, difficulty: diff });
    setRetryKey(0);
    setIsGraduated(false);
    setPendingNext(null);
  }, [setDifficulty]);

  const unlockNext = useCallback((workshopId, completedOrder, completedDifficulty) => {
    setUnlockedOrder((prev) => {
      const ws = normalizeWorkshopEntry(prev[workshopId] || {});
      const next = completedOrder + 1;
      const updatedUnlock = next > ws.practice ? next : ws.practice;

      // Enregistre la difficulté validée pour ce level
      const prevDiffs = ws.completedPractice[completedOrder] || [];
      const newDiffs = completedDifficulty && !prevDiffs.includes(completedDifficulty)
        ? [...prevDiffs, completedDifficulty]
        : prevDiffs;

      const updated = {
        ...prev,
        [workshopId]: {
          ...ws,
          practice: updatedUnlock,
          completedPractice: { ...ws.completedPractice, [completedOrder]: newDiffs },
        },
      };
      saveProgression(updated);
      return updated;
    });
  }, []);

  // completedDifficulty : 'EASY' | 'MEDIUM' | 'PRO' — which variant the user just validated
  const unlockNextLesson = useCallback((workshopId, completedOrder, completedDifficulty) => {
    setUnlockedOrder((prev) => {
      const ws = normalizeWorkshopEntry(prev[workshopId] || {});
      const next = completedOrder + 1;
      const updatedUnlock = next > ws.lessons ? next : ws.lessons;

      // Track completed difficulty variants per lesson order (same pattern as practice)
      const prevDiffs = ws.completedLessons[completedOrder] || [];
      const newDiffs =
        completedDifficulty && !prevDiffs.includes(completedDifficulty)
          ? [...prevDiffs, completedDifficulty]
          : prevDiffs;

      const updated = {
        ...prev,
        [workshopId]: {
          ...ws,
          lessons: updatedUnlock,
          completedLessons: { ...ws.completedLessons, [completedOrder]: newDiffs },
        },
      };
      saveProgression(updated);
      return updated;
    });
  }, []);

  const handleNextLevel = useCallback(() => {
    if (route.view !== 'level') return;
    const { workshopId, levelOrder, difficulty } = route;
    const workshop = getWorkshop(workshopId);
    if (!workshop) return;
    if (levelOrder >= workshop.levelsList.length) {
      setIsGraduated(true);
      return;
    }
    unlockNext(workshopId, levelOrder, difficulty);
    setPendingNext({ workshopId, order: levelOrder + 1, difficulty });
  }, [route, unlockNext]);

  const handleNextLesson = useCallback(() => {
    if (route.view !== 'lesson') return;
    const { workshopId, lessonOrder } = route; // route.difficulty : palier en cours
    const workshop = getWorkshop(workshopId);
    if (!workshop) return;
    if (lessonOrder >= workshop.lessonsList.length) {
      goWorkshop(workshopId);
      return;
    }
    startLesson(workshopId, lessonOrder + 1, route.difficulty);
  }, [route, goWorkshop, startLesson]);

  const startPendingLevel = useCallback(() => {
    if (!pendingNext) return;
    startLevel(pendingNext.workshopId, pendingNext.order, pendingNext.difficulty);
  }, [pendingNext, startLevel]);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const handleResetAll = useCallback(() => {
    const reset = {};
    for (const id of Object.keys(workshops)) {
      reset[id] = { practice: 1, lessons: 1, completedLessons: [], completedPractice: {} };
    }
    setUnlockedOrder(reset);
    saveProgression(reset);
  }, []);

  const handleUnlockAll = useCallback(() => {
    const all = {};
    for (const [id, ws] of Object.entries(workshops)) {
      all[id] = {
        practice: Math.max(1, ws.levelsList.length),
        lessons: Math.max(1, ws.lessonsList?.length || 1),
        completedLessons: {},
        completedPractice: {},
        unlockedAll: true, // mot de passe du coffre : tous les paliers ouverts
      };
    }
    setUnlockedOrder(all);
    saveProgression(all);
  }, []);

  const renderLevel = () => {
    const workshop = getWorkshop(route.workshopId);
    if (!workshop || !workshop.Component) {
      return (
        <NotFound onBack={goHome} />
      );
    }
    const level = getLevelByOrder(route.workshopId, route.levelOrder);
    if (!level) {
      return (
        <NotFound onBack={() => goWorkshop(route.workshopId)} />
      );
    }
    const Component = workshop.Component;
    return (
      <Component
        key={`${route.workshopId}-${route.levelOrder}-${route.difficulty}-${retryKey}`}
        levelId={level.id}
        difficulty={route.difficulty}
        onNextLevel={handleNextLevel}
        onRetry={handleRetry}
        onBack={() => goWorkshop(route.workshopId)}
        onUnlockNext={() => unlockNext(route.workshopId, route.levelOrder, route.difficulty)}
      />
    );
  };

  const renderLesson = () => {
    const workshop = getWorkshop(route.workshopId);
    const lesson = getLessonByOrder(route.workshopId, route.lessonOrder);
    if (!workshop || !lesson) {
      return (
        <NotFound onBack={() => goWorkshop(route.workshopId)} />
      );
    }
    return (
      <LessonRoute
        key={`${route.workshopId}-lesson-${route.lessonOrder}-${route.difficulty}-${retryKey}`}
        workshop={workshop}
        workshopId={route.workshopId}
        order={route.lessonOrder}
        difficulty={route.difficulty}
        retryKey={retryKey}
        onNextLevel={handleNextLesson}
        onRetry={handleRetry}
        onBack={() => goWorkshop(route.workshopId)}
        onUnlockNext={(served) => unlockNextLesson(route.workshopId, route.lessonOrder, served)}
      />
    );
  };

  const pendingLevelObj = pendingNext ? getLevelByOrder(pendingNext.workshopId, pendingNext.order) : null;
  const pendingWorkshop = pendingNext ? getWorkshop(pendingNext.workshopId) : null;

  // Sélecteur de palier de l'en-tête (leçon / niveau) : paliers ouverts dans cet atelier, et on rejoue au palier choisi
  const navWs = (route.view === 'level' || route.view === 'lesson') ? getWorkshop(route.workshopId) : null;
  const tierNav = navWs ? {
    unlocked: unlockedTiers(navWs, unlockedOrder[route.workshopId]),
    pick: (tier) => (route.view === 'level'
      ? startLevel(route.workshopId, route.levelOrder, tier)
      : startLesson(route.workshopId, route.lessonOrder, tier)),
  } : null;

  return (
    <TierNavContext.Provider value={tierNav}>
      <ThemeTransition />
      {route.view === 'home' && (
        <Home
          onWorkshopSelect={goWorkshop}
          onStartLevel={startLevel}
          onStartLesson={startLesson}
          onStartBooth={goBooth}
          unlockedOrder={unlockedOrder}
          onUnlockAll={handleUnlockAll}
          onResetAll={handleResetAll}
        />
      )}

      {route.view === 'workshop_home' && (
        <WorkshopHome
          workshopId={route.workshopId}
          unlockedOrder={unlockedOrder[route.workshopId] || { practice: 1, lessons: 1 }}
          onStart={startLevel}
          onStartLesson={startLesson}
          onBack={goHome}
        />
      )}

      <Suspense fallback={<div className="app-container" />}>
        {route.view === 'booth' && (
          <SecretBooth onBack={goHome} />
        )}

        {/* les ateliers lisent leurs règles au montage : on attend que le palier du contexte soit celui de la route
            (URL ouverte directement, retour arrière) */}
        {route.view === 'level' && difficulty === route.difficulty && renderLevel()}
      </Suspense>
      {route.view === 'lesson' && difficulty === route.difficulty && renderLesson()}

      {isGraduated && (
        <GraduationPopup difficulty={route.difficulty} onBackHome={goHome} />
      )}

      <AnimatePresence>
        {pendingNext && pendingLevelObj && (
          <LevelPopup
            workshopMeta={pendingWorkshop?.meta}
            level={pendingLevelObj}
            difficulty={pendingNext.difficulty}
            onCancel={goHome}
            onStart={startPendingLevel}
          />
        )}
      </AnimatePresence>

    </TierNavContext.Provider>
  );
}

export default App;
