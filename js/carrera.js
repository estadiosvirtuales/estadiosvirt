// =============================================================================
// ⚽ ESTADIOS VIRTUALES - MÓDULO MODO CARRERA, TORNEO DE COPAS, SIMULADOR Y ONCE INICIAL
// =============================================================================
// Contenido:
// - Formaciones tácticas y alineación de Tu Once Inicial
// - Lógica de arrastre Drag & Drop y Touch en el campo táctico
// - Cálculos de OVR por líneas, mejoras con Puntos de Habilidad (SP) y Capitanía
// - Torneo de Copas (Nacional, Continental, Mundial de Clubes, Mundial)
// - Simulador de Partidos 2D horizontal (relato en vivo minuto a minuto, prórroga, penales)
// - Generador de Póster de Campeón 9:16 para historias
// - Hub central del Modo Carrera (Vitrina de Palmarés y Gestión del Club)
// - Salón de Campeones y Ranking de Clubes
// - Modo Temporada de Liga Larga (fixture round-robin de 20 equipos, goleadores y líderes)
// - Ceremonia y Cofre de Botín de Fin de Temporada
// - Registro mutuo Head-to-Head (H2H)
// =============================================================================

// Variables de estado del Once y Simulación
var formacionOnceActual = '4-3-3';
var slotActivoOnce = null;
var dragSourceSlotOnce = null;
var dragSourceAvatarDrawer = null;
var touchOriginIdxOnce = null;
var touchCloneElOnce = null;
var touchMovedOnce = false;
var touchStartXOnce = 0;
var touchStartYOnce = 0;

var torneoEstado = null;
var simIntervalo = null;
var simPreviaTimer = null;
var simHalftimeTimer = null;
var simJugadaTimer = null;
var simRafId = null;
var simVelocidadMult = 1;
var cofreTemporadaPendiente = null;


// --- Formaciones Tácticas Oficiales ---

var FORMACIONES_TACTICAS = {
    '4-3-3': {
        nombre: '4-3-3',
        posiciones: [
            { pos: 'DC', top: '14%', left: '50%' },
            { pos: 'EI', top: '22%', left: '18%' },
            { pos: 'ED', top: '22%', left: '82%' },
            { pos: 'MC', top: '48%', left: '30%' },
            { pos: 'MCD', top: '58%', left: '50%' },
            { pos: 'MC', top: '48%', left: '70%' },
            { pos: 'LI', top: '75%', left: '18%' },
            { pos: 'DFC', top: '76%', left: '38%' },
            { pos: 'DFC', top: '76%', left: '62%' },
            { pos: 'LD', top: '75%', left: '82%' },
            { pos: 'POR', top: '89.5%', left: '50%' }
        ]
    },
    '4-4-2': {
        nombre: '4-4-2',
        posiciones: [
            { pos: 'DC', top: '16%', left: '36%' },
            { pos: 'DC', top: '16%', left: '64%' },
            { pos: 'MI', top: '46%', left: '18%' },
            { pos: 'MC', top: '50%', left: '38%' },
            { pos: 'MC', top: '50%', left: '62%' },
            { pos: 'MD', top: '46%', left: '82%' },
            { pos: 'LI', top: '75%', left: '18%' },
            { pos: 'DFC', top: '76%', left: '38%' },
            { pos: 'DFC', top: '76%', left: '62%' },
            { pos: 'LD', top: '75%', left: '82%' },
            { pos: 'POR', top: '89.5%', left: '50%' }
        ]
    },
    '4-2-3-1': {
        nombre: '4-2-3-1',
        posiciones: [
            { pos: 'DC', top: '14%', left: '50%' },
            { pos: 'MI', top: '34%', left: '18%' },
            { pos: 'MCO', top: '32%', left: '50%' },
            { pos: 'MD', top: '34%', left: '82%' },
            { pos: 'MCD', top: '54%', left: '36%' },
            { pos: 'MCD', top: '54%', left: '64%' },
            { pos: 'LI', top: '75%', left: '18%' },
            { pos: 'DFC', top: '76%', left: '38%' },
            { pos: 'DFC', top: '76%', left: '62%' },
            { pos: 'LD', top: '75%', left: '82%' },
            { pos: 'POR', top: '89.5%', left: '50%' }
        ]
    },
    '4-3-1-2': {
        nombre: '4-3-1-2',
        posiciones: [
            { pos: 'DC', top: '15%', left: '36%' },
            { pos: 'DC', top: '15%', left: '64%' },
            { pos: 'MCO', top: '34%', left: '50%' },
            { pos: 'MC', top: '50%', left: '26%' },
            { pos: 'MCD', top: '56%', left: '50%' },
            { pos: 'MC', top: '50%', left: '74%' },
            { pos: 'LI', top: '75%', left: '18%' },
            { pos: 'DFC', top: '76%', left: '38%' },
            { pos: 'DFC', top: '76%', left: '62%' },
            { pos: 'LD', top: '75%', left: '82%' },
            { pos: 'POR', top: '89.5%', left: '50%' }
        ]
    },
    '3-5-2': {
        nombre: '3-5-2',
        posiciones: [
            { pos: 'DC', top: '15%', left: '38%' },
            { pos: 'SD', top: '20%', left: '62%' },
            { pos: 'MI', top: '45%', left: '16%' },
            { pos: 'MC', top: '48%', left: '36%' },
            { pos: 'MCD', top: '58%', left: '50%' },
            { pos: 'MC', top: '48%', left: '64%' },
            { pos: 'MD', top: '45%', left: '84%' },
            { pos: 'DFC', top: '75%', left: '26%' },
            { pos: 'DFC', top: '76%', left: '50%' },
            { pos: 'DFC', top: '75%', left: '74%' },
            { pos: 'POR', top: '89.5%', left: '50%' }
        ]
    }
};

// --- Desafío Asincrónico de Planteles ---

// ⚔️ DISPARADOR DEL DESAFÍO DE PLANTELES ASINCRÓNICO
window.iniciarDesafioOnceRivalDirecto = function() {
    const rival = window.datosUltimoRivalInspeccionado;
    if (!rival) return;

    if ((rival.nivelActual || 0) < 4) {
        showToast(`${rival.custom_nick} todavía no tiene los 11 titulares desbloqueados (Requiere Nivel 4) 🔒`, "ph-lock-key", "warning");
        return;
    }

    // 1. Validar que el usuario tenga su equipo completo
    const onceUser = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const fUser = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual]) 
        ? FORMACIONES_TACTICAS[formacionOnceActual] 
        : { posiciones: Array(11).fill(0) };
    let countUser = 0;
    for (let i = 0; i < fUser.posiciones.length; i++) {
        if (onceUser[i]) countUser++;
    }

    if (countUser < 11) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    cerrarModalInspeccionarRival();

    // 2. Determinar titulares y OVR del rival
    let titularesRival = [];
    let ovrRival = rival.ovr || 60;

    if (rival.onceInicial && Object.keys(rival.onceInicial).length > 0) {
        const onceR = rival.onceInicial;
        const idsTitulares = Object.keys(onceR).filter(k => k !== 'DT' && onceR[k]).map(k => onceR[k]);
        if (idsTitulares.length > 0) {
            titularesRival = idsTitulares.map(id => obtenerNombreAvatar(id));
            let sumaOvr = 0;
            idsTitulares.forEach(id => {
                const extra = (rival.mejorasJugadores && rival.mejorasJugadores[id]) || 0;
                const item = AVATARES_LISTA.find(a => a.id === id);
                const nivelReq = item ? item.nivel : 0;
                const baseOvr = NIVELES[nivelReq]?.ovr || 50;
                sumaOvr += Math.min(99, baseOvr + extra);
            });
            ovrRival = Math.round(sumaOvr / idsTitulares.length);
                if (rival.onceCapitan) ovrRival += 2;
                if (onceR['DT']) ovrRival += 1;
                ovrRival = Math.min(99, ovrRival);
            }
        }

    // Si el rival aún no armó su once, le asignamos titulares acordes a su nivel
    if (!titularesRival.length) {
        const poolDesbloqueados = AVATARES_LISTA.filter(a => (rival.nivelActual || 0) >= a.nivel);
        const poolFinal = poolDesbloqueados.length >= 11 ? poolDesbloqueados : AVATARES_LISTA.slice(0, 11);
        titularesRival = poolFinal.slice(0, 11).map(a => a.label);
    }

    // 3. Estructuración del partido único
    torneoEstado = {
        tier: 'desafio_once',
        config: {
            nombre: 'Desafío de Planteles',
            premioSP: 2
        },
        rondaIdx: 0,
        rivales: [{
            id: rival.onceEscudo || rival.avatar_logo || 'ev',
            nombre: rival.custom_nick,
            ovr: ovrRival,
            titulares: titularesRival
        }],
        partidoEnCurso: false,
        recorridoPartidos: [],
        esDesafioAsincronico: true
    };

    prepararVistaPartidoCopa();
    document.getElementById('simulador-partido-modal').style.display = 'flex';
};

// --- Motor Principal: Once Inicial, Torneos, Partidos 2D y Modo Carrera ---

// ========================================================
// ⚽ MOTOR DE "TU ONCE INICIAL" (DT, CAPITÁN, ESCUDO & DRAG)
// ========================================================
// (Variables de Once declaradas arriba)

function obtenerOnceInicial() {
    if (!userStats.onceInicial || typeof userStats.onceInicial !== 'object') {
        const guardado = localStorage.getItem('ev_once_inicial_' + getUserId());
        try {
            userStats.onceInicial = guardado ? JSON.parse(guardado) : {};
        } catch(e) {
            userStats.onceInicial = {};
        }
    }
    // 🛡️ Saneamiento: Si un DT quedó en un puesto de campo (0 a 10), pasarlo al slot DT si está libre y liberarlo de la cancha
    const f = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual])
        ? FORMACIONES_TACTICAS[formacionOnceActual]
        : { posiciones: Array(11).fill(0) };
    let huboCorreccion = false;
    for (let i = 0; i < f.posiciones.length; i++) {
        const a = userStats.onceInicial[i];
        if (a && typeof esAvatarDT === 'function' && esAvatarDT(a)) {
            if (!userStats.onceInicial['DT']) {
                userStats.onceInicial['DT'] = a;
            }
            delete userStats.onceInicial[i];
            huboCorreccion = true;
        }
    }
    if (huboCorreccion) {
        localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify(userStats.onceInicial));
    }
    return userStats.onceInicial;
}

function obtenerCapitanOnce() {
    const once = (userStats && userStats.onceInicial) || obtenerOnceInicial();
    const dtId = once['DT'] ? String(once['DT']).replace(/\.png$/i, '.webp') : null;
    const fActual = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual])
        ? FORMACIONES_TACTICAS[formacionOnceActual]
        : null;

    // Obtener futbolistas titulares válidos en cancha (posiciones 0 a 10)
    const titulares = [];
    if (fActual && fActual.posiciones) {
        fActual.posiciones.forEach((_, idx) => {
            if (once[idx]) {
                const a = String(once[idx]).replace(/\.png$/i, '.webp');
                if (a !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(a))) titulares.push(a);
            }
        });
    } else {
        Object.keys(once).forEach(k => {
            if (k !== 'DT' && once[k]) {
                const a = String(once[k]).replace(/\.png$/i, '.webp');
                if (a !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(a))) titulares.push(a);
            }
        });
    }

    const rawCap = (userStats.onceCapitan || localStorage.getItem('ev_once_capitan_' + getUserId()) || '')
        .replace(/\.png$/i, '.webp');

    // 1. Si el usuario designó explícitamente un capitán en el once y sigue siendo titular (y no es DT)
    if (rawCap && titulares.includes(rawCap) && rawCap !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(rawCap))) {
        return rawCap;
    }

    // Si el capitán guardado ya no es titular de campo, limpiar la referencia desfasada
    if (rawCap && (!titulares.includes(rawCap) || rawCap === dtId || (typeof esAvatarDT === 'function' && esAvatarDT(rawCap)))) {
        userStats.onceCapitan = null;
        localStorage.removeItem('ev_once_capitan_' + getUserId());
    }

    // 2. Si el avatar de su carta FUT es titular en el once (y no es DT), es su capitán natural
    const avatarFut = (typeof getPref === 'function' ? getPref('ev_avatar_hair', '') : '')
        .replace(/\.png$/i, '.webp');
    if (avatarFut && titulares.includes(avatarFut) && avatarFut !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(avatarFut))) {
        return avatarFut;
    }

    // 3. Si no hay capitán explícito ni avatar FUT en cancha, buscar el titular de campo con mayor OVR (priorizando jugadores de campo sobre arquero)
    if (titulares.length > 0) {
        const jugadoresCampo = titulares.filter((id, idx) => idx !== 0);
        const poolCandidatos = jugadoresCampo.length > 0 ? jugadoresCampo : titulares;
        const ordenados = [...poolCandidatos].sort((a, b) => obtenerOvrJugador(b) - obtenerOvrJugador(a));
        return ordenados[0];
    }

    // 4. Último recurso: avatar de la carta FUT del usuario (siempre que no sea DT)
    if (avatarFut && avatarFut !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(avatarFut))) {
        return avatarFut;
    }

    return titulares[0] || '1.webp';
}

// ⚡ MOTOR DE OVR INDIVIDUAL Y DEL EQUIPO
function obtenerOvrJugador(avatarId) {
    if (!avatarId) return 50;
    const aLimpio = avatarId.replace(/\.png$/i, '.webp');
    const item = AVATARES_LISTA.find(a => a.id === aLimpio);
    const nivelReq = item ? item.nivel : 0;
    const baseOvr = NIVELES[nivelReq]?.ovr || 50;
    const extra = (userStats.mejorasJugadores && userStats.mejorasJugadores[aLimpio]) || 0;
    return Math.min(99, baseOvr + extra);
}

function calcularOvrEquipoOnce() {
    const once = obtenerOnceInicial();
    const f = FORMACIONES_TACTICAS[formacionOnceActual] || FORMACIONES_TACTICAS['4-3-3'];
    let suma = 0;
    let count = 0;
    for (let i = 0; i < f.posiciones.length; i++) {
        if (once[i]) {
            suma += obtenerOvrJugador(once[i]);
            count++;
        }
    }
    if (count === 0) return 0;
    let ovrFinal = Math.round(suma / count);
    if (typeof obtenerCapitanOnce === 'function' && obtenerCapitanOnce()) ovrFinal += 2;
    if (once['DT']) ovrFinal += 1;

    // ⚡ Bono de Química Global Real (+1, +2 o +3 OVR)
    if (typeof calcularYRenderizarQuimicaOnce === 'function') {
        const chem = calcularYRenderizarQuimicaOnce(f, once);
        if (chem && chem.bonoOvr) {
            ovrFinal += chem.bonoOvr;
        }
    }

    return Math.min(99, ovrFinal);
}

function calcularOvrLineasOnce() {
    const once = obtenerOnceInicial();
    const f = FORMACIONES_TACTICAS[formacionOnceActual] || FORMACIONES_TACTICAS['4-3-3'];
    const def = [], med = [], del = [];
    for (let i = 0; i < f.posiciones.length; i++) {
        const id = once[i];
        if (!id) continue;
        const ovr = obtenerOvrJugador(id);
        const pos = f.posiciones[i]?.pos || '';
        if (['POR', 'DFC', 'LD', 'LI'].includes(pos)) def.push(ovr);
        else if (['MCD', 'MC', 'MCO', 'MD', 'MI'].includes(pos)) med.push(ovr);
        else del.push(ovr);
    }
    const prom = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : '--';
    return { def: prom(def), med: prom(med), del: prom(del) };
}

// ⚡ Curva de Costo Progresiva para Entrenamiento (+1 OVR)
function calcularCostoSPMejora(ovrActual) {
    if (ovrActual < 70) return 2;
    if (ovrActual < 80) return 3;
    if (ovrActual < 85) return 4;
    if (ovrActual < 90) return 6;
    if (ovrActual < 95) return 8;
    return 12; // 95 a 98
}
window.calcularCostoSPMejora = calcularCostoSPMejora;

window.mejorarJugadorOnce = function(avatarId, event) {
    if (event) event.stopPropagation();
    const aLimpio = avatarId.replace(/\.png$/i, '.webp');
    const ovrActual = obtenerOvrJugador(aLimpio);
    if (ovrActual >= 99) {
        showToast("¡Este futbolista ya alcanzó el tope de 99 OVR! 👑", "ph-crown", "info");
        return;
    }
    const spDisponibles = userStats.puntosHabilidad || 0;
    const costoSP = calcularCostoSPMejora(ovrActual);
    if (spDisponibles < costoSP) {
        showToast(`Necesitás ${costoSP} SP para entrenar a este futbolista (OVR ${ovrActual}). ¡Jugá StadiumGuessr o torneos para sumar más! ⚽`, "ph-warning-circle", "warning");
        return;
    }
    userStats.puntosHabilidad = spDisponibles - costoSP;
    if (!userStats.mejorasJugadores) userStats.mejorasJugadores = {};
    userStats.mejorasJugadores[aLimpio] = (userStats.mejorasJugadores[aLimpio] || 0) + 1;
    guardarStats();
    renderizarOnceInicial();

    // 🛡️ Prevenir apilamiento de carteles: eliminar inmediatamente cualquier toast de entrenamiento previo
    const toastPrevio = document.querySelector('.toast-entrenamiento');
    if (toastPrevio) toastPrevio.remove();

    showToast(`¡${obtenerNombreAvatar(aLimpio)} subió a ${ovrActual + 1} OVR! (-${costoSP} SP) 🔥`, "ph-lightning", "success toast-entrenamiento");
};

// ========================================================
// 🏆 ACCESO Y CONTROL DEL TORNEO DE COPAS
// ========================================================
window.clickBotonTorneoOnce = function() {
    const once = obtenerOnceInicial();
    const f = FORMACIONES_TACTICAS[formacionOnceActual] || FORMACIONES_TACTICAS['4-3-3'];
    let count = 0;
    for (let i = 0; i < f.posiciones.length; i++) {
        if (once[i]) count++;
    }

    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (miNivel < 4 || count < 11) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    cerrarModalOnceInicial(false);
    abrirModalTorneoCopas();
};

window.abrirModalTorneoCopas = function() {
    const modal = document.getElementById('torneo-copas-modal');
    if (!modal) return;
    const ovrEquipo = calcularOvrEquipoOnce();
    const sub = document.getElementById('torneo-team-ovr-sub');
    if (sub) {
        sub.innerHTML = `Tu equipo promedia <b style="color:#38bdf8;">${ovrEquipo} OVR</b> · Elegí una copa para competir:`;
    }

    const copas = userStats.copasGanadas || [];
    const ganoNac = copas.some(c => c.tier === 'nacional');
    const ganoCont = copas.some(c => c.tier === 'continental');
    const ganoClubes = copas.some(c => c.tier === 'mundial_clubes');
    const ganoMundial = copas.some(c => c.tier === 'mundial');

    // 💾 Verificamos si hay un torneo guardado en curso
    const guardadoRaw = localStorage.getItem('ev_torneo_guardado_' + getUserId());
    let torneoGuardado = null;
    try { torneoGuardado = guardadoRaw ? JSON.parse(guardadoRaw) : null; } catch(e) {}

    // 🥉 TIER 1: Copa Nacional
    const cardNac = document.querySelector('.torneo-tier-card[onclick*="nacional"]');
    if (cardNac) {
        const st = cardNac.querySelector('.tier-status');
        const btn = cardNac.querySelector('.tier-action-btn');
        if (torneoGuardado && torneoGuardado.tier === 'nacional' && !torneoGuardado.esDesafioAsincronico && torneoGuardado.rondaIdx < 4) {
            const faseTxt = RONDAS_NOMBRES[torneoGuardado.rondaIdx] || 'En curso';
            if (st) {
                st.className = 'tier-status ready';
                st.innerHTML = `<i class="ph-bold ph-hourglass-medium"></i> En curso (${faseTxt})`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn animate-pulse';
                btn.disabled = false;
                btn.innerHTML = `<span>Continuar (${faseTxt})</span> <i class="ph-bold ph-play"></i>`;
            }
        } else {
            if (ganoNac && st) {
                st.className = 'tier-status ready won';
                st.innerHTML = `👑 Campeón`;
            } else if (st) {
                st.className = 'tier-status ready';
                st.innerHTML = `<i class="ph-bold ph-check"></i> Disponible`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn';
                btn.disabled = false;
                btn.innerHTML = `<span>Disputar Copa</span> <i class="ph-bold ph-play"></i>`;
            }
        }
    }

    // 🥈 TIER 2: Copa Continental
    const cardCont = document.getElementById('tier-card-continental');
    if (cardCont) {
        const okCont = ovrEquipo >= 70 || ganoNac;
        cardCont.classList.toggle('tier-unlocked', okCont);
        cardCont.classList.toggle('tier-locked', !okCont);
        const st = cardCont.querySelector('.tier-status');
        const btn = cardCont.querySelector('.tier-action-btn');
        if (torneoGuardado && torneoGuardado.tier === 'continental' && !torneoGuardado.esDesafioAsincronico && torneoGuardado.rondaIdx < 4) {
            const faseTxt = RONDAS_NOMBRES[torneoGuardado.rondaIdx] || 'En curso';
            if (st) {
                st.className = 'tier-status ready';
                st.innerHTML = `<i class="ph-bold ph-hourglass-medium"></i> En curso (${faseTxt})`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn animate-pulse';
                btn.disabled = false;
                btn.innerHTML = `<span>Continuar</span> <i class="ph-bold ph-play"></i>`;
            }
        } else if (okCont) {
            if (st) {
                st.className = `tier-status ready ${ganoCont ? 'won' : ''}`;
                st.innerHTML = ganoCont ? `👑 Campeón` : `<i class="ph-bold ph-check"></i> Disponible`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn';
                btn.disabled = false;
                btn.innerHTML = `<span>Disputar Copa</span> <i class="ph-bold ph-play"></i>`;
            }
        } else {
            if (st) {
                st.className = 'tier-status locked';
                st.innerHTML = `<i class="ph-bold ph-lock-key"></i> Requiere 70 OVR`;
            }
            if (btn) {
                btn.className = 'btn-3d secondary tier-action-btn';
                btn.disabled = true;
                btn.innerHTML = `<i class="ph-bold ph-lock-key"></i> Bloqueado`;
            }
        }
    }

    // 🥇 TIER 3: Mundial de Clubes
    const cardClubes = document.getElementById('tier-card-mundial-clubes');
    if (cardClubes) {
        const okClubes = ovrEquipo >= 80 || ganoCont;
        cardClubes.classList.toggle('tier-unlocked', okClubes);
        cardClubes.classList.toggle('tier-locked', !okClubes);
        const st = cardClubes.querySelector('.tier-status');
        const btn = cardClubes.querySelector('.tier-action-btn');
        if (torneoGuardado && torneoGuardado.tier === 'mundial_clubes' && !torneoGuardado.esDesafioAsincronico && torneoGuardado.rondaIdx < 4) {
            const faseTxt = RONDAS_NOMBRES[torneoGuardado.rondaIdx] || 'En curso';
            if (st) {
                st.className = 'tier-status ready';
                st.innerHTML = `<i class="ph-bold ph-hourglass-medium"></i> En curso (${faseTxt})`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn animate-pulse';
                btn.disabled = false;
                btn.innerHTML = `<span>Continuar (${faseTxt})</span> <i class="ph-bold ph-play"></i>`;
            }
        } else if (okClubes) {
            if (st) {
                st.className = `tier-status ready ${ganoClubes ? 'won' : ''}`;
                st.innerHTML = ganoClubes ? `👑 Campeón` : `<i class="ph-bold ph-check"></i> Disponible`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn';
                btn.disabled = false;
                btn.innerHTML = `<span>Disputar Copa</span> <i class="ph-bold ph-play"></i>`;
            }
        } else {
            if (st) {
                st.className = 'tier-status locked';
                st.innerHTML = `<i class="ph-bold ph-lock-key"></i> Requiere 80 OVR`;
            }
            if (btn) {
                btn.className = 'btn-3d secondary tier-action-btn';
                btn.disabled = true;
                btn.innerHTML = `<i class="ph-bold ph-lock-key"></i> Bloqueado`;
            }
        }
    }

    // 👑 TIER 4: Copa del Mundo (Selecciones Nacionales)
    const cardMundial = document.getElementById('tier-card-mundial');
    if (cardMundial) {
        const okMundial = ovrEquipo >= 85 || ganoClubes;
        cardMundial.classList.toggle('tier-unlocked', okMundial);
        cardMundial.classList.toggle('tier-locked', !okMundial);
        const st = cardMundial.querySelector('.tier-status');
        const btn = cardMundial.querySelector('.tier-action-btn');
        if (torneoGuardado && torneoGuardado.tier === 'mundial' && !torneoGuardado.esDesafioAsincronico && torneoGuardado.rondaIdx < 4) {
            const faseTxt = RONDAS_NOMBRES[torneoGuardado.rondaIdx] || 'En curso';
            if (st) {
                st.className = 'tier-status ready';
                st.innerHTML = `<i class="ph-bold ph-hourglass-medium"></i> En curso (${faseTxt})`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn animate-pulse';
                btn.disabled = false;
                btn.innerHTML = `<span>Continuar (${faseTxt})</span> <i class="ph-bold ph-play"></i>`;
            }
        } else if (okMundial) {
            if (st) {
                st.className = `tier-status ready ${ganoMundial ? 'won' : ''}`;
                st.innerHTML = ganoMundial ? `👑 Campeón` : `<i class="ph-bold ph-check"></i> Disponible`;
            }
            if (btn) {
                btn.className = 'btn-3d primary tier-action-btn';
                btn.disabled = false;
                btn.innerHTML = `<span>Disputar Copa</span> <i class="ph-bold ph-play"></i>`;
            }
        } else {
            if (st) {
                st.className = 'tier-status locked';
                st.innerHTML = `<i class="ph-bold ph-lock-key"></i> Requiere 85 OVR`;
            }
            if (btn) {
                btn.className = 'btn-3d secondary tier-action-btn';
                btn.disabled = true;
                btn.innerHTML = `<i class="ph-bold ph-lock-key"></i> Bloqueado`;
            }
        }
    }

    modal.style.display = 'flex';
};

window.cerrarModalTorneoCopas = function(volverACarrera = true) {
    const modal = document.getElementById('torneo-copas-modal');
    if (modal) modal.style.display = 'none';
    if (volverACarrera && typeof abrirModalModoCarrera === 'function') {
        abrirModalModoCarrera();
    }
};

// ========================================================
// 🏆 MOTOR DE SIMULACIÓN Y TORNEOS DE COPAS (OVRs FIJOS)
// ========================================================
// (Variables de torneo declaradas arriba)

// 📊 RATINGS FIJOS OFICIALES DE CADA EQUIPO Y SELECCIÓN
const EQUIPOS_OVR = {
    // 🌍 SELECCIONES NACIONALES
    'ar': 87, 'fr': 87, 'gb-eng': 86, 'es': 86, 'br': 85, 'de': 85, 'pt': 85, 'nl': 84,
    'it': 83, 'uy': 82, 'co': 81, 'hr': 81, 'mar': 81, 'be': 80, 'jp': 79, 'sen': 79,
    'us': 78, 'mx': 78, 'ec': 78, 'ch': 78, 'dk': 78, 'at': 77, 'srb': 77, 'pl': 77,
    'tr': 77, 'ua': 76, 'ng': 76, 'ci': 76, 'eg': 76, 'kr': 76, 'cl': 75, 'pe': 74,
    'py': 75, 've': 74, 'bo': 70, 'au': 74, 'ca': 76, 'cz': 76, 'no': 77, 'sc': 76,

    // 👑 ÉLITE MUNDIAL (CLUBES)
    'esp_realmadrid': 88, 'eng_mancity': 88, 'eng_liverpool': 87, 'ger_bayern': 86,
    'esp_barcelona': 86, 'eng_arsenal': 86, 'ita_inter': 85, 'fra_psg': 85,
    'esp_atletico': 84, 'ita_juventus': 83, 'ita_milan': 83, 'eng_chelsea': 83,
    'eng_manunited': 82, 'ger_dortmund': 82,

    // 🌎 CONTINENTAL (CLUBES DE PRIMERA DIVISIÓN)
    'ger_leverkusen': 82, 'ita_atalanta': 81, 'ita_napoli': 81, 'eng_tottenham': 81,
    'eng_astonvilla': 80, 'eng_newcastle': 80, 'ita_roma': 80, 'ita_lazio': 79,
    'esp_realsociedad': 79, 'esp_athletic': 79, 'por_sporting': 80, 'por_benfica': 80,
    'por_porto': 79, 'ned_psv': 79, 'ned_feyenoord': 78, 'ned_ajax': 78,
    'bra_flamengo': 78, 'bra_palmeiras': 78, 'bra_botafogo': 77, 'bra_atleticomg': 76,
    'bra_saopaulo': 76, 'bra_fluminense': 76, 'bra_internacional': 76, 'bra_gremio': 75,
    'bra_cruzeiro': 75, 'bra_corinthians': 75, 'bra_bahia': 74, 'bra_vasco': 74,
    'arg_river': 76, 'arg_boca': 75, 'arg_racing': 75, 'arg_velez': 74,
    'arg_talleres': 74, 'arg_estudiantes': 74, 'arg_independiente': 73, 'arg_sanlorenzo': 73,
    'arg_huracan': 73, 'arg_rosario': 73, 'arg_lanus': 73, 'arg_argentinos': 73,
    'arg_godoycruz': 72, 'arg_defensa': 72, 'arg_belgrano': 72, 'arg_newells': 72,
    'arg_gimnasia': 72, 'arg_banfield': 72, 'arg_atleticotucuman': 72, 'arg_centralcordoba': 71,
    'arg_barracas': 71, 'arg_sarmiento': 70, 'arg_riestra': 70, 'arg_indrivadavia': 71,
    'arg_aldosivi': 69, 'arg_sanmartinsj': 68,
    'col_millonarios': 72, 'col_nacional': 73, 'col_america': 72, 'col_junior': 72,
    'col_santafe': 71, 'col_tolima': 71, 'col_cali': 70, 'col_medellin': 71,
    'chi_colocolo': 73, 'chi_uchile': 72, 'chi_ucatolica': 72, 'chi_coquimbo': 70,
    'mex_america': 78, 'mex_monterrey': 77, 'mex_tigres': 77, 'mex_cruzazul': 76,
    'mex_chivas': 75, 'mex_toluca': 75, 'mex_pumas': 74, 'mex_pachuca': 74,
    'mex_leon': 73, 'mex_santos': 72, 'mex_atlas': 72, 'mex_sanluis': 71,
    'mex_tijuana': 71, 'mex_necaxa': 70, 'mex_puebla': 69, 'mex_juarez': 69,
    'mex_queretaro': 68, 'mex_atlante': 66,

    // 🏆 COPA NACIONAL (CLUBES DE ASCENSO / MENORES)
    'arg_colon': 66, 'arg_quilmes': 65, 'arg_sanmartintuc': 65, 'arg_ferro': 64,
    'arg_chacarita': 64, 'arg_allboys': 63, 'arg_atlanta': 63, 'arg_almirantebrown': 63,
    'arg_moron': 63, 'arg_gimnasiamza': 63, 'arg_aldosivi': 64, 'arg_patronato': 63,
    'arg_temperley': 63, 'arg_depmadryn': 62, 'arg_estudiantesba': 62, 'arg_estudiantesrc': 62,
    'arg_almagro': 62, 'arg_chacoforever': 62, 'arg_maipu': 62, 'arg_defensores': 62,
    'arg_agropecuario': 61, 'arg_mitre': 61, 'arg_guemes': 60, 'arg_sanmiguel': 60,
    'arg_santelmo': 61, 'arg_tristansuarez': 60, 'arg_colegiales': 59, 'arg_acassuso': 58,
    'arg_losandes': 59, 'arg_midland': 58, 'arg_centralnorte': 58, 'arg_ciudadbolivar': 58,
    'eng_sunderland': 69, 'eng_coventry': 68, 'eng_hull': 67, 'ger_paderborn': 68,
    'ger_elversberg': 67, 'bra_chapecoense': 66, 'bra_coritiba': 67, 'bra_mirassol': 67,
    'bra_remo': 63, 'col_cucuta': 64, 'col_llaneros': 63, 'col_chico': 63,
    'chi_laserena': 65, 'chi_dconcepcion': 63, 'chi_limache': 62, 'ned_cambuur': 65,
    'ned_telstar': 62, 'por_tondela': 66, 'por_alverca': 64
};

const TORNEOS_CONFIG = {
    'nacional': {
        nombre: 'Copa Desafío',
        premioSP: 6,
        clubesIds: [
            'arg_acassuso', 'arg_agropecuario', 'arg_allboys', 'arg_almagro', 'arg_almirantebrown',
            'arg_atlanta', 'arg_centralnorte', 'arg_chacarita', 'arg_chacoforever',
            'arg_ciudadbolivar', 'arg_colegiales', 'arg_defensores', 'arg_depmadryn', 'arg_maipu',
            'arg_moron', 'arg_estudiantesba', 'arg_estudiantesrc', 'arg_ferro', 'arg_gimnasiamza',
            'arg_guemes', 'arg_losandes', 'arg_midland', 'arg_mitre', 'arg_patronato',
            'arg_quilmes', 'arg_colon', 'arg_aldosivi', 'arg_sanmartintuc', 'arg_sanmiguel',
            'arg_santelmo', 'arg_temperley', 'arg_tristansuarez', 'chi_limache', 'chi_dconcepcion',
            'chi_laserena', 'col_cucuta', 'col_llaneros', 'col_chico', 'bra_remo',
            'bra_chapecoense', 'bra_mirassol', 'bra_coritiba', 'eng_coventry', 'eng_hull',
            'eng_sunderland', 'ger_elversberg', 'ger_paderborn', 'ned_telstar', 'ned_cambuur',
            'por_alverca', 'por_tondela'
        ]
    },
    'continental': {
        nombre: 'Copa Continental',
        premioSP: 12,
        clubesIds: [
            'arg_boca', 'arg_river', 'arg_racing', 'arg_independiente', 'arg_sanlorenzo',
            'arg_velez', 'arg_estudiantes', 'arg_talleres', 'arg_huracan', 'arg_rosario',
            'arg_lanus', 'arg_argentinos', 'arg_godoycruz', 'arg_defensa', 'arg_belgrano',
            'bra_flamengo', 'bra_palmeiras', 'bra_botafogo', 'bra_atleticomg', 'bra_saopaulo',
            'bra_fluminense', 'bra_internacional', 'bra_gremio', 'bra_cruzeiro', 'bra_corinthians',
            'col_nacional', 'col_millonarios', 'col_america', 'col_junior', 'col_santafe',
            'chi_colocolo', 'chi_uchile', 'chi_ucatolica', 'chi_coquimbo',
            'mex_america', 'mex_monterrey', 'mex_tigres', 'mex_cruzazul', 'mex_chivas', 'mex_toluca',
            'esp_realsociedad', 'esp_athletic', 'esp_sevilla', 'esp_betis',
            'ita_roma', 'ita_lazio', 'ita_atalanta', 'ita_napoli',
            'eng_astonvilla', 'eng_newcastle', 'eng_tottenham',
            'por_sporting', 'por_benfica', 'por_porto',
            'ned_psv', 'ned_feyenoord', 'ned_ajax', 'ger_leverkusen'
        ]
    },
    'mundial_clubes': {
        nombre: 'Mundial de Clubes',
        premioSP: 15,
        clubesIds: [
            'esp_realmadrid', 'eng_mancity', 'eng_liverpool', 'ger_bayern', 'esp_barcelona',
            'eng_arsenal', 'ita_inter', 'fra_psg', 'esp_atletico', 'ita_juventus',
            'ita_milan', 'eng_chelsea', 'eng_manunited', 'ger_dortmund'
        ]
    },
    'mundial': {
        nombre: 'Copa del Mundo',
        premioSP: 15,
        clubesIds: [
            'ar', 'fr', 'gb-eng', 'es', 'br', 'de', 'pt', 'nl', 'it', 'uy',
            'co', 'hr', 'mar', 'be', 'jp', 'sen', 'us', 'mx', 'ec', 'dk'
        ]
    }
};

