const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 MOTOR OFICIAL: GAMEPLAY REAL / DESAFÍO STADIUMGUESSR');
console.log('🚀 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\RETO DIARIO";

// ==========================================
// CONFIGURACIÓN DE ESTADIOS DE ALTA RETENCIÓN
// ==========================================
const CONFIG_ESTADIOS = {
    'central': {
        slug: 'ROSARIO-CENTRAL-GIGANTE-DE-ARROYITO',
        estadioNombre: 'GIGANTE DE ARROYITO',
        clubNombre: 'ROSARIO CENTRAL',
        pais: 'Argentina',
        ciudad: 'Rosario, Santa Fe',
        videoFileName: 'Gameplay_Rosario_Central_Gigante_Arroyito.mp4',
        portadaFileName: 'Portada_Gameplay_Rosario_Central.jpg',
        videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\central.mp4",
        targetLat: -32.9098,
        targetLng: -60.6723,
        userLat: -32.9080,
        userLng: -60.6705,
        zoomMap: 15,
        distanciaTexto: '240 METROS',
        puntosTexto: '4.960 PUNTOS 🔥',
        puntosNum: 4960,
        pista1: 'Capacidad para 46.955 espectadores a orillas del Río Paraná',
        pista2: 'Inaugurado en 1926: sede de la Copa del Mundo 1978 y caldera rosarina',
        ubicacionBadge: '📍 Rosario, Santa Fe · GIGANTE DE ARROYITO',
        portadaClue: '46.955 hinchas · A orillas del Río Paraná · Rosario',
        copys: {
            club: 'Rosario Central (Gigante de Arroyito)',
            hashtags: '#rosariocentral #central #gigantedearroyito #rosario #futbolargentino #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿Reconocés el Gigante de Arroyito desde el aire? ¿En qué barrio de Rosario queda?'
        }
    },
    'estudiantes': {
        slug: 'ESTUDIANTES-LP-ESTADIO-UNO',
        estadioNombre: 'ESTADIO UNO',
        clubNombre: 'ESTUDIANTES DE LA PLATA',
        pais: 'Argentina',
        ciudad: 'La Plata, Buenos Aires',
        videoFileName: 'Gameplay_Estudiantes_LP_Estadio_UNO.mp4',
        portadaFileName: 'Portada_Gameplay_Estudiantes_UNO.jpg',
        videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\EDLPx2\\Estadio UNO Jorge Luis Hirschi.mp4",
        targetLat: -34.9126,
        targetLng: -57.9392,
        userLat: -34.9110,
        userLng: -57.9378,
        zoomMap: 15,
        distanciaTexto: '210 METROS',
        puntosTexto: '4.968 PUNTOS 🔥',
        puntosNum: 4968,
        pista1: 'Capacidad para 32.530 espectadores en la esquina de 1 y 57',
        pista2: 'Moderno estadio sustentable inaugurado en 2019 en el Paseo del Bosque',
        ubicacionBadge: '📍 La Plata, Buenos Aires · ESTADIO UNO JORGE LUIS HIRSCHI',
        portadaClue: '32.530 hinchas · Esquina de 1 y 57 · La Plata',
        copys: {
            club: 'Estudiantes de La Plata (Estadio UNO)',
            hashtags: '#edlp #estudiantesdelaplata #estadidouno #laplata #futbolargentino #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿Sos capaz de clavar el pin en 1 y 57? Poné a prueba tus conocimientos.'
        }
    },
    'newells': {
        slug: 'NEWELLS-COLOSO-MARCELO-BIELSA',
        estadioNombre: 'COLOSO MARCELO BIELSA',
        clubNombre: 'NEWELL\'S OLD BOYS',
        pais: 'Argentina',
        ciudad: 'Rosario, Santa Fe',
        videoFileName: 'Gameplay_Newells_Coloso_Marcelo_Bielsa.mp4',
        portadaFileName: 'Portada_Gameplay_Newells_Coloso.jpg',
        videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\newells.mp4",
        targetLat: -32.9556,
        targetLng: -60.6698,
        userLat: -32.9540,
        userLng: -60.6682,
        zoomMap: 15,
        distanciaTexto: '225 METROS',
        puntosTexto: '4.964 PUNTOS 🔥',
        puntosNum: 4964,
        pista1: 'Capacidad para 42.000 espectadores en el Parque de la Independencia',
        pista2: 'Inaugurado en 1911: el templo rojinegro donde jugó Diego Armando Maradona',
        ubicacionBadge: '📍 Rosario, Santa Fe · COLOSO MARCELO BIELSA',
        portadaClue: '42.000 hinchas · Parque de la Independencia · Rosario',
        copys: {
            club: 'Newell\'s Old Boys (Coloso Marcelo Bielsa)',
            hashtags: '#newells #nob #colosobielsa #rosario #futbolargentino #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿Reconocés el Coloso en medio del Parque Independencia? Jugalo en el mapa.'
        }
    },
    'lanus': {
        slug: 'LANUS-LA-FORTALEZA',
        estadioNombre: 'LA FORTALEZA',
        clubNombre: 'CLUB ATLÉTICO LANÚS',
        pais: 'Argentina',
        ciudad: 'Lanús, Buenos Aires',
        videoFileName: 'Gameplay_Lanus_La_Fortaleza.mp4',
        portadaFileName: 'Portada_Gameplay_Lanus_La_Fortaleza.jpg',
        videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\lanus.mp4",
        targetLat: -34.7176,
        targetLng: -58.3842,
        userLat: -34.7148,
        userLng: -58.3815,
        zoomMap: 15,
        distanciaTexto: '375 METROS',
        puntosTexto: '4.142 PUNTOS 🔥',
        puntosNum: 4142,
        pista1: 'Capacidad para 47.020 hinchas en el sur del Gran Buenos Aires',
        pista2: 'Inaugurado en 1929 y conocido como una de las fortalezas más difíciles del país',
        ubicacionBadge: '📍 Lanús, Buenos Aires · LA FORTALEZA',
        portadaClue: '47.020 hinchas · Sur del Gran Buenos Aires · Inaugurado en 1929',
        copys: {
            club: 'Club Atlético Lanús',
            hashtags: '#lanus #lafortaleza #granate #futbolargentino #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿En qué parte del sur bonaerense queda La Fortaleza? Ubicalo en el mapa.'
        }
    }
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL (22s)
// ==========================================
// Cero whoosh, cero barrido, cero ruido blanco.
function generarAudioProcedural(duracionSeg = 22.0, sampleRate = 44100) {
    const totalSamples = Math.floor(duracionSeg * sampleRate);
    const dataSize = totalSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    const samples = new Float32Array(totalSamples);

    function addTone(startSec, durSec, freq, volume = 0.35, decay = 3) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(durSec * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / sampleRate;
            const env = Math.exp(-decay * (i / count));
            samples[start + i] += Math.sin(2 * Math.PI * freq * t) * env * volume;
        }
    }

    function addBellDing(startSec, freq = 987.77) {
        addTone(startSec, 1.2, freq, 0.35, 4);
        addTone(startSec + 0.03, 1.0, freq * 1.5, 0.2, 5);
    }

    function addTick(startSec) {
        addTone(startSec, 0.05, 1200, 0.3, 25);
    }

    function addPinPop(startSec) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(0.12 * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / sampleRate;
            const freq = 680 - (i / count) * 450;
            const env = Math.exp(-12 * (i / count));
            samples[start + i] += Math.sin(2 * Math.PI * freq * t) * env * 0.45;
        }
    }

    // Cronograma sonoro armónico
    addBellDing(0.5, 880);      // Inicio
    addBellDing(4.0, 987.77);   // Pista 2

    // Ticks de tiempo mientras busca
    addTick(9.5);
    addTick(10.5);
    addTick(11.5);
    addTick(12.5);

    // 13.5s: Pin cae en el mapa
    addPinPop(13.5);

    // 14.5s: Fanfarria de acierto Haversine (C - E - G - C)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(14.5 + idx * 0.07, 3.0, freq, 0.35, 2.0);
    });

    // 18.5s: Acorde dorado de victoria
    [659.25, 830.61, 987.77, 1318.51].forEach((freq, idx) => {
        addTone(18.5 + idx * 0.05, 3.2, freq, 0.32, 2.2);
    });

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// ==========================================
// 2. GENERADOR DE TEXTOS_PUBLICACION.TXT
// ==========================================
function generarArchivoTextos(item, targetFolder) {
    const filePath = path.join(targetFolder, 'TEXTOS_PUBLICACION.txt');
    const content = `========================================================
ESTADIOS VIRTUALES · PACK LISTO PARA PUBLICAR
FORMATO: GAMEPLAY REAL / DESAFÍO EN VIVO
ESTADIO: ${item.estadioNombre} (${item.clubNombre} - ${item.pais})
========================================================

🏆 OPCIÓN 1: DESAFÍO DIRECTO (CONVERSIÓN A LA WEB)
--------------------------------------------------------
Jugando a StadiumGuessr en estadiosvirtuales.com 🌍⚽
Clavé el pin en el mapa a solo ${item.distanciaTexto} y sumé ${item.puntosTexto} 🔥

¿Sos capaz de superar mi puntaje en este estadio?
👉 Jugalo 100% gratis en el link del perfil: estadiosvirtuales.com

${item.copys.hashtags}


⚽ OPCIÓN 2: FOLCLORE Y DEBATE
--------------------------------------------------------
¿Sos capaz de reconocer la cancha mirando la vista aérea de Google Earth? 🚁👀
${item.copys.preguntaViral}

Dejanos tu respuesta antes de ver el mapa 👇
🎮 Más estadios y duelos 1v1 en vivo gratis en: estadiosvirtuales.com

${item.copys.hashtags}


🎮 OPCIÓN 3: MODO GEOGUESSR FÚTBOL
--------------------------------------------------------
Para los fanáticos de GeoGuessr y del fútbol argentino 🕹️📍
¿En cuántos segundos podés encontrar este estadio en el mapa satelital?

👉 Entrá a estadiosvirtuales.com (Directo en el navegador, sin descargar nada).

#stadiumguessr #geoguessr #estadiosvirtuales #futbol #gamingentiktok


⚡ OPCIÓN 4: CORTA Y VIRAL
--------------------------------------------------------
Clavé el pin a ${item.distanciaTexto} 🎯 ¿Vos cuántos puntos sacás?
Jugalo gratis en el link del perfil ⚽📲

${item.copys.hashtags}


💬 COMENTARIOS FIJADOS RECOMENDADOS:
--------------------------------------------------------
1. «¿A cuántos metros lo clavaste vos? Jugá todas las canchas gratis en estadiosvirtuales.com (link en el perfil) 🗺️⚽»
2. «Comentá con qué pista lo sacaste: ¿con la capacidad o recién cuando abrí el mapa? 👀👇»
`;

    fs.writeFileSync(filePath, content, 'utf8');
}

