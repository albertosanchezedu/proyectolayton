/* Ajustes Puzzle para el layout clásico novel con TRANSICIONES */
class PuzzleSystem {
    constructor() {
        this.screen = document.getElementById('puzzleScreen');
        this.title = document.getElementById('pzlTitle');
        this.picarats = document.getElementById('pzlPicarats');
        this.textBody = document.getElementById('pzlParams');
        this.interactiveArea = document.getElementById('pzlInteractive');
        this.btnLeave = document.getElementById('btnLeavePuzzle');
        this.btnSubmit = document.getElementById('btnSubmitPuzzle');

        this.transitionOverlay = document.getElementById('transitionOverlay');
        this.transitionText = document.getElementById('transitionText');

        this.currentPuzzle = null;
        this.currentSelection = null; 
        this.setupEvents();
    }

    setupEvents() {
        this.btnLeave.addEventListener('click', () => {
            window.AudioManager.playBlip(500);
            this.closePuzzle();
        });

        this.btnSubmit.addEventListener('click', () => {
            if(!this.currentSelection) {
                window.GameDialog.startDialog({
                    start: {char: "luke", text: "¡Profesor! Aún no has dado con una respuesta del cuadro.", next:null}
                }, "start");
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
        this.picarats.innerText = pzData.maxPuntos;
        this.textBody.innerHTML = pzData.description;
        
        this.buildInteractiveArea(pzData);

        this.playTransitionAnimation();
    }

    playTransitionAnimation() {
        // Suena el jingle característico de "¿Un puzle?!"
        window.AudioManager.playPuzzleTransitionJingle();

        // Limpiamos opacidades previas
        this.transitionOverlay.classList.remove('play');
        // Trigger reflow (CSS trick)
        void this.transitionOverlay.offsetWidth;
        
        this.transitionOverlay.classList.add('play');

        // Durante el cierre de diafragma negro (al 50% de la animación, o sea ~750ms), 
        // cambiamos el contexto subyacente.
        setTimeout(() => {
            this.screen.classList.remove('hidden');
            window.AudioManager.startPuzzleMusic(); // Corta el overworld, mete tema tenso de puzle.
        }, 750);
    }

    buildInteractiveArea(pzData) {
        this.interactiveArea.innerHTML = '';
        
        if(pzData.type === 'select_element') {
            pzData.options.forEach(opt => {
                const box = document.createElement('div');
                box.style.display = 'flex';
                box.style.flexDirection = 'column';
                box.style.alignItems = 'center';
                box.style.cursor = 'pointer';
                box.style.padding = '15px 30px';
                box.style.border = '2px solid var(--wood)';
                box.style.borderRadius = '4px';
                box.style.background = '#fff';
                box.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                box.style.fontFamily = 'var(--font-heading)';
                box.style.transition = 'all 0.2s';

                box.innerHTML = `<span style="font-size: 3.5rem;">${opt.icon}</span><br><b style="margin-top:10px; font-size:1.1rem; color:var(--dark);">${opt.label}</b>`;

                box.onclick = () => {
                    Array.from(this.interactiveArea.children).forEach(c => {
                        c.style.borderColor = 'var(--wood)';
                        c.style.background = '#fff';
                        c.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    });
                    
                    box.style.borderColor = 'var(--gold)';
                    box.style.background = 'rgba(200, 150, 12, 0.1)';
                    box.style.boxShadow = '0 0 0 2px rgba(200, 150, 12, 0.3)';
                    
                    this.currentSelection = opt.id;
                    window.AudioManager.playBlip(700); // feedback sonoro click opcion
                };

                this.interactiveArea.appendChild(box);
            });
        }
    }

    validate() {
        const isCorrect = this.currentSelection === this.currentPuzzle.correctAnswer;
        this.closePuzzle();

        const dialogNode = isCorrect ? "win" : "fail";
        const validationDialog = {
            "start": { "char": "layton", "text": "Observemos tu razonamiento...", "next": dialogNode },
            "win": { "char": "layton", "text": `¡Excelente deducción! ${this.currentPuzzle.explanation}`, "next": null },
            "fail": { "char": "luke", "text": "Mmm, creo que algo falla en ese argumento, Profesor. Deberíamos revisarlo y volver a intentarlo.", "next": null }
        };

        window.GameDialog.startDialog(validationDialog, "start", () => {
            if(isCorrect) {
                 window.AudioManager.playCorrect(); // Música apoteósica "Correcto"
                 window.SaveSystem.data.puzzlesSolved++;
                 window.SaveSystem.data.ingenioPoints += this.currentPuzzle.maxPuntos;
                 window.SaveSystem.updateHUD();
            } else {
                 window.AudioManager.playWrong(); // Disonancia bajista
            }
            // Vuelve el Overworld calmado
            setTimeout(() => {
                window.AudioManager.startOverworldMusic();
            }, 1000); 
        });
    }

    closePuzzle() {
        this.screen.classList.add('hidden');
        if(window.GameDraw) {
            window.GameDraw.clearCanvas(); 
            window.GameDraw.disablePizarra();
        }
        window.AudioManager.startOverworldMusic(); // vuelve al theme relajado si sale sin hacer submit
    }
}

window.GamePuzzle = new PuzzleSystem();
