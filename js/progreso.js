// ========================================================
// 🏆 ESTADIOSVIRTUALES.COM - MÓDULO: PROGRESO Y GAMIFICACIÓN
// ========================================================

var usuarioLogueadoCache = undefined;
window.usuarioLogueadoCache = undefined;
var colaPremiosPendientes = [];
window.colaPremiosPendientes = colaPremiosPendientes;
var xpPremioEnPantalla = 0;
window.xpPremioEnPantalla = xpPremioEnPantalla;

var NIVELES=(function(){
const n=[];
const baseColors=["#cd7f32","#9ca3af","#eab308","#a78bfa","#ff4757","#00e676","#2979ff"];
const baseClasses=["level-pibe","level-volante","level-crack","level-leyenda","level-leyenda","level-leyenda","level-leyenda"];
const baseIcons=["pelota.webp","precision.webp","estrella.webp","medalla.webp","trofeo.webp","coronaoro.webp","fuego.webp","rayo.webp","diamante.webp","estrellaplata.webp","cohete.webp"];
const baseNames=["Amateur","Promesa","Pibe","Reserva","Volante","Enganche","Goleador","Crack","Ídolo","Capitán","Galáctico","Leyenda","Inmortal","Mito","Dios del Fútbol"];
for(let i=0;i<1000;i++){
let xpReq=i===0?0:Math.floor(8000*Math.pow(i,1.5));
let nextXpReq=Math.floor(8000*Math.pow(i+1,1.5));
// ⚽ Curva progresiva con tope real de 99 OVR en el Nivel 100
let ovr = Math.min(99, Math.floor(50 + (Math.sqrt(i / 100) * 49)));
let tierIndex=Math.floor(i/5);
let name=(baseNames[Math.min(tierIndex,baseNames.length-1)])+(i>0?` Lvl ${i}`:"");
let colorIdx=Math.min(Math.floor(i/8),baseColors.length-1);
let emojiIdx=Math.min(Math.floor(i/4),baseIcons.length-1);
const iconUrl = baseIcons[emojiIdx] || "pelota.webp";
const iconHtml = `<img src="${iconUrl}" class="level-icon-img" style="width:2.4em; height:2.4em; object-fit:contain; vertical-align:middle; display:inline-block;" alt="icon">`;
n.push({min:xpReq,max:nextXpReq-1,nombre:name,ovr:ovr,color:baseColors[colorIdx]||"#a78bfa",emoji:iconHtml,iconUrl:iconUrl,cssClass:baseClasses[colorIdx]||"level-leyenda"});
}
n[999].max=Infinity;
return n;
})();

let logrosTabActual='todos';

function obtenerUsuarioLogueado() {
    // Si ya lo leímos en esta sesión, devolvemos la memoria RAM (súper rápido)
    if (usuarioLogueadoCache !== undefined) return usuarioLogueadoCache;
    
    // Si no lo tenemos, lo buscamos en el disco (LocalStorage)
    const stored = localStorage.getItem('ev_user_logged');
    if (stored) {
        try {
            usuarioLogueadoCache = JSON.parse(stored);
        } catch (e) {
            // Si el texto del disco está corrupto, lo borramos de la memoria
            usuarioLogueadoCache = null;
        }
    } else {
        usuarioLogueadoCache = null;
    }
    return usuarioLogueadoCache;
}

function getUserId(){const u=obtenerUsuarioLogueado();return u?u.id:'guest';}
function getPref(key,def){const id=getUserId();return localStorage.getItem(key+'_'+id)||def;}
function setPref(key,val){const id=getUserId();localStorage.setItem(key+'_'+id,val);}
var userStats={};
window.userStats = userStats;

function migrarStatsAntiguos(){
if(!localStorage.getItem('ev_migrated_v2')){
const oldStats=localStorage.getItem('ev_user_stats');
if(oldStats){localStorage.setItem('ev_user_stats_guest',oldStats);const u=obtenerUsuarioLogueado();if(u)localStorage.setItem('ev_user_stats_'+u.id,oldStats);}
const n=localStorage.getItem('ev_custom_nick'),p=localStorage.getItem('ev_user_pos'),th=localStorage.getItem('ev_card_theme'),id=getUserId();
if(n)localStorage.setItem('ev_custom_nick_'+id,n);if(p)localStorage.setItem('ev_user_pos_'+id,p);if(th)localStorage.setItem('ev_card_theme_'+id,th);
localStorage.setItem('ev_migrated_v2','true');
}
}
migrarStatsAntiguos();

