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

const URL_BASE = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/';

const ESCUDOS_MAP = {
  'ev': URL_BASE + 'Logo.webp',
  
  // 🌍 PAÍSES / SELECCIONES (URLs externas en PNG)
  'ar': 'https://flagcdn.com/w80/ar.png', 'br': 'https://flagcdn.com/w80/br.png',
  'es': 'https://flagcdn.com/w80/es.png', 'it': 'https://flagcdn.com/w80/it.png',
  'fr': 'https://flagcdn.com/w80/fr.png', 'de': 'https://flagcdn.com/w80/de.png',
  'gb-eng': 'https://flagcdn.com/w80/gb-eng.png', 'pt': 'https://flagcdn.com/w80/pt.png',
  'uy': 'https://flagcdn.com/w80/uy.png', 'co': 'https://flagcdn.com/w80/co.png',
  'mx': 'https://flagcdn.com/w80/mx.png', 'cl': 'https://flagcdn.com/w80/cl.png',
  'nl': 'https://flagcdn.com/w80/nl.png', 'be': 'https://flagcdn.com/w80/be.png',
  'hr': 'https://flagcdn.com/w80/hr.png', 'us': 'https://flagcdn.com/w80/us.png',
  'jp': 'https://flagcdn.com/w80/jp.png', 'can': 'https://flagcdn.com/w80/ca.png',
  'mar': 'https://flagcdn.com/w80/ma.png', 'sen': 'https://flagcdn.com/w80/sn.png',
  'kor': 'https://flagcdn.com/w80/kr.png', 'aus': 'https://flagcdn.com/w80/au.png',
  'sui': 'https://flagcdn.com/w80/ch.png', 'ecu': 'https://flagcdn.com/w80/ec.png',
  'per': 'https://flagcdn.com/w80/pe.png', 'den': 'https://flagcdn.com/w80/dk.png',
  'srb': 'https://flagcdn.com/w80/rs.png', 'pol': 'https://flagcdn.com/w80/pl.png',
  'wal': 'https://flagcdn.com/w80/gb-wls.png', 'swe': 'https://flagcdn.com/w80/se.png',
  'civ': 'https://flagcdn.com/w80/ci.png', 'cmr': 'https://flagcdn.com/w80/cm.png',
  'gha': 'https://flagcdn.com/w80/gh.png', 'nga': 'https://flagcdn.com/w80/ng.png',
  'ksa': 'https://flagcdn.com/w80/sa.png', 'irn': 'https://flagcdn.com/w80/ir.png',
  'egy': 'https://flagcdn.com/w80/eg.png', 'alg': 'https://flagcdn.com/w80/dz.png',
  'tun': 'https://flagcdn.com/w80/tn.png', 'mli': 'https://flagcdn.com/w80/ml.png',
  'qat': 'https://flagcdn.com/w80/qa.png', 'par': 'https://flagcdn.com/w80/py.png',
  'ven': 'https://flagcdn.com/w80/ve.png', 'bol': 'https://flagcdn.com/w80/bo.png',
  'crc': 'https://flagcdn.com/w80/cr.png', 'pan': 'https://flagcdn.com/w80/pa.png',
  'jam': 'https://flagcdn.com/w80/jm.png', 'nzl': 'https://flagcdn.com/w80/nz.png',
  'sco': 'https://flagcdn.com/w80/gb-sct.png', 'nor': 'https://flagcdn.com/w80/no.png',
  'aut': 'https://flagcdn.com/w80/at.png', 'gre': 'https://flagcdn.com/w80/gr.png',
  'tur': 'https://flagcdn.com/w80/tr.png', 'ukr': 'https://flagcdn.com/w80/ua.png',
  'cze': 'https://flagcdn.com/w80/cz.png', 'rsa': 'https://flagcdn.com/w80/za.png',
  'hon': 'https://flagcdn.com/w80/hn.png', 'irl': 'https://flagcdn.com/w80/ie.png',

  // 🇦🇷 ARGENTINA (Clubes a WebP)
  'arg_acassuso': URL_BASE + 'acasuso.webp',
  'arg_agropecuario': URL_BASE + 'agropecuario.webp',
  'arg_aldosivi': URL_BASE + 'Aldosivi.svg.webp',
  'arg_allboys': URL_BASE + 'Allboys.webp',
  'arg_almagro': URL_BASE + 'Almagro.webp',
  'arg_almirantebrown': URL_BASE + 'Almirante.webp',
  'arg_argentinos': URL_BASE + 'argentinos.svg.webp',
  'arg_atlanta': URL_BASE + 'Atlanta.webp',
  'arg_atleticotucuman': URL_BASE + 'atucuman.webp',
  'arg_atleticode rafaela': URL_BASE + 'atleticorafaela.webp',
  'arg_banfield': URL_BASE + 'Banfield.webp',
  'arg_barracas': URL_BASE + 'Barracas.svg.webp',
  'arg_belgrano': URL_BASE + 'Belgrano.webp',
  'arg_boca': URL_BASE + 'Boca.webp',
  'arg_centralcordoba': URL_BASE + 'Central Cordoba.webp',
  'arg_centralnorte': URL_BASE + 'Centralnorte.webp',
  'arg_chacarita': URL_BASE + 'Chacarita.webp',
  'arg_chacoforever': URL_BASE + 'cfe.webp',
  'arg_ciudadbolivar': URL_BASE + 'Bolivar.webp',
  'arg_colegiales': URL_BASE + 'Colegiales.webp',
  'arg_colon': URL_BASE + 'Colon.webp',
  'arg_defensa': URL_BASE + 'defensa.webp',
  'arg_defensores': URL_BASE + 'defensores.webp',
  'arg_depmadryn': URL_BASE + 'madryn.webp',
  'arg_maipu': URL_BASE + 'maipu.webp',
  'arg_moron': URL_BASE + 'Moron.webp',
  'arg_riestra': URL_BASE + 'Riestra.webp',
  'arg_estudiantesba': URL_BASE + 'Estudiantesba.webp',
  'arg_estudiantes': URL_BASE + 'Estudiantes.webp',
  'arg_estudiantesrc': URL_BASE + 'estudiantesrc.webp',
  'arg_ferro': URL_BASE + 'Ferro.webp',
  'arg_gimnasiajujuy': URL_BASE + 'Gimnasiaj.webp',
  'arg_gimnasiamza': URL_BASE + 'gimnasiam.webp',
  'arg_gimnasia': URL_BASE + 'Gimnasia.webp',
  'arg_gimnasiatirosalta': URL_BASE + 'gyt.webp',
  'arg_godoycruz': URL_BASE + 'godoycruz.webp',
  'arg_guemes': URL_BASE + 'guemessantiago.webp',
  'arg_huracan': URL_BASE + 'Huracan.webp',
  'arg_independiente': URL_BASE + 'Independiente.webp',
  'arg_indrivadavia': URL_BASE + 'irivadavia.webp',
  'arg_instituto': URL_BASE + 'Instituto.webp',
  'arg_lanus': URL_BASE + 'Lanus.webp',
  'arg_losandes': URL_BASE + 'Losandes.webp',
  'arg_midland': URL_BASE + 'midland.webp',
  'arg_mitre': URL_BASE + 'mitresantiago.webp',
  'arg_newells': URL_BASE + 'Newells.webp',
  'arg_nuevachicago': URL_BASE + 'Chicago.webp',
  'arg_patronato': URL_BASE + 'patronato.webp',
  'arg_platense': URL_BASE + 'Platense.webp',
  'arg_quilmes': URL_BASE + 'Quilmes.webp',
  'arg_racingcba': URL_BASE + 'racingc.webp',
  'arg_racing': URL_BASE + 'Racing.webp',
  'arg_river': URL_BASE + 'River.webp',
  'arg_rosario': URL_BASE + 'Rosario Central.webp',
  'arg_sanlorenzo': URL_BASE + 'San Lorenzo.webp',
  'arg_sanmartinsj': URL_BASE + 'smjuan.webp',
  'arg_sanmartintuc': URL_BASE + 'SMTucuman.webp',
  'arg_sanmiguel': URL_BASE + 'sanmiguel.webp',
  'arg_santelmo': URL_BASE + 'santelmo.webp',
  'arg_sarmiento': URL_BASE + 'Sarmiento.webp',
  'arg_talleres': URL_BASE + 'Talleres.webp',
  'arg_temperley': URL_BASE + 'Temperley.webp',
  'arg_tigre': URL_BASE + 'Tigre.webp',
  'arg_tristansuarez': URL_BASE + 'tristansuarez.webp',
  'arg_union': URL_BASE + 'Union.webp',
  'arg_velez': URL_BASE + 'Velez.webp',

  // 🇧🇷 BRASIL
  'bra_flamengo': URL_BASE + 'Flamengo.webp',
  'bra_palmeiras': URL_BASE + 'Palmeiras.webp',
  'bra_saopaulo': URL_BASE + 'SaoPaulo.webp',
  'bra_corinthians': URL_BASE + 'Corinthians.webp',
  'bra_santos': URL_BASE + 'Santos.webp',
  'bra_vasco': URL_BASE + 'VascoGama.webp',
  'bra_fluminense': URL_BASE + 'Fluminense.webp',
  'bra_botafogo': URL_BASE + 'Botafogo.webp',
  'bra_atleticomg': URL_BASE + 'AtleticoMineiro.webp',
  'bra_cruzeiro': URL_BASE + 'Cruzeiro.webp',
  'bra_gremio': URL_BASE + 'Gremio.webp',
  'bra_internacional': URL_BASE + 'Internacional.webp',
  'bra_athleticopr': URL_BASE + 'Paranaense.webp',
  'bra_bahia': URL_BASE + 'Bahia.webp',
  'bra_bragantino': URL_BASE + 'Bragantino.webp',
  'bra_coritiba': URL_BASE + 'Coritiba.webp',
  'bra_chapecoense': URL_BASE + 'Chapecoense.webp',
  'bra_mirassol': URL_BASE + 'Mirassol.webp',
  'bra_vitoria': URL_BASE + 'Vitoria.webp',
  'bra_remo': URL_BASE + 'Remo.webp',

  // 🇨🇴 COLOMBIA
  'col_aguilas': URL_BASE + 'aguilas_doradas.webp',
  'col_alianza': URL_BASE + 'alianza.webp',
  'col_america': URL_BASE + 'america.webp',
  'col_nacional': URL_BASE + 'atlnacional.webp',
  'col_chico': URL_BASE + 'boyacachico.webp',
  'col_bucaramanga': URL_BASE + 'bucaramanga.webp',
  'col_cucuta': URL_BASE + 'cucuta.webp',
  'col_cali': URL_BASE + 'depcali.webp',
  'col_medellin': URL_BASE + 'dim.webp',
  'col_fortaleza': URL_BASE + 'fortaleza.webp',
  'col_interpalmira': URL_BASE + 'internacional_bogota.webp',
  'col_jaguares': URL_BASE + 'jaguares.webp',
  'col_junior': URL_BASE + 'junior.webp',
  'col_llaneros': URL_BASE + 'llaneros.webp',
  'col_millonarios': URL_BASE + 'millonarios.webp',
  'col_oncecaldas': URL_BASE + 'oncecaldas.webp',
  'col_pasto': URL_BASE + 'pasto.webp',
  'col_pereira': URL_BASE + 'pereira.webp',
  'col_santafe': URL_BASE + 'santafe.webp',
  'col_tolima': URL_BASE + 'tolima.webp',

  // 🇪🇸 ESPAÑA
  'esp_realmadrid': URL_BASE + 'Real.webp',
  'esp_barcelona': URL_BASE + 'Barca.webp',
  'esp_atletico': URL_BASE + 'AMadrid.webp',
  'esp_athletic': URL_BASE + 'AtlClub.webp',
  'esp_betis': URL_BASE + 'Betis.webp',
  'esp_realsociedad': URL_BASE + 'Sociedad.webp',
  'esp_sevilla': URL_BASE + 'Sevilla.webp',
  'esp_villarreal': URL_BASE + 'Villarreal.webp',
  'esp_valencia': URL_BASE + 'Valencia.webp',
  'esp_osasuna': URL_BASE + 'Osasuna.webp',
  'esp_celta': URL_BASE + 'celta.webp',
  'esp_alaves': URL_BASE + 'Alaves.webp',
  'esp_getafe': URL_BASE + 'Getafe.webp',
  'esp_mallorca': URL_BASE + 'Mallorca.webp',
  'esp_laspalmas': URL_BASE + 'udlaspalmas.webp',
  'esp_rayo': URL_BASE + 'Rayo.webp',
  'esp_girona': URL_BASE + 'Girona.webp',
  'esp_leganes': URL_BASE + 'leganes.webp',
  'esp_valladolid': URL_BASE + 'valladolid.webp',
  'esp_espanyol': URL_BASE + 'Espanyol.webp',

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA
  'eng_arsenal': URL_BASE + 'arsenal.webp',
  'eng_astonvilla': URL_BASE + 'astonvilla.webp',
  'eng_bournemouth': URL_BASE + 'bournemouth.webp',
  'eng_brentford': URL_BASE + 'brentford.webp',
  'eng_brighton': URL_BASE + 'brighton.webp',
  'eng_chelsea': URL_BASE + 'chelsea.webp',
  'eng_crystalpalace': URL_BASE + 'crystalpalace.webp',
  'eng_everton': URL_BASE + 'everton.webp',
  'eng_fulham': URL_BASE + 'fulham.webp',
  'eng_ipswich': URL_BASE + 'ipswich_town​.webp',
  'eng_leeds': URL_BASE + 'leeds.webp',
  'eng_liverpool': URL_BASE + 'liverpool.webp',
  'eng_mancity': URL_BASE + 'manchestercity.webp',
  'eng_manunited': URL_BASE + 'manchesterunited.webp',
  'eng_newcastle': URL_BASE + 'newcastle.webp',
  'eng_nottingham': URL_BASE + 'nottingham_forest.webp',
  'eng_sunderland': URL_BASE + 'sunderland.webp',
  'eng_tottenham': URL_BASE + 'tottenham.webp',
  'eng_coventry': URL_BASE + 'coventry.webp',
  'eng_hull': URL_BASE + 'hull_city.webp',

  // 🇮🇹 ITALIA
  'ita_juventus': URL_BASE + 'juventus.webp',
  'ita_inter': URL_BASE + 'inter.webp',
  'ita_milan': URL_BASE + 'milan.webp',
  'ita_roma': URL_BASE + 'roma.webp',
  'ita_lazio': URL_BASE + 'lazio.webp',
  'ita_napoli': URL_BASE + 'napoli.webp',
  'ita_fiorentina': URL_BASE + 'fiorentina.webp',
  'ita_atalanta': URL_BASE + 'atalanta.webp',
  'ita_bologna': URL_BASE + 'bologna.webp',
  'ita_torino': URL_BASE + 'torino.webp',
  'ita_udinese': URL_BASE + 'udinese.webp',
  'ita_genoa': URL_BASE + 'genoa.webp',
  'ita_verona': URL_BASE + 'hellasverona.webp',
  'ita_empoli': URL_BASE + 'empoli.webp',
  'ita_lecce': URL_BASE + 'lecce.webp',
  'ita_monza': URL_BASE + 'monza.webp',
  'ita_cagliari': URL_BASE + 'cagliari.webp',
  'ita_parma': URL_BASE + 'parma.webp',
  'ita_como': URL_BASE + 'como.webp',
  'ita_venezia': URL_BASE + 'venezia.webp',

  // 🇨🇱 CHILE
  'chi_colocolo': URL_BASE + 'ColoColo.webp',
  'chi_ucatolica': URL_BASE + 'ucatolica.webp',
  'chi_coquimbo': URL_BASE + 'Coquimbo.webp',
  'chi_everton': URL_BASE + 'Everton.webp',
  'chi_huachipato': URL_BASE + 'Huachipato.webp',
  'chi_limache': URL_BASE + 'DeportesLimache.webp',
  'chi_palestino': URL_BASE + 'Palestino.webp',
  'chi_nublense': URL_BASE + 'Nublense.webp',
  'chi_uchile': URL_BASE + 'udechile.webp',
  'chi_ohiggins': URL_BASE + 'OHiggins.webp',
  'chi_uconcepcion': URL_BASE + 'udeconcepcion.webp',
  'chi_laserena': URL_BASE + 'LaSerena.webp',
  'chi_audax': URL_BASE + 'AudaxItaliano.webp',
  'chi_cobresal': URL_BASE + 'Cobresal.webp',
  'chi_dconcepcion': URL_BASE + 'DeportesConcepcion.webp',
  'chi_calera': URL_BASE + 'unionlacalera.webp',

  // 🇫🇷 FRANCIA
  'fra_psg': URL_BASE + 'psg.webp',
  'fra_marseille': URL_BASE + 'olimpiquemarsella.webp',
  'fra_lyon': URL_BASE + 'olympiquelyon.webp',
  'fra_lille': URL_BASE + 'lille.webp',
  'fra_monaco': URL_BASE + 'monaco.webp',
  'fra_lens': URL_BASE + 'racinglens.webp',
  'fra_nice': URL_BASE + 'niza.webp',
  'fra_rennes': URL_BASE + 'rennais.webp',
  'fra_strasbourg': URL_BASE + 'racingetrasburgo.webp',
  'fra_toulouse': URL_BASE + 'toulouse.webp',
  'fra_lehavre': URL_BASE + 'havre.webp',
  'fra_angers': URL_BASE + 'angers.webp',
  'fra_auxerre': URL_BASE + 'auxerre.webp',
  'fra_brest': URL_BASE + 'stadebretois.webp',
  'fra_lorient': URL_BASE + 'lorient.webp',
  'fra_lemans': URL_BASE + 'lemans.webp',
  'fra_parisfc': URL_BASE + 'paris_fc.webp',
  'fra_troyes': URL_BASE + 'troyes.webp',

  // 🇩🇪 ALEMANIA
  'ger_bayern': URL_BASE + 'bayernmunchen.webp',
  'ger_dortmund': URL_BASE + 'borussiadortmund.webp',
  'ger_leverkusen': URL_BASE + 'bayerleverkusen.webp',
  'ger_leipzig': URL_BASE + 'rbleipzig.webp',
  'ger_stuttgart': URL_BASE + 'stuttgart.webp',
  'ger_frankfurt': URL_BASE + 'eintrachtfrankfurt.webp',
  'ger_freiburg': URL_BASE + 'freiburg.webp',
  'ger_hoffenheim': URL_BASE + 'hoffenheim.webp',
  'ger_bremen': URL_BASE + 'werderbremen.webp',
  'ger_monchengladbach': URL_BASE + 'bmonchengladbach.webp',
  'ger_mainz': URL_BASE + 'mainz05.webp',
  'ger_augsburg': URL_BASE + 'augsburgo.webp',
  'ger_unionberlin': URL_BASE + 'unionberlin.webp',
  'ger_koln': URL_BASE + 'koln.webp',
  'ger_hamburg': URL_BASE + 'hamburgo.webp',
  'ger_schalke': URL_BASE + 'schalke.webp',
  'ger_paderborn': URL_BASE + 'paderborn.webp',
  'ger_elversberg': URL_BASE + 'elversberg.webp',

  // 🇵🇹 PORTUGAL
  'por_benfica': URL_BASE + 'benfica.webp',
  'por_porto': URL_BASE + 'porto.webp',
  'por_sporting': URL_BASE + 'sporting.webp',
  'por_braga': URL_BASE + 'braga.webp',
  'por_vitoria': URL_BASE + 'vitoria.webp',
  'por_rioave': URL_BASE + 'rioave.webp',
  'por_famalicao': URL_BASE + 'famalicao.webp',
  'por_arouca': URL_BASE + 'arouca.webp',
  'por_gilvicente': URL_BASE + 'gilvicente.webp',
  'por_estoril': URL_BASE + 'estoril.webp',
  'por_casapia': URL_BASE + 'casa_pia.webp',
  'por_nacional': URL_BASE + 'nacional.webp',
  'por_moreirense': URL_BASE + 'moreirense.webp',
  'por_estrela': URL_BASE + 'estrella.webp',
  'por_santaclara': URL_BASE + 'santaclara.webp',
  'por_avs': URL_BASE + 'avs.webp',
  'por_alverca': URL_BASE + 'alverca.webp',
  'por_tondela': URL_BASE + 'tondela.webp',

  // 🇳🇱 PAÍSES BAJOS
  'ned_ajax': URL_BASE + 'ajax.webp',
  'ned_psv': URL_BASE + 'psv.webp',
  'ned_feyenoord': URL_BASE + 'feyenoord.webp',
  'ned_az': URL_BASE + 'az.webp',
  'ned_twente': URL_BASE + 'twente.webp',
  'ned_utrecht': URL_BASE + 'utrecht.webp',
  'ned_heerenveen': URL_BASE + 'scheerenveen.webp',
  'ned_groningen': URL_BASE + 'gronningen.webp',
  'ned_goaheadeagles': URL_BASE + 'go_ahead_eagles.webp',
  'ned_nec': URL_BASE + 'nec.webp',
  'ned_willem': URL_BASE + 'willem.webp',
  'ned_ado': URL_BASE + 'ado.webp',
  'ned_sparta': URL_BASE + 'sparta.webp',
  'ned_excelsior': URL_BASE + 'excelsior.webp',
  'ned_fortuna': URL_BASE + 'fortunasittard.webp',
  'ned_cambuur': URL_BASE + 'cambuur.webp',
  'ned_telstar': URL_BASE + 'telstar.webp',

  // 🇲🇽 MÉXICO (LIGA MX)
  'mex_america': URL_BASE + 'america1.webp',
  'mex_chivas': URL_BASE + 'guadalajara.webp',
  'mex_cruzazul': URL_BASE + 'cruzazul.webp',
  'mex_pumas': URL_BASE + 'pumas.webp',
  'mex_tigres': URL_BASE + 'tigres.webp',
  'mex_monterrey': URL_BASE + 'monterrey.webp',
  'mex_toluca': URL_BASE + 'toluca.webp',
  'mex_pachuca': URL_BASE + 'pachuca.webp',
  'mex_santos': URL_BASE + 'santos.webp',
  'mex_leon': URL_BASE + 'leon.webp',
  'mex_atlas': URL_BASE + 'atlas.webp',
  'mex_tijuana': URL_BASE + 'tijuana.webp',
  'mex_puebla': URL_BASE + 'puebla.webp',
  'mex_necaxa': URL_BASE + 'necaxa.webp',
  'mex_sanluis': URL_BASE + 'atleticosl.webp',
  'mex_juarez': URL_BASE + 'juarez.webp',
  'mex_queretaro': URL_BASE + 'queretaro.webp',
  'mex_atlante': URL_BASE + 'Atlante_FC_2022_Logo.svg.webp'
};

