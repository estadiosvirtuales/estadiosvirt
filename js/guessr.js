// =============================================================================
// 🏟️ ESTADIOS VIRTUALES - MÓDULO STADIUMGUESSR, VERSUS 1V1, RANKING Y LIGAS PRIVADAS
// =============================================================================
// Contenido:
// - Variables de estado globales y de partida
// - Modal de Video (YouTube / MP4) y teardown seguro de partida
// - Modales de selección de dificultad (Individual, 1v1 Global, Sala Privada, Desafío)
// - Motor 1v1 Versus (matchmaking, WebSockets Realtime, bots autónomos, scoreboards)
// - Motor StadiumGuessr Solo (Haversine, cálculo de puntaje, mapa flotante Leaflet)
// - Reto Diario tipo Wordle (semilla pseudoaleatoria por fecha)
// - Salón de la Fama y Rankings Globales (Solo, Semanal, Histórico, Diario)
// - Mini Ligas de Amigos Privadas (tablas en tiempo real, invitaciones, presencia)
// =============================================================================

// Variables de estado y control
var guessrRondaActual = 0;
var guessrPuntosTotales = 0;
var rivalPuntosTotales = 0;
var guessrEstadioCorrecto = null;
var guessrEstadiosJugados = [];
var guessrHistorialRondas = [];
var guessrHistorialCoordenadas = [];
var guessrDificultad = 'medio';
var guessrTimerIndividualInterval = null;
var guessrTiempoRestanteIndividual = 45;
var guessrMapInstance = null;
var guessrUserMarker = null;
var guessrTargetMarker = null;
var guessrPolyline = null;
var guessrSelectedLatLng = null;
var pendingScore = null;
var pendingScoreType = null;
var destinoDificultadActual = { modo: '', extra: null };

var ligaAmigosChannel = null;
var usuariosOnlineLiga = [];
var cacheTop15Ligas = [];
var cacheTriunfosLiga = null;
var cacheOnceLiga = null;
var vistaLigaActual = 'puntaje';
var subVistaGuessrActual = 'puntaje';
var versusLigaOrigen = null;

var esModoVersus = false;
var esModoDiario = false;
var estadiosDiariosList = [];
var versusPartidaId = null;
var versusRol = null;
var versusEstadios = [];
var versusChannel = null;
var versusPartidaEnCurso = false;

var miGuessConfirmado = false;
var rivalGuessConfirmado = false;
var rivalDataRonda = null;
var miListoSiguiente = false;
var rivalListoSiguiente = false;
var versusTimerInterval = null;
var versusCountdownInterval = null;
var versusTiempoRestante = 15;
var handshakeInterval = null;
var rivalForcedTimeout = false;
var resultadosRondaMostrados = false;
var esModoBot = false;
var versusTimeoutBusqueda = null;
var matchmakingInterval = null;
var botAntesTimer = null;
var versusRivalNombre = 'RIVAL';

var nombreLigaActivaCache = '';
var miNombreRankingLiga = '';
var timeoutRetoDirecto = null;
var timerAbandono = null;
var cacheAvataresUsuarios = window.cacheAvataresUsuarios || {};


// --- Modales de video y dificultad ---

