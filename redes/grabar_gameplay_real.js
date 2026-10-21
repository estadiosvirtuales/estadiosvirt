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

server.listen(4890, async () => {
    console.log("Servidor local en http://localhost:4890");

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

    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'gameplay_real_stadiumguessr_tiktok.mp4');
    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', 'gameplay_real_stadiumguessr_tiktok.mp4');

    const ffmpeg = spawn(ffmpegPath, [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-r', '30',
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-movflags', '+faststart',
        destDesktop
    ]);

    const client = await page.target().createCDPSession();
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
        try {
            ffmpeg.stdin.write(Buffer.from(data, 'base64'));
            await client.send('Page.screencastFrameAck', { sessionId });
        } catch(e) {}
    });

    console.log("Cargando la web oficial...");
    await page.goto('http://localhost:4890/index.html', { waitUntil: 'domcontentloaded' });

    // Esperar a que se cargue el catálogo de Supabase
    console.log("Esperando catálogo de estadios...");
    await page.waitForFunction(() => window.catalogoGlobal && window.catalogoGlobal.length > 0, { timeout: 20000 });

    // Iniciar Screencast a resolución vertical Full HD
    await client.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 85,
        maxWidth: 720,
        maxHeight: 1280,
        everyNthFrame: 1
    });

    // Inyectar sticker TikTok de gancho
    await page.evaluate(() => {
        const hook = document.createElement('div');
        hook.id = 'tiktok-hook-banner';
        hook.innerHTML = `
            <div style="background:#fde047; color:#000; font-weight:900; font-size:15px; padding:8px 14px; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.6); text-align:center; font-family:system-ui; border:2px solid #000; letter-spacing:0.5px;">
                ¿SOS CAPAZ DE ADIVINAR ESTE ESTADIO? ⚽👀
            </div>
        `;
        hook.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:999999; pointer-events:none; width:90%; max-width:380px;';
        document.body.appendChild(hook);
    });

    await new Promise(r => setTimeout(r, 1500));

    // INICIAR STADIUMGUESSR
    console.log("Iniciando StadiumGuessr en modo solo...");
    await page.evaluate(() => {
        window.mostrarPasoDificultad('solo');
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
        window.confirmarDificultadYEliminarModal('medio');
    });

    // RONDA 1
    console.log("Ronda 1 en curso: reproduciendo vista aérea...");
    await new Promise(r => setTimeout(r, 5000));

    // Simular que el usuario pincha el mapa muy cerca del estadio
    await page.evaluate(() => {
        const est = window.guessrEstadioCorrecto;
        if (est) {
            const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
            const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
            window.guessrSelectedLatLng = { lat: lat + 0.0015, lng: lng - 0.001 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    console.log("Ronda 1 acertada. Mostrando resultado y puntos...");
    await new Promise(r => setTimeout(r, 4500));

    // RONDA 2
    console.log("Avanzando a Ronda 2...");
    await page.evaluate(() => {
        if (typeof window.avanzarDeRondaGuessr === 'function') {
            window.avanzarDeRondaGuessr();
        }
    });

    await new Promise(r => setTimeout(r, 5000));

    await page.evaluate(() => {
        const est = window.guessrEstadioCorrecto;
        if (est) {
            const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
            const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
            window.guessrSelectedLatLng = { lat: lat + 0.0008, lng: lng + 0.0005 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    console.log("Ronda 2 acertada.");
    await new Promise(r => setTimeout(r, 4500));

    // RONDA 3
    console.log("Avanzando a Ronda 3...");
    await page.evaluate(() => {
        if (typeof window.avanzarDeRondaGuessr === 'function') {
            window.avanzarDeRondaGuessr();
        }
    });

    await new Promise(r => setTimeout(r, 5000));

    await page.evaluate(() => {
        const est = window.guessrEstadioCorrecto;
        if (est) {
            const lat = parseFloat(String(window.bscarPropiedad(est, 'Latitud')).replace(',', '.'));
            const lng = parseFloat(String(window.bscarPropiedad(est, 'Longitud')).replace(',', '.'));
            window.guessrSelectedLatLng = { lat: lat + 0.0003, lng: lng - 0.0002 };
            if (typeof window.procesarArriesgoGuessr === 'function') {
                window.procesarArriesgoGuessr();
            }
        }
    });

    console.log("Ronda 3 acertada. Mostrando final...");
    await new Promise(r => setTimeout(r, 4000));

    // Banner de cierre viral
    await page.evaluate(() => {
        const banner = document.getElementById('tiktok-hook-banner');
        if (banner) {
            banner.innerHTML = `
                <div style="background:#00e676; color:#000; font-weight:900; font-size:16px; padding:12px 16px; border-radius:14px; box-shadow:0 8px 30px rgba(0,230,118,0.5); text-align:center; font-family:system-ui; border:2px solid #fff;">
                    👑 ¡PUNTAJE CASI PERFECTO!<br>
                    <span style="font-size:13px; font-weight:700;">¿Y vos cuántos sacás? Jugalo gratis en:<br><b>estadiosvirtuales.com</b></span>
                </div>
            `;
        }
    });

    await new Promise(r => setTimeout(r, 3500));

    console.log("Finalizando grabación...");
    await client.send('Page.stopScreencast');
    ffmpeg.stdin.end();

    await new Promise(r => ffmpeg.on('close', r));
    await browser.close();
    server.close();

    // Copiar a Downloads
    fs.copyFileSync(destDesktop, destDownloads);

    console.log("¡VIDEO REAL DE LA WEB GENERADO CON ÉXITO!");
    console.log("- Escritorio:", destDesktop);
    console.log("- Descargas:", destDownloads);
});
