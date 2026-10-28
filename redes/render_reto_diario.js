const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 MOTOR OFICIAL: RETO DIARIO REAL (5 RONDAS / 35s)');
console.log('🚀 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\RETO DIARIO";

// ==========================================
// CONFIGURACIÓN OFICIAL DEL RETO DIARIO #01
// ==========================================
const RETO_CONFIG = {
    id: 'RETO-DIARIO-01-ARGENTINA',
    numeroReto: 1,
    tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
    subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
    videoFileName: 'Reto_Diario_01_Argentina.mp4',
    portadaFileName: 'Portada_Reto_Diario_01.jpg',
    puntuacionTotal: 24510,
    rangoFinal: '👑 GALÁCTICO ABSOLUTO',
    grillaWordle: '🟩 🟩 🟩 🟩 🟩',
    rondas: [
        {
            num: 1,
            estadioNombre: 'EL PALACIO DUCÓ',
            clubNombre: 'HURACÁN',
            ciudad: 'Parque Patricios, CABA',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\huracan.mp4",
            clipStart: 3.0,
            pista: 'Capacidad para 48.314 hinchas con su torre Art Déco',
            targetLat: -34.6433,
            targetLng: -58.3965,
            userLat: -34.6415,
            userLng: -58.3945,
            distanciaTexto: '260 METROS',
            puntosTexto: '+4.920 PTS 🔥',
            puntos: 4920,
            puntosAcumulados: 4920,
            ubicacionBadge: '📍 Parque Patricios, CABA · EL PALACIO DUCÓ'
        },
        {
            num: 2,
            estadioNombre: 'COLOSO MARCELO BIELSA',
            clubNombre: 'NEWELL\'S OLD BOYS',
            ciudad: 'Rosario, Santa Fe',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\newells.mp4",
            clipStart: 3.0,
            pista: '42.000 hinchas en el Parque de la Independencia',
            targetLat: -32.9556,
            targetLng: -60.6698,
            userLat: -32.9540,
            userLng: -60.6680,
            distanciaTexto: '230 METROS',
            puntosTexto: '+4.940 PTS 🔥',
            puntos: 4940,
            puntosAcumulados: 9860,
            ubicacionBadge: '📍 Rosario, Santa Fe · COLOSO MARCELO BIELSA'
        },
        {
            num: 3,
            estadioNombre: 'LA FORTALEZA',
            clubNombre: 'CLUB ATLÉTICO LANÚS',
            ciudad: 'Lanús, Buenos Aires',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\lanus.mp4",
            clipStart: 3.0,
            pista: '47.020 hinchas en el sur del Gran Buenos Aires',
            targetLat: -34.7176,
            targetLng: -58.3842,
            userLat: -34.7150,
            userLng: -58.3820,
            distanciaTexto: '320 METROS',
            puntosTexto: '+4.810 PTS 🔥',
            puntos: 4810,
            puntosAcumulados: 14670,
            ubicacionBadge: '📍 Lanús, Buenos Aires · LA FORTALEZA'
        },
        {
            num: 4,
            estadioNombre: 'MONUMENTAL JOSÉ FIERRO',
            clubNombre: 'ATLÉTICO TUCUMÁN',
            ciudad: 'San Miguel de Tucumán',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\atucuman.mp4",
            clipStart: 3.0,
            pista: '35.200 hinchas en 25 de Mayo y Chile, norte argentino',
            targetLat: -26.8164,
            targetLng: -65.1994,
            userLat: -26.8145,
            userLng: -65.1975,
            distanciaTexto: '280 METROS',
            puntosTexto: '+4.880 PTS 🔥',
            puntos: 4880,
            puntosAcumulados: 19550,
            ubicacionBadge: '📍 San Miguel de Tucumán · MONUMENTAL JOSÉ FIERRO'
        },
        {
            num: 5,
            estadioNombre: 'GIGANTE DE ARROYITO',
            clubNombre: 'ROSARIO CENTRAL',
            ciudad: 'Rosario, Santa Fe',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\central.mp4",
            clipStart: 3.0,
            pista: '46.955 hinchas a orillas del Río Paraná',
            targetLat: -32.9098,
            targetLng: -60.6723,
            userLat: -32.9080,
            userLng: -60.6705,
            distanciaTexto: '240 METROS',
            puntosTexto: '+4.960 PTS 🔥',
            puntos: 4960,
            puntosAcumulados: 24510,
            ubicacionBadge: '📍 Rosario, Santa Fe · GIGANTE DE ARROYITO'
        }
    ]
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL LIMPIO (35s)
// ==========================================
// Cero whooshes, cero barridos. Solo campanas, ticks, pops y fanfarria.
function generarAudioProcedural(duracionSeg = 35.0, sampleRate = 44100) {
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

    // Cronograma para las 5 rondas (cada una de 6s: 0s, 6s, 12s, 18s, 24s)
    for (let r = 0; r < 5; r++) {
        const baseT = r * 6.0;
        // Campana de inicio de ronda
        addBellDing(baseT + 0.5, 880 + r * 60);

        // Ticks de tensión antes de clavar
        addTick(baseT + 2.5);
        addTick(baseT + 3.0);

        // Pin pop en el mapa
        addPinPop(baseT + 3.5);

        // Sonido de acierto Haversine (dos tonos alegres)
        addTone(baseT + 3.7, 0.6, 659.25, 0.3, 3);
        addTone(baseT + 3.85, 0.8, 880.00, 0.35, 3);
    }

    // 30.0s a 35.0s: Fanfarria mayor de victoria final (C - E - G - B - C)
    const victoriaChords = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    victoriaChords.forEach((freq, idx) => {
        addTone(30.2 + idx * 0.08, 4.0, freq, 0.32, 1.6);
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
function generarArchivoTextos(config, targetFolder) {
    const filePath = path.join(targetFolder, 'TEXTOS_PUBLICACION.txt');
    const content = `========================================================
ESTADIOS VIRTUALES · PACK LISTO PARA PUBLICAR
FORMATO: RETO DIARIO OFICIAL (5 ESTADIOS · 25.000 PTS)
FECHA / EDICIÓN: RETO DIARIO #${config.numeroReto}
========================================================

🏆 OPCIÓN 1: DESAFÍO DIRECTO Y WORDLE (MÁXIMA CONVERSIÓN)
--------------------------------------------------------
Completé el Reto Diario de hoy en estadiosvirtuales.com 🌍⚽
Metí ${config.puntuacionTotal.toLocaleString('es-AR')} / 25.000 puntos (${config.rangoFinal}) 🎯🔥

Mi resultado de hoy:
${config.grillaWordle}

¿Sos capaz de superar mi puntaje en las 5 canchas?
👉 Jugalo 100% gratis en el link del perfil: estadiosvirtuales.com (Directo en el navegador, sin descargar nada).

#estadiosvirtuales #stadiumguessr #retodiario #futbolargentino #futbol #geoguessr #wordle


⚽ OPCIÓN 2: FOLCLORE Y DEBATE DE CANCHAS
--------------------------------------------------------
5 estadios del fútbol argentino desde el aire 🚁👀
¿Cuántos pudiste reconocer antes de que caiga el pin en el mapa?

Dejanos tu puntaje en los comentarios 👇
1. Huracán (El Palacio)
2. Newell's (Coloso Bielsa)
3. Lanús (La Fortaleza)
4. Atlético Tucumán (José Fierro)
5. Rosario Central (Gigante de Arroyito)

🎮 Jugá el Reto Diario nuevo todos los días gratis en: estadiosvirtuales.com

#futbol #estadios #futbolargentino #huracan #newells #lanus #atleticotucuman #rosariocentral


🎮 OPCIÓN 3: MODO GAMER / GEOGUESSR
--------------------------------------------------------
Para los que respiran fútbol y mapas 🕹️🗺️
5 canchas distintas, 5.000 puntos posibles por cada una.

En este reto sumamos ${config.puntuacionTotal.toLocaleString('es-AR')} puntos.
¿Te da la nafta para clavar 25.000 clavados o vas a pifiar en alguna provincia?

👉 Link en el perfil: estadiosvirtuales.com

#gamingentiktok #stadiumguessr #geoguessr #estadiosvirtuales #videojuegos


⚡ OPCIÓN 4: CORTA Y VIRAL
--------------------------------------------------------
Metí ${config.puntuacionTotal.toLocaleString('es-AR')} puntos en el Reto Diario de hoy 🎯
${config.grillaWordle}

¿Cuánto sacás vos? Jugalo gratis en el link de la bio 📲⚽

#retodiario #futbolargentino #estadios #estadiosvirtuales #trivia


💬 COMENTARIOS FIJADOS RECOMENDADOS:
--------------------------------------------------------
1. «¿Cuántos puntos hiciste vos en el reto de hoy? Comentá tus aciertos y jugalo gratis en estadiosvirtuales.com (link en el perfil) 🗺️⚽»
2. «Comentá cuál fue la cancha más difícil: ¿la de Tucumán o la de Rosario? 👀👇»
`;

    fs.writeFileSync(filePath, content, 'utf8');
}

// ==========================================
// 3. GENERADOR DE OVERLAYS Y MAPAS LEAFLET
// ==========================================
async function generarOverlaysYMapas(config, assetsDir) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    // -------------------------------------------------------------
    // A. HEADERS SUPERIORES PARA CADA RONDA (1080x280 px a y=50)
    // -------------------------------------------------------------
    for (let r = 0; r < 5; r++) {
        const ronda = config.rondas[r];
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 320, deviceScaleFactor: 1 });

        // Generamos los 5 dots de progreso
        let dotsHtml = '';
        for (let d = 0; d < 5; d++) {
            if (d < r) {
                dotsHtml += `<div class="dot-pill done">🟩 R${d + 1}</div>`;
            } else if (d === r) {
                dotsHtml += `<div class="dot-pill current">🟢 R${d + 1}</div>`;
            } else {
                dotsHtml += `<div class="dot-pill future">⚪ R${d + 1}</div>`;
            }
        }

        const scoreAnterior = r === 0 ? 0 : config.rondas[r - 1].puntosAcumulados;

        const headerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                body { width: 1080px; height: 320px; background: transparent; overflow: hidden; padding: 20px 50px; }
                .web-header {
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 20, 32, 0.96) 0%, rgba(9, 13, 22, 0.98) 100%);
                    border: 2px solid rgba(0, 230, 118, 0.45);
                    border-top: 2.5px solid rgba(110, 255, 180, 0.85);
                    border-radius: 28px;
                    padding: 16px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(0, 230, 118, 0.2);
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
                    font-size: 18px;
                    font-weight: 900;
                    padding: 4px 16px;
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
                .challenge-tag {
                    background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                    color: #000;
                    font-size: 16px;
                    font-weight: 900;
                    padding: 4px 14px;
                    border-radius: 14px;
                    letter-spacing: 0.5px;
                }
                .title-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .game-main-title {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                }
                .hud-score {
                    color: #00e676;
                    font-size: 26px;
                    font-weight: 900;
                    text-shadow: 0 0 12px rgba(0,230,118,0.5);
                }
                .dots-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 14px;
                    padding: 6px 14px;
                    justify-content: space-between;
                }
                .dot-pill {
                    font-size: 15px;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .dot-pill.done { background: rgba(0, 230, 118, 0.2); color: #00e676; border: 1px solid #00e676; }
                .dot-pill.current { background: rgba(56, 189, 248, 0.25); color: #38bdf8; border: 1.5px solid #38bdf8; }
                .dot-pill.future { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="web-header" id="header-box">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> ESTADIOSVIRTUALES.COM</div>
                    <div class="challenge-tag">📅 RETO DIARIO #${config.numeroReto}</div>
                </div>
                <div class="title-row">
                    <div class="game-main-title">RONDA ${r + 1} DE 5: ¿QUÉ CANCHA ES? ⚽</div>
                    <div class="hud-score">${scoreAnterior.toLocaleString('es-AR')} PTS</div>
                </div>
                <div class="dots-row">
                    ${dotsHtml}
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(headerHtml, { waitUntil: 'load' });
        const headerEl = await page.$('#header-box');
        const headerPath = path.join(assetsDir, `ui_header_ronda_${r + 1}.png`);
        await headerEl.screenshot({ path: headerPath, omitBackground: true });
        await page.close();
    }
    console.log('✅ Headers de las 5 rondas generados.');

    // -------------------------------------------------------------
    // B. PISTAS FLOTANTES INFERIORES PARA CADA RONDA (980x94 px)
    // -------------------------------------------------------------
    for (let r = 0; r < 5; r++) {
        const ronda = config.rondas[r];
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 180, deviceScaleFactor: 1 });

        const clueHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                body { width: 1080px; height: 180px; background: transparent; overflow: hidden; padding: 20px 50px; }
                .clue-card {
                    width: 980px;
                    height: 94px;
                    background: linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(10, 15, 26, 0.98) 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
                    position: relative;
                    overflow: hidden;
                }
                .clue-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #00e676; box-shadow: 0 0 15px #00e676; }
                .clue-icon { font-size: 38px; margin-right: 18px; }
                .clue-text { color: #ffffff; font-size: 28px; font-weight: 800; white-space: nowrap; }
                .clue-tag { font-weight: 900; color: #00e676; margin-right: 10px; }
            </style>
        </head>
        <body>
            <div class="clue-card" id="clue-box">
                <div class="clue-indicator"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag">PISTA:</span> ${ronda.pista}</div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(clueHtml, { waitUntil: 'load' });
        const clueEl = await page.$('#clue-box');
        const cluePath = path.join(assetsDir, `ui_clue_ronda_${r + 1}.png`);
        await clueEl.screenshot({ path: cluePath, omitBackground: true });
        await page.close();
    }
    console.log('✅ Pistas inferiores de las 5 rondas generadas.');

    // -------------------------------------------------------------
    // C. MAPAS LEAFLET (960x460) DE CADA RONDA (100% TILES CARGADOS)
    // -------------------------------------------------------------
    for (let r = 0; r < 5; r++) {
        const item = config.rondas[r];
        const page = await browser.newPage();
        await page.setViewport({ width: 960, height: 460, deviceScaleFactor: 2 });

        const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body { background: transparent; overflow: hidden; width: 960px; height: 460px; }
                #map-card {
                    position: relative;
                    width: 960px;
                    height: 460px;
                    border-radius: 28px;
                    overflow: hidden;
                    border: 4px solid #00e676;
                    box-shadow: 0 16px 50px rgba(0, 230, 118, 0.4), 0 0 0 2px rgba(0,0,0,0.8);
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

                const map = L.map('map', { attributionControl: false, zoomControl: false }).setView([centerLat, centerLng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

                L.polyline([userPos, targetPos], { color: '#ff3b30', weight: 4, dashArray: '8, 8', opacity: 0.95 }).addTo(map);

                L.circleMarker(targetPos, { radius: 14, color: '#00e676', fillColor: '#090e17', fillOpacity: 1, weight: 4 }).addTo(map);
                L.circleMarker(targetPos, { radius: 35, color: '#00e676', fillColor: '#00e676', fillOpacity: 0.22, weight: 2 }).addTo(map);

                const pinIcon = L.divIcon({ className: 'custom-pin-wrap', html: '<div class="user-pin"></div>', iconSize: [32, 32], iconAnchor: [16, 32] });
                L.marker(userPos, { icon: pinIcon }).addTo(map);
            </script>
        </body>
        </html>`;

        await page.setContent(mapHtml, { waitUntil: 'networkidle2' }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        const mapCardEl = await page.$('#map-card');
        const mapImgPath = path.join(assetsDir, `mapa_ronda_${r + 1}.png`);
        await mapCardEl.screenshot({ path: mapImgPath, omitBackground: true });
        await page.close();
        console.log(`✅ Mapa Leaflet Ronda ${r + 1} (${item.estadioNombre}) capturado con OpenStreetMap nítido.`);
    }

    // -------------------------------------------------------------
    // D. PANTALLA DE RESULTADOS FINALES AUTÉNTICA (30.0s a 35.0s)
    // -------------------------------------------------------------
    const finalPage = await browser.newPage();
    await finalPage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const finalScreenHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }
            .endgame-modal {
                width: 980px;
                background: linear-gradient(135deg, rgba(14, 24, 40, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                border: 3.5px solid #00e676;
                border-radius: 36px;
                padding: 44px 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 26px;
                box-shadow: 0 20px 60px rgba(0, 230, 118, 0.35), 0 0 0 2px rgba(0,0,0,0.9);
                text-align: center;
            }
            .brand-badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: rgba(0, 230, 118, 0.12);
                border: 1.5px solid #00e676;
                color: #00e676;
                font-size: 20px;
                font-weight: 900;
                padding: 6px 20px;
                border-radius: 30px;
                letter-spacing: 1px;
            }
            .modal-title {
                color: #ffffff;
                font-size: 52px;
                font-weight: 900;
                letter-spacing: -1px;
                line-height: 1.1;
            }
            .rank-pill {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                font-size: 24px;
                font-weight: 900;
                padding: 8px 28px;
                border-radius: 30px;
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
            }
            .score-circle-wrap {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
            }
            .big-score {
                color: #00e676;
                font-size: 72px;
                font-weight: 900;
                letter-spacing: -1.5px;
                text-shadow: 0 0 40px rgba(0, 230, 118, 0.6);
            }
            .max-score-label {
                color: #94a3b8;
                font-size: 24px;
                font-weight: 800;
            }
            .wordle-grid {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                padding: 16px 36px;
                font-size: 38px;
                letter-spacing: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cta-card {
                width: 100%;
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                color: #041409;
                border: 2px solid #ffffff;
                font-size: 28px;
                font-weight: 900;
                padding: 18px 24px;
                border-radius: 24px;
                box-shadow: 0 12px 35px rgba(0, 230, 118, 0.5);
                line-height: 1.25;
            }
            .cta-sub {
                display: block;
                font-size: 20px;
                font-weight: 800;
                margin-top: 4px;
                color: #002e1b;
            }
        </style>
    </head>
    <body>
        <div class="endgame-modal" id="final-modal">
            <div class="brand-badge">ESTADIOSVIRTUALES.COM · RETO DIARIO</div>
            <div class="modal-title">🏆 ¡RETO COMPLETADO!</div>
            <div class="rank-pill">${config.rangoFinal}</div>
            <div class="score-circle-wrap">
                <div class="big-score">${config.puntuacionTotal.toLocaleString('es-AR')}</div>
                <div class="max-score-label">DE 25.000 PUNTOS POSIBLES</div>
            </div>
            <div class="wordle-grid">${config.grillaWordle}</div>
            <div class="cta-card">
                👉 ¿PODÉS SUPERAR MI PUNTAJE DE HOY? 👀
                <span class="cta-sub">JUGALO GRATIS EN WWW.ESTADIOSVIRTUALES.COM</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await finalPage.setContent(finalScreenHtml, { waitUntil: 'load' });
    const finalModalEl = await finalPage.$('#final-modal');
    const finalModalPath = path.join(assetsDir, 'ui_final_results_modal.png');
    await finalModalEl.screenshot({ path: finalModalPath, omitBackground: true });
    await finalPage.close();
    console.log('✅ Pantalla final de resultados Wordle generada.');

    await browser.close();
}

// ==========================================
// 4. GENERADOR DE PORTADA MISTERIO (3:4 SAFE ZONE)
// ==========================================
async function generarPortadaReto(config, outFolder, bgFramePath) {
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
                font-size: 60px;
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -1.5px;
                text-shadow: 0 10px 30px rgba(0,0,0,0.9);
            }
            .main-title span { color: #ffd700; }
            .mystery-card {
                background: linear-gradient(135deg, rgba(14, 22, 38, 0.95) 0%, rgba(9, 14, 24, 0.98) 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 28px;
                padding: 24px 36px;
                max-width: 860px;
                box-shadow: 0 18px 50px rgba(0,0,0,0.85);
            }
            .mystery-card p {
                color: #ffffff;
                font-size: 32px;
                font-weight: 800;
                line-height: 1.3;
            }
            .mystery-card b { color: #00e676; }
            .challenge-pill {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                font-size: 32px;
                font-weight: 900;
                padding: 18px 46px;
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
            <div class="badge-live">RETO DIARIO #${config.numeroReto}</div>
            <div class="main-title">5 ESTADIOS · <span>25.000 PTS</span><br>¿CUÁNTOS SACÁS HOY? ⚽</div>
            <div class="mystery-card">
                <p>📍 5 canchas del fútbol argentino en el mapa satelital. <b>¿Te da para el 5/5?</b></p>
            </div>
            <div class="challenge-pill">¿PODÉS SUPERARME? 🏆</div>
            <div class="url-tag">JUGALO GRATIS EN: WWW.ESTADIOSVIRTUALES.COM</div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlPortada, { waitUntil: 'load' });
    const portadaPath = path.join(outFolder, config.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada misterio 3:4 guardada: ${portadaPath}`);
}

// ==========================================
// 5. RENDERIZADO FINAL DEL VIDEO (35s) CON FFMPEG
// ==========================================
async function renderizarRetoDiario() {
    const config = RETO_CONFIG;
    console.log(`\n========================================================`);
    console.log(`🎬 RENDERIZANDO RETO DIARIO: ${config.id}`);
    console.log(`========================================================\n`);

    const outFolder = path.join(BASE_OUTPUT_DIR, config.id);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const assetsDir = path.join(__dirname, 'assets_reto_diario_master');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. Guardar textos de publicación
    generarArchivoTextos(config, outFolder);
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt generado.');

    // 2. Extraer frame de fondo para portada desde la primera cancha (Huracán)
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:04',
            '-i', config.rondas[0].videoPath,
            '-vframes', '1',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    // 3. Generar Portada 3:4 Safe Zone
    await generarPortadaReto(config, outFolder, bgFramePath);

    // 4. Generar Overlays, Headers, Pistas y Mapas Leaflet
    await generarOverlaysYMapas(config, assetsDir);

    // 5. Generar Audio Procedural de 35.0s
    const audioPath = path.join(assetsDir, 'audio_reto_diario.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(35.0));
    console.log('✅ Audio procedural (35s) sintetizado (cero whoosh, campanas y fanfarria).');

    // 6. Preparar clips de video de los 5 estadios
    // Cada cancha: 6.0s exactos. Al final: 5.0s para la pantalla de resultados (usando clip 5 de Central)
    // Ronda 1: Huracán (0s - 6s)
    // Ronda 2: Newell's (6s - 12s)
    // Ronda 3: Lanús (12s - 18s)
    // Ronda 4: Atlético Tucumán (18s - 24s)
    // Ronda 5: Central (24s - 30s)
    // Cierre: Central drone continuado (30s - 35s)

    const videoOutPath = path.join(outFolder, config.videoFileName);

    // Timeline de FFmpeg:
    // Inputs:
    // 0: Huracan video
    // 1: Newells video
    // 2: Lanus video
    // 3: ATucuman video
    // 4: Central video
    // 5: Audio procedural (audio_reto_diario.wav)
    // 6..10: Headers Ronda 1 a 5
    // 11..15: Clues Ronda 1 a 5
    // 16..20: Mapas Leaflet Ronda 1 a 5
    // 21: Final Results Modal

    const filterComplex = [
        // 1. Recortar 6s de cada video
        `[0:v]trim=start=3:end=9,setpts=PTS-STARTPTS[v0]`,
        `[1:v]trim=start=3:end=9,setpts=PTS-STARTPTS[v1]`,
        `[2:v]trim=start=3:end=9,setpts=PTS-STARTPTS[v2]`,
        `[3:v]trim=start=3:end=9,setpts=PTS-STARTPTS[v3]`,
        `[4:v]trim=start=3:end=9,setpts=PTS-STARTPTS[v4]`,
        `[4:v]trim=start=9:end=14,setpts=PTS-STARTPTS[v5_end]`,
        // Concatenar en un único stream de 35s y dividir en 2 para fondo y primer plano
        `[v0][v1][v2][v3][v4][v5_end]concat=n=6:v=1:a=0,split=2[df1][df2]`,
        // Fondo difuminado cinemático (1080x1920)
        `[df1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg]`,
        // Video 16:9 nítido centrado (1080x608 a y=656)
        `[df2]scale=1080:608[fg]`,
        `[bg][fg]overlay=0:656[base]`,

        // Escalar los mapas Leaflet (960x460)
        `[16:v]scale=960:460[map1_sc]`,
        `[17:v]scale=960:460[map2_sc]`,
        `[18:v]scale=960:460[map3_sc]`,
        `[19:v]scale=960:460[map4_sc]`,
        `[20:v]scale=960:460[map5_sc]`,

        // Aplicar Headers superiores (y=50, x=50)
        `[base][6:v]overlay=50:50:enable='between(t,0,6)'[vh1]`,
        `[vh1][7:v]overlay=50:50:enable='between(t,6,12)'[vh2]`,
        `[vh2][8:v]overlay=50:50:enable='between(t,12,18)'[vh3]`,
        `[vh3][9:v]overlay=50:50:enable='between(t,18,24)'[vh4]`,
        `[vh4][10:v]overlay=50:50:enable='between(t,24,30)'[vh5]`,

        // Aplicar Pistas inferiores (y=1330, x=50)
        `[vh5][11:v]overlay=50:1330:enable='between(t,0,3.5)'[vc1]`,
        `[vc1][12:v]overlay=50:1330:enable='between(t,6,9.5)'[vc2]`,
        `[vc2][13:v]overlay=50:1330:enable='between(t,12,15.5)'[vc3]`,
        `[vc3][14:v]overlay=50:1330:enable='between(t,18,21.5)'[vc4]`,
        `[vc4][15:v]overlay=50:1330:enable='between(t,24,27.5)'[vc5]`,

        // Aplicar Mapas Leaflet inferiores (y=1320, x=60)
        `[vc5][map1_sc]overlay=60:1320:enable='between(t,3.5,6)'[vm1]`,
        `[vm1][map2_sc]overlay=60:1320:enable='between(t,9.5,12)'[vm2]`,
        `[vm2][map3_sc]overlay=60:1320:enable='between(t,15.5,18)'[vm3]`,
        `[vm3][map4_sc]overlay=60:1320:enable='between(t,21.5,24)'[vm4]`,
        `[vm4][map5_sc]overlay=60:1320:enable='between(t,27.5,30)'[vm5]`,

        // Pantalla final Wordle de Resultados (30s a 35s, centrada x=50, y=420)
        `[vm5][21:v]overlay=50:420:enable='between(t,30,35)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '35',
        '-i', config.rondas[0].videoPath,                        // 0
        '-i', config.rondas[1].videoPath,                        // 1
        '-i', config.rondas[2].videoPath,                        // 2
        '-i', config.rondas[3].videoPath,                        // 3
        '-i', config.rondas[4].videoPath,                        // 4
        '-i', audioPath,                                         // 5
        '-i', path.join(assetsDir, 'ui_header_ronda_1.png'),     // 6
        '-i', path.join(assetsDir, 'ui_header_ronda_2.png'),     // 7
        '-i', path.join(assetsDir, 'ui_header_ronda_3.png'),     // 8
        '-i', path.join(assetsDir, 'ui_header_ronda_4.png'),     // 9
        '-i', path.join(assetsDir, 'ui_header_ronda_5.png'),     // 10
        '-i', path.join(assetsDir, 'ui_clue_ronda_1.png'),       // 11
        '-i', path.join(assetsDir, 'ui_clue_ronda_2.png'),       // 12
        '-i', path.join(assetsDir, 'ui_clue_ronda_3.png'),       // 13
        '-i', path.join(assetsDir, 'ui_clue_ronda_4.png'),       // 14
        '-i', path.join(assetsDir, 'ui_clue_ronda_5.png'),       // 15
        '-i', path.join(assetsDir, 'mapa_ronda_1.png'),          // 16
        '-i', path.join(assetsDir, 'mapa_ronda_2.png'),          // 17
        '-i', path.join(assetsDir, 'mapa_ronda_3.png'),          // 18
        '-i', path.join(assetsDir, 'mapa_ronda_4.png'),          // 19
        '-i', path.join(assetsDir, 'mapa_ronda_5.png'),          // 20
        '-i', path.join(assetsDir, 'ui_final_results_modal.png'),// 21
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '5:a',
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
        let errorOutput = '';
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
            errorOutput += msg;
            const timeMatch = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:35.00\r`);
            }
        });
        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO DE RETO DIARIO FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
                resolve();
            } else {
                reject(new Error(`FFmpeg falló con código ${code}: ${errorOutput.slice(-500)}`));
            }
        });
    });

    // Limpieza de carpeta temporal de assets
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
        console.log('🧹 Limpieza de assets temporales completada.');
    } catch (_) {}
}

renderizarRetoDiario().catch((err) => {
    console.error('❌ Error fatal al renderizar Reto Diario:', err);
    process.exit(1);
});
