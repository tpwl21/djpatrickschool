import React from 'react';
import { motion } from 'framer-motion';
import { Music, Zap, Disc, Play } from 'lucide-react';

const Home = ({ onSelectWorkshop }) => {
  return (
    <div className="home-container">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="home-header"
      >
        <div className="hero-badge">🎓 DJ ACADEMY</div>
        <h1>DJ Teacher</h1>
        <p>Maîtrise le rythme et l'énergie des foules</p>
      </motion.header>

      <div className="workshop-grid">
        {/* Workshop 1 Card */}
        <motion.div 
          whileHover={{ scale: 1.05, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="workshop-card ws1"
          onClick={() => onSelectWorkshop('workshop1')}
        >
          <div className="card-icon"><Music size={48} /></div>
          <h2>Atelier 1</h2>
          <h3>Le Rail du Rythme</h3>
          <p>Apprends le beatmatching, le pitch et le calage des phrases musicales.</p>
          <div className="card-footer">
            <span>7 Niveaux</span>
            <Play size={24} />
          </div>
        </motion.div>

        {/* Workshop 2 Card */}
        <motion.div 
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="workshop-card ws2"
          onClick={() => onSelectWorkshop('workshop2')}
        >
          <div className="card-icon"><Zap size={48} /></div>
          <h2>Atelier 2</h2>
          <h3>Performance & Crowd</h3>
          <p>Maîtrise les EQ, les effets et la gestion de la playlist pour retourner le dancefloor.</p>
          <div className="card-footer">
            <span>3 Défis</span>
            <Play size={24} />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 2 }}
        className="home-footer"
      >
        Version 1.2.0 • Propulsé by Magic Audio Engine
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero-badge {
          background: #ff9f43;
          color: black;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.8rem;
          display: inline-block;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }
        .workshop-card.ws1 { border-top: 5px solid #ff9f43; }
        .workshop-card.ws2 { border-top: 5px solid #00d2d3; }

        .card-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ws1 .card-icon { color: #ff9f43; }
        .ws2 .card-icon { color: #00d2d3; }

        .workshop-card h2 { color: #888; font-size: 0.9rem; margin: 0; }
        .workshop-card h3 { font-size: clamp(1.2rem, 3vw, 2rem); margin: 0; }
        .workshop-card p { color: #aaa; line-height: 1.6; min-height: 60px; font-size: 0.9rem; }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          color: #fff;
          font-weight: bold;
        }
        .card-footer span { opacity: 0.6; }

        .home-footer {
          margin-top: 40px;
          font-size: 0.7rem;
          letter-spacing: 1px;
          opacity: 0.5;
        }
      `}} />
    </div>
  );
};

export default Home;