function procesarRachaDiaria() {
    if (!userStats.activeDates) userStats.activeDates = [];
    if (userStats.activeDates instanceof Set) userStats.activeDates = Array.from(userStats.activeDates);
    
    // Obtenemos la fecha local exacta del usuario y la normalizamos
    const ahora = new Date();
    // Formato forzado YYYY-MM-DD para evitar desfasajes horarios
    const todayStr = ahora.getFullYear() + '-' + String(ahora.getMonth() + 1).padStart(2, '0') + '-' + String(ahora.getDate()).padStart(2, '0');
    
    const lastLogin = userStats.lastLoginDate;

    if (lastLogin !== todayStr) {
        if (lastLogin) {
            // Parseamos las fechas forzando la medianoche local para un cálculo matemático exacto
            const lastDate = new Date(lastLogin + 'T00:00:00');
            const currDate = new Date(todayStr + 'T00:00:00');
            
            // Calculamos la diferencia en días enteros
            const diffTime = currDate.getTime() - lastDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Jugó ayer y hoy. ¡Suma racha!
                userStats.rachaActual = (userStats.rachaActual || 0) + 1;
            } else if (diffDays > 1) {
                // Se salteó un día o más. Racha reiniciada.
                userStats.rachaActual = 1;
            }
        } else {
            // Primer login en la historia
            userStats.rachaActual = 1;
        }
        
        userStats.lastLoginDate = todayStr;
        if (!userStats.activeDates.includes(todayStr)) {
            userStats.activeDates.push(todayStr);
        }
        guardarStats(); // Inyecta el cambio en localStorage y Supabase
    }
}

function cargarStats(){
const id=getUserId();
const stored=localStorage.getItem('ev_user_stats_'+id);
if(stored){userStats=JSON.parse(stored);}
else{userStats={votosRealizados:0,triviasVistas:0,partidasJugadas:0,partidasVersus:0,partidasGanadas:0,maxScore:0,medallaLocalista:false,rachaActual:1,xpTotal:0,nivelActual:0,guessrPerfecto:false,guessrUnKm:false,ligas5:new Set(),triviasDescubiertas:new Set(),topRanking:false,ordenPerfecto:false,primeraVez:true,vuelosAleatorios:0,ligasExploradas:new Set(),scoreMayor20000:false,scoreMayor10000:false,votadoTodosEstilos:false,nickPersonalizado:false,sesionesTotal:0,rachaMaxima:0,ordenSinFallar:false,guessrSeguidas:0, activeDates: []};}
['ligas5','triviasDescubiertas','ligasExploradas'].forEach(k=>{if(!userStats[k])userStats[k]=new Set();else if(Array.isArray(userStats[k]))userStats[k]=new Set(userStats[k]);else if(!(userStats[k] instanceof Set))userStats[k]=new Set();});
if(!userStats.activeDates) userStats.activeDates = [];
if(userStats.xpTotal===undefined)userStats.xpTotal=0;
if(userStats.maxScore>25000) userStats.maxScore = 25000; // 🛡️ Corrige récords inflados por el acumulador de XP previo
if(userStats.partidasGanadas===undefined) userStats.partidasGanadas = 0;
if(userStats.partidasVersus===undefined) {
    userStats.partidasVersus = Math.max(userStats.partidasGanadas || 0, 0);
} else if(userStats.partidasVersus < (userStats.partidasGanadas || 0)) {
    userStats.partidasVersus = userStats.partidasGanadas || 0;
}
if(userStats.puntosHabilidad===undefined) userStats.puntosHabilidad = 0;
if(!userStats.mejorasJugadores || typeof userStats.mejorasJugadores !== 'object') userStats.mejorasJugadores = {};
userStats.nivelActual=calcularNivelIdx(userStats.xpTotal);
userStats.sesionesTotal=(userStats.sesionesTotal||0)+1;
procesarRachaDiaria();
}
cargarStats();

