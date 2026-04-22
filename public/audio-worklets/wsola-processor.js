// WSOLA (Waveform Similarity Overlap-Add) time-stretcher.
//
// Stretches audio in time without changing pitch. Used to implement "master tempo" (key lock):
// the playback BPM follows the tempo setting, but the musical key stays put.
//
// Algorithm (Verhelst & Roelands, 1993):
//   - Slice input into overlapping frames of length FRAME at analysis hop Ha = HOP_OUT * tempo.
//   - For each output position, don't take the input frame at the exact analysis point: search
//     ±TOL samples around it for the frame that best continues the previous output frame
//     (max cross-correlation with the "natural continuation" predicted from the last frame).
//   - Window with Hann and overlap-add at synthesis hop HOP_OUT. Hann + 50% overlap is COLA,
//     so when tempo=1.0 and the search locks on, the reconstruction is near-perfect.
//
// Tuning: FRAME=1024 (~23 ms @ 44.1 kHz) is short enough to track transients and long enough
// for stable pitched content. Tolerance ±256 samples handles typical beat/phase drift.

const FRAME = 1024;
const HOP_OUT = FRAME >> 1;   // 50% overlap → Hann is COLA
const TOL = 256;
const CORR_LEN = HOP_OUT;      // length of the correlation window (= overlap region)
const RING_SIZE = FRAME * 2;

const WINDOW = new Float32Array(FRAME);
for (let i = 0; i < FRAME; i++) {
  WINDOW[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FRAME - 1)));
}

class WSOLAProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.channels = null;
    this.numChans = 0;
    this.inputLen = 0;
    this.tempo = 1.0;
    this.readIdx = 0;            // fractional analysis read position (input samples)
    this.prevFrame = null;       // unwindowed last-accepted frame per channel (for prediction)

    this.outRing = null;         // accumulator ring per channel
    this.ringWrite = 0;          // monotonic sample index — write head
    this.ringRead = 0;           // monotonic sample index — read head
    this.done = false;

    this._firstProcess = true;
    this.port.onmessage = (e) => this._onMessage(e.data);
  }

  _log(msg) {
    try { this.port.postMessage({ type: 'debug', msg }); } catch { /* ignore */ }
  }

  _onMessage(msg) {
    if (msg.type === 'load') {
      this.channels = msg.channels;
      this.numChans = this.channels.length;
      this.inputLen = this.channels[0].length;
      this._log(`load ok: ${this.numChans}ch × ${this.inputLen} samples`);
      this.prevFrame = Array.from({ length: this.numChans }, () => new Float32Array(FRAME));
      this.outRing = Array.from({ length: this.numChans }, () => new Float32Array(RING_SIZE));
      this.ringWrite = 0;
      this.ringRead = 0;
      this.readIdx = 0;
      this.done = false;
    } else if (msg.type === 'tempo') {
      // Clamp to sane range. DJ use is typically [0.9, 1.1].
      this.tempo = Math.max(0.25, Math.min(4.0, msg.value));
    } else if (msg.type === 'seek') {
      const p = Math.max(0, Math.min(0.9999, msg.value));
      this.readIdx = p * this.inputLen;
      // Stale data in the ring past ringRead would leak out after the seek — wipe it.
      for (const ch of this.outRing) ch.fill(0);
      this.ringWrite = this.ringRead;
      for (const f of this.prevFrame) f.fill(0);
      this.done = false;
    }
  }

  _synthesizeFrame() {
    if (!this.channels || this.done) return false;
    const Ha = HOP_OUT * this.tempo;

    const center = Math.floor(this.readIdx);
    if (center + FRAME >= this.inputLen) {
      this.done = true;
      return false;
    }
    const lo = Math.max(0, center - TOL);
    const hi = Math.min(this.inputLen - FRAME, center + TOL);

    // Prediction target: the continuation of prevFrame starting at HOP_OUT.
    // That's what the next input frame's first CORR_LEN samples "should" look like
    // if the music weren't being stretched.
    // Pick the candidate whose leading samples correlate best with this target.
    let bestPos = lo;
    let bestCorr = -Infinity;
    for (let p = lo; p <= hi; p++) {
      let corr = 0;
      for (let c = 0; c < this.numChans; c++) {
        const pf = this.prevFrame[c];
        const inp = this.channels[c];
        // Unrolled dot product
        let s = 0;
        for (let i = 0; i < CORR_LEN; i += 4) {
          s += inp[p + i]     * pf[HOP_OUT + i]
             + inp[p + i + 1] * pf[HOP_OUT + i + 1]
             + inp[p + i + 2] * pf[HOP_OUT + i + 2]
             + inp[p + i + 3] * pf[HOP_OUT + i + 3];
        }
        corr += s;
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestPos = p;
      }
    }

    // Overlap-add into the ring and stash the unwindowed frame for next prediction.
    for (let c = 0; c < this.numChans; c++) {
      const inp = this.channels[c];
      const pf = this.prevFrame[c];
      const ring = this.outRing[c];
      for (let i = 0; i < FRAME; i++) {
        const sample = inp[bestPos + i];
        pf[i] = sample;
        ring[(this.ringWrite + i) % RING_SIZE] += sample * WINDOW[i];
      }
    }

    this.ringWrite += HOP_OUT;
    this.readIdx += Ha;
    return true;
  }

  process(_inputs, outputs) {
    const out = outputs[0];
    const outChans = out ? out.length : 0;
    if (outChans === 0) return true;
    const need = out[0].length;

    if (this._firstProcess) {
      this._firstProcess = false;
      this._log(`process() first call: outChans=${outChans}, need=${need}, channelsLoaded=${!!this.channels}`);
    }

    if (!this.channels) {
      for (let c = 0; c < outChans; c++) out[c].fill(0);
      return true;
    }

    while (this.ringWrite - this.ringRead < need) {
      if (!this._synthesizeFrame()) break;
    }

    const available = Math.min(need, this.ringWrite - this.ringRead);

    for (let c = 0; c < outChans; c++) {
      const ring = this.outRing[Math.min(c, this.numChans - 1)];
      const outCh = out[c];
      for (let i = 0; i < available; i++) {
        const idx = (this.ringRead + i) % RING_SIZE;
        outCh[i] = ring[idx];
        ring[idx] = 0;  // ring is an accumulator — clear as samples are consumed
      }
      for (let i = available; i < need; i++) outCh[i] = 0;
    }
    this.ringRead += available;

    return true;
  }
}

registerProcessor('wsola-processor', WSOLAProcessor);
