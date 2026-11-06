const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\EUROCOPA DE ESTADIOS";
const OUT_FOLDER = path.join(BASE_OUTPUT_DIR, "00-PRESENTACION-EUROCOPA");

// Estadios emblemáticos europeos para el montaje de fondo cinemático
const BG_VIDEOS = [
    { name: 'Bernabeu', path: "E:\\Google earth studio\\España\\Bloque A\\bernabeu.mp4" },
    { name: 'SanSiro', path: "E:\\Google earth studio\\Italia\\Subidos\\San Siro 2.mp4" },
    { name: 'Wembley', path: "E:\\Google earth studio\\Inglaterra\\Wembley Stadium_ Inglaterra.mp4" },
    { name: 'Borussia', path: "E:\\Google earth studio\\Bundesliga\\Subidos\\Borussia.mp4" },
    { name: 'Allianz', path: "E:\\Google earth studio\\Bundesliga\\Subidos\\Allianz Arena.mp4" }
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

    function addHarmonicChord(startSec, durSec, rootFreq, volume = 0.45) {
        addTone(startSec, durSec, rootFreq, volume, 2.5);
        addTone(startSec, durSec, rootFreq * 1.25, volume * 0.75, 2.5);
        addTone(startSec, durSec, rootFreq * 1.5, volume * 0.65, 2.5);
        addTone(startSec, durSec, rootFreq * 2.0, volume * 0.45, 2.8);
    }

    function addBellChime(startSec, freq = 880, vol = 0.4) {
        addTone(startSec, 1.8, freq, vol, 4.0);
        addTone(startSec, 1.4, freq * 2.04, vol * 0.4, 5.0);
        addTone(startSec, 1.0, freq * 3.02, vol * 0.2, 6.0);
    }

    // 0.0s: Fanfarria de Apertura Solemne
    addHarmonicChord(0.1, 4.5, 261.63, 0.45); // C4
    addHarmonicChord(1.5, 4.0, 329.63, 0.45); // E4
    addHarmonicChord(3.2, 4.2, 392.00, 0.50); // G4
    addHarmonicChord(5.0, 4.5, 523.25, 0.55); // C5 Majestuoso

    // 6.5s a 16s: Campanas y ritmo de los 4 Criterios
    addBellChime(6.5, 659.25, 0.38); // Criterio 1
    addBellChime(9.0, 783.99, 0.38); // Criterio 2
    addBellChime(11.5, 880.00, 0.40); // Criterio 3
    addBellChime(14.0, 1046.50, 0.45); // Criterio 4

    // 16.5s: Gran Revelación del Árbol de Playoffs de la Eurocopa
    addHarmonicChord(16.5, 6.0, 329.63, 0.55); // E4
    addHarmonicChord(18.0, 5.5, 392.00, 0.55); // G4
    addHarmonicChord(20.0, 6.0, 523.25, 0.60); // C5
    addHarmonicChord(23.0, 5.0, 587.33, 0.55); // D5

    // 27.0s a 35s: Clímax Triunfal y Llamado a la Acción
    addHarmonicChord(27.0, 7.5, 523.25, 0.55);
    addHarmonicChord(29.0, 6.0, 659.25, 0.60);
    addHarmonicChord(31.5, 4.0, 783.99, 0.65);

    // Fade out suave en los últimos 1.5s
    const fadeOutStart = Math.floor(33.5 * sampleRate);
    for (let i = fadeOutStart; i < totalSamples; i++) {
        const factor = (totalSamples - i) / (totalSamples - fadeOutStart);
        samples[i] *= factor;
    }

    for (let i = 0; i < totalSamples; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
    }

    return buffer;
}

