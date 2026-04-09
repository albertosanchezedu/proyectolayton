/**
 * Lógica principal unificadora del juego clásico. Transformado a Visual Novel con nodos.
 */

document.addEventListener('DOMContentLoaded', () => {
    setupAccessibilityMenu();
    window.SaveSystem.load();

    const startScrn = document.getElementById('startScreen');
    const bgParallax = document.getElementById('parallaxBg');
    startScrn.addEventListener('mousemove', (e) => {
        if(!bgParallax || startScrn.classList.contains('hidden')) return;
        const moveX = (e.clientX / window.innerWidth - 0.5) * -30;
        const moveY = (e.clientY / window.innerHeight - 0.5) * -30;
        bgParallax.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    document.getElementById('btnStart').addEventListener('click', async () => {
        window.AudioManager.init();
        
        const startScrn = document.getElementById('startScreen');
        startScrn.style.opacity = '0';
        
        setTimeout(async () => {
            startScrn.classList.remove('active');
            startScrn.classList.add('hidden');
            
            document.getElementById('gameHUD').classList.remove('hidden');
            document.getElementById('storyManagerBg').classList.remove('hidden');

            window.AudioManager.startOverworldMusic();
            await startGameNovel(window.GameScenario_Tema1);
        }, 500); 
    });
});

async function startGameNovel(chapterData) {
    try {
        window.GameData = chapterData;
        window.SaveSystem.data.totalPuzzles = chapterData.metadata.totalPuzzles;
        window.SaveSystem.updateHUD();
        
        // Empieza la historia puramente lineal basada en los dialogos
        setTimeout(() => {
            window.GameDialog.startDialog(chapterData.dialogs, "start");
        }, 500);
    } catch (e) {
        console.error("Error cargando capítulo:", e);
    }
}

function setupAccessibilityMenu() {
    const btn = document.getElementById('btnAccessibility');
    const menu = document.getElementById('accessibilityMenu');
    const closeBtn = document.getElementById('closeAccessibility');
    
    // Controles táctiles Custom
    const musicBlocks = document.querySelectorAll('#musicVolBars .vol-bar');
    const sfxBlocks = document.querySelectorAll('#sfxVolBars .vol-bar');

    btn.onclick = () => { window.AudioManager.playBlip(700); menu.classList.remove('hidden'); }
    closeBtn.onclick = () => { window.AudioManager.playBlip(700); menu.classList.add('hidden'); }

    // Interacción Barras Wi-Fi
    const attachBarsInteraction = (blocksQuery, callback) => {
        blocksQuery.forEach((block, idx) => {
            block.addEventListener('click', () => {
                const val = block.getAttribute('data-val');
                blocksQuery.forEach((b, bIdx) => {
                    if(bIdx <= idx) b.classList.add('active');
                    else b.classList.remove('active');
                });
                if(window.AudioManager) callback(val);
                window.AudioManager.playBlip(900); // Feedback que toca el usuario
            });
        });
    }

    // Inicializamos UI
    musicBlocks[1].click(); // Set a 0.25 local UI
    sfxBlocks[2].click();   // Set a 0.50 local UI

    attachBarsInteraction(musicBlocks, (v) => window.AudioManager.setMusicVolume(v));
    attachBarsInteraction(sfxBlocks,   (v) => window.AudioManager.setSfxVolume(v));

    const hkContrast = document.getElementById('highContrast');
    const hkTextSize = document.getElementById('textSize');

    if (hkContrast) {
        hkContrast.onchange = (e) => {
            if (e.target.checked) document.body.classList.add('high-contrast');
            else document.body.classList.remove('high-contrast');
        };
    }

    if (hkTextSize) {
        hkTextSize.onchange = (e) => {
            document.body.classList.remove('text-large', 'text-xlarge');
            if (e.target.value === 'large') document.body.classList.add('text-large');
            if (e.target.value === 'xlarge') document.body.classList.add('text-xlarge');
        };
    }
}