function guardarStats(){
    const id = getUserId();
    const toSave = {
        ...userStats,
        ligas5: [...(userStats.ligas5 || [])],
        triviasDescubiertas: [...(userStats.triviasDescubiertas || [])],
        ligasExploradas: [...(userStats.ligasExploradas || [])]
    }; 
    localStorage.setItem('ev_user_stats_'+id, JSON.stringify(toSave));

    // --- Sincronización automática, anónima y completa con la nube (CON ESCUDO) ---
    if (typeof bloqueasSincronizacionNube !== 'undefined' && !bloqueasSincronizacionNube && id && id !== 'guest' && userStats && userStats.xpTotal !== undefined) {
        if (typeof sincronizarPerfilSupabase === 'function') {
            sincronizarPerfilSupabase(id, userStats.xpTotal, userStats);
        }
    }
}

function calcularNivelIdx(xp){for(let i=NIVELES.length-1;i>=0;i--){if(xp>=NIVELES[i].min)return i;}return 0;}
function agregarXP(cantidad){
const nivelAntes=calcularNivelIdx(userStats.xpTotal);
userStats.xpTotal+=cantidad;
const nivelDespues=calcularNivelIdx(userStats.xpTotal);
userStats.nivelActual=nivelDespues;
guardarStats();
ancestralHeaderNivel();
if(nivelDespues>nivelAntes)setTimeout(()=>mostrarLevelUp(NIVELES[nivelDespues]),800);
}

function ancestralHeaderNivel(){
const badge=document.getElementById('header-level-badge');
const dot=document.getElementById('header-level-dot');
const label=document.getElementById('header-level-label');
const nivel=NIVELES[calcularNivelIdx(userStats.xpTotal)];
const userPos=getPref('ev_user_pos','DT');
if(badge&&dot&&label){badge.style.display='flex';dot.style.background=nivel.color;dot.style.boxShadow=`0 0 6px ${nivel.color}`;label.innerHTML=nivel.emoji+' '+userPos;}
}

function dispararEfectoLucesGaming() {
    const viejo = document.querySelector('.ev-gaming-fx-overlay');
    if (viejo) viejo.remove();

    const fxContainer = document.createElement('div');
    fxContainer.className = 'ev-gaming-fx-overlay';

    fxContainer.innerHTML = `
        <div class="ev-fx-flash"></div>
        <div class="ev-fx-rays"></div>
        <div class="ev-fx-shockwave"></div>
        <div class="ev-fx-shockwave-2"></div>
    `;

    for (let i = 0; i < 14; i++) {
        const spark = document.createElement('div');
        spark.className = 'ev-fx-spark';
        spark.style.setProperty('--angle', `${i * (360 / 14)}deg`);
        spark.style.animationDelay = `${Math.random() * 0.2}s`;
        fxContainer.appendChild(spark);
    }

    document.body.appendChild(fxContainer);

    setTimeout(() => {
        if (fxContainer) fxContainer.remove();
    }, 3200);
}

function dispararEfectoPackOpening() {
    const viejo = document.querySelector('.ev-pack-lights-overlay');
    if (viejo) viejo.remove();

    const fxContainer = document.createElement('div');
    fxContainer.className = 'ev-pack-lights-overlay';

    fxContainer.innerHTML = `
        <div class="ev-corner-spot top-left"></div>
        <div class="ev-corner-spot top-right"></div>
        <div class="ev-corner-spot bottom-left"></div>
        <div class="ev-corner-spot bottom-right"></div>
        <div class="ev-center-ambient-glow"></div>
    `;

    document.body.appendChild(fxContainer);

    setTimeout(() => {
        if (fxContainer) fxContainer.remove();
    }, 1350);
}

function dispararEfectoLucesDelicadas() {
    const viejo = document.querySelector('.ev-delicate-fx-overlay');
    if (viejo) viejo.remove();

    const fxContainer = document.createElement('div');
    fxContainer.className = 'ev-delicate-fx-overlay';

    fxContainer.innerHTML = `
        <div class="ev-delicate-glow"></div>
        <div class="ev-delicate-vignette"></div>
        <div class="ev-delicate-sparkle s1" style="top:25%; left:28%;"></div>
        <div class="ev-delicate-sparkle s2" style="top:28%; right:28%;"></div>
        <div class="ev-delicate-sparkle s3" style="bottom:32%; left:32%;"></div>
        <div class="ev-delicate-sparkle s4" style="bottom:30%; right:32%;"></div>
    `;

    document.body.appendChild(fxContainer);

    setTimeout(() => {
        if (fxContainer) fxContainer.remove();
    }, 2800);
}
window.dispararEfectoLucesDelicadas = dispararEfectoLucesDelicadas;

