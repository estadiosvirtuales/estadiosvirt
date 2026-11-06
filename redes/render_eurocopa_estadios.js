const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\EUROCOPA DE ESTADIOS";

// ==========================================
// CONFIGURACIÓN DE CRUCES - EUROCOPA DE ESTADIOS
// ==========================================
const CONFIG_EUROCOPA = {
    'octavos-1': {
        slug: '01-BERNABEU-VS-ANFIELD',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 1 / 8',
        cruceSiguiente: 'San Siro vs. Signal Iduna Park',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 1/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Santiago Bernabéu vs. Anfield',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_01_Bernabeu_vs_Anfield.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_01_Bernabeu_Anfield.jpg',
        team1: {
            numero: '1',
            nombre: 'REAL MADRID',
            estadio: 'Santiago Bernabéu',
            apodo: 'El Bernabéu',
            ciudadPais: 'Madrid, España',
            capacidadTexto: '85.000 esp.',
            escudoFile: 'Real.webp',
            borderColor: '#00529f',
            videoPath: "E:\\Google earth studio\\España\\Bloque A\\bernabeu.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'LIVERPOOL FC',
            estadio: 'Anfield',
            apodo: 'Anfield Road',
            ciudadPais: 'Liverpool, Inglaterra',
            capacidadTexto: '61.276 esp.',
            escudoFile: 'liverpool.webp',
            borderColor: '#c8102e',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Anfield_ Liverpool FC.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (1/8) 🇪🇺
¡Llegó la competencia de los colosos europeos! 16 estadios legendarios compiten por el trono y VOS definís quién avanza.

⚔️ CRUCE 1:
1️⃣ SANTIAGO BERNABÉU (Real Madrid · España)
2️⃣ ANFIELD (Liverpool FC · Inglaterra)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de San Siro vs Signal Iduna Park.

📲 Poné a prueba tus conocimientos de estadios en el link del perfil: estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #RealMadrid #Liverpool #Bernabeu #Anfield #ChampionsLeague #Estadios #EstadiosVirtuales`
    },
    'octavos-2': {
        slug: '02-SANSIRO-VS-DORTMUND',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 2 / 8',
        cruceSiguiente: 'Santiago Bernabéu vs. Anfield',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 2/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'San Siro vs. Signal Iduna Park',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_02_SanSiro_vs_Dortmund.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_02_SanSiro_Dortmund.jpg',
        team1: {
            numero: '1',
            nombre: 'AC MILAN / INTER',
            estadio: 'Giuseppe Meazza',
            apodo: 'San Siro',
            ciudadPais: 'Milán, Italia',
            capacidadTexto: '75.817 esp.',
            escudoFile: 'milan.webp',
            borderColor: '#fb090b',
            videoPath: "E:\\Google earth studio\\Italia\\Subidos\\San Siro 2.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'BORUSSIA DORTMUND',
            estadio: 'Signal Iduna Park',
            apodo: 'El Muro Amarillo',
            ciudadPais: 'Dortmund, Alemania',
            capacidadTexto: '81.365 esp.',
            escudoFile: 'borussiadortmund.webp',
            borderColor: '#fde100',
            videoPath: "E:\\Google earth studio\\Bundesliga\\Subidos\\Borussia.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (2/8) 🇪🇺
¡Duelo de calderas y mística en Europa!

⚔️ CRUCE 2:
1️⃣ SAN SIRO (Milan / Inter · Italia)
2️⃣ SIGNAL IDUNA PARK (Borussia Dortmund · Alemania)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de Real Madrid (Bernabéu) vs Liverpool (Anfield).

📲 Jugá a la trivia de estadios en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #SanSiro #BorussiaDortmund #Milan #Inter #SignalIdunaPark #Estadios #EstadiosVirtuales`
    },
    'octavos-3': {
        slug: '03-SANMAMES-VS-OLDTRAFFORD',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 3 / 8',
        cruceSiguiente: 'Allianz Arena vs. Emirates Stadium',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 3/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'San Mamés vs. Old Trafford',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_03_SanMames_vs_OldTrafford.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_03_SanMames_OldTrafford.jpg',
        team1: {
            numero: '1',
            nombre: 'ATHLETIC CLUB',
            estadio: 'San Mamés',
            apodo: 'La Catedral',
            ciudadPais: 'Bilbao, España',
            capacidadTexto: '53.331 esp.',
            escudoFile: 'AtlClub.webp',
            borderColor: '#ee2524',
            videoPath: "E:\\Google earth studio\\España\\San Mamés Athletic Club.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'MANCHESTER UNITED',
            estadio: 'Old Trafford',
            apodo: 'El Teatro de los Sueños',
            ciudadPais: 'Manchester, Inglaterra',
            capacidadTexto: '74.310 esp.',
            escudoFile: 'manchesterunited.webp',
            borderColor: '#da291c',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Old Trafford_ Manchester United.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (3/8) 🇪🇺
¡La Catedral de Bilbao contra el Teatro de los Sueños de Manchester!

⚔️ CRUCE 3:
1️⃣ SAN MAMÉS (Athletic Club · España)
2️⃣ OLD TRAFFORD (Manchester United · Inglaterra)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de Bayern Múnich vs Arsenal.

📲 Jugá a adivinar estadios en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #SanMames #AthleticClub #OldTrafford #ManchesterUnited #Estadios #EstadiosVirtuales`
    },
    'octavos-4': {
        slug: '04-ALLIANZ-VS-EMIRATES',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 4 / 8',
        cruceSiguiente: 'San Mamés vs. Old Trafford',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 4/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Allianz Arena vs. Emirates Stadium',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_04_Allianz_vs_Emirates.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_04_Allianz_Emirates.jpg',
        team1: {
            numero: '1',
            nombre: 'BAYERN MÚNICH',
            estadio: 'Allianz Arena',
            apodo: 'Allianz Arena',
            ciudadPais: 'Múnich, Alemania',
            capacidadTexto: '75.024 esp.',
            escudoFile: 'bayernmunchen.webp',
            borderColor: '#dc052d',
            videoPath: "E:\\Google earth studio\\Bundesliga\\Subidos\\Allianz Arena.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'ARSENAL FC',
            estadio: 'Emirates Stadium',
            apodo: 'Emirates Stadium',
            ciudadPais: 'Londres, Inglaterra',
            capacidadTexto: '60.704 esp.',
            escudoFile: 'arsenal.webp',
            borderColor: '#ef0107',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Emirates Stadium_ Arsenal.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (4/8) 🇪🇺
¡Duelo de vanguardia y arquitectura de élite!

⚔️ CRUCE 4:
1️⃣ ALLIANZ ARENA (Bayern Múnich · Alemania)
2️⃣ EMIRATES STADIUM (Arsenal · Inglaterra)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de San Mamés vs Old Trafford.

📲 Descubrí estadios del mundo en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #AllianzArena #BayernMunchen #EmiratesStadium #Arsenal #Estadios #EstadiosVirtuales`
    },
    'octavos-5': {
        slug: '05-WEMBLEY-VS-METROPOLITANO',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 5 / 8',
        cruceSiguiente: 'Parque de los Príncipes vs. Johan Cruyff Arena',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 5/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Wembley Stadium vs. Metropolitano',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_05_Wembley_vs_Metropolitano.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_05_Wembley_Metropolitano.jpg',
        team1: {
            numero: '1',
            nombre: 'INGLATERRA',
            estadio: 'Wembley Stadium',
            apodo: 'La Catedral del Fútbol',
            ciudadPais: 'Londres, Inglaterra',
            capacidadTexto: '90.000 esp.',
            escudoFile: 'england.webp',
            borderColor: '#00205b',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Wembley Stadium_ Inglaterra.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'ATLÉTICO DE MADRID',
            estadio: 'Riyadh Air Metropolitano',
            apodo: 'El Metropolitano',
            ciudadPais: 'Madrid, España',
            capacidadTexto: '70.460 esp.',
            escudoFile: 'AMadrid.webp',
            borderColor: '#cb3524',
            videoPath: "E:\\Google earth studio\\España\\Riyadh Air Metropolitano Club Atlético de Madrid.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (5/8) 🇪🇺
¡El coloso histórico de Londres contra la fortaleza moderna de Madrid!

⚔️ CRUCE 5:
1️⃣ WEMBLEY STADIUM (Selección Inglaterra)
2️⃣ RIYADH AIR METROPOLITANO (Atlético de Madrid · España)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de PSG vs Ajax.

📲 Jugá gratis en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #Wembley #Atleti #Metropolitano #England #Estadios #EstadiosVirtuales`
    },
    'octavos-6': {
        slug: '06-PSG-VS-AJAX',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 6 / 8',
        cruceSiguiente: 'Wembley vs. Metropolitano',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 6/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Parque de los Príncipes vs. Johan Cruyff Arena',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_06_PSG_vs_Ajax.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_06_PSG_Ajax.jpg',
        team1: {
            numero: '1',
            nombre: 'PARIS SAINT-GERMAIN',
            estadio: 'Parque de los Príncipes',
            apodo: 'Parc des Princes',
            ciudadPais: 'París, Francia',
            capacidadTexto: '48.583 esp.',
            escudoFile: 'psg.webp',
            borderColor: '#004170',
            videoPath: "E:\\Google earth studio\\Francia\\Subidos\\PSG.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'AJAX AMSTERDAM',
            estadio: 'Johan Cruyff Arena',
            apodo: 'Johan Cruyff Arena',
            ciudadPais: 'Ámsterdam, Países Bajos',
            capacidadTexto: '55.865 esp.',
            escudoFile: 'ajax.webp',
            borderColor: '#d2122e',
            videoPath: "E:\\Google earth studio\\Holanda\\Johan Cruyff Arena Ajax Amsterdam.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (6/8) 🇪🇺
¡París contra Ámsterdam en un cruce histórico!

⚔️ CRUCE 6:
1️⃣ PARQUE DE LOS PRÍNCIPES (PSG · Francia)
2️⃣ JOHAN CRUYFF ARENA (Ajax · Países Bajos)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de Wembley vs Metropolitano.

📲 Adiviná estadios del mundo en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #PSG #Ajax #ParcdesPrinces #JohanCruyffArena #Estadios #EstadiosVirtuales`
    },
    'octavos-7': {
        slug: '07-MARADONA-VS-MARSELLA',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 7 / 8',
        cruceSiguiente: 'Estádio da Luz vs. Stadio Olimpico',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 7/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Stadio Maradona vs. Orange Vélodrome',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_07_Maradona_vs_Marsella.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_07_Maradona_Marsella.jpg',
        team1: {
            numero: '1',
            nombre: 'SSC NAPOLI',
            estadio: 'Diego Armando Maradona',
            apodo: 'Stadio San Paolo',
            ciudadPais: 'Nápoles, Italia',
            capacidadTexto: '54.726 esp.',
            escudoFile: 'napoli.webp',
            borderColor: '#0080ff',
            videoPath: "E:\\Google earth studio\\Italia\\Subidos\\Diego Armando Maradona_Napoli.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'OLYMPIQUE DE MARSELLA',
            estadio: 'Orange Vélodrome',
            apodo: 'El Vélodrome',
            ciudadPais: 'Marsella, Francia',
            capacidadTexto: '67.394 esp.',
            escudoFile: 'olimpiquemarsella.webp',
            borderColor: '#2faee0',
            videoPath: "E:\\Google earth studio\\Francia\\Subidos\\Marsella Rulli.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (7/8) 🇪🇺
¡Duelo de calderas mediterráneas y pasión ardiente!

⚔️ CRUCE 7:
1️⃣ ESTADIO MARADONA (Napoli · Italia)
2️⃣ ORANGE VÉLODROME (Olympique de Marsella · Francia)

👉 COMENTÁ "1" O "2" para clasificar a tu favorito a Cuartos de Final. ¡El estadio más votado avanza de fase! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de Benfica vs Roma.

📲 Poné a prueba tu conocimiento futbolero en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #Napoli #Marsella #StadioMaradona #OrangeVelodrome #Estadios #EstadiosVirtuales`
    },
    'octavos-8': {
        slug: '08-BENFICA-VS-ROMA',
        fase: 'OCTAVOS DE FINAL',
        llaveNumero: 'LLAVE 8 / 8',
        cruceSiguiente: 'Stadio Maradona vs. Orange Vélodrome',
        tituloBadge: '🏆 EUROCOPA DE ESTADIOS · OCTAVOS 8/8',
        pregunta: '¿QUIÉN AVANZA A CUARTOS?',
        subtitulo: 'Estádio da Luz vs. Stadio Olimpico',
        subtituloVotacion: 'VOTÁ EN COMENTARIOS: ¿1 Ó 2? 🗳️',
        videoFileName: 'Eurocopa_Octavos_08_Benfica_vs_Roma.mp4',
        portadaFileName: 'Portada_Eurocopa_Octavos_08_Benfica_Roma.jpg',
        team1: {
            numero: '1',
            nombre: 'SL BENFICA',
            estadio: 'Estádio da Luz',
            apodo: 'A Catedral',
            ciudadPais: 'Lisboa, Portugal',
            capacidadTexto: '64.642 esp.',
            escudoFile: 'benfica.webp',
            borderColor: '#e11922',
            videoPath: "E:\\Google earth studio\\Primeira Liga\\Estadio da luz portugal.mp4"
        },
        team2: {
            numero: '2',
            nombre: 'AS ROMA / LAZIO',
            estadio: 'Stadio Olimpico',
            apodo: 'El Olímpico',
            ciudadPais: 'Roma, Italia',
            capacidadTexto: '70.634 esp.',
            escudoFile: 'roma.webp',
            borderColor: '#8e1f2f',
            videoPath: "E:\\Google earth studio\\Italia\\Subidos\\Stadio Olimpico.mp4"
        },
        copy: `🏆 EUROCOPA DE ESTADIOS | OCTAVOS DE FINAL (8/8) 🇪🇺
¡Último boleto a Cuartos de Final! El templo de Lisboa contra el coliseo de Roma.

⚔️ CRUCE 8:
1️⃣ ESTÁDIO DA LUZ (Benfica · Portugal)
2️⃣ STADIO OLIMPICO (AS Roma / Lazio · Italia)

👉 COMENTÁ "1" O "2" para clasificar al último pasajero a Cuartos. ¡Votás vos en los comentarios! 🗳️
🔜 El ganador se medirá en Cuartos contra el vencedor de Napoli vs Marsella.

📲 Demostrá cuánto sabés de estadios en estadiosvirtuales.com

#EurocopaDeEstadios #Eurocopa #Benfica #ASRoma #EstadioDaLuz #StadioOlimpico #Estadios #EstadiosVirtuales`
    }
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL (20.0s)
// Strict Zero Whoosh Rule
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

    function addHarmonicChord(startSec, durSec, rootFreq, volume = 0.4) {
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

    // 0.8s: Campana de inicio
    addBellChime(0.8, 523.25, 0.45); // C5
    addHarmonicChord(1.0, 3.5, 261.63, 0.35); // C4

    // 11s a 15s: Tensión de cuenta regresiva
    [11.0, 12.0, 13.0, 14.0].forEach((t, idx) => {
        const freq = 440 + idx * 80;
        addTone(t, 0.25, freq, 0.45, 6);
        addTone(t, 0.25, freq * 1.5, 0.25, 8);
    });

    // 15.0s: Campana triunfal y acorde de cierre
    addBellChime(15.0, 1046.50, 0.55); // C6
    addHarmonicChord(15.2, 4.5, 523.25, 0.50);

    // Fade out suave
    const fadeOutStart = Math.floor(18.5 * sampleRate);
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
async function generarOverlaysEurocopaMatch(matchConfig, assetsDir) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');
    const escudo1 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', matchConfig.team1.escudoFile)).toString('base64');
    const escudo2 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', matchConfig.team2.escudoFile)).toString('base64');

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
                    z-index: 20;
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
                    font-size: 18px;
                    font-weight: 800;
                    margin-top: 4px;
                }

                /* TARJETAS FLOTANTES DE ESTADIO */
                .stadium-card {
                    position: absolute;
                    width: 980px;
                    left: 50px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                    border-radius: 24px;
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.9);
                    z-index: 10;
                }
                .stadium-card.top {
                    top: 220px;
                    border: 2px solid ${matchConfig.team1.borderColor};
                    border-left: 8px solid ${matchConfig.team1.borderColor};
                }
                .stadium-card.bottom {
                    top: 1040px;
                    border: 2px solid ${matchConfig.team2.borderColor};
                    border-left: 8px solid ${matchConfig.team2.borderColor};
                }
                .card-left {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }
                .card-num {
                    font-size: 36px;
                    font-weight: 900;
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.1);
                    width: 54px;
                    height: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    border: 1.5px solid rgba(255, 255, 255, 0.2);
                }
                .card-escudo {
                    width: 58px;
                    height: 58px;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
                }
                .card-names {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }
                .card-stadium-name {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 900;
                    line-height: 1.1;
                    letter-spacing: -0.5px;
                }
                .card-club-name {
                    color: #ffd700;
                    font-size: 18px;
                    font-weight: 800;
                    margin-top: 3px;
                }
                .card-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 4px;
                }
                .card-city {
                    color: #94a3b8;
                    font-size: 16px;
                    font-weight: 700;
                }
                .card-capacity-pill {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1.5px solid rgba(255, 255, 255, 0.18);
                    color: #e2e8f0;
                    font-size: 15px;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 12px;
                }

                /* NÚMEROS GIGANTES TRANSPARENTES */
                .giant-num {
                    position: absolute;
                    font-size: 140px;
                    font-weight: 900;
                    color: rgba(255, 255, 255, 0.88);
                    text-shadow: 0 8px 30px rgba(0, 0, 0, 0.95);
                    z-index: 5;
                    line-height: 1;
                }
                .giant-num.top {
                    top: 520px;
                    right: 70px;
                }
                .giant-num.bottom {
                    top: 1340px;
                    right: 70px;
                }

                /* FOOTER COMUNIDAD */
                #footer-cta {
                    position: absolute;
                    bottom: 160px;
                    left: 50px;
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                    border: 2px solid #00b0ff;
                    border-radius: 24px;
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 176, 255, 0.35);
                    z-index: 20;
                }
                .footer-text {
                    color: #ffffff;
                    font-size: 23px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .footer-badge-vote {
                    background: linear-gradient(135deg, #00b0ff 0%, #00e5ff 100%);
                    color: #06111f;
                    font-size: 20px;
                    font-weight: 900;
                    padding: 6px 16px;
                    border-radius: 14px;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
        `;
    }

    // OVERLAY FASE 1: APERTURA Y VOTACIÓN ACTIVA (0s a 15s)
    const htmlFase1 = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">${matchConfig.tituloBadge}</div>
            <div class="header-title">${matchConfig.pregunta}</div>
            <div class="header-sub">${matchConfig.subtituloVotacion}</div>
        </div>

        <!-- Tarjeta Estadio 1 (Top) -->
        <div class="stadium-card top">
            <div class="card-left">
                <div class="card-num" style="background:${matchConfig.team1.borderColor};">1</div>
                <img src="${escudo1}" class="card-escudo">
                <div class="card-names">
                    <span class="card-stadium-name">${matchConfig.team1.estadio}</span>
                    <span class="card-club-name">${matchConfig.team1.nombre}</span>
                </div>
            </div>
            <div class="card-right">
                <span class="card-city">📍 ${matchConfig.team1.ciudadPais}</span>
                <span class="card-capacity-pill">👥 ${matchConfig.team1.capacidadTexto}</span>
            </div>
        </div>

        <div class="giant-num top">1</div>

        <!-- Tarjeta Estadio 2 (Bottom) -->
        <div class="stadium-card bottom">
            <div class="card-left">
                <div class="card-num" style="background:${matchConfig.team2.borderColor};">2</div>
                <img src="${escudo2}" class="card-escudo">
                <div class="card-names">
                    <span class="card-stadium-name">${matchConfig.team2.estadio}</span>
                    <span class="card-club-name">${matchConfig.team2.nombre}</span>
                </div>
            </div>
            <div class="card-right">
                <span class="card-city">📍 ${matchConfig.team2.ciudadPais}</span>
                <span class="card-capacity-pill">👥 ${matchConfig.team2.capacidadTexto}</span>
            </div>
        </div>

        <div class="giant-num bottom">2</div>

        <!-- Footer Votación -->
        <div id="footer-cta">
            <span class="footer-badge-vote">🗳️ VOTÁ YA</span>
            <span class="footer-text">Comentá "1" o "2" para clasificarlo a Cuartos</span>
        </div>
    `);
    await page.setContent(htmlFase1, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_fase1.png'), omitBackground: true });

    // OVERLAY FASE 2: REVELACIÓN PRÓXIMO CRUCE (15s a 20s)
    const htmlFase2 = getBaseHTML(`
        <div id="header-box">
            <div class="header-badge">${matchConfig.tituloBadge}</div>
            <div class="header-title">${matchConfig.pregunta}</div>
            <div class="header-sub">¡VOTÁ AHORA EN LOS COMENTARIOS! 🗳️</div>
        </div>

        <!-- Tarjeta Estadio 1 (Top) -->
        <div class="stadium-card top">
            <div class="card-left">
                <div class="card-num" style="background:${matchConfig.team1.borderColor};">1</div>
                <img src="${escudo1}" class="card-escudo">
                <div class="card-names">
                    <span class="card-stadium-name">${matchConfig.team1.estadio}</span>
                    <span class="card-club-name">${matchConfig.team1.nombre}</span>
                </div>
            </div>
            <div class="card-right">
                <span class="card-city">📍 ${matchConfig.team1.ciudadPais}</span>
                <span class="card-capacity-pill">👥 ${matchConfig.team1.capacidadTexto}</span>
            </div>
        </div>

        <!-- Tarjeta Estadio 2 (Bottom) -->
        <div class="stadium-card bottom">
            <div class="card-left">
                <div class="card-num" style="background:${matchConfig.team2.borderColor};">2</div>
                <img src="${escudo2}" class="card-escudo">
                <div class="card-names">
                    <span class="card-stadium-name">${matchConfig.team2.estadio}</span>
                    <span class="card-club-name">${matchConfig.team2.nombre}</span>
                </div>
            </div>
            <div class="card-right">
                <span class="card-city">📍 ${matchConfig.team2.ciudadPais}</span>
                <span class="card-capacity-pill">👥 ${matchConfig.team2.capacidadTexto}</span>
            </div>
        </div>

        <!-- Banner Central Próximo Cruce -->
        <div style="position:absolute; top:870px; left:50px; width:980px; background:linear-gradient(135deg, rgba(14, 26, 42, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%); border:2px solid #ffd700; border-radius:24px; padding:18px 24px; text-align:center; box-shadow:0 14px 40px rgba(0,0,0,0.95); z-index:25;">
            <div style="color:#00e5ff; font-size:14px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase;">PRÓXIMO CRUCE EN CUARTOS</div>
            <div style="color:#ffffff; font-size:24px; font-weight:900; margin-top:4px;">El ganador se mide contra: <span style="color:#ffd700;">${matchConfig.cruceSiguiente}</span></div>
        </div>

        <!-- Footer Votación y CTA -->
        <div id="footer-cta">
            <span class="footer-badge-vote">⚡ ÚLTIMOS SEGUNDOS</span>
            <span class="footer-text">Dejá tu voto antes de que cierre la votación 👇</span>
        </div>
    `);
    await page.setContent(htmlFase2, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_fase2.png'), omitBackground: true });

    await browser.close();
    console.log(`✅ Overlays generados exitosamente.`);
}

// ==========================================
// 3. GENERADOR DE PORTADA (SAFE ZONE 3:4)
// ==========================================
async function generarPortadaEurocopaMatch(matchConfig, outFolder, bgFramePath) {
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
    const escudo1 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', matchConfig.team1.escudoFile)).toString('base64');
    const escudo2 = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', matchConfig.team2.escudoFile)).toString('base64');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; overflow: hidden; position: relative; background: #090e17; }
            .bg-drone { position: absolute; inset: 0; background-image: url('${bgBase64}'); background-size: cover; background-position: center; filter: brightness(0.6) contrast(1.15); }
            .vignette { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(9, 14, 23, 0.3) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%), linear-gradient(180deg, rgba(9, 14, 23, 0.92) 0%, transparent 25%, transparent 75%, rgba(9, 14, 23, 0.95) 100%); }
            
            /* ZONA SEGURA 3:4 (y=260 a y=1660) */
            .safe-zone { position: absolute; top: 260px; left: 50px; right: 50px; bottom: 260px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; z-index: 10; }
            
            .brand-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(0, 176, 255, 0.6); border-top: 2.5px solid rgba(130, 220, 255, 0.95); border-radius: 35px; color: #00e5ff; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 10px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(0, 176, 255, 0.35); }
            
            .main-box { display: flex; flex-direction: column; align-items: center; gap: 18px; width: 100%; }
            .hook-pill { background: rgba(0, 176, 255, 0.15); border: 2px solid #00b0ff; color: #00e5ff; font-size: 24px; font-weight: 900; letter-spacing: 1.5px; padding: 10px 28px; border-radius: 20px; box-shadow: 0 0 20px rgba(0, 176, 255, 0.3); text-transform: uppercase; }
            .main-title { color: #ffffff; font-size: 72px; font-weight: 900; line-height: 1.05; letter-spacing: -1px; text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(0, 176, 255, 0.4); text-transform: uppercase; }
            
            .versus-box { display: flex; align-items: center; justify-content: center; gap: 24px; width: 100%; margin: 15px 0; }
            .team-badge { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 16px 24px; box-shadow: 0 12px 30px rgba(0,0,0,0.8); }
            .team-img { width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6)); }
            .team-name { color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; }
            .vs-sign { color: #ffd700; font-size: 32px; font-weight: 900; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }

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
                <span>${matchConfig.tituloBadge}</span>
            </div>

            <div class="main-box">
                <div class="hook-pill">🏆 DUELO DE COLOSOS EUROPEOS</div>
                <div class="main-title">¿CUÁL TIENE<br>MEJOR CANCHA?</div>
                
                <div class="versus-box">
                    <div class="team-badge" style="border-left: 6px solid ${matchConfig.team1.borderColor};">
                        <img src="${escudo1}" class="team-img">
                        <span class="team-name">${matchConfig.team1.nombre}</span>
                    </div>
                    <span class="vs-sign">VS</span>
                    <div class="team-badge" style="border-left: 6px solid ${matchConfig.team2.borderColor};">
                        <img src="${escudo2}" class="team-img">
                        <span class="team-name">${matchConfig.team2.nombre}</span>
                    </div>
                </div>
            </div>

            <div class="cta-card">
                <span class="cta-text">🗳️ ¡Votá en comentarios quién avanza! ⚽</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 5000 });
    const portadaPath = path.join(outFolder, matchConfig.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// ==========================================
// 4. MOTOR DE RENDERIZADO DEL CRUCE (20s)
// Split-Screen 50/50 vertical con zoom out controlado
// ==========================================
async function renderizarMatchEurocopa(matchKey) {
    const matchConfig = CONFIG_EUROCOPA[matchKey];
    if (!matchConfig) {
        throw new Error(`Configuración no encontrada para la clave: ${matchKey}`);
    }

    const outFolder = path.join(BASE_OUTPUT_DIR, 'OCTAVOS DE FINAL', matchConfig.slug);
    const videoOutPath = path.join(outFolder, matchConfig.videoFileName);
    const portadaPath = path.join(outFolder, matchConfig.portadaFileName);
    const textosPath = path.join(outFolder, 'TEXTOS_PUBLICACION.txt');

    if (fs.existsSync(videoOutPath) && fs.statSync(videoOutPath).size > 1000000 &&
        fs.existsSync(portadaPath) && fs.statSync(portadaPath).size > 10000 &&
        fs.existsSync(textosPath)) {
        console.log(`⏩ Cruce ya completado anteriormente (${matchConfig.slug}). Omitiendo renderizado.`);
        return;
    }

    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    const assetsDir = path.join(outFolder, 'assets_temp');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    console.log(`\n🏆 ========================================================`);
    console.log(`🏆 PRODUCCIÓN EUROCOPA DE ESTADIOS: ${matchConfig.slug}`);
    console.log(`🏆 ========================================================\n`);

    // 1. Guardar copy de publicación
    fs.writeFileSync(path.join(outFolder, 'TEXTOS_PUBLICACION.txt'), matchConfig.copy, 'utf8');
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt guardado.');

    // 2. Extraer frame para portada (del video del equipo 1)
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    console.log(`🎨 Generando portada para ${matchConfig.slug}...`);
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:04',
            '-i', matchConfig.team1.videoPath,
            '-vframes', '1',
            '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    await generarPortadaEurocopaMatch(matchConfig, outFolder, bgFramePath);

    // 3. Generar Overlays transparentes
    console.log(`🎨 Generando overlays para torneo: ${matchConfig.slug}...`);
    await generarOverlaysEurocopaMatch(matchConfig, assetsDir);

    // 4. Generar Audio procedural
    const audioPath = path.join(assetsDir, 'audio_torneo.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(20.0));

    // 5. Composición de Video 1080x1920 Split-Screen 50/50 vertical
    const ovFase1 = path.join(assetsDir, 'overlay_fase1.png');
    const ovFase2 = path.join(assetsDir, 'overlay_fase2.png');

    console.log(`🎬 Renderizando video 1080x1920 con FFmpeg: ${videoOutPath}...`);

    const filterComplex = [
        // Video Top (team 1): 1080x960
        `[0:v]fps=30,trim=0:20,setpts=PTS-STARTPTS,scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[v_top]`,
        // Video Bottom (team 2): 1080x960
        `[1:v]fps=30,trim=0:20,setpts=PTS-STARTPTS,scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[v_bot]`,
        // Stack vertical 50/50 -> 1080x1920
        `[v_top][v_bot]vstack=inputs=2[base_stack]`,
        // Overlays
        `[2:v]format=rgba[ov1]`,
        `[3:v]format=rgba[ov2]`,
        `[base_stack][ov1]overlay=0:0:enable='between(t,0,15.0)'[tmp1]`,
        `[tmp1][ov2]overlay=0:0:enable='between(t,15.0,20.0)'[final_v]`
    ];

    const ffmpegArgs = [
        '-y',
        '-i', matchConfig.team1.videoPath,
        '-i', matchConfig.team2.videoPath,
        '-i', ovFase1,
        '-i', ovFase2,
        '-i', audioPath,
        '-filter_complex', filterComplex.join(';'),
        '-map', '[final_v]',
        '-map', '4:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '19',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', '20.0',
        videoOutPath
    ];

    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);

        ff.stderr.on('data', (d) => {
            const line = d.toString();
            const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:20.00`);
            }
        });

        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
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

// Batch render de los 8 cruces
async function renderizarTodosOctavosEurocopa() {
    console.log(`🚀 Iniciando renderizado en ráfaga de los 8 cruces de Octavos de Final de la Eurocopa...\n`);
    for (let i = 1; i <= 8; i++) {
        await renderizarMatchEurocopa(`octavos-${i}`);
    }
    console.log(`\n🏆🏆 ¡LOS 8 VIDEOS DE LA EUROCOPA DE ESTADIOS HAN SIDO COMPLETADOS CON ÉXITO! 🏆🏆\n`);
}

// Ejecución por CLI
if (require.main === module) {
    const arg = process.argv[2] || 'octavos-1';
    if (arg === 'octavos-all') {
        renderizarTodosOctavosEurocopa().catch(console.error);
    } else {
        renderizarMatchEurocopa(arg).catch(console.error);
    }
}

module.exports = { renderizarMatchEurocopa, renderizarTodosOctavosEurocopa, CONFIG_EUROCOPA };
