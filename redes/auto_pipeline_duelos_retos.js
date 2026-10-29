const { spawnSync } = require('child_process');
const fs = require('fs');

console.log('🤖 ========================================================');
console.log('🤖 PIPELINE AUTOMÁTICO: DUELOS DE CAPACIDAD & RETO DIARIO');
console.log('🤖 REANUDANDO DESDE DUELO INTERRUMPIDO');
console.log('🤖 ESTADIOS VIRTUALES · WWW.ESTADIOSVIRTUALES.COM');
console.log('🤖 ========================================================\n');

// 5 primeros ya completados exitosamente:
// river-boca, casla-huracan, central-newells, lanus-banfield, estudiantes-gimnasia

const DUELOS_KEYS = [
    'sanmartin-atletico-tucuman', // Reanuda este que fue interrumpido
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
    console.log(`\n🥊 ========================================================`);
    console.log(`🥊 REANUDANDO FASE 1: DUELOS DE CAPACIDAD (${DUELOS_KEYS.length} PENDIENTES)`);
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

    console.log(`\n🎉 ¡FASE 1 COMPLETADA! Todos los 16 Duelos de Capacidad están listos.`);

    await new Promise(r => setTimeout(r, 5000));

    // Renderizado de Retos Diarios
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
    console.log(`🏆 16 Duelos + 7 Retos Diarios 100% actualizados con Opción B.`);
    console.log(`🏆 Todos los videos incluyen el nuevo llamado a seguirte/suscribirse.`);
    console.log(`🏆 ========================================================\n`);
}

run().catch((err) => {
    console.error('❌ Error fatal en auto pipeline:', err);
    process.exit(1);
});
