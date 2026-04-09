/**
 * Lógica principal del juego.
 * Carga el escenario y orquesta los engine files.
 */

document.addEventListener('DOMContentLoaded', () => {
    setupAccessibilityMenu();
    window.SaveSystem.load();

    document.getElementById('btnStart').addEventListener('click', async () => {
        // Obligatorio hacer init por las reestricciones de Web Audio en navegadores
        window.AudioManager.init();
        
        document.getElementById('startScreen').classList.remove('active');
        document.getElementById('startScreen').classList.add('hidden');
        
        document.getElementById('sceneScreen').classList.remove('hidden');

        // Empezamos la carga del capítulo
        await loadChapter('data/chapters/tema1.json');
    });

});

async function loadChapter(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        const chapterData = await response.json();
        
        // Iniciar valores del HUD
        window.SaveSystem.data.totalPuzzles = chapterData.metadata.totalPuzzles;
        window.SaveSystem.updateHUD();

        // Cargar personajes en la escena (Interactables)
        renderScene(chapterData.scene);

        // Lanzar diálogo de introducción
        if (chapterData.dialogs && chapterData.dialogs.intro) {
            setTimeout(() => {
                window.GameDialog.startDialog(chapterData.dialogs.intro, "start");
            }, 500);
        }

    } catch (e) {
        console.error("Error cargando capítulo:", e);
        alert("Ocurrió un error al cargar el capítulo.");
    }
}

function renderScene(sceneData) {
    const interactablesContainer = document.getElementById('sceneInteractables');
    interactablesContainer.innerHTML = '';
    
    // Aquí pondremos el fondo si estuviese definido en image (placeholder css)
    // document.getElementById('sceneBackground').style.backgroundImage = `url(${sceneData.background})`;

    sceneData.elements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'interactable';
        div.innerText = el.emoji; // Marcador visual temporal
        div.style.left = el.x;
        div.style.top = el.y;
        div.title = el.name; // Accesibilidad básica por hover

        div.onclick = () => {
            // Animación de click y sonido base
            window.AudioManager.playBlip(900);
            
            if (el.type === 'character' && el.dialogId) {
                // Asumiendo que el diálogo existe en una variable global o lo volvemos a pasar
                // Para este prototipo, simularemos la re-obtención del JSON
                fetch('data/chapters/tema1.json')
                  .then(r => r.json())
                  .then(data => {
                      if(data.dialogs[el.dialogId]) {
                          window.GameDialog.startDialog(data.dialogs[el.dialogId], "start");
                      }
                  });
            } else if (el.type === 'coin') {
                window.SaveSystem.addCoin();
                div.remove(); // Desaparece la moneda
                alert('¡Has encontrado una moneda de bonificación!');
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
}
