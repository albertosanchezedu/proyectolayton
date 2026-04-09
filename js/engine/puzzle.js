class PuzzleModule {
    constructor(pzData, containerId) {
        this.data = pzData;
        this.board = document.getElementById(containerId);
        this.state = {};
        this.render();
    }

    render() {
        this.board.innerHTML = "";
        
        // 1. MÓDULO: RUTA ÓPTIMA
        if(this.data.type === "ruta_grafo") {
            this.state.seq = [];
            this.board.innerHTML = `<svg id="pzLines" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1;"></svg>`;
            const svg = document.getElementById('pzLines');
            
            this.nodesMap = {};
            this.data.nodos.forEach((nd) => {
                const docNode = document.createElement("div");
                docNode.className = "node-travel";
                docNode.style.left = `calc(${nd.x}% - 30px)`;
                docNode.style.top = `calc(${nd.y}% - 30px)`;
                docNode.innerText = (nd.id + 1);
                
                docNode.onclick = () => {
                    window.AduioSys.playBlip(700);
                    // Si pinchan uno ya clickado, se resetea (como me pediste de dar opcion a corregir)
                    if(this.state.seq.includes(nd.id)) {
                        this.state.seq = [];
                        this.board.querySelectorAll('.node-travel').forEach(c => c.classList.remove('selected'));
                        svg.innerHTML = '';
                        return;
                    }

                    this.state.seq.push(nd.id);
                    docNode.classList.add('selected');
                    
                    // Dibujar líneas doradas
                    if(this.state.seq.length > 1) {
                        const prevId = this.state.seq[this.state.seq.length - 2];
                        const prevNode = this.nodesMap[prevId];
                        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        line.setAttribute("x1", prevNode.x + "%");
                        line.setAttribute("y1", prevNode.y + "%");
                        line.setAttribute("x2", nd.x + "%");
                        line.setAttribute("y2", nd.y + "%");
                        line.setAttribute("stroke", "var(--gold)");
                        line.setAttribute("stroke-width", "6");
                        line.setAttribute("stroke-dasharray", "10,10");
                        svg.appendChild(line);
                    }
                };
                this.nodesMap[nd.id] = {el: docNode, x: nd.x, y: nd.y};
                this.board.appendChild(docNode);
            });
        }
        
        // 3. MÓDULO: PANEL DE PARCHEO
        else if (this.data.type === "parcheo") {
            this.state.links = {};
            this.state.sel = null;

            const grid = document.createElement("div");
            grid.className = "panel-parcheo";
            
            const colIzq = document.createElement("div"); colIzq.className = "parcheo-col";
            const colDer = document.createElement("div"); colDer.className = "parcheo-col";
            
            const buildBtn = (item, isLeft) => {
                const b = document.createElement("div"); b.className = "parcheo-item"; b.innerText = item.txt;
                b.onclick = () => {
                    window.AduioSys.playBlip(900);
                    if(b.classList.contains('paired')) return;
                    
                    if(!this.state.sel) {
                        b.classList.add('active');
                        this.state.sel = {id: item.id, isLeft: isLeft, el: b};
                    } else {
                        // Cambio seleccion
                        if(this.state.sel.isLeft === isLeft) {
                            this.state.sel.el.classList.remove('active');
                            b.classList.add('active');
                            this.state.sel = {id: item.id, isLeft: isLeft, el: b};
                        } else {
                            // MATCH
                            b.classList.remove('active'); b.classList.add('paired');
                            this.state.sel.el.classList.remove('active'); this.state.sel.el.classList.add('paired');
                            
                            // Guardamos enlace origen(izq) -> dest(der)
                            if(isLeft) this.state.links[item.id] = this.state.sel.id;
                            else this.state.links[this.state.sel.id] = item.id;
                            
                            this.state.sel = null;
                        }
                    }
                };
                return b;
            };

            this.data.izq.forEach(i => colIzq.appendChild(buildBtn(i, true)));
            this.data.der.forEach(d => colDer.appendChild(buildBtn(d, false)));
            
            grid.appendChild(colIzq); grid.appendChild(colDer);
            this.board.appendChild(grid);
        }
    }

    validate() {
        if(this.data.type === "ruta_grafo") {
            const path = this.state.seq.join(',');
            return this.data.validArrays.includes(path);
        }
        else if (this.data.type === "parcheo") {
            for(let key in this.data.corrections) {
                if(this.state.links[key] !== this.data.corrections[key]) return false;
            }
            // Asegurarnos que se conectaron todos
            return Object.keys(this.state.links).length === Object.keys(this.data.corrections).length;
        }
        return false;
    }
}
window.PuzzleModule = PuzzleModule;