function abrirModalVideo(event,link,esJuego=false){
    if(event)event.preventDefault();
    if(!link||link==='#'||link.includes('[Pegá tu link')){
        showToast('Video de este estadio no disponible.','ph-warning-circle','danger');
        return;
    }
    
    document.body.classList.add('video-abierto');
    
    const modal=document.getElementById('video-modal'),card=document.getElementById('modal-card'),container=document.getElementById('modal-video-container');
    container.innerHTML='';
    card.classList.remove('resultado-final-layout');
    const gameUi=document.getElementById('game-ui');
    card.classList.remove('resultado-final');
    
    if(esJuego){
        card.classList.remove('resultado-final', 'resultado-final-layout');
        card.classList.add('stadium-guessr-layout');
        gameUi.style.display='block';
    }else{
        card.classList.remove('stadium-guessr-layout', 'resultado-final', 'resultado-final-layout');
        gameUi.style.display='none';
        container.style.height='100%';
    }
    
    let url=link;
    if(link.includes('youtube.com')||link.includes('youtu.be')){
        let vid='';
        
        // 👇 Escáner blindado que encuentra el ID del video sin importar cómo se haya pegado
        const match = link.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w\-]{11})/i);
        if (match && match[1]) {
            vid = match[1];
        }
        
        // 🚀 PARÁMETROS BLINDADOS PARA MÓVIL (Sin congelamientos a los 3 segundos)
        const params = "autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=https://www.estadiosvirtuales.com";
        const qp = esJuego ? `?${params}&mute=1&controls=0` : `?${params}`;
        
       if(vid) {
            url=`https://www.youtube.com/embed/${vid}${qp}`;
        }
        
        // ⚡ SIN MARGEN NEGATIVO: El iframe se mantiene 100% visible para evitar el bloqueo del decodificador de Chrome Móvil
        const est="width:100%;height:100%;border:none;";
        const mascaraHTML = esJuego ? `<div class="yt-title-mask"><div class="yt-badge-pill"><img src="mundo.webp" alt="Logo" class="yt-mask-icon"><span>STADIUMGUESSR</span></div></div>` : '';
        container.innerHTML=`${mascaraHTML}<iframe src="${url}" style="${est}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        
    }else if(link.toLowerCase().endsWith('.mp4')||link.includes('.mp4?')){
        // Video MP4 nativo con playsinline para iOS
        const attr=esJuego?"autoplay loop muted playsinline":"controls autoplay playsinline";
        container.innerHTML=`<video ${attr} style="width:100%;height:100%;object-fit:cover;"><source src="${link}" type="video/mp4"></video>`;
    }else{
        container.innerHTML=`<iframe src="${url}" style="width:100%;height:100%;border:none;" allow="autoplay; encrypted-media"></iframe>`;
    }

    modal.style.display='flex';
}

function cerrarModalVideo(){
    document.body.classList.remove('video-abierto');
    
    // 👇 OCULTAMOS LA BOTONERA DE REACCIONES AL CERRAR LA CANCHA 👇
    if (document.getElementById('taunts-container')) {
        document.getElementById('taunts-container').style.display = 'none';
    }
    // 🛡️ ESCUDO DE ABANDONO MANUAL: Si cerrás la ventana con la cruz en medio de un Versus, liquidamos la sesión
    if (esModoVersus && versusChannel) {
        try {
            // Le avisamos al rival en tiempo real para otorgarle su victoria instantánea
            versusChannel.send({ type: 'broadcast', event: 'rival_abandono', payload: {} });
            if (supabaseClient) supabaseClient.removeChannel(versusChannel);
        } catch(err) { 
            console.error("Error al remover canal en cierre manual:", err); 
        }
        
        // Apagamos todos los motores e intervalos de la partida en esta pestaña
        if (handshakeInterval) clearInterval(handshakeInterval);
        if (versusTimerInterval) clearInterval(versusTimerInterval);
        if (botAntesTimer) clearTimeout(botAntesTimer);
        handshakeInterval = versusTimerInterval = botAntesTimer = null;
        
        esModoVersus = false;
        versusPartidaEnCurso = false;
    }

    // Código clásico de limpieza visual (Sigue haciendo lo mismo de siempre abajo)
    if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);
    if (versusCountdownInterval) { clearInterval(versusCountdownInterval); versusCountdownInterval = null; }
    document.querySelectorAll('.stamp-badge, #versus-next-round-banner, .taunt-arcade-burst').forEach(el => { try { el.remove(); } catch(e) {} });
    const sb = document.getElementById('versus-live-scoreboard');
    if (sb) sb.style.display = 'none';
    const gt = document.getElementById('game-title');
    if (gt) gt.style.display = 'inline-flex';
    const hud = document.querySelector('.guessr-top-hud');
    if (hud) hud.classList.remove('hud-versus-active');
    document.getElementById('video-modal').style.display='none';document.getElementById('modal-video-container').innerHTML='';document.getElementById('game-ui').style.display='none';document.getElementById('modal-card').classList.remove('stadium-guessr-layout');document.getElementById('modal-card').classList.remove('resultado-final');
    try{if(guessrMapInstance){guessrMapInstance.remove();guessrMapInstance=null;}}catch(e){guessrMapInstance=null;}
    try{if(guessrUserMarker)guessrUserMarker.remove();}catch(e){}try{if(guessrTargetMarker)guessrTargetMarker.remove();}catch(e){}try{if(guessrPolyline)guessrPolyline.remove();}catch(e){}
    guessrUserMarker=guessrTargetMarker=guessrPolyline=null;guessrSelectedLatLng=null;
    guessrRondaActual = 0;
    verificarSobreBienvenidaPostPartida();
}

function cerrarModalRanking(){
    document.getElementById('ranking-modal').style.display='none';
    verificarSobreBienvenidaPostPartida();
}

// (destinoDificultadActual declarado arriba)

function abrirModalGuessr() {
    destinoDificultadActual = { modo: '', extra: null };
    volverAModosGuessr();
    document.getElementById('guessr-modal').style.display = 'flex';
}

function cerrarModalGuessr() {
    document.getElementById('guessr-modal').style.display = 'none';
}

window.mostrarPasoDificultad = function(modo, extra = null) {
    destinoDificultadActual = { modo: modo, extra: extra };
    
    const vModos = document.getElementById('guessr-view-modos');
    const vDiff = document.getElementById('guessr-view-dificultad');
    const title = document.getElementById('guessr-modal-title');
    const sub = document.getElementById('guessr-modal-sub');

    if (vModos) vModos.style.display = 'none';
    if (vDiff) vDiff.style.display = 'flex';

    if (title) title.textContent = 'Elegí la Dificultad';
    if (sub) {
        if (modo === 'solo') sub.textContent = 'Modo Individual';
        else if (modo === 'versus_global') sub.textContent = '1 vs 1 Global (Emparejamiento por dificultad)';
        else if (modo === 'sala_privada') sub.textContent = 'Sala Privada por Link';
        else if (modo === 'reto_amigo') sub.textContent = `Desafío contra ${extra || 'tu amigo'}`;
    }

    document.getElementById('guessr-modal').style.display = 'flex';
};

window.volverAModosGuessr = function() {
    const vModos = document.getElementById('guessr-view-modos');
    const vDiff = document.getElementById('guessr-view-dificultad');
    const title = document.getElementById('guessr-modal-title');
    const sub = document.getElementById('guessr-modal-sub');

    if (destinoDificultadActual.modo === 'reto_amigo') {
        cerrarModalGuessr();
        abrirModalLigaAmigosPrivada();
        destinoDificultadActual = { modo: '', extra: null };
        return;
    }

    if (vModos) vModos.style.display = 'flex';
    if (vDiff) vDiff.style.display = 'none';
    if (title) title.textContent = 'StadiumGuessr';
    if (sub) sub.textContent = 'Elegí un modo de reconocimiento.';
    destinoDificultadActual = { modo: '', extra: null };
};

window.confirmarDificultadYEliminarModal = function(diff) {
    guessrDificultad = diff;
    const modo = destinoDificultadActual.modo;
    const extra = destinoDificultadActual.extra;
    destinoDificultadActual = { modo: '', extra: null };
    
    cerrarModalGuessr();
    
    if (modo === 'solo') {
        iniciarTrivia(diff);
    } else if (modo === 'versus_global') {
        buscarPartidaVersus();
    } else if (modo === 'sala_privada') {
        crearSalaPrivada();
    } else if (modo === 'reto_amigo') {
        ejecutarDesafioAmigoDirecto(extra, diff);
    }
};

// --- Motor Guessr, Versus 1v1 y Salón de la Fama ---

async function precargarAvataresComunidad() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('perfiles')
            .select('datos_juego')
            .limit(500);
        if (!error && data) {
            data.forEach(p => {
                const nick = p.datos_juego?.preferencias?.custom_nick;
                const avatar = p.datos_juego?.preferencias?.avatar_hair;
                if (nick && avatar) {
                    let av = String(avatar).replace(/\.png$/i, '.webp').trim();
                    if (!av.includes('.')) av += '.webp';
                    if (typeof AVATARES_LISTA === 'undefined' || AVATARES_LISTA.some(a => a.id === av)) {
                        cacheAvataresUsuarios[nick.trim().toLowerCase()] = av;
                    }
                }
            });
        }
    } catch(e) {}
}

window.filtrarJugadoresRanking = function(term) {
    const q = (term || '').toLowerCase().trim();
    const filas = document.querySelectorAll('.ranking-right-panel .liga-table-card .liga-row-item:not(.sticky-user-row)');
    filas.forEach(f => {
        const nombreEl = f.querySelector('.inspect-clickable-user');
        const nombre = nombreEl ? nombreEl.textContent.toLowerCase() : '';
        f.style.display = (!q || nombre.includes(q)) ? 'flex' : 'none';
    });
};

// (Variables de estado versus y ligas declaradas arriba)     // Si el rival no entra a la sala a tiempo, avisamos y cancelamos
// ========================================================
// IDENTIFICADOR ÚNICO DE RED (ANTI-COLISIÓN DE INVITADOS)
// ========================================================
function obtenerIdRedVersus() {
    const u = obtenerUsuarioLogueado();
    if (u && u.id && u.id !== 'guest') return u.id;
    let guestId = sessionStorage.getItem('ev_guest_versus_id');
    if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        sessionStorage.setItem('ev_guest_versus_id', guestId);
    }
    return guestId;
}

// ⏳ CREA EL CONTADOR VISUAL FLOTANTE DE TIEMPO EN COLA
function abrirLobbyEspera() {
    cerrarLobbyEspera(); 
    let tiempoSegundos = 0;
    
    const lobby = document.createElement('div');
    lobby.id = 'matchmaking-lobby';
    lobby.style.cssText = `
        position: fixed; 
        top: 24px; 
        left: 0; 
        right: 0; 
        margin: 0 auto;
        width: max-content;
        max-width: 90%;
        background: var(--glass-bg); 
        border: 2px solid var(--border-strong);
        padding: 14px 28px; 
        border-radius: 16px; 
        z-index: 99999;
        display: flex; 
        align-items: center; 
        justify-content: center;
        gap: 14px; 
        font-weight: 800;
        color: var(--text-main); 
        box-shadow: var(--shadow-strong);
        backdrop-filter: blur(12px); 
        -webkit-backdrop-filter: blur(12px);
        font-size: 0.95rem; 
        letter-spacing: -0.2px;
        animation: fadeSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    `;
    
    const nomDiff = guessrDificultad === 'facil' ? 'Promesa' : guessrDificultad === 'dificil' ? 'Leyenda' : 'Crack';

    lobby.innerHTML = `
        <i class="ph-bold ph-circle-notch animate-spin" style="color:var(--accent-color); font-size:1.2rem;"></i>
        <span>Buscando rival (${nomDiff})... <b style="color:var(--accent-color); margin-left: 4px;">0:00</b></span>
        <i class="ph-bold ph-x" style="cursor:pointer; margin-left: 12px; color:var(--text-muted); font-size:1.1rem; transition:color 0.2s;" 
           onmouseover="this.style.color='var(--danger-color)'" 
           onmouseout="this.style.color='var(--text-muted)'" 
           onclick="cancelarBusquedaVersus()"></i>
    `;
    document.body.appendChild(lobby);

    matchmakingInterval = setInterval(() => {
        tiempoSegundos++;
        const mins = Math.floor(tiempoSegundos / 60);
        const secs = tiempoSegundos % 60;
        const tiempoFormateado = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        const textoLobby = lobby.querySelector('span');
        if (textoLobby) {
            textoLobby.innerHTML = `Buscando rival (${nomDiff})... <b style="color:var(--accent-color); margin-left: 4px;">${tiempoFormateado}</b>`;
        }
    }, 1000);
}

// 🛑 CANCELA EL MATCHMAKING Y DESCONECTA LOS CANALES DE SUPABASE
async function cancelarBusquedaVersus() {
    cerrarLobbyEspera(); 
    
    if (versusTimeoutBusqueda) {
        clearTimeout(versusTimeoutBusqueda);
        versusTimeoutBusqueda = null;
    }
    if (handshakeInterval) {
        clearInterval(handshakeInterval);
        handshakeInterval = null;
    }
    
    if (versusChannel) {
        versusChannel.unsubscribe();
        versusChannel = null;
    }

    if (versusPartidaId && !versusPartidaId.startsWith('PRIV_') && !versusPartidaEnCurso) {
        try {
            await supabaseClient.from('partidas').update({ estado: 'cancelada' }).eq('id', versusPartidaId);
        } catch(e) { console.warn("No se pudo limpiar la sala en la nube."); }
    }
    
    esModoVersus = false;
    versusPartidaEnCurso = false;
    versusLigaOrigen = null;
    
    showToast("Búsqueda cancelada con éxito 🛑", "ph-x-circle", "info");
}

// ⏳ DESTRUYE EL CONTADOR VISUAL FLOTANTE
function cerrarLobbyEspera() {
    if (matchmakingInterval) {
        clearInterval(matchmakingInterval);
        matchmakingInterval = null;
    }
    const lobby = document.getElementById('matchmaking-lobby');
    if (lobby) lobby.remove();
}

function obtener5EstadiosVersus() {
    const pool = catalogoGlobal.length > 0 ? catalogoGlobal : estadiosCargados;
    const disponibles = pool.filter(f => {
        const l = bscarPropiedad(f, 'Link del Video').toString().trim();
        return (l.includes('youtube.com') || l.includes('youtu.be')) &&
               bscarPropiedad(f, 'Latitud').toString().trim() !== '' &&
               bscarPropiedad(f, 'Longitud').toString().trim() !== '';
    });

    let resultado = [];
    let copia = [...disponibles];
    const cantidadAExtraer = Math.min(5, copia.length);

    for (let i = 0; i < cantidadAExtraer; i++) {
        const idxAleatorio = Math.floor(Math.random() * copia.length);
        resultado.push(copia.splice(idxAleatorio, 1)[0]);
    }

    return resultado;
}

// 🤖 BOT DE RESPALDO SI NO HAY RIVALES HUMANOS
function activarBotDeRescate() {
    esModoBot = true;
    const apodosRivales = [
        // Los clásicos con números/años
        "Nico_88", "Juani8794", "Gonza_23", "Matias14", "Rulo_94", "Tomi_99", "Agus2001", "Fede_89",
        "Lucas_93", "Tincho98", "Facu_2003", "Emi_95", "Jony_90", "Seba_87", "Ale_00", "Gaston_91",
        "Leo_1994", "Maxi_22", "Tucu_99", "Chino_12", "Lucho_88", "Manu_2005", "Bauti_04", "Fran_97",
        
        // Apodos y "Termos" futboleros
        "ElDiego_DT", "Pulga10", "Panhito", "Toto_Cancha", "Gordo12", "Gambeta_10", "PaloYAfuera",
        "Rustico_2", "TikiTaka", "El_DT_Online", "Capitan_10", "ElPibeDeBarrio", "Var_Oficial",
        "EnfermoDelGol", "Corta_Pasto", "Juega_Bonito", "PelotaAlPiso", "Centro_Y_Adentro", "Magico_10",
        
        // Mezcla con Gamer/FUT
        "Faca_Gamer", "PibeFUT", "Láser", "Nari", "Pro_Gamer_FUT", "Fifa_King", "Leyenda_FUT",
        "Gamer_Albiceleste", "Tryhard_Fut", "Crack_Virtual", "Joystick_10", "PibePlay", "Duka_88", "Cholo", "Peluca", "Zurdo",
        "Ñeri", "Huguito", "Alejandrogado", "Boxer", "Cobra", "tete", "Delfi", "mari75", 
        
        // Referencias a jugadores/ídolos
        "Dibu_Fan", "ElBicho_CR", "Messi_Goat", "Enzo_F", "Julian_21", "Araña_9", "Motorcito_7",
        "Paredes_Leyenda", "Licha_15", "Pipa_Gol", "Fideo_11", "Toro_22", "Cuti",
        
        // Folklore y Clubes (Versión disimulada)
        "Santi_Casla", "Juani_Albiceleste", "Bostero_22", "Millo91", "ReyDeCopas_7", "Rojo_Diablo",
        "Boedo_Cuervo", "Fortinero", "Canalla_89", "Leproso_G", "Pincharrata_11", "Lobo_Platense",
        "Gaston_Carp", "Seba_Xeneize", "ChinoCBA", "Cordobes2", "Mendu_14", "Quemero_10", "Funebrero_C"
    ];
    versusRivalNombre = apodosRivales[Math.floor(Math.random() * apodosRivales.length)];
    cerrarLobbyEspera();
    showToast(`¡Rival encontrado: ${versusRivalNombre}! 🚀`, "ph-lightning", "success");
    arrancarPartidoVersus();
}

function ejecutarVotoBotDinamico() {
    if (!esModoBot || rivalGuessConfirmado || !guessrEstadioCorrecto) return;
    const tLat = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Latitud')).trim().replace(',', '.'));
    const tLng = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Longitud')).trim().replace(',', '.'));
    
    const offsetMax = guessrDificultad === 'facil' ? 1.5 : guessrDificultad === 'dificil' ? 8 : 4;
    const latOffset = (Math.random() - 0.5) * offsetMax;
    const lngOffset = (Math.random() - 0.5) * offsetMax;
    const botLat = tLat + latOffset;
    const botLng = tLng + lngOffset;
    
    const dist = calcularDistanciaHaversine(botLat, botLng, tLat, tLng);
    const pts = isNaN(dist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -dist / 1200)));
    
    rivalGuessConfirmado = true;
    rivalDataRonda = { lat: botLat, lng: botLng, puntos: pts, distancia: dist };
    
    if (!miGuessConfirmado) {
        showToast("⚠️ ¡Tu rival ya arriesgó! Tenés 15 segundos para confirmar tu pin.", "ph-timer", "danger");
        iniciarCuentaRegresivaVersus();
    } else {
        mostrarResultadosMutuosVersus();
    }
}

// ==========================================
// MOTOR DE SALAS PRIVADAS (DESAFÍO POR WHATSAPP)
// ==========================================
function crearSalaPrivada() {
    cerrarModalGuessr();
    const misEstadiosAleatorios = obtener5EstadiosVersus();
    if (!misEstadiosAleatorios || misEstadiosAleatorios.length < 5) {
        showToast("Esperá un segundo que termine de cargar el catálogo...", "ph-circle-notch", "warning");
        return;
    }

    obtenerIdRedVersus();

    const idSala = Math.random().toString(36).substring(2, 8).toUpperCase();
    versusPartidaId = 'PRIV_' + idSala;
    versusEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));
    versusLigaOrigen = null;
    
    versusRol = 'jugador_1';
    esModoVersus = true;
    esModoBot = false;
    versusPartidaEnCurso = false;

    const urlLimpia = window.location.origin + window.location.pathname;
    const linkACompartir = `${urlLimpia}?sala=${versusPartidaId}`;

    abrirLobbyPrivado(linkACompartir, idSala);
    conectarRealtimeVersus();
}

function abrirLobbyPrivado(link, codigo) {
    cerrarLobbyEspera(); 
    const lobby = document.createElement('div');
    lobby.id = 'matchmaking-lobby';
    lobby.className = 'private-lobby-card';
    
    lobby.innerHTML = `
        <div class="private-lobby-header">
            <div class="private-lobby-title-wrap">
                <img src="icono-privada.webp" alt="Sala Privada" class="private-lobby-icon">
                <div class="private-lobby-title-text">
                    <strong>Duelo Privado</strong>
                    <span class="private-lobby-badge">SALA #${codigo}</span>
                </div>
            </div>
            <button type="button" class="private-lobby-close" onclick="cancelarBusquedaVersus()" title="Cerrar sala">
                <i class="ph-bold ph-x"></i>
            </button>
        </div>
        <p class="private-lobby-desc">Compartile este link a tu rival para jugar mano a mano en vivo:</p>
        <button id="btn-copiar-privado" type="button" onclick="compartirLinkPrivado('${link}')" class="btn-3d btn-private-invite">
            <i class="ph-bold ph-share-network"></i> Invitar a sala privada
        </button>
    `;
    document.body.appendChild(lobby);
}

window.compartirLinkPrivado = async function(link) {
    const msg = `⚽ ¡Te reté a un duelo en StadiumGuessr! 🌍\nEntrá a este link para jugar contra mí en vivo:\n\n${link}`;
    const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esMobile && navigator.share) {
        try {
            await navigator.share({
                title: 'Duelo en StadiumGuessr ⚽',
                text: msg
            });
            showToast('¡Invitación enviada! Esperando que entre tu rival... ⏳', 'ph-hourglass', 'info');
            return;
        } catch (e) {
            console.log("Compartir nativo cancelado o no disponible, usando portapapeles.");
        }
    }

    navigator.clipboard.writeText(msg).then(() => {
        showToast('¡Link copiado! Pegalo con Ctrl + V en WhatsApp.', 'ph-check-circle', 'success');
        const btn = document.getElementById('btn-copiar-privado');
        if (btn) btn.innerHTML = `<i class="ph-bold ph-check"></i> ¡Copiado!`;
    }).catch(() => {
        showToast('Error al copiar. Seleccionalo de la barra de arriba.', 'ph-warning-circle', 'danger');
    });
}

async function unirseSalaPrivada(salaId) {
    const idRed = obtenerIdRedVersus();

    let nickExistente = getPref('ev_custom_nick', '');
    if (!nickExistente && (!obtenerUsuarioLogueado() || obtenerUsuarioLogueado().id === 'guest')) {
        let nuevoNick = prompt("🏆 ¡Te desafiaron a un duelo! Ingresá tu apodo para entrar a la cancha:");
        if (nuevoNick === null) {
            window.history.replaceState({}, document.title, window.location.pathname);
            return; 
        }
        nuevoNick = nuevoNick.trim() || ("Jugador_" + Math.random().toString(36).substring(2, 6).toUpperCase());
        if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);

        let disponible = await verificarApodoDisponible(nuevoNick);
        while (!disponible) {
            showToast(`El apodo "${nuevoNick}" ya está en uso 🚫`, 'ph-warning-circle', 'danger');
            nuevoNick = prompt(`⚠️ El apodo "${nuevoNick}" ya pertenece a otro jugador. Ingresá uno diferente:`);
            if (nuevoNick === null) {
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
            nuevoNick = nuevoNick.trim() || ("Jugador_" + Math.random().toString(36).substring(2, 6).toUpperCase());
            if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);
            disponible = await verificarApodoDisponible(nuevoNick);
        }

        setPref('ev_custom_nick', nuevoNick);
    }

    versusPartidaId = salaId;
    versusRol = 'jugador_2';
    esModoVersus = true;
    esModoBot = false;
    versusPartidaEnCurso = false;
    versusEstadios = [];

    window.history.replaceState({}, document.title, window.location.pathname);

    showToast("Buscando al creador de la sala... 📡", "ph-circle-notch", "info");
    
    abrirLobbyEspera(); 
    conectarRealtimeVersus();

    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
    versusTimeoutBusqueda = setTimeout(() => {
        if (!versusPartidaEnCurso) {
            cancelarBusquedaVersus();
            showToast("El creador de la sala no respondió a tiempo. ❌", "ph-warning-circle", "danger");
        }
    }, 60000); 
}

// Función principal para buscar rival o crear una sala de espera
async function buscarPartidaVersus() {
    const misEstadiosAleatorios = obtener5EstadiosVersus();
    if (!misEstadiosAleatorios || misEstadiosAleatorios.length < 5) {
        showToast("Esperá un segundo que termine de cargar el catálogo de estadios... ⚽", "ph-circle-notch", "warning");
        return;
    }

    const idRed = obtenerIdRedVersus();

    let nickExistente = getPref('ev_custom_nick', '');
    if (!nickExistente && (!obtenerUsuarioLogueado() || obtenerUsuarioLogueado().id === 'guest')) {
        let nuevoNick = prompt("🏆 ¡Antes de entrar a la cancha! Ingresá tu apodo para el Salón de la Fama:");
        if (nuevoNick === null) return; 
        nuevoNick = nuevoNick.trim();
        if (!nuevoNick) {
            nuevoNick = "Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase();
        }
        if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);

        let disponible = await verificarApodoDisponible(nuevoNick);
        while (!disponible) {
            showToast(`El apodo "${nuevoNick}" ya está en uso 🚫`, 'ph-warning-circle', 'danger');
            nuevoNick = prompt(`⚠️ El apodo "${nuevoNick}" ya pertenece a otro jugador. Ingresá uno diferente:`);
            if (nuevoNick === null) return;
            nuevoNick = nuevoNick.trim();
            if (!nuevoNick) {
                nuevoNick = "Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase();
            }
            if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);
            disponible = await verificarApodoDisponible(nuevoNick);
        }

        setPref('ev_custom_nick', nuevoNick);
    }

    if (handshakeInterval) clearInterval(handshakeInterval);
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda); 
    
    if (versusChannel) {
        try { supabaseClient.removeChannel(versusChannel); } catch(e) {}
        versusChannel = null;
    }
    
    versusPartidaEnCurso = false;
    esModoBot = false; 
    esModoVersus = true;
    versusLigaOrigen = null;
    versusEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));

    showToast("Buscando rival en el vestuario... ⏳", "ph-circle-notch", "info");
    abrirLobbyEspera(); 

    const tiempoEsperaBot = 30000 + Math.random() * 10000;
    versusTimeoutBusqueda = setTimeout(() => {
        if (!versusPartidaEnCurso) {
            console.log("[1v1] 🤖 No se encontró rival humano a tiempo. Activando Bot de Rescate.");
            activarBotDeRescate();
        }
    }, tiempoEsperaBot);

    if (!supabaseClient) return;
    
    const nombresEstadios = versusEstadios;

    try {
        const { data, error } = await supabaseClient.rpc('buscar_o_crear_partida', {
            p_jugador_id: idRed,
            p_estadios_enviados: nombresEstadios,
            p_dificultad: guessrDificultad
        });

        if (error) {
            console.warn("⚠️ Aviso en RPC buscar_o_crear_partida:", error.message);
            return;
        }

        if (!data) return;

        const partida = Array.isArray(data) ? data[0] : data;
        if (!partida) return;

        versusPartidaId = partida.id;
        if (partida.estadios_ids && partida.estadios_ids.length >= 5) {
            versusEstadios = partida.estadios_ids;
        }
        if (partida.dificultad && versusRol === 'jugador_2') {
            guessrDificultad = partida.dificultad;
        }

        const estadoPartida = String(partida.estado || '').toLowerCase();

        if (estadoPartida === 'esperando') {
            versusRol = 'jugador_1';
            console.log("[1v1] Sala creada en espera. ID:", versusPartidaId);
            conectarRealtimeVersus();
        } else if (estadoPartida === 'jugando') {
            versusRol = 'jugador_2';
            console.log("[1v1] ¡Conectando a rival en vivo! Partida ID:", versusPartidaId);
            conectarRealtimeVersus();
        }
        
    } catch (e) {
        console.warn("Matchmaking en segundo plano, el bot tomará el control si no hay oponentes:", e.message);
    }
}

// ========================================================
// MOTOR REALTIME ROBUSTO: HANDSHAKE ASIMÉTRICO Y DETERMINISTA
// ========================================================
function conectarRealtimeVersus() {
    if (!supabaseClient || !versusPartidaId) return;
    
    const idRed = obtenerIdRedVersus();
    const miNombreLocal = obtenerNombreDisplay();

    if (handshakeInterval) {
        clearInterval(handshakeInterval);
        handshakeInterval = null;
    }

    if (versusChannel) {
        try { supabaseClient.removeChannel(versusChannel); } catch(e) {}
        versusChannel = null;
    }

    console.log(`[1v1] 📡 Conectando canal: sala_${versusPartidaId} | Rol: ${versusRol} | ID: ${idRed}`);

    versusChannel = supabaseClient.channel(`sala_${versusPartidaId}`, {
        config: { 
            broadcast: { self: false },
            presence: { key: idRed }
        }
    });

    versusChannel
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log("[1v1] 🚨 Desconexión de socket detectada:", leftPresences);
            const partidaYaFinalizada = guessrRondaActual > 5 || (guessrRondaActual === 5 && resultadosRondaMostrados);
            if (versusPartidaEnCurso && !esModoBot && !partidaYaFinalizada) {
                manejarAbandonoRival();
            }
        })
        .on('broadcast', { event: 'invitado_unido' }, (response) => {
            const data = response.payload || response;
            if (data && data.id !== idRed && versusRol === 'jugador_1') {
                console.log(`[1v1] 📥 Invitado detectado en la sala. Transmitiendo configuración oficial.`);
                if (data.nombre) versusRivalNombre = data.nombre;

                versusChannel.send({
                    type: 'broadcast',
                    event: 'host_datos_partida',
                    payload: { 
                        id: idRed, 
                        nombre: miNombreLocal, 
                        estadios: versusEstadios, 
                        dificultad: guessrDificultad 
                    } 
                });
            }
        })
        .on('broadcast', { event: 'host_datos_partida' }, (response) => {
            const data = response.payload || response;
            if (data && data.id !== idRed && versusRol === 'jugador_2') {
                console.log(`[1v1] 📥 Datos del Host recibidos con éxito.`);
                if (data.nombre) versusRivalNombre = data.nombre;
                if (data.estadios && data.estadios.length > 0) versusEstadios = data.estadios;
                if (data.dificultad) guessrDificultad = data.dificultad;

                versusChannel.send({
                    type: 'broadcast',
                    event: 'partida_confirmada',
                    payload: { id: idRed, nombre: miNombreLocal } 
                });

                if (!versusPartidaEnCurso) {
                    versusPartidaEnCurso = true;
                    if (handshakeInterval) { clearInterval(handshakeInterval); handshakeInterval = null; }
                    showToast(`¡Conectado con ${versusRivalNombre}! Que empiece el partido... 🚀`, "ph-lightning", "success");
                    arrancarPartidoVersus();
                }
            }
        })
        .on('broadcast', { event: 'partida_confirmada' }, (response) => {
            const data = response.payload || response;
            if (data && data.id !== idRed && versusRol === 'jugador_1') {
                if (data.nombre) versusRivalNombre = data.nombre;
                console.log(`[1v1] 📥 Confirmación final recibida. ¡Arrancando partido!`);

                if (!versusPartidaEnCurso) {
                    versusPartidaEnCurso = true;
                    if (handshakeInterval) { clearInterval(handshakeInterval); handshakeInterval = null; }
                    showToast(`¡Rival conectado: ${versusRivalNombre}! Sincronizando cancha... 🚀`, "ph-lightning", "success");
                    arrancarPartidoVersus();
                }
            }
        })
        .on('broadcast', { event: 'rival_voto' }, (response) => {
            const data = response.payload || response;
            if (data && data.id === idRed) return;
            console.log("[1v1] Voto recibido del oponente:", data);
            
            rivalGuessConfirmado = true;
            rivalDataRonda = data;

            if (!miGuessConfirmado) {
                showToast("⚠️ ¡Tu rival ya arriesgó! Tenés 15 segundos para confirmar tu pin.", "ph-timer", "danger");
                iniciarCuentaRegresivaVersus();
            } else {
                mostrarResultadosMutuosVersus();
            }
        })
        .on('broadcast', { event: 'rival_taunt' }, (response) => {
            const data = response.payload || response;
            if (data && data.emoji) {
                mostrarTauntEnPantalla(data.emoji, false);
            }
        })
        .on('broadcast', { event: 'rival_listo_siguiente' }, () => {
            rivalListoSiguiente = true;
            if (miListoSiguiente) {
                ejecutarPasoDeRondaVersus();
            }
        })
        .on('broadcast', { event: 'forzar_siguiente_ronda' }, () => {
            console.log("[1v1] Avance forzado sincronizado por inactividad.");
            ejecutarPasoDeRondaVersus();
        })
        .on('broadcast', { event: 'rival_abandono' }, () => {
            console.log("[1v1] El oponente abandonó la sesión.");
            const partidaYaFinalizada = guessrRondaActual > 5 || (guessrRondaActual === 5 && resultadosRondaMostrados);
            if (!partidaYaFinalizada) {
                manejarAbandonoRival();
            }
        })
        .subscribe((status) => {
            console.log(`[1v1] 🚦 Estado WebSocket (${versusRol}): ${status}`);
            if (status === 'SUBSCRIBED') {
                versusChannel.track({ id: idRed });

                if (handshakeInterval) clearInterval(handshakeInterval);

                if (versusRol === 'jugador_2') {
                    versusChannel.send({ 
                        type: 'broadcast', 
                        event: 'invitado_unido', 
                        payload: { id: idRed, nombre: miNombreLocal } 
                    });

                    handshakeInterval = setInterval(() => {
                        if (versusChannel && !versusPartidaEnCurso) {
                            versusChannel.send({ 
                                type: 'broadcast', 
                                event: 'invitado_unido', 
                                payload: { id: idRed, nombre: miNombreLocal } 
                            });
                        }
                    }, 400);
                } else if (versusRol === 'jugador_1') {
                    handshakeInterval = setInterval(() => {
                        if (versusChannel && !versusPartidaEnCurso) {
                            versusChannel.send({
                                type: 'broadcast',
                                event: 'host_datos_partida',
                                payload: { 
                                    id: idRed, 
                                    nombre: miNombreLocal, 
                                    estadios: versusEstadios, 
                                    dificultad: guessrDificultad 
                                } 
                            });
                        }
                    }, 400);
                }
            }
        });
}

// Renderiza el Scoreboard 1 vs 1 en tiempo real con puntajes y estados mutuos
function renderizarScoreboardVersus(alerta = null) {
    const sb = document.getElementById('versus-live-scoreboard');
    const gt = document.getElementById('game-title');
    if (!sb) return;

    const hud = document.querySelector('.guessr-top-hud');
    if (!esModoVersus) {
        sb.style.display = 'none';
        if (gt) gt.style.display = 'inline-flex';
        if (hud) hud.classList.remove('hud-versus-active');
        return;
    }

    sb.style.display = 'flex';
    if (gt) gt.style.display = 'none';
    if (hud) hud.classList.add('hud-versus-active');

    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Vos')).trim();
    const rivalNombre = (versusRivalNombre || 'Rival').trim();

    // Diferencia de puntos para corona de líder
    const diff = Math.abs(guessrPuntosTotales - rivalPuntosTotales);
    let liderBadgeUser = '';
    let liderBadgeRival = '';
    if (guessrPuntosTotales > rivalPuntosTotales && guessrPuntosTotales > 0) {
        liderBadgeUser = `<span class="vs-lead-pill" title="Liderás por ${diff} pts">👑 +${diff}</span>`;
    } else if (rivalPuntosTotales > guessrPuntosTotales && rivalPuntosTotales > 0) {
        liderBadgeRival = `<span class="vs-lead-pill rival" title="Lidera por ${diff} pts">👑 +${diff}</span>`;
    }

    // Estados dinámicos de la ronda actual
    let statusUserHtml = '';
    let statusRivalHtml = '';

    if (resultadosRondaMostrados && rivalDataRonda) {
        const misPtsRonda = guessrHistorialRondas.length ? (guessrHistorialRondas[guessrHistorialRondas.length - 1]?.puntos || 0) : 0;
        statusUserHtml = `<span class="vs-status-tag gained">+${misPtsRonda} pts</span>`;
        statusRivalHtml = `<span class="vs-status-tag gained rival">+${rivalDataRonda.puntos || 0} pts</span>`;
    } else {
        if (miGuessConfirmado) {
            statusUserHtml = `<span class="vs-status-tag ready"><i class="ph-bold ph-check"></i> Listo</span>`;
        } else {
            statusUserHtml = `<span class="vs-status-tag thinking"><i class="ph-bold ph-dots-three animate-pulse"></i> Pensando</span>`;
        }

        if (rivalGuessConfirmado) {
            if (versusTimerInterval && !miGuessConfirmado) {
                statusRivalHtml = `<span class="vs-status-tag hurry"><i class="ph-bold ph-lightning"></i> ¡Arriesgó! (<span id="vs-sb-rival-tag-sec" class="vs-timer-val">${versusTiempoRestante}s</span>)</span>`;
            } else {
                statusRivalHtml = `<span class="vs-status-tag ready rival"><i class="ph-bold ph-check"></i> Listo</span>`;
            }
        } else {
            statusRivalHtml = `<span class="vs-status-tag thinking"><i class="ph-bold ph-dots-three animate-pulse"></i> Pensando</span>`;
        }
    }

    let alertHtml = '';
    if (alerta) {
        const esAlertaUrgente = versusTimerInterval && !miGuessConfirmado;
        alertHtml = `<div id="vs-sb-alert-box" class="vs-sb-alert ${esAlertaUrgente ? 'urgent-drop' : 'wait-drop'}">${alerta}</div>`;
    }

    // Barra de duelo comparativa (Tug-of-war de puntos)
    const totalPtsAmbos = (guessrPuntosTotales + rivalPuntosTotales) || 1;
    let pctUser = 50;
    let pctRival = 50;
    if (guessrPuntosTotales > 0 || rivalPuntosTotales > 0) {
        pctUser = Math.min(Math.max(Math.round((guessrPuntosTotales / totalPtsAmbos) * 100), 12), 88);
        pctRival = 100 - pctUser;
    }

    // Segundero central dinámico (aparece prominentemente cuando un jugador arriesga)
    let timerCenterHtml = '';
    if (versusTimerInterval && !miGuessConfirmado) {
        timerCenterHtml = `
            <span class="vs-sb-center-timer hurry" id="vs-sb-center-timer-badge" title="¡Tu rival ya arriesgó! Te quedan ${versusTiempoRestante}s">
                <i class="ph-bold ph-timer"></i> <span id="vs-sb-timer-sec" class="vs-timer-val">${versusTiempoRestante}s</span>
            </span>`;
    } else if (versusTimerInterval && miGuessConfirmado && !rivalGuessConfirmado) {
        timerCenterHtml = `
            <span class="vs-sb-center-timer wait" id="vs-sb-center-wait-badge" title="Esperando que tu rival confirme">
                <i class="ph-bold ph-hourglass animate-spin"></i> <span id="vs-sb-wait-sec" class="vs-timer-val">${versusTiempoRestante}s</span>
            </span>`;
    } else if (guessrDificultad === 'dificil' && !miGuessConfirmado && !rivalGuessConfirmado && !resultadosRondaMostrados) {
        timerCenterHtml = `
            <span class="vs-sb-timer-badge" id="vs-sb-leyenda-timer">
                <i class="ph-bold ph-timer"></i> <span id="vs-sb-leyenda-sec">${guessrTiempoRestanteIndividual}s</span>
            </span>`;
    }

    sb.innerHTML = `
        <div class="vs-sb-main-row">
            <div class="vs-sb-col user ${guessrPuntosTotales >= rivalPuntosTotales && guessrPuntosTotales > 0 ? 'leading' : ''}">
                <div class="vs-sb-meta">
                    <span class="vs-sb-tag user">VOS</span>
                    <span class="vs-sb-name" title="${sanitizarHTML(miNombre)}">${sanitizarHTML(miNombre)}</span>
                    ${liderBadgeUser}
                </div>
                <div class="vs-sb-score">${guessrPuntosTotales.toLocaleString('es-AR')} <small>PTS</small></div>
                <div class="vs-sb-status-box">${statusUserHtml}</div>
            </div>

            <div class="vs-sb-center">
                <div class="vs-sb-vs-badge">VS</div>
                <span class="vs-sb-round-badge">R${guessrRondaActual}/5</span>
                ${timerCenterHtml}
            </div>

            <div class="vs-sb-col rival ${rivalPuntosTotales >= guessrPuntosTotales && rivalPuntosTotales > 0 ? 'leading' : ''}">
                <div class="vs-sb-meta">
                    ${liderBadgeRival}
                    <span class="vs-sb-name" title="${sanitizarHTML(rivalNombre)}">${sanitizarHTML(rivalNombre)}</span>
                    <span class="vs-sb-tag rival">RIVAL</span>
                </div>
                <div class="vs-sb-score">${rivalPuntosTotales.toLocaleString('es-AR')} <small>PTS</small></div>
                <div class="vs-sb-status-box">${statusRivalHtml}</div>
            </div>
        </div>
        <div class="vs-sb-duel-bar" title="Duelo de puntos">
            <div class="vs-duel-fill user" style="width: ${pctUser}%;"></div>
            <div class="vs-duel-fill rival" style="width: ${pctRival}%;"></div>
        </div>
        ${alertHtml}
    `;
}

// Reloj de arena visual de 15 segundos si el rival arriesga primero (Fijo, sin parpadeos)
function iniciarCuentaRegresivaVersus() {
    if (guessrTimerIndividualInterval) { clearInterval(guessrTimerIndividualInterval); guessrTimerIndividualInterval = null; }
    if (versusTimerInterval) { clearInterval(versusTimerInterval); versusTimerInterval = null; }
    versusTiempoRestante = 15;
    
    renderizarScoreboardVersus('<i class="ph-bold ph-timer" style="color:var(--danger-color);"></i> ¡' + sanitizarHTML(versusRivalNombre) + ' arriesgó! Te quedan <b id="vs-sb-timer-sec-alert" class="vs-timer-val">' + versusTiempoRestante + 's</b>');

    versusTimerInterval = setInterval(() => {
        versusTiempoRestante--;
        
        // Actualizamos de forma atómica los números sin regenerar el cartel ni la pantalla
        const timerSec = document.getElementById('vs-sb-timer-sec');
        const alertSec = document.getElementById('vs-sb-timer-sec-alert');
        const rivalTagSec = document.getElementById('vs-sb-rival-tag-sec');
        if (timerSec) timerSec.textContent = versusTiempoRestante + 's';
        if (alertSec) alertSec.textContent = versusTiempoRestante + 's';
        if (rivalTagSec) rivalTagSec.textContent = versusTiempoRestante + 's';

        document.querySelectorAll('.vs-timer-val').forEach(el => {
            el.textContent = versusTiempoRestante + 's';
        });

        if (versusTiempoRestante <= 5 && versusTiempoRestante > 0) {
            const badge = document.getElementById('vs-sb-center-timer-badge') || timerSec;
            if (badge) badge.classList.add('timer-urgent-pulse');
            if (typeof reproducirSonido === 'function') reproducirSonido('reloj');
        }

        if (versusTiempoRestante <= 0) {
            const badge = document.getElementById('vs-sb-center-timer-badge') || timerSec;
            if (badge) badge.classList.remove('timer-urgent-pulse');
            clearInterval(versusTimerInterval);
            versusTimerInterval = null;
            showToast("⏱️ ¡Tiempo agotado! Se confirma tu posición actual.", "ph-clock", "danger");
            if (!guessrSelectedLatLng) {
                guessrSelectedLatLng = { lat: 0, lng: 0 }; 
            }
            confirmarArriesgoLocalVersus();
        }
    }, 1000);
}

// Procesa el click de confirmación local en el modo Versus
async function confirmarArriesgoLocalVersus() {
    try {
        if (guessrTimerIndividualInterval) { clearInterval(guessrTimerIndividualInterval); guessrTimerIndividualInterval = null; }
        if (versusTimerInterval) { clearInterval(versusTimerInterval); versusTimerInterval = null; }
        if (botAntesTimer) clearTimeout(botAntesTimer);

        const btn = document.getElementById('game-action-btn');
        btn.setAttribute('data-estado', 'procesando');
        btn.disabled = true;

        if (!guessrSelectedLatLng) {
            guessrSelectedLatLng = { lat: 0, lng: 0 };
        }

        let tLat = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Latitud')).trim().replace(',', '.'));
        let tLng = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Longitud')).trim().replace(',', '.'));
        let dist = 0;
        let pts = 0;

        const nombreEstadio = bscarPropiedad(guessrEstadioCorrecto, 'Estadio');
        const latUsuario = guessrSelectedLatLng.lat;
        const lngUsuario = guessrSelectedLatLng.lng;

        // 🛡️ Validación en servidor por RPC
        if (supabaseClient) {
            try {
                const { data: resCalculo, error } = await supabaseClient.rpc('calcular_puntaje_tiro', {
                    p_estadio: nombreEstadio,
                    p_lat: latUsuario,
                    p_lng: lngUsuario
                });

                if (!error && resCalculo) {
                    dist = resCalculo.distancia;
                    pts = resCalculo.puntos;
                    if (resCalculo.lat_real && resCalculo.lng_real) {
                        tLat = resCalculo.lat_real;
                        tLng = resCalculo.lng_real;
                    }
                } else {
                    dist = calcularDistanciaHaversine(latUsuario, lngUsuario, tLat, tLng);
                    pts = isNaN(dist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -dist / 1200)));
                }
            } catch (e) {
                dist = calcularDistanciaHaversine(latUsuario, lngUsuario, tLat, tLng);
                pts = isNaN(dist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -dist / 1200)));
            }
        } else {
            dist = calcularDistanciaHaversine(latUsuario, lngUsuario, tLat, tLng);
            pts = isNaN(dist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -dist / 1200)));
        }

        miGuessConfirmado = true;

        if (!esModoBot && versusChannel) {
            versusChannel.send({
                type: 'broadcast',
                event: 'rival_voto',
                payload: { lat: guessrSelectedLatLng.lat, lng: guessrSelectedLatLng.lng, puntos: pts, distancia: dist }
            });
        }

        if (rivalGuessConfirmado) {
            mostrarResultadosMutuosVersus();
        } else {
            btn.innerHTML = `<i class="ph-bold ph-hourglass-medium animate-spin"></i> Esperando al rival...`;
            btn.style.background = "linear-gradient(145deg, rgba(16, 28, 50, 0.92) 0%, rgba(8, 14, 26, 0.98) 100%)";
            btn.style.color = "#bfdbfe";
            btn.style.border = "1.5px solid rgba(41, 121, 255, 0.45)";
            btn.style.borderTop = "1.5px solid rgba(147, 197, 253, 0.7)";
            btn.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.4), 0 0 12px rgba(41, 121, 255, 0.3)";
            
            iniciarRelojEsperaRivalVersus();

            if (esModoBot) {
                setTimeout(() => {
                    ejecutarVotoBotDinamico();
                }, 8000 + Math.random() * 7000);
            }
        }
    } catch (error) {
        console.error("🚨 Error crítico al intentar enviar el voto local:", error);
    }
}

// Reloj de resguardo que evita que el primer jugador se quede colgado (Fijo, sin parpadeos)
function iniciarRelojEsperaRivalVersus() {
    if (versusTimerInterval) { clearInterval(versusTimerInterval); versusTimerInterval = null; }
    versusTiempoRestante = 15;
    
    renderizarScoreboardVersus('<i class="ph-bold ph-hourglass animate-spin"></i> Esperando a ' + sanitizarHTML(versusRivalNombre) + '... <b id="vs-sb-wait-sec-alert" class="vs-timer-val">' + versusTiempoRestante + 's</b>');

    versusTimerInterval = setInterval(() => {
        versusTiempoRestante--;
        
        // Actualizamos de forma atómica los números del segundero sin desmontar el cartel
        const waitSec = document.getElementById('vs-sb-wait-sec');
        const alertSec = document.getElementById('vs-sb-wait-sec-alert');
        if (waitSec) waitSec.textContent = versusTiempoRestante + 's';
        if (alertSec) alertSec.textContent = versusTiempoRestante + 's';

        document.querySelectorAll('.vs-timer-val').forEach(el => {
            el.textContent = versusTiempoRestante + 's';
        });

        if (versusTiempoRestante <= 0) {
            clearInterval(versusTimerInterval);
            versusTimerInterval = null;
            showToast("⏱️ El oponente no respondió a tiempo. Procesando ronda.", "ph-clock", "warning");
            
            rivalForcedTimeout = true; 
            rivalGuessConfirmado = true;
            rivalDataRonda = { lat: 0, lng: 0, puntos: 0, distancia: 9999 };
            mostrarResultadosMutuosVersus();
        }
    }, 1000);
}

// Abre las cartas: Dibuja ambos pines, calcula el puntaje, muestra el mapa y avanza automáticamente con cuenta regresiva
function mostrarResultadosMutuosVersus() {
    if (resultadosRondaMostrados) return; 
    resultadosRondaMostrados = true;
    if (typeof toggleExpandirMapaGuessr === 'function') toggleExpandirMapaGuessr(true);

    if (guessrTimerIndividualInterval) { clearInterval(guessrTimerIndividualInterval); guessrTimerIndividualInterval = null; }
    if (versusTimerInterval) { clearInterval(versusTimerInterval); versusTimerInterval = null; }
    if (versusCountdownInterval) clearInterval(versusCountdownInterval);

    const btn = document.getElementById('game-action-btn');
    
    const tLat = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Latitud')).trim().replace(',', '.'));
    const tLng = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Longitud')).trim().replace(',', '.'));

    const miDist = calcularDistanciaHaversine(guessrSelectedLatLng.lat, guessrSelectedLatLng.lng, tLat, tLng);
    const misPts = isNaN(miDist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -miDist / 1200)));
    
    guessrPuntosTotales += misPts;
    rivalPuntosTotales += rivalDataRonda.puntos; 

    guessrHistorialRondas.push({
        ronda: guessrRondaActual,
        estadio: bscarPropiedad(guessrEstadioCorrecto, 'Estadio'),
        club: bscarPropiedad(guessrEstadioCorrecto, 'Club'),
        distancia: miDist,
        puntos: misPts
    });

    if (!isNaN(miDist) && miDist < 5) userStats.medallaLocalista = true;
    if (!isNaN(miDist) && miDist < 1) userStats.guessrUnKm = true;
    actualizarDotsProgreso();

    guessrTargetMarker = L.circleMarker([tLat, tLng], {radius: 9, color: '#00e676', fillColor: '#111820', fillOpacity: 1, weight: 3})
        .addTo(guessrMapInstance).bindPopup(`<b>${bscarPropiedad(guessrEstadioCorrecto, 'Estadio')}</b>`).openPopup();
    
    guessrPolyline = L.polyline([[guessrSelectedLatLng.lat, guessrSelectedLatLng.lng], [tLat, tLng]], {color: '#ff4757', weight: 3, className: 'animated-flight-path'}).addTo(guessrMapInstance);

    const rivalMarker = L.circleMarker([rivalDataRonda.lat, rivalDataRonda.lng], {radius: 8, color: '#2979ff', fillColor: '#111820', fillOpacity: 1, weight: 3})
        .addTo(guessrMapInstance).bindPopup(`<b>Rival (+${rivalDataRonda.puntos} pts)</b>`);

    L.polyline([[rivalDataRonda.lat, rivalDataRonda.lng], [tLat, tLng]], {color: '#2979ff', weight: 2, dashArray: '4,6'}).addTo(guessrMapInstance);

    let marcasParaEncuadrar = [guessrTargetMarker, rivalMarker];
    if (guessrUserMarker) marcasParaEncuadrar.push(guessrUserMarker);
    guessrMapInstance.fitBounds(L.featureGroup(marcasParaEncuadrar).getBounds(), {padding: [50, 50]});

    renderizarScoreboardVersus();

    const miDistT = isNaN(miDist) ? '?' : (miDist < 1 ? `${Math.round(miDist * 1000)} m` : `${miDist.toFixed(1)} km`);
    const emoji = miDist < 50 ? '🎯' : miDist < 200 ? '✈️' : miDist < 800 ? '🗺️' : '🌍';

    let segundosRestantes = 3;
    const textoAccion = guessrRondaActual < 5 ? 'Próxima ronda en' : 'Resultados en';

    // 🏷️ Creación del Cartel Flotante Superior
    const bannerViejo = document.getElementById('versus-next-round-banner');
    if (bannerViejo) bannerViejo.remove();

    const parentModal = document.getElementById('modal-card') || document.getElementById('game-ui');
    if (parentModal) {
        const cartel = document.createElement('div');
        cartel.id = 'versus-next-round-banner';
        cartel.style.cssText = 'position:absolute; top:70px; left:50%; transform:translateX(-50%); background:rgba(10,16,28,0.92); border:2px solid var(--accent-color); border-radius:30px; padding:8px 20px; color:#ffffff; font-size:0.92rem; font-weight:900; z-index:2200; box-shadow:0 8px 25px rgba(0,0,0,0.7), 0 0 18px var(--accent-glow); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; gap:8px; pointer-events:none; white-space:nowrap; animation:fadeSlideUp 0.3s ease;';
        cartel.innerHTML = `<i class="ph-bold ph-timer animate-pulse" style="color:var(--accent-color); font-size:1.15rem;"></i> <span>${textoAccion} <b style="color:var(--accent-color); font-size:1.15rem;" id="banner-countdown-num">${segundosRestantes}</b></span>`;
        parentModal.appendChild(cartel);
    }

    btn.innerHTML = `
    <div class="btn-action-wrapper" style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 0.85rem; gap: 6px;">
        <span class="btn-action-stats">
            ${emoji} <b>${miDistT}</b> <span style="opacity: 0.4;">|</span> <b style="font-size: 0.92rem; font-weight: 900;">+${misPts} pts</b>
        </span>
        <span class="btn-action-text" id="versus-round-countdown" style="font-size:0.78rem; font-weight:900; opacity:0.95; white-space:nowrap;">
            ⏱️ ${textoAccion} <b style="color:#ffffff;">${segundosRestantes}s</b>
        </span>
    </div>`;
    
    btn.style.background = "linear-gradient(135deg, rgba(10, 36, 26, 0.95) 0%, rgba(12, 24, 46, 0.98) 100%)";
    btn.style.color = "#ffffff";
    btn.style.border = "1.5px solid rgba(41, 121, 255, 0.5)";
    btn.style.borderTop = "2px solid #69ff9c";
    btn.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 230, 118, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
    btn.setAttribute('data-estado', 'resultado');
    btn.disabled = true;

    dispararJuicinessRonda(miDist);

    // ⏱️ Motor de cuenta regresiva sincronizado de 3 a 0
    versusCountdownInterval = setInterval(() => {
        segundosRestantes--;
        
        const numBanner = document.getElementById('banner-countdown-num');
        if (numBanner) numBanner.textContent = Math.max(0, segundosRestantes);

        const btnCountdown = document.getElementById('versus-round-countdown');
        if (btnCountdown) {
            btnCountdown.innerHTML = `⏱️ ${textoAccion} <b style="color:#ffffff;">${Math.max(0, segundosRestantes)}s</b>`;
        }

        if (segundosRestantes <= 0) {
            clearInterval(versusCountdownInterval);
            versusCountdownInterval = null;
            const b = document.getElementById('versus-next-round-banner');
            if (b) b.remove();
            ejecutarPasoDeRondaVersus();
        }
    }, 1000);
}

// Avisa por canal rápido que estás listo para cambiar de ronda
function solicitarSiguienteRondaVersus() {
    const btn = document.getElementById('game-action-btn');
    miListoSiguiente = true;
    btn.disabled = true;
    btn.innerHTML = `<i class="ph-bold ph-circle-notch animate-spin"></i> Esperando oponente...`;

    if (esModoBot) {
        ejecutarPasoDeRondaVersus();
        return;
    }

    if (rivalForcedTimeout) {
        versusChannel.send({
            type: 'broadcast',
            event: 'forzar_siguiente_ronda',
            payload: {}
        });
        ejecutarPasoDeRondaVersus();
    } else {
        versusChannel.send({
            type: 'broadcast',
            event: 'rival_listo_siguiente',
            payload: { listo: true }
        });

        if (rivalListoSiguiente) {
            ejecutarPasoDeRondaVersus();
        }
    }
}

// Vacía el mapa e inicia formalmente la ronda que sigue
function ejecutarPasoDeRondaVersus() {
    if (botAntesTimer) clearTimeout(botAntesTimer);
    if (versusCountdownInterval) { clearInterval(versusCountdownInterval); versusCountdownInterval = null; }
    document.querySelectorAll('.stamp-badge, #versus-next-round-banner, .taunt-arcade-burst').forEach(el => { try { el.remove(); } catch(e) {} });

    [guessrUserMarker, guessrTargetMarker, guessrPolyline].forEach(m => {
        try { if (m) m.remove(); } catch (e) {}
    });
    guessrUserMarker = guessrTargetMarker = guessrPolyline = null;

    miGuessConfirmado = false;
    rivalGuessConfirmado = false;
    rivalDataRonda = null;
    miListoSiguiente = false;
    rivalListoSiguiente = false;
    rivalForcedTimeout = false;
    resultadosRondaMostrados = false;
    guessrRondaActual++;
    
    if (guessrRondaActual <= 5) {
        lanzarRondaGuessr();
    } else {
        finalizarJuegoGuessr();
    }
}

// Resetea a cero los contadores generales del 1v1
async function arrancarPartidoVersus() {
    if (botAntesTimer) clearTimeout(botAntesTimer);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
    if (timeoutRetoDirecto) { clearTimeout(timeoutRetoDirecto); timeoutRetoDirecto = null; }
    
    if (handshakeInterval) {
        clearInterval(handshakeInterval);
        handshakeInterval = null;
    }
    
    cerrarLobbyEspera();

    let intentos = 0;
    while ((!catalogoGlobal || catalogoGlobal.length === 0) && intentos < 25) {
        await new Promise(r => setTimeout(r, 150));
        intentos++;
    }

    guessrRondaActual = 1;
    guessrPuntosTotales = 0;
    rivalPuntosTotales = 0;
    guessrEstadiosJugados = [];
    guessrHistorialRondas = [];
    guessrHistorialCoordenadas = [];
    pendingScore = null;
    pendingScoreType = null;
    
    miGuessConfirmado = false;
    rivalGuessConfirmado = false;
    rivalDataRonda = null;
    miListoSiguiente = false;
    rivalListoSiguiente = false;
    resultadosRondaMostrados = false;
    if (versusTimerInterval) clearInterval(versusTimerInterval);

    lanzarRondaGuessr();
}
// ==========================================
// LÓGICA DEL RETO DIARIO (TIPO WORDLE)
// ==========================================
function obtenerEstadiosRetoDiario() {
    // 1. Filtramos los estadios que tienen video y coordenadas válidas
    const poolBase = (typeof catalogoGlobal !== 'undefined' && catalogoGlobal.length > 0) ? catalogoGlobal : (typeof estadiosCargados !== 'undefined' ? estadiosCargados : []);
    let pool = poolBase.filter(f => {
        const l = String(bscarPropiedad(f, 'Link del Video')).trim();
        return (l.includes('youtube') || l.includes('youtu.be')) && 
               String(bscarPropiedad(f, 'Latitud')).trim() !== '' && 
               String(bscarPropiedad(f, 'Longitud')).trim() !== '';
    });

    // 2. ORDEN CLAVE: Los ordenamos por nombre para que la base sea idéntica en todo el mundo
    pool.sort((a, b) => String(bscarPropiedad(a, 'Estadio')).localeCompare(String(bscarPropiedad(b, 'Estadio'))));

    // 3. Creamos una "semilla" numérica basada en la fecha de hoy (Ej: 20260625)
    const hoy = new Date();
    let seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();

    // 4. Generador aleatorio atado a la semilla (siempre da el mismo resultado el mismo día)
    function randomSeeded() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    let seleccionados = [];
    let copia = [...pool];

    // 5. Elegimos 5 estadios. Para todos hoy van a ser los mismos 5.
    for (let i = 0; i < 5; i++) {
        if (copia.length === 0) break;
        const idx = Math.floor(randomSeeded() * copia.length);
        seleccionados.push(copia.splice(idx, 1)[0]);
    }

    // Retornamos solo los nombres
    return seleccionados.map(e => bscarPropiedad(e, 'Estadio'));
}

async function iniciarRetoDiario() {
    cerrarLobbyEspera(); // Limpiamos por las dudas
    if (!catalogoGlobal.length) {
        showToast('Esperá que cargue el catálogo de estadios...', 'ph-info', 'warning');
        return;
    }

    const idUsuario = getUserId();
    const u = obtenerUsuarioLogueado();
    const miEmail = (u && u.email) ? u.email.trim() : '';
    const miNick = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : '')).trim();

    const hoy = new Date();
    const fechaHoy = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
    const storageKey = 'ev_reto_diario_fecha_' + idUsuario;

    // 1. Verificación rápida local en disco
    const ultimoRetoJugado = localStorage.getItem(storageKey);
    if (ultimoRetoJugado === fechaHoy) {
        showToast("¡Ya completaste el reto de hoy! Volvé mañana. ⏳", "ph-calendar-check", "warning");
        return;
    }

    // 2. 🛡️ Verificación en la nube: bloquea si ya jugó hoy desde otro dispositivo (PC o celular)
    if (supabaseClient && (miEmail || (miNick && miNick !== 'Invitado' && miNick !== 'Jugador'))) {
        try {
            let consulta = supabaseClient
                .from('ranking')
                .select('id')
                .eq('juego', 'diario_' + fechaHoy);

            if (miEmail) {
                consulta = consulta.eq('email', miEmail);
            } else {
                consulta = consulta.ilike('nombre', miNick);
            }

            const { data: yaJugoNube, error } = await consulta.limit(1);

            if (!error && yaJugoNube && yaJugoNube.length > 0) {
                // Guarda la marca local para que la próxima ni siquiera tenga que consultar a internet
                localStorage.setItem(storageKey, fechaHoy);
                showToast("¡Ya completaste el reto de hoy desde otro dispositivo! Volvé mañana. ⏳", "ph-calendar-check", "warning");
                return;
            }
        } catch (err) {
            console.warn("Aviso en validación cruzada de reto diario:", err);
        }
    }

    // Configuramos el juego
    esModoVersus = false; 
    esModoBot = false;
    esModoDiario = true; // 🔥 ACTIVAMOS EL RETO
    
    // Obtenemos los 5 estadios bloqueados de hoy
    estadiosDiariosList = obtenerEstadiosRetoDiario();

    // Reseteamos marcadores de la partida
    guessrRondaActual = 1;
    guessrPuntosTotales = 0;
    guessrEstadiosJugados = [];
    guessrHistorialRondas = [];
    guessrHistorialCoordenadas = [];
    pendingScore = null;
    pendingScoreType = null;
    
    // Arrancamos
    const tauntsDiario = document.getElementById('taunts-container');
    if (tauntsDiario) tauntsDiario.style.display = 'none';
    const hudDiario = document.querySelector('.guessr-top-hud');
    if (hudDiario) hudDiario.classList.remove('hud-versus-active');
    lanzarRondaGuessr();
}

// TU FUNCIÓN CLÁSICA DE SIEMPRE (Protegiendo el modo solitario y apagando la IA)
function iniciarTrivia(dificultad = 'medio'){ 
    cerrarLobbyEspera();
    
    esModoVersus = false; 
    esModoBot = false;
    esModoDiario = false;
    guessrDificultad = dificultad;

    const tauntsTrivia = document.getElementById('taunts-container');
    if (tauntsTrivia) tauntsTrivia.style.display = 'none';
    const hudTrivia = document.querySelector('.guessr-top-hud');
    if (hudTrivia) hudTrivia.classList.remove('hud-versus-active');
    
    if (handshakeInterval) clearInterval(handshakeInterval);
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
    if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);
    
    if(!catalogoGlobal.length){showToast('Esperá que cargue el catálogo...','ph-info','danger');return;}
    guessrHistorialCoordenadas = [];
    guessrRondaActual=1;guessrPuntosTotales=0;guessrEstadiosJugados=[];guessrHistorialRondas=[];pendingScore=null;pendingScoreType=null;userStats.guessrSeguidas=(userStats.guessrSeguidas||0)+1;guardarStats();lanzarRondaGuessr();
}
window.toggleExpandirMapaGuessr = function(forzarEstado = null, event = null) {
    if (forzarEstado && typeof forzarEstado === 'object' && (forzarEstado instanceof Event || forzarEstado.target)) {
        event = forzarEstado;
        forzarEstado = null;
    }
    if (event) {
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
        if (typeof event.preventDefault === 'function') event.preventDefault();
    }

    const box = document.getElementById('guessr-floating-map-box');
    const icon = document.getElementById('guessr-map-expand-icon');
    if (!box) return;

    if (forzarEstado !== null) {
        if (forzarEstado) {
            box.classList.remove('collapsed');
            box.classList.add('pinned', 'expanded');
        } else {
            box.classList.remove('pinned', 'expanded');
            box.classList.add('collapsed');
        }
    } else {
        // Detecta si está expandido por clase (.expanded/.pinned) O por hover de mouse en PC (ancho > 300px sin estar colapsado)
        const esVisualmenteGrande = box.offsetWidth > 300 || box.offsetHeight > 200;
        const estaActualmenteExpandido = box.classList.contains('expanded') || 
                                         box.classList.contains('pinned') || 
                                         (!box.classList.contains('collapsed') && esVisualmenteGrande);
        
        if (estaActualmenteExpandido) {
            box.classList.remove('pinned', 'expanded');
            box.classList.add('collapsed');
        } else {
            box.classList.remove('collapsed');
            box.classList.add('pinned', 'expanded');
        }
    }

    const estaExpandido = box.classList.contains('pinned') || box.classList.contains('expanded');
    if (icon) {
        icon.className = estaExpandido ? 'ph-bold ph-arrows-in-simple' : 'ph-bold ph-arrows-out-simple';
    }

    setTimeout(() => {
        if (guessrMapInstance) guessrMapInstance.invalidateSize();
    }, 100);
    setTimeout(() => {
        if (guessrMapInstance) guessrMapInstance.invalidateSize();
    }, 300);
};
window.seleccionarDificultadGuessr = function(diff, btn) {
    guessrDificultad = diff;
    document.querySelectorAll('.diff-pill-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
};
// MOTOR DEL GUESSR ADAPTADO (Y CON EL TYPO TOTALMENTE REPARADO)
function lanzarRondaGuessr(){
const idPartida = getUserId();
localStorage.setItem('ev_primera_partida_iniciada_' + idPartida, 'true');
localStorage.setItem('ev_primera_partida_iniciada_global', 'true');

// 🎯 TRACKING GA4: Partida Iniciada (Para métricas de anunciantes)
if (guessrRondaActual === 1 && typeof window.trackEvento === 'function') {
    const modoInicio = esModoVersus ? '1v1_versus' : (esModoDiario ? 'reto_diario' : ('individual_' + (guessrDificultad || 'medio')));
    window.trackEvento('partida_iniciada', { modo: modoInicio });
}

const poolActual = (typeof catalogoGlobal !== 'undefined' && catalogoGlobal.length > 0) ? catalogoGlobal : (typeof estadiosCargados !== 'undefined' ? estadiosCargados : []);
const disp=poolActual.filter(f=>{const l=bscarPropiedad(f,'Link del Video').toString().trim();return(l.includes('youtube.com')||l.includes('youtu.be'))&&bscarPropiedad(f,'Latitud').toString().trim()!==''&&bscarPropiedad(f,'Longitud').toString().trim()!==''&&!guessrEstadiosJugados.includes(bscarPropiedad(f,'Estadio'));});

// === REEMPLAZA DESDE ACÁ ===
    if (esModoVersus) {
        const nombreEstadioOficial = versusEstadios[guessrRondaActual - 1];
        guessrEstadioCorrecto = (catalogoGlobal.length > 0 ? catalogoGlobal : estadiosCargados).find(e => bscarPropiedad(e, 'Estadio') === nombreEstadioOficial);
        
        if (!guessrEstadioCorrecto) {
            showToast("Error al cargar el estadio del versus 🚨", "ph-warning-circle", "danger");
            cerrarModalVideo();
            return;
        }
        guessrEstadiosJugados.push(nombreEstadioOficial);
        const taunts = document.getElementById('taunts-container');
        if (taunts) taunts.style.display = 'flex';
        
    } else if (esModoDiario) {
        // 🌍 LÓGICA NUEVA: RETO DIARIO
        const nombreEstadioDiario = estadiosDiariosList[guessrRondaActual - 1];
        guessrEstadioCorrecto = poolActual.find(e => bscarPropiedad(e, 'Estadio') === nombreEstadioDiario);
        if (!guessrEstadioCorrecto) {
            showToast("Error al cargar el estadio del reto diario 🚨", "ph-warning-circle", "danger");
            cerrarModalVideo();
            return;
        }
        guessrEstadiosJugados.push(nombreEstadioDiario);
        const taunts = document.getElementById('taunts-container');
        if (taunts) taunts.style.display = 'none';

    } else {
        // LÓGICA CLÁSICA: MODO INDIVIDUAL ALEATORIO
        if(!disp.length){showToast('¡Completaste todas las ubicaciones!');cerrarModalVideo();return;}
        guessrEstadioCorrecto=disp[Math.floor(Math.random()*disp.length)];
        guessrEstadiosJugados.push(bscarPropiedad(guessrEstadioCorrecto,'Estadio'));
        const taunts = document.getElementById('taunts-container');
        if (taunts) taunts.style.display = 'none';
    }

    guessrSelectedLatLng=null;actualizarDotsProgreso();
    const hintOverlay=document.getElementById('map-hint-overlay');if(hintOverlay)hintOverlay.style.opacity='1';

    // 💡 PISTAS EN MODO FÁCIL CON GLOBITO INTERACTIVO (PAÍS, CAPACIDAD Y TRIVIA)
    const hintsBox = document.getElementById('guessr-hud-hints');
    if (hintsBox) {
        if (guessrDificultad === 'facil' && !esModoDiario) {
            const paisEstadio = bscarPropiedad(guessrEstadioCorrecto, 'País') || 'Internacional';
            const capEstadio = String(bscarPropiedad(guessrEstadioCorrecto, 'Capacidad')).replace(/[^0-9]/g, '');
            const capTexto = capEstadio ? `${parseInt(capEstadio).toLocaleString('es-AR')} espectadores` : 'No especificada';
            const triviaEstadio = (bscarPropiedad(guessrEstadioCorrecto, 'Dato Curioso') || '¡Este estadio esconde grandes historias del fútbol mundial!').replace(/'/g, "\u2019").replace(/"/g, "\u201C");

            hintsBox.style.display = 'block';
            hintsBox.innerHTML = `
                <button type="button" class="guessr-hint-btn" onclick="toggleGuessrHintBalloon(event)" title="Abrir pistas">
                    <i class="ph-fill ph-lightbulb" style="color:var(--accent-color); font-size: 1rem;"></i>
                    <span>Pistas</span>
                </button>
                <div class="guessr-hint-balloon" id="guessr-hint-balloon" onclick="event.stopPropagation()">
                    <div class="guessr-hint-row">
                        <img src="mundo.webp" class="hint-icon" alt="País">
                        <span>País: <b style="color:var(--accent-color);">${paisEstadio}</b></span>
                    </div>
                    <div class="guessr-hint-row">
                        <img src="capacidad.webp" class="hint-icon" alt="Capacidad">
                        <span>Capacidad: <b style="color:var(--accent-color);">${capTexto}</b></span>
                    </div>
                    <div class="guessr-hint-trivia">
                        <b style="color:var(--text-main); display:block; margin-bottom:3px;"><i class="ph-bold ph-sparkle" style="color:var(--accent-color);"></i> Trivia:</b>
                        ${triviaEstadio}
                    </div>
                </div>
            `;
        } else {
            hintsBox.style.display = 'none';
            hintsBox.innerHTML = '';
        }
    }

    // ⏱️ CONTRARRELOJ EN MODO DIFÍCIL / LEYENDA (45s)
    if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);
    if (guessrDificultad === 'dificil' && !esModoDiario) {
        guessrTiempoRestanteIndividual = 45;
    }

    // Scoreboard en vivo para 1v1 o HUD clásico para Solitario / Reto Diario
    if (esModoVersus) {
        renderizarScoreboardVersus();
        const taunts = document.getElementById('taunts-container');
        if (taunts) taunts.style.display = 'flex';
    } else {
        const sb = document.getElementById('versus-live-scoreboard');
        if (sb) sb.style.display = 'none';
        const gt = document.getElementById('game-title');
        if (gt) gt.style.display = 'inline-flex';
        const taunts = document.getElementById('taunts-container');
        if (taunts) taunts.style.display = 'none';
        const hud = document.querySelector('.guessr-top-hud');
        if (hud) hud.classList.remove('hud-versus-active');
    }

if (guessrDificultad === 'dificil' && !esModoDiario) {
    if (!esModoVersus) {
        document.getElementById('game-title').innerHTML = `<span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span> &nbsp;·&nbsp; RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--danger-color); font-weight:900;">⏱️ ${guessrTiempoRestanteIndividual}s</span>`;
    }
    
    guessrTimerIndividualInterval = setInterval(() => {
        guessrTiempoRestanteIndividual--;
        const isUrgent = guessrTiempoRestanteIndividual <= 5 && guessrTiempoRestanteIndividual > 0;
        if (isUrgent && typeof reproducirSonido === 'function') {
            reproducirSonido('reloj');
        }

        if (esModoVersus) {
            const sec = document.getElementById('vs-sb-leyenda-sec');
            if (sec) {
                sec.textContent = guessrTiempoRestanteIndividual + 's';
                sec.classList.toggle('timer-urgent-pulse', isUrgent);
            }
        } else {
            const gt = document.getElementById('game-title');
            if (gt) {
                gt.innerHTML = `<span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span> &nbsp;·&nbsp; RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span class="${isUrgent ? 'timer-urgent-pulse' : ''}" style="color:var(--danger-color); font-weight:900;">⏱️ ${guessrTiempoRestanteIndividual}s</span>`;
            }
        }
        
        if (guessrTiempoRestanteIndividual <= 0) {
            clearInterval(guessrTimerIndividualInterval);
            showToast("⏱️ ¡Tiempo agotado en modo Leyenda!", "ph-clock", "danger");
            if (!guessrSelectedLatLng) guessrSelectedLatLng = { lat: 0, lng: 0 };
            if (esModoVersus) confirmarArriesgoLocalVersus();
            else procesarArriesgoGuessr();
        }
    }, 1000);
} else if (!esModoVersus) {
    document.getElementById('game-title').innerHTML = `<span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span> &nbsp;·&nbsp; RONDA ${guessrRondaActual} DE 5`;
}
const btn=document.getElementById('game-action-btn');btn.style.background='';btn.style.color='';btn.style.boxShadow='';btn.style.border='';btn.style.borderTop='';btn.innerHTML=`<i class="ph-duotone ph-map-pin"></i> Clavá un pin en el mapa`;btn.className="btn-3d secondary";btn.style.width="100%";btn.disabled=true;btn.setAttribute('data-estado','juego');btn.onclick=()=>btn.getAttribute('data-estado')==='juego'?procesarArriesgoGuessr():avanzarDeRondaGuessr();
abrirModalVideo(null,bscarPropiedad(guessrEstadioCorrecto,'Link del Video').trim(),true);
// PEGAR ESTO REEMPLAZANDO EL SETTIMEOUT(..., 600) DE lanzarRondaGuessr:
    // Contraemos el mapa al inicio de cada ronda
    if (typeof toggleExpandirMapaGuessr === 'function') toggleExpandirMapaGuessr(false);

    setTimeout(() => {
        if (guessrMapInstance) guessrMapInstance.remove();
        const mapContainer = document.getElementById('map-guess-container');
        if (!mapContainer) return;

        guessrMapInstance = L.map(mapContainer, { attributionControl: false, zoomControl: false }).setView([20, 0], 1);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(guessrMapInstance);
        
        guessrMapInstance.on('click', e => {
            if (btn.getAttribute('data-estado') === 'resultado' || btn.getAttribute('data-estado') === 'procesando') return;
            guessrSelectedLatLng = e.latlng;
            if (guessrUserMarker) guessrUserMarker.setLatLng(guessrSelectedLatLng);
            else guessrUserMarker = L.marker(guessrSelectedLatLng).addTo(guessrMapInstance);
            if (typeof reproducirSonido === 'function') reproducirSonido('pin');
            const hint = document.getElementById('map-hint-overlay');
            if (hint) hint.style.opacity = '0';
            btn.innerHTML = `<i class="ph-fill ph-rocket-launch"></i> ¡Confirmar ubicación!`;
            btn.className = "btn-3d primary";
            btn.disabled = false;
        });

        if (!window._guessrMapResizeObs) {
            window._guessrMapResizeObs = new ResizeObserver(() => {
                if (guessrMapInstance) guessrMapInstance.invalidateSize();
            });
            window._guessrMapResizeObs.observe(mapContainer);
        }

        const mapBox = document.getElementById('guessr-floating-map-box');
        if (mapBox && !mapBox.dataset.leaveBound) {
            mapBox.dataset.leaveBound = "true";
            mapBox.addEventListener('mouseenter', () => {
                if (!mapBox.classList.contains('collapsed')) {
                    const icon = document.getElementById('guessr-map-expand-icon');
                    if (icon) icon.className = 'ph-bold ph-arrows-in-simple';
                }
            });
            mapBox.addEventListener('mouseleave', () => {
                mapBox.classList.remove('collapsed');
                if (!mapBox.classList.contains('pinned') && !mapBox.classList.contains('expanded')) {
                    const icon = document.getElementById('guessr-map-expand-icon');
                    if (icon) icon.className = 'ph-bold ph-arrows-out-simple';
                }
            });
        }

    }, 300);
