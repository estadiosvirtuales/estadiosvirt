const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ========================================================');
console.log('🚀 RE-RENDERIZADO DE ESTADIOS Y RETOS CON COORDENADAS CORREGIDAS');
console.log('🚀 ========================================================\n');

const startTime = Date.now();

// PASO 1: Re-renderizar las 13 Trivias corregidas
console.log('>>> PASO 1: Procesando 13 Trivias con coordenadas actualizadas...\n');
const resTrivias = spawnSync(process.execPath, ['redes/crear_pack_batch.js', 'corregidos'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

if (resTrivias.status !== 0) {
    console.error('❌ Error en el renderizado de trivias.');
    process.exit(1);
}

// PASO 2: Re-renderizar Retos Diarios #01 y #02
console.log('\n>>> PASO 2: Procesando Retos Diarios #01 y #02 con coordenadas actualizadas...\n');
const resRetos = spawnSync(process.execPath, ['redes/render_reto_diario.js', '1', '2'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

if (resRetos.status !== 0) {
    console.error('❌ Error en el renderizado de Retos Diarios.');
    process.exit(1);
}

const totalMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
console.log(`\n🎉 ========================================================`);
console.log(`🎉 ¡TODO EL LOTE CORREGIDO FINALIZÓ CON ÉXITO EN ${totalMin} MINUTOS!`);
console.log(`🎉 13 Trivias + 2 Retos Diarios 100% actualizados en disco.`);
console.log(`🎉 ========================================================`);
