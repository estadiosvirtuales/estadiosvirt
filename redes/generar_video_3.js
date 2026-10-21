const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

const PORT = 4993;
server.listen(PORT, async () => {
    console.log(`Servidor Video 3 en http://localhost:${PORT}`);

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
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'tiktok_3_desafio_champions.mp4');
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', 'tiktok_3_desafio_champions.mp4');

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

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 20000 });

    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 85,
        maxWidth: 720,
        maxHeight: 1280,
        everyNthFrame: 1
    });

    const frameTicker = setInterval(() => {
        if (latestFrame) {
            ffmpeg.stdin.write(latestFrame);
        }
    }, FRAME_INTERVAL_MS);

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

    // Gancho inicial
    console.log("Iniciando Video 3 (Especial Champions League / Europa)...");
    await setTikTokSticker('¿FANÁTICO DE LA CHAMPIONS? ADIVINÁ ESTOS ESTADIOS EN 5s 🇪🇺🏆');
    await new Promise(r => setTimeout(r, 3200));

    // Entrar a StadiumGuessr
    await page.evaluate(() => {
        window.mostrarPasoDificultad('solo');
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
        window.confirmarDificultadYEliminarModal('medio');
    });

    // RONDA 1
    console.log("Ronda 1 Europa...");
    await page.evaluate(() => {
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.transition = 'all 0.4s ease';
            mapBox.style.opacity = '0';
            mapBox.style.transform = 'translateY(150%)';
        }
    });

    await setTikTokSticker('RONDA 1: ESTA CANCHA ES HISTÓRICA... ¿SABÉS CUÁL ES? 🏟️👀', '#38bdf8', '#000');
    await new Promise(r => setTimeout(r, 5500));

    // Deslizar mapa y clavar pin
    await setTikTokSticker('¡CLAVÁ EL PIN EN EL MAPA! 📍🎯', '#fde047', '#000');
    await page.evaluate(() => {
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.opacity = '1';
            mapBox.style.transform = 'translateY(0)';
        }
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
        const est = window.guessrEstadioCorrecto;
        if (est) {
            const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
            const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
            window.guessrSelectedLatLng = { lat: lat + 0.0007, lng: lng - 0.0005 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    await setTikTokSticker('¡A SOLO 75 METROS! 🎯 4.995 PUNTOS 🤯🔥', '#00e676', '#000');
    await new Promise(r => setTimeout(r, 4500));

    // RONDA 2
    console.log("Ronda 2 Europa...");
    await page.evaluate(() => {
        if (typeof window.avanzarDeRondaGuessr === 'function') {
            window.avanzarDeRondaGuessr();
        }
        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox) {
            mapBox.style.opacity = '0';
            mapBox.style.transform = 'translateY(150%)';
        }
    });

    await setTikTokSticker('RONDA 2: PISTA... QUEDA EN ITALIA O ESPAÑA 🇪🇸🇮🇹', '#fde047', '#000');
    await new Promise(r => setTimeout(r, 5500));

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
            window.guessrSelectedLatLng = { lat: lat + 0.0004, lng: lng + 0.0003 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    await setTikTokSticker('¡IMPECABLE! 4.998 PTS ⚡👑', '#00e676', '#000');
    await new Promise(r => setTimeout(r, 4000));

    // CIERRE VIRAL
    console.log("Cierre viral Europa...");
    await page.evaluate(() => {
        const sticker = document.getElementById('tiktok-hud-sticker');
        if (sticker) {
            sticker.innerHTML = `
                <div style="background:#00e676; color:#000; font-weight:900; font-size:16px; padding:14px 18px; border-radius:16px; box-shadow:0 12px 35px rgba(0,230,118,0.6); font-family:system-ui; border:3px solid #fff; text-align:center;">
                    🏆 ¿CUÁNTAS CANCHAS SACÁS VOS?<br>
                    <span style="font-size:13px; font-weight:800; color:#064e3b;">JUGÁ GRATIS CON AMIGOS EN:</span><br>
                    <span style="font-size:17px; font-weight:900; text-decoration:underline;">estadiosvirtuales.com</span>
                </div>
            `;
        }
    });
    await new Promise(r => setTimeout(r, 4500));

    clearInterval(frameTicker);
    await client.send('Page.stopScreencast');
    ffmpeg.stdin.end();

    await new Promise(r => ffmpeg.on('close', r));
    await browser.close();
    server.close();

    fs.copyFileSync(destDesktop, destDownloads);
    console.log("¡VIDEO 3 FINALIZADO CON ÉXITO!");
    console.log("- Guardado en:", destDesktop);
});
