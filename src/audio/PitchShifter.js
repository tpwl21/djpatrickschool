// Drop-in replacement for the soundtouchjs PitchShifter we used to depend on.
// Backed by our own WSOLA AudioWorklet (see public/audio-worklets/wsola-processor.js).
//
// API surface kept minimal to match the call sites in MagicAudioContext:
//   new PitchShifter(ctx, buffer)   — construct
//   .tempo = r                       — time-stretch factor (BPM scales, pitch stays)
//   .pitch = 1.0                     — accepted but ignored (we never pitch-shift here)
//   .percentagePlayed = p            — seek, p ∈ [0, 1)
//   .node                            — the AudioWorkletNode to connect into the graph
//   .disconnect()                    — detach from the graph

// The module is per-AudioContext: registering into one ctx doesn't register in another.
// Cache the registration promise per-ctx so a new MagicAudioContext (route change, etc.)
// registers independently of any previously-torn-down instance.
const moduleRegistrations = new WeakMap();

export function registerWsolaWorklet(ctx, workletUrl) {
  let p = moduleRegistrations.get(ctx);
  if (!p) {
    p = ctx.audioWorklet.addModule(workletUrl).catch((err) => {
      moduleRegistrations.delete(ctx);  // allow retry on failure
      throw err;
    });
    moduleRegistrations.set(ctx, p);
  }
  return p;
}

export class PitchShifter {
  constructor(ctx, buffer) {
    this.ctx = ctx;
    this.buffer = buffer;
    this._tempo = 1.0;
    this._pitch = 1.0;

    this.node = new AudioWorkletNode(ctx, 'wsola-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [buffer.numberOfChannels],
    });

    // Surface worklet-side errors — otherwise they just vanish.
    this.node.onprocessorerror = (e) => {
      console.error('[WSOLA] processor error:', e);
    };
    this.node.port.onmessage = (e) => {
      if (e.data && e.data.type === 'debug') console.log('[WSOLA worklet]', e.data.msg);
    };

    // Hand the raw samples to the worklet. Copy into fresh Float32Arrays so we can transfer
    // their backing buffers (zero-copy) without mutating the source AudioBuffer.
    const channels = [];
    const transferList = [];
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const copy = new Float32Array(buffer.getChannelData(c));
      channels.push(copy);
      transferList.push(copy.buffer);
    }
    this.node.port.postMessage({ type: 'load', channels }, transferList);
  }

  get tempo() { return this._tempo; }
  set tempo(v) {
    this._tempo = v;
    this.node.port.postMessage({ type: 'tempo', value: v });
  }

  get pitch() { return this._pitch; }
  set pitch(v) { this._pitch = v; }

  set percentagePlayed(p) {
    this.node.port.postMessage({ type: 'seek', value: p });
  }

  connect(dest) { return this.node.connect(dest); }

  disconnect() {
    try { this.node.disconnect(); } catch { /* ignore */ }
  }
}
