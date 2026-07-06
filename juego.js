// ========================================================
// CONEXIÓN OFICIAL CON SUPABASE (CON BLINDAJE ANTI-CRASH)
// ========================================================
const SUPABASE_URL = "https://prqqhxyajyhrlqynpocd.supabase.co";
const SUPABASE_KEY = "sb_publishable_7bkpzmqDo95a7noCy-JE3A_C1HDVQ22"; 
let supabaseClient = null;



// Memoria global para guardar los promedios de Supabase
let promediosSupabase = {};
let bloqueasSincronizacionNube = true;
let guessrHistorialCoordenadas = [];

// Función para descargar los promedios de la nube
async function cargarPromediosSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('promedios_estadios')
            .select('*');
            
        if (!error && data) {
            data.forEach(row => {
                promediosSupabase[row.estadio] = {
                    promedio: row.promedio_real,
                    total: row.total_votos
                };
            });
            console.log("¡Promedios en vivo cargados desde Supabase!");
        }
    } catch (e) {
        console.error("Error al traer promedios de Supabase:", e);
    }
}

// Función para sincronizar la TOTALIDAD absoluta de la cuenta (Estadísticas + Identidad Visual)
async function sincronizarPerfilSupabase(idUsuario, exp, stats) {
    if (!supabaseClient || !idUsuario || idUsuario === 'guest') return;
    try {
        // Armamos el paquete masivo con estadísticas y toda la personalización de la carta
        const datosParaNube = {
            ...stats,
            ligas5: [...(stats.ligas5 || [])],
            triviasDescubiertas: [...(stats.triviasDescubiertas || [])],
            ligasExploradas: [...(stats.ligasExploradas || [])],
            activeDates: stats.activeDates || [],
            
            // Guardamos toda tu identidad estética en la base de datos
            preferencias: {
                user_pos: getPref('ev_user_pos', 'DT'),
                card_theme: getPref('ev_card_theme', 'arg'),
                custom_nick: getPref('ev_custom_nick', ''),
                avatar_hair: getPref('ev_avatar_hair', 'short'),
                avatar_shirt: getPref('ev_avatar_shirt', 'solid'),
                avatar_color: getPref('ev_avatar_color', '#00e676'),
                avatar_color2: getPref('ev_avatar_color2', '#ffffff'),
                avatar_num: getPref('ev_avatar_num', '10'),
                avatar_logo: getPref('ev_avatar_logo', 'ev')
            }
        };

        const { error } = await supabaseClient
            .from('perfiles')
            .upsert({ 
                id_usuario: idUsuario, 
                experiencia: exp,
                datos_juego: datosParaNube, 
                updated_at: new Date()
            }, { onConflict: 'id_usuario' });
            
        if (error) {
            console.error("No se pudo sincronizar el perfil en la nube:", error);
        } else {
            console.log("¡Cuenta unificada (Progreso + Avatar + Apodo) guardada con éxito!");
        }
    } catch (e) {
        console.error("Error aislado al sincronizar perfil:", e);
    }
}

// Función para descargar la TOTALIDAD de la cuenta desde la nube
async function cargarProgresoDesdeSupabase() {
    const id = getUserId();
    if (!supabaseClient || !id || id === 'guest') return;

    try {
        const { data, error } = await supabaseClient
            .from('perfiles')
            .select('experiencia, datos_juego')
            .eq('id_usuario', id);

        if (error) {
            console.error("Error al descargar progreso de la nube:", error);
            return;
        }

        if (data && data.length > 0) {
            const perfilNube = data[0];

            // Sincronizamos la experiencia principal
            if (perfilNube.experiencia > userStats.xpTotal || userStats.primeraVez) {
                userStats.xpTotal = perfilNube.experiencia;
                userStats.maxScore = Math.max(userStats.maxScore || 0, perfilNube.experiencia);
                userStats.nivelActual = calcularNivelIdx(userStats.xpTotal);
                userStats.primeraVez = false;
            }

            // Sincronizamos el JSON masivo de datos
            if (perfilNube.datos_juego) {
                const dj = perfilNube.datos_juego;
                
                // 1. Restauramos estadísticas, logros y medallas
                userStats = {
                    ...userStats,
                    ...dj,
                    ligas5: new Set(dj.ligas5 || []),
                    triviasDescubiertas: new Set(dj.triviasDescubiertas || []),
                    ligasExploradas: new Set(dj.ligasExploradas || []),
                    activeDates: dj.activeDates || []
                };
                procesarRachaDiaria();

                // 2. Restauramos toda tu personalización visual en el dispositivo
                if (dj.preferencias) {
                    const p = dj.preferencias;
                    setPref('ev_user_pos', p.user_pos || 'DT');
                    setPref('ev_card_theme', p.card_theme || 'arg');
                    setPref('ev_custom_nick', p.custom_nick || '');
                    setPref('ev_avatar_hair', p.avatar_hair || 'short');
                    setPref('ev_avatar_shirt', p.with_shirt || p.avatar_shirt || 'solid');
                    setPref('ev_avatar_color', p.avatar_color || '#00e676');
                    setPref('ev_avatar_color2', p.avatar_color2 || '#ffffff');
                    setPref('ev_avatar_num', p.avatar_num || '10');
                    setPref('ev_avatar_logo', p.avatar_logo || 'ev');
                }
            }

            // Guardamos localmente para impactar los cambios de inmediato
            localStorage.setItem('ev_user_stats_' + id, JSON.stringify({
                ...userStats,
                ligas5: [...userStats.ligas5],
                triviasDescubiertas: [...userStats.triviasDescubiertas],
                ligasExploradas: [...userStats.ligasExploradas]
            }));

            renderizarBotonLogin();
            if (typeof ancestralHeaderNivel === 'function') ancestralHeaderNivel();
            console.log("¡Sincronización completa finalizada! Identidad y progreso restaurados.");
        }
    } catch (e) {
        console.error("Error aislado al descargar progreso:", e);
    }
}

// Función universal para mandar puntajes a Supabase
// Función universal y segura para mandar puntajes a Supabase (Modo Híbrido)
// Función universal para mandar puntajes a Supabase (Modo Híbrido)
async function enviarPuntaje(nombreJugador, puntosLogrados, emailJugador, modoJuego) {
    if (!supabaseClient) {
        console.error("No se pudo mandar el puntaje: Supabase no está activo.");
        return;
    }
    try {
        if (modoJuego === 'guessr') {
            // MODO GUESSR GLOBAL
            console.log("📡 Solicitando verificación de partida e inserción segura en el servidor...");
            const { data: puntajeVerificado, error } = await supabaseClient.rpc('guardar_partida_segura', {
                p_nombre_jugador: nombreJugador,
                p_email_jugador: emailJugador || '',
                p_modo_juego: modoJuego,
                p_rondas_json: guessrHistorialCoordenadas
            });

            // Paracaídas: si el servidor estricto falla, forzamos el guardado clásico
            if (error) {
                await supabaseClient.from('ranking').insert([
                    { nombre: nombreJugador, puntaje: puntosLogrados, email: emailJugador, juego: modoJuego }
                ]);
            } else {
                console.log(`¡Puntaje verificado por el servidor (+${puntajeVerificado} Pts) guardado con éxito!`);
            }
        } else if (modoJuego.startsWith('guessr_')) {
            // 🏆 PUNTAJE DENTRO DE UNA LIGA PRIVADA (NO DUPLICA JUGADORES)
            // 1. Buscamos si el jugador ya está fichado en esta liga (Ej: si está con 0 puntos)
            const { data: filaExistente, error: errorSelect } = await supabaseClient
                .from('ranking')
                .select('puntaje')
                .eq('juego', modoJuego)
                .eq('nombre', nombreJugador)
                .limit(1);

            if (filaExistente && filaExistente.length > 0) {
                // Ya existe en la liga. Vemos si superó su propio récord.
                const mejorPrevio = filaExistente[0].puntaje || 0;

                if (puntosLogrados > mejorPrevio) {
                    // ¡REEMPLAZA LOS PUNTOS ANTERIORES! (No hace una fila nueva)
                    await supabaseClient.from('ranking')
                        .update({ puntaje: puntosLogrados, email: emailJugador })
                        .eq('juego', modoJuego)
                        .eq('nombre', nombreJugador);
                    console.log(`🏆 ¡Nuevo récord en liga (${puntosLogrados} pts) ha reemplazado al viejo!`);
                }
            } else {
                // Nunca jugó ni fue fichado, lo insertamos por primera vez
                await supabaseClient.from('ranking').insert([
                    { nombre: nombreJugador, puntaje: puntosLogrados, email: emailJugador, juego: modoJuego }
                ]);
            }
        } else {
            // OTROS MINIJUEGOS (Orden Capacidad/Antigüedad)
            await supabaseClient.from('ranking').insert([
                { nombre: nombreJugador, puntaje: puntosLogrados, email: emailJugador, juego: modoJuego }
            ]);
        }
    } catch (err) {
        console.error("Error inesperado de conexión:", err);
    }
}
// ========================================================

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const baseSpreadsheetUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vSOscYU1T4flrTrs9jJMa44jHnsXIOMcPUTBm0ZRycgZZL01yEAky4iuhwZvrDgNa7zterjPY7ZujzG/pub";
const scriptUrlVotos="https://script.google.com/macros/s/AKfycbzNf5iOxpagt-jwwzLD8pFHs0cWWWSRo5ZMjL-lDhbAo75eOLrICodzeBNjsJwykEt6VKlKtoqL__2/exec";
const scriptUrlRanking="https://script.google.com/macros/s/AKfycbwu-fuc2HKntX6rWWWSRo5ZMjL-lDhbAo75eOLrICodzeBNjsJwykEt6VKlKtoqL__2/exec";
const scriptUrlCapacidad="https://script.google.com/macros/s/AKfycbxIME-M84DhBy3oG4-Y-dtHRhSoTX1G-l476biCk0tgtuMNeM0eHp6-u550yv7h1nkJwQ/exec";
const scriptUrlAntiguedad="https://script.google.com/macros/s/AKfycbxlVAmtUZR6V7QZ_1rrykmznsZEolHQ_Sc4SigYI78xBY6zT5f5DSRmNjpvCGBDsiKoMw/exec";
const scriptUrlUsuarios="https://script.google.com/macros/s/AKfycby4GOySVikjCt7vtaNcKMI8Xzo6sxrfmhRwtWS3h2OabxJEMbtIA_Q-lukMRwrZu2HztA/exec";
const GOOGLE_CLIENT_ID="768963974490-llof395lvphcmmebbkm2ktrn08lffp3a.apps.googleusercontent.com";

const ESCUDOS_MAP = {
  'ev': 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.png',
  'ar': 'https://flagcdn.com/w80/ar.png',
  'br': 'https://flagcdn.com/w80/br.png',
  'es': 'https://flagcdn.com/w80/es.png',
  'it': 'https://flagcdn.com/w80/it.png',
  'fr': 'https://flagcdn.com/w80/fr.png',
  'de': 'https://flagcdn.com/w80/de.png',
  'gb-eng': 'https://flagcdn.com/w80/gb-eng.png',
  'pt': 'https://flagcdn.com/w80/pt.png',
  'uy': 'https://flagcdn.com/w80/uy.png',
  'co': 'https://flagcdn.com/w80/co.png',
  'mx': 'https://flagcdn.com/w80/mx.png',
  'cl': 'https://flagcdn.com/w80/cl.png',
  'nl': 'https://flagcdn.com/w80/nl.png',
  'be': 'https://flagcdn.com/w80/be.png',
  'hr': 'https://flagcdn.com/w80/hr.png',
  'us': 'https://flagcdn.com/w80/us.png',
  'jp': 'https://flagcdn.com/w80/jp.png',
  'can': 'https://flagcdn.com/w80/ca.png',
  'mar': 'https://flagcdn.com/w80/ma.png',
  'sen': 'https://flagcdn.com/w80/sn.png',
  'kor': 'https://flagcdn.com/w80/kr.png',
  'aus': 'https://flagcdn.com/w80/au.png',
  'sui': 'https://flagcdn.com/w80/ch.png',
  'ecu': 'https://flagcdn.com/w80/ec.png',
  'per': 'https://flagcdn.com/w80/pe.png',
  'den': 'https://flagcdn.com/w80/dk.png',
  'srb': 'https://flagcdn.com/w80/rs.png',
  'pol': 'https://flagcdn.com/w80/pl.png',
  'wal': 'https://flagcdn.com/w80/gb-wls.png',
  'swe': 'https://flagcdn.com/w80/se.png',
  'civ': 'https://flagcdn.com/w80/ci.png',
  'cmr': 'https://flagcdn.com/w80/cm.png',
  'gha': 'https://flagcdn.com/w80/gh.png',
  'nga': 'https://flagcdn.com/w80/ng.png',
  'ksa': 'https://flagcdn.com/w80/sa.png',
  'irn': 'https://flagcdn.com/w80/ir.png',
  'egy': 'https://flagcdn.com/w80/eg.png',
  'alg': 'https://flagcdn.com/w80/dz.png',
  'tun': 'https://flagcdn.com/w80/tn.png',
  'mli': 'https://flagcdn.com/w80/ml.png',
  'qat': 'https://flagcdn.com/w80/qa.png',
  'par': 'https://flagcdn.com/w80/py.png',
  'ven': 'https://flagcdn.com/w80/ve.png',
  'bol': 'https://flagcdn.com/w80/bo.png',
  'crc': 'https://flagcdn.com/w80/cr.png',
  'pan': 'https://flagcdn.com/w80/pa.png',
  'jam': 'https://flagcdn.com/w80/jm.png',
  'nzl': 'https://flagcdn.com/w80/nz.png'
};

function generarAvatarHTML(pelo, camisa, colorCamisa, numero, colorCamisa2) {
    let peloHTML = `<div class="ac-hair-base" ${pelo==='bald'?'style="display:none;"':''}></div>`;
    if(pelo === 'spiky') peloHTML += `<div class="ac-hair-spike"></div><div class="ac-hair-spike2"></div>`;
    else if(pelo === 'long') peloHTML += `<div style="position:absolute;top:10px;left:-10%;width:120%;height:45px;background:#4a2e1b;border-radius:20px;z-index:-1;"></div>`;
    else if(pelo === 'ponytail') peloHTML += `<div style="position:absolute;top:5px;right:-15px;width:25px;height:40px;background:#4a2e1b;border-radius:50%;z-index:-1;transform:rotate(-20deg);"></div>`;
    let acHead = `<div class="ac-avatar"><div class="ac-ear left"></div><div class="ac-ear right"></div><div class="ac-head-base">${peloHTML}<div class="ac-eye left"></div><div class="ac-eye right"></div><div class="ac-nose"></div><div class="ac-mouth"></div></div></div>`;
    let shirtBg = '';
    let mainColor = colorCamisa || '#00e676';
    let secColor = colorCamisa2 || '#ffffff';
    if(camisa === 'striped') shirtBg = `background: repeating-linear-gradient(90deg, ${mainColor} 0, ${mainColor} 12px, ${secColor} 12px, ${secColor} 24px);`;
    else if(camisa === 'band') shirtBg = `background: linear-gradient(180deg, ${mainColor} 35%, ${secColor} 35%, ${secColor} 65%, ${mainColor} 65%);`;
    else if(camisa === 'diagonal') shirtBg = `background: linear-gradient(135deg, ${mainColor} 40%, ${secColor} 40%, ${secColor} 60%, ${mainColor} 60%);`;
    else shirtBg = `background: linear-gradient(135deg, ${mainColor} 0%, color-mix(in srgb, ${mainColor} 40%, #111) 100%);`;
    let body = `<div class="fut-player-body"><div class="fut-player-neck"></div><div class="fut-player-torso"><div class="fut-player-arm left"></div><div class="fut-player-shirt" style="${shirtBg}"><div class="fut-player-collar"></div><span class="fut-player-number">${numero}</span></div><div class="fut-player-arm right"></div></div></div>`;
    return `<div style="transform: scale(1.15); transform-origin: bottom center; width: 100%; height: 100%; position: absolute; bottom: 0; display:flex; flex-direction:column; align-items:center;">${acHead}${body}</div>`;
}

let estadiosCargados=[],catalogoGlobal=[];
const todosLosGids=["0","861264971","554922783","88250864","2013531070","165565330","96716546","58862486","304687071","879164460","1616215119"];
let guessrRondaActual=0,guessrPuntosTotales=0,guessrEstadioCorrecto=null,guessrEstadiosJugados=[],guessrHistorialRondas=[];
let guessrMapInstance=null,guessrUserMarker=null,guessrTargetMarker=null,guessrPolyline=null,guessrSelectedLatLng=null;
let usuarioLogueadoCache = undefined;
let previewMapInstance=null;
let orderList=[],orderSelectedIdx=null,orderModo="",orderPuntosGanados=0,orderStartTime=0;
let pendingScore=null,pendingScoreType=null;

