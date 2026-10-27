const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 GENERADOR MAESTRO DE VIDEOS (ESTILO CANÓNICO ROMA / CAMP NOU)');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseOutputDir = "E:\\Google earth studio\\videos para mostrar";

// COLA DE ESTADIOS A PRODUCIR
// Modificar o inyectar los estadios aquí para procesar lotes
const STADIUMS_QUEUE = [
    {
        id: 'wembley_stadium',
        nombreMostrar: 'WEMBLEY STADIUM',
        clubMostrar: 'SELECCIÓN DE INGLATERRA',
        pais: 'Inglaterra',
        folderName: 'WEMBLEY-STADIUM',
        videoFileName: 'Estadio_Wembley_Londres.mp4',
        coverFileName: 'Portada_Estadio_Wembley.jpg',
        inputVideoPath: "E:\\Google earth studio\\Inglaterra\\Wembley Stadium_ Inglaterra.mp4",
        targetLat: 51.5560,
        targetLng: -0.2795,
        userLat: 51.5532,
        userLng: -0.2760,
        distanciaTexto: '394 METROS',
        puntosTexto: '4.106 PUNTOS 🔥',
        ubicacionBadge: '📍 Londres, Inglaterra · WEMBLEY STADIUM',
        pistas: [
            { icon: '💡', tag: 'PISTA 1:', text: 'Capacidad monumental para 90.000 espectadores', color: '#00ff77' },
            { icon: '🏛️', tag: 'PISTA 2:', text: 'Su icónico arco de 133 metros domina el cielo londinense', color: '#38bdf8' },
            { icon: '👑', tag: 'PISTA 3:', text: 'La mítica Catedral del Fútbol mundial y sede de finales históricas', color: '#ffd700' }
        ],
        portadaClue: '90.000 hinchas · La Catedral del Fútbol · Londres',
        copys: {
            club: 'Wembley Stadium / Selección de Inglaterra',
            paisHashtag: '#premierleague #wembley #london #england #futbol #estadios #stadiumguessr',
            extraPista: 'el templo de las finales de Champions, la consagración de 1966 y el mítico arco londinense'
        }
    },
    {
        id: 'tottenham_hotspur',
        nombreMostrar: 'TOTTENHAM HOTSPUR STADIUM',
        clubMostrar: 'TOTTENHAM HOTSPUR FC',
        pais: 'Inglaterra',
        folderName: 'TOTTENHAM-HOTSPUR-STADIUM',
        videoFileName: 'Estadio_Tottenham_Hotspur_London.mp4',
        coverFileName: 'Portada_Estadio_Tottenham_Hotspur.jpg',
        inputVideoPath: "E:\\Google earth studio\\Inglaterra\\Tottenham Hotspur Stadium.mp4",
        targetLat: 51.6042,
        targetLng: -0.0662,
        userLat: 51.6015,
        userLng: -0.0630,
        distanciaTexto: '373 METROS',
        puntosTexto: '4.149 PUNTOS 🔥',
        ubicacionBadge: '📍 Londres, Inglaterra · TOTTENHAM STADIUM',
        pistas: [
            { icon: '💡', tag: 'PISTA 1:', text: 'Capacidad para 62.850 hinchas en el norte de Londres', color: '#00ff77' },
            { icon: '🏟️', tag: 'PISTA 2:', text: 'Inaugurado en 2019 con una espectacular cancha retráctil de NFL', color: '#38bdf8' },
            { icon: '⚪🔵', tag: 'PISTA 3:', text: 'El hogar de los Spurs y una de las maravillas modernas de Europa', color: '#ffd700' }
        ],
        portadaClue: '62.850 hinchas · Estadio ultramoderno · Norte de Londres',
        copys: {
            club: 'Tottenham Hotspur Football Club',
            paisHashtag: '#premierleague #tottenham #spurs #coys #london #estadios #futbolingles',
            extraPista: 'el imponente coloso del norte de Londres, la tecnología con cancha retráctil y la pasión de los Spurs'
        }
    },
    {
        id: 'villa_park',
        nombreMostrar: 'VILLA PARK',
        clubMostrar: 'ASTON VILLA FC',
        pais: 'Inglaterra',
        folderName: 'VILLA-PARK-BIRMINGHAM',
        videoFileName: 'Estadio_Villa_Park_Aston_Villa.mp4',
        coverFileName: 'Portada_Estadio_Villa_Park.jpg',
        inputVideoPath: "E:\\Google earth studio\\Inglaterra\\Villa Park_ Aston Villa Football Club.mp4",
        targetLat: 52.5091,
        targetLng: -1.8848,
        userLat: 52.5065,
        userLng: -1.8815,
        distanciaTexto: '365 METROS',
        puntosTexto: '4.166 PUNTOS 🔥',
        ubicacionBadge: '📍 Birmingham, Inglaterra · VILLA PARK',
        pistas: [
            { icon: '💡', tag: 'PISTA 1:', text: 'Capacidad para 42.600 hinchas en la ciudad de Birmingham', color: '#00ff77' },
            { icon: '🏛️', tag: 'PISTA 2:', text: 'Templo histórico del fútbol británico inaugurado en 1897', color: '#38bdf8' },
            { icon: '🦁', tag: 'PISTA 3:', text: 'La fortaleza de los Villanos, campeones de Europa y hogar del Dibu Martínez', color: '#ffd700' }
        ],
        portadaClue: '42.600 hinchas · Inaugurado en 1897 · Birmingham',
        copys: {
            club: 'Aston Villa Football Club',
            paisHashtag: '#premierleague #astonvilla #villapark #dibumartinez #birmingham #futbolingles #estadios',
            extraPista: 'la mística de Birmingham, el título de la Copa de Europa de 1982 y las atajadas del Dibu Martínez'
        }
    },
    {
        id: 'stamford_bridge',
        nombreMostrar: 'STAMFORD BRIDGE',
        clubMostrar: 'CHELSEA FC',
        pais: 'Inglaterra',
        folderName: 'STAMFORD-BRIDGE-CHELSEA',
        videoFileName: 'Estadio_Stamford_Bridge_Chelsea.mp4',
        coverFileName: 'Portada_Estadio_Stamford_Bridge.jpg',
        inputVideoPath: "E:\\Google earth studio\\Inglaterra\\Stamford Bridge_ Chelsea FC.mp4",
        targetLat: 51.4816,
        targetLng: -0.1910,
        userLat: 51.4788,
        userLng: -0.1878,
        distanciaTexto: '382 METROS',
        puntosTexto: '4.131 PUNTOS 🔥',
        ubicacionBadge: '📍 Londres, Inglaterra · STAMFORD BRIDGE',
        pistas: [
            { icon: '💡', tag: 'PISTA 1:', text: 'Capacidad para 40.340 hinchas en el distinguido barrio de Fulham', color: '#00ff77' },
            { icon: '🏛️', tag: 'PISTA 2:', text: 'Inaugurado en 1877: una de las canchas con más historia del planeta', color: '#38bdf8' },
            { icon: '🔵', tag: 'PISTA 3:', text: 'La casa de los Blues, dos veces campeones de la Champions League', color: '#ffd700' }
        ],
        portadaClue: '40.340 hinchas · Distrito de Fulham · Londres',
        copys: {
            club: 'Chelsea Football Club',
            paisHashtag: '#premierleague #chelsea #chelseafc #stamfordbridge #theblues #london #estadios',
            extraPista: 'el corazón de Fulham Road, las dos Champions League de los Blues y las leyendas de Drogba y Lampard'
        }
    },
    {
        id: 'st_james_park',
        nombreMostrar: 'ST JAMES\' PARK',
        clubMostrar: 'NEWCASTLE UNITED',
        pais: 'Inglaterra',
        folderName: 'ST-JAMES-PARK-NEWCASTLE',
        videoFileName: 'Estadio_St_James_Park_Newcastle.mp4',
        coverFileName: 'Portada_Estadio_St_James_Park.jpg',
        inputVideoPath: "E:\\Google earth studio\\Inglaterra\\St James’ Park_ Newcastle.mp4",
        targetLat: 54.9755,
        targetLng: -1.6216,
        userLat: 54.9728,
        userLng: -1.6185,
        distanciaTexto: '360 METROS',
        puntosTexto: '4.176 PUNTOS 🔥',
        ubicacionBadge: '📍 Newcastle, Inglaterra · ST JAMES\' PARK',
        pistas: [
            { icon: '💡', tag: 'PISTA 1:', text: 'Monumental capacidad para 52.300 hinchas en el centro urbano', color: '#00ff77' },
            { icon: '🏗️', tag: 'PISTA 2:', text: 'Su colosal tribuna Milburn domina el horizonte de la ciudad', color: '#38bdf8' },
            { icon: '🖤🤍', tag: 'PISTA 3:', text: 'La catedral del Toon Army y hogar de las legendarias Urracas', color: '#ffd700' }
        ],
        portadaClue: '52.300 hinchas · En el centro urbano · Newcastle',
        copys: {
            club: 'Newcastle United Football Club',
            paisHashtag: '#premierleague #newcastle #newcastleunited #stjamespark #toonarmy #magpies #estadios',
            extraPista: 'la marea albinegra del Toon Army, los goles eternos de Alan Shearer y la catedral del norte inglés'
        }
    }
];

