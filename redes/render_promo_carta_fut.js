const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 MOTOR OFICIAL: PROMO VIRAL CARTA FUT (20s FULL HD 9:16)');
console.log('🚀 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Directorio base con fallback automático si el disco externo E:\ no está montado
const BASE_OUTPUT_DIR = fs.existsSync("E:\\Google earth studio\\videos para mostrar")
    ? "E:\\Google earth studio\\videos para mostrar\\CARTAS FUT"
    : path.join(__dirname, "..", "videos_output", "CARTAS FUT");

function getBase64Image(filePath) {
    try {
        if (!fs.existsSync(filePath)) return '';
        const ext = path.extname(filePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
        return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
    } catch (_) {
        return '';
    }
}

// ==========================================
// CONFIGURACIONES POR PROMO (Modular)
// ==========================================
const CONFIG_PROMOS = {
    'promo-01': {
        slug: 'PROMO-01-CREA-TU-CARTA',
        videoName: 'Promo_Crea_Tu_Carta_FUT.mp4',
        portadaName: 'Portada_Promo_Carta_FUT.jpg',
        titleMain: '¿SABÍAS QUE PODÉS CREAR<br>TU PROPIA CARTA FUT?',
        titleSub: 'Con el escudo de tu club ⚽🔥',
        drone1: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\Sin título.mp4",
        drone2: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\Boca 2.mp4",
        hookCards: {
            left: {
                theme: 'boca',
                ovr: '92',
                pos: 'DEL',
                escudo: 'Boca.webp',
                avatar: '27.webp',
                name: 'EL APACHE',
                stats: [['95', 'MAX'], ['88', 'PG'], ['85%', 'WR'], ['32K', 'XP']]
            },
            center: {
                theme: 'gold',
                ovr: '99',
                pos: 'DEL',
                escudo: 'Logo.webp',
                avatar: '1.webp',
                name: 'LA PULGA',
                stats: [['99', 'MAX'], ['99', 'PG'], ['98%', 'WR'], ['45K', 'XP']]
            },
            right: {
                theme: 'river',
                ovr: '94',
                pos: 'DEL',
                escudo: 'River.webp',
                avatar: '19.webp',
                name: 'LA ARAÑA',
                stats: [['94', 'MAX'], ['91', 'PG'], ['82%', 'WR'], ['28K', 'XP']]
            }
        },
        step1: {
            eyebrow: 'PASO 1 DE 3',
            title: 'ELEGÍ TU CLUB Y TU POSICIÓN',
            subtitle: '+100 Escudos oficiales y posiciones tácticas ⚽',
            centerCard: {
                theme: 'arg',
                ovr: '89',
                pos: 'DEL',
                escudo: 'Racing.webp',
                avatar: '1.webp',
                name: 'TU JUGADOR',
                stats: [['89', 'MAX'], ['24', 'PJ'], ['18', 'PG'], ['75%', 'WR']]
            },
            carousel: [
                { name: 'RIVER', escudo: 'River.webp' },
                { name: 'BOCA', escudo: 'Boca.webp' },
                { name: 'RACING', escudo: 'Racing.webp', active: true },
                { name: 'BARÇA', escudo: 'Barca.webp' },
                { name: 'MADRID', escudo: 'Real.webp' }
            ]
        },
        step2: {
            eyebrow: 'PASO 2 DE 3',
            title: 'SE DESBLOQUEAN TUS STATS',
            subtitle: 'Subí de nivel y acumulá XP adivinando estadios 🏟️🔥',
            card: {
                theme: 'gold',
                ovr: '95',
                pos: 'DEL',
                escudo: 'Boca.webp',
                avatar: '1.webp',
                name: 'GONZÁLEZ #9',
                stats: [['24.5K', 'MAX'], ['52', 'PJ'], ['41', 'PG'], ['79%', 'WR'], ['38.2K', 'XP TOTAL']]
            }
        },
        step3: {
            card: {
                theme: 'gold',
                ovr: '95',
                pos: 'DEL',
                escudo: 'Boca.webp',
                avatar: '1.webp',
                name: 'TU NOMBRE',
                stats: [['24K', 'MAX'], ['52', 'PJ'], ['41', 'PG'], ['79%', 'WR']]
            }
        },
        portada: {
            titleHtml: '¿CÓMO CREAR TU<br><span style="color:#ffd700;">PROPIA CARTA FUT?</span>',
            subtitle: 'Con el escudo de tu club ⚽🔥',
            card: {
                ovr: '99',
                pos: 'DEL',
                escudo: 'Boca.webp',
                avatar: '1.webp',
                name: 'TU NOMBRE',
                stats: [['99', 'MAX'], ['99', 'PG'], ['98%', 'WR'], ['45K', 'XP']]
            }
        },
        textos: `🔥 ¿SABÍAS QUE PODÉS CREAR TU PROPIA CARTA FUT CON EL ESCUDO DE TU CLUB? ⚽🔥

Personalizá tu carta con el escudo de tu equipo (River, Boca, Racing, San Lorenzo, Newell's, Central y +100 clubes), elegí tu posición en cancha y subí de nivel con tus estadísticas reales de juego.

📲 ¡Creá la tuya en el link de mi perfil!
👉 www.estadiosvirtuales.com

¿De qué club vas a armar tu carta? Dejamelo en los comentarios 👇

#CartaFUT #EstadiosVirtuales #FutbolArgentino #BocaJuniors #RiverPlate #RacingClub #SanLorenzo #FIFA24 #EAFC24 #StadiumGuessr #Futbol #Estadios`
    },
    'promo-02-laliga': {
        slug: 'PROMO-02-LALIGA',
        videoName: 'Promo_02_LaLiga_Carta_FUT.mp4',
        portadaName: 'Portada_Promo_02_LaLiga.jpg',
        titleMain: '¿DE QUÉ LADO DEL CLÁSICO ESTÁS?<br>CREÁ TU CARTA FUT',
        titleSub: 'Real Madrid vs Barcelona · LaLiga EA Sports 🇪🇸👑',
        drone1: "E:\\Google earth studio\\España\\Bloque A\\bernabeu.mp4",
        drone2: "E:\\Google earth studio\\España\\Spotify Camp Nou_ Barcelona.mp4",
        hookCards: {
            left: {
                theme: 'real',
                ovr: '99',
                pos: 'DEL',
                escudo: 'Real.webp',
                avatar: '2.webp',
                name: 'EL BICHO',
                stats: [['99', 'MAX'], ['96', 'PG'], ['94%', 'WR'], ['48K', 'XP']]
            },
            center: {
                theme: 'gold',
                ovr: '99',
                pos: 'DEL',
                escudo: 'Logo.webp',
                avatar: '1.webp',
                name: 'LA PULGA',
                stats: [['99', 'MAX'], ['99', 'PG'], ['98%', 'WR'], ['50K', 'XP']]
            },
            right: {
                theme: 'barca',
                ovr: '91',
                pos: 'DEL',
                escudo: 'Barca.webp',
                avatar: 'Lamine Yamal.webp',
                name: 'YAMAL',
                stats: [['92', 'MAX'], ['88', 'PG'], ['86%', 'WR'], ['29K', 'XP']]
            }
        },
        step1: {
            eyebrow: 'PASO 1 DE 3 · LALIGA',
            title: 'ELEGÍ TU CLUB Y TU POSICIÓN',
            subtitle: 'Real Madrid, Barcelona, Atlético y los gigantes de España 🇪🇸',
            centerCard: {
                theme: 'real',
                ovr: '94',
                pos: 'DEL',
                escudo: 'Real.webp',
                avatar: '2.webp',
                name: 'TU JUGADOR',
                stats: [['94', 'MAX'], ['38', 'PJ'], ['31', 'PG'], ['82%', 'WR']]
            },
            carousel: [
                { name: 'BARÇA', escudo: 'Barca.webp' },
                { name: 'MADRID', escudo: 'Real.webp', active: true },
                { name: 'ATLETI', escudo: 'AMadrid.webp' },
                { name: 'BETIS', escudo: 'Betis.webp' },
                { name: 'SEVILLA', escudo: 'Sevilla.webp' }
            ]
        },
        step2: {
            eyebrow: 'PASO 2 DE 3 · STATS DE JUEGO',
            title: 'SE DESBLOQUEAN TUS STATS',
            subtitle: 'Adiviná estadios del mundo y acumulá nivel XP 🏟️🔥',
            card: {
                theme: 'gold',
                ovr: '96',
                pos: 'DEL',
                escudo: 'Real.webp',
                avatar: '2.webp',
                name: 'CR7_FAN #7',
                stats: [['24.8K', 'MAX'], ['64', 'PJ'], ['53', 'PG'], ['83%', 'WR'], ['42.5K', 'XP TOTAL']]
            }
        },
        step3: {
            card: {
                theme: 'gold',
                ovr: '96',
                pos: 'DEL',
                escudo: 'Real.webp',
                avatar: '2.webp',
                name: 'TU NOMBRE',
                stats: [['25K', 'MAX'], ['64', 'PJ'], ['53', 'PG'], ['83%', 'WR']]
            }
        },
        portada: {
            titleHtml: 'CREÁ TU CARTA FUT<br><span style="color:#ffd700;">REAL MADRID O BARÇA</span>',
            subtitle: '¿De qué lado del Clásico estás? ⚽🇪🇸',
            card: {
                ovr: '99',
                pos: 'DEL',
                escudo: 'Real.webp',
                avatar: '2.webp',
                name: 'EL BICHO',
                stats: [['99', 'MAX'], ['96', 'PG'], ['94%', 'WR'], ['48K', 'XP']]
            }
        },
        textos: `═══════════════════════════════════════════════════════════════
PACK DE PUBLICACIÓN: PROMO-02-LALIGA · CARTA FUT
Estadios Virtuales · www.estadiosvirtuales.com
═══════════════════════════════════════════════════════════════

📌 VARIANTE 1: VIRAL / EL CLÁSICO (Recomendada para TikTok & Reels)
🔥 ¿DE QUÉ LADO DEL CLÁSICO ESTÁS? CREÁ TU PROPIA CARTA FUT 👑⚽

¿Sos del Real Madrid o del Barcelona? ¿Cristiano ('El Bicho') o Messi ('La Pulga')?
En www.estadiosvirtuales.com podés crear tu carta personalizada con el escudo de tu club, tu avatar y tus estadísticas reales adivinando estadios en StadiumGuessr.

📲 Tocá el link de mi perfil y armá la tuya ahora:
👉 www.estadiosvirtuales.com

👇 ¿A quién elegís para tu equipo? ¿Real Madrid o Barça? Dejalo en los comentarios.

#ElClasico #RealMadrid #FCBarcelona #CristianoRonaldo #Messi #LamineYamal #CartaFUT #LaLiga #Bernabeu #CampNou #StadiumGuessr #EstadiosVirtuales #Futbol #FIFA24 #EAFC24

───────────────────────────────────────────────────────────────
📌 VARIANTE 2: COLECCIÓN & PERSONALIZACIÓN (Ideal para Instagram & Facebook)
⚽ ¡TU PROPIA CARTA FUT CON EL ESCUDO DE TU EQUIPO FAVORITO! 🇪🇸✨

¿Querías una carta con el escudo del Real Madrid, Barça, Atlético de Madrid o Betis?
1️⃣ Entrá a www.estadiosvirtuales.com
2️⃣ Elegí tu posición y club favorito
3️⃣ Poné a prueba tu conocimiento de canchas en el Reto Diario y subí tu OVR al máximo.

🔗 Link directo en bio para armar tu carta sin registrarte ni descargar apps.

#CartaFUT #ColeccionFUT #LaLigaEA #HalaMadrid #ViscaBarca #FolletoFutbolero #GeografiaFutbolera #EstadiosDelMundo

───────────────────────────────────────────────────────────────
📌 VARIANTE 3: DESAFÍO 1v1 & SALAS PRIVADAS (Para comunidad gamer)
⚔️ ¿TE ANIMÁS A GANARME EN UN DUELO DE ESTADIOS? 🏟️🔥

Creá tu carta FUT con stats reales de juego, escaneá el código QR en pantalla o entrá al link de mi perfil para desafiar a tus amigos en salas 1v1 privadas en vivo.

🎮 Jugá gratis en www.estadiosvirtuales.com y demostrá quién sabe más de fútbol mundial.

#RetoFutbolero #1v1Futbol #DueloDeEstadios #StadiumGuessr #GamerFootball #FUT24

───────────────────────────────────────────────────────────────
📌 VARIANTE 4: COMUNIDAD Y DEBATE (Máximo engagement de comentarios)
💬 ENCUESTA DEFINITIVA: ¿Cuál es la mejor carta del video?
A) Cristiano Ronaldo (Real Madrid - 99 OVR) 👑
B) Lionel Messi (Gold - 99 OVR) 🐐
C) Lamine Yamal (Barça - 91 OVR) 💎

Armá la tuya con el club que quieras en el enlace de mi perfil 👉 www.estadiosvirtuales.com

───────────────────────────────────────────────────────────────
💬 PRIMER COMENTARIO FIJADO (Pinned Comment sugerido):
👉 Creá tu carta FUT con el escudo de tu equipo acá: www.estadiosvirtuales.com (Link directo en mi perfil 📲) ¿De qué club la vas a armar? Te leo 👇
`
    }
};

// ==========================================
// SÍNTESIS DE AUDIO PROCEDURAL (Puro, Cero Whooshes)
// ==========================================
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

    function addBellDing(startSec, freq = 987.77) {
        addTone(startSec, 1.2, freq, 0.35, 4);
        addTone(startSec + 0.03, 1.0, freq * 1.5, 0.2, 5);
    }

    function addTick(startSec, freq = 1200) {
        addTone(startSec, 0.05, freq, 0.3, 25);
    }

    // 0.5s: Campana de inicio
    addBellDing(0.5, 784);

    // 4s - 8s: Ticks de selección de club y posición
    addTick(4.2, 1100);
    addTick(5.0, 1250);
    addTick(5.8, 1400);
    addTick(6.6, 1550);
    addTick(7.4, 1700);

    // 9.0s: Desbloqueo y revelación de carta (Campana mayor y acorde de gloria)
    addBellDing(9.0, 1046.5);
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(9.1 + idx * 0.08, 3.2, freq, 0.32, 1.8);
    });

    // 9.5s: Transición de estadio (Campana brillante y acorde aéreo)
    addBellDing(9.5, 1174.66);
    addTone(9.6, 2.5, 880.0, 0.25, 2.0);

    // 14.5s: Campana de póster y QR
    addBellDing(14.5, 987.77);
    [659.25, 830.61, 987.77, 1318.51].forEach((freq, idx) => {
        addTone(14.6 + idx * 0.07, 3.0, freq, 0.30, 2.0);
    });

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// ==========================================
// RENDERIZADO DE OVERLAYS EN PUPPETEER
// ==========================================
async function generarOverlaysPromo(config, assetsDir) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });

    const logoBase64 = getBase64Image(path.join(__dirname, '..', 'escudos', 'Logo.webp'));
    const dueloIconBase64 = getBase64Image(path.join(__dirname, '..', 'liga-icon-historial.webp'));
    const fuegoBase64 = getBase64Image(path.join(__dirname, '..', 'fuego.webp'));
    const trofeoBase64 = getBase64Image(path.join(__dirname, '..', 'trofeo.webp'));

    const cssGlobal = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            width: 1080px;
            height: 1920px;
            background: transparent;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            overflow: hidden;
            position: relative;
        }

        /* Silueta de Pelé idéntica a estilos.css */
        .fut-card {
            position: relative;
            width: 320px;
            height: 490px;
            padding: 30px 22px;
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #fff;
            font-family: 'Arial Black', Gadget, sans-serif;
            clip-path: path('M 0,40 C 0,30 13,23 32,18 C 83,10 134,6 147,4 C 153,2 156,0 160,0 C 164,0 167,2 173,4 C 186,6 237,10 288,18 C 307,23 320,30 320,40 L 320,390 C 320,430 230,465 160,490 C 90,465 0,430 0,390 Z');
            filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.85));
            flex-shrink: 0;
        }

        .fut-card.arg {
            background: linear-gradient(135deg, #74acdf 0%, #ffffff 50%, #74acdf 100%);
            color: #0b1320;
            border: 3px solid #ffd700;
        }
        .fut-card.arg .fut-name { border-bottom-color: rgba(0,0,0,0.3); }

        .fut-card.gold {
            background: linear-gradient(135deg, #e5b338 0%, #fff2a3 40%, #c48c1b 70%, #f7dc6f 100%);
            color: #1a1002;
            border: 3.5px solid #ffe877;
            filter: drop-shadow(0 22px 55px rgba(255, 215, 0, 0.45));
        }
        .fut-card.gold .fut-name { border-bottom-color: rgba(26, 16, 2, 0.4); }

        .fut-card.boca {
            background: linear-gradient(135deg, #002b66 0%, #ffd700 50%, #002b66 100%);
            color: #ffffff;
            border: 3.5px solid #ffd700;
        }
        .fut-card.river {
            background: linear-gradient(135deg, #ffffff 0%, #ee162d 50%, #ffffff 100%);
            color: #111827;
            border: 3.5px solid #ee162d;
        }
        .fut-card.river .fut-name { border-bottom-color: rgba(0,0,0,0.3); }

        .fut-card.real {
            background: linear-gradient(135deg, #ffffff 0%, #edf2f7 50%, #e2e8f0 100%);
            color: #0b1528;
            border: 3.5px solid #d4af37;
            filter: drop-shadow(0 22px 50px rgba(0, 0, 0, 0.85));
        }
        .fut-card.real .fut-name { border-bottom-color: rgba(11, 21, 40, 0.4); }

        .fut-card.barca {
            background: linear-gradient(135deg, #004d98 0%, #a50044 50%, #004d98 100%);
            color: #ffffff;
            border: 3.5px solid #ffd700;
            filter: drop-shadow(0 22px 50px rgba(0, 0, 0, 0.85));
        }
        .fut-card.barca .fut-name { border-bottom-color: rgba(255, 255, 255, 0.4); }

        .fut-top { display: flex; width: 100%; height: 50%; margin-top: 10px; }
        .fut-badge-meta { width: 34%; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
        .fut-ovr { font-size: 3.8rem; font-weight: 900; letter-spacing: -1.5px; }
        .fut-pos { font-size: 1.4rem; font-weight: 900; text-transform: uppercase; opacity: 0.9; margin-top: -2px; }
        .fut-club-icon { width: 62px; height: 62px; margin-top: 8px; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); }

        .fut-avatar-container {
            width: 65%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            overflow: visible;
        }

        .ac-avatar-full { 
            position: absolute; 
            bottom: -5px; 
            left: 50%;
            transform: translateX(-50%);
            width: 100%; 
            height: 100%; 
            display: flex;
            justify-content: center;
            align-items: flex-end;
            pointer-events: none;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
        }

        .ac-avatar-img-full {
            width: 110%;
            height: 100%;
            object-fit: cover;
            object-position: center 15%;
            filter: none;
        }

        .fut-name {
            width: 100%;
            text-align: center;
            font-size: 1.65rem;
            font-weight: 900;
            margin: 14px 0 10px;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            border-bottom: 1.5px solid;
            padding-bottom: 6px;
            white-space: nowrap;
        }

        .fut-stats-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            width: 95%;
            gap: 8px 18px;
            margin-top: 6px;
        }
        .fut-stat-item { display: flex; gap: 8px; justify-content: center; align-items: baseline; }
        .fut-stat-num { font-weight: 900; font-size: 1.4rem; }
        .fut-stat-label { opacity: 0.85; font-size: 0.95rem; font-weight: 800; }

        /* HEADER FLOTANTE SUPERIOR OFICIAL */
        .header-top {
            position: absolute;
            top: 60px;
            left: 50px;
            width: 980px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .eyebrow {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(10, 16, 26, 0.9);
            border: 1.5px solid rgba(0, 230, 118, 0.6);
            border-radius: 30px;
            padding: 8px 24px;
            color: #00ff77;
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
            box-shadow: 0 8px 25px rgba(0,0,0,0.7);
            margin-bottom: 14px;
        }
        .title-main {
            font-size: 44px;
            font-weight: 900;
            color: #ffffff;
            line-height: 1.15;
            text-shadow: 0 4px 18px rgba(0,0,0,0.9);
            text-transform: uppercase;
        }
        .title-sub {
            font-size: 22px;
            font-weight: 700;
            color: #ffd700;
            margin-top: 8px;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
    `;

    function renderCardHtml(cardData) {
        const escudoSrc = getBase64Image(path.join(__dirname, '..', 'escudos', cardData.escudo));
        const avatarSrc = getBase64Image(path.join(__dirname, '..', cardData.avatar));
        const statsHtml = cardData.stats.map(s => `
            <div class="fut-stat-item"><span class="fut-stat-num">${s[0]}</span><span class="fut-stat-label">${s[1]}</span></div>
        `).join('');

        return `
            <div class="fut-top">
                <div class="fut-badge-meta">
                    <div class="fut-ovr">${cardData.ovr}</div>
                    <div class="fut-pos">${cardData.pos}</div>
                    <img src="${escudoSrc}" class="fut-club-icon">
                </div>
                <div class="fut-avatar-container">
                    <div class="ac-avatar-full">
                        <img src="${avatarSrc}" class="ac-avatar-img-full" alt="Avatar">
                    </div>
                </div>
            </div>
            <div class="fut-name">${cardData.name}</div>
            <div class="fut-stats-row">
                ${statsHtml}
            </div>
        `;
    }

    // 1. OVERLAY HOOK (0s a 4s)
    const hook = config.hookCards;
    const htmlHook = `
    <!DOCTYPE html>
    <html>
    <head><style>${cssGlobal}</style></head>
    <body>
        <div class="header-top">
            <div class="eyebrow"><img src="${logoBase64}" style="width:24px;height:24px;border-radius:6px;"> ESTADIOS VIRTUALES · CARTA FUT</div>
            <div class="title-main">${config.titleMain}</div>
            <div class="title-sub">${config.titleSub}</div>
        </div>

        <div style="position:absolute; top:520px; left:50%; transform:translateX(-50%); display:flex; align-items:center; justify-content:center; gap:30px; width:100%;">
            <!-- Carta Izquierda (inclinada) -->
            <div class="fut-card ${hook.left.theme}" style="transform: scale(0.85) rotate(-10deg) translateY(30px); opacity:0.92;">
                ${renderCardHtml(hook.left)}
            </div>

            <!-- Carta Centro Gold (destacada) -->
            <div class="fut-card ${hook.center.theme}" style="transform: scale(1.18); z-index:10; box-shadow:0 0 65px rgba(255, 215, 0, 0.7);">
                ${renderCardHtml(hook.center)}
            </div>

            <!-- Carta Derecha (inclinada) -->
            <div class="fut-card ${hook.right.theme}" style="transform: scale(0.85) rotate(10deg) translateY(30px); opacity:0.92;">
                ${renderCardHtml(hook.right)}
            </div>
        </div>


    </body>
    </html>
    `;
    await page.setContent(htmlHook, { timeout: 8000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_hook.png'), omitBackground: true });

    // 2. OVERLAY PASO 1: SELECCIÓN DE CLUB Y POSICIÓN (4s a 9s)
    const step1 = config.step1;
    const carouselHtml = step1.carousel.map(c => {
        const cImg = getBase64Image(path.join(__dirname, '..', 'escudos', c.escudo));
        if (c.active) {
            return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px; transform:scale(1.18); padding:10px 20px; background:rgba(0, 230, 118, 0.2); border:2.5px solid #00e676; border-radius:20px; box-shadow:0 0 25px rgba(0, 230, 118, 0.5);">
                <img src="${cImg}" style="width:92px;height:92px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.7));">
                <span style="color:#00ff77; font-size:19px; font-weight:900;">${c.name}</span>
            </div>
            `;
        }
        return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <img src="${cImg}" style="width:80px;height:80px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.6));">
            <span style="color:#ffffff; font-size:17px; font-weight:900;">${c.name}</span>
        </div>
        `;
    }).join('');

    const htmlStep1 = `
    <!DOCTYPE html>
    <html>
    <head><style>${cssGlobal}</style></head>
    <body>
        <div class="header-top">
            <div class="eyebrow" style="border-color:#38bdf8; color:#38bdf8;">${step1.eyebrow}</div>
            <div class="title-main">${step1.title}</div>
            <div class="title-sub">${step1.subtitle}</div>
        </div>

        <!-- Carta central interactiva -->
        <div style="position:absolute; top:480px; left:50%; transform:translateX(-50%);">
            <div class="fut-card ${step1.centerCard.theme}" style="transform: scale(1.3); box-shadow:0 0 55px rgba(255, 215, 0, 0.65);">
                ${renderCardHtml(step1.centerCard)}
            </div>
        </div>

        <!-- Carousel de clubes flotante -->
        <div style="position:absolute; bottom:290px; left:50px; width:980px; background:rgba(9, 14, 23, 0.94); border:2px solid rgba(255,255,255,0.3); border-radius:26px; padding:22px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 14px 40px rgba(0,0,0,0.9);">
            ${carouselHtml}
        </div>

        <div style="position:absolute; bottom:200px; left:50%; transform:translateX(-50%); display:flex; gap:18px;">
            <div style="background:#00e676; color:#04160a; padding:10px 28px; border-radius:24px; font-size:21px; font-weight:900; box-shadow:0 6px 20px rgba(0, 230, 118, 0.4);">DELANTERO</div>
            <div style="background:rgba(255,255,255,0.18); color:#ffffff; padding:10px 28px; border-radius:24px; font-size:21px; font-weight:800; border:1px solid rgba(255,255,255,0.25);">MEDIOCAMPO</div>
            <div style="background:rgba(255,255,255,0.18); color:#ffffff; padding:10px 28px; border-radius:24px; font-size:21px; font-weight:800; border:1px solid rgba(255,255,255,0.25);">DEFENSA</div>
            <div style="background:rgba(255,255,255,0.18); color:#ffffff; padding:10px 28px; border-radius:24px; font-size:21px; font-weight:800; border:1px solid rgba(255,255,255,0.25);">ARQUERO</div>
        </div>
    </body>
    </html>
    `;
    await page.setContent(htmlStep1, { timeout: 8000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_step1.png'), omitBackground: true });

    // 3. OVERLAY PASO 2: SE DESBLOQUEAN TUS STATS (9s a 14.5s)
    const step2 = config.step2;
    const cardStep2StatsHtml = step2.card.stats.slice(0, 4).map(s => `
        <div class="fut-stat-item"><span class="fut-stat-num">${s[0]}</span><span class="fut-stat-label">${s[1]}</span></div>
    `).join('') + (step2.card.stats[4] ? `
        <div class="fut-stat-item" style="grid-column: span 2;"><span class="fut-stat-num">${step2.card.stats[4][0]}</span><span class="fut-stat-label">${step2.card.stats[4][1]}</span></div>
    ` : '');

    const escudoStep2Src = getBase64Image(path.join(__dirname, '..', 'escudos', step2.card.escudo));
    const avatarStep2Src = getBase64Image(path.join(__dirname, '..', step2.card.avatar));

    const htmlStep2 = `
    <!DOCTYPE html>
    <html>
    <head><style>${cssGlobal}</style></head>
    <body>
        <div class="header-top">
            <div class="eyebrow" style="border-color:#ffd700; color:#ffd700;">${step2.eyebrow}</div>
            <div class="title-main">${step2.title}</div>
            <div class="title-sub">${step2.subtitle}</div>
        </div>

        <!-- Carta Gold Máxima -->
        <div style="position:absolute; top:460px; left:50%; transform:translateX(-50%);">
            <div class="fut-card gold" style="transform: scale(1.36); box-shadow:0 0 70px rgba(255, 215, 0, 0.7);">
                <div class="fut-top">
                    <div class="fut-badge-meta">
                        <div class="fut-ovr">${step2.card.ovr}</div>
                        <div class="fut-pos">${step2.card.pos}</div>
                        <img src="${escudoStep2Src}" class="fut-club-icon">
                    </div>
                    <div class="fut-avatar-container">
                        <div class="ac-avatar-full">
                            <img src="${avatarStep2Src}" class="ac-avatar-img-full" alt="Avatar">
                        </div>
                    </div>
                </div>
                <div class="fut-name">${step2.card.name}</div>
                <div class="fut-stats-row">
                    ${cardStep2StatsHtml}
                </div>
            </div>
        </div>

        <!-- 3 Badges oficiales de la web -->
        <div style="position:absolute; bottom:220px; left:50px; width:980px; display:flex; justify-content:space-between; gap:22px;">
            <div style="flex:1; background:rgba(9, 14, 23, 0.96); border:2.5px solid #ffd700; border-radius:24px; padding:22px; text-align:center; box-shadow:0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(255, 215, 0, 0.35);">
                <div style="font-size:42px;">👑</div>
                <div style="color:#ffffff; font-size:25px; font-weight:900; margin-top:6px;">Nivel 10</div>
                <div style="color:#ffd700; font-size:17px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Galáctico</div>
            </div>
            <div style="flex:1; background:rgba(9, 14, 23, 0.96); border:2.5px solid #ff7700; border-radius:24px; padding:22px; text-align:center; box-shadow:0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(255, 119, 0, 0.35);">
                <img src="${fuegoBase64}" style="width:46px;height:46px;margin:0 auto;display:block;filter:drop-shadow(0 4px 10px rgba(255,119,0,0.5));">
                <div style="color:#ffffff; font-size:25px; font-weight:900; margin-top:6px;">14 Días</div>
                <div style="color:#ff8800; font-size:17px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Racha Activa</div>
            </div>
            <div style="flex:1; background:rgba(9, 14, 23, 0.96); border:2.5px solid #00e676; border-radius:24px; padding:22px; text-align:center; box-shadow:0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(0, 230, 118, 0.35);">
                <img src="${trofeoBase64}" style="width:46px;height:46px;margin:0 auto;display:block;filter:drop-shadow(0 4px 10px rgba(0,230,118,0.5));">
                <div style="color:#ffffff; font-size:25px; font-weight:900; margin-top:6px;">41 PG</div>
                <div style="color:#00ff77; font-size:17px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Victorias 1v1</div>
            </div>
        </div>
    </body>
    </html>
    `;
    await page.setContent(htmlStep2, { timeout: 8000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_step2.png'), omitBackground: true });

    // 4. OVERLAY PASO 3 & CTA FINAL (14.5s a 20s)
    const urlReto = `https://www.estadiosvirtuales.com`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlReto)}&color=00e676&bgcolor=142030`;
    const step3 = config.step3;

    const htmlStep3 = `
    <!DOCTYPE html>
    <html>
    <head><style>${cssGlobal}</style></head>
    <body>
        <div class="header-top" style="top: 85px;">
            <div class="title-main">CREÁ TU CARTA AHORA</div>
        </div>

        <!-- Póster final oficial idéntico al de la web -->
        <div style="position:absolute; top:420px; left:50%; transform:translateX(-50%); width:520px; height:820px; background:#090e15; border:3px solid #00e676; border-radius:28px; padding:24px 20px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; box-shadow:0 25px 60px rgba(0,0,0,0.95), 0 0 50px rgba(0, 230, 118, 0.4);">
            <div style="display:flex; align-items:center; gap:14px; width:100%; justify-content:center;">
                <img src="${logoBase64}" style="width:44px; height:44px; border-radius:10px; border:1.5px solid #00e676;">
                <span style="font-size:1.45rem; font-weight:900; letter-spacing:1.5px; color:#ffffff; text-transform:uppercase;">Estadios Virtuales</span>
            </div>

            <!-- Mini carta en el póster -->
            <div class="fut-card ${step3.card.theme}" style="transform: scale(0.95); margin: 10px 0;">
                ${renderCardHtml(step3.card)}
            </div>

            <!-- Footer póster con QR y espaditas 1v1 (Mismo tamaño exacto: 78x78px) -->
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%; background:rgba(20, 32, 48, 0.92); border:2px solid rgba(0, 230, 118, 0.5); border-radius:20px; padding:12px 18px; gap:12px;">
                <img src="${qrApiUrl}" style="width:78px; height:78px; border-radius:12px; border:2px solid #00e676; flex-shrink:0;">
                <div style="display:flex; flex-direction:column; text-align:left; flex:1;">
                    <strong style="color:#ffffff; font-size:19px; font-weight:900;">¿Te animás a ganarme?</strong>
                    <span style="color:#a0aec0; font-size:13.5px; font-weight:700;">Escaneá el QR y desafiame en vivo.</span>
                </div>
                <img src="${dueloIconBase64}" style="width:78px; height:78px; object-fit:contain; filter:drop-shadow(0 0 12px rgba(0, 255, 119, 0.85)); flex-shrink:0;">
            </div>
        </div>

        <!-- BOTÓN CTA PRINCIPAL ELEVADO (bottom: 240px -> y=1680) -->
        <div style="position:absolute; bottom:240px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:26px; padding:20px 24px; display:flex; align-items:center; justify-content:center; gap:16px; box-shadow:0 18px 45px rgba(0,0,0,0.9), 0 0 50px rgba(0, 230, 118, 0.7); border:3.5px solid #ffffff;">
            <span style="font-size:38px;">📲</span>
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="color:#04160a; font-size:33px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">👉 TOCÁ EL LINK EN MI PERFIL DE TIKTOK</span>
                <span style="color:#04160a; font-size:20px; font-weight:900; opacity:0.95;">JUGÁ EN WWW.ESTADIOSVIRTUALES.COM ⚽🔥</span>
            </div>
        </div>

        <!-- SUB-PILL SEGUINOS (bottom: 165px) -->
        <div style="position:absolute; bottom:165px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; background:rgba(9, 14, 23, 0.95); border:1.5px solid #ffd700; padding:10px 28px; border-radius:24px; color:#ffd700; font-size:22px; font-weight:900; box-shadow:0 10px 30px rgba(0,0,0,0.9); white-space:nowrap;">
            <span>🔔 ¿De qué club vas a hacer la tuya? Contame en comentarios 👇</span>
        </div>
    </body>
    </html>
    `;
    await page.setContent(htmlStep3, { timeout: 8000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_cta.png'), omitBackground: true });

    await browser.close();
}

// ==========================================
// GENERACIÓN DE PORTADA MISTERIO (1080x1920)
// ==========================================
async function generarPortada(config, outFolder) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });

    const logoBase64 = getBase64Image(path.join(__dirname, '..', 'escudos', 'Logo.webp'));
    const escudoPortBase64 = getBase64Image(path.join(__dirname, '..', 'escudos', config.portada.card.escudo));
    const avatarPortBase64 = getBase64Image(path.join(__dirname, '..', config.portada.card.avatar));

    const htmlPortada = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 1080px;
                height: 1920px;
                background: radial-gradient(circle at 50% 40%, #152238 0%, #06090e 100%);
                font-family: 'Segoe UI', -apple-system, sans-serif;
                overflow: hidden;
                position: relative;
            }

            /* Rayos de luz de estadio */
            .stadium-light {
                position: absolute;
                width: 800px;
                height: 800px;
                background: radial-gradient(circle, rgba(0, 230, 118, 0.25) 0%, transparent 70%);
                top: 25%;
                left: 50%;
                transform: translate(-50%, -50%);
                filter: blur(40px);
            }

            /* Silueta Pelé */
            .fut-card {
                position: relative;
                width: 380px;
                height: 580px;
                padding: 35px 26px;
                display: flex;
                flex-direction: column;
                align-items: center;
                color: #fff;
                font-family: 'Arial Black', Gadget, sans-serif;
                clip-path: path('M 0,48 C 0,36 15,27 38,21 C 98,12 159,7 174,4 C 181,2 185,0 190,0 C 195,0 199,2 206,4 C 221,7 282,12 342,21 C 365,27 380,36 380,48 L 380,460 C 380,505 273,550 190,580 C 107,550 0,505 0,460 Z');
                flex-shrink: 0;
            }
            .fut-card.gold {
                background: linear-gradient(135deg, #e5b338 0%, #fff2a3 40%, #c48c1b 70%, #f7dc6f 100%);
                color: #1a1002;
                box-shadow: 0 0 90px rgba(255, 215, 0, 0.85);
            }
            .fut-top { display: flex; width: 100%; height: 50%; margin-top: 10px; }
            .fut-badge-meta { width: 35%; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
            .fut-ovr { font-size: 4.2rem; font-weight: 900; letter-spacing: -2px; }
            .fut-pos { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; opacity: 0.85; }
            .fut-club-icon { width: 64px; height: 64px; margin-top: 14px; object-fit: contain; }

            .fut-avatar-container {
                width: 65%;
                height: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                overflow: visible;
            }
            .ac-avatar-full { 
                position: absolute; 
                bottom: -5px; 
                left: 50%;
                transform: translateX(-50%);
                width: 100%; 
                height: 100%; 
                display: flex;
                justify-content: center;
                align-items: flex-end;
                pointer-events: none;
                overflow: hidden;
                -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
                mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
            }
            .ac-avatar-img-full {
                width: 110%;
                height: 100%;
                object-fit: cover;
                object-position: center 15%;
                filter: none;
            }
            .fut-name {
                width: 100%;
                text-align: center;
                font-size: 2.1rem;
                font-weight: 900;
                margin: 16px 0 12px;
                text-transform: uppercase;
                border-bottom: 2px solid rgba(26, 16, 2, 0.4);
                padding-bottom: 8px;
            }
            .fut-stats-row {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                width: 95%;
                gap: 10px 22px;
            }
            .fut-stat-item { display: flex; gap: 8px; justify-content: center; align-items: baseline; }
            .fut-stat-num { font-weight: 900; font-size: 1.7rem; }
            .fut-stat-label { opacity: 0.85; font-size: 1.1rem; font-weight: 800; }
        </style>
    </head>
    <body>
        <div class="stadium-light"></div>

        <!-- ZONA SEGURA 3:4 (entre y=240 y y=1680) -->
        <div style="position:absolute; top:280px; left:50px; width:980px; text-align:center;">
            <div style="display:inline-flex; align-items:center; gap:12px; background:rgba(0, 230, 118, 0.15); border:2px solid #00e676; border-radius:30px; padding:10px 28px; color:#00ff77; font-size:20px; font-weight:900; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">
                <img src="${logoBase64}" style="width:28px;height:28px;border-radius:8px;"> ESTADIOS VIRTUALES
            </div>
            <div style="font-size:52px; font-weight:900; color:#ffffff; line-height:1.15; text-transform:uppercase; text-shadow:0 6px 25px rgba(0,0,0,0.9);">
                ${config.portada.titleHtml}
            </div>
            <div style="font-size:24px; font-weight:800; color:#e2e8f0; margin-top:10px;">
                ${config.portada.subtitle}
            </div>
        </div>

        <!-- Carta Gold Central -->
        <div style="position:absolute; top:620px; left:50%; transform:translateX(-50%);">
            <div class="fut-card gold">
                <div class="fut-top">
                    <div class="fut-badge-meta">
                        <div class="fut-ovr">${config.portada.card.ovr}</div>
                        <div class="fut-pos">${config.portada.card.pos}</div>
                        <img src="${escudoPortBase64}" class="fut-club-icon">
                    </div>
                    <div class="fut-avatar-container">
                        <div class="ac-avatar-full">
                            <img src="${avatarPortBase64}" class="ac-avatar-img-full" alt="Avatar">
                        </div>
                    </div>
                </div>
                <div class="fut-name">${config.portada.card.name}</div>
                <div class="fut-stats-row">
                    <div class="fut-stat-item"><span class="fut-stat-num">${config.portada.card.stats[0][0]}</span><span class="fut-stat-label">${config.portada.card.stats[0][1]}</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${config.portada.card.stats[1][0]}</span><span class="fut-stat-label">${config.portada.card.stats[1][1]}</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${config.portada.card.stats[2][0]}</span><span class="fut-stat-label">${config.portada.card.stats[2][1]}</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${config.portada.card.stats[3][0]}</span><span class="fut-stat-label">${config.portada.card.stats[3][1]}</span></div>
                </div>
            </div>
        </div>

        <!-- Badge inferior de llamada -->
        <div style="position:absolute; bottom:340px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:26px; padding:22px; text-align:center; box-shadow:0 18px 45px rgba(0,0,0,0.9), 0 0 45px rgba(0, 230, 118, 0.55); border:3px solid #ffffff;">
            <div style="color:#04160a; font-size:34px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">
                👉 JUGALO EN EL LINK DEL PERFIL
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlPortada, { timeout: 8000 });
    const portadaPath = path.join(outFolder, config.portadaName);
    await page.screenshot({ path: portadaPath, quality: 95, type: 'jpeg' });
    console.log(`✅ Portada guardada: ${portadaPath}`);

    await browser.close();
}

// ==========================================
// RENDERIZADO PRINCIPAL FFmpeg
// ==========================================
async function renderizarPromo(promoKey = 'promo-02-laliga') {
    const config = CONFIG_PROMOS[promoKey] || CONFIG_PROMOS['promo-02-laliga'];
    const outFolder = path.join(BASE_OUTPUT_DIR, config.slug);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const assetsDir = path.join(__dirname, `temp_${config.slug.toLowerCase()}_assets`);
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    console.log(`🎬 EJECUTANDO GENERACIÓN: ${config.slug}`);
    console.log(`📂 Carpeta de salida: ${outFolder}`);

    // 1. Textos de publicación
    fs.writeFileSync(path.join(outFolder, 'TEXTOS_PUBLICACION.txt'), config.textos, 'utf8');
    console.log(`✅ Archivo TEXTOS_PUBLICACION.txt guardado.`);

    // 2. Audio procedural puro
    const audioPath = path.join(assetsDir, 'audio_promo.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(20.0));
    console.log(`✅ Audio procedural generado.`);

    // 3. Generación de Portada
    await generarPortada(config, outFolder);

    // 4. Overlays con Puppeteer
    console.log(`🎨 Generando overlays en Puppeteer...`);
    await generarOverlaysPromo(config, assetsDir);
    console.log(`✅ Overlays generados exitosamente.`);

    // 5. Video con FFmpeg
    const videoOutPath = path.join(outFolder, config.videoName);

    const hasBothDrones = fs.existsSync(config.drone1) && fs.existsSync(config.drone2);
    const hasSingleDrone = fs.existsSync(config.drone1);

    let ffmpegInputs = [];
    let filterComplex = '';
    let audioMapIndex = '5:a';

    if (hasBothDrones) {
        console.log(`🏟️ Configurando transición cinematográfica de estadios (xfade a 9.5s)...`);
        ffmpegInputs = [
            '-y',
            '-stream_loop', '-1', '-t', '11.0', '-i', config.drone1,                  // 0: Drone 1 (0s a 10.5s)
            '-stream_loop', '-1', '-t', '11.0', '-i', config.drone2,                  // 1: Drone 2 (9.5s a 20s)
            '-loop', '1', '-t', '4.0', '-i', path.join(assetsDir, 'overlay_hook.png'),   // 2: Hook (0s a 4s)
            '-loop', '1', '-t', '5.0', '-i', path.join(assetsDir, 'overlay_step1.png'),  // 3: Paso 1 (4s a 9s)
            '-loop', '1', '-t', '5.5', '-i', path.join(assetsDir, 'overlay_step2.png'),  // 4: Paso 2 (9s a 14.5s)
            '-loop', '1', '-t', '5.5', '-i', path.join(assetsDir, 'overlay_cta.png'),    // 5: Paso 3 & CTA (14.5s a 20s)
            '-i', audioPath                                                             // 6: Audio
        ];

        filterComplex = `
            [0:v]trim=0:10.5,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.32[bg0];
            [1:v]trim=0:10.5,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.32[bg1];
            [bg0][bg1]xfade=transition=fade:duration=1.0:offset=9.5[bg];
            [bg][2:v]overlay=0:0:enable='between(t,0,4.0)'[v1];
            [v1][3:v]overlay=0:0:enable='between(t,4.0,9.0)'[v2];
            [v2][4:v]overlay=0:0:enable='between(t,9.0,14.5)'[v3];
            [v3][5:v]overlay=0:0:enable='between(t,14.5,20.0)'[outv]
        `;
        audioMapIndex = '6:a';
    } else if (hasSingleDrone) {
        ffmpegInputs = [
            '-y',
            '-t', '20.0',
            '-stream_loop', '-1',
            '-i', config.drone1,
            '-loop', '1', '-t', '4.0', '-i', path.join(assetsDir, 'overlay_hook.png'),
            '-loop', '1', '-t', '5.0', '-i', path.join(assetsDir, 'overlay_step1.png'),
            '-loop', '1', '-t', '5.5', '-i', path.join(assetsDir, 'overlay_step2.png'),
            '-loop', '1', '-t', '5.5', '-i', path.join(assetsDir, 'overlay_cta.png'),
            '-i', audioPath
        ];

        filterComplex = `
            [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.32[bg];
            [bg][1:v]overlay=0:0:enable='between(t,0,4.0)'[v1];
            [v1][2:v]overlay=0:0:enable='between(t,4.0,9.0)'[v2];
            [v2][3:v]overlay=0:0:enable='between(t,9.0,14.5)'[v3];
            [v3][4:v]overlay=0:0:enable='between(t,14.5,20.0)'[outv]
        `;
        audioMapIndex = '5:a';
    } else {
        ffmpegInputs = [
            '-y',
            '-f', 'lavfi', '-i', 'color=c=#070b12:s=1080x1920:d=20.0:r=30',
            '-loop', '1', '-t', '4.0', '-i', path.join(assetsDir, 'overlay_hook.png'),
            '-loop', '1', '-t', '5.0', '-i', path.join(assetsDir, 'overlay_step1.png'),
            '-loop', '1', '-t', '5.5', '-i', path.join(assetsDir, 'overlay_step2.png'),
            '-loop', '1', '-t', '5.5', '-i', path.join(assetsDir, 'overlay_cta.png'),
            '-i', audioPath
        ];

        filterComplex = `
            [0:v]eq=brightness=0.02[bg];
            [bg][1:v]overlay=0:0:enable='between(t,0,4.0)'[v1];
            [v1][2:v]overlay=0:0:enable='between(t,4.0,9.0)'[v2];
            [v2][3:v]overlay=0:0:enable='between(t,9.0,14.5)'[v3];
            [v3][4:v]overlay=0:0:enable='between(t,14.5,20.0)'[outv]
        `;
        audioMapIndex = '5:a';
    }

    const ffmpegArgs = [
        ...ffmpegInputs,
        '-filter_complex', filterComplex.replace(/\s+/g, ' ').trim(),
        '-map', '[outv]',
        '-map', audioMapIndex,
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

    console.log(`🎬 Renderizando video 1080x1920 con FFmpeg: ${videoOutPath}...`);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        let errorOutput = '';
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
            errorOutput += msg;
            const timeMatch = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:20.00\r`);
            }
        });
        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
                resolve();
            } else {
                reject(new Error(`FFmpeg falló con código ${code}: ${errorOutput.slice(-500)}`));
            }
        });
    });

    // Limpieza de assets temporales
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
        console.log(`🧹 Limpieza de assets temporales completada.`);
    } catch (_) {}
}

const promoArg = process.argv[2] || 'promo-02-laliga';
renderizarPromo(promoArg).catch(console.error);
