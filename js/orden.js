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
    if (m) {
        m.style.display = 'none';
        const content = m.querySelector('.modal-content');
        if (content) content.classList.remove('order-game-active');
    }
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

    const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
    const miNombre = (typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u ? u.name.split(' ')[0] : 'Vos');

    try {
        const { data: rankingRaw, error } = await supabaseClient
            .from('ranking')
            .select('nombre, puntaje')
            .eq('juego', 'capacidad')
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
                .eq('juego', 'capacidad')
                .eq('email', miEmail)
                .order('puntaje', { ascending: false })
                .limit(1);

            if (filaPorEmail && filaPorEmail.length > 0) recordReal = filaPorEmail[0].puntaje || 0;
        }

        if (!recordReal && miApodo) {
            const { data: filaPorNombre } = await supabaseClient
                .from('ranking')
                .select('puntaje')
                .eq('juego', 'capacidad')
                .ilike('nombre', miApodo)
                .order('puntaje', { ascending: false })
                .limit(1);

            if (filaPorNombre && filaPorNombre.length > 0) recordReal = filaPorNombre[0].puntaje || 0;
        }

        const textoRecord = recordReal > 0 ? `${recordReal.toLocaleString('es-AR')} pts` : 'Sin récord';
        const miPuestoIdx = todosOrdenados.findIndex(f => (f.nombre || '').trim().toLowerCase() === miApodo);
        const textoPosicion = miPuestoIdx !== -1 ? `#${miPuestoIdx + 1}` : (recordReal > 0 ? '+50' : 'Sin clasif.');

        let cantPartidas = userStats['partidas_capacidad'] || 0;
        if (supabaseClient) {
            try {
                let qPartidas = supabaseClient.from('ranking').select('*', { count: 'exact', head: true }).eq('juego', 'capacidad');
                if (miEmail) qPartidas = qPartidas.eq('email', miEmail);
                else if (miApodo) qPartidas = qPartidas.ilike('nombre', miApodo);
                const { count: partidasDb } = await qPartidas;
                if (partidasDb !== null && partidasDb > cantPartidas) {
                    cantPartidas = partidasDb;
                    userStats['partidas_capacidad'] = cantPartidas;
                }
            } catch(e) {}
        }
        const textoPartidas = `${cantPartidas} ${cantPartidas === 1 ? 'Jugada' : 'Jugadas'}`;

        const headerConfig = {
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
                    <h2 class="liga-modal-title">Desafío de Capacidad</h2>
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
    const content = modal.querySelector('.modal-content');
    if (content) content.classList.remove('order-game-active');
    orderSelectedIdx = null;
    orderList = [];

    body.innerHTML = `
    <div style="text-align:center; color:var(--text-main); padding: 10px 5px; display:flex; flex-direction:column; align-items:center; width: 100%;">
        <div style="margin-bottom: 18px;">
            <div style="width: 140px; height: 120px; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 18px rgba(234, 179, 8, 0.75));">
                <img src="podio.webp" alt="Ordenar Estadios" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 6px;">Desafío de Capacidad</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 380px; line-height: 1.45; margin: 0 auto;">
                Demostrá cuánto sabés del aforo de los estadios. Tocá dos tarjetas para intercambiarlas y ordenalas de mayor a menor capacidad.
            </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 380px; margin-bottom: 18px;">
            <button onclick="iniciarJuegoOrden('capacidad')" class="guessr-option-btn btn-opt-capacidad" style="padding: 16px 20px;">
                <div class="guessr-option-icon">
                    <img src="capacidad.webp" alt="Por Capacidad" style="width: 130%; height: 130%; object-fit: contain; transform: scale(1.45);">
                </div>
                <div class="guessr-option-text">
                    <strong style="font-size: 1.05rem; color: #fbbf24;">¡Comenzar Desafío!</strong>
                    <span>Del más grande al más chico</span>
                </div>
            </button>
        </div>

        <div style="width: 100%; max-width: 380px; border-top: 1px dashed var(--border-subtle); padding-top: 14px;">
            <button onclick="abrirModalRankingOrden('capacidad')" class="btn-3d btn-order-ranking-gold" style="width: 100%; padding: 12px; font-size: 0.88rem; font-weight: 800; gap: 8px;">
                <img src="medalla-oro.webp" alt="Ranking" style="width: 24px; height: 24px; object-fit: contain;"> Ranking Global de Capacidad
            </button>
        </div>
    </div>`;
}

