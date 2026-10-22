// =============================================================================
// 👤 ESTADIOS VIRTUALES - MÓDULO PERFIL DE USUARIO, CARTAS FUT, SOBRES Y LOGROS
// =============================================================================
// Contenido:
// - Generador de Avatares HTML y Diccionario Oficial de Futbolistas (AVATARES_LISTA)
// - Temas visuales de Carta FUT (TEMAS_LISTA: Argentina, Brasil, Alemania, etc.)
// - Inspección de perfiles de otros jugadores de la comunidad
// - Apertura de sobres de bienvenida y recompensas por subir de nivel
// - Selector interactivo de avatares y posición táctica en cancha del usuario
// - Modal de Perfil completo, edición de apodo único y guardado seguro en Supabase
// - Vitrina de Logros con niveles (Común, Raro, Épico) y barras de progreso
// - Exportador viral de Carta FUT 9:16 con código QR de desafío
// =============================================================================

var formacionTacticaActual = '4-3-3';
var nodoPosicionSeleccionadoIdx = null;
var cacheAvataresUsuarios = window.cacheAvataresUsuarios || {};


// --- Generador de Avatares HTML ---

function generarAvatarHTML(avatarImg, forzarDesbloqueado = false) {
    // Blindaje: si el usuario o la base tenían guardado .png, lo migra a .webp en el acto
    let imgNombre = (avatarImg || '1.webp').replace(/\.png$/i, '.webp');
    if (!imgNombre.includes('.')) imgNombre += '.webp';
    
    const nivelReq = obtenerNivelAvatar(imgNombre);
    const nivelUser = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    const estaBloqueado = !forzarDesbloqueado && (nivelUser < nivelReq);

    if (estaBloqueado) {
        return `
        <div class="ac-avatar-full is-locked">
            <img src="${imgNombre}" class="ac-avatar-img-full avatar-locked-blur" alt="Avatar">
            <div class="avatar-card-lock-badge">
                <i class="ph-fill ph-lock-key"></i>
                <span>NIVEL ${nivelReq}</span>
            </div>
        </div>`;
    }
    
    return `<div class="ac-avatar-full"><img src="${imgNombre}" class="ac-avatar-img-full" alt="Avatar"></div>`;
}

// 📚 Módulo de Catálogo, Tarjetas y Ligas migrado a: js/catalogo.js
const todosLosGids=["0","861264971","554922783","88250864","2013531070","165565330","96716546","58862486","304687071","879164460","1616215119","1916896887","120485921","450128934"];
// 🌍 Variables de StadiumGuessr y Multijugador migradas a: js/guessr.js
var pendingScore = window.pendingScore || null, pendingScoreType = window.pendingScoreType || null;


// --- Avatares para Rankings e Inspección de Rivales ---

function obtenerAvatarParaUsuario(nombre) {
    const n = (nombre || '').trim();
    if (!n) return '1.webp';
    const nLower = n.toLowerCase();

    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : '')).trim().toLowerCase();
    if (nLower === miNombre || nLower === 'vos' || nLower === 'invitado') {
        return getPref('ev_avatar_hair', '1.webp').replace(/\.png$/i, '.webp');
    }

    if (cacheAvataresUsuarios[nLower]) {
        return cacheAvataresUsuarios[nLower];
    }

    let hash = 0;
    for (let i = 0; i < n.length; i++) {
        hash = (hash << 5) - hash + n.charCodeAt(i);
        hash |= 0;
    }
    const listaAvatares = (typeof AVATARES_LISTA !== 'undefined' && AVATARES_LISTA.length) ? AVATARES_LISTA : [];
    if (listaAvatares.length) {
        const idx = Math.abs(hash) % listaAvatares.length;
        return listaAvatares[idx].id;
    }
    return '1.webp';
}

function obtenerAvatarCirculoHTML(nombreJugador, avatarDirecto = null) {
    const avatarImg = avatarDirecto || obtenerAvatarParaUsuario(nombreJugador);
    return `<div class="ranking-avatar-circle" title="${sanitizarHTML(nombreJugador)}"><div class="ranking-avatar-inner">${generarAvatarHTML(avatarImg, true)}</div></div>`;
}

window.cerrarModalInspeccionarRival = function() {
    const m = document.getElementById('inspect-profile-modal');
    if (m) m.style.display = 'none';
};

// 👥 Invitaciones y enlaces de Mini Ligas de Amigos migrados a: js/guessr.js

window.inspeccionarPerfilRival = async function(nombreRival) {
    const n = (nombreRival || '').trim();
    if (!n || n.toLowerCase() === 'anónimo') return;

    const modal = document.getElementById('inspect-profile-modal');
    const body = document.getElementById('inspect-profile-body');
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
            <i class="ph-duotone ph-circle-notch" style="font-size:2.2rem; color:var(--accent-color); animation:spinSlow 1s linear infinite;"></i>
            <p style="margin-top:12px; font-size:0.85rem; font-weight:700;">Cargando perfil de ${sanitizarHTML(n)}...</p>
        </div>
    `;
    modal.style.display = 'flex';

    let datosRival = {
        custom_nick: n,
        card_theme: 'arg',
        avatar_hair: obtenerAvatarParaUsuario(n),
        user_pos: 'DC',
        avatar_logo: 'ev',
        xpTotal: 0,
        nivelActual: 0,
        ovr: 60,
        rachaActual: 1,
        partidasGanadas: 0,
        votosRealizados: 0,
        triviasVistas: 0,
        partidasJugadas: 0
    };

    if (supabaseClient) {
        try {
            const { data: perfiles } = await supabaseClient
                .from('perfiles')
                .select('experiencia, datos_juego')
                .limit(200);

            if (perfiles && perfiles.length > 0) {
                const encontrado = perfiles.find(p => {
                    const nick = p.datos_juego?.preferencias?.custom_nick;
                    return nick && nick.trim().toLowerCase() === n.toLowerCase();
                });

                if (encontrado) {
                    const dj = encontrado.datos_juego || {};
                    const pref = dj.preferencias || {};
                    datosRival.xpTotal = encontrado.experiencia || dj.xpTotal || 0;
                    datosRival.nivelActual = calcularNivelIdx(datosRival.xpTotal);
                    datosRival.ovr = NIVELES[datosRival.nivelActual]?.ovr || 60;
                    datosRival.card_theme = pref.card_theme || 'arg';
                    datosRival.avatar_hair = pref.avatar_hair || datosRival.avatar_hair;
                    datosRival.user_pos = pref.user_pos || 'DC';
                    datosRival.avatar_logo = pref.avatar_logo || 'ev';
                    datosRival.rachaActual = dj.rachaActual || 1;
                    datosRival.partidasGanadas = dj.partidasGanadas || 0;
                    datosRival.votosRealizados = dj.votosRealizados || 0;
                    datosRival.triviasVistas = dj.triviasVistas || 0;
                    datosRival.partidasJugadas = dj.partidasJugadas || 0;
                    // 👥 Descarga de su Once Inicial real
                    datosRival.onceInicial = dj.onceInicial || null;
                    datosRival.onceCapitan = dj.onceCapitan || null;
                    datosRival.onceEscudo = dj.onceEscudo || pref.avatar_logo || 'ev';
                    datosRival.mejorasJugadores = dj.mejorasJugadores || {};
                }
            }

            // 🎯 Verdad única: consultamos SIEMPRE las victorias oficiales en la tabla victorias_versus
            const { count: victoriasReales } = await supabaseClient
                .from('victorias_versus')
                .select('*', { count: 'exact', head: true })
                .ilike('nombre', n);

            if (victoriasReales !== null && victoriasReales !== undefined) {
                datosRival.partidasGanadas = victoriasReales;
            }

            const uActual = obtenerUsuarioLogueado();
            const miNickActual = (getPref('ev_custom_nick', '') || (uActual ? uActual.name.split(' ')[0] : '')).trim().toLowerCase();
            if (n.toLowerCase() === miNickActual && victoriasReales !== null && victoriasReales !== undefined) {
                userStats.partidasGanadas = victoriasReales;
                guardarStats();
            }
        } catch (e) {
            console.warn("Aviso al cargar perfil de rival:", e);
        }
    }

    window.datosUltimoRivalInspeccionado = datosRival;

    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : '')).trim().toLowerCase();
    const miLigaActual = localStorage.getItem('ev_codigo_liga_amigos');

    let botonDesafiarOnceHTML = '';
    let botonInvitarLigaHTML = '';

    if (n.toLowerCase() !== miNombre) {
        if (datosRival.nivelActual >= 4) {
            botonDesafiarOnceHTML = `
                <button type="button" onclick="iniciarDesafioOnceRivalDirecto()" class="btn-inspect-invite-liga" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.28) 0%, rgba(20, 16, 8, 0.96) 60%, rgba(10, 8, 4, 0.98) 100%) !important; border: 1.5px solid #fbbf24 !important; border-top: 2px solid #fef08a !important; color: #fef08a !important; margin-top: 10px; box-shadow: 0 4px 14px rgba(234, 179, 8, 0.35) !important;">
                    <i class="ph-bold ph-sword"></i> Desafiar a su Once
                </button>
            `;
        } else {
            botonDesafiarOnceHTML = `
                <div style="margin-top: 10px; font-size: 0.74rem; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 8px 14px; border-radius: 12px; border: 1px dashed var(--border-strong); text-align: center; width: 100%; max-width: 340px; box-sizing: border-box;">
                    <i class="ph-bold ph-lock-key" style="color: #fbbf24; vertical-align: middle;"></i> Once en formación (Nivel ${datosRival.nivelActual}/4)
                </div>
            `;
        }
    }

    if (miLigaActual && n.toLowerCase() !== miNombre) {
        botonInvitarLigaHTML = `
            <button type="button" onclick="enviarInvitacionDirectaRival('${sanitizarHTML(miLigaActual)}', '${sanitizarHTML(n)}', this)" class="btn-inspect-invite-liga">
                <i class="ph-bold ph-paper-plane-tilt"></i> Invitar a mi liga (${sanitizarHTML(miLigaActual.replace(/_/g, ' '))})
            </button>
        `;
    }

    body.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div class="fut-card ${datosRival.card_theme}" style="transform:scale(0.92); margin:4px 0 -12px 0;">
                <div class="fut-card-shine"></div>
                <div class="fut-top">
                    <div class="fut-badge-meta">
                        <div class="fut-ovr">${datosRival.ovr}</div>
                        <div class="fut-pos">${datosRival.user_pos}</div>
                        <img src="${obtenerUrlEscudo(datosRival.avatar_logo)}" class="fut-club-icon" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
                    </div>
                    <div class="fut-avatar-container">${generarAvatarHTML(datosRival.avatar_hair, true)}</div>
                </div>
                <div class="fut-name">${sanitizarHTML(datosRival.custom_nick)}</div>
                <div class="fut-stats-row">
                    <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.votosRealizados}</span><span class="fut-stat-label">VOT</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.triviasVistas}</span><span class="fut-stat-label">TRV</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.partidasJugadas}</span><span class="fut-stat-label">PJ</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.partidasGanadas}</span><span class="fut-stat-label">PG</span></div>
                    <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.xpTotal > 999 ? (datosRival.xpTotal/1000).toFixed(1)+'K' : datosRival.xpTotal}</span><span class="fut-stat-label">XP</span></div>
                </div>
            </div>

            <div class="inspect-stats-grid">
                <div class="inspect-stat-pill">
                    <i class="ph-bold ph-shield-star"></i>
                    <span>Nivel</span>
                    <strong>Nivel ${datosRival.nivelActual}</strong>
                </div>
                <div class="inspect-stat-pill">
                    <i class="ph-bold ph-fire" style="color:#ff9f05;"></i>
                    <span>Racha</span>
                    <strong>${datosRival.rachaActual} Días</strong>
                </div>
                <div class="inspect-stat-pill">
                    <i class="ph-bold ph-sword" style="color:#3b82f6;"></i>
                    <span>Victorias</span>
                    <strong>${datosRival.partidasGanadas} PG</strong>
                </div>
            </div>
            ${obtenerBadgeH2HHTML(datosRival.custom_nick)}

            ${botonDesafiarOnceHTML}
            ${botonInvitarLigaHTML}
        </div>
    `;
};


// --- Cierre y Control de Modal Perfil ---

function cerrarModalPerfil(){
    document.getElementById('profile-modal').style.display='none';
    if (window.navOrigenCarrera && typeof abrirModalModoCarrera === 'function') {
        window.navOrigenCarrera = false;
        abrirModalModoCarrera();
    }
}

// --- Catálogo de Temas, Futbolistas, Sobres, Tácticas, Perfil y Logros ---