// 🤖 CONFIGURACIÓN DE INICIATIVA DEL BOT (Arriesga de forma autónoma entre 20 y 30 segundos)
    if (esModoBot) {
        if (botAntesTimer) clearTimeout(botAntesTimer);
        botAntesTimer = setTimeout(() => {
            ejecutarVotoBotDinamico();
        }, 20000 + Math.random() * 10000);
    }
}

async function procesarArriesgoGuessr(){
if (esModoVersus) {
    await confirmarArriesgoLocalVersus();
    return;
}
if (typeof toggleExpandirMapaGuessr === 'function') toggleExpandirMapaGuessr(true);

const btn=document.getElementById('game-action-btn');if(btn.getAttribute('data-estado')==='procesando'||btn.getAttribute('data-estado')==='resultado')return;btn.setAttribute('data-estado','procesando');btn.disabled=true;
if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);

let tLat=parseFloat(String(bscarPropiedad(guessrEstadioCorrecto,'Latitud')).trim().replace(',','.')),tLng=parseFloat(String(bscarPropiedad(guessrEstadioCorrecto,'Longitud')).trim().replace(',','.'));
let dist = 0;
let pts = 0;

const nombreEstadio = bscarPropiedad(guessrEstadioCorrecto, 'Estadio');
if (!guessrSelectedLatLng) guessrSelectedLatLng = { lat: 0, lng: 0 };
if (!guessrUserMarker && guessrMapInstance) {
    try { guessrUserMarker = L.marker(guessrSelectedLatLng).addTo(guessrMapInstance); } catch(e) {}
}
const latUsuario = guessrSelectedLatLng.lat;
const lngUsuario = guessrSelectedLatLng.lng;