const RONDAS_NOMBRES = ['Octavos de Final', 'Cuartos de Final', 'Semifinal', 'Gran Final'];

window.seleccionarCopaParaJugar = function(tierKey) {
    const ovrEquipo = calcularOvrEquipoOnce();
    const copas = userStats.copasGanadas || [];

    if (tierKey === 'continental' && ovrEquipo < 70 && !copas.some(c => c.tier === 'nacional')) {
        showToast("Tu equipo necesita al menos 70 OVR o ganar la Copa Desafío para clasificar 🔒", "ph-lock-key", "warning");
        return;
    }
    if (tierKey === 'mundial_clubes' && ovrEquipo < 80 && !copas.some(c => c.tier === 'continental')) {
        showToast("El Mundial de Clubes requiere al menos 80 OVR o ganar la Copa Continental 🔒", "ph-lock-key", "warning");
        return;
    }
    if (tierKey === 'mundial' && ovrEquipo < 85 && !copas.some(c => c.tier === 'mundial_clubes')) {
        showToast("La Copa del Mundo requiere un Once Galáctico de 85+ OVR o ganar el Mundial de Clubes 👑🔒", "ph-lock-key", "warning");
        return;
    }

    cerrarModalTorneoCopas(false);
    cerrarModalOnceInicial(false);
    iniciarTorneoDeCopas(tierKey);
};

function iniciarTorneoDeCopas(tierKey) {
    const cfg = TORNEOS_CONFIG[tierKey] || TORNEOS_CONFIG['nacional'];
    
    // 🎯 TRACKING GA4: Torneo de Modo Carrera iniciado
    if (typeof window.trackEvento === 'function') {
        window.trackEvento('modo_carrera_copa', { torneo: cfg.nombre || tierKey });
    }

    // 💾 Si existe una partida guardada de esta misma copa, la reanudamos
    const guardadoRaw = localStorage.getItem('ev_torneo_guardado_' + getUserId());
    let guardado = null;
    try { guardado = guardadoRaw ? JSON.parse(guardadoRaw) : null; } catch(e) {}

    if (guardado && guardado.tier === tierKey && !guardado.esDesafioAsincronico && guardado.rondaIdx < 4) {
        torneoEstado = guardado;
        torneoEstado.partidoEnCurso = false;
        prepararVistaPartidoCopa();
        document.getElementById('simulador-partido-modal').style.display = 'flex';
        showToast(`¡Retomando ${torneoEstado.config.nombre} en ${RONDAS_NOMBRES[torneoEstado.rondaIdx]}! 🏆`, "ph-play", "info");
        return;
    }

    let pool = BANDERAS_LISTA.filter(b => cfg.clubesIds.includes(b.id));
    if (pool.length < 4) pool = BANDERAS_LISTA.filter(b => b.id !== 'ev');

    // Elegimos 4 rivales al azar
    const rivalesElegidos = [];
    const copiaPool = [...pool];
    for (let i = 0; i < 4; i++) {
        if (!copiaPool.length) break;
        const idx = Math.floor(Math.random() * copiaPool.length);
        const item = copiaPool.splice(idx, 1)[0];
        const ovrReal = EQUIPOS_OVR[item.id] || 70;
        rivalesElegidos.push({
            id: item.id,
            nombre: item.label,
            ovr: ovrReal
        });
    }

    // 🎯 CURVA DE TORNEO PERFECTA: Ordenamos de menor a mayor OVR (Octavos -> Final)
    rivalesElegidos.sort((a, b) => a.ovr - b.ovr);

    torneoEstado = {
        tier: tierKey,
        config: cfg,
        rondaIdx: 0,
        rivales: rivalesElegidos,
        partidoEnCurso: false,
        recorridoPartidos: [] // 📜 Guarda cada cruce con marcador y rival
    };

    // Guardamos el estado inicial de la copa
    localStorage.setItem('ev_torneo_guardado_' + getUserId(), JSON.stringify(torneoEstado));

    prepararVistaPartidoCopa();
    document.getElementById('simulador-partido-modal').style.display = 'flex';
}

function prepararVistaPartidoCopa() {
    if (!torneoEstado) return;
    const rondaNombre = RONDAS_NOMBRES[torneoEstado.rondaIdx] || 'Partido de Copa';
    const rival = torneoEstado.rivales[torneoEstado.rondaIdx];
    
    const escudoUsuario = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + getUserId()) || getPref('ev_avatar_logo', 'ev');
    const u = obtenerUsuarioLogueado();
    const nombreUsuario = getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Tu Once');
    const ovrUsuario = calcularOvrEquipoOnce();

    const esDesafio = torneoEstado.esDesafioAsincronico;
    const stageBadgeEl = document.getElementById('sim-stage-title');
    if (stageBadgeEl) {
        stageBadgeEl.className = 'sim-stage-badge';
        stageBadgeEl.textContent = esDesafio ? 'DUELO DE COMUNIDAD' : rondaNombre.toUpperCase();
    }
    document.querySelector('.sim-scoreboard-card')?.classList.remove('campeon-glory');
    document.querySelector('.sim-match-layout')?.classList.remove('campeon-view');
    document.getElementById('sim-tournament-title').textContent = torneoEstado.config.nombre.toUpperCase();

    // 🏟 Ambientación arquitectónica de la arena horizontal
    const arenaEl = document.querySelector('.sim-stadium-arena');
    if (arenaEl) {
        arenaEl.className = `sim-stadium-arena horizontal tier-${esDesafio ? 'continental' : (torneoEstado.tier || 'nacional')}`;
    }

    // Equipo Usuario
    document.getElementById('sim-user-shield').src = obtenerUrlEscudo(escudoUsuario);
    document.getElementById('sim-user-name').textContent = nombreUsuario;
    document.getElementById('sim-user-ovr').textContent = `OVR ${ovrUsuario}`;

    // Club Rival
    document.getElementById('sim-rival-shield').src = obtenerUrlEscudo(rival.id);
    document.getElementById('sim-rival-name').textContent = rival.nombre;
    document.getElementById('sim-rival-ovr').textContent = `OVR ${rival.ovr}`;

    // Marcador y reloj a cero
    document.getElementById('sim-score-user').textContent = '0';
    document.getElementById('sim-score-rival').textContent = '0';
    document.getElementById('sim-match-clock').textContent = 'PREVIA';

    // 📊 Reinicio de estadísticas en vivo
    const posUserEl = document.getElementById('sim-stat-pos-user');
    const posRivalEl = document.getElementById('sim-stat-pos-rival');
    const fillUserEl = document.getElementById('sim-pos-fill-user');
    const fillRivalEl = document.getElementById('sim-pos-fill-rival');
    if (posUserEl) posUserEl.textContent = '50%';
    if (posRivalEl) posRivalEl.textContent = '50%';
    if (fillUserEl) fillUserEl.style.width = '50%';
    if (fillRivalEl) fillRivalEl.style.width = '50%';

    const tirosU = document.getElementById('sim-stat-tiros-user');
    const tirosR = document.getElementById('sim-stat-tiros-rival');
    const cornU = document.getElementById('sim-stat-corners-user');
    const cornR = document.getElementById('sim-stat-corners-rival');
    const faltU = document.getElementById('sim-stat-faltas-user');
    const faltR = document.getElementById('sim-stat-faltas-rival');
    if (tirosU) tirosU.textContent = '0 (0)';
    if (tirosR) tirosR.textContent = '0 (0)';
    if (cornU) cornU.textContent = '0';
    if (cornR) cornR.textContent = '0';
    if (faltU) faltU.textContent = '0';
    if (faltR) faltR.textContent = '0';

    // ⚽ Reinicio del campo horizontal 2D y jugadores
    const ball = document.getElementById('sim-pitch-ball');
    if (ball) {
        ball.style.left = '50%';
        ball.style.top = '50%';
        ball.className = 'sim-pitch-ball';
    }
    const tag = document.getElementById('sim-pitch-tag');
    if (tag) tag.className = 'sim-pitch-tag';
    const playersBox = document.getElementById('sim-pitch-players');
    if (playersBox) playersBox.className = 'sim-pitch-players';
    document.getElementById('sim-goal-left')?.classList.remove('goal-hit-user', 'goal-hit-rival');
    document.getElementById('sim-goal-right')?.classList.remove('goal-hit-user', 'goal-hit-rival');

    // Nombres en extremos de la cancha (Izquierda: Tu Once | Derecha: Rival)
    const bUser = document.getElementById('sim-pitch-badge-user');
    const bRival = document.getElementById('sim-pitch-badge-rival');
    if (bUser) bUser.textContent = nombreUsuario;
    if (bRival) bRival.textContent = rival.nombre;

    const timeline = document.getElementById('sim-events-timeline');
    timeline.innerHTML = `
        <div class="sim-event-placeholder">
            <i class="ph-bold ph-whistle"></i>
            <span>Todo listo en el campo. Tocá <b>Iniciar Partido</b> para disputar los 90 minutos de juego.</span>
        </div>`;

    const btn = document.getElementById('sim-btn-play');
    btn.className = 'btn-3d primary sim-main-btn';
    btn.disabled = false;
    btn.innerHTML = `<span>Iniciar Partido</span> <i class="ph-bold ph-play"></i>`;
    btn.onclick = iniciarSimulacionEnVivo;
}

// (Variables de simulación declaradas arriba)

// ⚡ BOTÓN 2X: Acelera todo el reloj, física y movimientos al doble
window.toggleVelocidadSimulacion = function() {
    if (simVelocidadMult === 1) {
        simVelocidadMult = 2;
    } else if (simVelocidadMult === 2) {
        simVelocidadMult = 3;
    } else {
        simVelocidadMult = 1;
    }

    const btnSpeed = document.getElementById('sim-btn-speed');
    const txt = document.getElementById('sim-speed-text');
    if (btnSpeed) {
        btnSpeed.classList.remove('active-2x', 'active-3x');
        if (simVelocidadMult === 2) {
            btnSpeed.classList.add('active-2x');
            if (txt) txt.textContent = '2x';
            showToast("Velocidad 2x activada ⚡", "ph-fast-forward", "info");
        } else if (simVelocidadMult === 3) {
            btnSpeed.classList.add('active-3x');
            if (txt) txt.textContent = '3x Turbo';
            showToast("Velocidad 3x Turbo activada 🚀", "ph-lightning", "info");
        } else {
            if (txt) txt.textContent = '1x';
            showToast("Velocidad normal (1x)", "ph-play", "info");
        }
    }
};

// ⚡ BOTÓN SALTAR: Fallback por si lo presionan antes de arrancar la previa
window.saltarSimulacionCompleta = function() {
    if (!torneoEstado) return;
    if (torneoEstado.esLiga) {
        const idUserGuardar = getUserId();
        const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + idUserGuardar);
        if (guardadaRaw) {
            try {
                const lObj = JSON.parse(guardadaRaw);
                lObj.fueSimuladaRapida = true;
                localStorage.setItem('ev_liga_guardada_' + idUserGuardar, JSON.stringify(lObj));
            } catch(e) {}
        }
    }
    if (!torneoEstado.partidoEnCurso) {
        iniciarSimulacionEnVivo();
        if (typeof window.saltarSimulacionCompleta === 'function') {
            window.saltarSimulacionCompleta();
        }
    }
};

window.cerrarModalSimuladorPartido = function(volverACarrera = true) {
    if (simRafId) { cancelAnimationFrame(simRafId); simRafId = null; }
    if (simIntervalo) { clearInterval(simIntervalo); simIntervalo = null; }
    if (simPreviaTimer) { clearInterval(simPreviaTimer); simPreviaTimer = null; }
    if (simHalftimeTimer) { clearTimeout(simHalftimeTimer); simHalftimeTimer = null; }
    if (simJugadaTimer) { clearTimeout(simJugadaTimer); simJugadaTimer = null; }
    
    simVelocidadMult = 1;
    const qControls = document.getElementById('sim-quick-controls');
    if (qControls) qControls.style.display = 'none';
    const btnSpeed = document.getElementById('sim-btn-speed');
    if (btnSpeed) {
        btnSpeed.classList.remove('active-2x', 'active-3x');
        const txt = document.getElementById('sim-speed-text');
        if (txt) txt.textContent = '1x';
    }

    document.querySelectorAll('[id^="dot-"], #sim-pitch-ball').forEach(el => { el.style.transition = 'none'; });
    const m = document.getElementById('simulador-partido-modal');
    if (m) m.style.display = 'none';

    // 💾 Solo guardamos si la copa sigue en disputa (no se terminó ni quedaste eliminado)
    if (torneoEstado && !torneoEstado.esDesafioAsincronico && !torneoEstado.terminado && torneoEstado.rondaIdx < 4) {
        torneoEstado.partidoEnCurso = false;
        localStorage.setItem('ev_torneo_guardado_' + getUserId(), JSON.stringify(torneoEstado));
    }

    torneoEstado = null;
    if (typeof verificarSobreBienvenidaPostPartida === 'function') {
        verificarSobreBienvenidaPostPartida();
    }

    if (volverACarrera && typeof abrirModalModoCarrera === 'function') {
        abrirModalModoCarrera();
    }
};

