/**
 * TODO — AmbientPlayer placeholders
 *
 * Actuellement : 3 ambiances synthétiques Web Audio (sine/triangle/saw pads).
 *
 * À remplacer par de vraies boucles :
 *   - public/ambient/studio_day.mp3   (EASY, ~2-4 min seamless loop, -24 LUFS, stereo)
 *   - public/ambient/bar_evening.mp3  (MEDIUM, même specs)
 *   - public/ambient/club_night.mp3   (PRO, même specs)
 *
 * Dès que les fichiers sont déposés, décommenter la section FILE_BASED ci-dessous
 * et supprimer le bloc SYNTH_PLACEHOLDER.
 */

import { useEffect, useRef } from 'react';
import { useDifficulty } from '../hooks/useDifficulty.jsx';
import { useSoundOn } from '../hooks/useSoundOn';

// Master level: ~ -30 dB => linear ≈ 0.0316
const MASTER_LEVEL = 0.0316;
const CROSSFADE_SEC = 0.5;

// Voice specs per difficulty
const VOICES = {
  EASY: [
    { type: 'sine', freq: 220, pan: -0.4, gain: 1.0 },
    { type: 'sine', freq: 440, pan:  0.4, gain: 0.6, lfoFreq: 0.08, lfoDepth: 0.25 },
  ],
  MEDIUM: [
    { type: 'sine',     freq: 110, pan: -0.3, gain: 1.0 },
    { type: 'triangle', freq: 165, pan:  0.3, gain: 0.55, lfoFreq: 0.1, lfoDepth: 0.3 },
  ],
  PRO: [
    { type: 'sawtooth', freq: 55,  pan: -0.2, gain: 1.0, lowpass: 300 },
    { type: 'sawtooth', freq: 110, pan:  0.2, gain: 0.45, lowpass: 500, lfoFreq: 0.07, lfoDepth: 0.35 },
  ],
};

export default function AmbientPlayer({ muted: mutedProp } = {}) {
  const [difficulty] = useDifficulty();
  const [soundOn] = useSoundOn();
  const effectiveMuted = mutedProp !== undefined ? mutedProp : !soundOn;

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const ambiencesRef = useRef({}); // { EASY: { gain, nodes: [] }, ... }
  const currentKeyRef = useRef(null);
  const startedRef = useRef(false);

  // ----- setup AudioContext + ambiences (suspended until first gesture) -----
  useEffect(() => {
    let disposed = false;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = effectiveMuted ? 0 : MASTER_LEVEL;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // Build the 3 ambiences, each routed through its own gain (initially 0).
      for (const key of Object.keys(VOICES)) {
        const bus = ctx.createGain();
        bus.gain.value = 0;
        bus.connect(master);

        const nodes = [];
        for (const voice of VOICES[key]) {
          const osc = ctx.createOscillator();
          osc.type = voice.type;
          osc.frequency.value = voice.freq;

          const vGain = ctx.createGain();
          vGain.gain.value = voice.gain;

          // Optional lowpass for darker PRO voices.
          let tail = vGain;
          if (voice.lowpass) {
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = voice.lowpass;
            lp.Q.value = 0.7;
            vGain.connect(lp);
            tail = lp;
          }

          // Stereo pan.
          let panNode = null;
          if (ctx.createStereoPanner) {
            panNode = ctx.createStereoPanner();
            panNode.pan.value = voice.pan || 0;
            tail.connect(panNode);
            tail = panNode;
          }

          tail.connect(bus);
          osc.connect(vGain);

          // Optional slow LFO modulating the osc frequency for a "pad" feel.
          let lfo = null;
          let lfoGain = null;
          if (voice.lfoFreq) {
            lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = voice.lfoFreq;
            lfoGain = ctx.createGain();
            lfoGain.gain.value = voice.freq * (voice.lfoDepth || 0.2);
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
          }

          nodes.push({ osc, lfo, vGain, lfoGain, panNode });
        }

        ambiencesRef.current[key] = { bus, nodes, started: false };
      }
    } catch {
      // Autoplay policy or unsupported — silently ignore.
    }

    // ----- Autoplay gesture: resume ctx + start oscillators on first click -----
    const onFirstGesture = () => {
      const ctx = ctxRef.current;
      if (!ctx || disposed) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { /* ignore */ });
      }
      if (!startedRef.current) {
        startedRef.current = true;
        try {
          const now = ctx.currentTime;
          for (const key of Object.keys(ambiencesRef.current)) {
            const amb = ambiencesRef.current[key];
            if (amb.started) continue;
            amb.started = true;
            for (const n of amb.nodes) {
              try { n.osc.start(now); } catch { /* ignore */ }
              if (n.lfo) { try { n.lfo.start(now); } catch { /* ignore */ } }
            }
          }
          // Fade in the currently-selected ambience.
          applyCrossfade(currentKeyRef.current || difficulty);
        } catch { /* ignore */ }
      }
    };
    document.addEventListener('click', onFirstGesture, { once: true });
    document.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
    document.addEventListener('keydown', onFirstGesture, { once: true });

    return () => {
      disposed = true;
      document.removeEventListener('click', onFirstGesture);
      document.removeEventListener('touchstart', onFirstGesture);
      document.removeEventListener('keydown', onFirstGesture);
      const ctx = ctxRef.current;
      try {
        for (const key of Object.keys(ambiencesRef.current)) {
          const amb = ambiencesRef.current[key];
          for (const n of amb.nodes) {
            try { n.osc.stop(); } catch { /* ignore */ }
            if (n.lfo) { try { n.lfo.stop(); } catch { /* ignore */ } }
          }
        }
      } catch { /* ignore */ }
      ambiencesRef.current = {};
      if (ctx) {
        try { ctx.close(); } catch { /* ignore */ }
      }
      ctxRef.current = null;
      masterGainRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- crossfade helper -----
  const applyCrossfade = (newKey) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const key of Object.keys(ambiencesRef.current)) {
      const amb = ambiencesRef.current[key];
      const target = key === newKey ? 1 : 0;
      try {
        amb.bus.gain.cancelScheduledValues(now);
        amb.bus.gain.setValueAtTime(amb.bus.gain.value, now);
        amb.bus.gain.linearRampToValueAtTime(target, now + CROSSFADE_SEC);
      } catch { /* ignore */ }
    }
    currentKeyRef.current = newKey;
  };

  // ----- react to difficulty changes -----
  useEffect(() => {
    if (!ctxRef.current || !startedRef.current) {
      // If not started yet, just stash the target — it'll be applied on first gesture.
      currentKeyRef.current = difficulty;
      return;
    }
    applyCrossfade(difficulty);
  }, [difficulty]);

  // ----- master mute via soundOn / prop -----
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const target = effectiveMuted ? 0 : MASTER_LEVEL;
    try {
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(target, now + 0.4);
    } catch { /* ignore */ }
  }, [effectiveMuted]);

  /* ---------------------------------------------------------------
   * FILE_BASED (activate once real loops land in public/ambient/):
   *
   * const FILES = {
   *   EASY:   `${import.meta.env.BASE_URL}ambient/studio_day.mp3`,
   *   MEDIUM: `${import.meta.env.BASE_URL}ambient/bar_evening.mp3`,
   *   PRO:    `${import.meta.env.BASE_URL}ambient/club_night.mp3`,
   * };
   *
   * // Load each as <audio loop> routed through MediaElementAudioSourceNode
   * // into a per-ambience gain node, then crossfade the same way.
   * --------------------------------------------------------------- */

  return null;
}
