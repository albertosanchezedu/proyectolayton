const GameData = {
    // ════ METADATA GENERAL ════
    metadata: {
        title: "El Misterio del Almacén Perdido",
        maxCoins: 5 // Para usar pistas
    },

    // ════ LA NOVELA (Múltiples finales y rutas) ════
    dialogs: {
        "start": {
            char: "🎩", name: "Profesor Alberto", 
            text: "Interesante, el Centro Logístico Pandora ha bloqueado todos sus accesos automatizados. Si no lo desciframos, la cadena de suministro global colapsará antes del amanecer.",
            options: [
                { label: "Debemos investigar la recepción", route: "n2" },
                { label: "¿Qué ha provocado esto?", route: "n1_alt" }
            ]
        },
        "n1_alt": {
            char: "🧢", name: "Luke", text: "Alguien debe haber cambiado los parámetros de las formadoras Wraparound en la planta base. ¡Hay cartón atascado por todas partes!", 
            options: [{ label: "Continuar", route: "n2" }]
        },
        "n2": {
            char: "👷", name: "I.A. del Almacén", text: "[SISTEMA CRÍTICO]. Error de mapeo de rutas. Operarios de Picking atrapados en un bucle perimetral. Requiere intervención lógica externa.",
            options: [{ label: "Revisar los terminales.", route: "puzzle_001_intro" }]
        },
        
        "puzzle_001_intro": { pzl: "pzl_001" },
        "puzzle_001_fail": {
            char: "🎩", name: "Profesor Alberto", text: "Esa ruta hace que el operario pase dos veces por el mismo cruce, Luke. ¿Recuerdas el Problema del Viajante? Trata de trazar un bucle perfecto.",
            options: [{ label: "Reintentar Panel", route: "puzzle_001_intro" }, { label: "Seguir pensando antes de tocar nada", route: "n2" }]
        },
        "puzzle_001_win": {
            char: "🧢", name: "Luke", text: "¡Claro! Una ruta perimetral circular, sin retrocesos. ¡Los robots han vuelto a moverse!",
            options: [{ label: "Siguiente Sala", route: "n3" }]
        },

        "n3": {
            char: "🎩", name: "Profesor Alberto", text: "Un auténtico caballero no celebra demasiado pronto. La IA aún informa de un desajuste gravísimo en el módulo superior: Las piezas de la línea de ensamblaje no coinciden.",
            options: [{ label: "Vamos allí.", route: "puzzle_002_intro" }]
        },
        "puzzle_002_intro": { pzl: "pzl_002" },
        "puzzle_002_fail": { char: "🧢", name: "Luke", text: "¡Ay! Ese relé echó chispas. Creo que hemos confundido un envoltorio secundario con software de voz.", options: [{ label: "Mirar esquemas de nuevo", route: "puzzle_002_intro"}] },
        "puzzle_002_win": {
            char: "👷", name: "I.A. del Almacén", text: "[NIVELES DE EFICIENCIA RESTAURADOS]. Enlazando Bases de Datos con Sistemas Visoespaciales...",
            options: [{ label: "Continuar", route: "n4" }]
        },

        "n4": {
            char: "🎩", name: "Profesor Alberto", text: "Espléndido. La logística, como cualquier puzzle elegante, sólo requiere ensamblar y clasificar hasta la última pieza. Lo hemos conseguido.",
            options: [{ label: "Juego Completado", route: null }]
        }
    },

    // ════ LOS ENIGMAS DEDICADOS ════
    puzzles: {
        "pzl_001": {
            title: "Puzle 001: El Viajero Desorientado",
            maxPuntos: 40,
            description: "Un robot de <b>Picking</b> se ha desconfigurado. Para que reduzca costes de desplazamiento sin cruzar sus propios pasos, debes trazarle una ruta cíclica perfecta en el almacén.<br><br><b>Haz click en los pasillos (Nodos 1 al 4) en el orden correcto para crear el bucle sin retrocesos.</b>",
            hint: "Piensa en el sentido de las agujas del reloj o a la inversa. Simplemente haz clic en un nodo y recorre el perímetro en lugar de cruzar en zig-zag.",
            
            // Logica Engine
            type: "ruta_nodos",
            nodes: [
                {id: 0, x: 20, y: 20, l: "Base A"},
                {id: 1, x: 80, y: 20, l: "Fila B"},
                {id: 2, x: 80, y: 80, l: "Fila C"},
                {id: 3, x: 20, y: 80, l: "Salida"} 
            ],
            correctAnswers: ["0,1,2,3", "0,3,2,1"], // Bucle circular clockwise o agudas
            winNode: "puzzle_001_win", failNode: "puzzle_001_fail"
        },
        
        "pzl_002": {
            title: "Puzle 002: Panel de Parcheo Visoespacial",
            maxPuntos: 50,
            description: "El servidor que relaciona el hardware de control con los métodos de almacenamiento físicos ha perdido sus pares de cables.<br><br><b>Haz click en un concepto de la izquierda, y en su Pareja definitoria a la derecha para empalmarlos lógicamente.</b> Solo puedes continuar si los 3 son correctos.",
            hint: "El Wraparound siempre trata sobre cajas protectoras envolventes. Pick by Voice es obvio, significa 'mediante voz'.",
            
            // Logica Engine
            type: "parcheo_relaciones",
            colA: [ {id:"a1", t:"Pick by Voice"}, {id:"a2", t:"Wraparound"}, {id:"a3", t:"Paletizado Estándar"} ],
            colB: [ {id:"b1", t:"Envase Terciario para Carga"}, {id:"b2", t:"Auriculares y Micrófono"}, {id:"b3", t:"Formadora de Cartón Lateral"} ],
            correctPairs: {"a1":"b2", "a2":"b3", "a3":"b1"},
            winNode: "puzzle_002_win", failNode: "puzzle_002_fail"
        }
    }
};
window.GameData = GameData;
