const DialogData = {
    "start": {
        char: "🎩", name: "Profesor Alberto", machine: false,
        text: "Luke, el centro de distribución ha bloqueado los servidores logísticos. Como ves en el monitor, las piezas no coinciden.",
        choices: [
            { text: "¿Qué han roto exactamente, Profesor?", target: "explicacion_roto" },
            { text: "Vamos directamente a los servidores.", target: "hacia_servidor" }
        ]
    },
    "explicacion_roto": {
        char: "🧢", name: "Luke", machine: false,
        text: "Parece que la IA que controla el escaneo dinámico y la ruta de los robots ha mezclado todos los conceptos. ¡La mercancía está atascada!",
        choices: [ { text: "Tendremos que reconfigurarlo.", target: "hacia_servidor" } ]
    },
    "hacia_servidor": {
        char: "👷", name: "I.A. Central", machine: true, // Esto activará el CSS negro+azul vibrante (pulsumMachine)
        text: "[ALERTA] RUTA NO OPTIMIZADA. LOS ROBOTS EN BUCLE CERRADO. INGRESE SECUENCIA VÁLIDA PARA PROTOCOLO 'VIAJANTE'.",
        choices: [ { text: "Revisar el terminal.", target: "pzl_001_intro" } ]
    },
    
    // NODOS CREADOS PARA PURO CONTROL DE PUZLE
    "pzl_001_intro": { pzl: "puzzle_001" },
    
    "pzl_001_fail": {
        char: "🎩", name: "Profesor Alberto", machine: false,
        text: "No, Luke. Observa cómo has provocado que un robot cruce una calle por la que ya había pasado. Así perderemos dinero. Inténtalo de nuevo.",
        choices: [
            { text: "Lo tengo, reintentar.", target: "pzl_001_intro" },
            { text: "Hagamos otra cosa primero.", target: "hacia_servidor" }
        ]
    },
    "pzl_001_win": {
        char: "🧢", name: "Luke", machine: false,
        text: "¡Correcto! Una ruta que conecta secuencialmente sin cruzarse a sí misma. ¡Los robots recogen las cajas sin chocar!",
        choices: [ { text: "Siguiente problema.", target: "servidor_fase2" } ]
    },

    "servidor_fase2": {
        char: "👷", name: "I.A. Central", machine: true,
        text: "[SISTEMA DE EMPAQUETADO DESCONECTADO]. NO SE DETECTAN ENLACES DE CABLES ENTRE LOS CONCEPTOS VISOESPACIALES Y LAS MÁQUINAS.",
        choices: [ { text: "¡Tenemos que parchear el panel de cables!", target: "pzl_002_intro" } ]
    },
    "pzl_002_intro": { pzl: "puzzle_002" },

    "pzl_002_fail": {
        char: "🎩", name: "Profesor Alberto", machine: false,
        text: "Cuidado... Si vinculas el Wraparound con comunicación de voz destruirás las cajas. Revisa qué es un envase terciario y vuelve a enlazar los cables correctos.",
        choices: [{ text: "Reintentar Panel", target: "pzl_002_intro" }]
    },
    "pzl_002_win": {
        char: "🎩", name: "Profesor Alberto", machine: false,
        text: "Excelente. La balanza logística ha sido reequilibrada y el almacén funciona a pleno rendimiento. Al fin y al cabo, un puzle completado es una mente ordenada.",
        choices: [{ text: "Fin de Capítulo", target: "start" }]
    },
    "pzl_003_win": { char: "🧢", name: "Luke", machine: false, text: "¡Clasificación perfecta! Las cajas y envases ya van por su carril adecuado.", choices: [{ text: "Avanzar", target: "start" }] },
    "pzl_003_fail": { char: "🎩", name: "Profesor Alberto", machine: false, text: "Esa clasificación no es correcta. Recuerda qué capa agrupa productos para el lineal y cuál para el transporte pesado.", choices: [{ text: "Reintentar", target: "start" }] },
    "pzl_004_win": { char: "🧢", name: "Luke", machine: false, text: "¡Hiciste coincidir los símbolos! La caja fuerte de la etiquetadora ha sido calibrada.", choices: [{ text: "Avanzar", target: "start" }] },
    "pzl_004_fail": { char: "🎩", name: "Profesor Alberto", machine: false, text: "No creo que esos símbolos de etiquetado sean los correctos. Gira los diales con más precisión.", choices: [{ text: "Reintentar", target: "start" }] },
    "pzl_005_win": { char: "🧢", name: "Luke", machine: false, text: "¡La balanza financiera y de pesos está en equilibrio!", choices: [{ text: "Avanzar", target: "start" }] },
    "pzl_005_fail": { char: "🎩", name: "Profesor Alberto", machine: false, text: "Piénsalo mejor, Luke. Las transpaletas manuales son baratas pero de poca capacidad. Trata de equilibrar la inversión.", choices: [{ text: "Reintentar", target: "start" }] }
};