const BANDERAS_LISTA = [
    { id: 'ev', label: 'Estadios Virt.', cat: 'paises' },
    // PAÍSES
    { id: 'ar', label: 'Argentina', cat: 'paises' }, { id: 'br', label: 'Brasil', cat: 'paises' },
    { id: 'es', label: 'España', cat: 'paises' }, { id: 'it', label: 'Italia', cat: 'paises' },
    { id: 'fr', label: 'Francia', cat: 'paises' }, { id: 'de', label: 'Alemania', cat: 'paises' },
    { id: 'gb-eng', label: 'Inglaterra', cat: 'paises' }, { id: 'pt', label: 'Portugal', cat: 'paises' },
    { id: 'uy', label: 'Uruguay', cat: 'paises' }, { id: 'co', label: 'Colombia', cat: 'paises' },
    { id: 'mx', label: 'México', cat: 'paises' }, { id: 'cl', label: 'Chile', cat: 'paises' },
    { id: 'nl', label: 'Países Bajos', cat: 'paises' }, { id: 'be', label: 'Bélgica', cat: 'paises' },
    { id: 'hr', label: 'Croacia', cat: 'paises' }, { id: 'us', label: 'EE.UU.', cat: 'paises' },
    { id: 'jp', label: 'Japón', cat: 'paises' }, { id: 'can', label: 'Canadá', cat: 'paises' },
    { id: 'mar', label: 'Marruecos', cat: 'paises' }, { id: 'sen', label: 'Senegal', cat: 'paises' },
    { id: 'kor', label: 'Corea del Sur', cat: 'paises' }, { id: 'aus', label: 'Australia', cat: 'paises' },
    { id: 'sui', label: 'Suiza', cat: 'paises' }, { id: 'ecu', label: 'Ecuador', cat: 'paises' },
    { id: 'per', label: 'Perú', cat: 'paises' }, { id: 'den', label: 'Dinamarca', cat: 'paises' },
    { id: 'srb', label: 'Serbia', cat: 'paises' }, { id: 'pol', label: 'Polonia', cat: 'paises' },
    { id: 'wal', label: 'Gales', cat: 'paises' }, { id: 'swe', label: 'Suecia', cat: 'paises' },
    { id: 'civ', label: 'Costa de Marfil', cat: 'paises' }, { id: 'cmr', label: 'Camerún', cat: 'paises' },
    { id: 'gha', label: 'Ghana', cat: 'paises' }, { id: 'nga', label: 'Nigeria', cat: 'paises' },
    { id: 'ksa', label: 'Arabia Saudita', cat: 'paises' }, { id: 'irn', label: 'Irán', cat: 'paises' },
    { id: 'egy', label: 'Egipto', cat: 'paises' }, { id: 'alg', label: 'Argelia', cat: 'paises' },
    { id: 'tun', label: 'Túnez', cat: 'paises' }, { id: 'mli', label: 'Malí', cat: 'paises' },
    { id: 'qat', label: 'Qatar', cat: 'paises' }, { id: 'par', label: 'Paraguay', cat: 'paises' },
    { id: 'ven', label: 'Venezuela', cat: 'paises' }, { id: 'bol', label: 'Bolivia', cat: 'paises' },
    { id: 'crc', label: 'Costa Rica', cat: 'paises' }, { id: 'pan', label: 'Panamá', cat: 'paises' },
    { id: 'jam', label: 'Jamaica', cat: 'paises' }, { id: 'nzl', label: 'Nueva Zelanda', cat: 'paises' },
    { id: 'sco', label: 'Escocia', cat: 'paises' }, { id: 'nor', label: 'Noruega', cat: 'paises' },
    { id: 'aut', label: 'Austria', cat: 'paises' }, { id: 'gre', label: 'Grecia', cat: 'paises' },
    { id: 'tur', label: 'Turquía', cat: 'paises' }, { id: 'ukr', label: 'Ucrania', cat: 'paises' },
    { id: 'cze', label: 'Rep. Checa', cat: 'paises' }, { id: 'rsa', label: 'Sudáfrica', cat: 'paises' },
    { id: 'hon', label: 'Honduras', cat: 'paises' }, { id: 'irl', label: 'Irlanda', cat: 'paises' },

    // ARGENTINA (66 Clubes exactos del catálogo)
    { id: 'arg_acassuso', label: 'Acassuso', cat: 'arg' },
    { id: 'arg_agropecuario', label: 'Agropecuario', cat: 'arg' },
    { id: 'arg_aldosivi', label: 'Aldosivi', cat: 'arg' },
    { id: 'arg_allboys', label: 'All Boys', cat: 'arg' },
    { id: 'arg_almagro', label: 'Almagro', cat: 'arg' },
    { id: 'arg_almirantebrown', label: 'Almirante Brown', cat: 'arg' },
    { id: 'arg_argentinos', label: 'Argentinos Juniors', cat: 'arg' },
    { id: 'arg_atlanta', label: 'Atlanta', cat: 'arg' },
    { id: 'arg_atleticotucuman', label: 'Atlético Tucumán', cat: 'arg' },
    { id: 'arg_atleticode rafaela', label: 'Atlético de Rafaela', cat: 'arg' },
    { id: 'arg_banfield', label: 'Banfield', cat: 'arg' },
    { id: 'arg_barracas', label: 'Barracas Central', cat: 'arg' },
    { id: 'arg_belgrano', label: 'Belgrano de Córdoba', cat: 'arg' },
    { id: 'arg_boca', label: 'Boca Juniors', cat: 'arg' },
    { id: 'arg_centralcordoba', label: 'Central Córdoba (SdE)', cat: 'arg' },
    { id: 'arg_centralnorte', label: 'Central Norte', cat: 'arg' },
    { id: 'arg_chacarita', label: 'Chacarita Juniors', cat: 'arg' },
    { id: 'arg_chacoforever', label: 'Chaco For Ever', cat: 'arg' },
    { id: 'arg_ciudadbolivar', label: 'Ciudad de Bolívar', cat: 'arg' },
    { id: 'arg_colegiales', label: 'Colegiales', cat: 'arg' },
    { id: 'arg_colon', label: 'Colón', cat: 'arg' },
    { id: 'arg_defensa', label: 'Defensa y Justicia', cat: 'arg' },
    { id: 'arg_defensores', label: 'Defensores de Belgrano', cat: 'arg' },
    { id: 'arg_depmadryn', label: 'Deportivo Madryn', cat: 'arg' },
    { id: 'arg_maipu', label: 'Deportivo Maipú', cat: 'arg' },
    { id: 'arg_moron', label: 'Deportivo Morón', cat: 'arg' },
    { id: 'arg_riestra', label: 'Deportivo Riestra', cat: 'arg' },
    { id: 'arg_estudiantesba', label: 'Estudiantes (BA)', cat: 'arg' },
    { id: 'arg_estudiantes', label: 'Estudiantes de La Plata', cat: 'arg' },
    { id: 'arg_estudiantesrc', label: 'Estudiantes de Río Cuarto', cat: 'arg' },
    { id: 'arg_ferro', label: 'Ferro Carril Oeste', cat: 'arg' },
    { id: 'arg_gimnasiajujuy', label: 'Gimnasia (J)', cat: 'arg' },
    { id: 'arg_gimnasiamza', label: 'Gimnasia de Mendoza', cat: 'arg' },
    { id: 'arg_gimnasia', label: 'Gimnasia y Esgrima LP', cat: 'arg' },
    { id: 'arg_gimnasiatirosalta', label: 'Gimnasia y Tiro (Salta)', cat: 'arg' },
    { id: 'arg_godoycruz', label: 'Godoy Cruz', cat: 'arg' },
    { id: 'arg_guemes', label: 'Güemes (SdE)', cat: 'arg' },
    { id: 'arg_huracan', label: 'Huracán', cat: 'arg' },
    { id: 'arg_independiente', label: 'Independiente', cat: 'arg' },
    { id: 'arg_indrivadavia', label: 'Independiente Rivadavia', cat: 'arg' },
    { id: 'arg_instituto', label: 'Instituto', cat: 'arg' },
    { id: 'arg_lanus', label: 'Lanús', cat: 'arg' },
    { id: 'arg_losandes', label: 'Los Andes', cat: 'arg' },
    { id: 'arg_midland', label: 'Midland', cat: 'arg' },
    { id: 'arg_mitre', label: 'Mitre (SdE)', cat: 'arg' },
    { id: 'arg_newells', label: "Newell's Old Boys", cat: 'arg' },
    { id: 'arg_nuevachicago', label: 'Nueva Chicago', cat: 'arg' },
    { id: 'arg_patronato', label: 'Patronato', cat: 'arg' },
    { id: 'arg_platense', label: 'Platense', cat: 'arg' },
    { id: 'arg_quilmes', label: 'Quilmes', cat: 'arg' },
    { id: 'arg_racingcba', label: 'Racing (CBA)', cat: 'arg' },
    { id: 'arg_racing', label: 'Racing Club', cat: 'arg' },
    { id: 'arg_river', label: 'River Plate', cat: 'arg' },
    { id: 'arg_rosario', label: 'Rosario Central', cat: 'arg' },
    { id: 'arg_sanlorenzo', label: 'San Lorenzo', cat: 'arg' },
    { id: 'arg_sanmartinsj', label: 'San Martín (SJ)', cat: 'arg' },
    { id: 'arg_sanmartintuc', label: 'San Martín (T)', cat: 'arg' },
    { id: 'arg_sanmiguel', label: 'San Miguel', cat: 'arg' },
    { id: 'arg_santelmo', label: 'San Telmo', cat: 'arg' },
    { id: 'arg_sarmiento', label: 'Sarmiento de Junín', cat: 'arg' },
    { id: 'arg_talleres', label: 'Talleres de Córdoba', cat: 'arg' },
    { id: 'arg_temperley', label: 'Temperley', cat: 'arg' },
    { id: 'arg_tigre', label: 'Tigre', cat: 'arg' },
    { id: 'arg_tristansuarez', label: 'Tristán Suárez', cat: 'arg' },
    { id: 'arg_union', label: 'Unión de Santa Fe', cat: 'arg' },
    { id: 'arg_velez', label: 'Vélez Sarsfield', cat: 'arg' },

    // BRASIL (Nombres exactos de tu catálogo)
    { id: 'bra_flamengo', label: 'Flamengo', cat: 'bra' },
    { id: 'bra_palmeiras', label: 'Palmeiras', cat: 'bra' },
    { id: 'bra_saopaulo', label: 'São Paulo', cat: 'bra' },
    { id: 'bra_corinthians', label: 'Corinthians', cat: 'bra' },
    { id: 'bra_santos', label: 'Santos', cat: 'bra' },
    { id: 'bra_vasco', label: 'Vasco da Gama', cat: 'bra' },
    { id: 'bra_fluminense', label: 'Fluminense', cat: 'bra' },
    { id: 'bra_botafogo', label: 'Botafogo', cat: 'bra' },
    { id: 'bra_atleticomg', label: 'Atlético Mineiro', cat: 'bra' },
    { id: 'bra_cruzeiro', label: 'Cruzeiro', cat: 'bra' },
    { id: 'bra_gremio', label: 'Grêmio', cat: 'bra' },
    { id: 'bra_internacional', label: 'Internacional', cat: 'bra' },
    { id: 'bra_athleticopr', label: 'Athletico Paranaense', cat: 'bra' },
    { id: 'bra_bahia', label: 'Bahía', cat: 'bra' },
    { id: 'bra_bragantino', label: 'Bragantino', cat: 'bra' },
    { id: 'bra_coritiba', label: 'Coritiba', cat: 'bra' },
    { id: 'bra_chapecoense', label: 'Chapecoense', cat: 'bra' },
    { id: 'bra_mirassol', label: 'Mirassol', cat: 'bra' },
    { id: 'bra_vitoria', label: 'Vitória', cat: 'bra' },
    { id: 'bra_remo', label: 'Remo', cat: 'bra' },

    // COLOMBIA (Liga BetPlay)
    { id: 'col_aguilas', label: 'Águilas Doradas', cat: 'col' },
    { id: 'col_alianza', label: 'Alianza FC', cat: 'col' },
    { id: 'col_america', label: 'América de Cali', cat: 'col' },
    { id: 'col_nacional', label: 'Atlético Nacional', cat: 'col' },
    { id: 'col_chico', label: 'Boyacá Chicó', cat: 'col' },
    { id: 'col_bucaramanga', label: 'Atlético Bucaramanga', cat: 'col' },
    { id: 'col_cucuta', label: 'Cúcuta Deportivo', cat: 'col' },
    { id: 'col_cali', label: 'Deportivo Cali', cat: 'col' },
    { id: 'col_medellin', label: 'Independiente Medellín', cat: 'col' },
    { id: 'col_fortaleza', label: 'Fortaleza CEIF', cat: 'col' },
    { id: 'col_interpalmira', label: 'Internacional de Bogotá', cat: 'col' },
    { id: 'col_jaguares', label: 'Jaguares de Córdoba', cat: 'col' },
    { id: 'col_junior', label: 'Junior de Barranquilla', cat: 'col' },
    { id: 'col_llaneros', label: 'Llaneros FC', cat: 'col' },
    { id: 'col_millonarios', label: 'Millonarios', cat: 'col' },
    { id: 'col_oncecaldas', label: 'Once Caldas', cat: 'col' },
    { id: 'col_pasto', label: 'Deportivo Pasto', cat: 'col' },
    { id: 'col_pereira', label: 'Deportivo Pereira', cat: 'col' },
    { id: 'col_santafe', label: 'Santa Fe', cat: 'col' },
    { id: 'col_tolima', label: 'Deportes Tolima', cat: 'col' },

    // ESPAÑA (Nombres exactos de tu catálogo)
    { id: 'esp_realmadrid', label: 'Real Madrid', cat: 'esp' },
    { id: 'esp_barcelona', label: 'FC Barcelona', cat: 'esp' },
    { id: 'esp_atletico', label: 'Atlético de Madrid', cat: 'esp' },
    { id: 'esp_athletic', label: 'Athletic Club', cat: 'esp' },
    { id: 'esp_betis', label: 'Real Betis', cat: 'esp' },
    { id: 'esp_realsociedad', label: 'Real Sociedad', cat: 'esp' },
    { id: 'esp_sevilla', label: 'Sevilla FC', cat: 'esp' },
    { id: 'esp_villarreal', label: 'Villarreal CF', cat: 'esp' },
    { id: 'esp_valencia', label: 'Valencia CF', cat: 'esp' },
    { id: 'esp_osasuna', label: 'CA Osasuna', cat: 'esp' },
    { id: 'esp_celta', label: 'RC Celta de Vigo', cat: 'esp' },
    { id: 'esp_alaves', label: 'Deportivo Alavés', cat: 'esp' },
    { id: 'esp_getafe', label: 'Getafe CF', cat: 'esp' },
    { id: 'esp_mallorca', label: 'RCD Mallorca', cat: 'esp' },
    { id: 'esp_laspalmas', label: 'UD Las Palmas', cat: 'esp' },
    { id: 'esp_rayo', label: 'Rayo Vallecano', cat: 'esp' },
    { id: 'esp_girona', label: 'Girona FC', cat: 'esp' },
    { id: 'esp_leganes', label: 'CD Leganés', cat: 'esp' },
    { id: 'esp_valladolid', label: 'Real Valladolid', cat: 'esp' },
    { id: 'esp_espanyol', label: 'RCD Espanyol', cat: 'esp' },

    // INGLATERRA (Nombres exactos de tu catálogo)
    { id: 'eng_arsenal', label: 'Arsenal', cat: 'eng' },
    { id: 'eng_astonvilla', label: 'Aston Villa', cat: 'eng' },
    { id: 'eng_bournemouth', label: 'Bournemouth', cat: 'eng' },
    { id: 'eng_brentford', label: 'Brentford', cat: 'eng' },
    { id: 'eng_brighton', label: 'Brighton & Hove Albion', cat: 'eng' },
    { id: 'eng_chelsea', label: 'Chelsea', cat: 'eng' },
    { id: 'eng_crystalpalace', label: 'Crystal Palace', cat: 'eng' },
    { id: 'eng_everton', label: 'Everton', cat: 'eng' },
    { id: 'eng_fulham', label: 'Fulham', cat: 'eng' },
    { id: 'eng_ipswich', label: 'Ipswich Town', cat: 'eng' },
    { id: 'eng_leeds', label: 'Leeds United', cat: 'eng' },
    { id: 'eng_liverpool', label: 'Liverpool', cat: 'eng' },
    { id: 'eng_mancity', label: 'Manchester City', cat: 'eng' },
    { id: 'eng_manunited', label: 'Manchester United', cat: 'eng' },
    { id: 'eng_newcastle', label: 'Newcastle United', cat: 'eng' },
    { id: 'eng_nottingham', label: 'Nottingham Forest', cat: 'eng' },
    { id: 'eng_sunderland', label: 'Sunderland', cat: 'eng' },
    { id: 'eng_tottenham', label: 'Tottenham Hotspur', cat: 'eng' },
    { id: 'eng_coventry', label: 'Coventry City', cat: 'eng' },
    { id: 'eng_hull', label: 'Hull City', cat: 'eng' },

    // ITALIA (Nombres exactos de tu catálogo)
    { id: 'ita_juventus', label: 'Juventus', cat: 'ita' },
    { id: 'ita_inter', label: 'Inter de Milán', cat: 'ita' },
    { id: 'ita_milan', label: 'AC Milan', cat: 'ita' },
    { id: 'ita_roma', label: 'AS Roma', cat: 'ita' },
    { id: 'ita_lazio', label: 'SS Lazio', cat: 'ita' },
    { id: 'ita_napoli', label: 'Napoli', cat: 'ita' },
    { id: 'ita_fiorentina', label: 'Fiorentina', cat: 'ita' },
    { id: 'ita_atalanta', label: 'Atalanta', cat: 'ita' },
    { id: 'ita_bologna', label: 'Bologna', cat: 'ita' },
    { id: 'ita_torino', label: 'Torino', cat: 'ita' },
    { id: 'ita_udinese', label: 'Udinese', cat: 'ita' },
    { id: 'ita_genoa', label: 'Genoa', cat: 'ita' },
    { id: 'ita_verona', label: 'Hellas Verona', cat: 'ita' },
    { id: 'ita_empoli', label: 'Empoli', cat: 'ita' },
    { id: 'ita_lecce', label: 'Lecce', cat: 'ita' },
    { id: 'ita_monza', label: 'Monza', cat: 'ita' },
    { id: 'ita_cagliari', label: 'Cagliari', cat: 'ita' },
    { id: 'ita_parma', label: 'Parma', cat: 'ita' },
    { id: 'ita_como', label: 'Como 1907', cat: 'ita' },
    { id: 'ita_venezia', label: 'Venezia FC', cat: 'ita' },

    // 🇨🇱 CHILE
    { id: 'chi_colocolo', label: 'Colo Colo', cat: 'chi' },
    { id: 'chi_ucatolica', label: 'Universidad Católica', cat: 'chi' },
    { id: 'chi_coquimbo', label: 'Coquimbo Unido', cat: 'chi' },
    { id: 'chi_everton', label: 'Everton CD', cat: 'chi' },
    { id: 'chi_huachipato', label: 'Huachipato', cat: 'chi' },
    { id: 'chi_limache', label: 'Deportes Limache', cat: 'chi' },
    { id: 'chi_palestino', label: 'Palestino', cat: 'chi' },
    { id: 'chi_nublense', label: 'Ñublense', cat: 'chi' },
    { id: 'chi_uchile', label: 'Universidad de Chile', cat: 'chi' },
    { id: 'chi_ohiggins', label: "O'Higgins", cat: 'chi' },
    { id: 'chi_uconcepcion', label: 'Universidad de Concepción', cat: 'chi' },
    { id: 'chi_laserena', label: 'La Serena', cat: 'chi' },
    { id: 'chi_audax', label: 'Audax Italiano', cat: 'chi' },
    { id: 'chi_cobresal', label: 'Cobresal', cat: 'chi' },
    { id: 'chi_dconcepcion', label: 'Deportes Concepción', cat: 'chi' },
    { id: 'chi_calera', label: 'Unión La Calera', cat: 'chi' },

    // 🇫🇷 FRANCIA
    { id: 'fra_psg', label: 'Paris Saint-Germain', cat: 'fra' },
    { id: 'fra_marseille', label: 'Marseille', cat: 'fra' },
    { id: 'fra_lyon', label: 'Lyon', cat: 'fra' },
    { id: 'fra_lille', label: 'Lille', cat: 'fra' },
    { id: 'fra_monaco', label: 'Monaco', cat: 'fra' },
    { id: 'fra_lens', label: 'Lens', cat: 'fra' },
    { id: 'fra_nice', label: 'Nice', cat: 'fra' },
    { id: 'fra_rennes', label: 'Rennes', cat: 'fra' },
    { id: 'fra_strasbourg', label: 'Strasbourg', cat: 'fra' },
    { id: 'fra_toulouse', label: 'Toulouse', cat: 'fra' },
    { id: 'fra_lehavre', label: 'Le Havre', cat: 'fra' },
    { id: 'fra_angers', label: 'Angers', cat: 'fra' },
    { id: 'fra_auxerre', label: 'Auxerre', cat: 'fra' },
    { id: 'fra_brest', label: 'Brest', cat: 'fra' },
    { id: 'fra_lorient', label: 'Lorient', cat: 'fra' },
    { id: 'fra_lemans', label: 'Le Mans', cat: 'fra' },
    { id: 'fra_parisfc', label: 'Paris FC', cat: 'fra' },
    { id: 'fra_troyes', label: 'Troyes', cat: 'fra' },

    // 🇩🇪 ALEMANIA
    { id: 'ger_bayern', label: 'Bayern Munich', cat: 'ger' },
    { id: 'ger_dortmund', label: 'Borussia Dortmund', cat: 'ger' },
    { id: 'ger_leverkusen', label: 'Bayer Leverkusen', cat: 'ger' },
    { id: 'ger_leipzig', label: 'RB Leipzig', cat: 'ger' },
    { id: 'ger_stuttgart', label: 'VfB Stuttgart', cat: 'ger' },
    { id: 'ger_frankfurt', label: 'Eintracht Frankfurt', cat: 'ger' },
    { id: 'ger_freiburg', label: 'SC Freiburg', cat: 'ger' },
    { id: 'ger_hoffenheim', label: 'TSG Hoffenheim', cat: 'ger' },
    { id: 'ger_bremen', label: 'Werder Bremen', cat: 'ger' },
    { id: 'ger_monchengladbach', label: 'Borussia Mönchengladbach', cat: 'ger' },
    { id: 'ger_mainz', label: 'Mainz 05', cat: 'ger' },
    { id: 'ger_augsburg', label: 'FC Augsburg', cat: 'ger' },
    { id: 'ger_unionberlin', label: 'Union Berlin', cat: 'ger' },
    { id: 'ger_koln', label: '1. FC Köln', cat: 'ger' },
    { id: 'ger_hamburg', label: 'Hamburger SV', cat: 'ger' },
    { id: 'ger_schalke', label: 'Schalke 04', cat: 'ger' },
    { id: 'ger_paderborn', label: 'SC Paderborn', cat: 'ger' },
    { id: 'ger_elversberg', label: 'SV Elversberg', cat: 'ger' },

    // 🇵🇹 PORTUGAL
    { id: 'por_benfica', label: 'Benfica', cat: 'por' },
    { id: 'por_porto', label: 'FC Porto', cat: 'por' },
    { id: 'por_sporting', label: 'Sporting CP', cat: 'por' },
    { id: 'por_braga', label: 'SC Braga', cat: 'por' },
    { id: 'por_vitoria', label: 'Vitória de Guimarães', cat: 'por' },
    { id: 'por_rioave', label: 'Rio Ave', cat: 'por' },
    { id: 'por_famalicao', label: 'FC Famalicão', cat: 'por' },
    { id: 'por_arouca', label: 'Arouca', cat: 'por' },
    { id: 'por_gilvicente', label: 'Gil Vicente', cat: 'por' },
    { id: 'por_estoril', label: 'Estoril', cat: 'por' },
    { id: 'por_casapia', label: 'Casa Pia', cat: 'por' },
    { id: 'por_nacional', label: 'C.D. Nacional', cat: 'por' },
    { id: 'por_moreirense', label: 'Moreirense', cat: 'por' },
    { id: 'por_estrela', label: 'Estrela', cat: 'por' },
    { id: 'por_santaclara', label: 'Santa Clara', cat: 'por' },
    { id: 'por_avs', label: 'AVS', cat: 'por' },
    { id: 'por_alverca', label: 'Alverca', cat: 'por' },
    { id: 'por_tondela', label: 'C.D. Tondela', cat: 'por' },

    // 🇳🇱 PAÍSES BAJOS
    { id: 'ned_ajax', label: 'Ajax Amsterdam', cat: 'ned' },
    { id: 'ned_psv', label: 'PSV Eindhoven', cat: 'ned' },
    { id: 'ned_feyenoord', label: 'Feyenoord Rotterdam', cat: 'ned' },
    { id: 'ned_az', label: 'AZ Alkmaar', cat: 'ned' },
    { id: 'ned_twente', label: 'FC Twente', cat: 'ned' },
    { id: 'ned_utrecht', label: 'FC Utrecht', cat: 'ned' },
    { id: 'ned_heerenveen', label: 'Heerenveen', cat: 'ned' },
    { id: 'ned_groningen', label: 'FC Groningen', cat: 'ned' },
    { id: 'ned_goaheadeagles', label: 'Go Ahead Eagles', cat: 'ned' },
    { id: 'ned_nec', label: 'NEC Nijmegen', cat: 'ned' },
    { id: 'ned_willem', label: 'Willem II', cat: 'ned' },
    { id: 'ned_ado', label: 'ADO Den Haag', cat: 'ned' },
    { id: 'ned_sparta', label: 'Sparta Rotterdam', cat: 'ned' },
    { id: 'ned_excelsior', label: 'Excelsior', cat: 'ned' },
    { id: 'ned_fortuna', label: 'Fortuna Sittard', cat: 'ned' },
    { id: 'ned_cambuur', label: 'SC Cambuur', cat: 'ned' },
    { id: 'ned_telstar', label: 'Telstar', cat: 'ned' },

    // 🇲🇽 MÉXICO (LIGA MX)
    { id: 'mex_america', label: 'Club América', cat: 'mex' },
    { id: 'mex_chivas', label: 'Chivas Guadalajara', cat: 'mex' },
    { id: 'mex_cruzazul', label: 'Cruz Azul', cat: 'mex' },
    { id: 'mex_pumas', label: 'Pumas UNAM', cat: 'mex' },
    { id: 'mex_tigres', label: 'Tigres UANL', cat: 'mex' },
    { id: 'mex_monterrey', label: 'CF Monterrey', cat: 'mex' },
    { id: 'mex_toluca', label: 'Toluca', cat: 'mex' },
    { id: 'mex_pachuca', label: 'Pachuca', cat: 'mex' },
    { id: 'mex_santos', label: 'Santos Laguna', cat: 'mex' },
    { id: 'mex_leon', label: 'Club León', cat: 'mex' },
    { id: 'mex_atlas', label: 'Atlas', cat: 'mex' },
    { id: 'mex_tijuana', label: 'Club Tijuana', cat: 'mex' },
    { id: 'mex_puebla', label: 'Puebla', cat: 'mex' },
    { id: 'mex_necaxa', label: 'Necaxa', cat: 'mex' },
    { id: 'mex_sanluis', label: 'Atlético San Luis', cat: 'mex' },
    { id: 'mex_juarez', label: 'FC Juárez', cat: 'mex' },
    { id: 'mex_queretaro', label: 'Querétaro', cat: 'mex' },
    { id: 'mex_atlante', label: 'Atlante', cat: 'mex' }
];

