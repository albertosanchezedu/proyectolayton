class EngineAudio {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.bgOsc = null;
        this.musicInterval = null;
        // Frecuencias usadas en Layton V8
        this.freqs = { Eb3: 155.56, Gb3: 185.00, Bb3: 233.08, Cb4: 246.94, Db4: 277.18, Eb4: 311.13, F4: 349.23, Gb4: 369.99, Bb4: 466.16 };
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.3; // Volumen maestro 30%
            this.master.connect(this.ctx.destination);
        } catch(e) { console.warn("Audio ignorado"); }
    }

    // Efectos de UX
    playBlip(freq = 600) {
        if(!this.ctx) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = 'triangle'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        o.connect(g); g.connect(this.master); o.start(); o.stop(this.ctx.currentTime + 0.15);
    }

    playWrong() {
        if(!this.ctx) return;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueCurveAtTime(new Float32Array([150, 80, 50]), this.ctx.currentTime, 0.4);
        g.gain.setValueAtTime(0.4, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.4);
        o.connect(g); g.connect(this.master); o.start(); o.stop(this.ctx.currentTime + 0.5);
    }
    
    playCorrect() {
        if(!this.ctx) return;
        [400, 500, 600, 800].forEach((f, i) => {
            setTimeout(() => { this.playBlip(f); }, i * 150);
        });
    }

    // MÚSICA EXPLORACIÓN (La que querías que volviera)
    startExplorationMusic() {
        if(!this.ctx) this.init();
        this.stopMusic();
        if(!this.ctx) return;

        this.bgOsc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        this.bgOsc.type = 'sine';
        this.bgOsc.frequency.value = 110; // Misterioso pad bajo
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 2); // Fade in suave
        
        this.bgOsc.connect(g); g.connect(this.master);
        this.bgOsc.start();
        
        // Un pad es suficiente para dar "misterio" sin atosigar.
    }

    // MÚSICA LAYTON V8 (Exclusiva para puzles)
    startPuzzleMusic() {
        if(!this.ctx) this.init();
        this.stopMusic();
        if(!this.ctx) return;

        const q = 60 / 108; // 108 BPM vals
        let beatIdx = 0;
        
        // Instrumento acordeón/madera
        const playSynth = (f) => {
            const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
            o.type = 'triangle'; o.frequency.value = f;
            g.gain.setValueAtTime(0, this.ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
            o.connect(g); g.connect(this.master);
            o.start(); o.stop(this.ctx.currentTime + 0.45);
        };

        this.musicInterval = setInterval(() => {
            const compas = beatIdx % 4; // Bucle de 4 compases (vals = 3 beats, pero lo normalizaremos para simplicidad del engine)
            
            // Oom (Bajo)
            playSynth(this.freqs.Eb3);
            
            // Pah Pah (Acordeones lentos en Layton V8)
            setTimeout(()=> playSynth(this.freqs.Gb3), (q * 1000));
            setTimeout(()=> playSynth(this.freqs.Bb3), (q * 2000));

            beatIdx++;
        }, q * 3000); // 3 tiempos
    }

    stopMusic() {
        if(this.bgOsc) {
            this.bgOsc.stop(); 
            this.bgOsc.disconnect();
            this.bgOsc = null;
        }
        clearInterval(this.musicInterval);
    }
}
window.AduioSys = new EngineAudio();