// 🛡️ Validación en servidor por RPC
if (supabaseClient) {
    try {
        const { data: resCalculo, error } = await supabaseClient.rpc('calcular_puntaje_tiro', {
            p_estadio: nombreEstadio,
            p_lat: latUsuario,
            p_lng: lngUsuario
        });

        if (!error && resCalculo) {
            dist = resCalculo.distancia;
            pts = resCalculo.puntos;
            if (resCalculo.lat_real && resCalculo.lng_real) {
                tLat = resCalculo.lat_real;
                tLng = resCalculo.lng_real;
            }
        } else {
            dist = calcularDistanciaHaversine(latUsuario, lngUsuario, tLat, tLng);
            pts = isNaN(dist)?0:Math.max(0,Math.round(5000*Math.pow(Math.E,-dist/1200)));
        }
    } catch (e) {
        dist = calcularDistanciaHaversine(latUsuario, lngUsuario, tLat, tLng);
        pts = isNaN(dist)?0:Math.max(0,Math.round(5000*Math.pow(Math.E,-dist/1200)));
    }
} else {
    dist = calcularDistanciaHaversine(latUsuario, lngUsuario, tLat, tLng);
    pts = isNaN(dist)?0:Math.max(0,Math.round(5000*Math.pow(Math.E,-dist/1200)));
}

guessrPuntosTotales += pts;
guessrHistorialRondas.push({
    ronda: guessrRondaActual,
    estadio: bscarPropiedad(guessrEstadioCorrecto, 'Estadio'),
    club: bscarPropiedad(guessrEstadioCorrecto, 'Club'),
    distancia: dist,
    puntos: pts
});
// 👇 AGREGAMOS ESTE BLOQUE PARA GUARDAR EL TIRO CRUDO 👇
guessrHistorialCoordenadas.push({
    estadio: bscarPropiedad(guessrEstadioCorrecto, 'Estadio'),
    lat: guessrSelectedLatLng.lat,
    lng: guessrSelectedLatLng.lng
});
// 👆 FIN DEL BLOQUE 👇
if(!isNaN(dist)&&dist<5)userStats.medallaLocalista=true;if(!isNaN(dist)&&dist<1)userStats.guessrUnKm=true;actualizarDotsProgreso();
guessrTargetMarker=L.circleMarker([tLat,tLng],{radius:9,color:'#00e676',fillColor:'#111820',fillOpacity:1,weight:3}).addTo(guessrMapInstance).bindPopup(`<b>${bscarPropiedad(guessrEstadioCorrecto,'Estadio')}</b>`).openPopup();
guessrPolyline=L.polyline([[guessrSelectedLatLng.lat,guessrSelectedLatLng.lng],[tLat,tLng]],{color:'#ff4757',weight:3,className:'animated-flight-path'}).addTo(guessrMapInstance);
let marcasParaEncuadrar = [guessrTargetMarker];
if (guessrUserMarker) marcasParaEncuadrar.push(guessrUserMarker);
guessrMapInstance.fitBounds(L.featureGroup(marcasParaEncuadrar).getBounds(),{padding:[40,40]});
document.getElementById('game-title').innerHTML = `<span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span> &nbsp;·&nbsp; RONDA ${guessrRondaActual} DE 5`;
const distT=isNaN(dist)?'?':(dist<1?`${Math.round(dist*1000)} m`:`${dist.toFixed(1)} km`),emoji=dist<50?'🎯':dist<200?'✈️':dist<800?'🗺️':'🌍',esExc=!isNaN(dist)&&dist<100,esBien=!isNaN(dist)&&dist<500;
const textoBotonSolitario = guessrRondaActual < 5 ? 'SIGUIENTE' : 'FINAL';
const iconoBotonSolitario = guessrRondaActual < 5 ? '<i class="ph-bold ph-arrow-right"></i>' : '🏁';
btn.innerHTML=`
<div class="btn-action-wrapper" style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 0.85rem; gap: 6px;">
    <span class="btn-action-stats">
        ${emoji} <b>${distT}</b> <span style="opacity: 0.4;">|</span> <b style="font-size: 0.92rem; font-weight: 900;">+${pts} pts</b>
    </span>
    <span class="btn-action-text">
        ${textoBotonSolitario} ${iconoBotonSolitario}
    </span>
</div>`;
if(esExc){
    btn.style.background="linear-gradient(135deg, rgba(12, 38, 26, 0.95) 0%, rgba(8, 22, 16, 0.98) 100%)";
    btn.style.color="#ffffff";
    btn.style.border="1.5px solid #00e676";
    btn.style.borderTop="2px solid #a7f3d0";
    btn.style.boxShadow="0 4px 16px rgba(0, 0, 0, 0.5), 0 0 18px rgba(0, 230, 118, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
}else if(esBien){
    btn.style.background="linear-gradient(135deg, rgba(38, 28, 12, 0.95) 0%, rgba(20, 14, 8, 0.98) 100%)";
    btn.style.color="#ffffff";
    btn.style.border="1.5px solid #fbbf24";
    btn.style.borderTop="2px solid #fef08a";
    btn.style.boxShadow="0 4px 16px rgba(0, 0, 0, 0.5), 0 0 18px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
}else{
    btn.style.background="linear-gradient(135deg, rgba(38, 14, 18, 0.95) 0%, rgba(22, 8, 10, 0.98) 100%)";
    btn.style.color="#ffffff";
    btn.style.border="1.5px solid #ff4757";
    btn.style.borderTop="2px solid #fecdd3";
    btn.style.boxShadow="0 4px 16px rgba(0, 0, 0, 0.5), 0 0 18px rgba(255, 71, 87, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
}
// 👇 SPRINT VIRAL - PASO 3: EFECTOS JUICY EN SOLITARIO 👇
dispararJuicinessRonda(dist);
btn.setAttribute('data-estado','resultado');btn.disabled=false;
}

function avanzarDeRondaGuessr(){
    document.querySelectorAll('.stamp-badge, #versus-next-round-banner, .taunt-arcade-burst').forEach(el => { try { el.remove(); } catch(e) {} });
    [guessrUserMarker,guessrTargetMarker,guessrPolyline].forEach(m=>{try{if(m)m.remove();}catch(e){}});
    guessrUserMarker=guessrTargetMarker=guessrPolyline=null;
    guessrRondaActual++;
    guessrRondaActual<=5?lanzarRondaGuessr():finalizarJuegoGuessr();
}

