const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\MUNDIAL DE ESTADIOS";

// ==========================================
// CONFIGURACIÓN DE CRUCES - MUNDIAL DE ESTADIOS
// ==========================================
const CONFIG_MUNDIAL = {
    'octavos-1': {
        slug: '01-BOCA-VS-PALMEIRAS',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 1 / 8',
        cruceSiguiente: 'São Paulo vs. Atlas',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 1/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Boca Juniors vs. Palmeiras',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_01_Boca_vs_Palmeiras.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_01_Boca_Palmeiras.jpg',
        team1: {
            numero: '1',
            nombre: 'BOCA JUNIORS',
            estadio: 'Alberto J. Armando',
            apodo: 'La Bombonera',
            ciudadPais: 'Buenos Aires, Argentina',
            capacidadTexto: '57.200 esp.',
            escudoFile: 'Boca.webp',
            borderColor: '#0044cc',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\La bombonera 3.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'PALMEIRAS',
            estadio: 'Allianz Parque',
            apodo: 'Allianz Parque',
            ciudadPais: 'São Paulo, Brasil',
            capacidadTexto: '43.713 esp.',
            escudoFile: 'palmeiras.webp',
            borderColor: '#006437',
            videoPath: "E:\\Google earth studio\\Brasil\\Allianz Parque_ Sociedade Esportiva Palmeiras.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (1/8) 🔥
¡Llegó el torneo más esperado! 16 estadios icónicos compiten por la gloria continental y VOS decidís quién avanza de ronda.

🏟️ CRUCE 1:
1️⃣ LA BOMBONERA (Boca Juniors · Argentina)
2️⃣ ALLIANZ PARQUE (Palmeiras · Brasil)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
⚔️ El ganador se medirá en Cuartos contra el vencedor de São Paulo vs Atlas.

🎮 Poné a prueba tus conocimientos de estadios en el link del perfil: estadiosvirtuales.com

#MundialDeEstadios #BocaJuniors #Palmeiras #LaBombonera #AllianzParque #Estadios #FutbolSudamericano #EstadiosVirtuales`
    },
    'octavos-2': {
        slug: '02-SAOPAULO-VS-ATLAS',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 2 / 8',
        cruceSiguiente: 'Boca Juniors vs. Palmeiras',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 2/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'São Paulo vs. Atlas FC',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_02_SaoPaulo_vs_Atlas.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_02_SaoPaulo_Atlas.jpg',
        team1: {
            numero: '1',
            nombre: 'SÃO PAULO FC',
            estadio: 'Cícero Pompeu de Toledo',
            apodo: 'Estadio Morumbí',
            ciudadPais: 'São Paulo, Brasil',
            capacidadTexto: '66.795 esp.',
            escudoFile: 'saopaulo.webp',
            borderColor: '#c8102e',
            videoPath: "E:\\Google earth studio\\Brasil\\Estadio Cícero Pompeu de Toledo_ São Paulo Futebol Clube.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'ATLAS FC',
            estadio: 'Estadio Jalisco',
            apodo: 'El Monumental Jalisco',
            ciudadPais: 'Guadalajara, México',
            capacidadTexto: '55.110 esp.',
            escudoFile: 'atlas.webp',
            borderColor: '#d4001f',
            videoPath: "E:\\Google earth studio\\México\\Estadio Jalisco Atlas.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (2/8) 🔥
¡Duelo de titanes entre Brasil y México! Dos colosos con enorme historia mundialista cara a cara por un boleto a Cuartos.

🏟️ CRUCE 2:
1️⃣ ESTADIO MORUMBÍ (São Paulo FC · Brasil)
2️⃣ ESTADIO JALISCO (Atlas FC · México)

👉 COMENTÁ "1" O "2" para darle tu voto a quien debe clasificar. 🗳️
⚔️ El vencedor enfrentará en Cuartos al ganador de Boca vs Palmeiras.

🎮 Jugá gratis en: estadiosvirtuales.com

#MundialDeEstadios #SaoPaulo #AtlasFC #Morumbi #EstadioJalisco #LigaMX #Brasileirao #EstadiosVirtuales`
    },
    'octavos-3': {
        slug: '03-FLAMENGO-VS-INDEPENDIENTE',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 3 / 8',
        cruceSiguiente: 'Santos FC vs. Pumas UNAM',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 3/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Flamengo vs. Independiente',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_03_Flamengo_vs_Independiente.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_03_Flamengo_Independiente.jpg',
        team1: {
            numero: '1',
            nombre: 'FLAMENGO',
            estadio: 'Jornalista Mário Filho',
            apodo: 'Estadio Maracaná',
            ciudadPais: 'Río de Janeiro, Brasil',
            capacidadTexto: '78.838 esp.',
            escudoFile: 'flamengo.webp',
            borderColor: '#c8102e',
            videoPath: "E:\\Google earth studio\\Brasil\\Maracaná.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'INDEPENDIENTE',
            estadio: 'Libertadores de América',
            apodo: 'Ricardo E. Bochini',
            ciudadPais: 'Avellaneda, Argentina',
            capacidadTexto: '42.069 esp.',
            escudoFile: 'Independiente.webp',
            borderColor: '#e11d2e',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\rojo(listo)\\Estadio Libertadores de América - Ricardo Enrique Bochini.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (3/8) 🔥
¡Clásico de la Copa Libertadores! El mítico Maracaná de Río de Janeiro se enfrenta a la mística copera del Libertadores de América.

🏟️ CRUCE 3:
1️⃣ ESTADIO MARACANÁ (Flamengo · Brasil)
2️⃣ LIBERTADORES DE AMÉRICA (Independiente · Argentina)

👉 ¿Quién merece pasar a Cuartos de Final? Comentá "1" o "2" abajo. 🗳️
⚔️ El clasificado jugará contra el ganador de Santos vs Pumas.

🎮 Demostrá cuánto sabés en: estadiosvirtuales.com

#MundialDeEstadios #Flamengo #Independiente #Maracana #LibertadoresDeAmerica #TodoRojo #Mengao #EstadiosVirtuales`
    },
    'octavos-4': {
        slug: '04-SANTOS-VS-PUMAS',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 4 / 8',
        cruceSiguiente: 'Flamengo vs. Independiente',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 4/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Santos FC vs. Pumas UNAM',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_04_Santos_vs_Pumas.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_04_Santos_Pumas.jpg',
        team1: {
            numero: '1',
            nombre: 'SANTOS FC',
            estadio: 'Urbano Caldeira',
            apodo: 'Vila Belmiro',
            ciudadPais: 'Santos, Brasil',
            capacidadTexto: '16.068 esp.',
            escudoFile: 'santos.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Brasil\\Estadio Urbano Caldeira_ Santos FC.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'PUMAS UNAM',
            estadio: 'Olímpico Universitario',
            apodo: 'Olímpico México 68',
            ciudadPais: 'CDMX, México',
            capacidadTexto: '72.000 esp.',
            escudoFile: 'pumas.webp',
            borderColor: '#d4af37',
            videoPath: "E:\\Google earth studio\\México\\Estadio Olimpico Universitario Pumas.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (4/8) 🔥
¡La cuna de Pelé y Neymar frente al templo universitario mexicano! Dos canchas legendarias con estilos totalmente únicos.

🏟️ CRUCE 4:
1️⃣ VILA BELMIRO (Santos FC · Brasil)
2️⃣ OLÍMPICO UNIVERSITARIO (Pumas UNAM · México)

👉 COMENTÁ "1" O "2" para sumar tu voto. ¡El estadio ganador avanza a Cuartos! 🗳️
⚔️ El clasificado chocará contra el ganador de Flamengo vs Independiente.

🎮 Trivia de estadios en el link del perfil: estadiosvirtuales.com

#MundialDeEstadios #SantosFC #PumasUNAM #VilaBelmiro #OlimpicoUniversitario #LigaMX #Brasileirao #EstadiosVirtuales`
    },
    'octavos-5': {
        slug: '05-AMERICA-VS-CRUZEIRO',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 5 / 8',
        cruceSiguiente: 'Racing Club vs. Corinthians',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 5/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Club América vs. Cruzeiro',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_05_America_vs_Cruzeiro.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_05_America_Cruzeiro.jpg',
        team1: {
            numero: '1',
            nombre: 'CLUB AMÉRICA',
            estadio: 'Estadio Azteca',
            apodo: 'Coloso de Santa Úrsula',
            ciudadPais: 'CDMX, México',
            capacidadTexto: '83.264 esp.',
            escudoFile: 'america1.webp',
            borderColor: '#ffd700',
            videoPath: "E:\\Google earth studio\\México\\Estadio Azteca.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'CRUZEIRO',
            estadio: 'Governador Magalhães Pinto',
            apodo: 'Estadio Mineirão',
            ciudadPais: 'Belo Horizonte, Brasil',
            capacidadTexto: '61.846 esp.',
            escudoFile: 'cruzeiro.webp',
            borderColor: '#004bb6',
            videoPath: "E:\\Google earth studio\\Brasil\\Estadio Mineirão_ Cruzeiro.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (5/8) 🔥
¡Coloso mundialista vs templo brasileño! El histórico Estadio Azteca se mide al imponente Mineirão de Belo Horizonte por un lugar en Cuartos.

🏟️ CRUCE 5:
1️⃣ ESTADIO AZTECA (Club América · México)
2️⃣ ESTADIO MINEIRÃO (Cruzeiro · Brasil)

👉 COMENTÁ "1" O "2" para darle tu voto al que debe avanzar de fase. 🗳️
⚔️ El clasificado enfrentará al ganador del cruce Racing vs Corinthians.

🎮 Demostrá tus conocimientos de canchas en: estadiosvirtuales.com

#MundialDeEstadios #ClubAmerica #Cruzeiro #EstadioAzteca #Mineirao #LigaMX #Brasileirao #EstadiosVirtuales`
    },
    'octavos-6': {
        slug: '06-RACING-VS-CORINTHIANS',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 6 / 8',
        cruceSiguiente: 'Club América vs. Cruzeiro',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 6/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Racing Club vs. Corinthians',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_06_Racing_vs_Corinthians.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_06_Racing_Corinthians.jpg',
        team1: {
            numero: '1',
            nombre: 'RACING CLUB',
            estadio: 'Presidente Perón',
            apodo: 'El Cilindro de Avellaneda',
            ciudadPais: 'Avellaneda, Argentina',
            capacidadTexto: '51.000 esp.',
            escudoFile: 'Racing.webp',
            borderColor: '#1bb1e7',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Cilindro(listo)x2\\Estadio Presidente Perón.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'CORINTHIANS',
            estadio: 'Neo Química Arena',
            apodo: 'Arena Corinthians',
            ciudadPais: 'São Paulo, Brasil',
            capacidadTexto: '49.205 esp.',
            escudoFile: 'corinthians.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Brasil\\Neo Química Arena_ Corinthians.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (6/8) 🔥
¡Arquitectura histórica vs modernidad de vanguardia! El majestuoso Cilindro de Avellaneda se bate a duelo con la imponente Neo Química Arena.

🏟️ CRUCE 6:
1️⃣ EL CILINDRO (Racing Club · Argentina)
2️⃣ NEO QUÍMICA ARENA (Corinthians · Brasil)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. 🗳️
⚔️ El clasificado enfrentará al ganador de América vs Cruzeiro.

🎮 Jugá la trivia de estadios gratis en: estadiosvirtuales.com

#MundialDeEstadios #RacingClub #Corinthians #ElCilindro #NeoQuimicaArena #Timao #LaAcademia #EstadiosVirtuales`
    },
    'octavos-7': {
        slug: '07-CHIVAS-VS-ROSARIO-CENTRAL',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 7 / 8',
        cruceSiguiente: 'River Plate vs. Colo-Colo',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 7/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Chivas de Guadalajara vs. Rosario Central',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_07_Chivas_vs_Rosario_Central.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_07_Chivas_Rosario_Central.jpg',
        team1: {
            numero: '1',
            nombre: 'CHIVAS DE GUADALAJARA',
            estadio: 'Estadio Akron',
            apodo: 'La Fortaleza Rojiblanca',
            ciudadPais: 'Zapopan, México',
            capacidadTexto: '46.355 esp.',
            escudoFile: 'guadalajara.webp',
            borderColor: '#d4001f',
            videoPath: "E:\\Google earth studio\\México\\Estadio Guadalajara Ubicación Zapopan, Jalisco, México.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'ROSARIO CENTRAL',
            estadio: 'Gigante de Arroyito',
            apodo: 'El Gigante',
            ciudadPais: 'Rosario, Argentina',
            capacidadTexto: '46.955 esp.',
            escudoFile: 'Rosario Central.webp',
            borderColor: '#ffc700',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Gigante(listo)x2\\gigante.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (7/8) 🔥
¡Dos canchas que arden de pasión! La imponente arquitectura moderna del Estadio Akron frente a la caldera del Gigante de Arroyito.

🏟️ CRUCE 7:
1️⃣ ESTADIO AKRON (Chivas · México)
2️⃣ GIGANTE DE ARROYITO (Rosario Central · Argentina)

👉 COMENTÁ "1" O "2" para sumar tu voto al que merece pasar a Cuartos. 🗳️
⚔️ El clasificado jugará contra el ganador del Duelo de Monumentales: River vs Colo-Colo.

🎮 Desafiá cuánto sabés de canchas en: estadiosvirtuales.com

#MundialDeEstadios #Chivas #RosarioCentral #EstadioAkron #GiganteDeArroyito #LigaMX #FutbolArgentino #EstadiosVirtuales`
    },
    'octavos-8': {
        slug: '08-RIVER-VS-COLOCOLO',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 8 / 8',
        cruceSiguiente: 'Chivas vs. Rosario Central',
        tituloBadge: '🏆 MUNDIAL DE ESTADIOS · OCTAVOS 8/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'River Plate vs. Colo-Colo',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Mundial_Octavos_08_River_vs_ColoColo.mp4',
        portadaFileName: 'Portada_Mundial_Octavos_08_River_ColoColo.jpg',
        team1: {
            numero: '1',
            nombre: 'RIVER PLATE',
            estadio: 'Mâs Monumental',
            apodo: 'El Monumental Renovado',
            ciudadPais: 'Buenos Aires, Argentina',
            capacidadTexto: '84.567 esp.',
            escudoFile: 'River.webp',
            borderColor: '#ff2233',
            customCrop: 'scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\River_Monumental_Renovado_16x9.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'COLO-COLO',
            estadio: 'Monumental David Arellano',
            apodo: 'La Ruca',
            ciudadPais: 'Santiago, Chile',
            capacidadTexto: '47.000 esp.',
            escudoFile: 'ColoColo.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Chile1\\Subidos\\Estadio Monumental_ Club Social y Deportivo Colo-Colo.mp4"
        },
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (8/8) 🔥
¡EL DUELO DE MONUMENTALES! El Mâs Monumental renovado de River Plate se enfrenta a La Ruca de Colo-Colo por el último boleto a Cuartos de Final.

🏟️ CRUCE 8:
1️⃣ MÂS MONUMENTAL (River Plate · Argentina)
2️⃣ MONUMENTAL DAVID ARELLANO (Colo-Colo · Chile)

👉 ¿Cuál de los dos Monumentales avanza a Cuartos? Comentá "1" o "2" abajo. 🗳️
⚔️ El ganador se medirá ante el vencedor de Chivas vs Rosario Central.

🎮 Poné a prueba cuánto sabés en: estadiosvirtuales.com

#MundialDeEstadios #RiverPlate #ColoColo #Monumental #DavidArellano #FutbolSudamericano #EstadiosVirtuales`
    }
        copy: `🏆 MUNDIAL DE ESTADIOS DE AMÉRICA | OCTAVOS DE FINAL (8/8) 🔥
¡ÚLTIMO BOLETO A CUARTOS! El imponente Estadio Akron con su diseño volcánico se enfrenta a la historia y caldera del Monumental de Colo-Colo.

🏟️ CRUCE 8:
1️⃣ ESTADIO AKRON (Chivas · México)
2️⃣ MONUMENTAL DAVID ARELLANO (Colo-Colo · Chile)

👉 COMENTÁ "1" O "2" para clasificar al último integrante de los Cuartos de Final. 🗳️
⚔️ El ganador se medirá ante el vencedor de Rosario Central vs Cruzeiro.

🎮 Poné a prueba cuánto sabés en: estadiosvirtuales.com

#MundialDeEstadios #Chivas #ColoColo #EstadioAkron #MonumentalColoColo #LigaMX #FutbolChileno #EstadiosVirtuales`
    }
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL (20.0s)
// Strict Zero Whoosh Rule: bells, tension ticks, gong, and harmonic fanfare
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
        addTone(startSec, 1.4, freq, 0.35, 4);
        addTone(startSec + 0.03, 1.2, freq * 1.5, 0.22, 5);
        addTone(startSec + 0.06, 0.9, freq * 2.0, 0.15, 6);
    }

    function addTick(startSec) {
        addTone(startSec, 0.06, 1250, 0.38, 25);
    }

    // 1.0s: Campana solemne de inicio de torneo
    addBellDing(1.0, 784.0);

    // 12s, 13s, 14s: Cuenta regresiva de tensión
    addTick(12.0);
    addTick(13.0);
    addTick(14.0);

    // 15.0s: Campana de llamada a votación comunitaria
    addBellDing(15.0, 1046.5);

    // 15.1s: Acordes armónicos ascendentes
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(15.1 + idx * 0.08, 3.2, freq, 0.32, 1.8);
    });

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// ==========================================
// 2. GENERADOR DE OVERLAYS (PUPPETEER)
// ==========================================
async function generarOverlaysGraficos(duelo, assetsDir) {
    console.log(`🎨 Generando overlays para torneo: ${duelo.slug}...`);

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const escudo1Base64 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', duelo.team1.escudoFile)).toString('base64');
    const escudo2Base64 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', duelo.team2.escudoFile)).toString('base64');
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

                /* HEADER SUPERIOR FLOTANTE */
                #header-box {
                    position: absolute;
                    top: 45px;
                    left: 50px;
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.95) 0%, rgba(8, 14, 24, 0.98) 100%);
                    border: 2px solid rgba(255, 215, 0, 0.5);
                    border-top: 3px solid rgba(255, 225, 80, 0.95);
                    border-radius: 28px;
                    padding: 16px 20px;
                    text-align: center;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.2);
                }
                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 215, 0, 0.15);
                    border: 1.5px solid rgba(255, 215, 0, 0.7);
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
                    font-size: 46px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                    margin-bottom: 4px;
                }
                .header-sub {
                    color: #00ff77;
                    font-size: 24px;
                    font-weight: 700;
                }

                /* TARJETAS FLOTANTES DE EQUIPOS */
                .club-pill {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: linear-gradient(135deg, rgba(11, 19, 32, 0.94) 0%, rgba(5, 10, 18, 0.98) 100%);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 22px;
                    padding: 12px 24px;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.85);
                }
                .club-pill.team1 {
                    top: 220px;
                    left: 50px;
                    border-left: 6px solid ${duelo.team1.borderColor};
                }
                .club-pill.team2 {
                    top: 1100px;
                    left: 50px;
                    border-left: 6px solid ${duelo.team2.borderColor};
                }
                .num-badge {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                    color: #0b111e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    font-weight: 900;
                    border: 2px solid #ffffff;
                    box-shadow: 0 4px 12px rgba(255,180,0,0.5);
                }
                .club-logo {
                    width: 65px;
                    height: 65px;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6));
                }
                .club-info-name {
                    color: #ffffff;
                    font-size: 30px;
                    font-weight: 900;
                    line-height: 1.1;
                }
                .club-info-stadium {
                    color: #ffd700;
                    font-size: 19px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .club-info-extra {
                    color: #94a3b8;
                    font-size: 16px;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div id="header-box">
                <div class="header-badge">${duelo.tituloBadge}</div>
                <div class="header-title">${duelo.pregunta}</div>
                <div class="header-sub">${duelo.subtitulo}</div>
            </div>

            <div class="club-pill team1">
                <div class="num-badge">1</div>
                <img src="${escudo1Base64}" class="club-logo">
                <div>
                    <div class="club-info-name">${duelo.team1.nombre}</div>
                    <div class="club-info-stadium">🏟️ ${duelo.team1.apodo} (${duelo.team1.capacidadTexto})</div>
                    <div class="club-info-extra">📍 ${duelo.team1.ciudadPais}</div>
                </div>
            </div>

            <div class="club-pill team2">
                <div class="num-badge">2</div>
                <img src="${escudo2Base64}" class="club-logo">
                <div>
                    <div class="club-info-name">${duelo.team2.nombre}</div>
                    <div class="club-info-stadium">🏟️ ${duelo.team2.apodo} (${duelo.team2.capacidadTexto})</div>
                    <div class="club-info-extra">📍 ${duelo.team2.ciudadPais}</div>
                </div>
            </div>

            ${contenidoCentro}
        </body>
        </html>
        `;
    }

    // 1. Overlay Presentación / Votación activa (0 a 12s)
    const htmlVotacion = getBaseHTML(`
        <div style="position:absolute; top:915px; left:50px; width:980px; display:flex; align-items:center; justify-content:center; gap:20px;">
            <div style="flex:1; height:3px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
            <div style="background:linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color:#0b111e; width:92px; height:92px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:38px; font-weight:900; border:4px solid #ffffff; box-shadow:0 0 35px rgba(255,190,0,0.7);">VS</div>
            <div style="flex:1; height:3px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
            <div style="position:absolute; top:-50px; background:rgba(0,0,0,0.88); border:1.5px solid rgba(255,215,0,0.75); border-radius:20px; padding:6px 24px; color:#ffffff; font-size:19px; font-weight:800; letter-spacing:1px; text-transform:uppercase; box-shadow:0 4px 15px rgba(0,0,0,0.8);">${duelo.subtituloVotacion}</div>
        </div>
    `);
    await page.setContent(htmlVotacion, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_votacion.png'), omitBackground: true });

    // 2. Cuenta regresiva 3, 2, 1 (12s a 15s)
    for (const num of [3, 2, 1]) {
        const htmlCount = getBaseHTML(`
            <div style="position:absolute; top:875px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:10px;">
                <div style="width:130px; height:130px; border-radius:50%; background:radial-gradient(circle, #ff3344 0%, #aa0011 100%); border:5px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:78px; font-weight:900; color:#ffffff; box-shadow:0 0 45px rgba(255,51,68,0.9);">${num}</div>
                <div style="background:rgba(0,0,0,0.9); border:1.5px solid #ff3344; border-radius:16px; padding:6px 20px; color:#ffffff; font-size:17px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">¡DEJÁ TU VOTO EN COMENTARIOS!</div>
            </div>
        `);
        await page.setContent(htmlCount, { timeout: 5000 });
        await page.screenshot({ path: path.join(assetsDir, `overlay_count_${num}.png`), omitBackground: true });
    }

    // 3. Tablero Final de Votación y Próximo Cruce (15s a 20s)
    const htmlRevelacion = getBaseHTML(`
        <!-- TABLERO CENTRAL DE VOTACIÓN -->
        <div style="position:absolute; top:750px; left:50px; width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2.5px solid rgba(255, 215, 0, 0.8); border-radius:28px; padding:22px 30px; box-shadow:0 20px 50px rgba(0,0,0,0.92), 0 0 40px rgba(255, 215, 0, 0.35); text-align:center;">
            
            <div style="display:inline-block; background:rgba(255, 215, 0, 0.15); border:1.5px solid #ffd700; color:#ffd700; font-size:18px; font-weight:900; letter-spacing:2px; padding:6px 20px; border-radius:20px; text-transform:uppercase; margin-bottom:12px;">🗳️ VOTACIÓN ABIERTA EN COMENTARIOS</div>
            
            <div style="display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:16px;">
                <!-- Team 1 -->
                <div style="flex:1; background:rgba(255,255,255,0.06); border:2px solid ${duelo.team1.borderColor}; border-radius:18px; padding:12px; display:flex; align-items:center; gap:12px;">
                    <div style="background:#ffd700; color:#0b111e; font-size:24px; font-weight:900; width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center;">1</div>
                    <img src="${escudo1Base64}" style="width:48px;height:48px;object-fit:contain;">
                    <div style="text-align:left;">
                        <div style="color:#ffffff; font-size:20px; font-weight:900; line-height:1.1;">${duelo.team1.nombre}</div>
                        <div style="color:#94a3b8; font-size:15px; font-weight:700;">${duelo.team1.apodo}</div>
                    </div>
                </div>

                <div style="color:#ffd700; font-size:26px; font-weight:900;">VS</div>

                <!-- Team 2 -->
                <div style="flex:1; background:rgba(255,255,255,0.06); border:2px solid ${duelo.team2.borderColor}; border-radius:18px; padding:12px; display:flex; align-items:center; gap:12px;">
                    <div style="background:#ffd700; color:#0b111e; font-size:24px; font-weight:900; width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center;">2</div>
                    <img src="${escudo2Base64}" style="width:48px;height:48px;object-fit:contain;">
                    <div style="text-align:left;">
                        <div style="color:#ffffff; font-size:20px; font-weight:900; line-height:1.1;">${duelo.team2.nombre}</div>
                        <div style="color:#94a3b8; font-size:15px; font-weight:700;">${duelo.team2.apodo}</div>
                    </div>
                </div>
            </div>

            <!-- INSTRUCCIÓN DE VOTO -->
            <div style="background:linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color:#0b111e; font-size:23px; font-weight:900; padding:10px 20px; border-radius:20px; border:2px solid #ffffff; box-shadow:0 6px 20px rgba(255,180,0,0.5); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">
                💬 COMENTÁ "1" O "2" PARA SUMAR TU VOTO
            </div>

            <div style="color:#cbd5e1; font-size:16px; font-weight:700; line-height:1.3;">
                ⚔️ <span style="color:#ffd700;">PRÓXIMA LLAVE:</span> El ganador enfrentará al vencedor de <span style="color:#ffffff; font-weight:800;">${duelo.cruceSiguiente}</span>
            </div>
        </div>

        <!-- CTA ELEVADO (bottom: 240px) -->
        <div style="position:absolute; bottom:240px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:24px; padding:18px 24px; display:flex; align-items:center; justify-content:center; gap:14px; box-shadow:0 16px 40px rgba(0,0,0,0.85), 0 0 30px rgba(0, 230, 118, 0.45); border:2px solid #ffffff;">
            <img src="${logoEv}" style="width:48px; height:48px; border-radius:10px;">
            <span style="color:#04160a; font-size:27px; font-weight:900; letter-spacing:-0.3px;">Jugá la trivia de estadios en estadiosvirtuales.com</span>
        </div>

        <!-- SEGUINOS SUB-PILL (bottom: 165px) -->
        <div style="position:absolute; bottom:165px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:8px; background:rgba(9, 14, 23, 0.92); border:1.5px solid #ffd700; padding:8px 24px; border-radius:20px; color:#ffd700; font-size:20px; font-weight:800; box-shadow:0 8px 25px rgba(0,0,0,0.85); white-space:nowrap; letter-spacing:0.5px;">
            <span>🔔 Seguinos para ver qué estadio clasifica a Cuartos 🏆</span>
        </div>
    `);

    await page.setContent(htmlRevelacion, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_revelacion.png'), omitBackground: true });

    await browser.close();
    console.log('✅ Overlays generados exitosamente.');
}

// ==========================================
// 3. GENERADOR DE PORTADA (SAFE ZONE 3:4 TIKTOK)
// ==========================================
async function generarPortada(duelo, outFolder, bgFramePath) {
    console.log(`🎨 Generando portada para ${duelo.slug}...`);
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

    const escudo1Base64 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', duelo.team1.escudoFile)).toString('base64');
    const escudo2Base64 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', duelo.team2.escudoFile)).toString('base64');
    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; overflow: hidden; position: relative; background: #090e17; }
            .bg-drone { position: absolute; inset: 0; background-image: url('${bgBase64}'); background-size: cover; background-position: center; filter: brightness(0.60) contrast(1.15); }
            .vignette { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(9, 14, 23, 0.25) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%), linear-gradient(180deg, rgba(9, 14, 23, 0.92) 0%, transparent 25%, transparent 75%, rgba(9, 14, 23, 0.95) 100%); }
            
            /* ZONA SEGURA 3:4 (y=260 a y=1660) */
            .safe-zone { position: absolute; top: 260px; left: 50px; right: 50px; bottom: 260px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; z-index: 10; }
            
            .brand-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(255, 215, 0, 0.6); border-top: 2.5px solid rgba(255, 235, 120, 0.95); border-radius: 35px; color: #ffd700; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 10px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(255, 215, 0, 0.35); }
            
            .main-box { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
            .hook-pill { background: rgba(0, 230, 118, 0.15); border: 2px solid #00e676; color: #00ff77; font-size: 23px; font-weight: 900; letter-spacing: 1.5px; padding: 8px 24px; border-radius: 20px; box-shadow: 0 0 20px rgba(0, 230, 118, 0.3); text-transform: uppercase; }
            .main-title { color: #ffffff; font-size: 66px; font-weight: 900; line-height: 1.1; letter-spacing: -1px; text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(255, 215, 0, 0.4); text-transform: uppercase; }
            .sub-title { color: #cbd5e1; font-size: 25px; font-weight: 700; }
            
            .duel-row { display: flex; align-items: center; justify-content: center; gap: 20px; width: 100%; margin: 15px 0; }
            .team-card { flex: 1; max-width: 420px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(10, 15, 26, 0.98) 100%); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); }
            .team-card.t1 { border-top: 6px solid ${duelo.team1.borderColor}; }
            .team-card.t2 { border-top: 6px solid ${duelo.team2.borderColor}; }
            .team-logo { width: 110px; height: 110px; object-fit: contain; filter: drop-shadow(0 6px 15px rgba(0,0,0,0.7)); }
            .team-card-name { color: #ffffff; font-size: 26px; font-weight: 900; }
            .team-card-stadium { color: #ffd700; font-size: 19px; font-weight: 700; text-transform: uppercase; }
            
            .vs-circle { width: 85px; height: 85px; border-radius: 50%; background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color: #0b111e; font-size: 36px; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 4px solid #ffffff; box-shadow: 0 0 35px rgba(255,190,0,0.75); }
            
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
                <span>${duelo.tituloBadge}</span>
            </div>

            <div class="main-box">
                <div class="hook-pill">🗳️ VOTA EN COMENTARIOS</div>
                <div class="main-title">${duelo.pregunta}</div>
                <div class="sub-title">${duelo.subtitulo}</div>

                <div class="duel-row">
                    <div class="team-card t1">
                        <img src="${escudo1Base64}" class="team-logo">
                        <div class="team-card-name">${duelo.team1.nombre}</div>
                        <div class="team-card-stadium">🏟️ ${duelo.team1.apodo}</div>
                    </div>
                    <div class="vs-circle">VS</div>
                    <div class="team-card t2">
                        <img src="${escudo2Base64}" class="team-logo">
                        <div class="team-card-name">${duelo.team2.nombre}</div>
                        <div class="team-card-stadium">🏟️ ${duelo.team2.apodo}</div>
                    </div>
                </div>
            </div>

            <div class="cta-card">
                <span class="cta-text">🔥 ¡El más votado pasa a Cuartos de Final! 🏆</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 5000 });
    const portadaPath = path.join(outFolder, duelo.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// ==========================================
// 4. RENDERIZAR VIDEO FINAL CON FFMPEG
// ==========================================
async function renderizarMundialDuelo(dueloKey) {
    const duelo = CONFIG_MUNDIAL[dueloKey];
    if (!duelo) {
        console.error(`❌ Cruce de mundial no encontrado: ${dueloKey}`);
        return;
    }

    console.log(`\n🏆 ========================================================`);
    console.log(`🏆 PRODUCCIÓN MUNDIAL DE ESTADIOS: ${duelo.slug}`);
    console.log(`🏆 ========================================================\n`);

    const outFolder = path.join(BASE_OUTPUT_DIR, duelo.fase, duelo.slug);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    // Carpeta temporal de assets
    const assetsDir = path.join(__dirname, `assets_mundial_${dueloKey}`);
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. Guardar texto y copy
    fs.writeFileSync(path.join(outFolder, 'TEXTOS_PUBLICACION.txt'), duelo.copy, 'utf8');
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt guardado.');

    // 2. Extraer frame de fondo para la portada
    const crop1 = duelo.team1.customCrop || 'scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960';
    const crop2 = duelo.team2.customCrop || 'scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960';

    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:03',
            '-i', duelo.team1.videoPath,
            '-ss', '00:00:03',
            '-i', duelo.team2.videoPath,
            '-filter_complex', `[0:v]${crop1}[t];[1:v]${crop2}[b];[t][b]vstack=inputs=2[outv]`,
            '-map', '[outv]',
            '-vframes', '1',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    // 3. Generar Portada de alta calidad
    await generarPortada(duelo, outFolder, bgFramePath);

    // 4. Generar Overlays transparentes
    await generarOverlaysGraficos(duelo, assetsDir);

    // 5. Generar Audio procedural de 20s
    const audioPath = path.join(assetsDir, 'audio_torneo.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(20.0));

    // 6. Ensamble con FFMPEG
    const videoOutPath = path.join(outFolder, duelo.videoFileName);
    const filterComplex = [
        `[0:v]${crop1}[top]`,
        `[1:v]${crop2}[bot]`,
        `[top][bot]vstack=inputs=2[stacked]`,
        `[stacked]drawbox=x=0:y=956:w=1080:h=8:color=0xffd700@0.95:t=fill[base]`,
        `[base][3:v]overlay=0:0:enable='between(t,0,12.0)'[v1]`,
        `[v1][4:v]overlay=0:0:enable='between(t,12.0,13.0)'[v2]`,
        `[v2][5:v]overlay=0:0:enable='between(t,13.0,14.0)'[v3]`,
        `[v3][6:v]overlay=0:0:enable='between(t,14.0,15.0)'[v4]`,
        `[v4][7:v]overlay=0:0:enable='between(t,15.0,20.0)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '20',
        '-i', duelo.team1.videoPath,                                     // 0:v
        '-i', duelo.team2.videoPath,                                     // 1:v
        '-i', audioPath,                                                 // 2:a
        '-i', path.join(assetsDir, 'overlay_votacion.png'),              // 3:v
        '-i', path.join(assetsDir, 'overlay_count_3.png'),               // 4:v
        '-i', path.join(assetsDir, 'overlay_count_2.png'),               // 5:v
        '-i', path.join(assetsDir, 'overlay_count_1.png'),               // 6:v
        '-i', path.join(assetsDir, 'overlay_revelacion.png'),            // 7:v
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
        videoOutPath
    ];

    console.log(`🎬 Renderizando video 1080x1920 con FFmpeg: ${videoOutPath}...`);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
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
                reject(new Error(`FFmpeg falló con código: ${code}`));
            }
        });
    });

    // Limpieza de assets temporales
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
    } catch (_) {}
}

// ==========================================
// 5. EJECUCIÓN PRINCIPAL (CLI)
// ==========================================
async function main() {
    const target = process.argv[2] || 'octavos-1';

    if (target === 'octavos-all') {
        const keys = Object.keys(CONFIG_MUNDIAL);
        console.log(`🚀 Iniciando renderizado en ráfaga de los ${keys.length} cruces de Octavos de Final...`);
        for (const k of keys) {
            await renderizarMundialDuelo(k);
        }
        console.log(`\n🏆🏆 ¡LOS 8 VIDEOS DEL MUNDIAL DE ESTADIOS HAN SIDO COMPLETADOS CON ÉXITO! 🏆🏆\n`);
    } else if (CONFIG_MUNDIAL[target]) {
        await renderizarMundialDuelo(target);
    } else {
        console.log(`Comando no reconocido: ${target}`);
        console.log(`Opciones disponibles:`);
        Object.keys(CONFIG_MUNDIAL).forEach(k => console.log(` - ${k}`));
        console.log(` - octavos-all (renderiza los 8 cruces en serie)`);
    }
}

main().catch(err => console.error('Error fatal:', err));
