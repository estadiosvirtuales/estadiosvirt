const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

console.log('🚀 ========================================================');
console.log('🚀 MOTOR OFICIAL: RETO DIARIO REAL (5 RONDAS / 35s)');
console.log('🚀 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🚀 ========================================================\n');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\RETO DIARIO";

function getBase64Image(filePath) {
    if (!fs.existsSync(filePath)) return '';
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : 'image/webp';
    return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

// ==========================================
// BASE DE DATOS OFICIAL DE RETOS DIARIOS
// ==========================================
const RETOS_DATABASE = {
    '1': {
        id: 'RETO-DIARIO-01-ARGENTINA',
        numeroReto: 1,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_01_Argentina.mp4',
        portadaFileName: 'Portada_Reto_Diario_01.jpg',
        puntuacionTotal: 24510,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'EL PALACIO DUCÓ',
                clubNombre: 'HURACÁN',
                ciudad: 'Parque Patricios, CABA',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\huracan.mp4",
                clipStart: 3.0,
                pista: 'Capacidad para 48.314 hinchas con su torre Art Déco',
                targetLat: -34.6433,
                targetLng: -58.3965,
                userLat: -34.6415,
                userLng: -58.3945,
                distanciaTexto: '260 METROS',
                puntosTexto: '+4.920 PTS 🔥',
                puntos: 4920,
                puntosAcumulados: 4920,
                ubicacionBadge: '📍 Parque Patricios, CABA · EL PALACIO DUCÓ'
            },
            {
                num: 2,
                estadioNombre: 'COLOSO MARCELO BIELSA',
                clubNombre: 'NEWELL\'S OLD BOYS',
                ciudad: 'Rosario, Santa Fe',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\newells.mp4",
                clipStart: 3.0,
                pista: '42.000 hinchas en el Parque de la Independencia',
                targetLat: -32.9561,
                targetLng: -60.6615,
                userLat: -32.9545,
                userLng: -60.6598,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 9860,
                ubicacionBadge: '📍 Rosario, Santa Fe · COLOSO MARCELO BIELSA'
            },
            {
                num: 3,
                estadioNombre: 'LA FORTALEZA',
                clubNombre: 'CLUB ATLÉTICO LANÚS',
                ciudad: 'Lanús, Buenos Aires',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\lanus.mp4",
                clipStart: 3.0,
                pista: '47.020 hinchas en el sur del Gran Buenos Aires',
                targetLat: -34.7176,
                targetLng: -58.3842,
                userLat: -34.7150,
                userLng: -58.3820,
                distanciaTexto: '320 METROS',
                puntosTexto: '+4.810 PTS 🔥',
                puntos: 4810,
                puntosAcumulados: 14670,
                ubicacionBadge: '📍 Lanús, Buenos Aires · LA FORTALEZA'
            },
            {
                num: 4,
                estadioNombre: 'MONUMENTAL JOSÉ FIERRO',
                clubNombre: 'ATLÉTICO TUCUMÁN',
                ciudad: 'San Miguel de Tucumán',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\atucuman.mp4",
                clipStart: 3.0,
                pista: '35.200 hinchas en 25 de Mayo y Chile, norte argentino',
                targetLat: -26.8126,
                targetLng: -65.1997,
                userLat: -26.8110,
                userLng: -65.1980,
                distanciaTexto: '280 METROS',
                puntosTexto: '+4.880 PTS 🔥',
                puntos: 4880,
                puntosAcumulados: 19550,
                ubicacionBadge: '📍 San Miguel de Tucumán · MONUMENTAL JOSÉ FIERRO'
            },
            {
                num: 5,
                estadioNombre: 'GIGANTE DE ARROYITO',
                clubNombre: 'ROSARIO CENTRAL',
                ciudad: 'Rosario, Santa Fe',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\central.mp4",
                clipStart: 3.0,
                pista: '46.955 hinchas a orillas del Río Paraná',
                targetLat: -32.9139,
                targetLng: -60.6745,
                userLat: -32.9123,
                userLng: -60.6728,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 24510,
                ubicacionBadge: '📍 Rosario, Santa Fe · GIGANTE DE ARROYITO'
            }
        ]
    },
    '2': {
        id: 'RETO-DIARIO-02-ASCENSO',
        numeroReto: 2,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_02_Ascenso.mp4',
        portadaFileName: 'Portada_Reto_Diario_02.jpg',
        puntuacionTotal: 24600,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'DON LEÓN KOLBOWSKI',
                clubNombre: 'ATLANTA',
                ciudad: 'Villa Crespo, CABA',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque A\\Atlanta.mp4",
                clipStart: 3.0,
                pista: '14.000 hinchas en Humboldt 374, Villa Crespo',
                targetLat: -34.5949,
                targetLng: -58.4490,
                userLat: -34.5932,
                userLng: -58.4472,
                distanciaTexto: '260 METROS',
                puntosTexto: '+4.920 PTS 🔥',
                puntos: 4920,
                puntosAcumulados: 4920,
                ubicacionBadge: '📍 Villa Crespo, CABA · DON LEÓN KOLBOWSKI'
            },
            {
                num: 2,
                estadioNombre: 'ISLAS MALVINAS',
                clubNombre: 'ALL BOYS',
                ciudad: 'Floresta, CABA',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\All Boys(listo)x2\\All Boys.mp4",
                clipStart: 3.0,
                pista: '21.500 hinchas en Jonte y Mercedes, Floresta',
                targetLat: -34.6168,
                targetLng: -58.4980,
                userLat: -34.6152,
                userLng: -58.4962,
                distanciaTexto: '285 METROS',
                puntosTexto: '+4.890 PTS 🔥',
                puntos: 4890,
                puntosAcumulados: 9810,
                ubicacionBadge: '📍 Floresta, CABA · ISLAS MALVINAS'
            },
            {
                num: 3,
                estadioNombre: 'REPÚBLICA DE MATADEROS',
                clubNombre: 'NUEVA CHICAGO',
                ciudad: 'Mataderos, CABA',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque A\\Nueva Chicago.mp4",
                clipStart: 3.0,
                pista: '25.000 hinchas en Justo Suárez, Mataderos',
                targetLat: -34.6679,
                targetLng: -58.4999,
                userLat: -34.6661,
                userLng: -58.4980,
                distanciaTexto: '270 METROS',
                puntosTexto: '+4.910 PTS 🔥',
                puntos: 4910,
                puntosAcumulados: 14720,
                ubicacionBadge: '📍 Mataderos, CABA · REPÚBLICA DE MATADEROS'
            },
            {
                num: 4,
                estadioNombre: 'ESTADIO DE CHACARITA',
                clubNombre: 'CHACARITA JUNIORS',
                ciudad: 'Villa Maipú, San Martín',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque A\\chaca.mp4",
                clipStart: 3.0,
                pista: 'El Templo Funebrero en Villa Maipú, San Martín',
                targetLat: -34.5673,
                targetLng: -58.5277,
                userLat: -34.5655,
                userLng: -58.5258,
                distanciaTexto: '250 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 19650,
                ubicacionBadge: '📍 Villa Maipú, San Martín · CHACARITA JUNIORS'
            },
            {
                num: 5,
                estadioNombre: 'EDUARDO GALLARDÓN',
                clubNombre: 'LOS ANDES',
                ciudad: 'Lomas de Zamora, Buenos Aires',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque B\\Los andes.mp4",
                clipStart: 3.0,
                pista: '36.900 hinchas en Santa Fe 159, Lomas de Zamora',
                targetLat: -34.7552,
                targetLng: -58.4197,
                userLat: -34.7535,
                userLng: -58.4175,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 24600,
                ubicacionBadge: '📍 Lomas de Zamora · EDUARDO GALLARDÓN'
            }
        ]
    },
    '3': {
        id: 'RETO-DIARIO-03-PREMIER-LEAGUE',
        numeroReto: 3,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_03_Premier_League.mp4',
        portadaFileName: 'Portada_Reto_Diario_03.jpg',
        puntuacionTotal: 24740,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'ANFIELD',
                clubNombre: 'LIVERPOOL FC',
                ciudad: 'Liverpool, Inglaterra',
                videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Anfield_ Liverpool FC.mp4",
                clipStart: 3.0,
                pista: '61.276 hinchas en el mítico templo de The Kop',
                targetLat: 53.4308,
                targetLng: -2.9608,
                userLat: 53.4290,
                userLng: -2.9590,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 4940,
                ubicacionBadge: '📍 Liverpool, Inglaterra · ANFIELD'
            },
            {
                num: 2,
                estadioNombre: 'OLD TRAFFORD',
                clubNombre: 'MANCHESTER UNITED',
                ciudad: 'Manchester, Inglaterra',
                videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Old Trafford_ Manchester United.mp4",
                clipStart: 3.0,
                pista: '74.310 hinchas en el Teatro de los Sueños',
                targetLat: 53.4631,
                targetLng: -2.2913,
                userLat: 53.4612,
                userLng: -2.2895,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 9870,
                ubicacionBadge: '📍 Manchester, Inglaterra · OLD TRAFFORD'
            },
            {
                num: 3,
                estadioNombre: 'TOTTENHAM HOTSPUR STADIUM',
                clubNombre: 'TOTTENHAM HOTSPUR',
                ciudad: 'Londres, Inglaterra',
                videoPath: "E:\\Google earth studio\\Inglaterra\\Tottenham Hotspur Stadium.mp4",
                clipStart: 3.0,
                pista: '62.850 hinchas en la joya del norte de Londres',
                targetLat: 51.6042,
                targetLng: -0.0664,
                userLat: 51.6025,
                userLng: -0.0645,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 14820,
                ubicacionBadge: '📍 Londres, Inglaterra · TOTTENHAM STADIUM'
            },
            {
                num: 4,
                estadioNombre: 'STAMFORD BRIDGE',
                clubNombre: 'CHELSEA FC',
                ciudad: 'Londres, Inglaterra',
                videoPath: "E:\\Google earth studio\\Inglaterra\\Stamford Bridge_ Chelsea FC.mp4",
                clipStart: 3.0,
                pista: '40.340 hinchas en Fulham Road, oeste de Londres',
                targetLat: 51.4816,
                targetLng: -0.1910,
                userLat: 51.4800,
                userLng: -0.1890,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 19780,
                ubicacionBadge: '📍 Londres, Inglaterra · STAMFORD BRIDGE'
            },
            {
                num: 5,
                estadioNombre: 'ETIHAD STADIUM',
                clubNombre: 'MANCHESTER CITY',
                ciudad: 'Manchester, Inglaterra',
                videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Etihad Stadium_ Manchester City.mp4",
                clipStart: 3.0,
                pista: '53.400 hinchas en el City of Manchester Stadium',
                targetLat: 53.4831,
                targetLng: -2.2004,
                userLat: 53.4815,
                userLng: -2.1985,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 24740,
                ubicacionBadge: '📍 Manchester, Inglaterra · ETIHAD STADIUM'
            }
        ]
    },
    '4': {
        id: 'RETO-DIARIO-04-ESPANA',
        numeroReto: 4,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_04_Espana.mp4',
        portadaFileName: 'Portada_Reto_Diario_04.jpg',
        puntuacionTotal: 24720,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'SANTIAGO BERNABÉU',
                clubNombre: 'REAL MADRID',
                ciudad: 'Madrid, España',
                videoPath: "E:\\Google earth studio\\España\\Bloque A\\bernabeu.mp4",
                clipStart: 3.0,
                pista: '84.744 hinchas en Chamartín, la casa blanca',
                targetLat: 40.453056,
                targetLng: -3.688333,
                userLat: 40.451500,
                userLng: -3.686500,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 4940,
                ubicacionBadge: '📍 Madrid, España · SANTIAGO BERNABÉU'
            },
            {
                num: 2,
                estadioNombre: 'SPOTIFY CAMP NOU',
                clubNombre: 'FC BARCELONA',
                ciudad: 'Barcelona, España',
                videoPath: "E:\\Google earth studio\\España\\Spotify Camp Nou_ Barcelona.mp4",
                clipStart: 3.0,
                pista: '99.354 hinchas en Les Corts, el templo culé',
                targetLat: 41.380896,
                targetLng: 2.122820,
                userLat: 41.379200,
                userLng: 2.124500,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 9870,
                ubicacionBadge: '📍 Barcelona, España · SPOTIFY CAMP NOU'
            },
            {
                num: 3,
                estadioNombre: 'CÍVITAS METROPOLITANO',
                clubNombre: 'ATLÉTICO DE MADRID',
                ciudad: 'Madrid, España',
                videoPath: "E:\\Google earth studio\\España\\Riyadh Air Metropolitano Club Atlético de Madrid.mp4",
                clipStart: 3.0,
                pista: '70.460 hinchas en San Blas, el hogar colchonero',
                targetLat: 40.436111,
                targetLng: -3.599444,
                userLat: 40.434500,
                userLng: -3.597500,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 14810,
                ubicacionBadge: '📍 Madrid, España · METROPOLITANO'
            },
            {
                num: 4,
                estadioNombre: 'SAN MAMÉS',
                clubNombre: 'ATHLETIC CLUB',
                ciudad: 'Bilbao, España',
                videoPath: "E:\\Google earth studio\\España\\Bloque A\\Estadio de San Mamés_ Athletic Club.mp4",
                clipStart: 3.0,
                pista: '53.289 hinchas en La Catedral de Bilbao',
                targetLat: 43.264167,
                targetLng: -2.949444,
                userLat: 43.262500,
                userLng: -2.947500,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 19760,
                ubicacionBadge: '📍 Bilbao, España · SAN MAMÉS'
            },
            {
                num: 5,
                estadioNombre: 'BENITO VILLAMARÍN',
                clubNombre: 'REAL BETIS',
                ciudad: 'Sevilla, España',
                videoPath: "E:\\Google earth studio\\España\\Bloque A\\Estadio Benito Villamarín_ Real Betis.mp4",
                clipStart: 3.0,
                pista: '60.721 hinchas en Heliópolis, la pasión bética',
                targetLat: 37.356389,
                targetLng: -5.981389,
                userLat: 37.354800,
                userLng: -5.979500,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 24720,
                ubicacionBadge: '📍 Sevilla, España · BENITO VILLAMARÍN'
            }
        ]
    },
    '5': {
        id: 'RETO-DIARIO-05-MUNDIAL',
        numeroReto: 5,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_05_Mundial.mp4',
        portadaFileName: 'Portada_Reto_Diario_05.jpg',
        puntuacionTotal: 24710,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'LA BOMBONERA',
                clubNombre: 'BOCA JUNIORS',
                ciudad: 'Buenos Aires, Argentina',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\Boca 2.mp4",
                clipStart: 3.0,
                pista: '57.200 hinchas en Brandsen 805, La Boca',
                targetLat: -34.6356,
                targetLng: -58.3648,
                userLat: -34.6340,
                userLng: -58.3630,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 4940,
                ubicacionBadge: '📍 Buenos Aires, Argentina · LA BOMBONERA'
            },
            {
                num: 2,
                estadioNombre: 'ESTADIO MARACANÁ',
                clubNombre: 'FLAMENGO / FLUMINENSE',
                ciudad: 'Río de Janeiro, Brasil',
                videoPath: "E:\\Google earth studio\\Brasil\\Maracaná.mp4",
                clipStart: 3.0,
                pista: '78.838 hinchas en el templo sagrado carioca',
                targetLat: -22.9122,
                targetLng: -43.2302,
                userLat: -22.9105,
                userLng: -43.2285,
                distanciaTexto: '250 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 9870,
                ubicacionBadge: '📍 Río de Janeiro, Brasil · MARACANÁ'
            },
            {
                num: 3,
                estadioNombre: 'ALLIANZ ARENA',
                clubNombre: 'BAYERN MÚNICH',
                ciudad: 'Múnich, Alemania',
                videoPath: "E:\\Google earth studio\\Bundesliga\\Subidos\\Allianz Arena.mp4",
                clipStart: 3.0,
                pista: '75.024 hinchas iluminados de rojo en Baviera',
                targetLat: 48.2188,
                targetLng: 11.6247,
                userLat: 48.2170,
                userLng: 11.6230,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 14810,
                ubicacionBadge: '📍 Múnich, Alemania · ALLIANZ ARENA'
            },
            {
                num: 4,
                estadioNombre: 'SAN SIRO / MEAZZA',
                clubNombre: 'AC MILAN / INTER',
                ciudad: 'Milán, Italia',
                videoPath: "E:\\Google earth studio\\Italia\\Subidos\\San Siro 2.mp4",
                clipStart: 3.0,
                pista: '75.817 hinchas en La Scala del Calcio',
                targetLat: 45.4781,
                targetLng: 9.1240,
                userLat: 45.4765,
                userLng: 9.1220,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 19760,
                ubicacionBadge: '📍 Milán, Italia · SAN SIRO'
            },
            {
                num: 5,
                estadioNombre: 'ESTADIO AZTECA',
                clubNombre: 'SELECCIÓN DE MÉXICO',
                ciudad: 'Ciudad de México, México',
                videoPath: "E:\\Google earth studio\\México\\Estadio Azteca.mp4",
                clipStart: 3.0,
                pista: '83.264 hinchas en el Coloso de Santa Úrsula',
                targetLat: 19.3029,
                targetLng: -99.1505,
                userLat: 19.3012,
                userLng: -99.1490,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 24710,
                ubicacionBadge: '📍 CDMX, México · ESTADIO AZTECA'
            }
        ]
    },
    '6': {
        id: 'RETO-DIARIO-06-SUDAMERICA',
        numeroReto: 6,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_06_Sudamerica.mp4',
        portadaFileName: 'Portada_Reto_Diario_06.jpg',
        puntuacionTotal: 24720,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'MÂS MONUMENTAL',
                clubNombre: 'RIVER PLATE',
                ciudad: 'Buenos Aires, Argentina',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\Sin título.mp4",
                clipStart: 3.0,
                pista: '84.567 hinchas en Núñez, el coloso argentino',
                targetLat: -34.5453,
                targetLng: -58.4498,
                userLat: -34.5435,
                userLng: -58.4480,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 4940,
                ubicacionBadge: '📍 Buenos Aires, Argentina · MÂS MONUMENTAL'
            },
            {
                num: 2,
                estadioNombre: 'ESTADIO DO MORUMBI',
                clubNombre: 'SÃO PAULO FC',
                ciudad: 'São Paulo, Brasil',
                videoPath: "E:\\Google earth studio\\Brasil\\Estadio Cícero Pompeu de Toledo_ São Paulo Futebol Clube.mp4",
                clipStart: 3.0,
                pista: '66.795 hinchas en el Cícero Pompeu de Toledo',
                targetLat: -23.6001,
                targetLng: -46.7202,
                userLat: -23.5985,
                userLng: -46.7185,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 9880,
                ubicacionBadge: '📍 São Paulo, Brasil · MORUMBI'
            },
            {
                num: 3,
                estadioNombre: 'CILINDRO DE AVELLANEDA',
                clubNombre: 'RACING CLUB',
                ciudad: 'Avellaneda, Buenos Aires',
                videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\racing.mp4",
                clipStart: 3.0,
                pista: '55.000 hinchas en el templo de la Academia',
                targetLat: -34.6675,
                targetLng: -58.3686,
                userLat: -34.6660,
                userLng: -58.3670,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 14830,
                ubicacionBadge: '📍 Avellaneda, Argentina · EL CILINDRO'
            },
            {
                num: 4,
                estadioNombre: 'ESTADIO MINEIRÃO',
                clubNombre: 'CRUZEIRO / ATL. MINEIRO',
                ciudad: 'Belo Horizonte, Brasil',
                videoPath: "E:\\Google earth studio\\Brasil\\Estadio Mineirão_ Cruzeiro.mp4",
                clipStart: 3.0,
                pista: '61.846 hinchas en el Gigante de la Pampulha',
                targetLat: -19.8658,
                targetLng: -43.9711,
                userLat: -19.8640,
                userLng: -43.9695,
                distanciaTexto: '250 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 19760,
                ubicacionBadge: '📍 Belo Horizonte, Brasil · MINEIRÃO'
            },
            {
                num: 5,
                estadioNombre: 'VILA BELMIRO',
                clubNombre: 'SANTOS FC',
                ciudad: 'Santos, São Paulo, Brasil',
                videoPath: "E:\\Google earth studio\\Brasil\\Estadio Urbano Caldeira_ Santos FC.mp4",
                clipStart: 3.0,
                pista: '16.068 hinchas en Urbano Caldeira, la casa de Pelé',
                targetLat: -23.9511,
                targetLng: -46.3389,
                userLat: -23.9495,
                userLng: -46.3375,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 24720,
                ubicacionBadge: '📍 Santos, Brasil · VILA BELMIRO'
            }
        ]
    },
    '7': {
        id: 'RETO-DIARIO-07-EUROPA',
        numeroReto: 7,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        descripcionPortada: '📍 5 templos legendarios de Europa en el mapa satelital. <b>¿Te da para el 5/5?</b>',
        videoFileName: 'Reto_Diario_07_Europa.mp4',
        portadaFileName: 'Portada_Reto_Diario_07.jpg',
        puntuacionTotal: 24740,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'SIGNAL IDUNA PARK',
                clubNombre: 'BORUSSIA DORTMUND',
                ciudad: 'Dortmund, Alemania',
                videoPath: "E:\\Google earth studio\\Bundesliga\\Subidos\\Borussia.mp4",
                clipStart: 3.0,
                pista: '81.365 hinchas en el mítico Muro Amarillo alemán',
                targetLat: 51.4926,
                targetLng: 7.4519,
                userLat: 51.4912,
                userLng: 7.4502,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 4940,
                ubicacionBadge: '📍 Dortmund, Alemania · SIGNAL IDUNA PARK'
            },
            {
                num: 2,
                estadioNombre: 'JOHAN CRUYFF ARENA',
                clubNombre: 'AJAX AMSTERDAM',
                ciudad: 'Ámsterdam, Países Bajos',
                videoPath: "E:\\Google earth studio\\Holanda\\Johan Cruyff Arena Ajax Amsterdam.mp4",
                clipStart: 3.0,
                pista: '55.885 hinchas en el templo del fútbol total',
                targetLat: 52.3144,
                targetLng: 4.9419,
                userLat: 52.3130,
                userLng: 4.9402,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 9890,
                ubicacionBadge: '📍 Ámsterdam, Países Bajos · CRUYFF ARENA'
            },
            {
                num: 3,
                estadioNombre: 'ALLIANZ STADIUM',
                clubNombre: 'JUVENTUS FC',
                ciudad: 'Turín, Italia',
                videoPath: "E:\\Google earth studio\\Italia\\Subidos\\Juventus.mp4",
                clipStart: 3.0,
                pista: '41.507 hinchas en la fortaleza de la Vecchia Signora',
                targetLat: 45.1096,
                targetLng: 7.6413,
                userLat: 45.1080,
                userLng: 7.6398,
                distanciaTexto: '210 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 14840,
                ubicacionBadge: '📍 Turín, Italia · ALLIANZ STADIUM'
            },
            {
                num: 4,
                estadioNombre: 'PARQUE DE LOS PRÍNCIPES',
                clubNombre: 'PARIS SAINT-GERMAIN',
                ciudad: 'París, Francia',
                videoPath: "E:\\Google earth studio\\Francia\\Subidos\\PSG.mp4",
                clipStart: 3.0,
                pista: '47.929 hinchas a orillas del Sena en París',
                targetLat: 48.8414,
                targetLng: 2.2530,
                userLat: 48.8400,
                userLng: 2.2515,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 19780,
                ubicacionBadge: '📍 París, Francia · PARQUE DE LOS PRÍNCIPES'
            },
            {
                num: 5,
                estadioNombre: 'ESTADIO DE MESTALLA',
                clubNombre: 'VALENCIA CF',
                ciudad: 'Valencia, España',
                videoPath: "E:\\Google earth studio\\España\\Bloque A\\Estadio Mestalla_ Valencia.mp4",
                clipStart: 3.0,
                pista: '49.430 hinchas en las tribunas verticales de Valencia',
                targetLat: 39.4746,
                targetLng: -0.3582,
                userLat: 39.4730,
                userLng: -0.3570,
                distanciaTexto: '210 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 24740,
                ubicacionBadge: '📍 Valencia, España · MESTALLA'
            }
        ]
    },
    '8': {
        id: 'RETO-DIARIO-08-MEXICO',
        numeroReto: 8,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_08_Mexico.mp4',
        portadaFileName: 'Portada_Reto_Diario_08.jpg',
        puntuacionTotal: 24690,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'ESTADIO BBVA',
                clubNombre: 'CF MONTERREY',
                ciudad: 'Guadalupe, Nuevo León',
                videoPath: "E:\\Google earth studio\\México\\Estadio BBVA_CF Monterrey.mp4",
                clipStart: 3.0,
                pista: '53.500 hinchas en el Gigante de Acero junto al cerro',
                targetLat: 25.6691,
                targetLng: -100.2443,
                userLat: 25.6705,
                userLng: -100.2425,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 4950,
                ubicacionBadge: '📍 Guadalupe, NL · ESTADIO BBVA'
            },
            {
                num: 2,
                estadioNombre: 'ESTADIO AKRON',
                clubNombre: 'CHIVAS DE GUADALAJARA',
                ciudad: 'Zapopan, Jalisco',
                videoPath: "E:\\Google earth studio\\México\\Estadio Guadalajara Ubicación Zapopan, Jalisco, México.mp4",
                clipStart: 3.0,
                pista: '46.232 hinchas en la joya volcánica de Zapopan',
                targetLat: 20.6819,
                targetLng: -103.4626,
                userLat: 20.6835,
                userLng: -103.4608,
                distanciaTexto: '250 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 9880,
                ubicacionBadge: '📍 Zapopan, Jalisco · ESTADIO AKRON'
            },
            {
                num: 3,
                estadioNombre: 'ESTADIO UNIVERSITARIO',
                clubNombre: 'TIGRES UANL',
                ciudad: 'San Nicolás de los Garza',
                videoPath: "E:\\Google earth studio\\México\\Estadio Universitario de la UANL Tigres.mp4",
                clipStart: 3.0,
                pista: '41.886 hinchas en la caldera del Volcán universitario',
                targetLat: 25.7258,
                targetLng: -100.3126,
                userLat: 25.7242,
                userLng: -100.3110,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 14840,
                ubicacionBadge: '📍 San Nicolás, NL · ESTADIO UNIVERSITARIO'
            },
            {
                num: 4,
                estadioNombre: 'OLÍMPICO UNIVERSITARIO',
                clubNombre: 'PUMAS UNAM',
                ciudad: 'Ciudad de México',
                videoPath: "E:\\Google earth studio\\México\\Estadio Olimpico Universitario Pumas.mp4",
                clipStart: 3.0,
                pista: '72.000 hinchas y mural de Diego Rivera, sede del 68',
                targetLat: 19.3317,
                targetLng: -99.1923,
                userLat: 19.3332,
                userLng: -99.1905,
                distanciaTexto: '250 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 19770,
                ubicacionBadge: '📍 Ciudad de México · OLÍMPICO UNIVERSITARIO'
            },
            {
                num: 5,
                estadioNombre: 'ESTADIO NEMESIO DIEZ',
                clubNombre: 'TOLUCA FC',
                ciudad: 'Toluca, Edo. de México',
                videoPath: "E:\\Google earth studio\\México\\Estadio Nemesio Diez Toluca FC.mp4",
                clipStart: 3.0,
                pista: '30.000 hinchas a 2.660 metros sobre el nivel del mar',
                targetLat: 19.2872,
                targetLng: -99.6672,
                userLat: 19.2887,
                userLng: -99.6655,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.920 PTS 🔥',
                puntos: 4920,
                puntosAcumulados: 24690,
                ubicacionBadge: '📍 Toluca, México · ESTADIO NEMESIO DIEZ'
            }
        ]
    },
    '9': {
        id: 'RETO-DIARIO-09-ITALIA',
        numeroReto: 9,
        tituloPortada: '¿CUÁNTOS PUNTOS SACÁS EN EL RETO DE HOY?',
        subtituloPortada: '5 ESTADIOS · 25.000 PUNTOS EN JUEGO',
        videoFileName: 'Reto_Diario_09_Italia.mp4',
        portadaFileName: 'Portada_Reto_Diario_09.jpg',
        puntuacionTotal: 24710,
        rangoFinal: '👑 GALÁCTICO ABSOLUTO',
        grillaWordle: '🟩 🟩 🟩 🟩 🟩',
        rondas: [
            {
                num: 1,
                estadioNombre: 'DIEGO ARMANDO MARADONA',
                clubNombre: 'SSC NAPOLI',
                ciudad: 'Nápoles, Italia',
                videoPath: "E:\\Google earth studio\\Italia\\Subidos\\Diego Armando Maradona_Napoli.mp4",
                clipStart: 3.0,
                pista: '54.726 hinchas en el santuario sureño del Calcio',
                targetLat: 40.8279,
                targetLng: 14.1930,
                userLat: 40.8295,
                userLng: 14.1950,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.950 PTS 🔥',
                puntos: 4950,
                puntosAcumulados: 4950,
                ubicacionBadge: '📍 Nápoles, Italia · DIEGO ARMANDO MARADONA'
            },
            {
                num: 2,
                estadioNombre: 'ESTADIO ARTEMIO FRANCHI',
                clubNombre: 'ACF FIORENTINA',
                ciudad: 'Florencia, Italia',
                videoPath: "E:\\Google earth studio\\Italia\\Artemio Franchi Fiorentina.mp4",
                clipStart: 3.0,
                pista: '43.147 hinchas de la Viola con su torre de Maratón',
                targetLat: 43.7808,
                targetLng: 11.2825,
                userLat: 43.7822,
                userLng: 11.2842,
                distanciaTexto: '220 METROS',
                puntosTexto: '+4.960 PTS 🔥',
                puntos: 4960,
                puntosAcumulados: 9910,
                ubicacionBadge: '📍 Florencia, Italia · ARTEMIO FRANCHI'
            },
            {
                num: 3,
                estadioNombre: 'GEWISS STADIUM',
                clubNombre: 'ATALANTA BC',
                ciudad: 'Bérgamo, Lombardía',
                videoPath: "E:\\Google earth studio\\Italia\\Subidos\\Gewiss Stadium Atalanta.mp4",
                clipStart: 3.0,
                pista: '21.747 hinchas en la moderna guarida de la Dea',
                targetLat: 45.7088,
                targetLng: 9.6806,
                userLat: 45.7103,
                userLng: 9.6824,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.940 PTS 🔥',
                puntos: 4940,
                puntosAcumulados: 14850,
                ubicacionBadge: '📍 Bérgamo, Italia · GEWISS STADIUM'
            },
            {
                num: 4,
                estadioNombre: 'ESTADIO LUIGI FERRARIS',
                clubNombre: 'GENOA CFC',
                ciudad: 'Génova, Liguria',
                videoPath: "E:\\Google earth studio\\Italia\\Subidos\\Luigi Ferraris_Genoa.mp4",
                clipStart: 3.0,
                pista: '36.599 hinchas en el barrio de Marassi desde 1911',
                targetLat: 44.4164,
                targetLng: 8.9525,
                userLat: 44.4180,
                userLng: 8.9542,
                distanciaTexto: '240 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 19780,
                ubicacionBadge: '📍 Génova, Italia · LUIGI FERRARIS'
            },
            {
                num: 5,
                estadioNombre: 'ESTADIO RENATO DALL\'ARA',
                clubNombre: 'BOLOGNA FC',
                ciudad: 'Bolonia, Emilia-Romaña',
                videoPath: "E:\\Google earth studio\\Italia\\Renato DallAra Bologna.mp4",
                clipStart: 3.0,
                pista: '36.462 hinchas y su famosa Torre de Maratona',
                targetLat: 44.4922,
                targetLng: 11.3097,
                userLat: 44.4938,
                userLng: 11.3115,
                distanciaTexto: '230 METROS',
                puntosTexto: '+4.930 PTS 🔥',
                puntos: 4930,
                puntosAcumulados: 24710,
                ubicacionBadge: '📍 Bolonia, Italia · RENATO DALL\'ARA'
            }
        ]
    }
};