// CIERRE DEL JUEGO ADAPTADO PARA MULTIJUGADOR (HUMANO/BOT) Y SOLITARIO
async function finalizarJuegoGuessr(){
    // 🧹 Limpieza instantánea en el milisegundo cero de cualquier cartel emergente (sello de folklore/distancia, banners, etc.)
    document.querySelectorAll('.stamp-badge, #versus-next-round-banner, .taunt-arcade-burst').forEach(el => { try { el.remove(); } catch(e) {} });

    // 🎯 TRACKING GA4: Partida Completada con puntaje (Oro para mostrar retención a publicistas)
    if (typeof window.trackEvento === 'function') {
        const modoFin = esModoVersus ? '1v1_versus' : (esModoDiario ? 'reto_diario' : ('individual_' + (guessrDificultad || 'medio')));
        window.trackEvento('partida_completada', {
            modo: modoFin,
            puntos: guessrPuntosTotales || 0,
            rondas_jugadas: (guessrHistorialRondas && guessrHistorialRondas.length) || 5
        });
        if (esModoDiario) {
            window.trackEvento('reto_diario_completado', { puntos: guessrPuntosTotales || 0 });
        }
    }

    localStorage.setItem('ev_primera_partida_finalizada_' + getUserId(), 'true');
    localStorage.setItem('ev_primera_partida_finalizada_global', 'true');
    const container=document.getElementById('modal-video-container');
    // 🛑 Corte instantáneo de video y audio en el milisegundo cero
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:300px;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2.5rem;color:var(--accent-color);"></i></div>';
    document.getElementById('game-ui').style.display='none';
    container.style.height='auto';
    
    const card = document.getElementById('modal-card');
    card.classList.remove('stadium-guessr-layout');
    card.classList.add('resultado-final', 'resultado-final-layout');
    card.style.display = 'flex'; // 🛡️ Mantiene la visibilidad activa sin importar el estado previo
    
    // 🛡️ Segundo escudo: purga cualquier elemento flotante rezagado dentro de card
    card.querySelectorAll('.stamp-badge, #versus-next-round-banner, .taunt-arcade-burst').forEach(el => { try { el.remove(); } catch(e) {} });

    if(guessrMapInstance){try{guessrMapInstance.remove();}catch(e){}guessrMapInstance=null;}

    // 👇 1. ARMAMOS LA TABLA DE DESGLOSE PARA TODOS LOS MODOS 👇
    let histHTML=`<div style="width:100%;max-width:100%;text-align:left;margin:0 auto 6px;background:var(--surface-color);border:1.5px solid var(--border-strong);border-radius:12px;padding:5px 10px;box-sizing:border-box;"><h4 style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;padding-bottom:3px;border-bottom:1px dashed var(--border-subtle);">Desglose por ronda</h4>`;
    
    guessrHistorialRondas.forEach(item => {
        const dT = isNaN(item.distancia) ? '?' : (item.distancia < 1 ? `${Math.round(item.distancia * 1000)} m` : `${item.distancia.toFixed(1)} km`);
        const starClass = item.puntos > 3000 ? 'pts-high' : item.puntos > 1000 ? 'pts-mid' : 'pts-low';
        
        histHTML += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border-subtle);font-size:.80rem;gap:6px;">
            <div style="display:flex;flex-direction:column;overflow:hidden;min-width:0;flex:1;">
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2;"><b style="color:var(--accent-color);">R${item.ronda}:</b> ${item.estadio}</span>
                <span style="font-size:0.65rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:0px;">${item.club || ''}</span>
            </div>
            <span style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
                <span style="color:var(--text-muted);font-size:.70rem;">${dT}</span>
                <b class="pts-breakdown ${starClass}" style="padding:2px 6px; font-size:.74rem;">+${item.puntos}</b>
            </span>
        </div>`;
    });
    histHTML+='</div>';

    // ==========================================
    // CIERRE MODO VERSUS (1v1, SALA PRIVADA Y LIGAS)
    // ==========================================
    if (esModoVersus) {
        esModoVersus = false;          
        versusPartidaEnCurso = false;  
        
        if (versusChannel) {
            try { supabaseClient.removeChannel(versusChannel); } catch(e) {}
            versusChannel = null;
        }

        const id = getUserId();
        const u = obtenerUsuarioLogueado();
        const nombreLocal = obtenerNombreDisplay().trim();
        userStats.partidasJugadas = (userStats.partidasJugadas || 0) + 1;

        let nombreRivalFinal = (versusRivalNombre || "RIVAL").toUpperCase();
        let cartelResultado = "";
        let colorResultado = "#ffea00";
        
        const ligaJugada = versusLigaOrigen;

        if (ligaJugada) {
            await enviarPuntaje(nombreLocal, guessrPuntosTotales, u?.email || '', 'duelo_' + ligaJugada);
        }
        
        let spPillVersus = '';
        if (guessrPuntosTotales > rivalPuntosTotales) {
            cartelResultado = `<span>¡VICTORIA!</span> <img src="liga-trofeo-header.webp" alt="Trofeo" class="vs-result-trophy">`;
            colorResultado = "#00e676";

            // ⚡ Acreditación de +2 SP por victoria en 1 vs 1
            const spPremio1v1 = 2;
            userStats.puntosHabilidad = (userStats.puntosHabilidad || 0) + spPremio1v1;
            spPillVersus = `<div class="versus-sp-reward-pill"><i class="ph-bold ph-lightning"></i> Recompensa: +${spPremio1v1} SP</div>`;

            showToast(`¡Ganaste el partido! +${spPremio1v1} SP de Habilidad 🔥`, "ph-trophy", "success");
            userStats.partidasGanadas = (userStats.partidasGanadas || 0) + 1;
            guardarStats(); 
            registrarH2HMutual(versusRivalNombre, 'win');
            try { await supabaseClient.from('victorias_versus').insert([{ id_usuario: id, nombre: nombreLocal, liga: ligaJugada }]); } catch(err) {}
        } else if (guessrPuntosTotales < rivalPuntosTotales) {
            cartelResultado = "<span>DERROTA</span> ❌";
            colorResultado = "#ff4757";
            showToast("Derrota. ¡A entrenar para la revancha! ⚽", "ph-x-circle", "danger");
            registrarH2HMutual(versusRivalNombre, 'loss');
            
            if (ligaJugada) {
                try { await supabaseClient.from('derrotas_versus').insert([{ id_usuario: id, nombre: nombreLocal, liga: ligaJugada }]); } catch(err) {}
            }
        } else {
            cartelResultado = "<span>¡EMPATE DE CRACKS!</span> 🤝";
            colorResultado = "#2979ff";
            registrarH2HMutual(versusRivalNombre, 'draw');
        }

        versusLigaOrigen = null;

        const botonFinal = ligaJugada 
            ? `<button onclick="cerrarModalVideo(); abrirModalLigaAmigosPrivada();" class="btn-3d btn-endgame-save" style="padding:13px 24px;width:100%;"><i class="ph-fill ph-users-three"></i> Volver a mi Liga</button>`
            : `<div style="display:flex;gap:10px;width:100%;">
                <button onclick="cerrarModalVideo(); abrirModalRanking('v_historico');" class="btn-3d btn-endgame-rank" style="flex:1;font-size:.88rem;padding:12px;"><img src="medalla-oro.webp" alt="Ranking" style="width:20px;height:20px;object-fit:contain;"> Ranking 1v1</button>
                <button onclick="cerrarModalVideo(); buscarPartidaVersus();" class="btn-3d btn-endgame-replay" style="flex:1;font-size:.88rem;padding:12px;"><i class="ph-bold ph-sword"></i> Nuevo 1 vs 1</button>
               </div>`;

        container.innerHTML = `
        <div style="text-align:center; padding:30px 18px 20px; color:var(--text-main); display:flex; flex-direction:column; align-items:center; justify-content:flex-start; height:auto; box-sizing:border-box; background: radial-gradient(circle at 50% -15%, rgba(0, 230, 118, 0.20) 0%, transparent 65%), radial-gradient(circle at 50% 105%, rgba(41, 121, 255, 0.10) 0%, transparent 55%), linear-gradient(180deg, #0c1520 0%, #060a10 100%);">
            <div class="endgame-grid-layout">
                <div class="endgame-area-header">
                    <h2 style="font-size:1.6rem; font-weight:900; text-transform:uppercase; margin-bottom:4px; color:${colorResultado}; display:flex; align-items:center; justify-content:center; gap:8px;">${cartelResultado}</h2>
                    <p style="color:var(--text-muted); margin-bottom:4px; font-size:.84rem;">Marcador Final del Mano a Mano</p>
                    ${spPillVersus}
                </div>
                
                <div class="endgame-area-ring">
                    <div class="vs-card-banner" style="display:flex; align-items:center; gap:16px; background:var(--surface-color); border:2px solid var(--border-strong); padding:10px 18px; border-radius:14px; width:100%; box-sizing:border-box; justify-content:center;">
                        <div style="text-align:center;"><div style="font-size:.72rem; color:var(--text-muted); font-weight:800; letter-spacing:1px;">VOS</div><strong class="vs-user-score" style="font-size:1.55rem; font-weight:900;">${guessrPuntosTotales.toLocaleString('es-AR')}</strong></div>
                        <div class="vs-text-divider" style="font-size:1.1rem; font-weight:900;">VS</div>
                        <div style="text-align:center;"><div style="font-size:.72rem; color:var(--text-muted); font-weight:800; letter-spacing:1px;">${nombreRivalFinal}</div><strong class="vs-rival-score" style="font-size:1.55rem; font-weight:900;">${rivalPuntosTotales.toLocaleString('es-AR')}</strong></div>
                    </div>
                </div>

                <div class="endgame-area-list">
                    ${histHTML}
                </div>
                
                <div class="endgame-area-action">
                    ${botonFinal}
                </div>
            </div>
        </div>`;
        setTimeout(() => lanzarConfetti(document.getElementById('modal-card')), 250);
        return;
    }

    // ==========================================
    // CIERRE MODO SOLITARIO / RETO DIARIO
    // ==========================================
    const eraRetoDiario = esModoDiario;
    const hoyObj = new Date();
    const fechaHoyStr = hoyObj.getFullYear() + '-' + String(hoyObj.getMonth() + 1).padStart(2, '0') + '-' + String(hoyObj.getDate()).padStart(2, '0');

    if (eraRetoDiario) {
        const idUsuario = getUserId();
        localStorage.setItem('ev_reto_diario_fecha_' + idUsuario, fechaHoyStr);
    }

    if(guessrPuntosTotales>userStats.maxScore)userStats.maxScore=guessrPuntosTotales;
    if(guessrPuntosTotales>=20000)userStats.scoreMayor20000=true;
    if(guessrPuntosTotales>=10000)userStats.scoreMayor10000=true;
    if(guessrHistorialRondas.length===5&&guessrHistorialRondas.every(r=>r.puntos>=4000))userStats.guessrPerfecto=true;
    guardarStats();

    let multXP = 1.0;
    if (!esModoVersus && !eraRetoDiario) {
        if (guessrDificultad === 'facil') multXP = 0.8;
        else if (guessrDificultad === 'dificil') multXP = 1.5;
    }
    const xpGanada = Math.round(guessrPuntosTotales * multXP);
    agregarXP(xpGanada);

    // ⚡ Cálculo y acreditación de Puntos de Habilidad (SP) para el Once Inicial
    let spGanados = Math.floor(guessrPuntosTotales / 3000);
    const tirosAlArea = guessrHistorialRondas.filter(r => !isNaN(r.distancia) && r.distancia < 15).length;
    if (tirosAlArea > 0) spGanados += tirosAlArea; // +1 SP bonus por cada tiro clavado a menos de 15 km
    if (guessrPuntosTotales >= 20000) spGanados += 2; // +2 SP bonus por rendimiento galáctico
    userStats.puntosHabilidad = (userStats.puntosHabilidad || 0) + spGanados;

    pendingScore = guessrPuntosTotales;
    pendingScoreType = eraRetoDiario ? ('diario_' + fechaHoyStr) : 'guessr';

    // 🚀 AUTO-GUARDADO SILENCIOSO EN SERVIDOR
    const esAutomatizado = typeof navigator !== 'undefined' && (navigator.webdriver || window.__TIKTOK_RECORDER__);
    const u = obtenerUsuarioLogueado();
    let nombreParaGuardar = getPref('ev_custom_nick', '');
    if (!nombreParaGuardar && u && u.name) {
        nombreParaGuardar = u.name.split(' ')[0];
    }
    if (!nombreParaGuardar) {
        const prefijos = ['Hincha', 'DT', 'Pibe', 'Capitan', 'Goleador'];
        const pref = prefijos[Math.floor(Math.random() * prefijos.length)];
        nombreParaGuardar = `${pref}_${Math.floor(100 + Math.random() * 900)}`;
        setPref('ev_custom_nick', nombreParaGuardar);
        renderizarBotonLogin();
    }

    const emailParaGuardar = (u && u.email) ? u.email : '';
    if (!esAutomatizado && !esRegistroBot(nombreParaGuardar, guessrPuntosTotales)) {
        enviarPuntaje(nombreParaGuardar, guessrPuntosTotales, emailParaGuardar, pendingScoreType);

        if (eraRetoDiario) {
            enviarPuntaje(nombreParaGuardar, guessrPuntosTotales, emailParaGuardar, 'guessr');
        }
        const ligaAmigos = localStorage.getItem('ev_codigo_liga_amigos');
        if (ligaAmigos) {
            enviarPuntaje(nombreParaGuardar, guessrPuntosTotales, emailParaGuardar, 'duelo_' + ligaAmigos);
        }
    } else {
        console.warn(`🛡️ Auto-guardado omitido para sesión bot/grabador: ${nombreParaGuardar} (${guessrPuntosTotales} pts)`);
    }

    const strokeColor = guessrPuntosTotales > 15000 ? '#00e676' : guessrPuntosTotales > 8000 ? '#ff8f00' : '#ff4757';
    const circumf = 2 * Math.PI * 44;
    const dashOff = circumf - (circumf * Math.min(guessrPuntosTotales, 25000) / 25000);
    const spDashOff = spGanados > 0 ? (circumf - (circumf * Math.min(spGanados, 5) / 5)) : circumf;
    const nivelActual = NIVELES[calcularNivelIdx(userStats.xpTotal)];

    const cartelGuardado = `
    <div style="width:100%; background:linear-gradient(135deg, rgba(0,255,119,0.12) 0%, rgba(10,36,24,0.85) 100%); border:1.5px solid #00e676; border-radius:10px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:6px; box-sizing:border-box;">
        <span style="font-size:0.74rem; font-weight:800; color:#ffffff; display:flex; align-items:center; gap:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <i class="ph-fill ph-check-circle" style="color:#00ff77; font-size:1rem; flex-shrink:0;"></i> Récord anotado: <b id="lbl-apodo-guardado" style="color:#00ff77;">${sanitizarHTML(nombreParaGuardar)}</b>
        </span>
        <button type="button" onclick="cambiarApodoDesdePantallaFinal()" class="btn-3d secondary" style="padding:4px 8px; font-size:0.66rem; height:auto; min-height:auto; flex-shrink:0; border-radius:6px;">
            <i class="ph-bold ph-pencil-simple"></i> Cambiar
        </button>
    </div>`;
    
    let botonCompartirDiario = '';
    let botonRejugar = '';
    const paramRanking = eraRetoDiario ? "'diario'" : "'solo'";

    if (eraRetoDiario) {
        botonCompartirDiario = `<button onclick="compartirRetoDiarioWordle()" class="btn-3d btn-endgame-daily-share" style="width:100%; padding:9px 12px; font-size:.82rem;"><i class="ph-bold ph-share-network"></i> Compartir Reto Diario</button>`;
    } else {
        botonRejugar = `<button onclick="iniciarTrivia()" class="btn-3d btn-endgame-replay" style="flex:1; font-size:.82rem; padding:9px 12px;"><i class="ph-bold ph-arrow-counter-clockwise"></i> Rejugar</button>`;
    }
    
    container.innerHTML = `
    <div style="text-align:center; padding:26px 14px 20px; color:var(--text-main); display:flex; flex-direction:column; align-items:center; justify-content:flex-start; width:100%; height:auto; box-sizing:border-box; background: radial-gradient(circle at 50% -15%, rgba(0, 230, 118, 0.20) 0%, transparent 65%), radial-gradient(circle at 50% 105%, rgba(41, 121, 255, 0.10) 0%, transparent 55%), linear-gradient(180deg, #0c1520 0%, #060a10 100%);">
        <div class="endgame-grid-layout">
            <div class="endgame-area-header">
                <h2 style="font-size:1.22rem; font-weight:900; text-transform:uppercase; margin-top:0; margin-bottom:2px; letter-spacing:-.5px;">¡Misión Completada!</h2>
                <p style="color:var(--text-muted); margin-bottom:4px; font-size:.75rem;">Reconocimiento aéreo · <span style="color:${nivelActual.color};">${nivelActual.emoji}${nivelActual.nombre}</span></p>
            </div>
            
            <!-- ⚡ DOBLE CÍRCULO: PUNTOS A LA IZQUIERDA Y SP A LA DERECHA (CON TOOLTIP) -->
            <div class="endgame-area-ring dual-rings-row">
                <!-- 1. CÍRCULO IZQUIERDO: PUNTOS DE LA PARTIDA -->
                <div class="endgame-ring-glow-wrapper">
                    <div class="endgame-ring-aura" style="width:105px; height:105px; background: radial-gradient(circle, ${strokeColor} 0\%,${strokeColor}44 42%, transparent 72%);"></div>
                    <div class="result-score-ring" style="width:76px; height:76px; margin:0 auto; position:relative; z-index:1;">
                        <svg width="76" height="76" viewBox="0 0 120 120" style="width:76px; height:76px;">
                            <circle cx="60" cy="60" r="44" fill="none" stroke="var(--border-strong)" stroke-width="10"/>
                            <circle cx="60" cy="60" r="44" fill="none" stroke="${strokeColor}" stroke-width="10" stroke-dasharray="${circumf.toFixed(1)}" stroke-dashoffset="${dashOff.toFixed(1)}" stroke-linecap="round" style="transition:stroke-dashoffset 1.5s ease; filter:drop-shadow(0 0 8px ${strokeColor});"/>
                        </svg>
                        <div class="score-num">
                            <strong style="font-size:0.92rem; color:${strokeColor}; font-weight:900; line-height:1; letter-spacing:-0.3px;">${guessrPuntosTotales.toLocaleString('es-AR')}</strong>
                            <span style="font-size:.50rem; color:var(--text-muted); font-weight:800; margin-top:2px; letter-spacing:0.6px;">PTS</span>
                        </div>
                    </div>
                </div>

                <!-- 2. CÍRCULO DERECHO: SP DE HABILIDAD + TOOLTIP FLOTANTE -->
                <div class="endgame-ring-glow-wrapper sp-ring-wrapper" tabindex="0">
                    <div class="sp-tooltip-bubble">
                        Entrená a tus jugadores con SP para aumentar la calidad de tu equipo
                    </div>
                    <div class="endgame-ring-aura" style="width:105px; height:105px; background: radial-gradient(circle, #00ff77 0%, rgba(0,255,119,0.35) 42%, transparent 72%);"></div>
                    <div class="result-score-ring" style="width:76px; height:76px; margin:0 auto; position:relative; z-index:1;">
                        <svg width="76" height="76" viewBox="0 0 120 120" style="width:76px; height:76px;">
                            <circle cx="60" cy="60" r="44" fill="none" stroke="var(--border-strong)" stroke-width="10"/>
                            <circle cx="60" cy="60" r="44" fill="none" stroke="#00ff77" stroke-width="10" stroke-dasharray="${circumf.toFixed(1)}" stroke-dashoffset="${spDashOff.toFixed(1)}" stroke-linecap="round" style="transition:stroke-dashoffset 1.5s ease; filter:drop-shadow(0 0 8px #00ff77);"/>
                        </svg>
                        <div class="score-num">
                            <strong style="font-size:1.02rem; color:#00ff77; font-weight:900; line-height:1; letter-spacing:-0.3px;">+${spGanados}</strong>
                            <span style="font-size:.50rem; color:#a7f3d0; font-weight:800; margin-top:2px; letter-spacing:0.6px;">SP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="endgame-area-list">
                ${histHTML}
            </div>

            <div class="endgame-area-action">
                <div style="display:flex; flex-direction:column; gap:7px; width:100%;">
                    ${cartelGuardado}
                    ${botonCompartirDiario}
                    <div style="display:flex; gap:8px; width:100%;">
                        <button onclick="abrirModalRanking(${paramRanking})" class="btn-3d btn-endgame-rank" style="flex:1; font-size:.82rem; padding:9px 12px;"><img src="medalla-oro.webp" alt="Ranking" style="width:17px; height:17px; object-fit:contain;"> Ranking</button>
                        ${botonRejugar}
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    container.scrollTop = 0;
    esModoDiario = false;
    setTimeout(() => lanzarConfetti(document.getElementById('modal-card')), 250);
}

function guardarScoreGuessr(btn){
    pendingScore = guessrPuntosTotales;
    if (!pendingScoreType) pendingScoreType = 'guessr';
    guardarScorePendiente(btn);
}
window.cambiarApodoDesdePantallaFinal = async function() {
    const apodoActual = getPref('ev_custom_nick', '') || 'Invitado';
    let nuevo = prompt("Ingresá tu apodo para el ranking:", apodoActual);
    if (nuevo === null) return;
    nuevo = nuevo.trim();
    if (!nuevo) return;
    if (nuevo.length > 16) nuevo = nuevo.substring(0, 16);
    if (nuevo.toLowerCase() === apodoActual.toLowerCase()) return;

    const disponible = await verificarApodoDisponible(nuevo);
    if (!disponible) {
        showToast(`El apodo "${nuevo}" ya pertenece a otro jugador 🚫`, 'ph-warning-circle', 'danger');
        return;
    }

    const viejo = apodoActual;
    setPref('ev_custom_nick', nuevo);
    renderizarBotonLogin();

    const lbl = document.getElementById('lbl-apodo-guardado');
    if (lbl) lbl.textContent = nuevo;

    await actualizarApodoEnTodoElSistema(viejo, nuevo);
    showToast(`¡Récord actualizado a nombre de ${nuevo}! 🎉`, 'ph-check-circle', 'success');
};
function calcularDistanciaHaversine(lat1,lon1,lat2,lon2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function compartirResultado(){const msg=`⚽ ¡Hice ${guessrPuntosTotales} puntos en StadiumGuessr | Estadios Virtuales! 🌍✈️ ¿Podés superarme?`;if(navigator.share)navigator.share({title:'StadiumGuessr',text:msg,url:location.href}).catch(()=>{});else{navigator.clipboard.writeText(`${msg} ${location.href}`).then(()=>showToast('¡Resultado copiado!')).catch(()=>showToast(`Puntaje: ${guessrPuntosTotales} pts`));}}

function compartirRetoDiarioWordle() {
    const hoy = new Date();
    const fechaText = String(hoy.getDate()).padStart(2, '0') + '/' + String(hoy.getMonth() + 1).padStart(2, '0');
    
    // Calificación de rendimiento viral según el puntaje total
    let rangoTexto = "¡Amateur total! 🥶";
    if (guessrPuntosTotales >= 22000) rangoTexto = "👑 ¡GALÁCTICO ABSOLUTO! 👑";
    else if (guessrPuntosTotales >= 18000) rangoTexto = "⭐ ¡Crack de Primera! ⭐";
    else if (guessrPuntosTotales >= 12000) rangoTexto = "🏃 Volante con despliegue 🏃";

    let texto = `🏟️ Misión StadiumGuessr Completada 🌍\n`;
    texto += `📅 Reto del día: ${fechaText}\n`;
    texto += `🏆 Puntaje: ${guessrPuntosTotales.toLocaleString('es-AR')} Pts\n`;
    texto += `📊 Rendimiento: ${rangoTexto}\n\n`;

    let emojisRondas = '';
    guessrHistorialRondas.forEach(ronda => {
        if (ronda.puntos >= 4500) emojisRondas += '🟩 ';      // Clavado al ángulo
        else if (ronda.puntos >= 3000) emojisRondas += '🟨 '; // En el área
        else if (ronda.puntos >= 1500) emojisRondas += '🟧 '; // En la tribuna
        else emojisRondas += '🟥 ';                           // Fuera del estadio
    });

    texto += emojisRondas.trim() + `\n\n👀 ¿Te da para ganarme o vas a arrugar?\n⚽ Desafiame acá: estadiosvirtuales.com`;

    if (navigator.share) {
        navigator.share({
            title: 'StadiumGuessr - Reto Diario',
            text: texto,
            url: 'https://www.estadiosvirtuales.com'
        }).then(() => {
            showToast("¡Reto compartido exitosamente! 🚀", "ph-share-network", "success");
        }).catch(err => {
            if (err.name !== 'AbortError' && navigator.clipboard) {
                navigator.clipboard.writeText(texto).then(() => {
                    showToast("¡Reto copiado! Compartilo con tus amigos 🚀", "ph-copy", "success");
                });
            }
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            showToast("¡Reto copiado! Compartilo con tus amigos 🚀", "ph-copy", "success");
        }).catch(err => {
            showToast("Tu navegador no soporta copiado directo.", "ph-warning-circle", "warning");
        });
    }
}

// 🛡️ FILTRO DE INTEGRIDAD: Descarta registros espurios de grabaciones y bots automáticos
function esRegistroBot(nombre, puntaje) {
    if (!nombre) return false;
    const n = String(nombre).trim();
    const p = Number(puntaje) || 0;

    // 1. Bots explícitos reportados de grabaciones/pruebas pasadas
    const botsExcluidos = ['pibe_241', 'capitan_174', 'capitan_494', 'dt_668', 'hincha_652', 'hincha_333', 'dt_744', 'capitan_739'];
    if (botsExcluidos.includes(n.toLowerCase())) return true;

    // 2. Patrón de nicks autogenerados de bots con puntajes anómalos o irreales
    if (/^(Capitan|Pibe|DT|Hincha|Goleador)_\d{3}$/i.test(n)) {
        if (p === 25000 || p === 23648 || p >= 21000) return true;
    }

    return false;
}
window.esRegistroBot = esRegistroBot;

async function abrirModalRanking(modoEspecifico = 'solo') {
    const body = document.getElementById('ranking-modal-body');
    body.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--text-muted);"><i class="ph-duotone ph-circle-notch" style="font-size:2.5rem;color:var(--accent-color);animation:spinSlow 1s linear infinite;"></i><br><br>Conectando...</div>';
    document.getElementById('ranking-modal').style.display = 'flex';
    await precargarAvataresComunidad();

    let activeSolo = modoEspecifico === 'solo' ? 'active' : '';
    let activeVHist = modoEspecifico === 'v_historico' ? 'active' : '';
    let activeVSem = modoEspecifico === 'v_semanal' ? 'active' : '';
    let activeDiario = modoEspecifico === 'diario' ? 'active' : '';

    const u = obtenerUsuarioLogueado();
    const miNombre = getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Vos');

    const estiloDiarioBtn = activeDiario
        ? 'background: linear-gradient(135deg, #ff9100 0%, #ff5722 100%) !important; border: 1.5px solid #ffa726 !important; box-shadow: 0 0 20px rgba(255, 145, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;'
        : 'border: 1.5px solid rgba(255, 145, 0, 0.45) !important; background: rgba(255, 145, 0, 0.06) !important;';
    const estiloDiarioTxt = activeDiario
        ? 'color: #120600 !important; font-weight: 900 !important; text-shadow: none !important;'
        : 'color: #ff9100 !important; font-weight: 800 !important; text-shadow: 0 0 8px rgba(255, 145, 0, 0.35);';

    let subMenuHTML = `
    <div class="liga-tabs-row ranking-tabs-row">
        <button class="liga-tab-btn tab-btn-solo ${activeSolo}" onclick="abrirModalRanking('solo')">
            <img src="ranking-icon-solo.webp" alt="Solo" class="ranking-tab-img"> <span>Individual</span>
        </button>
        <button class="liga-tab-btn tab-btn-versus ${activeVHist}" onclick="abrirModalRanking('v_historico')">
            <img src="ranking-icon-1v1.webp" alt="1v1 Historial" class="ranking-tab-img"> <span>1 vs 1 Hist.</span>
        </button>
        <button class="liga-tab-btn tab-btn-semanal ${activeVSem}" onclick="abrirModalRanking('v_semanal')">
            <img src="ranking-icon-semanal.webp" alt="Semanal" class="ranking-tab-img"> <span>Semanal</span>
        </button>
        <button class="liga-tab-btn tab-btn-diario ${activeDiario}" onclick="abrirModalRanking('diario')" style="${estiloDiarioBtn}">
            <img src="fuego.webp" alt="Reto Diario" class="ranking-tab-img"> 
            <span style="${estiloDiarioTxt}">Reto Diario</span>
        </button>
    </div>`;

    try {
        let htmlContenido = "";
        let headerConfig = {};
        const medallas3D = [
            '<img src="medalla-oro.webp" alt="1º" class="rank-pos-medal">',
            '<img src="medalla-plata.webp" alt="2º" class="rank-pos-medal">',
            '<img src="medalla-bronce.webp" alt="3º" class="rank-pos-medal">'
        ];
        const renderRankSlot = (idx, esSticky = false, stickyNum = 0) => {
            if (esSticky) {
                return `<span class="ranking-pos-slot sticky-slot"><span class="sticky-rank-pill">#${stickyNum}</span></span>`;
            }
            if (idx < 3) {
                return `<span class="ranking-pos-slot top3-slot">${medallas3D[idx]}</span>`;
            }
            return `<span class="ranking-pos-slot"><span class="ranking-pos-num">${idx + 1}</span></span>`;
        };

        if (modoEspecifico === 'diario') {
            const hoy = new Date();
            const fechaHoy = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
            const fechaVisual = String(hoy.getDate()).padStart(2, '0') + '/' + String(hoy.getMonth() + 1).padStart(2, '0');
            const juegoClave = 'diario_' + fechaHoy;

            const { data: rankingRaw, error } = await supabaseClient
                .from('ranking')
                .select('nombre, puntaje')
                .eq('juego', juegoClave)
                .order('puntaje', { ascending: false })
                .limit(500);

            if (error) throw error;

            const mejorPorJugador = {};
            (rankingRaw || []).forEach(row => {
                const n = (row.nombre || 'Anónimo').trim();
                const p = row.puntaje || 0;
                if (esRegistroBot(n, p)) return;
                const clave = n.toLowerCase();
                if (!mejorPorJugador[clave] || p > mejorPorJugador[clave].puntaje) {
                    mejorPorJugador[clave] = { nombre: n, puntaje: p };
                }
            });

            const todosOrdenados = Object.values(mejorPorJugador).sort((a, b) => b.puntaje - a.puntaje);
            const ranking = todosOrdenados.slice(0, 50); // ⚡ TOP 50

            const miPuestoIdx = todosOrdenados.findIndex(f => (f.nombre || '').toLowerCase() === miNombre.toLowerCase());
            const miFila = miPuestoIdx !== -1 ? todosOrdenados[miPuestoIdx] : null;
            const miPuntosHoy = miFila ? `${miFila.puntaje.toLocaleString('es-AR')} pts` : 'Sin jugar';
            const miPuesto = miPuestoIdx !== -1 ? `#${miPuestoIdx + 1}` : 'Sin clasif.';

           headerConfig = {
                img: 'fuego.webp',
                glowClass: 'glow-orange',
                badgeImg: 'fuego.webp',
                badgeTitle: 'Top 50 Global',
                badgeSub: `Diario (${fechaVisual})`,
                badgeColor: '#ff9100',
                pill1Label: 'TU PUNTAJE HOY',
                pill1Val: miPuntosHoy,
                pill1Icon: 'ph-target',
                pill2Label: 'TU PUESTO',
                pill2Val: miPuesto,
                pill2Icon: 'ph-trophy',
                pill3Label: 'PREMIO',
                pill3Val: '<b class="pill-val-desktop">Cofre de XP al #1 👑</b><b class="pill-val-mobile">Al #1 👑</b>',
                pill3Icon: 'ph-crown'
            };

            htmlContenido += `
            <div class="ranking-reward-notice diario">
                <i class="ph-fill ph-crown"></i>
                <span><b>Botín de Conquistador:</b> El puesto #1 de hoy a las 23:59 se lleva un <b>Cofre de XP</b>.</span>
            </div>`;

            htmlContenido += `<div class="liga-table-card"><div class="ranking-rows-scroll">`;
            if (!ranking || !ranking.length) {
                htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Aún nadie registró puntaje en el reto de hoy. ¡Sé el primero!</p>`;
            } else {
                ranking.forEach((f, i) => {
                    const med = renderRankSlot(i);
                    const nombreJugador = (f.nombre || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} <span class="ranking-user-name">${sanitizarHTML(nombreJugador)}</span>
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                            ${f.puntaje || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                        </span>
                    </div>`;
                });
            }
            htmlContenido += '</div>';

            // 📌 FILA ANCLADA (STICKY) SI ESTÁS FUERA DEL TOP 50
            if (miPuestoIdx >= 50 && miFila) {
                htmlContenido += `
                <div class="liga-row-item sticky-user-row es-propio">
                    <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombre.replace(/'/g, "\\'")}')" title="Tu posición">
                        ${renderRankSlot(0, true, miPuestoIdx + 1)} ${obtenerAvatarCirculoHTML(miNombre)} <span class="ranking-user-name"><b>${sanitizarHTML(miNombre)} (Vos)</b></span>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                        ${miFila.puntaje || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                    </span>
                </div>`;
            }

            htmlContenido += '</div>';

        } else if (modoEspecifico === 'solo') {
            const { data: rankingRaw, error } = await supabaseClient
                .from('ranking')
                .select('nombre, puntaje')
                .eq('juego', 'guessr')
                .order('puntaje', { ascending: false })
                .limit(500);
            if (error) throw error;

            const mejorPorJugador = {};
            (rankingRaw || []).forEach(row => {
                const n = (row.nombre || 'Anónimo').trim();
                const p = row.puntaje || 0;
                if (esRegistroBot(n, p)) return;
                const clave = n.toLowerCase();
                if (!mejorPorJugador[clave] || p > mejorPorJugador[clave].puntaje) {
                    mejorPorJugador[clave] = { nombre: n, puntaje: p };
                }
            });

            const todosOrdenados = Object.values(mejorPorJugador).sort((a, b) => b.puntaje - a.puntaje);
            const ranking = todosOrdenados.slice(0, 50); // ⚡ TOP 50

            const miApodo = (miNombre || '').trim().toLowerCase();
            const miPuestoIdx = todosOrdenados.findIndex(f => (f.nombre || '').trim().toLowerCase() === miApodo);
            const miFila = miPuestoIdx !== -1 ? todosOrdenados[miPuestoIdx] : null;

            // 🎯 Récord personal exclusivo del usuario (de su propia fila en el ranking o de su sesión local)
            let recordReal = miFila ? (miFila.puntaje || 0) : 0;
            if (userStats.maxScore && userStats.maxScore <= 25000 && userStats.maxScore > recordReal) {
                recordReal = userStats.maxScore;
            }

            const textoRecord = recordReal > 0 ? `${recordReal.toLocaleString('es-AR')} pts` : 'Sin récord';

            headerConfig = {
                img: 'liga-trofeo-header.webp',
                glowClass: 'glow-green',
                badgeImg: 'ranking-icon-solo.webp',
                badgeTitle: 'Top 50 Global',
                badgeSub: 'Individual',
                badgeColor: '#00ff77',
                pill1Label: 'TU MEJOR PARTIDA',
                pill1Val: textoRecord,
                pill1Icon: 'ph-trophy',
                pill2Label: 'TU RANGO',
                pill2Val: NIVELES[calcularNivelIdx(userStats.xpTotal)].nombre.replace(/\s+Lvl\s+\d+/i, ''),
                pill2Icon: 'ph-shield-star',
                pill3Label: 'PARTIDAS',
                pill3Val: `${userStats.partidasJugadas || 0} Jugadas`,
                pill3Icon: 'ph-game-controller'
            };

            htmlContenido += `<div class="liga-table-card"><div class="ranking-rows-scroll">`;
            if (!ranking || !ranking.length) {
                htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Aún no hay registros solitarios.</p>`;
            } else {
                ranking.forEach((f, i) => {
                    const med = renderRankSlot(i);
                    const nombreJugador = (f.nombre || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} <span class="ranking-user-name">${sanitizarHTML(nombreJugador)}</span>
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                            ${f.puntaje || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                        </span>
                    </div>`;
                });
            }
            htmlContenido += '</div>';

            // 📌 FILA ANCLADA (STICKY) SI ESTÁS FUERA DEL TOP 50
            if (miPuestoIdx >= 50 && recordReal > 0) {
                htmlContenido += `
                <div class="liga-row-item sticky-user-row es-propio">
                    <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombre.replace(/'/g, "\\'")}')" title="Tu posición">
                        ${renderRankSlot(0, true, miPuestoIdx + 1)} ${obtenerAvatarCirculoHTML(miNombre)} <span class="ranking-user-name"><b>${sanitizarHTML(miNombre)} (Vos)</b></span>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                        ${recordReal.toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                    </span>
                </div>`;
            }

            htmlContenido += '</div>';

        } else if (modoEspecifico === 'v_historico') {
            const { data: rankingRaw, error } = await supabaseClient.rpc('obtener_ranking_versus_global', { p_tipo: 'historico' });
            if (error) throw error;

            const rankingCompleto = (rankingRaw || []).filter(f => !esRegistroBot(f.nombre_jugador, f.victorias_acumuladas));
            const ranking = rankingCompleto.slice(0, 50); // ⚡ TOP 50
            const miPuestoIdx = rankingCompleto.findIndex(f => (f.nombre_jugador || '').trim().toLowerCase() === miNombre.toLowerCase());

            // 🎯 Sincronización: si estás en el ranking, toma las victorias oficiales de la nube
            const victoriasReales = miPuestoIdx !== -1 
                ? Number(rankingCompleto[miPuestoIdx].victorias_acumuladas) 
                : (userStats.partidasGanadas || 0);

            // Ajustamos las jugadas para que el ratio nunca supere el 100%
            const jugadasReales = Math.max(victoriasReales, userStats.partidasJugadas || 0);
            const ratioReal = jugadasReales > 0 ? Math.round((victoriasReales / jugadasReales) * 100) : 0;

            headerConfig = {
                img: 'ranking-icon-1v1.webp',
                glowClass: 'glow-blue',
                badgeImg: 'ranking-icon-1v1.webp',
                badgeTitle: 'Top 50 Global',
                badgeSub: '1 vs 1 Histórico',
                badgeColor: '#2979ff',
                pill1Label: 'VICTORIAS',
                pill1Val: `${victoriasReales} PG`,
                pill1Icon: 'ph-sword',
                pill2Label: 'RATIO 1V1',
                pill2Val: `${ratioReal}% W/L`,
                pill2Icon: 'ph-chart-line-up',
                pill3Label: 'DUELOS',
                pill3Val: `${jugadasReales} Jugados`,
                pill3Icon: 'ph-users-three'
            };

            htmlContenido += `<div class="liga-table-card"><div class="ranking-rows-scroll">`;
            if (!ranking || !ranking.length) {
                htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Sin partidos registrados en este período.</p>`;
            } else {
                ranking.forEach((f, i) => {
                    const med = renderRankSlot(i);
                    const nombreJugador = (f.nombre_jugador || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} <span class="ranking-user-name">${sanitizarHTML(nombreJugador)}</span>
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                            ${f.victorias_acumuladas || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">G</span>
                        </span>
                    </div>`;
                });
            }
            htmlContenido += '</div>';

            // 📌 FILA ANCLADA (STICKY) SI ESTÁS FUERA DEL TOP 50
            if (miPuestoIdx >= 50 && (userStats.partidasGanadas || 0) > 0) {
                const misWins = rankingCompleto[miPuestoIdx]?.victorias_acumuladas || userStats.partidasGanadas || 0;
                htmlContenido += `
                <div class="liga-row-item sticky-user-row es-propio">
                    <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombre.replace(/'/g, "\\'")}')" title="Tu posición">
                        ${renderRankSlot(0, true, miPuestoIdx + 1)} ${obtenerAvatarCirculoHTML(miNombre)} <span class="ranking-user-name"><b>${sanitizarHTML(miNombre)} (Vos)</b></span>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                        ${misWins} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">G</span>
                    </span>
                </div>`;
            }

            htmlContenido += '</div>';

        } else if (modoEspecifico === 'v_semanal') {
            const { data: rankingRaw, error } = await supabaseClient.rpc('obtener_ranking_versus_global', { p_tipo: 'semanal' });
            if (error) throw error;

            const rankingCompleto = (rankingRaw || []).filter(f => !esRegistroBot(f.nombre_jugador, f.victorias_acumuladas));
            const ranking = rankingCompleto.slice(0, 50); // ⚡ TOP 50
            const miIdx = rankingCompleto.findIndex(f => (f.nombre_jugador || '').trim().toLowerCase() === miNombre.toLowerCase());
            const miPuestoSemanal = miIdx !== -1 ? `#${miIdx + 1}` : 'Sin clasif.';

            const diaSemana = new Date().getDay();
            const diasParaCierre = diaSemana === 0 ? 0 : 7 - diaSemana;
            const textoCierre = diasParaCierre === 0 ? 'Hoy 23:59' : `Domingo (${diasParaCierre}d)`;

            headerConfig = {
                img: 'ranking-icon-semanal.webp',
                glowClass: 'glow-gold',
                badgeImg: 'ranking-icon-semanal.webp',
                badgeTitle: 'Top 50 Semanal',
                badgeSub: 'Temporada Activa',
                badgeColor: '#eab308',
                pill1Label: 'PREMIOS PODIO',
                pill1Val: 'Cofres de XP',
                pill1Icon: 'ph-gift',
                pill2Label: 'TU PUESTO',
                pill2Val: miPuestoSemanal,
                pill2Icon: 'ph-hash',
                pill3Label: 'CIERRE',
                pill3Val: textoCierre,
                pill3Icon: 'ph-clock-countdown'
            };

            htmlContenido += `
            <div class="ranking-reward-notice semanal">
                <i class="ph-fill ph-trophy"></i>
                <span><b>Premios de Temporada:</b> Los 3 primeros al finalizar el domingo ganan <b>Cofres de XP</b>.</span>
            </div>`;

            htmlContenido += `<div class="liga-table-card"><div class="ranking-rows-scroll">`;
            if (!ranking || !ranking.length) {
                htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Sin partidos registrados en este período.</p>`;
            } else {
                ranking.forEach((f, i) => {
                    const med = renderRankSlot(i);
                    const nombreJugador = (f.nombre_jugador || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} <span class="ranking-user-name">${sanitizarHTML(nombreJugador)}</span>
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                            ${f.victorias_acumuladas || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">G</span>
                        </span>
                    </div>`;
                });
            }
            htmlContenido += '</div>';

            // 📌 FILA ANCLADA (STICKY) SI ESTÁS FUERA DEL TOP 50
            if (miIdx >= 50) {
                const misWinsSemana = rankingCompleto[miIdx]?.victorias_acumuladas || 0;
                htmlContenido += `
                <div class="liga-row-item sticky-user-row es-propio">
                    <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombre.replace(/'/g, "\\'")}')" title="Tu posición">
                        ${renderRankSlot(0, true, miIdx + 1)} ${obtenerAvatarCirculoHTML(miNombre)} <span class="ranking-user-name"><b>${sanitizarHTML(miNombre)} (Vos)</b></span>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem; flex-shrink:0; margin-left:8px; white-space:nowrap;">
                        ${misWinsSemana} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">G</span>
                    </span>
                </div>`;
            }

            htmlContenido += '</div>';
        }

        body.innerHTML = `
        <div class="ranking-split-grid">
            <div class="ranking-left-panel">
                <div class="ranking-brand-box">
                    <div class="trophy-stage-wrapper">
                        <div class="trophy-glow-backdrop ${headerConfig.glowClass}"></div>
                        <div class="trophy-main-img-box">
                            <img src="${headerConfig.img}" alt="Ícono Modo" class="trophy-main-img">
                        </div>
                    </div>
                    <h2 class="liga-modal-title">Salón de la Fama</h2>
                </div>

                <div class="modal-header-right-pills ranking-pills-column">
                    <div class="header-stat-pill">
                        <i class="ph-bold ${headerConfig.pill1Icon}" style="color: ${headerConfig.badgeColor};"></i>
                        <div class="stat-pill-info">
                            <span>${headerConfig.pill1Label}</span>
                            <strong>${headerConfig.pill1Val}</strong>
                        </div>
                    </div>
                    <div class="header-stat-pill">
                        <i class="ph-bold ${headerConfig.pill2Icon}" style="color: ${headerConfig.badgeColor};"></i>
                        <div class="stat-pill-info">
                            <span>${headerConfig.pill2Label}</span>
                            <strong>${headerConfig.pill2Val}</strong>
                        </div>
                    </div>
                    <div class="header-stat-pill">
                        <i class="ph-bold ${headerConfig.pill3Icon}" style="color: ${headerConfig.badgeColor};"></i>
                        <div class="stat-pill-info">
                            <span>${headerConfig.pill3Label}</span>
                            <strong>${headerConfig.pill3Val}</strong>
                        </div>
                    </div>
                </div>

                <div class="ranking-sidebar-menu">
                    ${subMenuHTML}
                </div>
            </div>

            <div class="ranking-right-panel">
                <div class="ranking-table-top-bar">
                    <div class="ranking-active-badge" style="--badge-color:${headerConfig.badgeColor};">
                        <span class="badge-dot-live" style="background:${headerConfig.badgeColor}; box-shadow:0 0 10px ${headerConfig.badgeColor};"></span>
                        <img src="${headerConfig.badgeImg}" alt="Ícono" class="badge-title-png-icon">
                        <span class="badge-title-text">${headerConfig.badgeTitle}</span>
                        <span class="badge-sep">·</span>
                        <span class="badge-sub-pill" style="color:${headerConfig.badgeColor};">${headerConfig.badgeSub}</span>
                    </div>

                    <!-- 🔍 BUSCADOR EN VIVO DE JUGADORES -->
                    <div class="ranking-search-box">
                        <i class="ph-bold ph-magnifying-glass"></i>
                        <input type="text" class="ranking-search-input" placeholder="Buscar jugador..." oninput="filtrarJugadoresRanking(this.value)">
                    </div>
                </div>
                ${htmlContenido}
            </div>
        </div>`;

    } catch (e) {
        console.error("Error al leer ranking global:", e);
        body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger-color);"><i class="ph-duotone ph-warning-circle" style="font-size:3rem;"></i><br><br><b>Error de conexión con la base de datos</b></div>`;
    }
}

