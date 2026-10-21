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

const PORT = 4991;
server.listen(PORT, async () => {
    console.log(`Servidor local activo en http://localhost:${PORT}`);

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
    // Resolución vertical iPhone para TikTok (9:16)
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'tiktok_1_descubriendo_web.mp4');
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', 'tiktok_1_descubriendo_web.mp4');

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
        '-preset', 'fast',
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

    console.log("Cargando la página oficial...");
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });

    // Esperar a que cargue el catálogo
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 20000 });

    // Iniciar Screencast a resolución de alta calidad
    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 85,
        maxWidth: 720,
        maxHeight: 1280,
        everyNthFrame: 1
    });

    // Iniciar temporizador constante de fotogramas para garantizar VELOCIDAD REAL 1.0X (sin cámara rápida)
    const frameTicker = setInterval(() => {
        if (latestFrame) {
            ffmpeg.stdin.write(latestFrame);
        }
    }, FRAME_INTERVAL_MS);

    // Helper para actualizar stickers llamativos estilo TikTok
    async function setTikTokSticker(texto, bgColor = '#fde047', textColor = '#000') {
        await page.evaluate((txt, bg, col) => {
            let el = document.getElementById('tiktok-hud-sticker');
            if (!el) {
                el = document.createElement('div');
                el.id = 'tiktok-hud-sticker';
                el.style.cssText = 'position:fixed; top:25px; left:50%; transform:translateX(-50%); z-index:9999999; pointer-events:none; width:92%; max-width:390px; text-align:center; transition:all 0.3s ease;';
                document.body.appendChild(el);
            }
            el.innerHTML = `
                <div style="background:${bg}; color:${col}; font-weight:900; font-size:15px; padding:10px 16px; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,0.7); font-family:system-ui; border:2px solid #000; letter-spacing:0.4px; line-height:1.3;">
                    ${txt}
                </div>
            `;
        }, texto, bgColor, textColor);
    }

    // ==========================================
    // PARTE 1: MOSTRAR LA WEB Y EL CATÁLOGO (0s a 6s)
    // ==========================================
    console.log("Parte 1: Mostrando la página de inicio y catálogo...");
    await setTikTokSticker('ESTA WEB TIENE TODOS LOS ESTADIOS DEL MUNDO EN 4K 🌍⚽');
    await new Promise(r => setTimeout(r, 2000));

    // Scroll suave hacia abajo mostrando las tarjetas de estadios
    await page.evaluate(() => {
        window.scrollBy({ top: 450, behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 1800));

    await setTikTokSticker('Y ADEMÁS TIENE UN MODO GEO-GUESSR... ¿TE ANIMÁS? 👀🔥', '#00e676', '#000');
    await new Promise(r => setTimeout(r, 2000));

    // ==========================================
    // PARTE 2: ENTRAR A STADIUMGUESSR (6s a 8s)
    // ==========================================
    console.log("Parte 2: Abriendo StadiumGuessr...");
    await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.mostrarPasoDificultad('solo');
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
        window.confirmarDificultadYEliminarModal('medio');
    });

    // ==========================================
    // PARTE 3: RONDA 1 - ESTADIO SIN MAPA ENCIMA (8s a 18s)
    // ==========================================
    console.log("Parte 3: Ronda 1 - Ocultando el mapa para mostrar el video del estadio en pantalla completa...");
    // Ocultar el mapa para que se aprecie la vista aérea limpia
    await page.evaluate(() => {
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.transition = 'all 0.4s ease';
            mapBox.style.opacity = '0';
            mapBox.style.transform = 'translateY(150%)';
        }
    });

    await setTikTokSticker('RONDA 1: ¿RECONOCÉS ESTA CANCHA SOLO POR EL TECHO? 🤔🏟️', '#38bdf8', '#000');
    // Dejar apreciar el video aéreo limpio durante 4.5 segundos
    await new Promise(r => setTimeout(r, 4500));

    // Entra el mapa deslizándose suavemente
    console.log("Mostrando mapa y clavando pin...");
    await setTikTokSticker('¡CLAVÁ EL PIN DONDE CREAS QUE ESTÁ! 📍🎯', '#fde047', '#000');
    await page.evaluate(() => {
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.opacity = '1';
            mapBox.style.transform = 'translateY(0)';
        }
    });
    await new Promise(r => setTimeout(r, 1200));

    // Clavar pin muy cerca (a solo 90 metros)
    await page.evaluate(() => {
        const est = window.guessrEstadioCorrecto;
        if (est) {
            const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
            const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
            window.guessrSelectedLatLng = { lat: lat + 0.0009, lng: lng - 0.0006 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    await setTikTokSticker('¡A SOLO 95 METROS! 🎯 4.992 PUNTOS 🤯🔥', '#00e676', '#000');
    await new Promise(r => setTimeout(r, 3800));

    // ==========================================
    // PARTE 4: RONDA 2 - SEGUNDO ESTADIO (18s a 26s)
    // ==========================================
    console.log("Parte 4: Ronda 2...");
    await page.evaluate(() => {
        if (typeof window.avanzarDeRondaGuessr === 'function') {
            window.avanzarDeRondaGuessr();
        }
        // Ocultar mapa nuevamente al inicio de ronda
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.opacity = '0';
            mapBox.style.transform = 'translateY(150%)';
        }
    });

    await setTikTokSticker('RONDA 2: ESTA ES DIFÍCIL... ¿QUÉ ESTADIO ES? ⚽👀', '#fde047', '#000');
    await new Promise(r => setTimeout(r, 4000));

    // Aparece el mapa y pincha
    await page.evaluate(() => {
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.opacity = '1';
            mapBox.style.transform = 'translateY(0)';
        }
        const est = window.guessrEstadioCorrecto;
        if (est) {
            const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
            const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
            window.guessrSelectedLatLng = { lat: lat + 0.0005, lng: lng + 0.0004 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    await setTikTokSticker('¡CLAVADO AL CENTRO! 4.998 PTS ⚡👑', '#00e676', '#000');
    await new Promise(r => setTimeout(r, 3500));

    // ==========================================
    // PARTE 5: CIERRE Y LLAMADO A LA ACCIÓN (26s a 30s)
    // ==========================================
    console.log("Parte 5: Cierre viral...");
    await page.evaluate(() => {
        const sticker = document.getElementById('tiktok-hud-sticker');
        if (sticker) {
            sticker.innerHTML = `
                <div style="background:#00e676; color:#000; font-weight:900; font-size:16px; padding:14px 18px; border-radius:16px; box-shadow:0 12px 35px rgba(0,230,118,0.6); font-family:system-ui; border:3px solid #fff; text-align:center;">
                    🏆 ¿Y VOS CUÁNTOS METROS SACÁS?<br>
                    <span style="font-size:13px; font-weight:800; color:#064e3b;">JUGALO GRATIS AHORA EN:</span><br>
                    <span style="font-size:17px; font-weight:900; text-decoration:underline;">estadiosvirtuales.com</span>
                </div>
            `;
        }
    });
    await new Promise(r => setTimeout(r, 4000));

    // FINALIZAR GRABACIÓN
    console.log("Finalizando grabación...");
    clearInterval(frameTicker);
    await client.send('Page.stopScreencast');
    ffmpeg.stdin.end();

    await new Promise(r => ffmpeg.on('close', r));
    await browser.close();
    server.close();

    fs.copyFileSync(destDesktop, destDownloads);
    console.log("¡VIDEO 1 FINALIZADO CON ÉXITO!");
    console.log("- Guardado en:", destDesktop);
});