function obtenerUrlEscudo(id) {
    const aWebp = (url) => (!url || url.includes('flagcdn.com')) ? url : url.replace(/\.png$/i, '.webp');

    if (!id || id === 'ev') return aWebp(ESCUDOS_MAP['ev']);
    if (ESCUDOS_MAP[id]) return aWebp(ESCUDOS_MAP[id]);
    
    // 1. Memoria persistente: si ya se resolvió antes, no espera a Supabase en el F5
    const cached = localStorage.getItem('ev_escudo_url_' + id);
    if (cached) {
        const urlFinal = aWebp(cached);
        ESCUDOS_MAP[id] = urlFinal;
        return urlFinal;
    }

    // 2. Si es un club, buscar en catalogoGlobal limpiando tildes y caracteres especiales
    if (typeof catalogoGlobal !== 'undefined' && catalogoGlobal && catalogoGlobal.length > 0) {
        const item = BANDERAS_LISTA.find(b => b.id === id);
        if (item && item.cat !== 'paises') {
            const limpiar = (txt) => (txt || '')
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "")
                .trim();

            const nombreBuscado = limpiar(item.label);

            const encontrado = catalogoGlobal.find(f => {
                const clubDb = limpiar(bscarPropiedad(f, 'Club'));
                return clubDb === nombreBuscado;
            });

            if (encontrado) {
                const foto = bscarPropiedad(encontrado, 'Foto');
                if (foto && foto.trim()) {
                    const urlLimpia = aWebp(foto.trim());
                    ESCUDOS_MAP[id] = urlLimpia;
                    localStorage.setItem('ev_escudo_url_' + id, urlLimpia);
                    return urlLimpia;
                }
            }
        }
    }

    // 3. Diccionario oficial de respaldo y guardado en memoria RAM
    const fallbackUrl = aWebp(ESCUDOS_MAP[id] || ESCUDOS_MAP['ev']);
    ESCUDOS_MAP[id] = fallbackUrl;
    return fallbackUrl;
}

let categoriaEscudosActual = 'todos';

window.desplazarTabsEscudos = function(desplazamiento) {
    const bar = document.getElementById('escudos-tabs-bar');
    if (bar) {
        bar.scrollBy({ left: desplazamiento, behavior: 'smooth' });
    }
};

window.abrirModalSelectorEscudo = function() {
    const m = document.getElementById('selector-escudos-modal');
    if (!m) return;
    m.style.display = 'flex';
    const input = document.getElementById('buscador-escudos');
    if (input) input.value = '';
    renderizarEscudosGrid(BANDERAS_LISTA);
};

window.cerrarModalSelectorEscudo = function() {
    const m = document.getElementById('selector-escudos-modal');
    if (m) m.style.display = 'none';
    selectorEscudoParaOnceActivo = false;
};

