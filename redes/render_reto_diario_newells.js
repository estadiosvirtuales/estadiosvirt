const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 MUESTRA 2: FORMATO RETO DIARIO / WORDLE');
console.log('🚀 ESTADIO OBJETIVO: COLOSO MARCELO BIELSA (NEWELL\'S)');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\RETO DIARIO\\NEWELLS-COLOSO-BIELSA";
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const assetsDir = path.join(__dirname, 'assets_reto_diario');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. GENERADOR DE AUDIO PROCEDURAL (22 SEGUNDOS)
function generarAudioProcedural(duracionSeg = 22.0, sampleRate = 44100) {
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

    function addBuzzer(startSec) {
        // Sonido de intento fallido suave
        addTone(startSec, 0.25, 220, 0.4, 4);
        addTone(startSec + 0.08, 0.25, 196, 0.45, 4);
    }

    function addDing(startSec, freq = 880) {
        addTone(startSec, 0.6, freq, 0.35, 4);
    }

    function addTick(startSec) {
        addTone(startSec, 0.06, 1200, 0.35, 25);
    }

    // 0.2s: Whoosh apertura
    addWhoosh(0.2, 0.7, 0.4);
    addDing(0.8, 659.25);

    // 1.8s: Intento 1 (Colón) -> Falla
    addBuzzer(1.8);

    // 5.5s: Intento 2 (Rosario Central) -> Falla cerca
    addWhoosh(5.0, 0.4, 0.25);
    addBuzzer(5.5);

    // 9.5s: Intento 3 (Newell's) -> Entra
    addWhoosh(9.0, 0.4, 0.25);
    addTick(10.5);
    addTick(11.5);
    addTick(12.2);

    // 13.0s: ACIERTO TOTAL (Campanada triunfal + Fanfarria)
    addWhoosh(12.8, 0.6, 0.45);
    addDing(13.0, 1046.5); // C6

    // 13.1s: Fanfarria de victoria
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        addTone(13.1 + idx * 0.08, 3.5, freq, 0.35, 1.6);
    });

    // 14.0s - 22.0s: Ovación de hinchada
    for (let i = 0; i < 6; i++) {
        addWhoosh(14.0 + i * 1.3, 1.8, 0.25);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// 2. GENERADOR DE OVERLAYS PUPPETEER (ESTILO WORDLE)
async function generarOverlaysRetoDiario() {
    console.log('🎨 Generando placas y overlays estilo Wordle con Puppeteer...');

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const colonEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Colon.webp')).toString('base64');
    const centralEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Rosario Central.webp')).toString('base64');
    const newellsEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Newells.webp')).toString('base64');
    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    function getBaseLayout(gridContent, extraElements = '') {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body {
                    width: 1080px;
                    height: 1920px;
                    position: relative;
                    overflow: hidden;
                    background: transparent;
                }

                /* HEADER RETO DIARIO */
                #header-box {
                    position: absolute;
                    top: 55px;
                    left: 50px;
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                    border: 2.5px solid rgba(0, 230, 118, 0.6);
                    border-top: 3.5px solid rgba(0, 255, 119, 0.9);
                    border-radius: 28px;
                    padding: 18px 24px;
                    text-align: center;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 230, 118, 0.25);
                }
                .badge-daily {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 230, 118, 0.16);
                    border: 1.5px solid rgba(0, 230, 118, 0.7);
                    color: #00ff77;
                    font-size: 20px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    padding: 6px 20px;
                    border-radius: 30px;
                    margin-bottom: 6px;
                }
                .main-hook {
                    color: #ffffff;
                    font-size: 46px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                    margin-bottom: 4px;
                }
                .sub-hook {
                    color: #ffd700;
                    font-size: 24px;
                    font-weight: 700;
                }

                /* TABLERO WORDLE (CENTRAL) */
                #wordle-board {
                    position: absolute;
                    top: 260px;
                    left: 50px;
                    width: 980px;
                    background: rgba(9, 14, 23, 0.75);
                    backdrop-filter: blur(8px);
                    border: 2px solid rgba(255, 255, 255, 0.15);
                    border-radius: 30px;
                    padding: 24px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.85);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .board-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1.5px solid rgba(255,255,255,0.12);
                    padding-bottom: 12px;
                    margin-bottom: 4px;
                }
                .col-tag {
                    color: #94a3b8;
                    font-size: 17px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* FILA DE INTENTO */
                .guess-row {
                    display: grid;
                    grid-template-columns: 240px 1fr 1fr 1fr 1fr;
                    gap: 10px;
                    align-items: center;
                }

                .club-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1.5px solid rgba(255, 255, 255, 0.18);
                    border-radius: 18px;
                    padding: 10px 14px;
                    height: 82px;
                }
                .club-cell img {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                }
                .club-cell-info {
                    display: flex;
                    flex-direction: column;
                }
                .club-cell-name {
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 900;
                    line-height: 1.1;
                }
                .club-cell-attempt {
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                /* CASILLEROS WORDLE */
                .tile {
                    height: 82px;
                    border-radius: 18px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-weight: 900;
                    padding: 6px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                }
                .tile-title {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                    opacity: 0.85;
                }
                .tile-val {
                    font-size: 19px;
                    font-weight: 900;
                    line-height: 1.1;
                }

                .tile-green {
                    background: linear-gradient(135deg, #00c853 0%, #009624 100%);
                    border: 2px solid #69f0ae;
                    color: #ffffff;
                }
                .tile-yellow {
                    background: linear-gradient(135deg, #ffd600 0%, #ffab00 100%);
                    border: 2px solid #fff59d;
                    color: #0b111e;
                }
                .tile-red {
                    background: linear-gradient(135deg, #d50000 0%, #9b0000 100%);
                    border: 2px solid #ff8a80;
                    color: #ffffff;
                }
                .tile-empty {
                    background: rgba(255, 255, 255, 0.04);
                    border: 2px dashed rgba(255, 255, 255, 0.15);
                    color: #64748b;
                }

                /* CTA INFERIOR ELEVADO (bottom: 240px) */
                .cta-banner {
                    position: absolute;
                    bottom: 240px;
                    left: 50px;
                    width: 980px;
                    background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                    border-radius: 24px;
                    padding: 18px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.85), 0 0 35px rgba(0, 230, 118, 0.5);
                    border: 2px solid #ffffff;
                }
                .cta-banner img {
                    width: 48px;
                    height: 48px;
                    border-radius: 10px;
                }
                .cta-banner span {
                    color: #04160a;
                    font-size: 27px;
                    font-weight: 900;
                    letter-spacing: -0.3px;
                }
            </style>
        </head>
        <body>
            <div id="header-box">
                <div class="badge-daily">📅 RETO DIARIO #47 · ESTADIO DEL DÍA</div>
                <div class="main-hook">¿PODÉS ADIVINAR ESTA CANCHA?</div>
                <div class="sub-hook">Tenés 3 intentos estilo Wordle ⏱️</div>
            </div>

            <div id="wordle-board">
                <div class="board-header">
                    <span class="col-tag">CLUB ARRIESGADO</span>
                    <span class="col-tag">PAÍS</span>
                    <span class="col-tag">PROVINCIA / CIUDAD</span>
                    <span class="col-tag">CAPACIDAD</span>
                    <span class="col-tag">RESULTADO</span>
                </div>
                ${gridContent}
            </div>

            ${extraElements}
        </body>
        </html>
        `;
    }

    // ==========================================
    // OVERLAY 1 (0.0s - 4.5s) — INTENTO 1: COLÓN
    // ==========================================
    const html1 = getBaseLayout(`
        <div class="guess-row">
            <div class="club-cell">
                <img src="${colonEscudo}">
                <div class="club-cell-info">
                    <span class="club-cell-name">COLÓN</span>
                    <span class="club-cell-attempt">Intento 1/3</span>
                </div>
            </div>
            <div class="tile tile-green"><span class="tile-title">PAÍS</span><span class="tile-val">ARG 🇦🇷</span></div>
            <div class="tile tile-green"><span class="tile-title">PROVINCIA</span><span class="tile-val">SANTA FE</span></div>
            <div class="tile tile-yellow"><span class="tile-title">CAPACIDAD</span><span class="tile-val">40.000 ⬆️</span></div>
            <div class="tile tile-red"><span class="tile-title">ESTADO</span><span class="tile-val">FALLÓ ❌</span></div>
        </div>

        <div class="guess-row">
            <div class="club-cell" style="opacity:0.4;">
                <span style="font-size:28px;">❓</span>
                <span class="club-cell-attempt">Intento 2/3</span>
            </div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
        </div>

        <div class="guess-row">
            <div class="club-cell" style="opacity:0.25;">
                <span style="font-size:28px;">❓</span>
                <span class="club-cell-attempt">Intento 3/3</span>
            </div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
        </div>
    `, `
        <div style="position:absolute; top:660px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); border:1.5px solid rgba(255,215,0,0.7); border-radius:20px; padding:10px 28px; color:#ffd700; font-size:22px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">
            💡 Pista: Es en Santa Fe pero tiene más de 40.000 lugares...
        </div>
    `);
    await page.setContent(html1, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_1.png'), omitBackground: true });
    console.log('✅ Asset creado: overlay_1.png');

    // ==========================================
    // OVERLAY 2 (4.5s - 9.0s) — INTENTO 2: ROSARIO CENTRAL
    // ==========================================
    const html2 = getBaseLayout(`
        <div class="guess-row" style="opacity:0.85;">
            <div class="club-cell">
                <img src="${colonEscudo}">
                <div class="club-cell-info">
                    <span class="club-cell-name">COLÓN</span>
                    <span class="club-cell-attempt">Intento 1</span>
                </div>
            </div>
            <div class="tile tile-green"><span class="tile-title">PAÍS</span><span class="tile-val">ARG 🇦🇷</span></div>
            <div class="tile tile-green"><span class="tile-title">PROVINCIA</span><span class="tile-val">SANTA FE</span></div>
            <div class="tile tile-yellow"><span class="tile-title">CAPACIDAD</span><span class="tile-val">40k ⬆️</span></div>
            <div class="tile tile-red"><span class="tile-title">ESTADO</span><span class="tile-val">❌</span></div>
        </div>

        <div class="guess-row">
            <div class="club-cell" style="border:2px solid #ffd700;">
                <img src="${centralEscudo}">
                <div class="club-cell-info">
                    <span class="club-cell-name">R. CENTRAL</span>
                    <span class="club-cell-attempt">Intento 2/3</span>
                </div>
            </div>
            <div class="tile tile-green"><span class="tile-title">PAÍS</span><span class="tile-val">ARG 🇦🇷</span></div>
            <div class="tile tile-green"><span class="tile-title">CIUDAD</span><span class="tile-val">ROSARIO 📍</span></div>
            <div class="tile tile-yellow"><span class="tile-title">CAPACIDAD</span><span class="tile-val">46.900 ⬇️</span></div>
            <div class="tile tile-red"><span class="tile-title">ESTADO</span><span class="tile-val">CLÁSICO 🔥</span></div>
        </div>

        <div class="guess-row">
            <div class="club-cell" style="opacity:0.4;">
                <span style="font-size:28px;">❓</span>
                <span class="club-cell-attempt">Último intento</span>
            </div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
            <div class="tile tile-empty">-</div>
        </div>
    `, `
        <div style="position:absolute; top:660px; left:50%; transform:translateX(-50%); background:rgba(220,38,38,0.9); border:2px solid #ffffff; border-radius:20px; padding:10px 28px; color:#ffffff; font-size:22px; font-weight:900; letter-spacing:1px; text-transform:uppercase; box-shadow:0 0 30px rgba(220,38,38,0.8);">
            🚨 ¡ES EN ROSARIO Y TIENE MENOS DE 46.900 ESP!
        </div>
    `);
    await page.setContent(html2, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_2.png'), omitBackground: true });
    console.log('✅ Asset creado: overlay_2.png');

    // ==========================================
    // OVERLAY 3 (9.0s - 13.0s) — INTENTO 3: NEWELL'S OLD BOYS
    // ==========================================
    const html3 = getBaseLayout(`
        <div class="guess-row" style="opacity:0.75;">
            <div class="club-cell"><img src="${colonEscudo}"><span class="club-cell-name">COLÓN</span></div>
            <div class="tile tile-green"><span class="tile-val">ARG 🇦🇷</span></div>
            <div class="tile tile-green"><span class="tile-val">SANTA FE</span></div>
            <div class="tile tile-yellow"><span class="tile-val">40k ⬆️</span></div>
            <div class="tile tile-red"><span class="tile-val">❌</span></div>
        </div>

        <div class="guess-row" style="opacity:0.75;">
            <div class="club-cell"><img src="${centralEscudo}"><span class="club-cell-name">R. CENTRAL</span></div>
            <div class="tile tile-green"><span class="tile-val">ARG 🇦🇷</span></div>
            <div class="tile tile-green"><span class="tile-val">ROSARIO</span></div>
            <div class="tile tile-yellow"><span class="tile-val">46.9k ⬇️</span></div>
            <div class="tile tile-red"><span class="tile-val">❌</span></div>
        </div>

        <div class="guess-row" style="animation: pulse 1s infinite;">
            <div class="club-cell" style="border:2.5px solid #00ff77; background:rgba(0,230,118,0.15);">
                <img src="${newellsEscudo}">
                <div class="club-cell-info">
                    <span class="club-cell-name" style="color:#00ff77;">NEWELL'S</span>
                    <span class="club-cell-attempt" style="color:#ffffff;">Intento 3/3</span>
                </div>
            </div>
            <div class="tile tile-green"><span class="tile-title">PAÍS</span><span class="tile-val">ARG 🇦🇷</span></div>
            <div class="tile tile-green"><span class="tile-title">CIUDAD</span><span class="tile-val">ROSARIO 📍</span></div>
            <div class="tile tile-green"><span class="tile-title">CAPACIDAD</span><span class="tile-val">42.000 ✅</span></div>
            <div class="tile tile-green" style="box-shadow:0 0 25px rgba(0,255,119,0.8);"><span class="tile-title">CANCHA</span><span class="tile-val">BIELSA 👑</span></div>
        </div>
    `, `
        <div style="position:absolute; top:660px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); color:#04160a; padding:12px 36px; border-radius:30px; font-size:24px; font-weight:900; border:3px solid #ffffff; box-shadow:0 0 35px rgba(0,230,118,0.8); text-transform:uppercase; letter-spacing:1px;">
            ⏱️ VERIFICANDO EN EL SISTEMA...
        </div>
    `);
    await page.setContent(html3, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_3.png'), omitBackground: true });
    console.log('✅ Asset creado: overlay_3.png');

    // ==========================================
    // OVERLAY 4 (13.0s - 22.0s) — VICTORIA Y FICHA DE HONOR
    // ==========================================
    const htmlVictoria = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; position: relative; overflow: hidden; background: transparent; }

            /* BADGE VICTORIA SUPERIOR */
            #victory-badge {
                position: absolute;
                top: 50px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                color: #04160a;
                border: 3.5px solid #ffffff;
                border-radius: 40px;
                padding: 16px 40px;
                display: flex;
                align-items: center;
                gap: 14px;
                font-size: 26px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                box-shadow: 0 16px 45px rgba(0,0,0,0.8), 0 0 35px rgba(0, 230, 118, 0.6);
            }

            /* TARJETA DE REVELACIÓN DEL COLOSO */
            #stadium-card {
                position: absolute;
                top: 155px;
                left: 50px;
                width: 980px;
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2.5px solid rgba(0, 230, 118, 0.6);
                border-top: 4px solid #00ff77;
                border-radius: 30px;
                padding: 24px 30px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 35px rgba(0, 230, 118, 0.3);
                display: flex;
                align-items: center;
                gap: 24px;
            }
            .club-badge-big {
                width: 105px;
                height: 105px;
                object-fit: contain;
                filter: drop-shadow(0 6px 15px rgba(0,0,0,0.7));
            }
            .card-details {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .card-tag {
                color: #00ff77;
                font-size: 17px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 1.5px;
            }
            .card-title {
                color: #ffffff;
                font-size: 42px;
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -0.5px;
            }
            .card-sub {
                color: #ffd700;
                font-size: 22px;
                font-weight: 700;
            }

            /* PLACA FLOTANTE DE DATOS HISTÓRICOS */
            #lore-box {
                position: absolute;
                top: 360px;
                left: 50px;
                width: 980px;
                display: flex;
                gap: 14px;
            }
            .lore-item {
                flex: 1;
                background: rgba(11, 19, 32, 0.92);
                border: 1.5px solid rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                padding: 14px 18px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.7);
            }
            .lore-label {
                color: #94a3b8;
                font-size: 15px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 2px;
            }
            .lore-val {
                color: #ffffff;
                font-size: 22px;
                font-weight: 900;
            }

            /* CTA INFERIOR ELEVADO (bottom: 240px) */
            .cta-banner {
                position: absolute;
                bottom: 240px;
                left: 50px;
                width: 980px;
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                border-radius: 24px;
                padding: 18px 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 14px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.85), 0 0 35px rgba(0, 230, 118, 0.5);
                border: 2px solid #ffffff;
            }
            .cta-banner img {
                width: 48px;
                height: 48px;
                border-radius: 10px;
            }
            .cta-banner span {
                color: #04160a;
                font-size: 27px;
                font-weight: 900;
                letter-spacing: -0.3px;
            }
        </style>
    </head>
    <body>
        <div id="victory-badge">
            <span>🏆 ¡RETO DIARIO ACERTADO EN 3/3!</span>
        </div>

        <div id="stadium-card">
            <img src="${newellsEscudo}" class="club-badge-big">
            <div class="card-details">
                <span class="card-tag">ESTADIO DEL DÍA · ROSARIO, SANTA FE</span>
                <span class="card-title">COLOSO MARCELO BIELSA</span>
                <span class="card-sub">Club Atlético Newell's Old Boys</span>
            </div>
        </div>

        <div id="lore-box">
            <div class="lore-item">
                <div class="lore-label">Capacidad</div>
                <div class="lore-val" style="color:#00ff77;">42.000 esp.</div>
            </div>
            <div class="lore-item">
                <div class="lore-label">Inauguración</div>
                <div class="lore-val">Año 1911</div>
            </div>
            <div class="lore-item">
                <div class="lore-label">Mística</div>
                <div class="lore-val" style="color:#ffd700;">Maradona & Messi</div>
            </div>
        </div>

        <div class="cta-banner">
            <img src="${logoEv}">
            <span>Jugá el Reto Diario de hoy en estadiosvirtuales.com</span>
        </div>
    </body>
    </html>
    `;
    await page.setContent(htmlVictoria, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_4_victoria.png'), omitBackground: true });
    console.log('✅ Asset creado: overlay_4_victoria.png');

    await browser.close();
    console.log('✅ Todos los overlays de Reto Diario fueron creados.');
}

// 3. GENERADOR DE PORTADA (SAFE ZONE TIKTOK 3:4 Y 1:1)
async function generarPortadaRetoDiario(bgFramePath) {
    console.log('🎨 Generando portada de alto impacto para Reto Diario...');

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    let bgBase64 = '';
    if (fs.existsSync(bgFramePath)) {
        bgBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(bgFramePath).toString('base64');
    }

    const colonEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Colon.webp')).toString('base64');
    const centralEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Rosario Central.webp')).toString('base64');
    const newellsEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Newells.webp')).toString('base64');
    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body {
                width: 1080px;
                height: 1920px;
                overflow: hidden;
                position: relative;
                background: #090e17;
            }

            .bg-drone {
                position: absolute;
                inset: 0;
                background-image: url('${bgBase64}');
                background-size: cover;
                background-position: center;
                filter: brightness(0.60) contrast(1.15);
            }
            .vignette {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at center, rgba(9, 14, 23, 0.25) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%),
                            linear-gradient(180deg, rgba(9, 14, 23, 0.92) 0%, transparent 25%, transparent 75%, rgba(9, 14, 23, 0.95) 100%);
            }

            /* SAFE ZONE TIKTOK */
            .safe-zone {
                position: absolute;
                top: 260px;
                left: 50px;
                right: 50px;
                bottom: 260px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                text-align: center;
                z-index: 10;
            }

            .brand-badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2px solid rgba(0, 230, 118, 0.6);
                border-top: 2.5px solid rgba(110, 255, 180, 0.9);
                border-radius: 35px;
                color: #00ff77;
                font-size: 24px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 10px 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 230, 118, 0.35);
            }

            .hook-pill {
                background: rgba(255, 215, 0, 0.15);
                border: 2px solid #ffd700;
                color: #ffd700;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 1.5px;
                padding: 8px 24px;
                border-radius: 20px;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                text-transform: uppercase;
            }
            .main-title {
                color: #ffffff;
                font-size: 64px;
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -1px;
                text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(0, 230, 118, 0.4);
                text-transform: uppercase;
                margin: 10px 0;
            }

            /* WORDLE MINI PREVIEW */
            .wordle-preview {
                width: 100%;
                background: rgba(11, 19, 32, 0.92);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                padding: 18px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.8);
            }
            .preview-row {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(255, 255, 255, 0.06);
                border-radius: 14px;
                padding: 8px 14px;
            }
            .preview-row img {
                width: 44px;
                height: 44px;
                object-fit: contain;
            }
            .preview-chips {
                display: flex;
                gap: 8px;
                flex: 1;
            }
            .chip {
                flex: 1;
                height: 38px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: 900;
                color: #ffffff;
            }
            .chip.green { background: #00c853; }
            .chip.yellow { background: #ffab00; color: #0b111e; }
            .chip.red { background: #d50000; }

            .footer-pill {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                color: #04160a;
                font-size: 24px;
                font-weight: 900;
                padding: 14px 34px;
                border-radius: 30px;
                border: 2px solid #ffffff;
                box-shadow: 0 12px 30px rgba(0,0,0,0.7), 0 0 25px rgba(0, 230, 118, 0.5);
            }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>

        <div class="safe-zone">
            <div class="brand-badge">📅 RETO DIARIO #47</div>

            <div>
                <div class="hook-pill">¿Cuánto sabés de canchas?</div>
                <div class="main-title">¿ADIVINÁS EL ESTADIO EN 3 INTENTOS?</div>
                <div style="color:#cbd5e1; font-size:24px; font-weight:700;">Estilo Wordle de Estadios ⚽</div>
            </div>

            <div class="wordle-preview">
                <div class="preview-row">
                    <img src="${colonEscudo}">
                    <span style="color:#fff; font-weight:900; font-size:20px; width:140px; text-align:left;">COLÓN</span>
                    <div class="preview-chips">
                        <div class="chip green">ARG 🇦🇷</div>
                        <div class="chip green">SANTA FE</div>
                        <div class="chip yellow">40k ⬆️</div>
                        <div class="chip red">❌</div>
                    </div>
                </div>
                <div class="preview-row">
                    <img src="${centralEscudo}">
                    <span style="color:#fff; font-weight:900; font-size:20px; width:140px; text-align:left;">CENTRAL</span>
                    <div class="preview-chips">
                        <div class="chip green">ARG 🇦🇷</div>
                        <div class="chip green">ROSARIO</div>
                        <div class="chip yellow">46.9k ⬇️</div>
                        <div class="chip red">❌</div>
                    </div>
                </div>
                <div class="preview-row" style="border:2px solid #00ff77; background:rgba(0,230,118,0.15);">
                    <img src="${newellsEscudo}">
                    <span style="color:#00ff77; font-weight:900; font-size:20px; width:140px; text-align:left;">NEWELL'S</span>
                    <div class="preview-chips">
                        <div class="chip green">ARG 🇦🇷</div>
                        <div class="chip green">ROSARIO</div>
                        <div class="chip green">42.000</div>
                        <div class="chip green">BIELSA 👑</div>
                    </div>
                </div>
            </div>

            <div class="footer-pill">
                <img src="${logoEv}" style="width:36px; height:36px; border-radius:8px;">
                <span>JUGALO GRATIS HOY EN LA BIO 🎮</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 8000 });
    const portadaPath = path.join(OUTPUT_DIR, 'Portada_Reto_Diario_Newells.jpg');
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// 4. EJECUTAR PIPELINE COMPLETO
async function main() {
    const rawDroneVideo = "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\newells.mp4";

    // 1. Guardar archivo de textos y copy para TikTok
    const copyContent = `📅 RETO DIARIO #47: ¿PODÉS ADIVINAR EL ESTADIO DEL DÍA EN 3 INTENTOS? ⚽🧠
¡Llegó el nuevo desafío de hoy en Estadios Virtuales! ¿Sos capaz de sacar la cancha de hoy antes de que se terminen los intentos? ⏱️

1️⃣ Intento 1: Colón (Santa Fe) ❌
2️⃣ Intento 2: Rosario Central (Rosario) ❌
3️⃣ Intento 3: ¿Llegaste a adivinarlo? 👀

👉 ¿En qué intento lo sacaste? Comentá tu resultado 👇
🎮 Jugá el Reto Diario de hoy gratis en el link del perfil: estadiosvirtuales.com

#RetoDiario #Newells #NewellsOldBoys #ColosoMarceloBielsa #Rosario #FutbolArgentino #Estadios #Wordle #TriviaFutbol #EstadiosVirtuales`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'TEXTOS_PUBLICACION.txt'), copyContent, 'utf8');
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt guardado.');

    // 2. Extraer frame para la portada
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:06',
            '-i', rawDroneVideo,
            '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
            '-vframes', '1',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    // 3. Generar Portada
    await generarPortadaRetoDiario(bgFramePath);

    // 4. Generar Overlays
    await generarOverlaysRetoDiario();

    // 5. Generar Audio procedural
    const audioPath = path.join(assetsDir, 'audio_reto.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(22.0));

    // 6. Ensamble con FFMPEG
    const videoOutPath = path.join(OUTPUT_DIR, 'Reto_Diario_Wordle_Newells.mp4');

    const overlay1 = path.join(assetsDir, 'overlay_1.png');
    const overlay2 = path.join(assetsDir, 'overlay_2.png');
    const overlay3 = path.join(assetsDir, 'overlay_3.png');
    const overlayVictoria = path.join(assetsDir, 'overlay_4_victoria.png');

    const filterComplex = [
        // 1. Escalar y recortar el drone de Newell's a 1080x1920
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[drone]`,

        // 2. Aplicar overlays por marcas de tiempo
        // 0.0s - 4.5s: Intento 1 (Colón)
        `[drone][2:v]overlay=0:0:enable='between(t,0,4.5)'[v1]`,
        // 4.5s - 9.0s: Intento 2 (Rosario Central)
        `[v1][3:v]overlay=0:0:enable='between(t,4.5,9.0)'[v2]`,
        // 9.0s - 13.0s: Intento 3 (Newell's)
        `[v2][4:v]overlay=0:0:enable='between(t,9.0,13.0)'[v3]`,
        // 13.0s - 22.0s: Revelación de victoria y ficha de honor (con CTA elevado)
        `[v3][5:v]overlay=0:0:enable='between(t,13.0,22.0)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '22',
        '-i', rawDroneVideo,     // 0:v
        '-i', audioPath,         // 1:a
        '-i', overlay1,          // 2:v
        '-i', overlay2,          // 3:v
        '-i', overlay3,          // 4:v
        '-i', overlayVictoria,    // 5:v
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
        videoOutPath
    ];

    console.log(`🎬 Renderizando video Reto Diario en 1080x1920 Full HD: ${videoOutPath}...`);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
            const timeMatch = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:22.00\r`);
            }
        });
        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO RETO DIARIO GENERADO CON ÉXITO! -> ${videoOutPath}`);
                resolve();
            } else {
                reject(new Error(`FFmpeg falló con código: ${code}`));
            }
        });
    });

    // Limpieza de assets temporales
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
    } catch (_) {}
}

main().catch(console.error);
