// ============================================================================
// 📚 MÓDULO DE CATÁLOGO, TARJETAS Y EXPLORACIÓN (js/catalogo.js)
// ============================================================================

// Variables globales del catálogo expuestas en window para compatibilidad
var catalogoGlobal = [];
var estadiosCargados = [];
var ligasPanelOpen = false;
var previewMapInstance = null;

window.catalogoGlobal = catalogoGlobal;
window.estadiosCargados = estadiosCargados;
window.ligasPanelOpen = ligasPanelOpen;
window.previewMapInstance = previewMapInstance;

// Paleta de colores distintivos por liga
var LIGA_COLORS = {
    "0": "#74acdf",
    "861264971": "#74acdf",
    "554922783": "#cf142b",
    "88250864": "#c60b1e",
    "2013531070": "#009246",
    "165565330": "#002395",
    "96716546": "#ffce00",
    "58862486": "#009c3b",
    "304687071": "#d52b1e",
    "879164460": "#1a6b3a",
    "1616215119": "#f36c21",
    "1916896887": "#046A38",
    "120485921": "#006847",
    "450128934": "#0a3161"
};
window.LIGA_COLORS = LIGA_COLORS;

// ========================================================
// ESCUDO ANTI-XSS & BÚSQUEDA DE PROPIEDADES FLEXIBLE
// ========================================================
function sanitizarHTML(texto) {
    if (!texto) return '';
    const mapa = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return texto.toString().replace(/[&<>"']/g, m => mapa[m]);
}
window.sanitizarHTML = sanitizarHTML;

function bscarPropiedad(obj, clave) {
    if (!obj) return '';
    if (obj[clave] !== undefined && obj[clave] !== null) return obj[clave];
    const cl = clave.toLowerCase().trim();
    for (let k in obj) {
        if (k.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '').trim() === cl) return obj[k];
    }
    for (let k in obj) {
        if (k.toLowerCase().includes(cl)) return obj[k];
    }
    return '';
}
window.bscarPropiedad = bscarPropiedad;

// ========================================================
// PALETAS DE COLORES (CLUBES Y PAÍSES)
// ========================================================
var COLORES_CLUBES = {
    // ARGENTINA
    "River Plate": "linear-gradient(135deg, #cc0000, #ffffff)",
    "Boca Juniors": "linear-gradient(135deg, #003b46, #07575b, #f4b251)",
    "Racing Club": "linear-gradient(135deg, #75aadb, #ffffff)",
    "Independiente": "linear-gradient(135deg, #b30000, #1a1a1a)",
    "San Lorenzo": "linear-gradient(135deg, #0f2042, #a61c32)",
    "Huracán": "linear-gradient(135deg, #ffffff, #e60000)",
    "Estudiantes de La Plata": "linear-gradient(135deg, #ff0000, #ffffff, #ff0000)",
    "Gimnasia y Esgrima LP": "linear-gradient(135deg, #ffffff, #002060)",
    "Rosario Central": "linear-gradient(135deg, #002060, #ffcc00)",
    "Newell's Old Boys": "linear-gradient(135deg, #000000, #cc0000)",
    "Vélez Sarsfield": "linear-gradient(135deg, #ffffff, #0000ff)",
    "Lanús": "linear-gradient(135deg, #5c061e, #2e030f)",
    "Argentinos Juniors": "linear-gradient(135deg, #e60000, #ffffff)",
    "Belgrano de Córdoba": "linear-gradient(135deg, #5cb8e4, #ffffff)",
    "Talleres": "linear-gradient(135deg, #002060, #ffffff, #002060)",
    "Atlético Tucumán": "linear-gradient(135deg, #75aadb, #ffffff)",
    "Defensa y Justicia": "linear-gradient(135deg, #008000, #ffff00)",
    "Banfield": "linear-gradient(135deg, #006400, #ffffff)",
    "Unión de Santa Fe": "linear-gradient(135deg, #ff0000, #ffffff)",
    "Platense": "linear-gradient(135deg, #6b4423, #ffffff)",
    "Instituto": "linear-gradient(135deg, #ff0000, #ffffff)",
    "Central Córdoba (SdE)": "linear-gradient(135deg, #000000, #ffffff)",
    "Sarmiento de Junín": "linear-gradient(135deg, #004d00, #ffffff)",
    "Barracas Central": "linear-gradient(135deg, #ff0000, #ffffff)",
    "Tigre": "linear-gradient(135deg, #0000ff, #ff0000)",
    "Deportivo Riestra": "linear-gradient(135deg, #000000, #333333)",
    "Independiente Rivadavia": "linear-gradient(135deg, #000040, #ffffff)",
    "Aldosivi": "linear-gradient(135deg, #008000, #ffff00)",
    "Estudiantes de Río Cuarto": "linear-gradient(135deg, #75aadb, #ffffff)",
    "Gimnasia de Mendoza": "linear-gradient(135deg, #ffffff, #000000, #ffffff)",
    "Acassuso": "linear-gradient(135deg, #00529f, #ffffff)",
    "Agropecuario": "linear-gradient(135deg, #004d00, #ffcc00)",
    "All Boys": "linear-gradient(135deg, #ffffff, #000000)",
    "Almagro": "linear-gradient(135deg, #75aadb, #000000, #ffffff)",
    "Almirante Brown": "linear-gradient(135deg, #ffff00, #000000)",
    "Atlanta": "linear-gradient(135deg, #002060, #ffcc00)",
    "Atlético de Rafaela": "linear-gradient(135deg, #ffffff, #75aadb)",
    "Central Norte": "linear-gradient(135deg, #000000, #333333)",
    "Chacarita Juniors": "linear-gradient(135deg, #ff0000, #000000, #ffffff)",
    "Chaco For Ever": "linear-gradient(135deg, #000000, #ffffff)",
    "Ciudad de Bolívar": "linear-gradient(135deg, #75aadb, #004d00)",
    "Colegiales": "linear-gradient(135deg, #0000ff, #ff0000, #ffff00)",
    "Colón": "linear-gradient(135deg, #ff0000, #000000)",
    "Defensores de Belgrano": "linear-gradient(135deg, #ff0000, #000000)",
    "Deportivo Madryn": "linear-gradient(135deg, #ffff00, #000000)",
    "Deportivo Maipú": "linear-gradient(135deg, #ff0000, #ffffff)",
    "Deportivo Morón": "linear-gradient(135deg, #ffffff, #ff0000)",
    "Estudiantes (BA)": "linear-gradient(135deg, #000000, #ffffff)",
    "Ferro Carril Oeste": "linear-gradient(135deg, #004d00, #ffffff)",
    "Gimnasia (J)": "linear-gradient(135deg, #ffffff, #75aadb)",
    "Gimnasia y Tiro (Salta)": "linear-gradient(135deg, #75aadb, #ffffff)",
    "Godoy Cruz": "linear-gradient(135deg, #0000ff, #ffffff)",
    "Güemes (SdE)": "linear-gradient(135deg, #0000ff, #ff0000)",
    "Los Andes": "linear-gradient(135deg, #ff0000, #ffffff)",
    "Mitre (SdE)": "linear-gradient(135deg, #ffff00, #000000)",
    "Nueva Chicago": "linear-gradient(135deg, #004d00, #000000)",
    "Patronato": "linear-gradient(135deg, #ff0000, #000000)",
    "Quilmes": "linear-gradient(135deg, #ffffff, #000066)",
    "Racing (CBA)": "linear-gradient(135deg, #75aadb, #ffffff)",
    "San Martín (SJ)": "linear-gradient(135deg, #004d00, #000000)",
    "San Martín (T)": "linear-gradient(135deg, #ff0000, #ffffff)",
    "San Miguel": "linear-gradient(135deg, #004d00, #ffffff, #0000ff)",
    "San Telmo": "linear-gradient(135deg, #0000ff, #75aadb)",
    "Temperley": "linear-gradient(135deg, #75aadb, #ffffff)",
    "Tristán Suárez": "linear-gradient(135deg, #0000ff, #ffffff)",

    // COLOMBIA (LIGA BETPLAY)
    "Águilas Doradas": "linear-gradient(135deg, #d4af37, #1a1a1a)",
    "Alianza FC": "linear-gradient(135deg, #0033a0, #ffffff)",
    "América de Cali": "linear-gradient(135deg, #cc0000, #ffffff)",
    "Atlético Nacional": "linear-gradient(135deg, #008000, #ffffff)",
    "Boyacá Chicó": "linear-gradient(135deg, #000000, #ffffff, #008000)",
    "Atlético Bucaramanga": "linear-gradient(135deg, #ffea00, #006400)",
    "Cúcuta Deportivo": "linear-gradient(135deg, #cc0000, #000000)",
    "Deportivo Cali": "linear-gradient(135deg, #006400, #ffffff)",
    "Independiente Medellín": "linear-gradient(135deg, #cc0000, #002060)",
    "Fortaleza CEIF": "linear-gradient(135deg, #0033a0, #cc0000)",
    "Internacional de Bogotá": "linear-gradient(135deg, #000000, #d4af37)",
    "Jaguares de Córdoba": "linear-gradient(135deg, #5cb8e4, #008000)",
    "Junior de Barranquilla": "linear-gradient(135deg, #cc0000, #ffffff, #002060)",
    "Llaneros FC": "linear-gradient(135deg, #ff6600, #000000)",
    "Millonarios": "linear-gradient(135deg, #002060, #ffffff)",
    "Once Caldas": "linear-gradient(135deg, #ffffff, #008000, #cc0000)",
    "Deportivo Pasto": "linear-gradient(135deg, #cc0000, #0033a0, #ffea00)",
    "Deportivo Pereira": "linear-gradient(135deg, #ffea00, #cc0000)",
    "Santa Fe": "linear-gradient(135deg, #cc0000, #ffffff)",
    "Deportes Tolima": "linear-gradient(135deg, #800020, #ffea00)",

    // INGLATERRA - PREMIER LEAGUE
    "Arsenal": "linear-gradient(135deg, #ef0107, #ffffff)",
    "Aston Villa": "linear-gradient(135deg, #95bfe5, #670e36)",
    "Bournemouth": "linear-gradient(135deg, #b50e12, #000000)",
    "Brentford": "linear-gradient(135deg, #e30613, #ffffff, #fbcc04)",
    "Brighton & Hove Albion": "linear-gradient(135deg, #0057b8, #ffffff)",
    "Chelsea": "linear-gradient(135deg, #034694, #ee242c)",
    "Coventry City": "linear-gradient(135deg, #84bbf0, #ffffff)",
    "Crystal Palace": "linear-gradient(135deg, #1b458f, #c4122e)",
    "Everton": "linear-gradient(135deg, #004a97, #ffffff)",
    "Fulham": "linear-gradient(135deg, #ffffff, #000000)",
    "Hull City": "linear-gradient(135deg, #ff9f05, #000000)",
    "Ipswich Town": "linear-gradient(135deg, #0000ff, #ffffff)",
    "Leeds United": "linear-gradient(135deg, #ffffff, #ffcd00, #003399)",
    "Liverpool": "linear-gradient(135deg, #c8102e, #f6eb61)",
    "Manchester City": "linear-gradient(135deg, #6cabdd, #ffffff)",
    "Manchester United": "linear-gradient(135deg, #da291c, #000000)",
    "Newcastle United": "linear-gradient(135deg, #000000, #ffffff)",
    "Nottingham Forest": "linear-gradient(135deg, #dd0000, #ffffff)",
    "Sunderland": "linear-gradient(135deg, #ff0000, #ffffff, #000000)",
    "Tottenham Hotspur": "linear-gradient(135deg, #ffffff, #132257)",

    // ESPAÑA - LA LIGA
    "Real Madrid": "linear-gradient(135deg, #ffffff, #e5e5e5, #febe10)",
    "FC Barcelona": "linear-gradient(135deg, #a50044, #004d98)",
    "Atlético de Madrid": "linear-gradient(135deg, #cb0000, #ffffff, #000040)",
    "Athletic Club": "linear-gradient(135deg, #ee2524, #ffffff, #000000)",
    "Real Betis": "linear-gradient(135deg, #00954c, #ffffff)",
    "Valencia CF": "linear-gradient(135deg, #ffffff, #000000, #ff8200)",
    "Real Sociedad": "linear-gradient(135deg, #0066bb, #ffffff)",
    "Sevilla FC": "linear-gradient(135deg, #ffffff, #e2001a)",
    "Villarreal CF": "linear-gradient(135deg, #ffdf1b, #005094)",
    "CA Osasuna": "linear-gradient(135deg, #ab192d, #1a2f54)",
    "RC Celta de Vigo": "linear-gradient(135deg, #87adde, #ffffff)",
    "Deportivo Alavés": "linear-gradient(135deg, #00569e, #ffffff)",
    "Getafe CF": "linear-gradient(135deg, #004bc0, #ffffff)",
    "RCD Mallorca": "linear-gradient(135deg, #e2001a, #000000)",
    "UD Las Palmas": "linear-gradient(135deg, #ffe600, #00529f)",
    "Rayo Vallecano": "linear-gradient(135deg, #ffffff, #e2001a)",
    "Girona FC": "linear-gradient(135deg, #e2001a, #ffffff)",
    "CD Leganés": "linear-gradient(135deg, #00529f, #ffffff)",
    "Real Valladolid": "linear-gradient(135deg, #6c2d84, #ffffff)",
    "RCD Espanyol": "linear-gradient(135deg, #0087cd, #ffffff)",

    // ITALIA - SERIE A
    "Juventus": "linear-gradient(135deg, #000000, #ffffff, #000000)",
    "Inter de Milán": "linear-gradient(135deg, #00529f, #000000)",
    "AC Milan": "linear-gradient(135deg, #e30613, #000000)",
    "AS Roma": "linear-gradient(135deg, #8e1a2f, #f0bc42)",
    "SS Lazio": "linear-gradient(135deg, #87d3f8, #ffffff)",
    "Napoli": "linear-gradient(135deg, #12a0da, #ffffff)",
    "Fiorentina": "linear-gradient(135deg, #4c2384, #ffffff)",
    "Atalanta": "linear-gradient(135deg, #00529f, #000000)",
    "Bologna": "linear-gradient(135deg, #1a2f54, #ab192d)",
    "Torino": "linear-gradient(135deg, #8a1538, #ffffff)",
    "Udinese": "linear-gradient(135deg, #000000, #ffffff)",
    "Genoa": "linear-gradient(135deg, #a51c30, #0b2240)",
    "Hellas Verona": "linear-gradient(135deg, #0b2c6c, #ffcc00)",
    "Empoli": "linear-gradient(135deg, #00529f, #ffffff)",
    "Lecce": "linear-gradient(135deg, #ffcc00, #e30613)",
    "Monza": "linear-gradient(135deg, #e30613, #ffffff)",
    "Cagliari": "linear-gradient(135deg, #a51c30, #0b2240)",
    "Parma": "linear-gradient(135deg, #ffffff, #000000, #ffcc00)",
    "Como 1907": "linear-gradient(135deg, #1b458f, #ffffff)",
    "Venezia FC": "linear-gradient(135deg, #113e37, #df6b26, #000000)",

    // FRANCIA - LIGUE 1
    "Paris Saint-Germain": "linear-gradient(135deg, #004170, #e30613, #ffffff)",
    "Marseille": "linear-gradient(135deg, #87d3f8, #ffffff)",
    "Lyon": "linear-gradient(135deg, #ffffff, #1b458f, #e30613)",
    "Lille": "linear-gradient(135deg, #e30613, #1b458f, #ffffff)",
    "Monaco": "linear-gradient(135deg, #e30613, #ffffff)",
    "Lens": "linear-gradient(135deg, #ffcc00, #e30613)",
    "Nice": "linear-gradient(135deg, #e30613, #000000)",
    "Rennes": "linear-gradient(135deg, #e30613, #000000)",
    "Strasbourg": "linear-gradient(135deg, #00529f, #ffffff)",
    "Toulouse": "linear-gradient(135deg, #4c2384, #ffffff)",
    "Le Havre": "linear-gradient(135deg, #204060, #87d3f8)",
    "Angers": "linear-gradient(135deg, #000000, #ffffff)",
    "Auxerre": "linear-gradient(135deg, #ffffff, #00529f)",
    "Brest": "linear-gradient(135deg, #e30613, #ffffff)",
    "Lorient": "linear-gradient(135deg, #ff6600, #ffffff, #004d00)",
    "Le Mans": "linear-gradient(135deg, #ff6600, #ff0000)",
    "Paris FC": "linear-gradient(135deg, #002060, #87d3f8)",
    "Troyes": "linear-gradient(135deg, #00529f, #ffffff)",

    // ALEMANIA - BUNDESLIGA
    "Bayern Munich": "linear-gradient(135deg, #dc052d, #0066b2, #ffffff)",
    "Borussia Dortmund": "linear-gradient(135deg, #fde100, #000000)",
    "Bayer Leverkusen": "linear-gradient(135deg, #e30613, #000000)",
    "RB Leipzig": "linear-gradient(135deg, #ffffff, #dd013f, #0c2340)",
    "VfB Stuttgart": "linear-gradient(135deg, #ffffff, #e30613, #ffffff)",
    "Eintracht Frankfurt": "linear-gradient(135deg, #e30613, #000000, #ffffff)",
    "SC Freiburg": "linear-gradient(135deg, #e30613, #ffffff)",
    "TSG Hoffenheim": "linear-gradient(135deg, #00529f, #ffffff)",
    "Werder Bremen": "linear-gradient(135deg, #008f5d, #ffffff)",
    "Borussia Mönchengladbach": "linear-gradient(135deg, #ffffff, #000000, #00a651)",
    "Mainz 05": "linear-gradient(135deg, #e30613, #ffffff)",
    "FC Augsburg": "linear-gradient(135deg, #ffffff, #ba9b65, #008f5d)",
    "Union Berlin": "linear-gradient(135deg, #e30613, #ffffff)",
    "1. FC Köln": "linear-gradient(135deg, #ff0000, #ffffff)",
    "Hamburger SV": "linear-gradient(135deg, #00529f, #ffffff, #ff0000)",
    "Schalke 04": "linear-gradient(135deg, #004da3, #ffffff)",
    "SC Paderborn": "linear-gradient(135deg, #00529f, #ffffff, #000000)",
    "SV Elversberg": "linear-gradient(135deg, #ffffff, #000000, #ffcc00)",

    // BRASIL - BRASILEIRAO
    "Flamengo": "linear-gradient(135deg, #111111, #c8102e)",
    "Palmeiras": "linear-gradient(135deg, #006437, #ffffff, #006437)",
    "São Paulo": "linear-gradient(135deg, #ff0000, #ffffff, #000000)",
    "Corinthians": "linear-gradient(135deg, #ffffff, #d5d5d5, #000000)",
    "Santos": "linear-gradient(135deg, #ffffff, #000000, #ffffff)",
    "Vasco da Gama": "linear-gradient(135deg, #000000, #ffffff, #c8102e)",
    "Fluminense": "linear-gradient(135deg, #83142c, #ffffff, #006437)",
    "Botafogo": "linear-gradient(135deg, #000000, #ffffff, #000000)",
    "Atlético Mineiro": "linear-gradient(135deg, #000000, #ffffff, #000000)",
    "Cruzeiro": "linear-gradient(135deg, #0033a0, #ffffff)",
    "Grêmio": "linear-gradient(135deg, #00a4e4, #000000, #ffffff)",
    "Internacional": "linear-gradient(135deg, #e20e0e, #ffffff)",
    "Athletico Paranaense": "linear-gradient(135deg, #cc0000, #000000)",
    "Bahía": "linear-gradient(135deg, #0033a0, #ffffff, #e20e0e)",
    "Bragantino": "linear-gradient(135deg, #ffffff, #e2001a)",
    "Coritiba": "linear-gradient(135deg, #006437, #ffffff, #006437)",
    "Chapecoense": "linear-gradient(135deg, #006437, #ffffff)",
    "Mirassol": "linear-gradient(135deg, #ffea00, #006437)",
    "Vitória": "linear-gradient(135deg, #e20e0e, #000000)",
    "Remo": "linear-gradient(135deg, #001c44, #ffffff)",

    // CHILE - PRIMERA DIVISIÓN
    "Colo Colo": "linear-gradient(135deg, #ffffff, #b5b5b5, #000000)",
    "Universidad Católica": "linear-gradient(135deg, #ffffff, #0033a0, #ffffff)",
    "Coquimbo Unido": "linear-gradient(135deg, #ffea00, #000000)",
    "Everton CD": "linear-gradient(135deg, #0033a0, #ffea00, #0033a0)",
    "Huachipato": "linear-gradient(135deg, #0033a0, #000000, #0055ff)",
    "Deportes Limache": "linear-gradient(135deg, #ff3300, #000000, #0033a0)",
    "Palestino": "linear-gradient(135deg, #006437, #ffffff, #e20e0e)",
    "Ñublense": "linear-gradient(135deg, #e20e0e, #ffffff)",
    "Universidad de Chile": "linear-gradient(135deg, #002244, #0033a0, #e20e0e)",
    "O'Higgins": "linear-gradient(135deg, #75aadb, #ffffff)",
    "Universidad de Concepción": "linear-gradient(135deg, #ffea00, #0033a0)",
    "La Serena": "linear-gradient(135deg, #83142c, #ffffff)",
    "Audax Italiano": "linear-gradient(135deg, #006437, #ffffff, #e20e0e)",
    "Cobresal": "linear-gradient(135deg, #ff6600, #ffffff, #006437)",
    "Deportes Concepcion": "linear-gradient(135deg, #ae75db, #ffffff)",
    "Deportes Concepción": "linear-gradient(135deg, #ae75db, #ffffff)",
    "Unión La Calera": "linear-gradient(135deg, #e20e0e, #ffffff)",

    // PORTUGAL - PRIMEIRA LIGA
    "Benfica": "linear-gradient(135deg, #e30613, #ffffff, #e30613)",
    "FC Porto": "linear-gradient(135deg, #00529f, #ffffff, #00529f)",
    "Sporting CP": "linear-gradient(135deg, #008000, #ffffff, #008000)",
    "SC Braga": "linear-gradient(135deg, #e30613, #ffffff)",
    "Vitória de Guimaraes": "linear-gradient(135deg, #ffffff, #000000, #ffffff)",
    "Vitória de Guimarães": "linear-gradient(135deg, #ffffff, #000000, #ffffff)",
    "Rio Ave": "linear-gradient(135deg, #008000, #ffffff)",
    "FC Famalicao": "linear-gradient(135deg, #00529f, #ffffff)",
    "FC Famalicão": "linear-gradient(135deg, #00529f, #ffffff)",
    "Arouca": "linear-gradient(135deg, #ffcc00, #00529f)",
    "Gil Vicente": "linear-gradient(135deg, #e30613, #00529f)",
    "Estoril": "linear-gradient(135deg, #ffcc00, #00529f, #ffcc00)",
    "Casa Pia": "linear-gradient(135deg, #000000, #ffffff, #000000)",
    "C.D. Nacional": "linear-gradient(135deg, #ffffff, #000000)",
    "Moreirense": "linear-gradient(135deg, #008000, #ffffff, #008000)",
    "Estrela": "linear-gradient(135deg, #008000, #ffffff, #e30613)",
    "Santa Clara": "linear-gradient(135deg, #e30613, #ffffff, #e30613)",
    "AVS": "linear-gradient(135deg, #e30613, #ffffff)",
    "Alverca": "linear-gradient(135deg, #00529f, #e30613)",
    "C.D Tondela": "linear-gradient(135deg, #008000, #ffcc00)",
    "C.D. Tondela": "linear-gradient(135deg, #008000, #ffcc00)",

    // PAÍSES BAJOS - EREDIVISIE / EERSTE DIVISIE
    "Ajax Amsterdam": "linear-gradient(135deg, #ffffff, #d2122e, #ffffff)",
    "PSV Eindhoven": "linear-gradient(135deg, #e30613, #ffffff, #000000)",
    "Feyenoord Rotterdam": "linear-gradient(135deg, #e30613, #ffffff, #000000)",
    "AZ Alkmaar": "linear-gradient(135deg, #e30613, #ffffff)",
    "FC Twente": "linear-gradient(135deg, #d3001b, #ffffff)",
    "FC Utrecht": "linear-gradient(135deg, #e30613, #ffffff)",
    "Heerenveen": "linear-gradient(135deg, #00529f, #ffffff, #e30613)",
    "FC Groningen": "linear-gradient(135deg, #007844, #ffffff)",
    "Go Ahead Eagles": "linear-gradient(135deg, #e30613, #ffcc00)",
    "NEC Nijmegen": "linear-gradient(135deg, #e30613, #000000, #008000)",
    "Willem II": "linear-gradient(135deg, #e30613, #ffffff, #0033a0)",
    "ADO Den Haag": "linear-gradient(135deg, #ffcc00, #008000)",
    "Sparta Rotterdam": "linear-gradient(135deg, #e30613, #ffffff, #000000)",
    "Excelsior": "linear-gradient(135deg, #000000, #e30613)",
    "Fortuna Sittard": "linear-gradient(135deg, #ffcc00, #008000)",
    "PEC Zwolle": "linear-gradient(135deg, #00529f, #ffffff)",
    "SC Cambuur": "linear-gradient(135deg, #ffcc00, #00529f)",
    "Telstar": "linear-gradient(135deg, #ffffff, #00529f, #e30613)",

    // MÉXICO - LIGA MX
    "Club América": "linear-gradient(135deg, #002b49, #ffd100, #c8102e)",
    "Chivas Guadalajara": "linear-gradient(135deg, #0f2042, #ffffff, #c8102e)",
    "Cruz Azul": "linear-gradient(135deg, #0033a0, #ffffff, #c8102e)",
    "Pumas UNAM": "linear-gradient(135deg, #1b263b, #c5a059)",
    "Tigres UANL": "linear-gradient(135deg, #0033a0, #ffb81c)",
    "CF Monterrey": "linear-gradient(135deg, #001e44, #ffffff, #001e44)",
    "Toluca": "linear-gradient(135deg, #c8102e, #ffffff, #c8102e)",
    "Pachuca": "linear-gradient(135deg, #002f6c, #ffffff)",
    "Santos Laguna": "linear-gradient(135deg, #006847, #ffffff)",
    "Club León": "linear-gradient(135deg, #006847, #ffd100)",
    "Atlas": "linear-gradient(135deg, #c8102e, #000000)",
    "Club Tijuana": "linear-gradient(135deg, #c8102e, #000000)",
    "Puebla": "linear-gradient(135deg, #002f6c, #ffffff)",
    "Necaxa": "linear-gradient(135deg, #c8102e, #ffffff)",
    "Atlético San Luis": "linear-gradient(135deg, #c8102e, #ffffff, #002f6c)",
    "FC Juárez": "linear-gradient(135deg, #78be20, #c8102e, #000000)",
    "Querétaro": "linear-gradient(135deg, #0033a0, #000000, #ffffff)",
    "Atlante": "linear-gradient(135deg, #002f6c, #8b0000)",

    // ESTADOS UNIDOS / CANADÁ - MLS
    "Atlanta United FC": "linear-gradient(135deg, #80000a, #000000, #a19060)",
    "Charlotte FC": "linear-gradient(135deg, #0085ca, #000000, #ffffff)",
    "Chicago Fire FC": "linear-gradient(135deg, #ff0000, #001e44, #87ceeb)",
    "CF Montréal": "linear-gradient(135deg, #0033a0, #000000, #808080)",
    "D.C. United": "linear-gradient(135deg, #000000, #ef3e42)",
    "FC Cincinnati": "linear-gradient(135deg, #003087, #fe5000)",
    "Inter Miami CF": "linear-gradient(135deg, #f7b5cd, #231f20)",
    "Nashville SC": "linear-gradient(135deg, #ece81a, #1f1646)",
    "New England Revolution": "linear-gradient(135deg, #0a2240, #ce0e2d, #ffffff)",
    "New York City FC": "linear-gradient(135deg, #6cace4, #001a44, #f58426)",
    "New York Red Bulls": "linear-gradient(135deg, #ed1e36, #ffffff, #002244)",
    "New York Red Bulls (Red Bull New York)": "linear-gradient(135deg, #ed1e36, #ffffff, #002244)",
    "Orlando City SC": "linear-gradient(135deg, #5b2c86, #ffffff, #d4af37)",
    "Philadelphia Union": "linear-gradient(135deg, #071b2c, #b38738)",
    "Toronto FC": "linear-gradient(135deg, #b81137, #455560)",
    "Columbus Crew": "linear-gradient(135deg, #fedd00, #000000)",
    "Austin FC": "linear-gradient(135deg, #00b140, #000000)",
    "Colorado Rapids": "linear-gradient(135deg, #862633, #8bb8e8)",
    "FC Dallas": "linear-gradient(135deg, #e31b23, #00205b)",
    "Houston Dynamo FC": "linear-gradient(135deg, #f46322, #000000)",
    "LA Galaxy": "linear-gradient(135deg, #00245d, #ffffff, #ffd200)",
    "LAFC (Los Angeles Football Club)": "linear-gradient(135deg, #000000, #c39e5c)",
    "Los Angeles Football Club": "linear-gradient(135deg, #000000, #c39e5c)",
    "Minnesota United FC": "linear-gradient(135deg, #231f20, #8cd2f4, #df4633)",
    "Portland Timbers": "linear-gradient(135deg, #00482b, #d1a153)",
    "Real Salt Lake": "linear-gradient(135deg, #b30838, #001e44, #f1cb00)",
    "San Diego FC": "linear-gradient(135deg, #182b49, #c49a45)",
    "San Jose Earthquakes": "linear-gradient(135deg, #0051ba, #000000)",
    "Seattle Sounders FC": "linear-gradient(135deg, #5d9741, #005595)",
    "Sporting Kansas City": "linear-gradient(135deg, #93b1d7, #002a5c)",
    "St. Louis CITY SC": "linear-gradient(135deg, #e40046, #00143c, #fedb00)",
    "Vancouver Whitecaps FC": "linear-gradient(135deg, #00245e, #ffffff, #9dc4e8)"
};
window.COLORES_CLUBES = COLORES_CLUBES;

var COLORES_PAISES = {
    "argentina": "linear-gradient(135deg,#74acdf,#ffffff,#74acdf)",
    "brasil": "linear-gradient(135deg,#009c3b,#ffdf00,#002776)",
    "españa": "linear-gradient(135deg,#c60b1e,#ffc400,#c60b1e)",
    "italia": "linear-gradient(135deg,#009246,#ffffff,#ce2b37)",
    "francia": "linear-gradient(135deg,#002395,#ffffff,#ed2939)",
    "alemania": "linear-gradient(135deg,#000000,#dd0000,#ffce00)",
    "inglaterra": "linear-gradient(135deg,#ffffff,#ce1126)",
    "portugal": "linear-gradient(135deg,#046a38,#ff0000)",
    "uruguay": "linear-gradient(135deg,#7badd3,#ffffff,#fcd116)",
    "colombia": "linear-gradient(135deg,#fcd116,#003893,#ce1126)",
    "méxico": "linear-gradient(135deg,#006847,#ffffff,#ce1126)",
    "mexico": "linear-gradient(135deg,#006847,#ffffff,#ce1126)",
    "chile": "linear-gradient(135deg,#d52b1e,#ffffff,#0039a6)",
    "países bajos": "linear-gradient(135deg,#f36c21,#ffffff,#21468b)",
    "paises bajos": "linear-gradient(135deg,#f36c21,#ffffff,#21468b)",
    "bélgica": "linear-gradient(135deg,#e30613,#fbd600,#000000)",
    "belgica": "linear-gradient(135deg,#e30613,#fbd600,#000000)",
    "croacia": "linear-gradient(135deg,#ed1c24,#ffffff,#005caa)",
    "ee.uu.": "linear-gradient(135deg,#002868,#ffffff,#bf0a30)",
    "estados unidos": "linear-gradient(135deg,#002868,#ffffff,#bf0a30)",
    "usa": "linear-gradient(135deg,#002868,#ffffff,#bf0a30)",
    "japón": "linear-gradient(135deg,#000555,#ffffff,#ed1944)",
    "japon": "linear-gradient(135deg,#000555,#ffffff,#ed1944)",
    "canadá": "linear-gradient(135deg,#d52b1e,#ffffff,#d52b1e)",
    "canada": "linear-gradient(135deg,#d52b1e,#ffffff,#d52b1e)",
    "marruecos": "linear-gradient(135deg,#c1272d,#006233)",
    "senegal": "linear-gradient(135deg,#00853f,#fdef42,#e31b23)",
    "corea del sur": "linear-gradient(135deg,#ffffff,#cd2e3a,#0f64cd)",
    "australia": "linear-gradient(135deg,#ffcd00,#008751)",
    "suiza": "linear-gradient(135deg,#d52b1e,#ffffff)",
    "ecuador": "linear-gradient(135deg,#ffdd00,#034ea2,#ed1c24)",
    "perú": "linear-gradient(135deg,#d91023,#ffffff,#d91023)",
    "peru": "linear-gradient(135deg,#d91023,#ffffff,#d91023)",
    "dinamarca": "linear-gradient(135deg,#c60c30,#ffffff)",
    "serbia": "linear-gradient(135deg,#c6363c,#0c4076,#ffffff)",
    "polonia": "linear-gradient(135deg,#ffffff,#dc143c)",
    "gales": "linear-gradient(135deg,#d30731,#ffffff,#00ad36)",
    "suecia": "linear-gradient(135deg,#fecc00,#006aa7)",
    "costa de marfil": "linear-gradient(135deg,#f77f00,#ffffff,#009e60)",
    "camerún": "linear-gradient(135deg,#007a5e,#ce1126,#fcd116)",
    "camerun": "linear-gradient(135deg,#007a5e,#ce1126,#fcd116)",
    "ghana": "linear-gradient(135deg,#ce1126,#fcd116,#006b3f)",
    "nigeria": "linear-gradient(135deg,#008751,#ffffff,#008751)",
    "arabia saudita": "linear-gradient(135deg,#006a4e,#ffffff)",
    "irán": "linear-gradient(135deg,#239f40,#ffffff,#da0000)",
    "iran": "linear-gradient(135deg,#239f40,#ffffff,#da0000)",
    "egipto": "linear-gradient(135deg,#ce1126,#ffffff,#000000)",
    "argelia": "linear-gradient(135deg,#006233,#ffffff,#d21034)",
    "túnez": "linear-gradient(135deg,#e70013,#ffffff)",
    "tunez": "linear-gradient(135deg,#e70013,#ffffff)",
    "malí": "linear-gradient(135deg,#14b53a,#fcd116,#ce1126)",
    "mali": "linear-gradient(135deg,#14b53a,#fcd116,#ce1126)",
    "qatar": "linear-gradient(135deg,#8d1b3d,#ffffff)",
    "paraguay": "linear-gradient(135deg,#d52b1e,#ffffff,#0038a8)",
    "venezuela": "linear-gradient(135deg,#fce300,#0038a8,#ce1126)",
    "bolivia": "linear-gradient(135deg,#d52b1e,#fcd116,#007a33)",
    "costa rica": "linear-gradient(135deg,#002b7f,#ffffff,#ce1126)",
    "panamá": "linear-gradient(135deg,#005293,#ffffff,#d21034)",
    "panama": "linear-gradient(135deg,#005293,#ffffff,#d21034)",
    "jamaica": "linear-gradient(135deg,#009b3a,#fed100,#000000)",
    "nueva zelanda": "linear-gradient(135deg,#ffffff,#000000)",
    "escocia": "linear-gradient(135deg,#005eb8,#ffffff)",
    "noruega": "linear-gradient(135deg,#ba0c2f,#00205b,#ffffff)",
    "austria": "linear-gradient(135deg,#ed2939,#ffffff,#ed2939)",
    "grecia": "linear-gradient(135deg,#0d5eaf,#ffffff)",
    "turquía": "linear-gradient(135deg,#e30a17,#ffffff)",
    "turquia": "linear-gradient(135deg,#e30a17,#ffffff)",
    "ucrania": "linear-gradient(135deg,#0057b7,#ffd700)",
    "rep. checa": "linear-gradient(135deg,#11457e,#ffffff,#d7141a)",
    "sudáfrica": "linear-gradient(135deg,#007749,#ffb81c,#e03c31,#001489)",
    "sudafrica": "linear-gradient(135deg,#007749,#ffb81c,#e03c31,#001489)",
    "honduras": "linear-gradient(135deg,#0073cf,#ffffff,#0073cf)",
    "irlanda": "linear-gradient(135deg,#169b62,#ffffff,#ff883e)"
};
window.COLORES_PAISES = COLORES_PAISES;

function obtenerFondoClub(club, pais) {
    if (!club && !pais) return 'linear-gradient(135deg,#0f1419,#080c10)';
    if (club) {
        const cl = club.toLowerCase();
        for (const k in COLORES_CLUBES) {
            if (k.toLowerCase() === cl) return COLORES_CLUBES[k];
        }
        for (const k in COLORES_CLUBES) {
            if (cl.includes(k.toLowerCase()) || k.toLowerCase().includes(cl)) return COLORES_CLUBES[k];
        }
    }
    if (pais) {
        const pl = pais.toLowerCase().trim();
        for (const k in COLORES_PAISES) {
            if (pl.includes(k) || k.includes(pl)) return COLORES_PAISES[k];
        }
    }
    return 'linear-gradient(135deg,#0f1419,#1a2233)';
}
window.obtenerFondoClub = obtenerFondoClub;

// ========================================================
// VOTACIÓN Y CALIFICACIONES DE ESTADIOS
// ========================================================
function guardarVotoLocal(estadio, p) {
    const v = JSON.parse(localStorage.getItem('ev_votos_locales') || '{}');
    v[estadio] = p;
    localStorage.setItem('ev_votos_locales', JSON.stringify(v));
}
window.guardarVotoLocal = guardarVotoLocal;

function obtenerVotoLocal(estadio) {
    const v = JSON.parse(localStorage.getItem('ev_votos_locales') || '{}');
    return v[estadio] || 0;
}
window.obtenerVotoLocal = obtenerVotoLocal;

async function registrarVoto(event, estadio, club, puntuacion) {
    if (event) event.stopPropagation();

    // 🛡️ REGLA: Cada usuario puede votar UNA SOLA VEZ por cada estadio
    const votoPrevio = obtenerVotoLocal(estadio);
    if (votoPrevio > 0) {
        if (typeof showToast === 'function') {
            showToast(`Ya calificaste este estadio anteriormente con ${votoPrevio}★`, "ph-check-circle", "info");
        }
        return;
    }

    // Guardar voto localmente para bloquear votos repetidos
    guardarVotoLocal(estadio, puntuacion);

    if (typeof userStats !== 'undefined') {
        userStats.votosRealizados = (userStats.votosRealizados || 0) + 1;
        if (typeof guardarStats === 'function') guardarStats();
    }

    // Actualizar visualmente la barra continua de estrellas de inmediato
    if (event && event.target) {
        const container = event.target.closest('.stars-precise-container');
        if (container) {
            container.classList.add('voted');
            const fill = container.querySelector('.stars-fill');
            if (fill) {
                fill.style.width = `${(puntuacion / 5) * 100}%`;
            }
            container.setAttribute('title', `Tu voto: ${puntuacion}★`);
        }
    }

    // Guardar voto en Supabase
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
            const uid = (u && u.sub) ? u.sub : (typeof getUserId === 'function' ? getUserId() : null);
            await supabaseClient
                .from('votos')
                .insert([
                    { 
                        estadio: estadio, 
                        club: club, 
                        voto: puntuacion,
                        user_id: uid
                    }
                ]);
            console.log(`Voto guardado en Supabase: ${estadio} -> ${puntuacion}★`);
        } catch (err) {
            console.error("Error al mandar el voto a Supabase:", err);
        }
    }

    if (typeof showToast === 'function') showToast(`¡Calificaste ${estadio} con ${puntuacion}★! (+50 XP)`);
    if (typeof agregarXP === 'function') agregarXP(50);
}
window.registrarVoto = registrarVoto;

