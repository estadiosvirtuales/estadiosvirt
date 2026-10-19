// ========================================================
// 🏆 ESTADIOSVIRTUALES.COM - MÓDULO: DESAFÍO DE ORDEN
// ========================================================

let orderList = [];
let orderSelectedIdx = null;
let orderModo = "";
let orderPuntosGanados = 0;
let orderStartTime = 0;

function cerrarModalOrden() {
    const m = document.getElementById('order-modal');
    if (m) m.style.display = 'none';
    orderSelectedIdx = null;
    orderList = [];
    if (typeof verificarSobreBienvenidaPostPartida === 'function') {
        verificarSobreBienvenidaPostPartida();
    }
}

async function abrirModalRankingOrden(modo = 'capacidad') {
    if (typeof precargarAvataresComunidad === 'function') precargarAvataresComunidad();
    const body = document.getElementById('ranking-modal-body');
    if (!body) return;
    body.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--text-muted);"><i class="ph-duotone ph-circle-notch" style="font-size:2.5rem;color:var(--accent-color);animation:spinSlow 1s linear infinite;"></i><br><br>Conectando...</div>';
    document.getElementById('ranking-modal').style.display = 'flex';

    const activeCap = modo === 'capacidad' ? 'active' : '';
    const activeAnt = modo === 'antiguedad' ? 'active' : '';

    const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
    const miNombre = (typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u ? u.name.split(' ')[0] : 'Vos');

    const subMenuHTML = `
    <div class="liga-tabs-row ranking-tabs-row">
        <button class="liga-tab-btn ${activeCap}" onclick="abrirModalRankingOrden('capacidad')">
            <img src="capacidad.webp" alt="Capacidad" class="ranking-tab-img"> <span>Capacidad</span>
        </button>
        <button class="liga-tab-btn ${activeAnt}" onclick="abrirModalRankingOrden('antiguedad')">
            <img src="antiguedad.webp" alt="Antigüedad" class="ranking-tab-img"> <span>Antigüedad</span>
        </button>
    </div>`;

    try {
        const { data: rankingRaw, error } = await supabaseClient
            .from('ranking')
            .select('nombre, puntaje')
            .eq('juego', modo)
            .order('puntaje', { ascending: false })
            .limit(500);

        if (error) throw error;

        const mejorPorJugador = {};
        (rankingRaw || []).forEach(row => {
            const n = (row.nombre || 'Anónimo').trim();
            const p = row.puntaje || 0;
            const clave = n.toLowerCase();
            if (!mejorPorJugador[clave] || p > mejorPorJugador[clave].puntaje) {
                mejorPorJugador[clave] = { nombre: n, puntaje: p };
            }
        });

        const todosOrdenados = Object.values(mejorPorJugador).sort((a, b) => b.puntaje - a.puntaje);
        const ranking = todosOrdenados.slice(0, 50);

        let recordReal = 0;
        const miEmail = u && u.email ? u.email : '';
        const miApodo = (miNombre || '').trim().toLowerCase();

        if (miEmail) {
            const { data: filaPorEmail } = await supabaseClient
                .from('ranking')
                .select('puntaje')
                .eq('juego', modo)
                .eq('email', miEmail)
                .order('puntaje', { ascending: false })
                .limit(1);

            if (filaPorEmail && filaPorEmail.length > 0) recordReal = filaPorEmail[0].puntaje || 0;
        }

        if (!recordReal && miApodo) {
            const { data: filaPorNombre } = await supabaseClient
                .from('ranking')
                .select('puntaje')
                .eq('juego', modo)
                .ilike('nombre', miApodo)
                .order('puntaje', { ascending: false })
                .limit(1);

            if (filaPorNombre && filaPorNombre.length > 0) recordReal = filaPorNombre[0].puntaje || 0;
        }

        const textoRecord = recordReal > 0 ? `${recordReal.toLocaleString('es-AR')} pts` : 'Sin récord';
        const miPuestoIdx = todosOrdenados.findIndex(f => (f.nombre || '').trim().toLowerCase() === miApodo);
        const textoPosicion = miPuestoIdx !== -1 ? `#${miPuestoIdx + 1}` : (recordReal > 0 ? '+50' : 'Sin clasif.');

        let cantPartidas = userStats['partidas_' + modo] || 0;
        if (supabaseClient) {
            try {
                let qPartidas = supabaseClient.from('ranking').select('*', { count: 'exact', head: true }).eq('juego', modo);
                if (miEmail) qPartidas = qPartidas.eq('email', miEmail);
                else if (miApodo) qPartidas = qPartidas.ilike('nombre', miApodo);
                const { count: partidasDb } = await qPartidas;
                if (partidasDb !== null && partidasDb > cantPartidas) {
                    cantPartidas = partidasDb;
                    userStats['partidas_' + modo] = cantPartidas;
                }
            } catch(e) {}
        }
        const textoPartidas = `${cantPartidas} ${cantPartidas === 1 ? 'Jugada' : 'Jugadas'}`;

        const headerConfig = modo === 'capacidad' ? {
            img: 'capacidad.webp',
            fallback: 'capacidad.webp',
            glowClass: 'glow-gold',
            badgeImg: 'capacidad.webp',
            badgeTitle: 'Top 50 Global',
            badgeSub: 'Capacidad',
            badgeColor: '#fbbf24',
            pill1Label: 'TU RÉCORD',
            pill1Val: textoRecord,
            pill1Icon: 'ph-trophy',
            pill2Label: 'POSICIÓN',
            pill2Val: textoPosicion,
            pill2Icon: 'ph-hash',
            pill3Label: 'PARTIDAS',
            pill3Val: textoPartidas,
            pill3Icon: 'ph-game-controller'
        } : {
            img: 'antiguedad.webp',
            fallback: 'antiguedad.webp',
            glowClass: 'glow-blue',
            badgeImg: 'antiguedad.webp',
            badgeTitle: 'Top 50 Global',
            badgeSub: 'Antigüedad',
            badgeColor: '#a78bfa',
            pill1Label: 'TU RÉCORD',
            pill1Val: textoRecord,
            pill1Icon: 'ph-trophy',
            pill2Label: 'POSICIÓN',
            pill2Val: textoPosicion,
            pill2Icon: 'ph-hash',
            pill3Label: 'PARTIDAS',
            pill3Val: textoPartidas,
            pill3Icon: 'ph-game-controller'
        };

        const medallas3D = [
            '<img src="medalla-oro.webp" alt="1º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">',
            '<img src="medalla-plata.webp" alt="2º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">',
            '<img src="medalla-bronce.webp" alt="3º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">'
        ];

        let htmlContenido = `<div class="liga-table-card"><div class="ranking-rows-scroll">`;
        if (!ranking || !ranking.length) {
            htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:36px 20px;font-size:0.85rem;">Aún no hay récords registrados en este modo.</p>`;
        } else {
            ranking.forEach((f, i) => {
                const med = i < 3 ? medallas3D[i] : `<span style="color:var(--text-muted); font-weight:700; width:24px; display:inline-block; text-align:center;">${i + 1}</span>`;
                const nombreJugador = (f.nombre || 'Anónimo').trim();
                const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();

                htmlContenido += `
                <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                    <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                        ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} ${sanitizarHTML(nombreJugador)}
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                        ${(f.puntaje || 0).toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                    </span>
                </div>`;
            });
        }
        htmlContenido += '</div>';

        if (miPuestoIdx >= 50 && recordReal > 0) {
            htmlContenido += `
            <div class="liga-row-item sticky-user-row es-propio">
                <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombre.replace(/'/g, "\\'")}')" title="Tu posición">
                    <span class="sticky-rank-pill">#${miPuestoIdx + 1}</span> ${obtenerAvatarCirculoHTML(miNombre)} <b>${sanitizarHTML(miNombre)} (Vos)</b>
                </span>
                <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                    ${recordReal.toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                </span>
            </div>`;
        }

        htmlContenido += '</div>';

        body.innerHTML = `
        <div class="ranking-split-grid">
            <div class="ranking-left-panel">
                <div class="ranking-brand-box">
                    <div class="trophy-stage-wrapper">
                        <div class="trophy-glow-backdrop ${headerConfig.glowClass}"></div>
                        <div class="trophy-main-img-box">
                            <img src="${headerConfig.img}" alt="Ícono Modo" class="trophy-main-img" onerror="this.src='${headerConfig.fallback}';">
                        </div>
                    </div>
                    <h2 class="liga-modal-title">Desafío de Orden</h2>
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
                        <img src="${headerConfig.badgeImg}" alt="Ícono" class="badge-title-png-icon" onerror="this.src='${headerConfig.fallback}';">
                        <span class="badge-title-text">${headerConfig.badgeTitle}</span>
                        <span class="badge-sep">·</span>
                        <span class="badge-sub-pill" style="color:${headerConfig.badgeColor};">${headerConfig.badgeSub}</span>
                    </div>

                    <div class="ranking-search-box">
                        <i class="ph-bold ph-magnifying-glass"></i>
                        <input type="text" class="ranking-search-input" placeholder="Buscar jugador..." oninput="filtrarJugadoresRanking(this.value)">
                    </div>
                </div>
                ${htmlContenido}
            </div>
        </div>`;

    } catch (e) {
        console.error("Error al leer ranking de orden:", e);
        body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger-color);"><i class="ph-duotone ph-warning-circle" style="font-size:3rem;"></i><br><br><b>Error de conexión con la base de datos</b></div>`;
    }
}