function iniciarJuegoOrden(modo = 'capacidad') {
    const idPartida = typeof getUserId === 'function' ? getUserId() : 'guest';
    localStorage.setItem('ev_primera_partida_iniciada_' + idPartida, 'true');
    localStorage.setItem('ev_primera_partida_iniciada_global', 'true');
    const pool = (typeof catalogoGlobal !== 'undefined' && catalogoGlobal.length > 0) ? catalogoGlobal : (typeof estadiosCargados !== 'undefined' ? estadiosCargados : []);
    if (!pool.length) {
        if (typeof showToast === 'function') showToast('Esperá un momento...', 'ph-info', 'danger');
        return;
    }
    const modal = document.getElementById('order-modal');
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) content.classList.add('order-game-active');
    }
    orderModo = 'capacidad';
    orderSelectedIdx = null;
    orderPuntosGanados = 0;

    const validos = pool.filter(f => {
        const n = bscarPropiedad(f, 'Estadio'), c = bscarPropiedad(f, 'Club');
        if (!n || !c) return false;
        const raw = String(bscarPropiedad(f, 'Capacidad')).replace(/[^0-9]/g, '');
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
        const val = parseInt(String(bscarPropiedad(e, 'Capacidad')).replace(/[^0-9]/g, '')) || 0;
        sel.push({
            estadio: bscarPropiedad(e, 'Estadio'),
            club: bscarPropiedad(e, 'Club'),
            pais: bscarPropiedad(e, 'País') || 'Argentina',
            linkVideo: bscarPropiedad(e, 'Link del Video') || '',
            foto: bscarPropiedad(e, 'Foto') || '',
            valor: val,
            correctIdx: -1
        });
    }

    const ord = [...sel].sort((a, b) => b.valor - a.valor);
    sel.forEach(e => {
        e.correctIdx = ord.findIndex(o => o.estadio === e.estadio && o.club === e.club);
    });

    orderList = [...sel].sort(() => Math.random() - .5);
    orderStartTime = performance.now();
    renderJuegoOrden(false);
}

function obtenerMiniaturaEstadioOrden(est) {
    const link = est.linkVideo || '';
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
        const match = link.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w\-]{11})/i);
        if (match && match[1]) {
            return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
        }
    }
    return est.foto || 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp';
}

function obtenerFotoHdEstadioOrden(est) {
    const link = est.linkVideo || '';
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
        const match = link.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w\-]{11})/i);
        if (match && match[1]) {
            return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
    }
    return est.foto || 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp';
}

function abrirFotoEstadioZoom(e, url, estadio, club) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const modal = document.getElementById('order-photo-zoom-modal');
    const imgEl = document.getElementById('order-zoom-img');
    const titleEl = document.getElementById('order-zoom-stadium-title');
    const clubEl = document.getElementById('order-zoom-club-title');
    if (!modal || !imgEl) return;

    imgEl.src = url;
    if (titleEl) titleEl.textContent = estadio || 'Estadio';
    if (clubEl) clubEl.textContent = club || '';

    modal.style.display = 'flex';
}

function cerrarFotoEstadioZoom(e) {
    if (e && e.target && e.target.closest && e.target.closest('.modal-content') && !e.target.closest('.close-btn')) {
        return;
    }
    const modal = document.getElementById('order-photo-zoom-modal');
    if (modal) modal.style.display = 'none';
}

function moverCardOrden(e, idx, delta) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= orderList.length) return;
    const t = orderList[idx];
    orderList[idx] = orderList[targetIdx];
    orderList[targetIdx] = t;
    orderSelectedIdx = null;
    renderJuegoOrden(false);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const zoomModal = document.getElementById('order-photo-zoom-modal');
        if (zoomModal && zoomModal.style.display === 'flex') {
            zoomModal.style.display = 'none';
            e.stopPropagation();
        }
    }
});

