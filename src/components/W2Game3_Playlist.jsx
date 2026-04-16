import React, { useEffect, useState, useRef } from 'react';
import Train, { generateWagons } from './Train';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import Cinematic from './Cinematic';
import CoachPatrick from './CoachPatrick';
import { COACH_TIPS } from '../constants/coachPatrick';

const styles = [
  { id: 'disco', name: 'GLITTER DISCO', bpm: 115, complexity: 2, color: '#ff9ff3' },
  { id: 'house', name: 'SUNSET HOUSE', bpm: 124, complexity: 4, color: '#feca57' },
  { id: 'techno', name: 'DARK TECHNO', bpm: 132, complexity: 5, color: '#54a0ff' }
];

const W2Game3_Playlist = ({ onNextLevel, onRetry }) => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [currentStyleIdx, setCurrentStyleIdx] = useState(0);
  const [targetStyleIdx, setTargetStyleIdx] = useState(0);
  const [mood, setMood] = useState(70);
  const [requestsMet, setRequestsMet] = useState(0);
  
  const [posA, setPosA] = useState(0);
  const [isPlayingA, setIsPlayingA] = useState(false);

  const reqRef = useRef();
  const shoutTimerRef = useRef(1000); 
  const [shout, setShout] = useState("");

  const [wagonsA, setWagonsA] = useState([]);

  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const ctx = new MagicAudioContext();
    ctx.init().then(() => {
      setAudioCtx(ctx);
      loadTrack(ctx, styles[0]);
    });

    const updateLoop = () => {
      if (audioCtx) {
        const pos = audioCtx.getTrackPosition('A');
        setPosA(pos);

        // Mood Logic
        if (currentStyleIdx === targetStyleIdx) {
            setMood(m => Math.min(100, m + 0.05));
        } else {
            setMood(m => Math.max(0, m - 0.1));
        }

        // Shout Logic
        shoutTimerRef.current -= 1;
        if (shoutTimerRef.current <= 0) {
            const nextIdx = Math.floor(Math.random() * styles.length);
            if (nextIdx !== targetStyleIdx) {
                setTargetStyleIdx(nextIdx);
                setShout(`ON VEUT DU ${styles[nextIdx].name} !!!`);
                shoutTimerRef.current = 1500; 
            } else {
                shoutTimerRef.current = 200; 
            }
        }

        if (mood <= 0) setIsGameOver(true);
        if (requestsMet >= 3 && !isLevelCleared) setIsLevelCleared(true);
      }
      
      if (!isLevelCleared && !isGameOver) {
         reqRef.current = requestAnimationFrame(updateLoop);
      }
    };
    reqRef.current = requestAnimationFrame(updateLoop);

    return () => {
       cancelAnimationFrame(reqRef.current);
       if (audioCtx) audioCtx.ctx.close();
    }
  }, [audioCtx, currentStyleIdx, targetStyleIdx, mood, requestsMet, isLevelCleared, isGameOver]);

  const loadTrack = async (ctx, style) => {
    if (!ctx) return;
    await ctx.loadTrack('A', null, style.bpm, 120, style.complexity);
    setWagonsA(generateWagons(style.bpm, 120, false));
    if (isPlayingA) {
        ctx.playTrack('A');
    }
  };

  const handleStyleSelect = async (idx) => {
    if (!audioCtx) return;
    const style = styles[idx];
    
    // Smooth transition: load and swap
    audioCtx.pauseTrack('A');
    await loadTrack(audioCtx, style);
    setCurrentStyleIdx(idx);
    audioCtx.playTrack('A');
    setIsPlayingA(true);

    if (idx === targetStyleIdx) {
        setRequestsMet(r => r + 1);
        setShout("C'EST ÇA QU'ON VEUT ! 🔥");
        setMood(m => Math.min(100, m + 20));
        setTimeout(() => setShout(""), 2000);
    }
  };

  return (
    <div className="app-container level9">
      <div className="level-header">
        <h1>Niveau 9 : Maître de la Foule</h1>
        <p>Écoute les demandes de la foule et change de style musical pour garder l'énergie au maximum.</p>
      </div>

      <div className="crowd-visualization">
        <div className="mood-bar-container">
            <div className="mood-fill" style={{ width: `${mood}%`, background: mood > 30 ? '#55efc4' : '#ff7675' }} />
            <div className="mood-label">ENERGIE FOULE : {Math.round(mood)}%</div>
        </div>

        <div className="crowd-emojis">
            {Array.from({ length: 15 }).map((_, i) => (
                <div 
                    key={i} 
                    className="emoji"
                    style={{ 
                        animationDuration: `${60/styles[currentStyleIdx].bpm}s`,
                        fontSize: `${1.5 + (mood/100)}rem`,
                        filter: mood < 30 ? 'grayscale(1)' : 'none'
                    }}
                >
                    {mood > 70 ? '🙌' : (mood > 40 ? '💃' : '🥱')}
                </div>
            ))}
        </div>
      </div>

      <div className="railway-container style-rail">
          {shout && <div className="shout-bubble">{shout}</div>}
          <div className="track-container">
            <Train wagons={wagonsA} currentPositionSec={posA} bpm={styles[currentStyleIdx].bpm} isPlaying={isPlayingA} />
          </div>
      </div>

      <div className="playlist-panel">
        <h3>PLAYLIST ({requestsMet}/3 SUCCÈS)</h3>
        <div className="style-buttons">
            {styles.map((style, idx) => (
                <button 
                    key={style.id} 
                    className={`style-btn ${currentStyleIdx === idx ? 'active' : ''} ${targetStyleIdx === idx ? 'target' : ''}`}
                    onClick={() => handleStyleSelect(idx)}
                    style={{ '--style-color': style.color }}
                >
                    <span className="style-name">{style.name}</span>
                    <span className="style-bpm">{style.bpm} BPM</span>
                </button>
            ))}
        </div>
        <button className="btn-crayon play-btn" onClick={() => audioCtx.playTrack('A').then(() => setIsPlayingA(true))} disabled={isPlayingA} style={{ marginTop: '20px' }}>
            {isPlayingA ? "DANS L'AMBIANCE 🎶" : "COMMENCER LE SET 🎤"}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .crowd-visualization { margin: 20px 0; text-align: center; }
        .mood-bar-container {
          width: 100%; height: 30px; background: #2d3436; border-radius: 15px;
          position: relative; overflow: hidden; border: 3px solid #636e72; margin-bottom: 20px;
        }
        .mood-fill { height: 100%; transition: width 0.3s ease, background 0.5s; }
        .mood-label {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .crowd-emojis { display: flex; justify-content: center; gap: 15px; height: 60px; }
        .emoji { display: inline-block; animation: bounce 0.5s infinite alternate ease-in-out; }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-20px); } }
        .shout-bubble {
          position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
          background: #ff7675; color: white; padding: 10px 20px; border-radius: 20px;
          font-weight: bold; font-size: 1.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 10; animation: pulse 1s infinite;
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .playlist-panel { background: #1e1e1e; padding: 20px; border-radius: 20px; margin-top: 20px; border: 4px solid #3d3d3d; }
        .style-buttons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .style-btn {
          background: #2d3436; border: 4px solid var(--style-color); padding: 15px;
          border-radius: 12px; color: white; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; transition: all 0.2s;
        }
        .style-btn:hover { transform: translateY(-5px); box-shadow: 0 5px 15px var(--style-color); }
        .style-btn.active { background: var(--style-color); color: #000; }
        .style-btn.target { animation: glow 1s infinite alternate; }
        @keyframes glow { from { border-color: #fff; } to { border-color: var(--style-color); } }
        .style-name { font-weight: bold; font-size: 1.1rem; }
        .style-bpm { font-size: 0.8rem; opacity: 0.8; }
      `}} />

      {isLevelCleared && <Cinematic type="win" onNextLevel={onNextLevel} />}
      {isGameOver && <Cinematic type="lose" onRetry={onRetry} />}
      <CoachPatrick tips={COACH_TIPS.W2_PLAYLIST} />
    </div>
  );
};

export default W2Game3_Playlist;
