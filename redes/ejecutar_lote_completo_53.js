const fs = require('fs');
const path = require('path');

console.log('🚀 ========================================================');
console.log('🚀 MEGA RUNNER MAESTRO: PRODUCCIÓN CONTINUA 53 VIDEOS');
console.log('🚀 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🚀 ========================================================\n');

// Import engines
const { renderizarRetoDiario } = require('./render_reto_diario.js');
const { renderizarPromo } = require('./render_promo_carta_fut.js');
const { renderizarDuelo } = require('./render_duelo.js');
const { procesarEstadio } = require('./crear_pack_batch.js');
const { TRIVIAS_DATABASE } = require('./trivias_database.js');

const PROGRESS_FILE = path.join(__dirname, 'batch_53_progress.json');

// The 4 Batches
const RETOS_KEYS = ['10', '11', '12', '13', '14', '15'];
const PROMOS_KEYS = ['promo-03-premier', 'promo-04-superclasico', 'promo-05-nextgen'];
const DUELOS_KEYS = [
    'belgrano-talleres',
    'platense-tigre',
    'velez-ferro',
    'defensa-quilmes',
    'moron-almirante',
    'lafc-lagalaxy',
    'intermiami-orlando',
    'nycfc-nyredbulls',
    'metlife-azteca',
    'sofi-attdallas'
];
const TRIVIAS_IDS = [
    // MLS
    'chase_stadium_inter_miami',
    'bmo_stadium_lafc',
    'dignity_health_la_galaxy',
    'yankee_stadium_nycfc',
    'red_bull_arena_ny',
    'lumen_field_seattle',
    'q2_stadium_austin',
    'providence_park_portland',
    // Mundial 2026
    'metlife_stadium_final2026',
    'sofi_stadium_los_angeles',
    'att_stadium_dallas',
    'mercedes_benz_atlanta',
    'arrowhead_stadium_kansas',
    'lincoln_financial_filadelfia',
    'bc_place_vancouver',
    'estadio_universitario_tigres',
    // Argentina Inéditos
    'mario_alberto_kempes_talleres',
    'gigante_de_alberdi_belgrano',
    'coliseo_de_victoria_tigre',
    'ciudad_de_vicente_lopez_platense',
    'norberto_tomaghello_defensa',
    'monumental_alta_cordoba_instituto',
    'feliciano_gambarte_godoy_cruz',
    // Chile
    'estadio_nacional_de_chile',
    'claro_arena_universidad_catolica',
    'estadio_sausalito_everton',
    'estadio_santa_laura_union_espanola',
    'el_teniente_ohiggins',
    // Italia Serie A
    'artemio_franchi_fiorentina',
    'giuseppe_sinigaglia_como',
    'gewiss_stadium_atalanta',
    'renato_dallara_bologna',
    'luigi_ferraris_genoa',
    'pier_luigi_penzo_venezia'
];

function loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        } catch (_) {}
    }
    return { completed: {}, failed: {}, startTime: new Date().toISOString() };
}

function saveProgress(prog) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(prog, null, 2), 'utf8');
}