// Aliases para CLI
RETOS_DATABASE['ascenso'] = RETOS_DATABASE['2'];
RETOS_DATABASE['argentina'] = RETOS_DATABASE['1'];
RETOS_DATABASE['premier'] = RETOS_DATABASE['3'];
RETOS_DATABASE['espana'] = RETOS_DATABASE['4'];
RETOS_DATABASE['laliga'] = RETOS_DATABASE['4'];
RETOS_DATABASE['mundial'] = RETOS_DATABASE['5'];
RETOS_DATABASE['catedrales'] = RETOS_DATABASE['5'];
RETOS_DATABASE['sudamerica'] = RETOS_DATABASE['6'];
RETOS_DATABASE['brasil-argentina'] = RETOS_DATABASE['6'];
RETOS_DATABASE['europa'] = RETOS_DATABASE['7'];

RETOS_DATABASE['champions'] = RETOS_DATABASE['7'];
RETOS_DATABASE['mexico'] = RETOS_DATABASE['8'];
RETOS_DATABASE['italia'] = RETOS_DATABASE['9'];

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL LIMPIO (35s)
// ==========================================
// Cero whooshes, cero barridos. Solo campanas, ticks, pops y fanfarria.
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

    // Cronograma para las 5 rondas (cada una de 6s: 0s, 6s, 12s, 18s, 24s)
    for (let r = 0; r < 5; r++) {
        const baseT = r * 6.0;
        // Campana de inicio de ronda
        addBellDing(baseT + 0.5, 880 + r * 60);

        // Ticks de tensión antes de clavar
        addTick(baseT + 2.5);
        addTick(baseT + 3.0);

        // Pin pop en el mapa
        addPinPop(baseT + 3.5);

        // Sonido de acierto Haversine (dos tonos alegres)
        addTone(baseT + 3.7, 0.6, 659.25, 0.3, 3);
        addTone(baseT + 3.85, 0.8, 880.00, 0.35, 3);
    }

    // 30.0s a 35.0s: Fanfarria mayor de victoria final (C - E - G - B - C)
    const victoriaChords = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    victoriaChords.forEach((freq, idx) => {
        addTone(30.2 + idx * 0.08, 4.0, freq, 0.32, 1.6);
    });

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

