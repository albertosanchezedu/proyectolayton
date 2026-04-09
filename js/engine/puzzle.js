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
            // Evaluamos fill_blanks aqui rapido para ver si esta vacio
            if (this.currentPuzzle && this.currentPuzzle.type === 'fill_blanks') {
                const selects = Array.from(this.interactiveArea.querySelectorAll('.pz-dropdown'));
                if(selects.some(s => s.value === "")) {
                     window.GameDialog.startDialog({"start": {char: "luke", text: "¡Profesor! Me he saltado huecos por rellenar en el pergamino.", next:null}}, "start");
                     return;
                }
            } else if(!this.currentSelection) {
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
        else if (pzData.type === 'fill_blanks') {
            this.currentSelection = null; // Se calcula en validacion
            
            let htmlForm = `<p style="font-size: 1.3rem; line-height: 1.8; color: var(--dark); padding: 20px; border: 2px dashed var(--gold); border-radius: 8px; background: rgba(255,255,255,0.6); max-width:800px; text-align:left;">`;
            
            // Reemplazar {0}, {1} con selects
            let parts = pzData.textTemplate.split(/(\{\d+\})/g);
            parts.forEach(part => {
                if (part.match(/\{\d+\}/)) {
                    htmlForm += `<select class="pz-dropdown" style="font-family:var(--font-heading); font-size:1.1rem; padding:4px; margin:0 5px; border:2px solid var(--wood); border-radius:4px; color:var(--dark); font-weight:bold; outline:none; cursor:pointer;">
                                    <option value="" disabled selected>--- Elegir ---</option>
                                    ${pzData.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                                 </select>`;
                } else {
                    htmlForm += part;
                }
            });
            htmlForm += `</p>`;
            
            this.interactiveArea.innerHTML = htmlForm;
            
            // Feedback sonoro al cambiar
            Array.from(this.interactiveArea.querySelectorAll('.pz-dropdown')).forEach(sel => {
                sel.addEventListener('change', () => { window.AudioManager.playBlip(800); });
            });
        }
    }

    validate() {
        clearInterval(this.timerInterval);
        
        // Obtener estado si es de rellenar huecos
        if (this.currentPuzzle.type === 'fill_blanks') {
            const selects = Array.from(this.interactiveArea.querySelectorAll('.pz-dropdown'));
            if(selects.some(s => s.value === "")) {
                this.currentSelection = null; // Forzará el fallo por estar vacio en setupEvents? No, si le damos a enviar saltaría vacio, asi que validamos normal como falso o bloqueamos.
            } else {
                this.currentSelection = selects.map(s => s.value).join(',');
            }
        }
        
        const isCorrect = this.currentSelection === this.currentPuzzle.correctAnswer;
        
        // Esconder controles normales
        this.interactiveArea.style.display = 'none';
        document.querySelector('.puzzle-footer').style.display = 'none';

        const suspenseDiv = document.createElement('div');
        suspenseDiv.className = 'suspense-anim';
        suspenseDiv.style.textAlign = "center";
        suspenseDiv.style.padding = "40px";
        suspenseDiv.innerHTML = `<h1 style="font-family: var(--font-heading); font-size:3rem; font-style:italic;">Analizando deducción...</h1>`;
        this.textBody.parentNode.appendChild(suspenseDiv);

        window.AudioManager.playBlip(300);
        let ticks = 0;
        let tickInt = setInterval(() => { window.AudioManager.playBlip(300 + (ticks*20)); ticks++; }, 400);

        setTimeout(() => {
            clearInterval(tickInt);
            if (isCorrect) {
                window.AudioManager.playCorrect(); 
                suspenseDiv.innerHTML = `<h1 style="color:var(--gold); font-family: var(--font-heading); font-size:4rem;">¡Correcto!</h1><p style="font-size:1.5rem;">${this.currentPuzzle.explanation}</p>`;
                
                window.SaveSystem.data.puzzlesSolved++;
                let pts = this.currentPuzzle.maxPuntos;
                if(this.currentPuzzle.timeLimit && this.currentTimeLeft > 0) {
                    const bonus = Math.floor((this.currentTimeLeft / this.currentPuzzle.timeLimit) * this.maxBonus);
                    pts += bonus;
                    suspenseDiv.innerHTML += `<p style="color:#2ecc71; font-weight:bold;">¡Bonificación de tiempo: +${bonus}!</p>`;
                }
                
                window.SaveSystem.data.ingenioPoints += pts;
                window.SaveSystem.updateHUD();

                setTimeout(() => {
                    this.closePuzzle();
                    suspenseDiv.remove();
                    this.interactiveArea.style.display = '';
                    document.querySelector('.puzzle-footer').style.display = '';
                    if (this.currentPuzzle.winNode) {
                        window.GameDialog.resumeTemp();
                        window.GameDialog.loadNode(this.currentPuzzle.winNode);
                    }
                    window.AudioManager.startOverworldMusic();
                }, 5000);

            } else {
                window.AudioManager.playWrong(); 
                
                // Penalizacion proporcional de Picarats
                const prevPoints = this.currentPuzzle.maxPuntos;
                const optionsCount = (this.currentPuzzle.options || []).length || 2;
                const newPoints = Math.max(0, prevPoints - Math.floor(prevPoints / optionsCount));
                this.currentPuzzle.maxPuntos = newPoints;
                
                suspenseDiv.innerHTML = `<h1 style="color:#e74c3c; font-family: var(--font-heading); font-size:4rem;">¡Falso!</h1>
                                         <p style="font-size:1.5rem;">Puntos de Ingenio reducidos: ${prevPoints} ➔ <b style="color:red">${newPoints}</b></p>`;
                
                setTimeout(() => {
                    suspenseDiv.remove();
                    this.interactiveArea.style.display = '';
                    document.querySelector('.puzzle-footer').style.display = '';
                    this.currentSelection = null;
                    this.picarats.innerText = newPoints;
                    
                    Array.from(this.interactiveArea.children).forEach(c => {
                        c.style.borderColor = 'var(--wood)';
                        c.style.background = '#fff';
                        c.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    });
                    
                    // Restaura el QTE si lo habia para evitar bugs
                    if (this.currentPuzzle.timeLimit) {
                         this.currentTimeLeft = this.currentPuzzle.timeLimit;
                         this.startTimerIfAny();
                    }
                }, 3500);
            }
        }, 2200);
    }

    closePuzzle() {
        clearInterval(this.timerInterval);
        this.screen.classList.add('hidden');
    }
}

window.GamePuzzle = new PuzzleSystem();