const NIVELES=(function(){
const n=[];
const baseColors=["#cd7f32","#9ca3af","#eab308","#a78bfa","#ff4757","#00e676","#2979ff"];
const baseClasses=["level-pibe","level-volante","level-crack","level-leyenda","level-leyenda","level-leyenda","level-leyenda"];
const baseEmojis=["⚽","🎯","⭐","🥇","🏆","👑","🔥","⚡","💎","🌟","🚀"];
const baseNames=["Amateur","Promesa","Pibe","Reserva","Volante","Enganche","Goleador","Crack","Ídolo","Capitán","Galáctico","Leyenda","Inmortal","Mito","Dios del Fútbol"];
for(let i=0;i<1000;i++){
let xpReq=i===0?0:Math.floor(8000*Math.pow(i,1.5));
let nextXpReq=Math.floor(8000*Math.pow(i+1,1.5));
let ovr=Math.min(99,50+Math.floor(i*1.5));
if(i>32)ovr=99+(i-32);
let tierIndex=Math.floor(i/5);
let name=(baseNames[Math.min(tierIndex,baseNames.length-1)])+(i>0?` Lvl ${i}`:"");
let colorIdx=Math.min(Math.floor(i/8),baseColors.length-1);
let emojiIdx=Math.min(Math.floor(i/4),baseEmojis.length-1);
n.push({min:xpReq,max:nextXpReq-1,nombre:name,ovr:ovr,color:baseColors[colorIdx]||"#a78bfa",emoji:baseEmojis[emojiIdx]||"✨",cssClass:baseClasses[colorIdx]||"level-leyenda"});
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
let userStats={};

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
else{userStats={votosRealizados:0,triviasVistas:0,partidasJugadas:0,partidasGanadas:0,maxScore:0,medallaLocalista:false,rachaActual:1,xpTotal:0,nivelActual:0,guessrPerfecto:false,guessrUnKm:false,ligas5:new Set(),triviasDescubiertas:new Set(),topRanking:false,ordenPerfecto:false,primeraVez:true,vuelosAleatorios:0,ligasExploradas:new Set(),scoreMayor20000:false,scoreMayor10000:false,votadoTodosEstilos:false,nickPersonalizado:false,sesionesTotal:0,rachaMaxima:0,ordenSinFallar:false,guessrSeguidas:0, activeDates: []};}
['ligas5','triviasDescubiertas','ligasExploradas'].forEach(k=>{if(Array.isArray(userStats[k]))userStats[k]=new Set(userStats[k]);if(!(userStats[k] instanceof Set))userStats[k]=new Set();});
if(!userStats.activeDates) userStats.activeDates = [];
if(userStats.xpTotal===undefined)userStats.xpTotal=userStats.maxScore||0;
if(userStats.partidasGanadas===undefined) userStats.partidasGanadas = 0; // 🛡️ Evita que de undefined en cuentas viejas
userStats.nivelActual=calcularNivelIdx(userStats.xpTotal);
userStats.sesionesTotal=(userStats.sesionesTotal||0)+1;
procesarRachaDiaria();
}
cargarStats();

function guardarStats(){
    const id = getUserId();
    const toSave = {...userStats, ligas5:[...userStats.ligas5], triviasDescubiertas:[...userStats.triviasDescubiertas], ligasExploradas:[...userStats.ligasExploradas]}; 
    localStorage.setItem('ev_user_stats_'+id, JSON.stringify(toSave));

    // --- Sincronización automática, anónima y completa con la nube (CON ESCUDO) ---
    if (!bloqueasSincronizacionNube && id && id !== 'guest' && userStats && userStats.xpTotal !== undefined) {
        sincronizarPerfilSupabase(id, userStats.xpTotal, userStats);
    }
}

function calcularNivelIdx(xp){for(let i=NIVELES.length-1;i>=0;i--){if(xp>=NIVELES[i].min)return i;}return 0;}
function agregarXP(cantidad){
const nivelAntes=calcularNivelIdx(userStats.xpTotal);
userStats.xpTotal+=cantidad;
if(userStats.xpTotal>userStats.maxScore)userStats.maxScore=userStats.xpTotal;
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
if(badge&&dot&&label){badge.style.display='flex';dot.style.background=nivel.color;dot.style.boxShadow=`0 0 6px ${nivel.color}`;label.textContent=nivel.emoji+' '+userPos;}
}

function mostrarLevelUp(nivel){
const overlay=document.getElementById('levelup-overlay');
document.getElementById('levelup-icon').textContent=nivel.emoji;
document.getElementById('levelup-title').textContent='¡Subiste de nivel!';
document.getElementById('levelup-sub').innerHTML=`Ahora sos <b style="color:${nivel.color};">${nivel.nombre}</b>`;
overlay.classList.add('active');
lanzarConfetti();
}
function cerrarLevelUp(){document.getElementById('levelup-overlay').classList.remove('active');}

function lanzarConfetti(){
const overlay=document.getElementById('levelup-overlay');
const colors=['#00e676','#eab308','#a78bfa','#ff4757','#2979ff'];
for(let i=0;i<30;i++){
const p=document.createElement('div');p.className='confetti-piece';
p.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*40}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*.5}s;animation-duration:${.8+Math.random()*.8}s;transform:rotate(${Math.random()*360}deg);`;
overlay.appendChild(p);setTimeout(()=>p.remove(),1500);
}
}

function showToast(msg,icon='ph-check-circle',tipo=''){
const c=document.getElementById('toast-container');const t=document.createElement('div');
t.className='toast'+(tipo?' '+tipo:'');
t.innerHTML=`<i class="ph-fill ${icon}" style="font-size:1.3rem;color:${tipo==='danger'?'var(--danger-color)':'var(--accent-color)'};flex-shrink:0;"></i> ${msg}`;
c.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(20px)';t.style.transition='all .3s';setTimeout(()=>t.remove(),350);},2800);
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

let ligasPanelOpen=false;
const LIGA_COLORS={"0":"#74acdf","861264971":"#74acdf","554922783":"#cf142b","88250864":"#c60b1e","2013531070":"#009246","165565330":"#002395","96716546":"#ffce00","58862486":"#009c3b","304687071":"#d52b1e","879164460":"#1a6b3a","1616215119": "#f36c21"};
function toggleLigasPanel(){const panel=document.getElementById('ligas-dropdown-panel'),btn=document.getElementById('liga-selector-btn');ligasPanelOpen=!ligasPanelOpen;panel.classList.toggle('open',ligasPanelOpen);btn.classList.toggle('open',ligasPanelOpen);}
window.toggleLigaCountryGroup=function(btn){const grupo=btn.closest('.liga-country-group');if(grupo)grupo.classList.toggle('open');};
function cerrarLigasPanel(){ligasPanelOpen=false;document.getElementById('ligas-dropdown-panel').classList.remove('open');document.getElementById('liga-selector-btn').classList.remove('open');}
window.abrirCatalogo=function(){document.getElementById('catalogo-layout').classList.add('open');document.getElementById('catalogo-layout').scrollIntoView({behavior:'smooth'});};
window.cerrarCatalogo=function(){document.getElementById('catalogo-layout').classList.remove('open');};
document.addEventListener('click',(e)=>{const btn=document.getElementById('liga-selector-btn'),panel=document.getElementById('ligas-dropdown-panel');if(btn&&panel&&!btn.contains(e.target)&&!panel.contains(e.target))cerrarLigasPanel();});

window.mostrarLigas=function(){
document.getElementById('btn-volver-ligas').style.display='none';document.getElementById('liga-elegida-badge').style.display='none';document.getElementById('texto-titulo-grilla').textContent='EXPLORÁ EL CATÁLOGO';
const labelLiga=document.getElementById('liga-selector-label');if(labelLiga)labelLiga.textContent='Elegir liga';
document.getElementById('global-search').value='';document.querySelector('.grid').innerHTML='';document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));localStorage.removeItem('ev_last_gid');estadiosCargados=[];
};

function activarLiga(gid,nombre){
document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));const tab=document.querySelector(`.tab[data-gid="${gid}"]`);if(tab){tab.classList.add('active');const grupo=tab.closest('.liga-country-group');if(grupo)grupo.classList.add('open');}
document.getElementById('btn-volver-ligas').style.display='inline-flex';
document.getElementById('texto-titulo-grilla').textContent=''; // 🛡️ ELIMINACIÓN QUIRÚRGICA: Vaciamos el texto blanco residual para limpiar la cabecera
const badge=document.getElementById('liga-elegida-badge'),dot=document.getElementById('liga-badge-dot'),nom=document.getElementById('liga-badge-nombre');
dot.style.background=LIGA_COLORS[gid]||'var(--accent-color)';nom.textContent=nombre;badge.style.display='inline-flex';
localStorage.setItem('ev_last_gid',gid);
userStats.ligasExploradas.add(gid);guardarStats();cargarLiga(gid);
}

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
    showToast(`¡Bienvenido, ${user.name.split(' ')[0]}! 🎉`);
    if (pendingScore !== null) setTimeout(() => guardarScorePendiente(), 500);
}

async function registrarUsuarioEnSupabase(user) {
    if (!supabaseClient) return;
    try {
        const { error } = await supabaseClient
            .rpc('registrar_usuario', {
                p_id_usuario: user.id,
                p_nombre: user.name,
                p_email: user.email || '',
                p_picture: user.picture || ''
            });

        if (error) {
            console.error("🚨 Error en el canal seguro de usuarios:", error.message);
        } else {
            console.log("👤 Usuario registrado/actualizado con éxito en el búnker.");
        }
    } catch (e) {
        console.error("Error de red en registrarUsuarioEnSupabase:", e);
    }
}
function decodeJwt(token){try{const b=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(atob(b).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')));}catch(e){return null;}}
function abrirModalPrivacy(){document.getElementById('privacy-modal-overlay').style.display='flex';}
function cerrarModalPrivacy(){document.getElementById('privacy-modal-overlay').style.display='none';}
function checkPrivacyScrolled(el){if(el.scrollTop+el.clientHeight>=el.scrollHeight-40){const ind=document.getElementById('privacy-read-indicator');ind.innerHTML='<i class="ph-fill ph-check-circle"></i> ¡Leíste todo! Ahora podés aceptar.';ind.classList.add('ready');document.getElementById('privacy-accept-check').disabled=false;}}
function togglePrivacyBtn(){document.getElementById('btn-confirm-privacy').disabled=!document.getElementById('privacy-accept-check').checked;}
function confirmarPrivacyYLogin(){localStorage.setItem('ev_privacy_accepted','1');cerrarModalPrivacy();abrirLoginModal();}
function abrirLoginModal(){
document.getElementById('login-modal-overlay').classList.add('active');
setTimeout(()=>{const c=document.getElementById('google-signin-btn-container');if(c&&typeof google!=='undefined'&&google.accounts){c.innerHTML='';google.accounts.id.renderButton(c,{theme:'filled_black',size:'large',shape:'pill',width:300,text:'signin_with'});}},100);
}
function cerrarLoginModal(){document.getElementById('login-modal-overlay').classList.remove('active');}
function manejarClickLogin(){const ok=localStorage.getItem('ev_privacy_accepted')==='1';if(ok)abrirLoginModal();else abrirModalPrivacy();}
function esUsuarioGoogle(){const u=obtenerUsuarioLogueado();return u&&u.loginMethod==='google';}
function guardarScorePendiente() {
    if (pendingScore === null) return;
    
    if (!esUsuarioGoogle()) {
        pedirLoginParaGuardar();
        return;
    }

    const u = obtenerUsuarioLogueado();
    const nombreParaGuardar = getPref('ev_custom_nick', '') || u.name;
    const emailParaGuardar = u.email || '';

    // Manda el puntaje exclusivamente a la tabla que corresponde al minijuego (ej: 'guessr' global)
    enviarPuntaje(nombreParaGuardar, pendingScore, emailParaGuardar, pendingScoreType);

    showToast(`¡${pendingScore} puntos guardados en el ranking global! 🚀`);
    pendingScore = null;
    pendingScoreType = null;
}
function pedirLoginParaGuardar(){
const sub=document.querySelector('.login-modal-sub');if(sub)sub.innerHTML=`<b style="color:var(--accent-color);">¡Puntaje listo para guardar!</b><br>Iniciá sesión con Google para guardarlo en el ranking global y no perderlo.`;
const ok=localStorage.getItem('ev_privacy_accepted')==='1';if(ok)abrirLoginModal();else abrirModalPrivacy();}
function obtenerNombreDisplay(){const customNick=getPref('ev_custom_nick','');if(customNick)return customNick;const u=obtenerUsuarioLogueado();if(u)return u.name.split(' ')[0];return 'Jugador';}
function renderizarBotonLogin(){
const container=document.getElementById('hero-google-profile');const u=obtenerUsuarioLogueado();
if(u){
let avatarHTML=`<div style="width:36px;height:36px;border-radius:50%;border:2px solid var(--accent-color);display:flex;align-items:center;justify-content:center;background:#71a8ff;box-shadow:0 0 8px var(--accent-glow); position:relative; overflow:hidden;"><div style="transform: scale(0.35); transform-origin: center 75%; position:absolute; width:100px; height:100px; left: -32px; bottom: -32px;">${generarAvatarHTML(getPref('ev_avatar_hair','short'), getPref('ev_avatar_shirt','solid'), getPref('ev_avatar_color','#00e676'), getPref('ev_avatar_num','10'), getPref('ev_avatar_color2','#ffffff'))}</div></div>`;
const nivel=NIVELES[calcularNivelIdx(userStats.xpTotal)];
container.innerHTML=`<div class="hero-profile-wrapper" onclick="abrirModalPerfil()"><div style="text-align:right;"><div class="hero-profile-name">${obtenerNombreDisplay()}</div><div class="hero-profile-sub"><span style="color:${nivel.color};">${nivel.emoji}</span> ${getPref('ev_user_pos','DT')}</div></div>${avatarHTML}</div>`;
ancestralHeaderNivel();
}else{container.innerHTML=`<button class="btn-login" onclick="manejarClickLogin()"><i class="ph-bold ph-user-circle" style="font-size:1.1rem;"></i> Entrar</button>`;}
}
function guardarVotoLocal(estadio,p){const v=JSON.parse(localStorage.getItem('ev_votos_locales')||'{}');v[estadio]=p;localStorage.setItem('ev_votos_locales',JSON.stringify(v));}
function obtenerVotoLocal(estadio){const v=JSON.parse(localStorage.getItem('ev_votos_locales')||'{}');return v[estadio]||0;}
async function registrarVoto(event, estadio, club, puntuacion) {
    event.stopPropagation();
    userStats.votosRealizados++;
    guardarStats();
    guardarVotoLocal(estadio, puntuacion);

    const sr = event.target.closest('.stars-row');
    if (sr) {
        sr.querySelectorAll('.star-icon').forEach((s, i) => {
            if (i < puntuacion) {
                s.classList.add('active', 'ph-fill');
                s.classList.remove('ph-duotone');
            } else {
                s.classList.remove('active', 'ph-fill');
                s.classList.add('ph-duotone');
            }
        });
    }

    if (supabaseClient) {
        try {
            await supabaseClient
                .from('votos')
                .insert([
                    { 
                        estadio: estadio, 
                        club: club, 
                        voto: puntuacion 
                    }
                ]);
            console.log(`Voto guardado en Supabase: ${estadio} -> ${puntuacion}★`);
        } catch (err) {
            console.error("Error al mandar el voto a Supabase:", err);
        }
    }

    showToast(`Calificaste ${estadio} con ${puntuacion}★`);
    agregarXP(50);
}
function registrarVotoDesdeAtributo(event,star){registrarVoto(event,star.dataset.estadio,star.dataset.club,parseInt(star.dataset.puntuacion));}
// ========================================================
// ESCUDO ANTI-XSS (Sanitización de HTML)
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
function bscarPropiedad(obj,clave){
if(!obj)return '';const cl=clave.toLowerCase().trim();

for(let k in obj){if(k.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g,'').trim()===cl)return obj[k];}
for(let k in obj){if(k.toLowerCase().includes(cl))return obj[k];}
return obj[clave]||'';
}
const COLORES_CLUBES={"River Plate": "linear-gradient(135deg, #cc0000, #ffffff)",
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
            "Unión La Calera": "linear-gradient(135deg, #e20e0e, #ffffff)",
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
            "Telstar": "linear-gradient(135deg, #ffffff, #00529f, #e30613)"};
const COLORES_PAISES={"argentina":"linear-gradient(135deg,#74acdf,#ffffff,#74acdf)","brasil":"linear-gradient(135deg,#009c3b,#ffdf00,#009c3b)","españa":"linear-gradient(135deg,#c60b1e,#ffc400,#c60b1e)","italia":"linear-gradient(135deg,#009246,#ffffff,#ce2b37)","francia":"linear-gradient(135deg,#002395,#ffffff,#ed2939)","alemania":"linear-gradient(135deg,#000000,#dd0000,#ffce00)","chile":"linear-gradient(135deg,#d52b1e,#ffffff,#0039a6)","estados unidos":"linear-gradient(135deg,#002868 0%,#ffffff 50%,#bf0a30 100%)","usa":"linear-gradient(135deg,#002868 0%,#ffffff 50%,#bf0a30 100%)","mexico":"linear-gradient(135deg,#006847 0%,#ffffff 50%,#ce1126 100%)","méxico":"linear-gradient(135deg,#006847 0%,#ffffff 50%,#ce1126 100%)","canada":"linear-gradient(135deg,#d52b1e 0%,#ffffff 50%,#d52b1e 100%)","canadá":"linear-gradient(135deg,#d52b1e 0%,#ffffff 50%,#d52b1e 100%)"};

function obtenerFondoClub(club,pais){
if(!club&&!pais)return 'linear-gradient(135deg,#0f1419,#080c10)';
if(club){const cl=club.toLowerCase();for(const k in COLORES_CLUBES){if(k.toLowerCase()===cl)return COLORES_CLUBES[k];}for(const k in COLORES_CLUBES){if(cl.includes(k.toLowerCase())||k.toLowerCase().includes(cl))return COLORES_CLUBES[k];}}
if(pais){const pl=pais.toLowerCase().trim();for(const k in COLORES_PAISES){if(pl.includes(k)||k.includes(pl))return COLORES_PAISES[k];}}
return 'linear-gradient(135deg,#0f1419,#1a2233)';
}

function abrirModalVideo(event,link,esJuego=false){
    if(event)event.preventDefault();
    if(!link||link==='#'||link.includes('[Pegá tu link')){
        showToast('Video de este estadio no disponible.','ph-warning-circle','danger');
        return;
    }
    
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
        
        // 👇 MAGIA NUEVA: Escáner blindado que encuentra el ID del video sin importar cómo se haya pegado
        const match = link.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w\-]{11})/i);
        if (match && match[1]) {
            vid = match[1];
        }
        
        // Autoplay forzado para móviles (Silenciado)
        const qp=esJuego?"?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&modestbranding=1":"?autoplay=1&playsinline=1&rel=0&modestbranding=1";
        
        if(vid) {
            url=`https://www.youtube.com/embed/${vid}${qp}`;
        }
        
        const est=esJuego?"width:100%;height:calc(100% + 55px);border:none;margin-top:-55px;":"width:100%;height:100%;border:none;";
        container.innerHTML=`<iframe src="${url}" style="${est}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        
    }else if(link.toLowerCase().endsWith('.mp4')||link.includes('.mp4?')){
        // Video MP4 nativo con playsinline para iOS
        const attr=esJuego?"autoplay loop muted playsinline":"controls autoplay playsinline";
        container.innerHTML=`<video ${attr} style="width:100%;height:100%;object-fit:cover;"><source src="${link}" type="video/mp4"></video>`;
    }else{
        container.innerHTML=`<iframe src="${link}" style="width:100%;height:100%;border:none;" allow="autoplay; fullscreen"></iframe>`;
    }
    
    modal.onclick = function(e) {
        if (e.target !== modal) return;
        if (esModoVersus) return;
        cerrarModalVideo();
    };

    modal.style.display='flex';
}

function cerrarModalVideo(){
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
    document.getElementById('video-modal').style.display='none';document.getElementById('modal-video-container').innerHTML='';document.getElementById('game-ui').style.display='none';document.getElementById('modal-card').classList.remove('stadium-guessr-layout');document.getElementById('modal-card').classList.remove('resultado-final');
    try{if(guessrMapInstance){guessrMapInstance.remove();guessrMapInstance=null;}}catch(e){guessrMapInstance=null;}
    try{if(guessrUserMarker)guessrUserMarker.remove();}catch(e){}try{if(guessrTargetMarker)guessrTargetMarker.remove();}catch(e){}try{if(guessrPolyline)guessrPolyline.remove();}catch(e){}
    guessrUserMarker=guessrTargetMarker=guessrPolyline=null;guessrSelectedLatLng=null;
}

function abrirModalMapa(estadio,pais,lat,lng){
if(!lat||!lng||!lat.toString().trim()||!lng.toString().trim()){showToast('Coordenadas no disponibles.','ph-warning-circle','danger');return;}
document.getElementById('map-modal').style.display='flex';const pLat=parseFloat(lat.toString().replace(',','.')),pLng=parseFloat(lng.toString().replace(',','.'));
setTimeout(()=>{if(previewMapInstance)previewMapInstance.remove();previewMapInstance=L.map('modal-map-container',{attributionControl:false}).setView([pLat,pLng],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(previewMapInstance);L.circleMarker([pLat,pLng],{radius:9,color:'var(--accent-color)',fillColor:'var(--card-bg)',fillOpacity:1,weight:3}).addTo(previewMapInstance).bindPopup(`<b>${estadio}</b><br>${pais}`).openPopup();previewMapInstance.invalidateSize();},250);
}
function cerrarModalMapa(){document.getElementById('map-modal').style.display='none';if(previewMapInstance){previewMapInstance.remove();previewMapInstance=null;}}
function cerrarModalPerfil(){document.getElementById('profile-modal').style.display='none';}
function cerrarModalOrden(){document.getElementById('order-modal').style.display='none';}
function cerrarModalRanking(){document.getElementById('ranking-modal').style.display='none';}

function abrirModalGuessr() {
    document.getElementById('guessr-modal').style.display = 'flex';
}

function cerrarModalGuessr() {
    document.getElementById('guessr-modal').style.display = 'none';
}

function switchTab(event,btn,type,estadio,pais,lat,lng){
event.stopPropagation();const b=btn.closest('.trivia-balloon');b.querySelectorAll('.b-tab').forEach(t=>t.classList.remove('active'));b.querySelectorAll('.b-content').forEach(c=>c.classList.remove('active'));btn.classList.add('active');const ct=b.querySelector('.b-'+type);if(ct)ct.classList.add('active');
if(type==='mapa'){abrirModalMapa(estadio,pais,lat,lng);setTimeout(()=>{b.classList.remove('active');b.querySelectorAll('.b-tab')[0].classList.add('active');b.querySelector('.b-trivia').classList.add('active');},100);}
}
function switchTabMapa(event,btn){event.stopPropagation();switchTab(event,btn,'mapa',btn.dataset.estadio,btn.dataset.pais,btn.dataset.lat,btn.dataset.lng);}

function toggleTriviaPopup(event,el){
event.stopPropagation();const g=el.querySelector('.trivia-balloon');const open=g.classList.contains('active');document.querySelectorAll('.trivia-balloon').forEach(x=>x.classList.remove('active'));
if(!open){g.classList.add('active');userStats.triviasVistas++;const cardTitle=el.closest('.card')?.querySelector('.card-title')?.textContent;if(cardTitle)userStats.triviasDescubiertas.add(cardTitle);guardarStats();gridXP(10);}
}
document.addEventListener('click',()=>document.querySelectorAll('.trivia-balloon').forEach(g=>g.classList.remove('active')));
function mostrarSkeletons(){document.querySelector('.grid').innerHTML=Array(6).fill(0).map(()=>`<div class="loading-card"><div class="loading-card-img skeleton"></div><div class="loading-card-body"><div class="skeleton loading-card-title"></div><div class="skeleton loading-card-sub"></div><div class="skeleton loading-card-btn"></div></div></div>`).join('');}

function renderizarTarjetas(lista){
const gr=document.querySelector('.grid');gr.innerHTML='';
if(!lista.length){gr.innerHTML=`<div class="empty-state"><i class="ph-duotone ph-magnifying-glass empty-state-icon"></i><h3>Sin resultados</h3><p>No se encontraron estadios que coincidan.</p></div>`;return;}
lista.forEach((fila,idx)=>{
const estadio=bscarPropiedad(fila,'Estadio'),club=bscarPropiedad(fila,'Club');if(!estadio||!club)return;
const urlFoto=bscarPropiedad(fila,'Foto')?.trim()||'',pais=bscarPropiedad(fila,'País')?.trim()||'Argentina',fond=obtenerFondoClub(club,pais),linkVideo=bscarPropiedad(fila,'Link del Video')?.trim()||'#',latR=bscarPropiedad(fila,'Latitud')?.toString().trim()||'',lngR=bscarPropiedad(fila,'Longitud')?.toString().trim()||'',dato=bscarPropiedad(fila,'Dato Curioso');
const datoL=(dato||'¡Este estadio esconde grandes historias!').replace(/'/g,"\u2019").replace(/"/g,"\u201C");
const datoSupa = promediosSupabase[estadio];
        let prom = parseFloat(bscarPropiedad(fila, 'Promedio')) || 0;
        let textoTotalVotos = "";

        if (datoSupa) {
            prom = datoSupa.promedio * 2;
            textoTotalVotos = ` (${datoSupa.total} votos)`;
        }

        const vL = obtenerVotoLocal(estadio);
        const est = vL > 0 ? vL : (prom / 2);
const estadioSafe=estadio.replace(/"/g,'&quot;').replace(/'/g,'&#39;'),clubSafe=club.replace(/"/g,'&quot;').replace(/'/g,'&#39;'),paisSafe=pais.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
let estrellasHTML='';for(let i=1;i<=5;i++){let ic='ph-duotone ph-star';if(i<=Math.floor(est))ic='ph-fill ph-star active';else if(i===Math.ceil(est)&&(est%1>=.5))ic='ph-fill ph-star-half active';estrellasHTML+=`<i class="${ic} star-icon" data-estadio="${estadioSafe}" data-club="${clubSafe}" data-puntuacion="${i}" onclick="registrarVotoDesdeAtributo(event,this)"></i>`;}
const lRating = vL > 0  
            ? `Tu voto: ${vL}★${prom > 0 ? ` · prom. ${prom.toFixed(1)}/10${textoTotalVotos}` : ''}` 
            : (prom > 0 ? `Calificá · prom. ${prom.toFixed(1)}/10${textoTotalVotos}` : 'Calificá este estadio');
const imgHTML=urlFoto?`<img class="card-img-logo" src="${urlFoto}" alt="${clubSafe}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><div class="placeholder-text" style="display:none;">${club}</div>`:`<div class="placeholder-text">${club}</div>`;
const t=document.createElement('article');t.className='card animate-fade-up';t.style.animationDelay=`${idx*.04}s`;t.dataset.linkVideo=linkVideo;
t.innerHTML=`<div class="estadio-foto-container" style="background:${fond};" onclick="toggleTriviaPopup(event,this)"><div class="trivia-hint" title="Dato curioso"><i class="ph-fill ph-lightbulb"></i></div>${imgHTML}<div class="trivia-balloon" onclick="event.stopPropagation()"><div class="balloon-tabs"><button class="b-tab active" onclick="switchTab(event,this,'trivia')">Trivia</button><button class="b-tab" data-estadio="${estadioSafe}" data-pais="${paisSafe}" data-lat="${latR}" data-lng="${lngR}" onclick="switchTabMapa(event,this)">Mapa</button></div><div class="b-content b-trivia active"><p>${datoL}</p></div><div class="b-content b-mapa"></div></div></div><div class="card-content"><h2 class="card-title">${estadio}</h2><p class="card-subtitle">${club} · ${pais}</p><button onclick="abrirVideoDesdeCard(event,this)" class="btn-view"><i class="ph-fill ph-play-circle"></i> Ver Estadio</button><div class="rating-box"><span class="rating-title">${lRating}</span><div class="stars-row">${estrellasHTML}</div></div></div>`;
gr.appendChild(t);
});
}

