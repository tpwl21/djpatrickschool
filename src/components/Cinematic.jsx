import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import coachImg from '../assets/coach_patrick.png';

const Cinematic = ({ onNextLevel, onRetry, type = 'win', message = "", title = "", grade = "" }) => {
  const isWin = type === 'win';
  
  return (
    <div className="cinematic-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="cinematic-backdrop"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className={`cinematic-card ${isWin ? 'win' : 'lose'}`}
      >
        <div className="cinematic-content">
          {isWin ? (
            <div className="win-layout">
              <motion.div 
                className="coach-celebration"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={coachImg} alt="Coach Patrick" />
                <div className="speech-bubble-large">
                   <p>{message}</p>
                   <div className="bubble-tail-large" />
                </div>
              </motion.div>
              
              <div className="success-text">
                <div className="grade-badge">{grade}</div>
                <h1 className="win-title">{title || "NIVEAU RÉUSSI !"}</h1>
                <p className="win-subtitle">Ta maîtrise du mix est impressionnante.</p>
                <button className="btn-crayon play-btn large" onClick={onNextLevel}>
                  Niveau Suivant
                </button>
              </div>
            </div>
          ) : (
            <div className="lose-layout">
              <div className="lose-badge">RETRY</div>
              <h2>{title || "Le train est parti..."}</h2>
              <p>Ne baisse pas les bras, DJ ! On réessaye ?</p>
              <button className="btn-crayon nudge-btn large" onClick={onRetry}>
                Réessayer
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cinematic-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
        }

        .cinematic-backdrop {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
        }

        .cinematic-card {
          position: relative;
          background: white;
          width: 90%;
          max-width: 900px;
          border-radius: 40px;
          border: 8px solid #333;
          padding: 50px;
          box-shadow: 20px 20px 0 rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .cinematic-card.win { border-color: #ff9f43; }
        .cinematic-card.lose { border-color: #ff6b6b; }

        .win-layout {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .coach-celebration {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .coach-celebration img {
          width: 300px;
          height: auto;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
        }

        .speech-bubble-large {
          background: white;
          border: 4px solid #333;
          border-radius: 25px;
          padding: 20px 30px;
          position: relative;
          margin-top: -30px;
          z-index: 2;
          box-shadow: 10px 10px 0 rgba(0,0,0,0.1);
        }

        .speech-bubble-large p {
          margin: 0;
          font-family: inherit;
          font-weight: bold;
          font-size: 1.2rem;
          color: #333;
          line-height: 1.4;
        }

        .bubble-tail-large {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 20px solid #333;
        }

        .success-text {
          flex: 1.2;
          text-align: left;
          position: relative;
        }

        .grade-badge {
          font-size: 8rem;
          font-weight: 900;
          color: rgba(255, 159, 67, 0.2);
          position: absolute;
          top: -40px;
          right: -20px;
          z-index: 0;
          font-family: 'Arial Black', sans-serif;
        }

        .win-title {
          position: relative;
          z-index: 1;
          font-size: 4rem;
          margin: 0;
          color: #333;
          line-height: 1;
        }

        .win-subtitle {
          font-size: 1.5rem;
          color: #666;
          margin: 20px 0 40px 0;
        }

        .btn-crayon.large {
          font-size: 2rem;
          padding: 20px 60px;
        }

        .lose-layout {
          text-align: center;
        }

        .lose-badge {
          font-size: 5rem;
          font-weight: 900;
          color: #ff6b6b;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .win-layout { flex-direction: column; text-align: center; padding: 20px; }
          .win-title { font-size: 2.5rem; }
          .coach-celebration img { width: 200px; }
          .success-text { text-align: center; }
          .grade-badge { font-size: 5rem; position: static; }
        }
      `}} />
    </div>
  );
};


export default Cinematic;