function abrirModalOrden() {
    const modal = document.getElementById('order-modal');
    const body = document.getElementById('order-modal-body');
    if (!modal || !body) return;

    modal.style.display = 'flex';
    orderSelectedIdx = null;
    orderList = [];

    body.innerHTML = `
    <div style="text-align:center; color:var(--text-main); padding: 10px 5px; display:flex; flex-direction:column; align-items:center; width: 100%;">
        <div style="margin-bottom: 18px;">
            <div style="width: 140px; height: 120px; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 18px rgba(234, 179, 8, 0.75));">
                <img src="podio.webp" alt="Ordenar Estadios" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 6px;">Desafío de Orden</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 380px; line-height: 1.45; margin: 0 auto;">
                Demostrá tu conocimiento. Tocá dos tarjetas para intercambiarlas y ordenalas correctamente.
            </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 380px; margin-bottom: 18px;">
            <button onclick="iniciarJuegoOrden('capacidad')" class="guessr-option-btn btn-opt-capacidad" style="padding: 14px 18px;">
                <div class="guessr-option-icon">
                    <img src="capacidad.webp" alt="Por Capacidad" style="width: 130%; height: 130%; object-fit: contain; transform: scale(1.45);">
                </div>
                <div class="guessr-option-text">
                    <strong style="font-size: 1rem; color: #fbbf24;">Por Capacidad</strong>
                    <span>Del más grande al más chico</span>
                </div>
            </button>

            <button onclick="iniciarJuegoOrden('antiguedad')" class="guessr-option-btn btn-opt-antiguedad" style="padding: 14px 18px;">
                <div class="guessr-option-icon">
                    <img src="antiguedad.webp" alt="Por Antigüedad" style="width: 130%; height: 130%; object-fit: contain; transform: scale(1.45);">
                </div>
                <div class="guessr-option-text">
                    <strong style="font-size: 1rem; color: #c084fc;">Por Antigüedad</strong>
                    <span>Del más viejo al más moderno</span>
                </div>
            </button>
        </div>

        <div style="width: 100%; max-width: 380px; border-top: 1px dashed var(--border-subtle); padding-top: 14px;">
            <button onclick="abrirModalRankingOrden('capacidad')" class="btn-3d btn-order-ranking-gold" style="width: 100%; padding: 12px; font-size: 0.88rem; font-weight: 800; gap: 8px;">
                <img src="medalla-oro.webp" alt="Ranking" style="width: 24px; height: 24px; object-fit: contain;"> Ranking Desafíos
            </button>
        </div>
    </div>`;
}

