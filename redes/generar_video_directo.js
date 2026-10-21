const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("Iniciando generación automática de video TikTok para @estadiosvirtuales...");
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

    const browser = await puppeteer.launch({
        executablePath: executablePath,
        headless: 'new',
        args: [
            '--autoplay-policy=no-user-gesture-required',
            '--disable-web-security',
            '--allow-file-access-from-files',
            '--window-size=1200,900'
        ]
    });

    const page = await browser.newPage();
    const filePath = path.resolve(__dirname, 'tiktok_studio.html');
    await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

    console.log("Página cargada en Chrome headless. Grabando 30 segundos a 60 FPS con audio...");
    await page.evaluate(() => {
        window.iniciarGrabacionYDescarga();
    });

    // Esperar a que la animación de 30 segundos termine y el blob esté listo
    await page.waitForFunction(() => window.videoDone === true, { timeout: 60000 });

    const base64Data = await page.evaluate(() => window.videoBase64);
    await browser.close();

    console.log("Extrayendo video...");
    const base64Video = base64Data.replace(/^data:video\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Video, 'base64');

    const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', 'stadiumguessr_tiktok_30s.webm');
    const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', 'stadiumguessr_tiktok_30s.webm');

    fs.writeFileSync(destDownloads, buffer);
    fs.writeFileSync(destDesktop, buffer);

    console.log("SUCCESS");
    console.log(`Escritorio: ${destDesktop}`);
    console.log(`Descargas: ${destDownloads}`);
}

run().catch(err => {
    console.error("Error al generar video:", err);
    process.exit(1);
});