function abrirVideoDesdeCard(event,btn){event.stopPropagation();const c=btn.closest('.card');userStats.vuelosAleatorios=(userStats.vuelosAleatorios||0)+1;guardarStats();abrirModalVideo(event,c?.dataset.linkVideo||'#',false);}
document.getElementById('global-search').addEventListener('input',function(e){
const term=e.target.value.toLowerCase().trim();
if(term===''){const last=localStorage.getItem('ev_last_gid');if(last)renderizarTarjetas(estadiosCargados);else mostrarLigas();}
else{document.getElementById('catalogo-layout').classList.add('open');document.getElementById('texto-titulo-grilla').textContent=`BÚSQUEDA: "${e.target.value.toUpperCase()}"`;renderizarTarjetas(catalogoGlobal.filter(f=>[bscarPropiedad(f,'Estadio'),bscarPropiedad(f,'Club'),bscarPropiedad(f,'País')].some(v=>v.toLowerCase().includes(term))));}
});

function cargarLiga(gid){
    mostrarSkeletons();
    document.getElementById('global-search').value='';
    
    // 🛡️ ESCUDO: Si el catálogo de Supabase tarda un milisegundo de más en cargar, reintentamos
    if (!catalogoGlobal || catalogoGlobal.length === 0) {
        setTimeout(() => cargarLiga(gid), 200);
        return;
    }
    
    // En lugar de ir a internet, filtramos el catálogo que ya tenemos en memoria por su GID
    estadiosCargados = catalogoGlobal.filter(f => 
        String(bscarPropiedad(f, 'GID')).trim() === String(gid).trim() &&
        bscarPropiedad(f, 'Estadio') && 
        bscarPropiedad(f, 'Club')
    );
    
    renderizarTarjetas(estadiosCargados);
}
async function indexarCatalogoMasivo() {
    if (!supabaseClient) {
        console.error("Supabase no está listo para cargar el catálogo.");
        return;
    }

    try {
        // Traemos todos los estadios de una sola vez
        const { data, error } = await supabaseClient
            .from('estadios_catalogo')
            .select('*');

        if (error) throw error;

        // Mapeamos los datos para que tu código viejo siga funcionando sin tocar nada más
        catalogoGlobal = data.map(fila => ({
            'Estadio': fila.estadio,
            'Club': fila.club,
            'País': fila.pais,
            'Foto': fila.foto,
            'Link del Video': fila.link_video,
            'Latitud': fila.latitud,
            'Longitud': fila.longitud,
            'Dato Curioso': fila.dato_curioso,
            // 👇 ESTO FALTABA: Agregamos Capacidad, Año y las demás para que los minijuegos funcionen
            'Capacidad': fila.capacidad,
            'Año': fila.anio,
            'Promedio': fila.promedio,
            'GID': fila.gid
        }));

        console.log(`¡Catálogo global migrado y cargado en memoria! (${catalogoGlobal.length} estadios)`);
        
        // Si tenías estadios cargados para una liga específica, los mapeamos por defecto
        estadiosCargados = [...catalogoGlobal];
        
    } catch (err) {
        console.error("Error al descargar el catálogo masivo:", err);
        showToast("Error al cargar los estadios.", "ph-warning-circle", "danger");
    }
}

function dispararVueloAleatorio(e){
const pool=catalogoGlobal.length>0?catalogoGlobal:estadiosCargados;if(!pool.length){showToast('Esperá que cargue el catálogo...','ph-info','danger');return;}
const cv=pool.filter(f=>{const l=bscarPropiedad(f,'Link del Video').toString().trim();return(l.includes('youtube.com')||l.includes('youtu.be'))&&!l.includes('[Pegá tu link');});
if(!cv.length){showToast('No hay videos disponibles.','ph-warning-circle','danger');return;}
userStats.vuelosAleatorios=(userStats.vuelosAleatorios||0)+1;guardarStats();abrirModalVideo(e,bscarPropiedad(cv[Math.floor(Math.random()*cv.length)],'Link del Video').trim(),false);
}

// ========================================================

let ligaAmigosChannel = null;   // Canal realtime para presencia y desafíos de la liga
let usuariosOnlineLiga = [];    // Array dinámico de usuarios conectados mirando la liga
let cacheTop15Ligas = [];       // Memoria RAM para redibujar la lista de puntaje sin saturar la BD con lecturas
let cacheTriunfosLiga = null;   // Memoria RAM del ranking de TRIUNFOS 1v1 de la liga (null = todavía no se pidió)
let vistaLigaActual = 'puntaje'; // 'puntaje' | 'triunfos' — qué pestaña está activa ahora en el modal de la liga
let versusLigaOrigen = null;    // Si el 1v1 en curso nació de un desafío ⚔️ dentro de una liga, acá va el nombre de esa liga

let esModoVersus = false;         // El escudo: false = solitario, true = multijugador
let estadiosDiariosList = [];
let versusPartidaId = null;       // ID de la partida actual en Supabase
let versusRol = null;             // Puede ser 'jugador_1' (Host) o 'jugador_2' (Rival)
let versusEstadios = [];          // Array con la lista fija de estadios para el 1v1
let versusChannel = null;         // Canal de WebSocket activo
let versusPartidaEnCurso = false; // Candado para evitar dobles arranques

// VARIABLES PARA EL CONTROL ROUND-BY-ROUND (OPCIÓN 2)
let miGuessConfirmado = false;
let rivalGuessConfirmado = false;
let rivalDataRonda = null;
let miListoSiguiente = false;
let rivalListoSiguiente = false;
let versusTimerInterval = null;
let versusTiempoRestante = 15;
let handshakeInterval = null;     // Intervalo para el latido de sincronización
let rivalPuntosTotales = 0;       // Acumulador oficial del oponente
let rivalForcedTimeout = false;
let resultadosRondaMostrados = false;
let esModoBot = false;             // Bandera para saber si el oponente actual es una IA
let versusTimeoutBusqueda = null;  // Temporizador que mide la espera en el vestuario
let matchmakingInterval = null;    // Contador de tiempo en cola en vivo
let botAntesTimer = null;          // 🔥 Controla el ataque anticipado del Bot
let versusRivalNombre = "RIVAL";   // 🏆 variable GLOBAL para fijar el nombre del oponente

// ==========================================
// VARIABLES PARA DESAFÍOS 1v1 DENTRO DE LA LIGA DE AMIGOS
// ==========================================
let nombreLigaActivaCache = "";    // Nombre de la liga que se está viendo ahora mismo en el modal
let miNombreRankingLiga = "";      // Cache de mi nombre tal cual figura en la tabla de la liga
let timeoutRetoDirecto = null;     // Si el rival no entra a la sala a tiempo, avisamos y cancelamos
// Función auxiliar para obtener 5 estadios válidos de tu catálogo para el Versus
// Función auxiliar para obtener 5 estadios válidos con azar 100% perfecto y uniforme
// ⏳ CREA EL CONTADOR VISUAL FLOTANTE DE TIEMPO EN COLA
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
    
    // Inyectamos el spinner, el cronómetro y la X de cancelación con hover interactivo
    lobby.innerHTML = `
        <i class="ph-bold ph-circle-notch animate-spin" style="color:var(--accent-color); font-size:1.2rem;"></i>
        <span>Buscando rival... <b style="color:var(--accent-color); margin-left: 4px;">0:00</b></span>
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
            textoLobby.innerHTML = `Buscando rival... <b style="color:var(--accent-color); margin-left: 4px;">${tiempoFormateado}</b>`;
        }
    }, 1000);
}

// 🛑 CANCELA EL MATCHMAKING Y DESCONECTA LOS CANALES DE SUPABASE
// 🛑 CANCELA EL MATCHMAKING Y DESCONECTA LOS CANALES DE SUPABASE
async function cancelarBusquedaVersus() {
    cerrarLobbyEspera(); // Borra el cartel flotante de la pantalla
    
    // Matamos los timers de búsqueda de la app
    if (versusTimeoutBusqueda) {
        clearTimeout(versusTimeoutBusqueda);
        versusTimeoutBusqueda = null;
    }
    if (handshakeInterval) {
        clearInterval(handshakeInterval);
        handshakeInterval = null;
    }
    
    // Desconectamos el canal activo de Supabase de raíz
    if (versusChannel) {
        versusChannel.unsubscribe();
        versusChannel = null;
    }

    // 👇 ESCUDO ANTI-ZOMBIES: Si cancelamos la búsqueda, marcamos la sala como cancelada en la BD
    if (versusPartidaId && !versusPartidaId.startsWith('PRIV_') && !versusPartidaEnCurso) {
        try {
            await supabaseClient.from('partidas').update({ estado: 'cancelada' }).eq('id', versusPartidaId);
        } catch(e) { console.warn("No se pudo limpiar la sala en la nube."); }
    }
    // 👆 FIN DEL ESCUDO 👆
    
    // Reseteamos las banderas globales competitivas
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

    // Sorteo Fisher-Yates: Extrae elementos al azar uno a uno sin repetir pesos
    let resultado = [];
    let copia = [...disponibles];
    const cantidadAExtraer = Math.min(5, copia.length);

    for (let i = 0; i < cantidadAExtraer; i++) {
        const idxAleatorio = Math.floor(Math.random() * copia.length);
        // Despatarramos el elemento de la copia y lo metemos en la canasta oficial
        resultado.push(copia.splice(idxAleatorio, 1)[0]);
    }

    return resultado;
}
// ==========================================
// MOTOR DE SALAS PRIVADAS (DESAFÍO POR WHATSAPP)
// ==========================================
function crearSalaPrivada() {
    cerrarModalGuessr(); // 👇 AGREGAMOS ESTO PARA DESPEJAR LA PANTALLA
    // 1. Validamos que haya estadios cargados
    const misEstadiosAleatorios = obtener5EstadiosVersus();
    if (!misEstadiosAleatorios || misEstadiosAleatorios.length < 5) {
        showToast("Esperá un segundo que termine de cargar el catálogo...", "ph-circle-notch", "warning");
        return;
    }

    // 2. Generamos un código único para la sala (Ej: PRIV_A8F3X)
    const idSala = Math.random().toString(36).substring(2, 8).toUpperCase();
    versusPartidaId = 'PRIV_' + idSala;
    versusEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));
    versusLigaOrigen = null; // 🏳️ Sala por link de WhatsApp: no cuenta para ningún ranking de triunfos por liga
    
    // 3. Seteamos las banderas globales
    versusRol = 'jugador_1'; // El que crea la sala es el Host
    esModoVersus = true;
    esModoBot = false;
    versusPartidaEnCurso = false;

    // 4. Armamos el link mágico para WhatsApp
    const urlLimpia = window.location.origin + window.location.pathname;
    const linkACompartir = `${urlLimpia}?sala=${versusPartidaId}`;

    // 5. Abrimos el lobby y conectamos la red
    abrirLobbyPrivado(linkACompartir, idSala);
    conectarRealtimeVersus();
}

function abrirLobbyPrivado(link, codigo) {
    cerrarLobbyEspera(); 
    const lobby = document.createElement('div');
    lobby.id = 'matchmaking-lobby';
    lobby.style.cssText = `
        position: fixed; top: 24px; left: 0; right: 0; margin: 0 auto; width: max-content; 
        max-width: 90%; background: var(--glass-bg); border: 2px solid var(--border-strong); 
        padding: 20px 28px; border-radius: 16px; z-index: 99999; display: flex; 
        flex-direction: column; align-items: center; justify-content: center; gap: 14px; 
        font-weight: 800; color: var(--text-main); box-shadow: var(--shadow-strong); 
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); animation: fadeSlideUp 0.3s both;
    `;
    
    lobby.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
            <span style="color:var(--accent-color); font-size:1.1rem;"><i class="ph-fill ph-users-three"></i> Duelo Privado</span>
            <i class="ph-bold ph-x" style="cursor:pointer; color:var(--text-muted);" onclick="cancelarBusquedaVersus()"></i>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">Pasale este link a tu rival y esperalo acá:</p>
        <button id="btn-copiar-privado" onclick="compartirLinkPrivado('${link}')" class="btn-3d primary" style="width:100%; padding:14px; font-size:1rem; margin-top:5px;">
            <i class="ph-bold ph-copy"></i> Invitar a sala privada
        </button>
    `;
    document.body.appendChild(lobby);
}

window.compartirLinkPrivado = function(link) {
    const msg = `⚽ ¡Te reté a un duelo en StadiumGuessr! 🌍\nEntrá a este link para jugar contra mí en vivo:\n\n${link}`;
    // Forzamos el copiado directo al portapapeles
    navigator.clipboard.writeText(msg).then(() => {
        showToast('¡Copiado! Ahora pegalo en tu chat de WhatsApp.', 'ph-check-circle', 'success');
        // Le cambiamos el texto al botón para darle feedback visual
        const btn = document.getElementById('btn-copiar-privado');
        if (btn) btn.innerHTML = `<i class="ph-bold ph-check"></i> ¡Copiado!`;
    }).catch(() => {
        showToast('Error al copiar. Seleccionalo de la barra de arriba.', 'ph-warning-circle', 'danger');
    });
}

function unirseSalaPrivada(salaId) {
    let idUsuario = getUserId();
    if (!idUsuario || idUsuario === 'guest') {
        let guestId = sessionStorage.getItem('ev_guest_versus_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
            sessionStorage.setItem('ev_guest_versus_id', guestId);
        }
        idUsuario = guestId;

        let nickExistente = getPref('ev_custom_nick', '');
        if (!nickExistente) {
            let nuevoNick = prompt("🏆 ¡Te desafiaron a un duelo! Ingresá tu apodo para entrar a la cancha:");
            if (nuevoNick === null) {
                window.history.replaceState({}, document.title, window.location.pathname);
                return; 
            }
            nuevoNick = nuevoNick.trim() || ("Jugador_" + Math.random().toString(36).substring(2, 6).toUpperCase());
            setPref('ev_custom_nick', nuevoNick.substring(0, 16));
        }
    }

    versusPartidaId = salaId;
    versusRol = 'jugador_2'; // El que entra por el link es el Invitado
    esModoVersus = true;
    esModoBot = false;
    versusPartidaEnCurso = false;

    // Borramos el código de la barra de direcciones para que quede limpio
    window.history.replaceState({}, document.title, window.location.pathname);

    showToast("Buscando al creador de la sala... 📡", "ph-circle-notch", "info");
    
    // 👇 MAGIA 1: Le abrimos el cartelito de "Buscando rival" para que sepa que está cargando
    abrirLobbyEspera(); 
    conectarRealtimeVersus();

    // 👇 MAGIA 2: ESCUDO DE CADUCIDAD 👇
    // Si en 15 segundos el anfitrión no responde, cortamos la conexión y le avisamos.
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
    versusTimeoutBusqueda = setTimeout(() => {
        if (!versusPartidaEnCurso) {
            cancelarBusquedaVersus(); // Apaga la red y limpia la pantalla
            showToast("El creador de la sala ya no está conectado. ❌", "ph-warning-circle", "danger");
        }
    }, 15000); 
}

// Función principal para buscar rival o crear una sala de espera
async function buscarPartidaVersus() {
    // 🛡️ ESCUDO DE SEGURIDAD CRUCIAL
    const misEstadiosAleatorios = obtener5EstadiosVersus();
    if (!misEstadiosAleatorios || misEstadiosAleatorios.length < 5) {
        showToast("Esperá un segundo que termine de cargar el catálogo de estadios... ⚽", "ph-circle-notch", "warning");
        return;
    }

    // 1. Obtenemos el ID local
    let idUsuario = getUserId();

    // 2. Si no está logueado, le asignamos un ID temporal único para esta sesión de juego
    if (!idUsuario || idUsuario === 'guest') {
        let guestId = sessionStorage.getItem('ev_guest_versus_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
            sessionStorage.setItem('ev_guest_versus_id', guestId);
        }
        idUsuario = guestId;

        // 🎫 CONTROL DE APODO
        let nickExistente = getPref('ev_custom_nick', '');
        if (!nickExistente) {
            let nuevoNick = prompt("🏆 ¡Antes de entrar a la cancha! Ingresá tu apodo para el Salón de la Fama:");
            if (nuevoNick === null) return; 
            nuevoNick = nuevoNick.trim();
            if (!nuevoNick) {
                nuevoNick = "Invitado_" + Math.random().toString(36).substring(2, 6).toUpperCase();
            }
            if (nuevoNick.length > 16) nuevoNick = nuevoNick.substring(0, 16);
            setPref('ev_custom_nick', nuevoNick);
        }
    }

    // 3. Limpieza preventiva de intervalos
    if (handshakeInterval) clearInterval(handshakeInterval);
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda); 
    
    if (versusChannel) {
        supabaseClient.removeChannel(versusChannel);
        versusChannel = null;
    }
    
    versusPartidaEnCurso = false;
    esModoBot = false; 
    versusLigaOrigen = null; // 🏳️ Matchmaking random: no cuenta para ningún ranking de triunfos por liga

    showToast("Buscando rival en el vestuario... ⏳", "ph-circle-notch", "info");
    abrirLobbyEspera(); 
    
    const nombresEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));

    try {
        const { data, error } = await supabaseClient.rpc('buscar_o_crear_partida', {
            p_jugador_id: idUsuario,
            p_estadios_enviados: nombresEstadios
        });

        // 🛡️ ESCUDO 1: Falla de red o error interno de la base de datos SQL
        if (error) {
            console.error("🚨 Error de Supabase al buscar/crear sala:", error.message);
            cerrarLobbyEspera(); // Cortamos el cartel de búsqueda
            showToast("Problemas de red. Intentá de nuevo.", "ph-warning-circle", "danger");
            esModoVersus = false;
            return; // Abortamos la ejecución de la función
        }

        // 🛡️ ESCUDO 2: La base de datos respondió, pero vino completamente vacía
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.error("🚨 La base de datos devolvió una respuesta vacía.");
            cerrarLobbyEspera();
            showToast("No se pudo conectar a la sala. Reintentando...", "ph-warning-circle", "warning");
            esModoVersus = false;
            return;
        }

        // A veces Supabase devuelve un array [{}], a veces el objeto directo {}. Esto lo unifica:
        const partida = Array.isArray(data) ? data[0] : data;
        
        // 🛡️ ESCUDO 3: El objeto se extrajo, pero es null o undefined
        if (!partida) {
            console.error("🚨 El objeto de la partida es inválido.");
            cerrarLobbyEspera();
            showToast("Error de lectura en la sala.", "ph-warning-circle", "danger");
            esModoVersus = false;
            return;
        }

        // Búsqueda inteligente (Fallbacks): Si no se llama 'id', busca 'partida_id', etc.
        versusPartidaId = partida.id || partida.partida_id || partida.id_partida;
        versusEstadios = partida.estadios_ids || partida.estadios || partida.lista_estadios;
        
        // 🛡️ ESCUDO 4: El objeto existe, pero le faltan los datos vitales para jugar
        if (!versusPartidaId) {
            console.error("🚨 Falla crítica: La base de datos no devolvió un ID reconocible.", partida);
            cerrarLobbyEspera();
            showToast("Sala corrupta. Volvé a buscar.", "ph-warning-circle", "danger");
            esModoVersus = false;
            return;
        }

        if (!versusEstadios) {
            console.error("🚨 Falla crítica: La partida no tiene estadios asignados.", partida);
            cerrarLobbyEspera();
            showToast("Error al cargar los mapas del partido.", "ph-warning-circle", "danger");
            esModoVersus = false;
            return;
        }

        // 🛡️ PARCHE DE SEGURIDAD EXTRA (Tu código original para desarmar strings JSON)
        if (typeof versusEstadios === 'string') {
            try { versusEstadios = JSON.parse(versusEstadios); } 
            catch(e) { versusEstadios = versusEstadios.split(','); }
        }

        // ====================================================================
        // SI LLEGAMOS HASTA ACÁ, ES PORQUE LOS DATOS SON 100% PUROS Y SEGUROS
        // ====================================================================
        
        esModoVersus = true; 

        // Búsqueda inteligente del estado
        const estadoRaw = partida.estado || partida.estado_partida || partida.status || '';
        const estadoPartida = String(estadoRaw).toLowerCase();

        if (estadoPartida === 'esperando') {
            versusRol = 'jugador_1';
            console.log("[1v1] Sala creada. ID:", versusPartidaId, "Esperando rival...");
            showToast("Sala de espera creada. Esperando oponente...", "ph-hourglass", "info");
            conectarRealtimeVersus();
        } else {
            versusRol = 'jugador_2';
            console.log("[1v1] ¡Conectando a sala existente! Partida ID:", versusPartidaId);
            showToast("Estableciendo conexión con la sala... 📡", "ph-circle-notch", "info");
            conectarRealtimeVersus();
        }

        // 🎲 TIEMPO ALEATORIO: Calculamos un rango entre 15s y 20s para el bot
        const tiempoEsperaAleatorio = 29000 + Math.random() * 5000;

        if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
        versusTimeoutBusqueda = setTimeout(() => {
            if (!versusPartidaEnCurso) {
                activarBotDeRescate();
            }
        }, tiempoEsperaAleatorio); 
        
    } catch (e) {
        // ESCUDO FINAL: Si Javascript se rompe por alguna otra razón
        console.error("🚨 Error crítico inesperado en el matchmaking:", e.message);
        cerrarLobbyEspera(); 
        showToast("Error crítico en el emparejamiento.", "ph-x-circle", "danger");
        esModoVersus = false;
    }
}


