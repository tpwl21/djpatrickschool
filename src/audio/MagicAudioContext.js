// A simplified, robust wrapper around Web Audio API for our DJ Kids game.
// Handles two tracks (Train A, Train B), playback rates, and play/pause logic.

export class MagicAudioContext {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.decks = {
      A: { isPlaying: false, source: null, buffer: null, rate: 1.0, currentPosition: 0, startTime: 0, gain: null },
      B: { isPlaying: false, source: null, buffer: null, rate: 1.0, currentPosition: 0, startTime: 0, gain: null }
    };
  }

  init() {
    return Promise.resolve(); // Context is resumed later on first play
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

  async loadTrack(deckId, url, defaultBpm = 120, lengthInSecs = 120, complexity = 1) {
    if (!url) {
      this.decks[deckId].buffer = this.generateSyntheticBeat(defaultBpm, deckId, lengthInSecs, complexity);
      return;
    }
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.decks[deckId].buffer = audioBuffer;
    } catch (err) {
      console.error("Failed to load track:", err);
      this.decks[deckId].buffer = this.generateSyntheticBeat(defaultBpm, deckId, lengthInSecs);
    }
  }

  async playTrack(deckId) {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    const deck = this.decks[deckId];
    if (deck.isPlaying) return;

    deck.source = this.ctx.createBufferSource();
    deck.source.buffer = deck.buffer;
    deck.source.playbackRate.value = deck.rate;
    deck.source.loop = true;

    deck.gain = this.ctx.createGain();
    deck.source.connect(deck.gain);
    deck.gain.connect(this.ctx.destination);

    deck.source.start(0, deck.currentPosition);
    deck.startTime = this.ctx.currentTime - (deck.currentPosition / deck.rate);
    deck.isPlaying = true;
  }

  pauseTrack(deckId) {
    const deck = this.decks[deckId];
    if (!deck.isPlaying) return;

    deck.source.stop();
    const duration = deck.buffer ? deck.buffer.duration : 1;
    deck.currentPosition = ((this.ctx.currentTime - deck.startTime) * deck.rate) % duration;
    deck.isPlaying = false;
  }

  setVolume(deckId, volume, rampTime = 0.05) {
    const deck = this.decks[deckId];
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
        deck.gain.gain.setValueAtTime(1, this.ctx.currentTime);
        resolve();
      }, durationSec * 1000);
    });
  }

  setPlaybackRate(deckId, rate) {
    const deck = this.decks[deckId];
    deck.rate = rate;
    if (deck.isPlaying && deck.source) {
      deck.source.playbackRate.value = rate;
      const duration = deck.buffer ? deck.buffer.duration : 1;
      deck.currentPosition = ((this.ctx.currentTime - deck.startTime) * deck.source.playbackRate.value) % duration;
      deck.startTime = this.ctx.currentTime - (deck.currentPosition / deck.rate);
    }
  }

  cueTrack(deckId) {
    const deck = this.decks[deckId];
    if (deck.isPlaying) {
      this.pauseTrack(deckId);
    }
    deck.currentPosition = 0;
  }

  nudgeTrack(deckId, amountSec) {
    const deck = this.decks[deckId];
    const duration = deck.buffer ? deck.buffer.duration : 1;
    
    if (deck.isPlaying) {
      // Calculate current position exactly before nudging
      deck.currentPosition = ((this.ctx.currentTime - deck.startTime) * deck.rate) % duration;
      deck.source.stop();
      deck.isPlaying = false;
      
      // Apply nudge and restart
      deck.currentPosition = (((deck.currentPosition + amountSec) % duration) + duration) % duration;
      this.playTrack(deckId);
    } else {
      deck.currentPosition = (((deck.currentPosition + amountSec) % duration) + duration) % duration;
    }
  }

  getTrackPosition(deckId) {
    const deck = this.decks[deckId];
    const duration = deck.buffer ? deck.buffer.duration : 1;
    if (!deck.isPlaying) return deck.currentPosition % duration;
    return ((this.ctx.currentTime - deck.startTime) * deck.rate) % duration;
  }
}
