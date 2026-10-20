const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. GENERADOR DE AUDIO PROCEDURAL PARA PRUEBA (14 SEGUNDOS)
function generarAudioPrueba(duracionTotalSegundos = 14, sampleRate = 44100) {
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

    // Efectos de sonido
    addTapClick(0.4); // Click Guessr
    addTapClick(0.9); // Click Solo
    addTapClick(1.4); // Click Dificultad
    addWhoosh(1.8, 0.5, 0.35); // Entra juego
    addTone(3.8, 0.8, 880, 0.25, 4); // Campanita pista
    addWhoosh(5.5, 0.45, 0.35); // Mapa sube
    addPinPop(6.8); // Clavada de pin
    addTapClick(7.8); // Confirmar tiro
    // Acorde acierto perfecto (5.000 pts)
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
        addTone(8.0 + idx * 0.07, 2.5, f, 0.32, 2.0);
    });

    // Ovación para Outro
    for (let i = 0; i < 3; i++) {
        addWhoosh(10.5 + i * 0.8, 1.6, 0.22);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// 2. SERVIDOR CON SOPORTE PARA EL VIDEO LOCAL MP4
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
};

const videoLocalPath = path.join(process.env.USERPROFILE, 'Downloads', 'Estadio Maracana.mp4');

const server = http.createServer((req, res) => {
    const parsedUrl = req.url.split('?')[0];

    // Endpoint directo para el MP4 local de Maracaná
    if (parsedUrl === '/video_maracana_local.mp4') {
        if (!fs.existsSync(videoLocalPath)) {
            res.writeHead(404);
            res.end('Video not found');
            return;
        }

        const stat = fs.statSync(videoLocalPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoLocalPath, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            });
            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            });
            fs.createReadStream(videoLocalPath).pipe(res);
        }
        return;
    }

    let safePath = path.normalize(decodeURI(parsedUrl)).replace(/^(\.\.[\/\\])+/, '');
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

