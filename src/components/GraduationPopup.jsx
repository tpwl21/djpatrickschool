import React from 'react';
import { motion } from 'framer-motion';
import coachImg from '../assets/coach_patrick.png';

const GraduationPopup = ({ difficulty, onBackHome }) => {
  const getPaternalAdvice = () => {
    return "Écoute-moi bien, gamin. Le beatmatching, c'est pas une science froide, c'est une question de cœur. Tu as prouvé que tu savais dompter les machines et aligner les astres. N'oublie jamais : le public ne danse pas sur des chiffres, il danse sur ta vibration. Reste humble, garde les oreilles grandes ouvertes, et fais rugir la basse. Papa Patrick est fier de toi.";
  };

  const diffNames = {
    'EASY': 'Apprenti-DJ (Easy)',
    'MEDIUM': 'Ninja du Tempo (Medium)',
    'PRO': 'Maître du Vinyle (Pro)'
  };

  return (
    <div className="graduation-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="graduation-backdrop"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="graduation-card"
      >
        <div className="grad-header">
          <div className="difficulty-stamp">{diffNames[difficulty] || difficulty}</div>
          <h1>DIPLÔME DE BEATMATCHING</h1>
        </div>

        <div className="grad-content">
          <div className="coach-pat-side">
            <motion.img 
              src={coachImg} 
              alt="Coach Patrick"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>
          
          <div className="message-side">
            <h2>Félicitations, mon grand !</h2>
            <p className="intro">
              C'est officiel. Tu as triomphé des 7 épreuves de l'atelier de Beatmatching. 
              Même avec les yeux bandés, je parie que tu l'entendrais, ce petit décalage...
            </p>
            
            <div className="paternal-advice">
              <h3>Le Conseil Ultime de Patrick :</h3>
              <p>"{getPaternalAdvice()}"</p>
              <div className="signature">Signé : Patrick.</div>
            </div>

            <button className="btn-crayon play-btn" style={{ width: '100%', fontSize: '1.8rem' }} onClick={onBackHome}>
              Retour au Menu Principal
            </button>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .graduation-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .graduation-backdrop {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255, 250, 240, 0.98);
          backdrop-filter: blur(15px);
        }

        .graduation-card {
          position: relative;
          background: white;
          width: 95%;
          max-width: 900px;
          border: 10px double #333;
          padding: 40px;
          box-shadow: 0 10px 50px rgba(0,0,0,0.2), inset 0 0 100px rgba(0,0,0,0.02);
          background-image: radial-gradient(#ddd 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .grad-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #333;
          padding-bottom: 20px;
        }

        .difficulty-stamp {
          display: inline-block;
          border: 5px solid #ff6b6b;
          color: #ff6b6b;
          padding: 8px 25px;
          font-weight: 900;
          font-size: 1.2rem;
          transform: rotate(-10deg);
          margin-bottom: 15px;
          border-radius: 5px;
          text-transform: uppercase;
        }

        .grad-header h1 {
          font-size: 3rem;
          margin: 0;
          letter-spacing: 1px;
          color: #333;
        }

        .grad-content {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .coach-pat-side img {
          width: 320px;
          filter: drop-shadow(15px 15px 0px rgba(0,0,0,0.05));
        }

        .message-side {
          flex: 1;
        }

        .message-side h2 {
          font-size: 2.2rem;
          margin-top: 0;
          color: #2c3e50;
        }

        .intro {
          font-size: 1.1rem;
          line-height: 1.5;
          color: #444;
          margin-bottom: 20px;
        }

        .paternal-advice {
          background: #222;
          color: #f1f1f1;
          padding: 30px;
          border-radius: 5px; /* Boxy look for certificate feel */
          margin: 20px 0 30px 0;
          position: relative;
          box-shadow: 10px 10px 0 #ff9f43;
        }

        .paternal-advice h3 {
          margin-top: 0;
          color: #ff9f43;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .paternal-advice p {
          font-style: italic;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .signature {
          text-align: right;
          font-family: 'Brush Script MT', cursive;
          font-size: 1.8rem;
          color: #ff9f43;
        }

        @media (max-width: 768px) {
          .grad-content { flex-direction: column; text-align: center; }
          .coach-pat-side img { width: 180px; }
          .grad-header h1 { font-size: 1.8rem; }
          .graduation-card { padding: 20px; }
        }
      `}} />
    </div>
  );
};

export default GraduationPopup;