// Activa un jugador virtual creíble para que el usuario no quede colgado
// Activa un jugador virtual creíble para que el usuario no quede colgado
// 🔥 MOTOR DE INTELIGENCIA Y TIMING DINÁMICO DEL BOT
// 🔥 MOTOR DE INTELIGENCIA Y TIMING DINÁMICO DEL BOT (CON SENSOR DE TIERRA FIRME ANTI-MAR)
// 🔥 MOTOR DE INTELIGENCIA Y TIMING DINÁMICO DEL BOT (SILENCIOSO)
async function ejecutarVotoBotDinamico() {
    if (!esModoBot || rivalGuessConfirmado) return;

    const tLat = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Latitud')).trim().replace(',', '.'));
    const tLng = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Longitud')).trim().replace(',', '.'));

    let botLat = tLat;
    let botLng = tLng;
    let botDist = 0;
    let botPts = 0;

    // 🔄 BUCLE DE CONTROL: Intentamos hasta 4 veces encontrar un punto que caiga en tierra firme
    for (let intento = 0; intento < 4; intento++) {
        // Generamos el error en KM creíble (Entre 80km y 850km)
        const kmErrorAleatorio = 80 + Math.random() * 770;
        const anguloGrad = Math.random() * Math.PI * 2;
        
        const desfaseLat = (kmErrorAleatorio * Math.cos(anguloGrad)) / 111;
        const desfaseLng = (kmErrorAleatorio * Math.sin(anguloGrad)) / (111 * Math.cos(tLat * Math.PI / 180));
        
        botLat = tLat + desfaseLat;
        botLng = tLng + desfaseLng;
        
        botDist = calcularDistanciaHaversine(botLat, botLng, tLat, tLng);
        botPts = isNaN(botDist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -botDist / 1200)));

        // 🛰️ SENSOR DE AGUA: Validamos la coordenada con un servicio de geolocalización
        try {
            const respuesta = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${botLat}&longitude=${botLng}&localityLanguage=es`);
            const datosGeograficos = await respuesta.json();
            
            // Si la API nos devuelve un 'countryCode' válido, el punto cayó en tierra firme
            if (datosGeograficos && datosGeograficos.countryCode) {
                // 👇 Magia: Borramos el console.log que delataba al bot
                break; // Rompemos el bucle porque el tiro es perfecto
            }
        } catch (e) {
            // 👇 Magia: Borramos el console.warn para que no salten errores rojos
            break; // Si la API falla por time-out, salimos para no trabar el juego del usuario
        }
    }
    
    rivalGuessConfirmado = true;
    rivalDataRonda = { lat: botLat, lng: botLng, puntos: botPts, distancia: botDist };

    // 🎯 SI VOS TODAVÍA NO ELEGISTE: Te mete la presión de los 15 segundos clásicos
    if (!miGuessConfirmado) {
        showToast("⚠️ ¡Tu oponente ya arriesgó! Tenés 15 segundos para confirmar tu pin.", "ph-timer", "danger");
        iniciarCuentaRegresivaVersus();
    } else {
        // Si vos ya elegiste, abre el mapa de resultados directo
        mostrarResultadosMutuosVersus();
    }
}
function activarBotDeRescate() {
    cerrarLobbyEspera(); 
    
    if (handshakeInterval) clearInterval(handshakeInterval);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
    
    if (versusChannel) {
        versusChannel.unsubscribe();
        versusChannel = null;
    }

    esModoVersus = true;
    versusPartidaEnCurso = true;
    esModoBot = true; 
    versusRol = 'jugador_1'; 
    
    const nombresFakes = [
        "Nico_88", "Santi_Casla", "Faca_Gamer", "PibeFUT", "ElDiego_DT", "Juani8794", "Pulga10", "Panhito",
        "Gonza_23", "Matias14", "Rulo_94", "Juani_Albiceleste", "Toto_Cancha", "Láser", "Nari", "Gordo12"
    ];
    // Asignamos el nombre a la variable global
    versusRivalNombre = nombresFakes[Math.floor(Math.random() * nombresFakes.length)];
    
    showToast(`¡Rival encontrado: ${versusRivalNombre}! Sincronizando... ⚽`, "ph-user-switch", "success");
    
    if (!versusEstadios || versusEstadios.length === 0) {
        const misEstadiosAleatorios = obtener5EstadiosVersus();
        versusEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));
    }

    setTimeout(arrancarPartidoVersus, 1200);
}


// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Blindado)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Blindado)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Blindado)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Blindado con Telemetría)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico Blindado)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico + Presencia Activa)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico + Presencia Activa)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico + Presencia Activa)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico + Nombres)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico Blindado)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Restaurado + Nombres)
// Función para abrir el WebSocket y comunicarse DIRECTO entre pantallas (Handshake Simétrico + Nombres + Estadios)
function conectarRealtimeVersus() {
    if (!supabaseClient || !versusPartidaId) return;
    
    let idUsuario = getUserId();
    if (!idUsuario || idUsuario === 'guest') {
        idUsuario = sessionStorage.getItem('ev_guest_versus_id') || 'guest';
    }

    let miNombreLocal = obtenerNombreDisplay();

    console.log(`[1v1] 📡 Inicializando canal de Supabase: sala_${versusPartidaId} | Identificador de red: ${idUsuario}`);
    versusChannel = supabaseClient.channel(`sala_${versusPartidaId}`, {
        config: { 
            broadcast: { self: false },
            presence: { key: idUsuario }
        }
    });

    versusChannel
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log("[1v1] 🚨 Desconexión de socket detectada mediante Presence de Supabase:", leftPresences);
            if (versusPartidaEnCurso && !esModoBot) {
                manejarAbandonoRival();
            }
        })
        .on('broadcast', { event: 'rival_entro' }, (response) => {
            const data = response.payload || response;
            // Red de respuesta fluida: si el ID no es mío, respondo con la confirmación oficial
            if (data && data.id !== idUsuario) {
                console.log(`[1v1] 📥 Rival detectado en la sala. Enviando confirmación con estadios.`);
                
                if (data.nombre) versusRivalNombre = data.nombre;

                versusChannel.send({
                    type: 'broadcast',
                    event: 'host_confirmado',
                    payload: { id: idUsuario, nombre: miNombreLocal, estadios: versusEstadios } 
                });
            }
        })
        .on('broadcast', { event: 'host_confirmado' }, (response) => {
            const data = response.payload || response;
            if (data && data.id !== idUsuario) {
                console.log(`[1v1] 📥 Recibida confirmación de configuración de estadios.`);
                
                if (data.nombre) versusRivalNombre = data.nombre;
                
                // Solo el invitado adopta los mapas del creador para mantener sincronía perfecta
                if (data.estadios && data.estadios.length > 0 && versusRol === 'jugador_2') {
                    versusEstadios = data.estadios;
                }

                versusChannel.send({
                    type: 'broadcast',
                    event: 'invitado_listo',
                    payload: { id: idUsuario, nombre: miNombreLocal } 
                });

                // Si soy el invitado, doy el paso al frente para iniciar la partida
                if (!versusPartidaEnCurso && versusRol === 'jugador_2') {
                    versusPartidaEnCurso = true;
                    showToast(`¡Conectado con ${versusRivalNombre}! Que empiece el partido... 🚀`, "ph-lightning", "success");
                    arrancarPartidoVersus();
                }
            }
        })
        .on('broadcast', { event: 'invitado_listo' }, (response) => {
            const data = response.payload || response;
            if (data && data.id !== idUsuario) {
                if (data.nombre) versusRivalNombre = data.nombre;

                // Si soy el host, confirmo el silbato del invitado y arranco la cancha
                if (!versusPartidaEnCurso && versusRol === 'jugador_1') {
                    console.log(`[1v1] 📥 Host confirma que el oponente está listo. ¡Arrancando partido!`);
                    versusPartidaEnCurso = true;
                    showToast(`¡Rival conectado: ${versusRivalNombre}! Sincronizando cancha... 🚀`, "ph-lightning", "success");
                    arrancarPartidoVersus();
                }
            }
        })
        .on('broadcast', { event: 'rival_voto' }, (response) => {
            const data = response.payload || response;
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
        .on('broadcast', { event: 'rival_listo_siguiente' }, (response) => {
            rivalListoSiguiente = true;
            if (miListoSiguiente) {
                ejecutarPasoDeRondaVersus();
            }
        })
        .on('broadcast', { event: 'forzar_siguiente_ronda' }, (response) => {
            console.log("[1v1] Avance forzado sincronizado por inactividad.");
            ejecutarPasoDeRondaVersus();
        })
        .on('broadcast', { event: 'rival_abandono' }, (response) => {
            console.log("[1v1] El oponente abandonó la sesión.");
            manejarAbandonoRival();
        })
        .subscribe((status) => {
            console.log(`[1v1] 🚦 Estado de la conexión WebSocket en esta ventana: ${status}`);
            if (status === 'SUBSCRIBED') {
                versusChannel.track({ id: idUsuario });

                if (handshakeInterval) clearInterval(handshakeInterval);
                
                versusChannel.send({ type: 'broadcast', event: 'rival_entro', payload: { id: idUsuario, nombre: miNombreLocal } });
                
                handshakeInterval = setInterval(() => {
                    if (versusChannel && !versusPartidaEnCurso) {
                        versusChannel.send({ type: 'broadcast', event: 'rival_entro', payload: { id: idUsuario, nombre: miNombreLocal } });
                    }
                }, 400);
            }
        });
}
// Reloj de arena visual de 15 segundos si el rival arriesga primero
function iniciarCuentaRegresivaVersus() {
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    versusTiempoRestante = 15;
    
    versusTimerInterval = setInterval(() => {
        versusTiempoRestante--;
        const titleEl = document.getElementById('game-title');
        if (titleEl) {
            titleEl.innerHTML = `<i class="ph-bold ph-timer animate-pulse" style="color:var(--danger-color);"></i> ¡RIVAL ELIGIÓ! TE QUEDAN <span style="color:var(--danger-color); font-weight:900;">${versusTiempoRestante}s</span>`;
        }

        if (versusTiempoRestante <= 0) {
            clearInterval(versusTimerInterval);
            showToast("⏱️ ¡Tiempo agotado! Se confirma tu posición actual.", "ph-clock", "danger");
            if (!guessrSelectedLatLng) {
                guessrSelectedLatLng = { lat: 0, lng: 0 }; 
            }
            confirmarArriesgoLocalVersus();
        }
    }, 1000);
}

// Procesa el click de confirmación local en el modo Versus (Bloquea pantalla y transmite)
// Procesa el click de confirmación local en el modo Versus (Bloquea pantalla y transmite)
function confirmarArriesgoLocalVersus() {
    try {
        if (versusTimerInterval) clearInterval(versusTimerInterval);
        if (botAntesTimer) clearTimeout(botAntesTimer); // 🛡️ Frenamos el tiro anticipado si vos jugaste primero

        const btn = document.getElementById('game-action-btn');
        btn.setAttribute('data-estado', 'procesando');
        btn.disabled = true;

        if (!guessrSelectedLatLng) {
            guessrSelectedLatLng = { lat: 0, lng: 0 };
        }

        const tLat = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Latitud')).trim().replace(',', '.'));
        const tLng = parseFloat(String(bscarPropiedad(guessrEstadioCorrecto, 'Longitud')).trim().replace(',', '.'));
        
        const dist = calcularDistanciaHaversine(guessrSelectedLatLng.lat, guessrSelectedLatLng.lng, tLat, tLng);
        const pts = isNaN(dist) ? 0 : Math.max(0, Math.round(5000 * Math.pow(Math.E, -dist / 1200)));

        miGuessConfirmado = true;

        // Transmitimos datos solo si jugamos contra un humano real
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
            const titleEl = document.getElementById('game-title');
            if (titleEl) titleEl.innerHTML = `RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; ¡Ubicación enviada! ⏳`;
            
            if (esModoBot) {
                // Como vos elegiste primero, el bot reacciona entre 1.5s y 3.5s después de forma fluida
                setTimeout(() => {
                    ejecutarVotoBotDinamico();
                }, 1500 + Math.random() * 2000);
            } else {
                iniciarRelojEsperaRivalVersus();
            }
        }
    } catch (error) {
        console.error("🚨 Error crítico al intentar enviar el voto local:", error);
    }
}

// Reloj de resguardo que evita que el primer jugador se quede colgado si el rival se congela
// Reloj de resguardo que evita que el primer jugador se quede colgado si el rival se congela
function iniciarRelojEsperaRivalVersus() {
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    versusTiempoRestante = 15;
    
    versusTimerInterval = setInterval(() => {
        versusTiempoRestante--;
        const titleEl = document.getElementById('game-title');
        if (titleEl) {
            titleEl.innerHTML = `RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; Esperando oponente... <span style="color:var(--danger-color); font-weight:900;">${versusTiempoRestante}s</span>`;
        }

        if (versusTiempoRestante <= 0) {
            clearInterval(versusTimerInterval);
            showToast("⏱️ El oponente no respondió a tiempo. Procesando ronda.", "ph-clock", "warning");
            
            // 🔥 Forzamos el bypass de tiempo para avanzar sin esperarlo en la transición
            rivalForcedTimeout = true; 
            rivalGuessConfirmado = true;
            rivalDataRonda = { lat: 0, lng: 0, puntos: 0, distancia: 9999 };
            mostrarResultadosMutuosVersus();
        }
    }, 1000);
}
// Abre las cartas: Dibuja ambos pines, calcula el puntaje y unifica el mapa
function mostrarResultadosMutuosVersus() {
    if (resultadosRondaMostrados) return; 
    resultadosRondaMostrados = true;

    if (versusTimerInterval) clearInterval(versusTimerInterval);
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
        club: bscarPropiedad(guessrEstadioCorrecto, 'Club'), // <- ACÁ AGREGAMOS EL CLUB
        distancia: miDist,
        puntos: misPts
    });

    if (!isNaN(miDist) && miDist < 5) userStats.medallaLocalista = true;
    if (!isNaN(miDist) && miDist < 1) userStats.guessrUnKm = true;
    actualizarDotsProgreso();

    guessrTargetMarker = L.circleMarker([tLat, tLng], {radius: 9, color: '#00e676', fillColor: '#111820', fillOpacity: 1, weight: 3})
        .addTo(guessrMapInstance).bindPopup(`<b>${bscarPropiedad(guessrEstadioCorrecto, 'Estadio')}</b>`).openPopup();
    
    guessrPolyline = L.polyline([[guessrSelectedLatLng.lat, guessrSelectedLatLng.lng], [tLat, tLng]], {color: '#ff4757', weight: 2, dashArray: '6,8'}).addTo(guessrMapInstance);

    const rivalMarker = L.circleMarker([rivalDataRonda.lat, rivalDataRonda.lng], {radius: 8, color: '#2979ff', fillColor: '#111820', fillOpacity: 1, weight: 3})
        .addTo(guessrMapInstance).bindPopup(`<b>Rival (+${rivalDataRonda.puntos} pts)</b>`);

    L.polyline([[rivalDataRonda.lat, rivalDataRonda.lng], [tLat, tLng]], {color: '#2979ff', weight: 2, dashArray: '4,6'}).addTo(guessrMapInstance);

    let marcasParaEncuadrar = [guessrTargetMarker, rivalMarker];
    if (guessrUserMarker) marcasParaEncuadrar.push(guessrUserMarker);
    guessrMapInstance.fitBounds(L.featureGroup(marcasParaEncuadrar).getBounds(), {padding: [50, 50]});

    const fraseFolkloreVersus = obtenerFraseFolklore(miDist);
document.getElementById('game-title').innerHTML = `<div style="font-size: 0.85rem; color: #ffea00; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; animation: bounceFun 0.4s ease;">${fraseFolkloreVersus}</div><div style="font-size: 0.8rem; opacity: 0.8;">RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span></div>`;

    miListoSiguiente = false;
    rivalListoSiguiente = false;
    
    const miDistT = isNaN(miDist) ? '?' : (miDist < 1 ? `${Math.round(miDist * 1000)} m` : `${miDist.toFixed(1)} km`);
    
    if (guessrRondaActual < 5) {
        btn.innerHTML = `Sumaste +${misPts} pts (${miDistT}) | Rival: +${rivalDataRonda.puntos} pts. Avanzar <i class="ph-bold ph-arrow-right"></i>`;
    } else {
        btn.innerHTML = `Finalizar Partido Mano a Mano 🏁`;
    }
    
    btn.style.background = "linear-gradient(90deg, #00e676, #2979ff)";
btn.style.color = "#000";
btn.style.boxShadow = "0 5px 0 #0d5332";
// 👇 SPRINT VIRAL - PASO 3: EFECTOS JUICY EN VERSUS 👇
dispararJuicinessRonda(miDist);
    
    btn.setAttribute('data-estado', 'resultado');
    btn.disabled = false;
    btn.onclick = () => solicitarSiguienteRondaVersus();
}

// Avisa por canal rápido que estás listo para cambiar de ronda
// Avisa por canal rápido que estás listo para cambiar de ronda
// Avisa por canal rápido que estás listo para cambiar de ronda
// Avisa por canal rápido que estás listo para cambiar de ronda (Bypass para Bot)
// Avisa por canal rápido que estás listo para cambiar de ronda (Bypass para Bot)
function solicitarSiguienteRondaVersus() {
    const btn = document.getElementById('game-action-btn');
    miListoSiguiente = true;
    btn.disabled = true;
    btn.innerHTML = `<i class="ph-bold ph-circle-notch animate-spin"></i> Esperando oponente...`;

    // 🤖 SI ES UN BOT: No hay WebSocket activo, evitamos la espera de red y pasamos de estadio ya mismo
    if (esModoBot) {
        ejecutarPasoDeRondaVersus();
        return;
    }

    if (rivalForcedTimeout) {
        // Le avisamos al oponente colgado que saltamos de fase obligatoriamente
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
// Vacía el mapa e inicia formalmente la ronda que sigue
// Vacía el mapa e inicia formalmente la ronda que sigue
function ejecutarPasoDeRondaVersus() {
    // 🛡️ LIMPIEZA DE SEGURIDAD: Matamos el temporizador de iniciativa del bot por si quedó corriendo
    if (botAntesTimer) clearTimeout(botAntesTimer);

    [guessrUserMarker, guessrTargetMarker, guessrPolyline].forEach(m => {
        try { if (m) m.remove(); } catch (e) {}
    });
    guessrUserMarker = guessrTargetMarker = guessrPolyline = null;

    miGuessConfirmado = false;
    rivalGuessConfirmado = false;
    rivalDataRonda = null;
    miListoSiguiente = false;
    rivalListoSiguiente = false;
    rivalForcedTimeout = false; // Reseteamos el bypass para evaluar el siguiente estadio
    resultadosRondaMostrados = false;
    guessrRondaActual++;
    
    if (guessrRondaActual <= 5) {
        lanzarRondaGuessr();
    } else {
        finalizarJuegoGuessr();
    }
}
// Resetea a cero los contadores generales del 1v1 (Limpieza de Reloj de Búsqueda)
// Resetea a cero los contadores generales del 1v1 (Limpieza de Reloj de Búsqueda)
function arrancarPartidoVersus() {
    // 🛡️ LIMPIEZA DE SEGURIDAD ABSOLUTA: Cancelamos timers de bots y búsqueda
    if (botAntesTimer) clearTimeout(botAntesTimer);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda);
    if (timeoutRetoDirecto) { clearTimeout(timeoutRetoDirecto); timeoutRetoDirecto = null; }
    
    // 📡 CENTRALIZADO: Apagamos el bucle del Handshake por completo para que no mande ráfagas de red en medio del juego
    if (handshakeInterval) {
        clearInterval(handshakeInterval);
        handshakeInterval = null;
    }
    
    cerrarLobbyEspera(); // Apaga el cronómetro visual del lobby porque ya arranca el partido

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
    let pool = catalogoGlobal.filter(f => {
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

function iniciarRetoDiario() {
    cerrarLobbyEspera(); // Limpiamos por las dudas
    if (!catalogoGlobal.length) {
        showToast('Esperá que cargue el catálogo de estadios...', 'ph-info', 'warning');
        return;
    }

    // 👇 CONTROL DIARIO: REVISA SI YA JUGÓ HOY 👇
    const idUsuario = getUserId();
    const hoy = new Date();
    const fechaHoy = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
    const ultimoRetoJugado = localStorage.getItem('ev_reto_diario_fecha_' + idUsuario);

    if (ultimoRetoJugado === fechaHoy) {
        showToast("¡Ya completaste el reto de hoy! Volvé mañana. ⏳", "ph-calendar-check", "warning");
        return; // Frena la ejecución y no lo deja jugar
    }
    // 👆 FIN DEL CONTROL DIARIO 👆

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
    lanzarRondaGuessr();
}

// TU FUNCIÓN CLÁSICA DE SIEMPRE (Protegiendo el modo solitario y apagando la IA)
// TU FUNCIÓN CLÁSICA DE SIEMPRE (Protegiendo el modo solitario y apagando la IA)
function iniciarTrivia(){ 
    cerrarLobbyEspera(); // 🔥 LÍNEA NUEVA: Limpieza preventiva por si venías de cancelar un Versus
    
    esModoVersus = false; 
    esModoBot = false; // 🤖 Desactivamos el bot de raíz para que no interfiera en solitario
    esModoDiario = false;
    
    if (handshakeInterval) clearInterval(handshakeInterval);
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    if (versusTimeoutBusqueda) clearTimeout(versusTimeoutBusqueda); // Limpieza de seguridad de búsqueda
    
    if(!catalogoGlobal.length){showToast('Esperá que cargue el catálogo...','ph-info','danger');return;}
    guessrHistorialCoordenadas = [];
    guessrRondaActual=1;guessrPuntosTotales=0;guessrEstadiosJugados=[];guessrHistorialRondas=[];pendingScore=null;pendingScoreType=null;userStats.guessrSeguidas=(userStats.guessrSeguidas||0)+1;guardarStats();lanzarRondaGuessr();
}

// MOTOR DEL GUESSR ADAPTADO (Y CON EL TYPO TOTALMENTE REPARADO)
function lanzarRondaGuessr(){
const disp=catalogoGlobal.filter(f=>{const l=bscarPropiedad(f,'Link del Video').toString().trim();return(l.includes('youtube.com')||l.includes('youtu.be'))&&bscarPropiedad(f,'Latitud').toString().trim()!==''&&bscarPropiedad(f,'Longitud').toString().trim()!==''&&!guessrEstadiosJugados.includes(bscarPropiedad(f,'Estadio'));});

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
    document.getElementById('taunts-container').style.display = 'flex';
    
} else if (esModoDiario) {
    // 🌍 LÓGICA NUEVA: RETO DIARIO
    const nombreEstadioDiario = estadiosDiariosList[guessrRondaActual - 1];
    guessrEstadioCorrecto = catalogoGlobal.find(e => bscarPropiedad(e, 'Estadio') === nombreEstadioDiario);
    guessrEstadiosJugados.push(nombreEstadioDiario);

} else {
    // LÓGICA CLÁSICA: MODO INDIVIDUAL ALEATORIO
    if(!disp.length){showToast('¡Completaste todas las ubicaciones!');cerrarModalVideo();return;}
    guessrEstadioCorrecto=disp[Math.floor(Math.random()*disp.length)];
    guessrEstadiosJugados.push(bscarPropiedad(guessrEstadioCorrecto,'Estadio'));
}

guessrSelectedLatLng=null;actualizarDotsProgreso();
const hintOverlay=document.getElementById('map-hint-overlay');if(hintOverlay)hintOverlay.style.opacity='1';
document.getElementById('game-title').innerHTML=`<i class="ph-duotone ph-flag-banner" style="color:var(--accent-color);"></i> RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--accent-color);">${guessrPuntosTotales}</span> PTS`;
const btn=document.getElementById('game-action-btn');btn.innerHTML=`<i class="ph-duotone ph-map-pin"></i> Clavá un pin en el mapa`;btn.className="btn-3d secondary";btn.style.width="100%";btn.disabled=true;btn.setAttribute('data-estado','juego');btn.onclick=()=>btn.getAttribute('data-estado')==='juego'?procesarArriesgoGuessr():avanzarDeRondaGuessr();
abrirModalVideo(null,bscarPropiedad(guessrEstadioCorrecto,'Link del Video').trim(),true);
// PEGAR ESTO REEMPLAZANDO EL SETTIMEOUT(..., 600) DE lanzarRondaGuessr:
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
            const hint = document.getElementById('map-hint-overlay');
            if (hint) hint.style.opacity = '0';
            btn.innerHTML = `<i class="ph-fill ph-rocket-launch"></i> ¡Confirmar ubicación!`;
            btn.className = "btn-3d primary";
            btn.disabled = false;
        });

        // 🛡️ ResizeObserver: Garantiza que el mapa se dibuje bien apenas el contenedor es visible (Mejor que un setTimeout)
        const resizeObserver = new ResizeObserver(() => {
            if (guessrMapInstance) guessrMapInstance.invalidateSize();
        });
        resizeObserver.observe(mapContainer);

        // Limpiamos el observer cuando el mapa se remueva para no gastar memoria
        guessrMapInstance.on('unload', () => resizeObserver.disconnect());

    }, 300); // Podemos bajarlo a 300ms porque el ResizeObserver lo ataja seguro
