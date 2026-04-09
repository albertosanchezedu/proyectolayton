/**
 * Sistema de Diálogos
 * Controla la aparición secuencial del texto, sonido de escritura, e interacciones.
 */

class DialogSystem {
    constructor() {
        this.overlay = document.getElementById('dialogOverlay');
        this.portrait = document.getElementById('dialogPortrait');
        this.nameLabel = document.getElementById('dialogName');
        this.textBox = document.getElementById('dialogText');
        this.arrow = document.getElementById('dialogArrow');
        this.choicesContainer = document.getElementById('dialogChoices');
        this.dialogBox = document.querySelector('.dialog-box');

        // Estado interno
        this.isActive = false;
        this.isTyping = false;
        this.currentFullText = "";
        this.currentCharacterIndex = 0;
        this.typewriterTimeout = null;
        
        // Referencia a los datos de la conversación actual
        this.currentDialogNodes = {};
        this.currentNodeId = null;
        
        // Callbacks
        this.onDialogEnd = null;

        // Base de personajes (esto puede luego cargarse del JSON)
        this.characterDB = {
            "layton": { name: "Profesor", emoji: "🎩", color: "#ffd27f", voice: 400 },
            "luke":   { name: "Luke", emoji: "🧢", color: "#9bcdff", voice: 700 },
            "jefe":   { name: "Jefe Almacén", emoji: "👷", color: "#ffaa00", voice: 300 },
            "cocinero": { name: "Cocinero", emoji: "🍳", color: "#eeeeee", voice: 450 },
            "unknown": { name: "???", emoji: "👤", color: "#aaaaaa", voice: 500 }
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Al hacer click sobre la caja principal del diálogo
        this.dialogBox.addEventListener('click', () => {
            if (!this.isActive) return;

            if (this.isTyping) {
                // Skip y mostrar todo
                this.skipTyping();
            } else {
                // Avanzar si no hay opciones en pantalla
                if (this.choicesContainer.classList.contains('hidden')) {
                    this.advanceDialog();
                }
            }
        });
    }

    startDialog(dialogNodes, startNodeId = "start", callback = null) {
        this.currentDialogNodes = dialogNodes;
        this.isActive = true;
        this.overlay.classList.remove('hidden');
        this.onDialogEnd = callback;
        
        this.loadNode(startNodeId);
    }

    loadNode(nodeId) {
        this.currentNodeId = nodeId;
        const node = this.currentDialogNodes[nodeId];

        if (!node) {
            this.endDialog();
            return;
        }

        // Limpiar UI
        this.arrow.classList.add('hidden');
        this.choicesContainer.classList.add('hidden');
        this.choicesContainer.innerHTML = '';
        this.textBox.innerHTML = '';

        // Definir personaje
        const charData = this.characterDB[node.char] || this.characterDB["unknown"];
        this.nameLabel.innerText = charData.name;
        this.nameLabel.style.color = charData.color;
        this.portrait.innerText = charData.emoji;

        // Configurar texto a escribir
        this.currentFullText = node.text || "...";
        this.currentCharacterIndex = 0;
        this.activeVoiceFreq = charData.voice;

        // Iniciar escritura
        this.isTyping = true;
        this.portrait.classList.add('talking');
        this.typeNextChar();
    }

    typeNextChar() {
        if (!this.isTyping) return;

        if (this.currentCharacterIndex < this.currentFullText.length) {
            const char = this.currentFullText.charAt(this.currentCharacterIndex);
            
            // Añadir carácter al div
            this.textBox.innerHTML += char;
            this.currentCharacterIndex++;

            // Reproducir sonido "blip" aleatoriamente para simular habla
            if (char.trim() !== "" && Math.random() > 0.4) {
                if(window.AudioManager) window.AudioManager.playBlip(this.activeVoiceFreq);
            }

            // Calcular pausa
            let speed = parseFloat(document.body.classList.contains('text-xlarge') ? 15 : 25) + Math.random() * 10;
            if (char === '.' || char === ',' || char === '!' || char === '?') {
                speed += 150; // Pausa dramática en signos de puntuación
            }

            this.typewriterTimeout = setTimeout(() => this.typeNextChar(), speed);
        } else {
            // Fin de la escritura
            this.finishTyping();
        }
    }

    skipTyping() {
        clearTimeout(this.typewriterTimeout);
        this.textBox.innerHTML = this.currentFullText;
        this.isTyping = false;
        this.finishTyping();
    }

    finishTyping() {
        this.isTyping = false;
        this.portrait.classList.remove('talking');
        
        const node = this.currentDialogNodes[this.currentNodeId];

        if (node.choices && node.choices.length > 0) {
            // Mostrar opciones
            this.showChoices(node.choices);
        } else {
            // Mostrar flechita de continuar
            this.arrow.classList.remove('hidden');
        }
    }

    showChoices(choices) {
        this.choicesContainer.classList.remove('hidden');
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            btn.onclick = (e) => {
                e.stopPropagation(); // Evitar click en dialogBox principal
                if (choice.triggerEvent) {
                     // Lanzar un evento global si la opción lo indica (p.ej iniciar puzzle)
                     window.dispatchEvent(new CustomEvent(choice.triggerEvent, { detail: choice.triggerData }));
                }
                this.loadNode(choice.next);
            };
            this.choicesContainer.appendChild(btn);
        });
    }

    advanceDialog() {
        const node = this.currentDialogNodes[this.currentNodeId];
        if (node.next) {
            this.loadNode(node.next);
        } else {
            this.endDialog();
        }
    }

    endDialog() {
        this.isActive = false;
        this.overlay.classList.add('hidden');
        if (this.onDialogEnd) this.onDialogEnd();
    }
}

// Inicializar global
window.GameDialog = new DialogSystem();