// ========================================================
// ⚡ MOTOR DE FÚTBOL CONTINUO HORIZONTAL (TRANSMISIÓN DE TV)
// ========================================================
window.iniciarSimulacionEnVivo = function() {
    if (!torneoEstado || torneoEstado.partidoEnCurso) return;
    torneoEstado.partidoEnCurso = true;

    if (simRafId) { cancelAnimationFrame(simRafId); simRafId = null; }
    if (simIntervalo) { clearInterval(simIntervalo); simIntervalo = null; }
    if (simPreviaTimer) { clearInterval(simPreviaTimer); simPreviaTimer = null; }
    if (simHalftimeTimer) { clearTimeout(simHalftimeTimer); simHalftimeTimer = null; }
    if (simJugadaTimer) { clearTimeout(simJugadaTimer); simJugadaTimer = null; }

    const btn = document.getElementById('sim-btn-play');
    if (btn) btn.disabled = true;

    // Mostramos la barra de controles rápidos y reseteamos indicador de velocidad
    simVelocidadMult = 1;
    const btnSpeedInit = document.getElementById('sim-btn-speed');
    if (btnSpeedInit) {
        btnSpeedInit.classList.remove('active-2x', 'active-3x');
        const txtInit = document.getElementById('sim-speed-text');
        if (txtInit) txtInit.textContent = '1x';
    }
    const qControls = document.getElementById('sim-quick-controls');
    if (qControls) qControls.style.display = 'flex';

    const timeline = document.getElementById('sim-events-timeline');
    if (timeline) timeline.innerHTML = '';

    const clock = document.getElementById('sim-match-clock');
    const scoreUserEl = document.getElementById('sim-score-user');
    const scoreRivalEl = document.getElementById('sim-score-rival');
    const ballEl = document.getElementById('sim-pitch-ball');
    const tagEl = document.getElementById('sim-pitch-tag');
    const goalLeft = document.getElementById('sim-goal-left');
    const goalRight = document.getElementById('sim-goal-right');

    const posUserEl = document.getElementById('sim-stat-pos-user');
    const posRivalEl = document.getElementById('sim-stat-pos-rival');
    const fillUserEl = document.getElementById('sim-pos-fill-user');
    const fillRivalEl = document.getElementById('sim-pos-fill-rival');
    const tirosUEl = document.getElementById('sim-stat-tiros-user');
    const tirosREl = document.getElementById('sim-stat-tiros-rival');
    const cornUEl = document.getElementById('sim-stat-corners-user');
    const cornREl = document.getElementById('sim-stat-corners-rival');
    const faltUEl = document.getElementById('sim-stat-faltas-user');
    const faltREl = document.getElementById('sim-stat-faltas-rival');

    const canvasSVG = document.getElementById('sim-pitch-canvas');
    if (canvasSVG) canvasSVG.innerHTML = '';
    if (ballEl) { ballEl.style.transition = 'none'; ballEl.className = 'sim-pitch-ball'; }

    // ================= CONFIGURACIÓN FÍSICA HORIZONTAL =================
    const CFG = {
        msPorMinuto: 480,
        velTrote: 18,
        velSprint: 29,
        velPortero: 20,
        velPase: 110,
        velTiro: 120,
        aceleracion: 9,
        pensarMin: 0.12,
        pensarMax: 0.28,
        radioContacto: 3.0,
        tasaRobo: 0.7,
        probFalta: 0.32,
        xMin: 1.5, xMax: 98.5,
        yMin: 3, yMax: 97
    };

    // ================= 1. DATOS DEL PARTIDO =================
    const once = obtenerOnceInicial();
    const capitanId = obtenerCapitanOnce();
    const ovrUsuario = Math.min(99, calcularOvrEquipoOnce());
    const rival = torneoEstado.rivales[torneoEstado.rondaIdx];
    const ovrRival = rival.ovr;
    const fActual = FORMACIONES_TACTICAS[formacionOnceActual] || FORMACIONES_TACTICAS['4-3-3'];

    const userDefensas = [];
    const userVolantes = [];
    const userDelanteros = [];
    let userArquero = 'El Arquero';

    const dtId = once['DT'] ? String(once['DT']).replace(/\.png$/i, '.webp') : null;

    fActual.posiciones.forEach((item, idx) => {
        const idAvatar = once[idx];
        if (!idAvatar) return;
        const cleanId = String(idAvatar).replace(/\.png$/i, '.webp');
        if (cleanId === dtId || (typeof esAvatarDT === 'function' && esAvatarDT(cleanId))) return;
        const nombre = obtenerNombreAvatar(idAvatar);
        if (item.pos === 'POR') userArquero = nombre;
        else if (['DFC', 'LD', 'LI'].includes(item.pos)) userDefensas.push(nombre);
        else if (['MCD', 'MC', 'MCO', 'MD', 'MI'].includes(item.pos)) userVolantes.push(nombre);
        else userDelanteros.push(nombre);
    });
    if (!userDefensas.length) userDefensas.push('La Defensa');
    if (!userVolantes.length) userVolantes.push('El Mediocampo');
    if (!userDelanteros.length) userDelanteros.push('Tu Delantero');

    const nombreCapitan = capitanId ? obtenerNombreAvatar(capitanId) : userDelanteros[0];
    const tit = (rival.titulares && rival.titulares.length) ? rival.titulares : [];
    const rivalDelanteros = tit.length ? tit.slice(0, 4) : [rival.nombre];
    const rivalVolantes = tit.length > 4 ? tit.slice(4, 8) : ['El Mediocampo Rival'];
    const rivalDefensas = tit.length > 8 ? tit.slice(8, 12) : ['La Defensa Rival'];
    const rivalArquero = tit.length > 12 ? tit[12] : 'El Arquero Rival';

    const NOMBRES = {
        user:  { por: [userArquero],  def: userDefensas,  med: userVolantes,  del: userDelanteros },
        rival: { por: [rivalArquero], def: rivalDefensas, med: rivalVolantes, del: rivalDelanteros }
    };

    const difOvr = ovrUsuario - ovrRival;
    const basePosesion = Math.max(38, Math.min(68, Math.round(50 + (difOvr * 0.9))));
    const probExitoUser = Math.max(0.28, Math.min(0.72, 0.50 + (difOvr * 0.035)));

    const statsPartido = {
        tirosTotalesUser: 0, tirosArcoUser: 0, tirosTotalesRival: 0, tirosArcoRival: 0,
        cornersUser: 0, cornersRival: 0, faltasUser: 0, faltasRival: 0, posesionUser: basePosesion
    };

    const actualizarHudStats = () => {
        if (posUserEl) posUserEl.textContent = `${statsPartido.posesionUser}%`;
        if (posRivalEl) posRivalEl.textContent = `${100 - statsPartido.posesionUser}%`;
        if (fillUserEl) fillUserEl.style.width = `${statsPartido.posesionUser}%`;
        if (fillRivalEl) fillRivalEl.style.width = `${100 - statsPartido.posesionUser}%`;
        if (tirosUEl) tirosUEl.textContent = `${statsPartido.tirosTotalesUser} (${statsPartido.tirosArcoUser})`;
        if (tirosREl) tirosREl.textContent = `${statsPartido.tirosTotalesRival} (${statsPartido.tirosArcoRival})`;
        if (cornUEl) cornUEl.textContent = `${statsPartido.cornersUser}`;
        if (cornREl) cornREl.textContent = `${statsPartido.cornersRival}`;
        if (faltUEl) faltUEl.textContent = `${statsPartido.faltasUser}`;
        if (faltREl) faltREl.textContent = `${statsPartido.faltasRival}`;
    };

    // ================= 2. UTILIDADES =================
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const dist = (ay, ax, by, bx) => Math.hypot(ay - by, ax - bx);
    const dirDe = (eq) => eq === 'user' ? 1 : -1;
    const rivalDe = (eq) => eq === 'user' ? 'rival' : 'user';
    const golX = (eq) => eq === 'user' ? 100 : 0;
    const fuerza = (eq) => eq === 'user' ? probExitoUser : 1 - probExitoUser;
    const profDe = (eq, x) => eq === 'user' ? x : 100 - x;
    const xDe = (eq, prof) => eq === 'user' ? prof : 100 - prof;

    // ================= 3. JUGADORES =================
    const POS_BASE = {
        'dot-u-por': [50, 6],
        'dot-u-def1': [18, 18], 'dot-u-def2': [38, 17], 'dot-u-def3': [62, 17], 'dot-u-def4': [82, 18],
        'dot-u-med1': [26, 32], 'dot-u-med2': [50, 30], 'dot-u-med3': [74, 32],
        'dot-u-del1': [22, 44], 'dot-u-del2': [50, 43], 'dot-u-del3': [78, 44],

        'dot-r-del1': [22, 56], 'dot-r-del2': [50, 57], 'dot-r-del3': [78, 56],
        'dot-r-med1': [26, 68], 'dot-r-med2': [50, 70], 'dot-r-med3': [74, 68],
        'dot-r-def1': [18, 82], 'dot-r-def2': [38, 83], 'dot-r-def3': [62, 83], 'dot-r-def4': [82, 82],
        'dot-r-por': [50, 94]
    };

    const jugadores = [];
    const porId = {};
    const equipos = { user: [], rival: [] };

    for (const id in POS_BASE) {
        const eq = id.startsWith('dot-u-') ? 'user' : 'rival';
        const linea = id.endsWith('por') ? 'por' : id.includes('-def') ? 'def' : id.includes('-med') ? 'med' : 'del';
        const idx = linea === 'por' ? 0 : parseInt(id.slice(-1), 10) - 1;
        const lista = NOMBRES[eq][linea];
        const b = POS_BASE[id];
        const el = document.getElementById(id);
        if (el) el.style.transition = 'none';
        const j = {
            id, eq, linea, el,
            nombre: lista[idx % lista.length],
            baseY: b[0], baseX: b[1],
            y: b[0], x: b[1], vy: 0, vx: 0,
            tY: b[0], tX: b[1], vmax: CFG.velTrote,
            fase: Math.random() * 6.28,
            factorVel: 0.93 + Math.random() * 0.14,
            pensar: 0, bloq: 0
        };
        jugadores.push(j);
        porId[id] = j;
        equipos[eq].push(j);
    }

    const porteroDe = (eq) => porId[eq === 'user' ? 'dot-u-por' : 'dot-r-por'];
    const baseMapa = () => { const m = {}; jugadores.forEach(j => { m[j.id] = [j.baseY, j.baseX]; }); return m; };
    const masCercano = (lista, y, x) => {
        let mejor = null, md = Infinity;
        for (const j of lista) { const d = dist(j.y, j.x, y, x); if (d < md) { md = d; mejor = j; } }
        return mejor;
    };
    const rivalMasCercano = (j) => {
        let r = null, d = 999;
        for (const q of equipos[rivalDe(j.eq)]) {
            if (q.linea === 'por') continue;
            const dd = dist(j.y, j.x, q.y, q.x);
            if (dd < d) { d = dd; r = q; }
        }
        return { r, d };
    };
    const distRivalesA = (eq, y, x) => {
        let d = 999;
        for (const q of equipos[rivalDe(eq)]) {
            if (q.linea === 'por') continue;
            d = Math.min(d, dist(q.y, q.x, y, x));
        }
        return d;
    };
    const puntoEnSegmento = (ay, ax, by, bx, py, px) => {
        const vy = by - ay, vx = bx - ax;
        const l2 = vy * vy + vx * vx || 1;
        const t = clamp(((py - ay) * vy + (px - ax) * vx) / l2, 0, 1);
        return { y: ay + vy * t, x: ax + vx * t, t };
    };
    const rematadorPrincipal = (eq) => {
        if (eq === 'user') {
            const cap = equipos.user.find(j => j.nombre === nombreCapitan && j.linea !== 'por');
            if (cap) return cap;
        }
        return porId[eq === 'user' ? 'dot-u-del2' : 'dot-r-del2'];
    };

    // ================= 4. ESTADO, RELOJ Y AGENDA =================
    let tSim = 0;
    const agenda = [];
    const programar = (seg, fn) => agenda.push({ t: tSim + seg, fn });
    const tickAgenda = () => {
        const vencidos = agenda.filter(a => a.t <= tSim).sort((a, b) => a.t - b.t);
        if (!vencidos.length) return;
        vencidos.forEach(a => agenda.splice(agenda.indexOf(a), 1));
        vencidos.forEach(a => a.fn());
    };

    let estado = 'previa';
    let relojPausado = true;
    let reposMap = null;
    let gameMin = 1;
    let primerTiempoTerminado = false;
    const tiempoDescuento1T = Math.floor(Math.random() * 2) + 1;
    const tiempoDescuento2T = Math.floor(Math.random() * 3) + 3;
    let golesUser = 0, golesRival = 0;
    const tPos = { user: basePosesion / 100 * 6, rival: (100 - basePosesion) / 100 * 6 };
    let tagId = 0;
    let hudAcum = 0;
    let ultimoRelatoMin = 0;

    const balon = {
        y: 50, x: 50, vy: 0, vx: 0,
        modo: 'muerto',
        dueno: null, eq: 'user', ultimo: 'user',
        tipo: null, oy: 0, ox: 0, dy: 50, dx: 50, dur: 1, t: 0,
        receptor: null, interceptor: null, preferido: null,
        alLlegar: null, forzarPase: false, keeperObj: null, pasadorPrevio: null
    };

    const minTxt = () => {
        const m = Math.floor(gameMin);
        if (!primerTiempoTerminado && m > 45) return `45+${m - 45}`;
        if (m > 90) return `90+${m - 90}`;
        return `${m}`;
    };
    const narrar = (tipo, texto) => {
        if (!timeline) return;
        ultimoRelatoMin = gameMin;
        const placeholder = timeline.querySelector('.sim-event-placeholder');
        if (placeholder) placeholder.remove();
        const row = document.createElement('div');
        row.className = `sim-event-row ${tipo}`;
        row.innerHTML = `<span class="sim-ev-min">${minTxt()}'</span> <span class="sim-ev-text">${texto}</span>`;
        timeline.appendChild(row);

        // Auto-scroll inmediato para que el relato recién entrado siempre esté visible sin cortes
        timeline.scrollTop = timeline.scrollHeight;

        // En móvil mantenemos 1 relato destacado limpio para evitar saltos o desbordes; en desktop hasta 3
        const maxRelatos = (window.innerWidth <= 768) ? 1 : 3;
        while (timeline.children.length > maxRelatos) {
            timeline.removeChild(timeline.firstChild);
        }
    };
    const mostrarTag = (texto, clase, top, left, dur = 1.2) => {
        if (!tagEl) return;
        tagEl.textContent = texto;
        tagEl.className = `sim-pitch-tag visible ${clase}`;
        tagEl.style.left = `${left}%`;
        tagEl.style.top = `${top}%`;
        const mi = ++tagId;
        programar(dur, () => { if (mi === tagId) tagEl.classList.remove('visible'); });
    };

    // ================= 5. BALÓN =================
    const darPosesion = (j) => {
        balon.modo = 'conducido';
        balon.dueno = j;
        balon.eq = j.eq;
        balon.ultimo = j.eq;
        balon.vy = 0; balon.vx = 0;
        balon.receptor = null; balon.interceptor = null; balon.preferido = null;
        balon.keeperObj = null; balon.alLlegar = null;
        j.pensar = rnd(CFG.pensarMin, CFG.pensarMax);
        if (ballEl) ballEl.className = 'sim-pitch-ball';
    };

    const lanzarBalon = (tipo, dy, dx, vel, eq, opts = {}) => {
        balon.modo = 'vuelo';
        balon.tipo = tipo;
        balon.oy = balon.y; balon.ox = balon.x;
        balon.dy = dy; balon.dx = dx;
        balon.dur = Math.max(0.05, dist(balon.y, balon.x, dy, dx) / vel);
        balon.t = 0;
        balon.dueno = null;
        balon.eq = eq;
        balon.ultimo = eq;
        balon.receptor = opts.receptor || null;
        balon.interceptor = opts.interceptor || null;
        balon.alLlegar = opts.alLlegar || null;
        balon.preferido = null;
        if (tipo === 'tiro' && ballEl) ballEl.classList.add('shooting');
    };

    const llegadaSuelta = () => {
        balon.modo = 'suelto';
        balon.vy = 0; balon.vx = 0;
    };

    const gestionarSuelto = (dt) => {
        balon.x += balon.vx * dt;
        balon.y += balon.vy * dt;
        const fr = Math.exp(-2.6 * dt);
        balon.vx *= fr; balon.vy *= fr;
        const vel = Math.hypot(balon.vy, balon.vx);
        if (vel > 45) return;
        let mejor = null, md = 99;
        for (const j of jugadores) {
            if (j.bloq > tSim) continue;
            const d = dist(j.y, j.x, balon.y, balon.x) - (j === balon.preferido ? 1.4 : 0) + Math.random() * 0.3;
            if (d < md) { md = d; mejor = j; }
        }
        if (mejor && md < 2.3) darPosesion(mejor);
    };

    // ================= 6. ACCIONES =================
    const hacerPase = (o, c, largo) => {
        const eq = o.eq, f = fuerza(eq);
        const d = dist(o.y, o.x, c.y, c.x);
        const vel = largo ? CFG.velPase * 1.1 : CFG.velPase;
        const tVuelo = d / vel;
        let dy = clamp(c.y + c.vy * tVuelo * 0.8, 5, 95);
        let dx = clamp(c.x + c.vx * tVuelo * 0.8, 4, 96);
        const pres = rivalMasCercano(o).d;
        const pPreciso = clamp(0.95 - d * 0.0045 - (pres < 5 ? 0.07 : 0) + (f - 0.5) * 0.3, 0.55, 0.98);

        let interceptor = null, mejorD = 99, py = 0, px = 0;
        for (const r of equipos[rivalDe(eq)]) {
            if (r.linea === 'por') continue;
            const q = puntoEnSegmento(o.y, o.x, dy, dx, r.y, r.x);
            if (q.t < 0.2) continue;
            const dd = dist(r.y, r.x, q.y, q.x);
            if (dd < mejorD) { mejorD = dd; interceptor = r; py = q.y; px = q.x; }
        }
        const pInt = mejorD < 4.5 ? (1 - mejorD / 4.5) * (0.32 + (0.5 - f) * 0.6) : 0;
        let receptor = c;

        if (interceptor && Math.random() < pInt) {
            dy = py; dx = px; receptor = null;
        } else {
            interceptor = null;
            if (Math.random() > pPreciso) {
                const k = d || 1;
                dx += ((dx - o.x) / k) * rnd(4, 10) + rnd(-4, 4);
                dy += rnd(-10, 10);
            }
        }
        balon.pasadorPrevio = { de: o, a: c, t: tSim };
        lanzarBalon('pase', dy, dx, vel, eq, { receptor, interceptor, alLlegar: llegadaPase });
    };

    const llegadaPase = () => {
        const r = balon.interceptor || balon.receptor;
        llegadaSuelta();
        if (r && dist(r.y, r.x, balon.y, balon.x) < 4) darPosesion(r);
        else balon.preferido = r;
    };

    const marcarGol = (j) => {
        const esUser = j.eq === 'user';
        const pv = balon.pasadorPrevio;
        const asist = (pv && pv.a === j && pv.de !== j && tSim - pv.t < 3.5) ? pv.de : null;
        balon.modo = 'muerto'; balon.dueno = null; balon.keeperObj = null;
        if (ballEl) ballEl.className = 'sim-pitch-ball in-net';
        relojPausado = true;

        if (esUser) {
            golesUser++;
            if (scoreUserEl) {
                scoreUserEl.textContent = golesUser;
                scoreUserEl.classList.add('animate-bounce');
                programar(0.4, () => scoreUserEl.classList.remove('animate-bounce'));
            }
            goalRight?.classList.add('goal-hit-user');
            const pitchEl = document.getElementById('sim-pitch-root') || document.querySelector('.sim-pitch-wrap');
            if (pitchEl) {
                pitchEl.classList.add('goal-flash-fx');
                setTimeout(() => pitchEl.classList.remove('goal-flash-fx'), 600);
            }
            if (typeof confetti === 'function') {
                try { confetti({ particleCount: 35, spread: 75, origin: { y: 0.6 } }); } catch (e) {}
            }
            if (typeof reproducirSonido === 'function') reproducirSonido('gol');
            mostrarTag('¡GOL!', 'user-tag', balon.y, 84, 2.0);
            narrar('gol_user', asist
                ? `¡GOLAZO! Pase de <b>${asist.nombre}</b> y definición de <b>${j.nombre}</b>.`
                : `¡GOLAZO de <b>${j.nombre}</b>! Se la sacó a todos de encima y la mandó adentro.`);
        } else {
            golesRival++;
            if (scoreRivalEl) {
                scoreRivalEl.textContent = golesRival;
                scoreRivalEl.classList.add('animate-bounce');
                programar(0.4, () => scoreRivalEl.classList.remove('animate-bounce'));
            }
            goalLeft?.classList.add('goal-hit-rival');
            if (typeof reproducirSonido === 'function') reproducirSonido('silbato');
            mostrarTag('GOL RIVAL', 'rival-tag', balon.y, 16, 2.0);
            narrar('gol_rival', asist
                ? `Gol de <b>${rival.nombre}</b>: pase de <b>${asist.nombre}</b> y remate de <b>${j.nombre}</b>.`
                : `Gol de <b>${rival.nombre}</b>: <b>${j.nombre}</b> define con categoría.`);
        }

        const mapa = baseMapa();
        mapa[j.id] = [balon.y < 50 ? 15 : 85, esUser ? 90 : 10];
        entrarRepos(mapa, 2.2, () => {
            goalRight?.classList.remove('goal-hit-user');
            goalLeft?.classList.remove('goal-hit-rival');
            if (ballEl) ballEl.className = 'sim-pitch-ball';
            ejecutarSaqueCentro(!esUser, false);
        });
    };

    const resolverAtajada = (tirador, portero) => {
        const gx = golX(tirador.eq), sent = gx === 100 ? -1 : 1, rv = portero.eq;
        const r = Math.random();
        mostrarTag('¡ATAJADA!', 'neutral-tag', balon.y, gx === 100 ? 86 : 14, 1.1);
        if (r < 0.45) {
            narrar('atajada', `¡Atajadón de <b>${portero.nombre}</b>! Le saca el remate a <b>${tirador.nombre}</b> y lo manda al córner.`);
            balon.ultimo = rv;
            lanzarBalon('despeje', 50 + (balon.y < 50 ? -1 : 1) * rnd(9, 15), gx === 100 ? 102 : -2, 55, rv, { alLlegar: llegadaSuelta });
        } else if (r < 0.78) {
            narrar('atajada', `<b>${portero.nombre}</b> se queda con el remate de <b>${tirador.nombre}</b>. Seguro bajo los tres palos.`);
            darPosesion(portero);
            portero.pensar = rnd(0.7, 1.1);
        } else {
            narrar('atajada', `Remate de <b>${tirador.nombre}</b> y <b>${portero.nombre}</b> la rechaza al medio del área. ¡Peligro!`);
            balon.ultimo = rv;
            balon.modo = 'suelto';
            balon.vx = sent * rnd(25, 40);
            balon.vy = rnd(-20, 20);
        }
    };

    const resolverTiro = (res, j, portero, o) => {
        balon.keeperObj = null;
        if (ballEl) ballEl.classList.remove('shooting');
        const gx = golX(j.eq), sent = gx === 100 ? -1 : 1;
        const acc = o.tipo === 'cabezazo' ? 'cabezazo' : o.tipo === 'tiro_libre' ? 'tiro libre' : o.tipo === 'penal' ? 'penal' : 'remate';
        if (res === 'gol') {
            marcarGol(j);
        } else if (res === 'atajada') {
            resolverAtajada(j, portero);
        } else if (res === 'palo') {
            mostrarTag('¡PALO!', 'neutral-tag', balon.y, gx === 100 ? 88 : 12, 1.1);
            narrar('atajada', `¡Al palo! El ${acc} de <b>${j.nombre}</b> se estrella en el poste.`);
            balon.ultimo = portero.eq;
            balon.modo = 'suelto';
            balon.vx = sent * rnd(35, 55);
            balon.vy = rnd(-25, 25);
        } else {
            narrar('tiro', `${acc.charAt(0).toUpperCase() + acc.slice(1)} de <b>${j.nombre}</b> que se va desviado.`);
            llegadaSuelta();
        }
    };

    const tirar = (j, o = {}) => {
        const eq = j.eq, rv = rivalDe(eq), gx = golX(eq), f = fuerza(eq);
        const sent = gx === 100 ? -1 : 1;
        const dArco = Math.abs(j.x - gx);
        const pres = distRivalesA(eq, j.y, j.x);
        let pGol = o.pGol !== undefined ? o.pGol : clamp(0.56 - dArco * 0.010, 0.08, 0.42);
        pGol *= (0.65 + f * 0.7);
        if (!o.sinPresion) pGol -= clamp((7 - pres) * 0.012, 0, 0.07);
        pGol = clamp(pGol, 0.03, 0.9);
        const pArco = o.pArco !== undefined ? o.pArco : 0.36;
        const portero = porteroDe(rv);
        const xPor = gx + sent * 6.5;
        const r = Math.random();
        let res, dx, dy, ky, kx = xPor;

        if (r < pGol) {
            res = 'gol';
            dy = 50 + (Math.random() < 0.5 ? -1 : 1) * rnd(3, 5.5);
            dx = gx === 100 ? 101.5 : -1.5;
            ky = 50 + (dy - 50) * 0.55;
        } else if (r < pGol + pArco) {
            res = 'atajada';
            dy = 50 + rnd(-6, 6); dx = xPor; ky = dy;
        } else if (Math.random() < 0.16) {
            res = 'palo';
            dy = Math.random() < 0.5 ? 44.5 : 55.5;
            dx = gx + sent * 2.5;
            ky = 50 + (50 - dy) * 0.5;
        } else {
            res = 'afuera';
            dy = 50 + (Math.random() < 0.5 ? -1 : 1) * rnd(8.5, 17);
            dx = gx === 100 ? 102.5 : -2.5;
            ky = 50 + (dy - 50) * 0.3;
        }

        if (eq === 'user') statsPartido.tirosTotalesUser++; else statsPartido.tirosTotalesRival++;
        if (res === 'gol' || res === 'atajada') {
            if (eq === 'user') statsPartido.tirosArcoUser++; else statsPartido.tirosArcoRival++;
        }
        actualizarHudStats();

        lanzarBalon('tiro', dy, dx, o.vel || CFG.velTiro, eq, { alLlegar: () => resolverTiro(res, j, portero, o) });
        balon.keeperObj = { j: portero, y: ky, x: kx };
    };

    // ================= 7. IA DEL POSEEDOR =================
    const pasar = (o, opts = {}) => {
        const eq = o.eq, dir = dirDe(eq);
        const cand = [];
        for (const c of equipos[eq]) {
            if (c === o) continue;
            if (c.linea === 'por' && o.linea !== 'def') continue;
            const d = dist(o.y, o.x, c.y, c.x);
            const maxD = (o.linea === 'por' || opts.largoOk) ? 62 : 40;
            if (d < 6 || d > maxD) continue;
            const adv = (c.x - o.x) * dir;
            const libre = Math.min(14, distRivalesA(eq, c.y, c.x));
            let linea = 12;
            for (const r of equipos[rivalDe(eq)]) {
                if (r.linea === 'por') continue;
                const q = puntoEnSegmento(o.y, o.x, c.y, c.x, r.y, r.x);
                linea = Math.min(linea, dist(r.y, r.x, q.y, q.x));
            }
            let s = adv * (opts.seguro ? 0.15 : 1.3) + libre * 0.8 + linea * 0.9 - d * 0.1 + rnd(0, 6);
            if (adv < 0 && !opts.seguro) s += adv * 0.6;
            if (c.linea === 'por') s -= 14;
            cand.push({ c, s, d });
        }
        if (!cand.length) { o.pensar = 0.3; return; }
        cand.sort((a, b) => b.s - a.s);
        hacerPase(o, cand[0].c, cand[0].d > 34);
    };

    const decidir = (o) => {
        const eq = o.eq, gx = golX(eq);
        const dArco = Math.abs(o.x - gx);
        const pres = rivalMasCercano(o).d;
        if (balon.forzarPase) { balon.forzarPase = false; pasar(o, { seguro: true }); return; }
        if (o.linea === 'por') { pasar(o, { largoOk: true }); return; }

        // 🎙️ Relato dinámico en avances y jugadas de peligro si pasaron más de 7 minutos sin comentarios
        if (gameMin - ultimoRelatoMin >= 7 && dArco < 34) {
            if (eq === 'user') {
                const frasesUser = [
                    `¡<b>${o.nombre}</b> avanza con peligro hacia el área rival!`,
                    `<b>${o.nombre}</b> comanda la ofensiva de Tu Once.`,
                    `Ataque profundo de Tu Once: <b>${o.nombre}</b> busca la habilitación.`
                ];
                narrar('jugada', frasesUser[Math.floor(Math.random() * frasesUser.length)]);
            } else {
                const frasesRival = [
                    `<b>${rival.nombre}</b> adelanta sus líneas y busca abrir la cancha.`,
                    `Peligro en el fondo: <b>${o.nombre}</b> encara hacia el área.`,
                    `<b>${rival.nombre}</b> presiona en tres cuartos de campo rival.`
                ];
                narrar('jugada', frasesRival[Math.floor(Math.random() * frasesRival.length)]);
            }
        }

        if (dArco < 34 && Math.abs(o.y - 50) < 32) {
            let p = dArco < 18 ? 0.65 : dArco < 26 ? 0.5 : 0.32;
            if (pres < 5) p += 0.12;
            if (Math.random() < p) { tirar(o); return; }
        }
        if (pres > 3.8 && Math.random() < 0.6) { o.pensar = rnd(0.25, 0.5); return; }
        pasar(o);
    };

    const disputarBalon = (o, r, dt) => {
        const f = fuerza(o.eq);
        const tasa = CFG.tasaRobo * (1 + (0.5 - f) * 1.6);
        if (Math.random() >= 1 - Math.exp(-tasa * dt)) return;
        if (Math.random() < CFG.probFalta) { hacerFalta(r, o); return; }
        r.pensar = rnd(CFG.pensarMin, CFG.pensarMax);
        o.bloq = tSim + 0.6;
        if (Math.random() < 0.55) {
            darPosesion(r);
            if (gameMin - ultimoRelatoMin >= 8) {
                narrar('jugada', r.eq === 'user'
                    ? `Buena recuperación de <b>${r.nombre}</b> en la marca.`
                    : `<b>${r.nombre}</b> presiona y recupera el balón para ${rival.nombre}.`);
            }
        } else {
            balon.modo = 'suelto'; balon.dueno = null; balon.preferido = r;
            balon.ultimo = r.eq;
            balon.vy = rnd(-15, 15); balon.vx = rnd(-15, 15);
        }
    };

    // ================= 8. PELOTA PARADA =================
    const entrarRepos = (mapa, seg, alFinal) => {
        estado = 'repos';
        reposMap = mapa;
        balon.modo = 'muerto';
        balon.dueno = null;
        programar(seg, () => { reposMap = null; estado = 'juego'; if (alFinal) alFinal(); });
    };

    const colocarBalon = (y, x, eq) => {
        balon.y = y; balon.x = x; balon.vy = 0; balon.vx = 0;
        balon.eq = eq; balon.ultimo = eq; balon.keeperObj = null;
        if (ballEl) ballEl.className = 'sim-pitch-ball';
    };

    const ejecutarSaqueCentro = (sacaUser, esReanudacion) => {
        const eq = sacaUser ? 'user' : 'rival';
        relojPausado = true;
        if (typeof reproducirSonido === 'function') reproducirSonido('silbato');
        const taker = porId[sacaUser ? 'dot-u-del2' : 'dot-r-del2'];
        const otro = porId[sacaUser ? 'dot-r-del2' : 'dot-u-del2'];
        const mapa = baseMapa();
        mapa[taker.id] = [50, 50 + (sacaUser ? -0.8 : 0.8)];
        mapa[otro.id] = [50, sacaUser ? 58 : 42];
        colocarBalon(50, 50, eq);
        mostrarTag(esReanudacion ? 'INICIA EL 2T' : (sacaUser ? 'SACA TU ONCE' : 'SACA EL RIVAL'),
            sacaUser ? 'user-tag' : 'rival-tag', 36, 50, 1.5);
        entrarRepos(mapa, 1.6, () => {
            relojPausado = false;
            darPosesion(taker);
            balon.forzarPase = true;
            taker.pensar = 0.2;
        });
    };

    const ejecutarSaqueBanda = (eq, y, x) => {
        const taker = masCercano(equipos[eq].filter(j => j.linea !== 'por'), y, x);
        colocarBalon(y, x, eq);
        mostrarTag('LATERAL', eq === 'user' ? 'user-tag' : 'rival-tag', y < 50 ? y + 8 : y - 8, x, 1.0);
        entrarRepos({ [taker.id]: [y < 50 ? y + 0.8 : y - 0.8, x] }, 1.0, () => {
            darPosesion(taker); balon.forzarPase = true; taker.pensar = 0.15;
        });
    };

    const ejecutarSaqueArco = (eq) => {
        const gk = porteroDe(eq);
        const xGK = eq === 'user' ? 6 : 94;
        colocarBalon(50, xGK, eq);
        entrarRepos({ [gk.id]: [50, xGK] }, 1.1, () => { darPosesion(gk); gk.pensar = rnd(0.3, 0.6); });
    };

    const ejecutarReanudacionRapida = (eq, y, x) => {
        const taker = masCercano(equipos[eq].filter(j => j.linea !== 'por'), y, x);
        colocarBalon(y, x, eq);
        entrarRepos({ [taker.id]: [y, x] }, 0.9, () => {
            darPosesion(taker); balon.forzarPase = true; taker.pensar = 0.15;
        });
    };

    const ORDEN_LINEA = { del: 0, med: 1, def: 2 };
    const armarArea = (eq, mapa, excluir) => {
        const rv = rivalDe(eq), gx = golX(eq);
        const enArea = (prof, y) => [y, gx === 100 ? 100 - prof : prof];
        const atk = equipos[eq].filter(j => j.linea !== 'por' && j !== excluir)
            .sort((a, b) => ORDEN_LINEA[a.linea] - ORDEN_LINEA[b.linea]).slice(0, 5);
        const dfn = equipos[rv].filter(j => j.linea !== 'por')
            .sort((a, b) => ORDEN_LINEA[b.linea] - ORDEN_LINEA[a.linea]).slice(0, 6);
        const posA = [[9, 44], [11, 51], [8, 57], [15, 38], [16, 62]];
        const posD = [[7, 46], [7, 54], [10, 41], [10, 59], [13, 50], [5, 38]];
        atk.forEach((j, i) => { mapa[j.id] = enArea(posA[i][0], posA[i][1]); });
        dfn.forEach((j, i) => { mapa[j.id] = enArea(posD[i][0], posD[i][1]); });
        mapa[porteroDe(rv).id] = enArea(3.5, 50);
        return atk;
    };

    const lanzarCentro = (taker, cands) => {
        const eq = taker.eq, rv = rivalDe(eq), f = fuerza(eq);
        const pesos = cands.map(c => c.linea === 'del' ? 3 : c.linea === 'med' ? 2 : 1);
        let tot = pesos.reduce((a, b) => a + b, 0), r = Math.random() * tot, cab = cands[0] || taker;
        for (let i = 0; i < cands.length; i++) { r -= pesos[i]; if (r <= 0) { cab = cands[i]; break; } }
        balon.pasadorPrevio = { de: taker, a: cab, t: tSim };
        lanzarBalon('centro', cab.y, cab.x, 62, eq, {
            receptor: cab,
            alLlegar: () => {
                const pDespeje = clamp(0.40 - (f - 0.5) * 0.5, 0.2, 0.55);
                if (Math.random() < pDespeje) {
                    const def = masCercano(equipos[rv].filter(j => j.linea !== 'por'), balon.y, balon.x);
                    const sent = golX(eq) === 100 ? -1 : 1;
                    narrar('corner', `<b>${def.nombre}</b> se eleva más alto que todos y despeja el centro.`);
                    lanzarBalon('despeje', clamp(50 + rnd(-30, 30), 10, 90), balon.x + sent * rnd(14, 22), 55, rv, { alLlegar: llegadaSuelta });
                } else {
                    tirar(cab, { tipo: 'cabezazo', pGol: 0.11, pArco: 0.30, sinPresion: true, vel: 90 });
                }
            }
        });
    };

    const ejecutarCorner = (eq, arriba) => {
        const gx = golX(eq);
        const cy = arriba ? 4 : 96, cx = gx === 100 ? 97.5 : 2.5;
        if (eq === 'user') statsPartido.cornersUser++; else statsPartido.cornersRival++;
        actualizarHudStats();
        colocarBalon(cy, cx, eq);
        const taker = masCercano(equipos[eq].filter(j => j.linea === 'med' || j.linea === 'del'), cy, cx);
        const mapa = {};
        const atk = armarArea(eq, mapa, taker);
        mapa[taker.id] = [cy + (arriba ? 1 : -1), cx + (gx === 100 ? -0.5 : 0.5)];
        mostrarTag(eq === 'user' ? 'CÓRNER' : 'CÓRNER RIVAL', eq === 'user' ? 'user-tag' : 'rival-tag', cy, gx === 100 ? 86 : 14, 1.6);
        narrar('corner', eq === 'user'
            ? `Córner para tu equipo. Va a ejecutarlo <b>${taker.nombre}</b>.`
            : `Tiro de esquina para <b>${rival.nombre}</b>. Cuidado en el área.`);
        entrarRepos(mapa, 2.0, () => { darPosesion(taker); lanzarCentro(taker, atk); });
    };

    const ejecutarPenal = (eq) => {
        const rv = rivalDe(eq), gx = golX(eq), sent = gx === 100 ? -1 : 1;
        const xP = gx === 100 ? 89 : 11;
        const tirador = rematadorPrincipal(eq);
        colocarBalon(50, xP, eq);
        const mapa = {};
        const otros = [...equipos[eq], ...equipos[rv]].filter(j => j !== tirador && j.linea !== 'por');
        otros.forEach((j, i) => {
            mapa[j.id] = [12 + i * (76 / (otros.length - 1)), gx === 100 ? 74 - (i % 2) * 3 : 26 + (i % 2) * 3];
        });
        mapa[porteroDe(rv).id] = [50, gx === 100 ? 96.5 : 3.5];
        mapa[tirador.id] = [50, xP + sent * 5];
        mostrarTag('¡PENAL!', eq === 'user' ? 'user-tag' : 'rival-tag', 50, gx === 100 ? 80 : 20, 2.0);
        narrar('falta', `¡PENAL! <b>${tirador.nombre}</b> se prepara para patear desde los doce pasos.`);
        entrarRepos(mapa, 2.3, () => tirar(tirador, { tipo: 'penal', pGol: 0.74, pArco: 0.17, sinPresion: true, vel: 120 }));
    };

    const ejecutarTiroLibre = (eq, y, x, dGol) => {
        const rv = rivalDe(eq), gx = golX(eq), dirA = dirDe(eq);
        const tirador = rematadorPrincipal(eq);
        colocarBalon(y, x, eq);
        const mapa = {};
        const centro = dGol > 24 && Math.random() < 0.55;
        let cands = [];
        if (centro) {
            cands = armarArea(eq, mapa, tirador);
        } else {
            const muro = equipos[rv].filter(j => j.linea !== 'por')
                .sort((a, b) => dist(a.y, a.x, y, x) - dist(b.y, b.x, y, x)).slice(0, 4);
            muro.forEach((j, k) => { mapa[j.id] = [clamp(y + (50 - y) * 0.2 + (k - 1.5) * 2.4, 8, 92), x + dirA * 9]; });
            mapa[porteroDe(rv).id] = [50 + (y < 50 ? 3 : -3), gx === 100 ? 96 : 4];
        }
        mapa[tirador.id] = [y - 2, x - dirA * 2.5];
        mostrarTag(eq === 'user' ? 'TIRO LIBRE' : 'TIRO LIBRE RIVAL', eq === 'user' ? 'user-tag' : 'rival-tag', clamp(y - 8, 6, 94), x, 1.8);
        entrarRepos(mapa, 1.9, () => {
            if (centro) { darPosesion(tirador); lanzarCentro(tirador, cands); }
            else tirar(tirador, { tipo: 'tiro_libre', pGol: 0.075, pArco: 0.30, sinPresion: true });
        });
    };

    const hacerFalta = (inf, vic) => {
        const eq = vic.eq, gx = golX(eq);
        const dGol = Math.abs(vic.x - gx);
        const y = vic.y, x = vic.x;
        if (inf.eq === 'user') statsPartido.faltasUser++; else statsPartido.faltasRival++;
        actualizarHudStats();
        balon.modo = 'muerto'; balon.dueno = null;
        const area = dGol < 16 && Math.abs(y - 50) < 21;
        if (area) {
            narrar('falta', `¡Derribó <b>${inf.nombre}</b> a <b>${vic.nombre}</b> dentro del área! El árbitro no duda.`);
            ejecutarPenal(eq);
        } else if (dGol < 33) {
            narrar('falta', `Falta de <b>${inf.nombre}</b> sobre <b>${vic.nombre}</b> al borde del área. Tiro libre peligroso.`);
            ejecutarTiroLibre(eq, y, x, dGol);
        } else {
            mostrarTag('FALTA', 'neutral-tag', clamp(y - 6, 6, 94), x, 1.0);
            narrar('falta', `Falta táctica de <b>${inf.nombre}</b> sobre <b>${vic.nombre}</b> para frenar la transición.`);
            ejecutarReanudacionRapida(eq, y, x);
        }
    };

    const comprobarFuera = () => {
        if (balon.modo !== 'suelto') return;
        const { x, y } = balon;
        if (x < CFG.xMin || x > CFG.xMax) {
            const defiende = x < 50 ? 'user' : 'rival';
            if (balon.ultimo === defiende) ejecutarCorner(rivalDe(defiende), y < 50);
            else ejecutarSaqueArco(defiende);
        } else if (y < CFG.yMin || y > CFG.yMax) {
            ejecutarSaqueBanda(rivalDe(balon.ultimo), y < 50 ? 3 : 97, clamp(x, 6, 94));
        }
    };

    // ================= 9. MOVIMIENTO =================
    const K_LINEA = { por: 0, def: 0.30, med: 0.45, del: 0.55 };
    const EMP_ATK = { por: 0, def: 6, med: 9, del: 10 };
    const EMP_DEF = { por: 0, def: -1, med: -3, del: -2 };
    const LIM = { def: [9, 64], med: [22, 78], del: [34, 93] };
    let roles = {};

    const calcularRoles = () => {
        roles = {};
        if (estado !== 'juego') return;
        if (balon.modo === 'suelto') {
            for (const eq of ['user', 'rival']) {
                const ord = equipos[eq].filter(j => j.linea !== 'por')
                    .sort((a, b) => dist(a.y, a.x, balon.y, balon.x) - dist(b.y, b.x, balon.y, balon.x));
                roles[ord[0].id] = 'persigue';
                if (dist(ord[1].y, ord[1].x, balon.y, balon.x) < 18) roles[ord[1].id] = 'persigue';
            }
        } else if (balon.modo === 'conducido' || balon.modo === 'vuelo') {
            const def = rivalDe(balon.eq);
            const fy = balon.modo === 'vuelo' ? balon.dy : balon.y;
            const fx = balon.modo === 'vuelo' ? balon.dx : balon.x;
            const ord = equipos[def].filter(j => j.linea !== 'por')
                .sort((a, b) => dist(a.y, a.x, fy, fx) - dist(b.y, b.x, fy, fx));
            roles[ord[0].id] = 'presion1';
            if (dist(ord[1].y, ord[1].x, fy, fx) < 34) roles[ord[1].id] = 'presion2';
        }
    };

    const calcularObjetivo = (j) => {
        const eq = j.eq, d = dirDe(eq);
        const factor = j.factorVel;

        if (reposMap && reposMap[j.id]) {
            j.tY = reposMap[j.id][0]; j.tX = reposMap[j.id][1];
            j.vmax = CFG.velSprint * 0.75 * factor;
            return;
        }
        if (balon.modo === 'conducido' && balon.dueno === j) {
            if (j.linea === 'por') { j.tX = j.baseX; j.tY = 50; j.vmax = CFG.velTrote; return; }
            const { r, d: dr } = rivalMasCercano(j);
            let ty = j.y + (50 - j.y) * 0.25;
            if (r && dr < 9) ty += (j.y >= r.y ? 1 : -1) * 8;
            j.tX = clamp(j.x + d * 14, 12, 88);
            j.tY = clamp(ty, 6, 94);
            j.vmax = CFG.velTrote * 0.92 * factor;
            return;
        }
        if (balon.modo === 'vuelo') {
            if (balon.receptor === j || balon.interceptor === j) {
                j.tY = balon.dy; j.tX = balon.dx; j.vmax = CFG.velSprint * factor; return;
            }
            if (balon.keeperObj && balon.keeperObj.j === j) {
                j.tY = balon.keeperObj.y; j.tX = balon.keeperObj.x; j.vmax = CFG.velPortero * 1.6; return;
            }
        }
        const rol = roles[j.id];
        if (rol === 'persigue') {
            j.tY = clamp(balon.y + balon.vy * 0.25, 4, 96);
            j.tX = clamp(balon.x + balon.vx * 0.25, 3, 97);
            j.vmax = CFG.velSprint * factor;
            return;
        }
        if (rol === 'presion1' || rol === 'presion2') {
            const fy = balon.modo === 'vuelo' ? balon.dy : balon.y;
            const fx = balon.modo === 'vuelo' ? balon.dx : balon.x;
            if (rol === 'presion1') {
                const stand = balon.modo === 'vuelo' ? 0 : 4.5;
                j.tX = clamp(fx - d * stand, 3, 97);
                j.tY = clamp(fy + (50 - fy) * 0.08, 4, 96);
            } else {
                j.tX = clamp(fx - d * 7, 3, 97); j.tY = clamp(fy + (50 - fy) * 0.2, 4, 96);
            }
            j.vmax = (dist(j.y, j.x, fy, fx) < 30 ? CFG.velSprint : CFG.velTrote * 1.25) * factor;
            return;
        }

        const atacando = balon.eq === eq && balon.modo !== 'suelto';
        const bd = profDe(eq, balon.x);
        if (j.linea === 'por') {
            j.tX = xDe(eq, 6 + Math.max(0, bd - 55) * 0.22);
            j.tY = 50 + (balon.y - 50) * (bd < 35 ? 0.22 : 0.1);
            j.vmax = CFG.velPortero * factor;
            return;
        }
        let prof = profDe(eq, j.baseX);
        prof += (bd - 50) * K_LINEA[j.linea];
        prof += atacando ? EMP_ATK[j.linea] : EMP_DEF[j.linea];
        prof += Math.sin(tSim * 1.3 + j.fase) * 1.4;
        if (atacando && j.linea === 'del') prof = Math.max(prof, bd + 12);
        else if (atacando && j.linea === 'med') prof = Math.max(prof, bd + 2);
        prof = clamp(prof, LIM[j.linea][0], LIM[j.linea][1]);
        const ty = 50 + (j.baseY - 50) * (atacando ? 1.12 : 0.88)
            + (balon.y - 50) * (j.linea === 'def' ? 0.22 : 0.3)
            + Math.cos(tSim * 1.1 + j.fase) * 1.6;
        j.tX = xDe(eq, prof);
        j.tY = clamp(ty, 8, 92);
        j.vmax = CFG.velTrote * factor;
    };

    const moverJugador = (j, dt) => {
        const ey = j.tY - j.y, ex = j.tX - j.x;
        const d = Math.hypot(ey, ex);
        let dvy = 0, dvx = 0;
        if (d > 0.15) {
            const vmax = d > 12 ? j.vmax * 1.2 : j.vmax;
            const v = Math.min(vmax, d * 5);
            dvy = ey / d * v; dvx = ex / d * v;
        }
        const a = Math.min(1, CFG.aceleracion * dt);
        j.vy += (dvy - j.vy) * a;
        j.vx += (dvx - j.vx) * a;
        j.y = clamp(j.y + j.vy * dt, 4, 96);
        j.x = clamp(j.x + j.vx * dt, 2, 98);
    };

    const separarJugadores = () => {
        for (let i = 0; i < jugadores.length; i++) {
            for (let k = i + 1; k < jugadores.length; k++) {
                const a = jugadores[i], b = jugadores[k];
                const dy = b.y - a.y, dx = b.x - a.x;
                const d2 = dy * dy + dx * dx;
                if (d2 > 4.84 || d2 === 0) continue;
                const d = Math.sqrt(d2), push = (2.2 - d) * 0.5;
                const ny = dy / d, nx = dx / d;
                a.y -= ny * push; a.x -= nx * push;
                b.y += ny * push; b.x += nx * push;
            }
        }
    };

    const actualizarBalon = (dt) => {
        if (balon.modo === 'conducido' && balon.dueno) {
            const o = balon.dueno;
            const sp = Math.hypot(o.vy, o.vx);
            let fy, fx;
            if (sp > 3) { fy = o.vy / sp; fx = o.vx / sp; } else { fy = 0; fx = dirDe(o.eq); }
            const a = Math.min(1, 14 * dt);
            balon.y += (o.y + fy * 1.2 - balon.y) * a;
            balon.x += (o.x + fx * 1.2 - balon.x) * a;
        } else if (balon.modo === 'vuelo') {
            balon.t += dt;
            const p = Math.min(1, balon.t / balon.dur);
            const e = balon.tipo === 'tiro' ? p : (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
            balon.y = balon.oy + (balon.dy - balon.oy) * e;
            balon.x = balon.ox + (balon.dx - balon.ox) * e;
            if (p >= 1) {
                const fn = balon.alLlegar || llegadaSuelta;
                balon.alLlegar = null;
                fn();
            }
        } else if (balon.modo === 'suelto') {
            gestionarSuelto(dt);
        }
    };

    const render = () => {
        for (const j of jugadores) {
            if (!j.el) continue;
            j.el.style.top = `${j.y.toFixed(2)}%`;
            j.el.style.left = `${j.x.toFixed(2)}%`;
        }
        if (ballEl) {
            ballEl.style.top = `${balon.y.toFixed(2)}%`;
            ballEl.style.left = `${balon.x.toFixed(2)}%`;
        }
    };

    // ================= 10. SIMULACIÓN INSTANTÁNEA (SALTAR PARTIDO) =================
    window.saltarSimulacionCompleta = function() {
        if (torneoEstado && torneoEstado.esLiga) {
            const idUserGuardar = getUserId();
            const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + idUserGuardar);
            if (guardadaRaw) {
                try {
                    const lObj = JSON.parse(guardadaRaw);
                    lObj.fueSimuladaRapida = true;
                    localStorage.setItem('ev_liga_guardada_' + idUserGuardar, JSON.stringify(lObj));
                } catch(e) {}
            }
        }
        if (simRafId) { cancelAnimationFrame(simRafId); simRafId = null; }
        if (simIntervalo) { clearInterval(simIntervalo); simIntervalo = null; }
        if (simPreviaTimer) { clearInterval(simPreviaTimer); simPreviaTimer = null; }
        if (simHalftimeTimer) { clearTimeout(simHalftimeTimer); simHalftimeTimer = null; }
        if (simJugadaTimer) { clearTimeout(simJugadaTimer); simJugadaTimer = null; }

        estado = 'fin';
        relojPausado = true;

        // Calculamos los goles según tiempo restante y diferencia de OVR
        const propRestante = Math.max(0, (90 - gameMin) / 90);
        const diff = (ovrUsuario - ovrRival) / 10;
        const probGolExtraUser = Math.max(0, 1.4 + diff * 0.4 + (Math.random() - 0.5) * 1.8) * propRestante;
        const probGolExtraRival = Math.max(0, 1.1 - diff * 0.4 + (Math.random() - 0.5) * 1.8) * propRestante;

        golesUser += Math.round(probGolExtraUser);
        golesRival += Math.round(probGolExtraRival);

        if (scoreUserEl) scoreUserEl.textContent = golesUser;
        if (scoreRivalEl) scoreRivalEl.textContent = golesRival;
        if (clock) clock.textContent = "90' · FIN";
        if (tagEl) tagEl.classList.remove('visible');

        statsPartido.tirosTotalesUser = Math.max(golesUser + Math.floor(Math.random() * 4 + 3), golesUser);
        statsPartido.tirosArcoUser = golesUser + Math.floor(Math.random() * 2 + 1);
        statsPartido.tirosTotalesRival = Math.max(golesRival + Math.floor(Math.random() * 4 + 2), golesRival);
        statsPartido.tirosArcoRival = golesRival + Math.floor(Math.random() * 2);
        actualizarHudStats();

        const qControls = document.getElementById('sim-quick-controls');
        if (qControls) qControls.style.display = 'none';

        const row = document.createElement('div');
        row.className = 'sim-event-row sim-event-simulado';
        row.innerHTML = `<span class="sim-ev-min">90'</span> <span class="sim-ev-text">⚡ <b>Partido simulado:</b> Resultado final ${golesUser} - ${golesRival}</span>`;
        if (timeline) {
            timeline.appendChild(row);
            timeline.scrollTop = timeline.scrollHeight;
        }

        finalizarPartidoCopa(golesUser, golesRival);
    };

    // ================= 11. RELOJ Y LOOP PRINCIPAL =================
    const cierreSeguro = () => estado === 'juego' && !(balon.modo === 'vuelo' && balon.tipo === 'tiro');

    const tickReloj = (dt) => {
        if (relojPausado || estado === 'previa' || estado === 'entretiempo' || estado === 'fin') return;
        gameMin += dt / (CFG.msPorMinuto / 1000);
        const m = Math.floor(gameMin);

        if (!primerTiempoTerminado && m > 45 + tiempoDescuento1T && cierreSeguro()) {
            primerTiempoTerminado = true;
            estado = 'entretiempo';
            relojPausado = true;
            reposMap = baseMapa();
            balon.modo = 'muerto'; balon.dueno = null;
            if (clock) clock.textContent = `45'+${tiempoDescuento1T} · ET`;
            const rowET = document.createElement('div');
            rowET.className = 'sim-event-row entretiempo';
            rowET.innerHTML = `<span><i class="ph-bold ph-whistle"></i> FIN DEL PRIMER TIEMPO (${golesUser} - ${golesRival})</span>`;
            if (timeline) { timeline.appendChild(rowET); timeline.scrollTop = timeline.scrollHeight; }
            programar(2.4 / simVelocidadMult, () => {
                reposMap = null;
                gameMin = 46;
                if (clock) clock.textContent = `46' (2T)`;
                ejecutarSaqueCentro(false, true);
            });
            return;
        }

        if (primerTiempoTerminado && m > 90 + tiempoDescuento2T && cierreSeguro()) {
            estado = 'fin';
            if (clock) clock.textContent = `90'+${tiempoDescuento2T}' · FIN`;
            const qControls = document.getElementById('sim-quick-controls');
            if (qControls) qControls.style.display = 'none';
            finalizarPartidoCopa(golesUser, golesRival);
            return;
        }

        if (clock) {
            if (!primerTiempoTerminado && m > 45) clock.textContent = `45'+${m - 45}'`;
            else if (m > 90) clock.textContent = `90'+${m - 90}'`;
            else clock.textContent = `MIN ${m}'`;
        }

        // 🎙️ Mantener vivo el relato si hay una meseta táctica de más de 10 minutos sin incidentes
        if (gameMin - ultimoRelatoMin >= 10 && estado === 'juego' && m < 88) {
            const posesion = statsPartido.posesionUser;
            if (posesion >= 54) {
                narrar('jugada', `Tu Once domina la posesión y rota la pelota en el mediocampo.`);
            } else if (posesion <= 46) {
                narrar('jugada', `${rival.nombre} cuida la tenencia del balón buscando los espacios.`);
            } else {
                narrar('jugada', `Duelo muy parejo y disputado con dientes apretados en la mitad.`);
            }
        }
    };

    let ultimoT = 0;
    const frame = (now) => {
        if (estado === 'fin') return;
        const dt = Math.min(0.05, Math.max(0.001, (now - ultimoT) / 1000)) * simVelocidadMult;
        ultimoT = now;
        tSim += dt;

        tickAgenda();
        if (estado === 'fin') return;
        tickReloj(dt);
        if (estado === 'fin') return;

        if (balon.modo === 'conducido' || (balon.modo === 'vuelo' && balon.tipo === 'pase')) tPos[balon.eq] += dt;

        calcularRoles();
        for (const j of jugadores) calcularObjetivo(j);
        for (const j of jugadores) moverJugador(j, dt);
        separarJugadores();
        actualizarBalon(dt);

        if (estado === 'juego') {
            comprobarFuera();
            if (estado === 'juego' && balon.modo === 'conducido' && balon.dueno) {
                const o = balon.dueno;
                let pres = 99;
                if (o.linea !== 'por') {
                    const { r, d } = rivalMasCercano(o);
                    pres = d;
                    if (r && d < CFG.radioContacto) disputarBalon(o, r, dt);
                }
                if (estado === 'juego' && balon.modo === 'conducido' && balon.dueno === o) {
                    o.pensar -= dt * (pres < 8 ? 1.6 : 1);
                    if (o.pensar <= 0) decidir(o);
                }
            }
        }

        hudAcum += dt;
        if (hudAcum > 0.5) {
            hudAcum = 0;
            statsPartido.posesionUser = clamp(Math.round(100 * tPos.user / (tPos.user + tPos.rival)), 25, 75);
            actualizarHudStats();
        }

        render();
        simRafId = requestAnimationFrame(frame);
    };

    // ================= 12. CUENTA REGRESIVA E INICIO =================
    let segundosPrevia = 3;
    if (clock) clock.textContent = '3s';
    if (btn) btn.innerHTML = `<i class="ph-bold ph-timer animate-pulse"></i> El partido comienza en <b>${segundosPrevia}</b>...`;
    if (tagEl) {
        tagEl.textContent = `COMIENZA EN ${segundosPrevia}...`;
        tagEl.className = 'sim-pitch-tag visible neutral-tag';
        tagEl.style.left = '50%';
        tagEl.style.top = '36%';
    }
    render();

    simPreviaTimer = setInterval(() => {
        segundosPrevia--;
        if (segundosPrevia > 0) {
            if (clock) clock.textContent = `${segundosPrevia}s`;
            if (btn) btn.innerHTML = `<i class="ph-bold ph-timer animate-pulse"></i> El partido comienza en <b>${segundosPrevia}</b>...`;
            if (tagEl) tagEl.textContent = `COMIENZA EN ${segundosPrevia}...`;
        } else {
            clearInterval(simPreviaTimer);
            simPreviaTimer = null;
            if (tagEl) tagEl.classList.remove('visible');
            if (btn) btn.innerHTML = `<i class="ph-bold ph-circle-notch animate-spin"></i> En juego (90 minutos)...`;
            actualizarHudStats();
            if (clock) clock.textContent = `MIN 1'`;

            ejecutarSaqueCentro(true, false);
            ultimoT = performance.now();
            simRafId = requestAnimationFrame(frame);
        }
    }, 1000);
};