function renderJuegoOrden(revelar = false) {
    const modal = document.getElementById('order-modal');
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) content.classList.add('order-game-active');
    }
    const body = document.getElementById('order-modal-body');
    if (!body) return;

    const imgIcono = '<img src="capacidad.webp" alt="Capacidad" style="width:36px;height:36px;object-fit:contain;">';
    const titulo = 'Mayor a Menor Capacidad';
    const labelTopMobile = '⬆ MÁS GRANDE';
    const labelBotMobile = '⬇ MÁS CHICO';

    const labelTopDesktop = '#1 MÁS GRANDE (Mayor Aforo)';
    const labelBotDesktop = '#5 MÁS CHICO (Menor Aforo)';

    let cabeceraHTML = '';
    if (!revelar) {
        cabeceraHTML = `
        <div class="order-game-header">
            <h2 class="order-game-title">${imgIcono} ${titulo}</h2>
            <p class="order-game-subtitle">
                Tocá dos tarjetas para intercambiarlas · de <b>Mayor a Menor</b> capacidad
            </p>
        </div>`;
    } else {
        const aciertos = orderList.filter((e, i) => i === e.correctIdx).length;
        const mensajeAciertos = aciertos === 5 
            ? '👑 ¡Impecable! Orden perfecto de los 5 estadios' 
            : aciertos >= 3 
            ? `⚽ ¡Muy bien! Acertaste ${aciertos} de 5 en su lugar exacto` 
            : `Acertaste ${aciertos} de 5 posiciones correctas`;

        cabeceraHTML = `
        <div class="order-game-header revealed">
            <div class="order-endgame-pill">
                <i class="ph-fill ph-check-circle"></i> Desafío Finalizado
            </div>
            <h2 class="order-game-title">${titulo}</h2>
            <p class="order-game-subtitle">${mensajeAciertos}</p>
        </div>`;
    }

    // Escala Desktop (horizontal)
    const scaleBarDesktopHTML = !revelar ? `
    <div class="order-scale-bar-desktop">
        <div class="scale-point-left">
            <i class="ph-bold ph-trophy"></i>
            <span>${labelTopDesktop}</span>
        </div>
        <div class="scale-point-center">
            <i class="ph-bold ph-arrows-left-right"></i>
            <span>Tocá dos para intercambiar o usá las flechas</span>
        </div>
        <div class="scale-point-right">
            <span>${labelBotDesktop}</span>
            <i class="ph-bold ph-arrow-down-right"></i>
        </div>
    </div>` : '';

    // Mobile vertical guides
    const subtituloGrillaMobile = !revelar 
        ? `<div class="order-mobile-guide top">${labelTopMobile}</div>` 
        : `<div class="order-mobile-guide top revealed">POSICIÓN FINAL REVELADA</div>`;

    const pieGrillaMobile = !revelar 
        ? `<div class="order-mobile-guide bottom">${labelBotMobile}</div>` 
        : '';

    let slotsHTML = '';
    orderList.forEach((est, i) => {
        const thumbUrl = obtenerMiniaturaEstadioOrden(est);
        const hdUrl = obtenerFotoHdEstadioOrden(est);
        const escudoClub = est.foto || 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp';
        const estadioSafe = (est.estadio || '').replace(/["']/g, '');
        const clubSafe = (est.club || '').replace(/["']/g, '');
        const ok = revelar && (i === est.correctIdx);
        const v = `${est.valor.toLocaleString('es-AR')} esp.`;

        let slotClass = 'order-slot';
        if (revelar) {
            slotClass += ok ? ' ok-reveal' : ' wrong-reveal';
        } else if (orderSelectedIdx === i) {
            slotClass += ' selected';
        }

        // Mobile rank circle (1, 2, 3...)
        let mobileRankCircle = `<div class="order-mobile-circle">${i + 1}</div>`;
        if (revelar) {
            mobileRankCircle = ok 
                ? `<div class="order-mobile-circle ok">✓</div>` 
                : `<div class="order-mobile-circle wrong">✕</div>`;
        } else if (orderSelectedIdx === i) {
            mobileRankCircle = `<div class="order-mobile-circle selected">↕</div>`;
        }

        // Desktop top bar: user explicitly requested:
        // "le sacaria el aerea hd y el posicion 1..2..3 ya que estan los #"
        // So just the #1, #2 badge, and if selected: "Seleccionado"
        const desktopRankTag = `<span class="order-desktop-rank-badge ${i === 0 ? 'gold' : ''}">#${i + 1}</span>`;
        const desktopSelectedTag = (orderSelectedIdx === i) 
            ? `<span class="order-desktop-selected-tag"><i class="ph-fill ph-check-circle"></i> Seleccionado</span>` 
            : '';

        // Desktop action bar (arrows) or reveal badge
        let desktopFooterContent = '';
        if (revelar) {
            desktopFooterContent = `
            <div class="order-desktop-reveal-box ${ok ? 'ok' : 'wrong'}">
                <span>${ok ? '✓ Correcto' : '✕ Incorrecto'}</span>
                <strong>${v}</strong>
            </div>`;
        } else {
            desktopFooterContent = `
            <div class="order-desktop-footer-row">
                <span class="order-swap-label">Posición</span>
                <div class="order-card-arrows">
                    <button type="button" class="order-arrow-btn" ${i === 0 ? 'disabled' : `onclick="moverCardOrden(event, ${i}, -1)"`} title="Mover a la izquierda"><i class="ph-bold ph-caret-left"></i></button>
                    <button type="button" class="order-arrow-btn" ${i === 4 ? 'disabled' : `onclick="moverCardOrden(event, ${i}, 1)"`} title="Mover a la derecha"><i class="ph-bold ph-caret-right"></i></button>
                </div>
            </div>`;
        }

        // Mobile reveal badge
        const mobileRevealBadge = revelar 
            ? `<span class="order-mobile-val-badge ${ok ? 'ok' : 'wrong'}">${v}</span>` 
            : '';

        slotsHTML += `
        <div onclick="${revelar ? '' : `seleccionarFilaOrden(${i})`}" class="${slotClass}">
            <!-- BARRA SUPERIOR DESKTOP -->
            <div class="order-desktop-top-bar">
                ${desktopRankTag}
                ${desktopSelectedTag}
            </div>

            <!-- CÍRCULO NÚMERO MOBILE -->
            ${mobileRankCircle}

            <!-- FOTO / MINIATURA CON ACCIÓN DE ZOOM AL TOCAR -->
            <div class="order-slot-thumb-wrap" onclick="abrirFotoEstadioZoom(event, '${hdUrl}', '${estadioSafe}', '${clubSafe}')" title="Tocá para ampliar la foto">
                <img src="${thumbUrl}" alt="${est.estadio}" class="order-slot-thumb-img" loading="lazy" onerror="this.onerror=null;this.src='${escudoClub}';">
                <span class="order-slot-zoom-hint" title="Ampliar imagen"><i class="ph-bold ph-magnifying-glass-plus"></i></span>
            </div>

            <!-- CUERPO DE INFORMACIÓN -->
            <div class="order-slot-info">
                <strong class="order-slot-title" title="${est.estadio}">${est.estadio}</strong>
                <div class="order-slot-sub">
                    <img src="${escudoClub}" class="order-slot-club-escudo" alt="${est.club}" onerror="this.style.display='none';">
                    <span>${est.club}</span>
                </div>
            </div>

            <!-- BADGE MOBILE REVELADO -->
            ${mobileRevealBadge}

            <!-- PIE DE TARJETA DESKTOP -->
            <div class="order-desktop-card-footer">
                ${desktopFooterContent}
            </div>
        </div>`;
    });

    let timerBarHTML = !revelar 
        ? `<div class="order-timer-wrap"><div id="order-timer-bar"></div></div>` 
        : '';

    // BOTONERAS:
    let botonera = '';
    if (!revelar) {
        botonera = `
        <!-- BOTÓN CONFIRMAR EN DESKTOP CON CONSEJO -->
        <div class="order-desktop-confirm-bar">
            <div class="order-tip-box">
                <i class="ph-fill ph-lightbulb"></i>
                <span><b>Consejo:</b> Mirá el tamaño de las tribunas y bandejas haciendo clic en las fotos.</span>
            </div>
            <button type="button" onclick="procesarResultadoOrden()" class="btn-confirm-order-desktop">
                <i class="ph-fill ph-rocket-launch"></i>
                <span>¡Confirmar orden!</span>
                <i class="ph-bold ph-arrow-right"></i>
            </button>
        </div>

        <!-- BOTÓN CONFIRMAR EN MOBILE -->
        <div class="order-mobile-confirm-bar">
            <button type="button" onclick="procesarResultadoOrden()" class="btn-3d order-btn-confirm-mobile">
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
        <div class="order-record-card">
            <span class="order-record-text">
                <i class="ph-fill ph-check-circle" style="color:#00ff77; font-size:1.1rem; flex-shrink:0;"></i> Récord anotado: <b id="lbl-apodo-guardado" style="color:#00ff77;">${sanitizarHTML(nombreGuardadoOrden)}</b>
            </span>
            <button type="button" onclick="cambiarApodoDesdePantallaFinal()" class="btn-3d secondary order-btn-change-nick">
                <i class="ph-bold ph-pencil-simple"></i> Cambiar
            </button>
        </div>`;

        botonera = `
        <div class="order-endgame-summary-card">
            <div class="order-endgame-score-row">
                <div class="order-endgame-score-col">
                    <div class="order-endgame-score-lbl">Puntaje obtenido</div>
                    <strong class="order-endgame-score-val">${orderPuntosGanados.toLocaleString('es-AR')} <span class="order-endgame-pts-unit">pts</span></strong>
                </div>
                <div class="order-endgame-level-col">
                    <span class="order-endgame-level-tag" style="color:${nivelActual.color};">${nivelActual.emoji} ${nivelActual.nombre}</span>
                </div>
            </div>
            ${cartelGuardadoOrden}
            <div class="order-endgame-actions-row">
                <button type="button" onclick="abrirModalRankingOrden('capacidad')" class="btn-3d btn-endgame-rank order-endgame-btn-action">
                    <img src="medalla-oro.webp" alt="Ranking" class="order-endgame-btn-icon"> Ranking
                </button>
                <button type="button" onclick="iniciarJuegoOrden('capacidad')" class="btn-3d btn-endgame-replay order-endgame-btn-action">
                    <i class="ph-bold ph-arrow-counter-clockwise"></i> Rejugar
                </button>
            </div>
            <button type="button" onclick="abrirModalOrden()" class="btn-3d btn-endgame-back order-endgame-btn-back">
                <i class="ph-bold ph-arrow-left"></i> Volver al menú de desafíos
            </button>
        </div>`;
    }

    body.innerHTML = `
        ${cabeceraHTML}
        ${timerBarHTML}
        ${scaleBarDesktopHTML}
        <div class="order-scroll-container">
            ${subtituloGrillaMobile}
            <div class="order-slots-grid">
                ${slotsHTML}
            </div>
            ${pieGrillaMobile}
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
    pendingScoreType = 'capacidad';
    userStats['partidas_capacidad'] = (userStats['partidas_capacidad'] || 0) + 1;
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
        enviarPuntaje(nombreParaGuardar, orderPuntosGanados, emailParaGuardar, 'capacidad');
    }

    renderJuegoOrden(true);
    const targetOrden = document.getElementById('order-modal-body') || document.getElementById('order-modal');
    if (typeof lanzarConfetti === 'function') {
        setTimeout(() => lanzarConfetti(targetOrden), 250);
    }
}

function guardarScoreOrden(btn) {
    pendingScore = orderPuntosGanados;
    pendingScoreType = 'capacidad';
    if (typeof guardarScorePendiente === 'function') guardarScorePendiente();
    if (btn) {
        btn.innerHTML = `<i class="ph-bold ph-check"></i> ¡Guardado!`;
        btn.disabled = true;
        btn.style.opacity = '0.7';
    }
}