// 🤖 CONFIGURACIÓN DE INICIATIVA DEL BOT (50% de chances de que elija antes entre 12 y 24s)
    if (esModoBot) {
        if (botAntesTimer) clearTimeout(botAntesTimer);
        if (Math.random() < 0.5) {
            botAntesTimer = setTimeout(() => {
                ejecutarVotoBotDinamico();
            }, 12000 + Math.random() * 12000); // Elige exactamente entre 12000ms y 24000ms
        }
    }
}

function procesarArriesgoGuessr(){
if (esModoVersus) {
    confirmarArriesgoLocalVersus();
    return;
}

const btn=document.getElementById('game-action-btn');if(btn.getAttribute('data-estado')==='procesando'||btn.getAttribute('data-estado')==='resultado')return;btn.setAttribute('data-estado','procesando');btn.disabled=true;
const tLat=parseFloat(String(bscarPropiedad(guessrEstadioCorrecto,'Latitud')).trim().replace(',','.')),tLng=parseFloat(String(bscarPropiedad(guessrEstadioCorrecto,'Longitud')).trim().replace(',','.'));
const dist=calcularDistanciaHaversine(guessrSelectedLatLng.lat,guessrSelectedLatLng.lng,tLat,tLng);const pts=isNaN(dist)?0:Math.max(0,Math.round(5000*Math.pow(Math.E,-dist/1200)));
guessrPuntosTotales+=pts;
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
guessrPolyline=L.polyline([[guessrSelectedLatLng.lat,guessrSelectedLatLng.lng],[tLat,tLng]],{color:'#ff4757',weight:2,dashArray:'6,8'}).addTo(guessrMapInstance);
guessrMapInstance.fitBounds(L.featureGroup([guessrUserMarker,guessrTargetMarker]).getBounds(),{padding:[40,40]});
const fraseFolklore = obtenerFraseFolklore(dist);
document.getElementById('game-title').innerHTML = `<div style="font-size: 0.85rem; color: #ffea00; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; animation: bounceFun 0.4s ease;">${fraseFolklore}</div><div style="font-size: 0.8rem; opacity: 0.8;">RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span></div>`;
const distT=isNaN(dist)?'?':(dist<1?`${Math.round(dist*1000)} m`:`${dist.toFixed(1)} km`),emoji=dist<50?'🎯':dist<200?'✈️':dist<800?'🗺️':'🌍',esExc=!isNaN(dist)&&dist<100,esBien=!isNaN(dist)&&dist<500;
btn.innerHTML=`${emoji} ${distT} de error &nbsp;·&nbsp; <b>+${pts} pts</b> &nbsp; Siguiente <i class="ph-bold ph-arrow-right"></i>`;
if(esExc){btn.style.background="var(--accent-color)";btn.style.color="#000";btn.style.boxShadow="0 5px 0 #0a7a3a";}else if(esBien){btn.style.background="#ff8f00";btn.style.color="#000";btn.style.boxShadow="0 5px 0 #bf360c";}else{btn.style.background="var(--danger-color)";btn.style.color="#fff";btn.style.boxShadow="0 5px 0 #8b0000";}
// 👇 SPRINT VIRAL - PASO 3: EFECTOS JUICY EN SOLITARIO 👇
dispararJuicinessRonda(dist);
btn.setAttribute('data-estado','resultado');btn.disabled=false;
}

function avanzarDeRondaGuessr(){[guessrUserMarker,guessrTargetMarker,guessrPolyline].forEach(m=>{try{if(m)m.remove();}catch(e){}});guessrUserMarker=guessrTargetMarker=guessrPolyline=null;guessrRondaActual++;guessrRondaActual<=5?lanzarRondaGuessr():finalizarJuegoGuessr();}



