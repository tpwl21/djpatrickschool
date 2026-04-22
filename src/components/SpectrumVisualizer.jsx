import React, { useRef, useEffect, useState } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { PHRASES, BEATS_PER_PHRASE } from '../utils/workshopUtils';

const SpectrumVisualizer = ({ audioCtx, deckA, deckB, configA, configB, theme }) => {
  const canvasRef = useRef(null);
  
  useAnimationFrame(() => {
    if (!canvasRef.current || !audioCtx) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw Center Line
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    const drawDeck = (deckId, yOffset, color, config, markers = []) => {
      const deck = audioCtx.decks[deckId];
      if (!deck || !deck.buffer) return;
      
      const pos = audioCtx.getTrackPosition(deckId);
      const bpm = config ? config.bpm : 120;
      const zoom = 50; // pixels per second
      
      const buffer = deck.buffer;
      const data = buffer.getChannelData(0);
      const sr = buffer.sampleRate;
      
      const startSec = pos - (w / 2) / zoom;
      const endSec = pos + (w / 2) / zoom;
      
      // Draw peak waveform around current position
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      
      const points = 200;
      for (let i = 0; i < points; i++) {
        const x = i * (w / points);
        const t = startSec + (i / points) * (w / zoom);
        
        if (t < 0 || t > buffer.duration) continue;
        
        const sampleIdx = Math.floor(t * sr);
        let max = 0;
        const windowSize = Math.floor(sr / 100); 
        for (let j = 0; j < windowSize; j += 10) {
           const val = Math.abs(data[sampleIdx + j] || 0);
           if (val > max) max = val;
        }
        
        const barH = max * (h / 2.5);
        ctx.fillRect(x, yOffset + (h/4) - barH/2, w/points - 1, barH);
      }

      // Draw Structural Markers (Hints)
      markers.forEach(m => {
        if (m.pos >= startSec && m.pos <= endSec) {
          const x = (m.pos - startSec) * zoom;
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = m.color || '#ff00ff';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, yOffset);
          ctx.lineTo(x, yOffset + h/2);
          ctx.stroke();
          ctx.setLineDash([]); // Reset
          
          ctx.fillStyle = m.color || '#ff00ff';
          ctx.font = '900 8px cursive';
          ctx.fillText(m.label.toUpperCase(), x + 4, yOffset + 10);
        }
      });
      
      // Draw Beats (vertical lines)
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      
      const secPerBeat = 60 / bpm;
      const firstBeat = Math.floor(startSec / secPerBeat) * secPerBeat;
      
      for (let t = firstBeat; t < endSec; t += secPerBeat) {
        if (t < 0) continue;
        const x = (t - startSec) * zoom;
        ctx.beginPath();
        ctx.moveTo(x, yOffset);
        ctx.lineTo(x, yOffset + h/2);
        ctx.stroke();
      }
      
      // Label
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = theme?.text || '#333';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(deckId === 'A' ? 'DECK A' : 'DECK B', 10, yOffset + 15);
    };

    drawDeck('A', 0, '#4ecdc4', configA, deckA.markers || []);
    drawDeck('B', h/2, '#5DADE2', configB, deckB.markers || []);
  });

  return (
    <div style={{ 
      width: '100%', 
      height: '80px', 
      background: theme?.panelBg || '#fff', 
      borderRadius: '20px', 
      border: '4px solid #333',
      boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={80}
        style={{ width: '100%', height: '100%' }} 
      />
      <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          bottom: 0,
          width: '2px',
          background: '#ff6b6b',
          zIndex: 10,
          boxShadow: '0 0 10px rgba(255,107,107,0.5)'
      }} />
    </div>
  );
};

export default SpectrumVisualizer;
