class InteractivePuzzle {
    constructor(pzData, containerElement) {
        this.data = pzData;
        this.container = containerElement;
        this.state = {};
        this.render();
    }

    render() {
        this.container.innerHTML = "";
        
        // --- MODULO RUTA_NODOS (Problema del Viajante) ---
        if(this.data.type === "ruta_nodos") {
            this.state.sequence = [];
            this.container.style.position = "relative";
            
            // Canvas for drawing lines
            this.canvas = document.createElement("svg");
            this.canvas.style = `position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1;`;
            this.container.appendChild(this.canvas);
            
            this.nodesMap = {};
            this.data.nodes.forEach(nd => {
                const nodeEl = document.createElement("div");
                nodeEl.className = "route-node";
                nodeEl.style.position = "absolute";
                nodeEl.style.left = `calc(${nd.x}% - 30px)`;
                nodeEl.style.top = `calc(${nd.y}% - 30px)`;
                nodeEl.innerText = nd.id + 1;
                
                nodeEl.onclick = () => {
                    window.AudioManager.playBlip();
                    if(this.state.sequence.includes(nd.id)) {
                        // Reset if clicking an already clicked node
                        this.state.sequence = [];
                        this.container.querySelectorAll('.route-node').forEach(e => e.classList.remove('active'));
                        this.canvas.innerHTML = '';
                    } else {
                        this.state.sequence.push(nd.id);
                        nodeEl.classList.add('active');
                        this.drawLines();
                    }
                };
                
                this.nodesMap[nd.id] = {el: nodeEl, x: nd.x, y: nd.y};
                this.container.appendChild(nodeEl);
            });
        }
        
        // --- MODULO PARCHEO_RELACIONES (Emparejar conceptos) ---
        else if (this.data.type === "parcheo_relaciones") {
            this.state.matches = {};
            this.state.selected = null;
            
            const flex = document.createElement('div');
            flex.style = "display:flex; justify-content:space-between; width:100%; padding:20px; gap:20px;";
            
            const buildCol = (items, side) => {
                const col = document.createElement('div');
                col.style = "display:flex; flex-direction:column; gap:10px; width:45%;";
                items.forEach(it => {
                    const btn = document.createElement('div');
                    btn.className = "drag-item";
                    btn.innerText = it.t;
                    btn.style.textAlign = "center";
                    btn.onclick = () => {
                        window.AudioManager.playBlip();
                        if(btn.dataset.paired) return; // Ya emparejado
                        
                        if(!this.state.selected) {
                            this.state.selected = {id: it.id, side: side, el: btn};
                            btn.style.borderColor = "var(--gold)";
                            btn.style.background = "var(--parchment2)";
                        } else {
                            if(this.state.selected.side === side) { // Cambio en misma columna
                                this.state.selected.el.style.borderColor = "";
                                this.state.selected.el.style.background = "";
                                this.state.selected = {id: it.id, side: side, el: btn};
                                btn.style.borderColor = "var(--gold)";
                            } else {
                                // Match!
                                btn.style.borderColor = "var(--green)";
                                btn.style.background = "#e0f2e0";
                                btn.dataset.paired = "true";
                                
                                this.state.selected.el.style.borderColor = "var(--green)";
                                this.state.selected.el.style.background = "#e0f2e0";
                                this.state.selected.el.dataset.paired = "true";
                                
                                if(side === 'B') this.state.matches[this.state.selected.id] = it.id;
                                else this.state.matches[it.id] = this.state.selected.id;
                                
                                this.state.selected = null;
                            }
                        }
                    };
                    col.appendChild(btn);
                });
                return col;
            };
            
            flex.appendChild(buildCol(this.data.colA, 'A'));
            flex.appendChild(buildCol(this.data.colB, 'B'));
            this.container.appendChild(flex);
        }
    }

    drawLines() {
        this.canvas.innerHTML = '';
        for(let i = 0; i < this.state.sequence.length - 1; i++) {
            const n1 = this.nodesMap[this.state.sequence[i]];
            const n2 = this.nodesMap[this.state.sequence[i+1]];
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", n1.x + "%");
            line.setAttribute("y1", n1.y + "%");
            line.setAttribute("x2", n2.x + "%");
            line.setAttribute("y2", n2.y + "%");
            line.setAttribute("stroke", "var(--gold)");
            line.setAttribute("stroke-width", "4");
            this.canvas.appendChild(line);
        }
    }

    validate() {
        if(this.data.type === "ruta_nodos") {
            const ansStr = this.state.sequence.join(',');
            return this.data.correctAnswers.includes(ansStr);
        }
        else if (this.data.type === "parcheo_relaciones") {
            const reqKeys = Object.keys(this.data.correctPairs);
            if(Object.keys(this.state.matches).length !== reqKeys.length) return false;
            for(let k of reqKeys) {
                if(this.state.matches[k] !== this.data.correctPairs[k]) return false;
            }
            return true;
        }
        return false;
    }
}
window.InteractivePuzzle = InteractivePuzzle;