// CIERRE DEL JUEGO ADAPTADO PARA MULTIJUGADOR (HUMANO/BOT) Y SOLITARIO
async function finalizarJuegoGuessr(){
    const container=document.getElementById('modal-video-container');
    document.getElementById('game-ui').style.display='none';
    container.style.height='100%';
    document.getElementById('modal-card').classList.remove('stadium-guessr-layout');
    document.getElementById('modal-card').classList.add('resultado-final');
    document.getElementById('modal-card').classList.add('resultado-final-layout');
    
    if(guessrMapInstance){try{guessrMapInstance.remove();}catch(e){}guessrMapInstance=null;}

    // 👇 1. ARMAMOS LA TABLA DE DESGLOSE PARA TODOS LOS MODOS 👇
    let histHTML=`<div style="width:100%;max-width:100%;text-align:left;margin:0 auto 20px;background:var(--surface-color);border:2px solid var(--border-strong);border-radius:16px;padding:14px;"><h4 style="font-size:.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed var(--border-subtle);">Desglose por ronda</h4>`;
    
    guessrHistorialRondas.forEach(item => {
        const dT = isNaN(item.distancia) ? '?' : (item.distancia < 1 ? `${Math.round(item.distancia * 1000)} m` : `${item.distancia.toFixed(1)} km`);
        const starColor = item.puntos > 3000 ? '#00e676' : item.puntos > 1000 ? '#ff8f00' : '#ff4757';
        
        // Estructura Flexbox prolija: Nombre cortado con "..." si es muy largo, y Club chiquito abajo
        histHTML += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border-subtle);font-size:.88rem;">
            <div style="display:flex;flex-direction:column;overflow:hidden;max-width:55%;">
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><b style="color:var(--accent-color);">R${item.ronda}:</b> ${item.estadio}</span>
                <span style="font-size:0.7rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;">${item.club || ''}</span>
            </div>
            <span style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <span style="color:var(--text-muted);font-size:.75rem;">${dT}</span>
                <b style="color:${starColor};">+${item.puntos}</b>
            </span>
        </div>`;
    });
    histHTML+='</div>';
    // 👆 FIN DE LA TABLA 👆

    // ==========================================
    // CIERRE MODO VERSUS (1v1)
    // ==========================================
   // ==========================================
    // CIERRE MODO VERSUS (1v1)
    // ==========================================
    if (esModoVersus) {
        esModoVersus = false;          
        versusPartidaEnCurso = false;  
        
        if (versusChannel) {
            try { supabaseClient.removeChannel(versusChannel); } catch(e) {}
            versusChannel = null;
        }

        const id = getUserId();
        const nombreLocal = getPref('ev_custom_nick', '') || obtenerUsuarioLogueado()?.name || 'Jugador';
        userStats.partidasJugadas = (userStats.partidasJugadas || 0) + 1;

        let nombreRivalFinal = (versusRivalNombre || "RIVAL").toUpperCase();
        let cartelResultado = "";
        let colorResultado = "#ffea00";
        
        const ligaJugada = versusLigaOrigen; // Rescatamos el nombre de la liga en la que estamos

        // ACÁ MANDAMOS LOS PUNTOS A LA LIGA (Si el partido nació en una)
        if (ligaJugada) {
            await enviarPuntaje(nombreLocal, guessrPuntosTotales, obtenerUsuarioLogueado()?.email || '', 'duelo_' + ligaJugada);
        }
        
        if (guessrPuntosTotales > rivalPuntosTotales) {
            cartelResultado = "¡VICTORIA! 🏆";
            colorResultado = "#00e676";
            showToast("¡Ganaste el partido! Victoria guardada en el ranking. 🔥", "ph-trophy", "success");
            userStats.partidasGanadas = (userStats.partidasGanadas || 0) + 1;
            guardarStats(); 
            // Guardamos el triunfo (liga queda en null automáticamente si el duelo no nació en una liga)
            try { await supabaseClient.from('victorias_versus').insert([{ id_usuario: id, nombre: nombreLocal, liga: ligaJugada }]); } catch(err) {}
        } else if (guessrPuntosTotales < rivalPuntosTotales) {
            cartelResultado = "DERROTA ❌";
            colorResultado = "#ff4757";
            showToast("Derrota. ¡A entrenar para la revancha! ⚽", "ph-x-circle", "danger");
        } else {
            cartelResultado = "¡EMPATE DE CRACKS! 🤝";
            colorResultado = "#2979ff";
        }

        versusLigaOrigen = null; // Limpiamos para el próximo partido

        // Botón inteligente: Vuelve a la liga si jugaste por liga, sino al global
        const botonFinal = ligaJugada 
            ? `<button onclick="cerrarModalVideo(); abrirModalLigaAmigosPrivada();" class="btn-3d primary" style="padding:12px 24px;max-width:100%;width:100%;"><i class="ph-fill ph-users-three"></i> Volver a mi Liga</button>`
            : `<button onclick="cerrarModalVideo(); abrirModalRanking('v_historico');" class="btn-3d primary" style="padding:12px 24px;max-width:100%;width:100%;"><i class="ph-fill ph-medal"></i> Ver Tabla de Posiciones</button>`;

        container.innerHTML = `
        <div style="text-align:center;padding:60px 24px 30px;color:var(--text-main);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;height:100%;overflow-y:auto;background:var(--bg-color);">
            <h2 style="font-size:1.8rem;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:${colorResultado};">${cartelResultado}</h2>
            <p style="color:var(--text-muted);margin-bottom:20px;font-size:.95rem;">Marcador Final del Mano a Mano</p>
            
            <div style="display:flex;align-items:center;gap:30px;background:var(--surface-color);border:2px solid var(--border-strong);padding:15px 30px;border-radius:16px;margin-bottom:20px;width:100%;max-width:100%;justify-content:center;">
                <div style="text-align:center;"><div style="font-size:.8rem;color:var(--text-muted);">VOS</div><strong style="font-size:1.8rem;color:#00e676;">${guessrPuntosTotales}</strong></div>
                <div style="font-size:1.5rem;font-weight:900;color:var(--border-strong);">VS</div>
                <div style="text-align:center;"><div style="font-size:.8rem;color:var(--text-muted);">${nombreRivalFinal}</div><strong style="font-size:1.8rem;color:#2979ff;">${rivalPuntosTotales}</strong></div>
            </div>
            
            ${histHTML} ${botonFinal}
        </div>`;
        return;
    }

    // ==========================================
    // CIERRE MODO SOLITARIO / RETO DIARIO
    // ==========================================
    if (esModoDiario) {
        const idUsuario = getUserId();
        const hoy = new Date();
        const fechaHoy = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
        localStorage.setItem('ev_reto_diario_fecha_' + idUsuario, fechaHoy);
    }

    if(guessrPuntosTotales>userStats.maxScore)userStats.maxScore=guessrPuntosTotales;
    if(guessrPuntosTotales>=20000)userStats.scoreMayor20000=true;
    if(guessrPuntosTotales>=10000)userStats.scoreMayor10000=true;
    if(guessrHistorialRondas.length===5&&guessrHistorialRondas.every(r=>r.puntos>=4000))userStats.guessrPerfecto=true;
    guardarStats();
    agregarXP(guessrPuntosTotales);
    pendingScore=guessrPuntosTotales;
    pendingScoreType='guessr';

    const strokeColor=guessrPuntosTotales>15000?'#00e676':guessrPuntosTotales>8000?'#ff8f00':'#ff4757',circumf=2*Math.PI*44,dashOff=circumf-(circumf*Math.min(guessrPuntosTotales,25000)/25000);
    const nivelActual=NIVELES[calcularNivelIdx(userStats.xpTotal)],esGoogle=esUsuarioGoogle();
    const guardarBtn=esGoogle?`<button onclick="guardarScoreGuessr()" class="btn-3d primary" style="padding:14px;width:100%;"><i class="ph-fill ph-paper-plane-tilt"></i> Guardar en ranking</button>`:`<div class="google-wall"><i class="ph-duotone ph-google-logo google-wall-icon"></i><h3>Guardá tu puntaje</h3><p>Para guardar tus resultados y aparecer en el ranking global, necesitás una cuenta de Google.</p><button onclick="pedirLoginParaGuardar()" class="btn-3d primary" style="padding:12px 24px;"><i class="ph-fill ph-sign-in"></i> Entrar con Google</button><button onclick="compartirResultado()" class="btn-3d secondary" style="padding:10px 20px;font-size:.88rem;"><i class="ph-bold ph-share-network"></i> Compartir</button></div>`;
    
    let botonCompartirDiario = '';
    if (esModoDiario) {
        botonCompartirDiario = `<button onclick="compartirRetoDiarioWordle()" class="btn-3d" style="background:#2979ff; color:#fff; width:100%; padding:14px; margin-top:10px; box-shadow: 0 5px 0 #004ba0; font-size: 1rem;"><i class="ph-bold ph-share-network"></i> Compartir Reto Diario</button>`;
    }
    
    container.innerHTML=`
    <div style="text-align:center;padding:60px 24px 30px;color:var(--text-main);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;height:100%;overflow-y:auto;background:var(--bg-color);">
        <h2 style="font-size:1.5rem;font-weight:900;text-transform:uppercase;margin-bottom:4px;letter-spacing:-.5px;">¡Misión Completada!</h2>
        <p style="color:var(--text-muted);margin-bottom:20px;font-size:.9rem;">Reconocimiento aéreo finalizado · <span style="color:${nivelActual.color};">${nivelActual.emoji} ${nivelActual.nombre}</span></p>
        
        <div class="result-score-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="44" fill="none" stroke="var(--border-strong)" stroke-width="10"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="${strokeColor}" stroke-width="10" stroke-dasharray="${circumf.toFixed(1)}" stroke-dashoffset="${dashOff.toFixed(1)}" stroke-linecap="round" style="transition:stroke-dashoffset 1.5s ease;filter:drop-shadow(0 0 6px ${strokeColor});"/>
            </svg>
            <div class="score-num"><strong style="font-size:1.6rem;color:${strokeColor};font-weight:900;line-height:1;">${guessrPuntosTotales}</strong><span style="font-size:.72rem;color:var(--text-muted);font-weight:700;">PUNTOS</span></div>
        </div>
        
        ${histHTML} <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:100%;">
            ${guardarBtn}${botonCompartirDiario}
            <div style="display:flex;gap:10px;margin-top:10px;">
                <button onclick="abrirModalRanking()" class="btn-3d secondary" style="flex:1;font-size:.85rem;padding:12px;"><i class="ph-fill ph-medal"></i> Ranking</button>
                <button onclick="iniciarTrivia()" class="btn-3d secondary" style="flex:1;font-size:.85rem;padding:12px;"><i class="ph-bold ph-arrow-counter-clockwise"></i> Rejugar</button>
            </div>
        </div>
    </div>`;
}

function guardarScoreGuessr(){pendingScore=guessrPuntosTotales;pendingScoreType='guessr';guardarScorePendiente();}
function calcularDistanciaHaversine(lat1,lon1,lat2,lon2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function compartirResultado(){const msg=`⚽ ¡Hice ${guessrPuntosTotales} puntos en StadiumGuessr | Estadios Virtuales! 🌍✈️ ¿Podés superarme?`;if(navigator.share)navigator.share({title:'StadiumGuessr',text:msg,url:location.href}).catch(()=>{});else{navigator.clipboard.writeText(`${msg} ${location.href}`).then(()=>showToast('¡Resultado copiado!')).catch(()=>showToast(`Puntaje: ${guessrPuntosTotales} pts`));}}

function compartirRetoDiarioWordle() {
    const hoy = new Date();
    const fechaText = String(hoy.getDate()).padStart(2, '0') + '/' + String(hoy.getMonth() + 1).padStart(2, '0');
    
    // Calificación de rendimiento viral según el puntaje total
    let rangoTexto = "¡Amateur total! 🥶";
    if (guessrPuntosTotales >= 22000) rangoTexto = "👑 ¡GALÁCTICO ABSOLUTO! (Nivel Dios) 👑";
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

    texto += emojisRondas.trim() + `\n\n👀 ¿Te da la nafta para ganarme o vas a arrugar?\n⚽ Desafiame acá: estadiosvirtuales.com`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            showToast("¡Texto picante copiado! Pegalo en tu grupo de WhatsApp 🚀", "ph-copy", "success");
        }).catch(err => {
            showToast("Tu navegador no soporta copiado directo.", "ph-warning-circle", "warning");
        });
    }
}

// SISTEMA DE RANKINGS INTEGRADO CON PESTAÑAS (SOLO, VERSUS TOTAL Y VERSUS SEMANAL)
async function abrirModalRanking(modoEspecifico = 'solo') {
    const body = document.getElementById('ranking-modal-body');
    body.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--text-muted);"><i class="ph-duotone ph-circle-notch" style="font-size:2.5rem;color:var(--accent-color);animation:spinSlow 1s linear infinite;"></i><br><br>Conectando al búnker...</div>';
    document.getElementById('ranking-modal').style.display = 'flex';
    
    let activeSolo = modoEspecifico === 'solo' ? 'active' : '';
    let activeVHist = modoEspecifico === 'v_historico' ? 'active' : '';
    let activeVSem = modoEspecifico === 'v_semanal' ? 'active' : '';
    let activeAmigos = modoEspecifico === 'amigos' ? 'active' : '';
    
    let subMenuHTML = `
    <div class="logros-tabs-row" style="margin-bottom:18px; display:flex; gap:4px; overflow-x:auto; padding:4px;">
        <button class="logro-tab-btn ${activeSolo}" onclick="abrirModalRanking('solo')">👤 Solo</button>
        <button class="logro-tab-btn ${activeVHist}" onclick="abrirModalRanking('v_historico')">🏆 1v1 Hist.</button>
        <button class="logro-tab-btn ${activeVSem}" onclick="abrirModalRanking('v_semanal')">🔥 Semanal</button>
    </div>`;

    try {
        let htmlContenido = "";
        
        if (modoEspecifico === 'solo') {
            const { data: ranking, error } = await supabaseClient
                .from('ranking')
                .select('nombre, puntaje')
                .eq('juego', 'guessr')
                .order('puntaje', { ascending: false })
                .limit(10);
            if (error) throw error;

            htmlContenido += `<div style="background:var(--surface-color);border:2px solid var(--border-strong);border-radius:16px;overflow:hidden;">`;
            if (!ranking || !ranking.length) {
                htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Aún no hay registros solitarios.</p>`;
            } else {
                ranking.forEach((f, i) => {
                    const m = ['🥇', '🥈', '🥉'];
                    const med = i < 3 ? m[i] : `<span style="color:var(--text-muted);">${i + 1}</span>`;
                    const nivelR = NIVELES[calcularNivelIdx(f.puntaje || 0)];
                    htmlContenido += `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:${i === ranking.length - 1 ? 'none' : '1px solid var(--border-subtle)'};font-size:.95rem;"><span style="font-weight:700;display:flex;align-items:center;gap:10px;">${med} ${sanitizarHTML(f.nombre || 'Anónimo')} <span style="font-size:.72rem;color:${nivelR.color};">${nivelR.emoji}</span></span><span style="color:var(--accent-color);font-weight:900;">${f.puntaje || 0} <span style="font-size:.78rem;color:var(--text-muted);">pts</span></span></div>`;
                });
            }
            htmlContenido += '</div>';
            
        } else if (modoEspecifico === 'v_historico' || modoEspecifico === 'v_semanal') {
            const tipoRpc = modoEspecifico === 'v_semanal' ? 'semanal' : 'historico';
            const { data: ranking, error } = await supabaseClient.rpc('obtener_ranking_versus_global', { p_tipo: tipoRpc });
            if (error) throw error;

            htmlContenido += `<div style="background:var(--surface-color);border:2px solid var(--border-strong);border-radius:16px;overflow:hidden;">`;
            if (!ranking || !ranking.length) {
                htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Sin partidos registrados en este período.</p>`;
            } else {
                ranking.forEach((f, i) => {
                    const m = ['🥇', '🥈', '🥉'];
                    const med = i < 3 ? m[i] : `<span style="color:var(--text-muted);">${i + 1}</span>`;
                    htmlContenido += `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:${i === ranking.length - 1 ? 'none' : '1px solid var(--border-subtle)'};font-size:.95rem;"><span style="font-weight:700;display:flex;align-items:center;gap:10px;">${med} ${sanitizarHTML(f.nombre_jugador || 'Anónimo')}</span><span style="color:var(--accent-color);font-weight:900;">${f.victorias_acumuladas || 0} <span style="font-size:.78rem;color:var(--text-muted);">W</span></span></div>`;
                });
            }
            htmlContenido += '</div>';
        } else if (modoEspecifico === 'amigos') {
            const codigoLigaGuardado = localStorage.getItem('ev_codigo_liga_amigos');
            if (!codigoLigaGuardado) {
                htmlContenido = `
                <div style="text-align:center; padding:20px 10px; background:var(--surface-color); border:2px solid var(--border-strong); border-radius:16px;">
                    <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:16px; line-height:1.5;">Creá una Mini Liga con tus amigos o ingresá el código de una existente para competir en un fixture privado.</p>
                    <input type="text" id="input-codigo-liga" placeholder="CÓDIGO DE 4 LETRAS" maxlength="4" style="text-transform:uppercase; text-align:center; padding:12px; width:100%; max-width:240px; background:var(--bg-color); border:2px solid var(--border-strong); border-radius:10px; color:#fff; font-weight:900; font-size:1.1rem; margin-bottom:14px; outline:none;">
                    <div style="display:flex; gap:10px; justify-content:center; width:100%; max-width:280px; margin:0 auto;">
                        <button onclick="crearOCargarLigaAmigos(true)" class="btn-3d primary" style="padding:10px 16px; font-size:0.85rem; flex:1;">Crear Nueva</button>
                        <button onclick="crearOCargarLigaAmigos(false)" class="btn-3d secondary" style="padding:10px 16px; font-size:0.85rem; flex:1; border-color:var(--accent-color); color:var(--accent-color);">Unirme</button>
                    </div>
                </div>`;
            } else {
                const { data: rankingCrudo, error } = await supabaseClient
                    .from('ranking')
                    .select('nombre, puntaje')
                    .eq('juego', 'guessr_' + codigoLigaGuardado)
                    .order('puntaje', { ascending: false })
                    .limit(500);
                if (error) throw error;

                // Agrupamos por nombre y nos quedamos con el mejor puntaje de cada integrante
                // (mismo criterio que la tabla nueva de "Mi Liga", para que no haya filas duplicadas).
                const mejorPorIntegranteFama = {};
                (rankingCrudo || []).forEach(row => {
                    const n = (row.nombre || 'Anónimo').trim();
                    const p = row.puntaje || 0;
                    if (!mejorPorIntegranteFama[n] || p > mejorPorIntegranteFama[n].puntaje) {
                        mejorPorIntegranteFama[n] = { nombre: n, puntaje: p };
                    }
                });
                const ranking = Object.values(mejorPorIntegranteFama)
                    .sort((a, b) => b.puntaje - a.puntaje)
                    .slice(0, 15);

                htmlContenido += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:var(--accent-dim); border:1px solid var(--accent-color); padding:10px 14px; border-radius:10px; font-size:0.85rem;">
                    <span>Liga Activa: <strong style="color:var(--accent-color); letter-spacing:0.5px;">${codigoLigaGuardado}</strong></span>
                    <button onclick="salirLigaAmigos()" style="background:none; border:none; color:var(--danger-color); cursor:pointer; font-weight:800; font-size:0.8rem; text-transform:uppercase;">Salir de Liga 🚪</button>
                </div>
                <div style="background:var(--surface-color);border:2px solid var(--border-strong);border-radius:16px;overflow:hidden;">`;
                
                if (!ranking || !ranking.length) {
                    htmlContenido += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Nadie registró puntos todavía en la liga <strong>${codigoLigaGuardado}</strong>. ¡Jugá un individual para inaugurarla!</p>`;
                } else {
                    ranking.forEach((f, i) => {
                        const m = ['🥇', '🥈', '🥉'];
                        const med = i < 3 ? m[i] : `<span style="color:var(--text-muted);">${i + 1}</span>`;
                        htmlContenido += `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:${i === ranking.length - 1 ? 'none' : '1px solid var(--border-subtle)'};font-size:.95rem;"><span style="font-weight:700;">${med} ${sanitizarHTML(f.nombre || 'Anónimo')}</span><span style="color:var(--accent-color);font-weight:900;">${f.puntaje || 0} <span style="font-size:.78rem;color:var(--text-muted);">pts</span></span></div>`;
                    });
                }
                htmlContenido += '</div>';
            }
        }

        body.innerHTML = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2.5rem;color:var(--accent-color);margin-bottom:5px;"><i class="ph-duotone ph-trophy"></i></div>
            <h2 style="font-size:1.4rem;font-weight:900;text-transform:uppercase;">Salón de la Fama</h2>
        </div>
        ${subMenuHTML}
        ${htmlContenido}`;
        
    } catch (e) {
        console.error("Error al leer ranking global:", e);
        body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger-color);"><i class="ph-duotone ph-warning-circle" style="font-size:3rem;"></i><br><br><b>Error de conexión con la base de datos</b></div>`;
    }
}
async function abrirModalRankingOrden(modo) {
    const body = document.getElementById('ranking-modal-body');
    body.innerHTML = '<div style="text-align:center;padding:50px;color:var(--text-muted);"><i class="ph-duotone ph-circle-notch" style="font-size:2rem;color:var(--accent-color);animation:spinSlow 1s linear infinite;"></i></div>';
    document.getElementById('ranking-modal').style.display = 'flex';
    
    try {
        const { data: r, error } = await supabaseClient
            .from('ranking')
            .select('nombre, puntaje')
            .eq('juego', modo)
            .order('puntaje', { ascending: false })
            .limit(10);

        if (error) throw error;

        let html = `<div style="text-align:center;margin-bottom:22px;"><h2 style="font-size:1.5rem;font-weight:900;">Top ${modo === 'capacidad' ? 'Capacidad' : 'Antigüedad'}</h2></div><div style="background:var(--surface-color);border:2px solid var(--border-strong);border-radius:16px;overflow:hidden;">`;
        
        if (!r || !r.length) {
            html += `<p style="color:var(--text-muted);text-align:center;padding:30px;">Sin marcas aún.</p>`;
        } else {
            r.forEach((f, i) => {
                const m = ['🥇', '🥈', '🥉'];
                const med = i < 3 ? m[i] : `<span style="color:var(--text-muted);">${i + 1}</span>`;
                html += `<div style="display:flex;justify-content:space-between;padding:14px 18px;border-bottom:${i === r.length - 1 ? 'none' : '1px solid var(--border-subtle)'}"><span style="font-weight:700;display:flex;align-items:center;gap:10px;">${med} ${sanitizarHTML(f.nombre || 'Anónimo')}</span><span style="color:var(--accent-color);font-weight:900;">${f.puntaje || 0} pts</span></div>`;
            });
        }
        html += '</div>';
        body.innerHTML = html;
    } catch (e) {
        console.error("Error al leer ranking orden de Supabase:", e);
        body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger-color);"><b>Error de conexión con la base de datos</b></div>`;
    }
}
function abrirModalOrden(){
document.getElementById('order-modal').style.display='flex';const body=document.getElementById('order-modal-body');
body.innerHTML=`<div style="text-align:center;color:var(--text-main);padding:20px;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;"><div class="animate-bounce" style="margin-bottom:16px;color:var(--accent-color);font-size:4rem;filter:drop-shadow(0 0 15px var(--accent-glow));"><i class="ph-duotone ph-sort-ascending"></i></div><h2 style="font-size:1.7rem;font-weight:900;text-transform:uppercase;margin-bottom:10px;">Desafío de Orden</h2><p style="color:var(--text-muted);font-size:.95rem;max-width:380px;line-height:1.6;margin-bottom:32px;">Demostrá tu conocimiento. Tocá dos tarjetas para intercambiarlas y ordenalas correctamente.</p><div style="display:flex;flex-direction:column;gap:14px;width:100%;max-width:300px;"><button onclick="iniciarJuegoOrden('capacidad')" class="btn-3d primary" style="padding:15px;font-size:1rem;"><i class="ph-duotone ph-users-three"></i> Por Capacidad</button><button onclick="iniciarJuegoOrden('antiguedad')" class="btn-3d secondary" style="padding:15px;font-size:1rem;"><i class="ph-duotone ph-hourglass-high"></i> Por Antigüedad</button><div style="display:flex;gap:10px;margin-top:8px;"><button onclick="abrirModalRankingOrden('capacidad')" class="btn-3d secondary" style="flex:1;padding:10px;font-size:.82rem;"><i class="ph-fill ph-medal"></i> Top Cap.</button><button onclick="abrirModalRankingOrden('antiguedad')" class="btn-3d secondary" style="flex:1;padding:10px;font-size:.82rem;"><i class="ph-fill ph-medal"></i> Top Edad</button></div></div></div>`;
}
function iniciarJuegoOrden(modo){
const pool=catalogoGlobal.length>0?catalogoGlobal:estadiosCargados;if(!pool.length){showToast('Esperá un momento...','ph-info','danger');return;}
orderModo=modo;orderSelectedIdx=null;orderPuntosGanados=0;
const validos=pool.filter(f=>{const n=bscarPropiedad(f,'Estadio'),c=bscarPropiedad(f,'Club');if(!n||!c)return false;const raw=String(bscarPropiedad(f,modo==='capacidad'?'Capacidad':'Año')).replace(/[^0-9]/g,'');return raw!==''&&parseInt(raw)>0;});
if(validos.length<5){showToast('No hay suficientes datos.','ph-warning-circle','danger');return;}
let sel=[],copia=[...validos];
while(sel.length<5){const idx=Math.floor(Math.random()*copia.length);const e=copia.splice(idx,1)[0];const val=parseInt(String(bscarPropiedad(e,modo==='capacidad'?'Capacidad':'Año')).replace(/[^0-9]/g,''))||0;sel.push({estadio:bscarPropiedad(e,'Estadio'),club:bscarPropiedad(e,'Club'),pais:bscarPropiedad(e,'País')||'Argentina',valor:val,correctIdx:-1});}
const ord=[...sel].sort((a,b)=>modo==='capacidad'?b.valor-a.valor:a.valor-b.valor);sel.forEach(e=>{e.correctIdx=ord.findIndex(o=>o.estadio===e.estadio&&o.club===e.club);});
orderList=[...sel].sort(()=>Math.random()-.5);orderStartTime=performance.now();renderJuegoOrden();
}
function renderJuegoOrden(revelar=false){
const body=document.getElementById('order-modal-body'),titulo=orderModo==='capacidad'?'Mayor a Menor Capacidad':'Del Más Antiguo al Más Moderno',icono=orderModo==='capacidad'?'ph-users-three':'ph-hourglass-high',desc=orderModo==='capacidad'?'Tocá dos tarjetas para intercambiarlas · de <b>Mayor a Menor</b> espectadores':'Tocá dos tarjetas para intercambiarlas · del <b>Más Viejo</b> al <b>Más Moderno</b>',labelTop=orderModo==='capacidad'?'⬆ MÁS GRANDE':'⬆ MÁS ANTIGUO',labelBot=orderModo==='capacidad'?'⬇ MÁS CHICO':'⬇ MÁS MODERNO';
let slotsHTML='';
orderList.forEach((est,i)=>{
let bgC='var(--surface-color)',brC='var(--border-strong)',badge='',extraStyle='';
let iconL=`<div style="background:var(--bg-color);color:var(--text-muted);border:2px solid var(--border-subtle);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:.88rem;font-weight:800;flex-shrink:0;">${i+1}</div>`;
if(revelar){const ok=i===est.correctIdx;bgC=ok?'rgba(0,230,118,.1)':'rgba(255,71,87,.1)';brC=ok?'var(--accent-color)':'var(--danger-color)';iconL=ok?`<div style="background:var(--accent-color);color:#000;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem;">✓</div>`:`<div style="background:var(--danger-color);color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem;">✗</div>`;const v=orderModo==='capacidad'?`${est.valor.toLocaleString('es-AR')} esp.`:`${est.valor}`;badge=`<span style="background:${ok?'var(--accent-color)':'var(--danger-color)'};color:${ok?'#000':'#fff'};font-size:.7rem;font-weight:800;padding:3px 10px;border-radius:20px;margin-left:auto;flex-shrink:0;">${v}</span>`;}
else if(orderSelectedIdx===i){brC='var(--accent-color)';bgC='var(--accent-dim)';extraStyle='transform:translateY(-4px) scale(1.01);box-shadow:0 8px 24px var(--accent-glow);';iconL=`<div style="background:var(--accent-color);color:#000;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem;">↕</div>`;}
slotsHTML+=`<div onclick="${revelar?'':(`seleccionarFilaOrden(${i})`)}" class="order-slot" style="background:${bgC};border:2px solid ${brC};cursor:${revelar?'default':'pointer'};${extraStyle}">${iconL}<div style="display:flex;flex-direction:column;overflow:hidden;min-width:0;flex:1;"><strong style="font-size:.9rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-main);">${est.estadio}</strong><span style="color:var(--text-muted);font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${est.club}</span></div>${badge}</div>`;
});
let timerBarHTML=!revelar?`<div style="background:var(--border-subtle);border-radius:20px;height:4px;margin-bottom:12px;overflow:hidden;"><div id="order-timer-bar" style="height:100%;border-radius:20px;background:var(--accent-color);width:100%;transition:width .5s linear;"></div></div>`:'';
let botonera='';
if(!revelar){botonera=`<div style="display:flex;gap:10px;margin-top:10px;flex-shrink:0;"><button onclick="abrirModalOrden()" class="btn-3d secondary" style="width:25%;padding:13px;"><i class="ph-bold ph-arrow-left"></i></button><button onclick="procesarResultadoOrden()" class="btn-3d primary" style="width:75%;padding:13px;font-size:1rem;">Confirmar orden <i class="ph-bold ph-check-circle"></i></button></div>`;}
else{
const esGoogle=esUsuarioGoogle(),btnGuardar=esGoogle?`<button onclick="guardarScoreOrden()" class="btn-3d primary" style="flex:1;padding:12px;font-size:.85rem;"><i class="ph-fill ph-paper-plane-tilt"></i> Guardar puntaje</button>`:`<button onclick="pedirLoginParaGuardar()" class="btn-3d primary" style="flex:1;padding:12px;font-size:.85rem;"><i class="ph-fill ph-sign-in"></i> Entrar y guardar</button>`;
const nivelActual=NIVELES[calcularNivelIdx(userStats.xpTotal)];
botonera=`<div style="background:var(--surface-color);border:2px solid var(--border-strong);padding:14px;border-radius:18px;margin-top:10px;flex-shrink:0;box-shadow:0 -5px 20px rgba(0,0,0,.3);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:800;letter-spacing:1px;">Puntaje obtenido</div><strong style="font-size:1.8rem;color:var(--accent-color);font-weight:900;">${orderPuntosGanados} <span style="font-size:.9rem;color:var(--text-muted);">Pts</span></strong></div><div style="text-align:right;"><span style="font-size:.75rem;color:${nivelActual.color};font-weight:800;">${nivelActual.emoji} ${nivelActual.nombre}</span></div></div><div style="display:flex;gap:8px;">${btnGuardar}<button onclick="abrirModalRankingOrden('${orderModo}')" class="btn-3d secondary" style="padding:12px;font-size:.9rem;"><i class="ph-fill ph-medal"></i></button><button onclick="iniciarJuegoOrden('${orderModo}')" class="btn-3d secondary" style="padding:12px;font-size:.9rem;"><i class="ph-bold ph-arrow-counter-clockwise"></i></button></div></div>`;
}
body.innerHTML=`<div style="border-bottom:2px dashed var(--border-subtle);padding-bottom:10px;margin-bottom:10px;text-align:center;flex-shrink:0;"><h2 style="font-size:1.1rem;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="ph-duotone ${icono}" style="color:var(--accent-color);font-size:1.4rem;"></i> ${titulo}</h2><p style="color:var(--text-muted);font-size:.84rem;margin-top:4px;line-height:1.5;">${desc}</p></div>${timerBarHTML}<div style="display:flex;flex-direction:column;flex-grow:1;overflow-y:auto;padding:2px 5px 10px;scrollbar-width:thin;"><div style="text-align:center;font-size:.68rem;font-weight:800;color:var(--accent-color);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;opacity:.8;">${labelTop}</div>${slotsHTML}<div style="text-align:center;font-size:.68rem;font-weight:800;color:var(--accent-color);text-transform:uppercase;letter-spacing:1px;margin-top:2px;opacity:.8;">${labelBot}</div></div>${botonera}`;
if(!revelar)setTimeout(()=>{const bar=document.getElementById('order-timer-bar');if(bar)bar.style.width='0%';},100);
}
function seleccionarFilaOrden(idx){if(orderSelectedIdx===null){orderSelectedIdx=idx;renderJuegoOrden();}else if(orderSelectedIdx===idx){orderSelectedIdx=null;renderJuegoOrden();}else{const t=orderList[orderSelectedIdx];orderList[orderSelectedIdx]=orderList[idx];orderList[idx]=t;orderSelectedIdx=null;renderJuegoOrden();}}
function procesarResultadoOrden(){const t=(performance.now()-orderStartTime)/1000,bonus=Math.max(0,Math.round((60-t)*20));let dev=0;orderList.forEach((e,i)=>dev+=Math.abs(i-e.correctIdx));const base=Math.max(0,5000-(dev*600));if(dev===0)userStats.ordenSinFallar=true;orderPuntosGanados=Math.round(base+(bonus*(base/5000)));pendingScore=orderPuntosGanados;pendingScoreType=orderModo;agregarXP(orderPuntosGanados);guardarStats();renderJuegoOrden(true);}
function guardarScoreOrden(){pendingScore=orderPuntosGanados;pendingScoreType=orderModo;guardarScorePendiente();}

window.toggleCustomization=function(){const panel=document.getElementById('customization-panel-wrapper');const btn=document.getElementById('btn-toggle-custom');
if(!panel.classList.contains('open')){panel.classList.add('open');btn.innerHTML='<i class="ph-bold ph-caret-up"></i> Ocultar personalización';btn.classList.add('primary');btn.classList.remove('secondary');}
else{panel.classList.remove('open');btn.innerHTML='<i class="ph-duotone ph-paint-brush"></i> Personaliza tu carta';btn.classList.remove('primary');btn.classList.add('secondary');}
};
window.toggleCardDesigns=function(el){
const strip=document.getElementById('theme-preview-strip-id');const chev=el.querySelector('.design-chevron');
if(strip){const isOpen=strip.classList.toggle('open');if(chev)chev.className=isOpen?'ph-bold ph-caret-up design-chevron':'ph-bold ph-caret-down design-chevron';}
};
window.actualizarAvatarLive = function() {
    const h = document.getElementById('avatar-hair-input').value;const s = document.getElementById('avatar-shirt-input').value;
    const c = document.getElementById('avatar-shirt-color-input').value || '#00e676';const c2 = document.getElementById('avatar-shirt-color2-input')?.value || '#ffffff';
    const n = document.getElementById('avatar-num-input').value || '10';const color2Container = document.getElementById('color2-container');
    if (color2Container) { color2Container.style.display = (s === 'solid') ? 'none' : 'flex'; }
    const container = document.getElementById('fut-avatar-live-container');if(container) { container.innerHTML = generarAvatarHTML(h, s, c, n, c2); }
    const posInput = document.getElementById('avatar-pos-input');if(posInput) { const futPos = document.getElementById('fut-pos-display');if(futPos) futPos.textContent = posInput.value; }
    const logoInput = document.getElementById('avatar-logo-input');if(logoInput) { const futClub = document.getElementById('fut-club-display');if(futClub) futClub.src = ESCUDOS_MAP[logoInput.value] || ESCUDOS_MAP['ev']; }
};

function guardarPersonalizacion(){
const posSelect=document.getElementById('avatar-pos-input');if(posSelect){setPref('ev_user_pos',posSelect.value);const futPos=document.getElementById('fut-pos-display');if(futPos)futPos.textContent=posSelect.value;}
const themeActualEl=document.querySelector('.theme-dot.active');if(themeActualEl){setPref('ev_card_theme',themeActualEl.dataset.tema);}
const nickInput=document.getElementById('avatar-nick-input');if(nickInput!==null){const newNick=nickInput.value.trim();setPref('ev_custom_nick',newNick);const futName=document.getElementById('fut-name-display');if(futName){const u = obtenerUsuarioLogueado();futName.textContent=newNick||(u?u.name.split(' ')[0]:'Jugador');}}
const hairInput=document.getElementById('avatar-hair-input'); if(hairInput) setPref('ev_avatar_hair', hairInput.value);
const shirtInput=document.getElementById('avatar-shirt-input'); if(shirtInput) setPref('ev_avatar_shirt', shirtInput.value);
const colorInput=document.getElementById('avatar-shirt-color-input'); if(colorInput) setPref('ev_avatar_color', colorInput.value);
const color2Input=document.getElementById('avatar-shirt-color2-input'); if(color2Input) setPref('ev_avatar_color2', color2Input.value);
const numInput=document.getElementById('avatar-num-input'); if(numInput) setPref('ev_avatar_num', numInput.value || '10');
const logoInput=document.getElementById('avatar-logo-input'); if(logoInput) setPref('ev_avatar_logo', logoInput.value);

showToast('¡Personalización guardada! 🎉');renderizarBotonLogin();ancestralHeaderNivel();
guardarStats(); // <--- LLAMADA CRUCIAL AGREGADA PARA SINCRONIZAR AL INSTANTE CON LA NUBE

const futOvr=document.querySelector('.fut-ovr');if(futOvr){const n=NIVELES[calcularNivelIdx(userStats.xpTotal)];futOvr.textContent=n.ovr;}
const cardEl=document.getElementById('fut-card-main');if(cardEl){
    let th=getPref('ev_card_theme','arg');const validThemes = ['arg','bra','esp','ita','fra','ger','eng','por','uru','col','mex','chi','ned','bel','cro','usa','jpn','can','mar','sen','kor','aus','sui','ecu','per','den','srb','pol','wal','swe','civ','cmr','gha','nga','ksa','irn','egy','alg','tun','mli','qat','par','ven','bol','crc','pan','jam','nzl'];
    if (!validThemes.includes(th)) th = 'arg';cardEl.className='fut-card '+th;
}if(document.getElementById('customization-panel-wrapper').classList.contains('open')){toggleCustomization();}
}

