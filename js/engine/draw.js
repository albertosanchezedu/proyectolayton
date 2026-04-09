/**
 * Sistema de Pizarra Refinado (Layout Clásico)
 */
class DrawSystem {
    constructor() {
        this.canvas = document.getElementById('canvasOverlay');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.mode = 'pencil'; // 'pencil' o 'eraser'
        
        this.btnToggle = document.getElementById('btnToggleDraw');
        this.btnPencil = document.getElementById('btnPencil');
        this.btnEraser = document.getElementById('btnEraser');
        this.btnClear = document.getElementById('btnClearDraw');
        this.btnExitPizarra = document.getElementById('btnExitPizarra'); // Nuevo botón de salida local
        
        this.setupEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupEvents() {
        if(!this.btnToggle) return; // Puede no estar renderizado aún

        this.btnToggle.addEventListener('click', () => {
            this.togglePizarra();
        });
        
        if (this.btnExitPizarra) {
            this.btnExitPizarra.addEventListener('click', () => {
                this.disablePizarra();
            });
        }

        this.btnPencil.addEventListener('click', () => this.setMode('pencil'));
        this.btnEraser.addEventListener('click', () => this.setMode('eraser'));
        this.btnClear.addEventListener('click', () => this.clearCanvas());

        // Manejo táctil y ratón
        this.canvas.addEventListener('mousedown', (e) => this.startPosition(e));
        this.canvas.addEventListener('mouseup', () => this.endPosition());
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startPosition(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endPosition();
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    togglePizarra() {
        const isActive = this.canvas.classList.contains('active');
        if (isActive) {
            this.disablePizarra();
        } else {
            this.enablePizarra();
        }
    }

    enablePizarra() {
        this.canvas.classList.add('active');
        // Activar estéticas css en el puzzle container
        document.querySelector('.puzzle-container').classList.add('pizarra-mode');
        window.AudioManager.playBlip(600); // feedback
        
        this.btnToggle.innerText = "❌ Cerrar Pizarrita";
        this.btnToggle.style.color = "red";
        this.btnToggle.style.borderColor = "red";
    }

    disablePizarra() {
        this.canvas.classList.remove('active');
        document.querySelector('.puzzle-container').classList.remove('pizarra-mode');
        window.AudioManager.playBlip(400); // feedback de cierre
        
        this.btnToggle.innerText = "📝 Mi Pizarrita";
        this.btnToggle.style.color = "";
        this.btnToggle.style.borderColor = "";
    }

    setMode(newMode) {
        this.mode = newMode;
        if(newMode === 'pencil') {
            this.btnPencil.classList.add('active');
            this.btnEraser.classList.remove('active');
            this.ctx.globalCompositeOperation = 'source-over';
        } else {
            this.btnEraser.classList.add('active');
            this.btnPencil.classList.remove('active');
            this.ctx.globalCompositeOperation = 'destination-out';
        }
        window.AudioManager.playBlip(800);
    }

    startPosition(e) {
        if (!this.canvas.classList.contains('active')) return;
        this.isDrawing = true;
        this.draw(e);
        window.AudioManager.playBlip(300); // sonidito de lápiz leve
    }

    endPosition() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.lineWidth = document.body.classList.contains('high-contrast') ? 5 : 3;
        this.ctx.lineCap = 'round';
        
        if (this.mode === 'pencil') {
            this.ctx.strokeStyle = document.body.classList.contains('high-contrast') ? '#ffeb3b' : 'rgba(200, 20, 20, 0.8)';
        } else {
            this.ctx.lineWidth = 25; // goma más gorda
        }

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        window.AudioManager.playBlip(900);
    }
}

window.GameDraw = new DrawSystem();
