class GameApp {
    constructor() {
        window.AduioSys.init();
        document.getElementById('hudLayer').style.display = "flex";
        
        // Controls
        document.getElementById('btnStartPuzle').onclick = () => this.launchPuzle();
        document.getElementById('btnSkipPuzle').onclick = () => { 
            window.AduioSys.playBlip(400); 
            this.loadNode(window.PuzzlesData[this.currentPzlId].nodeFail); 
        };
        document.getElementById('btnExitPuzle').onclick = () => { 
            window.AduioSys.playBlip(400); 
            this.loadNode(window.PuzzlesData[this.currentPzlId].nodeFail); 
        };
        document.getElementById('btnSubmitPuzle').onclick = () => this.checkPuzle();
        document.getElementById('btnHint').onclick = () => {
            window.AduioSys.playBlip();
            if(window.gameCoins > 0) {
                window.gameCoins--;
                document.getElementById('coinCount').innerText = window.gameCoins;
                document.getElementById('hintText').innerText = window.PuzzlesData[this.currentPzlId].hint;
                document.getElementById('hintOverlay').style.display = "flex";
            }
        };
        document.getElementById('btnSeguir').onclick = () => {
            document.getElementById('eurekaUI').classList.remove('show');
            this.loadNode(window.PuzzlesData[this.currentPzlId].nodeWin);
        };
        
        window.gameCoins = 5;
        this.currentPzlId = null;
        this.activeMod = null;
        this.isAnimating = false; // Lock system

        // Initialize story
        this.loadNode("start");
    }

    loadNode(nodeId) {
        document.getElementById('dialogUI').classList.remove('hidden');
        document.getElementById('puzzleUI').classList.add('hidden');
        
        const node = window.DialogData[nodeId];
        if(!node) return;
        
        if(node.pzl) {
            this.setupPuzle(node.pzl);
            return;
        }

        window.AduioSys.startExplorationMusic();

        // Control visual dialogos AI (máquina)
        const dBox = document.getElementById('dialogBox');
        if(node.machine) dBox.classList.add('machine');
        else dBox.classList.remove('machine');

        document.getElementById('charAvatar').innerText = node.char;
        document.getElementById('charName').innerText = node.name;
        document.getElementById('dialogText').innerText = node.text;
        
        const optsDiv = document.getElementById('dialogOptions');
        optsDiv.innerHTML = '';
        
        node.choices.forEach(ch => {
            const b = document.createElement('button');
            b.className = "dialog-btn";
            b.innerText = ch.text;
            b.onclick = () => { window.AduioSys.playBlip(600); this.loadNode(ch.target); };
            optsDiv.appendChild(b);
        });
    }

    setupPuzle(pId) {
        const pz = window.PuzzlesData[pId];
        this.currentPzlId = pId;
        pz.currentPts = pz.currentPts || pz.valPicarats; // mantain points on fail

        document.getElementById('dialogUI').classList.add('hidden');
        document.getElementById('puzzleUI').classList.remove('hidden');
        
        // Reset overlay
        const pres = document.getElementById('pzlPresOverlay');
        pres.classList.remove('hidden');
        
        document.getElementById('presTitle').innerText = pz.title;
        document.getElementById('presPicarats').innerText = pz.currentPts + " Picarats";
        document.getElementById('presPicarats').classList.remove('punish');
        document.getElementById('btnStartPuzle').innerText = "Empezar Puzle";
    }

    launchPuzle() {
        window.AduioSys.startPuzzleMusic();
        
        document.getElementById('pzlPresOverlay').classList.add('hidden');
        const pz = window.PuzzlesData[this.currentPzlId];
        document.getElementById('pMainTitle').innerText = pz.title;
        document.getElementById('pMainPts').innerText = pz.currentPts;
        document.getElementById('pDesc').innerHTML = pz.desc;
        
        this.activeMod = new window.PuzzleModule(pz, "pInteract");
    }

    checkPuzle() {
        if(this.isAnimating) return;
        this.isAnimating = true;

        const ov = document.getElementById('evalOverlay');
        const evT = document.getElementById('evalText');
        ov.classList.add('show');
        
        let count = 3;
        evT.innerText = count + "...";
        window.AduioSys.playBlip(800);

        const iv = setInterval(() => {
            count--;
            if(count > 0) {
                evT.innerText = count + "...";
                window.AduioSys.playBlip(800 + (3-count)*100);
            } else {
                clearInterval(iv);
                evT.innerText = "VEAMOS...";
                setTimeout(() => this.resolvePuzle(ov), 1000);
            }
        }, 800);
    }

    resolvePuzle(overlayDiv) {
        overlayDiv.classList.remove('show');
        const res = this.activeMod.validate();
        const pz = window.PuzzlesData[this.currentPzlId];

        if(res) {
            window.AduioSys.playCorrect();
            document.getElementById('winPoints').innerText = pz.currentPts;
            document.getElementById('winExplain').innerHTML = pz.winMsg;
            document.getElementById('eurekaUI').classList.add('show');
            this.isAnimating = false;
        } else {
            window.AduioSys.playWrong();
            // Castigar Picarats
            const prev = pz.currentPts;
            pz.currentPts = Math.max(0, pz.currentPts - Math.floor(pz.valPicarats / 4));
            
            document.getElementById('presPicarats').innerText = prev + " Picarats";
            document.getElementById('btnStartPuzle').innerText = "Reintentar";
            document.getElementById('pzlPresOverlay').classList.remove('hidden');

            setTimeout(() => {
                window.AduioSys.playBlip(400);
                document.getElementById('presPicarats').classList.add('punish');
                document.getElementById('presPicarats').innerText = pz.currentPts + " Picarats";
                this.isAnimating = false;
            }, 800);
        }
    }
}

// Inicializar engine nativo click a click (para evitar politicas de audio autoplay, reparamos inicializando con la pagina)
window.onload = () => {
    document.body.addEventListener('click', () => {
        if(!window.App) window.App = new GameApp();
    }, {once:true});
};