// ==========================================
// 2. GENERADOR DE TEXTOS_PUBLICACION.TXT
// ==========================================
function generarArchivoTextos(config, targetFolder) {
    const filePath = path.join(targetFolder, 'TEXTOS_PUBLICACION.txt');
    const listaEstadios = config.rondas.map(r => `${r.num}. ${r.clubNombre} (${r.estadioNombre})`).join('\n');
    const hashtagsClubes = config.rondas.map(r => '#' + r.clubNombre.toLowerCase().replace(/[^a-z0-9]/g, '')).join(' ');

    const content = `========================================================
ESTADIOS VIRTUALES · PACK LISTO PARA PUBLICAR
FORMATO: RETO DIARIO OFICIAL (5 ESTADIOS · 25.000 PTS)
FECHA / EDICIÓN: RETO DIARIO #${config.numeroReto}
========================================================

🏆 OPCIÓN 1: DESAFÍO DIRECTO Y WORDLE (MÁXIMA CONVERSIÓN)
--------------------------------------------------------
Completé el Reto Diario #${config.numeroReto} en estadiosvirtuales.com 🌍⚽
Metí ${config.puntuacionTotal.toLocaleString('es-AR')} / 25.000 puntos (${config.rangoFinal}) 🎯🔥

Mi resultado de hoy:
${config.grillaWordle}

¿Sos capaz de superar mi puntaje en las 5 canchas?
👉 Jugalo en el link del perfil: estadiosvirtuales.com
Subí de nivel tu carta FUT y completá el reto todos los días 🏆⚽

#estadiosvirtuales #stadiumguessr #retodiario #futbolargentino #futbol #geoguessr #wordle


⚽ OPCIÓN 2: FOLCLORE Y DEBATE DE CANCHAS
--------------------------------------------------------
5 estadios desde el aire 🚁👀
¿Cuántos pudiste reconocer antes de que caiga el pin en el mapa?

Dejanos tu puntaje en los comentarios 👇
${listaEstadios}

🎮 Jugá el Reto Diario nuevo todos los días gratis en: estadiosvirtuales.com

#futbol #estadios #futbolargentino ${hashtagsClubes}


🎮 OPCIÓN 3: MODO GAMER / GEOGUESSR
--------------------------------------------------------
Para los que respiran fútbol y mapas 🕹️🗺️
5 canchas distintas, 5.000 puntos posibles por cada una.

En este reto sumamos ${config.puntuacionTotal.toLocaleString('es-AR')} puntos.
¿Te da la nafta para clavar 25.000 clavados o vas a pifiar en algún club?

👉 Link en el perfil: estadiosvirtuales.com

#gamingentiktok #stadiumguessr #geoguessr #estadiosvirtuales #videojuegos


⚡ OPCIÓN 4: CORTA Y VIRAL
--------------------------------------------------------
Metí ${config.puntuacionTotal.toLocaleString('es-AR')} puntos en el Reto Diario #${config.numeroReto} 🎯
${config.grillaWordle}

¿Cuánto sacás vos? Jugalo gratis en el link de la bio 📲⚽

#retodiario #futbolargentino #estadios #estadiosvirtuales #trivia


💬 COMENTARIOS FIJADOS RECOMENDADOS:
--------------------------------------------------------
1. «¿Cuántos puntos hiciste vos en el reto de hoy? Comentá tus aciertos y jugalo gratis en estadiosvirtuales.com (link en el perfil) 🗺️⚽»
2. «Comentá cuál fue la cancha más difícil: ¿la de ${config.rondas[0].clubNombre} o la de ${config.rondas[3].clubNombre}? 👀👇»
`;

    fs.writeFileSync(filePath, content, 'utf8');
}