function iniciarJuegoOrden(modo) {
    const idPartida = typeof getUserId === 'function' ? getUserId() : 'guest';
    localStorage.setItem('ev_primera_partida_iniciada_' + idPartida, 'true');
    localStorage.setItem('ev_primera_partida_iniciada_global', 'true');
    const pool = (typeof catalogoGlobal !== 'undefined' && catalogoGlobal.length > 0) ? catalogoGlobal : (typeof estadiosCargados !== 'undefined' ? estadiosCargados : []);
    if (!pool.length) {
        if (typeof showToast === 'function') showToast('Esperá un momento...', 'ph-info', 'danger');
        return;
    }
    orderModo = modo;
    orderSelectedIdx = null;
    orderPuntosGanados = 0;

    const validos = pool.filter(f => {
        const n = bscarPropiedad(f, 'Estadio'), c = bscarPropiedad(f, 'Club');
        if (!n || !c) return false;
        const raw = String(bscarPropiedad(f, modo === 'capacidad' ? 'Capacidad' : 'Año')).replace(/[^0-9]/g, '');
        return raw !== '' && parseInt(raw) > 0;
    });

    if (validos.length < 5) {
        if (typeof showToast === 'function') showToast('No hay suficientes datos.', 'ph-warning-circle', 'danger');
        return;
    }

    let sel = [], copia = [...validos];
    while (sel.length < 5) {
        const idx = Math.floor(Math.random() * copia.length);
        const e = copia.splice(idx, 1)[0];
        const val = parseInt(String(bscarPropiedad(e, modo === 'capacidad' ? 'Capacidad' : 'Año')).replace(/[^0-9]/g, '')) || 0;
        sel.push({
            estadio: bscarPropiedad(e, 'Estadio'),
            club: bscarPropiedad(e, 'Club'),
            pais: bscarPropiedad(e, 'País') || 'Argentina',
            valor: val,
            correctIdx: -1
        });
    }

    const ord = [...sel].sort((a, b) => modo === 'capacidad' ? b.valor - a.valor : a.valor - b.valor);
    sel.forEach(e => {
        e.correctIdx = ord.findIndex(o => o.estadio === e.estadio && o.club === e.club);
    });

    orderList = [...sel].sort(() => Math.random() - .5);
    orderStartTime = performance.now();
    renderJuegoOrden(false);
}

