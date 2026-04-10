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
                    if(this.state.seq.includes(nd.id)) {
                        this.state.seq = [];
                        this.board.querySelectorAll('.node-travel').forEach(c => c.classList.remove('selected'));
                        svg.innerHTML = '';
                        return;
                    }

                    this.state.seq.push(nd.id);
                    docNode.classList.add('selected');
                    
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
        
        // 2. MÓDULO: PANEL DE PARCHEO
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
                        if(this.state.sel.isLeft === isLeft) {
                            this.state.sel.el.classList.remove('active');
                            b.classList.add('active');
                            this.state.sel = {id: item.id, isLeft: isLeft, el: b};
                        } else {
                            b.classList.remove('active'); b.classList.add('paired');
                            this.state.sel.el.classList.remove('active'); this.state.sel.el.classList.add('paired');
                            
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

        // 3. MÓDULO: CINTA CLASIFICADORA
        else if (this.data.type === "cinta_clasificador") {
            this.state.placements = {}; // itemId -> binId
            
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.height = "100%";
            container.style.gap = "20px";
            
            const itemsArea = document.createElement("div");
            itemsArea.style.display = "flex";
            itemsArea.style.gap = "10px";
            itemsArea.style.flexWrap = "wrap";
            itemsArea.style.padding = "20px";
            itemsArea.style.background = "rgba(0,0,0,0.3)";
            itemsArea.style.borderRadius = "10px";
            itemsArea.style.minHeight = "100px";
            
            // Drag and drop variables
            let draggedId = null;

            this.data.items.forEach(it => {
                const itemEl = document.createElement("div");
                itemEl.innerText = it.txt;
                itemEl.style.padding = "10px 15px";
                itemEl.style.background = "var(--wood)";
                itemEl.style.color = "white";
                itemEl.style.borderRadius = "5px";
                itemEl.style.cursor = "grab";
                itemEl.style.userSelect = "none";
                itemEl.draggable = true;
                itemEl.id = "drag_" + it.id;
                
                itemEl.ondragstart = (e) => {
                    draggedId = it.id;
                    itemEl.style.opacity = "0.5";
                    e.dataTransfer.effectAllowed = 'move';
                };
                itemEl.ondragend = () => {
                    itemEl.style.opacity = "1";
                };
                
                itemsArea.appendChild(itemEl);
            });

            const binsArea = document.createElement("div");
            binsArea.style.display = "flex";
            binsArea.style.justifyContent = "space-around";
            binsArea.style.flex = "1";

            this.data.bins.forEach(bin => {
                const binEl = document.createElement("div");
                binEl.style.flex = "1";
                binEl.style.margin = "0 10px";
                binEl.style.border = "3px dashed var(--gold)";
                binEl.style.borderRadius = "10px";
                binEl.style.display = "flex";
                binEl.style.flexDirection = "column";
                binEl.style.alignItems = "center";
                binEl.style.padding = "10px";
                
                const binTitle = document.createElement("h3");
                binTitle.innerText = bin.name;
                binTitle.style.color = "var(--gold)";
                binEl.appendChild(binTitle);
                
                const dropZone = document.createElement("div");
                dropZone.style.flex = "1";
                dropZone.style.width = "100%";
                dropZone.style.display = "flex";
                dropZone.style.flexDirection = "column";
                dropZone.style.gap = "5px";
                
                binEl.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
                binEl.ondragenter = (e) => { e.preventDefault(); binEl.style.background = "rgba(255,215,0,0.1)"; };
                binEl.ondragleave = () => { binEl.style.background = "transparent"; };
                binEl.ondrop = (e) => {
                    e.preventDefault();
                    binEl.style.background = "transparent";
                    if(draggedId) {
                        window.AduioSys.playBlip(700);
                        const el = document.getElementById("drag_" + draggedId);
                        dropZone.appendChild(el);
                        this.state.placements[draggedId] = bin.id;
                    }
                };
                
                binEl.appendChild(dropZone);
                binsArea.appendChild(binEl);
            });

            container.appendChild(itemsArea);
            container.appendChild(binsArea);
            this.board.appendChild(container);
        }

        // 4. MÓDULO: DIALES DE COMBINACIÓN
        else if (this.data.type === "diales") {
            this.state.dials = {}; // dialId -> currentIndex
            
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "center";
            container.style.alignItems = "center";
            container.style.gap = "30px";
            container.style.height = "100%";

            this.data.dials.forEach(dial => {
                this.state.dials[dial.id] = 0;
                
                const dialContainer = document.createElement("div");
                dialContainer.style.display = "flex";
                dialContainer.style.flexDirection = "column";
                dialContainer.style.alignItems = "center";
                dialContainer.style.gap = "15px";

                const dialWheel = document.createElement("div");
                dialWheel.style.width = "120px";
                dialWheel.style.height = "120px";
                dialWheel.style.borderRadius = "50%";
                dialWheel.style.background = "conic-gradient(var(--wood) 0%, #4a2c16 100%)";
                dialWheel.style.border = "4px solid var(--gold)";
                dialWheel.style.display = "flex";
                dialWheel.style.justifyContent = "center";
                dialWheel.style.alignItems = "center";
                dialWheel.style.cursor = "pointer";
                dialWheel.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                dialWheel.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)";
                
                const symbolText = document.createElement("div");
                symbolText.style.fontSize = "3rem";
                symbolText.style.color = "var(--gold)";
                symbolText.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
                symbolText.innerText = dial.options[0];
                
                dialWheel.appendChild(symbolText);
                
                // Add an indicator arrow
                const arrow = document.createElement("div");
                arrow.innerHTML = "▼";
                arrow.style.color = "var(--gold)";
                arrow.style.fontSize = "2rem";

                dialWheel.onclick = () => {
                    window.AduioSys.playBlip(500);
                    this.state.dials[dial.id] = (this.state.dials[dial.id] + 1) % dial.options.length;
                    
                    // Rotate effect
                    const currentRot = this.state.dials[dial.id] * (360 / dial.options.length);
                    dialWheel.style.transform = `rotate(${currentRot}deg)`;
                    
                    // Keep text upright
                    symbolText.style.transform = `rotate(-${currentRot}deg)`;
                    symbolText.innerText = dial.options[this.state.dials[dial.id]];
                };

                const label = document.createElement("h3");
                label.innerText = dial.label;
                label.style.color = "white";

                dialContainer.appendChild(arrow);
                dialContainer.appendChild(dialWheel);
                dialContainer.appendChild(label);
                
                container.appendChild(dialContainer);
            });
            this.board.appendChild(container);
        }

        // 5. MÓDULO: BALANZA
        else if (this.data.type === "balanza") {
            this.state.leftPan = [];
            this.state.rightPan = [];

            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.height = "100%";
            container.style.alignItems = "center";
            
            // Render the items to drag
            const itemsArea = document.createElement("div");
            itemsArea.style.display = "flex";
            itemsArea.style.gap = "15px";
            itemsArea.style.padding = "20px";
            itemsArea.style.minHeight = "80px";
            
            let draggedWeight = null;

            this.data.weights.forEach(w => {
                const el = document.createElement("div");
                el.innerText = w.name;
                el.style.width = "80px";
                el.style.height = "80px";
                el.style.background = "linear-gradient(135deg, #bbb, #555)";
                el.style.borderRadius = "10px";
                el.style.border = "2px solid #333";
                el.style.display = "flex";
                el.style.justifyContent = "center";
                el.style.alignItems = "center";
                el.style.color = "white";
                el.style.fontWeight = "bold";
                el.style.textAlign = "center";
                el.style.fontSize = "0.8rem";
                el.style.cursor = "grab";
                el.draggable = true;
                el.id = "weight_" + w.id;
                
                el.ondragstart = (e) => {
                    draggedWeight = w;
                    e.dataTransfer.effectAllowed = 'move';
                };
                itemsArea.appendChild(el);
            });

            // The Scale
            const scaleArea = document.createElement("div");
            scaleArea.style.flex = "1";
            scaleArea.style.width = "100%";
            scaleArea.style.position = "relative";
            scaleArea.style.display = "flex";
            scaleArea.style.justifyContent = "center";
            scaleArea.style.alignItems = "flex-end";
            scaleArea.style.paddingBottom = "50px";

            const beam = document.createElement("div");
            beam.style.width = "60%";
            beam.style.height = "10px";
            beam.style.background = "var(--gold)";
            beam.style.position = "absolute";
            beam.style.bottom = "150px";
            beam.style.transition = "transform 0.5s ease";
            beam.style.transformOrigin = "center";

            const base = document.createElement("div");
            base.style.width = "20px";
            base.style.height = "150px";
            base.style.background = "var(--wood)";
            base.style.border = "2px solid var(--gold)";
            
            const createPan = (isLeft) => {
                const panBase = document.createElement("div");
                panBase.style.position = "absolute";
                panBase.style.bottom = "-80px";
                panBase.style.width = "120px";
                panBase.style.height = "20px";
                panBase.style.background = "var(--wood)";
                panBase.style.border = "2px solid var(--gold)";
                panBase.style.display = "flex";
                panBase.style.justifyContent = "center";
                panBase.style.alignItems = "flex-end";
                panBase.style.gap = "5px";
                
                if(isLeft) panBase.style.left = "0";
                else panBase.style.right = "0";

                panBase.ondragover = (e) => e.preventDefault();
                panBase.ondrop = (e) => {
                    e.preventDefault();
                    if(draggedWeight) {
                        window.AduioSys.playBlip(400);
                        const el = document.getElementById("weight_" + draggedWeight.id);
                        panBase.appendChild(el); // moves element physically
                        
                        // Update logical state
                        this.state.leftPan = this.state.leftPan.filter(w => w.id !== draggedWeight.id);
                        this.state.rightPan = this.state.rightPan.filter(w => w.id !== draggedWeight.id);
                        
                        if(isLeft) this.state.leftPan.push(draggedWeight);
                        else this.state.rightPan.push(draggedWeight);
                        
                        // Recalculate tilt
                        let lW = this.state.leftPan.reduce((acc, w) => acc + w.val, 0);
                        let rW = this.state.rightPan.reduce((acc, w) => acc + w.val, 0);
                        let diff = rW - lW; // positive = right is heavier
                        // max tilt is 30deg
                        let tilt = Math.max(-30, Math.min(30, diff * 5));
                        beam.style.transform = `rotate(${tilt}deg)`;
                    }
                };

                // Keep pans horizontal
                setInterval(() => {
                    // Reverse the beam's rotation on the pan so it stays flat
                    panBase.style.transform = `rotate(${-1 * parseFloat(beam.style.transform.replace(/[^\d.-]/g, '') || 0)}deg)`;
                }, 50);

                return panBase;
            };

            const lPan = createPan(true);
            const rPan = createPan(false);
            beam.appendChild(lPan);
            beam.appendChild(rPan);

            scaleArea.appendChild(base);
            scaleArea.appendChild(beam);
            
            container.appendChild(itemsArea);
            container.appendChild(scaleArea);
            this.board.appendChild(container);
        }

        // 6. MÓDULO: INSPECCIÓN OCULTA (Linterna)
        else if (this.data.type === "inspeccion_oculta") {
            this.state.found = [];
            
            const container = document.createElement("div");
            container.style.position = "relative";
            container.style.width = "100%";
            container.style.height = "100%";
            container.style.background = "#111"; // DARK
            container.style.overflow = "hidden";
            container.style.cursor = "none"; // Hide cursor
            
            const instruction = document.createElement("div");
            instruction.innerText = "Mueve el ratón para usar la linterna y pulsa sobre las anomalías.";
            instruction.style.position = "absolute";
            instruction.style.top = "10px";
            instruction.style.left = "0";
            instruction.style.width = "100%";
            instruction.style.textAlign = "center";
            instruction.style.color = "rgba(255,255,255,0.5)";
            instruction.style.zIndex = "10";
            instruction.style.pointerEvents = "none";
            container.appendChild(instruction);

            // Layer Reveal
            const revealLayer = document.createElement("div");
            revealLayer.style.position = "absolute";
            revealLayer.style.inset = "0";
            revealLayer.style.background = this.data.bgImage ? `url(${this.data.bgImage}) center/cover` : "#333";
            revealLayer.style.clipPath = "circle(60px at 50% 50%)"; // initial
            revealLayer.style.pointerEvents = "none";
            // We want the light to follow the mouse
            container.onmousemove = (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                revealLayer.style.clipPath = `circle(80px at ${x}px ${y}px)`;
            };
            
            // Add Hotspots (anomalies)
            this.data.hotspots.forEach(hs => {
                const spot = document.createElement("div");
                spot.style.position = "absolute";
                spot.style.left = `calc(${hs.x}% - 20px)`;
                spot.style.top = `calc(${hs.y}% - 20px)`;
                spot.style.width = "40px";
                spot.style.height = "40px";
                spot.style.borderRadius = "50%";
                // The spot is invisible unless hovered/clicked, or just invisible and user guesses
                spot.style.cursor = "crosshair";
                spot.style.zIndex = "5"; // Below instructions
                
                // Content of hotspot revealed only in reveal layer?
                const visualMark = document.createElement("div");
                visualMark.innerText = hs.symbol || "⚠️";
                visualMark.style.position = "absolute";
                visualMark.style.left = `calc(${hs.x}% - 20px)`;
                visualMark.style.top = `calc(${hs.y}% - 20px)`;
                visualMark.style.fontSize = "30px";
                revealLayer.appendChild(visualMark);

                spot.onclick = () => {
                    if(!this.state.found.includes(hs.id)) {
                        window.AduioSys.playBlip(900);
                        this.state.found.push(hs.id);
                        spot.style.border = "2px solid #0f0";
                        visualMark.style.color = "#0f0";
                    }
                };
                container.appendChild(spot);
            });
            
            container.appendChild(revealLayer);
            this.board.appendChild(container);
        }

        // 7. MÓDULO: SECUENCIADOR DE VÁLVULAS
        else if (this.data.type === "secuenciador_valvulas") {
            this.state.order = []; // ids clicked
            
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "center";
            container.style.alignItems = "center";
            container.style.gap = "20px";
            container.style.height = "100%";
            container.style.flexWrap = "wrap";
            container.style.padding = "20px";

            // Visual Pipe representation
            const pipeLine = document.createElement("div");
            pipeLine.style.position = "absolute";
            pipeLine.style.width = "80%";
            pipeLine.style.height = "20px";
            pipeLine.style.background = "#222";
            pipeLine.style.top = "50%";
            pipeLine.style.zIndex = "1";
            container.appendChild(pipeLine);
            
            this.data.valves.forEach((v, index) => {
                const valveWrapper = document.createElement("div");
                valveWrapper.style.zIndex = "2";
                valveWrapper.style.display = "flex";
                valveWrapper.style.flexDirection = "column";
                valveWrapper.style.alignItems = "center";
                
                const valveBtn = document.createElement("div");
                valveBtn.style.width = "60px";
                valveBtn.style.height = "60px";
                valveBtn.style.background = "var(--wood)";
                valveBtn.style.borderRadius = "50%";
                valveBtn.style.border = "5px solid #888";
                valveBtn.style.display = "flex";
                valveBtn.style.justifyContent = "center";
                valveBtn.style.alignItems = "center";
                valveBtn.style.cursor = "pointer";
                valveBtn.style.transition = "transform 0.3s";
                
                const handle = document.createElement("div");
                handle.style.width = "50px";
                handle.style.height = "10px";
                handle.style.background = "#d32f2f";
                handle.style.transform = "rotate(0deg)"; // closed (horizontal)
                handle.style.transition = "transform 0.3s ease-in-out, background 0.3s";
                valveBtn.appendChild(handle);
                
                const label = document.createElement("div");
                label.innerText = v.label;
                label.style.marginTop = "10px";
                label.style.color = "white";
                label.style.fontWeight = "bold";

                valveBtn.onclick = () => {
                    if(this.state.order.includes(v.id)) return; // already open
                    window.AduioSys.playBlip(300);
                    
                    // Add to current sequence
                    this.state.order.push(v.id);
                    const expectedId = this.data.correctOrder[this.state.order.length - 1];
                    
                    if(v.id === expectedId) {
                        // Correct next step
                        handle.style.transform = "rotate(90deg)"; // Open vertical
                        handle.style.background = "#4caf50";
                        window.AduioSys.playBlip(700);
                    } else {
                        // Error - PFFFT! Fuga de gas
                        window.AduioSys.playBlip(100);
                        // Visual explosion / error
                        valveBtn.style.animation = "shake 0.5s";
                        handle.style.background = "orange";
                        setTimeout(() => {
                            // Reset state
                            this.state.order = [];
                            container.querySelectorAll('.valve-handle').forEach(h => {
                                h.style.transform = "rotate(0deg)";
                                h.style.background = "#d32f2f";
                            });
                        }, 800);
                    }
                };
                
                // add class to handle to reset it
                handle.className = "valve-handle";

                valveWrapper.appendChild(valveBtn);
                valveWrapper.appendChild(label);
                container.appendChild(valveWrapper);
            });
            
            this.board.appendChild(container);
        }

        // 8. MÓDULO: ARCHIVADOR DINÁMICO
        else if (this.data.type === "archivador_dinamico") {
            this.state.placements = {}; // fileId -> drawerId
            
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.height = "100%";
            container.style.gap = "20px";
            container.style.padding = "20px";

            // Area de fichas
            const filesArea = document.createElement("div");
            filesArea.style.flex = "1";
            filesArea.style.display = "flex";
            filesArea.style.flexDirection = "column";
            filesArea.style.gap = "10px";
            
            let draggedFile = null;

            this.data.files.forEach(f => {
                const fileEl = document.createElement("div");
                fileEl.innerText = f.txt;
                fileEl.style.padding = "10px";
                fileEl.style.background = "#fff";
                fileEl.style.color = "#333";
                fileEl.style.border = "1px solid #ccc";
                fileEl.style.borderRadius = "3px";
                fileEl.style.cursor = "grab";
                fileEl.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.5)";
                fileEl.draggable = true;
                fileEl.id = "file_" + f.id;
                
                fileEl.ondragstart = (e) => {
                    draggedFile = f.id;
                    fileEl.style.opacity = "0.5";
                };
                fileEl.ondragend = () => fileEl.style.opacity = "1";
                
                filesArea.appendChild(fileEl);
            });

            // Área de cajones
            const filingCabinet = document.createElement("div");
            filingCabinet.style.flex = "1";
            filingCabinet.style.display = "flex";
            filingCabinet.style.flexDirection = "column";
            filingCabinet.style.gap = "15px";
            filingCabinet.style.background = "var(--wood)";
            filingCabinet.style.padding = "20px";
            filingCabinet.style.border = "5px solid #3a2212";
            filingCabinet.style.borderRadius = "5px";

            this.data.drawers.forEach(d => {
                const drawer = document.createElement("div");
                drawer.style.height = "80px";
                drawer.style.background = "#6b4226";
                drawer.style.border = "2px solid #52311a";
                drawer.style.borderRadius = "5px";
                drawer.style.display = "flex";
                drawer.style.alignItems = "center";
                drawer.style.justifyContent = "center";
                drawer.style.color = "var(--gold)";
                drawer.style.fontWeight = "bold";
                drawer.style.fontSize = "1.2rem";
                drawer.style.position = "relative";
                drawer.innerText = d.name;
                
                // Handle graphic
                const handle = document.createElement("div");
                handle.style.position = "absolute";
                handle.style.top = "10px";
                handle.style.width = "40px";
                handle.style.height = "10px";
                handle.style.background = "var(--gold)";
                handle.style.borderRadius = "5px";
                drawer.appendChild(handle);

                drawer.ondragover = e => e.preventDefault();
                drawer.ondragenter = () => { drawer.style.filter = "brightness(1.5)"; };
                drawer.ondragleave = () => { drawer.style.filter = "brightness(1)"; };
                drawer.ondrop = (e) => {
                    e.preventDefault();
                    drawer.style.filter = "brightness(1)";
                    if(draggedFile) {
                        window.AduioSys.playBlip(600);
                        this.state.placements[draggedFile] = d.id;
                        const el = document.getElementById("file_" + draggedFile);
                        el.style.display = "none"; // Goes inside the drawer
                        
                        // Drawer animation (open and close)
                        drawer.style.transform = "translateX(20px)";
                        setTimeout(() => {
                            drawer.style.transform = "translateX(0px)";
                            window.AduioSys.playBlip(300); // slam shut
                        }, 200);
                    }
                };

                filingCabinet.appendChild(drawer);
            });

            container.appendChild(filesArea);
            container.appendChild(filingCabinet);
            this.board.appendChild(container);
        }

        // 9. MÓDULO: MOSAICO TÉCNICO
        else if (this.data.type === "mosaico_tecnico") {
            this.state.placed = 0;
            
            const container = document.createElement("div");
            container.style.position = "relative";
            container.style.width = "100%";
            container.style.height = "100%";
            
            // The pallet grid target (simplified dropzone)
            const pallet = document.createElement("div");
            pallet.style.position = "absolute";
            pallet.style.right = "10%";
            pallet.style.top = "20%";
            pallet.style.width = "200px";
            pallet.style.height = "250px";
            pallet.style.background = "var(--wood)";
            pallet.style.border = "4px solid var(--gold)";
            pallet.style.display = "grid";
            pallet.style.gridTemplateColumns = "1fr 1fr";
            pallet.style.gridTemplateRows = "1fr 1fr";
            pallet.style.gap = "5px";
            pallet.style.padding = "5px";
            
            container.appendChild(pallet);

            let draggedBlock = null;

            // Generate slots inside pallet
            for(let i=0; i<4; i++) {
                const slot = document.createElement("div");
                slot.style.border = "2px dashed rgba(255,255,255,0.3)";
                
                slot.ondragover = e => e.preventDefault();
                slot.ondrop = (e) => {
                    e.preventDefault();
                    if(draggedBlock && slot.children.length === 0) {
                        slot.appendChild(draggedBlock);
                        window.AduioSys.playBlip(800);
                        draggedBlock.style.position = "static";
                        draggedBlock.style.width = "100%";
                        draggedBlock.style.height = "100%";
                        draggedBlock.style.margin = "0";
                        this.state.placed++;
                    }
                };
                pallet.appendChild(slot);
            }

            // The blocks
            this.data.blocks.forEach((b, idx) => {
                const block = document.createElement("div");
                block.innerText = b.txt;
                block.style.position = "absolute";
                block.style.left = "10%";
                block.style.top = `${10 + (idx * 25)}%`;
                block.style.width = "100px";
                block.style.height = "50px";
                block.style.background = b.color || "#45a049";
                block.style.color = "white";
                block.style.display = "flex";
                block.style.justifyContent = "center";
                block.style.alignItems = "center";
                block.style.cursor = "grab";
                block.draggable = true;
                
                block.ondragstart = () => { draggedBlock = block; block.style.opacity = "0.8"; };
                block.ondragend = () => { block.style.opacity = "1"; };
                
                container.appendChild(block);
            });
            
            this.board.appendChild(container);
        }

        // 10. MÓDULO: SINTONIZADOR (Osciloscopio)
        else if (this.data.type === "sintonizador") {
            this.state.amp = 50; 
            this.state.freq = 50;
            
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "center";
            container.style.gap = "20px";
            container.style.padding = "20px";
            
            // Screen
            const screen = document.createElement("div");
            screen.style.width = "100%";
            screen.style.height = "250px";
            screen.style.background = "#001a00";
            screen.style.border = "4px solid #333";
            screen.style.position = "relative";
            
            // Target Wave (ghost)
            const svgTarget = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgTarget.style.position = "absolute";
            svgTarget.style.inset = "0";
            svgTarget.style.width = "100%";
            svgTarget.style.height = "100%";
            const pathTarget = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathTarget.setAttribute("stroke", "rgba(0, 255, 0, 0.3)");
            pathTarget.setAttribute("fill", "transparent");
            pathTarget.setAttribute("stroke-width", "4");
            svgTarget.appendChild(pathTarget);
            
            // Current Wave
            const svgCurr = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgCurr.style.position = "absolute";
            svgCurr.style.inset = "0";
            svgCurr.style.width = "100%";
            svgCurr.style.height = "100%";
            const pathCurr = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathCurr.setAttribute("stroke", "#0f0");
            pathCurr.setAttribute("fill", "transparent");
            pathCurr.setAttribute("stroke-width", "2");
            svgCurr.appendChild(pathCurr);
            
            screen.appendChild(svgTarget);
            screen.appendChild(svgCurr);
            
            // Controls
            const controls = document.createElement("div");
            controls.style.display = "flex";
            controls.style.gap = "30px";
            
            const createSlider = (labelStr, onChange) => {
                const wrap = document.createElement("div");
                wrap.style.color = "#0f0";
                wrap.style.fontFamily = "monospace";
                wrap.innerText = labelStr + ": ";
                const s = document.createElement("input");
                s.type = "range";
                s.min = "10"; s.max = "100"; s.value = "50";
                s.oninput = (e) => onChange(parseInt(e.target.value));
                wrap.appendChild(s);
                return wrap;
            };

            const drawWave = (path, a, f) => {
                // simple sine wave drawer
                let d = `M 0 125 `;
                for(let i=0; i<=400; i+=10) {
                    const y = 125 + Math.sin(i * f * 0.001) * a;
                    d += `L ${i} ${y} `;
                }
                path.setAttribute("d", d);
            };

            // Initial draw
            setTimeout(() => {
                drawWave(pathTarget, this.data.targetAmp, this.data.targetFreq);
                drawWave(pathCurr, this.state.amp, this.state.freq);
            }, 100);

            controls.appendChild(createSlider("Tensión", (v) => { this.state.amp = v; drawWave(pathCurr, this.state.amp, this.state.freq); }));
            controls.appendChild(createSlider("Velocidad", (v) => { this.state.freq = v; drawWave(pathCurr, this.state.amp, this.state.freq); }));
            
            container.appendChild(screen);
            container.appendChild(controls);
            this.board.appendChild(container);
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
            return Object.keys(this.state.links).length === Object.keys(this.data.corrections).length;
        }
        else if (this.data.type === "cinta_clasificador") {
            const placedCount = Object.keys(this.state.placements).length;
            if(placedCount < this.data.items.length) return false;
            for(let key in this.data.corrections) {
                if(this.state.placements[key] !== this.data.corrections[key]) return false;
            }
            return true;
        }
        else if (this.data.type === "diales") {
            for(let i=0; i<this.data.dials.length; i++) {
                const dial = this.data.dials[i];
                if(this.state.dials[dial.id] !== dial.correctIndex) return false;
            }
            return true;
        }
        else if (this.data.type === "balanza") {
            const lW = this.state.leftPan.reduce((acc, w) => acc + w.val, 0);
            const rW = this.state.rightPan.reduce((acc, w) => acc + w.val, 0);
            return lW === this.data.targetLeft && rW === this.data.targetRight;
        }
        else if (this.data.type === "inspeccion_oculta") {
            if(this.data.requiredHotspots) {
                return this.data.requiredHotspots.every(r => this.state.found.includes(r));
            }
            return this.state.found.length > 0;
        }
        else if (this.data.type === "secuenciador_valvulas") {
            if(this.state.order.length !== this.data.correctOrder.length) return false;
            return this.state.order.every((val, i) => val === this.data.correctOrder[i]);
        }
        else if (this.data.type === "archivador_dinamico") {
            const placedCount = Object.keys(this.state.placements).length;
            if(placedCount < this.data.files.length) return false;
            for(let key in this.data.corrections) {
                if(this.state.placements[key] !== this.data.corrections[key]) return false;
            }
            return true;
        }
        else if (this.data.type === "mosaico_tecnico") {
            return this.state.placed === this.data.blocks.length;
        }
        else if (this.data.type === "sintonizador") {
            const diffA = Math.abs(this.state.amp - this.data.targetAmp);
            const diffF = Math.abs(this.state.freq - this.data.targetFreq);
            return diffA < 5 && diffF < 5; // tolerance
        }
        return false;
    }
}
window.PuzzleModule = PuzzleModule;