function registrarVotoDesdeAtributo(event, star) {
    registrarVoto(event, star.dataset.estadio, star.dataset.club, parseInt(star.dataset.puntuacion));
}
window.registrarVotoDesdeAtributo = registrarVotoDesdeAtributo;

// ========================================================
// NAVEGACIÓN Y SELECTOR DE LIGAS
// ========================================================
function toggleLigasPanel() {
    const panel = document.getElementById('ligas-dropdown-panel'),
          btn = document.getElementById('liga-selector-btn');
    ligasPanelOpen = !ligasPanelOpen;
    window.ligasPanelOpen = ligasPanelOpen;
    if (panel) panel.classList.toggle('open', ligasPanelOpen);
    if (btn) btn.classList.toggle('open', ligasPanelOpen);
}
window.toggleLigasPanel = toggleLigasPanel;

window.toggleLigaCountryGroup = function(btn) {
    const grupo = btn.closest('.liga-country-group');
    if (grupo) grupo.classList.toggle('open');
};

function cerrarLigasPanel() {
    ligasPanelOpen = false;
    window.ligasPanelOpen = false;
    const panel = document.getElementById('ligas-dropdown-panel');
    const btn = document.getElementById('liga-selector-btn');
    if (panel) panel.classList.remove('open');
    if (btn) btn.classList.remove('open');
}
window.cerrarLigasPanel = cerrarLigasPanel;

