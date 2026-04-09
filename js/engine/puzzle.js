/**
 * Motor base de Puzles
 * Renderiza dinámicamente un puzle cargado del JSON.
 */

class PuzzleSystem {
    constructor() {
        this.screen = document.getElementById('puzzleScreen');
        this.title = document.getElementById('pzlTitle');
        this.picarats = document.getElementById('pzlPicarats');
        this.textBody = document.getElementById('pzlParams');
        this.interactiveArea = document.getElementById('pzlInteractive');
        
        this.btnLeave = document.getElementById('btnLeavePuzzle');
        this.btnSubmit = document.getElementById('btnSubmitPuzzle');

        this.currentPuzzle = null;
        this.currentSelection = null; // Para guardar lo que toca el usuario

        this.setupEvents();
    }

    setupEvents() {
        this.btnLeave.addEventListener('click', () => {
            this.closePuzzle();
        });

        this.btnSubmit.addEventListener('click', () => {
            if(!this.currentSelection) {
                alert("Debes seleccionar una opción primero o marcar una respuesta.");
                return;
            }
            this.validate();
        });
    }

    loadPuzzle(puzzleId) {
        const pzData = window.GameData.puzzles[puzzleId];
        if(!pzData) { alert("Puzzle no encontrado en el JSON."); return; }
        
        this.currentPuzzle = pzData;
        this.currentSelection = null;
        
        this.title.innerText = pzData.title;
        // Puntos de penalización lógica
        let points = pzData.maxPuntos;
        this.picarats.innerText = points;

        this.textBody.innerHTML = pzData.description;
        
        this.buildInteractiveArea(pzData);

        this.screen.classList.remove('hidden');
        window.AudioManager.stopMusic(); // Para enfatizar que entramos en modo pensar (se puede cambiar al tema de puzzle alternativo)
    }

    buildInteractiveArea(pzData) {
        this.interactiveArea.innerHTML = '';
        
        // Fase 2 simple: puzzles tipo "Selecciona la caja incorrecta"
        if(pzData.type === 'select_element') {
            pzData.options.forEach(opt => {
                const box = document.createElement('div');
                box.style.display = 'flex';
                box.style.flexDirection = 'column';
                box.style.alignItems = 'center';
                box.style.cursor = 'pointer';
                box.style.padding = '20px';
                box.style.border = '4px solid transparent';
                box.style.borderRadius = '10px';
                box.style.background = 'rgba(255,255,255,0.5)';
                box.style.margin = '10px';

                box.innerHTML = `<span style="font-size: 4rem;">${opt.icon}</span><br><b>${opt.label}</b>`;

                box.onclick = () => {
                    // Reset others
                    Array.from(this.interactiveArea.children).forEach(c => c.style.borderColor = 'transparent');
                    box.style.borderColor = '#c98835'; // Accent color
                    this.currentSelection = opt.id;
                    window.AudioManager.playBlip(700);
                };

                this.interactiveArea.appendChild(box);
            });
        }
    }

    validate() {
        const isCorrect = this.currentSelection === this.currentPuzzle.correctAnswer;
        
        this.closePuzzle();

        // Lanzar diálogo de validación
        const dialogNode = isCorrect ? "win" : "fail";
        const validationDialog = {
            "start": { "char": "layton", "text": "Veamos tu respuesta...", "next": dialogNode },
            "win": { "char": "layton", "text": `¡Correcto! ${this.currentPuzzle.explanation}`, "next": null },
            "fail": { "char": "luke", "text": "¡Ups! Me temo que esa no es la respuesta correcta.", "next": null }
        };

        window.GameDialog.startDialog(validationDialog, "start", () => {
            if(isCorrect) {
                 window.AudioManager.playCorrect();
                 window.SaveSystem.data.puzzlesSolved++;
                 window.SaveSystem.data.ingenioPoints += this.currentPuzzle.maxPuntos;
                 window.SaveSystem.updateHUD();
            }
            window.AudioManager.startMusic();
        });
    }

    closePuzzle() {
        this.screen.classList.add('hidden');
        window.GameDraw.clearCanvas(); // Limpiar dibujos
    }
}

window.GamePuzzle = new PuzzleSystem();
