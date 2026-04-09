class GameEngineClass {
    constructor() {
        this.data = window.GameData;
        this.state = { points: 0, coins: 5, activePuzzleId: null };
        this.pzlInstance = null;
    }

    init() {
        // UI Bindings
        document.getElementById('btnStartGame').onclick = () => {
            if(document.getElementById('chkAudio').checked) window.AudioManager.init();
            document.getElementById('s-intro').classList.remove('active');
            this.loadDialog("start");
        };
        
        document.getElementById('btnContinueDialog').onclick = () => this.nextDialogAction();
        document.getElementById('btnPresStart').onclick = () => this.startPuzzleMinigame();
        document.getElementById('btnPresSkip').onclick = () => this.skipTempPuzzle();
        
        document.getElementById('btnSubmitPuzzle').onclick = () => this.evaluatePuzzle();
        document.getElementById('btnExitPuzzle').onclick = () => this.exitPuzzleToNode();
        
        document.getElementById('hud-hints').onclick = () => this.requestHint();
        document.getElementById('hud').style.display = "flex";
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('coin-count').innerText = this.state.points; // Mostrar picarats arriba
    }

    // --- MANEJO DE NOVELA VISUAL ---
    loadDialog(nodeId) {
        if(!nodeId) { alert("Fin de la Demo!!"); return; }
        const n = this.data.dialogs[nodeId];
        
        if(n.pzl) {
            this.setupPuzzleScreen(n.pzl);
            return;
        }

        document.getElementById('s-dialog').classList.add('active');
        document.getElementById('s-puzzle').classList.remove('active');
        
        // Limpiamos UI
        document.getElementById('dlgCharAvatar').innerText = n.char;
        document.getElementById('dlgCharName').innerText = n.name;
        document.getElementById('dlgText').innerHTML = n.text;
        
        const optsDiv = document.getElementById('dlgOptions');
        optsDiv.innerHTML = '';
        
        if(n.options && n.options.length > 0) {
            n.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = "submit-btn";
                btn.innerText = opt.label;
                btn.onclick = () => { window.AudioManager.playBlip(); this.loadDialog(opt.route); };
                optsDiv.appendChild(btn);
            });
        }
    }

    // --- MANEJO DE ENIGMAS ---
    setupPuzzleScreen(puzzleId) {
        document.getElementById('s-dialog').classList.remove('active');
        document.getElementById('s-puzzle').classList.add('active');
        
        const pData = this.data.puzzles[puzzleId];
        this.state.activePuzzleId = puzzleId;
        pData.currentMax = pData.currentMax || pData.maxPuntos;
        
        // Reset Hints
        document.getElementById('hintArea').style.display = "none";
        
        // Show Presentation
        document.getElementById('pzlActive').style.display = "none";
        document.getElementById('presTitle').innerText = pData.title;
        const pPts = document.getElementById('presPtsCount');
        pPts.innerText = pData.currentMax;
        document.getElementById('presPicarats').classList.remove('punish');
        document.getElementById('btnPresStart').innerText = "Empezar Puzle";
        document.getElementById('pzlPresentation').style.display = "flex";
    }

    startPuzzleMinigame() {
        window.AudioManager.startPuzzleMusic();
        document.getElementById('pzlPresentation').style.display = "none";
        document.getElementById('pzlActive').style.display = "block";
        
        const pData = this.data.puzzles[this.state.activePuzzleId];
        document.getElementById('pzlHeaderTitle').innerText = pData.title.split(":")[0];
        document.getElementById('pzlHeaderPicarats').innerText = pData.currentMax;
        document.getElementById('pzlDesc').innerHTML = pData.description;
        
        // Instanciar juego dinámico
        this.pzlInstance = new window.InteractivePuzzle(pData, document.getElementById('pzlInteractive'));
    }

    evaluatePuzzle() {
        const isCorrect = this.pzlInstance.validate();
        
        const evalScreen = document.getElementById('eval-overlay');
        evalScreen.style.display = "flex";
        window.AudioManager.playBlip();

        setTimeout(() => {
            evalScreen.style.display = "none";
            
            if(isCorrect) {
                 window.AudioManager.playCorrect();
                 document.getElementById('winPicaratsCount').innerText = "+ " + this.data.puzzles[this.state.activePuzzleId].currentMax + " PICARATS";
                 document.getElementById('eureka-overlay').classList.add('show');
            } else {
                 window.AudioManager.playWrong();
                 document.getElementById('wrong-overlay').classList.add('show');
            }
        }, 1500);
    }

    handleFail() {
        const pData = this.data.puzzles[this.state.activePuzzleId];
        const oldMax = pData.currentMax;
        const penalty = Math.max(1, Math.floor(pData.maxPuntos / 4));
        pData.currentMax = Math.max(0, pData.currentMax - penalty);
        
        document.getElementById('pzlActive').style.display = "none";
        document.getElementById('presPtsCount').innerText = oldMax;
        document.getElementById('btnPresStart').innerText = "Reintentar";
        document.getElementById('pzlPresentation').style.display = "flex";
        
        setTimeout(() => {
            window.AudioManager.playBlip();
            document.getElementById('presPicarats').classList.add('punish');
            document.getElementById('presPtsCount').innerText = pData.currentMax;
        }, 800);
    }

    finishPuzzleNode(isSuccess) {
        const pData = this.data.puzzles[this.state.activePuzzleId];
        if(isSuccess) {
             this.state.points += pData.currentMax;
             this.updateHUD();
        }
        window.AudioManager.stopAll();
        this.loadDialog(isSuccess ? pData.winNode : pData.failNode);
    }

    exitPuzzleToNode() {
        window.AudioManager.playBlip();
        window.AudioManager.stopAll();
        this.loadDialog(this.data.puzzles[this.state.activePuzzleId].failNode); // Ir al nodo fallback al salirse
    }
    
    skipTempPuzzle() {
        window.AudioManager.playBlip();
        this.loadDialog(this.data.puzzles[this.state.activePuzzleId].failNode);
    }

    requestHint() {
        if(!this.state.activePuzzleId) return;
        window.AudioManager.playBlip();
        document.getElementById('hintBoxText').innerText = this.data.puzzles[this.state.activePuzzleId].hint;
        document.getElementById('hint-overlay').classList.add('show');
    }
}

window.onload = () => {
    window.GameEngine = new GameEngineClass();
    window.GameEngine.init();
};