window.abrirCatalogo = function() {
    const cat = document.getElementById('catalogo-layout');
    if (cat) {
        cat.classList.add('open');
        cat.scrollIntoView({ behavior: 'smooth' });
    }
};

window.cerrarCatalogo = function() {
    const cat = document.getElementById('catalogo-layout');
    if (cat) cat.classList.remove('open');
};

document.addEventListener('click', (e) => {
    const btn = document.getElementById('liga-selector-btn'),
          panel = document.getElementById('ligas-dropdown-panel');
    if (btn && panel && !btn.contains(e.target) && !panel.contains(e.target)) cerrarLigasPanel();
});

window.mostrarLigas = function() {
    const bVolver = document.getElementById('btn-volver-ligas');
    if (bVolver) bVolver.style.display = 'none';
    const bBadge = document.getElementById('liga-elegida-badge');
    if (bBadge) bBadge.style.display = 'none';
    const tit = document.getElementById('texto-titulo-grilla');
    if (tit) tit.textContent = 'EXPLORÁ EL CATÁLOGO';
    const labelLiga = document.getElementById('liga-selector-label');
    if (labelLiga) labelLiga.textContent = 'Elegir liga';
    const gs = document.getElementById('global-search');
    if (gs) gs.value = '';
    const gr = document.querySelector('.grid');
    if (gr) gr.innerHTML = '';
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    localStorage.removeItem('ev_last_gid');
    estadiosCargados = [];
    window.estadiosCargados = estadiosCargados;
};

