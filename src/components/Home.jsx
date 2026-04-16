import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';
import coachImg from '../assets/coach_patrick.png';
import AudioVisualizer from './AudioVisualizer';
import { MagicAudioContext } from '../audio/MagicAudioContext';

const Home = ({ onStart, unlockedLevel = 1 }) => {
  const [audioCtx] = useState(() => {
    const ctx = new MagicAudioContext();
    ctx.init(); // Silent init
    return ctx;
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [hoveredDescription, setHoveredDescription] = useState("Bienvenue à l'école de DJing ! Choisis ta section pour commencer.");

  const difficultyInfo = {
    EASY: "Parfait pour débuter. Tolérance généreuse, feedback visuel complet et maintien court (3s).",
    MEDIUM: "Le défi intermédiaire. Tolérance réduite, aucun indicateur visuel de précision. Maintien de 4s.",
    PRO: "Réservé aux experts. Tolérance millimétrée, aucun feedback visuel. Maintien de 5s exigé."
  };

  const categories = [
    {
      id: 'beatmatching',
      title: "BEATMATCHING",
      desc: "L'art d'aligner les tempos parfaits.",
      color: "#ff6b6b",
      levels: [1, 2, 3, 4, 5, 6, 7]
    }
  ];

  const workshops = {
    1: { 
      title: "Lancement Parfait", 
      desc: "Les deux trains roulent à la même vitesse. Lance le Train B au bon moment !",
      details: "Focus : Timing du bouton Play. Vitesse : 120 BPM."
    },
    2: { 
      title: "Contrôle du Moteur", 
      desc: "Le Train B roule à une vitesse différente. Ajuste-la pour qu'elle corresponde au Train A.",
      details: "Focus : Utilisation du Pitch. 120 vs 135 BPM."
    },
    3: { 
      title: "Le Rythme Vrai", 
      desc: "Fini le kick seul. Découvre comment le rythme s'organise dans un vrai morceau.",
      details: "Focus : Écoute de la Snare sur le 2ème temps."
    },
    4: { 
      title: "La Boucle", 
      desc: "Aligne les boucles ET les wagons pour que les temps forts se synchronisent.",
      details: "Focus : Calage structurel (8 temps)."
    },
    5: { 
      title: "La Transition", 
      desc: "Le moment critique. Démarre l'Intro du Train B exactement sur l'Outro du Train A.",
      details: "Focus : Phrasé musical et anticipation."
    },
    6: { 
      title: "Blind Chief", 
      desc: "L'affichage du BPM a disparu. Aligne les trains visuellement et à l'oreille.",
      details: "Focus : Indépendance vis-à-vis des chiffres."
    },
    7: { 
      title: "Le Puriste", 
      desc: "Pas de BPM, et surtout PAS DE NUDGE. Aligne tout au Pitch, comme un vrai.",
      details: "Focus : Maîtrise totale du plateau."
    }
  };

  return (
    <div className="home-container premium" style={{ position: 'relative' }}>
      {/* Dynamic Background Visualizer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: -1, opacity: 0.2, pointerEvents: 'none' }}>
        <AudioVisualizer audioCtx={audioCtx} color="#4ecdc4" />
      </div>

      {/* Header compact */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="home-header" style={{ position: 'relative', zIndex: 1 }}>
        <h1>DJ PATRICK SCHOOL</h1>
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
            src={coachImg}
            alt="Coach Patrick"
            className="coach-img-home"
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
                onMouseEnter={() => setHoveredDescription(`Difficulté ${setting.name} : ${difficultyInfo[key]}`)}
              >
                {setting.name}
              </button>
            ))}
          </div>

          <div className="categories-container">
            {categories.map((cat) => (
              <div key={cat.id} className="category-block" onMouseEnter={() => setHoveredDescription(cat.desc)}>
                <h3 style={{ color: cat.color }}>{cat.title}</h3>
                <div className="levels-row">
                  {cat.levels.map(l => {
                    const isLocked = l > unlockedLevel;
                    return (
                      <motion.div
                        key={l}
                        whileHover={!isLocked ? { scale: 1.1, backgroundColor: cat.color, color: '#000' } : {}}
                        onClick={() => !isLocked && setSelectedLevel(l)}
                        onMouseEnter={() => !isLocked && setHoveredDescription(`${workshops[l].title} : ${workshops[l].desc}`)}
                        className={`level-btn ${isLocked ? 'locked' : ''}`}
                      >
                        {isLocked ? '?' : l}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level Selection Popup */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="popup-overlay" onClick={() => setSelectedLevel(null)}>
            <motion.div 
              className="level-popup"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popup-header">
                <div className="popup-level-id">NIVEAU {selectedLevel}</div>
                <div className="popup-diff-tag">{selectedDifficulty}</div>
              </div>
              
              <h1 className="popup-title">{workshops[selectedLevel].title}</h1>
              <p className="popup-desc">{workshops[selectedLevel].desc}</p>
              
              <div className="popup-details-box">
                {workshops[selectedLevel].details}
              </div>

              <div className="popup-footer">
                <button className="btn-crayon nudge-btn" onClick={() => setSelectedLevel(null)}>ANNULER</button>
                <button 
                  className="btn-crayon play-btn large" 
                  onClick={() => onStart(selectedLevel, selectedDifficulty)}
                  autoFocus
                >
                  DÉMARRER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-container.premium {
          background: #fdfaf6;
          color: #333;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow: hidden;
        }
        .home-main-layout {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          gap: 50px;
          max-width: 1200px;
          margin: 0 auto;
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
          max-width: 400px;
          filter: drop-shadow(0 20px 30px rgba(0,0,0,0.1));
        }
        .coach-bubble-home {
          background: #fff;
          border: 3px solid #333;
          border-radius: 20px;
          padding: 20px;
          font-weight: bold;
          font-family: inherit;
          max-width: 300px;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: 10px 10px 0 rgba(0,0,0,0.05);
          position: relative;
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
          background: none;
          border: 2px solid #ddd;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }
        .diff-btn.active {
          background: #333;
          color: #fff;
          border-color: #333;
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
        }
        .levels-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .level-btn {
          width: 50px;
          height: 50px;
          border: 2px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          background: #fff;
        }
        .level-btn.locked {
          opacity: 0.2;
          cursor: not-allowed;
          border-style: dashed;
        }
        @media (max-width: 768px) {
          .home-main-layout { flex-direction: column; gap: 20px; overflow-y: auto; }
          .coach-img-home { max-width: 200px; }
        }

        /* Popup Styles */
        .popup-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .level-popup {
          background: white;
          width: 100%;
          max-width: 500px;
          border: 6px solid #333;
          border-radius: 30px;
          padding: 40px;
          box-shadow: 20px 20px 0 rgba(0,0,0,0.2);
        }
        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .popup-level-id {
          font-weight: 900;
          font-size: 0.9rem;
          color: #666;
          letter-spacing: 1px;
        }
        .popup-diff-tag {
          background: #333;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: bold;
        }
        .popup-title {
          font-size: 2.5rem;
          margin: 0 0 15px 0;
          line-height: 1;
        }
        .popup-desc {
          font-size: 1.1rem;
          color: #444;
          line-height: 1.4;
          margin-bottom: 25px;
        }
        .popup-details-box {
          background: #fdfaf6;
          border: 2px dashed #ccc;
          padding: 15px;
          border-radius: 15px;
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 30px;
          font-style: italic;
        }
        .popup-footer {
          display: flex;
          gap: 15px;
        }
        .popup-footer button {
          flex: 1;
        }
      `}} />
    </div>
  );
};

export default Home;