const TEMAS_LISTA = [
    { k: 'ger', l: 'GER', nombre: 'Alemania' },
    { k: 'ksa', l: 'KSA', nombre: 'Arabia Saudita' },
    { k: 'alg', l: 'ALG', nombre: 'Argelia' },
    { k: 'arg', l: 'ARG', nombre: 'Argentina' },
    { k: 'aus', l: 'AUS', nombre: 'Australia' },
    { k: 'aut', l: 'AUT', nombre: 'Austria' },
    { k: 'bel', l: 'BEL', nombre: 'Bélgica' },
    { k: 'bol', l: 'BOL', nombre: 'Bolivia' },
    { k: 'bra', l: 'BRA', nombre: 'Brasil' },
    { k: 'cmr', l: 'CMR', nombre: 'Camerún' },
    { k: 'can', l: 'CAN', nombre: 'Canadá' },
    { k: 'chi', l: 'CHI', nombre: 'Chile' },
    { k: 'col', l: 'COL', nombre: 'Colombia' },
    { k: 'kor', l: 'KOR', nombre: 'Corea del Sur' },
    { k: 'civ', l: 'CIV', nombre: 'Costa de Marfil' },
    { k: 'crc', l: 'CRC', nombre: 'Costa Rica' },
    { k: 'cro', l: 'CRO', nombre: 'Croacia' },
    { k: 'den', l: 'DEN', nombre: 'Dinamarca' },
    { k: 'ecu', l: 'ECU', nombre: 'Ecuador' },
    { k: 'egy', l: 'EGY', nombre: 'Egipto' },
    { k: 'sco', l: 'SCO', nombre: 'Escocia' },
    { k: 'esp', l: 'ESP', nombre: 'España' },
    { k: 'usa', l: 'USA', nombre: 'Estados Unidos' },
    { k: 'fra', l: 'FRA', nombre: 'Francia' },
    { k: 'wal', l: 'WAL', nombre: 'Gales' },
    { k: 'gha', l: 'GHA', nombre: 'Ghana' },
    { k: 'gre', l: 'GRE', nombre: 'Grecia' },
    { k: 'hon', l: 'HON', nombre: 'Honduras' },
    { k: 'eng', l: 'ENG', nombre: 'Inglaterra' },
    { k: 'irn', l: 'IRN', nombre: 'Irán' },
    { k: 'irl', l: 'IRL', nombre: 'Irlanda' },
    { k: 'ita', l: 'ITA', nombre: 'Italia' },
    { k: 'jam', l: 'JAM', nombre: 'Jamaica' },
    { k: 'jpn', l: 'JPN', nombre: 'Japón' },
    { k: 'mli', l: 'MLI', nombre: 'Malí' },
    { k: 'mar', l: 'MAR', nombre: 'Marruecos' },
    { k: 'mex', l: 'MEX', nombre: 'México' },
    { k: 'nga', l: 'NGA', nombre: 'Nigeria' },
    { k: 'nor', l: 'NOR', nombre: 'Noruega' },
    { k: 'nzl', l: 'NZL', nombre: 'Nueva Zelanda' },
    { k: 'ned', l: 'NED', nombre: 'Países Bajos' },
    { k: 'pan', l: 'PAN', nombre: 'Panamá' },
    { k: 'par', l: 'PAR', nombre: 'Paraguay' },
    { k: 'per', l: 'PER', nombre: 'Perú' },
    { k: 'pol', l: 'POL', nombre: 'Polonia' },
    { k: 'por', l: 'POR', nombre: 'Portugal' },
    { k: 'qat', l: 'QAT', nombre: 'Qatar' },
    { k: 'cze', l: 'CZE', nombre: 'República Checa' },
    { k: 'sen', l: 'SEN', nombre: 'Senegal' },
    { k: 'srb', l: 'SRB', nombre: 'Serbia' },
    { k: 'rsa', l: 'RSA', nombre: 'Sudáfrica' },
    { k: 'swe', l: 'SWE', nombre: 'Suecia' },
    { k: 'sui', l: 'SUI', nombre: 'Suiza' },
    { k: 'tun', l: 'TUN', nombre: 'Túnez' },
    { k: 'tur', l: 'TUR', nombre: 'Turquía' },
    { k: 'ukr', l: 'UKR', nombre: 'Ucrania' },
    { k: 'uru', l: 'URU', nombre: 'Uruguay' },
    { k: 'ven', l: 'VEN', nombre: 'Venezuela' }
];

window.cambiarTemaPaso = function(direccion) {
    const input = document.getElementById('card-theme-input');
    const badge = document.getElementById('theme-current-badge');
    if (!input) return;
    let valActual = input.value || 'arg';
    let idx = TEMAS_LISTA.findIndex(t => t.k === valActual);
    if (idx === -1) idx = 0;
    idx = (idx + direccion + TEMAS_LISTA.length) % TEMAS_LISTA.length;
    const nuevo = TEMAS_LISTA[idx];
    input.value = nuevo.k;
    if (badge) {
        badge.className = `theme-dot td-${nuevo.k} active`;
        badge.dataset.tema = nuevo.k;
    }
    previsualizarTema(nuevo.k);
};

window.toggleCustomization=function(){
    const panel=document.getElementById('customization-panel-wrapper');
    const btn=document.getElementById('btn-toggle-custom');
    if (!panel) return;
    const isOpen = panel.classList.toggle('open');
    if (btn) {
        btn.classList.toggle('active-panel', isOpen);
        const flecha = isOpen ? '▲' : '▼';
        btn.innerHTML = `<img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> <span class="btn-custom-text-desktop">PERSONALIZÁ TU CARTA ${flecha}</span><span class="btn-custom-text-mobile">EDITAR ${flecha}</span>`;
    }
};
const AVATARES_LISTA = [
    // 🌟 BASE INICIAL DISPONIBLE (NIVEL 0: 7 TITULARES + DT SCALONI)
    { id: '24.webp', label: 'El Guardián', nivel: 0 },       // Dibu Martínez (POR)
    { id: '55.webp', label: 'Yerry', nivel: 0 },             // Yerry Mina (DFC)
    { id: '61.webp', label: 'El Pitbull', nivel: 0 },        // Gary Medel (LD)
    { id: '21.webp', label: 'El Muro', nivel: 0 },           // Nicolás Otamendi (DFC)
    { id: '12.webp', label: 'El Halcón', nivel: 0 },         // Fede Valverde (MC)
    { id: '13.webp', label: 'El Timón', nivel: 0 },          // Casemiro (MCD)
    { id: '7.webp', label: 'El Canario', nivel: 0 },         // Vinicius Jr (EI)
    { id: '45.webp', label: 'El Estratega', nivel: 0 },      // Lionel Scaloni (DT)

    // ⚡ NIVELES 1 A 4 (COMPLETA TU 11 TITULAR PARA MODO CARRERA)
    { id: '18.webp', label: 'El Motorcito', nivel: 1 },      // Rodrigo De Paul (MC - 8° jugador)
    { id: '16.webp', label: 'El Mariscal', nivel: 2 },       // Cuti Romero (DFC - 9° jugador)
    { id: '9.webp', label: 'El Mosquito', nivel: 3 },        // Dembélé (ED - 10° jugador)
    { id: '20.webp', label: 'El Toro', nivel: 4 },          // Lautaro Martínez (DC - ¡11° JUGADOR! EQUIPO COMPLETO 🔥)

    // 🔥 NIVELES 5 A 10 (ESTRELLAS DE RECAMBIO Y EVOLUCIÓN)
    { id: '17.webp', label: 'El Heredero', nivel: 5 },       // Enzo Fernández
    { id: '19.webp', label: 'La Araña', nivel: 6 },          // Julián Álvarez
    { id: '22.webp', label: 'El Carnicero', nivel: 7 },      // Lisandro Martínez
    { id: '23.webp', label: 'Alexis', nivel: 8 },            // Alexis Mac Allister
    { id: '51.webp', label: 'El Guajiro', nivel: 9 },        // Luis Díaz
    { id: 'Alejandro Garnacho.webp', label: 'El Bichito', nivel: 10 },

    // 🔥 NIVELES 11 A 20 (ELITE INTERNACIONAL)
    { id: '8.webp', label: 'La Muralla', nivel: 11 },
    { id: 'Cole Palmer.webp', label: 'Cold Palmer', nivel: 11 },
    { id: '10.webp', label: 'Hurricane', nivel: 12 },
    { id: 'Lamine Yamal.webp', label: 'La Joya', nivel: 12 },
    { id: '11.webp', label: 'Golden Boy', nivel: 13 },
    { id: 'Florian Wirtz.webp', label: 'El Prodigio', nivel: 13 },
    { id: '14.webp', label: 'Gigio', nivel: 14 },
    { id: 'Phil Foden.webp', label: 'The Sniper', nivel: 14 },
    { id: 'Bukayo Saka.webp', label: 'Starboy', nivel: 14 },
    { id: 'Guilermo memo Ochoa.webp', label: 'Memo', nivel: 14 },
    { id: '15.webp', label: 'El Fideo', nivel: 15 },
    { id: 'Eduardo Camavinga.webp', label: 'El Todoterreno', nivel: 15 },
    { id: '26.webp', label: 'El Kun', nivel: 16 },
    { id: 'William Saliba.webp', label: 'La Muralla Francesa', nivel: 16 },
    { id: '36.webp', label: 'El Matador', nivel: 17 },
    { id: 'Jamal Musiala.webp', label: 'Bambi', nivel: 17 },
    { id: 'Raphinha.webp', label: 'El Rayo Carioca', nivel: 17 },
    { id: '52.webp', label: 'El 10 Cafetero', nivel: 18 },
    { id: 'Son Heung-min.webp', label: 'Sonny', nivel: 18 },
    { id: 'Declan Rice.webp', label: 'El General', nivel: 18 },
    { id: '53.webp', label: 'El Tigre', nivel: 19 },
    { id: 'Alisson Becker.webp', label: 'El Santo Brasileño', nivel: 19 },
    { id: '59.webp', label: 'Niño Maravilla', nivel: 20 },

    // 🚀 NIVELES 21 A 30 (CRACKS, CAPITANES & TÉCNICOS)
    { id: '5.webp', label: 'El Androide', nivel: 21 },
    { id: '4.webp', label: 'Kiki', nivel: 22 },
    { id: 'Jordi Alba.webp', label: 'La Flecha', nivel: 22 },
    { id: '6.webp', label: 'Ousadia', nivel: 23 },
    { id: '37.webp', label: 'El Gladiador', nivel: 24 },
    { id: 'Antoine Griezmann.webp', label: 'El Principito', nivel: 24 },
    { id: '35.webp', label: 'El Pistolero', nivel: 25 },
    { id: '60.webp', label: 'Capitán América', nivel: 26 },
    { id: '54.webp', label: 'El Candado', nivel: 27 },
    { id: 'Marco Reus.webp', label: 'Woodyinho', nivel: 27 },
    { id: '48.webp', label: 'El Muñeco', nivel: 29 },
    { id: '46.webp', label: 'El Filósofo', nivel: 30 },

    // 🏆 NIVELES 31 A 40 (REFERENTES & CRISTIANO RONALDO)
    { id: '38.webp', label: 'El Relojito', nivel: 31 },
    { id: '43.webp', label: 'El Francotirador', nivel: 32 },
    { id: 'Gerard Pique.webp', label: 'Piquenbauer', nivel: 32 },
    { id: 'Diego Simeone.webp', label: 'El Cholo', nivel: 33 },
    { id: '42.webp', label: 'Mago Balcánico', nivel: 33 },
    { id: '58.webp', label: 'El Rey Arturo', nivel: 34 },
    { id: '27.webp', label: 'El Apache', nivel: 35 },
    { id: 'Jurgen Klopp.webp', label: 'Jürgen', nivel: 35 },
    { id: '49.webp', label: 'Special One', nivel: 36 },
    { id: '47.webp', label: 'Carletto', nivel: 37 },
    { id: 'Virgil Van Dijk.webp', label: 'El Titán', nivel: 37 },
    { id: '41.webp', label: 'El León Sueco', nivel: 38 },
    { id: 'Mohamed Salah.webp', label: 'El Faraón', nivel: 38 },
    { id: '3.webp', label: 'O Menino', nivel: 39 },
    { id: '2.webp', label: 'El Bicho', nivel: 40 },

    // 👑 NIVELES 41 A 50 (MAGOS & LIONEL MESSI)
    { id: '39.webp', label: 'El Arquitecto', nivel: 41 },
    { id: 'Kevin De Bruyne.webp', label: 'El Mago Rubio', nivel: 41 },
    { id: '40.webp', label: 'El Ilusionista', nivel: 42 },
    { id: 'Thomas Muller.webp', label: 'Raumdeuter', nivel: 42 },
    { id: '44.webp', label: 'El Maestro', nivel: 43 },
    { id: 'Robert Lewandoski.webp', label: 'La Máquina', nivel: 43 },
    { id: '29.webp', label: 'La Brujita', nivel: 44 },
    { id: '28.webp', label: 'El Torero', nivel: 45 },
    { id: 'Manuel Neuer.webp', label: 'El Muro Bávaro', nivel: 46 },
    { id: '34.webp', label: 'Il Pendolino', nivel: 46 },
    { id: '33.webp', label: 'El Hombre Bala', nivel: 47 },
    { id: 'Marcelo.webp', label: 'La Magia Carioca', nivel: 48 },
    { id: '50.webp', label: 'Mago de Marsella', nivel: 48 },
    { id: '31.webp', label: 'Dinho', nivel: 49 },
    { id: '1.webp', label: 'La Pulga', nivel: 50 },

    // 🌌 NIVELES 51 A 60 (LEYENDAS HISTÓRICAS & MARADONA)
    { id: '56.webp', label: 'El Escorpión', nivel: 51 },
    { id: '57.webp', label: 'El Pibe', nivel: 52 },
    { id: 'Diego Forlán.webp', label: 'Cachavacha', nivel: 53 },
    { id: '62.webp', label: 'Bam-Bam', nivel: 54 },
    { id: 'Rafa Marquez.webp', label: 'Káiser de Michoacán', nivel: 55 },
    { id: '63.webp', label: 'Gran Matador', nivel: 56 },
    { id: 'Javier Zanetti.webp', label: 'El Pupi', nivel: 57 },
    { id: '32.webp', label: 'El Fenómeno', nivel: 58 },
    { id: '30.webp', label: 'O Rei', nivel: 59 },
    { id: '25.webp', label: 'El Barrilete', nivel: 60 },

    // 💎 NIVELES 61 A 85 (ÉLITE CLÁSICA, BALONES DE ORO & DTs DE LEYENDA)
    { id: '64.webp', label: 'Tiburón', nivel: 61 },
    { id: '65.webp', label: 'El Santo', nivel: 62 },
    { id: 'Philip Lahm.webp', label: 'El Reloj Alemán', nivel: 63 },
    { id: '66.webp', label: 'Sir David', nivel: 64 },
    { id: 'Rio Ferdinand.webp', label: 'El Káiser Inglés', nivel: 65 },
    { id: '67.webp', label: 'El Príncipe', nivel: 66 },
    { id: 'Steven Gerard.webp', label: 'Stevie G', nivel: 67 },
    { id: '68.webp', label: 'Superman', nivel: 68 },
    { id: 'Didier Drogba.webp', label: 'El Elefante', nivel: 69 },
    { id: '69.webp', label: 'Il Capitano', nivel: 70 },
    { id: '70.webp', label: 'Pepo', nivel: 71 },
    { id: '71.webp', label: 'Tití', nivel: 72 },
    { id: 'Wayne Rooney.webp', label: 'Bad Boy', nivel: 73 },
    { id: '72.webp', label: 'El Eterno', nivel: 74 },
    { id: '73.webp', label: 'Fútbol Total', nivel: 75 },
    { id: 'Alessandro del piero.webp', label: 'Pinturicchio', nivel: 76 },
    { id: 'Luis Figo.webp', label: 'El Extremo de Oro', nivel: 78 },
    { id: 'Xabi Alonso.webp', label: 'La Brújula', nivel: 80 },
    { id: 'Firefly (3).webp', label: 'El Tulipán Negro', nivel: 82 },
    { id: 'Alex Ferguson.webp', label: 'Sir Alex', nivel: 85 }
];

