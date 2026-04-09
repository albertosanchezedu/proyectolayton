// ══════════════════════════════════════════════════════
//  MOTOR DE AUDIO CONVOLVER (Acorde a referencia V8/Layton)
// ══════════════════════════════════════════════════════
const AudioManager = {
    ctx: null, master: null, limiter: null, mainBus: null,
    roomConv: null, plateConv: null, roomSend: null, plateSend: null,
    running: false, isSoundEnabled: false,
    
    // Frecuencias Eb menor
    N: {
      Eb2: 77.78, Ab2: 103.83, Bb2: 116.54, Gb2: 92.50, Db2: 69.30,
      Eb3: 155.56, F3: 174.61,  Gb3: 185.00, Ab3: 207.65, Bb3: 233.08, Cb3: 123.47, Db3: 138.59,
      Eb4: 311.13, F4: 349.23,  Gb4: 369.99, Ab4: 415.30, Bb4: 466.16, Cb4: 246.94, Db4: 277.18,
      Eb5: 622.25, F5: 698.46,  Gb5: 739.99, Ab5: 830.61, Bb5: 932.33, Db5: 554.37, Cb5: 493.88
    },

    q: Math.floor((60 / 108)*1000)/1000, 
    seqTimer: null, barCount: 0, startTime: null, currentTheme: null,

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new window.AudioContext();
            this.master = this.ctx.createGain(); this.master.gain.value = 0.25; this.master.connect(this.ctx.destination);
            
            this.limiter = this.ctx.createDynamicsCompressor();
            this.limiter.threshold.value = -6; this.limiter.knee.value = 3; this.limiter.ratio.value = 10;
            this.limiter.connect(this.master);
            
            this.mainBus = this.ctx.createGain(); this.mainBus.connect(this.limiter);
            
            this.roomConv = this.makeConvolver(1.2, 3.5); this.plateConv = this.makeConvolver(2.5, 1.8);
            this.roomConv.connect(this.mainBus); this.plateConv.connect(this.mainBus);
            
            this.isSoundEnabled = true;
        } catch(e) { console.warn("Audio Context Failed:", e); }
    },

    makeConvolver(secs, tail) {
      if(!this.ctx) return null;
      const conv = this.ctx.createConvolver();
      const len  = Math.floor(this.ctx.sampleRate * secs);
      const buf  = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, tail);
      }
      conv.buffer = buf; return conv;
    },

    toRoom(node, amt=1) { if(!this.ctx) return; const g = this.ctx.createGain(); g.gain.value = amt; node.connect(g); g.connect(this.roomConv); },
    toPlate(node, amt=1) { if(!this.ctx) return; const g = this.ctx.createGain(); g.gain.value = amt; node.connect(g); g.connect(this.plateConv); },

    // Synth Instruments
    marimba(freq, t, dur, vol = 0.095) {
      if (!this.ctx || freq <= 0) return;
      const dec = Math.min(dur, this.q * 3 * 0.92 * 0.95);
      [{ ratio: 1, v: vol},{ ratio: 3.9, v: vol * 0.20},{ ratio: 10.7, v: vol * 0.07}].forEach(({ ratio, v }) => {
        const osc = this.ctx.createOscillator(); const env = this.ctx.createGain();
        osc.frequency.value = freq * ratio;
        env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(v, t + 0.004); env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
        osc.connect(env); env.connect(this.mainBus); this.toRoom(env, 0.28);
        osc.start(t); osc.stop(t + dec + 0.04);
      });
    },

    accordion(freq, t, dur, vol = 0.026) {
      if (!this.ctx || freq <= 0) return;
      const safeDur = Math.min(dur, this.q * 3 * 0.88);
      const env = this.ctx.createGain(); const hpf = this.ctx.createBiquadFilter();
      hpf.type = 'highpass'; hpf.frequency.value = 200; hpf.Q.value = 0.5;
      
      const steps = 32; const curve = new Float32Array(steps);
      for (let i = 0; i < steps; i++) curve[i] = vol + 0.015 * Math.sin(2 * Math.PI * 7.8 * (i / steps) * safeDur);
      
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vol, t + 0.060);
      env.gain.setValueCurveAtTime(curve, t + 0.060, safeDur - 0.070); env.gain.linearRampToValueAtTime(0, t + safeDur);
      
      env.connect(hpf); hpf.connect(this.mainBus); this.toRoom(hpf, 0.20);
      [-6, +6].forEach(cents => {
        const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq * Math.pow(2, cents / 1200);
        osc.connect(env); osc.start(t); osc.stop(t + safeDur + 0.04);
      });
    },

    contrabass(freq, t, vol = 0.082) {
      if (!this.ctx || freq <= 0) return;
      const dec = this.q * 0.72;
      const osc = this.ctx.createOscillator(); const env = this.ctx.createGain(); const lpf = this.ctx.createBiquadFilter();
      osc.type = 'triangle'; osc.frequency.value = freq; lpf.type = 'lowpass'; lpf.frequency.value = 300;
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vol, t + 0.008); env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      osc.connect(lpf); lpf.connect(env); env.connect(this.mainBus); this.toRoom(env, 0.10);
      osc.start(t); osc.stop(t + dec + 0.03);
    },
    
    bell(freq, t, vol = 0.042) {
      if (!this.ctx || freq <= 0) return;
      [[freq, vol, 0.85], [freq * 2.756, vol * 0.25, 0.30]].forEach(([f, v, dec]) => {
        const osc = this.ctx.createOscillator(); const env = this.ctx.createGain();
        osc.frequency.value = f;
        env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(v, t + 0.004); env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
        osc.connect(env); env.connect(this.mainBus); this.toPlate(env, 0.65);
        osc.start(t); osc.stop(t + dec + 0.04);
      });
    },

    // Sequences
    stopAll() { clearTimeout(this.seqTimer); this.currentTheme = null; this.running = false; },

    startPuzzleMusic() {
      if(!this.isSoundEnabled) return;
      this.init(); this.stopAll(); this.currentTheme = 'puzzle'; this.barCount = 0;
      if(this.ctx.state === "suspended") this.ctx.resume();
      this.startTime = this.ctx.currentTime + 0.15;
      
      const m = this.q * 3;
      const oomPahPah = (root, acc, t0) => {
        this.contrabass(root, t0, 0.085);
        [1,2].forEach(b => acc.forEach(n => this.accordion(n, t0 + b*this.q, this.q*0.82, 0.022)));
      };

      const tick = () => {
        if(this.currentTheme !== 'puzzle') return;
        for (let i = 0; i < 3; i++) {
          const bi = (this.barCount + i) % 8;
          const t0 = this.startTime + (this.barCount + i) * m;
          
          const ch = [
              {r:this.N.Eb2, a:[this.N.Gb3, this.N.Bb3]}, {r:this.N.Cb3, a:[this.N.Cb3, this.N.Eb4]},
              {r:this.N.Ab2, a:[this.N.Ab3, this.N.Cb4]}, {r:this.N.Bb2, a:[this.N.Bb3, this.N.Db4]},
              {r:this.N.Eb2, a:[this.N.Gb3, this.N.Bb3]}, {r:this.N.Cb3, a:[this.N.Cb3, this.N.Eb4]},
              {r:this.N.Gb2, a:[this.N.Gb3, this.N.Bb3]}, {r:this.N.Bb2, a:[this.N.Bb3, this.N.Db4]}
          ][bi];
          
          oomPahPah(ch.r, ch.a, t0);
          
          // Campanas Random Místicas
          if(bi===0) this.bell(this.N.Eb5, t0 + this.q*2);
          if(bi===3) this.bell(this.N.Bb5, t0 + this.q);
          if(bi===6) this.bell(this.N.Ab5, t0 + this.q*2);
        }
        this.barCount += 3;
        this.seqTimer = setTimeout(tick, Math.max(100, (3 * m - 0.08) * 1000));
      };
      tick();
    },

    // Efectos de UX
    playBlip() {
      if(!this.ctx || !this.isSoundEnabled) return;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.frequency.value = 900 + Math.random()*200;
      g.gain.setValueAtTime(0.02, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
      o.connect(g); g.connect(this.master); o.start(); o.stop(this.ctx.currentTime + 0.06);
    },
    
    playCorrect() {
      if(!this.ctx || !this.isSoundEnabled) return;
      [this.N.Eb4, this.N.G4, this.N.Bb4, this.N.Eb5].forEach((f, i) => {
        setTimeout(() => {
          const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0, this.ctx.currentTime); g.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
          o.connect(g); g.connect(this.mainBus); o.start(); o.stop(this.ctx.currentTime + 1);
        }, i * 150);
      });
    },

    playWrong() {
      if(!this.ctx || !this.isSoundEnabled) return;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(150, this.ctx.currentTime); o.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.8);
      g.gain.setValueAtTime(0.2, this.ctx.currentTime); g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      o.connect(g); g.connect(this.mainBus); o.start(); o.stop(this.ctx.currentTime + 1);
    }
};

window.AudioManager = AudioManager;
