import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import NudgeButton from '../components/NudgeButton';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicAudioContext } from '../audio/MagicAudioContext';
import PitchBlock from '../components/PitchBlock';
import { EqKnobs, GainKnob, VolumeFader, Crossfader } from '../components/MixerControls';
import TrackBrowser from '../components/TrackBrowser';
import SpectrumVisualizer from '../components/SpectrumVisualizer';
import { LanguageContext } from '../hooks/LanguageContext';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { useMidiControl } from '../hooks/useMidiControl';
import MidiSelector from '../components/MidiSelector';
import { DIFFICULTY_SETTINGS, CURRENT_DIFFICULTY } from '../constants/difficulty';
import agentImg from '../assets/angry_soundguy_patrick.webp';
import { HARMONY_POOL } from '../constants/tracks';
import { getAllTracks } from '../lib/levels/load';
import Glyph from '../components/Glyph';
import CoachPatrick from '../components/CoachPatrick';
import { useMobileDetection } from '../hooks/useMobileDetection';

const THEMES = {
  light: {
    bg: '#fff',
    panelBg: '#fafafa',
    border: '#333',
    text: '#333',
    mixerBg: '#dedede',
    mixerText: '#333',
    shadow: '15px 15px 0 rgba(0,0,0,0.05)',
    accent: '#1e8449', // vert foncé : lisible en texte sur fond blanc
    play: '#2ecc71',
    pause: '#ff6b6b',
    sync: '#9b59b6',
    pitch: '#333',
    vol: '#ff9f43',
    btnBg: '#f0f0f0',
    btnText: '#333',
    btnBorder: '#333',
    coachFilter: 'var(--sticker-shadow)'
  },
  dark: {
    bg: '#002b36',
    panelBg: '#073642',
    border: '#586e75',
    text: '#93a1a1',
    mixerBg: '#002b36',
    mixerText: '#5aaeea', // éclairci pour ≥4.5:1 sur le fond nuit
    shadow: '0 10px 30px rgba(0,0,0,0.5)',
    accent: '#9db300',
    play: '#859900',
    pause: '#dc322f',
    sync: '#6c71c4',
    pitch: '#b58900',
    vol: '#2aa198',
    btnBg: '#073642',
    btnText: '#93a1a1',
    btnBorder: '#586e75',
    coachFilter: 'var(--sticker-shadow)'
  }
};

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" style={{ strokeDasharray: '2,2' }}/>
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" style={{ strokeDasharray: '3,1' }}/>
  </svg>
);

// Premium Segmented VU Meter
const VUMeter = ({ audioCtx, deckId, theme }) => {
  const [level, setLevel] = useState(0);
  const segments = 10;
  
  useAnimationFrame(() => {
    if (audioCtx) {
      const l = audioCtx.getMeterLevel(deckId);
      // Smoothing with a bit of decay
      setLevel(prev => Math.max(l, prev * 0.8));
    }
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{
        width: '12px',
        height: '90px',
        background: '#111',
        borderRadius: '4px',
        padding: '2px',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '2px',
        border: `2px solid ${theme.border}`
      }}>
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = (i + 1) / segments;
          const isActive = level >= threshold;
          let color = theme.accent; // Thematic accent
          if (i >= 6) color = '#f1c40f'; // Yellow
          if (i >= 8) color = '#e74c3c'; // Red
          
          return (
            <div key={i} style={{
              flex: 1,
              background: isActive ? color : 'rgba(255,255,255,0.05)',
              borderRadius: '1px',
              boxShadow: isActive ? `0 0 8px ${color}` : 'none',
              transition: 'background 0.05s'
            }} />
          );
        })}
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        height: '90px', 
        fontSize: '0.7rem', 
        color: theme.mixerText, 
        fontWeight: 900,
        padding: '2px 0'
      }}>
        <span style={{ color: theme === THEMES.dark ? '#f2645f' : '#a93226' }}>+3</span>
        <span style={{ color: theme === THEMES.dark ? '#b58900' : '#8a4a07' }}>0</span>
        <span>-6</span>
        <span>-12</span>
        <span>-20</span>
        <span>-∞</span>
      </div>
    </div>
  );
};