// 🏆 CELEBRACIÓN DE CAMPEÓN (LUCES DELICADAS + PAPEL PICADO DE ESTADIO)
function dispararFestejoCampeon(targetModal = null) {
    if (typeof dispararEfectoLucesDelicadas === 'function') {
        dispararEfectoLucesDelicadas();
    } else if (typeof dispararEfectoLucesGaming === 'function') {
        dispararEfectoLucesGaming();
    }
    if (typeof lanzarConfetti === 'function') {
        setTimeout(() => lanzarConfetti('oro'), 220);
    }
}
function finalizarPartidoCopa(golesUser, golesRival) {
    const timeline = document.getElementById('sim-events-timeline');
    const btn = document.getElementById('sim-btn-play');
    torneoEstado.partidoEnCurso = false;
    if (typeof reproducirSonido === 'function') reproducirSonido('silbato');

    // 🏟️ RAMA 1: PARTIDO DE TEMPORADA DE LIGA (HAY EMPATE EN 90')
    if (torneoEstado.esLiga) {
        procesarFinDePartidoLiga(golesUser, golesRival);
        return;
    }

    // 🏆 RAMA 2: PARTIDO DE COPA O DESAFÍO (ELIMINACIÓN DIRECTA)
    let ganoUsuario = golesUser > golesRival;
    let penalesTexto = '';

    if (golesUser === golesRival) {
        const penUser = 4 + Math.round(Math.random());
        const penRival = penUser === 5 ? (Math.random() < 0.5 ? 4 : 3) : 5;
        ganoUsuario = penUser > penRival;
        penalesTexto = ` (${penUser}-${penRival} pen.)`;

        const penRow = document.createElement('div');
        penRow.className = 'sim-event-row penales';
        penRow.innerHTML = `<span class="sim-ev-min">PEN</span> <span class="sim-ev-text"><b>Definición por penales:</b> ${penUser} a ${penRival} (${ganoUsuario ? '¡Ganaste la tanda!' : 'Caíste en los penales'})</span>`;
        timeline.appendChild(penRow);
        timeline.scrollTop = timeline.scrollHeight;
    }

    const rivalActual = torneoEstado.rivales[torneoEstado.rondaIdx];
    torneoEstado.recorridoPartidos.push({
        fase: RONDAS_NOMBRES[torneoEstado.rondaIdx],
        rivalNombre: rivalActual.nombre,
        rivalId: rivalActual.id,
        golesUser: golesUser,
        golesRival: golesRival,
        penales: penalesTexto
    });

    if (ganoUsuario) {
        if (typeof reproducirSonido === 'function') reproducirSonido('victoria');
        if (torneoEstado.esDesafioAsincronico) {
            const premio = torneoEstado.config.premioSP || 2;
            userStats.puntosHabilidad = (userStats.puntosHabilidad || 0) + premio;
            guardarStats();

            const sbCard = document.querySelector('.sim-scoreboard-card');
            if (sbCard) sbCard.classList.add('campeon-glory');

            const stageTitle = document.getElementById('sim-stage-title');
            if (stageTitle) {
                stageTitle.className = 'sim-stage-badge campeon';
                stageTitle.innerHTML = `<i class="ph-fill ph-trophy"></i> ¡VICTORIA EN EL DUELO!`;
            }

            btn.className = 'btn-3d primary sim-main-btn btn-campeon-gold animate-pulse';
            btn.disabled = false;
            btn.innerHTML = `<i class="ph-bold ph-trophy"></i> ¡RECLAMAR RECOMPENSA (+${premio} SP)!`;
            btn.onclick = () => {
                cerrarModalSimuladorPartido();
                showToast(`¡Derrotaste al equipo de ${rivalActual.nombre}! Sumaste +${premio} SP 🔥`, 'ph-trophy', 'success');
            };

            dispararEfectoLucesGaming();
        } else {
            const esFinal = torneoEstado.rondaIdx === 3;
            if (esFinal) {
                torneoEstado.terminado = true;
                localStorage.removeItem('ev_torneo_guardado_' + getUserId());

                const premio = torneoEstado.config.premioSP;
                userStats.puntosHabilidad = (userStats.puntosHabilidad || 0) + premio;
                if (!userStats.copasGanadas) userStats.copasGanadas = [];
                userStats.copasGanadas.push({
                    tier: torneoEstado.tier,
                    nombre: torneoEstado.config.nombre,
                    fecha: new Date().toISOString()
                });
                guardarStats();

                const sbCard = document.querySelector('.sim-scoreboard-card');
                if (sbCard) sbCard.classList.add('campeon-glory');
                document.querySelector('.sim-match-layout')?.classList.add('campeon-view');

                const stageTitle = document.getElementById('sim-stage-title');
                if (stageTitle) {
                    stageTitle.className = 'sim-stage-badge campeon';
                    stageTitle.innerHTML = `<i class="ph-fill ph-crown"></i> ¡CAMPEÓN DEL TORNEO!`;
                }

                const escudoUsuario = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + getUserId()) || getPref('ev_avatar_logo', 'ev');
                timeline.innerHTML = `
                    <div class="sim-camino-wrapper">
                        <div class="sim-camino-header">
                            <i class="ph-fill ph-trophy"></i> EL CAMINO A LA GLORIA
                        </div>
                        <div class="sim-camino-list">
                            ${torneoEstado.recorridoPartidos.map(p => `
                                <div class="sim-camino-row">
                                    <span class="sim-camino-fase">${p.fase}</span>
                                    <div class="sim-camino-match">
                                        <div class="sim-camino-team user">
                                            <img src="${obtenerUrlEscudo(escudoUsuario)}" alt="Tu Club">
                                            <span>Tu Once</span>
                                        </div>
                                        <span class="sim-camino-score">${p.golesUser} - ${p.golesRival}${p.penales}</span>
                                        <div class="sim-camino-team rival">
                                            <span>${p.rivalNombre}</span>
                                            <img src="${obtenerUrlEscudo(p.rivalId)}" alt="${p.rivalNombre}">
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                btn.className = 'btn-3d primary sim-main-btn btn-campeon-gold animate-pulse';
                btn.disabled = false;
                btn.innerHTML = `<i class="ph-bold ph-crown"></i> ¡LEVANTAR COPA (+${premio} SP)!`;
                btn.onclick = () => {
                    const datosCopa = {
                        torneo: torneoEstado.config.nombre,
                        subtitulo: 'Circuito Oficial de Copas',
                        campana: 'Campaña Invicta'
                    };
                    cerrarModalSimuladorPartido();
                    showToast(`¡Campeón de la ${torneoEstado.config.nombre}! Sumaste +${premio} SP 🏆👑`, 'ph-trophy', 'success');
                    dispararFestejoCampeon(document.getElementById('torneo-copas-modal') || document.body);
                    setTimeout(() => compartirPosterCampeon(datosCopa), 800);
                };

                dispararFestejoCampeon(document.getElementById('simulador-partido-modal'));
            } else {
                torneoEstado.rondaIdx++;
                if (!torneoEstado.esDesafioAsincronico) {
                    localStorage.setItem('ev_torneo_guardado_' + getUserId(), JSON.stringify(torneoEstado));
                }
                const proxRonda = RONDAS_NOMBRES[torneoEstado.rondaIdx];
                btn.className = 'btn-3d primary sim-main-btn';
                btn.disabled = false;
                btn.innerHTML = `<span>Avanzar a ${proxRonda}</span> <i class="ph-bold ph-arrow-right"></i>`;
                btn.onclick = () => {
                    prepararVistaPartidoCopa();
                    iniciarSimulacionEnVivo();
                };
            }
        }
    } else {
        torneoEstado.terminado = true;
        if (!torneoEstado.esDesafioAsincronico) {
            localStorage.removeItem('ev_torneo_guardado_' + getUserId());
        }

        if (torneoEstado.esDesafioAsincronico) {
            btn.className = 'btn-3d secondary sim-main-btn danger';
            btn.disabled = false;
            btn.innerHTML = `<i class="ph-bold ph-arrow-left"></i> Salir · Revancha más tarde`;
            btn.onclick = () => {
                cerrarModalSimuladorPartido();
                showToast(`Caíste frente al equipo de ${rivalActual.nombre}. ¡A entrenar a tus titulares! ⚽`, "ph-x-circle", "danger");
            };
        } else {
            btn.className = 'btn-3d secondary sim-main-btn danger';
            btn.disabled = false;
            btn.innerHTML = `<i class="ph-bold ph-arrow-left"></i> Eliminado · Volver a Entrenar`;
            btn.onclick = () => {
                cerrarModalSimuladorPartido();
                showToast("Quedaste fuera de la Copa. ¡Entrená a tus jugadores y volvé a intentarlo! ⚽", "ph-x-circle", "danger");
            };
        }
    }
}

window.designarCapitanOnce = function(idx, event) {
    if (event) {
        event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
    }
    if (idx === 'DT') {
        showToast("El Director Técnico no puede ser el Capitán del equipo. 📋", "ph-prohibit", "warning");
        return;
    }
    const once = obtenerOnceInicial();
    const avatar = once[idx];
    if (!avatar) return;

    if (typeof esAvatarDT === 'function' && esAvatarDT(avatar)) {
        showToast("Un Director Técnico no puede ser el Capitán de campo. 📋", "ph-prohibit", "warning");
        return;
    }

    const actual = userStats.onceCapitan || localStorage.getItem('ev_once_capitan_' + getUserId());
    if (actual === avatar) {
        userStats.onceCapitan = null;
        localStorage.removeItem('ev_once_capitan_' + getUserId());
        showToast("Capitán desmarcado.", "ph-crown", "info");
    } else {
        userStats.onceCapitan = avatar;
        localStorage.setItem('ev_once_capitan_' + getUserId(), avatar);
        showToast(`¡${obtenerNombreAvatar(avatar)} es tu Capitán! 👑`, "ph-crown", "success");
    }
    guardarStats();
    renderizarOnceInicial();
};

window.abrirModalOnceInicial = function() {
    const modal = document.getElementById('once-inicial-modal');
    if (!modal) return;
    formacionOnceActual = getPref('ev_once_formacion', '4-3-3');
    slotActivoOnce = null;
    modal.style.display = 'flex';

    // 🌟 Si el usuario nuevo tiene la cancha vacía, poblar automáticamente con sus futbolistas iniciales
    const once = obtenerOnceInicial();
    if (!once || Object.keys(once).length === 0) {
        if (typeof autocompletarOnceInicial === 'function') {
            autocompletarOnceInicial();
            return;
        }
    }
    renderizarOnceInicial();
};

window.cerrarModalOnceInicial = function(volverACarrera = true) {
    const modal = document.getElementById('once-inicial-modal');
    if (modal) modal.style.display = 'none';
    slotActivoOnce = null;
    guardarStats();
    if (volverACarrera && typeof abrirModalModoCarrera === 'function') {
        abrirModalModoCarrera();
    }
};

window.cambiarFormacionOnce = function(fKey) {
    if (!FORMACIONES_TACTICAS[fKey]) return;
    formacionOnceActual = fKey;
    setPref('ev_once_formacion', fKey);
    slotActivoOnce = null;
    renderizarOnceInicial();
};

window.seleccionarSlotOnce = function(idx) {
    slotActivoOnce = (slotActivoOnce === idx) ? null : idx;
    renderizarOnceInicial();
    if (slotActivoOnce !== null) {
        setTimeout(() => {
            const drawer = document.getElementById('once-players-drawer');
            if (drawer) drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
};

window.asignarJugadorAOnce = function(avatarId) {
    if (slotActivoOnce === null) {
        showToast("Tocá primero una posición en la cancha o el DT para ubicarlo.", "ph-info", "warning");
        return;
    }
    const avatarLimpio = avatarId.replace(/\.png$/i, '.webp');

    // 🛡️ REGLA: Los DTs solo pueden asignarse en el slot DT, nunca como futbolistas en la cancha
    if (slotActivoOnce !== 'DT' && typeof esAvatarDT === 'function' && esAvatarDT(avatarLimpio)) {
        showToast(`¡${obtenerNombreAvatar(avatarLimpio)} es Director Técnico y no puede jugar en la cancha! 📋`, "ph-prohibit", "warning");
        return;
    }

    const nivelReq = obtenerNivelAvatar(avatarId);
    const nivelUser = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (nivelUser < nivelReq) {
        showToast(`¡Este futbolista se desbloquea en el Nivel ${nivelReq}! 🔒`, "ph-lock-key", "warning");
        return;
    }

    const once = obtenerOnceInicial();

    for (let k in once) {
        if (once[k] === avatarLimpio) delete once[k];
    }

    // Si el jugador reemplazado en este slot era el capitán, desmarcarlo
    if (once[slotActivoOnce] && once[slotActivoOnce] === userStats.onceCapitan && once[slotActivoOnce] !== avatarLimpio) {
        userStats.onceCapitan = null;
        localStorage.removeItem('ev_once_capitan_' + getUserId());
    }

    once[slotActivoOnce] = avatarLimpio;
    userStats.onceInicial = once;
    localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify(once));
    guardarStats();

    const rolTexto = slotActivoOnce === 'DT' ? 'asumió la dirección técnica' : 'ingresó al once titular';
    showToast(`¡${obtenerNombreAvatar(avatarLimpio)} ${rolTexto}! ⚽`, "ph-check-circle", "success");
    slotActivoOnce = null;
    renderizarOnceInicial();
};

window.quitarJugadorDeOnce = function(idx, event) {
    if (event) {
        event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
    }
    const once = obtenerOnceInicial();
    if (once[idx]) {
        const removido = once[idx];
        delete once[idx];
        if (obtenerCapitanOnce() === removido) {
            userStats.onceCapitan = null;
            localStorage.removeItem('ev_once_capitan_' + getUserId());
        }
        userStats.onceInicial = once;
        localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify(once));
        guardarStats();
        if (slotActivoOnce === idx) slotActivoOnce = null;
        renderizarOnceInicial();
        showToast("Puesto liberado.", "ph-trash", "info");
    }
};

window.autocompletarOnceInicial = function() {
    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    const desbloqueados = AVATARES_LISTA.filter(a => miNivel >= a.nivel).sort((a, b) => b.nivel - a.nivel);
    if (!desbloqueados.length) {
        showToast("No tenés futbolistas desbloqueados suficientes.", "ph-warning-circle", "warning");
        return;
    }

    const f = FORMACIONES_TACTICAS[formacionOnceActual] || FORMACIONES_TACTICAS['4-3-3'];
    const once = obtenerOnceInicial();
    let asignados = new Set(Object.values(once));
    let agregados = 0;

    // 1. Ubicación preferida táctica para la formación base (4-3-3)
    const slotsPreferidos433 = {
        '24.webp': 10, // Dibu Martínez -> POR (Arco)
        '61.webp': 6,  // Gary Medel -> LI (Defensa Izquierda)
        '21.webp': 8,  // Otamendi -> DFC (Zaguero Central)
        '55.webp': 9,  // Yerry Mina -> LD (Defensa Derecha)
        '16.webp': 7,  // Cuti Romero -> DFC (Nivel 2)
        '13.webp': 4,  // Casemiro -> MCD (Eje Central)
        '12.webp': 3,  // Fede Valverde -> MC (Volante)
        '18.webp': 5,  // Rodrigo De Paul -> MC (Nivel 1)
        '7.webp': 1,   // Vinicius Jr -> EI (Extremo Izquierdo)
        '9.webp': 2,   // Dembélé -> ED (Nivel 3)
        '20.webp': 0   // Lautaro Martínez -> DC (Nivel 4 - Centrodelantero)
    };

    desbloqueados.forEach(a => {
        if (typeof esAvatarDT === 'function' && esAvatarDT(a.id)) return;
        if (asignados.has(a.id)) return;
        const prefSlot = slotsPreferidos433[a.id];
        if (prefSlot !== undefined && !once[prefSlot] && prefSlot < f.posiciones.length) {
            once[prefSlot] = a.id;
            asignados.add(a.id);
            agregados++;
        }
    });

    // Asignar en cualquier otro slot libre restante
    for (let i = 0; i < f.posiciones.length; i++) {
        if (!once[i]) {
            const libre = desbloqueados.find(a => !asignados.has(a.id) && (typeof esAvatarDT !== 'function' || !esAvatarDT(a.id)));
            if (libre) {
                once[i] = libre.id;
                asignados.add(libre.id);
                agregados++;
            }
        }
    }

    // 2. Asignar un Director Técnico libre en el corralito de DT (priorizando DTs oficiales)
    if (!once['DT']) {
        const dtLibre = desbloqueados.find(a => !asignados.has(a.id) && typeof esAvatarDT === 'function' && esAvatarDT(a.id))
                     || desbloqueados.find(a => !asignados.has(a.id));
        if (dtLibre) {
            once['DT'] = dtLibre.id;
            asignados.add(dtLibre.id);
            agregados++;
        }
    }

    userStats.onceInicial = once;
    localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify(once));
    guardarStats();
    slotActivoOnce = null;
    renderizarOnceInicial();
    showToast(agregados > 0 ? `¡Equipo completado con tus mejores futbolistas! 🔥` : "Tu formación ya está completa.", "ph-strategy", "success");
};

window.limpiarOnceInicial = function() {
    if (!confirm("¿Querés vaciar el equipo completo (titulares y DT)?")) return;
    userStats.onceInicial = {};
    userStats.onceCapitan = null;
    localStorage.removeItem('ev_once_capitan_' + getUserId());
    localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify({}));
    guardarStats();
    slotActivoOnce = null;
    renderizarOnceInicial();
    showToast("Formación vaciada.", "ph-trash", "info");
};

window.intercambiarPosicionesOnce = function(idx1, idx2) {
    if (idx1 === idx2) return;
    const once = obtenerOnceInicial();
    const p1 = once[idx1];
    const p2 = once[idx2];
    if (!p1 && !p2) return;

    // Si uno de los slots es el DT, validar que un DT oficial no entre como futbolista de cancha
    if (idx1 === 'DT' || idx2 === 'DT') {
        const jugadorHaciaCancha = idx1 === 'DT' ? p1 : p2;
        if (jugadorHaciaCancha && typeof esAvatarDT === 'function' && esAvatarDT(jugadorHaciaCancha)) {
            showToast("¡Un Director Técnico no puede ingresar como futbolista de campo! 📋", "ph-prohibit", "warning");
            return;
        }
    }

    if (p2) {
        once[idx1] = p2;
    } else {
        delete once[idx1];
    }
    if (p1) {
        once[idx2] = p1;
    } else {
        delete once[idx2];
    }

    userStats.onceInicial = once;
    localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify(once));
    guardarStats();
    slotActivoOnce = null;
    renderizarOnceInicial();
    showToast("¡Posición actualizada en la cancha! 🔄", "ph-arrows-left-right", "success");
};

// --- DRAG & DROP EN ESCRITORIO (PC) ---
window.iniciarArrastreOnce = function(e, idx) {
    dragSourceSlotOnce = idx;
    dragSourceAvatarDrawer = null;
    e.dataTransfer.setData("application/x-slot-idx", String(idx));
    e.dataTransfer.setData("text/plain", `slot:${idx}`);
    e.dataTransfer.effectAllowed = "move";
    const node = idx === 'DT'
        ? document.querySelector('.once-dt-bench')
        : document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (node) node.classList.add('is-dragging');
};

window.iniciarArrastreAvatarDrawer = function(e, avatarId) {
    dragSourceAvatarDrawer = avatarId;
    dragSourceSlotOnce = null;
    e.dataTransfer.setData("application/x-avatar-id", avatarId);
    e.dataTransfer.setData("text/plain", `avatar:${avatarId}`);
    e.dataTransfer.effectAllowed = "copyMove";
    const card = e.currentTarget;
    if (card) card.classList.add('is-dragging');
};

window.finalizarArrastreAvatarDrawer = function(e) {
    document.querySelectorAll('.avatar-grid-card').forEach(c => c.classList.remove('is-dragging'));
    document.querySelectorAll('.once-slot-node, .once-dt-bench').forEach(n => n.classList.remove('is-drag-over'));
    dragSourceAvatarDrawer = null;
};

window.permitirArrastreSobreOnce = function(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const targetNode = idx === 'DT' 
        ? document.querySelector('.once-dt-bench') 
        : document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (targetNode && (dragSourceSlotOnce !== idx || dragSourceAvatarDrawer)) {
        targetNode.classList.add('is-drag-over');
    }
};

window.salirArrastreSobreOnce = function(e, idx) {
    const targetNode = idx === 'DT' 
        ? document.querySelector('.once-dt-bench') 
        : document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (targetNode) targetNode.classList.remove('is-drag-over');
};

window.finalizarArrastreOnce = function(e) {
    document.querySelectorAll('.once-slot-node, .once-dt-bench').forEach(n => {
        n.classList.remove('is-dragging', 'is-drag-over');
    });
    dragSourceSlotOnce = null;
    dragSourceAvatarDrawer = null;
};

window.soltarJugadorEnOnce = function(e, targetIdx) {
    e.preventDefault();
    document.querySelectorAll('.once-slot-node, .once-dt-bench').forEach(n => {
        n.classList.remove('is-dragging', 'is-drag-over');
    });

    // 1. Caso arrastre desde el banquillo de futbolistas (Drawer -> Puesto de cancha o DT)
    let avatarDesdeDrawer = dragSourceAvatarDrawer || e.dataTransfer.getData("application/x-avatar-id");
    if (!avatarDesdeDrawer) {
        const plain = e.dataTransfer.getData("text/plain");
        if (plain && plain.startsWith('avatar:')) {
            avatarDesdeDrawer = plain.replace('avatar:', '');
        }
    }
    dragSourceAvatarDrawer = null;

    if (avatarDesdeDrawer) {
        dragSourceSlotOnce = null;
        slotActivoOnce = targetIdx;
        asignarJugadorAOnce(avatarDesdeDrawer);
        return;
    }

    // 2. Caso arrastre entre puestos dentro de la cancha (Slot A -> Slot B)
    let sourceIdx = dragSourceSlotOnce;
    if (sourceIdx === null || sourceIdx === undefined) {
        const rawSlot = e.dataTransfer.getData("application/x-slot-idx");
        if (rawSlot !== "") {
            sourceIdx = rawSlot === 'DT' ? 'DT' : parseInt(rawSlot);
        } else {
            const plain = e.dataTransfer.getData("text/plain");
            if (plain && plain.startsWith('slot:')) {
                const s = plain.replace('slot:', '');
                sourceIdx = s === 'DT' ? 'DT' : parseInt(s);
            }
        }
    }
    dragSourceSlotOnce = null;

    if (sourceIdx === null || sourceIdx === undefined || sourceIdx === targetIdx) return;
    intercambiarPosicionesOnce(sourceIdx, targetIdx);
};

// 🛡️ Prevenir navegación por defecto del navegador si se suelta fuera de los puestos
window.addEventListener('dragover', function(e) {
    if (dragSourceSlotOnce !== null || dragSourceAvatarDrawer !== null) {
        e.preventDefault();
    }
}, false);
window.addEventListener('drop', function(e) {
    if (dragSourceSlotOnce !== null || dragSourceAvatarDrawer !== null) {
        e.preventDefault();
        dragSourceSlotOnce = null;
        dragSourceAvatarDrawer = null;
        document.querySelectorAll('.once-slot-node, .once-dt-bench').forEach(n => {
            n.classList.remove('is-dragging', 'is-drag-over');
        });
        document.querySelectorAll('.avatar-grid-card').forEach(c => c.classList.remove('is-dragging'));
    }
}, false);

// --- DESPLAZAMIENTO TÁCTIL EN CELULARES (TOUCH DRAG CON UMBRAL DE TOQUE) ---
window.iniciarTouchOnce = function(e, idx) {
    const once = obtenerOnceInicial();
    if (!once[idx]) return;
    touchOriginIdxOnce = idx;
    touchMovedOnce = false;

    const touch = e.touches[0];
    touchStartXOnce = touch.clientX;
    touchStartYOnce = touch.clientY;

    const originalSlot = document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (originalSlot) originalSlot.classList.add('is-dragging');
};

window.moverTouchOnce = function(e) {
    if (touchOriginIdxOnce === null) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartXOnce);
    const dy = Math.abs(touch.clientY - touchStartYOnce);

    // Si el desplazamiento supera los 8 píxeles, se activa el modo arrastre
    if (!touchMovedOnce && (dx > 8 || dy > 8)) {
        touchMovedOnce = true;
        const once = obtenerOnceInicial();
        if (touchCloneElOnce) touchCloneElOnce.remove();
        touchCloneElOnce = document.createElement('div');
        touchCloneElOnce.className = 'once-touch-ghost';
        touchCloneElOnce.innerHTML = `<img src="${once[touchOriginIdxOnce]}" class="once-avatar-img" alt="Arrastrando">`;
        document.body.appendChild(touchCloneElOnce);
    }

    if (!touchMovedOnce || !touchCloneElOnce) return;

    if (e.cancelable) e.preventDefault();
    touchCloneElOnce.style.left = `${touch.clientX}px`;
    touchCloneElOnce.style.top = `${touch.clientY}px`;

    touchCloneElOnce.style.display = 'none';
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchCloneElOnce.style.display = 'flex';

    document.querySelectorAll('.once-slot-node').forEach(n => n.classList.remove('is-drag-over'));
    const targetSlot = elemBelow ? elemBelow.closest('.once-slot-node') : null;
    if (targetSlot && parseInt(targetSlot.dataset.slotIdx) !== touchOriginIdxOnce) {
        targetSlot.classList.add('is-drag-over');
    }
};

window.soltarTouchOnce = function(e) {
    if (touchOriginIdxOnce === null) return;

    if (touchCloneElOnce) {
        touchCloneElOnce.remove();
        touchCloneElOnce = null;
    }

    const originSlot = document.querySelector(`.once-slot-node[data-slot-idx="${touchOriginIdxOnce}"]`);
    if (originSlot) originSlot.classList.remove('is-dragging');

    // Si fue un toque rápido sin arrastre, no se mueven fichas y se ejecuta la selección
    if (!touchMovedOnce) {
        touchOriginIdxOnce = null;
        return;
    }

    const touch = e.changedTouches[0];
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetSlot = elemBelow ? elemBelow.closest('.once-slot-node') : null;
    document.querySelectorAll('.once-slot-node').forEach(n => n.classList.remove('is-drag-over'));

    if (targetSlot) {
        const targetIdx = parseInt(targetSlot.dataset.slotIdx);
        if (!isNaN(targetIdx) && targetIdx !== touchOriginIdxOnce) {
            intercambiarPosicionesOnce(touchOriginIdxOnce, targetIdx);
        }
    }
    touchOriginIdxOnce = null;
    touchMovedOnce = false;
};

