const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Servidor local estático
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

const baseDir = __dirname;
const server = http.createServer((req, res) => {
    let safePath = path.normalize(decodeURI(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    const filePath = path.join(baseDir, safePath);

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

const PORT = 4995;
server.listen(PORT, async () => {
    console.log(`[Grabador] Servidor local listo en http://localhost:${PORT}`);

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--autoplay-policy=no-user-gesture-required',
            '--disable-web-security',
            '--window-size=430,932'
        ]
    });

    const page = await browser.newPage();
    // Headers y User-Agent de móvil real para evitar restricciones en YouTube
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');

    // Vista móvil vertical 9:16 (iPhone 14/15 Pro)
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'reto_diario_completo.mp4');
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', 'reto_diario_completo.mp4');

    const FPS = 25;
    const FRAME_INTERVAL_MS = 1000 / FPS;

    const ffmpeg = spawn(ffmpegPath, [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-r', String(FPS),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'ultrafast',
        '-movflags', '+faststart',
        destDesktop
    ]);

    let latestFrame = null;
    const client = await page.target().createCDPSession();
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
        latestFrame = Buffer.from(data, 'base64');
        try {
            await client.send('Page.screencastFrameAck', { sessionId });
        } catch(e) {}
    });

    console.log("[Grabador] Navegando a la página principal...");
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });

    // Esperar a que el catálogo de estadios esté completamente disponible
    console.log("[Grabador] Esperando carga del catálogo...");
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 25000 });

    // Limpiar bloqueo de fecha previa para que juegue limpio el Reto Diario de hoy
    await page.evaluate(() => {
        try {
            const idUsuario = window.getUserId ? window.getUserId() : 'guest';
            localStorage.removeItem('ev_reto_diario_fecha_' + idUsuario);
        } catch(e) {}
    });

    // Inyectar estilos: stickers ubicados en el espacio negro entre los puntajes (top: 125px) y el video
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Ocultar el mapa al principio para que se vea el estadio 100% limpio */
            #guessr-floating-map-box {
                transform: translateY(160%) !important;
                transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
                box-shadow: 0 -12px 45px rgba(0,0,0,0.95) !important;
            }
            #guessr-floating-map-box.mapa-visible-tiktok {
                transform: translateY(0%) !important;
            }
            /* Video con leve zoom para formato vertical cinemático */
            #modal-video-container iframe {
                transform: scale(1.22) !important;
                transform-origin: center center !important;
                pointer-events: none !important;
            }
            /* Ocultar popups de nivel/premios para que la tabla final de 5 estadios sea la protagonista */
            #levelup-overlay, #reward-overlay, #modal-recompensa-avatar, #modal-pack-bienvenida {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            /* Overlay de stickers TikTok: UBICADO EN EL ESPACIO NEGRO ENTRE HUD Y VIDEO */
            #tiktok-hud-box {
                position: fixed;
                top: 125px; /* Justo debajo de la barra de puntos (Y=64-112) y antes del video */
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999999;
                width: 90%;
                max-width: 380px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .tk-sticker-title {
                background: #fde047;
                color: #000;
                font-weight: 900;
                font-size: 14.5px;
                padding: 8px 14px;
                border-radius: 12px;
                border: 2px solid #000;
                text-align: center;
                box-shadow: 0 6px 20px rgba(0,0,0,0.7);
                line-height: 1.25;
            }
            .tk-sticker-title.fail {
                background: #f97316;
                color: #fff;
                border-color: #fff;
            }
            .tk-sticker-title.success {
                background: #00e676;
                color: #000;
                border-color: #000;
            }
            .tk-sticker-clue {
                background: rgba(15, 23, 42, 0.94);
                color: #38bdf8;
                border: 1.5px solid #38bdf8;
                font-weight: 800;
                font-size: 13px;
                padding: 6px 12px;
                border-radius: 10px;
                text-align: center;
                backdrop-filter: blur(8px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            }
            .tk-progress-bar-wrap {
                width: 100%;
                height: 5px;
                background: rgba(0,0,0,0.6);
                border-radius: 6px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.25);
            }
            .tk-progress-bar-fill {
                height: 100%;
                width: 100%;
                background: linear-gradient(90deg, #00e676, #fde047);
                transition: width 0.1s linear;
            }
        `;
        document.head.appendChild(style);

        const hud = document.createElement('div');
        hud.id = 'tiktok-hud-box';
        document.body.appendChild(hud);
    });

    // Iniciar Screencast Full HD Vertical (720x1280)
    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 85,
        maxWidth: 720,
        maxHeight: 1280,
        everyNthFrame: 1
    });

    // Ticker continuo con sincronización exacta de tiempo real (25 FPS exactos)
    let lastTime = Date.now();
    let frameAccumulator = 0;
    const FRAME_DURATION = 1000 / FPS;

    const frameTicker = setInterval(() => {
        const now = Date.now();
        const delta = Math.min(now - lastTime, 250);
        lastTime = now;
        frameAccumulator += delta;

        while (frameAccumulator >= FRAME_DURATION) {
            if (latestFrame) {
                ffmpeg.stdin.write(latestFrame);
            }
            frameAccumulator -= FRAME_DURATION;
        }
    }, 20);

    // Helper para actualizar HUD
    async function updateTikTokHUD(titulo, pista, tiempoTotalMs = 0, variant = '') {
        await page.evaluate((tit, pis, tMs, vClass) => {
            const hud = document.getElementById('tiktok-hud-box');
            if (!hud) return;
            const extraClass = vClass ? ` ${vClass}` : '';
            hud.innerHTML = `
                <div class="tk-sticker-title${extraClass}">${tit}</div>
                ${pis ? `<div class="tk-sticker-clue">${pis}</div>` : ''}
                ${tMs > 0 ? `<div class="tk-progress-bar-wrap"><div id="tk-fill" class="tk-progress-bar-fill"></div></div>` : ''}
            `;
            if (tMs > 0) {
                const fill = document.getElementById('tk-fill');
                if (fill) {
                    fill.style.transition = `width ${tMs}ms linear`;
                    requestAnimationFrame(() => {
                        fill.style.width = '0%';
                    });
                }
            }
        }, titulo, pista, tiempoTotalMs, variant);
    }

    // ==========================================
    // FASE 0: HOME - VISTA PRINCIPAL (0s a 3.5s)
    // ==========================================
    console.log("[Grabador] Mostrando pantalla principal con botón del Reto Diario...");
    await updateTikTokHUD('📅 RETO DIARIO DE HOY: 5 ESTADIOS 🌍⚽', '¿Sos capaz de adivinar los 5 antes del mapa? 👀');
    await new Promise(r => setTimeout(r, 2800));

    // Clic en el botón del Reto Diario desde la interfaz principal
    console.log("[Grabador] Tocando botón 'Reto Diario' en la interfaz...");
    await page.evaluate(() => {
        const btn = document.querySelector('.btn-reto-banner');
        if (btn) btn.click();
        else if (typeof window.iniciarRetoDiario === 'function') window.iniciarRetoDiario();
    });

    await new Promise(r => setTimeout(r, 1400));

    // ==========================================
    // FASE 1 A 5: LAS 5 RONDAS CON PUNTAJES REALISTAS
    // Combinación de aciertos y pifias creíbles (🟩 🟨 🟩 🟨 🟩)
    // ==========================================
    const configRondas = [
        {
            ronda: 1,
            tit: 'RONDA 1: ¿DE QUÉ CLUB ES ESTA CANCHA? 🇪🇸👀',
            pis: '💡 Capacidad: 53.000 hinchas · Catedral de España',
            // San Mamés: acierto casi perfecto en Bilbao (~1 km)
            off: { dLat: 0.008, dLng: -0.005 },
            resultadoTit: '🎯 ¡GOLAZO! 4.995 PTS EN BILBAO 🔥',
            resultadoSub: 'San Mamés clavado al ángulo',
            variant: 'success'
        },
        {
            ronda: 2,
            tit: 'RONDA 2: ESTA SE PONE DIFÍCIL... ¿DE QUÉ PAÍS ES? ⏱️🤔',
            pis: '💡 Club histórico de primera división europea ⚓',
            // Van Donge & De Roo (Rotterdam): duda humana, se va a Bélgica/Bruselas (~168 km)
            off: { dLat: -1.5, dLng: -0.2 },
            resultadoTit: '😅 ¡ERA EN ROTTERDAM! PENSÉ QUE ERA BÉLGICA',
            resultadoSub: 'A 168 km · ¡Qué engañosa esta cancha! (+4.348 pts)',
            variant: 'fail'
        },
        {
            ronda: 3,
            tit: 'RONDA 3: ¡EL TEMPLO DEL FÚTBOL MUNDIAL! 🇧🇷🔥',
            pis: '💡 Sede de finales de Copa del Mundo · Inconfundible 🏆',
            // Maracanã: súper conocido, casi exacto en Río de Janeiro (~300m)
            off: { dLat: 0.002, dLng: -0.002 },
            resultadoTit: '👑 ¡IMPOSIBLE ERRAR EL MARACANÁ! 4.998 PTS 🔥',
            resultadoSub: 'Clavado en Río de Janeiro a 300 metros',
            variant: 'success'
        },
        {
            ronda: 4,
            tit: 'RONDA 4: FÚTBOL ARGENTINO PURO 🇦🇷🏟️',
            pis: '💡 La caldera del Norte argentino · Hinchada fiel 🔥',
            // La Ciudadela (Tucumán): hincha duda y clava cerca de Santiago del Estero (~175 km)
            off: { dLat: -1.6, dLng: -0.2 },
            resultadoTit: '🫣 ¡ERA LA CIUDADELA! LE PIFIÉ POR 175 KM',
            resultadoSub: 'Tiré cerca de Santiago y era Tucumán (+4.312 pts)',
            variant: 'fail'
        },
        {
            ronda: 5,
            tit: 'RONDA 5: ¡LA ÚLTIMA PARA METER EL RÉCORD! 🇩🇪👑',
            pis: '💡 Estadio a orillas del río en la Bundesliga 🌊',
            // Weserstadion: acierta en Bremen (~600m)
            off: { dLat: 0.005, dLng: 0.004 },
            resultadoTit: '🎯 ¡WERDER BREMEN RECUPERADO! 4.997 PTS 🚀',
            resultadoSub: 'Clavado en Bremen para cerrar Galáctico',
            variant: 'success'
        }
    ];

    for (let r = 1; r <= 5; r++) {
        const cfg = configRondas[r - 1];
        console.log(`[Grabador] Ronda ${r}: Mostrando estadio en pantalla completa (8.5 segundos)...`);

        // Asegurar que el mapa esté oculto al inicio de la ronda para mostrar el estadio completo
        await page.evaluate(() => {
            const mapBox = document.getElementById('guessr-floating-map-box');
            if (mapBox) mapBox.classList.remove('mapa-visible-tiktok');
            const iframes = document.querySelectorAll('#modal-video-container iframe');
            iframes.forEach(iframe => {
                try {
                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                } catch(e) {}
            });
        });

        // 8.5 segundos de vista aérea limpia del estadio
        const TIEMPO_ESTADIO_MS = 8500;
        await updateTikTokHUD(cfg.tit, cfg.pis, TIEMPO_ESTADIO_MS);
        await new Promise(res => setTimeout(res, TIEMPO_ESTADIO_MS));

        // AHORA SÍ: Abrir el mapa suavemente
        console.log(`[Grabador] Ronda ${r}: Desplegando mapa para ubicar el estadio...`);
        await updateTikTokHUD(`📍 ¡TIEMPO CUMPLIDO! UBICANDO EN EL MAPA...`, '🎯 Clavando el pin en la cancha...', 0);
        
        await page.evaluate(() => {
            const mapBox = document.getElementById('guessr-floating-map-box');
            if (mapBox) mapBox.classList.add('mapa-visible-tiktok');
        });
        await new Promise(res => setTimeout(res, 1000));

        // Clavar el pin con el offset configurado para esta ronda
        await page.evaluate((off) => {
            const est = window.guessrEstadioCorrecto;
            if (est) {
                const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
                const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
                window.guessrSelectedLatLng = { lat: lat + off.dLat, lng: lng + off.dLng };
                if (typeof window.procesarArriesgoGuessr === 'function') {
                    window.procesarArriesgoGuessr();
                }
            }
        }, cfg.off);

        console.log(`[Grabador] Ronda ${r}: Acierto registrado. Mostrando puntaje...`);
        await updateTikTokHUD(cfg.resultadoTit, cfg.resultadoSub, 0, cfg.variant);
        
        // Dejar ver el cartel de distancia y puntaje
        await new Promise(res => setTimeout(res, 3500));

        // Avanzar de ronda (en la ronda 5 esto dispara automáticamente finalizarJuegoGuessr)
        console.log(`[Grabador] Pasando a la siguiente fase...`);
        await page.evaluate(() => {
            if (typeof window.avanzarDeRondaGuessr === 'function') {
                window.avanzarDeRondaGuessr();
            }
        });
        await new Promise(res => setTimeout(res, 1500));
    }

    // ==========================================
    // FASE FINAL: PANTALLA DE RESULTADOS Y COPIAR
    // ==========================================
    console.log("[Grabador] Reto diario completado. Mostrando podio final...");
    await page.evaluate(() => {
        const lvl = document.getElementById('levelup-overlay');
        if (lvl) lvl.remove();
        const rew = document.getElementById('reward-overlay');
        if (rew) rew.remove();
        const avatarRew = document.getElementById('modal-recompensa-avatar');
        if (avatarRew) avatarRew.remove();
        const pack = document.getElementById('modal-pack-bienvenida');
        if (pack) pack.remove();
        const card = document.getElementById('modal-card');
        if (card) {
            card.style.display = 'flex';
            card.classList.add('resultado-final', 'resultado-final-layout');
        }
    });
    await updateTikTokHUD('👑 ¡23.650 PUNTOS! ¿SOS CAPAZ DE SUPERARME? 🏆', 'Rendimiento: 👑 GALÁCTICO ABSOLUTO 👑', 0, 'success');
    await new Promise(r => setTimeout(r, 2500));

    // Clic en el botón 'Compartir Reto Diario'
    console.log("[Grabador] Tocando botón 'Compartir Reto Diario'...");
    await page.evaluate(() => {
        if (typeof window.compartirRetoDiarioWordle === 'function') {
            window.compartirRetoDiarioWordle();
        }
    });

    // Llamado a la acción final para los comentarios
    await new Promise(r => setTimeout(r, 1200));
    await updateTikTokHUD('👇 DEJÁ TU PUNTAJE EN COMENTARIOS CON LOS EMOJIS 👇', '🟩 🟨 🟩 🟨 🟩 · estadiosvirtuales.com', 0);

    // Mantener la pantalla final 5 segundos
    await new Promise(r => setTimeout(r, 5000));

    console.log("[Grabador] Finalizando captura y cerrando FFmpeg...");
    clearInterval(frameTicker);
    await client.send('Page.stopScreencast');
    ffmpeg.stdin.end();

    await new Promise(r => ffmpeg.on('close', r));
    await browser.close();
    server.close();

    // Copiar también a Descargas
    try {
        fs.copyFileSync(destDesktop, destDownloads);
    } catch(e) {}

    console.log("====================================================");
    console.log("🎉 ¡VIDEO MEJORADO CON POSICIÓN CENTRAL Y PUNTAJES REALISTAS GENERADO CON ÉXITO!");
    console.log("📁 Guardado en Escritorio:", destDesktop);
    console.log("📁 Guardado en Descargas:", destDownloads);
    console.log("====================================================");
});
