import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIFFICULTY_SETTINGS, DIFF_COLORS } from '../constants/difficulty';
import { LanguageContext } from '../hooks/LanguageContext';
import { useDifficulty } from '../hooks/useDifficulty.jsx';
import { workshopsList } from '../lib/levels/load';
import { t as pickText } from '../lib/levels/schema';
import coachImg from '../assets/coach_patrick.webp';
import mysteryImg from '../assets/secret_agent_patrick.webp';
import easyImg from '../assets/easy_patrick.webp';
import mediumImg from '../assets/medium_patrick.webp';
import proImg from '../assets/pro_patrick.webp';
import logoUrl from '../assets/logo.svg';
import LanguageSwitcher from './LanguageSwitcher';
import AudioVisualizer from './AudioVisualizer';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Locomotive from './Locomotive';
import Potard from './Potard';
import BookIcon from './BookIcon';
import FxIcon from './FxIcon';
import CrateIcon from './CrateIcon';
import HarmonyIcon from './HarmonyIcon';
import CrowdIcon from './CrowdIcon';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const VAULT_ITEMS = [
  {
    id: 'tricks',
    password: 'DJPATRICKTRICKS',
    labelFr: 'Astuces Secrètes',
    labelEn: 'Secret Tricks',
    descFr: 'Les techniques interdites de Patrick.',
    descEn: "Patrick's forbidden techniques.",
  },
  {
    id: 'weapons',
    password: 'DJPATRICKWEAPONS',
    labelFr: 'Armes Secrètes',
    labelEn: 'Secret Weapons',
    descFr: 'Ses morceaux qui sauvent une soirée.',
    descEn: 'The tracks that save the dancefloor.',
  },
  {
    id: 'booth',
    password: 'COMETOMYSECRETBOOTH',
    labelFr: 'Le Booth Secret',
    labelEn: 'Secret Booth',
    descFr: 'Le sanctuaire de DJ Patrick.',
    descEn: "DJ Patrick's holy booth.",
    isBooth: true,
  },
];

const RESET_PASSWORDS = ['RESET', 'PASSWORD', 'TOTO', 'SECRET'];
const VAULT_STORAGE_KEY = 'djPatrickVault';


// Case du coffre : vrai bouton quand elle ouvre quelque chose (Booth), simple case sinon
const VaultCell = ({ interactive, children, ...rest }) => (
  interactive
    ? <button type="button" {...rest} style={{ ...rest.style, font: 'inherit', color: 'inherit', textAlign: 'inherit' }}>{children}</button>
    : <div {...rest}>{children}</div>
);