function calcularYRenderizarQuimicaOnce(f, once) {
    if (!f || !f.posiciones) return { svgHTML: '', quimicaFinal: 0 };
    const posiciones = f.posiciones;
    const norm = id => (id || '').replace(/\.png$/i, '.webp').trim();

    // 🌎 1. DICCIONARIO COMPLETO DE NACIONALIDADES DE TODOS LOS AVATARES
    const PAISES_AVATARES = {
        // 🌟 INICIALES (NIVEL 0)
        '7.webp': 'BRA',                    // El Canario (Vinicius / Brasil)
        '9.webp': 'FRA',                    // El Mosquito (Dembélé / Francia)
        '12.webp': 'URU',                   // El Halcón (Valverde / Uruguay)
        '13.webp': 'BRA',                   // El Timón (Casemiro / Brasil)
        '55.webp': 'COL',                   // Yerry (Mina / Colombia)
        '61.webp': 'CHI',                   // El Pitbull (Medel / Chile)

        // ⚡ SCALONETA & FIGURAS (NIVELES 1-10)
        '16.webp': 'ARG',                   // El Mariscal (Cuti Romero / Argentina)
        '17.webp': 'ARG',                   // El Heredero (Enzo Fernández / Argentina)
        '18.webp': 'ARG',                   // El Motorcito (De Paul / Argentina)
        '19.webp': 'ARG',                   // La Araña (Julián Álvarez / Argentina)
        '20.webp': 'ARG',                   // El Toro (Lautaro Martínez / Argentina)
        '21.webp': 'ARG',                   // El Muro (Otamendi / Argentina)
        '22.webp': 'ARG',                   // El Carnicero (Lisandro Martínez / Argentina)
        '23.webp': 'ARG',                   // Alexis (Mac Allister / Argentina)
        '24.webp': 'ARG',                   // El Guardián (Dibu Martínez / Argentina)
        '51.webp': 'COL',                   // El Guajiro (Luis Díaz / Colombia)

        // 🔥 ELITE INTERNACIONAL (NIVELES 11-20)
        '8.webp': 'BEL',                    // La Muralla (Courtois / Bélgica)
        '10.webp': 'ENG',                   // Hurricane (Kane / Inglaterra)
        '11.webp': 'ENG',                   // Golden Boy (Bellingham / Inglaterra)
        '14.webp': 'ITA',                   // Gigio (Donnarumma / Italia)
        'Guilermo memo Ochoa.webp': 'MEX',  // Memo Ochoa (México)
        '15.webp': 'ARG',                   // El Fideo (Di María / Argentina)
        '26.webp': 'ARG',                   // El Kun (Agüero / Argentina)
        '36.webp': 'URU',                   // El Matador (Cavani / Uruguay)
        '52.webp': 'COL',                   // El 10 Cafetero (James Rodríguez / Colombia)
        'Phil Foden.webp': 'ENG',           // The Sniper (Phil Foden / Inglaterra)
        '53.webp': 'COL',                   // El Tigre (Falcao / Colombia)
        '59.webp': 'CHI',                   // Niño Maravilla (Alexis Sánchez / Chile)

        // 🚀 CRACKS, CAPITANES & TÉCNICOS (NIVELES 21-30)
        '5.webp': 'NOR',                    // El Androide (Haaland / Noruega)
        '4.webp': 'FRA',                    // Kiki (Mbappé / Francia)
        'Jordi Alba.webp': 'ESP',           // La Flecha (Jordi Alba / España)
        '6.webp': 'BRA',                    // Ousadia (Rodrygo / Brasil)
        '37.webp': 'URU',                   // El Gladiador (Godín / Uruguay)
        'Antoine Griezmann.webp': 'FRA',    // El Principito (Griezmann / Francia)
        '35.webp': 'URU',                   // El Pistolero (Suárez / Uruguay)
        '60.webp': 'USA',                   // Capitán América (Pulisic / USA)
        '54.webp': 'COL',                   // El Candado (Dávinson Sánchez / Colombia)
        'Marco Reus.webp': 'GER',           // Woodyinho (Reus / Alemania)
        '45.webp': 'ARG',                   // El Estratega (Scaloni / Argentina)
        '48.webp': 'ARG',                   // El Muñeco (Gallardo / Argentina)
        '46.webp': 'ESP',                   // El Filósofo (Guardiola / España)

        // 🏆 REFERENTES & CRISTIANO (NIVELES 31-40)
        '38.webp': 'ARG',                   // El Relojito (Mascherano / Argentina)
        '43.webp': 'GER',                   // El Francotirador (Kroos / Alemania)
        'Gerard Pique.webp': 'ESP',         // Piquenbauer (Piqué / España)
        'Diego Simeone.webp': 'ARG',        // El Cholo (Simeone / Argentina)
        '42.webp': 'CRO',                   // Mago Balcánico (Modric / Croacia)
        '58.webp': 'CHI',                   // El Rey Arturo (Vidal / Chile)
        '27.webp': 'ARG',                   // El Apache (Tevez / Argentina)
        'Jurgen Klopp.webp': 'GER',         // Jürgen (Klopp / Alemania)
        '49.webp': 'POR',                   // Special One (Mourinho / Portugal)
        '47.webp': 'ITA',                   // Carletto (Ancelotti / Italia)
        'Virgil Van Dijk.webp': 'NED',      // El Titán (Van Dijk / Países Bajos)
        '41.webp': 'SWE',                   // El León Sueco (Ibrahimovic / Suecia)
        'Mohamed Salah.webp': 'EGY',        // El Faraón (Salah / Egipto)
        '3.webp': 'BRA',                    // O Menino (Neymar / Brasil)
        '2.webp': 'POR',                    // El Bicho (Cristiano Ronaldo / Portugal)

        // 👑 MAGOS & MESSI (NIVELES 41-50)
        '39.webp': 'ITA',                   // El Arquitecto (Pirlo / Italia)
        'Kevin De Bruyne.webp': 'BEL',      // El Mago Rubio (De Bruyne / Bélgica)
        '40.webp': 'ESP',                   // El Ilusionista (Iniesta / España)
        'Thomas Muller.webp': 'GER',        // Raumdeuter (Müller / Alemania)
        '44.webp': 'ESP',                   // El Maestro (Xavi / España)
        'Robert Lewandoski.webp': 'POL',    // La Máquina (Lewandowski / Polonia)
        '29.webp': 'ARG',                   // La Brujita (Verón / Argentina)
        '28.webp': 'ARG',                   // El Torero (Riquelme / Argentina)
        'Manuel Neuer.webp': 'GER',         // El Muro Bávaro (Neuer / Alemania)
        '34.webp': 'BRA',                   // Il Pendolino (Cafú / Brasil)
        '33.webp': 'BRA',                   // El Hombre Bala (Roberto Carlos / Brasil)
        'Marcelo.webp': 'BRA',              // La Magia Carioca (Marcelo / Brasil)
        '50.webp': 'FRA',                   // Mago de Marsella (Zidane / Francia)
        '31.webp': 'BRA',                   // Dinho (Ronaldinho / Brasil)
        '1.webp': 'ARG',                    // La Pulga (Messi / Argentina)

        // 🌌 LEYENDAS & MARADONA (NIVELES 51-60)
        '56.webp': 'COL',                   // El Escorpión (Higuita / Colombia)
        '57.webp': 'COL',                   // El Pibe (Valderrama / Colombia)
        'Diego Forlán.webp': 'URU',         // Cachavacha (Forlán / Uruguay)
        '62.webp': 'CHI',                   // Bam-Bam (Zamorano / Chile)
        'Rafa Marquez.webp': 'MEX',         // Káiser de Michoacán (Márquez / México)
        '63.webp': 'CHI',                   // Gran Matador (Salas / Chile)
        'Javier Zanetti.webp': 'ARG',       // El Pupi (Zanetti / Argentina)
        '32.webp': 'BRA',                   // El Fenómeno (Ronaldo / Brasil)
        '30.webp': 'BRA',                   // O Rei (Pelé / Brasil)
        '25.webp': 'ARG',                   // El Barrilete (Maradona / Argentina)

        // 💎 ÉLITE CLÁSICA & DTs (NIVELES 61-85)
        '64.webp': 'ESP',                   // Tiburón (Puyol / España)
        '65.webp': 'ESP',                   // El Santo (Casillas / España)
        'Philip Lahm.webp': 'GER',          // El Reloj Alemán (Lahm / Alemania)
        '66.webp': 'ENG',                   // Sir David (Beckham / Inglaterra)
        'Rio Ferdinand.webp': 'ENG',        // El Káiser Inglés (Ferdinand / Inglaterra)
        '67.webp': 'URU',                   // El Príncipe (Francescoli / Uruguay)
        'Steven Gerard.webp': 'ENG',        // Stevie G (Gerrard / Inglaterra)
        '68.webp': 'ITA',                   // Superman (Buffon / Italia)
        'Didier Drogba.webp': 'CIV',        // El Elefante (Drogba / Costa de Marfil)
        '69.webp': 'ITA',                   // Il Capitano (Maldini / Italia)
        '70.webp': 'PAR',                   // Pepo (Chilavert / Paraguay)
        '71.webp': 'FRA',                   // Tití (Henry / Francia)
        'Wayne Rooney.webp': 'ENG',         // Bad Boy (Rooney / Inglaterra)
        '72.webp': 'ITA',                   // El Eterno (Baresi / Italia)
        '73.webp': 'NED',                   // Fútbol Total (Cruyff / Países Bajos)
        'Alessandro del piero.webp': 'ITA', // Pinturicchio (Del Piero / Italia)
        'Luis Figo.webp': 'POR',            // El Extremo de Oro (Figo / Portugal)
        'Xabi Alonso.webp': 'ESP',          // La Brújula (Xabi Alonso / España)
        'Firefly (3).webp': 'NED',          // El Tulipán Negro (Gullit / Países Bajos)
        'Alex Ferguson.webp': 'SCO'         // Sir Alex (Ferguson / Escocia)
    };

    // 🏟️ 2. DICCIONARIO DE CLUBES HISTÓRICOS PARA QUÍMICA POR EQUIPO
    const CLUBES_AVATARES = {
        '1.webp': ['barca', 'psg', 'intermiami'],
        '35.webp': ['barca', 'atletico', 'intermiami', 'liverpool'],
        '3.webp': ['barca', 'psg', 'santos'],
        '40.webp': ['barca'],
        '44.webp': ['barca'],
        '64.webp': ['barca'],
        'Gerard Pique.webp': ['barca', 'mufc'],
        'Jordi Alba.webp': ['barca', 'intermiami'],
        '31.webp': ['barca', 'milan', 'psg'],
        '73.webp': ['barca', 'ajax'],
        '46.webp': ['barca', 'mancity', 'bayern'],
        'Rafa Marquez.webp': ['barca'],
        '71.webp': ['barca', 'arsenal'],
        'Robert Lewandoski.webp': ['barca', 'bayern', 'dortmund'],
        'Antoine Griezmann.webp': ['barca', 'atletico'],
        '2.webp': ['realmadrid', 'mufc', 'juventus'],
        '42.webp': ['realmadrid'],
        '43.webp': ['realmadrid', 'bayern'],
        '7.webp': ['realmadrid'],
        '6.webp': ['realmadrid'],
        '11.webp': ['realmadrid', 'dortmund'],
        '12.webp': ['realmadrid'],
        '13.webp': ['realmadrid', 'mufc'],
        '65.webp': ['realmadrid'],
        '33.webp': ['realmadrid', 'intermilan'],
        'Marcelo.webp': ['realmadrid'],
        '50.webp': ['realmadrid', 'juventus'],
        '32.webp': ['realmadrid', 'barca', 'intermilan', 'milan'],
        'Luis Figo.webp': ['realmadrid', 'barca', 'intermilan'],
        '47.webp': ['realmadrid', 'milan', 'psg', 'chelsea', 'bayern'],
        'Xabi Alonso.webp': ['realmadrid', 'liverpool', 'bayern', 'leverkusen'],
        '8.webp': ['realmadrid', 'chelsea', 'atletico'],
        '4.webp': ['realmadrid', 'psg', 'monaco'],
        '66.webp': ['realmadrid', 'mufc', 'milan', 'psg'],
        '5.webp': ['mancity', 'dortmund'],
        'Kevin De Bruyne.webp': ['mancity', 'chelsea'],
        'Phil Foden.webp': ['mancity'],
        '26.webp': ['mancity', 'atletico', 'independiente'],
        '19.webp': ['mancity', 'river', 'atletico'],
        'Wayne Rooney.webp': ['mufc'],
        'Rio Ferdinand.webp': ['mufc'],
        'Alex Ferguson.webp': ['mufc'],
        '49.webp': ['mufc', 'realmadrid', 'chelsea', 'intermilan', 'roma'],
        '22.webp': ['mufc', 'ajax'],
        'Virgil Van Dijk.webp': ['liverpool'],
        'Mohamed Salah.webp': ['liverpool', 'chelsea', 'roma'],
        'Steven Gerard.webp': ['liverpool'],
        'Jurgen Klopp.webp': ['liverpool', 'dortmund'],
        '51.webp': ['liverpool', 'porto'],
        '23.webp': ['liverpool', 'brighton', 'boca'],
        '28.webp': ['boca', 'villarreal'],
        '25.webp': ['boca', 'napoli'],
        '27.webp': ['boca', 'mufc', 'mancity', 'juventus'],
        '36.webp': ['boca', 'psg', 'napoli', 'mufc'],
        '48.webp': ['river'],
        '67.webp': ['river'],
        '63.webp': ['river'],
        '17.webp': ['river', 'chelsea', 'benfica'],
        'Manuel Neuer.webp': ['bayern'],
        'Thomas Muller.webp': ['bayern'],
        'Philip Lahm.webp': ['bayern'],
        '20.webp': ['intermilan', 'racing'],
        'Javier Zanetti.webp': ['intermilan'],
        '69.webp': ['milan'],
        '72.webp': ['milan'],
        '39.webp': ['milan', 'juventus'],
        '34.webp': ['milan', 'roma'],
        '14.webp': ['milan', 'psg'],
        'Firefly (3).webp': ['milan', 'chelsea'],
        '41.webp': ['milan', 'intermilan', 'barca', 'psg', 'juventus', 'mufc'],
        'Alessandro del piero.webp': ['juventus'],
        '68.webp': ['juventus', 'psg'],
        'Diego Simeone.webp': ['atletico', 'intermilan', 'racing'],
        '37.webp': ['atletico'],
        '18.webp': ['atletico', 'racing'],
        '53.webp': ['atletico', 'chelsea', 'monaco', 'river'],
        'Didier Drogba.webp': ['chelsea'],
        'Marco Reus.webp': ['dortmund'],
        '9.webp': ['barca', 'psg', 'dortmund'],
        '10.webp': ['bayern', 'tottenham'],
        '15.webp': ['realmadrid', 'psg', 'benfica', 'juventus', 'mufc', 'rosariocentral'],
        '16.webp': ['tottenham', 'atalanta', 'belgrano'],
        '21.webp': ['benfica', 'mancity', 'porto', 'velez'],
        '24.webp': ['astonvilla', 'arsenal', 'independiente'],
        '29.webp': ['estudiantes', 'intermilan', 'lazio', 'parma', 'mufc', 'chelsea', 'boca'],
        '30.webp': ['santos'],
        '38.webp': ['barca', 'liverpool', 'river', 'estudiantes'],
        '45.webp': ['deportivo', 'lazio', 'atalanta', 'estudiantes', 'newells'],
        '52.webp': ['realmadrid', 'bayern', 'porto', 'everton', 'saopaulo', 'monaco'],
        '54.webp': ['tottenham', 'ajax', 'atleticonacional'],
        '55.webp': ['everton', 'barca', 'palmeiras', 'cagliari'],
        '56.webp': ['atleticonacional', 'valladolid'],
        '57.webp': ['junior', 'deportivocali', 'montpellier', 'valladolid'],
        '58.webp': ['juventus', 'bayern', 'barca', 'intermilan', 'colocolo', 'flamengo', 'leverkusen'],
        '59.webp': ['barca', 'arsenal', 'intermilan', 'marseille', 'mufc', 'river', 'colocolo'],
        '60.webp': ['milan', 'chelsea', 'dortmund'],
        '61.webp': ['boca', 'sevillafc', 'intermilan', 'bologna', 'vasco'],
        '62.webp': ['realmadrid', 'intermilan', 'america', 'sevillafc', 'colocolo'],
        'Guilermo memo Ochoa.webp': ['america', 'malaga', 'granada'],
        'Diego Forlán.webp': ['atletico', 'villarreal', 'mufc', 'intermilan', 'independiente', 'penarol'],
        '70.webp': ['velez', 'sanlorenzo', 'penarol', 'zaragoza']
    };

    // 🌎 3. CONTEO GLOBAL DE PRESENCIAS POR PAÍS Y POR CLUB (PLANTILLA + DT)
    const dtId = norm(once['DT']);
    const paisDt = dtId ? (PAISES_AVATARES[dtId] || 'GEN') : null;
    const clubsDt = dtId ? (CLUBES_AVATARES[dtId] || []) : [];

    const conteoPaises = {};
    const conteoClubes = {};

    // El DT aporta +1 a su país y a sus clubes
    if (paisDt && paisDt !== 'GEN') {
        conteoPaises[paisDt] = (conteoPaises[paisDt] || 0) + 1;
    }
    clubsDt.forEach(c => {
        conteoClubes[c] = (conteoClubes[c] || 0) + 1;
    });

    // Conteo de cada titular en el campo
    for (let i = 0; i < posiciones.length; i++) {
        const idJug = norm(once[i]);
        if (!idJug) continue;

        const pais = PAISES_AVATARES[idJug] || 'GEN';
        if (pais !== 'GEN') {
            conteoPaises[pais] = (conteoPaises[pais] || 0) + 1;
        }

        const clubs = CLUBES_AVATARES[idJug] || [];
        clubs.forEach(c => {
            conteoClubes[c] = (conteoClubes[c] || 0) + 1;
        });
    }

    // 💎 4. CÁLCULO DE QUÍMICA INDIVIDUAL (0 A 3 PUNTOS / ROMBOS POR FUTBOLISTA)
    // Umbrales estilo EA Sports FC:
    // Club: 2 -> 1 pt, 4 -> 2 pts, 7 -> 3 pts
    // País: 2 -> 1 pt, 5 -> 2 pts, 8 -> 3 pts
    const quimicaIndividual = {};
    let quimicaTotal = 0;

    for (let i = 0; i < posiciones.length; i++) {
        const idJug = norm(once[i]);
        if (!idJug) {
            quimicaIndividual[i] = 0;
            continue;
        }

        let ptsClub = 0;
        const clubs = CLUBES_AVATARES[idJug] || [];
        clubs.forEach(c => {
            const count = conteoClubes[c] || 0;
            let pts = 0;
            if (count >= 7) pts = 3;
            else if (count >= 4) pts = 2;
            else if (count >= 2) pts = 1;
            if (pts > ptsClub) ptsClub = pts;
        });

        let ptsPais = 0;
        const pais = PAISES_AVATARES[idJug] || 'GEN';
        if (pais !== 'GEN') {
            const count = conteoPaises[pais] || 0;
            if (count >= 8) ptsPais = 3;
            else if (count >= 5) ptsPais = 2;
            else if (count >= 2) ptsPais = 1;
        }

        // Cada titular puede sumar hasta 3 puntos como máximo
        const chemJugador = Math.min(3, ptsClub + ptsPais);
        quimicaIndividual[i] = chemJugador;
        quimicaTotal += chemJugador;
    }

    // Tope final absoluto de 33 (11 titulares x 3 puntos)
    const quimicaFinal = Math.min(33, quimicaTotal);

    // ⚡ 5. BONO OVR REAL PARA SIMULACIÓN DE PARTIDOS
    let bonoOvr = 0;
    if (quimicaFinal >= 33) bonoOvr = 3;
    else if (quimicaFinal >= 22) bonoOvr = 2;
    else if (quimicaFinal >= 11) bonoOvr = 1;

    // 🔗 6. LÍNEAS TÁCTICAS VISUALES ENTRE TITULARES CONTIGUOS
    let linesSVG = '';
    for (let i = 0; i < posiciones.length; i++) {
        for (let j = i + 1; j < posiciones.length; j++) {
            const pA = posiciones[i];
            const pB = posiciones[j];
            const xA = parseFloat(pA.left);
            const yA = parseFloat(pA.top);
            const xB = parseFloat(pB.left);
            const yB = parseFloat(pB.top);

            const dist = Math.hypot(xA - xB, yA - yB);
            if (dist > 8 && dist < 38) {
                const idA = norm(once[i]);
                const idB = norm(once[j]);
                let isLinked = false;

                if (idA && idB) {
                    const paisA = PAISES_AVATARES[idA] || 'GEN';
                    const paisB = PAISES_AVATARES[idB] || 'GEN';
                    const clubsA = CLUBES_AVATARES[idA] || [];
                    const clubsB = CLUBES_AVATARES[idB] || [];

                    const mismoPais = (paisA === paisB && paisA !== 'GEN');
                    const mismoClub = clubsA.some(c => clubsB.includes(c));
                    const mismoJugador = (idA === idB);

                    if (mismoPais || mismoClub || mismoJugador) {
                        isLinked = true;
                    }
                }

                linesSVG += `<line x1="${xA}%" y1="${yA}%" x2="${xB}%" y2="${yB}%" class="chemistry-line ${isLinked ? 'chemistry-linked' : ''}" />`;
            }
        }
    }

    const svgHTML = `<svg class="chemistry-lines-svg">${linesSVG}</svg>`;
    return { svgHTML, quimicaFinal, quimicaIndividual, bonoOvr };
}

