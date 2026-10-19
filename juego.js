// ☁️ Módulo de Conexión a Supabase migrado a: js/supabase.js

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ☁️ Todos los endpoints legados de Google Sheets/Apps Script han sido migrados a Supabase (js/supabase.js)
const GOOGLE_CLIENT_ID="768963974490-llof395lvphcmmebbkm2ktrn08lffp3a.apps.googleusercontent.com";

// 🛡️ Módulo de Escudos y Banderas migrado a: js/escudos.js
// 👤 generarAvatarHTML migrado a: js/perfil.js
// 🏆 Módulo de Progreso, Niveles y Estadísticas migrado a: js/progreso.js

function inicializarGoogleLogin(){
if(typeof google==='undefined'||!google.accounts){setTimeout(inicializarGoogleLogin,500);return;}
google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:manejarRespuestaGoogle,auto_select:false,cancel_on_tap_outside:true});
const btnContainer=document.getElementById('google-signin-btn-container');
if(btnContainer)google.accounts.id.renderButton(btnContainer,{theme:'filled_black',size:'large',shape:'pill',width:300,text:'signin_with'});
}

async function manejarRespuestaGoogle(response){
    const payload = decodeJwt(response.credential);
    if (!payload) {
        showToast('Error al procesar la respuesta de Google.', 'ph-warning-circle', 'danger');
        return;
    }
    const user = {id:payload.sub, name:payload.name, email:payload.email, picture:payload.picture, loginMethod:'google'};
    localStorage.setItem('ev_user_logged', JSON.stringify(user));

    usuarioLogueadoCache = user;
    
    // Guardamos el usuario en tu tabla de usuarios segura
    await registrarUsuarioEnSupabase(user);
    
    // 1. Levantamos el escudo antes de inicializar las estadísticas locales del celular
    bloqueasSincronizacionNube = true;
    
    cargarStats(); // Esto calcula la racha localmente en el celu pero NO la sube todavía
    
    // 2. Traemos tus puntos y calendario reales que tenías guardados en la nube
    await cargarProgresoDesdeSupabase(); 
    
    // 3. Ahora que el celu ya tiene tu progreso real de la PC, apagamos el escudo
    bloqueasSincronizacionNube = false;
    guardarStats();
    
    cerrarLoginModal();
    renderizarBotonLogin();
    
    // 🔄 Refrescamos en vivo la interfaz del perfil si estaba abierta en pantalla
    const profileModal = document.getElementById('profile-modal');
    if (profileModal && profileModal.style.display === 'flex') {
        abrirModalPerfil();
    }

    showToast(`¡Bienvenido, ${user.name.split(' ')[0]}! 🎉`);
    if (pendingScore !== null) setTimeout(() => guardarScorePendiente(), 500);
    setTimeout(() => verificarPremiosPendientes(), 1000);
}

