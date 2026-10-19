const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. GENERADOR DE AUDIO Y EFECTOS DE SONIDO PROCEDURALES (WAV 44.1kHz 16-bit)
function generarAudioSfx(duracionTotalSegundos = 29, sampleRate = 44100) {
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

    function addTone(startSec, durSec, freq, volume = 0.4, decay = 3) {
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
            const freq = 650 - (i / count) * 450;
            const env = Math.exp(-12 * (i / count));
            samples[start + i] += Math.sin(2 * Math.PI * freq * t) * env * 0.45;
        }
    }

    function addTapClick(startSec) {
        addTone(startSec, 0.04, 540, 0.3, 25);
    }

    // 0.6s: Clic en StadiumGuessr en la home
    addTapClick(0.6);

    // 1.7s: Clic en Modo Individual
    addTapClick(1.7);

    // 2.8s: Clic en Dificultad Medio
    addTapClick(2.8);

    // 3.2s: Whoosh cinemático de inicio + sub-bass
    addWhoosh(3.2, 0.7, 0.45);
    addTone(3.3, 1.4, 110, 0.32, 2);

    // 7.5s: Campanita para la pista
    addTone(7.5, 0.8, 880, 0.25, 4);
    addTone(7.55, 0.8, 1318.5, 0.22, 4);

    // 11.5s, 12.5s: Tics de suspenso
    addTone(11.5, 0.06, 1200, 0.2, 20);
    addTone(12.5, 0.06, 1200, 0.25, 20);

    // 13.5s: Whoosh al desplegar el mapa
    addWhoosh(13.5, 0.5, 0.4);

    // 15.5s: Pop táctil del pin en el mapa
    addPinPop(15.5);

    // 18.0s: Clic en botón confirmar
    addTapClick(18.0);

    // 18.5s: ¡Acorde triunfal de victoria y acierto perfecto! (C5, E5, G5, C6)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(18.5 + idx * 0.07, 3.5, freq, 0.3, 1.8);
    });

    // 20.5s - 26.5s: Ovación de tribuna
    for (let i = 0; i < 4; i++) {
        addWhoosh(20.5 + i * 1.5, 1.8, 0.2);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// 2. CONFIGURACIÓN DEL PACK DE VIDEOS
const VIDEOS_CONFIG = [
    {
        id: 'bombonera',
        filename: 'tiktok_1_la_bombonera.mp4',
        nombreEstadio: 'Alberto J. Armando (La Bombonera)',
        club: 'Boca Juniors',
        pais: 'Argentina',
        lat: -34.6356,
        lng: -58.3648,
        videoUrl: 'https://www.youtube.com/watch?v=Glk5ppU0k2U',
        hook: '⚽ ¿QUÉ ESTADIO ES ESTE? 👀',
        hint: '💡 Pista: 57.200 hinchas · Famoso por latir 🔥',
        prompt: '👇 ¿Lo reconociste? Comentá antes del mapa ⏱️',
        scoreTag: '🎯 ¡A 12 METROS! 5.000 PUNTOS 🔥'
    },
    {
        id: 'bernabeu',
        filename: 'tiktok_2_santiago_bernabeu.mp4',
        nombreEstadio: 'Santiago Bernabéu',
        club: 'Real Madrid',
        pais: 'España',
        lat: 40.4531,
        lng: -3.6883,
        videoUrl: 'https://youtu.be/PHV4nOAu12g',
        hook: '👑 ESTADIO NIVEL EXPERTO: ¿LO SACÁS? 🏟️',
        hint: '💡 Pista: 84.000 personas · Techo retráctil ✨',
        prompt: '👇 ¿En qué ciudad está? ¡Comentá ya! ⏱️',
        scoreTag: '🎯 ¡A 16 METROS! 5.000 PUNTOS 🔥'
    },
    {
        id: 'monumental',
        filename: 'tiktok_3_mas_monumental.mp4',
        nombreEstadio: 'Mâs Monumental',
        club: 'River Plate',
        pais: 'Argentina',
        lat: -34.5453,
        lng: -58.4498,
        videoUrl: 'https://youtu.be/uNvyp-W22cU',
        hook: '🏟️ ¿SOS CAPAZ DE RECONOCER ESTA CANCHA? 👀',
        hint: '💡 Pista: 84.567 espectadores · El más grande de Sudamérica 🏆',
        prompt: '👇 Dejá tu respuesta en los comentarios 👇',
        scoreTag: '🎯 ¡A 14 METROS! 5.000 PUNTOS 🔥'
    }
];

// 3. SERVIDOR LOCAL ESTÁTICO
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

async function grabarUnVideo(browser, config, port) {
    console.log(`\n========================================`);
    console.log(`🎬 INICIANDO GRABACIÓN: ${config.nombreEstadio}`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

    const tempWav = path.join(__dirname, `temp_audio_${config.id}.wav`);
    const audioBuffer = generarAudioSfx(29);
    fs.writeFileSync(tempWav, audioBuffer);

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', config.filename);
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', config.filename);

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

    // 🚀 ESTABILIZADOR DE FLUJO CFR (Constant Frame Rate):
    // Chrome envía capturas asíncronas cuando repinta. Almacenamos el último frame recibido.
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
        if (grabacionActiva) {
            ultimoFrameBuffer = Buffer.from(data, 'base64');
        }
        try {
            await client.send('Page.screencastFrameAck', { sessionId });
        } catch (e) {}
    });

    // ⏱️ TICKER DE 30 FPS CLAVADOS (1 cuadro cada 33.3ms):
    // Garantiza que FFmpeg reciba un flujo constante y matemático de 30 fotogramas por segundo,
    // eliminando por completo cualquier congelamiento, salto de velocidad o desfase de audio.
    const frameTicker = setInterval(() => {
        if (grabacionActiva && ultimoFrameBuffer) {
            try {
                ffmpeg.stdin.write(ultimoFrameBuffer);
            } catch (e) {}
        }
    }, 1000 / 30);

    // 🛡️ Prevenir que el grabador de videos suba récords falsos o nombres bots a Supabase
    await page.evaluateOnNewDocument(() => {
        window.__TIKTOK_RECORDER__ = true;
        window.enviarPuntaje = async () => { console.log('🛡️ [TikTok Recorder] enviarPuntaje silenciado.'); };
    });

    console.log(`- Cargando portada principal en http://localhost:${port}...`);
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 25000 });

    // Inyectar cursor táctil y estilos TikTok
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Cursor táctil circular para simular pulsaciones en celular */
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
                transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease, top 0.3s ease, left 0.3s ease;
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
            #touch-cursor.visible {
                transform: translate(-50%, -50%) scale(1);
            }
            #touch-cursor.tap {
                transform: translate(-50%, -50%) scale(0.75);
                background: rgba(0, 230, 118, 0.9);
            }

            /* Ocultar el mapa al principio para ver el estadio completo */
            #guessr-floating-map-box {
                transform: translateY(160%) !important;
                transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
                box-shadow: 0 -12px 45px rgba(0,0,0,0.9) !important;
            }
            #guessr-floating-map-box.mapa-visible-tiktok {
                transform: translateY(0%) !important;
            }
            /* Ocultar overlay de 'Toca el mapa' para que se vean las calles limpias */
            #map-hint-overlay {
                display: none !important;
                opacity: 0 !important;
            }
            /* Video con leve zoom para eliminar bandas excesivas */
            #modal-video-container iframe {
                transform: scale(1.18) !important;
                transform-origin: center center !important;
                pointer-events: none !important;
            }
            /* Contenedor de Stickers Virales */
            #tiktok-overlay-container {
                position: fixed;
                top: 75px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 380px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .tiktok-sticker {
                width: 100%;
                padding: 12px 18px;
                border-radius: 16px;
                font-weight: 900;
                font-size: 16px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.25);
                animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                letter-spacing: 0.3px;
                line-height: 1.3;
            }
            @keyframes popIn {
                0% { opacity: 0; transform: scale(0.8) translateY(-10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .sticker-hook {
                background: #fde047;
                color: #000;
                border: 2.5px solid #000;
            }
            .sticker-hint {
                background: rgba(15, 23, 42, 0.94);
                color: #38bdf8;
                border: 2px solid #38bdf8;
                backdrop-filter: blur(10px);
                font-size: 14px;
            }
            .sticker-prompt {
                background: #00e676;
                color: #000;
                border: 2px solid #fff;
                font-size: 15px;
            }
            .sticker-win {
                background: #00e676;
                color: #000;
                border: 3px solid #fff;
                font-size: 17px;
                box-shadow: 0 0 40px rgba(0, 230, 118, 0.8);
            }
            .tiktok-outro-card {
                position: fixed;
                inset: 0;
                background: rgba(5, 10, 20, 0.94);
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
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        const cursor = document.createElement('div');
        cursor.id = 'touch-cursor';
        document.body.appendChild(cursor);

        const container = document.createElement('div');
        container.id = 'tiktok-overlay-container';
        document.body.appendChild(container);

        window.__TIKTOK_RECORDER__ = true;
        window.enviarPuntaje = async () => {};
    });

    // ==========================================
    // INICIAR GRABACIÓN DESDE LA INTERFAZ HOME
    // ==========================================
    console.log(`- ¡Comenzando grabación de 29s desde la interfaz previa (Home)!`);
    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 90,
        maxWidth: 1080,
        maxHeight: 1920,
        everyNthFrame: 1
    });
    grabacionActiva = true;

    // PASO 1: Portada Home (0s - 1.1s) -> Cursor viaja a StadiumGuessr y pulsa
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

    // PASO 2: Modal de Modos (1.1s - 2.2s) -> Cursor viaja a 'Modo Individual' y pulsa
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
    await new Promise(r => setTimeout(r, 600));

    // PASO 3: Modal Dificultad (2.2s - 3.2s) -> Cursor viaja a 'Medio' y confirma
    await page.evaluate((cfg) => {
        const btn = document.querySelector('.diff-pill-btn:nth-child(2)') || document.querySelector('.diff-pill-btn');
        const cursor = document.getElementById('touch-cursor');
        if (btn && cursor) {
            const rect = btn.getBoundingClientRect();
            cursor.classList.remove('tap');
            cursor.style.top = (rect.top + rect.height / 2) + 'px';
            cursor.style.left = (rect.left + rect.width / 2) + 'px';
        }
        // Asignamos el estadio objetivo exacto para que la ronda lo elija inmediatamente
        let estObj = null;
        if (cfg.id === 'bombonera') {
            estObj = window.catalogoGlobal.find(e => (e['Estadio'] || '').includes('Bombonera'));
        } else if (cfg.id === 'bernabeu') {
            estObj = window.catalogoGlobal.find(e => (e['Estadio'] || '').includes('Bernab'));
        } else if (cfg.id === 'monumental') {
            estObj = window.catalogoGlobal.find(e => (e['Club'] || '').includes('River') && (e['Estadio'] || '').includes('Monumental'));
        }
        if (!estObj) {
            estObj = window.catalogoGlobal.find(e => (e['Estadio'] || '').includes(cfg.nombreEstadio) || (e['Club'] || '').includes(cfg.club));
        }
        if (estObj) window.catalogoGlobal = [estObj];
    }, config);
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.confirmarDificultadYEliminarModal('medio');
        setTimeout(() => {
            if (cursor) cursor.classList.remove('visible', 'tap');
        }, 200);
    });

    // Esperar a que el motor de StadiumGuessr cree la instancia de Leaflet y la modal de video
    await page.waitForFunction(() => window.guessrMapInstance != null, { timeout: 15000 });
    await page.waitForSelector('#modal-video-container iframe', { timeout: 15000 });
    console.log(`- Motor del juego y video conectados. Sincronizando inicio de vuelo fluido...`);
    await new Promise(r => setTimeout(r, 1200));

    // ==========================================
    // FASE AÉREA: 10 SEGUNDOS COMPLETOS DE VUELO
    // ==========================================
    // Sticker 1: Gancho Viral (3.2s - 7.5s)
    await page.evaluate((cfg) => {
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `<div class="tiktok-sticker sticker-hook">${cfg.hook}</div>`;
    }, config);
    await new Promise(r => setTimeout(r, 4300));

    // Sticker 2: Pista del Estadio (7.5s - 10.5s)
    await page.evaluate((cfg) => {
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `
            <div class="tiktok-sticker sticker-hook">${cfg.hook}</div>
            <div class="tiktok-sticker sticker-hint">${cfg.hint}</div>
        `;
    }, config);
    await new Promise(r => setTimeout(r, 3000));

    // Sticker 3: Prompt de comentario (10.5s - 13.5s)
    await page.evaluate((cfg) => {
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `
            <div class="tiktok-sticker sticker-prompt">${cfg.prompt}</div>
        `;
    }, config);
    await new Promise(r => setTimeout(r, 3000));

    // ==========================================
    // FASE MAPA: EL MAPA SUBE Y SE CARGAN LOS TILES (13.5s - 18.0s)
    // ==========================================
    console.log(`- Abriendo mapa y cargando calles de OpenStreetMap...`);
    await page.evaluate((cfg) => {
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = '';

        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) mapBox.classList.add('mapa-visible-tiktok');

        const hint = document.getElementById('map-hint-overlay');
        if (hint) { hint.style.opacity = '0'; hint.style.display = 'none'; }

        if (window.guessrMapInstance) {
            window.guessrMapInstance.invalidateSize();
            window.guessrMapInstance.setView([cfg.lat, cfg.lng], 15);

            setTimeout(() => { if (window.guessrMapInstance) window.guessrMapInstance.invalidateSize(); }, 300);
            setTimeout(() => { if (window.guessrMapInstance) window.guessrMapInstance.invalidateSize(); }, 700);

            // Clavar el pin a los 1.6s
            setTimeout(() => {
                window.guessrSelectedLatLng = { lat: cfg.lat + 0.0001, lng: cfg.lng - 0.0001 };
                if (window.guessrUserMarker) {
                    window.guessrUserMarker.setLatLng(window.guessrSelectedLatLng);
                } else {
                    window.guessrUserMarker = L.marker(window.guessrSelectedLatLng).addTo(window.guessrMapInstance);
                }
                L.circleMarker([cfg.lat, cfg.lng], {
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
    }, config);
    await new Promise(r => setTimeout(r, 4500));

    // ==========================================
    // FASE RESULTADO: CONFIRMAR Y CELEBRAR (18.0s - 23.5s)
    // ==========================================
    console.log(`- Confirmando tiro y mostrando puntaje 5.000 Pts...`);
    await page.evaluate((cfg) => {
        if (typeof window.procesarArriesgoGuessr === 'function') {
            window.procesarArriesgoGuessr();
        }
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `
            <div class="tiktok-sticker sticker-win">${cfg.scoreTag}</div>
        `;
    }, config);
    await new Promise(r => setTimeout(r, 5500));

    // ==========================================
    // FASE CIERRE: TARJETA VIRAL Y CTA (23.5s - 29.0s)
    // ==========================================
    console.log(`- Mostrando llamado a la acción final...`);
    await page.evaluate(() => {
        const outro = document.createElement('div');
        outro.className = 'tiktok-outro-card';
        outro.innerHTML = `
            <div style="font-size:2.8rem; margin-bottom:12px;">🏟️👑</div>
            <div style="font-size:1.6rem; font-weight:900; line-height:1.2; margin-bottom:12px;">¿Y VOS CUÁNTOS PODÉS ACERTAR?</div>
            <div style="font-size:0.95rem; opacity:0.85; max-width:320px; margin-bottom:24px; line-height:1.4;">
                Jugá a <b>StadiumGuessr</b> gratis sin instalar nada ni crearte cuenta.
            </div>
            <div style="background:#00e676; color:#000; font-weight:900; font-size:1.15rem; padding:14px 28px; border-radius:50px; box-shadow:0 0 35px rgba(0,230,118,0.7); margin-bottom:16px;">
                estadiosvirtuales.com
            </div>
            <div style="font-size:0.85rem; color:#fde047; font-weight:800; letter-spacing:0.5px;">
                👆 Link directo en el perfil 👆
            </div>
        `;
        document.body.appendChild(outro);
    });
    await new Promise(r => setTimeout(r, 5500));

    // FINALIZAR
    console.log(`- Finalizando captura de video...`);
    grabacionActiva = false;
    if (frameTicker) clearInterval(frameTicker);
    try { await client.send('Page.stopScreencast'); } catch(e) {}
    await new Promise(r => setTimeout(r, 600));
    try { ffmpeg.stdin.end(); } catch(e) {}

    await new Promise(r => ffmpeg.on('close', r));
    await page.close();

    fs.copyFileSync(destDesktop, destDownloads);
    try { fs.unlinkSync(tempWav); } catch (e) {}

    console.log(`✅ ¡VIDEO GUARDADO CON ÉXITO!`);
    console.log(`- Desktop: ${destDesktop}`);
    console.log(`- Downloads: ${destDownloads}`);
}

async function main() {
    server.listen(5006, async () => {
        console.log("Iniciando suite de grabación de TikToks a 60 FPS con Home interactiva...");
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

        for (const config of VIDEOS_CONFIG) {
            try {
                await grabarUnVideo(browser, config, 5006);
            } catch (err) {
                console.error(`Error grabando ${config.id}:`, err);
            }
        }

        await browser.close();
        server.close();
        console.log("\n🎉 ¡PACK COMPLETO DE VIDEOS GENERADO Y LISTO PARA PUBLICAR!");
        process.exit(0);
    });
}

main();
