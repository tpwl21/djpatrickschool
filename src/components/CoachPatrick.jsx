import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import professorImg from '../assets/professor_patrick.png';

const CoachPatrick = ({ tips = [] }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);

  useEffect(() => {
    // Change tip every 15 seconds if there are multiple
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setIsBubbleVisible(false);
        setTimeout(() => {
          setCurrentTipIndex((prev) => (prev + 1) % tips.length);
          setIsBubbleVisible(true);
        }, 500);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [tips]);

  if (!isVisible) return null;

  return (
    <div className="coach-patrick-container">
      <AnimatePresence>
        {isBubbleVisible && (
          <motion.div 
            className="speech-bubble"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: [0, -1, 1, -1, 0] // Subtle wobble
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" },
              default: { duration: 0.4 }
            }}
          >
            <p>{tips[currentTipIndex]}</p>
            <button className="close-bubble" onClick={() => setIsVisible(false)}>×</button>
            <div className="bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="coach-character"
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        whileHover={{ scale: 1.05 }}
      >
        <img src={professorImg} alt="Professor Patrick" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .coach-patrick-container {
          position: fixed;
          top: 80px;
          left: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 2000;
          pointer-events: none;
        }

        .coach-character {
          width: 250px;
          height: auto;
          pointer-events: auto;
          cursor: pointer;
          order: 1;
        }

        .coach-character img {
          width: 100%;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
        }

        .speech-bubble {
          background: white;
          border: 3px solid #333;
          border-radius: 20px;
          padding: 15px 40px 15px 20px;
          max-width: 250px;
          position: relative;
          margin-top: 15px;
          box-shadow: 8px 8px 0 rgba(0,0,0,0.1);
          pointer-events: auto;
          order: 2;
        }

        .speech-bubble p {
          margin: 0;
          color: #333;
          font-family: 'Patrick Hand', cursive;
          font-weight: bold;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .bubble-tail {
          position: absolute;
          top: -15px;
          left: 30px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 15px solid #333;
        }

        .bubble-tail::after {
          content: '';
          position: absolute;
          top: -12px;
          left: -12px;
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 12px solid white;
        }

        .close-bubble {
          position: absolute;
          top: 5px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #999;
          line-height: 1;
        }

        .close-bubble:hover {
          color: #333;
        }

        @media (max-width: 768px) {
          .coach-character {
            width: 100px;
          }
          .speech-bubble {
            max-width: 180px;
            font-size: 0.8rem;
          }
        }
      `}} />
    </div>
  );
};

export default CoachPatrick;
