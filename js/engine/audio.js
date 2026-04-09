/**
 * Sistema de Audio
 * Integra el Puzzle Theme procedural (Layton V8) y efectos foley ("blip").
 */

let ctx = null;
let master = null;
let mainBus = null;
let isAudioEnabled = false;

// Nodos y Reverberación
let limiter, roomConv, plateConv, roomSend, plateSend;

// Controladores de bucle
const LOOP_BARS  = 8;
const LOOKAHEAD  = 3;
let startTime = null;
let barCount = 0;
let isMusicRunning = false;
let musicClock = null;

// Parámetros Musicales Base
const BPM = 108;
const q = 60 / BPM;     
const m = q * 3;        
const e = q / 2;        
const ed = q * 0.75;    
const h = q * 2;        

const hz = n => 440 * Math.pow(2, (n - 69) / 12);
const N = {
    Eb2: hz(39), Ab2: hz(44), Bb2: hz(46), Gb2: hz(42), Db2: hz(37),
    Eb3: hz(51), F3: hz(53),  Gb3: hz(54), Ab3: hz(56), Bb3: hz(58), Cb3: hz(47), Db3: hz(49),
    Eb4: hz(63), F4: hz(65),  Gb4: hz(66), Ab4: hz(68), Bb4: hz(70), Cb4: hz(59), Db4: hz(61),
    Eb5: hz(75), F5: hz(77),  Gb5: hz(78), Ab5: hz(80), Bb5: hz(82), Db5: hz(73), Cb5: hz(71),
};

const QS = q * 0.88, ES = e * 0.88, HS = q * 1.75;

function initAudio() {
    if (isAudioEnabled) return;

    ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Nodos principales
    master = ctx.createGain();
    master.gain.value = 0.25; // Volumen por defecto 25%
    master.connect(ctx.destination);

    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 3;
    limiter.ratio.value = 10;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.1;
    limiter.connect(master);

    mainBus = ctx.createGain();
    mainBus.gain.value = 1.0;
    mainBus.connect(limiter);

    setupReverbs();

    isAudioEnabled = true;
    if (ctx.state === 'suspended') ctx.resume();
}

// ════════════ REVERB ════════════
function makeConvolver(secs, tail) {
    const conv = ctx.createConvolver();
    const len  = Math.floor(ctx.sampleRate * secs);
    const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, tail);
        }
    }
    conv.buffer = buf;
    return conv;
}

function setupReverbs() {
    roomConv  = makeConvolver(1.2, 3.5);
    plateConv = makeConvolver(2.5, 1.8);

    roomSend  = ctx.createGain(); roomSend.gain.value  = 0.20;
    plateSend = ctx.createGain(); plateSend.gain.value = 0.35;

    roomConv.connect(mainBus);
    plateConv.connect(mainBus);
}

function toRoom(node, amt=1) {
    const g = ctx.createGain(); g.gain.value = amt;
    node.connect(g); g.connect(roomConv);
}

function toPlate(node, amt=1) {
    const g = ctx.createGain(); g.gain.value = amt;
    node.connect(g); g.connect(plateConv);
}

// ════════════ SÍNTESIS INSTRUMENTOS ════════════
const MAX_NOTE = m * 0.92;
function clampDecay(d) { return Math.min(d, MAX_NOTE); }

function marimba(freq, t, dur, vol = 0.095) {
    if (!freq || freq <= 0) return;
    const safeDur = clampDecay(dur);
    const modes = [
        { ratio: 1,    v: vol,        dec: clampDecay(safeDur * 0.95) },
        { ratio: 3.9,  v: vol * 0.20, dec: clampDecay(safeDur * 0.30) },
        { ratio: 10.7, v: vol * 0.07, dec: clampDecay(safeDur * 0.10) },
    ];
    modes.forEach(({ ratio, v, dec }) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * ratio;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(v, t + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
        osc.connect(env); env.connect(mainBus);
        toRoom(env, 0.28);
        osc.start(t); osc.stop(t + dec + 0.04);
    });
}

function accordion(freq, t, dur, vol = 0.026) {
    if (!freq || freq <= 0) return;
    const safeDur = Math.min(dur, m * 0.88);
    const env = ctx.createGain();
    const lpf = ctx.createBiquadFilter();
    const hpf = ctx.createBiquadFilter();

    lpf.type = 'lowpass';  lpf.frequency.value = 2000; lpf.Q.value = 0.9;
    hpf.type = 'highpass'; hpf.frequency.value = 200;  hpf.Q.value = 0.5;

    const steps = 32;
    const curve = new Float32Array(steps);
    const trem  = 0.015;
    for (let i = 0; i < steps; i++) {
        curve[i] = vol + trem * Math.sin(2 * Math.PI * 7.8 * (i / steps) * safeDur);
    }
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol * 0.5, t + 0.030);
    env.gain.linearRampToValueAtTime(vol, t + 0.060);
    env.gain.setValueCurveAtTime(curve, t + 0.060, safeDur - 0.070);
    env.gain.linearRampToValueAtTime(0, t + safeDur);
    env.connect(lpf); lpf.connect(hpf); hpf.connect(mainBus);
    toRoom(hpf, 0.20);

    [-6, +6].forEach(cents => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq * Math.pow(2, cents / 1200);
        osc.connect(env);
        osc.start(t);
        osc.stop(t + safeDur + 0.04);
    });
}

function bell(freq, t, vol = 0.042) {
    if (!freq || freq <= 0) return;
    [[freq, vol, 0.85], [freq * 2.756, vol * 0.25, 0.30]].forEach(([f, v, dec]) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(v, t + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
        osc.connect(env); env.connect(mainBus);
        toPlate(env, 0.65);
        osc.start(t); osc.stop(t + dec + 0.04);
    });
}