window.cambiarCategoriaEscudos = function(cat, btn) {
    categoriaEscudosActual = cat;
    document.querySelectorAll('.escudo-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    const input = document.getElementById('buscador-escudos');
    const term = input ? input.value.toLowerCase().trim() : '';
    
    let filtrados = cat === 'todos' ? BANDERAS_LISTA : BANDERAS_LISTA.filter(e => e.cat === cat);
    if (term) filtrados = filtrados.filter(e => e.label.toLowerCase().includes(term));
    renderizarEscudosGrid(filtrados);
};

window.filtrarEscudosEnVivo = function(term) {
    const q = term.toLowerCase().trim();
    let lista = categoriaEscudosActual === 'todos' ? BANDERAS_LISTA : BANDERAS_LISTA.filter(e => e.cat === categoriaEscudosActual);
    if (q) lista = lista.filter(e => e.label.toLowerCase().includes(q));
    renderizarEscudosGrid(lista);
};

function renderizarEscudosGrid(lista) {
    const container = document.getElementById('escudos-grid-container');
    if (!container) return;
    const actual = document.getElementById('avatar-logo-input')?.value || 'ev';

    if (!lista.length) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px 10px; color:var(--text-muted); font-size:0.85rem;">No se encontraron escudos o banderas.</div>`;
        return;
    }

    container.innerHTML = lista.map(item => {
        const isSel = item.id === actual;
        const urlImg = obtenerUrlEscudo(item.id);
        const fond = item.id === 'ev' 
            ? 'linear-gradient(135deg, #0f1419, #1a2233)' 
            : obtenerFondoClub(item.label, item.label);

        return `
        <div class="escudo-card-item ${isSel ? 'selected' : ''}" style="background: ${fond};" onclick="seleccionarEscudoDirecto('${item.id}')">
            <img src="${urlImg}" alt="${item.label}" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
            <span>${item.label}</span>
        </div>`;
    }).join('');
}

let selectorEscudoParaOnceActivo = false;

window.abrirSelectorEscudoParaOnce = function() {
    selectorEscudoParaOnceActivo = true;
    const modalEscudos = document.getElementById('selector-escudos-modal');
    if (modalEscudos) modalEscudos.style.zIndex = '10055';
    abrirModalSelectorEscudo();
};

window.seleccionarEscudoDirecto = function(id) {
    const urlFinal = obtenerUrlEscudo(id);

    if (selectorEscudoParaOnceActivo) {
        selectorEscudoParaOnceActivo = false;
        userStats.onceEscudo = id;
        localStorage.setItem('ev_once_escudo_' + getUserId(), id);
        guardarStats();
        renderizarOnceInicial();
        cerrarModalSelectorEscudo();
        showToast("¡Escudo del club actualizado! 🛡️", "ph-shield-check", "success");
        return;
    }

    const input = document.getElementById('avatar-logo-input');
    const preview = document.getElementById('avatar-logo-preview');
    const futClub = document.getElementById('fut-club-display');

    if (input) input.value = id;
    if (preview) preview.src = urlFinal;
    if (futClub) {
        futClub.src = urlFinal;
        futClub.setAttribute('referrerpolicy', 'no-referrer');
    }

    setPref('ev_avatar_logo', id);
    if (urlFinal && urlFinal !== ESCUDOS_MAP['ev']) {
        localStorage.setItem('ev_escudo_url_' + id, urlFinal);
        ESCUDOS_MAP[id] = urlFinal;
    }

    actualizarAvatarLive();
    cerrarModalSelectorEscudo();
};

function obtenerNombreBandera(id) {
    const item = BANDERAS_LISTA.find(b => b.id === id);
    return item ? item.label : 'Estadios Virt.';
}

window.cambiarBanderaPaso = function(direccion) {
    abrirModalSelectorEscudo();
};

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

let estadiosCargados=[],catalogoGlobal=[];
const todosLosGids=["0","861264971","554922783","88250864","2013531070","165565330","96716546","58862486","304687071","879164460","1616215119","1916896887","120485921"];
let guessrRondaActual=0,guessrPuntosTotales=0,rivalPuntosTotales=0,guessrEstadioCorrecto=null,guessrEstadiosJugados=[],guessrHistorialRondas=[];
let guessrDificultad = 'medio';
let guessrTimerIndividualInterval = null;
let guessrTiempoRestanteIndividual = 45;
let guessrMapInstance=null,guessrUserMarker=null,guessrTargetMarker=null,guessrPolyline=null,guessrSelectedLatLng=null;
let usuarioLogueadoCache = undefined;
let previewMapInstance=null;
let pendingScore=null,pendingScoreType=null;

const NIVELES=(function(){
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
if(userStats.xpTotal===undefined)userStats.xpTotal=0;
if(userStats.maxScore>25000) userStats.maxScore = 25000; // 🛡️ Corrige récords inflados por el acumulador de XP previo
if(userStats.partidasGanadas===undefined) userStats.partidasGanadas = 0;
if(userStats.puntosHabilidad===undefined) userStats.puntosHabilidad = 0;
if(!userStats.mejorasJugadores || typeof userStats.mejorasJugadores !== 'object') userStats.mejorasJugadores = {};
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

function mostrarLevelUp(nivel){
const overlay=document.getElementById('levelup-overlay');
document.getElementById('levelup-icon').innerHTML=`<img src="${nivel.iconUrl}" style="width:200px; height:200px; object-fit:contain; filter:drop-shadow(0 0 20px ${nivel.color});">`;
document.getElementById('levelup-title').textContent='¡Subiste de nivel!';
document.getElementById('levelup-sub').innerHTML=`Ahora sos <b style="color:${nivel.color};">${nivel.nombre}</b>`;
overlay.classList.add('active');
dispararEfectoLucesGaming();
}
function cerrarLevelUp(){
    document.getElementById('levelup-overlay').classList.remove('active');
    setTimeout(() => {
        if (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) {
            comprobarRecompensaNivel(userStats.nivelActual);
        }
    }, 350);
}

let colaPremiosPendientes = [];
let xpPremioEnPantalla = 0;

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

function lanzarConfetti(targetCustom = null){
const overlay = targetCustom 
    || (document.getElementById('reward-overlay')?.classList.contains('active') ? document.getElementById('reward-overlay') : null)
    || (document.getElementById('levelup-overlay')?.classList.contains('active') ? document.getElementById('levelup-overlay') : null)
    || document.getElementById('modal-card');
if (!overlay) return;
const colors=['#00e676','#eab308','#a78bfa','#ff4757','#2979ff','#ffd700'];
for(let i=0;i<45;i++){
const p=document.createElement('div');p.className='confetti-piece';
p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*20}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*.4}s;animation-duration:${1+Math.random()*1.1}s;transform:rotate(${Math.random()*360}deg);pointer-events:none;z-index:99999;`;
overlay.appendChild(p);setTimeout(()=>p.remove(),2400);
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
const LIGA_COLORS={"0":"#74acdf","861264971":"#74acdf","554922783":"#cf142b","88250864":"#c60b1e","2013531070":"#009246","165565330":"#002395","96716546":"#ffce00","58862486":"#009c3b","304687071":"#d52b1e","879164460":"#1a6b3a","1616215119": "#f36c21","1916896887":"#046A38","120485921":"#006847"};
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
    
    // 🔄 Refrescamos en vivo la interfaz del perfil si estaba abierta en pantalla
    const profileModal = document.getElementById('profile-modal');
    if (profileModal && profileModal.style.display === 'flex') {
        abrirModalPerfil();
    }

    showToast(`¡Bienvenido, ${user.name.split(' ')[0]}! 🎉`);
    if (pendingScore !== null) setTimeout(() => guardarScorePendiente(), 500);
    setTimeout(() => verificarPremiosPendientes(), 1000);
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
    const avatarHTML=`<div style="width:36px;height:36px;border-radius:50%;border:2px solid var(--accent-color);display:flex;align-items:center;justify-content:center;background:#71a8ff;box-shadow:0 0 8px var(--accent-glow); position:relative; overflow:hidden;"><div style="transform: scale(0.35); transform-origin: center 75%; position:absolute; width:100px; height:100px; left: -34px; bottom: -18px;">${generarAvatarHTML(avatarImg)}</div></div>`;
    const nivel=NIVELES[calcularNivelIdx(userStats.xpTotal)];
    const nombre = obtenerNombreDisplay();
    const pos = getPref('ev_user_pos', 'DT');
    
    container.innerHTML=`<div class="hero-profile-wrapper" onclick="abrirModalPerfil()" title="Ver tu perfil y carta"><div style="text-align:right;"><div class="hero-profile-name">${nombre}</div><div class="hero-profile-sub"><span style="color:${nivel.color};">${nivel.emoji}</span> ${pos}</div></div>${avatarHTML}</div>`;
    ancestralHeaderNivel();
}

// 👤 MEMORIA Y GENERADOR DEL CÍRCULO DE AVATAR PARA TODOS LOS RANKINGS
let cacheAvataresUsuarios = {};

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
        if (datosRival.nivelActual >= 6) {
            botonDesafiarOnceHTML = `
                <button type="button" onclick="iniciarDesafioOnceRivalDirecto()" class="btn-inspect-invite-liga" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.28) 0%, rgba(20, 16, 8, 0.96) 60%, rgba(10, 8, 4, 0.98) 100%) !important; border: 1.5px solid #fbbf24 !important; border-top: 2px solid #fef08a !important; color: #fef08a !important; margin-top: 10px; box-shadow: 0 4px 14px rgba(234, 179, 8, 0.35) !important;">
                    <i class="ph-bold ph-sword"></i> Desafiar a su Once
                </button>
            `;
        } else {
            botonDesafiarOnceHTML = `
                <div style="margin-top: 10px; font-size: 0.74rem; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 8px 14px; border-radius: 12px; border: 1px dashed var(--border-strong); text-align: center; width: 100%; max-width: 340px; box-sizing: border-box;">
                    <i class="ph-bold ph-lock-key" style="color: #fbbf24; vertical-align: middle;"></i> Once en formación (Nivel ${datosRival.nivelActual}/6)
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

            ${botonDesafiarOnceHTML}
            ${botonInvitarLigaHTML}
        </div>
    `;
};

// ⚔️ DISPARADOR DEL DESAFÍO DE PLANTELES ASINCRÓNICO
window.iniciarDesafioOnceRivalDirecto = function() {
    const rival = window.datosUltimoRivalInspeccionado;
    if (!rival) return;

    if ((rival.nivelActual || 0) < 6) {
        showToast(`${rival.custom_nick} todavía no tiene los 11 titulares desbloqueados (Requiere Nivel 6) 🔒`, "ph-lock-key", "warning");
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
        const faltan = 11 - countUser;
        showToast(`Completá tus 11 titulares para jugar un desafío de planteles (te ${faltan === 1 ? 'falta 1 jugador' : `faltan ${faltan} jugadores`}) 🔒`, "ph-lock-key", "warning");
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

async function precargarAvataresComunidad() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('perfiles')
            .select('datos_juego')
            .limit(150);
        if (!error && data) {
            data.forEach(p => {
                const nick = p.datos_juego?.preferencias?.custom_nick;
                const avatar = p.datos_juego?.preferencias?.avatar_hair;
                if (nick && avatar) {
                    cacheAvataresUsuarios[nick.trim().toLowerCase()] = avatar;
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
const COLORES_CLUBES={
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
    "Atlante": "linear-gradient(135deg, #002f6c, #8b0000)"
};

const COLORES_PAISES={
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
        const params = "autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1";
        const qp = esJuego ? `?${params}&mute=1&controls=0` : `?${params}`;
        
       if(vid) {
            url=`https://www.youtube.com/embed/${vid}${qp}`;
        }
        
        // ⚡ SIN MARGEN NEGATIVO: El iframe se mantiene 100% visible para evitar el bloqueo del decodificador de Chrome Móvil
        const est="width:100%;height:100%;border:none;";
        const mascaraHTML = esJuego ? `<div class="yt-title-mask"><img src="mundo.webp" alt="Logo" class="yt-mask-icon"><span>STADIUMGUESSR</span></div>` : '';
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
    const banner = document.getElementById('versus-next-round-banner');
    if (banner) banner.remove();
    const sb = document.getElementById('versus-live-scoreboard');
    if (sb) sb.style.display = 'none';
    const gt = document.getElementById('game-title');
    if (gt) gt.style.display = 'inline-flex';
    document.getElementById('video-modal').style.display='none';document.getElementById('modal-video-container').innerHTML='';document.getElementById('game-ui').style.display='none';document.getElementById('modal-card').classList.remove('stadium-guessr-layout');document.getElementById('modal-card').classList.remove('resultado-final');
    try{if(guessrMapInstance){guessrMapInstance.remove();guessrMapInstance=null;}}catch(e){guessrMapInstance=null;}
    try{if(guessrUserMarker)guessrUserMarker.remove();}catch(e){}try{if(guessrTargetMarker)guessrTargetMarker.remove();}catch(e){}try{if(guessrPolyline)guessrPolyline.remove();}catch(e){}
    guessrUserMarker=guessrTargetMarker=guessrPolyline=null;guessrSelectedLatLng=null;
    guessrRondaActual = 0;
    verificarSobreBienvenidaPostPartida();
}

function abrirModalMapa(estadio,pais,lat,lng){
if(!lat||!lng||!lat.toString().trim()||!lng.toString().trim()){showToast('Coordenadas no disponibles.','ph-warning-circle','danger');return;}
document.getElementById('map-modal').style.display='flex';const pLat=parseFloat(lat.toString().replace(',','.')),pLng=parseFloat(lng.toString().replace(',','.'));
setTimeout(()=>{if(previewMapInstance)previewMapInstance.remove();previewMapInstance=L.map('modal-map-container',{attributionControl:false}).setView([pLat,pLng],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(previewMapInstance);L.circleMarker([pLat,pLng],{radius:9,color:'var(--accent-color)',fillColor:'var(--card-bg)',fillOpacity:1,weight:3}).addTo(previewMapInstance).bindPopup(`<b>${estadio}</b><br>${pais}`).openPopup();previewMapInstance.invalidateSize();},250);
}
function cerrarModalMapa(){document.getElementById('map-modal').style.display='none';if(previewMapInstance){previewMapInstance.remove();previewMapInstance=null;}}
function cerrarModalPerfil(){
    document.getElementById('profile-modal').style.display='none';
    if (window.navOrigenCarrera && typeof abrirModalModoCarrera === 'function') {
        window.navOrigenCarrera = false;
        abrirModalModoCarrera();
    }
}
// (cerrarModalOrden migrado a orden.js)
function cerrarModalRanking(){
    document.getElementById('ranking-modal').style.display='none';
    verificarSobreBienvenidaPostPartida();
}

let destinoDificultadActual = { modo: '', extra: null };

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

const MAPA_PAIS_A_CAT = {
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
    'méxico': 'mex', 'mexico': 'mex'
};

function resolverUrlFotoClub(club, pais, fotoOriginal) {
    if (club && typeof BANDERAS_LISTA !== 'undefined' && typeof ESCUDOS_MAP !== 'undefined') {
        const limpiar = (txt) => (txt || '')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "")
            .trim();

        const cLimpio = limpiar(club);
        const pLimpio = (pais || '').toLowerCase().trim();
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
            return ESCUDOS_MAP[item.id];
        }
    }
    return fotoOriginal || '';
}

