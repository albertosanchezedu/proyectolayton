/**
 * Sistema de Pizarra (Overlay Canvas)
 * Permite a los alumnos dibujar sobre la pantalla del problema.
 */

class DrawingSystem {
    constructor() {
        this.canvas = document.getElementById('canvasOverlay');
        if(!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.isDrawing = false;
        this.mode = 'pencil'; // 'pencil' | 'eraser'
        
        this.btnToggle = document.getElementById('btnToggleDraw');
        this.btnPencil = document.getElementById('btnPencil');
        this.btnEraser = document.getElementById('btnEraser');
        this.btnClear = document.getElementById('btnClearDraw');

        this.setupEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Ajustamos la resolución interna del canvas al contenedor del puzzle
        const pzRect = document.querySelector('.puzzle-container').getBoundingClientRect();
        this.canvas.width = pzRect.width;
        this.canvas.height = pzRect.height;
    }

    setupEvents() {
        this.btnToggle.addEventListener('click', () => this.toggleCanvas());
        
        this.btnPencil.addEventListener('click', () => this.setMode('pencil'));
        this.btnEraser.addEventListener('click', () => this.setMode('eraser'));
        this.btnClear.addEventListener('click', () => this.clearCanvas());

        // Ratón / Toque
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.endDraw());
        this.canvas.addEventListener('mouseout', () => this.endDraw());
    }

    toggleCanvas() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.canvas.classList.add('active');
            this.btnToggle.classList.add('active');
            this.resize();
        } else {
            this.canvas.classList.remove('active');
            this.btnToggle.classList.remove('active');
        }
    }

    setMode(mode) {
        this.mode = mode;
        this.btnPencil.classList.toggle('active', mode === 'pencil');
        this.btnEraser.classList.toggle('active', mode === 'eraser');
    }

    startDraw(e) {
        if (!this.isActive) return;
        this.isDrawing = true;
        this.ctx.beginPath();
        
        const pos = this.getMousePos(e);
        this.ctx.moveTo(pos.x, pos.y);
    }

    draw(e) {
        if (!this.isActive || !this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        this.ctx.lineTo(pos.x, pos.y);

        if (this.mode === 'pencil') {
            this.ctx.strokeStyle = document.body.classList.contains('high-contrast') ? '#ffff00' : 'rgba(200, 30, 30, 0.8)';
            this.ctx.lineWidth = 4;
            this.ctx.globalCompositeOperation="source-over";
        } else {
            this.ctx.lineWidth = 40;
            this.ctx.globalCompositeOperation="destination-out";
        }

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }

    endDraw() {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
}

window.GameDraw = new DrawingSystem();
