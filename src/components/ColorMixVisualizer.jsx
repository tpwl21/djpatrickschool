import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Glyph from './Glyph';

// Palette Configuration
const DEFAULT_A = "#3498db"; // Electric Blue
const DEFAULT_B = "#e74c3c"; // Vibrant Pink/Red

const BASS_A = "#2ecc71";    // Neon Lime Green
const BASS_B = "#e67e22";    // Vivid Electric Orange

// Smooth mapping for precise sound/vision matching
const smoothImpact = (db, volume) => {
    const normalized = Math.max(0, Math.min(1, (db + 24) / 30));
    return Math.pow(normalized, 1.8) * volume;
};

// Global lerp helper
const lerpColor = (colorA, colorB, factor) => {
    const getRGB = (c) => {
        if (c.startsWith('rgb')) {
            const vals = c.match(/\d+/g).map(Number);
            return [vals[0], vals[1], vals[2]];
        }
        const h = parseInt(c.slice(1), 16);
        return [(h >> 16) & 255, (h >> 8) & 255, h & 255];
    };
    const [r1, g1, b1] = getRGB(colorA);
    const [r2, g2, b2] = getRGB(colorB);
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    return `rgb(${r}, ${g}, ${b})`;
};

const SpectralOrb = ({ label, impactA, impactB, offset, beats, colorA, colorB, k = 1, xRange = 440 }) => {
    const total = impactA + impactB;
    const mixRatio = total > 0.05 ? impactB / total : 0.5;
    
    // Smooth horizontal drift with center magnetism
    const xBase = (mixRatio - 0.5) * xRange;
    const xPos = Math.abs(xBase) < 30 ? 0 : xBase; // Stick to center
    
    const currentColor = lerpColor(colorA, colorB, mixRatio);
    
    // Size logic: Teach "Clipping"
    // tailles mises à l'échelle de la hauteur réelle du visualiseur (k = h / 520)
    const sizeBase = (20 + Math.min(220, total * 180)) * k;
    const isClipping = total > 1.3;
    const pulseIntensity = isClipping ? 0.15 : 0.06;
    const pulse = 1 + Math.sin(beats * Math.PI) * pulseIntensity;

    return (
        <motion.div
            style={{
                position: 'absolute',
                left: '50%',
                top: offset,
                width: sizeBase, height: sizeBase,
                marginLeft: -sizeBase / 2,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${currentColor} 0%, transparent 80%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isClipping ? `0 0 60px ${currentColor}` : `0 0 30px ${currentColor}44`,
                filter: isClipping ? 'blur(3px)' : 'blur(4px)',
                zIndex: 2,
                border: isClipping ? '2px solid white' : 'none'
            }}
            animate={{ 
                x: xPos,
                scale: pulse,
                opacity: Math.min(1, total * 5)
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 45 }}
        >
            <div style={{
                color: isClipping ? '#fff' : 'rgba(255,255,255,0.4)', 
                fontSize: '0.7rem', fontWeight: '900',
                textShadow: '0 0 5px #000', pointerEvents: 'none', transform: 'translateY(15px)',
                opacity: total > 0.1 ? 1 : 0
            }}>
                {label} {isClipping && <Glyph name="burst" label="clip" />}
            </div>
        </motion.div>
    );
};

