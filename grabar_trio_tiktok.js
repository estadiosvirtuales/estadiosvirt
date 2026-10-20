const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. GENERADOR DE AUDIO Y EFECTOS DE SONIDO PROCEDURALES (WAV 44.1kHz 16-bit, 51s)
// ============================================================================
function generarAudioTrio(duracionTotalSegundos = 51, sampleRate = 44100) {
    const totalSamples = Math.floor(duracionTotalSegundos * sampleRate);
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
            const val = Math.sin(2 * Math.PI * freq * t) * env * volume;
            samples[start + i] += val;
        }
    }

    function addWhoosh(startSec, durSec = 0.45, volume = 0.35) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(durSec * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / count;
            const env = Math.sin(Math.PI * t);
            const noise = (Math.random() * 2 - 1) * env * volume;
            samples[start + i] += noise;
        }
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

    function addTapClick(startSec) {
        addTone(startSec, 0.04, 540, 0.28, 25);
    }

    // --- INTRO Y MENÚ PRINCIPAL (0.0s - 3.0s) ---
    addTapClick(0.6); // Home Guessr
    addTapClick(1.4); // Solo
    addTapClick(2.2); // Dificultad
    addWhoosh(2.8, 0.6, 0.4);

    // --- RONDA 1: OLD TRAFFORD (3.0s - 16.5s) ---
    addTone(6.5, 0.8, 880, 0.25, 4); // Pista campanita
    addWhoosh(10.5, 0.45, 0.35); // Mapa sube
    addPinPop(12.2); // Pin clava
    addTapClick(13.8); // Confirmar
    // Acorde acierto R1 (5.000 pts)
    [523.25, 659.25, 783.99].forEach((f, idx) => addTone(14.0 + idx * 0.06, 1.8, f, 0.28, 2.5));

    // --- TRANSICIÓN A RONDA 2 ---
    addTapClick(16.5); // Siguiente ronda
    addWhoosh(16.8, 0.5, 0.4);

    // --- RONDA 2: ANFIELD / LIVERPOOL (17.0s - 30.5s) ---
    addTone(21.0, 0.8, 987.77, 0.25, 4); // Pista campanita
    addWhoosh(25.0, 0.45, 0.35); // Mapa sube
    addPinPop(26.7); // Pin clava
    addTapClick(28.3); // Confirmar
    // Acorde acierto R2 (10.000 pts)
    [587.33, 739.99, 880.00].forEach((f, idx) => addTone(28.5 + idx * 0.06, 1.8, f, 0.3, 2.5));

    // --- TRANSICIÓN A RONDA 3 ---
    addTapClick(30.8); // Siguiente ronda
    addWhoosh(31.2, 0.5, 0.4);

    // --- RONDA 3: ETIHAD / MANCHESTER CITY (31.5s - 45.0s) ---
    addTone(35.5, 0.8, 1046.50, 0.25, 4); // Pista campanita
    addWhoosh(39.5, 0.45, 0.35); // Mapa sube
    addPinPop(41.2); // Pin clava
    addTapClick(42.8); // Confirmar
    // ¡Gran Fanfarria de Victoria Completa (15.000 pts)!
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, idx) => {
        addTone(43.0 + idx * 0.08, 4.0, f, 0.35, 1.6);
    });

    // --- OVACIÓN FINAL PARA OUTRO (45.5s - 51.0s) ---
    for (let i = 0; i < 6; i++) {
        addWhoosh(45.5 + i * 0.9, 1.8, 0.22);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// ============================================================================
// 2. PRESETS DE TRÍOS DE ESTADIOS VIRALES
// ============================================================================
const PRESETS = {
    premier: {
        filename: 'tiktok_trio_premier_league.mp4',
        tituloConsola: 'TRÍO PREMIER LEAGUE (Old Trafford ➔ Anfield ➔ Etihad)',
        mainHook: '¿SABÉS DE PREMIER LEAGUE? ADIVINÁ ESTOS 3 🏴󠁧󠁢󠁥󠁮󠁧󠁿🔥',
        outroQuestion: '¿Pudiste adivinar los 3 estadios ingleses? 👇',
        estadios: [
            {
                ronda: 1,
                nivelTag: 'NIVEL 1: FÁCIL ⭐',
                nivelClass: 'pill-facil',
                searchClub: 'Manchester United',
                searchEstadio: 'Old Trafford',
                nombreEstadio: 'Old Trafford',
                club: 'Manchester United',
                pais: 'Inglaterra',
                lat: 53.4631,
                lng: -2.2913,
                videoUrl: 'https://youtu.be/DIBVFC4dtQI',
                hint: '💡 Pista: "El Teatro de los Sueños" · 74.310 hab. 🔴',
                scoreTag: '🎯 ¡OLD TRAFFORD! +5.000 PTS'
            },
            {
                ronda: 2,
                nivelTag: 'NIVEL 2: MEDIO ⭐⭐',
                nivelClass: 'pill-medio',
                searchClub: 'Liverpool',
                searchEstadio: 'Anfield',
                nombreEstadio: 'Anfield',
                club: 'Liverpool',
                pais: 'Inglaterra',
                lat: 53.4308,
                lng: -2.9608,
                videoUrl: 'https://youtu.be/f9rTAFmdyXc',
                hint: '💡 Pista: You\'ll Never Walk Alone · The Kop 🔴🔥',
                scoreTag: '🎯 ¡ANFIELD! +5.000 PTS (10.000)'
            },
            {
                ronda: 3,
                nivelTag: 'NIVEL 3: EXPERTO ⭐⭐⭐',
                nivelClass: 'pill-experto',
                searchClub: 'Manchester City',
                searchEstadio: 'Etihad',
                nombreEstadio: 'Etihad Stadium',
                club: 'Manchester City',
                pais: 'Inglaterra',
                lat: 53.4831,
                lng: -2.2004,
                videoUrl: 'https://youtu.be/C0ZeyMJfCDY',
                hint: '💡 Pista: Casa de los Citizens · 53.400 hab. 🔵',
                scoreTag: '🏆 ¡ETIHAD STADIUM! ¡15.000 PTS!'
            }
        ]
    },
    clasicos: {
        filename: 'tiktok_trio_estadios_virales.mp4',
        tituloConsola: 'TRÍO CLÁSICOS (Bombonera ➔ Maracaná ➔ Bernabéu)',
        mainHook: '¿PODÉS ADIVINAR ESTOS 3 ESTADIOS? 👀⚽',
        outroQuestion: 'Dejá tu respuesta en los comentarios y retá a tu amigo 👇',
        estadios: [
            {
                ronda: 1,
                nivelTag: 'NIVEL 1: FÁCIL ⭐',
                nivelClass: 'pill-facil',
                searchClub: 'Boca Juniors',
                searchEstadio: 'Bombonera',
                nombreEstadio: 'Alberto J. Armando (La Bombonera)',
                club: 'Boca Juniors',
                pais: 'Argentina',
                lat: -34.6356,
                lng: -58.3648,
                videoUrl: 'https://www.youtube.com/watch?v=Glk5ppU0k2U',
                hint: '💡 Pista: 57.200 personas · Famoso por latir 🔥',
                scoreTag: '🎯 ¡LA BOMBONERA! +5.000 PTS'
            },
            {
                ronda: 2,
                nivelTag: 'NIVEL 2: MEDIO ⭐⭐',
                nivelClass: 'pill-medio',
                searchClub: 'Flamengo',
                searchEstadio: 'Maracan',
                nombreEstadio: 'Maracanã',
                club: 'Flamengo / Fluminense',
                pais: 'Brasil',
                lat: -22.912167,
                lng: -43.230164,
                videoUrl: 'https://youtu.be/ZkLYkDXrJOI',
                hint: '💡 Pista: Récord de público · Río de Janeiro 🇧🇷',
                scoreTag: '🎯 ¡EL MARACANÁ! +5.000 PTS (10.000)'
            },
            {
                ronda: 3,
                nivelTag: 'NIVEL 3: EXPERTO ⭐⭐⭐',
                nivelClass: 'pill-experto',
                searchClub: 'Real Madrid',
                searchEstadio: 'Bernab',
                nombreEstadio: 'Santiago Bernabéu',
                club: 'Real Madrid',
                pais: 'España',
                lat: 40.4531,
                lng: -3.6883,
                videoUrl: 'https://youtu.be/PHV4nOAu12g',
                hint: '💡 Pista: Techo retráctil · 84.000 espectadores 👑',
                scoreTag: '🏆 ¡SANTIAGO BERNABÉU! ¡15.000 PTS!'
            }
        ]
    }
};

const arg = (process.argv[2] || '').toLowerCase();
const presetKey = (arg.includes('clasic') || arg.includes('bombonera')) ? 'clasicos' : 'premier';
const CURRENT_PRESET = PRESETS[presetKey];

// ============================================================================
// 3. SERVIDOR LOCAL ESTÁTICO
// ============================================================================
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let safePath = path.normalize(decodeURI(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    const filePath = path.join(__dirname, safePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

async function grabarVideoTrio(browser, port) {
    const filename = CURRENT_PRESET.filename;
    console.log(`\n======================================================`);
    console.log(`🎬 INICIANDO GRABACIÓN DEL TRÍO VIRAL (3 RONDAS):`);
    console.log(`👉 ${CURRENT_PRESET.tituloConsola}`);
    console.log(`======================================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

    const TOTAL_DURACION_SEG = 51;
    const tempWav = path.join(__dirname, 'temp_audio_trio.wav');
    const audioBuffer = generarAudioTrio(TOTAL_DURACION_SEG);
    fs.writeFileSync(tempWav, audioBuffer);

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', filename);
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', filename);

    const ffmpeg = spawn(ffmpegPath, [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-r', '30',
        '-i', '-',
        '-i', tempWav,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'veryfast',
        '-crf', '19',
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-movflags', '+faststart',
        destDesktop
    ]);

    ffmpeg.stderr.on('data', () => {});
    ffmpeg.stdin.on('error', () => {});

    const client = await page.target().createCDPSession();
    let grabacionActiva = false;
    let ultimoFrameBuffer = null;

    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
        if (grabacionActiva) {
            ultimoFrameBuffer = Buffer.from(data, 'base64');
        }
        try {
            await client.send('Page.screencastFrameAck', { sessionId });
        } catch (e) {}
    });

    // ⏱️ SINCRONIZADOR MATEMÁTICO REAL-TIME CFR (Constant Frame Rate a 30 FPS exactos):
    // Utiliza marcas de tiempo absolutas (Date.now()) para calcular exactamente cuántos
    // fotogramas deben haberse enviado a FFmpeg en cada milisegundo. Esto elimina cualquier
    // aceleración o ralentización por timers de Windows o carga del sistema.
    const FPS = 30;
    let startTime = Date.now();
    let framesEnviados = 0;

    const frameTicker = setInterval(() => {
        if (grabacionActiva && ultimoFrameBuffer) {
            const elapsedSec = (Date.now() - startTime) / 1000;
            const targetFrames = Math.floor(elapsedSec * FPS);
            const toAdd = targetFrames - framesEnviados;
            for (let i = 0; i < toAdd; i++) {
                try {
                    ffmpeg.stdin.write(ultimoFrameBuffer);
                    framesEnviados++;
                } catch (e) {}
            }
        }
    }, 15);

    // Silenciar bots y blindar RPC de Supabase para tiro perfecto 5.000 pts
    await page.evaluateOnNewDocument(() => {
        window.__TIKTOK_RECORDER__ = true;
        window.enviarPuntaje = async () => {};
    });

    console.log(`- Cargando portada principal en http://localhost:${port}...`);
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 25000 });

    // Mock seguro de Supabase RPC para cálculo instantáneo 5.000 pts sin latencia de red
    await page.evaluate(() => {
        if (window.supabaseClient) {
            window.supabaseClient.rpc = async (fn, params) => {
                return {
                    data: {
                        distancia: 0.012,
                        puntos: 5000,
                        lat_real: params.p_lat || 53.4631,
                        lng_real: params.p_lng || -2.2913
                    },
                    error: null
                };
            };
        }
    });

    // Inyectar cursor táctil, stickers y estilos de alta retención
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            #touch-cursor {
                position: fixed;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: rgba(0, 230, 118, 0.45);
                border: 2.5px solid #00e676;
                box-shadow: 0 0 20px rgba(0, 230, 118, 0.8);
                pointer-events: none;
                z-index: 10000000;
                transform: translate(-50%, -50%) scale(0);
                transition: transform 0.22s ease, opacity 0.2s ease, top 0.3s ease, left 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #touch-cursor::after {
                content: '';
                width: 14px;
                height: 14px;
                background: #fff;
                border-radius: 50%;
            }
            #touch-cursor.visible { transform: translate(-50%, -50%) scale(1); }
            #touch-cursor.tap { transform: translate(-50%, -50%) scale(0.75); background: rgba(0, 230, 118, 0.9); }

            #guessr-floating-map-box {
                transform: translateY(160%) !important;
                transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
                box-shadow: 0 -12px 45px rgba(0,0,0,0.95) !important;
            }
            #guessr-floating-map-box.mapa-visible-tiktok {
                transform: translateY(0%) !important;
            }
            #map-hint-overlay { display: none !important; }

            #modal-video-container iframe {
                transform: scale(1.18) !important;
                transform-origin: center center !important;
                pointer-events: none !important;
            }

            #tiktok-overlay-container {
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 380px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .tiktok-main-hook {
                width: 100%;
                padding: 10px 14px;
                background: #fde047;
                color: #000;
                border: 2.5px solid #000;
                border-radius: 14px;
                font-weight: 900;
                font-size: 14px;
                text-align: center;
                letter-spacing: 0.2px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.7);
            }
            .tiktok-round-pill {
                padding: 6px 14px;
                border-radius: 20px;
                font-weight: 900;
                font-size: 13px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            }
            .pill-facil { background: #22c55e; color: #fff; }
            .pill-medio { background: #eab308; color: #000; }
            .pill-experto { background: #ef4444; color: #fff; animation: pulseRed 1s infinite alternate; }
            @keyframes pulseRed {
                from { transform: scale(1); }
                to { transform: scale(1.05); }
            }
            .tiktok-hint-pill {
                width: 100%;
                padding: 8px 14px;
                border-radius: 12px;
                background: rgba(15, 23, 42, 0.94);
                color: #38bdf8;
                border: 1.5px solid #38bdf8;
                font-size: 13px;
                font-weight: 800;
                text-align: center;
                backdrop-filter: blur(8px);
            }
            .tiktok-score-pill {
                width: 100%;
                padding: 12px 16px;
                border-radius: 14px;
                background: #00e676;
                color: #04160a;
                border: 2px solid #fff;
                font-size: 16px;
                font-weight: 900;
                text-align: center;
                box-shadow: 0 0 30px rgba(0, 230, 118, 0.8);
            }
            .win-gold {
                background: linear-gradient(135deg, #ffd700, #ffaa00);
                color: #000;
                border: 2.5px solid #fff;
                font-size: 17px;
                box-shadow: 0 0 35px rgba(255, 215, 0, 0.9);
            }

            .tiktok-outro-card {
                position: fixed;
                inset: 0;
                background: rgba(5, 10, 20, 0.95);
                backdrop-filter: blur(20px);
                z-index: 1000000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 30px 24px;
                color: #fff;
                animation: fadeIn 0.4s ease;
            }
        `;
        document.head.appendChild(style);

        const cursor = document.createElement('div');
        cursor.id = 'touch-cursor';
        document.body.appendChild(cursor);

        const container = document.createElement('div');
        container.id = 'tiktok-overlay-container';
        document.body.appendChild(container);
    });

    // Iniciar captura
    console.log(`- ¡Comenzando grabación de ${TOTAL_DURACION_SEG}s a 30 FPS exactos (CFR real-time)!`);
    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 90,
        maxWidth: 1080,
        maxHeight: 1920,
        everyNthFrame: 1
    });
    startTime = Date.now();
    grabacionActiva = true;

    // Menú inicial (0s - 3s)
    await page.evaluate(() => {
        const btn = document.querySelector('.btn-guessr');
        const cursor = document.getElementById('touch-cursor');
        if (btn && cursor) {
            const rect = btn.getBoundingClientRect();
            cursor.style.top = (rect.top + rect.height / 2) + 'px';
            cursor.style.left = (rect.left + rect.width / 2) + 'px';
            cursor.classList.add('visible');
        }
    });
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.abrirModalGuessr();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(() => {
        const btn = document.querySelector('.btn-opt-solo');
        const cursor = document.getElementById('touch-cursor');
        if (btn && cursor) {
            const rect = btn.getBoundingClientRect();
            cursor.classList.remove('tap');
            cursor.style.top = (rect.top + rect.height / 2) + 'px';
            cursor.style.left = (rect.left + rect.width / 2) + 'px';
        }
    });
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.mostrarPasoDificultad('solo');
    });
    await new Promise(r => setTimeout(r, 500));

    // Preset de estadios: Búsqueda inequívoca por Club y Estadio
    const estadiosCargados = await page.evaluate((estadiosCfg) => {
        const estadiosEncontrados = estadiosCfg.map(cfg => {
            const targetClub = (cfg.searchClub || '').toLowerCase();
            const targetEst = (cfg.searchEstadio || '').toLowerCase();

            return window.catalogoGlobal.find(e => {
                const c = (e['Club'] || '').toLowerCase();
                const est = (e['Estadio'] || '').toLowerCase();

                // Coincidencia exacta por club y nombre de estadio
                return c.includes(targetClub) && (!targetEst || est.includes(targetEst));
            });
        });

        window.__TRIO_ESTADIOS__ = estadiosEncontrados;
        // En la primera ronda ponemos el primer estadio
        window.catalogoGlobal = [estadiosEncontrados[0]];

        return estadiosEncontrados.map(e => ({
            estadio: e ? e['Estadio'] : 'NO ENCONTRADO',
            club: e ? e['Club'] : 'NO ENCONTRADO',
            pais: e ? e['País'] : 'NO ENCONTRADO'
        }));
    }, CURRENT_PRESET.estadios);

    console.log(`- Estadios seleccionados en el motor:`, JSON.stringify(estadiosCargados));

    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.confirmarDificultadYEliminarModal('medio');
        setTimeout(() => { if (cursor) cursor.classList.remove('visible', 'tap'); }, 200);
    });

    // Bucle para jugar las 3 rondas con ritmo natural y fluido
    for (let rIdx = 0; rIdx < CURRENT_PRESET.estadios.length; rIdx++) {
        const item = CURRENT_PRESET.estadios[rIdx];
        console.log(`\n--- JUGANDO RONDA ${item.ronda}: ${item.nombreEstadio} (${item.club} - ${item.pais}) ---`);

        // Si es ronda 2 o 3, inyectamos el estadio y abrimos la ronda limpiamente
        if (rIdx > 0) {
            await page.evaluate((data) => {
                const siguienteEstadio = window.__TRIO_ESTADIOS__[data.rIdx];
                window.catalogoGlobal = [siguienteEstadio];
                window.guessrEstadiosJugados = []; // Evita que se considere ya jugado
                if (typeof window.lanzarRondaGuessr === 'function') {
                    window.guessrRondaActual = data.ronda;
                    window.lanzarRondaGuessr();
                }
            }, { rIdx, ronda: item.ronda });
        }

        // Esperar video y mapa
        await page.waitForFunction(() => window.guessrMapInstance != null, { timeout: 15000 });
        await new Promise(r => setTimeout(r, 1200));

        // Stickers de vuelo
        await page.evaluate((data) => {
            const cont = document.getElementById('tiktok-overlay-container');
            cont.innerHTML = `
                <div class="tiktok-main-hook">${data.mainHook}</div>
                <div class="tiktok-round-pill ${data.cfg.nivelClass}">${data.cfg.nivelTag}</div>
            `;
        }, { mainHook: CURRENT_PRESET.mainHook, cfg: item });
        await new Promise(r => setTimeout(r, 3000));

        // Pista
        await page.evaluate((data) => {
            const cont = document.getElementById('tiktok-overlay-container');
            cont.innerHTML = `
                <div class="tiktok-main-hook">${data.mainHook}</div>
                <div class="tiktok-round-pill ${data.cfg.nivelClass}">${data.cfg.nivelTag}</div>
                <div class="tiktok-hint-pill">${data.cfg.hint}</div>
            `;
        }, { mainHook: CURRENT_PRESET.mainHook, cfg: item });
        await new Promise(r => setTimeout(r, 3500));

        // Desplegar mapa y clavar pin
        console.log(`- Desplegando mapa para ${item.nombreEstadio}...`);
        await page.evaluate((data) => {
            const cont = document.getElementById('tiktok-overlay-container');
            cont.innerHTML = `
                <div class="tiktok-main-hook">${data.mainHook}</div>
                <div class="tiktok-round-pill ${data.cfg.nivelClass}">${data.cfg.nivelTag}</div>
            `;
            const mapBox = document.getElementById('guessr-floating-map-box');
            if (mapBox) mapBox.classList.add('mapa-visible-tiktok');

            if (window.guessrMapInstance) {
                window.guessrMapInstance.invalidateSize();
                window.guessrMapInstance.setView([data.cfg.lat, data.cfg.lng], 15);

                setTimeout(() => {
                    window.guessrSelectedLatLng = { lat: data.cfg.lat + 0.0001, lng: data.cfg.lng - 0.0001 };
                    if (window.guessrUserMarker) {
                        window.guessrUserMarker.setLatLng(window.guessrSelectedLatLng);
                    } else {
                        window.guessrUserMarker = L.marker(window.guessrSelectedLatLng).addTo(window.guessrMapInstance);
                    }
                    L.circleMarker([data.cfg.lat, data.cfg.lng], {
                        radius: 12,
                        color: '#00e676',
                        fillColor: '#00e676',
                        fillOpacity: 0.5,
                        weight: 3
                    }).addTo(window.guessrMapInstance);

                    const btn = document.getElementById('game-action-btn');
                    if (btn) {
                        btn.innerHTML = `<i class="ph-fill ph-rocket-launch"></i> ¡Confirmar ubicación!`;
                        btn.className = "btn-3d primary";
                        btn.disabled = false;
                    }
                }, 1600);
            }
        }, { mainHook: CURRENT_PRESET.mainHook, cfg: item });
        await new Promise(r => setTimeout(r, 3200));

        // Confirmar tiro
        console.log(`- Confirmando tiro de la ronda ${item.ronda}...`);
        await page.evaluate((cfg) => {
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
            const cont = document.getElementById('tiktok-overlay-container');
            const esUltima = cfg.ronda === 3;
            cont.innerHTML = `
                <div class="tiktok-score-pill ${esUltima ? 'win-gold' : ''}">${cfg.scoreTag}</div>
            `;
        }, item);
        await new Promise(r => setTimeout(r, 2400));

        // Si no es la última ronda, replegamos el mapa antes de avanzar
        if (rIdx < CURRENT_PRESET.estadios.length - 1) {
            await page.evaluate(() => {
                const mapBox = document.getElementById('guessr-floating-map-box');
                if (mapBox) mapBox.classList.remove('mapa-visible-tiktok');
            });
            await new Promise(r => setTimeout(r, 800));
        }
    }

    // Outro final (45.5s - 51.0s)
    console.log(`- Mostrando Outro de Victoria Completa (15.000 pts)...`);
    await page.evaluate((data) => {
        const outro = document.createElement('div');
        outro.className = 'tiktok-outro-card';
        outro.innerHTML = `
            <div style="font-size:3rem; margin-bottom:10px;">🏆👑⚽</div>
            <div style="font-size:1.75rem; font-weight:900; line-height:1.2; margin-bottom:8px; color:#ffd700;">
                ¡15.000 PUNTOS!
            </div>
            <div style="font-size:1.2rem; font-weight:900; margin-bottom:14px;">
                ¿Y VOS CUÁNTOS SACASTE?
            </div>
            <p style="font-size:0.95rem; opacity:0.85; max-width:320px; margin-bottom:22px; line-height:1.4;">
                ${data.outroQuestion}
            </p>
            <div style="background:#00e676; color:#04160a; font-weight:900; font-size:1.15rem; padding:14px 28px; border-radius:50px; box-shadow:0 0 35px rgba(0,230,118,0.7); margin-bottom:16px;">
                estadiosvirtuales.com
            </div>
            <div style="font-size:0.85rem; color:#fde047; font-weight:800;">
                👆 Jugá gratis desde el link de mi perfil 👆
            </div>
        `;
        document.body.appendChild(outro);
    }, { outroQuestion: CURRENT_PRESET.outroQuestion });

    // Completar el tiempo hasta TOTAL_DURACION_SEG
    const tiempoFaltanteMs = Math.max(0, (TOTAL_DURACION_SEG * 1000) - (Date.now() - startTime));
    console.log(`- Sincronizando outro final (${(tiempoFaltanteMs / 1000).toFixed(1)}s restantes)...`);
    await new Promise(r => setTimeout(r, tiempoFaltanteMs));

    // Finalizar
    console.log(`- Finalizando captura del video trío (Total frames enviados: ${framesEnviados})...`);
    grabacionActiva = false;
    if (frameTicker) clearInterval(frameTicker);
    try { await client.send('Page.stopScreencast'); } catch(e) {}
    await new Promise(r => setTimeout(r, 600));
    try { ffmpeg.stdin.end(); } catch(e) {}

    await new Promise(r => ffmpeg.on('close', r));
    await page.close();

    fs.copyFileSync(destDesktop, destDownloads);
    try { fs.unlinkSync(tempWav); } catch (e) {}

    console.log(`\n🎉 ¡VIDEO TRÍO VIRAL COMPLETADO CON ÉXITO!`);
    console.log(`- Desktop: ${destDesktop}`);
    console.log(`- Downloads: ${destDownloads}`);
}

async function main() {
    server.listen(0, async () => {
        const port = server.address().port;
        console.log(`Servidor local en puerto ${port} iniciado...`);
        const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
        const browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: 'new',
            args: [
                '--no-sandbox',
                '--autoplay-policy=no-user-gesture-required',
                '--disable-web-security',
                '--window-size=430,932',
                '--enable-gpu',
                '--use-gl=angle',
                '--use-angle=d3d11',
                '--enable-accelerated-video-decode',
                '--enable-accelerated-2d-canvas',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });

        try {
            await grabarVideoTrio(browser, port);
        } catch (err) {
            console.error("Error grabando video trío:", err);
        }

        await browser.close();
        server.close();
        process.exit(0);
    });
}

main();
