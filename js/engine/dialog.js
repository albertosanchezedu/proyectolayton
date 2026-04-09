/**
 * Engine de Diálogos Refinado (Estilo Layton Moderno + Web Audio)
 */
class DialogSystem {
    constructor() {
        this.overlay = document.getElementById('dialogOverlay');
        this.backdrop = document.getElementById('dialogBackdrop'); // Fondo oscuro
        this.portrait = document.getElementById('dialogPortrait');
        this.nameLabel = document.getElementById('dialogName');
        this.textBox = document.getElementById('dialogText');
        this.arrow = document.getElementById('dialogArrow');
        this.choicesContainer = document.getElementById('dialogChoices');
        this.dialogBox = document.getElementById('dialogBox');

        this.isActive = false;
        this.isTyping = false;
        this.currentFullText = "";
        this.typewriterTimeout = null;
        
        this.currentDialogNodes = {};
        this.currentNodeId = null;
        this.onDialogEnd = null;

        // Personajes Modernizados
        this.characterDB = {
            "layton": { name: "Profe Alberto", emoji: "😎", color: "#38bdf8", voice: 400 },
            "luke":   { name: "Alumno GenZ", emoji: "🧢", color: "#fca5a5", voice: 750 },
            "jefe":   { name: "A. Logistics (NPC)", emoji: "🤖", color: "#fcd34d", voice: 300 },
            "unknown": { name: "???", emoji: "👤", color: "#94a3b8", voice: 500 }
        };

        this.setupEvents();
    }

    setupEvents() {
        // Clicar para avanzar
        this.dialogBox.addEventListener('click', () => this.next());
        
        // Espacio para avanzar
        document.addEventListener('keydown', (e) => {
            if (this.isActive && e.code === "Space") {
                e.preventDefault();
                this.next();
            }
        });
    }

    startDialog(dialogNodes, startNodeId = "start", callback = null) {
        if(!dialogNodes || !dialogNodes[startNodeId]) return;
        
        this.currentDialogNodes = dialogNodes;
        this.isActive = true;
        this.onDialogEnd = callback;
        
        this.overlay.classList.remove('hidden');
        this.backdrop.classList.remove('hidden');
        
        this.loadNode(startNodeId);
    }

    loadNode(nodeId) {
        this.currentNodeId = nodeId;
        const node = this.currentDialogNodes[nodeId];

        if (!node) {
            this.endDialog();
            return;
        }

        // Determinar si es un nodo puramente de opciones
        if (node.choices && !node.text) {
            this.showChoices(node.choices);
            return; // No hay texto que escribir
        }

        // Limpieza
        this.arrow.classList.remove('showArrow');
        this.choicesContainer.classList.add('hidden');
        this.choicesContainer.innerHTML = '';
        this.textBox.textContent = '';

        // Personaje
        const charData = this.characterDB[node.char] || this.characterDB["unknown"];
        this.nameLabel.textContent = charData.name;
        this.nameLabel.style.borderColor = charData.color; // Detalle estético
        this.portrait.textContent = charData.emoji;
        this.activeVoiceFreq = charData.voice;

        this.currentFullText = node.text || "...";
        
        // Iniciar Typewriter
        let i = 0;
        this.isTyping = true;
        
        const write = () => {
            if (i < this.currentFullText.length) {
                const c = this.currentFullText[i];
                this.textBox.textContent += c;
                this.portrait.classList.add("talking");

                // Sonido de tipeo estilo Layton (playBlip de Web Audio sin repetirse robótico)
                if (c !== " " && Math.random() > 0.25) {
                    if(window.AudioManager) window.AudioManager.playBlip(this.activeVoiceFreq);
                }

                i++;
                let speed = parseFloat(document.body.classList.contains('text-xlarge') ? 15 : 25) + Math.random() * 10;
                if (c === "." || c === ",") speed += 80;

                this.typewriterTimeout = setTimeout(write, speed);
            } else {
                this.isTyping = false;
                this.portrait.classList.remove("talking");
                this.arrow.classList.add("showArrow");
                
                // Mostrar opciones al final si las hay incrustadas en este nodo de texto
                if (node.choices) {
                    this.showChoices(node.choices);
                }
            }
        };

        write();
    }

    next() {
        if (!this.isActive) return;

        // Si hay opciones en pantalla, el click no debe avanzar, el usuario debe clicar una opción
        if (!this.choicesContainer.classList.contains('hidden')) return; 

        if (this.isTyping) {
            // Saltarse la escritura
            clearTimeout(this.typewriterTimeout);
            this.textBox.textContent = this.currentFullText;
            this.isTyping = false;
            this.portrait.classList.remove("talking");
            this.arrow.classList.add("showArrow");
            
            const node = this.currentDialogNodes[this.currentNodeId];
            if (node.choices) this.showChoices(node.choices);
        } else {
            // Avanzar al siguiente nodo
            const node = this.currentDialogNodes[this.currentNodeId];
            if (node.next) {
                this.loadNode(node.next);
            } else {
                this.endDialog();
            }
        }
    }

    showChoices(choices) {
        this.choicesContainer.innerHTML = '';
        this.choicesContainer.classList.remove('hidden');

        // Quitamos la flecha de avance porque obligamos a elegir
        this.arrow.classList.remove('showArrow');

        choices.forEach(choice => {
            const btn = document.createElement("div");
            btn.className = "choice-btn";
            btn.textContent = choice.text;

            btn.onclick = (e) => {
                e.stopPropagation();
                if (choice.triggerEvent) {
                    // Por si necesitamos eventos globales para puzles
                    window.dispatchEvent(new CustomEvent(choice.triggerEvent, { detail: choice.triggerData }));
                }
                this.choicesContainer.classList.add('hidden');
                this.loadNode(choice.next);
            };

            this.choicesContainer.appendChild(btn);
        });
    }

    endDialog() {
        this.isActive = false;
        this.overlay.classList.add('hidden');
        this.backdrop.classList.add('hidden');
        if (this.onDialogEnd) this.onDialogEnd();
    }
}

window.GameDialog = new DialogSystem();
