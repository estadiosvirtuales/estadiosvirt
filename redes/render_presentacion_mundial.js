const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\MUNDIAL DE ESTADIOS";
const OUT_FOLDER = path.join(BASE_OUTPUT_DIR, "00-PRESENTACION-MUNDIAL");

// Estadios emblemáticos para el montaje de fondo cinemático
const BG_VIDEOS = [
    { name: 'River', path: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\River_Monumental_Renovado_16x9.mp4" },
    { name: 'Boca', path: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\La bombonera 3.mp4" },
    { name: 'Azteca', path: "E:\\Google earth studio\\México\\Estadio Azteca.mp4" },
    { name: 'Maracana', path: "E:\\Google earth studio\\Brasil\\Maracaná.mp4" },
    { name: 'Allianz', path: "E:\\Google earth studio\\Brasil\\Allianz Parque_ Sociedade Esportiva Palmeiras.mp4" }
];

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL (35.0s)
// Strict Zero Whoosh Rule: Majestic harmonic fanfare, bells, and tension chords
// ==========================================
function generarAudioProcedural(duracionSeg = 35.0, sampleRate = 44100) {
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

    function addBellDing(startSec, freq = 987.77) {
        addTone(startSec, 1.8, freq, 0.38, 3.5);
        addTone(startSec + 0.03, 1.4, freq * 1.5, 0.22, 4.5);
        addTone(startSec + 0.06, 1.0, freq * 2.0, 0.15, 5.5);
    }

    function addTick(startSec) {
        addTone(startSec, 0.06, 1250, 0.35, 25);
    }

    // 0.8s: Campana solemne de inicio de competencia
    addBellDing(0.8, 659.25);
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
        addTone(1.2 + idx * 0.1, 3.5, f, 0.28, 1.5);
    });

    // 7.0s: Revelación de Criterios de Evaluación
    addBellDing(7.0, 783.99);
    addTone(7.2, 2.5, 987.77, 0.25, 2);

    // 17.0s: Revelación del Cuadro Oficial de Octavos
    addBellDing(17.0, 1046.50);
    [659.25, 783.99, 987.77, 1318.51].forEach((f, idx) => {
        addTone(17.2 + idx * 0.08, 3.0, f, 0.30, 1.6);
    });

    // 27.0s: Llamado a la Acción y Comunidad
    addBellDing(27.0, 880.0);
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
        addTone(27.3 + idx * 0.08, 4.0, f, 0.35, 1.2);
    });

    // Ticks de ambientación en transiciones
    [6.5, 16.5, 26.5].forEach(s => addTick(s));

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// ==========================================
// 2. GENERADOR DE OVERLAYS (PUPPETEER)
// ==========================================
async function generarOverlaysPresentacion(assetsDir) {
    console.log(`🎨 Generando overlays para el video de presentación...`);

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    // Escudos de los 16 equipos para el cuadro
    const getEscudo = (file) => 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', file)).toString('base64');
    const escudos = {
        boca: getEscudo('Boca.webp'),
        palmeiras: getEscudo('palmeiras.webp'),
        saopaulo: getEscudo('saopaulo.webp'),
        atlas: getEscudo('atlas.webp'),
        flamengo: getEscudo('flamengo.webp'),
        independiente: getEscudo('Independiente.webp'),
        santos: getEscudo('santos.webp'),
        pumas: getEscudo('pumas.webp'),
        america: getEscudo('america1.webp'),
        cruzeiro: getEscudo('cruzeiro.webp'),
        racing: getEscudo('Racing.webp'),
        corinthians: getEscudo('corinthians.webp'),
        chivas: getEscudo('guadalajara.webp'),
        central: getEscudo('Rosario Central.webp'),
        river: getEscudo('River.webp'),
        colocolo: getEscudo('ColoColo.webp')
    };

    function getBaseHTML(content) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body { background: transparent; width: 1080px; height: 1920px; position: relative; overflow: hidden; }

                /* HEADER SUPERIOR FLOTANTE */
                #header-box {
                    position: absolute;
                    top: 45px;
                    left: 50px;
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                    border: 2px solid rgba(255, 215, 0, 0.55);
                    border-top: 3px solid rgba(255, 235, 120, 0.95);
                    border-radius: 28px;
                    padding: 16px 20px;
                    text-align: center;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.25);
                }
                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 215, 0, 0.15);
                    border: 1.5px solid rgba(255, 215, 0, 0.75);
                    color: #ffd700;
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
                    font-size: 44px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                    margin-bottom: 4px;
                }
                .header-sub {
                    color: #00ff77;
                    font-size: 23px;
                    font-weight: 700;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
        `;
    }

    // ==========================================
    // OVERLAY 1: HOOK (0s a 7s)
    // ==========================================
    const htmlHook = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">ESTADIOS VIRTUALES · PRESENTACIÓN OFICIAL</div>
            <div class="header-title">🏆 MUNDIAL DE ESTADIOS 🌎</div>
            <div class="header-sub">16 Templos de América · 1 Solo Campeón</div>
        </div>

        <div style="position:absolute; top:740px; left:50px; width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.97) 0%, rgba(8, 14, 24, 0.99) 100%); border:2.5px solid rgba(255, 215, 0, 0.8); border-radius:32px; padding:40px 30px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.92), 0 0 40px rgba(255, 215, 0, 0.35);">
            <div style="display:inline-block; background:rgba(0, 230, 118, 0.15); border:1.5px solid #00e676; color:#00ff77; font-size:20px; font-weight:900; letter-spacing:2px; padding:6px 24px; border-radius:24px; text-transform:uppercase; margin-bottom:16px;">🔥 COMIENZA LA COMPETENCIA</div>
            
            <div style="color:#ffffff; font-size:52px; font-weight:900; line-height:1.1; margin-bottom:16px; text-transform:uppercase; letter-spacing:-0.5px;">
                ¿CUÁL ES EL MEJOR ESTADIO DEL CONTINENTE?
            </div>
            
            <div style="color:#ffd700; font-size:27px; font-weight:800;">
                Votás vos en los comentarios de cada cruce 🗳️
            </div>
        </div>

        <div style="position:absolute; bottom:200px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; background:rgba(9, 14, 23, 0.92); border:1.5px solid #ffd700; padding:10px 28px; border-radius:24px; color:#ffd700; font-size:22px; font-weight:800; box-shadow:0 8px 25px rgba(0,0,0,0.85); white-space:nowrap;">
            <span>👇 CONOCÉ LOS 4 CRITERIOS DE EVALUACIÓN</span>
        </div>
    `);
    await page.setContent(htmlHook, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_hook.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 2: CRITERIOS DE VOTACIÓN (7s a 17s)
    // El video central (y=656 a 1264) queda 100% libre y visible
    // ==========================================
    const htmlCriterios = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">REGLAS OFICIALES · ¿CÓMO ELEGIR?</div>
            <div class="header-title">4 CRITERIOS DE EVALUACIÓN</div>
            <div class="header-sub">Analizá cada punto antes de dejar tu voto 🗳️</div>
        </div>

        <!-- 4 Criterios ubicados debajo del video (top: 1290px), sin tapar la toma aérea -->
        <div style="position:absolute; top:1290px; left:50px; width:980px; display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            
            <!-- Criterio 1: Capacidad -->
            <div style="background:linear-gradient(135deg, rgba(14, 26, 42, 0.97) 0%, rgba(8, 14, 24, 0.99) 100%); border:2px solid rgba(0, 230, 118, 0.5); border-left:7px solid #00e676; border-radius:20px; padding:16px 20px; box-shadow:0 12px 30px rgba(0,0,0,0.85);">
                <div style="color:#00ff77; font-size:22px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">1. CAPACIDAD</div>
                <div style="color:#cbd5e1; font-size:16px; font-weight:600; line-height:1.25; margin-top:6px;">Aforo oficial y presión del público.</div>
            </div>

            <!-- Criterio 2: Estética -->
            <div style="background:linear-gradient(135deg, rgba(14, 26, 42, 0.97) 0%, rgba(8, 14, 24, 0.99) 100%); border:2px solid rgba(255, 215, 0, 0.5); border-left:7px solid #ffd700; border-radius:20px; padding:16px 20px; box-shadow:0 12px 30px rgba(0,0,0,0.85);">
                <div style="color:#ffd700; font-size:22px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">2. ESTÉTICA</div>
                <div style="color:#cbd5e1; font-size:16px; font-weight:600; line-height:1.25; margin-top:6px;">Belleza visual y vista desde el cielo.</div>
            </div>

            <!-- Criterio 3: Arquitectura -->
            <div style="background:linear-gradient(135deg, rgba(14, 26, 42, 0.97) 0%, rgba(8, 14, 24, 0.99) 100%); border:2px solid rgba(0, 176, 255, 0.5); border-left:7px solid #00b0ff; border-radius:20px; padding:16px 20px; box-shadow:0 12px 30px rgba(0,0,0,0.85);">
                <div style="color:#00b0ff; font-size:22px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">3. ARQUITECTURA</div>
                <div style="color:#cbd5e1; font-size:16px; font-weight:600; line-height:1.25; margin-top:6px;">Historia, tribunas y estructura.</div>
            </div>

            <!-- Criterio 4: Acústica -->
            <div style="background:linear-gradient(135deg, rgba(14, 26, 42, 0.97) 0%, rgba(8, 14, 24, 0.99) 100%); border:2px solid rgba(255, 51, 68, 0.5); border-left:7px solid #ff3344; border-radius:20px; padding:16px 20px; box-shadow:0 12px 30px rgba(0,0,0,0.85);">
                <div style="color:#ff3344; font-size:22px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">4. ACÚSTICA</div>
                <div style="color:#cbd5e1; font-size:16px; font-weight:600; line-height:1.25; margin-top:6px;">Mística, caldera y eco del aliento.</div>
            </div>
        </div>

        <div style="position:absolute; bottom:160px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; background:linear-gradient(135deg, #ffd700 0%, #ff8800 100%); border:2px solid #ffffff; padding:12px 32px; border-radius:24px; color:#0b111e; font-size:22px; font-weight:900; box-shadow:0 10px 30px rgba(255,180,0,0.6); white-space:nowrap; text-transform:uppercase;">
            <span>👉 A CONTINUACIÓN: EL CUADRO DE OCTAVOS</span>
        </div>
    `);
    await page.setContent(htmlCriterios, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_criterios.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 3: CUADRO OFICIAL DE PLAYOFFS (17s a 27s)
    // Árbol eliminatorio tipo llave de Copa Libertadores / Champions League
    // ==========================================
    const renderMatchCard = (num, e1, n1, c1, e2, n2, c2, side = 'left', yPos) => {
        const borderSide = side === 'left' ? 'border-left: 5px solid #00e676;' : 'border-right: 5px solid #ffd700;';
        const badgeColor = side === 'left' ? '#00e676' : '#ffd700';
        return `
        <div style="position:absolute; top:${yPos}px; ${side === 'left' ? 'left:25px;' : 'right:25px;'} width:250px; height:92px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:1.5px solid rgba(255,255,255,0.2); ${borderSide} border-radius:16px; padding:8px 12px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 10px 25px rgba(0,0,0,0.88); z-index:5;">
            <!-- Equipo 1 -->
            <div style="display:flex; align-items:center; gap:8px;">
                <img src="${e1}" style="width:26px; height:26px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                <span style="color:#ffffff; font-size:15px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${n1}</span>
                <span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:1px 5px; font-size:11px; font-weight:800; color:#94a3b8;">${c1}</span>
            </div>
            <!-- Divisor con etiqueta del Cruce -->
            <div style="height:1px; background:rgba(255,255,255,0.14); position:relative; margin:2px 0;">
                <span style="position:absolute; top:-8px; ${side === 'left' ? 'right:8px;' : 'left:8px;'} background:#090f1a; color:${badgeColor}; font-size:10px; font-weight:900; padding:1px 6px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);">CRUCE ${num}</span>
            </div>
            <!-- Equipo 2 -->
            <div style="display:flex; align-items:center; gap:8px;">
                <img src="${e2}" style="width:26px; height:26px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                <span style="color:#ffffff; font-size:15px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${n2}</span>
                <span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:1px 5px; font-size:11px; font-weight:800; color:#94a3b8;">${c2}</span>
            </div>
        </div>
        `;
    };

    const renderStageNode = (text, x, y, width, height, borderColor, textColor) => `
        <div style="position:absolute; left:${x}px; top:${y}px; width:${width}px; height:${height}px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:1.8px solid ${borderColor}; border-radius:12px; display:flex; align-items:center; justify-content:center; text-align:center; box-shadow:0 8px 20px rgba(0,0,0,0.8); z-index:5;">
            <span style="color:${textColor}; font-size:11px; font-weight:900; letter-spacing:0.6px; text-transform:uppercase;">${text}</span>
        </div>
    `;

    const bY1 = 300, bY2 = 620, bY3 = 980, bY4 = 1300;
    const bCY1 = bY1 + 46; // 346
    const bCY2 = bY2 + 46; // 666
    const bCY3 = bY3 + 46; // 1026
    const bCY4 = bY4 + 46; // 1346
    const bCYC1 = (bCY1 + bCY2) / 2; // 506
    const bCYC2 = (bCY3 + bCY4) / 2; // 1186
    const bCYSemi = (bCYC1 + bCYC2) / 2; // 846

    const htmlCuadro = getBaseHTML(`
        <!-- HEADER -->
        <div id="header-box">
            <div class="header-badge">FIXTURE OFICIAL · ELIMINATORIAS</div>
            <div class="header-title">🏆 CUADRO DE PLAYOFFS 🏆</div>
            <div class="header-sub">El camino hacia la Gran Final de América</div>
        </div>

        <!-- BARRA GUÍA DE FASES -->
        <div style="position:absolute; top:230px; left:25px; right:25px; display:flex; justify-content:space-between; align-items:center; padding:8px 20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); border-radius:14px;">
            <span style="color:#00ff77; width:250px; text-align:center; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">🟢 OCTAVOS (A)</span>
            <span style="color:#00b0ff; width:70px; text-align:center; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">CUARTOS</span>
            <span style="color:#ffd700; width:130px; text-align:center; font-size:14px; font-weight:900; background:rgba(255,215,0,0.18); padding:4px 10px; border-radius:10px; border:1px solid #ffd700; text-transform:uppercase;">🏆 FINAL</span>
            <span style="color:#00b0ff; width:70px; text-align:center; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">CUARTOS</span>
            <span style="color:#ffd700; width:250px; text-align:center; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">🟡 OCTAVOS (B)</span>
        </div>

        <!-- SVG DE LÍNEAS CONECTORAS DEL BRACKET -->
        <svg style="position:absolute; top:0; left:0; width:1080px; height:1920px; z-index:2; pointer-events:none;">
            <!-- LLAVE IZQUIERDA (LLAVE A) -->
            <path d="M 275 ${bCY1} L 295 ${bCY1} L 295 ${bCY2} L 275 ${bCY2}" fill="none" stroke="rgba(0, 230, 118, 0.75)" stroke-width="2.5" />
            <path d="M 295 ${bCYC1} L 315 ${bCYC1}" fill="none" stroke="rgba(0, 230, 118, 0.95)" stroke-width="2.5" />

            <path d="M 275 ${bCY3} L 295 ${bCY3} L 295 ${bCY4} L 275 ${bCY4}" fill="none" stroke="rgba(0, 230, 118, 0.75)" stroke-width="2.5" />
            <path d="M 295 ${bCYC2} L 315 ${bCYC2}" fill="none" stroke="rgba(0, 230, 118, 0.95)" stroke-width="2.5" />

            <path d="M 385 ${bCYC1} L 398 ${bCYC1} L 398 ${bCYC2} L 385 ${bCYC2}" fill="none" stroke="rgba(0, 176, 255, 0.75)" stroke-width="2.5" />
            <path d="M 398 ${bCYSemi} L 408 ${bCYSemi}" fill="none" stroke="rgba(0, 176, 255, 0.95)" stroke-width="2.5" />

            <path d="M 463 ${bCYSemi} L 475 ${bCYSemi}" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3,2" />

            <!-- LLAVE DERECHA (LLAVE B) -->
            <path d="M 805 ${bCY1} L 785 ${bCY1} L 785 ${bCY2} L 805 ${bCY2}" fill="none" stroke="rgba(255, 215, 0, 0.75)" stroke-width="2.5" />
            <path d="M 785 ${bCYC1} L 765 ${bCYC1}" fill="none" stroke="rgba(255, 215, 0, 0.95)" stroke-width="2.5" />

            <path d="M 805 ${bCY3} L 785 ${bCY3} L 785 ${bCY4} L 805 ${bCY4}" fill="none" stroke="rgba(255, 215, 0, 0.75)" stroke-width="2.5" />
            <path d="M 785 ${bCYC2} L 765 ${bCYC2}" fill="none" stroke="rgba(255, 215, 0, 0.95)" stroke-width="2.5" />

            <path d="M 695 ${bCYC1} L 682 ${bCYC1} L 682 ${bCYC2} L 695 ${bCYC2}" fill="none" stroke="rgba(0, 176, 255, 0.75)" stroke-width="2.5" />
            <path d="M 682 ${bCYSemi} L 672 ${bCYSemi}" fill="none" stroke="rgba(0, 176, 255, 0.95)" stroke-width="2.5" />

            <path d="M 617 ${bCYSemi} L 605 ${bCYSemi}" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3,2" />
        </svg>

        <!-- CRUCES DE OCTAVOS (IZQUIERDA) -->
        ${renderMatchCard('1', escudos.boca, 'Boca Juniors', 'ARG', escudos.palmeiras, 'Palmeiras', 'BRA', 'left', bY1)}
        ${renderMatchCard('2', escudos.saopaulo, 'São Paulo', 'BRA', escudos.atlas, 'Atlas FC', 'MEX', 'left', bY2)}
        ${renderMatchCard('3', escudos.flamengo, 'Flamengo', 'BRA', escudos.independiente, 'Independiente', 'ARG', 'left', bY3)}
        ${renderMatchCard('4', escudos.santos, 'Santos FC', 'BRA', escudos.pumas, 'Pumas UNAM', 'MEX', 'left', bY4)}

        <!-- NODOS DE CUARTOS (IZQUIERDA) -->
        ${renderStageNode('CUARTOS 1', 315, bCYC1 - 20, 70, 40, 'rgba(0,230,118,0.7)', '#00ff77')}
        ${renderStageNode('CUARTOS 2', 315, bCYC2 - 20, 70, 40, 'rgba(0,230,118,0.7)', '#00ff77')}

        <!-- NODO DE SEMIFINAL 1 (IZQUIERDA) -->
        ${renderStageNode('SEMI 1', 408, bCYSemi - 22, 55, 44, 'rgba(0,176,255,0.85)', '#00e5ff')}

        <!-- NODO CENTRAL: GRAN FINAL -->
        <div style="position:absolute; left:475px; top:${bCYSemi - 115}px; width:130px; height:230px; background:linear-gradient(135deg, rgba(20, 32, 50, 0.99) 0%, rgba(9, 14, 23, 1) 100%); border:2.5px solid #ffd700; border-radius:24px; padding:14px 8px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center; box-shadow:0 14px 40px rgba(0,0,0,0.92), 0 0 35px rgba(255,215,0,0.45); z-index:10;">
            <div style="background:rgba(255,215,0,0.22); border:1px solid #ffd700; border-radius:8px; padding:2px 8px; color:#ffd700; font-size:11px; font-weight:900; letter-spacing:1px;">COPA</div>
            <div style="font-size:56px; line-height:1; filter:drop-shadow(0 4px 12px rgba(255,215,0,0.7));">🏆</div>
            <div>
                <div style="color:#ffffff; font-size:13px; font-weight:900; line-height:1.15; text-transform:uppercase;">GRAN<br>FINAL</div>
                <div style="color:#00ff77; font-size:10px; font-weight:900; margin-top:5px; letter-spacing:0.5px;">1 CAMPEÓN</div>
            </div>
        </div>

        <!-- NODO DE SEMIFINAL 2 (DERECHA) -->
        ${renderStageNode('SEMI 2', 617, bCYSemi - 22, 55, 44, 'rgba(0,176,255,0.85)', '#00e5ff')}

        <!-- NODOS DE CUARTOS (DERECHA) -->
        ${renderStageNode('CUARTOS 3', 695, bCYC1 - 20, 70, 40, 'rgba(255,215,0,0.7)', '#ffd700')}
        ${renderStageNode('CUARTOS 4', 695, bCYC2 - 20, 70, 40, 'rgba(255,215,0,0.7)', '#ffd700')}

        <!-- CRUCES DE OCTAVOS (DERECHA) -->
        ${renderMatchCard('5', escudos.america, 'Club América', 'MEX', escudos.cruzeiro, 'Cruzeiro', 'BRA', 'right', bY1)}
        ${renderMatchCard('6', escudos.racing, 'Racing Club', 'ARG', escudos.corinthians, 'Corinthians', 'BRA', 'right', bY2)}
        ${renderMatchCard('7', escudos.chivas, 'Chivas', 'MEX', escudos.central, 'Rosario Central', 'ARG', 'right', bY3)}
        ${renderMatchCard('8', escudos.river, 'River Plate', 'ARG', escudos.colocolo, 'Colo-Colo', 'CHI', 'right', bY4)}

        <!-- BANNER DE INFO (y: 1480) -->
        <div style="position:absolute; top:1480px; left:50%; transform:translateX(-50%); width:980px; background:rgba(14, 26, 42, 0.94); border:1.5px solid rgba(255,215,0,0.45); border-radius:18px; padding:12px 20px; display:flex; align-items:center; justify-content:center; gap:16px; box-shadow:0 8px 25px rgba(0,0,0,0.8);">
            <span style="color:#00ff77; font-size:17px; font-weight:900;">🟢 LLAVE A</span>
            <span style="color:#ffffff; font-size:15px; font-weight:700;">· 16 Estadios Legendarios de América ·</span>
            <span style="color:#ffd700; font-size:17px; font-weight:900;">🟡 LLAVE B</span>
        </div>

        <!-- BOTÓN FOOTER COMUNIDAD (ELEVADO Y CLARO) -->
        <div style="position:absolute; bottom:160px; left:50%; transform:translateX(-50%); width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2px solid #ffd700; border-radius:22px; padding:16px 24px; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow:0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(255,215,0,0.25);">
            <span style="font-size:26px;">🗳️</span>
            <span style="color:#ffd700; font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:0.8px;">VOTÁS EN COMENTARIOS QUIÉN AVANZA EN CADA CRUCE</span>
        </div>
    `);
    await page.setContent(htmlCuadro, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_cuadro.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 4: CTA FINAL & COMUNIDAD (27s a 35s)
    // ==========================================
    const htmlCta = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">ESTADIOS VIRTUALES · COMUNIDAD</div>
            <div class="header-title">¡EL TORNEO YA EMPEZÓ!</div>
            <div class="header-sub">Tu voto decide quién clasifica a Cuartos 🏆</div>
        </div>

        <div style="position:absolute; top:680px; left:50px; width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2.5px solid rgba(0, 230, 118, 0.8); border-radius:32px; padding:35px 30px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.92), 0 0 40px rgba(0, 230, 118, 0.35);">
            <div style="font-size:55px; margin-bottom:10px;">🏆</div>
            <div style="color:#ffffff; font-size:42px; font-weight:900; line-height:1.1; margin-bottom:12px; text-transform:uppercase;">
                ¿QUÉ ESTADIO LEVANTARÁ LA COPA?
            </div>
            
            <div style="color:#ffd700; font-size:24px; font-weight:800; line-height:1.3; margin-bottom:20px;">
                Seguinos y activá notificaciones para votar en cada llave mano a mano 🗳️
            </div>

            <div style="background:linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color:#0b111e; font-size:24px; font-weight:900; padding:14px 24px; border-radius:24px; border:2px solid #ffffff; box-shadow:0 8px 25px rgba(255,180,0,0.5); text-transform:uppercase;">
                💬 DEJÁ TU CANDIDATO AHORA EN COMENTARIOS
            </div>
        </div>

        <!-- CTA ELEVADO (bottom: 240px) -->
        <div style="position:absolute; bottom:240px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:24px; padding:18px 24px; display:flex; align-items:center; justify-content:center; gap:14px; box-shadow:0 16px 40px rgba(0,0,0,0.85), 0 0 30px rgba(0, 230, 118, 0.45); border:2px solid #ffffff;">
            <img src="${logoEv}" style="width:48px; height:48px; border-radius:10px;">
            <span style="color:#04160a; font-size:27px; font-weight:900; letter-spacing:-0.3px;">Jugá la trivia de estadios en estadiosvirtuales.com</span>
        </div>

        <!-- SEGUINOS SUB-PILL (bottom: 165px) -->
        <div style="position:absolute; bottom:165px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:8px; background:rgba(9, 14, 23, 0.92); border:1.5px solid #ffd700; padding:8px 24px; border-radius:20px; color:#ffd700; font-size:20px; font-weight:800; box-shadow:0 8px 25px rgba(0,0,0,0.85); white-space:nowrap; letter-spacing:0.5px;">
            <span>🔔 ¡Seguinos para no perderte ningún cruce! ⚽</span>
        </div>
    `);
    await page.setContent(htmlCta, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_cta.png'), omitBackground: true });

    await browser.close();
    console.log('✅ Overlays de presentación generados exitosamente.');
}