function renderJuegoOrden(revelar = false) {
    const body = document.getElementById('order-modal-body');
    if (!body) return;

    const imgIcono = orderModo === 'capacidad' 
        ? '<img src="capacidad.webp" alt="Capacidad" style="width:38px;height:38px;object-fit:contain;">' 
        : '<img src="antiguedad.webp" alt="Antigüedad" style="width:38px;height:38px;object-fit:contain;">';

    const titulo = orderModo === 'capacidad' ? 'Mayor a Menor Capacidad' : 'Del Más Antiguo al Más Moderno';
    const labelTop = orderModo === 'capacidad' ? '⬆ MÁS GRANDE' : '⬆ MÁS ANTIGUO';
    const labelBot = orderModo === 'capacidad' ? '⬇ MÁS CHICO' : '⬇ MÁS MODERNO';

    let cabeceraHTML = '';
    if (!revelar) {
        cabeceraHTML = `
        <div style="border-bottom:2px dashed var(--border-subtle);padding-bottom:10px;margin-bottom:10px;text-align:center;flex-shrink:0;">
            <h2 style="font-size:1.15rem;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;text-transform:uppercase;">${imgIcono} ${titulo}</h2>
            <p style="color:var(--text-muted);font-size:.82rem;margin-top:4px;line-height:1.4;">
                ${orderModo === 'capacidad' ? 'Tocá dos tarjetas para intercambiarlas · de <b>Mayor a Menor</b> capacidad' : 'Tocá dos tarjetas para intercambiarlas · del <b>Más Viejo</b> al <b>Más Moderno</b>'}
            </p>
        </div>`;
    } else {
        const aciertos = orderList.filter((e, i) => i === e.correctIdx).length;
        const mensajeAciertos = aciertos === 5 
            ? '👑 ¡Impecable! Orden perfecto de los 5 estadios' 
            : aciertos >= 3 
            ? `⚽ ¡Muy bien! Acertaste ${aciertos} de 5 en su lugar exacto` 
            : `📊 Acertaste ${aciertos} de 5 posiciones correctas`;

        cabeceraHTML = `
        <div style="border-bottom:2px dashed var(--border-subtle);padding-bottom:12px;margin-bottom:10px;text-align:center;flex-shrink:0;">
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,230,118,0.12);border:1px solid rgba(0,230,118,0.4);border-radius:20px;padding:3px 12px;margin-bottom:6px;font-size:0.72rem;font-weight:900;color:var(--accent-color);letter-spacing:1px;text-transform:uppercase;">
                <i class="ph-fill ph-check-circle"></i> Desafío Finalizado
            </div>
            <h2 style="font-size:1.35rem;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;text-transform:uppercase;letter-spacing:-0.3px;">${titulo}</h2>
            <p style="color:var(--text-muted);font-size:.84rem;margin-top:3px;font-weight:600;">${mensajeAciertos}</p>
        </div>`;
    }

    let slotsHTML = '';
    orderList.forEach((est, i) => {
        let bgC = 'var(--surface-color)', brC = 'var(--border-strong)', badge = '', extraStyle = '';
        let iconL = `<div style="background:var(--bg-color);color:var(--text-muted);border:2px solid var(--border-subtle);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:.88rem;font-weight:800;flex-shrink:0;">${i+1}</div>`;

        if (revelar) {
            const ok = i === est.correctIdx;
            bgC = ok ? 'rgba(0,230,118,.12)' : 'rgba(255,71,87,.12)';
            brC = ok ? 'var(--accent-color)' : 'var(--danger-color)';
            iconL = ok 
                ? `<div style="background:var(--accent-color);color:#000;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.05rem;font-weight:900;">✓</div>` 
                : `<div style="background:var(--danger-color);color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.05rem;font-weight:900;">✕</div>`;
            const v = orderModo === 'capacidad' ? `${est.valor.toLocaleString('es-AR')} esp.` : `${est.valor}`;
            badge = `<span style="background:${ok ? 'var(--accent-color)' : 'var(--danger-color)'};color:${ok ? '#000' : '#fff'};font-size:.72rem;font-weight:900;padding:3px 10px;border-radius:20px;margin-left:auto;flex-shrink:0;">${v}</span>`;
        } else if (orderSelectedIdx === i) {
            brC = 'var(--accent-color)';
            bgC = 'var(--accent-dim)';
            extraStyle = 'transform:translateY(-4px) scale(1.01);box-shadow:0 8px 24px var(--accent-glow);';
            iconL = `<div style="background:var(--accent-color);color:#000;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem;font-weight:900;">↕</div>`;
        }

        slotsHTML += `
        <div onclick="${revelar ? '' : `seleccionarFilaOrden(${i})`}" class="order-slot" style="background:${bgC};border:2px solid ${brC};cursor:${revelar ? 'default' : 'pointer'};margin-bottom:6px;${extraStyle}">
            ${iconL}
            <div style="display:flex;flex-direction:column;overflow:hidden;min-width:0;flex:1;">
                <strong style="font-size:.9rem;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-main);">${est.estadio}</strong>
                <span style="color:var(--text-muted);font-size:.76rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${est.club}</span>
            </div>
            ${badge}
        </div>`;
    });

    let timerBarHTML = !revelar 
        ? `<div style="background:var(--border-subtle);border-radius:20px;height:4px;margin-bottom:12px;overflow:hidden;"><div id="order-timer-bar" style="height:100%;border-radius:20px;background:var(--accent-color);width:100%;transition:width .5s linear;"></div></div>` 
        : '';

    let botonera = '';
    if (!revelar) {
        botonera = `
        <div style="margin-top: 10px; margin-bottom: 14px; width: 100%; flex-shrink: 0; box-sizing: border-box;">
            <button type="button" onclick="procesarResultadoOrden()" class="btn-3d" style="width: 100%; min-height: unset !important; height: auto !important; padding: 10px 18px !important; font-size: 0.88rem !important; font-weight: 900 !important; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between; border-radius: 12px !important; background: linear-gradient(135deg, #00e5ff 0%, #2979ff 55%, #1a237e 100%) !important; color: #ffffff !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); border: 1.5px solid rgba(255, 255, 255, 0.35) !important; border-top: 2px solid rgba(255, 255, 255, 0.8) !important; box-shadow: 0 4px 18px rgba(41, 121, 255, 0.45), 0 0 16px rgba(0, 229, 255, 0.35) !important; box-sizing: border-box; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px;">
                    <i class="ph-fill ph-rocket-launch" style="font-size: 1.15rem;"></i>
                    <span>¡Confirmar orden!</span>
                </span>
                <i class="ph-bold ph-arrow-right" style="font-size: 1.05rem; opacity: 0.9;"></i>
            </button>
        </div>`;
    } else {
        const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
        const nombreGuardadoOrden = (typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u && u.name ? u.name.split(' ')[0] : 'Jugador');
        const nivelActual = NIVELES[typeof calcularNivelIdx === 'function' ? calcularNivelIdx(userStats.xpTotal) : 0];

        const cartelGuardadoOrden = `
        <div style="width:100%; background:linear-gradient(135deg, rgba(0,255,119,0.12) 0%, rgba(10,36,24,0.85) 100%); border:1.5px solid #00e676; border-radius:12px; padding:8px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px; box-sizing:border-box; margin-bottom:10px;">
            <span style="font-size:0.78rem; font-weight:800; color:#ffffff; display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <i class="ph-fill ph-check-circle" style="color:#00ff77; font-size:1.1rem; flex-shrink:0;"></i> Récord anotado: <b id="lbl-apodo-guardado" style="color:#00ff77;">${sanitizarHTML(nombreGuardadoOrden)}</b>
            </span>
            <button type="button" onclick="cambiarApodoDesdePantallaFinal()" class="btn-3d secondary" style="padding:5px 10px; font-size:0.70rem; height:auto; min-height:auto; flex-shrink:0; border-radius:8px;">
                <i class="ph-bold ph-pencil-simple"></i> Cambiar
            </button>
        </div>`;

        botonera = `
        <div style="background:var(--surface-color); border:2px solid var(--border-strong); padding:14px; border-radius:18px; margin-top:14px; flex-shrink:0; box-shadow:0 -5px 20px rgba(0,0,0,.3); width:100%; box-sizing:border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div>
                    <div style="font-size:.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:1px;">Puntaje obtenido</div>
                    <strong style="font-size:1.6rem; color:var(--accent-color); font-weight:900;">${orderPuntosGanados.toLocaleString('es-AR')} <span style="font-size:.85rem; color:var(--text-muted); font-weight:700;">pts</span></strong>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:.78rem; color:${nivelActual.color}; font-weight:800;">${nivelActual.emoji} ${nivelActual.nombre}</span>
                </div>
            </div>
            ${cartelGuardadoOrden}
            <div style="display:flex; gap:10px; margin-bottom:8px;">
                <button type="button" onclick="abrirModalRankingOrden('${orderModo}')" class="btn-3d btn-endgame-rank" style="flex:1; font-size:.88rem; padding:12px 14px;">
                    <img src="medalla-oro.webp" alt="Ranking" style="width:20px; height:20px; object-fit:contain;"> Ranking
                </button>
                <button type="button" onclick="iniciarJuegoOrden('${orderModo}')" class="btn-3d btn-endgame-replay" style="flex:1; font-size:.88rem; padding:12px 14px;">
                    <i class="ph-bold ph-arrow-counter-clockwise"></i> Rejugar
                </button>
            </div>
            <button type="button" onclick="abrirModalOrden()" class="btn-3d btn-endgame-back" style="width:100%; padding:10px; font-size:.82rem; font-weight:800;">
                <i class="ph-bold ph-arrow-left"></i> Volver al menú de desafíos
            </button>
        </div>`;
    }

    const subtituloGrilla = !revelar 
        ? `<div style="text-align:center;font-size:.68rem;font-weight:800;color:var(--accent-color);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;opacity:.85;">${labelTop}</div>` 
        : `<div style="text-align:center;font-size:.68rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">POSICIÓN FINAL REVELADA</div>`;

    const pieGrilla = !revelar 
        ? `<div style="text-align:center;font-size:.68rem;font-weight:800;color:var(--accent-color);text-transform:uppercase;letter-spacing:1px;margin-top:4px;opacity:.85;">${labelBot}</div>` 
        : '';

    body.innerHTML = `
        ${cabeceraHTML}
        ${timerBarHTML}
        <div style="display:flex;flex-direction:column;flex-grow:1;overflow-y:auto;padding:2px 4px 6px;scrollbar-width:thin;">
            ${subtituloGrilla}
            ${slotsHTML}
            ${pieGrilla}
        </div>
        ${botonera}
    `;

    if (!revelar) setTimeout(() => {
        const bar = document.getElementById('order-timer-bar');
        if (bar) bar.style.width = '0%';
    }, 100);
}