function mostrarLevelUp(nivel){
const overlay=document.getElementById('levelup-overlay');
document.getElementById('levelup-icon').innerHTML=`<img src="${nivel.iconUrl}" style="width:200px; height:200px; object-fit:contain; filter:drop-shadow(0 0 20px ${nivel.color});">`;
document.getElementById('levelup-title').textContent='¡Subiste de nivel!';
document.getElementById('levelup-sub').innerHTML=`Ahora sos <b style="color:${nivel.color};">${nivel.nombre}</b>`;
overlay.classList.add('active');
dispararEfectoLucesGaming();
setTimeout(() => { if (typeof lanzarConfetti === 'function') lanzarConfetti('oro'); }, 200);
}
function cerrarLevelUp(){
    document.getElementById('levelup-overlay').classList.remove('active');
    setTimeout(() => {
        if (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) {
            comprobarRecompensaNivel(userStats.nivelActual);
        }
    }, 350);
}

window.mostrarModalPremio = function(data) {
    const overlay = document.getElementById('reward-overlay');
    if (!overlay) return;

    xpPremioEnPantalla = Number(data.xp) || 0;

    document.getElementById('reward-icon').innerHTML = data.icono;
    document.getElementById('reward-title').textContent = data.titulo;
    document.getElementById('reward-sub').textContent = data.subtitulo;
    document.getElementById('reward-pill-label').textContent = data.botinNombre;
    document.getElementById('reward-pill-xp').textContent = `+${xpPremioEnPantalla.toLocaleString('es-AR')} XP`;
    
    const btn = document.getElementById('reward-claim-btn');
    if (btn) {
        btn.innerHTML = `<span>¡Reclamar Premio!</span> <img src="cohete.webp" alt="Cohete" class="reward-btn-cohete">`;
    }

    overlay.style.display = 'flex';
    overlay.classList.add('active');
    lanzarConfetti();
};

window.cerrarModalPremio = function() {
    const overlay = document.getElementById('reward-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
    }

    if (xpPremioEnPantalla > 0) {
        agregarXP(xpPremioEnPantalla);
        showToast(`¡+${xpPremioEnPantalla.toLocaleString('es-AR')} XP acreditados a tu cuenta! 🚀`, 'ph-sparkle', 'success');
        xpPremioEnPantalla = 0;
    }

    if (colaPremiosPendientes.length > 0) {
        const siguiente = colaPremiosPendientes.shift();
        setTimeout(() => window.mostrarModalPremio(siguiente), 400);
    }
};