function obtenerNombreAvatar(id) {
    const idLimpio = (id || '').replace(/\.png$/i, '.webp');
    const item = AVATARES_LISTA.find(a => a.id === idLimpio);
    return item ? item.label : 'El Canario';
}

// 📋 Diccionario Oficial de Directores Técnicos
const AVATARES_DTS = new Set([
    '45.webp',              // El Estratega (Lionel Scaloni)
    '48.webp',              // El Muñeco (Marcelo Gallardo)
    '46.webp',              // El Filósofo (Pep Guardiola)
    'Diego Simeone.webp',   // El Cholo (Diego Simeone)
    'Jurgen Klopp.webp',    // Jürgen (Jürgen Klopp)
    '49.webp',              // Special One (José Mourinho)
    '47.webp',              // Carletto (Carlo Ancelotti)
    'Alex Ferguson.webp'    // Sir Alex (Alex Ferguson)
]);
window.AVATARES_DTS = AVATARES_DTS;

function esAvatarDT(id) {
    if (!id) return false;
    const cleanId = String(id).replace(/\.png$/i, '.webp').trim();
    return AVATARES_DTS.has(cleanId);
}
window.esAvatarDT = esAvatarDT;

/* ==========================================================================
   🎁 LÓGICA DE SOBRE DE BIENVENIDA Y DESBLOQUEOS POR NIVEL
   ========================================================================== */

// 🔊 Efecto sonoro de apertura nativo (sin archivos externos para máxima rapidez)
function reproducirSonidoApertura() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch(e) {}
}

// 📦 1. Verificación tras completar o abandonar la primera partida al volver a la pantalla principal
function verificarSobreBienvenidaPostPartida() {
    const id = getUserId();
    // Candado estricto: si ya se abrió en esta cuenta O en este navegador, queda bloqueado para siempre
    const sobreYaAbierto = localStorage.getItem('ev_pack_bienvenida_abierto_' + id) || localStorage.getItem('ev_pack_bienvenida_abierto_global');
    
    // Detecta si completó la partida O si la abandonó antes de terminar
    const jugoOAbandono = localStorage.getItem('ev_primera_partida_finalizada_' + id) || 
                          localStorage.getItem('ev_primera_partida_finalizada_global') ||
                          localStorage.getItem('ev_primera_partida_iniciada_' + id) ||
                          localStorage.getItem('ev_primera_partida_iniciada_global');

    // Si ya tuvo contacto con el juego y aún no abrió su sobre de bienvenida
    if (jugoOAbandono && !sobreYaAbierto) {
        setTimeout(() => {
            // Chequear que el usuario realmente esté en la interfaz principal sin otros modales encima
            const rankingModal = document.getElementById('ranking-modal');
            const videoModal = document.getElementById('video-modal');
            const orderModal = document.getElementById('order-modal');
            const ligaModal = document.getElementById('liga-amigos-modal');

            const algunModalAbierto = (rankingModal && rankingModal.style.display === 'flex') ||
                                      (videoModal && videoModal.style.display === 'flex') ||
                                      (orderModal && orderModal.style.display === 'flex') ||
                                      (ligaModal && ligaModal.style.display === 'flex');

            if (!algunModalAbierto) {
                const modal = document.getElementById('modal-pack-bienvenida');
                if (modal) modal.style.display = 'flex';
            }
        }, 350);
    }
}

window.voltearCartaPick = function(elemento, avatarId) {
    if (!elemento.classList.contains('is-flipped')) {
        reproducirSonidoApertura();
        elemento.classList.add('is-flipped');
    } else {
        seleccionarCapitanInicial(avatarId);
    }
};

window.cerrarSobreBienvenida = function() {
    const modal = document.getElementById('modal-pack-bienvenida');
    if (modal) modal.style.display = 'none';
};

// 💥 2. Animación al tocar "Abrir Sobre"
function animarAperturaSobre() {
    reproducirSonidoApertura();
    const sobre = document.getElementById('ev-pack-cerrado');
    sobre.classList.add('ev-pack-abriendo');

    setTimeout(() => {
        sobre.style.display = 'none';
        dispararEfectoPackOpening();
        const contenedorGrilla = document.getElementById('ev-pack-grilla-iniciales');
        contenedorGrilla.innerHTML = '';

        // Filtrar los 6 jugadores de Nivel 0
        const iniciales = AVATARES_LISTA.filter(a => a.nivel === 0);
        iniciales.forEach(jugador => {
            const item = document.createElement('div');
            item.className = 'ev-card-pick';
            item.setAttribute('onclick', `voltearCartaPick(this, '${jugador.id}')`);
            item.innerHTML = `
                <div class="ev-card-pick-inner">
                    <!-- DORSO (TOCAR PARA REVELAR) -->
                    <div class="ev-card-pick-back">
                        <div class="ev-card-back-pattern"></div>
                        <img src="logo-cartas.webp" class="ev-card-back-logo" alt="EV">
                        <span class="ev-card-back-text">TOCÁ</span>
                    </div>
                    <!-- FRENTE (JUGADOR REVELADO) -->
                    <div class="ev-card-pick-front">
                        <div class="ev-card-pick-avatar-wrap">
                            <img src="${jugador.id}" alt="${jugador.label}">
                        </div>
                        <span class="ev-card-pick-name">${jugador.label}</span>
                        <div class="ev-card-pick-btn">ELEGIR</div>
                    </div>
                </div>
            `;
            contenedorGrilla.appendChild(item);
        });

        document.getElementById('ev-pack-revelado').style.display = 'block';
    }, 1100);
}

// 👑 3. Selección del Capitán Inicial
function seleccionarCapitanInicial(avatarId) {
    const id = getUserId();
    // 1. Guardar en almacenamiento y en la preferencia nativa exacta del juego vinculada al usuario
    localStorage.setItem('ev_avatar_seleccionado_' + id, avatarId);
    localStorage.setItem('ev_pack_bienvenida_abierto_' + id, 'true');
    localStorage.setItem('ev_pack_bienvenida_abierto_global', 'true'); // Candado definitivo: nunca más vuelve a abrirse
    setPref('ev_avatar_hair', avatarId);

    // 2. Sincronizar el input de personalización del perfil si está en pantalla
    const hairInput = document.getElementById('avatar-hair-input');
    if (hairInput) {
        hairInput.value = avatarId;
    }

    // 3. Renderizar el avatar directamente dentro del contenedor oficial de la carta FUT
    const futContainer = document.getElementById('fut-avatar-live-container');
    if (futContainer) {
        futContainer.innerHTML = generarAvatarHTML(avatarId);
    }

    // 4. Ejecutar la función nativa de actualización en vivo de la carta
    if (typeof actualizarAvatarLive === 'function') {
        actualizarAvatarLive();
    }

    // 5. Redibujar el botón de perfil con el nuevo avatar en la barra superior
    if (typeof renderizarBotonLogin === 'function') {
        renderizarBotonLogin();
    }

    // 6. Persistir en estadísticas y sincronizar con la nube
    guardarStats();

    // 7. Cerrar el sobre de bienvenida y confirmar
    const modal = document.getElementById('modal-pack-bienvenida');
    if (modal) modal.style.display = 'none';

    showToast(`¡Elegiste a ${obtenerNombreAvatar(avatarId)} como tu capitán! `, 'ph-check-circle', 'success');
}

window.voltearCartaPremio = function(el) {
    if (!el.classList.contains('is-flipped')) {
        reproducirSonidoApertura();
        el.classList.add('is-flipped');
        if (typeof lanzarConfetti === 'function') setTimeout(() => lanzarConfetti('oro'), 240);
        const actions = document.getElementById('ev-reward-actions-box');
        if (actions) actions.style.display = 'flex';
    }
};

// 🏆 4. Verificador de Recompensa al Subir de Nivel
function comprobarRecompensaNivel(nivelActual) {
    const id = getUserId();
    const nivelNum = Number(nivelActual);
    const recompensasVistas = JSON.parse(localStorage.getItem('ev_recompensas_vistas_' + id) || '[]');

    // Buscar el primer avatar desbloqueado que aún no se le haya presentado en pantalla
    const nuevoFichaje = AVATARES_LISTA.find(a => a.nivel > 0 && a.nivel <= nivelNum && !recompensasVistas.includes(a.id));
    if (!nuevoFichaje) return;

    // Registrar como visto para este usuario para no repetir alerta
    recompensasVistas.push(nuevoFichaje.id);
    localStorage.setItem('ev_recompensas_vistas_' + id, JSON.stringify(recompensasVistas));

    const cardBox = document.getElementById('ev-reward-card-box');
    if (cardBox) cardBox.classList.remove('is-flipped');

    const actionsBox = document.getElementById('ev-reward-actions-box');
    if (actionsBox) actionsBox.style.display = 'none';

    document.getElementById('ev-reward-level-tag').textContent = `¡NIVEL ${nuevoFichaje.nivel} ALCANZADO!`;
    document.getElementById('ev-reward-img').src = nuevoFichaje.id;
    document.getElementById('ev-reward-name').textContent = nuevoFichaje.label;

    const btnEquipar = document.getElementById('ev-btn-equipar-premio');
    btnEquipar.onclick = () => {
        seleccionarCapitanInicial(nuevoFichaje.id);
        cerrarModalRecompensa();
    };

    document.getElementById('modal-recompensa-avatar').style.display = 'flex';
    dispararEfectoPackOpening();
}

function cerrarModalRecompensa() {
    document.getElementById('modal-recompensa-avatar').style.display = 'none';

    // Si hubo más de un fichaje desbloqueado en la misma subida de nivel, abre el siguiente
    setTimeout(() => {
        if (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) {
            comprobarRecompensaNivel(userStats.nivelActual);
        }
    }, 350);
}

// El sobre de bienvenida ahora se activa únicamente al finalizar la primera partida

function obtenerNivelAvatar(id) {
    const idLimpio = (id || '').replace(/\.png$/i, '.webp');
    const item = AVATARES_LISTA.find(a => a.id === idLimpio);
    return (item && item.nivel !== undefined) ? item.nivel : 0;
}

window.cambiarAvatarPaso = function(direccion) {
    const input = document.getElementById('avatar-hair-input');
    if (!input) return;
    let valActual = (input.value || '1.webp').replace(/\.png$/i, '.webp');
    let idx = AVATARES_LISTA.findIndex(a => a.id === valActual);
    if (idx === -1) idx = 0;
    idx = (idx + direccion + AVATARES_LISTA.length) % AVATARES_LISTA.length;
    const nuevo = AVATARES_LISTA[idx];
    input.value = nuevo.id;
    actualizarAvatarLive();
};

window.abrirModalSelectorAvatar = function() {
    const m = document.getElementById('avatar-selector-modal');
    if (!m) return;
    m.style.display = 'flex';
    renderizarAvataresGrid();
};

window.cerrarModalSelectorAvatar = function() {
    const m = document.getElementById('avatar-selector-modal');
    if (m) m.style.display = 'none';
};

function renderizarAvataresGrid() {
    const container = document.getElementById('avatares-grid-container');
    const subInfo = document.getElementById('avatar-modal-sub-info');
    if (!container) return;

    const actual = (document.getElementById('avatar-hair-input')?.value || '1.webp').replace(/\.png$/i, '.webp');
    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    const desbloqueadosCount = AVATARES_LISTA.filter(a => miNivel >= a.nivel).length;

    if (subInfo) {
        subInfo.innerHTML = `Tu rango: <b>Nivel ${miNivel}</b> · Desbloqueados: <b style="color:var(--accent-color);">${desbloqueadosCount} / ${AVATARES_LISTA.length}</b>`;
    }

    container.innerHTML = AVATARES_LISTA.map(item => {
        const isSel = item.id === actual;
        const isLocked = miNivel < item.nivel;
        
        let overlayHTML = '';
        if (isLocked) {
            overlayHTML = `
            <div class="avatar-grid-lock-mask">
                <i class="ph-fill ph-lock-key"></i>
                <span>NV. ${item.nivel}</span>
            </div>`;
        }

        return `
        <div class="avatar-grid-card ${isSel ? 'selected' : ''} ${isLocked ? 'locked' : 'unlocked'}" 
             onclick="seleccionarAvatarDirecto('${item.id}', ${item.nivel})">
            <div class="avatar-grid-img-wrap">
                <img src="${item.id}" alt="${item.label}" class="${isLocked ? 'avatar-locked-blur' : ''}" decoding="async" loading="lazy">
                ${overlayHTML}
            </div>
            <span>${item.label}</span>
        </div>`;
    }).join('');
}

window.seleccionarAvatarDirecto = function(id, nivelReq) {
    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (miNivel < nivelReq) {
        showToast(`¡Este futbolista se desbloquea en el Nivel ${nivelReq}! 🔒`, 'ph-lock-key', 'warning');
        return;
    }

    const input = document.getElementById('avatar-hair-input');
    if (input) input.value = id;
    actualizarAvatarLive();
    cerrarModalSelectorAvatar();
};