function resolveCountAsset(name) {
    if (fs.existsSync(path.join(__dirname, name))) return path.join(__dirname, name);
    if (fs.existsSync(path.join(__dirname, 'redes', name))) return path.join(__dirname, 'redes', name);
    return path.join(__dirname, name);
}

// GENERADOR DE AUDIO PROCEDURAL NATIVO (100% LIMPIO, CERO BARRIDOS/WHOOSHES)
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

    // Audio procedural armónico y limpio: campanas, cuenta regresiva, pop y fanfarria
    addBellDing(3.5, 880);
    addBellDing(7.5, 987.77);
    addBellDing(11.5, 1174.66);

    addTick(16.0);
    addTick(17.0);
    addTick(18.0);
    addTick(19.0);

    addPinPop(19.6);

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(20.0 + idx * 0.06, 3.5, freq, 0.35, 1.5);
    });

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// GENERAR ARCHIVO TEXTOS_PUBLICACION.TXT
function generarArchivoTextos(item, targetFolder) {
    const filePath = path.join(targetFolder, 'TEXTOS_PUBLICACION.txt');
    const content = `========================================================
ESTADIOS VIRTUALES · PACK LISTO PARA PUBLICAR
ESTADIO: ${item.nombreMostrar} (${item.clubMostrar} - ${item.pais})
========================================================

🏆 OPCIÓN 1: DESAFÍO DE TIEMPO (MÁXIMA RETENCIÓN Y COMENTARIOS)
--------------------------------------------------------
¿Qué estadio es y dónde queda? ¿Podés sacarlo desde el aire? ⏱️👀

💡 Pista 1: ${item.pistas[0].text}.
🏟️ Pista 2: ${item.pistas[1].text}.
⭐ Pista 3: ${item.pistas[2].text}.

¿Lo sacaste con la primera pista o necesitaste el mapa? Comentá tus segundos 👇

🎮 Poné a prueba cuánto sabés de canchas en el link del perfil:
👉 estadiosvirtuales.com

#estadiosvirtuales #stadiumguessr ${item.copys.paisHashtag} #futbol #estadios #geoguessr #tiktokfutbol


🔥 OPCIÓN 2: HISTORIA Y FOLCLORE
--------------------------------------------------------
Pocos estadios tienen tanta mística y momentos grabados a fuego como este. 🏟️✨

Desde ${item.copys.extraPista} hasta los partidos inolvidables que marcaron la historia de ${item.copys.club}.

📍 En el mapa de StadiumGuessr quedamos a ${item.distanciaTexto} (${item.puntosTexto}). ¿Vos qué tan cerca le pegás?

🎮 Jugá la trivia diaria gratis en el link de la bio:
👉 estadiosvirtuales.com

#estadiosvirtuales #stadiumguessr ${item.copys.paisHashtag} #futbol


🎯 OPCIÓN 3: MODO GAMER / GEOGUESSR
--------------------------------------------------------
Modo StadiumGuessr activado: ¿Podés adivinar el estadio mirando solo la vista satelital? 🌍⚽

En esta ronda sumamos ${item.puntosTexto} a ${item.distanciaTexto} de distancia.

🕹️ Desafíos diarios, modo carrera y estadios de todo el mundo gratis sin descargar nada.

👉 Link en el perfil: estadiosvirtuales.com

#stadiumguessr #geoguessr #estadiosvirtuales #gamingentiktok #futbol


⚡ OPCIÓN 4: CORTA Y VIRAL
--------------------------------------------------------
Solo los que realmente respiran fútbol lo sacan antes de los 5 segundos ⏳

¿Qué estadio es y de qué club? Te leemos en comentarios 👇

👉 Más estadios para adivinar en el link del perfil (estadiosvirtuales.com)

#estadiosvirtuales #stadiumguessr ${item.copys.paisHashtag} #trivia


💬 COMENTARIOS FIJADOS RECOMENDADOS:
--------------------------------------------------------
1. «¿Sos capaz de clavar 5.000 puntos en el mapa? Jugá todas las rondas gratis en estadiosvirtuales.com (link en el perfil) 🗺️⚽»
2. «Comentá con qué pista lo sacaste: ¿con la 1, con la 2 o recién cuando apareció el escudo? 👀👇»
`;

    fs.writeFileSync(filePath, content, 'utf8');
}