async function verificarPremiosPendientes() {
    if (!supabaseClient) return;
    const idUsuario = getUserId();
    const u = obtenerUsuarioLogueado();
    const miNombre = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : '')).trim();
    if (!miNombre || miNombre === 'Jugador' || miNombre === 'Invitado') return;
    const miNombreLower = miNombre.toLowerCase();

    const nivelIdx = calcularNivelIdx(userStats.xpTotal);
    const nivelActual = NIVELES[nivelIdx];
    const nivelSig = NIVELES[Math.min(nivelIdx + 1, NIVELES.length - 1)];
    const spanNivel = (nivelSig.min === Infinity ? 12000 : (nivelSig.min - nivelActual.min)) || 8000;

    // 1. 📅 RECOMPENSA RETO DIARIO (10% DEL NIVEL AL #1 DE AYER)
    try {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const fechaAyerStr = ayer.getFullYear() + '-' + String(ayer.getMonth() + 1).padStart(2, '0') + '-' + String(ayer.getDate()).padStart(2, '0');
        const claveDiarioAyer = 'diario_' + fechaAyerStr;
        const storageDiarioKey = `ev_premio_diario_${fechaAyerStr}_${idUsuario}`;

        if (!localStorage.getItem(storageDiarioKey)) {
            const { data: rankingAyer, error: errDiario } = await supabaseClient
                .from('ranking')
                .select('nombre, puntaje')
                .eq('juego', claveDiarioAyer)
                .order('puntaje', { ascending: false })
                .limit(50);

            if (!errDiario && rankingAyer && rankingAyer.length > 0) {
                const mejorPorJugador = {};
                rankingAyer.forEach(row => {
                    const n = (row.nombre || '').trim();
                    const p = row.puntaje || 0;
                    const k = n.toLowerCase();
                    if (n && (!mejorPorJugador[k] || p > mejorPorJugador[k].puntaje)) {
                        mejorPorJugador[k] = { nombre: n, puntaje: p };
                    }
                });
                const tablaAyer = Object.values(mejorPorJugador).sort((a, b) => b.puntaje - a.puntaje);

                if (tablaAyer.length > 0 && tablaAyer[0].puntaje > 0 && tablaAyer[0].nombre.trim().toLowerCase() === miNombreLower) {
                    const xpPremio = Math.max(400, Math.round(spanNivel * 0.10));
                    localStorage.setItem(storageDiarioKey, '1');

                    colaPremiosPendientes.push({
                        icono: '<img src="medalla-oro.webp" class="reward-medal-img" alt="Medalla Oro">',
                        titulo: '¡Rey del Reto Diario!',
                        subtitulo: `Ayer coronaste el puesto #1 con ${tablaAyer[0].puntaje.toLocaleString('es-AR')} puntos. Tu precisión aérea no tuvo rival.`,
                        botinNombre: 'Premio',
                        xp: xpPremio
                    });
                }
            }
        }
    } catch (e) {
        console.warn("Aviso en verificación de premio diario:", e);
    }

    // 2. ⚔️ RECOMPENSA PODIO SEMANAL 1 VS 1 (1º: 40%, 2º: 30%, 3º: 20% DEL NIVEL)
    try {
        const ahora = new Date();
        const diaSemana = ahora.getDay();
        const diasHaciaAtras = diaSemana === 0 ? 7 : diaSemana;
        
        // Domingo de cierre exacto de la semana pasada (23:59:59.999)
        const domingoCierre = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - diasHaciaAtras, 23, 59, 59, 999);
        // Lunes de inicio exacto de la semana pasada (00:00:00.000)
        const lunesInicio = new Date(domingoCierre.getFullYear(), domingoCierre.getMonth(), domingoCierre.getDate() - 6, 0, 0, 0, 0);

        const fechaSemanaStr = `${lunesInicio.getFullYear()}-${String(lunesInicio.getMonth() + 1).padStart(2, '0')}-${String(lunesInicio.getDate()).padStart(2, '0')}`;
        const storageSemanaKey = `ev_premio_semanal_${fechaSemanaStr}_${idUsuario}`;

        if (!localStorage.getItem(storageSemanaKey)) {
            const { data: victoriasRaw, error: errSemana } = await supabaseClient
                .from('victorias_versus')
                .select('nombre')
                .gte('created_at', lunesInicio.toISOString())
                .lte('created_at', domingoCierre.toISOString());

            if (!errSemana && victoriasRaw && victoriasRaw.length > 0) {
                const conteo = {};
                victoriasRaw.forEach(row => {
                    const n = (row.nombre || '').trim();
                    if (n) {
                        const k = n.toLowerCase();
                        if (!conteo[k]) conteo[k] = { nombre: n, victorias: 0 };
                        conteo[k].victorias++;
                    }
                });
                const podio = Object.values(conteo).sort((a, b) => b.victorias - a.victorias).slice(0, 3);
                const puesto = podio.findIndex(p => p.nombre.trim().toLowerCase() === miNombreLower && p.victorias > 0);

                if (puesto !== -1) {
                    const porcentajes = [0.40, 0.30, 0.20];
                    const mult = porcentajes[puesto];
                    const xpPremio = Math.max(800, Math.round(spanNivel * mult));
                    localStorage.setItem(storageSemanaKey, '1');

                    const configs = [
                        {
                            icono: '<img src="medalla-oro.webp" class="reward-medal-img" alt="Oro">',
                            titulo: '¡Campeón de la Semana!',
                            subtitulo: 'Te consagraste en el puesto #1 del 1 vs 1 semanal. La gloria es tuya.',
                            botin: 'Premio'
                        },
                        {
                            icono: '<img src="medalla-plata.webp" class="reward-medal-img" alt="Plata">',
                            titulo: '¡Subcampeón Semanal!',
                            subtitulo: 'Peleaste hasta el último minuto y conquistaste el puesto #2 del podio.',
                            botin: 'Premio'
                        },
                        {
                            icono: '<img src="medalla-bronce.webp" class="reward-medal-img" alt="Bronce">',
                            titulo: '¡Podio de Bronce!',
                            subtitulo: 'Te metiste en el puesto #3 entre los mejores duelistas de la semana.',
                            botin: 'Premio'
                        }
                    ];

                    const cfg = configs[puesto];
                    colaPremiosPendientes.push({
                        icono: cfg.icono,
                        titulo: cfg.titulo,
                        subtitulo: cfg.subtitulo,
                        botinNombre: cfg.botin,
                        xp: xpPremio
                    });
                }
            }
        }
    } catch (e) {
        console.warn("Aviso en verificación de premio semanal:", e);
    }

    if (colaPremiosPendientes.length > 0) {
        const primero = colaPremiosPendientes.shift();
        setTimeout(() => window.mostrarModalPremio(primero), 800);
    }
}