// ==========================================
// 3. GENERADOR DE PORTADA (SAFE ZONE 3:4 TIKTOK)
// ==========================================
async function generarPortada(outFolder, bgFramePath) {
    console.log(`🎨 Generando portada para el video de presentación...`);
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

    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; overflow: hidden; position: relative; background: #090e17; }
            .bg-drone { position: absolute; inset: 0; background-image: url('${bgBase64}'); background-size: cover; background-position: center; filter: brightness(0.55) contrast(1.15); }
            .vignette { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(9, 14, 23, 0.25) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%), linear-gradient(180deg, rgba(9, 14, 23, 0.92) 0%, transparent 25%, transparent 75%, rgba(9, 14, 23, 0.95) 100%); }
            
            /* ZONA SEGURA 3:4 (y=260 a y=1660) */
            .safe-zone { position: absolute; top: 260px; left: 50px; right: 50px; bottom: 260px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; z-index: 10; }
            
            .brand-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(255, 215, 0, 0.6); border-top: 2.5px solid rgba(255, 235, 120, 0.95); border-radius: 35px; color: #ffd700; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 10px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(255, 215, 0, 0.35); }
            
            .main-box { display: flex; flex-direction: column; align-items: center; gap: 18px; width: 100%; }
            .hook-pill { background: rgba(0, 230, 118, 0.15); border: 2px solid #00e676; color: #00ff77; font-size: 24px; font-weight: 900; letter-spacing: 1.5px; padding: 10px 28px; border-radius: 20px; box-shadow: 0 0 20px rgba(0, 230, 118, 0.3); text-transform: uppercase; }
            .main-title { color: #ffffff; font-size: 68px; font-weight: 900; line-height: 1.08; letter-spacing: -1px; text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(255, 215, 0, 0.4); text-transform: uppercase; }
            .sub-title { color: #ffd700; font-size: 28px; font-weight: 800; }

            .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; margin: 15px 0; }
            .feature-card { background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%); border: 1.5px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,0.8); text-align: center; }
            .feature-text { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; }
            
            .cta-card { width: 100%; background: linear-gradient(135deg, rgba(14, 26, 42, 0.95) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(255, 215, 0, 0.5); border-radius: 24px; padding: 18px; display: flex; align-items: center; justify-content: center; gap: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.8); }
            .cta-text { color: #ffd700; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>

        <div class="safe-zone">
            <div class="brand-badge">
                <img src="${logoEv}" style="width: 32px; height: 32px; border-radius: 6px;">
                <span>MUNDIAL DE ESTADIOS · PRESENTACIÓN</span>
            </div>

            <div class="main-box">
                <div class="hook-pill">🏆 16 TEMPLOS · 1 SOLO CAMPEÓN</div>
                <div class="main-title">¿CUÁL ES EL MEJOR ESTADIO?</div>
                <div class="sub-title">Fixture Oficial de Octavos de Final</div>

                <div class="feature-grid">
                    <div class="feature-card">
                        <span class="feature-text">1. CAPACIDAD</span>
                    </div>
                    <div class="feature-card">
                        <span class="feature-text">2. ESTÉTICA</span>
                    </div>
                    <div class="feature-card">
                        <span class="feature-text">3. ARQUITECTURA</span>
                    </div>
                    <div class="feature-card">
                        <span class="feature-text">4. ACÚSTICA</span>
                    </div>
                </div>
            </div>

            <div class="cta-card">
                <span class="cta-text">🔥 ¡Dejá tu candidato en comentarios! 🗳️</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 5000 });
    const portadaPath = path.join(outFolder, "Portada_Presentacion_Mundial_Estadios.jpg");
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// ==========================================
// 4. RENDERIZAR VIDEO FINAL DE PRESENTACIÓN CON FFMPEG (35.0s)
// ==========================================
async function renderizarVideoPresentacion() {
    console.log(`\n🏆 ========================================================`);
    console.log(`🏆 PRODUCCIÓN: VIDEO DE PRESENTACIÓN MUNDIAL DE ESTADIOS (35s)`);
    console.log(`🏆 ========================================================\n`);

    if (!fs.existsSync(OUT_FOLDER)) fs.mkdirSync(OUT_FOLDER, { recursive: true });

    const assetsDir = path.join(__dirname, "assets_presentacion_mundial");
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. Guardar copy de publicación
    const copy = `🏆 ¡GRAN MUNDIAL DE ESTADIOS DE AMÉRICA! 🌎🔥
Llegó el torneo más esperado: 16 templos históricos se enfrentan cara a cara por la corona continental y VOS vas a definir al campeón con tus votos.

📊 LOS 4 CRITERIOS OFICIALES PARA ELEGIR:
1️⃣ CAPACIDAD: Convocatoria y presión del aforo.
2️⃣ ESTÉTICA: Belleza visual e impacto desde el aire.
3️⃣ ARQUITECTURA: Historia, diseño de tribunas y estructura.
4️⃣ ACÚSTICA: Mística, caldera y cómo retumba el aliento.

⚔️ CUADRO DE OCTAVOS DE FINAL:
🟢 LLAVE A:
• Boca Juniors vs Palmeiras
• São Paulo vs Atlas FC
• Flamengo vs Independiente
• Santos FC vs Pumas UNAM

🟡 LLAVE B:
• Club América vs Cruzeiro
• Racing Club vs Corinthians
• Chivas vs Rosario Central
• River Plate vs Colo-Colo

👉 ¿Quién es tu gran candidato al título? Dejanos tu pronóstico en comentarios 👇
🎮 Poné a prueba cuánto sabés de canchas en: estadiosvirtuales.com

#MundialDeEstadios #Estadios #FutbolSudamericano #FutbolArgentino #Brasileirao #LigaMX #EstadiosVirtuales`;

    fs.writeFileSync(path.join(OUT_FOLDER, 'TEXTOS_PUBLICACION.txt'), copy, 'utf8');
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt guardado.');

    // 2. Extraer frame de fondo para portada (de River Renovado)
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:08',
            '-i', BG_VIDEOS[0].path,
            '-vframes', '1',
            '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    // 3. Generar Portada de alta calidad
    await generarPortada(OUT_FOLDER, bgFramePath);

    // 4. Generar Overlays transparentes
    await generarOverlaysPresentacion(assetsDir);

    // 5. Generar Audio procedural de 35s
    const audioPath = path.join(assetsDir, 'audio_presentacion.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(35.0));

    // 6. Composición con FFmpeg
    // 5 videos de fondo con tomas aéreas:
    // 0:v (River), 1:v (Boca), 2:v (Azteca), 3:v (Maracana), 4:v (Allianz)
    const videoOutPath = path.join(OUT_FOLDER, "Presentacion_Oficial_Mundial_Estadios.mp4");

    const filterComplex = [
        // Escalado vertical cinematográfico con boxblur difuminado de fondo y video 16:9 centrado (normalizado a 30 fps)
        `[0:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg0]`,
        `[0:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=decrease[fg0]`,
        `[bg0][fg0]overlay=0:656[v0]`,

        `[1:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg1]`,
        `[1:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=decrease[fg1]`,
        `[bg1][fg1]overlay=0:656[v1]`,

        `[2:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg2]`,
        `[2:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=decrease[fg2]`,
        `[bg2][fg2]overlay=0:656[v2]`,

        `[3:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg3]`,
        `[3:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=decrease[fg3]`,
        `[bg3][fg3]overlay=0:656[v3]`,

        // Transición xfade fluida entre los 4 templos (River -> Boca -> Azteca -> Maracaná)
        `[v0][v1]xfade=transition=fade:duration=1.0:offset=9.0[x1]`,
        `[x1][v2]xfade=transition=fade:duration=1.0:offset=18.0[x2]`,
        `[x2][v3]xfade=transition=fade:duration=1.0:offset=27.0[x3]`,
        `[x3]trim=0:35,setpts=PTS-STARTPTS[base_video]`,

        // Superposición de los 4 Overlays según timing
        // 5:v (Hook 0-7s), 6:v (Criterios 7-17s), 7:v (Cuadro 17-27s), 8:v (CTA 27-35s)
        `[base_video][5:v]overlay=0:0:enable='between(t,0,7.0)'[o1]`,
        `[o1][6:v]overlay=0:0:enable='between(t,7.0,17.0)'[o2]`,
        `[o2][7:v]overlay=0:0:enable='between(t,17.0,27.0)'[o3]`,
        `[o3][8:v]overlay=0:0:enable='between(t,27.0,35.0)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '35',
        '-i', BG_VIDEOS[0].path,                                         // 0:v (River)
        '-i', BG_VIDEOS[1].path,                                         // 1:v (Boca)
        '-i', BG_VIDEOS[2].path,                                         // 2:v (Azteca)
        '-i', BG_VIDEOS[3].path,                                         // 3:v (Maracana)
        '-i', audioPath,                                                 // 4:a
        '-i', path.join(assetsDir, 'overlay_hook.png'),                  // 5:v
        '-i', path.join(assetsDir, 'overlay_criterios.png'),             // 6:v
        '-i', path.join(assetsDir, 'overlay_cuadro.png'),                // 7:v
        '-i', path.join(assetsDir, 'overlay_cta.png'),                   // 8:v
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '4:a',
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

    console.log(`🎬 Renderizando video de presentación 1080x1920 (35s) con FFmpeg: ${videoOutPath}...`);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        let errorLog = '';
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
            errorLog += msg;
            const timeMatch = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:35.00\r`);
            }
        });
        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO DE PRESENTACIÓN FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
                resolve();
            } else {
                console.error(`\nFFmpeg Stderr:\n${errorLog.slice(-1200)}`);
                reject(new Error(`FFmpeg falló con código: ${code}`));
            }
        });
    });

    // Limpieza de assets temporales
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
    } catch (_) {}
}

renderizarVideoPresentacion().catch(err => console.error('Error fatal:', err));
