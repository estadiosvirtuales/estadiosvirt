const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🥊 [Duelo de Capacidad] Iniciando generación de video: RACING vs INDEPENDIENTE...');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputFolder = "E:\\Google earth studio\\videos para mostrar\\Argentina\\DUELO-AVELLANEDA";
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// 1. GENERAR PISTA DE AUDIO PROCEDURAL (20 SEGUNDOS)
function generarAudioProcedural(duracionSeg = 20.0, sampleRate = 44100) {
    const totalSamples = Math.floor(duracionSeg * sampleRate);
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
        addTone(startSec, 0.06, 1200, 0.35, 25);
    }

    // 0.2s: Whoosh épico de apertura
    addWhoosh(0.2, 0.8, 0.4);

    // 1.0s: Campana de inicio de duelo
    addBellDing(1.0, 784);

    // 11s, 12s, 13s: Cuenta regresiva (Tics intensos)
    addTick(11.0);
    addTick(12.0);
    addTick(13.0);

    // 14.0s: Whoosh fuerte + Revelación triunfal
    addWhoosh(13.8, 0.5, 0.4);
    addBellDing(14.0, 1046.5); // C6 campana

    // 14.1s: Fanfarria de victoria
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(14.1 + idx * 0.07, 3.0, freq, 0.35, 1.8);
    });

    // 14.5s - 20s: Clima de hinchada y aplausos
    for (let i = 0; i < 5; i++) {
        addWhoosh(14.5 + i * 1.1, 1.6, 0.25);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// 2. GENERAR PLACAS GRÁFICAS DE 1080x1920 CON PUPPETEER
async function generarOverlaysGraficos() {
    console.log('🎨 Generando overlays transparentes con Puppeteer...');
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const racingEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Racing.webp')).toString('base64');
    const indepEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Independiente.webp')).toString('base64');
    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    function getBaseHTML(contenidoCentro) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body { background: transparent; width: 1080px; height: 1920px; position: relative; overflow: hidden; }

                /* HEADER SUPERIOR */
                #header-box {
                    position: absolute;
                    top: 45px;
                    left: 50px;
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.94) 0%, rgba(8, 14, 24, 0.98) 100%);
                    border: 2px solid rgba(0, 230, 118, 0.5);
                    border-top: 3px solid rgba(0, 255, 119, 0.9);
                    border-radius: 28px;
                    padding: 16px 20px;
                    text-align: center;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 230, 118, 0.25);
                }
                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 230, 118, 0.14);
                    border: 1.5px solid rgba(0, 230, 118, 0.7);
                    color: #00ff77;
                    font-size: 19px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    padding: 5px 18px;
                    border-radius: 30px;
                    margin-bottom: 6px;
                }
                .header-title {
                    color: #ffffff;
                    font-size: 46px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                    margin-bottom: 4px;
                }
                .header-sub {
                    color: #ffd700;
                    font-size: 24px;
                    font-weight: 700;
                }

                /* ETIQUETAS DE CLUBES */
                .club-pill {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: linear-gradient(135deg, rgba(11, 19, 32, 0.92) 0%, rgba(5, 10, 18, 0.96) 100%);
                    border: 2px solid rgba(255, 255, 255, 0.18);
                    border-radius: 22px;
                    padding: 12px 24px;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.8);
                }
                .club-pill.racing {
                    top: 240px;
                    left: 50px;
                    border-left: 6px solid #00b0ff;
                }
                .club-pill.indep {
                    top: 1010px;
                    left: 50px;
                    border-left: 6px solid #ff3344;
                }
                .club-logo {
                    width: 65px;
                    height: 65px;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6));
                }
                .club-info-name {
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 900;
                    line-height: 1.1;
                }
                .club-info-stadium {
                    color: #94a3b8;
                    font-size: 20px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            </style>
        </head>
        <body>
            <div id="header-box">
                <div class="header-badge">🥊 Duelo de Capacidad · Avellaneda</div>
                <div class="header-title">¿CUÁL TIENE MÁS CAPACIDAD?</div>
                <div class="header-sub">Separados por tan solo 300 metros</div>
            </div>

            <div class="club-pill racing">
                <img src="${racingEscudo}" class="club-logo">
                <div>
                    <div class="club-info-name">RACING CLUB</div>
                    <div class="club-info-stadium">El Cilindro</div>
                </div>
            </div>

            <div class="club-pill indep">
                <img src="${indepEscudo}" class="club-logo">
                <div>
                    <div class="club-info-name">INDEPENDIENTE</div>
                    <div class="club-info-stadium">Libertadores de América</div>
                </div>
            </div>

            ${contenidoCentro}
        </body>
        </html>
        `;
    }

    const assetsDir = path.join(__dirname, 'assets_vs');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. FASE VOTACIÓN (VS BANNER)
    const htmlVotacion = getBaseHTML(`
        <div style="position:absolute; top:915px; left:50px; width:980px; display:flex; align-items:center; justify-content:center; gap:20px;">
            <div style="flex:1; height:3px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
            <div style="background:linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color:#0b111e; width:90px; height:90px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:38px; font-weight:900; border:4px solid #ffffff; box-shadow:0 0 30px rgba(255,190,0,0.6);">VS</div>
            <div style="flex:1; height:3px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
            <div style="position:absolute; top:95px; background:rgba(0,0,0,0.85); border:1.5px solid rgba(255,215,0,0.7); border-radius:20px; padding:6px 20px; color:#ffffff; font-size:19px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">¿Cuál es más grande? Votá en comentarios 🗳️</div>
        </div>
    `);
    await page.setContent(htmlVotacion, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_votacion.png'), omitBackground: true });
    console.log('✅ Asset creado: overlay_votacion.png');

    // 2. FASE CUENTA REGRESIVA 3, 2, 1
    for (const num of [3, 2, 1]) {
        const htmlCount = getBaseHTML(`
            <div style="position:absolute; top:890px; left:50%; transform:translateX(-50%); width:140px; height:140px; border-radius:50%; background:radial-gradient(circle, #ff3344 0%, #aa0011 100%); border:5px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:80px; font-weight:900; color:#ffffff; box-shadow:0 0 45px rgba(255,51,68,0.9);">${num}</div>
        `);
        await page.setContent(htmlCount, { timeout: 5000 });
        await page.screenshot({ path: path.join(assetsDir, `overlay_count_${num}.png`), omitBackground: true });
        console.log(`✅ Asset creado: overlay_count_${num}.png`);
    }

    // 3. FASE REVELACIÓN
    const htmlRevelacion = getBaseHTML(`
        <!-- RACING GANADOR -->
        <div style="position:absolute; top:790px; left:50px; width:980px; background:linear-gradient(135deg, rgba(0, 230, 118, 0.96) 0%, rgba(0, 180, 80, 0.98) 100%); border:3px solid #ffffff; border-radius:24px; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 16px 40px rgba(0,0,0,0.8), 0 0 35px rgba(0, 230, 118, 0.5);">
            <div style="display:flex; align-items:center; gap:16px; color:#04160a;">
                <img src="${racingEscudo}" style="width:60px;height:60px;object-fit:contain;">
                <div>
                    <div style="background:#04160a; color:#00ff77; font-size:16px; font-weight:900; padding:4px 12px; border-radius:12px; text-transform:uppercase; letter-spacing:1.5px; display:inline-block;">🏆 GANADOR</div>
                    <div style="font-size:34px; font-weight:900;">RACING CLUB</div>
                </div>
            </div>
            <div style="font-size:46px; font-weight:900; color:#04160a; letter-spacing:-0.5px;">51.000 esp.</div>
        </div>

        <!-- BANNER DIFERENCIA -->
        <div style="position:absolute; top:925px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #ffd700 0%, #ff9900 100%); color:#04160a; padding:12px 30px; border-radius:30px; font-size:26px; font-weight:900; border:3px solid #ffffff; box-shadow:0 10px 30px rgba(255,180,0,0.6); white-space:nowrap; text-transform:uppercase; letter-spacing:0.5px;">¡RACING POR CASI 9.000 LUGARES!</div>

        <!-- INDEPENDIENTE SEGUNDO -->
        <div style="position:absolute; top:1045px; left:50px; width:980px; background:linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%); border:2px solid rgba(255, 255, 255, 0.25); border-radius:24px; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 16px 40px rgba(0,0,0,0.8);">
            <div style="display:flex; align-items:center; gap:16px; color:#ffffff;">
                <img src="${indepEscudo}" style="width:60px;height:60px;object-fit:contain;">
                <div style="font-size:32px;font-weight:900;">INDEPENDIENTE</div>
            </div>
            <div style="font-size:44px; font-weight:900; color:#cbd5e1;">42.069 esp.</div>
        </div>

        <!-- CTA INFERIOR -->
        <div style="position:absolute; bottom:45px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:22px; padding:16px 24px; display:flex; align-items:center; justify-content:center; gap:14px; box-shadow:0 16px 40px rgba(0,0,0,0.8), 0 0 25px rgba(0, 230, 118, 0.4);">
            <img src="${logoEv}" style="width:44px; height:44px; border-radius:10px;">
            <span style="color:#04160a; font-size:26px; font-weight:900; letter-spacing:-0.3px;">Desafiá tu conocimiento en estadiosvirtuales.com</span>
        </div>
    `);
    await page.setContent(htmlRevelacion, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_revelacion.png'), omitBackground: true });
    console.log('✅ Asset creado: overlay_revelacion.png');

    await browser.close();
    return assetsDir;
}

// 3. RENDERIZAR VIDEO FINAL CON FFMPEG
async function ejecutar() {
    const assetsDir = await generarOverlaysGraficos();

    const tempAudioPath = path.join(__dirname, 'temp_audio_vs.wav');
    fs.writeFileSync(tempAudioPath, generarAudioProcedural(20.0));

    const videoRacing = "E:\\Google earth studio\\videos para mostrar\\Argentina\\CILINDRO-AVELLANEDA\\Estadio_Cilindro_De_Avellaneda_Racing.mp4";
    const videoIndep = "E:\\Google earth studio\\videos para mostrar\\Argentina\\LIBERTADORES-DE-AMERICA\\Estadio_Libertadores_De_America_Independiente.mp4";

    const outputName = 'Duelo_Capacidad_Racing_vs_Independiente.mp4';
    const outputDownloads = path.join(process.env.USERPROFILE, 'Downloads', outputName);
    const outputDesktop = path.join(process.env.USERPROFILE, 'Desktop', outputName);
    const outputProject = path.join(outputFolder, outputName);

    const assetVotacion = path.join(assetsDir, 'overlay_votacion.png');
    const assetC3 = path.join(assetsDir, 'overlay_count_3.png');
    const assetC2 = path.join(assetsDir, 'overlay_count_2.png');
    const assetC1 = path.join(assetsDir, 'overlay_count_1.png');
    const assetRevelacion = path.join(assetsDir, 'overlay_revelacion.png');

    // FILTRO FFMPEG
    const filterComplex = [
        // 1. Escalar y recortar ambos videos a 1080x960
        `[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[top]`,
        `[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[bot]`,

        // 2. Apilarlos verticalmente en pantalla 1080x1920
        `[top][bot]vstack=inputs=2[stacked]`,

        // 3. Línea divisoria central sutil
        `[stacked]drawbox=x=0:y=956:w=1080:h=8:color=0x00e676@0.9:t=fill[base]`,

        // 4. Overlays temporizados de pantalla completa (1080x1920)
        `[base][3:v]overlay=0:0:enable='between(t,0,11.0)'[v1]`,
        `[v1][4:v]overlay=0:0:enable='between(t,11.0,12.0)'[v2]`,
        `[v2][5:v]overlay=0:0:enable='between(t,12.0,13.0)'[v3]`,
        `[v3][6:v]overlay=0:0:enable='between(t,13.0,14.0)'[v4]`,
        `[v4][7:v]overlay=0:0:enable='between(t,14.0,20.0)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '20',
        '-i', videoRacing,      // 0:v
        '-i', videoIndep,       // 1:v
        '-i', tempAudioPath,    // 2:a
        '-i', assetVotacion,    // 3:v
        '-i', assetC3,          // 4:v
        '-i', assetC2,          // 5:v
        '-i', assetC1,          // 6:v
        '-i', assetRevelacion,  // 7:v
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '2:a',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-movflags', '+faststart',
        outputDownloads
    ];

    console.log('🎬 Renderizando video final Duelo de Avellaneda en 1080x1920 Full HD...');
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let stderr = '';
    ffmpeg.stderr.on('data', (d) => {
        const msg = d.toString();
        stderr += msg;
        const match = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
        if (match) {
            process.stdout.write(`\r⏱️ Progreso: ${match[1]} / 00:00:20.00`);
        }
    });

    ffmpeg.on('close', (code) => {
        if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);

        if (code === 0) {
            fs.copyFileSync(outputDownloads, outputDesktop);
            if (fs.existsSync(path.dirname(outputProject))) {
                fs.copyFileSync(outputDownloads, outputProject);
            }
            console.log(`\n\n🎉 ¡VIDEO DE DUELO GENERADO CON ÉXITO!`);
            console.log(`📂 Descargas: ${outputDownloads}`);
            console.log(`📂 Escritorio: ${outputDesktop}`);
            console.log(`📂 Carpeta E: ${outputProject}`);
            const stat = fs.statSync(outputDownloads);
            console.log(`📊 Tamaño: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
        } else {
            console.error(`\n❌ Error al renderizar ffmpeg. Código: ${code}`);
            console.error(stderr);
        }
    });
}

ejecutar().catch(err => {
    console.error('❌ Error general:', err);
});