function activarLiga(gid, nombre) {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    const tab = document.querySelector(`.tab[data-gid="${gid}"]`);
    if (tab) {
        tab.classList.add('active');
        const grupo = tab.closest('.liga-country-group');
        if (grupo) grupo.classList.add('open');
    }
    const bVolver = document.getElementById('btn-volver-ligas');
    if (bVolver) bVolver.style.display = 'inline-flex';
    const tit = document.getElementById('texto-titulo-grilla');
    if (tit) tit.textContent = ''; 
    const badge = document.getElementById('liga-elegida-badge'),
          dot = document.getElementById('liga-badge-dot'),
          nom = document.getElementById('liga-badge-nombre');
    if (dot) dot.style.background = LIGA_COLORS[gid] || 'var(--accent-color)';
    if (nom) nom.textContent = nombre;
    if (badge) badge.style.display = 'inline-flex';
    localStorage.setItem('ev_last_gid', gid);
    if (typeof userStats !== 'undefined' && userStats.ligasExploradas) {
        userStats.ligasExploradas.add(gid);
        if (typeof guardarStats === 'function') guardarStats();
    }
    cargarLiga(gid);
}
window.activarLiga = activarLiga;

// ========================================================
// MAPA PREVIEW MODAL
// ========================================================
function abrirModalMapa(estadio, pais, lat, lng) {
    if (!lat || !lng || !lat.toString().trim() || !lng.toString().trim()) {
        if (typeof showToast === 'function') showToast('Coordenadas no disponibles.', 'ph-warning-circle', 'danger');
        return;
    }
    const modal = document.getElementById('map-modal');
    if (modal) modal.style.display = 'flex';
    const pLat = parseFloat(lat.toString().replace(',', '.')),
          pLng = parseFloat(lng.toString().replace(',', '.'));
    setTimeout(() => {
        if (previewMapInstance) previewMapInstance.remove();
        if (typeof L !== 'undefined') {
            previewMapInstance = L.map('modal-map-container', { attributionControl: false }).setView([pLat, pLng], 5);
            window.previewMapInstance = previewMapInstance;
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(previewMapInstance);
            L.circleMarker([pLat, pLng], {
                radius: 9,
                color: 'var(--accent-color)',
                fillColor: 'var(--card-bg)',
                fillOpacity: 1,
                weight: 3
            }).addTo(previewMapInstance).bindPopup(`<b>${estadio}</b><br>${pais}`).openPopup();
            previewMapInstance.invalidateSize();
        }
    }, 250);
}
window.abrirModalMapa = abrirModalMapa;

