// A simplified, robust wrapper around Web Audio API for our DJ Kids game.
// Handles two tracks (Train A, Train B), playback rates, and play/pause logic.

import { PitchShifter, registerWsolaWorklet } from './PitchShifter.js';

export class MagicAudioContext {
  constructor() {
    this.ctx = null;
    this.decks = {
      A: { isPlaying: false, source: null, pitchShifter: null, keyLock: false, buffer: null, rate: 1.0, currentPosition: 0, startTime: 0, trim: null, analyser: null, gain: null, eq: { low: 0, mid: 0, high: 0 }, volume: 1.0, gainValue: 1.0, filterValue: 0, filterNode: null, delayMix: 0, delayTimeBeats: 1, delayFeedback: 0.4, delayNode: null, delayWet: null, delayFeedbackGain: null, bpm: 120, reverbWet: 0, reverbNode: null, reverbWetGain: null, loopRollActive: false, loopRollSize: 0, loopRollExpectedStart: 0 },
      B: { isPlaying: false, source: null, pitchShifter: null, keyLock: false, buffer: null, rate: 1.0, currentPosition: 0, startTime: 0, trim: null, analyser: null, gain: null, eq: { low: 0, mid: 0, high: 0 }, volume: 1.0, gainValue: 1.0, filterValue: 0, filterNode: null, delayMix: 0, delayTimeBeats: 1, delayFeedback: 0.4, delayNode: null, delayWet: null, delayFeedbackGain: null, bpm: 120, reverbWet: 0, reverbNode: null, reverbWetGain: null, loopRollActive: false, loopRollSize: 0, loopRollExpectedStart: 0 }
    };
    this.masterGain = null;
    this.analyser = null;
    this._preview = null;
  }