const POSICIONES_NOMBRES = {
    'POR': 'Arquero', 'DFC': 'Defensor Central', 'LD': 'Lateral Der.', 'LI': 'Lateral Izq.',
    'MCD': 'Medio Defensivo', 'MC': 'Mediocentro', 'MCO': 'Medio Ofensivo', 'MI': 'Medio Izq.',
    'MD': 'Medio Der.', 'EI': 'Extremo Izq.', 'ED': 'Extremo Der.', 'SD': 'Segundo Del.',
    'DC': 'Delantero', 'DT': 'Director Técnico'
};

// 📋 FORMACIONES_TACTICAS migrado a: js/carrera.js

// (Variables de formación táctica declaradas arriba)

window.cambiarFormacionTactica = function(fKey) {
    if (!FORMACIONES_TACTICAS[fKey]) return;
    formacionTacticaActual = fKey;
    nodoPosicionSeleccionadoIdx = null;
    renderizarCanchaTactica();
};

window.renderizarCanchaTactica = function() {
    const container = document.getElementById('pitch-tactical-nodes');
    const tabs = document.querySelectorAll('.pitch-form-tab');
    if (!container) return;

    const f = FORMACIONES_TACTICAS[formacionTacticaActual] || FORMACIONES_TACTICAS['4-3-3'];
    const posActual = document.getElementById('avatar-pos-input')?.value || 'DC';

    tabs.forEach(t => t.classList.toggle('active', t.dataset.form === formacionTacticaActual));

    if (posActual === 'DT') {
        nodoPosicionSeleccionadoIdx = -1;
    } else {
        if (nodoPosicionSeleccionadoIdx === null || nodoPosicionSeleccionadoIdx < 0 || !f.posiciones[nodoPosicionSeleccionadoIdx] || f.posiciones[nodoPosicionSeleccionadoIdx].pos !== posActual) {
            const idxGuardado = parseInt(getPref('ev_user_pos_idx', '-1'));
            if (idxGuardado >= 0 && f.posiciones[idxGuardado] && f.posiciones[idxGuardado].pos === posActual) {
                nodoPosicionSeleccionadoIdx = idxGuardado;
            } else {
                const foundIdx = f.posiciones.findIndex(p => p.pos === posActual);
                nodoPosicionSeleccionadoIdx = foundIdx !== -1 ? foundIdx : 0;
            }
        }
    }

    container.innerHTML = f.posiciones.map((item, idx) => {
        const isSel = (posActual !== 'DT') && (idx === nodoPosicionSeleccionadoIdx);
        return `<button type="button" class="pitch-pos-node ${isSel ? 'active' : ''}" data-pos="${item.pos}" style="top: ${item.top}; left: ${item.left};" onclick="seleccionarPosicionCancha('${item.pos}', ${idx})">${item.pos}</button>`;
    }).join('');

    const dtBtn = document.querySelector('.dt-node');
    if (dtBtn) dtBtn.classList.toggle('active', posActual === 'DT');
};

window.togglePitchPicker = function(el) {
    const pitchContainer = document.getElementById('pitch-picker-dropdown');
    const chev = el ? el.querySelector('.pitch-chevron') : document.querySelector('.pitch-chevron');
    if (pitchContainer) {
        const isOpen = pitchContainer.classList.toggle('open');
        if (chev) chev.className = isOpen ? 'ph-bold ph-caret-up pitch-chevron' : 'ph-bold ph-caret-down pitch-chevron';
        if (isOpen) renderizarCanchaTactica();
    }
};

window.seleccionarPosicionCancha = function(pos, idx = null) {
    const input = document.getElementById('avatar-pos-input');
    const label = document.getElementById('pitch-pos-selected-name');
    const headerPreview = document.getElementById('pitch-header-preview');
    const textoCompleto = `${pos} — ${POSICIONES_NOMBRES[pos] || pos}`;
    if (input) input.value = pos;
    if (label) label.textContent = textoCompleto;
    if (headerPreview) headerPreview.textContent = pos;

    if (pos === 'DT') {
        nodoPosicionSeleccionadoIdx = -1;
        setPref('ev_user_pos_idx', -1);
    } else {
        if (idx !== null) {
            nodoPosicionSeleccionadoIdx = idx;
            setPref('ev_user_pos_idx', idx);
        }
        const actual = FORMACIONES_TACTICAS[formacionTacticaActual];
        const estaEnActual = actual && actual.posiciones.some(p => p.pos === pos);
        if (!estaEnActual) {
            for (let k in FORMACIONES_TACTICAS) {
                const found = FORMACIONES_TACTICAS[k].posiciones.findIndex(p => p.pos === pos);
                if (found !== -1) {
                    formacionTacticaActual = k;
                    nodoPosicionSeleccionadoIdx = found;
                    setPref('ev_user_pos_idx', found);
                    break;
                }
            }
        }
    }

    renderizarCanchaTactica();
    actualizarAvatarLive();
};

window.actualizarAvatarLive = function() {
    const hInput = document.getElementById('avatar-hair-input');
    const hLabel = document.getElementById('avatar-hair-label');

    if (hInput) {
        const imgId = hInput.value || '1.webp';
        const container = document.getElementById('fut-avatar-live-container');
        if (container) { container.innerHTML = generarAvatarHTML(imgId); }

        if (hLabel) {
            hLabel.innerHTML = `<span>${obtenerNombreAvatar(imgId)}</span> <i class="ph-bold ph-magnifying-glass" style="color:var(--accent-color); font-size:0.85rem; flex-shrink:0;"></i>`;
        }
    }

    const posInput = document.getElementById('avatar-pos-input');
    if(posInput) { const futPos = document.getElementById('fut-pos-display');if(futPos) futPos.textContent = posInput.value; }
    const logoInput = document.getElementById('avatar-logo-input');
    if(logoInput) { 
        const futClub = document.getElementById('fut-club-display');
        if(futClub) {
            futClub.src = obtenerUrlEscudo(logoInput.value);
            futClub.setAttribute('referrerpolicy', 'no-referrer');
        }
    }
};

// 🛡️ VALIDADOR GLOBAL DE UNICIDAD DE APODOS (RESERVA HISTÓRICA TOTAL)
async function verificarApodoDisponible(apodoBuscado) {
    if (!supabaseClient || !apodoBuscado) return true;
    const apodoLimpio = apodoBuscado.trim();
    if (!apodoLimpio) return false;

    const u = obtenerUsuarioLogueado();
    const miEmail = (u && u.email) ? u.email.trim().toLowerCase() : '';
    const miId = getUserId();
    const apodoLower = apodoLimpio.toLowerCase();

    try {
        // 1. Verificamos en la tabla de rankings históricos (todos los modos y ligas)
        const { data: filasRanking, error: errRanking } = await supabaseClient
            .from('ranking')
            .select('nombre')
            .ilike('nombre', apodoLimpio)
            .limit(50);

        if (!errRanking && filasRanking && filasRanking.length > 0) {
            for (const fila of filasRanking) {
                if ((fila.nombre || '').trim().toLowerCase() === apodoLower) {
                    const emailFila = (fila.email || '').trim().toLowerCase();
                    // Si el apodo pertenece a tu misma cuenta de Google, te lo permite conservar
                    if (miEmail && emailFila && emailFila === miEmail) {
                        continue;
                    }
                    return false; // Ya fue utilizado históricamente en el ranking
                }
            }
        }

        // 2. Verificamos en los perfiles guardados de la nube (inspección directa en memoria)
        try {
            const { data: perfilesNube } = await supabaseClient
                .from('perfiles')
                .select('id_usuario, datos_juego');

            if (perfilesNube && perfilesNube.length > 0) {
                for (const p of perfilesNube) {
                    const nickGuardado = (p.datos_juego?.preferencias?.custom_nick || '').trim().toLowerCase();
                    if (nickGuardado === apodoLower) {
                        if (miId !== 'guest' && p.id_usuario === miId) {
                            continue; // Es tu propio perfil autenticado
                        }
                        return false; // Apodo reservado por un perfil de la nube
                    }
                }
            }
        } catch (e) {
            console.warn("Aviso al comprobar perfiles:", e);
        }

        // 3. Verificamos en historiales de duelos 1 vs 1 (victorias y derrotas)
        try {
            const [{ data: victorias }, { data: derrotas }] = await Promise.all([
                supabaseClient.from('victorias_versus').select('nombre, id_usuario').ilike('nombre', apodoLimpio).limit(20),
                supabaseClient.from('derrotas_versus').select('nombre, id_usuario').ilike('nombre', apodoLimpio).limit(20)
            ]);

            const partidasVersus = [...(victorias || []), ...(derrotas || [])];
            for (const partida of partidasVersus) {
                if ((partida.nombre || '').trim().toLowerCase() === apodoLower) {
                    if (miId !== 'guest' && partida.id_usuario === miId) {
                        continue;
                    }
                    return false; // Registrado en duelos 1v1 históricos
                }
            }
        } catch (e) {}

        return true; // Apodo 100% disponible
    } catch (err) {
        console.error("Error al validar disponibilidad del apodo:", err);
        return true;
    }
}

async function guardarPersonalizacion(){
    const u = obtenerUsuarioLogueado();
    const nickViejo = getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Anónimo');
    
    const nickInput = document.getElementById('avatar-nick-input');
    let nickNuevo = nickViejo;
    if (nickInput && nickInput.value.trim() !== '') {
        nickNuevo = nickInput.value.trim().substring(0, 16);
    }

    // 🔒 Si el usuario intenta cambiar el apodo o asignar uno nuevo, se valida disponibilidad
    if (nickNuevo.toLowerCase() !== nickViejo.toLowerCase()) {
        const disponible = await verificarApodoDisponible(nickNuevo);
        if (!disponible) {
            showToast(`El apodo "${nickNuevo}" ya pertenece a otro jugador. Elegí otro 🚫`, 'ph-warning-circle', 'danger');
            if (nickInput) nickInput.value = nickViejo;
            const futName = document.getElementById('fut-name-display');
            if (futName) futName.textContent = nickViejo || (u ? u.name.split(' ')[0] : 'Jugador');
            return;
        }
    }

    // 1. Guardado inmediato e incondicional de todos los atributos
    const posSelect = document.getElementById('avatar-pos-input');
    if (posSelect) {
        setPref('ev_user_pos', posSelect.value);
        const futPos = document.getElementById('fut-pos-display');
        if (futPos) futPos.textContent = posSelect.value;
    }

    const themeInput = document.getElementById('card-theme-input');
    if (themeInput) {
        setPref('ev_card_theme', themeInput.value);
    }
    
    setPref('ev_custom_nick', nickNuevo);
    const futName = document.getElementById('fut-name-display');
    if (futName) {
        futName.textContent = nickNuevo || (u ? u.name.split(' ')[0] : 'Jugador');
    }
    if (nickNuevo) {
        cacheAvataresUsuarios[nickNuevo.toLowerCase()] = document.getElementById('avatar-hair-input')?.value || '1.webp';
    }
    
    const hairInput = document.getElementById('avatar-hair-input');
    if (hairInput) {
        const nivelReq = obtenerNivelAvatar(hairInput.value);
        const nivelUser = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
        if (nivelUser < nivelReq) {
            showToast(`¡Este futbolista se desbloquea en el Nivel ${nivelReq}! Seguí sumando XP 🔒`, 'ph-lock-key', 'warning');
            return;
        }
        setPref('ev_avatar_hair', hairInput.value);
        localStorage.setItem('ev_avatar_seleccionado_' + getUserId(), hairInput.value);
    }

    const logoInput = document.getElementById('avatar-logo-input');
    if (logoInput) setPref('ev_avatar_logo', logoInput.value);

    // 2. Refresco en vivo de la carta e interfaz
    actualizarAvatarLive();
    renderizarBotonLogin();
    ancestralHeaderNivel();
    guardarStats(); 

    const futOvr = document.querySelector('.fut-ovr');
    if (futOvr) {
        const n = NIVELES[calcularNivelIdx(userStats.xpTotal)];
        futOvr.textContent = n.ovr;
    }

    const cardEl = document.getElementById('fut-card-main');
    if (cardEl) {
        let th = getPref('ev_card_theme', 'arg');
        const validThemes = TEMAS_LISTA.map(t => t.k);
        if (!validThemes.includes(th)) th = 'arg';
        cardEl.className = 'fut-card ' + th;
    }

    if (document.getElementById('customization-panel-wrapper')?.classList.contains('open')) {
        toggleCustomization();
    }

    showToast('¡Personalización guardada! 🎉', 'ph-check-circle', 'success');

    // 3. Sincronización asíncrona de apodo en TODOS los rankings y ligas
        if (nickViejo.toLowerCase() !== nickNuevo.toLowerCase() && typeof supabaseClient !== 'undefined' && supabaseClient) {
            actualizarApodoEnTodoElSistema(nickViejo, nickNuevo);
        }
    }

