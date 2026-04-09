/**
 * Dummy de Guardado de métricas en memoria local (Fase 1)
 */

window.SaveSystem = {
    data: {
        puzzlesFound: 0,
        totalPuzzles: 0,
        puzzlesSolved: 0,
        coinsCount: 0,
        ingenioPoints: 0
    },

    load: function() {
        try {
            const saved = localStorage.getItem('layton_save');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch(e) { console.warn("Local storage disabled", e); }
        this.updateHUD();
    },

    save: function() {
        try {
            localStorage.setItem('layton_save', JSON.stringify(this.data));
        } catch(e) { console.warn("Local storage disabled", e); }
        this.updateHUD();
    },

    addCoin: function() {
        this.data.coinsCount++;
        this.save();
    },

    updateHUD: function() {
        document.getElementById('puzzlesFound').innerText = this.data.puzzlesFound;
        document.getElementById('totalPuzzles').innerText = this.data.totalPuzzles;
        document.getElementById('puzzlesSolved').innerText = this.data.puzzlesSolved;
        document.getElementById('coinsCount').innerText = this.data.coinsCount;
        document.getElementById('ingenioPoints').innerText = this.data.ingenioPoints;
    }
};