function renderizarTarjetas(lista){
const gr=document.querySelector('.grid');gr.innerHTML='';
if(!lista.length){gr.innerHTML=`<div class="empty-state"><i class="ph-duotone ph-magnifying-glass empty-state-icon"></i><h3>Sin resultados</h3><p>No se encontraron estadios que coincidan.</p></div>`;return;}
lista.forEach((fila,idx)=>{
const estadio=bscarPropiedad(fila,'Estadio'),club=bscarPropiedad(fila,'Club');if(!estadio||!club)return;
const fotoDb=bscarPropiedad(fila,'Foto')?.trim()||'';
const pais=bscarPropiedad(fila,'País')?.trim()||'Argentina';
const urlFoto=resolverUrlFotoClub(club, pais, fotoDb);
const fond=obtenerFondoClub(club,pais),linkVideo=bscarPropiedad(fila,'Link del Video')?.trim()||'#',latR=bscarPropiedad(fila,'Latitud')?.toString().trim()||'',lngR=bscarPropiedad(fila,'Longitud')?.toString().trim()||'',dato=bscarPropiedad(fila,'Dato Curioso');
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
        const { data, error } = await supabaseClient
            .from('estadios_catalogo')
            .select('*');

        if (error) throw error;

        // 🛡️ Filtro anti-duplicados: conserva solo un registro único por Estadio + Club
        const estadiosVistos = new Set();
        const filasUnicas = (data || []).filter(fila => {
            const clave = `${(fila.estadio || '').trim().toLowerCase()}_${(fila.club || '').trim().toLowerCase()}`;
            if (!clave || clave === '_' || estadiosVistos.has(clave)) return false;
            estadiosVistos.add(clave);
            return true;
        });

        catalogoGlobal = filasUnicas.map(fila => ({
            'Estadio': fila.estadio,
            'Club': fila.club,
            'País': fila.pais,
            'Foto': (fila.foto || '').replace(/\.png$/i, '.webp'),
            'Link del Video': fila.link_video,
            'Latitud': fila.latitud,
            'Longitud': fila.longitud,
            'Dato Curioso': fila.dato_curioso,
            'Capacidad': fila.capacidad,
            'Año': fila.anio,
            'Promedio': fila.promedio,
            'GID': fila.gid
        }));

        console.log(`¡Catálogo global migrado y cargado en memoria! (${catalogoGlobal.length} estadios)`);
        estadiosCargados = [...catalogoGlobal];

        // Sincroniza en memoria el escudo guardado del usuario apenas baja el catálogo
        const savedLogo = getPref('ev_avatar_logo', 'ev');
        if (savedLogo && savedLogo !== 'ev') {
            const urlReal = obtenerUrlEscudo(savedLogo);
            const futClub = document.getElementById('fut-club-display');
            if (futClub && urlReal) {
                futClub.src = urlReal;
                futClub.setAttribute('referrerpolicy', 'no-referrer');
            }
        }
        
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
let esModoDiario = false;         // Bandera para saber si la partida activa es el Reto Diario (tipo Wordle)
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
let versusCountdownInterval = null; // ⏱️ Intervalo del contador regresivo (3 a 0)
let versusTiempoRestante = 15;
let handshakeInterval = null;     // Intervalo para el latido de sincronización
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

    if (!esModoVersus) {
        sb.style.display = 'none';
        if (gt) gt.style.display = 'inline-flex';
        return;
    }

    sb.style.display = 'flex';
    if (gt) gt.style.display = 'none';

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
                statusRivalHtml = `<span class="vs-status-tag hurry"><i class="ph-bold ph-lightning"></i> ¡Arriesgó! (<span id="vs-sb-rival-tag-sec">${versusTiempoRestante}s</span>)</span>`;
            } else {
                statusRivalHtml = `<span class="vs-status-tag ready rival"><i class="ph-bold ph-check"></i> Listo</span>`;
            }
        } else {
            statusRivalHtml = `<span class="vs-status-tag thinking"><i class="ph-bold ph-dots-three animate-pulse"></i> Pensando</span>`;
        }
    }

    let alertHtml = '';
    if (alerta) {
        alertHtml = `<div id="vs-sb-alert-box" class="vs-sb-alert">${alerta}</div>`;
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
                ${guessrDificultad === 'dificil' && !miGuessConfirmado && !rivalGuessConfirmado && !resultadosRondaMostrados ? `
                <span class="vs-sb-timer-badge" id="vs-sb-leyenda-timer">
                    <i class="ph-bold ph-timer"></i> <span id="vs-sb-leyenda-sec">${guessrTiempoRestanteIndividual}s</span>
                </span>` : ''}
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
        ${alertHtml}
    `;
}

// Reloj de arena visual de 15 segundos si el rival arriesga primero (Fijo, sin parpadeos)
function iniciarCuentaRegresivaVersus() {
    if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    versusTiempoRestante = 15;
    
    renderizarScoreboardVersus('<i class="ph-bold ph-timer" style="color:var(--danger-color);"></i> ¡' + sanitizarHTML(versusRivalNombre) + ' arriesgó! Te quedan <b id="vs-sb-timer-sec">' + versusTiempoRestante + 's</b>');

    versusTimerInterval = setInterval(() => {
        versusTiempoRestante--;
        
        // Actualizamos de forma atómica los números sin regenerar el cartel ni la pantalla
        const timerSec = document.getElementById('vs-sb-timer-sec');
        const rivalTagSec = document.getElementById('vs-sb-rival-tag-sec');
        if (timerSec) timerSec.textContent = versusTiempoRestante + 's';
        if (rivalTagSec) rivalTagSec.textContent = versusTiempoRestante + 's';

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

// Procesa el click de confirmación local en el modo Versus
async function confirmarArriesgoLocalVersus() {
    try {
        if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);
        if (versusTimerInterval) clearInterval(versusTimerInterval);
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
    if (versusTimerInterval) clearInterval(versusTimerInterval);
    versusTiempoRestante = 15;
    
    renderizarScoreboardVersus('<i class="ph-bold ph-hourglass animate-spin"></i> Esperando a ' + sanitizarHTML(versusRivalNombre) + '... <b id="vs-sb-wait-sec">' + versusTiempoRestante + 's</b>');

    versusTimerInterval = setInterval(() => {
        versusTiempoRestante--;
        
        // Actualizamos únicamente el texto del segundo sin desmontar el cartel
        const waitSec = document.getElementById('vs-sb-wait-sec');
        if (waitSec) {
            waitSec.textContent = versusTiempoRestante + 's';
        }

        if (versusTiempoRestante <= 0) {
            clearInterval(versusTimerInterval);
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

    if (guessrTimerIndividualInterval) clearInterval(guessrTimerIndividualInterval);
    if (versusTimerInterval) clearInterval(versusTimerInterval);
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
    
    guessrPolyline = L.polyline([[guessrSelectedLatLng.lat, guessrSelectedLatLng.lng], [tLat, tLng]], {color: '#ff4757', weight: 2, dashArray: '6,8'}).addTo(guessrMapInstance);

    const rivalMarker = L.circleMarker([rivalDataRonda.lat, rivalDataRonda.lng], {radius: 8, color: '#2979ff', fillColor: '#111820', fillOpacity: 1, weight: 3})
        .addTo(guessrMapInstance).bindPopup(`<b>Rival (+${rivalDataRonda.puntos} pts)</b>`);

    L.polyline([[rivalDataRonda.lat, rivalDataRonda.lng], [tLat, tLng]], {color: '#2979ff', weight: 2, dashArray: '4,6'}).addTo(guessrMapInstance);

    let marcasParaEncuadrar = [guessrTargetMarker, rivalMarker];
    if (guessrUserMarker) marcasParaEncuadrar.push(guessrUserMarker);
    guessrMapInstance.fitBounds(L.featureGroup(marcasParaEncuadrar).getBounds(), {padding: [50, 50]});

    const fraseFolkloreVersus = obtenerFraseFolklore(miDist);
    renderizarScoreboardVersus('<div style="color:var(--xp-gold); font-weight:900;">' + fraseFolkloreVersus + '</div>');

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
    const banner = document.getElementById('versus-next-round-banner');
    if (banner) banner.remove();

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
    lanzarRondaGuessr();
}

// TU FUNCIÓN CLÁSICA DE SIEMPRE (Protegiendo el modo solitario y apagando la IA)
// TU FUNCIÓN CLÁSICA DE SIEMPRE (Protegiendo el modo solitario y apagando la IA)
function iniciarTrivia(dificultad = 'medio'){ 
    cerrarLobbyEspera();
    
    esModoVersus = false; 
    esModoBot = false;
    esModoDiario = false;
    guessrDificultad = dificultad;
    
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
} else {
    const sb = document.getElementById('versus-live-scoreboard');
    if (sb) sb.style.display = 'none';
    const gt = document.getElementById('game-title');
    if (gt) gt.style.display = 'inline-flex';
}

if (guessrDificultad === 'dificil' && !esModoDiario) {
    if (!esModoVersus) {
        document.getElementById('game-title').innerHTML = `<span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span> &nbsp;·&nbsp; RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--danger-color); font-weight:900;">⏱️ ${guessrTiempoRestanteIndividual}s</span>`;
    }
    
    guessrTimerIndividualInterval = setInterval(() => {
        guessrTiempoRestanteIndividual--;
        if (esModoVersus) {
            const sec = document.getElementById('vs-sb-leyenda-sec');
            if (sec) sec.textContent = guessrTiempoRestanteIndividual + 's';
        } else {
            const gt = document.getElementById('game-title');
            if (gt) gt.innerHTML = `<span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span> &nbsp;·&nbsp; RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--danger-color); font-weight:900;">⏱️ ${guessrTiempoRestanteIndividual}s</span>`;
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
const latUsuario = guessrSelectedLatLng ? guessrSelectedLatLng.lat : 0;
const lngUsuario = guessrSelectedLatLng ? guessrSelectedLatLng.lng : 0;

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
guessrPolyline=L.polyline([[guessrSelectedLatLng.lat,guessrSelectedLatLng.lng],[tLat,tLng]],{color:'#ff4757',weight:2,dashArray:'6,8'}).addTo(guessrMapInstance);
guessrMapInstance.fitBounds(L.featureGroup([guessrUserMarker,guessrTargetMarker]).getBounds(),{padding:[40,40]});
const fraseFolklore = obtenerFraseFolklore(dist);
document.getElementById('game-title').innerHTML = `<div style="font-size: 0.85rem; color: var(--xp-gold); font-weight: 900; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; animation: bounceFun 0.4s ease;">${fraseFolklore}</div><div style="font-size: 0.8rem; opacity: 0.8;">RONDA ${guessrRondaActual} DE 5 &nbsp;·&nbsp; <span style="color:var(--accent-color); font-weight:900;">${guessrPuntosTotales} PTS</span></div>`;
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

function avanzarDeRondaGuessr(){[guessrUserMarker,guessrTargetMarker,guessrPolyline].forEach(m=>{try{if(m)m.remove();}catch(e){}});guessrUserMarker=guessrTargetMarker=guessrPolyline=null;guessrRondaActual++;guessrRondaActual<=5?lanzarRondaGuessr():finalizarJuegoGuessr();}



// CIERRE DEL JUEGO ADAPTADO PARA MULTIJUGADOR (HUMANO/BOT) Y SOLITARIO
async function finalizarJuegoGuessr(){
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
            try { await supabaseClient.from('victorias_versus').insert([{ id_usuario: id, nombre: nombreLocal, liga: ligaJugada }]); } catch(err) {}
        } else if (guessrPuntosTotales < rivalPuntosTotales) {
            cartelResultado = "<span>DERROTA</span> ❌";
            colorResultado = "#ff4757";
            showToast("Derrota. ¡A entrenar para la revancha! ⚽", "ph-x-circle", "danger");
            
            if (ligaJugada) {
                try { await supabaseClient.from('derrotas_versus').insert([{ id_usuario: id, nombre: nombreLocal, liga: ligaJugada }]); } catch(err) {}
            }
        } else {
            cartelResultado = "<span>¡EMPATE DE CRACKS!</span> 🤝";
            colorResultado = "#2979ff";
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
    enviarPuntaje(nombreParaGuardar, guessrPuntosTotales, emailParaGuardar, pendingScoreType);

    if (eraRetoDiario) {
        enviarPuntaje(nombreParaGuardar, guessrPuntosTotales, emailParaGuardar, 'guessr');
    }
    const ligaAmigos = localStorage.getItem('ev_codigo_liga_amigos');
    if (ligaAmigos) {
        enviarPuntaje(nombreParaGuardar, guessrPuntosTotales, emailParaGuardar, 'duelo_' + ligaAmigos);
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

    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            showToast("¡Reto copiado! Compartilo con tus amigos 🚀", "ph-copy", "success");
        }).catch(err => {
            showToast("Tu navegador no soporta copiado directo.", "ph-warning-circle", "warning");
        });
    }
}

async function abrirModalRanking(modoEspecifico = 'solo') {
    precargarAvataresComunidad();
    const body = document.getElementById('ranking-modal-body');
    body.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--text-muted);"><i class="ph-duotone ph-circle-notch" style="font-size:2.5rem;color:var(--accent-color);animation:spinSlow 1s linear infinite;"></i><br><br>Conectando...</div>';
    document.getElementById('ranking-modal').style.display = 'flex';

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
            '<img src="medalla-oro.webp" alt="1º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">',
            '<img src="medalla-plata.webp" alt="2º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">',
            '<img src="medalla-bronce.webp" alt="3º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">'
        ];

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
                    const med = i < 3 ? medallas3D[i] : `<span style="color:var(--text-muted); font-weight:700; width:24px; display:inline-block; text-align:center;">${i + 1}</span>`;
                    const nombreJugador = (f.nombre || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} ${sanitizarHTML(nombreJugador)}
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
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
                        <span class="sticky-rank-pill">#${miPuestoIdx + 1}</span> ${obtenerAvatarCirculoHTML(miNombre)} <b>${sanitizarHTML(miNombre)} (Vos)</b>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
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
                    const med = i < 3 ? medallas3D[i] : `<span style="color:var(--text-muted); font-weight:700; width:24px; display:inline-block; text-align:center;">${i + 1}</span>`;
                    const nombreJugador = (f.nombre || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} ${sanitizarHTML(nombreJugador)}
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
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
                        <span class="sticky-rank-pill">#${miPuestoIdx + 1}</span> ${obtenerAvatarCirculoHTML(miNombre)} <b>${sanitizarHTML(miNombre)} (Vos)</b>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                        ${recordReal.toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span>
                    </span>
                </div>`;
            }

            htmlContenido += '</div>';

        } else if (modoEspecifico === 'v_historico') {
            const { data: rankingCompleto, error } = await supabaseClient.rpc('obtener_ranking_versus_global', { p_tipo: 'historico' });
            if (error) throw error;

            const ranking = (rankingCompleto || []).slice(0, 50); // ⚡ TOP 50
            const miPuestoIdx = (rankingCompleto || []).findIndex(f => (f.nombre_jugador || '').trim().toLowerCase() === miNombre.toLowerCase());

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
                    const med = i < 3 ? medallas3D[i] : `<span style="color:var(--text-muted); font-weight:700; width:24px; display:inline-block; text-align:center;">${i + 1}</span>`;
                    const nombreJugador = (f.nombre_jugador || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} ${sanitizarHTML(nombreJugador)}
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                            ${f.victorias_acumuladas || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">W</span>
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
                        <span class="sticky-rank-pill">#${miPuestoIdx + 1}</span> ${obtenerAvatarCirculoHTML(miNombre)} <b>${sanitizarHTML(miNombre)} (Vos)</b>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                        ${misWins} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">W</span>
                    </span>
                </div>`;
            }

            htmlContenido += '</div>';

        } else if (modoEspecifico === 'v_semanal') {
            const { data: rankingCompleto, error } = await supabaseClient.rpc('obtener_ranking_versus_global', { p_tipo: 'semanal' });
            if (error) throw error;

            const ranking = (rankingCompleto || []).slice(0, 50); // ⚡ TOP 50
            const miIdx = (rankingCompleto || []).findIndex(f => (f.nombre_jugador || '').trim().toLowerCase() === miNombre.toLowerCase());
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
                    const med = i < 3 ? medallas3D[i] : `<span style="color:var(--text-muted); font-weight:700; width:24px; display:inline-block; text-align:center;">${i + 1}</span>`;
                    const nombreJugador = (f.nombre_jugador || 'Anónimo').trim();
                    const esPropio = miNombre && nombreJugador.toLowerCase() === miNombre.toLowerCase();
                    htmlContenido += `
                    <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                        <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreJugador.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreJugador)}">
                            ${med} ${obtenerAvatarCirculoHTML(nombreJugador)} ${sanitizarHTML(nombreJugador)}
                        </span>
                        <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                            ${f.victorias_acumuladas || 0} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">W</span>
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
                        <span class="sticky-rank-pill">#${miIdx + 1}</span> ${obtenerAvatarCirculoHTML(miNombre)} <b>${sanitizarHTML(miNombre)} (Vos)</b>
                    </span>
                    <span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">
                        ${misWinsSemana} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">W</span>
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

// (Módulo Desafío de Orden migrado a orden.js)

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

window.toggleCustomization=function(){const panel=document.getElementById('customization-panel-wrapper');const btn=document.getElementById('btn-toggle-custom');
if(!panel.classList.contains('open')){panel.classList.add('open');btn.innerHTML='<img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> PERSONALIZÁ TU CARTA ▼';}
else{panel.classList.remove('open');btn.innerHTML='<img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> PERSONALIZÁ TU CARTA ▼';}
};
const AVATARES_LISTA = [
    // 🌟 INICIALES DISPONIBLES (NIVEL 0 - 6 JUGADORES)
    { id: '7.webp', label: 'El Canario', nivel: 0 },
    { id: '9.webp', label: 'El Mosquito', nivel: 0 },
    { id: '12.webp', label: 'El Halcón', nivel: 0 },
    { id: '13.webp', label: 'El Timón', nivel: 0 },
    { id: '55.webp', label: 'Yerry', nivel: 0 },
    { id: '61.webp', label: 'El Pitbull', nivel: 0 },

    // ⚡ NIVELES 1 A 10 (SCALONETA & FIGURAS)
    { id: '16.webp', label: 'El Mariscal', nivel: 1 },
    { id: '17.webp', label: 'El Heredero', nivel: 2 },
    { id: '18.webp', label: 'El Motorcito', nivel: 3 },
    { id: '19.webp', label: 'La Araña', nivel: 4 },
    { id: '20.webp', label: 'El Toro', nivel: 5 },
    { id: '21.webp', label: 'El Muro', nivel: 6 },
    { id: '22.webp', label: 'El Carnicero', nivel: 7 },
    { id: '23.webp', label: 'El Colorado', nivel: 8 },
    { id: '24.webp', label: 'El Guardián', nivel: 9 },
    { id: '51.webp', label: 'El Guajiro', nivel: 10 },

    // 🔥 NIVELES 11 A 20 (ELITE INTERNACIONAL)
    { id: '8.webp', label: 'La Muralla', nivel: 11 },
    { id: '10.webp', label: 'Hurricane', nivel: 12 },
    { id: '11.webp', label: 'Golden Boy', nivel: 13 },
    { id: '14.webp', label: 'Gigio', nivel: 14 },
    { id: 'Guilermo memo Ochoa.webp', label: 'Memo', nivel: 14 },
    { id: '15.webp', label: 'El Fideo', nivel: 15 },
    { id: '26.webp', label: 'El Kun', nivel: 16 },
    { id: '36.webp', label: 'El Matador', nivel: 17 },
    { id: '52.webp', label: 'El 10 Cafetero', nivel: 18 },
    { id: 'Phil Foden.webp', label: 'The Sniper', nivel: 18 },
    { id: '53.webp', label: 'El Tigre', nivel: 19 },
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
    { id: '45.webp', label: 'El Estratega', nivel: 28 },
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

const FORMACIONES_TACTICAS = {
    '4-3-3': {
        nombre: '4-3-3',
        posiciones: [
            { pos: 'DC', top: '14%', left: '50%' },
            { pos: 'EI', top: '22%', left: '18%' },
            { pos: 'ED', top: '22%', left: '82%' },
            { pos: 'MC', top: '48%', left: '30%' },
            { pos: 'MCD', top: '58%', left: '50%' },
            { pos: 'MC', top: '48%', left: '70%' },
            { pos: 'LI', top: '76%', left: '18%' },
            { pos: 'DFC', top: '78%', left: '38%' },
            { pos: 'DFC', top: '78%', left: '62%' },
            { pos: 'LD', top: '76%', left: '82%' },
            { pos: 'POR', top: '92%', left: '50%' }
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
            { pos: 'LI', top: '76%', left: '18%' },
            { pos: 'DFC', top: '78%', left: '38%' },
            { pos: 'DFC', top: '78%', left: '62%' },
            { pos: 'LD', top: '76%', left: '82%' },
            { pos: 'POR', top: '92%', left: '50%' }
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
            { pos: 'LI', top: '76%', left: '18%' },
            { pos: 'DFC', top: '78%', left: '38%' },
            { pos: 'DFC', top: '78%', left: '62%' },
            { pos: 'LD', top: '76%', left: '82%' },
            { pos: 'POR', top: '92%', left: '50%' }
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
            { pos: 'LI', top: '76%', left: '18%' },
            { pos: 'DFC', top: '78%', left: '38%' },
            { pos: 'DFC', top: '78%', left: '62%' },
            { pos: 'LD', top: '76%', left: '82%' },
            { pos: 'POR', top: '92%', left: '50%' }
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
            { pos: 'DFC', top: '78%', left: '26%' },
            { pos: 'DFC', top: '80%', left: '50%' },
            { pos: 'DFC', top: '78%', left: '74%' },
            { pos: 'POR', top: '92%', left: '50%' }
        ]
    }
};

let formacionTacticaActual = '4-3-3';
let nodoPosicionSeleccionadoIdx = null;

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

function abrirModalPerfil(){
const u=obtenerUsuarioLogueado();
const esGoogle = u && u.loginMethod === 'google';
const nombreDefault = u ? u.name.split(' ')[0] : 'Invitado';
const nivelIdx=calcularNivelIdx(userStats.xpTotal),nivel=NIVELES[nivelIdx],nivelSig=NIVELES[Math.min(nivelIdx+1,NIVELES.length-1)];

// 📊 Cálculo dinámico de estatus según el nivel del jugador
let textoRankingTop = "⚽ COMUNIDAD";
if (nivelIdx >= 50) {
    textoRankingTop = "TOP 0.1% COMUNIDAD";
} else if (nivelIdx >= 35) {
    textoRankingTop = "TOP 1% COMUNIDAD";
} else if (nivelIdx >= 25) {
    textoRankingTop = "TOP 5% COMUNIDAD";
} else if (nivelIdx >= 15) {
    textoRankingTop = "TOP 10% COMUNIDAD";
} else if (nivelIdx >= 5) {
    textoRankingTop = "TOP 25% COMUNIDAD";
} else {
    textoRankingTop = "🌱 PROMESA";
}
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
    ? `<div class="profile-login-wrapper">
        <button onclick="cerrarSesion()" class="btn-3d secondary profile-login-btn logout">
            <i class="ph-bold ph-sign-out"></i> Cerrar sesión
        </button>
       </div>`
    : `<div class="profile-login-wrapper">
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

let calHTML='';
for(let i = 0; i < startOffset; i++) { calHTML += `<div class="calendar-cell" style="visibility:hidden; border:none;"></div>`; }

for(let d=1;d<=daysInMonth;d++){
    const cellDate = new Date(currentYear, currentMonth, d);
    cellDate.setHours(0,0,0,0);
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0,0,0,0);

    const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    let cl='calendar-cell';

    if (cellDate > todayNormalized) {
        cl += ' future-day';
    } else if (activeStreakDates.has(dateStr)) {
        cl += ' streak-active';
    } else if (userStats.activeDates && userStats.activeDates.includes(dateStr)) {
        cl += ' past-done';
    } else {
        cl += ' past-missed';
    }

    calHTML+=`<div class="${cl}">${d}</div>`;
}

