const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Iniciando creación completa del pack para: ESTADIO MARACANÁ (BRASIL)...');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputFolder = "E:\\Google earth studio\\videos para mostrar\\MARACANA-BRASIL";
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// 1. GENERAR PISTA DE AUDIO PROCEDURAL (25 SEGUNDOS)
function generarAudioProcedural(duracionSeg = 25.0, sampleRate = 44100) {
    const totalSamples = Math.floor(duracionSeg * sampleRate);
    const dataSize = totalSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
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

    function addWhoosh(startSec, durSec = 0.5, volume = 0.3) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(durSec * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / count;
            const env = Math.sin(Math.PI * t);
            samples[start + i] += (Math.random() * 2 - 1) * env * volume;
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

    addWhoosh(0.2, 0.8, 0.35);
    addBellDing(3.5, 880);
    addBellDing(7.5, 987.77);
    addBellDing(11.5, 1174.66);

    addTick(16.0);
    addTick(17.0);
    addTick(18.0);
    addTick(19.0);

    addWhoosh(19.4, 0.4, 0.4);
    addPinPop(19.6);

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(20.0 + idx * 0.06, 3.5, freq, 0.35, 1.5);
    });

    for (let i = 0; i < 4; i++) {
        addWhoosh(20.5 + i * 1.1, 1.8, 0.22);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

const tempAudioPath = path.join(__dirname, 'temp_audio_maracana.wav');
fs.writeFileSync(tempAudioPath, generarAudioProcedural(25.0));
console.log('✅ 1. Audio procedural generado.');

// 2. CAPTURAR MAPA REALISTA DE MARACANÁ CON LEAFLET
async function generarAssets() {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();

    // MAPA
    await page.setViewport({ width: 960, height: 460, deviceScaleFactor: 2 });
    const targetLat = -22.91216;
    const targetLng = -43.23018;
    // Tiro a 435 metros
    const userLat = -22.9088;
    const userLng = -43.2280;

    const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: transparent; overflow: hidden; width: 960px; height: 460px; }
            #map-card {
                position: relative;
                width: 960px;
                height: 460px;
                border-radius: 28px;
                overflow: hidden;
                border: 4px solid #00e676;
                box-shadow: 0 16px 50px rgba(0, 230, 118, 0.35), 0 0 0 2px rgba(0,0,0,0.8);
            }
            #map { width: 100%; height: 100%; background: #111; }
            .score-badge {
                position: absolute;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.94);
                border: 2px solid #00e676;
                color: #00e676;
                padding: 10px 26px;
                border-radius: 30px;
                font-size: 24px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.7);
            }
            .score-badge span { color: #fff; }
            .bottom-badge {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.94);
                border: 1px solid rgba(255,255,255,0.25);
                color: #ffd700;
                padding: 8px 24px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: 700;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            }
            .user-pin {
                width: 32px;
                height: 32px;
                background: #ff3b30;
                border: 4px solid #fff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(0,0,0,0.7);
            }
        </style>
    </head>
    <body>
        <div id="map-card">
            <div class="score-badge">🎯 ¡A 435 METROS! · <span>4.480 PUNTOS 🔥</span></div>
            <div id="map"></div>
            <div class="bottom-badge">📍 Río de Janeiro, Brasil · ESTADIO MARACANÁ</div>
        </div>
        <script>
            const userPos = [${userLat}, ${userLng}];
            const targetPos = [${targetLat}, ${targetLng}];
            const centerLat = (userPos[0] + targetPos[0]) / 2;
            const centerLng = (userPos[1] + targetPos[1]) / 2;

            const map = L.map('map', { attributionControl: false, zoomControl: false }).setView([centerLat, centerLng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            L.polyline([userPos, targetPos], { color: '#ff3b30', weight: 4, dashArray: '8, 8', opacity: 0.95 }).addTo(map);

            L.circleMarker(targetPos, { radius: 14, color: '#00e676', fillColor: '#090e17', fillOpacity: 1, weight: 4 }).addTo(map);
            L.circleMarker(targetPos, { radius: 35, color: '#00e676', fillColor: '#00e676', fillOpacity: 0.2, weight: 2 }).addTo(map);

            const pinIcon = L.divIcon({ className: 'custom-pin-wrap', html: '<div class=\"user-pin\"></div>', iconSize: [32, 32], iconAnchor: [16, 32] });
            L.marker(userPos, { icon: pinIcon }).addTo(map);
        </script>
    </body>
    </html>`;

    await page.setContent(mapHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1400));
    const mapCardEl = await page.$('#map-card');
    await mapCardEl.screenshot({ path: path.join(__dirname, 'mapa_maracana_card.png'), omitBackground: true });
    console.log('✅ 2. Mapa Leaflet de Maracaná generado.');

    // UI CARDS (Header, Pistas, Revelación)
    await page.setViewport({ width: 1080, height: 2400, deviceScaleFactor: 1 });
    const uiHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: transparent; padding: 20px; display: flex; flex-direction: column; gap: 40px; align-items: center; }

            .header-container {
                width: 980px;
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.94) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2px solid rgba(0, 255, 119, 0.45);
                border-top: 2.5px solid rgba(110, 255, 180, 0.85);
                border-radius: 28px;
                padding: 18px 24px;
                text-align: center;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 255, 119, 0.25);
            }
            .hero-eyebrow {
                display: inline-block;
                background: rgba(0, 255, 119, 0.12);
                border: 1.5px solid rgba(0, 255, 119, 0.6);
                color: #00ff77;
                font-size: 22px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 6px 22px;
                border-radius: 30px;
                margin-bottom: 10px;
            }
            .title { color: #ffffff; font-size: 52px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 6px; }
            .subtitle { color: #ffd700; font-size: 28px; font-weight: 700; }

            .clue-group { display: flex; flex-direction: column; gap: 14px; width: 980px; }
            .clue-card {
                width: 980px;
                height: 94px;
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(10, 15, 26, 0.98) 100%);
                border: 1.5px solid rgba(255, 255, 255, 0.12);
                border-radius: 20px;
                display: flex;
                align-items: center;
                padding: 0 24px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                position: relative;
                overflow: hidden;
            }
            .clue-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; }
            .clue-icon { font-size: 38px; margin-right: 18px; }
            .clue-text { color: #ffffff; font-size: 34px; font-weight: 800; }
            .clue-tag { font-weight: 900; margin-right: 10px; }

            .reveal-banner {
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2px solid #00ff77;
                border-radius: 24px;
                padding: 12px 36px;
                display: inline-flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 8px 30px rgba(0, 255, 119, 0.35);
            }
            .reveal-text { color: #00ff77; font-size: 42px; font-weight: 900; }
            .club-tag { color: #ffffff; font-size: 32px; font-weight: 700; background: rgba(255, 255, 255, 0.14); padding: 4px 16px; border-radius: 12px; }

            .btn-cta {
                display: inline-block;
                background: linear-gradient(135deg, #00ff77 0%, #00c853 100%);
                color: #090e17;
                font-size: 28px;
                font-weight: 900;
                padding: 16px 40px;
                border-radius: 22px;
                box-shadow: 0 8px 25px rgba(0, 255, 119, 0.4);
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <div class="header-container" id="ui-header">
            <div class="hero-eyebrow">ESTADIOS VIRTUALES · STADIUMGUESSR</div>
            <div class="title">¿QUÉ ESTADIO ES ESTE?</div>
            <div class="subtitle">¿En cuántos segundos podés adivinarlo?</div>
        </div>

        <div class="clue-group" id="ui-pistas-1">
            <div class="clue-card">
                <div class="clue-indicator" style="background:#00ff77; box-shadow: 0 0 15px #00ff77;"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag" style="color:#00ff77;">PISTA 1:</span> Capacidad para 78.838 hinchas</div>
            </div>
        </div>

        <div class="clue-group" id="ui-pistas-2">
            <div class="clue-card">
                <div class="clue-indicator" style="background:#00ff77; box-shadow: 0 0 15px #00ff77;"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag" style="color:#00ff77;">PISTA 1:</span> Capacidad para 78.838 hinchas</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:#38bdf8; box-shadow: 0 0 15px #38bdf8;"></div>
                <div class="clue-icon">🏆</div>
                <div class="clue-text"><span class="clue-tag" style="color:#38bdf8;">PISTA 2:</span> Sede de 2 finales de Copa del Mundo</div>
            </div>
        </div>

        <div class="clue-group" id="ui-pistas-3">
            <div class="clue-card">
                <div class="clue-indicator" style="background:#00ff77; box-shadow: 0 0 15px #00ff77;"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag" style="color:#00ff77;">PISTA 1:</span> Capacidad para 78.838 hinchas</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:#38bdf8; box-shadow: 0 0 15px #38bdf8;"></div>
                <div class="clue-icon">🏆</div>
                <div class="clue-text"><span class="clue-tag" style="color:#38bdf8;">PISTA 2:</span> Sede de 2 finales de Copa del Mundo</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:#ffd700; box-shadow: 0 0 15px #ffd700;"></div>
                <div class="clue-icon">⭐</div>
                <div class="clue-text"><span class="clue-tag" style="color:#ffd700;">PISTA 3:</span> Gol de Di María y campeón 2021</div>
            </div>
        </div>

        <div class="reveal-banner" id="ui-reveal-title">
            <span class="reveal-text">ESTADIO MARACANÁ</span>
            <span class="club-tag">FLAMENGO · FLUMINENSE</span>
        </div>

        <div class="btn-cta" id="ui-cta-btn">
            JUGÁ GRATIS EN EL LINK DEL PERFIL
        </div>
    </body>
    </html>`;

    await page.setContent(uiHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const elements = [
        { id: '#ui-header', file: 'ui_header_maracana.png' },
        { id: '#ui-pistas-1', file: 'ui_pistas_1_maracana.png' },
        { id: '#ui-pistas-2', file: 'ui_pistas_2_maracana.png' },
        { id: '#ui-pistas-3', file: 'ui_pistas_3_maracana.png' },
        { id: '#ui-reveal-title', file: 'ui_reveal_title_maracana.png' },
        { id: '#ui-cta-btn', file: 'ui_cta_btn_maracana.png' }
    ];

    for (const item of elements) {
        const el = await page.$(item.id);
        if (el) await el.screenshot({ path: path.join(__dirname, item.file), omitBackground: true });
    }
    console.log('✅ 3. Elementos UI de Maracaná generados.');

    await browser.close();
}

async function renderVideoYPortada() {
    await generarAssets();

    const brasilFolder = "E:\\Google earth studio\\Brasil";
    const videoFiles = fs.readdirSync(brasilFolder);
    const maracanaFile = videoFiles.find(f => f.toLowerCase().includes('maracan')) || 'Maracaná.mp4';
    const inputVideoPath = path.join(brasilFolder, maracanaFile);
    console.log(`🎬 Video de origen detectado: ${inputVideoPath} (existe: ${fs.existsSync(inputVideoPath)})`);
    const videoName = 'Estadio_Maracana_Brasil.mp4';
    const coverName = 'Portada_Estadio_Maracana.jpg';

    const destVideoFolderE = path.join(outputFolder, videoName);
    const destCoverFolderE = path.join(outputFolder, coverName);

    const destVideoDesktop = path.join(process.env.USERPROFILE, 'Desktop', videoName);
    const destCoverDesktop = path.join(process.env.USERPROFILE, 'Desktop', coverName);

    const destVideoDownloads = path.join(process.env.USERPROFILE, 'Downloads', videoName);
    const destCoverDownloads = path.join(process.env.USERPROFILE, 'Downloads', coverName);

    // FFMPEG
    const assets = [
        path.join(__dirname, 'ui_header_maracana.png'),       // 2:v
        path.join(__dirname, 'ui_pistas_1_maracana.png'),     // 3:v
        path.join(__dirname, 'ui_pistas_2_maracana.png'),     // 4:v
        path.join(__dirname, 'ui_pistas_3_maracana.png'),     // 5:v
        path.join(__dirname, 'ui_count_3.png'),               // 6:v
        path.join(__dirname, 'ui_count_2.png'),               // 7:v
        path.join(__dirname, 'ui_count_1.png'),               // 8:v
        path.join(__dirname, 'mapa_maracana_card.png'),        // 9:v
        path.join(__dirname, 'ui_reveal_title_maracana.png'), // 10:v
        path.join(__dirname, 'ui_cta_btn_maracana.png')        // 11:v
    ];

    const filterComplex = [
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg]`,
        `[0:v]scale=1080:608[fg]`,
        `[bg][fg]overlay=0:(H-h)/2[base]`,
        `[base][2:v]overlay=50:50[v_header]`,
        `[v_header][3:v]overlay=50:1330:enable='between(t,3.5,7.5)'[v_p1]`,
        `[v_p1][4:v]overlay=50:1330:enable='between(t,7.5,11.5)'[v_p2]`,
        `[v_p2][5:v]overlay=50:1330:enable='between(t,11.5,16.0)'[v_p3]`,
        `[v_p3][6:v]overlay=50:1340:enable='between(t,16.0,17.5)'[v_c3]`,
        `[v_c3][7:v]overlay=50:1340:enable='between(t,17.5,18.5)'[v_c2]`,
        `[v_c2][8:v]overlay=50:1340:enable='between(t,18.5,19.5)'[v_c1]`,
        `[v_c1][10:v]overlay=(W-w)/2:1240:enable='between(t,19.5,25)'[v_rev_title]`,
        `[9:v]scale=960:460[map_scaled]`,
        `[v_rev_title][map_scaled]overlay=60:1320:enable='between(t,19.5,25)'[v_map]`,
        `[v_map][11:v]overlay=(W-w)/2:1805:enable='between(t,19.5,25)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '25',
        '-i', inputVideoPath,
        '-i', tempAudioPath,
        '-i', assets[0],
        '-i', assets[1],
        '-i', assets[2],
        '-i', assets[3],
        '-i', assets[4],
        '-i', assets[5],
        '-i', assets[6],
        '-i', assets[7],
        '-i', assets[8],
        '-i', assets[9],
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
        destVideoDownloads
    ];

    console.log('🎬 4. Renderizando video Maracaná en 1080x1920 Full HD (25s)...');
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    ffmpeg.stderr.on('data', (data) => {
        const msg = data.toString();
        const match = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
        if (match) process.stdout.write(`\r⏱️ Progreso: ${match[1]} / 00:00:25.00`);
    });

    ffmpeg.on('close', async (code) => {
        if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);

        if (code === 0) {
            fs.copyFileSync(destVideoDownloads, destVideoDesktop);
            fs.copyFileSync(destVideoDownloads, destVideoFolderE);

            console.log(`\n\n🎉 ¡VIDEO DE MARACANÁ GENERADO CON ÉXITO!`);
            console.log(`📂 Carpeta E: ${destVideoFolderE}`);

            // 5. GENERAR PORTADA PARA MARACANÁ
            console.log('🎨 5. Generando portada para el Feed...');
            // Extraer frame
            const rawFramePath = path.join(__dirname, 'raw_maracana_snap.jpg');
            const extractSnap = spawn('ffmpeg', [
                '-y', '-ss', '00:00:04', '-i', destVideoDownloads,
                '-vframes', '1', '-q:v', '1', rawFramePath
            ]);

            extractSnap.on('close', async () => {
                const b = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
                const p = await b.newPage();
                await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

                const imgBuffer = fs.readFileSync(rawFramePath);
                const bgBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

                const coverHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                        body { width: 1080px; height: 1920px; overflow: hidden; position: relative; background: #090e17; }
                        .bg-drone {
                            position: absolute; top: 0; left: 0; width: 1080px; height: 1920px;
                            background-image: url('${bgBase64}'); background-size: cover; background-position: center;
                            filter: brightness(0.65) contrast(1.1);
                        }
                        .vignette-overlay {
                            position: absolute; top: 0; left: 0; width: 1080px; height: 1920px;
                            background: radial-gradient(circle at center, rgba(9, 14, 23, 0.2) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%),
                                        linear-gradient(180deg, rgba(9, 14, 23, 0.95) 0%, transparent 22%, transparent 75%, rgba(9, 14, 23, 0.98) 100%);
                        }
                        .safe-zone {
                            position: absolute; top: 240px; left: 50px; right: 50px; bottom: 240px;
                            display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; z-index: 10;
                        }
                        .brand-pill {
                            display: inline-flex; align-items: center; gap: 12px;
                            background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                            border: 2px solid rgba(0, 255, 119, 0.6); border-top: 2.5px solid rgba(110, 255, 180, 0.9);
                            border-radius: 35px; color: #00ff77; font-size: 24px; font-weight: 900; text-transform: uppercase;
                            letter-spacing: 2.5px; padding: 12px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 255, 119, 0.35);
                        }
                        .center-block { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
                        .difficulty-badge {
                            background: rgba(255, 215, 0, 0.15); border: 2px solid #ffd700; color: #ffd700;
                            font-size: 26px; font-weight: 900; letter-spacing: 1.5px; padding: 8px 24px; border-radius: 20px;
                            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                        }
                        .main-title {
                            color: #ffffff; font-size: 64px; font-weight: 900; line-height: 1.15; letter-spacing: -1px;
                            text-shadow: 0 4px 20px rgba(0,0,0,0.9), 0 0 35px rgba(0, 255, 119, 0.4); text-transform: uppercase;
                        }
                        .clue-box {
                            width: 100%; max-width: 900px;
                            background: linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(10, 15, 26, 0.96) 100%);
                            border: 1.5px solid rgba(255, 255, 255, 0.2); border-left: 10px solid #00ff77; border-radius: 24px;
                            padding: 24px 30px; box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85); display: flex; align-items: center; gap: 20px;
                        }
                        .clue-icon { font-size: 52px; filter: drop-shadow(0 2px 10px rgba(0,0,0,0.6)); }
                        .clue-desc { text-align: left; color: #f1f5f9; font-size: 32px; font-weight: 800; line-height: 1.35; }
                        .footer-block { display: flex; flex-direction: column; align-items: center; gap: 14px; }
                        .sub-question { color: #cbd5e1; font-size: 28px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.9); }
                        .cta-btn {
                            display: inline-flex; align-items: center; gap: 14px;
                            background: linear-gradient(135deg, #00ff77 0%, #00c853 100%); color: #090e17; font-size: 30px;
                            font-weight: 900; padding: 18px 45px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0, 255, 119, 0.45);
                        }
                    </style>
                </head>
                <body>
                    <div class="bg-drone"></div>
                    <div class="vignette-overlay"></div>
                    <div class="safe-zone">
                        <div class="brand-pill">ESTADIOS VIRTUALES · TRIVIA</div>
                        <div class="center-block">
                            <div class="difficulty-badge">ESTADIO MARACANÁ · BRASIL</div>
                            <div class="main-title">¿QUÉ ESTADIO ES ESTE?</div>
                            <div class="clue-box">
                                <div class="clue-icon">💡</div>
                                <div class="clue-desc">78.838 hinchas · 2 finales del Mundo · Sede histórica</div>
                            </div>
                        </div>
                        <div class="footer-block">
                            <div class="sub-question">¿En cuántos segundos podés adivinarlo? Comentá</div>
                            <div class="cta-btn">JUGÁ EN EL LINK DEL PERFIL</div>
                        </div>
                    </div>
                </body>
                </html>`;

                await p.setContent(coverHtml, { waitUntil: 'domcontentloaded' });
                await new Promise(r => setTimeout(r, 600));

                await p.screenshot({ path: destCoverDownloads, quality: 95, type: 'jpeg' });
                fs.copyFileSync(destCoverDownloads, destCoverDesktop);
                fs.copyFileSync(destCoverDownloads, destCoverFolderE);

                console.log(`✅ Portada guardada en: ${destCoverFolderE}`);
                await b.close();
                if (fs.existsSync(rawFramePath)) fs.unlinkSync(rawFramePath);
                console.log('\n🎉 ¡PACK COMPLETO DE MARACANÁ FINALIZADO!');
            });

        } else {
            console.error(`❌ Error en ffmpeg: ${code}`);
        }
    });
}

renderVideoYPortada().catch(console.error);
