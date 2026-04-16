import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DIFFICULTY_SETTINGS } from '../constants/difficulty';

const Home = ({ onStart, unlockedLevel = 1 }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');

  const workshops = [
    { id: 1, title: "Lancement", icon: "🏁", desc: "Maîtrise le timing du départ." },
    { id: 2, title: "Moteur", icon: "⚙️", desc: "Ajuste la vitesse (Pitch)." },
    { id: 3, title: "Rythme", icon: "🔥", desc: "Aligne les mesures (4 temps)." },
    { id: 4, title: "Boucle", icon: "🔄", desc: "Synchronisation sur 8 temps." },
    { id: 5, title: "Transition", icon: "🎧", desc: "Intro vs Outro." },
    { id: 6, title: "Blind Chief", icon: "🌑", desc: "Calage à l'oreille sans BPM." },
    { id: 7, title: "Puriste", icon: "🧘", desc: "Zéro aide, CUE & Pitch." },
  ];

  return (
    <div className="home-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="home-header"
      >
        <h1>DJ TEACHER</h1>
        <p>Maîtrise l'art du calage tempo avec les trains du rythme</p>
      </motion.div>

      <div className="difficulty-selector">
        <h2 style={{ marginBottom: '20px', color: '#ff9f43' }}>1. Choisis ta difficulté</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`difficulty-card ${selectedDifficulty === key ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(key)}
            >
              <h3 style={{ color: selectedDifficulty === key ? '#ff9f43' : 'white' }}>{setting.name}</h3>
              <p>
                {key === 'EASY' && "Idéal pour débuter (40ms)"}
                {key === 'MEDIUM' && "Challenge standard (20ms)"}
                {key === 'PRO' && "Précision chirurgicale (4ms)"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mission-selector" style={{ marginTop: '50px', width: '100%', maxWidth: '1000px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#4ecdc4' }}>2. Sélectionne ta mission</h2>
        <div className="mission-grid">
          {workshops.map((w) => {
            const isLocked = w.id > unlockedLevel;
            return (
              <motion.div
                key={w.id}
                whileHover={!isLocked ? { y: -5, background: 'rgba(255,255,255,0.1)' } : {}}
                onClick={() => !isLocked && onStart(w.id, selectedDifficulty)}
                className={`workshop-card ${isLocked ? 'locked' : ''}`}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer', position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: isLocked ? 0.3 : 1 }}>
                  <span style={{ fontSize: '2.5rem' }}>{isLocked ? '🔒' : w.icon}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Mission {w.id}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6 }}>{w.title}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', margin: '10px 0 0 0', lineHeight: '1.4', opacity: isLocked ? 0.3 : 1 }}>{w.desc}</p>
                {!isLocked && <div style={{ marginTop: 'auto', textAlign: 'right', fontSize: '1.5rem', opacity: 0.3 }}>→</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