// ==========================================
// 2. GENERADOR DE OVERLAYS (PUPPETEER)
// ==========================================
async function generarOverlaysEurocopa(assetsDir) {
    console.log(`🎨 Generando overlays para la presentación de la Eurocopa de Estadios...`);
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    // Copa oficial del sitio con recorte de precisión
    let trofeoCopa = '';
    const croppedCupPath = path.join(__dirname, 'trofeo_cropped.webp');
    const rawCupPath = path.join(__dirname, '..', 'trofeo.webp');
    if (fs.existsSync(croppedCupPath)) {
        trofeoCopa = 'data:image/webp;base64,' + fs.readFileSync(croppedCupPath).toString('base64');
    } else if (fs.existsSync(rawCupPath)) {
        trofeoCopa = 'data:image/webp;base64,' + fs.readFileSync(rawCupPath).toString('base64');
    }

    // Escudos de los 16 equipos europeos
    const getEscudo = (file) => 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', file)).toString('base64');
    const escudos = {
        real: getEscudo('Real.webp'),
        liverpool: getEscudo('liverpool.webp'),
        milan: getEscudo('milan.webp'),
        dortmund: getEscudo('borussiadortmund.webp'),
        athletic: getEscudo('AtlClub.webp'),
        manutd: getEscudo('manchesterunited.webp'),
        bayern: getEscudo('bayernmunchen.webp'),
        arsenal: getEscudo('arsenal.webp'),
        wembley: getEscudo('england.webp'),
        atleti: getEscudo('AMadrid.webp'),
        psg: getEscudo('psg.webp'),
        ajax: getEscudo('ajax.webp'),
        napoli: getEscudo('napoli.webp'),
        marsella: getEscudo('olimpiquemarsella.webp'),
        benfica: getEscudo('benfica.webp'),
        roma: getEscudo('roma.webp')
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
                    border: 2px solid rgba(0, 176, 255, 0.55);
                    border-top: 3px solid rgba(130, 220, 255, 0.95);
                    border-radius: 28px;
                    padding: 16px 20px;
                    text-align: center;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 176, 255, 0.25);
                }
                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 176, 255, 0.15);
                    border: 1.5px solid #00b0ff;
                    padding: 4px 14px;
                    border-radius: 20px;
                    color: #00e5ff;
                    font-size: 13px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                }
                .header-title {
                    color: #ffffff;
                    font-size: 34px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    line-height: 1.15;
                    text-shadow: 0 4px 18px rgba(0, 0, 0, 0.8);
                }
                .header-sub {
                    color: #ffd700;
                    font-size: 17px;
                    font-weight: 800;
                    margin-top: 4px;
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
    // OVERLAY 1: APERTURA Y HOOK (0s a 6s)
    // ==========================================
    const htmlApertura = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">ESTADIOS VIRTUALES · PRESENTACIÓN OFICIAL</div>
            <div class="header-title">🏆 EUROCOPA DE ESTADIOS 🏆</div>
            <div class="header-sub">16 Templos de Europa · 1 Solo Campeón</div>
        </div>

        <!-- PLACA CENTRAL DE IMPACTO -->
        <div style="position:absolute; top:710px; left:50px; width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2.5px solid #00b0ff; border-radius:32px; padding:35px 30px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.92), 0 0 40px rgba(0, 176, 255, 0.35);">
            <div style="color:#00e5ff; font-size:16px; font-weight:900; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px;">
                TORNEO CONTINENTAL DE CLUBES
            </div>
            <div style="color:#ffffff; font-size:46px; font-weight:900; line-height:1.1; margin-bottom:14px; text-transform:uppercase; letter-spacing:-0.5px;">
                ¿CUÁL ES EL MEJOR ESTADIO DE EUROPA?
            </div>
            <div style="color:#ffd700; font-size:24px; font-weight:800; line-height:1.3; margin-bottom:15px;">
                Votás vos en los comentarios de cada cruce 🗳️
            </div>
        </div>

        <!-- SUB-BARRA DE REGLAS -->
        <div style="position:absolute; bottom:160px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; background:rgba(9, 14, 23, 0.92); border:1.5px solid #00b0ff; padding:12px 32px; border-radius:24px; color:#00e5ff; font-size:20px; font-weight:800; box-shadow:0 10px 30px rgba(0,0,0,0.85); white-space:nowrap; letter-spacing:0.5px;">
            <span>🏟️ 16 Colosos Europeos Mano a Mano</span>
        </div>
    `);
    await page.setContent(htmlApertura, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_apertura.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 2: CRITERIOS DE EVALUACIÓN (6s a 16s)
    // 4 Criterios limpios sin íconos, toma aérea de San Siro visible abajo
    // ==========================================
    const renderCriterioCard = (num, title, desc, color) => `
        <div style="background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(9, 14, 23, 0.99) 100%); border:1.8px solid rgba(255, 255, 255, 0.16); border-left:6px solid ${color}; border-radius:20px; padding:12px 20px; display:flex; align-items:center; box-shadow:0 10px 25px rgba(0,0,0,0.85);">
            <div>
                <div style="color:${color}; font-size:18px; font-weight:900; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:2px;">
                    ${num}. ${title}
                </div>
                <div style="color:#cbd5e1; font-size:13.5px; font-weight:600; line-height:1.25;">
                    ${desc}
                </div>
            </div>
        </div>
    `;

    const htmlCriterios = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">REGLAS OFICIALES · ¿CÓMO ELEGIR?</div>
            <div class="header-title">4 CRITERIOS DE EVALUACIÓN</div>
            <div class="header-sub">Analizá cada punto antes de dejar tu voto 🗳️</div>
        </div>

        <!-- CONTENEDOR DE 4 CRITERIOS (y: 200 a 640px) -->
        <div style="position:absolute; top:200px; left:50px; width:980px; display:flex; flex-direction:column; gap:10px;">
            ${renderCriterioCard('1', 'CAPACIDAD & CONVOCATORIA', 'Aforo oficial de público y el impacto de llenar semejante coloso.', '#00e676')}
            ${renderCriterioCard('2', 'ESTÉTICA & VISTA AÉREA', 'Belleza visual, armonía de colores y cómo luce la cancha desde el cielo.', '#ffd700')}
            ${renderCriterioCard('3', 'ARQUITECTURA & TECHO', 'Estructura de gradas, innovación, cubiertas de vanguardia y valor histórico.', '#00b0ff')}
            ${renderCriterioCard('4', 'ACÚSTICA & PRESIÓN DE CALDERA', 'Mística, cercanía de tribunas y el eco ensordecedor de los cantos.', '#ff3d71')}
        </div>

        <div style="position:absolute; bottom:160px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; background:linear-gradient(135deg, #00b0ff 0%, #00e5ff 100%); border:2px solid #ffffff; padding:12px 32px; border-radius:24px; color:#0b111e; font-size:22px; font-weight:900; box-shadow:0 10px 30px rgba(0, 176, 255, 0.6); white-space:nowrap; text-transform:uppercase;">
            <span>👉 A CONTINUACIÓN: EL CUADRO DE OCTAVOS</span>
        </div>
    `);
    await page.setContent(htmlCriterios, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_criterios.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 3: CUADRO OFICIAL DE PLAYOFFS (16s a 27s)
    // Árbol eliminatorio tipo Champions League con la Copa Dorada 3D en la Gran Final
    // ==========================================
    const renderMatchCard = (num, e1, n1, c1, e2, n2, c2, side = 'left', yPos) => {
        const borderSide = side === 'left' ? 'border-left: 5px solid #00b0ff;' : 'border-right: 5px solid #ffd700;';
        const badgeColor = side === 'left' ? '#00e5ff' : '#ffd700';
        return `
        <div style="position:absolute; top:${yPos}px; ${side === 'left' ? 'left:25px;' : 'right:25px;'} width:250px; height:92px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:1.5px solid rgba(255,255,255,0.2); ${borderSide} border-radius:16px; padding:8px 12px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 10px 25px rgba(0,0,0,0.88); z-index:5;">
            <!-- Equipo 1 -->
            <div style="display:flex; align-items:center; gap:8px;">
                <img src="${e1}" style="width:26px; height:26px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                <span style="color:#ffffff; font-size:14px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${n1}</span>
                <span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:1px 5px; font-size:11px; font-weight:800; color:#94a3b8;">${c1}</span>
            </div>
            <!-- Divisor con etiqueta del Cruce -->
            <div style="height:1px; background:rgba(255,255,255,0.14); position:relative; margin:2px 0;">
                <span style="position:absolute; top:-8px; ${side === 'left' ? 'right:8px;' : 'left:8px;'} background:#090f1a; color:${badgeColor}; font-size:10px; font-weight:900; padding:1px 6px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);">CRUCE ${num}</span>
            </div>
            <!-- Equipo 2 -->
            <div style="display:flex; align-items:center; gap:8px;">
                <img src="${e2}" style="width:26px; height:26px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                <span style="color:#ffffff; font-size:14px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${n2}</span>
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
            <div class="header-sub">El camino a la Gran Final de la Eurocopa</div>
        </div>

        <!-- CABECERAS DE OCTAVOS DE FINAL (CUARTOS, SEMIS Y FINAL YA ESTÁN EN LA PROPIA LLAVE) -->
        <div style="position:absolute; top:236px; left:25px; width:250px; text-align:center; background:linear-gradient(135deg, rgba(0, 176, 255, 0.22) 0%, rgba(0, 176, 255, 0.08) 100%); border:1.8px solid #00b0ff; border-radius:12px; padding:7px 10px; box-shadow:0 8px 20px rgba(0,0,0,0.7);">
            <span style="color:#00e5ff; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">🟦 OCTAVOS (LLAVE A)</span>
        </div>

        <div style="position:absolute; top:236px; left:805px; width:250px; text-align:center; background:linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(255, 215, 0, 0.08) 100%); border:1.8px solid #ffd700; border-radius:12px; padding:7px 10px; box-shadow:0 8px 20px rgba(0,0,0,0.7);">
            <span style="color:#ffd700; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">🟨 OCTAVOS (LLAVE B)</span>
        </div>

        <!-- SVG DE LÍNEAS CONECTORAS DEL BRACKET -->
        <svg style="position:absolute; top:0; left:0; width:1080px; height:1920px; z-index:2; pointer-events:none;">
            <!-- LLAVE IZQUIERDA (LLAVE A) -->
            <path d="M 275 ${bCY1} L 295 ${bCY1} L 295 ${bCY2} L 275 ${bCY2}" fill="none" stroke="rgba(0, 176, 255, 0.75)" stroke-width="2.5" />
            <path d="M 295 ${bCYC1} L 315 ${bCYC1}" fill="none" stroke="rgba(0, 176, 255, 0.95)" stroke-width="2.5" />

            <path d="M 275 ${bCY3} L 295 ${bCY3} L 295 ${bCY4} L 275 ${bCY4}" fill="none" stroke="rgba(0, 176, 255, 0.75)" stroke-width="2.5" />
            <path d="M 295 ${bCYC2} L 315 ${bCYC2}" fill="none" stroke="rgba(0, 176, 255, 0.95)" stroke-width="2.5" />

            <path d="M 385 ${bCYC1} L 398 ${bCYC1} L 398 ${bCYC2} L 385 ${bCYC2}" fill="none" stroke="rgba(0, 229, 255, 0.75)" stroke-width="2.5" />
            <path d="M 398 ${bCYSemi} L 408 ${bCYSemi}" fill="none" stroke="rgba(0, 229, 255, 0.95)" stroke-width="2.5" />

            <path d="M 463 ${bCYSemi} L 475 ${bCYSemi}" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3,2" />

            <!-- LLAVE DERECHA (LLAVE B) -->
            <path d="M 805 ${bCY1} L 785 ${bCY1} L 785 ${bCY2} L 805 ${bCY2}" fill="none" stroke="rgba(255, 215, 0, 0.75)" stroke-width="2.5" />
            <path d="M 785 ${bCYC1} L 765 ${bCYC1}" fill="none" stroke="rgba(255, 215, 0, 0.95)" stroke-width="2.5" />

            <path d="M 805 ${bCY3} L 785 ${bCY3} L 785 ${bCY4} L 805 ${bCY4}" fill="none" stroke="rgba(255, 215, 0, 0.75)" stroke-width="2.5" />
            <path d="M 785 ${bCYC2} L 765 ${bCYC2}" fill="none" stroke="rgba(255, 215, 0, 0.95)" stroke-width="2.5" />

            <path d="M 695 ${bCYC1} L 682 ${bCYC1} L 682 ${bCYC2} L 695 ${bCYC2}" fill="none" stroke="rgba(0, 229, 255, 0.75)" stroke-width="2.5" />
            <path d="M 682 ${bCYSemi} L 672 ${bCYSemi}" fill="none" stroke="rgba(0, 229, 255, 0.95)" stroke-width="2.5" />

            <path d="M 617 ${bCYSemi} L 605 ${bCYSemi}" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3,2" />
        </svg>

        <!-- CRUCES DE OCTAVOS (IZQUIERDA) -->
        ${renderMatchCard('1', escudos.real, 'S. Bernabéu', 'ESP', escudos.liverpool, 'Anfield', 'ENG', 'left', bY1)}
        ${renderMatchCard('2', escudos.milan, 'San Siro', 'ITA', escudos.dortmund, 'Signal Iduna', 'GER', 'left', bY2)}
        ${renderMatchCard('3', escudos.athletic, 'San Mamés', 'ESP', escudos.manutd, 'Old Trafford', 'ENG', 'left', bY3)}
        ${renderMatchCard('4', escudos.bayern, 'Allianz Arena', 'GER', escudos.arsenal, 'Emirates', 'ENG', 'left', bY4)}

        <!-- NODOS DE CUARTOS (IZQUIERDA) -->
        ${renderStageNode('CUARTOS 1', 315, bCYC1 - 20, 70, 40, 'rgba(0,176,255,0.7)', '#00e5ff')}
        ${renderStageNode('CUARTOS 2', 315, bCYC2 - 20, 70, 40, 'rgba(0,176,255,0.7)', '#00e5ff')}

        <!-- NODO DE SEMIFINAL 1 (IZQUIERDA) -->
        ${renderStageNode('SEMI 1', 408, bCYSemi - 22, 55, 44, 'rgba(0,229,255,0.85)', '#00e5ff')}

        <!-- NODO CENTRAL: GRAN FINAL (CON LA COPA REAL DE ESTADIOS VIRTUALES) -->
        <div style="position:absolute; left:475px; top:${bCYSemi - 115}px; width:130px; height:230px; background:linear-gradient(135deg, rgba(20, 32, 50, 0.99) 0%, rgba(9, 14, 23, 1) 100%); border:2.5px solid #ffd700; border-radius:24px; padding:12px 6px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center; box-shadow:0 14px 40px rgba(0,0,0,0.92), 0 0 35px rgba(255,215,0,0.45); z-index:10;">
            <div style="background:rgba(255,215,0,0.22); border:1px solid #ffd700; border-radius:8px; padding:2px 8px; color:#ffd700; font-size:11px; font-weight:900; letter-spacing:1px;">COPA</div>
            <div style="width:115px; height:108px; display:flex; align-items:center; justify-content:center; position:relative; margin:2px 0;">
                <div style="position:absolute; width:85px; height:85px; background:radial-gradient(circle, rgba(255,215,0,0.55) 0%, transparent 70%); border-radius:50%; filter:blur(10px);"></div>
                <img src="${trofeoCopa}" style="width:100%; height:100%; object-fit:contain; position:relative; z-index:2; filter:drop-shadow(0 8px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 22px rgba(255,215,0,0.75));">
            </div>
            <div>
                <div style="color:#ffffff; font-size:13px; font-weight:900; line-height:1.15; text-transform:uppercase;">GRAN<br>FINAL</div>
                <div style="color:#00ff77; font-size:10px; font-weight:900; margin-top:4px; letter-spacing:0.5px;">1 CAMPEÓN</div>
            </div>
        </div>

        <!-- NODO DE SEMIFINAL 2 (DERECHA) -->
        ${renderStageNode('SEMI 2', 617, bCYSemi - 22, 55, 44, 'rgba(0,229,255,0.85)', '#00e5ff')}

        <!-- NODOS DE CUARTOS (DERECHA) -->
        ${renderStageNode('CUARTOS 3', 695, bCYC1 - 20, 70, 40, 'rgba(255,215,0,0.7)', '#ffd700')}
        ${renderStageNode('CUARTOS 4', 695, bCYC2 - 20, 70, 40, 'rgba(255,215,0,0.7)', '#ffd700')}

        <!-- CRUCES DE OCTAVOS (DERECHA) -->
        ${renderMatchCard('5', escudos.wembley, 'Wembley', 'ENG', escudos.atleti, 'Metropolitano', 'ESP', 'right', bY1)}
        ${renderMatchCard('6', escudos.psg, 'Parque Príncipes', 'FRA', escudos.ajax, 'Johan Cruyff', 'NED', 'right', bY2)}
        ${renderMatchCard('7', escudos.napoli, 'Stadio Maradona', 'ITA', escudos.marsella, 'O. Marsella', 'FRA', 'right', bY3)}
        ${renderMatchCard('8', escudos.benfica, 'Estádio da Luz', 'POR', escudos.roma, 'Stadio Olimpico', 'ITA', 'right', bY4)}

        <!-- BANNER DE INFO (y: 1480) -->
        <div style="position:absolute; top:1480px; left:50%; transform:translateX(-50%); width:980px; background:rgba(14, 26, 42, 0.94); border:1.5px solid rgba(0, 176, 255, 0.45); border-radius:18px; padding:12px 20px; display:flex; align-items:center; justify-content:center; gap:16px; box-shadow:0 8px 25px rgba(0,0,0,0.8);">
            <span style="color:#00e5ff; font-size:17px; font-weight:900;">🟦 LLAVE A</span>
            <span style="color:#ffffff; font-size:15px; font-weight:700;">· 16 Estadios Legendarios de Europa ·</span>
            <span style="color:#ffd700; font-size:17px; font-weight:900;">🟨 LLAVE B</span>
        </div>

        <!-- BOTÓN FOOTER COMUNIDAD -->
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
            <div class="header-badge">ESTADIOS VIRTUALES · EUROCOPA</div>
            <div class="header-title">¡EL TORNEO YA EMPEZÓ!</div>
            <div class="header-sub">Tu voto decide quién clasifica a Cuartos 🏆</div>
        </div>

        <!-- CAJA DE LLAMADO A LA ACCIÓN -->
        <div style="position:absolute; top:670px; left:50px; width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2.5px solid rgba(0, 176, 255, 0.8); border-radius:32px; padding:30px 30px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.92), 0 0 40px rgba(0, 176, 255, 0.35);">
            <div style="width:110px; height:95px; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; position:relative;">
                <div style="position:absolute; width:85px; height:85px; background:radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%); border-radius:50%; filter:blur(12px);"></div>
                <img src="${trofeoCopa}" style="width:100%; height:100%; object-fit:contain; position:relative; z-index:2; filter:drop-shadow(0 10px 22px rgba(0,0,0,0.85)) drop-shadow(0 0 25px rgba(255,215,0,0.8));">
            </div>
            <div style="color:#ffffff; font-size:42px; font-weight:900; line-height:1.1; margin-bottom:12px; text-transform:uppercase;">
                ¿QUÉ ESTADIO GANARÁ LA EUROCOPA?
            </div>
            
            <div style="color:#ffd700; font-size:24px; font-weight:800; line-height:1.3; margin-bottom:20px;">
                Seguinos y activá notificaciones para votar en cada llave mano a mano 🗳️
            </div>

            <div style="background:linear-gradient(135deg, #00b0ff 0%, #00e5ff 100%); color:#0b111e; font-size:24px; font-weight:900; padding:14px 24px; border-radius:24px; border:2px solid #ffffff; box-shadow:0 8px 25px rgba(0, 176, 255, 0.5); text-transform:uppercase;">
                👉 DEJÁ TU CANDIDATO AHORA EN COMENTARIOS
            </div>
        </div>

        <!-- CTA ELEVADO (bottom: 240px) -->
        <div style="position:absolute; bottom:240px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:24px; padding:18px 24px; display:flex; align-items:center; justify-content:center; gap:14px; box-shadow:0 16px 40px rgba(0,0,0,0.85), 0 0 30px rgba(0, 230, 118, 0.45); border:2px solid #ffffff;">
            <img src="${logoEv}" style="width:48px; height:48px; border-radius:10px;">
            <span style="color:#04160a; font-size:27px; font-weight:900; letter-spacing:-0.3px;">Jugá la trivia de estadios en estadiosvirtuales.com</span>
        </div>

        <!-- SEGUINOS SUB-PILL (bottom: 165px) -->
        <div style="position:absolute; bottom:165px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:8px; background:rgba(9, 14, 23, 0.92); border:1.5px solid #00b0ff; padding:8px 24px; border-radius:20px; color:#00e5ff; font-size:20px; font-weight:800; box-shadow:0 8px 25px rgba(0,0,0,0.85); white-space:nowrap; letter-spacing:0.5px;">
            <span>🔔 ¡Seguinos para no perderte ningún cruce! ⚽</span>
        </div>
    `);
    await page.setContent(htmlCta, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_cta.png'), omitBackground: true });

    await browser.close();
    console.log('✅ Overlays de Eurocopa generados exitosamente.');
}

// ==========================================
// 3. GENERADOR DE PORTADA (SAFE ZONE 3:4 TIKTOK)
// ==========================================
async function generarPortadaEurocopa(outFolder, bgFramePath) {
    console.log(`🎨 Generando portada para la presentación de la Eurocopa...`);
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
            
            .brand-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(0, 176, 255, 0.6); border-top: 2.5px solid rgba(130, 220, 255, 0.95); border-radius: 35px; color: #00e5ff; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 10px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(0, 176, 255, 0.35); }
            
            .main-box { display: flex; flex-direction: column; align-items: center; gap: 18px; width: 100%; }
            .hook-pill { background: rgba(0, 176, 255, 0.15); border: 2px solid #00b0ff; color: #00e5ff; font-size: 24px; font-weight: 900; letter-spacing: 1.5px; padding: 10px 28px; border-radius: 20px; box-shadow: 0 0 20px rgba(0, 176, 255, 0.3); text-transform: uppercase; }
            .main-title { color: #ffffff; font-size: 68px; font-weight: 900; line-height: 1.08; letter-spacing: -1px; text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(0, 176, 255, 0.4); text-transform: uppercase; }
            .sub-title { color: #ffd700; font-size: 28px; font-weight: 800; }

            .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; margin: 15px 0; }
            .feature-card { background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%); border: 1.5px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,0.8); text-align: center; }
            .feature-text { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; }
            
            .cta-card { width: 100%; background: linear-gradient(135deg, rgba(14, 26, 42, 0.95) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(0, 176, 255, 0.5); border-radius: 24px; padding: 18px; display: flex; align-items: center; justify-content: center; gap: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.8); }
            .cta-text { color: #00e5ff; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>

        <div class="safe-zone">
            <div class="brand-badge">
                <img src="${logoEv}" style="width: 32px; height: 32px; border-radius: 6px;">
                <span>EUROCOPA DE ESTADIOS · PRESENTACIÓN</span>
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
                <span class="cta-text">🗳️ ¡Dejá tu candidato en comentarios! ⚽</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 5000 });
    const portadaPath = path.join(outFolder, "Portada_Presentacion_Eurocopa_Estadios.jpg");
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// ==========================================
// 4. PIPELINE COMPLETO DE RENDERIZADO (35s)
// ==========================================
async function renderizarVideoPresentacionEurocopa() {
    console.log(`\n🏆 ========================================================`);
    console.log(`🏆 PRODUCCIÓN: VIDEO DE PRESENTACIÓN EUROCOPA DE ESTADIOS (35s)`);
    console.log(`🏆 ========================================================\n`);

    if (!fs.existsSync(OUT_FOLDER)) {
        fs.mkdirSync(OUT_FOLDER, { recursive: true });
    }
    const assetsDir = path.join(OUT_FOLDER, 'assets_temp');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    // 1. Guardar copy de publicación
    const copy = `🏆 ¡GRAN EUROCOPA DE ESTADIOS! 🇪🇺⚽
Llegó la competencia de los colosos del Viejo Continente: 16 templos legendarios de Europa se enfrentan cara a cara por la corona y VOS definís al campeón con tu voto en los comentarios.

📍 16 ESTADIOS EN COMPETENCIA:
🇪🇸 Santiago Bernabéu (Real Madrid)
🏴󠁧󠁢󠁥󠁮󠁧󠁿 Anfield (Liverpool FC)
🇮🇹 San Siro (Milan / Inter)
🇩🇪 Signal Iduna Park (Borussia Dortmund)
🇪🇸 San Mamés (Athletic Club)
🏴󠁧󠁢󠁥󠁮󠁧󠁿 Old Trafford (Manchester United)
🇩🇪 Allianz Arena (Bayern Múnich)
🏴󠁧󠁢󠁥󠁮󠁧󠁿 Emirates Stadium (Arsenal)
🏴󠁧󠁢󠁥󠁮󠁧󠁿 Wembley Stadium (Selección Inglaterra)
🇪🇸 Riyadh Air Metropolitano (Atlético de Madrid)
🇫🇷 Parque de los Príncipes (PSG)
🇳🇱 Johan Cruyff Arena (Ajax)
🇮🇹 Diego Armando Maradona (Napoli)
🇫🇷 Orange Vélodrome (Olympique de Marsella)
🇵🇹 Estádio da Luz (Benfica)
🇮🇹 Stadio Olimpico (AS Roma)

⚖️ 4 CRITERIOS DE EVALUACIÓN:
1️⃣ Capacidad & Convocatoria
2️⃣ Estética & Vista Aérea
3️⃣ Arquitectura & Techo
4️⃣ Acústica & Presión de Caldera

💬 ¿Cuál de estos 16 estadios se queda con la corona europea? Dejá tu candidato ahora en los comentarios 👇

📲 Jugá gratis a adivinar estadios del mundo en www.estadiosvirtuales.com (Link en bio)

#EurocopaDeEstadios #Eurocopa #EstadiosVirtuales #Estadios #ChampionsLeague #Bernabeu #SanSiro #Anfield #Wembley #OldTrafford #FutbolEuropeo`;

    fs.writeFileSync(path.join(OUT_FOLDER, 'TEXTOS_PUBLICACION.txt'), copy, 'utf8');
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt guardado.');

    // 2. Extraer frame de fondo para portada (del Bernabéu)
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
    await generarPortadaEurocopa(OUT_FOLDER, bgFramePath);

    // 4. Generar Overlays transparentes
    await generarOverlaysEurocopa(assetsDir);

    // 5. Generar Audio procedural de 35s
    const audioPath = path.join(assetsDir, 'audio_presentacion.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(35.0));

    // 6. Composición con FFmpeg
    // 5 videos de fondo: 0:v (Bernabeu), 1:v (SanSiro), 2:v (Wembley), 3:v (Borussia), 4:v (Allianz)
    const videoOutPath = path.join(OUT_FOLDER, "Presentacion_Oficial_Eurocopa_Estadios.mp4");

    const filterComplex = [
        // Escalado vertical cinematográfico con boxblur difuminado de fondo y video 16:9 centrado
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

        `[4:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg4]`,
        `[4:v]fps=30,trim=0:12,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=decrease[fg4]`,
        `[bg4][fg4]overlay=0:656[v4]`,

        // Transiciones XFADE suaves de 0.8s
        `[v0][v1]xfade=transition=fade:duration=0.8:offset=5.5[x1]`,
        `[x1][v2]xfade=transition=fade:duration=0.8:offset=15.5[x2]`,
        `[x2][v3]xfade=transition=fade:duration=0.8:offset=22.0[x3]`,
        `[x3][v4]xfade=transition=fade:duration=0.8:offset=28.0[base_video]`,

        // Aplicación de los 4 Overlays en sincronía temporal
        `[5:v]format=rgba[ov_apertura]`,
        `[6:v]format=rgba[ov_criterios]`,
        `[7:v]format=rgba[ov_cuadro]`,
        `[8:v]format=rgba[ov_cta]`,

        `[base_video][ov_apertura]overlay=0:0:enable='between(t,0,6.0)'[tmp1]`,
        `[tmp1][ov_criterios]overlay=0:0:enable='between(t,6.0,16.0)'[tmp2]`,
        `[tmp2][ov_cuadro]overlay=0:0:enable='between(t,16.0,27.0)'[tmp3]`,
        `[tmp3][ov_cta]overlay=0:0:enable='between(t,27.0,35.0)'[final_video]`
    ];

    const ovApertura = path.join(assetsDir, 'overlay_apertura.png');
    const ovCriterios = path.join(assetsDir, 'overlay_criterios.png');
    const ovCuadro = path.join(assetsDir, 'overlay_cuadro.png');
    const ovCta = path.join(assetsDir, 'overlay_cta.png');

    console.log(`🎬 Renderizando video de presentación 1080x1920 (35s) con FFmpeg: ${videoOutPath}...`);

    const ffmpegArgs = [
        '-y',
        '-i', BG_VIDEOS[0].path,
        '-i', BG_VIDEOS[1].path,
        '-i', BG_VIDEOS[2].path,
        '-i', BG_VIDEOS[3].path,
        '-i', BG_VIDEOS[4].path,
        '-i', ovApertura,
        '-i', ovCriterios,
        '-i', ovCuadro,
        '-i', ovCta,
        '-i', audioPath,
        '-filter_complex', filterComplex.join(';'),
        '-map', '[final_video]',
        '-map', '9:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '19',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', '35.0',
        videoOutPath
    ];

    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);

        ff.stderr.on('data', (d) => {
            const line = d.toString();
            const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:35.00`);
            }
        });

        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO DE PRESENTACIÓN DE EUROCOPA FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
                // Limpieza de temporales
                try {
                    fs.rmSync(assetsDir, { recursive: true, force: true });
                } catch(e) {}
                resolve();
            } else {
                reject(new Error(`FFmpeg falló con código ${code}`));
            }
        });
    });
}

if (require.main === module) {
    renderizarVideoPresentacionEurocopa().catch(console.error);
}

module.exports = { renderizarVideoPresentacionEurocopa };