function cerrarModalMapa() {
    const modal = document.getElementById('map-modal');
    if (modal) modal.style.display = 'none';
    if (previewMapInstance) {
        previewMapInstance.remove();
        previewMapInstance = null;
        window.previewMapInstance = null;
    }
}
window.cerrarModalMapa = cerrarModalMapa;

// ========================================================
// TRIVIAS, SKELETONS Y TARJETAS
// ========================================================
function switchTab(event, btn, type, estadio, pais, lat, lng) {
    if (event) event.stopPropagation();
    const b = btn.closest('.trivia-balloon');
    if (!b) return;
    b.querySelectorAll('.b-tab').forEach(t => t.classList.remove('active'));
    b.querySelectorAll('.b-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const ct = b.querySelector('.b-' + type);
    if (ct) ct.classList.add('active');
    if (type === 'mapa') {
        abrirModalMapa(estadio, pais, lat, lng);
        setTimeout(() => {
            b.classList.remove('active');
            const primerTab = b.querySelectorAll('.b-tab')[0];
            if (primerTab) primerTab.classList.add('active');
            const bt = b.querySelector('.b-trivia');
            if (bt) bt.classList.add('active');
        }, 100);
    }
}
window.switchTab = switchTab;

function switchTabMapa(event, btn) {
    if (event) event.stopPropagation();
    switchTab(event, btn, 'mapa', btn.dataset.estadio, btn.dataset.pais, btn.dataset.lat, btn.dataset.lng);
}
window.switchTabMapa = switchTabMapa;

function toggleTriviaPopup(event, el) {
    if (event) event.stopPropagation();

    // 📱 En celulares / tablets angostas (<= 768px), abrimos el modal emergente optimizado
    if (window.innerWidth <= 768) {
        abrirModalTriviaMobile(el);
        return;
    }

    const g = el.querySelector('.trivia-balloon');
    if (!g) return;
    const open = g.classList.contains('active');
    document.querySelectorAll('.trivia-balloon').forEach(x => x.classList.remove('active'));
    if (!open) {
        g.classList.add('active');
        if (typeof userStats !== 'undefined') {
            userStats.triviasVistas = (userStats.triviasVistas || 0) + 1;
            const cardTitle = el.closest('.card')?.querySelector('.card-title')?.textContent;
            if (cardTitle && userStats.triviasDescubiertas) userStats.triviasDescubiertas.add(cardTitle);
            if (typeof guardarStats === 'function') guardarStats();
        }
        if (typeof gridXP === 'function') gridXP(10);
        else if (typeof agregarXP === 'function') agregarXP(10);
    }
}
window.toggleTriviaPopup = toggleTriviaPopup;

function abrirModalTriviaMobile(el) {
    const card = el.closest('.card');
    if (!card) return;

    const estadio = card.querySelector('.card-title')?.textContent?.trim() || 'Estadio';
    const sub = card.querySelector('.card-subtitle')?.textContent?.trim() || '';
    const triviaText = el.querySelector('.b-trivia p')?.textContent?.trim() || '¡Este estadio esconde grandes historias!';
    const btnMapa = el.querySelector('.b-tab[data-estadio]');
    const pais = btnMapa?.dataset?.pais || '';
    const lat = btnMapa?.dataset?.lat || '';
    const lng = btnMapa?.dataset?.lng || '';
    const logoImg = el.querySelector('.card-img-logo');

    const modal = document.getElementById('trivia-mobile-modal');
    if (!modal) return;

    const elEstadio = document.getElementById('trivia-mobile-estadio');
    const elSub = document.getElementById('trivia-mobile-sub');
    const elTexto = document.getElementById('trivia-mobile-texto');
    const elShield = document.getElementById('trivia-mobile-shield');
    const btnMapModal = document.getElementById('trivia-mobile-btn-mapa');
    const btnVidModal = document.getElementById('trivia-mobile-btn-video');

    if (elEstadio) elEstadio.textContent = estadio;
    if (elSub) elSub.textContent = sub;
    if (elTexto) elTexto.textContent = triviaText;

    if (elShield) {
        if (logoImg && logoImg.src && logoImg.style.display !== 'none') {
            elShield.src = logoImg.src;
            elShield.alt = sub;
            elShield.style.display = 'inline-block';
        } else {
            elShield.style.display = 'none';
        }
    }

    if (btnMapModal) {
        btnMapModal.onclick = (e) => {
            if (e) e.stopPropagation();
            cerrarModalTriviaMobile();
            if (typeof abrirModalMapa === 'function') {
                abrirModalMapa(estadio, pais, lat, lng);
            }
        };
    }

    if (btnVidModal) {
        btnVidModal.onclick = (e) => {
            if (e) e.stopPropagation();
            cerrarModalTriviaMobile();
            const btnView = card.querySelector('.btn-view');
            if (btnView) {
                btnView.click();
            } else if (typeof abrirModalVideo === 'function') {
                abrirModalVideo(e, card.dataset.linkVideo || '#', false);
            }
        };
    }

    modal.style.display = 'flex';
    if (typeof reproducirSonido === 'function') reproducirSonido('click');

    // Registrar stats y XP de trivia descubierta
    if (typeof userStats !== 'undefined') {
        userStats.triviasVistas = (userStats.triviasVistas || 0) + 1;
        if (estadio && userStats.triviasDescubiertas) userStats.triviasDescubiertas.add(estadio);
        if (typeof guardarStats === 'function') guardarStats();
    }
    if (typeof gridXP === 'function') gridXP(10);
    else if (typeof agregarXP === 'function') agregarXP(10);
}

function cerrarModalTriviaMobile() {
    const modal = document.getElementById('trivia-mobile-modal');
    if (modal) modal.style.display = 'none';
}
window.abrirModalTriviaMobile = abrirModalTriviaMobile;
window.cerrarModalTriviaMobile = cerrarModalTriviaMobile;

document.addEventListener('click', () => document.querySelectorAll('.trivia-balloon').forEach(g => g.classList.remove('active')));

function mostrarSkeletons() {
    const gr = document.querySelector('.grid');
    if (gr) {
        gr.innerHTML = Array(7).fill(0).map(() => 
            `<div class="loading-card"><div class="loading-card-img skeleton"></div><div class="loading-card-body"><div class="skeleton loading-card-title"></div><div class="skeleton loading-card-sub"></div><div class="skeleton loading-card-btn"></div></div></div>`
        ).join('');
    }
}
window.mostrarSkeletons = mostrarSkeletons;

var MAPA_PAIS_A_CAT = {
    'argentina': 'arg',
    'brasil': 'bra',
    'colombia': 'col',
    'españa': 'esp', 'espana': 'esp',
    'inglaterra': 'eng',
    'italia': 'ita',
    'chile': 'chi',
    'francia': 'fra',
    'alemania': 'ger',
    'portugal': 'por',
    'países bajos': 'ned', 'paises bajos': 'ned',
    'méxico': 'mex', 'mexico': 'mex',
    'estados unidos': 'usa', 'ee. uu.': 'usa', 'eeuu': 'usa', 'usa': 'usa',
    'canadá': 'can', 'canada': 'can'
};
window.MAPA_PAIS_A_CAT = MAPA_PAIS_A_CAT;

function resolverUrlFotoClub(club, pais, fotoOriginal, gid) {
    const pLimpio = (pais || '').toLowerCase().trim();
    const gidStr = String(gid || '').trim();

    // 🛡️ Corrección específica para clubes homónimos: Santos Laguna (México) vs Santos (Brasil)
    const clbNorm = (club || '').toLowerCase().trim();
    if (clbNorm.includes('santos laguna') || clbNorm === 'santos laguna' || (clbNorm.includes('santos') && (pLimpio.includes('m\u00e9x') || pLimpio.includes('mex') || gidStr === '120485921'))) {
        return (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'))
            ? 'escudos/santos_laguna_oficial.webp?v=2'
            : 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/santos_laguna_oficial.webp?v=2';
    }

    // 1. 🏆 CATEGORÍA MUNDIAL (Sedes Mundialistas - GID 879164460)
    // En las tarjetas del mundial SIEMPRE debe mostrarse el escudo de la federación
    const titTexto = (document.getElementById('texto-titulo-grilla')?.textContent || '').toUpperCase();
    const esMundial = gidStr === '879164460' || titTexto.includes('MUNDIAL');

    if (esMundial) {
        if (pLimpio.includes('m\u00e9x') || pLimpio.includes('mex')) {
            return 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/mexico.webp';
        }
        if (pLimpio.includes('canad') || pLimpio.includes('can')) {
            return 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/canada.webp';
        }
        return 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/usa.webp';
    }

    // 2. 🛡️ CATEGORÍAS DE LIGAS (Liga MX GID 120485921, MLS GID 450128934, etc.)
    // Si la tarjeta está dentro de una liga, NUNCA debe mostrar el escudo de la federación
    let fotoCandidata = fotoOriginal || '';
    const fotoLimpia = fotoCandidata.toLowerCase();
    const esFederacion = fotoLimpia.endsWith('mexico.webp') || fotoLimpia.endsWith('mexico.png') ||
                         fotoLimpia.endsWith('usa.webp') || fotoLimpia.endsWith('usa.png') ||
                         fotoLimpia.endsWith('canada.webp') || fotoLimpia.endsWith('canada.png');
    if (esFederacion) {
        fotoCandidata = '';
    }

    if (club && typeof BANDERAS_LISTA !== 'undefined' && typeof ESCUDOS_MAP !== 'undefined') {
        const limpiar = (txt) => (txt || '')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "")
            .trim();

        const cLimpio = limpiar(club);
        const catPais = MAPA_PAIS_A_CAT[pLimpio] || '';

        // 1. Filtrar preferentemente los clubes del país de la tarjeta
        const poolClubes = catPais
            ? BANDERAS_LISTA.filter(b => b.cat === catPais)
            : BANDERAS_LISTA.filter(b => b.cat !== 'paises');

        // 2. Coincidencia EXACTA dentro de su propio país
        let item = poolClubes.find(b => limpiar(b.label) === cLimpio);

        // 3. Si no hay exacta, coincidencia parcial dentro del mismo país
        if (!item) {
            item = poolClubes.find(b => {
                const bLimpio = limpiar(b.label);
                return bLimpio.includes(cLimpio) || cLimpio.includes(bLimpio);
            });
        }

        // 4. Fallback global únicamente si no coincidió en el país
        if (!item) {
            const todosClubes = BANDERAS_LISTA.filter(b => b.cat !== 'paises');
            item = todosClubes.find(b => limpiar(b.label) === cLimpio);
        }

        if (item && ESCUDOS_MAP[item.id]) {
            const urlClub = ESCUDOS_MAP[item.id];
            const urlClubLow = (urlClub || '').toLowerCase();
            if (!urlClubLow.endsWith('mexico.webp') && !urlClubLow.endsWith('usa.webp') && !urlClubLow.endsWith('canada.webp')) {
                return urlClub;
            }
        }
    }

    if (fotoCandidata) {
        if (!fotoCandidata.startsWith('http')) {
            return 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/' + fotoCandidata;
        }
        return fotoCandidata;
    }

    return '';
}
window.resolverUrlFotoClub = resolverUrlFotoClub;

function renderizarTarjetas(lista) {
    const gr = document.querySelector('.grid');
    if (!gr) return;
    gr.innerHTML = '';
    if (!lista || !lista.length) {
        gr.innerHTML = `<div class="empty-state"><i class="ph-duotone ph-magnifying-glass empty-state-icon"></i><h3>Sin resultados</h3><p>No se encontraron estadios que coincidan.</p></div>`;
        return;
    }
    const estadiosVisitados = JSON.parse(localStorage.getItem('ev_estadios_visitados') || '[]');
    const estadiosDeseados = JSON.parse(localStorage.getItem('ev_estadios_deseados') || '[]');

    lista.forEach((fila, idx) => {
        const estadio = bscarPropiedad(fila, 'Estadio'),
              club = bscarPropiedad(fila, 'Club');
        if (!estadio || !club) return;
        const fotoDb = bscarPropiedad(fila, 'Foto')?.trim() || '';
        const pais = bscarPropiedad(fila, 'País')?.trim() || 'Argentina';
        const gid = bscarPropiedad(fila, 'GID')?.toString().trim() || '';
        const urlFoto = resolverUrlFotoClub(club, pais, fotoDb, gid);
        const fond = obtenerFondoClub(club, pais),
              linkVideo = bscarPropiedad(fila, 'Link del Video')?.trim() || '#',
              latR = bscarPropiedad(fila, 'Latitud')?.toString().trim() || '',
              lngR = bscarPropiedad(fila, 'Longitud')?.toString().trim() || '',
              dato = bscarPropiedad(fila, 'Dato Curioso');
        const datoL = (dato || '¡Este estadio esconde grandes historias!').replace(/'/g, "\u2019").replace(/"/g, "\u201C");
        
        const promsMap = (typeof promediosSupabase !== 'undefined' ? promediosSupabase : (window.promediosSupabase || {}));
        const datoSupa = promsMap[estadio];
        let prom = parseFloat(bscarPropiedad(fila, 'Promedio')) || 0;
        let textoTotalVotos = "";

        if (datoSupa) {
            prom = datoSupa.promedio * 2;
            textoTotalVotos = ` (${datoSupa.total} votos)`;
        }

        const vL = obtenerVotoLocal(estadio);
        const yaVoto = (vL > 0);

        // 🌟 Cálculo del promedio continuo exacto en escala 0 a 5 estrellas:
        const prom5 = prom > 0 ? (prom / 2) : 0;
        const notaEstrellas = prom5 > 0 ? prom5 : (yaVoto ? vL : 0);
        const pctFill = Math.max(0, Math.min(100, (notaEstrellas / 5) * 100));

        const estadioSafe = estadio.replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
              clubSafe = club.replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
              paisSafe = pais.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        const ratingTooltip = prom5 > 0 
            ? `Nota promedio: ${prom5.toFixed(2)} / 5${yaVoto ? ` · Tu voto: ${vL}★` : ''}`
            : (yaVoto ? `Tu voto: ${vL}★` : 'Aún sin calificaciones');

        const estrellasHTML = `
            <div class="stars-precise-container ${yaVoto ? 'voted' : ''}" data-estadio="${estadioSafe}" data-club="${clubSafe}" title="${ratingTooltip}">
                <div class="stars-bg">
                    <i class="ph-fill ph-star"></i>
                    <i class="ph-fill ph-star"></i>
                    <i class="ph-fill ph-star"></i>
                    <i class="ph-fill ph-star"></i>
                    <i class="ph-fill ph-star"></i>
                </div>
                <div class="stars-fill" style="width: ${pctFill.toFixed(2)}%;">
                    <div class="stars-fill-inner">
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                    </div>
                </div>
                <div class="stars-hitbox-overlay">
                    <span class="star-hitbox" onclick="registrarVoto(event, '${estadioSafe}', '${clubSafe}', 1)" title="${yaVoto ? `Ya votaste ${vL}★` : 'Calificar 1 estrella'}"></span>
                    <span class="star-hitbox" onclick="registrarVoto(event, '${estadioSafe}', '${clubSafe}', 2)" title="${yaVoto ? `Ya votaste ${vL}★` : 'Calificar 2 estrellas'}"></span>
                    <span class="star-hitbox" onclick="registrarVoto(event, '${estadioSafe}', '${clubSafe}', 3)" title="${yaVoto ? `Ya votaste ${vL}★` : 'Calificar 3 estrellas'}"></span>
                    <span class="star-hitbox" onclick="registrarVoto(event, '${estadioSafe}', '${clubSafe}', 4)" title="${yaVoto ? `Ya votaste ${vL}★` : 'Calificar 4 estrellas'}"></span>
                    <span class="star-hitbox" onclick="registrarVoto(event, '${estadioSafe}', '${clubSafe}', 5)" title="${yaVoto ? `Ya votaste ${vL}★` : 'Calificar 5 estrellas'}"></span>
                </div>
            </div>`;
        const lRating = 'Calificá';
        const imgHTML = urlFoto 
            ? `<img class="card-img-logo" src="${urlFoto}" alt="${clubSafe}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><div class="placeholder-text" style="display:none;">${club}</div>` 
            : `<div class="placeholder-text">${club}</div>`;
            
        const yaFui = estadiosVisitados.includes(estadio);
        const quieroIr = estadiosDeseados.includes(estadio);

        const t = document.createElement('article');
        t.className = 'card animate-fade-up';
        t.style.animationDelay = `${idx * .04}s`;
        t.dataset.linkVideo = linkVideo;
        t.innerHTML = `<div class="estadio-foto-container" style="background:${fond};" onclick="toggleTriviaPopup(event,this)"><div class="trivia-hint" title="Dato curioso"><i class="ph-fill ph-lightbulb"></i></div>${imgHTML}<div class="trivia-balloon" onclick="event.stopPropagation()"><div class="balloon-tabs"><button class="b-tab active" onclick="switchTab(event,this,'trivia')">Trivia</button><button class="b-tab" data-estadio="${estadioSafe}" data-pais="${paisSafe}" data-lat="${latR}" data-lng="${lngR}" onclick="switchTabMapa(event,this)">Mapa</button></div><div class="b-content b-trivia active"><p>${datoL}</p></div><div class="b-content b-mapa"></div></div></div><div class="card-content"><h2 class="card-title">${estadio}</h2><p class="card-subtitle">${club} · ${pais}</p><button onclick="abrirVideoDesdeCard(event,this)" class="btn-view"><i class="ph-fill ph-play-circle"></i> Ver Estadio</button><div class="fan-checklist-row"><button type="button" class="fan-badge-btn fan-fui ${yaFui ? 'active' : ''}" onclick="toggleFanChecklist(event, '${estadioSafe}', 'yaFui')"><i class="ph-bold ph-map-pin"></i> <span>Ya fui</span></button><button type="button" class="fan-badge-btn fan-quiero ${quieroIr ? 'active' : ''}" onclick="toggleFanChecklist(event, '${estadioSafe}', 'quieroIr')"><i class="ph-bold ph-star"></i> <span>Quiero ir</span></button></div><div class="rating-box"><span class="rating-title">${lRating}</span>${estrellasHTML}</div></div>`;
        gr.appendChild(t);
    });
}
window.renderizarTarjetas = renderizarTarjetas;

function toggleFanChecklist(event, estadio, tipo) {
    if (event) event.stopPropagation();
    if (typeof reproducirSonido === 'function') reproducirSonido('click');
    const key = tipo === 'yaFui' ? 'ev_estadios_visitados' : 'ev_estadios_deseados';
    let lista = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = lista.indexOf(estadio);
    const btn = event.currentTarget || event.target.closest('.fan-badge-btn');

    if (idx >= 0) {
        lista.splice(idx, 1);
        if (btn) btn.classList.remove('active');
        if (typeof showToast === 'function') {
            showToast(tipo === 'yaFui' ? `Removido de visitados: ${estadio}` : `Removido de deseados: ${estadio}`);
        }
    } else {
        lista.push(estadio);
        if (btn) btn.classList.add('active');
        if (typeof showToast === 'function') {
            showToast(tipo === 'yaFui' ? `📍 ¡Marcaste ${estadio} como visitado!` : `⭐ ¡Agregaste ${estadio} a tu lista de deseos!`);
        }
    }
    localStorage.setItem(key, JSON.stringify(lista));
}
window.toggleFanChecklist = toggleFanChecklist;

function aplicarFiltroRapido(tipo) {
    if (typeof reproducirSonido === 'function') reproducirSonido('click');
    const catLayout = document.getElementById('catalogo-layout');
    if (catLayout) catLayout.classList.add('open');
    const tit = document.getElementById('texto-titulo-grilla');
    const gs = document.getElementById('global-search');

    if (!catalogoGlobal || catalogoGlobal.length === 0) {
        if (typeof showToast === 'function') showToast("Cargando catálogo...");
        return;
    }

    if (tipo === 'populares') {
        if (gs) gs.value = '';
        if (tit) tit.textContent = '🔥 ESTADIOS MÁS POPULARES';
        const ordenados = [...catalogoGlobal].sort((a, b) => {
            const promA = parseFloat(bscarPropiedad(a, 'Promedio')) || 0;
            const promB = parseFloat(bscarPropiedad(b, 'Promedio')) || 0;
            return promB - promA;
        });
        renderizarTarjetas(ordenados.slice(0, 36));
        catLayout?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tipo === 'mundial') {
        if (gs) gs.value = 'Mundial';
        if (tit) tit.textContent = '🏆 SEDES MUNDIALISTAS';
        const porGid = catalogoGlobal.filter(f => String(bscarPropiedad(f, 'GID')).trim() === '879164460');
        const filtrados = porGid.length ? porGid : catalogoGlobal.filter(f => {
            const txt = (bscarPropiedad(f, 'Estadio') + ' ' + bscarPropiedad(f, 'Club') + ' ' + bscarPropiedad(f, 'Dato Curioso') + ' ' + bscarPropiedad(f, 'País')).toLowerCase();
            return txt.includes('mundial') || txt.includes('world cup') || txt.includes('fifa');
        });
        renderizarTarjetas(filtrados.length ? filtrados : catalogoGlobal.slice(0, 30));
        catLayout?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tipo === '70k') {
        if (gs) gs.value = '';
        if (tit) tit.textContent = '🏟️ ESTADIOS GIGANTES (+70.000 CAP.)';
        const filtrados = catalogoGlobal.filter(f => {
            const capRaw = bscarPropiedad(f, 'Capacidad') || '0';
            const num = parseInt(String(capRaw).replace(/\D/g, ''), 10) || 0;
            return num >= 70000;
        }).sort((a, b) => {
            const capA = parseInt(String(bscarPropiedad(a, 'Capacidad') || '0').replace(/\D/g, ''), 10) || 0;
            const capB = parseInt(String(bscarPropiedad(b, 'Capacidad') || '0').replace(/\D/g, ''), 10) || 0;
            return capB - capA;
        });
        renderizarTarjetas(filtrados);
        catLayout?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tipo === 'aleatorio') {
        const azar = catalogoGlobal[Math.floor(Math.random() * catalogoGlobal.length)];
        if (azar) {
            const link = bscarPropiedad(azar, 'Link del Video') || '#';
            const est = bscarPropiedad(azar, 'Estadio') || 'Estadio';
            if (typeof showToast === 'function') showToast(`✈️ Volando a: ${est}`);
            if (typeof reproducirSonido === 'function') reproducirSonido('whoosh');
            if (typeof abrirModalVideo === 'function') {
                abrirModalVideo(null, link, false);
            }
        }
    }
}
window.aplicarFiltroRapido = aplicarFiltroRapido;

function abrirVideoDesdeCard(event, btn) {
    if (event) event.stopPropagation();
    if (typeof reproducirSonido === 'function') reproducirSonido('whoosh');
    const c = btn.closest('.card');
    if (typeof userStats !== 'undefined') {
        userStats.vuelosAleatorios = (userStats.vuelosAleatorios || 0) + 1;
        if (typeof guardarStats === 'function') guardarStats();
    }
    if (typeof window.trackEvento === 'function') {
        const estadioNom = c?.querySelector('.card-title')?.textContent?.trim() || 'Estadio';
        window.trackEvento('estadio_visto', { estadio: estadioNom });
    }
    if (typeof abrirModalVideo === 'function') {
        abrirModalVideo(event, c?.dataset.linkVideo || '#', false);
    }
}
window.abrirVideoDesdeCard = abrirVideoDesdeCard;

// Evento del buscador global
let debounceSearchGA = null;
const globalSearchInput = document.getElementById('global-search');
if (globalSearchInput) {
    globalSearchInput.addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase().trim();
        clearTimeout(debounceSearchGA);
        if (term.length >= 3 && typeof window.trackEvento === 'function') {
            debounceSearchGA = setTimeout(() => {
                window.trackEvento('busqueda_estadio', { termino: term });
            }, 1200);
        }
        if (term === '') {
            const last = localStorage.getItem('ev_last_gid');
            if (last) renderizarTarjetas(estadiosCargados);
            else mostrarLigas();
        } else {
            const catLayout = document.getElementById('catalogo-layout');
            if (catLayout) catLayout.classList.add('open');
            const tit = document.getElementById('texto-titulo-grilla');
            if (tit) tit.textContent = `BÚSQUEDA: "${e.target.value.toUpperCase()}"`;
            renderizarTarjetas(catalogoGlobal.filter(f => [
                bscarPropiedad(f, 'Estadio'),
                bscarPropiedad(f, 'Club'),
                bscarPropiedad(f, 'País')
            ].some(v => (v || '').toLowerCase().includes(term))));
        }
    });
}

