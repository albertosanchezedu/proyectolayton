/**
 * Sistema de Audio Completo, escalable y con múltiples temas (Overworld, Puzzle, Effects)
 */

let ctx = null;
let master = null;
let musicBus = null;
let sfxBus = null;
let isAudioEnabled = false;

// Sintetizadores y Efectos Frecuencias bases (estilo Layton DS)
const hz = n => 440 * Math.pow(2, (n - 69) / 12);
const N = {
    Eb2: hz(39), Ab2: hz(44), Bb2: hz(46), Gb2: hz(42), Db2: hz(37),
    Cb3: hz(47), Eb3: hz(51), F3: hz(53),  Gb3: hz(54), Ab3: hz(56), Bb3: hz(58),
    Cb4: hz(59), Db4: hz(61), Eb4: hz(63), E4: hz(64), F4: hz(65),  Gb4: hz(66), G4: hz(67), Ab4: hz(68), A4: hz(69), Bb4: hz(70), B4: hz(71),
    C5: hz(72), Db5: hz(73), D5: hz(74), Eb5: hz(75), E5: hz(76), F5: hz(77),  Gb5: hz(78), G5: hz(79), Ab5: hz(80), A5:hz(81), Bb5: hz(82), Cb5: hz(71),
    C6: hz(84), Db6: hz(85), D6: hz(86), Eb6: hz(87), E6: hz(88), F6: hz(89),  Gb6: hz(90), G6: hz(91), Ab6: hz(92), A6:hz(93), Bb6: hz(94), B6: hz(95)
};

// Motores de Audio
let currentTrack = null;
let clockTimeout = null;

function initAudio() {
    if (isAudioEnabled) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 1.0; master.connect(ctx.destination);
    
    musicBus = ctx.createGain(); musicBus.gain.value = 0.3; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(master);
    
    isAudioEnabled = true;
    if (ctx.state === 'suspended') ctx.resume();
}

function setMusicVolume(value) { if (musicBus) musicBus.gain.value = parseFloat(value); }
function setSfxVolume(value) { if(sfxBus) sfxBus.gain.value = parseFloat(value); }

function stopAllMusic() {
    clearTimeout(clockTimeout);
    currentTrack = null;
    // Un fadeout rústico rápido cortaría el ctx pero no hace falta, el GC lo limpia si no hay schedule
}

// =================== SINTETIZADORES COMPONENTES ===================
function playMarimba(freq, t, dur, vol, bus=musicBus) {
    if (!freq) return;
    [1, 3.9].forEach(ratio => {
        const osc = ctx.createOscillator(); const env = ctx.createGain();
        osc.frequency.value = freq * ratio;
        env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vol * (ratio===1?1:0.2), t + 0.01); env.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(env); env.connect(bus);
        osc.start(t); osc.stop(t + dur + 0.1);
    });
}
function playAccordian(freq, t, dur, vol, bus=musicBus) {
    if (!freq) return;
    [-5, 5].forEach(cents => {
        const osc = ctx.createOscillator(); const env = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = freq * Math.pow(2, cents/1200);
        env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vol*0.5, t + 0.05); env.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(env); env.connect(bus);
        osc.start(t); osc.stop(t + dur + 0.1);
    });
}
function playTick(t, bus=musicBus) {
    // Sonido reloj de Puzzle
    const osc = ctx.createOscillator(); const env = ctx.createGain();
    osc.type = 'square'; osc.frequency.value = 1500;
    env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(0.02, t + 0.001); env.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(env); env.connect(bus);
    osc.start(t); osc.stop(t + 0.06);
}
function playHarp(fArr, t, vol=0.05, bus=musicBus, spread=0.03) {
    fArr.forEach((f, i) => {
        const nt = t + i * spread;
        const osc = ctx.createOscillator(); const env = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = f;
        env.gain.setValueAtTime(0, nt); env.gain.linearRampToValueAtTime(vol, nt + 0.01); env.gain.exponentialRampToValueAtTime(0.001, nt + 1.5);
        osc.connect(env); env.connect(bus); osc.start(nt); osc.stop(nt + 1.6);
    });
}

// =================== TRACKS & RUTINAS ===================
let globalBar = 0; let globalTime = 0;
function runSequence(tickDur, barLen, lookahead, schedulerFn) {
    if (!ctx) return;
    if(globalTime < ctx.currentTime) globalTime = ctx.currentTime + 0.1;
    for (let i = 0; i < lookahead; i++) {
        schedulerFn(globalBar + i, globalTime + (globalBar + i) * tickDur * barLen);
    }
    globalBar += lookahead;
    clockTimeout = setTimeout(() => runSequence(tickDur, barLen, lookahead, schedulerFn), (lookahead * tickDur * barLen - 0.1) * 1000);
}

