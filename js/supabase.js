// ========================================================
// ☁️ ESTADIOSVIRTUALES.COM - MÓDULO: CONEXIÓN SUPABASE
// ========================================================

// ========================================================
// CONEXIÓN OFICIAL CON SUPABASE (CON BLINDAJE ANTI-CRASH)
// ========================================================
const SUPABASE_URL = "https://prqqhxyajyhrlqynpocd.supabase.co";
const SUPABASE_KEY = "sb_publishable_7bkpzmqDo95a7noCy-JE3A_C1HDVQ22"; 
var supabaseClient = null;
window.supabaseClient = null;



// Memoria global para guardar los promedios de Supabase
var promediosSupabase = {};
window.promediosSupabase = promediosSupabase;
var bloqueasSincronizacionNube = false;
window.bloqueasSincronizacionNube = false;
var guessrHistorialCoordenadas = [];
window.guessrHistorialCoordenadas = guessrHistorialCoordenadas;

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
                avatar_logo: getPref('ev_avatar_logo', 'ev'),
                liga_privada: localStorage.getItem('ev_codigo_liga_amigos') || ''
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
                userStats.nivelActual = calcularNivelIdx(userStats.xpTotal);
                userStats.primeraVez = false;
            }

            // Sincronizamos el JSON masivo de datos
            if (perfilNube.datos_juego) {
                const dj = perfilNube.datos_juego;
                
                // 1. Restauramos estadísticas, logros, medallas y datos del Once Inicial
                    userStats = {
                        ...userStats,
                        ...dj,
                        ligas5: new Set(dj.ligas5 || []),
                        triviasDescubiertas: new Set(dj.triviasDescubiertas || []),
                        ligasExploradas: new Set(dj.ligasExploradas || []),
                        activeDates: dj.activeDates || [],
                        puntosHabilidad: dj.puntosHabilidad !== undefined ? dj.puntosHabilidad : (userStats.puntosHabilidad || 0),
                        mejorasJugadores: dj.mejorasJugadores || userStats.mejorasJugadores || {},
                        copasGanadas: dj.copasGanadas || userStats.copasGanadas || []
                    };
                    if (dj.onceInicial) localStorage.setItem('ev_once_inicial_' + id, JSON.stringify(dj.onceInicial));
                    if (dj.onceCapitan) localStorage.setItem('ev_once_capitan_' + id, dj.onceCapitan);
                    if (dj.onceEscudo) localStorage.setItem('ev_once_escudo_' + id, dj.onceEscudo);
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
                    
                    // 🛡️ Restauramos la memoria de la liga al volver a entrar
                    if (p.liga_privada) {
                        localStorage.setItem('ev_codigo_liga_amigos', p.liga_privada);
                    }
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

// Función universal y blindada para mandar puntajes a Supabase (Validación en Servidor)
async function enviarPuntaje(nombreJugador, puntosLogrados, emailJugador, modoJuego) {
    if (!supabaseClient) {
        console.error("No se pudo mandar el puntaje: Supabase no está activo.");
        return;
    }
    // 🛡️ Blindaje contra bots y sesiones automatizadas (Puppeteer, Selenium, generadores de clips)
    if (typeof navigator !== 'undefined' && (navigator.webdriver || window.__TIKTOK_RECORDER__)) {
        console.warn("🛡️ Sesión automatizada detectada (webdriver/recorder): envío de puntaje omitido.");
        return;
    }
    if (typeof esRegistroBot === 'function' && esRegistroBot(nombreJugador, puntosLogrados)) {
        console.warn(`🛡️ Intento de registro bot omitido: ${nombreJugador} (${puntosLogrados} pts).`);
        return;
    }
    try {
        const nombreLimpio = (nombreJugador || '').trim();
        if (!nombreLimpio) return;

        // 🛡️ Filtro local preventivo (0 a 25.000)
        const puntajeSeguro = Math.min(25000, Math.max(0, parseInt(puntosLogrados) || 0));
        const emailLimpio = (emailJugador || '').trim();

        // 1. Envío blindado mediante la función RPC de Postgres
        const { data, error } = await supabaseClient.rpc('registrar_record_partida', {
            p_nombre: nombreLimpio,
            p_puntaje: puntajeSeguro,
            p_email: emailLimpio,
            p_juego: modoJuego
        });

        if (error) {
            console.warn("Aviso al registrar récord vía RPC, intentando fallback seguro:", error.message);
            // Fallback directo sujeto a la restricción CHECK de Postgres
            await supabaseClient.from('ranking').insert([
                { nombre: nombreLimpio, puntaje: puntajeSeguro, email: emailLimpio || null, juego: modoJuego }
            ]);
        } else {
            console.log(`🏆 [${modoJuego}] Récord validado por el servidor (${puntajeSeguro} pts):`, data?.accion);
        }
    } catch (err) {
        console.error("Error inesperado al registrar puntaje:", err);
    }
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
            console.log("👤 Usuario registrado/actualizado con éxito.");
        }
    } catch (e) {
        console.error("Error de red en registrarUsuarioEnSupabase:", e);
    }
}

async function inicializarSupabaseSeguro() {
    let intentos = 0;
    while (!window.supabase && intentos < 15) {
        await new Promise(r => setTimeout(r, 200)); // Espera 200ms por intento
        intentos++;
    }
    
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabaseClient;
        console.log("¡Supabase inicializado de forma segura y listo!");
    } else {
        console.warn("Supabase no cargó después de 3 segundos. El juego seguirá en modo offline.");
    }
}


// Exposición global explícita
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
window.cargarPromediosSupabase = cargarPromediosSupabase;
window.sincronizarPerfilSupabase = sincronizarPerfilSupabase;
window.cargarProgresoDesdeSupabase = cargarProgresoDesdeSupabase;
window.enviarPuntaje = enviarPuntaje;
window.registrarUsuarioEnSupabase = registrarUsuarioEnSupabase;
window.inicializarSupabaseSeguro = inicializarSupabaseSeguro;
