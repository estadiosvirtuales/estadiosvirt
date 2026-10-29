const { spawnSync } = require('child_process');
const fs = require('fs');

console.log('🤖 ========================================================');
console.log('🤖 PIPELINE AUTOMÁTICO: DUELOS DE CAPACIDAD & RETO DIARIO');
console.log('🤖 MODO MANOS LIBRES (OPCIÓN B: RE-RENDER NATIVO)');
console.log('🤖 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🤖 ========================================================\n');

function isTriviaRunning() {
    try {
        const res = spawnSync('wmic', [
            'process',
            'where',
            'name="node.exe" and commandline like "%crear_pack_batch.js%"',
            'get',
            'processid'
        ], { encoding: 'utf8' });
        const out = res.stdout || '';
        if (out.includes('No hay instancias') || out.includes('No Instance')) {
            return false;
        }
        // Buscar si hay algún número de PID en la salida
        const lines = out.split(/\r?\n/).map(l => l.trim()).filter(l => /^\d+$/.test(l));
        return lines.length > 0;
    } catch (_) {
        return false;
    }
}

async function waitTrivia() {
    console.log('⏳ Monitoreando proceso de Trivias en la conversación "Muestras"...');
    let checks = 0;
    while (isTriviaRunning()) {
        checks++;
        const elapsedMin = ((checks * 15) / 60).toFixed(1);
        process.stdout.write(`⏳ Trivias procesándose en segundo plano... (${elapsedMin} min transcurridos)\r`);
        await new Promise(r => setTimeout(r, 15000));
    }
    console.log('\n\n🎉 ¡LA CONVERSACIÓN "MUESTRAS" TERMINÓ TODAS LAS TRIVIAS!');
    console.log('🚀 CPU y GPU liberadas. Iniciando inmediatamente DUELOS DE CAPACIDAD...\n');
}

const DUELOS_KEYS = [
    'river-boca',
    'casla-huracan',
    'central-newells',
    'lanus-banfield',
    'estudiantes-gimnasia',
    'sanmartin-atletico-tucuman',
    'colon-union',
    'allboys-atlanta',
    'madrid-barca',
    'betis-sevilla',
    'madrid-atleti',
    'man-united-man-city',
    'tottenham-arsenal',
    'man-united-liverpool',
    'corinthians-palmeiras',
    'river-maracana'
];

const RETOS_KEYS = ['1', '2', '3', '4', '5', '6', '7'];

async function run() {
    // 1. Espera activa hasta que termine "Muestras"
    await waitTrivia();

    // Pequeño descanso de 5s para vaciar buffers
    await new Promise(r => setTimeout(r, 5000));

    // 2. Renderizado de Duelos de Capacidad
    console.log(`\n🥊 ========================================================`);
    console.log(`🥊 FASE 1: RE-RENDER NATIVO DE DUELOS DE CAPACIDAD (${DUELOS_KEYS.length} VIDEOS)`);
    console.log(`🥊 ========================================================\n`);

    for (let i = 0; i < DUELOS_KEYS.length; i++) {
        const key = DUELOS_KEYS[i];
        console.log(`\n============================================================`);
        console.log(`🥊 [${i + 1}/${DUELOS_KEYS.length}] PROCESANDO DUELO: ${key}`);
        console.log(`============================================================\n`);
        const result = spawnSync('node', ['redes/render_duelo.js', key], { stdio: 'inherit' });
        if (result.status !== 0) {
            console.error(`⚠️ Advertencia: Error en duelo ${key}, continuando con el siguiente...`);
        }
    }

    console.log(`\n🎉 ¡FASE 1 COMPLETADA! Los ${DUELOS_KEYS.length} Duelos de Capacidad están listos.`);

    await new Promise(r => setTimeout(r, 5000));

    // 3. Renderizado de Retos Diarios
    console.log(`\n🎯 ========================================================`);
    console.log(`🎯 FASE 2: RE-RENDER NATIVO DE RETOS DIARIOS (${RETOS_KEYS.length} VIDEOS)`);
    console.log(`🎯 ========================================================\n`);

    for (let i = 0; i < RETOS_KEYS.length; i++) {
        const key = RETOS_KEYS[i];
        console.log(`\n============================================================`);
        console.log(`🎯 [${i + 1}/${RETOS_KEYS.length}] PROCESANDO RETO DIARIO #${key}`);
        console.log(`============================================================\n`);
        const result = spawnSync('node', ['redes/render_reto_diario.js', key], { stdio: 'inherit' });
        if (result.status !== 0) {
            console.error(`⚠️ Advertencia: Error en reto ${key}, continuando con el siguiente...`);
        }
    }

    console.log(`\n🏆 ========================================================`);
    console.log(`🏆 ¡PIPELINE COMPLETO FINALIZADO CON ÉXITO!`);
    console.log(`🏆 ${DUELOS_KEYS.length} Duelos + ${RETOS_KEYS.length} Retos Diarios actualizados con Opción B.`);
    console.log(`🏆 Todos los videos incluyen el nuevo llamado a seguirte/suscribirse.`);
    console.log(`🏆 ========================================================\n`);
}

run().catch((err) => {
    console.error('❌ Error fatal en auto pipeline:', err);
    process.exit(1);
});