// PROCESAR UN ESTADIO INDIVIDUAL CON EL FORMATO CANÓNICO
async function procesarEstadio(item, index, total) {
    console.log(`\n========================================================`);
    console.log(`📍 [${index + 1}/${total}] PRODUCIENDO: ${item.nombreMostrar} (${item.pais})`);
    console.log(`📁 Destino: ${item.pais}\\${item.folderName}`);
    console.log(`========================================================`);

    const stadiumFolder = path.join(baseOutputDir, item.pais, item.folderName);
    if (!fs.existsSync(stadiumFolder)) {
        fs.mkdirSync(stadiumFolder, { recursive: true });
    }

    const tempAudio = path.join(__dirname, `temp_audio_${item.id}.wav`);
    fs.writeFileSync(tempAudio, generarAudioProcedural(25.0));

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();

    // 1. MAPA LEAFLET FLOTANTE INFERIOR (960x460)
    await page.setViewport({ width: 960, height: 460, deviceScaleFactor: 2 });
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
            <div class="score-badge">🎯 ¡A ${item.distanciaTexto}! · <span>${item.puntosTexto}</span></div>
            <div id="map"></div>
            <div class="bottom-badge">${item.ubicacionBadge}</div>
        </div>
        <script>
            const userPos = [${item.userLat}, ${item.userLng}];
            const targetPos = [${item.targetLat}, ${item.targetLng}];
            const centerLat = (userPos[0] + targetPos[0]) / 2;
            const centerLng = (userPos[1] + targetPos[1]) / 2;

            const map = L.map('map', { attributionControl: false, zoomControl: false }).setView([centerLat, centerLng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            L.polyline([userPos, targetPos], { color: '#ff3b30', weight: 4, dashArray: '8, 8', opacity: 0.95 }).addTo(map);

            L.circleMarker(targetPos, { radius: 14, color: '#00e676', fillColor: '#090e17', fillOpacity: 1, weight: 4 }).addTo(map);
            L.circleMarker(targetPos, { radius: 35, color: '#00e676', fillColor: '#00e676', fillOpacity: 0.2, weight: 2 }).addTo(map);

            const pinIcon = L.divIcon({ className: 'custom-pin-wrap', html: '<div class="user-pin"></div>', iconSize: [32, 32], iconAnchor: [16, 32] });
            L.marker(userPos, { icon: pinIcon }).addTo(map);
        </script>
    </body>
    </html>`;

    await page.setContent(mapHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1400));
    const mapCardEl = await page.$('#map-card');
    const mapImgPath = path.join(__dirname, `mapa_${item.id}_card.png`);
    await mapCardEl.screenshot({ path: mapImgPath, omitBackground: true });

    // 2. UI CARDS (Header superior 980px, Pistas inferiores 94px, Revelación y CTA)
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
                padding: 16px 24px 18px 24px;
                text-align: center;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 255, 119, 0.25);
            }
            .hero-eyebrow {
                display: inline-block;
                background: rgba(0, 255, 119, 0.12);
                border: 1.5px solid rgba(0, 255, 119, 0.6);
                color: #00ff77;
                font-size: 20px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 5px 20px;
                border-radius: 30px;
                margin-bottom: 8px;
            }
            .title {
                color: #ffffff;
                font-size: 48px;
                font-weight: 900;
                letter-spacing: -0.5px;
                line-height: 1.12;
                margin-bottom: 8px;
            }
            .subtitle { color: #ffd700; font-size: 26px; font-weight: 700; }

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
            <div class="title">¿QUÉ ESTADIO ES<br>Y DÓNDE QUEDA?</div>
            <div class="subtitle">¿En cuántos segundos podés adivinarlo?</div>
        </div>

        <div class="clue-group" id="ui-pistas-1">
            <div class="clue-card">
                <div class="clue-indicator" style="background:${item.pistas[0].color}; box-shadow: 0 0 15px ${item.pistas[0].color};"></div>
                <div class="clue-icon">${item.pistas[0].icon}</div>
                <div class="clue-text"><span class="clue-tag" style="color:${item.pistas[0].color};">${item.pistas[0].tag}</span> ${item.pistas[0].text}</div>
            </div>
        </div>

        <div class="clue-group" id="ui-pistas-2">
            <div class="clue-card">
                <div class="clue-indicator" style="background:${item.pistas[0].color}; box-shadow: 0 0 15px ${item.pistas[0].color};"></div>
                <div class="clue-icon">${item.pistas[0].icon}</div>
                <div class="clue-text"><span class="clue-tag" style="color:${item.pistas[0].color};">${item.pistas[0].tag}</span> ${item.pistas[0].text}</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:${item.pistas[1].color}; box-shadow: 0 0 15px ${item.pistas[1].color};"></div>
                <div class="clue-icon">${item.pistas[1].icon}</div>
                <div class="clue-text"><span class="clue-tag" style="color:${item.pistas[1].color};">${item.pistas[1].tag}</span> ${item.pistas[1].text}</div>
            </div>
        </div>

        <div class="clue-group" id="ui-pistas-3">
            <div class="clue-card">
                <div class="clue-indicator" style="background:${item.pistas[0].color}; box-shadow: 0 0 15px ${item.pistas[0].color};"></div>
                <div class="clue-icon">${item.pistas[0].icon}</div>
                <div class="clue-text"><span class="clue-tag" style="color:${item.pistas[0].color};">${item.pistas[0].tag}</span> ${item.pistas[0].text}</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:${item.pistas[1].color}; box-shadow: 0 0 15px ${item.pistas[1].color};"></div>
                <div class="clue-icon">${item.pistas[1].icon}</div>
                <div class="clue-text"><span class="clue-tag" style="color:${item.pistas[1].color};">${item.pistas[1].tag}</span> ${item.pistas[1].text}</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:${item.pistas[2].color}; box-shadow: 0 0 15px ${item.pistas[2].color};"></div>
                <div class="clue-icon">${item.pistas[2].icon}</div>
                <div class="clue-text"><span class="clue-tag" style="color:${item.pistas[2].color};">${item.pistas[2].tag}</span> ${item.pistas[2].text}</div>
            </div>
        </div>

        <div class="reveal-banner" id="ui-reveal-title">
            <span class="reveal-text">${item.nombreMostrar}</span>
            <span class="club-tag">${item.clubMostrar}</span>
        </div>

        <div class="btn-cta" id="ui-cta-btn">
            JUGÁ GRATIS EN EL LINK DEL PERFIL
        </div>
    </body>
    </html>`;

    await page.setContent(uiHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const uiHeaderImg = path.join(__dirname, `ui_header_${item.id}.png`);
    const uiP1Img = path.join(__dirname, `ui_pistas_1_${item.id}.png`);
    const uiP2Img = path.join(__dirname, `ui_pistas_2_${item.id}.png`);
    const uiP3Img = path.join(__dirname, `ui_pistas_3_${item.id}.png`);
    const uiRevImg = path.join(__dirname, `ui_reveal_title_${item.id}.png`);
    const uiBtnImg = path.join(__dirname, `ui_cta_btn_${item.id}.png`);

    const elMap = [
        { id: '#ui-header', file: uiHeaderImg },
        { id: '#ui-pistas-1', file: uiP1Img },
        { id: '#ui-pistas-2', file: uiP2Img },
        { id: '#ui-pistas-3', file: uiP3Img },
        { id: '#ui-reveal-title', file: uiRevImg },
        { id: '#ui-cta-btn', file: uiBtnImg }
    ];

    for (const elItem of elMap) {
        const el = await page.$(elItem.id);
        if (el) await el.screenshot({ path: elItem.file, omitBackground: true });
    }

    await browser.close();

    // 3. FFMPEG RENDER DEL VIDEO
    const destVideoPath = path.join(stadiumFolder, item.videoFileName);
    const destCoverPath = path.join(stadiumFolder, item.coverFileName);

    let isVertical = false;
    try {
        const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', item.inputVideoPath]);
        const d = JSON.parse(probe.stdout.toString()).streams[0];
        if (d && d.width < d.height) isVertical = true;
    } catch (e) {}

    const baseFilter = isVertical
        ? `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[base]`
        : `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg];[0:v]scale=1080:608[fg];[bg][fg]overlay=0:(H-h)/2[base]`;

    const assets = [
        uiHeaderImg,
        uiP1Img,
        uiP2Img,
        uiP3Img,
        resolveCountAsset('ui_count_3.png'),
        resolveCountAsset('ui_count_2.png'),
        resolveCountAsset('ui_count_1.png'),
        mapImgPath,
        uiRevImg,
        uiBtnImg
    ];

    for (let aIdx = 0; aIdx < assets.length; aIdx++) {
        if (!fs.existsSync(assets[aIdx])) {
            throw new Error(`Asset faltante para ffmpeg [${aIdx}]: ${assets[aIdx]}`);
        }
    }

    const filterComplex = [
        baseFilter,
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
        '-i', item.inputVideoPath,
        '-i', tempAudio,
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
        destVideoPath
    ];

    process.stdout.write(`🎬 Renderizando video 1080x1920 (25s)... `);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        let errorOutput = '';
        ff.stderr.on('data', (d) => {
            const str = d.toString();
            errorOutput += str;
            const m = str.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (m) process.stdout.write(`\r⏱️ [${index + 1}/${total}] ${item.nombreMostrar} | Progreso: ${m[1]} / 00:00:25.00`);
        });
        ff.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`FFmpeg falló con código ${code}: ${errorOutput.slice(-500)}`));
        });
    });

    // 4. GENERAR PORTADA INCÓGNITA (ZONA SEGURA 3:4, SIN SPOILERS)
    const snapPath = path.join(__dirname, `snap_${item.id}.jpg`);
    await new Promise((resolve, reject) => {
        const pSnap = spawn('ffmpeg', [
            '-y', '-ss', '00:00:04', '-i', destVideoPath,
            '-vframes', '1', '-q:v', '1', snapPath
        ]);
        pSnap.on('close', (c) => c === 0 ? resolve() : reject(new Error(`Error snapshot: ${c}`)));
    });

    const bCover = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
    const pCover = await bCover.newPage();
    await pCover.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const imgBuf = fs.readFileSync(snapPath);
    const bgBase64 = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;

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
                font-size: 28px; font-weight: 900; letter-spacing: 2px; padding: 10px 30px; border-radius: 20px;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.35); text-transform: uppercase;
            }
            .main-title {
                color: #ffffff; font-size: 58px; font-weight: 900; line-height: 1.12; letter-spacing: -1px;
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
            <div class="brand-pill">⚽ ESTADIOS VIRTUALES · TRIVIA</div>
            <div class="center-block">
                <div class="difficulty-badge">ESTADIO...</div>
                <div class="main-title">¿QUÉ ESTADIO ES<br>Y DÓNDE QUEDA?</div>
                <div class="clue-box">
                    <div class="clue-icon">💡</div>
                    <div class="clue-desc">${item.portadaClue}</div>
                </div>
            </div>
            <div class="footer-block">
                <div class="sub-question">¿Te animás a adivinarlo antes del final? 👀</div>
                <div class="cta-btn">DEJÁ TU RESPUESTA EN COMENTARIOS ✍️</div>
            </div>
        </div>
    </body>
    </html>`;

    await pCover.setContent(coverHtml);
    await pCover.screenshot({ path: destCoverPath });
    await bCover.close();

    // 5. TEXTOS
    generarArchivoTextos(item, stadiumFolder);

    // Limpieza de temporales
    const toClean = [
        snapPath,
        tempAudio,
        mapImgPath,
        uiHeaderImg,
        uiP1Img,
        uiP2Img,
        uiP3Img,
        uiRevImg,
        uiBtnImg
    ];
    for (const f of toClean) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    console.log(`\n✅ ¡Pack completado para ${item.nombreMostrar}!`);
}

async function main() {
    const total = STADIUMS_QUEUE.length;
    if (total === 0) {
        console.log('ℹ️ La cola STADIUMS_QUEUE está vacía. Inserte estadios para procesar.');
        return;
    }
    for (let i = 0; i < total; i++) {
        await procesarEstadio(STADIUMS_QUEUE[i], i, total);
    }
    console.log(`\n🎉 PROCESO FINALIZADO (${total} estadios).`);
}

if (require.main === module) {
    main().catch(err => {
        console.error('❌ Error fatal:', err);
        process.exit(1);
    });
}

module.exports = { procesarEstadio, generarAudioProcedural };