// [registrarUsuarioEnSupabase migrado a js/supabase.js]
function decodeJwt(token){try{const b=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(atob(b).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')));}catch(e){return null;}}
function abrirModalPrivacy(){
    const m = document.getElementById('privacy-modal-overlay');
    if (m) {
        m.style.display = 'flex';
        m.classList.add('active');
        const body = document.getElementById('privacy-scroll-body');
        const ind = document.getElementById('privacy-read-indicator');
        const chk = document.getElementById('privacy-accept-check');
        const btn = document.getElementById('btn-confirm-privacy');
        
        if (body) body.scrollTop = 0;
        if (ind) {
            ind.style.display = 'flex';
            ind.classList.remove('ready');
            ind.innerHTML = '<i class="ph-bold ph-arrow-down"></i> Desplázate hasta el final para aceptar los términos';
        }
        if (chk) {
            chk.checked = false;
            chk.disabled = true;
        }
        if (btn) {
            btn.disabled = true;
        }
    }
}
function cerrarModalPrivacy(){
    const m = document.getElementById('privacy-modal-overlay');
    if (m) {
        m.style.display = 'none';
        m.classList.remove('active');
    }
}
function checkPrivacyScrolled(el){
    if(el.scrollTop + el.clientHeight >= el.scrollHeight - 40){
        const ind = document.getElementById('privacy-read-indicator');
        if (ind) {
            ind.innerHTML = '<i class="ph-fill ph-check-circle"></i> ¡Leíste todo! Ahora podés aceptar.';
            ind.classList.add('ready');
        }
        const chk = document.getElementById('privacy-accept-check');
        if (chk) chk.disabled = false;
    }
}
function togglePrivacyBtn(){
    const chk = document.getElementById('privacy-accept-check');
    const btn = document.getElementById('btn-confirm-privacy');
    if (chk && btn) btn.disabled = !chk.checked;
}
function confirmarPrivacyYLogin(){
    localStorage.setItem('ev_privacy_accepted', '1');
    cerrarModalPrivacy();
    abrirLoginModal();
}
function abrirLoginModal(){
    document.getElementById('login-modal-overlay').classList.add('active');
    setTimeout(()=>{
        const c = document.getElementById('google-signin-btn-container');
        if(c && typeof google !== 'undefined' && google.accounts){
            c.innerHTML = '';
            google.accounts.id.renderButton(c, {theme: 'filled_black', size: 'large', shape: 'pill', width: 300, text: 'signin_with'});
        }
    }, 100);
}
function cerrarLoginModal(){document.getElementById('login-modal-overlay').classList.remove('active');}
function manejarClickLogin(){
    const ok = localStorage.getItem('ev_privacy_accepted') === '1';
    if (ok) abrirLoginModal();
    else abrirModalPrivacy();
}
function esUsuarioGoogle(){const u=obtenerUsuarioLogueado();return u&&u.loginMethod==='google';}
async function guardarScorePendiente(btnElement) {
    if (pendingScore === null) return;

    const u = obtenerUsuarioLogueado();
    let nombreParaGuardar = getPref('ev_custom_nick', '');

    if (!nombreParaGuardar && u && u.name) {
        nombreParaGuardar = u.name.split(' ')[0];
    }

    // Si el usuario invitado no tiene apodo configurado, se lo solicitamos para el ranking validando disponibilidad
    if (!nombreParaGuardar) {
        let nuevoNick = prompt("🏆 ¡Gran puntaje! Ingresá tu apodo para figurar en el ranking:");
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
        nombreParaGuardar = nuevoNick;
        renderizarBotonLogin();
    }

    const emailParaGuardar = (u && u.email) ? u.email : '';

    // 1. Envía el puntaje a la tabla oficial del modo jugado
    await enviarPuntaje(nombreParaGuardar, pendingScore, emailParaGuardar, pendingScoreType);

    // Si jugó el Reto Diario, también computa su puntaje en el ranking individual general
    if (pendingScoreType.startsWith('diario_')) {
        await enviarPuntaje(nombreParaGuardar, pendingScore, emailParaGuardar, 'guessr');
    }

    // 2. Si el usuario pertenece a una Liga de Amigos y jugó StadiumGuessr o Reto Diario, actualiza también su récord en la liga
    const ligaAmigos = localStorage.getItem('ev_codigo_liga_amigos');
    if (ligaAmigos && (pendingScoreType === 'guessr' || pendingScoreType.startsWith('diario_'))) {
        await enviarPuntaje(nombreParaGuardar, pendingScore, emailParaGuardar, 'duelo_' + ligaAmigos);
    }

    showToast(`¡${pendingScore.toLocaleString('es-AR')} puntos guardados en el ranking! 🚀`);

    if (btnElement) {
        btnElement.innerHTML = `<i class="ph-bold ph-check"></i> ¡Guardado!`;
        btnElement.disabled = true;
        btnElement.style.opacity = '0.7';
    }

    pendingScore = null;
    pendingScoreType = null;
}
function pedirLoginParaGuardar(){
const sub=document.querySelector('.login-modal-sub');if(sub)sub.innerHTML=`<b style="color:var(--accent-color);">¡Puntaje listo para guardar!</b><br>Iniciá sesión con Google para guardarlo en el ranking global y no perderlo.`;
const ok=localStorage.getItem('ev_privacy_accepted')==='1';if(ok)abrirLoginModal();else abrirModalPrivacy();}
function obtenerNombreDisplay(){const customNick=getPref('ev_custom_nick','');if(customNick)return customNick;const u=obtenerUsuarioLogueado();if(u)return u.name.split(' ')[0];return 'Jugador';}
function renderizarBotonLogin(){
    const container=document.getElementById('hero-google-profile');
    if(!container) return;
    const u=obtenerUsuarioLogueado();
    const avatarImg = getPref('ev_avatar_hair', '1.webp').replace(/\.png$/i, '.webp');
    const avatarHTML=`<div class="hero-profile-avatar-circle"><div class="hero-profile-avatar-inner">${generarAvatarHTML(avatarImg, true)}</div></div>`;
    const nivel=NIVELES[calcularNivelIdx(userStats.xpTotal)];
    const nombre = obtenerNombreDisplay();
    const pos = getPref('ev_user_pos', 'DT');
    
    container.innerHTML=`<div class="hero-profile-wrapper" onclick="abrirModalPerfil()" title="Ver tu perfil y carta"><div style="text-align:right;"><div class="hero-profile-name">${nombre}</div><div class="hero-profile-sub"><span style="color:${nivel.color};">${nivel.emoji}</span> ${pos}</div></div>${avatarHTML}</div>`;
    ancestralHeaderNivel();
}

// 👤 MEMORIA Y GENERADOR DEL CÍRCULO DE AVATAR PARA TODOS LOS RANKINGS
window.cacheAvataresUsuarios = window.cacheAvataresUsuarios || {}; var cacheAvataresUsuarios = window.cacheAvataresUsuarios;

// 👤 Avatares e Inspeccionar Rival migrados a: js/perfil.js
// ⚽ Desafío de Planteles Asincrónico migrado a: js/carrera.js

// 🏆 Precarga y filtro en vivo de ranking migrados a: js/guessr.js
// 🗳️ Funciones de votación, sanitización y colores migradas a: js/catalogo.js

// 🎥 Modal de Video (YouTube/MP4) y teardown migrados a: js/guessr.js

// [abrirModalMapa y cerrarModalMapa migrados a js/catalogo.js]
// 👤 Perfil, Cartas FUT, Sobres, Avatares, Tácticas y Logros migrados a: js/perfil.js
function precargarImagenesUI() {
    const URL_ESCUDOS_BASE = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/';

    // Solo precargamos lo indispensable de la portada de inicio
    const uiEsencial = [
        URL_ESCUDOS_BASE + 'Logo.webp',
        URL_ESCUDOS_BASE + 'baul.webp',
        'mundo.webp', 'podio.webp', 'avion.webp', 'catalogo.webp',
        'icono-individual.webp', 'icono-1v1.webp', 'icono-privada.webp', 'icono-ranking.webp'
    ];

    uiEsencial.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Postergamos avatares y escudos para cuando el usuario lleve 6 segundos en la web y NO esté jugando
    const postergarColaPesada = () => {
        if (document.body.classList.contains('video-abierto')) return; // Si ya está jugando, no le robamos ancho de banda

        const avatares = Array.from({ length: 63 }, (_, i) => `${i + 1}.webp`);
        avatares.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    };

    setTimeout(postergarColaPesada, 6000);
}

// 🚀 La precarga arranca DESPUÉS de que la página terminó de cargar por completo (detiene el spinner de la pestaña)
window.addEventListener('load', () => {
    setTimeout(precargarImagenesUI, 1200);
});

window.addEventListener('DOMContentLoaded', async () => {
    // ⚡ 1. Renderizamos la interfaz visual de inmediato (Perfil de usuario y botones)
    renderizarBotonLogin();
    ancestralHeaderNivel();
    if (typeof actualizarBotonSonido === 'function') actualizarBotonSonido();
    if (typeof iniciarRelojRetoDiario === 'function') iniciarRelojRetoDiario();

    // 🔊 Audio táctil reactivo en botones interactivos
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .quick-tag-pill, .b-tab, .pitch-form-tab');
        if (target && !target.classList.contains('sound-toggle-btn') && !target.closest('.stars-row')) {
            if (typeof reproducirSonido === 'function') reproducirSonido('click');
        }
    });
    
    // Activar clicks en pestañas de ligas de inmediato
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', function() {
        const gid = this.getAttribute('data-gid'), nombre = this.querySelector('.tab-name')?.textContent.trim() || this.textContent.trim();
        activarLiga(gid, nombre);
    }));

    // Cargar Google Login
    if (typeof google !== 'undefined' && google.accounts) inicializarGoogleLogin();
    else {
        document.querySelector('script[src*="accounts.google.com"]')?.addEventListener('load', inicializarGoogleLogin);
        setTimeout(inicializarGoogleLogin, 2000);
    }

    // 🛡️ 2. Cargas de red independientes (Si una falla, las demás siguen funcionando)
    try { await inicializarSupabaseSeguro(); } catch(e) { console.warn(e); }
    try { await cargarPromediosSupabase(); } catch(e) { console.warn(e); }
    try { await cargarProgresoDesdeSupabase(); } catch(e) { console.warn(e); }
    bloqueasSincronizacionNube = false;
    
    // Refrescamos el perfil por si bajó datos nuevos de la nube
    renderizarBotonLogin();

    try { await indexarCatalogoMasivo(); } catch(e) { console.warn(e); }

    setTimeout(() => verificarPremiosPendientes(), 1200);
    setTimeout(() => verificarInvitacionesLigaPendientes(), 1600);
    setTimeout(() => verificarSobreBienvenidaPostPartida(), 1400);

    const lastGid = localStorage.getItem('ev_last_gid');
    if (lastGid) {
        const tab = document.querySelector(`.tab[data-gid="${lastGid}"]`);
        if (tab) {
            const nombre = tab.querySelector('.tab-name')?.textContent.trim() || tab.textContent.trim();
            activarLiga(lastGid, nombre);
        } else mostrarLigas();
    } else mostrarLigas();
    
    guardarStats();

    // 👇 ESCANEO DE LINK: Revisa si alguien nos mandó link de sala privada, liga o estadio específico
    const urlParams = new URLSearchParams(window.location.search);
    const salaPrivadaId = urlParams.get('sala');
    const ligaParamId = urlParams.get('liga');
    const estadioParam = urlParams.get('estadio');

    if (salaPrivadaId) {
        versusLigaOrigen = null;
        unirseSalaPrivada(salaPrivadaId);
    } else if (ligaParamId) {
        unirseALigaPorLink(ligaParamId);
    } else if (estadioParam) {
        abrirEstadioPorParametro(estadioParam);
    }
});