function renderizarOnceInicial() {
    const container = document.getElementById('once-pitch-nodes');
    const tabsContainer = document.getElementById('once-formation-tabs');
    const statsPill = document.getElementById('once-stats-counter');
    const drawerContainer = document.getElementById('once-players-grid');
    const drawerTitle = document.getElementById('once-drawer-title');
    const headerTitleGroup = document.querySelector('.once-title-group');
    if (!container || !drawerContainer) return;

    const f = FORMACIONES_TACTICAS[formacionOnceActual] || FORMACIONES_TACTICAS['4-3-3'];
    const once = obtenerOnceInicial();
    const capitanAvatar = obtenerCapitanOnce();
    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    const dtAvatar = once['DT'] || null;
    const escudoClub = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + getUserId()) || getPref('ev_avatar_logo', 'ev');
    const itemEscudo = (typeof BANDERAS_LISTA !== 'undefined') ? BANDERAS_LISTA.find(b => b.id === escudoClub) : null;
    const nombreClub = itemEscudo ? itemEscudo.label : 'Estadios Virt.';

    // 🎨 Teñido dinámico del modal con los colores oficiales del escudo
    const modalBox = document.querySelector('.once-modal-box');
    if (modalBox) {
        const fondClub = (itemEscudo && escudoClub !== 'ev')
            ? (typeof obtenerFondoClub === 'function' ? obtenerFondoClub(itemEscudo.label, itemEscudo.label) : '')
            : 'linear-gradient(135deg, rgba(0, 230, 118, 0.25) 0%, rgba(41, 121, 255, 0.2) 100%)';
        const esLight = document.documentElement.getAttribute('data-theme') === 'light';
        const overlayGrad = esLight
            ? 'linear-gradient(180deg, rgba(240, 247, 243, 0.85) 0%, rgba(226, 232, 228, 0.95) 100%)'
            : 'linear-gradient(180deg, rgba(12, 20, 34, 0.72) 0%, rgba(6, 10, 18, 0.94) 100%)';
        modalBox.style.setProperty('background', `${overlayGrad}, ${fondClub}`, 'important');
    }

    // 1. Escudo interactivo del club junto al título (agrandado y con nombre del club)
    if (headerTitleGroup) {
        const textoClub = (itemEscudo && escudoClub !== 'ev') ? `<span class="once-team-name-tag">${sanitizarHTML(nombreClub)}</span>` : '';
        headerTitleGroup.innerHTML = `
            <div class="once-team-shield-box" onclick="abrirSelectorEscudoParaOnce()" title="Elegir escudo de tu equipo">
                <img src="${obtenerUrlEscudo(escudoClub)}" alt="Escudo" class="once-team-shield-img">
                <span class="once-shield-edit-tag"><i class="ph-bold ph-pencil-simple"></i></span>
            </div>
            <div class="once-title-text-wrap">
                <h2>Tu Once Inicial</h2>
                ${textoClub}
            </div>
        `;
    }

    // 2. Contador de titulares, OVR general, desglose de líneas y Saldo SP + Química
    const ocupadosCount = Object.keys(once).filter(k => k !== 'DT' && parseInt(k) < f.posiciones.length && once[k]).length;
    const ovrEquipo = calcularOvrEquipoOnce();
    const ovrLineas = calcularOvrLineasOnce();
    const spDisponibles = userStats.puntosHabilidad || 0;
    const { svgHTML: quimicaSVG, quimicaFinal, quimicaIndividual, bonoOvr } = calcularYRenderizarQuimicaOnce(f, once);
    const bonoQuimica = bonoOvr || 0;

    if (statsPill) {
        statsPill.innerHTML = `
            <div class="once-stats-hub">
                <!-- 🛡️ OVR HERO CARD -->
                <div class="once-ovr-card-hero" title="OVR Promedio de tu Once Titular (con bonus de química global)">
                    <span class="once-ovr-hero-label">OVR EQUIPO</span>
                    <div class="once-ovr-hero-val-wrap">
                        <span class="once-ovr-hero-number">${ovrEquipo > 0 ? ovrEquipo : '--'}</span>
                        ${bonoQuimica > 0 ? `<span class="once-ovr-bonus-chip chem-bonus" title="Bono de química global: +${bonoQuimica} OVR">+${bonoQuimica}</span>` : ''}
                    </div>
                </div>

                <!-- ⚙️ LÍNEAS TÁCTICAS (DEF · MED · DEL) -->
                <div class="once-lines-hub">
                    <div class="once-line-cell def" title="Defensa y Arquero">
                        <span class="once-line-tag"><i class="ph-bold ph-shield"></i> DEF</span>
                        <span class="once-line-score">${ovrLineas.def}</span>
                    </div>
                    <div class="once-line-divider"></div>
                    <div class="once-line-cell med" title="Mediocampo">
                        <span class="once-line-tag"><i class="ph-bold ph-arrows-merge"></i> MED</span>
                        <span class="once-line-score">${ovrLineas.med}</span>
                    </div>
                    <div class="once-line-divider"></div>
                    <div class="once-line-cell del" title="Delantera">
                        <span class="once-line-tag"><i class="ph-bold ph-crosshair"></i> DEL</span>
                        <span class="once-line-score">${ovrLineas.del}</span>
                    </div>
                </div>

                <!-- 💎 QUÍMICA & PUNTOS SP -->
                <div class="once-resources-hub">
                    <div class="once-res-badge quimica ${quimicaFinal >= 33 ? 'chem-perfect' : (quimicaFinal >= 22 ? 'chem-high' : (quimicaFinal >= 11 ? 'chem-mid' : ''))}" title="Química de Equipo (Líneas tácticas y rombos por jugador)">
                        <i class="ph-bold ph-diamonds-four"></i>
                        <div class="once-res-text">
                            <span class="once-res-val">${quimicaFinal}<b>/33</b></span>
                            <span class="once-res-sub">QUÍMICA</span>
                        </div>
                    </div>
                    <div class="once-res-badge sp" title="Puntos de Habilidad disponibles para entrenar jugadores">
                        <i class="ph-fill ph-lightning"></i>
                        <div class="once-res-text">
                            <span class="once-res-val">${spDisponibles}</span>
                            <span class="once-res-sub">SP DISP.</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    // 3. Pestañas de formación
    if (tabsContainer) {
        tabsContainer.innerHTML = Object.keys(FORMACIONES_TACTICAS).map(k => `
            <button type="button" class="pitch-form-tab ${k === formacionOnceActual ? 'active' : ''}" onclick="cambiarFormacionOnce('${k}')">${k}</button>
        `).join('');
    }

    // 4. Renderizado de los 11 titulares en la cancha con OVR integrado y rombos de química
    let htmlNodos = f.posiciones.map((item, idx) => {
        const avatarId = once[idx];
        const isSlotActive = slotActivoOnce === idx;
        const isCaptain = avatarId && (avatarId === capitanAvatar);
        const ovrIndividual = avatarId ? obtenerOvrJugador(avatarId) : 0;
        const chemVal = (quimicaIndividual && quimicaIndividual[idx]) ? quimicaIndividual[idx] : 0;

        const dragAttrs = avatarId ? `
            draggable="true"
            ondragstart="iniciarArrastreOnce(event, ${idx})"
            ondragend="finalizarArrastreOnce(event)"
            ontouchstart="iniciarTouchOnce(event, ${idx})"
            ontouchmove="moverTouchOnce(event)"
            ontouchend="soltarTouchOnce(event)"
        ` : '';

        const dropAttrs = `
            ondragover="permitirArrastreSobreOnce(event, ${idx})"
            ondragleave="salirArrastreSobreOnce(event, ${idx})"
            ondrop="soltarJugadorEnOnce(event, ${idx})"
        `;

        if (avatarId) {
            return `
            <div class="once-slot-node filled ${isSlotActive ? 'is-active-slot' : ''} ${isCaptain ? 'is-team-captain' : ''}" 
                 data-slot-idx="${idx}" 
                 style="top:${item.top}; left:${item.left};" 
                 onclick="seleccionarSlotOnce(${idx})"
                 ${dragAttrs}
                 ${dropAttrs}>
                <div class="once-avatar-circle">
                    <img src="${avatarId}" alt="${item.pos}" class="once-avatar-img" draggable="false">
                    ${isCaptain ? '<div class="once-captain-armband-badge">C</div>' : ''}
                    <button type="button" class="once-slot-remove-btn" onclick="quitarJugadorDeOnce(${idx}, event)" ontouchstart="event.stopPropagation()" title="Quitar titular">✕</button>
                </div>
                <div class="once-pos-badge">${item.pos} · ${ovrIndividual}</div>
                <div class="once-chem-pips" title="Química individual: ${chemVal}/3">
                    <span class="chem-pip ${chemVal >= 1 ? 'active' : ''}"></span>
                    <span class="chem-pip ${chemVal >= 2 ? 'active' : ''}"></span>
                    <span class="chem-pip ${chemVal >= 3 ? 'active' : ''}"></span>
                </div>
                <div class="once-player-label">${obtenerNombreAvatar(avatarId)}</div>
            </div>`;
        } else {
            return `
            <div class="once-slot-node empty ${isSlotActive ? 'is-active-slot' : ''}" 
                 data-slot-idx="${idx}" 
                 style="top:${item.top}; left:${item.left};" 
                 onclick="seleccionarSlotOnce(${idx})"
                 ${dropAttrs}>
                <div class="once-empty-circle">
                    <i class="ph-bold ph-plus"></i>
                </div>
                <div class="once-pos-badge empty">${item.pos}</div>
                <div class="once-chem-pips" style="opacity:0.3;">
                    <span class="chem-pip"></span>
                    <span class="chem-pip"></span>
                    <span class="chem-pip"></span>
                </div>
                <div class="once-player-label empty">Vacante</div>
            </div>`;
        }
    }).join('');

    // 5. Corralito técnico del DT en la esquina de la cancha
    const isDtActive = slotActivoOnce === 'DT';
    const ovrDt = dtAvatar ? obtenerOvrJugador(dtAvatar) : 0;
    const htmlDtCorralito = `
        <div class="once-dt-bench ${isDtActive ? 'is-active-slot' : ''} ${dtAvatar ? 'filled' : 'empty'}" 
             onclick="seleccionarSlotOnce('DT')" 
             ondragover="permitirArrastreSobreOnce(event, 'DT')"
             ondragleave="salirArrastreSobreOnce(event, 'DT')"
             ondrop="soltarJugadorEnOnce(event, 'DT')"
             title="Elegir Director Técnico">
            <div class="once-avatar-circle dt-circle">
                ${dtAvatar ? `
                    <img src="${dtAvatar}" alt="DT" class="once-avatar-img" draggable="false">
                    <button type="button" class="once-slot-remove-btn" onclick="quitarJugadorDeOnce('DT', event)" ontouchstart="event.stopPropagation()" title="Quitar DT">✕</button>
                ` : `
                    <i class="ph-bold ph-clipboard-text"></i>
                `}
            </div>
            <div class="once-pos-badge dt">DT${dtAvatar ? ` · ${ovrDt}` : ''}</div>
            <div class="once-player-label">${dtAvatar ? obtenerNombreAvatar(dtAvatar) : 'Elegir DT'}</div>
        </div>
    `;

    container.innerHTML = quimicaSVG + htmlNodos + htmlDtCorralito;

    // 6. Título y Barra de Entrenamiento interactivo
    if (drawerTitle) {
        if (slotActivoOnce === 'DT' && dtAvatar) {
            const nomDt = obtenerNombreAvatar(dtAvatar);
            const costoSpDt = (ovrDt >= 99) ? 0 : calcularCostoSPMejora(ovrDt);
            const txtEntrenarDt = (ovrDt >= 99) ? 'MÁX 99 OVR' : `Entrenar (+1 OVR · ${costoSpDt} SP)`;
            drawerTitle.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; flex-wrap:wrap;">
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:55%;">
                        <i class="ph-bold ph-clipboard-text" style="color:var(--accent-color);"></i> DT: <b>${nomDt}</b> (OVR ${ovrDt})
                    </span>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" class="btn-3d primary" onclick="mejorarJugadorOnce('${dtAvatar}', event)" ${ovrDt >= 99 ? 'disabled' : ''} style="padding:4px 10px; font-size:0.65rem; height:26px; min-height:26px; border-radius:8px; gap:4px; box-shadow:none;">
                            <i class="ph-bold ph-lightning"></i> ${txtEntrenarDt}
                        </button>
                        <button type="button" class="btn-3d secondary danger" onclick="quitarJugadorDeOnce('DT', event)" style="padding:4px 8px; font-size:0.65rem; height:26px; min-height:26px; border-radius:8px; box-shadow:none;" title="Quitar DT">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </div>`;
        } else if (slotActivoOnce !== null && once[slotActivoOnce]) {
            const idTitular = once[slotActivoOnce];
            const nomTitular = obtenerNombreAvatar(idTitular);
            const ovrTitular = obtenerOvrJugador(idTitular);
            const isCap = (idTitular === capitanAvatar);
            const costoSpTitular = (ovrTitular >= 99) ? 0 : calcularCostoSPMejora(ovrTitular);
            const txtEntrenarTitular = (ovrTitular >= 99) ? 'MÁX 99 OVR' : `Entrenar (+1 OVR · ${costoSpTitular} SP)`;
            drawerTitle.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; flex-wrap:wrap;">
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:50%;">
                        <i class="ph-bold ph-user" style="color:var(--accent-color);"></i> <b>${nomTitular}</b> (OVR ${ovrTitular})
                    </span>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button type="button" class="btn-3d primary" onclick="mejorarJugadorOnce('${idTitular}', event)" ${ovrTitular >= 99 ? 'disabled' : ''} style="padding:4px 10px; font-size:0.65rem; height:26px; min-height:26px; border-radius:8px; gap:4px; box-shadow:none;">
                            <i class="ph-bold ph-lightning"></i> ${txtEntrenarTitular}
                        </button>
                        <button type="button" class="btn-3d secondary ${isCap ? 'active-cap' : ''}" onclick="designarCapitanOnce(${slotActivoOnce}, event)" style="padding:4px 10px; font-size:0.75rem; font-weight:900; height:26px; min-height:26px; border-radius:8px; box-shadow:none; ${isCap ? 'border-color:#ffd700 !important; color:#0b1325 !important; background:linear-gradient(135deg, #ffd700 0%, #ff9100 100%) !important; box-shadow:0 0 10px rgba(255,215,0,0.6) !important;' : ''}" title="${isCap ? 'Quitar capitanía' : 'Nombrar Capitán (C)'}">
                            C
                        </button>
                        <button type="button" class="btn-3d secondary danger" onclick="quitarJugadorDeOnce(${slotActivoOnce}, event)" style="padding:4px 8px; font-size:0.65rem; height:26px; min-height:26px; border-radius:8px; box-shadow:none;" title="Quitar titular">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </div>`;
        } else if (slotActivoOnce !== null) {
            const posNom = f.posiciones[slotActivoOnce]?.pos || 'PUESTO';
            drawerTitle.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; gap:6px; width:100%; text-align:center;">
                    <i class="ph-bold ph-hand-pointing" style="color:var(--accent-color); font-size:1rem; flex-shrink:0;"></i>
                    <span>Elegí un futbolista para <b>${posNom}</b> (${slotActivoOnce + 1}º posición):</span>
                </div>`;
        } else {
            drawerTitle.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; gap:6px; width:100%; text-align:center;">
                    <i class="ph-bold ph-lightning" style="color:#00ff77; font-size:1rem; flex-shrink:0;"></i>
                    <span>Tocá un titular para <b>entrenarlo (+1 OVR)</b> o cambiarlo:</span>
                </div>`;
        }
    }

    // 7. Banquillo con OVR visible en cada carta
    const jugadoresEnCancha = new Set(Object.values(once));
    const esSeleccionandoDt = slotActivoOnce === 'DT';

    // Si estamos eligiendo DT, mostramos primero los DTs oficiales
    const listaOrdenada = [...AVATARES_LISTA].sort((a, b) => {
        if (esSeleccionandoDt) {
            const dtA = (typeof esAvatarDT === 'function' && esAvatarDT(a.id)) ? 1 : 0;
            const dtB = (typeof esAvatarDT === 'function' && esAvatarDT(b.id)) ? 1 : 0;
            if (dtB !== dtA) return dtB - dtA;
        }
        return 0;
    });

    drawerContainer.innerHTML = listaOrdenada.map(item => {
        const isLocked = miNivel < item.nivel;
        const yaEnCancha = jugadoresEnCancha.has(item.id);
        const ovrCarta = obtenerOvrJugador(item.id);
        const esDt = typeof esAvatarDT === 'function' && esAvatarDT(item.id);

        let lockBadge = '';
        if (isLocked) {
            lockBadge = `<div class="avatar-grid-lock-mask"><i class="ph-fill ph-lock-key"></i><span>NV. ${item.nivel}</span></div>`;
        } else if (esDt) {
            lockBadge = `<div class="once-drawer-ovr-tag" style="background:#f59e0b; color:#000; font-weight:900;">DT ${ovrCarta}</div>`;
        } else {
            lockBadge = `<div class="once-drawer-ovr-tag">${ovrCarta}</div>`;
        }

        const esIncompatible = (!esSeleccionandoDt && slotActivoOnce !== null && esDt);

        const dragAttrsDrawer = !isLocked ? `
            draggable="true" 
            ondragstart="iniciarArrastreAvatarDrawer(event, '${item.id}')" 
            ondragend="finalizarArrastreAvatarDrawer(event)"
        ` : '';

        return `
        <div class="avatar-grid-card ${isLocked ? 'locked' : 'unlocked'} ${yaEnCancha ? 'in-pitch' : ''}" 
             onclick="asignarJugadorAOnce('${item.id}')"
             ${dragAttrsDrawer}
             style="${esIncompatible ? 'opacity: 0.45; filter: grayscale(0.5);' : ''}"
             title="${esIncompatible ? 'Es Director Técnico (solo asignable en slot DT)' : item.label}">
            <div class="avatar-grid-img-wrap">
                <img src="${item.id}" alt="${item.label}" class="${isLocked ? 'avatar-locked-blur' : ''}" loading="lazy" draggable="false">
                ${lockBadge}
            </div>
            <span>${item.label}</span>
        </div>`;
    }).join('');
}
window.manejarInteraccionOnce = function(e) {
    const wrap = document.getElementById('once-btn-wrapper');
    const esTouch = window.matchMedia('(pointer: coarse)').matches;
    if (esTouch && wrap && !wrap.classList.contains('show-tooltip')) {
        e.preventDefault();
        wrap.classList.add('show-tooltip');
        setTimeout(() => wrap.classList.remove('show-tooltip'), 2500);
        return;
    }
    abrirModalOnceInicial();
};
// ========================================================
// 🎮 HUB DE MODO CARRERA (GESTIÓN, COPAS Y PALMARÉS)
// ========================================================
window.abrirModalModoCarrera = function() {
    const modal = document.getElementById('carrera-modal');
    if (!modal) return;

    const ovr = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 0;
    const sp = (userStats && userStats.puntosHabilidad) || 0;
    const copas = (userStats && userStats.copasGanadas) ? userStats.copasGanadas.length : 0;

    const sub = document.getElementById('carrera-hub-sub');
    if (sub) {
        sub.innerHTML = `OVR Equipo: <b style="color:#38bdf8;">${ovr > 0 ? ovr : '--'}</b> · Habilidad: <b style="color:#00ff77;">${sp} SP</b> · Títulos: <b style="color:#fbbf24;">${copas}</b>`;
    }

    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    const descLiga = document.getElementById('carrera-hub-liga-desc');
    const descCopas = document.getElementById('carrera-hub-copas-desc');
    if (descLiga) {
        descLiga.innerHTML = (miNivel < 4)
            ? `<span style="color:#fbbf24; font-weight:800;"><i class="ph-bold ph-lock-key"></i> Desbloquea en Nivel 4 (Nivel actual: ${miNivel}/4)</span>`
            : 'Disputá el torneo fecha tras fecha y peleá por el campeonato';
    }
    if (descCopas) {
        descCopas.innerHTML = (miNivel < 4)
            ? `<span style="color:#fbbf24; font-weight:800;"><i class="ph-bold ph-lock-key"></i> Desbloquea en Nivel 4 (Nivel actual: ${miNivel}/4)</span>`
            : 'Competí en eliminación directa desde Copa Desafío a Mundial';
    }

    modal.style.display = 'flex';
};

window.cerrarModalModoCarrera = function() {
    const modal = document.getElementById('carrera-modal');
    if (modal) modal.style.display = 'none';
};

window.clickJugarCopaDesdeCarrera = function() {
    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (miNivel < 4) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    const once = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const f = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual]) ? FORMACIONES_TACTICAS[formacionOnceActual] : { posiciones: Array(11).fill(0) };
    let count = 0;
    for (let i = 0; i < f.posiciones.length; i++) {
        if (once[i]) count++;
    }

    if (count < 11) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    cerrarModalModoCarrera();
    abrirModalTorneoCopas();
};

window.clickJugarLigaDesdeCarrera = function() {
    const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (miNivel < 4) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    const once = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const f = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual]) ? FORMACIONES_TACTICAS[formacionOnceActual] : { posiciones: Array(11).fill(0) };
    let count = 0;
    for (let i = 0; i < f.posiciones.length; i++) {
        if (once[i]) count++;
    }

    if (count < 11) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    cerrarModalModoCarrera();
    abrirModalTemporadaLiga();
};

window.abrirPalmaresDesdeCarrera = function() {
    cerrarModalModoCarrera();
    
    let modalPalmares = document.getElementById('carrera-palmares-modal');
    if (!modalPalmares) {
        modalPalmares = document.createElement('div');
        modalPalmares.id = 'carrera-palmares-modal';
        modalPalmares.className = 'modal-backdrop';
        modalPalmares.style.cssText = 'display:flex; z-index:10050;';
        document.body.appendChild(modalPalmares);
    } else {
        modalPalmares.style.display = 'flex';
    }

    const copas = userStats.copasGanadas || [];
    const ganoNac = copas.some(c => c.tier === 'nacional');
    const ganoCont = copas.some(c => c.tier === 'continental');
    const ganoClubes = copas.some(c => c.tier === 'mundial_clubes');
    const ganoMundial = copas.some(c => c.tier === 'mundial');

    // Listado de ligas ganadas si hubiera
    const ligasGanadas = copas.filter(c => (c.tier || '').startsWith('liga_'));

    modalPalmares.innerHTML = `
        <div class="modal-content carrera-modal-card" style="max-width:520px;">
            <div class="guessr-modal-header" style="justify-content:space-between; width:100%; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="medalla-oro.webp" style="width:34px; height:34px; object-fit:contain;" alt="Palmarés">
                    <div style="text-align:left;">
                        <h3 style="margin:0; font-size:1.2rem; font-weight:900; text-transform:uppercase;">Palmarés del Club</h3>
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Vitrina Oficial de Trofeos</span>
                    </div>
                </div>
                <button type="button" class="btn-close-modal" onclick="document.getElementById('carrera-palmares-modal').style.display='none'; abrirModalModoCarrera();">✕</button>
            </div>

            <div class="palmares-cups-row" style="grid-template-columns:repeat(2, 1fr); gap:10px; width:100%; margin-bottom:14px;">
                <div class="palmares-cup-item ${ganoNac ? 'unlocked' : 'locked'}" style="padding:14px 10px;">
                    <img src="medalla-bronce.webp" alt="Copa Desafío" class="palmares-cup-img" style="width:52px; height:52px;">
                    <strong style="font-size:0.86rem; margin-top:4px;">Copa Desafío</strong>
                    <span style="font-size:0.72rem;">${ganoNac ? '🏆 Campeón' : '🔒 Sin ganar'}</span>
                </div>
                <div class="palmares-cup-item ${ganoCont ? 'unlocked' : 'locked'}" style="padding:14px 10px;">
                    <img src="medalla-plata.webp" alt="Copa Continental" class="palmares-cup-img" style="width:52px; height:52px;">
                    <strong style="font-size:0.86rem; margin-top:4px;">Copa Continental</strong>
                    <span style="font-size:0.72rem;">${ganoCont ? '🏆 Campeón' : '🔒 Sin ganar'}</span>
                </div>
                <div class="palmares-cup-item ${ganoClubes ? 'unlocked' : 'locked'}" style="padding:14px 10px;">
                    <img src="medalla-oro.webp" alt="Mundial de Clubes" class="palmares-cup-img" style="width:52px; height:52px;">
                    <strong style="font-size:0.86rem; margin-top:4px;">Mundial de Clubes</strong>
                    <span style="font-size:0.72rem;">${ganoClubes ? '🏆 Campeón' : '🔒 Sin ganar'}</span>
                </div>
                <div class="palmares-cup-item ${ganoMundial ? 'unlocked' : 'locked'}" style="padding:14px 10px;">
                    <img src="estrella.webp" alt="Copa del Mundo" class="palmares-cup-img" style="width:52px; height:52px;">
                    <strong style="font-size:0.86rem; margin-top:4px;">Copa del Mundo</strong>
                    <span style="font-size:0.72rem;">${ganoMundial ? '👑 Campeón' : '🔒 Sin ganar'}</span>
                </div>
            </div>

            ${ligasGanadas.length ? `
                <div style="width:100%; background:rgba(255,215,0,0.08); border:1px solid rgba(255,215,0,0.3); border-radius:12px; padding:10px 14px; box-sizing:border-box; margin-bottom:12px; text-align:left;">
                    <span style="font-size:0.70rem; font-weight:900; color:#ffd700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px;">Ligas Conquistadas</span>
                    ${ligasGanadas.map(l => `<div style="font-size:0.80rem; font-weight:800; color:#ffffff; padding:2px 0;">🏆 ${l.nombre}</div>`).join('')}
                </div>
            ` : ''}

            <button type="button" class="btn-3d primary" style="width:100%; padding:10px;" onclick="document.getElementById('carrera-palmares-modal').style.display='none'; abrirModalModoCarrera();">
                Volver a Modo Carrera
            </button>
        </div>
    `;
};

// ========================================================
// 👑 RANKING DE CLUBES Y SALÓN DE CAMPEONES (MODO CARRERA)
// ========================================================
window.cerrarModalRankingCarrera = function(volverACarrera = true) {
    const modal = document.getElementById('ranking-carrera-modal');
    if (modal) modal.style.display = 'none';
    if (window.origenRankingCarrera === 'perfil') {
        window.origenRankingCarrera = null;
        if (typeof abrirModalPerfil === 'function') abrirModalPerfil();
    } else if (volverACarrera && typeof abrirModalModoCarrera === 'function') {
        abrirModalModoCarrera();
    }
};

window.abrirModalRankingCarrera = async function() {
    const modal = document.getElementById('ranking-carrera-modal');
    const body = document.getElementById('ranking-carrera-modal-body');
    if (!modal || !body) return;

    modal.style.display = 'flex';
    body.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
            <i class="ph-duotone ph-circle-notch animate-spin" style="font-size:2.5rem; color:#ffd700;"></i>
            <p style="margin-top:14px; font-size:0.9rem; font-weight:800; color:var(--text-main);">Abriendo vitrina de campeones...</p>
        </div>
    `;

    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Vos')).trim().toLowerCase();

    try {
        if (!supabaseClient) throw new Error("Sin conexión a la base de datos");

        const { data: perfilesRaw, error } = await supabaseClient
            .from('perfiles')
            .select('id_usuario, experiencia, datos_juego')
            .limit(300);

        if (error) throw error;

        // Procesar y contabilizar títulos (Ligas + Copas) por DT
        const rankingCampeones = [];

        (perfilesRaw || []).forEach(p => {
            const dj = p.datos_juego || {};
            const pref = dj.preferencias || {};
            const nick = (pref.custom_nick || '').trim();
            if (!nick) return;

            const exp = p.experiencia || dj.xpTotal || 0;
            const nivelDt = calcularNivelIdx(exp);
            // 🛡️ Filtro de nivel mínimo: solo DTs con plantel completo (Nivel 4+)
            if (nivelDt < 4) return;

            const copas = dj.copasGanadas || [];
            let ligas = 0, nac = 0, cont = 0, clubes = 0, mundial = 0;

            copas.forEach(c => {
                if (c.tier === 'nacional') nac++;
                else if (c.tier === 'continental') cont++;
                else if (c.tier === 'mundial_clubes') clubes++;
                else if (c.tier === 'mundial') mundial++;
                else ligas++; // Todo trofeo que no sea copa es una liga ganada
            });

            const totalCopas = copas.length;

            // ⚽ OVR REAL DEL ONCE INICIAL DEL RIVAL
            let ovrOnce = 0;
            const onceR = dj.onceInicial;
            const mejoras = dj.mejorasJugadores || {};
            let idsTitulares = [];

            if (onceR && typeof onceR === 'object') {
                idsTitulares = Object.keys(onceR).filter(k => k !== 'DT' && onceR[k]).map(k => onceR[k]);
            }

            if (idsTitulares.length >= 11) {
                let sumaOvr = 0;
                idsTitulares.forEach(id => {
                    const aLimpio = id.replace(/\.png$/i, '.webp');
                    const extra = mejoras[aLimpio] || 0;
                    const item = AVATARES_LISTA.find(a => a.id === aLimpio);
                    const nivelReq = item ? item.nivel : 0;
                    const baseOvr = NIVELES[nivelReq]?.ovr || 50;
                    sumaOvr += Math.min(99, baseOvr + extra);
                });
                ovrOnce = Math.round(sumaOvr / idsTitulares.length);
                if (dj.onceCapitan) ovrOnce += 2;
                if (onceR['DT']) ovrOnce += 1;
                ovrOnce = Math.min(99, ovrOnce);
            } else {
                const poolDesbloqueados = AVATARES_LISTA.filter(a => nivelDt >= a.nivel).sort((a, b) => b.nivel - a.nivel);
                const mejores11 = poolDesbloqueados.slice(0, 11);
                if (mejores11.length >= 11) {
                    let sumaOvr = 0;
                    mejores11.forEach(item => {
                        const extra = mejoras[item.id] || 0;
                        const baseOvr = NIVELES[item.nivel]?.ovr || 50;
                        sumaOvr += Math.min(99, baseOvr + extra);
                    });
                    ovrOnce = Math.round(sumaOvr / 11);
                    if (dj.onceCapitan) ovrOnce += 2;
                    if (onceR && onceR['DT']) ovrOnce += 1;
                    ovrOnce = Math.min(99, ovrOnce);
                } else {
                    ovrOnce = Math.min(99, NIVELES[nivelDt]?.ovr || 60);
                }
            }

            rankingCampeones.push({
                nombre: nick,
                avatar: pref.avatar_hair || '1.webp',
                escudo: dj.onceEscudo || pref.avatar_logo || 'ev',
                ovr: ovrOnce,
                ligas: ligas,
                nac: nac,
                cont: cont,
                clubes: clubes,
                mundial: mundial,
                total: totalCopas
            });
        });

        // Asegurar que el usuario actual figure con su Once Inicial y palmarés en vivo
        const misCopas = userStats.copasGanadas || [];
        const miNombreReal = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Vos')).trim();
        const miNivelActual = (userStats && userStats.nivelActual !== undefined) ? userStats.nivelActual : calcularNivelIdx(userStats.xpTotal || 0);
        const yaEstaEnLista = rankingCampeones.find(r => r.nombre.toLowerCase() === miNombre);

        let misLigas = 0, misNac = 0, misCont = 0, misClubes = 0, misMundial = 0;
        misCopas.forEach(c => {
            if (c.tier === 'nacional') misNac++;
            else if (c.tier === 'continental') misCont++;
            else if (c.tier === 'mundial_clubes') misClubes++;
            else if (c.tier === 'mundial') misMundial++;
            else misLigas++;
        });

        let miOvrLive = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 0;
        if (miOvrLive === 0) {
            miOvrLive = Math.min(99, NIVELES[miNivelActual]?.ovr || 60);
        } else {
            miOvrLive = Math.min(99, miOvrLive);
        }

        if (!yaEstaEnLista && miNombreReal && miNivelActual >= 4) {
            rankingCampeones.push({
                nombre: miNombreReal,
                avatar: getPref('ev_avatar_hair', '1.webp'),
                escudo: userStats.onceEscudo || getPref('ev_avatar_logo', 'ev'),
                ovr: miOvrLive,
                ligas: misLigas,
                nac: misNac,
                cont: misCont,
                clubes: misClubes,
                mundial: misMundial,
                total: misCopas.length
            });
        } else if (yaEstaEnLista) {
            yaEstaEnLista.ligas = misLigas;
            yaEstaEnLista.nac = misNac;
            yaEstaEnLista.cont = misCont;
            yaEstaEnLista.clubes = misClubes;
            yaEstaEnLista.mundial = misMundial;
            yaEstaEnLista.total = misCopas.length;
            yaEstaEnLista.ovr = miOvrLive;
        }

        // Orden de mérito: mayor total de títulos; desempate por mundiales, clubes, continentales, ligas, etc.
        rankingCampeones.sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            if (b.mundial !== a.mundial) return b.mundial - a.mundial;
            if (b.clubes !== a.clubes) return b.clubes - a.clubes;
            if (b.cont !== a.cont) return b.cont - a.cont;
            if (b.ligas !== a.ligas) return b.ligas - a.ligas;
            if (b.nac !== a.nac) return b.nac - a.nac;
            return b.ovr - a.ovr;
        });

        const medallas3D = [
            '<img src="medalla-oro.webp" alt="1º" class="rank-cup-medal">',
            '<img src="medalla-plata.webp" alt="2º" class="rank-cup-medal">',
            '<img src="medalla-bronce.webp" alt="3º" class="rank-cup-medal">'
        ];

        let filasHTML = '';
        rankingCampeones.forEach((item, idx) => {
            const esMio = item.nombre.toLowerCase() === miNombre;
            const rankBadge = idx < 3 ? medallas3D[idx] : `<span class="rank-num-text">${idx + 1}</span>`;
            const copasTotal = (item.nac || 0) + (item.cont || 0) + (item.clubes || 0) + (item.mundial || 0);

            // 🌟 Sellos de gloria exclusivos: Solo si tiene títulos de esa categoría épica
            let sellosGloriaHTML = '';
            if (item.mundial > 0) sellosGloriaHTML += `<span class="glory-tag tag-mundial" title="${item.mundial} Copa(s) del Mundo">⭐${item.mundial > 1 ? ` ${item.mundial}` : ''}</span>`;
            if (item.clubes > 0) sellosGloriaHTML += `<span class="glory-tag tag-clubes" title="${item.clubes} Mundial(es) de Clubes">🌍${item.clubes > 1 ? ` ${item.clubes}` : ''}</span>`;
            if (item.cont > 0) sellosGloriaHTML += `<span class="glory-tag tag-continental" title="${item.cont} Copa(s) Continental(es)">🏆${item.cont > 1 ? ` ${item.cont}` : ''}</span>`;

            filasHTML += `
                <div class="carrera-rank-row ${esMio ? 'es-propio' : ''} ${idx < 3 ? `top-${idx + 1}` : ''}">
                    <div class="carrera-rank-pos">${rankBadge}</div>
                    
                    <div class="carrera-rank-user" onclick="inspeccionarPerfilRival('${item.nombre.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(item.nombre)}">
                        <div class="ranking-avatar-circle">
                            <div class="ranking-avatar-inner">${generarAvatarHTML(item.avatar, true)}</div>
                        </div>
                        <div class="carrera-user-info">
                            <span class="carrera-user-name">${sanitizarHTML(item.nombre)} ${esMio ? '<b class="carrera-tag-vos">(Vos)</b>' : ''}</span>
                            <span class="carrera-user-meta">OVR ${item.ovr} · <img src="${obtenerUrlEscudo(item.escudo)}" class="carrera-mini-shield"></span>
                        </div>
                    </div>

                    <div class="carrera-rank-ligas-col">
                        <div class="palmares-col-chip ligas ${item.ligas > 0 ? 'con-titulos' : 'sin-titulos'}" title="${item.ligas} Ligas Nacionales">
                            <i class="ph-fill ph-shield-star"></i>
                            <span class="palmares-num">${item.ligas}</span>
                        </div>
                    </div>

                    <div class="carrera-rank-copas-col">
                        <div class="palmares-col-chip copas ${copasTotal > 0 ? 'con-titulos' : 'sin-titulos'}" title="${copasTotal} Copas Oficiales">
                            <i class="ph-fill ph-trophy"></i>
                            <span class="palmares-num">${copasTotal}</span>
                        </div>
                        ${sellosGloriaHTML ? `<div class="glory-tags-row">${sellosGloriaHTML}</div>` : ''}
                    </div>

                    <div class="carrera-rank-total">
                        <span class="total-cups-badge">
                            <b class="total-num">${item.total}</b>
                        </span>
                    </div>

                    <div class="carrera-rank-action">
                        ${esMio ? '<span class="carrera-action-self"><i class="ph-fill ph-shield-check"></i> TU CLUB</span>' : `
                            <button type="button" class="btn-desafiar-row" onclick="desafiarDesdeRankingCarrera('${item.nombre.replace(/'/g, "\\'")}')" title="Desafiar a su Once">
                                <img src="liga-icon-historial.webp" alt="Desafiar" class="carrera-mini-swords">
                                <span>DUELO</span>
                            </button>
                        `}
                    </div>
                </div>
            `;
        });

        body.innerHTML = `
            <div class="carrera-ranking-container">
                <div class="carrera-ranking-header">
                    <div class="carrera-header-left">
                        <div class="trophy-stage-wrapper">
                            <div class="trophy-glow-backdrop glow-gold"></div>
                            <div class="trophy-main-img-box">
                                <img src="trofeo.webp" alt="Salón de Campeones" class="trophy-main-img">
                            </div>
                        </div>
                    </div>
                    <div class="carrera-header-right">
                        <h2 class="carrera-ranking-title">Salón de Campeones</h2>
                        <p class="carrera-ranking-sub">Los directores técnicos más laureados y legendarios de la comunidad.</p>
                    </div>
                </div>

                <div class="carrera-ranking-scroll" id="carrera-ranking-scroll-box">
                    <div class="carrera-ranking-table-header">
                        <span class="col-center">#</span>
                        <span>DT / CLUB</span>
                        <span class="col-center">LIGAS</span>
                        <span class="col-center">COPAS</span>
                        <span class="col-center">TOTAL</span>
                        <span class="col-center">DUELO</span>
                    </div>
                    ${filasHTML || '<p style="text-align:center; padding:30px; color:var(--text-muted);">Aún no hay campeones registrados.</p>'}
                </div>
            </div>
        `;

    } catch (e) {
        console.error("Error al cargar ranking de campeones:", e);
        body.innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--danger-color);">
                <i class="ph-duotone ph-warning-circle" style="font-size:2.5rem;"></i>
                <p style="margin-top:10px; font-weight:800;">No se pudo conectar con el servidor.</p>
            </div>
        `;
    }
};

window.desafiarDesdeRankingCarrera = async function(nombreRival) {
    const onceUser = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const fUser = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual]) 
        ? FORMACIONES_TACTICAS[formacionOnceActual] 
        : { posiciones: Array(11).fill(0) };
    let countUser = 0;
    for (let i = 0; i < fUser.posiciones.length; i++) {
        if (onceUser[i]) countUser++;
    }

    if (countUser < 11) {
        showToast("Subí al Nivel 4 para desbloquear este modo 🔒", "ph-lock-key", "warning");
        return;
    }

    cerrarModalRankingCarrera(false);

    let datosRival = {
        custom_nick: nombreRival,
        xpTotal: 0,
        nivelActual: 0,
        ovr: 60,
        card_theme: 'arg',
        avatar_hair: '1.webp',
        user_pos: 'DC',
        avatar_logo: 'ev',
        onceInicial: null,
        onceCapitan: null,
        onceEscudo: 'ev',
        mejorasJugadores: {}
    };

    try {
        if (supabaseClient) {
            const { data: perfiles } = await supabaseClient
                .from('perfiles')
                .select('id_usuario, experiencia, datos_juego');

            if (perfiles) {
                const encontrado = perfiles.find(p => {
                    const dj = p.datos_juego || {};
                    const pref = dj.preferencias || {};
                    return (pref.custom_nick && pref.custom_nick.trim().toLowerCase() === nombreRival.trim().toLowerCase());
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
                    datosRival.onceInicial = dj.onceInicial || null;
                    datosRival.onceCapitan = dj.onceCapitan || null;
                    datosRival.onceEscudo = dj.onceEscudo || pref.avatar_logo || 'ev';
                    datosRival.mejorasJugadores = dj.mejorasJugadores || {};
                }
            }
        }
    } catch (e) {
        console.warn("Aviso al preparar duelo:", e);
    }

    if (datosRival.nivelActual < 4) {
        showToast(`${nombreRival} todavía no tiene los 11 titulares desbloqueados (Requiere Nivel 4) 🔒`, "ph-lock-key", "warning");
        return;
    }

    window.datosUltimoRivalInspeccionado = datosRival;
    iniciarDesafioOnceRivalDirecto();
};
// ========================================================
// 🏆 MOTOR DEL MODO TEMPORADA DE LIGA LARGA
// ========================================================
const LIGAS_TEMPORADA_CATALOGO = {
    'arg_primera': {
        nombre: 'Primera División Argentina',
        bandera: 'ar',
        clubes: [
            'arg_boca', 'arg_river', 'arg_independiente', 'arg_racing', 'arg_sanlorenzo',
            'arg_huracan', 'arg_riestra', 'arg_barracas', 'arg_talleres', 'arg_belgrano',
            'arg_instituto', 'arg_estudiantesrc', 'arg_platense', 'arg_indrivadavia', 'arg_estudiantes',
            'arg_gimnasia', 'arg_gimnasiamza', 'arg_tigre', 'arg_velez', 'arg_argentinos',
            'arg_newells', 'arg_sarmiento', 'arg_union', 'arg_rosario', 'arg_lanus',
            'arg_banfield', 'arg_centralcordoba', 'arg_atleticotucuman', 'arg_defensa', 'arg_aldosivi'
        ]
    },
    'eng_premier': {
        nombre: 'Premier League',
        bandera: 'gb-eng',
        clubes: [
            'eng_arsenal', 'eng_mancity', 'eng_liverpool', 'eng_chelsea', 'eng_astonvilla',
            'eng_tottenham', 'eng_newcastle', 'eng_manunited', 'eng_brighton', 'eng_nottingham',
            'eng_bournemouth', 'eng_brentford', 'eng_fulham', 'eng_crystalpalace', 'eng_everton',
            'eng_ipswich', 'eng_leeds', 'eng_sunderland', 'eng_coventry', 'eng_hull'
        ]
    },
    'esp_laliga': {
        nombre: 'La Liga EA Sports',
        bandera: 'es',
        clubes: [
            'esp_realmadrid', 'esp_barcelona', 'esp_atletico', 'esp_athletic', 'esp_betis',
            'esp_realsociedad', 'esp_sevilla', 'esp_villarreal', 'esp_valencia', 'esp_osasuna',
            'esp_celta', 'esp_alaves', 'esp_getafe', 'esp_mallorca', 'esp_laspalmas',
            'esp_rayo', 'esp_girona', 'esp_leganes', 'esp_valladolid', 'esp_espanyol'
        ]
    },
    'ita_seriea': {
        nombre: 'Serie A Italiana',
        bandera: 'it',
        clubes: [
            'ita_juventus', 'ita_inter', 'ita_milan', 'ita_roma', 'ita_lazio',
            'ita_napoli', 'ita_fiorentina', 'ita_atalanta', 'ita_bologna', 'ita_torino',
            'ita_udinese', 'ita_genoa', 'ita_verona', 'ita_empoli', 'ita_lecce',
            'ita_monza', 'ita_cagliari', 'ita_parma', 'ita_como', 'ita_venezia'
        ]
    },
    'bra_brasileirao': {
        nombre: 'Brasileirão Serie A',
        bandera: 'br',
        clubes: [
            'bra_flamengo', 'bra_palmeiras', 'bra_botafogo', 'bra_atleticomg', 'bra_saopaulo',
            'bra_fluminense', 'bra_internacional', 'bra_gremio', 'bra_cruzeiro', 'bra_corinthians',
            'bra_bahia', 'bra_vasco', 'bra_athleticopr', 'bra_bragantino', 'bra_coritiba',
            'bra_chapecoense', 'bra_mirassol', 'bra_vitoria', 'bra_remo', 'bra_santos'
        ]
    },
    'col_primera': {
        nombre: 'Liga BetPlay Colombia',
        bandera: 'co',
        clubes: [
            'col_nacional', 'col_millonarios', 'col_america', 'col_junior', 'col_santafe',
            'col_tolima', 'col_cali', 'col_medellin', 'col_bucaramanga', 'col_oncecaldas',
            'col_pasto', 'col_pereira', 'col_aguilas', 'col_alianza', 'col_fortaleza',
            'col_jaguares', 'col_cucuta', 'col_llaneros', 'col_chico', 'col_interpalmira'
        ]
    },
    'chi_primera': {
        nombre: 'Primera División de Chile',
        bandera: 'cl',
        clubes: [
            'chi_colocolo', 'chi_uchile', 'chi_ucatolica', 'chi_coquimbo', 'chi_everton',
            'chi_huachipato', 'chi_palestino', 'chi_nublense', 'chi_ohiggins', 'chi_audax',
            'chi_cobresal', 'chi_calera', 'chi_laserena', 'chi_dconcepcion', 'chi_limache', 'chi_uconcepcion'
        ]
    },
    'ger_bundesliga': {
        nombre: 'Bundesliga Alemana',
        bandera: 'de',
        clubes: [
            'ger_bayern', 'ger_dortmund', 'ger_leverkusen', 'ger_leipzig', 'ger_stuttgart',
            'ger_frankfurt', 'ger_freiburg', 'ger_hoffenheim', 'ger_bremen', 'ger_monchengladbach',
            'ger_mainz', 'ger_augsburg', 'ger_unionberlin', 'ger_koln', 'ger_hamburg',
            'ger_schalke', 'ger_paderborn', 'ger_elversberg'
        ]
    },
    'fra_ligue1': {
        nombre: 'Ligue 1 de Francia',
        bandera: 'fr',
        clubes: [
            'fra_psg', 'fra_marseille', 'fra_lyon', 'fra_lille', 'fra_monaco',
            'fra_lens', 'fra_nice', 'fra_rennes', 'fra_strasbourg', 'fra_toulouse',
            'fra_lehavre', 'fra_angers', 'fra_auxerre', 'fra_brest', 'fra_lorient',
            'fra_lemans', 'fra_parisfc', 'fra_troyes'
        ]
    },
    'mex_ligamx': {
        nombre: 'Liga MX',
        bandera: 'mx',
        clubes: [
            'mex_america', 'mex_monterrey', 'mex_tigres', 'mex_cruzazul', 'mex_chivas',
            'mex_toluca', 'mex_pumas', 'mex_pachuca', 'mex_leon', 'mex_santos',
            'mex_atlas', 'mex_sanluis', 'mex_tijuana', 'mex_necaxa', 'mex_puebla',
            'mex_juarez', 'mex_queretaro', 'mex_atlante'
        ]
    }
};

window.cerrarModalTemporadaLiga = function(volverACarrera = true) {
    const modal = document.getElementById('liga-temporada-modal');
    if (modal) modal.style.display = 'none';
    if (volverACarrera && typeof abrirModalModoCarrera === 'function') {
        abrirModalModoCarrera();
    }
};

window.abrirModalTemporadaLiga = function() {
    const modal = document.getElementById('liga-temporada-modal');
    if (!modal) {
        console.error("El elemento #liga-temporada-modal no fue encontrado en index.html.");
        return;
    }
    modal.style.display = 'flex';

    const id = getUserId();
    const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + id);
    let ligaActiva = null;
    try { ligaActiva = guardadaRaw ? JSON.parse(guardadaRaw) : null; } catch(e) {}

    if (ligaActiva && ligaActiva.tabla && ligaActiva.fixture) {
        renderizarHubLigaTemporada(ligaActiva);
    } else {
        renderizarSelectorLigasDisponibles();
    }
};

function renderizarSelectorLigasDisponibles() {
    const body = document.getElementById('liga-temporada-modal-body');
    if (!body) return;

    const modalBox = document.querySelector('.liga-temporada-box');
    if (modalBox) modalBox.classList.add('is-selector');

    let cardsHTML = '';
    for (const key in LIGAS_TEMPORADA_CATALOGO) {
        const item = LIGAS_TEMPORADA_CATALOGO[key];
        const flagUrl = `https://flagcdn.com/w80/${item.bandera}.png`;
        const cantClubes = item.clubes.length;
        const totalFechas = cantClubes;

        const miniClubes = item.clubes.slice(0, 4).map(cId => {
            const url = (typeof obtenerUrlEscudo === 'function') ? obtenerUrlEscudo(cId) : '';
            return `<img src="${url}" class="lt-card-mini-shield" alt="${cId}" onerror="this.style.display='none'">`;
        }).join('');

        cardsHTML += `
            <div class="lt-league-card" onclick="iniciarTemporadaLiga('${key}')">
                <div class="lt-league-card-top">
                    <img src="${flagUrl}" alt="${item.nombre}" class="lt-league-flag">
                    <div class="lt-league-text">
                        <strong>${item.nombre}</strong>
                        <span>${cantClubes} Clubes · ${totalFechas} Fechas</span>
                    </div>
                </div>
                <div class="lt-league-card-bottom">
                    <div class="lt-mini-shields-row">${miniClubes}</div>
                    <span class="lt-league-action-tag">Competir <i class="ph-bold ph-caret-right"></i></span>
                </div>
            </div>
        `;
    }

    body.innerHTML = `
        <div class="lt-header lt-selector-header">
            <img src="catalogo.webp" alt="Ligas" class="lt-header-img">
            <div class="lt-header-info">
                <h2>Elegí tu Liga</h2>
                <p>Tu Once Inicial competirá en la liga oficial disputando el fixture fecha a fecha.</p>
            </div>
        </div>
        <div class="lt-leagues-grid">
            ${cardsHTML}
        </div>
    `;
}

function generarFixtureRoundRobin(equipos) {
    let teams = [...equipos];

    // 1. Barajamos a los rivales para que el orden inicial nunca sea el mismo
    for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    if (teams.length % 2 !== 0) teams.push('descanso');
    const n = teams.length;
    const fechas = [];

    // 2. Construcción matemática de rondas todos contra todos
    for (let r = 0; r < n - 1; r++) {
        const partidos = [];
        for (let i = 0; i < n / 2; i++) {
            const t1 = teams[i];
            const t2 = teams[n - 1 - i];
            if (t1 !== 'descanso' && t2 !== 'descanso') {
                partidos.push(r % 2 === 0 ? { local: t1, visitante: t2 } : { local: t2, visitante: t1 });
            }
        }
        fechas.push(partidos);
        teams.splice(1, 0, teams.pop());
    }

    // 3. Mezclamos el orden de las jornadas para que cada temporada tenga un calendario único
    for (let i = fechas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fechas[i], fechas[j]] = [fechas[j], fechas[i]];
    }

    // 4. Garantizamos que en la Fecha 1 juegues siempre un partido (la fecha libre se traslada a cualquier jornada posterior)
    const tienePartidoFecha1 = fechas[0].some(p => p.local === 'user_team' || p.visitante === 'user_team');
    if (!tienePartidoFecha1) {
        const idxConPartido = fechas.findIndex((f, idx) => idx > 0 && f.some(p => p.local === 'user_team' || p.visitante === 'user_team'));
        if (idxConPartido !== -1) {
            [fechas[0], fechas[idxConPartido]] = [fechas[idxConPartido], fechas[0]];
        }
    }

    return fechas;
}

