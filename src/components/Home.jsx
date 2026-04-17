import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevelPopup from './LevelPopup';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';
import { LanguageContext } from '../hooks/LanguageContext';
import coachImg from '../assets/coach_patrick.png';
import beatmatchingImg from '../assets/beatmatching_patrick.png';
import harmonyImg from '../assets/harmony_patrick.png';
import effectsImg from '../assets/effects_patrick.png';
import eqImg from '../assets/eq_patrick.png';
import diggingImg from '../assets/digging_patrick.png';
import mysteryImg from '../assets/secret_agent_patrick.png';
import easyImg from '../assets/easy_patrick.png';
import mediumImg from '../assets/medium_patrick.png';
import proImg from '../assets/pro_patrick.png';
import bannerImg from '../assets/banner.png';
import frFlagImg from '../assets/fr_flag.png';
import ukFlagImg from '../assets/uk_flag.png';
import AudioVisualizer from './AudioVisualizer';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Locomotive from './Locomotive';

const Home = ({ onStart, unlockedLevel = 1, initialDifficulty = null, initialLevel = null, onPersistState }) => {
  const { language, setLanguage, t } = useContext(LanguageContext);
  
  const [audioCtx] = useState(() => {
    const ctx = new MagicAudioContext();
    ctx.init(); // Silent init
    return ctx;
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);

  useEffect(() => {
    if (onPersistState) onPersistState(selectedLevel, selectedDifficulty);
  }, [selectedLevel, selectedDifficulty, onPersistState]);

  const [hoveredDescription, setHoveredDescription] = useState(t('home.welcome'));
  const [currentCoachImg, setCurrentCoachImg] = useState(coachImg);

  // Update welcome message if language changes and we are on the default message
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

  const workshopSections = [
    {
      id: 'beatmatching',
      title: t('home.categories.beatmatching.title'),
      desc: t('home.categories.beatmatching.desc'),
      color: "#5DADE2",
      image: beatmatchingImg,
      levels: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    { 
      id: 'harmonies', 
      title: t('home.categories.harmonies.title'), 
      desc: t('home.categories.harmonies.desc'), 
      color: "#999", 
      image: harmonyImg,
      forthcoming: true 
    },
    { 
      id: 'eq', 
      title: t('home.categories.eq.title'), 
      desc: t('home.categories.eq.desc'), 
      color: "#999", 
      image: eqImg,
      forthcoming: true 
    },
    { 
      id: 'effets', 
      title: t('home.categories.effets.title'), 
      desc: t('home.categories.effets.desc'), 
      color: "#999", 
      image: effectsImg,
      forthcoming: true 
    },
    { 
      id: 'digging', 
      title: t('home.categories.digging.title'), 
      desc: t('home.categories.digging.desc'), 
      color: "#999", 
      image: diggingImg,
      forthcoming: true 
    }
  ];

  const mysterySections = t('home.mysterySections');
  const workshops = t('home.workshops');

  return (
    <div className="home-container premium" style={{ position: 'relative' }}>
      
      {/* Language Selector */}
      <div className="language-selector" style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, display: 'flex', gap: '10px' }}>
        <motion.img 
          src={frFlagImg} 
          alt="FR"
          style={{ width: '40px', height: 'auto', cursor: 'pointer', filter: language === 'fr' ? 'none' : 'grayscale(100%) opacity(0.5)', transition: 'all 0.3s' }}
          onClick={() => setLanguage('fr')}
          whileHover={{ scale: 1.1 }}
        />
        <motion.img 
          src={ukFlagImg} 
          alt="EN"
          style={{ width: '40px', height: 'auto', cursor: 'pointer', filter: language === 'en' ? 'none' : 'grayscale(100%) opacity(0.5)', transition: 'all 0.3s' }}
          onClick={() => setLanguage('en')}
          whileHover={{ scale: 1.1 }}
        />
      </div>

      {/* Dynamic Background Visualizer & Watermark */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: -1, opacity: 0.15, pointerEvents: 'none', overflow: 'hidden' }}>
        <h1 style={{ 
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
        </h1>
        <AudioVisualizer audioCtx={audioCtx} color="#4ecdc4" />
      </div>

      {/* Header Banner Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="home-banner"
         style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
      >
        <div className="banner-logo-container">
          <img src={bannerImg} alt="DJ Patrick School Banner" className="banner-logo" />
        </div>
        <div className="banner-accent-line" />
      </motion.div>

      <div className="home-main-layout">
        {/* Section Coach Patrick Interactive */}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
          />
        </div>

        {/* Navigation Section */}
        <div className="nav-section">
          <div className="difficulty-row">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
              <button
                key={key}
                className={`diff-btn ${selectedDifficulty === key ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(key)}
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
            <h3>{t('home.workshopsTitle')}</h3>
            {workshopSections.map((cat) => (
              <div 
                key={cat.id} 
                className={`category-block ${cat.forthcoming ? 'forthcoming' : ''}`} 
                onMouseEnter={() => {
                  setHoveredDescription(cat.desc);
                  setCurrentCoachImg(cat.image);
                }}
                onMouseLeave={() => {
                  setCurrentCoachImg(coachImg);
                  setHoveredDescription(t('home.welcome'));
                }}
                style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ color: cat.color, margin: 0, fontSize: '1rem' }}>{cat.title}</h4>
                  {cat.forthcoming && <span className="tag-soon">{t('home.soon')}</span>}
                </div>
                {!cat.forthcoming ? (
                  <div className="levels-row" style={{ alignItems: 'center' }}>
                    {cat.id === 'beatmatching' && (
                      <Locomotive color="#5DADE2" style={{ marginRight: '15px', transform: 'scale(0.8)' }} />
                    )}
                    {cat.levels.map(l => {
                      const isLocked = l > unlockedLevel;
                      return (
                        <motion.div
                          key={l}
                          whileHover={!isLocked ? { scale: 1.1, backgroundColor: '#5DADE2', color: '#fff' } : {}}
                          onClick={() => !isLocked && setSelectedLevel(l)}
                          onMouseEnter={() => !isLocked && setHoveredDescription(`${workshops[l].title} : ${workshops[l].desc}`)}
                          className={`level-btn ${isLocked ? 'locked' : ''}`}
                          style={{
                             display: 'flex',
                             flexDirection: 'column',
                             justifyContent: 'center',
                             alignItems: 'center',
                             gap: '2px',
                             paddingTop: cat.id === 'beatmatching' && !isLocked ? '10px' : '0'
                          }}
                        >
                          {isLocked ? '?' : (
                            <>
                              {cat.id === 'beatmatching' && (
                                <Locomotive 
                                  color="#5DADE2" 
                                  style={{ 
                                    transform: 'scale(0.35)', 
                                    height: '0px', 
                                    width: '0px',
                                    marginBottom: '15px' 
                                  }} 
                                />
                              )}
                              <span style={{ fontSize: cat.id === 'beatmatching' ? '1rem' : '1.2rem' }}>{l}</span>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="forthcoming-line" />
                )}
              </div>
            ))}
          </div>

          {/* Mystery Sections Box */}
          <div className="mystery-box">
            <div className="mystery-agent-container">
              <motion.img 
                src={mysteryImg} 
                alt="Agent Patrick" 
                className="mystery-agent-img"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              />
            </div>
            <h4>{t('home.mysteriesTitle')}</h4>
            <div className="mystery-grid">
              {mysterySections.map((sec, idx) => (
                <div 
                  key={idx} 
                  className="mystery-item" 
                  onMouseEnter={() => {
                    setHoveredDescription(sec.desc);
                  }}
                  onMouseLeave={() => {
                     setHoveredDescription(t('home.welcome'));
                  }}
                >
                  <span className="mystery-icon">🔒</span>
                  <span>{sec.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Selection Popup */}
      <AnimatePresence>
        {selectedLevel && (
          <LevelPopup 
            level={selectedLevel}
            difficulty={selectedDifficulty}
            onCancel={() => setSelectedLevel(null)}
            onStart={() => onStart(selectedLevel, selectedDifficulty)}
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-container.premium {
          background: #fff;
          color: #333;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px 20px 100px 20px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .home-main-layout {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          gap: 60px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
        .home-banner {
          margin-bottom: 20px;
          padding: 10px;
        }
        .banner-logo-container {
          max-width: 400px;
          margin: 0 auto;
          position: relative;
        }
        .banner-logo {
          width: 100%;
          filter: none;
          mix-blend-mode: multiply;
        }
        .banner-accent-line {
          height: 2px;
          background: #5DADE2;
          width: 150px;
          margin: 10px auto 0;
          border-radius: 10px;
          opacity: 0.5;
        }
        .coach-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .coach-img-home {
          width: 100%;
          max-width: 280px;
          filter: none;
          mix-blend-mode: multiply;
        }
        .coach-bubble-home {
          background: #fff;
          border: 4px solid #333;
          border-radius: 25px;
          padding: 25px;
          font-weight: bold;
          font-family: 'Patrick Hand', cursive;
          max-width: 350px;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: 8px 8px 0 rgba(0,0,0,0.1);
          position: relative;
          line-height: 1.4;
          font-size: 1.1rem;
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
          flex: 1.5;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .difficulty-row {
          display: flex;
          gap: 15px;
        }
        .diff-btn {
          background: #fff;
          border: 3px solid #333;
          padding: 12px 24px;
          border-radius: 15px;
          cursor: pointer;
          font-weight: 900;
          font-family: inherit;
          transition: all 0.2s;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
          letter-spacing: 1px;
        }
        .diff-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(0,0,0,0.1);
        }
        .diff-btn.active {
          background: #5DADE2;
          color: #fff;
          border-color: #5DADE2;
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0 rgba(0,0,0,0);
        }
        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .category-block h3 {
          font-size: 0.8rem;
          letter-spacing: 2px;
          margin-bottom: 10px;
          opacity: 0.8;
          text-transform: uppercase;
        }
        .levels-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .level-btn {
          width: 55px;
          height: 55px;
          border: 3px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: 900;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          background: #fff;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
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
        
        .tag-soon {
          background: #f0f0f0;
          color: #aaa;
          font-size: 0.5rem;
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

        .mystery-box {
          margin-top: 15vh; /* Added space to force scrolling to reach mysteries */
          border: 4px solid #333;
          border-radius: 40px;
          padding: 40px;
          background: #fafafa;
          box-shadow: 15px 15px 0 rgba(0,0,0,0.05);
          position: relative;
        }

        .mystery-agent-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          margin-top: -100px; /* Overlap slightly with the spacing */
        }

        .mystery-agent-img {
          width: 200px;
          height: auto;
          mix-blend-mode: multiply;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
        }

        .mystery-box h4 {
          font-size: 0.9rem;
          margin-bottom: 20px;
          letter-spacing: 2px;
          text-align: center;
          color: #333;
        }

        .mystery-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mystery-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px;
          font-size: 1.1rem;
          font-weight: bold;
          color: #888;
          border-bottom: 1px dashed #eee;
          cursor: help;
        }

        .mystery-icon {
          font-size: 1.2rem;
          opacity: 0.5;
        }
        
        .home-header h1 {
          font-family: inherit;
          font-size: clamp(3rem, 10vw, 6rem);
          margin-bottom: 20px;
          color: #333;
          text-shadow: 4px 4px 0 rgba(0,0,0,0.05);
          letter-spacing: -2px;
          font-weight: 900;
        }

        @media (max-width: 768px) {
          .home-main-layout { 
            flex-direction: column; 
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
            order: 1; /* First on mobile */
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
          .coach-img-home { 
            order: 2; /* Second on mobile */
            max-width: 140px; 
          }
          .banner-logo-container { max-width: 250px; }
          .nav-section { gap: 20px; width: 100%; }
        }
      `}} />
    </div>
  );
};

export default Home;