function abrirModalPerfil(){
const u=obtenerUsuarioLogueado();if(!u)return;
const nivelIdx=calcularNivelIdx(userStats.xpTotal),nivel=NIVELES[nivelIdx],nivelSig=NIVELES[Math.min(nivelIdx+1,NIVELES.length-1)];
const xpEnNivel=userStats.xpTotal-nivel.min,xpNivelTotal=nivelSig.min-nivel.min;const xpPct=nivelIdx===NIVELES.length-1?100:Math.min(100,Math.round((xpEnNivel/xpNivelTotal)*100));
const savedNick=getPref('ev_custom_nick',''),savedPos=getPref('ev_user_pos','DT');let savedTheme=getPref('ev_card_theme','arg');
const validThemes = ['arg','bra','esp','ita','fra','ger','eng','por','uru','col','mex','chi','ned','bel','cro','usa','jpn','can','mar','sen','kor','aus','sui','ecu','per','den','srb','pol','wal','swe','civ','cmr','gha','nga','ksa','irn','egy','alg','tun','mli','qat','par','ven','bol','crc','pan','jam','nzl'];
if (!validThemes.includes(savedTheme)) savedTheme = 'arg';
const savedHair = getPref('ev_avatar_hair', 'short');const savedShirt = getPref('ev_avatar_shirt', 'solid');const savedColor = getPref('ev_avatar_color', '#00e676');const savedColor2 = getPref('ev_avatar_color2', '#ffffff');const savedNum = getPref('ev_avatar_num', '10');const savedLogo = getPref('ev_avatar_logo', 'ev');
const activeCardClass=savedTheme;const googleBadge=u.loginMethod==='google'?`<div style="display:inline-flex;align-items:center;gap:5px;background:var(--accent-dim);border:1px solid var(--accent-color);border-radius:20px;padding:3px 10px;font-size:.7rem;font-weight:800;color:var(--accent-color);margin-top:6px;"><i class="ph-fill ph-google-logo"></i> Vinculado</div>`:'';
const temas=[{k:'arg',l:'ARG'},{k:'bra',l:'BRA'},{k:'esp',l:'ESP'},{k:'ita',l:'ITA'},{k:'fra',l:'FRA'},{k:'ger',l:'GER'},{k:'eng',l:'ENG'},{k:'por',l:'POR'},{k:'uru',l:'URU'},{k:'col',l:'COL'},{k:'mex',l:'MEX'},{k:'chi',l:'CHI'},{k:'ned',l:'NED'},{k:'bel',l:'BEL'},{k:'cro',l:'CRO'},{k:'usa',l:'USA'},{k:'jpn',l:'JPN'},{k:'can',l:'CAN'},{k:'mar',l:'MAR'},{k:'sen',l:'SEN'},{k:'kor',l:'KOR'},{k:'aus',l:'AUS'},{k:'sui',l:'SUI'},{k:'ecu',l:'ECU'},{k:'per',l:'PER'},{k:'den',l:'DEN'},{k:'srb',l:'SRB'},{k:'pol',l:'POL'},{k:'wal',l:'WAL'},{k:'swe',l:'SWE'},{k:'civ',l:'CIV'},{k:'cmr',l:'CMR'},{k:'gha',l:'GHA'},{k:'nga',l:'NGA'},{k:'ksa',l:'KSA'},{k:'irn',l:'IRN'},{k:'egy',l:'EGY'},{k:'alg',l:'ALG'},{k:'tun',l:'TUN'},{k:'mli',l:'MLI'},{k:'qat',l:'QAT'},{k:'par',l:'PAR'},{k:'ven',l:'VEN'},{k:'bol',l:'BOL'},{k:'crc',l:'CRC'},{k:'pan',l:'PAN'},{k:'jam',l:'JAM'},{k:'nzl',l:'NZL'}];
const themeStrip=temas.map(t=>`<div class="theme-dot td-${t.k}${savedTheme===t.k?' active':''}" data-tema="${t.k}" onclick="previsualizarTema('${t.k}')" title="${t.l}"><span class="td-label">${t.l}</span></div>`).join('');
const today = new Date();const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const currentYear = today.getFullYear();const currentMonth = today.getMonth();const firstDay = new Date(currentYear, currentMonth, 1).getDay();let startOffset = firstDay === 0 ? 6 : firstDay - 1;const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
let calHTML='';for(let i = 0; i < startOffset; i++) { calHTML += `<div class="calendar-cell" style="visibility:hidden; border:none;"></div>`; }
for(let d=1;d<=daysInMonth;d++){
    const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');let cl='calendar-cell';
    if(dateStr === today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')) { cl+=' current-active'; }
    else if (userStats.activeDates && userStats.activeDates.includes(dateStr)) { cl+=' past-done'; }calHTML+=`<div class="${cl}">${d}</div>`;
}const logros=calcularLogros(),totalLogros=logros.length,desbloqueados=logros.filter(l=>l.unlocked).length;
document.getElementById('profile-modal-body').innerHTML=`
    <div class="split-profile-layout">
        
        <div class="left-fut-column">
            <div class="fut-card ${activeCardClass}" id="fut-card-main">
                <div class="fut-card-shine"></div>
                <div class="fut-top">
                    <div class="fut-badge-meta">
                        <div class="fut-ovr" title="Overall: sube con tu XP">${nivel.ovr}</div>
                        <div class="fut-pos" id="fut-pos-display" title="Tu posición">${savedPos}</div>
                        <img src="${ESCUDOS_MAP[savedLogo] || ESCUDOS_MAP['ev']}" class="fut-club-icon" id="fut-club-display" onerror="this.src='${ESCUDOS_MAP['ev']}';">
                    </div>
                    <div class="fut-avatar-container" id="fut-avatar-live-container">${generarAvatarHTML(savedHair, savedShirt, savedColor, savedNum, savedColor2)}</div>
                </div>
                <div class="fut-name" id="fut-name-display" title="Tu apodo">${savedNick||u.name.split(' ')[0]}</div>
                <div class="fut-stats-row">
                    <div class="fut-stat-item" title="Votos realizados"><span class="fut-stat-num">${userStats.votosRealizados}</span><span class="fut-stat-label">VOT</span></div>
                    <div class="fut-stat-item" title="Trivias descubiertas"><span class="fut-stat-num">${userStats.triviasVistas}</span><span class="fut-stat-label">TRV</span></div>
                    <div class="fut-stat-item" title="Partidas jugadas"><span class="fut-stat-num">${userStats.partidasJugadas}</span><span class="fut-stat-label">PJ</span></div>
                    <div class="fut-stat-item" title="Partidos ganados 1v1"><span class="fut-stat-num">${userStats.partidasGanadas || 0}</span><span class="fut-stat-label">PG</span></div>
                    <div class="fut-stat-item" title="XP total acumulado"><span class="fut-stat-num">${userStats.xpTotal>999?(userStats.xpTotal/1000).toFixed(1)+'K':userStats.xpTotal}</span><span class="fut-stat-label">XP</span></div>
                </div>
            </div>
            ${googleBadge}
            <button class="btn-3d secondary" id="btn-toggle-custom" onclick="toggleCustomization()" style="width:100%;max-width:250px;margin-top:16px;flex-shrink:0;"><i class="ph-duotone ph-paint-brush"></i> Personaliza tu carta</button>
            
            <div id="customization-panel-wrapper">
                <div class="avatar-picker">
                    <div class="avatar-picker-label" onclick="window.toggleCardDesigns(this)"><span style="display:flex;align-items:center;gap:6px;"><i class="ph-fill ph-palette"></i> Diseño de la Carta</span><i class="ph-bold ph-caret-down design-chevron" style="font-size:.9rem;"></i></div>
                    <div class="theme-preview-strip" id="theme-preview-strip-id">${themeStrip}</div>
                    <div class="avatar-divider"></div>
                    <label class="avatar-nick-label">Apariencia y Escudo</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                        <select class="avatar-pos-select" id="avatar-hair-input" style="margin-bottom:0;" onchange="actualizarAvatarLive()">
                            <option value="short">Pelo Corto</option><option value="long">Pelo Largo</option><option value="ponytail">Cola de Caballo</option><option value="bald">Pelado</option>
                        </select>
                        <select class="avatar-pos-select" id="avatar-logo-input" style="margin-bottom:0;" onchange="actualizarAvatarLive()">
                            <option value="ev">⚽ Estadios Virt.</option><option value="ar">🇦🇷 Argentina</option><option value="br">🇧🇷 Brasil</option><option value="es">🇪🇸 España</option><option value="it">🇮🇹 Italia</option><option value="fr">🇫🇷 Francia</option><option value="de">🇩🇪 Alemania</option><option value="gb-eng">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra</option><option value="pt">🇵🇹 Portugal</option><option value="uy">🇺🇾 Uruguay</option><option value="co">🇨🇴 Colombia</option><option value="mx">🇲🇽 México</option><option value="cl">🇨🇱 Chile</option><option value="nl">🇳🇱 Países Bajos</option><option value="be">🇧🇪 Bélgica</option><option value="hr">🇭🇷 Croacia</option><option value="us">🇺🇸 EE.UU.</option><option value="jp">🇯🇵 Japón</option><option value="can">🇨🇦 Canadá</option><option value="mar">🇲🇦 Marruecos</option><option value="sen">🇸🇳 Senegal</option><option value="kor">🇰🇷 Corea del Sur</option><option value="aus">🇦🇺 Australia</option><option value="sui">🇨🇭 Suiza</option><option value="ecu">🇪🇨 Ecuador</option><option value="per">🇵🇪 Perú</option><option value="den">🇩🇰 Danamarca</option><option value="srb">🇷🇸 Serbia</option><option value="pol">🇵🇱 Polonia</option><option value="wal">🏴󠁧󠁢󠁷󠁬󠁳󠁿 Gales</option><option value="swe">🇸🇪 Suecia</option><option value="civ">🇨🇮 Costa de Marfil</option><option value="cmr">🇨🇲 Camerún</option><option value="gha">🇬🇭 Ghana</option><option value="nga">🇳🇬 Nigeria</option><option value="ksa">🇸🇦 Arabia Saudita</option><option value="irn">🇮🇷 Irán</option><option value="egy">🇪🇬 Egipto</option><option value="alg">🇩🇿 Argelia</option><option value="tun">🇹🇳 Túnez</option><option value="mli">🇲🇱 Malí</option><option value="qat">🇶🇦 Qatar</option><option value="par">🇵🇾 Paraguay</option><option value="ven">🇻🇪 Venezuela</option><option value="bol">🇧🇴 Bolivia</option><option value="crc">🇨🇷 Costa Rica</option><option value="pan">🇵🇦 Panamá</option><option value="jam">🇯🇲 Jamaica</option><option value="nzl">🇳🇿 Nueva Zelanda</option>
                        </select>
                    </div>
                    <label class="avatar-nick-label">Camiseta (Estilo, Color y N°)</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">
                        <select class="avatar-pos-select" id="avatar-shirt-input" style="margin-bottom:0;" onchange="actualizarAvatarLive()">
                            <option value="solid">Lisa</option><option value="striped">Rayada</option><option value="band">Banda</option><option value="diagonal">Diagonal</option>
                        </select>
                        <input type="number" id="avatar-num-input" class="avatar-nickname-input" style="margin-bottom:0;" placeholder="Nº" min="0" max="99" oninput="actualizarAvatarLive()">
                    </div>
                    <div style="display:flex; gap:10px; margin-bottom:12px;">
                        <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
                            <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">COLOR 1</span>
                            <input type="color" id="avatar-shirt-color-input" class="avatar-pos-select" style="padding:2px 4px;height:42px;margin-bottom:0;width:100%;" value="${savedColor}" oninput="actualizarAvatarLive()">
                        </div>
                        <div id="color2-container" style="flex:1; display:${savedShirt === 'solid' ? 'none' : 'flex'}; flex-direction:column; gap:4px;">
                            <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">COLOR 2</span>
                            <input type="color" id="avatar-shirt-color2-input" class="avatar-pos-select" style="padding:2px 4px;height:42px;margin-bottom:0;width:100%;" value="${savedColor2}" oninput="actualizarAvatarLive()">
                        </div>
                    </div>
                    <select class="avatar-pos-select" id="avatar-pos-input" onchange="actualizarAvatarLive()">
                        <option value="POR">POR — Arquero</option><option value="DFC">DFC — Def. Central</option><option value="LD">LD — Lateral Der.</option><option value="LI">LI — Lateral Izq.</option><option value="MCD">MCD — Medio Def.</option><option value="MC">MC — Mediocentro</option><option value="MCO">MCO — Medio Ofensivo</option><option value="MI">MI — Medio Izq.</option><option value="MD">MD — Medio Der.</option><option value="EI">EI — Extremo Izq.</option><option value="ED">ED — Extremo Der.</option><option value="SD">SD — Segundo Del.</option><option value="DC">DC — Delantero</option><option value="DT">DT — Técnico</option>
                    </select>
                    <label class="avatar-nick-label">Apodo en el ranking</label>
                    <div class="avatar-nickname-row">
                        <input type="text" class="avatar-nickname-input" id="avatar-nick-input" placeholder="Tu apodo…" maxlength="16" value="${savedNick}" oninput="const fn=document.getElementById('fut-name-display');if(fn)fn.textContent=this.value||'${u.name.split(' ')[0].replace(/'/g,"\\'")}';">
                    </div>
                    <button class="avatar-save-btn" onclick="guardarPersonalizacion()"><i class="ph-bold ph-check"></i> Guardar cambios</button>
                </div>
            </div>
            
            <div style="margin-top: auto; padding-top: 20px; width: 100%; max-width: 250px; flex-shrink:0;">
                <button onclick="cerrarSesion()" class="btn-3d secondary" style="width: 100%; color:var(--danger-color);border-color:var(--danger-color);padding:12px;font-size:.9rem;"><i class="ph-bold ph-sign-out"></i> Cerrar sesión</button>
            </div>
        </div>

        <div class="right-dashboard-column">
            
            <div class="right-dashboard-top-row">
                <div class="xp-profile-section" style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; overflow:hidden; padding: 30px 20px;">
                    <div style="position:absolute; top:-50px; right:-50px; width:180px; height:180px; background:var(--accent-color); filter:blur(90px); opacity:0.15; border-radius:50%; pointer-events:none;"></div>
                    
                    <div style="font-size:4.5rem; filter:drop-shadow(0 0 15px var(--accent-glow)); margin-bottom:12px; animation: floatBall 6s ease-in-out infinite;">${nivel.emoji}</div>
                    
                    <h3 style="font-size:1.7rem; font-weight:900; color:var(--text-main); margin-bottom:6px; text-transform:uppercase; letter-spacing:-0.5px; text-align:center;">${nivel.nombre}</h3>
                    
                    <div class="level-badge-inline ${nivel.cssClass}" style="font-size:0.85rem; padding:6px 16px; margin-bottom: 24px;">Nivel ${nivelIdx}</div>
                    
                    <div style="width:100%; max-width: 90%; z-index:1;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.7rem; font-weight:800; align-items:flex-end;">
                            <span style="color:var(--text-muted);">${nivel.min.toLocaleString('es-AR')} XP</span>
                            <span style="color:var(--accent-color); font-size:0.85rem;">${userStats.xpTotal.toLocaleString('es-AR')} XP</span>
                            <span style="color:var(--text-muted);">${nivelSig.min===Infinity?'∞':nivelSig.min.toLocaleString('es-AR')} XP</span>
                        </div>
                        <div class="xp-bar-big" style="height:12px; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle);"><div class="xp-bar-big-fill" style="width:${xpPct}%; box-shadow:0 0 15px var(--accent-glow);"></div></div>
                    </div>
                </div>
                
                <div class="geoguessr-dash-box" style="height:100%;">
                    <div class="dash-header-inline">
                        <div class="dash-title-premium"><i class="ph-duotone ph-calendar-check" style="font-size:1.3rem;color:var(--accent-color);"></i> Reto Diario (${monthNames[currentMonth]})</div>
                        <div class="streak-fire-badge">🔥 ${userStats.rachaActual||1} días</div>
                    </div>
                    <div class="calendar-matrix">
                        <div class="calendar-day-label">LUN</div><div class="calendar-day-label">MAR</div><div class="calendar-day-label">MIÉ</div><div class="calendar-day-label">JUE</div><div class="calendar-day-label">VIE</div><div class="calendar-day-label">SÁB</div><div class="calendar-day-label">DOM</div>
                        ${calHTML}
                    </div>
                </div>
            </div>

            <div class="geoguessr-dash-box" style="flex:1; display:flex; flex-direction:column;">
                <div class="dash-header-inline" style="margin-bottom:12px;">
                    <div class="dash-title-premium"><i class="ph-duotone ph-medal" style="font-size:1.3rem;color:var(--accent-color);"></i> Vitrina de Logros</div>
                    <div class="streak-fire-badge" id="logros-counter" style="color:var(--text-muted);">${desbloqueados}/${totalLogros}</div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                    <span style="background:rgba(156,163,175,.18);color:#9ca3af;padding:2px 8px;border-radius:20px;font-size:.6rem;font-weight:800;">Común</span>
                    <span style="background:rgba(167,139,250,.18);color:#a78bfa;padding:2px 8px;border-radius:20px;font-size:.6rem;font-weight:800;">Raro</span>
                    <span style="background:rgba(234,179,8,.18);color:#eab308;padding:2px 8px;border-radius:20px;font-size:.6rem;font-weight:800;">Épico</span>
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
    </div>`;
    document.getElementById('profile-modal').style.display='flex';
setTimeout(()=>{
const selPos=document.getElementById('avatar-pos-input');if(selPos)selPos.value=savedPos;
const selHair = document.getElementById('avatar-hair-input'); if(selHair) selHair.value = savedHair;
const selShirt = document.getElementById('avatar-shirt-input'); if(selShirt) selShirt.value = savedShirt;
const selNum = document.getElementById('avatar-num-input'); if(selNum) selNum.value = savedNum;
const selLogo = document.getElementById('avatar-logo-input'); if(selLogo) selLogo.value = savedLogo;
renderizarGridLogros();
},50);
}

function cerrarSesion() {
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
    addTierLogro('voto','⭐','Catador',s.votosRealizados,5,' califs','common');
    addTierLogro('trivia','💡','Curioso',s.triviasVistas,5,' trivias','common');
    addTierLogro('guessr','✈️','Piloto',s.partidasJugadas,5,' partidas','common');
    addTierLogro('liga','🗂️','Explorador',s.ligasExploradas.size,2,' ligas','common');
    addTierLogro('aleat','🎲','Aventurero',s.vuelosAleatorios||0,10,' vuelos','common');
    addTierLogro('racha','🔥','Constante',s.rachaActual||1,7,' días','rare');
    addTierLogro('maxscore','💥','Récord',s.maxScore||0,5000,' pts','epic');
   addTierLogro('xptotal','🎨','Acumulador',s.xpTotal||0,10000,' XP','epic');

// ⚔️ NUEVOS LOGROS COMPETITIVOS DEL VERSUS 1V1
addTierLogro('versus_win','👑','Dominante',s.partidasGanadas||0,3,' victorias','epic');

logros.push({id:'bienvenido',icon:'👋',name:'Primer Despegue',rarity:'common',req:'Abrí la app por primera vez',unlocked:s.sesionesTotal>=1,pct:s.sesionesTotal>=1?100:0,pctLabel:''});
logros.push({id:'nick',icon:'🪪',name:'Identidad',rarity:'common',req:'Personalizá tu apodo',unlocked:!!getPref('ev_custom_nick',''),pct:getPref('ev_custom_nick','')?100:0,pctLabel:''});
logros.push({id:'primer_versus',icon:'⚡',name:'Bautismo de Fuego',rarity:'common',req:'Ganá tu primer Versus 1v1',unlocked:(s.partidasGanadas||0)>=1,pct:(s.partidasGanadas||0)>=1?100:0,pctLabel:''});

logros.push({id:'localista',icon:'📍',name:'GPS Humano',rarity:'rare',req:'Adiviná a menos de 5 km',unlocked:s.medallaLocalista,pct:s.medallaLocalista?100:0,pctLabel:''});
logros.push({id:'unKm',icon:'🔬',name:'Ojo de Águila',rarity:'epic',req:'Adiviná a menos de 1 km',unlocked:s.guessrUnKm,pct:s.guessrUnKm?100:0,pctLabel:''});
logros.push({id:'perfecto',icon:'💎',name:'Perfeccionista',rarity:'epic',req:'Todo Guessr >4000 pts',unlocked:s.guessrPerfecto,pct:s.guessrPerfecto?100:0,pctLabel:''});
logros.push({id:'ordenPerfecto',icon:'🃏',name:'Estratega',rarity:'epic',req:'Orden perfecto sin errores',unlocked:s.ordenSinFallar,pct:s.ordenSinFallar?100:0,pctLabel:''});
    return logros;
}
// Función para rescatar al jugador si el oponente se desconecta o abandona (Adjudica Victoria)
async function manejarAbandonoRival() {
    // 🛡️ ESCUDO ANTI-DUPLICADOS: Evita que el servidor y el socket choquen y te sumen doble XP
    if (!versusPartidaEnCurso) return;
    versusPartidaEnCurso = false; // Cerramos la puerta al instante

    if (versusTimerInterval) clearInterval(versusTimerInterval);
    if (handshakeInterval) clearInterval(handshakeInterval);
    
    showToast("🏆 ¡Victoria por abandono! Tu oponente se retiró de la cancha.", "ph-trophy", "success");
    
    const id = getUserId();
    const nombreLocal = getPref('ev_custom_nick', '') || obtenerUsuarioLogueado()?.name || 'Jugador';
    
    // 🏅 COMPUTACIÓN REGLAMENTARIA: Sumamos victoria al perfil local y otorgamos XP de bonificación
    userStats.partidasGanadas = (userStats.partidasGanadas || 0) + 1;
    // 🔥 INYECTAMOS ACÁ: Suma también el partido jugado por abandono, manteniendo el balance perfecto
    userStats.partidasJugadas = (userStats.partidasJugadas || 0) + 1;
    guardarStats();
    agregarXP(1000); 
    
    // Impactamos el triunfo en la base de datos remota de Supabase
    try {
        if (supabaseClient && id && id !== 'guest') {
            await supabaseClient.from('victorias_versus').insert([{ id_usuario: id, nombre: nombreLocal, liga: versusLigaOrigen }]);
            console.log("[1v1] Victoria por abandono asentada en la nube de Supabase.");
        }
    } catch(err) {
        console.error("Error al registrar victoria por abandono en la nube:", err);
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
        ? `<button onclick="cerrarModalVideo(); abrirModalLigaAmigosPrivada();" class="btn-3d primary" style="padding:12px 24px;max-width:100%;width:100%;"><i class="ph-fill ph-users-three"></i> Volver a mi Liga</button>`
        : `<button onclick="cerrarModalVideo(); abrirModalRanking('v_historico');" class="btn-3d primary" style="padding:12px 24px;max-width:100%;width:100%;"><i class="ph-fill ph-medal"></i> Ver Tabla de Posiciones</button>`;
    container.innerHTML = `
    <div style="text-align:center;padding:32px 24px;color:var(--text-main);display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:var(--bg-color);">
        <h2 style="font-size:2rem;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#00e676;filter:drop-shadow(0 0 10px var(--accent-glow));">¡VICTORIA POR ABANDONO! 🏆</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;font-size:.95rem;max-width:340px;line-height:1.5;">Tu oponente abandonó la sesión o se quedó sin datos. Te quedás con los puntos del partido y una bonificación especial de +1000 XP.</p>
        ${botonFinal}
    </div>`;
    
    versusLigaOrigen = null;
    esModoVersus = false;
    versusPartidaEnCurso = false;
}
// PEGAR ESTO REEMPLAZANDO EL DOMContentLoaded ANTERIOR:
async function inicializarSupabaseSeguro() {
    let intentos = 0;
    while (!window.supabase && intentos < 15) {
        await new Promise(r => setTimeout(r, 200)); // Espera 200ms por intento
        intentos++;
    }
    
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("¡Supabase inicializado de forma segura y listo!");
    } else {
        console.warn("Supabase no cargó después de 3 segundos. El juego seguirá en modo offline.");
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    await inicializarSupabaseSeguro(); // 🛡️ Ahora esperamos que cargue sí o sí

    await cargarPromediosSupabase();
    await cargarProgresoDesdeSupabase(); 
    bloqueasSincronizacionNube = false;
    
    renderizarBotonLogin();
    ancestralHeaderNivel();
    
    if (typeof google !== 'undefined' && google.accounts) inicializarGoogleLogin();
    else {
        document.querySelector('script[src*="accounts.google.com"]')?.addEventListener('load', inicializarGoogleLogin);
        setTimeout(inicializarGoogleLogin, 2000);
    }
    
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', function() {
        const gid = this.getAttribute('data-gid'), nombre = this.querySelector('.tab-name')?.textContent.trim() || this.textContent.trim();
        activarLiga(gid, nombre);
    }));
    
    await indexarCatalogoMasivo();
    const lastGid = localStorage.getItem('ev_last_gid');
    if (lastGid) {
        const tab = document.querySelector(`.tab[data-gid="${lastGid}"]`);
        if (tab) {
            const nombre = tab.querySelector('.tab-name')?.textContent.trim() || tab.textContent.trim();
            activarLiga(lastGid, nombre);
        } else mostrarLigas();
    } else mostrarLigas();
    
    guardarStats();
    // 👇 ESCANEO DE LINK: Revisa si alguien nos mandó un link de sala privada
    const urlParams = new URLSearchParams(window.location.search);
    const salaPrivadaId = urlParams.get('sala');
    if (salaPrivadaId) {
        versusLigaOrigen = null; // 🏳️ Entró por link de WhatsApp: no cuenta para ningún ranking de triunfos por liga
        unirseSalaPrivada(salaPrivadaId);
    }
});

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
// ESCUDO ANTI-ABANDONO MÓVIL (VISIBILITY API)
// ========================================================
let timerAbandono = null;