// 🌐 DEEP LINKING: Abre directamente el video y ficha del estadio recibido por URL
function abrirEstadioPorParametro(param) {
    if (!param || !catalogoGlobal || catalogoGlobal.length === 0) return;

    // Limpia eliminando tildes, espacios y guiones para comparar texto compacto
    const compactar = (txt) => (txt || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

    // Limpia manteniendo espacios para búsquedas tradicionales
    const normalizarEspacios = (txt) => (txt || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const textoLimpio = decodeURIComponent(param).replace(/[-_]/g, ' ');
    const buscadoCompacto = compactar(param);
    const buscadoConEspacios = normalizarEspacios(textoLimpio);
    const palabrasBuscadas = buscadoConEspacios.split(' ').filter(p => p.length >= 3);

    if (!buscadoCompacto && !buscadoConEspacios) return;

    // Sistema de puntuación: soporta nombres sin guiones ("estudiantesdelaplata") y con espacios
    const puntuados = catalogoGlobal.map(e => {
        const nombreEstadio = bscarPropiedad(e, 'Estadio');
        const nombreClub = bscarPropiedad(e, 'Club');
        const nombrePais = bscarPropiedad(e, 'País');

        const estCompacto = compactar(nombreEstadio);
        const clubCompacto = compactar(nombreClub);

        const estConEspacios = normalizarEspacios(nombreEstadio);
        const clubConEspacios = normalizarEspacios(nombreClub);
        const paisConEspacios = normalizarEspacios(nombrePais);
        const comboConEspacios = `${estConEspacios} ${clubConEspacios} ${paisConEspacios}`;

        let score = 0;

        // 1. Coincidencia exacta compacta (prioridad máxima por club: "estudiantesdelaplata" -> 200 pts)
        if (clubCompacto && clubCompacto === buscadoCompacto) score += 200;
        // 2. Coincidencia exacta de estadio compacto
        if (estCompacto && estCompacto === buscadoCompacto) score += 180;

        // 3. Coincidencia parcial compacta
        if (clubCompacto && (clubCompacto.includes(buscadoCompacto) || (buscadoCompacto.length >= 4 && buscadoCompacto.includes(clubCompacto)))) score += 90;
        if (estCompacto && (estCompacto.includes(buscadoCompacto) || (buscadoCompacto.length >= 4 && buscadoCompacto.includes(estCompacto)))) score += 70;

        // 4. Coincidencia con espacios tradicional
        if (clubConEspacios === buscadoConEspacios) score += 100;
        if (estConEspacios === buscadoConEspacios) score += 90;

        palabrasBuscadas.forEach(p => {
            if (estConEspacios.includes(p)) score += 30;
            if (clubConEspacios.includes(p)) score += 25;
            if (paisConEspacios.includes(p)) score += 10;
        });

        if (comboConEspacios.includes(buscadoConEspacios)) score += 40;

        const capacidad = parseInt(String(bscarPropiedad(e, 'Capacidad')).replace(/[^0-9]/g, '')) || 0;

        return { estadio: e, score, capacidad };
    }).filter(item => item.score > 0);

    if (puntuados.length === 0) return;

    // Ordenamos por mayor puntaje de coincidencia; si empatan en texto, por capacidad
    puntuados.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.capacidad - a.capacidad;
    });

    const encontrado = puntuados[0].estadio;

    if (encontrado) {
        const linkVideo = bscarPropiedad(encontrado, 'Link del Video')?.trim();
        const nombreEstadio = bscarPropiedad(encontrado, 'Estadio');
        const club = bscarPropiedad(encontrado, 'Club');

        showToast(`🏟️ Explorando: ${nombreEstadio} (${club})`, 'ph-airplane-tilt', 'success');

        if (linkVideo && linkVideo !== '#' && !linkVideo.includes('[Pegá tu link')) {
            abrirModalVideo(null, linkVideo, false);
        }
    }
}