// ==========================================
// 3. GENERADOR DE OVERLAYS Y MAPAS LEAFLET
// ==========================================
async function generarOverlaysYMapas(config, assetsDir) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    // -------------------------------------------------------------
    // A. HEADERS SUPERIORES PARA CADA RONDA (1080x280 px a y=50)
    // -------------------------------------------------------------
    for (let r = 0; r < 5; r++) {
        const ronda = config.rondas[r];
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 320, deviceScaleFactor: 1 });

        // Generamos los 5 dots de progreso con círculos delicados y suaves
        let dotsHtml = '';
        for (let d = 0; d < 5; d++) {
            if (d < r) {
                dotsHtml += `<div class="dot-pill done"><span class="pill-circle done"></span> R${d + 1}</div>`;
            } else if (d === r) {
                dotsHtml += `<div class="dot-pill current"><span class="pill-circle current"></span> R${d + 1}</div>`;
            } else {
                dotsHtml += `<div class="dot-pill future"><span class="pill-circle future"></span> R${d + 1}</div>`;
            }
        }

        const scoreAnterior = r === 0 ? 0 : config.rondas[r - 1].puntosAcumulados;

        const headerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                body { width: 1080px; height: 320px; background: transparent; overflow: hidden; padding: 20px 50px; }
                .web-header {
                    width: 980px;
                    background: linear-gradient(135deg, rgba(14, 20, 32, 0.96) 0%, rgba(9, 13, 22, 0.98) 100%);
                    border: 2px solid rgba(0, 230, 118, 0.45);
                    border-top: 2.5px solid rgba(110, 255, 180, 0.85);
                    border-radius: 28px;
                    padding: 16px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(0, 230, 118, 0.2);
                }
                .header-top-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .brand-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 230, 118, 0.12);
                    border: 1.5px solid #00e676;
                    color: #00e676;
                    font-size: 18px;
                    font-weight: 900;
                    padding: 4px 16px;
                    border-radius: 20px;
                    letter-spacing: 0.5px;
                }
                .pulse-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #00e676;
                    box-shadow: 0 0 12px #00e676;
                }
                .challenge-tag {
                    background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                    color: #000;
                    font-size: 16px;
                    font-weight: 900;
                    padding: 4px 14px;
                    border-radius: 14px;
                    letter-spacing: 0.5px;
                }
                .title-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .game-main-title {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                }
                .hud-score {
                    color: #00e676;
                    font-size: 26px;
                    font-weight: 900;
                    text-shadow: 0 0 12px rgba(0,230,118,0.5);
                }
                .dots-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 14px;
                    padding: 6px 14px;
                    justify-content: space-between;
                }
                .dot-pill {
                    font-size: 15px;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                }
                .pill-circle {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .pill-circle.done {
                    background: #00e676;
                    box-shadow: 0 0 8px rgba(0, 230, 118, 0.8);
                }
                .pill-circle.current {
                    background: #38bdf8;
                    box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
                }
                .pill-circle.future {
                    background: #64748b;
                }
                .dot-pill.done { background: rgba(0, 230, 118, 0.2); color: #00e676; border: 1px solid #00e676; }
                .dot-pill.current { background: rgba(56, 189, 248, 0.25); color: #38bdf8; border: 1.5px solid #38bdf8; }
                .dot-pill.future { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="web-header" id="header-box">
                <div class="header-top-row">
                    <div class="brand-pill"><div class="pulse-dot"></div> ESTADIOSVIRTUALES.COM</div>
                    <div class="challenge-tag">📅 RETO DIARIO #${config.numeroReto}</div>
                </div>
                <div class="title-row">
                    <div class="game-main-title">RONDA ${r + 1} DE 5: ¿QUÉ CANCHA ES? ⚽</div>
                    <div class="hud-score">${scoreAnterior.toLocaleString('es-AR')} PTS</div>
                </div>
                <div class="dots-row">
                    ${dotsHtml}
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(headerHtml, { waitUntil: 'load' });
        const headerEl = await page.$('#header-box');
        const headerPath = path.join(assetsDir, `ui_header_ronda_${r + 1}.png`);
        await headerEl.screenshot({ path: headerPath, omitBackground: true });
        await page.close();
    }
    console.log('✅ Headers de las 5 rondas generados.');

    // -------------------------------------------------------------
    // B. PISTAS FLOTANTES INFERIORES PARA CADA RONDA (980x94 px)
    // -------------------------------------------------------------
    for (let r = 0; r < 5; r++) {
        const ronda = config.rondas[r];
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 180, deviceScaleFactor: 1 });

        const clueHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                body { width: 1080px; height: 180px; background: transparent; overflow: hidden; padding: 20px 50px; }
                .clue-card {
                    width: 980px;
                    height: 94px;
                    background: linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(10, 15, 26, 0.98) 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
                    position: relative;
                    overflow: hidden;
                }
                .clue-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #00e676; box-shadow: 0 0 15px #00e676; }
                .clue-icon { font-size: 38px; margin-right: 18px; }
                .clue-text { color: #ffffff; font-size: 28px; font-weight: 800; white-space: nowrap; }
                .clue-tag { font-weight: 900; color: #00e676; margin-right: 10px; }
            </style>
        </head>
        <body>
            <div class="clue-card" id="clue-box">
                <div class="clue-indicator"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag">PISTA:</span> ${ronda.pista}</div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(clueHtml, { waitUntil: 'load' });
        const clueEl = await page.$('#clue-box');
        const cluePath = path.join(assetsDir, `ui_clue_ronda_${r + 1}.png`);
        await clueEl.screenshot({ path: cluePath, omitBackground: true });
        await page.close();
    }
    console.log('✅ Pistas inferiores de las 5 rondas generadas.');

    // -------------------------------------------------------------
    // C. MAPAS LEAFLET (960x460) DE CADA RONDA (100% TILES CARGADOS)
    // -------------------------------------------------------------
    for (let r = 0; r < 5; r++) {
        const item = config.rondas[r];
        const page = await browser.newPage();
        await page.setViewport({ width: 960, height: 460, deviceScaleFactor: 2 });

        const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
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
                    box-shadow: 0 16px 50px rgba(0, 230, 118, 0.4), 0 0 0 2px rgba(0,0,0,0.8);
                }
                #map { width: 100%; height: 100%; background: #111; }
                .score-badge {
                    position: absolute;
                    top: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(9, 14, 23, 0.95);
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
                    box-shadow: 0 8px 25px rgba(0,0,0,0.8);
                }
                .score-badge span { color: #fff; }
                .bottom-badge {
                    position: absolute;
                    bottom: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(9, 14, 23, 0.95);
                    border: 1px solid rgba(255,255,255,0.25);
                    color: #ffd700;
                    padding: 8px 24px;
                    border-radius: 20px;
                    font-size: 20px;
                    font-weight: 700;
                    z-index: 1000;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.7);
                    white-space: nowrap;
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
                L.circleMarker(targetPos, { radius: 35, color: '#00e676', fillColor: '#00e676', fillOpacity: 0.22, weight: 2 }).addTo(map);

                const pinIcon = L.divIcon({ className: 'custom-pin-wrap', html: '<div class="user-pin"></div>', iconSize: [32, 32], iconAnchor: [16, 32] });
                L.marker(userPos, { icon: pinIcon }).addTo(map);
            </script>
        </body>
        </html>`;

        await page.setContent(mapHtml, { waitUntil: 'networkidle2' }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        const mapCardEl = await page.$('#map-card');
        const mapImgPath = path.join(assetsDir, `mapa_ronda_${r + 1}.png`);
        await mapCardEl.screenshot({ path: mapImgPath, omitBackground: true });
        await page.close();
        console.log(`✅ Mapa Leaflet Ronda ${r + 1} (${item.estadioNombre}) capturado con OpenStreetMap nítido.`);
    }

    // -------------------------------------------------------------
    // D. PANTALLA DE RESULTADOS FINALES AUTÉNTICA (30.0s a 35.0s)
    // -------------------------------------------------------------
    const finalPage = await browser.newPage();
    await finalPage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const logoSrc = getBase64Image(path.resolve(__dirname, '..', 'escudos', 'Logo.webp'));
    const avatarSrc = getBase64Image(path.resolve(__dirname, '..', '1.webp'));
    const maxScoreTxt = `${(config.puntuacionTotal / 1000).toFixed(1)}K`;
    const ovrTxt = config.puntuacionTotal >= 24000 ? '98' : '95';

    const stadiumsRowsHtml = config.rondas.map(r => `
        <div class="stadium-summary-row">
            <div class="stadium-left">
                <span class="round-tag">R${r.num}</span>
                <span class="stadium-title">${r.estadioNombre}</span>
            </div>
            <div class="stadium-right">
                <span class="club-badge">${r.clubNombre}</span>
                <span class="pts-badge">${(r.puntosTexto || '').replace('🔥', '').trim()}</span>
            </div>
        </div>
    `).join('');

    const finalScreenHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { 
                width: 1080px; 
                height: 1920px; 
                background: transparent; 
                overflow: hidden; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
            }
            .endgame-modal {
                width: 980px;
                background: linear-gradient(135deg, rgba(14, 24, 40, 0.98) 0%, rgba(8, 14, 24, 0.99) 100%);
                border: 3px solid #00e676;
                border-radius: 36px;
                padding: 30px 32px 28px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                box-shadow: 0 25px 70px rgba(0, 230, 118, 0.35), 0 0 0 2px rgba(0,0,0,0.9);
                text-align: center;
            }
            .modal-header-top {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 0 8px;
            }
            .brand-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 230, 118, 0.12);
                border: 1.5px solid #00e676;
                color: #00e676;
                font-size: 16px;
                font-weight: 900;
                padding: 5px 18px;
                border-radius: 20px;
                letter-spacing: 1.5px;
            }
            .modal-title-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 14px;
                margin-top: -4px;
            }
            .modal-title {
                color: #ffffff;
                font-size: 40px;
                font-weight: 900;
                letter-spacing: -0.5px;
            }
            .rounds-circles-row {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: rgba(0, 230, 118, 0.08);
                border: 1px solid rgba(0, 230, 118, 0.35);
                border-radius: 20px;
                padding: 8px 18px;
            }
            .round-circle-dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #00e676;
                box-shadow: 0 0 10px rgba(0, 230, 118, 0.8), 0 0 4px #00e676;
            }

            /* --- LAYOUT CENTRAL EN 2 COLUMNAS --- */
            .central-split {
                display: flex;
                align-items: stretch;
                justify-content: space-between;
                width: 100%;
                gap: 22px;
                margin-top: 4px;
            }

            /* ========================================================
               CARTA FUT OFICIAL DE ESTADIOS VIRTUALES (100% IDÉNTICA)
               ======================================================== */
            .card-column {
                width: 320px;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.75));
            }
            .fut-card-wrapper {
                transform: scale(1.12);
                transform-origin: center center;
                margin: 15px 0 20px 0;
            }
            .fut-card {
                position: relative;
                width: 250px;
                height: 385px;
                background-size: cover;
                padding: 24px 18px 25px 18px;
                display: flex;
                flex-direction: column;
                align-items: center;
                color: #000;
                font-family: 'Arial Black', Gadget, sans-serif;
                user-select: none;
                flex-shrink: 0;

                /* 🛡️ Silueta de Pelé idéntica a estilos.css */
                clip-path: path('M 0,32 C 0,24 10,18 25,14 C 65,8 105,5 115,3 C 120,2 122,0 125,0 C 128,0 130,2 135,3 C 145,5 185,8 225,14 C 240,18 250,24 250,32 L 250,305 C 250,335 180,365 125,385 C 70,365 0,335 0,305 Z');
            }
            .fut-card > * {
                position: relative;
                z-index: 2;
            }
            .fut-card::before {
                content: '';
                position: absolute;
                inset: 0;
                background: 
                    radial-gradient(circle at 50% 28%, rgba(255, 255, 255, 0.35) 0%, transparent 60%),
                    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 12px);
                pointer-events: none;
                z-index: 1;
            }
            .fut-card.arg {
                background: linear-gradient(135deg, #74acdf 0%, #ffffff 50%, #74acdf 100%);
                color: #000;
            }
            .fut-card-shine {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255,255,255,.08) 0%, transparent 50%, rgba(255,255,255,.04) 100%);
                pointer-events: none;
            }
            .fut-top {
                display: flex;
                width: 100%;
                height: 54%;
                margin-top: 10px;
            }
            .fut-badge-meta {
                width: 32%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            .fut-ovr {
                font-size: 2.8rem;
                font-weight: 900;
                letter-spacing: -1px;
            }
            .fut-pos {
                font-size: 1rem;
                font-weight: 900;
                text-transform: uppercase;
                opacity: .8;
                margin-top: -2px;
            }
            .fut-club-icon {
                width: 42px;
                height: 42px;
                margin-top: 10px;
                object-fit: contain;
            }
            .fut-avatar-container {
                width: 68%;
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
                height: 105%; 
                display: flex;
                justify-content: center;
                align-items: flex-end;
                pointer-events: none;
                overflow: hidden;
                -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
                mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
            }
            .ac-avatar-img-full {
                width: 118%;
                height: 108%;
                object-fit: cover;
                object-position: center 12%;
                filter: none;
            }
            .fut-name {
                width: 100%;
                text-align: center;
                font-size: 1.35rem;
                font-weight: 900;
                margin: 12px 0 8px;
                text-transform: uppercase;
                letter-spacing: -.5px;
                border-bottom: 1px solid rgba(0,0,0,.3);
                padding-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .fut-stats-row {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                width: 95%;
                font-size: .95rem;
                gap: 8px 15px;
                margin-top: 5px;
                position: relative;
            }
            .fut-stats-row::after {
                content: 'ESTADIOS VIRTUALES';
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.35rem;
                font-weight: 900;
                letter-spacing: 2px;
                color: rgba(0, 0, 0, 0.20);
                pointer-events: none;
                white-space: nowrap;
                z-index: -1;
            }
            .fut-stats-row .fut-stat-item:last-child {
                grid-column: span 2;
            }
            .fut-stat-item {
                display: flex;
                gap: 6px;
                justify-content: center;
                align-items: baseline;
            }
            .fut-stat-num {
                font-weight: 900;
                font-size: 1.15rem;
            }
            .fut-stat-label {
                opacity: .8;
                font-size: .8rem;
                align-self: flex-end;
                margin-bottom: 1px;
            }
            .card-sub-pill {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(255, 215, 0, 0.15);
                border: 1.5px solid #ffd700;
                color: #ffd700;
                font-size: 14px;
                font-weight: 900;
                padding: 4px 14px;
                border-radius: 14px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-top: -6px;
            }

            /* COLUMNA DERECHA: RESUMEN DEL RETO */
            .summary-column {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                text-align: left;
            }
            .score-highlight-card {
                background: rgba(0, 230, 118, 0.08);
                border: 1.5px solid rgba(0, 230, 118, 0.4);
                border-radius: 16px;
                padding: 10px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .score-label-group {
                display: flex;
                flex-direction: column;
            }
            .score-small-title {
                color: #94a3b8;
                font-size: 13px;
                font-weight: 800;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .score-big-num {
                color: #00e676;
                font-size: 32px;
                font-weight: 900;
                letter-spacing: -0.5px;
                text-shadow: 0 0 20px rgba(0, 230, 118, 0.5);
                line-height: 1.1;
            }
            .score-max-tag {
                font-size: 18px;
                color: #94a3b8;
                font-weight: 700;
            }
            .score-xp-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                background: #00e676;
                color: #041409;
                font-size: 15px;
                font-weight: 900;
                padding: 6px 14px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 230, 118, 0.4);
            }
            .summary-header {
                color: #38bdf8;
                font-size: 15px;
                font-weight: 900;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                margin-top: 8px;
                margin-bottom: 2px;
            }
            .summary-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .stadium-summary-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 8px 14px;
            }
            .stadium-left {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .round-tag {
                background: #00e676;
                color: #000;
                font-weight: 900;
                font-size: 14px;
                padding: 3px 8px;
                border-radius: 6px;
            }
            .stadium-title {
                color: #ffffff;
                font-weight: 800;
                font-size: 18px;
                letter-spacing: -0.3px;
            }
            .stadium-right {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .club-badge {
                color: #ffd700;
                font-weight: 800;
                font-size: 15px;
                text-transform: uppercase;
            }
            .pts-badge {
                color: #00e676;
                font-weight: 900;
                font-size: 15px;
            }

            /* --- FOOTER CTA --- */
            .cta-card {
                width: 100%;
                background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                color: #041409;
                border: 2px solid #ffffff;
                font-size: 24px;
                font-weight: 900;
                padding: 14px 22px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 230, 118, 0.5);
                line-height: 1.25;
            }
            .cta-sub {
                display: block;
                font-size: 17px;
                font-weight: 800;
                margin-top: 3px;
                color: #002e1b;
            }
            .follow-sub-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 215, 0, 0.12);
                border: 1.5px solid #ffd700;
                color: #ffd700;
                font-size: 18px;
                font-weight: 800;
                padding: 6px 20px;
                border-radius: 16px;
            }
        </style>
    </head>
    <body>
        <div class="endgame-modal" id="final-modal">
            <div class="modal-header-top">
                <div class="brand-badge">ESTADIOSVIRTUALES.COM · RETO DIARIO</div>
            </div>
            
            <div class="modal-title-row">
                <div class="modal-title">🏆 ¡RETO COMPLETADO!</div>
                <div class="rounds-circles-row">
                    <div class="round-circle-dot"></div>
                    <div class="round-circle-dot"></div>
                    <div class="round-circle-dot"></div>
                    <div class="round-circle-dot"></div>
                    <div class="round-circle-dot"></div>
                </div>
            </div>

            <div class="central-split">
                <!-- COLUMNA IZQUIERDA: CARTA FUT 100% IDÉNTICA AL JUEGO -->
                <div class="card-column">
                    <div class="fut-card-wrapper">
                        <div class="fut-card arg">
                            <div class="fut-card-shine"></div>
                            <div class="fut-top">
                                <div class="fut-badge-meta">
                                    <div class="fut-ovr">${ovrTxt}</div>
                                    <div class="fut-pos">DT</div>
                                    <img src="${logoSrc}" class="fut-club-icon">
                                </div>
                                <div class="fut-avatar-container">
                                    <div class="ac-avatar-full">
                                        <img src="${avatarSrc}" class="ac-avatar-img-full" alt="Avatar">
                                    </div>
                                </div>
                            </div>
                            <div class="fut-name">TU APODO</div>
                            <div class="fut-stats-row">
                                <div class="fut-stat-item" title="Récord máximo en StadiumGuessr"><span class="fut-stat-num">${maxScoreTxt}</span><span class="fut-stat-label">MAX</span></div>
                                <div class="fut-stat-item" title="Partidos 1v1 jugados"><span class="fut-stat-num">52</span><span class="fut-stat-label">PJ</span></div>
                                <div class="fut-stat-item" title="Partidos 1v1 ganados"><span class="fut-stat-num">42</span><span class="fut-stat-label">PG</span></div>
                                <div class="fut-stat-item" title="Efectividad en 1v1 (% victorias)"><span class="fut-stat-num">81%</span><span class="fut-stat-label">WR</span></div>
                                <div class="fut-stat-item" title="XP total acumulado"><span class="fut-stat-num">38.2K</span><span class="fut-stat-label">XP</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: RESUMEN -->
                <div class="summary-column">
                    <div class="score-highlight-card">
                        <div class="score-label-group">
                            <span class="score-small-title">Puntuación Total</span>
                            <div class="score-big-num">${config.puntuacionTotal.toLocaleString('es-AR')} <span class="score-max-tag">/ 25.000 PTS</span></div>
                        </div>
                        <div class="score-xp-badge">
                            ⚡ +${config.puntuacionTotal.toLocaleString('es-AR')} XP
                        </div>
                    </div>

                    <div class="summary-header">🏟️ ESTADIOS DE ESTE RETO:</div>
                    <div class="summary-list">
                        ${stadiumsRowsHtml}
                    </div>
                </div>
            </div>

            <div class="cta-card">
                👉 ¿PODÉS SUPERAR MI PUNTAJE Y MEJORAR TU CARTA? 👀
                <span class="cta-sub">JUGALO EN WWW.ESTADIOSVIRTUALES.COM</span>
            </div>

            <div class="follow-sub-pill">
                🔔 Seguinos para jugar el reto diario de mañana
            </div>
        </div>
    </body>
    </html>
    `;

    await finalPage.setContent(finalScreenHtml, { waitUntil: 'load' });
    const finalModalEl = await finalPage.$('#final-modal');
    const finalModalPath = path.join(assetsDir, 'ui_final_results_modal.png');
    await finalModalEl.screenshot({ path: finalModalPath, omitBackground: true });
    await finalPage.close();
    console.log('✅ Pantalla final de resultados Wordle generada.');

    await browser.close();
}

// ==========================================
// 4. GENERADOR DE PORTADA MISTERIO (3:4 SAFE ZONE)
// ==========================================
async function generarPortadaReto(config, outFolder, bgFramePath) {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const bgBase64 = fs.readFileSync(bgFramePath).toString('base64');

    const htmlPortada = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { width: 1080px; height: 1920px; background: #000; overflow: hidden; position: relative; }
            .bg-drone {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: url('data:image/jpeg;base64,${bgBase64}') center center no-repeat;
                background-size: cover;
                filter: brightness(0.65) contrast(1.1);
            }
            .vignette {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle at center, rgba(10,16,28,0.2) 0%, rgba(5,8,15,0.92) 100%);
            }
            .safe-zone-box {
                position: absolute;
                top: 240px;
                left: 50px;
                width: 980px;
                height: 1440px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 28px;
                text-align: center;
            }
            .badge-live {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: rgba(0, 230, 118, 0.15);
                border: 2px solid #00e676;
                color: #00e676;
                font-size: 24px;
                font-weight: 900;
                padding: 10px 30px;
                border-radius: 40px;
                letter-spacing: 2px;
                box-shadow: 0 0 25px rgba(0,230,118,0.3);
            }
            .main-title {
                color: #ffffff;
                font-size: 60px;
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -1.5px;
                text-shadow: 0 10px 30px rgba(0,0,0,0.9);
            }
            .main-title span { color: #ffd700; }
            .mystery-card {
                background: linear-gradient(135deg, rgba(14, 22, 38, 0.95) 0%, rgba(9, 14, 24, 0.98) 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 28px;
                padding: 24px 36px;
                max-width: 860px;
                box-shadow: 0 18px 50px rgba(0,0,0,0.85);
            }
            .mystery-card p {
                color: #ffffff;
                font-size: 32px;
                font-weight: 800;
                line-height: 1.3;
            }
            .mystery-card b { color: #00e676; }
            .challenge-pill {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #000;
                font-size: 32px;
                font-weight: 900;
                padding: 18px 46px;
                border-radius: 40px;
                box-shadow: 0 12px 35px rgba(255, 190, 0, 0.5);
                border: 3px solid #fff;
            }
            .url-tag {
                color: #38bdf8;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: 1px;
            }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>
        <div class="safe-zone-box">
            <div class="badge-live">RETO DIARIO #${config.numeroReto}</div>
            <div class="main-title">5 ESTADIOS · <span>25.000 PTS</span><br>¿CUÁNTOS SACÁS HOY? ⚽</div>
            <div class="mystery-card">
                <p>${config.descripcionPortada || '📍 5 templos del fútbol en el mapa satelital. <b>¿Te da para el 5/5?</b>'}</p>
            </div>
            <div class="challenge-pill">¿PODÉS SUPERARME? 🏆</div>
            <div class="url-tag">JUGALO GRATIS EN: WWW.ESTADIOSVIRTUALES.COM</div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlPortada, { waitUntil: 'load' });
    const portadaPath = path.join(outFolder, config.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada misterio 3:4 guardada: ${portadaPath}`);
}

// ==========================================
// 5. RENDERIZADO FINAL DEL VIDEO (35s) CON FFMPEG
// ==========================================
async function renderizarRetoDiario(targetKey = '2') {
    const config = RETOS_DATABASE[targetKey] || RETOS_DATABASE['2'];
    if (!config) {
        throw new Error(`Reto diario "${targetKey}" no encontrado en base de datos.`);
    }

    console.log(`\n========================================================`);
    console.log(`🎬 RENDERIZANDO RETO DIARIO: ${config.id}`);
    console.log(`========================================================\n`);

    const outFolder = path.join(BASE_OUTPUT_DIR, config.id);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    const assetsDir = path.join(__dirname, 'assets_reto_diario_master');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 1. Guardar textos de publicación
    generarArchivoTextos(config, outFolder);
    console.log('✅ Archivo TEXTOS_PUBLICACION.txt generado.');

    // 2. Extraer frame de fondo para portada desde la primera cancha (Huracán)
    const bgFramePath = path.join(assetsDir, 'raw_bg_frame.jpg');
    await new Promise((resolve) => {
        const p = spawn('ffmpeg', [
            '-y',
            '-ss', '00:00:04',
            '-i', config.rondas[0].videoPath,
            '-vframes', '1',
            '-q:v', '2',
            bgFramePath
        ]);
        p.on('close', resolve);
    });

    // 3. Generar Portada 3:4 Safe Zone
    await generarPortadaReto(config, outFolder, bgFramePath);

    // 4. Generar Overlays, Headers, Pistas y Mapas Leaflet
    await generarOverlaysYMapas(config, assetsDir);

    // 5. Generar Audio Procedural de 35.0s
    const audioPath = path.join(assetsDir, 'audio_reto_diario.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(35.0));
    console.log('✅ Audio procedural (35s) sintetizado (cero whoosh, campanas y fanfarria).');

    // 6. Preparar clips de video de los 5 estadios
    // Cada cancha: 6.0s exactos. Al final: 5.0s para la pantalla de resultados (usando clip 5 de Central)
    // Ronda 1: Huracán (0s - 6s)
    // Ronda 2: Newell's (6s - 12s)
    // Ronda 3: Lanús (12s - 18s)
    // Ronda 4: Atlético Tucumán (18s - 24s)
    // Ronda 5: Central (24s - 30s)
    // Cierre: Central drone continuado (30s - 35s)

    const videoOutPath = path.join(outFolder, config.videoFileName);

    // Timeline de FFmpeg:
    // Inputs:
    // 0: Huracan video
    // 1: Newells video
    // 2: Lanus video
    // 3: ATucuman video
    // 4: Central video
    // 5: Audio procedural (audio_reto_diario.wav)
    // 6..10: Headers Ronda 1 a 5
    // 11..15: Clues Ronda 1 a 5
    // 16..20: Mapas Leaflet Ronda 1 a 5
    // 21: Final Results Modal

    const filterComplex = [
        // 1. Recortar 6s de cada video y normalizar escala/fps para concat perfecto
        `[0:v]trim=start=3:end=9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v0]`,
        `[1:v]trim=start=3:end=9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v1]`,
        `[2:v]trim=start=3:end=9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v2]`,
        `[3:v]trim=start=3:end=9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v3]`,
        `[4:v]trim=start=3:end=9,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v4]`,
        `[4:v]trim=start=9:end=14,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v5_end]`,
        // Concatenar en un único stream de 35s y dividir en 2 para fondo y primer plano
        `[v0][v1][v2][v3][v4][v5_end]concat=n=6:v=1:a=0,split=2[df1][df2]`,
        // Fondo difuminado cinemático (1080x1920)
        `[df1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg]`,
        // Video 16:9 nítido centrado (1080x608 a y=656)
        `[df2]scale=1080:608[fg]`,
        `[bg][fg]overlay=0:656[base]`,

        // Escalar los mapas Leaflet (960x460)
        `[16:v]scale=960:460[map1_sc]`,
        `[17:v]scale=960:460[map2_sc]`,
        `[18:v]scale=960:460[map3_sc]`,
        `[19:v]scale=960:460[map4_sc]`,
        `[20:v]scale=960:460[map5_sc]`,

        // Aplicar Headers superiores (y=50, x=50)
        `[base][6:v]overlay=50:50:enable='between(t,0,6)'[vh1]`,
        `[vh1][7:v]overlay=50:50:enable='between(t,6,12)'[vh2]`,
        `[vh2][8:v]overlay=50:50:enable='between(t,12,18)'[vh3]`,
        `[vh3][9:v]overlay=50:50:enable='between(t,18,24)'[vh4]`,
        `[vh4][10:v]overlay=50:50:enable='between(t,24,30)'[vh5]`,

        // Aplicar Pistas inferiores (y=1330, x=50)
        `[vh5][11:v]overlay=50:1330:enable='between(t,0,3.5)'[vc1]`,
        `[vc1][12:v]overlay=50:1330:enable='between(t,6,9.5)'[vc2]`,
        `[vc2][13:v]overlay=50:1330:enable='between(t,12,15.5)'[vc3]`,
        `[vc3][14:v]overlay=50:1330:enable='between(t,18,21.5)'[vc4]`,
        `[vc4][15:v]overlay=50:1330:enable='between(t,24,27.5)'[vc5]`,

        // Aplicar Mapas Leaflet inferiores (y=1320, x=60)
        `[vc5][map1_sc]overlay=60:1320:enable='between(t,3.5,6)'[vm1]`,
        `[vm1][map2_sc]overlay=60:1320:enable='between(t,9.5,12)'[vm2]`,
        `[vm2][map3_sc]overlay=60:1320:enable='between(t,15.5,18)'[vm3]`,
        `[vm3][map4_sc]overlay=60:1320:enable='between(t,21.5,24)'[vm4]`,
        `[vm4][map5_sc]overlay=60:1320:enable='between(t,27.5,30)'[vm5]`,

        // Pantalla final Wordle de Resultados (30s a 35s, centrada x=50, vertical centrada)
        `[vm5][21:v]overlay=50:(H-h)/2:enable='between(t,30,35)'[outv]`
    ].join(';');

    const ffmpegArgs = [
        '-y',
        '-t', '35',
        '-i', config.rondas[0].videoPath,                        // 0
        '-i', config.rondas[1].videoPath,                        // 1
        '-i', config.rondas[2].videoPath,                        // 2
        '-i', config.rondas[3].videoPath,                        // 3
        '-i', config.rondas[4].videoPath,                        // 4
        '-i', audioPath,                                         // 5
        '-i', path.join(assetsDir, 'ui_header_ronda_1.png'),     // 6
        '-i', path.join(assetsDir, 'ui_header_ronda_2.png'),     // 7
        '-i', path.join(assetsDir, 'ui_header_ronda_3.png'),     // 8
        '-i', path.join(assetsDir, 'ui_header_ronda_4.png'),     // 9
        '-i', path.join(assetsDir, 'ui_header_ronda_5.png'),     // 10
        '-i', path.join(assetsDir, 'ui_clue_ronda_1.png'),       // 11
        '-i', path.join(assetsDir, 'ui_clue_ronda_2.png'),       // 12
        '-i', path.join(assetsDir, 'ui_clue_ronda_3.png'),       // 13
        '-i', path.join(assetsDir, 'ui_clue_ronda_4.png'),       // 14
        '-i', path.join(assetsDir, 'ui_clue_ronda_5.png'),       // 15
        '-i', path.join(assetsDir, 'mapa_ronda_1.png'),          // 16
        '-i', path.join(assetsDir, 'mapa_ronda_2.png'),          // 17
        '-i', path.join(assetsDir, 'mapa_ronda_3.png'),          // 18
        '-i', path.join(assetsDir, 'mapa_ronda_4.png'),          // 19
        '-i', path.join(assetsDir, 'mapa_ronda_5.png'),          // 20
        '-i', path.join(assetsDir, 'ui_final_results_modal.png'),// 21
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '5:a',
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

    console.log(`🎬 Procesando video con FFmpeg hacia: ${videoOutPath}...`);
    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', ffmpegArgs);
        let errorOutput = '';
        ff.stderr.on('data', (d) => {
            const msg = d.toString();
            errorOutput += msg;
            const timeMatch = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch) {
                process.stdout.write(`⏱️ Progreso: ${timeMatch[1]} / 00:00:35.00\r`);
            }
        });
        ff.on('close', (code) => {
            if (code === 0) {
                console.log(`\n🎉 ¡VIDEO DE RETO DIARIO FINALIZADO CON ÉXITO! -> ${videoOutPath}`);
                resolve();
            } else {
                reject(new Error(`FFmpeg falló con código ${code}: ${errorOutput.slice(-500)}`));
            }
        });
    });

    // Limpieza de carpeta temporal de assets
    try {
        fs.rmSync(assetsDir, { recursive: true, force: true });
        console.log('🧹 Limpieza de assets temporales completada.');
    } catch (_) {}
}

async function main() {
    let args = process.argv.slice(2);
    if (args.length === 0) args = ['2'];
    if (args.includes('all')) {
        args = ['1', '2', '3', '4', '5', '6', '7'];
    }

    for (let i = 0; i < args.length; i++) {
        const key = args[i];
        console.log(`\n========================================================`);
        console.log(`🎬 PROCESANDO RETO DIARIO [${i + 1}/${args.length}]: ${key}`);
        console.log(`========================================================\n`);
        await renderizarRetoDiario(key);
    }
}

main().catch((err) => {
    console.error('❌ Error fatal al renderizar Retos Diarios:', err);
    process.exit(1);
});