/* ========================================================
   🎉 MOTOR PROFESIONAL DE CELEBRACIONES DE ESTADIO (CANVAS)
   Papel picado de cancha, serpentinas y estrellas doradas
   con física 3D real, volteo aerodinámico y 60 FPS fluidos.
   ======================================================== */
(function() {
    let activeCanvas = null;
    let activeCtx = null;
    let particles = [];
    let animFrameId = null;

    // Paletas temáticas de alta gama
    const PALETAS = {
        estadio: ['#FFD700', '#FFFFFF', '#00E676', '#2979FF', '#FF1744', '#00F5D4', '#FFF59D', '#00C853', '#F8FAFC'],
        oro: ['#FFE082', '#FFD700', '#FFC107', '#FFA000', '#FFF8E1', '#FFFFFF', '#F59E0B'],
        gol: ['#00E676', '#FFD700', '#FFFFFF', '#00C853', '#69F0AE', '#2979FF']
    };

    function obtenerOCrearCanvas() {
        if (!activeCanvas || !document.body.contains(activeCanvas)) {
            activeCanvas = document.createElement('canvas');
            activeCanvas.id = 'ev-celebration-canvas';
            activeCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999999;';
            document.body.appendChild(activeCanvas);
        }
        ajustarTamanoCanvas();
        activeCtx = activeCanvas.getContext('2d');
        return { canvas: activeCanvas, ctx: activeCtx };
    }

    function ajustarTamanoCanvas() {
        if (!activeCanvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        activeCanvas.width = window.innerWidth * dpr;
        activeCanvas.height = window.innerHeight * dpr;
    }

    window.addEventListener('resize', () => {
        if (activeCanvas && particles.length > 0) ajustarTamanoCanvas();
    });

    function dibujarEstrella(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    function crearParticula(x, y, vx, vy, color, tipo = 'strip') {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        return {
            x: x * dpr,
            y: y * dpr,
            vx: vx * dpr,
            vy: vy * dpr,
            color: color,
            tipo: tipo, // 'strip' (papelito rectangular de cancha), 'ribbon' (serpentina), 'star' (estrella de campeón), 'circle' (disco foil)
            w: (tipo === 'ribbon' ? (3.5 + Math.random() * 2) : (tipo === 'star' ? (5.5 + Math.random() * 3.5) : (5.5 + Math.random() * 3.5))) * dpr,
            h: (tipo === 'ribbon' ? (20 + Math.random() * 14) : (tipo === 'strip' ? (12 + Math.random() * 8) : (5.5 + Math.random() * 3.5))) * dpr,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5.5,
            wobble: Math.random() * 10,
            wobbleSpeed: 0.06 + Math.random() * 0.08,
            gravity: (0.16 + Math.random() * 0.09) * dpr,
            drag: 0.984,
            opacity: 1,
            fadeSpeed: 0.003 + Math.random() * 0.0028
        };
    }

    function animar() {
        if (!activeCanvas || !activeCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Cinemática con resistencia aerodinámica
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx + Math.sin(p.wobble) * 1.5 * dpr;
            p.y += p.vy;

            // Volteo 3D y oscilación aerodinámica
            p.rotation += p.rotationSpeed;
            p.wobble += p.wobbleSpeed;
            p.opacity -= p.fadeSpeed;

            // Limpieza al salir de la pantalla o desvanecerse
            if (p.y > activeCanvas.height + 60 || p.opacity <= 0 || p.x < -100 || p.x > activeCanvas.width + 100) {
                particles.splice(i, 1);
                continue;
            }

            // Renderizado 3D
            activeCtx.save();
            activeCtx.translate(p.x, p.y);
            activeCtx.rotate((p.rotation * Math.PI) / 180);
            
            // Simulación de volteo sobre el eje Z/Y (ondulación tridimensional de papel)
            const scaleY = Math.cos(p.wobble);
            activeCtx.scale(1, scaleY);
            activeCtx.globalAlpha = Math.max(0, p.opacity);
            activeCtx.fillStyle = p.color;

            if (p.tipo === 'star') {
                dibujarEstrella(activeCtx, 0, 0, 5, p.w * 1.4, p.w * 0.58);
            } else if (p.tipo === 'circle') {
                activeCtx.beginPath();
                activeCtx.arc(0, 0, p.w * 0.65, 0, Math.PI * 2);
                activeCtx.fill();
            } else {
                activeCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }

            activeCtx.restore();
        }

        if (particles.length > 0) {
            animFrameId = requestAnimationFrame(animar);
        } else {
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = null;
            if (activeCanvas) {
                activeCanvas.remove();
                activeCanvas = null;
                activeCtx = null;
            }
        }
    }

    function dispararCanon(origenX, origenY, anguloBaseDeg, cantidad = 45, paleta = PALETAS.estadio) {
        obtenerOCrearCanvas();
        for (let i = 0; i < cantidad; i++) {
            const angulo = (anguloBaseDeg + (Math.random() - 0.5) * 44) * (Math.PI / 180);
            const velocidad = 16 + Math.random() * 16;
            const vx = Math.cos(angulo) * velocidad;
            const vy = -Math.sin(angulo) * velocidad;
            const color = paleta[Math.floor(Math.random() * paleta.length)];
            
            const rand = Math.random();
            let tipo = 'strip'; // 65% tiras de papel
            if (rand < 0.15) tipo = 'ribbon'; // 15% serpentinas
            else if (rand < 0.28) tipo = 'star'; // 13% estrellas
            else if (rand < 0.35) tipo = 'circle'; // 7% círculos

            particles.push(crearParticula(origenX, origenY, vx, vy, color, tipo));
        }
        if (!animFrameId) {
            animFrameId = requestAnimationFrame(animar);
        }
    }

    function dispararCascadaSuperior(cantidad = 45, paleta = PALETAS.estadio) {
        obtenerOCrearCanvas();
        const w = window.innerWidth;
        for (let i = 0; i < cantidad; i++) {
            const x = Math.random() * w;
            const y = -20 - Math.random() * 70;
            const vx = (Math.random() - 0.5) * 4;
            const vy = 1.8 + Math.random() * 4.5;
            const color = paleta[Math.floor(Math.random() * paleta.length)];
            const rand = Math.random();
            const tipo = rand < 0.35 ? 'star' : (rand < 0.55 ? 'ribbon' : 'strip');
            particles.push(crearParticula(x, y, vx, vy, color, tipo));
        }
        if (!animFrameId) {
            animFrameId = requestAnimationFrame(animar);
        }
    }

    window.lanzarConfetti = function(modoOpciones = 'estadio') {
        const modo = (typeof modoOpciones === 'string') ? modoOpciones.toLowerCase() : 'estadio';
        const paleta = PALETAS[modo] || PALETAS.estadio;

        const w = window.innerWidth;
        const h = window.innerHeight;

        if (modo === 'gol' || modo === 'acierto') {
            const cx = w * 0.5;
            const cy = h * 0.55;
            for (let i = 0; i < 55; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 6 + Math.random() * 15;
                particles.push(crearParticula(cx, cy, Math.cos(ang) * spd, Math.sin(ang) * spd - 3, paleta[Math.floor(Math.random() * paleta.length)], Math.random() < 0.3 ? 'star' : 'strip'));
            }
            obtenerOCrearCanvas();
            if (!animFrameId) animFrameId = requestAnimationFrame(animar);
            return;
        }

        // FIESTA DE ESTADIO: Cañones dobles desde las esquinas inferiores + lluvia aérea sostenida
        dispararCanon(w * 0.08, h * 0.92, 65, 45, paleta);
        dispararCanon(w * 0.92, h * 0.92, 115, 45, paleta);

        setTimeout(() => {
            dispararCanon(w * 0.22, h * 0.88, 75, 25, paleta);
            dispararCanon(w * 0.78, h * 0.88, 105, 25, paleta);
            dispararCascadaSuperior(35, paleta);
        }, 260);
    };

    window.confetti = function(opts = {}) {
        const count = opts.particleCount || 40;
        const ox = (opts.origin && opts.origin.x !== undefined) ? opts.origin.x * window.innerWidth : window.innerWidth * 0.5;
        const oy = (opts.origin && opts.origin.y !== undefined) ? opts.origin.y * window.innerHeight : window.innerHeight * 0.6;
        const spread = opts.spread || 70;
        const paleta = opts.colors || PALETAS.estadio;

        obtenerOCrearCanvas();
        for (let i = 0; i < count; i++) {
            const angulo = (90 + (Math.random() - 0.5) * spread) * (Math.PI / 180);
            const velocidad = 10 + Math.random() * 14;
            const vx = Math.cos(angulo) * velocidad;
            const vy = -Math.sin(angulo) * velocidad;
            const color = paleta[Math.floor(Math.random() * paleta.length)];
            const tipo = Math.random() < 0.25 ? 'star' : 'strip';
            particles.push(crearParticula(ox, oy, vx, vy, color, tipo));
        }
        if (!animFrameId) {
            animFrameId = requestAnimationFrame(animar);
        }
    };
})();


function showToast(msg, icon = 'ph-check-circle', tipo = '') {
    const c = document.getElementById('toast-container');
    if (!c) return;

    // 🛡️ Si es un toast de entrenamiento, remover cualquier toast de entrenamiento previo
    if (tipo && tipo.includes('toast-entrenamiento')) {
        const viejos = c.querySelectorAll('.toast-entrenamiento');
        viejos.forEach(v => v.remove());
    }

    // 🛡️ Límite anti-apilamiento global: máximo 2 toasts en pantalla al mismo tiempo
    while (c.children.length >= 2) {
        c.firstElementChild.remove();
    }

    const t = document.createElement('div');
    t.className = 'toast' + (tipo ? ' ' + tipo : '');
    t.innerHTML = `<i class="ph-fill ${icon}" style="font-size:1.3rem;color:${tipo && tipo.includes('danger') ? 'var(--danger-color)' : 'var(--accent-color)'};flex-shrink:0;"></i> <span>${msg}</span>`;
    c.appendChild(t);

    const duracion = (tipo && tipo.includes('toast-entrenamiento')) ? 1600 : 2800;

    const timer = setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(20px)';
        t.style.transition = 'all .25s ease';
        setTimeout(() => t.remove(), 260);
    }, duracion);

    t.onclick = () => {
        clearTimeout(timer);
        t.remove();
    };
}

