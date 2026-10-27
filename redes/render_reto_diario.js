const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 MOTOR OFICIAL: GAMEPLAY REAL / RETO DIARIO EN VIVO');
console.log('🚀 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\RETO DIARIO";

// ==========================================
// CONFIGURACIÓN DE RETOS DIARIOS DISPONIBLES
// ==========================================
const CONFIG_RETOS = {
    'bombonera': {
        slug: 'BOMBONERA-BOCA-JUNIORS',
        numeroReto: 42,
        estadioNombre: 'LA BOMBONERA',
        clubNombre: 'BOCA JUNIORS',
        pais: 'Argentina',
        ciudad: 'Buenos Aires',
        videoFileName: 'Reto_Diario_La_Bombonera.mp4',
        portadaFileName: 'Portada_Reto_Diario_La_Bombonera.jpg',
        videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\Boca 2.mp4",
        targetLat: -34.6356,
        targetLng: -58.3648,
        userLat: -34.6370,
        userLng: -58.3635,
        zoomMap: 15,
        distanciaTexto: '180 METROS',
        puntosTexto: '4.982 PTS',
        puntosNum: 4982,
        pista1: 'Capacidad para 57.200 hinchas en la Ciudad de Buenos Aires',
        pista2: 'Templo mítico fundado en 1940: tribunas verticales que laten',
        ubicacionBadge: '📍 La Boca, Buenos Aires · ESTADIO ALBERTO J. ARMANDO',
        portadaClue: '57.200 hinchas · La Boca · Inaugurado en 1940',
        rondasSimuladas: [
            { ronda: 1, puntos: '4.982 PTS', dist: '180 m', status: '🟩' },
            { ronda: 2, puntos: '4.965 PTS', dist: '210 m', status: '🟩' },
            { ronda: 3, puntos: '4.410 PTS', dist: '850 m', status: '🟨' },
            { ronda: 4, puntos: '4.990 PTS', dist: '90 m', status: '🟩' },
            { ronda: 5, puntos: '4.803 PTS', dist: '340 m', status: '🟩' }
        ],
        puntajeTotal: '24.150 / 25.000 PTS',
        rangoTexto: '👑 GALÁCTICO SUPREMO',
        copys: {
            club: 'Boca Juniors (La Bombonera)',
            hashtags: '#bocajuniors #labombonera #boca #futbolargentino #geoguessr #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿En qué calle de La Boca está la cancha? ¿Sos capaz de clavar 5.000 puntos exactos?'
        }
    },
    'monumental': {
        slug: 'MONUMENTAL-RIVER-PLATE',
        numeroReto: 43,
        estadioNombre: 'EL MONUMENTAL',
        clubNombre: 'RIVER PLATE',
        pais: 'Argentina',
        ciudad: 'Buenos Aires',
        videoFileName: 'Reto_Diario_El_Monumental.mp4',
        portadaFileName: 'Portada_Reto_Diario_El_Monumental.jpg',
        videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\Sin título.mp4",
        targetLat: -34.5453,
        targetLng: -58.4498,
        userLat: -34.5435,
        userLng: -58.4480,
        zoomMap: 15,
        distanciaTexto: '220 METROS',
        puntosTexto: '4.965 PTS',
        puntosNum: 4965,
        pista1: 'El coloso más grande de Sudamérica con 84.567 espectadores',
        pista2: 'Sede de la final del Mundial 1978 en el barrio de Núñez',
        ubicacionBadge: '📍 Núñez, Buenos Aires · MÂS MONUMENTAL',
        portadaClue: '84.567 hinchas · El más grande de Sudamérica · Núñez',
        rondasSimuladas: [
            { ronda: 1, puntos: '4.965 PTS', dist: '220 m', status: '🟩' },
            { ronda: 2, puntos: '4.980 PTS', dist: '120 m', status: '🟩' },
            { ronda: 3, puntos: '4.350 PTS', dist: '920 m', status: '🟨' },
            { ronda: 4, puntos: '4.995 PTS', dist: '65 m', status: '🟩' },
            { ronda: 5, puntos: '4.890 PTS', dist: '280 m', status: '🟩' }
        ],
        puntajeTotal: '24.180 / 25.000 PTS',
        rangoTexto: '👑 GALÁCTICO SUPREMO',
        copys: {
            club: 'River Plate (Mâs Monumental)',
            hashtags: '#riverplate #river #elmonumental #futbolargentino #geoguessr #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿Reconocés el Monumental desde el aire? ¿Podés marcarlo a menos de 100 metros?'
        }
    },
    'san-mames': {
        slug: 'SAN-MAMES-ATHLETIC-BILBAO',
        numeroReto: 44,
        estadioNombre: 'SAN MAMÉS',
        clubNombre: 'ATHLETIC CLUB',
        pais: 'España',
        ciudad: 'Bilbao',
        videoFileName: 'Reto_Diario_San_Mames.mp4',
        portadaFileName: 'Portada_Reto_Diario_San_Mames.jpg',
        videoPath: "E:\\Google earth studio\\España\\San Mamés Athletic Club.mp4",
        targetLat: 43.2641,
        targetLng: -2.9493,
        userLat: 43.2625,
        userLng: -2.9475,
        zoomMap: 15,
        distanciaTexto: '215 METROS',
        puntosTexto: '4.970 PTS',
        puntosNum: 4970,
        pista1: 'La Catedral del fútbol español con 53.300 localidades',
        pista2: 'Inaugurado en 2013 a orillas de la ría en el País Vasco',
        ubicacionBadge: '📍 Bilbao, País Vasco · ESTADIO SAN MAMÉS',
        portadaClue: '53.300 hinchas · La Catedral · Bilbao, España',
        rondasSimuladas: [
            { ronda: 1, puntos: '4.970 PTS', dist: '215 m', status: '🟩' },
            { ronda: 2, puntos: '4.985 PTS', dist: '110 m', status: '🟩' },
            { ronda: 3, puntos: '4.450 PTS', dist: '790 m', status: '🟨' },
            { ronda: 4, puntos: '4.992 PTS', dist: '80 m', status: '🟩' },
            { ronda: 5, puntos: '4.820 PTS', dist: '320 m', status: '🟩' }
        ],
        puntajeTotal: '24.217 / 25.000 PTS',
        rangoTexto: '👑 GALÁCTICO SUPREMO',
        copys: {
            club: 'Athletic Club (San Mamés)',
            hashtags: '#athleticclub #sanmames #bilbao #laliga #geoguessr #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿Ubicas La Catedral en el mapa de Bilbao? Probá tu puntería en el Reto Diario.'
        }
    },
    'camp-nou': {
        slug: 'CAMP-NOU-BARCELONA',
        numeroReto: 45,
        estadioNombre: 'SPOTIFY CAMP NOU',
        clubNombre: 'FC BARCELONA',
        pais: 'España',
        ciudad: 'Barcelona',
        videoFileName: 'Reto_Diario_Camp_Nou.mp4',
        portadaFileName: 'Portada_Reto_Diario_Camp_Nou.jpg',
        videoPath: "E:\\Google earth studio\\España\\Spotify Camp Nou_ Barcelona.mp4",
        targetLat: 41.3809,
        targetLng: 2.1228,
        userLat: 41.3792,
        userLng: 2.1205,
        zoomMap: 15,
        distanciaTexto: '240 METROS',
        puntosTexto: '4.960 PTS',
        puntosNum: 4960,
        pista1: 'El coliseo más grande de Europa con capacidad para 99.354 personas',
        pista2: 'Ubicado en el distrito de Les Corts e inaugurado en 1957',
        ubicacionBadge: '📍 Barcelona, España · SPOTIFY CAMP NOU',
        portadaClue: '99.354 hinchas · Distrito de Les Corts · Barcelona',
        rondasSimuladas: [
            { ronda: 1, puntos: '4.960 PTS', dist: '240 m', status: '🟩' },
            { ronda: 2, puntos: '4.990 PTS', dist: '90 m', status: '🟩' },
            { ronda: 3, puntos: '4.400 PTS', dist: '860 m', status: '🟨' },
            { ronda: 4, puntos: '4.998 PTS', dist: '40 m', status: '🟩' },
            { ronda: 5, puntos: '4.810 PTS', dist: '330 m', status: '🟩' }
        ],
        puntajeTotal: '24.158 / 25.000 PTS',
        rangoTexto: '👑 GALÁCTICO SUPREMO',
        copys: {
            club: 'FC Barcelona (Spotify Camp Nou)',
            hashtags: '#fcbarcelona #campnou #barca #laliga #geoguessr #stadiumguessr #estadiosvirtuales',
            preguntaViral: '¿Sos capaz de clavar el Camp Nou a menos de 200 metros? Jugalo gratis.'
        }
    }
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL NATIVO
// ==========================================
// 100% puro: cero whoosh, cero barrido, cero ruido blanco.
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

    // Cronograma sonoro procedural
    // 0.5s: Inicio / ding de bienvenida suave
    addBellDing(0.5, 880);

    // 4.0s: Pista 2 revelada
    addBellDing(4.0, 987.77);

    // 9.5s a 12.5s: Ticks de tiempo mientras busca en el mapa
    addTick(9.5);
    addTick(10.5);
    addTick(11.5);
    addTick(12.5);

    // 13.5s: Clavada del pin en el mapa
    addPinPop(13.5);

    // 14.5s: Fanfarria de acierto y cálculo de puntaje (C - E - G - C)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(14.5 + idx * 0.07, 3.2, freq, 0.35, 2.0);
    });

    // 18.5s: Acorde dorado de victoria Galáctica
    [659.25, 830.61, 987.77, 1318.51].forEach((freq, idx) => {
        addTone(18.5 + idx * 0.05, 3.0, freq, 0.32, 2.2);
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
FORMATO: RETO DIARIO / GAMEPLAY REAL EN VIVO
ESTADIO: ${item.estadioNombre} (${item.clubNombre} - ${item.pais})
========================================================

🏆 OPCIÓN 1: DESAFÍO DE RETO DIARIO (CONVERSIÓN DIRECTA A LA WEB)
--------------------------------------------------------
Completando el Reto Diario de hoy en estadiosvirtuales.com 🌍⚽
Metimos ${item.puntosTexto} en la Ronda 1 clavando el pin a solo ${item.distanciaTexto}.

Al final cerramos en ${item.puntajeTotal} (${item.rangoTexto}) 🔥

¿Sos capaz de superar mi puntaje en el día de hoy?
👉 Jugalo 100% gratis en el link del perfil: estadiosvirtuales.com

${item.copys.hashtags}


⚽ OPCIÓN 2: FOLCLORE Y DEBATE FUTBOLERO
--------------------------------------------------------
¿Sos capaz de reconocer la cancha mirando solamente la vista aérea de Google Earth? 🚁👀
${item.copys.preguntaViral}

Dejanos en los comentarios cuántos puntos sacaste hoy 👇
🎮 Más estadios y duelos 1v1 en vivo gratis en: estadiosvirtuales.com

${item.copys.hashtags}


🎮 OPCIÓN 3: MODO GEOGUESSR GAMER
--------------------------------------------------------
Para los fanáticos de GeoGuessr y el fútbol mundial 🕹️📍
Hoy en el Reto Diario de Estadios Virtuales tocó una de las canchas más icónicas del planeta.

¿En cuántos segundos la sacás vos?
👉 Entrá a estadiosvirtuales.com (Directo en el navegador, sin descargar nada).

#stadiumguessr #geoguessr #estadiosvirtuales #futbol #gamingentiktok


⚡ OPCIÓN 4: CORTA Y VIRAL PARA TIKTOK
--------------------------------------------------------
Clavé el pin a ${item.distanciaTexto} y sumé ${item.puntosTexto} 🎯🔥
¿Sos capaz de sacar 5.000 puntos en esta ronda?

Jugalo gratis en el link del perfil ⚽📲

${item.copys.hashtags}


💬 COMENTARIOS FIJADOS RECOMENDADOS:
--------------------------------------------------------
1. «¿Cuánto sacaste en el Reto Diario de hoy? Jugalo gratis en el link del perfil (estadiosvirtuales.com) y dejá tus emojis 🟩 🟨 🟩 👇»
2. «El Reto Diario cambia todos los días a las 00:00 hs. ¿Cuál fue el estadio más difícil de hoy? 🤔»
`;

    fs.writeFileSync(filePath, content, 'utf8');
}

// ==========================================
// 3. GENERADOR DE OVERLAYS GRÁFICOS Y MAPAS
// ==========================================
async function generarOverlaysYMapas(item, assetsDir) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    // A. OVERLAYS DE CABECERA Y CAJA DE JUEGO (1080x1920 transparente)
    // -------------------------------------------------------------
    const htmlOverlays = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; background: transparent; overflow: hidden; position: relative; }
            
            /* TOP WEB HEADER (y=50 a y=200) */
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

            /* VENTANA DE VIDEO DRONE (Marco estético) */
            .drone-frame {
                position: absolute;
                top: 215px;
                left: 50px;
                width: 980px;
                height: 855px;
                border-radius: 28px;
                border: 3px solid rgba(255, 255, 255, 0.18);
                pointer-events: none;
                box-shadow: inset 0 0 40px rgba(0,0,0,0.6);
            }
            .drone-tag-top {
                position: absolute;
                top: 232px;
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

            /* DRAWER INFERIOR DE PISTAS (y=1090 a y=1700) */
            .bottom-drawer {
                position: absolute;
                top: 1090px;
                left: 50px;
                width: 980px;
                background: linear-gradient(145deg, rgba(14, 20, 32, 0.97) 0%, rgba(8, 12, 20, 0.99) 100%);
                border: 2px solid rgba(0, 230, 118, 0.4);
                border-radius: 26px;
                padding: 24px 28px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.9);
            }
            .drawer-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .drawer-title { color: #ffffff; font-size: 26px; font-weight: 900; }
            .drawer-badge {
                background: rgba(56, 189, 248, 0.15);
                border: 1.5px solid #38bdf8;
                color: #38bdf8;
                font-size: 16px;
                font-weight: 800;
                padding: 4px 14px;
                border-radius: 16px;
            }
            .clue-box {
                background: rgba(255, 255, 255, 0.04);
                border: 1.5px solid rgba(255, 255, 255, 0.12);
                border-radius: 18px;
                padding: 14px 20px;
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .clue-box.active {
                border-color: #ffd700;
                background: rgba(255, 215, 0, 0.08);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
            }
            .clue-icon { font-size: 32px; }
            .clue-text { color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.25; }
            .clue-text b { color: #ffd700; }

            .btn-action-map {
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                border: 2px solid #ffffff;
                color: #041409;
                font-size: 26px;
                font-weight: 900;
                padding: 16px 24px;
                border-radius: 20px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                box-shadow: 0 10px 30px rgba(0, 230, 118, 0.45);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* PODIO FINAL DE RETO DIARIO (y=1085 a y=1710) */
            .podium-card {
                position: absolute;
                top: 1085px;
                left: 50px;
                width: 980px;
                background: linear-gradient(145deg, rgba(14, 22, 36, 0.98) 0%, rgba(8, 12, 20, 0.99) 100%);
                border: 3px solid #ffd700;
                border-radius: 26px;
                padding: 24px 30px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                box-shadow: 0 20px 55px rgba(255, 215, 0, 0.25), 0 0 0 2px rgba(0,0,0,0.8);
            }
            .podium-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1.5px solid rgba(255, 255, 255, 0.12);
                padding-bottom: 12px;
            }
            .podium-title { color: #ffd700; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
            .podium-rank {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                font-size: 17px;
                font-weight: 900;
                padding: 5px 16px;
                border-radius: 20px;
            }
            .rounds-table {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .round-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 8px 16px;
                font-size: 20px;
                font-weight: 800;
                color: #ffffff;
            }
            .round-row.highlight {
                background: rgba(0, 230, 118, 0.14);
                border: 1.5px solid #00e676;
            }
            .round-label { display: flex; align-items: center; gap: 10px; }
            .round-dist { color: #94a3b8; font-size: 17px; font-weight: 600; }
            .total-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 215, 0, 0.14);
                border: 2px solid #ffd700;
                border-radius: 16px;
                padding: 12px 20px;
                margin-top: 4px;
            }
            .total-label { color: #ffffff; font-size: 22px; font-weight: 900; }
            .total-score { color: #ffd700; font-size: 28px; font-weight: 900; }

            .cta-btn-glow {
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                color: #000000;
                border: 2px solid #ffffff;
                font-size: 24px;
                font-weight: 900;
                padding: 16px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 230, 118, 0.5);
                line-height: 1.25;
            }
        </style>
    </head>
    <body>
        <!-- 1. OVERLAY INICIO (0.0s a 3.5s) -->
        <div id="view-intro">
            <div class="web-header">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer">⏱️ 15s</div>
                </div>
                <div class="game-main-title">📅 RETO DIARIO #${item.numeroReto}: ¿QUÉ CANCHA ES? ⚽</div>
                <div class="hud-status-bar">
                    <div class="hud-round">Ronda <b>1 de 5</b> · Modo Solo</div>
                    <div class="hud-score">0 PUNTOS</div>
                </div>
            </div>

            <div class="drone-frame"></div>
            <div class="drone-tag-top"><div class="red-rec"></div> VISTA AÉREA EN VIVO</div>

            <div class="bottom-drawer">
                <div class="drawer-header">
                    <div class="drawer-title">🧭 ¿DÓNDE QUEDA ESTE ESTADIO?</div>
                    <div class="drawer-badge">RONDA 1</div>
                </div>
                <div class="clue-box active">
                    <div class="clue-icon">💡</div>
                    <div class="clue-text"><b>PISTA 1:</b> ${item.pista1}</div>
                </div>
                <div class="btn-action-map">
                    <span>📍 ABRIR MAPA PARA ARRIESGAR</span>
                </div>
            </div>
        </div>

        <!-- 2. OVERLAY PISTAS AVANZADAS (3.5s a 9.5s) -->
        <div id="view-clues" style="display:none;">
            <div class="web-header">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer" style="color:#ff3b30; border-color:#ff3b30; background:rgba(255,59,48,0.15);">⏱️ 09s</div>
                </div>
                <div class="game-main-title">📅 RETO DIARIO #${item.numeroReto}: ¿QUÉ CANCHA ES? ⚽</div>
                <div class="hud-status-bar">
                    <div class="hud-round">Ronda <b>1 de 5</b> · Buscando en el mapa...</div>
                    <div class="hud-score">0 PUNTOS</div>
                </div>
            </div>

            <div class="drone-frame"></div>
            <div class="drone-tag-top"><div class="red-rec"></div> VISTA AÉREA EN VIVO</div>

            <div class="bottom-drawer">
                <div class="drawer-header">
                    <div class="drawer-title">⏱️ ¡TIEMPO CORRIENDO!</div>
                    <div class="drawer-badge" style="border-color:#ffd700; color:#ffd700;">ÚLTIMA PISTA</div>
                </div>
                <div class="clue-box">
                    <div class="clue-icon">💡</div>
                    <div class="clue-text"><b>PISTA 1:</b> ${item.pista1}</div>
                </div>
                <div class="clue-box active">
                    <div class="clue-icon">🏛️</div>
                    <div class="clue-text"><b>PISTA 2:</b> ${item.pista2}</div>
                </div>
                <div class="btn-action-map" style="background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);">
                    <span>🗺️ DESPLEGANDO MAPA... ⏳</span>
                </div>
            </div>
        </div>

        <!-- 3. OVERLAY SCORE EN VIVO (14.5s a 18.5s) -->
        <div id="view-score-live" style="display:none;">
            <div class="web-header" style="border-color:#00e676; box-shadow:0 16px 45px rgba(0,230,118,0.3);">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer" style="color:#00e676; border-color:#00e676; background:rgba(0,230,118,0.15);">✅ ¡ACERTADO!</div>
                </div>
                <div class="game-main-title">🎯 ¡GOLAZO! CLAVADO A ${item.distanciaTexto}</div>
                <div class="hud-status-bar">
                    <div class="hud-round">Ronda <b>1 de 5</b> · Puntos sumados:</div>
                    <div class="hud-score">+${item.puntosTexto} 🔥</div>
                </div>
            </div>
            <div class="drone-frame"></div>
        </div>

        <!-- 4. OVERLAY PODIO FINAL RETO DIARIO (18.5s a 22.0s) -->
        <div id="view-podium" style="display:none;">
            <div class="web-header" style="border-color:#ffd700; box-shadow:0 16px 45px rgba(255,215,0,0.3);">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> WWW.ESTADIOSVIRTUALES.COM</div>
                    <div class="status-timer" style="color:#ffd700; border-color:#ffd700;">🏆 RESULTADO FINAL</div>
                </div>
                <div class="game-main-title">👑 ¡RETO DIARIO #${item.numeroReto} COMPLETADO!</div>
                <div class="hud-status-bar">
                    <div class="hud-round">5 de 5 rondas completadas</div>
                    <div class="hud-score" style="color:#ffd700;">${item.puntajeTotal}</div>
                </div>
            </div>

            <div class="drone-frame"></div>

            <div class="podium-card">
                <div class="podium-header">
                    <div class="podium-title">📊 RESUMEN DE LA PARTIDA</div>
                    <div class="podium-rank">${item.rangoTexto}</div>
                </div>
                <div class="rounds-table">
                    ${item.rondasSimuladas.map(r => `
                        <div class="round-row ${r.ronda === 1 ? 'highlight' : ''}">
                            <div class="round-label">${r.status} Ronda ${r.ronda}: <span class="round-dist">(${r.dist})</span></div>
                            <div style="color:${r.ronda === 1 ? '#00e676' : '#ffffff'};">${r.puntos}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="total-row">
                    <div class="total-label">PUNTAJE FINAL:</div>
                    <div class="total-score">${item.puntajeTotal}</div>
                </div>
                <div class="cta-btn-glow">
                    👉 ¿SOS CAPAZ DE SUPERARME? 👀<br>
                    <span style="font-size:18px; font-weight:800;">JUGALO GRATIS EN WWW.ESTADIOSVIRTUALES.COM</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlOverlays, { waitUntil: 'load' });

    // Snapshot Intro (0.0s - 3.5s)
    const introPath = path.join(assetsDir, 'overlay_intro.png');
    await page.screenshot({ path: introPath, omitBackground: true });

    // Snapshot Clues (3.5s - 9.5s)
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

    // Snapshot Podium (18.5s - 22.0s)
    await page.evaluate(() => {
        document.getElementById('view-score-live').style.display = 'none';
        document.getElementById('view-podium').style.display = 'block';
    });
    const podiumPath = path.join(assetsDir, 'overlay_podium.png');
    await page.screenshot({ path: podiumPath, omitBackground: true });


    // B. MAPAS LEAFLET INTERACTIVOS (980x600 px en el Drawer)
    // -------------------------------------------------------------
    await page.setViewport({ width: 980, height: 600, deviceScaleFactor: 2 });

    // 1. MAPA FASE BUSCANDO (9.5s a 13.5s): Touch indicator apuntando
    const mapSearchHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 980px; height: 600px; background: transparent; overflow: hidden; position: relative; }
            #map-card {
                width: 980px;
                height: 600px;
                border-radius: 26px;
                overflow: hidden;
                border: 3px solid rgba(56, 189, 248, 0.8);
                box-shadow: 0 16px 45px rgba(0,0,0,0.85);
                position: relative;
            }
            #map { width: 100%; height: 100%; background: #111; }
            .top-search-badge {
                position: absolute;
                top: 18px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(14, 20, 32, 0.94);
                border: 2px solid #38bdf8;
                color: #38bdf8;
                padding: 10px 28px;
                border-radius: 30px;
                font-size: 22px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.7);
            }
            .bottom-action-pill {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                padding: 12px 32px;
                border-radius: 24px;
                font-size: 24px;
                font-weight: 900;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.8);
                border: 2px solid #fff;
            }
            .touch-indicator {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 4px solid #00e676;
                background: rgba(0, 230, 118, 0.35);
                box-shadow: 0 0 25px #00e676;
                animation: pulse 1s infinite alternate;
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
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
            const touchIcon = L.divIcon({ className: 'touch-indicator', iconSize: [50, 50], iconAnchor: [25, 25] });
            L.marker([${item.userLat}, ${item.userLng}], { icon: touchIcon }).addTo(map);
        </script>
    </body>
    </html>
    `;
    await page.setContent(mapSearchHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    const mapSearchPath = path.join(assetsDir, 'map_search.png');
    await page.screenshot({ path: mapSearchPath, omitBackground: true });

    // 2. MAPA FASE RESULTADO Y CÁLCULO (13.5s a 18.5s)
    const mapResultHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 980px; height: 600px; background: transparent; overflow: hidden; position: relative; }
            #map-card {
                width: 980px;
                height: 600px;
                border-radius: 26px;
                overflow: hidden;
                border: 3.5px solid #00e676;
                box-shadow: 0 16px 50px rgba(0, 230, 118, 0.4), 0 0 0 2px rgba(0,0,0,0.8);
                position: relative;
            }
            #map { width: 100%; height: 100%; background: #111; }
            .score-badge {
                position: absolute;
                top: 18px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.95);
                border: 2px solid #00e676;
                color: #00e676;
                padding: 10px 28px;
                border-radius: 30px;
                font-size: 24px;
                font-weight: 900;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 8px 30px rgba(0,0,0,0.85);
            }
            .score-badge span { color: #fff; }
            .bottom-badge {
                position: absolute;
                bottom: 18px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.95);
                border: 1.5px solid rgba(255,255,255,0.25);
                color: #ffd700;
                padding: 8px 24px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: 800;
                z-index: 1000;
                box-shadow: 0 6px 20px rgba(0,0,0,0.8);
                white-space: nowrap;
            }
            .user-pin {
                width: 32px;
                height: 32px;
                background: #ff3b30;
                border: 4px solid #fff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 6px 16px rgba(0,0,0,0.8);
            }
        </style>
    </head>
    <body>
        <div id="map-card">
            <div class="score-badge">🎯 ¡A ${item.distanciaTexto}! · <span>+${item.puntosTexto} 🔥</span></div>
            <div id="map"></div>
            <div class="bottom-badge">${item.ubicacionBadge}</div>
        </div>
        <script>
            const userPos = [${item.userLat}, ${item.userLng}];
            const targetPos = [${item.targetLat}, ${item.targetLng}];
            const centerLat = (userPos[0] + targetPos[0]) / 2;
            const centerLng = (userPos[1] + targetPos[1]) / 2;

            const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([centerLat, centerLng], ${item.zoomMap});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

            // Círculo del estadio
            L.circle(targetPos, { color: '#00e676', fillColor: '#00e676', fillOpacity: 0.35, radius: 100, weight: 3 }).addTo(map);

            // Línea punteada de distancia
            L.polyline([userPos, targetPos], { color: '#ff3b30', weight: 4, dashArray: '10, 10', opacity: 0.95 }).addTo(map);

            // Pin del usuario
            const pinIcon = L.divIcon({ className: 'user-pin', iconSize: [32, 32], iconAnchor: [16, 32] });
            L.marker(userPos, { icon: pinIcon }).addTo(map);
        </script>
    </body>
    </html>
    `;
    await page.setContent(mapResultHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    const mapResultPath = path.join(assetsDir, 'map_result.png');
    await page.screenshot({ path: mapResultPath, omitBackground: true });

    await browser.close();
    console.log('✅ Overlays gráficos y mapas Leaflet generados con éxito.');
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
            <div class="badge-live">📅 RETO DIARIO #${item.numeroReto} · STADIUMGUESSR</div>
            <div class="main-title">¿QUÉ ESTADIO ES<br>Y <span>DÓNDE QUEDA?</span> ⚽</div>
            <div class="clue-mystery-card">
                <p>💡 ${item.portadaClue}</p>
            </div>
            <div class="challenge-pill">¿SOS CAPAZ DE ADIVINARLO? 🗺️</div>
            <div class="url-tag">JUGALO GRATIS EN: ESTADIOSVIRTUALES.COM</div>
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
    const item = CONFIG_RETOS[retoKey];
    if (!item) {
        console.error(`❌ Reto no encontrado: ${retoKey}`);
        return;
    }

    console.log(`\n========================================================`);
    console.log(`🎬 RENDERIZANDO GAMEPLAY RETO DIARIO: ${item.estadioNombre}`);
    console.log(`📁 Slug: ${item.slug}`);
    console.log(`========================================================\n`);

    const outFolder = path.join(BASE_OUTPUT_DIR, item.slug);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const assetsDir = path.join(__dirname, `assets_${retoKey}`);
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. Guardar textos de publicación
    generarArchivoTextos(item, outFolder);
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt generado.');

    // 2. Extraer frame de fondo para la portada
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
    // 9.5s a 13.5s: Mapa buscando (map_search.png en y=1090)
    // 13.5s a 18.5s: Score Live Header (overlay_score_live.png) + Mapa resultado (map_result.png en y=1090)
    // 18.5s a 22.0s: Podio final y CTA (overlay_podium.png)

    const filterComplex = [
        // Background difuminado cinemático
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.28[bg]`,
        // Video de dron nítido centrado en la ventana de juego (980x855 a y=215, x=50)
        `[0:v]scale=980:855:force_original_aspect_ratio=increase,crop=980:855[drone]`,
        `[bg][drone]overlay=50:215[base]`,
        // Overlays temporales
        `[base][2:v]overlay=0:0:enable='between(t,0,3.5)'[v1]`,
        `[v1][3:v]overlay=0:0:enable='between(t,3.5,9.5)'[v2]`,
        `[v2][4:v]overlay=50:1090:enable='between(t,9.5,13.5)'[v3]`,
        `[v3][5:v]overlay=0:0:enable='between(t,13.5,18.5)'[v4]`,
        `[v4][6:v]overlay=50:1090:enable='between(t,13.5,18.5)'[v5]`,
        `[v5][7:v]overlay=0:0:enable='between(t,18.5,22.0)'[outv]`
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
        '-i', path.join(assetsDir, 'overlay_podium.png'),         // 7:v
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
    const target = process.argv[2] || 'bombonera';

    if (target === 'all') {
        const keys = Object.keys(CONFIG_RETOS);
        console.log(`🚀 INICIANDO PRODUCCIÓN DE TODOS LOS RETOS (${keys.length} videos)...\n`);
        for (let i = 0; i < keys.length; i++) {
            await renderizarReto(keys[i]);
        }
        console.log(`\n🎉 ¡TODOS LOS RETOS GENERADOS CON ÉXITO!`);
    } else {
        await renderizarReto(target);
    }
}

main().catch(console.error);