window.iniciarTemporadaLiga = function(ligaKey) {
    const cfg = LIGAS_TEMPORADA_CATALOGO[ligaKey];
    if (!cfg) return;

    const id = getUserId();
    const u = obtenerUsuarioLogueado();
    const nombreUsuario = getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Tu Once');
    const escudoUsuario = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + id) || getPref('ev_avatar_logo', 'ev');
    const ovrUser = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 75;

    // Tomamos los clubes de la liga
    let listaClubes = [...cfg.clubes];
    let userTeamId = 'user_team';

    // Construimos la tabla de posiciones inicial
    const tabla = [];
    tabla.push({
        id: userTeamId,
        nombre: nombreUsuario,
        escudo: escudoUsuario,
        ovr: ovrUser,
        esUsuario: true,
        pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0
    });

    // Se conservan todos los clubes de la liga sin eliminar a ninguno
    listaClubes.forEach(cId => {
        const itemBandera = (typeof BANDERAS_LISTA !== 'undefined') ? BANDERAS_LISTA.find(b => b.id === cId) : null;
        const nombreClub = itemBandera ? itemBandera.label : cId;
        const ovrClub = EQUIPOS_OVR[cId] || 70;
        tabla.push({
            id: cId,
            nombre: nombreClub,
            escudo: cId,
            ovr: ovrClub,
            esUsuario: false,
            pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0
        });
    });

    const listaEquiposFixture = [userTeamId, ...listaClubes];
    const fixture = generarFixtureRoundRobin(listaEquiposFixture);

    const nuevaLiga = {
        key: ligaKey,
        nombre: cfg.nombre,
        bandera: cfg.bandera,
        totalFechas: fixture.length,
        fechaActual: 1,
        tabla: tabla,
        fixture: fixture
    };

    localStorage.setItem('ev_liga_guardada_' + id, JSON.stringify(nuevaLiga));
    renderizarHubLigaTemporada(nuevaLiga);
    showToast(`¡Temporada iniciada en ${cfg.nombre}! ⚽`, "ph-check-circle", "success");
};

// ========================================================
// ⚽ SEGUIMIENTO DE GOLEADORES Y ASISTIDORES DEL ONCE
// ========================================================
function registrarGolesYAsistenciasOnce(liga, cantGoles) {
    if (cantGoles <= 0) return;
    if (!liga.golesOnce) liga.golesOnce = {};
    if (!liga.asistenciasOnce) liga.asistenciasOnce = {};

    const once = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const f = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual])
        ? FORMACIONES_TACTICAS[formacionOnceActual]
        : { posiciones: Array(11).fill(0) };

    const dtId = once['DT'] ? String(once['DT']).replace(/\.png$/i, '.webp') : null;

    const titulares = [];
    f.posiciones.forEach((posObj, idx) => {
        const idAvatar = once[idx] ? String(once[idx]).replace(/\.png$/i, '.webp') : null;
        // 🛡️ REGLA: El DT nunca juega en el campo ni puede meter goles ni asistencias
        if (idAvatar && idAvatar !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(idAvatar))) {
            titulares.push({ id: idAvatar, pos: posObj.pos });
        }
    });
    if (!titulares.length) return;

    const pesosGol = { DC: 4.5, EI: 3.5, ED: 3.5, SD: 3.2, MCO: 2.5, MC: 1.5, MI: 1.5, MD: 1.5, MCD: 0.8, DFC: 0.5, LI: 0.6, LD: 0.6, POR: 0.05 };
    const pesosAsist = { MCO: 4.2, MC: 3.2, MI: 3.0, MD: 3.0, EI: 2.6, ED: 2.6, SD: 2.4, LI: 1.8, LD: 1.8, DC: 1.6, MCD: 1.2, DFC: 0.5, POR: 0.1 };

    for (let g = 0; g < cantGoles; g++) {
        let poolG = [];
        titulares.forEach(t => {
            const p = pesosGol[t.pos] || 1;
            for (let k = 0; k < Math.round(p * 10); k++) poolG.push(t.id);
        });
        const goleador = poolG[Math.floor(Math.random() * poolG.length)] || titulares[0].id;
        if (goleador !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(goleador))) {
            liga.golesOnce[goleador] = (liga.golesOnce[goleador] || 0) + 1;
        }

        if (Math.random() < 0.82 && titulares.length > 1) {
            let poolA = [];
            titulares.forEach(t => {
                if (t.id !== goleador) {
                    const p = pesosAsist[t.pos] || 1;
                    for (let k = 0; k < Math.round(p * 10); k++) poolA.push(t.id);
                }
            });
            if (poolA.length) {
                const asistidor = poolA[Math.floor(Math.random() * poolA.length)];
                if (asistidor !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(asistidor))) {
                    liga.asistenciasOnce[asistidor] = (liga.asistenciasOnce[asistidor] || 0) + 1;
                }
            }
        }
    }
}

function obtenerLideresOnce(liga) {
    let topGol = { id: null, cant: 0 };
    let topAsist = { id: null, cant: 0 };
    const once = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const dtId = once['DT'] ? String(once['DT']).replace(/\.png$/i, '.webp') : null;

    if (liga.golesOnce) {
        for (const id in liga.golesOnce) {
            const cleanId = String(id).replace(/\.png$/i, '.webp');
            // 🛡️ REGLA: El DT nunca puede figurar como goleador
            if (cleanId === dtId || (typeof esAvatarDT === 'function' && esAvatarDT(cleanId))) continue;
            if (liga.golesOnce[id] > topGol.cant) {
                topGol = { id, cant: liga.golesOnce[id] };
            }
        }
    }
    if (liga.asistenciasOnce) {
        for (const id in liga.asistenciasOnce) {
            const cleanId = String(id).replace(/\.png$/i, '.webp');
            // 🛡️ REGLA: El DT nunca puede figurar como asistidor
            if (cleanId === dtId || (typeof esAvatarDT === 'function' && esAvatarDT(cleanId))) continue;
            if (liga.asistenciasOnce[id] > topAsist.cant) {
                topAsist = { id, cant: liga.asistenciasOnce[id] };
            }
        }
    }
    return { topGol, topAsist };
}

function renderizarHubLigaTemporada(liga) {
    const body = document.getElementById('liga-temporada-modal-body');
    if (!body) return;

    const modalBox = document.querySelector('.liga-temporada-box');
    if (modalBox) modalBox.classList.remove('is-selector');

    const fechaIdx = liga.fechaActual - 1;
    const esFinalizado = liga.fechaActual > liga.totalFechas;

    // Ordenar tabla: Pts > DIF > GF > OVR
    liga.tabla.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dif !== a.dif) return b.dif - a.dif;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return b.ovr - a.ovr;
    });

    let bannerPartidoHTML = '';
    if (!esFinalizado && liga.fixture[fechaIdx]) {
        const cruceUsuario = liga.fixture[fechaIdx].find(p => p.local === 'user_team' || p.visitante === 'user_team');
        if (cruceUsuario) {
            const esLocal = cruceUsuario.local === 'user_team';
            const rivalId = esLocal ? cruceUsuario.visitante : cruceUsuario.local;
            const rivalData = liga.tabla.find(t => t.id === rivalId) || { nombre: 'Rival', escudo: rivalId, ovr: 70 };
            const userData = liga.tabla.find(t => t.esUsuario);

            const eqLocal = esLocal ? userData : rivalData;
            const eqVis = esLocal ? rivalData : userData;

            bannerPartidoHTML = `
                <div class="lt-match-banner">
                    <div class="lt-match-top-row">
                        <span class="lt-fecha-pill"><i class="ph-bold ph-calendar-blank"></i> FECHA ${liga.fechaActual} DE ${liga.totalFechas}</span>
                        <span class="lt-match-status-tag">PRÓXIMO PARTIDO</span>
                    </div>

                    <div class="lt-match-clash">
                        <div class="lt-match-team">
                            <div class="lt-team-shield-box ${eqLocal.esUsuario ? 'local' : 'rival'}">
                                <img src="${obtenerUrlEscudo(eqLocal.escudo)}" class="sim-team-shield" alt="${eqLocal.nombre}">
                            </div>
                            <div class="lt-match-team-text">
                                <strong>${eqLocal.nombre}</strong>
                                <span>${eqLocal.esUsuario ? 'TU EQUIPO' : 'LOCAL'} · OVR ${eqLocal.ovr}</span>
                            </div>
                        </div>

                        <div class="lt-match-vs-badge">VS</div>

                        <div class="lt-match-team">
                            <div class="lt-team-shield-box ${eqVis.esUsuario ? 'local' : 'rival'}">
                                <img src="${obtenerUrlEscudo(eqVis.escudo)}" class="sim-team-shield" alt="${eqVis.nombre}">
                            </div>
                            <div class="lt-match-team-text">
                                <strong>${eqVis.nombre}</strong>
                                <span>${eqVis.esUsuario ? 'TU EQUIPO' : 'VISITANTE'} · OVR ${eqVis.ovr}</span>
                            </div>
                        </div>
                    </div>

                    <div class="lt-match-actions-bar">
                        <button type="button" class="lt-btn-play-match" onclick="jugarPartidoFechaLiga()">
                            <i class="ph-bold ph-play"></i> JUGAR FECHA
                        </button>
                        <button type="button" class="lt-btn-sim-all ${(localStorage.getItem('ev_simular_todo_diario_' + getUserId()) === new Date().toISOString().slice(0, 10)) ? 'disabled' : ''}" onclick="simularTemporadaCompleta()" title="${(localStorage.getItem('ev_simular_todo_diario_' + getUserId()) === new Date().toISOString().slice(0, 10)) ? 'Ya usaste tu simulación rápida diaria de hoy (1 liga por día)' : 'Simular las fechas restantes automáticamente (1 vez al día · Máx 5 SP)'}" style="${(localStorage.getItem('ev_simular_todo_diario_' + getUserId()) === new Date().toISOString().slice(0, 10)) ? 'opacity:0.5; filter:grayscale(0.6);' : ''}">
                            <i class="ph-bold ${(localStorage.getItem('ev_simular_todo_diario_' + getUserId()) === new Date().toISOString().slice(0, 10)) ? 'ph-lock-key' : 'ph-lightning'}"></i> Simular Todo
                        </button>
                    </div>
                </div>
            `;
        } else {
            bannerPartidoHTML = `
                <div class="lt-match-banner" style="text-align:center; padding:16px;">
                    <div class="lt-match-top-row">
                        <span class="lt-fecha-pill"><i class="ph-bold ph-calendar-blank"></i> FECHA ${liga.fechaActual} DE ${liga.totalFechas}</span>
                        <span class="lt-match-status-tag">FECHA LIBRE</span>
                    </div>
                    <p style="font-size:0.85rem; color:#fef08a; margin:10px 0 12px; font-weight:800;">Tu Once tiene fecha libre esta jornada.</p>
                    <button type="button" class="lt-btn-play-match" onclick="avanzarFechaLibreLiga()" style="margin:0 auto; width:100%; max-width:240px;">
                        <span>Simular Fecha</span> <i class="ph-bold ph-fast-forward"></i>
                    </button>
                </div>
            `;
        }
    } else if (esFinalizado) {
        const campeon = liga.tabla[0];
        const posUser = liga.tabla.findIndex(t => t.esUsuario) + 1;
        const esUserCamp = campeon.esUsuario;

        if (!liga.recompensaReclamada) {
            bannerPartidoHTML = `
                <div class="lt-champ-banner animate-fade-up">
                    <h3><i class="ph-fill ph-gift"></i> ¡TEMPORADA FINALIZADA!</h3>
                    <p style="font-size:0.85rem; color:#fef08a; margin:0;">Tu equipo cerró la liga en el puesto #${posUser}. ¡Reclamá tu botín!</p>
                    <button type="button" class="btn-3d primary lt-btn-abrir-cofre-hub" onclick="mostrarCofreTemporada(JSON.parse(localStorage.getItem('ev_liga_guardada_' + getUserId())))">
                        <i class="ph-bold ph-treasure-chest"></i> ABRIR COFRE DE TEMPORADA
                    </button>
                </div>
            `;
        } else if (esUserCamp) {
            bannerPartidoHTML = `
                <div class="lt-champ-banner animate-fade-up">
                    <h3><i class="ph-fill ph-crown"></i> ¡CAMPEÓN DE ${liga.nombre.toUpperCase()}!</h3>
                    <p style="font-size:0.85rem; color:#fef08a; margin:0;">¡Tu Once Inicial dominó la temporada y levantó el trofeo!</p>
                    <div class="lt-champ-sp-reward">
                        <i class="ph-bold ph-trophy"></i> Botín de Campeón Reclamado (+${liga.fueSimuladaRapida ? 5 : 15} SP)
                    </div>
                </div>
            `;
        } else {
            bannerPartidoHTML = `
                <div class="lt-match-banner" style="justify-content:center; text-align:center; padding:18px;">
                    <div>
                        <h3 style="font-size:1.25rem; font-weight:900; color:#ffd700; margin:0 0 4px 0;">
                            🏆 CAMPEÓN: ${campeon.nombre}
                        </h3>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">
                            Tu equipo finalizó en la posición #${posUser}. Botín de temporada reclamado.
                        </p>
                    </div>
                </div>
            `;
        }
    }

    // 🌟 Sección de Líderes Individuales del Once Inicial
    const { topGol, topAsist } = obtenerLideresOnce(liga);
    let widgetsLideresHTML = '';
    if (topGol.id || topAsist.id) {
        widgetsLideresHTML = `
            <div class="lt-leaders-grid">
                <div class="lt-leader-card goleador">
                    <div class="lt-leader-avatar-wrap">
                        ${topGol.id ? `<img src="${topGol.id}" alt="Goleador" class="lt-leader-avatar-img">` : '<i class="ph-bold ph-soccer-ball"></i>'}
                    </div>
                    <div class="lt-leader-info">
                        <span class="lt-leader-tag"><i class="ph-bold ph-soccer-ball"></i> Máximo Goleador</span>
                        <strong class="lt-leader-name">${topGol.id ? obtenerNombreAvatar(topGol.id) : 'Sin goles aún'}</strong>
                        <span class="lt-leader-stat"><b>${topGol.cant}</b> ${topGol.cant === 1 ? 'Gol' : 'Goles'} anotados</span>
                    </div>
                </div>

                <div class="lt-leader-card asistidor">
                    <div class="lt-leader-avatar-wrap">
                        ${topAsist.id ? `<img src="${topAsist.id}" alt="Asistidor" class="lt-leader-avatar-img">` : '<i class="ph-bold ph-sneaker-move"></i>'}
                    </div>
                    <div class="lt-leader-info">
                        <span class="lt-leader-tag"><i class="ph-bold ph-sneaker-move"></i> Máximo Asistidor</span>
                        <strong class="lt-leader-name">${topAsist.id ? obtenerNombreAvatar(topAsist.id) : 'Sin asistencias'}</strong>
                        <span class="lt-leader-stat"><b>${topAsist.cant}</b> ${topAsist.cant === 1 ? 'Asistencia' : 'Asistencias'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Armar filas de la tabla
    let filasTablaHTML = '';
    liga.tabla.forEach((t, i) => {
        const pos = i + 1;
        let posClase = '';
        if (pos === 1) posClase = 'champ';
        else if (pos <= 4) posClase = 'cup';

        filasTablaHTML += `
            <tr class="${t.esUsuario ? 'user-row' : ''}">
                <td><span class="lt-pos-badge ${posClase}">${pos}</span></td>
                <td>
                    <div class="lt-club-col">
                        <img src="${obtenerUrlEscudo(t.escudo)}" alt="${t.nombre}">
                        <span>${t.nombre}</span>
                    </div>
                </td>
                <td>${t.pj}</td>
                <td>${t.pg}</td>
                <td>${t.pe}</td>
                <td>${t.pp}</td>
                <td>${t.gf}</td>
                <td>${t.gc}</td>
                <td>${t.dif > 0 ? '+' + t.dif : t.dif}</td>
                <td class="lt-pts-cell ${t.esUsuario ? 'user-pts' : ''}" style="font-size:0.92rem;">${t.pts}</td>
            </tr>
        `;
    });

    const flagUrl = `https://flagcdn.com/w80/${liga.bandera}.png`;

    body.innerHTML = `
        <div class="lt-header">
            <div class="lt-header-info-row">
                <img src="${flagUrl}" alt="${liga.nombre}" class="lt-header-img">
                <div class="lt-header-info">
                    <h2>${liga.nombre}</h2>
                    <p>Fecha <b style="color:#38bdf8;">${Math.min(liga.fechaActual, liga.totalFechas)} de ${liga.totalFechas}</b> · Todos contra todos</p>
                </div>
            </div>
            <button type="button" class="lt-btn-reiniciar-header" onclick="abandonarLigaTemporada()" title="Reiniciar temporada o elegir otra liga">
                <i class="ph-bold ph-arrows-clockwise"></i> <span>Reiniciar</span>
            </button>
        </div>

        ${bannerPartidoHTML}
        ${widgetsLideresHTML}

        <div class="lt-table-container">
            <table class="lt-table">
                <thead>
                    <tr>
                        <th style="width:36px;">POS</th>
                        <th style="text-align:left; padding-left:14px;">CLUB</th>
                        <th>PJ</th>
                        <th>G</th>
                        <th>E</th>
                        <th>P</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DIF</th>
                        <th>PTS</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasTablaHTML}
                </tbody>
            </table>
        </div>

        <div class="lt-footer-actions" style="justify-content: flex-end;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">
                Zona de Copas (1º a 4º)
            </span>
        </div>
    `;
}

window.jugarPartidoFechaLiga = function() {
    const id = getUserId();
    const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + id);
    if (!guardadaRaw) return;
    const liga = JSON.parse(guardadaRaw);

    const fechaIdx = liga.fechaActual - 1;
    const cruce = liga.fixture[fechaIdx].find(p => p.local === 'user_team' || p.visitante === 'user_team');
    if (!cruce) return;

    const esLocal = cruce.local === 'user_team';
    const rivalId = esLocal ? cruce.visitante : cruce.local;
    const rivalData = liga.tabla.find(t => t.id === rivalId) || { nombre: 'Rival', escudo: rivalId, ovr: 70 };

    cerrarModalTemporadaLiga(false);

    torneoEstado = {
        tier: 'liga_temporada',
        config: {
            nombre: `${liga.nombre} · Fecha ${liga.fechaActual}`,
            premioSP: 2
        },
        rondaIdx: 0,
        esLiga: true,
        rivales: [{
            id: rivalData.escudo,
            nombre: rivalData.nombre,
            ovr: rivalData.ovr
        }],
        partidoEnCurso: false,
        recorridoPartidos: []
    };

    prepararVistaPartidoCopa();
    const stageTitle = document.getElementById('sim-stage-title');
    if (stageTitle) stageTitle.textContent = `FECHA ${liga.fechaActual} DE ${liga.totalFechas}`;

    document.getElementById('simulador-partido-modal').style.display = 'flex';
};

function procesarFinDePartidoLiga(golesUser, golesRival) {
    const id = getUserId();
    const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + id);
    if (!guardadaRaw) return;
    const liga = JSON.parse(guardadaRaw);

    const fechaIdx = liga.fechaActual - 1;
    const partidosDeFecha = liga.fixture[fechaIdx];
    const cruceUsuario = partidosDeFecha.find(p => p.local === 'user_team' || p.visitante === 'user_team');
    const esLocalUser = cruceUsuario.local === 'user_team';
    const rivalId = esLocalUser ? cruceUsuario.visitante : cruceUsuario.local;

    // 1. Actualizar al usuario y su rival
    const filaUser = liga.tabla.find(t => t.esUsuario);
    const filaRival = liga.tabla.find(t => t.id === rivalId);

    filaUser.pj++;
    filaRival.pj++;
    filaUser.gf += golesUser;
    filaUser.gc += golesRival;
    filaUser.dif = filaUser.gf - filaUser.gc;
    filaRival.gf += golesRival;
    filaRival.gc += golesUser;
    filaRival.dif = filaRival.gf - filaRival.gc;

    // Registramos goleador y asistidor de los goles de la fecha
    registrarGolesYAsistenciasOnce(liga, golesUser);

    let resUserTexto = '';
    if (golesUser > golesRival) {
        filaUser.pg++;
        filaUser.pts += 3;
        filaRival.pp++;
        resUserTexto = '¡Victoria! +3 Puntos';
    } else if (golesUser < golesRival) {
        filaUser.pp++;
        filaRival.pg++;
        filaRival.pts += 3;
        resUserTexto = 'Derrota. Sin puntos esta fecha';
    } else {
        filaUser.pe++;
        filaUser.pts += 1;
        filaRival.pe++;
        filaRival.pts += 1;
        resUserTexto = '¡Empate! +1 Punto';
    }

    // 2. Simular automáticamente los otros partidos de la fecha
    partidosDeFecha.forEach(p => {
        if (p.local === 'user_team' || p.visitante === 'user_team') return;
        const eqA = liga.tabla.find(t => t.id === p.local);
        const eqB = liga.tabla.find(t => t.id === p.visitante);
        if (!eqA || !eqB) return;

        const diff = (eqA.ovr - eqB.ovr) / 10;
        const gA = Math.max(0, Math.floor(1.3 + diff * 0.4 + (Math.random() - 0.5) * 2.2));
        const gB = Math.max(0, Math.floor(1.0 - diff * 0.4 + (Math.random() - 0.5) * 2.2));

        eqA.pj++;
        eqB.pj++;
        eqA.gf += gA;
        eqA.gc += gB;
        eqA.dif = eqA.gf - eqA.gc;
        eqB.gf += gB;
        eqB.gc += gA;
        eqB.dif = eqB.gf - eqB.gc;

        if (gA > gB) { eqA.pg++; eqA.pts += 3; eqB.pp++; }
        else if (gA < gB) { eqB.pg++; eqB.pts += 3; eqA.pp++; }
        else { eqA.pe++; eqA.pts += 1; eqB.pe++; eqB.pts += 1; }
    });

    // 3. Avanzar fecha y guardar
    liga.fechaActual++;
    const esFinTemporada = liga.fechaActual > liga.totalFechas;

    if (esFinTemporada) {
        liga.tabla.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
    }

    localStorage.setItem('ev_liga_guardada_' + id, JSON.stringify(liga));

    const btn = document.getElementById('sim-btn-play');
    btn.className = 'btn-3d primary sim-main-btn';
    btn.disabled = false;
    if (esFinTemporada) {
        btn.innerHTML = `<span>Temporada Finalizada · Reclamar Botín</span> <i class="ph-bold ph-gift"></i>`;
        btn.onclick = () => {
            cerrarModalSimuladorPartido(false);
            mostrarCofreTemporada(liga);
        };
    } else {
        btn.innerHTML = `<span>${resUserTexto} · Ver Tabla</span> <i class="ph-bold ph-arrow-right"></i>`;
        btn.onclick = () => {
            cerrarModalSimuladorPartido(false);
            abrirModalTemporadaLiga();
        };
    }
}

// ⚡ SIMULAR TODAS LAS FECHAS RESTANTES DE LA TEMPORADA
window.simularTemporadaCompleta = function() {
    const id = getUserId();
    const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + id);
    if (!guardadaRaw) return;
    const liga = JSON.parse(guardadaRaw);

    if (liga.fechaActual > liga.totalFechas) {
        showToast("Esta temporada ya fue completada.", "ph-info", "info");
        return;
    }

    const hoyStr = new Date().toISOString().slice(0, 10);
    const ultimaSimulacion = localStorage.getItem('ev_simular_todo_diario_' + id);
    if (ultimaSimulacion === hoyStr) {
        showToast("Ya utilizaste tu simulación rápida diaria de hoy (1 sola liga por día). ¡Disputá los partidos fecha a fecha para ganar el botín completo de 15 SP! ⚽", "ph-lock-key", "warning");
        return;
    }

    if (!confirm("⚡ ¿Querés usar tu simulación rápida diaria para completar esta liga automáticamente?\n\n• Límite: 1 sola liga por día en total.\n• Recompensa de campeón reducida: 5 SP (en vez de 15 SP).")) {
        return;
    }

    // Registramos que utilizó la simulación rápida diaria en el día
    localStorage.setItem('ev_simular_todo_diario_' + id, hoyStr);
    liga.fueSimuladaRapida = true;

    const ovrUser = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 75;
    const filaUser = liga.tabla.find(t => t.esUsuario);
    filaUser.ovr = ovrUser;

    // Simulamos desde la fecha actual hasta la última
    while (liga.fechaActual <= liga.totalFechas) {
        const fechaIdx = liga.fechaActual - 1;
        const partidosDeFecha = liga.fixture[fechaIdx];

        partidosDeFecha.forEach(p => {
            if (p.local === 'user_team' || p.visitante === 'user_team') {
                const esLocal = p.local === 'user_team';
                const rivalId = esLocal ? p.visitante : p.local;
                const filaRival = liga.tabla.find(t => t.id === rivalId);
                const ovrRival = filaRival ? filaRival.ovr : 70;

                const diff = (ovrUser - ovrRival) / 10;
                const gUser = Math.max(0, Math.floor(1.3 + diff * 0.45 + (Math.random() - 0.5) * 2.2));
                const gRival = Math.max(0, Math.floor(1.0 - diff * 0.45 + (Math.random() - 0.5) * 2.2));

                filaUser.pj++;
                filaRival.pj++;
                filaUser.gf += gUser;
                filaUser.gc += gRival;
                filaUser.dif = filaUser.gf - filaUser.gc;
                filaRival.gf += gRival;
                filaRival.gc += gUser;
                filaRival.dif = filaRival.gf - filaRival.gc;

                registrarGolesYAsistenciasOnce(liga, gUser);

                if (gUser > gRival) {
                    filaUser.pg++;
                    filaUser.pts += 3;
                    filaRival.pp++;
                } else if (gUser < gRival) {
                    filaUser.pp++;
                    filaRival.pg++;
                    filaRival.pts += 3;
                } else {
                    filaUser.pe++;
                    filaUser.pts += 1;
                    filaRival.pe++;
                    filaRival.pts += 1;
                }
            } else {
                const eqA = liga.tabla.find(t => t.id === p.local);
                const eqB = liga.tabla.find(t => t.id === p.visitante);
                if (!eqA || !eqB) return;

                const diff = (eqA.ovr - eqB.ovr) / 10;
                const gA = Math.max(0, Math.floor(1.3 + diff * 0.4 + (Math.random() - 0.5) * 2.2));
                const gB = Math.max(0, Math.floor(1.0 - diff * 0.4 + (Math.random() - 0.5) * 2.2));

                eqA.pj++;
                eqB.pj++;
                eqA.gf += gA;
                eqA.gc += gB;
                eqA.dif = eqA.gf - eqA.gc;
                eqB.gf += gB;
                eqB.gc += gA;
                eqB.dif = eqB.gf - eqB.gc;

                if (gA > gB) { eqA.pg++; eqA.pts += 3; eqB.pp++; }
                else if (gA < gB) { eqB.pg++; eqB.pts += 3; eqA.pp++; }
                else { eqA.pe++; eqA.pts += 1; eqB.pe++; eqB.pts += 1; }
            }
        });

        liga.fechaActual++;
    }

    // Orden final de posiciones
    liga.tabla.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
    localStorage.setItem('ev_liga_guardada_' + id, JSON.stringify(liga));

    // Desplegamos el Cofre de Temporada para reclamar el premio según puesto
    mostrarCofreTemporada(liga);
};
window.avanzarFechaLibreLiga = function() {
    const id = getUserId();
    const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + id);
    if (!guardadaRaw) return;
    const liga = JSON.parse(guardadaRaw);
    const fechaIdx = liga.fechaActual - 1;
    const partidosDeFecha = liga.fixture[fechaIdx];

    partidosDeFecha.forEach(p => {
        if (p.local === 'user_team' || p.visitante === 'user_team') return;
        const eqA = liga.tabla.find(t => t.id === p.local);
        const eqB = liga.tabla.find(t => t.id === p.visitante);
        if (!eqA || !eqB) return;

        const diff = (eqA.ovr - eqB.ovr) / 10;
        const gA = Math.max(0, Math.floor(1.3 + diff * 0.4 + (Math.random() - 0.5) * 2.2));
        const gB = Math.max(0, Math.floor(1.0 - diff * 0.4 + (Math.random() - 0.5) * 2.2));

        eqA.pj++; eqB.pj++;
        eqA.gf += gA; eqA.gc += gB; eqA.dif = eqA.gf - eqA.gc;
        eqB.gf += gB; eqB.gc += gA; eqB.dif = eqB.gf - eqB.gc;

        if (gA > gB) { eqA.pg++; eqA.pts += 3; eqB.pp++; }
        else if (gA < gB) { eqB.pg++; eqB.pts += 3; eqA.pp++; }
        else { eqA.pe++; eqA.pts += 1; eqB.pe++; eqB.pts += 1; }
    });

    liga.fechaActual++;
    localStorage.setItem('ev_liga_guardada_' + id, JSON.stringify(liga));
    renderizarHubLigaTemporada(liga);
    showToast(`Fecha ${liga.fechaActual - 1} simulada. ¡Turno de la siguiente fecha!`, "ph-check-circle", "info");
};
window.abandonarLigaTemporada = function() {
    if (!confirm("¿Seguro que querés abandonar o reiniciar esta liga? Se borrará el progreso de esta tabla.")) return;
    const id = getUserId();
    localStorage.removeItem('ev_liga_guardada_' + id);
    renderizarSelectorLigasDisponibles();
    showToast("Temporada reiniciada. Podés elegir una nueva liga.", "ph-trash", "info");
};
// ========================================================
// 📦 MOTOR DEL COFRE DE BOTÍN DE TEMPORADA (RECOMPENSA BALANCEADA)
// ========================================================
// (cofreTemporadaPendiente declarado arriba)

function calcularBotinTemporada(posicion, filaUser, totalEquipos = 20, fueSimuladaRapida = false) {
    const esInvicto = filaUser && filaUser.pp === 0;
    const esCampeon = posicion === 1;
    const esDescenso = posicion >= (totalEquipos - 1);

    const idUserBotin = (typeof getUserId === 'function') ? getUserId() : 'default';
    const hoyStrBotin = new Date().toISOString().slice(0, 10);
    const campKey = 'ev_camp_dia_' + idUserBotin + '_' + hoyStrBotin;
    const campeonatosHoy = parseInt(localStorage.getItem(campKey) || '0', 10);
    // Tope económico: hasta 2 ligas completas por día otorgan los 15 SP plenos. A partir de la 3ª liga diaria se otorgan 5 SP.
    const superoTopeDiario = campeonatosHoy >= 2;

    let sp = 1;
    let xp = (fueSimuladaRapida || superoTopeDiario) ? 250 : 400;
    let badge = '🛡️ PERMANENCIA ASEGURADA';
    let titulo = `#${posicion}º PUESTO`;
    let icono = '<img src="pelota.webp" class="cofre-pelota-img" alt="Pelota">';
    let btnText = 'RECOGER RECOMPENSA';
    let btnIcon = 'ph-gift';

    if (esCampeon) {
        sp = (fueSimuladaRapida || superoTopeDiario) ? 5 : 15;
        xp = (fueSimuladaRapida || superoTopeDiario) ? 1800 : 4000;
        badge = esInvicto 
            ? '<img src="coronaoro.webp" class="cofre-badge-corona" alt="Corona"> CAMPEÓN INVICTO' 
            : '<img src="coronaoro.webp" class="cofre-badge-corona" alt="Corona"> CAMPEÓN DE LA LIGA';
        titulo = esInvicto ? '#1 INVICTO HISTÓRICO' : '#1 CAMPEÓN';
        icono = '<img src="trofeo.webp" class="cofre-trofeo-img" alt="Campeón">';
        btnText = 'RECOGER RECOMPENSA';
        btnIcon = 'ph-trophy';
    } else if (posicion === 2) {
        sp = (fueSimuladaRapida || superoTopeDiario) ? 3 : 10;
        xp = (fueSimuladaRapida || superoTopeDiario) ? 1200 : 2500;
        badge = '🥈 SUBCAMPEÓN';
        titulo = '#2 CLASIFICADO CONTINENTAL';
        icono = '<img src="medalla-plata.webp" class="cofre-medalla-img" alt="Subcampeón">';
        btnText = 'RECOGER RECOMPENSA';
        btnIcon = 'ph-medal';
    } else if (posicion === 3) {
        sp = (fueSimuladaRapida || superoTopeDiario) ? 2 : 7;
        xp = (fueSimuladaRapida || superoTopeDiario) ? 900 : 1800;
        badge = '🥉 PODIO DE LIGA';
        titulo = '#3 CLASIFICADO CONTINENTAL';
        icono = '<img src="medalla-bronce.webp" class="cofre-medalla-img" alt="Tercer Puesto">';
        btnText = 'RECOGER RECOMPENSA';
        btnIcon = 'ph-medal';
    } else if (posicion === 4) {
        sp = fueSimuladaRapida ? 2 : 5;
        xp = fueSimuladaRapida ? 600 : 1200;
        badge = '🌟 ZONA DE COPAS';
        titulo = '#4 CLASIFICADO A COPA';
        icono = '<img src="estrella.webp" class="cofre-estrella-img" alt="Zona de Copas">';
        btnText = 'RECOGER RECOMPENSA';
        btnIcon = 'ph-star';
    } else if (esDescenso) {
        sp = 1;
        xp = fueSimuladaRapida ? 150 : 350;
        badge = '🔻 ZONA DE DESCENSO';
        titulo = `#${posicion}º PUESTO`;
        icono = '<img src="pelota.webp" class="cofre-pelota-img" alt="Zona de Descenso">';
        btnText = 'RECOGER RECOMPENSA';
    } else if (posicion <= 10) {
        sp = fueSimuladaRapida ? 1 : 3;
        xp = fueSimuladaRapida ? 400 : 800;
        badge = '⚽ MITAD DE TABLA';
        titulo = `#${posicion}º PUESTO`;
        icono = '<img src="pelota.webp" class="cofre-pelota-img" alt="Mitad de Tabla">';
    } else {
        sp = 1;
        xp = fueSimuladaRapida ? 250 : 500;
        badge = '🛡️ PERMANENCIA ASEGURADA';
        titulo = `#${posicion}º PUESTO`;
        icono = '<img src="pelota.webp" class="cofre-pelota-img" alt="Permanencia">';
    }

    return { sp, xp, badge, titulo, icono, btnText, btnIcon, esCampeon, esInvicto, esDescenso, fueSimuladaRapida };
}

