/* Ajustes Puzzle para el layout clásico novel con TRANSICIONES y QTE */
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
        
        // QTE logic
        this.timerInterval = null;
        this.currentTimeLeft = 0;
        this.maxBonus = 0;

        this.setupEvents();
    }

    setupEvents() {
        this.btnLeave.addEventListener('click', () => {
            window.AudioManager.playBlip(500);
            this.closePuzzle();
            // Restaurar novela sin exito
            if(window.GameDialog && this.currentPuzzle.failNode) {
                window.GameDialog.resumeTemp();
                window.GameDialog.loadNode(this.currentPuzzle.failNode);
            }
        });

        this.btnSubmit.addEventListener('click', () => {
            if(!this.currentSelection) {
                // Generamos un dialog temporal estilo layton
                const errDialog = {
                    "start": {char: "luke", text: "¡Profesor! Aún no he marcado ninguna decisión lógica en el pergamino.", next:null}
                };
                window.GameDialog.startDialog(errDialog, "start");
                return;
            }
            this.validate();
        });
    }

    loadPuzzle(puzzleId) {
        const pzData = window.GameData.puzzles[puzzleId];
        if(!pzData) { alert("Puzzle no encontrado."); return; }
        
        this.currentPuzzle = pzData;
        this.currentSelection = null;
        
        this.title.innerText = pzData.title;
        this.picarats.innerText = pzData.maxPuntos;
        
        // QTE UI si se necesita (Añadido en tiempo real en la desc del puzle)
        let injectedHTML = pzData.description;
        if (pzData.timeLimit) {
            this.currentTimeLeft = pzData.timeLimit;
            this.maxBonus = pzData.maxPuntos;
            injectedHTML = `<div class="qte-bar-container"><div id="qteBarFill" class="qte-bar-fill"></div></div>` + injectedHTML;
        }

        this.textBody.innerHTML = injectedHTML;
        
        this.buildInteractiveArea(pzData);

        this.playTransitionAnimation();
    }

    startTimerIfAny() {
        clearInterval(this.timerInterval);
        if(!this.currentPuzzle.timeLimit) return;

        const maxT = this.currentPuzzle.timeLimit;
        const fill = document.getElementById('qteBarFill');
        if(!fill) return;

        this.timerInterval = setInterval(() => {
            this.currentTimeLeft -= 0.1;
            const pct = (this.currentTimeLeft / maxT) * 100;
            fill.style.width = Math.max(0, pct) + "%";
            
            if(pct < 30) {
                fill.style.backgroundPosition = "left center"; // Se pone rojo
            }

            if(this.currentTimeLeft <= 0) {
                clearInterval(this.timerInterval);
                fill.style.width = "0%";
            }
        }, 100);
    }

    playTransitionAnimation() {
        window.AudioManager.playPuzzleTransitionJingle();

        this.transitionOverlay.classList.remove('play');
        void this.transitionOverlay.offsetWidth;
        
        this.transitionOverlay.classList.add('play');

        setTimeout(() => {
            this.screen.classList.remove('hidden');
            window.AudioManager.startPuzzleMusic(); 
            this.startTimerIfAny(); // Comienza la cuenta atrás si la hay
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
                    window.AudioManager.playBlip(700); 
                };

                this.interactiveArea.appendChild(box);
            });
        }
    }

    validate() {
        clearInterval(this.timerInterval);
        const isCorrect = this.currentSelection === this.currentPuzzle.correctAnswer;
        this.closePuzzle();

        if (isCorrect) {
            window.AudioManager.playCorrect(); 
            window.SaveSystem.data.puzzlesSolved++;
            
            let pts = this.currentPuzzle.maxPuntos;
            // QTE Bonus
            if(this.currentPuzzle.timeLimit && this.currentTimeLeft > 0) {
                const bonus = Math.floor((this.currentTimeLeft / this.currentPuzzle.timeLimit) * this.maxBonus);
                pts += bonus;
            }
            
            window.SaveSystem.data.ingenioPoints += pts;
            window.SaveSystem.updateHUD();

            // Salta al nodo de victoria en narrativa
            if (this.currentPuzzle.winNode) {
                window.GameDialog.resumeTemp();
                window.GameDialog.loadNode(this.currentPuzzle.winNode);
            }
        } else {
            window.AudioManager.playWrong(); 
            // Salta al nodo de fallo en narrativa
            if (this.currentPuzzle.failNode) {
                window.GameDialog.resumeTemp();
                window.GameDialog.loadNode(this.currentPuzzle.failNode);
            }
        }

        setTimeout(() => {
            window.AudioManager.startOverworldMusic();
        }, 1000); 
    }

    closePuzzle() {
        clearInterval(this.timerInterval);
        this.screen.classList.add('hidden');
        if(window.GameDraw) {
            window.GameDraw.clearCanvas(); 
            window.GameDraw.disablePizarra();
        }
    }
}

window.GamePuzzle = new PuzzleSystem();