const logros=calcularLogros(),totalLogros=logros.length,desbloqueados=logros.filter(l=>l.unlocked).length;

document.getElementById('profile-modal-body').innerHTML=`
    <div class="split-profile-layout">
        
        <div class="left-fut-column">
            <div class="fut-card ${activeCardClass}" id="fut-card-main">
                        <div class="fut-card-shine"></div>
                        <div class="fut-top">
                            <div class="fut-badge-meta">
                                <div class="fut-ovr" title="Overall: sube con tu XP">${nivel.ovr}</div>
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

            <div class="profile-card-actions-row">
                <button class="btn-3d secondary" id="btn-toggle-custom" onclick="toggleCustomization()"><img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> PERSONALIZÁ TU CARTA ▼</button>
                <div class="share-btn-wrapper">
                    <button class="btn-3d secondary" id="btn-share-card" onclick="compartirCartaFUT()"><i class="ph-bold ph-share-network"></i></button>
                    <div class="share-tooltip">Compartí tu carta</div>
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
                <div class="geoguessr-dash-box xp-profile-section" style="display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; overflow:hidden; padding: 20px 14px; background: radial-gradient(circle at center 35%, rgba(250, 204, 21, 0.12) 0%, transparent 65%), var(--bg-color);">
                    <div style="position:absolute; top:-50px; right:-50px; width:180px; height:180px; background:var(--accent-color); filter:blur(90px); opacity:0.15; border-radius:50%; pointer-events:none;"></div>
                    
                    <div class="profile-level-icon-wrapper" style="margin-bottom:6px; display:flex; align-items:center; justify-content:center;">
    <img src="${nivel.iconUrl}" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 0 18px rgba(250, 204, 21, 0.65));">
</div>
                    
                    <h3 style="font-size:1.4rem; font-weight:900; color:var(--text-main); margin-bottom:4px; text-transform:uppercase; letter-spacing:-0.5px; text-align:center;">${nombreRangoPuro}</h3>
                    
                    <div class="level-badge-inline ${nivel.cssClass}" style="font-size:0.75rem; padding:4px 12px; margin-bottom: 6px;">Nivel ${nivelIdx}</div>
    
                    <span class="badge-ranking" style="margin-bottom: 12px;">${textoRankingTop}</span>
                    
                    <div style="width:100%; max-width: 92%; z-index:1;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.72rem; font-weight:800; align-items:center;">
                            <span style="color:var(--text-muted);">${xpEnNivel.toLocaleString('es-AR')} / ${xpNivelTotal.toLocaleString('es-AR')} XP</span>
                            <span style="color:var(--accent-color); font-weight:900; font-size:0.8rem;">${xpPct}%</span>
                        </div>
                        <div class="xp-bar-big" style="height:10px; background:var(--border-subtle); border:1px solid var(--border-strong); border-radius:20px; overflow:hidden; margin-bottom:8px;">
                            <div class="xp-bar-big-fill" style="width:${xpPct}%; box-shadow:0 0 15px var(--accent-glow);"></div>
                        </div>
                        <div style="text-align:center; font-size:0.68rem; color:var(--text-muted); font-weight:700;">
                            ${nivelSig.min === Infinity
                                ? '🏆 ¡Alcanzaste el nivel máximo!'
                                : `Faltan <b style="color:var(--text-main);">${xpFaltante.toLocaleString('es-AR')} XP</b> para el Nivel ${nivelIdx + 1} 🚀`}
                        </div>
                    </div>
                </div>
                
                <div class="geoguessr-dash-box">
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

            <!-- 🏆 PALMARÉS Y VITRINA DE COPAS EN PERFIL -->
            <div class="geoguessr-dash-box palmares-profile-box">
                <div class="dash-header-inline">
                    <div class="dash-title-premium">
                        <i class="ph-duotone ph-trophy" style="font-size:1.3rem; color:#fde047;"></i> Palmarés del Club
                    </div>
                    <span class="palmares-counter-badge">
                        ${(userStats.copasGanadas || []).length} ${(userStats.copasGanadas || []).length === 1 ? 'Título' : 'Títulos'}
                    </span>
                </div>
                <div class="palmares-cups-row">
                    <div class="palmares-cup-item ${(userStats.copasGanadas || []).some(c => c.tier === 'nacional') ? 'unlocked' : 'locked'}">
                        <img src="medalla-bronce.webp" alt="Copa Desafío" class="palmares-cup-img">
                        <strong>Copa Desafío</strong>
                        <span>${(userStats.copasGanadas || []).some(c => c.tier === 'nacional') ? '🏆 Campeón' : '🔒 Sin ganar'}</span>
                    </div>
                    <div class="palmares-cup-item ${(userStats.copasGanadas || []).some(c => c.tier === 'continental') ? 'unlocked' : 'locked'}">
                        <img src="medalla-plata.webp" alt="Copa Continental" class="palmares-cup-img">
                        <strong>Continental</strong>
                        <span>${(userStats.copasGanadas || []).some(c => c.tier === 'continental') ? '🏆 Campeón' : '🔒 Sin ganar'}</span>
                    </div>
                    <div class="palmares-cup-item ${(userStats.copasGanadas || []).some(c => c.tier === 'mundial_clubes') ? 'unlocked' : 'locked'}">
                        <img src="medalla-oro.webp" alt="Mundial de Clubes" class="palmares-cup-img">
                        <strong>Mundial Clubes</strong>
                        <span>${(userStats.copasGanadas || []).some(c => c.tier === 'mundial_clubes') ? '🏆 Campeón' : '🔒 Sin ganar'}</span>
                    </div>
                    <div class="palmares-cup-item ${(userStats.copasGanadas || []).some(c => c.tier === 'mundial') ? 'unlocked' : 'locked'}">
                        <img src="estrella.webp" alt="Copa del Mundo" class="palmares-cup-img">
                        <strong>Copa del Mundo</strong>
                        <span>${(userStats.copasGanadas || []).some(c => c.tier === 'mundial') ? '👑 Campeón' : '🔒 Sin ganar'}</span>
                    </div>
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
},50);
}

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
logros.push({id:'entrenador_estrella',icon:'<img src="estrella.webp" class="logro-img-icon" alt="Estrella">',name:'DT Galáctico',rarity:'rare',req:'Entrená a un futbolista a 80+ OVR',unlocked:maxOvrIndividual>=80,pct:maxOvrIndividual>=80?100:Math.min(100, Math.round((maxOvrIndividual/80)*100)),pctLabel:`${maxOvrIndividual}/80 OVR`});

logros.push({id:'localista',icon:'<img src="gps-humano.webp" class="logro-img-icon" alt="GPS Humano">',name:'GPS Humano',rarity:'rare',req:'Adiviná a menos de 5 km',unlocked:s.medallaLocalista,pct:s.medallaLocalista?100:0,pctLabel:''});
logros.push({id:'unKm',icon:'<img src="ojo-de-aguila.webp" class="logro-img-icon" alt="Ojo de Águila">',name:'Ojo de Águila',rarity:'epic',req:'Adiviná a menos de 1 km',unlocked:s.guessrUnKm,pct:s.guessrUnKm?100:0,pctLabel:''});
logros.push({id:'perfecto',icon:'<img src="perfeccionista.webp" class="logro-img-icon" alt="Perfeccionista">',name:'Perfeccionista',rarity:'epic',req:'Todo Guessr >4000 pts',unlocked:s.guessrPerfecto,pct:s.guessrPerfecto?100:0,pctLabel:''});
logros.push({id:'ordenPerfecto',icon:'<img src="estratega.webp" class="logro-img-icon" alt="Estratega">',name:'Estratega',rarity:'epic',req:'Orden perfecto sin errores',unlocked:s.ordenSinFallar,pct:s.ordenSinFallar?100:0,pctLabel:''});
    return logros;
}
// Función para rescatar al jugador si el oponente se desconecta o abandona (Adjudica Victoria)
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
let timerAbandono = null;

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

    // Efecto de sacudida de pantalla (Screen Shake) si le erró por mucho
    if (distancia >= 600 && card) {
        card.classList.add('animate-wrong');
        setTimeout(() => {
            card.classList.remove('animate-wrong');
        }, 400);
    }
}
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

    // 🎨 Configuración dinámica de ícono, resplandor y colores según la pestaña activa
    const headerConfig = esPuntaje ? {
        img: 'liga-icon-puntaje.webp',
        alt: 'Puntaje Máximo',
        glowClass: 'glow-green',
        badgeImg: 'liga-icon-puntaje.webp',
        badgeTitle: nombreVisualLiga.replace(/_/g, ' '),
        badgeSub: 'Puntaje Máximo',
        badgeColor: '#00ff77'
    } : {
        img: 'liga-icon-historial.webp',
        alt: 'Historial W/L',
        glowClass: 'glow-blue',
        badgeImg: 'liga-icon-historial.webp',
        badgeTitle: nombreVisualLiga.replace(/_/g, ' '),
        badgeSub: 'Historial W/L',
        badgeColor: '#2979ff'
    };

    // 📊 Cálculo en vivo de las métricas de la liga
    const miFila = (lista || []).find(f => (f.nombre || '').trim().toLowerCase() === (miNombreRanking || '').toLowerCase());
    const miPuntajeLiga = miFila ? (miFila.puntaje || 0) : 0;
    const miWLLiga = miFila ? `${miFila.triunfos || 0}W - ${miFila.derrotas || 0}L` : '0W - 0L';
    const totalMiembros = (lista || []).length;
    const conectadosAhora = (usuariosOnlineLiga || []).length;

    const subMenuHTML = `
    <div class="liga-tabs-row ranking-tabs-row">
        <button class="liga-tab-btn ${esPuntaje ? 'active' : ''}" onclick="cambiarVistaLiga('puntaje')">
            <img src="liga-icon-puntaje.webp" alt="Puntaje" class="ranking-tab-img"> <span>Puntaje máx.</span>
        </button>
        <button class="liga-tab-btn ${!esPuntaje ? 'active' : ''}" onclick="cambiarVistaLiga('triunfos')">
            <img src="liga-icon-historial.webp" alt="Historial" class="ranking-tab-img"> <span>Historial W/L</span>
        </button>
    </div>`;

    let htmlContenido = `<div class="liga-table-card"><div class="ranking-rows-scroll">`;

    if (!lista || lista.length === 0) {
        htmlContenido += `
        <div style="text-align:center; padding:36px 20px; color:var(--text-muted); font-size:.85rem; line-height:1.5;">
            ${tipoVista === 'triunfos'
                ? 'Todavía nadie disputó duelos ⚔️ en esta liga. ¡Desafiá a alguien que esté online!'
                : 'Todavía nadie registró partidas en esta liga.'}
        </div>`;
    } else {
        lista.forEach((f, i) => {
            const medallas3D = [
                '<img src="medalla-oro.webp" alt="1º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">',
                '<img src="medalla-plata.webp" alt="2º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">',
                '<img src="medalla-bronce.webp" alt="3º" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;">'
            ];
            const med = i < 3 ? medallas3D[i] : `<span style="color:var(--text-muted); font-weight:700; width:24px; display:inline-block; text-align:center;">${i + 1}</span>`;
            const nombreRival = (f.nombre || 'Anónimo').trim();

            const estaOnline = usuariosOnlineLiga.includes(nombreRival);
            const esPropio = nombreRival.toLowerCase() === (miNombreRanking || '').toLowerCase();

            let indicadorOnline = "";
            let botonReto = "";

            if (estaOnline) {
                indicadorOnline = `<span style="background:#00e676; width:8px; height:8px; border-radius:50%; display:inline-block; margin-left:8px; box-shadow:0 0 8px #00e676; animation: pulseGlow 2s infinite;" title="Mirando la liga ahora"></span>`;
                if (!esPropio) {
                    botonReto = `<img src="liga-icon-historial.webp" alt="Desafiar" onclick="desafiarAmigoDirecto('${nombreRival.replace(/'/g, "\\'")}')" style="cursor:pointer; width:28px; height:28px; object-fit:contain; margin-left:8px; transition:transform 0.15s; vertical-align:middle; filter: drop-shadow(0 0 6px rgba(0, 255, 119, 0.5));" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" title="Retar a duelo en vivo">`;
                }
            }

            let bloquePuntos = "";
            if (tipoVista === 'triunfos') {
                const w = f.triunfos || 0;
                const l = f.derrotas || 0;
                bloquePuntos = `<div style="display:flex; align-items:center; gap:6px;">
                                    <strong style="color:#00e676; font-weight:900;">${w} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">W</span></strong>
                                    <span style="color:var(--text-muted); font-size:0.8rem;">-</span>
                                    <strong style="color:#ff4757; font-weight:900;">${l} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">L</span></strong>
                                </div>`;
            } else {
                bloquePuntos = `<span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">${(f.puntaje || 0).toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span></span>`;
            }

            htmlContenido += `
            <div class="liga-row-item ${esPropio ? 'es-propio' : ''}">
                <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${nombreRival.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(nombreRival)}">
                    ${med} ${obtenerAvatarCirculoHTML(nombreRival)} ${sanitizarHTML(nombreRival)} ${indicadorOnline}
                </span>
                <span style="display:flex; align-items:center; gap:12px;">
                    ${bloquePuntos}
                    ${botonReto}
                </span>
            </div>`;
        });
    }

    htmlContenido += `</div>`;

    // 📌 FILA ANCLADA (STICKY) EN LIGA SI ESTÁS FUERA DEL TOP 50
    const miPuestoLigaIdx = (lista || []).findIndex(f => (f.nombre || '').trim().toLowerCase() === (miNombreRanking || '').toLowerCase());
    if (miPuestoLigaIdx >= 50 && miFila) {
        let bloquePuntosSticky = "";
        if (tipoVista === 'triunfos') {
            bloquePuntosSticky = `<div style="display:flex; align-items:center; gap:6px;">
                                    <strong style="color:#00e676; font-weight:900;">${miFila.triunfos || 0} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">W</span></strong>
                                    <span style="color:var(--text-muted); font-size:0.8rem;">-</span>
                                    <strong style="color:#ff4757; font-weight:900;">${miFila.derrotas || 0} <span style="font-size:.75rem; color:var(--text-muted); font-weight:700;">L</span></strong>
                                  </div>`;
        } else {
            bloquePuntosSticky = `<span style="color:var(--accent-color); font-weight:900; font-size:1.05rem;">${(miFila.puntaje || 0).toLocaleString('es-AR')} <span style="font-size:.78rem; color:var(--text-muted); font-weight:700;">pts</span></span>`;
        }

        htmlContenido += `
        <div class="liga-row-item sticky-user-row es-propio">
            <span class="inspect-clickable-user" onclick="inspeccionarPerfilRival('${miNombreRanking.replace(/'/g, "\\'")}')" title="Tu posición">
                <span class="sticky-rank-pill">#${miPuestoLigaIdx + 1}</span> ${obtenerAvatarCirculoHTML(miNombreRanking)} <b>${sanitizarHTML(miNombreRanking)} (Vos)</b>
            </span>
            <span>${bloquePuntosSticky}</span>
        </div>`;
    }

    htmlContenido += `</div>`;

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
                    <i class="ph-bold ${esPuntaje ? 'ph-trophy' : 'ph-sword'}" style="color: ${headerConfig.badgeColor};"></i>
                    <div class="stat-pill-info">
                        <span>${esPuntaje ? 'TU PUNTAJE' : 'TUS DUELOS'}</span>
                        <strong>${esPuntaje ? (miPuntajeLiga > 0 ? miPuntajeLiga.toLocaleString('es-AR') + ' pts' : '0 pts') : miWLLiga}</strong>
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

                <!-- 🔍 BUSCADOR EN VIVO DE INTEGRANTES -->
                <div class="ranking-search-box">
                    <i class="ph-bold ph-magnifying-glass"></i>
                    <input type="text" class="ranking-search-input" placeholder="Buscar en la liga..." oninput="filtrarJugadoresRanking(this.value)">
                </div>
            </div>
            ${htmlContenido}
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px; margin-bottom: 6px;">
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
        // Traemos las victorias (W) y las derrotas (L) de esta liga al mismo tiempo
        const [{ data: dataV, error: errV }, { data: dataD, error: errD }] = await Promise.all([
            supabaseClient.from('victorias_versus').select('nombre').eq('liga', nombreLigaActivaCache),
            supabaseClient.from('derrotas_versus').select('nombre').eq('liga', nombreLigaActivaCache)
        ]);

        if (errV) throw errV;
        if (errD) throw errD;

        const statsLiga = {};
        
        // Contamos las W (Victorias)
        (dataV || []).forEach(row => {
            const n = (row.nombre || 'Anónimo').trim();
            if (!statsLiga[n]) statsLiga[n] = { nombre: n, triunfos: 0, derrotas: 0 };
            statsLiga[n].triunfos++;
        });

        // Contamos las L (Derrotas)
        (dataD || []).forEach(row => {
            const n = (row.nombre || 'Anónimo').trim();
            if (!statsLiga[n]) statsLiga[n] = { nombre: n, triunfos: 0, derrotas: 0 };
            statsLiga[n].derrotas++;
        });

        cacheTriunfosLiga = Object.values(statsLiga)
            .sort((a, b) => b.triunfos - a.triunfos) // El que tiene más victorias va primero
            .slice(0, 50);

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
    miNombreRankingLiga = obtenerNombreDisplay().trim();

    if (body) {
        body.innerHTML = `<div style="text-align:center; padding:50px 0;"><i class="ph-bold ph-circle-notch animate-spin" style="font-size:2rem; color:var(--accent-color);"></i></div>`;
    }

    try {
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
            const listaActual = vistaLigaActual === 'triunfos' ? (cacheTriunfosLiga || []) : cacheTop15Ligas;
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
// 📱 Función para abrir/cerrar la Vitrina de Logros en celulares
function toggleLogrosMobile() {
    const wrapper = document.getElementById('logros-content-wrapper');
    const chev = document.getElementById('logros-chevron');
    if (wrapper) {
        const isOpen = wrapper.classList.toggle('open');
        if (chev) chev.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}
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

async function compartirCartaFUT() {
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
window.toggleGuessrHintBalloon = function(event) {
    if (event) event.stopPropagation();
    const balloon = document.getElementById('guessr-hint-balloon');
    if (balloon) balloon.classList.toggle('active');
};

// ========================================================
// ⚽ MOTOR DE "TU ONCE INICIAL" (DT, CAPITÁN, ESCUDO & DRAG)
// ========================================================
let formacionOnceActual = '4-3-3';
let slotActivoOnce = null;
let dragSourceSlotOnce = null;
let touchOriginIdxOnce = null;
let touchCloneElOnce = null;
let touchMovedOnce = false;
let touchStartXOnce = 0;
let touchStartYOnce = 0;

function obtenerOnceInicial() {
    if (!userStats.onceInicial || typeof userStats.onceInicial !== 'object') {
        const guardado = localStorage.getItem('ev_once_inicial_' + getUserId());
        try {
            userStats.onceInicial = guardado ? JSON.parse(guardado) : {};
        } catch(e) {
            userStats.onceInicial = {};
        }
    }
    return userStats.onceInicial;
}

function obtenerCapitanOnce() {
    return userStats.onceCapitan || localStorage.getItem('ev_once_capitan_' + getUserId()) || null;
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
    return Math.min(99, ovrFinal);
}

window.mejorarJugadorOnce = function(avatarId, event) {
    if (event) event.stopPropagation();
    const spDisponibles = userStats.puntosHabilidad || 0;
    const costoSP = 2;
    if (spDisponibles < costoSP) {
        showToast(`Necesitás ${costoSP} SP para mejorar a este futbolista. ¡Jugá StadiumGuessr para ganar más! ⚽`, "ph-warning-circle", "warning");
        return;
    }
    const aLimpio = avatarId.replace(/\.png$/i, '.webp');
    const ovrActual = obtenerOvrJugador(aLimpio);
    if (ovrActual >= 99) {
        showToast("¡Este futbolista ya alcanzó el tope de 99 OVR! 👑", "ph-crown", "info");
        return;
    }
    userStats.puntosHabilidad = spDisponibles - costoSP;
    if (!userStats.mejorasJugadores) userStats.mejorasJugadores = {};
    userStats.mejorasJugadores[aLimpio] = (userStats.mejorasJugadores[aLimpio] || 0) + 1;
    guardarStats();
    renderizarOnceInicial();
    showToast(`¡${obtenerNombreAvatar(aLimpio)} subió a ${ovrActual + 1} OVR! 🔥`, "ph-lightning", "success");
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

    if (count < 11) {
        const faltan = 11 - count;
        showToast(`Completá los 11 titulares para clasificar a la Copa (te ${faltan === 1 ? 'falta 1 jugador' : `faltan ${faltan} jugadores`}) 🔒`, "ph-lock-key", "warning");
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
let torneoEstado = null;
let simIntervalo = null;

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
        premioSP: 10,
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
        premioSP: 25,
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
        premioSP: 45,
        clubesIds: [
            'esp_realmadrid', 'eng_mancity', 'eng_liverpool', 'ger_bayern', 'esp_barcelona',
            'eng_arsenal', 'ita_inter', 'fra_psg', 'esp_atletico', 'ita_juventus',
            'ita_milan', 'eng_chelsea', 'eng_manunited', 'ger_dortmund'
        ]
    },
    'mundial': {
        nombre: 'Copa del Mundo',
        premioSP: 75,
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

let simPreviaTimer = null;
let simHalftimeTimer = null;
let simJugadaTimer = null;
let simRafId = null;
let simVelocidadMult = 1;

// ⚡ BOTÓN 2X: Acelera todo el reloj, física y movimientos al doble
window.toggleVelocidadSimulacion = function() {
    simVelocidadMult = (simVelocidadMult === 1) ? 2 : 1;
    const btnSpeed = document.getElementById('sim-btn-speed');
    const txt = document.getElementById('sim-speed-text');
    if (btnSpeed) {
        if (simVelocidadMult === 2) {
            btnSpeed.classList.add('active-2x');
            if (txt) txt.textContent = '2x Activo';
            showToast("Velocidad 2x activada ⚡", "ph-fast-forward", "info");
        } else {
            btnSpeed.classList.remove('active-2x');
            if (txt) txt.textContent = '2x';
            showToast("Velocidad normal (1x)", "ph-play", "info");
        }
    }
};

// ⚡ BOTÓN SALTAR: Fallback por si lo presionan antes de arrancar la previa
window.saltarSimulacionCompleta = function() {
    if (!torneoEstado) return;
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
        btnSpeed.classList.remove('active-2x');
        const txt = document.getElementById('sim-speed-text');
        if (txt) txt.textContent = '2x';
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

    // Mostramos la barra de controles rápidos (2x y Simular Todo)
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

    fActual.posiciones.forEach((item, idx) => {
        const idAvatar = once[idx];
        if (!idAvatar) return;
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
        const placeholder = timeline.querySelector('.sim-event-placeholder');
        if (placeholder) placeholder.remove();
        const row = document.createElement('div');
        row.className = `sim-event-row ${tipo}`;
        row.innerHTML = `<span class="sim-ev-min">${minTxt()}'</span> <span class="sim-ev-text">${texto}</span>`;
        timeline.appendChild(row);
        // Mantiene solo los últimos 2 relatos en vivo: los que pasaron se van y no hay scrollbar
        while (timeline.children.length > 2) {
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

// 🏆 SISTEMA MULTICAPA DE CELEBRACIÓN DE CAMPEÓN (60/120 FPS)
function dispararFestejoCampeon(targetModal = null) {
    // 1. Rayos volumétricos y destellos gaming
    if (typeof dispararEfectoLucesGaming === 'function') {
        dispararEfectoLucesGaming();
    }

    // 2. Oleadas continuas de confeti tridimensional de campeón
    const contenedor = targetModal || document.body;
    const coloresCampeon = ['#ffd700', '#ffea00', '#ffffff', '#00ff77', '#69ff9c', '#f59e0b'];

    const lanzarOleada = (cantidad) => {
        for (let i = 0; i < cantidad; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            const color = coloresCampeon[Math.floor(Math.random() * coloresCampeon.length)];
            const esTiraLarga = Math.random() > 0.6;
            const w = esTiraLarga ? (6 + Math.random() * 4) : (8 + Math.random() * 6);
            const h = esTiraLarga ? (16 + Math.random() * 12) : (8 + Math.random() * 6);

            p.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 15}%;
                width: ${w}px;
                height: ${h}px;
                background: ${color};
                box-shadow: 0 0 6px ${color};
                animation-delay: ${Math.random() * 0.35}s;
                animation-duration: ${1.3 + Math.random() * 1.2}s;
                transform: rotate(${Math.random() * 360}deg);
                pointer-events: none;
                z-index: 99999;
            `;
            contenedor.appendChild(p);
            setTimeout(() => p.remove(), 2600);
        }
    };

    // 3 ráfagas escalonadas para llenar el aire sin saturar memoria
    lanzarOleada(40);
    setTimeout(() => lanzarOleada(35), 350);
    setTimeout(() => lanzarOleada(30), 750);
}
function finalizarPartidoCopa(golesUser, golesRival) {
    const timeline = document.getElementById('sim-events-timeline');
    const btn = document.getElementById('sim-btn-play');
    torneoEstado.partidoEnCurso = false;

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
                    cerrarModalSimuladorPartido();
                    showToast(`¡Campeón de la ${torneoEstado.config.nombre}! Sumaste +${premio} SP 🏆👑`, 'ph-trophy', 'success');
                    dispararFestejoCampeon(document.getElementById('torneo-copas-modal') || document.body);
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
    const once = obtenerOnceInicial();
    const avatar = once[idx];
    if (!avatar) return;

    const actual = obtenerCapitanOnce();
    if (actual === avatar) {
        userStats.onceCapitan = null;
        localStorage.removeItem('ev_once_capitan_' + getUserId());
        showToast("Capitán desmarcado.", "ph-crown", "info");
    } else {
        userStats.onceCapitan = avatar;
        localStorage.setItem('ev_once_capitan_' + getUserId(), avatar);
        showToast(`¡${obtenerNombreAvatar(avatar)} es el capitán del equipo! 👑`, "ph-crown", "success");
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
    const nivelReq = obtenerNivelAvatar(avatarId);
    const nivelUser = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (nivelUser < nivelReq) {
        showToast(`¡Este futbolista se desbloquea en el Nivel ${nivelReq}! 🔒`, "ph-lock-key", "warning");
        return;
    }

    const once = obtenerOnceInicial();
    const avatarLimpio = avatarId.replace(/\.png$/i, '.webp');

    for (let k in once) {
        if (once[k] === avatarLimpio) delete once[k];
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

    for (let i = 0; i < f.posiciones.length; i++) {
        if (!once[i]) {
            const libre = desbloqueados.find(a => !asignados.has(a.id));
            if (libre) {
                once[i] = libre.id;
                asignados.add(libre.id);
                agregados++;
            }
        }
    }

    if (!once['DT']) {
        const dtLibre = desbloqueados.find(a => !asignados.has(a.id));
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
    const once = obtenerOnceInicial();
    const p1 = once[idx1];
    const p2 = once[idx2];

    if (p2) {
        once[idx1] = p2;
    } else {
        delete once[idx1];
    }
    once[idx2] = p1;

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
    e.dataTransfer.setData("text/plain", idx);
    e.dataTransfer.effectAllowed = "move";
    const node = document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (node) node.classList.add('is-dragging');
};

window.permitirArrastreSobreOnce = function(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const targetNode = document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (targetNode && dragSourceSlotOnce !== idx) {
        targetNode.classList.add('is-drag-over');
    }
};

window.salirArrastreSobreOnce = function(e, idx) {
    const targetNode = document.querySelector(`.once-slot-node[data-slot-idx="${idx}"]`);
    if (targetNode) targetNode.classList.remove('is-drag-over');
};

window.finalizarArrastreOnce = function(e) {
    document.querySelectorAll('.once-slot-node').forEach(n => {
        n.classList.remove('is-dragging', 'is-drag-over');
    });
    dragSourceSlotOnce = null;
};

window.soltarJugadorEnOnce = function(e, targetIdx) {
    e.preventDefault();
    const sourceIdx = dragSourceSlotOnce !== null ? dragSourceSlotOnce : parseInt(e.dataTransfer.getData("text/plain"));
    document.querySelectorAll('.once-slot-node').forEach(n => {
        n.classList.remove('is-dragging', 'is-drag-over');
    });
    dragSourceSlotOnce = null;

    if (isNaN(sourceIdx) || sourceIdx === targetIdx) return;
    intercambiarPosicionesOnce(sourceIdx, targetIdx);
};

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

    // 2. Contador de titulares, OVR promedio y Saldo SP
    const ocupadosCount = Object.keys(once).filter(k => k !== 'DT' && parseInt(k) < f.posiciones.length && once[k]).length;
    const ovrEquipo = calcularOvrEquipoOnce();
    const spDisponibles = userStats.puntosHabilidad || 0;
    if (statsPill) {
        statsPill.innerHTML = `Titulares: <b style="color:var(--accent-color);">${ocupadosCount}/11</b> · OVR Equipo: <b style="color:#38bdf8;">${ovrEquipo > 0 ? ovrEquipo : '--'}</b> · Habilidad: <b style="color:#00ff77; text-shadow:0 0 8px rgba(0,255,119,0.4);">${spDisponibles} SP</b>`;
    }

    // 🔒 Dinámica del botón Torneo / Candado
    const btnTorneo = document.getElementById('btn-torneo-once-trigger');
    const lblTorneo = document.getElementById('lbl-torneo-btn');
    const icoTorneo = document.getElementById('ico-torneo-btn');
    if (btnTorneo && lblTorneo && icoTorneo) {
        if (ocupadosCount >= 11) {
            btnTorneo.className = 'btn-3d once-quick-btn btn-torneo-ready animate-pulse';
            icoTorneo.className = 'ph-bold ph-trophy';
            lblTorneo.textContent = '¡Jugar Copa!';
            btnTorneo.title = 'Tu equipo está clasificado para competir';
        } else {
            btnTorneo.className = 'btn-3d once-quick-btn btn-torneo-locked';
            icoTorneo.className = 'ph-bold ph-lock-key';
            lblTorneo.textContent = `Copa (${ocupadosCount}/11)`;
            btnTorneo.title = `Faltan ${11 - ocupadosCount} titulares para desbloquear el torneo`;
        }
    }

    // 3. Pestañas de formación
    if (tabsContainer) {
        tabsContainer.innerHTML = Object.keys(FORMACIONES_TACTICAS).map(k => `
            <button type="button" class="pitch-form-tab ${k === formacionOnceActual ? 'active' : ''}" onclick="cambiarFormacionOnce('${k}')">${k}</button>
        `).join('');
    }

    // 4. Renderizado de los 11 titulares en la cancha con OVR integrado
    let htmlNodos = f.posiciones.map((item, idx) => {
        const avatarId = once[idx];
        const isSlotActive = slotActivoOnce === idx;
        const isCaptain = avatarId && (avatarId === capitanAvatar);
        const ovrIndividual = avatarId ? obtenerOvrJugador(avatarId) : 0;

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
                <div class="once-player-label empty">Vacante</div>
            </div>`;
        }
    }).join('');

    // 5. Corralito técnico del DT en la esquina de la cancha
    const isDtActive = slotActivoOnce === 'DT';
    const ovrDt = dtAvatar ? obtenerOvrJugador(dtAvatar) : 0;
    const htmlDtCorralito = `
        <div class="once-dt-bench ${isDtActive ? 'is-active-slot' : ''} ${dtAvatar ? 'filled' : 'empty'}" onclick="seleccionarSlotOnce('DT')" title="Elegir Director Técnico">
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

    container.innerHTML = htmlNodos + htmlDtCorralito;

    // 6. Título y Barra de Entrenamiento interactivo
    if (drawerTitle) {
        if (slotActivoOnce === 'DT' && dtAvatar) {
            const nomDt = obtenerNombreAvatar(dtAvatar);
            drawerTitle.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; flex-wrap:wrap;">
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:55%;">
                        <i class="ph-bold ph-clipboard-text" style="color:var(--accent-color);"></i> DT: <b>${nomDt}</b> (OVR ${ovrDt})
                    </span>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" class="btn-3d primary" onclick="mejorarJugadorOnce('${dtAvatar}', event)" style="padding:4px 10px; font-size:0.65rem; height:26px; min-height:26px; border-radius:8px; gap:4px; box-shadow:none;">
                            <i class="ph-bold ph-lightning"></i> Entrenar (+1 OVR · 2 SP)
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
            drawerTitle.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; flex-wrap:wrap;">
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:50%;">
                        <i class="ph-bold ph-user" style="color:var(--accent-color);"></i> <b>${nomTitular}</b> (OVR ${ovrTitular})
                    </span>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button type="button" class="btn-3d primary" onclick="mejorarJugadorOnce('${idTitular}', event)" style="padding:4px 10px; font-size:0.65rem; height:26px; min-height:26px; border-radius:8px; gap:4px; box-shadow:none;">
                            <i class="ph-bold ph-lightning"></i> Entrenar (+1 OVR · 2 SP)
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
    drawerContainer.innerHTML = AVATARES_LISTA.map(item => {
        const isLocked = miNivel < item.nivel;
        const yaEnCancha = jugadoresEnCancha.has(item.id);
        const ovrCarta = obtenerOvrJugador(item.id);

        let lockBadge = isLocked 
            ? `<div class="avatar-grid-lock-mask"><i class="ph-fill ph-lock-key"></i><span>NV. ${item.nivel}</span></div>` 
            : `<div class="once-drawer-ovr-tag">${ovrCarta}</div>`;

        return `
        <div class="avatar-grid-card ${isLocked ? 'locked' : 'unlocked'} ${yaEnCancha ? 'in-pitch' : ''}" onclick="asignarJugadorAOnce('${item.id}')">
            <div class="avatar-grid-img-wrap">
                <img src="${item.id}" alt="${item.label}" class="${isLocked ? 'avatar-locked-blur' : ''}" loading="lazy">
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

    modal.style.display = 'flex';
};

window.cerrarModalModoCarrera = function() {
    const modal = document.getElementById('carrera-modal');
    if (modal) modal.style.display = 'none';
};

window.clickJugarCopaDesdeCarrera = function() {
    const once = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const f = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual]) ? FORMACIONES_TACTICAS[formacionOnceActual] : { posiciones: Array(11).fill(0) };
    let count = 0;
    for (let i = 0; i < f.posiciones.length; i++) {
        if (once[i]) count++;
    }

    if (count < 11) {
        const faltan = 11 - count;
        showToast(`Completá los 11 titulares para clasificar a la Copa (te ${faltan === 1 ? 'falta 1 jugador' : `faltan ${faltan} jugadores`}) 🔒`, "ph-lock-key", "warning");
        return;
    }

    cerrarModalModoCarrera();
    abrirModalTorneoCopas();
};

window.clickJugarLigaDesdeCarrera = function() {
    const once = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    const f = (typeof FORMACIONES_TACTICAS !== 'undefined' && FORMACIONES_TACTICAS[formacionOnceActual]) ? FORMACIONES_TACTICAS[formacionOnceActual] : { posiciones: Array(11).fill(0) };
    let count = 0;
    for (let i = 0; i < f.posiciones.length; i++) {
        if (once[i]) count++;
    }

    if (count < 11) {
        const faltan = 11 - count;
        showToast(`Completá los 11 titulares para disputar la Liga (te ${faltan === 1 ? 'falta 1 jugador' : `faltan ${faltan} jugadores`}) 🔒`, "ph-lock-key", "warning");
        return;
    }

    cerrarModalModoCarrera();
    abrirModalTemporadaLiga();
};

window.abrirPalmaresDesdeCarrera = function() {
    window.navOrigenCarrera = true;
    cerrarModalModoCarrera();
    abrirModalPerfil();
};

// ========================================================
// 👑 RANKING DE CLUBES Y SALÓN DE CAMPEONES (MODO CARRERA)
// ========================================================
window.cerrarModalRankingCarrera = function(volverACarrera = true) {
    const modal = document.getElementById('ranking-carrera-modal');
    if (modal) modal.style.display = 'none';
    if (volverACarrera && typeof abrirModalModoCarrera === 'function') {
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

        // Procesar y contabilizar copas por DT
        const rankingCampeones = [];

        (perfilesRaw || []).forEach(p => {
            const dj = p.datos_juego || {};
            const pref = dj.preferencias || {};
            const nick = (pref.custom_nick || '').trim();
            if (!nick) return;

            const exp = p.experiencia || dj.xpTotal || 0;
            const nivelDt = calcularNivelIdx(exp);
            // 🛡️ Filtro de nivel mínimo: solo DTs con plantel completo (Nivel 6+)
            if (nivelDt < 6) return;

            const copas = dj.copasGanadas || [];
            let nac = 0, cont = 0, clubes = 0, mundial = 0;

            copas.forEach(c => {
                if (c.tier === 'nacional') nac++;
                else if (c.tier === 'continental') cont++;
                else if (c.tier === 'mundial_clubes') clubes++;
                else if (c.tier === 'mundial') mundial++;
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
                // Si aún no ordenó su formación en la pizarra, se computa con sus 11 mejores desbloqueados
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
                nac: nac,
                cont: cont,
                clubes: clubes,
                mundial: mundial,
                total: totalCopas
            });
        });

        // Asegurar que el usuario actual figure con su Once Inicial en vivo si alcanza el nivel mínimo
        const misCopas = userStats.copasGanadas || [];
        const miNombreReal = (getPref('ev_custom_nick', '') || (u ? u.name.split(' ')[0] : 'Vos')).trim();
        const miNivelActual = (userStats && userStats.nivelActual !== undefined) ? userStats.nivelActual : calcularNivelIdx(userStats.xpTotal || 0);
        const yaEstaEnLista = rankingCampeones.find(r => r.nombre.toLowerCase() === miNombre);

        if (!yaEstaEnLista && miNombreReal && miNivelActual >= 6) {
            let nac = 0, cont = 0, clubes = 0, mundial = 0;
            misCopas.forEach(c => {
                if (c.tier === 'nacional') nac++;
                else if (c.tier === 'continental') cont++;
                else if (c.tier === 'mundial_clubes') clubes++;
                else if (c.tier === 'mundial') mundial++;
            });

            let miOvrEquipo = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 0;
            if (miOvrEquipo === 0) {
                miOvrEquipo = Math.min(99, NIVELES[miNivelActual]?.ovr || 60);
            } else {
                miOvrEquipo = Math.min(99, miOvrEquipo);
            }

            rankingCampeones.push({
                nombre: miNombreReal,
                avatar: getPref('ev_avatar_hair', '1.webp'),
                escudo: userStats.onceEscudo || getPref('ev_avatar_logo', 'ev'),
                ovr: miOvrEquipo,
                nac: nac,
                cont: cont,
                clubes: clubes,
                mundial: mundial,
                total: misCopas.length
            });
        }

        // Orden de mérito: mayor total de copas; si empatan, más mundiales, luego clubes, etc.
        rankingCampeones.sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            if (b.mundial !== a.mundial) return b.mundial - a.mundial;
            if (b.clubes !== a.clubes) return b.clubes - a.clubes;
            if (b.cont !== a.cont) return b.cont - a.cont;
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

            filasHTML += `
                <div class="carrera-rank-row ${esMio ? 'es-propio' : ''}">
                    <div class="carrera-rank-pos">${rankBadge}</div>
                    
                    <div class="carrera-rank-user" onclick="inspeccionarPerfilRival('${item.nombre.replace(/'/g, "\\'")}')" title="Ver carta de ${sanitizarHTML(item.nombre)}">
                        <div class="ranking-avatar-circle">
                            <div class="ranking-avatar-inner">${generarAvatarHTML(item.avatar, true)}</div>
                        </div>
                        <div class="carrera-user-info">
                            <span class="carrera-user-name">${sanitizarHTML(item.nombre)} ${esMio ? '(Vos)' : ''}</span>
                            <span class="carrera-user-meta">OVR ${item.ovr} · <img src="${obtenerUrlEscudo(item.escudo)}" class="carrera-mini-shield"></span>
                        </div>
                    </div>

                    <div class="carrera-rank-cups-breakdown">
                        <span class="cup-pill nac" title="Copa Desafío"><img src="medalla-bronce.webp"> ${item.nac}</span>
                        <span class="cup-pill cont" title="Copa Continental"><img src="medalla-plata.webp"> ${item.cont}</span>
                        <span class="cup-pill club" title="Mundial de Clubes"><img src="medalla-oro.webp"> ${item.clubes}</span>
                        <span class="cup-pill mund" title="Copa del Mundo"><img src="estrella.webp"> ${item.mundial}</span>
                    </div>

                    <div class="carrera-rank-total">
                        <span class="total-cups-badge">
                            <img src="trofeo.webp" alt="Títulos" class="carrera-mini-trofeo"> ${item.total}
                        </span>
                    </div>

                    <div class="carrera-rank-action">
                        ${esMio ? '<span class="carrera-action-self">Tu Club</span>' : `
                            <button type="button" class="btn-desafiar-row" onclick="desafiarDesdeRankingCarrera('${item.nombre.replace(/'/g, "\\'")}')" title="Desafiar a su Once">
                                <img src="liga-icon-historial.webp" alt="Desafiar" class="carrera-mini-swords">
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
                                <img src="coronaoro.webp" alt="Salón de Campeones" class="trophy-main-img">
                            </div>
                        </div>
                    </div>
                    <div class="carrera-header-right">
                        <h2 class="carrera-ranking-title">Salón de Campeones</h2>
                        <p class="carrera-ranking-sub">Los directores técnicos más laureados de la comunidad.</p>
                    </div>
                </div>

                <div class="carrera-ranking-table-header">
                    <span>#</span>
                    <span>DT / Club</span>
                    <span class="col-center">Desglose de Copas</span>
                    <span class="col-center">Títulos</span>
                    <span class="col-center">Duelo</span>
                </div>

                <div class="carrera-ranking-scroll">
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
        const faltan = 11 - countUser;
        showToast(`Completá tus 11 titulares para jugar un desafío de planteles (te ${faltan === 1 ? 'falta 1 jugador' : `faltan ${faltan} jugadores`}) 🔒`, "ph-lock-key", "warning");
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

    if (datosRival.nivelActual < 6) {
        showToast(`${nombreRival} todavía no tiene los 11 titulares desbloqueados (Requiere Nivel 6) 🔒`, "ph-lock-key", "warning");
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
        const totalFechas = (cantClubes % 2 === 0) ? (cantClubes - 1) : cantClubes;

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

    const titulares = [];
    f.posiciones.forEach((posObj, idx) => {
        const idAvatar = once[idx];
        if (idAvatar) titulares.push({ id: idAvatar, pos: posObj.pos });
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
        liga.golesOnce[goleador] = (liga.golesOnce[goleador] || 0) + 1;

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
                liga.asistenciasOnce[asistidor] = (liga.asistenciasOnce[asistidor] || 0) + 1;
            }
        }
    }
}

function obtenerLideresOnce(liga) {
    let topGol = { id: null, cant: 0 };
    let topAsist = { id: null, cant: 0 };

    if (liga.golesOnce) {
        for (const id in liga.golesOnce) {
            if (liga.golesOnce[id] > topGol.cant) {
                topGol = { id, cant: liga.golesOnce[id] };
            }
        }
    }
    if (liga.asistenciasOnce) {
        for (const id in liga.asistenciasOnce) {
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
                        <button type="button" class="lt-btn-sim-all" onclick="simularTemporadaCompleta()" title="Simular las fechas restantes automáticamente">
                            <i class="ph-bold ph-lightning"></i> Simular Todo
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
                        <i class="ph-bold ph-trophy"></i> Botín de Campeón Reclamado (+15 SP)
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
                <td style="color:${t.esUsuario ? '#00ff77' : '#ffffff'}; font-size:0.92rem;">${t.pts}</td>
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
let cofreTemporadaPendiente = null;

function calcularBotinTemporada(posicion, filaUser) {
    const esInvicto = filaUser && filaUser.pp === 0;
    const esCampeon = posicion === 1;

    let sp = 1;
    let xp = 400;
    let badge = '🛡️ PERMANENCIA ASEGURADA';
    let titulo = `#${posicion}º PUESTO`;
    let icono = '<img src="https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp" class="cofre-escudo-img" alt="Permanencia">';
    let btnText = 'RECLAMAR BOTÍN DE TEMPORADA';
    let btnIcon = 'ph-gift';

    if (esCampeon) {
        sp = 15;
        xp = 4000;
        badge = esInvicto ? '👑 CAMPEÓN INVICTO' : '👑 CAMPEÓN DE LA LIGA';
        titulo = esInvicto ? '#1 INVICTO HISTÓRICO' : '#1 CAMPEÓN';
        icono = '<img src="trofeo.webp" class="cofre-trofeo-img" alt="Campeón">';
        btnText = 'LEVANTAR COPA Y GUARDAR BOTÍN';
        btnIcon = 'ph-trophy';
    } else if (posicion === 2) {
        sp = 10;
        xp = 2500;
        badge = '🥈 SUBCAMPEÓN';
        titulo = '#2 CLASIFICADO CONTINENTAL';
        icono = '<img src="medalla-plata.webp" class="cofre-medalla-img" alt="Subcampeón">';
        btnText = 'RECLAMAR BOTÍN DE SUBCAMPEÓN';
        btnIcon = 'ph-medal';
    } else if (posicion === 3) {
        sp = 7;
        xp = 1800;
        badge = '🥉 PODIO DE LIGA';
        titulo = '#3 CLASIFICADO CONTINENTAL';
        icono = '<img src="medalla-bronce.webp" class="cofre-medalla-img" alt="Tercer Puesto">';
        btnText = 'RECLAMAR BOTÍN DE PODIO';
        btnIcon = 'ph-medal';
    } else if (posicion === 4) {
        sp = 5;
        xp = 1200;
        badge = '🌟 ZONA DE COPAS';
        titulo = '#4 CLASIFICADO A COPA';
        icono = '<img src="estrella.webp" class="cofre-estrella-img" alt="Zona de Copas">';
        btnText = 'RECLAMAR BOTÍN DE CLASIFICADO';
        btnIcon = 'ph-star';
    } else if (posicion <= 10) {
        sp = 3;
        xp = 800;
        badge = '⚽ MITAD DE TABLA';
        titulo = `#${posicion}º PUESTO`;
        icono = '<img src="https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp" class="cofre-escudo-img" alt="Mitad de Tabla">';
    }

    return { sp, xp, badge, titulo, icono, btnText, btnIcon, esCampeon, esInvicto };
}

window.mostrarCofreTemporada = function(liga) {
    if (!liga || !liga.tabla) return;
    cerrarModalTemporadaLiga(false);

    const filaUser = liga.tabla.find(t => t.esUsuario);
    const pos = liga.tabla.findIndex(t => t.esUsuario) + 1;
    const botin = calcularBotinTemporada(pos, filaUser);

    cofreTemporadaPendiente = {
        ligaKey: liga.key,
        ligaNombre: liga.nombre,
        posicion: pos,
        esCampeon: pos === 1,
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
    document.getElementById('cofre-revelado-badge').textContent = botin.badge;
    document.getElementById('cofre-revelado-puesto').textContent = botin.titulo;
    document.getElementById('cofre-botin-icon').innerHTML = botin.icono;
    document.getElementById('cofre-botin-club').textContent = filaUser ? filaUser.nombre : 'Tu Once';

    // 3. Escudo y OVR del equipo
    const escudoClub = userStats.onceEscudo || localStorage.getItem('ev_once_escudo_' + getUserId()) || getPref('ev_avatar_logo', 'ev');
    const escudoImg = document.getElementById('cofre-club-escudo');
    if (escudoImg) {
        escudoImg.src = (typeof obtenerUrlEscudo === 'function') ? obtenerUrlEscudo(escudoClub) : '';
    }
    const ovrEquipo = typeof calcularOvrEquipoOnce === 'function' ? calcularOvrEquipoOnce() : 75;
    const ovrTag = document.getElementById('cofre-club-ovr');
    if (ovrTag) ovrTag.textContent = `OVR ${ovrEquipo}`;

    // 4. Protagonistas del Once (Capitán & DT) con resolución garantizada de avatar
    const unaF = typeof obtenerOnceInicial === 'function' ? obtenerOnceInicial() : {};
    let capId = typeof obtenerCapitanOnce === 'function' ? obtenerCapitanOnce() : null;

    // Respaldo inteligente: si no se asignó la 'C', toma el avatar de su carta o el primer titular disponible
    if (!capId) {
        capId = localStorage.getItem('ev_avatar_seleccionado_' + getUserId()) 
             || getPref('ev_avatar_hair', '') 
             || unaF[0] 
             || '1.webp';
    }

    let dtId = unaF['DT'] || null;
    if (!dtId) {
        dtId = '45.webp'; // Respaldo técnico si aún no contrató DT
    }

    const capNombre = obtenerNombreAvatar(capId);
    const dtNombre = unaF['DT'] ? obtenerNombreAvatar(dtId) : 'Director Técnico';

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
        if (topGol && topGol.id && topGol.cant > 0) {
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
        } else if (topAsist && topAsist.id && topAsist.cant > 0) {
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

    // 6. Botín de Recompensa: 2 cartas grandes y prestigiosas (SP & XP)
    const lootContainer = document.getElementById('cofre-loot-row');
    if (lootContainer) {
        lootContainer.innerHTML = `
            <div class="cofre-loot-card sp">
                <div class="cofre-loot-icon-wrap"><i class="ph-bold ph-lightning"></i></div>
                <div class="cofre-loot-info">
                    <span class="loot-label">Habilidad Plantel</span>
                    <strong>+${botin.sp} SP</strong>
                </div>
            </div>
            <div class="cofre-loot-card xp">
                <div class="cofre-loot-icon-wrap"><i class="ph-bold ph-sparkle"></i></div>
                <div class="cofre-loot-info">
                    <span class="loot-label">Experiencia DT</span>
                    <strong>+${botin.xp.toLocaleString('es-AR')} XP</strong>
                </div>
            </div>
        `;
    }

    // 7. Cinta dorada de vitrina
    const ribbon = document.getElementById('cofre-vitrina-ribbon');
    if (ribbon) {
        ribbon.style.display = botin.esCampeon ? 'inline-flex' : 'none';
    }

    // 7. Botón de Reclamo
    const claimTxt = document.getElementById('btn-cofre-claim-text');
    if (claimTxt) claimTxt.textContent = botin.btnText;
    const claimBtn = document.getElementById('btn-cofre-claim-btn');
    if (claimBtn) {
        const ico = claimBtn.querySelector('i');
        if (ico) ico.className = `ph-bold ${botin.btnIcon}`;
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

    // Inscribir título en el palmarés si fue campeón
    if (cofreTemporadaPendiente.esCampeon) {
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
    }

    cofreTemporadaPendiente = null;
    abrirModalTemporadaLiga();
};