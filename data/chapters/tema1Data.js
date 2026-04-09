// DUMP COMPLETO DEL TEMA 1: LOGÍSTICA DE ALMACÉN
window.GameScenario_Tema1 = {
    "metadata": {
        "title": "Tema 1: Técnicas de Almacén",
        "totalPuzzles": 4
    },
    "puzzles": {
        "pzl_001": {
            "title": "Puzle 001: El Viajero Cansado",
            "maxPuntos": 40,
            "type": "select_element",
            "description": "Se ha desconfigurado el algoritmo del Picking (el proceso que exige mayor organización y precisión para reducir costes).<br><br>Tenemos un pedido con 4 referencias en el mapa central. Para minimizar la distancia de recogida sin pasar dos veces por el mismo sitio (el clásico <i>Problema del Viajante</i>), ¿qué ruta es la óptima matemáticamente?",
            "options": [
                { "id": "A", "icon": "〰️", "label": "Zig-zag cruzando pasillos." },
                { "id": "B", "icon": "🔄", "label": "Perimetral circular." },
                { "id": "C", "icon": "⭐", "label": "Aleatoria por orden de peso." }
            ],
            "correctAnswer": "B",
            "explanation": "El picking es el proceso más costoso. La ruta perimetral circular, o en U invertida, matemáticamente visita cada vértice sin retrocesos. Has evitado un retraso doloroso a la empresa.",
            "winNode": "despues_pzl1_win",
            "failNode": "despues_pzl1_fail"
        },
        "pzl_002": {
            "title": "Puzle 002: Identidad Robótica",
            "maxPuntos": 50,
            "timeLimit": 15, // QTE Bonus
            "type": "select_element",
            "description": "¡Atención! Un error de clúster! Necesitas configurar rápidamente los comunicadores de los operarios modernos.<br><br>Un picker lleva auriculares y recibe alertas verbales sobre sus extracciones sin mirar pantallas. ¿Qué tecnología de picking está utilizando?",
            "options": [
                { "id": "R", "icon": "💡", "label": "Pick to Light" },
                { "id": "S", "icon": "🎧", "label": "Pick by Voice" },
                { "id": "D", "icon": "📶", "label": "Radiofrecuencia Visual" }
            ],
            "correctAnswer": "S",
            "explanation": "¡Correcto! El Pick by Voice aumenta la productividad al permitir que el operario tenga los ojos y las manos totalmente libres para manipular las cajas.",
            "winNode": "despues_pzl2_win",
            "failNode": "despues_pzl2_fail"
        },
        "pzl_003": {
            "title": "Puzle 003: El Correo Dañado",
            "maxPuntos": 40,
            "type": "fill_blanks",
            "description": "Se ha interceptado un informe de almacén al proveedor. Varios términos técnicos se han vuelto ilegibles. Para mantener la confidencialidad, no podemos equivocarnos en las especificaciones.<br><br>Rellena los huecos del informe utilizando tus conocimientos sobre la protección de mercancías y tipos de picking.",
            "textTemplate": "Estimado director, hemos implementado el picking mediante {0}, lo que nos permite enviar señales visuales para guiar al operario. A su vez, para el empaquetado de botellines de agua hemos empleado nuestra formadora {1} para el envase {2}. Quedamos a la espera.",
            "options": ["Pick to Light", "Pick by Voice", "Wraparound", "Flejadora", "Terciario", "Secundario"],
            "correctAnswer": "Pick to Light,Wraparound,Secundario",
            "explanation": "¡Brillante logístico! El sistema Pick to Light es puramente visual mediante luces. Las máquinas Wraparound envuelven con cartón el conjunto, creando el envase secundario (como el famoso pack de latas/botellas).",
            "winNode": "despues_pzl3_win",
            "failNode": "despues_pzl3_fail"
        },
        "pzl_004": {
            "title": "Puzle 004: Jerarquía de Envolturas",
            "maxPuntos": 40,
            "type": "select_element",
            "description": "Revisa este albarán dañado. Un 'cartón con 12 botellines de agua'. Ese empaque específico de 12 botellines y su cartón es...",
            "options": [
                { "id": "1", "icon": "🧴", "label": "Envase Primario" },
                { "id": "2", "icon": "📦", "label": "Envase Secundario" },
                { "id": "3", "icon": "🚚", "label": "Envase Terciario (El Palé)" }
            ],
            "correctAnswer": "2",
            "explanation": "¡Impecable! El envase secundario es aquel que agrupa los primarios (los botellines) y se presenta para su venta al cliente o supermercado.",
            "winNode": "final_capitulo",
            "failNode": "despues_pzl4_fail"
        }
    },
    // NARRATIVA LINEAL GUIADA (VISUAL NOVEL)
    "dialogs": {
        "start": {
            "bg": "bg-void", 
            "char": "layton",
            "text": "La preparación de pedidos es como un delicado enigma de relojería, Luke. Cada pieza debe encajar a la perfección, o todo el sistema colapsará.",
            "next": "n2"
        },
        "n2": {
            "char": "luke",
            "text": "Cierto, Profesor. Pero el ERP no está enviando las órdenes al Sistema de Gestión (SGA)...",
            "next": "n3"
        },
        "n3": {
            "bg": "bg-warehouse-abstract", 
            "char": "layton",
            "text": "Exactamente. Un fallo en los algoritmos WMS lo ha detenido todo. Deberemos aplicar teoría logística y nuestro ingenio puro.",
            "next": "n4"
        },
        "n4": {
            "char": "jefe",
            "text": "[ALERTA] Rutas de Picking descontroladas. Costes de preparación en aumento exponencial.",
            "next": "n5"
        },
        "n5": {
            "char": "layton",
            "text": "Ahí tenemos nuestra primera tarea. Veamos cómo podemos restaurar la ruta óptima de este operario.",
            "action": "load_puzzle", 
            "puzzleId": "pzl_001"
        },
        
        // RAMAS DEL PUZLE 1
        "despues_pzl1_win": {
            "char": "jefe",
            "text": "[RUTA RESTAURADA]. Aplicando Problema del Viajante. Distancias minimizadas.",
            "next": "p2_intro"
        },
        "despues_pzl1_fail": {
            "char": "layton",
            "text": "Mmm... Esa ruta nos haría pasar dos veces por el mismo cruce, Luke. Ese es precisamente el error más costoso del picking según la teoría. Debemos intentarlo de nuevo.",
            "action": "load_puzzle",
            "puzzleId": "pzl_001"
        },

        // INTRO PUZLE 2
        "p2_intro": {
            "char": "luke",
            "text": "Profesor, mire esa pantalla de advertencia roja. ¡El sistema de guiado de los operarios se ha corrompido!",
            "next": "p2_intro2"
        },
        "p2_intro2": {
            "bg": "bg-alert-abstract",
            "char": "layton",
            "text": "Un experto debe reaccionar bajo presión logística, Luke. Veamos si recuerdas los modelos de Picking actuales.",
            "action": "load_puzzle",
            "puzzleId": "pzl_002"
        },
        
        // RAMAS PUZLE 2
        "despues_pzl2_win": {
            "bg": "bg-warehouse-abstract",
            "char": "luke",
            "text": "¡Pick by Voice! Estuvo cerca... La comunicación por micrófono ha restaurado el trabajo manos-libres a tiempo.",
            "next": "p3_intro"
        },
        "despues_pzl2_fail": {
            "bg": "bg-alert-abstract",
            "char": "layton",
            "text": "Eso confundirá a los preparadores y aumentarán los parones. Vuelve al terminal de control.",
            "action": "load_puzzle",
            "puzzleId": "pzl_002"
        },

        // INTRO PUZLE 3
        "p3_intro": {
            "char": "jefe",
            "text": "[ERROR MAQUINARIA]. Equipos de Acondicionamiento detenidos por configuración manual errónea.",
            "next": "p3_i2"
        },
        "p3_i2": {
            "char": "layton",
            "text": "Acondicionar los productos y asegurar el guiado inteligente es vital. Recuperemos ese correo extraviado reconstruyendo los fragmentos, Luke.",
            "action": "load_puzzle",
            "puzzleId": "pzl_003"
        },

        // RAMAS PUZLE 3
        "despues_pzl3_win": {
            "char": "luke",
            "text": "¡Pick to light y Wraparound! Todo encaja. Los envases secundarios fluirán nuevamente.",
            "next": "p4_intro"
        },
        "despues_pzl3_fail": {
            "char": "jefe",
            "text": "[FALLO ESTRUCTURAL]. Conceptos logísticos incoherentes o vacíos. Procedimiento abortado.",
            "action": "load_puzzle",
            "puzzleId": "pzl_003"
        },

        // INTRO PUZLE 4
        "p4_intro": {
            "bg": "bg-blue-abstract",
            "char": "layton",
            "text": "Nuestras cadenas vuelven a engranar. Ya solo nos falta revisar el Etiquetado y la Jerarquía de Envases.",
            "next": "p4_i2"
        },
        "p4_i2": {
            "char": "luke",
            "text": "Profesor, el muelle final tiene envíos de agua embotellada. Sus identificadores se han mezclado.",
            "next": "p4_i3"
        },
        "p4_i3": {
            "char": "layton",
            "text": "Es nuestra última prueba. Categorizar correctamente entre envase primario, secundario y terciario evitará el caos total.",
            "action": "load_puzzle",
            "puzzleId": "pzl_004"
        },

        // RAMAS PUZLE 4
        "despues_pzl4_fail": {
            "char": "layton",
            "text": "Piénsalo mejor, Luke. El envase en contacto directo es el primario, pero este paquete agrupa varios de ellos...",
            "action": "load_puzzle",
            "puzzleId": "pzl_004"
        },
        
        "final_capitulo": {
            "bg": "bg-gold-abstract",
            "char": "jefe",
            "text": "[SISTEMA WMS EN LÍNEA]. Operativa nominal restaurada al 100%. Mermas evitadas.",
            "next": "fin2"
        },
        "fin2": {
            "char": "luke",
            "text": "¡Lo logramos, Profesor! La protección, empaquetado y picking corren sobre ruedas.",
            "next": "fin3"
        },
        "fin3": {
            "char": "layton",
            "text": "Como siempre, todo enigma logístico tiene solución si aplicamos un riguroso razonamiento deductivo. Excelente trabajo en este almacén.",
            "next": null
        }
    }
};