function seleccionarFilaOrden(idx) {
    if (orderSelectedIdx === null) {
        orderSelectedIdx = idx;
        renderJuegoOrden(false);
    } else if (orderSelectedIdx === idx) {
        orderSelectedIdx = null;
        renderJuegoOrden(false);
    } else {
        const t = orderList[orderSelectedIdx];
        orderList[orderSelectedIdx] = orderList[idx];
        orderList[idx] = t;
        orderSelectedIdx = null;
        renderJuegoOrden(false);
    }
}

function procesarResultadoOrden() {
    const idUsuario = typeof getUserId === 'function' ? getUserId() : 'guest';
    localStorage.setItem('ev_primera_partida_finalizada_' + idUsuario, 'true');
    localStorage.setItem('ev_primera_partida_finalizada_global', 'true');
    const t = (performance.now() - orderStartTime) / 1000;
    const bonus = Math.max(0, Math.round((60 - t) * 40));
    let dev = 0;
    orderList.forEach((e, i) => dev += Math.abs(i - e.correctIdx));
    const base = Math.max(0, 10000 - (dev * 1200));
    if (dev === 0) userStats.ordenSinFallar = true;
    orderPuntosGanados = Math.round(base + (bonus * (base / 10000)));
    pendingScore = orderPuntosGanados;
    pendingScoreType = orderModo;
    userStats['partidas_' + orderModo] = (userStats['partidas_' + orderModo] || 0) + 1;
    if (typeof agregarXP === 'function') agregarXP(orderPuntosGanados);
    if (typeof guardarStats === 'function') guardarStats();

    const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
    let nombreParaGuardar = typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '';
    if (!nombreParaGuardar && u && u.name) {
        nombreParaGuardar = u.name.split(' ')[0];
    }
    if (!nombreParaGuardar) {
        const prefijos = ['Hincha', 'DT', 'Pibe', 'Capitan', 'Goleador'];
        const pref = prefijos[Math.floor(Math.random() * prefijos.length)];
        nombreParaGuardar = `${pref}_${Math.floor(100 + Math.random() * 900)}`;
        if (typeof setPref === 'function') setPref('ev_custom_nick', nombreParaGuardar);
        if (typeof renderizarBotonLogin === 'function') renderizarBotonLogin();
    }
    const emailParaGuardar = (u && u.email) ? u.email : '';
    if (typeof enviarPuntaje === 'function') {
        enviarPuntaje(nombreParaGuardar, orderPuntosGanados, emailParaGuardar, orderModo);
    }

    renderJuegoOrden(true);
    const targetOrden = document.getElementById('order-modal-body') || document.getElementById('order-modal');
    if (typeof lanzarConfetti === 'function') {
        setTimeout(() => lanzarConfetti(targetOrden), 250);
    }
}

function guardarScoreOrden(btn) {
    pendingScore = orderPuntosGanados;
    pendingScoreType = orderModo;
    if (typeof guardarScorePendiente === 'function') guardarScorePendiente();
    if (btn) {
        btn.innerHTML = `<i class="ph-bold ph-check"></i> ¡Guardado!`;
        btn.disabled = true;
        btn.style.opacity = '0.7';
    }
}