async function ejecutarMegaLote() {
    const targetArg = process.argv[2] || 'all';
    const progress = loadProgress();

    const doRetos = (targetArg === 'all' || targetArg === 'retos');
    const doPromos = (targetArg === 'all' || targetArg === 'promos');
    const doDuelos = (targetArg === 'all' || targetArg === 'duelos');
    const doTrivias = (targetArg === 'all' || targetArg === 'trivias');

    let totalVideos = 0;
    if (doRetos) totalVideos += RETOS_KEYS.length;
    if (doPromos) totalVideos += PROMOS_KEYS.length;
    if (doDuelos) totalVideos += DUELOS_KEYS.length;
    if (doTrivias) totalVideos += TRIVIAS_IDS.length;

    console.log(`📋 Total de videos a procesar en esta ejecución: ${totalVideos}`);
    console.log(`   - Retos Diarios: ${doRetos ? RETOS_KEYS.length : 0}`);
    console.log(`   - Promos Cartas FUT: ${doPromos ? PROMOS_KEYS.length : 0}`);
    console.log(`   - Duelos de Capacidad: ${doDuelos ? DUELOS_KEYS.length : 0}`);
    console.log(`   - Trivias Individuales: ${doTrivias ? TRIVIAS_IDS.length : 0}\n`);

    let currentIdx = 0;

    // ==========================================
    // FASE 1: RETOS DIARIOS OFICIALES (35s)
    // ==========================================
    if (doRetos) {
        console.log(`\n========================================================`);
        console.log(`📅 FASE 1: RENDERIZANDO ${RETOS_KEYS.length} RETOS DIARIOS (35s)`);
        console.log(`========================================================\n`);

        for (let i = 0; i < RETOS_KEYS.length; i++) {
            currentIdx++;
            const key = RETOS_KEYS[i];
            const itemKey = `reto_${key}`;
            if (progress.completed[itemKey]) {
                console.log(`⏩ [${currentIdx}/${totalVideos}] Reto Diario #${key} ya renderizado previamente. Saltando.`);
                continue;
            }
            console.log(`\n🎬 [${currentIdx}/${totalVideos}] INICIANDO RETO DIARIO #${key}...`);
            const t0 = Date.now();
            try {
                await renderizarRetoDiario(key);
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
                progress.completed[itemKey] = { status: 'OK', elapsedSeconds: elapsed, at: new Date().toISOString() };
                saveProgress(progress);
                console.log(`✅ [${currentIdx}/${totalVideos}] Reto Diario #${key} completado en ${elapsed}s.`);
            } catch (err) {
                console.error(`❌ [${currentIdx}/${totalVideos}] Error en Reto Diario #${key}:`, err.message);
                progress.failed[itemKey] = { error: err.message, at: new Date().toISOString() };
                saveProgress(progress);
            }
        }
    }

    // ==========================================
    // FASE 2: PROMOS CARTAS FUT (20s)
    // ==========================================
    if (doPromos) {
        console.log(`\n========================================================`);
        console.log(`🃏 FASE 2: RENDERIZANDO ${PROMOS_KEYS.length} PROMOS CARTAS FUT (20s)`);
        console.log(`========================================================\n`);

        for (let i = 0; i < PROMOS_KEYS.length; i++) {
            currentIdx++;
            const key = PROMOS_KEYS[i];
            const itemKey = `promo_${key}`;
            if (progress.completed[itemKey]) {
                console.log(`⏩ [${currentIdx}/${totalVideos}] Promo FUT ${key} ya renderizada previamente. Saltando.`);
                continue;
            }
            console.log(`\n🎬 [${currentIdx}/${totalVideos}] INICIANDO PROMO FUT: ${key}...`);
            const t0 = Date.now();
            try {
                await renderizarPromo(key);
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
                progress.completed[itemKey] = { status: 'OK', elapsedSeconds: elapsed, at: new Date().toISOString() };
                saveProgress(progress);
                console.log(`✅ [${currentIdx}/${totalVideos}] Promo FUT ${key} completada en ${elapsed}s.`);
            } catch (err) {
                console.error(`❌ [${currentIdx}/${totalVideos}] Error en Promo FUT ${key}:`, err.message);
                progress.failed[itemKey] = { error: err.message, at: new Date().toISOString() };
                saveProgress(progress);
            }
        }
    }

    // ==========================================
    // FASE 3: DUELOS DE CAPACIDAD (20s)
    // ==========================================
    if (doDuelos) {
        console.log(`\n========================================================`);
        console.log(`⚔️ FASE 3: RENDERIZANDO ${DUELOS_KEYS.length} DUELOS DE CAPACIDAD (20s)`);
        console.log(`========================================================\n`);

        for (let i = 0; i < DUELOS_KEYS.length; i++) {
            currentIdx++;
            const key = DUELOS_KEYS[i];
            const itemKey = `duelo_${key}`;
            if (progress.completed[itemKey]) {
                console.log(`⏩ [${currentIdx}/${totalVideos}] Duelo ${key} ya renderizado previamente. Saltando.`);
                continue;
            }
            console.log(`\n🎬 [${currentIdx}/${totalVideos}] INICIANDO DUELO: ${key}...`);
            const t0 = Date.now();
            try {
                await renderizarDuelo(key);
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
                progress.completed[itemKey] = { status: 'OK', elapsedSeconds: elapsed, at: new Date().toISOString() };
                saveProgress(progress);
                console.log(`✅ [${currentIdx}/${totalVideos}] Duelo ${key} completado en ${elapsed}s.`);
            } catch (err) {
                console.error(`❌ [${currentIdx}/${totalVideos}] Error en Duelo ${key}:`, err.message);
                progress.failed[itemKey] = { error: err.message, at: new Date().toISOString() };
                saveProgress(progress);
            }
        }
    }

    // ==========================================
    // FASE 4: TRIVIAS INDIVIDUALES (25s)
    // ==========================================
    if (doTrivias) {
        console.log(`\n========================================================`);
        console.log(`🎯 FASE 4: RENDERIZANDO ${TRIVIAS_IDS.length} TRIVIAS INDIVIDUALES (25s)`);
        console.log(`========================================================\n`);

        const triviasQueue = TRIVIAS_DATABASE.filter(t => TRIVIAS_IDS.includes(t.id));

        for (let i = 0; i < triviasQueue.length; i++) {
            currentIdx++;
            const stadium = triviasQueue[i];
            const itemKey = `trivia_${stadium.id}`;
            if (progress.completed[itemKey]) {
                console.log(`⏩ [${currentIdx}/${totalVideos}] Trivia ${stadium.nombreMostrar} ya renderizada previamente. Saltando.`);
                continue;
            }
            console.log(`\n🎬 [${currentIdx}/${totalVideos}] INICIANDO TRIVIA: ${stadium.nombreMostrar} (${stadium.clubMostrar})...`);
            const t0 = Date.now();
            try {
                await procesarEstadio(stadium, i, triviasQueue.length);
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
                progress.completed[itemKey] = { status: 'OK', elapsedSeconds: elapsed, at: new Date().toISOString() };
                saveProgress(progress);
                console.log(`✅ [${currentIdx}/${totalVideos}] Trivia ${stadium.nombreMostrar} completada en ${elapsed}s.`);
            } catch (err) {
                console.error(`❌ [${currentIdx}/${totalVideos}] Error en Trivia ${stadium.nombreMostrar}:`, err.message);
                progress.failed[itemKey] = { error: err.message, at: new Date().toISOString() };
                saveProgress(progress);
            }
        }
    }

    // Reporte final
    const completedCount = Object.keys(progress.completed).length;
    const failedCount = Object.keys(progress.failed).length;
    console.log(`\n🎉 ========================================================`);
    console.log(`🎉 MEGA LOTE FINALIZADO CON ÉXITO`);
    console.log(`🎉 Videos completados: ${completedCount}`);
    console.log(`🎉 Videos con error: ${failedCount}`);
    console.log(`🎉 ========================================================`);
}

ejecutarMegaLote().catch((err) => {
    console.error('❌ Error fatal en el Mega Runner:', err);
    process.exit(1);
});