async function grabarPruebaMaracana(browser, port) {
    const filename = 'tiktok_maracana_prueba.mp4';
    const TOTAL_DURACION_SEG = 14;
    const FPS = 30;
    const TARGET_FRAMES = TOTAL_DURACION_SEG * FPS; // 420 frames

    console.log(`\n======================================================`);
    console.log(`🎬 INICIANDO PRUEBA INDIVIDUAL CON VIDEO MP4 LOCAL:`);
    console.log(`👉 Estadio Maracaná (Río de Janeiro, Brasil)`);
    console.log(`🎥 Archivo fuente: ${videoLocalPath}`);
    console.log(`⏱️ Duración: ${TOTAL_DURACION_SEG}s (${TARGET_FRAMES} frames a 30 FPS)`);
    console.log(`======================================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

    const tempWav = path.join(__dirname, 'temp_audio_maracana.wav');
    const audioBuffer = generarAudioPrueba(TOTAL_DURACION_SEG);
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
        '-crf', '18',
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

    let startTime = Date.now();
    let framesEnviados = 0;

    const frameTicker = setInterval(() => {
        if (grabacionActiva && ultimoFrameBuffer) {
            const elapsedSec = (Date.now() - startTime) / 1000;
            const targetFrames = Math.min(TARGET_FRAMES, Math.floor(elapsedSec * FPS));
            const toAdd = targetFrames - framesEnviados;
            for (let i = 0; i < toAdd; i++) {
                try {
                    ffmpeg.stdin.write(ultimoFrameBuffer);
                    framesEnviados++;
                } catch (e) {}
            }
        }
    }, 15);

    await page.evaluateOnNewDocument(() => {
        window.__TIKTOK_RECORDER__ = true;
        window.enviarPuntaje = async () => {};
    });

    console.log(`- Cargando interfaz principal en http://localhost:${port}...`);
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 25000 });

    // Mock RPC de Supabase para Maracaná (5.000 pts)
    await page.evaluate(() => {
        if (window.supabaseClient) {
            window.supabaseClient.rpc = async (fn, params) => {
                return {
                    data: {
                        distancia: 0.012,
                        puntos: 5000,
                        lat_real: -22.912167,
                        lng_real: -43.230164
                    },
                    error: null
                };
            };
        }
    });

    // Inyectar cursor, estilos y overlay
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
                font-size: 15px;
                text-align: center;
                letter-spacing: 0.2px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.7);
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
    console.log(`- Iniciando captura de pantalla a 30 FPS constantes...`);
    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 92,
        maxWidth: 1080,
        maxHeight: 1920,
        everyNthFrame: 1
    });
    startTime = Date.now();
    grabacionActiva = true;

    // Menú inicial (0s - 1.8s)
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
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.abrirModalGuessr();
    });
    await new Promise(r => setTimeout(r, 500));

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
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.mostrarPasoDificultad('solo');
    });
    await new Promise(r => setTimeout(r, 400));

    // Configurar catálogo para Maracaná
    await page.evaluate(() => {
        const maracana = window.catalogoGlobal.find(e => (e['Estadio'] || '').includes('Maracan'));
        window.catalogoGlobal = [maracana];
    });

    // Cerrar modal de dificultad e iniciar partida de trivia
    await page.evaluate(() => {
        const cursor = document.getElementById('touch-cursor');
        if (cursor) cursor.classList.add('tap');
        window.confirmarDificultadYEliminarModal('medio');
        setTimeout(() => { if (cursor) cursor.classList.remove('visible', 'tap'); }, 200);
    });

    // Esperar a que la modal y el mapa existan
    await page.waitForFunction(() => window.guessrMapInstance != null, { timeout: 15000 });

    // REEMPLAZO CLAVE: Inyectar el video MP4 local nativo (cero lag, cero buffering)
    console.log(`- Inyectando video MP4 local de Maracaná en el reproductor...`);
    await page.evaluate(() => {
        const cont = document.getElementById('modal-video-container');
        if (cont) {
            cont.innerHTML = `
                <video id="drone-local-video" src="/video_maracana_local.mp4" autoplay muted loop playsinline
                    style="width:100%; height:100%; object-fit:cover; pointer-events:none; position:absolute; inset:0; z-index:0;">
                </video>
            `;
            const vid = document.getElementById('drone-local-video');
            if (vid) {
                vid.currentTime = 2.0; // arranca en una toma aérea limpia
                vid.play();
            }
        }
    });

    // Sticker de vuelo (1.8s - 3.8s)
    await page.evaluate(() => {
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `
            <div class="tiktok-main-hook">¿CONOCÉS ESTE ESTADIO? 👀🇧🇷</div>
        `;
    });
    await new Promise(r => setTimeout(r, 2000));

    // Pista (3.8s - 5.5s)
    await page.evaluate(() => {
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `
            <div class="tiktok-main-hook">¿CONOCÉS ESTE ESTADIO? 👀🇧🇷</div>
            <div class="tiktok-hint-pill">💡 Pista: Río de Janeiro · Mítico templo del fútbol ⚽</div>
        `;
    });
    await new Promise(r => setTimeout(r, 1700));

    // Desplegar mapa y clavar pin (5.5s - 7.8s)
    console.log(`- Desplegando mapa sobre Río de Janeiro...`);
    const latMaracana = -22.912167;
    const lngMaracana = -43.230164;

    await page.evaluate(({ lat, lng }) => {
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) mapBox.classList.add('mapa-visible-tiktok');

        if (window.guessrMapInstance) {
            window.guessrMapInstance.invalidateSize();
            window.guessrMapInstance.setView([lat, lng], 15);

            setTimeout(() => {
                window.guessrSelectedLatLng = { lat: lat + 0.0001, lng: lng - 0.0001 };
                if (window.guessrUserMarker) {
                    window.guessrUserMarker.setLatLng(window.guessrSelectedLatLng);
                } else {
                    window.guessrUserMarker = L.marker(window.guessrSelectedLatLng).addTo(window.guessrMapInstance);
                }
                L.circleMarker([lat, lng], {
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
            }, 800);
        }
    }, { lat: latMaracana, lng: lngMaracana });
    await new Promise(r => setTimeout(r, 2300));

    // Confirmar tiro (7.8s - 10.5s)
    console.log(`- Confirmando tiro perfecto (+5.000 pts)...`);
    await page.evaluate(() => {
        if (typeof window.procesarArriesgoGuessr === 'function') {
            window.procesarArriesgoGuessr();
        }
        const cont = document.getElementById('tiktok-overlay-container');
        cont.innerHTML = `
            <div class="tiktok-score-pill">🎯 ¡EL MARACANÁ! +5.000 PTS 🔥</div>
        `;
    });
    await new Promise(r => setTimeout(r, 2700));

    // Outro Final (10.5s - 14.0s)
    console.log(`- Mostrando Outro de Victoria...`);
    await page.evaluate(() => {
        const outro = document.createElement('div');
        outro.className = 'tiktok-outro-card';
        outro.innerHTML = `
            <div style="font-size:3rem; margin-bottom:10px;">🏆🇧🇷⚽</div>
            <div style="font-size:1.75rem; font-weight:900; line-height:1.2; margin-bottom:8px; color:#ffd700;">
                ¡5.000 PUNTOS!
            </div>
            <div style="font-size:1.2rem; font-weight:900; margin-bottom:14px;">
                ¿LO ADIVINASTE ANTES DEL MAPA?
            </div>
            <p style="font-size:0.95rem; opacity:0.85; max-width:320px; margin-bottom:22px; line-height:1.4;">
                Dejá tu respuesta en los comentarios y retá a tu amigo 👇
            </p>
            <div style="background:#00e676; color:#04160a; font-weight:900; font-size:1.15rem; padding:14px 28px; border-radius:50px; box-shadow:0 0 35px rgba(0,230,118,0.7); margin-bottom:16px;">
                estadiosvirtuales.com
            </div>
            <div style="font-size:0.85rem; color:#fde047; font-weight:800;">
                👆 Jugá gratis desde el link de mi perfil 👆
            </div>
        `;
        document.body.appendChild(outro);
    });
    await new Promise(r => setTimeout(r, 3500));

    // Completar exactamente los 420 frames
    while (framesEnviados < TARGET_FRAMES) {
        if (ultimoFrameBuffer) {
            try {
                ffmpeg.stdin.write(ultimoFrameBuffer);
                framesEnviados++;
            } catch(e) {}
        } else {
            break;
        }
    }

    console.log(`- Finalizando captura de video (Total frames: ${framesEnviados})...`);
    grabacionActiva = false;
    if (frameTicker) clearInterval(frameTicker);
    try { await client.send('Page.stopScreencast'); } catch(e) {}
    await new Promise(r => setTimeout(r, 400));
    try { ffmpeg.stdin.end(); } catch(e) {}

    await new Promise(r => ffmpeg.on('close', r));
    await page.close();

    fs.copyFileSync(destDesktop, destDownloads);
    try { fs.unlinkSync(tempWav); } catch (e) {}

    console.log(`\n🎉 ¡VIDEO DE PRUEBA COMPLETADO CON ÉXITO!`);
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
            await grabarPruebaMaracana(browser, port);
        } catch (err) {
            console.error("Error grabando video de prueba:", err);
        }

        await browser.close();
        server.close();
        process.exit(0);
    });
}

main();
