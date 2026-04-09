/**
 * Lógica principal del juego.
 */

document.addEventListener('DOMContentLoaded', () => {
    setupAccessibilityMenu();
    window.SaveSystem.load();

    document.getElementById('btnStart').addEventListener('click', async () => {
        // Inicializa audio por interacción de usuario imperativa
        window.AudioManager.init();
        
        // Efecto visual salida título
        const startScrn = document.getElementById('startScreen');
        startScrn.style.opacity = '0';
        setTimeout(async () => {
            startScrn.classList.remove('active');
            startScrn.classList.add('hidden');
            
            document.getElementById('gameHUD').classList.remove('hidden');
            document.getElementById('sceneScreen').classList.remove('hidden');

            window.AudioManager.startMusic();
            await loadChapter('data/chapters/tema1.json');
        }, 500);
    });
});

async function loadChapter(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        const chapterData = await response.json();
        
        // Guardamos todo en window.GameData para acceso del Engine de puzzles
        window.GameData = chapterData;

        window.SaveSystem.data.totalPuzzles = chapterData.metadata.totalPuzzles;
        window.SaveSystem.updateHUD();

        // Renderizado del Almacén real
        renderScene(chapterData.scene);

        // Lanzar diálogo intro
        if (chapterData.dialogs && chapterData.dialogs.intro) {
            setTimeout(() => {
                window.GameDialog.startDialog(chapterData.dialogs.intro, "start");
            }, 800);
        }

    } catch (e) {
        console.error("Error cargando capítulo:", e);
    }
}

function renderScene(sceneData) {
    const interactablesContainer = document.getElementById('sceneInteractables');
    interactablesContainer.innerHTML = '';
    
    sceneData.elements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'interactable';
        div.innerText = el.emoji; // Seguiremos usando emojis como marcadores visuales accesibles 
        div.style.left = el.x;
        div.style.top = el.y;
        div.title = el.name;

        div.onclick = () => {
            window.AudioManager.playBlip(900);
            
            if (el.type === 'character' && el.dialogId) {
                if(window.GameData.dialogs[el.dialogId]) {
                    window.GameDialog.startDialog(window.GameData.dialogs[el.dialogId], "start");
                }
            } else if (el.type === 'puzzle') {
                window.GameDialog.startDialog({
                    start: { char: "layton", text: "¡Ah! ¡Un rompecabezas oculto! Vamos a resolverlo...", next: null }
                }, "start", () => {
                    window.GamePuzzle.loadPuzzle(el.puzzleId);
                });
            } else if (el.type === 'coin') {
                window.SaveSystem.addCoin();
                div.remove(); 
                window.AudioManager.playCorrect(); // Campanitas felices
            }
        };

        interactablesContainer.appendChild(div);
    });
}

function setupAccessibilityMenu() {
    const btn = document.getElementById('btnAccessibility');
    const menu = document.getElementById('accessibilityMenu');
    const closeBtn = document.getElementById('closeAccessibility');
    
    const hkContrast = document.getElementById('highContrast');
    const hkTextSize = document.getElementById('textSize');
    const volMusic = document.getElementById('musicVolume');

    btn.onclick = () => menu.classList.remove('hidden');
    closeBtn.onclick = () => menu.classList.add('hidden');

    hkContrast.onchange = (e) => {
        if (e.target.checked) document.body.classList.add('high-contrast');
        else document.body.classList.remove('high-contrast');
    };

    hkTextSize.onchange = (e) => {
        document.body.classList.remove('text-large', 'text-xlarge');
        if (e.target.value === 'large') document.body.classList.add('text-large');
        if (e.target.value === 'xlarge') document.body.classList.add('text-xlarge');
    };

    volMusic.oninput = (e) => {
        window.AudioManager.setVolume(e.target.value);
    }
}