// Move DeckUI outside for stability and clarity
const DeckUI = ({ deckId, state, setState, onPlay, onCue, onSync, onLoad, audioCtxRef, theme }) => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="deck-container" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '12px',
      background: theme.panelBg,
      borderRadius: '30px',
      border: `4px solid ${theme.border}`,
      boxShadow: theme.shadow,
      position: 'relative',
      minWidth: '240px',
      color: theme.text,
      pointerEvents: state.isLoading ? 'none' : 'auto',
      opacity: state.isLoading ? 0.8 : 1
    }}>
      {state.isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.7)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ lineHeight: 0 }}><Glyph name="vinyl" size="2.2rem" shadow /></motion.div>
            <div style={{ fontWeight: 900, fontSize: '0.8rem', color: '#333' }}>LOADING...</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>DECK {deckId}</h2>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 900, 
            maxWidth: '180px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            marginTop: '5px'
          }}>
            {state.config && state.config.url ? state.config.title : t('booth.status.noTrackShort')}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: theme.text, letterSpacing: '1px' }}>
            {state.config ? state.config.bpm : 120} BPM <span style={{ opacity: 0.5 }}>→</span> <span style={{ color: theme.accent }}>{( (state.config ? state.config.bpm : 120) * state.pitch ).toFixed(1)} BPM</span> • {state.config ? state.config.key : "-"}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={() => onSync(deckId)}
            className="btn-crayon"
            style={{ background: theme.sync, color: '#fff', fontSize: '0.7rem', padding: '8px 12px' }}
          >
            {t('booth.controls.sync')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4, marginBottom: '5px' }}>{t('booth.controls.pitch')}</span>
          <PitchBlock
            nativeBpm={state.config.bpm}
            rate={state.pitch}
            onRateChange={(r) => setState(prev => ({ ...prev, pitch: r }))}
            keyLock={state.keyLock}
            onKeyLockChange={(v) => setState(prev => ({ ...prev, keyLock: v }))}
            trackLength={140}
            color={theme.pitch}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          className="btn-crayon" 
          onClick={() => onPlay(deckId)}
          disabled={!state.config.url || state.isLoading}
          style={{ 
            flex: 2, 
            background: !state.config.url ? (theme === THEMES.dark ? '#222' : '#eee') : (state.isPlaying ? theme.pause : theme.play),
            color: !state.config.url ? (theme === THEMES.dark ? '#555' : '#999') : '#fff',
            fontSize: '1rem',
            padding: '10px',
            opacity: (!state.config.url || state.isLoading) ? 0.3 : 1,
            cursor: (!state.config.url || state.isLoading) ? 'not-allowed' : 'pointer',
            boxShadow: state.isPlaying ? `0 0 20px ${theme.pause}66` : 'none'
          }}
        >
          {state.isPlaying ? t('booth.controls.pause') : t('booth.controls.play')}
        </button>
        <button 
          className="btn-crayon" 
          onClick={() => onCue(deckId)}
          disabled={state.isLoading}
          style={{ 
            flex: 1, 
            background: state.isLoading ? '#95a5a6' : '#f1c40f', 
            color: '#2b2b2b',
            opacity: state.isLoading ? 0.5 : 1,
            cursor: state.isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {t('booth.controls.cue')}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <NudgeButton audioCtxRef={audioCtxRef} deckId={deckId} dir={-1} onPitchChange={rate => setState(prev => ({ ...prev, pitch: rate }))} label={t('booth.controls.slow')} style={{ flex: 1, fontSize: '0.7rem' }} />
        <NudgeButton audioCtxRef={audioCtxRef} deckId={deckId} dir={1} onPitchChange={rate => setState(prev => ({ ...prev, pitch: rate }))} label={t('booth.controls.fast')} style={{ flex: 1, fontSize: '0.7rem' }} />
      </div>

    </div>
  );
};