async function actualizarApodoEnTodoElSistema(nickViejo, nickNuevo) {
    if (!supabaseClient || !nickNuevo) return;
    const u = obtenerUsuarioLogueado();
    const miEmail = (u && u.email) ? u.email.trim() : '';
    const idUser = getUserId();
    const vLimpio = (nickViejo || '').trim();
    const nLimpio = (nickNuevo || '').trim();

    try {
        // 1. Ejecutar función maestra en Supabase (un solo viaje de red blindado)
        await supabaseClient.rpc('actualizar_apodo_global', {
            p_id_usuario: idUser,
            p_email: miEmail,
            p_nombre_viejo: vLimpio,
            p_nombre_nuevo: nLimpio
        });

        // 2. Fallback de cliente directo en ranking (Reto Diario, Guessr, Capacidad, Antigüedad)
        if (miEmail) {
            await supabaseClient.from('ranking').update({ nombre: nLimpio }).eq('email', miEmail);
        }
        if (vLimpio && vLimpio !== 'Anónimo' && vLimpio !== 'Invitado') {
            await supabaseClient.from('ranking').update({ nombre: nLimpio }).ilike('nombre', vLimpio);
        }

        // 3. Fallback directo en duelos 1v1
        if (idUser && idUser !== 'guest') {
            await supabaseClient.from('victorias_versus').update({ nombre: nLimpio }).eq('id_usuario', idUser);
            await supabaseClient.from('derrotas_versus').update({ nombre: nLimpio }).eq('id_usuario', idUser);
        }
        if (vLimpio && vLimpio !== 'Anónimo' && vLimpio !== 'Invitado') {
            await supabaseClient.from('victorias_versus').update({ nombre: nLimpio }).ilike('nombre', vLimpio);
            await supabaseClient.from('derrotas_versus').update({ nombre: nLimpio }).ilike('nombre', vLimpio);
        }

        // 4. Actualizar presencia y tablas de liga de amigos en vivo
        const nombreLiga = localStorage.getItem('ev_codigo_liga_amigos');
        if (nombreLiga) {
            try {
                await supabaseClient.rpc('actualizar_apodo_liga', {
                    p_liga: nombreLiga,
                    p_nombre_viejo: vLimpio,
                    p_nombre_nuevo: nLimpio
                });
            } catch(e) {}

            if (typeof ligaAmigosChannel !== 'undefined' && ligaAmigosChannel) {
                ligaAmigosChannel.send({ type: 'broadcast', event: 'fuerza_refresh', payload: {} });
            }
        }

        console.log(`✅ Apodo actualizado en todos los rankings: "${vLimpio}" ➔ "${nLimpio}"`);
    } catch (err) {
        console.error("Error al actualizar apodo globalmente:", err);
    }
}

// 📊 Estatus Real en la Comunidad: Compara la experiencia acumulada (XP) contra todos los jugadores en Supabase
async function calcularEstatusComunidadReal(miXp, miOvr) {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

    try {
        const xpActual = typeof miXp === 'number' ? miXp : (userStats.xpTotal || 0);

        // Si tenemos caché fresco de los últimos 2 minutos con el mismo XP, actualizamos el badge si hace falta
        if (window.estatusComunidadCache && 
            (Date.now() - window.estatusComunidadCache.timestamp < 120000) &&
            window.estatusComunidadCache.xp === xpActual) {
            const badgeEl = document.getElementById('badge-ranking-comunidad');
            if (badgeEl) {
                badgeEl.textContent = `${window.estatusComunidadCache.texto} · GRL ${miOvr}`;
            }
            return;
        }

        // Consultas HEAD en paralelo para obtener conteos exactos con 0 bytes de transferencia
        const [resTotal, resSuperiores] = await Promise.all([
            supabaseClient
                .from('perfiles')
                .select('*', { count: 'exact', head: true }),
            supabaseClient
                .from('perfiles')
                .select('*', { count: 'exact', head: true })
                .gt('experiencia', xpActual)
        ]);

        const total = (resTotal && typeof resTotal.count === 'number' && resTotal.count > 0) ? resTotal.count : 0;
        const superiores = (resSuperiores && typeof resSuperiores.count === 'number') ? resSuperiores.count : 0;

        if (total === 0) return;

        const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
        const registrado = u && u.id && u.id !== 'guest';
        const totalBase = registrado ? total : (total + 1);
        const puesto = superiores + 1;
        const pct = Math.max(0.1, (puesto / totalBase) * 100);

        let texto = "⚽ COMUNIDAD";
        if (puesto === 1) {
            texto = "👑 #1 COMUNIDAD";
        } else if (puesto === 2) {
            texto = "🥈 #2 COMUNIDAD";
        } else if (puesto === 3) {
            texto = "🥉 #3 COMUNIDAD";
        } else if (puesto <= 10) {
            texto = `⭐ #${puesto} COMUNIDAD`;
        } else if (pct <= 1) {
            texto = "👑 TOP 1% COMUNIDAD";
        } else if (pct <= 5) {
            texto = "🔥 TOP 5% COMUNIDAD";
        } else if (pct <= 10) {
            texto = "⭐ TOP 10% COMUNIDAD";
        } else if (pct <= 25) {
            texto = "🏆 TOP 25% COMUNIDAD";
        } else if (pct <= 50) {
            texto = "⚽ TOP 50% COMUNIDAD";
        } else {
            texto = xpActual >= 5000 ? "🚀 EN ASCENSO" : "🌱 PROMESA";
        }

        window.estatusComunidadCache = { 
            puesto, 
            total: totalBase, 
            pct, 
            texto, 
            xp: xpActual, 
            timestamp: Date.now() 
        };

        const badgeEl = document.getElementById('badge-ranking-comunidad');
        if (badgeEl) {
            badgeEl.textContent = `${texto} · GRL ${miOvr}`;
        }
    } catch (err) {
        console.warn("Aviso al calcular estatus real en la comunidad:", err);
    }
}
window.calcularEstatusComunidadReal = calcularEstatusComunidadReal;

