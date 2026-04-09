// DUMP COMPLETO DEL NUEVO TEMA BASADO EN SECUENCIA NARRATIVA
window.GameScenario_Tema1 = {
    "metadata": {
        "title": "Tema 1: Técnicas de Almacén",
        "totalPuzzles": 4
    },
    "puzzles": {
        "pzl_001": {
            "title": "Puzle 001: El Pedido Traspapelado",
            "maxPuntos": 30,
            "type": "select_element",
            "description": "Un lote crítico de ordenadores debe salir hoy. Nuestro sistema ha perdido la ubicación exacta, pero sabemos lo siguiente: <br><br>1. No están en el sector norte.<br>2. Se ubicaron cerca de mercancías de alta rotación (Categoría A).<br>3. Necesitan estar lejos de la humedad.<br><br>Observando nuestra configuración lógica, ¿en qué sector los ha dejado el operario?",
            "options": [
                { "id": "A", "icon": "📦", "label": "Sector A (Norte, Cerca de la puerta)" },
                { "id": "B", "icon": "✨", "label": "Sector B (Centro, Control de clima, Alta rotación)" },
                { "id": "C", "icon": "💧", "label": "Sector C (Sur, Alta rotación, Cámaras frías)" }
            ],
            "correctAnswer": "B",
            "explanation": "Sector B es el único que cumple las tres reglas: es céntrico (no norte), es de alta rotación y no tiene problemas de humedad de cámaras frigoríficas. ¡Excelente deducción!",
            "winNode": "despues_pzl1_win",
            "failNode": "despues_pzl1_fail"
        },
        "pzl_002": {
            "title": "Puzle 002: Reacción Rápida",
            "maxPuntos": 50,
            "timeLimit": 15,
            "type": "select_element",
            "description": "¡Atención! Ha saltado una alarma de rotura de stock en la línea de 'Picking'. ¡Tienes apenas 15 segundos para dar la orden de reabastecimiento!<br><br>¿De dónde extraemos la mercancía para abastecer la línea de preparación?",
            "options": [
                { "id": "R", "icon": "🏢", "label": "De la zona de Reserva / Almacenaje" },
                { "id": "S", "icon": "🚛", "label": "De los camiones de salida" },
                { "id": "D", "icon": "🛑", "label": "Del área de devoluciones" }
            ],
            "correctAnswer": "R",
            "explanation": "Correcto. La zona de reserva abastece a la zona de picking (preparación) cuando los estantes directos se vacían. ¡Has evitado una catástrofe logística en tiempo récord!",
            "winNode": "despues_pzl2_win",
            "failNode": "despues_pzl2_fail"
        },
        "pzl_003": {
            "title": "Puzle 003: La Carga Perecedera",
            "maxPuntos": 30,
            "type": "select_element",
            "description": "Llega un camión refrigerado lleno de vacunas, que requiere un flujo tenso.<br>¿Qué estrategia de gestión de entrada y salida deberíamos aplicar por normativa sanitaria universal para este lote?",
            "options": [
                { "id": "LIFO", "icon": "🕒", "label": "LIFO (Lo último en entrar, primero en salir)" },
                { "id": "FIFO", "icon": "🔄", "label": "FIFO (Lo primero en entrar, primero en salir)" },
                { "id": "FEFO", "icon": "⚠️", "label": "FEFO (Lo primero en caducar, primero en salir)" }
            ],
            "correctAnswer": "FEFO",
            "explanation": "¡Cierto! En productos farmacéuticos o muy perecederos, la fecha de caducidad es la prioridad absoluta por encima de la fecha de entrada. Has salvado muchas vidas.",
            "winNode": "despues_pzl3_win",
            "failNode": "despues_pzl3_fail"
        },
        "pzl_004": {
            "title": "Puzle 004: Eficiencia de Transbordos",
            "maxPuntos": 60,
            "type": "select_element",
            "description": "El director del centro logístico te pide reducir costes de almacenamiento temporal. Han recibido 5 palés mixtos de productos de campaña que ya están vendidos a diferentes clientes minoristas.<br><br>¿Cuál es la maniobra óptima?",
            "options": [
                { "id": "1", "icon": "📊", "label": "Clasificarlos y subirlos a las estanterías de mayor nivel." },
                { "id": "2", "icon": "🏗️", "label": "Dejarlos en el muelle de entrada bloqueando la puerta." },
                { "id": "3", "icon": "⚡", "label": "Cross-docking directo al muelle de salida." }
            ],
            "correctAnswer": "3",
            "explanation": "¡Impecable! Efectuar un Cross-docking elimina los gastos de almacenaje y manipulación intermedia para mercancía que ya tiene un destinatario final asignado.",
            "winNode": "final_capitulo",
            "failNode": "despues_pzl4_fail"
        }
    },
    // NARRATIVA LINEAL GUIADA (VISUAL NOVEL)
    "dialogs": {
        "start": {
            "bg": "bg-void", // Empieza completamente oscuro
            "char": "layton",
            "text": "La logística es como un mecanismo de relojería, Luke. Cada pieza debe encajar a la perfección, o todo el sistema colapsará.",
            "next": "n2"
        },
        "n2": {
            "char": "luke",
            "text": "Cierto, Profesor Alberto. Pero este almacén está completamente a oscuras... ¿No deberían estar trabajando a este ritmo frenético?",
            "next": "n3"
        },
        "n3": {
            "bg": "bg-warehouse-abstract", // Transición a fondo visual abstracto con polígonos
            "char": "layton",
            "text": "Exactamente. Un apagón en sus servidores centrales lo ha detenido todo. Deberemos iluminar el camino con nuestro ingenio.",
            "next": "n4"
        },
        "n4": {
            "char": "jefe",
            "text": "[ERROR FATAL DEL SISTEMA WMS] Archivos corruptos detectados en el módulo de reservas. Intervención manual requerida.",
            "next": "n5"
        },
        "n5": {
            "char": "layton",
            "text": "Ahí tenemos nuestra primera tarea. Veamos qué datos podemos recuperar del sistema dañado.",
            "action": "load_puzzle", // Salta al puzzle 1
            "puzzleId": "pzl_001"
        },
        
        // RAMAS DEL PUZLE 1
        "despues_pzl1_win": {
            "char": "jefe",
            "text": "[UBICACIÓN RESTAURADA] Lote localizado. Gracias por la asistencia.",
            "next": "p2_intro"
        },
        "despues_pzl1_fail": {
            "char": "layton",
            "text": "Mmm, nos hemos equivocado. Si mandamos a los operarios allí, perderemos tiempo valioso. Debemos repensar nuestras variables.",
            "action": "load_puzzle",
            "puzzleId": "pzl_001"
        },

        // INTRO PUZLE 2
        "p2_intro": {
            "char": "luke",
            "text": "¡Profesor, mire esa pantalla de advertencia roja! ¡El sistema de preparación de pedidos está perdiendo stock!",
            "next": "p2_intro2"
        },
        "p2_intro2": {
            "bg": "bg-alert-abstract", // Cambio de color a rojo/alerta
            "char": "layton",
            "text": "Un buen logístico debe actuar bajo presión, Luke. Toma los mandos, no nos queda tiempo.",
            "action": "load_puzzle",
            "puzzleId": "pzl_002"
        },
        
        // RAMAS PUZLE 2
        "despues_pzl2_win": {
            "bg": "bg-warehouse-abstract",
            "char": "luke",
            "text": "Estuvo cerca... La reposición ha llegado justo a tiempo antes de que parasen las cintas.",
            "next": "p3_intro"
        },
        "despues_pzl2_fail": {
            "bg": "bg-alert-abstract",
            "char": "layton",
            "text": "Eso solo empeorará las cosas. Luke, concéntrate, volvamos a darle la orden al sistema del almacén.",
            "action": "load_puzzle",
            "puzzleId": "pzl_002"
        },

        // INTRO PUZLE 3
        "p3_intro": {
            "char": "jefe",
            "text": "[NUEVO CONTENEDOR EN EL MUELLE 4]. Requiere procesamiento sanitario inmediato.",
            "next": "p3_i2"
        },
        "p3_i2": {
            "char": "layton",
            "text": "Esto es un asunto delicado. Las normativas de rotación para este tipo de productos son muy estrictas en la Unión Europea. Veamos si lo recuerdas.",
            "action": "load_puzzle",
            "puzzleId": "pzl_003"
        },

        // RAMAS PUZLE 3
        "despues_pzl3_win": {
            "char": "luke",
            "text": "¡FEFO! Es lógico. No podemos arriesgarnos con bienes perecederos.",
            "next": "p4_intro"
        },
        "despues_pzl3_fail": {
            "char": "jefe",
            "text": "[INFRACCIÓN SANITARIA DETECTADA]. Reverting action...",
            "next": "p3_i2"
        },

        // INTRO PUZLE 4
        "p4_intro": {
            "bg": "bg-blue-abstract",
            "char": "layton",
            "text": "El almacén está cobrando vida de nuevo. Pero la verdadera prueba de un experto en técnica de almacén es la optimización de los flujos físicos.",
            "next": "p4_i2"
        },
        "p4_i2": {
            "char": "luke",
            "text": "Nos llegan 5 palés nuevos del Muelle 1, y los transportistas del Muelle 8 los están esperando. ¿Subimos eso a las estanterías altas?",
            "next": "p4_i3"
        },
        "p4_i3": {
            "char": "layton",
            "text": "Medítalo un segundo antes de actuar. Las manipulaciones innecesarias son nuestro mayor enemigo.",
            "action": "load_puzzle",
            "puzzleId": "pzl_004"
        },

        // RAMAS PUZLE 4
        "despues_pzl4_fail": {
            "char": "layton",
            "text": "Eso generaría retrasos inaceptables para el cliente. Vuelve a replantear el flujo.",
            "action": "load_puzzle",
            "puzzleId": "pzl_004"
        },
        
        "final_capitulo": {
            "bg": "bg-gold-abstract",
            "char": "jefe",
            "text": "[SISTEMA WMS EN LÍNEA]. Operativa nominal restaurada al 100%.",
            "next": "fin2"
        },
        "fin2": {
            "char": "luke",
            "text": "¡Lo logramos, Profesor! Todo marcha sobre ruedas.",
            "next": "fin3"
        },
        "fin3": {
            "char": "layton",
            "text": "Como siempre, todo enigma logístico tiene solución si aplicamos un riguroso razonamiento lógico. Excelente en este capítulo.",
            "next": null
        }
    }
};
