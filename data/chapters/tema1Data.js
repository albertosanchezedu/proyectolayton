window.GameScenario_Tema1 = {
    "metadata": {
        "title": "Tema 1: Técnicas de Almacén - Introducción POV",
        "totalPuzzles": 2
    },
    "scene": {
        "background": "assets/bg_warm_warehouse.jpg",
        "elements": [
            {
                "id": "jefe_almacen",
                "type": "character",
                "name": "A. Logistics",
                "emoji": "🤖",
                "x": "40%",
                "y": "55%",
                "dialogId": "hablar_jefe"
            },
            {
                "id": "caja_sospechosa",
                "type": "puzzle",
                "name": "Puzle: Lote Fantasma",
                "emoji": "📦",
                "x": "60%",
                "y": "70%",
                "puzzleId": "pzl_001"
            },
            {
                "id": "palet_caido",
                "type": "puzzle",
                "name": "Puzle: El cross-docking fallido",
                "emoji": "🚜",
                "x": "85%",
                "y": "50%",
                "puzzleId": "pzl_002"
            },
            {
                "id": "moneda_oculta",
                "type": "coin",
                "name": "Luz LED fundida",
                "emoji": "🪙",
                "x": "15%",
                "y": "25%"
            }
        ]
    },
    "puzzles": {
        "pzl_001": {
            "title": "Puzle 001: El Lote Fantasma",
            "maxPuntos": 30,
            "type": "select_element",
            "description": "El Jefe A. Linguistics (NPC total) estaba usando puro sistema LIFO en lugar de FIFO para productos perecederos. Literalmente un error de noobs. <br><br>Tenemos 3 cajas de aguacates. <br>Entradas: Lote X (Hace 3 días), Lote Y (Hace 2 días), Lote Z (Ayer). <br><br>Si usas <b>FIFO</b> correctamente para que no se pudran, <b>¿qué lote mandas primero al área de picking?</b>",
            "options": [
                { "id": "X", "icon": "🥑", "label": "Lote X" },
                { "id": "Y", "icon": "🥑", "label": "Lote Y" },
                { "id": "Z", "icon": "🥑", "label": "Lote Z" }
            ],
            "correctAnswer": "X",
            "explanation": "El sistema FIFO ('First in, First out') de manual obliga a dar salida a lo más viejo (Lote X) que llegó hace 3 días. POV: salvaste la comida."
        },
        "pzl_002": {
            "title": "Puzle 002: El Cross-docking Fallido",
            "maxPuntos": 40,
            "type": "select_element",
            "description": "Un influencer pidió un aro de luz. Resulta que entró como cross-docking puro. Bro, esa mercancía ni siquiera debería ir a estantería, debería ir... <br><br><b>¿A qué zona para salir volando en la furgoneta de reparto?</b>",
            "options": [
                { "id": "A", "icon": "🏢", "label": "Zona Almacenaje Profundo" },
                { "id": "B", "icon": "🚚", "label": "Muelles de Salida directos" },
                { "id": "C", "icon": "📸", "label": "Zona de Cuarentena" }
            ],
            "correctAnswer": "B",
            "explanation": "La magia del cross-docking es que no se almacena: va del muelle de entrada, se consolida, y directo a los muelles de expedición / salida. ¡Ahorras pasta y tiempo!"
        }
    },
    "dialogs": {
        "intro": {
            "start": { "char": "layton", "text": "Un almacén bellamente oxidado y clásico...", "next": "node2" },
            "node2": { "char": "luke", "text": "Profe, estoy flipando. Pero los operarios están corriendo de un lado a otro. Hay muchísimo salseo aquí hoy.", "next": "node3" },
            "node3": { "char": "layton", "text": "Ciertamente. Hablemos con el supervisor mecatrónico de allí para que nos ponga en contexto.", "next": null }
        },
        "hablar_jefe": {
            "start": { "char": "jefe", "text": "BEEP. BOOP. Disculpen. El software logístico sufre un fallo severo. Literal, mis KPIs se van a hundir.", "next": "opciones" },
            "opciones": {
                "char": "layton",
                "choices": [
                    { "text": "Tranquilidad, caballero. Le ayudamos.", "next": "ayuda" },
                    { "text": "¿Y esas cajas de ahí?", "next": "cajas" }
                ]
            },
            "ayuda": {
                "char": "jefe",
                "text": "BOOP. Necesito reestructurar el Cross-docking y la rotación FIFO. Haga clic en las anomalías del almacén (los emojis sospechosos) para resolverlo.",
                "next": null
            },
            "cajas": {
                "char": "jefe",
                "text": "BEEP. Son un desastre logístico. Un aprendiz ordenó el material perecedero en modalidad LIFO.",
                "next": null
            }
        }
    }
};