function abrirModalPerfil(){
const u=obtenerUsuarioLogueado();
const esGoogle = u && u.loginMethod === 'google';
const nombreDefault = u ? u.name.split(' ')[0] : 'Invitado';
const nivelIdx=calcularNivelIdx(userStats.xpTotal),nivel=NIVELES[nivelIdx],nivelSig=NIVELES[Math.min(nivelIdx+1,NIVELES.length-1)];

// 📊 Cálculo inicial de estatus (se actualiza en milisegundos con Supabase)
let textoRankingTop = (window.estatusComunidadCache && window.estatusComunidadCache.texto)
    ? window.estatusComunidadCache.texto
    : (userStats.xpTotal >= 500000 ? "⭐ TOP COMUNIDAD" : (userStats.xpTotal >= 5000 ? "🚀 EN ASCENSO" : "🌱 PROMESA"));
// 1. Nombre de rango puro (Sin duplicar "Lvl XX")
const nombreRangoPuro = nivel.nombre.replace(/\s+Lvl\s+\d+/i, '').trim();

// 2. Cálculo de XP relativo al nivel actual (Sin números de 7 dígitos)
const xpEnNivel = userStats.xpTotal - nivel.min;
const xpNivelTotal = nivelSig.min === Infinity ? xpEnNivel : (nivelSig.min - nivel.min);
const xpFaltante = nivelSig.min === Infinity ? 0 : Math.max(0, nivelSig.min - userStats.xpTotal);
const xpPct = nivelIdx === NIVELES.length - 1 ? 100 : Math.min(100, Math.round((xpEnNivel / xpNivelTotal) * 100));

const savedNick=getPref('ev_custom_nick',''),savedPos=getPref('ev_user_pos','DT');let savedTheme=getPref('ev_card_theme','arg');
const validThemes = TEMAS_LISTA.map(t => t.k);
if (!validThemes.includes(savedTheme)) savedTheme = 'arg';
const currentTemaObj = TEMAS_LISTA.find(t => t.k === savedTheme) || { k: 'arg', l: 'ARG', nombre: 'Argentina' };
const savedHair = getPref('ev_avatar_hair', '1.webp');const savedShirt = getPref('ev_avatar_shirt', 'solid');const savedColor = getPref('ev_avatar_color', '#00e676');const savedColor2 = getPref('ev_avatar_color2', '#ffffff');const savedNum = getPref('ev_avatar_num', '10');const savedLogo = getPref('ev_avatar_logo', 'ev');
const activeCardClass=savedTheme;

const authBtnHTML = esGoogle 
    ? `<div class="profile-login-wrapper profile-login-wrapper-desktop">
        <button onclick="cerrarSesion()" class="btn-3d secondary profile-login-btn logout">
            <i class="ph-bold ph-sign-out"></i> Cerrar sesión
        </button>
       </div>`
    : `<div class="profile-login-wrapper profile-login-wrapper-desktop">
        <button onclick="manejarClickLogin()" class="btn-3d secondary profile-login-btn">
            <i class="ph-bold ph-google-logo"></i> Iniciá sesión
        </button>
        <div class="profile-login-tooltip">
            Si querés que tu progreso se sincronice en todos tus dispositivos, ¡iniciá sesión con Google!
        </div>
       </div>`;

// 3. Algoritmo para separar Racha Activa vs Días Pasados
const today = new Date();
const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const firstDay = new Date(currentYear, currentMonth, 1).getDay();
let startOffset = firstDay === 0 ? 6 : firstDay - 1;
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

const activeStreakDates = new Set();
let curr = new Date(today);
curr.setHours(0,0,0,0);
const todayStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

if (!userStats.activeDates || !userStats.activeDates.includes(todayStr)) {
    curr.setDate(curr.getDate() - 1);
}

while (true) {
    const dateStr = curr.getFullYear() + '-' + String(curr.getMonth() + 1).padStart(2, '0') + '-' + String(curr.getDate()).padStart(2, '0');
    if (userStats.activeDates && userStats.activeDates.includes(dateStr)) {
        activeStreakDates.add(dateStr);
        curr.setDate(curr.getDate() - 1);
    } else {
        break;
    }
}

// 4. Construcción de la Racha Semanal (Lunes a Domingo)
const todayNormalized = new Date(today);
todayNormalized.setHours(0,0,0,0);

const diaSemanaHoy = todayNormalized.getDay();
const diffAlLunes = diaSemanaHoy === 0 ? -6 : 1 - diaSemanaHoy;
const lunesSemana = new Date(todayNormalized);
lunesSemana.setDate(todayNormalized.getDate() + diffAlLunes);

const NOMBRES_DIAS_SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
let semanaHTML = '';

for (let i = 0; i < 7; i++) {
    const diaFecha = new Date(lunesSemana);
    diaFecha.setDate(lunesSemana.getDate() + i);
    const dateStr = diaFecha.getFullYear() + '-' + String(diaFecha.getMonth() + 1).padStart(2, '0') + '-' + String(diaFecha.getDate()).padStart(2, '0');
    
    const esHoy = diaFecha.getTime() === todayNormalized.getTime();
    const esFuturo = diaFecha > todayNormalized;
    const esRachaActiva = activeStreakDates.has(dateStr);
    const estaCompletado = (userStats.activeDates && userStats.activeDates.includes(dateStr)) || esRachaActiva;

    let estadoClase = 'missed';
    let iconoInner = `<span class="streak-num">${diaFecha.getDate()}</span>`;

    if (esFuturo) {
        estadoClase = 'future';
        iconoInner = `<span class="streak-num">${diaFecha.getDate()}</span>`;
    } else if (esRachaActiva || estaCompletado) {
        estadoClase = 'completed';
        iconoInner = `<i class="ph-bold ph-check"></i>`;
    } else if (esHoy) {
        estadoClase = 'today-pending';
        iconoInner = `<i class="ph-bold ph-play"></i>`;
    }

    const clickHandler = (esHoy && estadoClase === 'today-pending') ? `onclick="cerrarModalPerfil(); if(typeof iniciarRetoDiario === 'function') iniciarRetoDiario();" style="cursor:pointer;"` : '';

    semanaHTML += `
        <div class="streak-day-item ${estadoClase} ${esHoy ? 'is-today' : ''}" title="${NOMBRES_DIAS_SEMANA[i]} ${diaFecha.getDate()} de ${monthNames[diaFecha.getMonth()]}${esHoy ? ' (Hoy - ¡Tocá para jugar!)' : ''}" ${clickHandler}>
            <span class="streak-day-tag">${NOMBRES_DIAS_SEMANA[i]}</span>
            <div class="streak-day-badge">
                ${iconoInner}
            </div>
        </div>
    `;
}

const logros=calcularLogros(),totalLogros=logros.length,desbloqueados=logros.filter(l=>l.unlocked).length;
const visitadosList = JSON.parse(localStorage.getItem('ev_estadios_visitados') || '[]');
const deseadosList = JSON.parse(localStorage.getItem('ev_estadios_deseados') || '[]');
const copasCount = (userStats.copasGanadas || []).length;
const miniTrophiesHTML = copasCount > 0 
    ? `<div class="palmares-mini-strip">${(userStats.copasGanadas || []).slice(-3).map(c => `<img src="trofeo.webp" class="mini-cup-img" alt="Copa" title="${c.nombre || 'Copa Ganada'}">`).join('')}</div>` 
    : '';


document.getElementById('profile-modal-body').innerHTML=`
    <div class="split-profile-layout">
        
        <div class="left-fut-column">
            <div class="fut-card ${activeCardClass}" id="fut-card-main">
                        <div class="fut-card-shine"></div>
                        <div class="fut-top">
                            <div class="fut-badge-meta">
                                <div class="fut-ovr" title="Valoración General (GRL): sube con tu XP">${nivel.ovr}</div>
                                <div class="fut-pos" id="fut-pos-display" title="Tu posición">${savedPos}</div>
                                <img src="${obtenerUrlEscudo(savedLogo)}" class="fut-club-icon" id="fut-club-display" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
                            </div>
                            <div class="fut-avatar-container" id="fut-avatar-live-container">${generarAvatarHTML(savedHair)}</div>
                        </div>
                        <div class="fut-name" id="fut-name-display" title="Tu apodo">${savedNick || nombreDefault}</div>
                        <div class="fut-stats-row">
                            <div class="fut-stat-item" title="Votos realizados"><span class="fut-stat-num">${userStats.votosRealizados}</span><span class="fut-stat-label">VOT</span></div>
                            <div class="fut-stat-item" title="Trivias descubiertas"><span class="fut-stat-num">${userStats.triviasVistas}</span><span class="fut-stat-label">TRV</span></div>
                            <div class="fut-stat-item" title="Partidas jugadas"><span class="fut-stat-num">${userStats.partidasJugadas}</span><span class="fut-stat-label">PJ</span></div>
                            <div class="fut-stat-item" title="Partidos ganados 1v1"><span class="fut-stat-num">${userStats.partidasGanadas || 0}</span><span class="fut-stat-label">PG</span></div>
                            <div class="fut-stat-item" title="XP total acumulado"><span class="fut-stat-num">${userStats.xpTotal>999?(userStats.xpTotal/1000).toFixed(1)+'K':userStats.xpTotal}</span><span class="fut-stat-label">XP</span></div>
                        </div>
                    </div>

            <div class="profile-fan-passport-box" onclick="cerrarModalPerfil(); if(typeof abrirCatalogo === 'function') abrirCatalogo();" title="Explorá tus estadios en el Catálogo">
                <div class="passport-header">
                    <span class="passport-title"><i class="ph-fill ph-compass"></i> MIS ESTADIOS</span>
                    <span class="passport-total-badge">${visitadosList.length + deseadosList.length} Estadios</span>
                </div>
                <div class="passport-pills-row">
                    <div class="passport-chip chip-visitados">
                        <i class="ph-fill ph-map-pin"></i>
                        <div class="passport-chip-info">
                            <strong>${visitadosList.length}</strong>
                            <span>Visitados</span>
                        </div>
                    </div>
                    <div class="passport-chip chip-deseados">
                        <i class="ph-fill ph-star"></i>
                        <div class="passport-chip-info">
                            <strong>${deseadosList.length}</strong>
                            <span>Por Visitar</span>
                        </div>
                    </div>
                </div>
            </div>


            <div class="profile-card-actions-row">
                <button class="btn-3d secondary" id="btn-toggle-custom" onclick="toggleCustomization()"><img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> <span class="btn-custom-text-desktop">PERSONALIZÁ TU CARTA ▼</span><span class="btn-custom-text-mobile">EDITAR ▼</span></button>
                <div class="share-btn-wrapper">
                    <button class="btn-3d secondary" id="btn-share-card" onclick="abrirModalOpcionesCompartir()"><i class="ph-bold ph-share-network"></i></button>
                    <div class="share-tooltip">Compartí tu carta</div>
                </div>
                <div class="profile-mini-auth-wrapper">
                    <button class="btn-3d secondary profile-mini-auth-btn ${esGoogle ? 'logged-in' : ''}" id="btn-mini-auth-mobile" onclick="${esGoogle ? 'if(confirm(\'¿Cerrar sesión de Google?\')) cerrarSesion()' : 'manejarClickLogin()'}" title="${esGoogle ? 'Cerrar sesión' : 'Iniciar sesión con Google'}">
                        <i class="ph-bold ph-google-logo"></i>
                        ${esGoogle ? '<span class="mini-auth-dot"></span>' : ''}
                    </button>
                    <div class="share-tooltip">${esGoogle ? 'Cerrar sesión' : 'Iniciar sesión'}</div>
                </div>
            </div>
            <div id="customization-panel-wrapper">
                <div class="avatar-picker">
                    <div class="avatar-picker-label theme-stepper-wrapper">
                        <span class="theme-stepper-title"><img src="diseño-de-la-carta.webp" class="custom-label-icon" alt="Diseño"> DISEÑO DE LA CARTA</span>
                        <div class="theme-stepper-control">
                            <button type="button" class="avatar-stepper-btn" onclick="cambiarTemaPaso(-1)"><i class="ph-bold ph-caret-left"></i></button>
                            <div class="theme-dot td-${savedTheme} active" id="theme-current-badge" data-tema="${savedTheme}"></div>
                            <button type="button" class="avatar-stepper-btn" onclick="cambiarTemaPaso(1)"><i class="ph-bold ph-caret-right"></i></button>
                            <input type="hidden" id="card-theme-input" value="${savedTheme}">
                        </div>
                    </div>
                    <div class="avatar-divider"></div>
                    <label class="avatar-nick-label"><img src="selecciona-tu-jugador.webp" class="custom-label-icon" alt="Jugador"> SELECCIONÁ TU JUGADOR/A</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                        <div class="avatar-stepper-box" onclick="abrirModalSelectorAvatar()" style="cursor:pointer;" title="Elegir futbolista">
                            <span class="avatar-stepper-label" id="avatar-hair-label" style="display:flex;align-items:center;justify-content:center;gap:6px;">
                                <span>${obtenerNombreAvatar(savedHair)}</span>
                                <i class="ph-bold ph-magnifying-glass" style="color:var(--accent-color); font-size:0.85rem; flex-shrink:0;"></i>
                            </span>
                            <input type="hidden" id="avatar-hair-input" value="${savedHair}">
                        </div>
                        <div class="avatar-stepper-box" onclick="abrirModalSelectorEscudo()" style="cursor:pointer;" title="Elegir escudo o bandera">
                            <span class="avatar-stepper-label" id="avatar-logo-label" style="display:flex;align-items:center;justify-content:center;gap:6px;">
                                <img src="${obtenerUrlEscudo(savedLogo)}" id="avatar-logo-preview" referrerpolicy="no-referrer" style="width:28px;height:24px;object-fit:contain;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.5);" onerror="this.src='${ESCUDOS_MAP['ev']}';">
                                <span style="font-size:0.75rem; color:var(--accent-color); font-weight:800;"><i class="ph-bold ph-magnifying-glass"></i> Elegir</span>
                            </span>
                            <input type="hidden" id="avatar-logo-input" value="${savedLogo}">
                        </div>
                    </div>
                    <div class="avatar-picker-label pitch-stepper-wrapper" onclick="window.togglePitchPicker(this)">
                        <img src="posicion.webp" class="custom-label-icon" alt="Posición">
                        <span class="theme-stepper-title pitch-title-text">POSICIÓN</span>
                        <div class="pitch-header-control">
                            <span class="pitch-current-preview" id="pitch-header-preview">${savedPos}</span>
                            <i class="ph-bold ph-caret-down pitch-chevron"></i>
                        </div>
                    </div>
                    <div class="pitch-picker-container" id="pitch-picker-dropdown">
                        <div class="pitch-formations-bar">
                            <button type="button" class="pitch-form-tab active" data-form="4-3-3" onclick="cambiarFormacionTactica('4-3-3')">4-3-3</button>
                            <button type="button" class="pitch-form-tab" data-form="4-4-2" onclick="cambiarFormacionTactica('4-4-2')">4-4-2</button>
                            <button type="button" class="pitch-form-tab" data-form="4-2-3-1" onclick="cambiarFormacionTactica('4-2-3-1')">4-2-3-1</button>
                            <button type="button" class="pitch-form-tab" data-form="3-5-2" onclick="cambiarFormacionTactica('3-5-2')">3-5-2</button>
                        </div>

                        <div class="pitch-tactical-field">
                            <div class="pitch-line-center"></div>
                            <div class="pitch-circle-center"></div>
                            <div class="pitch-box-top"></div>
                            <div class="pitch-box-bottom"></div>
                            <div id="pitch-tactical-nodes"></div>
                        </div>

                        <div class="pitch-footer-bar">
                            <span class="pitch-selected-badge" id="pitch-pos-selected-name">${savedPos} — ${POSICIONES_NOMBRES[savedPos] || savedPos}</span>
                            <button type="button" class="pitch-pos-node dt-node" data-pos="DT" onclick="seleccionarPosicionCancha('DT')">
                                <i class="ph-bold ph-clipboard-text"></i> DT
                            </button>
                        </div>
                        <input type="hidden" id="avatar-pos-input" value="${savedPos}">
                    </div>
                    <label class="avatar-nick-label"><img src="apodo.webp" class="custom-label-icon" alt="Apodo"> APODO</label>
                    <div class="avatar-nickname-row">
                        <input type="text" class="avatar-nickname-input" id="avatar-nick-input" placeholder="Tu apodo…" maxlength="16" value="${savedNick}" oninput="const fn=document.getElementById('fut-name-display');if(fn)fn.textContent=this.value||'${nombreDefault.replace(/'/g,"\\'")}';">
                    </div>
                    <button class="avatar-save-btn" onclick="guardarPersonalizacion()"><img src="guardar-cambios.webp" class="btn-custom-icon" alt="Guardar"> GUARDAR CAMBIOS</button>
                </div>
            </div>
            ${authBtnHTML}
        </div>

        <div class="right-dashboard-column">
            
            <div class="right-dashboard-top-row">
                <!-- 1. NIVEL Y PROGRESO DE XP -->
                <div class="geoguessr-dash-box xp-profile-section" style="position:relative; overflow:hidden; background: radial-gradient(circle at center 35%, rgba(250, 204, 21, 0.12) 0%, transparent 65%), var(--bg-color);">
                    <div style="position:absolute; top:-50px; right:-50px; width:180px; height:180px; background:var(--accent-color); filter:blur(90px); opacity:0.15; border-radius:50%; pointer-events:none;"></div>
                    
                    <div class="xp-compact-header">
                        <div class="profile-level-icon-wrapper">
                            <img src="${nivel.iconUrl}" alt="Nivel ${nivelIdx}">
                        </div>
                        <div class="xp-compact-text">
                            <div class="xp-compact-meta">
                                <span class="level-badge-inline ${nivel.cssClass}">Nivel ${nivelIdx}</span>
                                <span class="badge-ranking" id="badge-ranking-comunidad">${textoRankingTop} · GRL ${nivel.ovr}</span>
                            </div>
                            <h3 class="profile-level-title">${nombreRangoPuro}</h3>
                        </div>
                    </div>
                    
                    <div class="xp-compact-bar-wrap">
                        <div class="xp-compact-labels">
                            <span class="xp-progress-label">${xpEnNivel.toLocaleString('es-AR')} / ${xpNivelTotal.toLocaleString('es-AR')} XP</span>
                            <span class="xp-compact-pct">${xpPct}%</span>
                        </div>
                        <div class="xp-bar-big">
                            <div class="xp-bar-big-fill" style="width:${xpPct}%;"></div>
                        </div>
                        <div class="xp-compact-footer">
                            ${nivelSig.min === Infinity
                                ? '🏆 ¡Alcanzaste el nivel máximo!'
                                : `Faltan <b>${xpFaltante.toLocaleString('es-AR')} XP</b> para el Nivel ${nivelIdx + 1} 🚀`}
                        </div>
                    </div>
                </div>
                
                <!-- 2. RETO DIARIO (RACHA SEMANAL) -->
                <div class="geoguessr-dash-box profile-streak-box">
                    <div class="dash-header-inline">
                        <div class="dash-title-premium"><i class="ph-duotone ph-calendar-check" style="font-size:1.25rem;color:var(--accent-color);"></i> Reto Diario</div>
                        <div class="streak-fire-badge">🔥 ${userStats.rachaActual||1} ${userStats.rachaActual === 1 ? 'día' : 'días'}</div>
                    </div>
                    <div class="streak-week-row">
                        ${semanaHTML}
                    </div>
                </div>
            </div>

            <!-- 🏆 ACCESO DIRECTO AL SALÓN DE CAMPEONES -->
            <div class="geoguessr-dash-box palmares-profile-box" onclick="cerrarModalPerfil(); window.origenRankingCarrera = 'perfil'; abrirModalRankingCarrera();" style="cursor:pointer;" title="Ver Salón de Campeones">
                <div class="dash-header-inline" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
                    <div class="dash-title-premium palmares-title-wrap">
                        <i class="ph-duotone ph-trophy" style="font-size:1.3rem; color:#fde047; flex-shrink:0;"></i> <span class="palmares-title-text">Vitrina de Títulos</span>
                        ${miniTrophiesHTML}
                    </div>
                    <span class="palmares-counter-badge">
                        <span class="palmares-counter-text">${copasCount} ${copasCount === 1 ? 'Título' : 'Títulos'}</span>
                        <i class="ph-bold ph-arrow-right"></i>
                    </span>
                </div>
            </div>


            <div class="geoguessr-dash-box logros-box-mobile" style="flex:1; display:flex; flex-direction:column;">
                <div class="dash-header-inline logros-header-clickable" onclick="toggleLogrosMobile()">
                    <div class="dash-title-premium">
                        <i class="ph-duotone ph-medal" style="font-size:1.3rem;color:var(--accent-color);"></i> Vitrina de Logros 
                        <i class="ph-bold ph-caret-down" id="logros-chevron" style="font-size:0.9rem; transition:transform 0.3s; margin-left:4px;"></i>
                    </div>
                    <div class="streak-fire-badge" id="logros-counter" style="color:var(--text-muted);">${desbloqueados}/${totalLogros}</div>
                </div>
                <div id="logros-content-wrapper" class="logros-wrapper-mobile">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;margin-top:10px;">
                        <span class="logro-rarity-pill" style="font-size:.6rem; padding:3px 10px;"></span>
                        <span class="logro-rarity-pill rare" style="font-size:.6rem; padding:3px 10px;"></span>
                        <span class="logro-rarity-pill epic" style="font-size:.6rem; padding:3px 10px;"></span>
                    </div>
                    <div class="logros-tabs-row">
                        <button class="logro-tab-btn active" data-tipo="todos" onclick="filtrarLogros('todos')">Todos</button>
                        <button class="logro-tab-btn" data-tipo="desbloqueados" onclick="filtrarLogros('desbloqueados')">✓ Logrados</button>
                        <button class="logro-tab-btn" data-tipo="progreso" onclick="filtrarLogros('progreso')">⏳ Progreso</button>
                        <button class="logro-tab-btn" data-tipo="bloqueados" onclick="filtrarLogros('bloqueados')">🔒 Bloq.</button>
                    </div>
                    <div class="logros-grid-v2" id="logros-grid-v2" style="flex:1;"></div>
                </div>
            </div>

            </div>
    </div>`;
    document.getElementById('profile-modal').style.display='flex';
setTimeout(()=>{
if(typeof seleccionarPosicionCancha === 'function') seleccionarPosicionCancha(savedPos);
const selHair = document.getElementById('avatar-hair-input'); if(selHair) selHair.value = savedHair;
const selShirt = document.getElementById('avatar-shirt-input'); if(selShirt) selShirt.value = savedShirt;
const selNum = document.getElementById('avatar-num-input'); if(selNum) selNum.value = savedNum;
const selLogo = document.getElementById('avatar-logo-input'); if(selLogo) selLogo.value = savedLogo;
renderizarGridLogros();
if(typeof inicializarEfectoHolograficoCarta === 'function') inicializarEfectoHolograficoCarta();
calcularEstatusComunidadReal(userStats.xpTotal, nivel.ovr);
},50);
}