window.mostrarCofreTemporada = function(liga) {
    if (!liga || !liga.tabla) return;
    cerrarModalTemporadaLiga(false);

    const filaUser = liga.tabla.find(t => t.esUsuario);
    const pos = liga.tabla.findIndex(t => t.esUsuario) + 1;
    const totalEquipos = (liga.tabla && liga.tabla.length) ? liga.tabla.length : 20;
    const esSimulada = !!liga.fueSimuladaRapida;
    const botin = calcularBotinTemporada(pos, filaUser, totalEquipos, esSimulada);

    cofreTemporadaPendiente = {
        ligaKey: liga.key,
        ligaNombre: liga.nombre,
        posicion: pos,
        esCampeon: pos === 1,
        fueSimuladaRapida: esSimulada,
        superoTopeDiario: !!botin.superoTopeDiario,
        sp: botin.sp,
        xp: botin.xp
    };

    // 1. Reset de vistas del modal
    const cerrado = document.getElementById('ev-cofre-cerrado');
    const revelado = document.getElementById('ev-cofre-revelado');
    if (cerrado) {
        cerrado.classList.remove('ev-pack-abriendo');
        cerrado.style.display = 'flex';
    }
    if (revelado) revelado.style.display = 'none';

    const tituloLigaEl = document.getElementById('cofre-titulo-liga');
    if (tituloLigaEl) tituloLigaEl.textContent = `COFRE DE ${liga.nombre.toUpperCase()}`;

    // 2. Títulos y trofeo
    const badgeEl = document.getElementById('cofre-revelado-badge');
    if (badgeEl) {
        badgeEl.innerHTML = botin.badge;
        if (botin.fueSimuladaRapida) {
            badgeEl.innerHTML += '<div style="font-size:0.68rem; color:#fde047; font-weight:800; margin-top:4px;"><i class="ph-bold ph-lightning"></i> SIMULACIÓN RÁPIDA (MÁX 5 SP)</div>';
        } else if (botin.superoTopeDiario && botin.esCampeon) {
            badgeEl.innerHTML += '<div style="font-size:0.68rem; color:#fde047; font-weight:800; margin-top:4px;"><i class="ph-bold ph-lock-key"></i> TOPE DIARIO DE CAMPEONATOS (+2 HOY: 5 SP)</div>';
        }
        if (botin.esDescenso) {
            badgeEl.classList.add('descenso');
        } else {
            badgeEl.classList.remove('descenso');
        }
    }
    const puestoEl = document.getElementById('cofre-revelado-puesto');
    if (puestoEl) puestoEl.textContent = botin.titulo;
    document.getElementById('cofre-botin-icon').innerHTML = botin.icono;
    document.getElementById('cofre-botin-club').textContent = filaUser ? filaUser.nombre : 'Tu Once';

    // 🎖️ Posición final ubicada junto al ícono del botín
    const posBadge = document.getElementById('cofre-posicion-badge');
    if (posBadge) {
        let badgeCls = 'mid';
        let lblTxt = 'PUESTO';
        if (botin.esCampeon) {
            badgeCls = 'champ';
            lblTxt = 'CAMPEÓN';
        } else if (pos === 2) {
            badgeCls = 'cup';
            lblTxt = 'SUBCAMPEÓN';
        } else if (pos <= 4) {
            badgeCls = 'cup';
            lblTxt = 'ZONA COPAS';
        } else if (botin.esDescenso) {
            badgeCls = 'descenso';
            lblTxt = 'DESCENSO';
        }

        posBadge.className = `cofre-posicion-badge ${badgeCls}`;
        posBadge.innerHTML = `
            <span class="cofre-pos-num">#${pos}</span>
            <span class="cofre-pos-txt">${lblTxt}</span>
        `;
    }

    const glowEl = document.querySelector('.cofre-stage-glow');
    if (glowEl) {
        if (botin.esDescenso) {
            glowEl.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.55) 0%, rgba(185, 28, 28, 0.22) 50%, transparent 72%)';
        } else if (botin.esCampeon) {
            glowEl.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.55) 0%, rgba(255, 160, 0, 0.22) 50%, transparent 72%)';
        } else {
            glowEl.style.background = 'radial-gradient(circle, rgba(0, 255, 119, 0.45) 0%, rgba(41, 121, 255, 0.20) 50%, transparent 72%)';
        }
    }

    // 3. Escudo del equipo
    const escudoClub = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + getUserId()) || getPref('ev_avatar_logo', 'ev');
    const escudoImg = document.getElementById('cofre-club-escudo');
    if (escudoImg) {
        escudoImg.src = (typeof obtenerUrlEscudo === 'function') ? obtenerUrlEscudo(escudoClub) : '';
    }

    // 4. Protagonistas del Once (Capitán & DT) con resolución garantizada de avatar
    const unaF = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    let capId = typeof obtenerCapitanOnce === 'function' ? obtenerCapitanOnce() : null;

    let dtId = unaF['DT'] || null;
    if (!dtId) {
        dtId = '45.webp'; // Respaldo técnico si aún no contrató DT (Scaloni)
        unaF['DT'] = dtId;
        if (typeof userStats !== 'undefined') userStats.onceInicial = unaF;
        try { localStorage.setItem('ev_once_inicial_' + getUserId(), JSON.stringify(unaF)); } catch(e) {}
    }

    // 🛡️ REGLA: El Capitán nunca puede ser el DT
    if (!capId || capId === dtId || (typeof esAvatarDT === 'function' && esAvatarDT(capId))) {
        const avatarFut = (typeof getPref === 'function' ? getPref('ev_avatar_hair', '') : '').replace(/\.png$/i, '.webp');
        const titularesSinDt = Object.keys(unaF)
            .filter(k => k !== 'DT' && unaF[k] && unaF[k] !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(unaF[k])))
            .map(k => unaF[k]);
        if (avatarFut && avatarFut !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(avatarFut))) {
            capId = avatarFut;
        } else {
            capId = titularesSinDt[0] || '1.webp';
        }
    }

    const capNombre = obtenerNombreAvatar(capId);
    const dtNombre = (typeof obtenerNombreAvatar === 'function' ? obtenerNombreAvatar(dtId) : '') || 'El Estratega';

    const protagContainer = document.getElementById('cofre-protagonistas-row');
    if (protagContainer) {
        protagContainer.innerHTML = `
            <div class="cofre-protag-card">
                <span class="cofre-protag-tag cap"><i class="ph-bold ph-crown"></i> CAPITÁN</span>
                <div class="cofre-protag-info">
                    <img src="${capId}" class="cofre-protag-avatar" alt="${capNombre}">
                    <strong>${capNombre}</strong>
                </div>
            </div>
            <div class="cofre-protag-card">
                <span class="cofre-protag-tag dt"><i class="ph-bold ph-clipboard-text"></i> DT</span>
                <div class="cofre-protag-info">
                    <img src="${dtId}" class="cofre-protag-avatar" alt="${dtNombre}">
                    <strong>${dtNombre}</strong>
                </div>
            </div>
        `;
    }

    // 5. Storytelling: Hitos claros, tipografía ampliada e iconos reconocibles
    const hitosContainer = document.getElementById('cofre-hitos-grid');
    if (hitosContainer && filaUser) {
        const maxPts = (filaUser.pj || 1) * 3;
        const pctPts = Math.round(((filaUser.pts || 0) / maxPts) * 100);
        const { topGol, topAsist } = typeof obtenerLideresOnce === 'function' ? obtenerLideresOnce(liga) : { topGol: {}, topAsist: {} };

        let hito2HTML = '';
        if (topGol && topGol.id && topGol.cant > 0 && topGol.id !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(topGol.id))) {
            hito2HTML = `
                <div class="cofre-hito-card">
                    <div class="hito-header"><i class="ph-bold ph-soccer-ball"></i> GOLEADOR</div>
                    <strong class="hito-val">${topGol.cant} Goles</strong>
                    <span class="hito-sub">${obtenerNombreAvatar(topGol.id)}</span>
                </div>
            `;
        } else {
            hito2HTML = `
                <div class="cofre-hito-card">
                    <div class="hito-header"><i class="ph-bold ph-fire"></i> ATAQUE</div>
                    <strong class="hito-val">${filaUser.gf} Goles</strong>
                    <span class="hito-sub">DIF ${filaUser.dif > 0 ? '+' + filaUser.dif : filaUser.dif}</span>
                </div>
            `;
        }

        let hito3HTML = '';
        if (filaUser.pp === 0) {
            hito3HTML = `
                <div class="cofre-hito-card highlight">
                    <div class="hito-header"><i class="ph-bold ph-shield-check"></i> DEFENSA</div>
                    <strong class="hito-val invicto">INVICTO</strong>
                    <span class="hito-sub">${filaUser.gc} GC en ${filaUser.pj} PJ</span>
                </div>
            `;
        } else if (topAsist && topAsist.id && topAsist.cant > 0 && topAsist.id !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(topAsist.id))) {
            hito3HTML = `
                <div class="cofre-hito-card">
                    <div class="hito-header"><i class="ph-bold ph-sneaker-move"></i> ASISTIDOR</div>
                    <strong class="hito-val">${topAsist.cant} Asist.</strong>
                    <span class="hito-sub">${obtenerNombreAvatar(topAsist.id)}</span>
                </div>
            `;
        } else {
            hito3HTML = `
                <div class="cofre-hito-card">
                    <div class="hito-header"><i class="ph-bold ph-shield"></i> DEFENSA</div>
                    <strong class="hito-val">${filaUser.gc} Goles Rec.</strong>
                    <span class="hito-sub">En ${filaUser.pj} Partidos</span>
                </div>
            `;
        }

        hitosContainer.innerHTML = `
            <div class="cofre-hito-card">
                <div class="hito-header"><i class="ph-bold ph-chart-line-up"></i> CAMPAÑA</div>
                <strong class="hito-val">${filaUser.pts} Pts (${pctPts}%)</strong>
                <span class="hito-sub">${filaUser.pg}G · ${filaUser.pe}E · ${filaUser.pp}P</span>
            </div>
            ${hito2HTML}
            ${hito3HTML}
        `;
    }

    // 6. Botín de Recompensa: 2 cartas de botín con íconos 3D de alta fidelidad
    const lootContainer = document.getElementById('cofre-loot-row');
    if (lootContainer) {
        lootContainer.innerHTML = `
            <div class="cofre-loot-card sp">
                <div class="cofre-loot-icon-wrap">
                    <img src="rayo.webp" class="cofre-loot-3d-img" alt="SP">
                </div>
                <div class="cofre-loot-info">
                    <span class="loot-label">Habilidad Plantel</span>
                    <strong>+${botin.sp} SP</strong>
                </div>
            </div>
            <div class="cofre-loot-card xp">
                <div class="cofre-loot-icon-wrap">
                    <img src="estrella.webp" class="cofre-loot-3d-img" alt="XP">
                </div>
                <div class="cofre-loot-info">
                    <span class="loot-label">Experiencia DT</span>
                    <strong>+${botin.xp.toLocaleString('es-AR')} XP</strong>
                </div>
            </div>
        `;
    }

    // 7. Botón de Reclamo y opción de compartir si es Campeón
    const claimTxt = document.getElementById('btn-cofre-claim-text');
    if (claimTxt) claimTxt.textContent = botin.btnText;
    const claimBtn = document.getElementById('btn-cofre-claim-btn');
    if (claimBtn) {
        const ico = claimBtn.querySelector('i');
        if (ico) ico.className = `ph-bold ${botin.btnIcon}`;
    }

    if (botin.esCampeon) {
        const actionsBox = document.querySelector('.cofre-actions-wrap');
        if (actionsBox && !document.getElementById('btn-share-champ-story')) {
            const btnShareStory = document.createElement('button');
            btnShareStory.id = 'btn-share-champ-story';
            btnShareStory.type = 'button';
            btnShareStory.className = 'btn-share-champ-story';
            btnShareStory.innerHTML = `<i class="ph-bold ph-share-network"></i> COMPARTIR CAMPAÑA`;
            btnShareStory.onclick = () => {
                compartirPosterCampeon({
                    torneo: liga.nombre,
                    subtitulo: `Temporada Oficial · ${filaUser ? filaUser.pts : ''} Pts (${filaUser ? filaUser.pj : ''} PJ)`,
                    campana: filaUser && filaUser.pp === 0 ? 'Campeón Invicto' : 'Campeón de Liga',
                    tabla: liga.tabla,
                    filaUser: filaUser
                });
            };
            actionsBox.appendChild(btnShareStory);
        }
    }

    const modal = document.getElementById('modal-cofre-temporada');
    if (modal) modal.style.display = 'flex';
};

window.animarAperturaCofreTemporada = function() {
    if (typeof reproducirSonidoApertura === 'function') reproducirSonidoApertura();
    const cerrado = document.getElementById('ev-cofre-cerrado');
    if (cerrado) cerrado.classList.add('ev-pack-abriendo');

    setTimeout(() => {
        if (cerrado) cerrado.style.display = 'none';
        if (typeof dispararEfectoPackOpening === 'function') dispararEfectoPackOpening();
        const revelado = document.getElementById('ev-cofre-revelado');
        if (revelado) revelado.style.display = 'flex';
    }, 1100);
};

window.reclamarRecompensaCofreTemporada = function() {
    if (!cofreTemporadaPendiente) return;

    const spGanado = cofreTemporadaPendiente.sp;
    userStats.puntosHabilidad = (userStats.puntosHabilidad || 0) + spGanado;

    if (cofreTemporadaPendiente.xp) {
        agregarXP(cofreTemporadaPendiente.xp);
    }

    // Inscribir título en el palmarés si fue campeón y registrar conteo diario
    if (cofreTemporadaPendiente.esCampeon) {
        const idUserRec = getUserId();
        const hoyStrRec = new Date().toISOString().slice(0, 10);
        const campKeyRec = 'ev_camp_dia_' + idUserRec + '_' + hoyStrRec;
        const cantHoy = parseInt(localStorage.getItem(campKeyRec) || '0', 10);
        localStorage.setItem(campKeyRec, String(cantHoy + 1));

        if (!userStats.copasGanadas) userStats.copasGanadas = [];
        const yaRegistrado = userStats.copasGanadas.some(c => c.tier === 'liga_' + cofreTemporadaPendiente.ligaKey);
        if (!yaRegistrado) {
            userStats.copasGanadas.push({
                tier: 'liga_' + cofreTemporadaPendiente.ligaKey,
                nombre: `Campeón de ${cofreTemporadaPendiente.ligaNombre}`,
                fecha: new Date().toISOString()
            });
        }
    }

    guardarStats();

    // Marcar recompensa reclamada en la liga activa
    const id = getUserId();
    const guardadaRaw = localStorage.getItem('ev_liga_guardada_' + id);
    if (guardadaRaw) {
        try {
            const ligaObj = JSON.parse(guardadaRaw);
            ligaObj.recompensaReclamada = true;
            localStorage.setItem('ev_liga_guardada_' + id, JSON.stringify(ligaObj));
        } catch(e) {}
    }

    const modal = document.getElementById('modal-cofre-temporada');
    if (modal) modal.style.display = 'none';

    showToast(`¡Acreditaste +${spGanado} SP y +${cofreTemporadaPendiente.xp.toLocaleString('es-AR')} XP a tu club! ⚡🏆`, "ph-lightning", "success");

    if (cofreTemporadaPendiente.esCampeon) {
        if (typeof dispararFestejoCampeon === 'function') dispararFestejoCampeon();
    } else if (cofreTemporadaPendiente.posicion <= 4) {
        if (typeof dispararEfectoLucesDelicadas === 'function') dispararEfectoLucesDelicadas();
        if (typeof lanzarConfetti === 'function') setTimeout(() => lanzarConfetti('plata'), 220);
    }

    cofreTemporadaPendiente = null;
    abrirModalTemporadaLiga();
};
// ========================================================
// ⚔️ REGISTRO Y REPUTACIÓN HEAD-TO-HEAD (1 VS 1)
// ========================================================
function registrarH2HMutual(nombreRival, resultado) {
    if (!nombreRival || nombreRival === 'RIVAL' || esModoBot) return;
    const id = getUserId();
    const key = 'ev_h2h_' + id;
    let h2h = {};
    try { h2h = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}
    const k = nombreRival.trim().toLowerCase();
    if (!h2h[k]) h2h[k] = { w: 0, l: 0, d: 0, nombre: nombreRival.trim() };
    if (resultado === 'win') h2h[k].w++;
    else if (resultado === 'loss') h2h[k].l++;
    else h2h[k].d++;
    localStorage.setItem(key, JSON.stringify(h2h));
}

function obtenerBadgeH2HHTML(nombreRival) {
    if (!nombreRival) return '';
    const id = getUserId();
    let h2h = {};
    try { h2h = JSON.parse(localStorage.getItem('ev_h2h_' + id) || '{}'); } catch(e) {}
    const k = nombreRival.trim().toLowerCase();
    const reg = h2h[k];
    if (!reg || (reg.w === 0 && reg.l === 0 && reg.d === 0)) return '';

    return `
        <div class="inspect-h2h-pill">
            <i class="ph-bold ph-swords"></i>
            <span>Historial mutuo: <b>${reg.w}G</b> · <b>${reg.d}E</b> · <b>${reg.l}P</b></span>
        </div>
    `;
}

// --- Generador de Póster Viral de Campeón 9:16 ---

// ========================================================
// 🏆 GENERADOR DE PÓSTER DE CAMPEÓN 9:16 (STORY / VIRAL)
// ========================================================
async function compartirPosterCampeon(datosCampeon) {
    if (!datosCampeon) return;
    if (typeof showToast === 'function') showToast("Generando póster de campaña...", "ph-trophy", "info");

    const id = getUserId();
    const u = obtenerUsuarioLogueado();
    const nombreUsuario = getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Tu Once');
    const escudoClub = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + id) || getPref('ev_avatar_logo', 'ev');
    const ovrEquipo = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 80;

    let capId = typeof obtenerCapitanOnce === 'function' ? obtenerCapitanOnce() : null;
    const unaF = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const dtId = unaF['DT'] || '45.webp';
    if (!capId || capId === dtId || (typeof esAvatarDT === 'function' && esAvatarDT(capId))) {
        const avatarFut = (typeof getPref === 'function' ? getPref('ev_avatar_hair', '') : '').replace(/\.png$/i, '.webp');
        if (avatarFut && avatarFut !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(avatarFut))) {
            capId = avatarFut;
        } else {
            const titulares = Object.keys(unaF)
                .filter(k => k !== 'DT' && unaF[k] && unaF[k] !== dtId && (typeof esAvatarDT !== 'function' || !esAvatarDT(unaF[k])))
                .map(k => unaF[k]);
            capId = titulares[0] || '1.webp';
        }
    }
    const capNombre = obtenerNombreAvatar(capId);

    const torneoNombre = (datosCampeon.torneo || 'CAMPEÓN').toUpperCase();
    const subtituloTorneo = datosCampeon.subtitulo || 'Temporada Oficial';
    const campanaTexto = datosCampeon.campana || 'Consagración Histórica';
    const tieneTabla = Array.isArray(datosCampeon.tabla) && datosCampeon.tabla.length > 0;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.estadiosvirtuales.com')}&color=ffd700&bgcolor=070d18`;

    const poster = document.createElement('div');
    poster.id = 'poster-campeon-export';
    poster.style.cssText = 'position:fixed; left:0; top:0; width:450px; height:800px; z-index:-9999; opacity:1; pointer-events:none; background:#070d18; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:20px 20px 16px; box-sizing:border-box; font-family:"Segoe UI",system-ui,sans-serif; color:#ffffff;';

    const logoHeaderUrl = new URL('https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp', window.location.href).href;
    const trofeoUrl = new URL('trofeo.webp', window.location.href).href;
    const escudoUrl = obtenerUrlEscudo(escudoClub);
    const capitanImgUrl = new URL(capId, window.location.href).href;

    let bloqueMedioHTML = '';

    if (tieneTabla) {
        const tablaRaw = datosCampeon.tabla;
        const userIdx = tablaRaw.findIndex(t => t.esUsuario);
        let filasParaMostrar = [];

        if (userIdx <= 4) {
            filasParaMostrar = tablaRaw.slice(0, 5);
        } else {
            filasParaMostrar = [...tablaRaw.slice(0, 4), { esSeparador: true }, tablaRaw[userIdx]];
        }

        const medallas3DUrls = [
            'medalla-oro.webp',
            'medalla-plata.webp',
            'medalla-bronce.webp'
        ];

        const filasHTML = filasParaMostrar.map((eq) => {
            if (eq.esSeparador) {
                return `<div style="text-align:center; color:#64748b; font-size:0.65rem; font-weight:900; padding:1px 0; line-height:1;">• • •</div>`;
            }
            const posReal = tablaRaw.indexOf(eq) + 1;
            const esMio = eq.esUsuario;
            const escUrl = obtenerUrlEscudo(eq.escudo);

            let posVisual = `<span style="font-size:0.66rem; font-weight:900; color:${esMio ? '#00ff77' : '#94a3b8'};">${posReal}</span>`;
            if (posReal <= 3) {
                posVisual = `<img src="${new URL(medallas3DUrls[posReal - 1], window.location.href).href}" style="width:16px; height:16px; object-fit:contain;">`;
            }

            return `
                <div style="display:grid; grid-template-columns: 24px 1fr 28px 34px 38px; align-items:center; gap:6px; padding: 4px 8px; border-radius: 8px; background: ${esMio ? 'rgba(0, 255, 119, 0.18)' : 'rgba(255, 255, 255, 0.03)'}; border: ${esMio ? '1.5px solid #00ff77' : '1px solid rgba(255, 255, 255, 0.06)'}; box-sizing:border-box;">
                    <div style="display:flex; align-items:center; justify-content:center;">${posVisual}</div>
                    <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                        <img src="${escUrl}" style="width:18px; height:18px; object-fit:contain; flex-shrink:0;">
                        <span style="font-size:0.72rem; font-weight:${esMio ? '900' : '700'}; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${eq.nombre}</span>
                    </div>
                    <span style="font-size:0.68rem; font-weight:700; color:#cbd5e1; text-align:center;">${eq.pj}</span>
                    <span style="font-size:0.68rem; font-weight:700; color:#cbd5e1; text-align:center;">${eq.dif > 0 ? '+' + eq.dif : eq.dif}</span>
                    <span style="font-size:0.76rem; font-weight:900; color:${esMio ? '#00ff77' : '#ffd700'}; text-align:center;">${eq.pts}</span>
                </div>
            `;
        }).join('');

        const fUser = datosCampeon.filaUser || tablaRaw.find(t => t.esUsuario);
        const statsPillsHTML = fUser ? `
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; width:100%; margin-top:4px;">
                <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:4px 6px; text-align:center;">
                    <span style="font-size:0.54rem; font-weight:800; color:#94a3b8; text-transform:uppercase; display:block;">Puntos</span>
                    <strong style="font-size:0.88rem; font-weight:900; color:#ffd700;">${fUser.pts} Pts</strong>
                </div>
                <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:4px 6px; text-align:center;">
                    <span style="font-size:0.54rem; font-weight:800; color:#94a3b8; text-transform:uppercase; display:block;">Goles</span>
                    <strong style="font-size:0.88rem; font-weight:900; color:#38bdf8;">${fUser.gf} GF</strong>
                </div>
                <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:4px 6px; text-align:center;">
                    <span style="font-size:0.54rem; font-weight:800; color:#94a3b8; text-transform:uppercase; display:block;">Récord</span>
                    <strong style="font-size:0.88rem; font-weight:900; color:#00ff77;">${fUser.pg}G ${fUser.pe}E ${fUser.pp}P</strong>
                </div>
            </div>
        ` : '';

        bloqueMedioHTML = `
            <div style="width:100%; background:linear-gradient(135deg, rgba(20,32,54,0.92) 0%, rgba(10,16,28,0.96) 100%); border:1.5px solid rgba(255,215,0,0.45); border-radius:14px; padding:8px 12px; box-sizing:border-box; display:flex; justify-content:space-between; align-items:center; margin: 4px 0;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${escudoUrl}" style="width:36px; height:36px; object-fit:contain;">
                    <div style="display:flex; flex-direction:column; text-align:left;">
                        <strong style="font-size:1rem; font-weight:900; color:#ffffff; text-transform:uppercase; line-height:1.1;">${nombreUsuario}</strong>
                        <span style="font-size:0.62rem; font-weight:800; color:#38bdf8; margin-top:2px;">OVR ${ovrEquipo} · ${campanaTexto}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <img src="${capitanImgUrl}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1.5px solid #ffd700;">
                    <div style="display:flex; flex-direction:column; text-align:right;">
                        <span style="font-size:0.52rem; font-weight:900; color:#fde047; line-height:1;">CAPITÁN</span>
                        <strong style="font-size:0.72rem; font-weight:900; color:#ffffff; line-height:1.1;">${capNombre}</strong>
                    </div>
                </div>
            </div>

            <div style="width:100%; background:linear-gradient(165deg, rgba(14,24,42,0.95) 0%, rgba(8,14,26,0.98) 100%); border:1.5px solid rgba(56,189,248,0.35); border-radius:14px; padding:8px 10px; box-sizing:border-box; display:flex; flex-direction:column; gap:4px; box-shadow:0 8px 24px rgba(0,0,0,0.6);">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px 4px; border-bottom: 1px dashed rgba(255, 255, 255, 0.1);">
                    <span style="font-size:0.64rem; font-weight:900; color:#38bdf8; letter-spacing:1px; text-transform:uppercase;">TABLA DE POSICIONES</span>
                    <span style="font-size:0.56rem; font-weight:800; color:#cbd5e1;">POSICIONES FINALES</span>
                </div>
                <div style="display:grid; grid-template-columns: 24px 1fr 28px 34px 38px; align-items:center; gap:6px; padding: 2px 8px; font-size: 0.54rem; font-weight: 900; color: #94a3b8; text-transform:uppercase; letter-spacing:0.5px;">
                    <span style="text-align:center;">POS</span>
                    <span>CLUB</span>
                    <span style="text-align:center;">PJ</span>
                    <span style="text-align:center;">DIF</span>
                    <span style="text-align:center;">PTS</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:3px;">
                    ${filasHTML}
                </div>
            </div>
            ${statsPillsHTML}
        `;
    } else {
        bloqueMedioHTML = `
            <div style="position:relative; width:180px; height:180px; display:flex; align-items:center; justify-content:center;">
                <div style="position:absolute; width:190px; height:190px; border-radius:50%; background:radial-gradient(circle, rgba(255,215,0,0.45) 0%, transparent 70%); filter:blur(22px);"></div>
                <img src="${trofeoUrl}" style="width:170px; height:170px; object-fit:contain; position:relative; z-index:2; filter:drop-shadow(0 0 25px rgba(255,215,0,0.8));">
            </div>

            <div style="width:100%; background:linear-gradient(135deg, rgba(20,32,54,0.92) 0%, rgba(10,16,28,0.96) 100%); border:1.5px solid rgba(255,215,0,0.45); border-radius:18px; padding:12px 16px; box-sizing:border-box; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${escudoUrl}" style="width:42px; height:42px; object-fit:contain;">
                    <div style="display:flex; flex-direction:column; text-align:left;">
                        <strong style="font-size:1.15rem; font-weight:900; color:#ffffff; text-transform:uppercase;">${nombreUsuario}</strong>
                        <span style="font-size:0.68rem; font-weight:800; color:#38bdf8;">OVR ${ovrEquipo} · ${campanaTexto}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${capitanImgUrl}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1.5px solid #ffd700;">
                    <div style="display:flex; flex-direction:column; text-align:right;">
                        <span style="font-size:0.56rem; font-weight:900; color:#fde047;">CAPITÁN</span>
                        <strong style="font-size:0.78rem; font-weight:900; color:#ffffff;">${capNombre}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    poster.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; width:100%; justify-content:center;">
            <img src="${logoHeaderUrl}" style="width:32px; height:32px; border-radius:8px; border:1.5px solid #00ff77; object-fit:cover;">
            <div style="display:flex; flex-direction:column; text-align:left;">
                <span style="font-size:1rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; color:#ffffff; line-height:1;">ESTADIOS VIRTUALES</span>
                <span style="font-size:0.60rem; font-weight:800; letter-spacing:1.5px; color:#00ff77; text-transform:uppercase;">El mundo desde el aire</span>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; margin:4px 0 2px; width:100%;">
            <div style="background:rgba(255,215,0,0.18); border:1.5px solid #ffd700; color:#fde047; font-size:0.70rem; font-weight:900; padding:3px 14px; border-radius:20px; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:4px;">
                👑 ${campanaTexto.toUpperCase()}
            </div>
            <h1 style="font-size:1.45rem; font-weight:900; margin:0; text-transform:uppercase; line-height:1.15; color:#ffffff; text-shadow:0 0 16px rgba(255,215,0,0.5);">
                ${torneoNombre}
            </h1>
            <span style="font-size:0.72rem; font-weight:700; color:#94a3b8; margin-top:2px;">${subtituloTorneo}</span>
        </div>

        ${bloqueMedioHTML}

        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%; background:rgba(10,16,28,0.95); border:1.5px solid #00ff77; border-radius:12px; padding:8px 12px; box-sizing:border-box; margin-top:4px;">
            <img src="${qrUrl}" style="width:52px; height:52px; border-radius:6px; background:#ffffff; padding:2px; box-sizing:border-box;">
            <div style="display:flex; flex-direction:column; align-items:center; text-align:center; flex:1;">
                <strong style="font-size:0.84rem; font-weight:900; color:#00ff77; text-transform:uppercase;">¿Te animás a superarme?</strong>
                <span style="font-size:0.62rem; font-weight:600; color:#cbd5e1;">Escaneá el código y desafiá a mi Once.</span>
            </div>
        </div>
    `;

    document.body.appendChild(poster);

    try {
        const allImages = Array.from(poster.querySelectorAll('img'));
        await Promise.all(allImages.map(async (img) => {
            const rawSrc = img.getAttribute('src') || img.src;
            const b64 = await urlABase64Seguro(rawSrc);
            img.src = b64;
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
            backgroundColor: '#070d18',
            width: 450,
            height: 800
        });

        poster.remove();

        const triggerDownload = () => {
            const link = document.createElement('a');
            link.download = `campana-${torneoNombre.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (typeof showToast === 'function') showToast("¡Póster de Campaña descargado! 🏆", "ph-check-circle", "success");
        };

        const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (esMobile && navigator.canShare) {
            try {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'campana-estadiosvirtuales.jpg', { type: 'image/jpeg' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `¡Campaña en ${torneoNombre}! 🏆`,
                        text: `👑 ¡Mirá la campaña de mi Once en ${torneoNombre} en Estadios Virtuales! ¿Podés superarme?`
                    });
                    return;
                }
            } catch(e) {}
        }
        triggerDownload();
    } catch(err) {
        console.error("Error al exportar póster de campaña:", err);
        if (poster && poster.parentNode) poster.remove();
        if (typeof showToast === 'function') showToast("Error al exportar el póster.", "ph-warning-circle", "danger");
    }
}


// =============================================================================
// 🌐 EXPORTACIÓN AL ÁMBITO GLOBAL (WINDOW)
// =============================================================================
window.FORMACIONES_TACTICAS = FORMACIONES_TACTICAS;
window.formacionOnceActual = formacionOnceActual;
window.torneoEstado = torneoEstado;

window.obtenerOnceInicial = obtenerOnceInicial;
window.obtenerCapitanOnce = obtenerCapitanOnce;
window.obtenerOvrJugador = obtenerOvrJugador;
window.calcularOvrEquipoOnce = calcularOvrEquipoOnce;
window.calcularOvrLineasOnce = calcularOvrLineasOnce;
window.mejorarJugadorOnce = mejorarJugadorOnce;
window.designarCapitanOnce = designarCapitanOnce;
window.abrirModalOnceInicial = abrirModalOnceInicial;
window.cerrarModalOnceInicial = cerrarModalOnceInicial;
window.cambiarFormacionOnce = cambiarFormacionOnce;
window.seleccionarSlotOnce = seleccionarSlotOnce;
window.asignarJugadorAOnce = asignarJugadorAOnce;
window.quitarJugadorDeOnce = quitarJugadorDeOnce;
window.autocompletarOnceInicial = autocompletarOnceInicial;
window.limpiarOnceInicial = limpiarOnceInicial;
window.intercambiarPosicionesOnce = intercambiarPosicionesOnce;
window.renderizarOnceInicial = renderizarOnceInicial;

window.clickBotonTorneoOnce = clickBotonTorneoOnce;
window.abrirModalTorneoCopas = abrirModalTorneoCopas;
window.cerrarModalTorneoCopas = cerrarModalTorneoCopas;
window.seleccionarCopaParaJugar = seleccionarCopaParaJugar;
window.iniciarTorneoDeCopas = iniciarTorneoDeCopas;
window.prepararVistaPartidoCopa = prepararVistaPartidoCopa;
window.toggleVelocidadSimulacion = toggleVelocidadSimulacion;
window.saltarSimulacionCompleta = saltarSimulacionCompleta;
window.cerrarModalSimuladorPartido = cerrarModalSimuladorPartido;
window.iniciarSimulacionEnVivo = iniciarSimulacionEnVivo;
window.dispararFestejoCampeon = dispararFestejoCampeon;
window.finalizarPartidoCopa = finalizarPartidoCopa;

window.iniciarDesafioOnceRivalDirecto = iniciarDesafioOnceRivalDirecto;
window.desafiarDesdeRankingCarrera = desafiarDesdeRankingCarrera;
window.compartirPosterCampeon = compartirPosterCampeon;

window.abrirModalModoCarrera = abrirModalModoCarrera;
window.cerrarModalModoCarrera = cerrarModalModoCarrera;
window.clickJugarCopaDesdeCarrera = clickJugarCopaDesdeCarrera;
window.clickJugarLigaDesdeCarrera = clickJugarLigaDesdeCarrera;
window.abrirPalmaresDesdeCarrera = abrirPalmaresDesdeCarrera;
window.abrirModalRankingCarrera = abrirModalRankingCarrera;
window.cerrarModalRankingCarrera = cerrarModalRankingCarrera;

window.abrirModalTemporadaLiga = abrirModalTemporadaLiga;
window.cerrarModalTemporadaLiga = cerrarModalTemporadaLiga;
window.iniciarTemporadaLiga = iniciarTemporadaLiga;
window.jugarPartidoFechaLiga = jugarPartidoFechaLiga;
window.simularTemporadaCompleta = simularTemporadaCompleta;
window.avanzarFechaLibreLiga = avanzarFechaLibreLiga;
window.abandonarLigaTemporada = abandonarLigaTemporada;
window.mostrarCofreTemporada = mostrarCofreTemporada;
window.animarAperturaCofreTemporada = animarAperturaCofreTemporada;
window.reclamarRecompensaCofreTemporada = reclamarRecompensaCofreTemporada;
window.registrarH2HMutual = registrarH2HMutual;
window.obtenerBadgeH2HHTML = obtenerBadgeH2HHTML;