// --- Ayudantes de UI y Abandono ---

function actualizarDotsProgreso(){
    const c=document.getElementById('rounds-progress');
    if(!c)return;
    let html='';
    for(let i=1;i<=5;i++){
        let cls='round-dot';
        if(i<guessrRondaActual)cls+=' done';
        else if(i===guessrRondaActual)cls+=' current';
        html+=`<div class="${cls}"></div>`;
    }
    c.innerHTML=html;
}

async function manejarAbandonoRival() {
    // 🛡️ ESCUDO ANTI-DUPLICADOS: Si la partida terminó sus 5 rondas, jamás se procesa como abandono
    const partidaYaFinalizada = guessrRondaActual > 5 || (guessrRondaActual === 5 && resultadosRondaMostrados);
    if (!versusPartidaEnCurso || partidaYaFinalizada) return;
    versusPartidaEnCurso = false; // Cerramos la puerta al instante

    if (versusTimerInterval) clearInterval(versusTimerInterval);
    if (handshakeInterval) clearInterval(handshakeInterval);
    
    showToast("🏆 ¡Victoria por abandono! Tu oponente se retiró de la cancha.", "ph-trophy", "success");
    
    const id = getUserId();
    const nombreLocal = getPref('ev_custom_nick', '') || obtenerUsuarioLogueado()?.name || 'Jugador';
    
    // 🏅 COMPUTACIÓN REGLAMENTARIA: Sumamos victoria al perfil local, XP y +2 SP
    userStats.partidasGanadas = (userStats.partidasGanadas || 0) + 1;
    userStats.partidasJugadas = (userStats.partidasJugadas || 0) + 1;
    userStats.puntosHabilidad = (userStats.puntosHabilidad || 0) + 2;
    localStorage.setItem('ev_primera_partida_finalizada_' + id, 'true');
    localStorage.setItem('ev_primera_partida_finalizada_global', 'true');
    guardarStats();
    agregarXP(1000); 
    
    // Impactamos el triunfo en la base de datos remota de Supabase
        try {
            if (supabaseClient) {
                const idFinal = (id && id !== 'guest') ? id : obtenerIdRedVersus();
                await supabaseClient.from('victorias_versus').insert([{ id_usuario: idFinal, nombre: nombreLocal, liga: versusLigaOrigen }]);
                console.log("[1v1] Victoria por abandono asentada en la nube de Supabase.");
            }
            
            // 🛡️ CASTIGO AL RIVAL: Si estábamos en una liga, el que se queda le anota la derrota al que huyó
            if (supabaseClient && versusLigaOrigen) {
                const nombreHuidor = (versusRivalNombre && versusRivalNombre !== "RIVAL") ? versusRivalNombre : "Anónimo";
                await supabaseClient.from('derrotas_versus').insert([{ id_usuario: 'abandono_tec', nombre: nombreHuidor, liga: versusLigaOrigen }]);
                console.log("[1v1] Derrota técnica (L) anotada al rival que huyó.");
            }
        } catch(err) {
            console.error("Error al registrar resultado por abandono en la nube:", err);
        }

        // Desarmamos la interfaz del mapa y le clavamos la pantalla de victoria inmediata en el modal
    const container = document.getElementById('modal-video-container');
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('modal-card').classList.remove('stadium-guessr-layout', 'resultado-final', 'resultado-final-layout');
    document.getElementById('modal-card').classList.add('resultado-final', 'resultado-final-layout');
    document.getElementById('modal-card').classList.add('resultado-final');
    document.getElementById('modal-card').classList.add('resultado-final-layout');
    if (guessrMapInstance) {
        try { guessrMapInstance.remove(); } catch (e) {}
        guessrMapInstance = null;
    }

    const botonFinal = versusLigaOrigen
        ? `<button onclick="cerrarModalVideo(); abrirModalLigaAmigosPrivada();" class="btn-3d btn-endgame-save" style="padding:13px 24px;max-width:100%;width:100%;"><i class="ph-fill ph-users-three"></i> Volver a mi Liga</button>`
        : `<button onclick="cerrarModalVideo(); abrirModalRanking('v_historico');" class="btn-3d btn-endgame-rank" style="padding:13px 24px;max-width:100%;width:100%;"><img src="medalla-oro.webp" alt="Ranking" style="width:24px;height:24px;object-fit:contain;"> Ver Tabla de Posiciones</button>`;
    container.innerHTML = `
    <div style="text-align:center;padding:36px 22px;color:var(--text-main);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100%;box-sizing:border-box;background: radial-gradient(circle at 50% -15%, rgba(0, 230, 118, 0.20) 0%, transparent 65%), radial-gradient(circle at 50% 105%, rgba(41, 121, 255, 0.10) 0%, transparent 55%), linear-gradient(180deg, #0c1520 0%, #060a10 100%);">
        <div style="width: 125px; height: 125px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center;">
            <img src="liga-trofeo-header.webp" alt="Trofeo" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 18px rgba(0, 230, 118, 0.9)) drop-shadow(0 0 35px rgba(0, 230, 118, 0.45)); animation: rayoGlow 2.5s infinite alternate ease-in-out;">
        </div>
        <h2 style="font-size:1.85rem;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#00e676;text-shadow:0 0 18px rgba(0,230,118,0.55);letter-spacing:-0.5px;">¡VICTORIA POR ABANDONO!</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;font-size:.95rem;max-width:340px;line-height:1.5;">Tu oponente abandonó la sesión o se quedó sin datos.</p>
        ${botonFinal}
    </div>`;
    
    setTimeout(() => lanzarConfetti(document.getElementById('modal-card')), 250);
    versusLigaOrigen = null;
    esModoVersus = false;
    versusPartidaEnCurso = false;
}

window.toggleGuessrHintBalloon = function(event) {
    if (event) event.stopPropagation();
    const balloon = document.getElementById('guessr-hint-balloon');
    if (balloon) balloon.classList.toggle('active');
};

// --- Invitaciones de Ligas y Enlaces ---