// 🌈 EFECTO HOLOGRÁFICO 3D FOIL EN CARTA FUT (GIROSCOPIO MÓVIL + MOUSE DESKTOP)
function inicializarEfectoHolograficoCarta() {
    const card = document.getElementById('fut-card-main');
    if (!card) return;
    const shine = card.querySelector('.fut-card-shine');

    function aplicarTilt(x, y) {
        const rotX = -y * 18;
        const rotY = x * 18;
        card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        if (shine) {
            shine.style.backgroundPosition = `${50 + x * 40}% ${50 + y * 40}%`;
            shine.style.opacity = Math.min(0.85, 0.25 + Math.hypot(x, y) * 0.45);
        }
    }

    function resetTilt() {
        card.style.transform = '';
        if (shine) {
            shine.style.backgroundPosition = '';
            shine.style.opacity = '';
        }
    }

    card.onpointermove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = (e.clientY - rect.top) / rect.height * 2 - 1;
        aplicarTilt(x, y);
    };
    card.onpointerleave = resetTilt;

    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
        window.addEventListener('deviceorientation', (e) => {
            const modal = document.getElementById('profile-modal');
            if (!modal || modal.style.display === 'none') return;
            if (e.gamma !== null && e.beta !== null) {
                const x = Math.max(-1, Math.min(1, e.gamma / 30));
                const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
                aplicarTilt(x, y);
            }
        }, { passive: true });
    }
}
window.inicializarEfectoHolograficoCarta = inicializarEfectoHolograficoCarta;

// 📲 COMPARTIR DIRECTO EN WHATSAPP CON DATOS OFICIALES DE CARTA
function compartirCartaWhatsApp() {
    if (typeof reproducirSonido === 'function') reproducirSonido('click');
    const customNick = getPref('ev_custom_nick', '') || (obtenerUsuarioLogueado() ? obtenerUsuarioLogueado().name.split(' ')[0] : 'Jugador');
    const nivelIdx = calcularNivelIdx(userStats.xpTotal);
    const nivel = NIVELES[nivelIdx];
    const texto = `¡Mirá mi carta oficial de Estadios Virtuales! 🏆⚽\n👤 Crack: ${customNick} (Nivel ${nivelIdx} - ${nivel.nombre})\n📍 ¿Podés superarme en el StadiumGuessr o ganarme un 1v1?\nJugá gratis acá: ${location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}
window.compartirCartaWhatsApp = compartirCartaWhatsApp;

// 📤 MODAL INTEGRADO DE OPCIONES PARA COMPARTIR CARTA (WHATSAPP, PÓSTER 9:16, COPIAR)
function abrirModalOpcionesCompartir() {
    if (typeof reproducirSonido === 'function') reproducirSonido('click');
    let overlay = document.getElementById('share-options-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'share-options-overlay';
        overlay.className = 'share-options-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) cerrarModalOpcionesCompartir();
        };
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="share-options-box animate-scale-up" onclick="event.stopPropagation()">
            <button class="close-btn" onclick="cerrarModalOpcionesCompartir()"><i class="ph-bold ph-x"></i></button>
            <div class="share-options-header">
                <i class="ph-duotone ph-share-network" style="color:var(--accent-color); font-size:1.8rem;"></i>
                <h3 style="margin:4px 0 2px 0; font-size:1.15rem; font-weight:900;">Compartí tu Carta</h3>
                <p style="margin:0; font-size:0.8rem; color:var(--text-muted);">Desafiá a tus amigos o mostrá tu nivel</p>
            </div>
            <div class="share-options-list">
                <button type="button" class="share-opt-btn btn-opt-wa" onclick="compartirCartaWhatsApp(); cerrarModalOpcionesCompartir();">
                    <i class="ph-fill ph-whatsapp-logo" style="color:#25d366; font-size:1.4rem;"></i>
                    <div class="share-opt-text">
                        <strong>Enviar por WhatsApp</strong>
                        <span>Desafío directo con mensaje y enlace a tu perfil</span>
                    </div>
                    <i class="ph-bold ph-caret-right" style="color:var(--text-muted); margin-left:auto;"></i>
                </button>
                <button type="button" class="share-opt-btn btn-opt-poster" onclick="generarYDescargarPosterFUT(); cerrarModalOpcionesCompartir();">
                    <i class="ph-duotone ph-image" style="color:#38bdf8; font-size:1.4rem;"></i>
                    <div class="share-opt-text">
                        <strong>Descargar Historia 9:16</strong>
                        <span>Imagen HD lista para Instagram, TikTok o Estados</span>
                    </div>
                    <i class="ph-bold ph-caret-right" style="color:var(--text-muted); margin-left:auto;"></i>
                </button>
                <button type="button" class="share-opt-btn btn-opt-copy" onclick="copiarLinkDesafio(); cerrarModalOpcionesCompartir();">
                    <i class="ph-duotone ph-copy" style="color:#fbbf24; font-size:1.4rem;"></i>
                    <div class="share-opt-text">
                        <strong>Copiar Enlace</strong>
                        <span>Copiá tu link de desafío para pegarlo donde quieras</span>
                    </div>
                    <i class="ph-bold ph-caret-right" style="color:var(--text-muted); margin-left:auto;"></i>
                </button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
}
window.abrirModalOpcionesCompartir = abrirModalOpcionesCompartir;

function cerrarModalOpcionesCompartir() {
    const overlay = document.getElementById('share-options-overlay');
    if (overlay) overlay.style.display = 'none';
}
window.cerrarModalOpcionesCompartir = cerrarModalOpcionesCompartir;

function copiarLinkDesafio() {
    if (typeof reproducirSonido === 'function') reproducirSonido('click');
    const customNick = getPref('ev_custom_nick', '') || (obtenerUsuarioLogueado() ? obtenerUsuarioLogueado().name.split(' ')[0] : 'Jugador');
    const link = `${location.origin}?desafio=${encodeURIComponent(customNick)}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            if (typeof showToast === 'function') showToast("¡Enlace copiado al portapapeles! 📋", "ph-copy", "success");
        }).catch(() => {
            if (typeof showToast === 'function') showToast("Enlace: " + link, "ph-copy", "info");
        });
    } else {
        if (typeof showToast === 'function') showToast("Enlace: " + link, "ph-copy", "info");
    }
}
window.copiarLinkDesafio = copiarLinkDesafio;

function cerrarSesion() {
    window.navOrigenCarrera = false;
    localStorage.removeItem('ev_user_logged');
    localStorage.removeItem('ev_codigo_liga_amigos'); // 🛡️ ESCUDO: Borramos el acceso a la liga para proteger la privacidad
    
    // 👇 ESTA ES LA LÍNEA NUEVA: Vaciamos la memoria RAM porque el usuario se fue
    usuarioLogueadoCache = null; 
    
    cargarStats();
    cerrarModalPerfil();
    renderizarBotonLogin();
    showToast('¡Hasta la próxima!','ph-hand-waving');
}
// ========================================================
// FUNCIONES AUXILIARES DE INTERFAZ, LOGROS Y PROGRESO
// ========================================================

// Restaura los puntos de progreso visual (Rondas) del juego
// (actualizarDotsProgreso migrado a: js/guessr.js)

// Cambia el diseño de la carta en tiempo real en la vista previa
function previsualizarTema(tema){
    const card=document.getElementById('fut-card-main');
    if(!card)return;
    card.className='fut-card '+tema;
    document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('active',d.dataset.tema===tema));
}