// ── OVERWORLD THEME ── (Melodía Laytonesca misteriosa clásica)
function startOverworldMusic() {
    initAudio(); stopAllMusic(); currentTrack = "ovw"; globalBar = 0; globalTime = 0;
    const q = 60/115; // Un poco más activo
    setMusicVolume(0.2);
    runSequence(q, 3, 4, (barIdx, t0) => { // Compás 3/4 vals
        const cb = barIdx % 4;
        const root = [N.A4, N.C5, N.F4, N.E4][cb] || N.A4; // Am misterioso
        playAccordian(root/2, t0, q*0.8, 0.04); 
        playAccordian(root, t0+q, q*0.8, 0.02);
        playAccordian(root*1.2, t0+q*2, q*0.8, 0.02);
        
        // Melodía ligera de piano/marimba
        if(cb === 0) { playMarimba(N.A5, t0, q, 0.08); playMarimba(N.C6, t0+q*1.5, q*0.5, 0.08); }
        if(cb === 1) { playMarimba(N.E6, t0, q, 0.08); playMarimba(N.D6, t0+q, q, 0.08); }
    });
}

// ── PUZZLE TENSE THEME ── (Reloj tictac, marimbas repetitivas menores)
function startPuzzleMusic() {
    initAudio(); stopAllMusic(); currentTrack = "puz"; globalBar = 0; globalTime = 0;
    const e = 60/130 / 2; // Rápido, corcheas
    setMusicVolume(0.25);
    runSequence(e, 8, 4, (barIdx, t0) => { // Compás 4/4 dividido en 8 corcheas
        // Tictac constante
        for(let i=0; i<8; i++) playTick(t0 + i*e);
        
        // Bajo tenso pizzicato (Marimba grave)
        const root = (barIdx % 2 === 0) ? N.Eb3 : N.Cb3;
        playMarimba(root, t0, e, 0.1);
        playMarimba(root, t0 + 3*e, e, 0.06);
        playMarimba(root, t0 + 6*e, e, 0.08);
        
        // Arpegio siniestro (Acordeòn o campanillas suaves)
        if(barIdx % 4 === 3) {
            playMarimba(N.Bb4, t0+4*e, e, 0.05);
            playMarimba(N.Gb4, t0+5*e, e, 0.05);
            playMarimba(N.Eb4, t0+6*e, e, 0.05);
        }
    });
}

// =================== EFECTOS DE SONIDO (Rutados a SFX Bus) ===================

function playBlip(baseFreq = 600) {
    if (!ctx || !sfxBus) return;
    const f = Math.max(100, baseFreq + (Math.random() * 50 - 25)); 
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.value = f;
    g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(g); g.connect(sfxBus); osc.start(); osc.stop(ctx.currentTime + 0.08);
}

function playCorrect() {
    if (!ctx || !sfxBus) return;
    // Chime brillante majestuoso: Acorde Eb Mayor 7 ascendente arpegiado (da-da-da-DAAA)
    playHarp([N.Eb4, N.G4, N.Bb4, N.D5], ctx.currentTime, 0.1, sfxBus, 0.05);
    setTimeout(() => playHarp([N.Eb5, N.G5, N.Bb5], ctx.currentTime, 0.1, sfxBus, 0.0), 200); // Acorde final
}

function playWrong() {
    if(!ctx || !sfxBus) return;
    // Sonido triste de caída / disonante
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(N.Ab3, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(N.E2, ctx.currentTime + 0.6); // Baja de tono
    g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    osc.connect(g); g.connect(sfxBus); osc.start(); osc.stop(ctx.currentTime + 0.7);
}

function playPuzzleTransitionJingle() {
    if(!ctx || !sfxBus) return;
    // Aquel "tin, tin, tín!" cuando descubres uno. Trino agudo.
    playHarp([N.Bb5, N.F6, N.Bb6], ctx.currentTime, 0.08, sfxBus, 0.06);
}

window.AudioManager = {
    init: initAudio,
    playBlip: playBlip,
    playCorrect: playCorrect,
    playWrong: playWrong,
    playPuzzleTransitionJingle: playPuzzleTransitionJingle,
    startOverworldMusic: startOverworldMusic,
    startPuzzleMusic: startPuzzleMusic,
    stopAllMusic: stopAllMusic,
    setMusicVolume: setMusicVolume,
    setSfxVolume: setSfxVolume
};