// 📨 ENVÍA LA INVITACIÓN DIRECTA AL PERFIL DEL USUARIO DESCONOCIDO
window.enviarInvitacionDirectaRival = async function(nombreLiga, nombreRival, btn) {
    if (!supabaseClient) return;
    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Jugador')).trim();

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-bold ph-circle-notch animate-spin"></i> Enviando invitación...`;
    }

    try {
        // Verificar si ya le enviaste una invitación que aún no respondió
        const { data: previas } = await supabaseClient
            .from('invitaciones_liga')
            .select('id')
            .eq('liga', nombreLiga)
            .ilike('para_nombre', nombreRival.trim())
            .eq('estado', 'pendiente')
            .limit(1);

        if (previas && previas.length > 0) {
            showToast(`Ya le enviaste una invitación pendiente a ${nombreRival} ⏳`, 'ph-hourglass', 'warning');
            if (btn) btn.innerHTML = `<i class="ph-bold ph-check"></i> Invitación pendiente`;
            return;
        }

        const { error } = await supabaseClient
            .from('invitaciones_liga')
            .insert([{
                de_nombre: miNombre,
                para_nombre: nombreRival.trim(),
                liga: nombreLiga,
                estado: 'pendiente'
            }]);

        if (error) throw error;

        showToast(`¡Invitación enviada a ${nombreRival}! Le aparecerá en su pantalla 🚀`, 'ph-paper-plane-tilt', 'success');
        if (btn) {
            btn.innerHTML = `<i class="ph-bold ph-check"></i> ¡Invitación enviada!`;
            btn.style.opacity = '0.7';
        }
    } catch (err) {
        console.error("Error al enviar invitación:", err);
        showToast("Error al enviar la invitación.", "ph-warning-circle", "danger");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="ph-bold ph-paper-plane-tilt"></i> Reintentar invitación`;
        }
    }
};

// 🔔 COMPRUEBA SI TENÉS INVITACIONES PENDIENTES DE OTROS JUGADORES
async function verificarInvitacionesLigaPendientes() {
    if (!supabaseClient) return;
    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : '')).trim();
    if (!miNombre || miNombre === 'Jugador' || miNombre === 'Invitado') return;

    // Si ya pertenecés a una liga, no mostramos invitaciones nuevas para no pisarte la actual
    if (localStorage.getItem('ev_codigo_liga_amigos')) return;

    try {
        const { data: invs, error } = await supabaseClient
            .from('invitaciones_liga')
            .select('id, de_nombre, liga')
            .ilike('para_nombre', miNombre)
            .eq('estado', 'pendiente')
            .order('created_at', { ascending: false })
            .limit(1);

        if (!error && invs && invs.length > 0) {
            mostrarPopupInvitacionLiga(invs[0]);
        }
    } catch (e) {}
}

function mostrarPopupInvitacionLiga(inv) {
    const existente = document.getElementById('invitacion-liga-popup');
    if (existente) existente.remove();

    const popup = document.createElement('div');
    popup.id = 'invitacion-liga-popup';
    popup.style.cssText = `
        position: fixed; top: 24px; left: 0; right: 0; margin: 0 auto; width: max-content; max-width: 92%;
        background: var(--glass-bg); border: 2px solid var(--accent-color); padding: 18px 22px; border-radius: 16px;
        z-index: 100060; display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center;
        box-shadow: var(--shadow-strong); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        animation: fadeSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    `;

    const nombreVisual = inv.liga.replace(/_/g, ' ');

    popup.innerHTML = `
        <div style="font-weight:900; font-size:0.95rem; color:var(--text-main);">
            <i class="ph-duotone ph-envelope-open" style="color:var(--accent-color); font-size:1.3rem; vertical-align:middle;"></i> 
            ¡<b>${sanitizarHTML(inv.de_nombre)}</b> te invitó a sumarte a su liga <b>${sanitizarHTML(nombreVisual)}</b>!
        </div>
        <div style="display:flex; gap:10px; width:100%;">
            <button onclick="responderInvitacionLiga(${inv.id}, '${inv.liga}', true)" class="btn-3d primary" style="flex:1; padding:12px;"><i class="ph-bold ph-check"></i> Unirme</button>
            <button onclick="responderInvitacionLiga(${inv.id}, '${inv.liga}', false)" class="btn-3d secondary" style="flex:1; padding:12px;"><i class="ph-bold ph-x"></i> Rechazar</button>
        </div>
    `;
    document.body.appendChild(popup);
}

window.responderInvitacionLiga = async function(idInv, nombreLiga, aceptar) {
    const popup = document.getElementById('invitacion-liga-popup');
    if (popup) popup.remove();

    if (supabaseClient && idInv) {
        try {
            await supabaseClient
                .from('invitaciones_liga')
                .update({ estado: aceptar ? 'aceptada' : 'rechazada' })
                .eq('id', idInv);
        } catch (e) {}
    }

    if (aceptar) {
        await unirseALigaPorLink(nombreLiga);
    } else {
        showToast("Invitación rechazada.", "ph-x-circle", "info");
    }
};

// 🔗 GENERADOR Y COMPARTIDOR DE ENLACE DE LIGA
window.compartirLinkLiga = async function(nombreLiga, rivalNombre = null) {
    if (!nombreLiga) return;
    const urlLimpia = window.location.origin + window.location.pathname;
    const link = `${urlLimpia}?liga=${encodeURIComponent(nombreLiga)}`;
    const nombreVisual = nombreLiga.replace(/_/g, ' ');

    const msg = rivalNombre 
        ? `⚽ ¡Hola ${rivalNombre}! Te invito a unirte a mi liga "${nombreVisual}" en Estadios Virtuales 🌍🏆\nEntrá a este link para sumarte:\n\n${link}`
        : `⚽ ¡Sumate a mi liga "${nombreVisual}" en Estadios Virtuales! 🌍🏆\nEntrá a este link para competir contra nosotros:\n\n${link}`;

    const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (esMobile && navigator.share) {
        try {
            await navigator.share({
                title: `Liga ${nombreVisual} | Estadios Virtuales`,
                text: msg
            });
            showToast('¡Invitación enviada! 🚀', 'ph-check-circle', 'success');
            return;
        } catch(e) {}
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).then(() => {
            showToast(`¡Link de ${nombreVisual} copiado! Pegalo en WhatsApp 📲`, 'ph-check-circle', 'success');
        }).catch(() => {
            showToast('Error al copiar el enlace.', 'ph-warning-circle', 'danger');
        });
    }
};

// 🚀 UNIÓN AUTOMÁTICA CUANDO UN USUARIO ABRE UN LINK CON ?liga=
async function unirseALigaPorLink(nombreLigaRaw) {
    if (!nombreLigaRaw) return;
    let nombreLiga = decodeURIComponent(nombreLigaRaw).trim().toUpperCase().replace(/\s+/g, '_');

    window.history.replaceState({}, document.title, window.location.pathname);

    let intentos = 0;
    while (!supabaseClient && intentos < 25) {
        await new Promise(r => setTimeout(r, 150));
        intentos++;
    }

    if (!supabaseClient) {
        showToast("Error de conexión al ingresar a la liga.", "ph-warning-circle", "danger");
        return;
    }

    const u = obtenerUsuarioLogueado();
    let miNick = getPref('ev_custom_nick', '');

    if (!miNick && (!u || u.id === 'guest')) {
        let nuevoNick = prompt(`🏆 ¡Te invitaron a la liga "${nombreLiga.replace(/_/g, ' ')}"! Ingresá tu apodo:`);
        if (nuevoNick === null) return;
        nuevoNick = nuevoNick.trim() || ("Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase());
        if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);

        let disponible = await verificarApodoDisponible(nuevoNick);
        while (!disponible) {
            showToast(`El apodo "${nuevoNick}" ya está en uso 🚫`, 'ph-warning-circle', 'danger');
            nuevoNick = prompt(`⚠️ El apodo "${nuevoNick}" ya pertenece a otro jugador. Ingresá uno diferente:`);
            if (nuevoNick === null) return;
            nuevoNick = nuevoNick.trim() || ("Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase());
            if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);
            disponible = await verificarApodoDisponible(nuevoNick);
        }
        setPref('ev_custom_nick', nuevoNick);
        miNick = nuevoNick;
        renderizarBotonLogin();
    }

    try {
        const { data, error } = await supabaseClient
            .from('ligas')
            .select('nombre_liga')
            .eq('nombre_liga', nombreLiga)
            .limit(1);

        if (error || !data || data.length === 0) {
            showToast("La liga del enlace no existe o fue dada de baja. 🚫", "ph-warning-circle", "danger");
            return;
        }

        localStorage.setItem('ev_codigo_liga_amigos', nombreLiga);

        const nombreParaFichar = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');
        const emailParaFichar = u ? u.email : '';

        const { data: existente } = await supabaseClient
            .from('ranking')
            .select('nombre')
            .eq('juego', 'duelo_' + nombreLiga)
            .eq('nombre', nombreParaFichar)
            .limit(1);

        if (!existente || existente.length === 0) {
            await supabaseClient
                .from('ranking')
                .insert([
                    { nombre: nombreParaFichar, puntaje: 0, email: emailParaFichar, juego: 'duelo_' + nombreLiga }
                ]);
        }

        guardarStats();
        showToast(`¡Te uniste a la liga: ${nombreLiga.replace(/_/g, ' ')}! 👥🔥`, "ph-users-three", "success");
        abrirModalLigaAmigosPrivada();
    } catch(err) {
        console.error("Error al unirse por link de liga:", err);
    }
}

// --- Reacciones, Folklore y Mini Ligas Privadas ---

// Si un jugador cierra la pestaña o el navegador de prepo, gatilla el abandono al rival activo antes de destruir el socket
// Si un jugador cierra la pestaña o el navegador de prepo, gatilla el abandono al rival activo antes de destruir el socket
window.addEventListener('beforeunload', () => {
    if (esModoVersus) {
        if (versusChannel) {
            versusChannel.send({
                type: 'broadcast',
                event: 'rival_abandono',
                payload: {}
            });
            // 🛡️ CIERRE REGLEMENTARIO INSTANTÁNEO
            supabaseClient.removeChannel(versusChannel);
        }

        // 👇 ESCUDO ANTI-ZOMBIES: Si cierra la pestaña del navegador mientras está buscando rival
        if (versusPartidaId && !versusPartidaEnCurso && !versusPartidaId.startsWith('PRIV_')) {
            supabaseClient.from('partidas').update({ estado: 'cancelada' }).eq('id', versusPartidaId).then();
        }
    }
});

// ========================================================
// ESCUDO ANTI-ABANDONO Y AUTO-RECONEXIÓN MÓVIL (VISIBILITY API)
// ========================================================
// (timerAbandono declarado arriba)

document.addEventListener("visibilitychange", () => {
    // 🔄 CASO 1: VUELTA AL NAVEGADOR (Pestaña visible de nuevo)
    if (!document.hidden) {
        if (timerAbandono) {
            console.log("[1v1] ✅ Jugador volvió a la pestaña a tiempo.");
            clearTimeout(timerAbandono);
            timerAbandono = null;
        }

        // Si estábamos en el lobby esperando rival y el WebSocket se durmió al salir a WhatsApp
        if (esModoVersus && !versusPartidaEnCurso && versusPartidaId) {
            console.log("[1v1] 🔄 Despertando y restableciendo conexión WebSocket...");
            if (versusChannel) {
                try { supabaseClient.removeChannel(versusChannel); } catch(e) {}
                versusChannel = null;
            }
            conectarRealtimeVersus();
        }
        return;
    }

    // ⏸️ CASO 2: PESTAÑA MINIMIZADA / EN SEGUNDO PLANO
    if (document.hidden && esModoVersus && !esModoBot && versusPartidaEnCurso && versusChannel) {
        console.warn("[1v1] ⚠️ Jugador minimizó la app durante un partido en curso. Iniciando cuenta regresiva de abandono...");
        timerAbandono = setTimeout(() => {
            if (document.hidden) {
                console.log("[1v1] 🚨 Tiempo agotado. Disparando abandono técnico.");
                try {
                    versusChannel.send({ type: 'broadcast', event: 'rival_abandono', payload: {} });
                    supabaseClient.removeChannel(versusChannel);
                } catch(e) {}
                
                esModoVersus = false;
                versusPartidaEnCurso = false;
                cerrarModalVideo();
                showToast("Desconectado por inactividad prolongada ❌", "ph-x-circle", "danger");
            }
        }, 60000);
    }
});
// ========================================================
// SPRINT VIRAL - PASO 1: SISTEMA DE TAUNTS REALTIME
// ========================================================
function mandarTaunt(emoji) {
    // Si no estamos en un versus real o el canal no está listo, solo lo mostramos local
    if (!esModoVersus || esModoBot || !versusChannel) {
        mostrarTauntEnPantalla(emoji, true);
        return;
    }
    
    // Emitimos el emoji a la pantalla del rival
    versusChannel.send({
        type: 'broadcast',
        event: 'rival_taunt',
        payload: { emoji: emoji }
    });
    
    // Lo pintamos en nuestra pantalla como confirmación
    mostrarTauntEnPantalla(emoji, true);
}

function mostrarTauntEnPantalla(emoji, esMio) {
    const sb = document.getElementById('versus-live-scoreboard');
    const col = esMio ? document.querySelector('.vs-sb-col.user') : document.querySelector('.vs-sb-col.rival');
    const fallbackParent = document.getElementById('modal-card');
    
    // Eliminamos burbujas viejas si el usuario spamea
    const viejas = document.querySelectorAll('.taunt-arcade-burst, .taunt-bubble');
    viejas.forEach(b => b.remove());
    
    const burbuja = document.createElement('div');
    burbuja.className = `taunt-arcade-burst ${esMio ? 'es-mio' : 'es-rival'}`;
    burbuja.innerHTML = `<span class="taunt-emoji">${emoji}</span>`;
    
    if (col && sb && sb.style.display !== 'none') {
        col.classList.remove('taunt-target-shake');
        void col.offsetWidth; // forzar reflujo de animación
        col.classList.add('taunt-target-shake');
        col.appendChild(burbuja);
    } else if (fallbackParent) {
        burbuja.classList.add('taunt-fallback');
        fallbackParent.appendChild(burbuja);
    }
    
    // Limpieza automática
    setTimeout(() => {
        if (burbuja && burbuja.parentNode) burbuja.remove();
    }, 1850);
}
// ========================================================
// SPRINT VIRAL - PASO 2: MOTOR DE FRASES CON FOLKLORE
// ========================================================
function obtenerFraseFolklore(dist) {
    if (isNaN(dist)) return "¡Se cortó la transmisión de la tribuna! 📻";
    if (dist < 1)   return "¡Ojo de águila! La clavaste en el ángulo. 🎯⚽";
    if (dist < 15)  return "¡Hay olor a gol! La tribuna corea tu nombre. 🏟️🔥";
    if (dist < 150) return "Entraste al área con pelota dominada... Buen tiro. 👟";
    if (dist < 600) return "Te cobraron posición adelantada... ¡Te perdiste en la cancha! 🗺️";
    if (dist < 2000) return "¡La mandaste a la tribuna visitante! Le erraste feo, maestro. 🥶";
    return "¡Mandaste la pelota a la estratosfera! Te saliste del mapa. 🌍🤡";
}
function dispararJuicinessRonda(distancia) {
    const card = document.getElementById('modal-card') || document.querySelector('.guessr-modal-box');
    if (!card) return;
    if (card.classList.contains('resultado-final') || card.classList.contains('resultado-final-layout')) return;

    // Remover sello anterior si existía
    document.querySelectorAll('.stamp-badge').forEach(s => { try { s.remove(); } catch(e) {} });

    // Sello badge dinámico de folklore animado
    const stamp = document.createElement('div');
    stamp.className = 'stamp-badge animate-stamp';

    if (distancia < 25) {
        stamp.classList.add('stamp-perfecto');
        stamp.innerHTML = '🎯 ¡AL ÁNGULO!';
        if (typeof reproducirSonido === 'function') reproducirSonido('acierto');
        if (typeof confetti === 'function') {
            try { confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
        }
    } else if (distancia < 150) {
        stamp.classList.add('stamp-perfecto');
        stamp.innerHTML = '⚽ ¡AL TRAVESAÑO!';
        if (typeof reproducirSonido === 'function') reproducirSonido('acierto');
    } else if (distancia < 600) {
        stamp.classList.add('stamp-cerca');
        stamp.innerHTML = '💨 CERCA DEL PALO';
        if (typeof reproducirSonido === 'function') reproducirSonido('click');
    } else if (distancia < 2000) {
        stamp.classList.add('stamp-lejos');
        stamp.innerHTML = '🗺️ EN OTRA CIUDAD';
    } else {
        stamp.classList.add('stamp-lejos');
        stamp.innerHTML = '🛰️ A LA ESTRATÓSFERA';
        card.classList.add('animate-wrong');
        setTimeout(() => card.classList.remove('animate-wrong'), 450);
    }

    card.appendChild(stamp);
    const duracionStamp = (guessrRondaActual >= 5) ? 2000 : 2800;
    setTimeout(() => {
        try { if (stamp.parentNode) stamp.remove(); } catch (e) {}
    }, duracionStamp);
}

// ⏳ RELOJ CUENTA REGRESIVA ESTILO WORDLE PARA EL RETO DIARIO (REINICIO 00:00 HORA ARGENTINA)
function iniciarRelojRetoDiario() {
    function actualizar() {
        const el = document.getElementById('reto-timer-texto');
        if (!el) return;
        
        try {
            // Obtenemos la hora actual en zona horaria oficial de Argentina (UTC-3)
            const ahora = new Date();
            const partes = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Argentina/Buenos_Aires',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            }).formatToParts(ahora);

            let hora = 0, min = 0, seg = 0;
            partes.forEach(p => {
                if (p.type === 'hour') hora = parseInt(p.value, 10);
                if (p.type === 'minute') min = parseInt(p.value, 10);
                if (p.type === 'second') seg = parseInt(p.value, 10);
            });

            if (hora === 24) hora = 0;

            const totalSegundosHoy = hora * 3600 + min * 60 + seg;
            const segundosRestantes = Math.max(0, 86400 - totalSegundosHoy);

            if (segundosRestantes <= 0) {
                el.textContent = (window.innerWidth <= 1024) ? "¡NUEVO RETO!" : "¡Nuevo reto disponible!";
                return;
            }

            const horas = Math.floor(segundosRestantes / 3600);
            const minutos = Math.floor((segundosRestantes % 3600) / 60);
            const segundos = segundosRestantes % 60;
            const pad = (n) => String(n).padStart(2, '0');
            const tiempoStr = `${pad(horas)}h ${pad(minutos)}m ${pad(segundos)}s`;
            el.textContent = (window.innerWidth <= 1024) ? tiempoStr : `Próximo en: ${tiempoStr}`;
        } catch (e) {
            // Fallback horario local
            const ahora = new Date();
            const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 0);
            const diffMs = manana.getTime() - ahora.getTime();
            const horas = Math.floor(diffMs / 3600000);
            const minutos = Math.floor((diffMs % 3600000) / 60000);
            const segundos = Math.floor((diffMs % 60000) / 1000);
            const pad = (n) => String(n).padStart(2, '0');
            const tiempoStr = `${pad(horas)}h ${pad(minutos)}m ${pad(segundos)}s`;
            el.textContent = (window.innerWidth <= 1024) ? tiempoStr : `Próximo en: ${tiempoStr}`;
        }
    }
    actualizar();
    setInterval(actualizar, 1000);
}
window.iniciarRelojRetoDiario = iniciarRelojRetoDiario;
// ========================================================
// SPRINT VIRAL - PASO 5: SISTEMA DE MINI LIGAS PRIVADAS
// ========================================================
async function crearOCargarLigaAmigos(esCreacion) {

    const input = document.getElementById('input-codigo-liga');
    let nombreLiga = input ? input.value.trim().toUpperCase() : "";

    // Reemplazamos espacios por guiones bajos para estandarizar el registro en la base de datos
    nombreLiga = nombreLiga.replace(/\s+/g, '_');

    if (!nombreLiga || nombreLiga.length < 3) {
        showToast("¡El nombre debe tener al menos 3 caracteres! 👥", "ph-warning-circle", "danger");
        return;
    }

    // Filtro estricto: Solo permitimos letras, números y guiones bajos (Escudo Anti-Injection)
    const regexValida = /^[A-Z0-9_]+$/;
    if (!regexValida.test(nombreLiga)) {
        showToast("Usá solo letras, números o espacios. 🚫", "ph-warning-circle", "danger");
        return;
    }

    const idUsuario = getUserId();
    const u = obtenerUsuarioLogueado();

    // 🔒 Si es invitado y todavía no tiene apodo, se lo pedimos antes de ficharlo en la liga
    let miNickLiga = getPref('ev_custom_nick', '');
    if (!miNickLiga && (!u || u.id === 'guest')) {
        let nuevoNick = prompt("🏆 ¡Antes de ingresar a la liga! Elegí tu apodo de jugador:");
        if (nuevoNick === null) return;
        nuevoNick = nuevoNick.trim();
        if (!nuevoNick) nuevoNick = "Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase();
        if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);

        let disponible = await verificarApodoDisponible(nuevoNick);
        while (!disponible) {
            showToast(`El apodo "${nuevoNick}" ya está en uso 🚫`, 'ph-warning-circle', 'danger');
            nuevoNick = prompt(`⚠️ El apodo "${nuevoNick}" ya pertenece a otro jugador. Ingresá uno diferente:`);
            if (nuevoNick === null) return;
            nuevoNick = nuevoNick.trim();
            if (!nuevoNick) nuevoNick = "Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase();
            if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);
            disponible = await verificarApodoDisponible(nuevoNick);
        }

        setPref('ev_custom_nick', nuevoNick);
        miNickLiga = nuevoNick;
        renderizarBotonLogin();
    }

    if (esCreacion) {
        // 🛡️ MODO CREACIÓN CON SEGURIDAD TOTAL: Intentamos insertar directamente en la tabla de control
        try {
            const { error } = await supabaseClient
                .from('ligas')
                .insert([
                    { nombre_liga: nombreLiga, creador_id: idUsuario }
                ]);

            if (error) {
                // Si el error es por duplicado (código SQL 23505 o texto descriptivo)
                if (error.code === '23505' || error.message.includes('already exists')) {
                    showToast("Ese nombre de liga ya está registrado. ¡Elegí otro! 🚫", "ph-warning-circle", "danger");
                } else {
                    console.error("Error de Supabase:", error);
                    showToast("No se pudo crear la liga. Intentá de nuevo.", "ph-warning-circle", "danger");
                }
                return;
            }

            // ⚡ BLINDAJE 1: Limpieza inmediata de puntuaciones huérfanas del pasado
            // Al crearse la sala de forma exitosa en la línea anterior, barremos cualquier rastro viejo con este nombre
            await supabaseClient
                .from('ranking')
                .delete()
                .in('juego', ['guessr_' + nombreLiga, 'duelo_' + nombreLiga]);

            // Guardamos localmente y fundamos el torneo
            localStorage.setItem('ev_codigo_liga_amigos', nombreLiga);

            // 🎯 FICHAMOS AL CREADOR CON 0 PTS: Para que figure de inmediato como integrante activo
            try {
                const u = obtenerUsuarioLogueado();
                const nombreParaFichar = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');
                const emailParaFichar = u ? u.email : '';
                
                await supabaseClient
                    .from('ranking')
                    .insert([
                        { nombre: nombreParaFichar, puntaje: 0, email: emailParaFichar, juego: 'duelo_' + nombreLiga }
                    ]);
            } catch (e) { 
                console.error("Error al autofichar creador:", e); 
            }

            showToast(`¡Liga creada: ${nombreLiga.replace(/_/g, ' ')}! 👥🔥`, "ph-users-three", "success");

        } catch (err) {
            console.error("Error crítico en creación de liga:", err);
            showToast("Error de conexión.", "ph-warning-circle", "danger");
            return;
        }
    } else {
        // 🛡️ MODO UNIRME CON VALIDACIÓN DE EXISTENCIA: Verificamos si la liga realmente existe antes de entrar
        try {
            const { data, error } = await supabaseClient
                .from('ligas')
                .select('nombre_liga')
                .eq('nombre_liga', nombreLiga)
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                showToast("La liga no existe. Verificá el nombre exacto con tus amigos. 🚫", "ph-warning-circle", "danger");
                return;
            }

            // Si la liga existe en la tabla oficial, lo dejamos ingresar de forma segura
            localStorage.setItem('ev_codigo_liga_amigos', nombreLiga);

            // 🎯 FICHAMOS AL NUEVO INTEGRANTE CON 0 PTS: Solo si nunca antes jugó en esta liga específica
            try {
                const u = obtenerUsuarioLogueado();
                const nombreParaFichar = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');
                const emailParaFichar = u ? u.email : '';

                const { data: existente } = await supabaseClient
                    .from('ranking')
                    .select('nombre')
                    .eq('juego', 'duelo_' + nombreLiga)
                    .eq('nombre', nombreParaFichar)
                    .limit(1);

                // BLINDAJE 2: Se corrigió el typo de existing a existente. Ahora corre el insert sin crasheos.
                if (!existente || existente.length === 0) {
                    await supabaseClient
                        .from('ranking')
                        .insert([
                            { nombre: nombreParaFichar, puntaje: 0, email: emailParaFichar, juego: 'duelo_' + nombreLiga }
                        ]);
                }
            } catch (e) { 
                console.error("Error al autofichar nuevo miembro:", e); 
            }

            showToast(`¡Te uniste a la liga: ${nombreLiga.replace(/_/g, ' ')}! 👥🔥`, "ph-users-three", "success");

        } catch (err) {
            console.error("Error crítico al unirse a la liga:", err);
            showToast("Error al verificar la existencia de la liga.", "ph-warning-circle", "danger");
            return;
        }
    }

    // 🛡️ Forzamos la sincronización para que la nube se aprenda de memoria a qué liga entraste
    guardarStats();

    // Refrescamos el modal para desplegar la tabla de posiciones real
    abrirModalLigaAmigosPrivada();
}

function renderizarCuerpoLiga(lista, nombreVisualLiga, miNombreRanking, tipoVista) {
    tipoVista = tipoVista || 'puntaje';
    const body = document.getElementById('liga-amigos-modal-body');
    if (!body) return;

    const esPuntaje = tipoVista === 'puntaje';
    const esOnce = tipoVista === 'once';

    // 🎨 Configuración dinámica de ícono, resplandor y colores según la pestaña activa
    const headerConfig = esOnce ? {
        img: 'posicion.webp',
        alt: 'Pizarra Táctica',
        glowClass: 'glow-gold',
        badgeImg: 'posicion.webp',
        badgeTitle: nombreVisualLiga.replace(/_/g, ' '),
        badgeSub: 'Once Inicial',
        badgeColor: '#fbbf24'
    } : (esPuntaje ? {
        img: 'liga-icon-puntaje.webp',
        alt: 'Puntaje Máximo',
        glowClass: 'glow-green',
        badgeImg: 'liga-icon-puntaje.webp',
        badgeTitle: nombreVisualLiga.replace(/_/g, ' '),
        badgeSub: 'Puntaje Máximo',
        badgeColor: '#00ff77'
    } : {
        img: 'liga-icon-historial.webp',
        alt: 'Historial G/P',
        glowClass: 'glow-blue',
        badgeImg: 'liga-icon-historial.webp',
        badgeTitle: nombreVisualLiga.replace(/_/g, ' '),
        badgeSub: 'Historial G/P',
        badgeColor: '#2979ff'
    });

    // 📊 Cálculo en vivo de las métricas de la liga
    const miFila = (lista || []).find(f => (f.nombre || '').trim().toLowerCase() === (miNombreRanking || '').toLowerCase());
    const miPuntajeLiga = miFila ? (miFila.puntaje || 0) : 0;
    const miGPLiga = miFila ? `${miFila.triunfos || 0}G - ${miFila.derrotas || 0}P` : '0G - 0P';
    const totalMiembros = (lista || []).length;
    const conectadosAhora = (usuariosOnlineLiga || []).length;

    let labelPill1 = 'TU PUNTAJE';
    let valorPill1 = miPuntajeLiga > 0 ? miPuntajeLiga.toLocaleString('es-AR') + ' pts' : '0 pts';
    let iconPill1 = 'ph-trophy';

    if (tipoVista === 'triunfos') {
        labelPill1 = 'TUS DUELOS';
        valorPill1 = miGPLiga;
        iconPill1 = 'ph-sword';
    } else if (esOnce) {
        let miOvrLive = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 0;
        if (miOvrLive === 0) {
            const miNivelActual = (userStats && userStats.nivelActual !== undefined) ? userStats.nivelActual : 1;
            miOvrLive = Math.min(99, (typeof NIVELES !== 'undefined' && NIVELES[miNivelActual]) ? NIVELES[miNivelActual].ovr : 60);
        }
        labelPill1 = 'TU EQUIPO';
        valorPill1 = `GRL ${miOvrLive}`;
        iconPill1 = 'ph-shield-check';
    }

    const subMenuHTML = `
    <div class="liga-tabs-row ranking-tabs-row">
        <button class="liga-tab-btn ${!esOnce ? 'active' : ''}" onclick="cambiarVistaLiga(subVistaGuessrActual || 'puntaje')">
            <img src="liga-icon-puntaje.webp" alt="StadiumGuessr" class="ranking-tab-img"> <span>StadiumGuessr</span>
        </button>
        <button class="liga-tab-btn ${esOnce ? 'active' : ''}" onclick="cambiarVistaLiga('once')">
            <img src="posicion.webp" alt="Once Inicial" class="ranking-tab-img"> <span>Once Inicial</span>
        </button>
    </div>`;

    let htmlContenido = `<div class="liga-table-card"><div class="ranking-rows-scroll">`;

    if (!lista || lista.length === 0) {
        htmlContenido += `
        <div style="text-align:center; padding:36px 20px; color:var(--text-muted); font-size:.85rem; line-height:1.5;">
            ${esOnce 
                ? 'Todavía no hay equipos registrados en esta liga.'
                : (tipoVista === 'triunfos'
                    ? 'Todavía nadie disputó duelos ⚔️ en esta liga. ¡Desafiá a alguien que esté online!'
                    : 'Todavía nadie registró partidas en esta liga.')}
        </div>`;
    } else {
        const medallas3DLiga = [
            '<img src="medalla-oro.webp" alt="1º" class="rank-pos-medal">',
            '<img src="medalla-plata.webp" alt="2º" class="rank-pos-medal">',
            '<img src="medalla-bronce.webp" alt="3º" class="rank-pos-medal">'
        ];
        const renderRankSlotLiga = (idx, esSticky = false, stickyNum = 0) => {
            if (esSticky) {
                return `<span class="ranking-pos-slot sticky-slot"><span class="sticky-rank-pill">#${stickyNum}</span></span>`;
            }
            if (idx < 3) {
                return `<span class="ranking-pos-slot top3-slot">${medallas3DLiga[idx]}</span>`;
            }
            return `<span class="ranking-pos-slot"><span class="ranking-pos-num">${idx + 1}</span></span>`;
        };
        lista.forEach((f, i) => {
            const med = renderRankSlotLiga(i);
            const nombreRival = (f.nombre || 'Anónimo').trim();

            const estaOnline = usuariosOnlineLiga.includes(nombreRival);
            const esPropio = nombreRival.toLowerCase() === (miNombreRanking || '').toLowerCase();

            let indicadorOnline = "";
            let botonReto = "";

            if (estaOnline) {
                indicadorOnline = `<span style="background:#00e676; width:8px; height:8px; border-radius:50%; display:inline-block; margin-left:8px; box-shadow:0 0 8px #00e676; animation: pulseGlow 2s infinite;" title="Mirando la liga ahora"></span>`;
                if (!esPropio && !esOnce) {
                    botonReto = `<img src="liga-icon-historial.webp" alt="Desafiar" onclick="desafiarAmigoDirecto('${nombreRival.replace(/'/g, "\\'")}')" style="cursor:pointer; width:28px; height:28px; object-fit:contain; margin-left:8px; transition:transform 0.15s; vertical-align:middle; filter: drop-shadow(0 0 6px rgba(0, 255, 119, 0.5));" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" title="Retar a duelo en vivo">`;
                }
            }

            let bloqueGEP = "";
            if (esOnce) {
                const part = f.partidos || { g: 0, e: 0, p: 0 };
                bloqueGEP = `<div class="once-stat-gep" title="Partidos del Once: ${part.g}G · ${part.e}E · ${part.p}P">
                                <strong style="color:#00e676;">${part.g}<span class="gep-sub">G</span></strong>
                                <span class="gep-sep">·</span>
                                <strong style="color:#fbbf24;">${part.e}<span class="gep-sub">E</span></strong>
                                <span class="gep-sep">·</span>
                                <strong style="color:#ff4757;">${part.p}<span class="gep-sub">P</span></strong>
                            </div>`;
                if (esPropio) {
                    botonReto = '';
                } else if ((f.nivelActual || 1) >= 4) {
                    botonReto = `<button type="button" class="btn-desafiar-row" onclick="desafiarOnceDesdeLigaAmigos('${nombreRival.replace(/'/g, "\\'")}')" title="Desafiar al Once de ${sanitizarHTML(nombreRival)}"><img src="liga-icon-historial.webp" alt="Duelo" class="carrera-mini-swords"> <span>DUELO</span></button>`;
                } else {
                    botonReto = `<span class="once-lock-text" title="Nivel ${f.nivelActual || 1}/4 para desbloquear Once"><i class="ph-bold ph-lock-key"></i> Nvl ${f.nivelActual || 1}/4</span>`;
                }

                htmlContenido += `
                <div class="liga-row-item liga-once-row ${esPropio ? 'es-propio' : ''}">
                    <div class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreRival.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreRival)}">
                        ${med} ${obtenerAvatarCirculoHTML(nombreRival)} <span class="once-user-name">${sanitizarHTML(nombreRival)}<sub class="once-user-grl-sub" title="GRL Once Inicial: ${f.ovr || 60}">${f.ovr || 60}</sub></span> ${indicadorOnline}
                    </div>
                    <div class="once-col-gep once-data-cell">${bloqueGEP}</div>
                    <div class="once-col-act once-data-cell">${botonReto}</div>
                </div>`;
            } else {
                let bloquePuntos = "";
                if (tipoVista === 'triunfos') {
                    const w = f.triunfos || 0;
                    const l = f.derrotas || 0;
                    bloquePuntos = `<div style="display:flex; align-items:center; gap:6px;">
                                        <strong style="color:#00e676; font-weight:900;">${w} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">G</span></strong>
                                        <span style="color:var(--text-muted); font-size:0.8rem;">-</span>
                                        <strong style="color:#ff4757; font-weight:900;">${l} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">P</span></strong>
                                    </div>`;
                } else {
                    bloquePuntos = `<span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">${(f.puntaje || 0).toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span></span>`;
                }

                htmlContenido += `
                <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                    <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreRival.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreRival)}">
                        ${med} ${obtenerAvatarCirculoHTML(nombreRival)} <span class="ranking-user-name">${sanitizarHTML(nombreRival)}</span> ${indicadorOnline}
                    </span>
                    <span style="display:flex; align-items:center; gap:6px; flex-shrink:0; margin-left:6px;">
                        ${bloquePuntos}
                        ${botonReto}
                    </span>
                </div>`;
            }
        });
    }

    htmlContenido += `</div>`;

    // 📌 FILA ANCLADA (STICKY) EN LIGA SI ESTÁS FUERA DEL TOP 50
    const miPuestoLigaIdx = (lista || []).findIndex(f => (f.nombre || '').trim().toLowerCase() === (miNombreRanking || '').toLowerCase());
    if (miPuestoLigaIdx >= 50 && miFila) {
        if (esOnce) {
            let miOvrLive = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 0;
            if (miOvrLive === 0) {
                const miNivelActual = (userStats && userStats.nivelActual !== undefined) ? userStats.nivelActual : 1;
                miOvrLive = Math.min(99, (typeof NIVELES !== 'undefined' && NIVELES[miNivelActual]) ? NIVELES[miNivelActual].ovr : 60);
            }
            const partMio = miFila.partidos || { g: 0, e: 0, p: 0 };
            const bloqueGEPSticky = `<div class="once-stat-gep" title="Tus partidos del Once: ${partMio.g}G · ${partMio.e}E · ${partMio.p}P">
                                        <strong style="color:#00e676;">${partMio.g}<span class="gep-sub">G</span></strong>
                                        <span class="gep-sep">·</span>
                                        <strong style="color:#fbbf24;">${partMio.e}<span class="gep-sub">E</span></strong>
                                        <span class="gep-sep">·</span>
                                        <strong style="color:#ff4757;">${partMio.p}<span class="gep-sub">P</span></strong>
                                     </div>`;

            htmlContenido += `
            <div class="liga-row-item liga-once-row sticky-user-row es-propio">
                <div class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombreRanking.replace(/'/g, "\\'")}')" title="Tu posición">
                    ${renderRankSlotLiga(0, true, miPuestoLigaIdx + 1)} ${obtenerAvatarCirculoHTML(miNombreRanking)} <span class="once-user-name"><b>${sanitizarHTML(miNombreRanking)} (Vos)</b><sub class="once-user-grl-sub" title="Tu GRL Once Inicial: ${miOvrLive}">${miOvrLive}</sub></span>
                </div>
                <div class="once-col-gep once-data-cell">${bloqueGEPSticky}</div>
                <div class="once-col-act once-data-cell"></div>
            </div>`;
        } else {
            let bloquePuntosSticky = "";
            if (tipoVista === 'triunfos') {
                bloquePuntosSticky = `<div style="display:flex; align-items:center; gap:6px;">
                                        <strong style="color:#00e676; font-weight:900;">${miFila.triunfos || 0} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">G</span></strong>
                                        <span style="color:var(--text-muted); font-size:0.8rem;">-</span>
                                        <strong style="color:#ff4757; font-weight:900;">${miFila.derrotas || 0} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">P</span></strong>
                                      </div>`;
            } else {
                bloquePuntosSticky = `<span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">${(miFila.puntaje || 0).toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span></span>`;
            }

            htmlContenido += `
            <div class="liga-row-item sticky-user-row es-propio">
                <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombreRanking.replace(/'/g, "\\'")}')" title="Tu posición">
                    ${renderRankSlotLiga(0, true, miPuestoLigaIdx + 1)} ${obtenerAvatarCirculoHTML(miNombreRanking)} <span class="ranking-user-name"><b>${sanitizarHTML(miNombreRanking)} (Vos)</b></span>
                </span>
                <span style="display:flex; align-items:center; gap:8px;">${bloquePuntosSticky}</span>
            </div>`;
        }
    }

    htmlContenido += `</div>`;

    const botonEditarOnceHTML = esOnce
        ? `<button onclick="cerrarModalLigaAmigosPrivada(); if (typeof abrirModalOnceInicial === 'function') abrirModalOnceInicial(false);" class="btn-invitar-liga" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.28) 0%, rgba(20, 16, 8, 0.96) 60%, rgba(10, 8, 4, 0.98) 100%) !important; border: 1.5px solid #fbbf24 !important; border-top: 2px solid #fef08a !important; color: #fef08a !important; box-shadow: 0 4px 14px rgba(234, 179, 8, 0.35) !important;">
            <i class="ph-bold ph-strategy"></i> Editar Mi Once Inicial
           </button>`
        : '';

    body.innerHTML = `
    <div class="ranking-split-grid">
        <div class="ranking-left-panel">
            <div class="ranking-brand-box">
                <div class="trophy-stage-wrapper">
                    <div class="trophy-glow-backdrop ${headerConfig.glowClass}"></div>
                    <div class="trophy-main-img-box">
                        <img src="${headerConfig.img}" alt="${headerConfig.alt}" class="trophy-main-img">
                    </div>
                </div>
                <h2 class="liga-modal-title">Liga de Amigos</h2>
            </div>

            <div class="modal-header-right-pills ranking-pills-column">
                <div class="header-stat-pill">
                    <i class="ph-bold ${iconPill1}" style="color: ${headerConfig.badgeColor};"></i>
                    <div class="stat-pill-info">
                        <span>${labelPill1}</span>
                        <strong>${valorPill1}</strong>
                    </div>
                </div>
                <div class="header-stat-pill">
                    <i class="ph-bold ph-users-three" style="color: ${headerConfig.badgeColor};"></i>
                    <div class="stat-pill-info">
                        <span>INTEGRANTES</span>
                        <strong>${totalMiembros} Jugadores</strong>
                    </div>
                </div>
                <div class="header-stat-pill">
                    <i class="ph-bold ph-broadcast" style="color: ${headerConfig.badgeColor};"></i>
                    <div class="stat-pill-info">
                        <span>EN VIVO</span>
                        <strong>${conectadosAhora} Online</strong>
                    </div>
                </div>
            </div>

            <div class="ranking-sidebar-menu">
                ${subMenuHTML}
            </div>
        </div>

        <div class="ranking-right-panel">
            <div class="ranking-table-top-bar">
                <div class="ranking-active-badge" style="--badge-color:${headerConfig.badgeColor};">
                    <span class="badge-dot-live" style="background:${headerConfig.badgeColor}; box-shadow:0 0 10px ${headerConfig.badgeColor};"></span>
                    <img src="${headerConfig.badgeImg}" alt="Ícono" class="badge-title-png-icon">
                    <span class="badge-title-text">${headerConfig.badgeTitle}</span>
                    <span class="badge-sep">·</span>
                    <span class="badge-sub-pill" style="color:${headerConfig.badgeColor};">${headerConfig.badgeSub}</span>
                </div>

                ${!esOnce ? `
                <div class="guessr-subtab-switch">
                    <button type="button" class="guessr-subtab-btn ${esPuntaje ? 'active' : ''}" onclick="cambiarVistaLiga('puntaje')">
                        <i class="ph-bold ph-crosshair"></i> <span>Puntaje Máx.</span>
                    </button>
                    <button type="button" class="guessr-subtab-btn ${tipoVista === 'triunfos' ? 'active' : ''}" onclick="cambiarVistaLiga('triunfos')">
                        <i class="ph-bold ph-sword"></i> <span>Historial G/P</span>
                    </button>
                </div>
                ` : ''}

                <!-- 🔍 BUSCADOR EN VIVO DE INTEGRANTES -->
                <div class="ranking-search-box">
                    <i class="ph-bold ph-magnifying-glass"></i>
                    <input type="text" class="ranking-search-input" placeholder="Buscar en la liga..." oninput="filtrarJugadoresRanking(this.value)">
                </div>
            </div>
            ${htmlContenido}
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px; margin-bottom: 6px;">
                ${botonEditarOnceHTML}
                <button onclick="compartirLinkLiga('${sanitizarHTML(nombreVisualLiga)}')" class="btn-invitar-liga">
                    <i class="ph-bold ph-share-network"></i> Invitar a mi liga
                </button>
                <button onclick="salirLigaAmigos()" class="btn-salir-liga">
                    <i class="ph-bold ph-sign-out"></i> SALIR DE LA LIGA
                </button>
            </div>
        </div>
    </div>`;
}