// Filtra la visualización de los logros según la pestaña seleccionada
function filtrarLogros(tipo){
    logrosTabActual=tipo;
    document.querySelectorAll('.logro-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tipo===tipo));
    renderizarGridLogros();
}

// Renderiza la cuadrícula de medallas y tarjetas de logros dentro del perfil
function renderizarGridLogros(){
    const grid=document.getElementById('logros-grid-v2');
    if(!grid)return;
    const logros=calcularLogros();
    let filtrados;
    if(logrosTabActual==='todos') filtrados=logros;
    else if(logrosTabActual==='desbloqueados') filtrados=logros.filter(l=>l.unlocked);
    else if(logrosTabActual==='progreso') filtrados=logros.filter(l=>!l.unlocked&&l.pct>0);
    else filtrados=logros.filter(l=>!l.unlocked);
    
    const total=logros.length, desbloqueados=logros.filter(l=>l.unlocked).length;
    const counterEl=document.getElementById('logros-counter');
    if(counterEl) counterEl.textContent=`${desbloqueados}/${total}`;
    
    if(!filtrados.length){
        grid.innerHTML=`<div class="logros-empty"><i class="ph-duotone ph-smiley-wink"></i><span>${logrosTabActual==='desbloqueados'?'Aún no desbloqueaste logros. ¡A jugar!':logrosTabActual==='progreso'?'No tenés logros en progreso.':'¡Todos tus logros están desbloqueados!'}</span></div>`;
        return;
    }
    const rarityLabel={common:'Común',rare:'Raro',epic:'Épico'};
    grid.innerHTML=filtrados.map(l=>{
        const rarityClass=l.rarity==='epic'?'epic':l.rarity==='rare'?'rare':'';
        const progressBar=(l.pct!==undefined&&!l.unlocked&&l.pct>0)?`<div class="logro-progress-mini"><div class="logro-progress-bar-bg"><div class="logro-progress-bar-fill" style="width:${l.pct}%;"></div></div><div class="logro-progress-text">${l.pctLabel||''}</div></div>`:'';
        const unlockBadge=l.unlocked?`<div class="logro-unlock-badge">✓</div>`:'';
        const statusClass=l.unlocked?'unlocked':(l.pct>0?'in-progress':'locked');
        return `<div class="logro-card-v2 ${rarityClass} ${statusClass}">${unlockBadge}<div class="logro-icon-v2">${l.icon}</div><div class="logro-name-v2">${l.name}</div><div class="logro-req-v2">${l.req}</div>${progressBar}<div class="logro-rarity-pill">${rarityLabel[l.rarity]||'Común'}</div></div>`;
    }).join('');
}

// Calcula matemáticamente el estado y progreso de cada logro del usuario
function calcularLogros(){
    const s=userStats;
    const logros=[];
    function addTierLogro(id,icon,baseName,currentVal,step,unit,rarity='common'){
        const val=currentVal||0;
        const tierActual=Math.floor(val/step);
        const pct=Math.round(((val%step)/step)*100);
        if(tierActual>0){
            logros.push({id:`${id}_${tierActual}`,icon,name:`${baseName} ${tierActual}`,rarity,req:`${val.toLocaleString('es-AR')} de ${(tierActual*step).toLocaleString('es-AR')}${unit}`,unlocked:true,pct:100,pctLabel:''});
        }
        const siguiente=tierActual+1;
        const progActual=val-(tierActual*step);
        logros.push({id:`${id}_${siguiente}`,icon,name:`${baseName} ${siguiente}`,rarity,req:`Llegá a ${(siguiente*step).toLocaleString('es-AR')}${unit}`,unlocked:false,pct:tierActual===0?pct:Math.round((progActual/step)*100),pctLabel:`${val.toLocaleString('es-AR')}/${(siguiente*step).toLocaleString('es-AR')}${unit}`});
    }
    addTierLogro('voto','<img src="catador.webp" class="logro-img-icon" alt="Catador">','Catador',s.votosRealizados,5,' califs','common');
    addTierLogro('trivia','<img src="curioso.webp" class="logro-img-icon" alt="Curioso">','Curioso',s.triviasVistas,5,' trivias','common');
    addTierLogro('guessr','<img src="piloto.webp" class="logro-img-icon" alt="Piloto">','Piloto',s.partidasJugadas,5,' partidas','common');
    addTierLogro('liga','<img src="explorador.webp" class="logro-img-icon" alt="Explorador">','Explorador',s.ligasExploradas.size,2,' ligas','common');
    addTierLogro('aleat','<img src="aventurero.webp" class="logro-img-icon" alt="Aventurero">','Aventurero',s.vuelosAleatorios||0,10,' vuelos','common');
    addTierLogro('racha','<img src="constante.webp" class="logro-img-icon" alt="Constante">','Constante',s.rachaActual||1,7,' días','rare');
    addTierLogro('maxscore','<img src="record.webp" class="logro-img-icon" alt="Récord">','Récord',s.maxScore||0,5000,' pts','epic');
    addTierLogro('xptotal','<img src="acumulador.webp" class="logro-img-icon" alt="Acumulador">','Acumulador',s.xpTotal||0,10000,' XP','epic');

// ⚔️ NUEVOS LOGROS COMPETITIVOS DEL VERSUS 1V1
addTierLogro('versus_win','<img src="dominante.webp" class="logro-img-icon" alt="Dominante">','Dominante',s.partidasGanadas||0,3,' victorias','epic');

logros.push({id:'bienvenido',icon:'<img src="primer-despegue.webp" class="logro-img-icon" alt="Primer Despegue">',name:'Primer Despegue',rarity:'common',req:'Abrí la app por primera vez',unlocked:s.sesionesTotal>=1,pct:s.sesionesTotal>=1?100:0,pctLabel:''});
logros.push({id:'nick',icon:'<img src="identidad.webp" class="logro-img-icon" alt="Identidad">',name:'Identidad',rarity:'common',req:'Personalizá tu apodo',unlocked:!!getPref('ev_custom_nick',''),pct:getPref('ev_custom_nick','')?100:0,pctLabel:''});
logros.push({id:'primer_versus',icon:'<img src="bautismo-de-fuego.webp" class="logro-img-icon" alt="Bautismo de Fuego">',name:'Bautismo de Fuego',rarity:'common',req:'Ganá tu primer Versus 1v1',unlocked:(s.partidasGanadas||0)>=1,pct:(s.partidasGanadas||0)>=1?100:0,pctLabel:''});

// 🏆 LOGROS DE TORNEOS Y ONCE INICIAL
const copasGanadasArray = s.copasGanadas || [];
const tieneNac = copasGanadasArray.some(c => c.tier === 'nacional');
const tieneCont = copasGanadasArray.some(c => c.tier === 'continental');
const tieneClubes = copasGanadasArray.some(c => c.tier === 'mundial_clubes');
const tieneMundial = copasGanadasArray.some(c => c.tier === 'mundial');

let maxOvrIndividual = 0;
if (typeof AVATARES_LISTA !== 'undefined') {
    AVATARES_LISTA.forEach(a => {
        const ovr = obtenerOvrJugador(a.id);
        if (ovr > maxOvrIndividual) maxOvrIndividual = ovr;
    });
}

logros.push({id:'copa_nacional',icon:'<img src="medalla-bronce.webp" class="logro-img-icon" alt="Copa Desafío">',name:'Gran Desafío',rarity:'rare',req:'Levantá la Copa Desafío',unlocked:tieneNac,pct:tieneNac?100:0,pctLabel:tieneNac?'1/1':'0/1'});
logros.push({id:'copa_continental',icon:'<img src="medalla-plata.webp" class="logro-img-icon" alt="Copa Continental">',name:'Rey de América',rarity:'epic',req:'Levantá la Copa Continental',unlocked:tieneCont,pct:tieneCont?100:0,pctLabel:tieneCont?'1/1':'0/1'});
logros.push({id:'copa_mundial_clubes',icon:'<img src="medalla-oro.webp" class="logro-img-icon" alt="Mundial de Clubes">',name:'Rey de Clubes',rarity:'epic',req:'Levantá el Mundial de Clubes',unlocked:tieneClubes,pct:tieneClubes?100:0,pctLabel:tieneClubes?'1/1':'0/1'});
logros.push({id:'copa_mundial',icon:'<img src="estrella.webp" class="logro-img-icon" alt="Copa del Mundo">',name:'Campeón del Mundo',rarity:'epic',req:'Levantá la Copa del Mundo',unlocked:tieneMundial,pct:tieneMundial?100:0,pctLabel:tieneMundial?'1/1':'0/1'});
logros.push({id:'entrenador_estrella',icon:'<img src="estrella.webp" class="logro-img-icon" alt="Estrella">',name:'DT Galáctico',rarity:'rare',req:'Entrená a un futbolista a 80+ GRL',unlocked:maxOvrIndividual>=80,pct:maxOvrIndividual>=80?100:Math.min(100, Math.round((maxOvrIndividual/80)*100)),pctLabel:`${maxOvrIndividual}/80 GRL`});

logros.push({id:'localista',icon:'<img src="gps-humano.webp" class="logro-img-icon" alt="GPS Humano">',name:'GPS Humano',rarity:'rare',req:'Adiviná a menos de 5 km',unlocked:s.medallaLocalista,pct:s.medallaLocalista?100:0,pctLabel:''});
logros.push({id:'unKm',icon:'<img src="ojo-de-aguila.webp" class="logro-img-icon" alt="Ojo de Águila">',name:'Ojo de Águila',rarity:'epic',req:'Adiviná a menos de 1 km',unlocked:s.guessrUnKm,pct:s.guessrUnKm?100:0,pctLabel:''});
logros.push({id:'perfecto',icon:'<img src="perfeccionista.webp" class="logro-img-icon" alt="Perfeccionista">',name:'Perfeccionista',rarity:'epic',req:'Todo Guessr >4000 pts',unlocked:s.guessrPerfecto,pct:s.guessrPerfecto?100:0,pctLabel:''});
logros.push({id:'ordenPerfecto',icon:'<img src="estratega.webp" class="logro-img-icon" alt="Estratega">',name:'Estratega',rarity:'epic',req:'Orden perfecto sin errores',unlocked:s.ordenSinFallar,pct:s.ordenSinFallar?100:0,pctLabel:''});
    return logros;
}

// --- Despliegue de Logros en Celulares ---

// 📱 Función para abrir/cerrar la Vitrina de Logros en celulares
function toggleLogrosMobile() {
    const wrapper = document.getElementById('logros-content-wrapper');
    const chev = document.getElementById('logros-chevron');
    if (wrapper) {
        const isOpen = wrapper.classList.toggle('open');
        if (chev) chev.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

// --- Generador de Carta FUT en Imagen ---

const FALLBACK_PIXEL_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function urlABase64Seguro(url) {
    if (!url || typeof url !== 'string') return FALLBACK_PIXEL_BASE64;
    if (url.startsWith('data:image')) return url;

    let absUrl;
    try {
        absUrl = new URL(url, window.location.href).href;
    } catch (err) {
        return FALLBACK_PIXEL_BASE64;
    }

    // 1. Fetch directo (mismo origen o con cabeceras CORS válidas)
    try {
        const res = await fetch(absUrl, { mode: 'cors' });
        if (res.ok) {
            const blob = await res.blob();
            const dataUri = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
                return dataUri;
            }
        }
    } catch (e) {}

    // 2. Fallback por Proxy CORS si la imagen viene de un dominio externo
    if (absUrl.startsWith('http')) {
        try {
            const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(absUrl)}&output=png`;
            const resProxy = await fetch(proxyUrl, { mode: 'cors' });
            if (resProxy.ok) {
                const blob = await resProxy.blob();
                const dataUri = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
                    return dataUri;
                }
            }
        } catch (e) {}
    }

    return FALLBACK_PIXEL_BASE64;
}

async function generarYDescargarPosterFUT() {
    const cardElement = document.getElementById('fut-card-main');
    if (!cardElement) {
        showToast("No se encontró la carta para exportar", "ph-warning-circle", "danger");
        return;
    }

    showToast("Preparando tu carta", "ph-hourglass", "info");

    const nivelIdx = calcularNivelIdx(userStats.xpTotal);
    const nivel = NIVELES[nivelIdx];
    const racha = userStats.rachaActual || 1;
    const victorias = userStats.partidasGanadas || 0;
    const customNick = getPref('ev_custom_nick', '') || (obtenerUsuarioLogueado() ? obtenerUsuarioLogueado().name.split(' ')[0] : 'Jugador');

    const urlReto = `https://www.estadiosvirtuales.com?desafio=${encodeURIComponent(customNick)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlReto)}&color=00e676&bgcolor=142030`;

    // 1. Contenedor anclado a (0,0) detrás de la interfaz para captura exacta sin desfasajes
    const poster = document.createElement('div');
    poster.id = 'poster-export-container';
    poster.style.cssText = 'position: fixed; left: 0; top: 0; width: 450px; height: 800px; z-index: -9999; opacity: 1; pointer-events: none; background: #090e15; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 24px 20px 20px; box-sizing: border-box; font-family: "Segoe UI", system-ui, sans-serif; color: #ffffff;';

    const logoHeaderUrl = new URL('https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp', window.location.href).href;
    const nivelIconUrl = new URL(nivel.iconUrl || 'pelota.webp', window.location.href).href;
    const fuegoIconUrl = new URL('fuego.webp', window.location.href).href;
    const trofeoIconUrl = new URL('trofeo.webp', window.location.href).href;
    const dueloIconUrl = new URL('liga-icon-historial.webp', window.location.href).href;

    poster.innerHTML = `
        <div class="poster-header" style="display:flex; align-items:center; gap:12px; width:100%; justify-content:center;">
            <img class="poster-logo" src="${logoHeaderUrl}" alt="Logo" style="width:38px; height:38px; border-radius:10px; border:1.5px solid var(--accent-color); object-fit:cover;">
            <div class="poster-header-text" style="display:flex; flex-direction:column; text-align:left;">
                <div class="poster-title" style="font-size:1.15rem; font-weight:900; letter-spacing:1.5px; color:#ffffff; text-transform:uppercase;">Estadios Virtuales</div>
                <div class="poster-subtitle" style="font-size:0.65rem; font-weight:800; letter-spacing:2px; color:var(--accent-color); text-transform:uppercase;">El mundo desde el aire</div>
            </div>
        </div>

        <div class="poster-card-wrapper" style="position:relative; display:flex; justify-content:center; align-items:center; margin:6px 0; width:100%; height:455px;">
            <div id="poster-card-clone-container" style="z-index:5;"></div>
        </div>

        <div class="poster-stats-badges">
            <div class="poster-badge">
                <img src="${nivelIconUrl}" class="poster-badge-icon icon-poster-rango" alt="Nivel">
                <div class="poster-badge-text-group">
                    <span class="poster-badge-title">${nivel.nombre.replace(/\s+Lvl\s+\d+/i, '')}</span>
                    <span class="poster-badge-sub sub-lvl">Nivel ${nivelIdx}</span>
                </div>
            </div>
            <div class="poster-badge">
                <img src="${fuegoIconUrl}" class="poster-badge-icon icon-poster-racha" alt="Racha">
                <div class="poster-badge-text-group">
                    <span class="poster-badge-title">${racha} Días</span>
                    <span class="poster-badge-sub sub-streak">Racha</span>
                </div>
            </div>
            <div class="poster-badge">
                <img src="${trofeoIconUrl}" class="poster-badge-icon icon-poster-victorias" alt="Victorias">
                <div class="poster-badge-text-group">
                    <span class="poster-badge-title">${victorias} PG</span>
                    <span class="poster-badge-sub sub-wins">Victorias</span>
                </div>
            </div>
        </div>

        <div class="poster-footer-cta">
            <img class="poster-qr" src="${qrApiUrl}" alt="QR">
            <div class="poster-cta-text">
                <strong>¿Te animás a ganarme?</strong>
                <span>Escaneá el QR y desafiame en vivo.</span>
            </div>
            <div class="poster-cta-duel">
                <img src="${dueloIconUrl}" alt="Duelo 1v1" class="poster-duel-img">
            </div>
        </div>
    `;

    document.body.appendChild(poster);

    // Clon de la carta FUT
    const cardClone = cardElement.cloneNode(true);
    cardClone.id = "fut-card-clone";
    cardClone.style.transform = 'scale(1.16)';
    cardClone.style.transformOrigin = 'center center';
    cardClone.style.margin = '0';
    poster.querySelector('#poster-card-clone-container').appendChild(cardClone);

    try {
        // Conversión a Base64 de todas las imágenes
        const allImages = Array.from(poster.querySelectorAll('img'));
        await Promise.all(allImages.map(async (img) => {
            const rawSrc = img.getAttribute('src') || img.src;
            const b64 = await urlABase64Seguro(rawSrc);
            
            img.src = b64;
            img.removeAttribute('srcset');
            img.removeAttribute('crossorigin');
            img.removeAttribute('loading');
            img.removeAttribute('referrerpolicy');

            if (img.decode) {
                try { await img.decode(); } catch (e) {}
            } else if (!img.complete) {
                await new Promise(res => { img.onload = res; img.onerror = res; });
            }
        }));

        await new Promise(r => setTimeout(r, 200));

        const dataUrl = await htmlToImage.toJpeg(poster, {
            quality: 0.95,
            pixelRatio: 2.2,
            backgroundColor: '#090e15',
            width: 450,
            height: 800
        });

        poster.remove();

        const triggerDownload = () => {
            const link = document.createElement('a');
            link.download = `carta-fut-${customNick.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast("¡Póster descargado con éxito! 🏆", "ph-check-circle", "success");
        };

        const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (esMobile && navigator.canShare) {
            try {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'mi-carta-estadiosvirtuales.jpg', { type: 'image/jpeg' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Mi Carta en Estadios Virtuales ⚽',
                        text: `🏆 ¡Mirá mi carta de Estadios Virtuales! ¿Podés ganarme en un 1v1? 🌍⚽`
                    });
                    showToast("¡Listo para compartir!", "ph-share-network", "success");
                    return;
                }
            } catch (shareErr) {
                console.warn("Cancelación de compartir nativo, procediendo a descarga directa:", shareErr);
            }
        }

        triggerDownload();

    } catch (error) {
        console.error("Error al exportar el póster de la carta FUT:", error);
        if (poster && poster.parentNode) poster.remove();
        showToast("Error al generar la imagen. Intentá de nuevo.", "ph-warning-circle", "danger");
    }
}


// =============================================================================
// 🌐 EXPORTACIÓN AL ÁMBITO GLOBAL (WINDOW)
// =============================================================================
window.AVATARES_LISTA = AVATARES_LISTA;
window.TEMAS_LISTA = TEMAS_LISTA;
window.generarAvatarHTML = generarAvatarHTML;
window.obtenerAvatarParaUsuario = obtenerAvatarParaUsuario;
window.obtenerAvatarCirculoHTML = obtenerAvatarCirculoHTML;
window.inspeccionarPerfilRival = inspeccionarPerfilRival;
window.cerrarModalInspeccionarRival = cerrarModalInspeccionarRival;

window.abrirModalPerfil = abrirModalPerfil;
window.cerrarModalPerfil = cerrarModalPerfil;
window.obtenerNombreAvatar = obtenerNombreAvatar;
window.obtenerNivelAvatar = obtenerNivelAvatar;
window.verificarApodoDisponible = verificarApodoDisponible;
window.guardarPersonalizacion = guardarPersonalizacion;
window.actualizarApodoEnTodoElSistema = actualizarApodoEnTodoElSistema;
window.cerrarSesion = cerrarSesion;
window.previsualizarTema = previsualizarTema;

window.calcularLogros = calcularLogros;
window.filtrarLogros = filtrarLogros;
window.renderizarGridLogros = renderizarGridLogros;
window.toggleLogrosMobile = toggleLogrosMobile;

window.reproducirSonidoApertura = reproducirSonidoApertura;
window.verificarSobreBienvenidaPostPartida = verificarSobreBienvenidaPostPartida;
window.animarAperturaSobre = animarAperturaSobre;
window.seleccionarCapitanInicial = seleccionarCapitanInicial;
window.comprobarRecompensaNivel = comprobarRecompensaNivel;
window.cerrarModalRecompensa = cerrarModalRecompensa;

window.urlABase64Seguro = urlABase64Seguro;
window.generarYDescargarPosterFUT = generarYDescargarPosterFUT;
window.compartirCartaFUT = abrirModalOpcionesCompartir;