// ==========================================
// 3. GENERADOR DE OVERLAYS Y MAPAS LEAFLET
// ==========================================
async function generarOverlaysYMapas(item, assetsDir) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();

    // -------------------------------------------------------------
    // A. OVERLAYS SUPERIORES Y DE PISTAS (1080x1920)
    // -------------------------------------------------------------
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const htmlOverlays = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; background: transparent; overflow: hidden; position: relative; }
            
            /* TOP WEB HEADER (y=50 a y=185) */
            .web-header {
                position: absolute;
                top: 50px;
                left: 50px;
                width: 980px;
                background: linear-gradient(135deg, rgba(14, 20, 32, 0.96) 0%, rgba(9, 13, 22, 0.98) 100%);
                border: 2px solid rgba(255, 255, 255, 0.15);
                border-radius: 24px;
                padding: 16px 24px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.85);
            }
            .header-top-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .brand-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 230, 118, 0.12);
                border: 1.5px solid #00e676;
                color: #00e676;
                font-size: 17px;
                font-weight: 900;
                padding: 4px 14px;
                border-radius: 20px;
                letter-spacing: 0.5px;
            }
            .pulse-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #00e676;
                box-shadow: 0 0 12px #00e676;
            }
            .status-timer {
                background: rgba(255, 215, 0, 0.15);
                border: 1px solid #ffd700;
                color: #ffd700;
                font-size: 17px;
                font-weight: 800;
                padding: 4px 12px;
                border-radius: 14px;
            }
            .game-main-title {
                color: #ffffff;
                font-size: 32px;
                font-weight: 900;
                letter-spacing: -0.5px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .hud-status-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.06);
                border-radius: 12px;
                padding: 8px 16px;
                margin-top: 2px;
            }
            .hud-round { color: #94a3b8; font-size: 18px; font-weight: 700; }
            .hud-round b { color: #38bdf8; }
            .hud-score { color: #00e676; font-size: 22px; font-weight: 900; text-shadow: 0 0 12px rgba(0,230,118,0.5); }

            /* MARCO DEL VIDEO AÉREO (y=210 a y=1260) */
            .drone-frame {
                position: absolute;
                top: 210px;
                left: 50px;
                width: 980px;
                height: 1050px;
                border-radius: 28px;
                border: 3px solid rgba(255, 255, 255, 0.18);
                pointer-events: none;
                box-shadow: inset 0 0 40px rgba(0,0,0,0.6);
            }
            .drone-tag-top {
                position: absolute;
                top: 225px;
                right: 70px;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,0.2);
                color: #ffffff;
                font-size: 15px;
                font-weight: 800;
                padding: 6px 14px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .red-rec { width: 8px; height: 8px; border-radius: 50%; background: #ff3b30; box-shadow: 0 0 10px #ff3b30; }

            /* CAJA DE PISTAS DURANTE EL VUELO (y=1120 a y=1240) */
            .clue-overlay-chip {
                position: absolute;
                top: 1120px;
                left: 60px;
                width: 960px;
                background: linear-gradient(135deg, rgba(14, 22, 36, 0.96) 0%, rgba(8, 12, 20, 0.98) 100%);
                border: 2px solid #00e676;
                border-radius: 20px;
                padding: 16px 24px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.85);
            }
            .clue-overlay-chip.p2 {
                border-color: #ffd700;
            }
            .clue-chip-icon { font-size: 32px; }
            .clue-chip-text { color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; }
            .clue-chip-text b { color: #00e676; }
            .clue-overlay-chip.p2 .clue-chip-text b { color: #ffd700; }
        </style>
    </head>
    <body>
        <!-- 1. INTRO (0.0s a 3.5s): Pista 1 -->
        <div id="view-intro">
            <div class="web-header">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer">⏱️ 15s</div>
                </div>
                <div class="game-main-title">¿DÓNDE QUEDA ESTE ESTADIO? ⚽📍</div>
                <div class="hud-status-bar">
                    <div class="hud-round">Desafío en Vivo · <b>StadiumGuessr</b></div>
                    <div class="hud-score">0 PUNTOS</div>
                </div>
            </div>
            <div class="drone-frame"></div>
            <div class="drone-tag-top"><div class="red-rec"></div> VISTA AÉREA EN VIVO</div>
            <div class="clue-overlay-chip">
                <div class="clue-chip-icon">💡</div>
                <div class="clue-chip-text"><b>PISTA 1:</b> ${item.pista1}</div>
            </div>
        </div>

        <!-- 2. PISTA 2 (3.5s a 9.5s) -->
        <div id="view-clues" style="display:none;">
            <div class="web-header">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer" style="color:#ffd700; border-color:#ffd700; background:rgba(255,215,0,0.15);">⏱️ 09s</div>
                </div>
                <div class="game-main-title">¿DÓNDE QUEDA ESTE ESTADIO? ⚽📍</div>
                <div class="hud-status-bar">
                    <div class="hud-round">Desafío en Vivo · <b>Abriendo mapa...</b></div>
                    <div class="hud-score">0 PUNTOS</div>
                </div>
            </div>
            <div class="drone-frame"></div>
            <div class="drone-tag-top"><div class="red-rec"></div> VISTA AÉREA EN VIVO</div>
            <div class="clue-overlay-chip p2">
                <div class="clue-chip-icon">🏛️</div>
                <div class="clue-chip-text"><b>PISTA 2:</b> ${item.pista2}</div>
            </div>
        </div>

        <!-- 3. SCORE ACTUALIZADO (14.5s a 18.5s) -->
        <div id="view-score-live" style="display:none;">
            <div class="web-header" style="border-color:#00e676; box-shadow:0 16px 45px rgba(0,230,118,0.35);">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer" style="color:#00e676; border-color:#00e676; background:rgba(0,230,118,0.15);">✅ ¡ACERTADO!</div>
                </div>
                <div class="game-main-title">🎯 ¡CLAVADO A ${item.distanciaTexto}!</div>
                <div class="hud-status-bar">
                    <div class="hud-round">Puntaje obtenido:</div>
                    <div class="hud-score">+${item.puntosTexto}</div>
                </div>
            </div>
            <div class="drone-frame"></div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlOverlays, { waitUntil: 'load' });

    // Snapshot Intro (0.0s - 3.5s)
    const introPath = path.join(assetsDir, 'overlay_intro.png');
    await page.screenshot({ path: introPath, omitBackground: true });

    // Snapshot Pista 2 (3.5s - 9.5s)
    await page.evaluate(() => {
        document.getElementById('view-intro').style.display = 'none';
        document.getElementById('view-clues').style.display = 'block';
    });
    const cluesPath = path.join(assetsDir, 'overlay_clues.png');
    await page.screenshot({ path: cluesPath, omitBackground: true });

    // Snapshot Score Live Header (14.5s - 18.5s)
    await page.evaluate(() => {
        document.getElementById('view-clues').style.display = 'none';
        document.getElementById('view-score-live').style.display = 'block';
    });
    const scoreLivePath = path.join(assetsDir, 'overlay_score_live.png');
    await page.screenshot({ path: scoreLivePath, omitBackground: true });


    // -------------------------------------------------------------
    // B. MAPAS LEAFLET FLOTANTES (960x460 px exactos - Estándar Canónico)
    // -------------------------------------------------------------
    await page.setViewport({ width: 960, height: 460, deviceScaleFactor: 2 });

    // 1. MAPA FASE BUSCANDO (9.5s a 13.5s): Touch indicator apuntando
    const mapSearchHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 960px; height: 460px; background: transparent; overflow: hidden; position: relative; }
            #map-card {
                width: 960px;
                height: 460px;
                border-radius: 28px;
                overflow: hidden;
                border: 4px solid #38bdf8;
                box-shadow: 0 16px 50px rgba(56, 189, 248, 0.4), 0 0 0 2px rgba(0,0,0,0.8);
                position: relative;
            }
            #map { width: 100%; height: 100%; background: #111; }
            .top-search-badge {
                position: absolute;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(14, 20, 32, 0.95);
                border: 2px solid #38bdf8;
                color: #38bdf8;
                padding: 8px 24px;
                border-radius: 30px;
                font-size: 22px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.85);
            }
            .bottom-action-pill {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                padding: 10px 28px;
                border-radius: 22px;
                font-size: 22px;
                font-weight: 900;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.85);
                border: 2px solid #fff;
            }
            .touch-indicator {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: 3.5px solid #00e676;
                background: rgba(0, 230, 118, 0.4);
                box-shadow: 0 0 25px #00e676;
            }
        </style>
    </head>
    <body>
        <div id="map-card">
            <div class="top-search-badge">🔍 APUNTANDO EN EL MAPA... ⏱️</div>
            <div id="map"></div>
            <div class="bottom-action-pill">📍 TOCÁ PARA CLAVAR EL PIN</div>
        </div>
        <script>
            const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${item.userLat}, ${item.userLng}], ${item.zoomMap});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
            const touchIcon = L.divIcon({ className: 'touch-indicator', iconSize: [44, 44], iconAnchor: [22, 22] });
            L.marker([${item.userLat}, ${item.userLng}], { icon: touchIcon }).addTo(map);
        </script>
    </body>
    </html>
    `;
    await page.setContent(mapSearchHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1400));
    const mapSearchCard = await page.$('#map-card');
    const mapSearchPath = path.join(assetsDir, 'map_search.png');
    await mapSearchCard.screenshot({ path: mapSearchPath, omitBackground: true });

    // 2. MAPA FASE RESULTADO (13.5s a 18.5s): Pin caído, círculo verde y distancia
    const mapResultHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 960px; height: 460px; background: transparent; overflow: hidden; position: relative; }
            #map-card {
                width: 960px;
                height: 460px;
                border-radius: 28px;
                overflow: hidden;
                border: 4px solid #00e676;
                box-shadow: 0 16px 50px rgba(0, 230, 118, 0.4), 0 0 0 2px rgba(0,0,0,0.8);
                position: relative;
            }
            #map { width: 100%; height: 100%; background: #111; }
            .score-badge {
                position: absolute;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.95);
                border: 2px solid #00e676;
                color: #00e676;
                padding: 10px 26px;
                border-radius: 30px;
                font-size: 24px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.8);
            }
            .score-badge span { color: #fff; }
            .bottom-badge {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.95);
                border: 1px solid rgba(255,255,255,0.25);
                color: #ffd700;
                padding: 8px 24px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: 700;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.7);
                white-space: nowrap;
            }
            .user-pin {
                width: 32px;
                height: 32px;
                background: #ff3b30;
                border: 4px solid #fff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(0,0,0,0.7);
            }
        </style>
    </head>
    <body>
        <div id="map-card">
            <div class="score-badge">🎯 ¡A ${item.distanciaTexto}! · <span>${item.puntosTexto}</span></div>
            <div id="map"></div>
            <div class="bottom-badge">${item.ubicacionBadge}</div>
        </div>
        <script>
            const userPos = [${item.userLat}, ${item.userLng}];
            const targetPos = [${item.targetLat}, ${item.targetLng}];
            const centerLat = (userPos[0] + targetPos[0]) / 2;
            const centerLng = (userPos[1] + targetPos[1]) / 2;

            const map = L.map('map', { attributionControl: false, zoomControl: false }).setView([centerLat, centerLng], ${item.zoomMap});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            L.polyline([userPos, targetPos], { color: '#ff3b30', weight: 4, dashArray: '8, 8', opacity: 0.95 }).addTo(map);

            L.circleMarker(targetPos, { radius: 14, color: '#00e676', fillColor: '#090e17', fillOpacity: 1, weight: 4 }).addTo(map);
            L.circleMarker(targetPos, { radius: 35, color: '#00e676', fillColor: '#00e676', fillOpacity: 0.25, weight: 2 }).addTo(map);

            const pinIcon = L.divIcon({ className: 'custom-pin-wrap', html: '<div class="user-pin"></div>', iconSize: [32, 32], iconAnchor: [16, 32] });
            L.marker(userPos, { icon: pinIcon }).addTo(map);
        </script>
    </body>
    </html>
    `;
    await page.setContent(mapResultHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1400));
    const mapResultCard = await page.$('#map-card');
    const mapResultPath = path.join(assetsDir, 'map_result.png');
    await mapResultCard.screenshot({ path: mapResultPath, omitBackground: true });


    // -------------------------------------------------------------
    // C. TARJETA FINAL DE VICTORIA Y CTA (960x460 px - Reemplaza al mapa)
    // -------------------------------------------------------------
    const finalCardHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 960px; height: 460px; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }
            #reward-card {
                width: 960px;
                height: 460px;
                background: linear-gradient(135deg, rgba(14, 24, 40, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                border: 3.5px solid #ffd700;
                border-radius: 28px;
                padding: 24px 32px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 16px 50px rgba(255, 215, 0, 0.35), 0 0 0 2px rgba(0,0,0,0.85);
                text-align: center;
            }
            .reward-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                border-bottom: 1.5px solid rgba(255, 255, 255, 0.14);
                padding-bottom: 10px;
            }
            .reward-badge {
                background: rgba(0, 230, 118, 0.15);
                border: 1.5px solid #00e676;
                color: #00e676;
                font-size: 18px;
                font-weight: 900;
                padding: 6px 18px;
                border-radius: 20px;
                letter-spacing: 1px;
            }
            .reward-rank {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                font-size: 18px;
                font-weight: 900;
                padding: 6px 18px;
                border-radius: 20px;
            }
            .reward-main {
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: center;
            }
            .reward-score {
                color: #ffd700;
                font-size: 54px;
                font-weight: 900;
                letter-spacing: -1px;
                text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            }
            .reward-dist {
                color: #ffffff;
                font-size: 24px;
                font-weight: 800;
            }
            .reward-dist span { color: #00e676; }
            .reward-cta {
                width: 100%;
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                color: #041409;
                border: 2px solid #ffffff;
                font-size: 24px;
                font-weight: 900;
                padding: 14px 20px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 230, 118, 0.5);
                line-height: 1.2;
            }
        </style>
    </head>
    <body>
        <div id="reward-card">
            <div class="reward-header">
                <div class="reward-badge">🎯 PARTIDA FINALIZADA</div>
                <div class="reward-rank">👑 GALÁCTICO SUPREMO</div>
            </div>
            <div class="reward-main">
                <div class="reward-score">+${item.puntosTexto}</div>
                <div class="reward-dist">Ubicado a <span>${item.distanciaTexto}</span> de distancia</div>
            </div>
            <div class="reward-cta">
                👉 ¿SOS CAPAZ DE SUPERARME? 👀<br>
                <span style="font-size:18px; font-weight:800;">JUGALO GRATIS EN WWW.ESTADIOSVIRTUALES.COM</span>
            </div>
        </div>
    </body>
    </html>
    `;
    await page.setContent(finalCardHtml, { waitUntil: 'load' });
    const rewardCardEl = await page.$('#reward-card');
    const finalCardPath = path.join(assetsDir, 'card_final.png');
    await rewardCardEl.screenshot({ path: finalCardPath, omitBackground: true });

    await browser.close();
    console.log('✅ Overlays, Mapas Leaflet (960x460) y Tarjeta Final generados.');
}

// ==========================================
// 4. GENERADOR DE PORTADA MISTERIO (3:4 SAFE ZONE)
// ==========================================
async function generarPortada(item, outFolder, bgFramePath) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const bgBase64 = fs.readFileSync(bgFramePath).toString('base64');

    const htmlPortada = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; background: #000; overflow: hidden; position: relative; }
            .bg-drone {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: url('data:image/jpeg;base64,${bgBase64}') center center no-repeat;
                background-size: cover;
                filter: brightness(0.65) contrast(1.1);
            }
            .vignette {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle at center, rgba(10,16,28,0.2) 0%, rgba(5,8,15,0.92) 100%);
            }
            .safe-zone-box {
                position: absolute;
                top: 240px;
                left: 50px;
                width: 980px;
                height: 1440px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 28px;
                text-align: center;
            }
            .badge-live {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: rgba(0, 230, 118, 0.15);
                border: 2px solid #00e676;
                color: #00e676;
                font-size: 24px;
                font-weight: 900;
                padding: 10px 30px;
                border-radius: 40px;
                letter-spacing: 2px;
                box-shadow: 0 0 25px rgba(0,230,118,0.3);
            }
            .main-title {
                color: #ffffff;
                font-size: 64px;
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -1.5px;
                text-shadow: 0 10px 30px rgba(0,0,0,0.9);
            }
            .main-title span { color: #ffd700; }
            .clue-mystery-card {
                background: linear-gradient(135deg, rgba(14, 22, 38, 0.95) 0%, rgba(9, 14, 24, 0.98) 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 28px;
                padding: 24px 36px;
                max-width: 860px;
                box-shadow: 0 18px 50px rgba(0,0,0,0.85);
            }
            .clue-mystery-card p {
                color: #ffffff;
                font-size: 32px;
                font-weight: 800;
                line-height: 1.3;
            }
            .challenge-pill {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                font-size: 30px;
                font-weight: 900;
                padding: 18px 42px;
                border-radius: 40px;
                box-shadow: 0 12px 35px rgba(255, 190, 0, 0.5);
                border: 3px solid #fff;
            }
            .url-tag {
                color: #38bdf8;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: 1px;
            }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>
        <div class="safe-zone-box">
            <div class="badge-live">ESTADIO...</div>
            <div class="main-title">¿QUÉ ESTADIO ES<br>Y <span>DÓNDE QUEDA?</span> ⚽</div>
            <div class="clue-mystery-card">
                <p>💡 ${item.portadaClue}</p>
            </div>
            <div class="challenge-pill">¿SOS CAPAZ DE ADIVINARLO? 🗺️</div>
            <div class="url-tag">JUGALO GRATIS EN: WWW.ESTADIOSVIRTUALES.COM</div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlPortada, { waitUntil: 'load' });
    const portadaPath = path.join(outFolder, item.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// ==========================================
// 5. RENDERIZAR VIDEO FINAL CON FFMPEG
// ==========================================
async function renderizarReto(retoKey) {
    const item = CONFIG_ESTADIOS[retoKey];
    if (!item) {
        console.error(`❌ Estadio no encontrado: ${retoKey}`);
        return;
    }

    console.log(`\n========================================================`);
    console.log(`🎬 RENDERIZANDO GAMEPLAY EN VIVO: ${item.estadioNombre}`);
    console.log(`📁 Slug: ${item.slug}`);
    console.log(`========================================================\n`);

    const outFolder = path.join(BASE_OUTPUT_DIR, item.slug);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const assetsDir = path.join(__dirname, `assets_${retoKey}`);
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. Guardar textos de publicación
    generarArchivoTextos(item, outFolder);
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt generado.');

    // 2. Extraer frame de fondo para portada
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:04',
            '-i', item.videoPath,
            '-vframes', '1',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    // 3. Generar Portada 3:4 Safe Zone
    await generarPortada(item, outFolder, bgFramePath);

    // 4. Generar Overlays y Mapas Leaflet
    await generarOverlaysYMapas(item, assetsDir);

    // 5. Generar Audio Procedural de 22.0s
    const audioPath = path.join(assetsDir, 'audio_gameplay.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(22.0));
    console.log('✅ Audio procedural (22s) sintetizado.');

    // 6. Ensamble final de video Full HD 1080x1920
    const videoOutPath = path.join(outFolder, item.videoFileName);

    // Timeline exacto:
    // 0.0s a 3.5s: Intro + Pista 1 (overlay_intro.png)
    // 3.5s a 9.5s: Clues + Pista 2 (overlay_clues.png)
    // 9.5s a 13.5s: Mapa buscando (map_search.png en x=60, y=1320, 960x460)
    // 13.5s a 18.5s: Score Live Header (overlay_score_live.png) + Mapa resultado (map_result.png en x=60, y=1320, 960x460)
    // 18.5s a 22.0s: Tarjeta final de victoria y CTA (card_final.png en x=60, y=1320, 960x460)

    const filterComplex = [
        // Fondo difuminado cinemático
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.28[bg]`,
        // Video de dron nítido centrado en la ventana superior (980x1050 a y=210, x=50)
        `[0:v]scale=980:1050:force_original_aspect_ratio=increase,crop=980:1050[drone]`,
        `[bg][drone]overlay=50:210[base]`,
        // Escalar mapas y tarjetas exactamente a 960x460 (Estándar Canónico)
        `[4:v]scale=960:460[map_search_sc]`,
        `[6:v]scale=960:460[map_result_sc]`,
        `[7:v]scale=960:460[card_final_sc]`,
        // Overlays temporales
        `[base][2:v]overlay=0:0:enable='between(t,0,3.5)'[v1]`,
        `[v1][3:v]overlay=0:0:enable='between(t,3.5,9.5)'[v2]`,
        `[v2][map_search_sc]overlay=60:1320:enable='between(t,9.5,13.5)'[v3]`,
        `[v3][5:v]overlay=0:0:enable='between(t,13.5,18.5)'[v4]`,
        `[v4][map_result_sc]overlay=60:1320:enable='between(t,13.5,18.5)'[v5]`,
        `[v5][card_final_sc]overlay=60:1320:enable='between(t,18.5,22.0)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '22',
        '-i', item.videoPath,                                     // 0:v
        '-i', audioPath,                                          // 1:a
        '-i', path.join(assetsDir, 'overlay_intro.png'),          // 2:v
        '-i', path.join(assetsDir, 'overlay_clues.png'),          // 3:v
        '-i', path.join(assetsDir, 'map_search.png'),             // 4:v
        '-i', path.join(assetsDir, 'overlay_score_live.png'),     // 5:v
        '-i', path.join(assetsDir, 'map_result.png'),             // 6:v
        '-i', path.join(assetsDir, 'card_final.png'),             // 7:v
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-movflags', '+faststart',
        videoOutPath
    ];

    console.log(`🎬 Procesando video con FFmpeg hacia: ${videoOutPath}...`);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
            const timeMatch = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:22.00\r`);
            }
        });
        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
                resolve();
            } else {
                reject(new Error(`FFmpeg falló con código: ${code}`));
            }
        });
    });

    // Limpieza de carpeta temporal
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
    } catch (_) {}
}

// ==========================================
// EJECUCIÓN PRINCIPAL
// ==========================================
async function main() {
    const target = process.argv[2] || 'central';

    if (target === 'all') {
        const keys = Object.keys(CONFIG_ESTADIOS);
        console.log(`🚀 INICIANDO PRODUCCIÓN DE GAMEPLAY REAL (${keys.length} videos)...\n`);
        for (let i = 0; i < keys.length; i++) {
            await renderizarReto(keys[i]);
        }
        console.log(`\n🎉 ¡TODOS LOS VIDEOS DE GAMEPLAY GENERADOS CON ÉXITO!`);
    } else {
        await renderizarReto(target);
    }
}

main().catch(console.error);
