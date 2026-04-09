/**
 * Sistema de Audio Base
 * Basado en Web Audio API para generar sonido en tiempo real.
 */

let audioCtx = null;
let isAudioEnabled = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    isAudioEnabled = true;
}

/**
 * Reproducción sincrónica de un pequeño pulso ("blip") para los diálogos.
 * @param {number} baseFreq - Frecuencia base que define la voz (ej: 500 para graves, 800 para agudos)
 */
function playBlip(baseFreq = 600) {
    if (!isAudioEnabled || !audioCtx) return;

    // Aleatorizar un poco la frecuencia para que no suene a máquina pura
    const freq = baseFreq + (Math.random() * 50 - 25); 

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Tipo de onda más suave que la cuadrada, como si fuera una marimba apagada
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Envolvente rápida percusiva
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
}

// TODO: En el futuro incluir el sistema de música de puzzle estilo envolvente
window.AudioManager = {
    init: initAudio,
    playBlip: playBlip
};
