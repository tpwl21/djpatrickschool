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

  // A simple synthesized beat for testing if no URL is provided.
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
        const isKick = (i % 2 === 0); // Every beat
        const isSnare = (i % 4 === 2); // Beats 2 and 4
        const isHat = (i % 2 !== 0); // Off-beats
        
        // Loop Marker (Beat 1 of 8)
        const isLoopStart = (i % (beatsPerLoop * 2) === 0);
        // Phrase Marker (Beat 1 of 32)
        const isPhraseStart = (i % (beatsPerPhrase * 2) === 0);

        if (complexity >= 1) {
           const phaseIndex = complexity >= 5 ? Math.floor(beatIndex / beatsPerPhrase) % 5 : -1;
           const isBreak = (phaseIndex === 3);

           // Basic Kick
           if (isKick && !isBreak) {
              const freq = type === 'A' ? 140 : 180;
              for (let j = 0; j < sr * 0.15; j++) {
                 if (start + j < bufferLength) {
                    const env = Math.exp(-25 * j / sr);
                    const pitchDrop = Math.exp(-40 * j / sr) * freq; 
                    data[Math.floor(start) + j] += Math.sin(2 * Math.PI * (freq + pitchDrop) * (j / sr)) * env * 0.8;
                 }
              }
           }
        }

        if (complexity >= 3) {
           const phaseIndex = complexity >= 5 ? Math.floor(beatIndex / beatsPerPhrase) % 5 : -1;
           const isBreak = (phaseIndex === 3);

           // Snare and Hats
           if (isSnare && !isBreak) {
              for (let j = 0; j < sr * 0.1; j++) {
                 if (start + j < bufferLength) {
                    const env = Math.exp(-20 * j / sr);
                    const noise = (Math.random() * 2 - 1) * 0.4;
                    data[Math.floor(start) + j] += noise * env;
                 }
              }
           } else if (isHat) {
              for (let j = 0; j < sr * 0.05; j++) {
                 if (start + j < bufferLength) {
                    const env = Math.exp(-60 * j / sr);
                    const noise = (Math.random() * 2 - 1) * 0.2;
                    data[Math.floor(start) + j] += noise * env;
                 }
              }
           }
        }

        if (complexity >= 4) {
           // Loop Accent (Cowbell/Ride style)
           if (isLoopStart) {
              const freq = 800;
              for (let j = 0; j < sr * 0.1; j++) {
                 if (start + j < bufferLength) {
                    const env = Math.exp(-30 * j / sr);
                    data[Math.floor(start) + j] += Math.sin(2 * Math.PI * freq * (j / sr)) * env * 0.2;
                 }
              }
           }
        }

        if (complexity >= 5) {
           const phraseIndex = Math.floor(beatIndex / beatsPerPhrase) % 5;
           
           // Phrase Accent (Crash) only at the start of a new phrase
           if (isPhraseStart) {
              for (let j = 0; j < sr * 2.0; j++) {
                 if (start + j < bufferLength) {
                    const env = Math.exp(-3 * j / sr);
                    const noise = (Math.random() * 2 - 1) * 0.4;
                    data[Math.floor(start) + j] += noise * env;
                 }
              }
           }

           // Evolutionary Bassline / Melody
           // Phrase 0: Intro (Sub-bass, very simple)
           // Phrase 1: Build (Rising pulse)
           // Phrase 2: Drop (Full Groovy Bass)
           // Phrase 3: Break (No Kick, just Melody)
           // Phrase 4: Outro (Stripped back)

           if (phraseIndex === 2 || phraseIndex === 0 || phraseIndex === 4) {
              // Bass Pluck
              const isBassMoment = (i % 8 === 0 || i % 8 === 3 || i % 8 === 6);
              if (isBassMoment) {
                 const bassFreq = type === 'A' ? 55 : 65; // A1 or C2 approx
                 for (let j = 0; j < sr * 0.2; j++) {
                    if (start + j < bufferLength) {
                       const env = Math.exp(-12 * j / sr);
                       data[Math.floor(start) + j] += Math.sin(2 * Math.PI * bassFreq * (j / sr)) * env * 0.4;
                    }
                 }
              }
           }

           if (phraseIndex === 1) {
              // Build-up Riser (White noise sweeping up in volume over the phrase)
              const posInPhrase = (beatIndex % beatsPerPhrase) / beatsPerPhrase;
              const riserEnv = posInPhrase * 0.2;
              for (let j = 0; j < sr * halfBeat; j++) {
                 if (start + j < bufferLength) {
                    const noise = (Math.random() * 2 - 1) * riserEnv;
                    data[Math.floor(start) + j] += noise;
                 }
              }
           }

           if (phraseIndex === 3) {
              // Break: Melodic Arpeggio instead of drums
              const notes = type === 'A' ? [220, 277, 330, 440] : [261, 329, 392, 523];
              const note = notes[Math.floor(beatIndex % notes.length)];
              for (let j = 0; j < sr * 0.3; j++) {
                 if (start + j < bufferLength) {
                    const env = Math.exp(-8 * j / sr);
                    data[Math.floor(start) + j] += Math.sin(2 * Math.PI * note * (j / sr)) * env * 0.2;
                 }
              }
           }
        }
    }

    // Post-processing: If Break (phrase 3), reduce Kick/Snare volume
    if (complexity >= 5) {
       for (let i = 0; i < totalHalfBeats; i++) {
          const phraseIndex = Math.floor((i / 2) / beatsPerPhrase) % 5;
          if (phraseIndex === 3) {
             // We can't really "undo" the kick here easily without changing the loop structure.
             // But we can just make the logic above smarter.
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
      // Fallback
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
      this.pauseTrack(deckId);
      // Ensure positive modulo wrap
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