const SecretBoothFull = ({ onBack }) => {
  const { language, t } = useContext(LanguageContext);
  const [audioCtx, setAudioCtx] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Opt out of the difficulty-driven theme: the booth keeps its signature
  // dark-club identity. Override the root theme on mount, restore on unmount.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = 'booth';
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);
  
  const [deckA, setDeckA] = useState({
    config: { title: t('booth.status.noTrack'), bpm: 120, key: "-" },
    isPlaying: false,
    volume: 1.0,
    pitch: 1.0,
    gain: 1.0,
    eq: { low: 0, mid: 0, high: 0 },
    markers: [],
    isLoading: false,
    keyLock: false
  });

  const [deckB, setDeckB] = useState({
    config: { title: t('booth.status.noTrack'), bpm: 120, key: "-" },
    isPlaying: false,
    volume: 1.0,
    pitch: 1.0,
    gain: 1.0,
    eq: { low: 0, mid: 0, high: 0 },
    markers: [],
    isLoading: false,
    keyLock: false
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingResult, setRecordingResult] = useState(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [targetDeck, setTargetDeck] = useState('A');
  const [profTip, setProfTip] = useState(t('booth.professor.welcome'));
  const [isAgentAngry, setIsAgentAngry] = useState(false);
  const [agentTip, setAgentTip] = useState("");
  const [isAgentDismissed, setIsAgentDismissed] = useState(false);
  const [saturationIntensity, setSaturationIntensity] = useState(0);
  const [crossfader, setCrossfader] = useState(0.5);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [browserSelectedIdx, setBrowserSelectedIdx] = useState(0);
  const [midiPanelOpen, setMidiPanelOpen] = useState(false);
  const lastMidiNavTime = useRef(0);
  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  
  // Build a flat track list for MIDI navigation (mirrors TrackBrowser logic)
  const allBrowserTracks = useRef([]);
  useEffect(() => {
    const seen = new Set();
    const tracks = [];
    const add = (t) => { if (t?.url && !seen.has(t.url)) { tracks.push(t); seen.add(t.url); } };
    HARMONY_POOL.forEach(add);
    getAllTracks().forEach(add);
    allBrowserTracks.current = tracks;
  }, []);
  
  const lastClipTime = useRef(0);
  const clippingSince = useRef(0);
  const hasSeenAgent = useRef(false);
  
  const audioCtxRef = useRef(null);
  // MIDI performance refs
  const midiBoothBufferRef = useRef(null); // stash latest MIDI state for 30fps flush
  const lastMidiBoothUiRef = useRef(0);
  const encoderBrowseRef = useRef(0); // accumulate encoder ticks for browsing

  useEffect(() => {
    const ctx = new MagicAudioContext();
    audioCtxRef.current = ctx;
    ctx.init().then(() => {
      setAudioCtx(ctx);
      setIsReady(true);
    });
    return () => {
      if (ctx && ctx.ctx) ctx.ctx.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!audioCtx) return;

    const effVolA = deckA.volume * (1 - crossfader) * 1.2;
    const effVolB = deckB.volume * crossfader * 1.2;

    audioCtx.setVolume('A', effVolA);
    audioCtx.setTrim('A', deckA.gain);
    audioCtx.setEq('A', 'low', deckA.eq.low);
    audioCtx.setEq('A', 'mid', deckA.eq.mid);
    audioCtx.setEq('A', 'high', deckA.eq.high);
    audioCtx.setKeyLock('A', deckA.keyLock);
    audioCtx.setPlaybackRate('A', deckA.pitch);

    audioCtx.setVolume('B', effVolB);
    audioCtx.setTrim('B', deckB.gain);
    audioCtx.setEq('B', 'low', deckB.eq.low);
    audioCtx.setEq('B', 'mid', deckB.eq.mid);
    audioCtx.setEq('B', 'high', deckB.eq.high);
    audioCtx.setKeyLock('B', deckB.keyLock);
    audioCtx.setPlaybackRate('B', deckB.pitch);
  }, [audioCtx, deckA, deckB, crossfader]);

  // Magic AI Analysis & Real-time Hints
  useAnimationFrame(() => {
    if (!audioCtx || !isReady) return;
    
    // 1. Clipping Detection (Angry Sound Guy)
    const isClipA = audioCtx.isClipping('A');
    const isClipB = audioCtx.isClipping('B');
    const isClipping = isClipA || isClipB;
    const now = Date.now();

    if (isClipping) {
      lastClipTime.current = now;
      if (clippingSince.current === 0) clippingSince.current = now;

      // Only show the full pop-up if clipping persists for 2.5 seconds
      // OR if it's the very first time in this session (immediate pop-up)
      const shouldPopImmediately = !hasSeenAgent.current;
      const shouldPopAfterDelay = now - clippingSince.current > 2500;

      if (!isAgentAngry && !isAgentDismissed && (shouldPopImmediately || shouldPopAfterDelay)) {
        setIsAgentAngry(true);
        hasSeenAgent.current = true;
        const quotes = [
          t('booth.soundguy.prostitutes'),
          t('booth.soundguy.smoke'),
          t('booth.soundguy.noise'),
          t('booth.soundguy.hardcore')
        ];
        setAgentTip(quotes[Math.floor(Math.random() * quotes.length)]);
      }
    } else {
      clippingSince.current = 0;
      if (isAgentDismissed) setIsAgentDismissed(false);
      
      // Stay visible for 3 seconds after clip ends
      if (isAgentAngry && now - lastClipTime.current > 3000) {
        setIsAgentAngry(false);
      }
    }

    // Calculate saturation intensity for the vignette
    const levelA = audioCtx.getMeterLevel('A');
    const levelB = audioCtx.getMeterLevel('B');
    const intensity = Math.max(0, (Math.max(levelA, levelB) - 0.70) / 0.3);
    setSaturationIntensity(prev => Math.max(intensity, prev * 0.92)); // Slightly slower decay for visibility

    // 2. Structural Advice (Professor Patrick)
    const posA = audioCtx.getTrackPosition('A');
    const bpmA = deckA.config.bpm * deckA.pitch;
    const beatsA = posA * (bpmA / 60);
    const phrasePosA = beatsA % 32;

    if (deckA.isPlaying) {
      if (phrasePosA > 28) {
        setProfTip(t('booth.professor.transition'));
      } else if (phrasePosA < 4) {
        setProfTip(t('booth.professor.newPhrase'));
      } else if (deckB.isPlaying && Math.abs( (beatsA % 32) - ( (audioCtx.getTrackPosition('B') * (deckB.config.bpm * deckB.pitch) / 60) % 32 ) ) > 1) {
          setProfTip(t('booth.professor.outOfSync'));
      } else {
         setProfTip(t('booth.professor.clean'));
       }
     }

     // 3. State Sync: Update React isPlaying if engine stopped (for non-looping behavior)
     if (audioCtx.decks['A'].isPlaying !== deckA.isPlaying) {
       setDeckA(prev => ({ ...prev, isPlaying: audioCtx.decks['A'].isPlaying }));
     }
     if (audioCtx.decks['B'].isPlaying !== deckB.isPlaying) {
       setDeckB(prev => ({ ...prev, isPlaying: audioCtx.decks['B'].isPlaying }));
     }
   });

  const loadTrack = async (deckId, track) => {
    if (!audioCtx) return;
    
    // Check if deck is playing
    const targetDeckState = deckId === 'A' ? deckA : deckB;
    if (targetDeckState.isPlaying) {
      setIsAgentAngry(true);
      setAgentTip(t('booth.soundguy.motor'));
      lastClipTime.current = Date.now(); // Reuse timer to keep him visible
      return;
    }

    // Generate Magic Markers for the visualizer
    const secPerBeat = 60 / track.bpm;
    const markers = [];
    for (let b = 0; b < 400; b += 32) {
      const p = b * secPerBeat;
      if (b === 0) markers.push({ pos: p, label: 'START', color: '#2ecc71' });
      else if (b === 128) markers.push({ pos: p, label: 'CUT/FADE', color: '#ff00ff' });
      else markers.push({ pos: p, label: 'PHRASE', color: '#9b59b6' });
    }

    const update = deckId === 'A' ? setDeckA : setDeckB;
    update(prev => ({ 
      ...prev, 
      config: track,
      markers: markers,
      isLoading: true
    }));
    
    await audioCtx.loadTrack(deckId, track.url, track.bpm);
    update(prev => ({ ...prev, isLoading: false }));
  };

  const togglePlay = (deckId) => {
    if (!audioCtx) return;
    const currentState = deckId === 'A' ? deckA : deckB;
    const update = deckId === 'A' ? setDeckA : setDeckB;

    // Hard block: No track loaded
    if (!currentState.config.url) {
      return;
    }

    if (currentState.isPlaying) {
       audioCtx.pauseTrack(deckId);
       update(prev => ({ ...prev, isPlaying: false }));
     } else {
       audioCtx.playTrack(deckId, false);
       update(prev => ({ ...prev, isPlaying: true }));
     }
  };

  const handleCue = (deckId) => {
    if (!audioCtx) return;
    audioCtx.cueTrack(deckId, 0);
    const update = deckId === 'A' ? setDeckA : setDeckB;
    update(prev => ({ ...prev, isPlaying: false }));
  };

  const handleSync = (deckId) => {
    if (!audioCtx) return;
    const otherDeckId = deckId === 'A' ? 'B' : 'A';
    const otherDeckState = deckId === 'A' ? deckB : deckA;
    const update = deckId === 'A' ? setDeckA : setDeckB;
    
    const targetPitch = (otherDeckState.config.bpm * otherDeckState.pitch) / (deckId === 'A' ? deckA.config.bpm : deckB.config.bpm);
    update(prev => ({ ...prev, pitch: targetPitch }));
    audioCtx.setPlaybackRate(deckId, targetPitch);
    
    const posOther = audioCtx.getTrackPosition(otherDeckId);
    const bpmOther = otherDeckState.config.bpm * otherDeckState.pitch;
    const secPerBeatOther = 60 / bpmOther;
    const phase = posOther % secPerBeatOther;
    
    const posSelf = audioCtx.getTrackPosition(deckId);
    const bpmSelf = (deckId === 'A' ? deckA.config.bpm : deckB.config.bpm) * targetPitch;
    const secPerBeatSelf = 60 / bpmSelf;
    
    audioCtx.cueTrack(deckId, Math.floor(posSelf / secPerBeatSelf) * secPerBeatSelf + phase);
    if ( (deckId === 'A' ? deckA.isPlaying : deckB.isPlaying) ) {
       audioCtx.playTrack(deckId, false);
    }
  };


  const startRec = () => {
    if (audioCtx) {
      audioCtx.startRecording();
      setIsRecording(true);
      setRecordingResult(null);
    }
  };

  const stopRec = async () => {
    if (audioCtx) {
      const result = await audioCtx.stopRecording();
      setRecordingResult(result);
      setIsRecording(false);
    }
  };

  const openBrowser = (deckId) => {
    setTargetDeck(deckId);
    setBrowserOpen(true);
  };

  // --- FULL DDJ-SR MIDI CONTROL ---
  // CC mapping:
  //   ch1/ch2 CC 0x00 = Pitch A/B
  //   ch1/ch2 CC 0x09 = Channel Fader A/B
  //   ch1     CC 0x1F = Crossfader
  //   ch1/ch2 CC 0x07 = EQ High A/B
  //   ch1/ch2 CC 0x0B = EQ Mid A/B
  //   ch1/ch2 CC 0x0F = EQ Low A/B
  //   ch1/ch2 CC 0x03 = Trim/Gain A/B
  //   ch1     CC 0x60 = Browse encoder (relative)
  // Note mapping:
  //   Note 0x0B = Play/Pause A(ch1) B(ch2)
  //   Note 0x0C = Cue A(ch1) B(ch2)
  //   Note 0x58 = Sync A(ch1) B(ch2)
  //   Note 0x19 = Load A(ch1) B(ch2)  [selected browser track]
  //   Note 0x1A = Open browser
  useMidiControl((data) => {
    const [status, note, velocity] = data;
    const channel = (status & 0x0F) + 1;
    const type = status & 0xF0;
    const ctx = audioCtxRef.current;

    // ── CC (continuous controls) ──────────────────────────────────────────
    if (type === 0xB0) {
      const mapFader  = (v) => v / 127;                                 // 0.0 – 1.0
      const mapPitch = (v, bpm) => {
        if (v === 64) return bpm;
        if (v < 64) return bpm - 25 + (v / 64) * 25; // 0..64 -> -25..0
        return bpm + ((v - 64) / 63) * 25;           // 64..127 -> 0..+25
      };
      // Piecewise EQ: MIDI 64 = 0dB (center), matching Potard centerValue=0
      // v ∈ [0,64]  → [-24, 0] dB
      // v ∈ [64,127] → [0, +6] dB
      const mapEq = (v) => v <= 64 ? -24 + (v / 64) * 24 : ((v - 64) / 63) * 6;
      const mapGain   = (v) => (v / 127) * 2;                           // 0.0 – 2.0



      // Buffer stash for React 30fps flush - ONLY for continuous parameters
      const buf = midiBoothBufferRef.current || {
        deckA: {}, deckB: {}, crossfader: null
      };

      if (channel === 1) {
        // Deck A
        if (note === 0x00) { // Pitch A
          const bpm = deckA.config.bpm;
          const targetBpm = mapPitch(velocity, bpm);
          const newRate = targetBpm / bpm;
          buf.deckA = { ...buf.deckA, pitch: newRate };
          if (ctx) ctx.setPlaybackRate('A', newRate);
        }
        if (note === 0x13) { // Fader A
          const vol = mapFader(velocity);
          buf.deckA.volume = vol;
          const cf = buf.crossfader !== null ? buf.crossfader : crossfader;
          if (ctx) ctx.setVolume('A', vol * (1 - cf) * 1.2);
        }
        if (note === 0x07) { // EQ High A
          const v = mapEq(velocity);
          buf.deckA.eq = { ...(buf.deckA.eq || deckA.eq), high: v };
          if (ctx) ctx.setEq('A', 'high', v);
        }
        if (note === 0x0B) { // EQ Mid A
          const v = mapEq(velocity);
          buf.deckA.eq = { ...(buf.deckA.eq || deckA.eq), mid: v };
          if (ctx) ctx.setEq('A', 'mid', v);
        }
        if (note === 0x0F) { // EQ Low A
          const v = mapEq(velocity);
          buf.deckA.eq = { ...(buf.deckA.eq || deckA.eq), low: v };
          if (ctx) ctx.setEq('A', 'low', v);
        }
        if (note === 0x03) { // Gain/Trim A
          const v = mapGain(velocity);
          buf.deckA = { ...buf.deckA, gain: v };
          if (ctx) ctx.setTrim('A', v);
        }

      }


      if (channel === 2) {
        // Deck B
        if (note === 0x00) { // Pitch B
          const bpm = deckB.config.bpm;
          const targetBpm = mapPitch(velocity, bpm);
          const newRate = targetBpm / bpm;
          buf.deckB = { ...buf.deckB, pitch: newRate };
          if (ctx) ctx.setPlaybackRate('B', newRate);
        }
        if (note === 0x13) { // Fader B
          const vol = mapFader(velocity);
          buf.deckB.volume = vol;
          const cf = buf.crossfader !== null ? buf.crossfader : crossfader;
          if (ctx) ctx.setVolume('B', vol * cf * 1.2);
        }
        if (note === 0x07) { // EQ High B
          const v = mapEq(velocity);
          buf.deckB.eq = { ...(buf.deckB.eq || deckB.eq), high: v };
          if (ctx) ctx.setEq('B', 'high', v);
        }
        if (note === 0x0B) { // EQ Mid B
          const v = mapEq(velocity);
          buf.deckB.eq = { ...(buf.deckB.eq || deckB.eq), mid: v };
          if (ctx) ctx.setEq('B', 'mid', v);
        }
        if (note === 0x0F) { // EQ Low B
          const v = mapEq(velocity);
          buf.deckB.eq = { ...(buf.deckB.eq || deckB.eq), low: v };
          if (ctx) ctx.setEq('B', 'low', v);
        }
        if (note === 0x03) { // Gain/Trim B
          const v = mapGain(velocity);
          buf.deckB = { ...buf.deckB, gain: v };
          if (ctx) ctx.setTrim('B', v);
        }

      }

      if (channel === 7) {
        // Mixer Section / Crossfader
        if (note === 0x1F) { // Crossfader
          const cf = 1 - mapFader(velocity); // Inverted (127-0)
          buf.crossfader = cf;
          if (ctx) {
            const volA = buf.deckA.volume !== undefined ? buf.deckA.volume : deckA.volume;
            const volB = buf.deckB.volume !== undefined ? buf.deckB.volume : deckB.volume;
            ctx.setVolume('A', volA * (1 - cf) * 1.2);
            ctx.setVolume('B', volB * cf * 1.2);
          }
        }
        // Browse rotary encoder (CC 0x40: Relative)
        if (note === 0x40) {
          const now = performance.now();
          if (now - lastMidiNavTime.current < 50) return; // 50ms cooldown to prevent double-clicks/jitter
          
          // Relative encoder handling for DDJ-SR: 1..63 = Forward, 127..65 = Backward
          const dir = (velocity > 0 && velocity < 64) ? 1 : (velocity > 64) ? -1 : 0;
          if (dir !== 0) {
            lastMidiNavTime.current = now;
            setBrowserSelectedIdx(prev => {
              const max = allBrowserTracks.current.length - 1;
              return Math.max(0, Math.min(max, prev + dir));
            });
          }
        }
      }

      midiBoothBufferRef.current = buf;
      return; // fast exit — React flush happens in rAF
    }

    // ── Note-On: Buttons ────────────────────────────────────────────────────
    if (type === 0x90 && velocity > 0) {
      if (note === 0x0B) togglePlay(channel === 1 ? 'A' : 'B');   // PLAY
      if (note === 0x0C) handleCue(channel === 1 ? 'A' : 'B');    // CUE
      if (note === 0x58) handleSync(channel === 1 ? 'A' : 'B');   // SYNC
      if (note === 0x1A) setBrowserOpen(prev => !prev);           // Open/close library
      // LOAD buttons (Note 0x46 = Load A, 0x47 = Load B)
      if (note === 0x46) {
        const track = allBrowserTracks.current[browserSelectedIdx];
        if (track) loadTrack('A', track);
      }
      if (note === 0x47) {
        const track = allBrowserTracks.current[browserSelectedIdx];
        if (track) loadTrack('B', track);
      }
    }
  });

  // Flush MIDI booth buffer to React state at ~30fps (in the rAF loop)
  useAnimationFrame(() => {
    const buf = midiBoothBufferRef.current;
    if (!buf) return;
    const now = performance.now();
    if (now - lastMidiBoothUiRef.current < 33) return;
    lastMidiBoothUiRef.current = now;
    if (Object.keys(buf.deckA).length > 0) setDeckA(prev => ({ ...prev, ...buf.deckA }));
    if (Object.keys(buf.deckB).length > 0) setDeckB(prev => ({ ...prev, ...buf.deckB }));
    if (buf.crossfader !== null) setCrossfader(buf.crossfader);
    midiBoothBufferRef.current = null;
  });

  if (!isReady || !audioCtx) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: '#fff' }}>
        {t('booth.status.booting')}
      </div>
    );
  }

  return (
    <div className="booth-container" style={{
      height: '100vh',
      background: theme.bg,
      padding: '10px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      overflowY: 'auto',
      color: theme.text,
      transition: 'background 0.3s, color 0.3s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-crayon" onClick={onBack} style={{ background: theme.btnBg, color: theme.btnText, borderColor: theme.border }}>{t('booth.back')}</button>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', color: theme.text }}>
             {t('booth.title')} <span style={{ 
               color: theme.accent, 
               textShadow: theme === THEMES.dark ? `0 0 15px ${theme.accent}88` : 'none' 
             }}>{t('booth.subtitle')}</span>
           </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Mode Switch */}
          <button 
           onClick={() => setIsDarkMode(!isDarkMode)}
           className="btn-crayon"
           style={{ 
             background: theme.btnBg, 
             color: theme.btnText, 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             padding: '8px',
             borderRadius: '50%',
             width: '40px',
             height: '40px'
           }}
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            onClick={() => setMidiPanelOpen((v) => !v)}
            className="btn-crayon"
            title="MIDI"
            style={{
              background: theme.btnBg,
              color: theme.btnText,
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 900,
              letterSpacing: '1px',
            }}
          >
            MIDI
          </button>

          {isRecording && (
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ padding: '5px 10px', background: '#ff6b6b', color: '#fff', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {t('booth.recording.on')}
            </motion.div>
          )}
          {!isRecording ? (
            <button className="btn-crayon" style={{ background: '#ff6b6b', color: '#2b2b2b' }} onClick={startRec}>{t('booth.recording.start')}</button>
          ) : (
            <button className="btn-crayon" style={{ background: '#333', color: '#fff' }} onClick={stopRec}>{t('booth.recording.stop')}</button>
          )}
          {recordingResult && (
            <a href={recordingResult.url} download="patrick_mix.ogg" className="btn-crayon" style={{ background: '#2ecc71', color: '#2b2b2b', textDecoration: 'none' }}>
              {t('booth.recording.download')}
            </a>
          )}
        </div>
      </div>

      {midiPanelOpen && (
        <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
          <MidiSelector />
        </div>
      )}

      {/* Coach en bandeau dans le flux (comme dans les niveaux) : ne recouvre plus les decks */}
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <CoachPatrick tips={[profTip]} />
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <SpectrumVisualizer audioCtx={audioCtx} deckA={deckA} deckB={deckB} configA={deckA.config} configB={deckB.config} theme={theme} />
      </div>

      <div className="booth-main" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: '12px',
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        minHeight: 0,
        paddingBottom: '10px'
      }}>
        {/* Tablette (< 1024px) : decks côte à côte, mixer + bibliothèque en dessous sur toute la largeur */}
        <style>{`@media (max-width: 1023px) { .booth-main .center-booth-column { order: 3; flex-basis: 100% !important; min-width: 0 !important; } }`}</style>
        {/* DECK A at the Left */}
        <DeckUI deckId="A" state={deckA} setState={setDeckA} onPlay={togglePlay} onCue={handleCue} onSync={handleSync} audioCtxRef={audioCtxRef} theme={theme} />

        {/* CENTER COLUMN: Mixer + Browser */}
        <div className="center-booth-column" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 2,
          minWidth: '400px',
          minHeight: 0
        }}>
          {/* MIXER PART - Premium Sizes */}
          <div className="mixer-section" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '12px 16px',
            background: theme.mixerBg,
            borderRadius: '30px',
            border: `4px solid ${theme.border}`,
            alignItems: 'center',
            boxShadow: theme.shadow,
            position: 'relative'
          }}>
            {/* MIDI Interface Module Connection */}
            <div style={{
              position: 'absolute',
              top: '-38px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '38px',
              background: '#fff',
              border: `4px solid ${theme.border}`,
              borderRadius: '15px 15px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 900,
              color: '#333',
              boxShadow: theme.shadow,
              zIndex: 5,
              borderBottom: 'none'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <motion.div 
                  animate={{ opacity: [1, 0.4, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 5px #2ecc71' }} 
                />
                PATRICKBUS USB
              </div>
            </div>

            <h3 style={{ color: theme.mixerText, fontSize: '0.8rem', margin: 0, letterSpacing: '4px', opacity: 0.8, fontWeight: 900 }}>{t('booth.mixer')}</h3>
            
            <div style={{ display: 'flex', gap: '28px', alignItems: 'stretch', justifyContent: 'center', width: '100%' }}>
               
               {/* Channel A (Left) */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: theme.mixerText }}>CH A</div>

                  <GainKnob
                    value={deckA.gain}
                    onChange={v => setDeckA(prev => ({ ...prev, gain: v }))}
                    color="#4ecdc4"
                    size={22}
                    labelColor={theme.mixerText}
                  />

                  <EqKnobs
                    values={deckA.eq}
                    onChange={(band, v) => setDeckA(prev => ({ ...prev, eq: { ...prev.eq, [band]: v } }))}
                    color="#4ecdc4"
                    size={38}
                    gap={6}
                    labelColor={theme.mixerText}
                  />

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <VUMeter audioCtx={audioCtx} deckId="A" theme={theme} />
                    <VolumeFader
                      value={deckA.volume}
                      onChange={v => setDeckA(prev => ({ ...prev, volume: v }))}
                      handleColor={theme.vol}
                      labelColor={theme.mixerText}
                      labelSize="0.7rem"
                      trackLength={90}
                      handleSize={40}
                    />
                  </div>
               </div>

               {/* Central Divider */}
               <div style={{ width: '2px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.08)' }} />

               {/* Channel B (Right) */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: theme.mixerText }}>CH B</div>

                  <GainKnob
                    value={deckB.gain}
                    onChange={v => setDeckB(prev => ({ ...prev, gain: v }))}
                    color="#5DADE2"
                    size={22}
                    labelColor={theme.mixerText}
                  />

                  <EqKnobs
                    values={deckB.eq}
                    onChange={(band, v) => setDeckB(prev => ({ ...prev, eq: { ...prev.eq, [band]: v } }))}
                    color="#5DADE2"
                    size={38}
                    gap={6}
                    labelColor={theme.mixerText}
                  />

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <VolumeFader
                      value={deckB.volume}
                      onChange={v => setDeckB(prev => ({ ...prev, volume: v }))}
                      handleColor={theme.vol}
                      labelColor={theme.mixerText}
                      labelSize="0.7rem"
                      trackLength={90}
                      handleSize={40}
                    />
                    <VUMeter audioCtx={audioCtx} deckId="B" theme={theme} />
                  </div>
               </div>
            </div>

            {/* Crossfader */}
            <div style={{ marginTop: '10px', width: '100%', padding: '0 40px' }}>
              <Crossfader
                value={crossfader}
                onChange={setCrossfader}
                handleSize={65}
              />
            </div>
          </div>

          {/* BROWSER PART - Integrated */}
          <TrackBrowser
            tracks={allBrowserTracks.current}
            columns={['title', 'bpm', 'key']}
            onLoadToDeck={loadTrack}
            selectedIndex={browserSelectedIdx}
            theme={theme}
          />
        </div>

        {/* DECK B at the Right */}
        <DeckUI deckId="B" state={deckB} setState={setDeckB} onPlay={togglePlay} onCue={handleCue} onSync={handleSync} audioCtxRef={audioCtxRef} theme={theme} />
      </div>



      {/* Saturation Vignette Layer - Non-intrusive */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 1500,
        boxShadow: `inset 0 0 ${saturationIntensity * 250}px rgba(255, 0, 0, ${saturationIntensity * 0.65})`,
        transition: 'box-shadow 0.05s ease-out'
      }} />

      {/* Characters Layer */}
      <div className="booth-coach-layer" style={{ pointerEvents: 'none' }}>
          {/* Angry Sound Guy - Center Overlay */}
          <AnimatePresence>
            {isAgentAngry && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ 
                  position: 'fixed', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(0,0,0,0.4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  zIndex: 2000,
                  pointerEvents: 'auto'
                }}
              >
                 <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="speech-bubble-angry" style={{ 
                      background: '#ff6b6b', 
                      color: '#fff',
                      border: '6px solid #333', 
                      borderRadius: '30px', 
                      padding: '20px 30px', 
                      maxWidth: '400px',
                      width: '90vw',
                      marginBottom: '20px',
                      position: 'relative',
                      boxShadow: '15px 15px 0 rgba(0,0,0,0.2)',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      <button 
                        onClick={() => {
                          setIsAgentAngry(false);
                          setIsAgentDismissed(true);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          fontWeight: 900,
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                      {agentTip}
                      <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderTop: '20px solid #333', borderLeft: '20px solid transparent', borderRight: '20px solid transparent' }} />
                    </div>
                    <img src={agentImg} alt="Agent Patrick" style={{ width: '320px', filter: 'var(--sticker-shadow)' }} />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-crayon { border: 3px solid ${theme.border}; border-radius: 15px; padding: 10px 20px; cursor: pointer; font-weight: 900; font-family: inherit; transition: all 0.2s; box-shadow: 4px 4px 0 rgba(0,0,0,0.1); background: ${theme.btnBg}; color: ${theme.btnText}; }
        .btn-crayon:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 rgba(0,0,0,0.1); filter: brightness(1.1); }
        .btn-crayon:active { transform: translate(2px, 2px); box-shadow: 0px 0px 0 rgba(0,0,0,0); }
        .speech-bubble-magic, .speech-bubble-angry { font-family: 'Patrick Hand', cursive; color: #333; }
        
        .dismiss-prof:hover { opacity: 1 !important; color: ${theme.pause} !important; }
        
        .professor-booth img { width: 250px; transition: filter 0.3s; }
        
        @media (max-width: 768px) {
          .professor-booth { top: 60px; left: 10px; }
          .professor-booth img { width: 120px; }
          .speech-bubble-magic { max-width: 150px; font-size: 0.7rem; }
          .speech-bubble-angry { font-size: 0.9rem; padding: 15px; }
          .booth-coach-layer img { width: 200px; filter: ${theme.coachFilter}; }
        }
      `}} />
    </div>
  );
};

// Sur téléphone, le booth complet (2 decks + mixer) ne tient pas : écran de garde avec Patrick.
const BoothPhoneGate = ({ onBack }) => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="app-container booth-gate">
      <img src={agentImg} alt="" className="booth-gate-img" />
      <div className="booth-gate-bubble">
        <h1>{t('booth.mobileGate.title')}</h1>
        <p>{t('booth.mobileGate.text')}</p>
      </div>
      <button className="btn-crayon nudge-btn" onClick={onBack}>{t('booth.mobileGate.back')}</button>
      <style>{`
        .booth-gate { align-items: center; justify-content: center; gap: 18px; text-align: center; padding: 24px 16px; }
        .booth-gate-img { width: min(70vw, 260px); filter: var(--sticker-shadow); }
        .booth-gate-bubble { background: #fff; color: #2b2b2b; border: 3px solid #333; border-radius: 20px; padding: 14px 18px; max-width: 34ch; box-shadow: 4px 4px 0 rgba(0,0,0,0.12); }
        .booth-gate-bubble h1 { font-size: 1.4rem; margin: 0 0 6px; }
        .booth-gate-bubble p { margin: 0; line-height: 1.45; }
      `}</style>
    </div>
  );
};

const SecretBooth = (props) => {
  const isPhone = useMobileDetection(699);
  return isPhone ? <BoothPhoneGate {...props} /> : <SecretBoothFull {...props} />;
};

export default SecretBooth;
