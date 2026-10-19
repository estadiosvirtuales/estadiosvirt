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

const PORT = 4996;
server.listen(PORT, async () => {
    console.log(`[Grabador 5 Grandes] Servidor local listo en http://localhost:${PORT}`);

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

    page.on('console', msg => {
        const txt = msg.text();
        if (txt.includes('Puntos') || txt.includes('Ronda') || txt.includes('error') || txt.includes('Error')) {
            console.log('[Browser Console]', txt);
        }
    });
    page.on('pageerror', err => console.log('[Browser PageError]', err.message));

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'reto_5_grandes_argentina.mp4');
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', 'reto_5_grandes_argentina.mp4');

    const FPS = 25;
    const FRAME_DURATION = 1000 / FPS;

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

    console.log("[Grabador 5 Grandes] Navegando a la página principal...");
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });

    // Esperar a que el catálogo de estadios esté disponible
    console.log("[Grabador 5 Grandes] Esperando carga del catálogo...");
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 25000 });

    // Inyectar la lista fija de los 5 Grandes de Argentina
    await page.evaluate(() => {
        try {
            const idUsuario = window.getUserId ? window.getUserId() : 'guest';
            localStorage.removeItem('ev_reto_diario_fecha_' + idUsuario);
        } catch(e) {}

        // Forzamos a que el Reto use exclusivamente las canchas de los 5 Grandes
        window.obtenerEstadiosRetoDiario = function() {
            return [
                "Alberto J. Armando (La Bombonera)",
                "Mâs Monumental",
                "Presidente Perón (El Cilindro)",
                "Libertadores de América - Ricardo E. Bochini",
                "Pedro Bidegain (El Nuevo Gasómetro)"
            ];
        };
    });

    // Inyectar estilos limpios: comentarios en la franja negra y ocultamiento de popups molestos
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
            /* Ocultar popups de nivel/premios para que la tabla final de los 5 grandes sea la protagonista */
            #levelup-overlay, #reward-overlay, #modal-recompensa-avatar, #modal-pack-bienvenida {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            /* Ajuste de pantalla final para que entren las 5 filas completas */
            #modal-card.resultado-final {
                max-height: 94vh !important;
                padding-top: 10px !important;
                padding-bottom: 10px !important;
                justify-content: center !important;
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
                font-size: 14px;
                padding: 8px 14px;
                border-radius: 12px;
                border: 2px solid #000;
                text-align: center;
                box-shadow: 0 6px 20px rgba(0,0,0,0.7);
                line-height: 1.25;
            }
            .tk-sticker-title.boca { background: #0038a8; color: #fde047; border-color: #fde047; }
            .tk-sticker-title.river { background: #ffffff; color: #cc0000; border-color: #cc0000; }
            .tk-sticker-title.racing { background: #38bdf8; color: #ffffff; border-color: #ffffff; }
            .tk-sticker-title.independiente { background: #dc2626; color: #ffffff; border-color: #ffffff; }
            .tk-sticker-title.sanlorenzo { background: #1e3a8a; color: #f87171; border-color: #f87171; }
            .tk-sticker-title.fail { background: #ef4444; color: #ffffff; border-color: #ffffff; }
            .tk-sticker-title.success { background: #00e676; color: #000; border-color: #000; }

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
    console.log("[Grabador 5 Grandes] Mostrando inicio con botón del Reto Especial...");
    await updateTikTokHUD('⚽ RETO DE LOS 5 GRANDES DE ARGENTINA 🇦🇷', 'Boca · River · Racing · Independiente · San Lorenzo');
    await new Promise(r => setTimeout(r, 2800));

    // Clic en el botón del Reto Diario desde la interfaz principal
    console.log("[Grabador 5 Grandes] Iniciando el reto de los 5 grandes...");
    await page.evaluate(() => {
        const btn = document.querySelector('.btn-reto-banner');
        if (btn) btn.click();
        else if (typeof window.iniciarRetoDiario === 'function') window.iniciarRetoDiario();
    });

    // Esperar a que el modal del video esté completamente activo y el iframe montado
    console.log("[Grabador 5 Grandes] Esperando inicialización del reproductor...");
    await page.waitForFunction(() => {
        const modal = document.getElementById('video-modal');
        const iframe = document.querySelector('#modal-video-container iframe');
        return modal && modal.style.display !== 'none' && iframe && iframe.src;
    }, { timeout: 15000 });

    // ==========================================
    // FASE 1 A 5: LAS 5 CANCHAS DE LOS GRANDES
    // 8.5 SEGUNDOS DE ESTADIO PURO POR CADA RONDA
    // ==========================================
    const config5Grandes = [
        {
            ronda: 1,
            tit: 'RONDA 1: ¿DE QUÉ CLUB ES ESTA CANCHA? 🟦🟨',
            pis: '💡 54.000 hinchas · Famoso en el mundo porque late 🔥',
            off: { dLat: 0.002, dLng: -0.002 }, // La Boca (~280m) -> 4.998 pts
            resultadoTit: '🎯 ¡LA BOMBONERA CLAVADA! 4.998 PTS 🟦🟨',
            resultadoSub: 'Alberto J. Armando · Boca Juniors',
            variant: 'boca'
        },
        {
            ronda: 2,
            tit: 'RONDA 2: EL MÁS GRANDE DE SUDAMÉRICA ⬜🟥',
            pis: '💡 85.000 espectadores · A orillas del Río de la Plata 🏆',
            off: { dLat: 0.003, dLng: 0.002 }, // Núñez (~380m) -> 4.996 pts
            resultadoTit: '👑 ¡EL MONUMENTAL AL ÁNGULO! 4.996 PTS ⬜🟥',
            resultadoSub: 'Mâs Monumental · River Plate',
            variant: 'river'
        },
        {
            ronda: 3,
            tit: 'RONDA 3: LA ACADEMIA EN AVELLANEDA 🩵🤍',
            pis: '💡 Primer estadio techado del país · Pasión de Racing 🎓',
            // Duda humana realista: tira hacia La Plata (~65 km) pensando en el Único
            off: { dLat: -0.55, dLng: -0.45 }, // ~65 km -> ~4.652 pts
            resultadoTit: '😅 ¡ERA EL CILINDRO DE RACING! PENSÉ EN LA PLATA',
            resultadoSub: 'A 65 km · ¡Qué parecido al Único! (+4.652 pts)',
            variant: 'fail'
        },
        {
            ronda: 4,
            tit: 'RONDA 4: ¡AHORA SÍ, EL REY DE COPAS! 🔴⚪',
            pis: '💡 Las 4 gargantas del diablo · Pasión del Rojo en Avellaneda 😈',
            off: { dLat: 0.0018, dLng: -0.0015 }, // Avellaneda (~240m) -> 4.997 pts
            resultadoTit: '🎯 ¡EL BOCHINI CLAVADO! 4.997 PTS 🔴⚪',
            resultadoSub: 'Libertadores de América · Independiente',
            variant: 'independiente'
        },
        {
            ronda: 5,
            tit: 'RONDA 5: EL CICLÓN EN EL BAJO FLORES 🟦🟥',
            pis: '💡 La pasión cuerva en el Pedro Bidegain 🌪️',
            off: { dLat: 0.0025, dLng: 0.002 }, // Bajo Flores (~350m) -> 4.995 pts
            resultadoTit: '🌪️ ¡EL NUEVO GASÓMETRO! 4.995 PTS 🟦🟥',
            resultadoSub: 'Pedro Bidegain · San Lorenzo de Almagro',
            variant: 'sanlorenzo'
        }
    ];

    for (let r = 1; r <= 5; r++) {
        const cfg = config5Grandes[r - 1];
        console.log(`[Grabador 5 Grandes] Ronda ${r}: Preparando vista aérea de ${cfg.resultadoSub}...`);

        // Asegurar que el mapa esté oculto al inicio de la ronda para mostrar el estadio completo
        await page.evaluate(() => {
            const mapBox = document.getElementById('guessr-floating-map-box');
            if (mapBox) mapBox.classList.remove('mapa-visible-tiktok');
        });

        // Esperar 3.0s para que YouTube descargue el stream y desvanezca el overlay inicial
        await new Promise(res => setTimeout(res, 3000));

        // 8.5 segundos de vista aérea limpia y fluida del estadio
        console.log(`[Grabador 5 Grandes] Ronda ${r}: Mostrando estadio limpio (8.5 segundos)...`);
        const TIEMPO_ESTADIO_MS = 8500;
        await updateTikTokHUD(cfg.tit, cfg.pis, TIEMPO_ESTADIO_MS, cfg.variant);
        await new Promise(res => setTimeout(res, TIEMPO_ESTADIO_MS));

        // Desplegar mapa para ubicar la cancha
        console.log(`[Grabador 5 Grandes] Ronda ${r}: Desplegando mapa para ubicar el estadio...`);
        await updateTikTokHUD(`📍 ¡TIEMPO CUMPLIDO! UBICANDO EN EL MAPA...`, '🎯 Clavando el pin en la cancha...', 0);
        
        await page.evaluate(() => {
            const mapBox = document.getElementById('guessr-floating-map-box');
            if (mapBox) mapBox.classList.add('mapa-visible-tiktok');
        });
        await new Promise(res => setTimeout(res, 1000));

        // Clavar el pin con las coordenadas configuradas y esperar el cálculo asíncrono
        await page.evaluate(async (off) => {
            const est = window.guessrEstadioCorrecto;
            if (est) {
                const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
                const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
                window.guessrSelectedLatLng = { lat: lat + off.dLat, lng: lng + off.dLng };
                
                // Asegurar que el marcador de usuario aparezca visible en el mapa Leaflet
                if (window.guessrMapInstance) {
                    if (window.guessrUserMarker) {
                        window.guessrUserMarker.setLatLng(window.guessrSelectedLatLng);
                    } else if (typeof L !== 'undefined') {
                        window.guessrUserMarker = L.marker(window.guessrSelectedLatLng).addTo(window.guessrMapInstance);
                    }
                }
                
                // Resetear estado del botón para que procesarArriesgoGuessr nunca quede bloqueado
                const btn = document.getElementById('game-action-btn');
                if (btn) {
                    btn.setAttribute('data-estado', 'juego');
                    btn.disabled = false;
                }

                if (typeof window.procesarArriesgoGuessr === 'function') {
                    await window.procesarArriesgoGuessr();
                }
            }
        }, cfg.off);

        console.log(`[Grabador 5 Grandes] Ronda ${r}: Acierto registrado. Mostrando puntaje...`);
        await updateTikTokHUD(cfg.resultadoTit, cfg.resultadoSub, 0, cfg.variant);
        
        // Dejar ver el cartel de distancia y puntaje
        await new Promise(res => setTimeout(res, 3500));

        // Avanzar de ronda (en la ronda 5 esto dispara automáticamente finalizarJuegoGuessr)
        if (r < 5) {
            console.log(`[Grabador 5 Grandes] Avanzando a la ronda ${r + 1}...`);
            await page.evaluate(() => {
                if (typeof window.avanzarDeRondaGuessr === 'function') {
                    window.avanzarDeRondaGuessr();
                }
            });
            // Esperar que el nuevo iframe de la siguiente ronda esté montado
            await page.waitForFunction(() => {
                const iframe = document.querySelector('#modal-video-container iframe');
                return iframe && iframe.src;
            }, { timeout: 10000 });
        } else {
            console.log(`[Grabador 5 Grandes] Finalizando la última ronda hacia la pantalla de podio...`);
            await page.evaluate(() => {
                if (typeof window.avanzarDeRondaGuessr === 'function') {
                    window.avanzarDeRondaGuessr();
                }
            });
            // Esperar que la pantalla final de podio se arme
            await page.waitForFunction(() => {
                const card = document.getElementById('modal-card');
                return card && card.classList.contains('resultado-final');
            }, { timeout: 10000 });
            await new Promise(res => setTimeout(res, 1200));
        }
    }

    // ==========================================
    // FASE FINAL: PANTALLA DE RESULTADOS Y COPIAR
    // ==========================================
    console.log("[Grabador 5 Grandes] Reto completado. Mostrando podio final...");
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

    await updateTikTokHUD('👑 ¡24.638 PUNTOS! ¿Y VOS CUÁNTOS METÉS? 🇦🇷🏆', 'Rendimiento: 👑 GALÁCTICO DE LOS 5 GRANDES 👑', 0, 'success');
    await new Promise(r => setTimeout(r, 2500));

    // Clic en el botón 'Compartir Reto Diario'
    console.log("[Grabador 5 Grandes] Tocando botón 'Compartir Reto Diario'...");
    await page.evaluate(() => {
        if (typeof window.compartirRetoDiarioWordle === 'function') {
            window.compartirRetoDiarioWordle();
        }
    });

    // Llamado a la acción final para los comentarios
    await new Promise(r => setTimeout(r, 1200));
    await updateTikTokHUD('👇 ¿DE QUÉ CLUB SOS? DEJÁ TU PUNTAJE CON EMOJIS 👇', '🟦🟨 · ⬜🟥 · 🩵🤍 · 🔴⚪ · 🟦🟥 · estadiosvirtuales.com', 0);

    // Mantener la pantalla final 5 segundos
    await new Promise(r => setTimeout(r, 5000));

    console.log("[Grabador 5 Grandes] Finalizando captura y cerrando FFmpeg...");
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
    console.log("🎉 ¡VIDEO DE LOS 5 GRANDES GENERADO CON ÉXITO!");
    console.log("📁 Guardado en Escritorio:", destDesktop);
    console.log("📁 Guardado en Descargas:", destDownloads);
    console.log("====================================================");
    process.exit(0);
});
