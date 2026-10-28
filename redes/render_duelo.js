const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_OUTPUT_DIR = "E:\\Google earth studio\\videos para mostrar\\DUELO DE CAPACIDAD";

// ==========================================
// CONFIGURACIÓN DE DUELOS
// ==========================================
const CONFIG_DUELOS = {
    'casla-huracan': {
        slug: 'SAN-LORENZO-VS-HURACAN',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico Porteño',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'El clásico de barrio más grande del mundo',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_San_Lorenzo_vs_Huracan.mp4',
        portadaFileName: 'Portada_Duelo_San_Lorenzo_Huracan.jpg',
        bannerDiferencia: '¡HURACÁN POR SOLO 350 LUGARES!',
        team1: {
            id: 'casla',
            nombre: 'SAN LORENZO',
            estadio: 'Pedro Bidegain',
            apodo: 'Nuevo Gasómetro',
            capacidadNum: 47964,
            capacidadTexto: '47.964 esp.',
            escudoFile: 'San Lorenzo.webp',
            borderColor: '#004080',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\casla(listo)x2\\casla.mp4",
            esGanador: false
        },
        team2: {
            id: 'huracan',
            nombre: 'HURACÁN',
            estadio: 'Tomás Adolfo Ducó',
            apodo: 'El Palacio',
            capacidadNum: 48314,
            capacidadTexto: '48.314 esp.',
            escudoFile: 'Huracan.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\huracan(listo)x2\\huracan.mp4",
            esGanador: true
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿SAN LORENZO O HURACÁN? 🏟️🔥
¿Sabías cuál de los dos estadios del clásico de barrio tiene más capacidad oficial de espectadores? ¡El desenlace te va a sorprender! 😱

👉 ¿Acertaste o pensabas que era al revés? Dejanos tu voto en los comentarios.
🎮 Poné a prueba cuánto sabés de estadios en el link del perfil: estadiosvirtuales.com

#SanLorenzo #Huracan #ClasicoPorteño #NuevoGasometro #TomasAdolfoDuco #Estadios #FutbolArgentino #EstadiosVirtuales`
    },
    'river-boca': {
        slug: 'RIVER-VS-BOCA',
        tituloBadge: '🥊 Duelo de Capacidad · Superclásico',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'El Superclásico del Fútbol Argentino',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_River_vs_Boca.mp4',
        portadaFileName: 'Portada_Duelo_River_Boca.jpg',
        bannerDiferencia: '¡EL MONUMENTAL POR +27.000 LUGARES!',
        team1: {
            id: 'river',
            nombre: 'RIVER PLATE',
            estadio: 'Mâs Monumental',
            apodo: 'El Monumental',
            capacidadNum: 84567,
            capacidadTexto: '84.567 esp.',
            escudoFile: 'River.webp',
            borderColor: '#ff2233',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\Sin título.mp4",
            esGanador: true
        },
        team2: {
            id: 'boca',
            nombre: 'BOCA JUNIORS',
            estadio: 'Alberto J. Armando',
            apodo: 'La Bombonera',
            capacidadNum: 57200,
            capacidadTexto: '57.200 esp.',
            escudoFile: 'Boca.webp',
            borderColor: '#0044cc',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Bombonera(listo)\\Boca 2.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿RIVER O BOCA? 🏟️🔥
El Mâs Monumental vs La Bombonera. ¿Cuál tiene mayor capacidad oficial de público?

👉 Dejá tu respuesta en los comentarios antes de que termine la cuenta regresiva.
🎮 Desafiá tu conocimiento futbolero en: estadiosvirtuales.com

#RiverPlate #BocaJuniors #Superclasico #Monumental #LaBombonera #Estadios #FutbolArgentino #EstadiosVirtuales`
    },
    'lanus-banfield': {
        slug: 'LANUS-VS-BANFIELD',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico del Sur',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'El histórico Clásico del Sur',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Lanus_vs_Banfield.mp4',
        portadaFileName: 'Portada_Duelo_Lanus_Banfield.jpg',
        bannerDiferencia: '¡LANÚS POR +12.000 LUGARES!',
        team1: {
            id: 'lanus',
            nombre: 'LANÚS',
            estadio: 'Ciudad de Lanús',
            apodo: 'La Fortaleza',
            capacidadNum: 47027,
            capacidadTexto: '47.027 esp.',
            escudoFile: 'Lanus.webp',
            borderColor: '#82132b',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\lanus(listo)x2\\lanus.mp4",
            esGanador: true
        },
        team2: {
            id: 'banfield',
            nombre: 'BANFIELD',
            estadio: 'Florencio Sola',
            apodo: 'El Lencho',
            capacidadNum: 34901,
            capacidadTexto: '34.901 esp.',
            escudoFile: 'Banfield.webp',
            borderColor: '#008040',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\banfield(listo)x2\\banfield.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿LANÚS O BANFIELD? 🏟️🔥
La Fortaleza vs El Lencho. ¿Cuál de las dos canchas del Clásico del Sur tiene mayor capacidad de hinchas?

👉 Comentá tu voto antes de que se devele el resultado.
🎮 Poné a prueba cuánto sabés de canchas en: estadiosvirtuales.com

#Lanus #Banfield #ClasicoDelSur #LaFortaleza #FlorencioSola #Estadios #FutbolArgentino #EstadiosVirtuales`
    },
    'estudiantes-gimnasia': {
        slug: 'ESTUDIANTES-VS-GIMNASIA',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico Platense',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La pasión de la Ciudad de La Plata',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Estudiantes_vs_Gimnasia.mp4',
        portadaFileName: 'Portada_Duelo_Estudiantes_Gimnasia.jpg',
        bannerDiferencia: '¡ESTUDIANTES POR APENAS 1.557 LUGARES!',
        team1: {
            id: 'estudiantes',
            nombre: 'ESTUDIANTES',
            estadio: 'Jorge Luis Hirschi',
            apodo: 'Estadio UNO',
            capacidadNum: 32530,
            capacidadTexto: '32.530 esp.',
            escudoFile: 'Estudiantes.webp',
            borderColor: '#d60000',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\EDLPx2\\Estadio UNO Jorge Luis Hirschi.mp4",
            customCrop: 'scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960:(in_w-out_w)/2:0',
            esGanador: true
        },
        team2: {
            id: 'gimnasia',
            nombre: 'GIMNASIA LP',
            estadio: 'Juan Carmelo Zerillo',
            apodo: 'El Bosque',
            capacidadNum: 30973,
            capacidadTexto: '30.973 esp.',
            escudoFile: 'Gimnasia.webp',
            borderColor: '#002f6c',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\gelp.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿ESTUDIANTES O GIMNASIA? 🏟️🔥
El nuevo Estadio UNO vs El mítico Bosque Platense. ¿Cuál de los dos alberga mayor cantidad de público?

👉 ¿Sabías la diferencia o te sorprendió? Dejá tu respuesta en los comentarios.
🎮 Desafiá tu conocimiento futbolero en: estadiosvirtuales.com

#Estudiantes #GELP #GimnasiaLP #ClasicoPlatense #EstadioUNO #ElBosque #LaPlata #FutbolArgentino #EstadiosVirtuales`
    },
    'central-newells': {
        slug: 'CENTRAL-VS-NEWELLS',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico Rosarino',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La máxima pasión de la ciudad de Rosario',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Central_vs_Newells.mp4',
        portadaFileName: 'Portada_Duelo_Central_Newells.jpg',
        bannerDiferencia: '¡CENTRAL POR CASI 5.000 LUGARES!',
        team1: {
            id: 'central',
            nombre: 'ROSARIO CENTRAL',
            estadio: 'Gigante de Arroyito',
            apodo: 'El Gigante',
            capacidadNum: 46955,
            capacidadTexto: '46.955 esp.',
            escudoFile: 'Rosario Central.webp',
            borderColor: '#003399',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\central.mp4",
            esGanador: true
        },
        team2: {
            id: 'newells',
            nombre: "NEWELL'S",
            estadio: 'Marcelo Bielsa',
            apodo: 'El Coloso',
            capacidadNum: 42000,
            capacidadTexto: '42.000 esp.',
            escudoFile: 'Newells.webp',
            borderColor: '#cc0000',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\newells.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿ROSARIO CENTRAL O NEWELL'S? 🏟️🔥
El Gigante de Arroyito vs El Coloso Marcelo Bielsa. ¿Cuál de los dos templos del Clásico Rosarino tiene mayor capacidad oficial de espectadores? 😱

👉 ¿Acertaste o pensabas que era al revés? Dejanos tu voto en los comentarios.
🎮 Poné a prueba cuánto sabés de estadios en el link del perfil: estadiosvirtuales.com

#RosarioCentral #Newells #ClasicoRosarino #GiganteDeArroyito #ColosoMarceloBielsa #ElColoso #Estadios #FutbolArgentino #EstadiosVirtuales`
    },
    'losandes-chicago': {
        slug: 'LOS-ANDES-VS-NUEVA-CHICAGO',
        tituloBadge: '🥊 Duelo de Capacidad · Lomas vs Mataderos',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'Duelo de gigantes históricos del ascenso',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Los_Andes_vs_Nueva_Chicago.mp4',
        portadaFileName: 'Portada_Duelo_Los_Andes_Nueva_Chicago.jpg',
        bannerDiferencia: '¡LOS ANDES POR CASI 12.000 LUGARES!',
        team1: {
            id: 'losandes',
            nombre: 'LOS ANDES',
            estadio: 'Eduardo Gallardón',
            apodo: 'El Gallardón',
            capacidadNum: 36900,
            capacidadTexto: '36.900 esp.',
            escudoFile: 'Losandes.webp',
            borderColor: '#e60000',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque B\\Los andes.mp4",
            esGanador: true
        },
        team2: {
            id: 'chicago',
            nombre: 'NUEVA CHICAGO',
            estadio: 'República de Mataderos',
            apodo: 'Mataderos',
            capacidadNum: 25000,
            capacidadTexto: '25.000 esp.',
            escudoFile: 'Chicago.webp',
            borderColor: '#008040',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque A\\Nueva Chicago.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿LOS ANDES O NUEVA CHICAGO? 🏟️🔥
El Eduardo Gallardón de Lomas de Zamora vs la República de Mataderos. ¿Cuál de estos dos estadios históricos tiene mayor capacidad de hinchas? 😱

👉 ¿Acertaste o pensabas que era al revés? Dejanos tu voto en los comentarios.
🎮 Poné a prueba cuánto sabés de estadios en el link del perfil: estadiosvirtuales.com

#LosAndes #NuevaChicago #EduardoGallardon #RepublicaDeMataderos #Milrayitas #ToritoDeMataderos #Estadios #FutbolArgentino #EstadiosVirtuales`
    },
    'river-maracana': {
        slug: 'RIVER-VS-MARACANA',
        tituloBadge: '🥊 Duelo de Capacidad · Choque de Gigantes',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'El Coloso Argentino vs El Templo Brasileño',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_River_vs_Maracana.mp4',
        portadaFileName: 'Portada_Duelo_River_Maracana.jpg',
        bannerDiferencia: '¡EL MONUMENTAL POR +5.700 LUGARES!',
        team1: {
            id: 'river',
            nombre: 'RIVER PLATE',
            estadio: 'Mâs Monumental',
            apodo: 'El Monumental',
            capacidadNum: 84567,
            capacidadTexto: '84.567 esp.',
            escudoFile: 'River.webp',
            borderColor: '#ff2233',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Monumental(listo)\\Sin título.mp4",
            esGanador: true
        },
        team2: {
            id: 'maracana',
            nombre: 'MARACANÃ',
            estadio: 'Jornalista Mário Filho',
            apodo: 'El Maracaná',
            capacidadNum: 78838,
            capacidadTexto: '78.838 esp.',
            escudoFile: 'Flamengo.webp',
            borderColor: '#cc0000',
            videoPath: "E:\\Google earth studio\\Brasil\\Maracaná.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿EL MONUMENTAL O EL MARACANÁ? 🏟️🔥
El Mâs Monumental de River Plate vs el legendario Maracaná de Río de Janeiro. ¿Cuál de estos dos gigantes de Sudamérica tiene hoy mayor capacidad oficial de público? 😱

👉 ¿Acertaste o pensabas que era al revés? Dejanos tu voto en los comentarios.
🎮 Poné a prueba cuánto sabés de estadios en el link del perfil: estadiosvirtuales.com

#RiverPlate #Maracana #Monumental #Flamengo #Fluminense #Estadios #FutbolSudamericano #EstadiosVirtuales`
    },
    'madrid-barca': {
        slug: 'MADRID-VS-BARCELONA',
        tituloBadge: '🥊 Duelo de Capacidad · El Clásico',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La mayor rivalidad del fútbol mundial',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Real_Madrid_vs_Barcelona.mp4',
        portadaFileName: 'Portada_Duelo_Real_Madrid_Barcelona.jpg',
        bannerDiferencia: '¡CAMP NOU POR CASI 15.000 LUGARES!',
        team1: {
            id: 'madrid',
            nombre: 'REAL MADRID',
            estadio: 'Santiago Bernabéu',
            apodo: 'El Bernabéu',
            capacidadNum: 84744,
            capacidadTexto: '84.744 esp.',
            escudoFile: 'Real.webp',
            borderColor: '#ffd700',
            videoPath: "E:\\Google earth studio\\España\\Bloque A\\bernabeu.mp4",
            esGanador: false
        },
        team2: {
            id: 'barca',
            nombre: 'FC BARCELONA',
            estadio: 'Spotify Camp Nou',
            apodo: 'El Camp Nou',
            capacidadNum: 99354,
            capacidadTexto: '99.354 esp.',
            escudoFile: 'Barca.webp',
            borderColor: '#a50044',
            videoPath: "E:\\Google earth studio\\España\\Spotify Camp Nou_ Barcelona.mp4",
            esGanador: true
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿SANTIAGO BERNABÉU O SPOTIFY CAMP NOU? 🏟️🔥
El nuevo Santiago Bernabéu vs el imponente Spotify Camp Nou. ¿Cuál de los dos colosos del fútbol español tiene mayor capacidad oficial de espectadores? 😱

👉 ¿Acertaste o pensabas que con las reformas era al revés? Dejá tu voto en los comentarios.
🎮 Desafiá tu conocimiento futbolero en: estadiosvirtuales.com

#RealMadrid #FCBarcelona #ElClasico #SantiagoBernabeu #CampNou #HalaMadrid #ViscaBarca #Estadios #EstadiosVirtuales`
    },
    'corinthians-palmeiras': {
        slug: 'CORINTHIANS-VS-PALMEIRAS',
        tituloBadge: '🥊 Duelo de Capacidad · O Derby Paulista',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La máxima rivalidad del estado de São Paulo',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Corinthians_vs_Palmeiras.mp4',
        portadaFileName: 'Portada_Duelo_Corinthians_Palmeiras.jpg',
        bannerDiferencia: '¡CORINTHIANS POR +5.400 LUGARES!',
        team1: {
            id: 'corinthians',
            nombre: 'CORINTHIANS',
            estadio: 'Neo Química Arena',
            apodo: 'Arena Corinthians',
            capacidadNum: 49205,
            capacidadTexto: '49.205 esp.',
            escudoFile: 'Corinthians.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Brasil\\Neo Química Arena_ Corinthians.mp4",
            esGanador: true
        },
        team2: {
            id: 'palmeiras',
            nombre: 'PALMEIRAS',
            estadio: 'Allianz Parque',
            apodo: 'O Verdão',
            capacidadNum: 43713,
            capacidadTexto: '43.713 esp.',
            escudoFile: 'Palmeiras.webp',
            borderColor: '#006437',
            videoPath: "E:\\Google earth studio\\Brasil\\Allianz Parque_ Sociedade Esportiva Palmeiras.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿CORINTHIANS O PALMEIRAS? 🏟️🔥
La Neo Química Arena del Timão vs el Allianz Parque del Verdão. ¿Cuál de los dos templos del Derby Paulista tiene mayor capacidad oficial? 😱

👉 ¿Sabías la diferencia o te sorprendió el resultado? Comentá abajo 👇
🎮 Poné a prueba cuánto sabés de canchas en el link del perfil: estadiosvirtuales.com

#Corinthians #Palmeiras #DerbyPaulista #NeoQuimicaArena #AllianzParque #Timao #Verdao #Brasileirao #Estadios #EstadiosVirtuales`
    },
    'betis-sevilla': {
        slug: 'BETIS-VS-SEVILLA',
        tituloBadge: '🥊 Duelo de Capacidad · El Gran Derbi',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La pasión del fútbol de Sevilla',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Betis_vs_Sevilla.mp4',
        portadaFileName: 'Portada_Duelo_Betis_Sevilla.jpg',
        bannerDiferencia: '¡EL BETIS POR CASI 17.000 LUGARES!',
        team1: {
            id: 'betis',
            nombre: 'REAL BETIS',
            estadio: 'Benito Villamarín',
            apodo: 'El Villamarín',
            capacidadNum: 60721,
            capacidadTexto: '60.721 esp.',
            escudoFile: 'Betis.webp',
            borderColor: '#0bb364',
            videoPath: "E:\\Google earth studio\\España\\Bloque A\\Estadio Benito Villamarín_ Real Betis.mp4",
            esGanador: true
        },
        team2: {
            id: 'sevilla',
            nombre: 'SEVILLA FC',
            estadio: 'Ramón Sánchez-Pizjuán',
            apodo: 'El Sánchez-Pizjuán',
            capacidadNum: 43883,
            capacidadTexto: '43.883 esp.',
            escudoFile: 'Sevilla.webp',
            borderColor: '#d4001f',
            videoPath: "E:\\Google earth studio\\España\\Bloque A\\Estadio Ramón Sánchez-Pizjuán_ Sevilla FC.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿REAL BETIS O SEVILLA FC? 🏟️🔥
El Benito Villamarín vs el Ramón Sánchez-Pizjuán. ¿Cuál de las dos canchas del Gran Derbi de Sevilla tiene mayor capacidad de hinchas? 😱

👉 ¿Sabías la tremenda diferencia o pensabas que era al revés? Dejanos tu voto en los comentarios.
🎮 Jugá la trivia de estadios gratis en: estadiosvirtuales.com

#RealBetis #SevillaFC #ElGranDerbi #BenitoVillamarin #SanchezPizjuan #LaLiga #FutbolEspañol #Estadios #EstadiosVirtuales`
    },
    'madrid-atleti': {
        slug: 'MADRID-VS-ATLETICO',
        tituloBadge: '🥊 Duelo de Capacidad · Derbi Madrileño',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'El derbi de la capital española',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Real_Madrid_vs_Atletico.mp4',
        portadaFileName: 'Portada_Duelo_Real_Madrid_Atletico.jpg',
        bannerDiferencia: '¡EL BERNABÉU POR +14.000 LUGARES!',
        team1: {
            id: 'madrid',
            nombre: 'REAL MADRID',
            estadio: 'Santiago Bernabéu',
            apodo: 'El Bernabéu',
            capacidadNum: 84744,
            capacidadTexto: '84.744 esp.',
            escudoFile: 'Real.webp',
            borderColor: '#ffd700',
            videoPath: "E:\\Google earth studio\\España\\Bloque A\\bernabeu.mp4",
            esGanador: true
        },
        team2: {
            id: 'atleti',
            nombre: 'ATLÉTICO DE MADRID',
            estadio: 'Cívitas Metropolitano',
            apodo: 'El Metropolitano',
            capacidadNum: 70460,
            capacidadTexto: '70.460 esp.',
            escudoFile: 'AMadrid.webp',
            borderColor: '#cb3524',
            videoPath: "E:\\Google earth studio\\España\\Riyadh Air Metropolitano Club Atlético de Madrid.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿REAL MADRID O ATLÉTICO DE MADRID? 🏟️🔥
El nuevo Santiago Bernabéu vs el imponente Cívitas Metropolitano. ¿Cuál de los dos gigantes de la capital española tiene mayor aforo oficial? 😱

👉 ¿Acertaste o pensabas que estaban más parejos? Dejá tu voto en los comentarios.
🎮 Desafiá tu conocimiento futbolero en: estadiosvirtuales.com

#RealMadrid #Atleti #AtleticoDeMadrid #DerbiMadrileño #SantiagoBernabeu #CivitasMetropolitano #LaLiga #EstadiosVirtuales`
    },
    'man-united-man-city': {
        slug: 'MANCHESTER-UNITED-VS-MANCHESTER-CITY',
        pais: 'Inglaterra',
        tituloBadge: '🥊 Duelo de Capacidad · Derbi de Manchester',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La gran batalla de Manchester',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Man_United_vs_Man_City.mp4',
        portadaFileName: 'Portada_Duelo_Man_United_Man_City.jpg',
        bannerDiferencia: '¡EL UNITED POR CASI 21.000 LUGARES!',
        team1: {
            id: 'man_united',
            nombre: 'MANCHESTER UNITED',
            estadio: 'Old Trafford',
            apodo: 'Teatro de los Sueños',
            capacidadNum: 74310,
            capacidadTexto: '74.310 esp.',
            escudoFile: 'manchesterunited.webp',
            borderColor: '#da291c',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Old Trafford_ Manchester United.mp4",
            esGanador: true
        },
        team2: {
            id: 'man_city',
            nombre: 'MANCHESTER CITY',
            estadio: 'Etihad Stadium',
            apodo: 'Etihad Stadium',
            capacidadNum: 53400,
            capacidadTexto: '53.400 esp.',
            escudoFile: 'manchestercity.webp',
            borderColor: '#6cabdd',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Etihad Stadium_ Manchester City.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿MANCHESTER UNITED O MANCHESTER CITY? 🏟️🔥
Old Trafford vs el Etihad Stadium. ¿Cuál de los dos colosos del Derbi de Manchester tiene mayor capacidad oficial de espectadores? 😱

👉 ¿Acertaste o pensabas que la diferencia era menor? Dejanos tu voto en los comentarios.
🎮 Poné a prueba cuánto sabés de canchas en el link del perfil: estadiosvirtuales.com

#ManchesterUnited #ManchesterCity #ManchesterDerby #OldTrafford #EtihadStadium #PremierLeague #FutbolIngles #EstadiosVirtuales`
    },
    'tottenham-arsenal': {
        slug: 'TOTTENHAM-VS-ARSENAL',
        pais: 'Inglaterra',
        tituloBadge: '🥊 Duelo de Capacidad · Norte de Londres',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'El Derbi del Norte de Londres',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Tottenham_vs_Arsenal.mp4',
        portadaFileName: 'Portada_Duelo_Tottenham_Arsenal.jpg',
        bannerDiferencia: '¡TOTTENHAM POR APENAS 2.146 LUGARES!',
        team1: {
            id: 'tottenham',
            nombre: 'TOTTENHAM',
            estadio: 'Tottenham Hotspur Stadium',
            apodo: 'Spurs Stadium',
            capacidadNum: 62850,
            capacidadTexto: '62.850 esp.',
            escudoFile: 'tottenham.webp',
            borderColor: '#132257',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Tottenham Hotspur Stadium.mp4",
            esGanador: true
        },
        team2: {
            id: 'arsenal',
            nombre: 'ARSENAL',
            estadio: 'Emirates Stadium',
            apodo: 'Emirates',
            capacidadNum: 60704,
            capacidadTexto: '60.704 esp.',
            escudoFile: 'arsenal.webp',
            borderColor: '#ef0107',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Emirates Stadium_ Arsenal.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿TOTTENHAM O ARSENAL? 🏟️🔥
El ultramoderno Tottenham Hotspur Stadium vs el Emirates Stadium de los Gunners. ¿Cuál de los dos templos del Norte de Londres tiene más aforo? 😱

👉 ¡Duelo súper ajustado! ¿Acertaste o pensabas que ganaba Arsenal? Comentá abajo 👇
🎮 Jugá la trivia de estadios gratis en: estadiosvirtuales.com

#Tottenham #Arsenal #NorthLondonDerby #Spurs #Gunners #EmiratesStadium #PremierLeague #EstadiosVirtuales`
    },
    'man-united-liverpool': {
        slug: 'MANCHESTER-UNITED-VS-LIVERPOOL',
        pais: 'Inglaterra',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico de Inglaterra',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La rivalidad más histórica del fútbol inglés',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Man_United_vs_Liverpool.mp4',
        portadaFileName: 'Portada_Duelo_Man_United_Liverpool.jpg',
        bannerDiferencia: '¡OLD TRAFFORD POR +13.000 LUGARES!',
        team1: {
            id: 'man_united',
            nombre: 'MANCHESTER UNITED',
            estadio: 'Old Trafford',
            apodo: 'Teatro de los Sueños',
            capacidadNum: 74310,
            capacidadTexto: '74.310 esp.',
            escudoFile: 'manchesterunited.webp',
            borderColor: '#da291c',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Old Trafford_ Manchester United.mp4",
            esGanador: true
        },
        team2: {
            id: 'liverpool',
            nombre: 'LIVERPOOL FC',
            estadio: 'Anfield',
            apodo: 'Anfield Road',
            capacidadNum: 61276,
            capacidadTexto: '61.276 esp.',
            escudoFile: 'liverpool.webp',
            borderColor: '#c8102e',
            videoPath: "E:\\Google earth studio\\Inglaterra\\Bloque A\\Anfield_ Liverpool FC.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿MANCHESTER UNITED O LIVERPOOL? 🏟️🔥
Old Trafford vs Anfield. Los dos gigantes del fútbol inglés cara a cara en un duelo de capacidad tremendo. 😱

👉 ¿Sabías la diferencia o creías que con la ampliación de Anfield estaban más cerca? Dejá tu voto 👇
🎮 Desafiá cuánto sabés de estadios en el link del perfil: estadiosvirtuales.com

#ManchesterUnited #Liverpool #NorthWestDerby #OldTrafford #Anfield #PremierLeague #YNWA #EstadiosVirtuales`
    },
    'sanmartin-atletico-tucuman': {
        slug: 'SAN-MARTIN-VS-ATLETICO-TUCUMAN',
        pais: 'Argentina',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico Tucumano',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La máxima pasión del Norte Argentino',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_San_Martin_vs_Atletico_Tucuman.mp4',
        portadaFileName: 'Portada_Duelo_San_Martin_Atletico_Tucuman.jpg',
        bannerDiferencia: '¡ATLÉTICO TUCUMÁN POR 4.700 LUGARES!',
        team1: {
            id: 'san_martin_tuc',
            nombre: 'SAN MARTÍN (T)',
            estadio: 'La Ciudadela',
            apodo: 'La Ciudadela',
            capacidadNum: 30500,
            capacidadTexto: '30.500 esp.',
            escudoFile: 'SMTucuman.webp',
            borderColor: '#e20613',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\San Martin de tucuman(listo)x2\\San Martín de Tucumán 4.mp4",
            esGanador: false
        },
        team2: {
            id: 'atletico_tucuman',
            nombre: 'ATLÉTICO TUCUMÁN',
            estadio: 'Monumental José Fierro',
            apodo: 'José Fierro',
            capacidadNum: 35200,
            capacidadTexto: '35.200 esp.',
            escudoFile: 'atucuman.webp',
            borderColor: '#0099cc',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\atl tucuman(listo)\\atl tucuman jose fierro.mp4",
            esGanador: true
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿SAN MARTÍN O ATLÉTICO TUCUMÁN? 🏟️🔥
La Ciudadela vs el Monumental José Fierro. ¿Cuál de los dos colosos del Clásico Tucumano tiene mayor capacidad oficial de público? 😱

👉 ¿Acertaste o pensabas que era al revés? Dejanos tu voto en los comentarios.
🎮 Poné a prueba cuánto sabés de canchas en el link del perfil: estadiosvirtuales.com

#SanMartinTucuman #AtleticoTucuman #ClasicoTucumano #LaCiudadela #JoseFierro #Tucuman #Estadios #FutbolArgentino #EstadiosVirtuales`
    },
    'colon-union': {
        slug: 'COLON-VS-UNION',
        pais: 'Argentina',
        tituloBadge: '🥊 Duelo de Capacidad · Clásico Santafesino',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'La fiesta del fútbol de Santa Fe',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_Colon_vs_Union.mp4',
        portadaFileName: 'Portada_Duelo_Colon_Union.jpg',
        bannerDiferencia: '¡COLÓN POR 13.000 LUGARES!',
        team1: {
            id: 'colon',
            nombre: 'COLÓN DE SANTA FE',
            estadio: 'Brigadier Estanislao López',
            apodo: 'Cementerio de Elefantes',
            capacidadNum: 40000,
            capacidadTexto: '40.000 esp.',
            escudoFile: 'Colon.webp',
            borderColor: '#e30613',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque A\\Colon 3.0.mp4",
            esGanador: true
        },
        team2: {
            id: 'union',
            nombre: 'UNIÓN DE SANTA FE',
            estadio: '15 de Abril',
            apodo: 'El 15 de Abril',
            capacidadNum: 27000,
            capacidadTexto: '27.000 esp.',
            escudoFile: 'Union.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\A\\Videos\\Subidos\\union.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿COLÓN O UNIÓN? 🏟️🔥
El Cementerio de los Elefantes vs el 15 de Abril. ¿Cuál de los dos templos del Clásico Santafesino tiene mayor capacidad oficial de espectadores? 😱

👉 ¿Sabías la tremenda diferencia o pensabas que estaban más parejos? Dejá tu voto 👇
🎮 Jugá la trivia de estadios gratis en: estadiosvirtuales.com

#Colon #Union #ClasicoSantafesino #CementerioDeLosElefantes #15DeAbril #SantaFe #FutbolArgentino #EstadiosVirtuales`
    },
    'allboys-atlanta': {
        slug: 'ALL-BOYS-VS-ATLANTA',
        pais: 'Argentina',
        tituloBadge: '🥊 Duelo de Capacidad · Floresta vs Villa Crespo',
        pregunta: '¿CUÁL TIENE MÁS CAPACIDAD?',
        subtitulo: 'Histórico clásico del ascenso porteño',
        subtituloVotacion: '¿Cuál es más grande? Votá en comentarios 🗳️',
        videoFileName: 'Duelo_Capacidad_All_Boys_vs_Atlanta.mp4',
        portadaFileName: 'Portada_Duelo_All_Boys_Atlanta.jpg',
        bannerDiferencia: '¡ALL BOYS POR +7.500 LUGARES!',
        team1: {
            id: 'all_boys',
            nombre: 'ALL BOYS',
            estadio: 'Islas Malvinas',
            apodo: 'Floresta',
            capacidadNum: 21500,
            capacidadTexto: '21.500 esp.',
            escudoFile: 'Allboys.webp',
            borderColor: '#ffffff',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\All Boys(listo)x2\\All Boys.mp4",
            esGanador: true
        },
        team2: {
            id: 'atlanta',
            nombre: 'ATLANTA',
            estadio: 'Don León Kolbowski',
            apodo: 'Villa Crespo',
            capacidadNum: 14000,
            capacidadTexto: '14.000 esp.',
            escudoFile: 'Atlanta.webp',
            borderColor: '#ffd700',
            videoPath: "E:\\Google earth studio\\Argentina\\Subidos\\B\\Bloque A\\Atlanta.mp4",
            esGanador: false
        },
        copy: `🥊 DUELO DE CAPACIDAD: ¿ALL BOYS O ATLANTA? 🏟️🔥
El Islas Malvinas de Floresta vs el Don León Kolbowski de Villa Crespo. ¿Cuál de estos dos estadios tradicionales del ascenso tiene mayor capacidad de público? 😱

👉 ¿Acertaste o pensabas que ganaba el Bohemio? Comentá abajo 👇
🎮 Poné a prueba cuánto sabés de canchas en el link del perfil: estadiosvirtuales.com

#AllBoys #Atlanta #Floresta #VillaCrespo #Albo #Bohemio #AscensoArgentino #EstadiosVirtuales`
    }
};

// ==========================================
// 1. GENERADOR DE AUDIO PROCEDURAL (20s)
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

    // 0.2s: Eliminado el whoosh inicial seco por pedido del usuario
    // addWhoosh(0.2, 0.8, 0.4);
    // 1.0s: Campana de inicio
    addBellDing(1.0, 784);

    // 11s, 12s, 13s: Cuenta regresiva
    addTick(11.0);
    addTick(12.0);
    addTick(13.0);

    // 14.0s: Revelación (campana limpia sin whoosh)
    // addWhoosh(13.8, 0.5, 0.4);
    addBellDing(14.0, 1046.5);

    // 14.1s: Fanfarria de victoria
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(14.1 + idx * 0.07, 3.0, freq, 0.35, 1.8);
    });

    // Eliminados whooshes de ambiente al final
    // for (let i = 0; i < 5; i++) {
    //     addWhoosh(14.5 + i * 1.1, 1.6, 0.25);
    // }

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
    console.log(`🎨 Generando overlays para: ${duelo.slug}...`);

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
                <div class="header-badge">${duelo.tituloBadge}</div>
                <div class="header-title">${duelo.pregunta}</div>
                <div class="header-sub">${duelo.subtitulo}</div>
            </div>

            <div class="club-pill team1">
                <img src="${escudo1Base64}" class="club-logo">
                <div>
                    <div class="club-info-name">${duelo.team1.nombre}</div>
                    <div class="club-info-stadium">${duelo.team1.apodo}</div>
                </div>
            </div>

            <div class="club-pill team2">
                <img src="${escudo2Base64}" class="club-logo">
                <div>
                    <div class="club-info-name">${duelo.team2.nombre}</div>
                    <div class="club-info-stadium">${duelo.team2.apodo}</div>
                </div>
            </div>

            ${contenidoCentro}
        </body>
        </html>
        `;
    }

    // 1. Overlay Votación
    const htmlVotacion = getBaseHTML(`
        <div style="position:absolute; top:915px; left:50px; width:980px; display:flex; align-items:center; justify-content:center; gap:20px;">
            <div style="flex:1; height:3px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
            <div style="background:linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color:#0b111e; width:90px; height:90px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:38px; font-weight:900; border:4px solid #ffffff; box-shadow:0 0 30px rgba(255,190,0,0.6);">VS</div>
            <div style="flex:1; height:3px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
            <div style="position:absolute; top:-50px; background:rgba(0,0,0,0.85); border:1.5px solid rgba(255,215,0,0.7); border-radius:20px; padding:6px 20px; color:#ffffff; font-size:19px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">${duelo.subtituloVotacion}</div>
        </div>
    `);
    await page.setContent(htmlVotacion, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_votacion.png'), omitBackground: true });

    // 2. Cuenta regresiva 3, 2, 1
    for (const num of [3, 2, 1]) {
        const htmlCount = getBaseHTML(`
            <div style="position:absolute; top:890px; left:50%; transform:translateX(-50%); width:140px; height:140px; border-radius:50%; background:radial-gradient(circle, #ff3344 0%, #aa0011 100%); border:5px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:80px; font-weight:900; color:#ffffff; box-shadow:0 0 45px rgba(255,51,68,0.9);">${num}</div>
        `);
        await page.setContent(htmlCount, { timeout: 5000 });
        await page.screenshot({ path: path.join(assetsDir, `overlay_count_${num}.png`), omitBackground: true });
    }

    // 3. Revelación de resultados (renderizado condicional según cuál es el ganador)
    const t1IsWinner = duelo.team1.esGanador;
    const cardTop1 = `
        <div style="position:absolute; top:790px; left:50px; width:980px; background:${t1IsWinner ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.96) 0%, rgba(0, 180, 80, 0.98) 100%)' : 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)'}; border:${t1IsWinner ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.25)'}; border-radius:24px; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 16px 40px rgba(0,0,0,0.8)${t1IsWinner ? ', 0 0 35px rgba(0, 230, 118, 0.5)' : ''};">
            <div style="display:flex; align-items:center; gap:16px; color:${t1IsWinner ? '#04160a' : '#ffffff'};">
                <img src="${escudo1Base64}" style="width:60px;height:60px;object-fit:contain;">
                <div>
                    ${t1IsWinner ? '<div style="background:#04160a; color:#00ff77; font-size:16px; font-weight:900; padding:4px 12px; border-radius:12px; text-transform:uppercase; letter-spacing:1.5px; display:inline-block;">🏆 GANADOR</div>' : ''}
                    <div style="font-size:34px; font-weight:900;">${duelo.team1.nombre}</div>
                </div>
            </div>
            <div style="font-size:46px; font-weight:900; color:${t1IsWinner ? '#04160a' : '#cbd5e1'}; letter-spacing:-0.5px;">${duelo.team1.capacidadTexto}</div>
        </div>
    `;

    const cardBottom2 = `
        <div style="position:absolute; top:1045px; left:50px; width:980px; background:${!t1IsWinner ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.96) 0%, rgba(0, 180, 80, 0.98) 100%)' : 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)'}; border:${!t1IsWinner ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.25)'}; border-radius:24px; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 16px 40px rgba(0,0,0,0.8)${!t1IsWinner ? ', 0 0 35px rgba(0, 230, 118, 0.5)' : ''};">
            <div style="display:flex; align-items:center; gap:16px; color:${!t1IsWinner ? '#04160a' : '#ffffff'};">
                <img src="${escudo2Base64}" style="width:60px;height:60px;object-fit:contain;">
                <div>
                    ${!t1IsWinner ? '<div style="background:#04160a; color:#00ff77; font-size:16px; font-weight:900; padding:4px 12px; border-radius:12px; text-transform:uppercase; letter-spacing:1.5px; display:inline-block;">🏆 GANADOR</div>' : ''}
                    <div style="font-size:34px; font-weight:900;">${duelo.team2.nombre}</div>
                </div>
            </div>
            <div style="font-size:46px; font-weight:900; color:${!t1IsWinner ? '#04160a' : '#cbd5e1'}; letter-spacing:-0.5px;">${duelo.team2.capacidadTexto}</div>
        </div>
    `;

    const htmlRevelacion = getBaseHTML(`
        ${cardTop1}
        <div style="position:absolute; top:925px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #ffd700 0%, #ff9900 100%); color:#04160a; padding:12px 30px; border-radius:30px; font-size:26px; font-weight:900; border:3px solid #ffffff; box-shadow:0 10px 30px rgba(255,180,0,0.6); white-space:nowrap; text-transform:uppercase; letter-spacing:0.5px;">${duelo.bannerDiferencia}</div>
        ${cardBottom2}

        <!-- CTA ELEVADO (bottom: 240px) -->
        <div style="position:absolute; bottom:240px; left:50px; width:980px; background:linear-gradient(135deg, #00e676 0%, #00b0ff 100%); border-radius:24px; padding:18px 24px; display:flex; align-items:center; justify-content:center; gap:14px; box-shadow:0 16px 40px rgba(0,0,0,0.8), 0 0 30px rgba(0, 230, 118, 0.45); border:2px solid #ffffff;">
            <img src="${logoEv}" style="width:48px; height:48px; border-radius:10px;">
            <span style="color:#04160a; font-size:27px; font-weight:900; letter-spacing:-0.3px;">Desafiá tu conocimiento en estadiosvirtuales.com</span>
        </div>
    `);

    await page.setContent(htmlRevelacion, { timeout: 5000 });
    await page.screenshot({ path: path.join(assetsDir, 'overlay_revelacion.png'), omitBackground: true });

    await browser.close();
    console.log('✅ Overlays generados exitosamente.');
}

// ==========================================
// 3. GENERADOR DE PORTADA (SAFE ZONE TIKTOK)
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
            .safe-zone { position: absolute; top: 260px; left: 50px; right: 50px; bottom: 260px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; z-index: 10; }
            .brand-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%); border: 2px solid rgba(0, 230, 118, 0.6); border-top: 2.5px solid rgba(110, 255, 180, 0.9); border-radius: 35px; color: #00ff77; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 10px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 230, 118, 0.35); }
            .main-box { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
            .hook-pill { background: rgba(255, 215, 0, 0.15); border: 2px solid #ffd700; color: #ffd700; font-size: 24px; font-weight: 900; letter-spacing: 1.5px; padding: 8px 24px; border-radius: 20px; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); text-transform: uppercase; }
            .main-title { color: #ffffff; font-size: 68px; font-weight: 900; line-height: 1.1; letter-spacing: -1px; text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(0, 230, 118, 0.4); text-transform: uppercase; }
            .sub-title { color: #cbd5e1; font-size: 26px; font-weight: 700; }
            .duel-row { display: flex; align-items: center; justify-content: center; gap: 20px; width: 100%; margin: 20px 0; }
            .team-card { flex: 1; max-width: 420px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(10, 15, 26, 0.98) 100%); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); }
            .team-card.t1 { border-top: 6px solid ${duelo.team1.borderColor}; }
            .team-card.t2 { border-top: 6px solid ${duelo.team2.borderColor}; }
            .team-logo { width: 110px; height: 110px; object-fit: contain; filter: drop-shadow(0 6px 15px rgba(0,0,0,0.7)); }
            .team-name { color: #ffffff; font-size: 30px; font-weight: 900; }
            .stadium-name { color: #94a3b8; font-size: 19px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            .vs-circle { width: 85px; height: 85px; border-radius: 50%; background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%); color: #0b111e; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; border: 4px solid #ffffff; box-shadow: 0 0 35px rgba(255, 190, 0, 0.7); flex-shrink: 0; }
            .footer-pill { display: inline-flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%); color: #04160a; font-size: 24px; font-weight: 900; padding: 14px 34px; border-radius: 30px; border: 2px solid #ffffff; box-shadow: 0 12px 30px rgba(0,0,0,0.7), 0 0 25px rgba(0, 230, 118, 0.5); }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>
        <div class="safe-zone">
            <div class="brand-badge">${duelo.tituloBadge}</div>
            <div class="main-box">
                <div class="hook-pill">¿Cuál tiene más capacidad?</div>
                <div class="main-title">${duelo.team1.nombre}<br><span style="color:#ffd700;">VS</span><br>${duelo.team2.nombre}</div>
                <div class="sub-title">${duelo.subtitulo}</div>
            </div>
            <div class="duel-row">
                <div class="team-card t1">
                    <img src="${escudo1Base64}" class="team-logo">
                    <div class="team-name">${duelo.team1.nombre}</div>
                    <div class="stadium-name">${duelo.team1.apodo}</div>
                </div>
                <div class="vs-circle">VS</div>
                <div class="team-card t2">
                    <img src="${escudo2Base64}" class="team-logo">
                    <div class="team-name">${duelo.team2.nombre}</div>
                    <div class="stadium-name">${duelo.team2.apodo}</div>
                </div>
            </div>
            <div class="footer-pill">
                <img src="${logoEv}" style="width:36px; height:36px; border-radius:8px;">
                <span>VOTÁ EN COMENTARIOS 🗳️</span>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 8000 });
    const portadaPath = path.join(outFolder, duelo.portadaFileName);
    await page.screenshot({ path: portadaPath, type: 'jpeg', quality: 95 });
    await browser.close();
    console.log(`✅ Portada guardada: ${portadaPath}`);
}

// ==========================================
// 4. RENDERIZAR VIDEO FINAL
// ==========================================
async function renderizarDuelo(dueloKey) {
    const duelo = CONFIG_DUELOS[dueloKey];
    if (!duelo) {
        console.error(`❌ Duelo no encontrado: ${dueloKey}`);
        return;
    }

    console.log(`\n🥊 ========================================================`);
    console.log(`🥊 INICIANDO PRODUCCIÓN: ${duelo.slug}`);
    console.log(`🥊 ========================================================\n`);

    const outFolder = duelo.pais 
        ? path.join(BASE_OUTPUT_DIR, duelo.pais, duelo.slug)
        : path.join(BASE_OUTPUT_DIR, duelo.slug);
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    // Carpeta temporal de assets
    const assetsDir = path.join(__dirname, `assets_${dueloKey}`);
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
    const audioPath = path.join(assetsDir, 'audio_vs.wav');
    fs.writeFileSync(audioPath, generarAudioProcedural(20.0));

    // 6. Ensamble con FFMPEG
    const videoOutPath = path.join(outFolder, duelo.videoFileName);
    const filterComplex = [
        `[0:v]${crop1}[top]`,
        `[1:v]${crop2}[bot]`,
        `[top][bot]vstack=inputs=2[stacked]`,
        `[stacked]drawbox=x=0:y=956:w=1080:h=8:color=0x00e676@0.9:t=fill[base]`,
        `[base][3:v]overlay=0:0:enable='between(t,0,11.0)'[v1]`,
        `[v1][4:v]overlay=0:0:enable='between(t,11.0,12.0)'[v2]`,
        `[v2][5:v]overlay=0:0:enable='between(t,12.0,13.0)'[v3]`,
        `[v3][6:v]overlay=0:0:enable='between(t,13.0,14.0)'[v4]`,
        `[v4][7:v]overlay=0:0:enable='between(t,14.0,20.0)'[outv]`
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
// EJECUCIÓN CLI
// ==========================================
async function main() {
    const target = process.argv[2] || 'bloque1';
    const PREMIER_KEYS = ['man-united-man-city', 'tottenham-arsenal', 'man-united-liverpool'];
    const TOP5_KEYS = ['river-maracana', 'madrid-barca', 'corinthians-palmeiras', 'betis-sevilla', 'madrid-atleti'];
    const ARG_KEYS = ['sanmartin-atletico-tucuman', 'colon-union', 'allboys-atlanta'];

    if (target === 'argentina' || target === 'arg' || target === 'lote-argentina') {
        console.log(`🚀 INICIANDO PRODUCCIÓN DE DUELOS ARGENTINA (${ARG_KEYS.length} videos)...\n`);
        for (let i = 0; i < ARG_KEYS.length; i++) {
            console.log(`\n========================================================`);
            console.log(`🥊 [${i + 1}/${ARG_KEYS.length}] PROCESANDO DUELO: ${ARG_KEYS[i]}`);
            console.log(`========================================================`);
            await renderizarDuelo(ARG_KEYS[i]);
        }
        console.log(`\n🎉 ¡LOTE ARGENTINA FINALIZADO CON ÉXITO!`);
    } else if (target === 'bloque1' || target === 'premier' || target === 'lote-premier') {
        console.log(`🚀 INICIANDO PRODUCCIÓN DE BLOQUE 1: DUELOS PREMIER LEAGUE (${PREMIER_KEYS.length} videos)...\n`);
        for (let i = 0; i < PREMIER_KEYS.length; i++) {
            console.log(`\n========================================================`);
            console.log(`🥊 [${i + 1}/${PREMIER_KEYS.length}] PROCESANDO DUELO: ${PREMIER_KEYS[i]}`);
            console.log(`========================================================`);
            await renderizarDuelo(PREMIER_KEYS[i]);
        }
        console.log(`\n🎉 ¡LOTE BLOQUE 1 PREMIER LEAGUE FINALIZADO CON ÉXITO!`);
    } else if (target === 'lote-top5' || target === 'nuevos') {
        console.log(`🚀 INICIANDO PRODUCCIÓN DE LOTE TOP 5 DUELOS DE CAPACIDAD (${TOP5_KEYS.length} videos)...\n`);
        for (let i = 0; i < TOP5_KEYS.length; i++) {
            console.log(`\n========================================================`);
            console.log(`🥊 [${i + 1}/${TOP5_KEYS.length}] PROCESANDO DUELO: ${TOP5_KEYS[i]}`);
            console.log(`========================================================`);
            await renderizarDuelo(TOP5_KEYS[i]);
        }
        console.log(`\n🎉 ¡LOTE TOP 5 DUELOS DE CAPACIDAD FINALIZADO CON ÉXITO!`);
    } else if (target === 'all') {
        const allKeys = Object.keys(CONFIG_DUELOS);
        for (let i = 0; i < allKeys.length; i++) {
            await renderizarDuelo(allKeys[i]);
        }
    } else {
        await renderizarDuelo(target);
    }
}

main().catch(console.error);