document.addEventListener("visibilitychange", () => {
    // Si estamos en medio de un partido multijugador humano
    if (esModoVersus && !esModoBot && versusPartidaEnCurso && versusChannel) {
        if (document.hidden) {
            console.warn("[1v1] ⚠️ Jugador minimizó la app. Iniciando cuenta regresiva de abandono...");
            // Le damos 60 segundos de gracia para que pueda contestar un WhatsApp rápido o vos puedas testear en PC
            timerAbandono = setTimeout(() => {
                if (document.hidden) {
                    console.log("[1v1] 🚨 Tiempo agotado. Disparando abandono técnico.");
                    try {
                        // Le avisamos al RIVAL que nosotros nos fuimos (ÉL GANA)
                        versusChannel.send({ type: 'broadcast', event: 'rival_abandono', payload: {} });
                        supabaseClient.removeChannel(versusChannel);
                    } catch(e) {}
                    
                    // NOSOTROS PERDEMOS POR DESCONEXIÓN (Cortamos la partida sin darnos la victoria)
                    esModoVersus = false;
                    versusPartidaEnCurso = false;
                    cerrarModalVideo(); // Cierra la cancha
                    showToast("Desconectado por inactividad prolongada ❌", "ph-x-circle", "danger");
                }
            }, 60000); // <-- Aumentado a 60.000 milisegundos (60 segs)
        } else {
            // Si vuelve a la pestaña antes de los 60 segundos, le perdonamos la vida
            if (timerAbandono) {
                console.log("[1v1] ✅ Jugador volvió a la pestaña a tiempo.");
                clearTimeout(timerAbandono);
                timerAbandono = null;
            }
        }
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
    const contenedorPadre = document.getElementById('modal-card');
    if (!contenedorPadre) return;
    
    // Eliminamos burbujas viejas si el usuario spamea botones
    const viejaBurbuja = document.querySelector('.taunt-bubble');
    if (viejaBurbuja) viejaBurbuja.remove();
    
    const burbuja = document.createElement('div');
    burbuja.className = `taunt-bubble ${esMio ? 'es-mio' : 'es-rival'}`;
    
    const nombreDisplay = esMio ? "Vos" : (versusRivalNombre || "Rival");
    burbuja.innerHTML = `<span>${nombreDisplay}:</span> <b>${emoji}</b>`;
    
    contenedorPadre.appendChild(burbuja);
    
    // Limpieza automática cuando termina la animación CSS
    setTimeout(() => {
        if (burbuja) burbuja.remove();
    }, 2300);
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
// ========================================================
// SPRINT VIRAL - PASO 3: MOTOR DE AUDIO Y JUICINESS
// ========================================================
function dispararJuicinessRonda(distancia) {
    const card = document.getElementById('modal-card');
    
    // 1. Efecto de sonido nativo usando URLs estables de assets libres
    let sonidoUrl = "";
    if (distancia < 15) {
        sonidoUrl = "https://assets.mixkit.co/active_storage/sfx/2043/2043-84.wav"; // Silbato festejo / Gol
    } else if (distancia < 600) {
        sonidoUrl = "https://assets.mixkit.co/active_storage/sfx/2039/2043-84.wav"; // Toque seco limpio
    } else {
        sonidoUrl = "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav"; // Alerta / Error gracioso
    }

    try {
        const audio = new Audio(sonidoUrl);
        audio.volume = 0.4;
        audio.play();
    } catch (e) {
        console.log("Audio bloqueado por el navegador hasta que interactúe el usuario.");
    }

    // 2. Efecto de sacudida de pantalla (Screen Shake) si le erró por mucho
    if (distancia >= 600 && card) {
        card.classList.add('animate-wrong');
        // Limpiamos la clase cuando termina la animación para que pueda volver a sacudirse en la otra ronda
        setTimeout(() => {
            card.classList.remove('animate-wrong');
        }, 400);
    }
}
// ========================================================
// SPRINT VIRAL - PASO 5: SISTEMA DE MINI LIGAS PRIVADAS
// ========================================================
async function crearOCargarLigaAmigos(esCreacion) {
    // 🔐 ESCUDO DE REGISTRO OBLIGATORIO: Si no es usuario Google, bloqueamos y abrimos el login
    if (!esUsuarioGoogle()) {
        showToast("¡Iniciá sesión con Google para crear o unirte a una liga! 🔐", "ph-lock", "danger");
        manejarClickLogin();
        return;
    }

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
            showToast("Error de conexión con el búnker.", "ph-warning-circle", "danger");
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

    // Refrescamos el modal para desplegar la tabla de posiciones real
    abrirModalLigaAmigosPrivada();
}

function renderizarCuerpoLiga(lista, nombreVisualLiga, miNombreRanking, tipoVista) {
    tipoVista = tipoVista || 'puntaje';
    const body = document.getElementById('liga-amigos-modal-body');
    if (!body) return;

    let htmlContenido = `
    <div style="text-align:center; margin-bottom:16px;">
        <div style="font-size:2.4rem; color:var(--accent-color); margin-bottom:4px;"><i class="ph-duotone ph-trophy"></i></div>
        <h3 style="font-size:1.3rem; font-weight:900; text-transform:uppercase; letter-spacing:-0.3px;">Tabla de tu Liga</h3>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; background:var(--accent-dim); border:1px solid var(--accent-color); padding:10px 14px; border-radius:10px; font-size:0.85rem;">
        <span>Liga Privada: <strong style="color:var(--accent-color); letter-spacing:0.5px;">${nombreVisualLiga}</strong></span>
        <button onclick="salirLigaAmigos()" style="background:none; border:none; color:var(--danger-color); cursor:pointer; font-weight:800; font-size:0.8rem; text-transform:uppercase;">Salir 🚪</button>
    </div>
    <div style="display:flex; gap:8px; margin-bottom:12px;">
        <button onclick="cambiarVistaLiga('puntaje')" style="flex:1; padding:10px; border-radius:10px; border:2px solid var(--accent-color); font-weight:800; font-size:.8rem; text-transform:uppercase; cursor:pointer; background:${tipoVista === 'puntaje' ? 'var(--accent-color)' : 'transparent'}; color:${tipoVista === 'puntaje' ? '#04120a' : 'var(--accent-color)'};">
            <i class="ph-bold ph-target"></i> Puntaje máximo
        </button>
        <button onclick="cambiarVistaLiga('triunfos')" style="flex:1; padding:10px; border-radius:10px; border:2px solid var(--accent-color); font-weight:800; font-size:.8rem; text-transform:uppercase; cursor:pointer; background:${tipoVista === 'triunfos' ? 'var(--accent-color)' : 'transparent'}; color:${tipoVista === 'triunfos' ? '#04120a' : 'var(--accent-color)'};">
            <i class="ph-bold ph-sword"></i> Triunfos
        </button>
    </div>
    <div style="background:var(--surface-color); border:2px solid var(--border-strong); border-radius:16px; overflow:hidden;">`;

    if (!lista || lista.length === 0) {
        htmlContenido += `
        <div style="text-align:center; padding:36px 20px; color:var(--text-muted); font-size:.85rem; line-height:1.5;">
            ${tipoVista === 'triunfos'
                ? 'Todavía nadie ganó un duelo ⚔️ desde esta tabla. ¡Desafiá a alguien que esté online!'
                : 'Todavía nadie jugó StadiumGuessr en esta liga.'}
        </div>`;
    } else {
        lista.forEach((f, i) => {
            const m = ['🥇', '🥈', '🥉'];
            const med = i < 3 ? m[i] : `<span style="color:var(--text-muted); font-weight:700;">${i + 1}</span>`;
            const nombreRival = (f.nombre || 'Anónimo').trim();
            
            const estaOnline = usuariosOnlineLiga.includes(nombreRival);
            const esPropio = nombreRival === miNombreRanking;
            
            let indicadorOnline = "";
            let botonReto = "";
            
            if (estaOnline) {
                indicadorOnline = `<span style="background:#00e676; width:8px; height:8px; border-radius:50%; display:inline-block; margin-left:6px; box-shadow:0 0 6px #00e676;" title="Mirando la liga ahora"></span>`;
                if (!esPropio) {
                    botonReto = `<i class="ph-duotone ph-sword" onclick="desafiarAmigoDirecto('${nombreRival.replace(/'/g, "\\'")}')" style="cursor:pointer; color:var(--accent-color); margin-left:12px; font-size:1.25rem; transition:transform 0.15s; display:inline-block; vertical-align:middle;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" title="Retar a duelo en vivo"></i>`;
                }
            }

            const valor = tipoVista === 'triunfos' ? (f.triunfos || 0) : (f.puntaje || 0);
            const etiqueta = tipoVista === 'triunfos' ? (valor === 1 ? 'triunfo' : 'triunfos') : 'pts';
            
            htmlContenido += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:${i === lista.length - 1 ? 'none' : '1px solid var(--border-subtle)'}; font-size:.95rem;">
                <span style="font-weight:700; display:flex; align-items:center;">
                    ${med} &nbsp;${sanitizarHTML(nombreRival)} ${indicadorOnline}
                </span>
                <span style="display:flex; align-items:center;">
                    <strong style="color:var(--accent-color); font-weight:900;">${valor} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">${etiqueta}</span></strong>
                    ${botonReto}
                </span>
            </div>`;
        });
    }

    htmlContenido += '</div>';
    body.innerHTML = htmlContenido;
}

// 🔄 Cambia entre la pestaña "Puntaje máximo" y "Triunfos" dentro del modal de la liga.
// El ranking de triunfos se pide a Supabase una sola vez por apertura del modal y después se cachea.
window.cambiarVistaLiga = async function(vista) {
    if (vista === vistaLigaActual) return; // Ya estamos parados en esa pestaña

    if (vista === 'puntaje') {
        vistaLigaActual = 'puntaje';
        renderizarCuerpoLiga(cacheTop15Ligas, nombreLigaActivaCache, miNombreRankingLiga, 'puntaje');
        return;
    }

    // vista === 'triunfos'
    if (cacheTriunfosLiga !== null) {
        vistaLigaActual = 'triunfos';
        renderizarCuerpoLiga(cacheTriunfosLiga, nombreLigaActivaCache, miNombreRankingLiga, 'triunfos');
        return;
    }

    const body = document.getElementById('liga-amigos-modal-body');
    if (body) body.innerHTML = `<div style="text-align:center; padding:50px 0;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2rem; color:var(--accent-color);"></i></div>`;

    try {
        const { data, error } = await supabaseClient
            .from('victorias_versus')
            .select('nombre')
            .eq('liga', nombreLigaActivaCache);

        if (error) throw error;

        // Agrupamos manualmente: cuántas veces aparece cada nombre = cuántos duelos ganó en esta liga
        const conteo = {};
        (data || []).forEach(row => {
            const n = (row.nombre || 'Anónimo').trim();
            conteo[n] = (conteo[n] || 0) + 1;
        });

        cacheTriunfosLiga = Object.keys(conteo)
            .map(nombre => ({ nombre, triunfos: conteo[nombre] }))
            .sort((a, b) => b.triunfos - a.triunfos)
            .slice(0, 15);

        vistaLigaActual = 'triunfos';
        renderizarCuerpoLiga(cacheTriunfosLiga, nombreLigaActivaCache, miNombreRankingLiga, 'triunfos');
    } catch (e) {
        console.error("Error al cargar el ranking de triunfos de la liga:", e);
        showToast("No se pudo cargar el ranking de triunfos. 📡", "ph-warning-circle", "danger");
        // Volvemos a mostrar la pestaña de puntaje para no dejar el modal roto
        renderizarCuerpoLiga(cacheTop15Ligas, nombreLigaActivaCache, miNombreRankingLiga, 'puntaje');
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

    const u = obtenerUsuarioLogueado();
    const miNombreRanking = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');

    const idSala = Math.random().toString(36).substring(2, 8).toUpperCase();
    versusPartidaId = 'PRIV_' + idSala;
    versusEstadios = misEstadiosAleatorios.map(e => bscarPropiedad(e, 'Estadio'));
    versusLigaOrigen = nombreLigaActivaCache; // 🏆 Este duelo nació en la liga -> cuenta para el ranking de triunfos
    
    versusRol = 'jugador_1';
    esModoVersus = true;
    esModoBot = false;
    versusPartidaEnCurso = false;

    if (!ligaAmigosChannel) {
        showToast("Se perdió la conexión con la liga, reabrila e intentá de nuevo. 📡", "ph-warning-circle", "danger");
        esModoVersus = false;
        versusPartidaId = null;
        return;
    }

    ligaAmigosChannel.send({
        type: 'broadcast',
        event: 'reto_directo',
        payload: { de: miNombreRanking, para: nombreRival, salaId: versusPartidaId }
    });

    cerrarModalLigaAmigosPrivada();
    abrirLobbyEspera();
    showToast('Esperando que ' + nombreRival + ' acepte el duelo... ⏳', 'ph-hourglass', 'info');
    conectarRealtimeVersus();

    // 🕒 Si en 30s el rival no entró a la sala (no llegó el handshake 'rival_entro'), avisamos y cortamos
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

    // 🔐 ESCUDO DE PRIVACIDAD: Si no hay usuario logueado, bloqueamos la vista por completo
    if (!u || u.id === 'guest') {
        if (body) {
            body.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="font-size:3.5rem; color:var(--danger-color); margin-bottom:12px;"><i class="ph-duotone ph-lock-key"></i></div>
                <h3 style="font-size:1.4rem; font-weight:900; text-transform:uppercase; color:var(--text-main); margin-bottom:8px;">Acceso Restringido</h3>
                <p style="font-size:.9rem; color:var(--text-muted); margin-bottom:24px; line-height:1.5;">Para ver tu Liga Privada o unirte a una, necesitás iniciar sesión con Google.</p>
                <button onclick="cerrarModalLigaAmigosPrivada(); manejarClickLogin()" class="btn-3d primary" style="padding:14px 24px; font-size:1rem; width:100%;"><i class="ph-bold ph-sign-in"></i> Iniciar Sesión</button>
            </div>`;
        }
        return;
    }

    const nombreLiga = localStorage.getItem('ev_codigo_liga_amigos');

    // CASO 1: Todavía no pertenezco a ninguna liga -> mostramos el formulario de crear/unirse
    if (!nombreLiga) {
        if (body) {
            body.innerHTML = `
            <div style="text-align:center; margin-bottom:16px;">
                <div style="font-size:2.4rem; color:var(--accent-color); margin-bottom:4px;"><i class="ph-duotone ph-users-three"></i></div>
                <h3 style="font-size:1.3rem; font-weight:900; text-transform:uppercase; letter-spacing:-0.3px;">Liga Privada de Amigos</h3>
                <p style="font-size:.85rem; color:var(--text-muted); margin-top:6px;">Creá una liga o unite con el código exacto que te pasó un amigo.</p>
            </div>
            <input id="input-codigo-liga" maxlength="20" placeholder="NOMBRE_DE_LA_LIGA"
                   style="width:100%; padding:14px; border-radius:12px; border:2px solid var(--border-strong); background:var(--bg-color); color:var(--text-main); font-weight:800; text-align:center; text-transform:uppercase; margin-bottom:12px;">
            <div style="display:flex; gap:10px;">
                <button onclick="crearOCargarLigaAmigos(true)" class="btn-3d primary" style="flex:1; padding:14px;"><i class="ph-bold ph-plus-circle"></i> Crear liga</button>
                <button onclick="crearOCargarLigaAmigos(false)" class="btn-3d secondary" style="flex:1; padding:14px;"><i class="ph-bold ph-sign-in"></i> Unirme</button>
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
    miNombreRankingLiga = getPref('ev_custom_nick', '') || (u ? u.name : 'Anónimo');

    if (body) {
        body.innerHTML = `<div style="text-align:center; padding:50px 0;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2rem; color:var(--accent-color);"></i></div>`;
    }

    try {
        // Traemos un lote grande de filas (puede haber varias por integrante: el fichaje en 0,
        // partidas viejas de antes de este arreglo, etc.) y después agrupamos nosotros.
        const { data, error } = await supabaseClient
            .from('ranking')
            .select('nombre, puntaje')
            .eq('juego', 'duelo_' + nombreLiga)
            .order('puntaje', { ascending: false })
            .limit(500);

        if (error) throw error;

        // 🧹 Agrupamos por nombre y nos quedamos con el MEJOR puntaje de cada integrante,
        // así cada persona aparece una sola vez en la tabla (nunca duplicada por partida o por el 0 inicial).
        const mejorPorIntegrante = {};
        (data || []).forEach(row => {
            const n = (row.nombre || 'Anónimo').trim();
            const p = row.puntaje || 0;
            if (!mejorPorIntegrante[n] || p > mejorPorIntegrante[n].puntaje) {
                mejorPorIntegrante[n] = { nombre: n, puntaje: p };
            }
        });

        cacheTop15Ligas = Object.values(mejorPorIntegrante)
            .sort((a, b) => b.puntaje - a.puntaje)
            .slice(0, 15);

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
            const listaActual = vistaLigaActual === 'triunfos' ? (cacheTriunfosLiga || []) : cacheTop15Ligas;
            renderizarCuerpoLiga(listaActual, nombreLigaActivaCache, miNombreRankingLiga, vistaLigaActual);
        })
        .on('broadcast', { event: 'reto_directo' }, (response) => {
            const data = response.payload || response;
            if (!data || data.para !== miNombre) return; // El desafío no es para mí, lo ignoro

            if (esModoVersus) return; // Ya estoy jugando otra partida, no puedo aceptar ahora

            mostrarNotificacionDesafio(data.de, data.salaId);
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
function salirLigaAmigos() {
    if (!confirm("¿Seguro que querés salir de tu liga privada? Vas a dejar de ver esta tabla de posiciones.")) return;
    localStorage.removeItem('ev_codigo_liga_amigos');
    cerrarModalLigaAmigosPrivada();
    abrirModalLigaAmigosPrivada();
}