function contrabass(freq, t, vol = 0.082) {
    if (!freq || freq <= 0) return;
    const dec = q * 0.72;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const lpf = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    lpf.type = 'lowpass'; lpf.frequency.value = 300; lpf.Q.value = 0.7;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    osc.connect(lpf); lpf.connect(env); env.connect(mainBus);
    toRoom(env, 0.10);
    osc.start(t); osc.stop(t + dec + 0.03);
}

function harp(freqs, t, vol = 0.028) {
    freqs.forEach((freq, i) => {
        const nt  = t + i * 0.028;
        const dec = Math.min(1.2, m - (i * 0.028) - 0.1);
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, nt);
        env.gain.linearRampToValueAtTime(vol, nt + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, nt + dec);
        osc.connect(env); env.connect(mainBus);
        toPlate(env, 0.45);
        osc.start(nt); osc.stop(nt + dec + 0.03);
    });
}

// ════════════ ESTRUCTURA PUZZLE LAYTON ════════════
const CHORD = {
    Ebm: { root: N.Eb2, acc: [N.Gb3, N.Bb3, N.Eb4] },
    Cbm: { root: N.Cb3, acc: [N.Cb3, N.Eb4, N.Gb4] },
    Abm: { root: N.Ab2, acc: [N.Ab3, N.Cb4, N.Eb4] },
    Bbm: { root: N.Bb2, acc: [N.Bb3, N.Db4, N.F4]  },
    Gb:  { root: N.Gb2, acc: [N.Gb3, N.Bb3, N.Db4] },
    Db:  { root: N.Db2, acc: [N.Db3, N.F3,  N.Ab3]  },
};

const mel = [
    [ [N.Bb4, QS, q], [N.Eb5, QS, q*2] ],
    [ [N.Gb5, ES, 0], [N.F5, ES, ed], [N.Eb5, QS, ed+e] ],
    [ [N.Db5, QS, 0], [N.Cb5, QS, q], [N.Ab4, QS, q*2] ],
    [ [N.Bb4, HS, 0] ],
    [ [N.Eb5, ES, e], [N.Gb5, QS, q], [N.Ab5, QS, q*2] ],
    [ [N.Gb5, ES, 0], [N.F5, ES, ed], [N.Eb5, ES, ed+e], [N.Db5, ES, ed+e+e] ],
    [ [N.Cb5, QS, 0], [N.Bb4, QS, q], [N.Ab4, ES, q*2], [N.Gb4, ES, q*2+e] ],
    [ [N.F4,  QS, 0], [N.Eb4, HS, q] ]
];

const bellCues = [
    { bar: 0, o: q * 2 + e, f: N.Eb5 },
    { bar: 3, o: q * 2,     f: N.Bb5 },
    { bar: 4, o: 0,         f: N.Gb5 },
    { bar: 6, o: q * 2,     f: N.Ab5 },
    { bar: 7, o: q * 2 + e, f: N.Eb5 },
];

const harpCues = [
    { bar: 0, o: 0, notes: [N.Eb3, N.Gb3, N.Bb3, N.Eb4] },
    { bar: 4, o: 0, notes: [N.Eb3, N.Ab3, N.Cb4, N.Eb4] },
];

function oomPahPah(chord, t0) {
    const c = CHORD[chord];
    contrabass(c.root, t0, 0.085);
    [1, 2].forEach(b => {
        c.acc.forEach(n => accordion(n, t0 + b * q, q * 0.82, 0.022));
    });
}

function scheduleBar(idx, t0) {
    const bi = idx % LOOP_BARS;
    const ch = ["Ebm","Cbm","Abm","Bbm","Ebm","Cbm","Gb","Bbm"][bi];
    oomPahPah(ch, t0);
    (mel[bi] || []).forEach(([f, d, o]) => { if (f && d) marimba(f, t0 + o, d, 0.095); });
    bellCues.forEach(({ bar, o, f }) => { if (bar === bi) bell(f, t0 + o, 0.038); });
    harpCues.forEach(({ bar, o, notes }) => { if (bar === bi) harp(notes, t0 + o, 0.028); });
}

function tick() {
    if(!isMusicRunning) return;
    for (let i = 0; i < LOOKAHEAD; i++) {
        scheduleBar(barCount + i, startTime + (barCount + i) * m);
    }
    barCount += LOOKAHEAD;
    musicClock = setTimeout(tick, (LOOKAHEAD * m - 0.08) * 1000);
}

function setVolume(value) {
    if (master) {
        master.gain.value = parseFloat(value);
    }
}

function startMusic() {
    initAudio();
    if (isMusicRunning) return;
    isMusicRunning = true;
    startTime = ctx.currentTime + 0.15;
    tick();
}

function stopMusic() {
    isMusicRunning = false;
    clearTimeout(musicClock);
}

// ════════════ EFECTOS FOLEY Y PANTALLA ════════════
function playBlip(baseFreq = 600) {
    if (!isAudioEnabled || !ctx) return;
    const freq = Math.max(100, baseFreq + (Math.random() * 50 - 25)); 
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gainNode);
    gainNode.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
}

function playCorrect() {
    if (!isAudioEnabled || !ctx) return;
    harp([N.Eb4, N.G4, N.Bb4, N.Eb5], ctx.currentTime, 0.3);
}

window.AudioManager = {
    init: initAudio,
    playBlip: playBlip,
    playCorrect: playCorrect,
    startMusic: startMusic,
    stopMusic: stopMusic,
    setVolume: setVolume
};