// Abre o cierra el buzón flotante de sugerencias
function toggleBuzonSugerencias() {
    const box = document.getElementById('sugerencias-box');
    if (!box) return;
    const estaAbierto = box.style.display === 'block';
    box.style.display = estaAbierto ? 'none' : 'block';
    if (!estaAbierto) {
        document.getElementById('sugerencia-texto').value = '';
        document.getElementById('sugerencia-texto').focus();
    }
}

// Envía el texto directo al búnker de sugerencias en la nube
async function enviarSugerenciaServidor() {
    const textarea = document.getElementById('sugerencia-texto');
    const texto = textarea ? textarea.value.trim() : '';
    
    if (!texto) {
        showToast("¡Escribí algo antes de enviar! ✍️", "ph-warning-circle", "danger");
        return;
    }

    try {
        if (!supabaseClient) return;
        const idUsuario = getUserId(); // Identifica si es cuenta real o el ID de invitado temporal

        const { error } = await supabaseClient
            .from('sugerencias')
            .insert([{ id_usuario: idUsuario, texto: texto }]);

        if (error) throw error;

        showToast("¡Sugerencia enviada! Gracias por el feedback 🏆", "ph-paper-plane-tilt", "success");
        toggleBuzonSugerencias();
    } catch (err) {
        console.error("Error al enviar la sugerencia:", err.message);
        showToast("No se pudo enviar. Intentá más tarde.", "ph-x-circle", "danger");
    }
}
// ⚔️ Taunts, listeners anti-abandono y Mini Ligas Privadas migrados a: js/guessr.js
// (toggleLogrosMobile migrado a: js/perfil.js)
// ========================================================
// CONTROL DE MODALES INSTITUCIONALES DEL FOOTER
// ========================================================
function abrirModalAbout() {
    const m = document.getElementById('about-modal-overlay');
    if (m) m.classList.add('active');
}
function cerrarModalAbout() {
    const m = document.getElementById('about-modal-overlay');
    if (m) m.classList.remove('active');
}

function abrirModalTerms() {
    const m = document.getElementById('terms-modal-overlay');
    if (m) m.classList.add('active');
}
function cerrarModalTerms() {
    const m = document.getElementById('terms-modal-overlay');
    if (m) m.classList.remove('active');
}

function abrirModalPublicidad() {
    const m = document.getElementById('ads-modal-overlay');
    if (m) m.classList.add('active');
}
function cerrarModalPublicidad() {
    const m = document.getElementById('ads-modal-overlay');
    if (m) m.classList.remove('active');
}

function abrirModalPrivacyDirecto() {
    const m = document.getElementById('privacy-modal-overlay');
    if (m) {
        m.style.display = 'flex';
        // Habilitamos el scroll sin exigir la lectura obligatoria cuando entra desde el footer
        const ind = document.getElementById('privacy-read-indicator');
        const chk = document.getElementById('privacy-accept-check');
        const btn = document.getElementById('btn-confirm-privacy');
        if (ind) ind.style.display = 'none';
        if (chk) chk.disabled = false;
        if (btn) btn.disabled = false;
    }
}
// 🎴 Generador y compartir Carta FUT migrado a: js/perfil.js