  async init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      // Master Chain
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Register the WSOLA AudioWorklet used by PitchShifter (master tempo / key lock).
      // Must resolve before any keyLock-enabled playback.
      const base = import.meta.env.BASE_URL || '/';
      const workletUrl = `${base}audio-worklets/wsola-processor.js`;
      try {
        await registerWsolaWorklet(this.ctx, workletUrl);
        console.log('[WSOLA] worklet registered at', workletUrl);
      } catch (err) {
        // AbortError = contexte fermé pendant le chargement (démontage) : pas une panne
        if (err?.name !== 'AbortError') console.error('[WSOLA] failed to register worklet at', workletUrl, err);
        throw err;
      }
    }
  }



  // Helper to generate a simple kick drum
  _addKick(data, start, sr, type, bufferLength) {
    const freq = type === 'A' ? 140 : 180;
    for (let j = 0; j < sr * 0.15; j++) {
      const idx = Math.floor(start) + j;
      if (idx < bufferLength) {
        const env = Math.exp(-25 * j / sr);
        const pitchDrop = Math.exp(-40 * j / sr) * freq; 
        data[idx] += Math.sin(2 * Math.PI * (freq + pitchDrop) * (j / sr)) * env * 0.8;
      }
    }
  }

  // Helper to generate a snare
  _addSnare(data, start, sr, bufferLength) {
    for (let j = 0; j < sr * 0.1; j++) {
      const idx = Math.floor(start) + j;
      if (idx < bufferLength) {
        const env = Math.exp(-20 * j / sr);
        const noise = (Math.random() * 2 - 1) * 0.4;
        data[idx] += noise * env;
      }
    }
  }

  // Helper to generate a hi-hat
  _addHat(data, start, sr, bufferLength) {
    for (let j = 0; j < sr * 0.05; j++) {
      const idx = Math.floor(start) + j;
      if (idx < bufferLength) {
        const env = Math.exp(-60 * j / sr);
        const noise = (Math.random() * 2 - 1) * 0.2;
        data[idx] += noise * env;
      }
    }
  }

  // Helper to generate a bass pluck
  _addBass(data, start, sr, type, bufferLength) {
    const bassFreq = type === 'A' ? 55 : 65;
    for (let j = 0; j < sr * 0.2; j++) {
      const idx = Math.floor(start) + j;
      if (idx < bufferLength) {
        const env = Math.exp(-12 * j / sr);
        data[idx] += Math.sin(2 * Math.PI * bassFreq * (j / sr)) * env * 0.4;
      }
    }
  }

  generateSyntheticBeat(bpm, type, lengthInSecs = 120, complexity = 1) {
    const sr = this.ctx.sampleRate;
    const beatLength = 60 / bpm;
    const halfBeat = beatLength / 2;
    const totalHalfBeats = Math.ceil(lengthInSecs / halfBeat);
    const bufferLength = Math.ceil(sr * lengthInSecs);
    const buffer = this.ctx.createBuffer(1, bufferLength, sr);
    const data = buffer.getChannelData(0);

    const beatsPerLoop = 8;
    const beatsPerPhrase = 32;

    for (let i = 0; i < totalHalfBeats; i++) {
        const start = i * halfBeat * sr;
        if (Math.floor(start) >= bufferLength) break;

        const beatIndex = i / 2;
        const isKick = (i % 2 === 0);
        const isSnare = (i % 4 === 2);
        const isHat = (i % 2 !== 0);
        const isLoopStart = (i % (beatsPerLoop * 2) === 0);
        const isPhraseStart = (i % (beatsPerPhrase * 2) === 0);

        const phaseIndex = complexity >= 5 ? Math.floor(beatIndex / beatsPerPhrase) % 5 : -1;
        const isBreak = (phaseIndex === 3);

        if (complexity >= 1 && isKick && !isBreak) {
          this._addKick(data, start, sr, type, bufferLength);
        }

        if (complexity >= 3) {
          if (isSnare && !isBreak) {
            this._addSnare(data, start, sr, bufferLength);
          } else if (isHat) {
            this._addHat(data, start, sr, bufferLength);
          }
        }

        if (complexity >= 4 && isLoopStart) {
          // Loop Accent (Cowbell style)
          const freq = 800;
          for (let j = 0; j < sr * 0.1; j++) {
            const idx = Math.floor(start) + j;
            if (idx < bufferLength) {
              const env = Math.exp(-30 * j / sr);
              data[idx] += Math.sin(2 * Math.PI * freq * (j / sr)) * env * 0.2;
            }
          }
        }

        if (complexity >= 5) {
          if (isPhraseStart) {
            // Phrase Accent (Crash)
            for (let j = 0; j < sr * 2.0; j++) {
              const idx = Math.floor(start) + j;
              if (idx < bufferLength) {
                const env = Math.exp(-3 * j / sr);
                const noise = (Math.random() * 2 - 1) * 0.4;
                data[idx] += noise * env;
              }
            }
          }

          if (phaseIndex === 2 || phaseIndex === 0 || phaseIndex === 4) {
            if (i % 8 === 0 || i % 8 === 3 || i % 8 === 6) {
              this._addBass(data, start, sr, type, bufferLength);
            }
          }

          if (phaseIndex === 1) {
            // Build-up Riser
            const riserEnv = ((beatIndex % beatsPerPhrase) / beatsPerPhrase) * 0.2;
            for (let j = 0; j < sr * halfBeat; j++) {
              const idx = Math.floor(start) + j;
              if (idx < bufferLength) {
                data[idx] += (Math.random() * 2 - 1) * riserEnv;
              }
            }
          }

          if (phaseIndex === 3) {
            // Break: Melodic Arpeggio
            const notes = type === 'A' ? [220, 277, 330, 440] : [261, 329, 392, 523];
            const note = notes[Math.floor(beatIndex % notes.length)];
            for (let j = 0; j < sr * 0.3; j++) {
              const idx = Math.floor(start) + j;
              if (idx < bufferLength) {
                const env = Math.exp(-8 * j / sr);
                data[idx] += Math.sin(2 * Math.PI * note * (j / sr)) * env * 0.2;
              }
            }
          }
        }
    }

    return buffer;
  }

  async loadTrack(deckId, url, defaultBpm = 120, lengthInSecs = 160, complexity = 1) {
    if (!url) {
      this.decks[deckId].buffer = this.generateSyntheticBeat(defaultBpm, deckId, lengthInSecs, complexity);
      this.decks[deckId].bpm = defaultBpm;
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.decks[deckId].buffer = audioBuffer;
      this.decks[deckId].bpm = defaultBpm;

      // If the track is currently playing, we need to stop and restart it with the new buffer
      if (this.decks[deckId].isPlaying) {
        this.pauseTrack(deckId);
        await this.playTrack(deckId);
      }
    } catch (err) {
      console.error("Failed to load track:", err);
      this.decks[deckId].buffer = this.generateSyntheticBeat(defaultBpm, deckId, lengthInSecs, complexity || 1);
      this.decks[deckId].bpm = defaultBpm;
    }
  }

  async playTrack(deckId, loop = false) {
    const deck = this.decks[deckId];
    if (!deck || !deck.buffer || deck.isPlaying) return;
    
    deck.isPlaying = true; // Lock immediately to prevent orphaned sources from overlapping

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    // If someone called pauseTrack during the resume wait, deck.isPlaying will be false
    if (!deck.isPlaying) return;

    // Choose the source path based on keyLock (master tempo) state.
    // keyLock ON  → SoundTouch PitchShifter (tempo shifts BPM, pitch stays)
    // keyLock OFF → classic AudioBufferSourceNode (rate couples tempo and pitch)
    if (deck.keyLock) {
      deck.pitchShifter = new PitchShifter(this.ctx, deck.buffer);
      deck.pitchShifter.tempo = deck.rate;
      deck.pitchShifter.pitch = 1.0;
      const startPerc = deck.buffer.duration > 0 ? (deck.currentPosition / deck.buffer.duration) : 0;
      deck.pitchShifter.percentagePlayed = Math.max(0, Math.min(0.9999, startPerc));
      deck.source = null;
    } else {
      deck.source = this.ctx.createBufferSource();
      deck.source.buffer = deck.buffer;
      deck.source.playbackRate.value = deck.rate;
      deck.source.loop = loop;

      deck.source.onended = () => {
          // If the deck is still marked as playing, it means it ended naturally
          if (deck.isPlaying) {
              deck.isPlaying = false;
          }
      };
    }

    // Gain
    deck.gain = this.ctx.createGain();
    deck.gain.gain.value = deck.volume;

    // EQs
    deck.eqLow = this.ctx.createBiquadFilter();
    deck.eqLow.type = 'lowshelf';
    deck.eqLow.frequency.value = 250;
    deck.eqLow.gain.value = deck.eq.low;
    
    deck.eqMid = this.ctx.createBiquadFilter();
    deck.eqMid.type = 'peaking';
    deck.eqMid.frequency.value = 1000;
    deck.eqMid.Q.value = 1;
    deck.eqMid.gain.value = deck.eq.mid;
    
    deck.eqHigh = this.ctx.createBiquadFilter();
    deck.eqHigh.type = 'highshelf';
    deck.eqHigh.frequency.value = 4000;
    deck.eqHigh.gain.value = deck.eq.high;

    // Trim (Gain Potard)
    deck.trim = this.ctx.createGain();
    deck.trim.gain.value = deck.gainValue;

    // Analyser for VU Meter
    deck.analyser = this.ctx.createAnalyser();
    deck.analyser.fftSize = 256;

    // FX chain: Filter (between EQ and gain)
    deck.filterNode = this.ctx.createBiquadFilter();
    this._applyFilterValue(deck, deck.filterValue);

    // Delay send (BPM-synced)
    deck.delayNode = this.ctx.createDelay(2.0); // max 2s
    deck.delayWet = this.ctx.createGain();
    deck.delayFeedbackGain = this.ctx.createGain();
    deck.delayWet.gain.value = deck.delayMix;
    deck.delayFeedbackGain.gain.value = deck.delayFeedback;
    const beatSec = 60 / (deck.bpm || 120);
    deck.delayNode.delayTime.value = beatSec * deck.delayTimeBeats;

    // Feedback loop
    deck.delayNode.connect(deck.delayFeedbackGain);
    deck.delayFeedbackGain.connect(deck.delayNode);
    // Wet tap
    deck.delayNode.connect(deck.delayWet);

    // Reverb send
    deck.reverbNode = this.ctx.createConvolver();
    deck.reverbNode.buffer = this._buildReverbIR();
    deck.reverbWetGain = this.ctx.createGain();
    deck.reverbWetGain.gain.value = deck.reverbWet;
    deck.reverbNode.connect(deck.reverbWetGain);

    // Routing: source -> trim -> eqLow -> eqMid -> eqHigh -> filter -> gain -> master
    //                                                              \-> delay (send) -> delayWet -> gain
    //                                                              \-> reverb (send) -> reverbWetGain -> gain
    // VU meter analyser taps post-EQ / pre-FX, so new FX nodes (delay/reverb/...) won't shift its reading.
    const entryNode = deck.keyLock ? deck.pitchShifter.node : deck.source;
    entryNode.connect(deck.trim);
    deck.trim.connect(deck.eqLow);
    deck.eqLow.connect(deck.eqMid);
    deck.eqMid.connect(deck.eqHigh);
    deck.eqHigh.connect(deck.filterNode);
    deck.filterNode.connect(deck.gain);
    deck.filterNode.connect(deck.delayNode);
    deck.delayWet.connect(deck.gain);
    deck.filterNode.connect(deck.reverbNode);
    deck.reverbWetGain.connect(deck.gain);
    deck.eqHigh.connect(deck.analyser);
    deck.gain.connect(this.masterGain);

    // Final safety check before starting hardware source
    if (!deck.isPlaying) {
      this.pauseTrack(deckId);
      return;
    }

    // PitchShifter starts as soon as its node is connected; classic source needs explicit start().
    if (!deck.keyLock && deck.source) {
      deck.source.start(0, deck.currentPosition);
    }
    deck.startTime = this.ctx.currentTime - (deck.currentPosition / deck.rate);
  }

  setTrim(deckId, value) {
    const deck = this.decks[deckId];
    deck.gainValue = value;
    if (deck.trim) {
      deck.trim.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
    }
  }

  _applyFilterValue(deck, value) {
    if (!deck.filterNode) return;
    const v = Math.max(-1, Math.min(1, value));
    if (v === 0) {
      deck.filterNode.type = 'allpass';
      deck.filterNode.frequency.setTargetAtTime(1000, this.ctx.currentTime, 0.02);
      deck.filterNode.Q.setTargetAtTime(0.0001, this.ctx.currentTime, 0.02);
      return;
    }
    if (v < 0) {
      deck.filterNode.type = 'lowpass';
      // -1 -> 200 Hz, 0 -> 20000 Hz (exponential feel)
      const hz = 200 * Math.pow(20000 / 200, 1 + v);
      deck.filterNode.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.02);
      deck.filterNode.Q.setTargetAtTime(0.7, this.ctx.currentTime, 0.02);
    } else {
      deck.filterNode.type = 'highpass';
      // 0 -> 20 Hz, +1 -> 8000 Hz
      const hz = 20 * Math.pow(8000 / 20, v);
      deck.filterNode.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.02);
      deck.filterNode.Q.setTargetAtTime(0.7, this.ctx.currentTime, 0.02);
    }
  }

  _buildReverbIR(durationSec = 2.0, decay = 3.0) {
    const sr = this.ctx.sampleRate;
    const length = sr * durationSec;
    const ir = this.ctx.createBuffer(2, length, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return ir;
  }

  setFilter(deckId, value) {
    const deck = this.decks[deckId];
    if (!deck) return;
    deck.filterValue = value;
    this._applyFilterValue(deck, value);
  }

  setDelay(deckId, { mix, timeBeats, feedback } = {}) {
    const deck = this.decks[deckId];
    if (!deck) return;
    if (mix != null) {
      deck.delayMix = Math.max(0, Math.min(1, mix));
      if (deck.delayWet) {
        deck.delayWet.gain.setTargetAtTime(deck.delayMix, this.ctx.currentTime, 0.02);
      }
    }
    if (timeBeats != null) {
      deck.delayTimeBeats = timeBeats;
      const beatSec = 60 / (deck.bpm || 120);
      if (deck.delayNode) {
        deck.delayNode.delayTime.setTargetAtTime(beatSec * timeBeats, this.ctx.currentTime, 0.02);
      }
    }
    if (feedback != null) {
      deck.delayFeedback = Math.max(0, Math.min(0.95, feedback));
      if (deck.delayFeedbackGain) {
        deck.delayFeedbackGain.gain.setTargetAtTime(deck.delayFeedback, this.ctx.currentTime, 0.02);
      }
    }
  }

  setReverb(deckId, wet) {
    const deck = this.decks[deckId];
    if (!deck) return;
    deck.reverbWet = Math.max(0, Math.min(1, wet));
    if (deck.reverbWetGain) {
      deck.reverbWetGain.gain.setTargetAtTime(deck.reverbWet, this.ctx.currentTime, 0.02);
    }
  }

  triggerLoopRoll(deckId, sizeBeats, active) {
    const deck = this.decks[deckId];
    if (!deck || !deck.source || !deck.isPlaying || !deck.buffer) return;
    // Loop roll relies on an AudioBufferSourceNode — not supported under master tempo.
    if (deck.keyLock || deck.pitchShifter) return;
    const now = this.ctx.currentTime;
    const duration = deck.buffer.duration;
    const bpm = deck.bpm || 120;
    const secPerBeat = 60 / bpm;

    if (active) {
      // Snap current position to beat boundary
      const currentPos = ((now - deck.startTime) * deck.rate) % duration;
      const beatIdx = Math.floor(currentPos / secPerBeat);
      const loopStart = beatIdx * secPerBeat;
      const loopEnd = loopStart + sizeBeats * secPerBeat;

      // Kill current source
      try { deck.source.onended = null; deck.source.stop(); } catch { /* already stopped */ }

      // Create looping source
      const src = this.ctx.createBufferSource();
      src.buffer = deck.buffer;
      src.playbackRate.value = deck.rate;
      src.loop = true;
      src.loopStart = loopStart;
      src.loopEnd = Math.min(loopEnd, duration);
      src.onended = () => { if (deck.isPlaying) deck.isPlaying = false; };
      src.connect(deck.trim);
      src.start(0, loopStart);

      deck.source = src;
      deck.startTime = now - loopStart / deck.rate;
      deck.loopRollExpectedStart = loopStart;
      deck.loopRollActive = true;
      deck.loopRollSize = sizeBeats;
    } else {
      // Resume at the position the track would be at if not looped
      const elapsedSincePress = now - deck.startTime - deck.loopRollExpectedStart / deck.rate;
      const resumePos = (deck.loopRollExpectedStart + elapsedSincePress * deck.rate) % duration;

      try { deck.source.onended = null; deck.source.stop(); } catch { /* already stopped */ }

      const src = this.ctx.createBufferSource();
      src.buffer = deck.buffer;
      src.playbackRate.value = deck.rate;
      src.onended = () => { if (deck.isPlaying) deck.isPlaying = false; };
      src.connect(deck.trim);
      src.start(0, resumePos);

      deck.source = src;
      deck.startTime = now - resumePos / deck.rate;
      deck.loopRollActive = false;
      deck.loopRollSize = 0;
      deck.loopRollExpectedStart = 0;
    }
  }

  async playPreview(url, durationMs = 8000, startOffsetSec = 10) {
    if (!this.ctx) return;
    this.stopPreview();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    let buffer;
    try {
      const resp = await fetch(url);
      const arr = await resp.arrayBuffer();
      buffer = await this.ctx.decodeAudioData(arr);
    } catch {
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.7;
    source.connect(gain);
    gain.connect(this.masterGain);

    const offset = Math.min(startOffsetSec, Math.max(0, buffer.duration - durationMs / 1000 - 1));
    source.start(0, offset);

    const stopTimeout = setTimeout(() => this.stopPreview(), durationMs);
    // Short fade-in/out to avoid clicks
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.7, this.ctx.currentTime + durationMs / 1000 - 0.12);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + durationMs / 1000);

    this._preview = { source, gain, stopTimeout };
  }

  stopPreview() {
    if (!this._preview) return;
    clearTimeout(this._preview.stopTimeout);
    try { this._preview.source.stop(); } catch { /* already stopped */ }
    this._preview = null;
  }

  getMeterLevel(deckId) {
    const deck = this.decks[deckId];
    if (!deck || !deck.analyser || !deck.isPlaying) return 0;
    
    const dataArray = new Uint8Array(deck.analyser.frequencyBinCount);
    deck.analyser.getByteTimeDomainData(dataArray);
    
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const val = Math.abs(dataArray[i] - 128);
        if (val > max) max = val;
    }
    return max / 128; // 0 to 1
  }

  isClipping(deckId) {
    const level = this.getMeterLevel(deckId);
    return level > 0.98;
  }

  setEq(deckId, band, valueDb) {
    const deck = this.decks[deckId];
    if (!deck) return;
    
    deck.eq[band] = valueDb;
    
    if (deck.isPlaying) {
      if (band === 'low' && deck.eqLow) deck.eqLow.gain.setTargetAtTime(valueDb, this.ctx.currentTime, 0.05);
      if (band === 'mid' && deck.eqMid) deck.eqMid.gain.setTargetAtTime(valueDb, this.ctx.currentTime, 0.05);
      if (band === 'high' && deck.eqHigh) deck.eqHigh.gain.setTargetAtTime(valueDb, this.ctx.currentTime, 0.05);
    }
  }

  pauseTrack(deckId) {
    const deck = this.decks[deckId];
    if (!deck) return;

    // Aggressively stop any existing source regardless of state flags
    if (deck.source) {
      try {
        deck.source.stop();
        deck.source.onended = null;
      } catch {
        // Source might not have started or already stopped
      }
      deck.source = null;
    }
    if (deck.pitchShifter) {
      try { deck.pitchShifter.disconnect(); } catch { /* already disposed */ }
      deck.pitchShifter = null;
    }

    deck.isPlaying = false;

    if (deck.buffer) {
      const elapsed = (this.ctx.currentTime - deck.startTime) * deck.rate;
      deck.currentPosition = elapsed % deck.buffer.duration;
    }
  }

  setVolume(deckId, volume, rampTime = 0.05) {
    const deck = this.decks[deckId];
    if (!deck) return;
    
    deck.volume = volume;
    if (deck.gain) {
      deck.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, rampTime);
    }
  }

  async fadeOutDeck(deckId, durationSec = 1.0) {
    const deck = this.decks[deckId];
    if (!deck.isPlaying || !deck.gain) return;

    const currentVal = deck.gain.gain.value;
    deck.gain.gain.setValueAtTime(currentVal, this.ctx.currentTime);
    deck.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + durationSec);

    return new Promise(resolve => {
      setTimeout(() => {
        this.pauseTrack(deckId);
        // Reset volume for next time
        if (deck.gain) {
          deck.gain.gain.setValueAtTime(1, this.ctx.currentTime);
        }
        resolve();
      }, durationSec * 1000);
    });
  }

  setPlaybackRate(deckId, rate) {
    const deck = this.decks[deckId];
    if (!deck || rate <= 0) return;

    // Rebase startTime so that getTrackPosition stays correct after a rate change.
    // Without this, (now - startTime) * newRate assumes newRate applied since play start,
    // causing cumulative drift proportional to every pitch adjustment.
    if (deck.isPlaying) {
      const now = this.ctx.currentTime;
      const currentPos = (now - deck.startTime) * deck.rate;
      deck.startTime = now - currentPos / rate;
    }

    deck.rate = rate;
    if (deck.isPlaying) {
      if (deck.pitchShifter) {
        // SoundTouch tempo setter is instant — no AudioParam ramp. Pitch stays at 1.0.
        deck.pitchShifter.tempo = rate;
      } else if (deck.source) {
        deck.source.playbackRate.setTargetAtTime(rate, this.ctx.currentTime, 0.05);
      }
    }
  }

  // Toggle master tempo (key lock). Preserves position by re-creating the source path.
  setKeyLock(deckId, enabled) {
    const deck = this.decks[deckId];
    if (!deck) return;
    const wantOn = !!enabled;
    if (deck.keyLock === wantOn) return;

    if (!deck.isPlaying) {
      deck.keyLock = wantOn;
      return;
    }

    // Capture live position before tearing down the path.
    const now = this.ctx.currentTime;
    const duration = deck.buffer ? deck.buffer.duration : 0;
    const pos = duration > 0 ? (((now - deck.startTime) * deck.rate) % duration) : 0;

    if (deck.source) {
      try { deck.source.onended = null; deck.source.stop(); } catch { /* already stopped */ }
      deck.source = null;
    }
    if (deck.pitchShifter) {
      try { deck.pitchShifter.disconnect(); } catch { /* already disposed */ }
      deck.pitchShifter = null;
    }

    deck.currentPosition = pos;
    deck.isPlaying = false;
    deck.keyLock = wantOn;
    this.playTrack(deckId);
  }

  nudgeTrack(deckId, offsetSec) {
    const deck = this.decks[deckId];
    if (!deck || !deck.isPlaying || !deck.buffer) return;
    if (deck.pitchShifter) {
      // Seek via PitchShifter percentage; keeps tempo/pitch untouched.
      const duration = deck.buffer.duration;
      const now = this.ctx.currentTime;
      const currentPos = ((now - deck.startTime) * deck.rate) % duration;
      const newPos = ((currentPos + offsetSec) % duration + duration) % duration;
      deck.pitchShifter.percentagePlayed = Math.max(0, Math.min(0.9999, newPos / duration));
      deck.startTime = now - newPos / deck.rate;
      return;
    }
    if (!deck.source) return;

    // AudioBufferSourceNode can't seek — replace the source at the nudged position.
    const now = this.ctx.currentTime;
    const duration = deck.buffer.duration;
    const currentPos = ((now - deck.startTime) * deck.rate) % duration;
    const newPos = ((currentPos + offsetSec) % duration + duration) % duration;

    try {
      deck.source.onended = null;
      deck.source.stop();
    } catch { /* already stopped */ }

    const newSource = this.ctx.createBufferSource();
    newSource.buffer = deck.buffer;
    newSource.playbackRate.value = deck.rate;
    newSource.onended = () => { if (deck.isPlaying) deck.isPlaying = false; };
    newSource.connect(deck.trim);
    newSource.start(0, newPos);

    deck.source = newSource;
    deck.startTime = now - newPos / deck.rate;
  }

  cueTrack(deckId, position = 0) {
    // Unconditionally stop any existing playback for absolute silence
    this.pauseTrack(deckId);
    
    const deck = this.decks[deckId];
    if (deck) {
      deck.currentPosition = position;
    }
  }



  getTrackPosition(deckId) {
    const deck = this.decks[deckId];
    const duration = deck.buffer ? deck.buffer.duration : 1;
    if (!deck || !deck.buffer) return 0;
    if (!deck.isPlaying) return deck.currentPosition % duration;
    return ((this.ctx.currentTime - deck.startTime) * deck.rate) % duration;
  }

  // Recording Logic
  startRecording() {
    if (!this.ctx) return;
    
    const dest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(dest);
    
    this.mediaRecorder = new MediaRecorder(dest.stream);
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (evt) => {
      if (evt.data.size > 0) this.chunks.push(evt.data);
    };
    
    this.mediaRecorder.start();
    console.log("Recording started...");
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(null);
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
        this.chunks = [];
      };
      
      this.mediaRecorder.stop();
      console.log("Recording stopped.");
    });
  }
}
