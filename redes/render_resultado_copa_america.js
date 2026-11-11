const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\COPA AMERICA DE ESTADIOS";

// ==========================================
// CONFIGURACIÓN DE RESULTADOS - COPA AMÉRICA
// ==========================================
const CONFIG_RESULTADOS = {
    'resultado-1': {
        cruceNum: 1,
        slug: '01-BOCA-VS-PALMEIRAS',
        tituloTorneo: 'COPA AMÉRICA DE ESTADIOS',
        fase: 'OCTAVOS DE FINAL · CRUCE 1/8',
        videoFileName: 'CopaAmerica_Resultado_01_Boca_vs_Palmeiras.mp4',
        portadaFileName: 'Portada_Resultado_01_Boca_Palmeiras.jpg',
        textFile: 'TEXTOS_RESULTADO_01.txt',
        clasificadoBadge: '👑 PRIMER CLASIFICADO A CUARTOS',
        escena2Title: '¡LA BOMBONERA EN CUARTOS! 🔥',
        escena2Sub: 'Triunfo categórico con el 85% de los votos',
        proximoRival: 'São Paulo o Atlas FC',
        fraseCelebracion: 'La mística y la caja de resonancia de Brandsen 805 avanzan de fase en la Copa América de Estadios 🏟️',
        footerComunidad: 'La Bombonera avanza a los Cuartos de Final',
        bracketHeaderSub: 'Boca Juniors ya está clasificado a Cuartos',
        nextCruceBanner: 'PRÓXIMO CRUCE: SÃO PAULO VS ATLAS FC',
        nextCruceCTA: '¡ENTRÁ A MI PERFIL Y VOTÁ EN EL CRUCE 2!',
        // Ganador
        winner: {
            nombre: 'BOCA JUNIORS',
            estadio: 'Alberto J. Armando',
            apodo: 'La Bombonera',
            ciudadPais: 'Buenos Aires, Argentina',
            capacidadTexto: '57.200 esp.',
            escudoFile: 'Boca.webp',
            votos: 39,
            porcentaje: 85,
            borderColor: '#00e676',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\La bombonera 3.mp4"
        },
        // Perdedor
        loser: {
            nombre: 'PALMEIRAS',
            estadio: 'Allianz Parque',
            apodo: 'Allianz Parque',
            ciudadPais: 'São Paulo, Brasil',
            capacidadTexto: '43.713 esp.',
            escudoFile: 'palmeiras.webp',
            votos: 7,
            porcentaje: 15,
            borderColor: 'rgba(255,255,255,0.3)',
            videoPath: "E:\\Google earth studio\\Brasil\\Allianz Parque_ Sociedade Esportiva Palmeiras.mp4"
        },
        totalComentarios: 46,
        nextCruceNum: 2,
        nextCruceTexto: 'São Paulo vs. Atlas FC',
        bgBracketVideo: "E:\\Google earth studio\\México\\Estadio Azteca.mp4",
        copy: `=== OPCIÓN 1: TIKTOK (CORTA, DIRECTA Y 100% LIBRE DE BLOQUEOS) ===
🏆 ¡Boca Juniors avanzó a Cuartos de Final de la Copa América de Estadios! 🇦🇷🔥
La Bombonera se impuso con el 85% frente al 15% del Allianz Parque.

⚔️ ¡El Cruce 2 (São Paulo vs Atlas FC) ya está abierto en mi perfil! 🗳️
¿Quién clasifica a Cuartos?

#CopaAmericaDeEstadios #BocaJuniors #LaBombonera #Palmeiras #EstadiosVirtuales #Estadios #Futbol


=== OPCIÓN 2: INSTAGRAM / REELS / COMPLETA ===
🏆 ¡BOCA JUNIORS CLASIFICÓ A CUARTOS DE FINAL! 🔥🇦🇷
¡Tenemos el primer estadio clasificado de la Copa América de Estadios!
La Bombonera se impuso en el duelo de la comunidad con una contundente diferencia:

📊 RESULTADO FINAL CRUCE 1:
🟢 BOCA JUNIORS (La Bombonera): 85% ✅ ¡CLASIFICADO!
⚪ PALMEIRAS (Allianz Parque): 15%

El templo xeneize hace valer su historia y mística y ya espera rival en Cuartos de Final (saldrá de São Paulo vs Atlas FC).

⚔️ CRUCE 2 DISPONIBLE AHORA:
São Paulo (Morumbí) vs. Atlas FC (Estadio Jalisco).
👉 ¡Entrá a nuestro perfil y dejá tu voto para clasificar a tu favorito! 🗳️

🎮 Jugá gratis en el link de nuestra bio.

#CopaAmericaDeEstadios #CopaAmerica #BocaJuniors #LaBombonera #Palmeiras #AllianzParque #Estadios #FutbolSudamericano #EstadiosVirtuales`
    },
    'resultado-2': {
        cruceNum: 2,
        slug: '02-SAOPAULO-VS-ATLAS',
        tituloTorneo: 'COPA AMÉRICA DE ESTADIOS',
        fase: 'OCTAVOS DE FINAL · CRUCE 2/8',
        videoFileName: 'CopaAmerica_Resultado_02_SaoPaulo_vs_Atlas.mp4',
        portadaFileName: 'Portada_Resultado_02_SaoPaulo_Atlas.jpg',
        textFile: 'TEXTOS_RESULTADO_02.txt',
        clasificadoBadge: '👑 SEGUNDO CLASIFICADO A CUARTOS',
        escena2Title: '¡EL MORUMBÍ EN CUARTOS! 🔥',
        escena2Sub: 'Triunfo con el 80% de los votos de la comunidad',
        proximoRival: 'Boca Juniors en Cuartos',
        fraseCelebracion: 'El gigante paulista y su colosal estructura avanzan a Cuartos de Final para un superclásico continental contra Boca Juniors 🏟️',
        footerComunidad: 'El Estadio Morumbí avanza a los Cuartos de Final',
        bracketHeaderSub: '¡Primer cruce de Cuartos confirmado: Boca vs. São Paulo!',
        nextCruceBanner: 'PRÓXIMO CRUCE: FLAMENGO VS INDEPENDIENTE',
        nextCruceCTA: '¡ENTRÁ A MI PERFIL Y VOTÁ EN EL CRUCE 3!',
        // Ganador
        winner: {
            nombre: 'SÃO PAULO FC',
            estadio: 'Cícero Pompeu de Toledo',
            apodo: 'Estadio Morumbí',
            ciudadPais: 'São Paulo, Brasil',
            capacidadTexto: '66.795 esp.',
            escudoFile: 'saopaulo.webp',
            votos: 4,
            porcentaje: 80,
            borderColor: '#00e676',
            videoPath: "E:\\Google earth studio\\Brasil\\Estadio Cícero Pompeu de Toledo_ São Paulo Futebol Clube.mp4"
        },
        // Perdedor
        loser: {
            nombre: 'ATLAS FC',
            estadio: 'Estadio Jalisco',
            apodo: 'El Monumental Jalisco',
            ciudadPais: 'Guadalajara, México',
            capacidadTexto: '55.110 esp.',
            escudoFile: 'atlas.webp',
            votos: 1,
            porcentaje: 20,
            borderColor: 'rgba(255,255,255,0.3)',
            videoPath: "E:\\Google earth studio\\México\\Estadio Jalisco Atlas.mp4"
        },
        totalComentarios: 5,
        nextCruceNum: 3,
        nextCruceTexto: 'Flamengo vs. Independiente',
        bgBracketVideo: "E:\\Google earth studio\\México\\Estadio Azteca.mp4",
        copy: `=== OPCIÓN 1: TIKTOK (CORTA, DIRECTA Y 100% LIBRE DE BLOQUEOS) ===
🏆 ¡São Paulo avanzó a Cuartos de Final de la Copa América de Estadios! 🇧🇷🔥
El Estadio Morumbí se impuso con el 80% frente al 20% del Estadio Jalisco (Atlas FC).

⚔️ ¡Y atención porque en Cuartos de Final tendremos SUPERCLÁSICO CONTINENTAL: Boca Juniors vs. São Paulo! 🇦🇷⚔️🇧🇷

🔥 El Cruce 3 (Flamengo vs Independiente) ya está disponible en mi perfil para votar. 🗳️
¿Quién avanza a Cuartos?

#CopaAmericaDeEstadios #SaoPaulo #Morumbi #AtlasFC #EstadioJalisco #EstadiosVirtuales #Estadios #Futbol


=== OPCIÓN 2: INSTAGRAM / REELS / COMPLETA ===
🏆 ¡SÃO PAULO CLASIFICÓ A CUARTOS DE FINAL! 🔥🇧🇷
¡Tenemos al segundo estadio clasificado de la Copa América de Estadios!
El colosal Estadio Morumbí se impuso en el veredicto de la comunidad con una contundente diferencia:

📊 RESULTADO FINAL CRUCE 2:
🟢 SÃO PAULO FC (Estadio Morumbí): 80% ✅ ¡CLASIFICADO!
⚪ ATLAS FC (Estadio Jalisco): 20%

🔥 ¡SE VIENE UN CRUCE HISTÓRICO EN CUARTOS DE FINAL!
BOCA JUNIORS (La Bombonera) 🇦🇷 🆚 SÃO PAULO FC (Estadio Morumbí) 🇧🇷
¡Dos templos del fútbol continental mano a mano por el pase a Semifinales!

⚔️ CRUCE 3 DISPONIBLE AHORA:
Flamengo (Estadio Maracaná) vs. Independiente (Libertadores de América).
👉 ¡Entrá a nuestro perfil y dejá tu voto para clasificar a tu favorito! 🗳️

🎮 Jugá gratis en el link de nuestra bio.

#CopaAmericaDeEstadios #CopaAmerica #SaoPauloFC #Morumbi #AtlasFC #EstadioJalisco #BocaJuniors #Estadios #FutbolSudamericano #EstadiosVirtuales`
    }
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL (18.0s)
// Strict Zero Whoosh Rule: Majestic harmonic fanfare, bells, and victory chords
// ==========================================
function generarAudioProcedural(duracionSeg = 18.0, sampleRate = 44100) {
    const totalSamples = Math.floor(duracionSeg * sampleRate);
    const dataSize = totalSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono (se convierte a estéreo en FFmpeg con -ac 2)
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

    function addHarmonicChord(startSec, durSec, rootFreq, volume = 0.4) {
        addTone(startSec, durSec, rootFreq, volume, 2.5);
        addTone(startSec, durSec, rootFreq * 1.25, volume * 0.75, 2.5); // Mayor 3rd
        addTone(startSec, durSec, rootFreq * 1.5, volume * 0.65, 2.5);  // 5th
        addTone(startSec, durSec, rootFreq * 2.0, volume * 0.45, 2.8);  // Octave
    }

    function addBellChime(startSec, freq = 880, vol = 0.4) {
        addTone(startSec, 1.8, freq, vol, 4.0);
        addTone(startSec, 1.4, freq * 2.04, vol * 0.4, 5.0);
        addTone(startSec, 1.0, freq * 3.02, vol * 0.2, 6.0);
    }

    // 0.8s: Campana de inicio
    addBellChime(0.8, 523.25, 0.45); // C5
    addHarmonicChord(1.0, 3.5, 261.63, 0.35); // C4

    // 2.2s: Pop de impacto cuando se devela la barra de porcentaje
    addBellChime(2.2, 1046.50, 0.55); // C6
    addHarmonicChord(2.4, 3.0, 523.25, 0.45);

    // 5.0s: Fanfarria triunfal de victoria
    addBellChime(5.0, 659.25, 0.50); // E5
    addHarmonicChord(5.2, 5.5, 329.63, 0.50); // E4
    addHarmonicChord(5.4, 5.0, 392.00, 0.45); // G4
    addHarmonicChord(5.6, 5.0, 523.25, 0.55); // C5

    // 11.5s: Campana de transición al Árbol de Playoffs
    addBellChime(11.5, 880.00, 0.45); // A5
    addHarmonicChord(11.8, 4.5, 440.00, 0.40);

    // 15.0s: Acorde conclusivo de invitación a votar en el próximo Cruce
    addBellChime(15.0, 1046.50, 0.50); // C6
    addHarmonicChord(15.2, 2.5, 523.25, 0.40);

    // Fade out suave
    const fadeOutStart = Math.floor(16.5 * sampleRate);
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
async function generarOverlaysResultado(cfg, assetsDir) {
    console.log(`🎨 Generando overlays para el resultado de ${cfg.slug}...`);
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');
    let trofeoCopa = '';
    const croppedCupPath = path.join(__dirname, 'trofeo_cropped.webp');
    if (fs.existsSync(croppedCupPath)) {
        trofeoCopa = 'data:image/webp;base64,' + fs.readFileSync(croppedCupPath).toString('base64');
    }

    const getEscudo = (file) => 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', file)).toString('base64');
    const escWinner = getEscudo(cfg.winner.escudoFile);
    const escLoser = getEscudo(cfg.loser.escudoFile);

    const escudosBracket = {
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
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                    border: 2px solid rgba(255, 215, 0, 0.6);
                    border-top: 3.5px solid rgba(255, 235, 120, 0.95);
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
                    font-size: 18px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    padding: 5px 18px;
                    border-radius: 12px;
                    margin-bottom: 8px;
                }
                .header-title {
                    color: #ffffff;
                    font-size: 38px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    line-height: 1.15;
                    text-shadow: 0 3px 12px rgba(0, 0, 0, 0.9);
                }
                .header-sub {
                    color: #00ff77;
                    font-size: 20px;
                    font-weight: 800;
                    margin-top: 6px;
                    letter-spacing: 0.5px;
                }

                /* ESTILOS DE TARJETAS DE RESULTADO */
                .res-card {
                    position: absolute;
                    left: 50px;
                    width: 980px;
                    border-radius: 30px;
                    padding: 24px 28px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
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
    // OVERLAY 1: RESULTADO Y PORCENTAJES (0s a 5.0s)
    // ==========================================
    const htmlEscena1 = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">🏆 COPA AMÉRICA DE ESTADIOS · CRUCE ${cfg.cruceNum}</div>
            <div class="header-title">¡RESULTADO DE LA VOTACIÓN! 🗳️</div>
            <div class="header-sub">Votación de la comunidad · Veredicto oficial</div>
        </div>

        <!-- TARJETA GANADOR -->
        <div class="res-card" style="top: 260px; height: 490px; background: linear-gradient(135deg, rgba(14, 34, 55, 0.99) 0%, rgba(8, 18, 30, 0.99) 100%); border: 3.5px solid #00ff77; box-shadow: 0 16px 50px rgba(0,0,0,0.92), 0 0 40px rgba(0, 255, 119, 0.35);">
            <!-- Badge Clasificado -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="background: rgba(0, 255, 119, 0.2); border: 2px solid #00ff77; color: #00ff77; font-size: 16px; font-weight: 900; padding: 6px 18px; border-radius: 12px; letter-spacing: 1.5px; text-transform: uppercase;">
                    🎉 ¡CLASIFICADO A CUARTOS! ✅
                </span>
                <span style="color: #ffd700; font-size: 18px; font-weight: 900; letter-spacing: 1px;">CRUCE ${cfg.cruceNum}</span>
            </div>

            <!-- Datos del Estadio Ganador -->
            <div style="display: flex; align-items: center; gap: 24px; margin-top: 10px;">
                <div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <div style="position: absolute; width: 105px; height: 105px; background: radial-gradient(circle, rgba(0, 100, 255, 0.6) 0%, transparent 75%); border-radius: 50%; filter: blur(10px);"></div>
                    <img src="${escWinner}" style="width: 105px; height: 105px; object-fit: contain; position: relative; z-index: 2; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.9));">
                </div>
                <div style="flex: 1;">
                    <div style="color: #ffd700; font-size: 34px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1;">${cfg.winner.nombre}</div>
                    <div style="color: #ffffff; font-size: 26px; font-weight: 800; margin-top: 4px;">${cfg.winner.estadio} · "${cfg.winner.apodo}"</div>
                    <div style="color: #94a3b8; font-size: 19px; font-weight: 700; margin-top: 4px;">📍 ${cfg.winner.ciudadPais} · ${cfg.winner.capacidadTexto}</div>
                </div>
            </div>

            <!-- Porcentaje y Barra Ganadora -->
            <div style="background: rgba(0, 0, 0, 0.45); border: 1.5px solid rgba(0, 255, 119, 0.35); border-radius: 20px; padding: 14px 20px; margin-top: 10px;">
                <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #00ff77; font-size: 56px; font-weight: 900; letter-spacing: -1px; line-height: 1;">${cfg.winner.porcentaje}%</span>
                    <span style="color: #00ff77; font-size: 24px; font-weight: 900; letter-spacing: 1px;">MAYORÍA DE VOTOS</span>
                </div>
                <!-- Barra de progreso -->
                <div style="height: 22px; background: rgba(255, 255, 255, 0.12); border-radius: 12px; overflow: hidden; padding: 3px;">
                    <div style="width: ${cfg.winner.porcentaje}%; height: 100%; background: linear-gradient(90deg, #00b0ff 0%, #00e676 60%, #00ff77 100%); border-radius: 10px; box-shadow: 0 0 16px rgba(0, 255, 119, 0.8);"></div>
                </div>
            </div>
        </div>

        <!-- TARJETA PERDEDOR -->
        <div class="res-card" style="top: 775px; height: 390px; background: linear-gradient(135deg, rgba(16, 22, 30, 0.98) 0%, rgba(9, 13, 18, 0.99) 100%); border: 2px solid rgba(255, 255, 255, 0.22);">
            <!-- Badge Eliminado -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255, 255, 255, 0.25); color: #94a3b8; font-size: 15px; font-weight: 800; padding: 4px 14px; border-radius: 10px; letter-spacing: 1px; text-transform: uppercase;">
                    ELIMINADO EN OCTAVOS
                </span>
                <span style="color: #94a3b8; font-size: 16px; font-weight: 800;">CRUCE ${cfg.cruceNum}</span>
            </div>

            <!-- Datos del Estadio Perdedor -->
            <div style="display: flex; align-items: center; gap: 20px; margin-top: 6px;">
                <img src="${escLoser}" style="width: 85px; height: 85px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
                <div style="flex: 1;">
                    <div style="color: #cbd5e1; font-size: 26px; font-weight: 800; text-transform: uppercase;">${cfg.loser.nombre}</div>
                    <div style="color: #94a3b8; font-size: 22px; font-weight: 700; margin-top: 2px;">${cfg.loser.estadio}</div>
                    <div style="color: #64748b; font-size: 17px; font-weight: 600;">📍 ${cfg.loser.ciudadPais} · ${cfg.loser.capacidadTexto}</div>
                </div>
            </div>

            <!-- Porcentaje y Barra Perdedora -->
            <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; padding: 12px 18px; margin-top: 6px;">
                <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #cbd5e1; font-size: 40px; font-weight: 900; line-height: 1;">${cfg.loser.porcentaje}%</span>
                    <span style="color: #94a3b8; font-size: 18px; font-weight: 800;">VOTOS DE LA COMUNIDAD</span>
                </div>
                <!-- Barra de progreso -->
                <div style="height: 16px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; overflow: hidden; padding: 2px;">
                    <div style="width: ${cfg.loser.porcentaje}%; height: 100%; background: #64748b; border-radius: 8px;"></div>
                </div>
            </div>
        </div>

        <!-- FOOTER COMUNIDAD (y: 1200) -->
        <div style="position: absolute; top: 1195px; left: 50px; width: 980px; background: rgba(14, 26, 42, 0.95); border: 2px solid rgba(0, 230, 118, 0.6); border-radius: 24px; padding: 18px 24px; text-align: center; box-shadow: 0 12px 35px rgba(0,0,0,0.85);">
            <div style="color: #ffffff; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                ¡GRACIAS A TODOS LOS QUE PARTICIPARON Y VOTARON! 🗳️
            </div>
            <div style="color: #00ff77; font-size: 19px; font-weight: 800; margin-top: 4px;">
                ${cfg.footerComunidad}
            </div>
        </div>
    `);
    await page.setContent(htmlEscena1, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_escena1.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 2: CELEBRACIÓN DEL GANADOR (5.0s a 11.5s)
    // ==========================================
    const htmlEscena2 = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">${cfg.clasificadoBadge}</div>
            <div class="header-title">${cfg.escena2Title}</div>
            <div class="header-sub">${cfg.escena2Sub}</div>
        </div>

        <!-- TARJETA SHOWCASE ESTADIO FLOTANTE INFERIOR -->
        <div style="position: absolute; top: 1300px; left: 50px; width: 980px; background: linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border: 3px solid #ffd700; border-radius: 32px; padding: 26px 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.95), 0 0 40px rgba(255, 215, 0, 0.35);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${escWinner}" style="width: 65px; height: 65px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
                    <div>
                        <div style="color: #ffd700; font-size: 26px; font-weight: 900; text-transform: uppercase;">ESTADIO ${cfg.winner.estadio.toUpperCase()}</div>
                        <div style="color: #ffffff; font-size: 20px; font-weight: 800;">"${cfg.winner.apodo}" · ${cfg.winner.ciudadPais}</div>
                    </div>
                </div>
                <div style="background: rgba(0, 255, 119, 0.2); border: 2px solid #00ff77; color: #00ff77; font-size: 22px; font-weight: 900; padding: 6px 18px; border-radius: 14px;">
                    ${cfg.winner.porcentaje}% ✅
                </div>
            </div>

            <!-- Mini stats destacadas -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px;">
                <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 16px; text-align: center;">
                    <div style="color: #94a3b8; font-size: 14px; font-weight: 800; text-transform: uppercase;">CAPACIDAD</div>
                    <div style="color: #ffffff; font-size: 22px; font-weight: 900; margin-top: 2px;">${cfg.winner.capacidadTexto}</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 16px; text-align: center;">
                    <div style="color: #94a3b8; font-size: 14px; font-weight: 800; text-transform: uppercase;">PRÓXIMO RIVAL</div>
                    <div style="color: #ffd700; font-size: 22px; font-weight: 900; margin-top: 2px;">${cfg.proximoRival}</div>
                </div>
            </div>

            <div style="margin-top: 16px; text-align: center; color: #cbd5e1; font-size: 19px; font-weight: 700; line-height: 1.3;">
                ${cfg.fraseCelebracion}
            </div>
        </div>
    `);
    await page.setContent(htmlEscena2, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_escena2.png'), omitBackground: true });

    // ==========================================
    // OVERLAY 3: CUADRO ACTUALIZADO + GANCHO PRÓXIMO CRUCE (11.5s a 18.0s)
    // ==========================================
    const renderMatchCard = (num, e1, n1, c1, e2, n2, c2, side = 'left', yPos, isFinished = false, winnerNum = 1, p1 = '', p2 = '', isNext = false) => {
        let borderSide = side === 'left' ? 'border-left: 5px solid #00e676;' : 'border-right: 5px solid #ffd700;';
        let badgeColor = side === 'left' ? '#00e676' : '#ffd700';
        let extraBorder = '';
        if (isNext) {
            extraBorder = 'border: 2.5px solid #ffd700; box-shadow: 0 0 25px rgba(255, 215, 0, 0.7);';
        }

        let badge1 = `<span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:1px 5px; font-size:11px; font-weight:800; color:#94a3b8;">${c1}</span>`;
        let badge2 = `<span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:1px 5px; font-size:11px; font-weight:800; color:#94a3b8;">${c2}</span>`;

        if (isFinished) {
            if (winnerNum === 1) {
                badge1 = `<span style="background:#00ff77; color:#090f1a; border-radius:6px; padding:1px 6px; font-size:11px; font-weight:900;">${p1 || '85%'} ✅</span>`;
                badge2 = `<span style="color:#ef4444; font-size:11px; font-weight:800;">${p2 || '15%'} ❌</span>`;
            } else {
                badge1 = `<span style="color:#ef4444; font-size:11px; font-weight:800;">${p1 || '15%'} ❌</span>`;
                badge2 = `<span style="background:#00ff77; color:#090f1a; border-radius:6px; padding:1px 6px; font-size:11px; font-weight:900;">${p2 || '85%'} ✅</span>`;
            }
        }

        return `
        <div style="position:absolute; top:${yPos}px; ${side === 'left' ? 'left:25px;' : 'right:25px;'} width:250px; height:92px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:1.5px solid rgba(255,255,255,0.2); ${borderSide} ${extraBorder} border-radius:16px; padding:8px 12px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 10px 25px rgba(0,0,0,0.88); z-index:5;">
            <!-- Equipo 1 -->
            <div style="display:flex; align-items:center; gap:8px; ${isFinished && winnerNum === 2 ? 'opacity:0.45;' : ''}">
                <img src="${e1}" style="width:26px; height:26px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                <span style="color:#ffffff; font-size:14px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${n1}</span>
                ${badge1}
            </div>
            <!-- Divisor con etiqueta del Cruce -->
            <div style="height:1px; background:rgba(255,255,255,0.14); position:relative; margin:2px 0;">
                <span style="position:absolute; top:-8px; ${side === 'left' ? 'right:8px;' : 'left:8px;'} background:#090f1a; color:${isNext ? '#ffd700' : badgeColor}; font-size:10px; font-weight:900; padding:1px 6px; border-radius:6px; border:1px solid ${isNext ? '#ffd700' : 'rgba(255,255,255,0.2)'};">
                    ${isNext ? '🔥 VOTÁ HOY' : `CRUCE ${num}`}
                </span>
            </div>
            <!-- Equipo 2 -->
            <div style="display:flex; align-items:center; gap:8px; ${isFinished && winnerNum === 1 ? 'opacity:0.45;' : ''}">
                <img src="${e2}" style="width:26px; height:26px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                <span style="color:#ffffff; font-size:14px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${n2}</span>
                ${badge2}
            </div>
        </div>
        `;
    };

    const renderStageNode = (text, x, y, width, height, borderColor, textColor, customContent = null) => `
        <div style="position:absolute; left:${x}px; top:${y}px; width:${width}px; height:${height}px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:1.8px solid ${borderColor}; border-radius:12px; display:flex; align-items:center; justify-content:center; text-align:center; box-shadow:0 8px 20px rgba(0,0,0,0.8); z-index:5;">
            ${customContent ? customContent : `<span style="color:${textColor}; font-size:11px; font-weight:900; letter-spacing:0.6px; text-transform:uppercase;">${text}</span>`}
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

    // Configuración según el cruce que se esté mostrando
    let cruce1Finished = true;
    let cruce2Finished = cfg.cruceNum >= 2;
    let cruce3Next = cfg.cruceNum === 2;
    let cruce2Next = cfg.cruceNum === 1;

    let cuartos1HTML = '';
    if (cfg.cruceNum === 1) {
        cuartos1HTML = renderStageNode('BOCA', 315, bCYC1 - 24, 75, 48, '#00ff77', '#00ff77', `
            <div style="display:flex; align-items:center; gap:5px; padding:2px;">
                <img src="${escudosBracket.boca}" style="width:20px; height:20px; object-fit:contain;">
                <span style="color:#00ff77; font-size:10px; font-weight:900;">BOCA</span>
            </div>
        `);
    } else {
        // Cruce 2 finalizado: ¡Boca vs São Paulo confirmado en Cuartos 1!
        cuartos1HTML = renderStageNode('CUARTOS 1', 315, bCYC1 - 28, 88, 56, '#00ff77', '#00ff77', `
            <div style="display:flex; flex-direction:column; gap:2px; padding:3px 5px; width:100%; justify-content:center;">
                <div style="display:flex; align-items:center; gap:5px;">
                    <img src="${escudosBracket.boca}" style="width:16px; height:16px; object-fit:contain;">
                    <span style="color:#00ff77; font-size:9.5px; font-weight:900;">BOCA</span>
                </div>
                <div style="height:1px; width:100%; background:rgba(255,255,255,0.2);"></div>
                <div style="display:flex; align-items:center; gap:5px;">
                    <img src="${escudosBracket.saopaulo}" style="width:16px; height:16px; object-fit:contain;">
                    <span style="color:#ffd700; font-size:9.5px; font-weight:900;">SÃO PAULO</span>
                </div>
            </div>
        `);
    }

    const htmlEscena3 = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">FIXTURE OFICIAL · ELIMINATORIAS</div>
            <div class="header-title">🏆 CUADRO ACTUALIZADO 🏆</div>
            <div class="header-sub">${cfg.bracketHeaderSub}</div>
        </div>

        <!-- CABECERAS DE OCTAVOS DE FINAL -->
        <div style="position:absolute; top:236px; left:25px; width:250px; text-align:center; background:linear-gradient(135deg, rgba(0, 230, 118, 0.22) 0%, rgba(0, 230, 118, 0.08) 100%); border:1.8px solid #00e676; border-radius:12px; padding:7px 10px; box-shadow:0 8px 20px rgba(0,0,0,0.7);">
            <span style="color:#00ff77; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">🟩 OCTAVOS (LLAVE A)</span>
        </div>

        <div style="position:absolute; top:236px; left:805px; width:250px; text-align:center; background:linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(255, 215, 0, 0.08) 100%); border:1.8px solid #ffd700; border-radius:12px; padding:7px 10px; box-shadow:0 8px 20px rgba(0,0,0,0.7);">
            <span style="color:#ffd700; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">🟨 OCTAVOS (LLAVE B)</span>
        </div>

        <!-- SVG DE LÍNEAS CONECTORAS DEL BRACKET -->
        <svg style="position:absolute; top:0; left:0; width:1080px; height:1920px; z-index:2; pointer-events:none;">
            <!-- LÍNEA GANADORA BOCA A CUARTOS 1 (BRILLANTE VERDE) -->
            <path d="M 275 ${bCY1} L 295 ${bCY1} L 295 ${bCYC1} L 315 ${bCYC1}" fill="none" stroke="#00ff77" stroke-width="4.5" filter="drop-shadow(0 0 8px #00ff77)" />

            <!-- LÍNEA SÃO PAULO A CUARTOS 1 -->
            ${cfg.cruceNum >= 2 ? `
            <path d="M 275 ${bCY2} L 295 ${bCY2} L 295 ${bCYC1} L 315 ${bCYC1}" fill="none" stroke="#00ff77" stroke-width="4.5" filter="drop-shadow(0 0 8px #00ff77)" />
            ` : `
            <path d="M 275 ${bCY2} L 295 ${bCY2} L 295 ${bCYC1}" fill="none" stroke="rgba(0, 230, 118, 0.75)" stroke-width="2.5" />
            `}

            <!-- Resto de conectores Llave A -->
            <path d="M 275 ${bCY3} L 295 ${bCY3} L 295 ${bCY4} L 275 ${bCY4}" fill="none" stroke="rgba(0, 230, 118, 0.75)" stroke-width="2.5" />
            <path d="M 295 ${bCYC2} L 315 ${bCYC2}" fill="none" stroke="rgba(0, 230, 118, 0.95)" stroke-width="2.5" />

            <path d="M 385 ${bCYC1} L 398 ${bCYC1} L 398 ${bCYC2} L 385 ${bCYC2}" fill="none" stroke="rgba(0, 176, 255, 0.75)" stroke-width="2.5" />
            <path d="M 398 ${bCYSemi} L 408 ${bCYSemi}" fill="none" stroke="rgba(0, 176, 255, 0.95)" stroke-width="2.5" />
            <path d="M 463 ${bCYSemi} L 475 ${bCYSemi}" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3,2" />

            <!-- Llave Derecha (Llave B) -->
            <path d="M 805 ${bCY1} L 785 ${bCY1} L 785 ${bCY2} L 805 ${bCY2}" fill="none" stroke="rgba(255, 215, 0, 0.75)" stroke-width="2.5" />
            <path d="M 785 ${bCYC1} L 765 ${bCYC1}" fill="none" stroke="rgba(255, 215, 0, 0.95)" stroke-width="2.5" />
            <path d="M 805 ${bCY3} L 785 ${bCY3} L 785 ${bCY4} L 805 ${bCY4}" fill="none" stroke="rgba(255, 215, 0, 0.75)" stroke-width="2.5" />
            <path d="M 785 ${bCYC2} L 765 ${bCYC2}" fill="none" stroke="rgba(255, 215, 0, 0.95)" stroke-width="2.5" />
            <path d="M 695 ${bCYC1} L 682 ${bCYC1} L 682 ${bCYC2} L 695 ${bCYC2}" fill="none" stroke="rgba(0, 176, 255, 0.75)" stroke-width="2.5" />
            <path d="M 682 ${bCYSemi} L 672 ${bCYSemi}" fill="none" stroke="rgba(0, 176, 255, 0.95)" stroke-width="2.5" />
            <path d="M 617 ${bCYSemi} L 605 ${bCYSemi}" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3,2" />
        </svg>

        <!-- CRUCES DE OCTAVOS (IZQUIERDA) -->
        <!-- CRUCE 1 (BOCA VS PALMEIRAS) -->
        ${renderMatchCard('1', escudosBracket.boca, 'Boca Juniors', 'ARG', escudosBracket.palmeiras, 'Palmeiras', 'BRA', 'left', bY1, true, 1, '85%', '15%', false)}
        
        <!-- CRUCE 2 (SÃO PAULO VS ATLAS FC) -->
        ${renderMatchCard('2', escudosBracket.saopaulo, 'São Paulo', 'BRA', escudosBracket.atlas, 'Atlas FC', 'MEX', 'left', bY2, cruce2Finished, 1, '80%', '20%', cruce2Next)}
        
        <!-- CRUCE 3 (FLAMENGO VS INDEPENDIENTE) -->
        ${renderMatchCard('3', escudosBracket.flamengo, 'Flamengo', 'BRA', escudosBracket.independiente, 'Independiente', 'ARG', 'left', bY3, false, 0, '', '', cruce3Next)}
        
        <!-- CRUCE 4 (SANTOS VS PUMAS) -->
        ${renderMatchCard('4', escudosBracket.santos, 'Santos FC', 'BRA', escudosBracket.pumas, 'Pumas UNAM', 'MEX', 'left', bY4)}

        <!-- NODO DE CUARTOS 1 -->
        ${cuartos1HTML}

        <!-- NODO DE CUARTOS 2 -->
        ${renderStageNode('CUARTOS 2', 315, bCYC2 - 20, 70, 40, 'rgba(0,230,118,0.7)', '#00ff77')}

        <!-- NODO DE SEMIFINAL 1 -->
        ${renderStageNode('SEMI 1', 408, bCYSemi - 22, 55, 44, 'rgba(0,176,255,0.85)', '#00e5ff')}

        <!-- NODO CENTRAL: GRAN FINAL -->
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

        <!-- NODO DE SEMIFINAL 2 -->
        ${renderStageNode('SEMI 2', 617, bCYSemi - 22, 55, 44, 'rgba(0,176,255,0.85)', '#00e5ff')}

        <!-- NODOS DE CUARTOS (DERECHA) -->
        ${renderStageNode('CUARTOS 3', 695, bCYC1 - 20, 70, 40, 'rgba(255,215,0,0.7)', '#ffd700')}
        ${renderStageNode('CUARTOS 4', 695, bCYC2 - 20, 70, 40, 'rgba(255,215,0,0.7)', '#ffd700')}

        <!-- CRUCES DE OCTAVOS (DERECHA) -->
        ${renderMatchCard('5', escudosBracket.america, 'Club América', 'MEX', escudosBracket.cruzeiro, 'Cruzeiro', 'BRA', 'right', bY1)}
        ${renderMatchCard('6', escudosBracket.racing, 'Racing Club', 'ARG', escudosBracket.corinthians, 'Corinthians', 'BRA', 'right', bY2)}
        ${renderMatchCard('7', escudosBracket.chivas, 'Chivas', 'MEX', escudosBracket.central, 'Rosario Central', 'ARG', 'right', bY3)}
        ${renderMatchCard('8', escudosBracket.river, 'River Plate', 'ARG', escudosBracket.colocolo, 'Colo-Colo', 'CHI', 'right', bY4)}

        <!-- BANNER INFO PRÓXIMO CRUCE (y: 1475) -->
        <div style="position:absolute; top:1470px; left:50%; transform:translateX(-50%); width:980px; background:linear-gradient(135deg, rgba(20, 35, 55, 0.98) 0%, rgba(10, 18, 30, 0.99) 100%); border:2px solid #ffd700; border-radius:20px; padding:14px 20px; display:flex; align-items:center; justify-content:center; gap:16px; box-shadow:0 10px 30px rgba(0,0,0,0.9), 0 0 25px rgba(255, 215, 0, 0.3);">
            <span style="font-size:24px;">⚔️</span>
            <span style="color:#ffd700; font-size:20px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">${cfg.nextCruceBanner}</span>
        </div>

        <!-- BOTÓN FOOTER CTA (y: 1680) -->
        <div style="position:absolute; bottom:130px; left:50%; transform:translateX(-50%); width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2.5px solid #00ff77; border-radius:22px; padding:16px 24px; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow:0 14px 40px rgba(0,0,0,0.9), 0 0 25px rgba(0,255,119,0.3);">
            <span style="font-size:26px;">🗳️</span>
            <span style="color:#00ff77; font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:0.8px;">${cfg.nextCruceCTA}</span>
        </div>
    `);
    await page.setContent(htmlEscena3, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_escena3.png'), omitBackground: true });

    await browser.close();
    console.log(`✅ Overlays de resultado generados exitosamente.`);
}

// ==========================================
// 3. GENERADOR DE PORTADA MISTERIO (1080x1920 con Zona Segura 3:4)
// ==========================================
async function generarPortadaResultado(cfg, outFolder, bgFramePath) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const getEscudo = (file) => 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', file)).toString('base64');
    const esc1 = getEscudo(cfg.winner.escudoFile);
    const esc2 = getEscudo(cfg.loser.escudoFile);
    const bgFrameBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(bgFramePath).toString('base64');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body {
                background: #000;
                width: 1080px;
                height: 1920px;
                position: relative;
                overflow: hidden;
            }
            .bg-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 1080px;
                height: 1920px;
                object-fit: cover;
                filter: brightness(0.32) saturate(1.2);
            }
            .safe-area-3-4 {
                position: absolute;
                top: 240px;
                left: 0;
                width: 1080px;
                height: 1440px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                padding: 40px 40px;
                z-index: 10;
            }
            .header-badge {
                background: rgba(14, 26, 42, 0.95);
                border: 2px solid rgba(255, 215, 0, 0.7);
                border-radius: 16px;
                padding: 10px 24px;
                color: #ffd700;
                font-size: 20px;
                font-weight: 900;
                letter-spacing: 2px;
                text-transform: uppercase;
                box-shadow: 0 10px 25px rgba(0,0,0,0.85);
            }
            .hook-box {
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                border: 3px solid #ffd700;
                border-radius: 36px;
                padding: 40px 30px;
                width: 100%;
                text-align: center;
                box-shadow: 0 25px 60px rgba(0,0,0,0.95), 0 0 45px rgba(255, 215, 0, 0.35);
            }
            .hook-eyebrow {
                display: inline-block;
                background: rgba(0, 255, 119, 0.2);
                border: 2px solid #00ff77;
                color: #00ff77;
                font-size: 20px;
                font-weight: 900;
                padding: 6px 20px;
                border-radius: 12px;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 16px;
            }
            .hook-title {
                color: #ffffff;
                font-size: 54px;
                font-weight: 900;
                line-height: 1.1;
                text-transform: uppercase;
                text-shadow: 0 4px 15px rgba(0,0,0,0.9);
                margin-bottom: 24px;
            }
            .match-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            .team-badge {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(255, 255, 255, 0.08);
                border: 1.5px solid rgba(255, 255, 255, 0.25);
                border-radius: 18px;
                padding: 10px 18px;
            }
            .team-badge img {
                width: 44px;
                height: 44px;
                object-fit: contain;
            }
            .team-badge span {
                color: #ffffff;
                font-size: 20px;
                font-weight: 800;
            }
            .vs-circle {
                background: #ffd700;
                color: #090f1a;
                font-size: 16px;
                font-weight: 900;
                padding: 8px 12px;
                border-radius: 50%;
            }
            .hook-sub {
                color: #00e5ff;
                font-size: 24px;
                font-weight: 800;
            }
            .cta-btn {
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                border: 2px solid #00ff77;
                border-radius: 24px;
                padding: 18px 32px;
                color: #00ff77;
                font-size: 24px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(0, 255, 119, 0.3);
            }
        </style>
    </head>
    <body>
        <img class="bg-image" src="${bgFrameBase64}">
        <div class="safe-area-3-4">
            <div class="header-badge">🏆 COPA AMÉRICA DE ESTADIOS</div>

            <div class="hook-box">
                <div class="hook-eyebrow">RESULTADO OFICIAL · CRUCE ${cfg.cruceNum}</div>
                <div class="hook-title">
                    ¿QUIÉN CLASIFICÓ<br>A CUARTOS?
                </div>
                <div class="match-row">
                    <div class="team-badge">
                        <img src="${esc1}">
                        <span>${cfg.winner.nombre}</span>
                    </div>
                    <div class="vs-circle">VS</div>
                    <div class="team-badge">
                        <img src="${esc2}">
                        <span>${cfg.loser.nombre}</span>
                    </div>
                </div>
                <div class="hook-sub">
                    ¡La comunidad definió el pase a Cuartos! 🗳️
                </div>
            </div>

            <div class="cta-btn">
                👉 MIRÁ EL RESULTADO DEFINITIVO ⚽
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 5000 });
    const portadaPath = path.join(outFolder, cfg.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada de resultado guardada: ${portadaPath}`);
}

// ==========================================
// 4. MOTOR DE RENDERIZADO DEL VIDEO DE RESULTADO (18.0s)
// ==========================================
async function renderizarResultadoCopaAmerica(resultKey = 'resultado-1') {
    const cfg = CONFIG_RESULTADOS[resultKey];
    if (!cfg) throw new Error(`Clave no encontrada: ${resultKey}`);

    const outFolder = path.join(BASE_OUTPUT_DIR, 'OCTAVOS DE FINAL', cfg.slug);
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    const assetsDir = path.join(outFolder, 'assets_temp_resultado');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    console.log(`\n🏆 ========================================================`);
    console.log(`🏆 PRODUCCIÓN: VIDEO DE RESULTADO ${cfg.slug} (18s)`);
    console.log(`🏆 ========================================================\n`);

    // 1. Guardar copy de publicación
    fs.writeFileSync(path.join(outFolder, cfg.textFile), cfg.copy, 'utf8');
    console.log(`✅ Archivo ${cfg.textFile} guardado.`);

    // 2. Extraer frame para la portada
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    console.log(`🎨 Generando portada de resultado...`);
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:04',
            '-i', cfg.winner.videoPath,
            '-vframes', '1',
            '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    await generarPortadaResultado(cfg, outFolder, bgFramePath);

    // 3. Generar Overlays transparentes
    await generarOverlaysResultado(cfg, assetsDir);

    // 4. Generar Audio procedural (18.0s)
    const audioPath = path.join(assetsDir, 'audio_resultado.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(18.0));

    // 5. Composición FFmpeg (18.0s)
    // Entradas:
    // 0: Winner video
    // 1: Loser video
    // 2: Bracket background video
    // 3: Overlay Escena 1 (0 a 5.0s)
    // 4: Overlay Escena 2 (5.0 a 11.5s)
    // 5: Overlay Escena 3 (11.5 a 18.0s)
    // 6: Audio procedural
    const videoOutPath = path.join(outFolder, cfg.videoFileName);
    const ov1 = path.join(assetsDir, 'overlay_escena1.png');
    const ov2 = path.join(assetsDir, 'overlay_escena2.png');
    const ov3 = path.join(assetsDir, 'overlay_escena3.png');

    console.log(`🎬 Renderizando video 1080x1920 (18s) con FFmpeg: ${videoOutPath}...`);

    const filterComplex = [
        // ESCENA 1: Split-screen vertical 50/50 oscurecido (0 a 5.0s)
        `[0:v]fps=30,trim=0:5.5,setpts=PTS-STARTPTS,scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,eq=brightness=-0.32:contrast=1.08[v_top]`,
        `[1:v]fps=30,trim=0:5.5,setpts=PTS-STARTPTS,scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,eq=brightness=-0.42:contrast=1.05[v_bot]`,
        `[v_top][v_bot]vstack=inputs=2[s1_video]`,

        // ESCENA 2: Winner stadium full width centrado (5.0 a 12.0s)
        `[0:v]fps=30,trim=5:12,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg_stadium]`,
        `[0:v]fps=30,trim=5:12,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=increase,crop=1080:608[fg_stadium]`,
        `[bg_stadium][fg_stadium]overlay=0:656[s2_video]`,

        // ESCENA 3: Fondo bracket ancho completo (11.5 a 18.0s)
        `[2:v]fps=30,trim=0:7,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg_azt]`,
        `[2:v]fps=30,trim=0:7,setpts=PTS-STARTPTS,scale=1080:608:force_original_aspect_ratio=increase,crop=1080:608[fg_azt]`,
        `[bg_azt][fg_azt]overlay=0:656[s3_video]`,

        // Transiciones XFADE suaves entre las 3 escenas
        `[s1_video][s2_video]xfade=transition=fade:duration=0.5:offset=4.8[x1]`,
        `[x1][s3_video]xfade=transition=fade:duration=0.5:offset=11.2[base_video]`,

        // Overlays
        `[3:v]format=rgba[o1]`,
        `[4:v]format=rgba[o2]`,
        `[5:v]format=rgba[o3]`,

        `[base_video][o1]overlay=0:0:enable='between(t,0,5.0)'[tmp1]`,
        `[tmp1][o2]overlay=0:0:enable='between(t,5.0,11.5)'[tmp2]`,
        `[tmp2][o3]overlay=0:0:enable='between(t,11.5,18.0)',setsar=1[final_v]`
    ];

    const ffmpegArgs = [
        '-y',
        '-i', cfg.winner.videoPath,
        '-i', cfg.loser.videoPath,
        '-i', cfg.bgBracketVideo,
        '-i', ov1,
        '-i', ov2,
        '-i', ov3,
        '-i', audioPath,
        '-filter_complex', filterComplex.join(';'),
        '-map', '[final_v]',
        '-map', '6:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-ac', '2',
        '-ar', '44100',
        '-b:a', '192k',
        '-movflags', '+faststart',
        '-t', '18.0',
        videoOutPath
    ];

    return new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);

        ff.stderr.on('data', (data) => {
            const str = data.toString();
            const m = str.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (m) {
                process.stdout.write(`⏱️ Progreso: ${m[1]} / 00:00:18.00\r`);
            }
        });

        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO DE RESULTADO FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
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
    const key = process.argv[2] || 'resultado-1';
    renderizarResultadoCopaAmerica(key).catch(console.error);
}

module.exports = { renderizarResultadoCopaAmerica, CONFIG_RESULTADOS };