const PuzzlesData = {
    // ════ 1. MÓDULO RUTA ÓPTIMA (Grafo) ════
    "puzzle_001": {
        title: "Puzle 001: El Viajero Astuto",
        valPicarats: 40,
        desc: "Las líneas de los robots <b>Picking</b> se cruzan. Soluciónalo haciendo <b>Click sobre los 4 nodos</b> en el área interactiva formando una ruta continua circular para que recojan en <b>orden perimetral</b> sin volver atrás.",
        hint: "No intentes saltar de la A a la C directamente. Imagina un polígono y sigue el borde (Ejemplo: Base -> A -> C -> Salida).",
        type: "ruta_grafo",
        nodos: [
            {id: 0, x: 20, y: 20, l: "Base"},
            {id: 1, x: 80, y: 20, l: "BaseA"},
            {id: 2, x: 80, y: 80, l: "BaseC"},
            {id: 3, x: 20, y: 80, l: "BaseB"} 
        ],
        // Soluciones válidas circulares (0,1,2,3 o 0,3,2,1)
        validArrays: ["0,1,2,3", "0,3,2,1"],
        winMsg: "Al trazar el perímetro logramos que la carretilla nunca se encuentre en el mismo punto con tráfico opuesto. El 'Mapeado en U' es la base del ahorro en almacenes logísticos.",
        nodeWin: "pzl_001_win", nodeFail: "pzl_001_fail"
    },

    // ════ 2. MÓDULO PANEL DE PARCHEO (Drag & Conexión) ════
    "puzzle_002": {
        title: "Puzle 002: Panel de Parcheo",
        valPicarats: 50,
        desc: "¡La IA mezcló los equipos! Conecta los términos de la izquierda con su función correcta de embalaje a la derecha.<br><b>Pulsa uno de la izquierda y luego el de la derecha que corresponda para unirlos.</b>",
        hint: "Palé Europeo siempre se considera un Envase Terciario para transporte grande. Wraparound agrupa en cartón.",
        type: "parcheo",
        izq: [ {id:"i1", txt:"Palé Europeo"}, {id:"i2", txt:"Pick by Voice"}, {id:"i3", txt:"Máquina Wraparound"} ],
        der: [ {id:"d1", txt:"Protector de Cartón Ondulado"}, {id:"d2", txt:"Envase Terciario"}, {id:"d3", txt:"Auricular y Comandos"} ],
        corrections: {"i1":"d2", "i2":"d3", "i3":"d1"},
        winMsg: "El Wraparound conforma cajas (Pack), el Pick by Voice libera las manos usando reconocimiento de voz y el Palé es la cúspide de la contención (Terciario).",
        nodeWin: "pzl_002_win", nodeFail: "pzl_002_fail"
    },

    // ════ 3. MÓDULO CINTA CLASIFICADORA ════
    "puzzle_003": {
        title: "Puzle 003: La Cinta Quebrisca",
        valPicarats: 45,
        desc: "La cinta está enviando mal los productos. <b>Arrastra</b> cada producto al contenedor (Envase) correspondiente para que no se arruinen en el transporte.",
        hint: "La botella de agua toca el líquido (Primario). El pack de botellas las agrupa (Secundario). El palé las transporta (Terciario).",
        type: "cinta_clasificador",
        items: [
            {id:"it1", txt:"Lata de Atún"}, 
            {id:"it2", txt:"Palé con cajas de agua"}, 
            {id:"it3", txt:"Pack x6 CocaCola"}
        ],
        bins: [
            {id:"b1", name:"Envase Primario"}, 
            {id:"b2", name:"Envase Secundario"}, 
            {id:"b3", name:"Envase Terciario"}
        ],
        corrections: {"it1":"b1", "it3":"b2", "it2":"b3"},
        winMsg: "Correcto. Entender las capas de envase garantiza que apliquemos la etiqueta en el lugar correcto e idóneo.",
        nodeWin: "pzl_003_win", nodeFail: "pzl_003_fail"
    },

    // ════ 4. MÓDULO DIALES DE COMBINACIÓN ════
    "puzzle_004": {
        title: "Puzle 004: La Etiquetadora Atascada",
        valPicarats: 50,
        desc: "Para reiniciar la máquina, pulsa sobre cada dial hasta configurar los <b>Símbolos de Etiquetado</b> correctos para una valija de cristal: Frágil, Lado Arriba y Proteger Humedad.",
        hint: "Frágil es una copa. Proteger humedad es un paraguas. Y lado arriba son dos flechas.",
        type: "diales",
        dials: [
            {id:"d1", label:"Frágil", options:["☂️", "🍷", "♻️", "☢️"], correctIndex: 1},
            {id:"d2", label:"Lado Arriba", options:["♻️", "🍷", "⬆️", "☂️"], correctIndex: 2},
            {id:"d3", label:"Seco", options:["⬆️", "♻️", "☢️", "☂️"], correctIndex: 3}
        ],
        winMsg: "Al alinear los diales de 🍷, ⬆️ y ☂️, la máquina reconoce el protocolo de embalaje de cristal.",
        nodeWin: "pzl_004_win", nodeFail: "pzl_004_fail"
    },

    // ════ 5. MÓDULO BALANZA DE EQUILIBRIO ════
    "puzzle_005": {
        title: "Puzle 005: El Peso de la Decisión",
        valPicarats: 60,
        desc: "Suma los equipos en los lados de la balanza. En la <b>izquierda</b> coloca las de trabajo manual (baja inversión). En la <b>derecha</b> el equipo motorizado de altura (alta inversión).",
        hint: "Manual: Transpaletas manuales. Motorizado: Transelevadores y Retráctiles.",
        type: "balanza",
        weights: [
            {id:"w1", name:"Transp.\nManual", val: 1},
            {id:"w2", name:"Apilador\nManual", val: 1},
            {id:"w3", name:"Retráctil\nMotor", val: 5},
            {id:"w4", name:"Transel.", val: 6}
        ],
        targetLeft: 2,   // w1 + w2 = 2
        targetRight: 11, // w3 + w4 = 11
        winMsg: "La balanza detecta equipos de manutención manual (Transpaleta, Apilador) vs motorizado avanzado (Retráctil, Transelevador). ¡Perfecto!",
        nodeWin: "pzl_005_win", nodeFail: "pzl_005_fail"
    }
};

window.DialogData = DialogData;
window.PuzzlesData = PuzzlesData;