const ColorMixVisualizer = ({
    levelId,
    eqState,
    beatsA,
}) => {
  // Taille réelle du cadre : les bulles et leur dérive A↔B s'y adaptent (le cadre n'a plus 520px fixes)
  const boxRef = useRef(null);
  const [box, setBox] = useState({ k: 0.6, xRange: 300 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ k: Math.min(1, height / 520), xRange: Math.min(440, width * 0.42) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Identify if we should use Isolated colors (Level 2+)
  const isAdvancedLevel = !["EQ_LEVEL_1"].includes(levelId);

  // Spectral Bands Config
  const bands = [
      { id: 'high', label: 'HIGH', colorA: DEFAULT_A, colorB: DEFAULT_B, impactA: smoothImpact(eqState.eqA.high, eqState.volA * (1 - eqState.crossfader)), impactB: smoothImpact(eqState.eqB.high, eqState.volB * eqState.crossfader), offset: '10%' },
      { id: 'mid',  label: 'MID',  colorA: DEFAULT_A, colorB: DEFAULT_B, impactA: smoothImpact(eqState.eqA.mid,  eqState.volA * (1 - eqState.crossfader)), impactB: smoothImpact(eqState.eqB.mid,  eqState.volB * eqState.crossfader), offset: '35%' },
      { id: 'low',  label: 'BASS', colorA: isAdvancedLevel ? BASS_A : DEFAULT_A, colorB: isAdvancedLevel ? BASS_B : DEFAULT_B, impactA: smoothImpact(eqState.eqA.low,  eqState.volA * (1 - eqState.crossfader)), impactB: smoothImpact(eqState.eqB.low,  eqState.volB * eqState.crossfader), offset: '60%' },
      { id: 'master', label: 'MIX',  colorA: DEFAULT_A, colorB: DEFAULT_B, impactA: eqState.volA * (1 - eqState.crossfader), impactB: eqState.volB * eqState.crossfader, offset: '82%' }
  ];

  return (
    <div ref={boxRef} style={{
      width: '100%',
      height: 'clamp(180px, 26vh, 300px)',
      flexShrink: 0,
      background: '#020202',
      borderRadius: '50px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: 'inset 0 0 150px #000, 0 30px 100px rgba(0,0,0,1)',
      display: 'flex',
      flexDirection: 'column',
      margin: '12px 0',
      border: '10px solid #151515'
    }}>
      {/* Background Stage - Subtle Center Line */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, #111 0%, #000 80%)' }} />

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="spectral-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -12" result="goo" />
          </filter>
        </defs>
      </svg>

      {/* Target Blueprints */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2 }}>
          {bands.map((b, i) => (
              <div key={`target-${b.id}`} style={{ 
                  position: 'absolute', right: '12%', top: b.offset, 
                  width: (80 + i*10) * box.k, height: (80 + i*10) * box.k, borderRadius: '50%', 
                  border: `2px dashed ${b.colorB}`, transform: 'translateY(10px)' 
              }} />
          ))}
      </div>

      {/* THE 4 SPECTRAL BUBBLES */}
      <div style={{ position: 'absolute', inset: 0, filter: 'url(#spectral-goo)' }}>
          {bands.map(b => (
              <SpectralOrb 
                  key={b.id}
                  label={b.label}
                  impactA={b.impactA}
                  impactB={b.impactB}
                  offset={b.offset}
                  beats={beatsA}
                  colorA={b.colorA}
                  colorB={b.colorB}
                  k={box.k}
                  xRange={box.xRange}
              />
          ))}
      </div>

      {/* STAGE LABELS */}
      <div style={{ position: 'absolute', top: 30, left: 40, color: DEFAULT_A, fontSize: '0.8rem', fontWeight: '900', letterSpacing: '6px', opacity: 0.5 }}>SOURCE</div>
      <div style={{ position: 'absolute', top: 30, right: 40, color: DEFAULT_B, fontSize: '0.8rem', fontWeight: '900', letterSpacing: '6px', opacity: 0.5 }}>TARGET</div>

      {/* Bottom Meter Line */}
      <div style={{ position: 'absolute', bottom: 40, left: '15%', right: '15%', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px' }}>
          <motion.div 
            style={{ position: 'absolute', left: `${eqState.crossfader * 100}%`, width: '12px', height: '12px', background: '#fff', borderRadius: '50%', top: '-5px', marginLeft: '-6px', boxShadow: '0 0 10px #fff' }}
          />
      </div>
    </div>
  );
};

export default ColorMixVisualizer;