const Home = ({ onWorkshopSelect, onStartLevel, onStartLesson, onStartBooth, unlockedOrder = {}, onUnlockAll, onResetAll }) => {
  const { language, setLanguage, t } = useContext(LanguageContext);
  useDocumentTitle(null);

  // Prochaine étape non terminée : ateliers dans l'ordre, leçons puis exercices (bouton « Continuer »)
  const nextStep = (() => {
    for (const ws of workshopsList) {
      if (ws.meta.forthcoming) continue;
      const p = unlockedOrder[ws.meta.id] || {};
      const lessonsUnlock = typeof p === 'object' ? (p.lessons || 1) : 1;
      const practiceUnlock = typeof p === 'object' ? (p.practice || 1) : p;
      const doneLessons = p.completedLessons || {};
      const donePractice = p.completedPractice || {};
      const lessonDone = (o) => (Array.isArray(doneLessons) ? doneLessons.includes(o) : (doneLessons[o] || []).length > 0);
      const les = (ws.lessonsList || []).find((l) => l.order <= lessonsUnlock && !lessonDone(l.order));
      if (les) return { kind: 'lesson', ws, item: les };
      const lvl = (ws.levelsList || []).find((l) => l.order <= practiceUnlock && !(donePractice[l.order] || []).length);
      if (lvl) return { kind: 'level', ws, item: lvl };
    }
    return null;
  })();
  const hasProgress = Object.values(unlockedOrder || {}).some((p) => p && typeof p === 'object'
    && (Object.keys(p.completedLessons || {}).length || Object.keys(p.completedPractice || {}).length));
  const startNext = () => {
    if (!nextStep) return;
    if (nextStep.kind === 'lesson') onStartLesson(nextStep.ws.meta.id, nextStep.item.order);
    else onStartLevel(nextStep.ws.meta.id, nextStep.item.order, difficulty);
  };
  const [secretCode, setSecretCode] = useState('');
  const [vaultFeedback, setVaultFeedback] = useState('');
  const [vaultUnlocked, setVaultUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VAULT_STORAGE_KEY) || '[]'); } catch { return []; }
  });

  const saveVault = (ids) => {
    setVaultUnlocked(ids);
    try { localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  };

  const handleSecretCode = (val) => {
    setSecretCode(val);
    const upper = val.trim().toUpperCase();

    if (RESET_PASSWORDS.includes(upper)) {
      saveVault([]);
      onResetAll();
      setSecretCode('');
      setVaultFeedback(language === 'fr' ? 'TOUT EFFACÉ' : 'RESET');
      setTimeout(() => setVaultFeedback(''), 2000);
      return;
    }

    if (upper === 'PATRICKTHEBOSS') {
      onUnlockAll();
      saveVault(VAULT_ITEMS.map(v => v.id));
      setSecretCode('');
      setVaultFeedback('UNLOCKED ALL');
      setTimeout(() => setVaultFeedback(''), 2000);
      return;
    }

    const match = VAULT_ITEMS.find(v => v.password === upper);
    if (match && !vaultUnlocked.includes(match.id)) {
      const next = [...vaultUnlocked, match.id];
      saveVault(next);
      setSecretCode('');
      setVaultFeedback(language === 'fr' ? `${match.labelFr} déverrouillé` : `${match.labelEn} unlocked`);
      setTimeout(() => setVaultFeedback(''), 2500);
    }
  };

  const [audioCtx] = useState(() => {
    const ctx = new MagicAudioContext();
    ctx.init().catch((e) => console.warn('Audio accueil indisponible', e));
    return ctx;
  });
  const [difficulty, setDifficulty] = useDifficulty();

  const [hoveredDescription, setHoveredDescription] = useState(t('home.welcome'));
  const [currentCoachImg, setCurrentCoachImg] = useState(coachImg);

  useEffect(() => {
    setHoveredDescription(t('home.welcome'));
  }, [language]);

  const difficultyInfo = {
    EASY: t('home.difficultyInfo.EASY'),
    MEDIUM: t('home.difficultyInfo.MEDIUM'),
    PRO: t('home.difficultyInfo.PRO')
  };

  const difficultyImages = {
    EASY: easyImg,
    MEDIUM: mediumImg,
    PRO: proImg
  };

  return (
    <div className="home-container premium" style={{ position: 'relative' }}>

      <LanguageSwitcher style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: -1, opacity: 0.15, pointerEvents: 'none', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{
          fontSize: '25vw',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-5deg)',
          color: '#000',
          opacity: 0.03,
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          fontWeight: 900
        }}>
          DJ PATRICK
        </div>
        <AudioVisualizer audioCtx={audioCtx} color="#4ecdc4" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="home-banner"
        style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
      >
        <h1 className="banner-logo-container">
          <span className="banner-logo" role="img" aria-label="DJ Patrick School" style={{ '--logo-url': `url(${logoUrl})` }} />
        </h1>
        <div className="banner-accent-line" />
      </motion.div>

      <div className="home-main-layout">
        <div className="coach-section">
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredDescription}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="coach-bubble-home"
            >
              {hoveredDescription}
              <div className="bubble-tail-home" />
            </motion.div>
          </AnimatePresence>
          <motion.img
            key={currentCoachImg}
            src={currentCoachImg}
            alt="Coach Patrick"
            className="coach-img-home"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={{ scale: 1.04, transition: { duration: 0.25 } }}
          />
          {nextStep && (
            <motion.button
              type="button"
              className="btn-crayon play-btn continue-cta"
              onClick={startNext}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="continue-cta-label">{hasProgress ? t('home.continue.resume') : t('home.continue.start')} →</span>
              <span className="continue-cta-sub">
                {pickText(nextStep.ws.meta, language)?.title} · {nextStep.kind === 'lesson' ? `${t('lesson.lessonLabel')} ${nextStep.item.order}` : `${t('home.popup.level')} ${nextStep.item.order}`} : {pickText(nextStep.item, language)?.title}
              </span>
            </motion.button>
          )}
        </div>

        <div className="nav-section">
          <div className="difficulty-row">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
              <button
                key={key}
                className={`diff-btn ${difficulty === key ? 'active' : ''}`}
                onClick={() => setDifficulty(key)}
                onMouseEnter={() => {
                  setHoveredDescription(`${setting.name} : ${difficultyInfo[key]}`);
                  setCurrentCoachImg(difficultyImages[key]);
                }}
                onMouseLeave={() => {
                  setCurrentCoachImg(coachImg);
                  setHoveredDescription(t('home.welcome'));
                }}
              >
                {setting.name}
              </button>
            ))}
          </div>

          <div className="categories-container">
            <h2>{t('home.workshopsTitle')}</h2>
            {workshopsList.map((ws) => {
              const { meta, imageUrl, levelsList } = ws;
              const id = meta.id;
              const color = meta.color || '#333';
              const metaText = pickText(meta, language);
              const title = metaText?.title;
              const shortDesc = metaText?.short_desc;
              const wsProgress = unlockedOrder[id] || { practice: 1, lessons: 1 };
              const workshopUnlock = typeof wsProgress === 'object' ? (wsProgress.practice || 1) : wsProgress;
              const lessonsUnlock = typeof wsProgress === 'object' ? (wsProgress.lessons || 1) : 1;
              const completedLessons = wsProgress.completedLessons || {};
              const completedPractice = wsProgress.completedPractice || {};
              const hasLevels = !meta.forthcoming && levelsList.length > 0;
              const hasLessons = !meta.forthcoming && ws.lessonsList?.length > 0;

              return (
                <div
                  key={id}
                  className={`category-block ${meta.forthcoming ? 'forthcoming' : ''}`}
                  onMouseEnter={() => {
                    setHoveredDescription(shortDesc);
                    if (imageUrl) setCurrentCoachImg(imageUrl);
                  }}
                  onMouseLeave={() => {
                    setCurrentCoachImg(coachImg);
                    setHoveredDescription(t('home.welcome'));
                  }}
                  style={{ borderTop: `4px solid ${color}`, paddingTop: '15px', cursor: hasLevels ? 'pointer' : 'default', transition: 'all 0.3s' }}
                  onClick={() => hasLevels && onWorkshopSelect(id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ color: 'var(--text)', margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
                      {hasLevels ? (
                        <button type="button" className="ws-title-btn" onClick={(e) => { e.stopPropagation(); onWorkshopSelect(id); }} aria-label={`${t('home.a11y.openWorkshop')} ${title}`}>{title}</button>
                      ) : title}
                    </h3>
                    {meta.forthcoming && <span className="tag-soon">{t('home.soon')}</span>}
                  </div>
                  {hasLevels || hasLessons ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Lessons row */}
                      {hasLessons && (
                        <div className="levels-row" style={{ alignItems: 'center' }}>
                          <BookIcon color={color} style={{ marginRight: '10px', transform: 'scale(0.75)', transformOrigin: 'left center' }} />
                          {ws.lessonsList.map((les) => {
                            const isLocked = les.order > lessonsUnlock;
                            const lessonDiffs = Array.isArray(completedLessons)
                              ? (completedLessons.includes(les.order) ? ['MEDIUM'] : [])
                              : (completedLessons[les.order] || []);
                            const isDone = lessonDiffs.length > 0;
                            const lesText = pickText(les, language);
                            const lesTitle = lesText?.title;
                            const lesDesc = lesText?.short_desc || lesText?.description;
                            return (
                              <motion.button
                                type="button"
                                key={les.id}
                                disabled={isLocked}
                                aria-label={isLocked ? `${title}, ${t('home.a11y.lesson')} ${les.order}, ${t('home.a11y.locked')}` : `${title}, ${t('home.a11y.lesson')} ${les.order} : ${lesTitle}`}
                                whileHover={!isLocked ? { scale: 1.1, backgroundColor: color, color: '#fff' } : {}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isLocked) onStartLesson(id, les.order);
                                }}
                                onMouseEnter={(e) => {
                                  e.stopPropagation();
                                  if (!isLocked) setHoveredDescription(`${lesTitle} : ${lesDesc}`);
                                }}
                                onFocus={() => { if (!isLocked) setHoveredDescription(`${lesTitle} : ${lesDesc}`); }}
                                title={isLocked ? undefined : lesTitle}
                                className={`level-btn ${isLocked ? 'locked' : ''} ${isDone ? 'completed' : ''}`}
                                style={{ fontSize: '0.7rem', fontWeight: 900, position: 'relative' }}
                              >
                                {isLocked ? '?' : `L${les.order}`}
                                {lessonDiffs.length > 0 && (
                                  <span className="level-btn-diffs">
                                    {lessonDiffs.map((d) => (
                                      <span key={d} style={{ background: DIFF_COLORS[d] }} className="level-btn-diff-dot" />
                                    ))}
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                      {/* Practice row */}
                      {hasLevels && (
                        <div className="levels-row" style={{ alignItems: 'center' }}>
                          {id === 'beatmatching' && (
                            <Locomotive color={color} style={{ marginRight: '15px', marginLeft: '-12px', transform: 'scale(0.7)' }} />
                          )}
                          {id === 'eq' && (
                            <Potard color={color} size={33} style={{ marginRight: '20px', filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.1))' }} />
                          )}
                          {id === 'effets' && (
                            <FxIcon color={color} style={{ marginRight: '20px', transform: 'scale(0.85)' }} />
                          )}
                          {id === 'digging' && (
                            <CrateIcon color={color} style={{ marginRight: '20px', transform: 'scale(0.85)' }} />
                          )}
                          {id === 'harmonies' && (
                            <HarmonyIcon color={color} style={{ marginRight: '20px', transform: 'scale(0.9)' }} />
                          )}
                          {id === 'reading_crowd' && (
                            <CrowdIcon color={color} style={{ marginRight: '20px', transform: 'scale(0.85)' }} />
                          )}
                          {levelsList.map((lvl) => {
                            const isLocked = lvl.order > workshopUnlock;
                            const diffs = completedPractice[lvl.order] || [];
                            const lvlText = pickText(lvl, language);
                            const lvlTitle = lvlText?.title;
                            const lvlDesc = lvlText?.short_desc || lvlText?.description;
                            return (
                              <motion.button
                                type="button"
                                key={lvl.id}
                                disabled={isLocked}
                                aria-label={isLocked ? `${title}, ${t('home.a11y.level')} ${lvl.order}, ${t('home.a11y.locked')}` : `${title}, ${t('home.a11y.level')} ${lvl.order} : ${lvlTitle}`}
                                whileHover={!isLocked ? { scale: 1.1, backgroundColor: color, color: '#fff' } : {}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isLocked) onStartLevel(id, lvl.order, difficulty);
                                }}
                                onMouseEnter={(e) => {
                                  e.stopPropagation();
                                  if (!isLocked) setHoveredDescription(`${lvlTitle} : ${lvlDesc}`);
                                }}
                                onFocus={() => { if (!isLocked) setHoveredDescription(`${lvlTitle} : ${lvlDesc}`); }}
                                title={isLocked ? undefined : lvlTitle}
                                className={`level-btn ${isLocked ? 'locked' : ''} ${diffs.length > 0 ? 'completed' : ''}`}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  gap: '2px',
                                  paddingTop: id === 'beatmatching' && !isLocked ? '10px' : '0',
                                  position: 'relative',
                                }}
                              >
                                {isLocked ? '?' : (
                                  <>
                                    {id === 'beatmatching' && (
                                      <Locomotive
                                        color={color}
                                        style={{ transform: 'scale(0.35)', height: '0px', width: '0px', marginBottom: '15px' }}
                                      />
                                    )}
                                    {id === 'eq' && (
                                      <Potard
                                        color={color}
                                        style={{ transform: 'scale(0.35)', height: '0px', width: '0px', marginBottom: '15px' }}
                                      />
                                    )}
                                    {id === 'effets' && (
                                      <FxIcon
                                        color={color}
                                        style={{ transform: 'scale(0.35)', height: '0px', width: '0px', marginBottom: '15px' }}
                                      />
                                    )}
                                    {id === 'digging' && (
                                      <CrateIcon
                                        color={color}
                                        style={{ transform: 'scale(0.35)', height: '0px', width: '0px', marginBottom: '15px' }}
                                      />
                                    )}
                                    {id === 'harmonies' && (
                                      <HarmonyIcon
                                        color={color}
                                        style={{ transform: 'scale(0.55)', height: '0px', width: '0px', marginBottom: '15px' }}
                                      />
                                    )}
                                    {id === 'reading_crowd' && (
                                      <CrowdIcon
                                        color={color}
                                        style={{ transform: 'scale(0.55)', height: '0px', width: '0px', marginBottom: '15px' }}
                                      />
                                    )}
                                    <span style={{ fontSize: '1.1rem' }}>{lvl.order}</span>
                                    {diffs.length > 0 && (
                                      <span className="level-btn-diffs">
                                        {diffs.map((d) => (
                                          <span key={d} style={{ background: DIFF_COLORS[d] }} className="level-btn-diff-dot" />
                                        ))}
                                      </span>
                                    )}
                                  </>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="forthcoming-line" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mystery-box safe-box">
          <img
            src={mysteryImg}
            alt="Agent Patrick"
            loading="lazy"
            className="safe-agent-reveal"
            aria-hidden="true"
          />

          <div className="safe-frame">
            <span className="safe-rivet safe-rivet-tl" />
            <span className="safe-rivet safe-rivet-tr" />
            <span className="safe-rivet safe-rivet-bl" />
            <span className="safe-rivet safe-rivet-br" />

            <div className="vault-title-banner">
              <span className="vault-title-text">{t('home.mysteriesTitle')}</span>
            </div>

            <div className="safe-dial" aria-hidden="true">
              <div className="safe-dial-inner">
                <span className="safe-dial-tick" />
                <span className="safe-dial-handle" />
              </div>
            </div>

            <div className="vault-grid">
              {VAULT_ITEMS.map((item) => {
                const isUnlocked = vaultUnlocked.includes(item.id);
                const label = language === 'fr' ? item.labelFr : item.labelEn;
                const desc = language === 'fr' ? item.descFr : item.descEn;
                return (
                  <VaultCell
                    key={item.id}
                    interactive={isUnlocked && item.isBooth}
                    className={`vault-square ${isUnlocked ? 'vault-unlocked' : 'vault-locked'}`}
                    onMouseEnter={() => setHoveredDescription(isUnlocked ? `${label} : ${desc}` : (language === 'fr' ? 'Entrez le code secret...' : 'Enter the secret code...'))}
                    onMouseLeave={() => setHoveredDescription(t('home.welcome'))}
                    onClick={() => {
                      if (isUnlocked && item.isBooth) onStartBooth();
                    }}
                    style={{ cursor: isUnlocked && item.isBooth ? 'pointer' : 'default' }}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="vault-square-label">{label}</span>
                        {item.isBooth && (
                          <span className="vault-booth-cta">{language === 'fr' ? 'ENTRER' : 'ENTER'}</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="vault-square-lock">?</span>
                        <div className="vault-hatch" />
                      </>
                    )}
                  </VaultCell>
                );
              })}
            </div>

            <div className="secret-input-wrapper" style={{ marginTop: '14px', position: 'relative' }}>
            {vaultFeedback ? (
              <motion.div
                key={vaultFeedback}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="vault-feedback"
              >
                {vaultFeedback}
              </motion.div>
            ) : (
              <>
                <div className="secret-input-field">
                  <svg className="secret-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    type="password"
                    placeholder={language === 'fr' ? "Code secret..." : "Secret code..."}
                    value={secretCode}
                    onChange={(e) => handleSecretCode(e.target.value)}
                    className="secret-input"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div className="secret-input-line" />
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      <p className="home-disclaimer">{t('home.disclaimer')}</p>

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-container.premium {
          background: var(--surface);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 12px 24px 20px 24px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .home-main-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.3fr 1fr;
          flex: 1;
          align-items: start;
          justify-content: center;
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
        .home-banner {
          margin-bottom: 8px;
          padding: 0;
        }
        .banner-logo-container {
          max-width: 280px;
          margin: 0 auto;
          position: relative;
        }
        /* Logo vectoriel (src/assets/logo.svg) utilisé comme masque : il prend la couleur de texte
           de l'ambiance (encre le jour, craie le soir et la nuit), net à toutes les tailles */
        .banner-logo {
          display: block;
          width: 100%;
          aspect-ratio: 3516 / 2000;
          background-color: var(--text);
          -webkit-mask: var(--logo-url) center / contain no-repeat;
          mask: var(--logo-url) center / contain no-repeat;
          transition: background-color 400ms ease;
        }
        .banner-accent-line {
          height: 2px;
          background: #5DADE2;
          width: 120px;
          margin: 6px auto 0;
          border-radius: 10px;
          opacity: 0.5;
        }
        .coach-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          min-width: 0;
        }
        .coach-img-home {
          width: 100%;
          max-width: 220px;
          filter: var(--sticker-shadow);
          will-change: transform;
        }
        .continue-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          margin-top: 14px;
          max-width: 280px;
          white-space: normal;
          text-align: center;
          transform: rotate(-1.5deg);
        }
        .continue-cta:hover { transform: rotate(0deg) translateY(-2px); }
        .continue-cta-label { font-size: 1.25rem; }
        .continue-cta-sub { font-size: 0.8rem; font-weight: 700; opacity: 0.85; line-height: 1.25; }
        .coach-bubble-home {
          background: #fff;
          color: #333;
          border: 3px solid #333;
          border-radius: 20px;
          padding: 14px 18px;
          font-weight: bold;
          font-family: 'Patrick Hand', cursive;
          max-width: 300px;
          text-align: center;
          margin-bottom: 14px;
          box-shadow: 6px 6px 0 rgba(0,0,0,0.1);
          position: relative;
          line-height: 1.35;
          font-size: 1rem;
        }
        .bubble-tail-home {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 15px solid #333;
        }
        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }
        .difficulty-row {
          display: flex;
          gap: 10px;
        }
        .diff-btn {
          background: #fff;
          color: #333;
          border: 3px solid #333;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 900;
          font-family: inherit;
          transition: all 0.2s;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
          letter-spacing: 1px;
          font-size: 0.9rem;
        }
        .diff-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(0,0,0,0.1);
        }
        .diff-btn.active {
          background: #5DADE2;
          color: #2b2b2b;
          border-color: #5DADE2;
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0 rgba(0,0,0,0);
        }
        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .categories-container h2 {
          font-size: 0.7rem;
          letter-spacing: 2px;
          margin-bottom: 2px;
          opacity: 0.8;
          text-transform: uppercase;
        }
        .category-block {
          padding-top: 10px !important;
        }
        .category-block h3 {
          font-size: 0.95rem !important;
        }
        .levels-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .ws-title-btn { font: inherit; color: inherit; background: none; border: none; padding: 0; cursor: pointer; text-align: left; }
        .ws-title-btn:hover { text-decoration: underline; text-decoration-thickness: 3px; text-underline-offset: 4px; }
        .level-btn {
          font: inherit;
          background-color: #fff;
          padding: 0;
          width: 44px;
          height: 44px;
          border: 3px solid #333;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          background: #fff;
          box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
        }
        .level-btn:hover:not(.locked) {
          transform: rotate(-3deg) scale(1.1);
        }
        .level-btn.locked {
          opacity: 0.3;
          cursor: not-allowed;
          border: 3px dashed #999;
          box-shadow: none;
          background: #eee;
        }
        .level-btn.completed {
          border-color: #27ae60;
        }
        .level-btn-check {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #27ae60;
          border: 2px solid #fff;
        }
        .level-btn-diffs {
          display: flex;
          gap: 2px;
          justify-content: center;
        }
        .level-btn-diff-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .tag-soon {
          background: #f0f0f0;
          color: #aaa;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .forthcoming-line {
          height: 2px;
          background: #f5f5f5;
          width: 50px;
          margin-top: 5px;
        }

        .mystery-box.safe-box {
          margin-top: 24px;
          position: relative;
          min-width: 0;
          padding: 0;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .safe-agent-reveal {
          position: absolute;
          bottom: calc(100% - 20px);
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          width: 180px;
          height: auto;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease, transform 0.35s ease;
          filter: var(--sticker-shadow);
          z-index: 2;
        }
        .mystery-box.safe-box:hover .safe-agent-reveal {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .safe-frame {
          position: relative;
          padding: 16px 16px 16px 16px;
          border-radius: 16px;
          border: 2px solid rgba(160,160,160,0.4);
          background: rgba(100, 100, 100, 0.25);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow:
            inset 0 0 0 1px rgba(180,180,180,0.3),
            4px 4px 0 rgba(0,0,0,0.2);
          color: #eee;
          z-index: 3;
        }

        .safe-rivet {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #c0c0c0, #666 55%, #2a2a2a 100%);
          box-shadow: inset 0 0 2px rgba(0,0,0,0.5);
        }
        .safe-rivet-tl { top: 8px; left: 8px; }
        .safe-rivet-tr { top: 8px; right: 8px; }
        .safe-rivet-bl { bottom: 8px; left: 8px; }
        .safe-rivet-br { bottom: 8px; right: 8px; }

        .safe-dial {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          margin: 8px auto 10px auto;
          background: radial-gradient(circle at 35% 30%, #d0d0d0, #888 55%, #3a3a3a 100%);
          border: 2px solid #111;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.5), 0 1px 0 rgba(0,0,0,0.4);
          position: relative;
        }
        .safe-dial-inner {
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #aaa, #555 60%, #222 100%);
          border: 1px solid #111;
        }
        .safe-dial-tick {
          position: absolute;
          top: 3px; left: 50%;
          width: 2px; height: 7px;
          background: #D4AF37;
          transform: translateX(-50%);
          border-radius: 1px;
        }
        .safe-dial-handle {
          position: absolute;
          top: 50%; left: 50%;
          width: 34px; height: 4px;
          background: linear-gradient(180deg, #111, #3a3a3a);
          transform: translate(-50%, -50%);
          border-radius: 2px;
        }

        .vault-title-banner {
          text-align: center;
          margin-bottom: 10px;
          position: relative;
        }
        .vault-title-text {
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          background: #0d0d0d;
          color: #D4AF37;
          padding: 3px 10px;
          border-radius: 3px;
          display: inline-block;
          border: 1px solid #D4AF37;
        }

        .vault-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vault-square {
          border: 1px solid rgba(160,160,160,0.2);
          border-radius: 6px;
          padding: 7px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
          min-height: 40px;
          box-shadow: inset 0 0 6px rgba(0,0,0,0.4);
          background: rgba(255,255,255,0.08);
          color: #eee;
          transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        }

        .vault-locked {
          background: rgba(255,255,255,0.04);
          border-style: solid;
          color: #aaa;
        }

        .vault-unlocked {
          background: linear-gradient(180deg, #2a2a2a, #1c1c1c);
        }

        .vault-unlocked:hover {
          background: #D4AF37;
          color: #1a1a1a;
          border-color: #D4AF37;
        }

        .vault-square-lock {
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--text-muted);
          font-family: 'Patrick Hand', cursive;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .vault-hatch {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 6px,
            rgba(255,255,255,0.03) 6px,
            rgba(255,255,255,0.03) 7px
          );
          pointer-events: none;
        }

        .vault-square-label {
          font-size: 0.82rem;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
          flex: 1;
        }

        .vault-booth-cta {
          font-size: 0.7rem;
          font-weight: 900;
          background: #0d0d0d;
          color: #D4AF37;
          padding: 3px 7px;
          border-radius: 3px;
          letter-spacing: 1px;
          flex-shrink: 0;
          border: 1px solid #D4AF37;
        }
        .vault-unlocked:hover .vault-booth-cta {
          background: #1a1a1a;
          color: #D4AF37;
        }

        .vault-feedback {
          font-family: 'Patrick Hand', cursive;
          font-size: 1rem;
          font-weight: 900;
          text-align: center;
          padding: 10px;
          color: #D4AF37;
          letter-spacing: 1px;
        }

        @media (max-width: 1100px) {
          .home-main-layout {
            grid-template-columns: 1fr 1.2fr;
            gap: 24px;
          }
          .mystery-box {
            grid-column: 1 / -1;
            margin-top: 60px;
          }
        }
        @media (max-width: 768px) {
          .home-main-layout {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 10px 0;
            overflow: visible;
          }
          .coach-section {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .coach-bubble-home {
            order: 1;
            margin-bottom: 20px;
            width: 100%;
            max-width: 100%;
            font-size: 1rem;
            padding: 15px;
          }
          .bubble-tail-home {
            bottom: -15px;
            top: auto;
            border-top: 15px solid #333;
            border-bottom: none;
          }
          .continue-cta { order: 3; }
          .coach-img-home {
            order: 2;
            max-width: 140px;
          }
          .banner-logo-container { max-width: 220px; }
          .nav-section { gap: 16px; width: 100%; }
          .mystery-box { margin-top: 60px; }
        }
        @media (max-height: 820px) {
          .home-container.premium { padding: 8px 20px 12px 20px; }
          .banner-logo-container { max-width: 220px; }
          .home-banner { margin-bottom: 4px; }
          .coach-img-home { max-width: 180px; }
          .coach-bubble-home { font-size: 0.9rem; padding: 10px 14px; margin-bottom: 10px; }
          .mystery-agent-img { width: 110px; }
          .mystery-agent-container { margin-top: -55px; margin-bottom: 4px; }
          .mystery-box { padding: 10px 12px 12px 12px; margin-top: 34px; }
          .vault-square { min-height: 44px; padding: 7px 10px; }
          .vault-square-label { font-size: 0.75rem; }
          .diff-btn { padding: 6px 12px; font-size: 0.8rem; }
          .level-btn { width: 38px; height: 38px; font-size: 0.9rem; }
          .home-main-layout { gap: 22px; }
          .nav-section { gap: 12px; }
        }

        .secret-input-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .secret-input-field {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .secret-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #D4AF37;
          pointer-events: none;
        }
        .secret-input {
          background: rgba(0,0,0,0.75);
          border: 1px solid rgba(212,175,55,0.5);
          border-radius: 6px;
          padding: 10px 12px 10px 38px;
          outline: none;
          font-family: 'Patrick Hand', cursive;
          font-size: 1.05rem;
          color: #D4AF37;
          width: 100%;
          text-align: left;
          transition: all 0.3s;
          letter-spacing: 2px;
        }
        .secret-input::placeholder {
          color: rgba(212,175,55,0.9);
        }
        .secret-input:focus {
          border-color: #D4AF37;
          background: rgba(0,0,0,0.85);
        }
        .secret-input:focus-visible {
          outline: 2px solid #D4AF37;
          outline-offset: 2px;
        }
        .secret-input-line {
          height: 1px;
          background: #D4AF37;
          width: 0;
          transition: width 0.3s;
        }
        .secret-input-field:focus-within + .secret-input-line {
          width: 100%;
        }
        .home-disclaimer {
          max-width: 900px;
          margin: 24px auto 8px auto;
          padding: 10px 18px;
          font-size: 0.85rem;
          line-height: 1.5;
          text-align: center;
          color: var(--text-muted, #6b6b6b);
          font-style: italic;
        }
      `}} />
    </div>
  );
};

export default Home;