// ========================================================
// CARGA Y FILTRADO POR LIGA (DESDE SUPABASE)
// ========================================================
function cargarLiga(gid) {
    mostrarSkeletons();
    const gs = document.getElementById('global-search');
    if (gs) gs.value = '';
    
    // 🛡️ ESCUDO: Si el catálogo de Supabase tarda un milisegundo de más en cargar, reintentamos
    if (!catalogoGlobal || catalogoGlobal.length === 0) {
        setTimeout(() => cargarLiga(gid), 200);
        return;
    }
    
    // Filtramos el catálogo que ya tenemos en memoria por su GID
    estadiosCargados = catalogoGlobal.filter(f => 
        String(bscarPropiedad(f, 'GID')).trim() === String(gid).trim() &&
        bscarPropiedad(f, 'Estadio') && 
        bscarPropiedad(f, 'Club')
    );
    window.estadiosCargados = estadiosCargados;
    
    renderizarTarjetas(estadiosCargados);
}
window.cargarLiga = cargarLiga;

async function indexarCatalogoMasivo() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error("Supabase no está listo para cargar el catálogo.");
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('estadios_catalogo')
            .select('*');

        if (error) throw error;

        // 🛡️ Filtro anti-duplicados: conserva solo un registro único por GID + Estadio + Club
        const estadiosVistos = new Set();
        const filasUnicas = (data || []).filter(fila => {
            const clave = `${String(fila.gid || '').trim()}_${(fila.estadio || '').trim().toLowerCase()}_${(fila.club || '').trim().toLowerCase()}`;
            if (!clave || clave === '__' || estadiosVistos.has(clave)) return false;
            estadiosVistos.add(clave);
            return true;
        });

        catalogoGlobal = filasUnicas.map(fila => {
            let foto = (fila.foto || '').replace(/\.png$/i, '.webp');
            const clb = (fila.club || '').trim().toLowerCase();
            const ps = (fila.pais || '').trim().toLowerCase();
            const gidStr = String(fila.gid || '').trim();
            
            // 🛡️ Copa del Mundo (Sedes Mundialistas): Asignar escudo oficial de federación
            if (gidStr === '879164460') {
                if (ps.includes('m\u00e9x') || ps.includes('mex')) {
                    foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/mexico.webp';
                } else if (ps.includes('canad') || ps.includes('can')) {
                    foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/canada.webp';
                } else {
                    foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/usa.webp';
                }
            } else {
                // Si la URL es relativa (ej: 'america.webp', 'pumas.webp'), anteponer la URL base
                if (foto && !foto.startsWith('http')) {
                    foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/' + foto;
                }
            }

            // 🛡️ Corrección de mayúsculas/minúsculas de Linux y clubes homónimos
            if (clb === 'everton' && ps.includes('inglaterra')) {
                foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/Everton.webp';
            } else if (clb.includes('everton') && ps.includes('chile')) {
                foto = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Everton_De_Vi%C3%B1a_Del_Mar.png';
            } else if (clb.includes('gimnasia y tiro')) {
                foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/GYT.webp';
            } else if (clb === 'vitória' || clb === 'vitoria') {
                foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/Vitoria.webp';
            } else if (clb === 'austin fc' || foto.includes('AustinFC') || foto.includes('austinfc')) {
                foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/austin.webp';
            } else if ((clb.includes('atlanta united') && gidStr !== '879164460') || foto.includes('AtlantaUnited') || foto.includes('atlantaunited')) {
                foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/atlanta.webp';
            } else if (clb.includes('real salt lake') || (foto.includes('RealSaltLake') || (foto.includes('realsaltlake') && !foto.includes('realstaltlake')))) {
                foto = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/realstaltlake.webp';
            } else if ((clb.includes('santos laguna') || clb === 'santos laguna') || (clb.includes('santos') && (ps.includes('mex') || ps.includes('m\u00e9x') || gidStr === '120485921'))) {
                foto = (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'))
                    ? 'escudos/santos_laguna_oficial.webp?v=2'
                    : 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/santos_laguna_oficial.webp?v=2';
            }

            return {
                'Estadio': fila.estadio,
                'Club': fila.club,
                'País': fila.pais,
                'Foto': foto,
                'Link del Video': fila.link_video,
                'Latitud': fila.latitud,
                'Longitud': fila.longitud,
                'Dato Curioso': fila.dato_curioso,
                'Capacidad': fila.capacidad,
                'Año': fila.anio,
                'Promedio': fila.promedio,
                'GID': fila.gid
            };
        });

        console.log(`¡Catálogo global migrado y cargado en memoria! (${catalogoGlobal.length} estadios)`);
        estadiosCargados = [...catalogoGlobal];
        window.catalogoGlobal = catalogoGlobal;
        window.estadiosCargados = estadiosCargados;

        // Sincroniza en memoria el escudo guardado del usuario apenas baja el catálogo
        if (typeof getPref === 'function' && typeof obtenerUrlEscudo === 'function') {
            const savedLogo = getPref('ev_avatar_logo', 'ev');
            if (savedLogo && savedLogo !== 'ev') {
                const urlReal = obtenerUrlEscudo(savedLogo);
                const futClub = document.getElementById('fut-club-display');
                if (futClub && urlReal) {
                    futClub.src = urlReal;
                    futClub.setAttribute('referrerpolicy', 'no-referrer');
                }
            }
        }
        
    } catch (err) {
        console.error("Error al descargar el catálogo masivo:", err);
        if (typeof showToast === 'function') showToast("Error al cargar los estadios.", "ph-warning-circle", "danger");
    }
}
window.indexarCatalogoMasivo = indexarCatalogoMasivo;

function dispararVueloAleatorio(e) {
    const pool = (catalogoGlobal && catalogoGlobal.length > 0) ? catalogoGlobal : estadiosCargados;
    if (!pool || !pool.length) {
        if (typeof showToast === 'function') showToast('Esperá que cargue el catálogo...', 'ph-info', 'danger');
        return;
    }
    const cv = pool.filter(f => {
        const l = bscarPropiedad(f, 'Link del Video').toString().trim();
        return (l.includes('youtube.com') || l.includes('youtu.be')) && !l.includes('[Pegá tu link');
    });
    if (!cv.length) {
        if (typeof showToast === 'function') showToast('No hay videos disponibles.', 'ph-warning-circle', 'danger');
        return;
    }
    if (typeof userStats !== 'undefined') {
        userStats.vuelosAleatorios = (userStats.vuelosAleatorios || 0) + 1;
        if (typeof guardarStats === 'function') guardarStats();
    }
    if (typeof abrirModalVideo === 'function') {
        abrirModalVideo(e, bscarPropiedad(cv[Math.floor(Math.random() * cv.length)], 'Link del Video').trim(), false);
    }
}
window.dispararVueloAleatorio = dispararVueloAleatorio;