// 🔄 Cambia entre "Puntaje máximo", "Historial W/L" y "Once Inicial" dentro del modal de la liga.
window.cambiarVistaLiga = async function(vista) {
    if (vista === vistaLigaActual) return;

    if (vista === 'puntaje') {
        vistaLigaActual = 'puntaje';
        subVistaGuessrActual = 'puntaje';
        renderizarCuerpoLiga(cacheTop15Ligas, nombreLigaActivaCache, miNombreRankingLiga, 'puntaje');
        return;
    }

    if (vista === 'triunfos') {
        subVistaGuessrActual = 'triunfos';
        if (cacheTriunfosLiga !== null) {
            vistaLigaActual = 'triunfos';
            renderizarCuerpoLiga(cacheTriunfosLiga, nombreLigaActivaCache, miNombreRankingLiga, 'triunfos');
            return;
        }

        const body = document.getElementById('liga-amigos-modal-body');
        if (body) body.innerHTML = `<div style="text-align:center; padding:50px 0;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2rem; color:var(--accent-color);"></i></div>`;

        try {
            const [{ data: dataV, error: errV }, { data: dataD, error: errD }] = await Promise.all([
                supabaseClient.from('victorias_versus').select('nombre').eq('liga', nombreLigaActivaCache),
                supabaseClient.from('derrotas_versus').select('nombre').eq('liga', nombreLigaActivaCache)
            ]);

            if (errV) throw errV;
            if (errD) throw errD;

            const statsLiga = {};
            (dataV || []).forEach(row => {
                const n = (row.nombre || 'Anónimo').trim();
                if (typeof esRegistroBot === 'function' && esRegistroBot(n, 0)) return;
                if (!statsLiga[n]) statsLiga[n] = { nombre: n, triunfos: 0, derrotas: 0 };
                statsLiga[n].triunfos++;
            });

            (dataD || []).forEach(row => {
                const n = (row.nombre || 'Anónimo').trim();
                if (typeof esRegistroBot === 'function' && esRegistroBot(n, 0)) return;
                if (!statsLiga[n]) statsLiga[n] = { nombre: n, triunfos: 0, derrotas: 0 };
                statsLiga[n].derrotas++;
            });

            cacheTriunfosLiga = Object.values(statsLiga)
                .sort((a, b) => b.triunfos - a.triunfos)
                .slice(0, 50);

            vistaLigaActual = 'triunfos';
            renderizarCuerpoLiga(cacheTriunfosLiga, nombreLigaActivaCache, miNombreRankingLiga, 'triunfos');
        } catch (e) {
            console.error("Error al cargar el ranking de triunfos de la liga:", e);
            showToast("No se pudo cargar el ranking de triunfos. 📡", "ph-warning-circle", "danger");
            renderizarCuerpoLiga(cacheTop15Ligas, nombreLigaActivaCache, miNombreRankingLiga, 'puntaje');
        }
        return;
    }

    if (vista === 'once') {
        if (cacheOnceLiga !== null) {
            vistaLigaActual = 'once';
            renderizarCuerpoLiga(cacheOnceLiga, nombreLigaActivaCache, miNombreRankingLiga, 'once');
            return;
        }

        const body = document.getElementById('liga-amigos-modal-body');
        if (body) body.innerHTML = `<div style="text-align:center; padding:50px 0;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2rem; color:#ffd700;"></i><p style="margin-top:12px; font-size:0.85rem; font-weight:800; color:var(--text-main);">Cargando planteles de la liga...</p></div>`;

        try {
            await precargarAvataresComunidad();

            // 1. Integrantes de la liga
            const nombresSet = new Set();
            (cacheTop15Ligas || []).forEach(m => {
                const n = (m.nombre || '').trim();
                if (n) nombresSet.add(n);
            });
            if (miNombreRankingLiga) nombresSet.add(miNombreRankingLiga.trim());

            // 2. Traer perfiles de Supabase
            let perfilesNube = [];
            if (supabaseClient) {
                const { data } = await supabaseClient
                    .from('perfiles')
                    .select('id_usuario, experiencia, datos_juego')
                    .limit(500);
                perfilesNube = data || [];
            }

            // 3. OVR en vivo del usuario actual
            const u = obtenerUsuarioLogueado();
            const miNick = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Vos')).trim();
            const miNickLower = miNick.toLowerCase();
            let miOvrLive = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 0;
            if (miOvrLive === 0) {
                const miNivelActual = (userStats && userStats.nivelActual !== undefined) ? userStats.nivelActual : (typeof calcularNivelIdx === 'function' ? calcularNivelIdx(userStats.xpTotal || 0) : 1);
                miOvrLive = Math.min(99, (typeof NIVELES !== 'undefined' && NIVELES[miNivelActual]) ? NIVELES[miNivelActual].ovr : 60);
            }
            const miEscudo = userStats.onceEscudo || getPref('ev_avatar_logo', 'ev');
            const miNivel = (userStats && userStats.nivelActual !== undefined) ? userStats.nivelActual : 1;

            const listaOnce = [];
            const procesadosLower = new Set();

            nombresSet.forEach(nombreJugador => {
                const n = nombreJugador.trim();
                if (!n) return;
                const nLower = n.toLowerCase();
                if (procesadosLower.has(nLower)) return;
                procesadosLower.add(nLower);

                const esMio = nLower === miNickLower || nLower === (miNombreRankingLiga || '').toLowerCase();
                if (esMio) {
                    const dG = (userStats && userStats.duelosGanados) || 0;
                    const dJ = (userStats && userStats.duelosJugados) || 0;
                    const dE = (userStats && userStats.duelosEmpatados) || 0;
                    const dP = (userStats && userStats.duelosPerdidos !== undefined) ? userStats.duelosPerdidos : Math.max(0, dJ - dG - dE);
                    
                    let lG = 0, lE = 0, lP = 0;
                    try {
                        const idU = (typeof getUserId === 'function') ? getUserId() : 'default';
                        const lgRaw = localStorage.getItem('ev_liga_guardada_' + idU);
                        if (lgRaw) {
                            const lgObj = JSON.parse(lgRaw);
                            const uRow = (lgObj.tabla || []).find(t => t.esUsuario);
                            if (uRow) {
                                lG = uRow.pg || 0;
                                lE = uRow.pe || 0;
                                lP = uRow.pp || 0;
                            }
                        }
                    } catch (err) {}

                    listaOnce.push({
                        nombre: miNombreRankingLiga || miNick,
                        ovr: miOvrLive,
                        escudo: miEscudo,
                        nivelActual: miNivel,
                        esUsuario: true,
                        partidos: {
                            g: dG + lG,
                            e: dE + lE,
                            p: dP + lP
                        }
                    });
                    return;
                }

                // Buscar perfil rival en la nube
                const p = perfilesNube.find(item => {
                    const nick = item.datos_juego?.preferencias?.custom_nick;
                    return nick && nick.trim().toLowerCase() === nLower;
                });

                if (p) {
                    const dj = p.datos_juego || {};
                    const pref = dj.preferencias || {};
                    const exp = p.experiencia || dj.xpTotal || 0;
                    const nivelDt = typeof calcularNivelIdx === 'function' ? calcularNivelIdx(exp) : 1;
                    
                    let ovr = 60;
                    const onceR = dj.onceInicial;
                    const mejoras = dj.mejorasJugadores || {};
                    let idsTitulares = [];
                    if (onceR && typeof onceR === 'object') {
                        idsTitulares = Object.keys(onceR).filter(k => k !== 'DT' && onceR[k]).map(k => onceR[k]);
                    }
                    if (idsTitulares.length >= 11) {
                        let sumaOvr = 0;
                        idsTitulares.forEach(id => {
                            const aLimpio = String(id).replace(/\.png$/i, '.webp');
                            const extra = mejoras[aLimpio] || 0;
                            const item = (typeof AVATARES_LISTA !== 'undefined') ? AVATARES_LISTA.find(a => a.id === aLimpio) : null;
                            const nivelReq = item ? item.nivel : 0;
                            const baseOvr = (typeof NIVELES !== 'undefined' && NIVELES[nivelReq]) ? NIVELES[nivelReq].ovr : 50;
                            sumaOvr += Math.min(99, baseOvr + extra);
                        });
                        ovr = Math.round(sumaOvr / idsTitulares.length);
                        if (dj.onceCapitan) ovr += 2;
                        if (onceR['DT']) ovr += 1;
                        ovr = Math.min(99, ovr);
                    } else {
                        ovr = Math.min(99, (typeof NIVELES !== 'undefined' && NIVELES[nivelDt]) ? NIVELES[nivelDt].ovr : 60);
                    }

                    const rivDG = dj.duelosGanados || 0;
                    const rivDJ = dj.duelosJugados || 0;
                    const rivDE = dj.duelosEmpatados || 0;
                    const rivDP = dj.duelosPerdidos !== undefined ? dj.duelosPerdidos : Math.max(0, rivDJ - rivDG - rivDE);
                    const rivG = dj.oncePartidos?.g ?? rivDG;
                    const rivE = dj.oncePartidos?.e ?? rivDE;
                    const rivP = dj.oncePartidos?.p ?? rivDP;

                    listaOnce.push({
                        nombre: n,
                        ovr: ovr,
                        escudo: dj.onceEscudo || pref.avatar_logo || 'ev',
                        nivelActual: nivelDt,
                        esUsuario: false,
                        partidos: {
                            g: rivG,
                            e: rivE,
                            p: rivP
                        }
                    });
                } else {
                    listaOnce.push({
                        nombre: n,
                        ovr: 60,
                        escudo: 'ev',
                        nivelActual: 1,
                        esUsuario: false,
                        partidos: { g: 0, e: 0, p: 0 }
                    });
                }
            });

            cacheOnceLiga = listaOnce.sort((a, b) => b.ovr - a.ovr);
            vistaLigaActual = 'once';
            renderizarCuerpoLiga(cacheOnceLiga, nombreLigaActivaCache, miNombreRankingLiga, 'once');
        } catch (e) {
            console.error("Error al cargar Once Inicial de la liga:", e);
            showToast("No se pudo cargar la vista de Once Inicial. 📡", "ph-warning-circle", "danger");
            renderizarCuerpoLiga(cacheTop15Ligas, nombreLigaActivaCache, miNombreRankingLiga, 'puntaje');
        }
        return;
    }
};

window.desafiarOnceDesdeLigaAmigos = function(nombreRival) {
    cerrarModalLigaAmigosPrivada();
    if (typeof desafiarDesdeRankingCarrera === 'function') {
        desafiarDesdeRankingCarrera(nombreRival);
    } else if (typeof inspeccionarPerfilRival === 'function') {
        inspeccionarPerfilRival(nombreRival);
    }
};

window.desafiarAmigoDirecto = function(nombreRival) {
    if (esModoVersus) {
        showToast("Ya estás en una partida en curso. Terminala antes de retar a otro. ⚠️", "ph-warning-circle", "danger");
        return;
    }

    const misEstadiosAleatorios = obtener5EstadiosVersus();
    if (!misEstadiosAleatorios || misEstadiosAleatorios.length < 5) {
        showToast("Esperá un segundo que termine de cargar el catálogo... ⚽", "ph-circle-notch", "warning");
        return;
    }

    cerrarModalLigaAmigosPrivada();
    mostrarPasoDificultad('reto_amigo', nombreRival);
};

window.ejecutarDesafioAmigoDirecto = function(nombreRival, diff) {
    guessrDificultad = diff;
    const misEstadiosAleatorios = obtener5EstadiosVersus();
    const u = obtenerUsuarioLogueado();
    const miNombreRanking = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');

    const idSala = Math.random().toString(36).substring(2, 8).toUpperCase();
    versusPartidaId = 'PRIV_' + idSala;
    versusEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));
    versusLigaOrigen = nombreLigaActivaCache;

    versusRol = 'jugador_1';
    esModoVersus = true;
    esModoBot = false;
    versusPartidaEnCurso = false;

    if (!ligaAmigosChannel) {
        conectarPresenciaLiga(nombreLigaActivaCache, miNombreRanking);
    }

    if (ligaAmigosChannel) {
        ligaAmigosChannel.send({
            type: 'broadcast',
            event: 'reto_directo',
            payload: { de: miNombreRanking, para: nombreRival, salaId: versusPartidaId, dificultad: diff }
        });
    }

    abrirLobbyEspera();
    showToast(`Desafío enviado a ${nombreRival} (${diff === 'facil' ? 'Promesa' : diff === 'dificil' ? 'Leyenda' : 'Crack'})... ⏳`, 'ph-hourglass', 'info');
    conectarRealtimeVersus();

    if (timeoutRetoDirecto) clearTimeout(timeoutRetoDirecto);
    timeoutRetoDirecto = setTimeout(() => {
        if (!versusPartidaEnCurso) {
            cancelarBusquedaVersus();
            showToast(`${nombreRival} no respondió al desafío a tiempo. ⏱️`, "ph-warning-circle", "danger");
        }
        timeoutRetoDirecto = null;
    }, 30000);
};

function cerrarModalLigaAmigosPrivada() {
    const modal = document.getElementById('liga-amigos-modal');
    if (modal) modal.style.display = 'none';
    
    if (ligaAmigosChannel) {
        supabaseClient.removeChannel(ligaAmigosChannel);
        ligaAmigosChannel = null;
    }
    usuariosOnlineLiga = [];
    verificarSobreBienvenidaPostPartida();
}

// ==========================================
// MOTOR DE PRESENCIA Y DESAFÍOS EN VIVO DE LA LIGA
// ==========================================

// 🚪 Abre el modal de "Mi Liga": si todavía no estás en ninguna, muestra el form de crear/unirte;
// si ya pertenecés a una, trae la tabla de posiciones y conecta la presencia en vivo.
async function abrirModalLigaAmigosPrivada() {
    const modal = document.getElementById('liga-amigos-modal');
    if (modal) modal.style.display = 'flex';

    const u = obtenerUsuarioLogueado();
    const body = document.getElementById('liga-amigos-modal-body');

    // Acceso total: los invitados usan su ID y apodo local

    const nombreLiga = localStorage.getItem('ev_codigo_liga_amigos');

    // CASO 1: Todavía no pertenezco a ninguna liga -> mostramos el formulario de crear/unirse
    if (!nombreLiga) {
        if (body) {
            body.innerHTML = `
            <div style="max-width:440px; margin:20px auto; text-align:center;">
                <div class="trophy-stage-wrapper" style="margin-bottom:10px;">
                    <div class="trophy-glow-backdrop glow-green"></div>
                    <div class="trophy-main-img-box">
                        <img src="liga-trofeo-header.webp" alt="Liga de Amigos" class="trophy-main-img">
                    </div>
                </div>
                <h2 class="liga-modal-title" style="margin-bottom:6px;">Liga Privada de Amigos</h2>
                <p style="font-size:.85rem; color:var(--text-muted); margin-bottom:20px; line-height:1.4;">Creá un torneo con tus amigos o ingresá con el nombre exacto de la liga.</p>
                
                <input id="input-codigo-liga" maxlength="20" placeholder="NOMBRE_DE_LA_LIGA"
                       style="width:100%; padding:14px; border-radius:14px; border:2px solid var(--border-strong); background:var(--bg-color); color:var(--text-main); font-size:1rem; font-weight:800; text-align:center; text-transform:uppercase; margin-bottom:14px; outline:none; box-sizing:border-box;">
                <div style="display:flex; gap:10px;">
                    <button onclick="crearOCargarLigaAmigos(true)" class="btn-3d primary" style="flex:1; padding:14px; font-size:0.92rem;"><i class="ph-bold ph-plus-circle"></i> Crear liga</button>
                    <button onclick="crearOCargarLigaAmigos(false)" class="btn-3d secondary" style="flex:1; padding:14px; font-size:0.92rem;"><i class="ph-bold ph-sign-in"></i> Unirme</button>
                </div>
            </div>`;
        }
        // Por las dudas, si veníamos de una liga anterior, apagamos cualquier canal viejo
        if (ligaAmigosChannel) { supabaseClient.removeChannel(ligaAmigosChannel); ligaAmigosChannel = null; }
        usuariosOnlineLiga = [];
        return;
    }

    // CASO 2: Ya pertenezco a una liga -> traemos el ranking y conectamos la presencia en vivo
    nombreLigaActivaCache = nombreLiga;
    vistaLigaActual = 'puntaje';   // Siempre arrancamos en la pestaña de puntaje al reabrir el modal
    cacheTriunfosLiga = null;      // Invalidamos el cache de triunfos: se vuelve a pedir si el usuario abre esa pestaña
    cacheOnceLiga = null;          // Invalidamos el cache de Once Inicial
    miNombreRankingLiga = obtenerNombreDisplay().trim();

    if (body) {
        body.innerHTML = `<div style="text-align:center; padding:50px 0;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2rem; color:var(--accent-color);"></i></div>`;
    }

    try {
        await precargarAvataresComunidad();
        const { data, error } = await supabaseClient
            .from('ranking')
            .select('nombre, puntaje')
            .eq('juego', 'duelo_' + nombreLiga)
            .order('puntaje', { ascending: false })
            .limit(500);

        if (error) throw error;

        // 🧹 Agrupamos sin distinción de mayúsculas/minúsculas y conservamos el puntaje récord
        const mejorPorIntegrante = {};
        (data || []).forEach(row => {
            const n = (row.nombre || 'Anónimo').trim();
            const p = row.puntaje || 0;
            if (typeof esRegistroBot === 'function' && esRegistroBot(n, p)) return;
            const clave = n.toLowerCase();
            if (!mejorPorIntegrante[clave] || p > mejorPorIntegrante[clave].puntaje) {
                mejorPorIntegrante[clave] = { nombre: n, puntaje: p };
            }
        });

        cacheTop15Ligas = Object.values(mejorPorIntegrante)
            .sort((a, b) => b.puntaje - a.puntaje)
            .slice(0, 50);

        renderizarCuerpoLiga(cacheTop15Ligas, nombreLiga, miNombreRankingLiga, 'puntaje');
    } catch (e) {
        console.error("Error al cargar la tabla de la liga:", e);
        showToast("No se pudo cargar la tabla de tu liga. 📡", "ph-warning-circle", "danger");
        if (body) body.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px 0;">No se pudo cargar la liga. Cerrá y volvé a intentar.</p>`;
        return;
    }

    conectarPresenciaLiga(nombreLiga, miNombreRankingLiga);
}

// 📡 Crea y suscribe el canal de presencia + desafíos de la liga activa.
// Mientras este canal esté vivo: (a) sabemos quién está mirando la liga ahora mismo,
// y (b) podemos recibir/emitir desafíos directos ('reto_directo').
function conectarPresenciaLiga(nombreLiga, miNombre) {
    // Si ya había un canal abierto de una sesión anterior del modal, lo tiramos primero
    if (ligaAmigosChannel) {
        supabaseClient.removeChannel(ligaAmigosChannel);
        ligaAmigosChannel = null;
    }

    ligaAmigosChannel = supabaseClient.channel(`liga_${nombreLiga}`, {
        config: { presence: { key: miNombre } }
    });

    ligaAmigosChannel
        .on('presence', { event: 'sync' }, () => {
            const estado = ligaAmigosChannel.presenceState();
            usuariosOnlineLiga = Object.keys(estado);
            // Repintamos con el cache de la pestaña que esté activa ahora mismo (sin volver a pegarle a la base de datos)
            const listaActual = vistaLigaActual === 'once'
                ? (cacheOnceLiga || [])
                : (vistaLigaActual === 'triunfos' ? (cacheTriunfosLiga || []) : cacheTop15Ligas);
            renderizarCuerpoLiga(listaActual, nombreLigaActivaCache, miNombreRankingLiga, vistaLigaActual);
        })
        .on('broadcast', { event: 'reto_directo' }, (response) => {
            const data = response.payload || response;
            if (!data || data.para !== miNombre) return; // El desafío no es para mí, lo ignoro

            if (esModoVersus) return; // Ya estoy jugando otra partida, no puedo aceptar ahora

            if (data.dificultad) guessrDificultad = data.dificultad;
            mostrarNotificacionDesafio(data.de, data.salaId);
        })
        // 🔥 INYECTAR ESTO ACÁ:
        .on('broadcast', { event: 'fuerza_refresh' }, () => {
            // Si alguien se cambió el nombre o se fue para siempre, volvemos a pedir los datos a la DB
            abrirModalLigaAmigosPrivada(); 
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                ligaAmigosChannel.track({ online_at: new Date().toISOString() });
            }
        });
}

// 🔔 Muestra el cartel flotante de "Fulano te desafió" con botones de Aceptar / Rechazar
function mostrarNotificacionDesafio(deNombre, salaId) {
    const existente = document.getElementById('reto-directo-popup');
    if (existente) existente.remove();

    const popup = document.createElement('div');
    popup.id = 'reto-directo-popup';
    popup.style.cssText = `
        position: fixed; top: 24px; left: 0; right: 0; margin: 0 auto; width: max-content; max-width: 92%;
        background: var(--glass-bg); border: 2px solid var(--accent-color); padding: 18px 22px; border-radius: 16px;
        z-index: 100000; display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center;
        box-shadow: var(--shadow-strong); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        animation: fadeSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    `;
    popup.innerHTML = `
        <div style="font-weight:900; font-size:1rem;"><i class="ph-duotone ph-sword" style="color:var(--accent-color);"></i> ¡${sanitizarHTML(deNombre)} te desafió a un duelo!</div>
        <div style="display:flex; gap:10px; width:100%;">
            <button onclick="responderDesafio(true,'${salaId}')" class="btn-3d primary" style="flex:1; padding:12px;"><i class="ph-bold ph-check"></i> Aceptar</button>
            <button onclick="responderDesafio(false,'${salaId}')" class="btn-3d secondary" style="flex:1; padding:12px;"><i class="ph-bold ph-x"></i> Rechazar</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Si no responde en 20s, hacemos desaparecer el cartel (el desafiante igual tiene su propio timeout de 30s)
    setTimeout(() => {
        const p = document.getElementById('reto-directo-popup');
        if (p) p.remove();
    }, 20000);
}

window.responderDesafio = function(aceptar, salaId) {
    const popup = document.getElementById('reto-directo-popup');
    if (popup) popup.remove();
    if (!aceptar) return;

    versusLigaOrigen = nombreLigaActivaCache; // 🏆 Este duelo nació en la liga -> cuenta para el ranking de triunfos
    cerrarModalLigaAmigosPrivada(); // Cierra la tabla de la liga y apaga su canal de presencia
    unirseSalaPrivada(salaId);      // Entra a la sala 1v1 que ya armó el rival (mismo motor que el link de WhatsApp)
};

// 🚪 Salir de la liga actual: vuelve a mostrar el formulario de crear/unirse
async function salirLigaAmigos() {
    if (!confirm("¿Seguro que querés salir de tu liga privada? Vas a dejar de ver esta tabla de posiciones y tu puntaje desaparecerá para todos.")) return;
    
    const nombreLiga = localStorage.getItem('ev_codigo_liga_amigos');
    const u = obtenerUsuarioLogueado();
    const miNombre = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');

    if (typeof supabaseClient !== 'undefined' && supabaseClient && nombreLiga) {
        // 1. ESPERAMOS (await) a la función RPC segura para borrar todo
        await supabaseClient.rpc('abandonar_liga_seguro', {
            p_liga: nombreLiga,
            p_nombre: miNombre
        });
        
        // 2. AHORA SÍ, recién cuando la BD nos confirmó el borrado, le avisamos a los demás
        if (typeof ligaAmigosChannel !== 'undefined' && ligaAmigosChannel) {
            ligaAmigosChannel.send({ type: 'broadcast', event: 'fuerza_refresh', payload: {} });
            ligaAmigosChannel.untrack(); // Dejamos de emitir estado "Online"
            ligaAmigosChannel.unsubscribe(); // Matamos la conexión
            ligaAmigosChannel = null;
        }
    }

    // 3. Limpieza local de tu celular/PC
    localStorage.removeItem('ev_codigo_liga_amigos');
    guardarStats();
    
    cerrarModalLigaAmigosPrivada();
    
    // Refrescamos nuestra propia vista (que ahora mostrará el form para unirse a otra liga)
    abrirModalLigaAmigosPrivada();
}


// =============================================================================
// 🌐 EXPORTACIÓN AL ÁMBITO GLOBAL (WINDOW) PARA INTEGRACIÓN Y EVENTOS ONCLICK
// =============================================================================
window.guessrRondaActual = guessrRondaActual;
window.guessrPuntosTotales = guessrPuntosTotales;
window.guessrDificultad = guessrDificultad;
window.guessrEstadioCorrecto = guessrEstadioCorrecto;
window.esModoVersus = esModoVersus;
window.esModoDiario = esModoDiario;
window.pendingScore = pendingScore;
window.pendingScoreType = pendingScoreType;

window.abrirModalVideo = abrirModalVideo;
window.cerrarModalVideo = cerrarModalVideo;
window.abrirModalGuessr = abrirModalGuessr;
window.cerrarModalGuessr = cerrarModalGuessr;
window.iniciarTrivia = iniciarTrivia;
window.iniciarRetoDiario = iniciarRetoDiario;
window.procesarArriesgoGuessr = procesarArriesgoGuessr;
window.avanzarDeRondaGuessr = avanzarDeRondaGuessr;
window.finalizarJuegoGuessr = finalizarJuegoGuessr;
window.guardarScoreGuessr = guardarScoreGuessr;
window.compartirResultado = compartirResultado;
window.compartirRetoDiarioWordle = compartirRetoDiarioWordle;
window.abrirModalRanking = abrirModalRanking;
window.cerrarModalRanking = cerrarModalRanking;
window.filtrarJugadoresRanking = filtrarJugadoresRanking;
window.precargarAvataresComunidad = precargarAvataresComunidad;
window.cancelarBusquedaVersus = cancelarBusquedaVersus;
window.solicitarSiguienteRondaVersus = solicitarSiguienteRondaVersus;
window.mandarTaunt = mandarTaunt;
window.mostrarTauntEnPantalla = mostrarTauntEnPantalla;
window.obtenerFraseFolklore = obtenerFraseFolklore;
window.dispararJuicinessRonda = dispararJuicinessRonda;
window.actualizarDotsProgreso = actualizarDotsProgreso;
window.manejarAbandonoRival = manejarAbandonoRival;
window.unirseSalaPrivada = unirseSalaPrivada;
window.crearSalaPrivada = crearSalaPrivada;
window.buscarPartidaVersus = buscarPartidaVersus;
window.unirseALigaPorLink = unirseALigaPorLink;
window.verificarInvitacionesLigaPendientes = verificarInvitacionesLigaPendientes;
window.crearOCargarLigaAmigos = crearOCargarLigaAmigos;
window.abrirModalLigaAmigosPrivada = abrirModalLigaAmigosPrivada;
window.cerrarModalLigaAmigosPrivada = cerrarModalLigaAmigosPrivada;
window.salirLigaAmigos = salirLigaAmigos;
window.desafiarOnceDesdeLigaAmigos = desafiarOnceDesdeLigaAmigos;