function toggleTheme(){
const html=document.documentElement,icon=document.getElementById('theme-icon');
if(html.getAttribute('data-theme')==='dark'){html.setAttribute('data-theme','light');icon.className='ph-duotone ph-sun';localStorage.setItem('ev_theme','light');}
else{html.setAttribute('data-theme','dark');icon.className='ph-duotone ph-moon';localStorage.setItem('ev_theme','dark');}
}
(function(){
const saved=localStorage.getItem('ev_theme');
if(saved==='light'){document.documentElement.setAttribute('data-theme','light');document.addEventListener('DOMContentLoaded',()=>{const i=document.getElementById('theme-icon');if(i)i.className='ph-duotone ph-sun';});}
})();


// Exposición global explícita
window.NIVELES = NIVELES;
window.userStats = userStats;
window.obtenerUsuarioLogueado = obtenerUsuarioLogueado;
window.getUserId = getUserId;
window.getPref = getPref;
window.setPref = setPref;
window.cargarStats = cargarStats;
window.guardarStats = guardarStats;
window.calcularNivelIdx = calcularNivelIdx;
window.agregarXP = agregarXP;
window.ancestralHeaderNivel = ancestralHeaderNivel;
window.mostrarLevelUp = mostrarLevelUp;
window.cerrarLevelUp = cerrarLevelUp;
window.mostrarModalPremio = mostrarModalPremio;
window.cerrarModalPremio = cerrarModalPremio;
window.verificarPremiosPendientes = verificarPremiosPendientes;
window.lanzarConfetti = lanzarConfetti;
window.showToast = showToast;
window.toggleTheme = toggleTheme;
